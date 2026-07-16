import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizQuestion } from '@core/models/quiz-question';
import { QuizResult } from '@core/models/quiz';
import { User } from '@core/models/user';
import { LeaderboardResponse, MyBadgesResponse, NewlyEarned, NextTrackNudge } from '@core/models/gamification.model';
import { AuthService } from '@core/service/auth.service';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { SpeechService } from '@core/service/speech.service';
import { QuizResultComponent } from '@shared/components/quiz-result/quiz-result.component';
import { ShareBottomSheetComponent } from '@shared/components/share-bottom-sheet/share-bottom-sheet.component';
import { environment } from 'src/environments/environment';
import { QuizService } from '../quiz.service';
interface Quiz {
  title: string;
  subject_icon: string;
  questions: QuizQuestion[];
}

// Ordered roughly worst → best; used only for readability, selection logic
// lives entirely in resolveResultOutcome().
type ResultTier =
  | 'poorFail' | 'fail' | 'narrowFail'
  | 'narrowPass' | 'incompletePass' | 'solidPass' | 'excellent' | 'perfect';

// {{name}} / {{score}} are replaced in pickPhrase(). Several phrases per tier
// so two people who both narrowly pass don't hear the identical line.
const RESULT_PHRASES: Record<ResultTier, string[]> = {
  perfect: [
    "Perfect score, {{name}}! Every single question, nailed.",
    "Flawless! You just aced this one — a clean 100 percent, {{name}}.",
    "That's a perfect run, {{name}} — nothing left on the table.",
    "Incredible work, {{name}}. A clean sweep at {{score}} percent.",
  ],
  excellent: [
    "Excellent work, {{name}}! You scored {{score}} percent.",
    "That's a brilliant score, {{name}} — {{score}} percent, well done.",
    "Really strong performance, {{name}}. {{score}} percent is impressive.",
    "Great job, {{name}}! You're clearly on top of this subject.",
  ],
  solidPass: [
    "Nice work, {{name}}! You passed with {{score}} percent.",
    "Well done, {{name}} — that's a solid pass at {{score}} percent.",
    "Good result, {{name}}. You're building real momentum here.",
    "You passed, {{name}}! {{score}} percent is a great foundation.",
  ],
  incompletePass: [
    "You passed with {{score}} percent, {{name}} — but a few questions went unanswered. Try to attempt every question next time.",
    "Good score, {{name}}! Just remember to attempt everything — you left a few answers blank.",
    "You cleared the bar at {{score}} percent, {{name}}, though some answers were left unanswered. Worth a second look.",
  ],
  narrowPass: [
    "You passed, {{name}} — just barely, at {{score}} percent. A little more practice and you'll pull ahead comfortably.",
    "That's a pass, {{name}}, but a close one at {{score}} percent. Keep sharpening those weak spots.",
    "You made it through at {{score}} percent, {{name}}. Review the ones you missed to build a stronger margin.",
  ],
  narrowFail: [
    "So close, {{name}}! {{score}} percent — just a little short of passing. One more attempt and you've got this.",
    "Almost there, {{name}}. You were right on the edge at {{score}} percent — don't give up now.",
    "You nearly made it, {{name}}. {{score}} percent means you're closer than you think.",
  ],
  fail: [
    "You scored {{score}} percent this time, {{name}}. Review the material and give it another shot.",
    "Not quite a pass, {{name}} — {{score}} percent. Keep practicing, you're on the right track.",
    "{{score}} percent, {{name}}. A bit more preparation and you'll clear this comfortably next time.",
  ],
  poorFail: [
    "This one was tough, {{name}} — {{score}} percent. Take some time to review the basics and try again.",
    "Don't worry, {{name}}, everyone starts somewhere. {{score}} percent means there's room to grow — and you will.",
    "{{score}} percent today, {{name}}. Revisit the fundamentals and come back stronger.",
  ],
};
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
    private speechService: SpeechService,
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

  createResultEffect(): void {
    this.snackService.display('snackbar-dark', 'Thank you for taking the quiz!', 'bottom', 'center');
    if (!this.quizResult || !this.quizService.getQuizConfig().enableAudio) return;

    const { tier, passed } = this.resolveResultOutcome(this.quizResult);
    this.speechService.speak(this.pickPhrase(tier), { profile: passed ? 'cheerful' : 'calm' });
  }

  // Same pass/fail convention as quiz-result.component.ts's isPassed/passMarks
  // (settings.passMarks, falling back to a flat passMarks field, then 60) —
  // kept in sync deliberately so the spoken verdict always agrees with the
  // "Passed"/"Failed" badge already on screen.
  private resolveResultOutcome(result: QuizResult): { tier: ResultTier; passed: boolean; passMarks: number } {
    const score = Number(result.score ?? 0);
    const total = Number(result.total ?? 0);
    const unanswered = Number(result.unanswered ?? 0);
    const passMarks = (result.quiz as any)?.settings?.passMarks ?? (result as any)?.passMarks ?? 60;
    const passed = score >= passMarks;
    const unansweredRatio = total > 0 ? unanswered / total : 0;

    let tier: ResultTier;
    if (passed) {
      tier = score >= 100 && unanswered === 0 ? 'perfect'
           // A fifth or more of the quiz left blank overrides the usual score
           // tiers — completion matters even when the attempted questions went well.
           : unansweredRatio >= 0.2           ? 'incompletePass'
           : score >= 90                      ? 'excellent'
           : score >= passMarks + 10          ? 'solidPass'
           : 'narrowPass';
    } else {
      tier = score >= passMarks - 15 ? 'narrowFail'
           : score < 40              ? 'poorFail'
           : 'fail';
    }
    return { tier, passed, passMarks };
  }

  private pickPhrase(tier: ResultTier): string {
    const pool = RESULT_PHRASES[tier];
    const template = pool[Math.floor(Math.random() * pool.length)];
    const name = this.userData?.firstName || this.quizResult?.user?.firstName || 'there';
    const score = Math.round(Number(this.quizResult?.score ?? 0));
    return template.replace(/\{\{name\}\}/g, name).replace(/\{\{score\}\}/g, String(score));
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