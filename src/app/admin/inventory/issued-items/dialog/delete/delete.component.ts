import { IssuedItems } from './../../issued-items.model';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { IssuedItemsService } from '../../issued-items.service';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  id: number;
  category: string;
  issue_to: string;
  status: string;
}

@Component({
    selector: 'app-issued-items-delete',
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
export class IssuedItemsDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<IssuedItemsDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public issuedItemsService: IssuedItemsService
  ) {}
  confirmDelete(): void {
    this.issuedItemsService.deleteIssuedItems(this.data.id).subscribe({
      next: (response) => {
        // console.log('Delete Response:', response);
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
