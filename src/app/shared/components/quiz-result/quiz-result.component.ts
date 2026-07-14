import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuizResult } from '@core/models/quiz';
import { CachedGamificationStats, EarnedCertificate, GAMIFICATION_STATS_CACHE_KEY, LeaderboardResponse, MyBadgesResponse, NewlyEarned, NewlyEarnedBadge, NextTrackNudge } from '@core/models/gamification.model';
import { ShareService } from '@core/service/share.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { zoomInOutAnimation } from '@shared/animations';
import { LevelUpModalComponent } from '@shared/components/level-up-modal/level-up-modal.component';
import { BadgeEarnedCardComponent } from '@shared/components/badge-earned-card/badge-earned-card.component';
import { CertificateUnlockModalComponent } from '@shared/components/certificate-unlock-modal/certificate-unlock-modal.component';
import { XpStreakWidgetComponent } from '@shared/components/xp-streak-widget/xp-streak-widget.component';
import { BadgeProgressTeaserComponent } from '@shared/components/badge-progress-teaser/badge-progress-teaser.component';
import { LeaderboardRankTeaserComponent } from '@shared/components/leaderboard-rank-teaser/leaderboard-rank-teaser.component';
import { NextBestActionCardComponent } from '@shared/components/next-best-action-card/next-best-action-card.component';
import { QuizProgressComponent } from '../quiz-progress/quiz-progress.component';

type CelebrationStep =
  | { type: 'levelUp' }
  | { type: 'streak' }
  | { type: 'badge'; badge: NewlyEarnedBadge }
  | { type: 'certificate'; certificate: EarnedCertificate };

// Auto-advance timing for celebration reveal cards (level-up/streak) — long
// enough to actually read a title + description, not just glimpse it. Manual dismiss
// (tap/Continue) still works before this fires. Badges and certificates are
// exempt — see startNextCelebration.
const CELEBRATION_STEP_MS = 6000;

// Full sequence timeline, so nothing overlaps: base pass/fail confetti is the
// first thing the user sees (T+0), then it's given a moment to settle before
// the XP pill takes over as the visual focus, then a further moment before
// the level-up/streak/badge/certificate queue begins.
const BASE_CONFETTI_SETTLE_MS = 1200;
const XP_PILL_MS = 3200;
const QUEUE_GAP_AFTER_XP_MS = 500;

const GOLD_PALETTE = ['#eab308', '#f59e0b', '#fbbf24', '#fde047', '#facc15'];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  scale: number; scaleX: number;
  rotation: number; rotationSpeed: number; tumbleSpeed: number;
  shape: string; color: string; textChar: string;
  opacity: number; fadeRate: number;
  theme: string;
}

