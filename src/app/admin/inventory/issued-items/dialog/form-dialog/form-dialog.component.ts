import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { IssuedItemsService } from '../../issued-items.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { IssuedItems } from '../../issued-items.model';
import { formatDate } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  id: number;
  action: string;
  issuedItems: IssuedItems;
}

@Component({
    selector: 'app-issued-items-form',
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
        MatDatepickerModule,
        MatRadioModule,
        MatDialogClose,
    ]
})
export class IssuedItemsFormComponent {
  action: string;
  dialogTitle: string;
  issuedItemsForm: UntypedFormGroup;
  issuedItems: IssuedItems;

  constructor(
    public dialogRef: MatDialogRef<IssuedItemsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public issuedItemsService: IssuedItemsService,
    private fb: UntypedFormBuilder
  ) {
    this.action = data.action;
    this.dialogTitle =
      this.action === 'edit'
        ? `Edit Item: ${data.issuedItems.i_name}`
        : 'New Item Issue';

    this.issuedItems =
      this.action === 'edit'
        ? data.issuedItems
        : new IssuedItems({} as IssuedItems);

    this.issuedItemsForm = this.createIssuedItemsForm();
  }

  // Create form group for issued items details
  createIssuedItemsForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.issuedItems.id],
      i_name: [this.issuedItems.i_name, [Validators.required]],
      category: [this.issuedItems.category],
      issue_date: [
        formatDate(this.issuedItems.issue_date, 'yyyy-MM-dd', 'en'),
        [Validators.required],
      ],
      return_date: [
        formatDate(this.issuedItems.return_date, 'yyyy-MM-dd', 'en'),
        [Validators.required],
      ],
      issue_to: [this.issuedItems.issue_to, [Validators.required]],
      qty: [this.issuedItems.qty, [Validators.required]],
      status: [this.issuedItems.status],
    });
  }

  // Dynamic error message retrieval
  getErrorMessage(controlName: string): string {
    const control = this.issuedItemsForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    return ''; // Return empty if no errors
  }

  // Submit form data
  submit() {
    if (this.issuedItemsForm.valid) {
      const issuedData = this.issuedItemsForm.getRawValue();
      if (this.action === 'edit') {
        this.issuedItemsService.updateIssuedItems(issuedData).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Update Error:', error);
            // Optionally show an error message to the user
          },
        });
      } else {
        this.issuedItemsService.addIssuedItems(issuedData).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Add Error:', error);
            // Optionally show an error message to the user
          },
        });
      }
    }
  }

  // Close dialog without action
  onNoClick(): void {
    this.dialogRef.close();
  }
}
