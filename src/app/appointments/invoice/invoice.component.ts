import { HttpClient } from '@angular/common/http';
import {
    AfterViewInit,
    Component,
    ElementRef,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import jsPDF from 'jspdf';

import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ProductService } from 'src/app/demo/service/product.service';
import { AppointmentService } from 'src/app/services/appointment/appointment.service';
import { environment } from 'src/environments/environment';
import { saveAs } from 'file-saver';
import { DatePipe } from '@angular/common';
import { dialog, app } from '@electron/remote'; // Correct import
import * as fs from 'fs';
import * as path from 'path';
import { Buffer } from 'buffer'; // Import Buffer
import { ElectronService } from 'src/app/services/electron.service';
import { InvoicesService } from 'src/app/services/invoices/invoices.service';
import { MessageService } from 'primeng/api';
import html2canvas from 'html2canvas';
import { it } from 'node:test';

@Component({
    selector: 'app-invoice',
    templateUrl: './invoice.component.html',
    providers: [MessageService],
    styleUrl: './invoice.component.scss',
})
export class InvoiceComponent implements OnInit {
    id;
    patient_id;
    appointmenData: any = [];
    total = 0;
    invoiceForm: FormGroup;
    extraForm: FormGroup;
    new_total = 0;
    role = '';

    serviceTotal = 0;
    extraSum = 0;
    paymentModes = [
        { name: 'Cash', code: 'Cash' },
        { name: 'Debit Card', code: 'Debit Card' },
        { name: 'Credit Card', code: 'Credit Card' },
        { name: 'UPI', code: 'UPI' },
    ];

    private navElementRef: ElementRef;
    products = [];
    constructor(
        private route: ActivatedRoute,
        private appointmentService: AppointmentService,
        private fb: FormBuilder,
        private http: HttpClient,
        private electonService: ElectronService,
        private toast: MessageService,
        private router: Router,
        private invoiceService: InvoicesService
    ) {
        this.invoiceForm = fb.group({
            paid: [0],
            balance: [0, Validators.required],
            received_by: ['', Validators.required],
            payment_mode: ['', Validators.required],
            discount: [0],
        });

        this.extraForm = fb.group({
            extras: this.fb.array([]),
        });

        this.onChanges();
    }

    setMaxValidation(maxValue: number): void {
        this.invoiceForm
            .get('paid')
            ?.setValidators([
                Validators.required,
                Validators.pattern(/^\d+$/),
                Validators.max(maxValue),
            ]);
        this.invoiceForm.get('paid')?.updateValueAndValidity(); // Update the validation
    }
    onChanges(): void {
        this.invoiceForm.get('paid')?.valueChanges.subscribe((value) => {
            if (value && value > 0) {
                this.invoiceForm
                    .get('balance')
                    ?.setValue(this.new_total - Number(value));
            } else {
                this.invoiceForm.get('balance')?.setValue(0);
            }
        });

        this.invoiceForm.get('discount')?.valueChanges.subscribe((value) => {
            if (value && value > 0) {
                this.new_total = this.total - value;
            } else {
                this.new_total = this.total;
            }
            this.invoiceForm.get('balance')?.setValue(this.new_total);
        });

        this.extraForm.get('extras')?.valueChanges.subscribe((value) => {
            this.extraSum = this.extras.value.reduce(
                (sum, item) => sum + Number(item.price),
                0
            );
            console.log(this.extraSum);
        });
    }

    get balance() {
        return this.invoiceForm.get('balance');
    }

    get totalma() {
        console.log(this.extras.value);
        return this.extras.value;
    }
    get paid() {
        return this.invoiceForm.get('paid');
    }

    get payment_mode() {
        return this.invoiceForm.get('payment_mode');
    }

    get received_by() {
        return this.invoiceForm.get('received_by');
    }

    get discount() {
        return this.invoiceForm.get('discount');
    }

    get extras(): FormArray {
        return this.extraForm.get('extras') as FormArray;
    }

