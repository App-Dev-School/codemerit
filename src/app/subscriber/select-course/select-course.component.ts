import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { AuthService } from '@core';
import { topToBottomAnimation } from '@shared/animations';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { SetDesignationBottomSheetComponent } from 'src/app/pages/view-course/confirm-course-enroll.component';
import { Subscription } from 'rxjs';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-select-course',
  templateUrl: './select-course.component.html',
  styleUrls: ['./select-course.component.scss'],
  animations: [topToBottomAnimation],
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
  loading = false;
  loadingTxt = '';
  userJobRoles: number[] = [];
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
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
          // Animation trigger can be based on route change
          this.showContent = false; // Hide content when navigation starts
        }
        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel
        ) {
          // Ensure content is shown when navigation is complete
          this.showContent = true;
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
    console.log('CoursePickTest #2', subject);
    if (this.actionMode === 'view') {
      this.router.navigate(['/app/program', this.subject]).then(() => {
        console.log('Navigation completed!');
      });
    } else {
      if (this.actionMode === 'enroll') {
        this.router.navigate(['/app/program', this.subject]).then(() => {
          console.log('Navigation completed!');
        });
      }
      if (this.actionMode === 'skill-rating') {
        this.router
          .navigate(['/assessment/skill-rating', this.subject])
          .then(() => {
            console.log('Navigated to skill-rating!');
          });
      }
    }
  }

  onSubscribe(subject: any) {
    this._bottomSheet.open(SetDesignationBottomSheetComponent, {
      data: subject,
    });
  }
}
