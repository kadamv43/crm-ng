import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import * as FileSaver from 'file-saver';
import { AuthService } from 'src/app/services/auth.service';
import { BranchesService } from 'src/app/services/branches/branches.service';
import { CampaignsService, CampaignStaff } from 'src/app/services/campaigns/campaigns.service';
import { CommonService } from 'src/app/services/common/common.service';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';

export const MAX_LEADS = 10000;

// The statuses a lead can be in, and the ones that move to the next person
// unless the admin chooses otherwise (everything but the finished ones).
export const STATUS_OPTIONS = [
    { value: 'FRESH', label: 'Not called yet' },
    { value: 'CALLBACK', label: 'Callback' },
    { value: 'FREE_TRIAL', label: 'Free trial' },
    { value: 'RINGING', label: 'Ringing' },
    { value: 'SWITCHED_OFF', label: 'Switched off' },
    { value: 'DEAD', label: 'Dead' },
    { value: 'NOT_REACHABLE', label: 'Not reachable' },
    { value: 'NOT_INTERESTED', label: 'Not interested' },
    { value: 'EXPECTED_PAYMENT', label: 'Expected payment' },
    { value: 'PAYMENT_DONE', label: 'Payment done' },
];
export const DEFAULT_MOVE_STATUSES = STATUS_OPTIONS.map((s) => s.value).filter(
    (s) => !['PAYMENT_DONE', 'NOT_INTERESTED', 'DEAD'].includes(s)
);

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
        leadType: 'NORMAL' | 'HOT';
    } = this.emptyForm();
    readonly maxLeads = MAX_LEADS;
    readonly statusOptions = STATUS_OPTIONS;

    // one campaign opened
    showDetail = false;
    detail: any = null;
    working = false;

    // the window for starting round 2, 3, ...
    showRound = false;
    roundStarting = false;
    roundStatuses: string[] = [];
    roundStaff: string[] = [];
    roundStaffList: CampaignStaff[] = [];
    exportingCampaignId: string | null = null;

    constructor(
        private campaignsService: CampaignsService,
        private branchService: BranchesService,
        private authService: AuthService,
        private toast: MessageService,
        private confirm: ConfirmationService,
        private dashboardService: DashboardService,
        private commonService: CommonService
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
            leadType: 'NORMAL' as 'NORMAL' | 'HOT',
        };
    }

    /** "Hot" or "Normal", as shown in the list and the opened campaign */
    typeLabel(type: string | undefined): string {
        return type === 'HOT' ? 'Hot' : 'Normal';
    }

    /** the name staff see for a status */
    statusLabel(status: string): string {
        return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
    }

    moveStatusesLabel(statuses: string[] | undefined): string {
        return (statuses ?? []).map((s) => this.statusLabel(s)).join(', ');
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
        const assignment = { lead_type: this.form.leadType };
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

    downloadReport(row: any) {
        if (this.exportingCampaignId) return;

        const params: Record<string, any> = {
            user: localStorage.getItem('userId'),
            campaign_report: true,
            campaign_id: row._id,
            excel: true,
        };
        const branch = this.branch();
        if (branch) params['branch'] = branch;

        this.exportingCampaignId = row._id;
        const query = this.commonService.getHttpParamsByJson(params);
        this.dashboardService.getReports(query).subscribe({
            next: (res: any) => {
                const records = res?.data ?? [];
                import('xlsx')
                    .then((xlsx) => {
                        const workbook = xlsx.utils.book_new();
                        const reportedRounds = records.map(
                            (item: any) => Number(item.campaign_round) || 1
                        );
                        const lastRound = Math.max(
                            Number(row.round) || 1,
                            ...reportedRounds
                        );
                        const rounds = Array.from(
                            { length: lastRound },
                            (_, index) => index + 1
                        );

                        rounds.forEach((round: number) => {
                            const rows = records
                                .filter(
                                    (item: any) =>
                                        (Number(item.campaign_round) || 1) === round
                                )
                                .map((item: any) => this.toCampaignReportRow(item, round));
                            const worksheet = xlsx.utils.json_to_sheet(rows, {
                                header: Object.keys(this.toCampaignReportRow({})),
                            });
                            xlsx.utils.book_append_sheet(workbook, worksheet, `Round ${round}`);
                        });

                        const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
                        const blob = new Blob([buffer], {
                            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
                        });
                        const safeName = String(row.name || 'campaign').replace(/[^a-z0-9-_]+/gi, '-');
                        FileSaver.saveAs(blob, `${safeName}-report-${Date.now()}.xlsx`);
                    })
                    .catch(() => this.fail(null, 'Could not create the Excel report'))
                    .finally(() => (this.exportingCampaignId = null));
            },
            error: (err) => {
                this.exportingCampaignId = null;
                this.fail(err, 'Could not download the campaign report');
            },
        });
    }

    private toCampaignReportRow(item: any, round = Number(item.campaign_round) || 1) {
        return {
            Round: round,
            'Lead Type': item.is_hot_lead ? 'Hot Lead' : 'Normal Lead',
            'Assigned Staff': item.userDetails?.username ?? '',
            'Campaign Name': item.campaign_name ?? '',
            Mobile: item.mobile ?? '',
            Name: item.name ?? '',
            City: item.city ?? '',
            Status: item.status ?? '',
            'Created Date': item.created_at ?? '',
            'Free Trial Investment': item.free_trial?.investment ?? '',
            'Free Trial Date': item.free_trial?.free_trial_date ?? '',
            'Free Trial Remark': item.free_trial?.remark ?? '',
            'Free Trial Options': Array.isArray(item.free_trial?.options)
                ? item.free_trial.options.join(', ')
                : item.free_trial?.options ?? '',
            'Expected Payment': item.follow_up?.expected_payment ?? '',
            'Expected Payment Date': item.follow_up?.expected_payment_date ?? '',
            'Paid Amount': item.payment?.payment_amount ?? '',
            'Payment Mode': item.payment?.payment_mode ?? '',
            'Payment Date': item.payment?.payment_date ?? '',
        };
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

    // ------------------------------------------------------- next round

    /** Opens the window where the admin picks the statuses and the staff for this round. */
    askNextRound() {
        if (!this.detail || this.working || this.roundStarting) return;
        this.roundStatuses = [...(this.detail.move_statuses?.length ? this.detail.move_statuses : DEFAULT_MOVE_STATUSES)];
        this.roundStaff = [];
        this.roundStaffList = [];
        this.showRound = true;
        this.campaignsService.staff(this.branch()).subscribe({
            next: (res: any) => {
                this.roundStaffList = (res ?? []).filter((staff) => staff.present);
                // everyone who logged in today is ticked to start with
                this.roundStaff = this.roundStaffList.map((staff) => staff._id);
            },
            error: (err) => this.fail(err, 'Could not load the staff'),
        });
    }

    // The same array on every screen check (see staffOptions).
    private roundOptionsFor: CampaignStaff[] | null = null;
    private roundOptionsCache: { value: string; label: string }[] = [];
    get roundStaffOptions() {
        if (this.roundOptionsFor !== this.roundStaffList) {
            this.roundOptionsFor = this.roundStaffList;
            this.roundOptionsCache = this.roundStaffList.map((s) => ({
                value: s._id,
                label: `${s.username}${s.name ? ' (' + s.name + ')' : ''}`,
            }));
        }
        return this.roundOptionsCache;
    }

    get roundProblem(): string {
        if (this.roundStaff.length < 1) return 'Choose at least one staff member for this round.';
        if (this.roundStatuses.length < 1) return 'Choose at least one status to move on.';
        return '';
    }

    startRound() {
        if (this.roundStarting || !this.detail) return;
        const problem = this.roundProblem;
        if (problem) {
            this.toast.add({ severity: 'warn', summary: 'Please check', detail: problem });
            return;
        }
        this.roundStarting = true;
        const id = this.detail._id;
        this.campaignsService
            .nextRound(id, { staff: this.roundStaff, move_statuses: this.roundStatuses }, this.branch())
            .subscribe({
                next: (res: any) => {
                    this.roundStarting = false;
                    this.showRound = false;
                    this.toast.add({ severity: 'success', summary: 'Next round', detail: res.message });
                    this.loadDetail(id);
                    this.load();
                },
                error: (err) => {
                    // stay in the window so the choice can be changed and tried again
                    this.roundStarting = false;
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
