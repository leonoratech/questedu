/**
 * Seed Data Script for QuestAdmin Application
 * 
 * This script clears existing data and seeds the database with initial data
 * following the data model defined in data/models
 */

import { adminAuth, adminDb } from '../lib/firebase/admin'
import { College } from '../data/models/college'
import { Department } from '../data/models/department'
import { Program } from '../data/models/program'
import { Subject } from '../data/models/subject'
import { UserProfile, UserRole } from '../**
 * Execute the seeding script
 */
async function runSeed() {
  const seeder = new DatabaseSeeder()
  const args = process.argv.slice(2)
  const clearOnly = args.includes('--clear-only')
  
  try {
    if (clearOnly) {
      console.log('🧹 Clearing database only...')
      await seeder['clearDatabase']()
      console.log('✅ Database cleared successfully!')
    } else {
      await seeder.seed()
      console.log('\n🎉 Database seeding completed successfully!')
      console.log('\nDefault Login Credentials:')
      console.log('Superadmin: admin@questcollege.edu.in / admin123456')
      console.log('Instructor: dr.smith@questcollege.edu.in / instructor123')
      console.log('Student: student1@questcollege.edu.in / student123')
    }
    process.exit(0)
  } catch (error) {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  }
}odel'

interface SeedUser {
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  departmentName?: string
  programName?: string
}

class DatabaseSeeder {
  private collegeId: string = ''
  private departmentIds: Map<string, string> = new Map()
  private programIds: Map<string, string> = new Map()
  private userIds: Map<string, string> = new Map()

  /**
   * Main function to clear and seed the database
   */
  async seed() {
    try {
      console.log('🚀 Starting database seeding...')
      
      // Clear existing data
      await this.clearDatabase()
      
      // Seed data in correct order (dependencies first)
      await this.seedCollege()
      await this.seedDepartments()
      await this.seedPrograms()
      await this.seedUsers()
      await this.seedSubjects()
      
      console.log('✅ Database seeding completed successfully!')
      console.log('\nSeeded Data Summary:')
      console.log(`College: 1`)
      console.log(`Departments: ${this.departmentIds.size}`)
      console.log(`Programs: ${this.programIds.size}`)
      console.log(`Users: ${this.userIds.size}`)
      
    } catch (error) {
      console.error('❌ Error during database seeding:', error)
      throw error
    }
  }

