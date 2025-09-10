import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ContactDetailsService } from 'src/app/services/contact-details/contact-details.service';

@Component({
    selector: 'app-edit-contact-details',
    templateUrl: './edit-contact-details.component.html',
    styleUrl: './edit-contact-details.component.scss',
    providers: [MessageService],
})
export class EditContactDetailsComponent {
    contactForm: FormGroup;
    id: string;

    constructor(
        private fb: FormBuilder,
        private contactDetailsService: ContactDetailsService,
        private toast: MessageService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.contactForm = fb.group({
            mobile_numbers: ['', Validators.required],
            address: ['', Validators.required],
            facebook_link: ['', [Validators.required,this.urlValidator]],
            youtube_link: ['', [Validators.required,this.urlValidator]],
            instagram_link: ['', [Validators.required,this.urlValidator]],
            email: ['', [Validators.email, Validators.required]],
        });
    }
    ngOnInit(): void {
        this.contactDetailsService.getAll().subscribe((res: any) => {
            console.log(res);
            if (res.length > 0) {
                this.id = res[0]?._id;
                let data = res[0];
                this.contactForm.patchValue({
                    mobile_numbers: data.mobile_numbers.join(),
                    address: data.address,
                    facebook_link: data.facebook_link,
                    youtube_link: data.youtube_link,
                    instagram_link: data.instagram_link,
                    email: data.email,
                });
            } else {
                this.contactDetailsService
                    .create({
                        mobile_numbers: [],
                        address: '',
                        facebook_link: '',
                        youtube_link: '',
                        instagram_link: '',
                        email: '',
                    })
                    .subscribe((res:any)=>{
                      this.id = res?._id;
                    });
            }
        });
    }

    urlValidator(control: AbstractControl): ValidationErrors | null {
        const urlPattern =
            /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(:\d{1,5})?(\/.*)?$/i;
        const value = control.value;
        if (!value || urlPattern.test(value)) {
            return null; // Valid
        }
        return { invalidUrl: true }; // Invalid
    }

    get mobile_numbers() {
        return this.contactForm.get('mobile_numbers');
    }
    get address() {
        return this.contactForm.get('address');
    }
    get facebook_link() {
        return this.contactForm.get('facebook_link');
    }

    get youtube_link() {
        return this.contactForm.get('youtube_link');
    }

    get instagram_link() {
        return this.contactForm.get('instagram_link');
    }

    get email() {
        return this.contactForm.get('email');
    }

    submitUser() {
        this.contactForm.markAllAsTouched();
        let user = this.contactForm.value;
        user.mobile_numbers = user.mobile_numbers.split(',')
        console.log(user);

        if (this.contactForm.valid) {
            this.contactDetailsService
                .update(this.id, user)
                .subscribe((res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Contact Details updated successfully',
                    });
                });
        }
    }
}
