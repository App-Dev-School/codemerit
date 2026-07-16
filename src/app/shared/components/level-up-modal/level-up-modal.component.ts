import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LevelInfo } from '@core/models/gamification.model';
import { bounceInAnimation } from '@shared/animations';

@Component({
  selector: 'app-level-up-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './level-up-modal.component.html',
  styleUrl: './level-up-modal.component.scss',
  animations: [bounceInAnimation],
})
export class LevelUpModalComponent {
  @Input() level!: LevelInfo;
  @Output() dismiss = new EventEmitter<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }
}
