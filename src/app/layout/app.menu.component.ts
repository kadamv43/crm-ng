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
                },
                {
                    label: '',
                    items: [
                        {
                            label: 'Reports',
                            icon: 'pi pi-fw pi-file-word',
                            routerLink: ['reports'],
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
                                {
                                    label: 'Day Offer',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['day-offer'],
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
                            label: 'Leads',
                            icon: 'pi pi-fw pi-megaphone',
                            items: [
                                {
                                    label: 'Leads',
                                    icon: 'pi pi-fw pi-megaphone',
                                    routerLink: ['leads'],
                                },
                                {
                                    label: 'Assigned Leads',
                                    icon: 'pi pi-fw pi-megaphone',
                                    routerLink: ['leads', 'assigned-leads'],
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
                            label: 'Hot leads',
                            icon: 'pi pi-fw pi-bolt',
                            items: [
                                {
                                    label: 'Hot Leads',
                                    icon: 'pi pi-fw pi-bolt',
                                    routerLink: ['hot-leads'],
                                },
                                {
                                    label: 'Assigned Leads',
                                    icon: 'pi pi-fw pi-bolt',
                                    routerLink: ['leads', 'assigned-hot-leads'],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: '',
                    items: [
                        {
                            label: 'Reports',
                            icon: 'pi pi-fw pi-file-word',
                            routerLink: ['reports'],
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
                                {
                                    label: 'Day Offer',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['day-offer'],
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
                                {
                                    label: 'My Hot Leads',
                                    icon: 'pi pi-fw pi-money-bill',
                                    routerLink: ['leads', 'my-hot-leads'],
                                },
                            ],
                        },
                    ],
                },
                {
                    label: '',
                    items: [
                        {
                            label: 'Reports',
                            icon: 'pi pi-fw pi-file-word',
                            routerLink: ['reports'],
                        },
                    ],
                }
            );
        }
    }
}
