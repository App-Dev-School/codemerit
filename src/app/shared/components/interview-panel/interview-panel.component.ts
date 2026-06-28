import {
  AfterViewInit, Component, ElementRef, EventEmitter,
  OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Question {
  id: number;
  difficulty: string;
  time: string;
  title: string;
  description: string;
  instruction: string;
  rubric: string;
}

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
  selector: 'app-interview-panel',
  imports: [FormsModule],
  templateUrl: './interview-panel.component.html',
  styleUrl: './interview-panel.component.css'
})
export class InterviewPanelComponent implements OnInit, AfterViewInit, OnDestroy {

  @Output() submitted = new EventEmitter<string>();
  @ViewChild('celebCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tagInputEl') tagInputRef!: ElementRef<HTMLTextAreaElement>;

  // ── Ratings ────────────────────────────────────────────────────────────────
  ratings = { coding: 8, system: 7, problem: 8, comm: 7 };
  averageScore = '7.5';
  averageColorClass = 'text-indigo-400';

  // ── Subject / Slides ───────────────────────────────────────────────────────
  activeSubject = 'frontend';
  activeSlideIndex = 0;
  openRubricIds = new Set<number>();

  readonly subjectLabels: Record<string, string> = {
    frontend: 'Frontend & JavaScript Core',
    system_design: 'System Architecture Design',
    data_structures: 'Algorithms & Data Structures',
    behavioral: 'Behavioral & Leadership'
  };

  // ── Milestone preset active state ──────────────────────────────────────────
  activePreset = 'cyber_matrix';

  // ── Candidate status badge ─────────────────────────────────────────────────
  candidateStatusText = 'In Progress';
  candidateStatusClass = 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300';

  // ── Tags ───────────────────────────────────────────────────────────────────
  tags: string[] = ['Analytical', 'Fast Thinker', 'System Architecture'];
  tagInput = '';

  // ── Mute ───────────────────────────────────────────────────────────────────
  isMuted = false;

  // ── Toast ──────────────────────────────────────────────────────────────────
  toastMessage = '';
  toastVisible = false;
  private toastTimer?: ReturnType<typeof setTimeout>;

  // ── Timer ──────────────────────────────────────────────────────────────────
  timeRemaining = 42 * 60 + 15;
  timerDisplay = '42:15';
  private timerInterval?: ReturnType<typeof setInterval>;

  // ── Canvas / Particles ─────────────────────────────────────────────────────
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animFrameId?: number;
  activeCelebTheme = 'cyber_matrix';
  private readonly onResize = () => this.resizeCanvas();

