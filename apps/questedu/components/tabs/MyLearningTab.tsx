import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
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

export default function MyLearningTab() {
  const theme = useTheme();
  const [filter, setFilter] = useState('All');
  
  // Use Firestore hooks
  const { courses, loading, error, refreshCourses } = useCourses();

  const onRefresh = async () => {
    try {
      await refreshCourses();
    } catch (err) {
      console.error('Failed to refresh courses:', err);
    }
  };

  // Filter courses based on progress
  const filteredCourses = courses.filter(course => {
    if (filter === 'All') return true;
    if (filter === 'In Progress') return course.progress > 0 && course.progress < 100;
    if (filter === 'Completed') return course.progress === 100;
    if (filter === 'Not Started') return course.progress === 0;
    return true;
  });

  const renderCourseItem = ({ item }: { item: Course }) => (
    <Card style={styles.courseCard}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Title
        title={item.title}
        subtitle={`Instructor: ${item.instructor}`}
        right={props => (
          <IconButton 
            {...props} 
            icon={item.progress === 100 ? "check-circle" : "play-circle"} 
            onPress={() => {}} 
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
        <View style={styles.statusContainer}>
          {item.progress === 0 && (
            <Chip icon="play" mode="outlined" style={styles.statusChip}>
              Not Started
            </Chip>
          )}
          {item.progress > 0 && item.progress < 100 && (
            <Chip icon="clock" mode="outlined" style={styles.statusChip}>
              In Progress
            </Chip>
          )}
          {item.progress === 100 && (
            <Chip icon="check" mode="outlined" style={styles.statusChip}>
              Completed
            </Chip>
          )}
        </View>
      </Card.Content>
      <Card.Actions>
        <Button>{item.progress === 100 ? 'Review' : 'Continue'}</Button>
        <Button>Details</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.filtersContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Filter by Status</Text>
        <View style={styles.filterList}>
          <Chip 
            style={styles.filterChip} 
            mode="outlined" 
            selected={filter === 'All'}
            onPress={() => setFilter('All')}
          >
            All
          </Chip>
          <Chip 
            style={styles.filterChip} 
            mode="outlined"
            selected={filter === 'In Progress'}
            onPress={() => setFilter('In Progress')}
          >
            In Progress
          </Chip>
          <Chip 
            style={styles.filterChip} 
            mode="outlined"
            selected={filter === 'Completed'}
            onPress={() => setFilter('Completed')}
          >
            Completed
          </Chip>
          <Chip 
            style={styles.filterChip} 
            mode="outlined"
            selected={filter === 'Not Started'}
            onPress={() => setFilter('Not Started')}
          >
            Not Started
          </Chip>
        </View>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>
        My Learning ({filteredCourses.length})
      </Text>
      
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
      ) : filteredCourses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>No Courses Found</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {filter === 'All' 
              ? 'You haven\'t enrolled in any courses yet' 
              : `No courses match the "${filter}" filter`
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
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
  filtersContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  filterList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
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
  statusContainer: {
    marginTop: 10,
  },
  statusChip: {
    alignSelf: 'flex-start',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
