import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { getFirestoreDb } from '../lib/firebase-config';
import { firebaseCourseService } from '../lib/firebase-course-service';

export function DebugPanel() {
  const { userProfile } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebugCheck = async () => {
    setLoading(true);
    try {
      const db = getFirestoreDb();
      const info: any = {};

      // 1. Check user profile
      info.userProfile = userProfile ? {
        uid: userProfile.uid,
        email: userProfile.email,
        collegeId: userProfile.collegeId,
        role: userProfile.role
      } : 'No user profile';

      // 2. Check total courses
      const allCoursesResult = await firebaseCourseService.getAll({ limit: 5 });
      info.totalCourses = allCoursesResult.total;
      info.sampleCourses = allCoursesResult.data.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category
      }));

      // 3. Check courses with associations
      const coursesRef = collection(db, 'courses');
      const allSnapshot = await getDocs(coursesRef);
      let withAssociations = 0;
      let sampleAssociations: any[] = [];

      allSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.association) {
          withAssociations++;
          if (sampleAssociations.length < 3) {
            sampleAssociations.push({
              courseId: doc.id,
              title: data.title,
              association: data.association
            });
          }
        }
      });

      info.coursesWithAssociations = withAssociations;
      info.sampleAssociations = sampleAssociations;

      // 4. Test college filtering if user has college
      if (userProfile?.collegeId) {
        const collegeFilterResult = await firebaseCourseService.getCoursesWithFilters({
          collegeId: userProfile.collegeId
        });
        info.collegeFilteredCourses = collegeFilterResult.data.length;
        info.collegeFilterSample = collegeFilterResult.data.slice(0, 3).map(c => ({
          id: c.id,
          title: c.title
        }));
      }

      setDebugInfo(info);
    } catch (error) {
      setDebugInfo({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    runDebugCheck();
  }, [userProfile]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading debug info...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Debug Panel</Text>
      
      <Button mode="contained" onPress={runDebugCheck} style={styles.refreshButton}>
        Refresh Debug Info
      </Button>

      {debugInfo && (
        <View style={styles.infoContainer}>
          <Text style={styles.json}>{JSON.stringify(debugInfo, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  refreshButton: {
    marginBottom: 16,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  json: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#333',
  },
});
