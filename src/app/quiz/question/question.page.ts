import { NgClass } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CdTimerModule } from 'angular-cd-timer';
import { CountdownModule } from 'ngx-countdown';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper';
import { SwiperOptions } from 'swiper/types';
import { HttpClient } from '@angular/common/http';
import { Question } from '@core/models/question';
import { Quiz } from '@core/models/quiz';

@Component({
  selector: 'app-question',
  templateUrl: './question.page.html',
  styleUrls: ['./question.page.scss', './swiper.scss'],
  standalone: true,
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule,
    NgClass,
    CdTimerModule, 
    CountdownModule,
    ]
})
export class QuestionPage implements OnInit, AfterViewInit {
  currentQuestionId = 0;

  sliderOne: any;
  viewType!: string;
  counter = 0;
  // wrongAnswer1!: boolean;
  // wrongAnswer2!: boolean;
  // wrongAnswer3!: boolean;
  // wrongAnswer4!: boolean;
  // wrongAnswer5!: boolean;
  // wrongAnswer6!: boolean;
  // wrongAnswer7!: boolean;
  // wrongAnswer8!: boolean;
  // wrongAnswer9!: boolean; 

  // rightAnswer1!: boolean;
  // rightAnswer2!: boolean;
  // rightAnswer3!: boolean;
  selectedChoice: string;
  qcode :any;
  quiz: Quiz;
  questions :Question[];

  //@ViewChild('slideWithNav', { static: false }) slideWithNav!: IonSlides;
   swiperParams: SwiperOptions = {
    slidesPerView: 2,
    spaceBetween: 50,
    navigation: true
  };

  swiper?: Swiper;
  @ViewChild("swiperEx") swiperEx ?: ElementRef<{ swiper: Swiper }>
  //slideWithNav:any;
  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { 
    this.sliderOne =
    {
      isBeginningSlide: true,
      isEndSlide: false,
      slidesItems: []
    };
  }

  ngOnInit() {
    this.takeRouteParams();
    register();
  }

  slideOptions = {
    effect:'cards',
    grabCursor:'true', 
    slidesPerView: '1.2', 
    spaceBetween: 0,
    freeMode: 'true',
    centeredSlides: true,  
    keyboard:  true,  
    invert: true, 
    mousewheel: 'true',
    allowTouchMove: false,
    pagination: {
      el: '.swiper-pagination',
      type: 'progressbar',
    },
    thumbs: {
      swiper: 'thumbsSwiper',
    }
  };

  //Move to Next slide
  slideNext(object: any) {
    // slideView.slideNext(500).then(() => {
    //   this.checkIfNavDisabled(object, slideView,);
    // });
  }
 
  //Method called when slide is changed by drag or navigation
  SlideDidChange(object: any, slideView: any) {
    this.checkIfNavDisabled(object, slideView);
    console.log("CodeMeritIonQuiz SlideDidChange", object, slideView)
  }

  //Call methods to check if slide is first or last to enable disbale navigation  
  checkIfNavDisabled(object: any, slideView: any) {
    this.checkisBeginning(object, slideView);
    this.checkisEnd(object, slideView);
  }

  checkisBeginning(object: { isBeginningSlide: any; }, slideView: { isBeginning: () => Promise<any>; }) {
    slideView.isBeginning().then((istrue: any) => {
      object.isBeginningSlide = istrue;
    });
  }

  checkisEnd(object: { isEndSlide: any; }, slideView: { isEnd: () => Promise<any>; }) {
    slideView.isEnd().then((istrue: any) => {
      object.isEndSlide = istrue; 
    });
  };

  ionViewDidLoad(){
    // this.slideWithNav.onlyExternal = true;
  }

  reset() {
    // this.wrongAnswer1 = false;
    // this.wrongAnswer2 = false;
    // this.wrongAnswer3 = false;
    // this.wrongAnswer4 = false;
    // this.wrongAnswer5 = false;
    // this.wrongAnswer6 = false;
    // this.wrongAnswer7 = false;
    // this.wrongAnswer8 = false;
    // this.wrongAnswer9 = false;
  }

  optionSelected(option: string, question: Question) {
    // this.reset();
    //this.wrongAnswer1 = !this.wrongAnswer1;
    if(!question.hasAnswered){
      this.selectedChoice = option;
      question.hasAnswered = true;
      //change the reference
    }
  }

  quizSummery() {  
    //this.navCtrl.navigateRoot(['./quiz-summery']);
  } 

  setViewType(vt: string) {
    this.viewType = vt;
  }

  openQuizCategory() {
    //this.navCtrl.navigateForward(['./contests'], { queryParams: { currentQuestionId: 1 } });
  }

  goToDashbpard(){
    //this.router.navigate(['/dashboard']);
    //No Ionics NavCtrl
    //this.navCtrl.navigateRoot(['./dashboard']);
    this.router.navigate(['/dashboard']);
  }


  //
  onSlideChange() {
    console.log(this.swiper.activeIndex);
  }

  swiperSlideChanged(e: any) {
    console.log('swiperSlideChanged 1 changed: ', e);
    console.log('swiperSlideChanged 2: ', this.swiper.activeIndex);
  }

  
  onSlidePrev()
  {
    this.swiperEx?.nativeElement.swiper.slidePrev(1000)
  }
  onSlideNext()
  {
    if(this.currentQuestionId >= this.questions.length -1){
      this.router.navigate(['/dashboard/learn/angular']);
      }else{
      this.swiperEx?.nativeElement.swiper.slideNext(1000);
      this.currentQuestionId = this.swiperEx?.nativeElement.swiper.activeIndex;
      }
    console.log("CodeMeritIonQuiz fetchQuiz", this.quiz, this.questions)
  }

  swiperReady() {
    console.log('swiperReady: ');
    //this.swiper = this.swiperEx?.nativeElement.swiper;
    this.swiper = new Swiper('#swiperEx', this.swiperParams);
    console.log('swiperReady: ', this.swiper);
  }

  ngAfterViewInit(): void {
    this.swiperReady();
  }


  /* */
  takeRouteParams(){
    /********** CHECK ROUTE PARAM REQUESTS ***********/
    this.route.paramMap.subscribe(params => {
      if(params.get("qcode")){
      this.qcode = params.get("qcode");
      console.log("this.qcode => "+this.qcode);
      // if(this.user_name != this.authData.user_name){
      //   this.selfView = false;
      //  }
      this.fetchQuiz();
     }
    });
    /********* CHECK ROUTE PARAM REQUESTS ***********/
  }

  fetchQuiz(){
    //const quizName = this.qcode;
    const quizName = 'quiz-angular';
    let quizResponse = this.http.get("./assets/data/quizzes/"+quizName+".json");
    quizResponse.subscribe((quiz:Quiz) => {
    if(quiz){
      this.quiz = quiz;
      this.questions = this.quiz.questions;
    }
    console.log("CodeMeritIonQuiz fetchQuiz", this.quiz, this.questions)
    });
  }
  
}
