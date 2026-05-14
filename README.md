# Moxie Rental Oasis

Multi-tenant vacation rental platform for Stay Moxie.

## Tech stack

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Anthropic Claude (via the Supabase Edge Functions)
- Deployed on Vercel

## Local development

Requires Node.js and npm. Recommended to install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <repo-url>
cd moxie-rental-oasis
npm install
npm run dev
```

Dev server runs on http://localhost:8080.

## Deployment

Pushes to `main` deploy automatically to Vercel. Edge Function changes deploy to Supabase via the workflow in `.github/workflows/`.

## Custom domains

Custom tenant domains are added through the Vercel project's
[Settings → Domains](https://vercel.com/grandtech/moxie-rental-oasis/settings/domains)
page. Wildcard DNS for `*.staymoxie.com` routes platform subdomains, but each
new subdomain must be registered explicitly in Vercel.
