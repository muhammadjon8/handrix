## ADDED Requirements

> **MVP Scope Note**: Apple Sign-In is deferred post-MVP as it is primarily required for iOS App Store distribution. For MVP (web app), Google OAuth and email/password are sufficient.

### Requirement: Client registration
The system SHALL allow a new client to create an account using their email address and password, or via Google OAuth.

#### Scenario: Successful client registration with email
- **WHEN** a new user submits a valid email and password
- **THEN** the system creates an account, sends a verification email, and navigates the user to the home screen

#### Scenario: Duplicate email rejected
- **WHEN** a user submits an email address already registered
- **THEN** the system SHALL return an error message indicating the email is in use

#### Scenario: Google OAuth sign-in
- **WHEN** a user authenticates with Google
- **THEN** the system SHALL create or retrieve the matching account and log them in

### Requirement: Handyman registration
The system SHALL allow vetted handymen to register with a name, phone number, trade skills, and service area.

#### Scenario: Handyman profile created
- **WHEN** a handyman submits all required profile fields
- **THEN** the system creates a handyman account in `pending_approval` status

#### Scenario: Handyman approval gate
- **WHEN** an admin approves a handyman account
- **THEN** the handyman status changes to `active` and they can receive job dispatches

### Requirement: Login and session management
The system SHALL authenticate users and maintain secure sessions with JWT tokens, expiring access tokens after 24 hours with refresh token rotation.

#### Scenario: Valid login
- **WHEN** a user submits correct credentials
- **THEN** the system returns an access token and refresh token

#### Scenario: Invalid login
- **WHEN** a user submits incorrect credentials
- **THEN** the system returns a 401 error with a generic "invalid credentials" message

#### Scenario: Token refresh
- **WHEN** an access token has expired and the client sends a valid refresh token
- **THEN** the system issues a new access token and rotated refresh token

### Requirement: Role-based access control
The system SHALL differentiate between `client`, `handyman`, and `admin` roles, restricting API endpoints and UI pages accordingly.

#### Scenario: Client cannot access handyman endpoints
- **WHEN** a client-role user attempts to call a handyman-only API endpoint
- **THEN** the system returns a 403 Forbidden response

#### Scenario: Admin can view all users
- **WHEN** an admin requests the user list
- **THEN** the system returns all client and handyman records

## DEFERRED (Post-MVP)

The following requirements are out of scope for MVP and will be addressed in a future release:

- Apple Sign-In (required for iOS App Store; will be added when mobile apps are built)
