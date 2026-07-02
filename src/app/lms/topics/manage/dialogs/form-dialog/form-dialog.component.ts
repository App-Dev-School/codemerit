import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { TopicItem } from '../../topic-item.model';
import { TopicService } from '../../topics.service';
import { Subject } from '@core/models/subject';
import { MasterService } from '@core/service/master.service';

export interface DialogData {
  id: number;
  action: string;
  topicItem: TopicItem;
}

@Component({
  selector: 'app-topic-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class TopicFormComponent {
  action: string;
  dialogTitle: string;
  topicForm: UntypedFormGroup;
  initialFormValue: any;
  topicItems: TopicItem;
  subjects: Subject[] = [];
  topicGroups: TopicItem[] = [];

  constructor(
    public dialogRef: MatDialogRef<TopicFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public topicService: TopicService,
    private masterSrv: MasterService,
    private fb: UntypedFormBuilder,
  ) {
    this.action = data.action;
    this.dialogTitle =
      this.action === 'edit'
        ? 'Edit ' + data.topicItem.title
        : 'Create New Topic';
    this.topicItems =
      this.action === 'edit' ? data.topicItem : new TopicItem({});
    this.topicForm = this.createContactForm();

    const allTopicGroups = this.masterSrv.topics;
    this.topicForm.get('subjectId')?.valueChanges.subscribe((subject) => {
      if (subject > 0) {
        this.topicGroups = allTopicGroups.filter(
          (topic) => topic.subjectId == subject,
        );
      }
    });

    if (this.action === 'edit') {
      this.topicForm.patchValue({
        title: data.topicItem.title,
        description: data.topicItem.description,
        label: data.topicItem.label,
        subjectId: '' + data.topicItem.subjectId,
        goal: '' + data.topicItem.goal,
        order: data.topicItem.order,
        weight: data.topicItem.weight,
        popularity: data.topicItem.popularity,
        isPublished: data.topicItem.isPublished,
        parent: data.topicItem.parent,
      });
      this.initialFormValue = this.topicForm.getRawValue();
    }

    this.subjects = this.masterSrv.subjects;
  }

  createContactForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.topicItems.id],
      image: [''],
      title: [
        this.topicItems.title,
        [Validators.required, Validators.minLength(3)],
      ],
      subjectId: ['' + this.topicItems.subjectId, [Validators.required]],
      parent: [''],
      label: [this.topicItems.label, [Validators.required]],
      order: [
        this.topicItems.order,
        [Validators.pattern(/^\d{1,2}$/), Validators.max(99)],
      ],
      weight: [
        this.topicItems.weight,
        [Validators.pattern(/^\d{1,2}$/), Validators.max(99)],
      ],
      popularity: [this.topicItems.popularity, [Validators.max(999)]],
      description: [this.topicItems.description],
      goal: [this.topicItems.goal],
      isPublished: [true],
      hideOtherFields: [true],
    });
  }

  getErrorMessage(control: UntypedFormControl): string {
    if (control.hasError('required')) return 'This field is required';
    if (control.hasError('email')) return 'Please enter a valid email';
    return '';
  }

  submit() {
    if (this.topicForm.valid) {
      const formData = this.topicForm.getRawValue();
      if (this.action === 'edit') {
        const changedFields: any = {};
        for (const key in formData) {
          if (
            Object.prototype.hasOwnProperty.call(formData, key) &&
            formData[key] !== this.initialFormValue[key]
          ) {
            changedFields[key] = formData[key];
          }
        }
        this.topicService.updateTopic(changedFields, formData.id).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (error) => console.error('Update Error:', error),
        });
      } else {
        const payload = {
          title: formData.title,
          subjectId: Number.parseInt(formData.subjectId),
          order: formData.order,
          parent: formData.parent !== '' ? formData.parent : null,
          weight: formData.weight,
          label: formData.label,
          popularity: formData.popularity,
          isPublished: formData.isPublished,
          description: formData.description,
          goal: formData.goal,
        };
        this.topicService.addTopic(payload).subscribe({
          next: (response) => this.dialogRef.close(response),
          error: (error) => console.error('Add Error:', error),
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
}
