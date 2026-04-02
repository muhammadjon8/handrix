## ADDED Requirements

> **MVP Scope Note**: The handyman-facing interface is a web portal (React), not a native mobile app. All screens are browser-based. The handyman will use the portal on a mobile browser or desktop.

### Requirement: Handyman job queue
The system SHALL display a real-time list of incoming job offers and active jobs in the handyman web portal.

#### Scenario: Job offer appears
- **WHEN** a job offer is dispatched to a handyman
- **THEN** the offer appears prominently in the portal with a 60-second countdown timer and Accept/Decline buttons

#### Scenario: No active jobs
- **WHEN** the handyman has no active or pending jobs
- **THEN** the portal shows an availability toggle and a "Waiting for jobs..." state

### Requirement: Job acceptance and details view
The system SHALL allow handymen to accept a job offer and immediately view full job details including address, job description, parts list, and client notes.

#### Scenario: Job details loaded after acceptance
- **WHEN** a handyman accepts a job
- **THEN** the portal navigates to the job detail page showing all job specs, a "Navigate to Job" link (Google Maps URL with job address), and a status progression panel

### Requirement: Job status updates by handyman
The system SHALL allow the handyman to advance the job status through defined states: `en_route` → `on_site` → `completed`.

#### Scenario: Handyman marks en route
- **WHEN** the handyman clicks "I'm on my way"
- **THEN** job status updates to `en_route` and the client's status display updates in real time

#### Scenario: Handyman marks on-site
- **WHEN** the handyman clicks "I've Arrived"
- **THEN** job status updates to `on_site`

#### Scenario: Handyman marks complete
- **WHEN** the handyman clicks "Job Complete" and confirms via dialog
- **THEN** job status updates to `completed`, payment capture is triggered, and a warranty record is created

### Requirement: Handyman earnings display
The system SHALL show the handyman their earnings for current and past jobs in the handyman portal (read-only for MVP; payout management is manual).

#### Scenario: Earnings for completed job shown
- **WHEN** a handyman views a completed past job
- **THEN** the portal displays the job payout amount for that job
