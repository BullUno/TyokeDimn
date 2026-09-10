import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const require = createRequire(
  "C:/Users/Tomori Nao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json"
);
const { chromium } = require("playwright");

const base = "http://127.0.0.1:5173/";
const outDir = "tmp/verify";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--no-sandbox"],
});

const page = await browser.newPage({
  viewport: { width: 1600, height: 1000 },
  deviceScaleFactor: 1,
});

const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(err.message));

await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(1200);

const report = await page.evaluate(() => {
  const rect = (selector) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      top: Math.round(r.top),
      bottom: Math.round(r.bottom),
      left: Math.round(r.left),
      right: Math.round(r.right),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
  };
  const images = [...document.images].map((img) => ({
    src: img.getAttribute("src"),
    naturalWidth: img.naturalWidth,
    loaded: img.complete && img.naturalWidth > 0,
  }));
  const video = document.querySelector("video");
  return {
    viewport: { width: innerWidth, height: innerHeight },
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    bodyText: document.body.innerText.length,
    images,
    video: video
      ? {
          readyState: video.readyState,
          error: video.error ? video.error.code : null,
          currentSrc: video.currentSrc,
        }
      : null,
    rects: {
      hero: rect(".hero"),
      navbar: rect(".navbar"),
      heroTitle: rect(".hero-title"),
      heroContact: rect(".hero-contact"),
      about: rect(".about"),
      projects: rect(".projects"),
      firstProject: rect(".project-card"),
      skills: rect(".skills"),
      contact: rect(".contact"),
      contactTitle: rect(".contact-title"),
    },
  };
});

await page.screenshot({ path: `${outDir}/hero.png` });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.42));
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/about.png` });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/projects.png` });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.82));
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/skills.png` });
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/contact.png` });

await page.setViewportSize({ width: 1440, height: 900 });
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({ path: `${outDir}/hero-1440.png` });

console.log(JSON.stringify({ report, consoleErrors }, null, 2));
await browser.close();
