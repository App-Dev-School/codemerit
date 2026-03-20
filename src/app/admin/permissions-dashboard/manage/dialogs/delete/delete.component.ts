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
  selector: 'app-permissions-revoke',
    templateUrl: './delete.component.html',
    styleUrls: ['./delete.component.scss'],
    imports: [
        MatDialogContent,
        MatDialogActions,
        MatButtonModule,
        MatDialogClose,
    ]
})
export class permissionsrevokeComponent {
  constructor(
    public dialogRef: MatDialogRef<permissionsrevokeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public permissionsService: permissionsService
  ) {}
  confirmRevoke(): void {
    this.permissionsService.revokePermissions(this.data.id).subscribe({
      next: (response) => {
        console.log("PermissionsManager revoke response received", response);
        this.dialogRef.close(response);
      },
      error: (error) => {
        console.error('Revoke Error:', error);
        // Handle the error appropriately
        this.dialogRef.close(null);
      },
    });
  }
}
