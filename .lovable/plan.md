

## Current State

You have **two separate email systems** that are disconnected:

1. **Platform Email Inbox** (`/admin/platform/email`) — This IS receiving emails. I confirmed dozens of recent inbound emails in the `platform_emails` table (from VRBO, Airbnb, Turno, Hospitable, guests, etc.) all arriving to `@moxievacationrentals.com` addresses.

2. **Guest Inbox** (`/admin/host/inbox`) — This has **zero inbound emails**. Only 3 old SMS messages. The `resend-inbound-webhook` edge function that's supposed to route emails here has never been triggered (no logs at all).

### Why emails don't appear in the Guest Inbox

The Resend webhook is configured to call `platform-inbound-webhook`, which stores emails in `platform_emails` (the platform-level inbox). The separate `resend-inbound-webhook` function — which matches emails to guest reservations and creates `guest_communications` records — is never called.

Additionally, `resend-inbound-webhook` can only route emails to the guest inbox when it finds a matching reservation by sender email. Emails from platforms like VRBO, Airbnb, or Turno use system addresses (e.g., `sender@messages.homeaway.com`) that won't match any guest reservation.

## Plan

### 1. Merge inbound routing into a single webhook

Update `platform-inbound-webhook` to **also** attempt guest inbox routing after storing in `platform_emails`. This way one webhook handles both:
- Always store in `platform_emails` (current behavior, keeps working)
- Additionally check if the sender email matches a guest reservation → if yes, also create a `guest_communications` record and link to an inbox thread

### 2. Handle "orphaned" emails that don't match reservations

Store orphaned inbound emails (no reservation match) in `guest_communications` with a `null` reservation but still linked to an inbox thread. This requires:
- A small migration to make `reservation_id` nullable on `guest_communications` (if not already)
- Creating an "unmatched" thread so admins can still see and respond to these emails from the guest inbox

### 3. Add email display in the Guest Inbox thread view

Ensure the thread detail view properly renders inbound email messages with subject lines, timestamps, and formatted content — not just SMS bubbles.

### 4. Remove the unused `resend-inbound-webhook` function

Since `platform-inbound-webhook` will handle everything, remove `resend-inbound-webhook` to avoid confusion.

### Files Changed
- `supabase/functions/platform-inbound-webhook/index.ts` — Add guest inbox routing logic (reservation lookup, thread creation, `guest_communications` insert)
- `supabase/functions/resend-inbound-webhook/index.ts` — Delete (consolidate into above)
- Migration SQL — Make `guest_communications.reservation_id` nullable if needed
- Thread detail UI components — Ensure email messages render properly in guest inbox

### What this means for you
After implementation, emails sent to `team@moxievacationrentals.com` (or any configured address) will:
1. Continue appearing in Platform Email (`/admin/platform/email`) as they do now
2. **Also** appear in the Guest Inbox (`/admin/host/inbox`) when the sender matches a known guest
3. Unmatched emails will appear as "Unknown Guest" threads you can review and manually link

