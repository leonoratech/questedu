import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';

// Simple test to verify Firebase connectivity and data structure
const testFirebaseQuery = async () => {
  try {
    // Use the correct config from the app
    const firebaseConfig = {
      apiKey: "AIzaSyALWHvJopjpZ9amcpV74jrBlYqEZzeWaTI",
      authDomain: "questedu-cb2a4.firebaseapp.com", 
      projectId: "questedu-cb2a4",
      storageBucket: "questedu-cb2a4.firebasestorage.app",
      messagingSenderId: "247130380208",
      appId: "1:247130380208:web:dfe0053ff32ae3194a6875"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('🔍 Testing Firebase connection...');

    // 1. Test basic courses query
    const coursesRef = collection(db, 'courses');
    const allCoursesSnapshot = await getDocs(coursesRef);
    console.log(`📚 Total courses: ${allCoursesSnapshot.size}`);

    // 2. Check for courses with associations
    let coursesWithAssociations = 0;
    let sampleAssociations = [];
    
    allCoursesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.association) {
        coursesWithAssociations++;
        if (sampleAssociations.length < 3) {
          sampleAssociations.push({
            courseId: doc.id,
            title: data.title,
            association: data.association
          });
        }
      }
    });

    console.log(`🔗 Courses with associations: ${coursesWithAssociations}`);
    console.log('📋 Sample associations:', sampleAssociations);

    // 3. Test colleges
    const collegesRef = collection(db, 'colleges');
    const collegesSnapshot = await getDocs(collegesRef);
    console.log(`🏫 Total colleges: ${collegesSnapshot.size}`);

    if (collegesSnapshot.size > 0) {
      const firstCollege = collegesSnapshot.docs[0];
      const firstCollegeData = firstCollege.data();
      console.log(`🎯 Testing with college: ${firstCollegeData.name} (${firstCollege.id})`);

      // 4. Test association query
      const associationQuery = query(
        coursesRef,
        where('association.collegeId', '==', firstCollege.id)
      );
      
      const associationResults = await getDocs(associationQuery);
      console.log(`🎯 Courses for college ${firstCollege.id}: ${associationResults.size}`);
      
      if (associationResults.size > 0) {
        associationResults.docs.forEach(doc => {
          const data = doc.data();
          console.log(`  - ${data.title} (${doc.id})`);
        });
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testFirebaseQuery };
} else if (typeof window !== 'undefined') {
  window.testFirebaseQuery = testFirebaseQuery;
}
