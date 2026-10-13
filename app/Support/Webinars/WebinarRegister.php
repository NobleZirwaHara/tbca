<?php

namespace App\Support\Webinars;

/**
 * Content register for the Webinars transaction ecosystem (WB-TEB, revised blueprint
 * of 9 Aug 2026). Copy, templates and reference lists live here so they can move to
 * Zoho CRM / WorkDrive sources without touching the front end.
 */
class WebinarRegister
{
    /** Public categories (key => label, icon). */
    public static function categories(): array
    {
        return [
            ['key' => 'strategy', 'label' => 'Strategy', 'icon' => 'target'],
            ['key' => 'finance', 'label' => 'Finance & Funding', 'icon' => 'coins'],
            ['key' => 'technology', 'label' => 'Technology & AI', 'icon' => 'bot'],
            ['key' => 'marketing', 'label' => 'Marketing & Sales', 'icon' => 'trending-up'],
            ['key' => 'leadership', 'label' => 'Leadership & People', 'icon' => 'users'],
            ['key' => 'infrastructure', 'label' => 'Infrastructure & Projects', 'icon' => 'building-2'],
            ['key' => 'trade', 'label' => 'Trade & Markets', 'icon' => 'globe'],
            ['key' => 'compliance', 'label' => 'Compliance & Governance', 'icon' => 'shield-check'],
        ];
    }

    /** Event state labels (WB-COMP-01 Event Status Rail). */
    public static function states(): array
    {
        return [
            'draft' => ['Draft', 'neutral'],
            'awaiting_w1' => ['Registration Open', 'warn'],
            'approved' => ['Registration Open', 'good'],
            'live' => ['Live Now', 'bad'],
            'ended' => ['Ended', 'neutral'],
            'awaiting_w3' => ['Replay Under Review', 'warn'],
            'published' => ['Replay Available', 'good'],
            'edited' => ['Edited Replay', 'info'],
            'corrected' => ['Corrected Replay', 'info'],
            'withheld' => ['Replay Withheld', 'neutral'],
            'withdrawn' => ['Replay Withdrawn', 'neutral'],
        ];
    }

    /** Console state labels (staff view of the same rail). */
    public static function consoleStates(): array
    {
        return [
            'draft' => 'Draft', 'awaiting_w1' => 'Pre-Flight in Progress', 'approved' => 'Pre-Flight Approved',
            'live' => 'Live', 'ended' => 'Ended', 'awaiting_w3' => 'Awaiting Replay Review', 'published' => 'Replay Published',
            'edited' => 'Edited Replay Published', 'corrected' => 'Corrected Replay Published', 'withheld' => 'Replay Withheld', 'withdrawn' => 'Replay Withdrawn',
        ];
    }

    public static function roles(): array
    {
        return ['Business Owner / Founder', 'Executive / Senior Manager', 'Consultant / Advisor', 'Entrepreneur', 'Investor', 'Development Partner', 'Student / Early Career', 'Other'];
    }

    public static function industries(): array
    {
        return ['Agriculture & Agro-Processing', 'Renewable Energy', 'Infrastructure & Logistics', 'Manufacturing', 'Digital Economy', 'Financial Services', 'Professional Services', 'Healthcare & Pharma', 'Mining & Resources', 'Retail & Consumer', 'Other'];
    }

    public static function countries(): array
    {
        return ['South Africa', 'Botswana', 'Eswatini', 'Ghana', 'Kenya', 'Lesotho', 'Malawi', 'Mozambique', 'Namibia', 'Nigeria', 'Rwanda', 'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe', 'Other'];
    }

    public static function participationModes(): array
    {
        return [
            'live_recorded' => ['Attend Live and Allow Recording', 'Join the live session. You may appear in the recording, which will be reviewed before publication.', 'video'],
            'live_hidden' => ['Attend Live (Do Not Appear in Replay)', 'Join the live session. You will not appear in the recording. Your name and video will be hidden.', 'eye-off'],
            'replay_only' => ['Watch Replay Only', 'Register to be notified when the approved replay is published. Replays never auto-publish.', 'play'],
        ];
    }

