import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];
    role: string;

    constructor(public layoutService: LayoutService) {}

    ngOnInit() {
        this.role = localStorage.getItem('role');

        this.model = [
            {
                label: '',
                items: [
                    {
                        label: 'Dashboard',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/'],
                    },
                ],
            },
        ];

        if (this.role == 'superadmin') {
            this.model.push(
                {
                    label: '',
                    items: [
                        {
                            label: 'Admins',
                            icon: 'pi pi-fw pi-users',
                            routerLink: ['admins'],
                        },
                    ],
                },
                {
                    label: '',
                    items: [
                        {
                            label: 'Company',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['branches'],
                        },
                    ],
                }
            );
        } else if (this.role == 'admin') {
            this.model.push(
                {
                    label: '',
                    items: [
                        {
                            label: 'Employees',
                            icon: 'pi pi-fw pi-users',
                            routerLink: ['users'],
                        },
                    ],
                },
                {
                    label: '',
                    icon: 'pi pi-fw pi-briefcase',
                    items: [
                        {
                            label: 'Bank Details',
                            icon: 'pi pi-fw pi-money-bill',
                            items: [
                                {
                                    label: 'Bank',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['banks'],
                                },
                                {
                                    label: 'UPI',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['upi'],
                                },
                                {
                                    label: 'Payment Link',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['payment-links'],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: '',
                    icon: 'pi pi-fw pi-briefcase',
                    items: [
                        {
                            label: 'Incentive',
                            icon: 'pi pi-fw pi-money-bill',
                            items: [
                                {
                                    label: 'Spot Incentive',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['spot-incentives'],
                                },
                                {
                                    label: 'Monthly Incentive',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['monthly-incentives'],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: '',
                    icon: 'pi pi-fw pi-briefcase',
                    items: [
                        {
                            label: 'Leads Details',
                            icon: 'pi pi-fw pi-money-bill',
                            items: [
                                {
                                    label: 'Leads',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['leads'],
                                },
                                {
                                    label: 'Hot Leads',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['hot-leads'],
                                },
                            ],
                        },
                    ],
                }
            );
        } else if (this.role == 'employee' || this.role == 'teamlead') {
            this.model.push(
                {
                    label: '',
                    icon: 'pi pi-fw pi-briefcase',
                    items: [
                        {
                            label: 'Bank Details',
                            icon: 'pi pi-fw pi-money-bill',
                            items: [
                                {
                                    label: 'Bank',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['banks'],
                                },
                                {
                                    label: 'UPI',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['upi'],
                                },
                                {
                                    label: 'Payment Link',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['payment-links'],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: '',
                    icon: 'pi pi-fw pi-briefcase',
                    items: [
                        {
                            label: 'Incentive',
                            icon: 'pi pi-fw pi-money-bill',
                            items: [
                                {
                                    label: 'Spot Incentive',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['spot-incentives'],
                                },
                                {
                                    label: 'Monthly Incentive',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['monthly-incentives'],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: '',
                    icon: 'pi pi-fw pi-briefcase',
                    items: [
                        {
                            label: 'Leads Details',
                            icon: 'pi pi-fw pi-money-bill',
                            items: [
                                {
                                    label: 'Expected Payment',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['leads', 'expected-payment'],
                                },
                                {
                                    label: 'Follow Up',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['leads', 'follow-up'],
                                },
                                {
                                    label: 'My Leads',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['leads', 'my-leads'],
                                },
                            ],
                        },
                    ],
                }
            );
        }
    }
}
