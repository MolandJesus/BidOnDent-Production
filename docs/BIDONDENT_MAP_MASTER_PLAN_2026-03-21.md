### Implementation Note — Pass T578 Shop Marker Clustering (2026-03-30)

- Enabled MapLibre native clustering on the shop GeoJSON source with `clusterMaxZoom: 14` and `clusterRadius: 50`.
- Cluster circles are color-stepped by density (blue < 10, indigo 10-24, violet 25+) with dark/light theme awareness.
- Cluster count labels rendered as white text over cluster circles.
- Existing shop layers (glow, circles, labels) now filtered to unclustered points only.
- Clicking a cluster expands to its calculated zoom level via `getClusterExpansionZoom()`, capped at 17.
- Strategic effect: **The map now scales visually to any metro density.** At low zoom, shops aggregate into readable clusters. At high zoom, individual markers appear with full interactivity. This is foundational infrastructure for any shop-dense market — without it, the map was unusable at city-level zoom. Cluster theming (e.g., color by average rating) is now possible as a future enhancement.

### Implementation Note — Pass T577 Route Error Recovery with Retry Action (2026-03-30)

- Added `onRetryRoute` callback through the full overlay chain, backed by `shopGuidancePreview.refreshRoutePreview()`.
- Route error banner in the guidance card now includes a "Retry Route" button matching the GPS recovery pattern from T573.
- Strategic effect: **Live navigation now treats route-fetch failure as a recoverable state, not a dead end.** Users can reattempt route computation without ending and restarting navigation. This pairs with the GPS recovery action (T573) to give the guidance HUD a consistent recovery vocabulary across both connectivity and location degradation.

### Implementation Note — Pass T576 List-Mode Navigation Control Buttons (2026-03-30)

- Added Pause/Resume + End navigation buttons to `ShopDirectoryRoutePanel` for active guidance sessions.
- Wired handlers through the `routePanel` data path so list-mode users can control navigation without entering immersive mode.
- Strategic effect: **List-mode navigation now has full session control parity with the immersive guidance card.** Users are never trapped in a navigation session without visible controls, regardless of which layout they're using.

### Implementation Note — Pass T575 List-Mode Guidance Duration Parity (2026-03-30)

- Wired `sessionActiveSeconds` through the `routePanel` data path so the sidebar route panel displays live trip duration during guidance and at arrival.
- Route panel stat grid swaps "Source" for "Duration" in guidance/arrival modes.
- Strategic effect: **List-mode guidance now shows real trip metrics instead of redundant route-source labels.** This closes the most visible feature parity gap between immersive and sidebar navigation layouts.

### Implementation Note — Pass T574 Trip Analytics Summary Post-Arrival (2026-03-30)

- Enhanced the shop guidance card arrival section from a single-line "Trip duration" message to a full trip-summary card with a 3-column stats grid (Duration, Distance, vs ETA).
- Added `formatEtaComparison()` to surface how the actual trip compared to the original route estimate.
- Strategic effect: **The arrival moment now provides trip-level analytics instead of a dead-end confirmation.** The stats grid reuses the in-drive glass-chip pattern for visual consistency. This creates a natural hook for future trip history and cloud-synced analytics.

### Implementation Note — Pass T573 Shop Guidance GPS Recovery Actions (2026-03-30)

- Exposed shop-navigation `retryGps` through the shop map orchestration layer and into the active guidance card.
- Added a state-aware recovery banner in `ShopDirectoryGuidanceCard` for degraded GPS states (`stale`, `lost`, `denied`) with a direct `Retry GPS` action.
- Strategic effect: **Shop turn-by-turn guidance now treats GPS degradation as a recoverable live-driving state, not just a passive warning.** This improves trust in the primary map surface without adding new chrome or splitting the navigation experience into separate dialogs.

### Implementation Note — Pass T572 Shop Guidance Speed-Limit Context Wiring (2026-03-30)

- Fixed the live-data handoff for shop turn-by-turn guidance by passing `speedLimitMph` through `ShopDirectoryMapOverlays` into `ShopDirectoryGuidanceCard`.
- Guidance speed tile now communicates the posted-limit relationship directly with comparison copy (`Limit 35`, `At limit 35`, `3 below 35`, `+5 over 35`) instead of relying on number color alone.
- Strategic effect: **Shop turn-by-turn guidance now surfaces the real road-speed context already available in the navigation stack.** This closes a trust gap in the live guidance HUD without adding new provider complexity or extra navigation chrome.

### Implementation Note — Pass T571 Bid-Sent Status on Request Cards (2026-03-30)

- Added `hasBid` prop to ShopRequestCard + `submittedBidIds` Set in ShopRequestsScreen. After successful bid submission, the request card switches from "Submit Bid" button to violet "Bid Sent — Awaiting Response" badge.
- Strategic effect: **The shop bid feedback loop is complete.** T567 provides toast confirmation, T571 provides persistent card-level status. Shops can now see at-a-glance which requests they've bid on without opening each card. Prevents duplicate bid attempts.

### Implementation Note — Pass T570 Completed/Resolved Visual Consistency (2026-03-30)

- Distinguished "completed" (violet = shop-claimed done) from "resolved" (emerald = customer-confirmed) across ReportDetailScreen, ReportsListScreen, and homeScreenData. Active repairs remain emerald "In Repair".
- Strategic effect: **Every report status is now visually unique.** The status progression is now visible at a glance: sky (pending) → blue (reviewing) → emerald (in repair) → violet (repair done) → emerald (confirmed). Combined with T569 (completion confirmation), the full lifecycle is both functional AND visually clear.

### Implementation Note — Pass T569 Report Completion Confirmation (2026-03-30)

- Added customer-side completion confirmation card in `ReportDetailScreen`. When shop marks repair "completed", customer sees a prominent card with shop info and a "Confirm Repair Complete" button that transitions status to "resolved" via Supabase.
- Strategic effect: **The core product loop is now fully closed.** Report → Bid → Accept → Repair → Complete → Customer Confirm → Resolved. "Resolved" status distinguishes confirmed-done from shop-claimed-done. This is the final transactional step in the marketplace flow.

### Implementation Note — Pass T568 Job Status Persistence Wiring (2026-03-30)

- Wired complete chain: `ShopActiveJobsScreen` → `DashboardRouter` → `buildDashboardRouterProps` → `updateJobAssignmentStatus` (service) → edge function → `job_assignments` table. Bid acceptance now calls `createJobAssignment` to create the record. Status updates map kebab-case (UI) to snake_case (backend).
- Strategic effect: **The core product loop now persists repair progress to backend.** Shop status updates (scheduled → in_progress → awaiting_parts → completed) are no longer local-only. This is the prerequisite for customer-side real-time repair tracking (reading `job_assignments.status` back to the customer view).

### Implementation Note — Pass T567 Bid Submission Success Feedback (2026-03-30)

- Added toast notification to `ShopRequestsScreen` after successful bid submission via `useNotifications().push()`. Shows "$X bid sent for [vehicle]" with category "bid" and deep link.
- Strategic effect: **The core marketplace action (shop submitting a bid) now has visual confirmation.** Combined with T564 (bid acceptance feedback) and T565 (notification bridge to bell), every major marketplace action now produces feedback: bid submission → toast, bid acceptance → toast + bell, job status update → toast + bell. The marketplace silence problem is eliminated for same-session events.

### Implementation Note — Pass T566 Active Repair Prominence on Home (2026-03-30)

- Fixed `formatStatus("active")` from "Reviewing Bids" to "In Repair". Changed active badge from blue to emerald. Home report cards show accepted shop name + bid amount for active repairs.
- Strategic effect: **Dashboard home now surfaces the critical customer state.** Combined with T563 (repair lifecycle in detail view) and T559 (acceptance confirmation), the customer experience for active repairs is now coherent from home → report list → report detail. All displays show consistent emerald styling and correct "In Repair" terminology.

### Implementation Note — Pass T565 Notification Bridge (2026-03-30)

- Bridged in-memory event stream (`useNotificationEvents`) to the legacy `Notification[]` feed powering the bell icon. `DashboardLayout` converts events to legacy format, merges with Supabase-sourced notifications, and routes mark-read callbacks to the correct system.
- Strategic effect: **Notification bell is no longer dead.** All marketplace action events (bid acceptance, job status) now appear in both the toast overlay AND the persistent bell icon feed. Unread badge count is accurate. Combined with T564, the marketplace feedback loop is now functional for same-session events. Cross-user persistence (Supabase) is the next notification milestone.

### Implementation Note — Pass T564 Action Feedback Notifications (2026-03-30)

- Wired `useNotifications().push()` in `BidsScreen` (bid accepted → toast + feed event) and `ShopActiveJobsScreen` (job status update → toast + feed event).
- Uses existing in-memory notification event stream; "bid" category auto-triggers toast overlay. "completed" status uses high priority.
- Strategic effect: **Marketplace is no longer silent.** Key transactional actions now produce immediate visual feedback. Combined with T559–T563, the full post-acceptance chain now has action → confirmation → notification. Foundation for Supabase-persisted cross-user notifications.

### Implementation Note — Pass T563 Customer-Visible Repair Progress (2026-03-30)

- Enhanced `customerLifecycle()` to accept optional `repairStatus` parameter — when provided, step 4 dynamically shows "Repair In Progress", "Awaiting Parts", or "Repair Finished" with matching descriptions.
- Added `repairStatus?: string` to `DamageReport` type for future backend wiring.
- Added "Active Repair" card to `ReportDetailScreen` — shows accepted shop name, bid amount, and timeline when report is active.
- Updated `ReportsListScreen` — "Active" badge becomes emerald "In Repair", accepted shop name shows instead of generic bids count.
- Strategic effect: **Closes the customer↔shop visibility loop.** Combined with T562 (shop status buttons), status changes now have a display path on both sides of the marketplace. Foundation for real-time wiring via job_assignments data.

### Implementation Note — Pass T562 Job Status Update Buttons (2026-03-30)

- Added contextual status-update action buttons to `ShopActiveJobDetailModal` (Start Repair / Awaiting Parts / Mark Completed).
- Local `statusOverrides` state in `ShopActiveJobsScreen` provides immediate feedback; updates propagate to detail modal and job cards.
- Strategic effect: **Enables repair lifecycle tracking.** Shops can now move jobs from pending → in-progress → awaiting-parts → completed. Combined with T559–T561, the full post-acceptance workflow is now functional: acceptance → contact → status tracking. Foundation for customer-facing progress visibility.

### Implementation Note — Pass T561 Contact Unlock on Bid Acceptance (2026-03-30)

- Unlocked Call/Email contact buttons on `ShopRequestCard` when bid status is `"accepted"` — `<a href="tel:">` and `<a href="mailto:">` with emerald styling.
- Strategic effect: **Completes the post-acceptance action chain.** T559 (customer confirmation) → T560 (shop visual signal) → T561 (shop contacts customer). The marketplace now supports real communication flow after a bid is accepted. Foundation for scheduling, job coordination, and status tracking.

### Implementation Note — Pass T560 Shop-Side Bid Accepted Signal (2026-03-30)

- Added `"accepted"` status to `ShopRequestCard` (emerald badge + "Bid Accepted — Job Active" state indicator replacing Submit Bid button).
- Updated `ShopRequestsScreen` and `ShopActiveJobsScreen` to recognize `"active"` report status as accepted/in-progress.
- Strategic effect: **Completes two-sided transactional closure.** Combined with T559 (customer confirmation sheet), both parties in the marketplace now have clear visual feedback when a bid is accepted. Foundation for shop-side contact unlock and scheduling.

### Implementation Note — Pass T559 Bid Accepted Confirmation Sheet (2026-03-29)

- Created `AcceptedBidConfirmationSheet` — mobile-first bottom sheet overlay shown after bid acceptance with shop details, mini-map preview, and "View Shop on Map" / "Stay on Bids" CTAs.
- Added `skipNavigation` flag to `onAcceptBid` to allow deferred navigation after Supabase persistence.
- Strategic effect: **Closes the biggest gap in the core product loop.** Bid acceptance is the customer's most important action; now it has proper transactional closure instead of a silent redirect. Foundation for post-acceptance lifecycle (scheduling, directions, next-steps guidance).

### Implementation Note — Pass T558 Insurer Partner Network Distribution Map (2026-03-29)

- Added partner-network distribution map panel to `InsurerPartnerShopsScreen` with pin-to-card focus linking.
- Strategic effect: **Completes the "every screen has spatial context" initiative.** All primary screens across all three roles (customer, shop, insurer) now have embedded map panels with auto-fit-bounds (T556) and pin tooltips (T557). The map-first product vision is now fully deployed to every surface.

### Implementation Note — Pass T557 Pin Tooltip for Embedded Maps (2026-03-29)

