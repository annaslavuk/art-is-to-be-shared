// Scene tab — browse and search all channels (topic + local).
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/context/UserProfile';
import { getLocalChannelSlug } from '@/utils/localChannel';

type Channel = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: 'local' | 'topic';
};

export default function SceneScreen() {
  const { profile } = useUserProfile();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const localSlug = profile?.location ? getLocalChannelSlug(profile.location) : 'local-other';

  useEffect(() => {
    loadChannels();
  }, []);

  async function loadChannels() {
    setIsLoading(true);
    const { data } = await supabase
      .from('channels')
      .select('id, slug, name, description, category')
      .order('name');
    if (data) setChannels(data as Channel[]);
    setIsLoading(false);
  }

  function openChannel(channel: Channel) {
    router.push({
      pathname: '/channel/[channelId]',
      params: { channelId: channel.id, name: channel.name },
    });
  }

  const localChannel = channels.find((c) => c.slug === localSlug);

  const isSearching = search.trim().length > 0;
  const topicChannels = channels.filter((c) => c.category === 'topic');
  const otherLocalChannels = channels.filter(
    (c) => c.category === 'local' && c.slug !== localSlug
  );

  const searchResults = isSearching
    ? channels.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scene</Text>
        <Text style={styles.subtitle}>Find your channel</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search channels…"
          placeholderTextColor={Colors.textMuted}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.accent} size="large" />
        </View>
      ) : isSearching ? (
        /* ── Search results ── */
        <ScrollView contentContainerStyle={styles.scroll}>
          {searchResults.length === 0 ? (
            <Text style={styles.noResults}>No channels match "{search}"</Text>
          ) : (
            searchResults.map((ch) => (
              <ChannelRow key={ch.id} channel={ch} onPress={() => openChannel(ch)} />
            ))
          )}
        </ScrollView>
      ) : (
        /* ── Default browse view ── */
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Pinned local channel */}
          {localChannel && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Your Local Scene</Text>
              <Pressable style={styles.localCard} onPress={() => openChannel(localChannel)}>
                <View style={styles.localCardBody}>
                  <Text style={styles.localCardIcon}>◉</Text>
                  <View style={styles.localCardText}>
                    <Text style={styles.localCardName}>{localChannel.name}</Text>
                    <Text style={styles.localCardDesc}>{localChannel.description}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>→</Text>
              </Pressable>
            </View>
          )}

          {/* Topic channels */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Topics</Text>
            {topicChannels.map((ch) => (
              <ChannelRow key={ch.id} channel={ch} onPress={() => openChannel(ch)} />
            ))}
          </View>

          {/* Other local scenes */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Other Cities</Text>
            {otherLocalChannels.map((ch) => (
              <ChannelRow key={ch.id} channel={ch} onPress={() => openChannel(ch)} />
            ))}
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ChannelRow({ channel, onPress }: { channel: Channel; onPress: () => void }) {
  const isLocal = channel.category === 'local';
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowHash}>{isLocal ? '◉' : '#'}</Text>
      <View style={styles.rowText}>
        <Text style={styles.rowName}>{channel.name}</Text>
        <Text style={styles.rowDesc} numberOfLines={1}>{channel.description}</Text>
      </View>
      <Text style={styles.chevron}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: Colors.textMuted, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 2 },
  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, gap: 8 },
  section: { gap: 6, marginBottom: 12 },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 2,
    marginLeft: 4,
  },
  // Local channel card — bigger, more prominent
  localCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  localCardBody: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  localCardIcon: { color: Colors.accent, fontSize: 24 },
  localCardText: { flex: 1, gap: 2 },
  localCardName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  localCardDesc: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
  // Regular channel row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowHash: { color: Colors.textMuted, fontSize: 16, fontWeight: '700', width: 18, textAlign: 'center' },
  rowText: { flex: 1, gap: 2 },
  rowName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  rowDesc: { color: Colors.textMuted, fontSize: 12 },
  chevron: { color: Colors.textMuted, fontSize: 14 },
  noResults: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', paddingTop: 40 },
});
