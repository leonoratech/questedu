import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton, useTheme } from 'react-native-paper';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
  style,
}: AppButtonProps) {
  const theme = useTheme();
  
  // Determine mode based on variant
  let mode: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal' = 'contained';
  
  switch (variant) {
    case 'primary':
      mode = 'contained';
      break;
    case 'secondary':
      mode = 'contained-tonal';
      break;
    case 'outline':
      mode = 'outlined';
      break;
    case 'text':
      mode = 'text';
      break;
  }
  
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      icon={icon}
      disabled={disabled}
      loading={loading}
      style={[styles.button, style]}
    >
      {title}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 2,
    marginVertical: 8,
  },
});
