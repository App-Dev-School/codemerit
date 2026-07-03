import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import { Swiper } from 'swiper';
import { LessonService } from '../lesson.service';

@Component({
  selector: 'app-lesson',
  templateUrl: './lesson.page.html',
  styleUrls: ['./lesson.page.scss', './swiper.scss'],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: []
})
export class LessonPage implements OnInit, AfterViewInit {
  @HostBinding('class.dark') readonly alwaysDark = true;
  @HostBinding('class.is-exiting') exiting = false;

  currentSection = 0;
  loading = false;
  errorMessage = '';
  completed = false;

  sliderOne: any;
  viewType!: string;
  counter = 0;
  qcode: any;
  lesson: any;

  swiper?: Swiper;
  @ViewChild('swiperEx') swiperEx?: ElementRef<{ swiper: Swiper }>

  constructor(
    private lessonService: LessonService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    register();
    this.takeRouteParams();
  }

  get progressPercent(): number {
    if (!this.lesson?.sections?.length) {
      return 0;
    }

    return ((this.currentSection + 1) / this.lesson.sections.length) * 100;
  }

  reset() {}

  exitLesson() {
    this.location.back();
  }

  backToLessons() {
    this.exitLesson();
  }

  markAsComplete() {
    this.completed = true;
    setTimeout(() => {
      this.exiting = true;
      setTimeout(() => this.exitLesson(), 450);
    }, 700);
  }

  setViewType(vt: string) {
    this.viewType = vt;
  }

  openMenu() {
    this.router.navigate(['./contests'], { queryParams: { currentSection: 1 } });
  }

  goToDashbpard() {
    this.router.navigate(['./dashboard']);
  }

  onSlideChange() {
    console.log('onSlideChange', this.swiper?.activeIndex);
  }

  swiperSlideChanged(e: any) {
    this.currentSection = this.swiperEx?.nativeElement.swiper.activeIndex ?? 0;
  }

  onSlidePrev() {
    this.swiperEx?.nativeElement.swiper.slidePrev(500);
    this.currentSection = this.swiperEx?.nativeElement.swiper.activeIndex ?? 0;
  }

  onSlideNext() {
    if (this.currentSection >= this.lesson.sections.length - 1) {
      this.markAsComplete();
      return;
    }

    this.swiperEx?.nativeElement.swiper.slideNext(500);
    this.currentSection = this.swiperEx?.nativeElement.swiper.activeIndex ?? 0;
  }

  initSwiper() {
    const swiperEl = this.swiperEx?.nativeElement as any;
    if (!swiperEl) return;

    Object.assign(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 0,
      allowTouchMove: true,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 500,
    });

    swiperEl.initialize();
    this.swiper = swiperEl.swiper;
  }

  ngAfterViewInit(): void {}

  takeRouteParams() {
    this.route.paramMap.subscribe(params => {
      if (params.get('qcode')) {
        this.qcode = params.get('qcode');
        this.fetchLesson();
      }
    });
  }

  fetchLesson() {
    this.loading = true;
    this.errorMessage = '';
    this.completed = false;

    this.lessonService.getLessonBySlug(this.qcode).subscribe({
      next: (response: any) => {
        this.lesson = response?.data ?? response;
        this.loading = false;
        this.currentSection = 0;

        if (!this.lesson?.title) {
          this.errorMessage = 'Lesson data not found.';
        }

        setTimeout(() => this.initSwiper());
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message || 'Unable to load lesson.';
      }
    });
  }
}
