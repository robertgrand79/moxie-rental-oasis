

## How Team Email Alerts Work Today

The system already has a working notification pipeline for inbound emails:

1. **Webhook receives email** → `platform-inbound-webhook` stores it in `platform_emails` and routes to guest inbox
2. **Guest inbox routing** creates an `admin_notifications` record via `createAdminNotification()`
3. **Database trigger** (`trigger_instant_notification`) fires on new `admin_notifications` rows, calling the `send-instant-notification` edge function
4. **`send-instant-notification`** checks each team member's **notification preferences** and sends email/SMS accordingly

So the infrastructure exists. The reason your team may not be getting alerted is the **notification preferences configuration**. By default, instant email is only sent for `high` or `urgent` priority notifications, and SMS only for `urgent`. Guest messages come in as `normal` priority.

## What Needs to Happen

### Option A — Quick fix (no code changes)
Each team member goes to **Admin → Settings → Notifications** and toggles on **Instant Email** and/or **SMS** for the "Guest Message" notification type. This will immediately start sending alerts when emails arrive at `team@moxievacationrentals.com`.

### Option B — Change defaults so alerts are on by default
Update the `send-instant-notification` edge function to default instant email to `true` for guest messages (currently it only defaults to true for high/urgent priority). This way team members get email alerts without needing to manually enable them.

**Specific change**: In `send-instant-notification/index.ts` line 141, change the default logic:
```
// Current: only sends email by default for high/urgent
const shouldSendEmail = preferences?.email_instant ?? (payload.priority === "urgent" || payload.priority === "high");

// New: also default to true for guest messages
const shouldSendEmail = preferences?.email_instant ?? 
  (payload.priority === "urgent" || payload.priority === "high" || payload.notification_type === "guest_message");
```

### Option C — Add more team members as recipients
Currently, notifications with `user_id: null` go to org members with `admin` or `owner` roles. If you have team members with other roles (e.g., `manager`, `member`), they won't receive alerts. We could expand the recipient query to include all org members, or let you configure which roles get email alerts.

## Recommendation

Do **Option A now** (toggle preferences in settings) for immediate results, and implement **Option B** so future team members get alerts by default without manual configuration. Let me know which approach you'd like.

