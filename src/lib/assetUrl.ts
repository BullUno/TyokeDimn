/**
 * 资源 URL 基址 —— 跟随 Vite 的 base 配置（本项目 vite.config.js 为 base: "./"）。
 *
 * 为什么需要它：public/ 下的图片与视频由「运行时字符串」引用（见 data.ts / portfolioGallery.ts /
 * Lightbox.tsx / About.tsx），Vite 只会重写 HTML、CSS 与 import 形式的资源路径，
 * **不会**重写这类字符串。若直接写死 "/assets/..."，页面部署在子路径时
 * （例如 GitHub Pages 项目站点 https://<用户名>.github.io/<仓库名>/）
 * 浏览器会去域名根目录请求 → 全部 404。
 *
 * 拼接 base 后，以下三种部署方式都能正确定位：
 *   ① 域名根部署           https://example.com/
 *   ② 子路径部署（GitHub Pages 项目站点）
 *   ③ 自定义域名部署
 */
export const ASSET_BASE = import.meta.env.BASE_URL;

/** 把规范资产路径（形如 "/assets/xxx"）转成 base 感知的 URL */
export const assetUrl = (path: string) =>
  `${ASSET_BASE}${path.replace(/^\//, "")}`;
