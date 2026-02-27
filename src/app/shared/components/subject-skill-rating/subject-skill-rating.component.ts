import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { EventEmitter, Output } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
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
import { MatRippleModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule} from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { SkillRatingComponent } from '@shared/components/skill-rating/skill-rating.component';
import { Swiper } from 'swiper';
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
  topics: string[] = [];
  currentIndex: number = 0;

  @Output() completed = new EventEmitter<boolean>();
  @ViewChild('swiperRef') swiperRef!: ElementRef<any>;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.loadTopics();
    register();
  }

  loadTopics() {
    this.topics = ['HTML', 'CSS', 'JavaScript'];
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
      group[topic] = subjectGroup;
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
          swiper.slideNext();
        }

          isCurrentSlideInvalid(): boolean {
            const topic = this.topics[this.currentIndex];
            return this.getTopicGroup(topic)?.invalid ?? true;
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