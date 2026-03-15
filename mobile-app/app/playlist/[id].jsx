import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Modal, FlatList as FL
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { api } from '../../lib/api';
import { usePlayerStore } from '../../lib/player';
import SongItem from '../../components/SongItem';

export default function PlaylistDetail() {
  const { id } = useLocalSearchParams();
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { playSong } = usePlayerStore();

  useEffect(() => {
    fetchSongs();
  }, [id]);

  const fetchSongs = async () => {
    try {
      const data = await api.getPlaylistSongs(id);
      setSongs(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const openAddSongs = async () => {
    const data = await api.getSongs();
    const existingIds = new Set(songs.map(s => s.id));
    setAllSongs(data.filter(s => !existingIds.has(s.id)));
    setShowAddModal(true);
  };

  const addSong = async (song) => {
    await api.addToPlaylist(id, song.id);
    setSongs(prev => [...prev, song]);
    setAllSongs(prev => prev.filter(s => s.id !== song.id));
  };

  const removeSong = async (song) => {
    await api.removeFromPlaylist(id, song.id);
    setSongs(prev => prev.filter(s => s.id !== song.id));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#7c6af7" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Playlist</Text>
        <TouchableOpacity onPress={openAddSongs} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {songs.length > 0 && (
        <TouchableOpacity
          style={styles.playAllBtn}
          onPress={() => playSong(songs[0], songs, 0)}
        >
          <Ionicons name="play" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.playAllText}>Play All ({songs.length})</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={songs}
        keyExtractor={item => String(item.id)}
        renderItem={({ item, index }) => (
          <SongItem
            song={item}
            onPress={() => playSong(item, songs, index)}
            onDelete={() => removeSong(item)}
            deleteIcon="remove-circle-outline"
          />
        )}
        contentContainerStyle={{ paddingBottom: 140 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={48} color="#333" />
            <Text style={styles.emptyText}>No songs in this playlist</Text>
            <TouchableOpacity style={styles.addSongsBtn} onPress={openAddSongs}>
              <Text style={styles.addSongsBtnText}>Add songs</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Add Songs Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Songs</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={22} color="#aaa" />
              </TouchableOpacity>
            </View>
            <FL
              data={allSongs}
              keyExtractor={item => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.addSongRow} onPress={() => addSong(item)}>
                  <View style={styles.songDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addSongTitle}>{item.title}</Text>
                    <Text style={styles.addSongArtist}>{item.artist}</Text>
                  </View>
                  <Ionicons name="add-circle-outline" size={22} color="#7c6af7" />
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
              ListEmptyComponent={<Text style={styles.noMoreText}>All songs already added</Text>}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 },
  backBtn: { padding: 8 },
  title: { flex: 1, fontSize: 20, fontWeight: '700', color: '#fff', textAlign: 'center' },
  addBtn: { backgroundColor: '#7c6af7', width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  playAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7c6af7', marginHorizontal: 20, marginBottom: 12, paddingVertical: 10, borderRadius: 12 },
  playAllText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#444', fontSize: 16, marginTop: 12, marginBottom: 16 },
  addSongsBtn: { backgroundColor: '#7c6af7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  addSongsBtnText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#16141f', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1, borderColor: '#2a2535' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  addSongRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1824' },
  songDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7c6af7', marginRight: 12 },
  addSongTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  addSongArtist: { color: '#555', fontSize: 12, marginTop: 2 },
  noMoreText: { textAlign: 'center', color: '#444', padding: 20 },
});
