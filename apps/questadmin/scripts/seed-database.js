#!/usr/bin/env node

/**
 * Database Seed Script for QuestAdmin
 * 
 * This script populates the database with comprehensive mock data including:
 * 0. Mock master data for colleges
 * 1. Mock users (superadmin, admin, students, instructors) 
 * 2. Mock courses against the instructors created
 * 3. Mock topics against the courses created
 * 4. Mock questions and answers for the courses created
 * 5. Mock student enrollments into the courses created
 * 6. Mock activities against all entities
 * 
 * Usage: node scripts/seed-database.js [--clear-first]
 */

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

// Remove client SDK imports
// const { initializeApp } = require('firebase/app');
// const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
// const { getFirestore, collection, doc, setDoc, addDoc, writeBatch, serverTimestamp, getDocs, query, where } = require('firebase/firestore');

// Import firebase-admin
let admin;
try {
  admin = require('firebase-admin');
} catch (error) {
  console.error('❌ Firebase Admin SDK not installed. Please run `npm install firebase-admin` in your questadmin directory.');
  process.exit(1);
}

// Load service account from environment variables (as in clear-database-auto.js)
let serviceAccount;
if (process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL && process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY) {
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    client_email: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
    private_key: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Will use application default credentials
  serviceAccount = null;
} else {
  console.error('❌ No service account credentials found in environment variables.');
  process.exit(1);
}

if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'questedu-cb2a4',
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'questedu-cb2a4',
    });
  }
}

const db = admin.firestore();
const auth = admin.auth();
const serverTimestamp = admin.firestore.FieldValue.serverTimestamp;
const writeBatch = (...args) => db.batch(...args);
const collection = (...args) => db.collection(...args);
const doc = (dbOrCollection, ...pathSegments) => {
  // If first argument is db, treat as db.collection(...).doc(...)
  if (typeof dbOrCollection.collection === 'function') {
    if (pathSegments.length === 2) {
      // e.g. doc(db, 'colleges', 'mit')
      return dbOrCollection.collection(pathSegments[0]).doc(pathSegments[1]);
    } else if (pathSegments.length === 1) {
      // e.g. doc(db, 'colleges')
      return dbOrCollection.collection(pathSegments[0]);
    } else {
      throw new Error('doc() expects db, collection, id or db, collection');
    }
  } else if (typeof dbOrCollection.doc === 'function') {
    // If first argument is a collection, treat as collection.doc(id)
    return dbOrCollection.doc(pathSegments[0]);
  } else {
    throw new Error('Invalid argument to doc()');
  }
};
const setDoc = (ref, data) => ref.set(data);
const addDoc = (coll, data) => coll.add(data);
const getDocs = async (coll) => (await coll.get()).docs;
const query = (...args) => { throw new Error('Use Firestore admin query chaining directly'); };
const where = (...args) => { throw new Error('Use Firestore admin query chaining directly'); };

// Track created data for relationships
const createdData = {
  colleges: [],
  programs: [],
  subjects: [],
  categories: [],
  difficulties: [],
  users: {
    superadmins: [],
    instructors: [],
    students: []
  },
  courses: [],
  topics: [],
  questions: [],
  enrollments: [],
  activities: [],
  collegeAdministrators: []
};

// ==================== MASTER DATA DEFINITIONS ====================

const COURSE_DIFFICULTIES = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'For those new to the subject with little to no prior experience',
    level: 1,
    color: '#22c55e',
    isActive: true,
    order: 1
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'For those with some foundational knowledge and experience',
    level: 2,
    color: '#f59e0b',
    isActive: true,
    order: 2
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'For experienced learners looking to deepen their expertise',
    level: 3,
    color: '#ef4444',
    isActive: true,
    order: 3
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'For professionals seeking mastery and specialization',
    level: 4,
    color: '#8b5cf6',
    isActive: true,
    order: 4
  }
];

// ==================== MOCK DATA DEFINITIONS ====================
// Only one college for the app
const MOCK_COLLEGES = [
  {
    id: 'govtjuniorcollege',
    name: 'Government Junior College',
    accreditation: 'BIE',
    affiliation: 'Board of Intermediate Education',
    address: {
      street: 'Board of Intermediate Education',
      city: 'Visakhapatnam',
      state: 'Andhra Pradesh',
      country: 'India',
      postalCode: '530001'
    },
    contact: {
      phone: '+91-0000000000',
      email: 'info@au.edu',
      website: 'https://web.auc.edu'
    },
    website: 'https://web.auc.edu',
    principalName: 'Vice Chancellor',
    description: '',
    isActive: true,
    isDefault: true // Mark as default
  }
];

// Departments for the single college
const MOCK_DEPARTMENTS = [
  { id: 'arts', name: 'Arts', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'seed-script' },
  { id: 'science', name: 'Science', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'seed-script' },
  { id: 'vocational', name: 'Vocational', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'seed-script' }
];

// Programs for each department
const MOCK_PROGRAMS = [
  { id: 'mpc', name: 'MPC', departmentId: 'science', years: 2, description: 'Maths, Physics, Chemistry', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'seed-script', medium: 'English' },
  { id: 'hec', name: 'HEC', departmentId: 'arts', years: 2, description: 'History, Economics, Civics', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'seed-script', medium: 'English' },
  { id: 'cec', name: 'CEC', departmentId: 'arts', years: 2, description: 'Civics, Economics, Commerce', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'seed-script', medium: 'Telugu' }
];

