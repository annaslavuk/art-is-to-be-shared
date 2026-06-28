// Step 2 of 5 — Your work: what you're making right now.
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/Colors';
import { useUserProfile } from '@/context/UserProfile';

export default function Step2() {
  const { draft, updateDraft } = useUserProfile();

  const [currentProject, setCurrentProject] = useState(draft.currentProject ?? '');
  const [workCaption, setWorkCaption] = useState(draft.workCaption ?? '');

  // Track the two image modes separately so switching doesn't lose the other value.
  const prevUrl = draft.workImageUrl ?? '';
  const [imageMode, setImageMode] = useState<'upload' | 'link'>(
    prevUrl && !prevUrl.startsWith('data:') ? 'link' : 'upload'
  );
  const [uploadedImage, setUploadedImage] = useState(
    prevUrl.startsWith('data:') ? prevUrl : ''
  );
  const [linkUrl, setLinkUrl] = useState(
    prevUrl && !prevUrl.startsWith('data:') ? prevUrl : ''
  );
  const [linkImageValid, setLinkImageValid] = useState(true);
  const [isPicking, setIsPicking] = useState(false);

  // The active image URL used for the draft and preview.
  const workImageUrl = imageMode === 'upload' ? uploadedImage : linkUrl;
  const canContinue = currentProject.trim() && workImageUrl.trim() && workCaption.trim();

  async function pickImage() {
    setIsPicking(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.35,
      base64: true,
    });
    setIsPicking(false);

    if (!result.canceled && result.assets[0]?.base64) {
      setUploadedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  }

  function handleContinue() {
    updateDraft({
      currentProject: currentProject.trim(),
      workImageUrl: workImageUrl.trim(),
      workCaption: workCaption.trim(),
    });
    router.push('/onboarding/step3');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        <Text style={styles.stepLabel}>Step 2 of 5</Text>
        <Text style={styles.heading}>Show your work</Text>
        <Text style={styles.subheading}>
          This is the front of your card — other creatives see your work before your name.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>What are you working on right now?</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={currentProject}
            onChangeText={setCurrentProject}
            placeholder="e.g. Shooting a 10-min doc about a flower market in Boyle Heights"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>A photo of your work</Text>
          <Text style={styles.hint}>A still, a shot, album art — what represents what you make.</Text>

          {/* Mode toggle */}
          <View style={styles.modeRow}>
            <Pressable
              style={[styles.modeButton, imageMode === 'upload' && styles.modeButtonActive]}
              onPress={() => setImageMode('upload')}
            >
              <Text style={[styles.modeButtonText, imageMode === 'upload' && styles.modeButtonTextActive]}>
                Upload photo
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, imageMode === 'link' && styles.modeButtonActive]}
              onPress={() => setImageMode('link')}
            >
              <Text style={[styles.modeButtonText, imageMode === 'link' && styles.modeButtonTextActive]}>
                Use a link
              </Text>
            </Pressable>
          </View>

          {/* Upload mode */}
          {imageMode === 'upload' && (
            uploadedImage ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: uploadedImage }} style={styles.preview} resizeMode="cover" />
                <Pressable style={styles.changeButton} onPress={pickImage}>
                  <Text style={styles.changeButtonText}>Change photo</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.uploadArea} onPress={pickImage} disabled={isPicking}>
                {isPicking ? (
                  <ActivityIndicator color={Colors.accent} />
                ) : (
                  <>
                    <Text style={styles.uploadIcon}>⊕</Text>
                    <Text style={styles.uploadLabel}>Upload a JPEG or PNG</Text>
                    <Text style={styles.uploadSub}>Tap to choose from your files</Text>
                  </>
                )}
              </Pressable>
            )
          )}

          {/* Link mode */}
          {imageMode === 'link' && (
            <View style={styles.linkContainer}>
              <TextInput
                style={styles.input}
                value={linkUrl}
                onChangeText={(v) => { setLinkUrl(v); setLinkImageValid(true); }}
                placeholder="Portfolio link, Instagram, Behance, Vimeo, or direct image link"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                keyboardType="url"
                autoCorrect={false}
              />
              {linkUrl.trim() !== '' && linkImageValid && (
                <Image
                  source={{ uri: linkUrl.trim() }}
                  style={styles.preview}
                  resizeMode="cover"
                  onError={() => setLinkImageValid(false)}
                />
              )}
              {/* Portfolio website — not a direct image but still valid */}
              {linkUrl.trim() !== '' && !linkImageValid && (
                <View style={styles.portfolioSaved}>
                  <Text style={styles.portfolioIcon}>⊞</Text>
                  <Text style={styles.portfolioTitle}>Portfolio link saved</Text>
                  <Text style={styles.portfolioUrl} numberOfLines={1}>
                    {linkUrl.trim().replace(/^https?:\/\//, '')}
                  </Text>
                  <Text style={styles.portfolioNote}>
                    Shown as a link on your card — visitors can tap through to your work.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>One-line caption</Text>
          <TextInput
            style={styles.input}
            value={workCaption}
            onChangeText={setWorkCaption}
            placeholder='e.g. Still from "Margin" — a short about displacement'
            placeholderTextColor={Colors.textMuted}
          />
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
  inner: { padding: 28, paddingBottom: 8, gap: 24 },
  stepLabel: { color: Colors.textMuted, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' },
  heading: { color: Colors.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.3, marginTop: -8 },
  subheading: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22, marginTop: -12 },
  field: { gap: 10 },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  hint: { color: Colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: -4 },
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
  multiline: { height: 90, textAlignVertical: 'top' },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
  },
  modeButtonActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  modeButtonText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  modeButtonTextActive: { color: Colors.black, fontWeight: '700' },
  uploadArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    borderRadius: 14,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
  },
  uploadIcon: { color: Colors.accent, fontSize: 32 },
  uploadLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  uploadSub: { color: Colors.textMuted, fontSize: 12 },
  previewContainer: { gap: 10 },
  preview: { width: '100%', height: 180, borderRadius: 12, backgroundColor: Colors.surface },
  changeButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  changeButtonText: { color: Colors.textSecondary, fontSize: 13 },
  linkContainer: { gap: 10 },
  portfolioSaved: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    gap: 4,
    alignItems: 'center',
  },
  portfolioIcon: { color: Colors.accent, fontSize: 24 },
  portfolioTitle: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' },
  portfolioUrl: { color: Colors.accent, fontSize: 12 },
  portfolioNote: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 16, marginTop: 4 },
  footer: { padding: 20, paddingBottom: 8 },
  continueButton: { backgroundColor: Colors.accent, borderRadius: 14, padding: 16, alignItems: 'center' },
  continueButtonDisabled: { opacity: 0.35 },
  continueButtonText: { color: Colors.black, fontWeight: '700', fontSize: 16 },
});
