# Circles MVP

Location-first hobby and community matching app (Gurgaon launch).

## Stack
- Next.js 14 + TypeScript + Tailwind
- Prisma ORM + Postgres

## Features
- Onboarding with city/locality/radius/intents/activities/time/behavior/preferences
- Weighted recommendation engine across 5 factors
- People, circle, and event recommendations with explainable reasons
- Circles + events + RSVP loop
- Reliability metrics snapshot
- Debug recommendation inspector (`/debug`)

## Data Model
Main Prisma models:
`users`, `profiles`, `activities`, `user_activity_preferences`, `user_time_preferences`, `user_behavior_profile`, `user_matching_preferences`, `circles`, `circle_members`, `events`, `event_participants`, `user_match_recommendations`, `user_circle_recommendations`, `user_event_recommendations`, `user_reliability_metrics`.

## Recommendation Weights
- User↔User = 0.25 activity + 0.20 location + 0.20 time + 0.15 behavior + 0.20 preference
- User↔Circle = 0.30 activity + 0.20 time + 0.15 location + 0.15 behavior + 0.20 preference
- User↔Event = 0.25 circle affinity + 0.20 time + 0.20 location + 0.15 attendance likelihood + 0.20 activity

## Setup
1. Create `.env`:
   ```bash
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/circles"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate client and push schema:
   ```bash
   npm run db:generate
   npm run db:push
   ```
4. Seed data:
   ```bash
   npm run db:seed
   ```
5. Run app:
   ```bash
   npm run dev
   ```

Open:
- `/` welcome
- `/onboarding`
- `/home`
- `/circles`, `/events`, `/matches`, `/profile`
- `/debug` + `/api/debug/recommendations`

## Utility Commands
- Recompute all recommendations:
  ```bash
  npm run recompute:recommendations
  ```
