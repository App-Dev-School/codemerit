import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackbarService } from '@core/service/snackbar.service';
import { Editor } from '@tiptap/core';
import Code from '@tiptap/extension-code';
import StarterKit from '@tiptap/starter-kit';
import { TiptapEditorDirective } from 'ngx-tiptap';
import { Subscription } from 'rxjs';
import { LessonService } from 'src/app/learn/lesson.service';
import { QuizService } from 'src/app/quiz/quiz.service';

interface Section {
  id: string;
  editor: Editor;
}

@Component({
  selector: 'app-create-lesson',
  templateUrl: './create-lesson.component.html',
  styleUrls: ['./create-lesson.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TiptapEditorDirective],
})
export class CreateLessonComponent implements OnInit, OnDestroy {
  lessonForm!: FormGroup;
  submitted = false;
  sections: Section[] = [];
  subjects: any[] = [];
  topics: any[] = [];
  filteredTopics: any[] = [];

  readonly difficultyOptions = [
    { label: 'Easy', value: 1 },
    { label: 'Intermediate', value: 2 },
    { label: 'Advanced', value: 3 },
  ];

  private sectionCounter = 0;
  private subjectSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private lessonService: LessonService,
    private snackService: SnackbarService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      topic: ['', [Validators.required]],
      level: [1, [Validators.required]],
      descriptions: this.fb.array([this.createDescription()]),
    });

    this.sections = [this.createSection()];

    this.subjectSub = this.lessonForm.get('subject')?.valueChanges.subscribe((id) => {
      this.filteredTopics = this.topics.filter(
        (t: any) => Number(t.subjectId ?? t.subject?.id) === Number(id),
      );
      this.lessonForm.get('topic')?.setValue('');
    });

    this.loadSubjectsTopics();
  }

  get descriptions(): FormArray {
    return this.lessonForm.get('descriptions') as FormArray;
  }

  addDescription(): void {
    this.descriptions.push(this.createDescription());
    this.sections.push(this.createSection());
  }

  removeDescription(index: number): void {
    if (this.sections.length > 1) {
      this.sections[index].editor.destroy();
      this.sections.splice(index, 1);
      this.descriptions.removeAt(index);
    }
  }

  isEditorEmpty(index: number): boolean {
    return this.sections[index]?.editor?.isEmpty ?? true;
  }

  onShellClick(index: number, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('[contenteditable]')) {
      this.sections[index]?.editor?.commands.focus('end');
    }
  }

  setLevel(value: number): void {
    this.lessonForm.get('level')?.setValue(value);
  }

  levelClass(value: number): string {
    const active = this.lessonForm.get('level')?.value === value;
    const base =
      'flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all active:scale-95';
    const map: Record<number, { on: string; off: string }> = {
      1: {
        on: 'bg-emerald-500 border-emerald-500 text-white',
        off: 'border-cm-border text-cm-text-muted hover:border-emerald-400 hover:text-emerald-500',
      },
      2: {
        on: 'bg-amber-500 border-amber-500 text-white',
        off: 'border-cm-border text-cm-text-muted hover:border-amber-400 hover:text-amber-500',
      },
      3: {
        on: 'bg-rose-500 border-rose-500 text-white',
        off: 'border-cm-border text-cm-text-muted hover:border-rose-400 hover:text-rose-500',
      },
    };
    return `${base} ${(map[value] ?? map[1])[active ? 'on' : 'off']}`;
  }

  submit(): void {
    this.submitted = true;
    if (this.lessonForm.valid) {
      const { title, subject, topic, level, descriptions } = this.lessonForm.value;
      this.lessonService.createLesson({ title, subject, topic, level, descriptions }).subscribe({
        next: (res: any) => {
          this.snackService.display(
            'snackbar-dark',
            res?.message ?? 'Lesson created successfully',
            'bottom',
            'center',
          );
          this.resetForm();
        },
        error: (err: any) => {
          this.snackService.display(
            'snackbar-dark',
            err?.error?.message ?? 'Failed to create lesson',
            'bottom',
            'center',
          );
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/lms/lessons/list']);
  }

  private createSection(): Section {
    return { id: `section-${++this.sectionCounter}`, editor: this.createEditor() };
  }

  private createEditor(): Editor {
    let instance: Editor;
    instance = new Editor({
      extensions: [StarterKit, Code],
      content: '',
      onUpdate: ({ editor }) => {
        // find by reference — stable even after splices
        const idx = this.sections.findIndex((s) => s.editor === instance);
        if (idx !== -1) {
          this.descriptions.at(idx)?.setValue(editor.getHTML(), { emitEvent: false });
        }
      },
    });
    return instance;
  }

  private createDescription() {
    return this.fb.control('', [Validators.required]);
  }

  private loadSubjectsTopics(): void {
    this.quizService.getSubjectsTopics().subscribe({
      next: (res: any) => {
        this.subjects = res?.data?.subjects || [];
        this.topics = res?.data?.topics || [];
        this.filteredTopics = [...this.topics];
      },
      error: (err) => console.error('Failed to load subjects/topics', err),
    });
  }

  private resetForm(): void {
    this.submitted = false;
    this.sections.forEach((s) => s.editor.destroy());
    this.lessonForm.reset({ title: '', subject: '', topic: '', level: 1 });
    this.descriptions.clear();
    this.descriptions.push(this.createDescription());
    this.sections = [this.createSection()];
  }

  ngOnDestroy(): void {
    this.sections.forEach((s) => s.editor.destroy());
    this.subjectSub?.unsubscribe();
  }
}
