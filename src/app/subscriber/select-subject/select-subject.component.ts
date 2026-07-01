import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { MySubjectsComponent } from '@shared/components/my-subjects/my-subjects.component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-select-subject',
  templateUrl: './select-subject.component.html',
  styleUrls: ['./select-subject.component.scss'],
  animations: [
    trigger('overlayFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('180ms ease', style({ opacity: 0 })),
      ]),
    ]),
    trigger('panelSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(28px)' }),
        animate('320ms cubic-bezier(0.22,1,0.36,1)', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' })),
      ]),
    ]),
  ],
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MySubjectsComponent,
  ],
})
export class SelectSubjectComponent implements OnInit {
  showContent = true;
  subject = '';
  subjects: Observable<any>;
  isLoading = true;
  searchQuery = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private master: MasterService,
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const stayingHere = event.url.startsWith('/select-subject');
        if (!stayingHere) this.showContent = false;
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        if (event.url.startsWith('/select-subject')) this.showContent = true;
      }
    });

    if (!this.master.subjects?.length) {
      this.isLoading = true;
      this.master.fetchMasterDataFromAPI().subscribe({
        next: (masterData: any) => {
          if (!masterData?.error && masterData?.data?.subjects) {
            this.subjects = of(masterData.data.subjects);
          }
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; },
      });
    } else {
      this.subjects = of(this.master.subjects);
      this.isLoading = false;
    }
  }

  onSubjectChange(subject: string) {
    this.subject = subject ?? '';
    this.router.navigate(['/dashboard/learn', this.subject]);
  }

  onCancel() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const isSafe = returnUrl && !returnUrl.startsWith('/select-subject');
    this.router.navigateByUrl(isSafe ? returnUrl : '/dashboard', { replaceUrl: true });
  }
}
