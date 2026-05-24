
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RatingType } from '@core/models/rating-type';
import { SkillRatingSession } from '@core/models/skill-rating';
import { AuthService } from '@core/service/auth.service';
import { MasterService } from '@core/service/master.service';
import { SubjectSkillRatingComponent } from '../../shared/components/subject-skill-rating/subject-skill-rating.component';
import { SkillRatingComponent } from '../../shared/components/skill-rating/skill-rating.component';

@Component({
    selector: 'app-assessment-report',
    standalone: true,
    imports: [
        CommonModule,
        SubjectSkillRatingComponent,
        SkillRatingComponent
    ],
    templateUrl: './assessment-report.component.html',
    styleUrls: ['./assessment-report.component.scss']
})
export class AssessmentReportComponent implements OnInit {
    subjectSlug: string | null = null;
    currentSubject: any = null;

    // Mock data for demonstration; replace with real data as needed
    skillRatings = [
        { skillName: 'Java', rating: 4 },
        { skillName: 'HTML', rating: 5 },
        { skillName: 'CSS', rating: 4 },
        { skillName: 'JavaScript', rating: 5 },
        { skillName: 'Angular', rating: 4 },
        { skillName: 'TypeScript', rating: 4 },
    ];

    otherMetrics = [
        { name: 'Communication', rating: 5 },
        { name: 'Problem Solving', rating: 4 },
        { name: 'Project Ownership', rating: 4 },
        { name: 'Teamwork', rating: 5 },
    ];

    constructor(public route: ActivatedRoute, public master: MasterService, public authService: AuthService) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.subjectSlug = params.get('subject');
            if (this.subjectSlug) {
                this.fetchSubjectBySlug(this.subjectSlug);
            }
        });
    }

    fetchSubjectBySlug(slug: string) {
        this.currentSubject = this.master.subjects.find(subjectItem => subjectItem.slug === slug);
        // Optionally, fetch real skill ratings and metrics here
    }

    printReport() {
        window.print();
    }

    shareReport() {
        // Simple share logic; enhance as needed
        if (navigator.share) {
            navigator.share({
                title: 'Assessment Report',
                text: 'Check out this assessment report!',
                url: window.location.href
            });
        } else {
            alert('Share not supported on this browser.');
        }
    }
}
