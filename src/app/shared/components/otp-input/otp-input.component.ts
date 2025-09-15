import {
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'app-otp-input',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtpInputComponent),
      multi: true,
    },
  ],
  templateUrl: './otp-input.component.html',
  styleUrls: ['./otp-input.component.scss'],
})
export class OtpInputComponent implements ControlValueAccessor {
  @ViewChild('nativeInput', { static: true }) nativeInput!: ElementRef<HTMLInputElement>;
  @Output() otpComplete = new EventEmitter<string>(); // emits when 6 digits entered

  digits = Array.from({ length: 6 });
  value = '';          // current OTP string (0..6 digits)
  isFocused = false;
  disabled = false;

  // ControlValueAccessor callbacks
  private onChange: (v: string) => void = () => { };
  private onTouched: () => void = () => { };

  // --- CVA interface ---
  writeValue(v: string | null): void {
    this.value = (v ?? '').toString().slice(0, 6);
    // keep caret at the end if focused
    setTimeout(() => this.setCaretToEnd(), 0);
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  onNativeInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value || '';
    // numeric only, max 6 digits
    const cleaned = raw.replace(/\D/g, '').slice(0, 6);
    if (cleaned !== this.value) {
      this.value = cleaned;
      this.onChange(this.value);
    }
    // keep caret at end
    this.setCaretToEnd();

    // emit complete event when 6 digits entered
    if (this.value.length === 6) {
      this.otpComplete.emit(this.value);
      // optionally blur so user sees final state
      // this.nativeInput.nativeElement.blur();
    }
  }

  onNativeKeyDown(e: KeyboardEvent) {
    // allow navigation keys, backspace, delete
    if (e.key === 'Backspace' || e.key === 'Delete' || e.key.startsWith('Arrow')) {
      return;
    }
    // only allow digits (prevent letters, symbols)
    if (!/^[0-9]$/.test(e.key) && e.key.length === 1) {
      e.preventDefault();
    }
    // if already 6 digits, prevent typing more
    if (this.value.length >= 6 && /^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  }

  onNativeFocus() {
    console.log("OTPInput onNativeFocus");
    this.isFocused = true;
  }
  onNativeBlur() {
    this.isFocused = false;
    this.onTouched();
  }

  // helpers
  private setCaretToEnd() {
    try {
      const el = this.nativeInput.nativeElement;
      el.setSelectionRange(this.value.length, this.value.length);
    } catch {
      /* ignore in unsupported browsers */
    }
  }

  // template helper: is this slot active (show focused underline)
  slotIsActive(index: number) {
    if (!this.isFocused) return false;
    // if value length === index then that slot is the "next" active slot
    // when OTP full (6) we don't show an active slot
    if (this.value.length === 6) return false;
    return this.value.length === index;
  }

  onNativePaste(event: ClipboardEvent) {
    console.log("OTPInput onNativePaste");
    const pasted = event.clipboardData?.getData('text') ?? '';
    const digits = pasted.replace(/\D/g, '').slice(0, 6);
    console.log("OTPInput onNativePaste", digits);
    if (digits) {
      this.value = digits;
      this.onChange(this.value);
      this.setCaretToEnd();

      if (this.value.length === 6) {
        this.otpComplete.emit(this.value);
      }
    }
    event.preventDefault(); // stop raw paste
  }

  focusInput() {
    this.nativeInput.nativeElement.focus();
  }
}