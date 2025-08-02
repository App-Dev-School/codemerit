import { QuestionType } from "./question-type"

export interface Question {
    id: number
    title: string
    //actual question. Should support html or wysiwug
    question: string
    questionType: QuestionType
    choices: string[]
    correctAnswer: string
    hint: string
    hasAnswered: boolean
    isPublished : boolean
    tag: string
    created_at : string
    created_by: number
}