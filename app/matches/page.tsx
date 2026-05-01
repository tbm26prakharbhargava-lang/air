import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";
import { MatchCard } from "@/components/MatchCard";

export default async function MatchesPage() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: CURRENT_USER_EMAIL } });
  const matches = await prisma.userMatchRecommendation.findMany({ where: { userId: user.id }, orderBy: { score: "desc" }, take: 12 });
  const targetUsers = await prisma.user.findMany({ where: { id: { in: matches.map((m) => m.targetId) } }, include: { profile: true } });
  return <div className="space-y-3"><h1 className="text-2xl font-bold">Matches</h1>{matches.map((m) => <MatchCard key={m.id} match={{ ...m, target: targetUsers.find((u) => u.id === m.targetId) }} />)}</div>;
}