// Subjects for each program and year
const MOCK_SUBJECTS = [
  { id: 'math-1', name: 'Math', programId: 'mpc', year: 1, medium: 'English', instructorId: 'prof.smith@questedu.com', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'seed-script' },
  { id: 'english-1', name: 'English', programId: 'mpc', year: 1, medium: 'English', instructorId: 'prof.smith@questedu.com', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'seed-script' },
  { id: 'civics-1', name: 'Civics', programId: 'hec', year: 1, medium: 'English', instructorId: 'prof.smith@questedu.com', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'seed-script' }
];

// Mock users data
const MOCK_USERS = {
  superadmins: [
    {
      email: 'superadmin@questedu.com',
      password: 'SuperAdmin123!',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'superadmin',
      department: 'Administration',
      bio: 'System administrator with full access to all features.',
      collegeId: 'mit'
    }
  ],
  instructors: [
    {
      email: 'prof.smith@questedu.com',
      password: 'Instructor123!',
      firstName: 'John',
      lastName: 'Smith',
      role: 'instructor',
      department: 'Computer Science',
      bio: 'Experienced software engineer and educator with 10+ years in industry.',
      collegeId: 'mit',
      coreTeachingSkills: ['JavaScript', 'React', 'Node.js', 'Database Design'],
      additionalTeachingSkills: ['Project Management', 'Agile Methodology', 'Technical Writing']
    },
    {
      email: 'dr.johnson@questedu.com',
      password: 'Instructor123!',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'instructor',
      department: 'Data Science',
      bio: 'Data scientist and machine learning expert with PhD in Statistics.',
      collegeId: 'stanford',
      coreTeachingSkills: ['Python', 'Machine Learning', 'Statistics', 'Data Visualization'],
      additionalTeachingSkills: ['Research Methodology', 'Academic Writing', 'Mentoring']
    },
    {
      email: 'prof.patel@questedu.com',
      password: 'Instructor123!',
      firstName: 'Raj',
      lastName: 'Patel',
      role: 'instructor',
      department: 'Engineering',
      bio: 'Mechanical engineer with expertise in CAD design and manufacturing.',
      collegeId: 'iit-bombay',
      coreTeachingSkills: ['CAD Design', 'Manufacturing', 'Engineering Mathematics', 'Project Design'],
      additionalTeachingSkills: ['Industry Collaboration', 'Innovation Management']
    },
    {
      email: 'dr.brown@questedu.com',
      password: 'Instructor123!',
      firstName: 'Emily',
      lastName: 'Brown',
      role: 'instructor',
      department: 'Business',
      bio: 'Business consultant and entrepreneur teaching business strategy.',
      collegeId: 'university-cambridge',
      coreTeachingSkills: ['Business Strategy', 'Marketing', 'Finance', 'Leadership'],
      additionalTeachingSkills: ['Consulting', 'Entrepreneurship', 'Public Speaking']
    }
  ],
  students: [
    {
      email: 'alice.wilson@student.com',
      password: 'Student123!',
      firstName: 'Alice',
      lastName: 'Wilson',
      role: 'student',
      department: 'Computer Science',
      bio: 'Aspiring software developer interested in web technologies.',
      collegeId: 'mit',
      mainSubjects: ['Computer Science', 'Mathematics', 'Web Development'],
      class: 'Sophomore'
    },
    {
      email: 'bob.davis@student.com',
      password: 'Student123!',
      firstName: 'Bob',
      lastName: 'Davis',
      role: 'student',
      department: 'Data Science',
      bio: 'Data enthusiast learning machine learning and analytics.',
      collegeId: 'stanford',
      mainSubjects: ['Data Science', 'Statistics', 'Machine Learning'],
      class: 'Junior'
    },
    {
      email: 'carol.martinez@student.com',
      password: 'Student123!',
      firstName: 'Carol',
      lastName: 'Martinez',
      role: 'student',
      department: 'Engineering',
      bio: 'Engineering student focused on sustainable design.',
      collegeId: 'iit-bombay',
      mainSubjects: ['Mechanical Engineering', 'Sustainability', 'Design'],
      class: 'Senior'
    },
    {
      email: 'david.lee@student.com',
      password: 'Student123!',
      firstName: 'David',
      lastName: 'Lee',
      role: 'student',
      department: 'Business',
      bio: 'Business student with entrepreneurial aspirations.',
      collegeId: 'university-cambridge',
      mainSubjects: ['Business Administration', 'Marketing', 'Finance'],
      class: 'Freshman'
    },
    {
      email: 'eva.garcia@student.com',
      password: 'Student123!',
      firstName: 'Eva',
      lastName: 'Garcia',
      role: 'student',
      department: 'General Studies',
      bio: 'Exploring different fields to find my passion.',
      collegeId: 'community-college',
      mainSubjects: ['General Studies', 'Liberal Arts'],
      class: 'Freshman'
    },
    {
      email: 'frank.taylor@student.com',
      password: 'Student123!',
      firstName: 'Frank',
      lastName: 'Taylor',
      role: 'student',
      department: 'Computer Science',
      bio: 'Part-time student working in tech industry.',
      collegeId: 'community-college',
      mainSubjects: ['Computer Programming', 'Web Development'],
      class: 'Sophomore'
    }
  ]
};

// Mock college administrators data
const MOCK_COLLEGE_ADMINISTRATORS = [
  {
    collegeId: 'mit',
    instructorEmail: 'prof.smith@questedu.com',
    role: 'administrator'
  },
  {
    collegeId: 'mit',
    instructorEmail: 'dr.johnson@questedu.com',
    role: 'co_administrator'
  },
  {
    collegeId: 'stanford',
    instructorEmail: 'dr.johnson@questedu.com',
    role: 'administrator'
  },
  {
    collegeId: 'iit-bombay',
    instructorEmail: 'prof.patel@questedu.com',
    role: 'administrator'
  },
  {
    collegeId: 'university-cambridge',
    instructorEmail: 'dr.brown@questedu.com',
    role: 'administrator'
  }
];

