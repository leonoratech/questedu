import { StyleSheet, TextProps as RNTextProps } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

export type ThemedTextProps = RNTextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const color = lightColor || darkColor || theme.colors.text;
  
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

  return (
    <Text
      style={[linkStyle, style]}
      variant={variant}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({});
