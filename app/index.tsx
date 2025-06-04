import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Appbar,
  Button,
  Card,
  Chip,
  FAB,
  IconButton,
  Searchbar,
  Snackbar,
  Text,
  useTheme
} from 'react-native-paper';
//import DatabaseInitializer from '../components/DatabaseInitializer';
import { Course } from '../firebase/courseService';
import { useCourses, useCoursesSearch } from '../hooks/useCourses';

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Use Firestore hooks
  const { courses, loading, error, refreshCourses } = useCourses();
  const { searchResults, searching, searchCoursesByQuery } = useCoursesSearch();

  // Filter courses based on search query
  const displayedCourses = searchQuery.trim() ? searchResults : courses;

  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchCoursesByQuery(query);
    }
  };

  const onRefresh = async () => {
    try {
      await refreshCourses();
      setSnackbarMessage('Courses refreshed successfully');
      setSnackbarVisible(true);
    } catch (err) {
      setSnackbarMessage('Failed to refresh courses');
      setSnackbarVisible(true);
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
          <View style={styles.progressBar}>
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
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action 
          icon="menu" 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
        />
        <Appbar.Content title="QuestEdu" />
        <Appbar.Action icon="bell" onPress={() => {}} />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search courses"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
        
        <View style={styles.categoriesContainer}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryList}>
            <Chip style={styles.categoryChip} mode="outlined" selected>All</Chip>
            <Chip style={styles.categoryChip} mode="outlined">Development</Chip>
            <Chip style={styles.categoryChip} mode="outlined">Design</Chip>
            <Chip style={styles.categoryChip} mode="outlined">Marketing</Chip>
            <Chip style={styles.categoryChip} mode="outlined">Business</Chip>
          </ScrollView>
        </View>

        <Text variant="titleMedium" style={styles.sectionTitle}>My Courses</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text>Loading courses...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button onPress={refreshCourses}>Retry</Button>
          </View>
        ) : (
          <FlatList
            data={displayedCourses}
            renderItem={renderCourseItem}
            keyExtractor={item => item.id || ''}
            contentContainerStyle={styles.coursesList}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={onRefresh} />
            }
          />
        )}

        {/* Temporary Database Initializer - Remove after setup */}
        {/* <DatabaseInitializer /> */}
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {}}
        label="New Course"
      />

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
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
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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
    color: '#d32f2f',
  },
});
