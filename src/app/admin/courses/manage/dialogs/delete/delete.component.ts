import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { CourseService } from '../../courses.service';

export interface DialogData {
  id: number;
  name: string;
  shortDesc: string;
}

@Component({
    selector: 'app-topic-delete',
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss'],
    imports: [
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatDialogClose,
    ]
})
export class CourseDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<CourseDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public topicService: CourseService
  ) {}
  confirmDelete(): void {
    this.topicService.deleteTopic(this.data.id).subscribe({
      next: (response) => {
        console.log("TopicManager delete response received", response);
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Delete Error:', error);
        // Handle the error appropriately
        this.dialogRef.close(null);
      },
    });
  }
}
