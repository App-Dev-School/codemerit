import { Page404Component } from "../../authentication/page404/page404.component";
import { Route } from "@angular/router";
import { MainComponent } from "./main/main.component";
import { AnalyticsDashboardComponent } from "./analytics/dashboard-analytics.component";
export const DASHBOARD_ROUTE: Route[] = [
  {
    path: "",
    redirectTo: "main",
    pathMatch: "full",
  },
  {
    path: "main",
    component: MainComponent,
  },
  {
    path: "main/:subject",
    component: MainComponent,
  },
  {
    path: "analysis",
    component: AnalyticsDashboardComponent,
  },
  { path: "**", component: Page404Component },
];
