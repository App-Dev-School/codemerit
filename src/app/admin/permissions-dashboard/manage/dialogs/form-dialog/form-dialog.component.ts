import { Component, Inject } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Permission, UserPermissionItem } from '@core/models/permission.model';
import { permissionsService } from '../../permissions.service';
import { MasterService } from '@core/service/master.service';


export interface DialogData {
  id: number;
  action: string;
  permissionsItem: UserPermissionItem;
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
    MatDialogClose,
    JsonPipe
  ]
})
export class UserPermissionsFormComponent {
  action: string;
  dialogTitle: string;
  permissionsForm: UntypedFormGroup;
  initialFormValue: any;
  permissionsItems: UserPermissionItem;
  resourceTypes = [
    { value: 'Subject', title: 'Subject' },
    { value: 'Topic', title: 'Topic' }
  ];
  resources: any[] = [];
  permissionsList: Permission[];
  users: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<UserPermissionsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public permissionsService: permissionsService,
    private fb: UntypedFormBuilder,
    private masterService: MasterService
  ) {
    this.action = data.action;
    this.dialogTitle = this.action === 'edit' ? 'View User Permission' : 'Grant New Permission';
    this.permissionsList = this.permissionsService.getSavedMasterPermissions();
    this.permissionsItems = this.action === 'edit' ? data.permissionsItem : new UserPermissionItem({}); // Create a blank object
    this.permissionsForm = this.createPermissionForm();
    this.permissionsService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res;
      },
      error: (err) => console.error(err)
    });


    // this.permissionsForm.valueChanges.subscribe(() => {
    //   if (this.permissionsForm.valid) {
    //     this.formSubmitted.emit(this.permissionsForm.value);
    //   }
    // });

    this.permissionsForm.get('resourceType')?.valueChanges.subscribe(resourceType => {
      this.resources = this.masterService.subjects;
      if (resourceType === 'Topic') {
        this.resources = this.masterService.topics;
      } else {
        this.resources = this.masterService.subjects;
      }
    });

    if (this.action === 'edit') {
      console.log('permissionsManager ###Update Form in Edit Mode:', data.permissionsItem);
      //populate permissions
      this.permissionsForm.patchValue({
        permissionIds: data.permissionsItem.permissionId,
        resourceType: data.permissionsItem.resourceType,
        resourceId: data.permissionsItem.resourceId,
        userId: data.permissionsItem.user?.id,
        userEmail: data.permissionsItem.user?.email
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

  createPermissionForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.permissionsItems.id],
      permissionIds: [this.permissionsItems.permissionId, [Validators.required, Validators.min(1)]],
      userId: [this.permissionsItems.user?.id, [Validators.required, Validators.min(1)]],
      resourceType: [this.permissionsItems.resourceType],
      resourceId: [this.permissionsItems.resourceId]
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
          .updatePermissions(changedFields, formData.id)
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
        const permissionIds = Array.isArray(formData.permissionIds) ? formData.permissionIds : [formData.permissionIds];
        const payload = {
          permissionIds,
          resourceType: formData.resourceType,
          resourceId: formData.resourceId,
          userId: formData.userId
        };

        this.permissionsService
          .addPermissions(payload)
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
