import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { usePlayerStore } from '../lib/player';
import { useState, useEffect } from 'react';

const { width } = Dimensions.get('window');

function formatMs(ms) {
  if (!ms) return '0:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

export default function PlayerScreen() {
  const {
    currentSong, isPlaying, isLoading,
    position, duration,
    togglePlayPause, playNext, playPrev, seek
  } = usePlayerStore();

  const [seeking, setSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const progress = duration > 0 ? position / duration : 0;

  if (!currentSong) {
    return (
      <View style={styles.empty}>
        <Ionicons name="musical-notes-outline" size={64} color="#333" />
        <Text style={styles.emptyText}>Nothing playing</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSeekStart = () => {
    setSeeking(true);
    setSeekValue(position);
  };

  const handleSeekEnd = async (val) => {
    setSeeking(false);
    await seek(val);
  };

  return (
    <LinearGradient colors={['#1a1535', '#0a0a0f', '#0a0a0f']} style={styles.container}>
      <SafeAreaView style={styles.inner} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="chevron-down" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>Now Playing</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Album art placeholder */}
        <View style={styles.artContainer}>
          <View style={styles.art}>
            <Ionicons name="musical-notes" size={80} color="#7c6af7" />
          </View>
        </View>

        {/* Song info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={2}>{currentSong.title}</Text>
          <Text style={styles.songArtist}>{currentSong.artist || 'Unknown Artist'}</Text>
          {currentSong.album && currentSong.album !== 'Unknown' && (
            <Text style={styles.songAlbum}>{currentSong.album}</Text>
          )}
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <TouchableOpacity
            style={styles.progressBarWrapper}
            onPress={(e) => {
              const { locationX, target } = e.nativeEvent;
              // Simple tap-to-seek
              const barWidth = width - 48;
              const ratio = Math.max(0, Math.min(1, locationX / barWidth));
              seek(ratio * duration);
            }}
            activeOpacity={1}
          >
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              <View style={[styles.progressThumb, { left: `${progress * 100}%` }]} />
            </View>
          </TouchableOpacity>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatMs(position)}</Text>
            <Text style={styles.timeText}>{formatMs(duration)}</Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity onPress={playPrev} style={styles.controlBtn}>
            <Ionicons name="play-skip-back" size={28} color="#aaa" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={togglePlayPause}
            style={styles.playBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Ionicons name="hourglass-outline" size={32} color="#fff" />
            ) : (
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={32} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={playNext} style={styles.controlBtn}>
            <Ionicons name="play-skip-forward" size={28} color="#aaa" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24 },
  empty: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#444', fontSize: 18, marginTop: 16, marginBottom: 24 },
  backBtn: { backgroundColor: '#7c6af7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  backBtnText: { color: '#fff', fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerLabel: { color: '#aaa', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  artContainer: { alignItems: 'center', marginVertical: 32 },
  art: {
    width: width - 80, height: width - 80, borderRadius: 24,
    backgroundColor: '#1e1a35', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7c6af7', shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  songInfo: { marginBottom: 32 },
  songTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  songArtist: { color: '#aaa', fontSize: 17, fontWeight: '500' },
  songAlbum: { color: '#555', fontSize: 14, marginTop: 2 },
  progressContainer: { marginBottom: 32 },
  progressBarWrapper: { paddingVertical: 10 },
  progressBg: { height: 4, backgroundColor: '#2a2535', borderRadius: 2, position: 'relative' },
  progressFill: { height: '100%', backgroundColor: '#7c6af7', borderRadius: 2 },
  progressThumb: {
    position: 'absolute', top: -6, width: 16, height: 16,
    borderRadius: 8, backgroundColor: '#7c6af7', marginLeft: -8
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  timeText: { color: '#555', fontSize: 13 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32 },
  controlBtn: { padding: 8 },
  playBtn: {
    width: 72, height: 72, borderRadius: 22, backgroundColor: '#7c6af7',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#7c6af7', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }
  },
});
