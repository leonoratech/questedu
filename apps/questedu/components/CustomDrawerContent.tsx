import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Divider, List, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getDisplayName = () => {
    return user?.displayName || user?.email?.split('@')[0] || 'User';
  };

  const getUserRole = () => {
    return (user as any)?.role?.charAt(0).toUpperCase() + (user as any)?.role?.slice(1).toLowerCase() || 'Student';
  };

  // Show authentication options if user is not logged in
  if (!user) {
    return (
      <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.background }}>
        <View style={styles.drawerHeader}>
          <Avatar.Icon 
            icon="account-circle" 
            size={80} 
            style={styles.avatar}
          />
          <Text variant="titleLarge" style={styles.drawerHeaderText}>Welcome to QuestEdu</Text>
          <Text variant="bodyMedium">Please sign in to continue</Text>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.authButtonsContainer}>
          <Button 
            mode="contained" 
            onPress={() => (router as any).push('/login')}
            style={styles.authButton}
          >
            Sign In
          </Button>
          <Button 
            mode="outlined" 
            onPress={() => (router as any).push('/signup')}
            style={styles.authButton}
          >
            Sign Up
          </Button>
        </View>
        
        <Divider style={styles.divider} />
        
        <List.Section>
          <List.Item
            title="Home"
            left={props => <List.Icon {...props} icon="home" />}
            onPress={() => router.push('/')}
            style={styles.listItem}
          />
          
          <List.Item
            title="Help & Support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {}}
            style={styles.listItem}
          />
        </List.Section>
      </DrawerContentScrollView>
    );
  }
  
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.drawerHeader}>
        <Avatar.Text 
          label={getDisplayName().charAt(0).toUpperCase()}
          size={80} 
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
        />
        <Text variant="titleLarge" style={styles.drawerHeaderText}>{getDisplayName()}</Text>
        <Text variant="bodyMedium">{user.email}</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
          {getUserRole()}
        </Text>
      </View>
      
      <Divider style={styles.divider} />
      
      <List.Section>
        <List.Item
          title="Home"
          left={props => <List.Icon {...props} icon="home" />}
          onPress={() => router.push('/')}
          style={styles.listItem}
        />
        
        <List.Item
          title="Profile"
          left={props => <List.Icon {...props} icon="account" />}
          onPress={() => router.push('/profile')}
          style={styles.listItem}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="My Courses"
          left={props => <List.Icon {...props} icon="book-open-variant" />}
          onPress={() => {}}
          style={styles.listItem}
        />
        
        <List.Item
          title="Calendar"
          left={props => <List.Icon {...props} icon="calendar" />}
          onPress={() => {}}
          style={styles.listItem}
        />
        
        <List.Item
          title="Messages"
          left={props => <List.Icon {...props} icon="email" />}
          onPress={() => {}}
          style={styles.listItem}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Settings"
          left={props => <List.Icon {...props} icon="cog" />}
          onPress={() => {}}
          style={styles.listItem}
        />
        
        <List.Item
          title="Help & Support"
          left={props => <List.Icon {...props} icon="help-circle" />}
          onPress={() => {}}
          style={styles.listItem}
        />
        
        <List.Item
          title="Log Out"
          left={props => <List.Icon {...props} icon="logout" />}
          onPress={handleSignOut}
          disabled={loading}
          style={styles.listItem}
        />
      </List.Section>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    marginBottom: 10,
  },
  drawerHeaderText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  divider: {
    marginVertical: 8,
    height: 1,
  },
  listItem: {
    paddingVertical: 4,
  },
  authButtonsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  authButton: {
    marginVertical: 5,
  }
});