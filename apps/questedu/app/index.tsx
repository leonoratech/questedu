import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
    Appbar,
    Snackbar,
    useTheme
} from 'react-native-paper';
import AuthGuard from '../components/AuthGuard';
import BottomNavigationTabs from '../components/BottomNavigationTabs';

export default function HomeScreen() {
  const navigation = useNavigation();
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  return (
    <AuthGuard>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Appbar.Header>
          <Appbar.Action 
            icon="menu" 
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())} 
          />
          <Appbar.Content title="QuestEdu" />
          <Appbar.Action icon="bell" onPress={() => {}} />
        </Appbar.Header>

        <BottomNavigationTabs />

      {/* <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {}}
        label="New Course"
      /> */}

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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
