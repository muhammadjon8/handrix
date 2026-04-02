## ADDED Requirements

### Requirement: Handyman transport arrangement
The system SHALL coordinate transportation for the handyman to the job site. For MVP this involves surfacing the job address to the handyman app with a "Get Directions" deep-link to Google Maps; future versions may integrate ride-hailing APIs.

#### Scenario: Directions provided to handyman
- **WHEN** a job is accepted by a handyman
- **THEN** the handyman app SHALL display a "Navigate to Job" button that deep-links to Google Maps with the job address pre-filled

### Requirement: Materials delivery coordination
The system SHALL record the parts order fulfillment status and communicate a delivery ETA for materials to the handyman's current location or the job site.

#### Scenario: Parts delivery scheduled
- **WHEN** a parts order is placed and the supplier provides a delivery window
- **THEN** the system records the window and surfaces it to the handyman in their job brief

#### Scenario: Materials arriving after handyman
- **WHEN** the parts delivery ETA is later than the handyman's arrival ETA
- **THEN** the handyman brief SHALL note the parts ETA so he can plan accordingly

### Requirement: Logistics status visible to operations
The system SHALL expose a backend view (admin API) listing active jobs with handyman transport status and materials delivery status for manual intervention when needed.

#### Scenario: Operations monitors a job
- **WHEN** an admin queries the job logistics endpoint
- **THEN** the response SHALL include job ID, handyman status, handyman location last update, and parts order status
