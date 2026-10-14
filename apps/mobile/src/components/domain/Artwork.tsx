import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import { Icon } from '../ui/Icon';

/** Decorative gradient tile with a large glyph — used for products and article covers. */
export function Artwork({
  color,
  icon,
  height = 140,
  radius = 16,
  iconSize = 56,
}: {
  color: string;
  icon: string;
  height?: number;
  radius?: number;
  iconSize?: number;
}) {
  return (
    <LinearGradient
      colors={[`${color}2E`, `${color}12`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        height,
        borderRadius: radius,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: height * 1.1,
          height: height * 1.1,
          borderRadius: height,
          backgroundColor: `${color}14`,
          right: -height * 0.35,
          top: -height * 0.45,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: height * 0.7,
          height: height * 0.7,
          borderRadius: height,
          backgroundColor: `${color}10`,
          left: -height * 0.2,
          bottom: -height * 0.3,
        }}
      />
      <Icon name={icon} size={iconSize} color={color} />
    </LinearGradient>
  );
}
