/**
 * Course Data Structure Diagnostics
 * Helper functions to debug course data structures and associations
 */

import { collection, getDocs, limit, query } from 'firebase/firestore';
import { getFirestoreDb } from './firebase-config';

/**
 * Analyze the data structure of courses in Firestore
 * This helps debug what fields are actually available
 */
export const analyzeCourseDataStructure = async () => {
  try {
    console.log('🔍 [Diagnostics] Analyzing course data structure...');
    
    const db = getFirestoreDb();
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, limit(10)); // Get first 10 courses for analysis
    const querySnapshot = await getDocs(q);
    
    const analysis = {
      totalSamples: querySnapshot.size,
      dataStructures: [] as any[],
      fieldSummary: {
        hasDirectCollegeId: 0,
        hasDirectProgramId: 0,
        hasAssociationObject: 0,
        hasAssociationCollegeId: 0,
        hasAssociationProgramId: 0,
        hasAssociationYearOrSemester: 0,
        hasAssociationSubjectId: 0
      }
    };
    
    querySnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      
      // Analyze the structure
      const structure = {
        id: doc.id,
        title: data.title,
        hasDirectCollegeId: !!data.collegeId,
        hasDirectProgramId: !!data.programId,
        hasAssociation: !!data.association,
        associationStructure: data.association ? {
          collegeId: data.association.collegeId || null,
          programId: data.association.programId || null,
          yearOrSemester: data.association.yearOrSemester || null,
          subjectId: data.association.subjectId || null,
          fullObject: data.association
        } : null,
        directFields: {
          collegeId: data.collegeId || null,
          programId: data.programId || null,
          yearOrSemester: data.yearOrSemester || null,
          subjectId: data.subjectId || null
        },
        allKeys: Object.keys(data)
      };
      
      analysis.dataStructures.push(structure);
      
      // Update field summary
      if (data.collegeId) analysis.fieldSummary.hasDirectCollegeId++;
      if (data.programId) analysis.fieldSummary.hasDirectProgramId++;
      if (data.association) {
        analysis.fieldSummary.hasAssociationObject++;
        if (data.association.collegeId) analysis.fieldSummary.hasAssociationCollegeId++;
        if (data.association.programId) analysis.fieldSummary.hasAssociationProgramId++;
        if (data.association.yearOrSemester) analysis.fieldSummary.hasAssociationYearOrSemester++;
        if (data.association.subjectId) analysis.fieldSummary.hasAssociationSubjectId++;
      }
    });
    
    console.log('📊 [Diagnostics] Course Data Structure Analysis:', analysis);
    
    // Log detailed findings
    console.log('\n📋 [Diagnostics] Summary:');
    console.log(`- Total courses analyzed: ${analysis.totalSamples}`);
    console.log(`- Courses with direct collegeId: ${analysis.fieldSummary.hasDirectCollegeId}`);
    console.log(`- Courses with direct programId: ${analysis.fieldSummary.hasDirectProgramId}`);
    console.log(`- Courses with association object: ${analysis.fieldSummary.hasAssociationObject}`);
    console.log(`- Courses with association.collegeId: ${analysis.fieldSummary.hasAssociationCollegeId}`);
    console.log(`- Courses with association.programId: ${analysis.fieldSummary.hasAssociationProgramId}`);
    
    return analysis;
  } catch (error) {
    console.error('❌ [Diagnostics] Error analyzing course data structure:', error);
    return null;
  }
};

/**
 * Test course filtering with different strategies
 */
export const testCourseFiltering = async (filters: {
  collegeId?: string;
  programId?: string;
}) => {
  try {
    console.log('🧪 [Diagnostics] Testing course filtering with filters:', filters);
    
    const analysis = await analyzeCourseDataStructure();
    if (!analysis) {
      console.log('❌ [Diagnostics] Could not analyze data structure');
      return;
    }
    
    // Test which courses would match our filters
    const matchingCourses = analysis.dataStructures.filter(course => {
      let matches = true;
      
      if (filters.collegeId) {
        const hasDirectMatch = course.directFields.collegeId === filters.collegeId;
        const hasAssociationMatch = course.associationStructure?.collegeId === filters.collegeId;
        if (!hasDirectMatch && !hasAssociationMatch) {
          matches = false;
        }
      }
      
      if (filters.programId && matches) {
        const hasDirectMatch = course.directFields.programId === filters.programId;
        const hasAssociationMatch = course.associationStructure?.programId === filters.programId;
        if (!hasDirectMatch && !hasAssociationMatch) {
          matches = false;
        }
      }
      
      return matches;
    });
    
    console.log(`🎯 [Diagnostics] Filtering test results:`);
    console.log(`- Courses that would match filters: ${matchingCourses.length}`);
    console.log(`- Matching courses:`, matchingCourses.map(c => ({
      id: c.id,
      title: c.title,
      directCollegeId: c.directFields.collegeId,
      directProgramId: c.directFields.programId,
      associationCollegeId: c.associationStructure?.collegeId,
      associationProgramId: c.associationStructure?.programId
    })));
    
    return matchingCourses;
  } catch (error) {
    console.error('❌ [Diagnostics] Error testing course filtering:', error);
    return [];
  }
};

/**
 * Debug function to be called from the FeaturedTab
 * This will show what's happening with the user's specific profile
 */
export const debugUserCourseFiltering = async (userProfile: any) => {
  try {
    console.log('👤 [Diagnostics] Debugging course filtering for user:', {
      collegeId: userProfile?.collegeId,
      programId: userProfile?.programId,
      email: userProfile?.email
    });
    
    if (!userProfile?.collegeId) {
      console.log('⚠️ [Diagnostics] User has no collegeId');
      return;
    }
    
    // Test filtering with user's profile data
    const filters = {
      collegeId: userProfile.collegeId,
      programId: userProfile.programId
    };
    
    const results = await testCourseFiltering(filters);
    
    console.log(`🎯 [Diagnostics] Results for user's profile:`);
    console.log(`- User collegeId: ${userProfile.collegeId}`);
    console.log(`- User programId: ${userProfile.programId}`);
    console.log(`- Matching courses found: ${results?.length || 0}`);
    
    if (!results || results.length === 0) {
      console.log('🔍 [Diagnostics] No courses found. Trying college-only filter...');
      const collegeOnlyResults = await testCourseFiltering({ collegeId: userProfile.collegeId });
      console.log(`- College-only matches: ${collegeOnlyResults?.length || 0}`);
    }
    
    return results;
  } catch (error) {
    console.error('❌ [Diagnostics] Error debugging user course filtering:', error);
    return [];
  }
};
