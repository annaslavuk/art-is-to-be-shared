// Per-channel chat screen — open to everyone, live via Realtime.
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
import { supabase } from '@/lib/supabase';
import { useUserProfile } from '@/context/UserProfile';

type ChannelMessage = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  profiles: {
    name: string;
    disciplines: string[];
  } | null;
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

export default function ChannelScreen() {
  const { channelId, name } = useLocalSearchParams<{ channelId: string; name: string }>();
  const { profile } = useUserProfile();
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!channelId) return;
    loadMessages();

    const channel = supabase
      .channel(`channel-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('name, disciplines')
            .eq('id', payload.new.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            { ...(payload.new as any), profiles: sender ?? null },
          ]);
          setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [channelId]);

  async function loadMessages() {
    setIsLoading(true);
    const { data } = await supabase
      .from('channel_messages')
      .select('id, sender_id, body, created_at, profiles(name, disciplines)')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (data) setMessages(data as ChannelMessage[]);
    setIsLoading(false);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
  }

  async function sendMessage() {
    const text = messageText.trim();
    if (!text || !profile?.id || isSending) return;
    setIsSending(true);
    setMessageText('');

    await supabase.from('channel_messages').insert({
      channel_id: channelId,
      sender_id: profile.id,
      body: text,
    });
    setIsSending(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>

      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <View>
          <Text style={styles.channelName}>{name ?? 'Channel'}</Text>
          <Text style={styles.channelTag}>open to everyone</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.loading}>
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
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptyBody}>
                  Be the first to post in #{name?.toLowerCase()}.
                </Text>
              </View>
            }
            renderItem={({ item, index }) => {
              const isMe = item.sender_id === profile?.id;
              const prev = index > 0 ? messages[index - 1] : null;
              const showSender = !isMe && item.sender_id !== prev?.sender_id;

              return (
                <View style={[styles.row, isMe && styles.rowMe]}>
                  {showSender && (
                    <Text style={styles.senderLine}>
                      {item.profiles?.name ?? 'Someone'}
                      {item.profiles?.disciplines?.[0]
                        ? ` · ${item.profiles.disciplines[0]}`
                        : ''}
                    </Text>
                  )}
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                      {item.body}
                    </Text>
                    <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
                      {formatAge(item.created_at)}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        <SafeAreaView edges={['bottom']} style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={messageText}
            onChangeText={setMessageText}
            placeholder={`Message #${name?.toLowerCase() ?? 'channel'}…`}
            placeholderTextColor={Colors.textMuted}
            multiline
            onSubmitEditing={sendMessage}
            returnKeyType="send"
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
  channelName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  channelTag: { color: Colors.textMuted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginTop: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  messageList: { padding: 16, gap: 2, flexGrow: 1 },
  empty: { flex: 1, paddingTop: 80, alignItems: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptyBody: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  row: { marginBottom: 2, maxWidth: '80%' },
  rowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  senderLine: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 4,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, gap: 3 },
  bubbleMe: { backgroundColor: Colors.accent },
  bubbleThem: { backgroundColor: Colors.surfaceRaised },
  bubbleText: { fontSize: 15, lineHeight: 21 },
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
});
