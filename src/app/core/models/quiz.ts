import { Question } from "./question"

export interface Quiz {
    title: string
    description: string
    subject: string
    subject_icon: string
    topics: string
    class: string
    questions: Question[]
  }