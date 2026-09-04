import { useEffect, useRef, useState } from "react";
import GradientWaves from "./GradientWaves";
import { explorationVideos } from "../data";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { useLang } from "../i18n";

/** 视频卡片（左列 C4D / 右列 AE 共用）：默认停播；悬停 → 微放大+模糊并渐显 36px 名称；
    划出暂停、划入在当前帧续播（不重置）；进场由父级 GSAP stagger 统一驱动 */
function VideoTile({
  item,
  side,
  onOpen,
}: {
  item: { video: string; title: string };
  side: "c4d" | "ae";
  onOpen: (video: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item.video)}
      onMouseEnter={(e) => {
        const v = e.currentTarget.querySelector("video");
        v?.play().catch(() => {});
      }}
      onMouseLeave={(e) => {
        const v = e.currentTarget.querySelector("video");
        v?.pause();
      }}
      className="ev-tile pointer-events-auto group relative block aspect-square w-full max-w-[320px] cursor-pointer overflow-hidden rounded-3xl border border-stroke bg-surface transition-transform duration-500 hover:scale-105"
    >
      {/* 视频：默认停播；悬停微放大 + 轻微模糊 */}
      <video
        src={item.video}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:blur-[2px]"
      />
      {/* 悬停变暗遮罩 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[#00040a]/0 opacity-0 transition-all duration-300 group-hover:bg-[#00040a]/40 group-hover:opacity-100"
      />
      {/* 角标小字：12px #ffffff */}
      <span
        aria-hidden
        className={`absolute text-xs text-[#ffffff] opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
          side === "c4d" ? "left-3 top-3" : "right-3 top-3"
        }`}
      >
        {side === "c4d" ? "Made with C4D" : "Made with AE"}
      </span>
      {/* 视频名称：36px 居中、默认隐藏、悬停渐显（微放大同步） */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 grid scale-[0.9] select-none place-items-center opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100"
        style={{ color: "transparent", WebkitTextStroke: "0.5px #ffffff" }}
      >
        <span className="text-[36px] font-bold leading-none">{item.title}</span>
      </span>
    </button>
  );
}

