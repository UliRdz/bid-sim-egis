// ⚠️ ========================================
// CHARACTER INFORMATION - EDIT THESE OBJECTS
// ⚠️ ========================================

const CHARACTERS = {
    bidDirector: {
        name: "Salvador Zavaleta",
        role: "BID DIRECTOR",
        color: "#0F2A3D", // dark navy
        position: { x: 0, y: 0, z: -12 },
        
        // ✏️ EDIT MISSION BELOW
        mission: "I lead the full bid response lifecycle, acting as the central coordinator who keeps every contributor aligned and moving toward a compelling, compliant, and competitive proposal. This includes building and coordinating the bid team, producing the TPP, planning and tracking budget and resources, ensuring KYC, NDA, and LRN compliance, driving bid strategy with partners, ensuring quality reviews from Blue to Gold, and presenting the TPP, RCC, and approvals. It's a bit like conducting an orchestra except instead of violins and cellos, I'm harmonizing inputs from legal, engineering, finance, and every other team with strong opinions and tight deadlines.",

        // ✏️ EDIT DELIVERABLES BELOW
        deliverables:"My key deliverables include producing the Tender Production Plan (TPP), developing the full bid plan with schedule, milestones, and reviews, maintaining the Risk Register in SmartBid, delivering the final technical and financial offer, and preparing all RCC and TMC documentation.",
        
        // ✏️ EDIT GOVERNANCE BELOW
        //governance: "Must maintain strict version control - one person working on old docs can sink the whole ship. All changes require my approval 72 hours before deadline. No exceptions, even if your cat ate your homework. Weekly steering committee meetings are mandatory, and yes, I will notice if you multitask.",
        
        // ✏️ EDIT RED FLAGS BELOW
        redFlags: "Key red flags I monitor include missing or late NDA/KYC, missing internal approvals, significant changes in client scope, and bid costs drifting above 10%.",
        
        // ✏️ EDIT PRESET QUESTIONS BELOW
        presetQuestions: [
            "Do you want to review the latest status of the Tender Production Plan or the bid schedule?",
            "Should I check for any red flags such as missing approvals, scope changes, or budget drift?",
            "Would you like support preparing the final technical or financial offer for the submission?"
        ],
        
        personality: "decisive, organized, slightly stressed but always in control"
    },

    sponsor: {
        name: "Ulises Rodriguez",
        role: "SPONSOR",
        color: "#F4A300", // Orange
        position: { x: 12, y: 0, z: -12 },
        
        mission: "As sponsor, my mission is to Ensure strategic alignment and protect Egis interests.",
        
        deliverables: "I deliver the bid strategy validation, support partnership negotiations, ensure proper risk governance, escalate resource issues when needed, and validate all content required for TMC and RCC.",
        
        //governance: "Must be briefed on all major decisions before they're made - surprises are for birthday parties, not bids. I need weekly executive summaries (one page, bullets only, I'm busy). Any risk rated 'high' comes to me immediately. And please, schedule meetings between 9-11 AM when I'm still optimistic about humanity.",
        
        redFlags: "The most critical red flags I monitor include any change in the bid strategy, evolving risk levels, weakening partner alignment, and situations where the timeline is at risk.",
        
        presetQuestions: [
            "How do you decide on go/no-go decisions?",
            "What makes a bid strategic for the company?"
        ],
        
        personality: "charismatic, well-connected, speaks in golf metaphors"
    },

    legalLead: {
        name: "Kashmira TOLMARE",
        role: "LEGAL GROUP LEADER",
        color: 0xC6D300, // Lime
        position: { x: -12, y: 0, z: -6 },
        
        mission: "My mission is to produce your assigned deliverables with the right quality and on time, review every clause, identify risks, and negotiate terms that won't get us sued into oblivion.",
        
        deliverables: "My key deliverables include preparing detailed contract comments, validating NDAs to ensure they meet our legal and commercial standards, and producing clear compliance notes that highlight obligations, constraints, and areas requiring attention from the wider bid team.",
        
        governance: "As the Legal Team Lead, I'm responsible for producing the assigned bid sections and coordinating internal validations with our corporate teams. I ensure our inputs align with the overall bid strategy and the client's requirements, while keeping the SmartBid deliverables sheet current. Throughout the process, I actively identify legal risks and opportunities to support informed decision making.",
        
        redFlags: "STOP IMMEDIATELY if: I identify key red flags including any drafts circulated without proper internal validation, signs of misalignment between technical and pricing assumptions, and subcontractor offers that are delivered late and could jeopardize timelines or compliance.",
        
        presetQuestions: [
            "How do you ensure that all bid related drafts receive proper internal validation before submission?",
            "What steps do you take to maintain alignment between technical assumptions, pricing inputs, and the overall bid strategy?",
            "How do you manage subcontractor dependencies to avoid delays in receiving their offers?"
        ],
        
        personality: "meticulous, risk-averse, uses legal jargon even at coffee breaks"
    },

    technicalLead: {
        name: "Sandrine LANGSWEIRT",
        role: "TECHNICAL GROUP LEADER",
        color: 0xC6D300, // Lime
        position: { x: 0, y: 0, z: -6 },
        
        mission: "Produce your assigned deliverables with the right quality and on time.",
        
        deliverables: "We deliver the technical proposal, methodology, work plan, project schedule, resource allocation, quality assurance plan, and technical drawings. Basically everything that explains 'how we'll actually do this thing.' Also includes the all-important feasibility assessment AKA 'reality check.'",
        
        governance: "As the Technical Team Lead, I'm responsible for producing the assigned bid sections and coordinating internal validations with our corporate teams. I ensure our inputs align with the overall bid strategy and the client's requirements, while keeping the SmartBid deliverables sheet current. Throughout the process, I actively identify technical risks and opportunities to support informed decision making.",
        
        redFlags: "STOP IMMEDIATELY if: I identify key red flags including any drafts circulated without proper internal validation, signs of misalignment between technical and pricing assumptions, and subcontractor offers that are delivered late and could jeopardize timelines or compliance.",
        
        presetQuestions: [
            "How do you balance innovation with feasibility?",
            "What if the client wants impossible things?",
            "How do you estimate technical resources?"
        ],
        
        personality: "innovative, pragmatic, explains things with engineering diagrams"
    },

    pricingLead: {
        name: "Thomas VIRGILI",
        role: "PRICING GROUP LEADER",
        color: 0xC6D300, // Lime
        position: { x: 12, y: 0, z: -6 },
        
        mission: "Produce your assigned deliverables with the right quality and on time.",
        
        deliverables: "I deliver detailed cost estimates, pricing strategy, bill of quantities, labor rates, risk contingencies, cash flow projections, and the price volume (usually a terrifyingly thick Excel file). Also provide competitive analysis and sensitivity scenarios.",
        
        governance: "As the Pricing Team Lead, I'm responsible for producing the assigned bid sections and coordinating internal validations with our corporate teams. I ensure our inputs align with the overall bid strategy and the client's requirements, while keeping the SmartBid deliverables sheet current. Throughout the process, I actively identify pricing risks and opportunities to support informed decision making.",
        
        redFlags: "STOP IMMEDIATELY if: I identify key red flags including any drafts circulated without proper internal validation, signs of misalignment between technical and pricing assumptions, and subcontractor offers that are delivered late and could jeopardize timelines or compliance.",

        presetQuestions: [
            "How do you stay competitive while maintaining margins?",
            "What's the biggest pricing mistake you've seen?",
            "How do you handle scope changes in pricing?"
        ],
        
        personality: "detail-oriented, financially savvy, lives in Excel spreadsheets"
    },

    esgLead: {
        name: "Lea POISSON",
        role: "ESG GROUP LEADER",
        color: 0xC6D300, // Lime
        position: { x: -12, y: 0, z: 0 },
        
        mission: "Produce your assigned deliverables with the right quality and on time.",
        
        deliverables: "I provide ESG strategy, carbon reduction plan, social value commitments, diversity metrics, community engagement plan, governance framework, and compliance verification. Basically proof that we're not just talking the talk, but can actually walk the sustainable walk.",
        
        governance: "As the ESG Team Lead, I'm responsible for producing the assigned bid sections and coordinating internal validations with our corporate teams. I ensure our inputs align with the overall bid strategy and the client's requirements, while keeping the SmartBid deliverables sheet current. Throughout the process, I actively identify legal risks and opportunities to support informed decision making.",
        
        redFlags: "STOP IMMEDIATELY if: I identify key red flags including any drafts circulated without proper internal validation, signs of misalignment between technical and pricing assumptions, and subcontractor offers that are delivered late and could jeopardize timelines or compliance.",

        presetQuestions: [
            "How do you measure social value?",
            "What are the latest ESG requirements?",
            "How do you avoid greenwashing?"
        ],
        
        personality: "passionate, idealistic, brings reusable coffee cup everywhere"
    },

    financialLead: {
        name: "Phillip RESCOURIO",
        role: "FINANCIAL GROUP LEADER",
        color: 0x007C91, // Bright Blue
        position: { x: 0, y: 0, z: 0 },
        
        mission: "I ensure the bid is financially sound, properly structured, and won't bankrupt us if we win. I analyze cash flow, payment terms, financial risks, and make sure the numbers tell a story that both wins bids and keeps our CFO happy - a rare combination!",
        
        deliverables: "I deliver financial model, cash flow projections, payment terms analysis, working capital requirements, financial risk assessment, banking arrangements, and parent company guarantees. Think of it as the financial health checkup for the bid.",
        
        governance: "As the Financial Team Lead, I'm responsible for producing the assigned bid sections and coordinating internal validations with our corporate teams. I ensure our inputs align with the overall bid strategy and the client's requirements, while keeping the SmartBid deliverables sheet current. Throughout the process, I actively identify financial risks and opportunities to support informed decision making.",

        redFlags: "Sound the alarm if: cash flow goes negative, payment terms exceed our financing capacity, client's financial stability is questionable, currency exchange risks are unhedged, or we're being asked for unlimited guarantees. A bad payment structure can kill a profitable project.",
        
        presetQuestions: [
            "What are the biggest financial risks?",
            "How do you structure payment terms?",
            "What if the client's credit is bad?"
        ],
        
        personality: "analytical, cautious, speaks fluently in financial ratios"
    },

    partner1: {
        name: "Virginie MAUSSET",
        role: "CONSORTIUM PARTNER",
        color: 0xF4A300, // Orange-Gold
        position: { x: 12, y: 0, z: 0 },
        
        mission: "We bring specialized engineering expertise that complements EGIS capabilities. Our mission is to deliver our scope on time, on budget, and to spec - while playing nicely with other consortium members. It's like a group project in school, but with millions of dollars at stake!",
        
        deliverables: "We provide specialized engineering designs, technical calculations, methodology for our scope, resource commitments, quality plans, and proof of qualifications. Also the always-fun insurance certificates and corporate documentation. Lots of documentation.",
        
        governance: "Must adhere to consortium agreement terms - no going rogue. All technical deliverables need EGIS review before submission. Monthly progress reports mandatory. Interface management with other partners is critical - dropping the ball affects everyone.",
        
        redFlags: "Escalate immediately if: scope creep affects our deliverables, EGIS changes direction without consulting us, other partners aren't delivering dependencies, or client adds requirements without budget adjustment. Communication breakdown in consortiums is how projects die.",
        
        presetQuestions: [
            "How do you coordinate with other partners?",
            "What happens if there are conflicts?",
            "What's your specialized expertise?"
        ],
        
        personality: "collaborative, specialized, speaks with a slight German accent"
    },

    legalAdvisor: {
        name: "Richard LENGRAND ",
        role: "EXTERNAL LEGAL ADVISOR",
        color: 0x007C91, // Teal
        position: { x: -12, y: 0, z: 6 },

        mission: "I provide specialized legal expertise on complex contract matters, international law, dispute resolution, and regulatory compliance. When in-house legal needs backup or faces unprecedented situations, they call me. I'm like the legal special forces.",

        deliverables: "I deliver legal opinions on complex matters, contract negotiation support, dispute resolution strategy, regulatory compliance advice, and risk mitigation recommendations. Also provide precedent analysis and jurisdictional guidance for international bids.",

        governance: "Engage early on complex matters legal issues compound over time. All advice must be in writing. Work strictly under NDA and mandate, follow internal templates, and communicate only through the Bid Director.",

        redFlags: "Drafts issued without internal validation, misalignment between technical and pricing assumptions, subcontractor offers delivered late, or any situation involving cross-border legal exposure or regulatory uncertainty.",

        presetQuestions: [
            "When should we call external legal counsel?",
            "How do international laws affect bids?",
            "What are the most expensive legal mistakes?"
        ],
        personality: "distinguished, formal, British accent, uses Latin legal terms" 
    },

    regionalTeam: {
        name: "Regional / Affiliate Team",
        role: "LOCAL PARTNER / REGIONAL EXPERT",
        color: 0x000000, // Black
        position: { x: 0, y: 0, z: 6 },

        mission: "My mission is to provide accurate local context, regulatory insights, operational constraints, and cost structures so the bid reflects real conditions on the ground and avoids avoidable risks.",

        deliverables: "Country insight summaries, local cost benchmarks, operational constraints, regulatory notes, environmental considerations, and region‑specific risk identification sheets. When acting as local point of contact, I also provide tender clarifications.",

        governance: "All local data must be verified, sourced, and aligned with corporate standards. Regulatory inputs must be validated against official local requirements. Cost assumptions must reflect real market conditions. Coordination with the Bid Director ensures consistency and prevents conflicting information.",

        redFlags: "Incomplete or unverified local data, unclear or unvalidated regulations, unrealistic cost assumptions, missing environmental or ESG constraints, or any local insight that contradicts known market conditions without justification.",

        presetQuestions: [
            "Are all local regulations verified and up to date?",
            "Have cost benchmarks been validated against current market conditions?",
            "What region‑specific risks must be highlighted for this bid?",
            "Are there environmental or ESG constraints that impact the scope or methodology?"
        ],

        personality: "pragmatic, detail‑driven, transparent about local realities, proactive in flagging risks"
    },

    inHouseLegal: {
        name: "Camille GASPERI",
        role: "IN-HOUSE LEGAL COUNSEL",
        color: 0x4A5A67, // Gray
        position: { x: 0, y: 0, z: 6 },

        mission: "My mission is to secure the transaction and protect Egis by ensuring that all legal foundations of the bid are sound, compliant, and aligned with corporate governance requirements.",

        deliverables: "NDA drafts, LRN approvals, contract comments, and legal risk notes that clearly outline obligations, exposures, and required mitigations.",

        governance: "All work is performed under NDA and internal mandate. Standard templates must be used. Legal validation is required for NDAs, LRNs, contract markups, and governance documents. All communication flows through the Bid Director to maintain alignment and confidentiality.",

        redFlags: "Drafts issued without legal validation, unclear KYC risk levels, unapproved governance documents, or contract markups that deviate from standard protections without justification.",

        presetQuestions: [
            "Has Legal validated the latest contract markup?",
            "What is the KYC risk level for this client?",
            "Is the LRN ready for approval?"
        ],

        personality: "practical, accessible, explains legal concepts in plain English"
    }

};

// ⚠️ END CHARACTER INFORMATION
// ⚠️ ========================================