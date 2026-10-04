<?php

namespace App\Http\Controllers\About;

use App\Http\Controllers\Controller;
use App\Models\About\TrustCase;
use App\Support\Platform\Reference;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Partner enquiries and complaints, each with a trackable reference and status history. */
class EnquiryController extends Controller
{
    public const COMPLAINT_CATEGORIES = ['Service delivery', 'Billing or payment', 'Quality of advice or output', 'Conduct of a team member', 'Privacy or data', 'Platform or technical issue', 'Public claim or content accuracy', 'Other'];

    public const RELATIONSHIPS = ['Client', 'Prospective client', 'Partner', 'Supplier / vendor', 'Candidate', 'Member of the public', 'Other'];

    public function partner(): Response
    {
        return Inertia::render('About/PartnerEnquiry', [
            'options' => [
                'organisation_types' => ['Development finance institution', 'Bank / financial institution', 'Government / public entity', 'Professional services firm', 'Technology provider', 'Industry association', 'NGO / foundation', 'Academic institution', 'Other'],
                'industries' => ['Agriculture', 'Energy', 'Financial Services', 'Healthcare', 'Infrastructure', 'Mining', 'Professional Services', 'Technology', 'Public Sector', 'Other'],
                'countries' => ['South Africa', 'Botswana', 'Ghana', 'Kenya', 'Malawi', 'Namibia', 'Nigeria', 'Rwanda', 'Tanzania', 'Zambia', 'Zimbabwe', 'Other (Africa)', 'Outside Africa'],
                'sizes' => ['1-10', '11-50', '51-200', '201-1,000', '1,000+'],
                'contact_methods' => ['Email', 'Phone', 'WhatsApp', 'Video call'],
                'interests' => ['Delivery partner', 'Referral partner', 'Technology / integration partner', 'Co-investment / funding', 'Research & knowledge', 'Institutional programme', 'Other'],
            ],
        ]);
    }

    public function storePartner(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'organisation' => ['required', 'string', 'max:160'],
            'organisation_type' => ['required', 'string', 'max:80'],
            'industry' => ['required', 'string', 'max:80'],
            'country' => ['required', 'string', 'max:80'],
            'website' => ['nullable', 'url', 'max:255'],
            'size' => ['required', 'string', 'max:40'],
            'name' => ['required', 'string', 'max:120'],
            'job_title' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['required', 'string', 'max:30'],
            'contact_method' => ['required', 'string', 'max:40'],
            'linkedin' => ['nullable', 'url', 'max:255'],
            'interest' => ['required', 'string', 'max:80'],
            'collaboration' => ['required', 'string', 'max:3000'],
            'additional' => ['nullable', 'string', 'max:3000'],
            'profile' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx', 'max:10240'],
        ]);

        $file = $request->file('profile');
        $case = TrustCase::create([
            'reference' => Reference::make(TrustCase::PREFIX['partner']),
            'type' => 'partner',
            'status' => 'received',
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'],
            'organisation' => $data['organisation'],
            'category' => $data['interest'],
            'subject' => 'Partnership enquiry: '.$data['organisation'],
            'message' => $data['collaboration'],
            'details' => collect($data)->except(['name', 'email', 'phone', 'organisation', 'interest', 'collaboration', 'profile'])->all(),
            'attachment_name' => $file?->getClientOriginalName(),
            'attachment_path' => $file?->store('about/partners', 'local'),
            'history' => [['at' => now()->toIso8601String(), 'status' => 'received', 'note' => 'Enquiry received. A partner application is not a partnership; screening follows.']],
        ]);

        return redirect()->route('complaints.track', ['reference' => $case->reference, 'email' => $case->email])
            ->with('success', 'Enquiry received — we will reach out within 2 business days.')->with('reference', $case->reference);
    }

    public function complaints(): Response
    {
        return Inertia::render('About/Complaints', [
            'options' => ['categories' => self::COMPLAINT_CATEGORIES, 'relationships' => self::RELATIONSHIPS],
        ]);
    }

    public function storeComplaint(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'relationship' => ['required', 'string', 'max:80'],
            'category' => ['required', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160'],
            'phone' => ['nullable', 'string', 'max:30'],
            'reference' => ['nullable', 'string', 'max:120'],
            'description' => ['required', 'string', 'min:20', 'max:5000'],
            'outcome' => ['nullable', 'string', 'max:2000'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:10240'],
        ]);

        $file = $request->file('attachment');
        $case = TrustCase::create([
            'reference' => Reference::make(TrustCase::PREFIX['complaint']),
            'type' => 'complaint',
            'status' => 'received',
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'category' => $data['category'],
            'subject' => $data['category'],
            'message' => $data['description'],
            'details' => ['relationship' => $data['relationship'], 'reference' => $data['reference'] ?? null, 'outcome' => $data['outcome'] ?? null],
            'attachment_name' => $file?->getClientOriginalName(),
            'attachment_path' => $file?->store('about/complaints', 'local'),
            'history' => [['at' => now()->toIso8601String(), 'status' => 'received', 'note' => 'Complaint received. We will acknowledge within 2 business days.']],
        ]);

        return redirect()->route('complaints.track', ['reference' => $case->reference, 'email' => $case->email])
            ->with('success', 'Complaint submitted.')->with('reference', $case->reference);
    }

    /** Status tracking for complaints, media and partner enquiries (reference + email). */
    public function track(Request $request): Response
    {
        $reference = strtoupper(trim($request->string('reference')->toString()));
        $email = strtolower(trim($request->string('email')->toString()));
        $case = null;

        if ($reference !== '' && $email !== '') {
            $found = TrustCase::where('reference', $reference)->whereRaw('lower(email) = ?', [$email])->first();
            if ($found) {
                $case = [
                    'reference' => $found->reference,
                    'type' => $found->type,
                    'status' => $found->status,
                    'subject' => $found->subject,
                    'category' => $found->category,
                    'submitted_at' => $found->created_at->toIso8601String(),
                    'history' => $found->history ?? [],
                    'pipeline' => TrustCase::STATUSES[$found->type] ?? [],
                ];
            }
        }

        return Inertia::render('About/Track', [
            'record' => $case,
            'searched' => $reference !== '' && $email !== '',
            'query' => ['reference' => $reference, 'email' => $email],
        ]);
    }
}
