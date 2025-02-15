import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { FeatherIconsComponent } from '../feather-icons/feather-icons.component';

export interface SubscriptionInfo {
  image: string;
  name: string;
  status: string;
  planClass: string;
}

@Component({
  selector: 'app-subscription-table-widget',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    CommonModule,
    FeatherIconsComponent,
  ],
  templateUrl: './subscription-table-widget.component.html',
  styleUrl: './subscription-table-widget.component.scss',
})
export class SubscriptionTableWidgetComponent {
  displayedColumns: string[] = ['name', 'status', 'actions'];
  datasource: SubscriptionInfo[] = [
    {
      image: 'assets/images/users/user.jpg',
      name: 'Introduction to Angular',
      status: 'Completed',
      planClass: 'col-orange',
    },
    {
      image: 'assets/images/users/user.jpg',
      name: 'Angular CLI',
      status: 'Viewed',
      planClass: 'col-red',
    },
    {
      image: 'assets/images/users/user.jpg',
      name: 'Angular Project Structure',
      status: 'Not Started',
      planClass: 'col-orange',
    },
    {
      image: 'assets/images/users/user.jpg',
      name: 'Build Process',
      status: 'Not Started',
      planClass: 'col-red',
    },
    {
      image: 'assets/images/users/user.jpg',
      name: 'Component Basics',
      status: 'Not Started',
      planClass: 'col-orange',
    },
  ];
}
