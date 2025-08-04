import { formatDate } from '@angular/common';

export class TopicItem {
  id?: number;
  img?: string;
  name: string;
  shortDesc?: string;
  subjectId: number;
  subjectName?: string;
  slug?: string;
  label?: string;
  parent: number;
  description?: string;
  numQuestions?: number;
  numTrivia?: number;
  votes?: number;
  //weight: number;
  //goal : string;
  popularity?: number;

  constructor(topic: Partial<TopicItem> = {}) {
    this.id = topic.id || Number.parseInt(this.getRandomID());
    this.img = topic.img || 'assets/images/icons/ic_correct.png';
    this.name = topic.name || '';
    this.shortDesc = topic.shortDesc || '';
    this.subjectId = topic.subjectId || 0;
    this.subjectName = topic.subjectName || '';
    this.slug = topic.slug || '';
    this.description = topic.description || '';

    this.numQuestions = topic.numQuestions || 0;
    this.numTrivia = topic.numTrivia || 0;
    this.votes = topic.votes || 0;
    this.popularity = topic.popularity || 0;
  }

  public getRandomID(): string {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000).toString(16);
    };
    return S4() + S4();
  }
}
