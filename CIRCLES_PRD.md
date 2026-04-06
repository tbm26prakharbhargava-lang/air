# Circles Product Requirements Document

**Product:** Circles  
**Document Type:** Product Requirements Document  
**Status:** Draft v1  
**Authoring Context:** Consolidated from founder ideation, market framing, user empathy analysis, STP segmentation, UX direction, and AI-native operating model  
**Last Updated:** 2026-03-28  

---

## 1. Executive Summary

### 1.1 One-line Product Definition
Circles is an AI-native, location-first community platform that matches people into small, trusted circles and recommends the right offline events, people, and groups based on activities, interests, behavior, schedule, and preferences.

### 1.2 TL;DR
Urban users struggle to consistently do things they enjoy with the right people nearby. Existing products solve fragments of this problem:

- social networks solve visibility but not depth
- dating apps solve attraction but not shared context
- event platforms solve listings but not continuity
- WhatsApp solves coordination but not discovery, trust, or governance

Circles is designed to solve:

> "I want to reliably do things I enjoy with the right people nearby, without awkwardness, chaos, or endless scrolling."

The core product system is:

**User -> Circle -> Event -> Repeat -> Identity -> Belonging**

The product is **not** a feed-first social network or a pure dating app. It is a **community operating system** with an AI moderation and governance layer.

### 1.3 Product Thesis
People do not want more content or more random people. They want:

- shared activities
- repeated interaction
- compatible people
- reliable coordination
- low-friction belonging

### 1.4 MVP Thesis
For MVP, Circles should focus on a high-density, low-ambiguity wedge:

- **launch city:** Gurgaon
- **primary segments:** professionals, hobby seekers, creators
- **hero use cases:** sports and hobby circles, corporate clubs, creator circles
- **hero activities:** badminton, running, chess

Travel and dating remain important future intent layers, but they should not define the first version of the product.

---

## 1A. Document Purpose and Operating Assumptions

### 1A.1 Purpose of This PRD
This document is intended to align founders, design, engineering, community operations, and GTM on:

- what problem Circles is solving
- who the MVP is for
- what features must exist in version one
- what should be explicitly deferred
- what metrics determine whether the product is working

### 1A.2 Key Assumptions
- Users prefer context-rich community formation over random social discovery.
- Location is the strongest initial filter for relevance.
- Activities are the safest and most natural bridge for new relationships.
- Reliability and continuity drive retention more than novelty.
- AI creates differentiated product value only when it acts as an operator, not a decorative chatbot.

### 1A.3 Product Constraints
- Hyperlocal density matters more than broad geographic coverage.
- Safety and moderation complexity rise sharply when age bands, open messaging, and romantic ambiguity are mixed.
- Offline products fail quickly if first experiences are unreliable.

---

## 2. Problem Statement

### 2.1 Core Problem
Urban life creates high population density but low meaningful connection density. Users have many channels to consume content and weak channels to build recurring real-world routines with the right people.

### 2.2 User Pain Points

| Pain Point | Description |
|---|---|
| Coordination chaos | Plans break because of no-shows, flaky intent, or poor scheduling |
| Social friction | Meeting strangers repeatedly is awkward and emotionally expensive |
| Discovery overload | Users face too many irrelevant events, groups, and profiles |
| Fragmented tools | Instagram, WhatsApp, event platforms, and clubs are disconnected |
| Weak trust layer | Safety, seriousness, and compatibility are hard to assess upfront |
| One-off participation | Most communities fail to convert discovery into habit |

### 2.3 Jobs to Be Done

#### Functional Jobs
- Find compatible people to do an activity with
- Find a relevant circle nearby
- Join a reliable event without excessive back-and-forth
- Recreate the same routine next week with less effort

#### Emotional Jobs
- Feel included
- Avoid awkwardness
- Feel confident a plan will actually happen
- Build a sense of identity and continuity

#### Social Jobs
- Belong to something
- Meet people through shared context
- Build friendships, collaborators, peer groups, or romantic possibilities more naturally

---

## 3. Market Context and Strategic Insight

### 3.1 Market Reality
This space is attractive because the underlying problem is real and persistent. It is difficult because:

- retention is structurally hard
- value often escapes to WhatsApp
- trust and safety are critical
- density matters at hyperlocal level
- most products over-index on discovery and under-invest in continuity

### 3.2 Competitive Landscape

#### India
- Playo
- Hudle
- Turf booking and sports communities
- WhatsApp-led hobby communities
- Instagram-led city communities

#### Global
- Meetup
- Bumble BFF
- Strava
- OpenSports
- niche hobby and creator communities

### 3.3 Strategic White Space
Circles wins only if it solves what most others do not:

- small, repeatable circles instead of endless public discovery
- explainable matching instead of opaque randomness
- reliability and attendance as first-class product objects
- AI stewardship instead of manual-only community management
- recommendations that emerge from circles, not generic feeds

