export type IntentMode =
  | "sports"
  | "social"
  | "corporate"
  | "creator"
  | "travel"
  | "dating";

export type ActivityTag =
  | "badminton"
  | "running"
  | "chess"
  | "yoga"
  | "football"
  | "creator walks"
  | "coffee chats";

export type ScheduleTag =
  | "weekday-morning"
  | "weekday-evening"
  | "weekend-morning"
  | "weekend-evening";

export type RecommendationTone = "highlight" | "positive" | "neutral";

export interface RecommendationReason {
  label: string;
  tone: RecommendationTone;
}

export interface BehaviorProfile {
  plannerScore: number;
  competitivenessScore: number;
  consistencyScore: number;
  groupSizePreference: number;
}

export interface UserProfile {
  id: string;
  name: string;
  profession: string;
  bio: string;
  ageBand: string;
  intentModes: IntentMode[];
  activities: ActivityTag[];
  schedulePreferences: ScheduleTag[];
  location: {
    city: string;
    locality: string;
  };
  preferences: {
    partnerPreference: "peer-led" | "mentor-led" | "mixed";
    verifiedOnly: boolean;
    maxDistanceKm: number;
  };
  behavior: BehaviorProfile;
  reliability: {
    attendanceRate: number;
    noShowRate: number;
  };
}

export interface CircleMember {
  id: string;
  name: string;
  profession: string;
}

export interface Circle {
  id: string;
  name: string;
  activityTags: ActivityTag[];
  intentModes: IntentMode[];
  description: string;
  mentorLed: boolean;
  schedule: ScheduleTag[];
  location: {
    city: string;
    locality: string;
  };
  members: CircleMember[];
  health: {
    activeMembersCount: number;
    avgAttendanceRate30d: number;
    repeatAttendanceRate30d: number;
  };
}

export interface Event {
  id: string;
  circleId: string;
  title: string;
  description: string;
  activityTags: ActivityTag[];
  scheduleTags: ScheduleTag[];
  location: {
    city: string;
    locality: string;
    venue: string;
  };
  startsAt: string;
  capacity: number;
  attendeesGoingCount: number;
}

export interface Recommendation<T> {
  entity: T;
  score: number;
  reasons: RecommendationReason[];
}
