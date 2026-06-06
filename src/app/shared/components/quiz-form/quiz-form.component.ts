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
  @Output() formValidityChanged = new EventEmitter<boolean>();
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
  difficultyOptions = [
    { label: 'Easy', value: 1 },
    { label: 'Intermediate', value: 2 },
    { label: 'Advanced', value: 3 },
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
          Validators.maxLength(60),
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
      level: [1, [Validators.required]],
      category: ['Default', [Validators.required]],
      isPublished: [true],
      numQuestions: [
        this.quizItem.settings?.numQuestions ,
        [Validators.required, Validators.min(1), Validators.max(50)],
      ],
      ordering: [
        this.quizItem.settings?.ordering ,
        Validators.required,
      ],
      passMarks: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxAttempts: [1, [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit() {
    this.applyFormData();
    this.updatePublishValidators();

    this.quizForm.get('isPublished')?.valueChanges.subscribe(() => {
      this.updatePublishValidators();
      this.emitFormState();
    });

    this.emitFormState();

    this.quizForm.valueChanges.subscribe(() => {
      this.emitFormState();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    const formData = changes['formData']?.currentValue;

    if (!formData) {
      return;
    }

    if (!this.quizForm.dirty) {
      this.applyFormData();
      this.updatePublishValidators();
      this.emitFormState();
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
        level: formData.level ?? 1,
        category: formData.category ?? 'Default',
        isPublished: this.formData.isPublished ?? true,
        numQuestions: this.formData.settings?.numQuestions ?? formData.numQuestions ?? null,
        ordering: this.formData.settings?.ordering ?? formData.ordering ?? null,
        passMarks: this.formData.settings?.passMarks ?? formData.passMarks ?? 60,
        maxAttempts: this.formData.settings?.maxAttempts ?? formData.maxAttempts ?? 1,
      },
      { emitEvent: false },
    );
  }

  private updatePublishValidators(): void {
    const isPublished = !!this.quizForm.get('isPublished')?.value;
    const tagControl = this.quizForm.get('tag');
    const descriptionControl = this.quizForm.get('description');
    const numQuestionsControl = this.quizForm.get('numQuestions');
    const orderingControl = this.quizForm.get('ordering');
    const passMarksControl = this.quizForm.get('passMarks');
    const maxAttemptsControl = this.quizForm.get('maxAttempts');

    tagControl?.setValidators(isPublished ? [Validators.required] : []);
    descriptionControl?.setValidators(
      isPublished
        ? [Validators.required, Validators.minLength(10), Validators.maxLength(200)]
        : [Validators.minLength(10), Validators.maxLength(200)],
    );
    numQuestionsControl?.setValidators(
      isPublished
        ? [Validators.required, Validators.min(1), Validators.max(50)]
        : [Validators.min(1), Validators.max(50)],
    );
    orderingControl?.setValidators(isPublished ? [Validators.required] : []);
    passMarksControl?.setValidators(
      isPublished
        ? [Validators.required, Validators.min(0), Validators.max(100)]
        : [Validators.min(0), Validators.max(100)],
    );
    maxAttemptsControl?.setValidators(
      isPublished
        ? [Validators.required, Validators.min(1)]
        : [Validators.min(1)],
    );

    tagControl?.updateValueAndValidity({ emitEvent: false });
    descriptionControl?.updateValueAndValidity({ emitEvent: false });
    numQuestionsControl?.updateValueAndValidity({ emitEvent: false });
    orderingControl?.updateValueAndValidity({ emitEvent: false });
    passMarksControl?.updateValueAndValidity({ emitEvent: false });
    maxAttemptsControl?.updateValueAndValidity({ emitEvent: false });
  }

  private emitFormState(): void {
    this.formSubmitted.emit(this.quizForm.getRawValue());
    this.formValidityChanged.emit(this.quizForm.valid);
  }
}
