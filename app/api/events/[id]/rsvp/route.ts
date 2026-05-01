import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";
import { recomputeForUser } from "@/services/matching";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUniqueOrThrow({ where: { email: CURRENT_USER_EMAIL } });
  await prisma.eventParticipant.upsert({ where: { eventId_userId: { eventId: params.id, userId: user.id } }, update: { rsvpStatus: "GOING" }, create: { eventId: params.id, userId: user.id, rsvpStatus: "GOING" } });
  const joined = await prisma.eventParticipant.count({ where: { userId: user.id } });
  const attended = await prisma.eventParticipant.count({ where: { userId: user.id, attendanceStatus: "ATTENDED" } });
  await prisma.userReliabilityMetric.upsert({ where: { userId: user.id }, update: { eventsJoined: joined, eventsAttended: attended, attendanceRate: joined ? attended / joined : 0 }, create: { userId: user.id, eventsJoined: joined, eventsAttended: attended, attendanceRate: joined ? attended / joined : 0 } });
  await recomputeForUser(user.id);
  return NextResponse.redirect(new URL(`/events/${params.id}`, req.url));
}
