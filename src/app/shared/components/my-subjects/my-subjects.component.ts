import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-my-subjects',
  imports: [AsyncPipe],
  templateUrl: './my-subjects.component.html',
  styleUrl: './my-subjects.component.scss'
})
export class MySubjectsComponent implements OnChanges {
  @Input() subjects: Observable<any>;
  @Input() searchQuery = '';
  @Output() subjectSelected = new EventEmitter<string>();
  @Output() onSubscribe = new EventEmitter<string>();

  displaySubjects$: Observable<any[]> = of([]);

  private readonly techColorMap: Record<string, string> = {
    html:         '#f97316',
    css:          '#3b82f6',
    javascript:   '#eab308',
    js:           '#eab308',
    typescript:   '#60a5fa',
    angular:      '#ef4444',
    react:        '#06b6d4',
    'vue':        '#22c55e',
    nestjs:       '#dc2626',
    'express':    '#10b981',
    'node':       '#22c55e',
    mongodb:      '#22c55e',
    mysql:        '#3b82f6',
    java:         '#f97316',
    python:       '#eab308',
    docker:       '#0ea5e9',
    kubernetes:   '#3b82f6',
    git:          '#ef4444',
    aws:          '#f59e0b',
    cloud:        '#6366f1',
    devops:       '#8b5cf6',
    android:      '#22c55e',
    flutter:      '#06b6d4',
    swift:        '#f97316',
    dsa:          '#8b5cf6',
    ai:           '#6366f1',
    analytics:    '#10b981',
  };

  private readonly fallbackColors = [
    '#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6',
  ];

  getSubjectColor(subject: any): string {
    const key = (subject.title ?? '').toLowerCase();
    for (const [k, v] of Object.entries(this.techColorMap)) {
      if (key.includes(k)) return v;
    }
    return this.fallbackColors[(subject.id ?? 0) % this.fallbackColors.length];
  }

  getInitials(title: string): string {
    return (title ?? '?').slice(0, 2).toUpperCase();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subjects'] || changes['searchQuery'] !== undefined) {
      this.buildDisplay();
    }
  }

  private buildDisplay(): void {
    if (!this.subjects) { this.displaySubjects$ = of([]); return; }
    this.displaySubjects$ = this.subjects.pipe(
      map((list: any[]) => {
        if (!list?.length) return [];
        const q = (this.searchQuery ?? '').trim().toLowerCase();
        return q ? list.filter(s => s.title?.toLowerCase().includes(q)) : list;
      })
    );
  }

  switchSubject(slug: string): void {
    this.subjectSelected.emit(slug);
  }
}
