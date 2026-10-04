/** Mirrors App\Support\DueDiligence\CasePresenter::ORDER. */
export const CASE_ORDER = ['consent_pending', 'intake_open', 'ready_for_checks', 'checks_running', 'review_required', 'partner_review', 'report_draft', 'approved_for_release', 'delivered', 'disputed', 'monitoring', 'closed'];

export function CasePresenterRank(status: string): number {
    const i = CASE_ORDER.indexOf(status);
    return i < 0 ? 0 : i;
}
