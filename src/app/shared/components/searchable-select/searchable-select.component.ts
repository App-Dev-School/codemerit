import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SearchableSelectOption {
  id: number | string;
  label: string;
  group?: string;
}

interface OptionGroup {
  group: string | null;
  options: SearchableSelectOption[];
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-select.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SearchableSelectComponent),
    multi: true,
  }],
})
export class SearchableSelectComponent implements ControlValueAccessor {
  @Input() options: SearchableSelectOption[] = [];
  @Input() multiple = false;
  @Input() placeholder = 'Select…';
  @Input() searchPlaceholder = 'Search…';
  @Input() emptyText = 'No options available';
  @Input() loading = false;

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  isOpen = false;
  search = '';
  value: number | string | (number | string)[] | null = null;
  disabled = false;

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  writeValue(value: unknown): void {
    this.value = this.multiple
      ? (Array.isArray(value) ? value as (number | string)[] : [])
      : (value as number | string | null) ?? null;
  }

  registerOnChange(fn: (value: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  toggle(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.search = '';
      setTimeout(() => this.searchInputRef?.nativeElement.focus(), 0);
    } else {
      this.onTouched();
    }
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.onTouched();
  }

  get filteredOptions(): SearchableSelectOption[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.options;
    return this.options.filter(o => o.label.toLowerCase().includes(q));
  }

  // Preserves the order groups first appear in `options` — callers that pre-sort
  // (e.g. pushing an "Ungrouped" bucket to the end) don't need to sort again here.
  get groupedOptions(): OptionGroup[] {
    const filtered = this.filteredOptions;
    if (!filtered.some(o => o.group)) {
      return [{ group: null, options: filtered }];
    }
    const order: string[] = [];
    const map = new Map<string, SearchableSelectOption[]>();
    for (const o of filtered) {
      const key = o.group || '';
      if (!map.has(key)) { map.set(key, []); order.push(key); }
      map.get(key)!.push(o);
    }
    return order.map(group => ({ group, options: map.get(group)! }));
  }

  isSelected(id: number | string): boolean {
    return this.multiple
      ? (this.value as (number | string)[] ?? []).includes(id)
      : this.value === id;
  }

  selectOption(option: SearchableSelectOption): void {
    if (this.multiple) {
      const current = Array.isArray(this.value) ? [...this.value] : [];
      const idx = current.indexOf(option.id);
      if (idx >= 0) current.splice(idx, 1);
      else current.push(option.id);
      this.value = current;
      this.onChange(this.value);
    } else {
      this.value = option.id;
      this.onChange(this.value);
      this.close();
    }
  }

  get triggerLabel(): string {
    if (this.multiple) {
      const ids = (this.value as (number | string)[]) ?? [];
      if (ids.length === 0) return this.placeholder;
      if (ids.length === 1) {
        return this.options.find(o => o.id === ids[0])?.label ?? `1 selected`;
      }
      return `${ids.length} selected`;
    }
    if (this.value == null || this.value === '') return this.placeholder;
    return this.options.find(o => o.id === this.value)?.label ?? this.placeholder;
  }

  get hasValue(): boolean {
    return this.multiple
      ? ((this.value as (number | string)[]) ?? []).length > 0
      : this.value != null && this.value !== '';
  }
}
