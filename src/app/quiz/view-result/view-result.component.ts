import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizQuestion } from '@core/models/quiz-question';
import { User } from '@core/models/user';
import { LeaderboardResponse, MyBadgesResponse, NewlyEarned, NextTrackNudge } from '@core/models/gamification.model';
import { AuthService } from '@core/service/auth.service';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { QuizResultComponent } from '@shared/components/quiz-result/quiz-result.component';
import { ShareBottomSheetComponent } from '@shared/components/share-bottom-sheet/share-bottom-sheet.component';
import { environment } from 'src/environments/environment';
import { QuizHelperService } from '../quiz-helper.service';
import { QuizService } from '../quiz.service';
interface Quiz {
  title: string;
  subject_icon: string;
  questions: QuizQuestion[];
}
@Component({
  selector: 'app-view-result',
  templateUrl: './view-result.component.html',
  styleUrls: ['./view-result.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    QuizResultComponent
  ]
})
export class ViewResultComponent implements OnInit {
  //may not be required
  quiz!: Quiz;
  loading = true;
  loadingText = 'Loading Result';
  quizResultCode = '';
  quizResult: any;
  userData: User;
  // Only ever populated on the live post-quiz navigation — never on a
  // reload/deep-link, since Router navigation `state` doesn't survive those.
  newlyEarned: NewlyEarned | null = null;
  // The subject the quiz belongs to, enriched with the richer catalog fields
  // (image/description/color) from MasterService when the quiz-result response
  // itself only carries the bare id/slug/title. Feeds the "hero" CTA card.
  heroSubject: any = null;

