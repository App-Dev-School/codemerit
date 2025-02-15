import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/core/service/auth.service";
@Component({
  selector: "app-no-connection",
  templateUrl: "./no-connection.component.html",
  styleUrls: ["./no-connection.component.scss"],
})
export class NoConnectionComponent implements OnInit {
  isInternetConnection = false;
  constructor(private location: Location, 
    public authService: AuthService) {}

  ngOnInit() {
    // this.authService.internetConnect.subscribe(res=>{
    //  if(res){
    //   this.isInternetConnection = res;
    //   setTimeout(() => {
    //     this.goBack();
    //    }, 500);
    //  }else{
    //   this.isInternetConnection = false;
    //  }
    // });
      //this.authService.isConnectedToInternet
  }

  goBack() {
    this.location.back();
  }  

}
