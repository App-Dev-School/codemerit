import {
  AfterViewInit, Component, ElementRef, EventEmitter,
  OnDestroy, OnInit, Output, Renderer2, ViewChild, inject
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ThemeService } from '@core';
import { MasterService } from '@core/service/master.service';
import { RatingType } from '@core/models/rating-type';
import { SkillType } from '@core/models/skill-type';

interface Question {
  id: number;
  difficulty: string;
  time: string;
  title: string;
  description: string;
  instruction: string;
  rubric: string;
}

interface InterviewSkillRating {
  uid:              string;       // local UI identity
  skillId:          number;       // jobRoleId | subjectId | topicId | questionId
  skillType:        SkillType;    // JobRole | Subject | Topic | Question
  skillName:        string;       // human-readable label
  imageUrl?:        string;
  rating:           number;       // 0–5 stars
  ratingType:       RatingType;   // always Interview
  note:             string;
  linkedToQuestion: boolean;
  questionId?:      number;
}

interface SkillOption {
  id: number;
  title: string;
  imageUrl?: string;
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

  // ── Theme ──────────────────────────────────────────────────────────────────
  readonly themeService = inject(ThemeService);
  private renderer      = inject(Renderer2);
  private document      = inject<Document>(DOCUMENT);
  private master        = inject(MasterService);

  // Expose enum to template
  readonly SkillType = SkillType;

  // ── Interview context (injectable later via @Input) ─────────────────────────
  readonly interviewJobRoleId   = 1;
  readonly interviewJobRoleName = 'Full Stack Developer – Angular + NestJS';

  toggleTheme(): void {
    this.themeService.toggle(this.document, this.renderer);
  }

  // ── Assessment state ───────────────────────────────────────────────────────
  assessmentStarted = false;

  startAssessment(): void {
    this.assessmentStarted = true;
    this.startTimer();
  }

  // ── Mobile view switch — full-screen tabs instead of a drawer ───────────────
  mobileView: 'board' | 'rate' = 'board';

  setMobileView(view: 'board' | 'rate'): void { this.mobileView = view; }

  get asideClass(): string {
    const base    = 'bg-black border-r border-cm-border flex-col shrink-0';
    const mobile  = this.mobileView === 'rate' ? 'flex w-full h-full' : 'hidden';
    const desktop = 'md:flex md:relative md:w-96 md:h-full md:z-10';
    return `${base} ${mobile} ${desktop}`;
  }

  get sectionClass(): string {
    const base = 'flex-1 flex-col h-full bg-cm-surface-muted relative overflow-hidden';
    const mobile = this.mobileView === 'board' ? 'flex' : 'hidden';
    return `${base} ${mobile} md:flex`;
  }

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  isFullScreen = false;

  callFullscreen(): void {
    if (!this.isFullScreen) {
      this.document.documentElement?.requestFullscreen?.();
    } else {
      this.document.exitFullscreen?.();
    }
    this.isFullScreen = !this.isFullScreen;
  }

  // ── Ratings ────────────────────────────────────────────────────────────────
  ratings = { coding: 1, system: 1, problem: 1, comm: 1 };
  averageScore = '1.0';
  averageColorClass = 'text-rose-400';

  // ── Subject / Slides ───────────────────────────────────────────────────────
  activeSubject = 'web_foundations';
  activeSlideIndex = 0;
  openRubricIds = new Set<number>();

  readonly subjectLabels: Record<string, string> = {
    web_foundations:  'Web Foundations — HTML5, CSS3 & Responsiveness',
    javascript_es6:   'JavaScript & ES6+ Programming',
    angular_rxjs:     'Angular Framework & RxJS',
    nestjs_backend:   'NestJS & Node.js Backend',
    rest_auth:        'REST APIs & Authentication',
    database_orm:     'Database Design & TypeORM',
    system_design:    'System Design & Architecture',
  };

  // ── Milestone preset active state ──────────────────────────────────────────
  activePreset = 'cyber_matrix';

  // ── Candidate status badge ─────────────────────────────────────────────────
  candidateStatusText = 'In Progress';
  candidateStatusClass = 'bg-cm-brand-dim border-cm-brand text-cm-brand-text';

