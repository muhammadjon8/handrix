# Implementation Roadmap — Handrix Home Service MVP

## 1. Project-Wide Infrastructure

- [ ] 1.1 Initialize project monorepo structure (Vite + Node.js/NestJS)
- [ ] 1.2 Provision managed PostgreSQL and Redis instances
- [ ] 1.3 Setup CI/CD pipeline (GitHub Actions) for backend and frontend deployment
- [ ] 1.4 Configure SendGrid (Email Notifications) and Stripe (Payments) integration keys

## 2. Backend Implementation (Node.js/NestJS)

### Database & Auth
- [x] 2.1 Finalize Database Schema (Users, Handymen, Jobs, Parts, Payments, Warranties)
- [x] 2.2 Implement `POST /auth/register` and `POST /auth/login` (JWT + Google OAuth tokens deferred)
- [x] 2.3 Implement Role-Based Access Control (RBAC) middleware for `client` and `handyman` roles

### AI & Job Classification
- [x] 2.4 Set up AI provider abstraction layer with Gemini 1.5 Flash (free tier) as default
- [x] 2.5 Implement `POST /intake/chat` (Session-bound AI conversation for job intake)
- [x] 2.6 Implement pricing engine — calculate quote from classified job (Labor + Parts + Transport)

### Job Lifecycle & Dispatch
- [x] 2.7 Implement `POST /jobs` (Create job from confirmed classification)
- [x] 2.8 Implement Geospatial Handyman Dispatch (PostGIS query for nearest available)
- [x] 2.9 Implement `POST /jobs/:id/accept` (Handyman acceptance and job locking)
- [x] 2.10 Implement `PATCH /jobs/:id/status` (REST endpoint for status changes)

### Real-Time & Notifications
- [x] 2.11 Set up Socket.io for Real-time status broadcasting (client rooms)
- [ ] 2.12 Implement SendGrid email triggers for booking, completion, and job offers

### Payments & Warranty
- [ ] 2.13 Implement Stripe PaymentIntent creation (pre-auth) on job booking
- [ ] 2.14 Implement Stripe Capture and receipt generation on job completion
- [ ] 2.15 Implement Warranty record generation system

## 3. Frontend — Client Web App (React)

### Authentication & Map
- [ ] 3.1 Build Login/Register screens (with Google OAuth)
- [ ] 3.2 Implement Google Maps Geocoding integration for service address lookup

### AI Intake Chat
- [ ] 3.3 Build Conversational AI Chat Interface for job description
- [ ] 3.4 Build Job Scope Confirmation screen (AI-generated summary)

### Booking & Tracking
- [ ] 3.5 Build Pricing Breakdown and "Accept & Book" screen
- [ ] 3.6 Build Stripe Elements (web) payment collection form
- [ ] 3.7 Build Active Job Status tracker (Real-time updates via Socket.io)

### History & Warranty
- [ ] 3.8 Build Job History page with list of past jobs
- [ ] 3.9 Build Warranty display (Active/Expired badges in history)

## 4. Frontend — Handyman Portal (React)

### Portal Basics
- [ ] 4.1 Build Handyman Login and Availability Toggle
- [ ] 4.2 Build Incoming Job Offer card with 60-second countdown timer

### Job Management
- [ ] 4.3 Build Job Details view (Address, Parts list, Client notes)
- [ ] 4.4 Add "Navigate to Job" deep-link (Google Maps intent)
- [ ] 4.5 Build Status Progression panel (I'm on my way → I've Arrived → Complete)

### Earnings
- [ ] 4.6 Build Earnings summary and job history list

## 5. Integration & QA

- [ ] 5.1 End-to-End Testing: Intake → Booking → Dispatch → Completion → Payment
- [ ] 5.2 Responsive design audit for mobile browsers (Chrome/Safari)
- [ ] 5.3 Initial seed of production data (Pricing Config + Handyman Profiles)
