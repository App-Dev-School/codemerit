import { TextFieldModule } from '@angular/cdk/text-field';
import { NgTemplateOutlet } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { QuizCreateModel } from '@core/models/dtos/GenerateQuizDto';
import { QuizTypeEnum } from '@core/models/enums/quiz-type.enum';
import { Subject } from '@core/models/subject';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { TopicItem } from 'src/app/admin/topics/manage/topic-item.model';
import { QuizService } from 'src/app/quiz/quiz.service';

@Component({
  selector: 'app-quiz-form',
  templateUrl: './quiz-form.component.html',
  styleUrls: ['./quiz-form.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    NgTemplateOutlet,
    NgScrollbar,
    TextFieldModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatChip
  ]
})
export class QuizFormPage implements OnInit {
  questionSlug: string;
  action: string;
  actionText: string;
  dialogTitle: string;
  loading: boolean;
  submitted: boolean;
  quizForm: UntypedFormGroup;
  initialFormValue: any;
  quizItem: QuizCreateModel;
  subjects: Subject[] = [];
  topics: TopicItem[] = [];
  orderingOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'Random', value: 'Random' }
  ];

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private masterSrv: MasterService,
    private fb: UntypedFormBuilder,
    private snackService: SnackbarService,
    @Optional() public dialogRef?: MatDialogRef<CoursePickerComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any
  ) {
    this.quizItem = new QuizCreateModel();
    this.quizForm = this.createQuizForm();
    this.subjects = this.masterSrv.subjects;
    this.topics = this.masterSrv.topics;
  }

  createQuizForm(): UntypedFormGroup {
    return this.fb.group({
      id: ['' + this.quizItem?.id],
      title: [this.quizItem.title, [Validators.required, Validators.minLength(10), Validators.maxLength(50)]],
      quizType: [QuizTypeEnum.Standrad, [Validators.required]],
      subjectIds: [this.quizItem.subjectIds],
      topicIds: [[]],
      tag: [this.quizItem.tag, [Validators.required]],
      description: [this.quizItem.description, [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      shortDesc: [this.quizItem.shortDesc, [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      label: [''],
      isPublished: [true],
      numQuestions: [this.quizItem.numQuestions || 10, [Validators.required, Validators.min(1), Validators.max(50)]],
      ordering: [this.quizItem.ordering || 'Default', Validators.required],
    });
  }

  ngOnInit() {
    //this.questionSlug = this.route.snapshot.paramMap.get('question-slug');
    this.quizForm.get('subjectIds')?.valueChanges.subscribe(subject => {
      console.log("Subject Selected ", subject);
      this.topics = this.masterSrv.topics;
      if (subject > 0) {
        this.topics = this.topics.filter(topic => topic.subjectId == subject);
      }
    });
  }

  getTopicTitleById(id: number): string {
    if (this.topics.length > 0) {
      const topic = this.topics.find(t => t.id === id);
      return topic ? topic.title : '';
    }
    return '';
  }

  onCancel() {
    this.quizForm.reset();
    if (this.data && this.data.questionItem) {
      this.dialogRef.close(null);
    }
  }

  submit() {
    if (this.quizForm.valid) {
      return;
    }
    console.log(this.quizForm.value);
  }

  restrictInput(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) return;
    if (!/^\d$/.test(key) || input.value.length >= 2) {
      event.preventDefault();
    }
  }

}
