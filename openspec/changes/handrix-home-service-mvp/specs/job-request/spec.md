## ADDED Requirements

### Requirement: Service address selection
The system SHALL allow the client to confirm their current GPS location or manually enter a service address before submitting a job request.

#### Scenario: Auto-detect location
- **WHEN** the client grants location permission
- **THEN** the system SHALL populate the address field with the reverse-geocoded address

#### Scenario: Manual address entry
- **WHEN** the client types an address into the search field
- **THEN** the system SHALL display autocomplete suggestions powered by Google Maps Geocoding API

### Requirement: Upfront price acknowledgment
The system SHALL display the total estimated cost (labor + parts + transport) to the client and require explicit acceptance before dispatching a handyman.

#### Scenario: Client accepts price
- **WHEN** the client taps "Accept & Book"
- **THEN** the system creates a confirmed job record and initiates handyman dispatch

#### Scenario: Client declines price
- **WHEN** the client taps "Decline"
- **THEN** the job is cancelled at no charge and the client returns to the home screen

### Requirement: Job status tracking by client
The system SHALL allow the client to view the real-time status of their active job (dispatching, handyman en route, on-site, completed).

#### Scenario: Status update received
- **WHEN** the job status changes on the backend
- **THEN** the client app SHALL update the status display within 3 seconds via WebSocket

#### Scenario: No active job
- **WHEN** the client has no active job
- **THEN** the home screen SHALL display a prompt to start a new request

### Requirement: Job history
The system SHALL allow the client to view a list of past jobs with status, date, cost, and a link to the warranty for completed jobs.

#### Scenario: View past job
- **WHEN** the client selects a completed job from history
- **THEN** the system displays job details, cost breakdown, and warranty status
