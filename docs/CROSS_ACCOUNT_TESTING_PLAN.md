# Cross-Account Testing Plan & Procedures

**Date**: March 20, 2026  
**Purpose**: Verify 100% functionality across all account types (Customer, Shop, Insurer, Admin)  
**Status**: Ready for Testing Phase  
**Build**: ✓ Clean (2238 modules, 0 errors)

---

## Overview

This document provides step-by-step procedures to verify that:
1. All account types can complete their full workflows
2. Data flows correctly between account types
3. Cross-account interactions work seamlessly
4. All UI/UX is professional and consistent
5. Error handling is graceful and user-friendly

**Total Test Items**: ~85+ interactions/workflows  
**Estimated Time**: 2-3 hours for comprehensive testing  
**Prerequisites**: Dev server running at `http://localhost:5175`

---

## TEST ENVIRONMENT SETUP

### Start Development Server
```bash
cd "/Users/molalignmeagher/BidOnDent Spreedsheet /BidOnDent-Production"
npm run dev
```

### Available Test Accounts (from Clerk)

| Account Type | Email | Password | Role |
|---|---|---|---|
| Customer | customer@test.com | TestPass123! | Damage Report Submission |
| Shop | shop@test.com | TestPass123! | Bid Management |
| Insurer | insurer@test.com | TestPass123! | Claims Management |
| Admin | admin@test.com | TestPass123! | System Administration |

**Note**: Create these accounts in Clerk dashboard if they don't exist

### Browser Requirements
- Chrome/Edge/Firefox (latest version)
- Responsive design testing: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- Console should show NO errors (only info/warn allowed)

---

## SECTION 1: PUBLIC PAGES TESTING

### 1.1 Landing Page
**URL**: `http://localhost:5175`

- [ ] Hero section with image and CTA buttons visible
- [ ] All section backgrounds render correctly
- [ ] Text is readable and professional
- [ ] Buttons clickable and respond properly
- [ ] Navigation bar visible at top
- [ ] No console errors

### 1.2 Navigation
- [ ] Logo clickable → returns to home
- [ ] "Get Started" button → opens Clerk modal
- [ ] "About" link → navigates to About page
- [ ] All buttons are properly styled

### 1.3 How It Works Section
- [ ] 4 steps visible and properly formatted
- [ ] Icons display correctly
- [ ] Text alignment looks professional
- [ ] Responsive on mobile

### 1.4 Operating Regions Map
- [ ] Map loads and displays correctly
- [ ] County markers visible
- [ ] Partner hub locations marked
- [ ] ZIP code input accepts values
- [ ] "Use My Location" button works (geolocation)
- [ ] Radius slider adjusts visualization
- [ ] Distance calculations appear accurate
- [ ] Nearest shops list updates when ZIP changes

### 1.5 Business Inquiry Forms
#### Shop Interest Form
- [ ] All fields visible and properly labeled
- [ ] Phone field accepts numbers only
- [ ] ZIP code field accepts 5 digits only
- [ ] Email field validates format
- [ ] Form submits successfully
- [ ] Success message displays

#### Insurer Partnership Form
- [ ] All fields visible
- [ ] Email validates
- [ ] Phone formats correctly
- [ ] Text area for notes available
- [ ] Form submits successfully
- [ ] Data saves to Supabase (check intake table)

### 1.6 About Page
- [ ] Contains professional content
- [ ] "Back to Home" button works
- [ ] No placeholder text visible
- [ ] Styling matches landing page

### 1.7 Insurer Partnership Page
- [ ] Professional messaging
- [ ] Contact email: bidondent@gmail.com ✓
- [ ] Navigation works

### 1.8 Privacy Policy Page
- [ ] Professional privacy notice
- [ ] No "pending legal" placeholder text ✓
- [ ] Contact email visible
- [ ] "Back to Home" works

### 1.9 Footer
- [ ] All links present and functional
- [ ] Contact email is bidondent@gmail.com ✓
- [ ] Social links (if any) display correctly
- [ ] Footer appears on all pages

---

## SECTION 2: CUSTOMER ACCOUNT TESTING

### 2.1 Login & Setup
**Steps**:
1. Click "Get Started" on landing page
2. Select "Customer" account type
3. Enter customer@test.com / TestPass123!
4. Click "Create Account" or "Sign In"

**Verify**:
- [ ] Login succeeds
- [ ] Dashboard loads
- [ ] Welcome message shows customer name
- [ ] Account type shows as "Customer"

