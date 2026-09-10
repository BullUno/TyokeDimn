// 测量：点击头部「作品」后的落点 + 作品区滚动指示器相对视口的位置（对照首页 hero）
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const require = createRequire(
  "C:/Users/Tomori Nao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json"
);
const { chromium } = require("playwright");

const OUT = "tmp/verify-i18n";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--no-sandbox"],
});
const ctx = await browser.newContext({ viewport: { width: 2560, height: 1275 } });
await ctx.addInitScript(() => {
  try { localStorage.setItem("td-lang", "zh"); } catch {}
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

const rect = async (sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top), bottom: Math.round(r.bottom),
      left: Math.round(r.left), right: Math.round(r.right),
      w: Math.round(r.width), h: Math.round(r.height),
    };
  }, sel);

const cueRect = () =>
  page.evaluate(() => {
    const cue = [...document.querySelectorAll("#work .pointer-events-none.fixed.bottom-6")][0];
    if (!cue) return null;
    const r = cue.getBoundingClientRect();
    return {
      top: Math.round(r.top), bottom: Math.round(r.bottom),
      left: Math.round(r.left), right: Math.round(r.right),
      opacity: getComputedStyle(cue).opacity,
      position: getComputedStyle(cue).position,
    };
  });

await page.goto("http://127.0.0.1:5173/", { waitUntil: "domcontentloaded" });
await page.waitForSelector(".rv-exit", { state: "detached", timeout: 20000 }).catch(() => {});
await page.waitForTimeout(1200);

const report = { viewport: { w: 2560, h: 1275 } };
report.heroCueRect = await rect("#home .absolute.bottom-6");
report.worksCueAtHeroTop = await cueRect(); // 首页时作品指示器应隐藏

// 点击头部栏「作品」
await page.locator('header nav button:has-text("作品")').click();
await page.waitForTimeout(1800);

report.afterClick = await page.evaluate(() => {
  const work = document.getElementById("work");
  return {
    scrollY: Math.round(scrollY),
    workTopInViewport: Math.round(work.getBoundingClientRect().top),
  };
});
report.cueAfterClick = await cueRect();
await page.screenshot({ path: `${OUT}/13-works-after.png` });

// 深入作品区滚动 400px：指示器应保持同一视口位置
await page.evaluate(() => window.scrollTo(0, scrollY + 400));
await page.waitForTimeout(600);
report.cueAfterScroll400 = await cueRect();

// 滚到日志区：指示器应消失
await page.evaluate(() => {
  const j = document.getElementById("journal");
  window.scrollTo(0, j.offsetTop);
});
await page.waitForTimeout(600);
report.cueAtJournal = await cueRect();

report.errors = errors;
console.log(JSON.stringify(report, null, 2));
await browser.close();
