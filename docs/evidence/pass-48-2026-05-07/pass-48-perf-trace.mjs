// Pass 48 — KI-053 dedicated perf trace.
// Captures Chrome DevTools performance traces under real interaction load
// (pan + zoom + marker hover) on:
//   1. Landing inline coverage map  (proxy for MapLibreServiceCoverageMap usage)
//   2. CoverageMapDialog (fullscreen)
// at two viewports: 1280x900 (desktop) and 375x812 (mobile via CDP).
//
// Authenticated dashboard MapLibreServiceCoverageMap path is intentionally
// skipped — Clerk session is not scriptable from puppeteer-core without
// either a magic link or a stored session, both of which are out of pass
// scope. The landing dialog uses the same component family (same hooks,
// same MapLibre instance shape) so the hot-path findings transfer.
//
// Outputs:
//   docs/evidence/pass-48-2026-05-07/trace-landing-1280.json
//   docs/evidence/pass-48-2026-05-07/trace-landing-375.json
//   docs/evidence/pass-48-2026-05-07/trace-dialog-1280.json
//   docs/evidence/pass-48-2026-05-07/trace-dialog-375.json
//   docs/evidence/pass-48-2026-05-07/runtime-summary.json
//
// Audit-only. No app code touched.

import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = path.resolve("docs/evidence/pass-48-2026-05-07");
const URL = process.env.PASS48_URL ?? "http://localhost:5173/";
fs.mkdirSync(BASE, { recursive: true });

const VIEWPORTS = [
  { id: "1280", width: 1280, height: 900, mobile: false },
  { id: "375", width: 375, height: 812, mobile: true },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findCanvas(page) {
  return page.evaluate(() => {
    const c = document.querySelector(".maplibregl-canvas, canvas");
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return {
      x: r.x + r.width / 2,
      y: r.y + r.height / 2,
      w: r.width,
      h: r.height,
    };
  });
}

async function interactWithMap(page, label) {
  const box = await findCanvas(page);
  if (!box) {
    console.log(`[${label}] no canvas; idle-only trace`);
    await sleep(5000);
    return { canvasFound: false };
  }
  // Pan in 4 directions
  const pans = [
    [-80, -60],
    [80, 0],
    [0, 70],
    [-50, 50],
  ];
  for (const [dx, dy] of pans) {
    await page.mouse.move(box.x, box.y);
    await page.mouse.down();
    await page.mouse.move(box.x + dx, box.y + dy, { steps: 10 });
    await page.mouse.up();
    await sleep(280);
  }
  // Zoom in then out (3 steps each)
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(box.x, box.y);
    await page.mouse.wheel({ deltaY: -300 });
    await sleep(220);
  }
  for (let i = 0; i < 3; i++) {
    await page.mouse.move(box.x, box.y);
    await page.mouse.wheel({ deltaY: 300 });
    await sleep(220);
  }
  // Marker hovers — sample 5 spots in a ring around center
  const ring = [
    [-90, 0],
    [60, -40],
    [40, 60],
    [-50, 60],
    [0, -80],
  ];
  for (const [dx, dy] of ring) {
    await page.mouse.move(box.x + dx, box.y + dy);
    await sleep(180);
  }
  // Settle
  await sleep(1500);
  return { canvasFound: true };
}

async function traceSurface({ page, label, viewport, prepare }) {
  if (prepare) {
    await prepare();
  }
  // Wait for map idle (no canvas mutation for short window)
  await sleep(800);
  const tracePath = path.join(BASE, `trace-${label}-${viewport.id}.json`);
  await page.tracing.start({
    path: tracePath,
    screenshots: false,
    categories: [
      "devtools.timeline",
      "disabled-by-default-devtools.timeline",
      "disabled-by-default-devtools.timeline.frame",
      "disabled-by-default-v8.cpu_profiler",
      "blink.user_timing",
      "v8.execute",
    ],
  });
  const interaction = await interactWithMap(page, label);
  await page.tracing.stop();
  const stat = fs.statSync(tracePath);
  return {
    label,
    viewport: viewport.id,
    tracePath: path.relative(process.cwd(), tracePath),
    bytes: stat.size,
    canvasFound: interaction.canvasFound,
  };
}

async function runViewport(browser, viewport) {
  const page = await browser.newPage();
  await page.setViewport({
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    isMobile: viewport.mobile,
    hasTouch: viewport.mobile,
  });

  // Console error capture
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text().slice(0, 240));
    }
  });

  await page.goto(URL, { waitUntil: "networkidle2", timeout: 25000 });
  await sleep(1200);

  // ---- Surface 1: landing inline coverage map ----
  // Scroll the landing inline map into view.
  await page.evaluate(() => {
    const c = document.querySelector(".maplibregl-canvas, canvas");
    if (c) c.scrollIntoView({ block: "center" });
  });
  await sleep(900);
  const landing = await traceSurface({
    page,
    label: "landing",
    viewport,
  });

  // ---- Surface 2: CoverageMapDialog (fullscreen) ----
  // Open via any button text matching "Open Coverage Map" / "See full map" /
  // "Explore the live map" / "Coverage map" — the operating-regions section
  // ships a CTA. Fall back to clicking the canvas itself if no CTA found.
  const dialogOpened = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
    const cta = buttons.find((el) => {
      const t = (el.textContent ?? "").toLowerCase();
      return (
        t.includes("open coverage map") ||
        t.includes("see full map") ||
        t.includes("explore the live map") ||
        t.includes("explore live map") ||
        t.includes("coverage map") ||
        t.includes("open map")
      );
    });
    if (cta) {
      cta.scrollIntoView({ block: "center" });
      cta.click();
      return cta.textContent?.trim().slice(0, 80) ?? null;
    }
    return null;
  });
  let dialog = null;
  if (dialogOpened) {
    await sleep(1500);
    // Wait for the dialog content to mount and its canvas to appear.
    await sleep(1500);
    dialog = await traceSurface({
      page,
      label: "dialog",
      viewport,
    });
    // Close dialog if Close button exists.
    await page
      .evaluate(() => {
        const close = document.querySelector('button[aria-label="Close map"]');
        if (close) close.click();
      })
      .catch(() => {});
  }

  await page.close();
  return {
    viewport: viewport.id,
    consoleErrors: consoleErrors.slice(0, 25),
    consoleErrorCount: consoleErrors.length,
    surfaces: { landing, dialog, dialogCtaClicked: dialogOpened },
  };
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-features=CalculateNativeWinOcclusion"],
  });
  const results = [];
  try {
    for (const v of VIEWPORTS) {
      console.log(`[viewport ${v.id}] starting`);
      const r = await runViewport(browser, v);
      results.push(r);
      console.log(`[viewport ${v.id}] done`);
    }
  } finally {
    await browser.close();
  }
  const summary = {
    capturedAt: new Date().toISOString(),
    url: URL,
    viewports: results,
  };
  fs.writeFileSync(path.join(BASE, "runtime-summary.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
