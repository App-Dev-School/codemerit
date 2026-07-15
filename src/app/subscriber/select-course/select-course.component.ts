import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { AuthService } from '@core';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { SetDesignationBottomSheetComponent } from 'src/app/lms/job-roles/confirm-course-enroll.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-course',
  templateUrl: './select-course.component.html',
  styleUrls: ['./select-course.component.scss'],
  imports: [
    CoursePickerComponent,
  ],
})
export class SelectCourseComponent implements OnInit, OnDestroy {
  @Input() actionMode: 'view' | 'enroll' | 'skill-rating' = 'view';

  /** Drives the picker's own slide-in/out — false just before we navigate away
      so its :leave animation plays instead of the route swap cutting it off. */
  open = true;
  subject = '';
  userJobRoles: number[] = [];
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _bottomSheet: MatBottomSheet,
    public authService: AuthService,
  ) {}

  ngOnInit() {
    this.syncUserJobRoles();

    this.subscriptions.add(
      this.authService.currentUser.subscribe((user) => {
        const roles = user?.userJobRoles;
        this.userJobRoles = Array.isArray(roles)
          ? roles.map((r: any) => r.jobRoleId)
          : [];
      }),
    );

    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          const stayingHere = event.url.startsWith('/select-job-role');
          if (!stayingHere) this.open = false;
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
          if (event.url.startsWith('/select-job-role')) this.open = true;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private syncUserJobRoles(): void {
    const currentUserRoles = this.authService.currentUserValue?.userJobRoles;
    const cachedRoles = this.authService.getUserJobRoles();
    const roles =
      Array.isArray(currentUserRoles) && currentUserRoles.length
        ? currentUserRoles
        : cachedRoles;
    this.userJobRoles = Array.isArray(roles)
      ? roles.map((r: any) => r.jobRoleId)
      : [];
  }

  onCourseChange(job: any) {
    this.subject = job?.slug ?? '';
    if (!this.subject) return;
    if (this.actionMode === 'skill-rating') {
      this.router.navigate(['/assessment/skill-rating', this.subject]);
    } else {
      this.router.navigate(['/jobRole', this.subject]);
    }
  }

  onSubscribe(subject: any) {
    this._bottomSheet.open(SetDesignationBottomSheetComponent, { data: subject });
  }

  onCancel() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const isSafeReturn = returnUrl && !returnUrl.startsWith('/select-job-role');
    if (isSafeReturn) {
      this.router.navigateByUrl(returnUrl, { replaceUrl: true });
      return;
    }
    const hasJobRoles = (this.authService.getUserJobRoles()?.length ?? 0) > 0;
    this.router.navigate([hasJobRoles ? '/dashboard' : '/app/welcome'], { replaceUrl: true });
  }
}
