import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, RefreshControl, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/api';
import { usePlayerStore } from '../../lib/player';
import { useAuthStore } from '../../lib/api';
import SongItem from '../../components/SongItem';

export default function LibraryScreen() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const { playSong } = usePlayerStore();
  const { user } = useAuthStore();

  const fetchSongs = async () => {
    try {
      const data = search.trim()
        ? await api.searchSongs(search)
        : await api.getSongs();
      setSongs(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSongs();
  };

  const handlePlay = (song, index) => {
    playSong(song, songs, index);
  };

  const handleDelete = async (song) => {
    Alert.alert('Delete Song', `Remove "${song.title}" from the library?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await api.deleteSong(song.id);
            setSongs(prev => prev.filter(s => s.id !== song.id));
          } catch (e) {
            Alert.alert('Error', e.message);
          }
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
        <Text style={styles.title}>Library</Text>
        <Text style={styles.subtitle}>{songs.length} songs</Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#555" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs, artists..."
          placeholderTextColor="#555"
          value={search}
          onChangeText={setSearch}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#555" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <SongItem
            song={item}
            onPress={() => handlePlay(item, index)}
            onDelete={user?.role === 'admin' || item.uploaded_by === user?.id ? () => handleDelete(item) : null}
          />
        )}
        contentContainerStyle={{ paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7c6af7" />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="musical-notes-outline" size={48} color="#333" />
            <Text style={styles.emptyText}>{search ? 'No results' : 'No songs yet'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  subtitle: { color: '#555', fontSize: 13, marginTop: 2 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16141f', marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#2a2535'
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 15 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#444', fontSize: 16, marginTop: 12 },
});
