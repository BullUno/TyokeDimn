import { useEffect, useRef, useState } from "react";
import PageTitle from "./PageTitle";
import { journal, type JournalEntry } from "../data";
import { gsap } from "../lib/gsap";
import { useLang } from "../i18n";

export default function Journal() {
  const { lang, d } = useLang();
  const [playing, setPlaying] = useState<JournalEntry | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // 高级进场：药丸卡交错大幅升起（轻微旋转 → 归位，power4.out 丝滑）
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        list.querySelectorAll(".j-card"),
        { y: 96, rotate: -2.5, opacity: 0 },
        {
          y: 0,
          rotate: 0,
          opacity: 1,
          duration: 1.25,
          ease: "power4.out",
          stagger: 0.16,
          scrollTrigger: { trigger: list, start: "top 82%", once: true },
        }
      );
    }, list);
    return () => ctx.revert();
  }, []);

  // 视频弹窗：Esc 关闭 + 锁定背景滚动
  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPlaying(null);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [playing]);

  return (
    <section
      id="journal"
      className="pointer-events-none pt-16 pb-16 md:pt-24 md:pb-[200px]"
    >
      {/* 标题区：与摄影页统一（PageTitle 组件，无右上角按钮） */}
      <PageTitle title={d.journal.title} subtitle={d.journal.subtitle} />

      {/* 编号药丸列表（参考图风格）：行高 125px、间距 +10%（22px）、宽度 +20%；悬停白色横带 + 预览卡 */}
      <div
        ref={listRef}
        className="mx-auto flex max-w-[1440px] flex-col gap-[69.6px] px-6 md:px-10 lg:px-16"
      >
        {journal.map((entry, i) => (
          <div key={entry.video} className="j-card group pointer-events-auto relative">
            <button
              type="button"
              onClick={() => setPlaying(entry)}
              className="relative block h-[125px] w-full cursor-pointer overflow-hidden rounded-full border border-white/10 bg-surface/25 text-left"
            >
              {/* 白色横带：从中心向两侧 fill（scaleX 0→1） */}
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-full origin-center scale-x-0 bg-[#d9e0e3] transition-transform duration-500 ease-out group-hover:scale-x-100"
              />

              {/* 内容：空心数字 | 标题（水平中轴） | 日期 */}
              <div className="relative z-10 flex h-full items-center gap-5 px-8 md:gap-10 md:px-12">
                <span className="jnum shrink-0 text-[72px] leading-none md:text-[84px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative h-full min-w-0 flex-1">
                  {/* 标题：行水平中轴线上（垂直居中；z-30 确保完整呈现，不被预览卡遮挡）；
                      「我，你好」字距收紧；英文态字号 34px 保证长标题单行完整 */}
                  <h3
                    className={`absolute left-0 top-1/2 z-30 w-full -translate-y-1/2 whitespace-nowrap font-yahei text-[26px] font-bold leading-none text-[#d9e0e3] transition-colors duration-300 group-hover:text-[#0a0a0a] md:text-[38px] ${
                      lang === "en" ? "md:!text-[34px]" : ""
                    } ${d.journal.entries[i].title === "我，你好" ? "tracking-[-0.06em]" : ""}`}
                  >
                    {d.journal.entries[i].title}
                  </h3>
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-muted transition-colors duration-300 group-hover:text-[#666666]">
                  {d.journal.entries[i].roles.join("、")}
                  <span aria-hidden className="mx-1.5 opacity-50">|</span>
                  {d.journal.entries[i].date}
                </span>
              </div>
            </button>

            {/* 悬停预览卡（参考图效果）：独立浮出药丸之外；第一张为竖版完整封面 */
            }
            <span
              aria-hidden
              className={`pointer-events-none absolute right-16 top-1/2 z-20 hidden origin-bottom-right -translate-y-[70%] scale-90 rotate-[7deg] overflow-hidden rounded-2xl border border-white/25 opacity-0 shadow-2xl shadow-black/60 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100 md:block md:w-[420px] ${
                i === 0 ? "md:!w-[300px]" : ""
              }`}
            >
              <img
                src={entry.preview}
                alt=""
                decoding="async"
                className={`w-full object-cover ${i === 0 ? "aspect-[3/4]" : "aspect-[16/9]"}`}
              />
            </span>
          </div>
        ))}
      </div>

      {/* 视频弹窗（小窗口播放；点击空白关闭，Esc 关闭） */}
      {playing && (
        <div
          className="pointer-events-auto fixed inset-0 z-[10000] flex cursor-zoom-out items-center justify-center bg-black/70 p-6 backdrop-blur-md"
          onClick={() => setPlaying(null)}
        >
          <div
            className="relative w-[min(92vw,1100px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={playing.video}
              poster={playing.poster}
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
