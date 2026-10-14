import { Redirect, Stack } from 'expo-router';
import { View } from 'react-native';
import { Sidebar } from '@/components/navigation/Sidebar';
import { useLayout } from '@/hooks/useLayout';
import { useAuth } from '@/stores/auth';

export default function AppLayout() {
  const signedIn = useAuth((s) => !!s.token);
  const { isWide } = useLayout();
  if (!signedIn) return <Redirect href="/welcome" />;

  const stack = <Stack screenOptions={{ headerShown: false }} />;
  if (!isWide) return stack;
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <Sidebar />
      <View style={{ flex: 1 }}>{stack}</View>
    </View>
  );
}
