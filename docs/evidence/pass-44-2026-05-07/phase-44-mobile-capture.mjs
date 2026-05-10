// Pass 44 — Authenticated mobile evidence capture (puppeteer-core + system Chrome).
//
// Strategy A: cookie injection. If `mobile-auth-cookies.json` exists in this
// dir (gitignored), inject those cookies before navigation. If the resulting
// session validates, capture authenticated mobile evidence at 375 + 768 ×
// {light, dark} for dashboard / account / bids / report / find-shops.
//
// If the cookies file is missing OR Clerk redirects to /sign-in despite
// injection, fall back to capturing the unauthenticated landing surface and
// log the fallback explicitly. Both outcomes produce useful audit evidence.
//
// Owner cookie-export procedure:
//   1. Open http://localhost:5173/dashboard in your normal logged-in Chrome.
//   2. DevTools → Application → Cookies → http://localhost:5173
//   3. Copy values for `__session` and `__client_uat` into a new file
//      `docs/evidence/pass-44-2026-05-07/mobile-auth-cookies.json` (gitignored)
//      using `mobile-auth-cookies.example.json` as the shape.
//   4. `node docs/evidence/pass-44-2026-05-07/phase-44-mobile-capture.mjs`
//   5. Real cookies file STAYS LOCAL — never commit.
import puppeteer from "puppeteer-core";
import path from "node:path";
import fs from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = path.resolve("docs/evidence/pass-44-2026-05-07");
const COOKIES_PATH = path.join(BASE, "mobile-auth-cookies.json");
fs.mkdirSync(BASE, { recursive: true });

const VIEWPORTS = [
  { w: 375, h: 812, dsf: 2, isMobile: true, label: "375" },
  { w: 768, h: 1024, dsf: 2, isMobile: true, label: "768" },
];
const THEMES = [
  { name: "light", key: "light" },
  { name: "dark", key: "map-dark" },
];

const SURFACES_AUTH = [
  { name: "dashboard", path: "/dashboard", clickAfter: null },
  { name: "account", path: "/dashboard", clickAfter: "Account" },
  { name: "bids", path: "/dashboard", clickAfter: "Bids" },
  { name: "report", path: "/dashboard", clickAfter: "Report" },
  { name: "findshops", path: "/dashboard", clickAfter: null, scrollDown: true },
];

const cookies = (() => {
  if (!fs.existsSync(COOKIES_PATH)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(COOKIES_PATH, "utf8"));
    return raw.filter((c) => !c._comment && c.value && !c.value.startsWith("REPLACE_"));
  } catch (err) {
    console.error("[pass-44] failed to parse cookies file:", err.message);
    return null;
  }
})();

const mode = cookies && cookies.length > 0 ? "auth" : "unauth-fallback";
console.log(`[pass-44] capture mode: ${mode}`);
if (mode === "auth") console.log(`[pass-44] injecting ${cookies.length} cookies`);

const log = [];

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
        await page.setViewport({
          width: vp.w,
          height: vp.h,
          deviceScaleFactor: vp.dsf,
          isMobile: vp.isMobile,
          hasTouch: vp.isMobile,
        });

        // Seed theme + cookies before any navigation.
        await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded" });
        await page.evaluate((k) => localStorage.setItem("bidondent.appearance-mode", k), theme.key);
        if (cookies) {
          try {
            await page.setCookie(...cookies);
          } catch (err) {
            console.error(`[pass-44] setCookie failed:`, err.message);
          }
        }

        for (const surface of SURFACES_AUTH) {
          const url = `http://localhost:5173${surface.path}?cb=${Date.now()}`;
          await page.goto(url, { waitUntil: "networkidle2", timeout: 20000 }).catch(() => {});
          await new Promise((r) => setTimeout(r, 2000));

          const finalUrl = page.url();
          const isSignIn =
            /sign-?in|sign-?up|\/$/.test(finalUrl) && !finalUrl.includes("/dashboard");

          if (surface.clickAfter && !isSignIn) {
            const clicked = await page.evaluate((label) => {
              const buttons = Array.from(document.querySelectorAll("button"));
              const btn = buttons.find((b) => b.textContent?.trim().startsWith(label));
              if (btn) {
                btn.click();
                return true;
              }
              return false;
            }, surface.clickAfter);
            if (clicked) await new Promise((r) => setTimeout(r, 1500));
          }

          if (surface.scrollDown && !isSignIn) {
            await page.evaluate(() => scrollTo({ top: innerHeight * 1.2, behavior: "instant" }));
            await new Promise((r) => setTimeout(r, 1200));
          }

          const filename = `${surface.name}_${vp.label}_${theme.name}.png`;
          await page.screenshot({ path: path.join(BASE, filename) });
          log.push({
            file: filename,
            viewport: `${vp.w}x${vp.h}`,
            theme: theme.name,
            requestedSurface: surface.name,
            finalUrl,
            authResolved: !isSignIn,
          });
          console.log(`  saved ${filename}  →  ${finalUrl}  (auth=${!isSignIn})`);
        }

        await page.close();
      }
    }

    fs.writeFileSync(
      path.join(BASE, "capture-log.json"),
      JSON.stringify({ mode, capturedAt: new Date().toISOString(), entries: log }, null, 2)
    );
    console.log("[pass-44] done");
  } finally {
    await browser.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
