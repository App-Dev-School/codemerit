import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SmeRatings {
  fundamental: number;
  coding: number;
  problem: number;
  communication: number;
}

interface SmeModule {
  key: string;
  label: string;
  questionCount: number;
}

interface SmeInfo {
  name: string;
  title: string;
  initials: string;
  avatarColor: string;
}

interface SmeAssessment {
  id: number;
  sme: SmeInfo;
  modules: SmeModule[];
  ratings: SmeRatings;
  verdict: VerdictKey;
  tags: string[];
  notes: string;
  duration: string;
  completedAt: string;
}

type VerdictKey = 'strong_hire' | 'hire' | 'no_hire' | 'under_review';

interface VerdictStyle {
  label: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  icon: string;
}

interface RatingItem {
  key: keyof SmeRatings;
  label: string;
  shortLabel: string;
  icon: string;
  colorClass: string;
}

@Component({
  selector: 'app-assessment-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assessment-report.component.html',
  styleUrls: ['./assessment-report.component.scss'],
})
export class AssessmentReportComponent {

  activeTabIndex = 0;

  readonly candidate = {
    name: 'Alex Taylor',
    role: 'Full Stack Developer – Angular + NestJS',
    experience: '5.5 Years',
    initials: 'AT',
    location: 'Remote',
    email: 'alex.taylor@example.com',
    avatarColor: '#4f46e5',
  };

  readonly interview = {
    id: 'INT-2026-0087',
    track: 'Full Stack Developer – 1 (Angular + NestJS)',
    date: '29 June 2026',
    startTime: '10:00 AM',
    endTime: '12:24 PM',
    duration: '2h 24m',
    totalModules: 7,
    totalQuestions: 21,
    panel: 'CodeMerit Technical Panel',
  };

  readonly ratingItems: RatingItem[] = [
    { key: 'fundamental',   label: 'Fundamental Knowledge',              shortLabel: 'Fundamentals',    icon: 'fa-code',          colorClass: 'text-cyan-500 dark:text-cyan-400' },
    { key: 'coding',        label: 'Coding & Syntax',                    shortLabel: 'Coding',          icon: 'fa-cubes-stacked', colorClass: 'text-amber-500 dark:text-amber-400' },
    { key: 'problem',       label: 'Logical Ability / Problem Solving',  shortLabel: 'Problem Solving', icon: 'fa-brain',         colorClass: 'text-emerald-600 dark:text-emerald-400' },
    { key: 'communication', label: 'Communication',                       shortLabel: 'Communication',   icon: 'fa-comments',      colorClass: 'text-pink-500 dark:text-pink-400' },
  ];

