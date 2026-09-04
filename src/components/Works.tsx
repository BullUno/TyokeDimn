import { useCallback, useEffect, useRef, useState } from "react";
import Lightbox from "./Lightbox";
import PageTitle from "./PageTitle";
import { projects, thumbOf, midOf, FULL_SIZES } from "../data";
import { gsap } from "../lib/gsap";
import { useLang } from "../i18n";

export default function Works() {
  const { lang, d } = useLang();
  const [preview, setPreview] = useState<{ images: string[]; index: number } | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);
  const gridRef = useRef<HTMLDivElement>(null);

  // 高级进场：卡片交错升起（power4.out）。
  // 注意：不再对卡片图片做 yPercent/scale reveal —— 该效果在刷新且滚动位置恰好在作品区时
  // 会被 ScrollTrigger 立即触发重放（fromTo 的 from 态 yPercent:22/scale:1.22 会先被应用，
  // 表现为图片先偏下放大、几百毫秒后再上移缩小），属误报 bug，已移除。
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const ctx = gsap.context(() => {
      const st = {
        trigger: grid,
        start: "top 78%",
        once: true,
      };
      gsap.fromTo(
        grid.querySelectorAll(".w-card"),
        { y: 110, rotate: 2, opacity: 0 },
        {
          y: 0,
          rotate: 0,
          opacity: 1,
          duration: 1.3,
          ease: "power4.out",
          stagger: 0.16,
          clearProps: "transform", // 入场结束即释放 transform：避免卡片残留合成层（blend/纹理错栅格诱因）
          scrollTrigger: st,
        }
      );
    }, grid);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="work"
      className="pointer-events-none relative pt-24 pb-8 md:pt-32 md:pb-[max(0px,calc(100vh_-_1254px))]"
    >
      {/* 标题区：与摄像页统一（PageTitle 组件） */}
      <PageTitle
        title={d.works.title}
        subtitle={d.works.subtitle}
        actionLabel={d.works.viewAll}
      />

      <div className="mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        <div ref={gridRef} className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {projects.map((project, i) => (
            <button
              type="button"
              key={project.image}
              onClick={() =>
                setPreview({
                  images: project.gallery,
                  index: 0, // 预览默认从该路径第一张开始
                })
              }
              className={`w-card group pointer-events-auto relative block w-full cursor-pointer overflow-hidden rounded-3xl border border-stroke bg-surface text-left ${project.span} ${project.aspect}`}
            >
              <img
                src={thumbOf(project.image)}
                srcSet={`${thumbOf(project.image)} 900w, ${midOf(project.image)} 1200w, ${project.image} ${FULL_SIZES[project.image]?.w ?? 3000}w`}
                sizes="(min-width: 1024px) 34vw, (min-width: 768px) 45vw, 84vw"
                alt={d.works.projects[i]}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Hover blur layer → 纯半透明遮罩（去掉 backdrop-blur，消除大面积背板模糊开销） */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[#00040a]/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              {/* Hover label — 每卡专属（中文四字换行两行/英文自适应字号，空心白描边，居中随图片同步放大） */}
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span
                  aria-hidden
                  className={`select-none text-center font-bold leading-tight text-transparent transition-transform duration-700 group-hover:scale-110 ${
                    lang === "zh"
                      ? "max-w-[130px] text-[50px]"
                      : "max-w-[85%] text-[26px]"
                  }`}
                  style={{ WebkitTextStroke: "1.5px #d9e0e3" }}
                >
                  {lang === "zh" ? project.label : project.labelEn}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scroll indicator — 视口固定；显隐由 view-timeline 驱动（works-cue） */}
      <div className="works-cue pointer-events-none fixed bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-xs uppercase tracking-[0.2em] text-muted">
          {d.works.scroll}
        </span>
        <div className="relative h-10 w-px overflow-hidden bg-stroke">
          <div className="animate-scroll-down absolute left-0 top-0 h-1/2 w-full bg-text-primary/80" />
        </div>
      </div>

      <Lightbox images={preview?.images ?? null} startIndex={preview?.index ?? 0} onClose={closePreview} />
    </section>
  );
}
