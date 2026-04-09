# Policy Research RAG Agent Design

## 1. Objective

Design an AI policy intelligence engine for Indian governance that can:

- ingest evidence from government, research, consulting, media, and field sources
- retrieve the most relevant material for a policy question
- generate publication-ready policy briefs with explicit citations and confidence labels
- produce decision support outputs beyond narrative briefs, including budget diagnostics, capital allocation views, and implementation risk summaries

The intended audience includes senior public officials, legislative researchers, philanthropic funders, and strategy teams operating at a Government-of-India or state-government interface.

## 2. Problem framing

Most policy analysis workflows fail in one of four ways:

1. **Weak evidence weighting**: government orders, parliamentary committee reports, op-eds, and field anecdotes are treated as if they have equal evidentiary value.
2. **Headline bias**: budget and scheme commentary focuses on Budget Estimate to Budget Estimate movement while ignoring revised estimates, actual utilization, and implementation frictions.
3. **Fragmented inputs**: quantitative data, scheme design, stakeholder sentiment, and field intelligence are rarely synthesized in one operating view.
4. **Unclear epistemic status**: facts, inferred implications, and recommendations are often mixed together without signaling confidence or source quality.

The agent should solve for those gaps first.

## 3. System goals

### Primary goals

- Generate policy briefs that read as if prepared for senior officials.
- Ground all factual claims in retrieved evidence.
- Separate verified facts from judgment and recommendation.
- Surface implementation bottlenecks, state variation, and political economy.
- Translate narrative analysis into action options, cost implications, and capital allocation signals.

### Non-goals for the first version

- Full autonomous publishing
- Unreviewed legal interpretation in contested constitutional matters
- Real-time web crawling without source allow-lists and validation controls

## 4. Core outputs

The system should support at least four output modes.

### A. Executive policy brief

A publication-ready note with:

- one-line verdict
- baseline comparison table
- scheme or issue structure
- stakeholder map
- implementation assessment
- fiscal view
- prioritized recommendations
- source register

### B. Budget diagnostics

A table-driven output that compares:

- previous Budget Estimates
- Revised Estimates
- actual expenditure or utilization where available
- current Budget Estimate
- percentage changes across BE-to-BE and Actual-to-BE lenses

### C. Capital allocation memo

A decision note for funders or strategy teams that identifies:

- where public spending is already effective
- where implementation absorption is weak
- where philanthropic or catalytic capital can de-risk public delivery
- where additional money should not be placed until execution constraints are fixed

### D. Structured extraction payload

A machine-readable JSON object for downstream dashboards, PPT generation, CRM systems, or analytical notebooks.

## 5. Evidence hierarchy

The retrieval layer must attach a source tier to every chunk.

| Tier | Source type | Examples | Use in final brief |
| --- | --- | --- | --- |
| Tier 1 | Official primary sources | Union Budget docs, ministry guidelines, Cabinet decisions, PIB releases, parliamentary questions, CAG, NFHS, NSS, RBI, state budget docs | Can support high-confidence factual claims |
| Tier 2 | High-quality institutional research | Peer-reviewed work, multilateral reports, PRS, NITI papers, standing committee reports, top academic centers | Strong support for analysis and triangulated facts |
| Tier 3 | Reputable consulting and think-tank material | Dalberg, BCG, McKinsey, J-PAL summaries, IDinsight, accountability initiatives | Useful for implementation design and benchmarking |
| Tier 4 | Credible media and expert commentary | The Hindu, Indian Express, Scroll, Mint, sector journals | Contextual and narrative support only |
| Tier 5 | Field intelligence and anecdotal reports | ASHA worker interviews, Anganwadi observations, call notes, district partner reports | Valuable for ground-truthing, but should remain explicitly labeled unless corroborated |

### Source-weighting rule

- A claim should be labeled **HIGH CONFIDENCE** only when grounded primarily in Tier 1 material, or in multiple independent sources including at least one Tier 1 or Tier 2 source.
- A claim should be labeled **MEDIUM CONFIDENCE** when supported by strong Tier 2 or convergent Tier 3 evidence.
- A claim should be labeled **LOW CONFIDENCE** when based on sparse media reporting, field inputs, or inference.

## 6. Confidence model

Confidence should be generated from a transparent scoring rule rather than intuition alone.

Suggested dimensions:

- source quality
- source recency
- cross-source agreement
- quantitative specificity
- implementation observability

### Example scoring rubric

| Score | Label | Interpretation |
| --- | --- | --- |
| 85-100 | High confidence | Directly evidenced and well-triangulated |
| 60-84 | Medium confidence | Reasonable support, but some uncertainty remains |
| 0-59 | Low confidence | Partial evidence or meaningful data gaps |

The system may store a numeric score internally, but should render a human-readable label in final outputs.

## 7. Field intelligence treatment

Frontline signals from ASHA and Anganwadi workers are strategically important because they reveal operational reality earlier than formal reporting. They should be captured, but never overstated.

Recommended handling:

1. Ingest field inputs as a separate source class with location, date, collector, and issue tags.
2. Use them to identify candidate bottlenecks, not to state national-level facts directly.
3. Promote a field claim from observation to analysis only if corroborated by:
   - state or district administrative data
   - audit or evaluation evidence
   - consistent repetition across locations
4. Preserve minority signals in an annex or risk section even when not yet validated.

## 8. RAG pipeline architecture

### Stage 1: Ingestion

Inputs should come from:

- official government portals
- parliamentary documents and answers
- budget and expenditure tables
- research PDFs and reports
- curated media
- field interview forms or partner uploads

