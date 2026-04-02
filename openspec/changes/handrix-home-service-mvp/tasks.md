## 1. Project Setup & Infrastructure

- [ ] 1.1 Initialize React (Vite) monorepo with `/apps/client` (client web app), `/apps/portal` (handyman web portal), and `/backend` workspaces
- [ ] 1.2 Set up Node.js (TypeScript) backend project with ESLint, Prettier, and tsconfig
- [ ] 1.3 Provision managed PostgreSQL instance (Supabase or AWS RDS)
- [ ] 1.4 Provision Redis instance (Upstash or ElastiCache) for real-time job state and WebSocket pub/sub
- [ ] 1.5 Configure CI/CD pipeline (GitHub Actions) for lint, test, and deploy on push to main
- [ ] 1.6 Set up environment variable management (.env + secrets in CI) for API keys (OpenAI, Google Maps, Stripe, SendGrid)
- [ ] 1.7 Create shared `/packages/types` package with shared TypeScript interfaces (Job, User, Handyman, etc.)

## 2. Database Schema

- [ ] 2.1 Create `users` table (id, email, password_hash, role, created_at)
- [ ] 2.2 Create `handymen` table (id, user_id, skills[], service_radius_km, status, availability, lat, lng)
- [ ] 2.3 Create `jobs` table (id, client_id, handyman_id, status, job_type, description, address, lat, lng, price_quote, price_final, created_at)
- [ ] 2.4 Create `job_parts` table (id, job_id, part_name, quantity, unit_cost, supplier_order_id)
- [ ] 2.5 Create `payments` table (id, job_id, stripe_payment_intent_id, amount, status, captured_at)
- [ ] 2.6 Create `warranties` table (id, job_id, client_id, issued_at, expires_at)
- [ ] 2.7 Create `pricing_config` table (job_type, labor_rate_per_hour, transport_fee, markup_pct)
- [ ] 2.8 Write and run initial seed script for `pricing_config` with default rates per job type
- [ ] 2.9 Set up PostGIS extension and add geolocation columns (point) to `handymen` for geospatial dispatch queries

## 3. User Auth

- [ ] 3.1 Implement `POST /auth/register` — client and handyman registration with hashed password
- [ ] 3.2 Implement `POST /auth/login` — credential validation, return JWT access + refresh token
- [ ] 3.3 Implement `POST /auth/refresh` — exchange valid refresh token for new access + refresh pair
- [ ] 3.4 Implement JWT middleware for role-based route protection (`client`, `handyman`, `admin`)
- [ ] 3.5 Implement Google OAuth login endpoint and token exchange
- [ ] 3.6 Build client web app auth pages: Sign Up, Log In, Google OAuth button
- [ ] 3.7 Build handyman portal login page (email/password only; registration is admin-seeded)
- [ ] 3.8 Implement admin endpoint `PATCH /admin/handymen/:id/approve` to change handyman status to `active`

## 4. AI Job Intake

- [ ] 4.1 Set up OpenAI client in backend with GPT-4o and function calling configured
- [ ] 4.2 Define `classify_job` function schema (job_type, description, estimated_duration_hours, materials[])
- [ ] 4.3 Implement `POST /intake/chat` — accepts conversation history, returns next AI message or `classify_job` function call result
- [ ] 4.4 Implement intake session management: store conversation state in Redis keyed by session ID
- [ ] 4.5 Build client web app chat page with message bubbles, typing indicator, and send button
- [ ] 4.6 Build job scope confirmation page showing classified job summary with "Confirm" and "Correct" buttons
- [ ] 4.7 Add token usage logging per intake session for cost monitoring

## 5. Job Request Flow

- [ ] 5.1 Implement `POST /jobs` — create job record from confirmed classification + client location
- [ ] 5.2 Implement browser geolocation detection in client app (navigator.geolocation) with fallback to manual address entry
- [ ] 5.3 Integrate Google Maps Geocoding API for address autocomplete and reverse geocode
- [ ] 5.4 Build address selection page with autocomplete search field and map pin (Google Maps JS SDK embed)
- [ ] 5.5 Build active job status page with step indicator (Dispatching → En Route → On Site → Completed) updated via WebSocket
- [ ] 5.6 Implement `GET /jobs/history` for client's past jobs list
- [ ] 5.7 Build job history page with status badges and warranty status for completed jobs

## 6. Pricing Engine

- [ ] 6.1 Implement `POST /pricing/calculate` — computes labor + parts + transport total from job classification and parts list
- [ ] 6.2 Read rates from `pricing_config` table (not hardcoded)
- [ ] 6.3 Store price quote on the job record with a `quote_expires_at` timestamp (now + 15 min)
- [ ] 6.4 Implement quote expiry check at job confirmation: recalculate if expired before proceeding
- [ ] 6.5 Build client web app price breakdown card UI (Labor / Parts / Transport / Total line items) with Accept & Book / Decline buttons

## 7. Handyman Dispatch

