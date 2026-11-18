import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const toggleStyles = readFileSync("components/GlobalThemeToggle.module.css", "utf8");
const themeHelper = readFileSync("helpers/themeMode.tsx", "utf8");

test("light theme overrides public landing sections and keeps text readable", () => {
  for (const selector of [
    '[class*="steps"]',
    '[class*="callout"]',
    '[class*="valueStrip"]',
    '[class*="grid"] article',
    '[class*="stepGrid"] > div',
    '[class*="visualTag"]',
  ]) {
    assert.ok(toggleStyles.includes(selector), `Missing light-theme selector: ${selector}`);
  }
  assert.match(toggleStyles, /background:\s*var\(--surface\)\s*!important/);
  assert.match(toggleStyles, /color:\s*var\(--foreground\)\s*!important/);
});

test("theme changes are applied to both document root and body", () => {
  assert.match(themeHelper, /document\.documentElement\.classList\.toggle\("light"/);
  assert.match(themeHelper, /document\.body\.classList\.toggle\("light"/);
  assert.match(themeHelper, /document\.documentElement\.style\.colorScheme/);
  assert.match(themeHelper, /localStorage\.setItem\("hersphere-theme","light"\)/);
  assert.match(themeHelper, /localStorage\.setItem\("hersphere-theme","dark"\)/);
});
