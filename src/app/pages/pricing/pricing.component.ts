import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from '@core';
@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.scss'],
    imports: []
})
export class PricingComponent {
  userData: User;
  constructor(private auth: AuthService, private router: Router) {
    this.userData = this.auth.currentUserValue;
  }

  subscribe(plan:string){
  this.router.navigate(['/dashboard']);
  //teams - self rating should be done. Fill up internship form
  }

  signUp(){
  this.router.navigate(['/authentication/signup']);
  }
}
