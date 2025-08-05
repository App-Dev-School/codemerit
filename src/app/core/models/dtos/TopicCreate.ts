import { TopicItem } from "src/app/admin/topics/manage/topic-item.model"

export interface TopicCreate {
    id: number
    title: string
    subjectId: number
    parent: string
    order: number
    isPublished : boolean
    description: string
}
// export class TopicListItemDto {
//   id: number;
//   title: string;
//   description: string;
//   subjectId: number;
//   subjectName: string;
//   slug: string;
//   label: string;
//   votes?: number;
//   numQuestions?: number;
//   numQuizzes?: number;
//   isPublished: boolean;
// }
export interface TopicsListDto{
    error: boolean;
    message: string;
    result_code: number;
    data : TopicItem[];
}