const COURSE_TEMPLATES = [
  {
    title: 'Complete Web Development Bootcamp',
    description: 'Learn full-stack web development from scratch with HTML, CSS, JavaScript, React, and Node.js',
    subcategory: 'Web Development',
    difficultyId: 'beginner',
    duration: 12, // weeks converted to duration number
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&h=800&fit=crop&crop=center',
    imageFileName: 'web-development-course.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=300&h=200&fit=crop&crop=center',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    skills: ['Frontend Development', 'Backend Development', 'Full Stack'],
    prerequisites: ['Basic computer literacy'],
    objectives: [
      'Build responsive websites with HTML and CSS',
      'Master JavaScript programming fundamentals',
      'Create interactive web applications with React',
      'Develop server-side applications with Node.js',
      'Deploy applications to production'
    ],
    // Associate with MIT CS program, Year 1, Web Development subject
    associations: [
      {
        collegeId: 'mit',
        programId: 'mit-cs-bs',
        yearOrSemester: 1,
        subjectId: 'mit-cs-bs-math1'
      }      
    ]
  },
  {
    title: 'Machine Learning Fundamentals',
    description: 'Comprehensive introduction to machine learning concepts, algorithms, and practical applications',
    subcategory: 'Machine Learning',
    difficultyId: 'intermediate',
    duration: 8, // weeks
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=800&fit=crop&crop=center',
    imageFileName: 'machine-learning-course.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=300&h=200&fit=crop&crop=center',
    tags: ['Python', 'Scikit-learn', 'Data Analysis', 'ML Algorithms'],
    skills: ['Data Analysis', 'Statistical Modeling', 'Python Programming'],
    prerequisites: ['Basic Python knowledge', 'Statistics fundamentals'],
    objectives: [
      'Understand machine learning concepts and terminology',
      'Implement supervised and unsupervised learning algorithms',
      'Perform data preprocessing and feature engineering',
      'Evaluate and optimize model performance',
      'Apply ML to real-world problems'
    ],
    // Associate with Stanford Data Science program, Year 1, Machine Learning subject
    associations: [
      {
        collegeId: 'stanford',
        programId: 'stanford-cs-bs',
        yearOrSemester: 1,
        subjectId: 'stanford-ds-stats'
      }
    ]
  },
  {
    title: 'Mechanical Design Principles',
    description: 'Learn fundamental principles of mechanical design and CAD modeling',
    subcategory: 'Mechanical Engineering',
    difficultyId: 'intermediate',
    duration: 10, // weeks
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=800&fit=crop&crop=center',
    imageFileName: 'mechanical-design-course.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop&crop=center',
    tags: ['CAD', 'SolidWorks', 'Design', 'Manufacturing'],
    skills: ['CAD Modeling', 'Design Analysis', 'Manufacturing Processes'],
    prerequisites: ['Basic engineering mathematics', 'Physics fundamentals'],
    objectives: [
      'Master CAD software for 3D modeling',
      'Understand design principles and constraints',
      'Analyze stress and strain in mechanical components',
      'Design for manufacturing and assembly',
      'Create technical drawings and documentation'
    ],
    // Associate with IIT Bombay Mechanical Engineering program, Year 2, Design subject
    associations: [
      {
        collegeId: 'iit-bombay',
        programId: 'iitb-mech-btech',
        yearOrSemester: 2,
        subjectId: 'iitb-mech-thermo'
      }
    ]
  },
  {
    title: 'Digital Marketing Strategy',
    description: 'Comprehensive guide to digital marketing including SEO, social media, and analytics',
    subcategory: 'Marketing',
    difficultyId: 'beginner',
    duration: 6, // weeks
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&crop=center',
    imageFileName: 'digital-marketing-course.jpg',
    thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop&crop=center',
    tags: ['SEO', 'Social Media', 'Analytics', 'Content Marketing'],
    skills: ['Digital Strategy', 'Content Creation', 'Data Analysis'],
    prerequisites: ['Basic business understanding'],
    objectives: [
      'Develop comprehensive digital marketing strategies',
      'Optimize websites for search engines',
      'Create engaging social media campaigns',
      'Analyze marketing performance with data',
      'Build brand awareness online'
    ]
  }
];

// ==================== HELPER FUNCTIONS ====================

function generateRandomId() {
  return Math.random().toString(36).substr(2, 9);
}

