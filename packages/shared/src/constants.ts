import type { ArticleCategory, ProductCategory, SpecialtyKey } from './types';

export interface SpecialtyInfo {
  key: SpecialtyKey;
  label: string;
  /** Plain-language name of the practitioner. */
  practitioner: string;
  description: string;
  /** MaterialCommunityIcons glyph name. */
  icon: string;
  color: string;
}

export const SPECIALTIES: readonly SpecialtyInfo[] = [
  {
    key: 'general',
    label: 'General Practice',
    practitioner: 'General Practitioner',
    description: 'Everyday health concerns, check-ups and referrals.',
    icon: 'stethoscope',
    color: '#0EA5E9',
  },
  {
    key: 'cardiology',
    label: 'Cardiology',
    practitioner: 'Cardiologist',
    description: 'Heart and blood vessel conditions.',
    icon: 'heart-pulse',
    color: '#EF4444',
  },
  {
    key: 'dermatology',
    label: 'Dermatology',
    practitioner: 'Dermatologist',
    description: 'Skin, hair and nail conditions.',
    icon: 'hand-back-left-outline',
    color: '#F59E0B',
  },
  {
    key: 'endocrinology',
    label: 'Endocrinology',
    practitioner: 'Endocrinologist',
    description: 'Hormones, diabetes and thyroid.',
    icon: 'dna',
    color: '#8B5CF6',
  },
  {
    key: 'gastroenterology',
    label: 'Gastroenterology',
    practitioner: 'Gastroenterologist',
    description: 'Stomach, bowel and digestion.',
    icon: 'stomach',
    color: '#10B981',
  },
  {
    key: 'hepatology',
    label: 'Hepatology',
    practitioner: 'Hepatologist',
    description: 'Liver, gallbladder and pancreas.',
    icon: 'water-outline',
    color: '#CA8A04',
  },
  {
    key: 'neurology',
    label: 'Neurology',
    practitioner: 'Neurologist',
    description: 'Brain, nerves and headaches.',
    icon: 'brain',
    color: '#6366F1',
  },
  {
    key: 'obgyn',
    label: 'Obstetrics & Gynecology',
    practitioner: 'OB/GYN',
    description: "Women's and reproductive health.",
    icon: 'human-pregnant',
    color: '#EC4899',
  },
  {
    key: 'oncology',
    label: 'Oncology',
    practitioner: 'Oncologist',
    description: 'Cancer screening and care.',
    icon: 'ribbon',
    color: '#A855F7',
  },
  {
    key: 'ophthalmology',
    label: 'Ophthalmology',
    practitioner: 'Ophthalmologist',
    description: 'Eyes and vision.',
    icon: 'eye-outline',
    color: '#06B6D4',
  },
  {
    key: 'orthopedics',
    label: 'Orthopedics',
    practitioner: 'Orthopedic Surgeon',
    description: 'Bones, joints and muscles.',
    icon: 'bone',
    color: '#78716C',
  },
  {
    key: 'ent',
    label: 'Ear, Nose & Throat',
    practitioner: 'ENT Specialist',
    description: 'Ears, nose, sinuses and throat.',
    icon: 'ear-hearing',
    color: '#F97316',
  },
  {
    key: 'pediatrics',
    label: 'Pediatrics',
    practitioner: 'Pediatrician',
    description: 'Care for infants, children and teens.',
    icon: 'baby-face-outline',
    color: '#22C55E',
  },
  {
    key: 'psychiatry',
    label: 'Psychiatry',
    practitioner: 'Psychiatrist',
    description: 'Mental and emotional wellbeing.',
    icon: 'head-heart-outline',
    color: '#14B8A6',
  },
  {
    key: 'pulmonology',
    label: 'Pulmonology',
    practitioner: 'Pulmonologist',
    description: 'Lungs and breathing.',
    icon: 'lungs',
    color: '#3B82F6',
  },
  {
    key: 'rheumatology',
    label: 'Rheumatology',
    practitioner: 'Rheumatologist',
    description: 'Arthritis and autoimmune disease.',
    icon: 'human-handsup',
    color: '#D946EF',
  },
  {
    key: 'urology',
    label: 'Urology',
    practitioner: 'Urologist',
    description: 'Kidneys and urinary tract.',
    icon: 'water-check-outline',
    color: '#0284C7',
  },
  {
    key: 'infectious-disease',
    label: 'Infectious Disease',
    practitioner: 'Infectious Disease Specialist',
    description: 'Infections, fevers and travel medicine.',
    icon: 'virus-outline',
    color: '#DC2626',
  },
  {
    key: 'dentistry',
    label: 'Dentistry',
    practitioner: 'Dentist',
    description: 'Teeth and oral health.',
    icon: 'tooth-outline',
    color: '#0D9488',
  },
] as const;

