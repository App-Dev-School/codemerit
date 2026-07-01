import { Injectable, Renderer2, signal } from '@angular/core';

const STORAGE_KEY = 'tw_dark_mode';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Reactive signal — components can read this without subscribing */
  readonly isDark = signal(false);

  /**
   * Call once in the root layout's ngAfterViewInit.
   * Reads saved preference → system default → applies the class.
   */
  init(document: Document, renderer: Renderer2): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    // Default is dark unless the user has explicitly chosen light
    const dark = saved !== null ? saved === 'true' : true;
    this.apply(dark, document, renderer);
  }

  toggle(document: Document, renderer: Renderer2): void {
    this.apply(!this.isDark(), document, renderer);
  }

  private apply(dark: boolean, document: Document, renderer: Renderer2): void {
    this.isDark.set(dark);
    localStorage.setItem(STORAGE_KEY, String(dark));
    // Tailwind dark: variants activate when <html> has .dark
    if (dark) {
      renderer.addClass(document.documentElement, 'dark');
    } else {
      renderer.removeClass(document.documentElement, 'dark');
    }
  }
}
