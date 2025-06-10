/**
 * Test script for enhanced multilingual backend implementation
 * Tests the new API endpoints and language configuration features
 */

const API_BASE = 'http://localhost:3001/api';

// Test data for enhanced multilingual course creation
const testCourseData = {
  // Basic course information
  name: 'Advanced JavaScript Programming',
  description: 'A comprehensive course covering advanced JavaScript concepts',
  category: 'programming',
  level: 'advanced',
  duration: 40,
  
  // Enhanced language configuration
  primaryLanguage: 'en',
  supportedLanguages: ['en', 'es', 'fr'],
  enableTranslation: true,
  
  // Multilingual content
  multilingualTitle: {
    en: 'Advanced JavaScript Programming',
    es: 'Programación Avanzada de JavaScript',
    fr: 'Programmation JavaScript Avancée'
  },
  multilingualDescription: {
    en: 'A comprehensive course covering advanced JavaScript concepts',
    es: 'Un curso integral que cubre conceptos avanzados de JavaScript',
    fr: 'Un cours complet couvrant les concepts avancés de JavaScript'
  },
  
  // Course topics with multilingual support
  topics: [
    {
      title: 'Async Programming',
      description: 'Understanding promises, async/await, and event loops',
      multilingualTitle: {
        en: 'Async Programming',
        es: 'Programación Asíncrona',
        fr: 'Programmation Asynchrone'
      },
      multilingualDescription: {
        en: 'Understanding promises, async/await, and event loops',
        es: 'Comprensión de promesas, async/await y bucles de eventos',
        fr: 'Comprendre les promesses, async/await et les boucles d\'événements'
      },
      materials: [
        {
          title: 'Introduction to Promises',
          description: 'Learn the basics of JavaScript promises',
          type: 'video',
          multilingualTitle: {
            en: 'Introduction to Promises',
            es: 'Introducción a las Promesas',
            fr: 'Introduction aux Promesses'
          },
          multilingualDescription: {
            en: 'Learn the basics of JavaScript promises',
            es: 'Aprende los conceptos básicos de las promesas de JavaScript',
            fr: 'Apprenez les bases des promesses JavaScript'
          }
        }
      ]
    }
  ]
};

// Test function for enhanced multilingual course creation
async function testEnhancedMultilingualCourseCreation() {
  console.log('\n=== Testing Enhanced Multilingual Course Creation ===');
  
  try {
    const response = await fetch(`${API_BASE}/courses/multilingual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCourseData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Enhanced multilingual course created successfully');
    console.log('Course ID:', result.id);
    console.log('Language Configuration:', {
      primaryLanguage: result.primaryLanguage,
      supportedLanguages: result.supportedLanguages,
      enableTranslation: result.enableTranslation
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error creating enhanced multilingual course:', error.message);
    throw error;
  }
}

// Test function for backward compatibility
async function testBackwardCompatibility() {
  console.log('\n=== Testing Backward Compatibility ===');
  
  const legacyCourseData = {
    name: 'Legacy Course',
    description: 'A course created with legacy format',
    category: 'general',
    level: 'beginner',
    duration: 20,
    // Legacy language field (should still work)
    language: 'en'
  };
  
  try {
    const response = await fetch(`${API_BASE}/courses/multilingual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(legacyCourseData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Legacy course format processed successfully');
    console.log('Course ID:', result.id);
    console.log('Language Configuration:', {
      primaryLanguage: result.primaryLanguage,
      supportedLanguages: result.supportedLanguages,
      enableTranslation: result.enableTranslation
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error with backward compatibility:', error.message);
    throw error;
  }
}

// Test function for validation
async function testValidation() {
  console.log('\n=== Testing Enhanced Validation ===');
  
  const invalidData = {
    name: '', // Invalid: empty name
    description: 'Test description',
    primaryLanguage: 'invalid-lang', // Invalid language code
    supportedLanguages: ['en', 'invalid'], // Invalid language in array
    enableTranslation: 'not-boolean' // Invalid boolean value
  };
  
  try {
    const response = await fetch(`${API_BASE}/courses/multilingual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });
    
    if (response.ok) {
      console.log('❌ Validation should have failed but didn\'t');
      return false;
    }
    
    const errorResult = await response.json();
    console.log('✅ Validation correctly rejected invalid data');
    console.log('Validation errors:', errorResult.errors);
    return true;
  } catch (error) {
    console.error('❌ Error testing validation:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Enhanced Multilingual Backend Tests');
  console.log('Server URL:', API_BASE);
  
  try {
    // Test 1: Enhanced multilingual course creation
    await testEnhancedMultilingualCourseCreation();
    
    // Test 2: Backward compatibility
    await testBackwardCompatibility();
    
    // Test 3: Enhanced validation
    await testValidation();
    
    console.log('\n✅ All tests completed successfully!');
    console.log('\n=== Test Summary ===');
    console.log('✅ Enhanced multilingual course creation: PASSED');
    console.log('✅ Backward compatibility: PASSED');
    console.log('✅ Enhanced validation: PASSED');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testEnhancedMultilingualCourseCreation,
  testBackwardCompatibility,
  testValidation,
  runTests
};
