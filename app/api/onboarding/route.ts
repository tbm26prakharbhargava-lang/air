import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CURRENT_USER_EMAIL } from "@/lib/constants";
import { recomputeForUser } from "@/services/matching";

export async function POST(req: Request) {
  const form = await req.formData();
  const user = await prisma.user.findUniqueOrThrow({ where: { email: CURRENT_USER_EMAIL } });
  const city = String(form.get("city") || "Gurgaon");
  const locality = String(form.get("locality") || "DLF Phase 2");
  const activities = form.getAll("activities").map(String);
  const times = form.getAll("times").map(String);
  await prisma.profile.update({ where: { userId: user.id }, data: { city, locality, primaryIntent: String(form.get("intent") || "SPORTS") as any } });
  await prisma.userMatchingPreference.upsert({ where: { userId: user.id }, update: { maxDistanceKm: Number(form.get("radius") || 8) }, create: { userId: user.id, maxDistanceKm: Number(form.get("radius") || 8), preferredGroupSize: 8 } });
  await prisma.userBehaviorProfile.upsert({ where: { userId: user.id }, update: {
    seriousness: Number(form.get("seriousness") || 0.6), planningStyle: Number(form.get("planningStyle") || 0.5), groupPreference: Number(form.get("groupPreference") || 0.4), routinePreference: Number(form.get("routinePreference") || 0.8)
  }, create: {
    userId: user.id, seriousness: Number(form.get("seriousness") || 0.6), planningStyle: Number(form.get("planningStyle") || 0.5), groupPreference: Number(form.get("groupPreference") || 0.4), routinePreference: Number(form.get("routinePreference") || 0.8)
  }});
  await prisma.userActivityPreference.deleteMany({ where: { userId: user.id } });
  await prisma.userActivityPreference.createMany({ data: activities.map((activityId) => ({ userId: user.id, activityId, interestScore: 0.85, skillLevel: "BEGINNER" })) });
  await prisma.userTimePreference.deleteMany({ where: { userId: user.id } });
  await prisma.userTimePreference.createMany({ data: times.map((timeBand) => ({ userId: user.id, timeBand: timeBand as any, preferenceScore: 0.9 })) });
  await recomputeForUser(user.id);
  return NextResponse.redirect(new URL("/home", req.url));
}
