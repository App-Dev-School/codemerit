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
    this.createdAt = question.createdAt || '';
  }

  public getRandomID(): string {
    const S4 = () => {
      return ((1 + Math.random()) * 0x10000).toString(16);
    };
    return S4() + S4();
  }
}