export const SPECIALTY_BY_KEY: Record<SpecialtyKey, SpecialtyInfo> = Object.fromEntries(
  SPECIALTIES.map((s) => [s.key, s]),
) as Record<SpecialtyKey, SpecialtyInfo>;

export const SPECIALTY_KEYS = SPECIALTIES.map((s) => s.key) as [SpecialtyKey, ...SpecialtyKey[]];

export interface CategoryInfo<K extends string> {
  key: K;
  label: string;
  icon: string;
  color: string;
}

export const ARTICLE_CATEGORIES: readonly CategoryInfo<ArticleCategory>[] = [
  { key: 'nutrition', label: 'Nutrition', icon: 'food-apple-outline', color: '#16A34A' },
  { key: 'fitness', label: 'Fitness', icon: 'run-fast', color: '#EA580C' },
  { key: 'mental-health', label: 'Mental health', icon: 'meditation', color: '#7C3AED' },
  { key: 'sleep', label: 'Sleep', icon: 'weather-night', color: '#4F46E5' },
  { key: 'prevention', label: 'Prevention', icon: 'shield-check-outline', color: '#0891B2' },
  { key: 'conditions', label: 'Conditions', icon: 'clipboard-pulse-outline', color: '#DB2777' },
];

export const PRODUCT_CATEGORIES: readonly CategoryInfo<ProductCategory>[] = [
  { key: 'pain-relief', label: 'Pain relief', icon: 'pill', color: '#EF4444' },
  { key: 'cold-allergy', label: 'Cold & allergy', icon: 'snowflake', color: '#0EA5E9' },
  { key: 'digestive', label: 'Digestive', icon: 'stomach', color: '#10B981' },
  { key: 'skin-care', label: 'Skin care', icon: 'lotion-outline', color: '#F59E0B' },
  { key: 'vitamins', label: 'Vitamins', icon: 'leaf', color: '#84CC16' },
  { key: 'first-aid', label: 'First aid', icon: 'medical-bag', color: '#E11D48' },
];

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active'] as const;
export const FAMILY_RELATIONS = [
  'Mother',
  'Father',
  'Sister',
  'Brother',
  'Grandparent',
  'Aunt',
  'Uncle',
  'Cousin',
] as const;

/** Palette used to give every user a stable, friendly avatar colour. */
export const AVATAR_COLORS = [
  '#0EA5E9',
  '#6366F1',
  '#EC4899',
  '#F59E0B',
  '#10B981',
  '#8B5CF6',
  '#EF4444',
  '#14B8A6',
] as const;

export function avatarColorFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!;
}

export const SHIPPING_FLAT_CENTS = 499;
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000;

export function shippingFor(subtotalCents: number): number {
  return subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
    ? 0
    : SHIPPING_FLAT_CENTS;
}

export const MEDICAL_DISCLAIMER =
  'Baymax provides general information only and is not a substitute for professional medical advice. If you think you may have a medical emergency, call your local emergency number immediately.';
