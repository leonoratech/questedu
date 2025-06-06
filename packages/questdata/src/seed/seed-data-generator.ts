import { Timestamp } from 'firebase/firestore';
import {
    Course,
    CourseOwnership,
    CourseSubscription,
    CourseTopic,
    DifficultyLevel,
    Question,
    QuestionBank,
    QuestionType,
    RichTextFormat,
    SubscriptionStatus,
    User,
    UserRole,
    UserStats
} from '../domain';

/**
 * Anonymous seed data generator for the questadmin app
 */
export class SeedDataGenerator {
    private static instance: SeedDataGenerator;
    
    public static getInstance(): SeedDataGenerator {
        if (!SeedDataGenerator.instance) {
            SeedDataGenerator.instance = new SeedDataGenerator();
        }
        return SeedDataGenerator.instance;
    }

    private getRandomDate(start: Date, end: Date): Timestamp {
        const startTime = start.getTime();
        const endTime = end.getTime();
        const randomTime = startTime + Math.random() * (endTime - startTime);
        return Timestamp.fromDate(new Date(randomTime));
    }

    private getRandomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    private getRandomElements<T>(array: T[], count: number): T[] {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    /**
     * Generate anonymous users
     */
    generateUsers(): User[] {
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        
        const users: User[] = [
            // Course Owners
            {
                id: 'user_001',
                email: 'instructor1@example.com',
                displayName: 'Dr. Sarah Johnson',
                photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face',
                role: UserRole.COURSE_OWNER,
                isActive: true,
                profileComplete: true,
                bio: 'Professor of Computer Science with 15 years of teaching experience. Passionate about making technology accessible to everyone.',
                expertise: ['Computer Science', 'Web Development', 'Data Structures', 'Algorithms'],
                location: 'San Francisco, CA',
                socialLinks: {
                    website: 'https://drsarahjohnson.edu',
                    linkedin: 'https://linkedin.com/in/drsarahjohnson',
                    twitter: 'https://twitter.com/drsarahjohnson'
                },
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now),
                lastLoginAt: this.getRandomDate(new Date(now.getTime() - 24 * 60 * 60 * 1000), now)
            },
            {
                id: 'user_002',
                email: 'instructor2@example.com',
                displayName: 'Prof. Michael Chen',
                photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                role: UserRole.COURSE_OWNER,
                isActive: true,
                profileComplete: true,
                bio: 'Data scientist and machine learning expert. Author of "Practical Machine Learning" and speaker at tech conferences worldwide.',
                expertise: ['Machine Learning', 'Data Science', 'Python', 'Statistics'],
                location: 'Seattle, WA',
                socialLinks: {
                    website: 'https://profmichaelchen.com',
                    linkedin: 'https://linkedin.com/in/profmichaelchen',
                    github: 'https://github.com/profmichaelchen'
                },
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now),
                lastLoginAt: this.getRandomDate(new Date(now.getTime() - 48 * 60 * 60 * 1000), now)
            },
            {
                id: 'user_003',
                email: 'instructor3@example.com',
                displayName: 'Dr. Emily Rodriguez',
                photoURL: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
                role: UserRole.COURSE_OWNER,
                isActive: true,
                profileComplete: true,
                bio: 'UX/UI design expert with a passion for creating beautiful and functional digital experiences. Former design lead at major tech companies.',
                expertise: ['UX Design', 'UI Design', 'Design Thinking', 'Figma', 'Adobe Creative Suite'],
                location: 'Austin, TX',
                socialLinks: {
                    website: 'https://emilyrodriguezdesign.com',
                    linkedin: 'https://linkedin.com/in/emilyrodriguezdesign'
                },
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now),
                lastLoginAt: this.getRandomDate(new Date(now.getTime() - 12 * 60 * 60 * 1000), now)
            },
            // Students
            {
                id: 'user_004',
                email: 'student1@example.com',
                displayName: 'Alex Thompson',
                photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                role: UserRole.STUDENT,
                isActive: true,
                profileComplete: true,
                bio: 'Software engineering student passionate about web development and open source contributions.',
                expertise: ['JavaScript', 'React', 'Node.js'],
                location: 'New York, NY',
                socialLinks: {
                    github: 'https://github.com/alexthompson',
                    linkedin: 'https://linkedin.com/in/alexthompson'
                },
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now),
                lastLoginAt: this.getRandomDate(new Date(now.getTime() - 6 * 60 * 60 * 1000), now)
            },
            {
                id: 'user_005',
                email: 'student2@example.com',
                displayName: 'Maria Garcia',
                photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
                role: UserRole.STUDENT,
                isActive: true,
                profileComplete: true,
                bio: 'Career changer transitioning from marketing to data science. Excited about the intersection of business and analytics.',
                expertise: ['Python', 'SQL', 'Data Analysis'],
                location: 'Chicago, IL',
                socialLinks: {
                    linkedin: 'https://linkedin.com/in/mariagarcia'
                },
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now),
                lastLoginAt: this.getRandomDate(new Date(now.getTime() - 2 * 60 * 60 * 1000), now)
            },
            {
                id: 'user_006',
                email: 'student3@example.com',
                displayName: 'David Kim',
                photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
                role: UserRole.STUDENT,
                isActive: true,
                profileComplete: false,
                bio: 'Recent computer science graduate looking to advance skills in full-stack development.',
                expertise: ['Java', 'Spring Boot', 'MySQL'],
                location: 'Los Angeles, CA',
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now),
                lastLoginAt: this.getRandomDate(new Date(now.getTime() - 24 * 60 * 60 * 1000), now)
            },
            // Admin
            {
                id: 'user_007',
                email: 'admin@example.com',
                displayName: 'System Administrator',
                photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
                role: UserRole.ADMIN,
                isActive: true,
                profileComplete: true,
                bio: 'Platform administrator ensuring smooth operation and quality education for all users.',
                expertise: ['System Administration', 'DevOps', 'Platform Management'],
                location: 'Remote',
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now),
                lastLoginAt: this.getRandomDate(new Date(now.getTime() - 1 * 60 * 60 * 1000), now)
            }
        ];

        return users;
    }

    /**
     * Generate anonymous courses
     */
    generateCourses(): Course[] {
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        const courses: Course[] = [
            {
                id: 'course_001',
                title: 'Complete Web Development Bootcamp',
                instructor: 'Dr. Sarah Johnson',
                progress: 0,
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
                category: 'Web Development',
                description: 'Master modern web development with HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and deploy them to the cloud.',
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now)
            },
            {
                id: 'course_002',
                title: 'Machine Learning Fundamentals',
                instructor: 'Prof. Michael Chen',
                progress: 0,
                image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
                category: 'Data Science',
                description: 'Learn the foundations of machine learning, including supervised and unsupervised learning, neural networks, and practical applications.',
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now)
            },
            {
                id: 'course_003',
                title: 'UX/UI Design Masterclass',
                instructor: 'Dr. Emily Rodriguez',
                progress: 0,
                image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
                category: 'Design',
                description: 'Create stunning user experiences and interfaces. Learn design principles, user research, prototyping, and industry-standard tools.',
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now)
            },
            {
                id: 'course_004',
                title: 'Advanced JavaScript & Modern Frameworks',
                instructor: 'Dr. Sarah Johnson',
                progress: 0,
                image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
                category: 'Programming',
                description: 'Deep dive into modern JavaScript, ES6+, React, Vue, and Angular. Build scalable applications with best practices.',
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now)
            },
            {
                id: 'course_005',
                title: 'Data Science with Python',
                instructor: 'Prof. Michael Chen',
                progress: 0,
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
                category: 'Data Science',
                description: 'Complete guide to data science using Python. Learn pandas, numpy, matplotlib, seaborn, and scikit-learn for data analysis and visualization.',
                createdAt: this.getRandomDate(oneYearAgo, now),
                updatedAt: this.getRandomDate(oneYearAgo, now)
            }
        ];

        return courses;
    }

    /**
     * Generate course topics for the courses
     */
    generateCourseTopics(): CourseTopic[] {
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const topics: CourseTopic[] = [
            // Web Development Course Topics
            {
                id: 'topic_001',
                courseId: 'course_001',
                title: 'HTML Fundamentals',
                description: 'Learn the building blocks of web pages with HTML5 semantic elements.',
                order: 1,
                duration: 120,
                videoUrl: 'https://example.com/videos/html-fundamentals',
                materials: [
                    {
                        type: 'pdf',
                        title: 'HTML5 Reference Guide',
                        url: 'https://example.com/materials/html5-guide.pdf',
                        description: 'Comprehensive reference for HTML5 elements and attributes'
                    }
                ],
                isPublished: true,
                learningObjectives: [
                    'Understand HTML document structure',
                    'Use semantic HTML5 elements',
                    'Create forms and input elements',
                    'Implement accessibility best practices'
                ],
                createdAt: this.getRandomDate(oneMonthAgo, now),
                updatedAt: this.getRandomDate(oneMonthAgo, now)
            },
            {
                id: 'topic_002',
                courseId: 'course_001',
                title: 'CSS Styling and Layout',
                description: 'Master CSS for beautiful and responsive web designs.',
                order: 2,
                duration: 150,
                videoUrl: 'https://example.com/videos/css-styling',
                materials: [
                    {
                        type: 'pdf',
                        title: 'CSS Grid and Flexbox Guide',
                        url: 'https://example.com/materials/css-layout.pdf'
                    }
                ],
                isPublished: true,
                prerequisites: ['topic_001'],
                learningObjectives: [
                    'Style elements with CSS',
                    'Create responsive layouts',
                    'Use CSS Grid and Flexbox',
                    'Implement animations and transitions'
                ],
                createdAt: this.getRandomDate(oneMonthAgo, now),
                updatedAt: this.getRandomDate(oneMonthAgo, now)
            },
            {
                id: 'topic_003',
                courseId: 'course_001',
                title: 'JavaScript Basics',
                description: 'Introduction to JavaScript programming and DOM manipulation.',
                order: 3,
                duration: 180,
                videoUrl: 'https://example.com/videos/js-basics',
                isPublished: true,
                prerequisites: ['topic_001', 'topic_002'],
                learningObjectives: [
                    'Understand JavaScript syntax',
                    'Manipulate the DOM',
                    'Handle events',
                    'Work with APIs'
                ],
                createdAt: this.getRandomDate(oneMonthAgo, now),
                updatedAt: this.getRandomDate(oneMonthAgo, now)
            },
            // Machine Learning Course Topics
            {
                id: 'topic_004',
                courseId: 'course_002',
                title: 'Introduction to Machine Learning',
                description: 'Overview of machine learning concepts and applications.',
                order: 1,
                duration: 90,
                videoUrl: 'https://example.com/videos/ml-intro',
                isPublished: true,
                learningObjectives: [
                    'Define machine learning',
                    'Distinguish between supervised and unsupervised learning',
                    'Identify real-world ML applications',
                    'Understand the ML workflow'
                ],
                createdAt: this.getRandomDate(oneMonthAgo, now),
                updatedAt: this.getRandomDate(oneMonthAgo, now)
            },
            {
                id: 'topic_005',
                courseId: 'course_002',
                title: 'Linear Regression',
                description: 'Learn linear regression for prediction and analysis.',
                order: 2,
                duration: 120,
                videoUrl: 'https://example.com/videos/linear-regression',
                isPublished: true,
                prerequisites: ['topic_004'],
                learningObjectives: [
                    'Implement linear regression',
                    'Evaluate model performance',
                    'Handle overfitting',
                    'Feature engineering basics'
                ],
                createdAt: this.getRandomDate(oneMonthAgo, now),
                updatedAt: this.getRandomDate(oneMonthAgo, now)
            }
        ];

        return topics;
    }

    /**
     * Generate question banks
     */
    generateQuestionBanks(): QuestionBank[] {
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const questionBanks: QuestionBank[] = [
            {
                id: 'qbank_001',
                courseId: 'course_001',
                name: 'Web Development Fundamentals',
                description: 'Questions covering HTML, CSS, and JavaScript basics',
                category: 'Fundamentals',
                tags: ['html', 'css', 'javascript', 'web-development'],
                isPublic: true,
                totalQuestions: 25,
                questionsByType: {
                    [QuestionType.MULTIPLE_CHOICE]: 15,
                    [QuestionType.TRUE_FALSE]: 5,
                    [QuestionType.SHORT_ANSWER]: 3,
                    [QuestionType.ESSAY]: 2
                },
                questionsByDifficulty: {
                    [DifficultyLevel.BEGINNER]: 10,
                    [DifficultyLevel.INTERMEDIATE]: 10,
                    [DifficultyLevel.ADVANCED]: 5
                },
                createdBy: 'user_001',
                createdAt: this.getRandomDate(oneMonthAgo, now),
                updatedAt: this.getRandomDate(oneMonthAgo, now)
            },
            {
                id: 'qbank_002',
                courseId: 'course_002',
                name: 'Machine Learning Concepts',
                description: 'Questions about ML algorithms and concepts',
                category: 'Theory',
                tags: ['machine-learning', 'algorithms', 'data-science'],
                isPublic: false,
                totalQuestions: 30,
                questionsByType: {
                    [QuestionType.MULTIPLE_CHOICE]: 20,
                    [QuestionType.TRUE_FALSE]: 5,
                    [QuestionType.ESSAY]: 5
                },
                questionsByDifficulty: {
                    [DifficultyLevel.BEGINNER]: 8,
                    [DifficultyLevel.INTERMEDIATE]: 12,
                    [DifficultyLevel.ADVANCED]: 8,
                    [DifficultyLevel.EXPERT]: 2
                },
                createdBy: 'user_002',
                createdAt: this.getRandomDate(oneMonthAgo, now),
                updatedAt: this.getRandomDate(oneMonthAgo, now)
            }
        ];

        return questionBanks;
    }

    /**
     * Generate questions
     */
    generateQuestions(): Question[] {
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const questions: Question[] = [
            {
                id: 'question_001',
                courseId: 'course_001',
                topicId: 'topic_001',
                questionBankId: 'qbank_001',
                type: QuestionType.MULTIPLE_CHOICE,
                difficulty: DifficultyLevel.BEGINNER,
                title: 'HTML Document Structure',
                question: 'Which HTML element represents the root of an HTML document?',
                points: 5,
                timeLimit: 60,
                options: [
                    {
                        id: 'opt_001',
                        text: '<html>',
                        isCorrect: true,
                        explanation: 'The <html> element is the root element of an HTML page.'
                    },
                    {
                        id: 'opt_002',
                        text: '<body>',
                        isCorrect: false,
                        explanation: 'The <body> element contains the visible page content.'
                    },
                    {
                        id: 'opt_003',
                        text: '<head>',
                        isCorrect: false,
                        explanation: 'The <head> element contains metadata about the document.'
                    },
                    {
                        id: 'opt_004',
                        text: '<document>',
                        isCorrect: false,
                        explanation: 'There is no <document> element in HTML.'
                    }
                ],
                hints: ['Think about the outermost element of an HTML document'],
                explanation: 'The <html> element is the root element that contains all other HTML elements.',
                tags: ['html', 'structure', 'elements'],
                timesUsed: 45,
                averageScore: 85.5,
                isActive: true,
                createdAt: this.getRandomDate(oneMonthAgo, now),
                updatedAt: this.getRandomDate(oneMonthAgo, now)
            },
            {
                id: 'question_002',
                courseId: 'course_001',
                topicId: 'topic_002',
                questionBankId: 'qbank_001',
                type: QuestionType.TRUE_FALSE,
                difficulty: DifficultyLevel.BEGINNER,
                title: 'CSS Box Model',
                question: 'In the CSS box model, padding is included in the element\'s width and height by default.',
                points: 3,
                timeLimit: 30,
                options: [
                    {
                        id: 'opt_005',
                        text: 'True',
                        isCorrect: false,
                        explanation: 'By default, padding and border are added to the width and height.'
                    },
                    {
                        id: 'opt_006',
                        text: 'False',
                        isCorrect: true,
                        explanation: 'Correct! Padding and border are added to the specified width and height unless box-sizing: border-box is used.'
                    }
                ],
                explanation: 'In the default CSS box model (content-box), padding and border are added to the specified width and height.',
                tags: ['css', 'box-model', 'layout'],
                timesUsed: 32,
                averageScore: 78.2,
                isActive: true,
                createdAt: this.getRandomDate(oneMonthAgo, now),
                updatedAt: this.getRandomDate(oneMonthAgo, now)
            },
            {
                id: 'question_003',
                courseId: 'course_001',
                topicId: 'topic_003',
                questionBankId: 'qbank_001',
                type: QuestionType.ESSAY,
                difficulty: DifficultyLevel.INTERMEDIATE,
                title: 'JavaScript Event Handling',
                question: 'Explain the difference between event bubbling and event capturing in JavaScript. Provide examples of when you might use each approach.',
                points: 15,
                timeLimit: 900, // 15 minutes
                essayConfig: {
                    allowRichText: true,
                    allowedFormats: [RichTextFormat.HTML, RichTextFormat.MARKDOWN, RichTextFormat.PLAIN_TEXT],
                    allowAttachments: true,
                    allowedAttachmentTypes: ['image', 'document'],
                    maxWordCount: 500,
                    minWordCount: 150,
                    maxFileSize: 5 * 1024 * 1024, // 5MB
                    maxAttachments: 2,
                    gradingRubric: {
                        id: 'rubric_001',
                        name: 'JavaScript Concepts Rubric',
                        criteria: [
                            {
                                id: 'crit_001',
                                name: 'Technical Accuracy',
                                description: 'Correct understanding of concepts',
                                maxPoints: 7,
                                levels: [
                                    { score: 7, description: 'Perfect understanding and explanation' },
                                    { score: 5, description: 'Good understanding with minor errors' },
                                    { score: 3, description: 'Basic understanding with some confusion' },
                                    { score: 1, description: 'Limited understanding' },
                                    { score: 0, description: 'No understanding demonstrated' }
                                ]
                            },
                            {
                                id: 'crit_002',
                                name: 'Examples and Application',
                                description: 'Quality of examples and practical application',
                                maxPoints: 5,
                                levels: [
                                    { score: 5, description: 'Excellent, relevant examples' },
                                    { score: 3, description: 'Good examples' },
                                    { score: 1, description: 'Basic examples' },
                                    { score: 0, description: 'No examples provided' }
                                ]
                            },
                            {
                                id: 'crit_003',
                                name: 'Communication',
                                description: 'Clarity and organization of response',
                                maxPoints: 3,
                                levels: [
                                    { score: 3, description: 'Very clear and well-organized' },
                                    { score: 2, description: 'Clear with good organization' },
                                    { score: 1, description: 'Somewhat clear' },
                                    { score: 0, description: 'Unclear or disorganized' }
                                ]
                            }
                        ]
                    }
                },
                hints: [
                    'Think about the direction events travel through the DOM',
                    'Consider preventDefault() and stopPropagation()',
                    'Think about performance implications'
                ],
                explanation: 'Event bubbling propagates from target to root, while capturing propagates from root to target. Understanding both is crucial for effective event handling.',
                tags: ['javascript', 'events', 'dom', 'advanced'],
                timesUsed: 18,
                averageScore: 82.1,
                isActive: true,
                createdAt: this.getRandomDate(oneMonthAgo, now),
                updatedAt: this.getRandomDate(oneMonthAgo, now)
            }
        ];

        return questions;
    }

    /**
     * Generate course ownership records
     */
    generateCourseOwnerships(): CourseOwnership[] {
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

        const ownerships: CourseOwnership[] = [
            {
                id: 'ownership_001',
                userId: 'user_001',
                courseId: 'course_001',
                isOwner: true,
                permissions: {
                    canEdit: true,
                    canDelete: true,
                    canPublish: true,
                    canViewAnalytics: true
                },
                createdAt: this.getRandomDate(oneMonthAgo, now)
            },
            {
                id: 'ownership_002',
                userId: 'user_001',
                courseId: 'course_004',
                isOwner: true,
                permissions: {
                    canEdit: true,
                    canDelete: true,
                    canPublish: true,
                    canViewAnalytics: true
                },
                createdAt: this.getRandomDate(oneMonthAgo, now)
            },
            {
                id: 'ownership_003',
                userId: 'user_002',
                courseId: 'course_002',
                isOwner: true,
                permissions: {
                    canEdit: true,
                    canDelete: true,
                    canPublish: true,
                    canViewAnalytics: true
                },
                createdAt: this.getRandomDate(oneMonthAgo, now)
            },
            {
                id: 'ownership_004',
                userId: 'user_002',
                courseId: 'course_005',
                isOwner: true,
                permissions: {
                    canEdit: true,
                    canDelete: true,
                    canPublish: true,
                    canViewAnalytics: true
                },
                createdAt: this.getRandomDate(oneMonthAgo, now)
            },
            {
                id: 'ownership_005',
                userId: 'user_003',
                courseId: 'course_003',
                isOwner: true,
                permissions: {
                    canEdit: true,
                    canDelete: true,
                    canPublish: true,
                    canViewAnalytics: true
                },
                createdAt: this.getRandomDate(oneMonthAgo, now)
            }
        ];

        return ownerships;
    }

    /**
     * Generate course subscriptions
     */
    generateCourseSubscriptions(): CourseSubscription[] {
        const now = new Date();
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        const subscriptions: CourseSubscription[] = [
            {
                id: 'subscription_001',
                userId: 'user_004',
                courseId: 'course_001',
                status: SubscriptionStatus.ACTIVE,
                enrolledAt: this.getRandomDate(oneMonthAgo, now),
                progress: 65,
                lastAccessedAt: this.getRandomDate(twoWeeksAgo, now),
                certificateIssued: false
            },
            {
                id: 'subscription_002',
                userId: 'user_004',
                courseId: 'course_002',
                status: SubscriptionStatus.ACTIVE,
                enrolledAt: this.getRandomDate(oneMonthAgo, now),
                progress: 25,
                lastAccessedAt: this.getRandomDate(twoWeeksAgo, now),
                certificateIssued: false
            },
            {
                id: 'subscription_003',
                userId: 'user_005',
                courseId: 'course_002',
                status: SubscriptionStatus.ACTIVE,
                enrolledAt: this.getRandomDate(oneMonthAgo, now),
                progress: 90,
                lastAccessedAt: this.getRandomDate(new Date(now.getTime() - 24 * 60 * 60 * 1000), now),
                certificateIssued: false
            },
            {
                id: 'subscription_004',
                userId: 'user_005',
                courseId: 'course_005',
                status: SubscriptionStatus.ACTIVE,
                enrolledAt: this.getRandomDate(oneMonthAgo, now),
                completedAt: this.getRandomDate(twoWeeksAgo, now),
                progress: 100,
                lastAccessedAt: this.getRandomDate(twoWeeksAgo, now),
                certificateIssued: true,
                certificateId: 'cert_001'
            },
            {
                id: 'subscription_005',
                userId: 'user_006',
                courseId: 'course_001',
                status: SubscriptionStatus.ACTIVE,
                enrolledAt: this.getRandomDate(oneMonthAgo, now),
                progress: 15,
                lastAccessedAt: this.getRandomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now),
                certificateIssued: false
            },
            {
                id: 'subscription_006',
                userId: 'user_006',
                courseId: 'course_003',
                status: SubscriptionStatus.ACTIVE,
                enrolledAt: this.getRandomDate(oneMonthAgo, now),
                progress: 45,
                lastAccessedAt: this.getRandomDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), now),
                certificateIssued: false
            }
        ];

        return subscriptions;
    }

    /**
     * Generate user statistics
     */
    generateUserStats(): UserStats[] {
        const now = new Date();

        const stats: UserStats[] = [
            {
                userId: 'user_001',
                coursesCreated: 2,
                totalStudents: 145,
                totalRevenue: 12500,
                averageRating: 4.8,
                updatedAt: Timestamp.fromDate(now)
            },
            {
                userId: 'user_002',
                coursesCreated: 2,
                totalStudents: 98,
                totalRevenue: 8900,
                averageRating: 4.7,
                updatedAt: Timestamp.fromDate(now)
            },
            {
                userId: 'user_003',
                coursesCreated: 1,
                totalStudents: 67,
                totalRevenue: 5800,
                averageRating: 4.9,
                updatedAt: Timestamp.fromDate(now)
            },
            {
                userId: 'user_004',
                coursesEnrolled: 2,
                coursesCompleted: 0,
                totalLearningHours: 15.5,
                certificatesEarned: 0,
                updatedAt: Timestamp.fromDate(now)
            },
            {
                userId: 'user_005',
                coursesEnrolled: 2,
                coursesCompleted: 1,
                totalLearningHours: 28.2,
                certificatesEarned: 1,
                updatedAt: Timestamp.fromDate(now)
            },
            {
                userId: 'user_006',
                coursesEnrolled: 2,
                coursesCompleted: 0,
                totalLearningHours: 8.3,
                certificatesEarned: 0,
                updatedAt: Timestamp.fromDate(now)
            }
        ];

        return stats;
    }

    /**
     * Generate all seed data
     */
    generateAllSeedData() {
        return {
            users: this.generateUsers(),
            courses: this.generateCourses(),
            courseTopics: this.generateCourseTopics(),
            questionBanks: this.generateQuestionBanks(),
            questions: this.generateQuestions(),
            courseOwnerships: this.generateCourseOwnerships(),
            courseSubscriptions: this.generateCourseSubscriptions(),
            userStats: this.generateUserStats()
        };
    }
}

export default SeedDataGenerator;
