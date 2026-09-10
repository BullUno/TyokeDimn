import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// ScrollTrigger 仅供 Explorations 的视差钉住场景使用；
// 导航滚动一律使用原生 smooth（无逐帧 JS、无滚动库）
gsap.registerPlugin(ScrollTrigger);

/**
 * 原生平滑滚动到目标区块（无滚动库、无逐帧 JS）
 */
export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * 原生平滑滚动到「关于」区块——目标位置仅在点击时计算一次：
 * - 英文状态：最后一张经历卡片底部对齐视口 95.5%，再整体下移 60px；
 * - 中文状态：About 比视口矮时垂直居中；比视口高时顶部对齐并轻微上移。
 */
export function scrollToAbout() {
  const about = document.getElementById("about");
  const work = document.getElementById("work");
  if (!about) return;

  const vh = window.innerHeight;
  const ah = about.offsetHeight;

  let y: number;
  if (document.documentElement.lang === "en") {
    const pb = parseFloat(getComputedStyle(about).paddingBottom) || 0;
    y = about.offsetTop + ah - pb - vh * 0.955 - 60;
  } else if (ah <= vh) {
    const centerY = about.offsetTop - (vh - ah) / 2;
    const pt = work ? parseInt(getComputedStyle(work).paddingTop, 10) || 0 : 128;
    const eyebrowDocY = (work?.offsetTop ?? 0) + pt;
    const hideLimit = eyebrowDocY - vh - 24;
    y = Math.max(0, Math.min(centerY, hideLimit));
  } else {
    y = about.offsetTop - 56;
  }

  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

export { gsap, ScrollTrigger };
