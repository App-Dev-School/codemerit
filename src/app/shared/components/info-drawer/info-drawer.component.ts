import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-info-drawer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-drawer.component.html',
  styleUrl: './info-drawer.component.scss',
})
export class InfoDrawerComponent {
  @Input() open = false;
  @Input() eyebrow = 'Guide';
  @Input() title = '';
  // Tailwind gradient classes for the panel header — callers pick a color that
  // fits their page instead of this component hardcoding one brand look.
  @Input() headerGradientClass = 'bg-gradient-to-r from-cm-brand to-violet-600';
  @Output() closed = new EventEmitter<void>();

  onClose(): void {
    this.closed.emit();
  }
}
