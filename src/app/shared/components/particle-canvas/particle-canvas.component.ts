import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

interface Particle { x: number; y: number; dx: number; dy: number; size: number; color: string; }

@Component({
  selector: 'app-particle-canvas',
  standalone: true,
  template: `<canvas #canvas></canvas>`,
  styles: [`:host{position:fixed;inset:0;z-index:0;pointer-events:none;display:block;overflow:hidden}canvas{width:100%;height:100%}`],
})
export class ParticleCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private animFrameId: number | null = null;
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private mouse = { x: null as number | null, y: null as number | null, radius: 0 };

  ngAfterViewInit() {
    const canvas  = this.canvasRef.nativeElement;
    this.ctx      = canvas.getContext('2d')!;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    this.mouse.radius = (canvas.height / 80) * (canvas.width / 80);
    this.build(canvas);
    this.animate();
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mouseout',  this.onMouseOut);
    window.addEventListener('resize',    this.onResize);
  }

  private onMouseMove = (e: MouseEvent) => { this.mouse.x = e.x; this.mouse.y = e.y; };
  private onMouseOut  = () => { this.mouse.x = null; this.mouse.y = null; };
  private onResize    = () => {
    const c = this.canvasRef.nativeElement;
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
    this.mouse.radius = (c.height / 80) * (c.width / 80);
    this.build(c);
  };

  private build(canvas: HTMLCanvasElement) {
    this.particles = [];
    const count = (canvas.height * canvas.width) / 12000;
    for (let i = 0; i < count; i++) {
      const size  = Math.random() * 2 + 1;
      const x     = Math.random() * (canvas.width  - size * 4) + size * 2;
      const y     = Math.random() * (canvas.height - size * 4) + size * 2;
      const color = i % 2 === 0 ? 'rgba(59,130,246,0.4)' : 'rgba(139,92,246,0.4)';
      this.particles.push({ x, y, dx: Math.random() - 0.5, dy: Math.random() - 0.5, size, color });
    }
  }

  private animate = () => {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.animFrameId = requestAnimationFrame(this.animate);
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (p.x > canvas.width  || p.x < 0) p.dx = -p.dx;
      if (p.y > canvas.height || p.y < 0) p.dy = -p.dy;
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const mx = this.mouse.x - p.x, my = this.mouse.y - p.y;
        if (Math.sqrt(mx * mx + my * my) < this.mouse.radius + p.size) {
          if (this.mouse.x < p.x && p.x < canvas.width  - p.size * 10) p.x += 10;
          if (this.mouse.x > p.x && p.x > p.size * 10)                  p.x -= 10;
          if (this.mouse.y < p.y && p.y < canvas.height - p.size * 10) p.y += 10;
          if (this.mouse.y > p.y && p.y > p.size * 10)                  p.y -= 10;
        }
      }
      p.x += p.dx; p.y += p.dy;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      for (let j = i + 1; j < this.particles.length; j++) {
        const q  = this.particles[j];
        const d2 = (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
        if (d2 < (canvas.width / 7) * (canvas.height / 7)) {
          this.ctx.strokeStyle = `rgba(139,92,246,${(1 - d2 / 15000) * 0.15})`;
          this.ctx.lineWidth   = 1;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(q.x, q.y);
          this.ctx.stroke();
        }
      }
    }
  };

  ngOnDestroy() {
    if (this.animFrameId !== null) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseout',  this.onMouseOut);
    window.removeEventListener('resize',    this.onResize);
  }
}
