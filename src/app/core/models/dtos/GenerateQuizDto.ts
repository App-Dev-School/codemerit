import { QuizOrderEnum } from "../enums/quiz-order.enum";
import { QuizTypeEnum } from "../enums/quiz-type.enum";
import { QuizResult } from "../quiz";
import { QuizQuestion } from "../quiz-question";
import { QuizSettings } from "../quiz-settings";

export interface QuizCreateDto {
    id?: number;
    title?: string;
    shortDesc?: string;
    userId?: number;
    description?: string;
    subjectIds?: string;
    jobIds?: string;
    topicIds?: string;
    tag?: string;
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
    tag?: string;
    quizType: QuizTypeEnum;
    questionIds?: number[];
    isPublished: boolean;
    //numQuestions?: number;
    ordering?: string = QuizOrderEnum.Default;
    settings?: QuizSettings; // Extend with specific settings properties as needed

    //Creating Temporary Values to save time during dev
    constructor(quiz: Partial<QuizCreateModel> = {}) {
    this.id = quiz.id || Number.parseInt(this.getRandomID());
    this.quizType = QuizTypeEnum.UserQuiz;
    this.title = quiz.title || 'Test Your Angular Skills!';
    this.shortDesc = quiz.shortDesc || 'How good you are at Angular? Take this quiz to find out!';
    this.description = quiz.description || 'This quiz covers various aspects of Angular, including components, services, directives, and more. It is designed to test your knowledge and understanding of Angular concepts and best practices.';
    this.subjectIds = quiz.subjectIds || '1,2';
    //this.jobIds = quiz.jobIds || '1';
    //this.topicIds = quiz.topicIds || '1,2,3';
    this.tag = quiz.tag || 'angular,frontend,webdev';
    this.userId = quiz.userId || 1; // Default to user ID 1 for testing
    this.isPublished = quiz.isPublished !== undefined ? quiz.isPublished : true;
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