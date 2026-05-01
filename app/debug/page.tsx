import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";

export default async function DebugPage() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: CURRENT_USER_EMAIL } });
  const [m,c,e] = await Promise.all([
    prisma.userMatchRecommendation.findMany({ where: { userId: user.id }, take: 6, orderBy: { score: "desc" } }),
    prisma.userCircleRecommendation.findMany({ where: { userId: user.id }, take: 6, orderBy: { score: "desc" } }),
    prisma.userEventRecommendation.findMany({ where: { userId: user.id }, take: 6, orderBy: { score: "desc" } }),
  ]);
  return <pre className="text-xs overflow-auto">{JSON.stringify({matches:m,circles:c,events:e}, null, 2)}</pre>;
}
