import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/stores/auth';

export default function AuthLayout() {
  const signedIn = useAuth((s) => !!s.token);
  if (signedIn) return <Redirect href="/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
