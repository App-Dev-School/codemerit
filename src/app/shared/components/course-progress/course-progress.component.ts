import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {
  ApexChart,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexStroke,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  colors: string[];
  stroke: ApexStroke;
  labels: string[];
};

export interface ChartConfig {
  showTitle: boolean;
  showSubtitle: boolean;
  showIcon: boolean;
  showLegend: boolean;
}

@Component({
    selector: 'app-course-progress',
    imports: [MatCardModule, NgApexchartsModule, MatIconModule],
    templateUrl: './course-progress.component.html',
    styleUrl: './course-progress.component.scss'
})
export class CourseProgressComponent {
  public cardChartOptions!: Partial<ChartOptions>;
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly config = input<ChartConfig>({
  showTitle: true,
  showSubtitle: true,
  showIcon: true,
  showLegend: true
});

  constructor() {
    this.cardChart();
  }

  private cardChart() {
    this.cardChartOptions = {
      series: [70], // 70% used space
      chart: {
        type: 'radialBar',
        height: 265,
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
              fontSize: '22px',
              show: true,
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
}
