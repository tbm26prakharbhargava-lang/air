PROFILE = {
    "name": "Prakhar Bhargava",
    "email": "tbm26prakhar.bhargava@mastersunion.org",
    "phone": "+91-6263946354",
    "linkedin": "https://linkedin.com/in/prakharbhargava",
    "current_program": "PGP in Technology & Business Management, Masters' Union",
    "undergraduate": "B.Tech Mechanical Engineering, NIT Trichy, 8.2 GPA",
    "total_experience_years": 2.5,
    "financial_context": {
        "education_loan_lakh": 30,
        "hard_minimum_lpa": 20,
        "acceptable_minimum_lpa": 25,
        "target_lpa": 30,
        "dream_lpa": 35,
    },
    "target_roles": [
        {"role": "Founders Office / Chief of Staff / EIR", "priority": 1, "score": 100},
        {"role": "Strategy & Operations", "priority": 2, "score": 90},
        {"role": "Growth PM / Growth Manager", "priority": 3, "score": 85},
        {"role": "Product Manager", "priority": 4, "score": 80},
        {"role": "AI Product Manager", "priority": 4, "score": 80},
        {"role": "VC Associate / Strategy Consulting", "priority": 5, "score": 60},
    ],
    "target_locations": {
        "Remote": 100,
        "Gurgaon": 95,
        "Delhi": 95,
        "Delhi NCR": 95,
        "Mumbai": 85,
        "Bangalore": 80,
        "Bengaluru": 80,
        "Pune": 70,
        "Hyderabad": 60,
        "India": 70,
    },
    "hard_skills": [
        "Python",
        "SQL",
        "Machine Learning",
        "AI/Automation",
        "Data Visualization",
        "Power BI",
        "Figma",
        "Langflow",
        "Google Ads",
        "SEO/SEM",
        "Excel",
        "Logistic Regression",
        "Random Forest",
        "KNN",
        "MATLAB",
        "Pinecone",
        "Analytics",
        "CRM",
    ],
    "business_skills": [
        "Product Management",
        "Market Research",
        "Stakeholder Management",
        "Project Management",
        "Structured Communication",
        "Wireframing/Design",
        "Sentiment Analysis",
        "Campaign Strategy",
        "GTM Strategy",
        "Problem Solving",
        "Cross-functional Leadership",
        "Team Leadership",
        "Operations",
        "Strategy",
        "Investor Relations",
        "Client Management",
        "Data Analysis",
        "Financial Analysis",
    ],
    "domain_experience": [
        "Political consulting",
        "Governance",
        "Election strategy",
        "E-commerce operations",
        "CSR/nonprofit",
        "AgriTech analytics",
        "EdTech",
    ],
    "key_achievements": [
        "Built election prediction models that supported 29/29 seats in MP",
        "Led 12-member team for 6 parliamentary constituencies",
        "Secured flood relief for 2 lakh families through policy recommendations",
        "Improved warehouse efficiency by 70% at Swiggy",
        "Founded PM Club at NIT Trichy",
        "Won SDA Bocconi hackathon building a voice-agentic bot",
        "Delivered 160+ candidate recommendations with 70% adoption",
    ],
    "scoring_weights": {
        "zero_to_one": 0.30,
        "impact_learning": 0.25,
        "company_stage": 0.20,
        "compensation": 0.15,
        "profile_fit": 0.10,
    },
    "resume_templates": {
        "founders_office": {
            "headline": "Systems Builder | 0-to-1 Operator | High-stakes execution to startup scaling",
            "lead_with": [
                "Election campaign system building across states",
                "CM-level stakeholder management",
                "12-person team leadership",
                "Dashboard adoption in high-pressure environments",
            ],
            "positioning": "Give me an undefined problem and a team. I will build the system that solves it.",
        },
        "product": {
            "headline": "Product Builder | Data-driven, user-focused, fast execution",
            "lead_with": [
                "Swiggy APM: warehouse efficiency +70%",
                "GRoot.AI: user interviews to MVP design",
                "PM Club founder at NIT Trichy",
            ],
            "positioning": "I ship products by starting with users and measurable outcomes.",
        },
        "ai_builder": {
            "headline": "AI Product Builder | Hackathon winner | Building with AI systems",
            "lead_with": [
                "Voice-agentic bot ranked 1/724",
                "GRoot.AI stack: STT + GPT + Pinecone + n8n",
                "Hands-on learning in AI tooling and automation",
            ],
            "positioning": "I build with AI, not just about AI.",
        },
        "strategy": {
            "headline": "Strategy & Execution | Structured thinking to measurable outcomes",
            "lead_with": [
                "Prediction dashboards supporting election wins",
                "160+ strategic recommendations with 70% adoption",
                "Policy note to real on-ground relief delivery",
            ],
            "positioning": "I do not just recommend strategy. I execute it and measure the outcome.",
        },
    },
}


