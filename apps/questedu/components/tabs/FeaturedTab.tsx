import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Card,
  Chip,
  Text,
  useTheme
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import { useActiveCategories } from '../../hooks/useCategories';
import { useCollegeCourses } from '../../hooks/useCollegeCourses';
import { debugUserCourseFiltering } from '../../lib/course-diagnostics';
import { Course } from '../../lib/course-service';
import { CourseFilters, type CourseFilterState } from '../CourseFilters';

export default function FeaturedTab() {
  const theme = useTheme();
  const router = useRouter();
  const { userProfile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [courseFilters, setCourseFilters] = useState<CourseFilterState>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Use college-specific courses hook
  const { courses, loading, error, refreshCourses, hasCollegeAssociation } = useCollegeCourses(courseFilters);
  const { categories, loading: categoriesLoading, error: categoriesError, refreshCategories } = useActiveCategories();

  // Debug logging - run diagnostics when component mounts and user profile is available
  useEffect(() => {
    if (userProfile && __DEV__) {
      console.log('🏠 [FeaturedTab] Running diagnostics for user profile...');
      debugUserCourseFiltering(userProfile).then(results => {
        console.log('🏠 [FeaturedTab] Diagnostics complete:', (results || []).length, 'matching courses');
      }).catch(error => {
        console.error('🏠 [FeaturedTab] Diagnostics error:', error);
      });
    }
  }, [userProfile]);

  // Debug logging
  useEffect(() => {
    console.log('🏠 [FeaturedTab] Component state:', {
      selectedCategory,
      courseFilters,
      coursesCount: courses.length,
      loading,
      error,
      hasCollegeAssociation,
      categoriesCount: categories.length,
      userProfile: userProfile ? {
        collegeId: userProfile.collegeId,
        programId: userProfile.programId,
        email: userProfile.email
      } : null
    });
  }, [selectedCategory, courseFilters, courses.length, loading, error, hasCollegeAssociation, categories.length, userProfile]);

  const onRefresh = async () => {
    try {
      console.log('🔄 [FeaturedTab] Refreshing data...');
      await refreshCourses();
      await refreshCategories();
    } catch (err) {
      console.error('❌ [FeaturedTab] Failed to refresh:', err);
    }
  };

  // Remove duplicate courses based on ID and filter by selected category
  const uniqueCourses = courses.filter((course, index, self) => 
    self.findIndex(c => c.id === course.id) === index
  );

  const filteredCourses = selectedCategory === 'All' 
    ? uniqueCourses 
    : uniqueCourses.filter(course => course.category === selectedCategory);

  // Debug the filtering results
  useEffect(() => {
    console.log('📋 [FeaturedTab] Filtering results:', {
      totalUniqueCourses: uniqueCourses.length,
      selectedCategory,
      filteredCoursesCount: filteredCourses.length,
      sampleCourses: uniqueCourses.slice(0, 3).map(c => ({
        id: c.id,
        title: c.title,
        category: c.category
      }))
    });
  }, [uniqueCourses.length, selectedCategory, filteredCourses.length]);

  const handleApplyFilters = (filters: CourseFilterState) => {
    console.log('🎯 [FeaturedTab] Applying filters:', filters);
    setCourseFilters(filters);
  };

  const handleClearFilters = () => {
    console.log('🧹 [FeaturedTab] Clearing filters');
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

  const renderCourseItem = ({ item }: { item: Course }) => (
    <Card style={styles.courseCard}>
      <Card.Cover source={{ uri: item.image }} />
      <Card.Title
        title={item.title}
        subtitle={`Instructor: ${item.instructor}`}    
      />      
      <Card.Actions>
        <Button onPress={() => handleCourseDetails(item.id!)}>
          Details
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.categoriesContainer}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Courses</Text>
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
      ) : filteredCourses.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>No Courses Found</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {hasCollegeAssociation 
              ? 'No courses are associated with your college program yet. Please check back later or contact your administrator.'
              : 'Complete your profile to see courses specific to your program.'
            }
          </Text>
          {!hasCollegeAssociation && (
            <Button 
              mode="contained" 
              onPress={() => {
                // TODO: Navigate to profile completion
                console.log('Navigate to profile completion');
              }}
              style={{ marginTop: 16 }}
            >
              Complete Profile
            </Button>
          )}
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
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
});
