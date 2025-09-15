import { NgClass, NgStyle } from '@angular/common';
import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { TopicItemBasic } from '@core/models/dtos/TopicDtos';
import { Subscription } from 'rxjs';
import { QuestionService } from 'src/app/admin/questions/manage/questions.service';
import { TopicItem } from 'src/app/admin/topics/manage/topic-item.model';
import Swiper from 'swiper';
import { register } from 'swiper/element/bundle';
import { SwiperOptions } from 'swiper/types';
@Component({
  selector: 'app-goal-path',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatProgressBarModule,
    MatCardModule,
    MatButtonModule,
    NgClass, NgStyle],
  templateUrl: './goal-path.component.html',
  styleUrl: './goal-path.component.scss'
})
export class GoalPathComponent implements AfterViewInit {
  @ViewChild("swiperEx") swiperComponent ?: ElementRef<{ swiper: Swiper }>
  @Input() title: string = '';
  @Input() topics: any[] = [];
  @Input() color: string = '#000000';
  @Output() nextGoal = new EventEmitter<TopicItem>();

  private subscription!: Subscription;
  currentSlideIndex = this.getFirstIncompleteIndex();
  currentTopic : TopicItem;
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
  slidesPerView: 1,
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
    //AAAAA
    const index = this.topics.findIndex(topic => topic.coverage < 100);
    return index !== -1 ? index : 0;
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes['topics'] && this.topics) {
  //     // Unsubscribe if there's a previous subscription
  //     if (this.subscription) {
  //       this.subscription.unsubscribe();
  //     }
  //   }
  // }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   this.swiperComponent?.nativeElement.swiper.slideTo(this.currentSlideIndex, 500);
    // }, 5000);
        //this.topics = this.topics.filter(topic => topic.id > 0);
        this.currentSlideIndex = this.getFirstIncompleteIndex();
        console.log("GoalPath ngAfterViewInit ", this.currentSlideIndex, this.topics);

        // Move to correct slide after data is received
        setTimeout(() => {
          if (this.swiperComponent?.nativeElement?.swiper) {
            this.swiperComponent.nativeElement.swiper.slideTo(this.currentSlideIndex, 500);
          }
        }, 0);
  }

  onSlideNext(): void {
    if (this.currentSlideIndex < this.topics.length - 1) {
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

  onTakeNextQuiz(topic: TopicItem){
    //this.onSlideNext();
    if(topic){
      this.nextGoal.next(topic);
    }else{
      this.nextGoal.next(null);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
