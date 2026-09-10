import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // 相对路径资源引用：兼容 GitHub Pages 项目站点（/repo-name/ 子路径）与任意子目录部署
  base: "./",
  resolve: {
    extensions: [".mts", ".ts", ".tsx", ".mjs", ".js", ".jsx", ".json"],
  },
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          motion: ["framer-motion"],
          // 3D 引擎独立 chunk：主包（React/GSAP/站点代码）解析更轻；
          // three（LaserFlow 光柱）与 ogl（作品页画廊）改动频率低 → 长缓存友好
          three: ["three"],
          ogl: ["ogl"],
        },
      },
    },
  },
  // 依赖预构建缓存放 tmp/：本机 node_modules 被 Codex 沙箱 ACL 写保护（node_modules/.vite 不可写）
  cacheDir: "tmp/.vite-cache",
  server: {
    host: "127.0.0.1",
    port: 5173,
    // 忽略编辑器原子写产生的临时目录（.文件名.<pid>.<uuid>.tmpdir），
    // 避免 Windows 上 chokidar 对临时文件 watch 时触发 EBUSY 导致 dev server 崩溃
    watch: {
      ignored: [
        "**/.*.tmpdir/**",
        "**/tmp/**",
        "**/shots/**",
        "**/.pnpm-store/**",
        // 依赖库 = 共享依赖库的 junction（位于项目根下）：
        // 其他项目/校验进程写入会导致 vite 不断触发整页 reload（页面卡在加载屏），必须排除
        "**/依赖库/**",
        "**/共享依赖库/**",
        // PORTFOLIO = 作品源图目录（外部软件会锁定其中的 psd 等文件：
        // EBUSY 会让 vite watcher 崩溃、dev server 退出），不作为开发监听对象
        "**/PORTFOLIO/**",
        // public/assets：只读静态资源（图片/视频可能被浏览器或外部进程锁定 →
        // EBUSY 同样会让 watcher 崩溃）；public 内容变更不需要 HMR，直接排除
        "**/public/assets/**",
      ],
    },
  },
});