### 2.2 Home Dashboard
- [ ] First-time users see onboarding
- [ ] Stats display: Active Repairs, Completed Repairs, Avg Time, Total Savings
- [ ] Stats show reasonable numbers (not N/A)
- [ ] Four action buttons visible:
  - [ ] "New Repair Request"
  - [ ] "View Bids"
  - [ ] "Coverage Updates"
  - [ ] "Account Settings"

### 2.3 New Repair Request Workflow
1. Click "New Repair Request"
2. Verify form displays:
   - [ ] Title/header visible
   - [ ] Photo guide displayed
   - [ ] Vehicle year/make/model fields
   - [ ] Damage description text area
   - [ ] Location selector
   - [ ] Insurance claim toggle
   - [ ] Submit button

3. Fill form:
   - [ ] Enter "2020 Honda Accord"
   - [ ] Damage: "Front bumper dent from parking lot incident"
   - [ ] Location: "New York, NY"
   - [ ] Toggle insurance claim: Yes
   - [ ] Upload test images (if possible)

4. Submit:
   - [ ] Form validates (success or error message)
   - [ ] If success: Report created, confirmation displayed
   - [ ] If error: Error message is clear
   - [ ] Report appears in Reports list

### 2.4 Reports/Damage History
1. Navigate to "Reports" or similar screen
2. Verify:
   - [ ] List of all submitted reports visible
   - [ ] Shows report status (pending, bidding, closed)
   - [ ] Search/filter available if list is long
   - [ ] Can click report to view detail

3. Click report detail:
   - [ ] Photos display
   - [ ] Description visible
   - [ ] Status shows current state
   - [ ] Bid count displayed

### 2.5 Bids Screen
1. Navigate to "Bids" or "View Bids"
2. Verify:
   - [ ] List of bids on submitted reports
   - [ ] Shows shop name, rating, bid amount
   - [ ] Can view shop details
   - [ ] Can accept bid button present

3. Accept a bid:
   - [ ] Bid appears accepted
   - [ ] Status changes visibly
   - [ ] Confirmation message displays

### 2.6 Coverage/Operating Regions
1. Navigate to "Coverage Updates"
2. Verify same map functionality as landing page:
   - [ ] MAP displays
   - [ ] ZIP search works
   - [ ] Radius adjustment works
   - [ ] Geolocation button works
   - [ ] Nearest shops display

### 2.7 Account Settings
1. Click account menu/settings
2. Verify:
   - [ ] Profile info displays correctly (email, name, phone if set)
   - [ ] Account type shows "Customer"
   - [ ] "Edit Profile" button available
   - [ ] "Logout" button works

3. Edit Profile:
   - [ ] Form opens
   - [ ] Can update name/phone
   - [ ] Changes save
   - [ ] Profile updates reflect new values

### 2.8 Responsive Design
- [ ] Mobile (375px): All elements stack correctly
- [ ] Tablet (768px): Two-column layout works
- [ ] Desktop (1920px): Full layout displays properly
- [ ] No horizontal scrolling on mobile

### 2.9 Error Handling
- [ ] Try submitting empty form → Shows validation error
- [ ] Try entering invalid email → Shows format error
- [ ] Try losing internet → Shows network error
- [ ] All error messages are professional and helpful

---

## SECTION 3: SHOP ACCOUNT TESTING

### 3.1 Login & Setup
**Steps**:
1. Click "Get Started"
2. Select "Shop" account type
3. Sign in with shop@test.com / TestPass123!

**Verify**:
- [ ] Login succeeds
- [ ] Onboarding form displays (if first time)
- [ ] Can fill shop details:
  - [ ] Shop name
  - [ ] Phone (formats correctly)
  - [ ] Address, city, state, ZIP
  - [ ] Certifications (checkboxes)
  - [ ] Specialties (checkboxes)
  - [ ] Insurance/estimate capabilities (toggles)

### 3.2 Home Dashboard
- [ ] Welcomes shop by name
- [ ] Shows stats:
  - [ ] Pending Requests count
  - [ ] Active Jobs count
  - [ ] Monthly Revenue estimate
  - [ ] Completion Rate percentage
- [ ] Shows action buttons:
  - [ ] "View Requests"
  - [ ] "Active Jobs"
  - [ ] "Account Settings"

### 3.3 Requests Screen
1. Click "View Requests"
2. Verify:
   - [ ] Lists incoming damage reports
   - [ ] Shows customer name, vehicle, damage type
   - [ ] Can filter by status
   - [ ] Can search by customer/vehicle
   - [ ] Click report → shows full details with photos

3. Submit a bid:
   - [ ] Click "Submit Bid" on a report
   - [ ] Bid amount field available
   - [ ] Estimated time field available
   - [ ] Description/notes optional
   - [ ] Submit bid → appears in Active Jobs

