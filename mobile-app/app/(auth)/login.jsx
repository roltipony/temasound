import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../lib/api';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const { login, register } = useAuthStore();

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password);
      }
      router.replace('/(tabs)/library');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0a0a0f', '#12101f', '#0a0a0f']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🎵</Text>
          </View>
          <Text style={styles.logoText}>TemaSound</Text>
          <Text style={styles.tagline}>Your music, anywhere on your network</Text>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{mode === 'login' ? 'Welcome back' : 'Create account'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#555"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            <Text style={styles.switchText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.switchLink}>{mode === 'login' ? 'Register' : 'Sign In'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoIcon: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#7c6af7', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
    shadowColor: '#7c6af7', shadowOpacity: 0.5, shadowRadius: 20, shadowOffset: { width: 0, height: 4 }
  },
  logoEmoji: { fontSize: 32 },
  logoText: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tagline: { color: '#666', fontSize: 14, marginTop: 4 },
  card: {
    backgroundColor: '#16141f', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#2a2535'
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 20 },
  input: {
    backgroundColor: '#0f0e18', borderRadius: 12, padding: 16,
    color: '#fff', fontSize: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#2a2535'
  },
  button: {
    backgroundColor: '#7c6af7', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 4, marginBottom: 16
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  switchText: { textAlign: 'center', color: '#666', fontSize: 14 },
  switchLink: { color: '#7c6af7', fontWeight: '600' },
});
