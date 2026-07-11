import { Directive, ElementRef, Input, OnChanges, OnDestroy, Renderer2, SimpleChanges } from '@angular/core';

// Keeps a progress-bar fill at 0 width until the element scrolls into view, then
// animates it to the bound value. Pair with a slow CSS transition (duration-1000+)
// on the host element for the "fills in as you reach it" effect.
@Directive({
  selector: '[appRevealProgress]',
  standalone: true,
})
export class RevealProgressDirective implements OnChanges, OnDestroy {
  @Input('appRevealProgress') value = 0;

  private observer?: IntersectionObserver;
  private revealed = false;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {
    this.renderer.setStyle(this.el.nativeElement, 'width', '0%');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !this.observer) {
      this.setupObserver();
    }
    if (this.revealed) {
      this.renderer.setStyle(this.el.nativeElement, 'width', (this.value || 0) + '%');
    }
  }

  private setupObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.revealed = true;
      this.renderer.setStyle(this.el.nativeElement, 'width', (this.value || 0) + '%');
      return;
    }
    this.observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry?.isIntersecting && !this.revealed) {
        this.revealed = true;
        // Defer a frame so the browser registers the starting 0% before animating.
        requestAnimationFrame(() => {
          this.renderer.setStyle(this.el.nativeElement, 'width', (this.value || 0) + '%');
        });
        this.observer?.disconnect();
      }
    }, { threshold: 0.3 });
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
