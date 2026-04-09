# OpenClaw Integration for the Policy Research Agent

## 1. Purpose

OpenClaw should be used as the live browsing and source-capture layer for this policy research system.

Its role is not to replace retrieval, ranking, or synthesis. Its role is to:

- open and inspect government, research, and media pages
- interact with dynamic websites that simple HTTP scraping often misses
- capture text, tables, screenshots, and downloadable documents
- convert those captures into structured evidence packets that enter the RAG pipeline

This is the cleanest place to add live web capability without polluting the analysis prompt itself.

## 2. Recommended architecture

The stack should operate in this order:

1. **User question**
2. **Source plan**
   - identify ministries, schemes, budget years, states, and likely source domains
3. **OpenClaw browsing**
   - navigate allow-listed domains
   - capture page text, tables, screenshots, and PDF links
4. **Source packet normalization**
   - store metadata, extracted facts, and source tier
5. **RAG indexing**
   - chunk source packets and attached documents
6. **Policy synthesis**
   - generate brief, extraction JSON, fiscal tables, and recommendations
7. **Quality control**
   - citation checks, numeric checks, confidence scoring

## 3. Why OpenClaw fits this use case

This policy workflow depends on sources that often behave badly for generic crawlers:

- Union and State government portals
- PIB pages
- budget tables
- parliamentary pages
- research sites with JavaScript rendering
- sites that require page interaction before tables become visible

OpenClaw is useful because it gives the agent a managed browser with:

- deterministic tab control
- snapshots and screenshots
- interactive browsing for dynamic pages
- an isolated browser profile separate from personal usage

## 4. Boundaries

OpenClaw should be used for **collection and verification**, not for unsupervised opinion generation.

Recommended boundary:

- OpenClaw gathers evidence
- the normalization layer converts it into `source_packet` records
- the policy analyst prompt performs synthesis only from retrieved evidence

Do not let the browsing layer silently write final policy claims into the brief.

## 5. OpenClaw configuration approach

Use a dedicated managed browser profile called `openclaw` for default research. Keep the browser plugin enabled and set a workspace that points to this repository or a sibling ingestion workspace.

Suggested config priorities:

1. `browser.enabled = true`
2. `browser.defaultProfile = "openclaw"`
3. keep the bundled `browser` plugin available
4. use restrictive allow-lists for domains at the application layer
5. avoid storing long-lived credentials in committed config

See `openclaw/openclaw.example.json5` for a starter configuration.

## 6. Research flow inside OpenClaw

For each policy question:

1. build a source plan
2. open the most likely Tier 1 sources first
3. capture snapshots and tables
4. only then collect Tier 2 to Tier 4 context
5. label any field intelligence or anecdotal material separately

### Example source order for Indian governance research

1. ministry websites and notifications
2. budget documents and expenditure profiles
3. parliamentary questions or committee reports
4. official dashboards or evaluation reports
5. high-quality institutional research
6. consulting or think-tank material
7. reputable media

## 7. Source packet contract

Every browsed page should be converted into a machine-readable source packet before it enters retrieval.

Minimum fields:

- page title
- canonical URL
- publisher
- publication date
- ministry or department
- sector
- geography
- source tier
- summary
- key claims
- numeric facts
- quotes or snippets
- capture timestamp

This repository includes `schemas/source_packet.schema.json` for that purpose.

## 8. Prompting pattern

Use a separate OpenClaw capture prompt rather than the final synthesis prompt.

Recommended prompt split:

- `prompts/openclaw_policy_source_capture.md`
  - transforms a live page into structured evidence
- `prompts/policy_research_analyst.md`
  - synthesizes retrieved packets into a brief
- `prompts/policy_json_extractor.md`
  - produces dashboard-ready structured outputs

This reduces prompt overload and makes the pipeline easier to fine-tune later.

## 9. Source quality and confidence

OpenClaw does not increase source quality by itself. A beautifully scraped weak source is still a weak source.

The capture layer must attach:

- `source_tier`
- `document_type`
- `jurisdiction`
- `capture_confidence`

This lets retrieval and synthesis prefer:

- Tier 1 for facts
- Tier 2 and Tier 3 for analysis and triangulation
- Tier 4 and Tier 5 only for context and narrative texture

## 10. Operational safeguards

### Allow-list strategy

Start with a narrow set of domains such as:

- `*.gov.in`
- `pib.gov.in`
- `prsindia.org`
- `rbi.org.in`
- trusted research institutions

### Storage strategy

Persist:

- raw page capture reference
- normalized source packet
- screenshot path when relevant
- downloaded PDF path when relevant

### Security strategy

- keep browser auth isolated from personal browser state
- use the managed `openclaw` profile by default
- avoid committing secrets or cookies

## 11. Example ingestion loop

1. user asks: "Assess PM-JAY expansion for seniors aged 70+"
2. agent assembles candidate source list:
   - PM-JAY official site
   - cabinet decision note or PIB release
   - health ministry releases
   - parliamentary or budget references
3. OpenClaw opens each source and captures:
   - summary text
   - benefit design details
   - eligibility language
   - fiscal references
4. each capture becomes a `source_packet`
5. packets are indexed
6. the analyst prompt generates:
   - one-line verdict
   - implementation view
   - stakeholder map
   - fiscal and capital-allocation note

## 12. MVP implementation recommendation

For the first build:

1. use OpenClaw only for source collection
2. normalize into source packets
3. index packets plus downloaded PDFs
4. generate briefs from retrieved packets
5. add more autonomous browsing only after citation quality is strong

That gives you a practical, auditable architecture that stays close to your policy-research objective.
