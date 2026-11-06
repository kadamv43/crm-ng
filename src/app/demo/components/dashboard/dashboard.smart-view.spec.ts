import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { DashboardModule } from './dashboard.module';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { UsersService } from 'src/app/services/users/users.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { ContactsService } from 'src/app/services/contacts/contacts.service';
import { CommonService } from 'src/app/services/common/common.service';

// The smart view card of the dashboard: its filters, the request it sends,
// and the columns it shows.

const reply = {
    range: { from: '2025-03-10', to: '2025-03-10' },
    total: 2,
    result: [
        {
            user: 'u1',
            userDetails: { username: 'asha', mobile: '9' },
            status: {
                carried_forward: 4, assigned: 10, fresh: 4, total: 10, total_dialed: 6,
                callback: 2, free_trial: 0, ringing: 1, switched_off: 0, dead: 1,
                not_reachable: 0, not_interested: 0, expected_payment: 0, payment_done: 2,
            },
            // 02:35 UTC is 8:05 AM in India
            attendance: { first_login_at: '2025-03-10T02:35:00Z', days_present: 1 },
        },
        {
            user: 'u2',
            userDetails: { username: 'ravi', mobile: '8' },
            status: {
                carried_forward: 0, assigned: 0, fresh: 0, total: 0, total_dialed: 0,
                callback: 0, free_trial: 0, ringing: 0, switched_off: 0, dead: 0,
                not_reachable: 0, not_interested: 0, expected_payment: 0, payment_done: 0,
            },
            attendance: null,
        },
    ],
};

