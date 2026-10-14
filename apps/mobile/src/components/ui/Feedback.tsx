import { useEffect, useState } from 'react';
import { Animated, Modal, Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from './Button';
import { Icon } from './Icon';
import { Text } from './Text';

/* ------------------------------------------------------------ toasts */

type ToastTone = 'success' | 'error' | 'info';
interface ToastState {
  toast: { id: number; message: string; tone: ToastTone } | null;
  show: (message: string, tone?: ToastTone) => void;
  hide: () => void;
}

const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (message, tone = 'success') => set({ toast: { id: Date.now(), message, tone } }),
  hide: () => set({ toast: null }),
}));

export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  info: (message: string) => useToastStore.getState().show(message, 'info'),
};

export function ToastHost() {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const current = useToastStore((s) => s.toast);
  const hide = useToastStore((s) => s.hide);
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!current) return;
    anim.setValue(0);
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      friction: 8,
    }).start();
    const t = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: Platform.OS !== 'web',
      }).start(() => hide());
    }, 2800);
    return () => clearTimeout(t);
  }, [current, anim, hide]);

  if (!current) return null;
  const icon =
    current.tone === 'success'
      ? 'check-circle'
      : current.tone === 'error'
        ? 'alert-circle'
        : 'information';
  const tint =
    current.tone === 'success'
      ? colors.success
      : current.tone === 'error'
        ? colors.danger
        : colors.primary;

  return (
    <Animated.View
      pointerEvents="box-none"
      accessibilityLiveRegion="polite"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: insets.top + 12,
        alignItems: 'center',
        zIndex: 1000,
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
        ],
      }}
    >
      <Pressable
        onPress={hide}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          maxWidth: 440,
          marginHorizontal: 16,
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: radius.lg,
          backgroundColor: colors.elevated,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <Icon name={icon} size={20} color={tint} />
        <Text variant="bodyMedium" style={{ flexShrink: 1 }}>
          {current.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

/* ------------------------------------------------------------ confirm dialog */

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmState {
  options: (ConfirmOptions & { resolve: (ok: boolean) => void }) | null;
}

const useConfirmStore = create<ConfirmState>(() => ({ options: null }));

/** Cross-platform confirmation dialog (Alert.alert has no buttons on the web). */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => useConfirmStore.setState({ options: { ...options, resolve } }));
}

export function ConfirmHost() {
  const { colors, radius } = useTheme();
  const options = useConfirmStore((s) => s.options);
  const close = (ok: boolean) => {
    options?.resolve(ok);
    useConfirmStore.setState({ options: null });
  };
  return (
    <Modal visible={!!options} transparent animationType="fade" onRequestClose={() => close(false)}>
      <Pressable
        onPress={() => close(false)}
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Pressable
          accessibilityRole="alert"
          onPress={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 400,
            backgroundColor: colors.elevated,
            borderRadius: radius.xxl,
            padding: 24,
            gap: 12,
          }}
        >
          {options?.destructive ? (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.dangerSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="alert-outline" size={24} color={colors.danger} />
            </View>
          ) : null}
          <Text variant="heading">{options?.title}</Text>
          {options?.message ? <Text tone="muted">{options.message}</Text> : null}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
            <Button
              label={options?.cancelLabel ?? 'Cancel'}
              variant="outline"
              onPress={() => close(false)}
              style={{ flex: 1 }}
            />
            <Button
              label={options?.confirmLabel ?? 'Confirm'}
              variant={options?.destructive ? 'danger' : 'primary'}
              onPress={() => close(true)}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
