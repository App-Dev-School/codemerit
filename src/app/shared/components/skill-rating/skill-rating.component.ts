import {
  Component,
  Input,
  Output,
  forwardRef,
  EventEmitter
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-skill-rating',
  templateUrl: './skill-rating.component.html',
  styleUrls: ['./skill-rating.component.scss'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SkillRatingComponent),
      multi: true
    }
  ]
})
export class SkillRatingComponent implements ControlValueAccessor {
  @Input() maxStars: number = 5; //test with 5 for warnings
  @Input() readOnly: boolean = false;

  @Output() ratingChange = new EventEmitter<number>();

  stars: boolean[] = [];
  rating: number = 0;
  hovered = 0;

  private onChange = (rating: number) => {};
  private onTouched = () => {};

  ngOnInit() {
    this.stars = Array(this.maxStars).fill(false);
  }

  setRating(rating: number): void {
    if (this.readOnly) return;

    this.rating = rating;
    this.onChange(rating);
    this.ratingChange.emit(rating);
  }

  // ControlValueAccessor interface
  writeValue(value: number): void {
    this.rating = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}