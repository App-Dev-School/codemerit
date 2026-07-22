import { QuizOrderEnum } from '../enums/quiz-order.enum';
import { QuizTypeEnum } from '../enums/quiz-type.enum';
import { QuizResult } from '../quiz';
import { QuizQuestion } from '../quiz-question';
import { QuizSettings } from '../quiz-settings';

export interface QuizCreateDto {
  id?: number;
  title?: string;
  shortDesc?: string;
  userId?: number;
  description?: string;
  subjectIds?: string | string[] | null;
  jobIds?: string;
  topicIds?: string | string[] | null;
  // Comma-separated SubjectTrack ids — backend resolves each track to its
  // member topics itself. Combines (union) with subjectIds/topicIds if any
  // of those are also sent, same as subjectIds+topicIds combine with each other.
  subjectTrackIds?: string | string[] | null;
  tag?: string;
  category?: string;
  level?: number;
  quizType: QuizTypeEnum;
}

export class QuizCreateModel implements QuizCreateDto {
  id: number;
  title: string;
  shortDesc: string;
  userId: number;
  description: string;
  subjectIds?: string | string[] | null;
  jobIds?: string;
  topicIds?: string | string[] | null;
  subjectTrackIds?: string | string[] | null;
  tag?: string;
  category?: string;
  level?: number;
  quizType: QuizTypeEnum;
  questionIds?: number[];
  isPublished: boolean;
  //numQuestions?: number;
  ordering?: string = QuizOrderEnum.Default;
  settings?: QuizSettings; // Extend with specific settings properties as needed

  constructor(quiz: Partial<QuizCreateModel> = {}) {
    //this.id = quiz.id ?? 0;
    this.quizType = quiz.quizType ?? QuizTypeEnum.UserQuiz;
    this.title = quiz.title ?? '';
    this.shortDesc = quiz.shortDesc ?? '';
    this.description = quiz.description ?? '';
    this.subjectIds = quiz.subjectIds ?? null;
    this.topicIds = quiz.topicIds ?? null;
    this.subjectTrackIds = quiz.subjectTrackIds ?? null;
    this.tag = quiz.tag ?? '';
    this.category = quiz.category ?? 'Default';
    this.level = quiz.level ?? 1;
    this.userId = quiz.userId ?? 0;
    this.isPublished = quiz.isPublished ?? false;
  }
}

// Root Response
export interface CreateQuizResponse {
  error: boolean;
  result_code: number;
  message: string;
  data: QuizEntity;
}
export interface SubmitQuizResponse {
  error: boolean;
  result_code: number;
  message: string;
  data: QuizResult;
}

// Main Quiz Entity
export interface QuizEntity {
  id: number;
  title: string;
  tag: string;
  quizType: 'UserQuiz' | 'Standard'; // Extend if more types exist
  slug: string;
  image: string | null;
  shortDesc: string | null;
  description: string | null;
  goal: string | null;
  category: string;
  level: number;
  createdBy: number | null;
  updatedBy: number | null;
  label: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  //questions: QuestionEntity[];
  questions: QuizQuestion[];
}

// Question Entity
// export interface QuestionEntity {
//   id: number;
//   title: string;
//   question: string;
//   subjectId: number;
//   questionType: 'Trivia' | 'General'; // Extend if needed
//   level: 'Easy' | 'Medium' | 'Hard'; // Based on your Difficult
// }
