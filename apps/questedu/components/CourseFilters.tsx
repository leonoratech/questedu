import { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    Divider,
    List,
    Portal,
    Text,
    useTheme
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import {
    getCollegePrograms,
    getProgramSubjects,
    getProgramYears,
    type Program,
    type Subject
} from '../lib/college-data-service';

interface CourseFiltersProps {
  visible: boolean;
  onDismiss: () => void;
  onApplyFilters: (filters: CourseFilterState) => void;
  currentFilters: CourseFilterState;
}

export interface CourseFilterState {
  programId?: string;
  programName?: string;
  yearOrSemester?: number;
  subjectId?: string;
  subjectName?: string;
}

export function CourseFilters({ visible, onDismiss, onApplyFilters, currentFilters }: CourseFiltersProps) {
  const theme = useTheme();
  const { userProfile } = useAuth();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [yearOptions, setYearOptions] = useState<Array<{ value: number; label: string }>>([]);
  
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const [loading, setLoading] = useState(false);

  // Load programs when modal opens
  useEffect(() => {
    if (visible && userProfile?.collegeId) {
      loadPrograms();
    }
  }, [visible, userProfile?.collegeId]);

  // Initialize filters when modal opens
  useEffect(() => {
    if (visible && currentFilters) {
      initializeFilters();
    }
  }, [visible, currentFilters, programs]);

  const loadPrograms = async () => {
    if (!userProfile?.collegeId) return;
    
    try {
      setLoading(true);
      const programList = await getCollegePrograms(userProfile.collegeId);
      setPrograms(programList);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeFilters = () => {
    if (currentFilters.programId && programs.length > 0) {
      const program = programs.find(p => p.id === currentFilters.programId);
      if (program) {
        setSelectedProgram(program);
        loadYearOptions(program);
        
        if (currentFilters.yearOrSemester) {
          setSelectedYear(currentFilters.yearOrSemester);
          loadSubjects(program.id, currentFilters.yearOrSemester);
          
          // Set selected subject after subjects are loaded
          setTimeout(() => {
            if (currentFilters.subjectId) {
              // This will be set when subjects are loaded
            }
          }, 100);
        }
      }
    }
  };

  const loadYearOptions = (program: Program) => {
    const years = getProgramYears(program);
    setYearOptions(years);
  };

  const loadSubjects = async (programId: string, yearOrSemester: number) => {
    if (!userProfile?.collegeId) return;
    
    try {
      const subjectList = await getProgramSubjects(programId, userProfile.collegeId);
      const filteredSubjects = subjectList.filter(s => s.yearOrSemester === yearOrSemester);
      setSubjects(filteredSubjects);
      
      // Set selected subject if it exists in current filters
      if (currentFilters.subjectId) {
        const subject = filteredSubjects.find(s => s.id === currentFilters.subjectId);
        if (subject) {
          setSelectedSubject(subject);
        }
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const handleProgramSelect = (program: Program) => {
    setSelectedProgram(program);
    setSelectedYear(null);
    setSelectedSubject(null);
    setSubjects([]);
    loadYearOptions(program);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setSelectedSubject(null);
    if (selectedProgram) {
      loadSubjects(selectedProgram.id, year);
    }
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleApplyFilters = () => {
    const filters: CourseFilterState = {};
    
    if (selectedProgram) {
      filters.programId = selectedProgram.id;
      filters.programName = selectedProgram.name;
    }
    
    if (selectedYear) {
      filters.yearOrSemester = selectedYear;
    }
    
    if (selectedSubject) {
      filters.subjectId = selectedSubject.id;
      filters.subjectName = selectedSubject.name;
    }
    
    onApplyFilters(filters);
    onDismiss();
  };

  const handleClearFilters = () => {
    setSelectedProgram(null);
    setSelectedYear(null);
    setSelectedSubject(null);
    setSubjects([]);
    setYearOptions([]);
    onApplyFilters({});
    onDismiss();
  };

  const getSelectedYearLabel = () => {
    if (!selectedProgram || !selectedYear) return '';
    const yearOption = yearOptions.find(y => y.value === selectedYear);
    return yearOption?.label || '';
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        style={styles.modalContainer}
      >
        <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
          <ScrollView style={styles.scrollView}>
            <Text variant="headlineSmall" style={styles.title}>Filter Courses</Text>
          
          <Card style={styles.section}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Program</Text>
              {programs.map((program) => (
                <List.Item
                  key={program.id}
                  title={program.name}
                  description={program.description}
                  left={(props) => <List.Icon {...props} icon="school" />}
                  right={(props) => selectedProgram?.id === program.id ? 
                    <List.Icon {...props} icon="check" color={theme.colors.primary} /> : undefined}
                  onPress={() => handleProgramSelect(program)}
                  style={selectedProgram?.id === program.id ? 
                    [styles.selectedItem, { backgroundColor: theme.colors.primaryContainer }] : undefined}
                />
              ))}
            </Card.Content>
          </Card>

          {selectedProgram && yearOptions.length > 0 && (
            <Card style={styles.section}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  {selectedProgram.semesterType === 'years' ? 'Year' : 'Semester'}
                </Text>
                <View style={styles.chipContainer}>
                  {yearOptions.map((year) => (
                    <Chip
                      key={year.value}
                      mode={selectedYear === year.value ? 'flat' : 'outlined'}
                      selected={selectedYear === year.value}
                      onPress={() => handleYearSelect(year.value)}
                      style={styles.chip}
                    >
                      {year.label}
                    </Chip>
                  ))}
                </View>
              </Card.Content>
            </Card>
          )}

          {selectedYear && subjects.length > 0 && (
            <Card style={styles.section}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>Subject</Text>
                {subjects.map((subject) => (
                  <List.Item
                    key={subject.id}
                    title={subject.name}
                    description={subject.description}
                    left={(props) => <List.Icon {...props} icon="book-open" />}
                    right={(props) => selectedSubject?.id === subject.id ? 
                      <List.Icon {...props} icon="check" color={theme.colors.primary} /> : undefined}
                    onPress={() => handleSubjectSelect(subject)}
                    style={selectedSubject?.id === subject.id ? 
                      [styles.selectedItem, { backgroundColor: theme.colors.primaryContainer }] : undefined}
                  />
                ))}
              </Card.Content>
            </Card>
          )}

          <Divider style={styles.divider} />

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleClearFilters}
              style={styles.button}
            >
              Clear All
            </Button>
            <Button
              mode="contained"
              onPress={handleApplyFilters}
              style={styles.button}
            >
              Apply Filters
            </Button>
          </View>
        </ScrollView>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    padding: 20,
    paddingBottom: 10,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  selectedItem: {
    borderRadius: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
    marginHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
  },
});
