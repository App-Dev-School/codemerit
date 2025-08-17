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
export interface TopicsListDto{
    error: boolean;
    message: string;
    result_code: number;
    data : TopicItem[];
}