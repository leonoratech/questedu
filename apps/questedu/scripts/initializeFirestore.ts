import { initializeDatabase } from '../lib/diagnostics';

// This script should be run once to initialize your Firestore database with sample data
// To run: npx expo start and then navigate to this file in the console

const runInitialization = async () => {
  try {
    console.log('🚀 Initializing Firestore database...');
    await initializeDatabase();
    console.log('✅ Database initialization complete!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
};

// Export for manual execution
export { runInitialization };

// Uncomment the line below to auto-run when the file is imported
// runInitialization();
