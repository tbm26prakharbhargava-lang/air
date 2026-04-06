"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Compass,
  LayoutGrid,
  MapPin,
  Sparkles,
  UsersRound,
  WandSparkles,
} from "lucide-react";

import { AgentConsole } from "@/components/home/agent-console";
import { Hero } from "@/components/home/hero";
import { RecommendationSections } from "@/components/home/recommendation-sections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type {
  ActivityTag,
  Circle,
  Event,
  IntentMode,
  Recommendation,
  ScheduleTag,
  UserProfile,
} from "@/lib/matching/types";

export type AppView =
  | "home"
  | "circles"
  | "events"
  | "matches"
  | "profile"
  | "workspace";

type HomeWorkspaceViewProps = {
  activeUser: UserProfile;
  setActiveUser: Dispatch<SetStateAction<UserProfile>>;
  circleRecommendations: Array<Recommendation<Circle> & { circle: Circle }>;
  eventRecommendations: Array<Recommendation<Event> & { event: Event }>;
  peopleRecommendations: Array<Recommendation<UserProfile> & { person: UserProfile }>;
  personaSummary: string;
  onOpenWorkspace: () => void;
  onSaveProfile: () => void;
  saveStateLabel: string;
};

type AppNavigationProps = {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  circleCount: number;
  eventCount: number;
  matchCount: number;
};

const intentOptions: IntentMode[] = [
  "sports",
  "corporate",
  "creator",
  "social",
  "travel",
  "dating",
];

const activityOptions: ActivityTag[] = [
  "badminton",
  "running",
  "chess",
  "yoga",
  "football",
  "creator walks",
  "coffee chats",
];

const scheduleOptions: ScheduleTag[] = [
  "weekday-morning",
  "weekday-evening",
  "weekend-morning",
  "weekend-evening",
];

const viewConfig: Array<{
  id: AppView;
  label: string;
  icon: ReactNode;
}> = [
  { id: "home", label: "Home", icon: <LayoutGrid className="h-4 w-4" /> },
  { id: "circles", label: "Circles", icon: <Compass className="h-4 w-4" /> },
  { id: "events", label: "Events", icon: <CalendarDays className="h-4 w-4" /> },
  { id: "matches", label: "Matches", icon: <UsersRound className="h-4 w-4" /> },
  { id: "profile", label: "Profile", icon: <CircleUserRound className="h-4 w-4" /> },
  { id: "workspace", label: "Workspace", icon: <WandSparkles className="h-4 w-4" /> },
];

