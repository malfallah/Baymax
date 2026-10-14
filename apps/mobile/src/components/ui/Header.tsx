import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useLayout } from '@/hooks/useLayout';
import { IconButton } from './IconButton';
import { Text } from './Text';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

/** Large title used at the top of tab screens. */
export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  const { isWide } = useLayout();
  return (
    <View
      style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingTop: isWide ? 8 : 4 }}
    >
      <View style={{ flex: 1, gap: 4 }}>
        {eyebrow ? (
          <Text variant="overline" tone="primary">
            {eyebrow}
          </Text>
        ) : null}
        <Text
          variant="display"
          accessibilityRole="header"
          style={!isWide && { fontSize: 28, lineHeight: 34 }}
        >
          {title}
        </Text>
        {subtitle ? <Text tone="muted">{subtitle}</Text> : null}
      </View>
      {actions ? <View style={{ flexDirection: 'row', gap: 8 }}>{actions}</View> : null}
    </View>
  );
}

export interface StackHeaderProps {
  title?: string;
  fallbackHref?: Href;
  actions?: ReactNode;
}

/** Compact header with a back button for pushed screens. */
export function StackHeader({ title, fallbackHref = '/', actions }: StackHeaderProps) {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace(fallbackHref));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, height: 56 }}>
      <IconButton icon="arrow-left" label="Go back" onPress={goBack} />
      <Text variant="heading" numberOfLines={1} style={{ flex: 1 }} accessibilityRole="header">
        {title ?? ''}
      </Text>
      {actions ? <View style={{ flexDirection: 'row', gap: 8 }}>{actions}</View> : null}
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: -6,
      }}
    >
      <Text variant="heading" accessibilityRole="header">
        {title}
      </Text>
      {action ? (
        <Text
          variant="callout"
          tone="primary"
          onPress={onAction}
          accessibilityRole="link"
          suppressHighlighting
        >
          {action}
        </Text>
      ) : null}
    </View>
  );
}
