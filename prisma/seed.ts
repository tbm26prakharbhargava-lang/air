import { PrismaClient, CadenceType, CircleType, TimeBand, VerificationLevel } from "@prisma/client";
import { recomputeAllRecommendations } from "../services/matching";

const prisma = new PrismaClient();

const activities = [
  ["badminton", "Badminton", "sports"],
  ["running", "Running", "sports"],
  ["chess", "Chess", "sports"],
  ["yoga", "Yoga", "sports"],
  ["photography", "Photography", "creators"],
  ["product-meetups", "Product Meetups", "corporate"],
  ["finance-meetups", "Finance Meetups", "corporate"],
  ["marketing-meetups", "Marketing Meetups", "corporate"],
  ["content-creation", "Content Creation", "creators"]
] as const;

const localities = ["DLF Phase 1", "DLF Phase 2", "DLF Phase 3", "Golf Course Road", "Sushant Lok", "Sector 29", "Sector 45", "Sohna Road"];
const names = ["Aarav", "Isha", "Rohan", "Naina", "Kabir", "Megha", "Dev", "Ananya", "Vihaan", "Priya", "Arjun", "Sana", "Karan", "Riya", "Yash", "Tara", "Aditya", "Neha", "Manav", "Simran", "Rahul", "Pooja", "Nikhil", "Aisha", "Ira", "Sid"];

async function main() {
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.circleMember.deleteMany();
  await prisma.circle.deleteMany();
  await prisma.userEventRecommendation.deleteMany();
  await prisma.userCircleRecommendation.deleteMany();
  await prisma.userMatchRecommendation.deleteMany();
  await prisma.userActivityPreference.deleteMany();
  await prisma.userTimePreference.deleteMany();
  await prisma.userBehaviorProfile.deleteMany();
  await prisma.userMatchingPreference.deleteMany();
  await prisma.userReliabilityMetric.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.activity.deleteMany();

  const activityMap = new Map<string, string>();
  for (const [slug, name, category] of activities) {
    const a = await prisma.activity.create({ data: { slug, name, category } });
    activityMap.set(slug, a.id);
  }

  const users: string[] = [];
  for (let i = 0; i < 26; i++) {
    const name = names[i % names.length];
    const email = i === 0 ? "you@circles.app" : `${name.toLowerCase()}${i}@circles.app`;
    const u = await prisma.user.create({ data: { email } });
    users.push(u.id);
    await prisma.profile.create({ data: {
      userId: u.id, name: i === 0 ? "You" : `${name} ${i}`,
      city: "Gurgaon", locality: localities[i % localities.length],
      bio: "Building routines through circles", profession: i % 3 === 0 ? "Product" : i % 3 === 1 ? "Marketing" : "Creator",
      verificationLevel: i % 4 === 0 ? VerificationLevel.VERIFIED : VerificationLevel.BASIC,
      primaryIntent: i % 3 === 0 ? "CORPORATE" : i % 3 === 1 ? "SPORTS" : "CREATORS"
    }});
    await prisma.userBehaviorProfile.create({ data: {
      userId: u.id, seriousness: (i % 10) / 10, planningStyle: ((i + 3) % 10) / 10,
      groupPreference: ((i + 5) % 10) / 10, routinePreference: ((i + 7) % 10) / 10
    }});
    await prisma.userMatchingPreference.create({ data: {
      userId: u.id, preferredGroupSize: 4 + (i % 8), verifiedOnly: i % 5 === 0,
      beginnerFriendly: i % 2 === 0, mentorLedPreference: i % 4 === 0, maxDistanceKm: 4 + (i % 8)
    }});
    await prisma.userReliabilityMetric.create({ data: {
      userId: u.id, eventsJoined: 4 + (i % 6), eventsAttended: 3 + (i % 6), noShowCount: i % 2,
      attendanceRate: 0.65 + ((i % 4) * 0.08)
    }});

    for (const [index, [slug]] of activities.entries()) {
      const score = ((i + index) % 7) / 6;
      if (score > 0.45 || (i === 0 && ["badminton", "running", "content-creation"].includes(slug))) {
        await prisma.userActivityPreference.create({ data: {
          userId: u.id, activityId: activityMap.get(slug)!, interestScore: score || 0.7,
          skillLevel: score > 0.8 ? "ADVANCED" : score > 0.6 ? "INTERMEDIATE" : "BEGINNER"
        }});
      }
    }
    for (const band of [TimeBand.MORNINGS, TimeBand.EVENINGS, TimeBand.WEEKENDS, TimeBand.WEEKDAYS]) {
      await prisma.userTimePreference.create({ data: {
        userId: u.id, timeBand: band,
        preferenceScore: band === TimeBand.EVENINGS ? 0.9 - (i % 3) * 0.2 : band === TimeBand.WEEKENDS ? 0.8 : 0.5
      }});
    }
  }

  const circleDefs = [
    ["Gurgaon Smash League", "badminton", "DLF Phase 2", CircleType.SPORTS, TimeBand.EVENINGS],
    ["Sector 29 Runners", "running", "Sector 29", CircleType.SPORTS, TimeBand.MORNINGS],
    ["Weekend Chess Commons", "chess", "Sushant Lok", CircleType.SPORTS, TimeBand.WEEKENDS],
    ["Sunrise Yoga Pod", "yoga", "Golf Course Road", CircleType.SPORTS, TimeBand.MORNINGS],
    ["Product Leaders Gurgaon", "product-meetups", "DLF Phase 3", CircleType.CORPORATE, TimeBand.WEEKDAYS],
    ["Finance After Hours", "finance-meetups", "Sohna Road", CircleType.CORPORATE, TimeBand.EVENINGS],
    ["Marketing Mixers Circle", "marketing-meetups", "Sector 45", CircleType.CORPORATE, TimeBand.WEEKDAYS],
    ["Creator Camera Walks", "photography", "DLF Phase 1", CircleType.CREATORS, TimeBand.WEEKENDS],
    ["Content Sprint Circle", "content-creation", "Golf Course Road", CircleType.CREATORS, TimeBand.EVENINGS]
  ] as const;

  const circles: string[] = [];
  for (let i = 0; i < circleDefs.length; i++) {
    const [name, slug, locality, type, timeBand] = circleDefs[i];
    const circle = await prisma.circle.create({ data: {
      name, city: "Gurgaon", locality, activityId: activityMap.get(slug)!, cadenceType: i % 2 ? CadenceType.WEEKLY : CadenceType.BIWEEKLY,
      timeBand, circleType: type, createdBy: users[i], groupSize: 6 + (i % 6), mentorLed: i % 3 === 0
    }});
    circles.push(circle.id);
  }

  for (let i = 0; i < users.length; i++) {
    await prisma.circleMember.create({ data: { userId: users[i], circleId: circles[i % circles.length], membershipStatus: "ACTIVE" } });
  }

  for (let i = 0; i < 14; i++) {
    const circleId = circles[i % circles.length];
    const event = await prisma.event.create({ data: {
      circleId,
      title: `Session ${i + 1} - ${i % 2 ? "Ritual" : "Community"}`,
      locationName: `${localities[i % localities.length]}, Gurgaon`,
      startTime: new Date(Date.now() + (i + 1) * 86400000),
      capacity: 16,
      createdBy: users[i % users.length],
      status: "SCHEDULED"
    }});
    await prisma.eventParticipant.create({ data: { eventId: event.id, userId: users[i % users.length], rsvpStatus: "GOING" } });
  }

  await recomputeAllRecommendations();
  console.log("Seeded Circles MVP data.");
}

main().finally(async () => prisma.$disconnect());
