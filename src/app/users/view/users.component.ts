import { Component } from '@angular/core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
@Component({
    selector: 'app-user',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    imports: [BreadcrumbComponent]
})
export default class UserComponent {
  constructor() {
    // constructor code
  }
}