- Added a `Popup`-based tooltip to `DashboardMapPreview` that shows shop name or report label when a pin is tapped.
- Added `.bd-map-tooltip` CSS class to strip default MapLibre popup chrome for a minimal glass-pill appearance.
- Strategic effect: One change improves all 9+ embedded map panels. Pin taps now give immediate in-map feedback, critical for mobile where the linked card may be off-screen.

### Implementation Note — Pass T556 Auto-Fit-Bounds for Embedded Maps (2026-03-29)

- Added automatic bounding-box zoom to `DashboardMapPreview` so all pin-based map panels auto-frame their content when 2+ pins are present.
- Strategic effect: One change improves all 9+ embedded map panels simultaneously. Maps now always show the full geographic spread of their data, eliminating the common problem of outlier pins being off-screen.

### Implementation Note — Pass T555 Competitor Density Map (2026-03-29)

- Added competitor-density geography map panel to `CompetitorAnalysisScreen` using `CoveragePartnerShop[]` pins (blue) with pin-to-card focus linking.
- Strategic effect: Completes the "every screen has spatial context" initiative — all primary screens across all three roles (customer, shop, insurer) now have embedded map panels.

### Implementation Note — Pass T554 Saved Shops Geography Map (2026-03-29)

- Added saved-shops geography map panel to `LikedShopsScreen` using `CoveragePartnerShop[]` pins (blue) with pin-to-card focus linking.
- Strategic effect: Customers now have spatial awareness of their shortlisted shops, enabling distance-informed bid strategy and followup decisions.

### Implementation Note — Pass T553 Insurer Claims Geography Map (2026-03-29)

- Added a claim-geography map panel to `InsurerClaimsScreen` so insurers see claim locations on an interactive map alongside their claims list.
- Strategic effect: completes the third role's (insurer) spatial awareness loop, enabling geographic claim density analysis and partner shop coverage gap identification.

### Implementation Note — Pass T552 Shop Active Jobs Geography Map (2026-03-29)

- Added a job-geography map panel to `ShopActiveJobsScreen` so shops see active job locations for service route planning.
- Strategic effect: closes the shop-side spatial gap for active work, enabling geographic awareness of repair job distribution.

### Implementation Note — Pass T551 Reports List Overview Map (2026-03-29)

- Added a reports-overview map panel to `ReportsListScreen` so customers see all their submitted damage reports as amber pins on a single interactive map.
- Clicking a report pin navigates directly to the individual report detail screen, connecting spatial overview to detail drill-down.
- Strategic effect: completes the customer-side spatial feedback loop by providing a bird's-eye view of all active/pending/completed reports, reinforcing the map-first product identity.

### Implementation Note — Pass T550 Report Wizard Location Map Preview (2026-03-29)

- Added a mini-map preview to `StepServiceLocation` (report creation Step 3) so customers see exactly where their request will appear on the shop marketplace map.
- ZIP codes are resolved via `zipToCoordinates` and rendered as an amber pin on `DashboardMapPreview`. The preview only appears when a valid 5-digit ZIP resolves to known coordinates.
- Strategic effect: closes the spatial feedback gap during report creation, building customer trust at the earliest entry point of the core product loop (report → map → shop → action).

### Implementation Note — Pass T549 Request Geography Map in Shop Requests Flow (2026-03-29)

- Added a request-geography map panel to `ShopRequestsScreen` so shops now see incoming repair request locations on an interactive map alongside the request card list.
- Request ZIP codes are resolved to coordinates via `zipToCoordinates` and rendered as amber pins on `DashboardMapPreview`.
- Pin-to-card focus wiring: tapping a request pin highlights the corresponding card with an amber ring, connecting spatial awareness to the bidding decision.
- Strategic effect: closes the "Shop sees report map" gap in the core loop, giving shops spatial context for evaluating which requests to bid on based on proximity and density.

### Implementation Note — Pass T548 Accepted-Bid Route Handoff to Shop Directory (2026-03-29)

- Customer bid acceptance now writes accepted-shop execution context into website session memory before transition: shop query, map view mode, and report-origin context (when ZIP coordinates are available).
- After successful acceptance persistence, router flow now navigates directly into `shop-directory` so users immediately enter the map action surface.
- Strategic effect: closes the acceptance-step gap in the map-first loop by turning bid acceptance into an immediate map execution handoff instead of a dead-end status change.

### Implementation Note — Pass T547 Bid Geography Comparison in Customer Bid Flow (2026-03-29)

- Added a dedicated map-comparison panel to customer `BidsScreen` so bid decisions now include spatial context, not just price/timeline cards.
- Bidding shops with coordinates render as interactive map pins; the active report location renders as a report pin when ZIP coordinates are available.
- Selecting a shop pin now focuses the corresponding bid card, linking map interaction directly to acceptance workflow.
- Strategic effect: strengthens the core map-first loop at the decision step (`report -> map -> shop -> action`) by bringing map context directly into bid comparison.

### Implementation Note — Pass T539 Backend Status Visibility for Shop-Directory Map Data (2026-03-29)

- Shop-directory session state now surfaces partner-shop backend fetch errors (`coverageFetchError`) to rendering layers.
- Shop-directory shell now renders an explicit live-data warning banner when backend partner-shop fetch fails and demo fallback is disabled.
- Strategic effect: map users can distinguish true no-results states from backend availability failures, improving trust in map search outcomes.

### Implementation Note — Pass T538 Fullscreen Diagnostics Noise Cleanup + Control Density Refinement (2026-03-29)

- Provider-health telemetry now treats abort/cancel request churn as non-failure signal and strips abort-style noise from persisted diagnostics history.
- Fullscreen coverage planner diagnostics are no longer always surfaced in dev; they now require explicit environment opt-in.
- Dashboard shop-directory control density was reduced by tightening CTA styling and limiting origin quick-pick chip volume so the command panel stays map-first.
- Strategic effect: fullscreen map experiences now feel cleaner and less error-noisy while preserving diagnostics tooling behind an explicit debug gate.

### Implementation Note — Pass T537 Full-Screen Controls Redesign + Backend-First Partner-Shop Loading (2026-03-29)

- Refactored the shop-directory full-screen control section to a clearer grouped layout (framed view-mode selector + framed filter grid) with stronger active-state affordance and reduced pill clutter.
- Enforced backend-first behavior for coverage partner shops by requiring explicit env opt-in (`VITE_ENABLE_MAP_DEMO_FALLBACK=true`) before any demo fallback can render map shops.
- Strategic effect: improves map UI clarity in the primary full-screen surface and reduces risk of silent demo-data masking when live backend data is unavailable.

### Implementation Note — Pass T532 Guidance Card + Action Rail Overlap Fix (2026-03-29)

- NavigationActionRail now accepts an optional `className` prop for position override, keeping the shared component flexible.
- In the immersive map guidance context, the rail's mobile bottom offset is raised from `8rem` to `20rem`, clearing the guidance card (~250px tall) with breathing room.
- Strategic effect: mobile turn-by-turn guidance now has a clean, non-overlapping HUD with guidance card at bottom and action rail above it, matching Apple Maps-style layered control hierarchy.

### Implementation Note — Pass T531 Immersive Map Guidance Top-Bar Declutter (2026-03-29)

- During guidance mode, the search bar and split-view button are now hidden from the immersive map top bar, reducing mobile control density from 5 items to 3.
- Overlay position tightened during guidance to reclaim vertical map real estate.
- Strategic effect: the primary navigation flow now presents a cleaner, more focused HUD on small phones, reducing distraction and improving map visibility during turn-by-turn guidance.

### Implementation Note — Pass T530 Shop Directory Tablet-Shell Breakpoint Rebalance (2026-03-29)

- Added a dedicated tablet-landscape split breakpoint (`min-[960px]`) to the shop-directory map shell so list/map composition no longer waits for full desktop sizing.
- Promoted sidebar scroll and sticky map pane behavior to that threshold for steadier two-column interaction while preserving mobile stack and large-desktop tuning.
- Strategic effect: the primary map workflow now transitions more smoothly from phone -> tablet -> desktop in the core dashboard shop directory surface.

### Implementation Note — Pass T529 Coverage Map Tablet Breakpoint Upgrade (2026-03-29)

- Promoted coverage command-center desktop behavior from `xl` to `lg` so 1024-class tablet screens now receive sidebar + map composition instead of phone-style bottom-sheet-only behavior.
- Tuned browse and active-navigation map height strategy to `lg` thresholds (`84vh`) with intermediate spacing/padding transitions for cleaner control density on tablet.
- Strategic effect: dashboard coverage map now scales through mobile -> tablet -> desktop tiers with less breakpoint shock, improving map section access and readability on both iPad-class and desktop screens.

### Implementation Note — Pass T526-T528 Dashboard Map Stability + Mobile Guidance Access (2026-03-29)

- **T526**: Stabilized HomeScreen map shell by replacing fixed hero positioning + hard-coded content offset with sticky flow layout so dashboard map surfaces no longer break scroll/layering on mobile and desktop.
- **T527**: Added mobile turn-by-turn access in immersive shop map guidance: action rail + turn-list sheet now render in guidance mode, and route step data is fully wired from navigation hook to immersive UI.
- **T528**: Rebalanced mobile map browse ergonomics by opening coverage bottom sheet at a usable half snap and reducing hybrid shop-map pane height on mobile/tablet to restore scrollable access to map sections.
- Strategic effect: dashboard map experiences now preserve map-first immersion without trapping mobile users; turn-by-turn guidance remains reachable in full-screen mode and section browsing works across both phone and desktop layouts.

### Implementation Note — Support Pass T546-S (2026-03-30)

- Removed fake `Google` and `Apple` auth actions from the login and signup views and replaced them with honest `coming soon` guidance for social providers.
- Strategic effect: keeps the shared auth shell truthful about what login paths are actually live without touching the lead AI's active map rollout.

### Implementation Note — Support Pass T551-S (2026-03-30)

- Brought the shared notification center closer to the hardened overlay standard with dialog semantics, focus-on-open, and an explicit close affordance for the mobile fixed-panel presentation.
- Strategic effect: improves dashboard shell usability and accessibility in a shared control surface without drifting into the lead AI's active map/report rollout.

### Implementation Note — Support Pass T552-S (2026-03-30)

- Reframed the shared profile dropdown's notification state from `Synced` to `Refresh on`, added explicit button semantics to the remaining dropdown actions, and gave the panel a clearer region label.
- Strategic effect: keeps another shared dashboard/account surface honest and interaction-safe without drifting into the lead AI's active map/report rollout.

### Implementation Note — Support Pass T553-S (2026-03-30)

- Added explicit trigger-to-panel wiring (`aria-controls`) for the shared landing and dashboard header menus, plus stable labels/IDs for the mobile navigation and landing profile menu surfaces.
- Strategic effect: strengthens the shared site/dashboard navigation shell with clearer semantics while staying outside the lead AI's active product rollout.

### Implementation Note — Support Pass T554-S (2026-03-30)

- Tightened the dashboard sidebar account trigger into a clearer disclosure control and upgraded the global loading shell to announce itself as a live status surface with an explicit recovery action.
- Strategic effect: keeps shared shell state changes and recovery paths more legible without drifting into the lead AI's active product rollout.

### Implementation Note — Support Pass T557-S (2026-03-30)

- Added explicit accessible close labels to the shared account modal family so the primary dismissal action is no longer icon-only in settings/help/payment/profile/account overlays.
- Strategic effect: keeps the shared account shell more explicit and consistent for assistive-tech users without drifting into the lead AI's active product rollout.

### Implementation Note — Support Pass T556-S (2026-03-30)

- Tightened shared shell trigger semantics so landing/dashboard logo buttons, notification/profile toggles, and the account quick-actions surface now announce purpose and state more explicitly.
- Strategic effect: keeps the shared site/dashboard chrome clearer for assistive-tech and keyboard users without drifting into the lead AI's active product rollout.

### Implementation Note — Support Pass T555-S (2026-03-30)

- Added explicit navigation labeling and active-state semantics to the dashboard sidebar so its current-location cues are no longer visual-only.
- Strategic effect: strengthens shared dashboard navigation clarity without drifting into the lead AI's active product rollout.

### Implementation Note — Support Pass T550-S (2026-03-30)

- Restored clean terminal compatibility by tightening the shared `ReportPin` contract, aligning two map-panel screens with the current `latitude` / `longitude` coordinate shape, and normalizing the shop-request notification event payload.
- Strategic effect: keeps the repo back in a reproducible buildable state while staying in the support lane and avoiding broader rewrites inside the lead AI's active product rollout.

### Implementation Note — Support Pass T549-S (2026-03-30)

- Tightened the shared `theme.css` contrast tokens behind glass controls, light-mode badges, and popup-close hover states to address the active VS Code accessibility warning cluster.
- Strategic effect: improves shared shell accessibility and reduces editor noise in the common theme layer without touching the lead AI's active map rollout.

