import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { Platform, useColorScheme, type ViewStyle } from 'react-native';
import { usePreferences } from '@/stores/preferences';
import { darkColors, lightColors, radius, spacing, typography, type ColorScheme } from './tokens';

export interface Theme {
  dark: boolean;
  colors: ColorScheme;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadow: (level?: 1 | 2 | 3) => ViewStyle;
}

const ThemeContext = createContext<Theme | null>(null);

function makeShadow(colors: ColorScheme, dark: boolean) {
  return (level: 1 | 2 | 3 = 1): ViewStyle => {
    if (dark) return { borderWidth: 1, borderColor: colors.border };
    const y = level * 2;
    const blur = level * 8;
    const opacity = 0.04 + level * 0.02;
    return Platform.select<ViewStyle>({
      web: { boxShadow: `0 ${y}px ${blur}px rgba(15, 23, 42, ${opacity})` } as ViewStyle,
      android: { elevation: level * 2 },
      default: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: y },
        shadowOpacity: opacity,
        shadowRadius: blur,
      },
    })!;
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const preference = usePreferences((s) => s.theme);
  const dark = preference === 'system' ? system === 'dark' : preference === 'dark';

  const theme = useMemo<Theme>(() => {
    const colors = dark ? darkColors : lightColors;
    return { dark, colors, spacing, radius, typography, shadow: makeShadow(colors, dark) };
  }, [dark]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme must be used inside ThemeProvider');
  return theme;
}
