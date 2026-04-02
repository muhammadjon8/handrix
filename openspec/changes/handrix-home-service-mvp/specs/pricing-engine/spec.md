## ADDED Requirements

> **MVP Scope Note**: Admin UI for updating pricing rates is deferred post-MVP. For MVP, rates are stored in a config table in the database and can be updated directly. All pricing calculation and client-facing display requirements are in scope.

### Requirement: Pre-job price calculation
The system SHALL calculate a total price before job dispatch by summing: labor estimate (job type × estimated duration × hourly rate), parts cost (from supplier catalog), and transport fee (flat or distance-based).

#### Scenario: Full price calculated
- **WHEN** a job is classified and parts are identified
- **THEN** the system produces a price breakdown with line items for labor, parts, and transport

#### Scenario: Price calculated without parts
- **WHEN** no parts are required for the job type
- **THEN** the parts line item is $0 and the total reflects only labor and transport

### Requirement: Transparent client price display
The system SHALL present the price breakdown in a human-readable itemized format to the client before they confirm the booking.

#### Scenario: Itemized price shown
- **WHEN** pricing is complete
- **THEN** the client UI shows "Labor: $X, Parts: $Y, Transport: $Z, Total: $T"

### Requirement: Price validity window
The system SHALL mark a calculated price as valid for 15 minutes. If the client has not confirmed within that window, the system recalculates before dispatch.

#### Scenario: Price expires
- **WHEN** 15 minutes elapse since price generation without client confirmation
- **THEN** the price is recalculated and the client is notified of any change before booking

### Requirement: Pricing engine configurability
The system SHALL read labor rates, transport fees, and markup percentages from a `pricing_config` database table (not hardcoded), so rates can be updated without a code redeploy.

#### Scenario: Rate updated in config table
- **WHEN** an authorized user updates the labor rate for a job type directly in the `pricing_config` table
- **THEN** new price calculations immediately use the updated rate

## DEFERRED (Post-MVP)

The following requirements are out of scope for MVP and will be addressed in a future release:

- Admin web UI for updating pricing rates without direct database access
- `PATCH /admin/pricing-config` API endpoint for rate management