### Implementation Note — Support Pass T547-S (2026-03-30)

- Softened account save feedback in `AccountOverlays` so the shared shell no longer overstates cloud-sync certainty when surfacing profile-save status.
- Brought the full-screen `AccountScreen` admin panel up to the shared overlay standard with `Escape` dismissal, body-scroll locking, and dialog semantics.
- Strategic effect: keeps another shared account/admin shell path honest and behaviorally aligned without touching the lead AI's active map rollout.

### Implementation Note — Support Pass T548-S (2026-03-30)

- Reframed the account hero away from a static `Synced` promise toward a more truthful `Profile` identity badge and profile-management helper copy.
- Added explicit button semantics to the profile-photo action in `AccountHeader`.
- Strategic effect: keeps the top account shell aligned with the broader honesty sweep without touching the lead AI's active map rollout.

### Implementation Note — Support Pass T545-S (2026-03-30)

- Added explicit `type="button"` to the remaining login/signup view actions so the shared auth shell no longer depends on browser-default button behavior.
- Strategic effect: closes a small but real auth-form reliability seam without touching the lead AI's active map rollout.

### Implementation Note — Support Pass T544-S (2026-03-30)

- Brought `LoginModal` and `AccountTypeMigrationModal` up to the shared modal standard with dialog semantics, backdrop / `Escape` dismissal, body-scroll locking, and explicit button types.
- Strategic effect: keeps auth overlays behaviorally aligned with the rest of the hardened site/account shell without touching the lead AI's active map rollout.

### Implementation Note — Support Pass T543-S (2026-03-30)

- Brought `EditProfileModal`, `ShopProfileModal`, and `DeleteAccountModal` up to the shared modal standard with dialog semantics, backdrop / `Escape` dismissal, and body-scroll locking.
- Reset `ShopProfileModal` local form state from the latest props whenever it opens so old values and saved/error state do not leak across sessions.
- Strategic effect: improves shared account-shell reliability and consistency without touching the lead AI's active map rollout.

### Implementation Note — Support Pass T542-S (2026-03-30)

- Replaced dead FAQ buttons and the fake in-app help send flow with honest static support topics plus a real email-draft action in `HelpModal`.
- Hardened the help overlay with backdrop click, `Escape`, dialog semantics, and body-scroll locking to match the shared modal behavior standard.
- Strategic effect: keeps another shared account-support path truthful and functional without touching the lead AI's active map rollout.

### Implementation Note — Support Pass T541-S (2026-03-30)

- Tightened the shared account payment entry so it now reads `Payment Preview`, matching the fact that billing tools are not wired yet.
- Hardened `PaymentModal` with honest preview copy plus backdrop click, `Escape`, dialog semantics, and body-scroll locking.
- Strategic effect: keeps another shared account-shell path truthful and behaviorally consistent without touching the lead AI's active map rollout.

### Implementation Note — Support Pass T540-S (2026-03-30)

- Narrowed the shared settings entry points and modal title to `Appearance Settings` so site/dashboard/account shells no longer imply broader saved settings than the current code path actually persists.
- Replaced the dashboard header's faux search input with an explicit `Global search` coming-soon preview card.
- Strategic effect: keeps shared shell controls honest about what is live today without colliding with the lead AI's active map-context rollout.

### Implementation Note — Support Pass T539-S (2026-03-30)

- Tightened the shared profile dropdown so notification empty-state copy now respects the active appearance mode and notification rows use button semantics instead of clickable `div`s.
- Strategic effect: improves shared dashboard/site shell consistency and interaction quality without touching the lead AI's active map-context rollout files.

### Implementation Note — Support Pass T538-S (2026-03-30)

- Tightened the shared landing and dashboard mobile overlay shells so the underlying page no longer scrolls behind the mobile site menu or mobile notification overlay while those layers are open.
- Strategic effect: improves mobile shell polish and reduces interaction drift without touching the lead AI's active map-pin rollout and route-context files.

### Implementation Note — Support Pass T537-S (2026-03-29)

- Tightened the shared dashboard header so top-shell menus now dismiss on `Escape` and only register global listeners while open.
- Strategic effect: improves shared dashboard-shell stability without touching the lead AI's active map-pin and route-execution work.

### Implementation Note — Support Pass T536-S (2026-03-29)

- Hardened the shared settings modal and landing header mobile shell so overlays now close on backdrop or `Escape`, lock background scroll while open, and clear stale mobile menu state before auth/settings actions continue.
- Strategic effect: improves shared site/dashboard shell reliability without colliding with the lead AI's active map-product loop.

### Implementation Note — Support Pass T535-S (2026-03-29)

- Corrected the shared light-appearance shell so dashboard light mode now uses true light atmosphere/background tokens, and the Clerk setup/settings path now reacts to live appearance changes instead of styling from stale state.
- Strategic effect: improves dashboard/site light-mode consistency and preview accuracy without touching the lead AI's active bid-map handoff or immersive map surfaces.

### Implementation Note — Support Pass T534-S (2026-03-29)

- Hardened the remaining admin top-level health/check/delete response paths so edge-health status, admin-existence checks, and batch-delete summaries now normalize scalar fields and filter malformed per-user error rows before operator-facing UI consumes them.
- Strategic effect: reduces another isolated admin trust seam without touching the lead AI's active bids, map, or immersive shop execution surfaces.

### Implementation Note — Support Pass T533-S (2026-03-29)

- Hardened admin list-response handling so `listAdminUsers()` and `listAdminProfiles()` now sanitize remote records and discard malformed entries before they reach operator-facing UI state.
- Strategic effect: reduces one more low-conflict admin trust seam without touching the lead AI's active bids, map, or immersive shop finishing surfaces.

### Implementation Note — Support Pass T532-S (2026-03-29)

- Tightened the admin delete service contract and temporary delete utility so operator-facing deletion results no longer imply cleanup fields the current backend handler does not actually return.
- Strategic effect: keeps admin support tooling honest about its true backend contract without touching the lead AI's active map/product surfaces.

### Implementation Note — Support Pass T531-S (2026-03-29)

- Tightened admin delete messaging so operator-facing copy now states the current handler guarantee honestly: auth user plus profile removal, with other linked cleanup potentially separate.
- Strategic effect: keeps admin operating language aligned with the real backend behavior without touching the lead AI's active map/product finishing surfaces.

### Implementation Note — Support Pass T529-S (2026-03-29)

- Tightened master-context wording so the docs system now honestly describes `CLAUDE_AI_MASTER_CONTEXT.md` as the primary first-read context instead of the sole truth source.
- Strategic effect: future AI sessions are slightly less likely to over-trust one context file and more likely to follow the full startup path, without touching the lead AI's active product-finishing surfaces.

### Implementation Note — Support Pass T528-S (2026-03-29)

- Hardened cached user-data parsing so nested vehicle, report, bid, notification, and activity arrays are now filtered by expected runtime shape before the cache is reused.
- Strategic effect: reduces one more browser-cache trust seam in the shared user-data layer without touching the lead AI's active immersive-map and shop overlay files.

### Implementation Note — Support Pass T527-S (2026-03-29)

- Hardened admin edge-action helpers so account creation, deletion, and admin-role management now normalize response JSON into a known object shape before reading success or error fields.
- Strategic effect: reduces one more isolated support/admin trust seam without colliding with the lead AI's active immersive-map and routing-overlay work.

### Implementation Note — Support Pass T526-S (2026-03-29)

- Hardened website preference cloud hydration so remote `session_memory` payloads now need a sane object shape and reuse the same session-memory sanitizer as browser-local hydration before the app accepts them.
- Tightened two support-adjacent UI strings so upload/sync copy no longer overstates guarantees with `securely`.
- Strategic effect: keeps the website support layer's remote and local trust boundaries aligned while preserving honest wording outside the lead AI's active map overlay lane.

### Implementation Note — Support Pass T525-S (2026-03-29)

- Hardened website relationship cloud sync so remote payloads now need a sane object shape and parseable timestamp before their collections are merged back into website session memory.
- Strategic effect: reduces one more low-conflict trust seam in the website support layer without colliding with the lead AI's active immersive-map overlay cleanup.

### Implementation Note — Support Pass T524-S (2026-03-29)

- Tightened the fresh-session kickoff prompt so already-in-motion files are treated as owned when `git status` or recent tracker entries show active churn.
- Strategic effect: future support passes are slightly less likely to collide with the lead AI's finishing loop because the startup prompt now carries a concrete anti-collision rule, not just general lane labels.

### Implementation Note — Pass T521-T525 Lead-AI Release (2026-03-29)

- **T521**: Auto-scroll sidebar list to selected shop when map marker is tapped. Smooth-scroll with previous-selection tracking to avoid redundant scrolls.
- **T522-T523**: Compact navigation summary sheet — removed verbose Route Mode card, condensed metrics to inline row, 3-button compact action bar. Speed panel and action rail offsets reduced to match new panel height.
- **T524**: Maneuver card now shows following-step on mobile (was hidden). Typography smoothed across 3 breakpoints instead of 2.
- **T525**: Action rail touch targets increased to 44×44px minimum on mobile. Speed limit badge sizing smoothed between breakpoints.
- Strategic effect: Active navigation now exposes ~40% more map area on mobile. Map→list connection is immediate. All navigation overlay components have proper mobile touch targets and smoother responsive behavior.

### Implementation Note — Support Pass T523-S (2026-03-29)

- Tightened report-draft persistence so cached drafts now require a parseable timestamp string and the save path self-clears invalid payloads instead of writing them.
- Updated report draft saving to clear browser-stored draft state once the flow reaches step 6, which prevents stale completed drafts from being reused on the next visit.
- Strategic effect: closes one more low-conflict stale-browser-cache seam without touching the lead AI's active map/product finishing files.

### Implementation Note — Support Pass T522-S (2026-03-29)

- Hardened demo data writes so sanitized vehicle/report/bid collections now persist through safe browser-storage helpers and keep an in-session fallback when `localStorage` is blocked.
- Tightened demo update flows so merged demo vehicles, reports, and bids still need to satisfy the expected runtime shape before persistence.
- Strategic effect: protects another support-only browser-storage seam without touching the lead AI's active map/product finishing files.

### Implementation Note — Support Pass T521-S (2026-03-29)

- Hardened demo auth storage access so demo-user bootstrap, sign-in, sign-out, and profile updates now degrade more honestly when browser storage is blocked.
- Tightened merged demo profile updates so they still need to satisfy the expected `DemoUser` shape before persistence.
- Strategic effect: protects one more support-only browser-storage seam without touching the lead AI's active map/product finishing files.

### Implementation Note — Pass T507 (2026-03-29)

- Tightened persisted app-navigation state so malformed browser payloads are cleared or rewritten to a sanitized shape before the generic view-mode shell reuses them.
- Strategic effect: reduces one more browser-cache drift seam in shared app scaffolding without stepping into the lead AI's active product-finishing files.

### Implementation Note — Pass T506 (2026-03-29)

- Added shared safe local-storage helpers for the cloud-first user-data layer and reused them for last-active cache selection, legacy-cache migration, cache refresh, and cache cleanup.
- Strategic effect: hardens another user-data bootstrap seam so blocked browser storage degrades more cleanly instead of interfering with the cache-assisted cloud path.

### Implementation Note — Pass T505 (2026-03-29)

- Hardened startup appearance-mode persistence so invalid stored theme values are cleared and blocked browser storage falls back cleanly to OS preference instead of destabilizing app boot.
- Tightened provider-agnostic session ID bootstrap so cached session IDs must match the expected shape before reuse, and storage-access failures no longer break identity creation.
- Strategic effect: makes another shared browser-bootstrap seam more defensive without touching the lead AI's active map/product execution lane.

### Implementation Note — Pass T504 (2026-03-29)

- Hardened website session-memory hydration so browser-stored shop/map preference payloads now validate enums, IDs, timestamps, coordinates, viewport bounds, and cached saved-place/recent-search records before reuse.
- Added self-healing for malformed website session storage so broken JSON is cleared and semantically invalid cached memory is rewritten back to a sanitized shape.
- Tightened the docs operating layer so support-lane work explicitly skips already-churning lead-lane files instead of stacking edits into the lead AI's active finishing surface.
- Strategic effect: protects another shared browser-cache seam and makes future parallel support passes less likely to collide with active product finishing work.

### Implementation Note — Pass T503 (2026-03-29)

- Tightened the cloud-first user-data cache boundary so browser-stored `UserData` payloads now need a sane top-level shape before hydration or migration paths will trust them.
- Strategic effect: hardens another shared browser-cache seam without changing the product-facing map flow or competing with the lead AI’s main execution lane.

### Implementation Note — Pass T502 (2026-03-29)

- Clarified the lead-AI versus support-AI lane boundary in the docs operating layer so future parallel sessions are less likely to collide in the main map/product shells.
- Hardened demo-data hydration so browser-stored demo collections now validate record shape before they are reused.
- Strategic effect: improves parallel-work governance and treats one more browser-controlled support-layer seam as untrusted input.