SCORING_NOTE = """SCORING METHODOLOGY — Prakhar Bhargava's Job Search Assistant
I evaluate every job opportunity across 5 weighted dimensions, calibrated to my specific career context: a 30-lakh MBA loan, a pivot from political consulting into product/strategy/founders-office roles, and a long-term ambition to build in the social impact space.

Dimension 1 — Zero-to-One Building Potential (30% weight): This is my heaviest weight because every major achievement in my career has come from building systems in undefined environments. I built election prediction models from scratch. I founded a PM club from nothing. I created governance dashboards that got adopted in high-stakes settings. Roles that only maintain existing processes score lower.

Dimension 2 — Impact Visibility & Learning Density (25% weight): I want to see the outcome of my work and learn how a company operates end-to-end. Cross-functional, founder-facing, ownership-heavy roles score highest. Siloed execution roles score low.

Dimension 3 — Company Stage & Trajectory (20% weight): Growth-stage startups score highest because they offer the right balance of chaos and structure. Too early and I risk doing everything without leverage; too late and the most interesting problems may already be solved.

Dimension 4 — Compensation & ROI (15% weight): With a 30-lakh loan, I need 25-30 LPA minimum to make the financial math work, with 30-35 LPA as the target zone. Below 20 LPA is effectively a hard filter unless the role is extraordinary.

Dimension 5 — Profile-Role Fit Probability (10% weight): This is an honest assessment of how my unusual background maps to the job. Founders office, strategy, and operations roles value my cross-domain execution history more than narrow, domain-pure PM jobs with strict pedigree requirements.

Two bonus modifiers: +5 for AI-focused companies or roles and +0 to +5 for freshness, because early application advantage matters.

What I excluded and why: work-life balance as a direct scoring dimension, company brand name as a standalone factor, and narrow industry preference. At this stage, role quality, learning density, and ROI matter more."""


SCORING_PRESETS = {
    "default": {
        "name": "Prakhar's Default",
        "description": "Optimized for founders office and 0-to-1 roles at growth startups.",
        "weights": {
            "zero_to_one": 0.30,
            "impact_learning": 0.25,
            "company_stage": 0.20,
            "compensation": 0.15,
            "profile_fit": 0.10,
        },
    },
    "money_first": {
        "name": "Loan Payoff Mode",
        "description": "Prioritize compensation to service the MBA loan aggressively.",
        "weights": {
            "zero_to_one": 0.15,
            "impact_learning": 0.15,
            "company_stage": 0.15,
            "compensation": 0.40,
            "profile_fit": 0.15,
        },
    },
    "learning_mode": {
        "name": "Maximum Learning",
        "description": "Favor cross-functional exposure and end-to-end learning density.",
        "weights": {
            "zero_to_one": 0.25,
            "impact_learning": 0.40,
            "company_stage": 0.15,
            "compensation": 0.10,
            "profile_fit": 0.10,
        },
    },
    "safe_bet": {
        "name": "Safe Bet",
        "description": "Prioritize roles where the current profile is an obvious fit.",
        "weights": {
            "zero_to_one": 0.15,
            "impact_learning": 0.15,
            "company_stage": 0.25,
            "compensation": 0.20,
            "profile_fit": 0.25,
        },
    },
    "ai_pivot": {
        "name": "AI Career Pivot",
        "description": "Lean into AI-native roles and companies.",
        "weights": {
            "zero_to_one": 0.25,
            "impact_learning": 0.20,
            "company_stage": 0.25,
            "compensation": 0.15,
            "profile_fit": 0.15,
        },
    },
}


SEARCH_CONFIG = {
    "naukri": {
        "priority": 1,
        "max_per_query": 20,
        "queries": [
            {"keywords": "founders office", "location": "Gurgaon", "experience": "0-4"},
            {"keywords": "chief of staff startup", "location": "Mumbai", "experience": "0-4"},
            {"keywords": "product manager", "location": "Bangalore", "experience": "0-3"},
            {"keywords": "strategy operations startup", "location": "Delhi NCR", "experience": "1-4"},
            {"keywords": "growth manager", "location": "Bangalore", "experience": "0-4"},
            {"keywords": "AI product manager", "location": "Bangalore", "experience": "0-3"},
        ],
    },
    "indeed": {
        "priority": 2,
        "max_per_query": 15,
        "queries": [
            {"keywords": "founders office", "location": "India"},
            {"keywords": "chief of staff", "location": "India"},
            {"keywords": "product manager startup", "location": "Bangalore"},
            {"keywords": "strategy associate", "location": "Mumbai"},
            {"keywords": "growth manager", "location": "India"},
        ],
    },
    "linkedin": {
        "priority": 2,
        "max_per_query": 15,
        "queries": [
            {"keywords": "founders office", "location": "India"},
            {"keywords": "chief of staff", "location": "India"},
            {"keywords": "strategy operations", "location": "India"},
            {"keywords": "product manager", "location": "India"},
            {"keywords": "AI product manager", "location": "India"},
        ],
    },
}


SALARY_BENCHMARKS = {
    "founders_office": {"p25": 7.5, "median": 16, "p75": 27, "p90": 37.8},
    "strategy": {"p25": 12, "median": 20, "p75": 30, "p90": 40},
    "product": {"p25": 13.3, "median": 22, "p75": 31, "p90": 40},
    "ai_product": {"p25": 19.4, "median": 28, "p75": 36.8, "p90": 50},
    "growth": {"p25": 12, "median": 18, "p75": 28, "p90": 38},
    "consulting": {"p25": 10, "median": 15, "p75": 25, "p90": 35},
    "vc": {"p25": 10, "median": 15, "p75": 25, "p90": 35},
}
