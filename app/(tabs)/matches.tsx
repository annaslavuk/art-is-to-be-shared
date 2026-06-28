// Matches tab — shows all active conversations after mutual swipes.
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/context/UserProfile';
import { getDemoMatches, DemoMatch } from '@/utils/demoMatches';

type MatchRow = {
  id: string;
  created_at: string;
  otherName: string;
  latestMessage: string;
  latestMessageTime: string;
  isUnread: boolean;
};

function formatAge(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  if (h < 48) return 'yesterday';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function MatchesTab() {
  const { profile } = useUserProfile();
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [demoMatches, setDemoMatches] = useState<DemoMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reload whenever this tab comes into focus.
  useFocusEffect(
    useCallback(() => {
      getDemoMatches().then(setDemoMatches);
      if (profile?.id) loadMatches();
    }, [profile?.id])
  );

  async function loadMatches() {
    if (!profile?.id) return;
    setIsLoading(true);

    // Fetch all matches for this user.
    const { data: matchRows } = await supabase
      .from('matches')
      .select('id, created_at, user_a_id, user_b_id')
      .or(`user_a_id.eq.${profile.id},user_b_id.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    if (!matchRows || matchRows.length === 0) {
      setMatches([]);
      setIsLoading(false);
      return;
    }

    // Collect the other person's profile ID for each match.
    const otherIds = matchRows.map((m: any) =>
      m.user_a_id === profile.id ? m.user_b_id : m.user_a_id
    );

    // Fetch other profiles in one batch.
    const { data: otherProfiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', otherIds);

    const profileMap = new Map((otherProfiles ?? []).map((p: any) => [p.id, p]));

    // Fetch the latest message for each match.
    const matchIds = matchRows.map((m: any) => m.id);
    const { data: allMessages } = await supabase
      .from('messages')
      .select('match_id, body, created_at, sender_id')
      .in('match_id', matchIds)
      .order('created_at', { ascending: false });

    // Group latest message per match.
    const latestMsgMap = new Map<string, any>();
    for (const msg of allMessages ?? []) {
      if (!latestMsgMap.has(msg.match_id)) {
        latestMsgMap.set(msg.match_id, msg);
      }
    }

    const rows: MatchRow[] = matchRows.map((m: any) => {
      const otherId = m.user_a_id === profile.id ? m.user_b_id : m.user_a_id;
      const other = profileMap.get(otherId);
      const latest = latestMsgMap.get(m.id);
      return {
        id: m.id,
        created_at: m.created_at,
        otherName: other?.name ?? 'Unknown',
        latestMessage: latest?.body ?? 'No messages yet — say hi!',
        latestMessageTime: latest?.created_at ?? m.created_at,
        isUnread: latest ? latest.sender_id !== profile.id : false,
      };
    });

    // Sort by latest message time descending.
    rows.sort((a, b) => new Date(b.latestMessageTime).getTime() - new Date(a.latestMessageTime).getTime());

    setMatches(rows);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches</Text>
      </View>

      {matches.length === 0 && demoMatches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No matches yet</Text>
          <Text style={styles.emptyBody}>Keep swiping — when someone swipes right back, you'll find them here.</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            demoMatches.length > 0 ? (
              <View>
                <Text style={styles.sectionLabel}>Demo matches</Text>
                {demoMatches.map((dm) => (
                  <Pressable
                    key={dm.matchId}
                    style={styles.row}
                    onPress={() => router.push({ pathname: '/conversation/[matchId]', params: { matchId: dm.matchId } })}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarInitial}>{dm.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View style={styles.rowContent}>
                      <View style={styles.rowTop}>
                        <Text style={styles.rowName}>{dm.name}</Text>
                        <View style={styles.demoBadge}><Text style={styles.demoBadgeText}>demo</Text></View>
                      </View>
                      <Text style={styles.rowPreview} numberOfLines={1}>{dm.currentProject}</Text>
                    </View>
                  </Pressable>
                ))}
                {matches.length > 0 && (
                  <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Real matches</Text>
                )}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => router.push({ pathname: '/conversation/[matchId]', params: { matchId: item.id } })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>{item.otherName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.rowContent}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowName}>{item.otherName}</Text>
                  <Text style={styles.rowTime}>{formatAge(item.latestMessageTime)}</Text>
                </View>
                <View style={styles.rowBottom}>
                  <Text
                    style={[styles.rowPreview, item.isUnread && styles.rowPreviewUnread]}
                    numberOfLines={1}
                  >
                    {item.latestMessage}
                  </Text>
                  {item.isUnread && <View style={styles.unreadDot} />}
                </View>
              </View>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' },
  emptyBody: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  list: { paddingVertical: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarInitial: { color: Colors.accent, fontSize: 18, fontWeight: '700' },
  rowContent: { flex: 1, gap: 4 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  rowTime: { color: Colors.textMuted, fontSize: 12 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowPreview: { flex: 1, color: Colors.textSecondary, fontSize: 13 },
  rowPreviewUnread: { color: Colors.textPrimary, fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.accent },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 82 },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  demoBadge: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  demoBadgeText: { color: Colors.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
});
