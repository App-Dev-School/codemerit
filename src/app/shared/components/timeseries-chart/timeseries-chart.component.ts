import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatFormField, MatSelectModule } from '@angular/material/select';
import { NgApexchartsModule } from 'ng-apexcharts';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart & { type: 'line' | 'area' | 'bar' | 'scatter' | 'candlestick' | 'heatmap' | 'rangeBar' };
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  responsive: ApexResponsive[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  grid: ApexGrid;
  colors: string[];
};

export type TimeframeData = {
  title: string;
  daily: { key: string; value: number }[];
  weekly: { key: string; value: number }[];
};

@Component({
  selector: 'app-timeseries-chart',
  templateUrl: './timeseries-chart.component.html',
  styleUrls: ['./timeseries-chart.component.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    MatFormField,
    MatCardModule,
    MatCardHeader,
    MatButtonModule,
    MatSelectModule
  ]
})
export class TimeseriesChartComponent implements OnInit, OnChanges {
  selectedTimePeriod: string = 'Daily';
  public areaChartOptions!: Partial<ChartOptions>;
  @Input() timeframe: any;

  ngOnInit() {
    //console.log("timeframe", this.timeframe);
    this.chart1();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['timeframe'] && !changes['timeframe'].firstChange) {
      this.chart1(); // re-render whenever timeframe changes
    }
  }

  onTimePeriodChange(event: any): void {
    this.chart1();
  }

  private chart1() {
  if (!this.timeframe) return;
  let categories: string[] = [];
  let values: number[] = [];

  if (this.selectedTimePeriod === 'Daily' && this.timeframe.daily) {
    categories = this.timeframe.daily.map((item: any) => item.key);
    values = this.timeframe.daily.map((item: any) => item.value);
  } else if (this.selectedTimePeriod === 'Weekly' && this.timeframe.weekly) {
    categories = this.timeframe.weekly.map((item: any) => item.key);
    values = this.timeframe.weekly.map((item: any) => item.value);
  }

  this.areaChartOptions = {
    series: [
      {
        name: this.timeframe.title,
        data: values,
      },
    ],
    chart: {
      height: 300,
      type: 'line', //bar
      toolbar: { show: false },
      foreColor: '#9aa0ac',
    },
    colors: ['#407fe4'],
    dataLabels: { enabled: false },
    grid: {
      show: true,
      borderColor: '#9aa0ac',
      strokeDashArray: 1,
    },
    stroke: { curve: 'smooth' },
    xaxis: {
      type: 'category',
      categories,
      labels: { show: true },
    },
    legend: { show: true, position: 'top' },
    tooltip: { theme: 'dark' },
  };
}

}
