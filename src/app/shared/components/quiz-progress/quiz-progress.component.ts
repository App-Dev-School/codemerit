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
  showLegend: boolean;
}

@Component({
    selector: 'app-quiz-progress',
    imports: [MatCardModule, NgApexchartsModule, MatIconModule],
    templateUrl: './quiz-progress.component.html',
    styleUrl: './quiz-progress.component.scss'
})
export class QuizProgressComponent {
  public cardChartOptions!: Partial<ChartOptions>;
  readonly score = input<number>(0);

  readonly config = input<ChartConfig>({
  showTitle: true,
  showLegend: true
});

  constructor() {
    this.cardChart();
  }

  private cardChart() {
    this.cardChartOptions = {
      series: [this.score()],
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
              fontSize: '32px',
              show: true,
              fontWeight: 600,
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
      labels: [''],
    };
  }
}
