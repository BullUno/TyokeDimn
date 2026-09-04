import { useCallback, useMemo, useState } from "react";
import CircularGallery from "./CircularGallery";
import GradientWaves from "./GradientWaves";
import Lightbox from "./Lightbox";
import PageTitle from "./PageTitle";
import ShapeGrid from "./ShapeGrid";
import { PORTFOLIO_FOLDERS, portfolioImage, portfolioThumb } from "../data/portfolioGallery";
import { useLang } from "../i18n";

/**
 * 全部作品页（#/works）：
 * - “查看全部作品”入口；保留全局头部栏（首页可跳回主页）；
 * - 背景 = 摄影页 → C4D&AE 区域背景配方：向下移动的网格（ShapeGrid direction="down"）
 *   + 向上浮动雾气（GradientWaves，与视觉游乐场同参数）；
 * - 正中心：CircularGallery 圆环画廊（PORTFOLIO 各文件夹，封面=文件夹第一张，下标为卡片名）；
 * - 点击卡片 → 打开与摄影页完全相同的预览窗口（Lightbox，浏览该文件夹全部图片）。
 */
export default function WorksPage() {
  const { d } = useLang();
  const [preview, setPreview] = useState<{ images: string[]; index: number } | null>(null);
  const closePreview = useCallback(() => setPreview(null), []);

  // 画廊素材：每个文件夹一张卡片（封面 = 第 1 张；点击预览该文件夹全部图片）
  const meta = useMemo(
    () =>
      PORTFOLIO_FOLDERS.map((f) => ({
        image: portfolioThumb(f.slug, 1),
        text: f.name,
        gallery: Array.from({ length: f.count }, (_, i) => portfolioImage(f.slug, i + 1)),
      })),
    []
  );
  const items = useMemo(
    () => meta.map(({ image, text }) => ({ image, text })),
    [meta]
  );

  const handleItemClick = useCallback(
    (_item: { image: string; text: string }, index: number) => {
      setPreview({ images: meta[index].gallery, index: 0 });
    },
    [meta]
  );

  // 返回主页摄影区：只清空路由；滚动定位由 App 路由层统一处理（跳走时已记录位置，
  // hashchange 同一同步帧内直接 scrollTo 回去，不回顶部、无平滑、无 80ms 猜测）
  const goBack = useCallback(() => {
    window.location.hash = "";
  }, []);

  return (
    <section className="relative isolate min-h-screen overflow-hidden pt-32 pb-[220px] md:pt-40">
      {/* 背景层 1：向下移动的网格 */}
      <div
        aria-hidden
        className="mask-fade-v pointer-events-none absolute inset-0 -z-10 overflow-hidden [--fade-top:5%] [--fade-bottom:5%]"
      >
        <ShapeGrid
          speed={0.25}
          squareSize={40}
          direction="down"
          borderColor="#16181c"
          hoverFillColor="#697595"
          shape="square"
          hoverTrailAmount={2}
        />
      </div>
      {/* 背景层 2：向上浮动的雾气（与 C4D&AE 视觉游乐场同参数） */}
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
          opacity={1}
          mouseInteraction={true}
          parallaxStrength={0.55}
          grain={true}
          grainIntensity={0.05}
        />
      </div>

      <PageTitle
        title={d.works.allTitle}
        subtitle=""
        back={{ label: d.works.back, onClick: goBack }}
      />

      {/* 正中心：圆环画廊（拖拽/滚轮/方向键翻阅；点击卡片弹出预览） */}
      <div className="relative mx-auto h-[560px] w-full max-w-[1400px] md:h-[640px]">
        <CircularGallery
          items={items}
          bend={6}
          textColor="#ffffff"
          borderRadius={0.1}
          scrollEase={0.06}
          scrollSpeed={2.5}
          font="bold 30px 'Microsoft YaHei', 'PingFang SC', sans-serif"
          onItemClick={handleItemClick}
        />
      </div>

      {/* 提示条：卡片下方、页面底部上方 300px 处居中 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[300px] flex justify-center">
        <span className="select-none text-[18px] text-muted md:text-[21px]">
          Tag：点击卡片查看更多
        </span>
      </div>

      {/* 页脚两行（绿点徽章行 / 版权行）：直接置于页面最底部；
          原封不动复制自页面页脚 —— 同文字大小、同对应间隔（gap-[10px]） */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[16px] flex flex-col items-center gap-[10px]">
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

      {/* 预览窗口：与摄影页卡片点击弹窗完全一致的 Lightbox */}
      <Lightbox
        images={preview?.images ?? null}
        startIndex={preview?.index ?? 0}
        onClose={closePreview}
      />
    </section>
  );
}
