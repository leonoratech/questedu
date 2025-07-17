import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Modal,
    Portal,
    Searchbar,
    Text,
    TextInput,
    useTheme
} from 'react-native-paper';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  label: string;
  value?: string;
  options: DropdownOption[];
  onSelect: (value: string, option: DropdownOption) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  searchable?: boolean;
  error?: boolean;
  style?: any;
  required?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  disabled = false,
  loading = false,
  searchable = true,
  error = false,
  style,
  required = false
}) => {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : '';

  const filteredOptions = searchable && searchQuery
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleOptionSelect = (option: DropdownOption) => {
    onSelect(option.value, option);
    setModalVisible(false);
    setSearchQuery('');
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    modal: {
      margin: 16,
      maxHeight: '80%',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      maxHeight: 400,
    },
    searchContainer: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outline,
    },
    optionsContainer: {
      maxHeight: 300,
    },
    option: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
    },
    selectedOption: {
      backgroundColor: theme.colors.primaryContainer,
    },
    loadingContainer: {
      padding: 32,
      alignItems: 'center',
    },
    emptyContainer: {
      padding: 32,
      alignItems: 'center',
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        onPress={() => !disabled && !loading && setModalVisible(true)}
        disabled={disabled || loading}
      >
        <TextInput
          label={`${label}${required ? ' *' : ''}`}
          value={displayText}
          editable={false}
          right={
            loading ? (
              <TextInput.Icon icon={() => <ActivityIndicator size={20} />} />
            ) : (
              <TextInput.Icon 
                icon="chevron-down" 
                onPress={() => !disabled && !loading && setModalVisible(true)}
                disabled={disabled || loading}
              />
            )
          }
          placeholder={placeholder}
          error={error}
          style={{ backgroundColor: disabled ? theme.colors.surfaceDisabled : theme.colors.surface }}
        />
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Card style={styles.modalContent}>
            {searchable && (
              <View style={styles.searchContainer}>
                <Searchbar
                  placeholder="Search options..."
                  onChangeText={setSearchQuery}
                  value={searchQuery}
                  style={{ elevation: 0 }}
                />
              </View>
            )}

            <ScrollView style={styles.optionsContainer}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" />
                  <Text style={{ marginTop: 8 }}>Loading options...</Text>
                </View>
              ) : filteredOptions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text>No options found</Text>
                </View>
              ) : (
                filteredOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.option,
                      value === option.value && styles.selectedOption
                    ]}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <Text 
                      variant="bodyLarge"
                      style={{
                        color: value === option.value 
                          ? theme.colors.onPrimaryContainer 
                          : theme.colors.onSurface
                      }}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <View style={styles.buttonsContainer}>
              <Button onPress={() => setModalVisible(false)}>
                Cancel
              </Button>
            </View>
          </Card>
        </Modal>
      </Portal>
    </View>
  );
};
