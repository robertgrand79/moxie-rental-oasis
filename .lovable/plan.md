

## Plan: Hide Resend Config Unless Portfolio Plan

The Resend API key configuration is currently exposed to all organizations in two places. Since we're using a single platform Resend account, org-level Resend config should only be available to Portfolio-tier orgs as a premium feature (custom sending domain).

### Changes

**1. CommunicationsSettingsPage.tsx** (lines 302-318)
- Wrap the "Resend Email" section in a tier check: only render if `organization.subscription_tier === 'portfolio'`
- For non-portfolio orgs, show a brief note like "Email is managed by the platform. Upgrade to Portfolio for custom email domain configuration."
- Also remove `resend_api_key` from the form submission logic when not portfolio tier

**2. IntegrationsSettingsPanel.tsx** (lines 475-492)
- Same treatment: hide the Resend API key input unless the org is on the portfolio plan
- Show a small upgrade prompt instead

**3. CommunicationsSettingsPage.tsx** — form state cleanup
- Skip submitting `resend_api_key` when org is not portfolio tier (line 117-119)

### How tier is accessed
- `organization.subscription_tier` is already available from `useCurrentOrganization()` — used elsewhere in the codebase (e.g., `useActiveAnnouncements`)
- Simple string comparison: `organization?.subscription_tier === 'portfolio'`

### What users see
- **Starter/Professional**: QUO SMS config only. A note explaining email is platform-managed.
- **Portfolio**: Full Resend API key config section, enabling custom sending domains.

