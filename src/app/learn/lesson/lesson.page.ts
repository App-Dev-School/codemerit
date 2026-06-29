import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgScrollbar } from 'ngx-scrollbar';
import { LessonService } from '../lesson.service';

@Component({
  selector: 'app-lesson',
  templateUrl: './lesson.page.html',
  styleUrls: ['./lesson.page.scss', './swiper.scss'],
  standalone: true,
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    NgScrollbar,
    ]
})
export class LessonPage implements OnInit, AfterViewInit {
  currentSection = 0;
  loading = false;
  errorMessage = '';

  sliderOne: any;
  viewType!: string;
  counter = 0;
  qcode :any;
  lesson :any;

  swiper?: Swiper;
  @ViewChild("swiperEx") swiperEx ?: ElementRef<{ swiper: Swiper }>

  constructor(private lessonService: LessonService, private router: Router, private route: ActivatedRoute) { 

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
    console.log("onSlideChange", this.swiper?.activeIndex);
  }

  swiperSlideChanged(e: any) {
    console.log('swiperSlideChanged 1 changed: ', e);
    this.currentSection = this.swiperEx?.nativeElement.swiper.activeIndex ?? 0;
    console.log('swiperSlideChanged 2: ', this.swiper?.activeIndex);
  }

  
  onSlidePrev()
  {
      //this.swiper.slidePrev(1000);
      this.swiperEx?.nativeElement.swiper.slidePrev(1000);
      this.currentSection = this.swiperEx?.nativeElement.swiper.activeIndex ?? 0;
      console.log('onSlidePrev : ', this.swiper?.activeIndex, this.swiperEx?.nativeElement.swiper.activeIndex);
  }

  onSlideNext()
  {
    if(this.currentSection >= this.lesson.sections.length -1){
    this.backToLessons();
    }else{
    this.swiperEx?.nativeElement.swiper.slideNext(1000);
    this.currentSection = this.swiperEx?.nativeElement.swiper.activeIndex ?? 0;
    }
    console.log('onSlideNext : ', this.swiper?.activeIndex, this.swiperEx?.nativeElement.swiper.activeIndex);
  }

  swiperReady() {
    this.swiper = this.swiperEx?.nativeElement.swiper;
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
    this.loading = true;
    this.errorMessage = '';

    this.lessonService.getLessonBySlug(this.qcode).subscribe({
      next: (response: any) => {
        this.lesson = response?.data ?? response;
        this.loading = false;
        this.currentSection = 0;

        if (!this.lesson?.title) {
          this.errorMessage = 'Lesson data not found.';
        }

        setTimeout(() => this.swiperReady());
        console.log("LessonComponent fetchLesson => ", this.lesson);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to load lesson.';
        console.log("LessonComponent fetchLesson error => ", error);
      },
    });
  }
  
}
