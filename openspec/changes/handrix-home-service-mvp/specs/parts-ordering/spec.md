## ADDED Requirements

### Requirement: Parts identification from job classification
The system SHALL automatically generate an initial parts list from the AI job classification output, including item name, estimated quantity, and unit cost from the supplier catalog.

#### Scenario: Parts identified for plumbing job
- **WHEN** a job is classified as a pipe leak repair
- **THEN** the system SHALL query the supplier adapter for relevant parts (e.g., pipe sealant, replacement fitting) and attach them to the job record

#### Scenario: Parts not found in catalog
- **WHEN** the supplier adapter returns no matching items for a classified job type
- **THEN** the system flags the job for manual parts review and includes a note in the handyman's job brief

### Requirement: Parts availability check
The system SHALL check parts availability in the supplier's inventory before confirming the order and quoting the client.

#### Scenario: Parts in stock
- **WHEN** all required parts are available
- **THEN** parts are included in the client pricing quote and reserved for the job

#### Scenario: Parts out of stock
- **WHEN** one or more parts are unavailable
- **THEN** the system SHALL attempt to substitute with an alternative from the supplier catalog or flag for manual resolution

### Requirement: Parts ordering on job confirmation
The system SHALL place a parts order with the supplier API immediately after the client confirms the upfront price.

#### Scenario: Order placed successfully
- **WHEN** the client confirms the price and the job is dispatched
- **THEN** the system places the order and records the supplier order ID against the job

#### Scenario: Order placement fails
- **WHEN** the supplier API returns an error
- **THEN** the system notifies the operations team for manual fulfillment and logs the failure without cancelling the job

### Requirement: Supplier adapter interface
The system SHALL implement a supplier adapter interface with methods `searchParts(query)`, `checkAvailability(partIds)`, and `placeOrder(orderLines)`, allowing different suppliers to be swapped without changes to the ordering logic.

#### Scenario: New supplier integrated
- **WHEN** a new supplier adapter is registered implementing the interface
- **THEN** the ordering flow routes correctly without changes to core business logic
