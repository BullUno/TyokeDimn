import { useEffect, useState, type PointerEvent } from "react";
import { scrollLinks } from "../data";
import { scrollToAbout, scrollToId } from "../lib/gsap";
import { useLang } from "../i18n";

export default function Navbar() {
  const { lang, toggle, d } = useLang();
  const [active, setActive] = useState("home");

  // Scrollspy for the anchor links（IntersectionObserver，无滚动监听）
  useEffect(() => {
    const sections = scrollLinks
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // 「关于」：整段 About 居中且「精选作品」眉标不出现在视口内；其余按常规滚动
  const go = (id: string) => {
    setActive(id);
    // 全部作品页（#/works）：先跳回主页，再滚动到目标区（等路由切换完成、区块渲染后）
    if (window.location.hash.startsWith("#/works")) {
      window.location.hash = "";
      window.setTimeout(() => {
        if (id === "about") scrollToAbout();
        else scrollToId(id);
      }, 80);
      return;
    }
    if (id === "about") {
      scrollToAbout();
    } else {
      scrollToId(id);
    }
  };

  /**
   * 点击反馈（按下即触发）：记录点击坐标（--rx/--ry），
   * 启动「白色光点扩散 + 文字下沉」动画；文字颜色保持不变
   */
  const pressFeedback = (e: PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--ry", `${e.clientY - rect.top}px`);
    el.classList.remove("nav-fb-press");
    void el.offsetWidth; // 强制重排以重启动画
    el.classList.add("nav-fb-press");
    window.setTimeout(() => el.classList.remove("nav-fb-press"), 650);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 md:pt-6">
      <nav
        className="nav-shell inline-flex items-center rounded-full border border-white/10 bg-surface/60 px-2 py-2 backdrop-blur-xl backdrop-saturate-150"
      >
        {/* 中英翻译切换键：英文页面显示「中」(得意黑2.0)，中文页面显示「EN」(微软雅黑加粗) */}
        <button
          type="button"
          onPointerDown={pressFeedback}
          onClick={toggle}
          aria-label={d.nav.toggleAria}
          title={d.nav.toggleAria}
          className={`nav-fb logo-ring group mr-1 grid h-9 w-9 place-items-center rounded-full p-[1.5px] transition-transform duration-300 hover:scale-110 ${
            lang === "zh" ? "font-yahei font-bold" : "font-deihei"
          }`}
        >
          <span
            className={`grid h-full w-full place-items-center rounded-full bg-bg text-text-primary ${
              lang === "zh"
                ? "text-[12px] tracking-tight"
                : "text-[15px] leading-none"
            }`}
          >
            <span
              className={`nav-fb-text ${lang === "zh" ? "text-[12px] tracking-tight" : "text-[15px] leading-none"}`}
            >
              {lang === "zh" ? "EN" : "中"}
            </span>
          </span>
        </button>

        <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" />

        {scrollLinks.map((link) => (
          <button
            key={link.id}
            type="button"
            onPointerDown={pressFeedback}
            onClick={() => go(link.id)}
            className={`nav-fb overflow-hidden rounded-full px-3 py-1.5 text-xs transition-colors sm:px-4 sm:py-2 sm:text-sm ${
              active === link.id
                ? "bg-stroke/50 text-text-primary"
                : "text-muted hover:bg-stroke/50 hover:text-text-primary"
            }`}
          >
            <span className="nav-fb-text">{d.nav.links[link.id]}</span>
          </button>
        ))}

        <span className="mx-1 hidden h-5 w-px bg-stroke sm:block" />

        {/* 打个招呼：延伸至原「简历」位置；点击滚动到网页最底部 */}
        <button
          type="button"
          onPointerDown={pressFeedback}
          onClick={() =>
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
          }
          className="nav-fb group relative ml-1 inline-flex overflow-hidden rounded-full"
        >
          <span
            aria-hidden
            className="accent-gradient absolute -inset-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-surface px-4 py-1.5 text-xs font-medium text-text-primary backdrop-blur-md sm:px-5 sm:py-2 sm:text-sm">
            <span className="nav-fb-text">{d.nav.sayHi}</span>{" "}
            <span aria-hidden className="text-muted">↗</span>
          </span>
        </button>
      </nav>
    </header>
  );
}
