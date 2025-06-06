// Domain models and types
export * from './domain';

// Repository interfaces
export * from './repositories';

// Configuration
export * from './config';

// Firebase implementation
export * from './firebase';

// Convenience exports for common use cases
export {
    createFirebaseRepositories, getFirebaseProjectInfo, runFirebaseDiagnostics, type DiagnosticResult
} from './firebase/factory';

export {
    FirebaseAppManager
} from './firebase/app-manager';

export {
    type ICourseRepository,
    type IRepositoryFactory
} from './repositories/interfaces';

export {
    type Course, type CourseQueryOptions, type CourseSearchCriteria, type CreateCourseData, type OperationResult, type QueryResult, type UpdateCourseData
} from './domain/models';

export {
    createDataConfig,
    validateFirebaseConfig, type DataConfig, type EnvironmentConfig, type FirebaseConfig
} from './config';

