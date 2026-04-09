# Policy Research Agent Foundation

This repository provides a starting point for a policy-research agent built as a retrieval-augmented generation (RAG) pipeline for Indian governance use cases.

The initial assets in this repo convert a raw prompt concept into reusable building blocks:

- a system prompt for a senior policy research analyst
- a JSON-only extraction prompt for structured policy records
- JSON schemas for policy briefs and extraction payloads
- a design document describing the operating model, evidence hierarchy, and workflow
- an OpenClaw browser-integration layer for live source capture

## Intended use

The target agent is designed to support senior decision-making across:

- policy briefs for Ministers, MPs, and senior officials
- budget and scheme analysis
- implementation diagnostics across states and districts
- financial modeling and capital allocation views
- field-signal ingestion from frontline workers such as ASHA and Anganwadi workers

## Repository structure

- `docs/design/policy-research-rag-agent.md` - architecture, source tiering, confidence model, workflow
- `docs/design/openclaw-integration.md` - how OpenClaw fits into live browsing and evidence capture
- `openclaw/openclaw.example.json5` - example OpenClaw configuration for browser-enabled research
- `prompts/policy_research_analyst.md` - production-style analyst prompt
- `prompts/policy_json_extractor.md` - structured extraction prompt
- `prompts/openclaw_policy_source_capture.md` - prompt for converting browsed pages into evidence packets
- `schemas/policy_brief.schema.json` - schema for structured brief generation
- `schemas/policy_extraction.schema.json` - schema for policy extraction payloads
- `schemas/source_packet.schema.json` - schema for scraped evidence entering the RAG store

## Design principles

1. Facts and analysis must be labeled separately.
2. Government and primary sources should dominate high-confidence claims.
3. Field intelligence is useful, but must be explicitly marked and corroborated before being upgraded.
4. Briefs should be publication-ready, table-driven, and decision-oriented.
5. Financial implications should be tied to real implementation capacity, not only headline allocations.

## Recommended next build steps

1. Stand up OpenClaw with the bundled browser tool and a dedicated `openclaw` research profile.
2. Use the source-packet prompt and schema to convert browsed pages into structured evidence records.
3. Add a chunking and retrieval layer with source-tier metadata.
4. Add a synthesis runner that fills the brief schema from retrieved evidence.
5. Add evaluation suites for citation accuracy, factual consistency, and recommendation quality.

## OpenClaw role in the stack

OpenClaw should sit at the ingestion edge of the system:

1. browse trusted government, parliamentary, research, and media sources
2. capture page text, tables, screenshots, and metadata
3. convert each page into a schema-valid source packet
4. send those packets into the RAG index for retrieval and downstream brief generation

This keeps fine-tuned style separate from live factual retrieval. The model learns how to think and write; OpenClaw helps it gather current evidence.

## Runnable MVP

This repository now includes a small Python MVP that runs without external dependencies.

### What the MVP does

- loads source packets from JSON files
- ranks them with a simple evidence-aware retrieval heuristic
- generates a structured policy brief JSON
- generates a structured extraction JSON
- renders a markdown version of the brief
- optionally captures a live web page into a source packet
- optionally uses OpenClaw for live capture if the CLI is installed

### Run the bundled demo

```bash
python3 -m policy_mvp.cli demo --output-dir outputs/demo
```

This uses the sample PM-JAY packets in `examples/pmjay-source-packets/` and writes:

- `outputs/demo/pmjay_brief.json`
- `outputs/demo/pmjay_brief.md`
- `outputs/demo/pmjay_extraction.json`

### Generate a brief from your own packet directory

```bash
python3 -m policy_mvp.cli brief \
  --policy-name "Pradhan Mantri Jan Arogya Yojana (PM-JAY)" \
  --policy-question "Assess the implementation implications of PM-JAY expansion for senior citizens." \
  --sources-dir examples/pmjay-source-packets \
  --output outputs/custom/brief.json \
  --markdown-output outputs/custom/brief.md
```

### Generate extraction JSON

```bash
python3 -m policy_mvp.cli extract \
  --policy-name "Pradhan Mantri Jan Arogya Yojana (PM-JAY)" \
  --policy-question "Assess the implementation implications of PM-JAY expansion for senior citizens." \
  --sources-dir examples/pmjay-source-packets \
  --output outputs/custom/extraction.json
```

### Capture a live page into a source packet

Without OpenClaw:

```bash
python3 -m policy_mvp.cli capture-url \
  --url "https://www.pib.gov.in/" \
  --publisher "Press Information Bureau" \
  --published-at "Unknown" \
  --source-tier 1 \
  --document-type government_release \
  --ministry-owner "Ministry of Health and Family Welfare" \
  --sector Health \
  --jurisdiction India \
  --output outputs/capture/pib_packet.json
```

With OpenClaw installed:

```bash
python3 -m policy_mvp.cli capture-url \
  --url "https://www.pib.gov.in/" \
  --publisher "Press Information Bureau" \
  --published-at "Unknown" \
  --source-tier 1 \
  --document-type government_release \
  --ministry-owner "Ministry of Health and Family Welfare" \
  --sector Health \
  --jurisdiction India \
  --use-openclaw \
  --output outputs/capture/pib_packet.json
```

Some government sites may block bare HTTP clients and return `403 Forbidden`. In those cases, use `--use-openclaw` so the capture runs through a managed browser instead of a simple fetch.

## MVP limitations

- Retrieval is lexical and heuristic, not embedding-based yet.
- Brief generation is template-driven, not LLM-backed yet.
- Live capture via OpenClaw is optional and assumes the `openclaw` CLI is installed and configured.
- Budget comparison quality depends on richer numeric source packets than the demo set currently includes.
