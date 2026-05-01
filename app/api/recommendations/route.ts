import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";

export async function GET() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: CURRENT_USER_EMAIL } });
  const [matches,circles,events] = await Promise.all([
    prisma.userMatchRecommendation.findMany({ where: { userId: user.id }, orderBy: { score: "desc" } }),
    prisma.userCircleRecommendation.findMany({ where: { userId: user.id }, orderBy: { score: "desc" } }),
    prisma.userEventRecommendation.findMany({ where: { userId: user.id }, orderBy: { score: "desc" } })
  ]);
  return NextResponse.json({ matches, circles, events });
}
