import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { LeadsModule } from '../leads.module';
import { AssignedLeadsComponent } from './assigned-leads.component';
import { UserLeadsService } from 'src/app/services/user-leads/user-leads.service';
import { UserHotLeadsService } from 'src/app/services/user-hot-leads/user-hot-leads.service';
import { HotLeadsService } from 'src/app/services/hot-leads/hot-leads.service';
import { UsersService } from 'src/app/services/users/users.service';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';

const answer = () => of({ data: [{ _id: '1', mobile: '9000000001', user: { username: 'amit' } }], total: 1 }).pipe(delay(0)) as any;
const pause = () => new Promise((r) => setTimeout(r, 20));

// The Username box of the Assigned Leads page: admin and superadmin only.
describe('Assigned Leads: username filter', () => {
    let userLeads: jasmine.SpyObj<UserLeadsService>;
    let fixture: ComponentFixture<AssignedLeadsComponent>;
    let cmp: any;

    const paramsOf = (call = -1) => {
        const calls = userLeads.getAssignedLeads.calls.all();
        const p = (call < 0 ? calls[calls.length + call] : calls[call]).args[0] as any;
        const out: any = {};
        p.keys().forEach((k) => (out[k] = p.get(k)));
        return out;
    };
    const box = (): HTMLInputElement => fixture.nativeElement.querySelector('#usernameFilter');
    const button = (label: string): HTMLButtonElement =>
        Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find((b) => b.textContent.trim() === label);
    const type = async (text: string) => {
        box().value = text;
        box().dispatchEvent(new Event('input'));
        await pause();
        fixture.detectChanges();
    };

    async function setup(role: string) {
        userLeads = jasmine.createSpyObj('UserLeadsService', ['getAssignedLeads', 'deleteBulk', 'createBulk']);
        userLeads.getAssignedLeads.and.callFake(answer);
        await TestBed.configureTestingModule({
            imports: [LeadsModule, NoopAnimationsModule],
            providers: [
                { provide: UserLeadsService, useValue: userLeads },
                { provide: HotLeadsService, useValue: jasmine.createSpyObj('HotLeadsService', ['getAll', 'delete']) },
                { provide: UserHotLeadsService, useValue: jasmine.createSpyObj('UserHotLeadsService', ['deleteBulk']) },
                { provide: UsersService, useValue: { getAll: () => of({ data: [], total: 0 }) } },
                { provide: AuthService, useValue: { getRole: () => role } },
                { provide: ApiService, useValue: {} },
                { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
                { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(AssignedLeadsComponent);
        cmp = fixture.componentInstance;
        fixture.detectChanges();
        await pause();
        fixture.detectChanges();
        userLeads.getAssignedLeads.calls.reset();
    }

    for (const role of ['admin', 'superadmin']) {
        describe(role, () => {
            beforeEach(() => setup(role));

            it('sees the Username box', () => {
                expect(box()).toBeTruthy();
                expect(box().placeholder).toBe('Username');
            });

            it('Filter sends what was typed, without the surrounding spaces', async () => {
                await type('  amit ');
                button('Filter').click();
                expect(userLeads.getAssignedLeads).toHaveBeenCalledTimes(1);
                expect(paramsOf().username).toBe('amit');
                expect(paramsOf().page).toBe('0');
            });

            it('pressing Enter in the box filters too', async () => {
                await type('riya');
                box().dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
                expect(userLeads.getAssignedLeads).toHaveBeenCalledTimes(1);
                expect(paramsOf().username).toBe('riya');
            });

            it('an empty or blank box sends no username at all', async () => {
                await type('   ');
                button('Filter').click();
                expect('username' in paramsOf()).toBeFalse();
            });

            it('goes back to the first page when the username changes', async () => {
                await type('amit');
                cmp.loadBLogs({ first: 100, rows: 50 });
                expect(paramsOf().page).toBe('2');
                button('Filter').click();
                expect(paramsOf().page).toBe('0');
            });

            it('works together with the date range', async () => {
                await type('amit');
                cmp.selectedDate = [new Date(2025, 2, 10), new Date(2025, 2, 12)];
                button('Filter').click();
                const p = paramsOf();
                expect(p.username).toBe('amit');
                expect(p.from).toBe('2025-03-10');
                expect(p.to).toBe('2025-03-12');
            });

            it('paging keeps the username', async () => {
                await type('amit');
                button('Filter').click();
                cmp.loadBLogs({ first: 50, rows: 50 });
                expect(paramsOf().username).toBe('amit');
                expect(paramsOf().page).toBe('1');
            });

            it('Clear empties the box and shows everyone again', async () => {
                await type('amit');
                button('Filter').click();
                button('Clear').click();
                await pause();
                fixture.detectChanges();
                await fixture.whenStable();
                fixture.detectChanges();
                expect(cmp.username).toBe('');
                expect(box().value).toBe('');
                expect('username' in paramsOf()).toBeFalse();
            });

            it('shows the answer in the table', async () => {
                await type('amit');
                button('Filter').click();
                await pause();
                fixture.detectChanges();
                expect(fixture.nativeElement.textContent).toContain('amit');
                expect(cmp.totalRecords).toBe(1);
            });
        });
    }

    for (const role of ['teamlead', 'employee']) {
        describe(role, () => {
            beforeEach(() => setup(role));

            it('does not see the Username box', () => {
                expect(box()).toBeNull();
            });

            it('never sends a username, even if one was set', () => {
                cmp.username = 'amit';
                button('Filter').click();
                expect('username' in paramsOf()).toBeFalse();
            });
        });
    }
});