    /** Controlled notice copy (WB-SCR-02). Versions are captured on every registration. */
    public static function notices(): array
    {
        return [
            'recording' => [
                'version' => 'WB-R1-2026.08',
                'title' => 'Recording Notice',
                'body' => 'This webinar will be recorded. The live session may be used to create an approved replay for registered attendees and other TBCA audiences. No replay will be published without completing the TBCA W3 post-flight review and approval process.',
            ],
            'offer' => [
                'version' => 'WB-O1-2026.08',
                'title' => 'Commercial Offer Disclosure',
                'body' => 'This webinar may include information about TBCA services, paid toolkits or advisory programmes. Any commercial offers will be clearly identified as such during the session. There is no obligation to buy, book or continue.',
            ],
            'boundary' => [
                'version' => 'WB-B1-2026.08',
                'title' => 'Professional Boundary',
                'body' => 'This webinar provides general information and does not constitute legal, tax, financial, investment or other regulated advice. Case-specific conclusions must be obtained from appropriately qualified professionals.',
            ],
            'privacy' => [
                'version' => 'PV-Current',
                'title' => 'Privacy',
                'body' => 'Your information is secure and will only be used for this webinar and related communications in line with our Privacy Policy.',
            ],
        ];
    }

    public static function defaultOutcomes(): array
    {
        return [
            'Understand the African market opportunity',
            'Use a practical business scaling framework',
            'Avoid common growth mistakes',
            'Access funding and partnership opportunities',
            'Apply practical tools and templates',
        ];
    }

    public static function defaultAgenda(): array
    {
        return [
            ['14:00', 'Welcome and context', 'Why this topic matters for African businesses now.'],
            ['14:10', 'The opportunity', 'Market signals, demand and where growth is coming from.'],
            ['14:30', 'The TBCA approach', 'A practical framework you can apply in your business.'],
            ['14:50', 'Case studies', 'Real African examples and what they teach us.'],
            ['15:10', 'Live Q&A', 'Moderated questions from attendees.'],
            ['15:25', 'Next steps and close', 'Tools, resources and how to continue.'],
        ];
    }

    public static function whoShouldAttend(): array
    {
        return ['Business owners and founders', 'Entrepreneurs and SME managers', 'Investors and development partners', 'Consultants and advisors working with African businesses'];
    }

    public static function takeaways(): array
    {
        return ['Event brief with agenda and key topics', 'Practical templates and checklist', 'Access to the approved replay (after W3 review)', 'CPD certificate of attendance where the event is CPD eligible'];
    }

    public static function faqs(): array
    {
        return [
            ['Is the webinar free?', 'Most TBCA webinars are free to attend. Paid events show the price in your selected currency before you register.'],
            ['Will there be a replay?', 'A replay is a new publication. It is only released after the TBCA W3 review. Registrants are notified when it is approved.'],
            ['Can I attend without appearing in the recording?', 'Yes. Choose "Attend Live (Do Not Appear in Replay)" and keep your camera and microphone off. Use the private question route.'],
            ['Will I get a certificate?', 'CPD eligible events issue a certificate of attendance after the session. Replay viewers can earn one by completing the quiz and feedback.'],
            ['How do I change my participation choice?', 'Open My Registration and choose Edit Details, or contact the webinars support team before the event.'],
        ];
    }

    public static function chapters(): array
    {
        return [
            ['Opening Remarks and Context', '00:00', '08:24', 142],
            ['African Market Opportunities', '08:25', '20:01', 198],
            ['AI Agents and Automation', '20:02', '35:20', 176],
            ['Case Studies and Success Stories', '35:21', '49:26', 121],
            ['Live Q&A Session', '49:27', '1:10:05', 210],
            ['Practical Toolkits and Next Steps', '1:10:06', '1:23:38', 164],
            ['Closing Remarks', '1:23:39', '1:30:50', 109],
            ['End Screen and Resources', '1:30:51', '1:32:15', 98],
        ];
    }

    public static function resources(): array
    {
        return [
            ['key' => 'slides', 'title' => 'Webinar Presentation Slides', 'type' => 'PDF', 'size' => '12.4 MB', 'after_review' => true],
            ['key' => 'brief', 'title' => 'Event Brief', 'type' => 'DOCX', 'size' => '1.8 MB', 'after_review' => false],
            ['key' => 'guide', 'title' => 'Preparation Guide', 'type' => 'DOCX', 'size' => '0.9 MB', 'after_review' => false],
            ['key' => 'model', 'title' => 'Financial Model Template', 'type' => 'XLSX', 'size' => '2.1 MB', 'after_review' => false],
            ['key' => 'links', 'title' => 'Additional Resources', 'type' => 'Web Links', 'size' => null, 'after_review' => false],
        ];
    }

    public static function keyTakeaways(): array
    {
        return [
            "Africa's growth opportunity and key market trends.",
            'How AI agents, automation and digital tools drive scale.',
            'Practical toolkits and templates to implement immediately.',
            'Real-world case studies from African businesses.',
            'Clear next steps to move from vision to execution.',
        ];
    }

