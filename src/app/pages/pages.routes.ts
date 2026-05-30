import { Route } from "@angular/router";
import { FaqsComponent } from "./faqs/faqs.component";
import { InvoiceComponent } from "./invoice/invoice.component";
import { PricingComponent } from "./pricing/pricing.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { SelectSubjectComponent } from "../subscriber/select-subject/select-subject.component";
import { SelectCourseComponent } from "../subscriber/select-course/select-course.component";
import { ViewCourseComponent } from "./view-course/view-course.component";
import { StandardQuizComponent } from "./browse-quizzes/browse-quizzes.component";
export const PAGES_ROUTE: Route[] = [
  {
    path: "welcome",
    component: WelcomeComponent,
  },
  {
    path: 'program/:course',
    component: ViewCourseComponent,
  },
  // {
  //   path: 'select-subject',
  //   component: SelectSubjectComponent,
  // },
  // {
  //   path: 'select-job-role',
  //   component: SelectCourseComponent,
  // },
  {
    path: "subscription",
    component: PricingComponent,
  },
  {
    path: "invoice",
    component: InvoiceComponent,
  },
  {
    path: "faqs",
    component: FaqsComponent,
  },
  {
    path: "standard-quiz",
    component: StandardQuizComponent,
  },
];
