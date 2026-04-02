## Context

Handrix is a greenfield on-demand home-repair platform connecting clients with vetted handymen for minor fixes (leaks, outlets, lights) achievable in 1–2 hours. The engagement is led by Harel and Nathaniel with a 3–4 month MVP target. There is no existing codebase. Key constraints are speed-to-market, minimum friction UX, and the need to coordinate three moving parts in real time: the client, the handyman, and the materials.

Key stakeholders: Harel & Nathaniel (founders), end clients, vetted handymen, supply partners.

## Goals / Non-Goals

**Goals:**
- Ship a working web app MVP (React) in ≤4 months
- Real-time dispatch of a handyman within a 1–2 hour arrival window
- AI-powered job intake that reduces form-filling to a conversation
- Transparent, pre-confirmed pricing (labor + parts + transport)
- End-to-end payment flow (Stripe pre-auth → capture on completion)
- Warranty record issued and visible on completion
- Parts identification and ordering via supply API integration
- Handyman logistics (navigation link + materials ETA)
- Real-time job status updates to client via WebSocket
- Transactional email notifications for key events (SendGrid)

**Non-Goals (MVP scope exclusions):**
- iOS / Android native mobile apps (React Native deferred post-MVP)
- FCM push notifications (deferred alongside mobile apps)
- Live map tracking with GPS coordinates (deferred post-MVP)
- Warranty claim initiation and management (pending legal/business sign-off)
- Admin web UI for pricing rate management (hardcoded config table for MVP)
- Apple Sign-In (only required for App Store distribution)
- Multi-job scheduling / calendar booking (same-day only)
- B2B / property management contracts
- Custom handyman recruitment pipeline (assume seeded network at launch)
- In-app DIY guidance or video tutorials
- Subscription / membership pricing tiers
- Multi-region / international launch (single metro area at launch)
- Handyman payroll or payouts platform (manual initially)

## Decisions

### D1 — Frontend: React (Web)
**Decision**: Use React (with Vite) as a single web app, deployed as two distinct route namespaces: `/app/*` (client) and `/portal/*` (handyman). Both client and handyman portals are web-based for MVP.
**Rationale**: Fastest path to a working end-to-end product. A web app removes the need for Expo, native SDKs, App Store/Play Store submissions, and mobile-specific tooling. Eliminates ~30% of the mobile-only complexity while still reaching users on any device via browser.
**Alternatives considered**:
- *React Native (Expo)*: Ideal for the final product but adds significant complexity (SDK compatibility, OTA updates, simulator testing, store submissions) — deferred post-MVP.
- *Next.js*: SSR benefits are not needed for this real-time, auth-gated app; Vite + React SPA is simpler.

### D2 — Backend: Node.js (TypeScript) + REST API
**Decision**: Node.js with TypeScript, REST API, hosted on AWS (or GCP).
**Rationale**: Fastest MVP iteration speed, massive ecosystem, strong async I/O for real-time features. TypeScript adds safety without sacrificing speed.
**Alternatives considered**:
- *Python/FastAPI*: Good, but JS stack aligns better with a React frontend team doing fullstack.
- *Go*: High performance but slower to iterate in.

### D3 — Database: PostgreSQL (primary) + Redis (real-time state)
**Decision**: PostgreSQL via managed service (RDS or Supabase) for persistent data; Redis for ephemeral real-time job state and WebSocket pub/sub.
**Rationale**: PostgreSQL is battle-tested for relational job/user/payment data. Redis enables fast job state pub/sub without polling the primary DB.

### D4 — AI Job Intake: OpenAI GPT-4o (function calling)
**Decision**: Use OpenAI GPT-4o with structured function calling to power the intake chat.
**Rationale**: Function calling allows the LLM to output structured job classification data (job type, estimated scope, parts list) while maintaining a natural conversation. Fastest to integrate vs. fine-tuned models.
**Alternatives considered**:
- *Gemini*: Comparable capability; OpenAI chosen for broader community support and mature function-calling API.
- *Custom fine-tuned model*: Out of scope for MVP timeline.

