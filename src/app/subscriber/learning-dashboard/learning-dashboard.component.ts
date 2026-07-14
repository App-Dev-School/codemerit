import { Component, OnInit } from '@angular/core';

import { Direction } from '@angular/cdk/bidi';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationCancel, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { AuthService, User } from '@core';
import { Course } from '@core/models/subject-role';
import { UserJobRole } from '@core/models/userJobRole.model';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { fadeInAnimation } from '@shared/animations';
import { QuizCreateComponent } from '@shared/components/quiz-create/quiz-create.component';
import { CoursePickerComponent } from '@shared/components/select-course/course-picker.component';
import { SubjectTrackerCardComponent } from '@shared/components/subject-tracker-card/subject-tracker-card.component';
import { BadgeGridComponent } from '@shared/components/badge-grid/badge-grid.component';
import { XpStreakWidgetComponent } from '@shared/components/xp-streak-widget/xp-streak-widget.component';
import { NextBestActionCardComponent } from '@shared/components/next-best-action-card/next-best-action-card.component';
import { CachedGamificationStats, GAMIFICATION_STATS_CACHE_KEY, LeaderboardPeriod, LeaderboardResponse, MyBadgesResponse, NextTrackNudge } from '@core/models/gamification.model';
import { QuizService } from 'src/app/quiz/quiz.service';

@Component({
  selector: 'app-learning-dashboard',
  templateUrl: './learning-dashboard.component.html',
  styleUrls: ['./learning-dashboard.component.scss'],
  animations: [fadeInAnimation],
  imports: [
    SubjectTrackerCardComponent,
    BadgeGridComponent,
    XpStreakWidgetComponent,
    NextBestActionCardComponent,
  ]
})
export class LearningDashboardComponent implements OnInit {
  pageTitle = 'MainDashboard';
  loading = true;
  loadingText = 'Loading your Dashboard';
  //generatingQuiz = false;
  userData: User;
  showContent = true;
  course = "";
  courseItem: Course;
  enrolledCourses: { id: number; slug: string; title: string; image: string; color: string }[] = [];
  // Runtime shape from fetchCourseDetail() is richer than the Subject model
  // (attempted, correct, coverage, numTrivia, …), so these stay loosely typed.
  attemptedSubjects: any[] = [];
  otherSubjects: any[] = [];
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
  roleMenuOpen = false;

  activeTab: 'overview' | 'badges' | 'leaderboard' = 'overview';
  badges: MyBadgesResponse | null = null;
  badgesLoading = false;
  private badgesFetched = false;
  xpStreakStats: CachedGamificationStats | null = null;
  nextCertificationTrack: NextTrackNudge | null = null;
  nextSubjectTrack: NextTrackNudge | null = null;

  leaderboardPeriod: LeaderboardPeriod = 'all-time';
  leaderboard: LeaderboardResponse | null = null;
  leaderboardLoading = false;
  readonly leaderboardPeriods: LeaderboardPeriod[] = ['all-time', 'weekly', 'monthly'];
  constructor(private master: MasterService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
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
      }else{
        this.router.navigate(['/authentication/signin']);
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
    this.loadCachedGamificationStats();
    // setTimeout(() => {
    //   this.loading = false;
    // }, 3333);
  }

  // This route is entered without a job-role slug most of the time — it shows every job role
  // the user is enrolled in via the role switcher, defaulting to the one in the URL (if any) or the latest enrollment.
  takeRouteParams() {
    const routeSlug = this.route.snapshot.paramMap.get('course');
    console.log(this.pageTitle, "RouteSnap course", routeSlug);

    const userJobRoles = this.authService.getUserJobRoles();
    if (!this.authService.currentUserValue || !(userJobRoles?.length > 0)) {
      this.goToCourses();
      return;
    }

    this.resolveEnrolledCourses(userJobRoles, routeSlug);
  }

  // master.jobRoles may still be in-flight right after login, so wait for it before resolving slugs.
  private resolveEnrolledCourses(userJobRoles: UserJobRole[], routeSlug: string | null) {
    const applyRoles = () => {
      this.enrolledCourses = userJobRoles
        .map(ujr => {
          const role = this.master.jobRoles?.find(r => r.id === ujr.jobRoleId);
          return role ? { id: role.id, slug: role.slug, title: role.title, image: role.image, color: role.color } : null;
        })
        .filter(Boolean);

      if (!this.enrolledCourses.length) {
        // Enrolled job roles no longer exist in the catalog - fall back instead of hanging on "Loading your Dashboard".
        this.goToCourses();
        return;
      }

      const initial = (routeSlug && this.enrolledCourses.find(c => c.slug === routeSlug))
        || this.enrolledCourses[this.enrolledCourses.length - 1];

      this.course = initial.slug;
      this.onCourseChange(this.course);
    };

    if (this.master.jobRoles?.length > 0) {
      applyRoles();
    } else {
      this.master.fetchMasterDataFromAPI().subscribe(() => applyRoles());
    }
  }

