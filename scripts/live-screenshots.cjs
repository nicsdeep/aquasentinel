/* eslint-disable */
// Screenshots of the LIVE site exactly as the owner sees it on their phone and laptop (CLAUDE.md → Reporting).
// Usage: node scripts/live-screenshots.cjs --out <dir> [--url https://ifsl.vercel.app] [--paths /,/challenge] [--device phone|laptop|both]
const { chromium } = require("playwright");

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith("--") ? [...a, [v.slice(2), all[i + 1]]] : a), []),
);
const base = (args.url || "https://ifsl.vercel.app").replace(/\/$/, "");
const paths = (args.paths || "/").split(",");
const out = args.out || ".";
const which = args.device || "both";

// The owner's phone: Android, 360 CSS px wide at 2.5x (900 px screenshots), Chrome.
const DEVICES = {
  phone: {
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 2.5,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  },
  laptop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

/** Wait until fonts are ready and every image currently on screen has loaded (max 8 s), then let motion settle. */
async function settle(page) {
  await page
    .waitForFunction(
      () => {
        if (document.fonts.status !== "loaded") return false;
        return [...document.images].every((img) => {
          const r = img.getBoundingClientRect();
          const onScreen = r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
          return !onScreen || (img.complete && img.naturalWidth > 0);
        });
      },
      null,
      { timeout: 8000, polling: 200 },
    )
    .catch(() => {});
  await page.waitForTimeout(700);
}

(async () => {
  // In cloud containers set PW_CHROMIUM_PATH to the preinstalled Chromium (docs/DEVELOPMENT.md).
  const browser = await chromium.launch(process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {});
  // Read /api/health through the browser (it honours the network proxy; plain fetch may not).
  const probe = await browser.newPage();
  const health = JSON.parse(await (await probe.goto(`${base}/api/health`)).text());
  await probe.close();
  const sha = (health.commitSha || "unknown").slice(0, 7);
  const stamp = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";
  const files = [];
  for (const [name, opts] of Object.entries(DEVICES)) {
    if (which !== "both" && which !== name) continue;
    for (const path of paths) {
      const context = await browser.newContext(opts); // fresh: no cache, no cookies
      const page = await context.newPage();
      await page.goto(base + path, { waitUntil: "load", timeout: 60000 });
      await settle(page);
      const { total, step } = await page.evaluate(() => ({ total: document.documentElement.scrollHeight, step: window.innerHeight }));
      const slug = path === "/" ? "home" : path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
      for (let y = 0, n = 1; y < total; y += step, n++) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await settle(page);
        const file = `${out}/${name}-${slug}-${String(n).padStart(2, "0")}.png`;
        await page.screenshot({ path: file });
        files.push(file);
      }
      await context.close();
    }
  }
  await browser.close();
  console.log(`Live ${base} · commit ${sha} · ${stamp}`);
  for (const f of files) console.log(f);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
