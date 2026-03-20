# BidOnDent Comprehensive Test Plan

**Date**: March 20, 2026  
**Status**: In Progress  
**Goal**: 100% functional verification across all account types

---

## Test Scope

This document specifies every user interaction that must work across:
- **Customer** (damage report submission, bid review, repair tracking)
- **Shop** (request management, bid submission, workload tracking)
- **Insurer** (claim management, partner coordination, cost monitoring)

---

## 1. LANDING PAGE / UNAUTHENTICATED (PUBLIC)

### 1.1 Hero Section
- [ ] Hero section renders with correct image
- [ ] CTA buttons visible (colored appropriately)
- [ ] "Get Started" button opens Clerk sign-up modal
- [ ] "Learn More" button scrolls to How It Works section
- [ ] Hero text is professional and error-free

### 1.2 Navigation & Header
- [ ] Logo links back to home
- [ ] Get Started button in header works
- [ ] Navigation is sticky and responsive
- [ ] Mobile hamburger menu (if present) works

### 1.3 How It Works Section
- [ ] All 4 steps display correctly
- [ ] Icons render properly
- [ ] Text is aligned and readable

### 1.4 Benefits Section
- [ ] All benefit cards visible
- [ ] Images load correctly
- [ ] "For Shops", "For Customers", "For Insurers" subsections clear
- [ ] Icons and text align properly

### 1.5 Operating Regions / Coverage Map
- [ ] Interactive map renders
- [ ] County markers visible
- [ ] Partner hubs marked correctly
- [ ] ZIP code input accepts valid codes
- [ ] Radius slider adjusts visualization
- [ ] "Use Current Location" button works
- [ ] Nearest shops list generates dynamically
- [ ] Distance calculations are accurate
- [ ] Loading states are shown appropriately

### 1.6 Business Inquiry Section
- [ ] Shop signup form displays and submits
  - [ ] All fields validate (email, phone, ZIP, DMV)
  - [ ] Phone number auto-formats
  - [ ] ZIP code auto-formats
  - [ ] Form clears after successful submission
  - [ ] Success message displays
- [ ] Insurer partnership form displays and submits
  - [ ] All fields validate
  - [ ] Phone formats correctly
  - [ ] Success message displays
  - [ ] Form resets after submission

### 1.7 About Page
- [ ] Accessible via About link in navigation
- [ ] Displays professional content
- [ ] "Back to Home" button works

### 1.8 Insurer Partnership Page
- [ ] Accessible via footer or navigation
- [ ] Displays partnership information
- [ ] Contact information is bidondent@gmail.com
- [ ] "Back to Home" button functional

### 1.9 Privacy Policy Page
- [ ] Accessible via footer "Privacy Policy" link
- [ ] Shows legal placeholder with "pending legal final" marker
- [ ] Back button works
- [ ] Contact email is bidondent@gmail.com

### 1.10 Footer
- [ ] All links functional
- [ ] Contact email is bidondent@gmail.com
- [ ] Social links (if any) display correctly
- [ ] Footer renders on all sections

---

## 2. CUSTOMER ACCOUNT / WORKFLOWS

### 2.1 Login & Account Setup
- [ ] Clerk sign-up modal opens correctly
- [ ] User can sign in with email
- [ ] "Customer" account type can be selected
- [ ] Account setup form displays
- [ ] Profile fields validate correctly
- [ ] Setup completion redirects to dashboard

### 2.2 Dashboard - Home Screen
- [ ] Welcomes customer by first name
- [ ] Displays correct stat cards:
  - [ ] Active Repairs (number)
  - [ ] Completed Repairs (number)
  - [ ] Avg Repair Time (days)
  - [ ] Total Savings (dollars)
- [ ] Shows quick action buttons:
  - [ ] "New Repair Request" opens report form
  - [ ] "View Bids" navigates to bids screen
  - [ ] "Coverage Updates" navigates to map/coverage
  - [ ] "Account Settings" opens account menu

### 2.3 New Repair Request Workflow
- [ ] Photo guide displays with tips
- [ ] Can take/upload damage photos (at least 4 required)
- [ ] Photo preview displays correctly
- [ ] Can enter damage description
- [ ] Can select damage location on vehicle
- [ ] Can indicate insurance claim (yes/no)
- [ ] Form validates before submission
- [ ] Success message displays
- [ ] Report appears in Reports list

