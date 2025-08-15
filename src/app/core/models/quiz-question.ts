export interface QuizQuestion {
  id: number | string;
  title: string;
  choices: string[];
  correctAnswer: string;
  hint?: string;
  hasAnswered?: boolean;
  selectedChoice?: string;
  usedHint?: boolean;
}