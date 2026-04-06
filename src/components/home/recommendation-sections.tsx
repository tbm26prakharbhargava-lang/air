"use client";

import {
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Chip } from "@/components/ui/chip";
import type { Circle, Event, Recommendation, UserProfile } from "@/lib/matching/types";

type RecommendationSectionsProps = {
  activeUser: UserProfile;
  circleRecommendations: Recommendation<Circle>[];
  eventRecommendations: Recommendation<Event>[];
  peopleRecommendations: Recommendation<UserProfile>[];
};

export function RecommendationSections({
  activeUser,
  circleRecommendations,
  eventRecommendations,
  peopleRecommendations,
}: RecommendationSectionsProps) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--yellow)]/90">
              Recommended for you
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">AI-ranked circles</h2>
          </div>
          <Button variant="ghost" className="gap-2">
            See all <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {circleRecommendations.slice(0, 3).map((item) => (
            <Card key={item.entity.id}>
              <div className="space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.entity.name}</h3>
                    <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                      <MapPin className="h-4 w-4 text-[var(--green)]" />
                      {item.entity.location.locality}, {item.entity.location.city}
                    </p>
                  </div>
                  <div className="rounded-full border border-[var(--yellow)]/30 bg-[var(--yellow)]/10 px-3 py-1 text-xs font-semibold text-[var(--yellow)]">
                    {Math.round(item.score * 100)}% fit
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {item.entity.activityTags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                  <Chip>{item.entity.intentModes.join(" / ")}</Chip>
                  <Chip tone={item.entity.mentorLed ? "green" : "yellow"}>
                    {item.entity.mentorLed ? "Mentor led" : "Peer led"}
                  </Chip>
                </div>

                <ul className="space-y-2 text-sm text-zinc-300">
                  {item.reasons.map((reason) => (
                    <li key={reason.label} className="flex items-start gap-2">
                      <Sparkles className="mt-0.5 h-4 w-4 text-[var(--yellow)]" />
                      <span>{reason.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t border-white/8 pt-4 text-sm text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[var(--green)]" />
                    {item.entity.health.activeMembersCount} members
                  </span>
                  <span>{item.entity.schedule.join(" · ")}</span>
                </div>

                <Button className="w-full">Join circle</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--green)]">
            This week with your circles
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Recommended events</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {eventRecommendations.slice(0, 3).map((item) => (
            <Card key={item.entity.id} className="border-[var(--green)]/15">
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-white">{item.entity.title}</h3>
                  <p className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
                    <CalendarClock className="h-4 w-4 text-[var(--yellow)]" />
                    {item.entity.startsAt}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Chip tone="green">
                    {item.entity.attendeesGoingCount} / {item.entity.capacity} confirmed
                  </Chip>
                  <Chip>{item.entity.location.venue}</Chip>
                </div>

                <ul className="space-y-2 text-sm text-zinc-300">
                  {item.reasons.map((reason) => (
                    <li key={reason.label} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--green)]" />
                      <span>{reason.label}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t border-white/8 pt-4 text-sm text-zinc-400">
                  <span>
                    {Math.round((item.entity.attendeesGoingCount / item.entity.capacity) * 100)}% filled
                  </span>
                  <span>{Math.round(item.score * 100)}% likely</span>
                </div>

                <Button className="w-full">Confirm attendance</Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--yellow)]/90">
              People you may enjoy meeting
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Contextual matches</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {peopleRecommendations.slice(0, 3).map((item) => (
              <Card key={item.entity.id}>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.entity.name}</h3>
                    <p className="text-sm text-zinc-400">
                      {item.entity.profession} · {item.entity.location.locality}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.entity.activities.map((activity) => (
                      <Chip key={activity}>{activity}</Chip>
                    ))}
                  </div>

                  <ul className="space-y-2 text-sm text-zinc-300">
                    {item.reasons.map((reason) => (
                      <li key={reason.label} className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-4 w-4 text-[var(--yellow)]" />
                        <span>{reason.label}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between border-t border-white/8 pt-4 text-sm text-zinc-400">
                    <span>Reliability {Math.round(item.entity.reliability.attendanceRate * 100)}%</span>
                    <span>{Math.round(item.score * 100)}% fit</span>
                  </div>

                  <Button variant="secondary" className="w-full">
                    Invite to event
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-[var(--yellow)]/20">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-[var(--yellow)]/20 bg-[var(--yellow)]/10 p-3">
                <Bot className="h-5 w-5 text-[var(--yellow)]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI moderator preview</h3>
                <p className="text-sm text-zinc-400">Survey, moderation, and ritual upkeep</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300">
              Circles agents keep communities alive for {activeUser.name}: they summarize attendance
              signals, suggest new local research via web search, ask pulse questions, and keep
              the conversation moving when momentum drops.
            </p>

            <div className="space-y-3 rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="font-medium text-white">Sample moderator action</p>
              <p className="text-sm text-zinc-300">
                Attendance dipped in the Wednesday badminton circle. Ask whether members prefer
                Thursday evenings, then run a local venue search before changing the ritual.
              </p>
            </div>

            <div className="space-y-2">
              <Chip tone="yellow">web-search assisted research</Chip>
              <Chip tone="green">governance pulse survey</Chip>
              <Chip>conversation continuity</Chip>
            </div>

            <Button variant="secondary" className="w-full">
              Open agent console
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
