import { Route } from "@angular/router";
import { InterviewPanelContainerComponent } from "./interview-panel-container.component";
export const INTERVIEW_ROUTE: Route[] = [
//   {
//     path: "",
//     redirectTo: "/",
//     pathMatch: "full",
//   },
  {
    path: "",
    component: InterviewPanelContainerComponent,
    //loadComponent: () => import('./interview-panel-container/interview-panel-container.component').then(c => c.InterviewPanelContainerComponent),
  }
];