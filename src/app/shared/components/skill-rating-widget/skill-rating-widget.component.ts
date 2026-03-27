import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { SkillRating } from '@core/models/skill-rating';

@Component({
  selector: 'app-skill-rating-widget',
  imports: [
    MatIcon
  ],
  templateUrl: './skill-rating-widget.component.html',
  styleUrl: './skill-rating-widget.component.scss',
})
export class SkillRatingWidgetComponent {
  readonly skillRatings = input<SkillRating[]>([]);
}
