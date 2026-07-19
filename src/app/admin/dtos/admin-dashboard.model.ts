// ---------------------
// Generic Time Series Types
// ---------------------
export interface DailySeriesItem {
  date: string; // ISO date string
  count: number;
}

export interface WeeklySeriesItem {
  week: string; // e.g. "2025-W43"
  count: number;
}

export interface DailyTrendSeries {
  users: DailySeriesItem[];
  questions: DailySeriesItem[];
  quizzes: DailySeriesItem[];
  attempts: DailySeriesItem[];
  certificates: DailySeriesItem[];
  badges: DailySeriesItem[];
}

export interface WeeklyTrendSeries {
  users: WeeklySeriesItem[];
  questions: WeeklySeriesItem[];
  quizzes: WeeklySeriesItem[];
  attempts: WeeklySeriesItem[];
  certificates: WeeklySeriesItem[];
  badges: WeeklySeriesItem[];
}

export interface TrendsStats {
  daily: DailyTrendSeries;
  weekly: WeeklyTrendSeries;
}

// ---------------------
// Overview (KPI strip)
// ---------------------
export interface OverviewStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalPrograms: number;
  totalCertificationTracks: number;
  totalSubjectTracks: number;
  totalSubjects: number;
  totalTopics: number;
  totalQuestions: number;
  totalQuizzes: number;
  totalLessons: number;
  totalQuizAttempts: number;
  totalQuestionAttempts: number;
  certificatesIssued: number;
  badgesAwarded: number;
}

// ---------------------
// People
// ---------------------
export interface TopLearner {
  id: number;
  name: string;
  image: string | null;
  level: string | null;
  points: number;
}

