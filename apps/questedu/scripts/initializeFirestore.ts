import { seedCourses } from '../firebase/seedData';

// This script should be run once to initialize your Firestore database with sample data
// To run: npx expo start and then navigate to this file in the console

const initializeDatabase = async () => {
  try {
    console.log('🚀 Initializing Firestore database...');
    await seedCourses();
    console.log('✅ Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

// Export for manual execution
export { initializeDatabase };

// Uncomment the line below to auto-run when the file is imported
// initializeDatabase();
