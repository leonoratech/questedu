#!/usr/bin/env node

/**
 * Firebase Collections Setup Script for QuestEdu Admin
 * 
 * This script initializes Firebase Firestore with the complete data schema
 * and creates sample data for development and testing
 */

import { getApps, initializeApp } from 'firebase/app'
import {
  doc,
  getFirestore,
  serverTimestamp,
  setDoc
} from 'firebase/firestore'
import {
  CourseLevel,
  CourseStatus,
  MaterialType,
  UserRole
} from '../data/models/data-model'

// Firebase configuration (use environment variables in production)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
}

// Initialize Firebase
let app
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

const db = getFirestore(app)

// Collection names - centralized configuration
export const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses', 
  COURSE_TOPICS: 'course_topics',
  COURSE_ENROLLMENTS: 'course_enrollments',
  QUIZZES: 'quizzes',
  QUIZ_SUBMISSIONS: 'quiz_submissions',
  ASSIGNMENTS: 'assignments',
  ASSIGNMENT_SUBMISSIONS: 'assignment_submissions',
  NOTIFICATIONS: 'notifications',
  PAYMENTS: 'payments',
  SUBSCRIPTIONS: 'subscriptions',
  COURSE_ANALYTICS: 'course_analytics',
  USER_ANALYTICS: 'user_analytics',
  SYSTEM_SETTINGS: 'system_settings',
  AUDIT_LOGS: 'audit_logs'
} as const

/**
 * Sample data generators
 */
class SampleDataGenerator {
  
