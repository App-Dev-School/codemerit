import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Editor } from '@tiptap/core';
import { Code } from '@tiptap/extension-code';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';

@Component({
  selector: 'app-create-lesson',
  templateUrl: './create-lesson.component.html',
  styleUrls: ['./create-lesson.component.scss'],
    standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TiptapEditorDirective
  ]
})
export class CreateLessonComponent implements OnInit, OnDestroy {
  lessonForm: FormGroup;
  submitted = false;
  editor: Editor;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.lessonForm = this.fb.group({
      title: ['Lesson Title', [Validators.required]],
      subject: ['Subject', [Validators.required]],
      topic: ['Topic', [Validators.required]],
      description: ['']
    });
    this.editor = new Editor({
      extensions: [StarterKit, Code],
      content: '',
      onUpdate: ({ editor }) => {
        this.lessonForm.get('description')?.setValue(editor.getHTML(), { emitEvent: false });
      }
    });
  }

  submit(): void {
    this.submitted = true;
    if (this.lessonForm.valid) {
      const payload = {
        ...this.lessonForm.value
      };
      console.log(payload);
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }
}
