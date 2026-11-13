# Environments and configuration

All runtime configuration is read in `src/lib/env.ts`. When adding a variable, update that file, `.env.example`
and this table in the same pull request.

## Application variables (set in Vercel)
| Variable | Preview (development) | Production | Secret? |
|---|---|---|---|
| `NEXT_PUBLIC_APP_ENV` | `development` | `production` | No |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<dev-ref>.supabase.co` | `https://<prod-ref>.supabase.co` | No |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | dev publishable key (`sb_publishable_…`) | prod publishable key | No — safe because RLS is enforced |

`NEXT_PUBLIC_*` values are compiled into browser code. **Never** put a secret key, database password or token in one.
The Supabase **secret** key (`sb_secret_…`) is not used by the app yet; when server-only code needs it, it will be added
as a non-public variable and documented here.

## CI/CD configuration (set in GitHub → Settings)
| Name | Kind | Where | Purpose |
|---|---|---|---|
| `PIPELINE_ENABLED` | Variable | Repository | `true` turns on the Release workflow (set last) |
| `VERCEL_ORG_ID` | Variable | Repository | Vercel team/account ID |
| `VERCEL_PROJECT_ID` | Variable | Repository | Vercel project ID |
| `SUPABASE_DB_URL` | Secret | Environment `development` | Dev database session-pooler connection string |
| `VERCEL_TOKEN` | Secret | Environment `development` | Vercel deploy token |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Secret | Environment `development` | Lets smoke tests reach protected preview URLs |
| `SUPABASE_DB_URL` | Secret | Environment `production` | Prod database session-pooler connection string |
| `VERCEL_TOKEN` | Secret | Environment `production` | Vercel deploy token |
| `PRODUCTION_URL` | Variable | Environment `production` | Public production URL, e.g. `https://aquasentinel.vercel.app` |

Environment secrets are only released to workflow jobs that run on `main` and (for production) after approval.
