const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'temasound-secret-change-in-production';
const MUSIC_DIR = process.env.MUSIC_DIR || path.join(__dirname, 'music');
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'temasound.db');

// Ensure music dir exists
if (!fs.existsSync(MUSIC_DIR)) fs.mkdirSync(MUSIC_DIR, { recursive: true });

// Database setup
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT DEFAULT 'Unknown',
    album TEXT DEFAULT 'Unknown',
    duration INTEGER DEFAULT 0,
    filename TEXT UNIQUE NOT NULL,
    file_size INTEGER DEFAULT 0,
    uploaded_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uploaded_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS playlists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS playlist_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    playlist_id INTEGER NOT NULL,
    song_id INTEGER NOT NULL,
    position INTEGER DEFAULT 0,
    FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
    FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE
  );
`);

// Middleware
app.use(cors());
app.use(express.json());

// Multer config for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MUSIC_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp3', '.flac', '.wav', '.ogg', '.m4a', '.aac'];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB
});

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function adminAuth(req, res, next) {
  auth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    next();
  });
}

// ── AUTH ROUTES ──────────────────────────────────────────────────
app.post('/api/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  const hashed = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const result = stmt.run(username, hashed);
    const token = jwt.sign({ id: result.lastInsertRowid, username, role: 'user' }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ token, user: { id: result.lastInsertRowid, username, role: 'user' } });
  } catch {
    res.status(409).json({ error: 'Username already exists' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// ── SONGS ROUTES ─────────────────────────────────────────────────
app.get('/api/songs', auth, (req, res) => {
  const songs = db.prepare(`
    SELECT s.*, u.username as uploaded_by_name
    FROM songs s LEFT JOIN users u ON s.uploaded_by = u.id
    ORDER BY s.created_at DESC
  `).all();
  res.json(songs);
});

app.get('/api/songs/search', auth, (req, res) => {
  const { q } = req.query;
  const songs = db.prepare(`
    SELECT * FROM songs
    WHERE title LIKE ? OR artist LIKE ? OR album LIKE ?
    ORDER BY title
  `).all(`%${q}%`, `%${q}%`, `%${q}%`);
  res.json(songs);
});

app.post('/api/songs/upload', auth, upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { title, artist, album, duration } = req.body;
  const stmt = db.prepare(`
    INSERT INTO songs (title, artist, album, duration, filename, file_size, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    title || path.parse(req.file.originalname).name,
    artist || 'Unknown',
    album || 'Unknown',
    parseInt(duration) || 0,
    req.file.filename,
    req.file.size,
    req.user.id
  );
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(result.lastInsertRowid);
  res.json(song);
});

app.delete('/api/songs/:id', auth, (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });
  if (song.uploaded_by !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }
  try { fs.unlinkSync(path.join(MUSIC_DIR, song.filename)); } catch {}
  db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── STREAM ROUTE ─────────────────────────────────────────────────
app.get('/api/stream/:id', auth, (req, res) => {
  const song = db.prepare('SELECT * FROM songs WHERE id = ?').get(req.params.id);
  if (!song) return res.status(404).json({ error: 'Song not found' });

  const filePath = path.join(MUSIC_DIR, song.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(song.filename).toLowerCase();
  const mimeTypes = {
    '.mp3': 'audio/mpeg', '.flac': 'audio/flac', '.wav': 'audio/wav',
    '.ogg': 'audio/ogg', '.m4a': 'audio/mp4', '.aac': 'audio/aac'
  };
  const contentType = mimeTypes[ext] || 'audio/mpeg';

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    });
    fs.createReadStream(filePath, { start, end }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// ── PLAYLISTS ROUTES ─────────────────────────────────────────────
app.get('/api/playlists', auth, (req, res) => {
  const playlists = db.prepare(`
    SELECT p.*, COUNT(ps.id) as song_count
    FROM playlists p
    LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
    WHERE p.user_id = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all(req.user.id);
  res.json(playlists);
});

app.post('/api/playlists', auth, (req, res) => {
  const { name, is_public } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  const result = db.prepare('INSERT INTO playlists (name, user_id, is_public) VALUES (?, ?, ?)').run(name, req.user.id, is_public ? 1 : 0);
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(result.lastInsertRowid);
  res.json(playlist);
});

app.get('/api/playlists/:id/songs', auth, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!playlist) return res.status(404).json({ error: 'Not found' });
  if (playlist.user_id !== req.user.id && !playlist.is_public) return res.status(403).json({ error: 'Private playlist' });
  const songs = db.prepare(`
    SELECT s.*, ps.position FROM songs s
    JOIN playlist_songs ps ON s.id = ps.song_id
    WHERE ps.playlist_id = ?
    ORDER BY ps.position
  `).all(req.params.id);
  res.json(songs);
});

app.post('/api/playlists/:id/songs', auth, (req, res) => {
  const { song_id } = req.body;
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found or not yours' });
  const maxPos = db.prepare('SELECT MAX(position) as m FROM playlist_songs WHERE playlist_id = ?').get(req.params.id);
  const position = (maxPos.m || 0) + 1;
  db.prepare('INSERT OR IGNORE INTO playlist_songs (playlist_id, song_id, position) VALUES (?, ?, ?)').run(req.params.id, song_id, position);
  res.json({ success: true });
});

app.delete('/api/playlists/:id/songs/:songId', auth, (req, res) => {
  const playlist = db.prepare('SELECT * FROM playlists WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!playlist) return res.status(403).json({ error: 'Not authorized' });
  db.prepare('DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?').run(req.params.id, req.params.songId);
  res.json({ success: true });
});

app.delete('/api/playlists/:id', auth, (req, res) => {
  db.prepare('DELETE FROM playlists WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// ── ADMIN ────────────────────────────────────────────────────────
app.get('/api/admin/users', adminAuth, (req, res) => {
  const users = db.prepare('SELECT id, username, role, created_at FROM users').all();
  res.json(users);
});

app.patch('/api/admin/users/:id/role', adminAuth, (req, res) => {
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(req.body.role, req.params.id);
  res.json({ success: true });
});

// Create first admin if no users exist
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (userCount.c === 0) {
  const hashed = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hashed, 'admin');
  console.log('✅ Default admin created: admin / admin123 — CHANGE THIS PASSWORD!');
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 TemaSound server running on port ${PORT}`);
  console.log(`📁 Music directory: ${MUSIC_DIR}`);
});
