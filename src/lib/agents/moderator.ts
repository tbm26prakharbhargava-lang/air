import { z } from "zod";
import { seedCircles, seedEvents, seedUsers } from "@/lib/data/seed";
import { rankEventsForUser, rankPeopleForUser } from "@/lib/matching/engine";

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export type ModeratorReply = {
  summary: string;
  suggestedActions: string[];
  surveys: string[];
  searchQueries: string[];
  sourceHints: SearchResult[];
};

const moderatorRequestSchema = z.object({
  message: z.string().min(1),
  circleName: z.string().optional(),
  city: z.string().optional(),
  attendanceRate: z.number().min(0).max(1).optional(),
  recentConcerns: z.array(z.string()).optional(),
});

type ModeratorRequest = z.infer<typeof moderatorRequestSchema>;

const keywordToSearchMap: Record<string, string[]> = {
  badminton: ["badminton courts near Gurgaon", "badminton community Gurgaon"],
  running: ["running clubs Gurgaon", "best running tracks Gurgaon"],
  chess: ["chess clubs Gurgaon", "board game cafes Gurgaon"],
  creator: ["creator meetups Gurgaon", "photography walks Gurgaon"],
  product: ["product community Gurgaon", "tech meetups Gurgaon"],
};

function inferSearchQueries(message: string): string[] {
  const lowered = message.toLowerCase();
  const queries = new Set<string>();

  for (const [keyword, mappedQueries] of Object.entries(keywordToSearchMap)) {
    if (lowered.includes(keyword)) {
      mappedQueries.forEach((query) => queries.add(query));
    }
  }

  if (queries.size === 0) {
    queries.add("offline community activities Gurgaon");
  }

  return [...queries].slice(0, 3);
}

function inferSurveys(message: string): string[] {
  const lowered = message.toLowerCase();

  if (lowered.includes("attendance") || lowered.includes("show up")) {
    return [
      "What made it hardest to attend the last session: timing, location, energy, or group fit?",
      "Would you prefer this circle to meet on weekdays or weekends for the next two weeks?",
    ];
  }

  if (lowered.includes("new people") || lowered.includes("more members")) {
    return [
      "Would you like the next invite batch to prioritize skill match, schedule match, or profession match?",
      "How large should this circle stay for the next month: 6-8, 8-12, or 12+ members?",
    ];
  }

  return [
    "How did the last session feel overall: energizing, okay, or not a fit?",
    "What one thing would make this circle more worth returning to next week?",
  ];
}

function buildSourceHints(searchQueries: string[]): SearchResult[] {
  return searchQueries.map((query, index) => ({
    title: `Suggested web search ${index + 1}`,
    url: `search:${encodeURIComponent(query)}`,
    snippet:
      "Use live web search to validate local venues, communities, or event opportunities before the moderator recommends a change.",
  }));
}

export function runModeratorAgent(rawInput: ModeratorRequest): ModeratorReply {
  const input = moderatorRequestSchema.parse(rawInput);
  const activeUser = seedUsers[0];
  const relevantEvents = rankEventsForUser(activeUser, seedEvents, seedCircles).slice(0, 2);
  const topPeople = rankPeopleForUser(activeUser, seedUsers)
    .slice(0, 2)
    .map((person) => person.entity.name);
  const searchQueries = inferSearchQueries(input.message);
  const surveys = inferSurveys(input.message);
  const attendanceRate = input.attendanceRate ?? 0.78;
  const concerns = input.recentConcerns ?? [];

  const summaryParts = [
    input.circleName
      ? `Moderator review for ${input.circleName}.`
      : "Moderator review for the active circle.",
    `Likely next high-fit events are ${relevantEvents
      .map((event) => event.entity.title)
      .join(" and ")}.`,
    `The strongest nearby member fits right now are ${topPeople.join(" and ")}.`,
    `Current attendance signal is ${Math.round(attendanceRate * 100)}%.`,
    concerns.length > 0
      ? `Recent concerns include ${concerns.join(", ")}.`
      : "No major qualitative concerns were supplied in the latest pulse.",
    "If more external context is needed, the agent should trigger live web search before proposing new venues or local partner communities.",
  ];

  return {
    summary: summaryParts.join(" "),
    suggestedActions: [
      "Prompt members to confirm attendance 24 hours before the next recurring session.",
      "Offer one schedule adjustment option instead of an open-ended discussion.",
      "Surface one new high-fit member recommendation only if current attendance remains below target.",
    ],
    surveys,
    searchQueries,
    sourceHints: buildSourceHints(searchQueries),
  };
}