  // ── Questions Database ─────────────────────────────────────────────────────
  readonly questionsDatabase: Record<string, Question[]> = {
    frontend: [
      {
        id: 1, difficulty: 'Hard', time: '15 min',
        title: 'Implement a custom Debounce with leading & trailing edge configurations',
        description: "Assess the candidate's control over JavaScript lexical scoping, high-order functions, execution contexts, and asynchronous scheduling API execution timings.",
        instruction: 'Ask them to draft the code structure on a whiteboard. Pay careful attention to boundary conditions (e.g., immediate invokes, argument preservation, and teardown callbacks).',
        rubric: '1. Handles multiple parameter streams accurately.\n2. Includes proper clearTimeout cleaning cycles.\n3. Understands leading/trailing execution configurations.'
      },
      {
        id: 2, difficulty: 'Medium', time: '10 min',
        title: 'Advanced DOM Event Delegation and Performance scaling issues',
        description: 'The applicant needs to demonstrate the mechanics of the event propagation loop (Capturing, Targeting, and Bubbling phases).',
        instruction: 'Discuss design choices of listening to events at document/root container node vs individual leaf DOM components inside heavily nested lists.',
        rubric: '1. Differentiates e.target vs e.currentTarget.\n2. Safely utilises .matches() or node targeting filters.\n3. Explains visual performance gains in memory footprint optimisation.'
      },
      {
        id: 3, difficulty: 'Hard', time: '15 min',
        title: 'Construct dynamic render reconciliation logic (Virtual DOM)',
        description: "Examine understanding of React's fiber architecture or general declarative Virtual DOM comparison mechanisms.",
        instruction: 'Identify what happens under the hood when state mutations call render trees. Walk through component key assignments and diff arrays.',
        rubric: "1. Mentions tree depth comparison limitations.\n2. Explains the purpose of structural unique 'keys'.\n3. Details DOM commit phase optimisation."
      }
    ],
    system_design: [
      {
        id: 1, difficulty: 'Expert', time: '20 min',
        title: 'Design a High-Throughput Notification Engine',
        description: 'Structure a system capable of handling 100K notification events/sec across multiple conduits (Push alerts, SMS buffers, Email queues).',
        instruction: 'Focus design layout towards reliability mechanics, dynamic load balancing, rate limiting bottlenecks, and redundant broker setups.',
        rubric: '1. Leverages reliable message brokers (Kafka/RabbitMQ).\n2. Integrates user-preference caching databases (Redis).\n3. Solves double delivery concerns using deduplication keys.'
      },
      {
        id: 2, difficulty: 'Expert', time: '25 min',
        title: 'Scalable Real-time Chat & Collaboration Server Design',
        description: 'Outline a real-time messaging system showing instant message propagation, typing indicators, and message delivery confirmations.',
        instruction: 'Evaluate deep routing strategies, persistent WebSocket connection pooling protocols, and microservice separations.',
        rubric: '1. Explains Redis Pub/Sub backplane integration.\n2. Proposes solid database schemas (NoSQL DB scaling).\n3. Handles dead-letter queues and offline delivery push setups.'
      },
      {
        id: 3, difficulty: 'Hard', time: '15 min',
        title: 'Distributed Rate Limiter Implementation Strategy',
        description: 'Architect a rate limiter to act as a security gateway shielding corporate APIs from cascading high-traffic denial-of-service attempts.',
        instruction: 'Compare the strengths of token bucket algorithms, leaky buckets, and sliding log calculation implementations.',
        rubric: '1. Solves synchronisation race conditions (Redis Lua scripting).\n2. Understands fail-open vs fail-close API gateway strategies.\n3. Balances processing overhead latency footprints.'
      }
    ],
    data_structures: [
      {
        id: 1, difficulty: 'Hard', time: '20 min',
        title: 'Build O(1) Cache Eviction Policy (LRU Architecture)',
        description: 'Build an LRU Cache storage block with fast fetch and input cycles operating at absolute constant lookup limits.',
        instruction: 'The candidate must describe why HashMaps alone are insufficient, leading into combined Linked List architectures.',
        rubric: '1. Selects doubly-linked list structures nested with lookup maps.\n2. Updates item prioritisation during active retrieval.\n3. Handles capacity check teardowns flawlessly.'
      },
      {
        id: 2, difficulty: 'Medium', time: '15 min',
        title: 'Identify structural cycles within active Graph dependencies',
        description: 'Draft code tracking build-dependency trees to ensure circular task inclusions are resolved early.',
        instruction: 'Deduce cyclic dependency algorithms using Depth-First Search (DFS) recursive tracking structures.',
        rubric: '1. Explains graph representation maps (Adj list).\n2. Leverages state arrays to prevent overlapping iterations.\n3. Demonstrates understanding of topological sorting concepts.'
      }
    ],
    behavioral: [
      {
        id: 1, difficulty: 'Medium', time: '10 min',
        title: 'Navigating deep critical engineering conflicts within teams',
        description: 'Examine behavioral methods of dealing with high-stress architectural alignment disputes between engineering squads.',
        instruction: 'Prompt applicant to detail true instances of performance disputes or design decisions and the steps taken to reach consensus.',
        rubric: '1. Uses structured logic patterns (STAR method).\n2. Prioritises product metrics and group focus over personal beliefs.\n3. Handles leadership interactions in a mature, collaborative tone.'
      },
      {
        id: 2, difficulty: 'Medium', time: '10 min',
        title: 'Managing critical technical debt vs aggressive feature targets',
        description: 'Discuss strategies for managing executive deadlines while legacy platforms require critical structural re-engineering.',
        instruction: 'Assess compromise skills, timeline creation techniques, and technical health tracking indicators.',
        rubric: '1. Articulates technical debt impact to non-technical partners.\n2. Proposes iterative modular rollouts instead of pure rebuilds.\n3. Establishes sound QA verification standards.'
      }
    ]
  };

  // ── Computed ───────────────────────────────────────────────────────────────
  get activeQuestions(): Question[] {
    return this.questionsDatabase[this.activeSubject] ?? [];
  }

