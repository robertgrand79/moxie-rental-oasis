

## Per-Organization Discount System

**Goal**: Allow platform admins to set a custom % discount per organization. When they subscribe or renew through Stripe, the discount is automatically applied via a Stripe Coupon.

### How It Works

Stripe has a native **Coupon + Customer** system. We'll store the discount % on the org record, then when the checkout session is created, we dynamically create a Stripe coupon and attach it. For renewals, Stripe automatically continues applying the coupon to subsequent invoices.

---

### 1. Database: Add discount fields to `organizations`

New columns:
- `discount_percent` (integer, nullable) — e.g. 20 for 20% off
- `discount_notes` (text, nullable) — reason for discount
- `discount_set_by` (uuid, nullable, references auth.users)
- `discount_set_at` (timestamptz, nullable)
- `stripe_coupon_id` (text, nullable) — stores the Stripe coupon ID for this org

### 2. UI: Discount Dialog (new component)

Create `DiscountDialog.tsx` alongside `CompAccountDialog.tsx` in `src/components/admin/platform/billing/`. Fields:
- Percentage input (1–100 slider or number input)
- Notes field (e.g., "Partner rate", "Early adopter")
- Remove discount button if one exists

Add a "%" icon action button to `SubscriptionsList.tsx` rows (next to the comp gift icon) and to `TenantDetailView.tsx`.

### 3. Checkout: Apply Stripe Coupon at subscription creation

In `platform-subscription-checkout/index.ts`:
- After fetching the org, check if `discount_percent` is set
- If so, create or reuse a Stripe coupon (`stripe.coupons.create({ percent_off, duration: 'forever' })`)
- Store the `stripe_coupon_id` back on the org
- Pass `discounts: [{ coupon: couponId }]` to `stripe.checkout.sessions.create()`
- Remove the `trial_period_days` if a discount is set (or keep it — your call)

### 4. Webhook: Ensure renewals honor the coupon

No extra work needed — Stripe automatically applies `duration: 'forever'` coupons to every renewal invoice. If you remove the discount, we'll call `stripe.subscriptions.update()` to remove the coupon.

### 5. Display discount info

- Show a badge on `SubscriptionsList` rows (e.g., "20% off")
- Show discount details on `BillingSubscriptionTab` so the org owner can see their rate

---

### Files to create/modify

| File | Change |
|------|--------|
| `supabase/migrations/...` | Add `discount_percent`, `discount_notes`, `discount_set_by`, `discount_set_at`, `stripe_coupon_id` to `organizations` |
| `src/components/admin/platform/billing/DiscountDialog.tsx` | **New** — UI for setting/removing discount |
| `src/components/admin/platform/billing/SubscriptionsList.tsx` | Add discount icon action + discount badge |
| `src/components/admin/superadmin/TenantDetailView.tsx` | Add "Set Discount" button |
| `supabase/functions/platform-subscription-checkout/index.ts` | Create Stripe coupon and attach to checkout session |
| `src/integrations/supabase/types.ts` | Auto-updated with new columns |

