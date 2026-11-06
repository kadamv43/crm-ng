import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { LeadsModule } from './leads.module';
import { HotLeadsModule } from '../hot-leads/hot-leads.module';
import { AssignedLeadsComponent } from './assigned-leads/assigned-leads.component';
import { AssignedHotLeadsComponent } from '../hot-leads/assigned-hot-leads/assigned-hot-leads.component';
import { HotLeadsListComponent } from '../hot-leads/hot-leads-list/hot-leads-list.component';
import { HotLeadsService } from '../services/hot-leads/hot-leads.service';
import { UserHotLeadsService } from '../services/user-hot-leads/user-hot-leads.service';
import { UserLeadsService } from '../services/user-leads/user-leads.service';
import { UsersService } from '../services/users/users.service';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';

// The Filter / Clear buttons and date pickers of the three lead lists that
// used to do nothing (the button called a method that did not exist).
const reply = { data: [{ _id: '1', mobile: '9000000001' }], total: 1 };

// answers arrive later, as real HTTP responses do
const answer = () => of(reply).pipe(delay(0)) as any;
const pause = () => new Promise((r) => setTimeout(r, 20));

describe('lead list filters', () => {
    let userLeads: jasmine.SpyObj<UserLeadsService>;
    let hotLeads: jasmine.SpyObj<HotLeadsService>;

    const paramsOf = (spy: jasmine.Spy, call = -1) => {
        const calls = spy.calls.all();
        const p = (call < 0 ? calls[calls.length + call] : calls[call]).args[0];
        const out: any = {};
        p.keys().forEach((k) => (out[k] = p.get(k)));
        return out;
    };

    async function render<T>(component: new (...a: any[]) => T, module: any) {
        userLeads = jasmine.createSpyObj('UserLeadsService', [
            'getAssignedLeads',
            'getAssignedHotLeads',
            'deleteBulk',
            'createBulk',
        ]);
        userLeads.getAssignedLeads.and.callFake(answer);
        userLeads.getAssignedHotLeads.and.callFake(answer);
        hotLeads = jasmine.createSpyObj('HotLeadsService', ['getAll', 'deleteBulk']);
        hotLeads.getAll.and.callFake(answer);

        await TestBed.configureTestingModule({
            imports: [module, NoopAnimationsModule],
            providers: [
                { provide: UserLeadsService, useValue: userLeads },
                { provide: HotLeadsService, useValue: hotLeads },
                {
                    provide: UserHotLeadsService,
                    useValue: jasmine.createSpyObj('UserHotLeadsService', ['deleteBulk', 'createBulk']),
                },
                {
                    provide: UsersService,
                    useValue: { getAll: () => of({ data: [], total: 0 }) },
                },
                { provide: AuthService, useValue: { getRole: () => 'admin' } },
                { provide: ApiService, useValue: {} },
                { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']) },
                { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(component);
        fixture.detectChanges();
        await pause();
        fixture.detectChanges();
        return fixture as ComponentFixture<any>;
    }

    const button = (fixture: ComponentFixture<any>, label: string): HTMLButtonElement =>
        Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button')).find(
            (b) => b.textContent.trim() === label
        );

    // the same checks for each of the three pages
    const pages = [
        {
            name: 'Assigned Leads',
            component: AssignedLeadsComponent,
            module: LeadsModule,
            api: () => userLeads.getAssignedLeads,
            hasSearch: false,
        },
        {
            name: 'Assigned Hot Leads',
            component: AssignedHotLeadsComponent,
            module: HotLeadsModule,
            api: () => userLeads.getAssignedHotLeads,
            hasSearch: false,
        },
        {
            name: 'Hot Leads (pool)',
            component: HotLeadsListComponent,
            module: HotLeadsModule,
            api: () => hotLeads.getAll,
            hasSearch: true,
        },
    ];

    for (const page of pages) {
        describe(page.name, () => {
            let fixture: ComponentFixture<any>;
            let cmp: any;

            beforeEach(async () => {
                fixture = await render(page.component as any, page.module);
                cmp = fixture.componentInstance;
                (page.api() as jasmine.Spy).calls.reset();
            });

            it('has a Filter and a Clear button', () => {
                expect(button(fixture, 'Filter')).toBeTruthy();
                expect(button(fixture, 'Clear')).toBeTruthy();
            });

            it('clicking Filter really asks the server, with the dates the user picked', () => {
                cmp.selectedDate = [new Date(2025, 2, 10), new Date(2025, 2, 12)];
                button(fixture, 'Filter').click();
                const spy = page.api() as jasmine.Spy;
                expect(spy).toHaveBeenCalledTimes(1);
                const p = paramsOf(spy);
                expect(p.from).toBe('2025-03-10');
                expect(p.to).toBe('2025-03-12');
                expect(p.page).toBe('0');
            });

            it('an unfinished range filters that one day instead of sending "null"', () => {
                cmp.selectedDate = [new Date(2025, 2, 10), null];
                button(fixture, 'Filter').click();
                const p = paramsOf(page.api() as jasmine.Spy);
                expect(p.from).toBe('2025-03-10');
                expect(p.to).toBe('2025-03-10');
            });

            it('a cleared calendar does not break the page and sends no dates', () => {
                cmp.selectedDate = null;
                expect(() => button(fixture, 'Filter').click()).not.toThrow();
                const p = paramsOf(page.api() as jasmine.Spy);
                expect(p.from).toBeUndefined();
                expect(p.to).toBeUndefined();
            });

            it('filtering starts again from the first page', () => {
                const table = cmp.table ?? fixture.debugElement.query((d) => d.name === 'p-table')?.componentInstance;
                table.first = 100;
                button(fixture, 'Filter').click();
                expect(table.first).toBe(0);
                expect(paramsOf(page.api() as jasmine.Spy).page).toBe('0');
            });

            it('Clear forgets the dates and reloads without them', () => {
                cmp.selectedDate = [new Date(2025, 2, 10), new Date(2025, 2, 12)];
                cmp.searchText = 'asha';
                button(fixture, 'Clear').click();
                expect(cmp.selectedDate).toBe('');
                expect(cmp.searchText).toBe('');
                const p = paramsOf(page.api() as jasmine.Spy);
                expect(p.from).toBeUndefined();
                expect(p.q).toBeUndefined();
            });

            it('without picking anything Filter sends no dates', () => {
                button(fixture, 'Filter').click();
                const p = paramsOf(page.api() as jasmine.Spy);
                expect(p.from).toBeUndefined();
                expect(p.to).toBeUndefined();
            });

            it('shows what the server returns', async () => {
                button(fixture, 'Filter').click();
                await pause();
                fixture.detectChanges();
                expect(cmp.appointments.length).toBe(1);
                expect(cmp.totalRecords).toBe(1);
                expect(cmp.loading).toBeFalse();
            });

            if (page.hasSearch) {
                it('the search text goes along with the dates', () => {
                    cmp.searchText = 'asha';
                    cmp.selectedDate = [new Date(2025, 2, 10), new Date(2025, 2, 10)];
                    button(fixture, 'Filter').click();
                    const p = paramsOf(page.api() as jasmine.Spy);
                    expect(p.q).toBe('asha');
                    expect(p.from).toBe('2025-03-10');
                });
            }
        });
    }

    describe('Hot Leads (pool)', () => {
        it('no longer has the status dropdown that could never filter anything', async () => {
            const fixture = await render(HotLeadsListComponent as any, HotLeadsModule);
            const placeholders = Array.from<HTMLElement>(
                fixture.nativeElement.querySelectorAll('p-dropdown')
            ).map((d) => d.getAttribute('placeholder'));
            expect(placeholders).not.toContain('Select Status');
        });
    });
});