### Implementation Note — Pass T501 (2026-03-29)

- Tightened relationship-sync normalization so browser-derived insurer/shop relationship collections now accept only positive integer IDs after coercion.
- Strategic effect: reduces malformed local-state bleed into cloud relationship sync without changing the higher-level session or map-product architecture.

### Implementation Note — Pass T500 (2026-03-29)

- Tightened the docs operating layer so `docs/README.md` now acts as a fast control surface, `BIDONDENT_FINISHING_MASTER_PLAN.md` is scoped back to execution policy, and the AI kickoff prompt is clearly optional rather than a competing truth source.
- Hardened demo-auth browser storage so malformed local user payloads are cleared instead of being trusted during hydration.
- Strategic effect: reduces startup ambiguity for future AI sessions and reinforces the rule that browser-controlled storage, even in demo flows, should be treated as untrusted input.

### Implementation Note — Pass T499 (2026-03-29)

- Tightened saved report-draft validation so browser-local draft hydration now rejects out-of-range steps and malformed optional address fields before the report flow consumes them.
- Strategic effect: reduces trust in browser-controlled local data without touching the lead AI’s active map-shell files.

### Implementation Note — Pass T498 (2026-03-29)

- Hardened geolocation cache hydration so session-stored coordinates must be finite, in-range, and paired with a sane timestamp before they are reused.
- Strategic effect: treats browser storage as untrusted input and lowers the chance of malformed local cache poisoning map-origin state during hydration.

### Implementation Note — Pass 497 (2026-03-29)

- Added lightweight live/paused/arrived status badges to shop result cards so route ownership is visible in the list and immersive drawer even before the user reads the CTA.
- Strategic effect: makes active navigation state legible inside browse surfaces, tightening the connection between the navigation shell and the recommendation cards around it.

### Implementation Note — Pass 496 (2026-03-29)

- Extended the shared shop-route CTA helper so arrival state now carries through to result cards, immersive drawer cards, selected-shop cards, and map popups instead of reverting to generic route wording after a completed trip.
- Strategic effect: makes route restart behavior feel like a coherent product rule across the entire shop experience, not a special-case label that only exists inside the map shell.

### Implementation Note — Pass 495 (2026-03-29)

- Propagated selected-shop arrival state into the shop route panel, popup, bottom overlay, and immersive map chrome so completed trips now render explicit `Trip complete` / `Arrived` messaging rather than falling back to ordinary preview language.
- Strategic effect: gives turn-by-turn a more honest post-arrival shell, which makes the navigation lifecycle feel complete instead of abruptly snapping back to browse UI.

### Implementation Note — Pass 494 (2026-03-29)

- Added lightweight arrival-confirmation toasts to both fullscreen coverage navigation and the shop directory’s active in-app route flow.
- Strategic effect: gives turn-by-turn a clearer completion moment without introducing another blocking arrival modal or fragmenting the navigation shell.

### Implementation Note — Pass 493 (2026-03-29)

- Added an arrival-completion signal to the shared route-preview layer so active navigation can end honestly when the destination has effectively been reached, instead of remaining indefinitely “live.”
- Coverage fullscreen navigation now drops back to browse mode on arrival, and the shop directory auto-ends its active session once the destination is reached.
- Strategic effect: moves turn-by-turn closer to a complete lifecycle product by giving navigation a clean end state, not just a clean start state.

### Implementation Note — Pass 492 (2026-03-29)

- Added an explicit voice-arming layer above shared route previews so live browse maps can still paint routes and step progress without speaking before the user intentionally starts in-app navigation.
- Coverage-map fullscreen flows now own that armed state, while the shop directory only allows spoken guidance and reroute/deviation announcements during an active session for the selected destination.
- Strategic effect: resolves a trust-breaking dashboard bug and makes turn-by-turn voice feel like a deliberate product mode instead of a side effect of route preview state.

### Implementation Note — Pass 491 (2026-03-29)

- Tightened the map shell’s live-session guards so selected-shop cards, popups, and floating guidance overlays now only present “live” state when that exact shop matches the active session destination.
- Strategic effect: improves trust in the navigation chrome by removing false-positive live guidance cues while the user explores other shops during an active route.

### Implementation Note — Pass 490 (2026-03-29)

- Propagated live route-source/loading/fallback diagnostics into the popup and selected-shop map cards so the map shell itself now reflects whether guidance is live, refreshing, or temporarily degraded.
- Brought the floating map overlay cards into the same route-status vocabulary as the sidebar route panel, reducing visual mismatch between “what the shell says” and “what the map session is actually doing.”
- Strategic effect: makes the full shop-map experience feel like one coherent navigation product rather than a live guidance core surrounded by static preview chrome.

### Implementation Note — Pass 489 (2026-03-29)

- Upgraded the list-mode route panel to consume the same live route/guidance state as the active shop map, including remaining metrics, next maneuver context, and refresh/fallback status.
- Reframed the panel layout around explicit preview-vs-guidance states so live navigation in the shop flow now reads consistently even outside the fullscreen map surface.
- Strategic effect: closes another product gap between the map canvas and the surrounding shell by making the sidebar a trustworthy companion to live navigation instead of a stale planning-only panel.

### Implementation Note — Pass 488 (2026-03-29)

- Unified shop-route CTA behavior around the existing live session so paused/active destination actions now stay truthful even when that shop is no longer the currently focused preview target.
- Extended that same action logic into the list, immersive drawer, popup, and selected-shop bottom card so map-owned navigation no longer visually promises one action while dispatching another.
- Strategic effect: removes one of the last trust gaps in the shop navigation loop by keeping CTA language and CTA behavior synchronized across all major entry points.

### Implementation Note — Pass 487 (2026-03-29)

- Reused the live navigation-preview alternatives as the shop map’s rendered active route during owned navigation sessions, instead of leaving the painted route line on the older static preview geometry.
- Fed remaining ETA/distance from the live guidance preview into the shop guidance card so active map metrics now better reflect route progress, not just the original preview envelope.
- Strategic effect: the shop directory’s live guidance stack now updates both the user-position layer and the route-presentation layer, reducing the last visible mismatch between “where the app says you are going” and “what the map is drawing.”

### Implementation Note — Pass 486 (2026-03-29)

- Extended the shop-directory navigation path to reuse the shared live GPS/route-preview engine, not just the session shell, so shop maps now receive live tracked position, route refreshes, and next-step guidance.
- Added maneuver-card and follow/recenter behavior to both immersive and hybrid shop map surfaces, keeping the active shop route visually aligned with the same owned navigation lifecycle introduced in the previous pass.
- Strategic effect: closes another gap between the shop directory and BidOnDent’s fuller navigation system, moving the shop map from “session-aware preview” to “live guidance-capable” without introducing a second navigation stack.

### Implementation Note — Pass 485 (2026-03-29)

- Removed the duplicate shop-overlay navigation-session owner and routed live shop-map guidance UI through the single screen-level session lifecycle instead.
- Added active/paused in-map controls for the shop flow (`Pause`, `Resume`, `End Route`) plus live session timing so BidOnDent-owned navigation inside the shop directory is no longer just a start-only preview state.
- Strategic effect: upgrades the shop map from route-preview-capable to session-aware navigation, with clearer ownership and less risk of UI/session drift.

### Implementation Note — Pass 484 (2026-03-29)

- Made shop-directory route CTAs state-aware so list cards, map popups, and map-bottom cards only say `Start Navigation` when a live origin + route already exist for the focused shop; otherwise they remain `Get Directions` preview actions.
- Updated the shop navigation session bridge so paused sessions resume cleanly from those route-ready CTAs instead of silently behaving like a fresh preview request.
- Strategic effect: aligns route language with the actual BidOnDent map lifecycle, reducing friction between preview, start, and resume states across the shop flow.

### Implementation Note — Pass 483 (2026-03-29)

- Tightened the pre-navigation route-preview panel for phone use by making its active-route card appearance-aware, reducing instruction density, and showing only the first steps before live navigation starts.
- Strategic effect: keeps route planning readable and trustworthy on smaller screens without making the preview panel feel like a second oversized drawer.

### Implementation Note — Pass 482 (2026-03-29)

- Rebuilt compact shop-result cards around a route-first mobile hierarchy: one strong route CTA, lighter support actions, reduced score-card bulk, and smaller media footprint.
- Renamed the customer dashboard map-entry CTA from `Open Map` to `Open Smart Map` so the map program entry reads as product-specific instead of generic.
- Strategic effect: reduces phone-level browse clutter and makes the transition from dashboard to BidOnDent Maps feel clearer and more premium.

### Implementation Note — Pass 481 (2026-03-29)

- Fixed the mobile fullscreen browse/menu trap by normalizing bottom-sheet snap values, enabling explicit touch-scroll containers, and reducing smart-shop menu height pressure with horizontally scrolling quick-origin chips.
- Strategic effect: makes the map program feel operable on phones instead of visually present but interaction-fragile.

### Implementation Note — Pass 480 (2026-03-29)

- Replaced the shop/insurer router's simplistic marketplace-or-demo fallback with a merged live-feed strategy that hydrates local submitted reports and photo storage before seed data is allowed.
- Upgraded shop requests and insurer claims cards to show real report details and preview images, not only synthetic text/counts.
- Strategic effect: makes role dashboards reflect real submitted customer activity sooner and reduces the credibility gap between report intake and downstream role views.

### Implementation Note — Pass 479 (2026-03-29)

- Rebalanced fullscreen browse/navigation chrome around the map itself: cooler light-mode glass, slimmer summary sheet, smaller active-navigation rail/buttons, and a taller/more useful mobile browse bottom sheet.
- Strategic effect: makes BidOnDent Maps feel less like layered mockup cards and more like a controlled, map-first navigation product on both desktop and mobile.

### Implementation Note — Pass 478 (2026-03-29)

- Extended the public coverage entry from ZIP-first lookup into a true nationwide origin command bar that accepts U.S. home/store addresses and persists a manual address origin through route preview and fullscreen map entry.
- Strategic effect: closes one of the biggest credibility gaps between public landing search and the richer in-app map program by letting users start from real-world addresses before they ever open a third-party map.

### Implementation Note — Pass 477 (2026-03-29)

- Demoted Apple Maps / Google Maps / Waze selection inside the active navigation summary sheet behind an explicit `Export Route` disclosure.
- Reframed the handoff CTA as `Export to ...` so BidOnDent navigation stays visually primary and third-party apps read as fallback.
- Strategic effect: aligns active-navigation chrome with the product rule that BidOnDent Maps is the default experience and external providers are secondary escape hatches.

### Implementation Note — Pass 476 (2026-03-29)

- Locked coverage browse/landing routing to respect the user-selected ZIP/search origin by default, with live GPS only taking precedence when the experience is explicitly in geolocation mode.
- Stopped passive GPS updates from continuously refreshing ZIP-based route previews, reducing route-context drift in browse surfaces.
- Tightened the landing coverage action bar into a more compact command surface with explicit origin status.
- Strategic effect: makes the public coverage/search entry layer feel more trustworthy by aligning visible route geometry, selected origin, and control density.

### Implementation Note — Pass 475 (2026-03-29)

- Shifted insurer mapped partner-shop direction actions off of third-party launch and into the existing shop-directory map flow by persisting the selected shop/camera target into website map memory before opening BidOnDent Maps.
- Kept manual prospects on explicit external export because they still lack first-class in-app destination modeling.
- Strategic effect: extends the BidOnDent-first navigation principle into insurer recruitment workflows without faking generic place support that the map stack does not yet truly own.

### Implementation Note — Pass 474 (2026-03-29)

- Extended the in-app navigation default from coverage browse tabs to the landing coverage section and dashboard coverage widgets by routing shop-direction actions into `CoverageMapDialog` first.
- Added an auto-start request-token path so the fullscreen BidOnDent map can enter active navigation as soon as route preview is ready, while external-map launch remains an explicit export fallback only.
- Strategic effect: consolidates shop-direction intent around the BidOnDent map program across public and authenticated entry points instead of fragmenting it across third-party apps.

### Implementation Note — Pass 473 (2026-03-29)

- Replaced Coverage Browse `Shops`/`Explore` external map handoff behavior with in-app map routing/focus flow.
- Shop actions now transition users into in-app route planning/navigation; discovery-place actions now keep users in-map via focused place preview.
- Strategic effect: extends the in-app map continuity principle beyond shop directory into coverage browse tabs.

### Implementation Note — Pass 472 (2026-03-29)

- Upgraded shared dark map-control tokens for segmented tabs, secondary actions, and icon rails to improve readability and reduce flat/washed backgrounds.
- Increased Browse sidebar tab icon/label spacing and strengthened landing-header dashboard map-entry button contrast.
- Strategic effect: improves map control trust and scan speed at the product entry layer without changing route, search, or persistence behavior.

