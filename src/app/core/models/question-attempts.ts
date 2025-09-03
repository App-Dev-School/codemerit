    export interface QuestionAttempt {
    //id:number
    userId: number
    questionId: number
    selectedOption: number
    isSkipped: boolean
    hintUsed: boolean
    isCorrect: boolean
    timeTaken?:number
    answer?: string
    createdAt: string
    updatedAt : string
  }