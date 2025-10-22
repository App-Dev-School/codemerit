import { Component, OnInit } from '@angular/core';
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
export class TimeseriesChartComponent implements OnInit {
  selectedTimePeriod: string = 'Monthly';
  public areaChartOptions!: Partial<ChartOptions>;

  ngOnInit() {
    this.chart1();
  }

  onTimePeriodChange(event: any): void {
    this.chart1();
  }

  private chart1() {
    let categories: string[] = [];
    let newPatientsData: number[] = [];
    let oldPatientsData: number[] = [];

    switch (this.selectedTimePeriod) {
      case 'Daily':
        categories = [
          '2024-11-01',
          '2024-11-02',
          '2024-11-03',
          '2024-11-04',
          '2024-11-05',
          '2024-11-06',
          '2024-11-07',
        ];
        newPatientsData = [5, 8, 6, 4, 7, 9, 10];
        oldPatientsData = [2, 3, 4, 3, 5, 6, 7];
        break;

      case 'Monthly':
        categories = [
          '2024-01',
          '2024-02',
          '2024-03',
          '2024-04',
          '2024-05',
          '2024-06',
          '2024-07',
        ];
        newPatientsData = [31, 40, 28, 51, 42, 85, 77];
        oldPatientsData = [11, 32, 45, 32, 34, 52, 41];
        break;

      case 'Yearly':
        categories = ['2018', '2019', '2020', '2021', '2022', '2023', '2024'];
        newPatientsData = [200, 250, 300, 450, 600, 700, 800];
        oldPatientsData = [120, 180, 200, 300, 400, 500, 600];
        break;
    }

    this.areaChartOptions = {
      series: [
        {
          name: 'New Patients',
          data: newPatientsData,
        },
        {
          name: 'Old Patients',
          data: oldPatientsData,
        },
      ],
      chart: {
        height: 300,
        type: 'area',
        toolbar: {
          show: false,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#407fe4', '#E47E3C'],
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: true,
        borderColor: '#9aa0ac',
        strokeDashArray: 1,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'datetime',
        categories: categories,
        labels: {
          show: true,
          offsetX: 20,
          offsetY: 0,
        },
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        offsetX: 0,
        offsetY: 0,
      },

      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }

}
