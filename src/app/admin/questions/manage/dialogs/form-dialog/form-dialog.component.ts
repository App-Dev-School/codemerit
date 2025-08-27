import { JsonPipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MasterService } from '@core/service/master.service';
import { QuestionItem } from '../../question-item.model';
import { QuestionService } from '../../questions.service';
import { QuizQuestionComponent } from '@shared/components/quiz-question/quiz-question.component';

export interface DialogData {
  id: number;
  action: string;
  data: any;
}

@Component({
  selector: 'app-question-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss'],
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    FormsModule,
    MatDialogClose,
    MatCheckboxModule,
    QuizQuestionComponent
  ]
})
export class QuestionFormComponent {
  action: string;
  dialogTitle: string;
  questionItem: any;
  constructor(
    public dialogRef: MatDialogRef<QuestionFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public questionService: QuestionService
  ) {
    this.questionItem = data.data;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
