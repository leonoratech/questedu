import { CourseManager } from '@/components/CourseManager';
import { useAuth } from '@/contexts/AuthContext';

export default function CoursesPage() {
  const { userProfile } = useAuth();
  if (!userProfile?.collegeId) return null;
  return <CourseManager collegeId={userProfile.collegeId} />;
}
