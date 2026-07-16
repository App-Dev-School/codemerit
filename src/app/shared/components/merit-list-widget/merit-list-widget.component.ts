
import { Component, Input } from '@angular/core';

interface MeritList {
  userId: number;
  name: string;
  designationName?: string;
  username: string;
  image?: string;
  rank: number;
  masteryCount: number;
}

@Component({
    selector: 'app-merit-list-widget',
    imports: [],
    templateUrl: './merit-list-widget.component.html',
    styleUrl: './merit-list-widget.component.scss'
})
export class MeritListWidgetComponent {
  @Input() meritList: MeritList[] = [];
}
