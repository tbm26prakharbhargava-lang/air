import { seedCircles, seedEvents, seedUsers } from "@/lib/data/seed";
import type {
  Circle,
  Event,
  Recommendation,
  RecommendationReason,
  UserProfile,
} from "@/lib/matching/types";

const normalize = (value: number) => Math.max(0, Math.min(1, value));

const jaccard = (left: string[], right: string[]) => {
  const a = new Set(left.map((value) => value.toLowerCase()));
  const b = new Set(right.map((value) => value.toLowerCase()));

  const intersection = [...a].filter((value) => b.has(value)).length;
  const union = new Set([...a, ...b]).size;

  return union === 0 ? 0 : intersection / union;
};

const scoreSchedule = (left: string[], right: string[]) => jaccard(left, right);
const scoreActivity = (left: string[], right: string[]) => jaccard(left, right);

const scoreBehavior = (user: UserProfile, target: Circle | UserProfile) => {
  const targetBehavior = "behavior" in target ? target.behavior : user.behavior;

  const planner = 1 - Math.abs(user.behavior.plannerScore - targetBehavior.plannerScore);
  const competitive =
    1 - Math.abs(user.behavior.competitivenessScore - targetBehavior.competitivenessScore);
  const consistency =
    1 - Math.abs(user.behavior.consistencyScore - targetBehavior.consistencyScore);
  const group =
    1 - Math.abs(user.behavior.groupSizePreference - targetBehavior.groupSizePreference);

  return normalize((planner + competitive + consistency + group) / 4);
};

const scoreLocation = (
  user: UserProfile,
  target: { location: { city: string; locality: string } },
) => {
  if (user.location.city !== target.location.city) return 0;
  if (user.location.locality === target.location.locality) return 1;
  return 0.75;
};

const scorePartnerType = (user: UserProfile, circle: Circle) => {
  if (circle.mentorLed && user.preferences.partnerPreference === "peer-led") return 0.3;
  if (!circle.mentorLed && user.preferences.partnerPreference === "mentor-led") return 0.4;
  return 1;
};

const scoreReliabilityAlignment = (user: UserProfile, circle: Circle) => {
  return 1 - Math.abs(user.reliability.attendanceRate - circle.health.avgAttendanceRate30d);
};

const scoreCircleHealth = (circle: Circle) =>
  normalize(
    circle.health.avgAttendanceRate30d * 0.5 +
      circle.health.repeatAttendanceRate30d * 0.3 +
      (circle.health.activeMembersCount / 20) * 0.2,
  );

const buildCircleReasons = (user: UserProfile, circle: Circle): RecommendationReason[] => {
  const reasons: RecommendationReason[] = [];

  const sharedActivity = user.activities.find((activity) => circle.activityTags.includes(activity));
  if (sharedActivity) {
    reasons.push({
      label: `Shared ${sharedActivity.toLowerCase()} interest`,
      tone: "highlight",
    });
  }

  if (circle.location.locality === user.location.locality) {
    reasons.push({
      label: `Near ${user.location.locality}`,
      tone: "neutral",
    });
  }

  const sharedSchedule = user.schedulePreferences.find((slot) => circle.schedule.includes(slot));
  if (sharedSchedule) {
    reasons.push({
      label: `Matches your ${sharedSchedule.toLowerCase()} routine`,
      tone: "positive",
    });
  }

  if (circle.mentorLed) {
    reasons.push({
      label: "Mentor-led structure",
      tone: "positive",
    });
  }

  if (circle.health.avgAttendanceRate30d > 0.8) {
    reasons.push({
      label: "Strong attendance reliability",
      tone: "positive",
    });
  }

  return reasons.slice(0, 3);
};

const buildEventReasons = (
  user: UserProfile,
  event: Event,
  circle?: Circle,
): RecommendationReason[] => {
  const reasons: RecommendationReason[] = [];

  if (circle) {
    reasons.push({
      label: `From ${circle.name}`,
      tone: "highlight",
    });
  }

  if (event.attendeesGoingCount > 4) {
    reasons.push({
      label: `${event.attendeesGoingCount} people already confirmed`,
      tone: "positive",
    });
  }

  const sharedSchedule = user.schedulePreferences.find((slot) =>
    event.scheduleTags.includes(slot),
  );
  if (sharedSchedule) {
    reasons.push({
      label: `Fits your ${sharedSchedule.toLowerCase()} availability`,
      tone: "neutral",
    });
  }

  if (event.location.locality === user.location.locality) {
    reasons.push({
      label: `Close to ${user.location.locality}`,
      tone: "neutral",
    });
  }

  return reasons.slice(0, 3);
};

