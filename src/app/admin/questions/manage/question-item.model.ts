import { QuestionType } from '@core/models/question-type';
import { Status } from '@core/models/status.enum';

export class QuestionItem {
  id?: number;
  question: string;
  questionType: QuestionType;
  subjectId : number;
  subjectName : string;
  level : string;
  status: string;
  marks : number;
  order : number;
  timeAllowed : number;
  hint: string;
  answer: string;
  slug: string;
  topicIds: number[];
  createdAt : string;

  constructor(question: Partial<QuestionItem> = {}) {
    this.id = question.id || Number.parseInt(this.getRandomID());
    this.question = question.question || '';
    this.questionType = question.questionType || QuestionType.General;
    this.subjectId = question.subjectId || 0;
    this.subjectName = question.subjectName || '';
    this.level = question.level || 'Easy';
    this.status = question.status || Status.Pending;
    this.marks = question.marks || 1;
    this.order = question.order || 1;
    this.timeAllowed = question.timeAllowed || 60;
    this.hint = question.hint || '';
    this.answer = question.answer || '';
    this.slug = question.slug || '';
    this.createdAt = question.createdAt || '';
    this.topicIds = question.topicIds || [];
  }

  public getRandomID(): string {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000).toString(16);
    };
    return S4() + S4();
  }
}

export class QuestionItemDetail extends QuestionItem {
  options?: {id:number;option:string;correct:boolean}[];
  //topics: string;
}
