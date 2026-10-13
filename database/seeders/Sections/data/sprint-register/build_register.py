"""
Builds register.json (read by SprintsRegisterSeeder) from the client's
"Volume 11 Full 7,008 Sprint Design Register" workbook.

    python3 -I build_register.py <path to Volume 11 xlsx> [output dir]

Only client-facing fields are carried. Internal build fields (CRM, QuickBooks,
workflow, QA checklist, analytics, AI script and B2IT notes) stay in the
workbook. Long fields that repeat across rows are stored once under "shared"
and referenced by index; rows are arrays in "columns" order.

Derived fields (type, catalogue category, commercial act, audience, shop aisle,
slug) follow the fixed rules below; nothing else is invented. Where the register
has no value the field is left empty.
"""

import json
import re
import sys
from collections import Counter
from pathlib import Path

import openpyxl

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(__file__).parent

TYPE_MAP = {
    'Technology Setup': 'technology-setup',
    'Retainer': 'retainer',
    'Subscription': 'subscription',
    'Partner-Delivered Sprint': 'partner-delivered',
    'Fixed scope service': 'fixed-scope',
    'Quote-Route Advisory Sprint': 'quote-route',
    'Premium Sprint': 'premium',
    'Client Service Sprint': 'client-service',
    'Checklist': 'checklist',
    'Dashboard Sprint': 'dashboard',
    'Dashboard': 'dashboard',
    'Digital Product / Toolkit': 'digital-toolkit',
    'Toolkit / Pack': 'digital-toolkit',
    'Technology Resale / Implementation Sprint': 'technology-resale',
    'Premium Advisory Feeder': 'premium-advisory-feeder',
    'Due Diligence / Trust Sprint': 'due-diligence-trust',
    'Template': 'template',
    'Diagnostic': 'diagnostic',
    'Report': 'report',
    'Implementation pack': 'implementation-pack',
    'AI / Automation Sprint': 'ai-automation',
    'Dashboard / Data Sprint': 'dashboard-data',
    'Training product': 'training',
}

FAMILY_CATEGORY = {
    'Dashboard and Data Product Sprint Page': 'data-dashboards',
    'Course and Learning Sprint Page': 'courses-learning',
    'Project Advisory Sprint Page': 'project-advisory',
    'Template Sprint Page': 'templates-toolkits',
    'Retainer Sprint Page': 'subscriptions-retainers',
    'Subscription Sprint Page': 'subscriptions-retainers',
    'Report Sprint Page': 'research-reports',
    'Calculator Sprint Page': 'digital-products',
    'Toolkit and Digital Product Sprint Page': 'digital-products',
    'Diagnostic Sprint Page': 'diagnostics',
}

LETTER_CATEGORY = {'N': 'ai-automation', 'T': 'technology', 'W': 'technology', 'Z': 'technology', 'D': 'data-dashboards', 'P': 'project-advisory'}

# Register A-Z service category letter -> Online Shop aisle (App\Support\Shop\Catalogue::aisles()).
LETTER_AISLE = {
    'A': 'business-sme-solutions', 'B': 'marketing-sales', 'C': 'compliance-governance', 'D': 'ict-digital-economy',
    'E': 'education-skills', 'F': 'finance-investment', 'G': 'business-strategy-planning', 'H': 'hr-people',
    'I': 'business-strategy-planning', 'J': 'hr-people', 'K': 'business-sme-solutions', 'L': 'legal-contracts',
    'M': 'marketing-sales', 'N': 'technology-automation', 'O': 'business-sme-solutions', 'P': 'infrastructure-real-assets',
    'Q': 'compliance-governance', 'R': 'project-advisory-restructuring', 'S': 'public-sector-development',
    'T': 'ict-digital-economy', 'U': 'digital-products-ip', 'V': 'finance-investment', 'W': 'ict-digital-economy',
    'X': 'logistics-trade-services', 'Y': 'public-sector-development', 'Z': 'technology-automation',
}
TYPE_AISLE = {
    'retainer': 'retainers-advisory-desks', 'subscription': 'subscriptions-intelligence',
    'due-diligence-trust': 'due-diligence-verification', 'diagnostic': 'diagnostics-free-tools',
    'digital-toolkit': 'digital-products-ip', 'template': 'digital-products-ip',
}

