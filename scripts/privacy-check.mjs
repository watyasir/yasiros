#!/usr/bin/env node
/*
  Pre-commit privacy check. The repo is public, so this blocks a commit that adds:
    - an email address (example.com addresses are fine)
    - a phone number
    - a long account or card number
    - any .env file (only .env.example is allowed)
  It only looks at lines being added in this commit. With --all (the CI checks on GitHub) it
  scans every tracked file instead.

  False alarm? Put "privacy-check: allow" on that line, or (last resort)
  commit with --no-verify after checking by eye.
*/
import { execFileSync } from "node:child_process";

const git = (...args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

const ALLOW_MARKER = "privacy-check: allow";
// Files where long digit runs are normal (hashes) and never hold personal data.
const SKIP_FILES = [/(^|\/)package-lock\.json$/, /\.(png|jpe?g|gif|webp|ico|woff2?|ttf|otf|pdf)$/i];

const rules = [
  {
    name: "an email address",
    regex: /[A-Za-z0-9._%+-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}/g,
    allow: (m) => /@(.+\.)?example\.(com|org|net)$/i.test(m),
  },
  {
    // +91 98765 43210, 98765-43210, 9876543210, +1 415 555 0100, (020) 2345 6789 (privacy-check: allow)
    name: "a phone number",
    regex: /(?<![\w.])(?:\+\d{1,3}[\s-]?)?(?:\(\d{2,5}\)[\s-]?)?(?:[6-9]\d{4}[\s-]?\d{5}|\d{3,5}[\s-]\d{3,4}[\s-]\d{4})(?![\w.])/g,
  },
  {
    // Card numbers in groups (4111 1111 1111 1111) and any run of 11+ digits (account numbers). (privacy-check: allow)
    name: "a long account or card number",
    regex: /(?<![\w.])(?:\d{4}[\s-]){3}\d{1,7}(?![\w.])|(?<![\w.])\d{11,}(?![\w.])/g,
  },
];

const problems = [];
const all = process.argv.includes("--all");

/** Checks one line of one file against every rule. */
function check(file, here, line) {
  if (SKIP_FILES.some((r) => r.test(file)) || line.includes(ALLOW_MARKER)) return;
  for (const rule of rules) {
    for (const m of line.matchAll(rule.regex)) {
      if (rule.allow?.(m[0])) continue;
      problems.push(`${file}:${here}: looks like ${rule.name}: "${m[0].trim()}"`);
    }
  }
}

// 1. .env files
const staged = (all ? git("ls-files", "-z") : git("diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z")).split("\0").filter(Boolean);
for (const file of staged) {
  const base = file.split("/").pop();
  if (/^\.env(\..+)?$/.test(base) && base !== ".env.example") {
    problems.push(`${file}: .env files hold secrets and must never be committed`);
  }
}

// 2. Added lines (or, with --all, every line of every tracked text file)
if (all) {
  for (const f of staged) {
    if (SKIP_FILES.some((r) => r.test(f))) continue;
    git("show", `HEAD:${f}`)
      .split("\n")
      .forEach((line, i) => check(f, i + 1, line));
  }
}
const diff = all ? "" : git("diff", "--cached", "-U0", "--no-color", "--diff-filter=ACMR");
let file = null;
let lineNo = 0;
for (const raw of diff.split("\n")) {
  if (raw.startsWith("+++ ")) {
    file = raw.startsWith("+++ b/") ? raw.slice(6) : null;
    continue;
  }
  const hunk = raw.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
  if (hunk) {
    lineNo = Number(hunk[1]);
    continue;
  }
  if (!file || !raw.startsWith("+")) continue;
  check(file, lineNo++, raw.slice(1));
}

if (problems.length) {
  console.error(`\n✋ Privacy check ${all ? "found these in the repo" : "blocked this commit"}. The repo is public.\n`);
  for (const p of problems) console.error("  - " + p);
  console.error(
    `\nMove real data to Supabase or .env.local. If it's a false alarm, add "${ALLOW_MARKER}" to that line.\n`,
  );
  process.exit(1);
}
