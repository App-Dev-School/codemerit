import { Route } from "@angular/router";
import { ListUserComponent } from "./list/list.component";
import { CreateUserComponent } from "./create/create.component";
import UserComponent from "./view/users.component";
export const USERS_ROUTE: Route[] = [
  {
    path: "list",
    component: ListUserComponent,
  },
  {
    path: "create",
    component: CreateUserComponent,
  },
  {
    path: "view/:userName",
    component: UserComponent,
  },
];
