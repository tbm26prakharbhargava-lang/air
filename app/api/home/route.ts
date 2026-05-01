import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";

export async function GET() {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: CURRENT_USER_EMAIL }, include: { profile: true } });
  const circles = await prisma.circleMember.findMany({ where: { userId: user.id }, include: { circle: true } });
  const events = await prisma.userEventRecommendation.findMany({ where: { userId: user.id }, take: 5, orderBy: { score: "desc" } });
  const matches = await prisma.userMatchRecommendation.findMany({ where: { userId: user.id }, take: 5, orderBy: { score: "desc" } });
  return NextResponse.json({ user, circles, events, matches });
}
