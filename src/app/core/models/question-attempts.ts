    export interface QuestionAttempt {
    //id:number
    user_id: number
    question_id: number
    selected_option: number
    is_skipped: boolean
    is_correct: boolean
    score: number
    //frontend
    answer?: string
    createdAt: string
    updated_at : string
  }