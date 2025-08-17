import { QuestionType } from "./question-type"

export interface Question {
    id: number
    title: string
    question: string
    questionType: QuestionType
    choices: string[]
    correctAnswer: string
    hint: string
    hasAnswered: boolean
    isPublished : boolean
    tag: string
    createdAt : string
    created_by: number
}