import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { register } from 'swiper/element/bundle';
import { Direction } from '@angular/cdk/bidi';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService, User } from '@core';
import { Course, Subject } from '@core/models/subject-role';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { fadeInAnimation } from '@shared/animations';
import { CongratulationsCardComponent } from '@shared/components/congratulations-card/congratulations-card.component';
import { MedalCardComponent } from '@shared/components/medal-card/medal-card.component';
import { QuizCreateComponent } from '@shared/components/quiz-create/quiz-create.component';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { SubjectTrackerCardComponent } from '@shared/components/subject-tracker-card/subject-tracker-card.component';
import { QuizService } from 'src/app/quiz/quiz.service';
import { SetDesignationBottomSheetComponent } from './confirm-course-enroll.component';
import { CertificateModel } from '@shared/components/certificate/certificate.model';
import { certificateModels } from '../welcome/welcome.component';
import { CertificateComponent } from '@shared/components/certificate/certificate.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MeritListWidgetComponent } from '@shared/components/merit-list-widget/merit-list-widget.component';

@Component({
  selector: 'app-view-course',
  templateUrl: './view-course.component.html',
  styleUrls: ['./view-course.component.scss'],
  animations: [fadeInAnimation],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatTabsModule,
    NgTemplateOutlet,
    CongratulationsCardComponent,
    MedalCardComponent,
    SubjectTrackerCardComponent,
    MeritListWidgetComponent,
    CertificateComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ViewCourseComponent implements OnInit, AfterViewInit {
  pageTitle = 'ViewCourse';
  loading = true;
  loadingText = '';
  userData: User;
  showContent = true;
  course = "";
  courseItem: Course;
  attemptedSubjects: Subject[] = [];
  otherSubjects: Subject[] = [];
  courseData: any[];
  showSubjectAction = false;
  courseChartConfig = {
    showTitle: false,
    showSubtitle: false,
    showIcon: false,
    showLegend: false
  };
  certificateModels: CertificateModel[] = [];
  @ViewChild('swiperEx') swiperRef!: ElementRef<any>;
  meritList: any[] = [
    {
      "id": 1,
      "name": "Vishal Kumar",
      "username": "vishal-kumar",
      "image": null,
      "designationName": null,
      "totalCorrect": 10,
      "totalWrong": 0,
      "totalAttempts": 10,
      "avgAccuracy": 100,
      "coverage": 4.6,
      "baseScore": 100,
      "score": 80.9,
      "rank": 1
    },
    {
      "id": 9,
      "name": "Sanika ",
      "username": "sanika",
      "image": null,
      "designationName": null,
      "totalCorrect": 10,
      "totalWrong": 0,
      "totalAttempts": 10,
      "avgAccuracy": 100,
      "coverage": 4.6,
      "baseScore": 100,
      "score": 80.9,
      "rank": 1
    },
    {
      "id": 6,
      "name": "Naman Jaiswal",
      "username": "naman-jaiswal",
      "image": null,
      "designationName": null,
      "totalCorrect": 50,
      "totalWrong": 5,
      "totalAttempts": 67,
      "avgAccuracy": 74.6,
      "coverage": 30.7,
      "baseScore": 73.1,
      "score": 64.6,
      "rank": 3
    },
    {
      "id": 19,
      "name": "Carolin ",
      "username": "carolin",
      "image": null,
      "designationName": null,
      "totalCorrect": 10,
      "totalWrong": 10,
      "totalAttempts": 20,
      "avgAccuracy": 50,
      "coverage": 9.2,
      "baseScore": 40,
      "score": 33.8,
      "rank": 4
    },
    {
      "id": 5,
      "name": "Jyoti Kumari",
      "username": "anumpam-singh",
      "image": null,
      "designationName": null,
      "totalCorrect": 2,
      "totalWrong": 0,
      "totalAttempts": 10,
      "avgAccuracy": 20,
      "coverage": 4.6,
      "baseScore": 20,
      "score": 16.9,
      "rank": 5
    }
  ];

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
    register();
    this.userData = this.authService.currentUserValue;
    if (this.userData) {
      const userJobRoles = this.authService.getUserJobRoles();
      console.log(this.pageTitle, "ngOnInit ok", userJobRoles);
    }
  }

  ngOnInit() {
    this.certificateModels = certificateModels.filter(item => item.flag === 'angular');
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.showContent = false; // Hide content when navigation starts
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        this.showContent = true;
      }
    });
    this.takeRouteParams();
  }

  takeRouteParams() {
    const course = this.route.snapshot.paramMap.get('course');
    console.log(this.pageTitle, "Course", course);
    if (course) {
      this.course = course;
    } else {
      this.goToCourses();
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
    this.courseItem = allJobRoles.find(role => role.slug === this.course);
    console.log(this.pageTitle, "filterCourse > @CourseItem", this.courseItem);
    this.fetchCourseData();
  }

  onCourseChange(course: string) {
    this.course = course ? course : "";
    console.log(this.pageTitle, "onCourseChange", course);
    if (this.course) {
      //get this from a service first
      const allJobs = this.master.jobRoles;

      console.log(this.pageTitle, "onCourseChange checkingMaster", allJobs);
      if (allJobs) {
        console.log(this.pageTitle, "onCourseChange master exists");
        this.filterCourse(allJobs);
      } else {
        //get this from server
        this.master.fetchJobRoleSubjectMapping().subscribe((data: any) => {
          console.log(this.pageTitle, "onCourseChange fetchJobRoleSubjectMapping", data);
          if (data && data.length > 0) {
            //const allJobRoles = data;
            this.filterCourse(data);
          }
        });
      }

      //this is causing infinite loop, need to optimize
      //this.fetchCourseData();
    }
  }

  fetchCourseData() {
    this.master.fetchCourseDetail(this.course).subscribe((data: any) => {
      if (data) {
        console.log("getAttemptedSubjects 0", data);
        this.courseData = data;
        if (this.courseData && this.courseData.length > 0) {
          this.attemptedSubjects = this.courseData.filter(item => item.attempted && item.attempted > 0);
          this.otherSubjects = this.courseData.filter(item => !(item.attempted && item.attempted > 0));
        }
        setTimeout(() => {
          this.loading = false;
        }, 2000);
      }
    }, (err: any) => {
      this.loading = false;
      this.snackService.display('snackbar-dark', 'Error loading program details.', 'bottom', 'center');
    });
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

  ngAfterViewInit(): void {
    // Swiper is automatically initialized via web component
  }

  prevSlide(): void {
    const swiper = this.swiperRef?.nativeElement?.swiper;
    if (!swiper) return;
    swiper.slidePrev();
  }


  nextSlide(): void {
    const swiper = this.swiperRef?.nativeElement?.swiper;
    if (!swiper) return;
    swiper.slideNext();
  }

  takeQuiz() {
    this.snackService.display('snackbar-dark', 'Feature coming soon.', 'bottom', 'center');
  }
}