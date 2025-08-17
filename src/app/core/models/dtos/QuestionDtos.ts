import { QuestionItem } from "src/app/admin/questions/manage/question-item.model"

export interface QuestionCreate {
    id: number
    title: string
    question: string
    subjectId: number
    questionType: string
    level: string
    status : string
}
export interface QueestionListDto{
    error: boolean;
    message: string;
    result_code: number;
    data : QuestionItem[];
}