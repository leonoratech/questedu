import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Button,
    Card,
    Chip,
    FAB,
    IconButton,
    Searchbar,
    Text,
    useTheme
} from 'react-native-paper';

const courses = [
  {
    id: '1',
    title: 'Introduction to React Native',
    instructor: 'Jane Smith',
    progress: 75,
    image: 'https://picsum.photos/700?random=1'
  },
  {
    id: '2',
    title: 'Advanced JavaScript Concepts',
    instructor: 'John Doe',
    progress: 30,
    image: 'https://picsum.photos/700?random=2'
  },
  {
    id: '3',
    title: 'UI/UX Design Principles',
    instructor: 'Sarah Johnson',
    progress: 100,
    image: 'https://picsum.photos/700?random=3'
  },
  {
    id: '4',
    title: 'Mobile App Development',
    instructor: 'Mike Williams',
    progress: 45,
    image: 'https://picsum.photos/700?random=4'
  }
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const onChangeSearch = query => setSearchQuery(query);

  const renderCourseItem = ({ item }) => (
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
        <FlatList
          data={courses}
          renderItem={renderCourseItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.coursesList}
        />
      </View>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {}}
        label="New Course"
      />
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
});
