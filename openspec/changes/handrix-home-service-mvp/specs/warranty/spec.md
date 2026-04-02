## ADDED Requirements

> **MVP Scope Note**: Warranty claim initiation and management flow is deferred post-MVP (requires legal/business input on terms and ops process). For MVP, a warranty record is automatically created on job completion and surfaced to the client in job history.

### Requirement: Warranty record creation on job completion
The system SHALL automatically create a warranty record when a job is marked complete, linked to the client account and job ID.

#### Scenario: Warranty record created
- **WHEN** a job status changes to `completed`
- **THEN** the system creates a warranty record containing: job ID, client ID, completion date, and warranty expiry date (completion date + 30 days)

### Requirement: Warranty visible in job history
The system SHALL display warranty status on completed jobs in the client's job history.

#### Scenario: Active warranty shown
- **WHEN** a client views a completed job within the warranty period
- **THEN** the job history entry shows a "Warranty Active" badge with the expiry date

#### Scenario: Expired warranty shown
- **WHEN** a client views a completed job after the warranty period has ended
- **THEN** the job history entry shows a "Warranty Expired" badge

### Requirement: Warranty summary in completion email
The system SHALL include warranty terms (coverage period and expiry date) in the job completion email sent to the client.

#### Scenario: Warranty included in receipt email
- **WHEN** the job completion email is generated
- **THEN** it includes a warranty section stating the coverage period and expiry date

## DEFERRED (Post-MVP)

The following requirements are out of scope for MVP and will be addressed in a future release:

- Warranty claim initiation by the client (requires legal/business sign-off on coverage terms)
- In-app warranty claim form and submission flow
- Operations team notification on claim submission
- Claim expiry enforcement and error messaging
