import { Hero } from "@/components/home/hero";
import { RecommendationSections } from "@/components/home/recommendation-sections";
import { seedCircles, seedEvents, seedUsers } from "@/lib/data/seed";
import {
  recommendCirclesForUser,
  recommendEventsForUser,
  recommendPeopleForUser,
} from "@/lib/matching/engine";

export default function HomePage() {
  const activeUser = seedUsers[0];
  const circleRecommendations = recommendCirclesForUser(activeUser, seedCircles);
  const eventRecommendations = recommendEventsForUser(
    activeUser,
    circleRecommendations.map((item) => item.circle),
    seedEvents,
  );
  const peopleRecommendations = recommendPeopleForUser(activeUser, seedUsers);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#182016_0%,#0b0b0d_35%,#09090b_100%)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-6 md:px-8 lg:px-10">
        <Hero />
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
