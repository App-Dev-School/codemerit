
import { NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { QuizResult } from '@core/models/quiz';
import { NgScrollbar } from 'ngx-scrollbar';
import { QuizProgressComponent } from '../quiz-progress/quiz-progress.component';
import { TopicsScore } from '../topic-wise-score/topics-score.component';
//import { EChartsCoreOption } from 'echarts/core';
//import { NgxEchartsDirective, NGX_ECHARTS_CONFIG } from 'ngx-echarts';

@Component({
  selector: 'app-quiz-result',
  templateUrl: './quiz-result.component.html',
  styleUrl: './quiz-result.component.scss',
  imports: [
    MatCardModule,
    MatProgressBarModule,
    NgScrollbar,
    NgTemplateOutlet,
    //NgxEchartsDirective
    TopicsScore,
    QuizProgressComponent
  ],
  // providers: [
  //   {
  //     provide: NGX_ECHARTS_CONFIG,
  //     useValue: {
  //       echarts: () => import('echarts'),
  //     },
  //   },
  // ] 
})
export class QuizResultComponent {
  @Input() result: QuizResult;
  //should be a part of the quizResult
  topicWiseScore = [
    {
      label: 'HTML',
      percentage: 76,
      class: 'bg-green',
      labelClass: 'bg-green text-white',
    },
    {
      label: 'CSS',
      percentage: 67,
      class: 'bg-red',
      labelClass: 'bg-red text-white',
    },
    {
      label: 'JavaScript',
      percentage: 78,
      class: 'bg-indigo',
      labelClass: 'bg-indigo text-white',
    },
    {
      label: 'Java',
      percentage: 87,
      class: 'bg-orange',
      labelClass: 'bg-orange text-white',
    },
    {
      label: 'Spring Boot',
      percentage: 91,
      class: 'bg-dark',
      labelClass: 'bg-dark text-white',
    },
  ];

  constructor(){
    console.log("QuizResult Dumb Comp", this.result);
  }
  /* Pie Chart 
pie_chart: EChartsCoreOption = {
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b} : {c} ({d}%)',
  },
  legend: {
    data: ['Data 1', 'Data 2', 'Data 3', 'Data 4', 'Data 5'],
    textStyle: {
      color: '#9aa0ac',
      padding: [0, 5, 0, 5],
    },
  },

  series: [
    {
      name: 'Chart Data',
      type: 'pie',
      radius: '55%',
      center: ['50%', '48%'],
      data: [
        {
          value: 335,
          name: 'Data 1',
        },
        {
          value: 310,
          name: 'Data 2',
        },
        {
          value: 234,
          name: 'Data 3',
        },
        {
          value: 135,
          name: 'Data 4',
        },
        {
          value: 548,
          name: 'Data 5',
        },
      ],
    },
  ],
  color: ['#575B7A', '#DE725C', '#DFC126', '#72BE81', '#50A5D8'],
};
*/
  getStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const halfStars = rating % 1 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStars;

    return [
      ...Array(fullStars).fill('star'),
      ...Array(halfStars).fill('star_half'),
      ...Array(emptyStars).fill('star_border'),
    ];
  }
}
