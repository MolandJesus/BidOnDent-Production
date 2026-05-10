// One-off mobile/tablet screenshot capture for Phase A evidence batch.
// Uses puppeteer-core + the system Chrome so no extra browser download is needed.
// Authorized as audit-only for 2026-05-07 Phase A pass; safe to delete after.
import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = path.resolve("docs/evidence/phase-a-2026-05-07");
fs.mkdirSync(BASE, { recursive: true });

const VIEWPORTS = [
  { name: "375", width: 375, height: 812, dsf: 2, isMobile: true },
  { name: "768", width: 768, height: 1024, dsf: 2, isMobile: true },
];
const THEMES = [
  { name: "light", key: "light" },
  { name: "dark", key: "map-dark" },
];
const UA_MOBILE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

async function captureSurface(page, surfaceName) {
  await new Promise((r) => setTimeout(r, 1100));
  const file = path.join(BASE, `${surfaceName}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log("  saved", path.basename(file));
}

async function clickByText(page, text) {
  // Click the first visible element whose text content matches `text`.
  const handle = await page.evaluateHandle((t) => {
    const candidates = Array.from(document.querySelectorAll("button, a, [role='button']"));
    return (
      candidates.find((el) => {
        const txt = (el.innerText || el.textContent || "").trim();
        return txt && new RegExp(t, "i").test(txt);
      }) || null
    );
  }, text);
  const el = handle.asElement();
  if (!el) return false;
  await el.click().catch(() => {});
  return true;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox"],
  });
  try {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        const page = await browser.newPage();
        await page.setUserAgent(UA_MOBILE);
        await page.setViewport({
          width: vp.width,
          height: vp.height,
          deviceScaleFactor: vp.dsf,
          isMobile: vp.isMobile,
          hasTouch: vp.isMobile,
        });
        // seed localStorage on the dev origin BEFORE app boots
        await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded" });
        await page.evaluate((k) => localStorage.setItem("bidondent.appearance-mode", k), theme.key);
        await page.goto("http://localhost:5173/", { waitUntil: "networkidle2", timeout: 20000 });
        await new Promise((r) => setTimeout(r, 3000));

        console.log(`\n[${vp.name}/${theme.name}] dashboard`);
        await captureSurface(page, `dashboard_${vp.name}_${theme.name}`);

        if (await clickByText(page, "^Account$")) {
          await new Promise((r) => setTimeout(r, 1300));
          await captureSurface(page, `account_${vp.name}_${theme.name}`);
        }

        if (await clickByText(page, "^Bids$")) {
          await new Promise((r) => setTimeout(r, 1300));
          await captureSurface(page, `bids_${vp.name}_${theme.name}`);
        }

        if (await clickByText(page, "^Report$")) {
          await new Promise((r) => setTimeout(r, 1500));
          await captureSurface(page, `report_${vp.name}_${theme.name}`);
        }

        // back to dashboard
        await clickByText(page, "^Dashboard$");
        await new Promise((r) => setTimeout(r, 1100));

        // tap "Find Shops" tile if reachable
        if (await clickByText(page, "Find Shops")) {
          await new Promise((r) => setTimeout(r, 3500));
          await captureSurface(page, `findshops_${vp.name}_${theme.name}`);
        } else {
          console.log("  Find Shops tile not found at this viewport");
        }

        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
