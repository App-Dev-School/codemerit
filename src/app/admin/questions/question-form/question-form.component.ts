import { JsonPipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from '@core/models/subject';
import { MasterService } from '@core/service/master.service';
import { QuestionService } from '../manage/questions.service';
import { QuestionItem, QuestionItemDetail } from '../manage/question-item.model';
import { ActivatedRoute, Router } from '@angular/router';
import { M } from "../../../../../node_modules/@angular/material/line.d-C-QdueRc";
import { Status } from '@core/models/status.enum';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TopicItem } from '../../topics/manage/topic-item.model';
import { QuizQuestionComponent } from '@shared/components/quiz-question/quiz-question.component';

@Component({
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: ['./question-form.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ReactiveFormsModule,
    TextFieldModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatChip
  ]
})
export class QuestionFormPage implements OnInit {
  questionSlug: string;
  action: string;
  actionText: string;
  dialogTitle: string;
  loading: boolean;
  submitted: boolean;
  topicImage = 'assets/images/icons/topic.png';
  questionForm: UntypedFormGroup;
  initialFormValue: any;
  questionItem: QuestionItem;
  subjects: Subject[] = [];
  topics: TopicItem[] = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private masterSrv: MasterService,
    private fb: UntypedFormBuilder
  ) {
    this.questionItem = new QuestionItem();
    this.questionForm = this.createQuestionForm();
    this.subjects = this.masterSrv.subjects;
    this.topics = this.masterSrv.topics;
  }

  createQuestionForm(): UntypedFormGroup {
    return this.fb.group({
      id: [''+this.questionItem?.id],
      question: [this.questionItem.question, [Validators.required, Validators.minLength(3)]],
      subjectId: ['' + this.questionItem.subjectId, [Validators.required]],
      level: [this.questionItem.level, [Validators.required]],
      marks: ['' + this.questionItem.marks],
      order: ['' + this.questionItem.order],
      timeAllowed: ['' + this.questionItem.timeAllowed, [Validators.required]],
      status: [this.questionItem.status],
      questionType: [this.questionItem.questionType, [Validators.required]],
      topicIds: [[], [Validators.required]],
      hint: [this.questionItem.hint],
      answer: [this.questionItem.answer],
      hideOtherFields: [true]
    });

  }

  ngOnInit() {
    this.questionSlug = this.route.snapshot.paramMap.get('question-slug');
    if (this.questionSlug) {
      this.action = 'edit';
      this.actionText = 'Updating Question';
      this.dialogTitle = 'Update Question';
      this.loadQuestion(this.questionSlug);
    } else {
      this.action = 'create';
      this.actionText = 'Creating Question';
      this.dialogTitle = 'Create New Question';
    }

    this.questionForm.get('subjectId')?.valueChanges.subscribe(subject => {
      this.topics = this.masterSrv.topics;
      if (subject > 0) {
        this.topics = this.topics.filter(topic => topic.subjectId == subject);
      }
    });
    this.questionForm.get('questionType')?.valueChanges.subscribe(type => {
      if (type === 'Trivia') {
        this.questionForm.addControl('options', this.fb.array([
          this.createOption(),
          this.createOption()
        ]));

        this.questionForm.get('options').setValidators(this.atLeastOneCorrectOption());
        // if (this.options.length < 2) {
        //   this.options.clear();
        //   this.addOption();
        //   this.addOption();
        // }
      } else {
        this.questionForm.addControl('options', this.fb.array([]));
        this.options.clear();
      }
    });
  }

  get options(): FormArray {
    return this.questionForm.get('options') as FormArray;
  }

  createOption(): UntypedFormGroup {
    return this.fb.group({
      id: [null],
      option: ['', Validators.required],
      correct: [false] // Optional if needed
    });
  }

  addOption() {
    this.options.push(this.createOption());
  }

  removeOption(index: number) {
    if (this.options.length > 2) {
      this.options.removeAt(index);
    }
  }

  atLeastOneCorrectOption(): ValidatorFn {
    return (formArray: AbstractControl): { [key: string]: any } | null => {
      const options = formArray.value as Array<{ option: string, correct: boolean }>;
      const hasAtLeastOneCorrect = options?.some(opt => opt.correct);
      return hasAtLeastOneCorrect ? null : { noCorrectOption: true };
    };
  }

  getTopicTitleById(id: number): string {
    const topic = this.topics.find(t => t.id === id);
    return topic ? topic.title : '';
  }

  submit() {
    if (this.questionForm.valid) {
      this.submitted = true;
      const formData = this.questionForm.getRawValue();
      if (this.action === 'edit') {
        const changedFields: any = {};
        // Compare each field
        console.log('QuestionManager FIELDS#:', formData);
        for (const key in formData) {
          if (formData.hasOwnProperty(key)) {
            console.log('QuestionManager FIELDS#1:', key, formData[key]);
            if (formData[key] !== this.initialFormValue[key]) {
              changedFields[key] = formData[key];
              //console.log('QuestionManager FIELDS#1:');
            }
          }
        }
        changedFields['questionType'] = formData.questionType;
        changedFields['source'] = 'app';
        console.log('QuestionManager Changed fields:', changedFields);
        this.questionService
          .updateQuestion(changedFields, formData.id)
          .subscribe({
            next: (response) => {
              console.log('QuestionManager UpdateAPI response:', response);
              this.submitted = false;
              this.navigateToQuestionList();
            },
            error: (error) => {
              this.submitted = false;
              console.error('QuestionManager ###Update Error:', error);
              // Optionally display an error message to the user
            },
          });
      } else {
        // Add new question
        const payload = {
          question: formData.question,
          subjectId: Number.parseInt(formData.subjectId),
          questionType: formData.questionType,
          title: "",
          level: formData.level,
          //status: formData.status,
          status: Status.Active,
          order: formData.order,
          marks: formData.marks,
          timeAllowed: formData.timeAllowed,
          topicIds: formData.topicIds,
          hint: formData.hint,
          answer: formData.answer
        }
        if (formData.questionType === 'Trivia') {
          payload['options'] = formData.options;
        }
        this.questionService
          .addQuestion(payload)
          .subscribe({
            next: (response) => {
              console.log('QuestionManager CreateAPI response:', response);
              this.submitted = false;
              this.navigateToQuestionList();
            },
            error: (error) => {
              this.submitted = false;
              console.error('QuestionManager CreateAPI Error:', error);
            },
          });
      }
    }
  }

  restrictInput(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) return;
    if (!/^\d$/.test(key) || input.value.length >= 2) {
      event.preventDefault();
    }
  }

  loadQuestion(slug: string) {
    if (slug.length > 1) {
      this.loading = true;
      this.questionService
        .getQuestionBySlug(slug)
        .subscribe({
          next: (response: QuestionItemDetail) => {
            console.log('QuestionManager Get API response:', response);
            this.loading = false;
            this.questionItem = response;
            //Must be called after data populated
            this.patchForm(response);
            this.initialFormValue = this.questionForm.getRawValue(); // Store original
          },
          error: (error) => {
            this.loading = false;
            console.error('QuestionManager Get API Error:', error);
          },
        });
    }
  }

  patchForm(data: QuestionItemDetail): void {
    let topicIds = [];
    if(data.topics && data.topics.length > 0){
      topicIds = data.topics.map(topic => topic.id);
    }
    this.questionForm.patchValue({
      id: data.id,
      question: data.question,
      subjectId: '' + data.subjectId,
      level: data.level,
      marks: '' + data.marks,
      order: '' + data.order,
      timeAllowed: '' + data.timeAllowed,
      status: data.status,
      questionType: data.questionType,
      hint: data.hint,
      answer: data.answer,
      topicIds: topicIds || []
    });

    if (data.questionType === 'Trivia' && data.options?.length) {
      console.log("QuestionEditor Patch Options", data.options);
      const optionControls = data.options.map(opt => this.fb.group({
        id: [opt.id],
        option: [opt.option, Validators.required],
        correct: [opt.correct]
      }));
      console.log("QuestionEditor optionControls", optionControls);

      this.questionForm.setControl('options', this.fb.array(optionControls, this.atLeastOneCorrectOption()));
    } else {
      this.questionForm.setControl('options', this.fb.array([]));
    }
    //console.log("QuestionEditor Patch Topics", data.topicIds);
  }

  navigateToQuestionList() {
    this.router.navigate(['/admin/questions/list']);
  }

}
