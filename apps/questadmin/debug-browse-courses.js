/**
 * Debug script for browse-courses functionality
 * Run this in the browser console on the browse-courses page to debug issues
 */

const debugBrowseCourses = async () => {
  console.log('🔍 Debugging browse-courses functionality...')
  
  try {
    // Test 1: Check if we can fetch courses for browsing
    console.log('\n1. Testing course fetching...')
    const response = await fetch('/api/courses?browsing=true', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response ok:', response.ok)
    
    const data = await response.json()
    console.log('Response data:', data)
    
    if (data.success && data.courses) {
      console.log(`✅ Found ${data.courses.length} courses`)
      
      // Test 2: Check published courses
      const publishedCourses = data.courses.filter(c => c.status === 'published')
      console.log(`✅ Found ${publishedCourses.length} published courses`)
      
      if (publishedCourses.length > 0) {
        console.log('\n2. Sample published course:')
        console.log(publishedCourses[0])
        
        // Test 3: Test search functionality
        console.log('\n3. Testing search functionality...')
        const sampleCourse = publishedCourses[0]
        const searchResults = publishedCourses.filter(course => 
          course.title && course.title.toLowerCase().includes('test') ||
          course.description && course.description.toLowerCase().includes('test') ||
          course.instructor && course.instructor.toLowerCase().includes('test')
        )
        console.log(`🔍 Search test results: ${searchResults.length} courses`)
        
        // Test 4: Test category filtering
        console.log('\n4. Testing category filtering...')
        const categories = [...new Set(publishedCourses.map(c => c.category).filter(Boolean))]
        console.log('Available categories:', categories)
        
        if (categories.length > 0) {
          const firstCategory = categories[0]
          const categoryResults = publishedCourses.filter(c => c.category === firstCategory)
          console.log(`📚 Category "${firstCategory}" has ${categoryResults.length} courses`)
        }
        
        // Test 5: Test level filtering
        console.log('\n5. Testing level filtering...')
        const levels = [...new Set(publishedCourses.map(c => c.level).filter(Boolean))]
        console.log('Available levels:', levels)
        
      } else {
        console.warn('⚠️ No published courses found!')
        console.log('Available courses by status:')
        const statusCounts = data.courses.reduce((acc, course) => {
          const status = course.status || 'unknown'
          acc[status] = (acc[status] || 0) + 1
          return acc
        }, {})
        console.log(statusCounts)
      }
      
    } else {
      console.error('❌ Failed to fetch courses:', data.error || 'Unknown error')
    }
    
  } catch (error) {
    console.error('❌ Error in debug script:', error)
  }
}

// Test search filtering function
const testSearchFiltering = (courses, searchTerm) => {
  console.log(`\n🔍 Testing search for "${searchTerm}"...`)
  
  try {
    const results = courses.filter(course => {
      const title = course.title || ''
      const description = course.description || ''
      const instructor = course.instructor || ''
      
      return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             description.toLowerCase().includes(searchTerm.toLowerCase()) ||
             instructor.toLowerCase().includes(searchTerm.toLowerCase())
    })
    
    console.log(`Found ${results.length} results:`)
    results.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title} by ${course.instructor}`)
    })
    
    return results
  } catch (error) {
    console.error('Error in search filtering:', error)
    return []
  }
}

// Export functions for use
if (typeof window !== 'undefined') {
  window.debugBrowseCourses = debugBrowseCourses
  window.testSearchFiltering = testSearchFiltering
  console.log('🚀 Browse courses debug tools loaded!')
  console.log('Run debugBrowseCourses() to start debugging')
}

// Auto-run if not in browser
if (typeof module !== 'undefined') {
  module.exports = { debugBrowseCourses, testSearchFiltering }
}
