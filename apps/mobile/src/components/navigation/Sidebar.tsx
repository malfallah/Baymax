import { router, usePathname } from 'expo-router';
import { Platform, Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IS_DEMO } from '@/lib/config';
import { useAuth } from '@/stores/auth';
import { cartCount, useCart } from '@/stores/cart';
import { useTheme } from '@/theme/ThemeProvider';
import { Avatar, Badge, Icon, Logo, Text } from '../ui';
import { TABS } from './tabs';

/** Which sidebar section owns each top-level path segment. */
const SECTION_FOR: Record<string, string> = {
  appointments: 'care',
  doctors: 'care',
  products: 'pharmacy',
  cart: 'pharmacy',
  checkout: 'pharmacy',
  orders: 'pharmacy',
  articles: 'community',
  questions: 'community',
};

/** Persistent navigation for tablets and desktop browsers, shown on every signed-in screen. */
export function Sidebar() {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const user = useAuth((s) => s.user);
  const items = useCart((s) => cartCount(s.lines));
  if (!user) return null;

  const tabs = TABS[user.role];
  const segment = pathname.split('/').filter(Boolean)[0] ?? 'home';
  const activeName = SECTION_FOR[segment] ?? segment;
  const go = (name: string) => router.navigate(`/${name}` as never);

  return (
    <View
      style={{
        width: 264,
        paddingTop: insets.top + 28,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 16,
        backgroundColor: colors.surface,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        gap: 4,
      }}
    >
      <View style={{ paddingHorizontal: 10, marginBottom: 28 }}>
        <Logo size={34} />
      </View>
      {tabs.map((tab) => {
        const active = tab.name === activeName;
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.title}
            onPress={() => go(tab.name)}
            style={({ hovered }: { pressed: boolean; hovered?: boolean }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                height: 46,
                paddingHorizontal: 12,
                borderRadius: radius.md,
                backgroundColor: active
                  ? colors.primarySoft
                  : hovered
                    ? colors.surfaceMuted
                    : 'transparent',
              },
              Platform.OS === 'web' &&
                ({ cursor: 'pointer', transitionDuration: '120ms' } as ViewStyle),
            ]}
          >
            <Icon
              name={active ? tab.activeIcon : tab.icon}
              size={22}
              color={active ? colors.primary : colors.textMuted}
            />
            <Text
              variant="bodyMedium"
              color={active ? colors.primary : colors.textMuted}
              style={{ flex: 1 }}
            >
              {tab.title}
            </Text>
            {tab.name === 'pharmacy' && items > 0 ? (
              <Badge tone="accent" label={String(items)} />
            ) : null}
          </Pressable>
        );
      })}
      <View style={{ flex: 1 }} />
      {IS_DEMO ? (
        <View
          style={{
            backgroundColor: colors.surfaceMuted,
            borderRadius: radius.lg,
            padding: 14,
            gap: 4,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="flask-outline" size={16} color={colors.primary} />
            <Text variant="caption" tone="primary">
              Demo mode
            </Text>
          </View>
          <Text variant="caption" tone="muted">
            Data is stored in this browser only.
          </Text>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open profile"
        onPress={() => go('profile')}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 10,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
          },
          Platform.OS === 'web' && ({ cursor: 'pointer' } as ViewStyle),
        ]}
      >
        <Avatar name={user.fullName} color={user.avatarColor} size={36} />
        <View style={{ flex: 1 }}>
          <Text variant="callout" numberOfLines={1}>
            {user.fullName}
          </Text>
          <Text variant="caption" tone="subtle" numberOfLines={1}>
            {user.role === 'doctor' ? 'Doctor account' : 'Patient account'}
          </Text>
        </View>
        <Icon name="chevron-right" size={18} color={colors.textSubtle} />
      </Pressable>
    </View>
  );
}
