<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    /*
    | Identity verification for Due Diligence checks.
    | driver: "simulated" (default, no network) or "vove" (VOVE ID).
    | auto_start: start mapped checks when a case enters Checks Running.
    */
    'identity_verification' => [
        'driver' => env('IDENTITY_VERIFICATION_DRIVER', 'simulated'),
        'auto_start' => (bool) env('IDENTITY_VERIFICATION_AUTO_START', false),
        'link_ttl_hours' => 72,
    ],

    /*
    | VOVE ID (https://docs.voveid.com). Sandbox uses the .net hosts and
    | Production the .com hosts; keys and webhook secrets are per environment.
    */
    'vove' => [
        'environment' => env('VOVE_ENVIRONMENT', 'Sandbox'),
        'base_url' => env('VOVE_API_BASE_URL', 'https://api.voveid.net'),
        'hosted_url' => env('VOVE_HOSTED_URL', 'https://web.voveid.net'),
        'api_key' => env('VOVE_API_KEY'),
        'public_key' => env('VOVE_PUBLIC_KEY'),
        'webhook_secret' => env('VOVE_WEBHOOK_SECRET'),
        'webhook_tolerance' => 300,
        'timeout' => 20,
        'flows' => [
            'kyc' => env('VOVE_KYC_FLOW_ID'),
            'kyc_address' => env('VOVE_KYC_ADDRESS_FLOW_ID'),
            'aml_individual' => env('VOVE_AML_INDIVIDUAL_FLOW_ID'),
            'aml_entity' => env('VOVE_AML_ENTITY_FLOW_ID'),
            'kyb' => env('VOVE_KYB_FLOW_ID'),
        ],
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
