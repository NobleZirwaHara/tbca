<?php

namespace App\Support\Shop;

use App\Models\Shop\MerchRoute;
use App\Models\Shop\Product;

/**
 * Shapes Product Masters for the public pages: card data for listings and the
 * full A1-A7 template payload (content merged with act defaults, honest-state
 * explanation, CTA projection and governed related offers).
 */
class ProductPresenter
{
    public static function card(Product $p): array
    {
        return [
            'slug' => $p->slug,
            'code' => $p->code,
            'name' => $p->name,
            'act' => $p->act,
            'act_label' => Acts::label($p->act),
            'tagline' => $p->tagline,
            'icon' => $p->icon,
            'price_zar' => $p->act === 'A7' ? 0 : $p->price_zar,
            'indicative_zar' => $p->indicative_zar,
            'price_unit' => $p->price_unit,
            'price_state' => Search::priceState($p),
            'delivery' => $p->delivery,
            'output_format' => $p->output_format,
            'listing_state' => $p->listing_state,
            'purchasable' => $p->isPurchasable(),
            'configurable' => ! empty($p->variants['tiers']) || ! empty($p->variants['licences']),
            'url' => $p->url(),
            'rating' => $p->rating,
            'vehicle' => $p->vehicle,
        ];
    }

    public static function detail(Product $p): array
    {
        $gate = ListingGate::evaluate($p);
        $defaults = self::defaults($p);
        $content = array_replace($defaults, array_filter($p->content ?? [], fn ($v) => $v !== null && $v !== []));

        return [
            ...self::card($p),
            'sprint_code' => $p->sprint_code,
            'summary' => $p->summary,
            'vehicle_code' => $p->vehicle_code,
            'aisle' => $p->aisle,
            'aisle_name' => Catalogue::aisle((string) $p->aisle)['name'] ?? null,
            'subcategory' => $p->subcategory,
            'floor_zar' => $p->floor_zar,
            'best_for' => $p->best_for,
            'reviews_count' => $p->reviews_count,
            'version' => $p->version,
            'mode' => Acts::mode($p->act),
            'listing_state_label' => Acts::LISTING_STATES[$p->listing_state] ?? null,
            'statement' => Acts::ACTS[$p->act]['statement'] ?? null,
            'gate' => ['outcome' => $gate['outcome'], 'hard' => $gate['hard'], 'soft' => $gate['soft']],
            'certified' => $p->isCertifiedSubscription(),
            'content' => $content,
            'variants' => $p->variants ?? [],
            'related' => self::related($p),
        ];
    }

    /** Governed related offers: only ACTIVE_* dispositions whose destination still resolves. */
    public static function related(Product $p): array
    {
        return MerchRoute::query()
            ->with('destination')
            ->where('source_product_id', $p->id)
            ->where('disposition', 'like', 'ACTIVE_%')
            ->orderBy('position')
            ->get()
            ->filter(fn (MerchRoute $r) => $r->destination && $r->destination->listing_state !== 'LS-06' && $r->destination->status === 'active')
            ->map(fn (MerchRoute $r) => [
                ...self::card($r->destination),
                'relationship' => $r->relationship_type,
                'fit_reason' => $r->fit_reason,
                'disposition' => $r->disposition,
                'cta' => self::ctaForDisposition($r->disposition, $r->destination),
            ])
            ->values()
            ->all();
    }

    public static function ctaForDisposition(string $disposition, Product $destination): string
    {
        return match ($disposition) {
            'ACTIVE_PURCHASE' => $destination->act === 'A3' ? ($destination->isCertifiedSubscription() ? 'Subscribe' : 'View Current Options') : 'Buy Now',
            'ACTIVE_QUOTE' => 'Request Quote',
            'ACTIVE_PROPOSAL' => 'Request Proposal',
            'ACTIVE_BRIEF' => 'Submit Brief',
            'ACTIVE_NATIVE_ROUTE' => 'View Options',
            default => 'View Details',
        };
    }

