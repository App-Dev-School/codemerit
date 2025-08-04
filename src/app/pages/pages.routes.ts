import { Route } from "@angular/router";
import { PricingComponent } from "./pricing/pricing.component";
import { InvoiceComponent } from "./invoice/invoice.component";
import { FaqsComponent } from "./faqs/faqs.component";
import { WelcomeComponent } from "./welcome/welcome.component";
import { MainLayoutComponent } from "../layout/app-layout/main-layout/main-layout.component";
export const PAGES_ROUTE: Route[] = [
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
    path: "welcome",
    component: WelcomeComponent,
  },
];
