import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { AuthService } from '@core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { SetDesignationBottomSheetComponent } from 'src/app/pages/view-course/confirm-course-enroll.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-course',
  templateUrl: './select-course.component.html',
  styleUrls: ['./select-course.component.scss'],
  animations: [
    trigger('overlayFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('420ms ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('360ms ease', style({ opacity: 0 })),
      ]),
    ]),
    trigger('panelSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(48px)' }),
        animate('680ms cubic-bezier(0.2,0.8,0.2,1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('480ms cubic-bezier(0.2,0,0.2,1)', style({ opacity: 0, transform: 'translateY(48px)' })),
      ]),
    ]),
  ],
  imports: [
    FormsModule,
    CoursePickerComponent,
  ],
})
export class SelectCourseComponent implements OnInit, OnDestroy {
  @Input() actionMode: 'view' | 'enroll' | 'skill-rating' = 'view';
  showContent = true;
  subject = '';
  searchQuery = '';
  isLoading = false;
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
          if (!stayingHere) this.showContent = false;
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
          if (event.url.startsWith('/select-job-role')) this.showContent = true;
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
    this.subject = subject ?? '';
    if (this.actionMode === 'skill-rating') {
      this.router.navigate(['/assessment/skill-rating', this.subject]);
    } else {
      this.router.navigate(['/app/program', this.subject]);
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
