import { MyCertificate } from './gamification.model';

export interface SubjectTrackTopic {
  id: number;
  title: string;
  slug: string;
  label: string;
  description?: string;
  goal?: string;
  subjectId?: number;
  subjectName?: string;
  numTrivia: number;
  numBasicTrivia?: number;
  numIntTrivia?: number;
  numAdvTrivia?: number;
  numLessons?: number;
  totalAttempts?: number;
  journeyAttempts?: number;
  attempted: number;
  correct: number;
  wrong: number;
  journeyCorrect?: number;
  journeyWrong?: number;
  // "journey" fields are the structured learning-path score/accuracy — distinct
  // from score/accuracy below, which reflect ad hoc quiz attempts.
  journeyAccuracy?: number;
  journeyScore?: number;
  attemptedEasy?: number;
  attemptedMedium?: number;
  attemptedHard?: number;
  correctEasy?: number;
  correctMedium?: number;
  correctHard?: number;
  wrongEasy?: number;
  wrongMedium?: number;
  wrongHard?: number;
  userLevel?: string | null;
  currentAccuracy?: number;
  accuracy: number;
  coverage: number;
  correctCoverage?: number;
  score: number;
  isStarted: boolean;
  isCompleted: boolean;
  meritList?: any[] | null;
}

export interface SubjectTrack {
  id: number;
  title: string;
  slug: string;
  description: string;
  sortOrder: number;
  subjectId: number;
  subjectName: string;
  totalTopics: number;
  numTrivia: number;
  attempted: number;
  correct: number;
  wrong: number;
  coverage: number;
  accuracy: number;
  score: number;
  isStarted: boolean;
  completedTopics: number;
  progressPercent: number;
  isCompleted: boolean;
  userLevel: string | null;
  meritList: any[];
  userRank: number | null;
  topics: SubjectTrackTopic[];
}

export interface CertTrackSubjectSummary {
  id: number;
  title: string;
  slug: string;
  totalTopics: number;
  progressPercent: number;
  score: number;
  isCompleted: boolean;
}

export interface CertificationTrackJobRole {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  color: string | null;
}

export interface CertificationTrack {
  id: number;
  title: string;
  description: string;
  sortOrder: number;
  jobRole: CertificationTrackJobRole;
  totalSubjectTracks: number;
  subjectTracks: CertTrackSubjectSummary[];
  myCertificate: MyCertificate | null;
}

// Intentionally loose ([key: string]: any) — the many legacy fields already
// consumed by SubjectPerformanceCardComponent, TopicsListComponent, GoalPathComponent,
// SkillRatingWidgetComponent, etc. stay untyped. Only the new grouped arrays are typed.
export interface SubjectDashboard {
  subjectTracks?: SubjectTrack[];
  certificationTracks?: CertificationTrack[];
  syllabus?: any[];
  [key: string]: any;
}
