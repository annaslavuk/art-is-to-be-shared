import AsyncStorage from '@react-native-async-storage/async-storage';

export type DemoMatch = {
  matchId: string;    // 'demo-{creatorId}'
  creatorId: string;
  name: string;
  discipline: string;
  currentProject: string;
  createdAt: string;
};

const KEY = 'cohort_demo_matches';

export async function getDemoMatches(): Promise<DemoMatch[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveDemoMatch(match: DemoMatch): Promise<void> {
  try {
    const existing = await getDemoMatches();
    const updated = [
      ...existing.filter((m) => m.matchId !== match.matchId),
      match,
    ];
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}
