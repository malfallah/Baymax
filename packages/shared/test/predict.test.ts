import { describe, expect, it } from 'vitest';
import { CONDITIONS, SYMPTOM_BY_ID, needsUrgentCare, predictConditions } from '../src';

describe('knowledge base integrity', () => {
  it('only references known symptoms', () => {
    for (const condition of CONDITIONS) {
      for (const id of condition.symptoms) {
        expect(SYMPTOM_BY_ID[id], `${condition.name} → ${id}`).toBeDefined();
      }
    }
  });
});

describe('predictConditions', () => {
  it('ranks the obvious condition first', () => {
    const result = predictConditions([
      'burning_micturition',
      'bladder_discomfort',
      'foul_smell_of_urine',
    ]);
    expect(result.candidates[0]?.disease).toBe('Urinary tract infection');
    expect(result.candidates[0]?.specialty).toBe('urology');
  });

  it('identifies acne from skin symptoms', () => {
    const result = predictConditions(['pus_filled_pimples', 'blackheads']);
    expect(result.candidates[0]?.disease).toBe('Acne');
  });

  it('ignores unknown and duplicate symptoms', () => {
    const result = predictConditions(['cough', 'cough', 'not_a_symptom']);
    expect(result.symptoms).toEqual(['cough']);
  });

  it('returns no candidates for an empty selection', () => {
    expect(predictConditions([]).candidates).toHaveLength(0);
  });

  it('respects the limit and keeps confidences in range', () => {
    const result = predictConditions(['high_fever', 'headache', 'nausea', 'vomiting'], {
      limit: 3,
    });
    expect(result.candidates).toHaveLength(3);
    for (const c of result.candidates) {
      expect(c.confidence).toBeGreaterThan(0);
      expect(c.confidence).toBeLessThan(100);
    }
  });

  it('flags red-flag symptoms as urgent', () => {
    expect(needsUrgentCare(predictConditions(['chest_pain', 'sweating']))).toBe(true);
    expect(needsUrgentCare(predictConditions(['blackheads']))).toBe(false);
  });
});
