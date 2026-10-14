/**
 * Domain model shared by the Baymax API and client.
 * All dates travel over the wire as ISO-8601 strings.
 */

export type Role = 'patient' | 'doctor';

export type Sex = 'female' | 'male';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active';

export interface MedicalCondition {
  name: string;
  since?: string;
}

export interface Vaccine {
  name: string;
  date?: string;
}

export interface Surgery {
  name: string;
  date?: string;
  recovered: boolean;
}

export interface FamilyHistoryEntry {
  condition: string;
  relation: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface PatientProfile {
  dateOfBirth?: string;
  sex?: Sex;
  nationality?: string;
  address?: string;
  heightCm?: number;
  weightKg?: number;
  bloodType?: BloodType;
  activityLevel?: ActivityLevel;
  smoker: boolean;
  allergies: string[];
  conditions: MedicalCondition[];
  vaccines: Vaccine[];
  surgeries: Surgery[];
  familyHistory: FamilyHistoryEntry[];
  medications: Medication[];
}

export interface DoctorProfile {
  specialty: SpecialtyKey;
  bio: string;
  clinic: string;
  city: string;
  yearsOfExperience: number;
  education: string;
  consultationFeeCents: number;
  languages: string[];
  rating: number;
  reviewsCount: number;
}

interface BaseUser {
  id: string;
  role: Role;
  fullName: string;
  email: string;
  phone?: string;
  avatarColor: string;
  createdAt: string;
}

export interface PatientUser extends BaseUser {
  role: 'patient';
  patient: PatientProfile;
}

export interface DoctorUser extends BaseUser {
  role: 'doctor';
  doctor: DoctorProfile;
}

export type User = PatientUser | DoctorUser;

/** Public projection of a doctor used in listings and booking. */
export interface Doctor {
  id: string;
  fullName: string;
  avatarColor: string;
  specialty: SpecialtyKey;
  bio: string;
  clinic: string;
  city: string;
  yearsOfExperience: number;
  education: string;
  consultationFeeCents: number;
  languages: string[];
  rating: number;
  reviewsCount: number;
  nextAvailable?: string;
}

export type SlotStatus = 'available' | 'booked';

export interface TimeSlot {
  id: string;
  doctorId: string;
  start: string;
  end: string;
  status: SlotStatus;
}

export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed';

export interface PersonSummary {
  id: string;
  fullName: string;
  avatarColor: string;
}

export interface Appointment {
  id: string;
  slotId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  patient: PersonSummary;
  doctor: PersonSummary & { specialty: SpecialtyKey; clinic: string; city: string };
  createdAt: string;
}

export type ArticleCategory =
  'nutrition' | 'fitness' | 'mental-health' | 'sleep' | 'prevention' | 'conditions';

export interface Article {
  id: string;
  title: string;
  summary: string;
  body: string;
  category: ArticleCategory;
  readMinutes: number;
  author: PersonSummary & { role: Role };
  publishedAt: string;
}

export interface Answer {
  id: string;
  body: string;
  author: PersonSummary & { role: Role };
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  body: string;
  tags: string[];
  author: PersonSummary & { role: Role };
  answers: Answer[];
  createdAt: string;
}

export type ProductCategory =
  'pain-relief' | 'cold-allergy' | 'digestive' | 'skin-care' | 'vitamins' | 'first-aid';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  activeIngredient: string;
  usage: string;
  priceCents: number;
  stock: number;
  rating: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface ShippingAddress {
  fullName: string;
  line1: string;
  city: string;
  phone: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  status: OrderStatus;
  shipping: ShippingAddress;
  createdAt: string;
}

export interface PaymentIntentResult {
  /** `stripe` when a real Stripe PaymentIntent was created, `demo` otherwise. */
  provider: 'stripe' | 'demo';
  clientSecret?: string;
  orderId: string;
}

export type Severity = 'low' | 'moderate' | 'high';

export interface DiagnosisCandidate {
  disease: string;
  confidence: number;
  matchedSymptoms: string[];
  description: string;
  precautions: string[];
  specialty: SpecialtyKey;
  severity: Severity;
}

export interface DiagnosisResult {
  symptoms: string[];
  candidates: DiagnosisCandidate[];
  /** Optional AI-generated guidance when an LLM provider is configured on the server. */
  aiSummary?: string;
  disclaimer: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  upcomingAppointments: number;
  completedAppointments: number;
  openSlots: number;
  patientsSeen: number;
}

export type SpecialtyKey =
  | 'general'
  | 'cardiology'
  | 'dermatology'
  | 'endocrinology'
  | 'gastroenterology'
  | 'neurology'
  | 'obgyn'
  | 'oncology'
  | 'ophthalmology'
  | 'orthopedics'
  | 'ent'
  | 'pediatrics'
  | 'psychiatry'
  | 'pulmonology'
  | 'rheumatology'
  | 'urology'
  | 'hepatology'
  | 'infectious-disease'
  | 'dentistry';

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
