import { Route } from '@angular/router';
import { Role } from '@core';
import { AuthGuard } from '@core/guard/auth.guard';
import { Page404Component } from './authentication/page404/page404.component';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';

export const APP_ROUTE: Route[] = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },
            {
                path: 'admin',
                canActivate: [AuthGuard],
                data: {
                    role: Role.Admin,
                },
                loadChildren: () =>
                    import('./admin/admin.routes').then((m) => m.ADMIN_ROUTE),
            },
            {
                path: 'dashboard',
                canActivate: [AuthGuard],
                data: {
                    role: Role.Subscriber,
                },
                loadChildren: () =>
                    import('./subscriber/subscriber.routes').then((m) => m.SUBSCRIBER_ROUTE),
            },
            {
                path: 'users',
                loadChildren: () =>
                    import('./users/users.routes').then((m) => m.USERS_ROUTE),
            },
            {
                path: 'forms',
                loadChildren: () =>
                    import('./forms/forms.routes').then((m) => m.FORMS_ROUTE),
            },
            {
                path: 'app',
                loadChildren: () =>
                    import('./pages/pages.routes').then(
                        (m) => m.PAGES_ROUTE
                    ),
            },
            {
                path: 'topics',
                loadChildren: () =>
                    import('./pages/topic-explorer/topic-explorer.routes').then((m) => m.TOPIC_ROUTE),
            },
        ],
    },
    {
        path: 'authentication',
        component: AuthLayoutComponent,
        loadChildren: () =>
            import('./authentication/auth.routes').then((m) => m.AUTH_ROUTE),
    },
    {
        path: "quiz",
        component: MainLayoutComponent,
        //component: AuthLayoutComponent,
        loadChildren: () =>
            import('./quiz/quiz.routes').then((m) => m.QUIZ_ROUTE),
    },
    {
        path: "learn",
        //component: MainLayoutComponent,
        //component: AuthLayoutComponent,
        loadChildren: () =>
            import('./learn/lesson.routes').then((m) => m.LESSON_ROUTE),
    },
    { path: '**', component: Page404Component },
];