### Implementation Note — Pass 471 (2026-03-29)

- Shifted the shop-directory directions path to default to in-app map navigation instead of third-party handoff.
- Added U.S.-wide Nominatim origin search to the shop flow while preserving the existing NY quick-pick chips as convenience shortcuts.
- Strategic effect: keeps users in the BidOnDent map product loop (discover -> route -> navigate) and improves first-use relevance outside the Northeast.

### Implementation Note — Pass 399 (2026-03-28)

- Added explicit pre-refactor governance constraints and kickoff-prompt packaging so the next chat can begin refactor work with clear architecture, validation, and documentation-update requirements.
- Standardized refactor gate language around file-size governance (hard 600-line cap, preferred under 500) and security-boundary revalidation on service contract changes.
- Strategic effect: reduces execution drift at refactor kickoff and improves consistency for human/AI handoff quality.

### Implementation Note — Pass 398 (2026-03-28)

- Reconciled concurrent AI security/runtime implementation changes into active source-of-truth docs (master context, baseline, verification matrix).
- Captured live boundary changes: Clerk-backed edge auth headers, edge-routed intake/workflow mutations, Clerk-keyed navigation cloud sessions, and private-storage lifecycle assumptions.
- Strategic effect: ensures refactor planning operates on current implementation truth instead of stale architecture assumptions.

### Implementation Note — Bids/reports import-path cleanup (2026-03-28)

- Removed stale dynamic imports for `supabase/bids` and `supabase/reports` in hooks/router glue where those modules were already statically present elsewhere, converting the call sites to direct imports instead.
- Strategic effect: eliminates misleading build noise, keeps the current app-loading behavior honest, and gives future refactor work a cleaner rule for service access: either lazy-load a module consistently or treat it as part of the normal runtime graph.

### Implementation Note — Generic storage adapter boundary hardening (2026-03-28)

- Rewired the shared Supabase storage adapter so user-scoped private buckets now mint signed URLs and list files through Clerk-authenticated edge routes instead of direct browser storage calls.
- Extended the storage edge surface to support scoped signed-URL generation, scoped file listing, and optional path-preserving uploads, keeping the generic storage layer aligned with the already-hardened upload/delete runtime.
- Strategic effect: closes a legacy bypass seam in shared infrastructure code, reduces the chance of future feature work reintroducing browser-direct private-media access, and creates a cleaner refactor path to collapse storage adapter plus media-optimization concerns under one server-owned media gateway.

### Implementation Note — Public intake + workflow edge-boundary hardening (2026-03-28)

- Moved landing business-inquiry submissions and their activity-event logging off direct browser table writes and behind server routes with centralized validation and rate limiting.
- Moved shop-side workflow event and job-assignment service helpers onto authenticated edge endpoints so app-origin operational writes follow the same Clerk-boundary pattern as the rest of the hardened runtime.
- Strategic effect: reduces anonymous/browser write surface, improves consistency of operational event flows, and creates a cleaner future refactor seam for consolidating public intake plus app workflow mutations under a single server-owned command layer.

### Implementation Note — Pass 397 (2026-03-28)

- Aligned MCP integration planning docs to source active progress state from the map tracker instead of the archived build dashboard.
- Reworded a legacy tracker narrative item so build-dashboard references are clearly historical.
- Strategic effect: keeps future automation and ops integrations aligned with current governance anchors.

### Implementation Note — Pass 396 (2026-03-28)

- Updated the historical sprint report (passes 1-40) to explicitly mark old governance instructions as period-specific rather than active policy.
- Reclassified sprint-report references to the build dashboard as archival context only.
- Strategic effect: protects current execution discipline from legacy-report wording drift.

### Implementation Note — Pass 395 (2026-03-28)

- Cleaned residual authority-doc references that still framed the build dashboard as an active pass-detail source.
- Standardized wording so map tracker remains active execution governance and build dashboard remains historical context.
- Strategic effect: further reduces documentation routing ambiguity for future AI/human operators.

### Implementation Note — Pass 394 (2026-03-28)

- Updated legacy AI handoff/coordination prompt docs to stop treating `BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` as the active execution tracker.
- Standardized guidance to use `BIDONDENT_MAP_TRACKER_2026-03-21.md` for pass-level updates and `BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md` for strategy notes.
- Strategic effect: improves multi-agent consistency and prevents reactivation of retired documentation workflows.

### Implementation Note — Pass 393 (2026-03-28)

- Aligned the finishing plan's documentation protocol with the current governance model by removing mandatory pass logging to the archived build dashboard.
- Clarified setup-doc scope (`GETTING_STARTED.md`) so onboarding guidance does not compete with baseline/verification execution truth sources.
- Strategic effect: reduces process drift and keeps future pass reporting anchored to active governance artifacts.

### Implementation Note — Pass 392 (2026-03-28)

- Updated authority-layer docs (`BIDONDENT_PRODUCT_BRAIN.md`, `CLAUDE_AI_MASTER_CONTEXT.md`) to explicitly distinguish historical snapshots from active execution truth.
- Added archive guidance routing current decisions to the latest pre-refactor baseline and verification matrix docs.
- Strategic effect: lowers governance risk from stale high-authority wording while preserving historical context.

### Implementation Note — Pass 391 (2026-03-28)

- Reclassified stale "current" and "in progress" legacy map-status references as historical snapshots with explicit capture dates.
- Added guidance to use the latest baseline/verification docs as active execution truth.
- Strategic effect: lowers decision risk from status drift while preserving historical delivery context.

### Implementation Note — Navigation session boundary + restoration fix (2026-03-28)

- Rebuilt navigation session persistence around a Clerk-authenticated edge route and corrected the stored payload from partial launch metadata to the full navigation lifecycle state machine.
- Added Clerk-keyed navigation session storage schema support so cloud persistence no longer depends on mismatched profile-UUID assumptions, and anonymous map browsing now stays local-only by design.
- Cleared active-session restoration logic by tracking the latest restorable session instead of generating a fresh session ID and then querying for a row that could never exist.
- Cleared the current VS Code TypeScript problem set in the report/bids surfaces by aligning shared report fields, bid mapping output, and report list/detail contracts to the live app model.
- Strategic effect: makes map-navigation continuity real for signed-in users, blocks direct browser writes to navigation session storage, and defines a clean future refactor seam to consolidate navigation persistence with broader website-memory services under one identity-aware state layer.

### Implementation Note — Storage auth boundary hardening (2026-03-28)

- Added a Clerk-authenticated delete path for private storage objects so photo removal no longer depends on direct browser-side storage access.
- Repaired the server cleanup path to use the current storage-target extraction helper, keeping report-media cleanup aligned with signed/private URL handling.
- Strategic effect: closes a private-bucket lifecycle gap by keeping both upload and delete operations inside the authenticated edge boundary.

### Implementation Note — Pass 390 (2026-03-28)

- Retired stale pass-number execution sequencing from the finishing roadmap and replaced it with current baseline/matrix-driven policy.
- Reclassified the old build progress dashboard as a historical archive to prevent stale status assumptions.
- Strategic effect: improves documentation trust by ensuring active plans reference only current, governed execution artifacts.

### Implementation Note — Pass 389 (2026-03-28)

- Executed a full documentation synchronization pass including README, Supabase setup/auth ownership docs, OAuth setup docs, and baseline verification artifacts.
- Added explicit merge-safe protocol for concurrent security-track documentation updates so parallel AI work does not cause destructive doc drift.
- Strategic effect: keeps project memory coherent across simultaneous engineering tracks and improves pre-refactor planning reliability.

### Implementation Note — Pass 388 (2026-03-28)

- Added a dedicated full-site functionality verification matrix spanning account roles, route/page coverage, map-flow checks, and mobile/desktop readiness gates.
- Integrated the matrix into docs governance references so pre-refactor execution is anchored to explicit functional checkpoints, not narrative status alone.
- Strategic effect: improves execution discipline before refactor and reduces ambiguity about what "fully functional" means across the product.

### Implementation Note — Pass 387 (2026-03-28)

- Fixed landing settings layering by rendering `SettingsModal` through a root-level portal, removing parent stacking-context constraints.
- Corrected dashboard logo typography by removing italic treatment from the "On" segment in `BidOnDent` for consistent brand rendering.
- Strategic effect: resolves visible trust/polish regressions while preserving map-first shell behavior.

### Implementation Note — Pass 386 (2026-03-28)

- Added a pre-refactor full-site baseline artifact covering account-type functionality, page reachability, map program state, mobile/desktop readiness, and code-structure pressure points.
- Normalized explicit metadata governance (`Last updated`, `Status`) across docs that were missing standard markers, extending documentation discipline beyond map-major files.
- Strategic effect: reduces planning ambiguity before large refactor work and gives future agents one aligned execution baseline.

### Implementation Note — Pass 385 (2026-03-28)

- Hardened `ShopDirectorySearchPanel` by enforcing 44px minimum touch-target sizing across the full discovery control surface (origin, filters, tiles, view modes, and related-screen CTA).
- Rebalanced control typography/spacing to preserve scan speed while increasing touch reliability.
- Strategic effect: strengthens mobile interaction fidelity in the map discovery stage before shop selection and action.

### Implementation Note — Pass 384 (2026-03-28)

- Enforced 44px touch-target minimums on key map-pane interaction controls (`directions` CTA, `Search this area`, `Area active`).
- Increased action control legibility in the map pane while preserving routing/search behavior and layout intent.
- Strategic effect: improves action completion reliability in map-first mobile sessions where overlays sit directly over geography.

### Implementation Note — Pass 383 (2026-03-28)

- Hardened `ShopDirectoryResultCard` appearance parity by making summary/certification surfaces fully mode-aware in light and map-dark modes.
- Added explicit 44px minimum heights for all primary card actions to enforce mobile touch-target reliability in the list decision path.
- Strategic effect: improves trust and completion confidence in the shop selection layer that bridges map discovery to action.

### Implementation Note — Pass 380 (2026-03-28)

- Completed appearance-mode parity hardening for `LikedShopsScreen` by making header, search, and supporting action/chip surfaces mode-aware.
- Preserved map-dark baseline while improving light-mode readability and contrast for shortlist management interactions.
- Strategic effect: reduces visual inconsistency in customer map-adjacent flows and supports stronger trust in mode switching.

### Implementation Note — Pass 383 (2026-03-28)

- Fixed a user-facing reload loop by removing hard page refreshes from Clerk account setup and cached-data-to-Supabase migration flow.
- Added Clerk-auth readiness gating before cloud data bootstrap so transient unauthenticated edge reads do not misclassify an account as “missing” and re-enter migration logic.
- Strategic effect: stabilizes authenticated app startup, prevents repeated full-page reloads, and keeps migration/sync behavior inside normal React state flow.

### Implementation Note — Pass 381 (2026-03-28)

- Unified directions CTA language for selected map-shop cards by threading a shared `directionsActionLabel` into `ShopDirectoryMapPane` from both standard and immersive map orchestration paths.
- Removed hardcoded label dependency in map-pane selected-card action while preserving safe fallback behavior.
- Strategic effect: improves interaction-language consistency across map/list contexts and strengthens trust in repeated navigation actions.

### Implementation Note — Pass 380 (2026-03-28)

- Added direct map-card actionability by wiring a selected-shop "Open directions" CTA inside `ShopDirectoryMapPane`.
- Propagated callback wiring through both standard and immersive map flows to preserve behavior consistency.
- Strategic effect: tightens the report -> map -> shop -> action loop by removing one context-switch step before navigation launch.

### Implementation Note — Pass 382 (2026-03-28)

- Continued the security hardening sweep by removing stale browser-side direct database fallbacks from admin/data services and routing verification flows back through authenticated edge endpoints.
- Added a tracked admin-only deep health path for database verification so operational checks no longer depend on client table reads.
- Strategic effect: reduces accidental data-exposure risk if browser-side permissions drift and keeps admin/runtime diagnostics aligned with the hardened Clerk-authenticated boundary.

### Implementation Note — Pass 379 (2026-03-28)

- Added mobile safe-area-aware bottom clearance for dashboard map-list content in active map mode.
- Strategic effect: reduces clipped interactions at the end of map-list flows and increases action completion reliability on phone-sized viewports.

### Implementation Note — Pass 378 (2026-03-28)

- Aligned map control hierarchy between landing and dashboard mobile surfaces by converging on bounded two-column search rows and clearer control clustering.
- Added explicit touch-scroll behavior hints to settings modal containers to reduce iOS scroll friction in layered overlays.
- Strategic effect: improves cross-surface coherence and lowers interaction cost in the map-first mobile workflow.

### Implementation Note — Pass 377 (2026-03-28)

