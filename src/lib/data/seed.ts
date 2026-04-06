import { Circle, Event, UserProfile } from "@/lib/matching/types";

export const seedUsers: UserProfile[] = [
  {
    id: "user-prakhar",
    name: "Prakhar",
    ageBand: "25-34",
    profession: "Founder / Product",
    bio: "Looking for reliable weekly circles around sports, creators, and thoughtful professional communities.",
    location: {
      city: "Gurgaon",
      locality: "Sector 43",
    },
    intentModes: ["sports", "corporate", "creator"],
    activities: ["badminton", "running", "chess", "creator walks"],
    schedulePreferences: ["weekday-evening", "weekend-morning"],
    behavior: {
      plannerScore: 0.82,
      competitivenessScore: 0.58,
      consistencyScore: 0.92,
      groupSizePreference: 0.25,
    },
    preferences: {
      partnerPreference: "peer-led",
      maxDistanceKm: 8,
      verifiedOnly: false,
    },
    reliability: {
      attendanceRate: 0.91,
      noShowRate: 0.04,
    },
  },
  {
    id: "user-rahul",
    name: "Rahul",
    ageBand: "25-34",
    profession: "Staff Product Manager",
    bio: "Prefers structured evening routines, high-signal people, and circles that actually meet repeatedly.",
    location: {
      city: "Gurgaon",
      locality: "Sector 56",
    },
    intentModes: ["sports", "corporate"],
    activities: ["badminton", "chess", "running"],
    schedulePreferences: ["weekday-evening"],
    behavior: {
      plannerScore: 0.76,
      competitivenessScore: 0.66,
      consistencyScore: 0.88,
      groupSizePreference: 0.28,
    },
    preferences: {
      partnerPreference: "peer-led",
      maxDistanceKm: 8,
      verifiedOnly: false,
    },
    reliability: {
      attendanceRate: 0.93,
      noShowRate: 0.03,
    },
  },
  {
    id: "user-ayesha",
    name: "Ayesha",
    ageBand: "25-34",
    profession: "Content Creator",
    bio: "Wants creator collaborators nearby for recurring walks, shoots, and low-flake social energy.",
    location: {
      city: "Gurgaon",
      locality: "DLF Phase 4",
    },
    intentModes: ["creator", "social"],
    activities: ["creator walks", "running", "coffee chats"],
    schedulePreferences: ["weekend-morning", "weekend-evening"],
    behavior: {
      plannerScore: 0.71,
      competitivenessScore: 0.31,
      consistencyScore: 0.75,
      groupSizePreference: 0.34,
    },
    preferences: {
      partnerPreference: "peer-led",
      maxDistanceKm: 10,
      verifiedOnly: false,
    },
    reliability: {
      attendanceRate: 0.86,
      noShowRate: 0.08,
    },
  },
  {
    id: "user-neel",
    name: "Neel",
    ageBand: "25-34",
    profession: "Founder",
    bio: "Uses hobbies to build real-world rhythm, health, and strong local founder relationships.",
    location: {
      city: "Gurgaon",
      locality: "Sector 43",
    },
    intentModes: ["sports", "corporate"],
    activities: ["running", "badminton"],
    schedulePreferences: ["weekend-morning", "weekday-evening"],
    behavior: {
      plannerScore: 0.84,
      competitivenessScore: 0.57,
      consistencyScore: 0.82,
      groupSizePreference: 0.22,
    },
    preferences: {
      partnerPreference: "peer-led",
      maxDistanceKm: 8,
      verifiedOnly: false,
    },
    reliability: {
      attendanceRate: 0.89,
      noShowRate: 0.05,
    },
  },
];

