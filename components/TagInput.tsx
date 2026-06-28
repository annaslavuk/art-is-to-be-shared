// Reusable tag-entry UI used across onboarding steps 3, 4, and 5.
// Type a skill or name, press Add, it becomes a removable pill.
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Colors from '@/constants/Colors';

type Props = {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export default function TagInput({ tags, onChange, placeholder = 'Type and press Add' }: Props) {
  const [inputValue, setInputValue] = useState('');

  function addTag() {
    const trimmed = inputValue.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInputValue('');
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag));
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          onSubmitEditing={addTag}
          returnKeyType="done"
        />
        <Pressable
          style={[styles.addButton, !inputValue.trim() && styles.addButtonDisabled]}
          onPress={addTag}
          disabled={!inputValue.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {tags.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
          {tags.map((tag) => (
            <View key={tag} style={styles.pill}>
              <Text style={styles.pillText}>{tag}</Text>
              <Pressable onPress={() => removeTag(tag)} hitSlop={8}>
                <Text style={styles.pillRemove}>×</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  addButton: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.35,
  },
  addButtonText: {
    color: Colors.black,
    fontWeight: '700',
    fontSize: 14,
  },
  pills: {
    flexDirection: 'row',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  pillText: {
    color: Colors.textPrimary,
    fontSize: 13,
  },
  pillRemove: {
    color: Colors.textMuted,
    fontSize: 16,
    lineHeight: 18,
  },
});