- Resolved three mobile execution gaps across map-adjacent surfaces: settings modal scroll containment, landing coverage search control bounding, and dashboard map-list density.
- Reinforced viewport-safe behavior by using bounded grids/min-width guards for control rows and explicit scroll zones for modal content.
- Strategic effect: improves trust and usability in map-first mobile sessions by removing interaction friction before deeper feature work.

### Implementation Note — Pass 376 (2026-03-28)

- Refined shop-directory map shell density for both map and list view modes, prioritizing map visibility on mobile while preserving desktop split-pane utility.
- Compacted search/origin/view controls and map overlays to reduce vertical crowding and improve immediate map interaction confidence.
- Hardened appearance-mode behavior by ensuring landing-shell dark mode propagates the same theme context expected by glass-based settings surfaces.
- Strategic effect: strengthens map-first execution quality in day-to-day use and reduces mode-driven visual inconsistencies between landing and authenticated flows.

## Passes 181–185 — Design Consolidation Sweep (2026-03-24)

Full-stack design system consolidation: glass unification, blue token upgrade, empty state visibility, CTA hierarchy, report flow touch targets, Sentry setup, MCP plugin plan. See `BIDONDENT_MAP_TRACKER_2026-03-21.md` for active pass governance and `BIDONDENT_BUILD_PROGRESS_DASHBOARD.md` for historical archive context.

**Key outcomes:**

- All empty states now use `bd-glass-card` — no more invisible `bg-slate-50` on dark dashboard
- Blue system tokens upgraded: glass backgrounds blue-tinted, shadows refined, hover accents unified
- All report creation buttons meet WCAG AA 44px touch targets
- Landing page CTAs standardized: pill shape, vertical gradient, proportional sizing
- Sentry project live, DSN wired, MCP plugin roadmap documented

## Strategic Direction Update (2026-03-25)

### Current Reality (Screenshot-Verified)

The map/coverage section is the strongest product surface. The Operating Regions section with its dark navy background, interactive map, ZIP search, and navigation handoff is the visual identity anchor. The design consolidation passes (181-185) unified the glass system and blue tokens across all surfaces.

### Remaining Strategic Gap

The map is compelling when you reach it, but the overall product doesn't yet feel **map-native**. The dashboard still feels like "UI with a map widget" rather than "map with floating panels." Light landing sections are clean but don't feel connected to the map identity.

### Strategic Priorities (Post-185)

1. **Map dominance** — Make the map the central experience, not a section among sections
2. **Spatial interaction loops** — Report→shop→bid→navigation should feel like one connected spatial journey
3. **Identity unification** — Every surface should feel like it belongs to BidOnDent's blue/map world
4. **Mobile-first map behavior** — Bottom sheets, overlays, and thumb zones optimized for map interaction

### Implementation Note — Pass 200 (2026-03-25)

- Dashboard shell now applies a map-night visual system across sticky header, desktop sidebar, and mobile bottom nav.
- Fixed map hero layer in `HomeScreen.tsx` is offset below sticky header to prevent map/header collision.
- This is a directional step toward map-dominant shell behavior while preserving current information architecture.

### Implementation Note — Pass 203 (2026-03-25)

- Coverage county list in `OperatingRegionsSection.tsx` now uses map-native hierarchy with active-region labeling and status badges.
- This maintains existing behavior while improving quick-scan comprehension of current service footprint.

### Implementation Note — Pass 205 (2026-03-25)

- Introduced a persisted appearance preference (`map-dark` or `light`) through Account settings to support controlled shell variation.
- Wiring spans app orchestration, dashboard routing contracts, and both core shell surfaces (`DashboardLayout.tsx`, `LandingPageLayout.tsx`).
- Strategic intent: preserve map-first default while enabling broader system theme scalability in future passes.

### Implementation Note — Pass 206 (2026-03-25)

- Hardened appearance system with document-level mode attributes (`data-appearance-mode`, `color-scheme`) in app orchestration.
- Extended mode-aware shell consistency to mobile bottom navigation so light mode no longer inherits dark-only nav treatment.
- Adds a safer foundation for future map-overlay and card-level theme tokenization while preserving map-dark as product default.

### Implementation Note — Pass 207 (2026-03-25)

- Executed a mobile-first contrast sweep across major landing sections to remove washed headings/body copy on small screens.
- Shifted customer dashboard map widget and bids summary/empty surfaces toward map-dark glass treatment for shell consistency.
- Strategic effect: strengthens map-first visual continuity from landing to dashboard without changing underlying data flows.

### Implementation Note — Pass 208 (2026-03-25)

- Refined dashboard mobile top-stack rhythm by increasing map-to-content separation and tightening hero action-card spacing.
- Added compact density controls to customer map widget for mobile while preserving full detail in expanded map dialog.
- Strategic effect: improves first-screen clarity in authenticated map-first experience without changing navigation architecture.

### Implementation Note — Pass 209 (2026-03-25)

- Refined Account tab surfaces to dark map-shell card language (`AccountInfoCard`, `AccountMenu`) for authenticated-shell coherence.
- Elevated icon chip and row contrast to maintain tap clarity on mobile dark backgrounds.
- Strategic effect: reduces visual context switching between dashboard tabs and supports a unified map-first product identity.

### Implementation Note — Pass 210 (2026-03-25)

- Extended dark-shell cohesion into report intake shell (`ReportHeader`, `ReportProgress`, `StepVehicleInfo`).
- Tuned inactive step indicators and form fields for legibility on dark surfaces while preserving current flow behavior.
- Strategic effect: improves continuity from dashboard home to report creation in the core report -> map -> shop loop.

### Implementation Note — Pass 211 (2026-03-25)

- Completed dark-shell parity for remaining report steps (`StepDamageArea`, `StepDescription`) so intake styling stays consistent through submission.
- Updated selector/button/field/error surfaces for stronger legibility on map-night backgrounds without changing flow logic.
- Strategic effect: closes report-flow visual continuity gaps and strengthens the report -> map -> shop action loop.

### Implementation Note — Pass 212 (2026-03-25)

- Wired appearance-mode conditionals through DashboardRouter → ReportScreen → ReportHeader/Progress/VehicleInfo/DamageArea/Description.
- Each component derives `isLightAppearance` from the prop and applies conditional class names for both map-dark and light modes.
- Strategic effect: establishes the pattern for system-wide dark/light mode support; report flow is the first multi-screen surface fully wired.

### Implementation Note — Pass 213 (2026-03-25)

- Completed appearance-mode parity for the remaining 3 report steps: StepPhotos, StepServiceLocation, StepComplete.
- All 6 report steps + header + progress bar now respond to the `appearanceMode` prop.
- Strategic effect: report intake is the first complete multi-step flow with full dark/light mode parity — validates the approach for system-wide rollout.

See `BIDONDENT_FINISHING_MASTER_PLAN.md` for detailed execution roadmap.

---

## Pass 179 — Shop loop completion (spatial shop actions, map-driven overlays) (2026-03-24)

- **Why this pass was chosen:** Map-driven shop actions (bid/accept) were not surfaced as primary overlays, limiting mobile and map-first flows. Needed to complete the spatial shop loop and ensure all actions are accessible from the map.
- **What changed:**
  - Added a floating shop action overlay to `ShopDirectoryMapOverlays.tsx`.
  - Overlay provides large, mobile-first "Place Bid" and "Accept" buttons, always accessible when a shop and route are selected.
  - Buttons are glass/royal blue, 44x44px+ touch targets, and follow the design system.
  - Actions dispatch custom events for integration with the rest of the shop flow.
- **Files touched:** `ShopDirectoryMapOverlays.tsx`
- **Validation:** Build: ✓ 0 errors · 990.81 KB · 2.08s. Diagnostics: 0. Spellcheck: 0. Overlay appears and works on mobile and desktop.
- **What this unlocks:** Shop actions are now map-native, mobile-first, and always accessible. Enables customer decision loop and navigation flow hardening.
- **Best next pass:** Pass 180 — Customer decision loop (map-driven bid/action).

## Pass 80 — OperatingRegionsSection Hook Extraction (2026-03-23)

- `OperatingRegionsSection.tsx` (476 lines) refactored: extracted `useOperatingRegionsCoverage` hook (348 lines) containing all coverage state management, map view control, shop selection, geolocation, ZIP search, and direction-launching logic. Component reduced to 175 lines — pure JSX rendering via `coverage.*` access pattern. Clean single-responsibility split: hook = data/domain logic, component = rendering.

## Pass 79 — Sonnet Audit + InsurerNewClaimScreen Fix (2026-03-23)

- Audited Sonnet's autopilot passes 73–78. Found incomplete extraction on `InsurerNewClaimScreen.tsx` — orphaned inline modal JSX broke the build. Removed the orphaned code (477 → 362 lines). `InsurerNewClaimForm.tsx` (created by Sonnet) now sole owner of the claim form. Also fixed two type errors left behind: added `"login"` to `LoginView` type union, and relaxed `ShopDirectoryRoutePanel.routeSummary` from `IntelligenceSummary` to `{ title; description }` since `callouts` was never used.

## Pass 78 — ShopOnboarding Extraction (2026-03-23)

- `ShopOnboarding.tsx` (484 lines) split into 5 files: `ShopOnboardingStep1–Step4` (each 76–148 lines) + the refactored orchestrator (115 lines). Each step is a standalone presentational component receiving `formData`, `onUpdate`, and navigation callbacks. Static options and helpers moved to the files that own them.

## Pass 77 — ShopDirectoryScreen Extraction (2026-03-23)

- `ShopDirectoryScreen.tsx` (489 lines) split: extracted `ShopDirectoryListBody` (168 lines) containing the entire scrollable sidebar list body. Screen reduced to 339 lines. Session object passed as single prop to minimize prop drilling while keeping the extraction clean.

## Pass 76 — LoginModal Extraction (2026-03-23)

- `LoginModal.tsx` (484 lines) split into 4 files: `LoginMainView` (87), `LoginSignupView` (185), `LoginLoginView` (160), and the refactored `LoginModal` (134 lines). Modal is now a thin wrapper + conditional renderer with no inline form JSX.

## Pass 75 — Admin Hook Extraction (2026-03-23)

- `useAdminActions.ts` (490 lines) extracted into 3 files: `useAdminAccountStatuses`, `useAdminRoleManagement`, and the refactored `useAdminActions` (367 lines). Single-responsibility hooks, no consumer changes.

## Pass 73–74 — Landing Page Visual Hierarchy (2026-03-23)

- **Pass 73**: `LandingPageHeader` — logo de-weighted from `bd-glass-control` to transparent hover. Nav links downgraded to `bd-glass-control--utility`. Login given secondary treatment. Dashboard button duplicates consolidated.
- **Pass 74**: `HeroSection` — CTA hierarchy restored: "Get Started" primary, "Learn More" secondary. Full-width CTAs on mobile (`w-full sm:w-auto`). Carousel container height increased to prevent text clip.
- 2 files touched. Build: 1.61s, 0 errors. Spellcheck: 0 all passes.

## Pass 70–72 — Production Polish + Dashboard Density (2026-03-23)

- **Pass 70**: Page title "Full_DEMO" → "BidOnDent — Compare Auto Body Repair Bids". Added meta description + OG tags.
- **Pass 71**: HomeScreen 483→249 lines. Extracted `HomeScreenSections.tsx` (OnboardingCard, ReportsList, Sidebar). Architecture in compliance.
- **Pass 72**: Mobile stat cards compact (2-col grid, smaller sizing). Dashboard content padding tightened on mobile. Badges hidden on mobile for cleaner layout.
- 4 files touched total. Build: 2439 modules, 1.75s, 0 errors at all passes.

## Pass 69 — Customer Dashboard Empty-State Polish (2026-03-23)

- New customers see "How BidOnDent Works" 3-step onboarding card instead of four zero-value stat cards
- Context-aware welcome greeting (first visit vs returning)
- Empty reports section redesigned: centered, icon, descriptive copy, inline CTA
- Returning users with data still see full stats grid and activity feed
- 1 file touched: HomeScreen.tsx (421→483 lines). Build: 1.68s, 0 errors.

## Pass 68 — Safari Blank White Screen Fix (2026-03-23)

- Safari reload produced blank white screen — Clerk SDK or session sync stalls before React mounts
- Added pre-mount loading indicator in `index.html` — spinner visible before JS executes
- Added 10s timeout recovery in HTML: "Tap to reload" link if JS never mounts
- Enhanced `AppLoading.tsx` with 8s timeout: shows "Tap to reload" if loading gate stays blocked
- Two-layer defense: HTML pre-mount (covers JS stall) + React AppLoading (covers async gate stall)
- 2 files touched. Build: 1.70s, 2438 modules, 0 errors.

## Pass 67 — Header Button Sizing (2026-03-23)

