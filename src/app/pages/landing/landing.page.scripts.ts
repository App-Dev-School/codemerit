const typewriterLines = [
  'Scheduling SME assessment sessions...',
  'Evaluating candidate skill readiness...',
  'Issuing badges, certificates and recognition...',
  'Aligning tracks with expert review panels...',
  'Tracking performance across targeted skill lanes...'
];

const roleConfig = {
  'js-programmer': {
    title: 'JavaScript Programmer',
    subjects: [
      { name: 'ES6 & Async Patterns', score: 92 },
      { name: 'DOM, Events & Browser APIs', score: 88 },
      { name: 'Testing & Debugging JavaScript', score: 84 },
      { name: 'Performance & Frontend Architecture', score: 78 }
    ],
    badges: [
      { name: 'JS Syntax Pro', achieved: true, icon: 'code' },
      { name: 'Async Craftsman', achieved: true, icon: 'zap' },
      { name: 'Frontend Maestro', achieved: false, icon: 'monitor' }
    ],
    recognitions: [
      { value: 'foundation-badge', text: 'Foundation Badge' },
      { value: 'professional-certificate', text: 'Professional Credential' },
      { value: 'expert-badge', text: 'SME Recommendation' }
    ]
  },
  'python-programmer': {
    title: 'Python Programmer',
    subjects: [
      { name: 'Python Core Concepts', score: 90 },
      { name: 'Scripting, Automation & APIs', score: 85 },
      { name: 'Data Modeling & Testing', score: 79 },
      { name: 'Packaging & Deployment', score: 74 }
    ],
    badges: [
      { name: 'Pythonic Craftsman', achieved: true, icon: 'box' },
      { name: 'API Builder', achieved: false, icon: 'cloud' },
      { name: 'Automation Specialist', achieved: false, icon: 'terminal' }
    ],
    recognitions: [
      { value: 'foundation-badge', text: 'Foundation Badge' },
      { value: 'professional-certificate', text: 'Professional Credential' },
      { value: 'expert-badge', text: 'SME Recommendation' }
    ]
  },
  'web-designer': {
    title: 'Web Designer',
    subjects: [
      { name: 'Responsive Design Systems', score: 91 },
      { name: 'UI Layout & CSS Architecture', score: 86 },
      { name: 'Accessibility & Inclusive UX', score: 83 },
      { name: 'Design-to-Code Handoff', score: 77 }
    ],
    badges: [
      { name: 'Design System Builder', achieved: true, icon: 'layout' },
      { name: 'Accessibility Champion', achieved: false, icon: 'shield' },
      { name: 'Interaction Artist', achieved: false, icon: 'layers' }
    ],
    recognitions: [
      { value: 'foundation-badge', text: 'Foundation Badge' },
      { value: 'professional-certificate', text: 'Professional Credential' },
      { value: 'expert-badge', text: 'SME Recommendation' }
    ]
  },
  'ui-engineering-foundation': {
    title: 'UI Engineering Foundation',
    subjects: [
      { name: 'Component Design Patterns', score: 89 },
      { name: 'Design Tokens & Theming', score: 84 },
      { name: 'State Flow Fundamentals', score: 80 },
      { name: 'Accessibility & Performance', score: 76 }
    ],
    badges: [
      { name: 'Component Strategist', achieved: true, icon: 'grid' },
      { name: 'Theme Artisan', achieved: false, icon: 'droplet' },
      { name: 'Performance Steward', achieved: false, icon: 'speedometer' }
    ],
    recognitions: [
      { value: 'foundation-badge', text: 'Foundation Badge' },
      { value: 'professional-certificate', text: 'Professional Credential' },
      { value: 'expert-badge', text: 'SME Recommendation' }
    ]
  },
  'ui-engineering-angular': {
    title: 'UI Engineering with Angular',
    subjects: [
      { name: 'Angular Component Architecture', score: 90 },
      { name: 'Reactive Forms & RxJS', score: 85 },
      { name: 'State Management with NgRx', score: 81 },
      { name: 'Testing & Performance Optimization', score: 78 }
    ],
    badges: [
      { name: 'Angular Architect', achieved: true, icon: 'layers' },
      { name: 'RxJS Navigator', achieved: false, icon: 'shuffle' },
      { name: 'NgRx Specialist', achieved: false, icon: 'database' }
    ],
    recognitions: [
      { value: 'foundation-badge', text: 'Foundation Badge' },
      { value: 'professional-certificate', text: 'Professional Credential' },
      { value: 'expert-badge', text: 'SME Recommendation' }
    ]
  },
  'node-backend': {
    title: 'Backend Programming with Node',
    subjects: [
      { name: 'Node.js Server APIs', score: 93 },
      { name: 'Database Integration & ORM', score: 86 },
      { name: 'Security & Middleware', score: 82 },
      { name: 'Microservices & Eventing', score: 79 }
    ],
    badges: [
      { name: 'API Craftsman', achieved: true, icon: 'server' },
      { name: 'Secure Middleware Expert', achieved: false, icon: 'shield' },
      { name: 'Service Orchestrator', achieved: false, icon: 'box' }
    ],
    recognitions: [
      { value: 'foundation-badge', text: 'Foundation Badge' },
      { value: 'professional-certificate', text: 'Professional Credential' },
      { value: 'expert-badge', text: 'SME Recommendation' }
    ]
  },
  'ai-ml-engineer': {
    title: 'AI/ML Engineer',
    subjects: [
      { name: 'Data Pipeline Engineering', score: 91 },
      { name: 'Supervised Learning Models', score: 87 },
      { name: 'Model Evaluation & Explainability', score: 80 },
      { name: 'Deployment & Monitoring', score: 75 }
    ],
    badges: [
      { name: 'Data Pipeline Architect', achieved: true, icon: 'database' },
      { name: 'Model Evaluator', achieved: false, icon: 'activity' },
      { name: 'Deployment Navigator', achieved: false, icon: 'cloud' }
    ],
    recognitions: [
      { value: 'foundation-badge', text: 'Foundation Badge' },
      { value: 'professional-certificate', text: 'Professional Credential' },
      { value: 'expert-badge', text: 'SME Recommendation' }
    ]
  },
  'devops-engineer': {
    title: 'DevOps Engineer',
    subjects: [
      { name: 'CI/CD Pipeline Automation', score: 92 },
      { name: 'Infrastructure as Code', score: 87 },
      { name: 'Container Orchestration', score: 83 },
      { name: 'Monitoring & Incident Response', score: 79 }
    ],
    badges: [
      { name: 'Pipeline Pilot', achieved: true, icon: 'repeat' },
      { name: 'IaC Artisan', achieved: false, icon: 'tool' },
      { name: 'Ops Guardian', achieved: false, icon: 'shield' }
    ],
    recognitions: [
      { value: 'foundation-badge', text: 'Foundation Badge' },
      { value: 'professional-certificate', text: 'Professional Credential' },
      { value: 'expert-badge', text: 'SME Recommendation' }
    ]
  }
};

