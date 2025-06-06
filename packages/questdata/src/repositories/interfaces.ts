import {
  Course,
  CourseOwnership,
  CourseQueryOptions,
  CourseSearchCriteria,
  CourseSubscription,
  CourseTopic,
  CreateCourseData,
  CreateUserData,
  DifficultyLevel,
  EssayAnswer,
  OperationResult,
  QueryResult,
  Question,
  QuestionBank,
  QuestionType,
  Quiz,
  QuizAttempt,
  UpdateCourseData,
  UpdateUserData,
  User,
  UserQueryOptions,
  UserSearchCriteria,
  UserStats
} from '../domain';

/**
 * Abstract repository interface for course operations
 * This defines the contract that all course repository implementations must follow
 */
export interface ICourseRepository {
  /**
   * Get all courses with optional query options
   */
  getAll(options?: CourseQueryOptions): Promise<QueryResult<Course>>;

  /**
   * Get a single course by ID
   */
  getById(id: string): Promise<Course | null>;

  /**
   * Search courses based on criteria
   */
  search(criteria: CourseSearchCriteria, options?: CourseQueryOptions): Promise<QueryResult<Course>>;

  /**
   * Get courses by category
   */
  getByCategory(category: string, options?: CourseQueryOptions): Promise<QueryResult<Course>>;

  /**
   * Create a new course
   */
  create(courseData: CreateCourseData): Promise<OperationResult<string>>;

  /**
   * Update an existing course
   */
  update(id: string, updateData: UpdateCourseData): Promise<OperationResult<void>>;

  /**
   * Delete a course
   */
  delete(id: string): Promise<OperationResult<void>>;

  /**
   * Subscribe to real-time changes for all courses
   */
  subscribeToChanges(callback: (courses: Course[]) => void): () => void;

  /**
   * Subscribe to real-time changes for a specific course
   */
  subscribeToSingle(id: string, callback: (course: Course | null) => void): () => void;
}

/**
 * Repository factory interface
 */
export interface IRepositoryFactory {
  courseRepository: ICourseRepository;
  userRepository: IUserRepository;
  courseOwnershipRepository: ICourseOwnershipRepository;
  courseSubscriptionRepository: ICourseSubscriptionRepository;
  courseTopicRepository: ICourseTopicRepository;
  questionRepository: IQuestionRepository;
  questionBankRepository: IQuestionBankRepository;
  quizRepository: IQuizRepository;
  quizAttemptRepository: IQuizAttemptRepository;
  essayAnswerRepository: IEssayAnswerRepository;
  userStatsRepository: IUserStatsRepository;
}

/**
 * User repository interface
 */
export interface IUserRepository {
  getAll(options?: UserQueryOptions): Promise<QueryResult<User>>;
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  search(criteria: UserSearchCriteria, options?: UserQueryOptions): Promise<QueryResult<User>>;
  getByRole(role: string, options?: UserQueryOptions): Promise<QueryResult<User>>;
  create(userData: CreateUserData): Promise<OperationResult<string>>;
  update(id: string, updateData: UpdateUserData): Promise<OperationResult<void>>;
  delete(id: string): Promise<OperationResult<void>>;
  updateLastLogin(id: string): Promise<OperationResult<void>>;
  subscribeToChanges(callback: (users: User[]) => void): () => void;
  subscribeToSingle(id: string, callback: (user: User | null) => void): () => void;
}

/**
 * Course ownership repository interface
 */
export interface ICourseOwnershipRepository {
  getAll(): Promise<QueryResult<CourseOwnership>>;
  getById(id: string): Promise<CourseOwnership | null>;
  getByCourseId(courseId: string): Promise<QueryResult<CourseOwnership>>;
  getByUserId(userId: string): Promise<QueryResult<CourseOwnership>>;
  create(ownership: Omit<CourseOwnership, 'id' | 'createdAt'>): Promise<OperationResult<string>>;
  update(id: string, updateData: Partial<CourseOwnership>): Promise<OperationResult<void>>;
  delete(id: string): Promise<OperationResult<void>>;
  transferOwnership(courseId: string, fromUserId: string, toUserId: string): Promise<OperationResult<void>>;
}

/**
 * Course subscription repository interface
 */
export interface ICourseSubscriptionRepository {
  getAll(): Promise<QueryResult<CourseSubscription>>;
  getById(id: string): Promise<CourseSubscription | null>;
  getByCourseId(courseId: string): Promise<QueryResult<CourseSubscription>>;
  getByUserId(userId: string): Promise<QueryResult<CourseSubscription>>;
  create(subscription: Omit<CourseSubscription, 'id'>): Promise<OperationResult<string>>;
  update(id: string, updateData: Partial<CourseSubscription>): Promise<OperationResult<void>>;
  delete(id: string): Promise<OperationResult<void>>;
  updateProgress(id: string, progress: number): Promise<OperationResult<void>>;
  markCompleted(id: string): Promise<OperationResult<void>>;
}

/**
 * Course topic repository interface
 */
