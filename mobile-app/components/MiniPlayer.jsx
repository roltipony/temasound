import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayerStore } from '../lib/player';
import { router } from 'expo-router';

export default function MiniPlayer() {
  const { currentSong, isPlaying, isLoading, togglePlayPause, playNext, isVisible } = usePlayerStore();

  if (!currentSong || !isVisible) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={() => router.push('/player')} activeOpacity={0.9}>
      <View style={styles.songInfo}>
        <View style={styles.iconBox}>
          <Ionicons name="musical-note" size={16} color="#7c6af7" />
        </View>
        <View style={styles.textArea}>
          <Text style={styles.title} numberOfLines={1}>{currentSong.title}</Text>
          <Text style={styles.artist} numberOfLines={1}>{currentSong.artist || 'Unknown'}</Text>
        </View>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); togglePlayPause(); }}
          style={styles.controlBtn}
        >
          {isLoading ? (
            <Ionicons name="hourglass-outline" size={22} color="#fff" />
          ) : (
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={22} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(e) => { e.stopPropagation(); playNext(); }}
          style={styles.controlBtn}
        >
          <Ionicons name="play-skip-forward" size={20} color="#aaa" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 60,
    left: 8,
    right: 8,
    backgroundColor: '#1e1b2e',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2a2535',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  songInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  iconBox: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#2a1f55', justifyContent: 'center',
    alignItems: 'center', marginRight: 10
  },
  textArea: { flex: 1 },
  title: { color: '#fff', fontSize: 14, fontWeight: '600' },
  artist: { color: '#666', fontSize: 12, marginTop: 1 },
  controls: { flexDirection: 'row', alignItems: 'center' },
  controlBtn: { padding: 6, marginLeft: 4 },
});
