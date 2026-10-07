import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

// HTTP responses are asynchronous; mimic that so change detection behaves as in the app.
const respond = (value: any) => of(value).pipe(delay(0));
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';

import { ReportListComponent, MAX_EXPORT_ROWS } from './report-list.component';
import { MessageService } from 'primeng/api';
import { ReportsModule } from '../reports.module';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { UsersService } from 'src/app/services/users/users.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';
import { AppointmentService } from 'src/app/services/appointment/appointment.service';

const LEADS = [
    {
        _id: '1',
        is_hot_lead: false,
        userDetails: { username: 'emp1' },
        mobile: '9000000001',
        name: 'Alice',
        city: 'Pune',
        status: 'FRESH',
        created_at: '2025-01-10T05:00:00Z',
    },
    {
        _id: '2',
        is_hot_lead: true,
        userDetails: { username: 'emp2' },
        mobile: '9000000002',
        name: 'Bob',
        city: 'Delhi',
        status: 'PAYMENT_DONE',
        created_at: '2025-01-11T05:00:00Z',
        free_trial: {
            investment: '10000',
            free_trial_date: '2025-01-12T05:00:00Z',
            remark: 'ok',
            options: ['A', 'B'],
        },
        follow_up: {
            expected_payment: '500',
            expected_payment_date: '2025-01-13T05:00:00Z',
        },
        payment: {
            payment_amount: '500',
            payment_mode: 'UPI',
            payment_date: '2025-01-14T05:00:00Z',
            payment_details: { upi_id: 'x@upi', upi_number: '123' },
        },
    },
    {
        // payment present but with a mode the table has no details cell for
        _id: '3',
        is_hot_lead: false,
        userDetails: { username: 'emp1' },
        mobile: '9000000003',
        name: 'Carol',
        city: 'Goa',
        status: 'PAYMENT_DONE',
        created_at: '2025-01-15T05:00:00Z',
        payment: {
            payment_amount: '700',
            payment_mode: 'CASH',
            payment_date: '2025-01-16T05:00:00Z',
        },
    },
    {
        _id: '4',
        is_hot_lead: false,
        userDetails: { username: 'emp1' },
        mobile: '9000000004',
        name: 'Dan',
        city: 'Agra',
        status: 'PAYMENT_DONE',
        created_at: '2025-01-17T05:00:00Z',
        payment: {
            payment_amount: '900',
            payment_mode: 'BANK',
            payment_date: '2025-01-18T05:00:00Z',
            payment_details: {
                account_holder: 'Dan',
                account_number: '111',
                bank_name: 'HDFC',
                ifsc_code: 'HDFC0001',
            },
        },
    },
];