---

## 4. Vision, Mission, and Product Principles

### 4.1 Vision
Build the operating system for real-world communities.

### 4.2 Mission
Help people find compatible people nearby and turn activities into recurring circles, trusted routines, and lasting belonging.

### 4.3 Product Principles

1. **Location first**  
   Relevance starts with city, locality, and travel radius.

2. **Activities are the bridge**  
   Shared activities reduce awkwardness and make matching feel natural.

3. **Circles before scale**  
   Small trusted groups outperform large noisy networks.

4. **Repeat over novelty**  
   The goal is not browsing; it is recurring participation.

5. **Attendance over clicks**  
   Optimize for confirmed real-world participation, not vanity metrics.

6. **Explainability over magic**  
   Recommendations should say why they exist.

7. **AI as operator, not gimmick**  
   AI should moderate, recommend, survey, and govern communities.

8. **Trust over growth hacks**  
   Safety, moderation, and reliability are foundational.

---

## 4A. Product Goals and Non-Goals

### 4A.1 Goals
The MVP should:

1. Help users complete onboarding and feel understood quickly.
2. Match users into relevant circles with clear explanations.
3. Convert recommendations into real RSVPs and attendance.
4. Establish recurring event rhythms inside circles.
5. Give hosts and community partners enough tooling to run reliable small communities.
6. Use AI to improve moderation, surveys, scheduling, and governance.

### 4A.2 Non-Goals
The MVP will not try to:

- become a general social media product
- optimize for passive engagement or doom-scroll behavior
- build a mass dating marketplace
- support all ages and all intents equally from day one
- replace WhatsApp completely
- monetize before trust and retention are demonstrated

---

## 5. STP Analysis

### 5.1 Segmentation
Circles operates across multiple segmentation dimensions.

#### By Intent
- sports and hobbies
- social connection
- dating through shared context
- travel partners
- corporate clubs
- creator collaboration

#### By Demographic
- students
- early professionals
- mid-career professionals
- creators and freelancers
- hobby-first users

#### By Behavioral Style
- routine seekers
- explorers
- accountability-driven users
- socially cautious users
- community builders

#### By Situation
- new to city
- changing life stage
- wants healthier routine
- wants better local network
- wants niche peers nearby

### 5.2 Targeting

#### Primary MVP Target
Urban adults in Gurgaon, typically 22-40, who want recurring offline activities and higher-quality people than random public groups provide.

#### Primary Wedges
1. Sports and hobbies
2. Corporate clubs
3. Creator circles

#### Secondary Near-Term Wedges
1. Social circles
2. Travel circles

#### Deferred / Carefully Scoped Wedge
Dating, only as an explicit mode with clear safety and intent boundaries.

### 5.3 Positioning
For urban users who want reliable, repeated, real-world community, Circles is an AI-native community operating system that matches people into the right circles and recommends the right events based on location, activities, behavior, and preferences.

It is **not**:

- a generic social network
- a pure dating app
- a one-off event listing platform
- a chat app with community branding

---

## 6. Personas

### Persona 1: The Routine Builder
- **Name:** Arjun
- **Age:** 29
- **Profession:** Software engineer
- **City Context:** Gurgaon
- **Use Cases:** badminton, running, fitness accountability

**Goals**
- stay active consistently
- find reliable people nearby
- reduce planning overhead

**Pain Points**
- friends are unavailable
- plans collapse
- public groups feel random

**Success Metric**
- attends at least one recurring activity weekly

### Persona 2: The Corporate Community Seeker
- **Name:** Meera
- **Age:** 27
- **Profession:** Product manager
- **Use Cases:** PM run clubs, badminton with peers, coffee circles

**Goals**
- meet thoughtful professionals naturally
- build peer network without awkward networking events
- combine social, wellness, and career growth

**Pain Points**
- LinkedIn is too performative
- networking events feel forced
- hard to find people with shared context and schedule

**Success Metric**
- joins a trusted professional circle and returns repeatedly

### Persona 3: The Creator Collaborator
- **Name:** Ayesha
- **Age:** 25
- **Profession:** Content creator
- **Use Cases:** creator meetups, photo walks, co-shoots, hobby circles

**Goals**
- meet collaborators and like-minded creators nearby
- find reliable partners for shoots or creative sessions
- discover offline creator communities

**Pain Points**
- existing creator groups are fragmented
- collaborators are unreliable
- too much coordination overhead

**Success Metric**
- finds recurring creator circles and collaboration partners

### Persona 4: The Social Explorer
- **Name:** Rahul
- **Age:** 31
- **Profession:** Consultant
- **Use Cases:** hobby circles, meet people, social events

**Goals**
- expand local circle
- meet interesting people through activities
- find plans that actually happen

**Pain Points**
- boredom and isolation in a crowded city
- weak conversion from interest to real plans
- too many unstructured groups