### 2.4 Reports / Damage History Screen
- [ ] Lists all customer reports
- [ ] Shows report status (pending, bidding, closed)
- [ ] Can filter/search by vehicle or date
- [ ] Can click report to view detail
- [ ] Report detail shows:
  - [ ] All photos uploaded
  - [ ] Damage description
  - [ ] Submitted date
  - [ ] Current status
  - [ ] Number of bids received

### 2.5 Bids Screen
- [ ] Lists all active bids on submitted reports
- [ ] Shows shop name, bid amount, rating
- [ ] Can view shop details
- [ ] Can accept a bid
- [ ] Accepted bid confirmation displays
- [ ] Bid status updates in list

### 2.6 Coverage / Operating Regions Screen
- [ ] Interactive map displays
- [ ] ZIP code search functionality works
- [ ] Radius adjustment works
- [ ] Geolocation button works
- [ ] Displays eligible service areas
- [ ] Shows nearest shops with distance

### 2.7 Account Screen
- [ ] Displays customer profile
- [ ] Can view profile information
- [ ] Email, name, phone display correctly
- [ ] "Account Settings" menu functions
  - [ ] Edit Profile modal opens
  - [ ] Profile fields are editable
  - [ ] Changes can be saved
  - [ ] Logout button works

### 2.8 Profile & Account Interactions
- [ ] Profile image can be displayed (if set)
- [ ] Email is correctly stored
- [ ] Phone number is correctly formatted
- [ ] Account type shows as "Customer"
- [ ] Created date displays correctly
- [ ] Notifications menu (if present) works

---

## 3. SHOP ACCOUNT / WORKFLOWS

### 3.1 Login & Account Setup
- [ ] Shop sign-up from Business Inquiry form or Clerk
- [ ] "Shop" account type selectable
- [ ] Shop onboarding form displays with:
  - [ ] Shop name input
  - [ ] Address, city, state, ZIP
  - [ ] Phone number (formatted)
  - [ ] Website (optional)
  - [ ] Operating hours
  - [ ] Certifications (checkboxes)
  - [ ] Specialties (checkboxes)
  - [ ] Insurance claim capability toggle
  - [ ] Free estimate capability toggle
- [ ] Form validation works correctly
- [ ] Setup completes and redirects to dashboard

### 3.2 Dashboard - Home Screen
- [ ] Welcomes shop by name
- [ ] Shows correct stat cards:
  - [ ] Pending Requests (number)
  - [ ] Active Jobs (number)
  - [ ] Monthly Revenue (est.)
  - [ ] Completion Rate (%)
- [ ] Shows quick actions:
  - [ ] "View Requests" tab
  - [ ] "Active Jobs" tab
  - [ ] "Account Settings" button

### 3.3 Requests Screen
- [ ] Lists all incoming damage reports
- [ ] Shows customer name, vehicle, damage type
- [ ] Reports include status badge
- [ ] Can filter by status (new, bidding, closed)
- [ ] Can search by customer or vehicle
- [ ] Click to view full report details
- [ ] Report detail shows all photos
- [ ] "Submit Bid" button opens bid dialog
- [ ] Bid form validates amount
- [ ] Bid submission success message
- [ ] Bid appears in Active Jobs list once accepted

### 3.4 Active Jobs Screen
- [ ] Lists all accepted jobs
- [ ] Shows customer name, vehicle, bid amount
- [ ] Shows job status progress
- [ ] Can click to view job detail
- [ ] Job detail shows:
  - [ ] Customer contact info
  - [ ] All damage photos
  - [ ] Bid amount and approval status
  - [ ] Repair timeline
  - [ ] Workflow status/progress
- [ ] Can update job status
- [ ] Can mark complete
- [ ] Completion updates dashboard metrics

### 3.5 Account Screen
- [ ] Displays shop profile
- [ ] Shows shop name, address, phone
- [ ] Shows certifications and specialties
- [ ] "Account Settings" menu works
- [ ] Edit profile modal opens
- [ ] Can update shop information
- [ ] Changes save correctly
- [ ] Logout works

---

## 4. INSURER ACCOUNT / WORKFLOWS

