import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";

export async function GET() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: CURRENT_USER_EMAIL } });
  const [m,c,e] = await Promise.all([
    prisma.userMatchRecommendation.findMany({ where: { userId: user.id }, orderBy: { score: "desc" }, take: 20 }),
    prisma.userCircleRecommendation.findMany({ where: { userId: user.id }, orderBy: { score: "desc" }, take: 20 }),
    prisma.userEventRecommendation.findMany({ where: { userId: user.id }, orderBy: { score: "desc" }, take: 20 })
  ]);
  return NextResponse.json({ matchRecommendations: m, circleRecommendations: c, eventRecommendations: e });
}
