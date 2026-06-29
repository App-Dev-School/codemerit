import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { AuthService } from '@core';
import { slideInOutAnimation, topToBottomAnimation } from '@shared/animations';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { SetDesignationBottomSheetComponent } from 'src/app/pages/view-course/confirm-course-enroll.component';
import { Subscription } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-select-course',
  templateUrl: './select-course.component.html',
  styleUrls: ['./select-course.component.scss'],
  animations: [slideInOutAnimation, topToBottomAnimation],
  imports: [
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CoursePickerComponent,
  ],
})
export class SelectCourseComponent implements OnInit, OnDestroy {
  @Input() actionMode: 'view' | 'enroll' | 'skill-rating' = 'view';
  showContent = true;
  subject = '';
  subjectData: any;
  isLoading = false;
  loadingTxt = '';
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
          // Only hide (trigger exit animation) when navigating AWAY from this component
          const stayingHere = event.url.startsWith('/select-job-role');
          if (!stayingHere) {
            this.showContent = false;
          }
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
          // Only restore visibility when the final URL is still this component
          if (event.url.startsWith('/select-job-role')) {
            this.showContent = true;
          }
          // When navigating away: leave showContent = false so the exit animation plays out
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

  onCourseChange(subject: string) {
    this.subject = subject ? subject : '';
    if (this.actionMode === 'skill-rating') {
      this.router.navigate(['/assessment/skill-rating', this.subject]);
    } else {
      this.router.navigate(['/app/program', this.subject]);
    }
  }

  onSubscribe(subject: any) {
    this._bottomSheet.open(SetDesignationBottomSheetComponent, {
      data: subject,
    });
  }

  onCancel() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const isSafeReturn = returnUrl && !returnUrl.startsWith('/select-job-role');
    if (isSafeReturn) {
      this.router.navigateByUrl(returnUrl, { replaceUrl: true });
      return;
    }
    // Only go to dashboard if the user already has job roles —
    // otherwise the dashboard would immediately redirect back here (loop).
    const hasJobRoles = (this.authService.getUserJobRoles()?.length ?? 0) > 0;
    this.router.navigate([hasJobRoles ? '/dashboard' : '/app/welcome'], { replaceUrl: true });
  }
}
