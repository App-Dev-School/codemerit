import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Direction } from '@angular/cdk/bidi';
import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService, User } from '@core';
import { Course } from '@core/models/subject-role';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { fadeInAnimation } from '@shared/animations';
import { CongratulationsCardComponent } from '@shared/components/congratulations-card/congratulations-card.component';
import { CourseProgressComponent } from '@shared/components/course-progress/course-progress.component';
import { MedalCardComponent } from '@shared/components/medal-card/medal-card.component';
import { QuizCreateComponent } from '@shared/components/quiz-create/quiz-create.component';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { SubjectTrackerCardComponent } from '@shared/components/subject-tracker-card/subject-tracker-card.component';
import { Observable, of } from 'rxjs';
import { QuizService } from 'src/app/quiz/quiz.service';
import { SetDesignationBottomSheetComponent } from './confirm-course-enroll.component';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-course-dashboard',
  templateUrl: './course-dashboard.component.html',
  styleUrls: ['./course-dashboard.component.scss'],
  animations: [fadeInAnimation],
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatTabsModule,
    NgTemplateOutlet,
    CongratulationsCardComponent,
    MedalCardComponent,
    SubjectTrackerCardComponent
  ]
})
export class CourseDashboardComponent implements OnInit {
  pageTitle = 'MainDashboard';
  loading = true;
  loadingText = 'Loading your Dashboard';
  //generatingQuiz = false;
  userData: User;
  showContent = true;
  course = "";
  courseItem: Course;
  courseData: any[];
  showSubjectAction = false;
  courseChartConfig = {
    showTitle: false,
    showSubtitle: false,
    showIcon: false,
    showLegend: false
  };
  //For displaying test data
  debugDisplay = false;
  constructor(private master: MasterService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    public authService: AuthService,
    private quizService: QuizService,
    private snackService: SnackbarService
  ) {
    console.log(this.pageTitle, "User ", this.authService.currentUser);
    this.userData = this.authService.currentUserValue;
    //this.userData.profile = localStorage.getItem(AuthConstants.CACHE_FULL_PROFILE);
  }

