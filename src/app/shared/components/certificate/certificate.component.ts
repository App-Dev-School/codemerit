import { Component, Input } from '@angular/core';
import { CertificateModel } from './certificate.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe, NgClass, NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    NgSwitchCase,
    NgSwitch,
    NgClass,
    //AsyncPipe
  ]
})
export class CertificateComponent {
  @Input() preview: boolean = false;
  @Input() templateId: string = 'default';
  @Input() model!: CertificateModel;
}
