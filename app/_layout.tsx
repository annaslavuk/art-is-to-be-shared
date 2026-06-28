import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfileProvider, useUserProfile } from '@/context/UserProfile';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProfileProvider>
        <RootLayoutNav />
      </UserProfileProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { session, isLoadingSession, hasProfile, isLoadingProfile } = useUserProfile();
  const [introChecked, setIntroChecked] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);

  // Check the intro flag in parallel with the session restore.
  useEffect(() => {
    AsyncStorage.getItem('cohort_seen_intro').then((val) => {
      setHasSeenIntro(val === 'true');
      setIntroChecked(true);
    });
  }, []);

  useEffect(() => {
    if (isLoadingSession || !introChecked) return;

    if (!hasSeenIntro) {
      router.replace('/intro');
      return;
    }

    if (!session) {
      router.replace('/auth/login');
    } else if (!isLoadingProfile && !hasProfile) {
      router.replace('/onboarding/step1');
    }
  }, [session, isLoadingSession, hasProfile, isLoadingProfile, introChecked, hasSeenIntro]);

  // Hold until both the session and the intro flag are resolved.
  if (isLoadingSession || !introChecked) return null;

  return (
    <Stack>
      <Stack.Screen name="(tabs)"       options={{ headerShown: false }} />
      <Stack.Screen name="auth"         options={{ headerShown: false }} />
      <Stack.Screen name="intro"        options={{ headerShown: false }} />
      <Stack.Screen name="match"        options={{ headerShown: false }} />
      <Stack.Screen name="conversation" options={{ headerShown: false }} />
      <Stack.Screen name="channel"      options={{ headerShown: false }} />
      <Stack.Screen name="onboarding"   options={{ headerShown: false }} />
    </Stack>
  );
}
