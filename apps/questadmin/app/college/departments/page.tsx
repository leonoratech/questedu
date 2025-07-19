import { DepartmentManager } from '@/components/DepartmentManager';
import { useAuth } from '@/contexts/AuthContext';

export default function DepartmentsPage() {
  const { userProfile } = useAuth();
  if (!userProfile?.collegeId) return null;
  return <DepartmentManager collegeId={userProfile.collegeId} />;
}
