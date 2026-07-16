import { Injectable, Renderer2, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'auto';

const MODE_STORAGE_KEY = 'tw_theme_mode';
// Legacy binary key from before 'auto' existed — read once for migration,
// never written again.
const LEGACY_STORAGE_KEY = 'tw_dark_mode';

// "Auto" follows local time of day, not OS prefers-color-scheme, per explicit
// product decision — light 06:00-18:00, dark 18:00-06:00.
const AUTO_DARK_START_HOUR = 18;
const AUTO_DARK_END_HOUR = 6;
const AUTO_RECHECK_MS = 10 * 60 * 1000; // re-evaluate every 10 minutes while in auto mode

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Reactive signal — components can read the currently *applied* dark/light state without subscribing. */
  readonly isDark = signal(false);
  /** Reactive signal — the user's chosen mode (light/dark/auto), not necessarily the applied state. */
  readonly mode = signal<ThemeMode>('dark');

  private cachedDocument?: Document;
  private cachedRenderer?: Renderer2;
  private autoRecheckTimer?: ReturnType<typeof setInterval>;

  /**
   * Call once in the root layout's ngAfterViewInit.
   * Reads saved preference (migrating the old binary key if present) and applies it.
   */
  init(document: Document, renderer: Renderer2): void {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY) as ThemeMode | null;
    if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto') {
      this.setMode(savedMode, document, renderer);
      return;
    }
    // Migrate the old boolean key once — default stays dark unless the user
    // had explicitly chosen light before 'auto' existed.
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    const migratedMode: ThemeMode = legacy === 'false' ? 'light' : 'dark';
    this.setMode(migratedMode, document, renderer);
  }

  /** Explicit light/dark/auto selection — used by the Settings tab's 3-way control. */
  setMode(mode: ThemeMode, document: Document, renderer: Renderer2): void {
    this.mode.set(mode);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
    this.cachedDocument = document;
    this.cachedRenderer = renderer;
    this.applyCurrentMode();
    this.syncAutoRecheckTimer();
  }

  /** Quick binary toggle (header icon button) — always breaks out of 'auto' into an explicit choice. */
  toggle(document: Document, renderer: Renderer2): void {
    this.setMode(this.isDark() ? 'light' : 'dark', document, renderer);
  }

  private applyCurrentMode(): void {
    if (!this.cachedDocument || !this.cachedRenderer) return;
    const dark = this.mode() === 'auto' ? this.isNightTimeNow() : this.mode() === 'dark';
    this.isDark.set(dark);
    // Tailwind dark: variants activate when <html> has .dark
    if (dark) {
      this.cachedRenderer.addClass(this.cachedDocument.documentElement, 'dark');
    } else {
      this.cachedRenderer.removeClass(this.cachedDocument.documentElement, 'dark');
    }
  }

  private isNightTimeNow(): boolean {
    const hour = new Date().getHours();
    return hour >= AUTO_DARK_START_HOUR || hour < AUTO_DARK_END_HOUR;
  }

  // Only runs a recurring timer while in 'auto' mode, so a user who picked an
  // explicit light/dark theme isn't paying for a background interval.
  private syncAutoRecheckTimer(): void {
    if (this.autoRecheckTimer) {
      clearInterval(this.autoRecheckTimer);
      this.autoRecheckTimer = undefined;
    }
    if (this.mode() === 'auto') {
      this.autoRecheckTimer = setInterval(() => this.applyCurrentMode(), AUTO_RECHECK_MS);
    }
  }
}
