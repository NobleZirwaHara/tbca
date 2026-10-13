<?php

/*
|--------------------------------------------------------------------------
| Zoho One integration
|--------------------------------------------------------------------------
| Laravel stays the customer experience; Zoho One is the operating backbone
| reached only from the server. Domain events are written to the
| integration ledger (integration_events) and sent by `php artisan zoho:sync`.
|
| The integration is OFF until ZOHO_ENABLED=true and the OAuth credentials
| below are filled. While it is off, events are still recorded with the
| status "held" so the automation measure works, but nothing leaves the app.
|
| OAuth credentials come from the Zoho API console (api-console.zoho.<dc>),
| using a Self Client or a Server-based client. Never put a Zoho user
| password in this file or in .env.
*/

return [

    'enabled' => (bool) env('ZOHO_ENABLED', false),

    /*
    | Data centre chosen when the Zoho One account was created. It decides the
    | accounts server and every API host. Options: us, eu, in, au, jp, ca, sa,
    | uk, ae. Hosts can be overridden one by one if Zoho changes them.
    */
    'dc' => env('ZOHO_DC', 'eu'),

    'datacentres' => [
        'us' => ['accounts' => 'https://accounts.zoho.com', 'api' => 'https://www.zohoapis.com', 'desk' => 'https://desk.zoho.com', 'projects' => 'https://projectsapi.zoho.com'],
        'eu' => ['accounts' => 'https://accounts.zoho.eu', 'api' => 'https://www.zohoapis.eu', 'desk' => 'https://desk.zoho.eu', 'projects' => 'https://projectsapi.zoho.eu'],
        'in' => ['accounts' => 'https://accounts.zoho.in', 'api' => 'https://www.zohoapis.in', 'desk' => 'https://desk.zoho.in', 'projects' => 'https://projectsapi.zoho.in'],
        'au' => ['accounts' => 'https://accounts.zoho.com.au', 'api' => 'https://www.zohoapis.com.au', 'desk' => 'https://desk.zoho.com.au', 'projects' => 'https://projectsapi.zoho.com.au'],
        'jp' => ['accounts' => 'https://accounts.zoho.jp', 'api' => 'https://www.zohoapis.jp', 'desk' => 'https://desk.zoho.jp', 'projects' => 'https://projectsapi.zoho.jp'],
        'ca' => ['accounts' => 'https://accounts.zohocloud.ca', 'api' => 'https://www.zohoapis.ca', 'desk' => 'https://desk.zohocloud.ca', 'projects' => 'https://projectsapi.zohocloud.ca'],
        'sa' => ['accounts' => 'https://accounts.zoho.sa', 'api' => 'https://www.zohoapis.sa', 'desk' => 'https://desk.zoho.sa', 'projects' => 'https://projectsapi.zoho.sa'],
        'uk' => ['accounts' => 'https://accounts.zoho.uk', 'api' => 'https://www.zohoapis.uk', 'desk' => 'https://desk.zoho.uk', 'projects' => 'https://projectsapi.zoho.uk'],
        'ae' => ['accounts' => 'https://accounts.zoho.ae', 'api' => 'https://www.zohoapis.ae', 'desk' => 'https://desk.zoho.ae', 'projects' => 'https://projectsapi.zoho.ae'],
    ],

    'hosts' => [
        'accounts' => env('ZOHO_ACCOUNTS_URL'),
        'api' => env('ZOHO_API_DOMAIN'),
        'desk' => env('ZOHO_DESK_URL'),
        'projects' => env('ZOHO_PROJECTS_URL'),
    ],

    /* OAuth 2.0 refresh-token flow. The access token is cached until shortly before it expires. */
    'oauth' => [
        'client_id' => env('ZOHO_CLIENT_ID'),
        'client_secret' => env('ZOHO_CLIENT_SECRET'),
        'refresh_token' => env('ZOHO_REFRESH_TOKEN'),
        'cache_key' => 'zoho.access_token',
    ],

    /* Organisation and container IDs per app, read from each app's settings or API. */
    'orgs' => [
        'crm' => [
            'api_version' => env('ZOHO_CRM_API_VERSION', 'v8'),
            'pipeline' => env('ZOHO_CRM_PIPELINE'),
        ],
        'books' => [
            'organization_id' => env('ZOHO_BOOKS_ORG_ID'),
            'bank_account_id' => env('ZOHO_BOOKS_BANK_ACCOUNT_ID'),
        ],
        'desk' => [
            'org_id' => env('ZOHO_DESK_ORG_ID'),
            'department_id' => env('ZOHO_DESK_DEPARTMENT_ID'),
        ],
        'projects' => [
            'portal_id' => env('ZOHO_PROJECTS_PORTAL_ID'),
            'template_id' => env('ZOHO_PROJECTS_TEMPLATE_ID'),
        ],
        'workdrive' => [
            'parent_folder_id' => env('ZOHO_WORKDRIVE_PARENT_FOLDER_ID'),
        ],
        'creator' => [
            'owner' => env('ZOHO_CREATOR_OWNER'),
            'app' => env('ZOHO_CREATOR_APP', 'tbca-operations'),
        ],
        'billing' => [
            'organization_id' => env('ZOHO_BILLING_ORG_ID'),
        ],
    ],

    /*
    | Zoho Flow webhook trigger URLs, one per TBCA event type. Leave empty to
    | skip. When await_confirmation is true an event that went to Flow stays
    | "sent" until Flow posts flow.completed back to the inbound webhook.
    */
    'flow' => [
        'await_confirmation' => (bool) env('ZOHO_FLOW_AWAIT_CONFIRMATION', false),
        'webhooks' => [
            'enquiry.received' => env('ZOHO_FLOW_ENQUIRY_URL'),
            'webinar.registered' => env('ZOHO_FLOW_WEBINAR_URL'),
            'order.payment_verified' => env('ZOHO_FLOW_ORDER_PAID_URL'),
            'dd.case_created' => env('ZOHO_FLOW_DD_CASE_URL'),
            'vdr.enquiry_submitted' => env('ZOHO_FLOW_VDR_ENQUIRY_URL'),
            'support.requested' => env('ZOHO_FLOW_SUPPORT_URL'),
        ],
    ],

    /*
    | Inbound webhook POST /integrations/zoho/webhook. Zoho Flow (or a relay)
    | signs each request: X-TBCA-Timestamp and
    | X-TBCA-Signature = "sha256=" . hex(HMAC_SHA256(secret, timestamp . "." . raw_body)).
    */
    'webhook' => [
        'secret' => env('ZOHO_WEBHOOK_SECRET'),
        'tolerance_seconds' => (int) env('ZOHO_WEBHOOK_TOLERANCE', 300),
    ],

    /* Outbox dispatcher. Backoff is in seconds per attempt; the last value repeats. */
    'sync' => [
        'batch' => (int) env('ZOHO_SYNC_BATCH', 50),
        'max_attempts' => (int) env('ZOHO_SYNC_MAX_ATTEMPTS', 6),
        'backoff' => [60, 300, 900, 3600, 21600],
        'timeout' => (int) env('ZOHO_HTTP_TIMEOUT', 20),
    ],

    /* Section 12 of the implementation guide: the automation target, as a share of task instances. */
    'automation_target' => 0.90,
];
