import { DOCUMENT } from '@angular/common';
import {
  Component, ElementRef, Inject, OnInit, Renderer2,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfigService } from '@config';
import { AuthService, InConfiguration, Role, ThemeService } from '@core';
import { UnsubscribeOnDestroyAdapter } from '@shared';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [RouterLink],
})
export class HeaderComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  config!: InConfiguration;
  userName?: string;
  userImg?: string;
  userInitials = 'ME';
  imgError = false;
  homePage?: string;
  isFullScreen = false;
  isMobileMenuOpen = false;
  isSidebarCollapsed = false;

  // Full wordmark shown when sidebar is expanded
  logoFull = 'assets/images/logo-dark.png';
  // Icon/favicon mark shown when sidebar is collapsed to 60px
  logoIcon = 'assets/icon/favicon.png';

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    public sidebarService: SidebarService,
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
  ) {
    super();
  }

  ngOnInit() {
    this.config = this.configService.configData;
    const userRole = this.authService.currentUserValue.role;
    const user = this.authService.currentUserValue;
    const firstName = user.firstName ?? '';
    const lastName  = user.lastName  ?? '';
    this.userName = [firstName, lastName].filter(Boolean).join(' ') || 'User';
    this.userImg = user.userImage || null;
    const first = firstName.charAt(0).toUpperCase();
    const last  = lastName.charAt(0).toUpperCase();
    this.userInitials = (first + last) || 'ME';

    this.isSidebarCollapsed = localStorage.getItem('collapsed_menu') === 'true';

    if (userRole === Role.Admin) {
      this.homePage = 'admin/dashboard/main';
    } else if (userRole === Role.Subscriber) {
      this.homePage = 'dashboard';
    } else {
      this.homePage = 'admin/dashboard/main';
    }
  }

  callFullscreen() {
    if (!this.isFullScreen) {
      this.document.documentElement?.requestFullscreen?.();
    } else {
      this.document.exitFullscreen?.();
    }
    this.isFullScreen = !this.isFullScreen;
  }

  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLElement).classList.contains(className);
    if (hasClass) {
      this.isMobileMenuOpen = true;
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.isMobileMenuOpen = false;
      this.renderer.addClass(this.document.body, className);
    }
  }

  callSidemenuCollapse() {
    const isCollapsed = this.document.body.classList.contains('side-closed');
    if (isCollapsed) {
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'false');
      this.isSidebarCollapsed = false;
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
      localStorage.setItem('collapsed_menu', 'true');
      this.isSidebarCollapsed = true;
    }
  }

  toggleTheme() {
    this.themeService.toggle(this.document, this.renderer);
  }

  logout() {
    this.subs.sink = this.authService
      .logout('Logging out.')
      .subscribe((res) => {
        if (!res.success) this.router.navigate(['/authentication/signin']);
      });
  }
}
