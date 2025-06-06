import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './demo/components/notfound/notfound.component';
import { AppLayoutComponent } from './layout/app.layout.component';
import { AuthGuard } from './auth.guard';

@NgModule({
    imports: [
        RouterModule.forRoot(
            [
                {
                    path: '',
                    component: AppLayoutComponent,
                    children: [
                        {
                            path: '',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import(
                                    './demo/components/dashboard/dashboard.module'
                                ).then((m) => m.DashboardModule),
                        },
                        {
                            path: 'appointments',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import(
                                    './appointments/appointments.module'
                                ).then((m) => m.AppointmentsModule),
                        },
                        {
                            path: 'users',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./users/users.module').then(
                                    (m) => m.UsersModule
                                ),
                        },
                        {
                            path: 'products',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./products/products.module').then(
                                    (m) => m.ProductsModule
                                ),
                        },
                        {
                            path: 'doctors',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./doctors/doctors.module').then(
                                    (m) => m.DoctorsModule
                                ),
                        },
                        {
                            path: 'patients',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./patients/patients.module').then(
                                    (m) => m.PatientsModule
                                ),
                        },
                        {
                            path: 'invoices',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./invoices/invoices.module').then(
                                    (m) => m.InvoicesModule
                                ),
                        },
                        {
                            path: 'contact-details',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import(
                                    './contact-details/contact-details.module'
                                ).then((m) => m.ContactDetailsModule),
                        },
                        {
                            path: 'blogs',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./blog/blog.module').then(
                                    (m) => m.BlogModule
                                ),
                        },
                        {
                            path: 'banks',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./bank/bank.module').then(
                                    (m) => m.BankModule
                                ),
                        },
                        {
                            path: 'hot-leads',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./hot-leads/hot-leads.module').then(
                                    (m) => m.HotLeadsModule
                                ),
                        },
                        {
                            path: 'leads',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./leads/leads.module').then(
                                    (m) => m.LeadsModule
                                ),
                        },
                        {
                            path: 'spot-incentives',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import(
                                    './spot-incentive/spot-incentive.module'
                                ).then((m) => m.SpotIncentiveModule),
                        },
                        {
                            path: 'monthly-incentives',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import(
                                    './monthly-incentive/monthly-incentive.module'
                                ).then((m) => m.MonthlyIncentiveModule),
                        },
                        {
                            path: 'day-offer',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./day-offer/day-offer.module').then(
                                    (m) => m.DayOfferModule
                                ),
                        },
                        {
                            path: 'admins',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./admins/admins.module').then(
                                    (m) => m.AdminsModule
                                ),
                        },
                        {
                            path: 'payment-links',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import(
                                    './payment-link/payment-link.module'
                                ).then((m) => m.PaymentLinkModule),
                        },
                        {
                            path: 'upi',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./upi/upi.module').then(
                                    (m) => m.UpiModule
                                ),
                        },
                        {
                            path: 'branches',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./branch/branch.module').then(
                                    (m) => m.BranchModule
                                ),
                        },
                        {
                            path: 'gallery',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./gallery/gallery.module').then(
                                    (m) => m.GalleryModule
                                ),
                        },
                        {
                            path: 'banners',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./banners/banners.module').then(
                                    (m) => m.BannersModule
                                ),
                        },
                        {
                            path: 'reports',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import('./reports/reports.module').then(
                                    (m) => m.ReportsModule
                                ),
                        },
                        {
                            path: 'change-password',
                            canActivate: [AuthGuard],
                            loadChildren: () =>
                                import(
                                    './change-password/change-password.module'
                                ).then((m) => m.ChangePasswordModule),
                        },
                    ],
                },
                {
                    path: 'auth',
                    loadChildren: () =>
                        import('./auth/auth.module').then((m) => m.AuthModule),
                },
                { path: 'notfound', component: NotfoundComponent },
                { path: '**', redirectTo: '/notfound' },
            ],
            {
                scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled',
                onSameUrlNavigation: 'reload',
            }
        ),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
