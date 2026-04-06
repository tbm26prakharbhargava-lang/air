"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Compass,
  Layers3,
  LoaderCircle,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type { Circle, Recommendation, UserProfile } from "@/lib/matching/types";

type ModeratorReply = {
  summary: string;
  suggestedActions: string[];
  surveys: string[];
  searchQueries: string[];
  sourceHints: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
};

type AgentConsoleProps = {
  activeUser: UserProfile;
  circleRecommendations: Array<Recommendation<Circle> & { circle: Circle }>;
};

type ConversationMessage = {
  id: string;
  role: "user" | "agent";
  content: string;
};

const concernOptions = [
  "attendance dropping",
  "members want stronger fit",
  "timing friction",
  "need local venue ideas",
  "host fatigue",
];

const initialGoal =
  "Keep the circle active, improve attendance, and find the best next action.";

export function AgentConsole({
  activeUser,
  circleRecommendations,
}: AgentConsoleProps) {
  const [selectedCircleId, setSelectedCircleId] = useState(
    circleRecommendations[0]?.circle.id ?? "",
  );
  const [goal, setGoal] = useState(initialGoal);
  const [attendanceRate, setAttendanceRate] = useState(0.78);
  const [recentConcerns, setRecentConcerns] = useState<string[]>([
    "attendance dropping",
  ]);
  const [webContext, setWebContext] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>([
    {
      id: "seed-agent",
      role: "agent",
      content:
        "Moderator ready. Give me a governance goal and I will turn it into surveys, actions, and local research hints.",
    },
  ]);
  const [reply, setReply] = useState<ModeratorReply | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCircle =
    circleRecommendations.find((item) => item.circle.id === selectedCircleId)
      ?.circle ?? circleRecommendations[0]?.circle;

  useEffect(() => {
    if (!selectedCircleId && circleRecommendations[0]?.circle.id) {
      setSelectedCircleId(circleRecommendations[0].circle.id);
    }
  }, [circleRecommendations, selectedCircleId]);

  const workspaceStats = useMemo(
    () => [
      {
        label: "Attendance signal",
        value: `${Math.round(attendanceRate * 100)}%`,
      },
      {
        label: "Recent concerns",
        value: `${recentConcerns.length}`,
      },
      {
        label: "Conversation turns",
        value: `${conversation.length}`,
      },
    ],
    [attendanceRate, conversation.length, recentConcerns.length],
  );

  async function handleRunModerator() {
    if (!selectedCircle || !goal.trim()) {
      return;
    }

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: goal.trim(),
    };

    const nextConversation = [...conversation, userMessage];
    setConversation(nextConversation);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/moderator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          circleId: selectedCircle.id,
          circleName: selectedCircle.name,
          city: activeUser.location.city,
          goal: goal.trim(),
          conversation: nextConversation
            .filter((entry) => entry.role === "user")
            .slice(-4)
            .map((entry) => entry.content),
          attendanceRate,
          recentConcerns,
          webFindings: webContext
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Moderator request failed");
      }

      const data = (await response.json()) as ModeratorReply;
      setReply(data);
      setConversation((current) => [
        ...current,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          content: data.summary,
        },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reach moderator agent.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function toggleConcern(concern: string) {
    setRecentConcerns((current) =>
      current.includes(concern)
        ? current.filter((item) => item !== concern)
        : [...current, concern],
    );
  }

  function applyPrompt(text: string) {
    setGoal(text);
  }

  return (
    <section
      id="agent-console"
      className="workspace-grid workspace-panel workspace-accent rounded-[2rem] p-4 sm:p-5 lg:p-6"
    >
      <div className="grid gap-4 xl:grid-cols-[88px_minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <aside className="workspace-panel rounded-[1.75rem] p-3">
          <div className="flex h-full flex-row gap-2 xl:flex-col">
            <ToolTile icon={<Layers3 className="h-5 w-5" />} label="Context" active />
            <ToolTile icon={<MessageSquareText className="h-5 w-5" />} label="Dialogue" />
            <ToolTile icon={<Search className="h-5 w-5" />} label="Research" />
            <ToolTile icon={<ShieldCheck className="h-5 w-5" />} label="Govern" />
          </div>
        </aside>

        <div className="space-y-4">
          <Card className="workspace-panel rounded-[1.75rem] border-white/10 p-0">
            <div className="border-b border-white/8 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--yellow)]">
                Moderator workspace
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    Agent console
                  </h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Operate circles like a creative control room: context,
                    moderation, surveys, and local research in one surface.
                  </p>
                </div>
                <Chip tone="green">{activeUser.location.city}</Chip>
              </div>
            </div>

            <div className="grid gap-5 px-5 py-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <FieldGroup label="Active circle">
                  <div className="flex flex-wrap gap-2">
                    {circleRecommendations.slice(0, 4).map((item) => (
                      <SelectablePill
                        key={item.circle.id}
                        active={selectedCircleId === item.circle.id}
                        onClick={() => setSelectedCircleId(item.circle.id)}
                      >
                        {item.circle.name}
                      </SelectablePill>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup label="Moderator goal">
                  <textarea
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    className="min-h-32 w-full rounded-[1.25rem] border border-white/10 bg-black/30 px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-[var(--yellow)]/50 focus:ring-2 focus:ring-[var(--yellow)]/20"
                    placeholder="Describe what the moderator should solve for this circle."
                  />
                </FieldGroup>

                <div className="grid gap-4 md:grid-cols-2">
                  <FieldGroup label="Attendance signal">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={attendanceRate}
                      onChange={(event) =>
                        setAttendanceRate(Number(event.target.value))
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--yellow)]"
                    />
                    <div className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                      {Math.round(attendanceRate * 100)}% confidence
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Recent concerns">
                    <div className="flex flex-wrap gap-2">
                      {concernOptions.map((concern) => (
                        <SelectablePill
                          key={concern}
                          active={recentConcerns.includes(concern)}
                          onClick={() => toggleConcern(concern)}
                        >
                          {concern}
                        </SelectablePill>
                      ))}
                    </div>
                  </FieldGroup>
                </div>

                <FieldGroup label="External web context">
                  <textarea
                    value={webContext}
                    onChange={(event) => setWebContext(event.target.value)}
                    className="min-h-24 w-full rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-zinc-200 outline-none transition focus:border-[var(--green)]/40 focus:ring-2 focus:ring-[var(--green)]/20"
                    placeholder="Optional findings, venue notes, or web-search snippets. One per line."
                  />
                </FieldGroup>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleRunModerator} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Running moderator
                      </>
                    ) : (
                      <>
                        <WandSparkles className="h-4 w-4" />
                        Generate moderation brief
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setConversation([
                        {
                          id: "seed-agent",
                          role: "agent",
                          content:
                            "Moderator ready. Give me a governance goal and I will turn it into surveys, actions, and local research hints.",
                        },
                      ]);
                      setReply(null);
                    }}
                  >
                    Reset conversation
                  </Button>
                </div>

                {error ? (
                  <div className="rounded-[1.25rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <WorkspaceInfoCard
                  title="Selected circle"
                  icon={<Compass className="h-4 w-4" />}
                >
                  {selectedCircle ? (
                    <>
                      <p className="text-base font-semibold text-white">
                        {selectedCircle.name}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {selectedCircle.location.locality},{" "}
                        {selectedCircle.location.city} •{" "}
                        {selectedCircle.schedule.join(" / ")}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedCircle.intentModes.map((mode) => (
                          <Chip key={mode} tone="yellow">
                            {mode}
                          </Chip>
                        ))}
                        {selectedCircle.activityTags.map((tag) => (
                          <Chip key={tag}>{tag}</Chip>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-zinc-400">
                      Pick a circle to generate moderation actions.
                    </p>
                  )}
                </WorkspaceInfoCard>

                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                  {workspaceStats.map((stat) => (
                    <WorkspaceMetric
                      key={stat.label}
                      label={stat.label}
                      value={stat.value}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="workspace-panel rounded-[1.75rem] border-white/10 p-0">
            <div className="border-b border-white/8 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green)]">
                Conversation continuity
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Moderator timeline
              </h3>
            </div>
            <div className="space-y-3 px-5 py-5">
              {conversation.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded-[1.25rem] border px-4 py-4 ${
                    entry.role === "agent"
                      ? "border-[var(--green)]/15 bg-[var(--green)]/8"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {entry.role === "agent" ? "Moderator" : "Operator"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-zinc-200">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="workspace-panel rounded-[1.75rem] border-white/10 p-0">
            <div className="border-b border-white/8 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-[var(--yellow)]/20 bg-[var(--yellow)]/10 p-3">
                  <Bot className="h-5 w-5 text-[var(--yellow)]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--yellow)]">
                    Agent output
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-white">
                    Moderation brief
                  </h3>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-5 py-5">
              <WorkspaceInfoCard
                title="Summary"
                icon={<Sparkles className="h-4 w-4" />}
              >
                <p className="text-sm leading-7 text-zinc-200">
                  {reply?.summary ??
                    "Run the moderator once to generate a circle-specific summary, actions, surveys, and local search direction."}
                </p>
              </WorkspaceInfoCard>

              <WorkspaceList
                title="Suggested actions"
                items={reply?.suggestedActions ?? []}
                emptyLabel="Actions will appear after the first run."
                onUse={applyPrompt}
              />
              <WorkspaceList
                title="Pulse surveys"
                items={reply?.surveys ?? []}
                emptyLabel="Survey prompts will appear after the first run."
                onUse={applyPrompt}
              />
              <WorkspaceList
                title="Search queries"
                items={reply?.searchQueries ?? []}
                emptyLabel="Search hints will appear after the first run."
                onUse={applyPrompt}
              />
            </div>
          </Card>

          <Card className="workspace-panel rounded-[1.75rem] border-white/10 p-0">
            <div className="border-b border-white/8 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green)]">
                Research hints
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                Web-search companion
              </h3>
            </div>
            <div className="space-y-3 px-5 py-5">
              {reply?.sourceHints?.length ? (
                reply.sourceHints.map((hint) => (
                  <div
                    key={hint.url}
                    className="rounded-[1.25rem] border border-white/8 bg-white/5 px-4 py-4"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Search className="h-4 w-4 text-[var(--yellow)]" />
                      {hint.title}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-zinc-300">
                      {hint.snippet}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                      {hint.url}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-400">
                  The agent will surface venue and community search directions
                  here once you generate a moderation brief.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ToolTile({
  icon,
  label,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex min-h-16 flex-1 flex-col items-center justify-center rounded-[1.25rem] border px-2 text-center text-xs font-medium transition ${
        active
          ? "border-[var(--yellow)]/30 bg-[var(--yellow)]/10 text-[var(--yellow)]"
          : "border-white/8 bg-white/5 text-zinc-400"
      }`}
    >
      {icon}
      <span className="mt-2">{label}</span>
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function SelectablePill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-[var(--yellow)]/35 bg-[var(--yellow)]/12 text-[var(--yellow)]"
          : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/8"
      }`}
    >
      {children}
    </button>
  );
}

function WorkspaceInfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-black/20 px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-medium text-white">
        <span className="text-[var(--yellow)]">{icon}</span>
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function WorkspaceMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/8 bg-white/5 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function WorkspaceList({
  title,
  items,
  emptyLabel,
  onUse,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
  onUse: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        {title}
      </p>
      {items.length ? (
        items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onUse(item)}
            className="block w-full rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-3 text-left text-sm leading-7 text-zinc-200 transition hover:border-[var(--yellow)]/25 hover:bg-[var(--yellow)]/6"
          >
            {item}
          </button>
        ))
      ) : (
        <p className="text-sm text-zinc-400">{emptyLabel}</p>
      )}
    </div>
  );
}