export default function Explorations() {
  const { d } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const col1Ref = useRef<HTMLDivElement>(null);
  const col2Ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const col1 = col1Ref.current;
    const col2 = col2Ref.current;
    if (!section || !content || !col1 || !col2) return;

    // Pin + parallax only on md+ screens; mobile uses normal flow layout
        const mm = gsap.matchMedia();
    mm.add("(min-width: 768px)", () => {
      // Pin the center content while the section scrolls
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        pin: content,
        pinSpacing: false,
      });

      // Scroll-driven 标题交替：下滑标题向下滑出 → 欢迎联络渐显；滑到最底（末 8%）欢迎联络消失；上滑反向恢复
      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        })
        .to(".exp-heading", { opacity: 0, y: 40, duration: 0.3, ease: "none" }, 0)
        .fromTo(
          ".exp-welcome",
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.3, ease: "none" },
          0.25
        )
        .to(".exp-welcome", { opacity: 0, y: -24, duration: 0.08, ease: "none" }, 0.92);

      // Scroll-driven parallax for the two columns
      gsap.fromTo(
        col1,
        { yPercent: 10 },
        {
          yPercent: -35,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
      gsap.fromTo(
        col2,
        { yPercent: 30 },
        {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
          },
        }
      );
    });

    return () => mm.revert();
  }, []);

  // 高级进场：中心标题大幅升起（expo.out）+ 视频卡交错升起（power4.out）
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".exp-center",
        { y: 150, scale: 0.96, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          duration: 1.7,
          ease: "expo.out",
          scrollTrigger: { trigger: ".exp-center", start: "top 78%", once: true },
        }
      );
      gsap.fromTo(
        ".ev-tile",
        { y: 120, rotate: 2, opacity: 0 },
        {
          y: 0,
          rotate: 0,
          opacity: 1,
          duration: 1.25,
          ease: "power4.out",
          stagger: 0.14,
          scrollTrigger: { trigger: ".ev-grid", start: "top 82%", once: true },
        }
      );
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="explorations"
      className="pointer-events-none relative isolate md:min-h-[max(0px,calc(120vh_+_370px))]"
    >
      {/* GradientWaves 背景层：铺满整个视觉游乐场区块（props 按示例代码微调：波纹更小更密；
          顶部 3% 渐隐（近期思考页面即可看到一点），底部 10% 渐隐保证过渡顺滑） */}
      <div
        aria-hidden
        className="mask-fade-v pointer-events-none absolute inset-0 -z-10 overflow-hidden [--fade-top:3%] [--fade-bottom:10%]"
      >
        <GradientWaves
          horizonColor="#271571"
          waveColor="#829efb"
          crestColor="#bdc3fe"
          speed={0.4}
          amplitude={2.2}
          waveScale={0.75}
          waveRatio={1.2}
          swell={24}
          turbulence={14}
          tilt={1.11}
          zoom={0.85}
          height={5.5}
          fogDepth={19}
          detail="medium"
          brightness={0.85}
          opacity={1.0}
          mouseInteraction={true}
          parallaxStrength={0.55}
          grain={true}
          grainIntensity={0.05}
        />
      </div>
      {/* Pinned center content */}
      <div
        ref={contentRef}
        className="relative z-10 flex h-screen items-center justify-center px-6"
      >
        <div className="exp-center relative mx-auto max-w-3xl text-center">
          {/* 标题组：下滑时向下滑动并渐变为「欢迎联络」，滑到最底消失；上滑恢复 */}
          <div className="exp-heading">
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-stroke" />
              <span className="text-xs uppercase tracking-[0.3em] text-muted">
                {d.explorations.eyebrow}
              </span>
              <span className="h-px w-8 bg-stroke" />
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight text-text-primary md:text-6xl lg:text-7xl">
              {d.explorations.titleA} {d.explorations.titleB}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm text-muted md:text-base">
              {d.explorations.subtitle}
            </p>
          </div>
          {/* 滚动中覆盖出现：欢迎联络（得意黑 2.0）+ 上方横线（10px、与字同宽）+ 下方大 50% 的「一起创作」；
              这一组以 C4D&AE 标题中心为锚精确居中（组高于标题块时 grid place-items-center 会溢出下坠 50px+，
              故内层改用 abs+translate(-50%) 数学居中）；.exp-welcome 整体淡入上移/淡出上移动画不变 */}
          <div className="exp-welcome pointer-events-none absolute inset-0 opacity-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="flex flex-col items-center gap-[60px]">
                <div className="flex flex-col items-center gap-[10px]">
                  <span aria-hidden className="h-[2px] w-full bg-text-primary/60" />
                  <span className="whitespace-nowrap font-deihei text-[58px] font-bold leading-none tracking-tight text-text-primary md:text-[82px]">
                    {d.explorations.welcome}
                  </span>
                </div>
                <span className="whitespace-nowrap font-deihei text-[87px] font-bold leading-none tracking-tight text-text-primary -translate-x-[15px] md:text-[123px]">
                  {d.explorations.createTogether}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parallax columns (md+) / in-flow gallery (mobile)：文档流定位（避免首屏未初始化时 absolute 溢出叠到摄像页） */}
      <div className="pointer-events-none relative z-10 md:z-20 md:-mt-[100vh]">
        <div className="mx-auto h-full max-w-[1400px]">
          <div className="ev-grid grid grid-cols-2 gap-[44.16px] px-6 pb-20 pt-12 md:gap-[147.2px] md:pb-0 md:pt-14 lg:px-12">
            <div
              ref={col1Ref}
              className="flex flex-col items-center gap-[19.2px] md:gap-[38.4px]"
            >
              {explorationVideos.c4d.map((item) => (
                <VideoTile key={item.video} item={item} side="c4d" onOpen={setPlaying} />
              ))}
            </div>
            <div
              ref={col2Ref}
              className="flex flex-col items-center gap-[19.2px] md:gap-[38.4px]"
            >
              {explorationVideos.ae.map((item) => (
                <VideoTile key={item.video} item={item} side="ae" onOpen={setPlaying} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 视频弹窗（点击卡片播放；空白/Esc/✕ 关闭） */}
      {playing && (
        <div
          className="pointer-events-auto fixed inset-0 z-[10000] flex cursor-default items-center justify-center bg-black/70 p-6 backdrop-blur-md"
          onClick={() => setPlaying(null)}
        >
          <div
            className="relative w-[min(92vw,1100px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={playing}
              controls
              autoPlay
              playsInline
              className="max-h-[78vh] w-full rounded-2xl bg-black shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPlaying(null)}
              className="absolute -right-2 -top-2 grid h-10 min-w-10 cursor-pointer place-items-center rounded-full border border-white/15 bg-[#00040a]/80 px-2 text-sm text-text-primary backdrop-blur-md transition-colors hover:bg-[#00040a]"
              aria-label="关闭"
              title="关闭"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
