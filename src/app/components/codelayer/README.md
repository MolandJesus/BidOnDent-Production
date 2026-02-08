# Codelayer Components

This directory contains legacy screen components that are still actively used in the application.

## ⚠️ Important

**Do NOT delete this directory** - These components are imported and used by:
- `/src/app/routers/DashboardRouter.tsx`
- Various screen components

## 📁 Contents

### Active Components (In Use)

**HomeScreen.tsx**
- Customer/Shop/Insurer dashboard home screen
- Shows contextual stats and quick actions
- Imported by: `DashboardRouter.tsx`

**ReportScreen.tsx**
- 5-step damage reporting flow
- Handles vehicle selection, photo upload, description
- Imported by: `DashboardRouter.tsx`

**ReportScreen subcomponents**
- Extracted into `codelayer/report/` for maintainability

**BidsScreen.tsx**
- Displays received bids for damage reports
- Allows bid comparison and shop selection
- Imported by: `DashboardRouter.tsx`

**AccountScreen.tsx**
- User account settings and profile management
- Password change, profile photo upload
- Imported by: `DashboardRouter.tsx`

**AccountScreen subcomponents**
- Extracted into `codelayer/account/` for maintainability

**ImageWithFallback.tsx**
- Image component with error handling and fallback
- Used by multiple screen components
- Imported by: Various screens in `/src/app/components/`

### Unused Components (Safe to Remove)

**AppLayout.tsx** - Not currently imported anywhere

## 🔄 Organization Notes

These components live in `src/app/components/codelayer` to keep legacy screens grouped and easy to find. If you decide to flatten them into `src/app/components`, update the imports in `DashboardRouter.tsx` and any other dependent files.

## 📝 Notes

- These components were created early in development
- They follow similar patterns to newer components in `/src/app/components/`
- The naming convention (Screen suffix) is consistent
- They should be refactored to use custom hooks when migrated

---

**Last Updated**: February 8, 2026  
**Status**: Active (In Production Use)
