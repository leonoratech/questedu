import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
    Appbar,
    Avatar,
    Button,
    Card,
    Chip,
    Divider,
    List,
    Switch,
    Text,
    useTheme
} from 'react-native-paper';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Action 
          icon="menu" 
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
        />
        <Appbar.Content title="Profile" />
        <Appbar.Action icon="dots-vertical" onPress={() => {}} />
      </Appbar.Header>
      
      <ScrollView style={styles.content}>
        <Card style={styles.profileCard}>
          <Card.Content style={styles.profileHeader}>
            <Avatar.Image 
              size={100} 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            />
            <View style={styles.profileInfo}>
              <Text variant="headlineMedium">John Doe</Text>
              <Text variant="bodyMedium">john.doe@example.com</Text>
              <View style={styles.chipContainer}>
                <Chip icon="school" style={styles.chip}>Student</Chip>
                <Chip icon="star" style={styles.chip}>Premium</Chip>
              </View>
            </View>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained">Edit Profile</Button>
            <Button>Share</Button>
          </Card.Actions>
        </Card>

        <Card style={styles.settingsCard}>
          <Card.Title title="Settings" />
          <Card.Content>
            <List.Section>
              <List.Item 
                title="Notifications"
                description="Receive notifications about updates"
                left={props => <List.Icon {...props} icon="bell" />}
                right={props => <Switch value={notifications} onValueChange={setNotifications} />}
              />
              <Divider />
              <List.Item 
                title="Dark Mode"
                description="Toggle dark theme"
                left={props => <List.Icon {...props} icon="theme-light-dark" />}
                right={props => <Switch value={darkMode} onValueChange={setDarkMode} />}
              />
              <Divider />
              <List.Item 
                title="Privacy Settings"
                description="Manage your privacy options"
                left={props => <List.Icon {...props} icon="shield-account" />}
                right={props => <List.Icon {...props} icon="chevron-right" />}
              />
            </List.Section>
          </Card.Content>
        </Card>
      </ScrollView>
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
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
  },
  settingsCard: {
    marginBottom: 16,
  }
});
    
