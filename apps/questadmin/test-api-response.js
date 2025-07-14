/**
 * Test script to check the actual API response format
 */

async function testApiResponse() {
  console.log('🧪 Testing API Response Format');
  
  // Use a different approach since fetch might not be available in Node.js
  const testUrl = 'http://localhost:3001/api/courses/images';
  
  console.log('\n📡 Testing API endpoint:', testUrl);
  
  try {
    // Test using curl to see the response format
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    console.log('\n📋 Testing with curl...');
    
    // Test unauthorized request first
    const curlCommand = `curl -X POST ${testUrl} -H "Content-Type: application/json" -d '{"courseId":"temp-1736899800000","instructorId":"test-instructor"}' -i`;
    
    console.log('Executing:', curlCommand);
    
    const { stdout, stderr } = await execAsync(curlCommand);
    
    console.log('\n📊 Response:');
    console.log(stdout);
    
    if (stderr) {
      console.log('\n⚠️ Stderr:', stderr);
    }
    
    // Parse the response
    const lines = stdout.split('\n');
    const headerEndIndex = lines.findIndex(line => line === '');
    const headers = lines.slice(0, headerEndIndex);
    const body = lines.slice(headerEndIndex + 1).join('\n').trim();
    
    console.log('\n📄 Response Headers:');
    headers.forEach(header => console.log(header));
    
    console.log('\n📄 Response Body:');
    console.log('Length:', body.length);
    console.log('Content:', body);
    
    // Try to parse as JSON
    try {
      const jsonResponse = JSON.parse(body);
      console.log('\n✅ JSON Parse Success:');
      console.log(JSON.stringify(jsonResponse, null, 2));
    } catch (parseError) {
      console.log('\n❌ JSON Parse Failed:', parseError.message);
      console.log('Raw body content:', JSON.stringify(body));
    }
    
  } catch (error) {
    console.error('\n💥 Request Failed:', error.message);
  }
}

testApiResponse();
