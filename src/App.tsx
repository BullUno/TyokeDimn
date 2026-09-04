import { Suspense, lazy, useEffect, useRef, useState } from "react";
import About from "./components/About";
import Contact from "./components/Contact";
import Explorations from "./components/Explorations";
import Hero from "./components/Hero";
import Journal from "./components/Journal";
import LaserFlow from "./components/LaserFlow";
import LoadingScreen from "./components/LoadingScreen";
import Navbar from "./components/Navbar";
import ShapeGrid from "./components/ShapeGrid";
import Works from "./components/Works";
import { LangProvider } from "./i18n";
import { ScrollTrigger } from "./lib/gsap";

// 全部作品页（含 ogl 圆环画廊）异步分包：仅进入 #/works 时才加载，首屏 JS 不包含
const WorksPage = lazy(() => import("./components/WorksPage"));

export default function App() {
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  // 轻量 hash 路由：#/works → 全部作品页，其余 → 主页（不引入路由库）
  const [route, setRoute] = useState(() =>
    window.location.hash.replace(/^#/, "")
  );
  // 路由切换同步用的 prev 值（useState 闭包拿不到最新值）
  const routeRef = useRef(route);

  useEffect(() => {
    const sync = () => {
      const next = window.location.hash.replace(/^#/, "");
      routeRef.current = next;
      // 从全部作品页返回主页：不在路由回调内做滚动定位 —— 此时主页尚未提交渲染、
      // 文档高度是旧页的，scrollTo 会被 clamp 回顶部；
      // 恢复定位改由下方「主页挂载后」的 effect 执行（读取点击时记录的 scrollY）。
      setRoute(next);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // 返回主页且存在跳走前记录的滚动位置：等主页渲染完成（两次 rAF 确保 DOM 提交/布局稳定）
  // 后直接定位到该位置（instant，无平滑），第一屏即摄影区块所在的滚动视口。
  const isWorksPage = route.startsWith("/works");

  useEffect(() => {
    if (isWorksPage) return;
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem("works-entry-scroll");
      sessionStorage.removeItem("works-entry-scroll");
    } catch {
      /* 隐私模式下忽略 */
    }
    if (raw === null) return;
    const y = parseFloat(raw);
    if (!Number.isFinite(y)) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "instant" });
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isWorksPage]);

  useEffect(() => {
    // 加载开始强制回顶（配合 main.tsx 的 scrollRestoration=manual），
    // 滚动条间隙已由 html{scrollbar-gutter:stable} 稳定，此处仅锁定滚动
    window.scrollTo(0, 0);
    document.body.style.overflow = loading ? "hidden" : "";
    if (!loading) {
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => cancelAnimationFrame(raf);
    }
  }, [loading]);

  return (
    <LangProvider>
      {showLoader && (
        <LoadingScreen
          onComplete={() => setLoading(false)}
          onEntered={() => setShowLoader(false)}
        />
      )}
      <Navbar />
      {isWorksPage ? (
        <Suspense fallback={null}>
          <WorksPage />
        </Suspense>
      ) : (
        <main>
          <Hero start={!loading} />
        <About />
        {/* ShapeGrid 最底层背景：横贯 精选项目 → 近期思考 → 视觉游乐场；
            上方波纹特效（GradientWaves）为第二层，亮处自然盖住方格；
            两端渐变色带：与 About（顶）/ 最低页面（底）的 #00040a 无缝衔接，过渡平滑 */}
        <div
          className="relative isolate"
          style={{
            background:
              "linear-gradient(to bottom, #00040a 0, #00040a 450px, rgba(0,4,10,0) 900px, rgba(0,4,10,0) calc(100% - 900px), #00040a calc(100% - 450px), #00040a 100%)",
          }}
        >
          <div
            aria-hidden
            className="mask-fade-v absolute inset-0 -z-10 overflow-hidden [--fade-top:5%] [--fade-bottom:5%]"
          >
            <ShapeGrid
              speed={0.25}
              squareSize={40}
              direction="up"
              borderColor="#16181c"
              hoverFillColor="#697595"
              shape="square"
              hoverTrailAmount={2}
            />
          </div>
          <Works />
          <Journal />
          <Explorations />
        </div>
        {/* 底部（联系+页脚）：光柱底座紧贴页面最下边缘、底座发光横带铺满页脚底部；
            单行页脚（左社交/中版权/右标签）垂直居中叠加于底座光带之上；光柱向上延伸 */}
        <div
          className="relative isolate flex min-h-[70vh] flex-col justify-end overflow-hidden"
          style={{
            background:
              "linear-gradient(to bottom, #00040a 0, #02030a 30%, #000000 70%)",
          }}
        >
          <div
            aria-hidden
            className="mask-fade-v pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            style={{ "--fade-top": "0%", "--fade-bottom": "0%" } as React.CSSProperties}
          >
            {/* 光柱底座贴合页面最底：底座光带横贯底部，喷注自底向上，页脚一行在光带下方 */}
            <div className="absolute inset-0" style={{ transform: "translateY(180px)" }}>
              {/* 底部静态光晕：确保任意动画时相光都铺满页脚区域（增强版：更亮更聚焦底部） */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] mix-blend-screen"
                style={{
                  background:
                    "radial-gradient(ellipse 92% 75% at 50% 110%, rgba(139,150,242,0.75) 0%, rgba(139,150,242,0.3) 40%, rgba(0,0,0,0) 72%)",
                }}
              />
              {/* 底部恒定亮带：光柱底座光效持续停在页脚 */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 mix-blend-screen"
                style={{
                  background:
                    "linear-gradient(to top, rgba(139,150,242,0.55) 0%, rgba(139,150,242,0.22) 55%, rgba(0,0,0,0) 100%)",
                }}
              />
              <LaserFlow
                color="#8b96f2"
                wispDensity={2}
                flowSpeed={0.6}
                verticalSizing={7}
                horizontalSizing={6}
                fogIntensity={2.2}
                fogScale={0.384}
                wispSpeed={29}
                wispIntensity={22}
                flowStrength={1}
                decay={4}
                falloffStart={3}
                fogFallSpeed={0.6}
                horizontalBeamOffset={0.3}
                verticalBeamOffset={-0.35}
              />
            </div>
          </div>
          <Contact />
        </div>
      </main>
      )}
    </LangProvider>
  );
}
