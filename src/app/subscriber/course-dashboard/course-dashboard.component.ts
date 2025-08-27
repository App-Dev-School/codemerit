import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';

import { Direction } from '@angular/cdk/bidi';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService, User } from '@core';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { slideInOutAnimation } from '@shared/animations';
import { CongratulationsCardComponent } from '@shared/components/congratulations-card/congratulations-card.component';
import { CourseProgressComponent } from "@shared/components/course-progress/course-progress.component";
import { MedalCardComponent } from '@shared/components/medal-card/medal-card.component';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { SubjectPerformanceCardComponent } from '@shared/components/subject-performance/subject-performance-card.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-course-dashboard',
  templateUrl: './course-dashboard.component.html',
  styleUrls: ['./course-dashboard.component.scss'],
  animations: [slideInOutAnimation],
  imports: [
    JsonPipe,
    AsyncPipe,
    BreadcrumbComponent,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    CongratulationsCardComponent,
    CourseProgressComponent,
    MedalCardComponent,
    CoursePickerComponent
  ]
})
export class CourseDashboardComponent implements OnInit {
  userData: Observable<User>;
  showContent = true;
  course = "";
  subjectData: any;
  jobSubjects$: Observable<any>;
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
    private snackService: SnackbarService
  ) {
    console.log("MyDash User ", this.authService.currentUser);
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
      //launch the course picker
    }, 4000);
  }

  takeRouteParams() {
    const course = this.route.snapshot.paramMap.get('course');
    console.log("MyDash ParamMap course", course);
    this.route.paramMap.subscribe(params => {
      console.log("MyDash @RouteParam change detected =>", params.get("subject"));
      if (params.get("subject")) {
        this.course = params.get("subject");
        if (this.course) {
          this.onCourseChange(this.course);
        }
      } else {
        this.course = "";
      }
    });
  }

  onCourseChange(course: string) {
    this.course = course ? course : "";
    console.log("MyDash @onCourseChange", course);
    if (this.course) {
      // this.master.fetchSubjectData(this.course).subscribe((subject) => {
      //   this.subjectData = subject;
      // });
      const jobRoles = this.master.jobRoles;
      console.log("MyDash #2 jobRoles", jobRoles);
      //this.jobSubjects$ = this.master.fetchAllSubjectTopics(this.course);
      //this.subjectTopics = this.master.getTopicsBySubject(this.resources, this.subject);
      //this.subjectTopics = this.subjectData.topics;
      //console.log("MyDash #2 jobSubjects", this.jobSubjects$);
    }
  }

  onSubscribe(subject: string) {
    console.log("MyDash onSubscribe", subject);
    this.snackService.display('snackbar-dark', subject + ' added to learning list!', 'bottom', 'center');
  }

  viewMeritList() {
    this.snackService.display('snackbar-dark', 'Only Top 3 members are listed currently.', 'bottom', 'center');
  }

  goToSubjects() {
    console.log("MyDash goToSubjects", this.course);
    this.router.navigate(['/dashboard', this.course]);
    this.snackService.display('snackbar-dark', 'Switched to ' + this.course + ' Dash', 'bottom', 'center');
  }

  openCourseLauncher(action: 'default' | 'custom', data?: any) {
    console.log("CoursePicker openDialog", action, data);
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

}
