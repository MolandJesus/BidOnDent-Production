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

**BidsScreen.tsx**
- Displays received bids for damage reports
- Allows bid comparison and shop selection
- Imported by: `DashboardRouter.tsx`

**AccountScreen.tsx**
- User account settings and profile management
- Password change, profile photo upload
- Imported by: `DashboardRouter.tsx`

**ImageWithFallback.tsx**
- Image component with error handling and fallback
- Used by multiple screen components
- Imported by: Various screens in `/src/app/components/`

### Unused Components (Safe to Remove)

**AppLayout.tsx** - Not currently imported anywhere

## 🔄 Migration Plan

These components should eventually be moved to `/src/app/components/` for consistency with the rest of the codebase.

**Migration Steps**:
1. Move component from `/codelayer/` to `/src/app/components/`
2. Update imports in `DashboardRouter.tsx`
3. Update imports in any other dependent files
4. Test functionality
5. Remove original file from `/codelayer/`

**Priority Order**:
1. ImageWithFallback → Already exists in `/src/app/components/figma/ImageWithFallback.tsx`
   - Update all imports to use figma version
   - Remove codelayer version
2. HomeScreen → Move to `/src/app/components/HomeScreen.tsx`
3. ReportScreen → Move to `/src/app/components/ReportScreen.tsx`
4. BidsScreen → Move to `/src/app/components/BidsScreen.tsx`
5. AccountScreen → Move to `/src/app/components/AccountScreen.tsx`

## 📝 Notes

- These components were created early in development
- They follow similar patterns to newer components in `/src/app/components/`
- The naming convention (Screen suffix) is consistent
- They should be refactored to use custom hooks when migrated

---

**Last Updated**: December 23, 2024  
**Status**: Active (In Production Use)
