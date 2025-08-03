import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
//unused
import { BaseChartDirective } from 'ng2-charts';

import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { ActivityCountCardComponent } from '@shared/components/activity-count/activity-count-card.component';
import { SubscriptionTableWidgetComponent } from '@shared/components/subscription-table-widget/subscription-table-widget.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { SnackbarService } from '@core/service/snackbar.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '@core';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
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
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss'],
    imports: [
        RouterLink,
        BreadcrumbComponent,
        MatCardModule,
        MatButtonModule,
        MatTableModule,
        MatSelectModule,
        NgScrollbar,
        MatMenuModule,
        MatIconModule,
        BaseChartDirective,
        SubscriptionTableWidgetComponent,
        ActivityCountCardComponent
    ]
})
export class MainComponent implements OnInit {
  public areaChartOptions!: Partial<ChartOptions>;
  public smallChart1Options!: Partial<ChartOptions>;
  public smallChart3Options!: Partial<ChartOptions>;
  public smallChart4Options!: Partial<ChartOptions>;
  public barChartOptions!: Partial<ChartOptions>;
  selectedTimePeriod: string = 'Monthly';

  subject= "";

    public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };
  public doughnutChartLabels: string[] = ['India', 'USA', 'Itely'];
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [350, 450, 100],
        backgroundColor: ['#60A3F6', '#7C59E7', '#DD6811'],
      },
    ],
  };
  public doughnutChartType: ChartType = 'doughnut';
  
  constructor(private route: ActivatedRoute, private authService: AuthService, private snackService: SnackbarService) {
    console.log("MainComponent constructor", this.subject);
  }
  ngOnInit() {
    this.takeRouteParams();
    this.smallChart1();
    this.smallChart3();
    this.smallChart4();
    this.chart1();
  }

  //Implement for admin
  takeRouteParams() {
    const subject = this.route.snapshot.paramMap.get('subject');
    console.log("MainComponent ParamMap subject", subject);
    
    /********** CHECK ROUTE PARAM REQUESTS ***********/
    this.route.paramMap.subscribe(params => {
      if (params.get("subject")) {
        this.subject = params.get("subject");
        console.log("MainComponent ParamMap 2", this.subject);
      } else {
        this.subject = "";
      }
    });
    /********* CHECK ROUTE PARAM REQUESTS ***********/
  }
  
  private smallChart1() {
    this.smallChart1Options = {
      series: [
        {
          name: 'Appointments',
          data: [
            50, 61, 80, 50, 72, 52, 60, 41, 30, 45, 70, 40, 93, 63, 50, 62,
          ],
        },
      ],
      chart: {
        height: 70,
        type: 'area',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#6F42C1'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: [
          '16-07-2018',
          '17-07-2018',
          '18-07-2018',
          '19-07-2018',
          '20-07-2018',
          '21-07-2018',
          '22-07-2018',
          '23-07-2018',
          '24-07-2018',
          '25-07-2018',
          '26-07-2018',
          '27-07-2018',
          '28-07-2018',
          '29-07-2018',
          '30-07-2018',
          '31-07-2018',
        ],
      },
      legend: {
        show: false,
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

  private smallChart3() {
    this.smallChart3Options = {
      series: [
        {
          name: 'New Users',
          data: [
            50, 61, 80, 50, 72, 52, 60, 41, 30, 45, 70, 40, 93, 63, 50, 62,
          ],
        },
      ],
      chart: {
        height: 70,
        type: 'area',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#4CAF50'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: [
          '16-07-2018',
          '17-07-2018',
          '18-07-2018',
          '19-07-2018',
          '20-07-2018',
          '21-07-2018',
          '22-07-2018',
          '23-07-2018',
          '24-07-2018',
          '25-07-2018',
          '26-07-2018',
          '27-07-2018',
          '28-07-2018',
          '29-07-2018',
          '30-07-2018',
          '31-07-2018',
        ],
      },
      legend: {
        show: false,
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

  private smallChart4() {
    this.smallChart4Options = {
      series: [
        {
          name: 'Earning',
          data: [
            150, 161, 180, 150, 172, 152, 160, 141, 130, 145, 170, 140, 193,
            163, 150, 162,
          ],
        },
      ],
      chart: {
        height: 70,
        type: 'area',
        toolbar: {
          show: false,
        },
        sparkline: {
          enabled: true,
        },
        foreColor: '#9aa0ac',
      },
      colors: ['#2196F3'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        categories: [
          '16-07-2018',
          '17-07-2018',
          '18-07-2018',
          '19-07-2018',
          '20-07-2018',
          '21-07-2018',
          '22-07-2018',
          '23-07-2018',
          '24-07-2018',
          '25-07-2018',
          '26-07-2018',
          '27-07-2018',
          '28-07-2018',
          '29-07-2018',
          '30-07-2018',
          '31-07-2018',
        ],
      },
      legend: {
        show: false,
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
        categories = ['2020', '2021', '2022', '2023', '2024'];
        newPatientsData = [300, 450, 600, 700, 800];
        oldPatientsData = [200, 300, 400, 500, 600];
        break;
    }

    this.areaChartOptions = {
      series: [
        {
          name: 'Total Views',
          data: newPatientsData,
        },
        {
          name: 'Total Reads',
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
