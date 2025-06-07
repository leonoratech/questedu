// Test script to verify date transformation is working
const fetch = require('node-fetch');

async function testDateTransformation() {
  try {
    console.log('Testing date transformation...');
    
    // Fetch courses from API
    const response = await fetch('http://localhost:3001/api/courses?instructorId=XMKSHrPZLFUS78BfBSZBVakA3O33');
    const data = await response.json();
    
    if (data.success && data.courses && data.courses.length > 0) {
      const course = data.courses[0];
      console.log('Raw course data:', JSON.stringify(course, null, 2));
      
      // Test the transformation function manually
      const transformCourseData = (courseData) => {
        return {
          ...courseData,
          createdAt: courseData.createdAt && courseData.createdAt.seconds 
            ? new Date(courseData.createdAt.seconds * 1000) 
            : courseData.createdAt 
              ? new Date(courseData.createdAt) 
              : undefined,
          updatedAt: courseData.updatedAt && courseData.updatedAt.seconds 
            ? new Date(courseData.updatedAt.seconds * 1000) 
            : courseData.updatedAt 
              ? new Date(courseData.updatedAt) 
              : undefined
        }
      };
      
      const transformedCourse = transformCourseData(course);
      console.log('\nTransformed createdAt:', transformedCourse.createdAt);
      console.log('Is Date object:', transformedCourse.createdAt instanceof Date);
      console.log('toLocaleDateString():', transformedCourse.createdAt?.toLocaleDateString());
      
    } else {
      console.log('No courses found for test');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDateTransformation();
