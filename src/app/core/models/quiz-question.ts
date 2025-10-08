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
  timeTaken?: number;
  topics? : {
  id?: number | string;
  title?: string;
  }[];
  topicsArr?:string[]

  level?: number;  
  timeAllowed: number;
}