  // Click handler for entries in the role switcher dropdown.
  selectJobRole(courseTab: { id: number; slug: string; title: string; image: string; color: string }) {
    if (!courseTab || courseTab.slug === this.course) return;
    this.loading = true;
    this.loadingText = 'Loading your Dashboard';
    this.router.navigate(['/jobRole', courseTab.slug], { replaceUrl: true });
    this.onCourseChange(courseTab.slug);
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
      } 
      // else {
      //   //get this from server
      //   this.master.fetchJobRoleSubjectMapping().subscribe((data: any) => {
      //     console.log("CourseDash #2 fetchJobRoleSubjectMapping", data);
      //     if (data && !data.error && data.data) {
      //       const allJobRoles = data.data;
      //       this.filterCourse(allJobRoles);
      //     }
      //   });
      // }

      //we need list of all subjects in THIS course (by slug) along with course details —
      //fetchCourseDashboard() ignored the slug entirely (generic "my career" endpoint),
      //so it never actually matched whichever job role the URL pointed at.
      this.master.fetchCourseDetail(this.course).subscribe({
        next: (data: any) => {
          if (data) {
            console.log("getAttemptedSubjects 0", data);
            // programDetails returns the authoritative jobRole (description, body, scope, etc.) -
            // overlay it onto whatever the master.jobRoles catalog lookup already produced.
            if (data.jobRole) {
              this.courseItem = { ...this.courseItem, ...data.jobRole };
            }
            const subjects: any[] = Array.isArray(data) ? data : (data?.subjects ?? []);
            this.courseData = subjects;
            this.attemptedSubjects = subjects.filter(item => item.attempted && item.attempted > 0);
            this.otherSubjects = subjects.filter(item => !(item.attempted && item.attempted > 0));
            // Only populated when authenticated — null for both means every
            // certification track for this role is already achieved.
            this.nextCertificationTrack = data?.nextCertificationTrack ?? null;
            this.nextSubjectTrack = data?.nextSubjectTrack ?? null;

            setTimeout(() => {
              this.loading = false;
            }, 3000);
          }
        },
        error: () => {
          this.loading = false;
          this.snackService.display('snackbar-dark', 'Error loading Course Dashboard.', 'bottom', 'center');
        },
      });
    }
  }
  
  // Aggregate coverage across every subject in the active role — real numbers
  // derived from courseData, not a separate summary API call.
  get overallCoverage(): number {
    if (!this.courseData?.length) return 0;
    const sum = this.courseData.reduce((acc, s) => acc + (s.coverage || 0), 0);
    return Math.round(sum / this.courseData.length);
  }

  get overallAccuracy(): number {
    const totalAttempted = this.courseData?.reduce((acc, s) => acc + (s.attempted || 0), 0) || 0;
    const totalCorrect = this.courseData?.reduce((acc, s) => acc + (s.correct || 0), 0) || 0;
    return totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  }

  selectJobRoleFromMenu(courseTab: { id: number; slug: string; title: string; image: string; color: string }) {
    this.roleMenuOpen = false;
    this.selectJobRole(courseTab);
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

  assessSkills(): void {
    if (this.course) {
      this.router.navigate(['/assessment/skill-rating', this.course]);
    }
  }

  // The API gives us a subjectTrack id/title/progress, not a routable subject
  // slug — rather than guess a possibly-wrong deep link, scroll the learner
  // down to their subject list, where the card already lives (switching tabs
  // is a no-op here since the card only renders on the Overview tab).
  onNudgeContinue(): void {
    document.getElementById('subjects-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setActiveTab(tab: 'overview' | 'badges' | 'leaderboard'): void {
    this.activeTab = tab;
    if (tab === 'badges' && !this.badgesFetched) {
      this.loadBadges();
    }
    if (tab === 'leaderboard' && !this.leaderboard) {
      this.loadLeaderboard();
    }
  }

  private loadBadges(): void {
    this.badgesLoading = true;
    this.badgesFetched = true;
    this.master.fetchMyBadges().subscribe((res) => {
      this.badges = res;
      this.badgesLoading = false;
    });
  }

  get userInVisibleLeaderboard(): boolean {
    const rank = this.leaderboard?.userRank;
    if (!rank || !this.leaderboard?.leaderboard) return false;
    return this.leaderboard.leaderboard.some((entry) => entry.rank === rank);
  }

  setLeaderboardPeriod(period: LeaderboardPeriod): void {
    if (period === this.leaderboardPeriod) return;
    this.leaderboardPeriod = period;
    this.loadLeaderboard();
  }

  private loadLeaderboard(): void {
    this.leaderboardLoading = true;
    this.master.fetchLeaderboard(this.leaderboardPeriod).subscribe((res) => {
      this.leaderboard = res;
      this.leaderboardLoading = false;
    });
  }

  // Reads the last-known XP/level/streak cached by quiz-result.component.ts right
  // after a quiz submit — see GAMIFICATION_STATS_CACHE_KEY doc comment for why
  // there's no live endpoint for this yet.
  private loadCachedGamificationStats(): void {
    try {
      const raw = sessionStorage.getItem(GAMIFICATION_STATS_CACHE_KEY);
      this.xpStreakStats = raw ? JSON.parse(raw) : null;
    } catch {
      this.xpStreakStats = null;
    }
  }

}