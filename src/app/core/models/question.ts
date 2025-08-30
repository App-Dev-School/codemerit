import { QuestionType } from "./question-type"

export interface Question {
    id: number
    title: string
    question: string
    questionType: QuestionType
    options: string[]
    correctAnswer: string
    hint: string
    hasAnswered: boolean
    isPublished : boolean
    tag: string
    createdAt : string
    created_by: number

    subject: string;
}

export interface QuestionOption {
    id: number
    option: string
    correct: boolean
}