import { NgClass, NgStyle } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { QuestionService } from 'src/app/admin/questions/manage/questions.service';
import Swiper from 'swiper';
import { register } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';
@Component({
  selector: 'app-goal-path',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [MatProgressBarModule,
    MatCardModule,
    NgClass, NgStyle],
  templateUrl: './goal-path.component.html',
  styleUrl: './goal-path.component.scss'
})
export class GoalPathComponent implements AfterViewInit {
  @ViewChild("swiperEx") swiperComponent ?: ElementRef<{ swiper: Swiper }>
  @Input() title: string = 'Progress Tracker';
  @Input() topics!: Observable<any[]>;
  @Input() color: string = '#000000';
  topicsList: any[] = [];

  private subscription!: Subscription;
  currentSlideIndex = this.getFirstIncompleteIndex();

  navigation = {
        nextEl: '.swiper-button-next-custom',
        prevEl: '.swiper-button-prev-custom',
  };

  pagination = {
    clickable: true,
    dynamicBullets: false,
    renderBullet: function (index, className) {
      return '<span class="goalPagIcon ' + className + '">' + (index + 1) + "</span>";
    },
  };

  swiperConfig : SwiperOptions = {
  spaceBetween: 10,
  navigation: true,
  freeMode: true,
  watchSlidesProgress: true,
  slidesPerView: 3,
  breakpoints: {
    0: {
      slidesPerView: 1.1,
    },
    576: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 3,
    },
    992: {
      slidesPerView: 4,
    },
    1200: {
      slidesPerView: 5,
    }
  },
    pagination: {
    clickable: true,
    dynamicBullets: true,
    renderBullet: function (index, className) {
      return '<span class="' + className + '">' + (index + 1) + "</span>";
    },
  },
};

 breakpoints = {
    0: {
      slidesPerView: 1.1,
    },
    576: {
      slidesPerView: 2,
    },
    768: {
      slidesPerView: 3,
    },
    992: {
      slidesPerView: 4,
    },
    1200: {
      slidesPerView: 5,
    }
  }

  constructor(private router: Router, private questionService: QuestionService) {
    register(); // Register Swiper web components
  }

  getFirstIncompleteIndex(): number {
    //return this.topics.findIndex(topic => topic.progress < 100) || 0;
    const index = this.topicsList.findIndex(topic => topic.progress < 100);
    return index !== -1 ? index : 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['topics'] && this.topics) {
      // Unsubscribe if there's a previous subscription
      if (this.subscription) {
        this.subscription.unsubscribe();
      }

      this.subscription = this.topics.subscribe(data => {
        this.topicsList = data;
        this.currentSlideIndex = this.getFirstIncompleteIndex();
        console.log("GoalPath ngOnChange ", this.currentSlideIndex, data);

        // Move to correct slide after data is received
        setTimeout(() => {
          if (this.swiperComponent?.nativeElement?.swiper) {
            this.swiperComponent.nativeElement.swiper.slideTo(this.currentSlideIndex, 500);
          }
        }, 0);
      });
    }
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.swiperComponent?.nativeElement.swiper.slideTo(this.currentSlideIndex, 500);
    // }, 5000);
  }

  onSlideNext(): void {
    if (this.currentSlideIndex < this.topicsList.length - 1) {
      this.swiperComponent.nativeElement.swiper.slideNext();
      this.updateCurrentIndex();
    } else {
      //this.completeViewing();
    }
  }

  onSlidePrev(): void {
    if (this.currentSlideIndex > 0) {
      this.swiperComponent.nativeElement.swiper.slidePrev();
      //this.updateCurrentIndex();
    }
  }

  private updateCurrentIndex(): void {
    this.currentSlideIndex = this.swiperComponent.nativeElement.swiper.activeIndex;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
