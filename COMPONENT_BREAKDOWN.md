## Component Breakdown

This website is structured as a Haqdarshak-style single-page application page, adapted for Prakhar Bhargava's resume story.

### 1. Sticky Header
- **Purpose:** quick navigation across the full story
- **Files:** `index.html`, `styles.css`, `script.js`
- **Editable in:** `siteContent.nav`

### 2. Hero Section
- **Haqdarshak equivalent:** homepage headline + top CTA area
- **Purpose:** explain who Prakhar is, why he fits, and why Haqdarshak
- **Editable in:** `siteContent.hero`
- **Contains:**
  - tagline
  - main heading
  - subheading
  - CTA buttons
  - side thesis panel

### 3. Who I Am
- **Haqdarshak equivalent:** top narrative/about section
- **Purpose:** explain identity, motivations, and application thesis
- **Editable in:** `siteContent.identity`

### 4. What I Bring
- **Haqdarshak equivalent:** "Our Approach" / capability grid
- **Purpose:** map resume strengths to product, strategy, program, and governance needs
- **Editable in:** `siteContent.capabilities`

### 5. Proof of Execution
- **Haqdarshak equivalent:** impact stats section
- **Purpose:** show quantified achievements from resume in visual proof blocks
- **Editable in:** `siteContent.impact`

### 6. What I Will Focus On
- **Haqdarshak equivalent:** solutions / platform capability section
- **Purpose:** describe what Prakhar would do after joining
- **Editable in:** `siteContent.focus`

### 7. Metrics I Would Watch
- **Haqdarshak equivalent:** operating and systems lens behind impact
- **Purpose:** show how performance, inclusion, and execution would be measured
- **Editable in:** `siteContent.metrics`

### 8. 3 / 6 / 9 Month Plan
- **Haqdarshak equivalent:** future vision / execution roadmap
- **Purpose:** explain onboarding priorities and scaling approach
- **Editable in:** `siteContent.roadmap`

### 9. Final Closing Thought
- **Haqdarshak equivalent:** closing CTA / mission reinforcement
- **Purpose:** summarize why Prakhar should be hired and what success would look like
- **Editable in:** `siteContent.closing`

## Best way to rewrite the website

If you want to change the writing later, only edit the `siteContent` object at the top of `script.js`.

That lets you keep the same layout and UI while replacing:
- wording
- metrics
- bullet points
- roadmap items
- closing thoughts
