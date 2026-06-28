// Discover tab — the swipe deck
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import CardDeck from '@/components/CardDeck';

export default function DiscoverScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>cohort</Text>
        <Text style={styles.tagline}>find your people</Text>
      </View>
      <CardDeck />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  wordmark: {
    color: Colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tagline: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
