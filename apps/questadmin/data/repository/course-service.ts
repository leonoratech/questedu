/**
 * Server-side Course Repository
 * Handles all Firebase operations for courses on the server
 */

import { Course, CourseSearchFilters, CourseStats, CreateCourseRequest } from '@/data/models/course';
import { adminDb } from '@/data/repository/firebase-admin';
import { BaseRepository } from './base-service';

const COURSE_COLLECTION = 'courses';

export class CourseRepository extends BaseRepository<Course> {
    constructor() {
        super(COURSE_COLLECTION);
    }

    async createCourse(data: CreateCourseRequest): Promise<string> {
        // TODO: Fetch instructor name from user repository
        const instructor = 'Unknown Instructor' // Placeholder until we fetch from user service
        
        const courseData: Course = {
            ...data,
            id: '', // Will be set by Firestore
            instructor,
            enrollmentCount: 0,
            isPublished: data.status === 'published' || false,
            featured: data.featured || false,
            status: data.status || 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const docRef = await adminDb.collection(COURSE_COLLECTION).add(courseData)
        return docRef.id
    }

    async searchCourses(filters: CourseSearchFilters): Promise<Course[]> {
        try {
            let coursesQuery: FirebaseFirestore.Query = adminDb.collection(COURSE_COLLECTION);

            // Apply filters
            if (filters.instructorId) {
                coursesQuery = coursesQuery.where('instructorId', '==', filters.instructorId);
            }

            if (filters.category) {
                coursesQuery = coursesQuery.where('category', '==', filters.category);
            }

            if (filters.level) {
                coursesQuery = coursesQuery.where('level', '==', filters.level);
            }

            if (filters.status) {
                coursesQuery = coursesQuery.where('status', '==', filters.status);
            }

            if (filters.featured !== undefined) {
                coursesQuery = coursesQuery.where('featured', '==', filters.featured);
            }

            // Apply ordering (default by creation date)
            coursesQuery = coursesQuery.orderBy('createdAt', 'desc');

            // Apply limit if specified
            if (filters.limit) {
                coursesQuery = coursesQuery.limit(filters.limit);
            }

            const querySnapshot = await coursesQuery.get();
            let courses = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Course;
            });

            // Apply text search filter in memory (to avoid composite index requirements)
            if (filters.search && filters.search.trim()) {
                const searchLower = filters.search.toLowerCase().trim();
                courses = courses.filter(course => {
                    const title = (course.title || '').toLowerCase();
                    const description = (course.description || '').toLowerCase();
                    const instructor = (course.instructor || '').toLowerCase();
                    const category = (course.category || '').toLowerCase();
                    
                    return title.includes(searchLower) ||
                           description.includes(searchLower) ||
                           instructor.includes(searchLower) ||
                           category.includes(searchLower);
                });
            }

            return courses;
        } catch (error) {
            console.error('Error searching courses:', error);
            throw new Error('Failed to search courses');
        }
    }

    async getCoursesByInstructor(instructorId: string, published?: boolean): Promise<Course[]> {
        try {
            let coursesQuery = adminDb.collection(COURSE_COLLECTION)
                .where('instructorId', '==', instructorId);

            if (published !== undefined) {
                coursesQuery = coursesQuery.where('isPublished', '==', published);
            }

            coursesQuery = coursesQuery.orderBy('createdAt', 'desc');

            const querySnapshot = await coursesQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Course;
            });
        } catch (error) {
            console.error('Error fetching courses by instructor:', error);
            throw new Error('Failed to fetch courses by instructor');
        }
    }

    async getPublishedCourses(limit?: number): Promise<Course[]> {
        try {
            let coursesQuery = adminDb.collection(COURSE_COLLECTION)
                .where('status', '==', 'published')
                .where('isPublished', '==', true)
                .orderBy('createdAt', 'desc');

            if (limit) {
                coursesQuery = coursesQuery.limit(limit);
            }

            const querySnapshot = await coursesQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Course;
            });
        } catch (error) {
            console.error('Error fetching published courses:', error);
            throw new Error('Failed to fetch published courses');
        }
    }

    async getFeaturedCourses(limit?: number): Promise<Course[]> {
        try {
            let coursesQuery = adminDb.collection(COURSE_COLLECTION)
                .where('featured', '==', true)
                .where('status', '==', 'published')
                .orderBy('createdAt', 'desc');

            if (limit) {
                coursesQuery = coursesQuery.limit(limit);
            }

            const querySnapshot = await coursesQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Course;
            });
        } catch (error) {
            console.error('Error fetching featured courses:', error);
            throw new Error('Failed to fetch featured courses');
        }
    }

    async getCoursesByCategory(category: string, limit?: number): Promise<Course[]> {
        try {
            let coursesQuery = adminDb.collection(COURSE_COLLECTION)
                .where('category', '==', category)
                .where('status', '==', 'published')
                .orderBy('createdAt', 'desc');

            if (limit) {
                coursesQuery = coursesQuery.limit(limit);
            }

            const querySnapshot = await coursesQuery.get();
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.() || data.updatedAt,
                } as Course;
            });
        } catch (error) {
            console.error('Error fetching courses by category:', error);
            throw new Error('Failed to fetch courses by category');
        }
    }

    async getCourseStats(): Promise<CourseStats> {
        try {
            const coursesSnapshot = await adminDb.collection(COURSE_COLLECTION).get();
            
            const stats: CourseStats = {
                totalCourses: 0,
                publishedCourses: 0,
                draftCourses: 0,
                archivedCourses: 0,
                totalEnrollments: 0,
                averageRating: 0,
                coursesByCategory: {},
                coursesByLevel: {}
            };

            let totalRating = 0;
            let ratedCoursesCount = 0;

            coursesSnapshot.docs.forEach(doc => {
                const data = doc.data() as Course;
                stats.totalCourses++;

                // Count by status
                if (data.status === 'published') {
                    stats.publishedCourses++;
                } else if (data.status === 'draft') {
                    stats.draftCourses++;
                } else if (data.status === 'archived') {
                    stats.archivedCourses++;
                }

                // Count enrollments
                if (data.enrollmentCount) {
                    stats.totalEnrollments += data.enrollmentCount;
                }

                // Calculate average rating
                if (data.rating && data.ratingCount && data.ratingCount > 0) {
                    totalRating += data.rating * data.ratingCount;
                    ratedCoursesCount += data.ratingCount;
                }

                // Count by category
                if (data.category) {
                    stats.coursesByCategory[data.category] = (stats.coursesByCategory[data.category] || 0) + 1;
                }

                // Count by level
                if (data.level) {
                    stats.coursesByLevel[data.level] = (stats.coursesByLevel[data.level] || 0) + 1;
                }
            });

            // Calculate average rating
            if (ratedCoursesCount > 0) {
                stats.averageRating = totalRating / ratedCoursesCount;
            }

            return stats;
        } catch (error) {
            console.error('Error calculating course stats:', error);
            throw new Error('Failed to calculate course stats');
        }
    }

    async getCategories(): Promise<string[]> {
        try {
            const coursesSnapshot = await adminDb.collection(COURSE_COLLECTION).get();
            const categories = new Set<string>();

            coursesSnapshot.docs.forEach(doc => {
                const data = doc.data() as Course;
                if (data.category) {
                    categories.add(data.category);
                }
            });

            return Array.from(categories).sort();
        } catch (error) {
            console.error('Error fetching course categories:', error);
            throw new Error('Failed to fetch course categories');
        }
    }

    async duplicateCourse(courseId: string, newTitle: string, instructorId: string): Promise<Course> {
        try {
            const originalCourse = await this.getById(courseId);
            
            const duplicatedCourse = {
                ...originalCourse,
                title: newTitle,
                instructorId: instructorId,
                status: 'draft' as const,
                isPublished: false,
                enrollmentCount: 0,
                rating: 0,
                ratingCount: 0,
                featured: false
            };

            // Remove id and timestamps as they will be set by create method
            const { id, createdAt, updatedAt, ...courseData } = duplicatedCourse;

            return await this.create(courseData as Course);
        } catch (error) {
            console.error('Error duplicating course:', error);
            throw new Error('Failed to duplicate course');
        }
    }
}
