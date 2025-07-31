import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
@Component({
    selector: 'app-list-users',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    imports: [
        BreadcrumbComponent,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        RouterLink,
    ]
})
export class ListUserComponent {
  constructor() {
    // constructor code
  }
}
