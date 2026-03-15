import { Component, Input } from '@angular/core';
import { CertificateModel } from './certificate.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-certificate',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    MatProgressSpinnerModule,
    MatButtonModule,
    //AsyncPipe
  ],
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss'],
})
export class CertificateComponent {
  @Input() model!: CertificateModel;
}