  ngOnInit() {
    this.authService.currentUser.subscribe((localUser: User) => {
      if (localUser && localUser.email && localUser.token) {
        this.userData = localUser;
        console.log('Course Dashboard user changed.', localUser);
        //this.snackService.display('snackbar-dark','Course Dashboard user changed.', 'bottom', 'center');
      }
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.showContent = false; // Hide content when navigation starts
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.showContent = true;
      }
    });
    this.takeRouteParams();
    // setTimeout(() => {
    //   this.loading = false;
    // }, 3333);
  }

  takeRouteParams() {
    const course = this.route.snapshot.paramMap.get('course');
    console.log(this.pageTitle, "RouteSnap course", course);
    if (course) {
      this.course = course;
    } else {
      if (this.authService.currentUserValue && this.authService.currentUserValue?.userDesignation != null) {
        this.course = this.authService.currentUserValue?.userDesignation?.slug;
        console.log(this.pageTitle, "RouteSnap course defaulted", this.course);
      } else {
        this.goToCourses();
      }
    }
    if (this.course)
      this.onCourseChange(this.course);
    // this.route.paramMap.subscribe(params => {
    //   console.log("CourseDash @RouteParam change detected =>", params.get("course"));
    //   if (params.get("course")) {
    //     this.course = params.get("course");
    //     if (this.course) {
    //       this.onCourseChange(this.course);
    //     }
    //   } else {
    //     this.course = "";
    //   }
    // });
  }

  filterCourse(allJobRoles: any) {
    //Display the job role map
    this.courseItem = allJobRoles.find(role => role.slug === this.course);
    console.log(this.pageTitle, "@CourseItem", this.courseItem);
  }

  onCourseChange(course: string) {
    this.course = course ? course : "";
    console.log(this.pageTitle, "onCourseChange", course);
    if (this.course) {
      //get this from a service first
      const allJobs = this.master.jobRoles;
      if (allJobs) {
        this.filterCourse(allJobs);
      } else {
        //get this from server
        this.master.fetchJobRoleSubjectMapping().subscribe((data: any) => {
          console.log("CourseDash #2 fetchJobRoleSubjectMapping", data);
          if (data && !data.error && data.data) {
            const allJobRoles = data.data;
            this.filterCourse(allJobRoles);
          }
        });
      }

      //we need list of all subjects in a course along with course details
      this.master.fetchCourseDashboard().subscribe((data: any) => {
        if (data) {
          this.courseData = data;
          setTimeout(() => {
            this.loading = false;
          }, 3000);
        }
      }, (err: any) => {
        this.loading = false;
        this.snackService.display('snackbar-dark', 'Error loading Course Dashboard.', 'bottom', 'center');
      });
    }
  }

  onSubscribeAAA(subject: string) {
    console.log("CourseDash onSubscribe", subject);

    this.snackService.display('snackbar-dark', subject + ' added to learning list ++', 'bottom', 'center');
  }

  onSubscribe(course: any) {
    //this.onSubscribe.emit(course);
    console.log("onSubscribe Course", course);
    this._bottomSheet.open(SetDesignationBottomSheetComponent, {
      data: this.courseItem
    });
  }

  viewMeritList() {
    this.snackService.display('snackbar-dark', 'Only Top 5 members are listed currently.', 'bottom', 'center');
  }

  goToSubjects() {
    console.log("CourseDash goToSubjects", this.course);
    this.router.navigate(['/dashboard', this.course]);
    this.snackService.display('snackbar-dark', 'Switched to ' + this.course + ' Dash', 'bottom', 'center');
  }

  launchSubject(item: any) {
    if (item && item.id) {
      const selectedSubject = this.master.subjects.find(sub => sub.id === item?.id);
      if (selectedSubject && selectedSubject.slug)
        this.router.navigate(['/dashboard/learn', selectedSubject?.slug]);
    }
  }

  openQuizLauncher(data?: any) {
    console.log("QuizStartScreen openDialog", data);
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(QuizCreateComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog',
      data: {
        title: data?.title + ' Quiz',
        subject: data?.id,
        topic: null,
        source: 'Course'
      },
      direction: varDirection,
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((quizUniqueSlug) => {
      this.loadingText = "Just a moment";
      this.loading = false;
      if (quizUniqueSlug) {
        console.log("QuizCreateScreen quizUniqueSlug", quizUniqueSlug);
        this.router.navigate(['quiz/take', quizUniqueSlug]);
      }
    });
  }

  goToCourses() {
    this.router.navigate(['/app/select-job-role']);
  }

   viewProfile() {
    this.router.navigate(['/users/profile']);
  }

  openCourseLauncher(action: 'default' | 'custom', data?: any) {
    console.log("CourseDash openDialog", action, data);
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(CoursePickerComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      panelClass: 'full-screen-dialog',
      data: { topicItem: data, action },
      direction: varDirection,
      autoFocus: false,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("CoursePicker close result", result);
        const action = 'add';
        this.onCourseChange(result);
        // this.showNotification(
        //   action === 'add' ? 'snackbar-success' : 'black',
        //   `Record ${action === 'add' ? 'Add' : 'Edit'} Successfully.`,
        //   'bottom',
        //   'center'
        // );
      }
    });
  }

  //implement for subjects
  launchSubjectExplorer(subject: any) {
    console.log("View Path clicked:", subject);
    if (subject && subject.slug)
      this.router.navigate(['/dashboard/learn', subject?.slug]);
  }

  /**
   * Filter subjects that have been attempted (item.attempted > 0)
   * Used for "In Progress" tab
   */
  getAttemptedSubjects(): any[] {
    if (!this.courseData || this.courseData.length === 0) {
      return [];
    }
    return this.courseData.filter(item => item.attempted && item.attempted > 0);
  }

  /**
   * Filter subjects that have not been attempted (item.attempted === 0 or undefined)
   * Used for "To Start" tab
   */
  getNotAttemptedSubjects(): any[] {
    if (!this.courseData || this.courseData.length === 0) {
      return [];
    }
    return this.courseData.filter(item => !item.attempted || item.attempted === 0);
  }
}