### 4.1 Login & Account Setup
- [ ] From Business Inquiry form or Clerk sign-up
- [ ] "Insurer" account type selectable
- [ ] Insurer onboarding displays:
  - [ ] Company name input
  - [ ] Contact person name
  - [ ] Email input
  - [ ] Phone number (formatted)
  - [ ] Service area preferences
  - [ ] Partner shop preferences
- [ ] Form validates and saves
- [ ] Setup complete, redirect to dashboard

### 4.2 Dashboard - Home Screen
- [ ] Welcomes insurer by name
- [ ] Shows correct metrics:
  - [ ] Active Claims (number)
  - [ ] Claims Resolved (number)
  - [ ] Partner Shops (number)
  - [ ] Avg Cycle Time (days)
- [ ] Quick actions:
  - [ ] "New Claim" button
  - [ ] "View Claims" tab
  - [ ] "Partner Shops" tab

### 4.3 Claims Screen
- [ ] Lists all claims
- [ ] Shows claim number, customer, vehicle, amount
- [ ] Status badge shows pending/reviewing/approved/denied
- [ ] Can filter by status
- [ ] Can search by claim number or customer
- [ ] Can sort by date or amount
- [ ] Click claim to view detail
- [ ] Claim detail shows:
  - [ ] Customer contact info
  - [ ] Vehicle details and VIN
  - [ ] Damage photos
  - [ ] Estimated damage amount
  - [ ] Shop bids received
  - [ ] Approval amount
  - [ ] Claim timeline

### 4.4 New Claim Screen
- [ ] Form displays with fields:
  - [ ] Claim number input
  - [ ] Customer selection dropdown
  - [ ] Vehicle selection
  - [ ] Damage type selector
  - [ ] Incident date picker
  - [ ] Damage description text
  - [ ] Estimated damage amount
  - [ ] Photo upload area
- [ ] Customer/vehicle can be searched
- [ ] Form validates before submission
- [ ] Success message displays
- [ ] New claim appears in claims list

### 4.5 Partner Shops Screen
- [ ] Lists all partner shops
- [ ] Shows shop name, address, rating
- [ ] Displays shop metrics:
  - [ ] Number of completed jobs
  - [ ] Average turnaround time
  - [ ] Customer satisfaction rating
  - [ ] Insurance approval rate
- [ ] Can click shop to view details
- [ ] Shop detail shows:
  - [ ] Contact information
  - [ ] Certifications
  - [ ] Specialties
  - [ ] Recent completed jobs
  - [ ] Performance metrics

### 4.6 Claim Approval Workflow
- [ ] Can approve a claim from detail view
- [ ] Approval dialog opens with amount field
- [ ] Amount validates
- [ ] Can add approval notes
- [ ] Approval saves and status updates
- [ ] Shop receives notification
- [ ] Claim timeline updates

### 4.7 Account Screen
- [ ] Displays company profile
- [ ] Shows insurer name, email, phone
- [ ] Shows service areas
- [ ] "Account Settings" menu works
- [ ] Edit profile modal works
- [ ] Save changes functionality
- [ ] Logout works

---

## 5. CROSS-ACCOUNT INTERACTIONS

### 5.1 Customer → Shop Notifications
- [ ] When customer submits report, shop sees it in Requests
- [ ] Damage photos are visible to shop
- [ ] Shop can submit bid
- [ ] Bid appears in customer's Bids list
- [ ] Customer can see shop details and rating

### 5.2 Shop → Customer Updates
- [ ] When shop submits bid, customer is notified
- [ ] Customer can accept bid
- [ ] Accepted bid status updates in shop's Jobs list
- [ ] Customer can see job progress
- [ ] Shop can mark job complete

### 5.3 Insurer ↔ Shop Coordination
- [ ] Insurer creates claim with shop partnership
- [ ] Shop sees incoming claim as request
- [ ] Shop can submit bid on claim
- [ ] Insurer sees shop bids
- [ ] Insurer can approve shop's bid
- [ ] Approved claim visible in shop's active jobs

### 5.4 Insurer ↔ Customer Updates
- [ ] Customer submits report with insurance claim
- [ ] Insurer can view customer's claim
- [ ] Insurer's approval is communicated to customer
- [ ] Customer sees approved claim status