For live web capture, use OpenClaw as the browsing and collection layer rather than scraping ad hoc with brittle one-off scripts. This is especially useful for:

- ministry portals with dynamic navigation
- PDF-heavy sites that require interaction before download
- parliamentary and state websites with unstable markup
- evidence collection workflows that need screenshots or page snapshots for auditability

Each source record should store:

- title
- publisher
- publication date
- jurisdiction
- ministry or department
- sector
- geography
- source tier
- URL or reference

### Stage 2: Normalization

Convert heterogeneous inputs into a common document structure:

- raw text
- metadata
- tables detected
- extracted entities
- citation anchor

Budget tables and scheme tables should receive special treatment so numeric comparisons remain intact.

A useful intermediate contract is a `source_packet`, which stores the normalized result of a browsed page before chunking. This makes OpenClaw captures auditable and easier to reprocess without revisiting the web source.

### Stage 3: Chunking

Chunk by semantic section rather than fixed tokens when possible:

- executive summary
- allocation table
- implementation findings
- evaluation results
- scheme guidelines

Attach metadata filters so retrieval can prioritize:

- ministry
- state
- time period
- source tier
- budget year

### Stage 4: Retrieval

Use hybrid retrieval:

- dense retrieval for semantic relevance
- sparse retrieval for scheme names, ministries, and numeric table headers
- metadata filtering for budget year, geography, and source tier

Recommended retrieval policy:

- retrieve a core set of Tier 1 evidence first
- then add Tier 2 and Tier 3 context
- only use Tier 4 or Tier 5 material if it adds narrative, sentiment, or implementation nuance

### Stage 5: Synthesis

The generation layer should produce intermediate reasoning blocks, not just the final prose:

- evidence table
- contradiction table
- missing-data table
- recommendation shortlist

This makes outputs easier to audit and later fine-tune.

### Stage 6: Quality control

Before release, the system should check:

- every factual claim has a citation
- numerical values match retrieved evidence
- tables use consistent units
- analysis is clearly marked as analysis
- recommendations are tied to diagnosed bottlenecks

## 9. Prompting strategy

The cleanest setup is a multi-prompt stack rather than a single monolithic prompt.

### Prompt A: Research analyst system prompt

Responsible for:

- framing the problem
- comparing evidence
- drafting the brief
- labeling facts versus analysis

### Prompt B: Structured extractor

Responsible for:

- producing a schema-valid JSON payload
- capturing stakeholders, fiscal data, bottlenecks, and recommendations

### Prompt C: Presentation packager

Optional downstream prompt that turns the structured brief into:

- notebook-style slides
- leadership memos
- briefing notes
- question-answer prep for meetings

## 10. Fine-tuning boundary

Fine-tuning should capture style and decomposition discipline, not factual content.

Good fine-tuning targets:

- brief structure
- tone and institutional voice
- confidence labeling style
- recommendation formatting
- source-citation conventions

Bad fine-tuning targets:

- dynamic fiscal values
- current implementation status
- fast-changing political narratives
- time-sensitive media interpretation

Those should stay in RAG.

## 11. Recommended brief structure

Below is the target shape for a senior policy brief.

1. **One-line verdict**
2. **Context and policy objective**
3. **Baseline comparison**
4. **Stakeholder and political economy map**
5. **Implementation reality**
6. **Fiscal and capital allocation view**
7. **Scenario or risk outlook**
8. **Prioritized recommendations**
9. **Sources and confidence notes**

### Example citation style

- `[FACT - Union Budget Expenditure Profile 2026-27 | indiabudget.gov.in]`
- `[ANALYSIS - HIGH CONFIDENCE]`
- `[FIELD SIGNAL - LOW CONFIDENCE | ASHA worker interviews, Sitapur district, Jan 2026]`

## 12. Capital allocation layer

To support funders or public-finance strategy teams, the brief should classify lines of action into one of four buckets:

| Bucket | Meaning | Decision rule |
| --- | --- | --- |
| Scale public funding | Strong utilization and demonstrable impact | Increase or protect allocation |
| Catalytic co-funding | Public intent exists but execution needs technical support | Use external capital to de-risk delivery |
| Targeted reform before spend | Allocation exists but structural bottlenecks dominate | Focus on governance, procurement, staffing, or incentives first |
| Avoid near-term expansion | Evidence weak or state capacity too low | Defer additional capital until fundamentals improve |

This is especially useful for health, nutrition, education, livelihoods, and climate adaptation questions.

## 13. Data model recommendation

The core record should include:

- `policy_name`
- `policy_question`
- `sector`
- `ministry_owner`
- `time_horizon`
- `geography`
- `source_packets`
- `fiscal_snapshot`
- `implementation_snapshot`
- `sentiment_snapshot`
- `recommendations`
- `confidence_score`

Separate tables should exist for:

- documents
- citations
- extracted fiscal data
- stakeholder records
- field observations

## 14. Evaluation framework

The first evaluation suite should test:

### Retrieval quality

- Does the system retrieve Tier 1 material for scheme and budget questions?
- Does it avoid over-reliance on media when official documents exist?

### Factual accuracy

- Are budget numbers copied correctly?
- Are scheme design details matched to the correct year and version?

### Analytical usefulness

- Do recommendations follow from diagnosed bottlenecks?
- Is there a clear distinction between what is known and what is inferred?

### Communication quality

- Can a senior reader identify the decision implication in under a minute?
- Are tables legible and decision-oriented?

## 15. MVP repository contents

A practical first repository state should include:

- prompt templates
- JSON schemas
- example policy briefs
- evidence and confidence conventions
- a thin orchestration layer later, once the output contract is stable

That is the approach used in this initial commit.
