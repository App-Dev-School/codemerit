import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'app-goal-path',
    imports: [MatProgressBarModule, NgClass],
    templateUrl: './goal-path.component.html',
    styleUrl: './goal-path.component.scss'
})
export class GoalPathComponent {
  topics = [
  { id:1, title: 'Introduction', progress: 100 },
  { id:2, title: 'HTML Basics', progress: 80 },
  { id:3, title: 'CSS Essentials', progress: 60 },
  { id:4, title: 'JavaScript Fundamentals', progress: 40 },
  { id:5, title: 'Angular Basics', progress: 20 },
  { id: 6, title: 'Bootstrap Integration', progress: 0 },
  { id:1, title: 'Introduction', progress: 100 },
  { id:2, title: 'HTML Basics', progress: 80 },
  { id:3, title: 'CSS Essentials', progress: 60 },
  { id:4, title: 'JavaScript Fundamentals', progress: 40 },
  { id:5, title: 'Angular Basics', progress: 20 },
  { id: 6, title: 'Bootstrap Integration', progress: 0 }
];
}
