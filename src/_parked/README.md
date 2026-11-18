# Parked screens

The first-generation app screens (Home dashboard, Site, Alerts & incidents, Tasks, How it meets the brief) are parked
here while the signed-in experience is rebuilt one dashboard at a time (owner decision, 18 Nov 2026). They are not
routed: their URLs redirect to `/` (see `next.config.ts`). Reuse components from `src/components/` as each new
dashboard is approved, then delete what is no longer needed.
