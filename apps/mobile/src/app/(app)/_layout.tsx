import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/stores/auth';

export default function AppLayout() {
  const signedIn = useAuth((s) => !!s.token);
  if (!signedIn) return <Redirect href="/welcome" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
