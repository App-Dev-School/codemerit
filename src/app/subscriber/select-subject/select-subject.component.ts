import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationCancel,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { SubjectPickerComponent } from '@shared/components/select-subject/subject-picker.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-subject',
  templateUrl: './select-subject.component.html',
  styleUrls: ['./select-subject.component.scss'],
  imports: [
    SubjectPickerComponent,
  ],
})
export class SelectSubjectComponent implements OnInit, OnDestroy {
  /** Drives the picker's own slide-in/out — false just before we navigate away
      so its :leave animation plays instead of the route swap cutting it off. */
  open = true;

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          const stayingHere = event.url.startsWith('/select-subject');
          if (!stayingHere) this.open = false;
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
          if (event.url.startsWith('/select-subject')) this.open = true;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubjectChange(subject: any) {
    const slug = subject?.slug ?? '';
    if (!slug) return;
    this.router.navigate(['/dashboard/learn', slug]);
  }

  onCancel() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const isSafe = returnUrl && !returnUrl.startsWith('/select-subject');
    this.router.navigateByUrl(isSafe ? returnUrl : '/dashboard', { replaceUrl: true });
  }
}
