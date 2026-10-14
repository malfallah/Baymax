import {
  SPECIALTY_BY_KEY,
  SYMPTOM_BY_ID,
  needsUrgentCare,
  type DiagnosisCandidate,
} from '@baymax/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import {
  Badge,
  Button,
  Card,
  Chip,
  ErrorState,
  Icon,
  LoadingState,
  Screen,
  StackHeader,
  Text,
} from '@/components/ui';
import { usePredict } from '@/hooks/queries';
import { useLayout } from '@/hooks/useLayout';
import { article } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';

const SEVERITY = {
  low: { label: 'Usually mild', tone: 'success' },
  moderate: { label: 'See a doctor soon', tone: 'warning' },
  high: { label: 'Seek care promptly', tone: 'danger' },
} as const;

function CandidateCard({ candidate, rank }: { candidate: DiagnosisCandidate; rank: number }) {
  const { colors } = useTheme();
  const specialty = SPECIALTY_BY_KEY[candidate.specialty];
  const severity = SEVERITY[candidate.severity];
  const barColor =
    candidate.confidence >= 60
      ? colors.primary
      : candidate.confidence >= 35
        ? '#6366F1'
        : colors.textSubtle;
  return (
    <Card style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            backgroundColor: rank === 0 ? colors.primary : colors.surfaceMuted,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text variant="subheading" color={rank === 0 ? '#fff' : colors.textMuted}>
            {rank + 1}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Text variant="heading">{candidate.disease}</Text>
          <Badge label={severity.label} tone={severity.tone} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="title" color={barColor}>
            {candidate.confidence}%
          </Text>
          <Text variant="caption" tone="subtle">
            match
          </Text>
        </View>
      </View>
      <View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.surfaceMuted,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${candidate.confidence}%`,
            height: 6,
            borderRadius: 3,
            backgroundColor: barColor,
          }}
        />
      </View>
      <Text tone="muted">{candidate.description}</Text>
      <View style={{ gap: 8 }}>
        <Text variant="overline" tone="muted">
          Matching symptoms
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {candidate.matchedSymptoms.map((s) => (
            <Badge key={s} label={s} tone="primary" />
          ))}
        </View>
      </View>
      <View style={{ gap: 8 }}>
        <Text variant="overline" tone="muted">
          What you can do
        </Text>
        {candidate.precautions.map((p) => (
          <View key={p} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
            <Icon name="check-circle-outline" size={18} color={colors.success} />
            <Text variant="callout" style={{ flex: 1 }}>
              {p}
            </Text>
          </View>
        ))}
      </View>
      <Button
        label={`See ${article(specialty.practitioner)} ${specialty.practitioner.toLowerCase()}`}
        icon={specialty.icon}
        variant={rank === 0 ? 'primary' : 'secondary'}
        onPress={() => router.push({ pathname: '/doctors', params: { specialty: specialty.key } })}
      />
    </Card>
  );
}

export default function Results() {
  const { colors, radius } = useTheme();
  const { columns } = useLayout();
  const params = useLocalSearchParams<{ symptoms?: string }>();
  const symptoms = (params.symptoms ?? '').split(',').filter((id) => SYMPTOM_BY_ID[id]);
  const predict = usePredict();

  useEffect(() => {
    if (symptoms.length) predict.mutate(symptoms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.symptoms]);

  const result = predict.data;
  const urgent = result ? needsUrgentCare(result) : false;

  return (
    <Screen header={<StackHeader title="Your results" fallbackHref="/check" />}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {symptoms.map((id) => (
          <Chip key={id} label={SYMPTOM_BY_ID[id]!.label} />
        ))}
      </View>
      {!symptoms.length ? (
        <ErrorState
          error={new Error('No symptoms were selected.')}
          onRetry={() => router.replace('/check')}
        />
      ) : predict.isPending || !result ? (
        predict.error ? (
          <ErrorState error={predict.error} onRetry={() => predict.mutate(symptoms)} />
        ) : (
          <LoadingState label="Analyzing your symptoms…" />
        )
      ) : (
        <>
          {urgent ? (
            <View
              style={{
                flexDirection: 'row',
                gap: 12,
                padding: 16,
                borderRadius: radius.xl,
                backgroundColor: colors.dangerSoft,
              }}
            >
              <Icon name="ambulance" size={24} color={colors.danger} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text variant="subheading" tone="danger">
                  Your symptoms may need urgent attention
                </Text>
                <Text variant="callout" tone="danger">
                  If symptoms are severe or getting worse, contact emergency services or go to the
                  nearest emergency department.
                </Text>
              </View>
            </View>
          ) : null}
          {result.aiSummary ? (
            <Card style={{ gap: 8, borderWidth: 1, borderColor: colors.primarySoft }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon name="creation" size={18} color={colors.primary} />
                <Text variant="subheading" tone="primary">
                  Baymax summary
                </Text>
              </View>
              <Text>{result.aiSummary}</Text>
            </Card>
          ) : null}
          {result.candidates.length ? (
            <>
              <Text variant="heading">Possible conditions</Text>
              <View
                style={{ flexDirection: columns > 1 ? 'row' : 'column', flexWrap: 'wrap', gap: 16 }}
              >
                {result.candidates.slice(0, 4).map((c, i) => (
                  <View key={c.disease} style={columns > 1 ? { width: '48.5%' } : undefined}>
                    <CandidateCard candidate={c} rank={i} />
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Card>
              <Text tone="muted">
                We couldn’t match these symptoms to a condition. If you feel unwell, please book a
                general practitioner.
              </Text>
            </Card>
          )}
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              padding: 14,
              borderRadius: radius.lg,
              backgroundColor: colors.surfaceMuted,
            }}
          >
            <Icon name="information-outline" size={18} color={colors.textMuted} />
            <Text variant="caption" tone="muted" style={{ flex: 1 }}>
              {result.disclaimer}
            </Text>
          </View>
          <Button
            label="Start over"
            variant="outline"
            icon="restart"
            onPress={() => router.replace('/check')}
          />
        </>
      )}
    </Screen>
  );
}
