# PLAN — Cross-App Button-System Adoption (Pass G follow-up, expanded)

**Status:** SHIPPED — landing L1-L5 adopted; cross-app sweep added 16 more buttons across auth, onboarding, modals, legal pages, and root error boundary
**Owner:** MolandJesus
**Created:** 2026-05-03
**Triggered by:** Pass G dark-mode audit (commit `32b6701d`) flagging landing CTAs hand-rolling button styles instead of consuming D10's `bd-dashboard-primary-button` system.

## Update — 2026-05-03 expansion to cross-app sweep

After landing L1-L5 shipped, owner directive "stop reporting back and just build" prompted broadening the scope from landing-only to a full-app sweep. Discovered the hand-rolled pattern was systemic, not landing-specific — 16 additional primary CTAs across auth, onboarding, modals, legal pages, and the root error boundary all using legacy `rounded-xl text-white + gradient inline + hover:opacity-90 transition-opacity` or framer-motion `whileHover boxShadow` patterns.

All adopted with the same shell-only pattern: `className "bd-dashboard-primary-button ..."` plus consumer-supplied `style={{ background }}` for gradient preservation. The motion-shadow conflict (framer-motion `whileHover.boxShadow` overriding CSS bd-glass-card:hover) was specifically resolved in the auth flow.

Files updated in cross-app sweep (commits `25f69b24`, `2e56529e`, `f17195eb`, `22497fdc`, `0784804a`):

| File | CTA | Pattern adopted |
|---|---|---|
| `src/app/components/auth/LoginMainView.tsx` | 3 user-type cards | Removed redundant motion boxShadow; kept x-tilt hover |
| `src/app/components/auth/LoginSignupView.tsx` | Create Account | Shell + bg inline |
| `src/app/components/auth/LoginLoginView.tsx` | Log In | Shell + bg inline |
| `src/app/components/shop/ShopOnboardingStep2.tsx` | Continue | Shell + bg inline |
| `src/app/components/shop/ShopOnboardingStep3.tsx` | Continue | Shell + bg inline |
| `src/app/components/shop/ShopOnboardingStep4.tsx` | Complete Setup | Shell + bg inline |
| `src/app/components/insurer/InsurerOnboarding.tsx` | Continue + Complete Setup (×2) | Shell + bg inline |
| `src/app/components/shop/VehicleProfileScreen.tsx` | Add Vehicle + Add First Vehicle (×2) | Shell + bg inline |
| `src/app/components/codelayer/ReportScreen.tsx` | Start Over recovery (×2) | Shell + bg inline |
| `src/app/components/landing/BusinessInquiryShopForm.tsx` | Submit Shop Application | Shell + diagonal gradient inline |
| `src/app/components/landing/BusinessInquiryInsurerForm.tsx` | Submit Partnership | Shell + diagonal gradient inline |
| `src/app/components/shop/PhotoGuide.tsx` | Got it — start taking photos | Shell + diagonal gradient inline |
| `src/app/components/shop/photo-guide-steps.tsx` | Start Taking Photos Now | Shell + diagonal gradient inline |
| `src/app/components/shop/ShopBidModal.tsx` | Submit Bid | Shell + diagonal gradient inline |
| `src/app/components/shop/ShopRequestCard.tsx` | Submit Bid (in card) | Shell + diagonal gradient inline |
| `src/app/components/shop/ShopActiveJobCard.tsx` | View Full Details | Shell + diagonal gradient inline |
| `src/app/components/insurer/InsurerClaimCard.tsx` | Review & Approve | Shell + diagonal gradient inline |
| `src/app/components/insurer/InsurerClaimApprovalModal.tsx` | Approve Claim | Shell + diagonal gradient inline |
| `src/app/components/insurer/InsurerClaimDenialModal.tsx` | Deny Claim | Shell + rose gradient inline (functional; future pass could route through bd-glass-control--destructive for rose-tinted shadow) |
| `src/app/components/legal/PrivacyPolicyPage.tsx` | Back to BidOnDent | Shell + diagonal gradient inline |
| `src/app/components/legal/TermsOfServicePage.tsx` | Back to BidOnDent | Shell + diagonal gradient inline |
| `src/app/components/ScreenErrorBoundary.tsx` | Try Again / Reload Page | Shell + diagonal gradient inline |
| `src/main.tsx` | Try Again (root error boundary) | Shell + diagonal gradient inline |