    ngOnInit(): void {
        this.role = localStorage.getItem('role') ?? '';

        this.route.paramMap.subscribe((params: ParamMap) => {
            this.id = params.get('id');
            this.appointmentService.findById(this.id).subscribe((res: any) => {
                console.log('vk', res);

                if (res?.invoice) {
                    this.total = res?.invoice?.total_amount;
                    // this.new_total = res?.invoice?.total;
                    this.invoiceForm
                        ?.get('discount')
                        .setValue(res?.invoice?.discount ?? 0);
                    this.invoiceForm
                        ?.get('paid')
                        .setValue(res?.invoice?.paid ?? 0);
                    // this.invoiceForm
                    //     ?.get('balance')
                    //     .setValue(res?.invoice?.balance ?? 0);
                    this.invoiceForm
                        ?.get('received_by')
                        .setValue(res?.invoice?.received_by ?? '');

                    this.invoiceForm
                        ?.get('payment_mode')
                        .setValue(res?.invoice?.payment_mode ?? '');

                    const names = res?.services.map((item) => item.name);

                    const pert = res?.invoice?.particulars.map(
                        (item) => item.name
                    );

                    const unique = this.getUniqueElements(names, pert);
                    // console.log(unique)

                    const extras = res?.invoice?.particulars.filter((item) =>
                        unique.includes(item.name)
                    );

                    extras.forEach((element) => {
                        this.addItem(element.name, element.price);
                    });
                    console.log(extras);
                    // console.log(pert);
                    let services = res?.services.map((element, i) => {
                        this.serviceTotal =
                            this.serviceTotal + Number(element.price);
                        return { key: i + 1, ...element };
                    });

                    res.services = services;
                    this.appointmenData = res;
                    this.appointmenData.total = this.total;
                    this.setMaxValidation(this.total);
                } else {
                    // let total = 0;
                    let services = res?.services.map((element, i) => {
                        this.serviceTotal =
                            this.serviceTotal + Number(element.price);
                        return { key: i + 1, ...element };
                    });

                    res.services = services;
                    this.appointmenData = res;
                    this.total = this.serviceTotal;
                    this.new_total = this.serviceTotal;;
                    this.appointmenData.total = this.serviceTotal;;
                    this.setMaxValidation(this.total);
                }

                //this.balance =  total - this.paid
                console.log(this.appointmenData);
            });
        });

        // this.productService.getProducts().then((data) => {
        //     this.products = data;
        // });
    }

    addItem(name = '', price = 0): void {
        const control = this.createItem(name, price);
        this.extras.push(control);
    }

    createItem(name, price): FormGroup {
        return this.fb.group({
            name: [name, [Validators.required]],
            price: [price, [Validators.required, Validators.pattern(/^\d+$/)]],
        });
    }

    removeItem(index: number): void {
        // if (this.extras.length > 1) {
        this.extras.removeAt(index);
        this.total = this.serviceTotal + this.extraSum;

        // }
    }

    getUniqueElements(arr1, arr2) {
        const uniqueArr1 = arr1.filter((item) => !arr2.includes(item));
        const uniqueArr2 = arr2.filter((item) => !arr1.includes(item));
        return [...uniqueArr1, ...uniqueArr2];
    }

    addExtra() {
        let length = this.appointmenData.services.length;
        console.log(this.appointmenData.services);
        this.appointmenData.services.push({
            key: length + 1,
            name: '',
            price: '',
        });
    }

    onExtraPriceChange(i) {
        console.log(this.extraSum);
        if (!isNaN(this.extraSum)) {
            this.total = this.serviceTotal + this.extraSum;
        }
    }

    saveAndPreview() {
        this.extraForm.markAllAsTouched();
        console.log(this.extraForm.value);
        this.invoiceForm.markAllAsTouched();
        if (this.invoiceForm.valid) {
            let invoiceData = {
                appointment: this.appointmenData?._id,
                patient: this.appointmenData?.patient?._id,
                doctor: this.appointmenData?.doctor?._id,
                total_amount: this.total,
                paid: this.paid.value,
                balance: this.balance.value,
                discount: this.discount.value,
                payment_mode: this.payment_mode.value,
                received_by: this.received_by.value,
                particulars: [],
            };

            invoiceData.particulars = this.appointmenData.services.map(
                (item) => {
                    return { name: item.name, price: item.price };
                }
            );

            this.extraForm.get('extras').value.forEach((item) => {
                invoiceData.particulars.push(item);
            });

            this.invoiceService.create(invoiceData).subscribe((res: any) => {
                this.router.navigate([
                    'appointments',
                    'preview-invoice',
                    res?._id,
                ]);
            });
        }
    }
}