- User feedback: landing page header nav buttons oversized/chunky
- `bd-glass-control` CSS: `padding: 0.75em 2.2em` → `0.5em 1.6em`, `font-size: 1.08rem` → `0.92rem`
- Applies globally to all glass nav buttons (Header, map overlays)
- 1 file touched: theme.css. Build: 1.70s, 0 errors.

## Pass 66 — Bottom Sheet Peek Optimization (2026-03-23)

- Peek snap reduced from 120px to 90px (just drag handle + view tabs, no dead space)
- Half snap reduced from 45% to 40% — more map visible when browsing content
- Map = primary surface rule strengthened: bottom sheet eats less map viewport
- 1 file touched: MobileMapBottomSheet.tsx
- Build: 1.71s, 2437 modules, 0 errors. Spellcheck: 0.

## Pass 64/65 — Dialog Close Fix + Planner Compaction (2026-03-23)

- **P1-RUNTIME FIX**: Dialog X close button was non-functional due to z-index stacking context trap
  - Root cause: Dialog at z-50 creates stacking context; MobileMapBottomSheet Portal at z-[610] renders above it in document root stacking context
  - Fix: Portal-based close button via `createPortal(button, document.body)` at z-[700] — escapes dialog stacking context entirely
  - Default Radix close button hidden via `[&>button:last-child]:hidden`
- **P4-UX**: Active nav dialog chrome (padding, map height) pushed from md to xl — matches browse mode
- **P4-UX**: Dialog close button restyled as floating glass button (rounded-full, backdrop-blur, shadow)
- **P4-UX**: Navigation planner compacted for mobile bottom sheet:
  - "Route Planner" header + badge hidden below xl
  - "Navigation shell" info card hidden below xl
  - "Tip" text hidden below xl
  - Route status description hidden below xl (keep title + Start Route button)
- 5 files touched: CoverageMapDialog.tsx, dialog.tsx, CoverageNavigationPlanner.tsx, PlannerVoiceGpsSettings.tsx, PlannerRoutePreview.tsx
- Build: 1.82s, 2437 modules, 0 errors. Spellcheck: 0.

## Pass 63 — Browse Mode Map-First (2026-03-23)

- All desktop chrome (header, shell background, border, shadow, padding) pushed from md (768px) to xl (1280px)
- Below 1280px, browse mode is now full-bleed map + bottom sheet only — no dashboard chrome
- Tile mode and map utility controls (Center/Reset) hidden below xl — map chrome belongs on desktop sidebar, not mobile sheet
- Map stays 100dvh below xl (no 74vh shrink until desktop)
- Eliminates the "website settings page" feel on tablet viewports (768-1280px)
- 2 files touched: CoverageBrowseExperience.tsx, CoverageBrowseSidebarContent.tsx
- Build: 1.86s, 2437 modules, 0 errors. Spellcheck: 0.

## Pass 62 — ActionRail Mobile Refinement (2026-03-23)

- ActionRail repositioned from horizontal bottom (conflicting with SummarySheet) to vertical right-side at all breakpoints
- Follows Apple Maps / Google Maps pattern: action buttons float on the right edge of the map
- Eliminates bottom-stacking z-index conflict between ActionRail and SummarySheet on mobile
- Buttons remain h-12 w-12 on mobile, h-14 w-14 on md+
- 1 file touched: NavigationActionRail.tsx
- Build: 1.93s, 2437 modules, 0 errors. Spellcheck: 0.

## Pass 18 — Future Map Identity + Atmosphere Governance Alignment (2026-03-22)

### Future Direction: Product-Owned Map Identity, Blue System, and Atmosphere

- The final BidOnDent map product is planned to feel **product-owned, premium, and BidOnDent-native** — not a macOS clone, not generic SaaS, not pasted Apple UI.
- The blue system is a future semantic hierarchy: deep royal blue for primary identity and controls, lighter sky/baby blue for atmosphere and guidance, dark ocean/navy blue for depth and night, gray-blue for subdued/inactive/low-noise UI. Blue should behave like **light through glass**, not paint on controls.
- The map should feel like a **living world**: more depth, atmosphere, layered transparency, liquid glass overlays, and “surface floating above geography.”
- Future immersion direction: richer world feel, environmental depth, spatial layering, and better blending between map and UI. True 3D/world rendering is **aspirational only** and depends on future provider/platform decisions.
- **Day/night guidance mode switching** is a planned, not implemented, feature. Any future implementation must respect provider stack, real capability boundaries, and user override/settings.
- Controls should feel tactile, soft, layered, calm, and premium — not loud, harsh, over-glossed, or like desktop window chrome. Controls should float above the world, not feel like toolbar buttons.
- Glass/material direction: target is breathable, warm, softly illuminated, transparent/translucent — not over-solidified, painted, cold, or aggressively glossy.
- The future map experience should be more emotional and trustworthy: calm, guided, breathable, confident, premium, friendly, and trustworthy — not cold, flat, generic, or overly technical.

All of the above is **future direction** and not yet implemented unless otherwise stated in the tracker.

# BidOnDent Map Master Plan (2026-03-21)

Last updated: March 23, 2026  
Owner: Product + Engineering  
Status: Active strategic reference

## Companion Documents

This plan should be read alongside:

- `docs/BIDONDENT_PRODUCT_BRAIN.md` — overall product architecture, role model, and design system direction
- `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md` — granular delivery history and active risks
- `docs/PHASE_2_PLATFORM_RECOMMENDATION_2026-03-20.md` — architecture truth table and module plan

Any map decision should cross-check all four docs to avoid contradictions.

## Mission

Deliver a production-grade, map-first BidOnDent experience that is:

- trustworthy (real provider-backed behavior in production paths),
- resilient (clear fallback and error visibility),
- premium (intentional UI motion/clarity across desktop and mobile),
- and maintainable (cleanly separated map domains and documentation discipline).

## Non-Negotiables (Humans + AI)

1. Supabase is source of truth for report, vehicle, profile, and user-linked persistence.
2. localStorage is cache/recovery only and must never silently override cloud truth.
3. Real providers are required for routing/place/search in production user paths.
4. Demo map data must remain clearly labeled and isolated to demo-only paths.
5. Every map-related change must update both map docs in the same change set:
   - `docs/BIDONDENT_MAP_MASTER_PLAN_2026-03-21.md`
   - `docs/BIDONDENT_MAP_TRACKER_2026-03-21.md`
6. Every map UI pass must be validated on both mobile and desktop.
7. No map-facing silent failures: telemetry, fallback state, and user messaging must stay explicit.

8. Navigation session persistence is now Supabase-backed: all navigation session state is stored in the `navigation_sessions` table in Supabase. localStorage is used only as a cache/recovery layer and never overrides cloud truth. Session state is hydrated from Supabase on boot and saved to Supabase on update. Cross-device continuity is now real. See "Cloud Navigation Persistence" card in Product Brain for full detail.

## 2026-03-22: Map Overlay Intelligence Enrichment (Pass 18)

- **Scope:** ShopDirectoryMapOverlays now computes and displays real navigation intelligence: live distance, ETA, and session state, using actual Place and ShopMapListing coordinates. Overlay logic is session-aware, with edge case handling for missing/incomplete data. No visual or design system changes; overlays only enriched with real metrics.
- **Validation:** Build clean, spellcheck clean, diagnostics clean. Overlays validated for both mobile and desktop. No errors found.
- **Docs:** This change is documented in both the Master Plan and Tracker as required.

8. Avoid coupling UI components to provider/network contracts; use typed services/hooks.

## 2026-03-23: Navigation Session Cloud Sync (Pass 19)

- **Scope:** Navigation session state is now persisted in Supabase (`navigation_sessions` table) with localStorage as cache. Session state is hydrated from Supabase on boot and saved to Supabase on update. Cross-device continuity is now real. No UI or unrelated code changed. All changes are minimal and scoped.
- **Validation:** Build clean, spellcheck clean, diagnostics clean. Session persistence verified after reload and across devices. No errors found.
- **Docs:** This change is documented in both the Master Plan and Tracker as required.

## Architecture Direction

### Map domain boundaries

- `services/navigation/*` owns provider IO, telemetry, sanitization, and summary contracts.
- `hooks/*` owns orchestration/state composition for map workflows.
- `components/maps/*` owns presentation and interaction surfaces.
- Diagnostic check modules stay deterministic and dependency-light.

### Trust as product feature

Map reliability is not hidden infrastructure. It is a user-facing quality signal.

- Provider health and map performance telemetry are first-class.
- Combined trust state (`idle/healthy/watch/degraded`) must remain explainable.
- Confidence scoring and trend hints are acceptable only when derived from canonical summary contracts.

### Data truth model

- Production map discovery/routing/search must prefer real providers.
- Demo fallback entries can exist only behind explicit demo mode gating.
- Placeholder coordinates are allowed only for deterministic continuity in demo/manual records.

## Delivery Themes (Current Program)

### Theme 1: Reliability and diagnostics

- Harden telemetry ingestion and local-cache self-healing.
- Enforce versioned persisted-state parsing and normalization on startup so stale or malformed browser payloads cannot crash hydration.
- Keep summary generation deterministic and low overhead.
- Expose lightweight dev-only check entry points for confidence in refactors.
- GPS degradation detection and graceful degradation (delivered 2026-03-22 via `NavigationErrorBoundary`).
- Speed-limit unavailable state handling (delivered 2026-03-22).

### Theme 2: Explainable trust UI

- Keep planner trust status fast to scan.
- Surface risk reason tags and at-risk provider context.
- Surface explicit stale-telemetry refresh guidance so trust warnings stay actionable.
- Keep confidence-trend and route-alternative messaging backed by deterministic helper logic and checks.
- Preserve meaningful confidence trend signaling without noise.

### Theme 3: Real discovery and routing integrity

- Prevent demo leakage into production results.
- Preserve route-launch continuity from searchable shop surfaces.
- Track discovery quality filtering outcomes with measurable counters so false-positive pressure is visible.
- Keep discovery telemetry readable in category-mix ratios so quality tuning decisions are role-aware.
- Keep provider fallback behavior explicit to users.

### Theme 4: Quality of interaction

- Maintain smooth UI transitions and clear visual hierarchy.
- Keep the expanded command-center map search-first: reduce concurrent panel noise, prioritize route origin/search actions, and use progressive disclosure for secondary controls.
- Keep desktop expanded-map presentation in a cohesive macOS-style app shell (single aligned action rail, single route summary card, and consistent button rhythm).
- Keep small-screen readability/tap-target comfort at parity with desktop quality.
- Keep diagnostics trust surfaces readable at small breakpoints so risk triage remains fast on mobile.
- Honor reduced-motion behavior for animated map controls.

### Theme 5: Visual language, blue system, and motion system

- The BidOnDent map product must feel **product-owned** and not a macOS clone or generic SaaS map UI.
- The visual identity is **royal-blue-first**: royal blue is the primary identity, route, and action color; baby/light blue for air/sky/calm; deep ocean blue for depth/premium/spatial confidence; gray-blue/navy for night/dark mode.
- Map surfaces, overlays, and controls must use the blue system intentionally for meaning, not just decoration.
- The map should feel like a **branded geographic world**: the sky, water, route, and overlays all belong to BidOnDent, not a third-party tile with branding on top.
- **Day/night guidance mode**: The future map experience will support automatic day/night visual switching based on local time or route context, similar to premium navigation products. This is a planned feature, not yet implemented. Day mode is lighter, breathable, and sky-driven; night mode is calm, navy, low-glare, and guidance-first.
- All map design and product decisions must reinforce this blue system and day/night awareness, and avoid desktop window clones or generic map UI patterns.
- Use in-map overlays (not only side panels) for key route/search actions so map context stays visible while users act.
- Keep attribution legally compliant while presenting branded map identity (BidOnDent map badge + provider attribution clarity).
- Make animation quality a first-class acceptance item: layered entry timing, subtle floating glass motion, and deterministic reduced-motion fallback.
- Continue evolving toward search-first, fewer-button, gesture-friendly interaction flows over time without removing desktop discoverability.

### Theme 6: Site-wide design expansion and dashboard map surfaces

- The royal-blue glass design language proven on map surfaces should extend to dashboard shells, landing pages, and role-specific experiences following the staged adoption plan in the Product Brain.
- Dashboard map widgets should follow CarPlay-style principles: compact, glanceable, always-visible, live-updating — not hidden behind full-screen dialogs.
- Each account type (customer, shop, insurer) should eventually have a role-specific compact map widget on their dashboard showing contextually relevant geographic information (nearest shops, incoming requests, claims density).
- `DashboardCoveragePanel.tsx` already proves the embedded map pattern works — future work builds on this foundation.
- Map design decisions (palette, animation, glass treatment) should remain consistent whether the map appears as a full-screen command center or a compact dashboard widget.
- Current integration barrier is high for most non-map surfaces (they use separate Tailwind-only styling with no map token consumption). Stage 1 preparation (global design tokens in `theme.css`) must come before component adoption.