**Success Metric**
- participates in two or more events monthly with repeat faces

### Persona 5: The Future Dating-through-Context User
- **Name:** Sana
- **Age:** 28
- **Profession:** Marketing professional
- **Use Cases:** dating through shared hobbies

**Goals**
- meet people more naturally than on swipe-first apps
- filter for values, vibe, and shared activities

**Pain Points**
- dating app fatigue
- ghosting
- lack of context and comfort

**Success Metric**
- meaningful connections through shared circles rather than endless chat

---

## 7. User Empathy Map

### 7.1 What Users Think
- "I want people nearby who are actually into the same things."
- "I do not want to keep starting from zero every week."
- "I want quality and comfort, not randomness."
- "I want a plan that is likely to happen."

### 7.2 What Users Feel
- lonely in a crowded city
- cautious about strangers
- tired of flaky plans
- hopeful about belonging
- overwhelmed by fragmented tools

### 7.3 What Users Say
- "We should play sometime."
- "We should catch up."
- "Let me know if you find a group."
- "I want to get back into this hobby."

### 7.4 What Users Do Today
- join WhatsApp groups
- follow Instagram communities
- browse public events
- ask existing friends
- give up after low-quality experiences

### 7.5 What Users Need
- relevant discovery
- clear trust signals
- repeat structure
- low coordination cost
- social continuity

---

## 8. Product Scope

### 8.1 Long-Term Product Scope
Circles supports multiple intent layers on one matching engine:

- sports and hobbies
- social connection
- corporate clubs
- creator circles
- travel partners
- dating through shared context

### 8.2 MVP Scope

#### In Scope
- onboarding with structured preference capture
- circle recommendation
- event recommendation
- people recommendation inside circle context
- recurring circles
- RSVP and attendance tracking
- explainable recommendations
- AI moderator and survey flows
- community partner ingestion and outreach ops

#### Out of Scope for MVP
- minors support
- unrestricted direct messaging between strangers
- large public event marketplace
- infinite swipe feed
- pure dating-first product positioning
- advanced monetization

### 8.3 Critical Product Call
The long-term vision can support broader ages and multiple intents, but the MVP should focus on adult users first due to:

- safety and compliance risk
- higher density potential
- clearer willingness to commit
- easier community partnerships

---

## 9. Core Objects

### 9.1 User
A user with identity, location, interests, behavior profile, preferences, and reliability history.

### 9.2 Circle
A small, persistent group defined by:

- location
- activity
- cadence
- rules
- member composition
- host or moderator context

### 9.3 Event
A one-time or recurring participation opportunity inside or adjacent to a circle.

### 9.4 Match
A recommendation output between:

- user and circle
- user and event
- user and user

### 9.5 Community Partner
An external community, host, club, or organizer that can seed circles or events into the network.

---

## 10. Core Use Cases

### 10.1 Sports and Hobby Matching
Find badminton, running, chess, yoga, football, and similar hobby circles nearby.

### 10.2 Corporate Clubs
Find product, tech, finance, consulting, or marketing communities anchored in shared activities.

### 10.3 Creator Circles
Find creator collaborations, co-shoots, meetups, and creative peer circles.

### 10.4 Social Circles
Find people to do cafes, board games, indoor games, open mics, and hobby-led social plans.

### 10.5 Dating Through Shared Context
Optional mode where activity and preference context drive lower-friction introductions.

### 10.6 Travel Circles
Find travel partners or destination-based circles for episodic experiences.

---

## 10A. User Stories

### 10A.1 End User Stories
- As a user new to Gurgaon, I want to quickly find a reliable hobby circle near me so I can build a routine without awkward outreach.
- As a working professional, I want to discover circles that fit my evenings and interests so I can meet people through shared context.
- As a creator, I want to find local collaborators and creator meetups so I can work with people who are actually available and aligned.
- As a hobby participant, I want to see who is likely to attend before I commit so I can trust the plan more.
- As a user, I want recommendations to explain why I am seeing them so I can feel confident the app understands me.

### 10A.2 Host / Partner Stories
- As a community host, I want recurring sessions and attendance tools so I can reduce manual coordination.
- As a partner community leader, I want Circles to help me attract compatible members and improve repeat participation.
- As a host, I want AI-generated pulse surveys and summaries so I can understand why attendance is improving or dropping.

### 10A.3 Operations Stories
- As a Circles operator, I want to identify low-health circles early so I can intervene before they collapse.
- As a moderator, I want structured reports and AI summaries so I can review potential trust issues efficiently.

---

## 11. User Journey

### 11.1 End-to-End Journey
Install -> Onboard -> Join recommended circles -> See recommended events and people -> RSVP -> Attend -> Repeat -> Belong

### 11.2 Core Retention Loop
User -> Circle -> Event -> Repeat Event -> Familiarity -> Identity -> Belonging

