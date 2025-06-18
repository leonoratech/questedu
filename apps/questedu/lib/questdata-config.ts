import { getProjectInfo, runFirebaseDiagnostics } from './firebase-config';
import { firebaseCourseService } from './firebase-course-service';

/**
 * Get the course repository (for backward compatibility)
 */
export function getCourseRepository() {
  return firebaseCourseService;
}

/**
 * Run Firebase diagnostics
 */
export { getProjectInfo as getFirebaseProjectInfo, runFirebaseDiagnostics };
