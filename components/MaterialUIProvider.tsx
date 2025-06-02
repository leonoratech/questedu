import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from 'react-native-paper';

// Define theme customizations for light and dark modes with proper elevation levels for MD3
const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.tint,
    background: Colors.light.background,
    surface: Colors.light.background,
    text: Colors.light.text,
    error: '#B00020',
    // Add MD3 specific elevation colors
    elevation: {
      level0: 'transparent',
      level1: 'rgb(247, 243, 249)',
      level2: 'rgb(243, 237, 246)',
      level3: 'rgb(238, 232, 244)',
      level4: 'rgb(236, 230, 243)',
      level5: 'rgb(233, 227, 241)',
    },
    onSurface: Colors.light.text,
    onSurfaceVariant: Colors.light.icon,
    surfaceVariant: '#E7E0EC',
    outline: '#79747E',
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: Colors.dark.tint,
    background: Colors.dark.background,
    surface: Colors.dark.background,
    text: Colors.dark.text,
    error: '#CF6679',
    // Add MD3 specific elevation colors
    elevation: {
      level0: 'transparent',
      level1: 'rgb(37, 35, 42)',
      level2: 'rgb(44, 40, 49)',
      level3: 'rgb(49, 44, 56)',
      level4: 'rgb(51, 46, 58)',
      level5: 'rgb(52, 49, 63)',
    },
    onSurface: Colors.dark.text,
    onSurfaceVariant: Colors.dark.icon,
    surfaceVariant: '#49454F',
    outline: '#938F99',
  },
  dark: true,
};

export function MaterialUIProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}