  readonly verdictStyles: Record<VerdictKey, VerdictStyle> = {
    strong_hire:  { label: 'Strong Hire',  bgClass: 'bg-indigo-500/10 dark:bg-indigo-500/15',  borderClass: 'border-indigo-500/40',  textClass: 'text-indigo-700 dark:text-indigo-300',  icon: 'fa-solid fa-star' },
    hire:         { label: 'Hire',         bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/15', borderClass: 'border-emerald-500/40', textClass: 'text-emerald-700 dark:text-emerald-300', icon: 'fa-solid fa-circle-check' },
    under_review: { label: 'Under Review', bgClass: 'bg-amber-500/10 dark:bg-amber-500/15',    borderClass: 'border-amber-500/40',   textClass: 'text-amber-700 dark:text-amber-300',   icon: 'fa-solid fa-hourglass-half' },
    no_hire:      { label: 'No Hire',      bgClass: 'bg-rose-500/10 dark:bg-rose-500/15',      borderClass: 'border-rose-500/40',    textClass: 'text-rose-700 dark:text-rose-300',     icon: 'fa-solid fa-ban' },
  };

  readonly assessments: SmeAssessment[] = [
    {
      id: 1,
      sme: { name: 'Dr. Priya Mehta', title: 'Principal Engineer – Frontend', initials: 'PM', avatarColor: '#7c3aed' },
      modules: [
        { key: 'web_foundations', label: 'Web Foundations — HTML5 & CSS3', questionCount: 3 },
        { key: 'javascript_es6',  label: 'JavaScript & ES6+',              questionCount: 3 },
        { key: 'angular_rxjs',    label: 'Angular Framework & RxJS',       questionCount: 3 },
      ],
      ratings: { fundamental: 8, coding: 7, problem: 8, communication: 7 },
      verdict: 'hire',
      tags: ['Analytical', 'Strong CSS Fundamentals', 'Async Expertise', 'Lifecycle Aware'],
      notes: 'Demonstrated solid understanding of CSS specificity and the critical rendering pipeline. JavaScript async model (event loop, microtasks) was well-articulated with correct execution order tracing. Angular OnPush strategy included real-world trade-offs with markForCheck vs detectChanges. RxJS Subject variants were accurately differentiated — recommended ReplaySubject(3) correctly for the notification service scenario.',
      duration: '01:12:00',
      completedAt: '11:12 AM',
    },
    {
      id: 2,
      sme: { name: 'Rahul Srinivas', title: 'Staff Engineer – Backend & Infra', initials: 'RS', avatarColor: '#059669' },
      modules: [
        { key: 'nestjs_backend', label: 'NestJS & Node.js Backend',    questionCount: 3 },
        { key: 'rest_auth',      label: 'REST APIs & Authentication',   questionCount: 3 },
        { key: 'database_orm',   label: 'Database Design & TypeORM',   questionCount: 3 },
        { key: 'system_design',  label: 'System Design & Architecture', questionCount: 3 },
      ],
      ratings: { fundamental: 9, coding: 8, problem: 7, communication: 8 },
      verdict: 'hire',
      tags: ['System Thinker', 'Security Aware', 'Architecture Focus', 'Fast Thinker'],
      notes: 'Strong NestJS knowledge — correctly explained DI scopes, forwardRef, and full JWT auth guard flow end-to-end. REST API design was clean and resource-oriented with correct status codes (201, 409, 403). Database schema included UNIQUE constraints and proper 3NF normalization. System design for async file upload demonstrated queue-based decoupling with a 202 Accepted pattern.',
      duration: '01:12:00',
      completedAt: '12:24 PM',
    },
  ];

  readonly allModules = [
    { key: 'web_foundations', label: 'Web Foundations — HTML5 & CSS3' },
    { key: 'javascript_es6',  label: 'JavaScript & ES6+' },
    { key: 'angular_rxjs',    label: 'Angular Framework & RxJS' },
    { key: 'nestjs_backend',  label: 'NestJS & Node.js Backend' },
    { key: 'rest_auth',       label: 'REST APIs & Authentication' },
    { key: 'database_orm',    label: 'Database Design & TypeORM' },
    { key: 'system_design',   label: 'System Design & Architecture' },
  ];

  get activeAssessment(): SmeAssessment {
    return this.assessments[this.activeTabIndex];
  }

  get moduleCoverage() {
    return this.allModules.map(m => {
      for (const a of this.assessments) {
        const mod = a.modules.find(mod => mod.key === m.key);
        if (mod) return { ...m, questionCount: mod.questionCount, smeInitials: a.sme.initials, covered: true };
      }
      return { ...m, questionCount: 0, smeInitials: '—', covered: false };
    });
  }

  get overallRatings(): SmeRatings {
    const n = this.assessments.length;
    const avg = (key: keyof SmeRatings) =>
      Math.round(this.assessments.reduce((s, a) => s + a.ratings[key], 0) / n * 10) / 10;
    return { fundamental: avg('fundamental'), coding: avg('coding'), problem: avg('problem'), communication: avg('communication') };
  }

  get overallAverage(): number {
    const r = this.overallRatings;
    return Math.round((r.fundamental + r.coding + r.problem + r.communication) / 4 * 10) / 10;
  }

  get overallVerdict(): VerdictKey {
    const avg = this.overallAverage;
    if (avg >= 8.5) return 'strong_hire';
    if (avg >= 6.5) return 'hire';
    if (avg >= 4.0) return 'under_review';
    return 'no_hire';
  }

  setTab(index: number): void {
    this.activeTabIndex = index;
  }

  smeAverage(r: SmeRatings): number {
    return Math.round((r.fundamental + r.coding + r.problem + r.communication) / 4 * 10) / 10;
  }

  smeQuestionTotal(a: SmeAssessment): number {
    return a.modules.reduce((s, m) => s + m.questionCount, 0);
  }

  verdict(key: VerdictKey): VerdictStyle {
    return this.verdictStyles[key];
  }

  scoreColorClass(score: number): string {
    if (score >= 8.5) return 'text-emerald-700 dark:text-emerald-400';
    if (score >= 7)   return 'text-indigo-700 dark:text-indigo-400';
    if (score >= 5)   return 'text-amber-700 dark:text-amber-400';
    return 'text-rose-700 dark:text-rose-400';
  }

  scoreBarClass(score: number): string {
    if (score >= 8.5) return 'bg-emerald-500';
    if (score >= 7)   return 'bg-indigo-600';
    if (score >= 5)   return 'bg-amber-500';
    return 'bg-rose-500';
  }

  heroScoreClass(score: number): string {
    if (score >= 8.5) return 'text-emerald-700 dark:text-emerald-400';
    if (score >= 7)   return 'text-indigo-700 dark:text-indigo-400';
    if (score >= 5)   return 'text-amber-700 dark:text-amber-400';
    return 'text-rose-700 dark:text-rose-400';
  }

  heroBadgeClass(key: VerdictKey): string {
    const map: Record<VerdictKey, string> = {
      strong_hire:  'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
      hire:         'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      under_review: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
      no_hire:      'bg-rose-500/20 border-rose-500/40 text-rose-300',
    };
    return map[key];
  }

  scoreLightClass(score: number): string {
    if (score >= 8.5) return 'text-emerald-300';
    if (score >= 7)   return 'text-indigo-300';
    if (score >= 5)   return 'text-amber-300';
    return 'text-rose-300';
  }

  printReport(): void { window.print(); }
}
