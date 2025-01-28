import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommonService } from 'src/app/services/common/common.service';
import { LeadsService } from 'src/app/services/leads/leads.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';
import { UsersService } from 'src/app/services/users/users.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-leads-create',
    templateUrl: './leads-create.component.html',
    styleUrl: './leads-create.component.scss',
    providers: [MessageService],
})
export class LeadsCreateComponent implements OnInit {
    form: FormGroup;
    users: any = [];
    totalRecords = 0;

    constructor(
        private leadsService: LeadsService,
        private userLeadsService: UserLeadsService,
        private userService: UsersService,
        private commonService: CommonService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            mobile: ['', [Validators.required]],
            user: ['', Validators.required],
        });
    }
    ngOnInit(): void {
        this.getUsers();
    }

    getUsers() {
        const page = 0;
        const size = 50;

        let params = {};

        params['page'] = page;
        params['size'] = size;
        let queryParams = this.commonService.getHttpParamsByJson(params);

        this.userService.getAll(queryParams).subscribe((data: any) => {
            this.users = data.data.map((element) => {
                return {
                    name: element?.first_name + ' ' + element?.last_name,
                    code: element?._id,
                };
            });
            this.totalRecords = data.total;
        });
    }

    get mobile() {
        return this.form.get('mobile');
    }

    get user() {
        return this.form.get('user');
    }

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.userLeadsService.create(this.form.value).subscribe((res) => {
                this.toast.add({
                    key: 'tst',
                    severity: 'success',
                    summary: 'Success Message',
                    detail: 'Lead created successfully',
                });
                setTimeout(() => {
                    this.router.navigateByUrl('leads');
                }, 2000);
            });
        }
    }
}
