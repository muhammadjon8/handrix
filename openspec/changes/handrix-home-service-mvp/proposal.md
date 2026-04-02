## Why

Homeowners frequently face urgent minor repair needs — a leaking pipe, a broken outlet, a flickering light — but current options (calling contractors, searching directories) are slow, opaque, and unreliable. Handrix solves this by connecting clients with vetted, AI-assisted handymen who can arrive within 1–2 hours, fully equipped with parts and transportation, at a transparent price — all from a single web app. The window of opportunity is now: on-demand service platforms are mainstream, AI-assisted coordination is finally viable, and the "last-mile" home-services gap remains unaddressed.

## What Changes

This is a greenfield MVP build introducing the full Handrix platform from the ground up:

- **New web app** (React) enabling clients to request home repair jobs on demand
- **AI job intake** — LLM chat interface that gathers repair details, classifies the job type, and estimates scope
- **Handyman matching** — real-time dispatch to the nearest available vetted handyman within target arrival time
- **Job status tracking** — client-facing status display (dispatching → en route → on-site → completed) with real-time updates via WebSocket
- **Parts & materials ordering** — automatic identification and sourcing of required parts from supply integrations
- **Handyman transportation coordination** — logistics layer to coordinate handyman movement to the job site
- **Upfront pricing** — price presented to and confirmed by the client before the job begins (labor + parts + transport)
- **In-app payments** — secure charge through the app upon job completion
- **Job warranty record** — warranty record issued on completion, visible in job history
- **Handyman-facing web portal** — separate web view for handymen to receive, manage, and complete jobs
- **Email notifications** — transactional emails for key job lifecycle events (booking confirmed, dispatched, completed + receipt)

## Capabilities

### New Capabilities

- `user-auth`: Client and handyman account creation, login, profile management, and role-based access
- `ai-job-intake`: LLM-powered conversational interface to describe the repair need, auto-classify job type, and confirm scope
- `job-request`: Client-side job creation flow including location, job details, and upfront pricing acceptance
- `handyman-dispatch`: Real-time matching and dispatch algorithm to find the nearest available qualified handyman
- `live-tracking`: Real-time job status updates to client (dispatching → en route → on-site → completed) via WebSocket; live map deferred post-MVP
- `parts-ordering`: Integration with supply/parts APIs to identify, price, and order materials required for the job
- `logistics-coordination`: Navigation link and materials delivery ETA surfaced to handyman; ride-hailing integration deferred post-MVP
- `pricing-engine`: Pricing calculation (labor + parts + transport) surfaced to the client before job commitment; rates stored in config (admin UI deferred post-MVP)
- `payments`: In-app payment processing via Stripe Elements (pre-auth on booking, capture on completion, email receipt)
- `warranty`: Post-job warranty record issuance and display in job history; claim flow deferred post-MVP
- `notifications`: Transactional email notifications (SendGrid) for key job events; FCM push notifications deferred post-MVP
- `handyman-portal`: Handyman-facing web portal for job queue, acceptance/decline, job checklist, and completion confirmation

### Modified Capabilities

*(None — this is a greenfield build with no existing specs.)*

## Impact

- **Stack**: React (web) for client and handyman portals; Node.js (TypeScript) backend; cloud-hosted (AWS or GCP)
- **External Integrations**: Google Maps Platform (geocoding, routing), OpenAI or equivalent LLM (job intake chat), parts/supply API (TBD vendor), Stripe (payments), SendGrid (email notifications)
- **Data**: Client profiles, handyman profiles, job records, parts inventory snapshots, pricing history, warranty records
- **Timeline**: MVP target is 3–4 months (Harel & Nathaniel); scope must be ruthlessly prioritized to hit that window
