import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { SurveyModule } from 'survey-angular-ui';
import { Model } from 'survey-core';
import { LayeredLightPanelless } from "survey-core/themes";
//import "survey-core/defaultV2.css";
//import "survey-creator-core/survey-creator-core.css";

@Component({
    selector: 'app-take-quiz',
    templateUrl: './take-quiz.component.html',
    styleUrls: ['./take-quiz.component.scss'],
    imports: [MatButtonModule, SurveyModule]
})
export class TakeQuizComponent {
  title = 'Take Quiz';
  surveyModel: Model;
  qcode :any;
  constructor(private http: HttpClient, private route: ActivatedRoute,
    public ngRouter: Router) {
    // constructor code
  }

  ngOnInit() {
    this.takeRouteParams();
  }

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
    const quizName = this.qcode;
    let quizResponse = this.http.get("./assets/data/quizzes/"+quizName+".json");
    quizResponse.subscribe(quiz => {
    if(quiz){
      console.log("TakeQuiz fetchQuiz", quiz);
      const surveyJson = JSON.parse(JSON.stringify(quiz));
      this.initQuiz(surveyJson);
    }
    });
  }

  initQuiz(surveyJson:any){
    const survey = new Model(surveyJson);
    survey.applyTheme(LayeredLightPanelless);
    
        survey.onCompleting.add((sender) => {
          const totalScore = 0;
          const maxScore = 0;
          console.log("TakeQuiz onCompleting", JSON.stringify(sender.data, null, 3));
          // Save the scores in survey results
          sender.setValue("maxScore", maxScore);
          sender.setValue("sender.data", sender.data);
        });
        survey.onComplete.add((sender, options) => {
            console.log("TakeQuiz onComplete", JSON.stringify(sender.data, null, 3));
            console.log("####### sender data", sender.data);
        });
        this.surveyModel = survey;
        console.log("TakeQuiz #####", this.surveyModel.data);
  }

}
