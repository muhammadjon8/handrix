## ADDED Requirements

### Requirement: Nearest-available handyman query
The system SHALL identify all handymen with `active` status and `available` availability state within the configured service radius, ranked by proximity to the job address.

#### Scenario: Handymen available
- **WHEN** a confirmed job is created
- **THEN** the system SHALL query the nearest available handyman within the service radius within 5 seconds

#### Scenario: No handyman available
- **WHEN** no handymen are available within radius
- **THEN** the system SHALL notify the client with an estimated wait time or offer to be added to a queue

### Requirement: Offer-based handyman acceptance
The system SHALL send a job offer to the top-ranked handyman and wait up to 60 seconds for acceptance before offering to the next candidate.

#### Scenario: Handyman accepts
- **WHEN** the handyman taps "Accept Job" within the offer window
- **THEN** the job is assigned to that handyman and dispatch status updates to `accepted`

#### Scenario: Handyman declines or times out
- **WHEN** the handyman taps "Decline" or 60 seconds elapse without response
- **THEN** the system moves to the next ranked handyman

### Requirement: Skill-based filtering
The system SHALL filter handyman candidates to those whose listed trade skills include the classified job type.

#### Scenario: Plumbing job routes to plumber
- **WHEN** a job is classified as `plumbing`
- **THEN** only handymen with `plumbing` in their skills list are considered for dispatch

### Requirement: Handyman availability state management
The system SHALL maintain a real-time availability state for each handyman (`available`, `on_job`, `offline`) updated by the handyman app and backend job events.

#### Scenario: Handyman goes online
- **WHEN** the handyman opens the app and taps "Go Online"
- **THEN** their state changes to `available` and they become eligible for dispatch

#### Scenario: Job assigned makes handyman unavailable
- **WHEN** a job is assigned to a handyman
- **THEN** their state automatically changes to `on_job`

#### Scenario: Job completed restores availability
- **WHEN** a job is marked completed
- **THEN** the handyman's state reverts to `available`
