/**
 * dev-local-browser.mjs
 *
 * Boots the Vite dev server pointed at the local Docker Supabase stack.
 * Auto-discovers the local ANON_KEY and API URL via `supabase status -o env`
 * so audit sessions don't need to copy/paste keys.
 *
 * Direct connection — no proxy. The dev-server CSP in vite.config.ts allows
 * http://127.0.0.1:54321 and http://localhost:54321 explicitly (dev only).
 *
 * Usage:
 *   npm run dev:local-browser
 *
 * Override (rarely needed):
 *   BIDONDENT_LOCAL_SUPABASE_URL=http://127.0.0.1:54321 npm run dev:local-browser
 */
import { spawn, spawnSync } from "node:child_process";

const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function parseEnvLines(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((vars, line) => {
      const separatorIndex = line.indexOf("=");
      if (separatorIndex === -1) {
        return vars;
      }
      const key = line.slice(0, separatorIndex);
      const value = line.slice(separatorIndex + 1);
      vars[key] = value;
      return vars;
    }, {});
}

function resolveLocalSupabaseEnv() {
  const result = spawnSync(npxCommand, ["supabase", "status", "-o", "env"], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
  });

  if (result.status !== 0) {
    const detail = (
      result.stderr ||
      result.stdout ||
      "Unable to read local Supabase status"
    ).trim();
    throw new Error(
      `Failed to resolve local Supabase env: ${detail}\n` +
        `Is the local stack running? Start it with: supabase start`
    );
  }

  const vars = parseEnvLines(result.stdout || "");

  if (!vars.ANON_KEY) {
    throw new Error("Local Supabase ANON_KEY was not present in `supabase status -o env`.");
  }
  if (!vars.API_URL) {
    throw new Error("Local Supabase API_URL was not present in `supabase status -o env`.");
  }

  return vars;
}

const localSupabaseEnv = resolveLocalSupabaseEnv();
const supabaseUrl = process.env.BIDONDENT_LOCAL_SUPABASE_URL ?? localSupabaseEnv.API_URL;

console.log(`[local-browser] Vite -> local Supabase at ${supabaseUrl}`);

const viteProcess = spawn(npxCommand, ["vite", ...process.argv.slice(2)], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: localSupabaseEnv.ANON_KEY,
  },
});

viteProcess.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
