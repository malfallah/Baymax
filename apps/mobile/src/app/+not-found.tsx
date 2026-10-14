import { router } from 'expo-router';
import { EmptyState, Screen } from '@/components/ui';

export default function NotFound() {
  return (
    <Screen>
      <EmptyState
        icon="map-marker-question-outline"
        title="Page not found"
        message="The page you are looking for doesn't exist or has moved."
        actionLabel="Go home"
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}