    /** Post-webinar offers (amounts in whole ZAR, shown in the visitor's currency). */
    public static function offers(): array
    {
        return [
            ['key' => 'diagnostic-sprint', 'group' => 'advisory', 'title' => 'Business Diagnostic Sprint', 'icon' => 'bar-chart-3', 'body' => 'Get a data-driven assessment of your business with actionable recommendations in 5 working days.', 'meta' => ['5 Days', 'Full Report'], 'zar' => 34950, 'unit' => null, 'cta' => 'Get Started', 'href' => '/sprints', 'badge' => 'Most Popular'],
            ['key' => 'strategic-growth-advisory', 'group' => 'advisory', 'title' => 'Strategic Growth Advisory', 'icon' => 'target', 'body' => 'One-on-one advisory with TBCA experts to develop a practical growth roadmap.', 'meta' => ['4 Weeks', 'Expert Team'], 'zar' => 125000, 'unit' => null, 'cta' => 'Book a Consultation', 'href' => '/discovery-call', 'badge' => null],
            ['key' => 'ai-automation-sprint', 'group' => 'advisory', 'title' => 'AI Automation Readiness Sprint', 'icon' => 'bot', 'body' => 'Identify and implement high-impact AI automations for your business.', 'meta' => ['3 Weeks', 'Implementation Plan'], 'zar' => 49950, 'unit' => null, 'cta' => 'Get Started', 'href' => '/sprints', 'badge' => null],
            ['key' => 'market-entry-toolkit', 'group' => 'toolkits', 'title' => 'Market Entry Toolkit', 'icon' => 'database', 'body' => 'Step-by-step templates, checklists and market insights to enter and grow in African markets.', 'meta' => ['Instant Access', '10+ Templates'], 'zar' => 12500, 'unit' => null, 'cta' => 'Add to Cart', 'href' => '/tools/toolkits', 'badge' => null],
            ['key' => 'project-advisory-package', 'group' => 'flagship', 'title' => 'Project Advisory Package', 'icon' => 'users', 'body' => 'End-to-end support from concept to funding for infrastructure and industrial projects.', 'meta' => ['6-12 Weeks', 'Specialist Team'], 'zar' => 199500, 'unit' => null, 'from' => true, 'cta' => 'Request Proposal', 'href' => '/project-advisory', 'badge' => null],
            ['key' => 'tbca-plus', 'group' => 'flagship', 'title' => 'TBCA Plus Membership', 'icon' => 'shopping-bag', 'body' => 'Continuous access to premium webinars, toolkits, market intelligence and expert support.', 'meta' => ['Monthly', 'Exclusive Access'], 'zar' => 12500, 'unit' => '/ month', 'cta' => 'Subscribe Now', 'href' => '/subscriptions', 'badge' => null],
            ['key' => 'partner-review', 'group' => 'partner', 'title' => 'Partner Professional Review', 'icon' => 'scale', 'body' => 'Route a case-specific legal, tax or financial question to a verified professional partner.', 'meta' => ['Scoped', 'Verified Partner'], 'zar' => 8500, 'unit' => null, 'from' => true, 'cta' => 'Request Review', 'href' => '/partner-services', 'badge' => null],
            ['key' => 'compliance-toolkit', 'group' => 'toolkits', 'title' => 'Governance and Compliance Toolkit', 'icon' => 'shield-check', 'body' => 'Board, POPIA and compliance templates for growing businesses.', 'meta' => ['Instant Access', '12 Templates'], 'zar' => 4950, 'unit' => null, 'cta' => 'Add to Cart', 'href' => '/tools/toolkits', 'badge' => null],
        ];
    }

    public static function offerGroups(): array
    {
        return [
            ['key' => 'recommended', 'label' => 'Recommended for You'],
            ['key' => 'advisory', 'label' => 'Advisory Services'],
            ['key' => 'toolkits', 'label' => 'Toolkits'],
            ['key' => 'flagship', 'label' => 'Flagship Programmes'],
            ['key' => 'partner', 'label' => 'Partner Services'],
        ];
    }

    public static function followUpSequence(): array
    {
        return [
            ['Day 0: Replay Invitation', 'Sent 2 hours after the replay is approved', 'mail'],
            ['Day 3: Reminder', 'Gentle reminder with key insights', 'bell'],
            ['Day 7: Special Offer', 'Access post-webinar offers (disclosed at registration)', 'sparkles'],
            ['Day 14: Final Reminder', 'Last chance to watch and access resources', 'bar-chart-3'],
        ];
    }

    public static function qaGuidelines(): array
    {
        return [
            "Keep questions relevant to today's topic",
            'Be concise and specific',
            'No promotional content',
            'Questions may be edited for clarity',
            'High-risk or sensitive questions may be answered after the session',
            'All questions are subject to moderation',
        ];
    }

