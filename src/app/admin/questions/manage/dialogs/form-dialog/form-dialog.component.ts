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
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Subject } from '@core/models/subject';
import { MasterService } from '@core/service/master.service';
import { QuestionItem } from '../../question-item.model';
import { QuestionService } from '../../questions.service';

export interface DialogData {
  id: number;
  action: string;
  questionItem: QuestionItem;
}

@Component({
  selector: 'app-question-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatDialogClose,
    MatCheckboxModule,
    MatChip,
    JsonPipe
  ]
})
export class QuestionFormComponent implements OnInit {
  action: string;
  dialogTitle: string;
  topicImage = 'assets/images/icons/topic.png';
  questionForm: UntypedFormGroup;
  initialFormValue: any;
  questionItem: QuestionItem;
  subjects: Subject[] = [];
  topics: { id: number, title: string }[] = [
    {
      id: 1,
      title: "Topic1"
    },
    {
      id: 2,
      title: "Topic2"
    },
    {
      id: 3,
      title: "Topic3"
    }
  ];
  constructor(
    public dialogRef: MatDialogRef<QuestionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public questionService: QuestionService,
    private masterSrv: MasterService,
    private fb: UntypedFormBuilder
  ) {
    this.action = data.action;
    this.dialogTitle =
      this.action === 'edit' ? 'Update Question' : 'Create New Question';
    this.questionItem = this.action === 'edit' ? data.questionItem : new QuestionItem({}); // Create a blank object
    this.questionForm = this.createQuestionForm();
    if (this.action === 'edit') {
      this.initialFormValue = this.questionForm.getRawValue();
    }
    this.masterSrv.getMockSubjects().subscribe(data => {
      this.subjects = data;
    });
    //this.subjects = localStorage.getItem(AuthConstants.SUBJECTS);
  }

  createQuestionForm(): UntypedFormGroup {
    return this.fb.group({
      //id: [this.questionItem.id],
      question: [this.questionItem.question, [Validators.required, Validators.minLength(3)]],
      subjectId: ['' + this.questionItem.subjectId, [Validators.required]],
      level: [this.questionItem.level, [Validators.required]],
      marks: ['' + this.questionItem.marks],
      //status: [this.questionItem.status],
      questionType: [this.questionItem.questionType, [Validators.required]],
      topicIds: [[], [Validators.required]],
      //options: this.fb.array([this.createOption(), this.createOption()])
    });

  }

  ngOnInit() {
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
    console.log("getTopicTitleById", id, topic);

    return topic ? topic.title : '';
  }

  submit() {
    if (this.questionForm.valid) {
      const formData = this.questionForm.getRawValue();
      if (this.action === 'edit') {
        const changedFields: any = {};
        // Compare each field
        for (const key in formData) {
          if (formData.hasOwnProperty(key)) {
            if (formData[key] !== this.initialFormValue[key]) {
              changedFields[key] = formData[key];
            }
          }
        }

        console.log('QuestionManager Changed fields:', changedFields);
        this.questionService
          .updateQuestion(changedFields, formData.id)
          .subscribe({
            next: (response) => {
              console.log('QuestionManager UpdateAPI response:', changedFields);
              this.dialogRef.close(response); // Close dialog and return
            },
            error: (error) => {
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
          status: formData.status,
          order: 1,
          marks: 1,
          topicIds: formData.topicIds
        }
        if (formData.questionType === 'Trivia') {
          payload['options'] = formData.options;
        }
        this.questionService
          .addQuestion(payload)
          .subscribe({
            next: (response) => {
              this.dialogRef.close(response); // Close dialog and return newly added doctor data
            },
            error: (error) => {
              console.error('Add Error:', error);
              // Optionally display an error message to the user
            },
          });
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
