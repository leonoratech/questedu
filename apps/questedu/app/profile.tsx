import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
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
import AuthGuard from '../components/AuthGuard';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const theme = useTheme();
  const { user, signOut, loading } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will be handled by AuthGuard when user becomes null
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
  
  return (
    <AuthGuard>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.Action 
            icon="menu" 
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
          />
          <Appbar.Content title="Profile" />
          <Appbar.Action 
            icon="logout" 
            onPress={handleSignOut}
            disabled={loading}
          />
        </Appbar.Header>
        
        <ScrollView style={styles.content}>
          <Card style={styles.profileCard}>
            <Card.Content style={styles.profileHeader}>
              <Avatar.Text 
                size={100} 
                label={getDisplayName().charAt(0).toUpperCase()}
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View style={styles.profileInfo}>
                <Text variant="headlineMedium">{getDisplayName()}</Text>
                <Text variant="bodyMedium">{user?.email}</Text>
                <View style={styles.chipContainer}>
                  <Chip icon="school" style={styles.chip}>{getUserRole()}</Chip>
                  {user?.emailVerified && (
                    <Chip icon="check-circle" style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}>
                      Verified
                    </Chip>
                  )}
                </View>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button 
                mode="contained" 
                onPress={() => router.push('/profile-edit' as any)}
              >
                Edit Profile
              </Button>
              <Button onPress={handleSignOut} disabled={loading}>
                Sign Out
              </Button>
            </Card.Actions>
          </Card>

          <Card style={styles.settingsCard}>
            <Card.Title title="Settings" />
            <Card.Content>
              <List.Section>
                {/* <List.Item 
                  title="Notifications"
                  description="Receive notifications about updates"
                  left={props => <List.Icon {...props} icon="bell" />}
                  right={props => <Switch value={notifications} onValueChange={setNotifications} />}
                />
                <Divider /> */}
                <List.Item 
                  title="Dark Mode"
                  description="Toggle dark theme"
                  left={props => <List.Icon {...props} icon="theme-light-dark" />}
                  right={props => <Switch value={darkMode} onValueChange={setDarkMode} />}
                />
                <Divider />
                {/* <List.Item 
                  title="Privacy Settings"
                  description="Manage your privacy options"
                  left={props => <List.Icon {...props} icon="shield-account" />}
                  right={props => <List.Icon {...props} icon="chevron-right" />}
                /> */}
              </List.Section>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </AuthGuard>
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
    
