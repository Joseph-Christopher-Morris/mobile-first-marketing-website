#!/usr/bin/env node

// scripts/check-lighthouse.mjs
// Usage: node scripts/check-lighthouse.mjs reports/*.json
// Fails with nonzero exit code if any page exceeds thresholds.

import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const THRESHOLDS = {
  LCP_MS: Number(process.env.LCP_MS || 1800),     // 1.8 s
  CLS: Number(process.env.CLS || 0.10),
  INP_MS: Number(process.env.INP_MS || 200)       // 200 ms
};

let failed = false;
let summaries = [];

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Error: No Lighthouse report files provided');
  console.error('Usage: node scripts/check-lighthouse.mjs reports/*.json');
  process.exit(1);
}

for (const path of args) {
  try {
    const raw = fs.readFileSync(path, "utf8");
    const lhr = JSON.parse(raw);

    const audits = lhr.audits || {};
    const url = lhr.requestedUrl || path;

    // Numeric values are in milliseconds for LCP and INP
    const lcp = audits["largest-contentful-paint"]?.numericValue;
    const cls = audits["cumulative-layout-shift"]?.numericValue;
    // INP audit id in Lighthouse 10+
    const inp = audits["interaction-to-next-paint"]?.numericValue;

    const lcpOk = typeof lcp === "number" ? lcp < THRESHOLDS.LCP_MS : true;
    const clsOk = typeof cls === "number" ? cls < THRESHOLDS.CLS : true;
    // If INP missing, do not fail. Only enforce when present.
    const inpOk = typeof inp === "number" ? inp < THRESHOLDS.INP_MS : true;

    const line = [
      url,
      `LCP: ${typeof lcp === "number" ? (lcp / 1000).toFixed(2) + " s" : "n/a"}`,
      `CLS: ${typeof cls === "number" ? cls.toFixed(3) : "n/a"}`,
      `INP: ${typeof inp === "number" ? inp.toFixed(0) + " ms" : "n/a"}`,
      lcpOk && clsOk && inpOk ? "✅ PASS" : "❌ FAIL"
    ].join(" | ");

    summaries.push(line);

    if (!lcpOk || !clsOk || !inpOk) failed = true;
  } catch (err) {
    failed = true;
    summaries.push(`${path} | ❌ ERROR parsing report: ${err.message}`);
  }
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📊 Lighthouse Performance Budget Summary");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`\n🎯 Thresholds: LCP < ${THRESHOLDS.LCP_MS}ms | CLS < ${THRESHOLDS.CLS} | INP < ${THRESHOLDS.INP_MS}ms\n`);

for (const s of summaries) {
  console.log(s);
}

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

if (failed) {
  console.error("\n❌ BUILD FAILED: One or more pages exceeded performance thresholds.");
  console.error("\n📋 Action Required:");
  console.error("   1. Review failed pages above");
  console.error("   2. Optimize images, fonts, and scripts");
  console.error("   3. Check for layout shifts (CLS)");
  console.error("   4. Reduce JavaScript execution time (INP)");
  console.error("   5. Re-run Lighthouse after fixes\n");
  process.exit(1);
} else {
  console.log("\n✅ BUILD PASSED: All pages meet performance budgets!");
  console.log("   Great work maintaining fast, user-friendly pages.\n");
}
