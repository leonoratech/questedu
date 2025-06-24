import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import CustomDrawerContent from '@/components/CustomDrawerContent';
import FirebaseProvider from '@/components/FirebaseProvider';
import { MaterialUIProvider } from '@/components/MaterialUIProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FirebaseProvider>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <MaterialUIProvider>              <Drawer 
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                  headerShown: false,
                  drawerType: 'front',
                }}
              >
                <Drawer.Screen 
                  name="index" 
                  options={{ 
                    title: "Home",
                    headerShown: false,
                  }}
                />
                <Drawer.Screen 
                  name="profile" 
                  options={{ 
                    title: "Profile",
                    headerShown: false,
                  }}
                />
                <Drawer.Screen 
                  name="profile-edit" 
                  options={{ 
                    title: "Edit Profile",
                    headerShown: false,
                    drawerItemStyle: { display: 'none' }, // Hide from drawer menu
                  }}
                />
                <Drawer.Screen 
                  name="login" 
                  options={{ 
                    title: "Sign In",
                    headerShown: false,
                    drawerItemStyle: { display: 'none' }, // Hide from drawer menu
                  }}
                />
                <Drawer.Screen 
                  name="signup" 
                  options={{ 
                    title: "Sign Up",
                    headerShown: false,
                    drawerItemStyle: { display: 'none' }, // Hide from drawer menu
                  }}
                />
                <Drawer.Screen 
                  name="forgot-password" 
                  options={{ 
                    title: "Forgot Password",
                    headerShown: false,
                    drawerItemStyle: { display: 'none' }, // Hide from drawer menu
                  }}
                />
                <Drawer.Screen 
                  name="+not-found" 
                  options={{ 
                    title: "Not Found",
                    headerShown: false,
                  }}
                />
            </Drawer>
            <StatusBar style="auto" />
          </MaterialUIProvider>
        </ThemeProvider>
        </AuthProvider>
      </FirebaseProvider>
    </GestureHandlerRootView>
  );
}