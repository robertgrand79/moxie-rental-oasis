

## Problem

The Guest Inbox conversation detail page renders **all messages** (email + SMS) in a unified chat-bubble layout. Emails get squeezed into small bubbles with truncated HTML — they can't be properly read. The user wants email and SMS to be treated as distinct experiences within the same thread.

## Plan

### 1. Split message rendering in MessageThread.tsx

Currently all messages use the same chat-bubble layout (lines 173-249). Refactor the message rendering loop to use two distinct components:

- **SMS messages** → Keep the existing chat-bubble style (left/right aligned, colored backgrounds, compact)
- **Email messages** → Render as full-width email cards spanning the thread width, similar to how `EmailViewer.tsx` in the Platform inbox works:
  - Show a card header with From/To, subject line, timestamp
  - Render `raw_email_data.body_html` (sanitized) in a full-width prose block, or fall back to `message_content` as plain text
  - Show attachment badges if `raw_email_data.has_attachments`
  - Include a small "Reply" button in the card footer
  - Subtle left border color to indicate direction (e.g., blue for outbound, gray for inbound)

### 2. Create EmailMessageCard.tsx component

New file: `src/components/admin/inbox/EmailMessageCard.tsx`

Props: `message: ThreadMessage`, `onReply: (msg) => void`

Layout:
```text
┌──────────────────────────────────────────┐
│ ✉ EMAIL  │  Subject: Re: Check-in info   │
│ From: guest@example.com                  │
│ To: host@property.com                    │
│ Mar 5, 2:30 PM                           │
├──────────────────────────────────────────┤
│                                          │
│  Full HTML email body rendered here      │
│  with prose styling, max-height scroll   │
│                                          │
├──────────────────────────────────────────┤
│                              [Reply]     │
└──────────────────────────────────────────┘
```

### 3. Update ThreadReplyComposer channel awareness

When user clicks "Reply" on an email card → pre-select `email` channel and pre-fill subject with `Re:` prefix. When replying from an SMS bubble → pre-select `sms` channel. This already partially works but we'll ensure the UX is clean.

### 4. Keep the unified timeline

Both email cards and SMS bubbles remain in a single chronological timeline — no separate tabs. The visual distinction alone makes it clear which is which.

### Files to modify
- **`src/components/admin/inbox/EmailMessageCard.tsx`** — New component for full-width email rendering
- **`src/components/admin/inbox/MessageThread.tsx`** — Split rendering: use `EmailMessageCard` for emails, keep bubbles for SMS

