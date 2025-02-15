import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-subject-card-widget',
    imports: [],
    templateUrl: './subject-card-widget.component.html',
    styleUrl: './subject-card-widget.component.scss'
})
export class SubjectCardWidgetComponent {
  @Input() topicsCount: number = 0;
  @Input() questionsCount: number = 0;
  @Input() lessonCount: number = 0;
  @Input() progressPercentage: number = 0;
  @Input() progressColor: string = 'orange';
  @Input() title: string = 'Subject Title';
}
