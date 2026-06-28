// Full chat screen — always opens with the other person's project context pinned at the top.
// This is the "no blank chat box" principle: the opening context IS the first move.
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';
import { ALL_CREATORS } from '@/data/creators';
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/context/UserProfile';

type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

type OtherProfile = {
  id: string;
  name: string;
  current_project: string;
  get: string[];
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

export default function ConversationScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { profile } = useUserProfile();
  const isDemo = matchId?.startsWith('demo-');
  const demoCreatorId = isDemo ? matchId!.slice(5) : null;
  const [otherProfile, setOtherProfile] = useState<OtherProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!matchId) return;

    loadConversation();

    if (isDemo) return; // no realtime for demo conversations

    const channel = supabase
      .channel(`messages:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId, profile?.id]);

  async function loadConversation() {
    setIsLoading(true);

    if (isDemo) {
      const fake = ALL_CREATORS.find((c) => c.id === demoCreatorId);
      if (fake) {
        setOtherProfile({
          id: fake.id,
          name: fake.name,
          current_project: fake.currentProject,
          get: fake.get,
        });
      }
      setIsLoading(false);
      return;
    }

    const { data: match } = await supabase
      .from('matches')
      .select('user_a_id, user_b_id')
      .eq('id', matchId)
      .single();

    if (match && profile?.id) {
      const otherId = match.user_a_id === profile.id ? match.user_b_id : match.user_a_id;
      const { data: other } = await supabase
        .from('profiles')
        .select('id, name, current_project, get')
        .eq('id', otherId)
        .single();
      if (other) setOtherProfile(other);
    }

    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
    if (msgs) setMessages(msgs);

    setIsLoading(false);
  }

  async function sendMessage() {
    const text = messageText.trim();
    if (!text || isSending) return;
    setIsSending(true);
    setMessageText('');

    if (isDemo) {
      // Local-only — no DB, just show the message in the UI.
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          match_id: matchId!,
          sender_id: profile?.id ?? 'me',
          body: text,
          created_at: new Date().toISOString(),
        },
      ]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
      setIsSending(false);
      return;
    }

    await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: profile!.id,
      body: text,
    });
    // Realtime subscription picks up the new message — no manual append needed.
    setIsSending(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

      {/* Header bar */}
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerName}>{otherProfile?.name ?? '…'}</Text>
      </View>

      {/* Demo banner — shown for placeholder cards only */}
      {isDemo && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>Demo conversation — messages won't be saved</Text>
        </View>
      )}

      {/* Pinned context card — the concrete next step, always visible */}
      {otherProfile && (
        <View style={styles.contextCard}>
          <View style={styles.contextSection}>
            <Text style={styles.contextLabel}>What {otherProfile.name.split(' ')[0]} is working on</Text>
            <Text style={styles.contextValue}>{otherProfile.current_project}</Text>
          </View>
          {otherProfile.get[0] && (
            <>
              <View style={styles.contextDivider} />
              <View style={styles.contextSection}>
                <Text style={styles.contextLabel}>What they need</Text>
                <Text style={[styles.contextValue, styles.contextNeed]}>{otherProfile.get[0]}</Text>
              </View>
            </>
          )}
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Message list */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View style={styles.emptyMessages}>
                <Text style={styles.emptyText}>
                  Say hi — you already know what they're working on.
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const isMe = item.sender_id === profile?.id;
              return (
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                    {item.body}
                  </Text>
                  <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
                    {formatAge(item.created_at)}
                  </Text>
                </View>
              );
            }}
          />
        )}

        {/* Input bar */}
        <SafeAreaView edges={['bottom']} style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Send a message…"
            placeholderTextColor={Colors.textMuted}
            multiline
            onSubmitEditing={sendMessage}
          />
          <Pressable
            style={[styles.sendButton, (!messageText.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!messageText.trim() || isSending}
          >
            <Text style={styles.sendButtonText}>→</Text>
          </Pressable>
        </SafeAreaView>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  backButton: { padding: 4 },
  backText: { color: Colors.accent, fontSize: 20 },
  headerName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  contextCard: {
    margin: 12,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 10,
  },
  contextSection: { gap: 4 },
  contextLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contextValue: { color: Colors.textPrimary, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  contextNeed: { color: Colors.accent },
  contextDivider: { height: 1, backgroundColor: Colors.border },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messageList: { padding: 12, gap: 8 },
  emptyMessages: { padding: 32, alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  bubble: { maxWidth: '80%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: Colors.accent },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: Colors.surfaceRaised },
  bubbleText: { fontSize: 15 },
  bubbleTextMe: { color: Colors.black },
  bubbleTextThem: { color: Colors.textPrimary },
  bubbleTime: { fontSize: 10 },
  bubbleTimeMe: { color: 'rgba(0,0,0,0.45)', textAlign: 'right' },
  bubbleTimeThem: { color: Colors.textMuted },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: Colors.textPrimary,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { opacity: 0.35 },
  sendButtonText: { color: Colors.black, fontSize: 18, fontWeight: '700' },
  demoBanner: {
    backgroundColor: Colors.surfaceRaised,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: 'center',
  },
  demoBannerText: { color: Colors.textMuted, fontSize: 11, letterSpacing: 0.5 },
});
