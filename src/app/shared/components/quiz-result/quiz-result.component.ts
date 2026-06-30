import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, Output, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { QuizResult } from '@core/models/quiz';
import { QuizProgressComponent } from '../quiz-progress/quiz-progress.component';

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
  imports: [CommonModule, MatButton, MatIcon, QuizProgressComponent]
})
export class QuizResultComponent implements AfterViewInit, OnDestroy {

  @Output() onShareResult = new EventEmitter<string>();
  @Output() onContinue    = new EventEmitter<string>();

  @ViewChild('celebCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animFrameId?: number;
  private canvasReady = false;
  private readonly onResize = () => this.resizeCanvas();

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
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
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
