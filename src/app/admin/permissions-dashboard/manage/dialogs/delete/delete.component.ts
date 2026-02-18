import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from '@angular/material/dialog';
import { permissionsService } from '../../permissions.service';


export interface DialogData {
  id: number;
  name: string;
  shortDesc: string;
}

@Component({
  selector: 'app-permissions-delete',
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss'],
    imports: [
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatDialogClose,
    ]
})
export class permissionsDeleteComponent {
  constructor(
    public dialogRef: MatDialogRef<permissionsDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public permissionsService: permissionsService
  ) {}
  confirmDelete(): void {
    this.permissionsService.deletepermissions(this.data.id).subscribe({
      next: (response) => {
        console.log("PermissionsManager delete response received", response);
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
