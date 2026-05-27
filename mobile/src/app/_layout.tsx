import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useColorScheme, ActivityIndicator, View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/auth-context';

function NavigationGate() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inPassengerGroup = segments[0] === '(passenger)';
    const inAdminGroup = segments[0] === '(admin)';

    if (!user) {
      if (!inAuthGroup) {
        router.replace('/(auth)/onboarding');
      }
    } else if (user.role === 'admin') {
      if (!inAdminGroup) {
        router.replace('/(admin)');
      }
    } else {
      if (!inPassengerGroup) {
        router.replace('/(passenger)');
      }
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return <Slot />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <NavigationGate />
      </AuthProvider>
    </ThemeProvider>
  );
}
