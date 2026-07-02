import { Component, HostListener, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-table-show-hide-column',
  imports: [FormsModule],
  templateUrl: './table-show-hide-column.component.html',
  styleUrl: './table-show-hide-column.component.scss',
})
export class TableShowHideColumnComponent {
  readonly columnDefinitions = input<any[]>([]);
  showDropdown = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('app-table-show-hide-column')) {
      this.showDropdown = false;
    }
  }

  trackBy(index: number, item: any) {
    return item.def;
  }
}
