// Step 1 of 5 — Basic info: who you are and where you are.
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { Discipline, Stage } from '@/data/creators';
import { useUserProfile } from '@/context/UserProfile';

const DISCIPLINES: Discipline[] = [
  'filmmaker', 'photographer', 'musician', 'editor',
  'colorist', 'sound designer', 'writer', 'animator',
];

const STAGES: Stage[] = [
  'just starting out',
  'a few projects in',
  'working consistently',
  'going full-time',
];

// Major creative hubs — filtered as the user types.
const CITIES = [
  'Los Angeles, CA', 'New York, NY', 'Chicago, IL', 'San Francisco, CA',
  'Austin, TX', 'Nashville, TN', 'Atlanta, GA', 'Seattle, WA',
  'Portland, OR', 'Denver, CO', 'Miami, FL', 'Philadelphia, PA',
  'Boston, MA', 'Detroit, MI', 'New Orleans, LA', 'Minneapolis, MN',
  'Dallas, TX', 'Houston, TX', 'Phoenix, AZ', 'San Diego, CA',
  'Oakland, CA', 'Brooklyn, NY', 'Burbank, CA', 'Culver City, CA',
  'Silver Lake, CA', 'East LA, CA', 'Pasadena, CA', 'Long Beach, CA',
  'London, UK', 'Paris, France', 'Berlin, Germany', 'Toronto, Canada',
  'Montreal, Canada', 'Vancouver, Canada', 'Mexico City, Mexico',
  'Sydney, Australia', 'Melbourne, Australia', 'Tokyo, Japan',
  'Seoul, South Korea', 'Amsterdam, Netherlands',
];

export default function Step1() {
  const { draft, updateDraft } = useUserProfile();

  const [name, setName] = useState(draft.name ?? '');
  const [disciplines, setDisciplines] = useState<Discipline[]>(draft.disciplines ?? []);
  const [stage, setStage] = useState<Stage | undefined>(draft.stage);
  const [location, setLocation] = useState(draft.location ?? '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const canContinue = name.trim() && disciplines.length > 0 && stage && location.trim();

  const citySuggestions = location.trim().length > 0
    ? CITIES.filter((c) => c.toLowerCase().includes(location.toLowerCase())).slice(0, 6)
    : [];

  function toggleDiscipline(d: Discipline) {
    setDisciplines((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function selectCity(city: string) {
    setLocation(city);
    setShowSuggestions(false);
  }

  function handleContinue() {
    updateDraft({ name: name.trim(), disciplines, stage, location: location.trim() });
    router.push('/onboarding/step2');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        <Text style={styles.stepLabel}>Step 1 of 5</Text>
        <Text style={styles.heading}>Tell us who you are</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Maya Reyes"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Your disciplines — pick all that apply</Text>
          <View style={styles.pills}>
            {DISCIPLINES.map((d) => (
              <Pressable
                key={d}
                style={[styles.pill, disciplines.includes(d) && styles.pillActive]}
                onPress={() => toggleDiscipline(d)}
              >
                <Text style={[styles.pillText, disciplines.includes(d) && styles.pillTextActive]}>
                  {d}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Where are you in your journey?</Text>
          <View style={styles.pills}>
            {STAGES.map((s) => (
              <Pressable
                key={s}
                style={[styles.pill, stage === s && styles.pillActive]}
                onPress={() => setStage(s)}
              >
                <Text style={[styles.pillText, stage === s && styles.pillTextActive]}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Your city</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={(v) => { setLocation(v); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="e.g. Los Angeles, CA"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {showSuggestions && citySuggestions.length > 0 && (
            <View style={styles.dropdown}>
              {citySuggestions.map((city) => (
                <Pressable
                  key={city}
                  style={styles.dropdownItem}
                  onPress={() => selectCity(city)}
                >
                  <Text style={styles.dropdownText}>{city}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

      </ScrollView>

      <View style={styles.footer}>
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
  inner: { padding: 28, paddingBottom: 8, gap: 28 },
  stepLabel: { color: Colors.textMuted, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  heading: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.3, marginTop: -12 },
  field: { gap: 10 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  dropdown: {
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pillActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  pillText: { color: Colors.textSecondary, fontSize: 13, textTransform: 'capitalize' },
  pillTextActive: { color: Colors.black, fontWeight: '700' },
  footer: { padding: 20, paddingBottom: 8 },
  continueButton: { backgroundColor: Colors.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
  continueButtonDisabled: { opacity: 0.35 },
  continueButtonText: { color: Colors.black, fontWeight: '700', fontSize: 16 },
});
