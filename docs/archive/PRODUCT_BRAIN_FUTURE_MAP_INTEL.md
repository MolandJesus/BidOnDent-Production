# BidOnDent Product Brain — Archived Future Map Intelligence & Navigation Roadmap

**Archived:** April 2, 2026 (Pass 537 — Documentation System Cleanup)
**Source:** BIDONDENT_PRODUCT_BRAIN.md, lines 1572-1803
**Reason:** Overlap with Quick Reference Cards at top of Product Brain. Role-specific future planning and navigation productization roadmap preserved here for reference.

---

## Role-Specific Future Map Intelligence

None of these features are implemented today — all are Tier 3. Each role follows the same 6-part structured plan.

---

### Customer Map Intelligence

**Purpose:** Help customers make faster, better-informed repair decisions through geographic context.

#### 1. Current State

- Customers can view the coverage map and browse partner shops
- No customer-specific map features exist beyond the shared coverage surface
- No geographic context is used in the customer repair flow

#### 2. Productizing Stage

| Feature               | Description                                               | Data Needed                                     |
| --------------------- | --------------------------------------------------------- | ----------------------------------------------- |
| Nearest partner shops | Compact map widget showing shops within coverage radius   | Partner shops from Supabase (already available) |
| Repair status pin     | Pin showing where the vehicle is currently being repaired | Report status + shop location                   |

#### 3. Aspirational Stage

| Feature                   | Description                                                    | Data Needed                               |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| Smart shop recommendation | Route-to-shop weighting distance, rating, wait time, and price | Shop ratings + availability + bid history |
| Insurance-preferred route | Highlight insurer-preferred shops on map during shop selection | Insurer-shop relationship data            |

#### 4. Technical Prerequisites

- `report_locations` table — latitude/longitude captured at report submission
- Shop availability API or column for wait-time estimates
- Insurer-shop preference data in Supabase

#### 5. UI/UX Evolution Path

1. **Now:** Coverage map is the only map surface customers see
2. **After Productizing:** Compact CarPlay-style widget on customer dashboard showing nearest 3-5 shops with distance/rating, tappable to expand
3. **After Aspirational:** Shop selection flow becomes map-first with smart routing recommendations

#### 6. What Should NOT Be Built Yet

- Do not add customer-to-customer social features on the map
- Do not build real-time tracking of repair technician location
- Do not replace the existing bid-comparison UI with a map-only flow

---

### Shop Map Intelligence

**Purpose:** Give shops geographic awareness of their service area, incoming opportunities, and competitive landscape.

#### 1. Current State

- Shops can view the coverage map and their own profile
- No shop-specific map features exist (no service area visualization, no request awareness)
- Service radius is not stored in Supabase

#### 2. Productizing Stage

| Feature                    | Description                                          | Data Needed                         |
| -------------------------- | ---------------------------------------------------- | ----------------------------------- |
| Service area visualization | Boundary overlay showing the shop's operating radius | Shop profile + service radius value |

#### 3. Aspirational Stage

| Feature                  | Description                                            | Data Needed                                  |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------- |
| Incoming request heatmap | Geographic distribution of active repair requests      | Geo-coded report locations                   |
| Customer proximity alert | Notification when nearby customer submits a report     | Real-time Supabase subscription + geofencing |
| Competitor overlay       | Nearby competing shops with rating/capacity comparison | Network directory data                       |

#### 4. Technical Prerequisites

- `shop_service_areas` table — geofenced polygons or radius values per shop
- `report_locations` table — shared prerequisite with customer intelligence
- Supabase real-time subscriptions for proximity alerting
- Network directory must include competitor shops, not just partners

#### 5. UI/UX Evolution Path

1. **Now:** Shops see only the coverage map like any other user
2. **After Productizing:** Service-area command widget on shop dashboard showing defined boundary
3. **After Aspirational:** Incoming requests visible as map pins by proximity, tappable for quick bid action

#### 6. What Should NOT Be Built Yet

- Do not build shop-to-shop messaging through the map
- Do not add technician dispatch routing until the repair-status workflow is production-grade
- Do not show competitor pricing data on the map — competitive info should be limited to rating/capacity

---

### Insurer Map Intelligence

**Purpose:** Give insurers geographic insight into claims, network coverage, and repair capacity.

#### 1. Current State

- Insurers can view the coverage map and network directory
- No insurer-specific map analytics exist (no claim clustering, no gap analysis)
- Claims are not geo-coded in Supabase

#### 2. Productizing Stage

