import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, LogoMark, StackHeader, Text } from '@/components/ui';
import { useLayout } from '@/hooks/useLayout';
import { useTheme } from '@/theme/ThemeProvider';

const HIGHLIGHTS = [
  {
    icon: 'calendar-check',
    title: 'Book in seconds',
    text: 'Real-time availability from trusted specialists.',
  },
  { icon: 'stethoscope', title: 'Check your symptoms', text: 'Clear guidance on what to do next.' },
  { icon: 'pill', title: 'Pharmacy at home', text: 'Everyday medicines delivered to your door.' },
  { icon: 'forum-outline', title: 'Ask a doctor', text: 'Answers from verified clinicians.' },
];

export function BrandPanel() {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.heroStart, colors.heroEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, padding: 48, justifyContent: 'space-between', overflow: 'hidden' }}
    >
      <View
        style={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: 260,
          backgroundColor: 'rgba(255,255,255,0.06)',
          right: -160,
          top: -140,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 340,
          height: 340,
          borderRadius: 170,
          backgroundColor: 'rgba(255,255,255,0.05)',
          left: -120,
          bottom: -100,
        }}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ padding: 3, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.18)' }}>
          <LogoMark size={40} />
        </View>
        <Text variant="title" color="#fff">
          Baymax
        </Text>
      </View>
      <View style={{ gap: 28, maxWidth: 460 }}>
        <Text variant="display" color="#fff" style={{ fontSize: 40, lineHeight: 48 }}>
          Your personal healthcare companion.
        </Text>
        <View style={{ gap: 18 }}>
          {HIGHLIGHTS.map((h) => (
            <View key={h.title} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: 'rgba(255,255,255,0.16)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={h.icon} size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subheading" color="#fff">
                  {h.title}
                </Text>
                <Text variant="callout" color="rgba(255,255,255,0.78)">
                  {h.text}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <Text variant="caption" color="rgba(255,255,255,0.7)">
        © {new Date().getFullYear()} Baymax Health. Not a substitute for professional medical
        advice.
      </Text>
    </LinearGradient>
  );
}

/** Split-screen scaffold for authentication flows. */
export function AuthShell({
  children,
  back = true,
  maxWidth = 440,
}: {
  children: ReactNode;
  back?: boolean;
  maxWidth?: number;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { isWide, gutter } = useLayout();
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: colors.background }}>
      {isWide ? (
        <View style={{ flex: 1, maxWidth: 620 }}>
          <BrandPanel />
        </View>
      ) : null}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + (isWide ? 40 : 8),
            paddingBottom: insets.bottom + 32,
            paddingHorizontal: gutter,
            justifyContent: isWide ? 'center' : 'flex-start',
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', maxWidth, alignSelf: 'center', gap: 24 }}>
            {back ? <StackHeader fallbackHref="/welcome" /> : null}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
