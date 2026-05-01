import { prisma } from "@/lib/prisma";
import { TimeBand, type Activity, type Circle, type Event, type User } from "@prisma/client";

type LoadedUser = User & {
  profile: { city: string; locality: string; verificationLevel: string } | null;
  activityPrefs: { activityId: string; interestScore: number }[];
  timePrefs: { timeBand: TimeBand; preferenceScore: number }[];
  behavior: { seriousness: number; planningStyle: number; groupPreference: number; routinePreference: number } | null;
  matchingPref: { preferredGroupSize: number; verifiedOnly: boolean; beginnerFriendly: boolean; mentorLedPreference: boolean; maxDistanceKm: number } | null;
  reliability: { attendanceRate: number } | null;
};

const localityMap: Record<string, number> = {
  "DLF Phase 1": 1,
  "DLF Phase 2": 2,
  "DLF Phase 3": 3,
  "Golf Course Road": 4,
  "Sushant Lok": 5,
  "Sector 29": 6,
  "Sector 45": 7,
  "Sohna Road": 8
};

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const invDistance = (a: string, b: string) => {
  const da = localityMap[a] ?? 9;
  const db = localityMap[b] ?? 9;
  return clamp(1 - Math.abs(da - db) / 8);
};

function activitySimilarity(a: LoadedUser, b: LoadedUser) {
  const aMap = new Map(a.activityPrefs.map((p) => [p.activityId, p.interestScore]));
  const bMap = new Map(b.activityPrefs.map((p) => [p.activityId, p.interestScore]));
  const ids = new Set([...aMap.keys(), ...bMap.keys()]);
  if (!ids.size) return 0;
  let total = 0;
  ids.forEach((id) => {
    total += 1 - Math.abs((aMap.get(id) ?? 0) - (bMap.get(id) ?? 0));
  });
  return clamp(total / ids.size);
}

function timeOverlap(a: LoadedUser, b: LoadedUser | { timeBand: TimeBand }) {
  const aMap = new Map(a.timePrefs.map((p) => [p.timeBand, p.preferenceScore]));
  if ("timePrefs" in b) {
    const bMap = new Map(b.timePrefs.map((p) => [p.timeBand, p.preferenceScore]));
    let total = 0;
    let count = 0;
    for (const band of Object.values(TimeBand)) {
      total += Math.min(aMap.get(band) ?? 0, bMap.get(band) ?? 0);
      count += 1;
    }
    return clamp(total / count);
  }
  return aMap.get(b.timeBand) ?? 0.2;
}

function behaviorCompatibility(a: LoadedUser, b: LoadedUser | { cadenceType: string; groupSize: number }) {
  if (!a.behavior) return 0.5;
  if ("behavior" in b) {
    if (!b.behavior) return 0.5;
    const deltas = [
      Math.abs(a.behavior.seriousness - b.behavior.seriousness),
      Math.abs(a.behavior.planningStyle - b.behavior.planningStyle),
      Math.abs(a.behavior.groupPreference - b.behavior.groupPreference),
      Math.abs(a.behavior.routinePreference - b.behavior.routinePreference)
    ];
    return clamp(1 - deltas.reduce((x, y) => x + y, 0) / deltas.length);
  }
  const routineTarget = b.cadenceType === "WEEKLY" ? 0.9 : b.cadenceType === "BIWEEKLY" ? 0.6 : 0.4;
  const groupTarget = clamp(b.groupSize / 16);
  return clamp(1 - (Math.abs(a.behavior.routinePreference - routineTarget) + Math.abs(a.behavior.groupPreference - groupTarget)) / 2);
}

function preferenceFit(a: LoadedUser, b: LoadedUser | Circle) {
  if (!a.matchingPref) return 0.5;
  if ("profile" in b) {
    const verifiedOk = !a.matchingPref.verifiedOnly || b.profile?.verificationLevel === "VERIFIED";
    return verifiedOk ? 0.9 : 0.2;
  }
  const sizeFit = clamp(1 - Math.abs(a.matchingPref.preferredGroupSize - b.groupSize) / 20);
  const mentorFit = a.matchingPref.mentorLedPreference === b.mentorLed ? 1 : 0.5;
  return clamp((sizeFit + mentorFit) / 2);
}

function locationFit(a: LoadedUser, city: string, locality: string) {
  if (a.profile?.city !== city) return 0;
  return invDistance(a.profile.locality, locality);
}

