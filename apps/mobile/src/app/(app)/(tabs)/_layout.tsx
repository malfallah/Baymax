import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '@/components/navigation/TabBar';
import { useLayout } from '@/hooks/useLayout';

export default function TabsLayout() {
  const { isWide } = useLayout();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarPosition: isWide ? 'left' : 'bottom',
        animation: 'fade',
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="care" options={{ title: 'Appointments' }} />
      <Tabs.Screen name="check" options={{ title: 'Symptoms' }} />
      <Tabs.Screen name="pharmacy" options={{ title: 'Pharmacy' }} />
      <Tabs.Screen name="availability" options={{ title: 'Availability' }} />
      <Tabs.Screen name="community" options={{ title: 'Community' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
