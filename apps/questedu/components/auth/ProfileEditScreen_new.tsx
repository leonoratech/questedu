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
  
  const [saving, setSaving] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Initialize form data from user profile
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        bio: userProfile.bio || '',
        collegeId: userProfile.collegeId || '',
        programId: userProfile.programId || '',
        description: userProfile.description || '',
        mainSubjects: userProfile.mainSubjects?.join(', ') || ''
      });
    }
  }, [userProfile]);

  // Load colleges on component mount
  useEffect(() => {
    loadColleges();
  }, []);

  // Load programs when college is selected
  useEffect(() => {
    if (formData.collegeId) {
      loadPrograms(formData.collegeId);
    } else {
      setPrograms([]);
      setFormData(prev => ({ ...prev, programId: '' }));
    }
  }, [formData.collegeId]);

  const loadColleges = async () => {
    setLoadingColleges(true);
    try {
      const collegesData = await getAllColleges();
      setColleges(collegesData);
    } catch (error) {
      console.error('Error loading colleges:', error);
      showMessage('Failed to load colleges');
    } finally {
      setLoadingColleges(false);
    }
  };

  const loadPrograms = async (collegeId: string) => {
    setLoadingPrograms(true);
    try {
      const programsData = await getCollegePrograms(collegeId);
      setPrograms(programsData);
    } catch (error) {
      console.error('Error loading programs:', error);
      showMessage('Failed to load programs');
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
