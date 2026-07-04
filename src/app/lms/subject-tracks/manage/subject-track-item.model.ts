export class SubjectTrackItem {
  id?: number;
  subjectId: number;
  subjectName?: string;
  title: string;
  slug?: string;
  description?: string;
  sortOrder: number;
  isPublished: boolean;
  topicCount?: number;
  topics?: any[];

  constructor(item: Partial<SubjectTrackItem> = {}) {
    this.id = item.id;
    this.subjectId = item.subjectId ?? 0;
    this.subjectName = item.subjectName ?? '';
    this.title = item.title ?? '';
    this.slug = item.slug ?? '';
    this.description = item.description ?? '';
    this.sortOrder = item.sortOrder ?? 1;
    this.isPublished = item.isPublished ?? true;
    this.topicCount = item.topicCount ?? 0;
    this.topics = item.topics ?? [];
  }
}