let interviewRegistry = [
  {
    id: 'loop-101',
    subject: 'ES6 & Async Patterns',
    expert: 'SME Anjali - Staff Engineer @ Google',
    date: '2026-06-15',
    time: '10:00 AM - 11:00 AM',
    status: 'Completed',
    score: 88,
    metrics: {
      'Code Quality': 9.0,
      'Problem Solving': 8.7,
      'Architecture Thinking': 8.9,
      'Communication': 8.5
    },
    credit: 'Anjali (Google Staff), Priya (IBM Lead)',
    role: 'js-programmer',
    track: 'Foundation Badge',
    tags: ['Initiated', 'Intermediate']
  },
  {
    id: 'loop-102',
    subject: 'Python Core Concepts',
    expert: 'SME Priya - Lead Cloud Dev @ IBM',
    date: '2026-06-19',
    time: '02:00 PM - 03:00 PM',
    status: 'Completed',
    score: 85,
    metrics: {
      'Code Quality': 8.5,
      'Problem Solving': 9.0,
      'Test Coverage': 8.2,
      'Domain Understanding': 8.4
    },
    credit: 'Priya (IBM Staff), Keith (Cloudflare DevOps)',
    role: 'python-programmer',
    track: 'Professional Credential',
    tags: ['Intermediate']
  },
  {
    id: 'loop-103',
    subject: 'CI/CD Pipeline Automation',
    expert: 'SME Keith - Lead DevOps @ Cloudflare',
    date: '2026-06-28',
    time: '04:30 PM - 05:30 PM',
    status: 'Upcoming',
    score: null,
    metrics: {},
    credit: 'Keith (Cloudflare DevOps)',
    role: 'devops-engineer',
    track: 'SME Recommendation',
    tags: ['Expert']
  },
  {
    id: 'loop-104',
    subject: 'Angular Component Architecture',
    expert: 'SME Devendra - Staff Engineer @ NetApp',
    date: '2026-07-02',
    time: '08:00 PM - 09:00 PM',
    status: 'Upcoming',
    score: null,
    metrics: {},
    credit: 'Devendra (NetApp Staff)',
    role: 'ui-engineering-angular',
    track: 'SME Recommendation',
    tags: ['Intermediate']
  }
];

let currentRole = 'js-programmer';
let selectedProficiencyTags: string[] = [];
let selectedCandidateTags: string[] = [];
let typeIndex = 0;
let charIndex = 0;
let isDeleting = false;
let scriptsInitialized = false;

const config: {
  maxSpeed: number;
  linkDist: number;
  interactionMode: 'repel' | 'attract' | 'none';
  visualType: 'tech' | 'dots';
  mouseRadius: number;
} = {
  maxSpeed: 1.8,
  linkDist: 120,
  interactionMode: 'repel',
  visualType: 'tech',
  mouseRadius: 150
};

const techSymbols = ['{', '}', '[', ']', '<', '>', '0', '1', '&&', '||', '++', '=>', '==', 'ptr', '++'];
let mouse: { x: number | null; y: number | null } = { x: null, y: null };

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let animationId: number | null = null;
let particleCount = 80;
let lastTime = performance.now();
let frameCount = 0;
let sortArray: number[] = [];
const arraySize = 30;
let comparisonsCount = 0;
let swapsCount = 0;
let isSorting = false;
let currentQuizIndex = 0;
let quizScore = 0;

const quizData = [
  {
    difficulty: 'MEDIUM PARADIGM',
    question: 'What is the tightest time complexity to find an element in a balanced binary search tree of depth d or size N?',
    options: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'],
    correct: 1,
    explanation: 'Searching in a balanced BST takes O(log N) operations because each step splits the remaining search space exactly in half.'
  },
  {
    difficulty: 'HARD STRATEGY',
    question: 'Which data structure is most optimal to implement an LRU (Least Recently Used) cache with O(1) operations?',
    options: ['Singly Linked List', 'Binary Heap & Map', 'Doubly Linked List & Hash Map', 'Sorted Array'],
    correct: 2,
    explanation: 'A Doubly Linked List enables fast removal and insertion of node order in O(1), while the Hash Map enables O(1) lookup.'
  },
  {
    difficulty: 'EASY CONVENIENCE',
    question: 'Under the hood, what is the amortized runtime complexity to insert an element into a dynamic Array (e.g. ArrayList)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
    correct: 0,
    explanation: 'Dynamic arrays double in capacity when full, triggering occasional O(N) reallocations. Over time, average insertion stays O(1) amortized.'
  },
  {
    difficulty: 'MEDIUM SYSTEM',
    question: 'Which load-balancing algorithm is best for maintaining state connection mappings to exact target servers?',
    options: ['Round Robin', 'IP Hashing', 'Least Response Time', 'Random Selection'],
    correct: 1,
    explanation: 'IP Hashing runs algorithms against the client\'s address to resolve identical target routes, anchoring user sessions to specific node paths.'
  }
];

function getById<T extends HTMLElement = HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

function safeCall(fn: () => void): void {
  try {
    fn();
  } catch (_e) {
    // ignore DOM errors for missing elements
  }
}

