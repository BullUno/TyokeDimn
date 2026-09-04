/**
 * 全部作品页（#/works）圆环画廊数据集。
 * 图片由 scripts/侧批处理从 PORTFOLIO/ 源目录重编码而来：
 *   public/assets/works/portfolio/<slug>/<n>.webp      （全图，宽≤2400，点击预览用）
 *   public/assets/works/portfolio/<slug>/<n>-w900.webp （900w 缩略图，卡片封面用）
 * 每个文件夹第一张（按文件名数字感知排序）为卡片封面；点击卡片 → 该文件夹全部图片预览。
 */

export interface PortfolioFolder {
  /** 卡片下方显示名称 */
  name: string;
  /** 输出目录 slug */
  slug: string;
  /** 该文件夹图片数 */
  count: number;
}

export const PORTFOLIO_FOLDERS: PortfolioFolder[] = [
  { name: "SNC 2.0", slug: "snc2", count: 19 },
  { name: "广州旋律电堂", slug: "gzfxdt", count: 5 },
  { name: "海珠万达3GXP日落城景", slug: "hzwd3gxp", count: 7 },
  { name: "Crazy Soil首场Emoji dance", slug: "crazysoil", count: 13 },
  { name: "人像 I", slug: "portrait1", count: 4 },
  { name: "人像 II", slug: "portrait2", count: 4 },
  { name: "写真 I", slug: "xz1", count: 5 },
  { name: "写真 II", slug: "xz2", count: 2 },
  { name: "写真 III", slug: "xz3", count: 4 },
  { name: "扫街", slug: "street", count: 16 },
  { name: "风光", slug: "landscape", count: 9 },
  { name: "儿童摄影 I", slug: "kids1", count: 4 },
  { name: "儿童摄影(杂项)", slug: "kids-misc", count: 3 },
];

/** 全图 URL（预览窗口） */
export const portfolioImage = (slug: string, n: number) =>
  `/assets/works/portfolio/${slug}/${n}.webp`;

/** 900w 缩略图 URL（卡片封面） */
export const portfolioThumb = (slug: string, n: number) =>
  `/assets/works/portfolio/${slug}/${n}-w900.webp`;
