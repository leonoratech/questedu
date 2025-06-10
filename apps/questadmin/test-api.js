/**
 * Test script for enhanced multilingual backend implementation
 */

// Test using curl for API verification
const { spawn } = require('child_process');

const API_BASE = 'http://localhost:3001/api';

// Test data for enhanced multilingual course creation
const testCourseData = {
  name: 'Advanced JavaScript Programming',
  description: 'A comprehensive course covering advanced JavaScript concepts',
  category: 'programming',
  level: 'advanced', 
  duration: 40,
  primaryLanguage: 'en',
  supportedLanguages: ['en', 'es', 'fr'],
  enableTranslation: true,
  multilingualTitle: {
    en: 'Advanced JavaScript Programming',
    es: 'Programación Avanzada de JavaScript',
    fr: 'Programmation JavaScript Avancée'
  },
  multilingualDescription: {
    en: 'A comprehensive course covering advanced JavaScript concepts',
    es: 'Un curso integral que cubre conceptos avanzados de JavaScript', 
    fr: 'Un cours complet couvrant les concepts avancés de JavaScript'
  }
};

console.log('🚀 Testing Enhanced Multilingual Backend Implementation');
console.log('📡 API Endpoint:', `${API_BASE}/courses/multilingual`);
console.log('📦 Test Data:', JSON.stringify(testCourseData, null, 2));

// Test with curl command
const curlCommand = [
  'curl',
  '-X', 'POST',
  '-H', 'Content-Type: application/json',
  '-d', JSON.stringify(testCourseData),
  `${API_BASE}/courses/multilingual`
];

console.log('\n🔧 Running curl command...');
console.log(curlCommand.join(' '));

const curl = spawn('curl', curlCommand.slice(1));

curl.stdout.on('data', (data) => {
  console.log('\n✅ API Response:');
  console.log(data.toString());
});

curl.stderr.on('data', (data) => {
  console.error('\n❌ Error:', data.toString());
});

curl.on('close', (code) => {
  console.log(`\n🏁 Test completed with exit code: ${code}`);
  if (code === 0) {
    console.log('✅ Enhanced multilingual backend test PASSED');
  } else {
    console.log('❌ Enhanced multilingual backend test FAILED');
  }
});
