import { Component, OnInit } from '@angular/core';
import { TopicsListComponent } from '@shared/components/topics-listing/topics-list.component';

import { Direction } from '@angular/cdk/bidi';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core';
import { Subject } from '@core/models/subject';
import { CertificationTrack, SubjectTrack } from '@core/models/subject-dashboard.model';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { fadeInAnimation, slideInOutAnimation } from '@shared/animations';
import { CertificationTracksComponent } from '@shared/components/certification-tracks/certification-tracks.component';
import { CertificateRibbonComponent } from '@shared/components/certificate-ribbon/certificate-ribbon.component';
import { MyCertificate, ScopedBadgeEntry } from '@core/models/gamification.model';
import { GoalPathComponent } from '@shared/components/goal-path/goal-path.component';
import { MeritListWidgetComponent } from '@shared/components/merit-list-widget/merit-list-widget.component';
import { QuizCreateComponent } from '@shared/components/quiz-create/quiz-create.component';
import { BadgeEarnedCardComponent } from '@shared/components/badge-earned-card/badge-earned-card.component';
import { SubjectPerformanceCardComponent } from '@shared/components/subject-performance/subject-performance-card.component';
import { SubjectTracksBoardComponent } from '@shared/components/subject-tracks-board/subject-tracks-board.component';
import { Observable, of } from 'rxjs';
import { TopicItem } from 'src/app/lms/topics/manage/topic-item.model';
import { SkillRatingWidgetComponent } from '@shared/components/skill-rating-widget/skill-rating-widget.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [slideInOutAnimation, fadeInAnimation],
  imports: [
    RouterLink,
    TopicsListComponent,
    MeritListWidgetComponent,
    BadgeEarnedCardComponent,
    SubjectPerformanceCardComponent,
    SkillRatingWidgetComponent,
    GoalPathComponent,
    SubjectTracksBoardComponent,
    CertificationTracksComponent,
    CertificateRibbonComponent,
  ]
})
export class DashboardComponent implements OnInit {
  pageTitle = 'SubjectDashboard';
  activeTab: string = 'milestones';
  loading = true;
  loadingText = 'Loading Subject Dashboard';
  showContent = true;
  subject = "";
  subjectData: any = null;
  currentSubject: any;
  subjectTopics$: Observable<any>;
  nextAction: string = 'Assess Your Skills';
  viewingCertificate: { certificate: MyCertificate; trackTitle: string } | null = null;

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
    // this.router.events.subscribe(event => {
    //   if (event instanceof NavigationStart) {
    //     // Animation trigger can be based on route change
    //     this.showContent = false; // Hide content when navigation starts
    //   }

