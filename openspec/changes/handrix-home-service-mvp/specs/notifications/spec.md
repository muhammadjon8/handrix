## ADDED Requirements

> **MVP Scope Note**: FCM push notifications are deferred post-MVP (mobile-specific). For MVP, notifications are delivered via transactional email (SendGrid) for key job lifecycle events. In-app status updates are handled by WebSocket (see `live-tracking` spec).

### Requirement: Transactional email — booking confirmation
The system SHALL send a booking confirmation email to the client immediately after a job is confirmed and a handyman is dispatched.

#### Scenario: Booking confirmed email sent
- **WHEN** the client confirms the upfront price and a handyman accepts the job
- **THEN** the system sends an email to the client's registered address containing: job type, address, handyman name, and estimated arrival window

### Requirement: Transactional email — job completed and receipt
The system SHALL send a job completion email to the client when the job status changes to `completed`, including the payment receipt and warranty summary.

#### Scenario: Completion email sent
- **WHEN** the handyman marks a job complete and payment is captured
- **THEN** the client receives an email with: total charged, itemized breakdown (labor / parts / transport), warranty period, and a link to view job history

### Requirement: Transactional email — handyman job offer
The system SHALL send an email notification to a handyman when a job offer is dispatched to them, as a fallback alongside the in-app offer screen.

#### Scenario: Offer email sent to handyman
- **WHEN** the dispatch system selects a handyman for a job
- **THEN** the handyman receives an email with job type, address, and a link to the handyman portal to accept or decline

### Requirement: In-app status updates (no opt-in required)
The system SHALL deliver all job status updates to the client browser via WebSocket regardless of email preferences, ensuring the client always sees current job state in-app.

#### Scenario: Client does not check email
- **WHEN** the client has the job status page open
- **THEN** all status transitions appear in real time via WebSocket without requiring email delivery

## DEFERRED (Post-MVP)

The following requirements are out of scope for MVP and will be addressed in a future release:

- Firebase Cloud Messaging (FCM) push notifications for iOS and Android
- Notification opt-in permission request at first launch
- Device token storage and management per user
- High-priority push offers to handyman with 60-second TTL
