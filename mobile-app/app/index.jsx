import { Redirect } from 'expo-router';
import { useAuthStore } from '../../lib/api';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0f' }}>
        <ActivityIndicator color="#7c6af7" size="large" />
      </View>
    );
  }

  if (user) return <Redirect href="/(tabs)/library" />;
  return <Redirect href="/(auth)/login" />;
}
