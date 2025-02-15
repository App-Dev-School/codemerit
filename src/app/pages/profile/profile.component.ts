import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '@core';
import { MasterService } from '@core/service/master.service';
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    imports: [
        MatTabsModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
    ]
})
export class ProfileComponent {
  userName : string = "";
  userImg : string = "";
  userData: any;
  constructor(private authService: AuthService, private master: MasterService) {
    // constructor code
  }

  ngOnInit(){
    this.userName = this.authService.currentUserValue.firstName;
    this.userImg = this.authService.currentUserValue.userImage;
    this.master.getMockUserProfile().subscribe((profile)=>{
      this.userData = profile;
    });
  }
}
