# AquaSentinel

**Detect Early. Respond Locally. Keep Water Flowing.**

One unified, user-first community water-system monitoring and maintenance platform for resource-constrained
settings such as Ngomano, Makueni. It prioritises the real KRCS water problem: unreliable pumping, solar downtime,
ageing conveyance, insufficient elevated storage, limited maintenance capacity and weak infrastructure oversight.

> **Status:** infrastructure skeleton. No product features have been built yet.
> Live: https://ifsl.vercel.app · every change merged to `main` deploys to production automatically after CI.

## Documentation
| Document | Purpose |
|---|---|
| [docs/PROJECT_RULES.md](docs/PROJECT_RULES.md) | Governing requirements: KRCS criteria, security, honesty rules |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System and delivery architecture |
| [docs/ENVIRONMENTS.md](docs/ENVIRONMENTS.md) | Local and production, and every configuration variable |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | One-time setup of GitHub, Supabase and Vercel, and how releases work |
| [docs/SECURITY.md](docs/SECURITY.md) | Secrets, access control, RLS and data-protection baseline |
| [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) | Development standards and daily workflow |
| [CLAUDE.md](CLAUDE.md) | Rules every Claude Code session follows in this repository |

## Quick start (local)
```bash
npm ci
cp .env.example .env.local   # optional: fill in Supabase values
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck + unit tests
```
