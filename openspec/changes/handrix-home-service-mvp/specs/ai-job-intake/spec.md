## ADDED Requirements

### Requirement: Conversational job intake
The system SHALL present a chat-style interface powered by an LLM that guides the client through describing their repair need using natural language, requiring no structured form filling.

#### Scenario: Client describes a simple repair
- **WHEN** a client types "I have a leaking pipe under my kitchen sink"
- **THEN** the AI SHALL ask clarifying questions (e.g., drip or active flow? access panel available?) and extract job type, location, and material hints

#### Scenario: AI asks for location
- **WHEN** the AI has classified the job type but has no service address
- **THEN** the AI SHALL prompt the client to share or confirm their current location

### Requirement: Structured job classification output
The system SHALL use LLM function calling to produce a structured job object (job type, description, estimated duration, materials list) from the conversation before proceeding to dispatch.

#### Scenario: Classification complete
- **WHEN** the AI has sufficient information
- **THEN** the system SHALL call the `classify_job` function and populate a job draft with type, scope, estimated duration, and an initial parts list

#### Scenario: Low-confidence classification
- **WHEN** the AI cannot confidently classify the job with the information provided
- **THEN** the system SHALL ask one or two targeted follow-up questions before re-attempting classification

### Requirement: Job scope confirmation by client
The system SHALL present a plain-language summary of the classified job to the client for confirmation before generating a price or dispatching a handyman.

#### Scenario: Client confirms scope
- **WHEN** the client confirms the described job matches their need
- **THEN** the system proceeds to the pricing engine

#### Scenario: Client corrects scope
- **WHEN** the client indicates the summary is incorrect
- **THEN** the AI returns to conversation mode and collects corrections before reclassifying
