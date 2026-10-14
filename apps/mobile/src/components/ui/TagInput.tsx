import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { IconButton } from './IconButton';
import { Icon } from './Icon';
import { Text } from './Text';
import { TextField } from './TextField';

/** Free-text list input — type a value and press add to create a removable chip. */
export function TagInput({
  label,
  placeholder,
  values,
  onChange,
  hint,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
  hint?: string;
}) {
  const { colors } = useTheme();
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !values.some((x) => x.toLowerCase() === v.toLowerCase())) onChange([...values, v]);
    setDraft('');
  };
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <TextField
            label={label}
            placeholder={placeholder}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={add}
            hint={hint}
            returnKeyType="done"
          />
        </View>
        <View style={{ paddingBottom: hint ? 24 : 0 }}>
          <IconButton
            icon="plus"
            label={`Add ${label.toLowerCase()}`}
            variant="tinted"
            size={50}
            onPress={add}
          />
        </View>
      </View>
      {values.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {values.map((v) => (
            <Pressable
              key={v}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${v}`}
              onPress={() => onChange(values.filter((x) => x !== v))}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingLeft: 12,
                paddingRight: 8,
                height: 32,
                borderRadius: 999,
                backgroundColor: colors.primarySoft,
              }}
            >
              <Text variant="callout" tone="primary">
                {v}
              </Text>
              <Icon name="close" size={14} color={colors.primary} />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
