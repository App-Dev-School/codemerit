import { LevelInfo, ScopedBadgeEntry, StreakInfo } from './gamification.model';

export interface UserProfileBio {
  id?: number;
  linkedinUrl?: string | null;
  about?: string | null;
  googleId?: string | null;
  linkedinId?: string | null;
  auth_provider?: string;
  selfRatingDone?: boolean;
  takenInterview?: boolean;
  level1Assessment?: boolean;
  level2Assessment?: boolean;
  playedQuiz?: boolean;
}

export interface UserPermissionGrant {
  id: number;
  permissionName: string;
  resourceType: string;
  resourceName: string;
  grantedAt: string;
  isVisible: boolean;
}

// Same field set already relied on by SubjectPerformanceCardComponent
// (title/score/coverage/color/image/isSubscribed/attempted/description), plus
// the current*/journey* pairs from the subjectDashboard contract. Loosely
// typed on purpose — mirrors this codebase's existing SubjectDashboard
// convention rather than over-specifying fields that may still shift.
export interface ProfileCourseStat {
  id: number;
  title: string;
  description?: string;
  image?: string | null;
  slug: string;
  color?: string | null;
  isSubscribed: boolean;
  numQuestions?: number;
  numTrivia?: number;
  attempted: number;
  correct?: number;
  wrong?: number;
  currentAccuracy?: number;
  coverage: number;
  score: number;
  journeyAttempts?: number;
  journeyAccuracy?: number;
  journeyScore?: number;
  [key: string]: any;
}

export interface ProfileQuizAttempt {
  id: number;
  resultCode: string;
  quiz: {
    id: number;
    title: string;
    slug: string;
    quizType: string;
    level: string;
  };
  score: number;
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  timeSpent: number;
  status: string;
  createdAt: string;
}

export interface ProfileQuizSummary {
  totalTaken: number;
  avgScore: number;
  totalCorrect: number;
  totalWrong: number;
}

export interface ProfileQuizzes {
  recent: ProfileQuizAttempt[];
  summary: ProfileQuizSummary;
}

// self_assessments / external_assessments — sessions[] is always empty in
// every response captured so far, so its populated item shape is unconfirmed.
// Keep it loose until a real example is available rather than guessing.
export interface ProfileAssessmentBlock {
  sessions: any[];
  summary: {
    totalSessions: number;
    avgRating: number;
  };
}

export interface ProfileActivity {
  id: number;
  title: string;
  message: string;
  dataId: number | null;
  dataType: string | null;
  createdAt: string;
}

export interface ProfileGamification {
  points: number;
  level: LevelInfo;
  streak: StreakInfo;
}

export interface ProfileBadge {
  code: string;
  name: string;
  description: string;
  iconUrl: string;
  points: number;
  earnedAt: string;
}

export interface ProfileCertificate {
  certificateNumber: string;
  status: string;
  issuedAt: string;
  pdfUrl: string | null;
  [key: string]: any;
}

export interface UserProfileResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  designation: string | null;
  city: string | null;
  country: string | null;
  mobile: string | null;
  image: string | null;
  level: string | null;
  points: number;
  accountStatus: string;
  createdAt: string;
  profile: UserProfileBio;
  permissions: UserPermissionGrant[];
  courseStats: ProfileCourseStat[];
  quizzes: ProfileQuizzes;
  self_assessments: ProfileAssessmentBlock;
  external_assessments: ProfileAssessmentBlock;
  certificates: ProfileCertificate[];
  // Earned-only, every scope mixed together (subject/topic/jobrole/global badges this user has
  // earned) — for the profile-owner's Badge & Certificates tab, use `master.fetchMyBadges()` instead
  // (full earned+locked collection). `globalBadges` below is additive, not a replacement of this.
  badges: ProfileBadge[];
  // The 7 original platform-wide (Global-scope) badges, unlock-tagged and sortOrder-ordered —
  // these never appear in subjectDashboard/programDetails' embedded `badges` (wrong scope
  // entirely), so this is their one home. A lighter widget than the full badge grid.
  globalBadges: ScopedBadgeEntry[];
  activities: ProfileActivity[];
  gamification: ProfileGamification;
  // api_usage intentionally omitted — internal/diagnostic, not rendered.
  [key: string]: any;
}