function getRandomElements(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateMockTopics(courseTitle, instructorName, topicCount = 6) {
  const topicTemplates = [
    'Introduction and Overview',
    'Fundamentals and Basic Concepts', 
    'Practical Applications',
    'Advanced Techniques',
    'Project Development',
    'Best Practices and Review'
  ];
  
  return topicTemplates.slice(0, topicCount).map((template, index) => ({
    title: `${template} - ${courseTitle}`,
    description: `Comprehensive coverage of ${template.toLowerCase()} in ${courseTitle}`,
    order: index + 1,
    duration: 45 + Math.floor(Math.random() * 30), // 45-75 minutes
    isPublished: true,
    isFree: index === 0, // First topic is free
    prerequisites: index > 0 ? [`Topic ${index}`] : [],
    learningObjectives: [
      `Understand key concepts of ${template.toLowerCase()}`,
      `Apply knowledge in practical scenarios`,
      `Complete hands-on exercises`
    ],
    summary: `This topic covers ${template.toLowerCase()} essential for mastering ${courseTitle}.`,
    materials: [
      {
        id: generateRandomId(),
        type: 'video',
        title: `${template} Video Lecture`,
        url: `https://example.com/videos/${generateRandomId()}`,
        description: `Video lecture covering ${template.toLowerCase()}`,
        duration: 30,
        downloadable: false,
        order: 1
      },
      {
        id: generateRandomId(),
        type: 'pdf',
        title: `${template} Study Guide`,
        url: `https://example.com/pdfs/${generateRandomId()}`,
        description: `Comprehensive study guide for ${template.toLowerCase()}`,
        size: 1024 * 1024 * 2, // 2MB
        downloadable: true,
        order: 2
      }
    ],
    completionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
    viewCount: Math.floor(Math.random() * 500) + 100
  }));
}

function generateMockQuestions(topicTitle, questionCount = 5, multilingualMode = false, DEFAULT_LANGUAGE = 'en') {
  // Helper for multilingual text
  function createMultilingualText(text) {
    return { en: text };
  }
  function getCompatibleText(multilingualText, lang) {
    return multilingualText && multilingualText[lang] ? multilingualText[lang] : '';
  }

  const questionTypes = ['multiple_choice', 'true_false', 'short_essay', 'long_essay'];
  const questions = [];

  for (let i = 0; i < questionCount; i++) {
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let question = {
      questionText: `Question ${i + 1}: What is an important concept in ${topicTitle}?`,
      questionType,
      points: 5,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
      tags: ['concept', 'understanding'],
      correctAnswer: `This answer for the given question and the key concepts in ${topicTitle}.`,
      explanation: `This question tests understanding of key concepts in ${topicTitle}.`,
      order: i + 1,
      isActive: true,
      flags: {
        important: Math.random() < 0.3,
        frequently_asked: Math.random() < 0.2,
        practical: Math.random() < 0.2,
        conceptual: Math.random() < 0.5
      }
    };

    // Add questionRichText and richtextanswer for essay types
    if (questionType === 'short_essay' || questionType === 'long_essay') {
      const baseText = `Rich text for ${questionType} in ${topicTitle}`;
      question.questionRichText = multilingualMode
        ? createMultilingualText(baseText)
        : baseText;
      question.correctAnswerRichText = multilingualMode
        ? createMultilingualText(`Sample answer for ${questionType} in ${topicTitle}`)
        : `Sample answer for ${questionType} in ${topicTitle}`;
    }

    if (questionType === 'multiple_choice') {
      question.options = [
        { text: 'Correct answer option', isCorrect: true },
        { text: 'Incorrect option 1', isCorrect: false },
        { text: 'Incorrect option 2', isCorrect: false },
        { text: 'Incorrect option 3', isCorrect: false }
      ];
    } else if (questionType === 'true_false') {
      question.options = [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false }
      ];
    } else if (questionType === 'short_essay' || questionType === 'long_essay') {
      // Ensure questionRichText and richtextanswer are set as per logic
      question.questionRichText = (questionType === 'short_essay' || questionType === 'long_essay')
        ? (multilingualMode
            ? (typeof question.questionRichText === 'string'
                ? createMultilingualText(question.questionRichText)
                : question.questionRichText || createMultilingualText(''))
            : (typeof question.questionRichText === 'string'
                ? question.questionRichText
                : getCompatibleText(question.questionRichText || createMultilingualText(''), DEFAULT_LANGUAGE)))
        : (multilingualMode ? createMultilingualText('') : '');
      question.correctAnswerRichText = (questionType === 'short_essay' || questionType === 'long_essay')
        ? (multilingualMode
            ? (typeof question.correctAnswerRichText === 'string'
                ? createMultilingualText(question.correctAnswerRichText)
                : question.correctAnswerRichText || createMultilingualText(''))
            : (typeof question.correctAnswerRichText === 'string'
                ? question.correctAnswerRichText
                : getCompatibleText(question.correctAnswerRichText || createMultilingualText(''), DEFAULT_LANGUAGE)))
        : (multilingualMode ? createMultilingualText('') : '');
    } else {
      question.acceptableAnswers = [`Key concept from ${topicTitle}`, 'Alternative answer'];
      question.caseSensitive = false;
    }

    questions.push(question);
  }

  return questions;
}

// ==================== SEEDING FUNCTIONS ====================

async function seedColleges() {
  console.log('🏛️  Seeding colleges...');
  
  for (const college of MOCK_COLLEGES) {
    const collegeData = {
      ...college,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'seed-script'
    };
    
    const collegeRef = doc(db, 'colleges', college.id);
    await setDoc(collegeRef, collegeData);
    
    createdData.colleges.push({
      id: college.id,
      name: college.name,
      ...collegeData
    });
  }
  
  console.log(`✅ Created ${MOCK_COLLEGES.length} colleges`);
}

async function seedDepartments() {
  console.log('🏛️  Seeding departments...');
  
  for (const department of MOCK_DEPARTMENTS) {
    const departmentData = {
      ...department,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'seed-script'
    };
    
    const departmentRef = doc(db, 'departments', department.id);
    await setDoc(departmentRef, departmentData);
    
    createdData.departments.push({
      id: department.id,
      name: department.name,
      ...departmentData
    });
  }
  
  console.log(`✅ Created ${MOCK_DEPARTMENTS.length} departments`);
}

