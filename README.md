# 本项目是根据这位大神的项目所动的：Portfolio Cosmic — Michael Smith

单页暗黑风格作品集落地页（"Portfolio Cosmic" 模板复刻），
基于 React + Vite + Tailwind CSS + TypeScript + GSAP + Framer Motion + hls.js。

## 功能

- 加载页：000→100 rAF 计数器、轮播词（Design / Create / Inspire）、渐变进度条
- Hero：Mux HLS 视频背景（hls.js / 原生 HLS 双模式）、GSAP 入场、角色词 2s 轮换、
  渐变描边按钮、滚动指示器
- 固定悬浮胶囊导航（logo 渐变环、scrollspy、平滑滚动、Say hi 渐变描边）
- Selected Works：Bento 网格（7/5/5/7 跨列）、半调网点遮罩、悬停毛玻璃 + 渐变描边标签
- Journal：胶囊形条目列表（标题 / 图片 / 日期 / 阅读时长）
- Explorations：300vh 区间 GSAP ScrollTrigger 钉住 + 双列速度差视差画廊，
  点击卡片打开 Lightbox（Esc 关闭）；小屏自动降级为流式画廊
- Stats：20+ / 95+ / 200% 三列数据
- Contact：倒置 HLS 视频背景、GSAP 无限滚动 Marquee、
  mailto 按钮、社交链接、绿色呼吸点 "Available for projects"

## 本地运行

```bash
pnpm install
pnpm dev      # http://127.0.0.1:5173
```

生产构建：

```bash
pnpm build
pnpm preview
```

## 目录

- `src/components`：页面组件（LoadingScreen / Navbar / Hero / Works / Journal /
  Explorations / Stats / Contact / Lightbox / SectionHeader）
- `src/data.ts`：站点内容（作品、日志、探索画廊、数据、社交链接）
- `src/lib`：GSAP 注册与平滑滚动、HLS 视频 hook
- `public/assets`：占位图片与视频海报
- `scripts/shoot.mjs`：无头 Chrome CDP 截图验证脚本（dev server + 调试端口 9222）

## 说明

作品与日志图片为现有暗调占位素材，直接替换 `public/assets` 或
`src/data.ts` 中的路径即可换成真实作品图。HLS 视频源在 `src/data.ts` 的
`HLS_URL` 中。
