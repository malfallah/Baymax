import { DoctorHome } from '@/features/home/DoctorHome';
import { PatientHome } from '@/features/home/PatientHome';
import { useAuth } from '@/stores/auth';

export default function HomeTab() {
  const user = useAuth((s) => s.user);
  if (!user) return null;
  return user.role === 'doctor' ? <DoctorHome user={user} /> : <PatientHome user={user} />;
}
