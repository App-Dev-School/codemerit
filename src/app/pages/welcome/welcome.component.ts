import { JsonPipe } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '@core';
import { RatingType } from '@core/models/rating-type';
import { SkillRating } from '@core/models/skill-rating';
import { SkillType } from '@core/models/skill-type';
import { Course } from '@core/models/subject-role';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { CertificateComponent } from '@shared/components/certificate/certificate.component';
import { CertificateModel, CertificateTemplateId } from '@shared/components/certificate/certificate.model';
import { CongratulationsCardComponent } from '@shared/components/congratulations-card/congratulations-card.component';
import { LearnerWelcomeCardComponent } from '@shared/components/learner-welcome-card/learner-welcome-card.component';
import { MedalCardComponent } from "@shared/components/medal-card/medal-card.component";
import { ReportListComponent } from '@shared/components/report-list/report-list.component';
import { SkillRatingWidgetComponent } from '@shared/components/skill-rating-widget/skill-rating-widget.component';
import { SubjectSkillRatingComponent } from '@shared/components/subject-skill-rating/subject-skill-rating.component';
import { NgScrollbar } from 'ngx-scrollbar';
import { register } from 'swiper/element/bundle';
import { LessonService } from 'src/app/learn/lesson.service';

export const certificateModels: CertificateModel[] = [
  {
    platformName: 'Angular Framework Foundation Certification',
    userName: 'Vishal Kumar',
    skillName: 'Angular Architect',
    tierDisplayName: 'FOUNDATION',
    assessmentTitle: CertificateTemplateId.MilestoneCompletion,
    scorePercentage: 0,
    certificateNumber: 'CM-2026-00671',
    verificationCode: 'ABCD1234',
    issuedDate: new Date('2026-03-01'),
    expiryDate: new Date('2027-03-01'),
    issuerName: 'CodeMerit',
    issuerLogo: './../../../assets/images/logo.png',
    sponsorName: '',
    sponsorLogo: '',
    programLead: 'Carolin Smith',
    templateId: CertificateTemplateId.MilestoneCompletion,
    signedBy: 'Kunal Anand',
    flag: 'angular'
  },
  {
    platformName: 'Angular Monorepo Mastery',
    userName: 'Vishal Kumar',
    skillName: 'Angular Architect',
    tierDisplayName: '',
    assessmentTitle: CertificateTemplateId.MilestoneCompletion,
    scorePercentage: 0,
    certificateNumber: 'CM-2026-00671',
    verificationCode: 'ABCD1234',
    issuedDate: new Date('2026-03-01'),
    expiryDate: new Date('2027-03-01'),
    issuerName: 'CodeMerit',
    issuerLogo: './../../../assets/images/logo.png',
    sponsorName: '',
    sponsorLogo: '',
    programLead: 'Kunal Anand',
    templateId: CertificateTemplateId.MilestoneCompletion,
    signedBy: 'Kunal Anand',
    flag: 'angular'
  },
  {
    platformName: '',
    userName: 'Golda Maria',
    skillName: 'Angular Developer',
    tierDisplayName: 'Intern',
    assessmentTitle: CertificateTemplateId.InternshipCompletion,
    scorePercentage: 94,
    certificateNumber: 'CM-2026-INT-001',
    verificationCode: 'INT2026',
    issuedDate: new Date('2026-02-15'),
    expiryDate: new Date('2027-02-15'),
    issuerName: 'CodeMerit',
    issuerLogo: './../../../assets/images/logo.png',
    sponsorName: '',
    sponsorLogo: '',
    programLead: 'Emily Clark',
    templateId: CertificateTemplateId.InternshipCompletion,
    signedBy: 'Emily Clark',
  },
  {
    platformName: 'Advanced Backend Certification',
    userName: 'Arjun Patel',
    skillName: 'JavaScript',
    tierDisplayName: 'Employee',
    assessmentTitle: CertificateTemplateId.WorkExperience,
    scorePercentage: 88,
    certificateNumber: 'CM-2026-WRK-001',
    verificationCode: 'WORK2026',
    issuedDate: new Date('2026-01-10'),
    expiryDate: new Date('2027-01-10'),
    issuerName: 'CodeMerit',
    issuerLogo: './../../../assets/images/logo.png',
    sponsorName: '',
    sponsorLogo: '',
    programLead: 'Michael Lee',
    templateId: CertificateTemplateId.WorkExperience,
    signedBy: 'Michael Lee',
  },
  {
    platformName: 'CodeMerit Community Contribution',
    userName: 'Taylor Star',
    skillName: 'Angular',
    tierDisplayName: 'Contributor',
    assessmentTitle: CertificateTemplateId.Appreciation,
    scorePercentage: 100,
    certificateNumber: 'CM-2026-APP-001',
    verificationCode: 'APP2026',
    issuedDate: new Date('2026-03-19'),
    expiryDate: new Date('2027-03-19'),
    issuerName: 'CodeMerit',
    issuerLogo: './../../../assets/images/logo.png',
    sponsorName: '',
    sponsorLogo: '',
    programLead: 'Sophia Turner',
    templateId: CertificateTemplateId.Appreciation,
    signedBy: 'Sophia Turner',
  }
];

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
  imports: [
    JsonPipe,
    RouterLink,
    NgScrollbar,
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatChipsModule,
    MatRippleModule,
    MatIconModule,
    LearnerWelcomeCardComponent,
    CertificateComponent,
    SubjectSkillRatingComponent,
    CongratulationsCardComponent,
    SkillRatingWidgetComponent,
    ReportListComponent,
    MedalCardComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
  //  animations: [
  //     trigger('fadeOut', [
  //       transition(':leave', [
  //         style({ opacity: 1 }), // Set initial opacity
  //         animate('1.2s', style({ opacity: 0 })) // Animate to opacity 0 over 0.5 seconds
  //       ])
  //     ])
  //   ]
})
export class WelcomeComponent implements OnInit {
  public subjectRoleMap: Course[] = [];
  userName = "";
  authUser: User;
  userMessage = "";
  nextAction = "login";
  //clean up
  subjectData: any;
  subjectsByRole: { [role: string]: Course[] } = {};
  limit: number = 10; // <==== Edit this number to limit API results
  certificateModels: CertificateModel[] = [];

