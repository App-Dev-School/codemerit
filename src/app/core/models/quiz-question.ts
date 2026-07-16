import { QuestionOption } from "./question";

export interface QuizQuestion {
  id?: number | string;
  title?: string;
  question:string;
  marks ?: number;
  timeAllowed ?: number;
  options: QuestionOption[];
  //remove below
  correctAnswer?: string;
  hint?: string;
  answer?: string;
  //local
  hasAnswered?: boolean;
  selectedOption?: number;
  selectedOptionTxt?: string;
  isSkipped?:boolean;
  hintUsed?: boolean;
  answerSeen?: boolean;
  // Actual seconds spent on this question (timeAllowed minus whatever was
  // left on the countdown when answered/timed out) — set by take-quiz's
  // startQuestionTimer/optionSelected, distinct from timeAllowed (the
  // per-question budget/config value).
  timeTaken?: number;
  topics? : {
  id?: number | string;
  title?: string;
  }[];
  topicsArr?:string[],
  level?: number;  
}