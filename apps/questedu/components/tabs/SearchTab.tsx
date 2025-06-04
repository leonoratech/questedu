import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    IconButton,
    Searchbar,
    Text,
    useTheme
} from 'react-native-paper';
import { Course } from '../../firebase/courseService';
import { useCoursesSearch } from '../../hooks/useCourses';

export default function SearchTab() {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use Firestore search hook
  const { searchResults, searching, searchCoursesByQuery } = useCoursesSearch();

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchCoursesByQuery(query);
    }
  };

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
      </Card.Content>
      <Card.Actions>
        <Button>Continue</Button>
        <Button>Details</Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Searchbar
        placeholder="Search courses"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {searching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text>Searching courses...</Text>
        </View>
      ) : searchQuery.trim() === '' ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>Search for Courses</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Enter keywords to find courses that match your interests
          </Text>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="titleMedium" style={styles.emptyTitle}>No Results Found</Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            Try searching with different keywords
          </Text>
        </View>
      ) : (
        <>
          <Text variant="titleMedium" style={styles.resultsTitle}>
            Search Results ({searchResults.length})
          </Text>
          <FlatList
            data={searchResults}
            renderItem={renderCourseItem}
            keyExtractor={item => item.id || ''}
            contentContainerStyle={styles.coursesList}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  resultsTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
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
