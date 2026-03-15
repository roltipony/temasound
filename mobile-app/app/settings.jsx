import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const [serverUrl, setServerUrl] = useState('http://192.168.1.100:3000');

  const save = async () => {
    const url = serverUrl.trim().replace(/\/$/, '');
    if (!url.startsWith('http')) {
      Alert.alert('Error', 'URL must start with http:// or https://');
      return;
    }
    // NOTE: In a real app, SERVER_URL would be read from AsyncStorage at startup
    // For now this saves it so user can reference it
    await AsyncStorage.setItem('serverUrl', url);
    Alert.alert('Saved', 'Server URL saved. Restart the app to apply changes.\n\nEdit lib/api.js SERVER_URL to make it permanent.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Server Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.x.x:3000"
          placeholderTextColor="#444"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <Text style={styles.hint}>
          Enter your Mac Mini's local IP address.{'\n'}
          Find it in: System Settings → Network → Wi-Fi → Details
        </Text>

        <TouchableOpacity style={styles.btn} onPress={save}>
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
  back: { padding: 8 },
  title: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 18, fontWeight: '700' },
  body: { padding: 24 },
  label: { color: '#aaa', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  input: {
    backgroundColor: '#16141f', borderRadius: 12, padding: 14,
    color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#2a2535', marginBottom: 10
  },
  hint: { color: '#444', fontSize: 13, lineHeight: 20, marginBottom: 24 },
  btn: { backgroundColor: '#7c6af7', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