  /**
   * Clear all collections in the database
   */
  private async clearDatabase() {
    console.log('🧹 Clearing existing database...')
    
    const collections = ['colleges', 'departments', 'programs', 'subjects', 'users']
    
    for (const collectionName of collections) {
      const collection = adminDb.collection(collectionName)
      const snapshot = await collection.get()
      
      if (!snapshot.empty) {
        const batch = adminDb.batch()
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref)
        })
        await batch.commit()
        console.log(`  ✓ Cleared ${collectionName} collection`)
      }
    }

    // Clear Firebase Auth users (except service accounts)
    try {
      const listUsersResult = await adminAuth.listUsers()
      const deletePromises = listUsersResult.users
        .filter(user => !user.email?.includes('firebase-adminsdk'))
        .map(user => adminAuth.deleteUser(user.uid))
      
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises)
        console.log(`  ✓ Cleared ${deletePromises.length} Firebase Auth users`)
      }
    } catch (error) {
      console.warn('  ⚠️ Warning: Could not clear Firebase Auth users:', error)
    }
  }

  /**
   * Seed college data (only one college as per requirements)
   */
  private async seedCollege() {
    console.log('🏫 Seeding college...')
    
    const collegeData: Omit<College, 'id'> = {
      name: 'Quest College of Science and Technology',
      accreditation: 'NAAC A+ Grade',
      affiliation: 'State University',
      address: {
        street: '123 Education Street',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500001'
      },
      contact: {
        phone: '+91-40-12345678',
        email: 'info@questcollege.edu.in',
        website: 'https://questcollege.edu.in'
      },
      website: 'https://questcollege.edu.in',
      principalName: 'Dr. Rajesh Kumar',
      description: 'A premier institution offering quality education in Science and Technology',
      establishedYear: 1995,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const docRef = await adminDb.collection('colleges').add(collegeData)
    this.collegeId = docRef.id
    console.log(`  ✓ Created college: ${collegeData.name}`)
  }

  /**
   * Seed departments
   */
  private async seedDepartments() {
    console.log('🏢 Seeding departments...')
    
    const departments = [
      {
        name: 'Computer Science',
        description: 'Department of Computer Science and Information Technology'
      },
      {
        name: 'Mathematics',
        description: 'Department of Mathematics and Statistics'
      },
      {
        name: 'Physics',
        description: 'Department of Physics and Applied Physics'
      },
      {
        name: 'Chemistry',
        description: 'Department of Chemistry and Biochemistry'
      },
      {
        name: 'Commerce',
        description: 'Department of Commerce and Business Studies'
      }
    ]

    for (const dept of departments) {
      const departmentData: Omit<Department, 'id'> = {
        ...dept,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await adminDb.collection('departments').add(departmentData)
      this.departmentIds.set(dept.name, docRef.id)
      console.log(`  ✓ Created department: ${dept.name}`)
    }
  }

  /**
   * Seed programs
   */
  private async seedPrograms() {
    console.log('📚 Seeding programs...')
    
    const programs = [
      // Computer Science programs
      {
        name: 'MPC (Mathematics, Physics, Computer Science)',
        departmentName: 'Computer Science',
        years: 2,
        description: 'Intermediate course in Mathematics, Physics, and Computer Science',
        medium: 'English' as const
      },
      {
        name: 'CEC (Computer Science, Electronics, Chemistry)',
        departmentName: 'Computer Science',
        years: 2,
        description: 'Intermediate course in Computer Science, Electronics, and Chemistry',
        medium: 'English' as const
      },
      // Commerce programs
      {
        name: 'HEC (History, Economics, Civics)',
        departmentName: 'Commerce',
        years: 2,
        description: 'Intermediate course in History, Economics, and Civics',
        medium: 'English' as const
      },
      {
        name: 'CEC Telugu Medium',
        departmentName: 'Computer Science',
        years: 2,
        description: 'Intermediate course in Computer Science, Electronics, and Chemistry (Telugu Medium)',
        medium: 'Telugu' as const
      }
    ]

    for (const prog of programs) {
      const departmentId = this.departmentIds.get(prog.departmentName)
      if (!departmentId) {
        throw new Error(`Department not found: ${prog.departmentName}`)
      }

      const programData: Omit<Program, 'id'> = {
        name: prog.name,
        departmentId,
        years: prog.years,
        description: prog.description,
        medium: prog.medium,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await adminDb.collection('programs').add(programData)
      this.programIds.set(prog.name, docRef.id)
      console.log(`  ✓ Created program: ${prog.name}`)
    }
  }

  /**
   * Seed users (superadmin, instructors, students)
   */
  private async seedUsers() {
    console.log('👥 Seeding users...')
    
    const users: SeedUser[] = [
      // Superadmin
      {
        email: 'admin@questcollege.edu.in',
        password: 'admin123456',
        firstName: 'System',
        lastName: 'Administrator',
        role: UserRole.SUPERADMIN
      },
      // Instructors
      {
        email: 'dr.smith@questcollege.edu.in',
        password: 'instructor123',
        firstName: 'John',
        lastName: 'Smith',
        role: UserRole.INSTRUCTOR,
        departmentName: 'Computer Science'
      },
      {
        email: 'prof.patel@questcollege.edu.in',
        password: 'instructor123',
        firstName: 'Priya',
        lastName: 'Patel',
        role: UserRole.INSTRUCTOR,
        departmentName: 'Mathematics'
      },
      {
        email: 'dr.kumar@questcollege.edu.in',
        password: 'instructor123',
        firstName: 'Arun',
        lastName: 'Kumar',
        role: UserRole.INSTRUCTOR,
        departmentName: 'Physics'
      },
      {
        email: 'prof.reddy@questcollege.edu.in',
        password: 'instructor123',
        firstName: 'Lakshmi',
        lastName: 'Reddy',
        role: UserRole.INSTRUCTOR,
        departmentName: 'Commerce'
      },
      // Students
      {
        email: 'student1@questcollege.edu.in',
        password: 'student123',
        firstName: 'Rahul',
        lastName: 'Sharma',
        role: UserRole.STUDENT,
        departmentName: 'Computer Science',
        programName: 'MPC (Mathematics, Physics, Computer Science)'
      },
      {
        email: 'student2@questcollege.edu.in',
        password: 'student123',
        firstName: 'Anita',
        lastName: 'Gupta',
        role: UserRole.STUDENT,
        departmentName: 'Commerce',
        programName: 'HEC (History, Economics, Civics)'
      },
      {
        email: 'student3@questcollege.edu.in',
        password: 'student123',
        firstName: 'Vikram',
        lastName: 'Singh',
        role: UserRole.STUDENT,
        departmentName: 'Computer Science',
        programName: 'CEC (Computer Science, Electronics, Chemistry)'
      }
    ]

    for (const userData of users) {
      try {
        // Create Firebase Auth user
        const userRecord = await adminAuth.createUser({
          email: userData.email,
          password: userData.password,
          displayName: `${userData.firstName} ${userData.lastName}`,
          emailVerified: true
        })

        // Set custom claims for role
        await adminAuth.setCustomUserClaims(userRecord.uid, { 
          role: userData.role 
        })

        // Create user profile in Firestore
        const userProfileData: Omit<UserProfile, 'id'> = {
          uid: userRecord.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          displayName: `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          isActive: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          profileCompleted: true,
          ...(userData.departmentName && { 
            departmentId: this.departmentIds.get(userData.departmentName) 
          }),
          ...(userData.programName && { 
            programId: this.programIds.get(userData.programName) 
          })
        }

        const docRef = await adminDb.collection('users').add(userProfileData)
        this.userIds.set(userData.email, docRef.id)
        
        console.log(`  ✓ Created user: ${userData.firstName} ${userData.lastName} (${userData.role})`)
      } catch (error) {
        console.error(`  ❌ Failed to create user ${userData.email}:`, error)
      }
    }
  }

  /**
   * Seed subjects
   */
  private async seedSubjects() {
    console.log('📖 Seeding subjects...')
    
    // Get instructor IDs for assignment
    const instructorEmails = [
      'dr.smith@questcollege.edu.in',
      'prof.patel@questcollege.edu.in',
      'dr.kumar@questcollege.edu.in',
      'prof.reddy@questcollege.edu.in'
    ]

    const instructorIds: string[] = []
    for (const email of instructorEmails) {
      try {
        const userRecord = await adminAuth.getUserByEmail(email)
        instructorIds.push(userRecord.uid)
      } catch (error) {
        console.warn(`  ⚠️ Could not find instructor: ${email}`)
      }
    }

    const subjects = [
      // MPC Program subjects
      {
        name: 'Mathematics',
        programName: 'MPC (Mathematics, Physics, Computer Science)',
        year: 1,
        medium: 'English' as const,
        description: 'Advanced Mathematics including Calculus and Algebra'
      },
      {
        name: 'Physics',
        programName: 'MPC (Mathematics, Physics, Computer Science)',
        year: 1,
        medium: 'English' as const,
        description: 'Fundamental Physics concepts and laboratory work'
      },
      {
        name: 'Computer Science',
        programName: 'MPC (Mathematics, Physics, Computer Science)',
        year: 1,
        medium: 'English' as const,
        description: 'Programming fundamentals and computer concepts'
      },
      // CEC Program subjects
      {
        name: 'Computer Science',
        programName: 'CEC (Computer Science, Electronics, Chemistry)',
        year: 1,
        medium: 'English' as const,
        description: 'Programming and computer science fundamentals'
      },
      {
        name: 'Electronics',
        programName: 'CEC (Computer Science, Electronics, Chemistry)',
        year: 1,
        medium: 'English' as const,
        description: 'Basic electronics and circuit design'
      },
      {
        name: 'Chemistry',
        programName: 'CEC (Computer Science, Electronics, Chemistry)',
        year: 1,
        medium: 'English' as const,
        description: 'Organic and inorganic chemistry concepts'
      },
      // HEC Program subjects
      {
        name: 'History',
        programName: 'HEC (History, Economics, Civics)',
        year: 1,
        medium: 'English' as const,
        description: 'World history and Indian history'
      },
      {
        name: 'Economics',
        programName: 'HEC (History, Economics, Civics)',
        year: 1,
        medium: 'English' as const,
        description: 'Micro and macro economics principles'
      },
      {
        name: 'Civics',
        programName: 'HEC (History, Economics, Civics)',
        year: 1,
        medium: 'English' as const,
        description: 'Political science and governance'
      }
    ]

    let subjectIndex = 0
    for (const subj of subjects) {
      const programId = this.programIds.get(subj.programName)
      if (!programId) {
        console.warn(`  ⚠️ Program not found: ${subj.programName}`)
        continue
      }

      // Assign instructor in round-robin fashion
      const instructorId = instructorIds[subjectIndex % instructorIds.length]
      
      if (!instructorId) {
        console.warn(`  ⚠️ No instructor available for subject: ${subj.name}`)
        continue
      }

      const subjectData: Omit<Subject, 'id'> = {
        name: subj.name,
        programId,
        year: subj.year,
        medium: subj.medium,
        instructorId,
        description: subj.description,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await adminDb.collection('subjects').add(subjectData)
      console.log(`  ✓ Created subject: ${subj.name} for ${subj.programName}`)
      subjectIndex++
    }
  }
}

/**
 * Execute the seeding script
 */
async function runSeed() {
  const seeder = new DatabaseSeeder()
  
  try {
    await seeder.seed()
    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\nDefault Login Credentials:')
    console.log('Superadmin: admin@questcollege.edu.in / admin123456')
    console.log('Instructor: dr.smith@questcollege.edu.in / instructor123')
    console.log('Student: student1@questcollege.edu.in / student123')
    process.exit(0)
  } catch (error) {
    console.error('💥 Seeding failed:', error)
    process.exit(1)
  }
}

// Check if this script is being run directly
if (require.main === module) {
  runSeed()
}

export { DatabaseSeeder, runSeed }
