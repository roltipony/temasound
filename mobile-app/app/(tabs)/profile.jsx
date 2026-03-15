import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../lib/api';
import { usePlayerStore } from '../../lib/player';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { stopCurrentSound } = usePlayerStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await stopCurrentSound();
          await logout();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.username?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.username}>{user?.username}</Text>
        {user?.role === 'admin' && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={20} color="#7c6af7" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Username</Text>
            <Text style={styles.menuItemValue}>{user?.username}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="shield-outline" size={20} color="#7c6af7" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Role</Text>
            <Text style={styles.menuItemValue}>{user?.role}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>App</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={20} color="#7c6af7" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Server Settings</Text>
            <Ionicons name="chevron-forward" size={16} color="#444" />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <Ionicons name="information-circle-outline" size={20} color="#7c6af7" style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Version</Text>
            <Text style={styles.menuItemValue}>1.0.0</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ff4d6d" style={{ marginRight: 8 }} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  avatarSection: { alignItems: 'center', paddingVertical: 28 },
  avatar: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#7c6af7',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    shadowColor: '#7c6af7', shadowOpacity: 0.4, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }
  },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '700' },
  username: { color: '#fff', fontSize: 20, fontWeight: '700' },
  adminBadge: { backgroundColor: '#7c6af720', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  adminBadgeText: { color: '#7c6af7', fontSize: 12, fontWeight: '600' },
  menu: { flex: 1, paddingHorizontal: 16 },
  menuSection: { marginBottom: 24 },
  menuSectionTitle: { color: '#444', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingHorizontal: 4 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#16141f',
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, marginBottom: 2
  },
  menuIcon: { marginRight: 14 },
  menuItemText: { flex: 1, color: '#ddd', fontSize: 15 },
  menuItemValue: { color: '#555', fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginBottom: 32, padding: 14, borderRadius: 14,
    backgroundColor: '#ff4d6d15', borderWidth: 1, borderColor: '#ff4d6d30'
  },
  logoutText: { color: '#ff4d6d', fontSize: 16, fontWeight: '600' },
});