### 11.3 Why This Matters
Circles should optimize for repeated participation, not one-time discovery. The product must become a ritual engine, not a novelty engine.

---

## 12. Information Architecture

### 12.1 Primary Navigation
- Home
- Circles
- Events
- Matches
- Profile

### 12.2 Core Data Surfaces
- recommended for you
- your circles
- upcoming events
- people you may enjoy meeting or playing with
- AI moderator prompts
- community health nudges

---

## 12A. Primary User Flows

### 12A.1 New User Flow
Install -> Location -> Intent -> Activities -> Behavior -> Preferences -> AI summary -> Join circle -> RSVP event -> Attend first event

### 12A.2 Returning User Flow
Open app -> Review this week's circle plans -> Confirm attendance -> See familiar attendees -> Attend -> Receive follow-up survey -> Get next ritual recommendation

### 12A.3 Host Flow
Create circle -> Define cadence and rules -> Publish first event -> Review attendance -> Receive AI health summary -> Adjust schedule or invite list

### 12A.4 Partner Flow
Onboard community -> Import circle / event series -> Expose to matching engine -> Review signup quality -> Use AI survey and attendance insights

---

## 13. Screen-by-Screen Product Design

### 13.1 Welcome Screen
**Purpose:** establish product value quickly

**Key UI**
- headline: Find your people nearby
- subtext: sports, clubs, creators, travel, dating through shared context
- primary CTA: Get Started
- secondary CTA: Explore Circles

### 13.2 Location Setup
**Purpose:** make the product location-first

**Inputs**
- city
- neighborhood / locality
- travel radius

**System Outcome**
- location seed for all recommendations

### 13.3 Intent Selection
**Purpose:** capture why the user is here

**Intent Modes**
- sports and hobbies
- meet new people
- corporate clubs
- creator collaboration
- travel partners
- dating

**Rule**
- select up to two primary intents

### 13.4 Activity Selection
**Purpose:** capture activity graph

**Examples**
- badminton
- running
- chess
- yoga
- football
- coffee meetups
- photography
- video shoots
- product meetups
- finance clubs
- weekend travel

### 13.5 Behavioral Style Screen
**Purpose:** capture compatibility signals

**Sliders**
- spontaneous <-> planned
- casual <-> serious
- social <-> skill-focused
- occasional <-> weekly habit
- low budget <-> premium
- small groups <-> larger groups

### 13.6 Preference Screen
**Purpose:** capture comfort and constraint filters

**Inputs**
- age preference
- gender preference
- verified only toggle
- mentor-led vs peer-led
- group size preference
- maximum travel distance

### 13.7 AI Persona Summary
**Purpose:** convert onboarding into confidence

**Example**
"You look like a structured badminton and chess user who prefers evenings, small groups, and reliable people."

**Recommendations**
- top circles
- top events

### 13.8 Home Screen
**Purpose:** main daily / weekly decision surface

**Sections**
1. Recommended for you
2. This week with your circles
3. People you may enjoy meeting or playing with
4. Partner and host-led events

**Design Principle**
No infinite feed. Only high-signal modules.

### 13.9 Circle Discovery Screen
**Purpose:** browse and filter circles

**Views**
- recommended
- nearby
- professional
- creator
- beginner friendly

### 13.10 Circle Detail Screen
**Purpose:** establish shared context and continuity

**Shows**
- circle name
- location
- cadence
- members
- trust badges
- upcoming sessions
- why this circle fits

### 13.11 Event Detail Screen
**Purpose:** convert interest into commitment

**Shows**
- event details
- time and place
- capacity
- people attending
- friends / familiar faces going
- RSVP controls
- reason this event is recommended

### 13.12 Matches Screen
**Purpose:** show contextual people recommendations

**Shows**
- compatibility reasons
- shared activity
- schedule overlap
- shared circles or likely familiarity
- actions: connect, invite to event, add to circle

### 13.13 Profile Screen
**Purpose:** make identity visible but not performative

**Shows**
- core identity
- activities
- circles joined
- events attended
- reliability indicators
- badges such as host, creator, mentor, consistent attendee

### 13.14 Notifications and AI Moderator Prompts
**Purpose:** nudge without spamming

**Examples**
- Your Wednesday badminton circle has 5 people confirmed
- Attendance has been low; want to vote on a new time?
- Three people from your product circle are attending Saturday's run

### 13.15 Create Circle / Create Event
**Purpose:** support host-led supply

**Inputs**
- category
- activity
- location
- recurrence
- capacity
- rules
- partner or host identity

---

## 13A. UX Acceptance Criteria by Screen

### 13A.1 Onboarding
- user can complete the full onboarding flow in under 3 minutes
- each screen asks for one conceptually clear decision
- the user sees at least one useful recommendation before being asked for excessive profile detail

### 13A.2 Home
- the first screen shows immediately relevant content
- no section should require endless scrolling to interpret
- each recommendation includes a visible reason label

