import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
export interface FAQ{
  id: string;
  question: string;
  answer:string;
}
@Component({
    selector: 'app-faqs',
    templateUrl: './faqs.component.html',
    styleUrls: ['./faqs.component.scss'],
    imports: [
        BreadcrumbComponent,
        MatExpansionModule,
        MatButtonModule,
        MatIconModule,
    ]
})
export class FaqsComponent {
  faqs : FAQ[] = [
  {
    "id": "faq1",
    "question": "What is SkillUp LMS?",
    "answer": "SkillUp LMS is a learning platform designed for IT students, freshers, and aspiring programmers to practice quizzes, take mock assessments, and prepare for job roles with industry-relevant content."
  },
  {
    "id": "faq2",
    "question": "What are the different subscription plans available?",
    "answer": "SkillUp LMS offers three plans: Basic (₹1000 one-time), Premium (₹200/month), and Team Membership (invite-only for paid interns). Each plan provides different levels of access and services."
  },
  {
    "id": "faq3",
    "question": "What is included in the Basic Membership?",
    "answer": "Basic Membership includes: 1 free mock skill assessment for one job role, 1 mock interview (AI + human-reviewed), and 1-hour group guidance session. It’s a one-time payment of ₹1000."
  },
  {
    "id": "faq4",
    "question": "What do I get with the Premium Membership?",
    "answer": "Premium Membership gives you full access to all quiz packs for all subjects and job roles. It costs ₹200 per month and is best for learners who want continuous access to updated content."
  },
  {
    "id": "faq5",
    "question": "Can I cancel or pause my Premium subscription?",
    "answer": "Yes, you can cancel your Premium subscription at any time. Access to quizzes will remain until the end of your billing cycle. Pause/resume options may also be available in your dashboard."
  },
  {
    "id": "faq6",
    "question": "How does the Team Membership work?",
    "answer": "Team Membership is designed for paid interns through partner companies. It includes everything in Premium, plus team progress tracking, custom tasks, and mentor feedback. Access is by invitation only."
  },
  {
    "id": "faq7",
    "question": "What job roles are supported in mock skill assessments?",
    "answer": "Currently, we support mock assessments for popular IT job roles such as Frontend Developer, Backend Developer, QA Engineer, Data Analyst, and more. New roles are added regularly."
  },
  {
    "id": "faq8",
    "question": "Are the mock interviews conducted by real people?",
    "answer": "Yes, mock interviews are a combination of AI-generated questions and real human feedback from experienced professionals to give you realistic interview practice."
  },
  {
    "id": "faq9",
    "question": "Is there a free trial available?",
    "answer": "While we do not offer a full free trial, the Basic plan provides a low-cost entry point to explore key features before committing to Premium."
  },
  {
    "id": "faq10",
    "question": "Can I upgrade from Basic to Premium later?",
    "answer": "Yes, you can upgrade to Premium anytime. Your existing Basic services will remain accessible, and Premium features will be unlocked immediately upon upgrade."
  },
  {
    "id": "faq11",
    "question": "How often are the quizzes updated?",
    "answer": "Quizzes are updated regularly based on industry trends, feedback from users, and actual interview patterns from recruiters to keep content relevant and fresh."
  },
  {
    "id": "faq12",
    "question": "What payment methods are supported?",
    "answer": "We support all major payment methods in India including UPI, credit/debit cards, and net banking. Secure payment gateways ensure safe transactions."
  },
  {
    "id": "faq13",
    "question": "Do I get a certificate after completing quizzes or interviews?",
    "answer": "Currently, certificates are not provided for quizzes. However, for certain skill assessments and mock interviews, a performance report or badge may be awarded based on your results."
  },
  {
    "id": "faq14",
    "question": "How can I contact support if I have issues?",
    "answer": "You can reach out to our support team via the Help section in your dashboard or email us at support@skilluplms.com. We typically respond within 24 hours."
  }
];

  constructor() {
    // constructor code
  }
}
