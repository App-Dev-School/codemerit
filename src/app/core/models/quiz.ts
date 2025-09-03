import { AnswerType } from "./answer-type"
import { Question } from "./question"
import { QuestionAttempt } from "./question-attempts"
import { QuestionType } from "./question-type"
import { QuizQuestion } from "./quiz-question"
import { QuizSettings } from "./quiz-settings"

//proposed structure. Not in use.
export interface Quiz {
    //id:number
    title: string
    description?: string
    subject?: string
    subject_icon?: string
    //by default take all topics in the subject - heavy
    //Also allow user to pick at time of creation
    //refresh topics list after the quiz is generated for better skill filtering
    topics?: string
    class?: string
    QuizType: QuestionType
    questions: QuizQuestion[]
    settings? : QuizSettings
    status: string // Pending, Published, Paused
  }

  export interface QuizResult {
    //id:number
    resultCode?: string
    userId: string
    userFullName : string;
    quizId: string
    quizName : string
    total: number
    correct: number
    wrong: number
    unanswered: number
    timeSpent: number
    score: number
    //by default take all topics in the subject - heavy
    //Also allow user to pick at time of creation
    //refresh topics list after the quiz is generated for better skill filtering
    remarks?: string
    dateAttempted?: string
    //attempts?: QuestionAttempt[]
    attempts?: any[]
  }

//Do - Inherit well
  export interface InterviewQuestionAttempts extends QuestionAttempt {
    //id:number
    user_id: number
    question_id: number
    //support text based and audio/video files
    answer: string
    answerType: AnswerType
    marks: number
    full_marks: string
    question_understood: boolean
    user_rating: number
    used_hint: boolean
    remarks?: string
  }