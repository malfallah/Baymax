import { Redirect } from 'expo-router';
import { useAuth } from '@/stores/auth';

export default function Index() {
  const signedIn = useAuth((s) => !!s.token);
  return <Redirect href={signedIn ? '/home' : '/welcome'} />;
}
