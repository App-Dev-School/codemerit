import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
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
    MatCheckboxModule
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
      this.action === 'edit' ? data.topicItem.name : 'New Topic';
    this.topicItems = this.action === 'edit' ? data.topicItem : new TopicItem({}); // Create a blank object
    this.topicForm = this.createContactForm();
    if (this.action === 'edit') {
      //populate topic
      this.topicForm.get('title')?.setValue(data.topicItem.name);
      this.topicForm.get('description')?.setValue(data.topicItem.description);
      this.topicForm.get('label')?.setValue(data.topicItem.label);
      this.topicForm.get('parent')?.setValue(data.topicItem.parent);
      this.topicForm.get('subject_id')?.setValue(data.topicItem.subjectId);

      // Save initial value for later comparison
      this.initialFormValue = this.topicForm.getRawValue();
    }
    this.masterSrv.getMockSubjects().subscribe(data => {
      this.subjects = data;
    });
  }

  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.topicItems.id],
      img: [this.topicItems.img],
      title: ['', [Validators.required, Validators.minLength(3), Validators.pattern('[a-zA-Z]+')]],
      subject_id: [0, [Validators.required]],
      parent: [''],
      label: ['', [Validators.required]],
      order: [0, [Validators.required]],
      description: [''],
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
        // Update existing topic
        const payload = {
          title: 'Yay I am updated'
        }
        this.topicService
          .updateTopic(payload)
          .subscribe({
            next: (response) => {
              this.dialogRef.close(response); // Close dialog and return updated doctor data
            },
            error: (error) => {
              console.error('Update Error:', error);
              // Optionally display an error message to the user
            },
          });
      } else {
        // Add new topic
        const payload = {
          title: formData.title,
          subjectId: formData.subject_id,
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
}
