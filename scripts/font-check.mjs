// 验证：作品区 Galaxy 星空渲染 + 画布尺寸 + 鼠标交互挂载
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
  const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
  if (res.exceptionDetails) throw new Error(JSON.stringify(res.exceptionDetails));
  return res.result.value;
};
const shot = async (name) => {
  const s = await send("Page.captureScreenshot", { format: "png" });
  const { writeFileSync } = await import("node:fs");
  writeFileSync(`shots/${name}.png`, Buffer.from(s.data, "base64"));
  console.log("saved", name);
};

await send("Page.navigate", { url: "http://127.0.0.1:5173" });
for (let i = 0; i < 300; i++) {
  if (await evaluate(`!!document.getElementById('work')`)) break;
  await sleep(60);
}
for (let i = 0; i < 300; i++) {
  if (await evaluate(`!document.querySelector('[data-test="overlay"]')`)) break;
  await sleep(60);
}
// 滚到作品区
await evaluate(`window.scrollTo(0, document.getElementById('work').offsetTop); true`);
await sleep(1500);
console.log(
  "galaxy:", await evaluate(`(() => {
    const g = document.querySelector('#work .galaxy-container');
    const c = g?.querySelector('canvas');
    const cs = c ? getComputedStyle(c) : null;
    return JSON.stringify({
      container: !!g,
      canvas: c ? [c.width, c.height] : null,
      canvasCss: cs ? [cs.width, cs.height] : null,
      hasGL: c ? !!(c.getContext('webgl2') || c.getContext('webgl')) : false,
      listeners: g ? true : false,
    });
  })()`)
);
await shot("96-works-galaxy");
ws.close();
