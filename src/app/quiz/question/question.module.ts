import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { QuestionPageRoutingModule } from './question-routing.module';
//import { SwiperModule } from 'swiper/angular';

import { QuestionPage } from './question.page';
import { CdTimerModule } from 'angular-cd-timer';
import { CountdownModule } from 'ngx-countdown';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CdTimerModule,
    CountdownModule,
    //QuestionPageRoutingModule
  ],
  declarations: []
})
export class QuestionPageModule {}
