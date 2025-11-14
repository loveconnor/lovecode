# Freelance Hub Workspace

This repo houses **Freelance Hub**, a production-grade workspace where
web program leads can coordinate freelance web developers, monitor site
delivery pipelines, and run automations against the finance + ops stack. The project is built
with Next.js (App Router), Supabase Auth, and a suite of internal packages
for integrations, memory, and agent orchestration.

## Repository Layout

```
apps/
  freelance-hub/        # Next.js control room experience
packages/
  agents/               # Agent framework + routing utilities
  artifacts/            # Streaming artifact helpers
  devtools/             # In-browser debug console and viewer
  memory/ store/        # Shared state abstractions
...
```

Freelance Hub lives in `apps/freelance-hub` while shared logic sits in the
`packages/*` directories (agents, artifacts, memory, devtools, etc.).

## Getting Started

1. **Install tooling**

   ```bash
   bun install    # installs all workspace deps
   ```

2. **Build all packages**

   ```bash
   bun run build
   ```

3. **Run the Freelance Hub app**

   ```bash
   cd apps/freelance-hub
   bun dev
   ```

   The app relies on Supabase Auth + Database tables described in
   `apps/freelance-hub/supabase.sql`. Copy `.env.local.example` inside that app
   and provide your API keys (OpenAI, Supabase URL/Anon key, optional
   integration tokens).

## Development Notes

- **Monorepo commands** – any package can be built/tested individually with
  `bun run --filter <pkg> <script>`.
- **Devtools** – the floating heart button opens the real-time agent/devtools
  console for debugging tool calls and reasoning traces.
- **Contributions** – PRs should target individual packages when possible and
  keep generated `dist` files in sync if you touch them.

Refer to `apps/freelance-hub/README.md` for app-specific setup, and peek into
each package directory for more granular documentation.
