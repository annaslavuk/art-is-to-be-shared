// Step 5 of 5 — Taste: what do you love? This is how we find your people.
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { UserProfile, useUserProfile } from '@/context/UserProfile';
import TagInput from '@/components/TagInput';

export default function Step5() {
  const { draft, updateDraft, createProfile } = useUserProfile();
  const [tags, setTags] = useState<string[]>(draft.tastes ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canFinish = tags.length >= 3;

  async function handleCreateProfile() {
    if (isSaving) return;
    setIsSaving(true);
    setErrorMessage('');

    const fullProfile: UserProfile = {
      ...(draft as UserProfile),
      tastes: tags,
    };

    try {
      await createProfile(fullProfile);
      // createProfile navigates to (tabs) on success — nothing else needed here.
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Something went wrong. Please try again.');
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        <Text style={styles.stepLabel}>Step 5 of 5</Text>
        <Text style={styles.heading}>What's your taste?</Text>
        <Text style={styles.subheading}>
          Films, directors, albums, artists — whatever shaped how you make things. Add at least 3. This is how we find people on your wavelength.
        </Text>

        <TagInput
          tags={tags}
          onChange={setTags}
          placeholder="e.g. Barry Jenkins, Ryuichi Sakamoto, Nan Goldin…"
        />

        <View style={styles.examples}>
          <Text style={styles.examplesLabel}>Ideas</Text>
          <View style={styles.examplePills}>
            {['Barry Jenkins', 'Agnès Varda', 'Ryuichi Sakamoto', 'Nan Goldin',
              'Kelly Reichardt', 'Arca', 'Spike Lee', 'Vivian Maier', 'Hayao Miyazaki',
              'Walter Murch', 'Deana Lawson'].map((ex) => (
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
        <Text style={styles.counter}>
          {tags.length >= 3 ? `${tags.length} added ✓` : `${tags.length} added · need at least 3`}
        </Text>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Pressable
          style={[styles.finishButton, (!canFinish || isSaving) && styles.finishButtonDisabled]}
          onPress={handleCreateProfile}
          disabled={!canFinish || isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={Colors.black} />
          ) : (
            <Text style={styles.finishButtonText}>Create my profile →</Text>
          )}
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
  error: { color: Colors.accentRed, fontSize: 13, textAlign: 'center' },
  finishButton: { backgroundColor: Colors.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
  finishButtonDisabled: { opacity: 0.35 },
  finishButtonText: { color: Colors.black, fontWeight: '700', fontSize: 16 },
});
