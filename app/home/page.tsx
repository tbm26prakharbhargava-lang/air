import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";
import { EventCard } from "@/components/EventCard";
import { CircleCard } from "@/components/CircleCard";
import { MatchCard } from "@/components/MatchCard";
import { SectionHeader } from "@/components/SectionHeader";

export default async function HomePage() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: CURRENT_USER_EMAIL } });
  const [events, matches, yourCircles] = await Promise.all([
    prisma.userEventRecommendation.findMany({ where: { userId: user.id }, take: 4, orderBy: { score: "desc" } }),
    prisma.userMatchRecommendation.findMany({ where: { userId: user.id }, take: 3, orderBy: { score: "desc" } }),
    prisma.circleMember.findMany({ where: { userId: user.id, membershipStatus: "ACTIVE" }, include: { circle: { include: { activity: true } } } })
  ]);
  const eventRows = await prisma.event.findMany({ where: { id: { in: events.map((e) => e.targetId) } } });
  const matchRows = await prisma.user.findMany({ where: { id: { in: matches.map((m) => m.targetId) } }, include: { profile: true } });
  return <div className="space-y-8">
    <SectionHeader title="Recommended for you" subtitle="Nearby events with strong ritual potential" />
    <div className="space-y-3">{eventRows.map((e) => <EventCard key={e.id} event={e} />)}</div>
    <SectionHeader title="Your Circles" subtitle="Attendance-first communities" />
    <div className="space-y-3">{yourCircles.map((m) => <CircleCard key={m.circleId} circle={m.circle} />)}</div>
    <SectionHeader title="People You May Enjoy Doing This With" />
    <div className="space-y-3">{matches.map((m) => <MatchCard key={m.id} match={{ ...m, target: matchRows.find((u) => u.id === m.targetId) }} />)}</div>
  </div>;
}
