import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { CampaignsService, CampaignStaff } from 'src/app/services/campaigns/campaigns.service';

export const MAX_LEADS = 10000;

// Lead rotation: leads are split between the staff who are in today, and each
// round every batch moves on to the next person.
@Component({
    selector: 'app-campaign-list',
    templateUrl: './campaign-list.component.html',
    styleUrl: './campaign-list.component.scss',
    providers: [ConfirmationService, MessageService],
})
export class CampaignListComponent implements OnInit {
    role = '';
    companies: { name: string; code: string }[] = [];
    selectedCompany = '';
    companiesLoaded = false;

    campaigns: any[] = [];
    loading = false;

    // new campaign
    showCreate = false;
    creating = false;
    allStaff: CampaignStaff[] = [];
    selectedFile: File | null = null;
    form: {
        name: string;
        staff: string[];
        count: number | null;
        leadSource: 'pool' | 'excel';
        autoAssignment: boolean;
        intervalMinutes: number | null;
    } = this.emptyForm();
    readonly maxLeads = MAX_LEADS;

    // one campaign opened
    showDetail = false;
    detail: any = null;
    working = false;

    constructor(
        private campaignsService: CampaignsService,
        private branchService: BranchesService,
        private authService: AuthService,
        private toast: MessageService,
        private confirm: ConfirmationService
    ) {}

    ngOnInit() {
        this.role = this.authService.getRole();
        if (this.role == 'superadmin') {
            this.getCompanies();
        } else {
            this.load();
        }

    }

    private emptyForm() {
        return {
            name: '',
            staff: [] as string[],
            count: 100 as number | null,
            leadSource: 'pool' as 'pool' | 'excel',
            autoAssignment: false,
            intervalMinutes: 60,
        };
    }

    getCompanies() {
        this.branchService.getAll({ page: 0, size: 100 }).subscribe({
            next: (res: any) => {
                this.companies = res.data.map((item) => ({ name: item?.name, code: item?._id }));
                this.companiesLoaded = true;
                if (this.companies.length > 0) {
                    this.selectedCompany = this.companies[0].code;
                    this.load();
                }
            },
            error: (err) => {
                this.companiesLoaded = true;
                this.fail(err, 'Could not load the companies');
            },
        });
    }

    onCompanyChange() {
        this.showDetail = false;
        this.detail = null;
        this.load();
    }

    /** the company asked about: only superadmin chooses, the server fixes everyone else */
    private branch(): string | undefined {
        return this.role == 'superadmin' ? this.selectedCompany : undefined;
    }

    get hasCompany(): boolean {
        return !(this.role == 'superadmin' && !this.selectedCompany);
    }

    load() {
        if (!this.hasCompany) return;
        this.loading = true;
        this.campaignsService.list(this.branch()).subscribe({
            next: (res: any) => {
                this.campaigns = res ?? [];
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                this.fail(err, 'Could not load the campaigns');
            },
        });
    }

    // ------------------------------------------------------------- create

    openCreate() {
        if (!this.hasCompany) return;
        this.form = this.emptyForm();
        this.selectedFile = null;
        this.allStaff = [];
        this.showCreate = true;
        this.campaignsService.staff(this.branch()).subscribe({
            next: (res: any) => {
                this.allStaff = (res ?? []).filter((staff) => staff.present);
                this.form.staff = this.allStaff.map((staff) => staff._id);
            },
            error: (err) => this.fail(err, 'Could not load the staff'),
        });
    }

    // The same array is handed to the dropdown on every screen check. A getter
    // that built a new array each time made the screen re-check itself forever.
    private optionsFor: CampaignStaff[] | null = null;
    private optionsCache: { value: string; label: string }[] = [];
    get staffOptions() {
        if (this.optionsFor !== this.allStaff) {
            this.optionsFor = this.allStaff;
            this.optionsCache = this.allStaff.map((s) => ({
                value: s._id,
                label: `${s.username}${s.name ? ' (' + s.name + ')' : ''}`,
            }));
        }
        return this.optionsCache;
    }

    /** a plain sentence of what pressing Start will do */
    get preview(): string {
        const people = this.form.staff.length;
        const leads = Number(this.form.count);
        if (people < 2 || !Number.isInteger(leads) || leads < 1) return '';
        const each = Math.floor(leads / people);
        const share = leads % people ? `${each} or ${each + 1}` : `${each}`;
        return `${leads} leads over ${people} staff: ${share} each. After ${people} rounds everyone has had every lead.`;
    }

    get createProblem(): string {
        if (!this.form.name.trim()) return 'Give the campaign a name.';
        if (this.form.staff.length < 2) return 'Choose at least 2 staff.';
        if (this.form.autoAssignment) {
            const interval = Number(this.form.intervalMinutes);
            if (!Number.isInteger(interval) || interval < 1 || interval > 10080) {
                return 'Auto assignment interval must be a whole number from 1 to 10080 minutes.';
            }
        }
        if (this.form.leadSource === 'excel') {
            return this.selectedFile ? '' : 'Choose an Excel file.';
        }
        const n = Number(this.form.count);
        if (!Number.isInteger(n) || n < 1 || n > this.maxLeads) {
            return `Leads must be a whole number from 1 to ${this.maxLeads}.`;
        }
        return '';
    }

