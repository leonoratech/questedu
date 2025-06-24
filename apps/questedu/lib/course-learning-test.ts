/**
 * Simple test for Course Learning Service
 * Run this in a React Native environment to verify functionality
 */

import { getCourseLearningData, getCourseTopics } from '../lib/course-learning-service';

// Test function to verify learning service
export const testCourseLearningService = async () => {
  console.log('🧪 Testing Course Learning Service...');
  
  try {
    // Test with a sample course ID (replace with actual ID from your Firebase)
    const testCourseId = 'sample-course-id';
    
    console.log('📚 Testing getCourseTopics...');
    const topics = await getCourseTopics(testCourseId);
    console.log(`✅ Found ${topics.length} topics`);
    
    console.log('📱 Testing getCourseLearningData...');
    const learningData = await getCourseLearningData(testCourseId);
    
    if (learningData) {
      console.log(`✅ Learning data loaded successfully:`);
      console.log(`   - Course: ${learningData.course.title}`);
      console.log(`   - Slides: ${learningData.slides.length}`);
      console.log(`   - Current Index: ${learningData.currentIndex}`);
      console.log(`   - Progress: ${learningData.session.completionPercentage.toFixed(1)}%`);
    } else {
      console.log('❌ Failed to load learning data');
    }
    
    console.log('🎉 Course Learning Service test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Example usage:
// import { testCourseLearningService } from './path/to/this/file';
// testCourseLearningService();