### 3.4 Active Jobs Screen
1. Click "Active Jobs"
2. Verify:
   - [ ] Lists accepted jobs
   - [ ] Shows customer name, vehicle, bid amount
   - [ ] Shows job status progress
   - [ ] Can click job → view all details

3. Update job status:
   - [ ] Can change status (if applicable)
   - [ ] Can mark complete
   - [ ] Completion updates metrics

### 3.5 Competitor Analysis (if available)
- [ ] Can view/search other shops
- [ ] Rankings visible
- [ ] Review counts display
- [ ] Professional comparison layout

### 3.6 Account Settings
- [ ] Profile shows shop info:
  - [ ] Shop name
  - [ ] Address/Phone
  - [ ] Certifications
  - [ ] Specialties
- [ ] Can edit information
- [ ] Changes save

### 3.7 Cross-Account Visibility
**Test**: When logged in as shop, do you see jobs from multiple customers?
- [ ] Customer A's job visible
- [ ] Customer B's job visible
- [ ] Data displays correctly for each

---

## SECTION 4: INSURER ACCOUNT TESTING

### 4.1 Login & Setup
**Steps**:
1. Click "Get Started"
2. Select "Insurer" type
3. Sign in with insurer@test.com / TestPass123!

**Verify**:
- [ ] Login succeeds
- [ ] Setup form appears (if first time)
  - [ ] Company name
  - [ ] Contact person
  - [ ] Email
  - [ ] Phone (formats correctly)
  - [ ] Service area preferences
  - [ ] Partner shop preferences

### 4.2 Home Dashboard
- [ ] Welcomes insurer by name
- [ ] Shows metrics:
  - [ ] Active Claims count
  - [ ] Claims Resolved count
  - [ ] Partner Shops count
  - [ ] Avg Cycle Time (days)
- [ ] Action buttons:
  - [ ] "New Claim"
  - [ ] "View Claims"
  - [ ] "Partner Shops"

### 4.3 Claims Screen
1. Click "View Claims"
2. Verify:
   - [ ] Lists all claims
   - [ ] Shows claim number, customer, vehicle, amount
   - [ ] Status badge: pending/reviewing/approved/denied
   - [ ] Can filter by status
   - [ ] Can search by claim/customer
   - [ ] Can sort by date/amount

3. Click claim → view detail:
   - [ ] Customer contact info visible
   - [ ] Vehicle details (VIN, etc.)
   - [ ] Damage photos
   - [ ] Estimated damage amount
   - [ ] Shop bids received
   - [ ] Approval amount field
   - [ ] Claim timeline visible

### 4.4 New Claim Screen
1. Click "New Claim"
2. Verify form:
   - [ ] Claim number input
   - [ ] Customer selection (searchable dropdown)
   - [ ] Vehicle selection
   - [ ] Damage type selector
   - [ ] Incident date picker
   - [ ] Damage description text
   - [ ] Estimated damage amount field
   - [ ] Policy number placeholder shows real example ✓ (should be "e.g., POL-2024-0518")
   - [ ] Photo upload area

3. Fill & submit:
   - [ ] All validations work
   - [ ] Form submits successfully
   - [ ] New claim appears in claims list
   - [ ] Notification/confirmation shown

### 4.5 Partner Shops Screen
1. Click "Partner Shops"
2. Verify:
   - [ ] Lists all partner shops
   - [ ] Shows shop name, address, rating
   - [ ] Metrics displayed:
     - [ ] Completed jobs count
     - [ ] Avg turnaround time
     - [ ] Customer satisfaction rating
     - [ ] Insurance approval rate
   - [ ] Can click shop → details

3. Shop details show:
   - [ ] Contact info
   - [ ] Certifications
   - [ ] Specialties
   - [ ] Recent completed jobs
   - [ ] Performance history

### 4.6 Claim Approval Workflow
1. On a pending claim, click "Approve" or similar
2. Verify:
   - [ ] Approval dialog/form opens
   - [ ] Amount field editable
   - [ ] Notes field available
   - [ ] Submit button
   
3. Submit approval:
   - [ ] Status changes to "approved" ✓
   - [ ] Amount saved
   - [ ] Timeline updates
   - [ ] Shop notified (if applicable)

### 4.7 Account Settings
- [ ] Profile shows company info
- [ ] Contact info displays
- [ ] Service areas visible
- [ ] Can edit information
- [ ] Changes persist

