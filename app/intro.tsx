// First-launch intro screen — shown once before the login screen.
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';

const DISCIPLINES = ['filmmaker', 'photographer', 'musician', 'editor', 'colorist', 'animator', 'writer', 'sound designer'];

export default function IntroScreen() {
  const wordmarkOpacity  = useSharedValue(0);
  const wordmarkY        = useSharedValue(24);
  const taglineOpacity   = useSharedValue(0);
  const tagsOpacity      = useSharedValue(0);
  const bodyOpacity      = useSharedValue(0);
  const buttonOpacity    = useSharedValue(0);
  const buttonY          = useSharedValue(16);

  useEffect(() => {
    wordmarkOpacity.value = withDelay(200,  withTiming(1, { duration: 700 }));
    wordmarkY.value       = withDelay(200,  withTiming(0, { duration: 700 }));
    taglineOpacity.value  = withDelay(750,  withTiming(1, { duration: 600 }));
    tagsOpacity.value     = withDelay(1200, withTiming(1, { duration: 700 }));
    bodyOpacity.value     = withDelay(1600, withTiming(1, { duration: 600 }));
    buttonOpacity.value   = withDelay(2000, withTiming(1, { duration: 500 }));
    buttonY.value         = withDelay(2000, withTiming(0,  { duration: 500 }));
  }, []);

  const wordmarkStyle  = useAnimatedStyle(() => ({ opacity: wordmarkOpacity.value, transform: [{ translateY: wordmarkY.value }] }));
  const taglineStyle   = useAnimatedStyle(() => ({ opacity: taglineOpacity.value }));
  const tagsStyle      = useAnimatedStyle(() => ({ opacity: tagsOpacity.value }));
  const bodyStyle      = useAnimatedStyle(() => ({ opacity: bodyOpacity.value }));
  const buttonStyle    = useAnimatedStyle(() => ({ opacity: buttonOpacity.value, transform: [{ translateY: buttonY.value }] }));

  async function handleGetStarted() {
    await AsyncStorage.setItem('cohort_seen_intro', 'true');
    router.replace('/auth/login');
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.inner}>

        {/* Top rule */}
        <View style={styles.rule} />

        {/* Centre — wordmark + tagline + discipline tags */}
        <View style={styles.center}>
          <Animated.Text style={[styles.wordmark, wordmarkStyle]}>
            cohort
          </Animated.Text>

          <Animated.Text style={[styles.tagline, taglineStyle]}>
            find your people
          </Animated.Text>

          <Animated.View style={[styles.tagsRow, tagsStyle]}>
            {DISCIPLINES.map((d) => (
              <View key={d} style={styles.tag}>
                <Text style={styles.tagText}>{d}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Bottom — body copy + CTA */}
        <View style={styles.footer}>
          <Animated.Text style={[styles.body, bodyStyle]}>
            A community for creatives who build their portfolios together — through the work, not the clout.
          </Animated.Text>

          <Animated.View style={buttonStyle}>
            <Pressable style={styles.button} onPress={handleGetStarted}>
              <Text style={styles.buttonText}>Get started →</Text>
            </Pressable>
          </Animated.View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 24,
  },
  rule: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 32,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  wordmark: {
    color: Colors.accent,
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -3,
    lineHeight: 72,
  },
  tagline: {
    color: Colors.textSecondary,
    fontSize: 16,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: -8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  tagText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  footer: {
    gap: 20,
  },
  body: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  button: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.black,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