  skillRatings: SkillRating[] = [
    {
      skillId: 4,
      skillName: "TypeScript",
      imageUrl: "assets/images/tech/typescript.png",
      skillType: SkillType.Subject,
      ratingType: RatingType.Self,
      knows: true,
      level: "Basic",
      rating: 4.5,
      grade: "Good"
    },
    {
      skillId: 5,
      skillName: "Angular",
      imageUrl: "assets/images/tech/angular.png",
      skillType: SkillType.Subject,
      ratingType: RatingType.Self,
      knows: true,
      level: "Working",
      rating: 5,
      grade: "Excellent"
    },
    {
      skillId: 32,
      skillName: "RxJS",
      imageUrl: "assets/images/tech/rxjs.png",
      skillType: SkillType.Subject,
      ratingType: RatingType.Self,
      knows: true,
      level: "Basic",
      rating: 2.5,
      grade: "Average"
    },
    {
      skillId: 34,
      skillName: "Ionic",
      imageUrl: "assets/images/tech/ionic.png",
      skillType: SkillType.Subject,
      ratingType: RatingType.Self,
      knows: false,
      level: "",
      rating: null,
      grade: ""
    }
  ];

  engagements: any[] = [];

  userTasks = [
    {
      "id": 1,
      "task": "Complete Project KT",
      "description": "Attend the project KT session. Take the Q&A to clear doubts and mark as complete.",
      "percentage": 5,
      "level": 1,
      "tag": "Initials"
    },
    {
      "id": 2,
      "task": "Remove Unreferenced Code",
      "description": "",
      "percentage": 5,
      "level": 1,
      "tag": "Work"
    },
    {
      "id": 2,
      "task": "Enable Component Communication",
      "description": "",
      "percentage": 5,
      "level": 1,
      "tag": "Work"
    },
    {
      "id": 2,
      "task": "Implement Question Edit",
      "description": "",
      "percentage": 5,
      "level": 1,
      "tag": "Work"
    },
    {
      "id": 2,
      "task": "Dialog Component Creation",
      "description": "",
      "percentage": 5,
      "level": 1,
      "tag": "Work"
    }
  ];

  @ViewChild('swiperEx') swiperRef!: ElementRef<any>;