function reasonFromTop(scores: Record<string, number>) {
  return Object.entries(scores)
    .sort((x, y) => y[1] - x[1])
    .slice(0, 3)
    .map(([k]) => {
      if (k === "activity") return "Same activity interests";
      if (k === "time") return "Similar availability";
      if (k === "location") return "Near your area";
      if (k === "behavior") return "Compatible style";
      if (k === "preference") return "Preference fit";
      if (k === "attendance") return "Likely to attend consistently";
      if (k === "circle") return "Strong affinity with this circle";
      return "Good overall fit";
    });
}

export async function recomputeForUser(userId: string) {
  const users = await prisma.user.findMany({
    include: { profile: true, activityPrefs: true, timePrefs: true, behavior: true, matchingPref: true, reliability: true }
  }) as LoadedUser[];
  const me = users.find((u) => u.id === userId);
  if (!me || !me.profile) return;

  const circles = await prisma.circle.findMany({ include: { activity: true } });
  const events = await prisma.event.findMany({ include: { circle: { include: { activity: true } }, participants: true } });

  await prisma.$transaction([
    prisma.userMatchRecommendation.deleteMany({ where: { userId } }),
    prisma.userCircleRecommendation.deleteMany({ where: { userId } }),
    prisma.userEventRecommendation.deleteMany({ where: { userId } })
  ]);

  const matchRows = users
    .filter((u) => u.id !== userId && u.profile?.city === me.profile.city)
    .map((u) => {
      const factors = {
        activity: activitySimilarity(me, u),
        location: locationFit(me, u.profile!.city, u.profile!.locality),
        time: timeOverlap(me, u),
        behavior: behaviorCompatibility(me, u),
        preference: preferenceFit(me, u)
      };
      const score = 0.25 * factors.activity + 0.2 * factors.location + 0.2 * factors.time + 0.15 * factors.behavior + 0.2 * factors.preference;
      return { targetId: u.id, score, factors };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  const circleRows = circles
    .filter((c) => c.city === me.profile!.city)
    .map((c) => {
      const myInterest = me.activityPrefs.find((p) => p.activityId === c.activityId)?.interestScore ?? 0;
      const factors = {
        activity: myInterest,
        time: timeOverlap(me, { timeBand: c.timeBand }),
        location: locationFit(me, c.city, c.locality),
        behavior: behaviorCompatibility(me, c),
        preference: preferenceFit(me, c)
      };
      const score = 0.3 * factors.activity + 0.2 * factors.time + 0.15 * factors.location + 0.15 * factors.behavior + 0.2 * factors.preference;
      return { targetId: c.id, score, factors };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const eventRows = events
    .filter((e) => e.circle.city === me.profile!.city)
    .map((e) => {
      const circleAffinity = circleRows.find((c) => c.targetId === e.circleId)?.score ?? 0.3;
      const attendance = me.reliability?.attendanceRate ?? 0.7;
      const myInterest = me.activityPrefs.find((p) => p.activityId === e.circle.activityId)?.interestScore ?? 0;
      const factors = {
        circle: circleAffinity,
        time: timeOverlap(me, { timeBand: e.circle.timeBand }),
        location: locationFit(me, e.circle.city, e.circle.locality),
        attendance,
        activity: myInterest
      };
      const score = 0.25 * factors.circle + 0.2 * factors.time + 0.2 * factors.location + 0.15 * factors.attendance + 0.2 * factors.activity;
      return { targetId: e.id, score, factors };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

  await prisma.$transaction([
    prisma.userMatchRecommendation.createMany({
      data: matchRows.map((r) => ({ userId, targetId: r.targetId, score: r.score, reasonsJson: { factors: r.factors, reasons: reasonFromTop(r.factors) } }))
    }),
    prisma.userCircleRecommendation.createMany({
      data: circleRows.map((r) => ({ userId, targetId: r.targetId, score: r.score, reasonsJson: { factors: r.factors, reasons: reasonFromTop(r.factors) } }))
    }),
    prisma.userEventRecommendation.createMany({
      data: eventRows.map((r) => ({ userId, targetId: r.targetId, score: r.score, reasonsJson: { factors: r.factors, reasons: reasonFromTop(r.factors) } }))
    })
  ]);
}

export async function recomputeAllRecommendations() {
  const users = await prisma.user.findMany({ select: { id: true } });
  for (const u of users) {
    await recomputeForUser(u.id);
  }
}