  get activeSubjectTitle(): string {
    return this.subjectLabels[this.activeSubject];
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.startTimer();
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', this.onResize);
    this.runAnimationLoop();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
    clearTimeout(this.toastTimer);
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onResize);
  }

  // ── Metrics ────────────────────────────────────────────────────────────────
  updateMetrics(): void {
    const avg = ((+this.ratings.coding + +this.ratings.system + +this.ratings.problem + +this.ratings.comm) / 4).toFixed(1);
    this.averageScore = avg;
    const n = +avg;
    this.averageColorClass = n >= 8 ? 'text-emerald-400' : n >= 5 ? 'text-indigo-400' : 'text-rose-500';
  }

  // ── Subject ────────────────────────────────────────────────────────────────
  changeSubject(value: string): void {
    this.activeSubject = value;
    this.activeSlideIndex = 0;
    this.openRubricIds.clear();
  }

  // ── Slides ─────────────────────────────────────────────────────────────────
  navigateSlide(direction: 'prev' | 'next'): void {
    const total = this.activeQuestions.length;
    if (direction === 'next') {
      if (this.activeSlideIndex < total - 1) this.activeSlideIndex++;
      else this.showToast('At end of active question bank!');
    } else {
      if (this.activeSlideIndex > 0) this.activeSlideIndex--;
      else this.showToast('At beginning of question bank!');
    }
  }

  goToSlide(idx: number): void {
    this.activeSlideIndex = idx;
  }

  slideClass(idx: number): string {
    const base = 'absolute inset-0 w-full h-full flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl transition-all duration-500 ease-out transform';
    if (idx === this.activeSlideIndex)
      return `${base} opacity-100 translate-x-0 scale-100 pointer-events-auto z-10`;
    if (idx < this.activeSlideIndex)
      return `${base} opacity-0 -translate-x-full scale-95 pointer-events-none z-0`;
    return `${base} opacity-0 translate-x-full scale-95 pointer-events-none z-0`;
  }

  toggleRubric(id: number): void {
    this.openRubricIds.has(id) ? this.openRubricIds.delete(id) : this.openRubricIds.add(id);
  }

  isRubricOpen(id: number): boolean {
    return this.openRubricIds.has(id);
  }

  // ── Tags ───────────────────────────────────────────────────────────────────
  handleTagInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addCustomTag();
    }
  }

  addCustomTag(): void {
    const val = this.tagInput.trim();
    if (!val) { this.tagInputRef?.nativeElement.focus(); return; }
    if (this.tags.includes(val)) { this.showToast('Tag already exists!'); this.tagInput = ''; return; }
    this.tags.push(val);
    this.tagInput = '';
  }

  removeTag(index: number): void {
    this.tags.splice(index, 1);
  }

  focusTagInput(): void {
    this.tagInputRef?.nativeElement.focus();
  }

  // ── Mute ───────────────────────────────────────────────────────────────────
  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.showToast(this.isMuted ? 'Your microphone has been muted.' : 'Microphone is live.');
  }

  // ── Milestone ──────────────────────────────────────────────────────────────
  triggerStateMilestone(theme: string, status: string): void {
    this.activeCelebTheme = theme;
    this.activePreset = theme;
    const map: Record<string, [string, string]> = {
      strong_hire: ['STRONG HIRE',    'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'],
      hire:        ['HIRE',           'bg-amber-500/10 border-amber-500/40 text-amber-400'],
      no_hire:     ['STRONG NO HIRE', 'bg-rose-500/10 border-rose-500/40 text-rose-400'],
      pending:     ['UNDER REVIEW',   'bg-sky-500/10 border-sky-500/40 text-sky-400']
    };
    [this.candidateStatusText, this.candidateStatusClass] = map[status] ?? ['In Progress', 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'];
    this.spawnBurst(75);
    this.showToast(`Milestone updated: ${this.candidateStatusText}`);
  }

  presetBtnClass(theme: string): string {
    return theme === this.activePreset
      ? 'px-3 py-2 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 text-indigo-300'
      : 'px-3 py-2 bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700 text-slate-300';
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  submitAndExit(): void {
    this.activeCelebTheme = 'classic_confetti';
    this.spawnBurst(90, true);
    this.showToast(`Assessment Submitted! Avg Score: ${this.averageScore}/10`);
    this.submitted.emit('done');
  }

  // ── Toast ──────────────────────────────────────────────────────────────────
  showToast(message: string): void {
    this.toastMessage = message;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 3000);
  }

  // ── Timer ──────────────────────────────────────────────────────────────────
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) this.timeRemaining--;
      const m = Math.floor(this.timeRemaining / 60);
      const s = this.timeRemaining % 60;
      this.timerDisplay = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }, 1000);
  }

  // ── Canvas ─────────────────────────────────────────────────────────────────
  private resizeCanvas(): void {
    const c = this.canvasRef.nativeElement;
    c.width = window.innerWidth;
    c.height = window.innerHeight;
  }

  private spawnBurst(count: number, center = false): void {
    const c = this.canvasRef?.nativeElement;
    if (!c) return;
    for (let i = 0; i < count; i++) {
      if (center) {
        this.particles.push(this.makeParticle(c.width / 2, c.height / 2, true));
      } else {
        this.particles.push(this.makeParticle(c.width / 3, c.height / 2, true));
        this.particles.push(this.makeParticle((c.width / 3) * 2, c.height / 2, true));
      }
    }
  }

  private runAnimationLoop(): void {
    const loop = () => {
      const c = this.canvasRef?.nativeElement;
      if (!c) return;
      this.ctx.clearRect(0, 0, c.width, c.height);
      this.particles = this.particles.filter(p => { const a = this.tickParticle(p); if (a) this.paintParticle(p); return a; });
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private makeParticle(x: number, y: number, burst = false): Particle {
    const theme = this.activeCelebTheme;
    const palettes: Record<string, string[]> = {
      cyber_matrix:    ['#06b6d4', '#10b981', '#6366f1', '#a7f3d0', '#ffffff'],
      golden_star:     ['#fbbf24', '#f59e0b', '#d97706', '#fef08a', '#ffffff'],
      cyber_sparks:    ['#ec4899', '#06b6d4', '#f43f5e', '#a855f7', '#38bdf8'],
      classic_confetti:['#f43f5e', '#10b981', '#3b82f6', '#eab308', '#a855f7', '#ff7849']
    };
    const shapes: Record<string, string[]> = {
      cyber_matrix:    ['text', 'text', 'bracket'],
      golden_star:     ['star', 'star', 'shimmer'],
      cyber_sparks:    ['spark_line'],
      classic_confetti:['rect', 'ribbon']
    };
    const chars = ['0','1','{','}','<','>','[]','&&','||',';','=>','++'];
    const pal   = palettes[theme] ?? palettes['classic_confetti'];
    const shps  = shapes[theme]   ?? shapes['classic_confetti'];
    const spd   = 3;
    const vx = burst ? (Math.random() - 0.5) * 12 * spd : (Math.random() - 0.5) * 2;
    const vy = burst ? (Math.random() - 0.5) * 12 * spd - 2 : Math.random() * 3 + 2;
    return {
      x, y, vx, vy,
      scale: Math.random() * 0.7 + 0.5, scaleX: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08,
      tumbleSpeed: Math.random() * 0.06 + 0.02,
      shape: shps[Math.floor(Math.random() * shps.length)],
      color: pal[Math.floor(Math.random() * pal.length)],
      textChar: chars[Math.floor(Math.random() * chars.length)],
      opacity: 1,
      fadeRate: burst ? 0.008 + Math.random() * 0.008 : 0.003,
      theme
    };
  }

  private tickParticle(p: Particle): boolean {
    p.x += p.vx; p.y += p.vy;
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
    ctx.shadowBlur = p.theme === 'classic_confetti' ? 0 : 8;
    ctx.shadowColor = p.color;
    ctx.fillStyle = ctx.strokeStyle = p.color;
    switch (p.shape) {
      case 'rect':
        ctx.fillRect(-bw / 2, -bh / 2, bw, bh); break;
      case 'ribbon':
        ctx.beginPath();
        ctx.moveTo(-bw/2,-bh/2); ctx.bezierCurveTo(bw/2,-bh/4,-bw/2,bh/4,bw/2,bh/2);
        ctx.lineWidth = 2.5 * p.scale; ctx.stroke(); break;
      case 'text':
        ctx.font = `bold ${Math.floor(12 * p.scale)}px 'Fira Code',monospace`;
        ctx.fillText(p.textChar, -bw/2, bh/4); break;
      case 'bracket':
        ctx.font = `bold ${Math.floor(13 * p.scale)}px sans-serif`;
        ctx.fillText(Math.random() > 0.5 ? '{ }' : '</>', -bw/2, bh/4); break;
      case 'star':
        this.drawStar(ctx, 0, 0, 5, bw, bw/2); break;
      case 'shimmer':
        ctx.beginPath(); ctx.moveTo(0,-bh); ctx.lineTo(0,bh); ctx.moveTo(-bw,0); ctx.lineTo(bw,0);
        ctx.lineWidth = 2 * p.scale; ctx.stroke(); break;
      case 'spark_line':
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-p.vx*3.5,-p.vy*3.5);
        ctx.lineWidth = 1.8 * p.scale; ctx.stroke(); break;
    }
    ctx.restore();
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, r: number, ir: number): void {
    let rot = Math.PI / 2 * 3, step = Math.PI / spikes;
    ctx.beginPath(); ctx.moveTo(cx, cy - r);
    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot)*r,  cy + Math.sin(rot)*r);  rot += step;
      ctx.lineTo(cx + Math.cos(rot)*ir, cy + Math.sin(rot)*ir); rot += step;
    }
    ctx.lineTo(cx, cy - r); ctx.closePath(); ctx.fill();
  }
}
