import { EnvironmentConfig, FirebaseConfig } from '../config';
import { IRepositoryFactory } from '../repositories';
import { FirebaseAppManager } from './app-manager';
import { FirebaseCourseRepository } from './course-repository';

/**
 * Firebase implementation of the repository factory
 */
export class FirebaseRepositoryFactory implements IRepositoryFactory {
  public readonly courseRepository: FirebaseCourseRepository;

  constructor() {
    this.courseRepository = new FirebaseCourseRepository();
  }
}

/**
 * Create and configure Firebase repositories
 */
export function createFirebaseRepositories(
  config: FirebaseConfig,
  envConfig?: EnvironmentConfig
): IRepositoryFactory {
  // Initialize Firebase app manager
  const appManager = FirebaseAppManager.getInstance();
  appManager.initialize(config, envConfig);

  // Return repository factory
  return new FirebaseRepositoryFactory();
}

/**
 * Diagnostic utilities for Firebase
 */
export interface DiagnosticResult {
  test: string;
  success: boolean;
  error?: any;
  message: string;
}

/**
 * Run Firebase connection diagnostics
 */
export async function runFirebaseDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];
  const appManager = FirebaseAppManager.getInstance();

  try {
    // Test 1: Check if Firebase is initialized
    if (appManager.isInitialized()) {
      results.push({
        test: 'Firebase Initialization',
        success: true,
        message: 'Firebase app and Firestore initialized successfully'
      });
    } else {
      results.push({
        test: 'Firebase Initialization',
        success: false,
        message: 'Firebase not initialized'
      });
      return results;
    }

    // Test 2: Test repository creation
    try {
      const factory = new FirebaseRepositoryFactory();
      results.push({
        test: 'Repository Creation',
        success: true,
        message: 'Repository factory created successfully'
      });

      // Test 3: Test basic read operation
      try {
        const queryResult = await factory.courseRepository.getAll({ limit: 1 });
        results.push({
          test: 'Database Read',
          success: true,
          message: `Read operation successful. Found ${queryResult.total} courses.`
        });
      } catch (error: any) {
        results.push({
          test: 'Database Read',
          success: false,
          error,
          message: `Read operation failed: ${error?.code || error?.message || 'Unknown error'}`
        });
      }

    } catch (error: any) {
      results.push({
        test: 'Repository Creation',
        success: false,
        error,
        message: `Repository creation failed: ${error?.message || 'Unknown error'}`
      });
    }

  } catch (error: any) {
    results.push({
      test: 'Firebase Initialization',
      success: false,
      error,
      message: `Firebase initialization check failed: ${error?.message || 'Unknown error'}`
    });
  }

  return results;
}

/**
 * Get Firebase project information
 */
export function getFirebaseProjectInfo() {
  try {
    const appManager = FirebaseAppManager.getInstance();
    if (!appManager.isInitialized()) {
      return {
        success: false,
        message: 'Firebase not initialized'
      };
    }

    const config = appManager.getConfig();
    return {
      success: true,
      config: {
        projectId: config.firebase.projectId,
        authDomain: config.firebase.authDomain,
        apiKey: config.firebase.apiKey ? '***' + config.firebase.apiKey.slice(-4) : 'Not set',
        environment: config.environment
      },
      message: 'Firebase configuration loaded successfully'
    };
  } catch (error) {
    return {
      success: false,
      error,
      message: `Failed to load Firebase configuration: ${error}`
    };
  }
}