@Component({
  selector: 'app-quiz-result',
  templateUrl: './quiz-result.component.html',
  styleUrl: './quiz-result.component.scss',
  imports: [
    CommonModule, RouterLink, QuizProgressComponent, LevelUpModalComponent, BadgeEarnedCardComponent,
    CertificateUnlockModalComponent, XpStreakWidgetComponent, BadgeProgressTeaserComponent,
    LeaderboardRankTeaserComponent, NextBestActionCardComponent,
  ],
  animations: [zoomInOutAnimation],
})
export class QuizResultComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Output() onShareResult = new EventEmitter<string>();
  @Output() onContinue    = new EventEmitter<string>();

  @Input() newlyEarned: NewlyEarned | null = null;
  // Subject the quiz belongs to (id/slug/title, optionally image/description/
  // color enriched by the parent from MasterService's catalog) — feeds the
  // hero section between the score card and the result breakdown.
  @Input() heroSubject: any = null;

  // "Keep the momentum going" widgets — all optional, all gated in the
  // template so a null/empty value just hides that widget rather than
  // showing a broken/empty state.
  @Input() badges: MyBadgesResponse | null = null;
  @Input() leaderboardTeaser: LeaderboardResponse | null = null;
  @Input() tryNextSubjects: any[] = [];
  @Input() nextCertificationTrack: NextTrackNudge | null = null;
  @Input() nextSubjectTrack: NextTrackNudge | null = null;

  // Derived directly from newlyEarned (this exact submission's fresh totals)
  // rather than round-tripping through the sessionStorage cache — always in
  // sync with what's actually on screen. Null on a revisited/deep-linked old
  // result (newlyEarned is only ever populated on the live post-quiz nav),
  // in which case xp-streak-widget's own empty state covers it.
  get xpStreakStats(): CachedGamificationStats | null {
    if (this.newlyEarned?.totalPoints == null || !this.newlyEarned?.level) return null;
    return {
      totalPoints: this.newlyEarned.totalPoints,
      level: this.newlyEarned.level,
      streak: this.newlyEarned.streak ?? null,
      cachedAt: new Date().toISOString(),
    };
  }

  @ViewChild('celebCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animFrameId?: number;
  private canvasReady = false;
  private readonly onResize = () => this.resizeCanvas();

  // Gamification celebration sequence state
  celebrationQueue: CelebrationStep[] = [];
  activeCelebration: CelebrationStep | null = null;
  showXpPill = false;
  private celebrationStarted = false;
  private celebrationAutoTimer?: ReturnType<typeof setTimeout>;
  private passCelebrationTimers: ReturnType<typeof setTimeout>[] = [];
  private sequenceTimers: ReturnType<typeof setTimeout>[] = [];

  downloading = false;

  constructor(
    private zone: NgZone,
    private shareService: ShareService,
    private snackService: SnackbarService,
  ) {}

  doOnShareResult() { this.onShareResult.emit('quizResultCard'); }
  doOnContinue()    { this.onContinue.emit(''); }

  async downloadReport(): Promise<void> {
    if (this.downloading) return;
    this.downloading = true;
    try {
      const filename = `quiz-result-${this.result?.resultCode || 'report'}.png`;
      const ok = await this.shareService.downloadCardAsImage('quizResultCard', filename);
      if (!ok) {
        this.snackService.display('snackbar-dark', 'Could not generate the report image. Please try again.', 'bottom', 'center');
      }
    } catch (error) {
      console.error('downloadReport error', error);
      this.snackService.display('snackbar-dark', 'Could not generate the report image. Please try again.', 'bottom', 'center');
    } finally {
      this.downloading = false;
    }
  }

  get passMarks(): number {
    return (this.result?.quiz as any)?.settings?.passMarks ?? (this.result as any)?.passMarks ?? 60;
  }
  get isPassed(): boolean { return Number(this.result?.score ?? 0) >= this.passMarks; }
  get statusLabel(): string { return this.isPassed ? 'Passed' : 'Failed'; }

  get reviewQuestions(): any[] {
    if (this.result) {
      const attempts  = (this.result as any).attempts;
      const questions = (this.result as any).questions;
      if (Array.isArray(attempts)  && attempts.length  > 0 && attempts[0]?.text)  return attempts;
      if (Array.isArray(questions) && questions.length > 0)                        return questions;
    }
    return [];
  }

  private _result: QuizResult;
  @Input()
  set result(val: QuizResult) {
    this._result = val;
    if (this.canvasReady && val && Number(val.score ?? 0) >= this.passMarks) {
      this.triggerCelebration();
    }
  }
  get result(): QuizResult { return this._result; }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', this.onResize);
    this.canvasReady = true;
    this.zone.runOutsideAngular(() => this.runAnimationLoop());
    if (this.isPassed) this.triggerCelebration();
    this.maybeStartCelebrationSequence();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newlyEarned']) {
      this.maybeStartCelebrationSequence();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.celebrationAutoTimer) clearTimeout(this.celebrationAutoTimer);
    this.passCelebrationTimers.forEach(t => clearTimeout(t));
    this.passCelebrationTimers = [];
    this.sequenceTimers.forEach(t => clearTimeout(t));
    this.sequenceTimers = [];
  }

  // ── Gamification celebration sequence ──────────────────────────────
  // Never treat `newlyEarned != null` alone, or bare `xpAwarded > 0` alone,
  // as "something to celebrate" — xpAwarded can legitimately be 0 on a
  // replay while other fields are still empty, and vice versa.
  private hasCelebratableContent(ne: NewlyEarned): boolean {
    return !!(
      ne.leveledUp ||
      ne.streak?.milestoneHit ||
      ne.badgesEarned?.length ||
      ne.certificatesEarned?.length
    );
  }

  private maybeStartCelebrationSequence(): void {
    if (this.celebrationStarted || !this.canvasReady) return;
    const ne = this.newlyEarned;
    if (!ne) return;
    this.celebrationStarted = true;

    this.cacheGamificationStats(ne);

    // Sequential timeline, nothing overlaps: base confetti settles first, then
    // the XP pill takes the spotlight, then (once IT settles) the level-up/
    // streak/badge/certificate queue begins. xpAwarded === 0 is a normal
    // replay-of-mastered-content outcome — never animate a "+0 XP" reward,
    // and skip straight to the queue without waiting on a pill that won't show.
    let queueStartDelay = BASE_CONFETTI_SETTLE_MS;
    if (ne.xpAwarded > 0) {
      this.sequenceTimers.push(setTimeout(() => {
        this.showXpPill = true;
        this.sequenceTimers.push(setTimeout(() => (this.showXpPill = false), XP_PILL_MS));
      }, BASE_CONFETTI_SETTLE_MS));
      queueStartDelay = BASE_CONFETTI_SETTLE_MS + XP_PILL_MS + QUEUE_GAP_AFTER_XP_MS;
    }

    if (!this.hasCelebratableContent(ne)) return;
    this.celebrationQueue = this.buildCelebrationQueue(ne);
    this.sequenceTimers.push(setTimeout(() => this.startNextCelebration(), queueStartDelay));
  }

  private buildCelebrationQueue(ne: NewlyEarned): CelebrationStep[] {
    const queue: CelebrationStep[] = [];
    if (ne.leveledUp) queue.push({ type: 'levelUp' });
    if (ne.streak?.milestoneHit) queue.push({ type: 'streak' });
    for (const badge of ne.badgesEarned ?? []) queue.push({ type: 'badge', badge });
    for (const certificate of ne.certificatesEarned ?? []) queue.push({ type: 'certificate', certificate });
    return queue;
  }

  private startNextCelebration(): void {
    if (this.celebrationAutoTimer) clearTimeout(this.celebrationAutoTimer);
    this.activeCelebration = this.celebrationQueue.shift() ?? null;
    if (!this.activeCelebration) return;

    if (this.activeCelebration.type === 'badge') {
      // Badges require deliberate acknowledgment — no auto-advance timer, and
      // a dense golden burst to make the moment feel earned. The card itself
      // (badge-earned-card, reveal variant) also has no backdrop-dismiss, only
      // its own Continue button — see that component for the other half of this.
      this.spawnBurst(180, true, GOLD_PALETTE);
      return;
    }

    if (this.activeCelebration.type === 'certificate') {
      // The grandest moment in the whole sequence — same "must acknowledge"
      // rule as badges (no auto-timer; certificate-unlock-modal has no
      // backdrop-dismiss either, only its own large CTA), plus a bigger,
      // longer, multi-wave burst than anything else fires.
      this.spawnCertificateBurst();
      return;
    }

    const isBigMoment = this.activeCelebration.type === 'levelUp';
    this.spawnBurst(isBigMoment ? 140 : 60, isBigMoment);
    this.celebrationAutoTimer = setTimeout(() => this.dismissCelebration(), CELEBRATION_STEP_MS);
  }

  private spawnCertificateBurst(): void {
    const waveCount = 3;
    const waveGapMs = 400;
    for (let i = 0; i < waveCount; i++) {
      const timer = setTimeout(() => {
        this.spawnBurst(i === 0 ? 200 : 100, i === 0, GOLD_PALETTE);
      }, i * waveGapMs);
      this.sequenceTimers.push(timer);
    }
  }

  dismissCelebration(): void {
    if (this.celebrationAutoTimer) clearTimeout(this.celebrationAutoTimer);
    this.startNextCelebration();
  }

  get activeBadge(): NewlyEarnedBadge | null {
    return this.activeCelebration?.type === 'badge' ? this.activeCelebration.badge : null;
  }

  get activeCertificate(): EarnedCertificate | null {
    return this.activeCelebration?.type === 'certificate' ? this.activeCelebration.certificate : null;
  }

  private cacheGamificationStats(ne: NewlyEarned): void {
    if (ne.totalPoints == null || !ne.level) return;
    try {
      sessionStorage.setItem(GAMIFICATION_STATS_CACHE_KEY, JSON.stringify({
        totalPoints: ne.totalPoints,
        level: ne.level,
        streak: ne.streak ?? null,
        cachedAt: new Date().toISOString(),
      }));
    } catch {
      // sessionStorage unavailable (private mode, etc.) — non-critical, skip silently.
    }
  }

  // Scaled by how far above the pass mark the score is — a bare pass gets a
  // brief single burst, a perfect score gets a longer, bigger multi-wave
  // finale. Normalized against passMarks (not a hardcoded 50/100) so this
  // holds up regardless of what a given quiz's pass threshold actually is.
  private triggerCelebration(): void {
    const score = Number(this.result?.score ?? 0);
    const pass = this.passMarks;
    const t = Math.max(0, Math.min(1, (score - pass) / Math.max(1, 100 - pass)));

    const waveCount = 1 + Math.round(t * 3);      // 1..4 waves
    const baseSize = 50 + Math.round(t * 90);     // 50..140 particles in the first wave
    const waveGapMs = 550;

    this.passCelebrationTimers.forEach(timer => clearTimeout(timer));
    this.passCelebrationTimers = [];

    for (let i = 0; i < waveCount; i++) {
      const timer = setTimeout(() => {
        this.spawnBurst(i === 0 ? baseSize : Math.round(baseSize * 0.5), i === 0);
      }, i * waveGapMs);
      this.passCelebrationTimers.push(timer);
    }
  }

  private spawnBurst(count: number, center = false, palette?: string[]): void {
    const c = this.canvasRef?.nativeElement;
    if (!c) return;
    for (let i = 0; i < count; i++) {
      if (center) {
        this.particles.push(this.makeParticle(c.width / 2, c.height / 3, palette));
      } else {
        this.particles.push(this.makeParticle(c.width / 3,       c.height / 3, palette));
        this.particles.push(this.makeParticle((c.width / 3) * 2, c.height / 3, palette));
      }
    }
  }

  private runAnimationLoop(): void {
    const loop = () => {
      const c = this.canvasRef?.nativeElement;
      if (!c) return;
      this.ctx.clearRect(0, 0, c.width, c.height);
      this.particles = this.particles.filter(p => {
        const alive = this.tickParticle(p);
        if (alive) this.paintParticle(p);
        return alive;
      });
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private resizeCanvas(): void {
    const c = this.canvasRef?.nativeElement;
    if (!c) return;
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
  }

  private makeParticle(x: number, y: number, palette?: string[]): Particle {
    const pal  = palette ?? ['#f43f5e','#10b981','#3b82f6','#eab308','#a855f7','#ff7849'];
    const shps = ['rect','ribbon'];
    const vx = (Math.random() - 0.5) * 12 * 3;
    const vy = (Math.random() - 0.5) * 12 * 3 - 2;
    return {
      x, y, vx, vy,
      scale: Math.random() * 0.7 + 0.5, scaleX: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      tumbleSpeed: Math.random() * 0.06 + 0.02,
      shape: shps[Math.floor(Math.random() * shps.length)],
      color: pal[Math.floor(Math.random() * pal.length)],
      textChar: '',
      opacity: 1,
      fadeRate: 0.006 + Math.random() * 0.006,
      theme: 'classic_confetti'
    };
  }

  private tickParticle(p: Particle): boolean {
    p.x  += p.vx;
    p.y  += p.vy;
    p.vy += 0.25; // gravity
    p.rotation += p.rotationSpeed;
    p.scaleX = Math.sin(p.rotation * p.tumbleSpeed);
    p.opacity -= p.fadeRate;
    return p.opacity > 0;
  }

  private paintParticle(p: Particle): void {
    const ctx = this.ctx;
    const bw = 10 * p.scale, bh = 18 * p.scale;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.scale(p.scaleX, 1);
    ctx.globalAlpha = p.opacity;
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = ctx.strokeStyle = p.color;
    if (p.shape === 'rect') {
      ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
    } else {
      ctx.beginPath();
      ctx.moveTo(-bw/2, -bh/2);
      ctx.bezierCurveTo(bw/2, -bh/4, -bw/2, bh/4, bw/2, bh/2);
      ctx.lineWidth = 2.5 * p.scale;
      ctx.stroke();
    }
    ctx.restore();
  }
}
