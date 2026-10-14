import { DEMO_DOCTOR_EMAIL, DEMO_PASSWORD, DEMO_PATIENT_EMAIL, type Role } from '@baymax/shared';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { toast } from '@/components/ui';
import { authApi } from '@/lib/api/endpoints';
import { errorMessage } from '@/lib/api/errors';
import { useAuth } from '@/stores/auth';

/** One-tap sign in with the seeded demo accounts. */
export function useDemoSignIn() {
  const signIn = useAuth((s) => s.signIn);
  return useMutation({
    mutationFn: (role: Role) =>
      authApi.login({
        email: role === 'doctor' ? DEMO_DOCTOR_EMAIL : DEMO_PATIENT_EMAIL,
        password: DEMO_PASSWORD,
      }),
    onSuccess: ({ token, user }) => {
      signIn(token, user);
      router.replace('/home');
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
