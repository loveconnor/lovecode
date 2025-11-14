This is a [Next.js](https://nextjs.org) project that builds **Freelance Hub**, a web delivery control room for leads who manage freelance web developers. The chat experience routes work between agents like Web Dev Bench, Delivery Pipeline, Program Ops, Market Intel, and Payouts so leads can:

- Check which web developers are available, deployable, or over capacity
- Inspect web project bookings, runway, delivery burn, and ledger movements
- Spin up invoices/payouts, timers, exports, or research dives
- Keep context sticky with working memory + artifact visuals

## Highlights

- **Supabase Auth + Preferences** – Sign up/log in with Supabase, manage the
  “Use Demo Data” toggle, and persist per-user integration secrets.
- **Settings shell** – A two-tab panel (`/settings`, `/settings/integrations`)
  mirrors product UI specs and lets teammates manage their profile and external
  credentials in one place.
- **Agent tools & artifacts** – Chat turns can launch tools that stream
  artifacts (balance sheets, revenue plots, etc.) into the Canvas alongside the
  conversation.
- **Devtools overlay** – The floating heart badge in the lower-right corner
  opens the AI devtools console for debugging agent streams.

## Getting Started

### 1. Environment Setup

Copy the environment variables template:

```bash
cp .env.local.example .env.local
```

Add your API keys:

```env
# Required
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key

# Optional - Memory Persistence
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# External Integrations
QUICKBOOKS_ACCESS_TOKEN=eyJ...
QUICKBOOKS_REALM_ID=1234567890
GREENHOUSE_API_TOKEN=your-greenhouse-harvest-token
NOTION_API_TOKEN=secret_xxx
NOTION_DOCS_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxx
LINEAR_API_KEY=lin_xxx
ASANA_ACCESS_TOKEN=1/xxxxxxxx
GMAIL_ACCESS_TOKEN=ya29.xxxxx
# Optional - Admin service role (only needed for one-off migrations)
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

> **Tip:** Each integration is optional. If a token/env var is missing the agents fall back to the bundled mock data so the product remains usable during local development. In the running app you can also head to **Settings → Integrations** and paste per-user keys; they’re stored in Supabase so every teammate can bring their own accounts without touching `.env`. There’s also a **Use Demo Data** toggle for demos—flip it on to force the agents to skip external calls even if credentials are configured.

## Supabase Storage

Create the tables defined in `supabase.sql` (base preferences/integrations) and `supabase-auth.sql` (auth supporting objects) inside your Supabase project, then set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Those two env vars are required because authentication now runs entirely through Supabase Auth. The optional `SUPABASE_SERVICE_ROLE_KEY` is only used for ad-hoc migrations or scripts—no runtime calls rely on it anymore.

Once configured, head to **Settings → General** to verify your profile and
toggle demo data, and **Settings → Integrations** to paste provider tokens.

| Integration | Used By | Required Env Vars |
|-------------|---------|-------------------|
| QuickBooks Online | Delivery finance boards / runway | `QUICKBOOKS_ACCESS_TOKEN`, `QUICKBOOKS_REALM_ID` |
| Greenhouse Harvest API | Web dev bench (list freelance devs) | `GREENHOUSE_API_TOKEN` |
| Notion API | Program Ops documents search | `NOTION_API_TOKEN`, `NOTION_DOCS_DATABASE_ID` |
| Stripe Billing | Payouts / invoices (list, get, create, update) | `STRIPE_SECRET_KEY` |
| Linear GraphQL API | Project tracker (list projects) | `LINEAR_API_KEY` |
| Asana REST API | Time entries / sprint timers | `ASANA_ACCESS_TOKEN` |
| Gmail API | Inbox triage | `GMAIL_ACCESS_TOKEN` |

**Memory Storage Options:**

| Provider | When to Use | Setup Required |
|----------|------------|----------------|
| **In-Memory** | Development, testing | None - works by default |
| **Upstash Redis** | Production, persistent across restarts | Add env vars |

**To use Upstash (recommended for production):**
1. Create free account: https://console.upstash.com
2. Create a Redis database
3. Copy REST URL and Token to `.env.local`

The app automatically detects Upstash credentials and switches providers - no code changes needed!

### 2. Install dependencies:

```bash
bun install
```

### 3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