function handleTypewriter(): void {
  const typewriterEl = getById('typewriterText');
  if (!typewriterEl) return;

  const currentLine = typewriterLines[typeIndex];
  if (isDeleting) {
    typewriterEl.textContent = currentLine.substring(0, charIndex - 1);
    charIndex--;
  } else {
    typewriterEl.textContent = currentLine.substring(0, charIndex + 1);
    charIndex++;
  }

  let speed = isDeleting ? 30 : 80;
  if (!isDeleting && charIndex === currentLine.length) {
    speed = 1500;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    typeIndex = (typeIndex + 1) % typewriterLines.length;
    speed = 500;
  }

  setTimeout(handleTypewriter, speed);
}

function triggerNotification(title: string, message: string, iconType: 'info' | 'success' | 'zap' = 'info'): void {
  const banner = getById('systemNotification');
  const notiTitle = getById('notiTitle');
  const notiText = getById('notiText');
  const notiIcon = getById('notiIcon');
  if (!banner || !notiTitle || !notiText || !notiIcon) return;

  notiTitle.innerText = title;
  notiText.innerText = message;

  if (iconType === 'success') {
    notiIcon.innerHTML = '<i data-lucide="check" class="w-5 h-5 text-emerald-400"></i>';
    notiIcon.className = 'p-2 rounded-lg bg-emerald-500/10 text-emerald-400';
  } else if (iconType === 'zap') {
    notiIcon.innerHTML = '<i data-lucide="zap" class="w-5 h-5 text-amber-400"></i>';
    notiIcon.className = 'p-2 rounded-lg bg-amber-500/10 text-amber-400';
  } else {
    notiIcon.innerHTML = '<i data-lucide="info" class="w-5 h-5 text-sky-400"></i>';
    notiIcon.className = 'p-2 rounded-lg bg-sky-500/20 text-sky-400';
  }

  safeCall(() => { if ((window as any).lucide) (window as any).lucide.createIcons(); });

  banner.style.opacity = '1';
  banner.style.transform = 'translateY(0)';

  setTimeout(() => {
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(20px)';
  }, 3500);
}

function setSelectOptions(selectId: string, options: Array<{ value: string; text: string }>): void {
  const select = getById<HTMLSelectElement>(selectId);
  if (!select) return;
  select.innerHTML = '';
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.innerText = opt.text;
    select.appendChild(option);
  });
}

function toggleSmeDropdown(): void {
  const menu = getById('smeDropdownMenu');
  if (menu) menu.classList.toggle('hidden');
}

function updateSelectedSmes(): void {
  const checkboxes = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="smeCheckbox"]:checked'));
  const selected = checkboxes.map(cb => cb.value);
  const label = getById('selectedSmesLabel');
  if (!label) return;

  if (selected.length === 0) {
    label.innerText = 'Select Experts...';
    label.classList.add('text-slate-400');
  } else {
    const names = selected.map(s => s.split(' - ')[0].replace('SME ', ''));
    label.innerText = names.join(', ');
    label.classList.remove('text-slate-400');
  }
}

function toggleProficiencyTag(tag: string): void {
  const btn = getById<HTMLButtonElement>(`tag-${tag}`);
  if (!btn) return;

  // Ensure only one experience level is selected at a time
  if (selectedProficiencyTags[0] === tag) {
    selectedProficiencyTags = [];
    btn.className = 'tag-button py-2 text-[11px] font-bold rounded-lg border-2 border-slate-800 bg-slate-950 text-slate-400 hover:border-sky-500/50 transition-all';
    return;
  }

  selectedProficiencyTags = [tag];
  document.querySelectorAll<HTMLButtonElement>('#proficiencyTagsContainer .tag-button').forEach(button => {
    button.className = 'tag-button py-2 text-[11px] font-bold rounded-lg border-2 border-slate-800 bg-slate-950 text-slate-400 hover:border-sky-500/50 transition-all';
  });
  btn.className = 'tag-button py-2 text-[11px] font-bold rounded-lg border-2 border-sky-500 bg-sky-500/10 text-sky-400 transition-all';
}

function toggleCandidateTag(tag: string): void {
  const btn = getById<HTMLButtonElement>(`candtag-${tag}`);
  if (!btn) return;
  const index = selectedCandidateTags.indexOf(tag);
  if (index > -1) {
    selectedCandidateTags.splice(index, 1);
    btn.className = 'tag-button py-2 text-[11px] font-bold rounded-lg border-2 border-slate-800 bg-slate-950 text-slate-400 hover:border-sky-500/50 transition-all';
  } else {
    selectedCandidateTags.push(tag);
    btn.className = 'tag-button py-2 text-[11px] font-bold rounded-lg border-2 border-sky-500 bg-sky-500/10 text-sky-400 transition-all';
  }
}

function handleSchedulerRoleChange(role: string): void {
  const configEntry = (roleConfig as any)[role];
  if (!configEntry) return;
  setSelectOptions('scheduleTopic', configEntry.subjects.map((sub: any) => ({ value: sub.name, text: sub.name })));
  if (configEntry.recognitions) {
    setSelectOptions('scheduleTrack', configEntry.recognitions.map((entry: any) => ({ value: entry.value, text: entry.text })));
  }
  const topicSelect = getById<HTMLSelectElement>('scheduleTopic');
  const trackSelect = getById<HTMLSelectElement>('scheduleTrack');
  if (topicSelect && configEntry.subjects.length > 0) topicSelect.value = configEntry.subjects[0].name;
  if (trackSelect && configEntry.recognitions?.length > 0) trackSelect.value = configEntry.recognitions[0].value;
}

function handleRoleChange(selectedRole: string): void {
  currentRole = selectedRole;
  const roleSelector = getById<HTMLSelectElement>('roleSelector');
  const scheduleRole = getById<HTMLSelectElement>('scheduleRole');
  if (roleSelector) roleSelector.value = selectedRole;
  if (scheduleRole) scheduleRole.value = selectedRole;
  renderScorecard();
  renderBadges();
  populateTopicDropdowns();
  recalculateStats();
  triggerNotification('Role Switched', `Target role adjusted to: ${selectedRole.toUpperCase()}`, 'success');
}

