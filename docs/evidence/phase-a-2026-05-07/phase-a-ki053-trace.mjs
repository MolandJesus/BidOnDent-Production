// KI-053 map performance trace.
// Captures a Chrome DevTools performance profile + network log for ~12s
// of typical map interaction on the public coverage map (the surface that
// most mobile/landing users touch first), plus the same on the authenticated
// shop-directory map if it can be reached. Audit-only.
import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = path.resolve("docs/evidence/phase-a-2026-05-07");
fs.mkdirSync(BASE, { recursive: true });

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

    const reqs = [];
    const responses = [];
    page.on("request", (r) => {
      if (
        r.url().includes("basemaps.cartocdn") ||
        r.url().includes("tile") ||
        r.url().includes("openstreetmap") ||
        r.url().includes("arcgis")
      ) {
        reqs.push({
          t: Date.now(),
          method: r.method(),
          url: r.url(),
          type: r.resourceType(),
        });
      }
    });
    page.on("response", (r) => {
      const u = r.url();
      if (
        u.includes("basemaps.cartocdn") ||
        u.includes("tile") ||
        u.includes("openstreetmap") ||
        u.includes("arcgis")
      ) {
        responses.push({ t: Date.now(), status: r.status(), url: u });
      }
    });
    page.on("requestfailed", (r) => {
      const u = r.url();
      if (
        u.includes("basemaps.cartocdn") ||
        u.includes("tile") ||
        u.includes("openstreetmap") ||
        u.includes("arcgis")
      ) {
        reqs.push({ t: Date.now(), failed: true, url: u, err: r.failure()?.errorText });
      }
    });

    await page.goto("http://localhost:5173/", { waitUntil: "networkidle2", timeout: 20000 });
    await new Promise((r) => setTimeout(r, 2500));

    // Scroll to coverage map
    await page.evaluate(() => {
      const map = document.querySelector(
        '[class*="coverage" i] canvas, .maplibregl-canvas, canvas'
      );
      if (map) map.scrollIntoView({ behavior: "instant", block: "center" });
    });
    await new Promise((r) => setTimeout(r, 1500));

    // Start trace
    const tracePath = path.join(BASE, "ki053-trace.json");
    await page.tracing.start({ path: tracePath, screenshots: false });

    // Find a canvas to interact with
    const canvasBox = await page.evaluate(() => {
      const c = document.querySelector(".maplibregl-canvas, canvas");
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
    });

    if (canvasBox) {
      // Pan
      for (let i = 0; i < 3; i++) {
        await page.mouse.move(canvasBox.x, canvasBox.y);
        await page.mouse.down();
        await page.mouse.move(canvasBox.x - 80, canvasBox.y - 60, { steps: 10 });
        await page.mouse.up();
        await new Promise((r) => setTimeout(r, 700));
      }
      // Zoom (wheel)
      for (let i = 0; i < 4; i++) {
        await page.mouse.move(canvasBox.x, canvasBox.y);
        await page.mouse.wheel({ deltaY: -300 });
        await new Promise((r) => setTimeout(r, 600));
      }
      // Idle
      await new Promise((r) => setTimeout(r, 2500));
    } else {
      console.log("[ki053] no canvas found — capturing idle only");
      await new Promise((r) => setTimeout(r, 5000));
    }

    await page.tracing.stop();

    const summary = {
      capturedAt: new Date().toISOString(),
      page: "landing coverage map (unauthenticated)",
      viewport: "1280x900",
      tileRequests: {
        total: reqs.length,
        failed: reqs.filter((r) => r.failed).length,
        firstUrl: reqs[0]?.url ?? null,
        sampleFailures: reqs.filter((r) => r.failed).slice(0, 5),
      },
      responseStatusCounts: responses.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {}),
    };
    fs.writeFileSync(path.join(BASE, "ki053-summary.json"), JSON.stringify(summary, null, 2));
    console.log("trace written to", tracePath);
    console.log("summary:", JSON.stringify(summary, null, 2));
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