### 13A.3 Circle Detail
- the user can understand what the circle is, who it is for, and when it meets within one screenful
- the user can see continuity signals such as cadence and upcoming sessions

### 13A.4 Event Detail
- the user can determine where, when, who is going, and how to RSVP without ambiguity
- the user should see enough trust context to decide quickly

### 13A.5 Matches
- users are shown contextual matches only, not decontextualized profiles
- each people recommendation should clearly tie back to an activity, event, or circle

---

## 14. UX and Visual Design System

### 14.1 Design Direction
Hinge-like confidence and clarity, with a dark premium aesthetic and stronger community cues.

### 14.2 Theme
- **Background:** near-black
- **Primary CTA:** yellow
- **Success / trust:** green
- **Cards:** dark gray
- **Text:** white and muted neutrals

### 14.3 Core Palette
- background primary: `#0B0B0D`
- surface: `#1A1C21`
- primary yellow: `#F5C400`
- primary green: `#22C55E`
- primary text: `#FFFFFF`
- muted text: `#D1D5DB`
- subtle border: `#2A2D34`

### 14.4 Component Language
- rounded cards
- bold CTA buttons
- pill chips for tags
- reason labels for explainability
- subtle trust badges
- modern line icons

### 14.5 Button System
- primary: yellow fill, black text
- secondary: dark or outline treatment
- success: green fill, white text

### 14.6 UX Principles
- activities first, profiles second
- recommendation-led, not scroll-led
- continuity visible everywhere
- clear reason labels under every recommendation

---

## 14A. Copy and Tone Guidelines

### 14A.1 Desired Tone
- confident
- modern
- helpful
- warm
- low-cringe

### 14A.2 Good Copy Examples
- "Find people who are actually up for it."
- "This week's plans with your circles."
- "Why this fits you."
- "Can we count you in?"

### 14A.3 Avoid
- overhyped growth language
- dating-app-style innuendo in non-dating contexts
- manipulative urgency
- gamified language that trivializes trust

---

## 15. Functional Requirements

### 15.1 Onboarding Engine
The system shall collect:

- city and locality
- activity interests
- intent modes
- time preferences
- behavior sliders
- comfort preferences
- group format preferences

### 15.2 Matching Engine
The system shall generate:

- user to circle recommendations
- user to event recommendations
- user to user recommendations

Each recommendation shall include:

- score
- reasons
- timestamp
- model version

### 15.3 Circles System
The system shall support:

- small recurring groups
- peer-led and mentor-led circles
- membership state
- schedule and cadence
- trust and health metadata

### 15.4 Events Layer
The system shall support:

- one-time events
- recurring event series
- RSVP
- attendance confirmation
- capacity control

### 15.5 Reliability Layer
The system shall track:

- RSVPs
- attendance rate
- no-shows
- cancellations
- punctuality signals where possible

### 15.6 Explainability Layer
The system shall show recommendation reasons such as:

- same activity preference
- near your location
- same time availability
- shared professional context
- similar consistency level

### 15.7 AI Moderator Layer
The system shall support circle-level AI agents that can:

- welcome members
- summarize activity
- ask micro-surveys
- flag moderation issues
- suggest scheduling changes
- monitor community health

---

## 15A. Prioritized Scope

### P0 - Must Have for MVP
- onboarding and profile capture
- user to circle recommendation
- user to event recommendation
- recurring circles
- RSVP and attendance tracking
- partner / host-created circles
- explainable reasons on recommendations
- AI pulse surveys
- reporting and blocking

### P1 - Strongly Recommended for MVP or v1.1
- user to user recommendations within circle context
- reliability indicators
- host dashboards
- community health summaries
- recurring event templates

### P2 - Future
- mentor-specific workflows
- dating-specific mode
- destination travel flows
- paid subscriptions and commissions
- advanced semantic matching

---

## 16. Matching Logic

### 16.1 Philosophy
Do not start with opaque AI. Start with deterministic matching plus explainability, then add learning.

### 16.2 Match Inputs

#### Static Inputs
- location
- activity interests
- intent mode
- age band
- profession / creator role where relevant

#### Preference Inputs
- time preference
- group size
- mentor-led vs peer-led
- gender preference
- travel radius

#### Behavioral Inputs
- planning style
- competitiveness
- consistency preference
- actual attendance behavior
- satisfaction feedback

#### Social Graph Inputs
- shared circles
- prior co-attendance
- mutual connections

### 16.3 Weighted Score Framework

#### User -> Circle
- activity match: 30%
- time overlap: 20%
- location fit: 15%
- behavior compatibility: 15%
- circle health: 10%
- reliability alignment: 10%

#### User -> Event
- circle affinity: 25%
- timing fit: 20%
- location fit: 15%
- friend / familiar presence: 15%
- event type affinity: 10%
- attendance likelihood: 15%

