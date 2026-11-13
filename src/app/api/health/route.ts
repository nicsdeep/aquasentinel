import { buildHealthReport } from "@/lib/health";

/**
 * GET /api/health — used by CI smoke tests to verify a deployment:
 * the response must report the expected commit SHA and a reachable Supabase.
 */
export async function GET() {
  const report = await buildHealthReport();
  return Response.json(report, {
    status: report.status === "ok" ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
