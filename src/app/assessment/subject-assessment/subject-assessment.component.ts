
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RatingType } from '@core/models/rating-type';
import { SkillRatingSession } from '@core/models/skill-rating';
import { AuthService } from '@core/service/auth.service';
import { MasterService } from '@core/service/master.service';
import { SubjectSkillRatingComponent } from '../../shared/components/subject-skill-rating/subject-skill-rating.component';

@Component({
    selector: 'app-subject-assessment',
    standalone: true,
    imports: [CommonModule, SubjectSkillRatingComponent],
    templateUrl: './subject-assessment.component.html',
    styleUrls: ['./subject-assessment.component.scss']
})
export class SubjectAssessmentComponent implements OnInit {
    subjectSlug: string | null = null;
    currentSubject: any = null;

    constructor(private route: ActivatedRoute, private master: MasterService, private authService: AuthService) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.subjectSlug = params.get('subject');
            if (this.subjectSlug) {
                this.fetchSubjectBySlug(this.subjectSlug);
            }
        });
    }

    fetchSubjectBySlug(slug: string) {
        //not for visitors
        this.currentSubject = this.master.subjects.find(subjectItem => subjectItem.slug === slug);
        console.log("currentSubject", this.currentSubject);
    }

    onSubmit(data: any) {
        console.log('onSubmit data =>', data);
        //implement loading and progress
        if (!this.currentSubject.title) {
            return;
        }
        const assessment: Partial<SkillRatingSession> = {
            userId: this.authService.currentUserValue.id,
            ratedBy: this.authService.currentUserValue.id,
            assessmentTitle: this.currentSubject.title + ' - Self Rating',
            notes: '',
            ratingType: RatingType.Self,
            skillRatings: data
        };
        console.log('Payload =>', assessment);
        //this.loading = true;
        //this.subs.sink = 
        this.authService
            .submitSkillRatingSession(assessment)
            .subscribe({
                next: (res) => {
                    console.log("SubmitSkillrating API", res);
                    if (res && !res.error) {
                        setTimeout(() => {
                            console.log("SubmitSkillrating API User dashboard redirection ", res.data.role);
                            this.authService.redirectToUserDashboard();
                        }, 1000);
                    }
                    //res.data
                },
                error: (error) => {
                    console.error("SubmitSkillrating API error", error);
                },
            });
    }

    //Unused method, can be removed
    getAllSubjectEntries() {
        const allTopics = this.master.topics;
        const subjectTopics = allTopics.filter(topic => topic.subjectId == this.currentSubject.id);
        return subjectTopics;
    }
}
