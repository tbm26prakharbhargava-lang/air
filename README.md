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
