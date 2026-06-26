import { Component, ElementRef, Input, OnDestroy, AfterViewInit, ViewChild, NgZone, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-celebration-overlay',
  standalone: true,
  templateUrl: './celebration-overlay.component.html',
  styleUrls: ['./celebration-overlay.component.scss']
})
export class CelebrationOverlayComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() enabled = true;
  @Input() theme: 'classic_confetti' | 'cyber_matrix' | 'golden_star' | 'cyber_sparks' = 'golden_star';
  @Input() maxParticles = 80;
  @Input() speed = 1;
  @Input() wind = 0.8;
  @Input() glow = 5;
  @Input() scale = 0.3;

  private ctx!: CanvasRenderingContext2D | null;
  private particles: any[] = [];
  private rafId = 0;
  private resizeObserver?: ResizeObserver;
  // UI tuning state (can be controlled from parent)
  @Input() controlsEnabled = true;
  @Output() controlsEnabledChange = new EventEmitter<boolean>();
  @Output() settingsChange = new EventEmitter<any>();
  /** Auto-disable overlay after this many ms when `enabled` becomes true. Set 0 to disable auto-hide. */
  @Input() autoDisableMs = 50000;
  /** Emitted when the overlay auto-disables itself after `autoDisableMs` */
  @Output() autoDisabled = new EventEmitter<void>();
  private autoDisableTimer: any = null;
  localMaxParticles = this.maxParticles;
  localSpeed = this.speed;
  localWind = this.wind;
  localGlow = this.glow;
  localScale = this.scale;

  constructor(private host: ElementRef, private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');

    // run animation outside Angular to avoid change detection churn
    this.ngZone.runOutsideAngular(() => {
      this.resizeCanvas();
      this.initParticles();
      this.renderLoop();
    });

    // responsive sizing
    this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
    this.resizeObserver.observe(this.host.nativeElement);

    // keep local UI values in sync with inputs
    this.syncLocalFromInputs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enabled']) {
      const enabledNow = !!changes['enabled'].currentValue;
      if (enabledNow) {
        this.startAutoDisableTimer();
      } else {
        this.clearAutoDisableTimer();
      }
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const rect = this.host.nativeElement.getBoundingClientRect();
    canvas.width = rect.width || 300;
    canvas.height = rect.height || 200;
  }

  private ParticleFactory(x?: number, y?: number, burst = false) {
    const canvas = this.canvasRef.nativeElement;
    return {
      x: x !== undefined ? x : Math.random() * canvas.width,
      y: y !== undefined ? y : (burst ? Math.random() * canvas.height : -20 - Math.random() * 50),
      scale: (Math.random() * 0.8 + 0.4) * this.scale,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      vx: burst ? (Math.random() - 0.5) * 12 * this.speed : (Math.random() - 0.5) * this.wind * 2,
      vy: burst ? (Math.random() - 0.5) * 12 * this.speed - 2 : Math.random() * 2 + this.speed,
      opacity: 1,
      fadeRate: burst ? 0.008 + Math.random() * 0.01 : 0,
      color: this.randomColorForTheme(),
      shape: this.randomShapeForTheme()
    };
  }

  private randomShapeForTheme() {
    switch (this.theme) {
      case 'cyber_matrix': return Math.random() > 0.4 ? 'text' : (Math.random() > 0.5 ? 'rect' : 'bracket');
      case 'golden_star': return Math.random() > 0.3 ? 'star' : 'shimmer';
      case 'cyber_sparks': return 'spark_line';
      default: return Math.random() > 0.5 ? 'rect' : 'ribbon';
    }
  }

  private randomColorForTheme() {
    const palettes: Record<string, string[]> = {
      cyber_matrix: ['#06b6d4','#10b981','#6366f1','#3b82f6','#a7f3d0','#ffffff'],
      golden_star: ['#fbbf24','#f59e0b','#d97706','#fef08a','#eab308'],
      cyber_sparks: ['#ec4899','#06b6d4','#f43f5e','#a855f7','#38bdf8'],
      classic_confetti: ['#f43f5e','#10b981','#3b82f6','#eab308','#a855f7','#ff7849','#ffc82c']
    };
    const list = palettes[this.theme] || palettes['classic_confetti'];
    return list[Math.floor(Math.random() * list.length)];
  }

  private initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.ParticleFactory(undefined, Math.random() * this.canvasRef.nativeElement.height));
    }
  }

  // UI methods
  applyPreset(name: string) {
    alert(`Preset "${name}" applied! (This is a demo; in a real app, you would apply the preset to the overlay settings.)`);
    if (!this.controlsEnabled) return;
    switch(name) {
      case 'golden_star':
        this.localMaxParticles = 8; this.localSpeed = 1; this.localWind = 0.8; this.localGlow = 5; this.localScale = 0.25; this.theme = 'golden_star';
        break;
      case 'cyber_matrix':
        this.localMaxParticles = 150; this.localSpeed = 3; this.localWind = 1.2; this.localGlow = 10; this.localScale = 1; this.theme = 'cyber_matrix';
        break;
      case 'cyber_sparks':
        this.localMaxParticles = 180; this.localSpeed = 4.5; this.localWind = 2; this.localGlow = 12; this.localScale = 1.05; this.theme = 'cyber_sparks';
        break;
      case 'classic_confetti':
      default:
        this.localMaxParticles = 140; this.localSpeed = 3.5; this.localWind = 1.8; this.localGlow = 0; this.localScale = 1; this.theme = 'classic_confetti';
        break;
    }
    this.syncInputsFromLocal();
    this.initParticles();
  }

  onChange(key: string, value: any) {
    if (!this.controlsEnabled) return;
    const num = Number(value);
    switch(key) {
      case 'maxParticles': this.localMaxParticles = Math.max(1, Math.floor(num)); break;
      case 'speed': this.localSpeed = Number(num.toFixed(2)); break;
      case 'wind': this.localWind = Number(num.toFixed(2)); break;
      case 'glow': this.localGlow = Math.floor(num); break;
      case 'scale': this.localScale = Number(num);
    }
    this.syncInputsFromLocal();
  }

  toggleLock() {
    this.controlsEnabled = !this.controlsEnabled;
    this.controlsEnabledChange.emit(this.controlsEnabled);
  }

  private syncInputsFromLocal() {
    this.maxParticles = this.localMaxParticles;
    this.speed = this.localSpeed;
    this.wind = this.localWind;
    this.glow = this.localGlow;
    this.scale = this.localScale;
    // notify parent about live settings
    this.settingsChange.emit({ theme: this.theme, maxParticles: this.maxParticles, speed: this.speed, wind: this.wind, glow: this.glow, scale: this.scale });
  }

  private startAutoDisableTimer() {
    this.clearAutoDisableTimer();
    if (this.autoDisableMs > 0) {
      this.autoDisableTimer = setTimeout(() => {
        this.autoDisableTimer = null;
        this.autoDisabled.emit();
      }, this.autoDisableMs);
    }
  }

  private clearAutoDisableTimer() {
    if (this.autoDisableTimer) {
      clearTimeout(this.autoDisableTimer);
      this.autoDisableTimer = null;
    }
  }

  private syncLocalFromInputs() {
    this.localMaxParticles = this.maxParticles;
    this.localSpeed = this.speed;
    this.localWind = this.wind;
    this.localGlow = this.glow;
    this.localScale = this.scale;
  }

  private renderLoop = () => {
    if (!this.enabled) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.particles = this.particles.filter(p => {
      // physics update
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      if (p.fadeRate === 0) {
        p.vx += (Math.random() - 0.5) * 0.1;
        if (p.x < -50) p.x = canvas.width + 50;
        if (p.x > canvas.width + 50) p.x = -50;
      }
      if (p.fadeRate > 0) p.opacity -= p.fadeRate;

      // draw
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      if (this.glow > 0) { ctx.shadowBlur = this.glow; ctx.shadowColor = p.color; } else ctx.shadowBlur = 0;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      const baseW = 12 * p.scale;
      const baseH = 20 * p.scale;
      switch(p.shape) {
        case 'rect': ctx.fillRect(-baseW/2, -baseH/2, baseW, baseH); break;
        case 'ribbon': ctx.beginPath(); ctx.moveTo(-baseW/2,-baseH/2); ctx.bezierCurveTo(baseW/2,-baseH/4,-baseW/2,baseH/4,baseW/2,baseH/2); ctx.lineWidth = 3*p.scale; ctx.stroke(); break;
        case 'text': ctx.font = `bold ${Math.floor(14*p.scale)}px 'Fira Code', monospace`; ctx.fillText(Math.random() > 0.5 ? '1' : '0', -baseW/2, baseH/4); break;
        case 'bracket': ctx.font = `bold ${Math.floor(16*p.scale)}px sans-serif`; ctx.fillText(Math.random()>0.5?'{ }':'</>', -baseW/2, baseH/4); break;
        case 'star': this.drawStar(ctx,0,0,5,baseW,baseW/2); break;
        case 'shimmer': ctx.beginPath(); ctx.moveTo(0,-baseH); ctx.lineTo(0,baseH); ctx.moveTo(-baseW,0); ctx.lineTo(baseW,0); ctx.lineWidth = 2*p.scale; ctx.stroke(); break;
        case 'spark_line': ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-p.vx*3,-p.vy*3); ctx.lineWidth = 2*p.scale; ctx.stroke(); break;
      }
      ctx.restore();

      // remove when offscreen/faded
      if (p.y > canvas.height + 40) return false;
      if (p.opacity <= 0) return false;
      return true;
    });

    // replenish
    const fallingCount = this.particles.filter(p => p.fadeRate === 0).length;
    if (fallingCount < this.maxParticles) this.particles.push(this.ParticleFactory());

    this.rafId = requestAnimationFrame(this.renderLoop);
  }

  // expose a burst trigger
  public triggerBurst(clientX?: number, clientY?: number) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = clientX !== undefined ? clientX - rect.left : this.canvasRef.nativeElement.width / 2;
    const y = clientY !== undefined ? clientY - rect.top : this.canvasRef.nativeElement.height / 2;
    for (let i = 0; i < 45; i++) {
      this.particles.push(this.ParticleFactory(x, y, true));
    }
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }
}
