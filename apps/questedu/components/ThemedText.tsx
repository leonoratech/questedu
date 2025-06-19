import { ReactNode } from 'react';
import { TextProps as RNTextProps, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export interface ThemedTextProps {
  children: ReactNode;
  style?: RNTextProps['style'];
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
}

export function ThemedText({
  children,
  style,
  lightColor,
  darkColor,
  type = 'default',
}: ThemedTextProps) {
  const theme = useTheme();
  const color = lightColor || darkColor || theme.colors.onSurface;
  
  let variant: 
    | 'displayLarge'
    | 'displayMedium'
    | 'displaySmall'
    | 'headlineLarge'
    | 'headlineMedium'
    | 'headlineSmall'
    | 'titleLarge'
    | 'titleMedium'
    | 'titleSmall'
    | 'bodyLarge'
    | 'bodyMedium'
    | 'bodySmall'
    | 'labelLarge'
    | 'labelMedium'
    | 'labelSmall' = 'bodyMedium';
  
  // Map our type to Paper variant
  switch(type) {
    case 'title':
      variant = 'headlineMedium';
      break;
    case 'defaultSemiBold':
      variant = 'bodyLarge';
      break;
    case 'subtitle':
      variant = 'titleMedium';
      break;
    case 'link':
      variant = 'bodyMedium';
      break;
    default:
      variant = 'bodyMedium';
  }

  // Special styling for links
  const linkStyle = type === 'link' ? { color: theme.colors.primary } : {};
  const textColor = type === 'link' ? theme.colors.primary : color;

  return (
    <Text
      style={[{ color: textColor }, linkStyle, style]}
      variant={variant}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({});
