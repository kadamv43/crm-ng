import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BlogsService } from 'src/app/services/blogs/blogs.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-branch-create',
    templateUrl: './branch-create.component.html',
    styleUrl: './branch-create.component.scss',
    providers: [MessageService],
})
export class BranchCreateComponent {
    branchForm: FormGroup;
    imageBasePath = environment.uploadPath;
    selectedFile: File | null = null;
    imagePreview: string | ArrayBuffer | null = null;

    constructor(
        private branchesService: BranchesService,
        private toast: MessageService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.branchForm = this.fb.group({
            name: ['', Validators.required],
            address: ['', Validators.required],
        });
    }

    get name() {
        return this.branchForm.get('name');
    }

    get address() {
        return this.branchForm.get('address');
    }

    async submit() {
        this.branchForm.markAllAsTouched();
        if (this.branchForm.valid) {
            this.branchesService
                .create(this.branchForm.value)
                .subscribe((res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Branch created successfully',
                    });
                    setTimeout(() => {
                        this.router.navigateByUrl('branches');
                    }, 2000);
                });
        }
    }
}
