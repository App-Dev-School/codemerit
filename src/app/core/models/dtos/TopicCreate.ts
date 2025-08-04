export interface TopicCreate {
    id: number
    title: string
    subjectId: number
    parent: string
    order: number
    isPublished : boolean
    description: string
}