    /** Act-level default page content, overridden by the product's own content. */
    public static function defaults(Product $p): array
    {
        $common = [
            'short' => $p->tagline,
            'key_benefit' => $p->tagline,
            'achieve' => [],
            'benefits' => [],
            'best_for_list' => array_values(array_map(fn ($b) => Catalogue::BUYER_TYPES[$b] ?? $b, $p->buyer_types ?? [])),
            'glance' => [['Best For', (string) $p->best_for], ['Delivery Time', (string) $p->delivery], ['Human Review', 'Included'], ['Output Format', (string) $p->output_format], ['Language', 'EN'], ['Country Focus', 'South Africa']],
            'faqs' => [
                ['q' => 'Is every deliverable reviewed by a person?', 'a' => 'Yes. TBCA professionals review every output before it is released to your workspace.'],
                ['q' => 'Which currency am I charged in?', 'a' => 'All prices are set in ZAR (source currency). USD is shown for reference only. VAT at 15% is added at checkout.'],
                ['q' => 'Will I receive a tax invoice?', 'a' => 'Yes. A tax invoice is issued after successful payment and is available in your Client Portal.'],
            ],
        ];

        return match ($p->act) {
            'A1' => [
                ...$common,
                'achieve' => ["Receive a governed {$p->output_format} delivered within {$p->delivery}.", 'Get a clear, prioritised set of recommendations.', 'Work with a named delivery owner and quality gate.', 'Access every output and version in your Client Portal.'],
                'deliverables' => [[$p->output_format ?: 'Final Report', 'PDF'], ['Action Plan & Next Steps', 'PDF'], ['Handover Summary', 'PDF']],
                'delivery_overview' => ['Kick-off and input collection', 'Research and analysis', 'Draft deliverables', 'Human review and refinement', 'Final deliverables and handover'],
                'process' => [
                    ['Kick-off & Inputs', 'We confirm your objectives and collect required inputs from you.', 'Day 1'],
                    ['Research & Analysis', 'Our team conducts research and analysis against your objectives.', 'Days 1-4'],
                    ['Draft Deliverables', 'We prepare draft reports and supporting tools for review.', 'Days 4-6'],
                    ['Human Review', 'TBCA professionals review, refine and quality-assure all outputs.', 'Days 6-8'],
                    ['Final Delivery', 'Final files are delivered to your workspace with a handover summary.', 'Day 9-10'],
                ],
                'delivery_access' => [['Delivery Method', 'Secure download in your account'], ['Access', 'Available 24/7 in your workspace'], ['Files Provided', 'PDF, ZIP'], ['File Size (Approx.)', '15 - 25 MB'], ['Retention', '12 Months'], ['Re-Download', 'Unlimited']],
                'support_inclusions' => [['1 Clarification Round', 'Included in the price'], ['Email Support', 'During delivery period'], ['Post-Delivery QA', 'Up to 7 days after delivery'], ['Future Updates', 'One-time delivery']],
                'inputs' => ['Company profile and objectives', 'Relevant existing documents', 'A named contact for clarifications'],
                'quality' => ['Named delivery owner', 'Creation QA before release', 'Human review sign-off', 'Version-controlled outputs'],
                'why' => [
                    ['compass', 'Proven Framework', 'Built on TBCA methodologies used across multiple industries and markets.'],
                    ['shield-check', 'Reduce Risk', 'Identify the risks and gaps that matter before you commit resources.'],
                    ['clock', 'Save Time & Resources', 'Fixed scope and fixed price with a committed delivery window.'],
                    ['users', 'Human Expertise Included', 'All outputs are reviewed by TBCA professionals for accuracy and relevance.'],
                ],
                'why_intro' => 'This Sprint gives you a fixed-scope, fixed-price outcome with human review before release.',
                'price_note' => 'Price includes human review and all deliverables.',
                'format_access' => 'Fixed deliverable', 'updates' => 'One-time', 'support' => 'Email + QA Clarifications', 'licence_usage' => 'Single use',
                'key_outcome' => $p->output_format, 'includes_summary' => 'Analysis, recommendations, action plan',
            ],
            'A2' => [
                ...$common,
                'achieve' => ["{$p->output_format} under licence", 'Guidance notes for immediate use', 'Version history and updates', 'Email support'],
                'benefits' => ['Instant access after checkout', 'Human-reviewed content', 'Exact version, licence and jurisdiction shown', 'Reusable for future projects'],
                'how_it_works' => [['Choose your licence', 'Select the licence that matches how you will use the product.'], ['Checkout securely', 'Pay in ZAR. VAT is calculated at checkout.'], ['Download instantly', 'Access your files in your Client Portal immediately after payment.']],
                'requirements' => ['Microsoft Office or compatible software', 'A TBCA client account for portal access'],
                'support_list' => ['Email support for 12 months', 'Knowledge Base articles', 'Update notifications'],
                'price_note' => 'Instant access after secure checkout.',
                'format_access' => 'Digital download', 'updates' => 'Lifetime updates', 'support' => 'Knowledge Base', 'licence_usage' => 'Single user licence',
                'key_outcome' => $p->output_format, 'includes_summary' => 'Templates, tools, guidance',
            ],
            'A3' => [
                ...$common,
                'how_it_works' => [['Choose your plan', 'Recurrence class, billing period and cancellation route are disclosed up front.'], ['Capture your mandate', 'Authorise recurring payments under the Payment Services Act 2019 (RSA).'], ['Receive value every period', 'Updates and access are delivered each billing period.']],
                'requirements' => ['A recurring-capable payment method', 'A TBCA client account'],
                'support_list' => ['Email + WhatsApp support', 'Manage or cancel your mandate in the Client Portal'],
                'price_note' => 'Cancel or change plan anytime.',
                'format_access' => 'Online access (Subscription)', 'updates' => 'Monthly updates', 'support' => 'Email + Advisor Access', 'licence_usage' => 'Single user (Subscription)',
                'key_outcome' => 'Recurring access', 'includes_summary' => 'Recurring updates and support',
            ],
            'A4' => [
                ...$common,
                'how_it_works' => [['Request this retainer', 'Tell us your needs. No payment is taken now.'], ['C1-C5 scoping', 'We quantify allowance, scope, reserved capacity, unused and overage treatment.'], ['Adviser & capacity', 'We confirm adviser availability and suitability.'], ['Proposal & contract', 'You review the proposal; the retainer starts only after contract approval.']],
                'commitment_tiers' => [['C1', 'Quantified Allowance'], ['C2', 'Bounded Scope + Exclusions'], ['C3', 'Reserved Capacity (Owner)'], ['C4', 'Unused Treatment'], ['C5', 'Overage Treatment']],
                'price_note' => 'Retainer capacity is subject to adviser availability.',
                'key_outcome' => 'Reserved senior capacity', 'includes_summary' => 'Advisory, reviews, strategy & support', 'format_access' => 'Retainer', 'updates' => 'Monthly', 'support' => 'Email, WhatsApp, Calls', 'licence_usage' => 'Retainer Engagement',
            ],
            default => $common,
        };
    }
}
