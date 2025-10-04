import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TopicsListComponent } from '@shared/components/topics-listing/topics-list.component';

import { Direction } from '@angular/cdk/bidi';
import { AsyncPipe, JsonPipe, NgStyle, NgTemplateOutlet } from '@angular/common';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService } from '@core';
import { Subject } from '@core/models/subject';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { fadeInAnimation, slideInOutAnimation } from '@shared/animations';
import { GoalPathComponent } from '@shared/components/goal-path/goal-path.component';
import { MeritListWidgetComponent } from '@shared/components/merit-list-widget/merit-list-widget.component';
import { QuizCreateComponent } from '@shared/components/quiz-create/quiz-create.component';
import { RecentCommentsComponent } from '@shared/components/recent-comments/recent-comments.component';
import { SubjectPerformanceCardComponent } from '@shared/components/subject-performance/subject-performance-card.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { Observable, of } from 'rxjs';
import { TopicItem } from 'src/app/admin/topics/manage/topic-item.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [slideInOutAnimation, fadeInAnimation],
  imports: [
    NgTemplateOutlet,
    MatTabsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatTooltipModule,
    NgScrollbar,
    MatChip, MatChipSet,
    TopicsListComponent,
    MeritListWidgetComponent,
    RecentCommentsComponent,
    SubjectPerformanceCardComponent,
    GoalPathComponent
  ]
})
export class DashboardComponent implements OnInit {
  pageTitle = 'SubjectDashboard';
  loading = true;
  loadingText = 'Loading Subject Dashboard';
  showContent = true;
  subject = "";
  subjectData: any;
  currentSubject: any;
  subjectTopics$: Observable<any>;
  nextAction: string = 'Assess Your Skills';
  achievements = [
    {
      name: 'Redux Star',
      message: 'You earned the Redux Star badge.',
      timestamp: '7 hours ago',
      imgSrc: 'assets/images/icons/badges/genius.png',
      colorClass: 'col-green',
    },
    {
      name: 'UpSkillr',
      message: 'Vallentina earned the UpSkillr badge for completeting JavaScript Assessment.',
      timestamp: '3 days ago',
      imgSrc: 'assets/images/icons/badges/upskillr.png',
      colorClass: 'color-primary col-indigo',
    },
    {
      name: 'Problem Solver',
      message: 'You earned the Problem Solver badge for Frontend Mock Interview.',
      timestamp: 'Yesterday',
      imgSrc: 'assets/images/icons/badges/solver.png',
      colorClass: 'color-info col-orange',
      noBorder: true,
    },
    {
      name: 'JavaScript Basic Aware',
      message: 'You earned the JavaScript Basic Aware badge.',
      timestamp: '1 hour ago',
      imgSrc: 'assets/images/icons/badges/genius.png',
      colorClass: 'color-primary col-red',
    },
    {
      name: 'Verified',
      message: 'Congrats! You are now a Verified member.',
      timestamp: '1 hour ago',
      imgSrc: 'assets/images/icons/badges/verified.png',
      colorClass: 'color-primary col-red',
    }
  ];

