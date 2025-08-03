import { JsonPipe, NgClass } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { CdTimerModule } from 'angular-cd-timer';
import { CountdownModule } from 'ngx-countdown';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper';
import { SwiperOptions } from 'swiper/types';
import { HttpClient } from '@angular/common/http';
import { SafePipe } from '@shared/pipes/safehtml.pipe';

@Component({
  selector: 'app-lesson',
  templateUrl: './lesson.page.html',
  styleUrls: ['./lesson.page.scss', './swiper.scss'],
  standalone: true,
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule,
    CdTimerModule, 
    CountdownModule,
    // JsonPipe,
    // SafePipe,
    ]
})
export class LessonPage implements OnInit, AfterViewInit {
  currentSection = 0;

  sliderOne: any;
  viewType!: string;
  counter = 0;
  qcode :any;
  lesson :any;

  //@ViewChild('slideWithNav', { static: false }) slideWithNav!: IonSlides;
   swiperParams: SwiperOptions = {
    slidesPerView: 2,
    spaceBetween: 50,
    navigation: true
  };

  swiper?: Swiper;
  @ViewChild("swiperEx") swiperEx ?: ElementRef<{ swiper: Swiper }>

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) { 

  }

  ngOnInit() {
    register();
    console.log("LessonComponent ngOnInit");
    this.takeRouteParams();
  }

  slideNext(object: any) {
    // slideView.slideNext(500).then(() => {
    //   this.checkIfNavDisabled(object, slideView,);
    // });
  }


  ionViewDidLoad(){
    // this.slideWithNav.onlyExternal = true;
  }

  reset() {
  }

  backToLessons() {
    //Dynamic Navigation with information
    //this.navCtrl.navigateRoot(['./dashboard/learn/angular']);
    //this.navCtrl.navigateBack(['./dashboard/learn/angular']);
    this.router.navigate(['/dashboard/learn/angular']);
  }

  setViewType(vt: string) {
    this.viewType = vt;
  }

  openMenu() {
    this.router.navigate(['./contests'], { queryParams: { currentSection: 1 } });
  }

  goToDashbpard(){
    //this.router.navigate(['/dashboard']);
    this.router.navigate(['./dashboard']);
  }


  //
  onSlideChange() {
    console.log("onSlideChange", this.swiper.activeIndex);
  }

  swiperSlideChanged(e: any) {
    console.log('swiperSlideChanged 1 changed: ', e);
    console.log('swiperSlideChanged 2: ', this.swiper.activeIndex);
  }

  
  onSlidePrev()
  {
      //this.swiper.slidePrev(1000);
      this.swiperEx?.nativeElement.swiper.slidePrev(1000);
      this.currentSection = this.swiperEx?.nativeElement.swiper.activeIndex;
      console.log('onSlidePrev : ', this.swiper.activeIndex, this.swiperEx?.nativeElement.swiper.activeIndex);
  }

  onSlideNext()
  {
    if(this.currentSection >= this.lesson.sections.length -1){
    this.backToLessons();
    }else{
    this.swiperEx?.nativeElement.swiper.slideNext(1000);
    this.currentSection = this.swiperEx?.nativeElement.swiper.activeIndex;
    }
    console.log('onSlideNext : ', this.swiper.activeIndex, this.swiperEx?.nativeElement.swiper.activeIndex);
  }

  swiperReady() {
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
      console.log("LessonComponent this.qcode => "+this.qcode);
      // if(this.user_name != this.authData.user_name){
      //   this.selfView = false;
      //  }
      this.fetchLesson();
     }
    });
    /********* CHECK ROUTE PARAM REQUESTS ***********/
  }

  fetchLesson(){
    //const quizName = this.qcode;
    const lessonName = 'angular17';
    let lessonResponse = this.http.get("./assets/data/lessons/"+lessonName+".json");
    lessonResponse.subscribe(lesson => {
    if(lesson){
      this.lesson = lesson;
      console.log("LessonComponent fetchLesson => ", this.lesson);
    }
    });
  }
  
}