  // ── Tags ───────────────────────────────────────────────────────────────────
  tags: string[] = ['Analytical', 'Fast Thinker', 'System Architecture'];
  tagInput = '';

  // ── Mute ───────────────────────────────────────────────────────────────────
  isMuted = false;

  // ── Board — cleared shows an empty board on demand ─────────────────────────
  boardCleared = false;

  toggleBoardCleared(): void {
    this.boardCleared = !this.boardCleared;
    this.showToast(this.boardCleared ? 'Board cleared.' : 'Questions restored.');
  }

  // ── Skill ratings captured during interview ────────────────────────────────
  interviewSkillRatings: InterviewSkillRating[] = [];

  // Rating form state
  newRatingType:      SkillType | '' = '';
  newRatingSkillId:   number         = 0;
  newRatingSkillName: string         = '';
  newRatingStars:     number         = 0;
  newRatingNote:      string         = '';
  newRatingLinked:    boolean        = true;
  newRatingHover:     number         = 0;
  skillSearch:        string         = '';
  skillPickerOpen:    boolean        = false;

  // ── Toast ──────────────────────────────────────────────────────────────────
  toastMessage = '';
  toastVisible = false;
  private toastTimer?: ReturnType<typeof setTimeout>;

  // ── Timer ──────────────────────────────────────────────────────────────────
  private elapsedSeconds = 0;
  timerDisplay = '00:00';
  private timerInterval?: ReturnType<typeof setInterval>;

  // ── Canvas / Particles ─────────────────────────────────────────────────────
  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animFrameId?: number;
  activeCelebTheme = 'cyber_matrix';
  private readonly onResize = () => this.resizeCanvas();

