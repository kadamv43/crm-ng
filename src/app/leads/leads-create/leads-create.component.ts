import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { an } from '@fullcalendar/core/internal-common';
import { MessageService } from 'primeng/api';
import { BlogsService } from 'src/app/services/blogs/blogs.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { CommonService } from 'src/app/services/common/common.service';
import { HotLeadsService } from 'src/app/services/hot-leads/hot-leads.service';
import { LeadsService } from 'src/app/services/leads/leads.service';
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
    imageBasePath = environment.uploadPath;
    selectedFile: File | null = null;
    users: any = [];
    totalRecords = 0;
    imagePreview: string | ArrayBuffer | null = null;

    constructor(
        private leadsService: LeadsService,
        private userService: UsersService,
        private commonService: CommonService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.form = this.fb.group({
            mobile: ['', [Validators.required]],
            user: ['',Validators.required],
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
        params['role'] = 'employee';

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

    mobileNumberValidator(control: AbstractControl): ValidationErrors | null {
        const mobilePattern = /^[0-9]{10}$/;
        if (control.value == '') {
            return null;
        }
        return mobilePattern.test(control.value)
            ? null
            : { invalidMobile: true };
    }

    async submit() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.leadsService.create(this.form.value).subscribe((res) => {
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
