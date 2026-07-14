import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MyCertificate } from '@core/models/gamification.model';
import { bounceInAnimation } from '@shared/animations';

@Component({
  selector: 'app-certificate-ribbon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-ribbon.component.html',
  styleUrl: './certificate-ribbon.component.scss',
  animations: [bounceInAnimation],
})
export class CertificateRibbonComponent {
  @Input() certificate!: MyCertificate;
  @Input() trackTitle = '';
  @Output() dismiss = new EventEmitter<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }
}