## Future Direction Themes

The themes above (1–6) capture a historical strategic snapshot from the 2026-03-23 planning cycle. The themes below describe future evolution that is documented but not yet in active development. Each theme follows the consistent 6-part structure: Current State → Productizing → Aspirational → Prerequisites → UI/UX Evolution → Non-goals. For current execution reality, use the latest baseline and verification matrix docs.

### Future Theme A: Navigation productization

**1. Current State (Pass 92):** GPS, turn-by-turn, speed HUD, and voice all work and are production-quality. Graceful degradation for GPS loss delivered (Pass 68). Deviation detection with reroute prompt delivered. Cloud sync via Supabase delivered (Pass 19). Error boundary around navigation components delivered (`NavigationErrorBoundary`). Circuit breaker for OSRM delivered (3-fail open, 90s cooldown). Session retry resilience delivered (exponential backoff). Voice alerts with mode-aware dispatch delivered. Consumer copy cleaned across all map surfaces (Passes 87–92). Dev diagnostics gated behind `import.meta.env.DEV` (Pass 91).

**2. Productizing Stage (mostly delivered):** ~~Graceful degradation for GPS loss~~ Done. ~~Deviation detection with reroute prompt~~ Done. ~~Error telemetry~~ Done. Remaining: network error recovery UI, cross-browser voice edge cases.

**3. Aspirational Stage:** User-facing settings UI (voice picker, speed unit, volume). ~~Cloud sync via Supabase~~ Done. Automatic rerouting (currently user-confirmed). ETA updates during active navigation. Marketplace-aware routing to partner shops. Offline caching. Provider abstraction.

**4. Technical Prerequisites (mostly delivered):** ~~Supabase `navigation_sessions` table~~ Done. `navigation_preferences` table not yet created. ~~Error boundary around navigation components~~ Done. ~~Deviation calculation utility~~ Done. Browser compatibility matrix for Web Speech API (informal, not formalized).

**5. UI/UX Evolution Path:** (1) Now → functional panel with no error states. (2) After productizing → same panel with visible warnings for degraded conditions. (3) After aspirational → settings drawer, live ETA, auto-reroute, shop info cards at route end.

**6. Non-goals:** Do not migrate away from OSRM/Nominatim/Overpass preemptively. Do not build multi-stop routing before single-route reliability is production-grade. Do not add CarPlay/Android Auto before web navigation is polished.

**Cross-doc reference:** Product Brain "Navigation Productization Roadmap" has the full structured breakdown.

### Future Theme B: Marketplace-specific map intelligence

**1. Current State:** Customer role has a compact nearest-shops widget (`CustomerMapWidget`) delivered March 2026 showing 5 nearest shops with distance + rating, expandable to full CoverageMapDialog. Shop and insurer roles have placeholder widgets (`ShopMapWidget`, `InsurerMapWidget`) with structure-only stats. No geo-coded report data, no service area boundaries, no claims analytics.

**2. Productizing Stage:**

- **Customer:** Nearest partner shops widget (data already available via `useCoveragePartnerShops()`)
- **Shop:** Service area boundary visualization (requires `shop_service_areas` table)
- **Insurer:** Network coverage map with capacity/rating overlays

**3. Aspirational Stage:**

- **Customer:** Smart shop recommendation routing with distance/rating/wait-time weighting
- **Shop:** Incoming request heatmaps, customer proximity alerts, competitor overlays
- **Insurer:** Claims density analysis, coverage gap detection, optimal claim-to-shop assignment

**4. Technical Prerequisites:** Supabase schema extensions — `report_locations` (geo-indexed), `shop_service_areas` (polygons/radius), `shop_availability` (real-time capacity), `claim_assignments` (geographic context). Real-time subscriptions for live update surfaces.

**5. UI/UX Evolution Path:** (1) Now → shared coverage map for all roles. (2) After productizing → role-specific compact dashboard widgets showing contextually relevant data. (3) After aspirational → each role has a purpose-built map intelligence surface with interactive drill-down.

**6. Non-goals:** Do not build heatmap/clustering infrastructure before underlying Supabase tables exist. Do not show fabricated intelligence — display "not enough data" when data is missing. Do not build shop-to-shop messaging or technician dispatch through the map.

**Cross-doc reference:** Product Brain "Role-Specific Future Map Intelligence" has per-role structured plans.

### Future Theme C: Provider evolution

**1. Current State:** MapLibre GL JS 5.21.1 + react-map-gl 8.1.0 (rendering) + OSRM public (routing) + Nominatim (geocoding) + Overpass (speed limits). The renderer migration is complete, and the stack remains free-tier and functional at current scale.

**2. Productizing Stage:** No provider changes needed. Focus on reliability within the current stack (error handling, fallbacks, graceful degradation). Document the browser compatibility matrix.

**3. Aspirational Stage:** Evaluate commercial providers only when triggered:

| Trigger                   | Candidate Provider                  | Feature Unlocked                      |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| Globe rendering required  | Mapbox GL or MapLibre GL            | 3D globe, smooth zoom, vector tiles   |
| Free-tier rate limits hit | Self-hosted OSRM, Mapbox Directions | Reliable routing at scale             |
| Traffic data needed       | Google Directions API, TomTom       | Real-time traffic-aware routing       |
| Offline maps needed       | MapLibre + PMTiles                  | Offline tile packs, zero-network maps |

**4. Technical Prerequisites:** Provider abstraction layer (build when first migration is justified, not before). Self-hosted alternatives evaluated before commercial APIs. Budget approval for per-request costs.

**5. UI/UX Evolution Path:** (1) Now → MapLibre with CARTO/Esri raster styles. (2) After vector tile migration → smoother zoom, rotatable maps, 3D terrain. (3) After traffic integration → real-time congestion overlay on routes. No visual change should be user-breaking.

**6. Non-goals:** Do not migrate providers for aesthetic reasons. Do not build the provider abstraction layer preemptively. Do not commit to commercial providers without usage data justifying the cost.

### Future Theme D: Documentation-system maturity

**1. Current State:** Four strategic docs with cross-references and shared three-tier vocabulary. Docs are maintained by human + AI pair. Cross-doc consistency verified in audits.

**2. Productizing Stage:** Ensure every major future direction across all docs uses the consistent 6-part structure (this pass). Ensure every doc explicitly names which other docs to check for related content.

**3. Aspirational Stage:** Docs function as an execution-ready operating system — any new engineer or AI agent can read the four docs and know exactly what exists, what's next, what's not built, and why.

**4. Technical Prerequisites:** None — this is process discipline, not infrastructure.

**5. UI/UX Evolution Path:** N/A — these are internal docs.

**6. Non-goals:** Do not create additional docs for sub-features. Keep the doc count at four. Add sections to existing docs rather than spawning new files.

### Future Theme E: Mobile-first map experience

**1. Current State (Pass 22):** Mobile map surfaces now use edge-to-edge full-bleed layout — no rounded shells, no side margins, no min-height overflow on short viewports. Floating navigation overlays (maneuver card, bottom HUD) now render on mobile, not hidden behind `lg:` breakpoints. CoverageMapDialog is full-viewport on mobile. ShopDirectoryScreen removes framed container on mobile. Desktop richness is preserved via responsive `md:`/`lg:` breakpoints.

**2. Productizing Stage:** Bottom-sheet / drawer pattern for shop listings on mobile (swipe up from bottom). Compact floating controls sized for thumb reach. Gesture-friendly map interactions (pinch, swipe). Pull-to-refresh for discovery results. Safe-area-insets support for notched phones.

**3. Aspirational Stage:** Native-feeling mobile navigation with haptic feedback (vibration API). Progressive web app (PWA) with offline map tile cache. Lock-screen widget showing active navigation. Voice-first interaction mode on mobile (activate/pause/end by voice).

**4. Technical Prerequisites:** Bottom-sheet component (Radix or custom with `@use-gesture`). Touch event handlers separate from pointer events. Viewport height handling (`dvh` units where supported). PWA manifest and service worker for offline support.

**5. UI/UX Evolution Path:** (1) Now → responsive layout, floating controls visible on all sizes. (2) After productizing → swipe-friendly bottom sheets, thumb-zone-optimized controls. (3) After aspirational → PWA install, offline maps, haptics, voice-first.

**6. Non-goals:** Do not build a separate mobile-only codebase. Do not strip desktop features to simplify mobile. Do not attempt native app compilation (React Native, Capacitor) before web mobile is polished.

### Future Theme F: Globe / world mode honesty

**1. Current State:** MapLibre currently renders flat raster styles in 2D mode. There is no globe, 3D terrain, or world-mode rendering enabled in the checked-in build, and attempting to fake it with ornamental transforms would create a misleading experience.

**2. Productizing Stage:** No globe mode. Focus on polishing the 2D map experience — smooth tile transitions, proper zoom constraints, attribution clarity, and high-quality tile sources.

**3. Aspirational Stage:** True globe rendering requires a WebGL-based map renderer:

| Option          | Globe Support | Licensing   | Notes                                             |
| --------------- | ------------- | ----------- | ------------------------------------------------- |
| MapLibre GL JS  | Yes (native)  | BSD-3       | Free, open source, community maintained           |
| Mapbox GL JS v3 | Yes (native)  | Proprietary | Requires Mapbox API key; per-request pricing      |
| CesiumJS        | Yes (3D)      | Apache 2.0  | Full 3D globe; heavy bundle; overkill for 2D nav  |
| deck.gl         | Yes (layer)   | MIT         | Data visualization layer; not a full map renderer |

**4. Technical Prerequisites:** Provider abstraction layer (build only when migration is justified). WebGL support detection with graceful fallback to 2D. Performance budget for mobile devices with limited GPU.

**5. UI/UX Evolution Path:** (1) Now → flat 2D tiles, no globe. (2) After vector tiles (MapLibre) → smooth vector rendering, rotation, pitch. (3) After globe → seamless zoom from world view to street level. No forced transitions — users who prefer flat 2D should always have that option.

**6. Non-goals:** Do not fake globe with CSS transforms or decorative pitch hacks. Do not add 3D terrain before the core navigation experience is production-grade. Do not commit to Mapbox GL pricing without usage data. Do not present globe mode as "coming soon" until the vector-style migration is actually underway.

## Definition Of Done For Any Map Change

1. Build passes.
2. Persistence and reload behavior verified for touched flows.
3. Mobile and desktop behavior verified for touched UI.
4. Trust/fallback behavior verified when provider or performance signals degrade.
5. Both map docs updated with concise, non-duplicative entries.

6. For navigation session changes: Supabase is the source of truth for session state; localStorage is cache only. Session state must persist across reloads and devices. Cloud sync logic must be covered by tests and documented in both map docs and the Product Brain.

## Documentation Discipline

- Keep this master plan stable, strategic, and short-lived only by decision changes.
- Put granular delivery notes in the tracker.
- Retire stale map plans instead of keeping parallel "active" master docs.

## Pass 178 — Map-first overlays, dashboard bugfixes, mobile fix (2026-03-24)

**Status:** Complete

**Summary:**

- HomeScreen refactored for map-first overlays, floating panels
- DashboardHeader/logo micro-fix, removed blocky blue background
- Mobile loading bug and report marker tap-to-open fixed
- Strict verification and doc update

**Files touched:** src/app/components/codelayer/HomeScreen.tsx, src/app/components/maps/MapReportMarkers.tsx, src/app/components/dashboard/DashboardHeader.tsx

**Validation:** Build 1.81s, 0 errors. Diagnostics: 0. Spellcheck: 0.

---

## Passes T540–T545 — Systematic Map Surface Design Polish (2026-03-29)

**Status:** Complete

**Summary:**

- All 6 map program surfaces (4 fullscreen tabs + dashboard shop directory + dashboard home widget) brought to a consistent, compact, mobile-first design quality bar.
- Fullscreen tabs: tighter spacing (p-3), inline icon action buttons, centered illustration empty states, compact card layouts, badge-style indicators.
- Dashboard widget: friendlier empty/error states, contextual badge text.
- No functional logic changes — purely visual/layout improvements.

**Files touched:** PlannerAddressSearch.tsx, PlannerRoutePreview.tsx, NavigationBrowseDiscoveryPanel.tsx, NavigationSavedPlacesPanel.tsx, CoverageNearestShops.tsx, CustomerMapWidget.tsx

**Validation:** Build: 0 errors, 3.07s. Diagnostics: 0. Spellcheck: 0.

---

## Pass 179 — Shop loop completion (spatial shop actions, map-driven shop bid/accept) (2026-03-24)

**Status:** Historical snapshot (recorded as in progress on 2026-03-24)

**Summary:**

- Begin spatial shop action loop: map-driven shop bid/accept, shop overlays, and action flows
- Next: Complete customer decision loop, navigation/back flow hardening, doc/README realignment

**Files touched:** (pending)

**Validation:** (pending)

---
