import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TopicService } from '../../topics.service';

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
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatDialogClose,
    ]
})
export class TopicDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<TopicDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public topicService: TopicService
  ) {}
  confirmDelete(): void {
    this.topicService.deleteTopic(this.data.id).subscribe({
      next: (response) => {
        console.log("TopicManager delete response received", response);
        this.dialogRef.close(response); // Close with the response data
        // Handle successful deletion, e.g., refresh the table or show a notification
      },
      error: (error) => {
        console.error('Delete Error:', error);
        // Handle the error appropriately
      },
    });
  }
}