---

## 6. DATA PERSISTENCE & CONSISTENCY

- [ ] All form submissions persist in Supabase
- [ ] Profile updates visible immediately
- [ ] Report lists accurate and up-to-date
- [ ] Bid status synchronizes across accounts
- [ ] Job progress updates in real-time
- [ ] Search filters work correctly
- [ ] No orphaned data (forms that don't save)
- [ ] File uploads persist and display correctly

---

## 7. UI/UX & PROFESSIONAL STANDARDS

### 7.1 Responsive Design
- [ ] Mobile (375px width) renders correctly
- [ ] Tablet (768px width) renders correctly
- [ ] Desktop (1024px+ width) renders correctly
- [ ] No horizontal scrolling on mobile
- [ ] Touch targets minimum 44px

### 7.2 Accessibility
- [ ] All form inputs have labels
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works
- [ ] Screen reader friendly (alt text on images)
- [ ] Error messages clearly shown

### 7.3 Professional Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] Consistent file naming (PascalCase for components)
- [ ] Organized folder structure
- [ ] Proper TypeScript types
- [ ] No unused imports
- [ ] No hardcoded strings (use constants)
- [ ] Consistent indentation (2 spaces)
- [ ] JSDoc comments on complex functions
- [ ] Consistent color usage via primaryColor/secondaryColor

### 7.4 Visual Design Consistency
- [ ] Button styles consistent across app
- [ ] Form inputs styled uniformly
- [ ] Card styles match throughout
- [ ] Color scheme cohesive
- [ ] Typography hierarchy clear
- [ ] Spacing/padding consistent
- [ ] Icon usage consistent

### 7.5 Loading & Error States
- [ ] Loading spinners show during async operations
- [ ] Success messages appear with green styling
- [ ] Error messages appear with red styling
- [ ] Form validation errors are clear
- [ ] Network errors are handled gracefully
- [ ] Timeout errors have user-friendly messaging

---

## 8. KNOWN ISSUES & FIXES

### Fixed ✓
- [x] BusinessInquirySection component missing imports
- [x] HelpModal email updated to bidondent@gmail.com (removed phone)

### Identified
- [ ] (To be filled as testing progresses)

---

## 9. TEST EXECUTION CHECKLIST

### Phase 1: Setup & Build
- [ ] npm run build succeeds with 0 errors
- [ ] Dev server starts without errors
- [ ] No TypeScript compilation errors
- [ ] Browser console clean (no errors)

### Phase 2: Public Pages
- [ ] Landing page tests (27 items)
- [ ] Form validation tests (12 items)
- [ ] Map interaction tests (8 items)

### Phase 3: Customer Account
- [ ] Setup & onboarding (5 items)
- [ ] Dashboard (8 items)
- [ ] Report workflow (12 items)
- [ ] Bid management (6 items)
- [ ] Account settings (5 items)

### Phase 4: Shop Account
- [ ] Setup & onboarding (10 items)
- [ ] Dashboard (6 items)
- [ ] Request management (8 items)
- [ ] Job tracking (8 items)
- [ ] Account settings (5 items)

### Phase 5: Insurer Account
- [ ] Setup & onboarding (8 items)
- [ ] Dashboard (7 items)
- [ ] Claims management (10 items)
- [ ] Partner coordination (8 items)
- [ ] Account settings (5 items)

### Phase 6: Cross-Account Integration
- [ ] Customer → Shop flows (6 items)
- [ ] Shop → Customer flows (4 items)
- [ ] Insurer ↔ Shop flows (5 items)
- [ ] Insurer ↔ Customer flows (3 items)

### Phase 7: Data & Quality
- [ ] Persistence tests (8 items)
- [ ] Responsive design (5 items)
- [ ] Code quality (8 items)
- [ ] Professional standards (7 items)

### Phase 8: Final Verification
- [ ] All tests passing
- [ ] Code organized professionally
- [ ] Documentation complete
- [ ] Ready for production

---

## Summary

**Total Test Items**: ~180 interactions/workflows  
**Completion Target**: 100%  
**Time Estimate**: Comprehensive (no time limit specified)

---

**Next Action**: Begin Phase 1 - Setup & Build Verification
