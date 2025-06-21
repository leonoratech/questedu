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

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const { getFirestore, collection, doc, setDoc, addDoc, writeBatch, serverTimestamp, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "questedu-cb2a4.firebaseapp.com", 
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "questedu-cb2a4",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "questedu-cb2a4.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "247130380208",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:247130380208:web:dfe0053ff32ae3194a6875"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Track created data for relationships
const createdData = {
  colleges: [],
  users: {
    superadmins: [],
    instructors: [],
    students: []
  },
  courses: [],
  topics: [],
  questions: [],
  enrollments: [],
  activities: []
};

// ==================== MOCK DATA DEFINITIONS ====================

const MOCK_COLLEGES = [
  {
    id: 'mit',
    name: 'Massachusetts Institute of Technology',
    accreditation: 'NECHE',
    affiliation: 'Private Research University',
    address: {
      street: '77 Massachusetts Avenue',
      city: 'Cambridge',
      state: 'Massachusetts',
      country: 'United States',
      postalCode: '02139'
    },
    contact: {
      phone: '+1-617-253-1000',
      email: 'info@mit.edu',
      website: 'https://web.mit.edu'
    },
    website: 'https://web.mit.edu',
    principalName: 'L. Rafael Reif',
    description: 'A prestigious private research university focusing on science, technology, engineering, and mathematics.',
    isActive: true
  },
  {
    id: 'stanford',
    name: 'Stanford University',
    accreditation: 'WASC',
    affiliation: 'Private Research University',
    address: {
      street: '450 Serra Mall',
      city: 'Stanford',
      state: 'California',
      country: 'United States',
      postalCode: '94305'
    },
    contact: {
      phone: '+1-650-723-2300',
      email: 'admission@stanford.edu',
      website: 'https://www.stanford.edu'
    },
    website: 'https://www.stanford.edu',
    principalName: 'Marc Tessier-Lavigne',
    description: 'A leading private research university known for its academic excellence and innovation.',
    isActive: true
  },
  {
    id: 'iit-bombay',
    name: 'Indian Institute of Technology Bombay',
    accreditation: 'NAAC A++',
    affiliation: 'Government Technical Institute',
    address: {
      street: 'Powai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400076'
    },
    contact: {
      phone: '+91-22-2572-2545',
      email: 'info@iitb.ac.in',
      website: 'https://www.iitb.ac.in'
    },
    website: 'https://www.iitb.ac.in',
    principalName: 'Subhasis Chaudhuri',
    description: 'Premier engineering and technology institute in India.',
    isActive: true
  },
  {
    id: 'university-cambridge',
    name: 'University of Cambridge',
    accreditation: 'Royal Charter',
    affiliation: 'Public Research University',
    address: {
      street: 'The Old Schools, Trinity Lane',
      city: 'Cambridge',
      state: 'Cambridgeshire',
      country: 'United Kingdom',
      postalCode: 'CB2 1TN'
    },
    contact: {
      phone: '+44-1223-337733',
      email: 'admissions@cam.ac.uk',
      website: 'https://www.cam.ac.uk'
    },
    website: 'https://www.cam.ac.uk',
    principalName: 'Stephen Toope',
    description: 'One of the world\'s oldest and most prestigious universities.',
    isActive: true
  },
  {
    id: 'community-college',
    name: 'Metro Community College',
    accreditation: 'Regional Accreditation',
    affiliation: 'Public Community College',
    address: {
      street: '1234 Education Boulevard',
      city: 'Metro City',
      state: 'State',
      country: 'Country',
      postalCode: '12345'
    },
    contact: {
      phone: '+1-555-123-4567',
      email: 'info@metro-cc.edu',
      website: 'https://www.metro-cc.edu'
    },
    website: 'https://www.metro-cc.edu',
    principalName: 'Dr. Sarah Johnson',
    description: 'Community college serving local educational needs.',
    isActive: true
  }
];

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
    category: 'Programming',
    subcategory: 'Web Development',
    level: 'Beginner',
    price: 199.99,
    duration: '12 weeks',
    tags: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js'],
    skills: ['Frontend Development', 'Backend Development', 'Full Stack'],
    prerequisites: ['Basic computer literacy'],
    whatYouWillLearn: [
      'Build responsive websites with HTML and CSS',
      'Master JavaScript programming fundamentals',
      'Create interactive web applications with React',
      'Develop server-side applications with Node.js',
      'Deploy applications to production'
    ],
    targetAudience: ['Beginners to programming', 'Career changers', 'Students']
  },
  {
    title: 'Machine Learning Fundamentals',
    description: 'Comprehensive introduction to machine learning concepts, algorithms, and practical applications',
    category: 'Data Science',
    subcategory: 'Machine Learning',
    level: 'Intermediate',
    price: 299.99,
    duration: '8 weeks',
    tags: ['Python', 'Scikit-learn', 'Data Analysis', 'ML Algorithms'],
    skills: ['Data Analysis', 'Statistical Modeling', 'Python Programming'],
    prerequisites: ['Basic Python knowledge', 'Statistics fundamentals'],
    whatYouWillLearn: [
      'Understand machine learning concepts and terminology',
      'Implement supervised and unsupervised learning algorithms',
      'Perform data preprocessing and feature engineering',
      'Evaluate and optimize model performance',
      'Apply ML to real-world problems'
    ],
    targetAudience: ['Data analysts', 'Software developers', 'Research students']
  },
  {
    title: 'Mechanical Design Principles',
    description: 'Learn fundamental principles of mechanical design and CAD modeling',
    category: 'Engineering',
    subcategory: 'Mechanical Engineering',
    level: 'Intermediate',
    price: 249.99,
    duration: '10 weeks',
    tags: ['CAD', 'SolidWorks', 'Design', 'Manufacturing'],
    skills: ['CAD Modeling', 'Design Analysis', 'Manufacturing Processes'],
    prerequisites: ['Basic engineering mathematics', 'Physics fundamentals'],
    whatYouWillLearn: [
      'Master CAD software for 3D modeling',
      'Understand design principles and constraints',
      'Analyze stress and strain in mechanical components',
      'Design for manufacturing and assembly',
      'Create technical drawings and documentation'
    ],
    targetAudience: ['Engineering students', 'Design professionals', 'Manufacturing engineers']
  },
  {
    title: 'Digital Marketing Strategy',
    description: 'Comprehensive guide to digital marketing including SEO, social media, and analytics',
    category: 'Business',
    subcategory: 'Marketing',
    level: 'Beginner',
    price: 179.99,
    duration: '6 weeks',
    tags: ['SEO', 'Social Media', 'Analytics', 'Content Marketing'],
    skills: ['Digital Strategy', 'Content Creation', 'Data Analysis'],
    prerequisites: ['Basic business understanding'],
    whatYouWillLearn: [
      'Develop comprehensive digital marketing strategies',
      'Optimize websites for search engines',
      'Create engaging social media campaigns',
      'Analyze marketing performance with data',
      'Build brand awareness online'
    ],
    targetAudience: ['Marketing professionals', 'Business owners', 'Entrepreneurs']
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

function generateMockQuestions(topicTitle, questionCount = 5) {
  const questionTypes = ['multiple_choice', 'true_false', 'short_answer'];
  const questions = [];
  
  for (let i = 0; i < questionCount; i++) {
    const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    
    let question = {
      questionText: `Question ${i + 1}: What is an important concept in ${topicTitle}?`,
      questionType: questionType,
      points: 5,
      difficulty: ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)],
      tags: ['concept', 'understanding'],
      explanation: `This question tests understanding of key concepts in ${topicTitle}.`,
      order: i + 1,
      isActive: true
    };
    
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
  
  const batch = writeBatch(db);
  
  for (const college of MOCK_COLLEGES) {
    const collegeData = {
      ...college,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: 'seed-script'
    };
    
    const collegeRef = doc(db, 'colleges', college.id);
    batch.set(collegeRef, collegeData);
    
    createdData.colleges.push({
      id: college.id,
      name: college.name,
      ...collegeData
    });
  }
  
  await batch.commit();
  console.log(`✅ Created ${MOCK_COLLEGES.length} colleges`);
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  
  // Seed superadmins
  for (const userData of MOCK_USERS.superadmins) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;
      
      await updateProfile(user, { 
        displayName: `${userData.firstName} ${userData.lastName}` 
      });
      
      const userProfile = {
        uid: user.uid,
        email: user.email,
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
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      createdData.users.superadmins.push({ uid: user.uid, ...userProfile });
      
      console.log(`   ✅ Created superadmin: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
  
  // Seed instructors
  for (const userData of MOCK_USERS.instructors) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;
      
      await updateProfile(user, { 
        displayName: `${userData.firstName} ${userData.lastName}` 
      });
      
      const userProfile = {
        uid: user.uid,
        email: user.email,
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
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      createdData.users.instructors.push({ uid: user.uid, ...userProfile });
      
      console.log(`   ✅ Created instructor: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
  
  // Seed students
  for (const userData of MOCK_USERS.students) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;
      
      await updateProfile(user, { 
        displayName: `${userData.firstName} ${userData.lastName}` 
      });
      
      const userProfile = {
        uid: user.uid,
        email: user.email,
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
      
      await setDoc(doc(db, 'users', user.uid), userProfile);
      createdData.users.students.push({ uid: user.uid, ...userProfile });
      
      console.log(`   ✅ Created student: ${userData.email}`);
    } catch (error) {
      console.log(`   ⚠️  Skipped ${userData.email}: ${error.message}`);
    }
  }
  
  console.log(`✅ Created ${createdData.users.superadmins.length + createdData.users.instructors.length + createdData.users.students.length} users total`);
}

async function seedCollegeAdministrators() {
  console.log('👨‍💼 Seeding college administrators...');
  
  // If no users were created in this session, try to fetch existing users
  if (createdData.users.superadmins.length === 0) {
    try {
      // Get existing users from Firestore instead
      const usersSnapshot = await getDocs(collection(db, 'users'));
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
      const existingAdminSnapshot = await getDocs(query(
        collection(db, 'collegeAdministrators'),
        where('collegeId', '==', adminData.collegeId),
        where('instructorId', '==', instructor.uid),
        where('isActive', '==', true)
      ));
      
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
      
      const adminRef = await addDoc(collection(db, 'collegeAdministrators'), administratorDoc);
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
      ...courseTemplate,
      instructor: instructor.displayName,
      instructorId: instructor.uid,
      currency: 'USD',
      originalPrice: courseTemplate.price + 100,
      status: 'published',
      isPublished: true,
      featured: Math.random() > 0.5,
      rating: 4.0 + Math.random() * 1.0, // 4.0-5.0
      ratingCount: Math.floor(Math.random() * 100) + 20,
      enrollmentCount: Math.floor(Math.random() * 200) + 50,
      completionCount: Math.floor(Math.random() * 100) + 10,
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
      seoTitle: `${courseTemplate.title} - Learn ${courseTemplate.category}`,
      seoDescription: courseTemplate.description,
      seoKeywords: courseTemplate.tags,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const courseRef = await addDoc(collection(db, 'courses'), courseData);
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
      
      const topicRef = await addDoc(collection(db, 'courseTopics'), topicDoc);
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
      
      const questionRef = await addDoc(collection(db, 'courseQuestions'), questionDoc);
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
      
      const enrollmentRef = await addDoc(collection(db, 'enrollments'), enrollmentData);
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
        userId: instructor.uid,
        userRole: 'instructor',
        action: 'course_created',
        entityType: 'course',
        entityId: course.id,
        entityTitle: course.title,
        description: `Created course "${course.title}"`,
        metadata: {
          courseId: course.id,
          courseTitle: course.title,
          category: course.category
        },
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'activities'), courseCreatedActivity);
      totalActivities++;
      
      // Create topic activities
      const courseTopics = createdData.topics.filter(t => t.courseId === course.id);
      for (const topic of courseTopics.slice(0, 2)) { // Limit activities
        const topicActivity = {
          userId: instructor.uid,
          userRole: 'instructor',
          action: 'topic_added',
          entityType: 'topic',
          entityId: topic.id,
          entityTitle: topic.title,
          description: `Added topic "${topic.title}" to course "${course.title}"`,
          metadata: {
            courseId: course.id,
            topicId: topic.id,
            topicTitle: topic.title
          },
          timestamp: serverTimestamp(),
          createdAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'activities'), topicActivity);
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
        userId: enrollment.instructorId,
        userRole: 'instructor',
        action: 'student_enrolled',
        entityType: 'enrollment',
        entityId: enrollment.id,
        entityTitle: `${student.displayName} enrolled in ${course.title}`,
        description: `Student ${student.displayName} enrolled in course "${course.title}"`,
        metadata: {
          studentId: student.uid,
          studentName: student.displayName,
          courseId: course.id,
          courseTitle: course.title
        },
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'activities'), enrollmentActivity);
      totalActivities++;
    }
  }
  
  console.log(`✅ Created ${totalActivities} activities`);
}

// ==================== MAIN SEEDING FUNCTION ====================

async function seedDatabase() {
  console.log('🌱 QuestAdmin Database Seed Script');
  console.log('=' .repeat(50));
  
  const startTime = Date.now();
  
  try {
    // Step 1: Seed colleges (master data)
    await seedColleges();
    
    // Step 2: Seed users (superadmin, instructors, students)
    await seedUsers();
    
    // Step 3: Seed college administrators
    await seedCollegeAdministrators();
    
    // Step 4: Seed courses linked to instructors
    await seedCourses();
    
    // Step 5: Seed topics for courses
    await seedTopics();
    
    // Step 6: Seed questions and answers for courses
    await seedQuestions();
    
    // Step 7: Seed student enrollments
    await seedEnrollments();
    
    // Step 8: Seed instructor activities
    await seedActivities();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Colleges: ${createdData.colleges.length}`);
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
  
  await seedDatabase();
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
  seedUsers, 
  seedCollegeAdministrators,
  seedCourses, 
  seedTopics, 
  seedQuestions, 
  seedEnrollments, 
  seedActivities 
};
