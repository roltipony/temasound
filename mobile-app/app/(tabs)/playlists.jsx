import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Alert, TextInput, Modal, ActivityIndicator, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '../../lib/api';

export default function PlaylistsScreen() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');

  const fetchPlaylists = async () => {
    try {
      const data = await api.getPlaylists();
      setPlaylists(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPlaylists(); }, []);

  const createPlaylist = async () => {
    if (!newName.trim()) return;
    try {
      const p = await api.createPlaylist(newName.trim());
      setPlaylists(prev => [p, ...prev]);
      setShowModal(false);
      setNewName('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const deletePlaylist = (playlist) => {
    Alert.alert('Delete Playlist', `Delete "${playlist.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await api.deletePlaylist(playlist.id);
          setPlaylists(prev => prev.filter(p => p.id !== playlist.id));
        }
      }
    ]);
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
        <Text style={styles.title}>Playlists</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={playlists}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.playlistRow}
            onPress={() => router.push(`/playlist/${item.id}`)}
          >
            <View style={styles.playlistIcon}>
              <Ionicons name="musical-notes" size={20} color="#7c6af7" />
            </View>
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistName}>{item.name}</Text>
              <Text style={styles.playlistMeta}>{item.song_count} songs</Text>
            </View>
            <TouchableOpacity onPress={() => deletePlaylist(item)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color="#444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchPlaylists(); }} tintColor="#7c6af7" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="list-outline" size={48} color="#333" />
            <Text style={styles.emptyText}>No playlists yet</Text>
            <TouchableOpacity style={styles.createBtn} onPress={() => setShowModal(true)}>
              <Text style={styles.createBtnText}>Create your first playlist</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Create Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Playlist</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Playlist name"
              placeholderTextColor="#555"
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setShowModal(false); setNewName(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalCreate} onPress={createPlaylist}>
                <Text style={styles.modalCreateText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  addBtn: { backgroundColor: '#7c6af7', width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  playlistRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1a1824' },
  playlistIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#1a1535', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  playlistInfo: { flex: 1 },
  playlistName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  playlistMeta: { color: '#555', fontSize: 13, marginTop: 2 },
  deleteBtn: { padding: 8 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#444', fontSize: 16, marginTop: 12, marginBottom: 20 },
  createBtn: { backgroundColor: '#7c6af7', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  createBtnText: { color: '#fff', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#16141f', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: '#2a2535' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 16 },
  modalInput: { backgroundColor: '#0f0e18', borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#2a2535', marginBottom: 16 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#2a2535', alignItems: 'center' },
  modalCancelText: { color: '#aaa', fontWeight: '600' },
  modalCreate: { flex: 1, backgroundColor: '#7c6af7', padding: 14, borderRadius: 12, alignItems: 'center' },
  modalCreateText: { color: '#fff', fontWeight: '700' },
});