function renderScorecard(): void {
  const configEntry = (roleConfig as any)[currentRole];
  const container = getById('skillsScorecardContainer');
  if (!container || !configEntry) return;
  container.innerHTML = '';
  configEntry.subjects.forEach((sub: any) => {
    const card = document.createElement('div');
    card.className = 'p-4 bg-[#111827] border-2 border-slate-800 rounded-xl space-y-2.5 hover:border-slate-700 transition-all';
    let colorTheme = 'from-sky-500 to-indigo-500';
    if (sub.score < 80) colorTheme = 'from-amber-500 to-orange-500';
    card.innerHTML = `
      <div class="flex justify-between items-center text-xs">
        <span class="font-bold text-slate-100">${sub.name}</span>
        <span class="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">${sub.score}% Verified</span>
      </div>
      <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div class="bg-gradient-to-r ${colorTheme} h-2" style="width: ${sub.score}%"></div>
      </div>
    `;
    container.appendChild(card);
  });
}

function renderBadges(): void {
  const configEntry = (roleConfig as any)[currentRole];
  const cabinet = getById('badgesCabinet');
  if (!cabinet || !configEntry) return;
  cabinet.innerHTML = '';
  configEntry.badges.forEach((b: any) => {
    const badge = document.createElement('div');
    if (b.achieved) {
      badge.className = 'p-3 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-xl flex items-center gap-2.5 text-xs text-slate-200';
      badge.innerHTML = `
        <div class="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
          <i data-lucide="${b.icon}" class="w-4 h-4"></i>
        </div>
        <div>
          <span class="font-bold block text-white">${b.name}</span>
          <span class="text-[9px] text-emerald-400 font-bold uppercase font-mono">Verified</span>
        </div>
      `;
    } else {
      badge.className = 'p-3 bg-slate-950/40 border-2 border-slate-900 rounded-xl flex items-center gap-2.5 text-xs text-slate-500 select-none';
      badge.innerHTML = `
        <div class="p-1.5 bg-slate-900 text-slate-600 rounded-lg">
          <i data-lucide="lock" class="w-4 h-4"></i>
        </div>
        <div>
          <span class="font-semibold block">${b.name}</span>
          <span class="text-[9px] font-mono">Locked</span>
        </div>
      `;
    }
    cabinet.appendChild(badge);
  });
  safeCall(() => { if ((window as any).lucide) (window as any).lucide.createIcons(); });
}

function populateTopicDropdowns(): void {
  const configEntry = (roleConfig as any)[currentRole];
  if (!configEntry) return;
  setSelectOptions('scheduleTopic', configEntry.subjects.map((sub: any) => ({ value: sub.name, text: sub.name })));
}

function recalculateStats(): void {
  const completed = interviewRegistry.filter(loop => loop.status === 'Completed');
  const sum = completed.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const avg = completed.length > 0 ? (sum / completed.length).toFixed(1) : '0';

  const avgInterviewScore = getById('avgInterviewScore');
  const completedLoopsCount = getById('completedLoopsCount');
  const upcomingCount = getById('upcomingCount');
  const badgesEarnedCount = getById('badgesEarnedCount');
  if (avgInterviewScore) avgInterviewScore.innerText = `${avg}%`;
  if (completedLoopsCount) completedLoopsCount.innerText = `${completed.length} / ${interviewRegistry.length}`;
  if (upcomingCount) upcomingCount.innerText = `${interviewRegistry.filter(l => l.status === 'Upcoming').length} Pending`;

  const configEntry = (roleConfig as any)[currentRole];
  if (badgesEarnedCount && configEntry) {
    const activeBadges = configEntry.badges.filter((b: any) => b.achieved).length;
    badgesEarnedCount.innerText = `${activeBadges} Badge${activeBadges !== 1 ? 's' : ''}`;
  }

  renderRegistryList();
  populateMarksheetSelector();
}

function createStatusBadge(loop: any): string {
  if (loop.status === 'Completed') {
    return `<span class="bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 text-[9px] font-mono px-2 py-0.5 rounded font-bold">${loop.score}% &bull; Completed</span>`;
  }
  return `<span class="bg-amber-500/10 text-amber-400 border border-amber-400/20 text-[9px] font-mono px-2 py-0.5 rounded font-bold">Upcoming</span>`;
}

function renderRegistryList(): void {
  const list = getById('scheduledRegistryList');
  if (!list) return;
  list.innerHTML = '';

  interviewRegistry.forEach(loop => {
    const item = document.createElement('div');
    item.className = 'p-3 bg-[#0b0f19] border-2 border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs hover:border-sky-500/20 transition-all cursor-pointer';
    item.onclick = () => {
      if (loop.status === 'Completed') {
        const select = getById<HTMLSelectElement>('marksheetSelector');
        if (select) select.value = loop.id;
        loadMarksheetRecord(loop.id);
        window.location.hash = '#marksheet';
      } else {
        triggerNotification('Assessment Pending', 'This board session is currently scheduled. Completed results render post audit.', 'info');
      }
    };

    const tagsHtml = loop.tags?.map((t: string) => `<span class="bg-sky-500/15 text-sky-400 text-[9px] px-1.5 py-0.2 rounded border border-sky-500/30 font-mono font-bold">${t}</span>`).join(' ') ?? '';
    const trackHtml = loop.track ? `<span class="text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold">${loop.track}</span>` : '';

    item.innerHTML = `
      <div class="flex items-center gap-3 w-full min-w-0">
        <div class="p-2 ${loop.status === 'Completed' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-850 text-slate-500'} rounded-lg flex-shrink-0">
          <i data-lucide="shield" class="w-4.5 h-4.5"></i>
        </div>
        <div class="w-full min-w-0 space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <h4 class="font-bold text-white truncate">${loop.subject}</h4>
            ${trackHtml}
            ${tagsHtml}
          </div>
          <p class="text-[10px] text-slate-400 truncate">${loop.expert} &bull; ${loop.date} (${loop.time})</p>
        </div>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        ${createStatusBadge(loop)}
      </div>
    `;
    list.appendChild(item);
  });
  safeCall(() => { if ((window as any).lucide) (window as any).lucide.createIcons(); });
}

