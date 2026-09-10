// 中英翻译切换功能验证：驱动系统 Chrome（Playwright 来自 codex-runtime 缓存）
// 用法: node scripts/verify-i18n.mjs
// 前提: http://127.0.0.1:5173 dev server 运行中
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const require = createRequire(
  "C:/Users/Tomori Nao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json"
);
const { chromium } = require("playwright");

const BASE = "http://127.0.0.1:5173/";
const OUT = "tmp/verify-i18n";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--no-sandbox"],
});

const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 1,
});

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(e.message));

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });

const toggleBtn = () => page.locator('header nav button[aria-label]').first();
const toggleSpan = () =>
  page.locator('header nav button[aria-label] span').first();

const state = async () =>
  page.evaluate(() => {
    const span = document.querySelector(
      'header nav button[aria-label] span'
    );
    const cs = span ? getComputedStyle(span) : null;
    return {
      htmlLang: document.documentElement.lang,
      title: document.title,
      toggleText: span ? span.textContent : null,
      toggleFontFamily: cs ? cs.fontFamily : null,
      toggleFontWeight: cs ? cs.fontWeight : null,
      navText: document.querySelector("header nav")?.innerText.replace(/\s+/g, " ").trim(),
      heroText: document.getElementById("home")?.innerText.replace(/\s+/g, " "),
    };
  });

const report = { errors: [] };

await page.goto(BASE, { waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
await page.waitForTimeout(900);
// 加载页截图（应始终为 HELLO，不受语言影响）
await shot("01-loading-en");

// 等待加载页退场
await page.waitForSelector(".rv-exit", { state: "detached", timeout: 15000 }).catch(() => {});
await page.waitForTimeout(1200);
report.en = await state();
report.en.fontDeYiHeiLoaded = await page.evaluate(async () => {
  try {
    return await document.fonts.load('15px "DeYiHei"', "中").then((f) => f.length > 0);
  } catch {
    return false;
  }
});
await shot("02-hero-en");

// 点击切换 → 中文
await toggleBtn().click();
await page.waitForTimeout(500);
report.zh = await state();
report.zh.fontYaHeiLoaded = await page.evaluate(async () => {
  try {
    return await document.fonts.load('700 15px "Microsoft YaHei"', "EN").then((f) => f.length > 0);
  } catch {
    return false;
  }
});
await shot("03-hero-zh");

// 各板块中文状态
const offs = await page.evaluate(() => ({
  work: document.getElementById("work")?.offsetTop ?? 0,
  journal: document.getElementById("journal")?.offsetTop ?? 0,
  explorations: document.getElementById("explorations")?.offsetTop ?? 0,
  stats: document.getElementById("stats")?.offsetTop ?? 0,
  contact: document.getElementById("contact")?.offsetTop ?? 0,
}));
await page.evaluate((y) => window.scrollTo(0, y), offs.work - 60);
await page.waitForTimeout(1200);
report.workText = await page.locator("#work").innerText();
await shot("04-work-zh");
await page.evaluate((y) => window.scrollTo(0, y), offs.journal - 60);
await page.waitForTimeout(1000);
report.journalText = await page.locator("#journal").innerText();
await shot("05-journal-zh");
await page.evaluate((y) => window.scrollTo(0, y), offs.explorations + 200);
await page.waitForTimeout(1200);
report.explorationsText = await page.locator("#explorations").innerText();
await shot("06-explorations-zh");
await page.evaluate((y) => window.scrollTo(0, y), offs.stats - 120);
await page.waitForTimeout(1000);
report.statsText = await page.locator("#stats").innerText();
await shot("07-stats-zh");
await page.evaluate((y) => window.scrollTo(0, 999999));
await page.waitForTimeout(1200);
report.contactText = await page.locator("#contact").innerText();
await shot("08-contact-zh");

// 刷新：中文持久化 + 加载页仍为 HELLO
await page.reload({ waitUntil: "networkidle", timeout: 45000 }).catch(() => {});
await page.waitForTimeout(900);
report.reloadPersist = await page.evaluate(() => ({
  lang: document.documentElement.lang,
  loadingHello: !!document.querySelector(".rv-hello"),
}));
await shot("09-loading-zh");
await page.waitForSelector(".rv-exit", { state: "detached", timeout: 15000 }).catch(() => {});
await page.waitForTimeout(600);

// 切回英文并断言
await toggleBtn().click();
await page.waitForTimeout(400);
report.backToEn = await state();
await shot("10-hero-back-en");

report.errors = errors;
console.log(JSON.stringify(report, null, 2));
await browser.close();
