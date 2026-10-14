import { useWindowDimensions } from 'react-native';
import { WIDE_BREAKPOINT } from '@/theme/tokens';

/** Responsive layout helpers shared by every screen. */
export function useLayout() {
  const { width, height } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;
  const isTablet = width >= 640;
  return {
    width,
    height,
    isWide,
    isTablet,
    /** Suggested number of grid columns for card lists. */
    columns: width >= 1200 ? 3 : isTablet ? 2 : 1,
    gutter: isWide ? 32 : 20,
  };
}