function handleScheduleCommit(e: Event): void {
  e.preventDefault();
  const roleVal = getById<HTMLSelectElement>('scheduleRole')?.value ?? currentRole;
  const topic = getById<HTMLSelectElement>('scheduleTopic')?.value ?? '';
  const track = getById<HTMLSelectElement>('scheduleTrack')?.value ?? 'Foundation Badge';
  const date = getById<HTMLInputElement>('scheduleDate')?.value ?? '';
  const time = getById<HTMLSelectElement>('scheduleTime')?.value ?? '';

  const checkboxes = Array.from(document.querySelectorAll<HTMLInputElement>('input[name="smeCheckbox"]:checked'));
  const selectedSmes = checkboxes.map(cb => cb.value);
  if (selectedSmes.length === 0) {
    triggerNotification('SME Error', 'Please select at least one SME Expert for your evaluation panel.', 'zap');
    return;
  }

  const randomId = `loop-${Math.floor(100 + Math.random() * 900)}`;
  const formattedNames = selectedSmes.map(s => s.split(' - ')[0].replace('SME ', '')).join(' & ');
  const newLoop = {
    id: randomId,
    subject: topic,
    expert: `${selectedSmes.length} Experts Panel (${formattedNames})`,
    date,
    time,
    status: 'Upcoming',
    score: null,
    metrics: {},
    credit: selectedSmes.join(', '),
    role: roleVal,
    track,
    experienceLevel: selectedProficiencyTags[0] ?? '',
    candidateTags: [...selectedCandidateTags],
    tags: [...selectedProficiencyTags, ...selectedCandidateTags]
  };
  interviewRegistry.push(newLoop);
  recalculateStats();
  triggerNotification('Interview Scheduled', `${topic} scheduled with ${selectedSmes.length} panel experts!`, 'success');

  const bookingForm = getById<HTMLFormElement>('bookingForm');
  if (bookingForm) bookingForm.reset();
  selectedProficiencyTags = [];
  selectedCandidateTags = [];
  document.querySelectorAll<HTMLButtonElement>('.tag-button').forEach(btn => {
    btn.className = 'tag-button py-2 text-[11px] font-bold rounded-lg border-2 border-slate-800 bg-slate-950 text-slate-400 hover:border-sky-500/50 transition-all';
  });
  document.querySelectorAll<HTMLInputElement>('input[name="smeCheckbox"]').forEach(cb => cb.checked = false);
  const selectedSmesLabel = getById('selectedSmesLabel');
  if (selectedSmesLabel) {
    selectedSmesLabel.innerText = 'Select Experts...';
    selectedSmesLabel.classList.add('text-slate-400');
  }
}

function mockResetRegistry(): void {
  interviewRegistry = [
    {
      id: 'loop-101',
      subject: 'ES6 & Async Patterns',
      expert: 'SME Anjali - Staff Engineer @ Google',
      date: '2026-06-15',
      time: '10:00 AM - 11:00 AM',
      status: 'Completed',
      score: 88,
      metrics: {
        'Code Quality': 9.0,
        'Problem Solving': 8.7,
        'Architecture Thinking': 8.9,
        'Communication': 8.5
      },
      credit: 'Anjali (Google Staff), Priya (IBM Lead)',
      role: 'js-programmer',
      track: 'Foundation Badge',
      tags: ['Initiated', 'Intermediate']
    },
    {
      id: 'loop-102',
      subject: 'Python Core Concepts',
      expert: 'SME Priya - Lead Cloud Dev @ IBM',
      date: '2026-06-19',
      time: '02:00 PM - 03:00 PM',
      status: 'Completed',
      score: 85,
      metrics: {
        'Code Quality': 8.5,
        'Problem Solving': 9.0,
        'Test Coverage': 8.2,
        'Domain Understanding': 8.4
      },
      credit: 'Priya (IBM Staff), Keith (Cloudflare DevOps)',
      role: 'python-programmer',
      track: 'Professional Credential',
      tags: ['Intermediate']
    },
    {
      id: 'loop-103',
      subject: 'CI/CD Pipeline Automation',
      expert: 'SME Keith - Lead DevOps @ Cloudflare',
      date: '2026-06-28',
      time: '04:30 PM - 05:30 PM',
      status: 'Upcoming',
      score: null,
      metrics: {},
      credit: 'Keith (Cloudflare DevOps)',
      role: 'devops-engineer',
      track: 'SME Recommendation',
      tags: ['Expert']
    },
    {
      id: 'loop-104',
      subject: 'Angular Component Architecture',
      expert: 'SME Devendra - Staff Engineer @ NetApp',
      date: '2026-07-02',
      time: '08:00 PM - 09:00 PM',
      status: 'Upcoming',
      score: null,
      metrics: {},
      credit: 'Devendra (NetApp Staff)',
      role: 'ui-engineering-angular',
      track: 'SME Recommendation',
      tags: ['Intermediate']
    }
  ];
  recalculateStats();
  triggerNotification('Registry Restored', 'Evaluation registry returned to baseline.', 'info');
}

function populateMarksheetSelector(): void {
  const select = getById<HTMLSelectElement>('marksheetSelector');
  if (!select) return;
  select.innerHTML = '';
  const completed = interviewRegistry.filter(l => l.status === 'Completed');
  completed.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.innerText = `${c.subject} (${c.score}%)`;
    select.appendChild(option);
  });
  if (completed.length > 0) {
    loadMarksheetRecord(completed[0].id);
  }
}

