// 移动端布局探针
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

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 2,
  mobile: true,
});
await send("Page.navigate", { url: "http://127.0.0.1:5173" });
await sleep(3500);

const out = await evaluate(`(() => {
  const s = document.getElementById('explorations');
  const children = [...s.children].map((el, i) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { i, tag: el.tagName, cls: el.className.slice(0, 70), top: Math.round(r.top + scrollY), h: Math.round(r.height), pos: cs.position, z: cs.zIndex };
  });
  return { vw: innerWidth, vh: innerHeight, h: document.body.scrollHeight, section: Math.round(s.getBoundingClientRect().top + scrollY), children };
})()`);
console.log(JSON.stringify(out, null, 1));
ws.close();
