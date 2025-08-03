import { Component } from '@angular/core';
import { AuthService } from '@core';
@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.scss'],
    imports: []
})
export class PricingComponent {
  constructor(private auth: AuthService) {
    // constructor code
  }

  signUp(){
  //if visitor launch a dialog based login component
  //else show membership details
  }
}