### 4.8 No Mock Data Check
**Important**: Verify that when you view claims, you see:
- [ ] Real customer data (not "Sarah Johnson" hardcoded)
- [ ] Real vehicle info (not sample VINs)
- [ ] Claims linked to actual reports ✓ (should show empty list if no reports exist)

---

## SECTION 5: ADMIN ACCOUNT TESTING

### 5.1 Login
- [ ] Can sign in as admin@test.com
- [ ] Dashboard loads
- [ ] Admin-specific menu visible

### 5.2 Admin Features (if available)
- [ ] View system health
- [ ] See intake submissions
- [ ] Manage accounts
- [ ] View activity logs
- [ ] System statistics

### 5.3 Intake Operations Panel (if visible)
- [ ] Shop submissions listed
- [ ] Insurer submissions listed
- [ ] Can approve/reject submissions
- [ ] Status updates work
- [ ] Activity log displays

---

## SECTION 6: CROSS-ACCOUNT DATA FLOW TESTING

### 6.1 Customer → Shop Data Flow
**Scenario**: Customer submits report → Shop sees it in requests

1. **As Customer**:
   - [ ] Submit new damage report
   - [ ] Note the report ID or description

2. **As Shop**:
   - [ ] Login to shop account
   - [ ] Go to "View Requests"
   - [ ] Can you see the customer's report?
   - [ ] [ ] YES → Data flows correctly ✓
   - [ ] [ ] NO → ISSUE: Data not visible to shop
   - [ ] Photos visible to shop?
   - [ ] Customer contact info visible?

### 6.2 Shop → Customer Data Flow
**Scenario**: Shop submits bid → Customer sees it

1. **As Shop**:
   - [ ] Submit bid on customer's report
   - [ ] Note the bid amount

2. **As Customer**:
   - [ ] Login to customer account
   - [ ] Go to "View Bids"
   - [ ] Can you see the shop's bid?
   - [ ] [ ] YES → Data flows correctly ✓
   - [ ] [ ] NO → ISSUE: Bid not visible to customer
   - [ ] Bid amount matches what shop entered?
   - [ ] Shop rating visible?

### 6.3 Insurer ↔ Shop Data Flow
**Scenario**: Insurer creates claim → Shop sees as request

1. **As Insurer**:
   - [ ] Create new claim
   - [ ] Note claim details

2. **As Shop**:
   - [ ] Check "View Requests"
   - [ ] Can you see the insurer's claim?
   - [ ] [ ] YES → Data flows correctly ✓
   - [ ] [ ] NO → ISSUE: Claim request not visible
   - [ ] Shop can submit bid on claim?

### 6.4 Customer ↔ Insurer Data Flow
**Scenario**: Insurer approves claim → Customer sees status

1. **As Insurer**:
   - [ ] Approve a claim
   - [ ] Note approval amount

2. **As Customer**:
   - [ ] Check their reports/claims
   - [ ] Does approval show?
   - [ ] Approval amount visible?

---

## SECTION 7: UI/UX CONSISTENCY TESTING

