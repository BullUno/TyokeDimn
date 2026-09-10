// 交互测试：点击作品卡打开 Lightbox，Esc 关闭；点击 See Works 平滑滚动
const CDP_PORT = 9222;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getTarget() {
  const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
  const targets = await res.json();
  return targets.find((t) => t.type === "page");
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
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
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
  const { writeFileSync } = await import("node:fs");
  writeFileSync(`shots/${name}.png`, Buffer.from(res.data, "base64"));
  console.log("saved", name);
};

await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});
await send("Page.navigate", { url: "http://127.0.0.1:5173" });
await sleep(6000); // loading + hero entrance

// 1) 点击 See Works -> 平滑滚动到 work 区
await evaluate(`document.querySelectorAll('button')[0] && (() => {
  const btn = [...document.querySelectorAll('button')].find(b => b.textContent.includes('See Works'));
  btn.click(); return true;
})()`);
await sleep(1800);
console.log("scrollY after See Works:", await evaluate("Math.round(scrollY)"));

// 2) 点击第一张作品卡 -> Lightbox
const clicked = await evaluate(`(() => {
  const card = document.querySelector('#work button');
  if (!card) return false;
  card.click();
  return true;
})()`);
console.log("card clicked:", clicked);
await sleep(900);
console.log("lightbox open:", await evaluate(`!!document.querySelector('img[alt="Preview"]')`));
await shot("09-lightbox");

// 3) Esc 关闭
await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
await sleep(700);
console.log("lightbox closed:", await evaluate(`!document.querySelector('img[alt="Preview"]')`));

// 4) 导航 Home 回顶部
await evaluate(`[...document.querySelectorAll('nav button')].find(b => b.textContent.trim() === 'Home').click(); true`);
await sleep(1600);
console.log("scrollY after Home:", await evaluate("Math.round(scrollY)"));
ws.close();
