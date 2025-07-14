// Environment variables for testing
process.env.NODE_ENV = 'test'

// Mock environment variables for storage providers
process.env.STORAGE_PROVIDER = 'firebase'
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project'
process.env.FIREBASE_PROJECT_ID = 'test-project'
process.env.FIREBASE_STORAGE_BUCKET = 'test-bucket'

// Supabase test environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'
process.env.SUPABASE_STORAGE_BUCKET = 'test-bucket'

// JWT secret for auth tests
process.env.JWT_SECRET = 'test-jwt-secret'
