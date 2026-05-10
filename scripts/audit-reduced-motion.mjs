#!/usr/bin/env node
/**
 * Pass 71 (2026-05-07) — KI-139 reduced-motion CSS coverage audit.
 *
 * LAW_ANIMATION_AND_ATMOSPHERE §3 requires every `@keyframes` referenced
 * by user-facing styles to be neutralized under
 * `@media (prefers-reduced-motion: reduce)`. Drift between added keyframes
 * and added guards (KI-139) is caught here.
 *
 * Algorithm (per CSS file):
 *   1. Find every `@keyframes <name>` definition.
 *   2. Find every consumer selector — i.e. CSS rules outside reduce blocks
 *      that reference the keyframe via an `animation` shorthand or
 *      `animation-name` longhand.
 *   3. Inside `@media (prefers-reduced-motion: reduce)` blocks, collect
 *      selectors that set `animation: none` / `animation: 0s` /
 *      `animation-duration: 0s` / `animation-name: none`. Wildcard selectors
 *      (`*`, `*::before`, etc.) are treated as covering every consumer.
 *   4. A keyframe is "guarded" if EVERY consumer selector that uses it is
 *      also (a) a wildcard target in a reduce block, or (b) named verbatim
 *      in a reduce block with an animation-disabling rule.
 *
 * Exit code:
 *   0 — every keyframe has full guard coverage.
 *   1 — at least one keyframe has unguarded consumers; failing names + the
 *       offending selectors are printed.
 *
 * Run directly:
 *   node scripts/audit-reduced-motion.mjs
 *
 * Pass 71 baseline: this script catches future drift only. Cleaning up the
 * existing backlog (KI-139 OPEN list) is staged for a later sweep.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const STYLES_DIR = resolve(__dirname, "..", "src", "styles");
const REPO_ROOT = resolve(__dirname, "..");

function walkCss(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walkCss(full));
    else if (entry.endsWith(".css")) out.push(full);
  }
  return out;
}

/** Strip /* ... *\/ comments. Preserves newline layout. */
function stripComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

/**
 * Parse a CSS string into a flat list of leaf rule descriptors.
 * Each rule = { selector, body, inReduce }. Skips @keyframes inner rules.
 */
function parseRules(css, parentInReduce = false) {
  const rules = [];
  let i = 0;

  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i += 1;
    if (i >= css.length) break;

    if (css[i] === "}") {
      i += 1;
      continue;
    }

    let j = i;
    while (j < css.length && css[j] !== "{" && css[j] !== ";" && css[j] !== "}") j += 1;
    if (j >= css.length) break;

    if (css[j] === ";") {
      i = j + 1;
      continue;
    }
    if (css[j] === "}") {
      i = j + 1;
      continue;
    }

    const header = css.slice(i, j).trim();
    const open = j;
    let depth = 1;
    let k = open + 1;
    while (k < css.length && depth > 0) {
      if (css[k] === "{") depth += 1;
      else if (css[k] === "}") depth -= 1;
      k += 1;
    }
    const body = css.slice(open + 1, k - 1);

    if (/^@keyframes\b/.test(header)) {
      // Skip — keyframe inner rules are not consumer selectors.
    } else if (/^@media\b/.test(header)) {
      const isReduce = /prefers-reduced-motion\s*:\s*reduce/.test(header);
      const inner = parseRules(body, parentInReduce || isReduce);
      for (const r of inner) rules.push(r);
    } else if (/^@(supports|layer)\b/.test(header)) {
      const inner = parseRules(body, parentInReduce);
      for (const r of inner) rules.push(r);
    } else if (header.startsWith("@")) {
      // Other at-rules — ignore.
    } else {
      rules.push({ selector: header, body, inReduce: parentInReduce });
    }

    i = k;
  }

  return rules;
}

function findKeyframeNames(css) {
  const re = /@keyframes\s+([A-Za-z_][\w-]*)/g;
  const names = new Set();
  let m;
  while ((m = re.exec(css))) names.add(m[1]);
  return names;
}

