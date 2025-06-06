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
    type ICourseOwnershipRepository, type ICourseRepository, type ICourseSubscriptionRepository,
    type ICourseTopicRepository, type IEssayAnswerRepository, type IQuestionBankRepository, type IQuestionRepository, type IQuizAttemptRepository, type IQuizRepository, type IRepositoryFactory, type IUserRepository, type IUserStatsRepository
} from './repositories/interfaces';

export {
    type Course, type CourseOwnership, type CourseQueryOptions,
    type CourseSearchCriteria, type CourseSubscription,
    type CourseTopic, type CreateCourseData, type CreateUserData, type DifficultyLevel, type EssayAnswer, type OperationResult,
    type QueryResult, type Question,
    type QuestionBank, type QuestionType, type Quiz,
    type QuizAttempt, type SubscriptionStatus, type UpdateCourseData, type UpdateUserData, type User, type UserQueryOptions, type UserRole, type UserSearchCriteria, type UserStats
} from './domain/models';

export {
    createDataConfig,
    validateFirebaseConfig,
    type DataConfig,
    type EnvironmentConfig,
    type FirebaseConfig
} from './config';

// Seed data generation
export {
    SeedDataGenerator
} from './seed/seed-data-generator';

// Seeding utilities
export {
    DEFAULT_SEED_CONFIG, seedDatabase,
    type SeedConfig
} from './scripts/seed-database';