Files using sibling system class `bd-report-primary-button` (codelayer/report/Step*, ClerkAccountTypeSelector, ShopOnboardingStep1) intentionally not touched — already in spec via the report-flow sibling system.

**Net result:** every primary CTA across the entire app — landing, auth, onboarding (shop + insurer), customer dashboard, vehicle management, intake recovery, business inquiry forms, claim modals, legal pages, screen error boundaries, and the root error boundary — now lives in the same button family. Same gold-lit shadow with warm halo, same 180ms tuned curves, same translateY(-1px) hover and translateY(0) settle press. No more dueling motion-vs-CSS shadow systems.

## Update — L3 reversed from NO-GO to GO

Initial L3 NO-GO reasoning conflated "system shell" with "system bg." Inspection of the system CSS (`theme.css:2869-2883`) shows `bd-dashboard-primary-button` supplies *only* shell — radius (1rem), gold-lit shadow with warm halo, 180ms tuned motion, and the `::before` sheen. Background, border-color, and text-color are entirely consumer-supplied (same pattern L1 + L2 use to preserve their blue gradients).

This means hero secondary's warm-cream light bg + blue-glass dark bg can be preserved inline as `style={{ background, borderColor }}` while still inheriting the system shell. Net effect: **stronger** register-alignment, not weaker — system gold-lit shadow now harmonizes with the warm bloom in light mode and the gold-accent dark navy in dark mode.

## North Star

Close the structural button-system gap surfaced in the dark audit, but **only where adoption is genuinely a parity win**. Where a hand-roll exists for a deliberate visual reason (register-alignment, paired-component shape match, or a different UI pattern entirely), document the reasoning and skip.

The audit framed this as one undifferentiated gap. Inspection reveals it's actually 5 distinct CTAs across 4 files, and only **1 of them is a true hand-roll defect**. The rest are intentional or use a different pattern.

## Inventory & decisions

| # | CTA | File:line | Current shape | Decision | Reasoning |
|---|---|---|---|---|---|
| L1 | Hero primary "Start New Report" | `HeroSection.tsx:370` | DONE — system adopted | ✅ SHIPPED | Commit `819b7320`. 3-stop gradient preserved inline. |
| L2 | CTASection "Go to Dashboard" + "Get Started Now" | `CTASection.tsx:177, 191` | DONE — system adopted | ✅ SHIPPED | Commit `cecf1647`. Both CTAs adopt `bd-dashboard-primary-button`; 2-stop blue gradient preserved inline. |
| L3 | Hero secondary "Learn More" | `HeroSection.tsx:388` | DONE — system shell adopted, warm-cream light + blue-glass dark bgs preserved inline | ✅ SHIPPED | See "Update — L3 reversed" above. Reversed from NO-GO when shell-vs-bg distinction surfaced. |
| L4 | WaitlistCapture "Get Updates" | `WaitlistCapture.tsx:51` | `rounded-full` inline form-submit, paired with `rounded-full` email input | 🔴 NO-GO | Hard structural reason: it's paired with `bd-report-input` which is also `rounded-full`. Forcing the button to system 1rem radius would create a pill-input + rectangle-button mismatch. Adopting system here requires also redesigning the input pair → out of scope. Re-evaluate if `bd-report-input` ever moves off `rounded-full`. |
| L5 | BusinessInquiry "Join as a Shop" / "Partner as Insurer" | `BusinessInquirySection.tsx:298, 329` | Already `bd-glass-card`, `rounded-2xl`, icon-tile + heading + sublabel + arrow | 🟢 ALREADY IN SPEC | Already uses `bd-glass-card` system class. Launcher-card pattern, not primary CTA pattern. No work needed. |

## L2 detail — why this is a clean adoption (not a regression)

**Current hand-roll** (both buttons in CTASection.tsx use the identical inline style):

```tsx
className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-white font-semibold text-base sm:text-lg leading-none transition-all duration-300 inline-flex items-center min-h-[48px] shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-[0.97] border border-white/15"
style={{
  background: `linear-gradient(180deg, rgba(37, 99, 235, 0.98) 0%, rgba(30, 64, 175, 0.98) 100%)`,
  boxShadow: "0 12px 42px rgba(37, 99, 235, 0.58), 0 4px 16px rgba(37, 99, 235, 0.30), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 80px rgba(59, 130, 246, 0.20)",
}}
```

