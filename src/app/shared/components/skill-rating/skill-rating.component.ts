import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';

@Component({
  selector: 'app-skill-rating',
  standalone: true,
  templateUrl: './skill-rating.component.html',
  styleUrls: ['./skill-rating.component.scss'],
  imports: [CommonModule]
})
export class SkillRatingComponent {

  @Input({ required: true }) max = 10;

  private _rating = signal(0);
  private _hovered = signal(0);

  @Input()
  set rating(value: number) {
    this._rating.set(value);
  }

  get rating(): number {
    return this._rating();
  }

  @Output() ratingChange = new EventEmitter<number>();

  hover(r: number) {
    this._hovered.set(r);
  }

  leave() {
    this._hovered.set(0);
  }

  setRating(r: number) {
    this._rating.set(r);
    this.ratingChange.emit(r);
  }

  hovered = () => this._hovered();
}
