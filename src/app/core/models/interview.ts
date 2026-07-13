import { SkillRating } from './skill-rating';

export enum InterviewStatus {
  Completed = 'COMPLETED',
  Declined = 'DECLINED',
  NoShow = 'NO_SHOW',
}

export interface InterviewSubmitPayload {
  interviewId: number;
  status: InterviewStatus;
  feedback: string;
  declineReason?: string;
  // Includes SkillType.Subject/Topic/JobRole/Question ratings as well as the
  // fixed SkillType.Metric ratings (fundamentals, coding, problem solving, communication).
  skillRatings: SkillRating[];
  milestone?: string;
  tags?: string[];
  startTime?: string;
  endTime?: string;
  durationSeconds?: number;
  ipAddress?: string;
  browser?: string;
  source?: string;
}

// Everything the interview board captures locally — the container fills in
// interviewId + request metadata (browser/source/ipAddress) before posting.
export type InterviewSubmissionEvent = Omit<InterviewSubmitPayload, 'interviewId' | 'browser' | 'source' | 'ipAddress'>;

export interface InterviewSubmitResponse {
  error?: boolean;
  message?: string;
  data?: any;
}
