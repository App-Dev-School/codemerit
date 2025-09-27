import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetModule, MatBottomSheetRef } from "@angular/material/bottom-sheet";
import { MatLineModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from '@angular/material/list';
import { Router } from "@angular/router";
import { AuthService } from "@core/service/auth.service";
import { ShareService } from "@core/service/share.service";
import { SnackbarService } from "@core/service/snackbar.service";
@Component({
    selector: 'app-share-bottom-sheet',
    templateUrl: 'share-bottom-sheet.html',
    styleUrls: ['./share-bottom-sheet.scss'],
    imports: [
        CommonModule,
        MatLineModule,
        MatBottomSheetModule,
        MatListModule,
        MatIconModule
    ]
})
export class ShareBottomSheetComponent {
    loading = false;
    loadingTxt = "";
    courseItem: any;
    constructor(
        public authService: AuthService,
        private snackService: SnackbarService,
        private router: Router,
        private shareService: ShareService,
        private _bottomSheetRef: MatBottomSheetRef<ShareBottomSheetComponent>,
        @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
    ) {
        console.log("SetDesignationBottomSheetComponent received", data);
        this.courseItem = data;
    }


    shareOnlyText() {
        this._bottomSheetRef.dismiss(null);
        this.shareService.shareText(
            this.data?.title,
            this.data?.text,
            this.data?.url
        );
    }

    shareWithHtml2Canvas() {
        this._bottomSheetRef.dismiss(null);
        try {
            this.shareService.shareCardAsImage(
            this.data?.elementId,
            this.data?.title,
            this.data?.text,
            this.data?.url,
        );
        } catch (error) {
             this.snackService.display('snackbar-dark', "Error Sharing "+error, 'bottom', 'center');
        }
    }

    shareWithDomToImage() {
        this._bottomSheetRef.dismiss(null);
        try {
            this.shareService.shareCardWithLink(
                this.data?.elementId,
                this.data?.text,
                this.data?.url,
            );
        } catch (error) {
            this.snackService.display('snackbar-dark', "Error Sharing "+error, 'bottom', 'center');
        }
    }

    dismiss(event: MouseEvent): void {
        this._bottomSheetRef.dismiss(null);
        event.preventDefault();
    }
}