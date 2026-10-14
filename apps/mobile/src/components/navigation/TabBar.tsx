import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, Pressable, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/hooks/useLayout';
import { useAuth } from '@/stores/auth';
import { cartCount, useCart } from '@/stores/cart';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, Text } from '../ui';
import { TABS } from './tabs';

/**
 * Bottom tab bar for phones. On tablets and desktop the (app) layout renders
 * a persistent <Sidebar /> instead, so navigation stays visible on every screen.
 */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
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

  // Wide layouts use the persistent <Sidebar /> rendered by the (app) layout.
  if (isWide) return null;

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
