import type { ProductCategory, SpecialtyKey, UpdateAppointmentInput } from '@baymax/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  appointmentsApi,
  authApi,
  communityApi,
  doctorsApi,
  healthApi,
  shopApi,
} from '@/lib/api/endpoints';
import { useAuth } from '@/stores/auth';

export const keys = {
  me: ['me'] as const,
  doctors: (params: object) => ['doctors', params] as const,
  doctor: (id: string) => ['doctor', id] as const,
  doctorSlots: (id: string) => ['doctor', id, 'slots'] as const,
  mySlots: ['my-slots'] as const,
  stats: ['stats'] as const,
  appointments: (scope: string) => ['appointments', scope] as const,
  appointment: (id: string) => ['appointment', id] as const,
  articles: (params: object) => ['articles', params] as const,
  article: (id: string) => ['article', id] as const,
  questions: (params: object) => ['questions', params] as const,
  question: (id: string) => ['question', id] as const,
  products: (params: object) => ['products', params] as const,
  product: (id: string) => ['product', id] as const,
  orders: ['orders'] as const,
  order: (id: string) => ['order', id] as const,
};

/* -------- account -------- */

export function useUpdateMe() {
  const qc = useQueryClient();
  const setUser = useAuth((s) => s.setUser);
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (user) => {
      setUser(user);
      qc.setQueryData(keys.me, user);
    },
  });
}

export const useChangePassword = () => useMutation({ mutationFn: authApi.changePassword });

/* -------- doctors & availability -------- */

export const useDoctors = (params: { specialty?: SpecialtyKey; q?: string } = {}) =>
  useQuery({ queryKey: keys.doctors(params), queryFn: () => doctorsApi.list(params) });

export const useDoctor = (id: string) =>
  useQuery({ queryKey: keys.doctor(id), queryFn: () => doctorsApi.get(id) });

export const useDoctorSlots = (id: string) =>
  useQuery({ queryKey: keys.doctorSlots(id), queryFn: () => doctorsApi.slots(id) });

export const useMySlots = () =>
  useQuery({ queryKey: keys.mySlots, queryFn: () => doctorsApi.mySlots() });

export const useDoctorStats = () => useQuery({ queryKey: keys.stats, queryFn: doctorsApi.stats });

export function useCreateSlots() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: doctorsApi.createSlots,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.mySlots });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

export function useDeleteSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: doctorsApi.deleteSlot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.mySlots });
      qc.invalidateQueries({ queryKey: keys.stats });
    },
  });
}

/* -------- appointments -------- */

export const useAppointments = (scope: 'upcoming' | 'past' | 'all') =>
  useQuery({ queryKey: keys.appointments(scope), queryFn: () => appointmentsApi.list(scope) });

export const useAppointment = (id: string) =>
  useQuery({ queryKey: keys.appointment(id), queryFn: () => appointmentsApi.get(id) });

function invalidateBookings(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['appointments'] });
  qc.invalidateQueries({ queryKey: ['appointment'] });
  qc.invalidateQueries({ queryKey: ['doctor'] });
  qc.invalidateQueries({ queryKey: ['doctors'] });
  qc.invalidateQueries({ queryKey: keys.mySlots });
  qc.invalidateQueries({ queryKey: keys.stats });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: appointmentsApi.book, onSettled: () => invalidateBookings(qc) });
}

export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpdateAppointmentInput & { id: string }) =>
      appointmentsApi.update(id, input),
    onSuccess: () => invalidateBookings(qc),
  });
}

/* -------- community -------- */

export const useArticles = (params: { q?: string; category?: string } = {}) =>
  useQuery({ queryKey: keys.articles(params), queryFn: () => communityApi.articles(params) });

export const useArticle = (id: string) =>
  useQuery({ queryKey: keys.article(id), queryFn: () => communityApi.article(id) });

export function useCreateArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: communityApi.createArticle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['articles'] }),
  });
}

export const useQuestions = (params: { q?: string; tag?: string } = {}) =>
  useQuery({ queryKey: keys.questions(params), queryFn: () => communityApi.questions(params) });

export const useQuestion = (id: string) =>
  useQuery({ queryKey: keys.question(id), queryFn: () => communityApi.question(id) });

export function useAskQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: communityApi.ask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['questions'] }),
  });
}

export function useAnswerQuestion(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => communityApi.answer(id, { body }),
    onSuccess: (question) => {
      qc.setQueryData(keys.question(id), question);
      qc.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

/* -------- pharmacy -------- */

export const useProducts = (params: { q?: string; category?: ProductCategory } = {}) =>
  useQuery({ queryKey: keys.products(params), queryFn: () => shopApi.products(params) });

export const useProduct = (id: string) =>
  useQuery({ queryKey: keys.product(id), queryFn: () => shopApi.product(id) });

export const useOrders = () => useQuery({ queryKey: keys.orders, queryFn: shopApi.orders });

export const useOrder = (id: string) =>
  useQuery({ queryKey: keys.order(id), queryFn: () => shopApi.order(id) });

export function useConfirmOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: shopApi.confirmOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.orders });
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

/* -------- symptom checker -------- */

export const usePredict = () => useMutation({ mutationFn: healthApi.predict });
