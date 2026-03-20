# Identified Issues - Comprehensive List

**Status**: Actively being resolved  
**Date**: March 20, 2026  
**Total Issues Found**: 8 Problems + 4 Spelling/Text Issues

---

## SECTION 1: CRITICAL PROBLEMS (3-4 remaining)

### Problem #1: ✅ FIXED - Incorrect Support Email
**File**: [src/app/components/codelayer/HelpModal.tsx](src/app/components/codelayer/HelpModal.tsx)  
**Issue**: Email was `support@bidondent.com` (incorrect)  
**Solution**: Changed to `bidondent@gmail.com` and removed placeholder phone number  
**Status**: ✅ COMPLETED

---

### Problem #2: Placeholder Phone Numbers in Sample Data (12 instances)
**Impact**: High - Users see fake phone numbers like `(555) 123-4567` throughout UI  
**Locations**:
- [src/app/components/insurer/InsurerClaimsScreen.tsx](src/app/components/insurer/InsurerClaimsScreen.tsx#L24-L80) - Sample claims data with fake phone numbers (lines 31, 38, etc.)
- [src/app/components/insurer/InsurerPartnerShopsScreen.tsx](src/app/components/insurer/InsurerPartnerShopsScreen.tsx#L459) - New partner form placeholder
- [src/app/components/landing/BusinessInquirySection.tsx](src/app/components/landing/BusinessInquirySection.tsx#L283-L388) - Shop & insurer form placeholders (2 instances)
- [src/app/components/shop/ShopOnboarding.tsx](src/app/components/shop/ShopOnboarding.tsx#L189) - Onboarding form placeholder
- [src/app/components/insurer/InsurerNewClaimScreen.tsx](src/app/components/insurer/InsurerNewClaimScreen.tsx) - Possible instances in claim forms
- [src/app/components/auth/LoginModal.tsx](src/app/components/auth/LoginModal.tsx) - Account setup form

**Root Cause**: Default placeholder text in form fields and sample mock data

**Solution Strategy**:
1. Replace concrete `(555)` phone placeholders with descriptive text
2. Keep format examples in hints/labels, not in placeholder values
3. Update sample data to use "Contact support" or remove phone entirely

**Examples of Replacement**:
- `placeholder="(555) 123-4567"` → `placeholder="Phone number"`
- Sample phone in mock data → Remove or set to `null`

---

### Problem #3: Sample/Mock Claims Data Used as Fallback
**File**: [src/app/components/insurer/InsurerClaimsScreen.tsx](src/app/components/insurer/InsurerClaimsScreen.tsx#L23-L176)  
**Issue**: Component has hardcoded `sampleClaims` array that displays when no live data available  
**Lines**: 23-176 (sample claims), 175 (fallback logic)  
**Impact**: Users may see fake data instead of real database-driven claims  
**Current Code**:
```typescript
const sampleClaims = [ /* 3 claims objects with hardcoded data */ ];
const claimsSource = liveClaims.length > 0 ? liveClaims : sampleClaims;
```

**Solution**: Update component to:
1. Fetch live claims from Supabase `reports` table
2. Show "No claims yet" state instead of sample data fallback
3. Remove or mark sample data as development-only

---

### Problem #4: Mock Data in Report Detail Screens (Multiple Components)
**Files Affected**:
- [src/app/components/reports/ReportDetailScreen.tsx](src/app/components/reports/ReportDetailScreen.tsx#L55) - Mock interested shops (line 55)
- [src/app/components/reports/ReportsListScreen.tsx](src/app/components/reports/ReportsListScreen.tsx#L47) - Mock interested shops data
- [src/app/components/reports/CompetitorAnalysisScreen.tsx](src/app/components/reports/CompetitorAnalysisScreen.tsx#L34) - Mock competitor data
- [src/app/components/insurer/InsurerConnectionScreen.tsx](src/app/components/insurer/InsurerConnectionScreen.tsx#L22) - Mock insurers data
- [src/app/components/codelayer/BidsScreen.tsx](src/app/components/codelayer/BidsScreen.tsx#L45) - Mock bids data
- [src/app/components/insurer/InsuranceCompaniesScreen.tsx](src/app/components/insurer/InsuranceCompaniesScreen.tsx#L37) - Mock insurance companies

**Issue**: Multiple screens use hardcoded mock data arrays instead of querying Supabase  
**Impact**: Features don't reflect real data; user can't verify actual functionality

**Solution**:
1. Replace mock arrays with Supabase queries for real data
2. Implement proper error states and loading spinners
3. Ensure cross-account data visibility (shops visible to customers, etc.)

---

## SECTION 2: SPELLING/TEXT ISSUES (4 items)

### Spelling Issue #1: "Dont" vs "Don't"
**Found In**: [cspell.json](cspell.json) - Word exception list includes "Dont" 
**Problem**: Inconsistent apostrophe usage; should be "Don't"  
**Impact**: If this appears in UI text, it looks unprofessional  
**Action**: Check all occurrences of "Dont" and replace with "Don't"

---

### Spelling Issue #2: Placeholder Text "pending legal final"
**File**: [src/app/components/legal/PrivacyPolicyPage.tsx](src/app/components/legal/PrivacyPolicyPage.tsx#L23-L30)  
**Issue**: UI shows "Pending legal final..." and "temporary legal placeholder"  
**Lines**: 23, 29-30  
**Problem**: Production code should not expose internal process language  
**Solution**: 
- Replace with professional disclaimer: "Privacy policy under review. Please contact us for details."
- Or remove completely and link to secure policy URL

---

### Spelling Issue #3: Policy Placeholder Format
**File**: [src/app/components/insurer/InsurerNewClaimScreen.tsx](src/app/components/insurer/InsurerNewClaimScreen.tsx#L475)  
**Issue**: Placeholder shows `"POL-XXXX-XXXX"` (format pattern instead of example)  
**Problem**: User doesn't know actual format; looks like unfinished code  
**Solution**: Replace with real example: `"e.g., POL-2024-5678"`

---

### Spelling Issue #4: UI Text Consistency
**Potential Issues**:
- Check all capitalization (Title Case vs sentence case)
- Verify "Shop" vs "shop", "Customer" vs "customer", etc.
- Check for any typos in visible text across all components

**Action Items**:
- [ ] Search for inconsistent spacing in "Help Modal" vs "HelpModal"
- [ ] Verify all button labels are consistent
- [ ] Check form labels for consistent formatting

---

## SECTION 3: WORKFLOW/FUNCTIONALITY ISSUES

### Workflow Issue: Cross-Account Data Flow
**Problem**: Components retrieve data but may not respect account type visibility
**Example**: Insurer should see customer reports but not raw internal data
**Solution**: Verify Supabase RLS (Row Level Security) policies enforce proper data access

### Workflow Issue: Sample Data as Development Tool
**Problem**: Multiple screens have mock data but no dev-only flag
**Solution**: Implement feature flag or environment check:
```typescript
const isDevelopment = import.meta.env.DEV;
const dataSource = isDevelopment && !realData ? sampleData : realData;
```

---

## SECTION 4: CODE ORGANIZATION ISSUES

### Organization: Folder Structure
- [ ] Verify consistent naming: PascalCase for components, lowercase for utilities
- [ ] Check for any orphaned files or unused components
- [ ] Verify imports are relative to correct module boundaries

### Organization: Type Definitions
- [ ] All components should have proper TypeScript interfaces
- [ ] Avoid using `any` type (found in some report screen props)
- [ ] Ensure Supabase types are correctly imported

### Organization: Comments & Documentation
- [ ] Remove all `// Mock` or `// Sample` comments
- [ ] Replace with real implementation notes
- [ ] Add JSDoc for complex functions

---

## PRIORITY RESOLUTION ORDER

### 🔴 CRITICAL (Fix First):
1. **Problem #2**: Replace 12 fake phone placeholders (High-visibility issue)
2. **Problem #3**: Remove sample claims fallback (Data integrity issue)
3. **Spelling #2**: Fix Privacy Policy placeholder text (Professional appearance)

### 🟠 HIGH (Fix Second):
4. **Problem #4**: Replace mock data with Supabase queries  
5. **Spelling #3**: Fix policy number placeholder format
6. **Spelling #4**: Normalize UI text capitalization and formatting

### 🟡 MEDIUM (Fix Third):
7. **Spelling #1**: Fix "Dont" → "Don't" inconsistency
8. **Code Organization**: Audit and organize folder structure

---

## VERIFICATION CHECKLIST

After fixes:
- [ ] Build succeeds with zero TypeScript errors
- [ ] No console.error or console.warn in normal operation
- [ ] Search for "(555)" returns zero matches in codebase
- [ ] Search for "sampleClaims" returns zero matches in production logic
- [ ] All mock data has clear development-only comments
- [ ] Phone numbers in UI properly formatted (or removed)
- [ ] Privacy Policy shows professional disclaimer (not "pending legal")
- [ ] All visible text follows consistent capitalization
- [ ] No form placeholders contain obvious fake data

---

## NOTES

- Most issues are quick find-and-replace operations
- Sample/mock data itself isn't bad - just needs conditional display
- Placeholder phone numbers are the most visible issue to users
- Professional text/messaging matters for credibility

