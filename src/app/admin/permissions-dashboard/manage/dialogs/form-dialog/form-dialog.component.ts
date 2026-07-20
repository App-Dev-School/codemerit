import { Component, Inject } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogRef
} from '@angular/material/dialog';
import { PermissionGroup, UserPermissionItem } from '@core/models/permission.model';
import { MasterService } from '@core/service/master.service';
import { SearchableSelectComponent, SearchableSelectOption } from '@shared/components/searchable-select/searchable-select.component';
import { permissionsService } from '../../permissions.service';

// Backend accepts a lowercase resource kind for scoped permissions
// (see apis/permissions docs) — must match exactly, not the display title.
type ResourceTypeValue = 'subject' | 'topic' | 'job-role' | 'badge';

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
    ReactiveFormsModule,
    SearchableSelectComponent,
    MatDialogClose
  ]
})
export class UserPermissionsFormComponent {
  action: string;
  dialogTitle: string;
  permissionsForm: UntypedFormGroup;
  initialFormValue: any;
  permissionsItems: UserPermissionItem;
  resourceTypes: { value: ResourceTypeValue; title: string }[] = [
    { value: 'subject', title: 'Subject' },
    { value: 'topic', title: 'Topic' },
    { value: 'job-role', title: 'Job Role' },
    { value: 'badge', title: 'Badge' },
  ];
  resources: any[] = [];
  permissionGroups: PermissionGroup[] = [];
  permissionsLoading = false;
  badgesCache: any[] | null = null;
  users: any[] = [];
  errorMessage = '';

  constructor(
    public dialogRef: MatDialogRef<UserPermissionsFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public permissionsService: permissionsService,
    private fb: UntypedFormBuilder,
    private masterService: MasterService
  ) {
    this.action = data.action;
    this.dialogTitle = this.action === 'edit' ? 'View User Permission' : 'Grant New Permission';
    this.permissionsItems = this.action === 'edit' ? data.permissionsItem : new UserPermissionItem({}); // Create a blank object
    this.permissionsForm = this.createPermissionForm();

    // The list page fetches the catalogue on its own ngOnInit and caches it
    // in the service, but if this dialog opens before that resolves (or the
    // dialog is opened from somewhere else entirely) the cache is empty —
    // fetch it directly rather than showing a permanently blank picker.
    this.permissionGroups = this.permissionsService.getSavedMasterPermissions();
    if (!this.permissionGroups || this.permissionGroups.length === 0) {
      this.permissionsLoading = true;
      this.permissionsService.getAllPermissions().subscribe({
        next: (groups) => {
          this.permissionsService.setPermissions(groups);
          this.permissionGroups = groups;
          this.permissionsLoading = false;
        },
        error: (err) => {
          console.error('Failed to load permission catalogue', err);
          this.permissionsLoading = false;
        },
      });
    }

    this.permissionsService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res;
      },
      error: (err) => console.error(err)
    });
  }

  ngOnInit() {
    this.resources = this.resourcesForType(this.permissionsForm.get('resourceType')?.value);

    this.permissionsForm.get('resourceType')?.valueChanges.subscribe((resourceType: ResourceTypeValue) => {
      this.resources = this.resourcesForType(resourceType);
      this.permissionsForm.get('resourceId')?.setValue(null);
    });
  }

  // ── Options for the searchable-select fields ─────────────────────

  get permissionOptions(): SearchableSelectOption[] {
    const options: SearchableSelectOption[] = [];
    for (const g of this.permissionGroups) {
      const groupLabel = g.group === 'Ungrouped' ? 'Other' : g.group;
      for (const p of g.permissions) {
        if (p.isVisible !== false) options.push({ id: p.id, label: p.permission, group: groupLabel });
      }
    }
    return options;
  }

  get userOptions(): SearchableSelectOption[] {
    return this.users.map(u => ({ id: u.id, label: `${u.firstName} ${u.lastName}` }));
  }

  get resourceTypeOptions(): SearchableSelectOption[] {
    return this.resourceTypes.map(r => ({ id: r.value, label: r.title }));
  }

  get resourceOptions(): SearchableSelectOption[] {
    return this.resources.map(r => ({ id: r.id, label: r.title }));
  }

  get showResourcePicker(): boolean {
    const resourceType = this.permissionsForm.get('resourceType')?.value;
    return resourceType === 'subject' || resourceType === 'topic'
      || resourceType === 'job-role' || resourceType === 'badge';
  }

  private resourcesForType(resourceType: ResourceTypeValue | ''): any[] {
    if (resourceType === 'topic') return this.masterService.topics ?? [];
    if (resourceType === 'job-role') return this.masterService.jobRoles ?? [];
    if (resourceType === 'subject') return this.masterService.subjects ?? [];
    if (resourceType === 'badge') {
      if (this.badgesCache) return this.badgesCache;
      // Fetched lazily and cached — resources array updates once it resolves.
      this.masterService.fetchBadgeCatalog().subscribe((badges) => {
        this.badgesCache = badges.map(b => ({ id: b.id, title: b.name }));
        if (this.permissionsForm.get('resourceType')?.value === 'badge') {
          this.resources = this.badgesCache;
        }
      });
      return [];
    }
    return [];
  }

  createPermissionForm(): UntypedFormGroup {
    // permissionIds backs a multi-select, so its value is an array — Validators.min
    // doesn't apply to arrays (it compares against a numeric value and is a no-op
    // here). Validators.required already covers "at least one selected" for arrays.
    const initialPermissionIds = this.permissionsItems.permissionId
      ? [this.permissionsItems.permissionId]
      : [];
    return this.fb.group({
      id: [this.permissionsItems.id],
      permissionIds: [initialPermissionIds, [Validators.required]],
      userId: [this.permissionsItems.user?.id, [Validators.required, Validators.min(1)]],
      resourceType: [this.permissionsItems.resourceType || ''],
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
    this.errorMessage = '';
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
              this.dialogRef.close(response);
            },
            error: (error) => {
              this.errorMessage = error;
            },
          });
      } else {
        // Add new permissions. resourceType/resourceId are only meaningful together —
        // omit both when no scope was picked rather than sending an empty resourceType.
        const permissionIds = Array.isArray(formData.permissionIds) ? formData.permissionIds : [formData.permissionIds];
        const payload: any = {
          permissionIds,
          userId: formData.userId
        };
        if (this.showResourcePicker && formData.resourceType && formData.resourceId) {
          payload.resourceType = formData.resourceType;
          payload.resourceId = formData.resourceId;
        }

        this.permissionsService
          .addPermissions(payload)
          .subscribe({
            next: (response) => {
              console.log('permissionsManager CreateAPI response:', response);
              this.dialogRef.close(response);
            },
            error: (error) => {
              this.errorMessage = error;
            },
          });
      }
    }
  }

  onNoClick(): void {
    this.dialogRef.close(); // Close dialog without any action
  }
}