### D5 — Maps: Google Maps Platform
**Decision**: Google Maps Platform (Geocoding API for address lookup; Maps JavaScript SDK for any map embeds).
**Rationale**: Industry standard, most accurate geocoding, Maps JavaScript SDK integrates cleanly into React web app. Google Maps URL deep-links used for handyman navigation (no SDK required on handyman side).
**Note**: Google Maps Routes API for live ETA and the Maps JavaScript SDK live tracking layer are deferred with the live-tracking feature post-MVP.

### D6 — Payments: Stripe (Stripe Elements)
**Decision**: Stripe for client-facing payment processing, using Stripe Elements for web-based card collection.
**Rationale**: Best-in-class developer experience, web SDK (Stripe Elements) on par with mobile, handles PCI compliance, supports pre-authorization (hold → capture on job completion).

### D7 — Dispatch Algorithm: Nearest-available geospatial query
**Decision**: For MVP, dispatch is a greedy nearest-available match: query handymen within N km who are `available`, ranked by proximity, offered to the top candidate first (with timeout fallback to next).
**Rationale**: Simple to implement, correct for low handyman density at launch. Can be replaced with ML-based matching post-MVP.

### D8 — Real-time Updates: WebSockets via Socket.io
**Decision**: Socket.io for real-time job status events broadcast to the client browser.
**Rationale**: Simpler than raw WebSockets, supports fallback transports, battle-tested with Node.js. Used for job state updates only in MVP (en_route, on_site, completed). GPS broadcasting deferred with live-tracking feature.

### D9 — Notifications: SendGrid (email)
**Decision**: Transactional email via SendGrid for booking confirmation, dispatch notification, and job completion + receipt.
**Rationale**: No FCM integration needed for web MVP. Email covers all critical touchpoints (booking confirmed, job dispatched, receipt). SendGrid free tier is sufficient for MVP volumes.
**Post-MVP**: FCM will be added alongside the React Native mobile apps.

### D10 — Parts Ordering: Abstracted supplier adapter layer
**Decision**: Build a thin adapter interface for supply APIs; integrate one primary supplier at MVP (e.g., a local trade supplier or Home Depot API). Adapter pattern allows swapping/adding suppliers post-MVP.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| 3–4 month timeline is aggressive | Web-only MVP removes ~30% of mobile complexity; ruthless scope trimming (no live map, no FCM, no claim flow) |
| Handyman supply is sparse at launch → dispatch fails | Seed with a small curated handyman network; set honest ETA expectations in UI |
| Parts availability from single supplier is unreliable | Allow handyman to source locally if supplier API fails; manual override flow |
| LLM intake misclassifies job scope → wrong pricing | Human review gate for jobs above a price threshold; allow client to correct before confirming |
| Payment pre-auth hold could frustrate clients if job cancelled | Clear UX: communicate hold timing; immediate release on cancellation |
| OpenAI API costs at scale | Token-efficient prompts; cache common job classification patterns; budget cap per job |
| Handyman portal used on mobile browser may have UX friction | Responsive design from day one; test on mobile Chrome/Safari |

## Migration Plan

This is a greenfield build — no migration required. Deployment steps:
1. Stand up backend (AWS/GCP) with CI/CD pipeline (GitHub Actions)
2. Configure managed PostgreSQL + Redis
3. Deploy backend API; seed handyman profiles and pricing config
4. Deploy React web app (client + handyman portals) to CDN (Vercel or Cloudfront)
5. Soft launch in one metro area with seeded handymen
6. Monitor dispatch success rate, job completion rate, and AI intake accuracy → iterate

**Rollback**: N/A for greenfield. Individual features can be feature-flagged off.

## Open Questions

- **Supply partner**: Which parts supplier API will be used? (needs vendor decision from Harel/Nathaniel)
- **Handyman onboarding**: What is the vetting process? Background check provider TBD.
- **Logistics / transportation**: Is Handrix arranging rides (Uber API), owning vehicles, or expecting handymen to self-transport? This significantly affects the logistics-coordination capability scope.
- **Warranty terms**: What does the warranty cover and for how long? Needs legal/business input before implementing warranty claim flows in v1.1.
- **Handyman compensation model**: Fixed per-job rate? Commission? Needed to scope handyman-portal payout features.
- **Launch market**: Single city confirmed? Affects geofencing and handyman seeding strategy.
- **Regulatory**: Any licensing requirements in the target market for handyman services? (permits, insurance)
