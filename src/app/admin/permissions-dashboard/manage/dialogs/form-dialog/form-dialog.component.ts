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
import { permissionsItem } from '../../permission-item.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { permissionsService } from '../../permissions.service';
import { MatCheckboxModule } from '@angular/material/checkbox';


export interface DialogData {
  id: number;
  action: string;
  permissionsItem: permissionsItem;
}

@Component({
  selector: 'app-permissions-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
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
export class permissionsFormComponent {
  action: string;
  dialogTitle: string;
  permissionsImage = 'assets/images/icons/permissions.png';
  permissionsForm: UntypedFormGroup;
  initialFormValue: any;
  permissionsItems: permissionsItem;
  constructor(
    public dialogRef: MatDialogRef<permissionsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public permissionsService: permissionsService,
    private fb: UntypedFormBuilder
  ) {
    this.action = data.action;
    this.dialogTitle =this.action === 'edit'? 'Edit Permission': 'Create New Permission';
    this.permissionsItems = this.action === 'edit' ? data.permissionsItem : new permissionsItem({}); // Create a blank object
    this.permissionsForm = this.createContactForm();

  

    if (this.action === 'edit') {
      console.log('permissionsManager ###Update Form in Edit Mode:', data.permissionsItem);
      //populate permissions
      this.permissionsForm.patchValue({
        permissionId: data.permissionsItem.permissionId,
        permissionName: data.permissionsItem.permissionName,
        resourceType: data.permissionsItem.resourceType,
        resourceId: data.permissionsItem.resourceId,
        resourceName: data.permissionsItem.resourceName,
        userId: data.permissionsItem.userId,
        userName: data.permissionsItem.userName,
        userEmail: data.permissionsItem.userEmail
      
      });
      // Save initial value for later comparison
      this.initialFormValue = this.permissionsForm.getRawValue();

      /**
       * Form should not be closed on click outside
       * Form fields validation to be reviewed
       * Edit Mode Fixes
       * Display Status and other disabled fields in list permissionss
       */
    }
    this.permissionsForm.updateValueAndValidity();

  }

 createContactForm(): UntypedFormGroup {
  return this.fb.group({
    id: [this.permissionsItems.id],

    permissionId: [this.permissionsItems.permissionId, Validators.required],
    permissionName: [this.permissionsItems.permissionName],


    resourceType: [this.permissionsItems.resourceType],
    resourceId: [this.permissionsItems.resourceId, Validators.required],
    resourceName: [this.permissionsItems.resourceName],

    userId: [this.permissionsItems.userId, Validators.required],
    userName: [this.permissionsItems.userName],
    userEmail: [this.permissionsItems.userEmail, [Validators.email]]
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
    if (this.permissionsForm.valid) {
      const formData = this.permissionsForm.getRawValue();
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

        console.log('permissionsManager Changed fields:', changedFields);
        this.permissionsService
          .updatepermissions(changedFields, formData.id)
          .subscribe({
            next: (response) => {
              console.log('permissionsManager UpdateAPI response:', changedFields);
              this.dialogRef.close(response); // Close dialog and return
            },
            error: (error) => {
              console.error('permissionsManager ###Update Error:', error);
              // Optionally display an error message to the user
            },
          });
      } else {
        // Add new permissions
        const payload = {
              permissionId: formData.permissionId,
              resourceId: formData.resourceId,
              userId: formData.userId
          };

        this.permissionsService
          .addpermissions(payload)
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
