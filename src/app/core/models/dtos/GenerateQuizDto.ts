import { QuestionItem } from "src/app/admin/questions/manage/question-item.model"
import { QuizTypeEnum } from "../enums/quiz-type.enum"
import { QuizResult } from "../quiz";
import { QuizQuestion } from "../quiz-question";

export interface QuizCreateDto {
    id?: number;
    title?: string;
    shortDesc?: string;
    userId: number;
    description?: string;
    subjectIds?: string;
    jobIds?: string;
    topicIds?: string;
    quizType: QuizTypeEnum;
}

export class QuizCreateModel implements QuizCreateDto{
    id: number;
    title: string;
    shortDesc: string;
    userId: number;
    description: string;
    subjectIds?: string;
    jobIds?: string;
    topicIds?: string;
    quizType: QuizTypeEnum;

    constructor(quiz: Partial<QuizCreateModel> = {}) {
    this.id = quiz.id || Number.parseInt(this.getRandomID());
    this.quizType = QuizTypeEnum.UserQuiz;
    this.title = quiz.title || '';
    this.shortDesc = quiz.shortDesc || '';
  }

  public getRandomID(): string {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000).toString(16);
    };
    return S4() + S4();
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