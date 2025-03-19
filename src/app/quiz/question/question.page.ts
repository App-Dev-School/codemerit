import { NgClass } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular'; 
import { CdTimerModule } from 'angular-cd-timer';
import { CountdownModule } from 'ngx-countdown';
//import { IonHeader } from '@ionic/angular/standalone';
import Swiper from 'swiper';
// import Swiper styles
//import 'swiper/css';

@Component({
  selector: 'app-question',
  templateUrl: './question.page.html',
  styleUrls: ['./question.page.scss'],
  standalone: true,
  imports: [
    //RouterModule,
    IonicModule,
    //IonSlides,
    NgClass,
    CdTimerModule, 
    CountdownModule,
    ]
})
export class QuestionPage implements OnInit {
  segment = 0;

  sliderOne: any;
  viewType!: string;
  counter = 0;
  wrongAnswer1!: boolean;
  wrongAnswer2!: boolean;
  wrongAnswer3!: boolean;
  wrongAnswer4!: boolean;
  wrongAnswer5!: boolean;
  wrongAnswer6!: boolean;
  wrongAnswer7!: boolean;
  wrongAnswer8!: boolean;
  wrongAnswer9!: boolean; 

  rightAnswer1!: boolean;
  rightAnswer2!: boolean;
  rightAnswer3!: boolean;

  //@ViewChild('slideWithNav', { static: false }) slideWithNav!: IonSlides;
  slideWithNav:any;
  constructor(private navCtrl: NavController, private router: Router) { 
    this.sliderOne =
    {
      isBeginningSlide: true,
      isEndSlide: false,
      slidesItems: []
    };
  }

  ngOnInit() {
 
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
  slideNext(object: any, slideView: { slideNext: (arg0: number) => Promise<any>; }) {
    slideView.slideNext(500).then(() => {
      this.checkIfNavDisabled(object, slideView,);
    });
  }
 
  //Method called when slide is changed by drag or navigation
  SlideDidChange(object: any, slideView: any) {
    this.checkIfNavDisabled(object, slideView);
    console.log(object, slideView)
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
    this.wrongAnswer1 = false;
    this.wrongAnswer2 = false;
    this.wrongAnswer3 = false;
    this.wrongAnswer4 = false;
    this.wrongAnswer5 = false;
    this.wrongAnswer6 = false;
    this.wrongAnswer7 = false;
    this.wrongAnswer8 = false;
    this.wrongAnswer9 = false;
  }

  wrong_answer1() {
    // this.reset();
    this.wrongAnswer1 = !this.wrongAnswer1; 
  }
  wrong_answer2() {
    this.reset();
    this.wrongAnswer2 = !this.wrongAnswer2;
  }
  wrong_answer3() {
    this.reset();
    this.wrongAnswer3 = !this.wrongAnswer3;
  }
  wrong_answer4() {
    this.reset();
    this.wrongAnswer4 = !this.wrongAnswer4;
  }
  wrong_answer5() {
    this.reset();
    this.wrongAnswer5 = !this.wrongAnswer5;
  }
  wrong_answer6() {
    this.reset();
    this.wrongAnswer6 = !this.wrongAnswer6;
  }
  wrong_answer7() {
    this.reset();
    this.wrongAnswer7 = !this.wrongAnswer7;
  }
  wrong_answer8() {
    this.reset();
    this.wrongAnswer8 = !this.wrongAnswer8;
  }
  wrong_answer9() {
    this.reset();
    this.wrongAnswer9 = !this.wrongAnswer9;
  }

  right_answer1() {
    this.reset();
    this.rightAnswer1 = !this.rightAnswer1;
  }
  right_answer2() {
    this.reset();
    this.rightAnswer2 = !this.rightAnswer2;
  }
  right_answer3() {
    this.reset();
    this.rightAnswer3 = !this.rightAnswer3;
  }

  quizSummery() {  
    this.navCtrl.navigateRoot(['./quiz-summery']);
  } 

  setViewType(vt: string) {
    this.viewType = vt;
  }

  openQuizCategory() {
    this.navCtrl.navigateForward(['./contests'], { queryParams: { segment: 1 } });
  }

  goToDashbpard(){
    //this.router.navigate(['/dashboard']);
    this.navCtrl.navigateRoot(['./dashboard']);
  }

}