    public static function questionCategories(): array
    {
        return ['General Question', 'Trade & Export', 'Investment', 'Market Entry', 'Finance', 'Partnerships', 'Other'];
    }

    /** Pre-flight (W1) checklist template: [task, owner initials, group, due offset days]. */
    public static function preflightTasks(): array
    {
        return [
            ['Finalise title, description and agenda', 'KP', 'content', -5],
            ['Confirm speakers and run-sheet', 'KP', 'content', -5],
            ['Prepare and finalise slide deck', 'TN', 'content', -4],
            ['Create opening and closing videos', 'NS', 'content', -3],
            ['Load slides and media to platform', 'NS', 'technical', -3],
            ['Configure registration and confirmation emails', 'LM', 'technical', -4],
            ['Set up Zoom webinar (settings, branding, security)', 'NS', 'technical', -4],
            ['Test live polls, Q&A and chat', 'LM', 'engagement', -2],
            ['Substantiate every claim and statistic (claim register)', 'TN', 'content', -3],
            ['Approve recording notice and offer disclosure copy', 'LM', 'approval', -4],
            ['Confirm professional boundary and deflection scripts', 'KP', 'approval', -3],
            ['Confirm captions and Afrikaans notice review', 'TN', 'engagement', -3],
            ['Brief moderator and boundary monitor', 'LM', 'team', -2],
            ['Run technical rehearsal', 'NS', 'technical', -1],
            ['Confirm guest warranties and sponsor disclosures', 'KP', 'approval', -2],
            ['Final W1 sign-off by approver', 'KP', 'approval', -1],
        ];
    }

    public static function productionTeam(): array
    {
        return [
            ['Kruger Phiri', 'Host / Presenter', 'KP'],
            ['Nitesh Singh', 'Technical Producer', 'NS'],
            ['Lerato Mokoena', 'Moderator (Q&A)', 'LM'],
            ['Thandi Nkosi', 'Content & Slides', 'TN'],
            ['Peter Radebe', 'Live Support', 'PR'],
        ];
    }

    public static function automationRules(): array
    {
        return [
            ['confirmation', 'Registration Confirmation Email', true],
            ['calendar', 'Calendar Invite (ICS)', true],
            ['reminders', 'Reminder Emails (D-3, D-1, D+1)', true],
            ['noshow', 'No-Show Follow-Up', true],
            ['replay', 'Replay Access Email', true],
            ['feedback', 'Feedback Request Email', true],
            ['certificate', 'Certificate Issuance', true],
        ];
    }

    public static function offerAutomation(): array
    {
        return [
            ['offer_link', 'Send offer link during webinar', true],
            ['followup_email', 'Send follow-up offer email (1 hour)', true],
            ['reminder', 'Send 3-day conversion reminder', true],
            ['discount', 'Apply limited-time discount (24h)', false],
            ['crm_tag', 'Tag converters to CRM', true],
            ['sales_alert', 'Notify sales team on high-value conversion', true],
        ];
    }

    public static function recordingControls(): array
    {
        return [
            ['live_recording', 'Enable Live Recording', true],
            ['replay_recording', 'Enable Replay Recording', true],
            ['chat_transcript', 'Capture Chat Transcript', true],
            ['qa_transcript', 'Capture Q&A Transcript', true],
            ['poll_results', 'Capture Poll Results', true],
            ['screenshots', 'Allow Attendee Screenshots', false],
            ['watermark', 'Watermark Replay Video', true],
            ['blur_video', 'Blur Attendee Video (Default)', true],
        ];
    }

    public static function publicationOptions(): array
    {
        return [
            ['website', 'Publish on TBCA Website (Public)', true],
            ['portal', 'Publish on Client Portal (Registered Users)', true],
            ['registrants', 'Send replay link to all registrants', true],
            ['noshows', 'Send replay link to no-shows', true],
            ['slides', 'Enable download of presentation slides', false],
            ['certificate', 'Enable certificate of attendance (on quiz completion)', true],
            ['plus_only', 'Restrict access to TBCA Plus members only', false],
        ];
    }

    public static function moderationSettings(): array
    {
        return [
            ['allow_questions', 'Allow attendee questions', true],
            ['show_names', 'Show attendee names', true],
            ['upvoting', 'Enable upvoting', true],
            ['auto_moderate', 'Auto-moderate inappropriate content', true],
        ];
    }

    /** Six W3 replay decisions (Part 5.7). */
    public static function replayDecisions(): array
    {
        return [
            'published' => 'Publish as recorded',
            'edited' => 'Publish edited replay',
            'corrected' => 'Publish with correction annotation',
            'withheld' => 'Withhold replay',
            'withdrawn' => 'Withdraw replay',
            'awaiting_w3' => 'Return to review queue',
        ];
    }
}
