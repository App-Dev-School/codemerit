import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-chart-subscribers',
    imports: [MatCardModule, MatIconModule],
    templateUrl: './chart-subscribers.component.html',
    styleUrl: './chart-subscribers.component.scss'
})
export class ChartSubscribersComponent {
  @Input() title: string = 'JavaScript';
  @Input() subtitle: string = '';

  constructor() {
  }

}
