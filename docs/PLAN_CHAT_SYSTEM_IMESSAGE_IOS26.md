# PLAN — Chat System (iOS 26 iMessage Design Language + BidOnDent Skin)

**Authority level:** PLAN — future direction, not current truth. Do not implement without owner-fired trigger condition (see §3).
**Created:** 2026-05-04
**Status:** PRE-EXECUTION — captured per owner directive 2026-05-04 ("plan on making chat system with apple imessage in ios 26 design language with our skin/theme to it in future planning after this many run").
**Companion docs:** [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) (no-new-features-during-hardening rule), [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) (Launch Scope Guardrails), [`REF_VISUAL_SYSTEM.md`](REF_VISUAL_SYSTEM.md) § Premium Glass Body Opacity + Directional Backlight Canon, [`MOLANDJESUS_DESIGN_DECISIONS.md`](MOLANDJESUS_DESIGN_DECISIONS.md), [`PLAN_POST_LAUNCH_ROADMAP.md`](PLAN_POST_LAUNCH_ROADMAP.md), [`bd-design-identity`](~/.claude/skills/bd-design-identity/SKILL.md) skill, [`supabase-clerk-edge-function`](~/.claude/skills/supabase-clerk-edge-function/SKILL.md) skill, [`supabase-storage-signed-urls`](~/.claude/skills/supabase-storage-signed-urls/SKILL.md) skill.

---

## 1. Why This Doc Exists

BidOnDent's current customer ↔ shop ↔ insurer interaction loop runs through:

1. Damage report submission (customer → shop marketplace)
2. Bid submission (shop → customer dashboard)
3. Bid acceptance (customer → confirms job_assignment)
4. Status updates (shop progresses repair stages)
5. Claim flow (customer ↔ insurer for covered repairs)
6. Email notifications (KI-002 — blocked on RESEND_API_KEY deployment)

**The gap:** there is no in-app conversational thread between customer/shop/insurer once a job is in progress. Edge cases — "do you have OEM Honda parts in stock?", "the dent is bigger than I thought, can you re-quote?", "claim adjuster is asking for additional photos" — currently force users out of BidOnDent into phone/SMS/email, breaking the spatial-first product DNA and severing the audit trail that LAW Law 4 ("every interaction logged") relies on.

A chat system would close this loop _inside the marketplace context_ — every message anchored to a specific damage report / bid / claim / job_assignment, with full audit trail and realtime delivery via existing Supabase infrastructure.

**Owner directive 2026-05-04 verbatim:** "also plan on making chat system with apple imessage in ios 26 design language with our skin/theme to it in future planning after this many run."

This doc captures the planning so when the trigger fires, the next AI doesn't have to re-derive principles, design language, architecture, or scope from scratch.

---

## 2. North Star (Aligns With LAW)

> **Chat is anchored to a transaction surface, never a standalone messenger.**
> Every message lives on a damage report, a bid, a claim, or a job_assignment. There is no "DM a random user" surface. There is no chat without a transaction context.

This preserves:

- **Map-first identity** — chat surfaces are accessible FROM map pins / report cards / bid cards, not from a separate "messages" tab that competes with the map.
- **LAW Law 4 (full audit trail)** — every chat thread is a child record of a transaction; no orphaned conversations.
- **Hardening Plan North Star** — chat exists to serve the core transaction loop, not as a separate feature. Filters: "Does this serve the core transaction OR protect product DNA?" → yes (closes existing edge-case gaps).

---

## 3. Trigger Conditions (Do Not Build Until ALL Fire)

Per [`LAW_HARDENING_PLAN.md`](LAW_HARDENING_PLAN.md) Launch Scope Guardrails: no new features during hardening. Chat is a new feature. Therefore it requires explicit triggers before activation.

**ALL FOUR must fire before this PLAN moves from PLAN → LAW execution authority:**

1. **Soft launch shipped.** First real customer → real shop → real bid → real job → real completion has happened. Hardening Plan North Star satisfied. Phase 6 smoke test green across Local Docker / Hosted Staging / Production.
2. **Email notifications operational.** [KI-002](REF_KNOWN_ISSUES.md) RESOLVED — `RESEND_API_KEY` deployed, `notifyCustomerNewBid`/`notifyShopBidStatus`/`notifyCustomerClaimDecision` verified delivering. Email is the lower-fidelity baseline; chat extends, doesn't replace.
3. **Owner explicitly authorizes.** Owner says "build chat" — not "should we?", not implied via "go full auto." Explicit per-bucket authorization same as KI-100 / KI-089 / theme.css split.
4. **Production user volume reaches threshold.** At least 5–10 active customer ↔ shop transaction loops in production data. Without real conversation friction, chat is a vanity feature and would drift toward standalone-messenger antipattern. Real friction tells us what messages users actually need to send.

