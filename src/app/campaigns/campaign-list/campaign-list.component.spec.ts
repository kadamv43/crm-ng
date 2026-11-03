import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

import { CampaignListComponent } from './campaign-list.component';
import { CampaignsModule } from '../campaigns.module';
import { CampaignsService } from 'src/app/services/campaigns/campaigns.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { AuthService } from 'src/app/services/auth.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

const respond = (value: any) => of(value).pipe(delay(0));
const pause = (ms = 20) => new Promise((r) => setTimeout(r, ms));

const rows = [
    { _id: 'c2', name: 'Diwali', status: 'ACTIVE', round: 2, rounds: 10, staff: 10, total_leads: 100, created_by: 'boss', created_at: '2025-03-10T08:30:00Z' },
    { _id: 'c1', name: 'Old one', status: 'COMPLETED', round: 3, rounds: 3, staff: 3, total_leads: 30, created_by: 'boss', created_at: '2025-02-01T08:30:00Z' },
];
const staff = [
    { _id: 's1', username: 'amit', name: 'Amit K', present: true },
    { _id: 's2', username: 'riya', name: 'Riya S', present: true },
    { _id: 's3', username: 'zed', name: '', present: false },
];
// a complete form, as the page itself builds it
const full = (over: any = {}) => ({
    name: '',
    staff: [] as string[],
    count: 100 as any,
    leadSource: 'pool',
    leadType: 'NORMAL',
    ...over,
});
const detail = (over: any = {}) => ({
    _id: 'c2', name: 'Diwali', status: 'ACTIVE', round: 2, rounds: 10, total_leads: 100,
    finished: 4, untouched: 7, can_next_round: true, statuses: { FRESH: 7, RINGING: 80, PAYMENT_DONE: 4 },
    staff: [
        { _id: 's1', username: 'amit', name: 'Amit K', holding: 10, untouched: 3, assigned_total: 20, worked_total: 17 },
        { _id: 's2', username: 'riya', name: '', holding: 9, untouched: 4, assigned_total: 20, worked_total: 16 },
    ],
    ...over,
});

