// Shared sessionStorage key used to hand off the last-known XP/level/streak totals
// from a quiz submission (quiz-result.component.ts writes it) to any UI that wants
// to show "my current stats" (xp-streak-widget.component.ts reads it) — a stopgap
// until backend exposes a dedicated "my current totals" endpoint outside the
// one-shot post-quiz newlyEarned payload.
export const GAMIFICATION_STATS_CACHE_KEY = 'cm_last_gamification_stats';

export interface CachedGamificationStats {
  totalPoints: number;
  level: LevelInfo;
  streak: StreakInfo | null;
  cachedAt: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
}

export const LEVEL_TIERS: LevelInfo[] = [
  { level: 1, title: 'Rookie', minXp: 0 },
  { level: 2, title: 'Learner', minXp: 100 },
  { level: 3, title: 'Achiever', minXp: 300 },
  { level: 4, title: 'Specialist', minXp: 700 },
  { level: 5, title: 'Expert', minXp: 1500 },
  { level: 6, title: 'Champion', minXp: 3000 },
  { level: 7, title: 'Legend', minXp: 6000 },
];

export interface StreakInfo {
  current: number;
  longest: number;
  // Omitted by the API (not null) when no 7/30/100-day milestone was hit this submission.
  milestoneHit?: number;
}

export interface NewlyEarnedBadge {
  code: string;
  name: string;
}

export interface EarnedCertificate {
  certificationTrackId?: number;
  title?: string;
  certificateNumber?: string;
  [key: string]: any;
}

export interface NewlyEarned {
  xpAwarded: number;
  totalPoints: number;
  level: LevelInfo;
  leveledUp: boolean;
  streak: StreakInfo;
  badgesEarned: NewlyEarnedBadge[];
  certificatesEarned: EarnedCertificate[];
}

export type BadgeScopeType = 'Global' | 'Subject' | 'JobRole' | 'Topic';
export type BadgeSource = 'System' | 'Manual' | 'Interview';

export interface Badge {
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  points: number;
  earnedAt: string | null;
  scopeType: BadgeScopeType;
  scopeId: number | null;
  // Display order within this badge's own scope (lower = easier, shown first). Every badge list
  // the API returns is already sorted by it — don't re-sort client-side.
  sortOrder: number;
  // Only present on `earned` entries from /my-badges — always null on `locked` ones.
  source: BadgeSource | null;
}

export interface MyBadgesResponse {
  earned: Badge[];
  locked: Badge[];
}

// The `badges` field embedded in subjectDashboard/programDetails responses — same fields as
// Badge, flattened into one list with an `unlocked` flag instead of split earned/locked, since
// these dashboards show one subject/job-role's badges at a time.
export interface ScopedBadgeEntry extends Badge {
  unlocked: boolean;
}

export type BadgeAwardMethod = 'System' | 'Manual';

export interface BadgeRule {
  id: number;
  badgeId: number;
  metric: 'SubjectCorrectCoverage' | 'TopicCorrectCoverage';
  threshold: number;
  difficultyLevel: 1 | 2 | 3 | null;
  createdAt: string;
  updatedAt: string;
}

// The admin/grantor catalog entry from GET apis/achievements/badges — richer than `Badge`
// (my-badges/embedded shapes), includes the fields needed to build a grant picker.
export interface BadgeCatalogEntry {
  id: number;
  code: string;
  name: string;
  description: string;
  content: string;
  iconUrl: string;
  points: number;
  scopeType: BadgeScopeType;
  scopeId: number | null;
  awardMethod: BadgeAwardMethod;
  // The authoritative gate for POST .../badges/grant — awardMethod is a display hint only.
  isManuallyGrantable: boolean;
  isPublished: boolean;
  // Display order within this badge's own scope (lower = easier, shown first).
  sortOrder: number;
  rule: BadgeRule | null;
  createdAt: string;
}

export interface GrantBadgeRequest {
  userId: number;
  badgeId: number;
  note?: string;
}

export interface GrantBadgeResponse {
  code: string;
  name: string;
  earnedAt: string;
  alreadyEarned: boolean;
}

export interface LeaderboardEntry {
  userId: number;
  name: string;
  username: string;
  image: string | null;
  points: number;
  rank: number;
}

export type LeaderboardPeriod = 'all-time' | 'weekly' | 'monthly';

export interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  period: LeaderboardPeriod;
  periodStart: string | null;
}

export interface NextTrackNudge {
  id: number;
  title: string;
  progressPercent: number;
}

export interface MyCertificate {
  certificateNumber: string;
  status: string;
  issuedAt: string;
  pdfUrl: string | null;
}

export interface LevelProgress {
  level: LevelInfo;
  nextLevel: LevelInfo | null;
  xpIntoLevel: number;
  xpForNext: number | null;
  percent: number;
}

/**
 * Finds the highest tier with minXp <= totalPoints, then computes progress
 * toward the next tier. Level 7 (Legend) has no next tier — returns percent:100.
 */
export function getLevelProgress(totalPoints: number): LevelProgress {
  const points = Math.max(0, totalPoints ?? 0);
  let current = LEVEL_TIERS[0];
  for (const tier of LEVEL_TIERS) {
    if (tier.minXp <= points) current = tier;
    else break;
  }
  const currentIndex = LEVEL_TIERS.indexOf(current);
  const nextLevel = LEVEL_TIERS[currentIndex + 1] ?? null;

  if (!nextLevel) {
    return { level: current, nextLevel: null, xpIntoLevel: points - current.minXp, xpForNext: null, percent: 100 };
  }

  const xpIntoLevel = points - current.minXp;
  const xpForNext = nextLevel.minXp - current.minXp;
  const percent = xpForNext > 0 ? Math.min(100, Math.round((xpIntoLevel / xpForNext) * 100)) : 0;
  return { level: current, nextLevel, xpIntoLevel, xpForNext, percent };
}
