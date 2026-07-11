import { Route } from "@angular/router";
import { FaqsComponent } from "./faqs/faqs.component";
import { InvoiceComponent } from "./invoice/invoice.component";
import { PricingComponent } from "./pricing/pricing.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { SelectSubjectComponent } from "../subscriber/select-subject/select-subject.component";
import { SelectCourseComponent } from "../subscriber/select-course/select-course.component";
import { StandardQuizComponent } from "./browse-quizzes/browse-quizzes.component";
import { UiTestsComponent } from "./ui-tests/ui-tests.component";
export const PAGES_ROUTE: Route[] = [
  {
    path: "welcome",
    component: WelcomeComponent,
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
  {
    path: "ui-tests",
    component: UiTestsComponent,
  },
];
