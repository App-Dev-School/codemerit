import { formatDate } from '@angular/common';
import { TopicItemBasic } from '@core/models/dtos/TopicDtos';
export class TopicItem implements TopicItemBasic {
  id?: number;
  image?: string;
  title: string;
  subjectId: number;
  subjectName?: string;
  shortDesc?: string;
  order?: number;
  slug?: string;
  label?: string;
  parent: number;
  description?: string;
  numQuestions?: number;
  numTrivia?: number;
  votes?: number;
  weight: number;
  goal ?: string;
  popularity?: number;
  numQuizzes?: number;
  isPublished: boolean;

  //user attempt related fields
  isStarted ?:boolean;
  isCompleted ?:boolean;
  score?: number;
  accuracy?: number;
  coverage?: number;
  correct?:number;
  wrong?:number;

  constructor(topic: Partial<TopicItem> = {}) {
    this.id = topic.id || Number.parseInt(this.getRandomID());
    this.image = topic.image || 'assets/images/icons/ic_correct.png';
    this.title = topic.title || '';
    this.shortDesc = topic.shortDesc || '';
    this.subjectId = topic.subjectId || 0;
    this.subjectName = topic.subjectName || '';
    this.slug = topic.slug || '';
    this.description = topic.description || '';
    this.order = topic.order || 0;
    this.numQuestions = topic.numQuestions || 0;
    this.numTrivia = topic.numTrivia || 0;
    this.votes = topic.votes || 0;
    this.weight = topic.weight || 1;
    this.popularity = topic.popularity || 1;
  }

  public getRandomID(): string {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000).toString(16);
    };
    return S4() + S4();
  }
}
