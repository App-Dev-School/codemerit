import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizQuestion } from '@core/models/quiz-question';
import { User } from '@core/models/user';
import { AuthService } from '@core/service/auth.service';
import { QuizResultComponent } from '@shared/components/quiz-result/quiz-result.component';
import { ShareBottomSheetComponent } from '@shared/components/share-bottom-sheet/share-bottom-sheet.component';
import { environment } from 'src/environments/environment';
import { QuizService } from '../quiz.service';
interface Quiz {
  title: string;
  subject_icon: string;
  questions: QuizQuestion[];
}
@Component({
  selector: 'app-view-result',
  templateUrl: './view-result.component.html',
  styleUrls: ['./view-result.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    QuizResultComponent
  ]
})
export class ViewResultComponent implements OnInit {
  //may not be required
  quiz!: Quiz;
  loading = true;
  loadingText = 'Loading Result';
  quizResultCode = '';
  quizResult: any;
  userData: User;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private quizService: QuizService,
    private _bottomSheet: MatBottomSheet) {
    this.userData = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    this.takeRouteParams();
  }

  takeRouteParams() {
    const course = this.route.snapshot.paramMap.get('qcode');
    console.log("QuizResult ParamMap qcode", course);
    this.route.paramMap.subscribe(params => {
      console.log("QuizResult @RouteParam change detected =>", params.get("qcode"));
      if (params.get("qcode")) {
        this.quizResultCode = params.get("qcode");
        if (this.quizResultCode) {
          this.loadQuizResult();
        }
      } else {
        //redirect to error page
      }
    });
  }

  private loadQuizResult(): void {
    this.loading = true;
    this.quizService.getQuizResult(this.quizResultCode)
      .subscribe(data => {
        console.log("loadQuizResult API #####", data);
        this.quizResult = data;
        this.loadingText = '';
        this.loading = false;
      });
  }

  onShareResult(): void {
    console.log('Quiz Result Share!');
    this.openBottomSheet();
  }

  openBottomSheet(): void {
    this._bottomSheet.open(ShareBottomSheetComponent, {
    data: {
      elementId: 'quizResultCard',
      title: 'My Quiz Result',
      url: environment.appUrl+''+this.router.url,
      text: `I just scored ${this.quizResult.score}% on the quiz! 🎉`
    }
  });
  }

  onContinue(): void {
    //let designationSlug = '';
    //if subject quiz go to subject dashboard
    //this.router.navigate(['/dashboard/start', designationSlug]);
    //.subjects[0].slug
    try {
      if (this.quizResult && this.quizResult.subjects) {
        const firstSubjectSlug = this.quizResult.subjects[0]?.slug;
        this.router.navigate(['/dashboard/learn', firstSubjectSlug]);
      }
    } catch (error) {
      this.router.navigate(['/app/select-subject']);
    }
  }
  //add methods for sharing options, invite etc.
}