  constructor(private master: MasterService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthService,
    private snackService: SnackbarService
  ) {
    console.log(this.pageTitle, "User", this.authService.currentUserValue);
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Animation trigger can be based on route change
        this.showContent = false; // Hide content when navigation starts
      }

      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        // Ensure content is shown when navigation is complete
        this.showContent = true;
      }
    });
    this.takeRouteParams();
    setTimeout(() => {
      this.loading = false;
    }, 3800);
  }

  generateRandomLabels() {
    if (Math.random() < 0.3) {
      this.nextAction = 'Challenge Yourself';
    } else {
      if (Math.random() > 0.7) {
        this.nextAction = 'Explore ' + this.currentSubject?.title + ' Mastery';
      } else {
        this.nextAction = 'Test Your Skills';
      }
    }
  }

  takeRouteParams() {
    const subject = this.route.snapshot.paramMap.get('subject');
    console.log(this.pageTitle, "route.snapshot", "Keep paramMap ##", subject);
    if (subject) {
      this.subject = subject;
      this.onSubjectChange(this.subject);
    }
    // this.route.paramMap.subscribe(params => {
    //   if (params.get("subject")) {
    //     this.subject = params.get("subject");
    //     if (this.subject) {
    //       this.onSubjectChange(this.subject);
    //     }
    //   } else {
    //     this.subject = "";
    //   }
    //   console.log(this.pageTitle, "@RouteParam changed =>", this.subject);
    // });
  }

  onSubjectChange(subject: string) {
    //check for master data presence
    if (!this.master.subjects || !this.master.topics || !this.master.jobRoles) {
      console.log(this.pageTitle, "^^^ NO MASTER DATA FOUND ^^^", subject);
      //this.master.fetchMasterDataFromAPI();
    }
    this.subject = subject ? subject : "";
    if (this.subject) {
      //fetch this subject details
      this.currentSubject = this.master.subjects.find(subjectItem => subjectItem.slug === this.subject);
      console.log(this.pageTitle, "#1 @currentSubject", this.currentSubject);
      if (this.currentSubject && this.currentSubject.id) {
        this.generateRandomLabels();
        //fetch this subject topics from topics master
        let subjectTopics = this.master.topics;
        subjectTopics = subjectTopics.filter(topic => topic.subjectId == this.currentSubject.id);
        this.subjectTopics$ = of(subjectTopics);
        console.log(this.pageTitle, "#2 @subjectTopics", subjectTopics);
        //this.subjectTopics$ = of(subjectTopics);
        //fetch the subject dashboard
        this.loading = true;
        this.master
          .fetchSubjectDashboard(this.currentSubject.slug)
          .subscribe({
            next: (response) => {
              //console.log(this.pageTitle, '#3 SubjectDashAPI Response:', response);
              if (response) {
                this.subjectData = response.data;
                console.log(this.pageTitle, '@subjectData:', this.subjectData);
                console.log(this.pageTitle, '@syllabus:', this.subjectData?.syllabus);
              }
              setTimeout(() => {
                this.loading = false;
              }, 3000);
            },
            error: (error) => {
              this.loading = false;
              console.error(this.pageTitle, '#3 SubjectDashAPI Error:', error);
            },
          });
      }
    }
  }

  onSubscribe(subject: string) {
    console.log("LearnerDashoard onSubscribe", subject);
    this.snackService.display('snackbar-dark', subject + ' changeNAME', 'bottom', 'center');
  }

  viewMeritList() {
    this.snackService.display('snackbar-dark', 'Top Performers appear in the Merit List.', 'bottom', 'center');
  }

  exploreSubject(subject: any) {
    alert("exploreSubject full");
  }

  async enrollSubject(subject: any) {
    this.loadingText = "Adding " + this.currentSubject.title + " to your learning profile.";
    this.loading = true;
    this.master
      .enrollSubjects([this.currentSubject.id])
      .subscribe({
        next: (response) => {
          console.log(this.pageTitle, 'enrollSubject response:', response);
          //this.submitted = false;
          if (response && !response.error) {
            const enrollResult = response?.data;
            console.log(this.pageTitle, "Subject Enrolled Response", enrollResult);
            //this.subjectData.isSubscribed = true;
            if (enrollResult && enrollResult !== '') {
              setTimeout(() => {
                this.subjectData = {
                  ...this.subjectData,
                  isSubscribed: true
                };
                //this.cdRef.markForCheck();
                this.snackService.display('snackbar-success', 'Congrats for the beginning. Start Deep Diving ' + this.currentSubject.title + '!', 'bottom', 'center');
                this.loading = false;
              }, 2000);
            }
          } else {
            this.loading = false;
            this.snackService.display('snackbar-dark', this.currentSubject.title + ' added.' + response.message, 'bottom', 'center');
          }
        },
        error: (error) => {
          this.loading = false;
          this.snackService.display('snackbar-dark', 'Error enrolling subject. Please try again.', 'bottom', 'center');
          console.error('Enroll Subject API Error:', error);
        },
      });
  }

  goToSubjects() {
    this.router.navigate(['/app/select-subject']);
  }

  //keep any one
  async launchSubjectQuiz(subject: Subject) {
    this.launchQuiz(subject.title+' Quiz', subject.id, null);
  }

   async launchQuiz(title: string, subject: number, topic: number) {
    let varDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      varDirection = 'rtl';
    } else {
      varDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(QuizCreateComponent, {
      width: '60vw',
      height: 'auto',
      minWidth: '344px',
      data: {
        title: title,
        subject: subject,
        topic: topic,
        source: 'Subject'
       },
      direction: varDirection,
      autoFocus: false,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((quizUniqueSlug) => {
      if (quizUniqueSlug) {
        console.log("QuizCreateScreen quizUniqueSlug", quizUniqueSlug);
        this.router.navigate(['quiz/take', quizUniqueSlug]);
      }
    });
  }

  onTopicExplore(subjectName: string) {
    //In dev
    this.router.navigate(["learn/topic/angular17"]);
  }

  onTopicQuiz(topic: TopicItem) {
    if(topic && topic.id){
      this.launchQuiz(topic.title+' Quiz', null, topic.id);
    }else{
      this.launchSubjectQuiz(this.currentSubject);
    }
  }

  onCertificateDownload() {
    this.snackService.display('snackbar-dark', 'Please complete your milestones to unlock the digital certificate.', 'bottom', 'center');
  }

   onScheduleMockInt() {
    this.snackService.display('snackbar-dark', 'Feature coming soon.', 'bottom', 'center');
  }
}
