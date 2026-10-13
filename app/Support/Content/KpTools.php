<?php

namespace App\Support\Content;

/**
 * KP Thought Leadership tools, KP Knowledge Assistant knowledge and Future Builders content.
 *
 * Tools are free-layer self-assessment and decision aids (blueprint 4.5): they produce
 * working drafts, never certifications, and they never claim live Founder involvement.
 */
class KpTools
{
    /* ------------------------------------------------------------------ */
    /* Knowledge Assistant (Pages 18 to 20, 25) */
    /* ------------------------------------------------------------------ */

    /** Structured knowledge the assistant may answer from. Each entry cites register sources. */
    public static function knowledge(): array
    {
        return [
            'pillars-of-execution' => [
                'question' => 'What are the 5 pillars of execution?',
                'keywords' => ['execution', 'pillars', 'execute', 'strategy into results', 'delivery'],
                'topic' => 'strategy-execution',
                'intro' => 'The 5 pillars of execution form the foundation of turning strategy into measurable, sustainable results.',
                'points' => [
                    ['Clarity', 'Define a compelling winning aspiration.', 'Clear direction aligns everyone around a bold and meaningful goal.', 'target'],
                    ['Alignment', 'Ensure everyone is moving in the same direction.', 'Translate strategy into shared priorities, roles and accountability.', 'users'],
                    ['Discipline', 'Focus on the critical few priorities.', 'Protect what matters most. Execute with consistency and remove distractions.', 'target'],
                    ['Accountability', 'Build a culture of ownership and follow-through.', 'Make commitments visible. Hold each other to high performance standards.', 'users'],
                    ['Learning', 'Continuously adapt, improve and innovate.', 'Build feedback loops. Learn fast. Turn experience into better results.', 'trending-up'],
                ],
                'close' => 'When these five pillars work together, execution becomes a competitive advantage.',
                'sources' => ['the-5-pillars-of-execution', 'why-execution-beats-ideas', 'execution-excellence-in-african-businesses', 'execution-excellence-framework'],
                'levels' => [
                    '12' => [['Know what you are trying to do and why it matters.', 'Like knowing the goal in a soccer game.'], ['Make sure everyone is on the same team.', 'Like making sure your team knows the game plan.'], ['Do the important things, even when it is hard.', 'Like practising every day to get better.'], ['Take responsibility and follow through.', 'Like making sure you do your part.'], ['Keep improving and learn from mistakes.', 'Like watching a replay to get better next time.']],
                    'student' => [['Set one clear, measurable goal that everyone understands.', 'A group project with one agreed outcome.'], ['Share the plan and agree who does what.', 'Splitting tasks in a study group.'], ['Spend time on the few tasks that matter most.', 'Revising the topics most likely to be examined.'], ['Track who promised what and check progress.', 'A shared task list with names and dates.'], ['Review what worked and change the plan.', 'Reviewing marked work before the next test.']],
                    'professional' => [['Translate strategy into a small set of measurable outcomes.', 'Three quarterly objectives with owners.'], ['Cascade priorities into team plans and roles.', 'Team plans that trace back to company goals.'], ['Limit work in progress to the critical few.', 'Stopping projects that do not serve the outcomes.'], ['Make commitments and results visible.', 'A weekly scorecard reviewed by the team.'], ['Run short review cycles and adapt.', 'A monthly retrospective that changes the plan.']],
                    'executive' => [['Set the winning aspiration and the few outcomes that define success.', 'A board-approved strategy with explicit trade-offs.'], ['Align leaders, budgets and incentives to the same priorities.', 'Capital allocation that follows strategy.'], ['Protect focus by saying no to good but non-critical initiatives.', 'A portfolio review that stops low-value work.'], ['Hold leaders to visible commitments and consequences.', 'Executive scorecards linked to performance reviews.'], ['Institutionalise learning loops across the organisation.', 'Quarterly strategy reviews using evidence.']],
                    'expert' => [['Specify outcomes, measures and the causal logic linking them.', 'An outcome tree with leading and lagging indicators.'], ['Design governance, decision rights and resourcing for the strategy.', 'A decision-rights matrix and resource plan.'], ['Apply portfolio discipline and capacity limits.', 'Work-in-progress limits and stage gates.'], ['Embed performance management with transparent data.', 'Integrated dashboards and accountability cadences.'], ['Build adaptive systems: experiments, feedback and knowledge capture.', 'Test-and-learn programmes with documented lessons.']],
                ],
            ],
            'pillars-of-readiness' => [
                'question' => 'What makes a business investable?',
                'keywords' => ['capital', 'investable', 'readiness', 'funding', 'investor', 'raise', 'funders'],
                'topic' => 'capital-funding',
                'intro' => 'Capital follows capability. Investors, lenders and funders are buying your ability to execute, govern, measure and deliver results under pressure.',
                'points' => [
                    ['Clear Strategy', 'A focused strategy that solves a real problem for a real customer.', '', 'target'],
                    ['Financial Discipline', 'Clean numbers, cash flow control and credible financial forecasts.', '', 'bar-chart-3'],
                    ['Governance & Controls', 'Strong governance that protects capital and builds investor confidence.', '', 'shield-check'],
                    ['Execution Capacity', 'The right team, processes, partners and operational capability.', '', 'users'],
                    ['Evidence & Proof', 'Market, financial and operational proof that reduce risk for the investor.', '', 'file-check'],
                ],
                'close' => 'When these five pillars are weak, more capital only creates a bigger problem.',
                'sources' => ['the-real-problem-isnt-capital', 'seven-signals-investors-look-for', 'before-capital-moves', 'capital-readiness-diagnostic'],
                'levels' => [],
            ],
            'project-risks' => [
                'question' => 'What are the key risks in project development?',
                'keywords' => ['project', 'risks', 'fatal', 'bankab', 'feasibility', 'deal-breaker'],
                'topic' => 'project-development',
                'intro' => 'TBCA project reviews look first for the deal-breakers below. Each one can stop or severely delay a project when it is found late.',
                'points' => array_map(fn ($r) => [$r[1], $r[5], $r[6], 'triangle-alert'], array_slice(self::flawRules(), 0, 6)),
                'close' => 'Run the Project Fatal-Flaw Explorer to test your own project against these checks.',
                'sources' => ['why-projects-fail-before-they-start', 'projects-die-quietly', 'bankability-is-earned', 'project-development-playbook'],
                'levels' => [],
            ],
        ];
    }

