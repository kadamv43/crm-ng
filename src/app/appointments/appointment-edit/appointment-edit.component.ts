import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap, Route, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from 'src/app/services/api.service';
import { AppointmentService } from 'src/app/services/appointment/appointment.service';
import { CommonService } from 'src/app/services/common/common.service';
import { PatientService } from 'src/app/services/patient/patient.service';

@Component({
    selector: 'app-appointment-edit',
    templateUrl: './appointment-edit.component.html',
    styleUrl: './appointment-edit.component.scss',
    providers: [MessageService],
})
export class AppointmentEditComponent {
    appointmentForm: FormGroup;
    minDate;
    serviceList: any = [];
    doctors: any = [];
    filteredItems: any = [];
    selectedPatient;
    id: string;
    patient_id;
    selectedServicesObjects = [];

    conditions = [
        { name: 'Hypertension', code: 'Hypertension' },
        { name: 'Diabetes', code: 'Diabetes' },
        { name: 'Thyroid', code: 'Thyroid' },
    ];

    conditionSince = [
        { name: '6 months', code: '6 months' },
        { name: '1 year', code: '1 year' },
        { name: 'more than 1 year', code: 'more than 1 year' },
    ];

    treatment = [
        { name: 'Diet', code: 'Diet' },
        { name: 'Medications', code: 'Medications' },
        { name: 'Diet and Medication', code: 'Diet and Medication' },
    ];

    genders = [
        { name: 'Male', code: 'Male' },
        { name: 'Female', code: 'Female' },
    ];

    bloodGroups = [
        { name: 'A+', code: 'A+' },
        { name: 'O+', code: 'O+' },
        { name: 'B+', code: 'B+' },
        { name: 'AB+', code: 'AB+' },
        { name: 'A-', code: 'A-' },
        { name: 'O-', code: 'O-' },
        { name: 'B-', code: 'B-' },
        { name: 'AB-', code: 'AB-' },
    ];

    constructor(
        private fb: FormBuilder,
        private api: ApiService,
        private patientService: PatientService,
        private commonServie: CommonService,
        private appointmentService: AppointmentService,
        private toast: MessageService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.appointmentForm = fb.group({
            patientInfo: this.fb.group({
                first_name: ['', Validators.required],
                last_name: ['', Validators.required],
                mobile: ['', [Validators.required, this.mobileNumberValidator]],
                email: ['', Validators.email],
                gender: ['', Validators.required],
                dob: [''],
                age: ['', Validators.pattern(/^\d{1,2}$/)],
                blood_group: [''],
            }),
            appointmentInfo: this.fb.group({
                services: ['', Validators.required],
                doctor: [''],
                appointment_date: [new Date(), Validators.required],
                appointment_time: [new Date(), Validators.required],
                reason: [''],
            }),
        });
    }
    ngOnInit(): void {
        this.minDate = new Date();

        this.api.getProducts().subscribe((res) => {
            this.serviceList = res;
        });

        this.api.getDoctors().subscribe((res: any) => {
            this.doctors = res.map((item) => {
                return { name: item.first_name + item.last_name,...item };
            });
        });

        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.appointmentService.findById(this.id).subscribe((res: any) => {
                this.patient_id = res.patient_id;

                this.appointmentForm.get('appointmentInfo').patchValue({
                    appointment_date: new Date(res.appointment_date),
                    appointment_time: new Date(res.appointment_time),
                    services: res?.services,
                    doctor: res?.doctor?.id,
                    reason: res?.reason,
                });

                this.appointmentForm.get('patientInfo').patchValue({
                    first_name: res?.patient?.first_name,
                    last_name: res?.patient?.last_name,
                    mobile: res?.patient?.mobile,
                    email: res?.patient?.email,
                    gender: res?.patient?.gender,
                    dob: res?.patient?.dob ? new Date(res?.patient?.dob) : '',
                    age: res?.patient?.age,
                    blood_group: res?.patient?.blood_group,
                });
            });
        });
    }

    get first_name() {
        return this.appointmentForm.get('patientInfo.first_name');
    }
    get last_name() {
        return this.appointmentForm.get('patientInfo.last_name');
    }
    get mobile() {
        return this.appointmentForm.get('patientInfo.mobile');
    }

    get email() {
        return this.appointmentForm.get('patientInfo.email');
    }

    get gender() {
        return this.appointmentForm.get('patientInfo.gender');
    }

    get services() {
        return this.appointmentForm.get('appointmentInfo.services');
    }

    get appointment_date() {
        return this.appointmentForm.get('appointmentInfo.appointment_date');
    }

    get appointment_time() {
        return this.appointmentForm.get('appointmentInfo.appointment_time');
    }

    get age() {
        return this.appointmentForm.get('patientInfo.age');
    }

    mobileNumberValidator(control: AbstractControl): ValidationErrors | null {
        const mobilePattern = /^[0-9]{10}$/;
        return mobilePattern.test(control.value)
            ? null
            : { invalidMobile: true };
    }

    search(event: any) {
        const query = event.query;
        this.patientService.globalSearch(query).subscribe((data: []) => {
            this.filteredItems = data.map((item: any) => {
                return {
                    fullname: `${item.first_name}  ${item.last_name}`,
                    ...item,
                };
            });
        });
    }

    onItemSelected(event: any) {
        this.appointmentForm.get('patientInfo').patchValue({
            first_name: this.selectedPatient.first_name,
            last_name: this.selectedPatient.last_name,
            mobile: this.selectedPatient.mobile,
            gender: this.selectedPatient.gender,
            email: this.selectedPatient.email,
            age: this.selectedPatient.age,
            blood_group: this.selectedPatient.blood_group,
            dob: new Date(this.selectedPatient.dob),
        });
        console.log('Selected item:', this.selectedPatient);
        // Add your logic here, e.g., update other parts of the form, make additional API calls, etc.
    }

    async submitAppointment() {
        this.appointmentForm.markAllAsTouched();
        if (this.appointmentForm.valid) {
            let appointment: any = {};
            appointment = this.appointmentForm.get('appointmentInfo').value;
            appointment.patient_id = this.patient_id;
            appointment.doctor_id = appointment.doctor;
            //appointment.services = this.selectedServicesObjects.length > 0 ?? appointment.services
            this.appointmentService
                .update(this.id, appointment)
                .subscribe((res) => {
                    this.toast.add({
                        key: 'tst',
                        severity: 'success',
                        summary: 'Success Message',
                        detail: 'Appointment updated successfully',
                    });
                    setTimeout(() => {
                        this.router.navigateByUrl('appointments');
                    }, 2000);
                });
        }
    }

    onChange(e) {
        this.selectedServicesObjects = e.value;
        console.log(e.value);
    }
}
