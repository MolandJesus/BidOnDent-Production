// Pass 49 — Trace parser. Same shape as pass-48-parse-traces.mjs but
// reads from pass-49-2026-05-07/ and emits parsed-summary-after.{json,md}.

import fs from "node:fs";
import path from "node:path";

const BASE = path.resolve("docs/evidence/pass-49-2026-05-07");
const FILES = [
  "trace-landing-1280-after-noscroll.json",
  "trace-landing-1280-after-scrolled.json",
  "trace-landing-375-after-noscroll.json",
  "trace-landing-375-after-scrolled.json",
];

function loadTrace(file) {
  const raw = JSON.parse(fs.readFileSync(path.join(BASE, file), "utf8"));
  return Array.isArray(raw) ? raw : (raw.traceEvents ?? []);
}

function topByKey(map, n) {
  return Object.entries(map)
    .sort((a, b) => b[1].totalUs - a[1].totalUs)
    .slice(0, n)
    .map(([k, v]) => ({
      key: k,
      totalMs: +(v.totalUs / 1000).toFixed(1),
      count: v.count,
      maxMs: +(v.maxUs / 1000).toFixed(1),
      avgMs: +(v.totalUs / v.count / 1000).toFixed(2),
    }));
}

function shortenUrl(u) {
  if (!u) return "(no-url)";
  if (u.startsWith("data:")) return "(inline data:)";
  if (u.startsWith("blob:")) return "(blob)";
  const noQ = u.split("?")[0].split("#")[0];
  return noQ.length > 110 ? "..." + noQ.slice(-110) : noQ;
}

function processTrace(events) {
  const byName = {};
  const byUrl = {};
  const byFn = {};
  let longTaskUs = 0;
  let totalUs = 0;
  const longTasks = [];

  for (const e of events) {
    if (e.ph !== "X" || typeof e.dur !== "number") continue;
    const dur = e.dur;
    totalUs += dur;
    if (dur >= 50000) {
      longTaskUs += dur;
      longTasks.push({
        name: e.name,
        ms: +(dur / 1000).toFixed(1),
        url: shortenUrl(e.args?.data?.url),
        fn: e.args?.data?.functionName,
      });
    }
    const slot = (m, k) => {
      if (!m[k]) m[k] = { totalUs: 0, count: 0, maxUs: 0 };
      m[k].totalUs += dur;
      m[k].count += 1;
      if (dur > m[k].maxUs) m[k].maxUs = dur;
    };
    slot(byName, e.name);
    const url = e.args?.data?.url;
    if (url) slot(byUrl, shortenUrl(url));
    const fn = e.args?.data?.functionName;
    if (fn) slot(byFn, fn);
  }
  longTasks.sort((a, b) => b.ms - a.ms);
  return {
    eventCount: events.length,
    completeEventCount: Object.values(byName).reduce((s, v) => s + v.count, 0),
    longTaskMs: +(longTaskUs / 1000).toFixed(0),
    totalMs: +(totalUs / 1000).toFixed(0),
    topByName: topByKey(byName, 10),
    topByUrl: topByKey(byUrl, 10),
    topByFunction: topByKey(byFn, 10),
    longestTasks: longTasks.slice(0, 10),
  };
}

const all = {};
for (const f of FILES) {
  if (!fs.existsSync(path.join(BASE, f))) {
    console.log(`Skip ${f} (missing)`);
    continue;
  }
  console.log(`Parsing ${f}...`);
  const events = loadTrace(f);
  all[f] = processTrace(events);
  console.log(
    `  events=${events.length} long-task=${all[f].longTaskMs}ms top=${all[f].topByName[0]?.key}@${all[f].topByName[0]?.totalMs}ms`
  );
}

fs.writeFileSync(path.join(BASE, "parsed-summary-after.json"), JSON.stringify(all, null, 2));

const lines = ["# Pass 49 — Lazy-Mount Inline Landing Map: Parsed Trace Summary", ""];
for (const f of Object.keys(all)) {
  const r = all[f];
  lines.push(`## ${f}`, "");
  lines.push(
    `- Events: ${r.eventCount} · Complete events: ${r.completeEventCount} · Long-task burden (>50ms): **${r.longTaskMs}ms**`,
    ""
  );
  lines.push(`### Top 10 by event name`, "");
  lines.push(`| Event | total ms | count | max ms | avg ms |`);
  lines.push(`|---|---:|---:|---:|---:|`);
  for (const e of r.topByName) {
    lines.push(`| ${e.key} | ${e.totalMs} | ${e.count} | ${e.maxMs} | ${e.avgMs} |`);
  }
  lines.push("", `### Top 10 by URL (script source)`, "");
  lines.push(`| URL | total ms | count | max ms |`);
  lines.push(`|---|---:|---:|---:|`);
  for (const e of r.topByUrl) {
    lines.push(`| ${e.key} | ${e.totalMs} | ${e.count} | ${e.maxMs} |`);
  }
  lines.push("", `### Top 10 by JS function`, "");
  lines.push(`| Function | total ms | count | max ms |`);
  lines.push(`|---|---:|---:|---:|`);
  for (const e of r.topByFunction) {
    lines.push(`| ${e.key} | ${e.totalMs} | ${e.count} | ${e.maxMs} |`);
  }
  lines.push("", `### Longest 10 single tasks (>50ms)`, "");
  lines.push(`| name | ms | url | fn |`);
  lines.push(`|---|---:|---|---|`);
  for (const t of r.longestTasks) {
    lines.push(`| ${t.name} | ${t.ms} | ${t.url ?? ""} | ${t.fn ?? ""} |`);
  }
  lines.push("");
}
fs.writeFileSync(path.join(BASE, "parsed-summary-after.md"), lines.join("\n"));
console.log("\nWrote parsed-summary-after.{json,md}");