#### User -> User
- activity similarity: 20%
- time overlap: 20%
- location proximity: 15%
- behavior similarity: 15%
- preference fit: 10%
- reliability similarity: 10%
- shared graph signal: 10%

### 16.4 Hard Filters
Before ranking, enforce:

- location eligibility
- policy compatibility
- capacity constraints
- schedule overlap
- safety constraints

### 16.5 Explainability Requirement
Every recommendation must contain at least one plain-language reason.

---

## 16A. Confirmed Match per Day Concept

### 16A.1 Founder Intent
The product should help users "find match faster" and create a feeling of momentum.

### 16A.2 Product Definition
"Confirmed match per day" should not mean random social matches. It should represent one of the following:

- a confirmed user-to-user contextual introduction
- a confirmed seat in an event
- a confirmed circle join where attendance is likely

### 16A.3 Recommendation
In MVP, define the metric operationally as:

**Daily Confirmed Participation Opportunity = a recommendation that the user explicitly accepts and that results in a real event or circle commitment**

This avoids vanity-match inflation and keeps the product aligned with offline outcomes.

---

## 17. Agentic Framework

### 17.1 Why AI Matters Here
Circles should be AI-native because communities fail without:

- moderation
- scheduling support
- feedback loops
- health monitoring
- adaptive governance

### 17.2 Core Agents

#### 1. Circle Moderator Agent
Responsibilities:
- welcome members
- explain rules
- summarize activity
- nudge participation
- detect spam or abuse

#### 2. Matching Agent
Responsibilities:
- generate circles, events, and people recommendations
- rebalance recommendations based on behavior

#### 3. Survey Agent
Responsibilities:
- ask post-event and periodic check-ins
- detect why engagement is falling
- collect community sentiment

#### 4. Governance Agent
Responsibilities:
- monitor circle health
- detect host fatigue
- identify toxic or low-trust patterns
- recommend interventions such as changing schedule, splitting, merging, or pausing circles

#### 5. Event Planning Agent
Responsibilities:
- suggest event times
- create recurring sessions
- prompt confirmations
- optimize attendance

### 17.3 Agent Architecture

**Recommended stack**
- orchestration: LangGraph-style workflow model
- app and API: FastAPI / Next.js routes
- primary DB: Postgres
- cache: Redis
- memory and retrieval: vector database plus relational history

### 17.4 Agent Memory Layers
- short-term interaction memory
- circle memory
- governance memory

### 17.5 Governance Framework
AI agents should support lightweight governance through:

- pulse surveys
- conflict or friction detection
- participation health summaries
- recommendations for community changes

This creates the foundation for future civic, governance, and local-intelligence use cases.

---

## 17A. Example Agent Workflows

### 17A.1 Attendance Recovery Workflow
Trigger: circle attendance drops below threshold for two consecutive sessions.

Workflow:
1. Governance agent detects decline.
2. Survey agent asks a 1-2 question pulse survey.
3. Event planning agent proposes alternate slot options.
4. Moderator agent posts the recommendation to members.
5. Matching agent adjusts candidate recommendations if member mix is weak.

### 17A.2 New Circle Seeding Workflow
Trigger: new partner community is onboarded.

Workflow:
1. Partner imports or defines circle details.
2. Matching agent finds likely nearby candidates.
3. Moderator agent explains circle norms and welcomes first cohort.
4. Event planning agent generates first recurring event series.
5. Survey agent collects feedback after the first session.

### 17A.3 Governance Pulse Workflow
Trigger: periodic cadence or detected friction.

Workflow:
1. Survey agent asks micro-questions about time, comfort, and format.
2. Governance agent aggregates responses into a circle health summary.
3. Moderator or host receives actions, not just raw data.

---

## 18. Data Model Overview

### 18.1 Core Entities
- users
- profiles
- intent preferences
- activity preferences
- behavior profile
- circles
- circle members
- events
- event participants
- recommendations
- user connections
- reliability metrics
- community partners
- reports

### 18.2 Required Derived Objects
- circle health metrics
- event series
- user reliability metrics
- recommendation reason payloads

---

## 18A. Conceptual Schema Notes

### 18A.1 Circle as the Core Aggregation Unit
Circles should be the primary long-lived object because they carry:

- member continuity
- schedule rhythm
- health metrics
- governance state
- event lineage

### 18A.2 Event Series Requirement
Recurring events should not be modeled as isolated events only. The system must support an event series abstraction so retention can be measured at the ritual level rather than only the event-instance level.

### 18A.3 User Connection Graph
User-to-user relationships should be inferred from:

- shared event attendance
- repeated co-attendance
- same circle membership
- explicit invitations

This graph should improve recommendations over time.

---

## 19. Retention Strategy

### 19.1 Core Insight
Circles should not optimize for novelty. It should optimize for rituals.

### 19.2 Retention Mechanisms

