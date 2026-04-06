"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  AppNavigation,
  CirclesView,
  EventsView,
  HomeWorkspaceView,
  MatchesView,
  ProfileView,
  WorkspaceView,
  type AppView,
} from "@/components/home/app-views";
import { seedCircles, seedEvents, seedUsers } from "@/lib/data/seed";
import {
  recommendCirclesForUser,
  recommendEventsForUser,
  recommendPeopleForUser,
} from "@/lib/matching/engine";
import type { UserProfile } from "@/lib/matching/types";

const storageKey = "circles-live-profile-v1";
const viewStorageKey = "circles-live-view-v1";

function formatLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isAppView(value: string | null): value is AppView {
  return (
    value === "home" ||
    value === "circles" ||
    value === "events" ||
    value === "matches" ||
    value === "profile" ||
    value === "workspace"
  );
}

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
  const [activeUser, setActiveUser] = useState<UserProfile>(() => {
    if (typeof window === "undefined") {
      return createInitialUser();
    }

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return createInitialUser();
    }

    try {
      return JSON.parse(stored) as UserProfile;
    } catch {
      window.localStorage.removeItem(storageKey);
      return createInitialUser();
    }
  });
  const [activeView, setActiveView] = useState<AppView>(() => {
    if (typeof window === "undefined") {
      return "home";
    }

    const stored = window.localStorage.getItem(viewStorageKey);
    return isAppView(stored) ? stored : "home";
  });
  const onboardingRef = useRef<HTMLDivElement | null>(null);
  const consoleRef = useRef<HTMLDivElement | null>(null);

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
  const saveStateLabel = useMemo(
    () => (activeView === "profile" ? "Stored locally in browser" : "Autosaved locally"),
    [activeView],
  );

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(activeUser));
  }, [activeUser]);

  useEffect(() => {
    window.localStorage.setItem(viewStorageKey, activeView);
  }, [activeView]);

  const scrollToOnboarding = () =>
    onboardingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const scrollToConsole = () => {
    setActiveView("workspace");
    consoleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#182016_0%,#0b0b0d_35%,#09090b_100%)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-6 md:px-8 lg:px-10">
        <AppNavigation
          activeView={activeView}
          setActiveView={setActiveView}
          circleCount={circleRecommendations.length}
          eventCount={eventRecommendations.length}
          matchCount={peopleRecommendations.length}
        />

        {activeView === "home" ? (
          <div ref={onboardingRef}>
            <HomeWorkspaceView
              activeUser={activeUser}
              setActiveUser={setActiveUser}
              circleRecommendations={circleRecommendations}
              eventRecommendations={eventRecommendations}
              peopleRecommendations={peopleRecommendations}
              personaSummary={personaSummary}
              onOpenWorkspace={scrollToConsole}
              onSaveProfile={() => {
                window.localStorage.setItem(storageKey, JSON.stringify(activeUser));
              }}
              saveStateLabel={saveStateLabel}
            />
          </div>
        ) : null}

        {activeView === "circles" ? (
          <CirclesView circleRecommendations={circleRecommendations} />
        ) : null}

        {activeView === "events" ? (
          <EventsView eventRecommendations={eventRecommendations} />
        ) : null}

        {activeView === "matches" ? (
          <MatchesView peopleRecommendations={peopleRecommendations} />
        ) : null}

        {activeView === "profile" ? (
          <ProfileView
            activeUser={activeUser}
            personaSummary={personaSummary}
            saveStateLabel={saveStateLabel}
          />
        ) : null}

        {activeView === "workspace" ? (
          <div ref={consoleRef}>
            <WorkspaceView
              activeUser={activeUser}
              circleRecommendations={circleRecommendations}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
