import { Route } from "@angular/router";
import { TopicExplorerComponent } from "./topic-explorer/topic-explorer.component";
import { TopicContentComponent } from "./topic-content/topic-content.component";
export const TOPIC_ROUTE: Route[] = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: "explore/:topic",
    component: TopicExplorerComponent,
  },
  {
    path: ":topic",
    component: TopicContentComponent,
  }
];