export const seedCircles: Circle[] = [
  {
    id: "circle-1",
    name: "Gurgaon PM Badminton",
    intentModes: ["sports", "corporate"],
    location: {
      city: "Gurgaon",
      locality: "Sector 43",
    },
    activityTags: ["badminton"],
    schedule: ["weekday-evening"],
    mentorLed: false,
    description:
      "A weekly badminton ritual for product, startup, and tech folks who actually show up.",
    health: {
      activeMembersCount: 14,
      avgAttendanceRate30d: 0.87,
      repeatAttendanceRate30d: 0.76,
    },
    members: [seedUsers[0], seedUsers[1], seedUsers[3]],
  },
  {
    id: "circle-2",
    name: "Golf Course Road Run Club",
    intentModes: ["sports", "social"],
    location: {
      city: "Gurgaon",
      locality: "Golf Course Road",
    },
    activityTags: ["running"],
    schedule: ["weekend-morning"],
    mentorLed: false,
    description:
      "A consistent weekend run with warm intros, accountability, and post-run coffee.",
    health: {
      activeMembersCount: 18,
      avgAttendanceRate30d: 0.78,
      repeatAttendanceRate30d: 0.69,
    },
    members: [seedUsers[0], seedUsers[2], seedUsers[3]],
  },
  {
    id: "circle-3",
    name: "Chess Thinkers Night",
    intentModes: ["sports", "corporate"],
    location: {
      city: "Gurgaon",
      locality: "Sector 56",
    },
    activityTags: ["chess"],
    schedule: ["weekday-evening"],
    mentorLed: true,
    description:
      "A small-format chess circle with startup operators, creators, and strategic thinkers.",
    health: {
      activeMembersCount: 11,
      avgAttendanceRate30d: 0.9,
      repeatAttendanceRate30d: 0.82,
    },
    members: [seedUsers[0], seedUsers[1]],
  },
  {
    id: "circle-4",
    name: "Creator Walks Gurgaon",
    intentModes: ["creator", "social"],
    location: {
      city: "Gurgaon",
      locality: "DLF Phase 4",
    },
    activityTags: ["creator walks"],
    schedule: ["weekend-morning"],
    mentorLed: false,
    description:
      "For creators who want real collaborators, not flaky DMs and vague plans.",
    health: {
      activeMembersCount: 17,
      avgAttendanceRate30d: 0.72,
      repeatAttendanceRate30d: 0.63,
    },
    members: [seedUsers[0], seedUsers[2]],
  },
];

export const seedEvents: Event[] = [
  {
    id: "event-1",
    circleId: "circle-1",
    title: "Wednesday Badminton Ritual",
    description: "Small-format games with reliable weekly players and quick intros for newcomers.",
    location: {
      city: "Gurgaon",
      locality: "Sector 43",
      venue: "Sector 43 Indoor Court",
    },
    activityTags: ["badminton"],
    scheduleTags: ["weekday-evening"],
    startsAt: "Wed 7:00 PM",
    attendeesGoingCount: 6,
    capacity: 8,
  },
  {
    id: "event-2",
    circleId: "circle-2",
    title: "Saturday Sunrise 5K + Coffee",
    description: "An easy-paced accountability run followed by coffee and warm intros.",
    location: {
      city: "Gurgaon",
      locality: "Golf Course Road",
      venue: "Metro Gate 2",
    },
    activityTags: ["running", "coffee chats"],
    scheduleTags: ["weekend-morning"],
    startsAt: "Sat 6:45 AM",
    attendeesGoingCount: 14,
    capacity: 24,
  },
  {
    id: "event-3",
    circleId: "circle-3",
    title: "Friday Chess and Strategy Night",
    description: "High-trust chess tables plus founder and operator conversation after the session.",
    location: {
      city: "Gurgaon",
      locality: "Sector 56",
      venue: "Cafe Lab",
    },
    activityTags: ["chess"],
    scheduleTags: ["weekday-evening"],
    startsAt: "Fri 8:30 PM",
    attendeesGoingCount: 7,
    capacity: 10,
  },
  {
    id: "event-4",
    circleId: "circle-4",
    title: "Sunday Creator Photo Walk",
    description: "Shoot, collaborate, and review edits with local creators who prefer repeat sessions.",
    location: {
      city: "Gurgaon",
      locality: "DLF Phase 4",
      venue: "Cyber Hub Walkway",
    },
    activityTags: ["creator walks"],
    scheduleTags: ["weekend-morning"],
    startsAt: "Sun 9:00 AM",
    attendeesGoingCount: 9,
    capacity: 16,
  },
];

