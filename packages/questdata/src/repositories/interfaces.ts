import {
    Course,
    CourseQueryOptions,
    CourseSearchCriteria,
    CreateCourseData,
    OperationResult,
    QueryResult,
    UpdateCourseData
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
}
