# Task Prompt — Generate a Situation + Rubric + Wireframe Spec

Use the following **input** and generate these **outputs**:

## Inputs
- mode: SPEAK | THINK
- level: 1–10
- archetype: Explain | Ask | Problem | Decide | Pressure
- persona: Silent Thinker | Anxious Performer | Undertrained Native | Restarting Adult
- difficulty: easy | medium | hard
- language: English | Bilingual

## Output format (exact)
Return a JSON object with:
1) `situation` (must match `schema.json`)
2) `rubric` with keys: `strength`, `improvement`
3) `wireframes` array with 5 items:
   - Home
   - Situation
   - Session
   - Feedback
   - Progress

Each wireframe item includes:
- `name`
- `elements` (array of strings describing required UI elements)
- `notes` (short, calm UX tone guidance)

## Quality rules
- Keep situations realistic and age-agnostic.
- Avoid academic phrasing.
- Speak in plain English.
- Variants A/B/C should be the same situation with easier/harder framing.
- Feedback must be non-judgmental and actionable.
