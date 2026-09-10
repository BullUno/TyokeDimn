import { useEffect, useRef } from "react";
import { gsap } from "../lib/gsap";
import { useLang } from "../i18n";

interface PageTitleProps {
  /** 标题（中文两字时两端对齐；英文整词左对齐） */
  title: string;
  subtitle: string;
  /** 右侧动作按钮文案（可选） */
  actionLabel?: string;
  /** 标题左侧返回按钮（可选） */
  back?: { label: string; onClick: () => void };
}

/** 页面标题区（摄影/摄像统一风格）：白字粗体大标题 + 两端对齐 + 副标题 + 可选按钮
 *  动效：滚动进场时标题大幅升起（expo.out 丝滑），副标题紧随交错 */
export default function PageTitle({ title, subtitle, actionLabel, back }: PageTitleProps) {
  const { lang } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        root.querySelectorAll(".pt-title-line"),
        { y: 140, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.6,
          ease: "expo.out",
          stagger: 0.18,
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        }
      );
      gsap.fromTo(
        root.querySelectorAll(".pt-subtitle"),
        { y: 46, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          ease: "expo.out",
          delay: 0.5,
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="mx-auto mb-12 max-w-[1200px] px-6 md:mb-16 md:px-10 lg:px-16"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="w-fit max-w-2xl">
          <div className="flex items-start">
            {/* 标题与副标题同 GRID 列：中文两字标题（摄/影）两端对齐 = 与副标题首/尾字对齐（中间留空位） */}
            <div className="grid">
              <div className="col-start-1 row-start-1 flex select-none justify-between text-[40.5px] font-bold leading-none tracking-tight text-[#d9e0e3] md:text-[81px]">
                {lang === "zh" ? (
                  title.length <= 2 ? (
                    /* 两字标题（如「摄影」）：两端对齐铺满整个副标题列宽 */
                    <>
                      <span className="pt-title-line">{title.slice(0, 1)}</span>
                      <span className="pt-title-line">{title.slice(1)}</span>
                    </>
                  ) : (
                    /* 多字标题（如「全部作品」）：整词正常横排 */
                    <span className="pt-title-line whitespace-nowrap">{title}</span>
                  )
                ) : (
                  <span className="pt-title-line whitespace-nowrap">{title}</span>
                )}
              </div>
              {subtitle && (
                <p className="pt-subtitle col-start-1 row-start-2 mt-2 text-sm text-muted md:text-base">
                  {subtitle}
                </p>
              )}
            </div>
            {/* 返回按钮：标题右侧 750px（品字右缘 450 + 300）；圆形白环深底 + 左箭头（参考图样式，水平翻转自右箭头） */}
            {back && (
              <div className="mt-2 ml-[750px] md:mt-3">
                <button
                  type="button"
                  onClick={back.onClick}
                  aria-label={back.label}
                  title={back.label}
                  className="pointer-events-auto grid h-[56px] w-[56px] shrink-0 place-items-center rounded-full border-[1.5px] border-white/85 bg-[#0a0f1a]/90 text-white transition-colors duration-300 hover:border-white"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    {/* 水平翻转后的 chevron：指向左 */}
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
        {actionLabel && (
          <a
            href="#/works"
            onClick={() => {
              // 点击瞬间记录用户当前滚动位置（"最后一秒"状态），
              // 从全部作品页返回时按此恢复 —— 不依赖路由回调时刻的 DOM 状态
              try {
                sessionStorage.setItem("works-entry-scroll", String(window.scrollY));
              } catch {
                /* 隐私模式下忽略 */
              }
            }}
            className="group pointer-events-auto relative hidden rounded-full md:inline-flex"
          >
            <span
              aria-hidden
              className="accent-gradient absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="relative inline-flex items-center gap-2 rounded-full border border-stroke bg-[#00040a] px-5 py-2.5 text-sm text-text-primary transition-colors duration-300 group-hover:border-transparent">
              {actionLabel} <span aria-hidden>→</span>
            </span>
          </a>
        )}
      </div>
    </div>
  );
}
