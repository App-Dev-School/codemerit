import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
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

  levelMeta(level: string): { color: string; bg: string; textClass: string } {
    const l = (level || '').toLowerCase();
    if (l.includes('expert') || l.includes('master') || l.includes('complete'))
      return { color: '#34d399', bg: 'rgba(52,211,153,0.12)', textClass: 'text-cm-text-primary dark:text-emerald-400' };
    if (l.includes('proficient') || l.includes('advance'))
      return { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', textClass: 'text-cm-text-primary dark:text-violet-400' };
    if (l.includes('intermediate'))
      return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', textClass: 'text-cm-text-primary dark:text-amber-400' };
    if (l.includes('beginner') || l.includes('developing'))
      return { color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', textClass: 'text-cm-text-primary dark:text-sky-400' };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', textClass: 'text-cm-text-primary dark:text-slate-400' };
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

  onEnrollSubject(subject: Subject) { this.enrollSubject.next(subject); }
}