describe('CampaignListComponent', () => {
    let fixture: ComponentFixture<CampaignListComponent>;
    let component: any;
    let api: jasmine.SpyObj<CampaignsService>;
    let toast: jasmine.Spy;
    let confirm: jasmine.Spy;

    async function setup(role = 'admin') {
        api = jasmine.createSpyObj('CampaignsService', ['list', 'staff', 'detail', 'create', 'nextRound', 'close']);
        api.list.and.callFake((() => respond(rows)) as any);
        api.staff.and.callFake((() => respond(staff)) as any);
        api.detail.and.callFake((() => respond(detail())) as any);
        api.create.and.callFake((() => respond({ message: '100 leads handed to 2 staff', skipped: 0 })) as any);
        api.nextRound.and.callFake((() => respond({ message: 'Round 3: 100 leads moved on, 4 finished' })) as any);
        api.close.and.callFake((() => respond({})) as any);
        const branches = jasmine.createSpyObj('BranchesService', ['getAll']);
        branches.getAll.and.callFake((() => respond({ data: [{ name: 'Co A', _id: 'CA' }, { name: 'Co B', _id: 'CB' }] })) as any);

        await TestBed.configureTestingModule({
            imports: [CampaignsModule, NoopAnimationsModule],
            providers: [
                { provide: CampaignsService, useValue: api },
                { provide: BranchesService, useValue: branches },
                { provide: DashboardService, useValue: jasmine.createSpyObj('DashboardService', ['getReports']) },
                { provide: AuthService, useValue: { getRole: () => role } },
                { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
                { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CampaignListComponent);
        component = fixture.componentInstance;
        toast = spyOn(fixture.debugElement.injector.get(MessageService), 'add');
        // answer the confirm dialog by accepting straight away
        confirm = spyOn(fixture.debugElement.injector.get(ConfirmationService), 'confirm').and.callFake(((c: any) => c.accept()) as any);
        fixture.detectChanges();
        await settle();
    }
    const settle = async () => {
        await pause();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    };
    const text = () => (document.body.textContent || '').replace(/\s+/g, ' ');
    const lastToast = () => toast.calls.mostRecent().args[0];

    describe('the list', () => {
        beforeEach(() => setup());

        it('shows each campaign with its round, staff, leads and who started it', () => {
            expect(text()).toContain('Diwali');
            expect(text()).not.toContain('2 of 10');
            const diwali = Array.from(document.querySelectorAll('tbody tr')).find((r) => r.textContent.includes('Diwali'));
            expect(Array.from(diwali.querySelectorAll('td')).map((c) => c.textContent.trim())).toContain('2'); // the round
            expect(text()).toContain('Old one');
            expect(text()).not.toContain('3 of 3');
            expect(text()).toContain('Running');
            expect(text()).toContain('Closed');
            expect(api.list).toHaveBeenCalledWith(undefined);
        });

        it('an admin sees no company picker', () => {
            expect(fixture.nativeElement.querySelector('#company')).toBeNull();
        });

        it('says so when there are none', async () => {
            api.list.and.callFake((() => respond([])) as any);
            component.load();
            await settle();
            expect(text()).toContain('No campaigns yet');
        });

        it('a load failure is shown, not swallowed', async () => {
            api.list.and.returnValue(throwError(() => ({ error: { message: 'boom' } })));
            component.load();
            await settle();
            expect(lastToast().detail).toBe('boom');
            expect(component.loading).toBeFalse();
        });
    });

    describe('starting a campaign', () => {
        beforeEach(() => setup());

        it('ticks the staff who are in today and says what will happen', async () => {
            component.openCreate();
            await settle();
            expect(component.form.staff).toEqual(['s1', 's2']);
            component.form.name = 'Spring';
            component.form.count = 101;
            fixture.detectChanges();
            expect(component.preview).toBe('101 leads over 2 staff: 50 or 51 each. After 2 rounds everyone has had every lead.');
            component.form.count = 100;
            expect(component.preview).toContain('50 each');
            // only people who logged in today can be chosen
            expect(component.staffOptions.map((o: any) => o.value)).toEqual(['s1', 's2']);
        });

        it('the problems are named and nothing is sent', () => {
            const send = () => {
                api.create.calls.reset();
                component.create();
                return api.create.calls.count();
            };
            component.form = full({ name: '', staff: ['s1', 's2'], count: 10 });
            expect(send()).toBe(0);
            expect(lastToast().detail).toContain('name');
            component.form = full({ name: 'x', staff: ['s1'], count: 10 });
            expect(send()).toBe(0);
            expect(lastToast().detail).toContain('2 staff');
            for (const bad of [0, -3, 1.5, 10001, null, NaN]) {
                component.form = full({ name: 'x', staff: ['s1', 's2'], count: bad as any });
                expect(send()).toBe(0);
            }
            expect(component.preview).toBe('');
        });

        it('sends the trimmed name, the staff and the count, then reloads', async () => {
            component.openCreate();
            await settle();
            component.form.name = '  Spring  ';
            component.form.count = 40;
            component.create();
            expect(api.create).toHaveBeenCalledWith(
                { name: 'Spring', staff: ['s1', 's2'], count: 40, lead_type: 'NORMAL' },
                undefined
            );
            await settle();
            expect(component.showCreate).toBeFalse();
            expect(lastToast().severity).toBe('success');
            expect(api.list).toHaveBeenCalledTimes(2);
        });

        it('a second click while it is working sends nothing more', async () => {
            component.form = full({ name: 'x', staff: ['s1', 's2'], count: 5 });
            component.create();
            component.create();
            expect(api.create).toHaveBeenCalledTimes(1);
            await settle();
        });

        it('a refusal (for example the name is taken) is shown and the dialog stays open', async () => {
            api.create.and.returnValue(throwError(() => ({ error: { message: 'A campaign with this name already exists' } })));
            component.showCreate = true;
            component.form = full({ name: 'x', staff: ['s1', 's2'], count: 5 });
            component.create();
            expect(lastToast().detail).toBe('A campaign with this name already exists');
            expect(component.showCreate).toBeTrue();
            expect(component.creating).toBeFalse();
        });

        it('mentions leads that were no longer in the pool', async () => {
            api.create.and.callFake((() => respond({ message: '3 leads handed to 2 staff', skipped: 1 })) as any);
            component.form = full({ name: 'x', staff: ['s1', 's2'], count: 4 });
            component.create();
            await settle();
            expect(lastToast().detail).toContain('1 skipped');
        });
    });

    describe('the status choice is not part of creating a campaign', () => {
        beforeEach(() => setup());

        it('the new-campaign form has no status dropdown', async () => {
            component.openCreate();
            await settle();
            expect(document.querySelector('#cmove')).toBeNull();
            expect(text()).not.toContain('Move to the next round');
            expect('moveStatuses' in component.form).toBeFalse();
        });

        it('but still has the staff dropdown', async () => {
            component.openCreate();
            await settle();
            expect(document.querySelector('p-multiselect[inputid="cstaff"]')).toBeTruthy();
        });

        it('a campaign is created without any statuses', async () => {
            component.openCreate();
            await settle();
            component.form.name = 'Plain';
            component.create();
            expect('move_statuses' in (api.create.calls.mostRecent().args[0] as any)).toBeFalse();
            await settle();
        });
    });

    describe('the next-round window', () => {
        beforeEach(async () => {
            await setup();
            component.open(rows[0]);
            await settle();
        });

        const open = async () => {
            component.askNextRound();
            await settle();
        };

        it('the button opens a window with a staff dropdown and a status dropdown', async () => {
            document.querySelector<HTMLButtonElement>('#nextRound').click();
            await settle();
            expect(component.showRound).toBeTrue();
            expect(document.querySelector('p-multiselect[inputid="rstatus"]')).toBeTruthy();
            expect(document.querySelector('p-multiselect[inputid="rstaff"]')).toBeTruthy();
            expect(text()).toContain('Statuses that move on');
            expect(text()).toContain('Staff for this round');
        });

        it('nothing is sent just by opening it', async () => {
            await open();
            expect(api.nextRound).not.toHaveBeenCalled();
            expect(confirm).not.toHaveBeenCalled();
        });

        it('starts with everyone who is in today ticked, and the last statuses used', async () => {
            api.detail.and.callFake((() => respond(detail({ move_statuses: ['RINGING', 'CALLBACK'] }))) as any);
            component.open(rows[0]);
            await settle();
            await open();
            expect(api.staff).toHaveBeenCalledWith(undefined);
            expect(component.roundStaff).toEqual(['s1', 's2']); // zed is not in today
            expect(component.roundStaffOptions.map((o: any) => o.value)).toEqual(['s1', 's2']);
            expect(component.roundStatuses).toEqual(['RINGING', 'CALLBACK']);
        });

        it('with no earlier choice it starts from the usual statuses', async () => {
            api.detail.and.callFake((() => respond(detail({ move_statuses: undefined }))) as any);
            component.open(rows[0]);
            await settle();
            await open();
            expect(component.roundStatuses).toEqual(['FRESH', 'CALLBACK', 'FREE_TRIAL', 'RINGING', 'SWITCHED_OFF', 'NOT_REACHABLE', 'EXPECTED_PAYMENT']);
        });

        it('Start sends the chosen staff and statuses, then closes the window and refreshes', async () => {
            await open();
            component.roundStaff = ['s2'];
            component.roundStatuses = ['RINGING'];
            component.startRound();
            expect(api.nextRound).toHaveBeenCalledWith('c2', { staff: ['s2'], move_statuses: ['RINGING'] }, undefined);
            await settle();
            expect(component.showRound).toBeFalse();
            expect(lastToast().detail).toContain('Round 3');
            expect(api.detail).toHaveBeenCalledTimes(2);
            expect(component.roundStarting).toBeFalse();
        });

        it('when the round finishes the campaign, the message says so and the closed campaign is reloaded', async () => {
            api.nextRound.and.returnValue(respond({ closed: true, message: 'Round 4: 12 leads moved on. Nothing can move any further, so the campaign is now closed' }) as any);
            api.detail.and.callFake((() => respond(detail({ status: 'COMPLETED', can_next_round: false }))) as any);
            await open();
            component.startRound();
            await settle();
            expect(lastToast().detail).toContain('now closed');
            expect(api.detail).toHaveBeenCalledTimes(2);
            expect(component.showRound).toBeFalse();
            expect(document.querySelector('#nextRound')).toBeNull();
        });

        it('clicking the Start button does the same', async () => {
            await open();
            document.querySelector<HTMLButtonElement>('#startRound').click();
            expect(api.nextRound).toHaveBeenCalledTimes(1);
            await settle();
        });

        it('a second click while it is working sends nothing more', async () => {
            await open();
            component.startRound();
            component.startRound();
            expect(api.nextRound).toHaveBeenCalledTimes(1);
            await settle();
        });

        it('no staff or no statuses: the problem is named and nothing is sent', async () => {
            await open();
            component.roundStaff = [];
            component.startRound();
            expect(lastToast().detail).toContain('at least one staff');
            component.roundStaff = ['s1'];
            component.roundStatuses = [];
            component.startRound();
            expect(lastToast().detail).toContain('at least one status');
            expect(api.nextRound).not.toHaveBeenCalled();
            expect(component.showRound).toBeTrue();
        });

        it('a refusal is shown, the window stays open so the choice can be changed, and the page refreshes', async () => {
            api.nextRound.and.returnValue(throwError(() => ({ error: { message: 'No lead can move this round: 4 not in the chosen statuses. Change the statuses or the staff.' } })));
            await open();
            component.startRound();
            await settle();
            expect(lastToast().detail).toContain('No lead can move');
            expect(component.showRound).toBeTrue();
            expect(component.roundStarting).toBeFalse();
            expect(api.detail).toHaveBeenCalledTimes(2);
        });

        it('mentions the leads nobody has called yet, and says nothing when there are none', async () => {
            await open();
            expect(document.querySelector('#roundNote').textContent).toContain('7 leads have not been called yet');
            component.detail = detail({ untouched: 0 });
            fixture.detectChanges();
            expect(document.querySelector('#roundNote')).toBeNull();
        });

        it('when nobody can move any more, there is no button, only a note', async () => {
            component.detail = detail({ can_next_round: false });
            fixture.detectChanges();
            expect(document.querySelector('#nextRound')).toBeNull();
            expect(document.querySelector('#noMoreRounds')).toBeTruthy();
        });

        it('a closed campaign has no button and no note', async () => {
            component.detail = detail({ status: 'COMPLETED', can_next_round: false });
            fixture.detectChanges();
            expect(document.querySelector('#nextRound')).toBeNull();
            expect(document.querySelector('#closeCampaign')).toBeNull();
            expect(document.querySelector('#noMoreRounds')).toBeNull();
        });

        it('shows what each earlier round did', async () => {
            component.detail = detail({
                history: [
                    { round: 2, move_statuses: ['RINGING', 'CALLBACK'], staff: 5, moved: 40, stayed: 10, no_candidate: 2 },
                    { round: 3, move_statuses: ['FRESH'], staff: 3, moved: 12, stayed: 0, no_candidate: 0 },
                ],
            });
            fixture.detectChanges();
            await settle();
            const t = document.querySelector('#roundHistory').textContent.replace(/\s+/g, ' ');
            expect(t).toContain('Rounds so far');
            expect(t).toContain('Ringing, Callback');
            expect(t).toContain('Not called yet');
            expect(document.querySelectorAll('#roundHistory tbody tr').length).toBe(2);
        });

        it('there is no history block before the second round', () => {
            expect(document.querySelector('#roundHistory')).toBeNull();
        });

        it('the round number is shown without a total', async () => {
            expect(text()).not.toContain('of 10');
            expect(text()).toContain('Round');
        });
    });

    describe('hot lead campaigns', () => {
        beforeEach(() => setup());

        const hotRows = [
            { ...rows[0], lead_type: 'HOT' },
            { ...rows[1], lead_type: 'NORMAL' },
        ];

        it('the form starts on Normal and offers Hot', async () => {
            component.openCreate();
            await settle();
            expect(component.form.leadType).toBe('NORMAL');
            const radios = Array.from(document.querySelectorAll('input[name="leadType"]')) as HTMLInputElement[];
            expect(radios.map((r) => r.value)).toEqual(['NORMAL', 'HOT']);
            expect(text()).toContain('Lead type');
            expect(text()).toContain('Take from pool');
            expect(text()).not.toContain('Leads come from the hot leads pool');
        });

        it('choosing Hot says where the leads come from and renames the pool choices', async () => {
            component.openCreate();
            await settle();
            component.form.leadType = 'HOT';
            fixture.detectChanges();
            await settle();
            const t = text();
            expect(t).toContain('Leads come from the hot leads pool');
            expect(t).toContain('Take from hot pool');
            expect(t).toContain('How many leads to take from the hot pool');
        });

        it('a hot pool campaign is sent as HOT', async () => {
            component.openCreate();
            await settle();
            component.form.name = 'Hot spring';
            component.form.leadType = 'HOT';
            component.create();
            expect(api.create.calls.mostRecent().args[0].lead_type).toBe('HOT');
            await settle();
        });

        it('a hot Excel campaign is sent as HOT', async () => {
            const createFromExcel = jasmine.createSpy('createFromExcel').and.callFake(() => respond({ message: 'ok' }));
            (api as any).createFromExcel = createFromExcel;
            component.openCreate();
            await settle();
            component.form.name = 'Hot sheet';
            component.form.leadType = 'HOT';
            component.form.leadSource = 'excel';
            component.selectedFile = new File(['x'], 'leads.xlsx');
            component.create();
            expect(createFromExcel.calls.mostRecent().args[0].lead_type).toBe('HOT');
            await settle();
        });

        it('a normal campaign is sent as NORMAL', async () => {
            component.openCreate();
            await settle();
            component.form.name = 'Plain';
            component.create();
            expect(api.create.calls.mostRecent().args[0].lead_type).toBe('NORMAL');
            await settle();
        });

        it('opening the form again starts on Normal, not on the last choice', async () => {
            component.openCreate();
            await settle();
            component.form.leadType = 'HOT';
            component.openCreate();
            await settle();
            expect(component.form.leadType).toBe('NORMAL');
        });

        it('the list shows each campaign\'s type; older ones without a type read as Normal', async () => {
            api.list.and.callFake((() => respond([...hotRows, { ...rows[1], _id: 'c0', name: 'Ancient' }])) as any);
            component.load();
            await settle();
            const tags = Array.from(document.querySelectorAll('p-tag.campaign-type')).map((e) => e.textContent.trim());
            expect(tags).toEqual(['Hot', 'Normal', 'Normal']);
            expect(text()).toContain('Type');
        });

        it('the opened campaign says what kind of leads it holds', async () => {
            api.detail.and.callFake((() => respond(detail({ lead_type: 'HOT' }))) as any);
            component.open(rows[0]);
            await settle();
            expect(document.querySelector('#detailType').textContent.trim()).toBe('Hot leads');
        });

        it('and an older campaign without a type reads as Normal', async () => {
            component.open(rows[0]);
            await settle();
            expect(document.querySelector('#detailType').textContent.trim()).toBe('Normal leads');
            expect(component.typeLabel(undefined)).toBe('Normal');
            expect(component.typeLabel('HOT')).toBe('Hot');
        });

        it('a refusal about an empty hot pool is shown', async () => {
            api.create.and.returnValue(throwError(() => ({ error: { message: 'There are no hot leads in the pool to take' } })));
            component.form = full({ name: 'x', staff: ['s1', 's2'], count: 5, leadType: 'HOT' });
            component.create();
            expect(lastToast().detail).toBe('There are no hot leads in the pool to take');
            expect(component.creating).toBeFalse();
        });
    });

    describe('rounds are started by hand only', () => {
        beforeEach(() => setup());

        it('the new-campaign form has no auto assignment or interval', async () => {
            component.openCreate();
            await settle();
            const t = text();
            expect(t).not.toContain('Auto assignment');
            expect(t).not.toContain('Assignment interval');
            expect(document.querySelector('#assignmentInterval')).toBeNull();
            expect(document.querySelector('input[name="autoAssignment"]')).toBeNull();
            expect('autoAssignment' in component.form).toBeFalse();
            expect('intervalMinutes' in component.form).toBeFalse();
        });

        it('a pool campaign is sent without any automatic settings', async () => {
            component.openCreate();
            await settle();
            component.form.name = 'Plain';
            component.create();
            const body = api.create.calls.mostRecent().args[0] as any;
            expect(Object.keys(body).sort()).toEqual(['count', 'lead_type', 'name', 'staff']);
            await settle();
        });

        it('an Excel campaign is sent without any automatic settings', async () => {
            const createFromExcel = jasmine.createSpy('createFromExcel').and.callFake(() => respond({ message: 'ok' }));
            (api as any).createFromExcel = createFromExcel;
            component.openCreate();
            await settle();
            component.form.name = 'Sheet';
            component.form.leadSource = 'excel';
            component.selectedFile = new File(['x'], 'leads.xlsx');
            component.create();
            const input = createFromExcel.calls.mostRecent().args[0];
            expect(Object.keys(input).sort()).toEqual(['file', 'lead_type', 'name', 'staff']);
            await settle();
        });

        it('an opened campaign shows no auto-assignment tile, but still has the button for the next round', async () => {
            api.detail.and.callFake((() => respond(detail({ auto_assignment: true, interval_minutes: 5 }))) as any);
            component.open(rows[0]);
            await settle();
            expect(text()).not.toContain('Auto assignment');
            expect(text()).not.toContain('Every 5 min');
            expect(document.querySelector('#nextRound')).toBeTruthy();
        });

        it('pressing the button only opens the window; a round starts when Start is pressed', async () => {
            component.open(rows[0]);
            await settle();
            component.askNextRound();
            await settle();
            expect(api.nextRound).not.toHaveBeenCalled();
            component.startRound();
            expect(api.nextRound).toHaveBeenCalledTimes(1);
            await settle();
        });
    });

    describe('one campaign', () => {
        beforeEach(async () => {
            await setup();
            component.open(rows[0]);
            await settle();
        });

        it('shows the round, the totals and what each person holds and has called', () => {
            expect(api.detail).toHaveBeenCalledWith('c2', undefined);
            const t = text();
            expect(t).toContain('Round');
            expect(t).toContain('amit (Amit K)');
            expect(t).toContain('RINGING: 80');
            expect(t).toContain('Start next round');
            expect(t).toContain('Close campaign');
        });

        it('closing asks first, then closes and refreshes', async () => {
            component.askClose();
            expect(confirm.calls.mostRecent().args[0].header).toContain('Close');
            expect(api.close).toHaveBeenCalledWith('c2', undefined);
            await settle();
            expect(lastToast().severity).toBe('success');
        });

        it('a campaign that cannot be opened closes the window and tells why', async () => {
            api.detail.and.returnValue(throwError(() => ({ error: { message: 'Campaign not found' } })));
            component.open(rows[1]);
            await settle();
            expect(component.showDetail).toBeFalse();
            expect(lastToast().detail).toBe('Campaign not found');
        });
    });

    describe('superadmin', () => {
        beforeEach(() => setup('superadmin'));

        it('picks a company first, and every call carries it', async () => {
            expect(component.selectedCompany).toBe('CA');
            expect(api.list).toHaveBeenCalledWith('CA');
            component.openCreate();
            expect(api.staff).toHaveBeenCalledWith('CA');
            await settle();
            component.form = full({ name: 'x', staff: ['s1', 's2'], count: 5 });
            component.create();
            expect(api.create).toHaveBeenCalledWith(jasmine.anything(), 'CA');
            await settle();
            component.open(rows[0]);
            component.detail = detail();
            component.askNextRound();
            expect(api.staff).toHaveBeenCalledWith('CA');
            await settle();
            component.startRound();
            expect(api.nextRound).toHaveBeenCalledWith('c2', jasmine.anything(), 'CA');
            await settle();
        });

        it('changing company reloads and closes any open campaign', async () => {
            component.showDetail = true;
            component.selectedCompany = 'CB';
            component.onCompanyChange();
            expect(component.showDetail).toBeFalse();
            expect(api.list).toHaveBeenCalledWith('CB');
        });

        it('a system with no companies at all says so', async () => {
            const branches: any = TestBed.inject(BranchesService);
            branches.getAll.and.callFake((() => respond({ data: [] })) as any);
            component.selectedCompany = '';
            component.companies = [];
            component.getCompanies();
            await settle();
            expect(text()).toContain('There are no companies yet');
            expect(text()).not.toContain('Choose a company first');
        });

        it('with no company nothing is called', async () => {
            api.list.calls.reset();
            api.staff.calls.reset();
            component.selectedCompany = '';
            component.load();
            component.openCreate();
            expect(api.list).not.toHaveBeenCalled();
            expect(api.staff).not.toHaveBeenCalled();
            fixture.detectChanges();
            expect(text()).toContain('Choose a company first');
        });
    });
});
