// Pass 49 — Re-run perf trace against the lazy-mounted landing inline
// coverage map. Captures TWO scenarios per viewport so the lazy-mount
// gain is visible:
//
//   (A) "noscroll" — open landing, do scroll-only interaction at the
//       hero / regions area but NEVER scroll to the map. Map stays
//       UNMOUNTED. This is where the lazy-mount win appears.
//   (B) "scrolled" — scroll to map (triggers mount + 1.5s settle),
//       then run the same pan/zoom/hover script as Pass 48. Apples-
//       to-apples with Pass 48 landing trace.
//
// Outputs:
//   docs/evidence/pass-49-2026-05-07/trace-landing-{1280,375}-after-noscroll.json
//   docs/evidence/pass-49-2026-05-07/trace-landing-{1280,375}-after-scrolled.json
//   docs/evidence/pass-49-2026-05-07/runtime-summary-after.json

import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = path.resolve("docs/evidence/pass-49-2026-05-07");
const URL = process.env.PASS49_URL ?? "http://localhost:5173/";
fs.mkdirSync(BASE, { recursive: true });

const VIEWPORTS = [
  { id: "1280", width: 1280, height: 900, mobile: false },
  { id: "375", width: 375, height: 812, mobile: true },
];

const TRACE_CATEGORIES = [
  "devtools.timeline",
  "disabled-by-default-devtools.timeline",
  "disabled-by-default-devtools.timeline.frame",
  "disabled-by-default-v8.cpu_profiler",
  "blink.user_timing",
  "v8.execute",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function findCanvas(page) {
  return page.evaluate(() => {
    const c = document.querySelector(".maplibregl-canvas, canvas");
    if (!c) return null;
    const r = c.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
}

async function mapInteract(page) {
  const box = await findCanvas(page);
  if (!box) {
    await sleep(5000);
    return { canvasFound: false };
  }
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
  await sleep(1500);
  return { canvasFound: true };
}

async function aboveFoldInteract(page, viewport) {
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel({ deltaY: 60 });
    await sleep(280);
  }
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel({ deltaY: -40 });
    await sleep(280);
  }
  const cx = viewport.width / 2;
  for (const dy of [120, 220, 320, 420]) {
    await page.mouse.move(cx - 80, dy);
    await sleep(180);
    await page.mouse.move(cx + 80, dy);
    await sleep(180);
  }
  await sleep(1500);
  return { canvasFound: false };
}

async function startTrace(page, file) {
  const tracePath = path.join(BASE, file);
  await page.tracing.start({
    path: tracePath,
    screenshots: false,
    categories: TRACE_CATEGORIES,
  });
  return tracePath;
}

async function stopTrace(page, tracePath) {
  await page.tracing.stop();
  const stat = fs.statSync(tracePath);
  return { tracePath: path.relative(process.cwd(), tracePath), bytes: stat.size };
}

async function runViewport(browser, viewport) {
  const consoleErrors = [];
  const surfaces = [];

  // Scenario A: noscroll
  {
    const page = await browser.newPage();
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
    });
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(`A:${m.text().slice(0, 240)}`);
    });
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 25000 });
    await sleep(1200);
    const file = `trace-landing-${viewport.id}-after-noscroll.json`;
    const tp = await startTrace(page, file);
    await aboveFoldInteract(page, viewport);
    const meta = await stopTrace(page, tp);
    const mapMounted = await page.evaluate(() => !!document.querySelector(".maplibregl-canvas"));
    surfaces.push({ scenario: "noscroll", ...meta, mapMounted });
    await page.close();
  }

  // Scenario B: scrolled
  {
    const page = await browser.newPage();
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      isMobile: viewport.mobile,
      hasTouch: viewport.mobile,
    });
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(`B:${m.text().slice(0, 240)}`);
    });
    await page.goto(URL, { waitUntil: "networkidle2", timeout: 25000 });
    await sleep(1200);
    // Walk the page in steps so the IntersectionObserver fires regardless
    // of where the map ends up on the page. After each step, give the
    // mount + MapLibre init a beat.
    for (let step = 1; step <= 8; step += 1) {
      await page.evaluate((s) => {
        window.scrollTo({ top: s * window.innerHeight * 0.7, behavior: "instant" });
      }, step);
      await sleep(350);
      const found = await page.evaluate(() => !!document.querySelector(".maplibregl-canvas"));
      if (found) break;
    }
    // Settle for canvas to appear and tiles to load.
    await sleep(2500);
    await page.evaluate(() => {
      const c = document.querySelector(".maplibregl-canvas");
      if (c) c.scrollIntoView({ block: "center" });
    });
    await sleep(800);

    const file = `trace-landing-${viewport.id}-after-scrolled.json`;
    const tp = await startTrace(page, file);
    const interaction = await mapInteract(page);
    const meta = await stopTrace(page, tp);
    surfaces.push({ scenario: "scrolled", ...meta, ...interaction });
    await page.close();
  }

  return {
    viewport: viewport.id,
    consoleErrors: consoleErrors.slice(0, 25),
    consoleErrorCount: consoleErrors.length,
    surfaces,
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
    pass: 49,
    note: "Two scenarios per viewport. (A) noscroll: user never scrolls to map; map stays unmounted — this is the lazy-mount win surface. (B) scrolled: scroll to map, mount fires, then same pan/zoom/hover script as Pass 48 — apples-to-apples with Pass 48 landing trace.",
    viewports: results,
  };
  fs.writeFileSync(path.join(BASE, "runtime-summary-after.json"), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
