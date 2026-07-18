import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BadgeCatalogEntry, BadgeScopeType, MyBadgesResponse } from '@core/models/gamification.model';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { permissionsService } from '../../permissions-dashboard/manage/permissions.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { BadgeEarnedCardComponent } from '@shared/components/badge-earned-card/badge-earned-card.component';

interface LastGrantResult {
  badgeName: string;
  userName: string;
  alreadyEarned: boolean;
  at: Date;
}

@Component({
  selector: 'app-manage-badge-grants',
  templateUrl: './badge-grants.component.html',
  styleUrls: ['./badge-grants.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    BreadcrumbComponent,
    BadgeEarnedCardComponent,
  ],
})
export class ManageBadgeGrantsComponent implements OnInit {
  scopeTypes: { value: BadgeScopeType; title: string }[] = [
    { value: 'Global', title: 'Global' },
    { value: 'Subject', title: 'Subject' },
    { value: 'JobRole', title: 'Job Role' },
    { value: 'Topic', title: 'Topic' },
  ];

  users: any[] = [];
  resources: any[] = [];
  filteredResources: any[] = [];
  resourceSearchCtrl = new UntypedFormControl('');
  catalog: BadgeCatalogEntry[] = [];
  catalogLoading = false;
  submitting = false;
  lastResult: LastGrantResult | null = null;

  // Preview of the selected user's current badges — lets the admin see what they already have
  // before granting another, scoped to match whatever badge scope is currently selected.
  userBadges: MyBadgesResponse | null = null;
  userBadgesLoading = false;

  grantForm: UntypedFormGroup;

  constructor(
    private fb: UntypedFormBuilder,
    private master: MasterService,
    private permissionsService: permissionsService,
    private snackService: SnackbarService,
  ) {
    this.grantForm = this.fb.group({
      userId: [null, [Validators.required, Validators.min(1)]],
      scopeType: [''],
      resourceId: [null],
      badgeId: [null, [Validators.required, Validators.min(1)]],
      note: ['', [Validators.maxLength(255)]],
    });
  }

  ngOnInit(): void {
    this.permissionsService.getAllUsers().subscribe({
      next: (res: any) => { this.users = res ?? []; },
      error: (err) => console.error('BadgeGrants getAllUsers failed', err),
    });

    this.resourceSearchCtrl.valueChanges.subscribe((value) => this.filterResources(value));

    this.grantForm.get('scopeType')?.valueChanges.subscribe((scopeType: BadgeScopeType | '') => {
      this.resources = this.resourcesForScope(scopeType);
      this.filteredResources = [...this.resources];
      this.resourceSearchCtrl.setValue('', { emitEvent: false });
      this.grantForm.get('resourceId')?.setValue(null);
      this.grantForm.get('badgeId')?.setValue(null);
      this.loadCatalog();
      this.loadUserBadges();
    });

    this.grantForm.get('userId')?.valueChanges.subscribe(() => this.loadUserBadges());

    this.loadCatalog();
  }

  private resourcesForScope(scopeType: BadgeScopeType | ''): any[] {
    if (scopeType === 'Subject') return this.master.subjects ?? [];
    if (scopeType === 'JobRole') return this.master.jobRoles ?? [];
    if (scopeType === 'Topic') return this.master.topics ?? [];
    return [];
  }

  get showResourcePicker(): boolean {
    const scopeType = this.grantForm.get('scopeType')?.value;
    return scopeType === 'Subject' || scopeType === 'JobRole' || scopeType === 'Topic';
  }

  filterResources(search: string | any): void {
    let searchValue = '';
    if (typeof search === 'string') {
      searchValue = search.toLowerCase();
    } else if (search && search.title) {
      searchValue = search.title.toLowerCase();
    }
    this.filteredResources = (this.resources || []).filter((r) =>
      r.title.toLowerCase().includes(searchValue),
    );
  }

  onResourceSelected(event: any): void {
    const selected = event.option.value;
    if (selected && selected.id) {
      this.grantForm.get('resourceId')?.setValue(selected.id);
      this.grantForm.get('badgeId')?.setValue(null);
      setTimeout(() => this.resourceSearchCtrl.setValue(selected, { emitEvent: false }), 0);
      this.loadCatalog();
      this.loadUserBadges();
    }
  }

  displayResource(resource: any): string {
    return resource && resource.title ? resource.title : '';
  }

  loadCatalog(): void {
    const scopeType: BadgeScopeType | '' = this.grantForm.get('scopeType')?.value;
    const resourceId: number | null = this.grantForm.get('resourceId')?.value;
    this.catalogLoading = true;
    this.master
      .fetchBadgeCatalog({
        scopeType: scopeType || undefined,
        scopeId: this.showResourcePicker && resourceId ? resourceId : undefined,
        isManuallyGrantable: true,
      })
      .subscribe((data) => {
        this.catalog = data ?? [];
        this.catalogLoading = false;
      });
  }

  // Scoped to whatever badge scope is currently selected, same filter as loadCatalog() — full
  // collection when no scope is chosen. Only fetches once a user is picked.
  loadUserBadges(): void {
    const userId: number | null = this.grantForm.get('userId')?.value;
    if (!userId) {
      this.userBadges = null;
      return;
    }
    const scopeType: BadgeScopeType | '' = this.grantForm.get('scopeType')?.value;
    const resourceId: number | null = this.grantForm.get('resourceId')?.value;
    this.userBadgesLoading = true;
    this.master
      .fetchMyBadges({
        userId,
        scopeType: scopeType || undefined,
        scopeId: this.showResourcePicker && resourceId ? resourceId : undefined,
      })
      .subscribe((data) => {
        this.userBadges = data;
        this.userBadgesLoading = false;
      });
  }

  submit(): void {
    if (!this.grantForm.valid || this.submitting) return;
    const { userId, badgeId, note } = this.grantForm.getRawValue();
    const user = this.users.find((u) => u.id === userId);
    const badge = this.catalog.find((b) => b.id === badgeId);
    const userName = user ? `${user.firstName} ${user.lastName}` : 'this user';

    this.submitting = true;
    this.master.grantBadge({ userId, badgeId, note: note || undefined }).subscribe({
      next: (response) => {
        this.submitting = false;
        this.lastResult = {
          badgeName: response.name ?? badge?.name ?? 'Badge',
          userName,
          alreadyEarned: response.alreadyEarned,
          at: new Date(),
        };
        if (response.alreadyEarned) {
          this.snackService.display('snackbar-dark', `${userName} already had "${response.name}" — note updated.`, 'bottom', 'center');
        } else {
          this.snackService.display('snackbar-success', `"${response.name}" granted to ${userName}!`, 'bottom', 'center');
        }
        this.grantForm.get('badgeId')?.setValue(null);
        this.grantForm.get('note')?.setValue('');
        this.loadUserBadges();
      },
      error: (error) => {
        this.submitting = false;
        if (error?.status === 403) {
          this.snackService.display('snackbar-dark', "You're not authorized to grant badges for this subject/job role.", 'bottom', 'center');
        } else {
          const message = error?.error?.message || 'Please try again.';
          this.snackService.display('snackbar-danger', `Couldn't grant badge — ${message}`, 'bottom', 'center');
        }
      },
    });
  }

  dismissLastResult(): void {
    this.lastResult = null;
  }
}