- [ ] 7.1 Implement dispatch trigger on job confirmation: geospatial query for nearest available handymen with matching skills using PostGIS
- [ ] 7.2 Implement offer dispatch: send job offer via WebSocket to top-ranked handyman with 60-second TTL; send offer notification email (SendGrid) as fallback
- [ ] 7.3 Implement offer acceptance: `POST /jobs/:id/accept` — assign handyman, update job + handyman availability state
- [ ] 7.4 Implement offer decline / timeout: cascade offer to next ranked candidate; notify client if no candidates remain
- [ ] 7.5 Implement handyman availability toggle: `PATCH /handymen/me/availability` (`available` | `offline`)

## 8. Real-time Job Status (WebSocket)

- [ ] 8.1 Set up Socket.io on backend with authenticated rooms per job ID
- [ ] 8.2 Implement job status broadcast: on any job status change, emit event to the job's room (client and handyman connections)
- [ ] 8.3 Implement Socket.io client in React client web app to receive job status events and update the status page without reload
- [ ] 8.4 Implement Socket.io client in React handyman portal to receive new job offer events

## 9. Parts Ordering

- [ ] 9.1 Define supplier adapter interface (`searchParts`, `checkAvailability`, `placeOrder`) in TypeScript
- [ ] 9.2 Implement initial supplier adapter for selected MVP supplier (TBD — placeholder mock adapter for development)
- [ ] 9.3 Implement parts identification call within intake classification flow (query adapter on classify_job output)
- [ ] 9.4 Implement availability check and part substitute lookup before pricing
- [ ] 9.5 Implement `placeOrder` call triggered on job confirmation, store supplier order ID on `job_parts` records
- [ ] 9.6 Add error handling: log supplier failures, notify ops team via email alert (SendGrid), do not cancel job

## 10. Logistics Coordination

- [ ] 10.1 Surface parts delivery ETA from supplier order response in handyman portal job detail page
- [ ] 10.2 Add "Navigate to Job" button in handyman portal linking to Google Maps URL with job address pre-filled
- [ ] 10.3 Implement `GET /admin/jobs/active-logistics` — returns active jobs with handyman availability status and parts order status

## 11. Payments

- [ ] 11.1 Set up Stripe SDK in backend (stripe-node) with production and test API keys
- [ ] 11.2 Implement `POST /payments/setup-intent` — returns Stripe SetupIntent client secret for saving a card via Stripe Elements
- [ ] 11.3 Build client web app Add Payment Method page using Stripe Elements (card element)
- [ ] 11.4 Implement `POST /payments/pre-auth` — create PaymentIntent with `capture_method: manual` for the quoted total on job confirmation
- [ ] 11.5 Implement `POST /payments/capture/:jobId` — capture pre-auth on job completion
- [ ] 11.6 Implement `POST /payments/cancel/:jobId` — release pre-auth hold on job cancellation
- [ ] 11.7 Send itemized payment receipt via SendGrid email on successful capture; store receipt URL in job record

## 12. Warranty

- [ ] 12.1 Implement warranty record creation in the job completion handler (`issued_at`, `expires_at = issued_at + 30 days`)
- [ ] 12.2 Implement `GET /warranties/:jobId` — returns warranty details for a given job
- [ ] 12.3 Display warranty status and expiry date in client job history page (Active / Expired badge)
- [ ] 12.4 Include warranty summary (period + expiry date) in the job completion email sent to client

## 13. Email Notifications (SendGrid)

- [ ] 13.1 Integrate SendGrid SDK in backend and configure transactional email templates
- [ ] 13.2 Send booking confirmation email to client when handyman accepts a job (job type, address, handyman name, ETA window)
- [ ] 13.3 Send job completion email to client when job status changes to `completed` (receipt + warranty summary)
- [ ] 13.4 Send job offer email to handyman when a job is dispatched to them (job type, address, link to portal)

## 14. Handyman Portal (Web)

- [ ] 14.1 Build handyman portal home page: availability toggle, current job offer card (with 60s countdown), and recent jobs list
- [ ] 14.2 Build job detail page: address, job description, parts list, client notes, "Navigate to Job" link, and status progression buttons
- [ ] 14.3 Implement status progression buttons: "I'm on my way" → "I've Arrived" → "Job Complete" (with confirmation dialog)
- [ ] 14.4 Wire status button clicks to `PATCH /jobs/:id/status` API calls and Socket.io broadcast
- [ ] 14.5 Build handyman portal earnings history page: list of completed jobs with payout per job (read-only)

## 15. QA & Launch Readiness

- [ ] 15.1 Write integration tests for auth, job creation, dispatch, and payment flows
- [ ] 15.2 Write E2E test for the full happy path: intake → pricing → booking → dispatch → status updates → complete → payment → warranty
- [ ] 15.3 Performance test dispatch geospatial query with simulated handyman dataset
- [ ] 15.4 Security review: confirm no raw card data stored, verify JWT expiry, check RBAC on all endpoints
- [ ] 15.5 Test client web app on mobile browsers (Chrome Android, Safari iOS) for responsive usability
- [ ] 15.6 Test handyman portal on mobile browser (primary use case for handymen in the field)
- [ ] 15.7 Seed production database with initial handyman profiles and pricing config
- [ ] 15.8 Set up error monitoring (Sentry) in both web apps and backend
- [ ] 15.9 Set up uptime monitoring on backend API health endpoint
- [ ] 15.10 Conduct soft launch with seeded handymen in target metro area and collect feedback