function loadMarksheetRecord(id: string): void {
  const record = interviewRegistry.find(r => r.id === id);
  if (!record) return;
  const marksheetIdTag = getById('marksheetIdTag');
  const marksheetAuditors = getById('marksheetAuditors');
  const marksheetTrack = getById('marksheetTrack');
  const container = getById('marksheetMetricsContainer');
  if (marksheetIdTag) marksheetIdTag.innerText = `Assessment ID: ${record.id}`;
  if (marksheetAuditors) marksheetAuditors.innerText = record.credit || record.expert;
  if (marksheetTrack) marksheetTrack.innerText = record.track || 'Standard Certificate Track';
  if (!container) return;
  container.innerHTML = '';
  Object.entries(record.metrics || {}).forEach(([key, value]) => {
    const block = document.createElement('div');
    block.className = 'space-y-1.5';
    const widthPercent = (value as number) * 10;
    block.innerHTML = `
      <div class="flex justify-between items-center text-xs">
        <span class="text-slate-300 font-bold">${key}</span>
        <span class="text-emerald-400 font-mono font-bold">${value}/10</span>
      </div>
      <div class="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2" style="width: ${widthPercent}%"></div>
      </div>
    `;
    container.appendChild(block);
  });
}

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  symbol: string;
  colorVal: number;

  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = 0;
    this.speedX = 0;
    this.speedY = 0;
    this.symbol = '';
    this.colorVal = 0;
    this.reset();
  }

  reset(): void {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2.2 + 1;
    this.speedX = (Math.random() - 0.5) * config.maxSpeed;
    this.speedY = (Math.random() - 0.5) * config.maxSpeed;
    this.symbol = techSymbols[Math.floor(Math.random() * techSymbols.length)];
    this.colorVal = Math.random();
  }

  update(): void {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
    if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < config.mouseRadius) {
        const force = (config.mouseRadius - dist) / config.mouseRadius;
        const forceX = (dx / dist) * force * 1.5;
        const forceY = (dy / dist) * force * 1.5;
        if (config.interactionMode === 'repel') {
          this.x -= forceX;
          this.y -= forceY;
        } else if (config.interactionMode === 'attract') {
          this.x += forceX;
          this.y += forceY;
        }
      }
    }
  }

  draw(): void {
    if (!ctx) return;
    ctx.save();
    if (this.colorVal > 0.6) {
      ctx.fillStyle = 'rgba(14, 165, 233, 0.8)';
    } else if (this.colorVal > 0.3) {
      ctx.fillStyle = 'rgba(124, 58, 237, 0.75)';
    } else {
      ctx.fillStyle = 'rgba(13, 148, 136, 0.75)';
    }
    if (config.visualType === 'tech') {
      ctx.font = `bold ${this.size * 4 + 7}px monospace`;
      ctx.fillText(this.symbol, this.x, this.y);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function resizeCanvas(): void {
  const domCanvas = getById<HTMLCanvasElement>('particleCanvas');
  if (!domCanvas) return;
  canvas = domCanvas;
  ctx = domCanvas.getContext('2d');
  if (!ctx) return;
  domCanvas.width = window.innerWidth;
  domCanvas.height = window.innerHeight;
  if (window.innerWidth < 768) {
    particleCount = 40;
    config.linkDist = 95;
  } else {
    particleCount = 95;
    config.linkDist = 125;
  }
  initParticles();
}

function initParticles(): void {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
}

function renderLoop(): void {
  const domCanvas = getById<HTMLCanvasElement>('particleCanvas');
  if (!domCanvas || !ctx) return;
  ctx.clearRect(0, 0, domCanvas.width, domCanvas.height);
  const now = performance.now();
  frameCount++;
  if (now > lastTime + 1000) {
    const fpsCounter = getById('fpsCounter');
    if (fpsCounter) fpsCounter.innerText = Math.round((frameCount * 1000) / (now - lastTime)).toString();
    frameCount = 0;
    lastTime = now;
  }
  const liveParticles = getById('liveParticles');
  if (liveParticles) liveParticles.innerText = particles.length.toString();
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < config.linkDist && ctx) {
        const opacity = (1 - distance / config.linkDist) * 0.15;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(148, 163, 184, ${opacity})`;
        ctx.lineWidth = 0.85;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  animationId = requestAnimationFrame(renderLoop);
}

function updateParticleSpeed(val: string): void {
  config.maxSpeed = parseFloat(val);
  const speedVal = getById('speedVal');
  if (speedVal) speedVal.innerText = val;
  particles.forEach(p => {
    p.speedX = (Math.random() - 0.5) * config.maxSpeed;
    p.speedY = (Math.random() - 0.5) * config.maxSpeed;
  });
}

function updateLinkDistance(val: string): void {
  config.linkDist = parseInt(val, 10);
  const distVal = getById('distVal');
  if (distVal) distVal.innerText = `${val}px`;
}

function changeInteraction(mode: 'repel' | 'attract' | 'none'): void {
  config.interactionMode = mode;
  ['repel', 'attract', 'none'].forEach(m => {
    const btn = getById(`btn-${m}`);
    if (btn) {
      btn.className = m === mode ? 'py-1.5 text-[11px] font-bold rounded-lg transition-all bg-sky-500/20 text-sky-400' : 'py-1.5 text-[11px] font-bold rounded-lg transition-all text-slate-400 hover:text-slate-200';
    }
  });
  triggerNotification('Interaction Mode Set', `Particle state updated to: ${mode.toUpperCase()}`, 'zap');
}

function changeVisualType(style: 'tech' | 'dots'): void {
  config.visualType = style;
  ['tech', 'dots'].forEach(s => {
    const btn = getById(`btn-${s}`);
    if (btn) {
      btn.className = s === style ? 'py-1.5 text-[11px] font-bold rounded-lg transition-all bg-sky-500/20 text-sky-400' : 'py-1.5 text-[11px] font-bold rounded-lg transition-all text-slate-400 hover:text-slate-200';
    }
  });
  triggerNotification('Style Adjusted', 'Visual representation updated.', 'info');
}

function resetParticleControls(): void {
  const speedSlider = getById<HTMLInputElement>('speedSlider');
  const distSlider = getById<HTMLInputElement>('distSlider');
  if (speedSlider) speedSlider.value = '1.8';
  if (distSlider) distSlider.value = '120';
  updateParticleSpeed('1.8');
  updateLinkDistance('120');
  changeInteraction('repel');
  changeVisualType('tech');
  triggerNotification('Settings Reverted', 'System parameters returned to defaults.', 'info');
}

function randomizeParticleSettings(): void {
  const randSpeed = (Math.random() * 7 + 1).toFixed(1);
  const randDist = Math.floor(Math.random() * 180 + 50).toString();
  const modes: Array<'repel' | 'attract' | 'none'> = ['repel', 'attract', 'none'];
  const randMode = modes[Math.floor(Math.random() * modes.length)];
  const styles: Array<'tech' | 'dots'> = ['tech', 'dots'];
  const randStyle = styles[Math.floor(Math.random() * styles.length)];
  const speedSlider = getById<HTMLInputElement>('speedSlider');
  const distSlider = getById<HTMLInputElement>('distSlider');
  if (speedSlider) speedSlider.value = randSpeed;
  if (distSlider) distSlider.value = randDist;
  updateParticleSpeed(randSpeed);
  updateLinkDistance(randDist);
  changeInteraction(randMode);
  changeVisualType(randStyle);
  triggerNotification('Chaos Seed Injected!', 'System vectors randomized.', 'zap');
}

function renderQuizQuestion(): void {
  const activeData = quizData[currentQuizIndex];
  const quizDifficulty = getById('quizDifficulty');
  const quizCardCounter = getById('quizCardCounter');
  const quizQuestion = getById('quizQuestion');
  const optionsContainer = getById('quizOptionsContainer');
  if (!quizDifficulty || !quizCardCounter || !quizQuestion || !optionsContainer) return;

  quizDifficulty.innerText = activeData.difficulty;
  quizCardCounter.innerText = `Question ${currentQuizIndex + 1} of ${quizData.length}`;
  quizQuestion.innerText = activeData.question;
  optionsContainer.innerHTML = '';

  activeData.options.forEach((opt, idx) => {
    const optionChar = String.fromCharCode(65 + idx);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.onclick = () => submitQuizAnswer(idx);
    btn.className = 'option-btn text-left p-3.5 rounded-xl border-2 border-slate-800 bg-[#111827] hover:bg-slate-850 hover:border-slate-700 text-xs text-slate-300 transition-all flex items-center justify-between';
    btn.innerHTML = `<span>${opt}</span><span class="text-slate-500 font-mono text-[10px]">${optionChar}</span>`;
    optionsContainer.appendChild(btn);
  });
  getById('quizExplainPane')?.classList.add('hidden');
}

function submitQuizAnswer(selectedIndex: number): void {
  const activeData = quizData[currentQuizIndex];
  const explainPane = getById('quizExplainPane');
  const resultHeading = getById('quizResultHeading');
  const resultExplain = getById('quizResultExplain');
  if (!explainPane || !resultHeading || !resultExplain) return;

  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.option-btn')); 
  buttons.forEach(btn => btn.disabled = true);

  if (selectedIndex === activeData.correct) {
    quizScore++;
    resultHeading.innerText = 'Correct Choice!';
    resultHeading.className = 'font-extrabold text-emerald-450 uppercase tracking-wider';
    buttons[selectedIndex].className = 'option-btn text-left p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-xs text-emerald-300 transition-all flex items-center justify-between';
    triggerNotification('Question Passed!', 'You isolated the optimal answer complexity.', 'success');
  } else {
    resultHeading.innerText = 'Incorrect Option Chosen';
    resultHeading.className = 'font-extrabold text-rose-450 uppercase tracking-wider';
    buttons[selectedIndex].className = 'option-btn text-left p-3.5 rounded-xl border-2 border-rose-500 bg-rose-500/10 text-xs text-rose-300 transition-all flex items-center justify-between';
    buttons[activeData.correct].className = 'option-btn text-left p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-500/10 text-xs text-emerald-300 transition-all flex items-center justify-between';
  }

  resultExplain.innerText = activeData.explanation;
  explainPane.classList.remove('hidden');
  getById('quizScoreText')!.innerText = `${quizScore}/${quizData.length} Correct`;
  getById('quizProgressBar')!.style.width = `${((currentQuizIndex + 1) / quizData.length) * 100}%`;
}

function nextQuizCard(): void {
  currentQuizIndex++;
  if (currentQuizIndex >= quizData.length) {
    currentQuizIndex = 0;
    quizScore = 0;
    getById('quizScoreText')!.innerText = '0/4 Correct';
    getById('quizProgressBar')!.style.width = '0%';
    triggerNotification('Assessment Reset', 'Completed full deck. Starting round over.', 'zap');
  }
  renderQuizQuestion();
}

function generateVisualArray(): void {
  if (isSorting) return;
  sortArray = [];
  comparisonsCount = 0;
  swapsCount = 0;
  getById('sortComparisons')!.innerText = '0';
  getById('sortSwaps')!.innerText = '0';
  const container = getById('visualContainer');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < arraySize; i++) {
    const value = Math.floor(Math.random() * 75) + 15;
    sortArray.push(value);
    const bar = document.createElement('div');
    bar.className = 'bg-sky-500 transition-all duration-100 flex-1 rounded-t-md';
    bar.style.height = `${value}%`;
    bar.setAttribute('id', `sortBar-${i}`);
    container.appendChild(bar);
  }
}

async function triggerSortingVisualizer(): Promise<void> {
  if (isSorting) return;
  isSorting = true;
  triggerNotification('Visualizer Running', 'Rendering active passes and swaps.', 'info');
  for (let i = 0; i < sortArray.length; i++) {
    for (let j = 0; j < sortArray.length - i - 1; j++) {
      const bar1 = getById<HTMLDivElement>(`sortBar-${j}`);
      const bar2 = getById<HTMLDivElement>(`sortBar-${j + 1}`);
      if (!bar1 || !bar2) continue;
      bar1.className = 'bg-purple-500 flex-1 rounded-t-md';
      bar2.className = 'bg-purple-500 flex-1 rounded-t-md';
      comparisonsCount++;
      getById('sortComparisons')!.innerText = comparisonsCount.toString();
      await new Promise(resolve => setTimeout(resolve, 35));
      if (sortArray[j] > sortArray[j + 1]) {
        swapsCount++;
        getById('sortSwaps')!.innerText = swapsCount.toString();
        const temp = sortArray[j];
        sortArray[j] = sortArray[j + 1];
        sortArray[j + 1] = temp;
        bar1.style.height = `${sortArray[j]}%`;
        bar2.style.height = `${sortArray[j + 1]}%`;
      }
      bar1.className = 'bg-sky-500 flex-1 rounded-t-md';
      bar2.className = 'bg-sky-500 flex-1 rounded-t-md';
    }
    const completedBar = getById<HTMLDivElement>(`sortBar-${sortArray.length - i - 1}`);
    if (completedBar) completedBar.className = 'bg-emerald-500 flex-1 rounded-t-md animate-pulse';
  }
  for (let k = 0; k < sortArray.length; k++) {
    const bar = getById<HTMLDivElement>(`sortBar-${k}`);
    if (bar) bar.className = 'bg-emerald-500 flex-1 rounded-t-md';
  }
  isSorting = false;
  triggerNotification('Sorting Complete', `Ascending placement resolved with ${swapsCount} swaps.`, 'success');
}

function attachGlobalFunctions(): void {
  const global = window as any;
  global.toggleSmeDropdown = toggleSmeDropdown;
  global.updateSelectedSmes = updateSelectedSmes;
  global.toggleProficiencyTag = toggleProficiencyTag;
  global.toggleCandidateTag = toggleCandidateTag;
  global.handleSchedulerRoleChange = handleSchedulerRoleChange;
  global.handleRoleChange = handleRoleChange;
  global.handleScheduleCommit = handleScheduleCommit;
  global.mockResetRegistry = mockResetRegistry;
  global.loadMarksheetRecord = loadMarksheetRecord;
  global.updateParticleSpeed = updateParticleSpeed;
  global.updateLinkDistance = updateLinkDistance;
  global.changeInteraction = changeInteraction;
  global.changeVisualType = changeVisualType;
  global.resetParticleControls = resetParticleControls;
  global.randomizeParticleSettings = randomizeParticleSettings;
  global.submitQuizAnswer = submitQuizAnswer;
  global.nextQuizCard = nextQuizCard;
  global.generateVisualArray = generateVisualArray;
  global.triggerSortingVisualizer = triggerSortingVisualizer;
}

function initLandingNav(): void {
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('#landingNavLinks a'));
  if (!links.length) return;

  const sections = links
    .map((link) => {
      const selector = link.getAttribute('href') || '';
      const section = document.querySelector<HTMLElement>(selector);
      return section ? { link, section } : null;
    })
    .filter((entry): entry is { link: HTMLAnchorElement; section: HTMLElement } => entry !== null);

  const updateActiveLink = (): void => {
    const scrollY = window.scrollY + 140;
    let activeLink: HTMLAnchorElement | null = null;

    for (const entry of sections) {
      if (scrollY >= entry.section.offsetTop) {
        activeLink = entry.link;
      }
    }

    links.forEach((link) => link.classList.toggle('active', link === activeLink));
  };

  links.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const selector = link.getAttribute('href') || '';
      const target = document.querySelector<HTMLElement>(selector);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      links.forEach((other) => other.classList.toggle('active', other === link));
    });
  });

  window.addEventListener('scroll', updateActiveLink);
  updateActiveLink();
}

function initUIContainers(): void {
  const notificationTemplate = document.createElement('div');
  notificationTemplate.innerHTML = `
    <div class="bg-slate-900 border-2 border-sky-500/50 backdrop-blur-md p-4 rounded-xl shadow-2xl flex items-start gap-3">
      <div id="notiIcon" class="p-2 bg-sky-500/20 rounded-lg text-sky-400"><i data-lucide="info" class="w-5 h-5"></i></div>
      <div>
        <h4 id="notiTitle" class="font-bold text-slate-100 text-sm">Action Complete</h4>
        <p id="notiText" class="text-xs text-slate-300 mt-1">Status changes propagated successfully.</p>
      </div>
    </div>
  `;
  const banner = getById('systemNotification');
  if (banner) {
    banner.innerHTML = '';
    banner.appendChild(notificationTemplate.firstElementChild ?? document.createElement('div'));
  }
}

function initCanvasOnDom(): void {
  const domCanvas = getById<HTMLCanvasElement>('particleCanvas');
  if (!domCanvas) return;
  canvas = domCanvas;
  ctx = domCanvas.getContext('2d');
}

function initLandingScripts(): void {
  if (scriptsInitialized) return;
  scriptsInitialized = true;

  attachGlobalFunctions();
  initUIContainers();
  initLandingNav();
  const heroNotifyButton = getById<HTMLButtonElement>('heroNotifyBtn');
  if (heroNotifyButton) {
    heroNotifyButton.addEventListener('click', () => {
      triggerNotification('Board Alert', 'Your interactive notification widget is now active.', 'info');
    });
  }
  initCanvasOnDom();
  if (!canvas) {
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'particleCanvas';
    newCanvas.className = 'fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-75';
    document.body.appendChild(newCanvas);
    canvas = newCanvas;
    ctx = newCanvas.getContext('2d');
  }
  resizeCanvas();
  renderLoop();
  handleRoleChange('js-programmer');
  handleSchedulerRoleChange('js-programmer');
  renderQuizQuestion();
  generateVisualArray();

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });
  window.addEventListener('click', e => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.closest('#dashboard') || target.closest('#scheduler') || target.closest('#marksheet') || target.closest('#quiz-zone')) return;
    for (let i = 0; i < 6; i++) {
      const p = new Particle();
      p.x = (e as MouseEvent).clientX;
      p.y = (e as MouseEvent).clientY;
      p.speedX = (Math.random() - 0.5) * 4;
      p.speedY = (Math.random() - 0.5) * 4;
      particles.push(p);
      if (particles.length > particleCount + 20) particles.shift();
    }
  });

  setTimeout(handleTypewriter, 1000);
}

export { initLandingScripts };