AUDIENCE_WORDS = [
    ('founders', ['founder', 'startup', 'entrepreneur']),
    ('smes', ['sme', 'msme', 'entrepreneur', 'business support']),
    ('corporates', ['corporate', 'enterprise', 'executive', 'board', 'manager', 'management team']),
    ('investors', ['investor', 'funder', 'transaction', 'financier']),
    ('ngos', ['ngo', 'programme', 'donor']),
    ('public-sector', ['public sector', 'government', 'institution']),
    ('sponsors', ['sponsor']),
]

CATEGORY_NAMES = {}


def text(v):
    if v is None:
        return None
    s = re.sub(r'\s+', ' ', str(v)).strip()
    return s or None


def clean_category(name):
    """'P. Project Development ...' and 'Project Development ...' are the same category."""
    return re.sub(r'^[A-Z]\.\s+', '', name)


def zar(s):
    return int(s.replace(',', ''))


def parse_prices(price):
    m = dict((k.lower(), zar(v)) for k, v in re.findall(r'(Basic|Standard|Premium):\s*R([\d,]+)', price))
    return m if set(m) == {'basic', 'standard', 'premium'} else None


def parse_delivery(s):
    if not s:
        return {'basic': None, 'standard': None, 'premium': None}
    parts = dict((k.lower(), v.strip()) for k, v in re.findall(r'(Basic|Standard|Premium):\s*([^|]+)', s))
    if set(parts) == {'basic', 'standard', 'premium'}:
        return parts
    return {'basic': s, 'standard': s, 'premium': s}


def parse_features(tiers):
    """Feature lists per tier. Rows that carry only a price and a delivery time per tier have none."""
    out = {}
    for seg in tiers.split(' | '):
        m = re.match(r'(Basic|Standard|Premium)(?::\s*Basic:)?\s*:?\s*R[\d,]+\s*[:;]\s*(.+)$', seg.strip())
        if m:
            out[m.group(1).lower()] = [f.strip() for f in m.group(2).split(';') if f.strip()]
    return out if set(out) == {'basic', 'standard', 'premium'} else {}


def split_list(s, sep=';'):
    return [x.strip().rstrip('.') for x in (s or '').split(sep) if x.strip()]


def segment_list(s):
    parts = re.split(r',\s*|\s+and\s+', s or '')
    return [p.strip() for p in parts if p.strip()]


def audiences(segment):
    s = (segment or '').lower()
    keys = [k for k, words in AUDIENCE_WORDS if any(w in s for w in words)]
    return keys or ['smes']


def act_for(raw_type, delivery):
    if raw_type == 'Retainer':
        return 'retainer'
    if raw_type == 'Subscription':
        return 'subscription'
    if delivery and delivery.lower().startswith('quote route'):
        return 'quote'
    return 'purchase'


def category_for(raw_type, family, letter):
    if raw_type == 'Due Diligence / Trust Sprint':
        return 'due-diligence'
    if raw_type == 'AI / Automation Sprint':
        return 'ai-automation'
    if family in FAMILY_CATEGORY:
        return FAMILY_CATEGORY[family]
    return LETTER_CATEGORY.get(letter, 'business-management')