export interface ICourseTopicRepository {
  getAll(): Promise<QueryResult<CourseTopic>>;
  getById(id: string): Promise<CourseTopic | null>;
  getByCourseId(courseId: string): Promise<QueryResult<CourseTopic>>;
  create(topic: Omit<CourseTopic, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<string>>;
  update(id: string, updateData: Partial<CourseTopic>): Promise<OperationResult<void>>;
  delete(id: string): Promise<OperationResult<void>>;
  reorderTopics(courseId: string, topicIds: string[]): Promise<OperationResult<void>>;
}

/**
 * Question repository interface
 */
export interface IQuestionRepository {
  getAll(): Promise<QueryResult<Question>>;
  getById(id: string): Promise<Question | null>;
  getByCourseId(courseId: string): Promise<QueryResult<Question>>;
  getByTopicId(topicId: string): Promise<QueryResult<Question>>;
  getByQuestionBankId(questionBankId: string): Promise<QueryResult<Question>>;
  getByType(type: QuestionType): Promise<QueryResult<Question>>;
  getByDifficulty(difficulty: DifficultyLevel): Promise<QueryResult<Question>>;
  create(question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<string>>;
  update(id: string, updateData: Partial<Question>): Promise<OperationResult<void>>;
  delete(id: string): Promise<OperationResult<void>>;
  incrementUsage(id: string): Promise<OperationResult<void>>;
  updateAverageScore(id: string, score: number): Promise<OperationResult<void>>;
}

/**
 * Question bank repository interface
 */
export interface IQuestionBankRepository {
  getAll(): Promise<QueryResult<QuestionBank>>;
  getById(id: string): Promise<QuestionBank | null>;
  getByCourseId(courseId: string): Promise<QueryResult<QuestionBank>>;
  getPublic(): Promise<QueryResult<QuestionBank>>;
  create(questionBank: Omit<QuestionBank, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<string>>;
  update(id: string, updateData: Partial<QuestionBank>): Promise<OperationResult<void>>;
  delete(id: string): Promise<OperationResult<void>>;
  updateQuestionStats(id: string): Promise<OperationResult<void>>;
}

/**
 * Quiz repository interface
 */
export interface IQuizRepository {
  getAll(): Promise<QueryResult<Quiz>>;
  getById(id: string): Promise<Quiz | null>;
  getByCourseId(courseId: string): Promise<QueryResult<Quiz>>;
  getByTopicId(topicId: string): Promise<QueryResult<Quiz>>;
  create(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<string>>;
  update(id: string, updateData: Partial<Quiz>): Promise<OperationResult<void>>;
  delete(id: string): Promise<OperationResult<void>>;
  publish(id: string): Promise<OperationResult<void>>;
  unpublish(id: string): Promise<OperationResult<void>>;
}

/**
 * Quiz attempt repository interface
 */
export interface IQuizAttemptRepository {
  getAll(): Promise<QueryResult<QuizAttempt>>;
  getById(id: string): Promise<QuizAttempt | null>;
  getByQuizId(quizId: string): Promise<QueryResult<QuizAttempt>>;
  getByUserId(userId: string): Promise<QueryResult<QuizAttempt>>;
  getByUserAndQuiz(userId: string, quizId: string): Promise<QueryResult<QuizAttempt>>;
  create(attempt: Omit<QuizAttempt, 'id' | 'createdAt'>): Promise<OperationResult<string>>;
  update(id: string, updateData: Partial<QuizAttempt>): Promise<OperationResult<void>>;
  complete(id: string, finalScore: number): Promise<OperationResult<void>>;
  delete(id: string): Promise<OperationResult<void>>;
}

/**
 * Essay answer repository interface
 */
export interface IEssayAnswerRepository {
  getAll(): Promise<QueryResult<EssayAnswer>>;
  getById(id: string): Promise<EssayAnswer | null>;
  getByQuestionId(questionId: string): Promise<QueryResult<EssayAnswer>>;
  getByUserId(userId: string): Promise<QueryResult<EssayAnswer>>;
  getByUserAndQuestion(userId: string, questionId: string): Promise<EssayAnswer | null>;
  create(answer: Omit<EssayAnswer, 'id' | 'createdAt' | 'updatedAt'>): Promise<OperationResult<string>>;
  update(id: string, updateData: Partial<EssayAnswer>): Promise<OperationResult<void>>;
  submit(id: string): Promise<OperationResult<void>>;
  grade(id: string, score: number, feedback?: any, gradedBy?: string): Promise<OperationResult<void>>;
  delete(id: string): Promise<OperationResult<void>>;
}

/**
 * User statistics repository interface
 */
export interface IUserStatsRepository {
  getById(userId: string): Promise<UserStats | null>;
  create(stats: UserStats): Promise<OperationResult<void>>;
  update(userId: string, updateData: Partial<UserStats>): Promise<OperationResult<void>>;
  incrementCoursesEnrolled(userId: string): Promise<OperationResult<void>>;
  incrementCoursesCompleted(userId: string): Promise<OperationResult<void>>;
  incrementCoursesCreated(userId: string): Promise<OperationResult<void>>;
  updateLearningHours(userId: string, hours: number): Promise<OperationResult<void>>;
  delete(userId: string): Promise<OperationResult<void>>;
}