const buildPeopleReasons = (
  user: UserProfile,
  person: UserProfile,
): RecommendationReason[] => {
  const reasons: RecommendationReason[] = [];

  const sharedActivity = user.activities.find((activity) => person.activities.includes(activity));
  if (sharedActivity) {
    reasons.push({
      label: `Both prefer ${sharedActivity.toLowerCase()}`,
      tone: "highlight",
    });
  }

  if (person.location.locality === user.location.locality) {
    reasons.push({
      label: `Also based around ${user.location.locality}`,
      tone: "neutral",
    });
  }

  const sharedTime = user.schedulePreferences.find((slot) =>
    person.schedulePreferences.includes(slot),
  );
  if (sharedTime) {
    reasons.push({
      label: `Same ${sharedTime.toLowerCase()} cadence`,
      tone: "positive",
    });
  }

  if (Math.abs(user.reliability.attendanceRate - person.reliability.attendanceRate) < 0.12) {
    reasons.push({
      label: "Similar reliability level",
      tone: "positive",
    });
  }

  return reasons.slice(0, 3);
};

export const rankCirclesForUser = (
  user: UserProfile,
  circles: Circle[],
): Recommendation<Circle>[] => {
  return circles
    .map((circle) => {
      const activityMatch = scoreActivity(user.activities, circle.activityTags);
      const scheduleMatch = scoreSchedule(user.schedulePreferences, circle.schedule);
      const locationFit = scoreLocation(user, circle);
      const behaviorFit = scoreBehavior(user, circle);
      const circleHealth = scoreCircleHealth(circle);
      const partnerFit = scorePartnerType(user, circle);
      const reliabilityAlignment = scoreReliabilityAlignment(user, circle);

      const score = normalize(
        activityMatch * 0.3 +
          scheduleMatch * 0.2 +
          locationFit * 0.15 +
          behaviorFit * 0.15 +
          circleHealth * 0.1 +
          partnerFit * 0.05 +
          reliabilityAlignment * 0.05,
      );

      return {
        score,
        entity: circle,
        reasons: buildCircleReasons(user, circle),
      };
    })
    .sort((a, b) => b.score - a.score);
};

export const rankEventsForUser = (
  user: UserProfile,
  events: Event[],
  circles: Circle[],
): Recommendation<Event>[] => {
  return events
    .map((event) => {
      const parentCircle = circles.find((circle) => circle.id === event.circleId);
      const circleAffinity = parentCircle
        ? scoreActivity(user.activities, parentCircle.activityTags)
        : scoreActivity(user.activities, event.activityTags);
      const timingFit = scoreSchedule(user.schedulePreferences, event.scheduleTags);
      const locationFit = scoreLocation(user, event);
      const eventTypeAffinity = scoreActivity(user.activities, event.activityTags);
      const attendanceLikelihood =
        user.reliability.attendanceRate * 0.5 + (event.attendeesGoingCount / event.capacity) * 0.5;
      const socialProof =
        parentCircle &&
        parentCircle.members.some((member) => member.profession === user.profession)
          ? 0.85
          : 0.55;

      const score = normalize(
        circleAffinity * 0.25 +
          timingFit * 0.2 +
          locationFit * 0.15 +
          socialProof * 0.15 +
          eventTypeAffinity * 0.1 +
          attendanceLikelihood * 0.15,
      );

      return {
        score,
        entity: event,
        reasons: buildEventReasons(user, event, parentCircle),
      };
    })
    .sort((a, b) => b.score - a.score);
};

export const rankPeopleForUser = (
  user: UserProfile,
  people: UserProfile[],
): Recommendation<UserProfile>[] => {
  return people
    .filter((person) => person.id !== user.id)
    .map((person) => {
      const activitySimilarity = scoreActivity(user.activities, person.activities);
      const scheduleOverlap = scoreSchedule(user.schedulePreferences, person.schedulePreferences);
      const locationProximity = scoreLocation(user, person);
      const behaviorSimilarity = scoreBehavior(user, person);
      const reliabilitySimilarity =
        1 - Math.abs(user.reliability.attendanceRate - person.reliability.attendanceRate);
      const preferenceFit =
        person.preferences.partnerPreference === user.preferences.partnerPreference ? 0.9 : 0.7;
      const intentAlignment = scoreActivity(user.intentModes, person.intentModes);

      const score = normalize(
        activitySimilarity * 0.2 +
          scheduleOverlap * 0.2 +
          locationProximity * 0.15 +
          behaviorSimilarity * 0.15 +
          reliabilitySimilarity * 0.1 +
          preferenceFit * 0.1 +
          intentAlignment * 0.1,
      );

      return {
        score,
        entity: person,
        reasons: buildPeopleReasons(user, person),
      };
    })
    .sort((a, b) => b.score - a.score);
};

export const recommendCirclesForUser = (
  user: UserProfile = seedUsers[0],
  circles: Circle[] = seedCircles,
) => rankCirclesForUser(user, circles).map((item) => ({ ...item, circle: item.entity }));

export const recommendEventsForUser = (
  user: UserProfile = seedUsers[0],
  circles: Circle[] = seedCircles,
  events: Event[] = seedEvents,
) => rankEventsForUser(user, events, circles).map((item) => ({ ...item, event: item.entity }));

export const recommendPeopleForUser = (
  user: UserProfile = seedUsers[0],
  people: UserProfile[] = seedUsers,
) => rankPeopleForUser(user, people).map((item) => ({ ...item, person: item.entity }));
