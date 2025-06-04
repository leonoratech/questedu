import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Divider, List, Text, useTheme } from 'react-native-paper';

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const theme = useTheme();
  
  return (
    <DrawerContentScrollView {...props} style={{ backgroundColor: theme.colors.background }}>
      <View style={styles.drawerHeader}>
        <Avatar.Image 
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
          size={80} 
          style={styles.avatar}
        />
        <Text variant="titleLarge" style={styles.drawerHeaderText}>John Doe</Text>
        <Text variant="bodyMedium">john.doe@example.com</Text>
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
          onPress={() => {}}
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
  }
});