import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const canSubmit = email.trim() && password.length >= 6;

  async function handleLogin() {
    if (!canSubmit || isLoading) return;
    setIsLoading(true);
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setIsLoading(false);
    if (error) {
      setErrorMessage(error.message);
    }
    // On success: onAuthStateChange in context fires → _layout.tsx redirects automatically.
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        <Text style={styles.wordmark}>cohort</Text>
        <Text style={styles.tagline}>find your people</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              secureTextEntry
            />
          </View>

          {errorMessage ? (
            <Text style={styles.error}>{errorMessage}</Text>
          ) : null}

          <Pressable
            style={[styles.button, (!canSubmit || isLoading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.black} />
            ) : (
              <Text style={styles.buttonText}>Log in</Text>
            )}
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/auth/signup')}>
          <Text style={styles.switchText}>New here? <Text style={styles.switchLink}>Sign up →</Text></Text>
        </Pressable>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, padding: 32, justifyContent: 'center', gap: 32 },
  wordmark: { color: Colors.textPrimary, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tagline: { color: Colors.textMuted, fontSize: 14, letterSpacing: 1, textTransform: 'uppercase', marginTop: -24 },
  form: { gap: 16 },
  field: { gap: 8 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  error: { color: Colors.accentRed, fontSize: 13, textAlign: 'center' },
  button: { backgroundColor: Colors.accent, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: Colors.black, fontWeight: '700', fontSize: 16 },
  switchText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center' },
  switchLink: { color: Colors.accent, fontWeight: '600' },
});
