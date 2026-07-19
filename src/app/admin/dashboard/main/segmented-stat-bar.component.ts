import { Component, Input } from '@angular/core';

export interface StatBarSegment {
  label: string;
  value: number;
  colorClass: string;
}

@Component({
  selector: 'app-segmented-stat-bar',
  imports: [],
  template: `
    <div class="w-full h-1.5 rounded-full overflow-hidden bg-cm-surface-raised flex">
      @for (seg of segments; track seg.label) {
        <div class="h-full transition-all" [class]="seg.colorClass" [style.width.%]="pct(seg.value)"></div>
      }
    </div>
    @if (showLegend) {
      <div class="flex items-center flex-wrap gap-x-3 gap-y-1 mt-2">
        @for (seg of segments; track seg.label) {
          <span class="flex items-center gap-1 text-[10px] text-cm-text-secondary">
            <span class="w-1.5 h-1.5 rounded-full shrink-0" [class]="seg.colorClass"></span>
            {{ seg.label }}: <span class="font-semibold text-cm-text-primary">{{ seg.value }}</span>
          </span>
        }
      </div>
    }
  `,
})
export class SegmentedStatBarComponent {
  @Input() segments: StatBarSegment[] = [];
  @Input() total?: number;
  @Input() showLegend = true;

  get computedTotal(): number {
    return this.total ?? this.segments.reduce((sum, seg) => sum + seg.value, 0);
  }

  pct(value: number): number {
    return this.computedTotal > 0 ? (value / this.computedTotal) * 100 : 0;
  }
}
