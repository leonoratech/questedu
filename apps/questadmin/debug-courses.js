/**
 * Simple script to check if there are courses in the Firestore database
 * This can be run from the browser console to debug course data
 */

// You can run this in the browser console on any page that has Firebase initialized
const checkCourses = async () => {
  try {
    console.log('Checking courses in database...')
    
    // Make API call to check courses
    const response = await fetch('/api/courses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    })
    
    const data = await response.json()
    console.log('Raw API response:', data)
    
    if (data.success && data.courses) {
      console.log(`Found ${data.courses.length} courses:`)
      data.courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`)
        console.log(`   Status: ${course.status}`)
        console.log(`   Instructor: ${course.instructor}`)
        console.log(`   Category: ${course.category}`)
        console.log(`   ID: ${course.id}`)
        console.log('---')
      })
      
      const publishedCourses = data.courses.filter(c => c.status === 'published')
      console.log(`Published courses: ${publishedCourses.length}`)
      
      if (publishedCourses.length === 0) {
        console.warn('⚠️ No published courses found! This is why browse-courses shows empty.')
        console.log('To fix this:')
        console.log('1. Create a course as an instructor')
        console.log('2. Set its status to "published"')
        console.log('3. Or manually update existing courses to published status')
      }
    } else {
      console.error('API call failed:', data)
    }
  } catch (error) {
    console.error('Error checking courses:', error)
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('Course checking script loaded. Call checkCourses() to run.')
  // Optionally auto-run: checkCourses()
}

// Export for module use
if (typeof module !== 'undefined') {
  module.exports = { checkCourses }
}
