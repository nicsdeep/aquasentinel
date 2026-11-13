# Environments and configuration

All runtime configuration is read in `src/lib/env.ts`. When adding a variable, update that file, `.env.example`
and this table in the same pull request.

## Application variables (set in Vercel → Settings → Environment Variables)
| Variable | Production value | Secret? |
|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | `production` | No |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wkebtafpbcgotlwqpnqn.supabase.co` | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | production publishable key (`sb_publishable_…`) | No — safe because RLS is enforced |

`NEXT_PUBLIC_*` values are compiled into browser code. **Never** put a secret key, database password or token in one,
and do not store database credentials in Vercel at all: the app does not use them, and migrations run from GitHub Actions.
The Supabase **secret** key (`sb_secret_…`) is not used yet; when server-only code needs it, it will be added as a
non-public, Production-only variable and documented here.

## CI/CD configuration (set in GitHub → Settings)
| Name | Kind | Where | Purpose |
|---|---|---|---|
| `PIPELINE_ENABLED` | Variable | Repository | `true` turns on the Release workflow (set last) |
| `VERCEL_ORG_ID` | Variable | Repository | Vercel team/account ID |
| `VERCEL_PROJECT_ID` | Variable | Repository | Vercel project ID |
| `SUPABASE_DB_URL` | Secret | Environment `production` | Production database **session pooler** connection string |
| `VERCEL_TOKEN` | Secret | Environment `production` | Vercel deploy token |
| `PRODUCTION_URL` | Variable | Environment `production` | `https://ifsl.vercel.app` |

Environment secrets are released only to workflow jobs running on `main` (set the environment's deployment branch rule).
