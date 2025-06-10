/**
 * Database Migration Script: Add Language Configuration to Existing Courses
 * 
 * This script adds default language configuration fields to existing courses
 * to ensure backward compatibility with the enhanced multilingual schema
 */

import { initializeApp } from 'firebase/app'
import {
    collection,
    doc,
    getDocs,
    getFirestore,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore'

// Firebase configuration (use environment variables in production)
const firebaseConfig = {
  // Add your Firebase config here
  // This should match your Firebase project configuration
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface CourseDocument {
  id: string
  [key: string]: any
}

/**
 * Add language configuration to courses that don't have it
 */
async function migrateCourseLanguageConfig() {
  console.log('🚀 Starting course language configuration migration...')
  
  try {
    // Get all courses
    const coursesRef = collection(db, 'courses')
    const snapshot = await getDocs(coursesRef)
    
    console.log(`📊 Found ${snapshot.docs.length} courses to process`)
    
    let updateCount = 0
    let skipCount = 0
    
    for (const courseDoc of snapshot.docs) {
      const courseData = courseDoc.data() as CourseDocument
      const courseId = courseDoc.id
      
      // Check if course already has language configuration
      if (courseData.primaryLanguage && courseData.supportedLanguages) {
        console.log(`⏭️  Course "${courseData.title}" already has language config, skipping`)
        skipCount++
        continue
      }
      
      // Determine primary language from existing data
      const primaryLanguage = courseData.language || 'en'
      
      // Create language configuration
      const languageConfig = {
        primaryLanguage: primaryLanguage,
        supportedLanguages: [primaryLanguage],
        enableTranslation: false,
        updatedAt: serverTimestamp()
      }
      
      // Add subtitle languages if they exist
      if (courseData.subtitles && Array.isArray(courseData.subtitles)) {
        const additionalLanguages = courseData.subtitles.filter(lang => lang !== primaryLanguage)
        languageConfig.supportedLanguages = [primaryLanguage, ...additionalLanguages]
      }
      
      try {
        // Update the course document
        await updateDoc(doc(db, 'courses', courseId), languageConfig)
        console.log(`✅ Updated course "${courseData.title}" with language config:`, {
          primaryLanguage: languageConfig.primaryLanguage,
          supportedLanguages: languageConfig.supportedLanguages
        })
        updateCount++
      } catch (error) {
        console.error(`❌ Failed to update course "${courseData.title}":`, error)
      }
    }
    
    console.log('\n🎉 Migration completed!')
    console.log(`📊 Summary:`)
    console.log(`   ✅ Updated: ${updateCount} courses`)
    console.log(`   ⏭️  Skipped: ${skipCount} courses`)
    console.log(`   📋 Total: ${snapshot.docs.length} courses`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

/**
 * Add language configuration to course topics that don't have it
 */
async function migrateCourseTopicLanguageConfig() {
  console.log('\n🚀 Starting course topic language configuration migration...')
  
  try {
    // Get all course topics
    const topicsRef = collection(db, 'course_topics')
    const snapshot = await getDocs(topicsRef)
    
    console.log(`📊 Found ${snapshot.docs.length} course topics to process`)
    
    let updateCount = 0
    let skipCount = 0
    
    for (const topicDoc of snapshot.docs) {
      const topicData = topicDoc.data()
      const topicId = topicDoc.id
      
      // Check if topic already has multilingual fields
      if (topicData.multilingualTitle) {
        console.log(`⏭️  Topic "${topicData.title}" already has multilingual config, skipping`)
        skipCount++
        continue
      }
      
      // For now, just add the updatedAt timestamp to indicate migration processed
      // Multilingual content will be added when topics are edited in the UI
      const migrationUpdate = {
        updatedAt: serverTimestamp()
      }
      
      try {
        await updateDoc(doc(db, 'course_topics', topicId), migrationUpdate)
        console.log(`✅ Processed topic "${topicData.title}"`)
        updateCount++
      } catch (error) {
        console.error(`❌ Failed to process topic "${topicData.title}":`, error)
      }
    }
    
    console.log('\n🎉 Topic migration completed!')
    console.log(`📊 Summary:`)
    console.log(`   ✅ Processed: ${updateCount} topics`)
    console.log(`   ⏭️  Skipped: ${skipCount} topics`)
    console.log(`   📋 Total: ${snapshot.docs.length} topics`)
    
  } catch (error) {
    console.error('❌ Topic migration failed:', error)
    throw error
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🔄 Starting database migration for multilingual support...\n')
  
  try {
    await migrateCourseLanguageConfig()
    await migrateCourseTopicLanguageConfig()
    
    console.log('\n🎊 All migrations completed successfully!')
    console.log('\n📝 Next steps:')
    console.log('   1. Verify the changes in Firebase console')
    console.log('   2. Test course creation with new multilingual API')
    console.log('   3. Test existing courses still work correctly')
    console.log('   4. Begin adding multilingual content to courses')
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✨ Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error)
      process.exit(1)
    })
}

export { migrateCourseLanguageConfig, migrateCourseTopicLanguageConfig, runMigration }
