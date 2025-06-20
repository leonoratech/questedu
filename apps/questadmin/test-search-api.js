/**
 * Test script for search API fix
 * Run this in the browser console to test the search functionality
 */

const testSearchAPI = async () => {
  console.log('🔍 Testing search API fix...')
  
  try {
    // Test the original failing query
    const searchTerm = 'complete react'
    const testUrl = `/api/courses?browsing=true&search=${encodeURIComponent(searchTerm)}`
    
    console.log('Testing URL:', testUrl)
    
    const response = await fetch(testUrl, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    })
    
    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData.error,
        details: errorData.details
      })
      return false
    }
    
    const data = await response.json()
    console.log('✅ API Success:', {
      success: data.success,
      totalCourses: data.courses?.length || 0,
      firstCourse: data.courses?.[0]?.title || 'No courses'
    })
    
    // Test various search terms
    const testTerms = ['javascript', 'react', 'python', 'web', 'development']
    
    for (const term of testTerms) {
      try {
        const testResponse = await fetch(`/api/courses?browsing=true&search=${encodeURIComponent(term)}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
          }
        })
        
        if (testResponse.ok) {
          const testData = await testResponse.json()
          console.log(`✅ Search "${term}": ${testData.courses?.length || 0} results`)
        } else {
          console.error(`❌ Search "${term}" failed:`, testResponse.status)
        }
      } catch (error) {
        console.error(`❌ Search "${term}" error:`, error)
      }
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Test error:', error)
    return false
  }
}

const testBrowsingAPI = async () => {
  console.log('🔍 Testing browsing API (no search)...')
  
  try {
    const response = await fetch('/api/courses?browsing=true', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    })
    
    console.log('Browsing API status:', response.status)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Browsing API Success:', {
        success: data.success,
        totalCourses: data.courses?.length || 0
      })
      return data.courses || []
    } else {
      const errorData = await response.json()
      console.error('❌ Browsing API Error:', errorData)
      return []
    }
  } catch (error) {
    console.error('❌ Browsing API Test error:', error)
    return []
  }
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  window.testSearchAPI = testSearchAPI
  window.testBrowsingAPI = testBrowsingAPI
  console.log('🚀 Search API test tools loaded!')
  console.log('Run testSearchAPI() or testBrowsingAPI() to test')
}

// Export for module use
if (typeof module !== 'undefined') {
  module.exports = { testSearchAPI, testBrowsingAPI }
}
