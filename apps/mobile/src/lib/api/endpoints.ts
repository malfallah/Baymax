import type {
  Appointment,
  Article,
  AuthResponse,
  BookAppointmentInput,
  ChangePasswordInput,
  CreateAnswerInput,
  CreateArticleInput,
  CreateOrderInput,
  CreateQuestionInput,
  CreateSlotsInput,
  DashboardStats,
  DiagnosisResult,
  Doctor,
  LoginInput,
  Order,
  PaymentIntentResult,
  Product,
  ProductCategory,
  Question,
  RegisterInput,
  SpecialtyKey,
  TimeSlot,
  UpdateAppointmentInput,
  UpdateMeInput,
  User,
} from '@baymax/shared';
import { api } from './client';

export const authApi = {
  login: (input: LoginInput) => api.post<AuthResponse>('/auth/login', input),
  register: (input: RegisterInput) => api.post<AuthResponse>('/auth/register', input),
  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),
  me: () => api.get<User>('/me'),
  updateMe: (input: UpdateMeInput) => api.patch<User>('/me', input),
  changePassword: (input: ChangePasswordInput) => api.post<void>('/me/password', input),
};

export const doctorsApi = {
  list: (params: { specialty?: SpecialtyKey; q?: string } = {}) =>
    api.get<Doctor[]>('/doctors', params),
  get: (id: string) => api.get<Doctor>(`/doctors/${id}`),
  slots: (id: string) => api.get<TimeSlot[]>(`/doctors/${id}/slots`),
  mySlots: (params: { from?: string; to?: string } = {}) =>
    api.get<TimeSlot[]>('/me/slots', params),
  createSlots: (input: CreateSlotsInput) => api.post<TimeSlot[]>('/me/slots', input),
  deleteSlot: (id: string) => api.delete(`/me/slots/${id}`),
  stats: () => api.get<DashboardStats>('/me/stats'),
};

export const appointmentsApi = {
  list: (scope: 'upcoming' | 'past' | 'all' = 'all') =>
    api.get<Appointment[]>('/appointments', { scope }),
  get: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  book: (input: BookAppointmentInput) => api.post<Appointment>('/appointments', input),
  update: (id: string, input: UpdateAppointmentInput) =>
    api.patch<Appointment>(`/appointments/${id}`, input),
};

export const communityApi = {
  articles: (params: { q?: string; category?: string } = {}) =>
    api.get<Article[]>('/articles', params),
  article: (id: string) => api.get<Article>(`/articles/${id}`),
  createArticle: (input: CreateArticleInput) => api.post<Article>('/articles', input),
  questions: (params: { q?: string; tag?: string } = {}) =>
    api.get<Question[]>('/questions', params),
  question: (id: string) => api.get<Question>(`/questions/${id}`),
  ask: (input: CreateQuestionInput) => api.post<Question>('/questions', input),
  answer: (id: string, input: CreateAnswerInput) =>
    api.post<Question>(`/questions/${id}/answers`, input),
};

export const shopApi = {
  products: (params: { q?: string; category?: ProductCategory } = {}) =>
    api.get<Product[]>('/products', params),
  product: (id: string) => api.get<Product>(`/products/${id}`),
  orders: () => api.get<Order[]>('/orders'),
  order: (id: string) => api.get<Order>(`/orders/${id}`),
  createOrder: (input: CreateOrderInput) =>
    api.post<{ order: Order; payment: PaymentIntentResult }>('/orders', input),
  confirmOrder: (id: string) => api.post<Order>(`/orders/${id}/confirm`),
};

export const healthApi = {
  predict: (symptoms: string[]) => api.post<DiagnosisResult>('/predictions', { symptoms }),
};
