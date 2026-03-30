// ---------------------
// Generic Time Series Types
// ---------------------
export interface LmsDailySeriesItem {
  date: string;
  count: number;
}

export interface LmsWeeklySeriesItem {
  week: string;
  count: number;
}

export interface LmsDailyTimeSeries {
  questions: LmsDailySeriesItem[];
  quizzes: LmsDailySeriesItem[];
  attempts: LmsDailySeriesItem[];
}

export interface LmsWeeklyTimeSeries {
  questions: LmsWeeklySeriesItem[];
  quizzes: LmsWeeklySeriesItem[];
  attempts: LmsWeeklySeriesItem[];
}

export interface LmsTimeSeriesStats {
  daily: LmsDailyTimeSeries;
  weekly: LmsWeeklyTimeSeries;
}

// ---------------------
// Entity Metrics
// ---------------------
export interface LmsAttemptStats {
  total: number;
  totalCorrect: number;
  totalWrong: number;
  totalSkipped: number;
  distinctUsers: number;
}

export interface LmsQuestionStats {
  totalQuestions: number;
  totalApproved: number;
  totalPending: number;
  totalTrivia: number;
  totalGeneral: number;
}

export interface LmsTopicStats {
  total: number;
  totalActive: number;
  totalPending: number;
}

export interface LmsQuizStats {
  totalQuizCreated: number;
}

// ---------------------
// Combined Dashboard Data
// ---------------------
export interface LmsDashboardData {
  attempts: LmsAttemptStats;
  questions: LmsQuestionStats;
  topics: LmsTopicStats;
  quizzes: LmsQuizStats;
  timeSeries: LmsTimeSeriesStats;
}

export interface LmsDashboardResponse {
  error: boolean;
  result_code: number;
  message: string;
  data: LmsDashboardData;
}
