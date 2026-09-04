import { useEffect, useRef, useState } from "react";
import { EMAIL, contactChannels } from "../data";
import { useLang } from "../i18n";

export default function Contact() {
  const { d } = useLang();
  const h2Ref = useRef<HTMLHeadingElement>(null);
  /** 卡片左缘（相对容器，px）与右缘（距容器右缘 px）——由标题字符实测驱动 */
  const [cardBox, setCardBox] = useState<{ left: string; right: string }>({
    left: "47%",
    right: "0px",
  });
  /** 发送按钮动画态：idle → sending（旋涡填充+文字渐隐）→ sent（✔ 打勾）→ idle（复位可再发） */
  const [sendState, setSendState] = useState<"idle" | "sending" | "sent">("idle");

  /** 发送：名称/邮箱/留言三项齐全才触发动画与发信（恢复正式校验；不再点击即播） */
  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "");
    const email = String(fd.get("email") || "");
    const msg = String(fd.get("msg") || "");
    if (!name || !email || !msg) return; // 信息不全：不播放动画
    // 动画（sendState 驱动各图层时序）
    setSendState("sending");
    window.setTimeout(() => setSendState("sent"), 780);
    window.setTimeout(() => setSendState("idle"), 2200);
    // 发信：延迟 600ms，保证动画可见，功能不变
    window.setTimeout(
      () =>
        (window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
          "来自网站的留言"
        )}&body=${encodeURIComponent(
          `${d.contact.nameLabel}: ${name}\n${d.contact.emailLabel2}: ${email}\n\n${msg}`
        )}`),
      600
    );
  };

  // 用 Range API 测量「TALKING 的 G」与「INTERESTS 的 S」在标题中的精确位置
  useEffect(() => {
    const measure = () => {
      const h2 = h2Ref.current;
      if (!h2) return;
      const textNode = [...h2.childNodes].find((n) => n.nodeType === Node.TEXT_NODE);
      const full = h2.textContent || "";
      const gIdx = full.indexOf("TALKING") >= 0 ? full.indexOf("TALKING") + 6 : -1;
      if (!textNode || gIdx < 0) return;
      const h2r = h2.getBoundingClientRect();
      const g = document.createRange();
      g.setStart(textNode, gIdx);
      g.setEnd(textNode, gIdx + 1);
      const gr = g.getBoundingClientRect();
      setCardBox({
        left: Math.round(gr.left - h2r.left) + "px",
        right: "0px", // INTERESTS 的尾字母 S 位于标题最右端 → 卡右缘对齐标题右缘
      });
    };
    measure();
    // 字体加载/布局变化时重测（Ebrima 换回字体后字符位置会漂移）
    if (document.fonts?.ready) document.fonts.ready.then(() => measure());
    const ro = new ResizeObserver(() => measure());
    if (h2Ref.current) ro.observe(h2Ref.current);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  /** 左列联系信息（纯文本可复制，无超链接） */
  const infoCol = (
    <div className="flex w-[250px] flex-col gap-8">
      <div>
        <p className="font-ebrima text-xs uppercase tracking-[0.2em] text-muted md:text-sm">
          {d.contact.emailLabel}
        </p>
        <p
          className="mt-2 select-text cursor-text text-lg font-bold text-text-primary md:text-xl"
          style={{ fontFamily: '"Bookman Old Style", "Bookman", Georgia, serif' }}
        >
          {EMAIL}
        </p>
      </div>
      {contactChannels.map((ch) => (
        <div key={ch.id} className="flex flex-col gap-1.5">
          <span className="text-xs uppercase tracking-[0.2em] text-muted md:text-sm">
            {ch.labelZh && (
              <span className="font-deihei normal-case tracking-normal">
                {ch.labelZh}
              </span>
            )}
            {ch.labelZh && " "}
            <span className="font-ebrima">{ch.labelEn}</span>
          </span>
          <p
            className="select-text cursor-text text-lg font-bold text-text-primary md:text-xl"
            style={{ fontFamily: '"Bookman Old Style", "Bookman", Georgia, serif' }}
          >
            <span>{ch.name}</span>
            <span className="mx-1 font-normal text-muted">|</span>
            <span style={{ color: "#404040" }}>{ch.id}</span>
          </p>
        </div>
      ))}
    </div>
  );

  /** 右侧留言卡片（磨砂玻璃；左列 名字+邮箱 / 右列 留言+发送） */
  const cardForm = (
    <form
      onSubmit={handleSend}
      className="flex h-full w-full flex-col justify-center rounded-[32px] border border-white/20 bg-white/[0.07] py-9 px-7 shadow-lg shadow-black/30 backdrop-blur-xl md:px-9 md:py-[64.8px]"
    >
      <div className="flex gap-10">
        {/* 左列：名字 + 邮箱 */}
        <div className="flex w-1/2 flex-col gap-[57.6px]">
          <label className="flex flex-col gap-2">
            <span className="text-xs text-muted">
              <span className="font-deihei">{d.contact.nameLabel}</span>
            </span>
            <input
              name="name"
              type="text"
              required
              placeholder={d.contact.namePh}
              className="font-yahei border-b border-white/40 bg-transparent pb-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-muted/70 focus:border-[#89aacc]"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs text-muted">
              <span className="font-deihei">{d.contact.emailLabel2}</span>
            </span>
            <input
              name="email"
              type="email"
              required
              placeholder={d.contact.emailPh}
              className="font-yahei border-b border-white/40 bg-transparent pb-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-muted/70 focus:border-[#89aacc]"
            />
          </label>
        </div>
        {/* 左右列分隔竖线：两端 30% 中间 80% 渐变，长度比内容高 +20% */}
        <div aria-hidden className="relative hidden w-px self-stretch md:block">
          <span className="absolute inset-y-[-10%] left-0 w-px bg-gradient-to-b from-white/30 via-white/80 to-white/30" />
        </div>
        {/* 右列：留言 + 发送 */}
        <div className="flex w-1/2 flex-col gap-[57.6px]">
          <label className="flex flex-col gap-2">
            <span className="text-xs text-muted">
              <span className="font-deihei">{d.contact.msgLabel}</span>
            </span>
            <textarea
              name="msg"
              required
              rows={1}
              placeholder={d.contact.msgPh}
              className="font-yahei resize-none border-b border-white/40 bg-transparent pb-2.5 text-sm text-text-primary outline-none transition-colors placeholder:text-muted/70 focus:border-[#89aacc]"
            />
          </label>
          <button
            type="submit"
            className="relative w-full cursor-pointer overflow-hidden rounded-full border border-white/15 bg-black/40 py-3.5 text-sm font-medium text-text-primary transition-all duration-200 hover:scale-[1.02] hover:bg-black/60"
            style={{
              fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
              fontWeight: 700,
            }}
          >
            {/* 绿色波浪层：从按钮底部以波浪形式上升填充（顶部液面涌动） */}
            <span aria-hidden className={`send-wave ${sendState !== "idle" ? "on" : ""}`} />
            {/* 「发送」二字：渐隐消失 */}
            <span className={`send-label ${sendState !== "idle" ? "out" : ""}`}>
              {d.contact.send}
            </span>
            {/* ✔：从左边一个点出现 → 向下 45° → 再往右上 45°（两段笔顺，模拟手写打勾） */}
            <svg
              aria-hidden
              className={`send-check ${sendState === "sent" ? "on" : ""}`}
              viewBox="0 0 32 32"
              width="22"
              height="22"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path className="seg1" pathLength={1} d="M7 13.5 L13.5 20" />
              <path className="seg2" pathLength={1} d="M13.5 20 L26 8.5" />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );

  return (
    <section id="contact" className="no-copy relative pb-8 pt-16 md:pb-12 md:pt-20">
      <div className="relative z-10">
        {/* 标题与其下方内容共用 w-fit 容器：
            信息列左缘 = 标题 L 字；卡片左缘 = TALKING 的 G 字、右缘 = INTERESTS 的 S 字、
            底缘 = 信息列最后一行底部（均由真实标题字符测量驱动） */}
        <div className="relative mx-auto w-fit max-w-full">
          <h2
            ref={h2Ref}
            className="mx-auto whitespace-nowrap text-center font-ebrima text-[clamp(22px,3.2vw,52px)] font-bold leading-tight tracking-tight text-text-primary"
          >
            {d.contact.heading}
          </h2>
          <div className="relative mt-12 md:mt-14">
            {/* md+：不可见信息列占位（撑出真实高度） */}
            <div aria-hidden className="pointer-events-none hidden opacity-0 md:block">
              {infoCol}
            </div>
            {/* md+：绝对对齐层（info left-0 / 卡 G..S / 底部对齐最后一行） */}
            <div className="pointer-events-none absolute left-0 top-0 hidden md:block">
              <div className="pointer-events-auto">{infoCol}</div>
            </div>
            <div
              className="pointer-events-none absolute top-0 bottom-0 hidden md:block"
              style={{ left: cardBox.left, right: cardBox.right }}
            >
              <div className="pointer-events-auto h-full">{cardForm}</div>
            </div>
            {/* <md：正常流堆叠 */}
            <div className="flex flex-col items-center gap-10 md:hidden">
              {infoCol}
              {cardForm}
            </div>
          </div>
        </div>

        {/* 底部页脚：可承接项目（徽章）位于版权上方 10px；版权居中 */}
        <div className="mx-auto mt-16 flex h-[96px] max-w-[1500px] flex-col items-center justify-center gap-[10px] px-6 md:px-10 lg:px-16">
          <div className="flex items-center gap-2.5 whitespace-nowrap">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs text-text-primary/90">{d.contact.available}</span>
          </div>
          <p className="whitespace-nowrap text-xs text-text-primary/80">
            © {new Date().getFullYear()} Chen JiaHao. {d.contact.rights}
          </p>
        </div>
      </div>
    </section>
  );
}
