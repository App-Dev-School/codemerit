import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConstants } from '@config/AuthConstants';
import { AuthService } from '@core';
import { CreateQuizResponse, QuizCreateModel, QuizEntity, SubmitQuizResponse } from '@core/models/dtos/GenerateQuizDto';
import { Quiz, QuizResult } from '@core/models/quiz';
import { QuizQuestion } from '@core/models/quiz-question';
import { HttpService } from '@core/service/http.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private readonly API_URL = 'assets/data/quizzes/quiz-angular.json';
  dataChange: BehaviorSubject<Quiz[]> = new BehaviorSubject<Quiz[]>([]);
  quizConfig: QuizConfig;
  currentQuiz: QuizEntity;

  constructor(private authService: AuthService,
    private httpService: HttpService, private http: HttpClient) { }

  getQuiz(slug: string): Observable<QuizEntity> {
    //return this.http.get<QuizEntity>('./assets/data/quizzes/finaltest.json').pipe(delay(3000));
    //return of(this.getCurrentQuiz());

    let api_key = '';
    if (this.authService.currentUser && this.authService.currentUser) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/quiz/fetch/' + slug;
    return this.httpService.get(url, api_key).pipe(
      map((response: any) => {
        return response.data;
      })
    );
  }

  getQuizResult(resultCode: string): Observable<QuizResult> {
    let api_key = '';
    if (this.authService.currentUser && this.authService.currentUser) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/quiz/result/' + resultCode;
    return this.httpService.get(url, api_key).pipe(
      map((response: any) => {
        return response.data;
      })
    );
    //return this.http.get<QuizResult>('./assets/data/quizzes/quiz-result-mock.json').pipe(delay(8000));
  }

  getAllQuiz(): Observable<Quiz[]> {
    let api_key = '';
    if (this.authService.currentUser && this.authService.currentUser) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/quiz/all';
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " via Token " + api_key);
    }
    return this.httpService.get(url, api_key).pipe(
      map((response: any) => {
        return response.data;
      })
    );
  }

  addQuiz(item: QuizCreateModel): Observable<QuizEntity> {
    let api_key = '';
    if (this.authService.currentUser && this.authService.currentUser) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/quiz/create';
    return this.httpService.postData(url, item, api_key).pipe(
      map((response: CreateQuizResponse) => {
        this.currentQuiz = response.data;
        this.setCurrentQuiz(this.currentQuiz);
        return response.data; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  submitQuizAAAA(item: QuizResult): Observable<QuizResult> {
    let api_key = '';
    if (this.authService.currentUser && this.authService.currentUser) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/quiz/submit';
    console.log('QuizPlayer Submitted Quiz => ', item);
    return this.httpService.postData(url, item, api_key).pipe(
      map((response: SubmitQuizResponse) => {
        //console.log("QuizPlayer SubmitQuiz API response", response);
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  submitQuiz(item: QuizResult): Observable<QuizResult> {
    let api_key = '';
    if (this.authService.currentUser && this.authService.currentUser) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/quiz/submit';
    console.log('QuizPlayer Submitted Quiz => ', item);
    return this.httpService.postData<QuizResult>(url, item, api_key);
  }

  updateQuiz(topic: any, topicId: any): Observable<any> {
    let api_key = '';
    if (this.authService.currentUser && this.authService.currentUser) {
      api_key = this.authService.currentUserValue.token;
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': api_key
      })
    };
    const url = 'apis/quiz/update/' + topicId;
    if (AuthConstants.DEV_MODE) {
      console.log("Hiting " + url + " with => " + JSON.stringify(topic) + " via Token " + api_key);
    }
    return this.httpService.put(url, topic, api_key).pipe(
      map((response) => {
        return response; // return response from API
      }),
      catchError(this.handleError)
    );
  }

  deleteQuiz(id: number): Observable<number> {
    let api_key = '';
    if (this.authService.currentUser && this.authService.currentUser) {
      api_key = this.authService.currentUserValue.token;
    }
    const url = 'apis/quiz/delete/' + id;
    return this.httpService.delete(url, api_key).pipe(
      map((response) => {
        if (AuthConstants.DEV_MODE) {
          console.log("Hiting ", response);
        }
        return id; // return the ID of the deleted doctor
      }),
      catchError(this.handleError)
    );;
  }

  /** Handle Http operation that failed */
  private handleError(error: HttpErrorResponse) {
    console.error('An error occurred:', error.message);
    let errorMsg = 'Something went wrong; please try again later.';
    if (error.message) {
      errorMsg = error.message;
    }
    return throwError(
      () => new Error(errorMsg)
    );
  }

  processAndSaveResults(questions: QuizQuestion[], quizId: number): QuizResult {
    const total = questions.length;
    //const correct = questions.filter(q => q.selectedOption === q.correctAnswer).length;
    const correct = questions.filter(q => {
      const correctOption = q.options.find(option => option.correct === true);
      return q.selectedOption === correctOption?.id;
    }).length;

    const wrong = questions.filter(q => {
      const correctOption = q.options.find(option => option.correct === true);
      return q.selectedOption && q.selectedOption !== correctOption?.id;
    }).length;

    const unanswered = total - correct - wrong;
    const score = ((correct / total) * 100).toFixed(2);
    let analytics: QuizResult = {
      quizId,
      userId: this.authService.currentUserValue.id,
      total,
      correct,
      wrong,
      unanswered,
      timeSpent: 0,
      score: Number(score),
      dateAttempted: new Date().toISOString()
    };

    const attempts = questions.map(q => {
      const correctOption = q.options.find(option => option.correct === true);
      return {
        questionId: q.id,
        selectedOption: q.selectedOption || null,
        answer: correctOption ? correctOption.option : null,
        isCorrect: (q.selectedOption && q.selectedOption === correctOption.id) ?? false,
        isSkipped: q.isSkipped || false,
        timeTaken: q.timeTaken || 0,
        hintUsed: q.hintUsed || false,
        answerSeen: q.answerSeen || false,
      };
    });
    analytics['attempts'] = attempts;

    console.log('Quiz Result => ', analytics);
    return analytics;
  }

  setCurrentQuiz(quiz: QuizEntity) {
    this.currentQuiz = quiz;
  }

  getCurrentQuiz(): QuizEntity {
    return this.currentQuiz;
  }

  setQuizConfig(quizConfig: QuizConfig) {
    this.quizConfig = quizConfig;
    console.log("setQuizConfig", quizConfig);
  }

  getQuizConfig(): QuizConfig {
    if(!this.quizConfig){
     this.quizConfig = new QuizConfig();
    }
    return this.quizConfig;
  }
}
export class QuizConfig {
  numQuestions: number = 5;
  level: string;
  mode: string;
  showHint: boolean;
  showAnswers: boolean;
  enableNavigation: boolean = true;
  enableAudio: boolean;

  constructor(topic: Partial<QuizConfig> = {}) {
      this.mode = topic.mode || 'Interactive';
      this.level = topic.level || 'Basic';
      this.numQuestions = topic.numQuestions || 7;
      this.showHint = topic.showHint || true;
      this.showAnswers = topic.showAnswers || true;
      this.enableNavigation = topic.enableNavigation || false;
      this.enableAudio = topic.enableAudio || false;
    }
}
