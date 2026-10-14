import { Platform, Pressable, TextInput, View, type TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  autoFocus,
}: SearchBarProps) {
  const { colors, radius, typography, shadow } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        height: 48,
        paddingHorizontal: 14,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        ...shadow(1),
      }}
    >
      <Icon name="magnify" size={20} color={colors.textSubtle} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        autoFocus={autoFocus}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder}
        style={[
          typography.body,
          { flex: 1, color: colors.text, height: 46 },
          Platform.OS === 'web' && ({ outlineWidth: 0 } as TextStyle),
        ]}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          onPress={() => onChangeText('')}
          hitSlop={8}
        >
          <Icon name="close-circle" size={18} color={colors.textSubtle} />
        </Pressable>
      ) : null}
    </View>
  );
}
