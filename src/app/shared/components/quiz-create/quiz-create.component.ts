// chart-card4.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@core';
import { QuizCreateModel } from '@core/models/dtos/GenerateQuizDto';
import { MasterService } from '@core/service/master.service';
import { NgScrollbar } from 'ngx-scrollbar';
import { QuizConfig, QuizService } from 'src/app/quiz/quiz.service';

@Component({
  selector: 'app-course-picker',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatOptionModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatButton,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
  ],
  templateUrl: './quiz-create.component.html',
  styleUrls: ['./quiz-create.component.scss']
})
export class QuizCreateComponent implements OnInit {
  requestConfirmed = false;
  loading = false;
  mode: 'dialog' | 'route' = 'route';
  userId?: string;
  error: string = '';
  generatedQuizCode = '';
  //animation effect variables
  messages = [
    'Finding Questions…',
    'Applying Configuration',
    'Generating Quiz…'
  ];
  levels = [
    {
      name: "Basic",
      value: 0
    },
    {
      name: "Intermediate",
      value: 1
    },
    {
      name: "Advanced",
      value: 2
    }
  ];

  currentMessage = this.messages[0];
  messageIndex = 0;
  finished = false;
  quizConfigForm!: UntypedFormGroup;

  constructor(private master: MasterService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private quizService: QuizService,
    @Optional() public dialogRef?: MatDialogRef<QuizCreateComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: any) {
    if (this.dialogRef) {
      this.mode = 'dialog';
      this.userId = data?.id;
      console.log("QuizCreate Data ", data);
    } else {
      this.mode = 'route';
      this.route.paramMap.subscribe(params => {
        this.userId = params.get('id') ?? undefined;
      });
    }
  }

  ngOnInit(): void {
    console.log("QuizCreate ngOnInit", this.data);
    this.requestConfirmed = false;
    const quizConfig = new QuizConfig();
    this.quizConfigForm = this.formBuilder.group({
      numQuestions: [quizConfig.numQuestions, [Validators.required, Validators.maxLength(2)]],
      level: [quizConfig.level],
      mode: [quizConfig.mode],
      showHint: [quizConfig.showHint ? '1' : '0'],
      showAnswers: [quizConfig.showAnswers ? '1' : '0'],
      enableNavigation: [quizConfig.enableNavigation ? '1' : '0'],
      enableAudio : [quizConfig.enableAudio ? '1' : '0'],
    });
  }

  onSubmit() {
    if (this.quizConfigForm.invalid) {
      //this.submitted = false;
      return;
    } else {
      this.quizService.setQuizConfig(this.quizConfigForm.value);
      this.requestConfirmed = true;
      this.startMessageCycle();
      this.generateQuiz(this.data.subject, this.data.topic);
    }
  }

  close() {
    this.dialogRef.close(null);
  }

  startMessageCycle() {
    const interval = setInterval(() => {
      this.messageIndex++;

      if (this.messageIndex < this.messages.length) {
        this.currentMessage = this.messages[this.messageIndex];
      } else {
        clearInterval(interval);
        this.finished = true;
        this.currentMessage = "Saving Your Quiz";
        this.onFinish();
      }
    }, 2000);
  }

  onFinish() {
    console.log('All tasks finished!');
    if(this.generatedQuizCode){
      setTimeout(() => {
        this.launchQuiz();
      }, 2000);
    }
  }

  /**** QUIZ GATEWAY ****/
  async generateQuiz(subject: number, topic: number) {
    console.log('QuizManager Invoked in SubjectDashboard:', subject, topic);
    const payload = new QuizCreateModel();
    payload.userId = this.authService.currentUserValue.id;
    payload.subjectIds = subject > 0 ? '' + subject : null;
    payload.topicIds = topic > 0 ? '' + topic : null;
    let quizTitle = '';
    if (subject > 0 || topic > 0) {
    } else {
      this.error = 'Invalid Quiz Request. Please try again.';
      return;
    }
    payload.title = quizTitle;
    console.log('QuizCreateGateway Payload:', payload);
    this.loading = true;
    this.quizService
      .addQuiz(payload)
      .subscribe({
        next: (response) => {
          if (response && response?.slug) {
            const slug = response?.slug;
            if (slug && slug !== '') {
              setTimeout(() => {
                this.generatedQuizCode = slug;
                //this.launchQuiz(this.generatedQuizCode);
                this.loading = false;
              }, 8000);
            }
          } else {
            //#Task: handle error well. Determine eligibilty etc
            //this.snackService.display('snackbar-dark', 'We could not generate a Quiz at this moment. Please try again later.', 'bottom', 'center');
          }
        },
        error: (error) => {
          //this.generatingQuiz = false;
          this.loading = false;
          this.error = 'Error generating Quiz. Please try again.';
          console.error('QuizManager CreateAPI Error:', error);
        },
      });
  }

  launchQuiz() {
    //this.router.navigate(['quiz/take', slug]);
    this.dialogRef.close(this.generatedQuizCode);
  }
}
