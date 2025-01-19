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
                            label: 'Employees',
                            icon: 'pi pi-fw pi-users',
                            routerLink: ['users'],
                        },
                    ],
                },
                {
                    label: '',
                    items: [
                        {
                            label: 'Stores',
                            icon: 'pi pi-fw pi-home',
                            routerLink: ['branches'],
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
                }
            );
        }
    }
}
