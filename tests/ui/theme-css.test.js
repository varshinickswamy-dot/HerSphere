import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const styles = readFileSync("base.css", "utf8");
const theme = readFileSync("helpers/themeMode.tsx", "utf8");

test("shared design tokens define readable light and dark palettes", () => {
  for (const token of ["--background:", "--foreground:", "--surface:", "--primary:", "--accent:", "--border:"]) {
    assert.ok(styles.includes(token), `Missing shared design token: ${token}`);
  }
  assert.match(styles, /html\.light body/);
  assert.match(styles, /html\.dark body/);
  assert.match(styles, /color-scheme:\s*light/);
  assert.match(styles, /color-scheme:\s*dark/);
});

test("theme state is applied to root and body and persists user preference", () => {
  assert.match(theme, /document\.documentElement\.classList\.toggle\("light"/);
  assert.match(theme, /document\.body\.classList\.toggle\("light"/);
  assert.match(theme, /document\.documentElement\.style\.colorScheme/);
  assert.match(theme, /localStorage\.setItem\("hersphere-theme","light"\)/);
  assert.match(theme, /localStorage\.setItem\("hersphere-theme","dark"\)/);
});
