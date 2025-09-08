import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

import { Direction } from '@angular/cdk/bidi';
import { AsyncPipe, JsonPipe, NgClass } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService, User } from '@core';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { fadeInAnimation, slideInOutAnimation } from '@shared/animations';
import { CongratulationsCardComponent } from '@shared/components/congratulations-card/congratulations-card.component';
import { CourseProgressComponent } from '@shared/components/course-progress/course-progress.component';
import { MedalCardComponent } from '@shared/components/medal-card/medal-card.component';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { Observable } from 'rxjs';
import { Subject } from '@core/models/subject';
import { QuizCreateModel } from '@core/models/dtos/GenerateQuizDto';
import { QuizService } from 'src/app/quiz/quiz.service';
import { JobRole } from '@core/models/subject-role';
import { SubjectTrackerCardComponent } from '@shared/components/subject-tracker-card/subject-tracker-card.component';

@Component({
  selector: 'app-course-dashboard',
  templateUrl: './course-dashboard.component.html',
  styleUrls: ['./course-dashboard.component.scss'],
  animations: [fadeInAnimation],
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    CongratulationsCardComponent,
    MedalCardComponent,
    SubjectTrackerCardComponent,
    CoursePickerComponent,
    CourseProgressComponent
  ]
})
export class CourseDashboardComponent implements OnInit {
  loading = true;
  loadingText = 'Loading your Dashboard';
  generatingQuiz = false;
  userData: Observable<User>;
  showContent = true;
  course = "";
  courseData: JobRole;
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
    public authService: AuthService,
    private quizService: QuizService,
    private snackService: SnackbarService
  ) {
    console.log("CourseDash User ", this.authService.currentUser);
    this.userData = this.authService.currentUser;
    //this.userData.profile = localStorage.getItem(AuthConstants.CACHE_FULL_PROFILE);
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.showContent = false; // Hide content when navigation starts
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.showContent = true;
      }
    });
    this.takeRouteParams();
    setTimeout(() => {
      this.loading = false;
    }, 2200);
  }

  takeRouteParams() {
    const course = this.route.snapshot.paramMap.get('course');
    console.log("CourseDash ParamMap course", course);
    if (course) {
      this.course = course;
      this.onCourseChange(course);
    }
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
    this.courseData = allJobRoles.find(role => role.slug === this.course);
    console.log("CourseDash Filter ****", this.courseData);
  }

  onCourseChange(course: string) {
    this.course = course ? course : "";
    console.log("CourseDash @1", course);
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
    }
  }

  onSubscribe(subject: string) {
    console.log("CourseDash onSubscribe", subject);
    this.snackService.display('snackbar-dark', subject + ' added to learning list!', 'bottom', 'center');
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

  async generateSubjectQuiz(topic: any) {
    console.log('QuizManager generateSubjectQuiz:', topic);
    this.loading = true;
    this.generatingQuiz = true;
    this.loadingText = "Generating Quiz";
    const payload = new QuizCreateModel();
    payload.userId = this.authService.currentUserValue.id
    payload.subjectIds = '' + topic.id;
    console.log('QuizManager Invoked with Subject:', payload);
    this.quizService
      .addQuiz(payload)
      .subscribe({
        next: (response) => {
          console.log('QuizManager CreateAPI response:', response);
          if (response && response?.slug) {
            const slug = response?.slug;
            if (slug && slug !== '') {
              setTimeout(() => {
                this.loading = false;
                this.router.navigate(['quiz/take', slug]);
                //this.generatingQuiz = false;
              }, 4000);
            }
          }
        },
        error: (error) => {
          console.error('QuizManager CreateAPI Error:', error);
          setTimeout(() => {
            this.loading = false;
            this.snackService.display('snackbar-dark', error, 'bottom', 'center');
          }, 2000);
        },
      });
  }

  goToCourses() {
    this.router.navigate(['/dashboard/select-job-role']);
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
}
