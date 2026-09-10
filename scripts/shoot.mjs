// CDP 截图验证脚本：驱动已启动的无头 Chrome (remote-debugging-port=9222)
// 用法: node scripts/shoot.mjs [mobile]
import { writeFileSync, mkdirSync } from "node:fs";

const CDP_PORT = 9222;
const MOBILE = process.argv.includes("mobile");
const OUT = "shots";
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTarget() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === "page");
      if (page) return page;
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  throw new Error("no CDP target found");
}

const target = await getTarget();
const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const msgId = ++id;
    pending.set(msgId, { resolve, reject });
    ws.send(JSON.stringify({ id: msgId, method, params }));
  });

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
    else p.resolve(msg.result);
  }
};

await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

await send("Page.enable");
await send("Runtime.enable");

if (MOBILE) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
} else {
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
}

const evaluate = async (expr) => {
  const res = await send("Runtime.evaluate", {
    expression: expr,
    returnByValue: true,
    awaitPromise: true,
  });
  if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
  return res.result.value;
};

const shot = async (name) => {
  const res = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(res.data, "base64"));
  console.log(`saved ${name}`);
};

await send("Page.navigate", { url: "http://127.0.0.1:5173" });
await sleep(1500);
await shot(`01-loading-${MOBILE ? "m" : "d"}`);

await sleep(5000); // 等 loading 结束 + hero 入场动画
await shot(`02-hero-${MOBILE ? "m" : "d"}`);

if (MOBILE) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
}
const offs = await evaluate(`({
  work: document.getElementById('work')?.offsetTop ?? 0,
  journal: document.getElementById('journal')?.offsetTop ?? 0,
  explorations: document.getElementById('explorations')?.offsetTop ?? 0,
  stats: document.getElementById('stats')?.offsetTop ?? 0,
  contact: document.getElementById('contact')?.offsetTop ?? 0,
  height: document.body.scrollHeight,
})`);
console.log("offsets:", JSON.stringify(offs));

const scrollTo = async (y) => {
  await evaluate(`window.scrollTo(0, ${y}); true`);
  await sleep(1600);
};

if (!MOBILE) {
  await scrollTo(offs.work - 80);
  await shot("03-work");
  await scrollTo(offs.journal - 80);
  await shot("04-journal");
  await scrollTo(offs.explorations + 300);
  await shot("05-explorations-mid");
  await scrollTo(offs.explorations + 1200);
  await shot("06-explorations-late");
  await scrollTo(offs.stats - 120);
  await shot("07-stats");
  await send("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await scrollTo(offs.height);
  await shot("08-contact");
} else {
  await scrollTo(offs.work - 60);
  await shot("03-work-m");
  await scrollTo(offs.explorations + 200);
  await shot("05-explorations-m");
  await scrollTo(offs.height);
  await shot("08-contact-m");
}

console.log("done", JSON.stringify({ height: offs.height }));
ws.close();
