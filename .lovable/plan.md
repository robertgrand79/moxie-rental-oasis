

## Plan: Inbound Email → Guest Inbox Routing (COMPLETED)

### What was done

1. **Updated `platform-inbound-webhook`** to also route inbound emails to the guest inbox system:
   - After storing in `platform_emails` (existing behavior), now also calls `routeToGuestInbox()`
   - Looks up organization from recipient email domain (via `organizations.custom_domain`, `organizations.website`, or `site_settings` contactEmail/emailFromAddress)
   - Matches sender email to `property_reservations` for reservation linking
   - Creates/finds `guest_inbox_threads` via `get_or_create_inbox_thread` RPC
   - Inserts `guest_communications` record with email content and HTML body stored in `raw_email_data`
   - Updates thread with last message preview and sets status to `awaiting_reply`
   - Creates admin notification for the org

2. **Made `reservation_id` handling flexible** — already nullable in schema, now properly handled:
   - Unmatched emails (no reservation found) still create inbox threads
   - ThreadReplyComposer updated to store SMS without requiring reservation_id

3. **Updated Guest Inbox UI** for email rendering:
   - `MessageThread.tsx` now renders HTML email bodies (sanitized via DOMPurify) when `raw_email_data.body_html` is available
   - Falls back to plain text for SMS and emails without HTML
   - `ThreadMessage` interface updated to include `raw_email_data` typing

4. **Deleted `resend-inbound-webhook`** — consolidated into `platform-inbound-webhook`
