import {
  Router,
  NavigationEnd,
  RouterLinkActive,
  RouterLink,
} from '@angular/router';
import { DOCUMENT, NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy,
} from '@angular/core';
import { RouteInfo } from './sidebar.metadata';
import { AuthService } from '@core';
import { NgScrollbar } from 'ngx-scrollbar';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [NgScrollbar, RouterLinkActive, RouterLink, NgClass],
})
export class SidebarComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit, OnDestroy
{
  public sidebarItems!: RouteInfo[];
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  listMaxHeight?: string;
  userFullName?: string;
  userImg?: string = 'assets/images/users/user.jpg';
  userDesignation?: string;
  headerHeight = 60;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private authService: AuthService,
    private router: Router,
    private sidebarService: SidebarService,
  ) {
    super();
    this.elementRef.nativeElement.closest('body');
    this.authService.currentUser.subscribe((user) => {
        if (user) {
          const firstName = user.firstName ?? '';
          const lastName  = user.lastName  ?? '';
          this.userFullName = [firstName, lastName].filter(Boolean).join(' ') || 'Guest User';
          this.userImg = user.userImage || 'assets/images/users/user.jpg';
          this.userDesignation = user.designation || 'New Joiner';
        } else {
          this.userFullName = 'Guest User';
          this.userImg = 'assets/images/users/user.jpg';
          this.userDesignation = 'New Joiner';
        }
    });
    this.subs.sink = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.renderer.removeClass(this.document.body, 'overlay-open');
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  windowResizecall() {
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, 'overlay-open');
    }
  }

  callToggleMenu(event: Event, length: number) {
    if (length > 0) {
      const parentElement = (event.target as HTMLInputElement).closest('li');
      const isActive = parentElement?.classList.contains('active');
      if (isActive) {
        this.renderer.removeClass(parentElement, 'active');
      } else {
        this.renderer.addClass(parentElement, 'active');
      }
    }
  }

  ngOnInit() {
    this.subs.sink = this.sidebarService
      .getRouteInfo()
      .subscribe((routes: RouteInfo[]) => {
        this.sidebarItems = routes;
      });

    this.setMenuHeight();
    this.checkStatuForResize(true);
    this.bodyTag = this.document.body;
  }

  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    this.listMaxHeight = (this.innerHeight - this.headerHeight) + '';
  }

  checkStatuForResize(_firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'ls-closed');
    } else {
      this.renderer.removeClass(this.document.body, 'ls-closed');
    }
  }

  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }

  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }

  logout() {
    this.subs.sink = this.authService.logout().subscribe((res) => {
      if (!res.success) {
        this.router.navigate(['/authentication/signin']);
      }
    });
  }
}
