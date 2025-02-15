import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogContent,
  MatDialogClose,
} from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { ItemStockListService } from '../../item-stock-list.service';
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ItemStockList } from '../../item-stock-list.model';
import { formatDate } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

export interface DialogData {
  id: number;
  action: string;
  itemStockList: ItemStockList;
}

@Component({
    selector: 'app-item-stock-list-form',
    templateUrl: './form-dialog.component.html',
    styleUrls: ['./form-dialog.component.scss'],
    imports: [
        MatButtonModule,
        MatIconModule,
        MatDialogContent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatDialogClose,
    ]
})
export class ItemStockListFormComponent {
  action: string;
  dialogTitle: string;
  itemStockListForm: UntypedFormGroup;
  itemStockList: ItemStockList;

  constructor(
    public dialogRef: MatDialogRef<ItemStockListFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public itemStockListService: ItemStockListService,
    private fb: UntypedFormBuilder
  ) {
    this.action = data.action;
    this.dialogTitle =
      this.action === 'edit'
        ? `Edit Item: ${data.itemStockList.i_name}`
        : 'New Item Stock List';
    this.itemStockList =
      this.action === 'edit'
        ? data.itemStockList
        : new ItemStockList({} as ItemStockList);
    this.itemStockListForm = this.createItemStockListForm();
  }

  // Create form group for item stock list details
  createItemStockListForm(): UntypedFormGroup {
    return this.fb.group({
      id: [this.itemStockList.id],
      i_name: [this.itemStockList.i_name, [Validators.required]],
      category: [this.itemStockList.category],
      qty: [this.itemStockList.qty, [Validators.required]],
      date: [
        formatDate(this.itemStockList.date, 'yyyy-MM-dd', 'en'),
        [Validators.required],
      ],
      price: [this.itemStockList.price],
      details: [this.itemStockList.details],
    });
  }

  // Dynamic error message retrieval
  getErrorMessage(controlName: string): string {
    const control = this.itemStockListForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    return ''; // Return empty if no errors
  }

  // Submit form data
  submit() {
    if (this.itemStockListForm.valid) {
      const itemData = this.itemStockListForm.getRawValue();
      if (this.action === 'edit') {
        this.itemStockListService.updateItemStockList(itemData).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Update Error:', error);
            // Optionally show an error message to the user
          },
        });
      } else {
        this.itemStockListService.addItemStockList(itemData).subscribe({
          next: (response) => {
            this.dialogRef.close(response);
          },
          error: (error) => {
            console.error('Add Error:', error);
            // Optionally show an error message to the user
          },
        });
      }
    }
  }

  // Close dialog without action
  onNoClick(): void {
    this.dialogRef.close();
  }
}
