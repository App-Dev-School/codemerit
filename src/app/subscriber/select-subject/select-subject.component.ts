import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { MasterService } from '@core/service/master.service';
import { slideInOutAnimation } from '@shared/animations';
import { MySubjectsComponent } from '@shared/components/my-subjects/my-subjects.component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-select-subject',
  templateUrl: './select-subject.component.html',
  styleUrls: ['./select-subject.component.scss'],
  animations: [slideInOutAnimation],
  imports: [
    MatIcon,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MySubjectsComponent,
  ],
})
export class SelectSubjectComponent implements OnInit {
  showContent = true;
  subject = '';
  subjectData: any;
  subjects: Observable<any>;
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private master: MasterService,
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        // Only hide when navigating AWAY from this component
        const stayingHere = event.url.startsWith('/select-subject');
        if (!stayingHere) {
          this.showContent = false;
        }
      } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        // Only restore visibility when the final URL is still this component
        if (event.url.startsWith('/select-subject')) {
          this.showContent = true;
        }
      }
    });

    if (!this.master.subjects) {
      this.isLoading = true;
      this.master.fetchMasterDataFromAPI().subscribe({
        next: (masterData: any) => {
          if (!masterData.error && masterData.data?.subjects) {
            this.subjects = of(masterData.data.subjects);
            this.isLoading = false;
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Select Subject Get API Error:', error);
        },
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

  onSubscribe(subject: string) {
    console.log('SelectSubject @onSubscribe', subject);
  }

  onCancel() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const isSafe = returnUrl && !returnUrl.startsWith('/select-subject');
    this.router.navigateByUrl(isSafe ? returnUrl : '/dashboard', { replaceUrl: true });
  }
}
