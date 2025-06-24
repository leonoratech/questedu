import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Chip,
    IconButton,
    Text,
    useTheme
} from 'react-native-paper';
import { useCourses } from '../../hooks/useCourses';
import { Course } from '../../lib/course-service';

export default function FeaturedTab() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Use Firestore hooks
  const { courses, loading, error, refreshCourses } = useCourses();

  const onRefresh = async () => {
    try {
      await refreshCourses();
    } catch (err) {
      console.error('Failed to refresh courses:', err);
    }
  };

  const handleCourseDetails = (courseId: string) => {
    router.push(`/course-details/${courseId}`);
  };

  const handleContinueCourse = (courseId: string) => {
    // TODO: Navigate to course learning screen
    console.log('Continue course:', courseId);
  };

  const renderCourseItem = ({ item }: { item: Course }) => (
    <Card style={styles.courseCard}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Title
        title={item.title}
        subtitle={`Instructor: ${item.instructor}`}
        right={(props: any) => (
          <IconButton 
            {...props} 
            icon={item.progress === 100 ? "check-circle" : "play-circle"} 
            onPress={() => handleContinueCourse(item.id!)} 
          />
        )}
      />
      <Card.Content>
        <View style={styles.progressContainer}>
          <Text variant="bodyMedium">Progress: {item.progress}%</Text>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={[styles.progressFill, { width: `${item.progress}%`, backgroundColor: theme.colors.primary }]} />
          </View>
        </View>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => handleContinueCourse(item.id!)}>
          {item.progress > 0 ? 'Continue' : 'Start'}
        </Button>
        <Button onPress={() => handleCourseDetails(item.id!)}>
          Details
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.categoriesContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
          <Chip 
            style={styles.categoryChip} 
            mode="outlined" 
            selected={selectedCategory === 'All'}
            onPress={() => setSelectedCategory('All')}
          >
            All
          </Chip>
          <Chip 
            style={styles.categoryChip} 
            mode="outlined"
            selected={selectedCategory === 'Development'}
            onPress={() => setSelectedCategory('Development')}
          >
            Development
          </Chip>
          <Chip 
            style={styles.categoryChip} 
            mode="outlined"
            selected={selectedCategory === 'Design'}
            onPress={() => setSelectedCategory('Design')}
          >
            Design
          </Chip>
          <Chip 
            style={styles.categoryChip} 
            mode="outlined"
            selected={selectedCategory === 'Marketing'}
            onPress={() => setSelectedCategory('Marketing')}
          >
            Marketing
          </Chip>
          <Chip 
            style={styles.categoryChip} 
            mode="outlined"
            selected={selectedCategory === 'Business'}
            onPress={() => setSelectedCategory('Business')}
          >
            Business
          </Chip>
        </ScrollView>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Featured Courses</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Loading courses...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <Button onPress={refreshCourses}>Retry</Button>
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.id || ''}
          contentContainerStyle={styles.coursesList}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  categoryList: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryChip: {
    marginRight: 8,
  },
  coursesList: {
    paddingBottom: 80,
  },
  courseCard: {
    marginBottom: 16,
  },
  progressContainer: {
    marginVertical: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
});
