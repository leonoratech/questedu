import { SubjectManager } from '@/components/SubjectManager';
import { useAuth } from '@/contexts/AuthContext';

export default function SubjectsPage() {
  const { userProfile } = useAuth();
  if (!userProfile?.collegeId) return null;
  return <SubjectManager collegeId={userProfile.collegeId} />;
}