def main():
    wb = openpyxl.load_workbook(SRC, read_only=True)
    rows = list(wb['Full_7008_Register'].iter_rows(values_only=True))
    head = rows[0]
    reg = [dict(zip(head, r)) for r in rows[1:] if any(r)]
    audit_rows = list(wb['Source_Audit'].iter_rows(values_only=True))
    audit = {r[3]: dict(zip(audit_rows[0], r)) for r in audit_rows[1:] if r[3]}

    # Category letter per full category name (the register has both "P. Name" and "Name").
    letters = {}
    for r in reg:
        a = audit[r['Sprint ID']]
        letters.setdefault(clean_category(r['Sprint category']), a['Source Category Code'])

    slug_count = Counter(text(r['URL slug']).rstrip('/').split('/')[-1] for r in reg)
    out, rejected = [], []

    for r in reg:
        code = text(r['Sprint ID'])
        a = audit.get(code) or {}
        prices = parse_prices(text(r['Price']) or '')
        name = text(r['Sprint name'])
        if not code or not name or prices is None:
            rejected.append({'code': code, 'reason': 'missing code, name or three tier prices'})
            continue

        category = clean_category(text(r['Sprint category']))
        letter = a.get('Source Category Code') or letters.get(category)
        raw_type = text(a.get('Raw Sprint Type'))
        family = text(r['Page family'])
        delivery = parse_delivery(text(r['Delivery time']))
        type_key = TYPE_MAP.get(raw_type, 'fixed-scope')
        base_slug = text(r['URL slug']).rstrip('/').split('/')[-1]
        slug = base_slug if slug_count[base_slug] == 1 else f"{base_slug}-{code.lower()}"

        out.append({
            'code': code,
            'sku': text(r['SKU']),
            'name': name,
            'letter': letter,
            'category': category,
            'subcategory': text(r['Sprint subcategory']),
            'family': family,
            'level': text(r['Page variation level']),
            'raw_type': raw_type,
            'layer': text(a.get('Raw Commercial Layer')),
            'batch': text(a.get('Batch')),
            'segment': text(r['Client segment']),
            'problem': text(r['Business problem solved']),
            'promise': text(r['Outcome promise']),
            'deliverable': text(r['Main deliverable']),
            'format': text(r['Delivery format']),
            'delivery': delivery['basic'] if len(set(delivery.values())) == 1 else delivery,
            'prices': prices,
            'features': parse_features(text(r['Package tiers']) or ''),
            'addons': text(r['Add ons']),
            'subscription_path': text(r['Subscription path']),
            'retainer_path': text(r['Retainer path']),
            'media': text(r['Visual media type']),
            # Media the page design calls for: video, image, animation, calculator demo, dashboard demo.
            'needs_media': [k for k in ('video', 'image', 'animation', 'calculator', 'dashboard')
                            if text(r[f'{k.title()} required' if k in ('video', 'image', 'animation') else f'{k.title()} demo required']) == 'Yes'],
            'intake': text(r['Intake data required']),
            'documents': text(r['Documents required']),
            'automation': text(r['Automation class']),
            'human_review': text(r['Human review rule']),
            'risk': text(r['Risk tier']),
            'escalation': text(r['Consultant escalation rule']),
            # Both follow a per-batch pattern around the Sprint name; stored as "{name}" templates.
            'seo_title': (text(r['SEO title']) or '').replace(name, '{name}') or None,
            'meta_description': (text(r['Meta description']) or '').replace(name, '{name}') or None,
            'related': text(r['Related Sprints']),
            'upsell': text(r['Upsell path']),
            'cross_sell': text(r['Cross sell path']),
            'renewal': text(r['Renewal path']),
            'localisation': text(r['Country localisation notes']),
            # Derived (see rules above).
            'slug': slug,
            'type': type_key,
            'catalogue_category': category_for(raw_type, family, letter),
            'act': act_for(raw_type, delivery['basic']),
            'audience': audiences(text(r['Client segment'])),
            'aisle': TYPE_AISLE.get(type_key) or LETTER_AISLE.get(letter),
        })

    # Columns with few distinct values are stored once under "shared" and referenced by index.
    columns = list(out[0].keys())
    shared = {}
    for c in columns:
        values = [json.dumps(o[c], ensure_ascii=False) for o in out]
        distinct = list(dict.fromkeys(values))
        if c not in ('code', 'sku', 'name', 'slug') and len(distinct) <= 1000:
            shared[c] = [json.loads(v) for v in distinct]
            index = {v: i for i, v in enumerate(distinct)}
            for o, v in zip(out, values):
                o[c] = index[v]
    doc = {
        'source': SRC.name,
        'generated_from': 'Volume 11 Full 7,008 Sprint Design Register (Full_7008_Register and Source_Audit sheets)',
        'count': len(out),
        'rejected': rejected,
        'shared': shared,
        'columns': columns,
        'rows': [[o[c] for c in columns] for o in out],
    }
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'register.json').write_text(json.dumps(doc, ensure_ascii=False, separators=(',', ':')))
    print(f"rows={len(out)} rejected={len(rejected)} unique_slugs={len(set(o['slug'] for o in out))}")
    print('bytes', (OUT / 'register.json').stat().st_size)
    print(Counter(o['type'] for o in out).most_common())
    print(Counter(o['catalogue_category'] for o in out).most_common())
    print(Counter(o['act'] for o in out).most_common())
    print(Counter(o['aisle'] for o in out).most_common())


if __name__ == '__main__':
    main()