### 7.1 Button Styling
Check that across ALL screens:
- [ ] Primary buttons use PRIMARY_COLOR (#003d82)
- [ ] Secondary buttons use consistent styling
- [ ] Hover states work consistently
- [ ] Disabled states obvious
- [ ] No mixed button styles

### 7.2 Form Styling
- [ ] All input fields styled consistently
- [ ] Labels positioned consistently
- [ ] Error messages appear in same location/style
- [ ] Success messages consistent color (green)
- [ ] Required field indicators present

### 7.3 Colors & Branding
- [ ] Primary color (#003d82) used correctly
- [ ] Secondary color (#00a0e9) used for accents
- [ ] Green (#10b981) for success messages
- [ ] Red (#ef4444) for error messages
- [ ] No off-brand colors used

### 7.4 Typography
- [ ] Heading hierarchy clear (H1, H2, H3)
- [ ] Font sizes readable
- [ ] Line heights comfortable
- [ ] Text contrast meets WCAG AA ✓
- [ ] No overly long lines (>80 chars)

### 7.5 Spacing & Layout
- [ ] Consistent padding on cards
- [ ] Consistent margins between sections
- [ ] Proper whitespace usage
- [ ] No cluttered layouts
- [ ] Professional visual balance

### 7.6 Mobile Responsiveness
Test on 375px width:
- [ ] No horizontal scrolling
- [ ] Touch targets minimum 44px
- [ ] Text readable without zoom
- [ ] Stacked layout appropriate
- [ ] Mobile menu works if present

---

## SECTION 8: ERROR & EDGE CASE TESTING

### 8.1 Network Errors
- [ ] Simulate offline mode
- [ ] Forms show "Saving..." while request pending
- [ ] Error message if request fails
- [ ] Can retry operation
- [ ] Data doesn't duplicate on retry

### 8.2 Form Validation
- [ ] Empty form submission → validation errors
- [ ] Invalid email → error message
- [ ] Invalid phone → error message
- [ ] ZIP code wrong length → error
- [ ] Invalid URL → error
- [ ] Required fields marked
- [ ] Error messages helpful

### 8.3 Data Load States
- [ ] Loading spinners show while fetching
- [ ] "No data" message when list empty (not sample data)
- [ ] Timeout handling if request takes >30s
- [ ] Graceful degradation on partial data load

### 8.4 Permissions & Access
- [ ] Customer cannot access admin panel
- [ ] Shop cannot edit insurer claims
- [ ] Insurer cannot modify shop profiles
- [ ] Users cannot view other user's private data
- [ ] Proper 403/401 errors shown

### 8.5 File Upload (if applicable)
- [ ] File size limit enforced
- [ ] File type validation works
- [ ] Progress indicator shown
- [ ] Error on unsupported file type
- [ ] Upload can be retried

---

## SECTION 9: CONSOLE & PERFORMANCE TESTING

### 9.1 Console Errors
**Required**: Open browser DevTools (F12) → Console tab
- [ ] NO JavaScript errors during normal use
- [ ] NO TypeScript errors
- [ ] No network 404s for expected resources
- [ ] No CORS errors
- [ ] WARNING: Info/warn messages OK, errors NOT OK

### 9.2 Network Requests
**In DevTools → Network tab**:
- [ ] API requests return 200/201 status
- [ ] No failed requests (except timeouts tested)
- [ ] Images load successfully
- [ ] No redundant requests
- [ ] Response times reasonable (<2s for most)

### 9.3 Performance
- [ ] Initial page load <3 seconds
- [ ] No major lag when scrolling
- [ ] Form submission response <2s
- [ ] List loads without jank
- [ ] Navigation between pages smooth

### 9.4 Browser Compatibility
Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari/Edge (if available)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## SECTION 10: TEST RESULT SUMMARY

### Completion Counters
**Total Items to Test**: ~195 checkboxes

After testing, fill in:
- [ ] Items Passed: ____ / 195
- [ ] Items Failed: ____ / 195
- [ ] Pass Rate: ____ %

**Target**: 95%+ (allow minor issues)

### Critical Issues Found
Document any critical issues (complete failure of workflow):
1. ______________________
2. ______________________
3. ______________________

### Non-Critical Issues
Document any minor issues (workarounds available):
1. ______________________
2. ______________________

### Suggestions for Enhancement
1. ______________________
2. ______________________

---

## SIGN-OFF

**Testing Completed By**: ___________________  
**Date**: ___________________  
**Time Spent**: ___________________  

**Overall Assessment**:
- [ ] ✅ ALL ACCOUNT TYPES FULLY FUNCTIONAL
- [ ] ⚠️ MOSTLY FUNCTIONAL (List issues below)
- [ ] ❌ CRITICAL ISSUES BLOCKING USE (List below)

**Notes**:
_________________________________________________
_________________________________________________
_________________________________________________

---

## TROUBLESHOOTING GUIDE

### If Customer can't submit report:
1. Check network tab for API errors
2. Verify Supabase connection
3. Try creating new report
4. Check console for error messages

### If Shop doesn't see customer requests:
1. Verify both accounts logged in correctly
2. Check that customer Report actually created
3. Verify shop has correct account type
4. Check Supabase RLS policies

### If Bids don't appear:
1. Verify bids table has data
2. Refresh page to reload
3. Check browser cache
4. Try logout/login

### If Forms fail validation:
1. Open console (F12) → check for errors
2. Try different input values
3. Check field format requirements
4. Verify no network issues

---

## COMPLETION CRITERIA

✅ **PASS** when:
- All 4 account types can login
- Each reports their home dashboard metrics
- Cross-account data flows correctly (report → bid → acceptance)
- All forms work with validation
- No console errors during normal use
- Mobile responsive works
- Professional UI throughout

❌ **FAIL** if:
- Any account type completely unable to login
- Sample/mock data showing instead of real data
- Critical workflow (e.g., bidding) doesn't work
- Console errors during normal operation
- Placeholder phone numbers still visible in forms

---

**Testing Guidelines**: Be thorough but focus on actual functionality over cosmetics. The system should feel professional overall - minor spacing/color adjustments not critical. Focus on: Data persistence, Cross-account visibility, Error handling, and User workflows.

