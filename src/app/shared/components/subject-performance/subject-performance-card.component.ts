import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from '@core/models/subject';
import {
  ApexChart,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  NgApexchartsModule,
} from 'ng-apexcharts';

type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  colors: string[];
  stroke: ApexStroke;
  labels: string[];
};

interface MeritIndicators {
  label: string;
  class: string;
  labelClass: string;
  percentage: number;
}

@Component({
  selector: 'app-subject-performance-card',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    NgApexchartsModule,
  ],
  templateUrl: './subject-performance-card.component.html',
  styleUrl: './subject-performance-card.component.scss',
})
export class SubjectPerformanceCardComponent implements OnInit, OnChanges {
  @Input() subject: any;
  @Input() showAverageAccuracy = true;
  @Input() compact = false;
  @Input() indicators: MeritIndicators[] = [];
  @Output() exploreSubject = new EventEmitter<Subject>();
  @Output() enrollSubject = new EventEmitter<Subject>();
  public cardChartOptions!: Partial<ChartOptions>;

  ngOnInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subject'] && this.subject) {
      this.buildChart();
    }
  }

  get cardShadow(): string {
    const c = this.subject?.color || '#6366f1';
    return `0 8px 32px -4px ${c}30, 0 2px 12px rgba(0,0,0,0.10)`;
  }

  getScoreClass(score: number): string {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  }

  private buildChart() {
    if (!this.subject) return;
    const color = this.subject.color || '#6366f1';
    this.cardChartOptions = {
      series: [this.subject.score ?? 0],
      chart: { type: 'radialBar', height: 145, background: 'transparent', sparkline: { enabled: false } },
      plotOptions: {
        radialBar: {
          hollow: { size: '52%' },
          track: { show: true, background: 'var(--cm-surface-raised)', opacity: 1, margin: 4 },
          dataLabels: {
            name: { show: false },
            value: {
              fontSize: '24px',
              fontWeight: '900',
              show: true,
              offsetY: 8,
              color: 'var(--cm-text-primary)',
              formatter: (val) => val + '%',
            },
          },
        },
      },
      fill: { colors: [color] },
      stroke: { lineCap: 'round' },
      colors: [color],
      labels: ['Score'],
    };
  }

  onExploreSubject(subject: Subject) { this.exploreSubject.next(subject); }
  onEnrollSubject(subject: Subject) { this.enrollSubject.next(subject); }
}
