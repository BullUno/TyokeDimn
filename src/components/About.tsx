import { Fragment } from "react";
import { motion } from "framer-motion";
import { useLang } from "../i18n";
import BorderGlow from "./BorderGlow";
import GhostFibers from "./GhostFibers";
import GlareHover from "./GlareHover";

const ease = [0.25, 0.1, 0.25, 1] as const;

/** 数据卡与三张经历卡共用的 BorderGlow 参数 */
const cardGlowProps = {
  backgroundColor: "rgba(0, 5, 16, 0.45)",
  glowColor: "234 96 75",
  borderRadius: 16,
  glowRadius: 48,
  edgeSensitivity: 30,
  glowIntensity: 1.6,
  coneSpread: 25,
  colors: ["#848ffc", "#72e5f4", "#f83838"],
  fillOpacity: 0.65,
};

export default function About() {
  const { d } = useLang();
  const a = d.about;

  const cells = [
    a.info.identity,
    a.info.service,
    a.info.phone,
    a.info.email,
  ];

  return (
    <section id="about" className="no-copy relative isolate bg-[#00040a] pt-16 pb-24 md:pt-[68px] md:pb-32">
      {/* GhostFibers 背景层：铺满整个 About 区块（props 严格按示例代码；亮度 20%；上下 16% 渐隐蒙版保证过渡顺滑） */}
      <div
        aria-hidden
        className="mask-fade-v pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-[0.2] [--fade-top:16%] [--fade-bottom:16%]"
      >
        <GhostFibers
          lineColor="#0e2435"
          glowColor="#349da0"
          speed={0.2}
          scale={2}
          rotation={-77}
          rotationSpeed={0.23}
          layers={3}
          waveAmplitude={0.03}
          waveFrequency={3.45}
          waveSpeed={-0.25}
          layerSpeed={0.08}
          twist={0.1}
          twistFrequency={6.2}
          twistSpeed={1.05}
          lineFrequency={5}
          lineSpacing={2}
          lineSharpness={6.5}
          glowFalloff={14.75}
          glowIntensity={1.75}
          brightness={1.45}
          blueBoost={1.28}
          vignette={0.43}
          grain={0.0325}
          dpr={1}
        />
      </div>
      {/* 顶部过渡蒙版：承接 hero 底部渐变，让色调跨边界连续滑动 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-black/55 to-transparent md:h-56"
      />
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-16">
        {/* 左：照片；右：介绍 */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-16 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease }}
            className="md:col-span-5"
          >
            <div className="overflow-hidden rounded-[28px] border border-stroke bg-surface">
              {/* GlareHover：小猫头像卡片悬停眩光（保持原卡片外观：28px 圆角/stroke 边框/4:5 图片裁剪） */}
              <GlareHover
                width="100%"
                height="auto"
                background="transparent"
                borderRadius="28px"
                borderColor="transparent"
                glareColor="#ffffff"
                glareOpacity={0.35}
                glareAngle={-30}
                glareSize={250}
                transitionDuration={650}
                className="w-full"
              >
                <img
                  src="/assets/about-cat.webp"
                  alt={a.photoAlt}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
              </GlareHover>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.12, ease }}
            className="md:col-span-7"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-[#89aacc]">
              {a.eyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text-primary md:text-5xl lg:text-[56px] lg:leading-[1.1]">
              {a.heading}
            </h2>

            <p className="mt-6 max-w-xl text-sm leading-relaxed text-muted md:text-base">
              {a.slogan}
            </p>

            {/* 信息表：当前身份 / 服务方向 / 手机 / 邮箱（简洁排版，无框架） */}
            <div className="mt-10 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8">
              {cells.map((cell) => (
                <div key={cell.label}>
                  <p className="text-xs text-muted">{cell.label}</p>
                  <p className="mt-2 text-sm text-text-primary md:text-base">
                    {cell.value}
                  </p>
                </div>
              ))}
            </div>

            {/* 数据：8+ 项目落地 / 30+ 参与项目（BorderGlow 卡片 + 中间渐细渐变分隔线） */}
            <div className="mt-10 w-fit">
              <BorderGlow
                className="glass-frost"
                {...cardGlowProps}
              >
                <div className="flex items-center px-7 py-5 md:px-10 md:py-6">
                  {a.stats.map((s, i) => (
                    <Fragment key={s.label}>
                      <div>
                        <p className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
                          {s.value}
                        </p>
                        <p className="mt-2 text-xs text-muted">{s.label}</p>
                      </div>
                      {i < a.stats.length - 1 && (
                        <svg
                          aria-hidden
                          className="mx-8 h-14 w-[10px] shrink-0 md:mx-12 md:h-16"
                          viewBox="0 0 3 80"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id="td-stat-divider" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
                              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.7" />
                              <stop offset="1" stopColor="#ffffff" stopOpacity="0.3" />
                            </linearGradient>
                          </defs>
                          {/* 两端细、中间粗的纺锤形分隔线 */}
                          <path
                            d="M1.5 1 C 0.8 14, 0.8 66, 1.5 79 C 2.2 14, 2.2 66, 1.5 1 Z"
                            fill="url(#td-stat-divider)"
                          />
                        </svg>
                      )}
                    </Fragment>
                  ))}
                </div>
              </BorderGlow>
            </div>

            {/* 项目标签 */}
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-[0.3em] text-muted">
                {a.tagsLabel}
              </span>
              <span className="ml-auto text-xs text-muted">{a.tagsHint}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {a.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-stroke bg-surface px-4 py-1.5 text-xs text-text-primary md:text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* 职业路径 / 工作经历（整体上移 20px，缩短 About 总高） */}
        <div className="mt-[76px] md:mt-[108px]">
          {/* 标签行：职业轨迹（左）/ 工作经历（右），位于线上方、左右对称 */}
          <div className="mb-8 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-[0.3em] text-muted">
              {a.career.eyebrow}
            </span>
            <h3 className="font-display text-2xl tracking-tight text-text-primary">
              {a.career.title}
            </h3>
          </div>
          {/* 时间线：线 + 三个 ✦ 刻度（左 / 中 / 右） */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-px bg-stroke md:block" />
            <span
              aria-hidden
              className="absolute left-0 top-0 hidden -translate-y-1/2 text-[#89aacc]/80 md:block"
            >
              ✦
            </span>
            <span
              aria-hidden
              className="absolute left-1/2 top-0 hidden -translate-y-1/2 text-[#89aacc]/80 md:block"
            >
              ✦
            </span>
            <span
              aria-hidden
              className="absolute right-0 top-0 hidden -translate-y-1/2 text-[#89aacc]/80 md:block"
            >
              ✦
            </span>
          </div>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-x-12 md:gap-y-12 lg:gap-x-16">
              {a.career.entries.map((e, i) => (
                <motion.article
                  key={`${e.company}-${i}`}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    ease,
                  }}
                  className="pt-6 md:pt-8 h-full"
                >
                  <BorderGlow
                    className="h-full glass-frost"
                    {...cardGlowProps}
                  >
                    <div className="flex h-full flex-col p-5 md:p-6">
                      <p className="text-sm text-muted">{e.period}</p>
                      <h4 className="mt-2 text-base font-semibold text-text-primary md:text-lg">
                        {e.company}
                      </h4>
                      <span className="mt-3 inline-flex w-fit rounded-full border border-stroke bg-surface px-3 py-1 text-xs text-[#89aacc]">
                        {e.role}
                      </span>
                      <p className="mt-4 text-sm leading-relaxed text-muted">
                        {e.desc}
                      </p>
                    </div>
                  </BorderGlow>
                </motion.article>
              ))}
            </div>
        </div>
      </div>
    </section>
  );
}
