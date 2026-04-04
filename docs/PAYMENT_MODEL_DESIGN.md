# BidOnDent — Payment Model Design

**Created:** Pass 828 (Phase 4 planning)
**Status:** DECISION REQUIRED — awaiting business decision before implementation
**Dependencies:** Phases 1–3 COMPLETE, product functionally ready

---

## Current State

- **Zero payment infrastructure** in the codebase
- No Stripe, no payment types, no billing tables, no webhook handlers
- Single placeholder: `PaymentModal.tsx` showing "Coming Soon"
- Clean slate — no technical debt to unwind

---

## Three-Sided Marketplace

| Party         | Role                                        | Revenue Relationship                             |
| ------------- | ------------------------------------------- | ------------------------------------------------ |
| **Customers** | Report damage, receive bids, choose shop    | Free — they bring demand                         |
| **Shops**     | See opportunities, submit bids, manage jobs | **Primary revenue source** — they gain customers |
| **Insurers**  | Review claims, assign shops, manage network | Potential premium tier                           |

---

## Revenue Model Options

### Option A: Per-Bid Fee

Shops pay a fee each time they submit a bid on a damage report.

| Aspect               | Detail                                                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Pricing**          | $2–5 per bid submitted                                                                                           |
| **When charged**     | At bid creation                                                                                                  |
| **Stripe model**     | Standard (BidOnDent collects, no Connect needed)                                                                 |
| **Pros**             | Simple to implement. Pay-for-use aligns cost with value. Low barrier to entry for shops. No commitment required. |
| **Cons**             | Discourages bidding volume (bad for customers). Revenue unpredictable. Shops may game by bidding selectively.    |
| **Implementation**   | Payment intent at bid submission → block bid if payment fails                                                    |
| **Estimated passes** | 3–4 (payment service + bid gate + billing history)                                                               |

### Option B: Shop Subscription

Shops pay a monthly fee for platform access.

| Aspect               | Detail                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Pricing**          | $29–99/month (tiered: Basic, Pro, Premium)                                                                                        |
| **When charged**     | Monthly recurring                                                                                                                 |
| **Stripe model**     | Subscriptions API + Customer Portal                                                                                               |
| **Pros**             | Predictable revenue. Encourages unlimited bidding (good for customers). Simple billing UX. Easier financial planning.             |
| **Cons**             | Higher upfront barrier for new shops. Shops may churn if bid volume is low. Need to deliver enough value to justify monthly cost. |
| **Implementation**   | Subscription checkout → access gating → Stripe Customer Portal for management                                                     |
| **Estimated passes** | 4–5 (subscription service + portal + access control + billing UI)                                                                 |

**Potential tiers:**

| Tier    | Price  | Includes                                                       |
| ------- | ------ | -------------------------------------------------------------- |
| Basic   | $29/mo | 10 bids/month, basic notifications                             |
| Pro     | $59/mo | Unlimited bids, priority notifications, analytics              |
| Premium | $99/mo | Unlimited bids, insurance partner visibility, featured listing |

### Option C: Commission on Accepted Bids

BidOnDent takes a percentage of accepted bid amounts.

| Aspect               | Detail                                                                                                                                                                            |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Pricing**          | 5–10% of accepted bid value                                                                                                                                                       |
| **When charged**     | When customer accepts a bid                                                                                                                                                       |
| **Stripe model**     | Connect (Express accounts for shops, application fee on transfers)                                                                                                                |
| **Pros**             | Zero upfront cost for shops. Revenue scales with platform value. Aligned incentives (BidOnDent earns when shops earn). Most marketplace-native model.                             |
| **Cons**             | Most complex to implement (Stripe Connect). Shops must onboard to Stripe. Revenue depends on bid acceptance rate. Harder to audit/reconcile. Shops may try to take deals offline. |
| **Implementation**   | Stripe Connect onboarding → payment capture on bid accept → application fee → payout to shop                                                                                      |
| **Estimated passes** | 5–6 (Connect setup + onboarding flow + payment capture + payout + reconciliation)                                                                                                 |

### Option D: Hybrid (Recommended for Consideration)

Combine subscription + commission for maximum flexibility.

| Aspect               | Detail                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Pricing**          | $29/mo base + 3% commission on accepted bids                                                                                       |
| **Why**              | Base subscription covers platform costs. Lower commission aligns incentives. Shops tolerate small % when they already pay monthly. |
| **Complexity**       | Highest — combines subscription + Connect models                                                                                   |
| **Estimated passes** | 6–7                                                                                                                                |

---

## Insurer Revenue (Future)

Insurers could become a second revenue stream via:

- Premium analytics dashboard ($99–299/mo)
- Partner shop program management tools
- Claim volume-based pricing

**Recommendation:** Defer insurer monetization until shop revenue is proven.

---

## Technical Requirements by Model

### All Models Need

| Component                | Description                                                            |
| ------------------------ | ---------------------------------------------------------------------- |
| `stripe_customers` table | Map Clerk users to Stripe customer IDs                                 |
| `payment_records` table  | Transaction log for audit                                              |
| Stripe webhook handler   | `supabase/functions/server/webhooks/stripe.ts`                         |
| Billing UI               | Invoice history, payment method management                             |
| Environment secrets      | `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` |

### Per-Bid Additionally Needs

| Component                      | Description                   |
| ------------------------------ | ----------------------------- |
| Payment intent on bid creation | Block bid if payment fails    |
| Bid fee configuration          | Admin-configurable fee amount |

### Subscription Additionally Needs

| Component                           | Description                              |
| ----------------------------------- | ---------------------------------------- |
| `billing_subscriptions` table       | Track subscription status, tier, renewal |
| Stripe Customer Portal integration  | Self-service subscription management     |
| Access gating logic                 | Enforce limits based on tier             |
| Subscription upgrade/downgrade flow |                                          |

### Commission Additionally Needs

| Component                       | Description                     |
| ------------------------------- | ------------------------------- |
| Stripe Connect Express setup    | Shop onboarding to Stripe       |
| `stripe_connect_accounts` table | Map shops to Stripe Connect IDs |
| Application fee on transfers    | Automatic commission collection |
| Payout tracking                 | `payouts` table + status UI     |

---

## Recommendation

**Start with Option B (Subscription)** for the following reasons:

1. **Simplest implementation** after per-bid (4–5 passes)
2. **Predictable revenue** from day one
3. **Encourages bidding volume** which improves customer experience
4. **Low operational overhead** — Stripe handles billing automatically
5. **Can add commission later** as platform grows (hybrid model)
6. **No Stripe Connect complexity** initially

If the business prefers value-aligned pricing, Option C (Commission) is the most marketplace-native but requires more implementation work.

---

## Decision Needed

**Before Pass 829 can begin, the following must be decided:**

1. Which revenue model? (A / B / C / D)
2. What pricing? (specific amounts)
3. Standard Stripe or Stripe Connect?
4. Free trial period for shops? (7/14/30 days?)
5. Insurer monetization: defer or include?

---

## Implementation Plan (After Decision)

Once the model is chosen, passes 829+ will follow:

| Pass | Work                                                                  |
| ---- | --------------------------------------------------------------------- |
| 829  | Stripe SDK setup + environment config + `stripe_customers` migration  |
| 830  | Payment/subscription service + webhook handler                        |
| 831  | Billing UI (payment method, invoice history)                          |
| 832  | Model-specific logic (bid gate / access control / Connect onboarding) |
| 833  | Testing, edge cases, PaymentModal replacement                         |
