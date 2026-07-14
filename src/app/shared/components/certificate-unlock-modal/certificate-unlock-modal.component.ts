import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EarnedCertificate } from '@core/models/gamification.model';
import { bounceInAnimation } from '@shared/animations';

@Component({
  selector: 'app-certificate-unlock-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './certificate-unlock-modal.component.html',
  styleUrl: './certificate-unlock-modal.component.scss',
  animations: [bounceInAnimation],
})
export class CertificateUnlockModalComponent {
  @Input() certificate!: EarnedCertificate;
  @Output() dismiss = new EventEmitter<void>();

  // Deliberately no backdrop-click handler — a certificate is the biggest
  // celebration moment there is, it only closes via the explicit CTA below.
  onDismiss(): void {
    this.dismiss.emit();
  }
}
