## What and why
<!-- One or two sentences. Link the requirement / KRCS criterion this serves (docs/PROJECT_RULES.md). -->

## Changes
- 

## Database
- [ ] No database change
- [ ] New migration(s) in `supabase/migrations/` — RLS enabled and policies added for every new table
- [ ] Migration is backward compatible with the currently deployed app (expand → migrate → contract)
- [ ] No destructive SQL, or the owner confirmed it and the file has `-- allow-destructive: <reason>`

## Verification
- [ ] `npm run check` passes locally
- [ ] Tested on mobile width and desktop
- [ ] Simulated data, if any, is labelled **SIMULATED**

## Risks / follow-ups
<!-- Security, privacy, data, rollout or rollback notes. "None" is a valid answer. -->
