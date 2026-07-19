import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';

const CIRCUMFERENCE = 125.6;

@Component({
  selector: 'app-ring-stat',
  imports: [DecimalPipe],
  template: `
    <div class="flex items-center gap-3">
      <div class="relative w-14 h-14 shrink-0">
        <svg class="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" stroke-width="3.5" stroke="currentColor"
                  class="text-cm-surface-raised" fill="none"/>
          <circle cx="24" cy="24" r="20" stroke-width="3.5" fill="none"
                  stroke="currentColor" stroke-linecap="round"
                  [class]="ringColorClass"
                  [attr.stroke-dasharray]="circumference"
                  [attr.stroke-dashoffset]="dashOffset"
                  class="transition-all duration-700"/>
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-xs font-black text-cm-text-primary">{{ percent }}%</span>
        </div>
      </div>
      <div class="min-w-0">
        <p class="text-sm font-bold text-cm-text-primary">{{ value | number }} / {{ total | number }}</p>
        <p class="text-[11px] text-cm-text-muted leading-snug">{{ label }}</p>
      </div>
    </div>
  `,
})
export class RingStatComponent {
  @Input() value = 0;
  @Input() total = 0;
  @Input() label = '';
  @Input() ringColorClass = 'text-cm-brand';

  readonly circumference = CIRCUMFERENCE;

  get percent(): number {
    return this.total > 0 ? Math.round((this.value / this.total) * 100) : 0;
  }

  get dashOffset(): number {
    return CIRCUMFERENCE - (CIRCUMFERENCE * this.percent) / 100;
  }
}
