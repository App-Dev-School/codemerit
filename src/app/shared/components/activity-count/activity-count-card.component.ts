import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-activity-count-card',
    imports: [MatCardModule],
    templateUrl: './activity-count-card.component.html',
    styleUrl: './activity-count-card.component.scss'
})
export class ActivityCountCardComponent {
  @Input() lessonsCompleted: number = 0;
  @Input() questionAttempted: number = 0;
  @Input() challengesSolved: number = 0;
  @Input() badgesEarned: number = 0;
}