  constructor(private router: Router,
    private master: MasterService,
    private snackService: SnackbarService,
    public authService: AuthService,
    private lessonService: LessonService) {
    register();
    this.authService.currentUser.subscribe((sub: User) => {
      this.authService.log("Welcome ", sub, "CurrentUser");
      this.certificateModels = certificateModels;
      if (sub && sub.firstName) {
        this.authUser = sub;
        this.userName = sub.firstName;
        if (sub.designation) {
          this.nextAction = "selfRating";
          this.userMessage = "Tell us what you already know. Rate your skills, and we’ll personalize your learning path just for you.";
        } else {
          this.nextAction = "takeQuiz";
          this.userMessage = "Unlock a customized roadmap to level up faster. Generate a mock exam to assess your skills.";
        }
      } else {
        this.userMessage = "Start by listing your skills and rating yourself. We’ll adapt your journey to match your strengths and goals.";
        this.nextAction = "selfRating";
      }
      //Implement a smart next action card
      this.userMessage = "Start by listing your skills and rating yourself. We’ll adapt your journey to match your strengths and goals.";
      this.nextAction = "selfRating";
    });
    // Implement Master Data Relationship
    this.master.fetchJobRoleSubjectMapping().subscribe(data => {
      this.subjectRoleMap = data;
      this.subjectRoleMap.forEach(subject => {
        console.log("TaskJobRole ", subject);
        // subject.subjects.forEach(role => {
        //   if (!this.subjectsByRole[role]) {
        //     this.subjectsByRole[role] = [];
        //   }
        //   this.subjectsByRole[role].push(subject);
        // });
      });
    });
    //After 5 secons ore more display the next user task
    // setTimeout(() => {
    //   if(!this.authService.currentUserValue.email){
    //   this.snackService.display('snackbar-dark', 'Sign up to start up-skilling and transforming your tech path.', 'bottom', 'center');
    //   }
    // }, 10000);
  }

  ngOnInit(): void {
    this.loadExploreLessons();
    if (!this.master.subjects.length || !this.master.topics.length) {
      this.master.dataLoaded$.subscribe((ready) => {
        if (ready) {
          console.log("Master Data Fetched Now : ", new Date().toISOString());
          console.log("Subjects : ", this.master.subjects);
          console.log("Topics : ", this.master.topics);
          console.log("Job Roles : ", this.master.jobRoles);
        }
      });
    } else {
      console.log("Master Data Exists : ");
      console.log("Subjects : ", this.master.subjects);
      console.log("Topics : ", this.master.topics);
      console.log("Job Roles : ", this.master.jobRoles);
    }
  }

  exploreLesson(itemId: any) {
    const lesson = this.engagements.find((item: any) => item.id === itemId);
    if (lesson?.slug) {
      this.router.navigate(['/learn/overview', lesson.slug]);
      return;
    }
    this.snackService.display('snackbar-dark', 'Lesson not available.', 'bottom', 'center');
  }

  closeLesson(itemId: any) {
    if (typeof itemId == 'number') {
      //bad code
      this.engagements = this.engagements.filter(item => item.id != itemId)
    } else {
      this.engagements = this.engagements.filter(item => item.id > 1)
    }
  }

  private loadExploreLessons(): void {
    this.lessonService.getLessons(10, 'all').subscribe({
      next: (response: any) => {
        const lessons = Array.isArray(response?.data) ? response.data : [];
        this.engagements = lessons.map((lesson: any, index: number) => ({
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          subject: lesson.subject?.title ?? 'Lesson',
          topic: lesson.topic?.title ?? '',
          type: 'Lesson',
          style: index % 2 === 0 ? 'right' : 'left',
          imageUrl: lesson.subject?.image || 'assets/images/tech/placeholder.png',
        }));
      },
      error: (error) => {
        console.error('Failed to load explore lessons', error);
      }
    });
  }


  onSubjectChange(subject: string) {
    console.log("Home @onSubjectChange", subject);
    if (subject) {
      this.router.navigate(['/dashboard/learn', subject]).then(() => {
        console.log('Navigation completed!');
      });
    }
  }

  //separate component and then implement
  handleAction(action: String) {
    console.log("Welcome Action", action);
    switch (action) {
      case "login":
        this.router.navigate(['/authentication/signin']).then(() => {
        });
        break;

      case "takeQuiz":
        this.router.navigate(['/take-quiz/explore']).then(() => {
        });
        break;

      case "selfRating":
        this.router.navigate(['/assessment/skill-rating']).then(() => {
          console.log('Navigated to Assessment Module for Skill Rating!');
        });
        break;
      case "subjectRating":
        this.router.navigate(['/subject-skill-rating/1']).then(() => {
          console.log('Navigated to Subject Skill Rating!');
        });
        break;
      default:
        break;
    }
  }
}
