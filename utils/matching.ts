// Matching logic — scores how well a creator in the deck matches the current user's profile.
import { Creator } from '@/data/creators';
import { UserProfile } from '@/context/UserProfile';

export type MatchResult = {
  score: number;
  sameStage: boolean;
  giveGetMatch: boolean;  // at least one reciprocal give/get overlap
  sharedTastes: string[]; // actual overlapping taste strings
};

// Returns true if any word in string `a` appears as a word in string `b`.
// Lowercase comparison so "Editing" matches "editing narratives".
function keywordsOverlap(a: string, b: string): boolean {
  const wordsA = a.toLowerCase().split(/\s+/);
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  return wordsA.some((w) => w.length > 2 && wordsB.has(w));
}

export function scoreMatch(user: UserProfile, creator: Creator): MatchResult {
  let score = 0;

  // +3 for same career stage
  const sameStage = user.stage === creator.stage;
  if (sameStage) score += 3;

  // +2 for give/get reciprocity (either direction)
  const userGiveMeetsCreatorGet = user.give.some((g) =>
    creator.get.some((need) => keywordsOverlap(g, need))
  );
  const creatorGiveMeetsUserGet = creator.give.some((g) =>
    user.get.some((need) => keywordsOverlap(g, need))
  );
  const giveGetMatch = userGiveMeetsCreatorGet || creatorGiveMeetsUserGet;
  if (giveGetMatch) score += 2;

  // +1 per shared taste
  const userTastesLower = user.tastes.map((t) => t.toLowerCase());
  const creatorTastesLower = creator.tastes.map((t) => t.toLowerCase());
  const sharedTastes = user.tastes.filter((t) =>
    creatorTastesLower.includes(t.toLowerCase())
  );
  score += sharedTastes.length;

  return { score, sameStage, giveGetMatch, sharedTastes };
}

// Returns creators sorted best-match-first, with the user filtered out by name.
export function sortCreatorsByScore(user: UserProfile, creators: Creator[]): Creator[] {
  return creators
    .filter((c) => c.name.toLowerCase() !== user.name.toLowerCase())
    .map((c, i) => ({ creator: c, score: scoreMatch(user, c).score, index: i }))
    .sort((a, b) => b.score - a.score || a.index - b.index) // stable: use original index as tiebreaker
    .map(({ creator }) => creator);
}
