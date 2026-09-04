import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TransitionEvent,
} from "react";

const PIXEL_SIZE = 140;
const PIXEL_DURATION = 420;
const TOTAL_DURATION = 900;
const SPREAD = TOTAL_DURATION - PIXEL_DURATION;
const START_DELAY_MS = 500; // 用户访问 0.5s 后启动翻转（白 → 黑）
const TOTAL_MS = 1500; // 像素翻转完成后短暂停留即触发退场

// 退场帘幕时长（蒙版渐变整页擦除，与 hero 入场同步；提速后 ~950ms）
const CURTAIN_MS = 950;

/**
 * 中心字样：HELLO 与 WELCOME 使用同一组绝对坐标互叠（position:absolute + left:50% translateX(-50%)），
 * 由构造保证两者位置完全一致；静态绝对位置，无测量、无过渡、无跳变。
 */
const WORD_POS: CSSProperties = {
  position: "absolute",
  top: "-0.5em",
  left: "50%",
  transform: "translateX(-50%)",
  whiteSpace: "nowrap",
};

function CenterWord() {
  return (
    <>
      <span
        className="rv-hello select-none whitespace-nowrap font-yahei text-[clamp(44px,6.94vw,100px)] font-bold leading-none tracking-tight"
        style={{
          ...WORD_POS,
          WebkitTextStroke: "3px #030712",
          color: "transparent",
        }}
      >
        HELLO
      </span>
      <span
        aria-hidden
        className="rv-welcome select-none whitespace-nowrap font-yahei text-[clamp(44px,6.94vw,100px)] font-bold leading-none tracking-tight"
        style={{
          ...WORD_POS,
          WebkitTextStroke: "3px #d9e0e3",
          color: "transparent",
        }}
      >
        WELCOME
      </span>
    </>
  );
}

interface PixelInfo {
  id: number;
  left: number;
  top: number;
  delay: number;
}

interface GridInfo {
  pixels: PixelInfo[];
  size: number;
  width: number;
  height: number;
}

/** 构建像素网格：gap 0；每个方块独立随机延迟（均匀分布 → 散点翻转，参考图的随机状态） */
const buildGrid = (width: number, height: number): GridInfo => {
  const cols = Math.max(1, Math.ceil(width / PIXEL_SIZE));
  const rows = Math.max(1, Math.ceil(height / PIXEL_SIZE));
  const originX = (width - cols * PIXEL_SIZE) / 2;
  const originY = (height - rows * PIXEL_SIZE) / 2;
  const pixels: PixelInfo[] = [];

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const id = r * cols + c;
      const seed = Math.sin((id + 1) * 127.1) * 43758.5453;
      const random = seed - Math.floor(seed);
      pixels.push({
        id,
        left: originX + c * PIXEL_SIZE,
        top: originY + r * PIXEL_SIZE,
        // 完全随机：每个方块独立随机时刻翻转，直到整页变黑
        delay: random * SPREAD,
      });
    }
  }

  return { pixels, size: PIXEL_SIZE, width, height };
};

interface LoadingScreenProps {
  onComplete: () => void;
  /** 退场帘幕结束后调用（覆层卸载） */
  onEntered: () => void;
}

export default function LoadingScreen({
  onComplete,
  onEntered,
}: LoadingScreenProps) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const onEnteredRef = useRef(onEntered);
  onEnteredRef.current = onEntered;
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const remainingRef = useRef(0);
  const exitedRef = useRef(false);

  // 注：HELLO/WELCOME 不再做“测量 hero 标题后定位”的 JS 重定位 ——
  // 该机制会让字样在 fonts.ready / loadingdone / resize 时被改写位置（出现/跳动），
  // 与“第一帧起固定显示、绝对静止”的要求冲突。现统一使用 CSS 静态锚点 .rv-title(top:40%)。

  // 测量容器（固定满屏）
  useEffect(() => {
    const el = document.getElementById("loading-stage");
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w && h) setBox((cur) => (cur?.w === w && cur?.h === h ? cur : { w, h }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const grid = useMemo(
    () =>
      box
        ? buildGrid(box.w, box.h)
        : { pixels: [], size: 0, width: 0, height: 0 },
    [box]
  );

  // 网格就绪后延迟 0.5s 启动翻转（白 → 黑）
  useEffect(() => {
    if (flipped || !grid.pixels.length) return;
    remainingRef.current = grid.pixels.length;
    const timer = window.setTimeout(() => setFlipped(true), START_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [grid, flipped]);

  // 减少动态效果偏好：跳过动画直达终态
  useEffect(() => {
    if (
      !done &&
      flipped &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDone(true);
    }
  }, [done, flipped]);

  const handleTransitionEnd = (e: TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "opacity") return; // 每个像素 opacity 完成计一次
    remainingRef.current -= 1;
    if (remainingRef.current <= 0) setDone(true);
  };

  // 加载完成计时：触发 hero 入场 + 退场帘幕（同帧开始，进度同步）
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onCompleteRef.current();
      setExiting(true);
      if (!exitedRef.current) {
        exitedRef.current = true;
        window.setTimeout(() => onEnteredRef.current(), CURTAIN_MS);
      }
    }, TOTAL_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      data-test="overlay"
      className={`rv-exit fixed inset-0 z-[9999] ${exiting ? "is-exiting" : ""}`}
      aria-label="Loading"
    >
      <div
        id="loading-stage"
        data-test="stage"
        className={`rv-stage ${flipped ? "is-open" : ""} ${done ? "is-done" : ""}`}
        onTransitionEnd={handleTransitionEnd}
      >
        {/* 白色封面层（纯色 #c8d4d9，无文字；完成瞬间切换为深色终态） */}
        <div className="rv-cover-face absolute inset-0 bg-[#c8d4d9]" />

        {/* 像素网格：纯色深色圆角方块，按中心优先扩散 */}
        <div
          data-test="grid"
          className="pointer-events-none absolute inset-0 z-[3]"
          aria-hidden="true"
        >
          {grid.pixels.map((pixel) => (
            <div
              key={pixel.id}
              className="rv-pixel"
              style={
                {
                  left: pixel.left,
                  top: pixel.top,
                  width: grid.size,
                  height: grid.size,
                  "--d": `${pixel.delay}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>

        {/* 中心字样：CSS 静态锚点（top:40% + translateY(-50%)），从第一帧起渲染、
            位置固定不变；HELLO/WELCOME 同一锚点互叠，交换时零位移 */}
        <div className="rv-title" aria-hidden="true">
          <CenterWord />
        </div>
      </div>
    </div>
  );
}
