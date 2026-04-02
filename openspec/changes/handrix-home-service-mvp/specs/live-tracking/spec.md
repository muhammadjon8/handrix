## ADDED Requirements

> **MVP Scope Note**: Live map tracking with GPS coordinates is deferred post-MVP. For MVP, the client receives real-time job status updates via WebSocket. The handyman app shows a "Navigate to Job" link using Google Maps. No live map rendering or GPS broadcasting is implemented in this phase.

### Requirement: Real-time job status updates to client
The system SHALL push job status changes to the client browser in real time via WebSocket, reflecting the current phase of the job (dispatching, en_route, on_site, completed).

#### Scenario: Job status changes to en_route
- **WHEN** the handyman taps "I'm on my way"
- **THEN** the client's browser SHALL update the status display to "En Route" within 3 seconds without a page refresh

#### Scenario: Job status changes to on_site
- **WHEN** the handyman taps "I've Arrived"
- **THEN** the client's status display updates to "Handyman On Site"

#### Scenario: Job status changes to completed
- **WHEN** the handyman marks the job complete
- **THEN** the client's status display updates to "Job Complete" and links to the receipt

### Requirement: Status display on client job screen
The system SHALL show a clear step-by-step status indicator to the client for their active job, reflecting all states: Dispatching → En Route → On Site → Completed.

#### Scenario: No active job
- **WHEN** the client has no active job
- **THEN** the home screen SHALL display a prompt to start a new request

#### Scenario: Client refreshes page
- **WHEN** the client reloads the job status page
- **THEN** the current job status SHALL be fetched from the API and displayed correctly

## DEFERRED (Post-MVP)

The following requirements are out of scope for MVP and will be addressed in a future release:

- Live map display of handyman location on client screen
- GPS coordinate reporting from handyman device at intervals
- ETA calculation via Google Maps Routes API on each location update
- Adaptive location polling to preserve handyman device battery