#### Fixed Rhythm
Every strong circle should have a clear cadence.

#### Social Continuity
Show repeat faces, recurring groups, and continuity signals.

#### Commitment Layer
Use RSVP, confirmation prompts, and gentle reliability signals.

#### Identity Layer
Help users feel like a regular, a host, a creator, or a mentor.

#### AI Stewardship
Use agents to keep circles healthy and adaptive.

### 19.3 North Star Metric
**Weekly Confirmed Real-World Participations per Active User**

### 19.4 Supporting Metrics
- onboarding completion rate
- circle join rate
- RSVP rate
- attendance rate
- repeat attendance rate
- event fill rate
- circle survival rate
- no-show rate
- confirmed matches per day
- time to first meaningful participation

---

## 19A. Behavioral Metrics Framework

### 19A.1 Acquisition
- cost per qualified signup
- percentage of users acquired through partners
- signup-to-onboarding completion rate

### 19A.2 Activation
- onboarding completion
- first circle join
- first RSVP
- first attendance

### 19A.3 Retention
- week 1 repeat visit rate
- week 4 repeat participation rate
- ritual continuation rate

### 19A.4 Network Health
- average familiar faces per event
- average repeated co-attendance edges per user
- partner-sourced circle survival rate

---

## 20. Safety, Trust, and Moderation

### 20.1 Product Position
Trust is not a feature layer; it is infrastructure.

### 20.2 Safety Controls
- verified user options
- reporting and blocking
- trust badges for hosts and active circles
- moderation flags
- restricted direct messaging patterns

### 20.3 Policy Recommendation
MVP should focus on adult users. Broader age inclusion requires dedicated policy, moderation, and legal guardrails and should be a later expansion.

---

## 20A. Trust Design Requirements

### 20A.1 User-Facing Trust Signals
- verified host
- active circle
- beginner friendly
- attendance reliability
- people you may already know or overlap with

### 20A.2 Internal Trust Signals
- report volume
- moderation severity
- host quality indicators
- event cancellation rate

### 20A.3 Messaging Constraint
Direct person-to-person interaction should be contextual. The product should prefer circle and event context before unrestricted stranger messaging.

---

## 21. Community Partnership Strategy

### 21.1 GTM Thesis
Circles should not rely only on consumer acquisition. It should seed supply through community-led channels.

### 21.2 Target Partners
- running clubs
- badminton groups
- chess clubs and cafes
- creator communities
- PM / tech / finance groups
- yoga studios
- coworking spaces
- hobby organizers

### 21.3 What Circles Offers Partners
- new member discovery
- better event attendance
- circle management tools
- AI surveys and health monitoring
- smarter recommendations to the right users

### 21.4 First-City Rollout
Gurgaon should be seeded using:
- sports and hobby groups
- creator groups
- professional communities
- host-led recurring circles

---

## 21A. GTM Operating Model

### 21A.1 Supply First, Then Density
The first city should be built through partner and host seeding, not pure demand-side performance marketing.

### 21A.2 Recommended Initial Supply Mix
- 40% sports and hobby communities
- 25% corporate / professional communities
- 20% creator communities
- 15% wellness and indoor hobby communities

### 21A.3 Partnership Success Metric
Partner acquisition should not be measured only by signed interest. It should be measured by:

- circles actually launched
- events actually held
- attendance quality
- repeat participation after partner onboarding

---

## 22. Experimentation Plan

### 22.1 Pre-Product Validation
Run lightweight experiments to test:

- willingness to join a structured circle
- willingness to accept attendance rules
- demand for recurring activities
- partner interest from existing community leaders

### 22.2 No-Code Experiment
Use:
- landing page or form
- WhatsApp-based pilot circles
- manual attendance tracking
- fixed recurring schedules

### 22.3 Success Signals
- high completion of interest form
- meaningful acceptance of structure
- repeat attendance over multiple sessions
- partner willingness to onboard their community

---

## 22A. Research and Validation Backlog

Before full-scale product build, the team should continue collecting:

- community partner interviews
- user interviews across Gurgaon and one comparison city
- attendance and no-show patterns from manual pilots
- preferred cadence by activity type
- differences in retention across sports, professional, and creator circles

---

## 23. Monetization Strategy

### 23.1 Not for MVP
Retention and trust must be proven before monetization is emphasized.

### 23.2 Potential Revenue Streams
- premium circles
- mentor-led or host-led subscriptions
- partner tooling
- paid events
- booking commissions
- corporate wellness and professional community programs

### 23.3 Monetization Principle
Do not charge users early for mere discovery. Charge for higher quality experiences, convenience, and partner tooling once value is obvious.

---

## 23A. Profitability Hypotheses

The business becomes viable if Circles can prove one or more of the following:

1. Partner and host tooling drives willingness to pay.
2. Premium circles drive higher attendance and justify subscription spend.
3. Corporate and professional communities pay for reliable offline engagement.
4. Booking and paid-event commissions become a later additive revenue stream rather than the core business model.

