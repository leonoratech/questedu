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
import { useActiveCategories } from '../../hooks/useCategories';
import { useCollegeCourses } from '../../hooks/useCollegeCourses';
import { Course } from '../../lib/course-service';
import { CourseFilters, type CourseFilterState } from '../CourseFilters';

export default function FeaturedTab() {
  const theme = useTheme();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [courseFilters, setCourseFilters] = useState<CourseFilterState>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Use college-specific courses hook
  const { courses, loading, error, refreshCourses, hasCollegeAssociation } = useCollegeCourses(courseFilters);
  const { categories, loading: categoriesLoading, error: categoriesError, refreshCategories } = useActiveCategories();

  const onRefresh = async () => {
    try {
      await refreshCourses();
      await refreshCategories();
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
  };

  // Remove duplicate courses based on ID and filter by selected category
  const uniqueCourses = courses.filter((course, index, self) => 
    self.findIndex(c => c.id === course.id) === index
  );

  const filteredCourses = selectedCategory === 'All' 
    ? uniqueCourses 
    : uniqueCourses.filter(course => course.category === selectedCategory);

  const handleApplyFilters = (filters: CourseFilterState) => {
    setCourseFilters(filters);
  };

  const handleClearFilters = () => {
    setCourseFilters({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (courseFilters.programId) count++;
    if (courseFilters.yearOrSemester) count++;
    if (courseFilters.subjectId) count++;
    return count;
  };

  const renderActiveFilters = () => {
    const activeFilters = [];
    
    if (courseFilters.programName) {
      activeFilters.push(
        <Chip
          key="program"
          mode="flat"
          onClose={() => setCourseFilters(prev => ({ ...prev, programId: undefined, programName: undefined }))}
          style={styles.filterChip}
        >
          {courseFilters.programName}
        </Chip>
      );
    }
    
    if (courseFilters.yearOrSemester) {
      activeFilters.push(
        <Chip
          key="year"
          mode="flat"
          onClose={() => setCourseFilters(prev => ({ ...prev, yearOrSemester: undefined }))}
          style={styles.filterChip}
        >
          Year/Semester {courseFilters.yearOrSemester}
        </Chip>
      );
    }
    
    if (courseFilters.subjectName) {
      activeFilters.push(
        <Chip
          key="subject"
          mode="flat"
          onClose={() => setCourseFilters(prev => ({ ...prev, subjectId: undefined, subjectName: undefined }))}
          style={styles.filterChip}
        >
          {courseFilters.subjectName}
        </Chip>
      );
    }
    
    return activeFilters;
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
          {categories.map((category) => (
            <Chip 
              key={category.id}
              style={styles.categoryChip} 
              mode="outlined"
              selected={selectedCategory === category.name}
              onPress={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {/* Filter Section */}
      {hasCollegeAssociation && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Filters</Text>
            <View style={styles.filterActions}>
              {getActiveFiltersCount() > 0 && (
                <Button mode="text" onPress={handleClearFilters} compact>
                  Clear All
                </Button>
              )}
              <Button 
                mode="outlined" 
                onPress={() => setShowFilterModal(true)}
                icon="filter"
                compact
              >
                Filter ({getActiveFiltersCount()})
              </Button>
            </View>
          </View>
          
          {/* Active Filters */}
          {getActiveFiltersCount() > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFiltersContainer}>
              {renderActiveFilters()}
            </ScrollView>
          )}
        </View>
      )}

      {/* No College Association Warning */}
      {!hasCollegeAssociation && (
        <Card style={styles.warningCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.warningTitle}>Limited Course Access</Text>
            <Text variant="bodyMedium" style={styles.warningText}>
              To see courses specific to your program, please update your profile with your college information.
            </Text>
          </Card.Content>
        </Card>
      )}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Featured Courses {selectedCategory !== 'All' && `(${selectedCategory})`}
      </Text>
      
      {/* Course Filters Modal */}
      <CourseFilters
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={courseFilters}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Featured Courses {selectedCategory !== 'All' && `(${selectedCategory})`}
      </Text>
      
      {loading || categoriesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Loading courses...</Text>
        </View>
      ) : error || categoriesError ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {error || categoriesError}
          </Text>
          <Button onPress={onRefresh}>Retry</Button>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.id || ''}
          contentContainerStyle={styles.coursesList}
          refreshControl={
            <RefreshControl refreshing={loading || categoriesLoading} onRefresh={onRefresh} />
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
  filtersContainer: {
    marginBottom: 20,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  warningCard: {
    marginBottom: 16,
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningTitle: {
    color: '#856404',
    marginBottom: 4,
  },
  warningText: {
    color: '#856404',
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
