import { Component, Inject } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
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
import { MasterService } from '@core/service/master.service';
import { permissionsService } from '../../permissions.service';

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
    MatAutocompleteModule,
    MatSelectModule,
    MatDialogClose
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
  resourceSearchCtrl = new UntypedFormControl('');
  filteredResources: any[] = [];
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
    this.filteredResources = this.resources ? [...this.resources] : [];
    this.resourceSearchCtrl.valueChanges.subscribe(value => {
      this.filterResources(value);
    });
  }

  ngOnInit() {
    // Set resources and filteredResources based on current resourceType
    const resourceType = this.permissionsForm.get('resourceType')?.value;
    if (resourceType === 'Topic') {
      this.resources = this.masterService.topics;
    } else {
      this.resources = this.masterService.subjects;
    }
    this.filteredResources = this.resources ? [...this.resources] : [];

    // Set the input value to the selected resource's title if editing
    const selectedId = this.permissionsForm.get('resourceId')?.value;
    if (selectedId && this.resources) {
      const selected = this.resources.find(r => r.id === selectedId);
      if (selected) {
        this.resourceSearchCtrl.setValue(selected, { emitEvent: false });
      }
    }

    this.permissionsForm.get('resourceType')?.valueChanges.subscribe(resourceType => {
      if (resourceType === 'Topic') {
        this.resources = this.masterService.topics;
      } else {
        this.resources = this.masterService.subjects;
      }
      this.filteredResources = this.resources;
      this.resourceSearchCtrl.setValue('');
    });
  }

  filterResources(search: string | any) {
    let searchValue = '';
    if (typeof search === 'string') {
      searchValue = search.toLowerCase();
    } else if (search && search.title) {
      searchValue = search.title.toLowerCase();
    }
    this.filteredResources = (this.resources || []).filter(r =>
      r.title.toLowerCase().includes(searchValue)
    );
  }

  onResourceSelected(event: any) {
    const selected = event.option.value;
    if (selected && selected.id) {
      this.permissionsForm.get('resourceId')?.setValue(selected.id);
      setTimeout(() => {
        this.resourceSearchCtrl.setValue(selected, { emitEvent: false });
      }, 0);
    }
  }

  displayResource(resource: any): string {
    return resource && resource.title ? resource.title : '';
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
