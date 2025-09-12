import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
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

interface ChartConfig {
  showTitle: boolean;
  showSubtitle: boolean;
  showIcon: boolean;
  showLegend: boolean;
}

interface Merits {
  knowledge: string;
  understanding: number;
  approach: string;
  skills: string;
  codability: string;
  challenges: string;
  status?: string;
}

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
    MatCardModule,
    MatIconModule, MatButtonModule,
    NgApexchartsModule
  ],
  templateUrl: './subject-performance-card.component.html',
  styleUrl: './subject-performance-card.component.scss'
})
export class SubjectPerformanceCardComponent implements OnInit {
  //@Input() subject: string = "";
  @Input() subject: any;
  @Input() indicators: MeritIndicators[] = [];
  @Output() exploreSubject = new EventEmitter<Subject>();
  @Output() enrollSubject = new EventEmitter<Subject>();
  public cardChartOptions!: Partial<ChartOptions>;

  constructor() {
  }

  ngOnInit(): void {
    this.cardChart();
  }

  private cardChart() {
    this.cardChartOptions = {
      series: [this.subject.score ?? 0],
      chart: {
        type: 'radialBar',
        height: 180,
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: '50%',
          },
          track: {
            show: true,
            background: '#dbdbdb',
            opacity: 1,
            margin: 5,
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              fontSize: '30px',
              show: true,
              offsetY: 16,
              formatter: function (val) {
                return val + '%';
              },
            },
          },
        },
      },
      fill: {
        colors: ['#FFA726'], // Orange gradient
      },
      stroke: {
        lineCap: 'round',
      },
      colors: ['#FFA726'],
      labels: ['Assessment Completion'],
    };
  }

  onExploreSubject(subject: Subject) {
  this.exploreSubject.next(subject);
  }

  onEnrollSubject(subject: Subject) {
  this.enrollSubject.next(subject);
  }
}