function keyframesReferencedByBody(body, allNames) {
  const out = new Set();
  const decls = body.match(/animation(?:-name)?\s*:[^;]+/gi) || [];
  for (const decl of decls) {
    for (const name of allNames) {
      const re = new RegExp(`\\b${name}\\b`);
      if (re.test(decl)) out.add(name);
    }
  }
  return out;
}

function disablesAnimation(body) {
  return (
    /animation\s*:\s*(?:none|0s|inherit|unset|initial)\b/i.test(body) ||
    /animation-name\s*:\s*none/i.test(body) ||
    /animation-duration\s*:\s*0s\b/i.test(body)
  );
}

function splitSelectors(sel) {
  return sel
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isWildcardSelector(s) {
  return /^\*(\s*::?[\w-]+)?$/.test(s);
}

let totalKeyframes = 0;
let totalGuarded = 0;
const failures = [];

for (const file of walkCss(STYLES_DIR)) {
  const raw = readFileSync(file, "utf8");
  const css = stripComments(raw);
  const allNames = findKeyframeNames(css);
  if (allNames.size === 0) continue;

  const rules = parseRules(css);

  const consumersByKeyframe = new Map();
  for (const name of allNames) consumersByKeyframe.set(name, []);
  for (const rule of rules) {
    if (rule.inReduce) continue;
    const used = keyframesReferencedByBody(rule.body, allNames);
    for (const name of used) consumersByKeyframe.get(name).push(rule);
  }

  const reduceWildcardCovers = new Set();
  const reduceNamedSelectors = new Set();
  const reduceNamedKeyframes = new Set();

  for (const rule of rules) {
    if (!rule.inReduce) continue;
    if (!disablesAnimation(rule.body)) continue;
    const sels = splitSelectors(rule.selector);
    for (const sel of sels) {
      reduceNamedSelectors.add(sel);
      if (isWildcardSelector(sel)) {
        for (const name of allNames) reduceWildcardCovers.add(name);
      }
    }
    const namedHere = keyframesReferencedByBody(rule.body, allNames);
    for (const name of namedHere) reduceNamedKeyframes.add(name);
  }

  for (const name of allNames) {
    totalKeyframes += 1;
    const consumers = consumersByKeyframe.get(name);

    if (consumers.length === 0) {
      // Defined-but-unused keyframe is harmless.
      totalGuarded += 1;
      continue;
    }

    if (reduceWildcardCovers.has(name) || reduceNamedKeyframes.has(name)) {
      totalGuarded += 1;
      continue;
    }

    let allCovered = true;
    const uncovered = [];
    for (const consumer of consumers) {
      const sels = splitSelectors(consumer.selector);
      for (const sel of sels) {
        if (!reduceNamedSelectors.has(sel)) {
          allCovered = false;
          uncovered.push(sel);
        }
      }
    }

    if (allCovered) {
      totalGuarded += 1;
    } else {
      failures.push({
        file: file.replace(`${REPO_ROOT}/`, ""),
        keyframe: name,
        uncovered: Array.from(new Set(uncovered)).slice(0, 5),
      });
    }
  }
}

console.log(
  `reduced-motion audit: ${totalGuarded}/${totalKeyframes} keyframes have full guard coverage.`
);

if (failures.length > 0) {
  console.error("\nKeyframes with unguarded consumers under prefers-reduced-motion: reduce:");
  for (const f of failures) {
    console.error(`  - ${f.keyframe}  (${f.file})`);
    for (const sel of f.uncovered) console.error(`      consumer not covered: ${sel}`);
  }
  console.error(
    "\nFix: inside a `@media (prefers-reduced-motion: reduce)` block, add the\n     listed selectors with `animation: none` (or set `animation-duration: 0s`).\n     LAW_ANIMATION_AND_ATMOSPHERE.md §3 — mandatory.\n"
  );
  process.exit(1);
}

process.exit(0);
