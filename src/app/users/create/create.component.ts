import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthConstants } from '@config/AuthConstants';
import { User } from '@core';
import { Country } from '@core/models/country.data';
import { Role } from '@core/models/role';
import { AuthService } from '@core/service/auth.service';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { SearchableSelectComponent, SearchableSelectOption } from '@shared/components/searchable-select/searchable-select.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create-user',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  imports: [
    BreadcrumbComponent,
    ReactiveFormsModule,
    RouterLink,
    SearchableSelectComponent,
  ]
})
export class CreateUserComponent implements OnInit, OnDestroy {
  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private masterService: MasterService,
    private snackbar: SnackbarService,
    public authService: AuthService) {
  }
  authData: User;
  authForm!: UntypedFormGroup;
  userName = "";
  userDetail: any;
  loading = false;
  loadingTxt = '';
  editMode = false;
  screenTitle = 'Add New User';
  screenAction = 'Register User';
  html = '';
  submitted = false;
  error = "";
  countries?: Country[];

  // ── Job role / certification track (cascading, mirrors register.component.ts) ──
  availableTracks: any[] = [];

  readonly statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'BLOCKED', label: 'Blocked' },
  ];

  get jobRoles(): any[] {
    return this.masterService.jobRoles || [];
  }

  get countryOptions(): SearchableSelectOption[] {
    return (this.countries ?? []).map(c => ({ id: c.name, label: c.name }));
  }

  get jobRoleOptions(): SearchableSelectOption[] {
    return this.jobRoles.map(role => ({ id: role.id, label: role.title }));
  }

  get certificationTrackOptions(): SearchableSelectOption[] {
    return (this.availableTracks ?? []).map(track => ({ id: track.id, label: track.title }));
  }

  // Only Admin can see/edit the status field and change accountStatus —
  // Talent-Partner-permission holders manage users but never account status.
  get isAdminViewer(): boolean {
    return this.authData?.role === Role.Admin;
  }

  // Backend is the authority: a Talent Partner (non-Admin) cannot edit an
  // already-Active user's profile. This is a frontend UX affordance so the
  // viewer isn't surprised by a 403 — not a security boundary.
  get editBlockedForViewer(): boolean {
    return this.editMode && !this.isAdminViewer && this.userDetail?.accountStatus === 'ACTIVE';
  }

  // Talent-Partner-permission holders see this same screen framed as
  // "Talent Management" rather than the Admin-facing "User Management" wording.
  get breadcrumbTitle(): string {
    return this.isAdminViewer ? 'User Management' : 'Talent Management';
  }

  get breadcrumbTrailLabel(): string {
    return this.isAdminViewer ? 'Users' : 'Talents';
  }

  get breadcrumbActiveItem(): string {
    if (this.isAdminViewer) return this.screenTitle;
    return this.editMode ? 'Edit Talent' : 'Add New';
  }

  get listCtaLabel(): string {
    return this.isAdminViewer ? 'List Users' : 'List Talents';
  }

  ngOnInit(): void {
    this.authData = this.authService.currentUserValue;
    this.takeRouteParams();
    this.authForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: [''],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      mobile: [null, [Validators.pattern(AuthConstants.REGEX_PHONE)]],
      city: ['', Validators.required],
      country: ['', Validators.required],
      linkedinUrl: [''],
      techRoleId: [null],
      certificationTrackId: [{ value: null, disabled: true }],
      yearsExperience: [null, [Validators.min(0), Validators.max(50)]]
    });

    if (this.isAdminViewer) {
      this.authForm.addControl('status', this.formBuilder.control(null));
    }

    // Drives the certificationTrackId cascade — fires for both user selection
    // and loadData()'s patchValue, so onTechRoleChange() doesn't need a second
    // manual call site.
    this.authForm.get('techRoleId')?.valueChanges.subscribe(() => this.onTechRoleChange());

    this.masterService.getCountries().subscribe((countryData: any) => {
      this.countries = countryData;
    });
  }

  // Mirrors register.component.ts's onTechAreaChange() — certification tracks
  // are only available per-selected-job-role via fetchCourseDetail(slug), there
  // is no flat MasterService.certificationTracks collection.
  onTechRoleChange(): void {
    const jobRoleId = Number(this.authForm.get('techRoleId')?.value);
    const selectedRole = this.jobRoles.find((role: any) => Number(role.id) === jobRoleId);
    const trackCtrl = this.authForm.get('certificationTrackId');
    trackCtrl?.setValue(null);
    trackCtrl?.disable();
    this.availableTracks = [];

    if (!selectedRole?.slug) return;

    this.masterService.fetchCourseDetail(selectedRole.slug).subscribe((data: any) => {
      this.availableTracks = (data?.certificationTracks || [])
        .slice()
        .sort((a: any, b: any) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

      this.availableTracks.length ? trackCtrl?.enable() : trackCtrl?.disable();
    });
  }

  takeRouteParams() {
    console.log("takeRoute ===>", this.router.url);

    this.route.paramMap.subscribe(params => {
      console.log("takeRoute paramMap ===>", params);
      if (params.get("userName")) {
        this.userName = params.get("userName");
        console.log("NgEditUser userName", this.userName);
        if (this.userName) {
          this.editMode = true;
          this.screenTitle = 'Update User';
          this.screenAction = 'Update User';
          this.loadData();
        }
      } else {
        //Do redirect back
        //this.authService.redirectToErrorPage();
      }
    });
  }

  public loadData() {
    this.loading = true;
    if (this.userName) {
      if (navigator.onLine) {
        this.authService.getFullProfile(this.userName, this.authData.token).subscribe(
          (data) => {
            console.log("NgViewUser Dummy API", data);
            this.loading = false;
            if (data) {
              this.userDetail = data;
              this.authForm.patchValue({
                firstName: this.userDetail.firstName,
                lastName: this.userDetail.lastName,
                email: this.userDetail.email,
                mobile: this.userDetail.mobile,
                city: this.userDetail.city,
                country: this.userDetail.country,
                linkedinUrl: this.userDetail.profile?.linkedinUrl,
                techRoleId: this.userDetail.techRoleId,
                yearsExperience: this.userDetail.yearsExperience,
              });
              if (this.userDetail.techRoleId) {
                // patchValue above already fired the techRoleId valueChanges
                // subscription (→ onTechRoleChange(), populating availableTracks
                // and resetting certificationTrackId to null) — restore the
                // saved track now; the async fetch only enables the control,
                // it doesn't touch the value once resolved.
                this.authForm.get('certificationTrackId')?.setValue(this.userDetail.certificationTrackId);
              }
              if (this.isAdminViewer) {
                this.authForm.get('status')?.setValue(this.userDetail.accountStatus);
              }
              if (this.editBlockedForViewer) {
                this.authForm.disable();
              }
              console.log("NgEditUser userDetail", this.userDetail);
            } else {
              //this.noDataView = true;
              console.log("NgEditUser Dummy API Failure", data);
            }
          },
          (error: HttpErrorResponse) => {
            this.loading = false;
            //this.authService.redirectToErrorPage();
            console.log("NgEditUser API Error", error.name + " " + error.message);
          }
        );
      } else {
        this.snackbar.display("snackbar-danger", "Error loading user details.", "bottom", "center");
      }
    }
  }

  onSubmit() {
    if (this.editBlockedForViewer) {
      this.snackbar.display("snackbar-danger", "You do not have permission to edit an active user's profile.", "bottom", "center");
      return;
    }
    this.submitted = true;
    this.loadingTxt = 'Please wait';
    if (this.authForm.invalid) {
      this.snackbar.display("snackbar-danger", "Please re-check your submission.", "bottom", "center");
      this.submitted = false;
      return;
    } else {
      let postData = {
        firstName: this.authForm.get('firstName')?.value,
        lastName: this.authForm.get('lastName')?.value,
        email: this.authForm.get('email')?.value,
        mobile: this.authForm.get('mobile')?.value,
        city: this.authForm.get('city')?.value,
        country: this.authForm.get('country')?.value,
        techRoleId: this.authForm.get('techRoleId')?.value,
        certificationTrackId: this.authForm.get('certificationTrackId')?.value,
        yearsExperience: this.authForm.get('yearsExperience')?.value,
        flow: 'UserRegistration',
        ...(this.authForm.get('linkedinUrl')?.value && { linkedinUrl: this.authForm.get('linkedinUrl')?.value }),
        ...(this.isAdminViewer && { status: this.authForm.get('status')?.value }),
      };
      let createUpdateCall: Observable<any>;
      if (this.editMode) {
        this.loadingTxt = 'Updating User Details';
        createUpdateCall = this.authService.updateUserAccount(this.authData.token, this.userDetail.id, postData);
      } else {
        this.loadingTxt = 'Creating User Account';
        createUpdateCall = this.authService.register(postData);
      }
      createUpdateCall.subscribe((res) => {
        this.submitted = false;
        if (res) {
          if (!res.error && res.data) {
            this.router.navigate(['/users/list']).then(() => {
              this.snackbar.display("snackbar-success", "User account " + (this.editMode ? "updated" : "created") + " successfully.", "bottom", "center");
            });
          } else {
            if (res.message) {
              this.snackbar.display("snackbar-danger", res.message, "bottom", "center");
            }
          }
        } else {
          this.error = "Server Error. Please check your connection and try again.";
          this.snackbar.display("snackbar-danger", this.error, "bottom", "center");
          this.submitted = false;
        }
      },
        (error) => {
          this.error = error;
          this.submitted = false;
          this.error = "Error connecting to server. Please try again.";
          this.snackbar.display("snackbar-danger", this.error, "bottom", "center");
        }
      );
    }
  }

  ngOnDestroy(): void {
  }
}