export interface PeopleStats {
  users: {
    total: number;
    active: number;
    pending: number;
    blocked: number;
    admins: number;
    moderators: number;
    learners: number;
    withDesignation: number;
  };
  growth: {
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  streaks: {
    usersWithActiveStreak: number;
    avgCurrentStreak: number;
    longestStreakEver: number;
  };
  topLearners: TopLearner[];
}

// ---------------------
// Content structure
// ---------------------
export interface PublishedStats {
  total: number;
  published: number;
  draft: number;
}

export interface ContentStats {
  programs: PublishedStats;
  certificationTracks: PublishedStats;
  subjectTracks: PublishedStats;
  subjects: PublishedStats;
  topics: PublishedStats;
  questions: {
    total: number;
    byType: {
      trivia: { total: number; active: number; pending: number };
      general: { total: number; active: number; pending: number };
    };
    byLevel: { easy: number; intermediate: number; advanced: number };
  };
  lessons: { total: number };
  moderationQueue: {
    pendingQuestions: number;
    unpublishedSubjects: number;
    unpublishedTopics: number;
    unpublishedSubjectTracks: number;
    unpublishedCertificationTracks: number;
  };
}

// ---------------------
// Engagement
// ---------------------
export interface TopQuiz {
  id: number;
  title: string;
  plays: number;
}

export interface EngagementStats {
  quizzes: {
    total: number;
    published: number;
    draft: number;
    byType: { userQuiz: number; standard: number };
    playedQuizzes: number;
    totalPlays: number;
    avgPlaysPerQuiz: number;
    avgScore: number;
    topQuizzes: TopQuiz[];
  };
  questionAttempts: {
    total: number;
    correct: number;
    wrong: number;
    skipped: number;
    distinctUsers: number;
    accuracyPercent: number;
  };
  lessons: {
    totalViews: number;
    totalPending: number;
    totalCompleted: number;
    completionRate: number;
  };
}

// ---------------------
// Achievements
// ---------------------
export interface TopCertificationTrack {
  id: number;
  title: string;
  issuedCount: number;
}

export interface TopBadge {
  code: string;
  name: string;
  scopeType: string | null;
  earnCount: number;
}

export interface RareBadge {
  code: string;
  name: string;
  scopeType: string;
  earnCount: number;
}

export interface AchievementStats {
  certificates: {
    totalIssued: number;
    totalRevoked: number;
    totalExpired: number;
    uniqueHolders: number;
    issuedThisWeek: number;
    issuedThisMonth: number;
    topCertificationTracks: TopCertificationTrack[];
  };
  badges: {
    totalAvailable: number;
    totalAwarded: number;
    uniqueEarners: number;
    byScope: { global: number; subject: number; jobRole: number; topic: number };
    topBadges: TopBadge[];
    rareBadges: RareBadge[];
  };
}

// ---------------------
// Recent activity
// ---------------------
export interface RecentActivityItem {
  id: number;
  title: string;
  message: string;
  userId: number;
  userName: string | null;
  dataType: string | null;
  dataId: number | null;
  createdAt: string;
}

// ---------------------
// Combined Dashboard Data
// ---------------------
export interface AdminDashboardData {
  overview: OverviewStats;
  people: PeopleStats;
  content: ContentStats;
  engagement: EngagementStats;
  achievements: AchievementStats;
  recentActivity: RecentActivityItem[];
  trends: TrendsStats;
}

export interface AdminDashboardResponse {
  error: boolean;
  result_code: number;
  message: string;
  data: AdminDashboardData;
}

// ---------------------
// Zero-state factory — always returns a fresh instance so no widget
// needs a null-guard while the first API response is in flight.
// ---------------------
export function emptyAdminDashboardData(): AdminDashboardData {
  return {
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      totalPrograms: 0,
      totalCertificationTracks: 0,
      totalSubjectTracks: 0,
      totalSubjects: 0,
      totalTopics: 0,
      totalQuestions: 0,
      totalQuizzes: 0,
      totalLessons: 0,
      totalQuizAttempts: 0,
      totalQuestionAttempts: 0,
      certificatesIssued: 0,
      badgesAwarded: 0,
    },
    people: {
      users: {
        total: 0,
        active: 0,
        pending: 0,
        blocked: 0,
        admins: 0,
        moderators: 0,
        learners: 0,
        withDesignation: 0,
      },
      growth: { newToday: 0, newThisWeek: 0, newThisMonth: 0 },
      streaks: { usersWithActiveStreak: 0, avgCurrentStreak: 0, longestStreakEver: 0 },
      topLearners: [],
    },
    content: {
      programs: { total: 0, published: 0, draft: 0 },
      certificationTracks: { total: 0, published: 0, draft: 0 },
      subjectTracks: { total: 0, published: 0, draft: 0 },
      subjects: { total: 0, published: 0, draft: 0 },
      topics: { total: 0, published: 0, draft: 0 },
      questions: {
        total: 0,
        byType: {
          trivia: { total: 0, active: 0, pending: 0 },
          general: { total: 0, active: 0, pending: 0 },
        },
        byLevel: { easy: 0, intermediate: 0, advanced: 0 },
      },
      lessons: { total: 0 },
      moderationQueue: {
        pendingQuestions: 0,
        unpublishedSubjects: 0,
        unpublishedTopics: 0,
        unpublishedSubjectTracks: 0,
        unpublishedCertificationTracks: 0,
      },
    },
    engagement: {
      quizzes: {
        total: 0,
        published: 0,
        draft: 0,
        byType: { userQuiz: 0, standard: 0 },
        playedQuizzes: 0,
        totalPlays: 0,
        avgPlaysPerQuiz: 0,
        avgScore: 0,
        topQuizzes: [],
      },
      questionAttempts: {
        total: 0,
        correct: 0,
        wrong: 0,
        skipped: 0,
        distinctUsers: 0,
        accuracyPercent: 0,
      },
      lessons: { totalViews: 0, totalPending: 0, totalCompleted: 0, completionRate: 0 },
    },
    achievements: {
      certificates: {
        totalIssued: 0,
        totalRevoked: 0,
        totalExpired: 0,
        uniqueHolders: 0,
        issuedThisWeek: 0,
        issuedThisMonth: 0,
        topCertificationTracks: [],
      },
      badges: {
        totalAvailable: 0,
        totalAwarded: 0,
        uniqueEarners: 0,
        byScope: { global: 0, subject: 0, jobRole: 0, topic: 0 },
        topBadges: [],
        rareBadges: [],
      },
    },
    recentActivity: [],
    trends: {
      daily: {
        users: [],
        questions: [],
        quizzes: [],
        attempts: [],
        certificates: [],
        badges: [],
      },
      weekly: {
        users: [],
        questions: [],
        quizzes: [],
        attempts: [],
        certificates: [],
        badges: [],
      },
    },
  };
}
