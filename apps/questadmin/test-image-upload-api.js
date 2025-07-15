/**
 * Quick test to verify the image upload API response
 */

// Test the API endpoint response format
async function testImageUploadAPI() {
  console.log('🔍 Testing Image Upload API Response...');
  
  try {
    // Test with a simple POST request (this will fail but we can see the response format)
    const response = await fetch('http://localhost:3002/api/courses/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: 'data'
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('Parsed JSON:', responseJson);
    } catch (e) {
      console.log('Could not parse as JSON:', e.message);
    }
    
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Test with proper form data format
async function testWithFormData() {
  console.log('\n🔍 Testing with FormData...');
  
  try {
    const formData = new FormData();
    // Add dummy data
    formData.append('courseId', 'temp-123456789');
    formData.append('instructorId', 'test-instructor');
    formData.append('quality', '0.8');
    
    // Create a fake file blob
    const fakeFile = new Blob(['fake image data'], { type: 'image/jpeg' });
    formData.append('file', fakeFile, 'test.jpg');
    
    const response = await fetch('http://localhost:3002/api/courses/images', {
      method: 'POST',
      body: formData
    });
    
    console.log('FormData Response status:', response.status);
    
    const responseText = await response.text();
    console.log('FormData Response text:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('FormData Parsed JSON:', responseJson);
    } catch (e) {
      console.log('FormData Could not parse as JSON:', e.message);
    }
    
  } catch (error) {
    console.error('FormData fetch error:', error);
  }
}

// Run tests
testImageUploadAPI();
setTimeout(() => {
  testWithFormData();
}, 2000);
