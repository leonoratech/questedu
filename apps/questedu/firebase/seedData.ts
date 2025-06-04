import { addCourse } from './courseService';

const initialCourses = [
  {
    title: 'Introduction to React Native',
    instructor: 'Jane Smith',
    progress: 75,
    image: 'https://picsum.photos/700?random=1',
    category: 'Development',
    description: 'Learn the fundamentals of React Native development'
  },
  {
    title: 'Advanced JavaScript Concepts',
    instructor: 'John Doe',
    progress: 30,
    image: 'https://picsum.photos/700?random=2',
    category: 'Development',
    description: 'Master advanced JavaScript concepts and patterns'
  },
  {
    title: 'UI/UX Design Principles',
    instructor: 'Sarah Johnson',
    progress: 100,
    image: 'https://picsum.photos/700?random=3',
    category: 'Design',
    description: 'Learn essential UI/UX design principles and best practices'
  },
  {
    title: 'Mobile App Development',
    instructor: 'Mike Williams',
    progress: 45,
    image: 'https://picsum.photos/700?random=4',
    category: 'Development',
    description: 'Complete guide to mobile app development'
  }
];

export const seedCourses = async () => {
  console.log('🌱 Starting to seed courses...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < initialCourses.length; i++) {
    const course = initialCourses[i];
    try {
      console.log(`📝 Adding course ${i + 1}/${initialCourses.length}: ${course.title}`);
      const courseId = await addCourse(course);
      if (courseId) {
        console.log(`✅ Added course: ${course.title} (ID: ${courseId})`);
        successCount++;
      } else {
        console.log(`❌ Failed to add course: ${course.title} - No ID returned`);
        errorCount++;
      }
    } catch (error: any) {
      console.error(`❌ Error adding course ${course.title}:`, error);
      errorCount++;
      // Don't stop on first error, continue with other courses
    }
  }
  
  console.log(`📊 Seeding completed: ${successCount} successful, ${errorCount} failed`);
  
  if (errorCount > 0) {
    throw new Error(`Failed to add ${errorCount} out of ${initialCourses.length} courses`);
  }
  
  return { successCount, errorCount };
};
