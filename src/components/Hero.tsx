import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap, scrollToId } from "../lib/gsap";
import { useLang } from "../i18n";
import SideRays from "./SideRays";

const blurHidden: CSSProperties = {
  opacity: 0,
  filter: "blur(10px)",
  transform: "translateY(20px)",
};

export default function Hero({ start }: { start: boolean }) {
  const { lang, d } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const [roleIndex, setRoleIndex] = useState(0);
  // SCROLL 指示器显隐由 CSS view-timeline 驱动（hero 滚出视口淡出），无 JS 滚动监听

  // GSAP entrance, runs once the loading screen is gone
  useEffect(() => {
    if (!start) return;
    const ctx = gsap.context(() => {
      gsap.to(".name-reveal", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.1,
      });
      gsap.to(".blur-in", {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 1,
        stagger: 0.1,
        delay: 0.3,
        ease: "power3.out",
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [start]);

  // Roles cycle every 2s
  useEffect(() => {
    const timer = window.setInterval(
      () => setRoleIndex((i) => (i + 1) % d.hero.roles.length),
      2000
    );
    return () => window.clearInterval(timer);
  }, [d.hero.roles]);

  // 固定宽度占位：按当前语言下最长的角色词预留空间，避免句子随词长变化而抖动
  const longestRole = d.hero.roles.reduce((a, b) =>
    b.length > a.length ? b : a
  );

  return (
    <section
      id="home"
      ref={sectionRef}
      className="no-copy relative h-screen min-h-[640px] overflow-hidden"
    >
      {/* 背景 — SideRays 光照（底部渐隐蒙版：光线提前消散，不出现硬边界） */}
      <div className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_50%,rgba(0,0,0,0.3)_82%,transparent_96%)] [-webkit-mask-image:linear-gradient(to_bottom,black_50%,rgba(0,0,0,0.3)_82%,transparent_96%)]">
        <SideRays
          speed={2.5}
          rayColor1="#96c8ff"
          rayColor2="#4E85BF"
          intensity={3.4}
          spread={2.4}
          origin="top-right"
          tilt={-2}
          saturation={1.7}
          blend={0.68}
          falloff={1.25}
          opacity={1}
        />
      </div>
      <div className="absolute inset-0 bg-black/15" />
      {/* 底部过渡蒙版：把下方 #120F17 颜色慢慢融进 hero（只作用于底部连接处） */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38vh] min-h-[280px] bg-gradient-to-t from-[#00040a]/60 via-[#00040a]/30 via-45% to-transparent md:h-[46vh]" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <p
          className="blur-in mb-8 text-xs uppercase tracking-[0.3em] text-muted"
          style={blurHidden}
        >
          {d.hero.eyebrow}
        </p>

        <h1
          className="name-reveal hero-title-outline mb-6 font-name text-6xl leading-[0.9] tracking-tight text-text-primary md:text-8xl lg:text-9xl"
          style={{ opacity: 0, transform: "translateY(50px)" }}
        >
          Tyoke Dimn
        </h1>

        <p
          className="blur-in mb-6 text-lg text-muted md:text-2xl"
          style={blurHidden}
        >
          {d.hero.rolePrefix}
          {/* 固定宽度占位：按最长角色词预留空间，避免句子随词长变化而抖动；中文角色词不斜体 */}
          <span
            className={`relative inline-block align-baseline font-display text-text-primary ${
              lang === "en" ? "italic" : ""
            }`}
          >
            <span aria-hidden className="invisible">
              {longestRole}
            </span>
            <span
              key={`${lang}-${roleIndex}`}
              className="animate-role-fade-in absolute inset-x-0 top-0 whitespace-nowrap text-center"
            >
              {d.hero.roles[roleIndex]}
            </span>
          </span>
          {d.hero.livesIn}
        </p>

        <p
          className="blur-in mb-12 max-w-md text-sm text-muted md:text-base"
          style={blurHidden}
        >
          {d.hero.tagline}
        </p>

        <div
          className="blur-in inline-flex flex-wrap justify-center gap-4"
          style={blurHidden}
        >
          <button
            type="button"
            onClick={() => scrollToId("work")}
            className="group relative rounded-full transition-transform duration-300 hover:scale-105"
          >
            <span
              aria-hidden
              className="accent-gradient absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="relative z-10 inline-flex rounded-full bg-text-primary px-7 py-3.5 text-sm font-medium text-bg transition-colors duration-300 group-hover:bg-bg group-hover:text-text-primary">
              {d.hero.seeWorks}
            </span>
          </button>

          <button
            type="button"
            onClick={() => scrollToId("contact")}
            className="group relative rounded-full transition-transform duration-300 hover:scale-105"
          >
            <span
              aria-hidden
              className="accent-gradient absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="relative z-10 inline-flex rounded-full border-2 border-stroke bg-bg px-7 py-3.5 text-sm font-medium text-text-primary transition-colors duration-300 group-hover:border-transparent">
              {d.hero.reachOut}
            </span>
          </button>
        </div>
      </div>

      {/* Scroll indicator（view-timeline 驱动显隐） */}
      <div className="hero-cue absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          {d.hero.scroll}
        </span>
        <div className="relative h-10 w-px overflow-hidden bg-stroke">
          <div className="animate-scroll-down absolute left-0 top-0 h-1/2 w-full bg-text-primary/80" />
        </div>
      </div>
    </section>
  );
}
