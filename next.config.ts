import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Inline the commit SHA at build time so /api/health can prove which commit is live.
  // CI sets GIT_COMMIT_SHA; Vercel Git builds provide VERCEL_GIT_COMMIT_SHA.
  env: {
    GIT_COMMIT_SHA: process.env.GIT_COMMIT_SHA || process.env.VERCEL_GIT_COMMIT_SHA || "",
  },
  poweredByHeader: false,
};

export default nextConfig;
