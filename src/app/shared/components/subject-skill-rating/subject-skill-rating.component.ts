import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  MatButtonModule
} from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MasterService } from '@core/service/master.service';
import { SkillRatingComponent } from '@shared/components/skill-rating/skill-rating.component';
import { TopicItem } from 'src/app/admin/topics/manage/topic-item.model';
import { register } from 'swiper/element/bundle';


@Component({
  standalone: true,
  selector: 'app-subject-skill-rating',
  templateUrl: './subject-skill-rating.component.html',
  styleUrls: ['./subject-skill-rating.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatIcon,
    MatRadioModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatRippleModule,
    MatInputModule,
    SkillRatingComponent,
    MatTableModule,
  ],
})

export class SubjectSkillRatingComponent {

  @Input() subjectId!: number;

  skillForm!: FormGroup;
  topics: TopicItem[] = [];
  currentIndex: number = 0;

  @Output() completed = new EventEmitter<boolean>();
  @ViewChild('swiperRef') swiperRef!: ElementRef<any>;

  constructor(private fb: FormBuilder, private masterSrv: MasterService) { }

  ngOnInit() {
    this.subjectId = 1;
    if (this.subjectId > 0) {
      this.loadTopics();
    }
    register();
  }

  loadTopics() {
    const topics = this.masterSrv.topics;
    this.topics = topics.filter(topic => topic.subjectId == this.subjectId);
    const group: any = {};
    for (const topic of this.topics) {

      const subjectGroup = this.fb.group({
        knows: [null, Validators.required],
        level: [null],
        rating: [null]

      });

      // Make rating required only if knows = true
      subjectGroup.get('knows')?.valueChanges.subscribe(val => {

        if (val === true) {
          subjectGroup.get('rating')?.setValidators(Validators.required);
          subjectGroup.get('level')?.setValidators(Validators.required);
        }
        else if (val === false) {
          subjectGroup.get('rating')?.clearValidators();
          subjectGroup.get('level')?.clearValidators();
          subjectGroup.patchValue({ level: null, rating: null });
        }

        subjectGroup.get('rating')?.updateValueAndValidity();
        subjectGroup.get('level')?.updateValueAndValidity();
      });
      group[topic.title] = subjectGroup;
    }

    this.skillForm = this.fb.group(group);
  }

  prevSlide(): void {
    const swiper = this.swiperRef?.nativeElement?.swiper;
    if (!swiper) return;
    swiper.slidePrev();
  }


  nextSlide(): void {
    const swiper = this.swiperRef?.nativeElement?.swiper;
    if (!swiper) return;
    if (this.isSummarySlide) {
      // Only submit from summary card
      this.completed.emit(true);
      console.log('Final submitted payload:', this.skillForm.value);
    } else {
      swiper.slideNext();
    }
  }

  get isSummarySlide(): boolean {
    return this.currentIndex === this.topics.length;
  }

  getSummaryStats() {
    // Calculate averages and seniority score
    let levelSum = 0, levelCount = 0, ratingSum = 0, ratingCount = 0;
    const levelMap: any = { Basic: 1, Working: 2, Expert: 3 };
    Object.values(this.skillForm.value).forEach((topic: any) => {
      if (topic.level && levelMap[topic.level]) {
        levelSum += levelMap[topic.level];
        levelCount++;
      }
      if (typeof topic.rating === 'number') {
        ratingSum += topic.rating;
        ratingCount++;
      }
    });
    const avgLevel = levelCount ? (levelSum / levelCount) : 0;
    const avgRating = ratingCount ? (ratingSum / ratingCount) : 0;
    // Example seniority score: weighted avg
    const seniorityScore = (avgLevel * 2 + avgRating) / 3;
    return { avgLevel, avgRating, seniorityScore: seniorityScore * 100 };
  }

  isCurrentSlideInvalid(): boolean {
    const topic = this.topics[this.currentIndex];
    return this.getTopicGroup(topic.title)?.invalid ?? true;
  }

  onSlideChange(event: any) {
    this.currentIndex = event.target.swiper.activeIndex;
  }

  get isLastSlide(): boolean {
    return this.currentIndex === this.topics.length - 1;
  }
  getTopicGroup(topic: string): FormGroup {
    return this.skillForm.get(topic) as FormGroup;
  }

  knowsTopic(topic: string): boolean {
    return this.getTopicGroup(topic)?.get('knows')?.value === true;
  }

}