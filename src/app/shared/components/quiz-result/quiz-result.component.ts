import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { QuizResult } from '@core/models/quiz';
import { EarnedCertificate, GAMIFICATION_STATS_CACHE_KEY, NewlyEarned, NewlyEarnedBadge } from '@core/models/gamification.model';
import { zoomInOutAnimation } from '@shared/animations';
import { LevelUpModalComponent } from '@shared/components/level-up-modal/level-up-modal.component';
import { BadgeEarnedCardComponent } from '@shared/components/badge-earned-card/badge-earned-card.component';
import { QuizProgressComponent } from '../quiz-progress/quiz-progress.component';

type CelebrationStep =
  | { type: 'levelUp' }
  | { type: 'streak' }
  | { type: 'badge'; badge: NewlyEarnedBadge }
  | { type: 'certificate'; certificate: EarnedCertificate };

// Auto-advance timing for celebration reveal cards (level-up/streak/badge/cert) — long
// enough to actually read a title + description, not just glimpse it. Manual dismiss
// (tap/Continue) still works before this fires.
const CELEBRATION_STEP_MS = 6000;
const XP_PILL_MS = 4000;

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
  imports: [CommonModule, QuizProgressComponent, LevelUpModalComponent, BadgeEarnedCardComponent],
  animations: [zoomInOutAnimation],
})
export class QuizResultComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Output() onShareResult = new EventEmitter<string>();
  @Output() onContinue    = new EventEmitter<string>();

  @Input() newlyEarned: NewlyEarned | null = null;

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

  constructor(private zone: NgZone) {}

  doOnShareResult() { this.onShareResult.emit('quizResultCard'); }
  doOnContinue()    { this.onContinue.emit(''); }
  downloadReport()  {}

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

    // xpAwarded === 0 is a normal replay-of-mastered-content outcome — never
    // animate a "+0 XP" reward for it.
    if (ne.xpAwarded > 0) {
      this.showXpPill = true;
      setTimeout(() => (this.showXpPill = false), XP_PILL_MS);
    }

    if (!this.hasCelebratableContent(ne)) return;
    this.celebrationQueue = this.buildCelebrationQueue(ne);
    // Let the base score-card / pass confetti settle first.
    setTimeout(() => this.startNextCelebration(), 900);
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
    const isBigMoment = this.activeCelebration.type === 'levelUp' || this.activeCelebration.type === 'certificate';
    this.spawnBurst(isBigMoment ? 140 : 60, isBigMoment);
    this.celebrationAutoTimer = setTimeout(() => this.dismissCelebration(), CELEBRATION_STEP_MS);
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

  private triggerCelebration(): void {
    this.spawnBurst(100, true);
    setTimeout(() => this.spawnBurst(60, false), 600);
  }

  private spawnBurst(count: number, center = false): void {
    const c = this.canvasRef?.nativeElement;
    if (!c) return;
    for (let i = 0; i < count; i++) {
      if (center) {
        this.particles.push(this.makeParticle(c.width / 2, c.height / 3));
      } else {
        this.particles.push(this.makeParticle(c.width / 3,       c.height / 3));
        this.particles.push(this.makeParticle((c.width / 3) * 2, c.height / 3));
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

  private makeParticle(x: number, y: number): Particle {
    const pal  = ['#f43f5e','#10b981','#3b82f6','#eab308','#a855f7','#ff7849'];
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
