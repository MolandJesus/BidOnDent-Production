# Jeffrey Future Updates Plan

## Context
This plan is based on requested platform updates for landing messaging, partnership intake, operational visibility, and future workflow expansion.

## What Is Implemented Now

### 1) Landing and Messaging Updates (minor)
- Replaced unverified public metrics with process-based trust messaging.
- Added region coverage section for NY service areas.
- Added dedicated About section that explains process transparency and opportunity.
- Updated footer links to real section anchors and partnership/contact flows.

### 2) Shop + Insurer Intake (minor/medium)
- Added Shop Signup form with required fields:
  - Shop name
  - DMV registration number
  - Location address
  - Website
  - Phone number
  - Email
  - Contact person
- Added Insurer Partnership form with company/contact details.
- Added Supabase inserts for both forms.

### 3) Activity Tracking Foundation (medium)
- Added platform activity event logging from landing submissions.
- Added SQL schema and setup script for:
  - shop_interest_submissions
  - insurer_interest_submissions
  - platform_activity_events

### 4) Lifecycle System Foundation (medium)
- Added reusable lifecycle timeline component for customer/shop/insurer screens.
- Integrated lifecycle timeline into:
  - report detail screen
  - shop active job detail modal
  - insurer claims cards
- Added workflow service methods for:
  - workflow event logging
  - job assignment creation
  - job assignment status updates
- Added schema support for `job_assignments` with RLS policies and indexes.

## Work Remaining (next milestones)

### Milestone A: Intake Ops Workflow (medium)
- Build internal review dashboard for submitted applications.
- Add status transitions with notes:
  - submitted -> reviewing -> approved/rejected
- Add email/webhook notifications for status changes.

### Milestone B: Customer Bid Lifecycle Visibility (major)
- Add explicit process timeline shown to users:
  - report submitted
  - shops notified
  - bids received
  - bid selected
  - repair scheduled
  - repair completed
- Persist state transitions to platform_activity_events.

### Milestone C: Shop Job Visibility (major)
- Ensure approved shop accounts can view assignable jobs by service area.
- Add filtering by ZIP/radius when coverage-map release is ready.

### Milestone D: Insurer Partnership Portal (major)
- Add insurer info page and partnership workflow screen.
- Add insurer analytics view for claim routing and bid outcomes.

## Recommended Release Plan

### Release 1 (this branch)
- Landing copy updates
- Region coverage section
- Shop and insurer intake forms
- Intake schema + activity schema

### Release 2
- Internal intake review dashboard
- Application status management and notifications

### Release 3
- Full bid lifecycle timeline and analytics
- Shop job visibility improvements and ZIP/radius matching

## Validation Checklist
- Verify forms insert rows in Supabase tables.
- Confirm platform_activity_events rows are created per submission.
- Confirm all new landing anchors scroll correctly.
- Confirm build passes and no runtime errors.
