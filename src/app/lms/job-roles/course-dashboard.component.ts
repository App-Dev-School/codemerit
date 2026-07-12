import { Component, OnInit } from '@angular/core';
import { Direction } from '@angular/cdk/bidi';
import { CommonModule } from '@angular/common';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService, User } from '@core';
import { AuthConstants } from '@config/AuthConstants';
import { Course, Subject } from '@core/models/subject-role';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { fadeInAnimation } from '@shared/animations';
import { QuizCreateComponent } from '@shared/components/quiz-create/quiz-create.component';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { SetDesignationBottomSheetComponent } from './confirm-course-enroll.component';
import { CertificateModel } from '@shared/components/certificate/certificate.model';
import { certificateModels } from '../../pages/welcome/welcome.component';
import { CertificateComponent } from '@shared/components/certificate/certificate.component';
import { MeritListWidgetComponent } from '@shared/components/merit-list-widget/merit-list-widget.component';
import { MatIconModule } from '@angular/material/icon';
import { CertTrackComponent } from '@shared/components/cert-track/cert-track.component';
import { JobCurriculumComponent } from '@shared/components/job-curriculum/job-curriculum.component';
import { JourneyLocatorComponent } from '@shared/components/journey-locator/journey-locator.component';

@Component({
  selector: 'app-course-dashboard',
  templateUrl: './course-dashboard.component.html',
  styleUrls: ['./course-dashboard.component.scss'],
  animations: [fadeInAnimation],
  imports: [
    CommonModule,
    MeritListWidgetComponent,
    CertificateComponent,
    MatIconModule,
    CertTrackComponent,
    JobCurriculumComponent,
    JourneyLocatorComponent
  ]
})
export class CourseDashboardComponent implements OnInit {
  pageTitle = 'ViewCourse';
  loading = true;
  loadingText = '';
  userData: User;
  showContent = true;
  course = "";
  courseItem: Course;
  otherSubjects: Subject[] = [];
  courseData: any[];
  showSubjectAction = false;
  certificateModels: CertificateModel[] = [];

