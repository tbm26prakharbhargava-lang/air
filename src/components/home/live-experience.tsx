"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";

import { Hero } from "@/components/home/hero";
import { RecommendationSections } from "@/components/home/recommendation-sections";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import { seedCircles, seedEvents, seedUsers } from "@/lib/data/seed";
import {
  recommendCirclesForUser,
  recommendEventsForUser,
  recommendPeopleForUser,
} from "@/lib/matching/engine";
import type {
  ActivityTag,
  IntentMode,
  ScheduleTag,
  UserProfile,
} from "@/lib/matching/types";

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

const createInitialUser = (): UserProfile => ({
  ...seedUsers[0],
  intentModes: [...seedUsers[0].intentModes],
  activities: [...seedUsers[0].activities],
  schedulePreferences: [...seedUsers[0].schedulePreferences],
  location: { ...seedUsers[0].location },
  preferences: { ...seedUsers[0].preferences },
  behavior: { ...seedUsers[0].behavior },
  reliability: { ...seedUsers[0].reliability },
});

const formatLabel = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function toggleValue<T extends string>(list: T[], value: T) {
  if (list.includes(value)) {
    return list.filter((item) => item !== value);
  }

  return [...list, value];
}

function buildPersonaSummary(user: UserProfile) {
  const structure =
    user.behavior.plannerScore > 0.7 ? "structured" : "more spontaneous";
  const consistency =
    user.behavior.consistencyScore > 0.75 ? "repeatable weekly rituals" : "lighter commitment";
  const groupFormat =
    user.behavior.groupSizePreference < 0.35 ? "small-group energy" : "slightly broader circles";
  const primaryActivity = user.activities[0] ?? "community experiences";
  const primaryTime = user.schedulePreferences[0]
    ? formatLabel(user.schedulePreferences[0]).toLowerCase()
    : "flexible timing";

  return `You look like a ${structure} ${primaryActivity} user who prefers ${primaryTime}, ${groupFormat}, and ${consistency}. The algorithm is prioritizing local circles with compatible pace, attendance quality, and community context.`;
}

export function LiveExperience() {
  const [activeUser, setActiveUser] = useState<UserProfile>(createInitialUser);

  const circleRecommendations = useMemo(
    () => recommendCirclesForUser(activeUser, seedCircles),
    [activeUser],
  );

  const eventRecommendations = useMemo(
    () =>
      recommendEventsForUser(
        activeUser,
        circleRecommendations.map((item) => item.circle),
        seedEvents,
      ),
    [activeUser, circleRecommendations],
  );

  const peopleRecommendations = useMemo(
    () => recommendPeopleForUser(activeUser, seedUsers),
    [activeUser],
  );

  const personaSummary = useMemo(
    () => buildPersonaSummary(activeUser),
    [activeUser],
  );

  const topCircle = circleRecommendations[0];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#182016_0%,#0b0b0d_35%,#09090b_100%)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-6 md:px-8 lg:px-10">
        <Hero
          activeUser={activeUser}
          personaSummary={personaSummary}
          topCircle={topCircle}
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
                    Change intent, activities, schedule, and behavior to see the
                    recommendation stack update live.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <SlidersHorizontal className="h-5 w-5 text-[var(--yellow)]" />
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
                  onClick={() => setActiveUser(createInitialUser())}
                >
                  Reset profile
                </Button>
                <Button>Save onboarding state</Button>
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
                      value={`${Math.round(topCircle.circle.health.avgAttendanceRate30d * 100)}%`}
                    />
                    <MetricCard
                      label="Repeat rate"
                      value={`${Math.round(topCircle.circle.health.repeatAttendanceRate30d * 100)}%`}
                    />
                    <MetricCard
                      label="Active members"
                      value={`${topCircle.circle.health.activeMembersCount}`}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-400">
                  Add at least one activity and one schedule preference to
                  generate live rankings.
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
    </main>
  );
}

function PreferenceGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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
  children: React.ReactNode;
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