    create() {
        if (this.creating) return;
        const problem = this.createProblem;
        if (problem) {
            this.toast.add({ severity: 'warn', summary: 'Please check', detail: problem });
            return;
        }
        this.creating = true;
        const assignment = this.form.autoAssignment
            ? {
                auto_assignment: true,
                interval_minutes: Number(this.form.intervalMinutes),
            }
            : {};
        const request = this.form.leadSource === 'excel'
            ? this.campaignsService.createFromExcel(
                {
                    name: this.form.name.trim(),
                    staff: this.form.staff,
                    file: this.selectedFile!,
                    ...assignment,
                },
                this.branch()
            )
            : this.campaignsService.create(
                {
                    name: this.form.name.trim(),
                    staff: this.form.staff,
                    count: Number(this.form.count),
                    ...assignment,
                },
                this.branch()
            );
        request.subscribe({
                next: (res: any) => {
                    this.creating = false;
                    this.showCreate = false;
                    this.toast.add({
                        severity: 'success',
                        summary: 'Campaign started',
                        detail: res.message + (res.skipped ? ` (${res.skipped} skipped)` : ''),
                    });
                    this.load();
                },
                error: (err) => {
                    this.creating = false;
                    this.fail(err, 'Could not start the campaign');
                },
            });
    }

    onExcelSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        if (file && !/\.xlsx?$/i.test(file.name)) {
            this.selectedFile = null;
            input.value = '';
            this.toast.add({ severity: 'warn', summary: 'Choose an Excel file', detail: 'Upload a .xls or .xlsx file.' });
            return;
        }
        this.selectedFile = file;
    }

    downloadSampleExcel() {
        import('xlsx').then((xlsx) => {
            const worksheet = xlsx.utils.json_to_sheet([
                { mobile: '9876543210', first_name: 'Amit', last_name: 'Sharma' },
                { mobile: '9876543211', first_name: '', last_name: '' },
            ], { header: ['mobile', 'first_name', 'last_name'] });
            const workbook = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Campaign leads');
            xlsx.writeFile(workbook, 'campaign-leads-sample.xlsx');
        });
    }

    // ------------------------------------------------------------- detail

    open(row: any) {
        this.showDetail = true;
        this.detail = null;
        this.loadDetail(row._id);
    }

    private loadDetail(id: string) {
        this.campaignsService.detail(id, this.branch()).subscribe({
            next: (res: any) => (this.detail = res),
            error: (err) => {
                this.showDetail = false;
                this.fail(err, 'Could not open the campaign');
            },
        });
    }

    askNextRound() {
        if (!this.detail || this.working) return;
        const d = this.detail;
        const waiting = d.untouched
            ? ` ${d.untouched} lead${d.untouched == 1 ? ' has' : 's have'} not been called yet; they will be taken from their holder and moved on too.`
            : '';
        this.confirm.confirm({
            header: 'Start the next round?',
            message: `Every lead that is not finished moves to the next person (round ${d.round + 1} of ${d.rounds}).${waiting}`,
            acceptLabel: 'Start next round',
            rejectLabel: 'Cancel',
            accept: () => this.nextRound(),
        });
    }

    private nextRound() {
        if (this.working) return;
        this.working = true;
        const id = this.detail._id;
        this.campaignsService.nextRound(id, this.branch()).subscribe({
            next: (res: any) => {
                this.working = false;
                this.toast.add({ severity: 'success', summary: 'Next round', detail: res.message });
                this.loadDetail(id);
                this.load();
            },
            error: (err) => {
                this.working = false;
                this.fail(err, 'Could not start the next round');
                this.loadDetail(id);
            },
        });
    }

    askClose() {
        if (!this.detail || this.working) return;
        this.confirm.confirm({
            header: 'Close this campaign?',
            message: 'No more rounds can be started. Leads stay with whoever has them now.',
            acceptLabel: 'Close campaign',
            rejectLabel: 'Cancel',
            accept: () => this.close(),
        });
    }

    private close() {
        if (this.working) return;
        this.working = true;
        const id = this.detail._id;
        this.campaignsService.close(id, this.branch()).subscribe({
            next: () => {
                this.working = false;
                this.toast.add({ severity: 'success', summary: 'Closed', detail: 'The campaign is closed.' });
                this.loadDetail(id);
                this.load();
            },
            error: (err) => {
                this.working = false;
                this.fail(err, 'Could not close the campaign');
                this.loadDetail(id);
            },
        });
    }

    // Built once per loaded campaign, not on every screen check.
    private statusesFor: any = null;
    private statusCache: { status: string; count: number }[] = [];
    statusList(): { status: string; count: number }[] {
        const source = this.detail?.statuses ?? null;
        if (this.statusesFor !== source) {
            this.statusesFor = source;
            this.statusCache = Object.entries(source ?? {}).map(([status, count]) => ({
                status,
                count: count as number,
            }));
        }
        return this.statusCache;
    }

    private fail(err: any, fallback: string) {
        const message = err?.error?.message;
        this.toast.add({
            severity: 'error',
            summary: 'Error',
            detail: Array.isArray(message) ? message.join(', ') : message || fallback,
        });
    }
}
