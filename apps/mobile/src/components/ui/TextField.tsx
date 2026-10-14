import { forwardRef, useState } from 'react';
import {
  Platform,
  Pressable,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
} from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
  secureToggle?: boolean;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    error,
    hint,
    icon,
    secureToggle,
    secureTextEntry,
    multiline,
    style,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const { colors, radius, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text variant="callout" tone="default">
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: 10,
          minHeight: multiline ? 110 : 50,
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          borderRadius: radius.lg,
          borderWidth: focused ? 1.5 : 1,
          borderColor,
          backgroundColor: colors.surface,
        }}
      >
        {icon ? (
          <Icon name={icon} size={19} color={focused ? colors.primary : colors.textSubtle} />
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={secureToggle ? hidden : secureTextEntry}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            typography.body,
            { flex: 1, color: colors.text, minHeight: multiline ? 86 : 48 },
            Platform.OS === 'web' && ({ outlineWidth: 0 } as TextStyle),
            style,
          ]}
          {...rest}
        />
        {secureToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((h) => !h)}
            hitSlop={8}
          >
            <Icon
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSubtle}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="subtle">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});