  // "Keep the momentum going" widgets — all reuse endpoints/data that already
  // existed before this page needed them, no backend changes required.
  badges: MyBadgesResponse | null = null;
  leaderboardTeaser: LeaderboardResponse | null = null;
  tryNextSubjects: any[] = [];
  nextCertificationTrack: NextTrackNudge | null = null;
  nextSubjectTrack: NextTrackNudge | null = null;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackService: SnackbarService,
    private quizService: QuizService,
    private quizHelper: QuizHelperService,
    private master: MasterService,
    private _bottomSheet: MatBottomSheet) {
    this.userData = this.authService.currentUserValue;
    const navState = this.router.getCurrentNavigation()?.extras?.state as { newlyEarned?: NewlyEarned | null } | undefined;
    this.newlyEarned = navState?.newlyEarned ?? null;
  }

  ngOnInit(): void {
    this.takeRouteParams();
  }

  takeRouteParams() {
    const course = this.route.snapshot.paramMap.get('qcode');
    console.log("QuizResult ParamMap qcode", course);
    this.route.paramMap.subscribe(params => {
      console.log("QuizResult @RouteParam change detected =>", params.get("qcode"));
      if (params.get("qcode")) {
        this.quizResultCode = params.get("qcode");
        if (this.quizResultCode) {
          this.loadQuizResult();
        }
      } else {
        //redirect to error page
        this.snackService.display('snackbar-dark', 'Invalid quiz result code.', 'bottom', 'center');
      }
    });
  }

  private loadQuizResult(): void {
    this.loading = true;
    this.quizService.getQuizResult(this.quizResultCode)
      .subscribe(data => {
        console.log("loadQuizResult API #####", data);
        setTimeout(() => {
          this.quizResult = data;
          this.resolveHeroSubject();
          this.resolveTryNextSubjects();
          this.loadingText = '';
          this.loading = false;
        }, 3000);
        setTimeout(() => {
          this.createResultEffect();
        }, 4000);
      });
    this.loadMomentumWidgets();
  }

  // "Your overall status" widgets — independent of this specific submission,
  // so they're worth showing even on a revisited/deep-linked old result, not
  // just a fresh one. Only meaningful for a logged-in user; MasterService's
  // own fallbacks (empty arrays / nulls) keep this silent otherwise.
  private loadMomentumWidgets(): void {
    if (!this.authService.currentUserValue) return;
    this.master.fetchMyBadges().subscribe((res) => { this.badges = res; });
    this.master.fetchLeaderboard('weekly').subscribe((res) => { this.leaderboardTeaser = res; });
    this.resolveNextBestAction();
  }

  // Picks the user's most-recently-enrolled job role (same "latest enrollment"
  // convention learning-dashboard.component.ts uses) and pulls its
  // nextCertificationTrack/nextSubjectTrack from programDetails — the exact
  // fields Story 3 already wired for the Learning Dashboard nudge card, just
  // resolved fresh here since this page doesn't otherwise know which job role
  // is relevant.
  private resolveNextBestAction(): void {
    const userJobRoles = this.authService.getUserJobRoles();
    if (!userJobRoles?.length) return;

    const applyResolve = () => {
      const latest = userJobRoles[userJobRoles.length - 1];
      const role = this.master.jobRoles?.find((r: any) => r.id === latest?.jobRoleId);
      if (!role?.slug) return;
      this.master.fetchCourseDetail(role.slug).subscribe((data: any) => {
        this.nextCertificationTrack = data?.nextCertificationTrack ?? null;
        this.nextSubjectTrack = data?.nextSubjectTrack ?? null;
      });
    };

    if (this.master.jobRoles?.length > 0) {
      applyResolve();
    } else {
      this.master.fetchMasterDataFromAPI().subscribe(() => applyResolve());
    }
  }

  // Simple "explore something else" strip — picks a few subjects from the
  // already-loaded catalog, excluding the one this quiz was on. Not
  // personalized (no extra fetch needed), just keeps momentum beyond the one
  // subject already covered by the hero card.
  private resolveTryNextSubjects(): void {
    const others = (this.master.subjects ?? []).filter((s: any) => s.id !== this.heroSubject?.id);
    this.tryNextSubjects = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
  }

  // The quiz-result response only carries a thin subject reference (id/slug/
  // title, confirmed via onContinue() below) — cross-reference MasterService's
  // already-loaded subject catalog to backfill image/description/color for a
  // richer "hero" card, falling back gracefully if no match is found.
  private resolveHeroSubject(): void {
    const raw = this.quizResult?.subjects?.[0];
    if (!raw) {
      this.heroSubject = null;
      return;
    }
    const catalogMatch = this.master.subjects?.find(
      (s: any) => (raw.id != null && s.id === raw.id) || (raw.slug && s.slug === raw.slug)
    );
    this.heroSubject = {
      id: raw.id ?? catalogMatch?.id,
      slug: raw.slug ?? catalogMatch?.slug,
      title: raw.title ?? catalogMatch?.title,
      description: raw.description ?? catalogMatch?.description,
      image: raw.image ?? catalogMatch?.image,
      color: raw.color ?? catalogMatch?.color,
    };
  }

  createResultEffect() {
    this.snackService.display('snackbar-dark', 'Thank you for taking the quiz!', 'bottom', 'center');
    if (this.quizService.getQuizConfig().enableAudio) {
      if (this.quizResult && this.quizResult.score >= 80) {
        if (this.quizResult.score > 90) {
          this.quizHelper.playSound('excellent');
        } else {
          this.quizHelper.playSound(Math.random() < 0.7 ? 'well-done' : 'good_performance');
        }
      } else {
        if (this.quizResult.score < 40) {
        if (this.quizResult.score < 30) {
          this.quizHelper.playSound('poor_performance');
        }else{
          this.quizHelper.playSound('test_failed');
        }
      }
      }
    }
  }

  onShareResult(): void {
    this.openBottomSheet();
  }

  openBottomSheet(): void {
    let who = this.quizResult?.user?.firstName + '' + (this.quizResult.user.lastName ? ' ' + this.quizResult.user.lastName : '');
    if (this.authService.currentUserValue && this.quizResult.user?.id === this.authService.currentUserValue?.id) {
      who = 'I';
    }
    this._bottomSheet.open(ShareBottomSheetComponent, {
      data: {
        elementId: 'quizResultCard',
        title: this.authService.currentUserValue ? 'My Tech Assessment Report' : 'Tech Assessment Report',
        url: environment.appUrl + '' + this.router.url,
        text: `${who} attended ${this.quizResult?.quiz.title} and scored ${this.quizResult.score}% with an accuracy of ${this.quizResult?.accuracy}%! 🎉`
      }
    });
  }

  onContinue(): void {
    try {
      if (this.quizResult && this.quizResult.subjects) {
        const firstSubjectSlug = this.quizResult.subjects[0]?.slug;
        const firstSubjectName = this.quizResult.subjects[0]?.title;
        this.router.navigate(['/dashboard/learn', firstSubjectSlug]).then(() => {
          this.snackService.display('snackbar-dark', 'Taking back to ' + firstSubjectName+' dashboard.', 'bottom', 'center');
        });
      }
    } catch (error) {
      this.router.navigate(['/dashboard']);
    }
  }
  //add methods for sharing options, invite etc.
}