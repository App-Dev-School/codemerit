import { Route } from "@angular/router";
import { WizardComponent } from "./wizard/wizard.component";
import { EditorsComponent } from "./editors/editors.component";
import { FormControlsComponent } from "./form-controls/form-controls.component";
export const FORMS_ROUTE: Route[] = [
  {
    path: "",
    redirectTo: "formkit",
    pathMatch: "full",
  },
  {
    path: "formkit",
    component: FormControlsComponent,
  },
  {
    path: "wizard",
    component: WizardComponent,
  },
  {
    path: "editors",
    component: EditorsComponent,
  },
];