describe('dashboard smart view', () => {
    // ------------------------------------------------------------ the logic
    describe('requests and filters', () => {
        let component: any;
        let dashboard: jasmine.SpyObj<DashboardService>;
        let toast: jasmine.SpyObj<any>;

        function make(role: string, extra: any = {}) {
            dashboard = jasmine.createSpyObj('DashboardService', ['getSmartView']);
            dashboard.getSmartView.and.returnValue(of(reply) as any);
            toast = jasmine.createSpyObj('MessageService', ['add']);
            component = Object.create(DashboardComponent.prototype);
            Object.assign(component, {
                role,
                dashboardService: dashboard,
                toast,
                commonService: new CommonService(),
                loggedInUserBranch: { _id: 'OWN' },
                selectedCompany: '',
                selectedEmployee: '',
                svDate: '',
                svSearch: '',
                svLoggedInOnly: false,
                svRange: null,
                maxSmartViewDays: 31,
                smartTable: null,
                ...extra,
            });
            localStorage.setItem('userId', 'ME');
        }
        const sent = () => dashboard.getSmartView.calls.mostRecent().args[0] as any;
        const day = (d: number) => new Date(2025, 2, d);

        afterEach(() => {
            localStorage.clear();
            clearTimeout(component?.svSearchTimer);
        });

        it('only admin and superadmin get the filters', () => {
            for (const [role, expected] of [['admin', true], ['superadmin', true], ['teamlead', false], ['employee', false]] as const) {
                make(role);
                expect(component.canFilterSmartView).toBe(expected);
            }
        });

        it('a plain request has the page, size, company and person and no filters', () => {
            make('admin');
            component.getSmartView({ first: 100, rows: 50 });
            expect(sent()).toEqual({ page: 2, size: 50, branch: 'OWN', user: 'ME' });
        });

        it('admin: the chosen days, search and logged-in switch go along', () => {
            make('admin', {
                svDate: [day(10), day(12)],
                svSearch: '  asha ',
                svLoggedInOnly: true,
            });
            component.getSmartView({ first: 0, rows: 50 });
            expect(sent()).toEqual({
                page: 0, size: 50, branch: 'OWN', user: 'ME',
                from: '2025-03-10', to: '2025-03-12', q: 'asha', logged_in: 'true',
            });
        });

        it('team leads and staff never send filters, even if the fields were set', () => {
            for (const role of ['teamlead', 'employee']) {
                make(role, { svDate: [day(10), day(12)], svSearch: 'x', svLoggedInOnly: true });
                component.getSmartView({ first: 0, rows: 50 });
                expect(sent().from).toBeUndefined();
                expect(sent().q).toBeUndefined();
                expect(sent().logged_in).toBeUndefined();
            }
        });

        it('an unfinished range means that one day', () => {
            make('admin', { svDate: [day(10), null] });
            component.getSmartView({ first: 0, rows: 50 });
            expect(sent().from).toBe('2025-03-10');
            expect(sent().to).toBe('2025-03-10');
        });

        it('shows what the server answers and remembers the days it covered', () => {
            make('admin');
            component.getSmartView({ first: 0, rows: 50 });
            expect(component.smartView.length).toBe(2);
            expect(component.smartViewRecords).toBe(2);
            expect(component.svRange).toEqual({ from: '2025-03-10', to: '2025-03-10' });
        });

        it('the looked-at employee goes along when one is chosen', () => {
            make('admin', { selectedEmployee: 'EMP9' });
            component.getSmartView({ first: 0, rows: 50 });
            expect(sent().user).toBe('EMP9');
        });

        describe('the company', () => {
            it('superadmin\'s own company is never used: the dropdown choice is', () => {
                make('superadmin', { selectedCompany: 'CHOSEN', loggedInUserBranch: { _id: 'SUPERADMINS_OWN' } });
                expect(component.currentBranchId()).toBe('CHOSEN');
                component.getSmartView({ first: 0, rows: 50 });
                expect(sent().branch).toBe('CHOSEN');
            });

            it('superadmin waits until a company is chosen instead of sending a broken request', () => {
                make('superadmin', { selectedCompany: '' });
                component.getSmartView({ first: 0, rows: 50 });
                expect(dashboard.getSmartView).not.toHaveBeenCalled();
            });

            it('everyone else uses their own company', () => {
                make('admin', { selectedCompany: 'IGNORED' });
                expect(component.currentBranchId()).toBe('OWN');
            });

            it('an empty company is left out, never sent as the text "undefined"', () => {
                make('admin', { loggedInUserBranch: null, selectedCompany: '' });
                component.getSmartView({ first: 0, rows: 50 });
                expect('branch' in sent()).toBeFalse();
            });
        });

        describe('date picker', () => {
            it('waits for the second day before asking', () => {
                make('admin');
                component.onSmartViewDateChange([day(10), null]);
                expect(dashboard.getSmartView).not.toHaveBeenCalled();
            });

            it('asks once both days are chosen, starting from the first page', () => {
                make('admin');
                component.onSmartViewDateChange([day(10), day(12)]);
                expect(dashboard.getSmartView).toHaveBeenCalledTimes(1);
                expect(sent().page).toBe(0);
                expect(sent().from).toBe('2025-03-10');
            });

            it('clearing it goes back to today', () => {
                make('admin', { svDate: [day(10), day(12)] });
                component.onSmartViewDateChange(null);
                expect(component.svDate).toBe('');
                expect(sent().from).toBeUndefined();
            });

            it('31 days are fine, 32 are refused with a message and no request', () => {
                make('admin');
                component.onSmartViewDateChange([new Date(2025, 2, 1), new Date(2025, 2, 31)]);
                expect(dashboard.getSmartView).toHaveBeenCalledTimes(1);

                dashboard.getSmartView.calls.reset();
                component.onSmartViewDateChange([new Date(2025, 2, 1), new Date(2025, 3, 1)]);
                expect(dashboard.getSmartView).not.toHaveBeenCalled();
                expect(toast.add.calls.mostRecent().args[0].detail).toContain('31');
            });

            it('31 days across a month with a clock change are still 31 (no off-by-one)', () => {
                make('admin');
                component.onSmartViewDateChange([new Date(2025, 9, 1), new Date(2025, 9, 31)]);
                component.onSmartViewDateChange([new Date(2025, 2, 15), new Date(2025, 3, 14)]);
                expect(dashboard.getSmartView).toHaveBeenCalledTimes(2);
            });
        });

        describe('search and switches', () => {
            it('search waits for typing to pause, then asks once', fakeAsync(() => {
                make('admin', { svSearch: 'a' });
                component.onSmartViewSearch();
                tick(200);
                component.svSearch = 'as';
                component.onSmartViewSearch();
                tick(200);
                expect(dashboard.getSmartView).not.toHaveBeenCalled();
                tick(400);
                expect(dashboard.getSmartView).toHaveBeenCalledTimes(1);
                expect(sent().q).toBe('as');
            }));

            it('the logged-in switch asks straight away from the first page', () => {
                const table: any = { first: 150, rows: 100 };
                make('admin', { svLoggedInOnly: true });
                component.applySmartViewFilters(table);
                expect(table.first).toBe(0);
                expect(sent()).toEqual(jasmine.objectContaining({ page: 0, size: 100, logged_in: 'true' }));
            });

            it('Clear puts everything back and reloads', fakeAsync(() => {
                make('admin', { svDate: [day(10), day(12)], svSearch: 'asha', svLoggedInOnly: true });
                component.onSmartViewSearch(); // a pending search must not fire later
                component.clearSmartViewFilters();
                expect(component.svDate).toBe('');
                expect(component.svSearch).toBe('');
                expect(component.svLoggedInOnly).toBeFalse();
                expect(dashboard.getSmartView).toHaveBeenCalledTimes(1);
                expect(sent().q).toBeUndefined();
                expect(sent().logged_in).toBeUndefined();
                tick(1000);
                expect(dashboard.getSmartView).toHaveBeenCalledTimes(1);
            }));
        });

        it('shows days the way people write them', () => {
            make('admin');
            expect(component.dayLabel('2025-03-10')).toBe('10/03/2025');
            expect(component.dayLabel('')).toBe('');
            expect(component.dayLabel(undefined)).toBe('');
        });

        it('knows whether the table covers one day or several', () => {
            make('admin', { svRange: { from: '2025-03-10', to: '2025-03-10' } });
            expect(component.svIsRange).toBeFalse();
            component.svRange = { from: '2025-03-10', to: '2025-03-12' };
            expect(component.svIsRange).toBeTrue();
            component.svRange = null;
            expect(component.svIsRange).toBeFalse();
        });
    });

    // ----------------------------------------------------------- the screen
    describe('the table on screen', () => {
        let fixture: ComponentFixture<DashboardComponent>;
        let dashboard: any;

        async function render(role: string, smartReply: any = reply) {
            localStorage.clear();
            localStorage.setItem('role', role);
            localStorage.setItem('userId', 'ME');
            localStorage.setItem('branch', JSON.stringify({ _id: 'OWN' }));

            const answer = { total: 0, data: [], result: [], totalPayment: 0, totalAmount: 0, achieved: 0, pending: 0 };
            // any other service call on this page just gets an empty answer
            const quiet = (extra: any = {}) =>
                new Proxy(extra, { get: (t, name) => (name in t ? t[name] : () => of(answer)) });
            dashboard = quiet({ getSmartView: jasmine.createSpy('getSmartView').and.callFake(() => of(smartReply)) });

            await TestBed.configureTestingModule({
                imports: [DashboardModule, NoopAnimationsModule, HttpClientTestingModule],
                providers: [
                    { provide: DashboardService, useValue: dashboard },
                    { provide: UsersService, useValue: quiet({ searchBy: () => of([]) }) }, // a team lead's page asks for their team as a list
                    { provide: BranchesService, useValue: quiet({ getAll: () => of({ data: [], total: 0 }) }) },
                    { provide: ContactsService, useValue: quiet({ stats: () => of({ total_unique_leads: 0 }) }) },
                    { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
                    { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
                ],
            }).compileComponents();

            fixture = TestBed.createComponent(DashboardComponent);
            fixture.detectChanges();
            await new Promise((r) => setTimeout(r, 30));
            fixture.detectChanges();
        }

        const smartCard = (): HTMLElement =>
            Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.card')).find((c) =>
                c.querySelector('h5')?.textContent.includes('Smart View')
            );
        const headers = () =>
            Array.from(smartCard().querySelectorAll('thead th')).map((th: any) => th.textContent.trim());
        const cells = (row: number) =>
            Array.from(smartCard().querySelectorAll('tbody tr')[row].querySelectorAll('td')).map((td: any) =>
                td.textContent.replace(/\s+/g, ' ').trim()
            );

        afterEach(() => localStorage.clear());

        it('admin sees the filters and every column, with the new ones in place', async () => {
            await render('admin');
            expect(smartCard().textContent).toContain('Only logged in');
            expect(smartCard().querySelector('input[placeholder="Search username"]')).toBeTruthy();
            expect(smartCard().querySelector('p-calendar')).toBeTruthy();
            expect(headers()).toEqual([
                'Username', 'First login', 'Carried forward', 'Assigned', 'FRESH', 'Total', 'Total Dialed',
                'CALLBACK', 'FREE TRIAL', 'RINGING', 'SWITCH OFF', 'DEAD', 'NOT REACHABLE', 'NOT INTERESTED',
                'EXPECTED PAYMENT', 'PAYMENT DONE',
            ]);
        });

        it('shows the numbers of the example: 10 handed out, 6 worked, 4 left, 4 carried', async () => {
            await render('admin');
            const asha = cells(0);
            expect(asha[0]).toBe('asha');
            expect(asha[1]).toBe('08:05 AM'); // first login, India time
            expect(asha.slice(2, 7)).toEqual(['4', '10', '4', '10', '6']); // carried, assigned, fresh, total, dialed
            expect(asha.slice(7)).toEqual(['2', '0', '1', '0', '1', '0', '0', '0', '2']); // callback ... payment done
        });

        it('every row has the same number of cells as the header, with or without a login', async () => {
            await render('admin');
            const columns = headers().length;
            expect(cells(0).length).toBe(columns);
            expect(cells(1).length).toBe(columns);
            expect(cells(1)[0]).toBe('ravi');
            expect(cells(1)[1]).toBe('-'); // did not log in
        });

        it('explains which days it shows', async () => {
            await render('admin');
            expect(smartCard().textContent).toContain('Showing 10/03/2025.');
            expect(smartCard().textContent).toContain('8:00 AM to 8:00 AM');
        });

        it('a range shows the date with the first login, and how many days they were present', async () => {
            await render('admin', {
                ...reply,
                range: { from: '2025-03-10', to: '2025-03-12' },
                result: [{ ...reply.result[0], attendance: { first_login_at: '2025-03-10T02:35:00Z', days_present: 3 } }],
                total: 1,
            });
            expect(smartCard().textContent).toContain('Showing 10/03/2025 to 12/03/2025.');
            expect(cells(0)[1]).toBe('10/03 08:05 AM (3 days)');
        });

        it('superadmin has the filters too', async () => {
            await render('superadmin');
            // a superadmin picks a company first, so the table stays quiet until then
            expect(smartCard()?.querySelector('input[placeholder="Search username"]')).toBeTruthy();
        });

        it('team leads see the same columns but no filters and no first-login column', async () => {
            await render('teamlead');
            expect(smartCard().textContent).not.toContain('Only logged in');
            expect(smartCard().querySelector('input[placeholder="Search username"]')).toBeNull();
            expect(smartCard().querySelector('p-calendar')).toBeNull();
            expect(headers()).not.toContain('First login');
            expect(headers().slice(0, 5)).toEqual(['Username', 'Carried forward', 'Assigned', 'FRESH', 'Total']);
            expect(cells(0).length).toBe(headers().length);
        });

        it('staff get the same as team leads', async () => {
            await render('employee');
            expect(smartCard().querySelector('input[placeholder="Search username"]')).toBeNull();
            expect(headers()).not.toContain('First login');
        });

        it('says so when there is nothing to show', async () => {
            await render('admin', { range: reply.range, total: 0, result: [] });
            expect(smartCard().textContent).toContain('No data for this selection.');
        });

        it('typing a search asks the server', async () => {
            await render('admin');
            dashboard.getSmartView.calls.reset();
            const input: HTMLInputElement = smartCard().querySelector('input[placeholder="Search username"]');
            input.value = 'ash';
            input.dispatchEvent(new Event('input'));
            await new Promise((r) => setTimeout(r, 600));
            expect(dashboard.getSmartView).toHaveBeenCalledTimes(1);
            expect(dashboard.getSmartView.calls.mostRecent().args[0].q).toBe('ash');
        });

        it('the Clear button reloads without filters', async () => {
            await render('admin');
            fixture.componentInstance.svSearch = 'x';
            dashboard.getSmartView.calls.reset();
            const clear = Array.from<HTMLButtonElement>(smartCard().querySelectorAll('button')).find((b) => b.textContent.trim() === 'Clear');
            clear.click();
            expect(dashboard.getSmartView).toHaveBeenCalledTimes(1);
            expect(dashboard.getSmartView.calls.mostRecent().args[0].q).toBeUndefined();
        });
    });
});
