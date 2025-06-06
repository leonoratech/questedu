import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, Divider, Text } from 'react-native-paper';
import { DiagnosticResult, getFirebaseProjectInformation, initializeDatabase, runFirebaseDiagnosticsComprehensive } from '../lib/diagnostics';

const DatabaseInitializer: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);

  const handleRunDiagnostics = async () => {
    setIsInitializing(true);
    setMessage('');
    setIsSuccess(null);
    setDiagnosticResults([]);

    try {
      console.log('🔍 Running comprehensive diagnostics...');
      
      // Get Firebase project info
      const projectInfo = getFirebaseProjectInformation();
      console.log('Project Info:', projectInfo);
      
      // Run all diagnostic tests
      const results = await runFirebaseDiagnosticsComprehensive();
      setDiagnosticResults(results);
      
      const failedTests = results.filter(r => !r.success);
      
      if (failedTests.length === 0) {
        setMessage('✅ All diagnostic tests passed! Firebase is working correctly.');
        setIsSuccess(true);
      } else {
        setMessage(`⚠️ ${failedTests.length} diagnostic test(s) failed. Check results below.`);
        setIsSuccess(false);
      }
      
    } catch (error: any) {
      setMessage(`❌ Diagnostics failed: ${error.message}`);
      setIsSuccess(false);
      console.error('Diagnostics error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleTestConnection = async () => {
    setIsInitializing(true);
    setMessage('Running quick connection test...');
    setIsSuccess(null);

    try {
      // Quick test using the diagnostics
      const results = await runFirebaseDiagnosticsComprehensive();
      const connectionTest = results.find(r => r.test === 'Firebase Initialization');
      const readTest = results.find(r => r.test === 'Database Read');
      
      if (connectionTest?.success && readTest?.success) {
        setMessage('✅ Firebase connection successful!');
        setIsSuccess(true);
      } else {
        const failureReason = connectionTest?.success ? readTest?.message : connectionTest?.message;
        setMessage(`⚠️ Connection issue: ${failureReason}`);
        setIsSuccess(false);
      }
    } catch (error: any) {
      setMessage(`❌ Connection test failed: ${error.message}`);
      setIsSuccess(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleInitialize = async () => {
    setIsInitializing(true);
    setMessage('');
    setIsSuccess(null);

    try {
      console.log('🚀 Starting database initialization...');
      await initializeDatabase();
      setMessage('✅ Database initialized successfully with sample courses!');
      setIsSuccess(true);
      console.log('✅ Database initialization completed');
    } catch (error: any) {
      console.error('❌ Database initialization failed:', error);
      
      // Provide more specific error messages
      let errorMessage = '❌ Failed to initialize database: ';
      
      if (error?.code === 'permission-denied') {
        errorMessage += 'Permission denied. Check Firestore security rules.';
      } else if (error?.code === 'failed-precondition') {
        errorMessage += 'Firestore not properly configured.';
      } else if (error?.code === 'unauthenticated') {
        errorMessage += 'Authentication required.';
      } else if (error?.message?.includes('network')) {
        errorMessage += 'Network error. Check internet connection.';
      } else if (error?.message?.includes('ssl') || error?.message?.includes('certificate')) {
        errorMessage += 'SSL/Certificate issue. Check proxy settings.';
      } else {
        errorMessage += error?.message || 'Unknown error occurred';
      }
      
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Firebase Database Setup" />
        <Card.Content>
          <Text style={styles.description}>
            Use these tools to diagnose and fix Firebase connection issues.
          </Text>
          
          {message ? (
            <Text style={[
              styles.message,
              { color: isSuccess ? '#4caf50' : '#f44336' }
            ]}>
              {message}
            </Text>
          ) : null}
          
          {diagnosticResults.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.subTitle}>Diagnostic Results:</Text>
              {diagnosticResults.map((result, index) => (
                <Text key={index} style={[
                  styles.diagnosticItem,
                  { color: result.success ? '#4caf50' : '#f44336' }
                ]}>
                  {result.success ? '✅' : '❌'} {result.test}: {result.message}
                </Text>
              ))}
            </>
          )}
        </Card.Content>
        
        <Card.Actions>
          <Button 
            mode="outlined" 
            onPress={handleRunDiagnostics}
            disabled={isInitializing}
            style={styles.button}
          >
            Run Diagnostics
          </Button>
          <Button 
            mode="outlined" 
            onPress={handleTestConnection}
            disabled={isInitializing}
            style={styles.button}
          >
            Quick Test
          </Button>
          <Button 
            mode="contained" 
            onPress={handleInitialize}
            disabled={isInitializing}
            loading={isInitializing}
          >
            {isInitializing ? 'Initializing...' : 'Initialize DB'}
          </Button>
        </Card.Actions>
      </Card>
      
      <Card style={styles.helpCard}>
        <Card.Title title="❓ Getting 'Bad Request' Error?" />
        <Card.Content>
          <Text style={styles.helpText}>
            Most likely cause: Firestore security rules are blocking writes.
          </Text>
          <Text style={styles.helpText}>
            🔧 <Text style={styles.bold}>Quick Fix:</Text>
          </Text>
          <Text style={styles.helpText}>
            1. Go to Firebase Console → Firestore → Rules
          </Text>
          <Text style={styles.helpText}>
            2. Replace rules with: allow read, write: if true;
          </Text>
          <Text style={styles.helpText}>
            3. Click Publish and wait 30 seconds
          </Text>
          <Text style={styles.helpText}>
            4. Try &quot;Run Diagnostics&quot; button above
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
  },
  card: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 16,
    lineHeight: 20,
  },
  message: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  diagnosticItem: {
    marginVertical: 4,
    fontSize: 14,
  },
  button: {
    marginRight: 8,
  },
  helpCard: {
    marginTop: 8,
    backgroundColor: '#f5f5f5',
  },
  helpText: {
    marginVertical: 4,
    lineHeight: 18,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default DatabaseInitializer;
