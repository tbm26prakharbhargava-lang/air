# Agent Starter Pack

This folder is the starting point for the **Situations Engine Agent**. It defines:
- What the agent does (scope and outputs).
- The input contract it expects.
- The JSON schema for generated situations.
- The prompts that power the agent.

## What this agent does (v0)
Given input about **mode**, **level**, and **archetype**, the agent generates:
1) A new `Situation` JSON object with A/B/C variants.  
2) A short feedback rubric (1 strength + 1 improvement).  
3) A wireframe spec list (screen names + required elements).  

## Inputs (required)
- `mode`: `SPEAK` | `THINK`
- `level`: integer 1–10
- `archetype`: `Explain` | `Ask` | `Problem` | `Decide` | `Pressure`
- `persona`: `Silent Thinker` | `Anxious Performer` | `Undertrained Native` | `Restarting Adult`
- `difficulty`: `easy` | `medium` | `hard`
- `language`: `English` | `Bilingual`

## Outputs
- `Situation` JSON (see `schema.json`)
- `Rubric` with `strength` and `improvement`
- `WireframeSpec` list

## Next steps
1. Implement the agent runner (CLI or web).  
2. Connect it to content storage (`/data/situations.json`).  
3. Add SVG wireframe rendering.  

## Quick start (local)
```bash
node agent/run.js agent/example-input.json
```
This will write a JSON file to `agent/out/`.

## Files
- `schema.json`: situation schema.
- `prompts/system.md`: system prompt (non-negotiables).
- `prompts/task.md`: task prompt (input/output formatting).
- `run.js`: local CLI runner (v0).
- `example-input.json`: sample inputs to exercise the runner.
- `example-output.json`: sample output format.
