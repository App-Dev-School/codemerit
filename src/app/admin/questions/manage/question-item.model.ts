import { SafeHtml } from '@angular/platform-browser';
import { QuestionType } from '@core/models/question-type';
import { Status } from '@core/models/status.enum';

export class QuestionItem {
  id?: number;
  title?: string;
  question: string;
  questionType: QuestionType;
  subjectId : number;
  subjectName : string;
  level : string;
  status: string;
  marks : number;
  orderId : number;
  timeAllowed : number;
  hint?: string;
  answer?: string;
  slug: string;
  topicIds: number[];
  createdAt : string;

  constructor(question: Partial<QuestionItem> = {}) {
    this.id = question.id || 0;
    this.question = question.question || '';
    this.questionType = question.questionType || QuestionType.General;
    this.subjectId = question.subjectId || 0;
    this.subjectName = question.subjectName || '';
    this.level = question.level || 'Easy';
    this.status = question.status || Status.Pending;
    this.marks = question.marks || 1;
    this.orderId = question.orderId || 1;
    this.timeAllowed = question.timeAllowed || 60;
    this.hint = question.hint || '';
    this.answer = question.answer || '';
    this.slug = question.slug || '';
    this.createdAt = question.createdAt || '';
    this.topicIds = question.topicIds || [];
  }
}

export class QuestionItemDetail extends QuestionItem {
  options?: {id:number;option:string;correct:boolean}[];
  topics: {id:number;title:string}[];
  rawQuestion?:SafeHtml;
  //Auth details
  hasAnswered?: boolean;
  usedHint?: boolean;
  selectedChoice?: number;
}
