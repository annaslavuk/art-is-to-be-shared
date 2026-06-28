import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { ALL_CREATORS, Creator } from '@/data/creators';
import { useUserProfile } from '@/context/UserProfile';
import { sortCreatorsByScore } from '@/utils/matching';
import { supabase } from '@/lib/supabase';
import SwipeCard, { SwipeCardRef } from './SwipeCard';

const MAX_VISIBLE_CARDS = 3;
const MIN_REAL_USERS = 5; // pad with fake data below this count

// Maps a Supabase profiles row to the Creator shape SwipeCard expects.
function dbProfileToCreator(row: any): Creator {
  return {
    id:             row.id,
    name:           row.name,
    discipline:     row.disciplines?.[0] ?? 'filmmaker',
    stage:          row.stage,
    location:       row.location,
    workImageUrl:   row.work_image_url,
    workCaption:    row.work_caption,
    currentProject: row.current_project,
    give:           row.give ?? [],
    get:            row.get ?? [],
    tastes:         row.tastes ?? [],
  };
}

export default function CardDeck() {
  const { profile, session } = useUserProfile();
  const [cards, setCards] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const topCardRef = useRef<SwipeCardRef>(null);

  useEffect(() => {
    loadDeck();
  }, [session?.user.id, profile?.id]);

  async function loadDeck() {
    setIsLoading(true);

    // If not logged in or no DB profile yet, fall back to fake data.
    if (!session || !profile?.id) {
      const sorted = profile ? sortCreatorsByScore(profile, ALL_CREATORS) : ALL_CREATORS;
      setCards(sorted);
      setIsLoading(false);
      return;
    }

    // Fetch real profiles (excluding self).
    const { data: rows } = await supabase
      .from('profiles')
      .select('*')
      .neq('user_id', session.user.id);

    // Fetch IDs the user has already swiped on, to hide them.
    const { data: mySwipes } = await supabase
      .from('swipes')
      .select('swiped_id')
      .eq('swiper_id', profile.id);

    const swipedIds = new Set(mySwipes?.map((s: any) => s.swiped_id) ?? []);

    const realCreators: Creator[] = (rows ?? [])
      .filter((r: any) => !swipedIds.has(r.id))
      .map(dbProfileToCreator);

    // Pad with fake creators if there aren't enough real users yet.
    let combined = [...realCreators];
    if (combined.length < MIN_REAL_USERS) {
      const fakeToAdd = ALL_CREATORS.filter(
        (fake) => !combined.some((real) => real.name === fake.name)
      );
      combined = [...combined, ...fakeToAdd.slice(0, 10 - combined.length)];
    }

    const sorted = profile ? sortCreatorsByScore(profile, combined) : combined;
    setCards(sorted);
    setIsLoading(false);
  }

  async function handleSwipeRight(creator: Creator) {
    setCards((prev) => prev.slice(1));

    // Fake creators (short IDs like 'c1') skip DB operations.
    const isRealUser = creator.id.includes('-');
    if (!isRealUser || !profile?.id) {
      router.push({ pathname: '/match', params: { creatorId: creator.id } });
      return;
    }

    await supabase.from('swipes').insert({
      swiper_id: profile.id,
      swiped_id: creator.id,
      direction: 'right',
    });

    // Check if they already swiped right on me — mutual = match.
    const { data: mutual } = await supabase
      .from('swipes')
      .select('id')
      .eq('swiper_id', creator.id)
      .eq('swiped_id', profile.id)
      .eq('direction', 'right')
      .maybeSingle();

    if (mutual) {
      router.push({ pathname: '/match', params: { creatorId: creator.id } });
    }
    // No mutual swipe yet — card is gone, user keeps swiping.
  }

  async function handleSwipeLeft(creator: Creator) {
    setCards((prev) => prev.slice(1));

    const isRealUser = creator.id.includes('-');
    if (!isRealUser || !profile?.id) return;

    await supabase.from('swipes').insert({
      swiper_id: profile.id,
      swiped_id: creator.id,
      direction: 'left',
    });
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>All caught up</Text>
        <Text style={styles.emptyBody}>
          You've seen everyone in your scene. Check back soon — or reset the deck.
        </Text>
        <Pressable style={styles.resetButton} onPress={loadDeck}>
          <Text style={styles.resetButtonText}>Refresh deck</Text>
        </Pressable>
      </View>
    );
  }

  const visibleCards = cards.slice(0, MAX_VISIBLE_CARDS);

  return (
    <>
      <View style={styles.deck}>
        {visibleCards
          .map((creator, index) => ({ creator, index }))
          .reverse()
          .map(({ creator, index }) => (
            <SwipeCard
              key={creator.id}
              ref={index === 0 ? topCardRef : null}
              creator={creator}
              index={index}
              isTopCard={index === 0}
              onSwipeLeft={() => handleSwipeLeft(creator)}
              onSwipeRight={() => handleSwipeRight(creator)}
            />
          ))}
      </View>

      {/* Tap buttons — useful on web where drag-to-swipe isn't obvious */}
      <View style={styles.actionRow}>
        <Pressable style={styles.passButton} onPress={() => topCardRef.current?.swipeLeft()}>
          <Text style={styles.passIcon}>✕</Text>
          <Text style={styles.passLabel}>Pass</Text>
        </Pressable>
        <Pressable style={styles.interestedButton} onPress={() => topCardRef.current?.swipeRight()}>
          <Text style={styles.interestedIcon}>✓</Text>
          <Text style={styles.interestedLabel}>Interested</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  deck: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700' },
  emptyBody: { color: Colors.textSecondary, fontSize: 15, textAlign: 'center', lineHeight: 22 },
  resetButton: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  resetButtonText: { color: Colors.black, fontWeight: '700', fontSize: 15 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  passButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.accentRed,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  passIcon: { color: Colors.accentRed, fontSize: 22, fontWeight: '700' },
  passLabel: { color: Colors.accentRed, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  interestedButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  interestedIcon: { color: Colors.accentGreen, fontSize: 22, fontWeight: '700' },
  interestedLabel: { color: Colors.accentGreen, fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
});
