<?php

namespace App\Support\Platform;

/**
 * Role mailbox register (22 seats) from the client's
 * "TBCA_WebApp_Employee_Email_Register_22" document (Oct 2026).
 *
 * All mailboxes are PROPOSED and not yet active. Note: HC codes are role codes,
 * not unique per seat; "additional seat" rows share their role's HC code.
 *
 * The NIKIWE functional-lead routing table mirrors this register in
 * resources/js/Components/Assistant/personas.ts (FUNCTIONAL_LEADS) — keep in sync.
 */
class Directory
{
    public const STATUS = 'proposed — not yet active';

    public const GENERAL_EMAIL = 'Consult@thebusinessclinic.africa';

    /**
     * [hc_code, position, mailbox, additional seat, client-facing, what to contact them about]
     * Client-facing = shown on the public "Contact a Functional Lead" directory.
     */
    private const ROWS = [
        ['HC-001', 'Managing Partner / Executive Sponsor', 'managingpartner', false, true, 'Executive escalations, strategic mandates and deal-room transactions'],
        ['HC-002', 'Programme Manager / PMO Lead', 'programmemanager', false, false, null],
        ['HC-004', 'Product Owner / Platform Product Lead', 'productlead', false, true, 'Platform feedback and feature requests'],
        ['HC-011', 'Finance Controller and Systems Lead', 'financecontroller', false, true, 'Invoices, billing, payments and refunds'],
        ['HC-013', 'Solution Architect', 'solutionarchitect', false, true, 'Technology solutions, integrations and digital builds'],
        ['HC-014', 'Automation and Integration Engineer', 'automationengineer', false, false, null],
        ['HC-015', 'Zoho Platform Administrator', 'zohoadmin', false, false, null],
        ['HC-016', 'AI, RAG and Model Operations Engineer', 'aiengineer', false, false, null],
        ['HC-017', 'Security Engineer and Incident Commander', 'securitylead', false, false, null],
        ['HC-018', 'Information Officer / Privacy Lead', 'informationofficer', false, true, 'POPIA / PAIA requests, privacy and data-subject rights'],
        ['HC-019', 'Quality Assurance and Model Risk Lead', 'qalead', false, false, null],
        ['HC-007', 'Advisory and Delivery Lead', 'advisorylead', false, true, 'Advisory engagements and due diligence cases'],
        ['HC-020', 'QA Analyst', 'qaanalyst', false, false, null],
        ['HC-021', 'Client Success and Support Specialist', 'clientsuccess', false, true, 'Account help, portal access and general support'],
        ['HC-022', 'Delivery Coordinator', 'deliverycoordinator', false, true, 'Sprint orders, shop purchases and delivery timelines'],
        ['HC-023', 'Data, BI and Benefits Analyst', 'dataanalyst', false, true, 'AIIM investment intelligence, data and reporting'],
        ['HC-025', 'People, Change and Capability Lead', 'peoplelead', false, false, null],
        ['HC-003', 'Operations Manager / Service Operations Lead', 'operationslead', false, true, 'Service operations, complaints and service levels'],
        ['HC-014', 'Automation and Integration Engineer (additional seat)', 'automationengineer2', true, false, null],
        ['HC-020', 'QA Analyst (additional seat)', 'qaanalyst2', true, false, null],
        ['HC-021', 'Client Success and Support Specialist (additional seat)', 'clientsuccess2', true, false, null],
        ['HC-022', 'Delivery Coordinator (additional seat)', 'deliverycoordinator2', true, false, null],
    ];

    /** All 22 role mailboxes. */
    public static function all(): array
    {
        return array_map(fn (array $r) => [
            'hc_code' => $r[0],
            'position' => $r[1],
            'email' => $r[2].'@thebusinessclinic.africa',
            'additional_seat' => $r[3],
            'client_facing' => $r[4],
            'topic' => $r[5],
            'status' => self::STATUS,
        ], self::ROWS);
    }

    /** Client-facing roles for the public Contact page (primary seats only). */
    public static function clientFacing(): array
    {
        return array_values(array_filter(self::all(), fn (array $r) => $r['client_facing']));
    }

    public static function byMailbox(string $mailbox): ?array
    {
        foreach (self::all() as $row) {
            if (strtolower($row['email']) === strtolower($mailbox.'@thebusinessclinic.africa')) {
                return $row;
            }
        }

        return null;
    }
}