  // ── Questions Database — Full Stack Developer Track (Angular + NestJS) ──────
  readonly questionsDatabase: Record<string, Question[]> = {

    web_foundations: [
      {
        id: 1, difficulty: 'Easy', time: '8 min',
        title: 'Explain CSS Specificity, Cascade, and the Stacking Context',
        description: 'Evaluate the candidate\'s understanding of how browsers resolve conflicting CSS rules — specificity weight (inline > ID > class > element), cascade order, and when a new stacking context is formed.',
        instruction: 'Ask them to resolve a live CSS conflict on the whiteboard. Watch for confusion between class vs attribute selectors and how !important interacts with cascade layers.',
        rubric: '1. Correctly ranks specificity: inline style > #id > .class > element.\n2. Explains cascade order: origin, specificity, source order.\n3. Names at least two properties that create a new stacking context (e.g. position + z-index, opacity < 1, transform).'
      },
      {
        id: 2, difficulty: 'Medium', time: '10 min',
        title: 'Build a fully responsive 3-column card layout using CSS Grid or Flexbox',
        description: 'Test practical CSS layout skills — whether the candidate can produce a responsive grid that collapses from 3 → 2 → 1 columns at standard breakpoints without any framework.',
        instruction: 'Let them write the HTML + CSS live. Pay attention to how they handle gutters, equal-height cards, and media query breakpoints. Prompt with: "Make it work on a 320px screen."',
        rubric: '1. Uses grid-template-columns: repeat(auto-fit, minmax()) or flex-wrap correctly.\n2. Avoids fixed pixel widths for columns.\n3. Applies appropriate media query breakpoints (768px, 480px).\n4. Cards stretch to equal height without explicit height values.'
      },
      {
        id: 3, difficulty: 'Medium', time: '10 min',
        title: 'Describe the Critical Rendering Path — from HTML bytes to painted pixels',
        description: 'Assess awareness of what the browser does between receiving raw bytes and displaying the first meaningful paint: parsing HTML → DOM, parsing CSS → CSSOM, constructing the render tree, layout, and paint phases.',
        instruction: 'Ask: "If a large CSS file is in <head>, how does it affect Time to First Byte vs First Contentful Paint?" Look for awareness of render-blocking resources and async/defer strategies.',
        rubric: '1. Correctly sequences: DOM → CSSOM → Render Tree → Layout → Paint.\n2. Identifies CSS as render-blocking; JS as parser-blocking by default.\n3. Mentions async, defer, and preload as mitigation strategies.\n4. Aware of Cumulative Layout Shift (CLS) as a Web Core Vital.'
      }
    ],

    javascript_es6: [
      {
        id: 1, difficulty: 'Hard', time: '12 min',
        title: 'Trace execution order through the Event Loop, Call Stack, and Microtask Queue',
        description: 'Evaluate deep understanding of JavaScript\'s single-threaded concurrency model — how synchronous code, Promises (.then), and setTimeout(fn, 0) are queued and executed.',
        instruction: 'Present a code snippet mixing setTimeout, Promise.resolve().then, and queueMicrotask. Ask them to predict exact console.log output order. Then ask: "Why are Promises faster than setTimeout even at 0ms?"',
        rubric: '1. Correctly identifies: sync → microtask queue → macrotask queue execution order.\n2. Knows Promises resolve via the microtask queue (PromiseJobs).\n3. Can explain why nested .then() chains still resolve before any setTimeout.\n4. Mentions requestAnimationFrame fits between macro and render tasks.'
      },
      {
        id: 2, difficulty: 'Medium', time: '10 min',
        title: 'Explain Closures, Lexical Scope, and the IIFE pattern with practical use cases',
        description: 'Test whether the candidate truly understands how functions capture their surrounding scope — not just definition-level knowledge but real use: data privacy, factory functions, module patterns.',
        instruction: 'Ask them to implement a counter factory with increment/decrement/reset using closures — no class or global variable allowed. Then ask: "How does this differ from a class instance?"',
        rubric: '1. Correctly defines closure as function + its captured lexical environment.\n2. Factory function encapsulates private state correctly.\n3. Distinguishes closure scope from prototype chain.\n4. Identifies memory implications of long-lived closures.'
      },
      {
        id: 3, difficulty: 'Medium', time: '10 min',
        title: 'Rewrite a callback pyramid using Promises and then async/await — with error handling',
        description: 'Assess ES6+ fluency: converting legacy callback-based async code to Promise chains, then to async/await, with correct try/catch boundaries and Promise.all parallelism where applicable.',
        instruction: 'Provide a 3-level nested callback (e.g. readFile → parseJSON → fetchAPI). Ask them to convert it twice: first with .then().catch(), then with async/await. Bonus: "Can you run steps 2 and 3 in parallel?"',
        rubric: '1. Correctly wraps callback in new Promise() constructor.\n2. Chain returns new value from each .then().\n3. async/await version uses try/catch for all rejections.\n4. Uses Promise.all([step2, step3]) for parallelism where dependencies allow.'
      }
    ],

    angular_rxjs: [
      {
        id: 1, difficulty: 'Hard', time: '15 min',
        title: 'Compare Default vs OnPush Change Detection — when and why to switch',
        description: 'Assess understanding of Angular\'s change detection tree, zone.js triggering, and the performance implications of running checks on every DOM event across the entire component tree.',
        instruction: 'Ask: "You have a data table with 5,000 rows that re-renders on every keystroke elsewhere in the page — what do you do?" Expect mention of OnPush, immutable inputs, and markForCheck vs detectChanges.',
        rubric: '1. Explains zone.js tick() and how Angular knows when to check.\n2. Correctly identifies OnPush only fires on: reference-changed Input, async pipe, manual markForCheck.\n3. Uses immutable data or Immer.js to work with OnPush.\n4. Knows ChangeDetectorRef.detach() for fully manual control.'
      },
      {
        id: 2, difficulty: 'Medium', time: '10 min',
        title: 'Walk through the Angular Component lifecycle hook sequence and practical use cases',
        description: 'Verify the candidate knows each lifecycle hook\'s timing, what is/isn\'t available at each stage, and typical real-world patterns (init API calls, ViewChild timing, cleanup).',
        instruction: 'Ask them to sequence all hooks on a whiteboard. Then ask: "Why do some developers put HTTP calls in ngOnInit instead of the constructor? What happens if you access a ViewChild in ngOnInit?"',
        rubric: '1. Correct order: constructor → ngOnChanges → ngOnInit → ngDoCheck → ngAfterContentInit → ngAfterContentChecked → ngAfterViewInit → ngAfterViewChecked → ngOnDestroy.\n2. Knows ViewChild/ContentChild are only available after AfterViewInit.\n3. HTTP in constructor is an anti-pattern — DI happens before ngOnInit.\n4. Always unsubscribes or uses takeUntilDestroyed in ngOnDestroy.'
      },
      {
        id: 3, difficulty: 'Medium', time: '12 min',
        title: 'Describe RxJS Subject variants and when to choose each in an Angular service',
        description: 'Test practical RxJS state-sharing knowledge: plain Subject vs BehaviorSubject vs ReplaySubject vs AsyncSubject — and common patterns like sharing a single HTTP request via shareReplay.',
        instruction: 'Ask: "Build a notification service that (a) emits to current and future subscribers, and (b) new subscribers should see the last 3 notifications immediately on subscribe." Which Subject do you pick and why?',
        rubric: '1. Subject — hot, no initial value, misses emissions before subscribe.\n2. BehaviorSubject — always emits current value on subscribe; requires initial value.\n3. ReplaySubject(3) — correct choice for "last 3 notifications" scenario.\n4. Knows shareReplay(1) on HTTP Observables avoids duplicate network calls.'
      }
    ],

    nestjs_backend: [
      {
        id: 1, difficulty: 'Medium', time: '12 min',
        title: 'Explain NestJS Dependency Injection and how the Module system organises layers',
        description: 'Assess understanding of NestJS\'s IoC container — how providers are registered, scoped (singleton/request/transient), exported from modules, and injected into controllers and services.',
        instruction: 'Ask them to design a UserModule with UserController, UserService, and TypeORM UserRepository. Ask: "If AuthModule needs UserService, how do you share it?" Look for module imports/exports knowledge.',
        rubric: '1. Correctly defines @Module({ providers, controllers, exports }).\n2. Knows forwardRef() for circular module dependencies.\n3. Explains provider scopes: DEFAULT (singleton per module), REQUEST, TRANSIENT.\n4. Uses exports: [UserService] so other modules can import it cleanly.'
      },
      {
        id: 2, difficulty: 'Hard', time: '15 min',
        title: 'Implement JWT Authentication using Guards and Passport strategy in NestJS',
        description: 'Test practical auth implementation knowledge: designing a LocalStrategy for login, JwtStrategy for protected routes, and applying AuthGuard at controller and global levels.',
        instruction: 'Walk through the full flow: POST /auth/login → validates credentials → returns JWT. GET /users/me → JwtAuthGuard validates token → returns user. Ask: "How do you attach the decoded user to the request object?"',
        rubric: '1. Uses PassportModule, JwtModule.register({ secret, signOptions }).\n2. LocalStrategy extends PassportStrategy — validates user in validate().\n3. JwtStrategy reads Authorization header, decodes payload, returns user.\n4. @UseGuards(JwtAuthGuard) at controller or global guard in main.ts.\n5. Attaches user via request.user automatically through Passport.'
      },
      {
        id: 3, difficulty: 'Medium', time: '10 min',
        title: 'Explain the role of DTOs, Pipes, and class-validator in a NestJS request pipeline',
        description: 'Verify the candidate understands the input validation layer — how DTOs define the shape of incoming data, class-validator decorators enforce rules, and ValidationPipe auto-rejects malformed requests.',
        instruction: 'Ask them to define a CreateUserDto with: required email (valid format), password (min 8 chars, has uppercase + number), and optional displayName. Then ask: "How does NestJS know to validate it automatically?"',
        rubric: '1. Uses class-validator decorators: @IsEmail(), @MinLength(8), @Matches().\n2. Registers ValidationPipe globally in main.ts: app.useGlobalPipes(new ValidationPipe({ whitelist: true })).\n3. whitelist: true strips unknown properties automatically.\n4. transform: true converts plain objects to class instances.'
      }
    ],

    rest_auth: [
      {
        id: 1, difficulty: 'Medium', time: '12 min',
        title: 'Design a RESTful API for a Job Listings platform — endpoints, verbs, status codes',
        description: 'Test REST design discipline: correct HTTP verb selection, resource-oriented URL structure, nested resources, and appropriate status codes for each scenario (200, 201, 400, 401, 403, 404, 409, 422).',
        instruction: 'Ask them to design the API for: list jobs, get a single job, create a job posting (authenticated employer only), update, soft-delete, and apply to a job. Ask: "What status code for a duplicate application?"',
        rubric: '1. GET /jobs, GET /jobs/:id, POST /jobs, PATCH /jobs/:id, DELETE /jobs/:id.\n2. POST /jobs/:id/applications for applying (nested resource).\n3. 201 for creation, 409 for duplicate application, 403 for non-owner edit attempt.\n4. Uses query params for filtering: GET /jobs?location=remote&page=2&limit=20.\n5. Consistent plural nouns, no verbs in URLs (/jobs not /getJobs).'
      },
      {
        id: 2, difficulty: 'Hard', time: '15 min',
        title: 'Explain the full JWT lifecycle — issuance, validation, refresh token rotation',
        description: 'Assess token-based auth depth: how JWTs are signed and verified, why access tokens should be short-lived, how refresh tokens enable session persistence without re-login, and token rotation for security.',
        instruction: 'Walk through: user logs in → receives access token (15min) + refresh token (7d) → access token expires → client silently calls POST /auth/refresh → new pair issued. Ask: "Where do you store these tokens on the client and why?"',
        rubric: '1. JWT = header.payload.signature — signed with HS256 or RS256 secret.\n2. Access token short-lived (15min); refresh token long-lived, stored in httpOnly cookie.\n3. Refresh endpoint validates refresh token, issues new access + rotated refresh token.\n4. Old refresh token is invalidated (rotation) to prevent replay attacks.\n5. Never stores sensitive data in JWT payload — it is only base64-encoded, not encrypted.'
      },
      {
        id: 3, difficulty: 'Easy', time: '8 min',
        title: 'What is CORS and how do you configure it securely in NestJS?',
        description: 'Verify understanding of the browser\'s Same-Origin Policy, why CORS headers are necessary for cross-origin API calls, and the security risks of overly permissive configurations.',
        instruction: 'Ask: "Your Angular app runs on localhost:4200 and NestJS on localhost:3000 — the browser blocks API calls. How do you fix it?" Then ask: "What\'s wrong with enabling CORS for all origins (*) in production?"',
        rubric: '1. Correctly identifies Same-Origin Policy as the browser restriction.\n2. Enables CORS in main.ts: app.enableCors({ origin: [allowed origins], credentials: true }).\n3. Knows that * and credentials: true cannot be combined (browser blocks it).\n4. Explains preflight OPTIONS requests and what triggers them.\n5. Recommends environment-based allowed origins (dev vs prod).'
      }
    ],

    database_orm: [
      {
        id: 1, difficulty: 'Hard', time: '20 min',
        title: 'Design the database schema for a Job Board — users, companies, listings, applications',
        description: 'Evaluate entity-relationship thinking: identifying the right tables, primary/foreign keys, normalisation level (at least 3NF), and the business rules that drive the schema (one user can apply once per listing, etc.).',
        instruction: 'Ask them to draw the ERD on a whiteboard with at least 4 entities. Ask: "How do you prevent a user from applying to the same listing twice at the database level, not just application level?" Expect UNIQUE constraints.',
        rubric: '1. Tables: users, companies, job_listings, applications — each with appropriate PKs.\n2. Correct FK relationships: listings.company_id → companies.id, applications.user_id → users.id.\n3. UNIQUE(user_id, listing_id) on applications table for duplicate prevention.\n4. Separates user login credentials from profile data (single-responsibility per table).\n5. Considers soft-delete (deleted_at TIMESTAMP NULL) vs hard-delete for listings.'
      },
      {
        id: 2, difficulty: 'Medium', time: '12 min',
        title: 'Explain TypeORM relations — OneToMany, ManyToMany — and how eager loading affects queries',
        description: 'Test ORM-layer knowledge: how to define entity relations in TypeORM, when to use eager vs lazy loading, and how the underlying SQL JOIN queries differ between the two approaches.',
        instruction: 'Ask them to define a User entity with OneToMany to Posts and a ManyToMany with Roles. Ask: "If you mark roles as eager: true on User, what happens when you call userRepository.findOne()? Is that safe at scale?"',
        rubric: '1. Correct @OneToMany(() => Post, post => post.user) on User entity.\n2. @ManyToMany with @JoinTable on the owning side.\n3. eager: true auto-JOINs on every findOne/find — safe for small reference data (roles), dangerous for large collections.\n4. Recommends lazy loading (Promise<Role[]>) or explicit relations in find options.\n5. Aware of the N+1 query problem and how query builder or relations array solves it.'
      },
      {
        id: 3, difficulty: 'Medium', time: '8 min',
        title: 'What are database migrations and how does TypeORM manage schema evolution safely?',
        description: 'Assess understanding of why auto-synchronize is unsafe in production, how migration files provide a traceable, reversible history of schema changes, and the workflow for generating and running them.',
        instruction: 'Ask: "Your team adds a NOT NULL column to a 1M-row table in production. How do you do this without downtime?" Expect mention of: nullable first, backfill, add NOT NULL constraint, all in separate migration steps.',
        rubric: '1. synchronize: true is for development only — never production (it can drop columns).\n2. typeorm migration:generate creates a timestamped migration file from entity diffs.\n3. migration:run applies pending migrations in sequence; migration:revert undoes last one.\n4. NOT NULL on existing table: add as nullable → backfill default value → add NOT NULL constraint in 3 separate migrations.\n5. Migration files are committed to version control alongside the code that requires them.'
      }
    ],

    system_design: [
      {
        id: 1, difficulty: 'Expert', time: '25 min',
        title: 'Design a scalable file upload and async processing service for a job platform',
        description: 'Architect the end-to-end flow for CV/resume uploads: client → API → object storage → async processing queue → parsed results stored in DB. The system should handle 10K uploads/hour and remain responsive under load.',
        instruction: 'Let them diagram the architecture. Prompt: "The PDF parsing takes 3–5 seconds per file. How do you ensure the API responds instantly while processing happens in the background?" Look for queue-based decoupling.',
        rubric: '1. Multipart upload to NestJS → streams directly to S3/GCS (never stores on API server disk).\n2. On upload success, enqueues a job (Bull/RabbitMQ) with file location metadata.\n3. Separate worker service consumes the queue and processes the PDF.\n4. API returns 202 Accepted immediately; client polls or uses WebSocket for completion status.\n5. Failed jobs retry with exponential backoff; dead-letter queue captures persistent failures.'
      },
      {
        id: 2, difficulty: 'Hard', time: '15 min',
        title: 'Design a multi-layer caching strategy for an Angular + NestJS application',
        description: 'Evaluate understanding of where caching can be applied across the full stack: HTTP cache headers, CDN edge caching, in-memory Redis cache in the API, and Angular HTTP interceptor-level caching on the client.',
        instruction: 'Ask: "A public job listings endpoint is called 50K times/min. Walk me through every layer where you can cache the response and what the TTL strategy is for each layer." Expect a layered answer.',
        rubric: '1. Browser: Cache-Control: public, max-age=60 header on GET /jobs.\n2. CDN (CloudFront/Cloudflare): caches at edge PoPs; invalidated on data change via tag-based purge.\n3. API layer: Redis cache with TTL of 30–60s; cache key = hash of query params.\n4. Angular HTTP interceptor: caches identical GET requests in-memory for session duration.\n5. Identifies cache invalidation as the hard problem — discusses write-through vs TTL-expiry strategies.'
      },
      {
        id: 3, difficulty: 'Medium', time: '10 min',
        title: 'Horizontal vs Vertical Scaling — choosing the right strategy for Angular + NestJS',
        description: 'Test whether the candidate understands the trade-offs between scaling up (bigger server) and scaling out (more servers), and what application-level changes are required to make a NestJS API horizontally scalable.',
        instruction: 'Ask: "You need to scale your NestJS API to handle 10× traffic. What breaks if you just spin up 3 instances behind a load balancer without changing the code?" Expect mention of in-process state, session storage, and websocket affinity.',
        rubric: '1. Vertical scaling: simpler but has an upper hardware limit; no code changes needed.\n2. Horizontal scaling requires: externalising session state (Redis), stateless JWT auth, and shared job queues.\n3. In-process caches (Map/object) are not shared across instances — must move to Redis.\n4. WebSocket connections need sticky sessions or a Redis pub/sub adapter (socket.io-redis).\n5. Database becomes the next bottleneck — read replicas and connection pooling are the next step.'
      }
    ]
  };

