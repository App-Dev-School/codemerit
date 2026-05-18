import { TextFieldModule } from '@angular/cdk/text-field';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { QuizCreateModel } from '@core/models/dtos/GenerateQuizDto';
import { QuizTypeEnum } from '@core/models/enums/quiz-type.enum';
import { SnackbarService } from '@core/service/snackbar.service';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { NgScrollbar } from 'ngx-scrollbar';
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
    NgScrollbar,
    TextFieldModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
  ],
})
export class QuizFormComponent implements OnInit, OnChanges {
  @Input() formData: Partial<QuizCreateModel> | null = null;
  @Output() formSubmitted = new EventEmitter<any>();
  questionSlug: string;
  action: string;
  actionText: string;
  dialogTitle: string;
  loading: boolean;
  submitted: boolean;
  quizForm: UntypedFormGroup;
  initialFormValue: any;
  quizItem: QuizCreateModel;
  orderingOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'Random', value: 'Random' },
  ];

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private fb: UntypedFormBuilder,
    private snackService: SnackbarService,
    @Optional() public dialogRef?: MatDialogRef<CoursePickerComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any,
  ) {
    this.quizItem = new QuizCreateModel();
    this.quizForm = this.createQuizForm();
  }

  createQuizForm(): UntypedFormGroup {
    return this.fb.group({
      id: ['' + this.quizItem?.id],
      title: [
        this.quizItem.title,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(50),
        ],
      ],
      quizType: [QuizTypeEnum.Standard, [Validators.required]],
      tag: [this.quizItem.tag, [Validators.required]],
      description: [
        this.quizItem.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(200),
        ],
      ],
      shortDesc: [
        this.quizItem.shortDesc,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(100),
        ],
      ],
      label: [''],
      isPublished: [true],
      numQuestions: [
        this.quizItem.settings?.numQuestions ,
        [Validators.required, Validators.min(1), Validators.max(50)],
      ],
      ordering: [
        this.quizItem.settings?.ordering ,
        Validators.required,
      ],
    });
  }

  ngOnInit() {
    this.applyFormData();

    this.formSubmitted.emit(this.quizForm.getRawValue());

  this.quizForm.valueChanges.subscribe((value) => {
    this.formSubmitted.emit(value);
  });

   
  }

  ngOnChanges(changes: SimpleChanges): void {
    
     const formData = changes['formData']?.currentValue;

  if (!formData) {
    return;
  }

  if (!this.quizForm.dirty) {
    this.applyFormData();
  }
  }

  onCancel() {
    this.quizForm.reset();
    if (this.data && this.data.questionItem) {
      this.dialogRef.close(null);
    }
  }

  // Removed submit button logic; parent handles navigation and actions

  restrictInput(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) return;
    if (!/^\d$/.test(key) || input.value.length >= 2) {
      event.preventDefault();
    }
  }

  private applyFormData(): void {
    if (!this.formData) {
      return;
    }

    const formData = this.formData as any;

    this.quizForm.patchValue(
      {
        id: this.formData.id ?? '',
        title: this.formData.title ?? '',
        quizType: this.formData.quizType ?? QuizTypeEnum.Standard,
        tag: this.formData.tag ?? '',
        description: this.formData.description ?? '',
        shortDesc: this.formData.shortDesc ?? '',
        label: formData.label ?? '',
        isPublished: this.formData.isPublished ?? true,
        numQuestions: this.formData.settings?.numQuestions ?? formData.numQuestions ?? null,
        ordering: this.formData.settings?.ordering ?? formData.ordering ?? null,
      },
      { emitEvent: false },
    );
  }
}
