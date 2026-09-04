// Lightbox（双图叠层交叉淡入 · 根因修复版）：
// ① 切换必等 img.decode()（不支持时 onload 兜底）后才淡入；
// ② 版本号校验：连续快速切换时丢弃过期显示操作，旧回调不覆盖新图；
// ③ 相同 src 已解码（complete && naturalWidth>0）直接显示，不等 load 事件；
// ④ 相邻预取直接写入叠层里的 <img>（不另建 new Image()），显示时图片确已在内存；
// ⑤ 关闭时强制重置两层 src/opacity/过渡状态，打开时从头初始化；
// ⑥ 容器固定尺寸常驻（opacity 控制显隐，无 display:none），有失败/3s 超时兜底占位可继续切换。
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FULL_SIZES, displayOf } from "../data";
import { useLang } from "../i18n";

interface LightboxProps {
  /** 当前路径下的全部图片（全尺寸 URL）；null 时关闭 */
  images: string[] | null;
  /** 打开时定位到第几张 */
  startIndex?: number;
  onClose: () => void;
}

/** 900w 缩略档：开灯箱首图先铺缩略图（秒显、无空白态），再异步换全尺寸 */
const thumbOf = (src: string) => src.replace(/\.webp$/i, "-w900.webp");

/** 参考图箭头图标（白色、透明底，直接使用用户提供的素材） */
function ArrowIcon({ flip = false }: { flip?: boolean }) {
  return (
    <img
      src="/assets/lightbox-arrow.png"
      alt=""
      aria-hidden
      className={`h-7 w-7 object-contain ${flip ? "-scale-x-100" : ""}`}
      draggable={false}
    />
  );
}

/**
 * 等待图片真正可显示（已解码/已加载）：
 * - 相同 src 已缓存（complete && naturalWidth>0）→ 立即返回，不等 load 事件；
 * - 优先 img.decode()（异步，不阻塞主线程）；不支持时用 load/error 事件兜底；
 * - 超时（默认 3s）或失败 → 返回 false（由调用方显示占位，允许继续切换）。
 */
function waitReady(img: HTMLImageElement, ms = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    let isDone = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onLoad = () => settle(true);
    const onError = () => settle(false);
    const settle = (ok: boolean) => {
      if (isDone) return;
      isDone = true;
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
      if (timer) clearTimeout(timer);
      resolve(ok);
    };
    if (img.complete && img.naturalWidth > 0) {
      settle(true);
      return;
    }
    img.addEventListener("load", onLoad, { once: true });
    img.addEventListener("error", onError, { once: true });
    timer = setTimeout(() => settle(false), ms);
  });
}

