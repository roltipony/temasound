import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../lib/api';

export default function UploadScreen() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        setFile(asset);
        if (!title) {
          const name = asset.name.replace(/\.[^.]+$/, '');
          setTitle(name);
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Could not pick file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('No file', 'Please select an audio file first');
      return;
    }
    setUploading(true);
    setProgress(0);
    try {
      await api.uploadSong(
        file.uri,
        { title: title || file.name, artist, album },
        setProgress
      );
      Alert.alert('Success! 🎵', 'Song uploaded to the library');
      setFile(null);
      setTitle('');
      setArtist('');
      setAlbum('');
      setProgress(0);
    } catch (e) {
      Alert.alert('Upload failed', e.message);
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>
        <Text style={styles.title}>Upload Music</Text>
        <Text style={styles.subtitle}>Add songs to the shared library</Text>

        {/* File Picker */}
        <TouchableOpacity style={[styles.dropZone, file && styles.dropZoneActive]} onPress={pickFile}>
          {file ? (
            <View style={styles.fileInfo}>
              <Ionicons name="musical-note" size={28} color="#7c6af7" />
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileSize}>{formatSize(file.size)}</Text>
            </View>
          ) : (
            <View style={styles.dropContent}>
              <Ionicons name="cloud-upload-outline" size={40} color="#444" />
              <Text style={styles.dropText}>Tap to select audio file</Text>
              <Text style={styles.dropHint}>MP3, FLAC, WAV, OGG, M4A, AAC</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Song Info</Text>
          <TextInput
            style={styles.input}
            placeholder="Title *"
            placeholderTextColor="#555"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Artist"
            placeholderTextColor="#555"
            value={artist}
            onChangeText={setArtist}
          />
          <TextInput
            style={styles.input}
            placeholder="Album"
            placeholderTextColor="#555"
            value={album}
            onChangeText={setAlbum}
          />
        </View>

        {/* Progress */}
        {uploading && (
          <View style={styles.progressArea}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
          </View>
        )}

        {/* Upload Button */}
        <TouchableOpacity
          style={[styles.uploadBtn, (!file || uploading) && styles.uploadBtnDisabled]}
          onPress={handleUpload}
          disabled={!file || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.uploadBtnText}>Upload Song</Text>
            </>
          )}
        </TouchableOpacity>

        {file && (
          <TouchableOpacity onPress={() => { setFile(null); setTitle(''); }} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Clear selection</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  title: { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4 },
  subtitle: { color: '#555', fontSize: 14, marginBottom: 24 },
  dropZone: {
    borderWidth: 2, borderColor: '#2a2535', borderStyle: 'dashed',
    borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 24,
    backgroundColor: '#0f0e18',
  },
  dropZoneActive: { borderColor: '#7c6af7', backgroundColor: '#1a1535' },
  dropContent: { alignItems: 'center' },
  dropText: { color: '#aaa', fontSize: 16, marginTop: 12, fontWeight: '600' },
  dropHint: { color: '#444', fontSize: 13, marginTop: 4 },
  fileInfo: { alignItems: 'center', width: '100%' },
  fileName: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  fileSize: { color: '#7c6af7', fontSize: 13, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#aaa', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  input: {
    backgroundColor: '#16141f', borderRadius: 12, padding: 14,
    color: '#fff', fontSize: 16, marginBottom: 10,
    borderWidth: 1, borderColor: '#2a2535'
  },
  progressArea: { marginBottom: 16 },
  progressBar: { height: 6, backgroundColor: '#2a2535', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', backgroundColor: '#7c6af7', borderRadius: 3 },
  progressText: { color: '#7c6af7', fontSize: 13, textAlign: 'right' },
  uploadBtn: {
    backgroundColor: '#7c6af7', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
  },
  uploadBtnDisabled: { opacity: 0.4 },
  uploadBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  clearBtn: { alignItems: 'center', marginTop: 12 },
  clearBtnText: { color: '#555', fontSize: 14 },
});
