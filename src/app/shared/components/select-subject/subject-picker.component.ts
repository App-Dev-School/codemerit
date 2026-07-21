import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MasterService } from '@core/service/master.service';

@Component({
  selector: 'app-subject-picker',
  imports: [CommonModule, FormsModule],
  templateUrl: './subject-picker.component.html',
  styleUrls: ['./subject-picker.component.scss'],
})
export class SubjectPickerComponent implements OnInit, OnChanges {
  /** Fully self-contained fullscreen modal — the caller just toggles this. */
  @Input() open = false;
  @Input() title = 'Select a Subject';
  @Input() subtitle = 'Pick the skill you want to practice or assess today.';

  /** Emits the full selected subject object — the caller owns any navigation. */
  @Output() subjectSelected = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  /** In the DOM at all — see ngOnChanges. Mirrors CoursePickerComponent
      (shared/components/select-course/course-picker.component.ts): plain CSS
      transitions driven by these two flags, not Angular's [@trigger] animations,
      which don't fire reliably for elements nested inside a child component. */
  rendered = false;
  /** CSS transition target state — toggling this (once `rendered` has already
      painted the closed state) is what actually animates the slide/fade. */
  shown = false;
  private closeTimer?: ReturnType<typeof setTimeout>;

  /** Must stay ≥ the slowest exit transition duration in subject-picker.component.scss
      (.sp-panel's un-shown state) — gives the exit animation time to actually
      finish before the DOM node is removed / the caller navigates away. */
  private readonly EXIT_MS = 340;

  searchQuery = '';
  subjects: any[] = [];
  isLoading = true;

  private readonly techColorMap: Record<string, string> = {
    html: '#f97316', css: '#3b82f6', javascript: '#eab308', js: '#eab308',
    typescript: '#60a5fa', angular: '#ef4444', react: '#06b6d4', vue: '#22c55e',
    nestjs: '#dc2626', express: '#10b981', node: '#22c55e', mongodb: '#22c55e',
    mysql: '#3b82f6', java: '#f97316', python: '#eab308', docker: '#0ea5e9',
    kubernetes: '#3b82f6', git: '#ef4444', aws: '#f59e0b', cloud: '#6366f1',
    devops: '#8b5cf6', android: '#22c55e', flutter: '#06b6d4', swift: '#f97316',
    dsa: '#8b5cf6', ai: '#6366f1', analytics: '#10b981',
  };
  private readonly fallbackColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

  constructor(private master: MasterService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['open']) return;
    if (this.open) {
      clearTimeout(this.closeTimer);
      this.rendered = true;
      // Two rAFs guarantee the browser has painted the closed state at least
      // once before we flip to the open state — flipping both in the same
      // frame would let the browser coalesce them and skip the transition.
      requestAnimationFrame(() => requestAnimationFrame(() => { this.shown = true; }));
    } else if (this.rendered && this.shown) {
      // Parent drove `open` to false directly (e.g. the app navigated away
      // some other route without the user clicking our own close button) —
      // just animate out locally; close() already handles the emit path.
      this.shown = false;
      clearTimeout(this.closeTimer);
      this.closeTimer = setTimeout(() => { this.rendered = false; }, this.EXIT_MS);
    }
  }

  ngOnInit(): void {
    if (this.master.subjects?.length) {
      this.applySubjects();
      return;
    }
    // Component can mount before the app's master-data fetch resolves —
    // fall back to fetching directly rather than rendering a permanent
    // empty state.
    this.master.fetchMasterDataFromAPI().subscribe({
      next: () => this.applySubjects(),
      error: () => { this.isLoading = false; },
    });
  }

  private applySubjects(): void {
    this.subjects = this.master.subjects ?? [];
    this.isLoading = false;
  }

  get filteredSubjects(): any[] {
    if (!this.searchQuery) return this.subjects;
    const q = this.searchQuery.toLowerCase().trim();
    return this.subjects.filter(s => {
      const t = (s.title || '').toString().toLowerCase();
      const d = (s.description || '').toString().toLowerCase();
      return t.includes(q) || d.includes(q);
    });
  }

  getSubjectColor(subject: any): string {
    const key = (subject?.title ?? '').toLowerCase();
    for (const [k, v] of Object.entries(this.techColorMap)) {
      if (key.includes(k)) return v;
    }
    return this.fallbackColors[(subject?.id ?? 0) % this.fallbackColors.length];
  }

  getInitials(title: string): string {
    return (title ?? '?').slice(0, 2).toUpperCase();
  }

  switchSubject(subject: any): void {
    // Same reasoning as close() — let the panel finish sliding out before
    // the caller navigates to the selected subject.
    if (!this.shown) return;
    this.shown = false;
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.rendered = false;
      this.subjectSelected.emit(subject);
    }, this.EXIT_MS);
  }

  close(): void {
    // Play the exit transition to completion locally BEFORE telling the
    // caller — otherwise the caller's navigate-away (triggered by `closed`)
    // races the CSS transition and can tear the DOM down mid-slide.
    if (!this.shown) return;
    this.shown = false;
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.rendered = false;
      this.closed.emit();
    }, this.EXIT_MS);
  }

  clearSearch(event: Event): void {
    event.stopPropagation();
    this.searchQuery = '';
  }
}
