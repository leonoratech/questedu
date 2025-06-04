import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import DatabaseInitializer from './DatabaseInitializer';

interface FirebaseTestPanelProps {
  onHide?: () => void;
}

const FirebaseTestPanel: React.FC<FirebaseTestPanelProps> = ({ onHide }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="🔥 Firebase Setup" />
        <Card.Content>
          <Text style={styles.text}>
            Firebase Firestore integration is now configured with Zscaler proxy support.
          </Text>
          <Text style={styles.smallText}>
            Make sure to update your .env file with actual Firebase credentials.
          </Text>
        </Card.Content>
        {onHide && (
          <Card.Actions>
            <Button onPress={onHide}>Hide Panel</Button>
          </Card.Actions>
        )}
      </Card>
      
      <DatabaseInitializer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  card: {
    marginBottom: 8,
  },
  text: {
    marginBottom: 8,
  },
  smallText: {
    fontSize: 12,
    opacity: 0.7,
  },
});

export default FirebaseTestPanel;