    public static function levels(): array
    {
        return [
            '12' => ["I'm 12", 'Simple, everyday examples', 'smile'],
            'student' => ["I'm a Student", 'Clear and structured explanation', 'graduation-cap'],
            'professional' => ["I'm a Professional", 'Practical and to the point', 'briefcase'],
            'executive' => ["I'm an Executive", 'Strategic and high-level', 'bar-chart-3'],
            'expert' => ["I'm an Expert", 'Technical and in-depth', 'lightbulb'],
        ];
    }

    public static function suggestions(): array
    {
        return ['What are the 5 pillars of execution?', 'What makes a business investable?', 'Key risks in project development', 'Opportunities in Kenya', 'How to improve board effectiveness?'];
    }

    /* ------------------------------------------------------------------ */
    /* Funder Readiness Interviewer (Page 22) */
    /* ------------------------------------------------------------------ */

    public static function funderQuestions(): array
    {
        return [
            ['Market & Opportunity', 'What problem do you solve, and for which customer, in which market?', 'Name the customer segment and the pain in their words.'],
            ['Market & Opportunity', 'What is the size of the market you are targeting, and why is it growing?', 'Include TAM, SAM and SOM if applicable. Use data and credible sources.'],
            ['Market & Opportunity', 'Who are your competitors and why do customers choose you?', 'Show real alternatives, including doing nothing.'],
            ['Market & Opportunity', 'What evidence of demand do you have today?', 'Orders, letters of intent, pilots, repeat customers.'],
            ['Product & Solution', 'What does your product or service do, in one sentence?', 'Plain language a funder can repeat.'],
            ['Product & Solution', 'What stage is the product at, and what is still unproven?', 'Prototype, pilot, early revenue or scaling.'],
            ['Product & Solution', 'What protects your advantage over time?', 'Licences, data, relationships, cost or know-how.'],
            ['Business Model', 'How do you make money, and what does a customer pay?', 'Price, frequency and who pays.'],
            ['Business Model', 'What does it cost to acquire and serve a customer?', 'Unit economics per customer or per unit.'],
            ['Business Model', 'When does the business break even, and on what assumptions?', 'State the assumptions explicitly.'],
            ['Team & Execution', 'Who leads the business and what have they delivered before?', 'Track record that is relevant to this plan.'],
            ['Team & Execution', 'Which skills are missing and how will you fill them?', 'Hires, advisers or partners.'],
            ['Team & Execution', 'What are the next three milestones and their dates?', 'Milestones a funder can verify.'],
            ['Financials', 'What are your revenue and costs for the last 12 months?', 'Management accounts are acceptable if audited figures are not available.'],
            ['Financials', 'How much are you raising, on what terms, and for what use?', 'Use of funds by category and timing.'],
            ['Financials', 'What is your cash runway today?', 'Months of operating cost covered by current cash.'],
            ['Financials', 'Which financial assumptions are most sensitive?', 'Show what happens if they are 20 percent worse.'],
            ['Impact & ESG', 'What measurable impact does the business create?', 'Jobs, access, emissions or income, with how you measure it.'],
            ['Impact & ESG', 'Which environmental, social or governance risks apply to you?', 'Name the risk and the control.'],
            ['Risk & Mitigation', 'What could cause this business to fail, and what are you doing about it?', 'Top three risks with mitigations.'],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Project Fatal-Flaw Explorer (Page 23) */
    /* ------------------------------------------------------------------ */

    public static function projectTypes(): array
    {
        return ['Digital Transformation', 'Infrastructure', 'Energy', 'Agro-Processing', 'Manufacturing', 'Property Development', 'Mining', 'Healthcare', 'Services Expansion'];
    }

    public static function projectStages(): array
    {
        return ['Concept', 'Planning / Feasibility', 'Financing', 'Implementation', 'Operations'];
    }

    public static function investmentBands(): array
    {
        return [['under-5m', 'Under R5m', 2500000], ['5m-25m', 'R5m - R25m', 15000000], ['25m-100m', 'R25m - R100m', 60000000], ['over-100m', 'Over R100m', 150000000]];
    }

    /**
     * Rule base: [id, title, severity, impact, likelihood, explanation, guidance, trigger].
     * trigger keys: industries, types, stages, keywords (any match), bands.
     */
    public static function flawRules(): array
    {
        return [
            ['licensing', 'Regulatory Licensing Gap', 'critical', 'Project Stop', 'High', 'The activity appears to need a licence or authorisation that the plan does not show a path to.', 'Map every licence, permit and approval, with the regulator, timeline and cost. Speak to a regulatory specialist before committing capital.', ['industries' => ['Fintech', 'Financial Services', 'Healthcare', 'Energy', 'Mining'], 'keywords' => ['payment', 'licen', 'lending', 'insurance', 'pharma']]],
            ['capital', 'Capital & Liquidity Insufficiency', 'critical', 'Project Stop', 'High', 'Working capital and contingency look thin for the stage and size of the project.', 'Build a 24-month cash flow with contingency of at least 15 percent and stress test the timing of income.', ['stages' => ['Concept', 'Planning / Feasibility'], 'bands' => ['25m-100m', 'over-100m', '5m-25m']]],
            ['partner', 'Key Partner Dependency', 'high', 'Severe Delay', 'Medium', 'The plan relies heavily on a single partner for a critical function.', 'Identify a backup partner, agree service levels in writing and plan the exit route if the partner fails.', ['keywords' => ['partner', 'bank', 'platform', 'supplier', 'offtake', 'sole']]],
            ['credit', 'Credit Risk & Underwriting Model', 'high', 'Severe Delay', 'Medium', 'No proven credit risk model or data source is identified for lending.', 'Define the underwriting model, data sources, default assumptions and collection process before launch.', ['keywords' => ['credit', 'lending', 'loan', 'finance option', 'buy now']]],
            ['cyber', 'Cybersecurity & Data Protection', 'medium', 'Moderate Delay', 'Medium', 'Security architecture and POPIA (or local data law) compliance measures are not yet defined.', 'Complete a data protection impact assessment and a security architecture review.', ['types' => ['Digital Transformation'], 'industries' => ['Fintech', 'Technology'], 'keywords' => ['data', 'app', 'platform', 'digital', 'online']]],
            ['land', 'Land, Permits & Environmental Approval', 'critical', 'Project Stop', 'Medium', 'Physical projects stall when land rights, zoning or environmental authorisation are unresolved.', 'Confirm land tenure, zoning and environmental authorisation status, with dates and responsible parties.', ['types' => ['Infrastructure', 'Energy', 'Property Development', 'Mining', 'Agro-Processing', 'Manufacturing']]],
            ['offtake', 'Unsecured Offtake or Demand', 'high', 'Severe Delay', 'Medium', 'Revenue depends on customers or offtakers that are not yet contracted.', 'Secure letters of intent or offtake agreements that a lender would accept as evidence.', ['types' => ['Energy', 'Agro-Processing', 'Manufacturing', 'Mining']]],
            ['fx', 'Currency & Import Exposure', 'medium', 'Moderate Delay', 'Medium', 'Imported equipment or foreign-currency debt creates currency risk against local income.', 'Quantify the currency exposure and choose a hedge, local sourcing or local-currency funding.', ['keywords' => ['import', 'dollar', 'usd', 'equipment', 'foreign']]],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Diagnostic Questions (Page 28) */
    /* ------------------------------------------------------------------ */

    public static function diagnosticTopics(): array
    {
        $opts = fn (array $o) => array_map(fn ($x) => ['label' => $x[0], 'hint' => $x[1], 'weak' => $x[2] ?? false], $o);

        return [
            'strategy-growth' => ['Strategy & Growth', [
                ['What is your primary growth objective over the next 12 to 24 months?', $opts([['Increase Revenue', 'Grow sales or income from existing or new markets.'], ['Improve Profitability', 'Increase margins and profitability of current operations.'], ['Expand to New Markets', 'Enter new geographic regions or customer segments.'], ['Develop New Products / Services', 'Innovate or diversify the product or service offering.'], ['Raise Funding / Capital', 'Secure investment or financing to fuel growth.'], ['Other', 'Another objective not listed above.']])],
                ['How clearly is your strategy written down and shared?', $opts([['Written and shared with the team', 'Everyone can explain it.'], ['Written but not shared', 'Leaders know it; the team does not.'], ['In the founder\'s head', 'Not written down.', true]])],
                ['How do you track progress against the strategy?', $opts([['Monthly scorecard', 'A small set of measures reviewed monthly.'], ['Occasional reviews', 'When there is time.'], ['We do not track it', 'No regular review.', true]])],
            ]],
            'finance-funding' => ['Finance & Funding', [
                ['How current are your management accounts?', $opts([['Up to date monthly', 'Closed within 30 days of month end.'], ['Quarterly', 'Updated every three months.'], ['Annual only', 'Only the year-end statements.', true]])],
                ['How many months of operating costs does your cash cover?', $opts([['More than 6 months', 'Comfortable runway.'], ['3 to 6 months', 'Some runway.'], ['Less than 3 months', 'Urgent.', true]])],
                ['What funding are you seeking?', $opts([['Equity', 'Investors take a share.'], ['Debt', 'Loans or facilities.'], ['Grant', 'Non-repayable funding.'], ['Not seeking funding', 'Self-funded growth.']])],
            ]],
            'operations' => ['Operations & Efficiency', [
                ['Are your core processes documented?', $opts([['Yes, and followed', 'Documented and used.'], ['Partly', 'Some processes documented.'], ['No', 'Knowledge sits with people.', true]])],
                ['What limits your capacity most?', $opts([['People', 'Skills or headcount.'], ['Systems', 'Tools and technology.'], ['Cash', 'Working capital.'], ['Supply', 'Inputs or suppliers.']])],
            ]],
            'risk-compliance' => ['Risk & Compliance', [
                ['Do you keep a risk register?', $opts([['Yes, reviewed regularly', 'Owners and actions assigned.'], ['Yes, rarely reviewed', 'Exists but out of date.', true], ['No', 'No formal register.', true]])],
                ['How confident are you in your tax and regulatory compliance?', $opts([['Fully compliant', 'Verified by a professional.'], ['Mostly', 'Some uncertainty.'], ['Unsure', 'Needs a review.', true]])],
            ]],
            'people-culture' => ['People & Culture', [
                ['Does every key role have a named successor or cover?', $opts([['Yes', 'Cover for critical roles.'], ['Some roles', 'Partial cover.'], ['No', 'Single points of failure.', true]])],
            ]],
            'market-customers' => ['Market & Customers', [
                ['How do you know customers value your offer?', $opts([['Repeat purchases and referrals', 'Behavioural evidence.'], ['Customer feedback', 'Stated preference.'], ['We assume so', 'No evidence yet.', true]])],
            ]],
            'esg' => ['ESG & Sustainability', [
                ['Do funders or customers ask you about ESG?', $opts([['Often', 'It affects deals.'], ['Sometimes', 'Occasionally.'], ['Never', 'Not yet relevant.']])],
            ]],
            'technology-data' => ['Technology & Data', [
                ['How do you use data in decisions?', $opts([['Dashboards drive decisions', 'Regular, trusted data.'], ['Some reports', 'Ad hoc reporting.'], ['Gut feel', 'Little data used.', true]])],
            ]],
            'legal-governance' => ['Legal & Governance', [
                ['Does your business have an independent board or advisory board?', $opts([['Independent board', 'With non-executive members.'], ['Advisory board', 'Informal advice.'], ['No board', 'Owner decides alone.', true]])],
            ]],
            'project-readiness' => ['Project Readiness', [
                ['What stage is your main project at?', $opts([['Concept', 'Idea and early scoping.'], ['Feasibility', 'Studies under way.'], ['Financing', 'Raising funding.'], ['Implementation', 'Being built or rolled out.']])],
            ]],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Scorecard, calculator and checklist (Pages 29 to 31) */
    /* ------------------------------------------------------------------ */

    public static function scorecards(): array
    {
        return [
            'capital-readiness' => [
                'title' => 'Capital Readiness Scorecard',
                'version' => 'v1.0',
                'intro' => 'Rate each area from 0 to 100 using the guidance. The overall score is the simple average of the ten areas.',
                'categories' => [
                    ['Strategy & Growth', 'A focused strategy with measurable outcomes.', 70],
                    ['Finance & Funding', 'Current accounts, cash control and credible forecasts.', 60],
                    ['Risk & Compliance', 'A live risk register and verified compliance.', 55],
                    ['Operations & Efficiency', 'Documented processes and capacity to deliver.', 65],
                    ['People & Culture', 'Leadership depth and cover for key roles.', 60],
                    ['Market & Customers', 'Behavioural evidence of demand.', 60],
                    ['ESG & Sustainability', 'Known ESG risks with controls.', 50],
                    ['Technology & Data', 'Reliable data used in decisions.', 55],
                    ['Legal & Governance', 'Board oversight and clean legal structure.', 50],
                    ['Project Readiness', 'Next-stage evidence for the main project.', 55],
                ],
            ],
        ];
    }

    public static function checklists(): array
    {
        return [
            'go-no-go' => [
                'title' => 'Decision Checklist',
                'sections' => [
                    ['Strategic Fit', [['Aligned with strategic objectives', 'Ensures the initiative supports long-term goals.', 'Decision Sheet'], ['Solves a real and important problem', 'Confirms relevance and value.', 'Fatal-Flaw Explorer'], ['Creates sustainable competitive advantage', 'Differentiates and protects position.', 'Scorecard'], ['Stakeholder support secured', 'Ensures internal alignment and buy-in.', 'Funder Readiness Interviewer']]],
                    ['Feasibility', [['Technically achievable', 'Technology and capability exist.', 'Diagnostic Questions'], ['Resource capacity available', 'People, time and tools are available.', 'Insight Action Pack'], ['Financially viable (returns exceed cost)', 'Expected returns justify investment.', 'Calculator'], ['Regulatory and legal compliance assured', 'Avoids legal, tax and compliance risks.', 'Diagnostic Questions']]],
                    ['Risk & Assurance', [['Major risks identified', 'Critical risks are known and documented.', 'Fatal-Flaw Explorer'], ['Risk mitigation plans in place', 'Plans exist to reduce key risks.', 'Insight Action Pack'], ['Data quality and sources reliable', 'Decisions based on credible information.', 'Source & Confidence Panel'], ['Assumptions tested and valid', 'Key assumptions reviewed and reasonable.', 'Calculator']]],
                    ['Readiness to Proceed', [['Clear path to implementation', 'Next steps are defined and actionable.', 'Insight Action Pack'], ['Success metrics defined', 'How success will be measured is clear.', 'Decision Sheet'], ['Funding or budget confirmed', 'Budget or funding commitment secured.', 'Funder Readiness Interviewer'], ['Go / No-Go decision recommended', 'Overall recommendation based on evidence.', 'Scorecard']]],
                ],
            ],
        ];
    }

    /** Insight Action Pack (Page 27) actions for the readiness insight. */
    public static function actionPack(): array
    {
        return [
            ['Write a one-page strategy', 'State the problem, the customer and the three outcomes for the next 12 months.', 'high', 'High', '0 to 30 days', 'Founder', 'Clear Strategy'],
            ['Close the monthly accounts within 30 days', 'Produce management accounts and a 13-week cash flow every month.', 'high', 'High', '0 to 60 days', 'Finance Lead', 'Financial Discipline'],
            ['Set up a basic governance rhythm', 'Hold a monthly board or advisory meeting with minutes and an action list.', 'medium', 'High', '30 to 90 days', 'Founder', 'Governance & Controls'],
            ['Fill the critical capability gap', 'Name the one missing skill that blocks delivery and decide: hire, partner or adviser.', 'medium', 'Medium', '30 to 90 days', 'Founder', 'Execution Capacity'],
            ['Build an evidence pack', 'Collect contracts, customer proof, financial statements and operational data in one folder.', 'high', 'High', '0 to 60 days', 'Operations', 'Evidence & Proof'],
            ['Run the Capital Readiness Scorecard', 'Score the ten readiness areas and choose the two weakest to fix first.', 'low', 'Medium', '0 to 30 days', 'Founder', 'All pillars'],
        ];
    }

    /* ------------------------------------------------------------------ */
    /* Future Builders (Pages 34 to 42) */
    /* ------------------------------------------------------------------ */

    public static function learnerTopics(): array
    {
        return [
            ['money-matters', 'Money Matters', 'Learn how money works and make smart financial decisions.', 'bar-chart-3', 'Beginner', 'business-basics'],
            ['entrepreneur-mindset', 'Entrepreneur Mindset', 'Think like a founder and turn ideas into opportunities.', 'rocket', 'Beginner', 'business-basics'],
            ['sustainable-future', 'Sustainable Future', 'Discover how we can build a better and greener world.', 'globe', 'Intermediate', null],
            ['leadership-and-you', 'Leadership & You', 'Build confidence, communicate well and inspire others.', 'users', 'Beginner', null],
            ['tech-and-innovation', 'Tech & Innovation', 'Explore technology and how it shapes our future.', 'lightbulb', 'Intermediate', 'ai-literacy'],
            ['environment', 'Environment', 'Understand the planet and how to protect it.', 'sprout', 'Beginner', null],
            ['society-and-impact', 'Society & Impact', 'Learn how communities work and how you can help.', 'heart-handshake', 'Intermediate', null],
            ['rights-and-responsibilities', 'Rights & Responsibilities', 'Know your rights, respect others and make good choices.', 'shield-check', 'Beginner', null],
        ];
    }

    /** Lesson courses. Lesson 1 text is taken from KP's design; later lessons are TBCA educational content (Voice E). */
    public static function courses(): array
    {
        return [
            'business-basics' => [
                'title' => 'Business Basics', 'level' => 'Beginner', 'minutes' => 10,
                'outcomes' => ['Define what a business is', 'Understand how businesses create value', 'Identify examples of different businesses', 'Recognise needs and problems around you'],
                'activity' => 'Write down 3 problems you see around you. Think of one way you could solve each.',
                'lessons' => [
                    ['What is a Business?', 'A business is any activity that provides goods or services people need or want, with the goal of creating value and earning money.', ['A business solves a problem or satisfies a need for someone.', 'It can be big or small. It can be online or offline.', 'It can be run by one person or a team.'], ['A baker sells bread.', 'A tutor helps students learn.', 'A designer creates logos.', 'An app developer builds apps.', 'A farmer grows vegetables.'], 'A business creates value by solving problems or meeting needs, and earns money in return.', 'What problems can you solve? What are people around you always looking for?'],
                    ['Why Businesses Exist', 'Businesses exist because people have needs and wants that they are willing to pay someone else to meet.', ['Businesses save people time, effort or money.', 'They create jobs and income for families.', 'They pay taxes that fund schools and roads.'], ['A taxi saves you a long walk.', 'A shop brings goods closer to home.'], 'Businesses exist to meet needs, and they survive only while people value what they offer.', 'Which business near you would people miss most if it closed?'],
                    ['Needs and Wants', 'Needs are things we must have to live safely. Wants are things that make life nicer.', ['Food, water and shelter are needs.', 'Games and new trainers are usually wants.', 'Businesses can serve both.'], ['A clinic meets a need.', 'A music shop meets a want.'], 'Knowing the difference helps you price, plan and choose customers.', 'List three needs and three wants in your home.'],
                    ['Types of Businesses', 'Businesses can sell products, sell services, or do both.', ['Sole traders are run by one person.', 'Partnerships share ownership.', 'Companies can have many owners.'], ['A street vendor is a sole trader.', 'A law firm is often a partnership.'], 'The type of business affects who owns it and who takes the risk.', 'What type of business would you start?'],
                    ['Goods vs Services', 'Goods are things you can touch. Services are things someone does for you.', ['Goods can be stored and transported.', 'Services are usually delivered as they are used.'], ['Bread is a good.', 'A haircut is a service.'], 'Many businesses combine goods and services.', 'Is a restaurant selling goods, services or both?'],
                    ['Your Ideas Matter', 'Every business starts as an idea to solve a problem.', ['Good ideas come from noticing problems.', 'Start small and test your idea.'], ['Selling water at a busy bus stop.'], 'An idea becomes valuable when someone is willing to use or pay for it.', 'Write one idea you could test this week.'],
                    ['Simple Business Models', 'A business model explains who the customer is, what they get and how the business earns money.', ['Customer: who pays?', 'Value: what do they get?', 'Money: how do you earn?'], ['A tuck shop buys snacks in bulk and sells them one by one.'], 'A simple model fits on one page.', 'Draw the model of a business you know.'],
                    ['Customers First', 'Customers decide whether a business succeeds.', ['Listen to what customers say and watch what they do.', 'Happy customers come back and tell friends.'], ['A shop that remembers your name.'], 'Look after customers and they look after the business.', 'How would you ask customers what they want?'],
                    ['Revenue Basics', 'Revenue is the money a business receives from selling its goods or services.', ['Revenue = price x number sold.'], ['Selling 20 cupcakes at R10 gives R200 revenue.'], 'Revenue is not profit. Costs still need to be paid.', 'How could a business increase its revenue?'],
                    ['Costs Basics', 'Costs are the money a business spends to make and sell its goods or services.', ['Some costs change with sales (ingredients).', 'Some costs stay the same (rent).'], ['Flour and sugar for cupcakes are costs.'], 'Every business must know its costs.', 'List the costs of running a lemonade stand.'],
                    ['Profit: What and Why?', 'Profit is what is left when costs are taken away from revenue.', ['Profit = revenue minus costs.', 'Profit lets a business grow and survive bad months.'], ['R200 revenue minus R120 costs is R80 profit.'], 'A busy business can still make a loss if costs are too high.', 'Why might a business choose lower profit for a while?'],
                    ['Check Your Knowledge', 'Review what you have learned about business basics.', ['A business solves a problem for a customer.', 'Revenue minus costs equals profit.', 'Customers decide what succeeds.'], [], 'You now know the building blocks of a business.', 'Which lesson changed how you see businesses around you?'],
                ],
            ],
            'ai-literacy' => [
                'title' => 'AI Literacy', 'level' => 'Beginner', 'minutes' => 12,
                'outcomes' => ['Define what AI is and how it works', 'Identify examples of AI in everyday life', 'Understand the benefits and limitations', 'Use AI tools safely and responsibly'],
                'activity' => 'List 3 examples of AI you use or see in your daily life.',
                'lessons' => [
                    ['What is Artificial Intelligence?', 'Artificial Intelligence (AI) is when computers or machines are designed to think, learn and make decisions, similar to how humans do.', ['AI helps machines perform tasks that usually need human intelligence, such as learning from data, understanding language, recognising images and speech, solving problems and making predictions.'], ['When a video app recommends a show you might like, or a map app suggests the fastest route, that is AI at work.'], 'AI is not magic. It is technology that learns from information and helps us do things smarter and faster.', 'Where have you seen or used AI in your daily life? How did it help you?'],
                    ['How AI Works', 'AI learns patterns from large amounts of examples, called data.', ['The more good examples it sees, the better it predicts.', 'AI can be wrong when its data is wrong or incomplete.'], ['A spam filter learns from emails people marked as spam.'], 'AI predicts. It does not know things the way people do.', 'What examples would you give an AI to recognise a cat?'],
                    ['Real-World Examples of AI', 'AI is already used in many areas of life.', ['Farming: spotting crop disease from photos.', 'Health: helping read scans.', 'Transport: planning routes.'], ['A phone that unlocks with your face.'], 'AI is a tool people use to solve problems.', 'Which example surprised you?'],
                    ['Benefits of AI', 'AI can save time and help people make better decisions.', ['It works fast on large amounts of information.', 'It can help people learn in their own language.'], ['Translation apps help travellers.'], 'Used well, AI can help communities.', 'How could AI help your school?'],
                    ['Risks and Limitations', 'AI can make mistakes, called hallucinations, and can repeat unfair patterns from its data.', ['Always check important answers against a trusted source.', 'Never share private information with an AI tool.'], ['An AI may invent a fact that sounds correct.'], 'Check the source before you trust an AI answer.', 'How would you check if an AI answer is true?'],
                    ['AI and Jobs', 'AI changes jobs: some tasks are automated and new jobs appear.', ['People who can work with AI are in demand.', 'Human skills like care and judgement still matter.'], ['A designer uses AI to draft ideas, then improves them.'], 'Learn to work with AI, not against it.', 'Which job would you like, and how might AI help in it?'],
                    ['Using AI Responsibly', 'Responsible use means honesty, safety and respect.', ['Say when you used AI for schoolwork.', 'Do not use AI to copy or to hurt others.'], ['Telling your teacher you used AI to plan an essay.'], 'Be honest about how you use AI.', 'What rule would you set for AI at school?'],
                    ['AI Tools for Learning', 'AI can be a study helper when used carefully.', ['Ask it to explain, then check the explanation.', 'Use it to practise, not to replace your own thinking.'], ['Asking AI for practice questions before a test.'], 'AI should support your learning, not do it for you.', 'Write one good question to ask an AI study helper.'],
                    ['AI in Business', 'Businesses use AI to serve customers and work more efficiently.', ['Chat assistants answer common questions.', 'AI helps forecast what customers will buy.'], ['A shop predicting how much bread to bake.'], 'AI helps businesses decide, but people stay responsible.', 'How could a small shop near you use AI?'],
                    ['Your AI Action Plan', 'Plan how you will use AI safely and well.', ['Choose one tool to learn.', 'Set one rule for checking answers.', 'Set one rule for privacy.'], [], 'You are ready to use AI with care and confidence.', 'What is the first step of your AI plan?'],
                ],
            ],
        ];
    }

    public static function challengeSteps(): array
    {
        return [
            ['Spot the Problem', 'Look around your home, school or community. What problem do people face often?', 'search'],
            ['Understand It', 'Who is affected? Why is it a problem? How does it make life harder for them?', 'pen'],
            ['Think of Ideas', 'Brainstorm possible solutions. No idea is too small or too simple at this stage.', 'lightbulb'],
            ['Choose a Solution', 'Pick the best idea. How will it solve the problem in a simple way?', 'clipboard-check'],
            ['Plan Your First Step', 'What is one small step you can take to start making your idea happen?', 'rocket'],
        ];
    }

    public static function sparks(): array
    {
        return [
            ['The best way to predict the future is to create it.', 'Attributed to Peter Drucker'],
            ['A goal without a plan is just a wish.', 'Attributed to Antoine de Saint-Exupery'],
            ['Start where you are. Use what you have. Do what you can.', 'Arthur Ashe'],
        ];
    }
}