export default function Lightbox({ images, startIndex = 0, onClose }: LightboxProps) {
  const { d } = useLang();
  // 显示档：全尺寸原图 → 2400w 显示图（显示宽度 ≤1100px，避免加载 300KB-2.4MB 的原图；浏览逻辑不变）
  const disp = useMemo(() => (images ? images.map(displayOf) : null), [images]);
  // 图片容器固定尺寸（打开时按首张图与视口比例定死；窗口宽 = 容器宽 + 左右共 80px）
  const [stage, setStage] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [index, setIndex] = useState(0);
  const [top, setTop] = useState<0 | 1>(0); // 显示层（0/1）；另一层为暂存层
  const [broken, setBroken] = useState(false);
  const imgRefs = [useRef<HTMLImageElement>(null), useRef<HTMLImageElement>(null)];
  const layerSrc = useRef<[string, string]>(["", ""]);
  const busyRef = useRef(false);
  const desiredRef = useRef<number | null>(null);
  const opSeq = useRef(0); // 版本号：丢弃过期显示操作
  // 磨砂 backdrop-filter 仅在淡入动画完成后启用（动画运行中移除）；关闭瞬间即移除
  const [frosted, setFrosted] = useState(false);
  const handleClose = useCallback(() => {
    setFrosted(false);
    onClose();
  }, [onClose]);

  const total = images?.length ?? 0;

  /** 关闭/未打开：强制重置两层 src/opacity/过渡状态 */
  useEffect(() => {
    if (images?.length) return;
    opSeq.current++;
    busyRef.current = false;
    desiredRef.current = null;
    setBroken(false);
    setTop(0);
    setIndex(0);
    setStage({ w: 0, h: 0 });
    imgRefs[0].current?.removeAttribute("src");
    imgRefs[1].current?.removeAttribute("src");
    layerSrc.current = ["", ""];
  }, [images]);

  /** 打开：容器常驻尺寸定死 + 首图缩略图铺上→异步换全尺寸 + 相邻预取写入叠层 <img> */
  useEffect(() => {
    if (!images?.length) return;
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const maxH = Math.min(vh * 0.85, vh - 120);

    let widest = { w: 1, h: 1 };
    for (const s of disp ?? []) {
      const sz = FULL_SIZES[s];
      if (sz && sz.w >= sz.h && sz.w > widest.w) widest = sz;
    }
    const imgW = Math.min(vw - 160, maxH * (widest.w / widest.h));
    const fs = FULL_SIZES[images?.[0] ?? ""];
    const fw = fs?.w ?? 1;
    const fh = fs?.h ?? 1;
    const stageH = Math.min(maxH, (imgW * fh) / fw);
    setStage({ w: Math.round(imgW), h: Math.round(stageH) });

    const i = Math.min(startIndex, (disp?.length ?? 1) - 1);
    const full = disp![i];
    const thumb = thumbOf(full);
    setIndex(i);
    setBroken(false);
    setTop(0);
    layerSrc.current = ["", ""];

    const a = imgRefs[0].current;
    const b = imgRefs[1].current;

    // 层 0：缩略图秒铺 → 等其解码 → 同源替换为显示档；显示档失败则回退原图（保证必显）
    if (a) {
      layerSrc.current[0] = thumb;
      a.src = thumb;
      waitReady(a, 3000).then(() => {
        const a2 = imgRefs[0].current;
        if (!a2 || layerSrc.current[0] !== thumb) return;
        a2.src = full;
        layerSrc.current[0] = full;
        waitReady(a2, 3000).then((ok) => {
          if (ok) return;
          // 显示档（-w2400）缺失/失败：回退原图
          const a3 = imgRefs[0].current;
          const orig = images?.[i];
          if (!a3 || !orig || layerSrc.current[0] !== full) return;
          a3.src = orig;
          layerSrc.current[0] = orig;
          waitReady(a3, 5000).catch(() => {});
        });
      });
    }

    // 层 1：相邻预取（下一张）直接写入叠层 <img> 并后台解码
    const nxt = i + 1;
    if (nxt < (disp?.length ?? 0) && b) {
      layerSrc.current[1] = disp![nxt];
      b.src = disp![nxt];
      b.decode().catch(() => {});
    }

    return () => {
      opSeq.current++;
      busyRef.current = false;
      desiredRef.current = null;
    };
  }, [disp, startIndex]);

  /** 交叉淡入 + 过渡收尾（仅 opacity；版本号校验防过期覆盖） */
  const startFade = useCallback(
    (bot: 0 | 1, oldTop: 0 | 1, ni: number, myOp: number) => {
      if (!disp) return;
      setBroken(false);
      setTop(bot); // 0.2s opacity 交叉淡入（CSS transition）
      window.setTimeout(() => {
        if (myOp !== opSeq.current) return; // 过期操作：丢弃
        const old = imgRefs[oldTop].current;
        if (old) old.removeAttribute("src"); // 旧图移除；暂存层升级为当前层
        layerSrc.current[oldTop] = "";
        setIndex(ni);
        // 预取新的下一张 → 直接写入（刚清空的）旧层 <img>，后台异步解码
        const pre = ni + 1;
        if (pre < (disp?.length ?? 0)) {
          const preImg = imgRefs[oldTop].current;
          if (preImg) {
            layerSrc.current[oldTop] = disp![pre];
            preImg.src = disp![pre];
            preImg.decode().catch(() => {});
          }
        }
        busyRef.current = false;
        if (desiredRef.current !== null && desiredRef.current !== ni) {
          const want = desiredRef.current;
          desiredRef.current = null;
          showRef.current(want); // 淡入期内再次点击 → 立即续播
        } else {
          desiredRef.current = null;
        }
      }, 210);
    },
    [disp]
  );

  /** 核心切换（严格顺序：铺层内<img> → 等解码/超时 → 0.2s 淡入 → 角色互换+预取） */
  const showRef = useRef<(ni: number) => void>(() => {});
  const show = useCallback(
    (ni: number) => {
      if (!disp || !stage.w) return;
      if (busyRef.current) {
        desiredRef.current = ni;
        return;
      }
      if (ni < 0 || ni >= (disp?.length ?? 0) || ni === index) return;
      busyRef.current = true;
      const myOp = ++opSeq.current; // 本次操作版本号
      const oldTop = top;
      const bot = (top === 0 ? 1 : 0) as 0 | 1;
      const target = disp![ni];
      const img = imgRefs[bot].current;
      if (!img) {
        busyRef.current = false;
        return;
      }

      // 已缓存且解码就绪（预取写入的同一 <img>）：直接显示，不等 load 事件
      if (layerSrc.current[bot] === target && img.complete && img.naturalWidth > 0) {
        startFade(bot, oldTop, ni, myOp);
        return;
      }

      img.src = target;
      layerSrc.current[bot] = target;

      waitReady(img, 3000).then((ok) => {
        // 版本/层/源校验：连续快速切换或已关闭时，丢弃过期回调
        if (myOp !== opSeq.current || !imgRefs[bot].current || layerSrc.current[bot] !== target) {
          busyRef.current = false;
          return;
        }
        if (!ok) {
          // 显示档（-w2400）失败：回退原图再试一次（保证图片必定显示）
          const img2 = imgRefs[bot].current;
          const orig = images?.[ni];
          if (img2 && orig && layerSrc.current[bot] === target) {
            img2.src = orig;
            layerSrc.current[bot] = orig;
            waitReady(img2, 5000).then((ok2) => {
              if (myOp !== opSeq.current || !imgRefs[bot].current || layerSrc.current[bot] !== orig) {
                busyRef.current = false;
                return;
              }
              if (!ok2) {
                setBroken(true);
                setIndex(ni);
                busyRef.current = false;
                desiredRef.current = null;
                return;
              }
              startFade(bot, oldTop, ni, myOp);
            });
            return;
          }
          // 失败/超时兜底：占位提示（深色底），允许继续切换，不卡空白
          setBroken(true);
          setIndex(ni);
          busyRef.current = false;
          desiredRef.current = null;
          return;
        }
        startFade(bot, oldTop, ni, myOp);
      });
    },
    [disp, stage.w, top, index, startFade]
  );
  useEffect(() => {
    showRef.current = show;
  });

  const goPrev = useCallback(() => show(index - 1), [show, index]);
  const goNext = useCallback(() => show(index + 1), [show, index]);

  useEffect(() => {
    if (!disp) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      else if (e.key === "ArrowLeft") show(index - 1);
      else if (e.key === "ArrowRight") show(index + 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [disp, handleClose, show, index]);

  const boxW = stage.w ? stage.w + 80 : 0;

  return (
    <AnimatePresence>
      {disp && total > 0 && (
        <motion.div
          className={`pointer-events-auto fixed inset-0 z-[10000] flex cursor-default items-center justify-center p-6 ${
            frosted ? "frost-overlay" : ""
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: "opacity" }}
          onAnimationComplete={() => setFrosted(true)}
          onClick={handleClose}
        >
          {/* 预览窗口：底 #00040a/30，宽 = 容器 + 左右各 40px（容器尺寸常驻，无 display:none） */}
          <div
            className="relative rounded-2xl border border-white/10 bg-[#00040a]/30"
            style={{ width: boxW || "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 图片容器：固定宽高常驻；两层 <img> 绝对定位铺满，opacity 控制显隐 */}
            <div
              className="relative overflow-hidden rounded-xl"
              style={{ width: stage.w || "auto", height: stage.h || 400, margin: "12px auto" }}
            >
              <img
                ref={imgRefs[0]}
                alt={d.lightbox.alt}
                className={`lb-layer ${top === 0 ? "on" : ""}`}
                decoding="async"
              />
              <img
                ref={imgRefs[1]}
                alt={d.lightbox.alt}
                className={`lb-layer ${top === 1 ? "on" : ""}`}
                decoding="async"
              />
              {/* 失败/超时兜底占位：深色底 + 提示，可继续切换 */}
              {broken && (
                <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-black/60">
                  <span className="px-4 text-center text-sm text-muted">
                    {d.lightbox.broken}
                  </span>
                </div>
              )}
            </div>

            {/* 右上角关闭按钮（同摄像视频弹窗样式） */}
            <button
              type="button"
              onClick={onClose}
              className="absolute -right-2 -top-2 grid h-10 min-w-10 cursor-pointer place-items-center rounded-full border border-white/15 bg-[#00040a]/80 px-2 text-sm text-text-primary backdrop-blur-md transition-colors hover:bg-[#00040a]"
              aria-label="关闭"
              title="关闭"
            >
              ✕
            </button>

            {/* 向前/向后箭头：固定窗口左右边缘 */}
            {[
              ...(index > 0
                ? [{ key: "prev", onClick: goPrev, cls: "left-0", title: d.lightbox.prev, flip: true }]
                : []),
              ...(index < total - 1
                ? [{ key: "next", onClick: goNext, cls: "right-0", title: d.lightbox.next, flip: false }]
                : []),
            ].map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={btn.onClick}
                className={`absolute ${btn.cls} top-1/2 grid h-10 w-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-white/15 bg-[#00040a]/60 backdrop-blur-md transition-transform duration-150 hover:scale-105 active:translate-y-[calc(-50%+2px)] active:scale-95`}
                title={btn.title}
                aria-label={btn.title}
              >
                <ArrowIcon flip={btn.flip} />
              </button>
            ))}

            {/* 位置指示 */}
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-[#00040a]/60 px-3 py-1 text-xs text-muted backdrop-blur-md">
              {index + 1} / {total}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