If any trigger has not fired, this doc stays PLAN-tier and no code change happens.

---

## 4. Design Language: iOS 26 iMessage × BidOnDent Skin

### 4.1 What to borrow from iOS 26 iMessage

iOS 26 iMessage's defining elements (verify against actual iOS 26 reference at trigger time, not from cached training data):

- **Liquid-glass bubbles** — translucent gradient bubbles with directional top-cast lighting. Already aligned with BidOnDent's Premium Glass Body Opacity + Directional Backlight Canon (LAW, 2026-05-04). Inheritance is natural — BidOnDent's existing premium-glass language IS the bubble material.
- **Tapback reactions** — long-press / hover reveals inline reaction bar (heart, thumbs-up/down, ha-ha, !!, ?). Compact, doesn't shift layout.
- **Inline replies / threading** — reply-to-message creates a visual quote stack above the new bubble. No nested deep threading; one level of reply is sufficient for transaction context.
- **Read receipts** — small status text below sent bubble: "Delivered" → "Read 2:14 PM". Optional per user preference.
- **Typing indicator** — three dots in a small bubble while peer is composing.
- **Inline media embeds** — photo / video / voice memo render inside the bubble shape (rounded corners match bubble radius). Damage report photos reuse existing `storage://` pointer pattern + `hydrateSignedStorageUrl` (no new media path).
- **Date/time separators** — "Yesterday", "Last Tuesday", "11:42 AM" centered in the thread, not in bubbles.
- **Composer with rich attachment palette** — `+` button reveals: photo, voice memo, location pin, document, app extension menu. For BidOnDent context: photo (re-shoot damage area), location pin (mark new damage spot on the map), document (insurance form attachment), and BidOnDent-specific extensions: "send re-quote request", "request additional photos", "schedule call".
- **Dynamic Island integration** (iOS 26) — active conversation surfaces compact thread state at the top of the screen on iOS. Not applicable to web (no Dynamic Island on web), but the _principle_ of "minimal-footprint persistent context" can inform a thin sticky header on the chat surface that shows: anchor transaction (Report #123 — 2023 Honda Accord — In Repair), peer status (Online / Last seen 5m ago), and one-tap navigation back to the transaction.
- **Genmoji / sticker tray** (iOS 26) — explicitly OUT of scope. Custom emoji generation is consumer fluff that conflicts with BidOnDent's professional-marketplace identity.
- **Live transcription on voice memos** (iOS 26) — IN scope as accessibility win. Voice → text caption beneath bubble.

### 4.2 BidOnDent Skin (Locked Palette — No Deviation)

Every iOS 26 iMessage element above MUST adopt BidOnDent's locked visual canon:

- **Bubble palette:**
  - Outgoing (current user) bubbles: cool blue gradient `linear-gradient(180deg, rgba(96, 165, 250, 0.92), rgba(59, 130, 246, 0.86))` light / `rgba(30, 64, 175, *)` dark. NEVER iMessage's iOS-blue `#007aff` flat fill — that's Apple's brand, not ours.
  - Incoming (peer) bubbles: cool ice glass `linear-gradient(180deg, rgba(238, 247, 255, 0.78), rgba(219, 234, 254, 0.70))` light / `rgba(15, 23, 42, *)` dark. NEVER pure white per LAW Light-Mode Surface Rule.
  - Both registers carry the directional top-cast champagne lamp (`inset 0 1px 0 rgba(252, 240, 208, *)`) + bronze trim (`inset 0 -1px 0 rgba(140, 82, 22, *)`) — same directional triad as `bd-glass-card--landing` per Pass F canon.
- **Reactions:** reaction icons over a backing radial champagne aura matching `.bd-landing-cta-glow` utility (Pass H7). Premium gold accent, NOT Apple's reactions colors.
- **Typing indicator:** three cool-blue dots pulsing at the existing `bd-pin-pulse` rhythm. Map-first product DNA echo.
- **Read receipts:** secondary text in `text-slate-500` light / `text-slate-400` dark — same scale as map control labels.
- **Composer:** sits in a `bd-glass-card--dashboard` style panel with backdrop-filter blur, locked palette, and the same min-h-[44px] touch target the rest of the dashboard primary buttons use.
- **Date separators:** centered eyebrow text using `.bd-section-eyebrow` utility (champagne backing glow inherited).
- **Thread anchor header (Dynamic Island echo):** sticky `bd-glass-card--dashboard` micro-card with: 32×32 vehicle thumbnail (via existing `ImageWithFallback` + `hydrateSignedStorageUrl`), anchor record subtitle, peer status pill, "back to transaction" `iconButtonBaseClassName` button (44×44 per `mapSurfaceTheme.ts` HIG-compliant).

### 4.3 What MUST Be Forbidden (Inheriting LAW Hard Stops)

- **No pure-white bubbles** in light mode. LAW Light-Mode Surface Rule applies to chat bubbles same as panels.
- **No yellow-amber gold** anywhere. Locked Premium Gold Palette only — `rgba(196, 144, 65)` family + `rgba(196, 130, 45)` family + `rgba(140, 82, 22)` bronze + `rgba(252, 238–240, 204–208)` cream. Forbidden register grep applies to chat surfaces same as everywhere else.
- **No internal radial gold paint > 0.05α** on cool-bodied bubbles per Premium Glass Body Opacity + Directional Backlight Canon. The directional top-cast carries the gold; bubble bodies stay cool.
- **No 0.22α halo cap exceeded.** Backing reaction aura + composer focus halo + thread anchor lamp all must respect.
- **No Apple iMessage iconography copied.** Use BidOnDent's existing icon set (Lucide React) styled to canon. Borrowing Apple's specific glyphs creates trademark exposure and brand-blur.
- **No standalone "Messages" navigation tab** at the global level. Chat surfaces ONLY surface from a transaction anchor (report card, bid card, claim card, job_assignment card, map pin). The minute we add a global Messages tab, we've drifted into standalone-messenger territory.

---

## 5. Architecture Sketch

### 5.1 Data Model (Supabase, NOT auth/storage invariant change)

```sql
-- New tables (PostgreSQL via Supabase, RLS enforced via verify_jwt:false + Clerk JWT in handler)

CREATE TABLE public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Anchor transaction — exactly one of these is non-null (CHECK constraint)
  damage_report_id UUID REFERENCES public.damage_reports(id) ON DELETE CASCADE,
  bid_id UUID REFERENCES public.bids(id) ON DELETE CASCADE,
  claim_id UUID REFERENCES public.claims(id) ON DELETE CASCADE,
  job_assignment_id UUID REFERENCES public.job_assignments(id) ON DELETE CASCADE,
  -- Participants — Clerk user IDs of customer + shop + (optional) insurer
  customer_clerk_user_id TEXT,
  shop_clerk_user_id TEXT,
  insurer_clerk_user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  CHECK (num_nonnulls(damage_report_id, bid_id, claim_id, job_assignment_id) = 1)
);

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  sender_clerk_user_id TEXT NOT NULL,
  body TEXT,                          -- nullable for media-only messages
  media_urls TEXT[] DEFAULT '{}',     -- storage:// pointers ONLY (per LAW)
  reply_to_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ              -- soft delete
);

CREATE TABLE public.chat_reactions (
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  reactor_clerk_user_id TEXT NOT NULL,
  reaction_kind TEXT NOT NULL,        -- 'heart' | 'thumb-up' | 'thumb-down' | 'ha-ha' | 'exclaim' | 'question'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, reactor_clerk_user_id, reaction_kind)
);

CREATE TABLE public.chat_read_receipts (
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  reader_clerk_user_id TEXT NOT NULL,
  last_read_message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (thread_id, reader_clerk_user_id)
);
```

RLS: `chat_threads` rows readable only by listed participant Clerk user IDs (customer/shop/insurer) + admin. Same pattern as `damage_reports` row-level filters. Edge function enforces via `requireClerkSession()` + participant-match check, NOT via Supabase Auth (per LAW load-bearing fact 1).

### 5.2 Edge Function Routes (NEW — adds to `supabase/functions/server/handlers/`)

- `POST /chat-thread` — find-or-create thread for a transaction anchor (idempotent on anchor ID + participants)
- `GET /chat-thread/:id/messages` — paginated message fetch, signed URL hydration on `media_urls`
- `POST /chat-message` — send message; emits Supabase Realtime broadcast on `chat:thread:<id>` channel
- `POST /chat-reaction` — add reaction
- `DELETE /chat-reaction` — remove reaction
- `POST /chat-read-receipt` — mark message read; updates `chat_read_receipts`
- `DELETE /chat-message/:id` — soft delete (sender or admin only); peer sees "Message deleted" placeholder

ALL routes follow `supabase-clerk-edge-function` skill pattern: `verify_jwt: false` at gateway, `requireClerkSession()` inside handler. Media URL persistence follows `supabase-storage-signed-urls` skill: `storage://` pointers persisted, signed URLs hydrated on read.

### 5.3 Realtime Layer

Reuse existing `RealtimeBidService` pattern at [src/app/services/realtime/](src/app/services/realtime/). New service:

- `RealtimeChatService` — subscribes to `chat:thread:<id>` channel; fires `onMessage`/`onReaction`/`onTyping`/`onRead` callbacks.
- Channel cycling fix from KI-057 applies (StrictMode dev-mode cycle is already known and tracked).

### 5.4 Frontend Component Tree

```
src/app/components/chat/
├── ChatThreadDrawer.tsx           // bottom-sheet style, mobile-first
├── ChatThreadAnchorHeader.tsx     // Dynamic Island echo
├── ChatBubble.tsx                 // outgoing + incoming variants
├── ChatBubbleMediaEmbed.tsx       // image/video/voice rendered inside bubble
├── ChatComposer.tsx               // text + attachment palette
├── ChatReactionsBar.tsx           // long-press reveal
├── ChatTypingIndicator.tsx        // 3-dot bd-pin-pulse rhythm
├── ChatDateSeparator.tsx          // bd-section-eyebrow inline
├── ChatReplyQuoteStack.tsx        // reply-to context
└── attachments/
    ├── AttachmentPhotoPicker.tsx
    ├── AttachmentVoiceRecorder.tsx
    ├── AttachmentLocationPin.tsx       // map-first DNA echo: tap to drop pin on damage area
    ├── AttachmentReQuoteRequest.tsx    // BidOnDent-specific
    └── AttachmentScheduleCall.tsx      // BidOnDent-specific
```

Surface entry points (where chat opens FROM):

- Customer dashboard report card → "Message shop" → opens `ChatThreadDrawer` anchored to bid_id (or damage_report_id pre-bid)
- Customer bids screen → bid card → "Message shop"
- Shop requests screen → request card → "Message customer"
- Shop active jobs screen → job card → "Message customer"
- Map pin popup (existing `ReportLayerPopup`) → "Open chat" if a thread exists for that report
- Insurer claim detail → "Message customer/shop"

NEVER a global "Messages" tab.

### 5.5 Mobile-First Posture

Per LAW + Pass M/N/O mobile sweep direction:

- `ChatThreadDrawer` is a bottom-sheet (drag handle at top, dismissible via swipe-down). Modal posture only on tablet/desktop.
- All compact-button hits are min-h-[44px] (Apple HIG), upgrading from current map UI's 40px compact tier where chat reuses those utilities.
- Safe-area inset on composer's bottom padding (`env(safe-area-inset-bottom, 0px)`) per existing `ImmersiveMapResultsDrawer.tsx` pattern.
- No horizontal scroll at 375px viewport on any thread state (long peer name, deep reply quote stack, voice waveform).

---

## 6. Co-Update Rules When Activated

Per CLAUDE.md "Co-update rules" — when chat ships:

| Trigger                                                        | Must update                                                                                                                                   |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| New chat tables migration applied                              | `REF_SYSTEM_STATE.md` §3 (data model), `SUPABASE_SETUP_GUIDE.md` §9 (migration list)                                                          |
| New `/chat-*` edge endpoints                                   | `REF_SYSTEM_STATE.md` route map + `SUPABASE_SETUP_GUIDE.md`                                                                                   |
| New persisted `storage://` column (`chat_messages.media_urls`) | Verify `hydrateSignedStorageUrls` wired on every read endpoint per LAW load-bearing fact 4. Add to `SUPABASE_SETUP_GUIDE.md` §16 column list. |
| `RealtimeChatService` shipped                                  | `REF_SYSTEM_STATE.md` realtime section                                                                                                        |
| New Lucide icons or Radix primitives added                     | `REF_VISUAL_SYSTEM.md` icon inventory if a new family is introduced                                                                           |
| KI surfaced during build                                       | `REF_KNOWN_ISSUES.md` next free KI-### in same commit                                                                                         |
| This PLAN doc fulfilled                                        | Move to `docs/archive/` with archive date suffix; update cross-refs in same pass                                                              |

---

## 7. Open Questions for Owner Decision When Activated

These are the questions that should be answered explicitly before the first chat code commits, NOT during a long autopilot block:

1. **Which transaction anchors get chat first?** All 4 (report, bid, claim, job_assignment) at once, or stage them (bid first, then claim, then job_assignment, then report)?
2. **Insurer participation default.** When a claim is filed, is the insurer automatically added to the existing customer ↔ shop thread, or does claim get its own separate insurer ↔ customer thread?
3. **File retention.** Voice memos and photos in chat — same `bidondent-account-media` bucket, or new `bidondent-chat-media`? Same TTL or longer?
4. **Read receipts default.** On for all users, or per-preference opt-in (privacy-friendly default)?
5. **Push notifications.** Web Push API (browser push) or fall back to email-only (extends KI-002 path)? Mobile PWA installable?
6. **Voice memo transcription.** OpenAI Whisper API (paid, accurate) or browser-native Web Speech API (free, less accurate, limited browser support)?
7. **Search across threads.** Required at v1, or post-launch follow-up?
8. **Thread archiving / muting.** User-side controls — required at v1?
9. **Admin moderation.** Can admins read all threads (regulatory / dispute resolution)? Audit trail needed?
10. **Markdown / rich text.** Plaintext only at v1, or basic markdown (bold, italic, link)?

When the trigger conditions in §3 fire, the next AI should NOT proceed until these 10 are answered. They shape data model, UI scope, and integration points — wrong assumption costs a refactor.

---

## 8. References

- iOS 26 iMessage design language — verify against current Apple HIG / WWDC 2026 sessions at trigger time. Cached training data may be stale.
- BidOnDent locked visual canon: [`LAW_PROJECT_RULES.md`](LAW_PROJECT_RULES.md) § Premium Gold Palette + § Light-Mode Surface Rule + § Premium Glass Body Opacity + Directional Backlight Canon.
- Existing realtime pattern: [`src/app/services/realtime/RealtimeBidService.ts`](../src/app/services/realtime/RealtimeBidService.ts) — copy this shape for `RealtimeChatService`.
- Existing edge handler pattern: [`supabase/functions/server/handlers/bids.ts`](../supabase/functions/server/handlers/bids.ts) — copy this shape for chat handlers.
- Existing storage hydration pattern: [`supabase/functions/server/utils/storage.ts`](../supabase/functions/server/utils/storage.ts) — `hydrateSignedStorageUrls` MUST wrap every chat handler that returns `media_urls`.
- Existing bottom-sheet drawer pattern: [`src/app/components/shop/ImmersiveMapResultsDrawer.tsx`](../src/app/components/shop/ImmersiveMapResultsDrawer.tsx) — copy this shape for `ChatThreadDrawer`.
- Mobile compact button utilities: [`src/app/components/maps/mapSurfaceTheme.ts`](../src/app/components/maps/mapSurfaceTheme.ts) — chat will use the 44px tier (`buttonBaseClassName` / `iconButtonBaseClassName`) for primary actions.

---

## 9. What This Doc Is NOT

- It's NOT a backlog item. It's a deferred feature plan with explicit triggers.
- It's NOT a design spec. The next AI activating this still does its own per-component design pass against the locked canon — this doc gives the principles, not the pixel positions.
- It's NOT a license to start. Trigger conditions (§3) ALL must fire. Until then, this doc stays in `docs/` and no chat-related code lands.
- It's NOT current truth. PLAN tier — defers to LAW and REF.

When this doc is fulfilled, archive to `docs/archive/` with the established `_archived_YYYY-MM-DD.md` suffix and update README.md cross-refs in the same pass.

---

_Skill references: [`bd-design-identity`](~/.claude/skills/bd-design-identity/SKILL.md) (visual canon for chat surfaces), [`supabase-clerk-edge-function`](~/.claude/skills/supabase-clerk-edge-function/SKILL.md) (every chat edge handler), [`supabase-storage-signed-urls`](~/.claude/skills/supabase-storage-signed-urls/SKILL.md) (every chat media URL touch), [`mola-ai-relay-protocol`](~/.claude/skills/mola-ai-relay-protocol/SKILL.md) (when owner pastes multi-AI transcripts about chat scope or design)._