| Feature              | Description                                           | Data Needed                       |
| -------------------- | ----------------------------------------------------- | --------------------------------- |
| Network coverage map | Partner shops by region with capacity/rating overlays | Shop profiles + relationship data |

#### 3. Aspirational Stage

| Feature               | Description                                                    | Data Needed                                 |
| --------------------- | -------------------------------------------------------------- | ------------------------------------------- |
| Claims density map    | Regional claim clustering with trend analysis                  | Aggregated claim geo data over time         |
| Coverage gap analysis | Regions with demand but insufficient shop coverage             | Report locations vs shop locations          |
| Route optimization    | Optimal claim-to-shop assignment based on geography + capacity | Optimization algorithm + real-time capacity |

#### 4. Technical Prerequisites

- `claim_assignments` table — insurer → shop assignment with geographic context
- `report_locations` table — shared prerequisite (enables gap analysis)
- `shop_availability` table — real-time capacity/wait-time per shop
- Aggregation queries for claim density over time periods

#### 5. UI/UX Evolution Path

1. **Now:** Insurers see only the shared coverage map
2. **After Productizing:** Regional overview widget on insurer dashboard showing network health by area
3. **After Aspirational:** Interactive drill-down map with claim density, gap warnings, and assignment optimization

#### 6. What Should NOT Be Built Yet

- Do not build fraud-detection overlays on the map
- Do not add real-time claim tracking pins until claim status workflow is production-grade
- Do not attempt route optimization without the `shop_availability` prerequisite

## Navigation Productization Roadmap

### 1. Current State

The navigation system works end-to-end. GPS tracks, routes calculate, voice speaks, speed limits display. But reliability and UX gaps prevent it from being production-grade:

| Capability          | Status                        | Gap                                           |
| ------------------- | ----------------------------- | --------------------------------------------- |
| GPS tracking        | Real (`watchPosition`)        | No graceful handling of GPS loss              |
| Route calculation   | Real (OSRM public)            | No error handling for network failures        |
| Voice navigation    | Real (Web Speech API)         | Varies across browsers                        |
| Speed limits        | Real (Overpass API)           | No "data unavailable" fallback state          |
| Rerouting           | **Delivered** (Pass 486-T703) | Auto-reroute with deviation detection + toast |
| Cloud persistence   | **Partial** (local sessions)  | Sessions not yet persisted to Supabase        |
| Settings UI         | **Delivered** (Pass 486)      | Voice/speed settings panel in navigation      |
| Integration testing | Not implemented               | No test coverage for navigation flows         |
| Tile theme sync     | **Delivered** (Pass 487)      | Overlays match light/dark/satellite tile mode |
| Mobile layout       | **Delivered** (Pass 488)      | All overlays safe at 375px viewport           |

As of March 29, 2026, coverage browse and landing-route previews keep the user-selected ZIP/address context authoritative by default; passive background GPS only takes over when the user explicitly switches the surface into geolocation mode. The public landing coverage entry also now accepts U.S.-wide home/store address search as a first-class origin, so route previews can start from real addresses before fullscreen map entry. Apple Maps / Google Maps / Waze export is still available, but it is now intentionally demoted behind an explicit export disclosure during active navigation so the BidOnDent route experience remains primary.

Fullscreen route chrome has also been tightened on the same date: the active-navigation summary sheet, maneuver rail, speed panel, and mobile browse sheet now bias toward smaller map-first controls instead of oversized card stacks. This is a UI polish step, not a capability leap; integration testing and route-reliability hardening are still required before the navigation system can be treated as fully production-grade.

### 2. Productizing Stage

Make navigation reliable enough that users trust it during real drives.

| Step                       | What                                                         | Acceptance                                        | Status                                                      |
| -------------------------- | ------------------------------------------------------------ | ------------------------------------------------- | ----------------------------------------------------------- |
| 2a. GPS degradation        | Show last known position + prominent warning on GPS loss     | Warning visible within 3 seconds of signal loss   | **Delivered** — GPS acquiring state + degradation indicator |
| 2b. Network error handling | Graceful fallback when OSRM or Overpass requests fail        | Error message shown, app does not crash or freeze | Partial — needs formal error states                         |
| 2c. Speed data fallback    | Display "speed limit unavailable" state clearly              | No blank/stale speed display                      | Not started                                                 |
| 2d. Deviation detection    | Detect when user is >200m off route, prompt reroute          | Prompt appears within 5 seconds of deviation      | **Delivered** — detectDeviation.ts + auto-reroute + toast   |
| 2e. Cross-browser testing  | Verify voice across Chrome, Safari, Firefox, mobile browsers | Known issues documented, workarounds applied      | **Delivered** — voice preview + Web Speech compatibility    |
| 2f. Error telemetry        | Log navigation failures for debugging                        | Failures visible in console/monitoring            | Not started                                                 |

