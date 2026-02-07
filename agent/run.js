#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Usage: node agent/run.js <input.json>");
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, "utf8");
const input = JSON.parse(raw);

const now = new Date().toISOString().replace(/[:.]/g, "-");
const situationId = `${input.mode.toLowerCase()}-${input.archetype.toLowerCase()}-${now}`;

const situation = {
  id: situationId,
  mode: input.mode,
  level: input.level,
  title: `${input.archetype} in real life`,
  context: "You are in a realistic, everyday situation.",
  objective: "Express your thinking clearly and calmly.",
  instructions: "Respond in 2–4 sentences. Keep it simple and structured.",
  constraints: ["No jargon", "Keep it concise"],
  hints: ["Start with the main idea", "Give one supporting detail"],
  rubric: {
    strength: "Your idea came across clearly.",
    improvement: "Try separating your response into two parts."
  },
  variants: [
    {
      id: `${situationId}-A`,
      label: "A",
      prompt: "Give a simple response with one clear point.",
      difficulty_hint: "easier framing"
    },
    {
      id: `${situationId}-B`,
      label: "B",
      prompt: "Give a structured response with a main point and a reason.",
      difficulty_hint: "baseline framing"
    },
    {
      id: `${situationId}-C`,
      label: "C",
      prompt: "Give a concise response with a main point and a tradeoff.",
      difficulty_hint: "harder framing"
    }
  ],
  tags: [input.mode, input.archetype, input.persona, input.difficulty]
};

const output = {
  situation,
  rubric: situation.rubric,
  wireframes: [
    {
      name: "Home",
      elements: ["Avatar", "Mode buttons", "Streak indicator"],
      notes: "Calm greeting and a single question."
    },
    {
      name: "Situation",
      elements: ["Situation title", "Context card", "Start button"],
      notes: "One primary action. No clutter."
    },
    {
      name: "Session",
      elements: ["Prompt", "Mic toggle or input", "Optional timer"],
      notes: "Encourage speaking/thinking without pressure."
    },
    {
      name: "Feedback",
      elements: ["One strength", "One improvement", "Retry + Continue"],
      notes: "Supportive, short, actionable."
    },
    {
      name: "Progress",
      elements: ["Level bar", "Dot indicators", "Next session CTA"],
      notes: "Progress is visible but not stressful."
    }
  ]
};

const outputDir = path.join(process.cwd(), "agent", "out");
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, `output-${now}.json`);
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`Generated: ${outputPath}`);
