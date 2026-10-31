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
            expect(text()).toContain('2 of 10');
            expect(text()).toContain('Old one');
            expect(text()).toContain('3 of 3');
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
            expect(component.staffOptions[2].label).toContain('not in today');
        });

        it('the problems are named and nothing is sent', () => {
            const send = () => {
                api.create.calls.reset();
                component.create();
                return api.create.calls.count();
            };
            component.form = { name: '', staff: ['s1', 's2'], count: 10 };
            expect(send()).toBe(0);
            expect(lastToast().detail).toContain('name');
            component.form = { name: 'x', staff: ['s1'], count: 10 };
            expect(send()).toBe(0);
            expect(lastToast().detail).toContain('2 staff');
            for (const bad of [0, -3, 1.5, 10001, null, NaN]) {
                component.form = { name: 'x', staff: ['s1', 's2'], count: bad as any };
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
            expect(api.create).toHaveBeenCalledWith({ name: 'Spring', staff: ['s1', 's2'], count: 40 }, undefined);
            await settle();
            expect(component.showCreate).toBeFalse();
            expect(lastToast().severity).toBe('success');
            expect(api.list).toHaveBeenCalledTimes(2);
        });

        it('a second click while it is working sends nothing more', async () => {
            component.form = { name: 'x', staff: ['s1', 's2'], count: 5 };
            component.create();
            component.create();
            expect(api.create).toHaveBeenCalledTimes(1);
            await settle();
        });

        it('a refusal (for example the name is taken) is shown and the dialog stays open', async () => {
            api.create.and.returnValue(throwError(() => ({ error: { message: 'A campaign with this name already exists' } })));
            component.showCreate = true;
            component.form = { name: 'x', staff: ['s1', 's2'], count: 5 };
            component.create();
            expect(lastToast().detail).toBe('A campaign with this name already exists');
            expect(component.showCreate).toBeTrue();
            expect(component.creating).toBeFalse();
        });

        it('mentions leads that were no longer in the pool', async () => {
            api.create.and.callFake((() => respond({ message: '3 leads handed to 2 staff', skipped: 1 })) as any);
            component.form = { name: 'x', staff: ['s1', 's2'], count: 4 };
            component.create();
            await settle();
            expect(lastToast().detail).toContain('1 no longer in the pool');
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
            expect(t).toContain('2 of 10');
            expect(t).toContain('amit (Amit K)');
            expect(t).toContain('RINGING: 80');
            expect(t).toContain('Start next round');
            expect(t).toContain('Close campaign');
        });

        it('next round: asks first, mentions the leads nobody called, then moves and refreshes', async () => {
            component.askNextRound();
            expect(confirm.calls.mostRecent().args[0].message).toContain('7 leads have not been called yet');
            expect(confirm.calls.mostRecent().args[0].message).toContain('round 3 of 10');
            expect(api.nextRound).toHaveBeenCalledWith('c2', undefined);
            await settle();
            expect(lastToast().detail).toContain('Round 3');
            expect(api.detail).toHaveBeenCalledTimes(2);
            expect(component.working).toBeFalse();
        });

        it('says nothing about uncalled leads when there are none', () => {
            component.detail = detail({ untouched: 0 });
            component.askNextRound();
            expect(confirm.calls.mostRecent().args[0].message).not.toContain('not been called');
        });

        it('a refused next round (someone else clicked first) is shown and the page refreshes', async () => {
            api.nextRound.and.returnValue(throwError(() => ({ error: { message: 'The round was just changed by someone else.' } })));
            component.askNextRound();
            await settle();
            expect(lastToast().detail).toContain('just changed');
            expect(api.detail).toHaveBeenCalledTimes(2);
            expect(component.working).toBeFalse();
        });

        it('the last round has no next-round button, only a note', async () => {
            component.detail = detail({ round: 10, can_next_round: false });
            fixture.detectChanges();
            expect(fixture.nativeElement.ownerDocument.querySelector('#nextRound')).toBeNull();
            expect(text()).toContain('This is the last round');
        });

        it('a closed campaign has no buttons', async () => {
            component.detail = detail({ status: 'COMPLETED', can_next_round: false });
            fixture.detectChanges();
            const doc = fixture.nativeElement.ownerDocument;
            expect(doc.querySelector('#nextRound')).toBeNull();
            expect(doc.querySelector('#closeCampaign')).toBeNull();
            expect(text()).not.toContain('This is the last round');
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
            component.form = { name: 'x', staff: ['s1', 's2'], count: 5 };
            component.create();
            expect(api.create).toHaveBeenCalledWith(jasmine.anything(), 'CA');
            await settle();
            component.open(rows[0]);
            component.detail = detail();
            component.askNextRound();
            expect(api.nextRound).toHaveBeenCalledWith('c2', 'CA');
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