### 3. Aspirational Stage

Navigation becomes a differentiated product feature, not just a utility.

| Step                     | What                                                    | Acceptance                                 | Status                                            |
| ------------------------ | ------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| 3a. Settings panel       | Voice persona picker, speed unit toggle, volume control | User can configure navigation preferences  | **Delivered** — settings sheet with voice preview |
| 3b. Cloud sync           | Navigation sessions persisted via Supabase              | Sessions survive device changes            | Not started — local session only                  |
| 3c. Automatic rerouting  | Re-query OSRM with current position on deviation        | New route displayed within 3 seconds       | **Delivered** — auto-reroute + confirmation toast |
| 3d. ETA updates          | Live ETA recalculation during navigation                | ETA updates every 30 seconds               | **Delivered** — live distance countdown + ETA     |
| 3e. Navigation history   | Last 10 routes with cloud persistence                   | History viewable in settings/profile       | Not started                                       |
| 3f. Marketplace routing  | Route-to-shop includes shop info card at destination    | Shop rating/wait-time visible at route end | **Partial** — arrival celebration exists          |
| 3g. Offline caching      | Cached routes for poor connectivity areas               | Route loads from cache within 1 second     | Not started                                       |
| 3h. Provider abstraction | Support OSRM / Mapbox / Google interchangeably          | Provider swappable via config              | Not started                                       |

### 4. Technical Prerequisites

| Prerequisite                                                  | Needed For  | Exists Today                                               |
| ------------------------------------------------------------- | ----------- | ---------------------------------------------------------- |
| Error boundary around navigation components                   | Stage 2a-2c | Yes                                                        |
| Deviation calculation utility (current pos vs route polyline) | Stage 2d    | **Yes** — `src/app/features/navigation/detectDeviation.ts` |
| Web Speech API browser compatibility matrix                   | Stage 2e    | **Yes** — voice preview + browser compat in settings sheet |
| `navigation_sessions` Supabase table                          | Stage 3b    | No                                                         |
| `navigation_preferences` Supabase table                       | Stage 3a    | No (settings stored locally, not cloud-persisted)          |
| Shop availability data for route-end cards                    | Stage 3f    | No                                                         |
| Route tile/data caching mechanism                             | Stage 3g    | No                                                         |

### 5. UI/UX Evolution Path

1. **Now:** Navigation panel with GPS dot, route line, voice, speed — functional but no error states
2. **After Stage 2:** Same UI but with visible degradation states — user sees warnings instead of broken/stale data
3. **After Stage 3a:** Settings drawer accessible from navigation panel for voice/speed/unit preferences
4. **After Stage 3c-3d:** Active navigation feels responsive — auto-reroutes and updates ETA live
5. **After Stage 3f:** Arriving at a shop triggers a rich card with rating, wait time, and bid info
6. **Final state:** Navigation is a competitive feature, not just directions

### 6. What Should NOT Be Built Yet

- Do not add multi-stop routing before single-route reliability is production-grade
- Do not add real-time traffic awareness without a traffic data provider budgeted and selected
- Do not build CarPlay / Android Auto surfaces before the web navigation is polished
- Do not migrate away from OSRM unless a specific feature requires it (see Provider Evolution below)
- Do not add premium TTS before the Web Speech API works reliably across browsers

### Provider Evolution Decision Framework

The current stack (MapLibre GL JS + OSRM + Nominatim + Overpass) is free, real, and functional. Migration criteria:

| Trigger                | Example                                     | Action                                         |
| ---------------------- | ------------------------------------------- | ---------------------------------------------- |
| Feature gap            | Globe rendering needed → requires Mapbox GL | Evaluate Mapbox for map tiles only             |
| Rate limit hit         | Nominatim throttling during peak usage      | Evaluate commercial geocoding provider         |
| Reliability gap        | OSRM public downtime affecting users        | Evaluate self-hosted OSRM or Mapbox Directions |
| Business justification | Revenue supports per-request costs          | Full commercial stack evaluation               |

**Rule:** Do not migrate preemptively. Document the decision criteria and revisit when usage data justifies it.

---
