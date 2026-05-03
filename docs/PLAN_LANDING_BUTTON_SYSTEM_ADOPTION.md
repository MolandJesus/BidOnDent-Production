# PLAN — Landing Button-System Adoption (Pass G follow-up)

**Status:** SHIPPED (L1, L2, L3 adopted; L4 + L5 NO-GO with hard structural reasoning)
**Owner:** MolandJesus
**Created:** 2026-05-03
**Triggered by:** Pass G dark-mode audit (commit `32b6701d`) flagging landing CTAs hand-rolling button styles instead of consuming D10's `bd-dashboard-primary-button` system.

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
