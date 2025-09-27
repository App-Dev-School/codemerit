import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
@Component({
  selector: 'app-course-progress',
  imports: [CommonModule],
  templateUrl: './course-progress.component.html',
  styleUrl: './course-progress.component.scss'
})
export class CourseProgressComponent implements AfterViewInit, OnChanges {
  @Input() score = 0;           // 0–100
  @Input() size = 72;           // css pixels
  @Input() thickness = 6;       // px
  @Input() duration = 2000;      // ms
  @Input() barColor = '#2541e2ff';
  @Input() trackColor = '#e6e6e6';
  @Input() showLabel = true;

  @ViewChild('c', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  current = 0;

  ngAfterViewInit() {
    this.setupCanvas();
    this.animateTo(this.score);
  }

  ngOnChanges(ch: SimpleChanges) {
    if (!this.canvasRef) return;
    this.setupCanvas();
    if (ch['score']) this.animateTo(this.score);
  }

  private setupCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = this.size * dpr;
    canvas.height = this.size * dpr;
    canvas.style.width = `${this.size}px`;
    canvas.style.height = `${this.size}px`;
  }

  private draw(p: number) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const s = this.size * dpr;
    const cx = s / 2;
    const cy = s / 2;
    const r = (this.size / 2 - this.thickness / 2) * dpr;
    const start = -Math.PI / 2; // start at top
    const end = start + (p / 100) * Math.PI * 2;

    ctx.clearRect(0, 0, s, s);
    ctx.lineCap = 'round';
    ctx.lineWidth = this.thickness * dpr;

    // track
    ctx.beginPath();
    ctx.strokeStyle = this.trackColor;
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // bar
    if (p > 0) {
      ctx.beginPath();
      ctx.strokeStyle = this.barColor;
      ctx.arc(cx, cy, r, start, end);
      ctx.stroke();
    }
  }

  private animateTo(target: number) {
    target = Math.max(0, Math.min(100, Math.round(target)));
    const start = this.current;
    const diff = target - start;
    const startTime = performance.now();
    const dur = Math.max(0, this.duration);

    const step = (now: number) => {
      const t = dur === 0 ? 1 : Math.min(1, (now - startTime) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = start + diff * eased;
      this.current = Math.round(value);
      this.draw(value);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