  static generateUsers() {
    const timestamp = serverTimestamp()
    
    return [
      {
        email: 'admin@questedu.com',
        firstName: 'Admin',
        lastName: 'User',
        displayName: 'Admin User',
        role: UserRole.ADMIN,
        department: 'Administration',
        bio: 'System administrator for QuestEdu platform',
        isActive: true,
        isEmailVerified: true,
        preferences: {
          language: 'en',
          theme: 'light',
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            courseUpdates: true,
            assignments: true,
            grades: true,
            announcements: true
          },
          privacy: {
            profileVisibility: 'private',
            showEmail: false,
            showPhoneNumber: false,
            allowMessaging: false
          }
        },
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        email: 'john.instructor@questedu.com',
        firstName: 'John',
        lastName: 'Instructor',
        displayName: 'Dr. John Instructor',
        role: UserRole.INSTRUCTOR,
        department: 'Computer Science',
        bio: 'Experienced software engineer and educator with 10+ years in the industry',
        expertise: ['JavaScript', 'React', 'Node.js', 'Python', 'Machine Learning'],
        isActive: true,
        isEmailVerified: true,
        preferences: {
          language: 'en',
          theme: 'dark',
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            courseUpdates: true,
            assignments: true,
            grades: true,
            announcements: true
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: true,
            showPhoneNumber: false,
            allowMessaging: true
          }
        },
        socialLinks: {
          linkedin: 'https://linkedin.com/in/johninstructor',
          github: 'https://github.com/johninstructor',
          website: 'https://johninstructor.dev'
        },
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        email: 'jane.student@questedu.com',
        firstName: 'Jane',
        lastName: 'Student',
        displayName: 'Jane Student',
        role: UserRole.STUDENT,
        bio: 'Aspiring full-stack developer, passionate about learning new technologies',
        isActive: true,
        isEmailVerified: true,
        preferences: {
          language: 'en',
          theme: 'auto',
          notifications: {
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            courseUpdates: true,
            assignments: true,
            grades: true,
            announcements: false
          },
          privacy: {
            profileVisibility: 'instructors_only',
            showEmail: false,
            showPhoneNumber: false,
            allowMessaging: true
          }
        },
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]
  }

  static generateCourses() {
    const timestamp = serverTimestamp()
    
    return [
      {
        title: 'Complete React Developer Course',
        description: 'Master React from basics to advanced concepts. Build real-world projects and learn modern React patterns.',
        instructor: 'Dr. John Instructor',
        instructorId: 'instructor_1', // This should match actual user ID
        category: 'Programming',
        subcategory: 'Frontend Development',
        level: CourseLevel.INTERMEDIATE,
        price: 99.99,
        currency: 'USD',
        originalPrice: 149.99,
        duration: '40 hours',
        status: CourseStatus.PUBLISHED,
        isPublished: true,
        featured: true,
        rating: 4.8,
        ratingCount: 156,
        enrollmentCount: 1247,
        completionCount: 892,
        tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
        skills: ['React Hooks', 'State Management', 'Component Design', 'Testing'],
        prerequisites: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals'],
        whatYouWillLearn: [
          'Build modern React applications',
          'Master React Hooks and Context API',
          'Implement state management with Redux',
          'Create responsive user interfaces',
          'Test React components'
        ],
        targetAudience: [
          'JavaScript developers wanting to learn React',
          'Frontend developers seeking to advance their skills',
          'Students pursuing web development careers'
        ],
        courseImage: 'https://example.com/images/react-course.jpg',
        language: 'English',
        subtitles: ['English', 'Spanish'],
        certificates: true,
        lifetimeAccess: true,
        mobileAccess: true,
        downloadableResources: true,
        assignmentsCount: 8,
        articlesCount: 12,
        videosCount: 45,
        totalVideoLength: 2400, // 40 hours in minutes
        publishedAt: new Date('2024-01-15'),
        lastModifiedBy: 'instructor_1',
        seoTitle: 'Complete React Developer Course - Learn React from Scratch',
        seoDescription: 'Master React development with our comprehensive course. Build real projects and learn industry best practices.',
        seoKeywords: ['react course', 'javascript', 'frontend development', 'web development'],
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        title: 'Python for Data Science',
        description: 'Learn Python programming specifically for data science applications. Master pandas, numpy, and machine learning basics.',
        instructor: 'Dr. John Instructor',
        instructorId: 'instructor_1',
        category: 'Data Science',
        subcategory: 'Python',
        level: CourseLevel.BEGINNER,
        price: 79.99,
        currency: 'USD',
        duration: '30 hours',
        status: CourseStatus.PUBLISHED,
        isPublished: true,
        featured: false,
        rating: 4.6,
        ratingCount: 89,
        enrollmentCount: 543,
        completionCount: 387,
        tags: ['Python', 'Data Science', 'Machine Learning', 'Analytics'],
        skills: ['Python Programming', 'Data Analysis', 'Pandas', 'NumPy', 'Matplotlib'],
        prerequisites: ['Basic programming knowledge helpful but not required'],
        whatYouWillLearn: [
          'Python programming fundamentals',
          'Data manipulation with pandas',
          'Data visualization with matplotlib',
          'Introduction to machine learning',
          'Statistical analysis with Python'
        ],
        targetAudience: [
          'Beginners wanting to learn data science',
          'Business analysts seeking technical skills',
          'Students interested in data careers'
        ],
        courseImage: 'https://example.com/images/python-data-science.jpg',
        language: 'English',
        subtitles: ['English'],
        certificates: true,
        lifetimeAccess: true,
        mobileAccess: true,
        downloadableResources: true,
        assignmentsCount: 6,
        articlesCount: 8,
        videosCount: 32,
        totalVideoLength: 1800, // 30 hours in minutes
        publishedAt: new Date('2024-02-01'),
        lastModifiedBy: 'instructor_1',
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]
  }

  static generateCourseTopics() {
    const timestamp = serverTimestamp()
    
    return [
      {
        courseId: 'course_1', // This should match actual course ID
        title: 'Introduction to React',
        description: 'Learn the basics of React and why it\'s popular for building user interfaces.',
        order: 1,
        duration: 45,
        videoUrl: 'https://example.com/videos/react-intro.mp4',
        videoLength: 45,
        materials: [
          {
            id: 'material_1',
            type: MaterialType.PDF,
            title: 'React Fundamentals Cheat Sheet',
            url: 'https://example.com/materials/react-cheat-sheet.pdf',
            description: 'Quick reference for React concepts',
            downloadable: true,
            order: 1
          },
          {
            id: 'material_2',
            type: MaterialType.LINK,
            title: 'Official React Documentation',
            url: 'https://reactjs.org/docs',
            description: 'Official React documentation',
            downloadable: false,
            order: 2
          }
        ],
        isPublished: true,
        isFree: true,
        prerequisites: [],
        learningObjectives: [
          'Understand what React is and why it\'s useful',
          'Set up a React development environment',
          'Create your first React component'
        ],
        summary: 'This lesson introduces React and covers the basic concepts you need to get started.',
        completionRate: 95.2,
        averageWatchTime: 42,
        viewCount: 1187,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        courseId: 'course_1',
        title: 'JSX and Components',
        description: 'Deep dive into JSX syntax and creating reusable React components.',
        order: 2,
        duration: 60,
        videoUrl: 'https://example.com/videos/jsx-components.mp4',
        videoLength: 60,
        materials: [
          {
            id: 'material_3',
            type: MaterialType.PDF,
            title: 'JSX Best Practices',
            url: 'https://example.com/materials/jsx-best-practices.pdf',
            description: 'Guidelines for writing clean JSX code',
            downloadable: true,
            order: 1
          }
        ],
        isPublished: true,
        isFree: false,
        prerequisites: ['topic_1'],
        learningObjectives: [
          'Master JSX syntax and rules',
          'Create functional and class components',
          'Pass and use props effectively'
        ],
        completionRate: 87.3,
        averageWatchTime: 55,
        viewCount: 1034,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]
  }

  static generateSystemSettings() {
    const timestamp = serverTimestamp()
    
    return [
      {
        key: 'platform_name',
        value: 'QuestEdu Admin',
        description: 'Name of the educational platform',
        type: 'string',
        category: 'general',
        isPublic: true,
        lastModifiedBy: 'admin',
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        key: 'max_file_upload_size',
        value: 50,
        description: 'Maximum file upload size in MB',
        type: 'number',
        category: 'uploads',
        isPublic: false,
        lastModifiedBy: 'admin',
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        key: 'supported_video_formats',
        value: ['mp4', 'webm', 'mov'],
        description: 'Supported video file formats',
        type: 'array',
        category: 'uploads',
        isPublic: false,
        lastModifiedBy: 'admin',
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        key: 'email_notifications_enabled',
        value: true,
        description: 'Whether email notifications are enabled globally',
        type: 'boolean',
        category: 'notifications',
        isPublic: false,
        lastModifiedBy: 'admin',
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ]
  }
}

/**
 * Collection setup functions
 */
class CollectionSetup {
  
  static async setupUsers() {
    console.log('🔄 Setting up users collection...')
    const users = SampleDataGenerator.generateUsers()
    
    for (const [index, user] of users.entries()) {
      const docId = `user_${index + 1}`
      await setDoc(doc(db, COLLECTIONS.USERS, docId), user)
      console.log(`✅ Created user: ${user.email}`)
    }
    
    console.log(`✅ Users collection setup complete (${users.length} users)`)
  }

  static async setupCourses() {
    console.log('🔄 Setting up courses collection...')
    const courses = SampleDataGenerator.generateCourses()
    
    for (const [index, course] of courses.entries()) {
      const docId = `course_${index + 1}`
      await setDoc(doc(db, COLLECTIONS.COURSES, docId), course)
      console.log(`✅ Created course: ${course.title}`)
    }
    
    console.log(`✅ Courses collection setup complete (${courses.length} courses)`)
  }

  static async setupCourseTopics() {
    console.log('🔄 Setting up course topics collection...')
    const topics = SampleDataGenerator.generateCourseTopics()
    
    for (const [index, topic] of topics.entries()) {
      const docId = `topic_${index + 1}`
      await setDoc(doc(db, COLLECTIONS.COURSE_TOPICS, docId), topic)
      console.log(`✅ Created topic: ${topic.title}`)
    }
    
    console.log(`✅ Course topics collection setup complete (${topics.length} topics)`)
  }

  static async setupSystemSettings() {
    console.log('🔄 Setting up system settings collection...')
    const settings = SampleDataGenerator.generateSystemSettings()
    
    for (const setting of settings) {
      await setDoc(doc(db, COLLECTIONS.SYSTEM_SETTINGS, setting.key), setting)
      console.log(`✅ Created setting: ${setting.key}`)
    }
    
    console.log(`✅ System settings collection setup complete (${settings.length} settings)`)
  }

  static async createIndexes() {
    console.log('📊 Note: Firestore indexes need to be created via Firebase Console or firebase CLI')
    console.log('📋 Required composite indexes:')
    console.log('   - course_topics: courseId (asc) + order (asc)')
    console.log('   - course_enrollments: userId (asc) + status (asc)')
    console.log('   - notifications: userId (asc) + createdAt (desc)')
    console.log('   - payments: userId (asc) + createdAt (desc)')
    console.log('   - audit_logs: userId (asc) + timestamp (desc)')
  }

  static async createSecurityRules() {
    console.log('🔒 Note: Firestore security rules should be deployed via firebase CLI')
    console.log('📋 Security rules are defined in firestore.rules')
  }
}

/**
 * Main setup function
 */
async function setupFirebaseCollections() {
  console.log('🚀 Starting Firebase Collections Setup for QuestEdu Admin')
  console.log('=' .repeat(60))
  
  try {
    // Setup core collections with sample data
    await CollectionSetup.setupUsers()
    await CollectionSetup.setupCourses()
    await CollectionSetup.setupCourseTopics()
    await CollectionSetup.setupSystemSettings()
    
    // Provide instructions for additional setup
    await CollectionSetup.createIndexes()
    await CollectionSetup.createSecurityRules()
    
    console.log('=' .repeat(60))
    console.log('✅ Firebase Collections Setup Complete!')
    console.log('')
    console.log('📝 Next Steps:')
    console.log('   1. Deploy Firestore indexes: npm run deploy-firebase')
    console.log('   2. Deploy security rules: firebase deploy --only firestore:rules')
    console.log('   3. Verify collections in Firebase Console')
    console.log('   4. Test API endpoints with sample data')
    console.log('')
    console.log('🔗 Collections created:')
    Object.values(COLLECTIONS).forEach(collection => {
      console.log(`   - ${collection}`)
    })
    
  } catch (error) {
    console.error('❌ Error setting up Firebase collections:', error)
    process.exit(1)
  }
}

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'setup':
      setupFirebaseCollections()
      break
    case 'users':
      CollectionSetup.setupUsers()
      break
    case 'courses':
      CollectionSetup.setupCourses()
      break
    case 'topics':
      CollectionSetup.setupCourseTopics()
      break
    case 'settings':
      CollectionSetup.setupSystemSettings()
      break
    default:
      console.log('Firebase Collections Setup Script')
      console.log('')
      console.log('Usage:')
      console.log('  node setup-collections.js setup     # Setup all collections')
      console.log('  node setup-collections.js users     # Setup users only')
      console.log('  node setup-collections.js courses   # Setup courses only')
      console.log('  node setup-collections.js topics    # Setup topics only')
      console.log('  node setup-collections.js settings  # Setup settings only')
      break
  }
}

export { CollectionSetup, SampleDataGenerator, setupFirebaseCollections }

