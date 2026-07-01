import { Component, computed, signal } from '@angular/core';
import { animate, group, style, transition, trigger } from '@angular/animations';

interface DailyLesson {
  id: number;
  title: string;
  topic: string;
  duration: string;
  iconImg: string;
  accentClass: string;
  badgeClass: string;
}

@Component({
  selector: 'app-daily-lessons-widget',
  templateUrl: './daily-lessons-widget.component.html',
  animations: [
    trigger('lessonRow', [
      transition(':leave', [
        style({ overflow: 'hidden', height: '*' }),
        group([
          animate('280ms ease-in', style({ opacity: 0, transform: 'translateX(72px)' })),
          animate('460ms 160ms ease-in-out', style({ height: '0px', paddingTop: '0px', paddingBottom: '0px' }))
        ])
      ])
    ]),
    trigger('allDone', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.92)' }),
        animate('400ms 100ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class DailyLessonsWidgetComponent {
  readonly streakDays = 7;

  readonly lessons: DailyLesson[] = [
    {
      id: 1,
      title: 'Angular Signals — Reactive State Without Zone.js',
      topic: 'Angular',
      duration: '8 min',
      iconImg: 'assets/images/tech/angular.png',
      accentClass: 'border-l-red-500',
      badgeClass: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20',
    },
    {
      id: 2,
      title: 'TypeScript Generics & Conditional Types Explained',
      topic: 'TypeScript',
      duration: '12 min',
      iconImg: 'assets/images/tech/typescript.png',
      accentClass: 'border-l-blue-500',
      badgeClass: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20',
    },
    {
      id: 3,
      title: 'RxJS: switchMap vs mergeMap vs concatMap',
      topic: 'RxJS',
      duration: '10 min',
      iconImg: 'assets/images/tech/rxjs.png',
      accentClass: 'border-l-violet-500',
      badgeClass: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20',
    },
    {
      id: 4,
      title: 'Git Rebase vs Merge — When to Use Which',
      topic: 'Git',
      duration: '7 min',
      iconImg: 'assets/images/tech/git.png',
      accentClass: 'border-l-orange-500',
      badgeClass: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20',
    },
    {
      id: 5,
      title: 'Docker Multi-Stage Builds for Leaner Images',
      topic: 'Docker',
      duration: '9 min',
      iconImg: 'assets/images/tech/docker.png',
      accentClass: 'border-l-sky-500',
      badgeClass: 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20',
    },
  ];

  private completedIds = signal(new Set<number>());
  private removedIds   = signal(new Set<number>());

  readonly activeLessons  = computed(() => this.lessons.filter(l => !this.removedIds().has(l.id)));
  readonly completedCount = computed(() => this.completedIds().size);
  readonly progressPercent = computed(() => (this.completedIds().size / this.lessons.length) * 100);
  readonly allDone = computed(() => this.removedIds().size === this.lessons.length);

  isDone(id: number): boolean {
    return this.completedIds().has(id);
  }

  isCompleting(id: number): boolean {
    return this.completedIds().has(id) && !this.removedIds().has(id);
  }

  markDone(lesson: DailyLesson): void {
    if (this.completedIds().has(lesson.id)) return;
    this.completedIds.update(s => new Set([...s, lesson.id]));
    setTimeout(() => this.removedIds.update(s => new Set([...s, lesson.id])), 900);
  }
}
