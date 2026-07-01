import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '@core';
import { RatingType } from '@core/models/rating-type';
import { SkillRating } from '@core/models/skill-rating';
import { SkillType } from '@core/models/skill-type';
import { Course } from '@core/models/subject-role';
import { MasterService } from '@core/service/master.service';
import { SnackbarService } from '@core/service/snackbar.service';
import { CertificateModel, CertificateTemplateId } from '@shared/components/certificate/certificate.model';
import { LearnerWelcomeCardComponent } from '@shared/components/learner-welcome-card/learner-welcome-card.component';
import { MeritListWidgetComponent } from '@shared/components/merit-list-widget/merit-list-widget.component';
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
    RouterLink,
    LearnerWelcomeCardComponent,
    MeritListWidgetComponent,
  ],
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

  meritList = [
    { id: 1, name: 'Vishal Kumar',  username: 'vishal',  designationName: 'Angular Architect', score: 96, avgAccuracy: 92, image: 'assets/images/users/user.jpg' },
    { id: 2, name: 'Priya Sharma',  username: 'priya',   designationName: 'Frontend Dev',      score: 91, avgAccuracy: 88 },
    { id: 3, name: 'Arjun Patel',   username: 'arjun',   designationName: 'Full Stack Dev',    score: 87, avgAccuracy: 84 },
    { id: 4, name: 'Golda Maria',   username: 'golda',   designationName: 'Intern',            score: 82, avgAccuracy: 79 },
    { id: 5, name: 'Taylor Star',   username: 'taylor',  designationName: 'Contributor',       score: 75, avgAccuracy: 71 },
  ];

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

  engagements :any = [];

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


  constructor(private router: Router,
    private master: MasterService,
    private snackService: SnackbarService,
    public authService: AuthService,
    private lessonService: LessonService) {
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

    this.loadExploreLessons();
  }

  startedLessonIds: number[] = [];

  get pendingLessonsCount(): number {
    return this.engagements.length - this.startedLessonIds.length;
  }

  get allLessonsStarted(): boolean {
    return this.startedLessonIds.length >= this.engagements.length;
  }

  isLessonStarted(id: number): boolean {
    return this.startedLessonIds.includes(id);
  }

  lessonMeta(subject: string): { accentColor: string; iconBg: string; iconColor: string } {
    const map: Record<string, { accentColor: string; iconBg: string; iconColor: string }> = {
      'Angular':    { accentColor: '#f87171', iconBg: 'rgba(248,113,113,0.12)', iconColor: '#f87171' },
      'TypeScript': { accentColor: '#60a5fa', iconBg: 'rgba(96,165,250,0.12)',  iconColor: '#60a5fa' },
      'RxJS':       { accentColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)', iconColor: '#a78bfa' },
      'Git':        { accentColor: '#fb923c', iconBg: 'rgba(251,146,60,0.12)',  iconColor: '#fb923c' },
      'Docker':     { accentColor: '#38bdf8', iconBg: 'rgba(56,189,248,0.12)',  iconColor: '#38bdf8' },
      'JavaScript': { accentColor: '#ca8a04', iconBg: 'rgba(250,204,21,0.10)',  iconColor: '#ca8a04' },
    };
    return map[subject] ?? { accentColor: '#818cf8', iconBg: 'rgba(99,102,241,0.12)', iconColor: '#818cf8' };
  }

  // exploreLesson(itemId: number): void {
  //   if (!this.isLessonStarted(itemId)) {
  //     this.startedLessonIds = [...this.startedLessonIds, itemId];
  //   }
  //   this.snackService.display('snackbar-dark', 'Opening lesson — mark complete from the lesson page', 'bottom', 'center');
  // }
   exploreLesson(itemId: any) {
    const lesson = this.engagements.find((item: any) => item.id === itemId);
    if (lesson?.slug) {
      this.router.navigate(['/learn/overview', lesson.slug]);
      return;
    }
    this.snackService.display('snackbar-dark', 'Lesson not available.', 'bottom', 'center');
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

  closeLesson(itemId: any) {
    if (typeof itemId == 'number') {
      //bad code
      this.engagements = this.engagements.filter(item => item.id != itemId)
    } else {
      this.engagements = this.engagements.filter(item => item.id > 1)
    }
  }


  onSubjectChange(subject: string) {
    console.log("Home @onSubjectChange", subject);
    if (subject) {
      this.router.navigate(['/dashboard/learn', subject]).then(() => {
        console.log('Navigation completed!');
      });
    }
  }

  certMeta(id: CertificateTemplateId): { accentColor: string; iconBg: string; iconColor: string; icon: string; label: string } {
    const map: Record<string, { accentColor: string; iconBg: string; iconColor: string; icon: string; label: string }> = {
      [CertificateTemplateId.MilestoneCompletion]: {
        accentColor: '#818cf8', iconBg: 'rgba(99,102,241,0.12)', iconColor: '#818cf8',
        icon: 'fa-solid fa-trophy', label: 'Milestone',
      },
      [CertificateTemplateId.InternshipCompletion]: {
        accentColor: '#34d399', iconBg: 'rgba(52,211,153,0.12)', iconColor: '#34d399',
        icon: 'fa-solid fa-graduation-cap', label: 'Internship',
      },
      [CertificateTemplateId.WorkExperience]: {
        accentColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.12)', iconColor: '#fbbf24',
        icon: 'fa-solid fa-briefcase', label: 'Work Experience',
      },
      [CertificateTemplateId.Appreciation]: {
        accentColor: '#fb7185', iconBg: 'rgba(251,113,133,0.12)', iconColor: '#fb7185',
        icon: 'fa-solid fa-heart', label: 'Appreciation',
      },
    };
    return map[id] ?? { accentColor: '#6366f1', iconBg: 'rgba(99,102,241,0.12)', iconColor: '#6366f1', icon: 'fa-solid fa-certificate', label: 'Certificate' };
  }

  gradeColor(grade: string): string {
    const map: Record<string, string> = {
      'Excellent': '#34d399',
      'Good':      '#818cf8',
      'Average':   '#fbbf24',
      'Poor':      '#f87171',
    };
    return map[grade] ?? '#818cf8';
  }

  difficultyMeta(difficulty: string): { label: string; color: string; bg: string } {
    const map: Record<string, { label: string; color: string; bg: string }> = {
      'Beginner':     { label: 'Beginner',     color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
      'Intermediate': { label: 'Intermediate', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  },
      'Advanced':     { label: 'Advanced',     color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    };
    return map[difficulty] ?? { label: difficulty, color: '#818cf8', bg: 'rgba(99,102,241,0.12)' };
  }

  formatIssuedDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  viewCertificate(cert: CertificateModel): void {
    this.snackService.display('snackbar-dark', `${cert.platformName || cert.skillName} — full view coming soon`, 'bottom', 'center');
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