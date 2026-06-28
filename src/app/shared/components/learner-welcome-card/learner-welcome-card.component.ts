import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '@core';

export interface OnboardStep {
  icon: string;
  label: string;
  subtitle: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaBtn: string;
  // Each string contains both light and dark: variants — JIT scans the full literal
  bgClass: string;
  borderClass: string;
  textClass: string;
  pingClass: string;
  ringClass: string;
  btnClass: string;
  route: string;
}

@Component({
  selector: 'app-learner-welcome-card',
  imports: [],
  templateUrl: './learner-welcome-card.component.html',
  styleUrl: './learner-welcome-card.component.scss',
})
export class LearnerWelcomeCardComponent implements OnInit {
  authData!: User;
  isVisitor = true;
  currentStep = 0;

  readonly steps: OnboardStep[] = [
    {
      icon: 'how_to_reg',
      label: 'Register',
      subtitle: 'Create your account',
      ctaTitle: 'Set up your CodeMerit profile',
      ctaDesc: 'Sign up and build your professional profile to unlock personalized skill assessments and opportunities.',
      ctaBtn: 'Create Account',
      bgClass:     'bg-indigo-50     dark:bg-indigo-500/10',
      borderClass: 'border-indigo-200 dark:border-indigo-500/30',
      textClass:   'text-indigo-600  dark:text-indigo-400',
      pingClass:   'bg-indigo-300/50 dark:bg-indigo-500/25',
      ringClass:   'border-indigo-500 shadow-indigo-200 dark:shadow-indigo-500/20',
      btnClass:    'bg-indigo-500 hover:bg-indigo-600 shadow-md shadow-indigo-500/25',
      route: '/authentication/signup',
    },
    {
      icon: 'assignment',
      label: 'Assessment',
      subtitle: 'Validate your skills',
      ctaTitle: 'Complete your skill assessment',
      ctaDesc: 'Take structured evaluations across your chosen domains to benchmark your expertise with industry standards.',
      ctaBtn: 'Start Assessment',
      bgClass:     'bg-amber-50     dark:bg-amber-500/10',
      borderClass: 'border-amber-200 dark:border-amber-500/30',
      textClass:   'text-amber-600  dark:text-amber-400',
      pingClass:   'bg-amber-300/50 dark:bg-amber-500/25',
      ringClass:   'border-amber-500 shadow-amber-200 dark:shadow-amber-500/20',
      btnClass:    'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/25',
      route: '/assessment/skill-rating',
    },
    {
      icon: 'videocam',
      label: 'Live Interview',
      subtitle: 'Attend live session',
      ctaTitle: 'Join your live technical session',
      ctaDesc: 'Get matched with expert interviewers for a live technical assessment, real-time feedback, and scoring.',
      ctaBtn: 'Schedule Session',
      bgClass:     'bg-emerald-50     dark:bg-emerald-500/10',
      borderClass: 'border-emerald-200 dark:border-emerald-500/30',
      textClass:   'text-emerald-700  dark:text-emerald-400',
      pingClass:   'bg-emerald-300/50 dark:bg-emerald-500/25',
      ringClass:   'border-emerald-500 shadow-emerald-200 dark:shadow-emerald-500/20',
      btnClass:    'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/25',
      route: '/interview',
    },
    {
      icon: 'workspace_premium',
      label: 'Recognition',
      subtitle: 'Earn your certificate',
      ctaTitle: 'Receive your verified certification',
      ctaDesc: 'Earn digital certificates and merit badges recognised by top employers and shared across your profile.',
      ctaBtn: 'View Certificates',
      bgClass:     'bg-violet-50     dark:bg-violet-500/10',
      borderClass: 'border-violet-200 dark:border-violet-500/30',
      textClass:   'text-violet-600  dark:text-violet-400',
      pingClass:   'bg-violet-300/50 dark:bg-violet-500/25',
      ringClass:   'border-violet-500 shadow-violet-200 dark:shadow-violet-500/20',
      btnClass:    'bg-violet-500 hover:bg-violet-600 shadow-md shadow-violet-500/25',
      route: '/profile',
    },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.authData = this.authService.currentUserValue;
    if (this.authData?.token && this.authData?.firstName && this.authData?.id) {
      this.isVisitor = false;
      this.currentStep = 1; // registered — nudge toward assessment
    }
  }

  get activeStep(): OnboardStep {
    return this.steps[this.currentStep];
  }

  get progressPercent(): number {
    return Math.round((this.currentStep / (this.steps.length - 1)) * 100);
  }

  getStepStatus(i: number): 'done' | 'active' | 'pending' {
    if (i < this.currentStep) return 'done';
    if (i === this.currentStep) return 'active';
    return 'pending';
  }

  handleCTA() {
    this.router.navigate([this.activeStep.route]);
  }
}
