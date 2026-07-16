import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MasterService } from '@core/service/master.service';

@Component({
  selector: 'app-course-picker',
  imports: [CommonModule, FormsModule],
  templateUrl: './course-picker.component.html',
  styleUrls: ['./course-picker.component.scss'],
})
export class CoursePickerComponent implements OnInit, OnChanges {
  /** Fully self-contained fullscreen modal — the caller just toggles this. */
  @Input() open = false;
  @Input() minimal = true;
  @Input() currentCourses: number[] = [];
  @Input() actionMode: 'view' | 'enroll' | 'skill-rating' = 'view';
  @Input() title = 'Choose your Job Role';
  @Input() subtitle = 'Select a role to personalise your learning path and unlock relevant assessments.';

  /** Emits the full selected job-role object — the caller owns any navigation. */
  @Output() subjectSelected = new EventEmitter<any>();
  @Output() closed = new EventEmitter<void>();

  /** In the DOM at all — see ngOnChanges. Not using Angular's [@trigger] animations:
      those never fired reliably for this element (nested inside a child component,
      confirmed via getAnimations() returning empty even on a genuine false→true
      flip) — plain CSS transitions driven by these two flags sidestep that entirely. */
  rendered = false;
  /** CSS transition target state — toggling this (once `rendered` has already
      painted the closed state) is what actually animates the slide/fade. */
  shown = false;
  private closeTimer?: ReturnType<typeof setTimeout>;

  /** Must stay ≥ the slowest exit transition duration in course-picker.component.scss
      (.cp-panel's un-shown state) — this is what gives the exit animation time to
      actually finish before the DOM node is removed / the caller navigates away. */
  private readonly EXIT_MS = 340;

  searchQuery = '';
  courses: any[] = [];
  isLoading = true;

  private readonly fallbackAccents = ['#6366f1', '#7c3aed', '#059669', '#0284c7', '#e11d48', '#d97706', '#0d9488'];

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
    if (this.master.jobRoles?.length) {
      this.applyCourses();
      return;
    }
    // Component can mount before the app's master-data fetch resolves —
    // fall back to fetching directly rather than rendering a permanent
    // empty state (same fallback select-subject.component.ts uses).
    this.master.fetchMasterDataFromAPI().subscribe({
      next: () => this.applyCourses(),
      error: () => { this.isLoading = false; },
    });
  }

  private applyCourses(): void {
    const allJobRoles = this.master.jobRoles;
    this.courses = allJobRoles?.length ? allJobRoles.filter(j => j.isPublished) : [];
    this.isLoading = false;
  }

  get filteredCourses(): any[] {
    if (!this.searchQuery) return this.courses;
    const q = this.searchQuery.toLowerCase().trim();
    return this.courses.filter(job => {
      const jobTitle = (job.title || '').toString().toLowerCase();
      const desc = (job.description || '').toString().toLowerCase();
      return jobTitle.includes(q) || desc.includes(q);
    });
  }

  isEnrolled(job: any): boolean {
    return job.isSubscribed || this.currentCourses.includes(+job.id);
  }

  getRoleColor(job: any): string {
    return job?.color || this.fallbackAccents[(job?.id ?? 0) % this.fallbackAccents.length];
  }

  getInitials(title: string): string {
    return (title ?? '?').slice(0, 2).toUpperCase();
  }

  getActionLabel(): string {
    return this.actionMode === 'skill-rating' ? 'Start Evaluation'
         : this.actionMode === 'enroll'       ? 'Enroll Now'
         : 'Explore';
  }

  switchJobRole(job: any): void {
    // Same reasoning as close() — let the panel finish sliding out before
    // the caller navigates to the selected role.
    if (!this.shown) return;
    this.shown = false;
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.rendered = false;
      this.subjectSelected.emit(job);
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
