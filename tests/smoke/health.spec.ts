import { expect, test } from "@playwright/test";

const expectedSha = process.env.EXPECTED_COMMIT_SHA;
const requireSupabase = process.env.REQUIRE_SUPABASE === "true";

test("health endpoint reports the expected build", async ({ request }) => {
  const res = await request.get("/api/health");
  const body = await res.json();
  expect(body.app).toBe("aquasentinel");
  if (expectedSha) expect(body.commitSha).toBe(expectedSha);
  if (requireSupabase) {
    expect(res.status()).toBe(200);
    expect(body.checks.supabase).toBe("ok");
  }
});

test("home page renders on desktop and mobile", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "AquaSentinel" })).toBeVisible();
  await expect(page.getByAltText("AquaSentinel").first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