describe('ReportListComponent', () => {
    let fixture: ComponentFixture<ReportListComponent>;
    let component: ReportListComponent;
    let dashboard: jasmine.SpyObj<DashboardService>;
    let users: jasmine.SpyObj<UsersService>;
    let branches: jasmine.SpyObj<BranchesService>;

    const lastParams = (callIndex = -1) => {
        const calls = dashboard.getReports.calls.all();
        const call = callIndex < 0 ? calls[calls.length + callIndex] : calls[callIndex];
        const p = call.args[0];
        const out: any = {};
        p.keys().forEach((k) => (out[k] = p.get(k)));
        return out;
    };

    async function setup(role: string, branch: any = { _id: 'B1' }) {
        localStorage.clear();
        localStorage.setItem('role', role);
        localStorage.setItem('userId', 'ME');
        localStorage.setItem('branch', JSON.stringify(branch));

        dashboard = jasmine.createSpyObj('DashboardService', ['getReports']);
        dashboard.getReports.and.returnValue(
            respond({ data: LEADS, total: LEADS.length }) as any
        );
        users = jasmine.createSpyObj('UsersService', ['getAll', 'searchBy']);
        users.getAll.and.returnValue(
            respond({ data: [{ username: 'tl1', _id: 'TL1' }] }) as any
        );
        users.searchBy.and.returnValue(of([]) as any);
        branches = jasmine.createSpyObj('BranchesService', ['getAll']);
        branches.getAll.and.returnValue(
            respond({
                data: [
                    { name: 'Co A', _id: 'CA' },
                    { name: 'Co B', _id: 'CB' },
                ],
            }) as any
        );

        await TestBed.configureTestingModule({
            imports: [ReportsModule, NoopAnimationsModule],
            providers: [
                { provide: DashboardService, useValue: dashboard },
                { provide: UsersService, useValue: users },
                { provide: BranchesService, useValue: branches },
                {
                    provide: UserLeadsService,
                    useValue: jasmine.createSpyObj('UserLeadsService', ['update']),
                },
                {
                    provide: AppointmentService,
                    useValue: jasmine.createSpyObj('AppointmentService', ['getAll']),
                },
                { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
                { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ReportListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await new Promise((r) => setTimeout(r, 50));
        fixture.detectChanges();
    }

    afterEach(() => localStorage.clear());

    describe('table rendering', () => {
        beforeEach(() => setup('admin'));

        it('renders the same number of cells in every row as there are headers', () => {
            const el: HTMLElement = fixture.nativeElement;
            const headers = el.querySelectorAll('thead th').length;
            const rows = el.querySelectorAll('tbody tr');
            expect(headers).toBe(18);
            expect(rows.length).toBe(LEADS.length);
            rows.forEach((row, i) =>
                expect(row.querySelectorAll('td').length)
                    .withContext('row ' + i)
                    .toBe(headers)
            );
        });

        it('keeps Payment Date in the last column for unknown payment modes', () => {
            const rows = fixture.nativeElement.querySelectorAll('tbody tr');
            const cash = rows[2].querySelectorAll('td');
            expect(cash[14].textContent).toContain('700');
            expect(cash[15].textContent).toContain('CASH');
            expect(cash[16].textContent.trim()).toBe('');
            expect(cash[17].textContent).toContain('16-01-2025');
        });

        it('shows UPI and bank details in the Payment Details column', () => {
            const rows = fixture.nativeElement.querySelectorAll('tbody tr');
            expect(rows[1].querySelectorAll('td')[16].textContent).toContain('x@upi');
            expect(rows[3].querySelectorAll('td')[16].textContent).toContain('HDFC0001');
        });

        it('formats dates with the calendar year, not the week-numbering year', () => {
            const created = fixture.nativeElement
                .querySelectorAll('tbody tr')[0]
                .querySelectorAll('td')[7];
            expect(created.textContent).toContain('10-01-2025');
        });
    });

    describe('filters', () => {
        beforeEach(() => setup('admin'));

        it('sends status, lead type and the branch with the report request', () => {
            component.onStatusChange({ value: 'FRESH' });
            component.onLeadTypeChange({ value: 'hot_lead' });
            const p = lastParams();
            expect(p.status).toBe('FRESH');
            expect(p.lead_type).toBe('hot_lead');
            expect(p.branch).toBe('B1');
            expect(p.user).toBe('ME');
            expect(p.page).toBe('0');
        });

        it('resets to the first page when a filter changes', () => {
            component.table.first = 200;
            component.onStatusChange({ value: 'DEAD' });
            expect(component.table.first).toBe(0);
            expect(lastParams().page).toBe('0');
        });

        it('covers the whole of the chosen end day', () => {
            component.onDateChange([new Date(2025, 0, 10), new Date(2025, 0, 12)]);
            const p = lastParams();
            expect(new Date(p.from).getTime()).toBe(new Date(2025, 0, 10, 0, 0, 0, 0).getTime());
            expect(new Date(p.to).getTime()).toBe(new Date(2025, 0, 12, 23, 59, 59, 999).getTime());
        });

        it('does not reload while only half of a date range is picked', () => {
            const before = dashboard.getReports.calls.count();
            component.onDateChange([new Date(2025, 0, 10), null]);
            expect(dashboard.getReports.calls.count()).toBe(before);
        });

        it('handles the date range being cleared (null) without throwing', () => {
            expect(() => component.onDateChange(null)).not.toThrow();
            const p = lastParams();
            expect(p.from).toBeUndefined();
            expect(p.to).toBeUndefined();
        });

        it('team lead / employee selection narrows the user filter', () => {
            component.onChangeTL({ value: 'TL1' });
            expect(lastParams().user).toBe('TL1');
            component.onChangeFilter({ value: 'EMP9' });
            expect(lastParams().user).toBe('EMP9');
            // clearing the employee falls back to the team lead
            component.onChangeFilter({ value: null });
            expect(lastParams().user).toBe('TL1');
        });

        it('changing the team lead resets the employee selection', () => {
            component.onChangeFilter({ value: 'EMP9' });
            component.onChangeTL({ value: 'TL1' });
            expect(component.selectedEmployee).toBe('');
            expect(lastParams().user).toBe('TL1');
        });

        it('Clear returns to the default view and the table shows that data', async () => {
            component.onStatusChange({ value: 'FRESH' });
            component.onDateChange([new Date(2025, 0, 10), new Date(2025, 0, 12)]);
            dashboard.getReports.and.returnValue(
                respond({ data: [LEADS[0]], total: 1 }) as any
            );
            component.onStatusChange({ value: 'FRESH' });
            await new Promise((r) => setTimeout(r, 20));
            expect(component.appointments.length).toBe(1);

            dashboard.getReports.and.returnValue(
                respond({ data: LEADS, total: LEADS.length }) as any
            );
            component.clear();
            await new Promise((r) => setTimeout(r, 20));
            fixture.detectChanges();

            const p = lastParams();
            expect(p.status).toBeUndefined();
            const from = new Date(p.from);
            const to = new Date(p.to);
            expect(to.getTime() - from.getTime()).toBeGreaterThan(24 * 3600 * 1000);
            expect(component.selectedDate[0]).toBeTruthy();
            expect(component.appointments.length).toBe(LEADS.length);
            expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(LEADS.length);
        });

        it('Clear removes status, type, team lead and employee filters', () => {
            component.onStatusChange({ value: 'FRESH' });
            component.onLeadTypeChange({ value: 'hot_lead' });
            component.onChangeTL({ value: 'TL1' });
            component.onDateChange([new Date(2025, 0, 10), new Date(2025, 0, 12)]);
            component.clear();
            const p = lastParams();
            expect(p.status).toBeUndefined();
            expect(p.lead_type).toBeUndefined();
            expect(new Date(p.from).getFullYear()).not.toBe(2025);
            expect(p.user).toBe('ME');
        });

        it('shows the yesterday-to-today range by default, covering full days', () => {
            const first = lastParams(0);
            expect(first.from).toBeDefined();
            const from = new Date(first.from);
            const to = new Date(first.to);
            expect([from.getHours(), from.getMinutes()]).toEqual([0, 0]);
            expect([to.getHours(), to.getMinutes()]).toEqual([23, 59]);
        });
    });

    describe('superadmin', () => {
        beforeEach(() => setup('superadmin', { _id: 'SUPER_OWN_BRANCH' }));

        it('uses the selected company, not the superadmin\'s own branch', () => {
            expect(component.selectedCompany).toBe('CA');
            expect(lastParams().branch).toBe('CA');
        });

        it('switching company reloads, resets team lead / employee and refetches team leads', () => {
            component.onChangeFilter({ value: 'EMP1' });
            component.onChangeCompany({ value: 'CB' });
            expect(component.selectedEmployee).toBe('');
            expect(component.selectedTL).toBe('');
            expect(lastParams().branch).toBe('CB');
            expect(users.getAll.calls.mostRecent().args[0].branch).toBe('CB');
        });

        it('does not call the report API before a company is known', async () => {
            TestBed.resetTestingModule();
            await setup('superadmin', { _id: 'X' });
            branches.getAll.and.returnValue(respond({ data: [] }) as any);
            dashboard.getReports.calls.reset();
            component.selectedCompany = '';
            component.applyFilters();
            expect(dashboard.getReports).not.toHaveBeenCalled();
            expect(component.loading).toBeFalse();
        });
    });

    describe('export button visibility', () => {
        const exportButton = () =>
            Array.from<HTMLButtonElement>(
                fixture.nativeElement.querySelectorAll('p-toolbar button')
            ).find((b) => b.textContent.includes('Export'));

        for (const role of ['admin', 'superadmin']) {
            it('is shown to ' + role, async () => {
                await setup(role);
                expect(exportButton()).toBeTruthy();
            });
        }

        for (const role of ['teamlead', 'employee']) {
            it('is hidden from ' + role, async () => {
                await setup(role);
                expect(exportButton()).toBeFalsy();
            });
        }
    });

    describe('export', () => {
        let sheetRows: any[][];
        let sheetHeader: string[];
        let saved: Blob;

        beforeEach(async () => {
            await setup('admin');
            spyOn(FileSaver, 'saveAs').and.callFake((b: any) => (saved = b));
        });

        async function runExport() {
            saved = undefined;
            component.exportExcel();
            await new Promise((r) => setTimeout(r, 300));
            if (saved) {
                // Read the downloaded file back to see exactly what the user gets.
                const wb = XLSX.read(await saved.arrayBuffer(), { type: 'array' });
                sheetRows = XLSX.utils.sheet_to_json(wb.Sheets['data'], {
                    header: 1,
                }) as any;
                sheetHeader = (sheetRows[0] ?? []) as any;
            } else {
                sheetRows = [];
                sheetHeader = [];
            }
        }

        it('requests every row (excel mode) with the active filters', async () => {
            component.onStatusChange({ value: 'PAYMENT_DONE' });
            component.onChangeTL({ value: 'TL1' });
            await runExport();
            const p = lastParams();
            expect(p.excel).toBe('true');
            expect(p.status).toBe('PAYMENT_DONE');
            expect(p.user).toBe('TL1');
        });

        it('exports the same columns as the table, in the same order', async () => {
            await runExport();
            const tableHeaders = Array.from(
                fixture.nativeElement.querySelectorAll('thead th')
            ).map((th: any) => th.textContent.trim().toLowerCase());
            expect(sheetHeader.length).toBe(tableHeaders.length - 1); // table has an extra Action column
            const exportLower = sheetHeader.map((h) => h.toLowerCase());
            const tableWithoutAction = tableHeaders.filter((h) => h !== 'action');
            expect(exportLower).toEqual(tableWithoutAction);
        });

        it('puts each value under its own column', async () => {
            await runExport();
            const col = (name: string, row: number) =>
                sheetRows[row + 1][sheetHeader.indexOf(name)];
            // Bob (UPI payment)
            expect(col('Name', 1)).toBe('Bob');
            expect(col('Lead Type', 1)).toBe('Hot Lead');
            expect(col('Username', 1)).toBe('emp2');
            expect(col('Free Trial Options', 1)).toBe('A, B');
            expect(col('Free Trial Date', 1)).toBe('12-01-2025');
            expect(col('Expected Payment', 1)).toBe('500');
            expect(col('Paid Amount', 1)).toBe('500');
            expect(col('Payment Mode', 1)).toBe('UPI');
            expect(col('Payment Details', 1)).toBe('x@upi | 123');
            expect(col('Payment Date', 1)).toBe('14-01-2025');
            // Dan (bank payment)
            expect(col('Payment Details', 3)).toBe('Dan | 111 | HDFC | HDFC0001');
            // Alice has no payment/free trial: blanks, not shifted values
            expect(col('Name', 0)).toBe('Alice');
            expect(col('Paid Amount', 0) ?? '').toBe('');
            expect(col('City', 0)).toBe('Pune');
        });

        it('exports all returned rows, not just the visible page', async () => {
            await runExport();
            expect(sheetRows.length - 1).toBe(LEADS.length);
            expect(saved).toBeDefined();
        });

        it('limit is 50,000 rows', () => {
            expect(MAX_EXPORT_ROWS).toBe(50000);
        });

        it('shows "Exporting..." with a spinner while the download is in progress, then restores the button', async () => {
            const btn = () =>
                Array.from<HTMLButtonElement>(
                    fixture.nativeElement.querySelectorAll('p-toolbar button')
                ).find((b) => /Export/.test(b.textContent));

            expect(btn().textContent).toContain('Export');
            expect(btn().textContent).not.toContain('Exporting');
            expect(btn().disabled).toBeFalse();

            component.exportExcel();
            fixture.detectChanges();
            expect(btn().textContent).toContain('Exporting...');
            expect(btn().disabled).toBeTrue();
            expect(btn().querySelector('.p-icon-spin')).toBeTruthy();

            await new Promise((r) => setTimeout(r, 300));
            fixture.detectChanges();
            expect(btn().textContent).not.toContain('Exporting');
            expect(btn().disabled).toBeFalse();
            expect(btn().querySelector('.p-icon-spin')).toBeFalsy();
        });

        it('ignores a second click while an export is running', async () => {
            dashboard.getReports.calls.reset();
            component.exportExcel();
            component.exportExcel();
            await new Promise((r) => setTimeout(r, 300));
            expect(dashboard.getReports).toHaveBeenCalledTimes(1);
        });

        it('restores the button when the export fails', async () => {
            dashboard.getReports.and.returnValue(throwError(() => ({ status: 500 })) as any);
            component.exportExcel();
            fixture.detectChanges();
            await new Promise((r) => setTimeout(r, 50));
            fixture.detectChanges();
            expect(component.excel).toBeFalse();
            const btn = Array.from<HTMLButtonElement>(
                fixture.nativeElement.querySelectorAll('p-toolbar button')
            ).find((b) => /Export/.test(b.textContent));
            expect(btn.textContent).not.toContain('Exporting');
            expect(btn.disabled).toBeFalse();
        });

        it('exports normally at exactly the limit', async () => {
            component.totalRecords = MAX_EXPORT_ROWS;
            await runExport();
            expect(saved).toBeDefined();
            expect(lastParams().excel).toBe('true');
        });

        it('refuses over the limit without calling the server, and tells the user', async () => {
            const toast = TestBed.inject(MessageService, null as any);
            const messageService: any = (component as any).messageService;
            spyOn(messageService, 'add');
            component.totalRecords = MAX_EXPORT_ROWS + 1;
            dashboard.getReports.calls.reset();
            await runExport();
            expect(dashboard.getReports).not.toHaveBeenCalled();
            expect(saved).toBeUndefined();
            const msg = (messageService.add as jasmine.Spy).calls.mostRecent().args[0];
            expect(msg.severity).toBe('warn');
            expect(msg.detail).toContain('50,000');
            expect(msg.detail).toContain('50,001');
            expect(component.excel).toBeFalse();
        });

        it('shows the server message and re-enables the button if the server rejects the export', async () => {
            const messageService: any = (component as any).messageService;
            spyOn(messageService, 'add');
            dashboard.getReports.and.returnValue(
                throwError(() => ({ status: 400, error: { message: 'Export is limited to 50,000 rows but this report has 60,000.' } })) as any
            );
            await runExport();
            expect(saved).toBeUndefined();
            expect((messageService.add as jasmine.Spy).calls.mostRecent().args[0].detail).toContain('60,000');
            expect(component.excel).toBeFalse();
        });

        it('stays quiet when the export fails for another reason', async () => {
            const messageService: any = (component as any).messageService;
            spyOn(messageService, 'add');
            dashboard.getReports.and.returnValue(throwError(() => ({ status: 500 })) as any);
            await runExport();
            expect(messageService.add).not.toHaveBeenCalled();
            expect(component.excel).toBeFalse();
        });

        it('does not blow up on an empty result', async () => {
            dashboard.getReports.and.returnValue(respond({ data: [], total: 0 }) as any);
            await runExport();
            expect(sheetRows.length).toBeLessThanOrEqual(1);
            expect(component.excel).toBeFalse();
        });
    });
});
