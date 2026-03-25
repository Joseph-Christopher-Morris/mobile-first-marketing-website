#!/usr/bin/env node

/**
 * Standalone production asset verification.
 * Run after deployment to confirm all required photography/proof assets
 * are reachable on the live site.
 *
 * Usage: node scripts/verify-production-assets.js
 */

const fs = require('fs');
const path = require('path');

const SITE_ORIGIN = process.env.SITE_ORIGIN
  || 'https://d15sc9fc739ev2.cloudfront.net';
const MANIFEST_PATH = path.join(
  __dirname, '..', 'config', 'required-assets.json'
);

function flattenManifest(obj) {
  const assets = new Set();
  function walk(v) {
    if (typeof v === 'string') { assets.add(v); return; }
    if (Array.isArray(v)) { v.forEach(walk); return; }
    if (v && typeof v === 'object') {
      for (const [k, val] of Object.entries(v)) {
        if (k === '_comment' || k === 'protectedPrefixes') continue;
        walk(val);
      }
    }
  }
  walk(obj);
  return [...assets];
}


async function main() {
  console.log('🔍 Production Asset Verification');
  console.log(`   Site: ${SITE_ORIGIN}`);
  console.log('');

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const assets = flattenManifest(manifest);

  let passed = 0;
  let failed = 0;

  for (const asset of assets) {
    const url = `${SITE_ORIGIN}/${asset}`;
    try {
      const resp = await fetch(url, { method: 'HEAD' });
      if (resp.status === 200) {
        console.log(`   ✅ ${asset}`);
        passed++;
      } else {
        console.log(`   ❌ ${asset} → HTTP ${resp.status}`);
        failed++;
      }
    } catch (err) {
      console.log(`   ❌ ${asset} → ${err.message}`);
      failed++;
    }
  }

  console.log('');
  console.log(
    `📊 Results: ${passed} passed, ${failed} failed out of ${assets.length}`
  );

  // Smoke test photography page
  console.log('');
  console.log('🧪 Photography page smoke test...');
  try {
    const resp = await fetch(
      `${SITE_ORIGIN}/services/photography/`
    );
    const html = await resp.text();

    const checks = [
      { name: 'Hero image ref',
        test: html.includes('photography-hero.webp') },
      { name: 'Best-selling image ref',
        test: html.includes('photography-sample-4.webp') },
      { name: 'Supporting image ref',
        test: html.includes('photography-sample-1.webp') },
      { name: 'Authority proof ref',
        test: html.includes('editorial-proof-bbc-forbes-times.webp') },
      { name: 'GBP currency',
        test: html.includes('£') && !html.includes('$1,166') },
    ];

    for (const c of checks) {
      console.log(`   ${c.test ? '✅' : '❌'} ${c.name}`);
      if (!c.test) failed++;
    }
  } catch (err) {
    console.log(
      `   ❌ Could not fetch photography page: ${err.message}`
    );
    failed++;
  }

  console.log('');
  if (failed > 0) {
    console.log(`❌ Verification FAILED — ${failed} issue(s) found`);
    process.exit(1);
  } else {
    console.log('✅ All production assets verified successfully');
    process.exit(0);
  }
}

main();
