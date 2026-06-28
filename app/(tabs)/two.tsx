// Profile tab — shows the user's Give/Get profile created in onboarding.
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { useUserProfile } from '@/context/UserProfile';

export default function ProfileScreen() {
  const { profile, signOut } = useUserProfile();

  // This screen should only be reachable after onboarding, but handle it gracefully.
  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No profile yet</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/onboarding/step1')}>
            <Text style={styles.primaryButtonText}>Create your profile</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.meta}>
            {profile.disciplines.join(', ')} · {profile.stage}
          </Text>
          <Text style={styles.location}>{profile.location}</Text>
        </View>

        {/* Working on */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Working on</Text>
          <Text style={styles.cardBody}>{profile.currentProject}</Text>
        </View>

        {/* Give */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What I give</Text>
          <View style={styles.pills}>
            {profile.give.map((item) => (
              <View key={item} style={styles.pill}>
                <Text style={styles.pillText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Get */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>What I need</Text>
          <View style={styles.pills}>
            {profile.get.map((item) => (
              <View key={item} style={[styles.pill, styles.pillNeed]}>
                <Text style={[styles.pillText, styles.pillTextNeed]}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Taste */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Into</Text>
          <Text style={styles.tasteText}>{profile.tastes.join(', ')}</Text>
        </View>

        {/* Edit */}
        <Pressable style={styles.editButton} onPress={() => router.push('/onboarding/step1')}>
          <Text style={styles.editButtonText}>Edit profile</Text>
        </Pressable>

        {/* Sign out */}
        <Pressable style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { padding: 24, gap: 20, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700' },
  header: { gap: 4, paddingBottom: 4 },
  name: { color: Colors.textPrimary, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  meta: { color: Colors.accent, fontSize: 14, textTransform: 'capitalize', marginTop: 2 },
  location: { color: Colors.textSecondary, fontSize: 13 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 6,
  },
  cardBody: { color: Colors.textPrimary, fontSize: 15, lineHeight: 22, fontWeight: '500' },
  section: { gap: 10 },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  pillNeed: { borderColor: Colors.accent, backgroundColor: 'transparent' },
  pillText: { color: Colors.textPrimary, fontSize: 13 },
  pillTextNeed: { color: Colors.accent },
  tasteText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
  workedWith: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  workedWithText: { color: Colors.textMuted, fontSize: 12, textAlign: 'center' },
  primaryButton: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  primaryButtonText: { color: Colors.black, fontWeight: '700', fontSize: 15 },
  editButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  editButtonText: { color: Colors.textSecondary, fontSize: 15 },
  signOutButton: { paddingVertical: 8, alignItems: 'center' },
  signOutText: { color: Colors.textMuted, fontSize: 13 },
});
