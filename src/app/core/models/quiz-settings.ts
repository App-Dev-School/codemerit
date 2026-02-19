  export interface QuizSettings {
    quiz_id?: number
    numQuestions: number;
    ordering: string;
    mode: string;
    showHint: boolean;
    showAnswers: boolean;
    enableNavigation: boolean;
    enableAudio: boolean;
    enableTimer: boolean;
  }