async function seedPrograms() {
  console.log('🎓 Seeding academic programs...');
  
  for (const program of MOCK_PROGRAMS) {
    const programData = {
      ...program,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'seed-script'
    };
    
    const programRef = doc(db, 'programs', program.id);
    await setDoc(programRef, programData);
    
    createdData.programs.push({
      id: program.id,
      name: program.name,
      collegeId: program.collegeId,
      ...programData
    });
  }
  
  console.log(`✅ Created ${MOCK_PROGRAMS.length} academic programs`);
}

async function seedSubjects() {
  console.log('📚 Seeding program subjects...');

  // We need to resolve instructor emails to UIDs first
  const instructorEmailToUid = {};

  // Get all users to map emails to UIDs
  const usersSnapshot = await db.collection('users').get();
  usersSnapshot.forEach((userDoc) => {
    const userData = userDoc.data();
    if (userData.email) {
      instructorEmailToUid[userData.email] = userDoc.id;
    }
  });

  for (const subject of MOCK_SUBJECTS) {
    // Resolve instructor email to UID
    const instructorUid = instructorEmailToUid[subject.instructorId] || 'unknown-instructor';

    const subjectData = {
      ...subject,
      instructorId: instructorUid,
      instructorName: subject.instructorId.includes('prof.')
        ? subject.instructorId.split('@')[0].replace('prof.', 'Prof. ').replace('.', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : subject.instructorId.includes('dr.')
        ? subject.instructorId.split('@')[0].replace('dr.', 'Dr. ').replace('.', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Unknown Instructor',
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'seed-script'
    };

    const subjectRef = db.collection('subjects').doc(subject.id);
    await setDoc(subjectRef, subjectData);

    createdData.subjects.push({
      id: subject.id,
      name: subject.name,
      programId: subject.programId,
      collegeId: subject.collegeId,
      ...subjectData
    });
  }

  console.log(`✅ Created ${MOCK_SUBJECTS.length} program subjects`);
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  // Seed superadmins
  for (const userData of MOCK_USERS.superadmins) {
    try {
      const userRecord = await auth.createUser({ email: userData.email, password: userData.password, displayName: `${userData.firstName} ${userData.lastName}` });
      await auth.updateUser(userRecord.uid, { displayName: `${userData.firstName} ${userData.lastName}` });
      
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        isActive: true,
        profileCompleted: true,
        department: userData.department,
        bio: userData.bio,
        collegeId: userData.collegeId,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userRecord.uid), userProfile);
      createdData.users.superadmins.push({ uid: userRecord.uid, ...userProfile });
      
      console.log(`   ✅ Created superadmin: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
  
  // Seed instructors
  for (const userData of MOCK_USERS.instructors) {
    try {
      const userRecord = await auth.createUser({ email: userData.email, password: userData.password, displayName: `${userData.firstName} ${userData.lastName}` });
      await auth.updateUser(userRecord.uid, { displayName: `${userData.firstName} ${userData.lastName}` });
      
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        isActive: true,
        profileCompleted: true,
        department: userData.department,
        bio: userData.bio,
        collegeId: userData.collegeId,
        coreTeachingSkills: userData.coreTeachingSkills,
        additionalTeachingSkills: userData.additionalTeachingSkills,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userRecord.uid), userProfile);
      createdData.users.instructors.push({ uid: userRecord.uid, ...userProfile });
      
      console.log(`   ✅ Created instructor: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
  
  // Seed students
  for (const userData of MOCK_USERS.students) {
    try {
      const userRecord = await auth.createUser({ email: userData.email, password: userData.password, displayName: `${userData.firstName} ${userData.lastName}` });
      await auth.updateUser(userRecord.uid, { displayName: `${userData.firstName} ${userData.lastName}` });
      
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        isActive: true,
        profileCompleted: true,
        department: userData.department,
        bio: userData.bio,
        collegeId: userData.collegeId,
        mainSubjects: userData.mainSubjects,
        class: userData.class,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userRecord.uid), userProfile);
      createdData.users.students.push({ uid: userRecord.uid, ...userProfile });
      
      console.log(`   ✅ Created student: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
  
  console.log(`✅ Created ${createdData.users.superadmins.length + createdData.users.instructors.length + createdData.users.students.length} users total`);
}

async function seedSuperAdminUsers() {
  console.log('👥 Seeding users...');
  
  // Seed superadmins
  for (const userData of MOCK_USERS.superadmins) {
    try {
      const userRecord = await auth.createUser({ email: userData.email, password: userData.password, displayName: `${userData.firstName} ${userData.lastName}` });
      await auth.updateUser(userRecord.uid, { displayName: `${userData.firstName} ${userData.lastName}` });
      
      const userProfile = {
        uid: userRecord.uid,
        email: userRecord.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: `${userData.firstName} ${userData.lastName}`,
        role: userData.role,
        isActive: true,
        profileCompleted: true,
        department: userData.department,
        bio: userData.bio,
        collegeId: userData.collegeId,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userRecord.uid), userProfile);
      createdData.users.superadmins.push({ uid: userRecord.uid, ...userProfile });
      
      console.log(`   ✅ Created superadmin: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
}


async function seedCollegeAdministrators() {
  console.log('👨‍💼 Seeding college administrators...');

  // Defensive: ensure user arrays are always initialized
  if (!createdData.users.superadmins) createdData.users.superadmins = [];
  if (!createdData.users.instructors) createdData.users.instructors = [];
  if (!createdData.users.students) createdData.users.students = [];

  // If no users were created in this session, try to fetch existing users
  if (createdData.users.superadmins.length === 0) {
    try {
      // Get existing users from Firestore instead
      const usersSnapshot = await db.collection('users').get();
      const existingUsers = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      // Categorize existing users
      existingUsers.forEach(user => {
        if (user.role === 'superadmin') {
          createdData.users.superadmins.push(user);
        } else if (user.role === 'instructor') {
          createdData.users.instructors.push(user);
        } else if (user.role === 'student') {
          createdData.users.students.push(user);
        }
      });

      console.log(`   📋 Found ${existingUsers.length} existing users in database`);
    } catch (error) {
      console.log(`   ⚠️  Failed to fetch existing users: ${error.message}`);
      return;
    }
  }

  // Get superadmin user for assignedBy field
  const superadmin = createdData.users.superadmins[0];
  if (!superadmin) {
    console.log('⚠️  No superadmin found, skipping college administrators seeding');
    return;
  }

  let totalAdministrators = 0;

  for (const adminData of MOCK_COLLEGE_ADMINISTRATORS) {
    try {
      // Find the instructor by email
      const instructor = createdData.users.instructors.find(
        i => i.email === adminData.instructorEmail
      );

      if (!instructor) {
        console.log(`   ⚠️  Instructor not found: ${adminData.instructorEmail}`);
        continue;
      }

      // Check if college exists
      const college = createdData.colleges.find(c => c.id === adminData.collegeId);
      if (!college) {
        console.log(`   ⚠️  College not found: ${adminData.collegeId}`);
        continue;
      }

      // Check if this administrator assignment already exists
      const existingAdminSnapshot = await db.collection('collegeAdministrators')
        .where('collegeId', '==', adminData.collegeId)
        .where('instructorId', '==', instructor.uid)
        .where('isActive', '==', true)
        .get();

      if (!existingAdminSnapshot.empty) {
        console.log(`   ⚠️  Administrator assignment already exists: ${instructor.displayName} at ${college.name}`);
        continue;
      }

      const administratorDoc = {
        collegeId: adminData.collegeId,
        instructorId: instructor.uid,
        instructorName: instructor.displayName,
        instructorEmail: instructor.email,
        role: adminData.role,
        assignedAt: serverTimestamp(),
        assignedBy: superadmin.uid,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const adminRef = await db.collection('collegeAdministrators').add(administratorDoc);
      const adminWithId = { id: adminRef.id, ...administratorDoc };
      createdData.collegeAdministrators.push(adminWithId);
      totalAdministrators++;

      console.log(`   ✅ Assigned ${instructor.displayName} as ${adminData.role} for ${college.name}`);
    } catch (error) {
      console.log(`   ⚠️  Failed to assign administrator: ${error.message}`);
    }
  }

  console.log(`✅ Created ${totalAdministrators} college administrator assignments`);
}

async function seedCourses() {
  console.log('📚 Seeding courses...');

  const instructors = createdData.users.instructors;

  for (let i = 0; i < COURSE_TEMPLATES.length && i < instructors.length; i++) {
    const courseTemplate = COURSE_TEMPLATES[i];
    const instructor = instructors[i];

    const courseData = {
      title: courseTemplate.title,
      description: courseTemplate.description,
      instructor: instructor.displayName,
      instructorId: instructor.uid,
      subcategory: courseTemplate.subcategory,
      difficultyId: courseTemplate.difficultyId,
      duration: courseTemplate.duration,
      status: 'published',
      isPublished: true,
      featured: Math.random() > 0.5,
      rating: 4.0 + Math.random() * 1.0, // 4.0-5.0
      ratingCount: Math.floor(Math.random() * 100) + 20,
      enrollmentCount: Math.floor(Math.random() * 200) + 50,
      tags: courseTemplate.tags,
      skills: courseTemplate.skills,
      prerequisites: courseTemplate.prerequisites,
      objectives: courseTemplate.objectives,
      // Image fields from template
      image: courseTemplate.image,
      imageFileName: courseTemplate.imageFileName,
      thumbnailUrl: courseTemplate.thumbnailUrl,
      imageStoragePath: courseTemplate.imageStoragePath || `courses/${instructor.uid}/images/${courseTemplate.imageFileName}`,
      // Association fields from template (if provided)
      associations: Array.isArray(courseTemplate.associations)
        ? courseTemplate.associations.map(assoc => ({
            ...assoc,
            collegeName: createdData.colleges.find(c => c.id === assoc.collegeId)?.name,
            programName: createdData.programs.find(p => p.id === assoc.programId)?.name,
            subjectName: createdData.subjects.find(s => s.id === assoc.subjectId)?.name
          }))
        : courseTemplate.association
        ? [{
            ...courseTemplate.association,
            collegeName: createdData.colleges.find(c => c.id === courseTemplate.association.collegeId)?.name,
            programName: createdData.programs.find(p => p.id === courseTemplate.association.programId)?.name,
            subjectName: createdData.subjects.find(s => s.id === courseTemplate.association.subjectId)?.name
          }]
        : [],
      language: 'English',
      subtitles: ['English'],
      certificates: true,
      lifetimeAccess: true,
      mobileAccess: true,
      downloadableResources: true,
      assignmentsCount: 5,
      articlesCount: 10,
      videosCount: 25,
      totalVideoLength: 600 + Math.floor(Math.random() * 400), // 600-1000 minutes
      lastModifiedBy: instructor.uid,
      publishedAt: new Date(),
      seoTitle: `${courseTemplate.title} - Learn ${courseTemplate.subcategory}`,
      seoDescription: courseTemplate.description,
      seoKeywords: courseTemplate.tags,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const courseRef = await db.collection('courses').add(courseData);
    const courseWithId = { id: courseRef.id, ...courseData };
    createdData.courses.push(courseWithId);

    console.log(`   ✅ Created course: ${courseTemplate.title}`);
  }

  console.log(`✅ Created ${createdData.courses.length} courses`);
}

async function seedTopics() {
  console.log('📝 Seeding course topics...');

  let totalTopics = 0;

  for (const course of createdData.courses) {
    const instructor = createdData.users.instructors.find(i => i.uid === course.instructorId);
    const topics = generateMockTopics(course.title, instructor.displayName);

    for (const topicData of topics) {
      const topicDoc = {
        courseId: course.id,
        ...topicData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: course.instructorId
      };

      const topicRef = await db.collection('courseTopics').add(topicDoc);
      const topicWithId = { id: topicRef.id, ...topicDoc };
      createdData.topics.push(topicWithId);
      totalTopics++;
    }
  }

  console.log(`✅ Created ${totalTopics} course topics`);
}

async function seedQuestions() {
  console.log('❓ Seeding course questions...');

  let totalQuestions = 0;

  for (const topic of createdData.topics) {
    const questions = generateMockQuestions(topic.title);

    for (const questionData of questions) {
      const questionDoc = {
        courseId: topic.courseId,
        topicId: topic.id,
        ...questionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'seed-script'
      };

      const questionRef = await db.collection('courseQuestions').add(questionDoc);
      const questionWithId = { id: questionRef.id, ...questionDoc };
      createdData.questions.push(questionWithId);
      totalQuestions++;
    }
  }

  console.log(`✅ Created ${totalQuestions} course questions`);
}

async function seedEnrollments() {
  console.log('🎓 Seeding student enrollments...');

  const students = createdData.users.students;
  const courses = createdData.courses;
  let totalEnrollments = 0;

  for (const student of students) {
    // Each student enrolls in 2-4 random courses
    const enrollmentCount = 2 + Math.floor(Math.random() * 3);
    const enrolledCourses = getRandomElements(courses, enrollmentCount);

    for (const course of enrolledCourses) {
      const enrollmentData = {
        studentId: student.uid,
        courseId: course.id,
        instructorId: course.instructorId,
        enrolledAt: serverTimestamp(),
        status: 'enrolled',
        progress: Math.floor(Math.random() * 80) + 10, // 10-90% progress
        completedTopics: [],
        lastAccessedAt: new Date(),
        totalTimeSpent: Math.floor(Math.random() * 1000) + 100, // minutes
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const enrollmentRef = await db.collection('enrollments').add(enrollmentData);
      const enrollmentWithId = { id: enrollmentRef.id, ...enrollmentData };
      createdData.enrollments.push(enrollmentWithId);
      totalEnrollments++;
    }
  }

  console.log(`✅ Created ${totalEnrollments} student enrollments`);
}

async function seedActivities() {
  console.log('📊 Seeding instructor activities...');

  const activities = [
    'course_created',
    'course_updated',
    'topic_added',
    'student_enrolled',
    'question_added',
    'course_published'
  ];

  let totalActivities = 0;

  // Create activities for instructors
  for (const instructor of createdData.users.instructors) {
    const instructorCourses = createdData.courses.filter(c => c.instructorId === instructor.uid);

    for (const course of instructorCourses) {
      // Create course creation activity
      const courseCreatedActivity = {
        userId: instructor.uid || '',
        userRole: 'instructor',
        action: 'course_created',
        entityType: 'course',
        entityId: course.id || '',
        entityTitle: course.title || '',
        description: `Created course "${course.title || 'Untitled Course'}"`,
        metadata: {
          courseId: course.id || '',
          courseTitle: course.title || '',
          category: course.subcategory || 'uncategorized'
        },
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      await db.collection('activities').add(courseCreatedActivity);
      totalActivities++;

      // Create topic activities
      const courseTopics = createdData.topics.filter(t => t.courseId === course.id);
      for (const topic of courseTopics.slice(0, 2)) { // Limit activities
        const topicActivity = {
          userId: instructor.uid || '',
          userRole: 'instructor',
          action: 'topic_added',
          entityType: 'topic',
          entityId: topic.id || '',
          entityTitle: topic.title || '',
          description: `Added topic "${topic.title || 'Untitled Topic'}" to course "${course.title || 'Untitled Course'}"`,
          metadata: {
            courseId: course.id || '',
            topicId: topic.id || '',
            topicTitle: topic.title || ''
          },
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp()
        };

        await db.collection('activities').add(topicActivity);
        totalActivities++;
      }
    }
  }
  
  // Create enrollment activities
  for (const enrollment of createdData.enrollments.slice(0, 10)) { // Limit activities
    const course = createdData.courses.find(c => c.id === enrollment.courseId);
    const student = createdData.users.students.find(s => s.uid === enrollment.studentId);
    
    if (course && student) {
      const enrollmentActivity = {
        userId: enrollment.instructorId || '',
        userRole: 'instructor',
        action: 'student_enrolled',
        entityType: 'enrollment',
        entityId: enrollment.id || '',
        entityTitle: `${student.displayName || 'Unknown Student'} enrolled in ${course.title || 'Untitled Course'}`,
        description: `Student ${student.displayName || 'Unknown Student'} enrolled in course "${course.title || 'Untitled Course'}"`,
        metadata: {
          studentId: student.uid || '',
          studentName: student.displayName || '',
          courseId: course.id || '',
          courseTitle: course.title || ''
        },
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      await db.collection('activities').add(enrollmentActivity);
      totalActivities++;
    }
  }

  console.log(`✅ Created ${totalActivities} activities`);
}

async function seedCourseCategories() {
  console.log('📚 Seeding course categories...');
  
  for (const categoryData of COURSE_CATEGORIES) {
    try {
      const categoryDoc = {
        ...categoryData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'courseCategories', categoryData.id), categoryDoc);
      createdData.categories = createdData.categories || [];
      createdData.categories.push(categoryDoc);
      
      console.log(`   ✅ Created category: ${categoryData.name}`);
    } catch (error) {
      console.log(`   ⚠️  Failed to create category ${categoryData.name}: ${error.message}`);
    }
  }
  
  console.log(`✅ Created ${COURSE_CATEGORIES.length} course categories`);
}

async function seedCourseDifficulties() {
  console.log('🎯 Seeding course difficulties...');
  
  for (const difficultyData of COURSE_DIFFICULTIES) {
    try {
      const difficultyDoc = {
        ...difficultyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'courseDifficulties', difficultyData.id), difficultyDoc);
      createdData.difficulties = createdData.difficulties || [];
      createdData.difficulties.push(difficultyDoc);
      
      console.log(`   ✅ Created difficulty: ${difficultyData.name}`);
    } catch (error) {
      console.log(`   ⚠️  Failed to create difficulty ${difficultyData.name}: ${error.message}`);
    }
  }
  
  console.log(`✅ Created ${COURSE_DIFFICULTIES.length} course difficulties`);
}

// ==================== MAIN SEEDING FUNCTION ====================

async function seedDatabase() {
  console.log('🌱 QuestAdmin Database Seed Script');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  
  try {
    // Step 1: Seed colleges (master data)
    await seedColleges();
    
    // Step 2: Seed departments for the college
    await seedDepartments();
    
    // Step 3: Seed academic programs for colleges
    await seedPrograms();
    
    // Step 4: Seed course master data
    await seedCourseCategories();
    await seedCourseDifficulties();
    
    // Step 5: Seed users (superadmin, instructors, students)
    await seedUsers();
    
    // Step 6: Seed program subjects (requires users to be created first)
    await seedSubjects();
    
    // Step 7: Seed college administrators
    await seedCollegeAdministrators();
    
    // Step 8: Seed courses linked to instructors
    await seedCourses();
    
    // Step 9: Seed topics for courses
    await seedTopics();
    
    // Step 10: Seed questions and answers for courses
    await seedQuestions();
    
    // Step 11: Seed student enrollments
    await seedEnrollments();
    
    // Step 12: Seed instructor activities
    await seedActivities();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Colleges: ${createdData.colleges.length}`);
    console.log(`   • Programs: ${createdData.programs.length}`);
    console.log(`   • Subjects: ${createdData.subjects.length}`);
    console.log(`   • Course Categories: ${createdData.categories?.length || 0}`);
    console.log(`   • Course Difficulties: ${createdData.difficulties?.length || 0}`);
    console.log(`   • Users: ${Object.values(createdData.users).flat().length}`);
    console.log(`     - Superadmins: ${createdData.users.superadmins.length}`);
    console.log(`     - Instructors: ${createdData.users.instructors.length}`);
    console.log(`     - Students: ${createdData.users.students.length}`);
    console.log(`   • College Administrators: ${createdData.collegeAdministrators?.length || 0}`);
    console.log(`   • Courses: ${createdData.courses.length}`);
    console.log(`   • Topics: ${createdData.topics.length}`);
    console.log(`   • Questions: ${createdData.questions.length}`);
    console.log(`   • Enrollments: ${createdData.enrollments.length}`);
    console.log(`   • Activities: ${createdData.activities.length}`);
    console.log(`   • Time taken: ${duration} seconds`);
    
    console.log('\n👤 Test User Credentials:');
    console.log('Superadmin:');
    console.log('  Email: superadmin@questedu.com');
    console.log('  Password: SuperAdmin123!');
    console.log('\nSample Instructor:');
    console.log('  Email: prof.smith@questedu.com');
    console.log('  Password: Instructor123!');
    console.log('\nSample Student:');
    console.log('  Email: alice.wilson@student.com');
    console.log('  Password: Student123!');
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Login with any of the test accounts');
    console.log('   2. Explore the seeded courses and enrollments');
    console.log('   3. Test college management as superadmin');
    console.log('   4. Verify all functionality works correctly');
    
  } catch (error) {
    console.error('\n💥 Database seeding failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Check your Firebase configuration');
    console.error('   • Ensure you have proper database permissions');
    console.error('   • Verify network connectivity');
    console.error('   • Check if user emails already exist');
    throw error;
  }
}

// Main execution
async function main() {
  // Check if --clear-first flag was passed
  if (process.argv.includes('--clear-first')) {
    console.log('🧹 Clearing database first...');
    const { clearDatabaseAuto } = require('./clear-database-auto.js');
    await clearDatabaseAuto();
    console.log('');
  }

  if (process.argv.includes('--superadmin')) {
    console.log('🧹 Creating superadmin...');
    seedSuperAdminUsers();
    console.log('');
  }else{
    await seedDatabase();
  }  
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = { 
  seedDatabase, 
  seedColleges,
  seedDepartments,
  seedPrograms,
  seedSubjects, 
  seedUsers, 
  seedCollegeAdministrators,
  seedCourses, 
  seedTopics, 
  seedQuestions, 
  seedEnrollments, 
  seedActivities,
  seedSuperAdminUsers,
  seedCourseCategories,
  seedCourseDifficulties 
};
