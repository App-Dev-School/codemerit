export interface SubjectTrackTopic {
  id: number;
  title: string;
  slug: string;
  label: string;
  numTrivia: number;
  attempted: number;
  correct: number;
  wrong: number;
  accuracy: number;
  coverage: number;
  score: number;
  isStarted: boolean;
  isCompleted: boolean;
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
  myCertificate: any | null;
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
