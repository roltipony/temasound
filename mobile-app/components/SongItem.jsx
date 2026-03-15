import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../lib/player';

function formatDuration(ms) {
  if (!ms) return '';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export default function SongItem({ song, onPress, onDelete, deleteIcon = 'trash-outline' }) {
  const { currentSong, isPlaying } = usePlayerStore();
  const isActive = currentSong?.id === song.id;

  return (
    <TouchableOpacity style={[styles.row, isActive && styles.rowActive]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconBox, isActive && styles.iconBoxActive]}>
        {isActive && isPlaying ? (
          <Ionicons name="musical-notes" size={16} color="#7c6af7" />
        ) : (
          <Ionicons name="musical-note" size={16} color={isActive ? '#7c6af7' : '#444'} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.title, isActive && styles.titleActive]} numberOfLines={1}>{song.title}</Text>
        <Text style={styles.meta} numberOfLines={1}>{song.artist || 'Unknown'}{song.album && song.album !== 'Unknown' ? ` · ${song.album}` : ''}</Text>
      </View>
      {song.duration ? <Text style={styles.duration}>{formatDuration(song.duration)}</Text> : null}
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={deleteIcon} size={18} color="#555" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1a1824'
  },
  rowActive: { backgroundColor: '#1a1535' },
  iconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#16141f', justifyContent: 'center',
    alignItems: 'center', marginRight: 12
  },
  iconBoxActive: { backgroundColor: '#2a1f55' },
  info: { flex: 1, marginRight: 8 },
  title: { color: '#ddd', fontSize: 15, fontWeight: '500' },
  titleActive: { color: '#7c6af7', fontWeight: '700' },
  meta: { color: '#555', fontSize: 13, marginTop: 2 },
  duration: { color: '#444', fontSize: 13, marginRight: 8 },
  deleteBtn: { padding: 4 },
});