  // ── Computed ───────────────────────────────────────────────────────────────
  get activeQuestions(): Question[] {
    return this.questionsDatabase[this.activeSubject] ?? [];
  }

  get activeQuestion(): Question | null {
    return this.activeQuestions[this.activeSlideIndex] ?? null;
  }

  get activeSubjectTitle(): string {
    return this.subjectLabels[this.activeSubject];
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void { }

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
    this.averageColorClass = n >= 8 ? 'text-emerald-300' : n >= 5 ? 'text-indigo-300' : 'text-rose-300';
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
    const base = 'absolute inset-0 w-full h-full flex flex-col justify-between bg-cm-surface border border-cm-border rounded-2xl p-6 shadow-xl transition-all duration-500 ease-out transform';
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

  // ── Skill rating dropdowns ─────────────────────────────────────────────────
  get skillDropdownOptions(): SkillOption[] {
    if (this.newRatingType === SkillType.Subject) {
      return (this.master.subjects as any[]).map(s => ({
        id: s.id, title: s.title, imageUrl: s.image ?? s.imageUrl
      }));
    }
    if (this.newRatingType === SkillType.Topic) {
      return (this.master.topics as any[]).map(t => ({
        id: t.id, title: t.title
      }));
    }
    return [];
  }

  get showSkillDropdown(): boolean {
    return this.newRatingType === SkillType.Subject
        || this.newRatingType === SkillType.Topic;
  }

  get filteredSkillOptions(): SkillOption[] {
    const q = this.skillSearch.toLowerCase().trim();
    if (!q) return this.skillDropdownOptions;
    return this.skillDropdownOptions.filter(o => o.title.toLowerCase().includes(q));
  }

  get canAddRating(): boolean {
    if (!this.newRatingType || !this.newRatingStars) return false;
    if (this.showSkillDropdown && !this.newRatingSkillId) return false;
    if (this.newRatingType === SkillType.Question && !this.activeQuestion) return false;
    return true;
  }

  get techEvalAvg(): number {
    if (!this.interviewSkillRatings.length) return 0;
    const sum = this.interviewSkillRatings.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / this.interviewSkillRatings.length) * 10) / 10;
  }

  get techEvalAvgColor(): string {
    const avg = this.techEvalAvg;
    if (avg >= 4.5) return 'text-emerald-400';
    if (avg >= 3)   return 'text-amber-400';
    if (avg >= 2)   return 'text-orange-400';
    return 'text-rose-400';
  }

  onRatingTypeChange(event: Event): void {
    this.newRatingType      = (event.target as HTMLSelectElement).value as SkillType | '';
    this.newRatingSkillId   = 0;
    this.newRatingSkillName = '';
    this.skillSearch        = '';
    this.skillPickerOpen    = false;
  }

  selectSkillOption(opt: SkillOption): void {
    this.newRatingSkillId   = opt.id;
    this.newRatingSkillName = opt.title;
    this.skillSearch        = '';
    this.skillPickerOpen    = false;
  }

  // ── Skill ratings ──────────────────────────────────────────────────────────
  addInterviewRating(): void {
    if (!this.canAddRating) return;

    let skillId   = this.newRatingSkillId;
    let skillName = this.newRatingSkillName;
    let imageUrl: string | undefined;

    if (this.newRatingType === SkillType.JobRole) {
      skillId   = this.interviewJobRoleId;
      skillName = this.interviewJobRoleName;
    }

    if (this.newRatingType === SkillType.Question) {
      const aq  = this.activeQuestion!;
      skillId   = aq.id;
      skillName = aq.title;
    }

    if (this.newRatingType === SkillType.Subject) {
      const opt = this.skillDropdownOptions.find(o => o.id === skillId);
      imageUrl  = opt?.imageUrl;
    }

    const aq           = this.activeQuestion;
    const isQType      = this.newRatingType === SkillType.Question;
    const linked       = isQType || (this.newRatingLinked && !!aq && this.assessmentStarted);

    this.interviewSkillRatings.push({
      uid:              `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      skillId,
      skillType:        this.newRatingType as SkillType,
      skillName,
      imageUrl,
      rating:           this.newRatingStars,
      ratingType:       RatingType.Interview,
      note:             this.newRatingNote.trim(),
      linkedToQuestion: linked,
      questionId:       linked ? aq?.id : undefined,
    });

    // Keep type so user can quickly add another rating of the same type
    this.newRatingSkillId   = 0;
    this.newRatingSkillName = '';
    this.newRatingStars     = 0;
    this.newRatingNote      = '';
    this.skillPickerOpen    = false;
    this.showToast(`Rating added: ${skillName}`);
  }

  removeInterviewRating(uid: string): void {
    this.interviewSkillRatings = this.interviewSkillRatings.filter(r => r.uid !== uid);
  }

  setHoverStar(n: number): void { this.newRatingHover = n; }
  clearHoverStar():        void { this.newRatingHover = 0; }

  isStarFilled(star: number): boolean {
    return star <= (this.newRatingHover || this.newRatingStars);
  }

  ratingLabel(r: number): string {
    return ['', 'Weak', 'Fair', 'Average', 'Strong', 'Exceptional'][r] ?? '';
  }

  skillTypeDotClass(type: SkillType): string {
    const map: Partial<Record<SkillType, string>> = {
      [SkillType.JobRole]:  'bg-indigo-500',
      [SkillType.Subject]:  'bg-violet-500',
      [SkillType.Topic]:    'bg-sky-500',
      [SkillType.Question]: 'bg-emerald-500',
    };
    return map[type] ?? 'bg-cm-text-muted';
  }

  truncateText(text: string, max = 32): string {
    return text.length > max ? text.slice(0, max) + '…' : text;
  }

  // ── Milestone ──────────────────────────────────────────────────────────────
  triggerStateMilestone(theme: string, status: string): void {
    this.activeCelebTheme = theme;
    this.activePreset = theme;
    const map: Record<string, [string, string]> = {
      strong_hire: ['STRONG HIRE',    'bg-cm-brand-dim    border-cm-brand       text-cm-brand-text'],
      hire:        ['HIRE',           'bg-amber-500/10    border-amber-500/40   text-amber-700   dark:text-amber-400'],
      no_hire:     ['STRONG NO HIRE', 'bg-rose-500/10     border-rose-500/40    text-rose-700    dark:text-rose-400'],
      pending:     ['UNDER REVIEW',   'bg-sky-500/10      border-sky-500/40     text-sky-700     dark:text-sky-400'],
      passed:      ['MOCK PASSED',    'bg-emerald-500/10  border-emerald-500/40 text-emerald-700 dark:text-emerald-400'],
      failed:      ['MOCK FAILED',    'bg-orange-500/10   border-orange-500/40  text-orange-700  dark:text-orange-400'],
    };
    [this.candidateStatusText, this.candidateStatusClass] = map[status] ?? ['In Progress', 'bg-cm-brand-dim border-cm-brand text-cm-brand-text'];
    this.spawnBurst(75);
    this.showToast(`Milestone updated: ${this.candidateStatusText}`);
  }

  presetBtnClass(theme: string, color: 'indigo' | 'amber' | 'rose' | 'sky' | 'emerald' | 'orange' = 'indigo'): string {
    if (theme === this.activePreset) {
      const active: Record<string, string> = {
        indigo:  'border-[2.5px] border-indigo-500  bg-indigo-50  dark:bg-indigo-500/10  shadow-md shadow-indigo-500/15',
        amber:   'border-[2.5px] border-amber-500   bg-amber-50   dark:bg-amber-500/10   shadow-md shadow-amber-500/15',
        rose:    'border-[2.5px] border-rose-500    bg-rose-50    dark:bg-rose-500/10    shadow-md shadow-rose-500/15',
        sky:     'border-[2.5px] border-sky-500     bg-sky-50     dark:bg-sky-500/10     shadow-md shadow-sky-500/15',
        emerald: 'border-[2.5px] border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-md shadow-emerald-500/15',
        orange:  'border-[2.5px] border-orange-500  bg-orange-50  dark:bg-orange-500/10  shadow-md shadow-orange-500/15',
      };
      return `px-3 py-2.5 ${active[color]}`;
    }
    return 'px-3 py-2.5 bg-white dark:bg-cm-surface-raised shadow-sm hover:shadow-md hover:bg-cm-surface-hover border border-transparent';
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
      this.elapsedSeconds++;
      const m = Math.floor(this.elapsedSeconds / 60);
      const s = this.elapsedSeconds % 60;
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
