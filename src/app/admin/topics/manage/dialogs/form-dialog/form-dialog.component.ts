import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { JsonPipe } from '@angular/common';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { TopicItem } from '../../topic-item.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { TopicService } from '../../topics.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Subject } from '@core/models/subject';
import { MasterService } from '@core/service/master.service';

export interface DialogData {
  id: number;
  action: string;
  topicItem: TopicItem;
}

interface TopicGroup {
  disabled?: boolean;
  name: string;
  pokemon: TopicItem[];
}

@Component({
  selector: 'app-topic-form-dialog',
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
    JsonPipe
  ]
})
export class TopicFormComponent {
  action: string;
  dialogTitle: string;
  topicForm: UntypedFormGroup;
  initialFormValue: any;
  topicItems: TopicItem;
  subjects: Subject[] = [];
  topicGroups: TopicGroup[] = [
    {
      name: 'Variables and Constants',
      pokemon: [
      ],
    },
    {
      name: 'Control Structures',
      pokemon: [
      ],
    },
    {
      name: 'Operations',
      disabled: true,
      pokemon: [
      ],
    },
    {
      name: 'Functions',
      pokemon: [
      ],
    },
  ];
  constructor(
    public dialogRef: MatDialogRef<TopicFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public topicService: TopicService,
    private masterSrv: MasterService,
    private fb: UntypedFormBuilder
  ) {
    this.action = data.action;
    this.dialogTitle =
      this.action === 'edit' ? data.topicItem.title : 'Create New Topic';
    this.topicItems = this.action === 'edit' ? data.topicItem : new TopicItem({}); // Create a blank object
    this.topicForm = this.createContactForm();
    if (this.action === 'edit') {
      console.log('TopicManager ###Update Form in Edit Mode:', data.topicItem);
      //populate topic
      this.topicForm.get('title')?.setValue(data.topicItem.title);
      this.topicForm.get('title')?.updateValueAndValidity();
      this.topicForm.get('description')?.setValue(data.topicItem.description);
      this.topicForm.get('label')?.setValue(data.topicItem.label);
      this.topicForm.get('label')?.updateValueAndValidity();
      this.topicForm.get('subjectId')?.setValue(data.topicItem.subjectId);
      this.topicForm.get('subjectId')?.updateValueAndValidity();
      this.topicForm.get('order')?.setValue(data.topicItem.order);
      this.topicForm.get('weight')?.setValue(data.topicItem.weight);
      this.topicForm.get('popularity')?.setValue(data.topicItem.popularity);
      this.topicForm.get('isPublished')?.setValue(data.topicItem.isPublished);
      if (data.topicItem.parent) {
        //this.topicForm.get('parent')?.setValue(data.topicItem.parent);
      }
      // this.topicForm.patchValue({
      //   title: data.topicItem.title,
      //   description: data.topicItem.description,
      //   label: data.topicItem.label,
      //   subjectId: data.topicItem.subjectId,
      // });
      // Save initial value for later comparison
      this.initialFormValue = this.topicForm.getRawValue();

      /**
       * Form should not be closed on click outside
       * Form fields validation to be reviewed
       * Edit Mode Fixes
       * Display Status and other disabled fields in list topics
       */
    }
    //Make this a local master data
    this.masterSrv.getMockSubjects().subscribe(data => {
      this.subjects = data;
    });
  }

  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.topicItems.id],
      image: [''],
      title: [this.topicItems.title, [Validators.required, Validators.minLength(3), Validators.pattern('[a-zA-Z]+')]],
      subjectId: ['' + this.topicItems.subjectId, [Validators.required]],
      parent: [''],
      label: [this.topicItems.label, [Validators.required]],
      order: [this.topicItems.order, [
        Validators.pattern(/^\d{1,2}$/), // Only 1 or 2 digit numbers
        Validators.max(99)
      ]],
      weight: [this.topicItems.weight, [
        Validators.pattern(/^\d{1,2}$/),
        Validators.max(99)
      ]],
      popularity: [this.topicItems.popularity, [
        Validators.max(999)
      ]],
      description: [this.topicItems.description],
      isPublished: [false]
    });

  }

  getErrorMessage(control: UntypedFormControl): string {
    if (control.hasError('required')) {
      return 'This field is required';
    } else if (control.hasError('email')) {
      return 'Please enter a valid email';
    }
    return '';
  }

  submit() {
    if (this.topicForm.valid) {
      const formData = this.topicForm.getRawValue();
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

        console.log('TopicManager Changed fields:', changedFields);
        this.topicService
          .updateTopic(changedFields, formData.id)
          .subscribe({
            next: (response) => {
              console.log('TopicManager UpdateAPI response:', changedFields);
              this.dialogRef.close(response); // Close dialog and return
            },
            error: (error) => {
              console.error('TopicManager ###Update Error:', error);
              // Optionally display an error message to the user
            },
          });
      } else {
        // Add new topic
        const payload = {
          title: formData.title,
          subjectId: Number.parseInt(formData.subjectId),
          order: formData.order,
          parent: null,
          isPublished: formData.isPublished,
          description: formData.description
        }
        this.topicService
          .addTopic(payload)
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
    this.dialogRef.close(); // Close dialog without any action
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
