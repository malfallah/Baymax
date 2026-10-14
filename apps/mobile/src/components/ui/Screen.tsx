import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLayout } from '@/hooks/useLayout';
import { useTheme } from '@/theme/ThemeProvider';
import { CONTENT_MAX_WIDTH } from '@/theme/tokens';

export interface ScreenProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  maxWidth?: number;
  contentStyle?: StyleProp<ViewStyle>;
  /** Apply the top safe-area inset (screens without a header). */
  safeTop?: boolean;
}

/**
 * Standard screen scaffold: safe areas, responsive max-width column,
 * pull-to-refresh, keyboard avoidance and an optional sticky footer.
 */
export function Screen({
  children,
  header,
  footer,
  scroll = true,
  refreshing = false,
  onRefresh,
  maxWidth = CONTENT_MAX_WIDTH,
  contentStyle,
  safeTop = true,
}: ScreenProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { gutter, isWide } = useLayout();
  const column: ViewStyle = {
    width: '100%',
    maxWidth,
    alignSelf: 'center',
    paddingHorizontal: gutter,
  };

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingBottom: footer ? 24 : insets.bottom + 32,
        paddingTop: header ? 4 : isWide ? 32 : 12,
      }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        ) : undefined
      }
    >
      <View style={[column, { gap: 20 }, contentStyle]}>{children}</View>
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, column, contentStyle]}>{children}</View>
  );

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background, paddingTop: safeTop ? insets.top : 0 }}
    >
      {header ? <View style={column}>{header}</View> : null}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
        {footer ? (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, 12),
              paddingTop: 12,
            }}
          >
            <View style={column}>{footer}</View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}
