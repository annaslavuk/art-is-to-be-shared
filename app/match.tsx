// Match screen — shown after a mutual right-swipe.
// Never show a blank chat box — always anchor to a concrete next step.
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import Colors from '@/constants/Colors';
import { ALL_CREATORS, Creator } from '@/data/creators';
import { useUserProfile } from '@/context/UserProfile';
import { scoreMatch } from '@/utils/matching';
import { supabase } from '@/lib/supabase';
import { saveDemoMatch } from '@/utils/demoMatches';

export default function MatchScreen() {
  const { creatorId } = useLocalSearchParams<{ creatorId: string }>();
  const { profile } = useUserProfile();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isSendingIntro, setIsSendingIntro] = useState(false);

  const isRealUser = creatorId?.includes('-');

  useEffect(() => {
    if (!creatorId) return;
    if (isRealUser) {
      // Fetch real profile from Supabase.
      supabase.from('profiles').select('*').eq('id', creatorId).single().then(({ data }) => {
        if (data) setCreator(dbRowToCreator(data));
      });
    } else {
      // Fall back to local fake data.
      const found = ALL_CREATORS.find((c) => c.id === creatorId);
      if (found) setCreator(found);
    }
  }, [creatorId]);

  if (!creator) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const matchResult = profile ? scoreMatch(profile, creator) : null;
  const reasons: string[] = [];
  if (matchResult?.sameStage)    reasons.push('Same stage');
  if (matchResult?.giveGetMatch) reasons.push('Complementary skills');
  matchResult?.sharedTastes.slice(0, 2).forEach((t) => reasons.push(t));

  async function handleSendIntro() {
    if (!isRealUser) {
      // Save demo match locally so it shows up in the Matches tab.
      await saveDemoMatch({
        matchId: `demo-${creatorId}`,
        creatorId: creatorId!,
        name: creator.name,
        discipline: creator.discipline,
        currentProject: creator.currentProject,
        createdAt: new Date().toISOString(),
      });
      router.push({ pathname: '/conversation/[matchId]', params: { matchId: `demo-${creatorId}` } });
      return;
    }
    if (!profile?.id || isSendingIntro) return;
    setIsSendingIntro(true);

    // Enforce user_a_id < user_b_id so there's only ever one row per pair.
    const [user_a_id, user_b_id] = [profile.id, creatorId!].sort();

    const { data: match, error } = await supabase
      .from('matches')
      .upsert({ user_a_id, user_b_id }, { onConflict: 'user_a_id,user_b_id' })
      .select('id')
      .single();

    setIsSendingIntro(false);

    if (error || !match) {
      Alert.alert('Something went wrong', error?.message ?? 'Please try again.');
      return;
    }

    router.push({ pathname: '/conversation/[matchId]', params: { matchId: match.id } });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        <Text style={styles.eyebrow}>✦ matched</Text>
        <Text style={styles.headline}>You both love{'\n'}this kind of work.</Text>

        <Image
          source={{ uri: creator.workImageUrl }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        <View style={styles.nameRow}>
          <Text style={styles.creatorName}>{creator.name}</Text>
          <Text style={styles.creatorMeta}>{creator.discipline} · {creator.location}</Text>
        </View>

        {reasons.length > 0 && (
          <View style={styles.reasonsBox}>
            <Text style={styles.reasonsLabel}>Why you matched</Text>
            <View style={styles.reasonsPills}>
              {reasons.map((r) => (
                <View key={r} style={styles.reasonPill}>
                  <Text style={styles.reasonPillText}>{r}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.nextStepBox}>
          <Text style={styles.nextStepLabel}>What they're working on right now</Text>
          <Text style={styles.nextStepProject}>{creator.currentProject}</Text>
          <View style={styles.divider} />
          <Text style={styles.nextStepLabel}>What they need</Text>
          <Text style={styles.nextStepNeed}>{creator.get[0]}</Text>
        </View>

        <Pressable
          style={[styles.primaryButton, isSendingIntro && styles.primaryButtonDisabled]}
          onPress={handleSendIntro}
          disabled={isSendingIntro}
        >
          <Text style={styles.primaryButtonText}>
            {isSendingIntro ? 'Opening chat…' : 'Send intro'}
          </Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.secondaryButtonText}>Keep swiping</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

function dbRowToCreator(row: any): Creator {
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { paddingHorizontal: 28, paddingTop: 24, paddingBottom: 32, gap: 16, alignItems: 'center' },
  eyebrow: { color: Colors.accent, fontSize: 13, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' },
  headline: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', textAlign: 'center', lineHeight: 36, letterSpacing: -0.3 },
  thumbnail: { width: '100%', height: 200, borderRadius: 16, backgroundColor: Colors.surface },
  nameRow: { alignItems: 'center', gap: 4 },
  creatorName: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' },
  creatorMeta: { color: Colors.textSecondary, fontSize: 13, textTransform: 'capitalize' },
  reasonsBox: { width: '100%', gap: 10 },
  reasonsLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  reasonsPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  reasonPill: {
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reasonPillText: { color: Colors.accent, fontSize: 12, fontWeight: '600' },
  nextStepBox: { width: '100%', backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, padding: 20, gap: 8 },
  nextStepLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  nextStepProject: { color: Colors.textPrimary, fontSize: 15, lineHeight: 22, fontWeight: '500' },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 4 },
  nextStepNeed: { color: Colors.accent, fontSize: 15, fontWeight: '500' },
  primaryButton: { width: '100%', backgroundColor: Colors.accent, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: Colors.black, fontSize: 16, fontWeight: '700' },
  secondaryButton: { paddingVertical: 12 },
  secondaryButtonText: { color: Colors.textSecondary, fontSize: 15 },
  errorText: { color: Colors.textPrimary, fontSize: 16, textAlign: 'center', padding: 32 },
});
