import { MEDICAL_DISCLAIMER } from '../constants';
import type { DiagnosisCandidate, DiagnosisResult } from '../types';
import { CONDITIONS, type Condition } from './conditions';
import { SYMPTOM_BY_ID } from './symptoms';

/** Symptoms that should always prompt the user to seek urgent care. */
export const RED_FLAG_SYMPTOMS = new Set([
  'chest_pain',
  'weakness_of_one_body_side',
  'slurred_speech',
  'altered_sensorium',
  'coma',
  'blood_in_sputum',
  'stomach_bleeding',
  'acute_liver_failure',
]);

// Inverse document frequency: symptoms shared by many conditions carry less signal.
const documentFrequency = new Map<string, number>();
for (const condition of CONDITIONS) {
  for (const symptom of condition.symptoms) {
    documentFrequency.set(symptom, (documentFrequency.get(symptom) ?? 0) + 1);
  }
}

export function symptomWeight(symptomId: string): number {
  const df = documentFrequency.get(symptomId) ?? 0;
  return Math.log(1 + CONDITIONS.length / (df + 1));
}

const conditionWeight = new Map<Condition, number>(
  CONDITIONS.map((c) => [c, c.symptoms.reduce((sum, id) => sum + symptomWeight(id), 0)]),
);

export interface PredictOptions {
  limit?: number;
}

/**
 * Ranks conditions by how well they explain the selected symptoms.
 * Uses an IDF-weighted F1 score between the selected symptoms and each
 * condition's characteristic symptoms, so the result is fully explainable.
 */
export function predictConditions(
  symptomIds: string[],
  { limit = 5 }: PredictOptions = {},
): DiagnosisResult {
  const selected = [...new Set(symptomIds)].filter((id) => SYMPTOM_BY_ID[id]);
  const selectedWeight = selected.reduce((sum, id) => sum + symptomWeight(id), 0);

  const candidates: DiagnosisCandidate[] = [];
  if (selectedWeight > 0) {
    for (const condition of CONDITIONS) {
      const matched = selected.filter((id) => condition.symptoms.includes(id));
      if (matched.length === 0) continue;
      const matchedWeight = matched.reduce((sum, id) => sum + symptomWeight(id), 0);
      const recall = matchedWeight / conditionWeight.get(condition)!;
      const precision = matchedWeight / selectedWeight;
      const f1 = (2 * precision * recall) / (precision + recall);
      candidates.push({
        disease: condition.name,
        confidence: Math.min(97, Math.max(3, Math.round(100 * Math.pow(f1, 0.75)))),
        matchedSymptoms: matched.map((id) => SYMPTOM_BY_ID[id]!.label),
        description: condition.description,
        precautions: condition.precautions,
        specialty: condition.specialty,
        severity: condition.severity,
      });
    }
  }

  candidates.sort((a, b) => b.confidence - a.confidence || a.disease.localeCompare(b.disease));

  return {
    symptoms: selected,
    candidates: candidates.slice(0, limit),
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

/** True when the selection or top result suggests the user should seek urgent care. */
export function needsUrgentCare(result: DiagnosisResult): boolean {
  if (result.symptoms.some((id) => RED_FLAG_SYMPTOMS.has(id))) return true;
  const top = result.candidates[0];
  return !!top && top.severity === 'high' && top.confidence >= 55;
}
