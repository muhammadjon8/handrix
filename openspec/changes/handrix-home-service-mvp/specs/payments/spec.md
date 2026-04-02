## ADDED Requirements

### Requirement: Payment method registration
The system SHALL allow a client to save a credit/debit card via Stripe Elements (web), storing only the Stripe payment method ID server-side (never raw card data).

#### Scenario: Card saved successfully
- **WHEN** a client submits card details via the Stripe Elements payment form
- **THEN** the system stores the Stripe payment method ID against the client's account

#### Scenario: Duplicate card rejected
- **WHEN** a client attempts to save a card already on file
- **THEN** the system surfaces a message and does not create a duplicate entry

### Requirement: Payment pre-authorization on booking
The system SHALL place a pre-authorization (hold) on the client's card for the quoted total when the job is confirmed.

#### Scenario: Pre-auth placed
- **WHEN** the client confirms booking
- **THEN** a Stripe PaymentIntent is created with `capture_method: manual` for the quoted amount

#### Scenario: Pre-auth fails
- **WHEN** Stripe declines the pre-authorization
- **THEN** the job is not created and the client is prompted to update their payment method

### Requirement: Charge capture on job completion
The system SHALL capture the pre-authorized payment when the handyman marks the job complete.

#### Scenario: Job completed, charge captured
- **WHEN** the handyman marks the job complete
- **THEN** the system captures the PaymentIntent and sends a receipt to the client's email via SendGrid

#### Scenario: Job cancelled before dispatch
- **WHEN** a job is cancelled before a handyman is assigned
- **THEN** the pre-authorization is released immediately at no charge

### Requirement: Payment receipt
The system SHALL generate and send an itemized receipt to the client's email and store it in the app's job history on successful charge capture.

#### Scenario: Receipt delivered
- **WHEN** payment is captured
- **THEN** the client receives an email receipt and the job history entry shows "Paid" status with the receipt link