---

## 24. Technical Architecture Overview

### 24.1 Product Stack
- frontend: Next.js / React Native style app surfaces
- backend: API routes or FastAPI services
- DB: Postgres
- cache: Redis
- AI / agent layer: orchestration plus model services

### 24.2 Core Modules
- onboarding and identity service
- matching engine
- circles service
- event service
- trust and moderation service
- recommendation service
- agent orchestration service

### 24.3 Delivery Model
Precompute recommendations where possible; do not rely entirely on live scoring.

---

## 24A. Non-Functional Requirements

### 24A.1 Performance
- home recommendations should load quickly enough to feel instantaneous on normal mobile networks
- recommendation freshness should be sufficient for daily use and event availability accuracy

### 24A.2 Reliability
- RSVP state must be consistent and durable
- event capacity and attendance state must not drift

### 24A.3 Explainability
- recommendation reasons must be persisted and renderable in clients

### 24A.4 Auditability
- moderation and governance interventions should be logged for later review

### 24A.5 Privacy
- location should be precise enough for usefulness but not unnecessarily exposed in a public way

---

## 25. Risks and Mitigations

| Risk | Why It Matters | Mitigation |
|---|---|---|
| Low density | Without local density, recommendations feel empty | City-first rollout and category focus |
| Flaky participation | One bad experience can cause churn | RSVP, attendance, reliability tracking |
| Value escapes to WhatsApp | Users may leave after first connection | Circle rituals, recurring events, AI stewardship |
| Dating ambiguity overwhelms product | Brand and safety can be distorted | Explicit intent modes and defer dating-first launch |
| Partner supply is weak | Hard to seed quality circles | Dedicated outreach and host tooling |
| AI feels gimmicky | Users may not trust opaque automation | Explainability and high-value agent tasks |

---

## 25A. Launch Readiness Checklist

Before launch in the first city, Circles should have:

- a clear category narrative and positioning
- at least a small seeded set of healthy circles
- at least one recurring event series in each hero activity
- operational moderation processes
- survey and attendance workflows functioning end-to-end
- analytics instrumentation for activation and retention
- a basic partner onboarding pipeline

---

## 26. Open Questions

1. Which circle types produce the highest repeat attendance?
2. Do professional circles outperform hobby-only circles on retention?
3. What is the right commitment mechanism for different activities?
4. How much user-to-user matching should happen outside circle context?
5. Which community partner type creates the strongest early supply?
6. When should dating be activated as a distinct mode?

---

## 27. Decision Summary

### 27.1 What Circles Is
- location-first
- activity-led
- circle-based
- AI-moderated
- recommendation-driven
- built for repeated offline participation

### 27.2 What Circles Is Not
- not a generic social feed
- not a Tinder clone with hobby tags
- not a one-off event marketplace
- not just another WhatsApp wrapper

### 27.3 Primary Product Goal
Help users repeatedly do meaningful activities with compatible people nearby.

---

## Appendix A: Community Outreach Sheet Template

Use this as the starting spreadsheet for partnership GTM.

| Community Name | City | Locality | Category | Activity | Channel | Contact Person | Phone | Email | Instagram / URL | Approx Size | Frequency | Current Tool | Warm/Cold | Status | Last Contact | Next Follow-up | Notes |
|---|---|---|---|---|---|---|---|---|---|---:|---|---|---|---|---|---|---|
| Gurgaon Runners Example | Gurgaon | Golf Course Road | Sports | Running | Instagram | TBD |  |  |  | 500 | Weekly | WhatsApp | Cold | Not Contacted |  |  |  |

### Suggested Categories
- sports and fitness
- chess and indoor games
- corporate and professional clubs
- creator communities
- cafes and hobby hosts
- yoga and wellness groups

---

## Appendix B: Community Partner Call Script

### Goal
Understand partner pain, gauge interest, and explore pilot collaboration.

### Script
1. Quick intro: "We are building Circles, a platform for helping communities run more reliable recurring circles and events."
2. Discovery questions:
   - How do you currently manage discovery and coordination?
   - What causes no-shows or drop-off?
   - How do new people usually find you?
   - What parts of running the community are painful?
3. Value proposition:
   - better discovery
   - smarter matching
   - recurring event support
   - AI surveys and community health insights
4. Pilot ask:
   - Would you try a small pilot for one circle or event series?

---

## Appendix C: MVP Success Criteria

The MVP is working if:

- users complete onboarding
- users join at least one circle
- users RSVP to at least one recommended event
- a meaningful share attend the event
- a meaningful share return for a second event
- at least some partner communities agree to pilot with Circles

---

## Final Note
Circles should be built as a system to manufacture belonging through structure, compatibility, and repeated participation. The more it behaves like a ritual engine with AI stewardship, the more defensible it becomes.
