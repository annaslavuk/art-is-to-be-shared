// Step 4 of 5 — Get: what do you need from other creatives right now?
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useUserProfile } from '@/context/UserProfile';
import TagInput from '@/components/TagInput';

export default function Step4() {
  const { draft, updateDraft } = useUserProfile();
  const [tags, setTags] = useState<string[]>(draft.get ?? []);

  const canContinue = tags.length >= 1;

  function handleContinue() {
    updateDraft({ get: tags });
    router.push('/onboarding/step5');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        <Text style={styles.stepLabel}>Step 4 of 5</Text>
        <Text style={styles.heading}>What do you need?</Text>
        <Text style={styles.subheading}>
          What's missing right now? Be specific — "DP for one weekend shoot" is more useful than "a filmmaker." Add at least 1.
        </Text>

        <TagInput
          tags={tags}
          onChange={setTags}
          placeholder="e.g. DP for a weekend shoot, composer for a short…"
        />

        <View style={styles.examples}>
          <Text style={styles.examplesLabel}>Ideas</Text>
          <View style={styles.examplePills}>
            {['DP for one shoot', 'editor for rough cut', 'composer', 'colorist',
              'sound mix', 'producer', 'actor', 'production designer', 'photographer'].map((ex) => (
              <Pressable
                key={ex}
                style={styles.examplePill}
                onPress={() => { if (!tags.includes(ex)) setTags([...tags, ex]); }}
              >
                <Text style={styles.examplePillText}>+ {ex}</Text>
              </Pressable>
            ))}
          </View>
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.counter}>{tags.length} added · need at least 1</Text>
        <Pressable
          style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={styles.continueButtonText}>Continue →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { padding: 28, paddingBottom: 8, gap: 24 },
  stepLabel: { color: Colors.textMuted, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  heading: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.3, marginTop: -8 },
  subheading: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: -12 },
  examples: { gap: 10 },
  examplesLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  examplePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  examplePill: { backgroundColor: Colors.surfaceRaised, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  examplePillText: { color: Colors.textSecondary, fontSize: 12 },
  footer: { padding: 20, paddingBottom: 8, gap: 10 },
  counter: { color: Colors.textMuted, fontSize: 12, textAlign: 'center' },
  continueButton: { backgroundColor: Colors.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
  continueButtonDisabled: { opacity: 0.35 },
  continueButtonText: { color: Colors.black, fontWeight: '700', fontSize: 16 },
});
