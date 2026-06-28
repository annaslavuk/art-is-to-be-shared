import { forwardRef, useImperativeHandle, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Colors from '@/constants/Colors';
import { Creator } from '@/data/creators';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 40, 400);
const CARD_HEIGHT = CARD_WIDTH * 1.45;
const SWIPE_THRESHOLD = 100;

type Props = {
  creator: Creator;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTopCard: boolean;
  index: number; // 0 = top card, 1 = behind, 2 = furthest back
};

// Exposed so CardDeck can trigger animated swipes from the Pass/Interested buttons.
export type SwipeCardRef = {
  swipeLeft: () => void;
  swipeRight: () => void;
};

const SwipeCard = forwardRef<SwipeCardRef, Props>(function SwipeCard(
  { creator, onSwipeLeft, onSwipeRight, isTopCard, index },
  ref
) {
  const [showBack, setShowBack] = useState(false);
  const [imageError, setImageError] = useState(false);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Let the parent trigger a programmatic animated swipe (used by the tap buttons).
  useImperativeHandle(ref, () => ({
    swipeLeft: () => {
      translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 }, (done) => {
        'worklet';
        if (done) runOnJS(onSwipeLeft)();
      });
    },
    swipeRight: () => {
      translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 }, (done) => {
        'worklet';
        if (done) runOnJS(onSwipeRight)();
      });
    },
  }), [onSwipeLeft, onSwipeRight]);

  const panGesture = Gesture.Pan()
    .enabled(isTopCard)
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(onSwipeRight)();
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      [-18, 0, 18]
    );
    // Cards behind the top are scaled down and shifted up to show a stack
    const scale = 1 - index * 0.04;
    const stackOffsetY = index * -10;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + stackOffsetY },
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  const interestedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [30, SWIPE_THRESHOLD], [0, 1], 'clamp'),
  }));

  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, -30], [1, 0], 'clamp'),
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardStyle]}>
        {showBack ? (
          // Back of card — give/get details
          <View style={styles.back}>
            <Text style={styles.backName}>{creator.name}</Text>
            <Text style={styles.backDiscipline}>
              {creator.discipline} · {creator.stage}
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Working on</Text>
              <Text style={styles.sectionBody}>{creator.currentProject}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>What I give</Text>
              {creator.give.map((item) => (
                <Text key={item} style={styles.bullet}>· {item}</Text>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>What I need</Text>
              {creator.get.map((item) => (
                <Text key={item} style={styles.bullet}>· {item}</Text>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Into</Text>
              <Text style={styles.sectionBody}>{creator.tastes.join(', ')}</Text>
            </View>

            {!!creator.workImageUrl && !creator.workImageUrl.startsWith('data:') && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Link</Text>
                <Pressable onPress={() => Linking.openURL(creator.workImageUrl)}>
                  <Text style={styles.linkText} numberOfLines={1}>
                    {creator.workImageUrl.replace(/^https?:\/\//, '')}
                  </Text>
                </Pressable>
              </View>
            )}

            <Pressable style={styles.flipButton} onPress={() => setShowBack(false)}>
              <Text style={styles.flipButtonText}>← Back to work</Text>
            </Pressable>
          </View>
        ) : (
          // Front of card — work image
          <>
            {imageError ? (
              <View style={styles.portfolioPlaceholder}>
                <Text style={styles.portfolioPlaceholderIcon}>⊞</Text>
                <Text style={styles.portfolioPlaceholderUrl} numberOfLines={1}>
                  {creator.workImageUrl.replace(/^https?:\/\//, '').split('/')[0]}
                </Text>
                <Text style={styles.portfolioPlaceholderLabel}>flip for link →</Text>
              </View>
            ) : (
              <Image
                source={{ uri: creator.workImageUrl }}
                style={styles.image}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            )}

            {/* Dark gradient overlay at the bottom */}
            <View style={styles.gradient} pointerEvents="none" />

            {/* INTERESTED label — fades in when swiping right */}
            <Animated.View style={[styles.swipeLabel, styles.interestedLabel, interestedStyle]}>
              <Text style={styles.interestedText}>INTERESTED</Text>
            </Animated.View>

            {/* PASS label — fades in when swiping left */}
            <Animated.View style={[styles.swipeLabel, styles.passLabel, passStyle]}>
              <Text style={styles.passText}>PASS</Text>
            </Animated.View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.name}>{creator.name}</Text>
                <Text style={styles.meta}>
                  {creator.discipline} · {creator.stage} · {creator.location}
                </Text>
                <Text style={styles.caption} numberOfLines={1}>{creator.workCaption}</Text>
              </View>
              <Pressable style={styles.flipButton} onPress={() => setShowBack(true)}>
                <Text style={styles.flipButtonText}>give / get →</Text>
              </Pressable>
            </View>
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
});

export default SwipeCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  // Gradient overlay — React Native doesn't have LinearGradient built-in without expo-linear-gradient,
  // so we use a dark semi-transparent View at the bottom to ensure text readability.
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    backgroundColor: 'rgba(0,0,0,0.0)',
    // Layered approach: multiple views for a gradient-like effect
  },
  cardFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.65)',
    gap: 12,
  },
  name: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  meta: {
    color: Colors.accent,
    fontSize: 13,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  caption: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  flipButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  flipButtonText: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
  swipeLabel: {
    position: 'absolute',
    top: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2.5,
  },
  interestedLabel: {
    left: 20,
    borderColor: Colors.accentGreen,
    transform: [{ rotate: '-15deg' }],
  },
  passLabel: {
    right: 20,
    borderColor: Colors.accentRed,
    transform: [{ rotate: '15deg' }],
  },
  interestedText: {
    color: Colors.accentGreen,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 1.5,
  },
  passText: {
    color: Colors.accentRed,
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 1.5,
  },
  // Back of card
  back: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 24,
    gap: 16,
  },
  backName: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  backDiscipline: {
    color: Colors.accent,
    fontSize: 13,
    textTransform: 'capitalize',
    marginTop: -10,
  },
  section: {
    gap: 4,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionBody: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  bullet: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  // Shown when workImageUrl is a portfolio site rather than a direct image
  portfolioPlaceholder: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  portfolioPlaceholderIcon: { color: Colors.accent, fontSize: 40 },
  portfolioPlaceholderLabel: { color: Colors.textMuted, fontSize: 11, letterSpacing: 1, marginTop: 4 },
  portfolioPlaceholderUrl: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  linkText: { color: Colors.accent, fontSize: 13, textDecorationLine: 'underline' },
});
