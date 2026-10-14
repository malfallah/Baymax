import { SYMPTOMS, SYMPTOM_BY_ID, SYMPTOM_GROUPS, type SymptomGroupKey } from '@baymax/shared';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, View, type ViewStyle } from 'react-native';
import { HeaderActions } from '@/components/navigation/HeaderActions';
import { Button, Card, Chip, Icon, PageHeader, Screen, SearchBar, Text } from '@/components/ui';
import { useLayout } from '@/hooks/useLayout';
import { useTheme } from '@/theme/ThemeProvider';

const COMMON = [
  'headache',
  'high_fever',
  'cough',
  'fatigue',
  'nausea',
  'skin_rash',
  'joint_pain',
  'abdominal_pain',
];

export default function CheckTab() {
  const { colors, radius } = useTheme();
  const { isWide } = useLayout();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState<SymptomGroupKey | null>('general');

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const results = useMemo(
    () =>
      query.trim()
        ? SYMPTOMS.filter((s) => s.label.toLowerCase().includes(query.trim().toLowerCase())).slice(
            0,
            24,
          )
        : [],
    [query],
  );

  const analyze = () =>
    router.push({ pathname: '/check/results', params: { symptoms: selected.join(',') } });

  const summary = (
    <Card style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="heading">Your symptoms</Text>
        {selected.length ? (
          <Text
            variant="callout"
            tone="primary"
            onPress={() => setSelected([])}
            accessibilityRole="button"
          >
            Clear all
          </Text>
        ) : null}
      </View>
      {selected.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {selected.map((id) => (
            <Chip
              key={id}
              label={SYMPTOM_BY_ID[id]!.label}
              icon="close"
              selected
              onPress={() => toggle(id)}
            />
          ))}
        </View>
      ) : (
        <Text variant="callout" tone="muted">
          Select everything you are experiencing. The more you add, the more accurate the results.
        </Text>
      )}
      <Button
        label={
          selected.length
            ? `Analyze ${selected.length} symptom${selected.length === 1 ? '' : 's'}`
            : 'Select symptoms to continue'
        }
        icon="magnify-scan"
        size="lg"
        disabled={!selected.length}
        onPress={analyze}
      />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Icon name="shield-lock-outline" size={16} color={colors.textSubtle} />
        <Text variant="caption" tone="subtle" style={{ flex: 1 }}>
          Your answers stay private. Results are guidance only, not a diagnosis.
        </Text>
      </View>
    </Card>
  );

  const picker = (
    <View style={{ gap: 16 }}>
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search symptoms, e.g. sore throat"
      />
      {query.trim() ? (
        <Card style={{ gap: 12 }}>
          <Text variant="subheading">
            {results.length ? 'Matching symptoms' : 'No matching symptoms'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {results.map((s) => (
              <Chip
                key={s.id}
                label={s.label}
                icon="plus"
                selected={selected.includes(s.id)}
                onPress={() => toggle(s.id)}
              />
            ))}
          </View>
        </Card>
      ) : (
        <>
          <View style={{ gap: 10 }}>
            <Text variant="overline" tone="muted">
              Common symptoms
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {COMMON.map((id) => (
                <Chip
                  key={id}
                  label={SYMPTOM_BY_ID[id]!.label}
                  icon="plus"
                  selected={selected.includes(id)}
                  onPress={() => toggle(id)}
                />
              ))}
            </View>
          </View>
          <Card padding={4}>
            {SYMPTOM_GROUPS.map((g, i) => {
              const items = SYMPTOMS.filter((s) => s.group === g.key);
              const count = items.filter((s) => selected.includes(s.id)).length;
              const expanded = open === g.key;
              return (
                <View
                  key={g.key}
                  style={{
                    borderBottomWidth: i === SYMPTOM_GROUPS.length - 1 ? 0 : 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    onPress={() => setOpen(expanded ? null : g.key)}
                    style={[
                      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
                      Platform.OS === 'web' && ({ cursor: 'pointer' } as ViewStyle),
                    ]}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 11,
                        backgroundColor: colors.primarySoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name={g.icon} size={20} color={colors.primary} />
                    </View>
                    <Text variant="bodyMedium" style={{ flex: 1 }}>
                      {g.label}
                    </Text>
                    {count ? (
                      <View
                        style={{
                          minWidth: 22,
                          height: 22,
                          borderRadius: 11,
                          paddingHorizontal: 6,
                          backgroundColor: colors.primary,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text variant="caption" color="#fff">
                          {count}
                        </Text>
                      </View>
                    ) : null}
                    <Icon
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={22}
                      color={colors.textSubtle}
                    />
                  </Pressable>
                  {expanded ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        gap: 8,
                        paddingHorizontal: 12,
                        paddingBottom: 14,
                      }}
                    >
                      {items.map((s) => (
                        <Chip
                          key={s.id}
                          label={s.label}
                          selected={selected.includes(s.id)}
                          onPress={() => toggle(s.id)}
                        />
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </Card>
        </>
      )}
    </View>
  );

  return (
    <Screen
      footer={
        !isWide && selected.length ? (
          <Button
            label={`Analyze ${selected.length} symptom${selected.length === 1 ? '' : 's'}`}
            icon="magnify-scan"
            size="lg"
            onPress={analyze}
          />
        ) : undefined
      }
    >
      <PageHeader
        title="Symptom checker"
        subtitle="Tell us how you feel and get guidance in seconds"
        actions={<HeaderActions />}
      />
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          padding: 14,
          borderRadius: radius.lg,
          backgroundColor: colors.warningSoft,
        }}
      >
        <Icon name="alert-circle-outline" size={20} color={colors.warning} />
        <Text variant="caption" color={colors.warning} style={{ flex: 1 }}>
          If you have chest pain, difficulty breathing, sudden weakness or confusion, call emergency
          services now.
        </Text>
      </View>
      {isWide ? (
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'flex-start' }}>
          <View style={{ flex: 1.5 }}>{picker}</View>
          <View style={{ flex: 1 }}>{summary}</View>
        </View>
      ) : (
        <>
          {selected.length ? summary : null}
          {picker}
        </>
      )}
    </Screen>
  );
}
