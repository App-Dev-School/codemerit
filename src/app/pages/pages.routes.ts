import { Route } from "@angular/router";
import { FaqsComponent } from "./faqs/faqs.component";
import { InvoiceComponent } from "./invoice/invoice.component";
import { PricingComponent } from "./pricing/pricing.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { WizardComponent } from "./wizard/wizard.component";
export const PAGES_ROUTE: Route[] = [
  {
    path: "subscription",
    component: PricingComponent,
  },
  {
    path: "self-skill-rating",
    component: WizardComponent,
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
    path: "welcome",
    component: WelcomeComponent,
  },
];
