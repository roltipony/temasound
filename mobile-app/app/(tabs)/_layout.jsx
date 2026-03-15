import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import MiniPlayer from '../../components/MiniPlayer';

function TabBarIcon({ name, color, size }) {
  return <Ionicons name={name} color={color} size={size} />;
}

export default function TabsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#12101f',
            borderTopColor: '#2a2535',
            borderTopWidth: 1,
            paddingBottom: 4,
            height: 60,
          },
          tabBarActiveTintColor: '#7c6af7',
          tabBarInactiveTintColor: '#555',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, size }) => <TabBarIcon name="musical-notes" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="playlists"
          options={{
            title: 'Playlists',
            tabBarIcon: ({ color, size }) => <TabBarIcon name="list" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="upload"
          options={{
            title: 'Upload',
            tabBarIcon: ({ color, size }) => <TabBarIcon name="cloud-upload" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => <TabBarIcon name="person" color={color} size={size} />,
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