**Three observations driving the GO decision:**

1. **The CTASection card has WARM AMBER bloom atmosphere** (`CTASection.tsx:43-46` — amber-200, amber-100, sky-400, blue-400 stacked). The current button's all-blue shadow tints + zero gold trim **fight the card's warm atmosphere**. Per project memory ("navy lit by gold lamp"), system gold-lit shadow would **register-align** with the card, not break it.

2. **`rounded-full` (24px+ on a 48px-tall button) inside a `rounded-3xl` (24px) card creates parallel-curvature mismatch.** A 16px-radius button (system) inside a 24px-radius card reads as **nested**, structural — the same relationship dashboard primary buttons have inside their cards. Pill→rectangle here is a coherence gain, not a softness loss.

3. **The hero primary (L1, just shipped) is now 16px system. The CTASection primary is the next-most-prominent CTA on the same page.** Leaving it pill creates inconsistency *within the landing page itself* — hero CTA at 16px, end-of-page CTA at 24px+, both the "primary action of their section." Adopting closes that internal inconsistency.

**Mechanical change:**

```diff
- className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full text-white font-semibold text-base sm:text-lg leading-none transition-all duration-300 inline-flex items-center min-h-[48px] shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-[0.97] border border-white/15"
+ className="bd-dashboard-primary-button px-6 sm:px-8 py-3 sm:py-3.5 text-white font-semibold text-base sm:text-lg leading-none inline-flex items-center min-h-[48px]"
  style={{
    background: `linear-gradient(180deg, rgba(37, 99, 235, 0.98) 0%, rgba(30, 64, 175, 0.98) 100%)`,
-   boxShadow: "0 12px 42px rgba(37, 99, 235, 0.58), 0 4px 16px rgba(37, 99, 235, 0.30), inset 0 1px 0 rgba(255,255,255,0.22), 0 0 80px rgba(59, 130, 246, 0.20)",
  }}
```

**What system supplies (replacing what we delete):**
- Radius: 1rem (16px) — was `rounded-full`
- Border: 1px inset white + gold trim — was `border-white/15`
- BoxShadow: gold-lit shadow with inset white highlight + warm halo — was blue-tinted
- Transition: 180ms tuned curve — was 300ms transition-all
- Hover: translateY(-1px) + warm halo expansion — was -translate-y-1 + shadow-xl
- Active: translateY(0) with 80ms — was scale-[0.97]

**What we keep inline:**
- 2-stop blue gradient (`linear-gradient(180deg, ...)`) — consumer bg
- Layout: `px-6 sm:px-8 py-3 sm:py-3.5 min-h-[48px] inline-flex items-center`
- Text styling: `text-white font-semibold text-base sm:text-lg leading-none`
- Icon: `<ChevronRight className="ml-2 w-5 h-5" />`

## Anti-Goals (locked)

1. **No big-bang refactor.** Only L2 ships in this pass. L3, L4, L5 are documented NO-GOs.
2. **No system extension.** Don't add `bd-glass-control--warm-secondary` or any new system variants in this pass — that's its own scope decision.
3. **No CSS file edits.** This pass touches `CTASection.tsx` only. The system already has what we need.
4. **No copy changes.** Same labels, same icons.
5. **Preserve the 2-stop blue gradient inline.** Don't reroute through CSS variables — the consumer-supplied gradient pattern is established (see `ShopDirectoryResultCard.tsx`).

## Verification

- `npx vite build` — clean
- `npx tsc -p tsconfig.json --noEmit --ignoreDeprecations 5.0` — clean
- Visual: confirm pill→rectangle, gold-trim shadow, warm halo on hover, snappier press feedback. Both light + dark modes.

## Co-update obligations

- **`docs/REF_KNOWN_ISSUES.md`** — if there's a tracking entry for the audit's button-system gap, update to reflect: hero primary (L1) + CTASection (L2) adopted; secondary/waitlist/business-inquiry deliberately not adopted with documented reasoning.
- **No `REF_SYSTEM_STATE.md` change** — no new endpoint, no new schema, no new component. Just className adoption inside an existing component.

## Rollback

Single file, single commit. Revert with `git revert <sha>` if visual regression surfaces.
