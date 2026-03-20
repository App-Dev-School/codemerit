import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { NgScrollbar } from 'ngx-scrollbar';

interface QuizSettings {
  numQuestions: number;
  ordering: string;
  mode: string;
  showHint: boolean;
  showAnswers: boolean;
  enableNavigation: boolean;
  enableAudio: boolean;
  enableTimer: boolean;
}

@Component({
  selector: 'app-quiz-settings-form',
  templateUrl: './quiz-settings-form.component.html',
  styleUrls: ['./quiz-settings-form.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    NgScrollbar
  ]
})
export class QuizSettingsFormComponent implements OnInit {
  @Input() initialSettings: Partial<QuizSettings> = {};
  @Output() settingsChanged = new EventEmitter<QuizSettings>();
  @Output() formSubmitted = new EventEmitter<QuizSettings>();

  settingsForm!: FormGroup;

  modeOptions = [
    { label: 'Default', value: 'Default' },
    { label: 'Interactive', value: 'Interactive' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    // Emit value on init if valid
    if (this.settingsForm && this.settingsForm.valid) {
      this.formSubmitted.emit(this.settingsForm.value);
    }
    // Emit value on every valid change
    this.settingsForm.valueChanges.subscribe(() => {
      if (this.settingsForm.valid) {
        this.formSubmitted.emit(this.settingsForm.value);
      }
    });
  }

  initializeForm(): void {
    this.settingsForm = this.fb.group({
      mode: [this.initialSettings.mode || 'Default', Validators.required],
      showHint: [this.initialSettings.showHint !== undefined ? this.initialSettings.showHint : true],
      showAnswers: [this.initialSettings.showAnswers !== undefined ? this.initialSettings.showAnswers : false],
      enableNavigation: [this.initialSettings.enableNavigation !== undefined ? this.initialSettings.enableNavigation : true],
      enableAudio: [this.initialSettings.enableAudio !== undefined ? this.initialSettings.enableAudio : false],
      enableTimer: [this.initialSettings.enableTimer !== undefined ? this.initialSettings.enableTimer : true]
    });

    // Emit settings changes on value change
    this.settingsForm.valueChanges.subscribe(() => {
      if (this.settingsForm.valid) {
        this.settingsChanged.emit(this.settingsForm.value);
      }
    });
  }

  // Removed onSubmit logic; parent handles navigation and actions

  resetForm(): void {
    this.initializeForm();
  }

  getFormValue(): QuizSettings {
    return this.settingsForm.value;
  }
}
