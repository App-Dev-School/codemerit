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
                path: 'lms',
                canActivate: [AuthGuard],
                data: {
                    role: [Role.Subscriber, Role.Manager, Role.Admin],
                },
                loadChildren: () =>
                    import('./lms/lms.routes').then((m) => m.LMS_ROUTE),
            },
            {
                path: 'dashboard',
                canActivate: [AuthGuard],
                data: {
                    role: [Role.Subscriber, Role.Manager, Role.Admin],
                },
                loadChildren: () =>
                    import('./subscriber/subscriber.routes').then((m) => m.SUBSCRIBER_ROUTE),
            },
            {
                path: 'users',
                canActivate: [AuthGuard],
                data: {
                    role: [Role.Subscriber, Role.Manager, Role.Admin, Role.All],
                },
                loadChildren: () =>
                    import('./users/users.routes').then((m) => m.USERS_ROUTE),
            },
            {
                path: 'app',
                loadChildren: () =>
                    import('./pages/pages.routes').then(
                        (m) => m.PAGES_ROUTE
                    ),
            },
            {
                // No AuthGuard here on purpose — this is the public per-job-role landing
                // page and must stay visitor-accessible; it checks the session itself.
                path: 'jobRole/:course',
                loadComponent: () =>
                    import('./lms/job-roles/course-dashboard.component')
                        .then(m => m.CourseDashboardComponent)
            }
        ],
    },
    {
        path: 'authentication',
        component: AuthLayoutComponent,
        loadChildren: () =>
            import('./authentication/auth.routes').then((m) => m.AUTH_ROUTE),
    },
    {
        path: 'subject-skill-rating/:subjectId',
        loadComponent: () =>
            import('./shared/components/subject-skill-rating/subject-skill-rating.component')
                .then(m => m.SubjectSkillRatingComponent)
    },
    {
        path: "select-subject",
        //component: AuthLayoutComponent,
        loadComponent: () =>
            import('./subscriber/select-subject/select-subject.component')
                .then(m => m.SelectSubjectComponent)
    },
    {
        path: "select-job-role",
        //component: AuthLayoutComponent,
        loadComponent: () =>
            import('./subscriber/select-course/select-course.component')
                .then(m => m.SelectCourseComponent)
    },
    {
        path: "select-job-role-error",
        loadComponent: () =>
            import('./subscriber/select-course/select-course.component')
                .then(m => m.SelectCourseComponent)
    },
    {
        path: "quiz",
        //component: MainLayoutComponent,
        component: AuthLayoutComponent,
        loadChildren: () =>
            import('./quiz/quiz.routes').then((m) => m.QUIZ_ROUTE),
    },
    {
        path: "assessment",
        component: MainLayoutComponent,
        //component: AuthLayoutComponent,
        canActivate: [AuthGuard],
        loadChildren: () =>
            import('./assessment/assessment.routes').then((m) => m.ASSESSMENT_ROUTE),
    },
    {
        path: "learn/overview/:qcode",
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                loadComponent: () => import('./learn/lesson/lesson.page').then(c => c.LessonPage),
            },
        ],
    },
    {
        path: "learn",
        component: MainLayoutComponent,
        //component: AuthLayoutComponent,
        loadChildren: () =>
            import('./lms/lessons/lessons.routes').then((m) => m.LESSONS_ROUTE),
    },
    {
        path: 'interview-panel/:id',
        //component: AuthLayoutComponent,
        loadChildren: () =>
            import('./pages/interview-panel-container/interview.routes').then((m) => m.INTERVIEW_ROUTE),
        // loadComponent: () =>
        //     import('./pages/interview-panel-container/interview-panel-container.component').then(
        //         (m) => m.InterviewPanelContainerComponent
        //     ),
    },
    { path: '**', component: Page404Component },
];
