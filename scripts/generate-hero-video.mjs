import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(
  "C:/Users/Tomori Nao/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/package.json"
);
const { chromium } = require("playwright");

const chromePath = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "assets");
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
  args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
});

const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
await page.goto("about:blank");

const base64 = await page.evaluate(async () => {
  document.body.style.margin = "0";
  document.body.style.background = "#09090b";
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 540;
  canvas.style.width = "960px";
  canvas.style.height = "540px";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: 1_800_000,
  });
  const chunks = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  const stopped = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  const particles = Array.from({ length: 76 }, () => ({
    x: Math.random(),
    y: Math.random(),
    v: 0.00002 + Math.random() * 0.00009,
    r: 0.6 + Math.random() * 1.7,
  }));

  recorder.start(250);
  const start = performance.now();

  await new Promise((resolve) => {
    const draw = (now) => {
      const t = now - start;
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, w, h);

      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#1a191b");
      sky.addColorStop(0.55, "#101012");
      sky.addColorStop(1, "#08080a");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      const pulse = 0.78 + Math.sin(t / 1300) * 0.16;
      const glowX = w * (0.68 + 0.035 * Math.sin(t / 2400));
      const glowY = h * (0.38 + 0.02 * Math.cos(t / 1800));
      const glow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, w * 0.56);
      glow.addColorStop(0, `rgba(214,166,106,${0.16 * pulse})`);
      glow.addColorStop(0.42, `rgba(214,166,106,${0.055 * pulse})`);
      glow.addColorStop(1, "rgba(214,166,106,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 7; i += 1) {
        const x1 = 70 + i * 135 + Math.sin(t / 900 + i * 1.4) * 22;
        const x2 = 110 + i * 120 + Math.cos(t / 1250 + i * 0.9) * 34;
        const alpha = 0.045 + 0.045 * Math.sin(t / 560 + i * 1.25);
        const warm = i % 2 === 0;
        ctx.fillStyle = warm
          ? `rgba(222,176,116,${alpha})`
          : `rgba(150,160,160,${alpha * 0.72})`;
        ctx.beginPath();
        ctx.moveTo(x1, 0);
        ctx.lineTo(x1 + 56, 0);
        ctx.lineTo(x2 + 86, h);
        ctx.lineTo(x2 - 86, h);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      ctx.fillStyle = "rgba(238,232,214,0.22)";
      for (const p of particles) {
        p.y = (p.y + p.v * 33) % 1;
        const px = (p.x + Math.sin(t / 2600 + p.y * 9) * 0.012) * w;
        const py = p.y * h;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      const lineY = h * (0.62 + 0.2 * Math.sin(t / 3100));
      ctx.fillStyle = "rgba(242,239,231,0.13)";
      ctx.fillRect(0, lineY, w, 1);

      for (let y = 0; y < h; y += 4) {
        ctx.fillStyle = "rgba(0,0,0,0.12)";
        ctx.fillRect(0, y, w, 1);
      }
      ctx.fillStyle = "rgba(255,255,255,0.028)";
      for (let i = 0; i < 130; i += 1) {
        ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
      }

      if (t < 7000) {
        requestAnimationFrame(draw);
      } else {
        recorder.stop();
        resolve();
      }
    };
    requestAnimationFrame(draw);
  });

  await stopped;
  const blob = new Blob(chunks, { type: mime });
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
  }
  return btoa(binary);
});

writeFileSync(join(outDir, "hero-loop.webm"), Buffer.from(base64, "base64"));
console.log("hero-loop.webm written to", join(outDir, "hero-loop.webm"));
await browser.close();
