import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Appbar,
  Button,
  Card,
  Chip,
  HelperText,
  Snackbar,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';
import {
  College,
  getAllColleges,
  getCollegePrograms,
  Program
} from '../../lib/college-data-service';
import { Dropdown, DropdownOption } from '../ui/Dropdown';

interface FormData {
  firstName: string;
  lastName: string;
  bio: string;
  collegeId: string;
  programId: string;
  description: string;
  mainSubjects: string;
}

const ProfileEditScreen: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const { user, userProfile, updateProfile, loading } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    bio: '',
    collegeId: '',
    programId: '',
    description: '',
    mainSubjects: ''
  });
  
  const [colleges, setColleges] = useState<College[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Initialize form data from user profile
  useEffect(() => {
    if (userProfile) {
      const newFormData = {
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        bio: userProfile.bio || '',
        collegeId: userProfile.collegeId || '',
        programId: userProfile.programId || '',
        description: userProfile.description || '',
        mainSubjects: userProfile.mainSubjects?.join(', ') || ''
      };
      
      console.log('📋 Initializing profile form data:', newFormData);
      setFormData(newFormData);
      
      // If user has a saved collegeId, load the programs for that college
      // This ensures the program dropdown shows the correct selected program
      if (newFormData.collegeId && user) {
        console.log('🎓 Profile loaded - Loading programs for saved college:', newFormData.collegeId);
        console.log('🎯 Saved programId to restore:', newFormData.programId);
        loadPrograms(newFormData.collegeId).then(() => {
          // Mark initial load as complete after programs are loaded
          console.log('✅ Initial program loading complete');
          setIsInitialLoad(false);
        });
      } else {
        // No college saved, mark initial load as complete immediately
        console.log('✅ No saved college, marking initial load complete');
        setIsInitialLoad(false);
      }
    }
  }, [userProfile, user]);

  // Load colleges on component mount, but only if user is authenticated
  useEffect(() => {
    if (user && userProfile) { // Only load if both user and profile are loaded
      loadColleges();
    }
  }, [user, userProfile]);

  // Load programs when college is selected (manual selection, not initial load)
  useEffect(() => {
    if (formData.collegeId && !isInitialLoad) {
      console.log('🔄 Manual college selection - loading programs for:', formData.collegeId);
      loadPrograms(formData.collegeId);
    } else if (!formData.collegeId && !isInitialLoad) {
      console.log('🔄 No college selected, clearing programs');
      setPrograms([]);
      setFormData(prev => ({ ...prev, programId: '' }));
    }
  }, [formData.collegeId, isInitialLoad]);

  const loadColleges = async () => {
    if (!user) {
      console.log('⚠️ User not authenticated, skipping college loading');
      return;
    }
    
    setLoadingColleges(true);
    try {
      console.log('🏫 Starting to load colleges...');
      const collegesData = await getAllColleges();
      console.log(`✅ Successfully loaded ${collegesData.length} colleges:`, collegesData.map(c => c.name));
      setColleges(collegesData);
      
      if (collegesData.length === 0) {
        showMessage('No colleges found. Please contact administrator.');
      }
    } catch (error: any) {
      console.error('❌ Error loading colleges:', error);
      
      if (error.message && error.message.includes('Authentication required')) {
        showMessage('Please sign in to access college information.');
      } else if (error.message && error.message.includes('Missing or insufficient permissions')) {
        showMessage('Access denied. Please ensure you are signed in with a valid account.');
      } else {
        showMessage('Failed to load colleges. Please check your internet connection and try again.');
      }
      setColleges([]); // Ensure colleges is empty on error
    } finally {
      setLoadingColleges(false);
    }
  };

  const loadPrograms = async (collegeId: string) => {
    if (!user) {
      console.log('⚠️ User not authenticated, skipping program loading');
      return;
    }
    
    setLoadingPrograms(true);
    try {
      console.log(`🎓 Starting to load programs for college: ${collegeId}`);
      console.log(`🎯 Current programId before loading: "${formData.programId}"`);
      
      const programsData = await getCollegePrograms(collegeId);
      console.log(`✅ Successfully loaded ${programsData.length} programs:`, programsData.map(p => `${p.name} (${p.id})`));
      setPrograms(programsData);
      
      // Check if the current programId exists in the loaded programs
      const currentProgramId = formData.programId;
      console.log(`🔍 Checking if programId "${currentProgramId}" exists in loaded programs...`);
      
      if (currentProgramId) {
        const foundProgram = programsData.find(p => p.id === currentProgramId);
        if (foundProgram) {
          console.log(`✅ Found matching program for saved programId: ${foundProgram.name} (${foundProgram.id})`);
        } else {
          console.log(`⚠️ Saved programId "${currentProgramId}" not found in loaded programs`);
          console.log(`   Available program IDs: [${programsData.map(p => `"${p.id}"`).join(', ')}]`);
          console.log(`   Data type check - saved: ${typeof currentProgramId}, available: ${programsData.map(p => typeof p.id).join(', ')}`);
        }
      } else {
        console.log(`ℹ️ No programId to restore`);
      }
      
      if (programsData.length === 0) {
        showMessage('No programs found for this college.');
      }
    } catch (error: any) {
      console.error('❌ Error loading programs:', error);
      
      if (error.message && error.message.includes('Authentication required')) {
        showMessage('Please sign in to access program information.');
      } else if (error.message && error.message.includes('Missing or insufficient permissions')) {
        showMessage('Access denied. Please ensure you are signed in with a valid account.');
      } else {
        showMessage('Failed to load programs. Please try again.');
      }
      setPrograms([]); // Ensure programs is empty on error
    } finally {
      setLoadingPrograms(false);
    }
  };

  const showMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCollegeSelect = (value: string, option: DropdownOption) => {
    setFormData(prev => ({ 
      ...prev, 
      collegeId: value,
      programId: '' // Reset program when college changes
    }));
  };

  const handleProgramSelect = (value: string, option: DropdownOption) => {
    setFormData(prev => ({ ...prev, programId: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      showMessage('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      showMessage('Last name is required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updates = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        bio: formData.bio.trim(),
        collegeId: formData.collegeId,
        programId: formData.programId,
        description: formData.description.trim(),
        mainSubjects: formData.mainSubjects
          .split(',')
          .map(subject => subject.trim())
          .filter(subject => subject.length > 0),
        profileCompleted: true,
      };

      const { error } = await updateProfile(updates);
      
      if (error) {
        showMessage(error);
      } else {
        showMessage('Profile updated successfully!');
        setTimeout(() => {
          router.back();
        }, 1500);
      }
    } catch (error) {
      showMessage('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Convert colleges and programs to dropdown options
  const collegeOptions: DropdownOption[] = colleges.map(college => ({
    label: college.name,
    value: college.id
  }));

  const programOptions: DropdownOption[] = programs.map(program => ({
    label: program.name,
    value: program.id
  }));

  // Debug: Log current selection state
  const selectedCollege = collegeOptions.find(c => c.value === formData.collegeId);
  const selectedProgram = programOptions.find(p => p.value === formData.programId);
  
  // Enhanced debugging for programId binding issue
  React.useEffect(() => {
    if (formData.collegeId || formData.programId) {
      console.log('🎯 DETAILED SELECTION STATE:');
      console.log(`   College: ${selectedCollege?.label || 'None'} (ID: ${formData.collegeId})`);
      console.log(`   Program: ${selectedProgram?.label || 'None'} (ID: ${formData.programId})`);
      console.log(`   Available programs: ${programOptions.length}`);
      
      if (formData.programId && programOptions.length > 0) {
        console.log(`🔍 PROGRAM BINDING DEBUG:`);
        console.log(`   Looking for programId: "${formData.programId}"`);
        console.log(`   Available program IDs: [${programOptions.map(p => `"${p.value}"`).join(', ')}]`);
        console.log(`   Match found: ${selectedProgram ? 'YES' : 'NO'}`);
        
        if (!selectedProgram) {
          console.log(`❌ BINDING ISSUE: programId "${formData.programId}" not found in programOptions`);
          programOptions.forEach((p, index) => {
            console.log(`     [${index}] ${p.label} = "${p.value}" (type: ${typeof p.value})`);
          });
        }
      }
    }
  }, [formData.collegeId, formData.programId, selectedCollege?.label, selectedProgram?.label, programOptions.length]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleCancel} />
        <Appbar.Content title="Edit Profile" />
        <Appbar.Action 
          icon="check" 
          onPress={handleSave}
          disabled={saving || loading}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Personal Information */}
        <Card style={styles.card}>
          <Card.Title title="Personal Information" />
          <Card.Content>
            <TextInput
              label="First Name *"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
              style={styles.input}
              disabled={saving}
            />

            <TextInput
              label="Last Name *"
              value={formData.lastName}
              onChangeText={(text) => handleInputChange('lastName', text)}
              style={styles.input}
              disabled={saving}
            />

            <TextInput
              label="Email"
              value={user?.email || ''}
              style={styles.input}
              disabled={true}
              right={<TextInput.Icon icon="lock" />}
            />
          </Card.Content>
        </Card>

        {/* Academic Information */}
        <Card style={styles.card}>
          <Card.Title title="Academic Information" />
          <Card.Content>
            <Dropdown
              label="College/Institution"
              value={formData.collegeId}
              options={collegeOptions}
              onSelect={handleCollegeSelect}
              placeholder="Select your college or institution"
              disabled={saving}
              loading={loadingColleges}
              required
              style={styles.input}
            />

            <Dropdown
              label="Program/Field of Study"
              value={formData.programId}
              options={programOptions}
              onSelect={handleProgramSelect}
              placeholder={formData.collegeId ? "Select your program" : "Please select a college first"}
              disabled={saving || !formData.collegeId}
              loading={loadingPrograms}
              style={styles.input}
            />
            
            {/* Debug info - remove in production */}
            {__DEV__ && formData.programId && programOptions.length > 0 && (
              <HelperText type="info">
                {`Debug: Program ${selectedProgram ? `"${selectedProgram.label}" found` : `"${formData.programId}" not found in ${programOptions.length} loaded programs`}`}
              </HelperText>
            )}

            <TextInput
              label="Main Subjects"
              value={formData.mainSubjects}
              onChangeText={(text) => handleInputChange('mainSubjects', text)}
              style={styles.input}
              disabled={saving}
              placeholder="e.g., Mathematics, Physics, Programming"
              multiline
              numberOfLines={2}
            />
            <HelperText type="info">
              Separate multiple subjects with commas
            </HelperText>
          </Card.Content>
        </Card>

        {/* About Me */}
        <Card style={styles.card}>
          <Card.Title title="About Me" />
          <Card.Content>
            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              style={styles.input}
              disabled={saving}
              placeholder="Tell us about your academic interests, goals, and what you hope to learn..."
              multiline
              numberOfLines={4}
            />

            <TextInput
              label="Short Bio"
              value={formData.bio}
              onChangeText={(text) => handleInputChange('bio', text)}
              style={styles.input}
              disabled={saving}
              placeholder="A brief summary about yourself"
              multiline
              numberOfLines={2}
            />
          </Card.Content>
        </Card>

        {/* Profile Status */}
        <Card style={styles.card}>
          <Card.Title title="Profile Status" />
          <Card.Content>
            <View style={styles.statusContainer}>
              <Text variant="bodyMedium">Role:</Text>
              <Chip icon="school" style={styles.roleChip}>Student</Chip>
            </View>
            <View style={styles.statusContainer}>
              <Text variant="bodyMedium">Profile Status:</Text>
              <Chip 
                icon={userProfile?.profileCompleted ? "check-circle" : "clock"} 
                style={[
                  styles.statusChip, 
                  { backgroundColor: userProfile?.profileCompleted ? theme.colors.primaryContainer : theme.colors.errorContainer }
                ]}
              >
                {userProfile?.profileCompleted ? 'Complete' : 'Incomplete'}
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleSave}
            loading={saving}
            disabled={saving || loading}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={handleCancel}
            disabled={saving}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roleChip: {
    backgroundColor: '#e3f2fd',
  },
  statusChip: {
    marginLeft: 8,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
    gap: 12,
  },
  saveButton: {
    marginBottom: 8,
  },
  cancelButton: {
    marginBottom: 8,
  },
});

export default ProfileEditScreen;