  // Master tab bar above the Curriculum Roadmap — controls which single section renders below it.
  detailTab: 'curriculum' | 'certifications' | 'endorsements' | 'overview' = 'curriculum';
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
    private snackService: SnackbarService
  ) {
    console.log(this.pageTitle, "User ", this.authService.currentUser);
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
      } 
      // else {
      //   //get this from server
      //   this.master.fetchJobRoleSubjectMapping().subscribe((data: any) => {
      //     console.log(this.pageTitle, "onCourseChange fetchJobRoleSubjectMapping", data);
      //     if (data && data.length > 0) {
      //       //const allJobRoles = data;
      //       this.filterCourse(data);
      //     }
      //   });
      // }

      //this is causing infinite loop, need to optimize
      //this.fetchCourseData();
    }
  }

  get totalTracks(): number {
    if (!this.courseData?.length) return 0;
    return this.courseData.reduce((sum: number, s: any) => sum + (s.subjectTracks?.length ?? 0), 0);
  }

  setDetailTab(tab: 'curriculum' | 'certifications' | 'endorsements' | 'overview'): void {
    this.detailTab = tab;
  }

  // Weighted-equal average coverage across subjects — used by the compact "enrolled" hero.
  get overallCoverage(): number {
    if (!this.courseData?.length) return 0;
    const total = this.courseData.reduce((sum: number, s: any) => sum + (s.coverage || 0), 0);
    return Math.round(total / this.courseData.length);
  }

  get totalQuestions(): number {
    if (!this.courseData?.length) return 0;
    return this.courseData.reduce((sum: number, s: any) => sum + (s.numTrivia || s.numQuestions || 0), 0);
  }

  // Aggregated across every subject in this job role — relocated here from
  // JobCurriculumComponent, which now only ever renders curriculum content.
  // `endorsements` isn't a confirmed API field yet, so subjects without it fall
  // back to the same sample data as before; swap this out once the backend sends it.
  get endorsements(): any[] {
    if (!this.courseData?.length) return [];
    return this.courseData.reduce((all: any[], subject: any) => {
      const list = subject?.endorsements !== undefined ? subject.endorsements : this.mockEndorsements(subject);
      return all.concat(list.map((e: any) => ({ ...e, subjectTitle: subject.title })));
    }, []);
  }

  private mockEndorsements(subject: any): any[] {
    const title = subject?.title || 'this subject';
    return [
      {
        id: `${subject?.id}-e1`, raterName: 'Kunal Anand', raterTitle: 'Senior Architect · CodeMerit',
        raterAvatar: '', rating: 4.5, grade: 'Excellent', ratingType: 'INTERVIEW',
        notes: `Demonstrated a strong working knowledge of ${title}, with clear and structured answers throughout the technical round.`,
        interviewDate: 'Interviewed May 2026',
      },
    ];
  }

  requestEndorsement(): void {
    this.snackService.display('snackbar-dark', 'Endorsement requests are coming soon.', 'bottom', 'center');
  }

  fetchCourseData() {
    this.master.fetchCourseDetail(this.course).subscribe((data: any) => {
      if (data) {
        // Handle new API shape { jobRole, subjects } as well as legacy flat array
        const subjects: any[] = Array.isArray(data) ? data : (data?.subjects ?? []);
        this.courseData = subjects;

        if (!Array.isArray(data) && data?.jobRole) {
          this.courseItem = { ...this.courseItem, ...data.jobRole };
        }

        if (this.courseData?.length > 0) {
          this.otherSubjects = this.courseData.filter(s => !((s.attempted ?? 0) > 0));
        }
        setTimeout(() => { this.loading = false; }, 1500);
      }
    }, (_err: any) => {
      this.loading = false;
      this.snackService.display('snackbar-dark', 'Error loading program details.', 'bottom', 'center');
    });
  }

  // Visitors browsing this page anonymously have no token to enroll/create-quiz with -
  // send them to sign in first and bring them straight back to this program page after.
  private requireSignIn(): boolean {
    if (this.authService.currentUserValue?.id && this.authService.currentUserValue?.token) {
      return true;
    }
    localStorage.setItem(AuthConstants.REDIRECT_URL, this.router.url);
    this.router.navigate(['/authentication/signin']);
    return false;
  }

  onSubscribe(course: any) {
    //this.onSubscribe.emit(course);
    console.log("onSubscribe Course", course);
    if (!this.requireSignIn()) return;
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

  openSelectSubject(): void {
    this.router.navigate(['/select-subject'], { queryParams: { returnUrl: this.router.url } });
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
    if (!this.requireSignIn()) return;
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
      backdropClass: 'quiz-blur-backdrop',
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
    this.router.navigate(['/select-job-role']);
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

  // Real quiz launch (not a stub) — prefers a subject already in progress, else the first
  // subject in this job role, and opens the same quiz-creation flow used from the roadmap.
  startQuickQuiz(): void {
    if (!this.courseData?.length) {
      this.snackService.display('snackbar-dark', 'No subjects available yet for a quiz.', 'bottom', 'center');
      return;
    }
    const target = this.courseData.find((s: any) => (s.attempted || 0) > 0) || this.courseData[0];
    this.openQuizLauncher(target);
  }

  onViewCertificate(cert: CertificateModel) {
    this.snackService.display('snackbar-dark', 'Certificate #' + cert.certificateNumber + ' earned!', 'bottom', 'center');
  }

  isJobEnrolled(userId: number, jobId: number): boolean {
    if (userId && jobId) {
      // Implement logic to check if user is enrolled in the job
      const enrolledJobs = this.authService.getUserJobRoles();
      return enrolledJobs.some(job => job.userId === userId && job.jobRoleId === jobId);
    }
    return false;
  }
}