    //   if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
    //     // Ensure content is shown when navigation is complete
    //     this.showContent = true;
    //   }
    // });
    this.takeRouteParams();
    setTimeout(() => {
      this.loading = false;
    }, 1000);
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
  }

  onSubjectChange(subject: string) {
    if (!this.master.subjects) {
      // Wait for master data before fetching subject details
      this.master.fetchMasterDataFromAPI().subscribe({
        next: (res: any) => {
          if (res && !res.error) {
            this.fetchSubjectData(subject);
          } else {
            this.subjectData = null;
            console.error(this.pageTitle, 'Failed to load master data for visitor.');
          }
        },
        error: () => {
          this.subjectData = null;
          console.error(this.pageTitle, 'Error loading master data for visitor.');
        }
      });
      return;
    }else{
      this.fetchSubjectData(subject);
    }
  }

  fetchSubjectData(subject:string){
    if (this.authService.currentUserValue) {
      this.fetchSubjectDetails(subject);
      return;
    } else {
      this.subject = subject ? subject : "";
    if (this.subject && this.master.subjects) {
      this.currentSubject = this.master.subjects.find(subjectItem => subjectItem.slug === this.subject);
      console.log(this.pageTitle, "Visitor requested @currentSubject", this.currentSubject);
    }
      this.fetchMockSubjectDetails(subject);
    }
  }

  fetchSubjectDetails(subject: string) {
    this.subject = subject ? subject : "";
    if (this.subject) {
      this.currentSubject = this.master.subjects.find(subjectItem => subjectItem.slug === this.subject);
      console.log(this.pageTitle, "#1 @currentSubject", this.currentSubject);
      if (this.currentSubject && this.currentSubject.id) {
        this.generateRandomLabels();
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
              }, 1000);
            },
            error: (error) => {
              this.loading = false;
              console.error(this.pageTitle, '#3 SubjectDashAPI Error:', error);
            },
          });
      }
    }
  }

  fetchMockSubjectDetails(subject: string) {
   this.master.fetchMockSubjectDashboard().subscribe({
        next: (response: any) => {
          if (response) {
                this.subjectData = response.data;
                console.log(this.pageTitle, 'Mock@subjectData:', this.subjectData);
                console.log(this.pageTitle, 'Mock@syllabus:', this.subjectData?.syllabus);
              } else {
            this.subjectData = null;
            console.error(this.pageTitle, 'Failed to load master data for visitor.');
          }
        },
        error: () => {
          this.subjectData = null;
          console.error(this.pageTitle, 'Error loading master data for visitor.');
        }
      });
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
    this.router.navigate(['/select-subject'], { queryParams: { returnUrl: this.router.url } });
  }

  get hasSubjectTracks(): boolean {
    return !!this.subjectData?.subjectTracks?.length;
  }

  get hasCertificationTracks(): boolean {
    return !!this.subjectData?.certificationTracks?.length;
  }

  get milestoneCount(): number {
    return this.hasSubjectTracks
      ? this.subjectData!.subjectTracks!.length
      : (this.subjectData?.syllabus?.length ?? 0);
  }

  get difficultyBreakdown(): { key: string; total: number; attempted: number; correct: number; wrong: number }[] {
    if (!this.subjectData) return [];
    const d = this.subjectData;
    const tiers = [
      { key: 'Easy',         total: d.numEasyTrivia || 0, attempted: d.attemptedEasy   || 0, correct: d.correctEasy   || 0, wrong: d.wrongEasy   || 0 },
      { key: 'Intermediate', total: d.numIntTrivia  || 0, attempted: d.attemptedMedium || 0, correct: d.correctMedium || 0, wrong: d.wrongMedium || 0 },
      { key: 'Advanced',     total: d.numAdvTrivia  || 0, attempted: d.attemptedHard   || 0, correct: d.correctHard   || 0, wrong: d.wrongHard   || 0 },
    ];
    return tiers.filter(t => t.total > 0);
  }

  get subjectSkillRatings(): any[] {
    return this.subjectData?.skillRatings ?? [];
  }

  // subjectDashboard embeds every badge scoped to this subject, each tagged `unlocked` and
  // already sortOrder-ordered by the backend (easiest first) — don't re-sort client-side.
  get subjectBadges(): ScopedBadgeEntry[] {
    return this.subjectData?.badges ?? [];
  }

  get earnedSubjectBadgeCount(): number {
    return (this.subjectData?.badges ?? []).filter((b: ScopedBadgeEntry) => b.unlocked).length;
  }

  fetchDashboardData() {
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
      minWidth: '345px',
      data: {
        title: title,
        subject: subject,
        topic: topic,
        source: 'Subject'
       },
      backdropClass: 'quiz-blur-backdrop',
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

  onTrackQuiz(track: SubjectTrack) {
    this.launchQuiz(track.title + ' Quiz', this.currentSubject.id, null);
  }

  onCertStartLearning(cert: CertificationTrack) {
    this.activeTab = 'milestones';
  }

  onCertViewCertificate(cert: CertificationTrack) {
    if (cert.myCertificate) {
      this.viewingCertificate = { certificate: cert.myCertificate, trackTitle: cert.title };
    } else {
      this.snackService.display('snackbar-dark', 'Certificate is still processing.', 'bottom', 'center');
    }
  }

  closeCertificateRibbon(): void {
    this.viewingCertificate = null;
  }

   onScheduleMockInt() {
    this.snackService.display('snackbar-dark', 'Feature coming soon.', 'bottom', 'center');
  }
}
