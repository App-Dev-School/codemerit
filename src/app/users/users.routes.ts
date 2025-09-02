import { Route } from "@angular/router";
import { ListUserComponent } from "./list/list.component";
import { CreateUserComponent } from "./create/create.component";
import UserComponent from "./view/users.component";
import { Role } from "@core/models/role";
export const USERS_ROUTE: Route[] = [
  {
    path: "list",
    data: {
      role: Role.Admin,
    },
    component: ListUserComponent,
  },
  {
    path: "create",
    data: {
      role: Role.Admin,
    },
    component: CreateUserComponent,
  },
  {
    path: "edit/:userName",
    data: {
      role: Role.Admin,
    },
    component: CreateUserComponent,
  },
  {
    path: "profile",
    component: UserComponent,
  },
  {
    path: "view/:userName",
    data: {
      role: [Role.Admin, Role.Manager],
    },
    component: UserComponent,
  }
];
