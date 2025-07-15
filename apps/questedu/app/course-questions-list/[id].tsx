import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Appbar,
    Button,
    Card,
    Chip,
    Divider,
    FAB,
    Modal,
    Portal,
    Searchbar,
    Snackbar,
    Surface,
    Text,
    useTheme
} from 'react-native-paper';
import AuthGuard from '../../components/AuthGuard';
import { getCourseQuestions, getCourseTopics } from '../../lib/course-learning-service';
import { CourseQuestion, CourseTopic } from '../../types/learning';

interface QuestionWithTopic extends CourseQuestion {
  topicTitle: string;
}

interface QuestionFilters {
  topic: string;
  type: string;
  marks: string;
  searchQuery: string;
}

const QUESTION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'multiple_choice', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True/False' },
  { value: 'fill_blank', label: 'Fill in the Blank' },
  { value: 'short_essay', label: 'Short Essay' },
  { value: 'long_essay', label: 'Long Essay' }
];

const MARKS_RANGES = [
  { value: 'all', label: 'All Marks' },
  { value: '1', label: '1 Mark' },
  { value: '2', label: '2 Marks' },
  { value: '3-5', label: '3-5 Marks' },
  { value: '6+', label: '6+ Marks' }
];

export default function CourseQuestionsListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const [questions, setQuestions] = useState<QuestionWithTopic[]>([]);
  const [topics, setTopics] = useState<CourseTopic[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionWithTopic[]>([]);
  
  const [filters, setFilters] = useState<QuestionFilters>({
    topic: 'all',
    type: 'all',
    marks: 'all',
    searchQuery: ''
  });
  
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadQuestionsData();
  }, [id]);

  useEffect(() => {
    applyFilters();
  }, [questions, filters]);

  const loadQuestionsData = async () => {
    try {
      setError(null);
      console.log('Loading questions for course:', id);
      
      // Load topics first
      const topicsData = await getCourseTopics(id);
      console.log('Loaded topics:', topicsData.length);
      setTopics(topicsData);
      
      // Load all questions for the course
      const allQuestions = await getCourseQuestions(id);
      console.log('Loaded questions:', allQuestions.length);
      
      // Add topic titles to questions
      const questionsWithTopics: QuestionWithTopic[] = allQuestions.map(question => ({
        ...question,
        topicTitle: topicsData.find(t => t.id === question.topicId)?.title || 'General'
      }));
      
      console.log('Questions with topics:', questionsWithTopics.length);
      setQuestions(questionsWithTopics);
    } catch (err) {
      console.error('Error loading questions:', err);
      setError('Failed to load questions');
      setSnackbarMessage('Failed to load questions');
      setSnackbarVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuestionsData();
  };

  const applyFilters = () => {
    let filtered = [...questions];

    // Apply topic filter
    if (filters.topic !== 'all') {
      filtered = filtered.filter(q => q.topicId === filters.topic);
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(q => q.type === filters.type);
    }

    // Apply marks filter
    if (filters.marks !== 'all') {
      if (filters.marks === '1') {
        filtered = filtered.filter(q => q.marks === 1);
      } else if (filters.marks === '2') {
        filtered = filtered.filter(q => q.marks === 2);
      } else if (filters.marks === '3-5') {
        filtered = filtered.filter(q => q.marks >= 3 && q.marks <= 5);
      } else if (filters.marks === '6+') {
        filtered = filtered.filter(q => q.marks >= 6);
      }
    }

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(q => 
        q.questionText.toLowerCase().includes(query) ||
        q.tags.some(tag => tag.toLowerCase().includes(query)) ||
        q.topicTitle.toLowerCase().includes(query)
      );
    }

    setFilteredQuestions(filtered);
  };

  const updateFilter = (key: keyof QuestionFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      topic: 'all',
      type: 'all',
      marks: 'all',
      searchQuery: ''
    });
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice': return '☑️';
      case 'true_false': return '✓✗';
      case 'fill_blank': return '___';
      case 'short_essay': return '📝';
      case 'long_essay': return '📄';
      default: return '❓';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.colors.primary;
      case 'medium': return theme.colors.secondary;
      case 'hard': return theme.colors.error;
      default: return theme.colors.outline;
    }
  };

  const renderQuestionItem = ({ item }: { item: QuestionWithTopic }) => (
    <Card 
      style={styles.questionCard}
      onPress={() => navigateToQuestionBank(item.id)}
    >
      <Card.Content>
        <View style={styles.questionHeader}>
          <View style={styles.questionMetadata}>
            <Chip mode="outlined" compact>
              {getQuestionTypeIcon(item.type)} {item.type.replace('_', ' ')}
            </Chip>
            <Chip 
              mode="outlined" 
              compact
              style={{ 
                backgroundColor: theme.colors.primaryContainer,
                borderColor: getDifficultyColor(item.difficulty)
              }}
              textStyle={{ color: getDifficultyColor(item.difficulty) }}
            >
              {item.difficulty}
            </Chip>
            <Chip mode="outlined" compact>
              {item.marks} {item.marks === 1 ? 'mark' : 'marks'}
            </Chip>
          </View>
        </View>
        
        <Text variant="bodyLarge" style={styles.questionText} numberOfLines={2}>
          {item.questionText}
        </Text>
        
        <View style={styles.questionFooter}>
          <Text variant="bodySmall" style={styles.topicText}>
            📚 {item.topicTitle}
          </Text>
          
          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <Chip key={index} mode="outlined" compact style={styles.tag}>
                  {tag}
                </Chip>
              ))}
              {item.tags.length > 2 && (
                <Text variant="bodySmall" style={styles.moreTagsText}>
                  +{item.tags.length - 2} more
                </Text>
              )}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const navigateToQuestionBank = (questionId?: string) => {
    if (questionId) {
      // Navigate to specific question in the question bank
      router.push({ 
        pathname: '/course-question-bank/[id]', 
        params: { id: String(id), questionId } 
      });
    } else {
      // Navigate to question bank with all questions
      router.push({ 
        pathname: '/course-question-bank/[id]', 
        params: { id: String(id) } 
      });
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.topic !== 'all') count++;
    if (filters.type !== 'all') count++;
    if (filters.marks !== 'all') count++;
    if (filters.searchQuery) count++;
    return count;
  };

  if (loading) {
    return (
      <AuthGuard>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.push({ pathname: '/course-details/[id]', params: { id: String(id) } })} />
            <Appbar.Content title="Questions List" />
          </Appbar.Header>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" animating={true} />
            <Text style={styles.loadingText}>Loading questions...</Text>
          </View>
        </View>
      </AuthGuard>
    );
  }

  if (error || (!loading && questions.length === 0)) {
    return (
      <AuthGuard>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <Appbar.Header>
            <Appbar.BackAction onPress={() => router.push({ pathname: '/course-details/[id]', params: { id: String(id) } })} />
            <Appbar.Content title="Questions List" />
          </Appbar.Header>
          <View style={styles.centerContainer}>
            <Text variant="headlineSmall" style={styles.errorTitle}>
              {error ? 'Error Loading Questions' : 'No Questions Available'}
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              {error || 'This course doesn\'t have any questions yet.'}
            </Text>
            <Button
              mode="outlined"
              onPress={() => router.push({ pathname: '/course-details/[id]', params: { id: String(id) } })}
              style={styles.backButton}
            >
              Back to Course
            </Button>
          </View>
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => router.push({ pathname: '/course-details/[id]', params: { id: String(id) } })} />
          <Appbar.Content title="Questions List" />
          <Appbar.Action 
            icon="filter-variant" 
            onPress={() => setShowFiltersModal(true)}
          />
        </Appbar.Header>

        {/* Search Bar */}
        <Surface style={styles.searchContainer}>
          <Searchbar
            placeholder="Search questions..."
            value={filters.searchQuery}
            onChangeText={(query) => updateFilter('searchQuery', query)}
            style={styles.searchBar}
          />
        </Surface>

        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <Surface style={styles.filtersContainer}>
            <View style={styles.activeFiltersRow}>
              <Text variant="bodySmall" style={styles.filtersLabel}>
                {getActiveFiltersCount()} filter{getActiveFiltersCount() > 1 ? 's' : ''} active:
              </Text>
              <Button
                mode="text"
                compact
                onPress={clearFilters}
                style={styles.clearFiltersButton}
              >
                Clear All
              </Button>
            </View>
            <View style={styles.activeFiltersChips}>
              {filters.topic !== 'all' && (
                <Chip 
                  mode="flat"
                  onClose={() => updateFilter('topic', 'all')}
                  style={styles.activeFilterChip}
                >
                  Topic: {topics.find(t => t.id === filters.topic)?.title || 'Unknown'}
                </Chip>
              )}
              {filters.type !== 'all' && (
                <Chip 
                  mode="flat"
                  onClose={() => updateFilter('type', 'all')}
                  style={styles.activeFilterChip}
                >
                  Type: {QUESTION_TYPES.find(t => t.value === filters.type)?.label}
                </Chip>
              )}
              {filters.marks !== 'all' && (
                <Chip 
                  mode="flat"
                  onClose={() => updateFilter('marks', 'all')}
                  style={styles.activeFilterChip}
                >
                  Marks: {MARKS_RANGES.find(m => m.value === filters.marks)?.label}
                </Chip>
              )}
            </View>
          </Surface>
        )}

        {/* Questions List */}
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text variant="titleMedium">
              {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <FlatList
            data={filteredQuestions}
            renderItem={renderQuestionItem}
            keyExtractor={(item) => item.id!}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Floating Action Button */}
        <FAB
          icon="play"
          label="Start Practice"
          style={styles.fab}
          onPress={() => navigateToQuestionBank()}
          disabled={filteredQuestions.length === 0}
        />

        {/* Filters Modal */}
        <Portal>
          <Modal
            visible={showFiltersModal}
            onDismiss={() => setShowFiltersModal(false)}
            contentContainerStyle={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}
          >
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Filter Questions
            </Text>
            
            <Divider style={styles.modalDivider} />

            {/* Topic Filter */}
            <Text variant="titleMedium" style={styles.filterSectionTitle}>
              Topic
            </Text>
            <View style={styles.filterOptionsContainer}>
              <Chip
                mode={filters.topic === 'all' ? 'flat' : 'outlined'}
                selected={filters.topic === 'all'}
                onPress={() => updateFilter('topic', 'all')}
                style={styles.filterChip}
              >
                All Topics
              </Chip>
              {topics.map((topic) => (
                <Chip
                  key={topic.id}
                  mode={filters.topic === topic.id ? 'flat' : 'outlined'}
                  selected={filters.topic === topic.id}
                  onPress={() => updateFilter('topic', topic.id!)}
                  style={styles.filterChip}
                >
                  {topic.title}
                </Chip>
              ))}
            </View>

            {/* Type Filter */}
            <Text variant="titleMedium" style={styles.filterSectionTitle}>
              Question Type
            </Text>
            <View style={styles.filterOptionsContainer}>
              {QUESTION_TYPES.map((type) => (
                <Chip
                  key={type.value}
                  mode={filters.type === type.value ? 'flat' : 'outlined'}
                  selected={filters.type === type.value}
                  onPress={() => updateFilter('type', type.value)}
                  style={styles.filterChip}
                >
                  {type.label}
                </Chip>
              ))}
            </View>

            {/* Marks Filter */}
            <Text variant="titleMedium" style={styles.filterSectionTitle}>
              Marks
            </Text>
            <View style={styles.filterOptionsContainer}>
              {MARKS_RANGES.map((range) => (
                <Chip
                  key={range.value}
                  mode={filters.marks === range.value ? 'flat' : 'outlined'}
                  selected={filters.marks === range.value}
                  onPress={() => updateFilter('marks', range.value)}
                  style={styles.filterChip}
                >
                  {range.label}
                </Chip>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={clearFilters}
                style={styles.modalButton}
              >
                Clear All
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowFiltersModal(false)}
                style={styles.modalButton}
              >
                Apply Filters
              </Button>
            </View>
          </Modal>
        </Portal>

        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
        >
          {snackbarMessage}
        </Snackbar>
      </View>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  backButton: {
    marginTop: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    elevation: 2,
  },
  searchBar: {
    elevation: 0,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 1,
  },
  activeFiltersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  filtersLabel: {
    opacity: 0.7,
  },
  clearFiltersButton: {
    marginRight: -8,
  },
  activeFiltersChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterChip: {
    marginBottom: 4,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Account for FAB
  },
  questionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  questionHeader: {
    marginBottom: 12,
  },
  questionMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  questionText: {
    marginBottom: 12,
    lineHeight: 20,
  },
  questionFooter: {
    gap: 8,
  },
  topicText: {
    opacity: 0.7,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignItems: 'center',
  },
  tag: {
    marginRight: 4,
  },
  moreTagsText: {
    opacity: 0.5,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDivider: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    marginBottom: 12,
    marginTop: 16,
  },
  filterOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