export function AppNavigation({
  activeView,
  setActiveView,
  circleCount,
  eventCount,
  matchCount,
}: AppNavigationProps) {
  return (
    <section className="workspace-panel rounded-[1.75rem] p-3">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--yellow)]">
            App shell
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Circles product experience
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {viewConfig.map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveView(view.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeView === view.id
                  ? "border-[var(--yellow)]/40 bg-[var(--yellow)]/14 text-[var(--yellow)]"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/8"
              }`}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Chip tone="green">{circleCount} circles</Chip>
          <Chip tone="yellow">{eventCount} events</Chip>
          <Chip>{matchCount} matches</Chip>
        </div>
      </div>
    </section>
  );
}

export function HomeWorkspaceView({
  activeUser,
  setActiveUser,
  circleRecommendations,
  eventRecommendations,
  peopleRecommendations,
  personaSummary,
  onOpenWorkspace,
  onSaveProfile,
  saveStateLabel,
}: HomeWorkspaceViewProps) {
  const topCircle = circleRecommendations[0];

  return (
    <div className="space-y-10">
      <Hero
        activeUser={activeUser}
        personaSummary={personaSummary}
        topCircle={topCircle}
        onOpenOnboarding={() => {
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        onOpenConsole={onOpenWorkspace}
      />

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="border-[var(--yellow)]/15">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--yellow)]">
                  Onboarding engine
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Tune your matching profile
                </h2>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Change intent, activities, schedule, and behavior to shape the
                  whole experience live.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.18em] text-zinc-400">
                {saveStateLabel}
              </div>
            </div>

            <div className="space-y-5">
              <PreferenceGroup label="Intent modes">
                {intentOptions.map((intent) => (
                  <ToggleChipButton
                    key={intent}
                    selected={activeUser.intentModes.includes(intent)}
                    onClick={() =>
                      setActiveUser((current) => ({
                        ...current,
                        intentModes: toggleValue(current.intentModes, intent),
                      }))
                    }
                  >
                    {formatLabel(intent)}
                  </ToggleChipButton>
                ))}
              </PreferenceGroup>

              <PreferenceGroup label="Activities">
                {activityOptions.map((activity) => (
                  <ToggleChipButton
                    key={activity}
                    selected={activeUser.activities.includes(activity)}
                    onClick={() =>
                      setActiveUser((current) => ({
                        ...current,
                        activities: toggleValue(current.activities, activity),
                      }))
                    }
                  >
                    {formatLabel(activity)}
                  </ToggleChipButton>
                ))}
              </PreferenceGroup>

              <PreferenceGroup label="Preferred schedule">
                {scheduleOptions.map((schedule) => (
                  <ToggleChipButton
                    key={schedule}
                    selected={activeUser.schedulePreferences.includes(schedule)}
                    onClick={() =>
                      setActiveUser((current) => ({
                        ...current,
                        schedulePreferences: toggleValue(
                          current.schedulePreferences,
                          schedule,
                        ),
                      }))
                    }
                  >
                    {formatLabel(schedule)}
                  </ToggleChipButton>
                ))}
              </PreferenceGroup>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <SliderField
                label="Planner score"
                value={activeUser.behavior.plannerScore}
                onChange={(value) =>
                  setActiveUser((current) => ({
                    ...current,
                    behavior: { ...current.behavior, plannerScore: value },
                  }))
                }
              />
              <SliderField
                label="Competitiveness"
                value={activeUser.behavior.competitivenessScore}
                onChange={(value) =>
                  setActiveUser((current) => ({
                    ...current,
                    behavior: {
                      ...current.behavior,
                      competitivenessScore: value,
                    },
                  }))
                }
              />
              <SliderField
                label="Consistency"
                value={activeUser.behavior.consistencyScore}
                onChange={(value) =>
                  setActiveUser((current) => ({
                    ...current,
                    behavior: {
                      ...current.behavior,
                      consistencyScore: value,
                    },
                  }))
                }
              />
              <SliderField
                label="Small-group preference"
                value={activeUser.behavior.groupSizePreference}
                onChange={(value) =>
                  setActiveUser((current) => ({
                    ...current,
                    behavior: {
                      ...current.behavior,
                      groupSizePreference: value,
                    },
                  }))
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Partner style
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["peer-led", "mentor-led", "mixed"] as const).map((option) => (
                    <ToggleChipButton
                      key={option}
                      selected={activeUser.preferences.partnerPreference === option}
                      onClick={() =>
                        setActiveUser((current) => ({
                          ...current,
                          preferences: {
                            ...current.preferences,
                            partnerPreference: option,
                          },
                        }))
                      }
                    >
                      {formatLabel(option)}
                    </ToggleChipButton>
                  ))}
                </div>
              </div>

              <SliderField
                label="Max distance (km)"
                value={activeUser.preferences.maxDistanceKm / 12}
                valueLabel={`${activeUser.preferences.maxDistanceKm} km`}
                onChange={(value) =>
                  setActiveUser((current) => ({
                    ...current,
                    preferences: {
                      ...current.preferences,
                      maxDistanceKm: Math.max(2, Math.round(value * 12)),
                    },
                  }))
                }
              />
            </div>

            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/8 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-300">
                <Sparkles className="h-4 w-4" />
                Live AI interpretation
              </div>
              <p className="text-sm leading-7 text-zinc-300">{personaSummary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Chip tone="green">
                  {circleRecommendations.length} ranked circles
                </Chip>
                <Chip tone="yellow">
                  {eventRecommendations.length} event options
                </Chip>
                <Chip>
                  {peopleRecommendations.length} contextual people matches
                </Chip>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary"
                onClick={() => setActiveUser(createProfileClone(activeUser))}
              >
                Refresh local state
              </Button>
              <Button onClick={onSaveProfile}>Save onboarding state</Button>
            </div>
          </div>
        </Card>

        <Card className="border-white/10">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green)]">
                Live ranking snapshot
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Why the top circle is winning
              </h2>
            </div>

            {topCircle ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {topCircle.circle.name}
                      </h3>
                      <p className="mt-2 text-sm text-zinc-400">
                        {topCircle.circle.location.locality},{" "}
                        {topCircle.circle.location.city}
                      </p>
                    </div>
                    <div className="rounded-full border border-[var(--green)]/20 bg-[var(--green)]/10 px-3 py-1 text-sm font-semibold text-[var(--green)]">
                      {Math.round(topCircle.score * 100)}% fit
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {topCircle.circle.activityTags.map((tag) => (
                      <Chip key={tag}>{tag}</Chip>
                    ))}
                    {topCircle.circle.intentModes.map((mode) => (
                      <Chip key={mode} tone="yellow">
                        {formatLabel(mode)}
                      </Chip>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3">
                    {topCircle.reasons.map((reason) => (
                      <div
                        key={reason.label}
                        className="rounded-2xl border border-white/8 bg-black/20 p-4"
                      >
                        <p className="text-sm font-medium text-white">
                          {reason.label}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {reason.tone}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <MetricCard
                    label="Circle attendance"
                    value={`${Math.round(
                      topCircle.circle.health.avgAttendanceRate30d * 100,
                    )}%`}
                  />
                  <MetricCard
                    label="Repeat rate"
                    value={`${Math.round(
                      topCircle.circle.health.repeatAttendanceRate30d * 100,
                    )}%`}
                  />
                  <MetricCard
                    label="Active members"
                    value={`${topCircle.circle.health.activeMembersCount}`}
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">
                Add at least one activity and one schedule preference to generate
                live rankings.
              </p>
            )}
          </div>
        </Card>
      </section>

      <RecommendationSections
        activeUser={activeUser}
        circleRecommendations={circleRecommendations}
        eventRecommendations={eventRecommendations}
        peopleRecommendations={peopleRecommendations}
      />
    </div>
  );
}

export function CirclesView({
  circleRecommendations,
}: {
  circleRecommendations: Array<Recommendation<Circle> & { circle: Circle }>;
}) {
  const [selectedId, setSelectedId] = useState(circleRecommendations[0]?.circle.id ?? "");

  const selected =
    circleRecommendations.find((item) => item.circle.id === selectedId) ??
    circleRecommendations[0];

  return (
    <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
      <Card className="workspace-panel rounded-[1.75rem] p-0">
        <div className="border-b border-white/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--yellow)]">
            Circles
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Explore your recurring groups
          </h2>
        </div>
        <div className="space-y-3 px-4 py-4">
          {circleRecommendations.map((item) => (
            <button
              key={item.circle.id}
              type="button"
              onClick={() => setSelectedId(item.circle.id)}
              className={`block w-full rounded-[1.35rem] border px-4 py-4 text-left transition ${
                selected?.circle.id === item.circle.id
                  ? "border-[var(--yellow)]/30 bg-[var(--yellow)]/10"
                  : "border-white/8 bg-white/5 hover:border-white/15 hover:bg-white/7"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-white">
                    {item.circle.name}
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {item.circle.location.locality} •{" "}
                    {item.circle.schedule.join(" / ")}
                  </p>
                </div>
                <div className="rounded-full border border-[var(--green)]/20 bg-[var(--green)]/10 px-3 py-1 text-xs font-semibold text-[var(--green)]">
                  {Math.round(item.score * 100)}%
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.circle.activityTags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="workspace-panel rounded-[1.75rem] p-0">
        <div className="border-b border-white/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green)]">
            Circle detail
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {selected?.circle.name ?? "Select a circle"}
          </h2>
        </div>
        {selected ? (
          <div className="space-y-6 px-5 py-5">
            <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-5">
              <p className="text-sm leading-7 text-zinc-300">
                {selected.circle.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selected.circle.intentModes.map((mode) => (
                  <Chip key={mode} tone="yellow">
                    {formatLabel(mode)}
                  </Chip>
                ))}
                <Chip tone={selected.circle.mentorLed ? "green" : "default"}>
                  {selected.circle.mentorLed ? "Mentor led" : "Peer led"}
                </Chip>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Attendance"
                value={`${Math.round(
                  selected.circle.health.avgAttendanceRate30d * 100,
                )}%`}
              />
              <MetricCard
                label="Repeat"
                value={`${Math.round(
                  selected.circle.health.repeatAttendanceRate30d * 100,
                )}%`}
              />
              <MetricCard
                label="Members"
                value={`${selected.circle.health.activeMembersCount}`}
              />
            </div>

            <div className="space-y-3">
              <SectionTitle>Why it fits</SectionTitle>
              {selected.reasons.map((reason) => (
                <div
                  key={reason.label}
                  className="rounded-[1.15rem] border border-white/8 bg-black/20 px-4 py-3"
                >
                  <p className="text-sm font-medium text-white">{reason.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <SectionTitle>Members</SectionTitle>
              <div className="grid gap-3 md:grid-cols-2">
                {selected.circle.members.map((member) => (
                  <div
                    key={member.id}
                    className="rounded-[1.15rem] border border-white/8 bg-white/5 px-4 py-4"
                  >
                    <p className="font-medium text-white">{member.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">{member.profession}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button>Join circle</Button>
              <Button variant="secondary">View next ritual</Button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5 text-sm text-zinc-400">
            No circle selected.
          </div>
        )}
      </Card>
    </section>
  );
}

export function EventsView({
  eventRecommendations,
}: {
  eventRecommendations: Array<Recommendation<Event> & { event: Event }>;
}) {
  const [selectedId, setSelectedId] = useState(eventRecommendations[0]?.event.id ?? "");

  const selected =
    eventRecommendations.find((item) => item.event.id === selectedId) ??
    eventRecommendations[0];

  return (
    <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <Card className="workspace-panel rounded-[1.75rem] p-0">
        <div className="border-b border-white/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--yellow)]">
            Events
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Plans that can happen this week
          </h2>
        </div>
        <div className="space-y-3 px-4 py-4">
          {eventRecommendations.map((item) => (
            <button
              key={item.event.id}
              type="button"
              onClick={() => setSelectedId(item.event.id)}
              className={`block w-full rounded-[1.35rem] border px-4 py-4 text-left transition ${
                selected?.event.id === item.event.id
                  ? "border-[var(--green)]/25 bg-[var(--green)]/10"
                  : "border-white/8 bg-white/5 hover:border-white/15 hover:bg-white/7"
              }`}
            >
              <p className="text-base font-semibold text-white">{item.event.title}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {item.event.startsAt} • {item.event.location.venue}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip tone="green">
                  {item.event.attendeesGoingCount}/{item.event.capacity} confirmed
                </Chip>
                {item.event.activityTags.map((tag) => (
                  <Chip key={tag}>{tag}</Chip>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="workspace-panel rounded-[1.75rem] p-0">
        <div className="border-b border-white/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green)]">
            Event detail
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {selected?.event.title ?? "Select an event"}
          </h2>
        </div>
        {selected ? (
          <div className="space-y-6 px-5 py-5">
            <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-5">
              <p className="text-sm leading-7 text-zinc-300">
                {selected.event.description}
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoLine
                  label="Location"
                  value={`${selected.event.location.venue}, ${selected.event.location.locality}`}
                />
                <InfoLine label="Starts" value={selected.event.startsAt} />
                <InfoLine
                  label="Capacity"
                  value={`${selected.event.attendeesGoingCount}/${selected.event.capacity}`}
                />
                <InfoLine
                  label="Likelihood"
                  value={`${Math.round(selected.score * 100)}%`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <SectionTitle>Why it is recommended</SectionTitle>
              {selected.reasons.map((reason) => (
                <div
                  key={reason.label}
                  className="rounded-[1.15rem] border border-white/8 bg-black/20 px-4 py-3"
                >
                  <p className="text-sm font-medium text-white">{reason.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button>Confirm attendance</Button>
              <Button variant="secondary">Invite your top match</Button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5 text-sm text-zinc-400">
            No event selected.
          </div>
        )}
      </Card>
    </section>
  );
}

export function MatchesView({
  peopleRecommendations,
}: {
  peopleRecommendations: Array<Recommendation<UserProfile> & { person: UserProfile }>;
}) {
  const [selectedId, setSelectedId] = useState(peopleRecommendations[0]?.person.id ?? "");

  const selected =
    peopleRecommendations.find((item) => item.person.id === selectedId) ??
    peopleRecommendations[0];

  return (
    <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <Card className="workspace-panel rounded-[1.75rem] p-0">
        <div className="border-b border-white/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--yellow)]">
            Matches
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Contextual people suggestions
          </h2>
        </div>
        <div className="space-y-3 px-4 py-4">
          {peopleRecommendations.map((item) => (
            <button
              key={item.person.id}
              type="button"
              onClick={() => setSelectedId(item.person.id)}
              className={`block w-full rounded-[1.35rem] border px-4 py-4 text-left transition ${
                selected?.person.id === item.person.id
                  ? "border-[var(--yellow)]/30 bg-[var(--yellow)]/10"
                  : "border-white/8 bg-white/5 hover:border-white/15 hover:bg-white/7"
              }`}
            >
              <p className="text-base font-semibold text-white">{item.person.name}</p>
              <p className="mt-1 text-sm text-zinc-400">
                {item.person.profession} • {item.person.location.locality}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.person.activities.map((activity) => (
                  <Chip key={activity}>{activity}</Chip>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Card className="workspace-panel rounded-[1.75rem] p-0">
        <div className="border-b border-white/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green)]">
            Match detail
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {selected?.person.name ?? "Select a match"}
          </h2>
        </div>
        {selected ? (
          <div className="space-y-6 px-5 py-5">
            <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-5">
              <p className="text-sm text-zinc-400">
                {selected.person.profession} • {selected.person.location.city}
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoLine
                  label="Reliability"
                  value={`${Math.round(
                    selected.person.reliability.attendanceRate * 100,
                  )}%`}
                />
                <InfoLine
                  label="Compatibility"
                  value={`${Math.round(selected.score * 100)}%`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <SectionTitle>Why the engine picked this person</SectionTitle>
              {selected.reasons.map((reason) => (
                <div
                  key={reason.label}
                  className="rounded-[1.15rem] border border-white/8 bg-black/20 px-4 py-3"
                >
                  <p className="text-sm font-medium text-white">{reason.label}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.4rem] border border-[var(--yellow)]/15 bg-[var(--yellow)]/6 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--yellow)]">
                Suggested intro
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-200">
                Hey {selected.person.name}, the system thinks you and this user
                are a strong fit for a recurring{" "}
                {selected.person.activities[0] ?? "hobby"} rhythm nearby. Want to
                join the next event together?
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button>Invite to next event</Button>
              <Button variant="secondary">Save to circle shortlist</Button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-5 text-sm text-zinc-400">
            No match selected.
          </div>
        )}
      </Card>
    </section>
  );
}

export function ProfileView({
  activeUser,
  personaSummary,
  saveStateLabel,
}: {
  activeUser: UserProfile;
  personaSummary: string;
  saveStateLabel: string;
}) {
  const profileStats = [
    {
      label: "Attendance reliability",
      value: `${Math.round(activeUser.reliability.attendanceRate * 100)}%`,
    },
    {
      label: "No-show rate",
      value: `${Math.round(activeUser.reliability.noShowRate * 100)}%`,
    },
    {
      label: "Travel radius",
      value: `${activeUser.preferences.maxDistanceKm} km`,
    },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
      <Card className="workspace-panel rounded-[1.75rem] p-0">
        <div className="border-b border-white/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--yellow)]">
            Profile
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {activeUser.name}
          </h2>
        </div>
        <div className="space-y-5 px-5 py-5">
          <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-5">
            <p className="text-sm text-zinc-400">
              {activeUser.profession} • {activeUser.location.locality},{" "}
              {activeUser.location.city}
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-200">
              {activeUser.bio}
            </p>
          </div>

          <div className="space-y-3">
            <SectionTitle>Identity graph</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {activeUser.intentModes.map((mode) => (
                <Chip key={mode} tone="yellow">
                  {formatLabel(mode)}
                </Chip>
              ))}
              {activeUser.activities.map((activity) => (
                <Chip key={activity}>{formatLabel(activity)}</Chip>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {profileStats.map((stat) => (
              <MetricCard key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        </div>
      </Card>

      <Card className="workspace-panel rounded-[1.75rem] p-0">
        <div className="border-b border-white/8 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green)]">
            Matching fingerprint
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            How the system sees you
          </h2>
        </div>
        <div className="space-y-6 px-5 py-5">
          <div className="rounded-[1.4rem] border border-emerald-400/15 bg-emerald-500/8 p-5">
            <p className="text-sm leading-7 text-zinc-200">{personaSummary}</p>
          </div>

          <BehaviorBar
            label="Planner"
            value={activeUser.behavior.plannerScore}
            low="Spontaneous"
            high="Structured"
          />
          <BehaviorBar
            label="Competitiveness"
            value={activeUser.behavior.competitivenessScore}
            low="Casual"
            high="Competitive"
          />
          <BehaviorBar
            label="Consistency"
            value={activeUser.behavior.consistencyScore}
            low="Light"
            high="Repeatable"
          />
          <BehaviorBar
            label="Group size"
            value={1 - activeUser.behavior.groupSizePreference}
            low="Broad"
            high="Small-group"
          />

          <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Persistence
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-200">
              Current experience state is being stored locally in your browser.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip tone="green">{saveStateLabel}</Chip>
              <Chip>{activeUser.preferences.partnerPreference}</Chip>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

export function WorkspaceView({
  activeUser,
  circleRecommendations,
}: {
  activeUser: UserProfile;
  circleRecommendations: Array<Recommendation<Circle> & { circle: Circle }>;
}) {
  return (
    <AgentConsole
      activeUser={activeUser}
      circleRecommendations={circleRecommendations}
    />
  );
}

function PreferenceGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-300">{label}</label>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function ToggleChipButton({
  children,
  selected,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        selected
          ? "border-[var(--yellow)]/40 bg-[var(--yellow)]/15 text-[var(--yellow)]"
          : "border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:bg-white/8"
      }`}
    >
      {children}
    </button>
  );
}

function SliderField({
  label,
  value,
  onChange,
  valueLabel,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  valueLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-medium text-zinc-300">{label}</label>
        <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          {valueLabel ?? `${Math.round(value * 100)}%`}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[var(--yellow)]"
      />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function BehaviorBar({
  label,
  value,
  low,
  high,
}: {
  label: string;
  value: number;
  low: string;
  high: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-zinc-200">{label}</span>
        <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          {Math.round(value * 100)}%
        </span>
      </div>
      <div className="h-3 rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--yellow),var(--green))]"
          style={{ width: `${Math.max(8, Math.round(value * 100))}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-zinc-500">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/8 bg-black/20 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--yellow)]">
      {children}
    </p>
  );
}

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toggleValue<T extends string>(list: T[], value: T) {
  if (list.includes(value)) {
    return list.filter((item) => item !== value);
  }

  return [...list, value];
}

function createProfileClone(user: UserProfile): UserProfile {
  return {
    ...user,
    intentModes: [...user.intentModes],
    activities: [...user.activities],
    schedulePreferences: [...user.schedulePreferences],
    location: { ...user.location },
    preferences: { ...user.preferences },
    behavior: { ...user.behavior },
    reliability: { ...user.reliability },
  };
}
