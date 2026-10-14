import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/hooks/useLayout';
import { IS_DEMO } from '@/lib/config';
import { useAuth } from '@/stores/auth';
import { cartCount, useCart } from '@/stores/cart';
import { useTheme } from '@/theme/ThemeProvider';
import { Avatar, Badge, Icon, Logo, Text } from '../ui';
import { TABS } from './tabs';

/**
 * Adaptive navigation: a floating bottom bar on phones and a full sidebar
 * on tablets and desktop browsers.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();
  const user = useAuth((s) => s.user);
  const items = useCart((s) => cartCount(s.lines));
  if (!user) return null;

  const tabs = TABS[user.role].filter((t) => isWide || !t.wideOnly);
  const activeName = state.routes[state.index]?.name;

  const go = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (activeName !== name && !event.defaultPrevented) navigation.navigate(name);
  };

  if (isWide) {
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

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 8,
        paddingHorizontal: 6,
      }}
    >
      {tabs.map((tab) => {
        const active = tab.name === activeName;
        return (
          <Pressable
            key={tab.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.title}
            onPress={() => go(tab.name)}
            style={[
              { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 },
              Platform.OS === 'web' && ({ cursor: 'pointer' } as ViewStyle),
            ]}
          >
            <View
              style={{
                width: 56,
                height: 30,
                borderRadius: 15,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? colors.primarySoft : 'transparent',
              }}
            >
              <Icon
                name={active ? tab.activeIcon : tab.icon}
                size={22}
                color={active ? colors.primary : colors.textSubtle}
              />
              {tab.name === 'pharmacy' && items > 0 ? (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 10,
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    paddingHorizontal: 3,
                    backgroundColor: colors.accent,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 10,
                      lineHeight: 12,
                      fontFamily: 'Inter_700Bold',
                    }}
                  >
                    {items > 9 ? '9+' : items}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              variant="caption"
              color={active ? colors.primary : colors.textSubtle}
              style={{ fontSize: 11, lineHeight: 14 }}
              numberOfLines={1}
            >
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
