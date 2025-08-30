import { QuestionOption } from "./question";

export interface QuizQuestion {
  id?: number | string;
  title?: string;
  question:string;
  options: QuestionOption[];
  //remove below
  correctAnswer?: string;
  hint?: string;
  //local
  hasAnswered?: boolean;
  selectedChoice?: string;
  usedHint?: boolean;
}