export interface Question {
    id: number
    title: string
    choices: string[]
    correctAnswer: string
    hint: string
    hasAnswered: boolean
  }