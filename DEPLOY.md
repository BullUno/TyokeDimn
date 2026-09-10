# 部署说明

## 一、GitHub Pages（推荐）

1. 把本仓库推送到 GitHub（`main` 分支）。
2. 打开仓库 **Settings → Pages**，把 **Source** 设为 **GitHub Actions**。
   > 这一步必须先做。否则 `.github/workflows/deploy.yml` 的 deploy 步骤会因为 Pages 未启用而失败。
3. 推送代码后，Actions 会自动执行 `pnpm install --frozen-lockfile` → `pnpm build` → 发布 `dist/`。
4. 发布地址形如 `https://<用户名>.github.io/<仓库名>/`。

## 二、其它静态托管（腾讯云 CloudBase / 自有服务器等）

在本地执行：

```bash
pnpm install
pnpm build
```

然后把 `dist/` 目录整体上传到静态托管的根目录即可。

## 三、资源路径为什么在任意部署路径下都能正常工作

`vite.config.js` 里 `base: "./"`，HTML / CSS / 打包资源的路径由 Vite 自动重写为相对路径。

但 `public/` 下的图片与视频是由**运行时字符串**引用的（见 `src/data.ts`、`src/data/portfolioGallery.ts`、
`src/components/Lightbox.tsx`、`src/components/About.tsx`），Vite **不会**重写这类字符串。
因此统一通过 `src/lib/assetUrl.ts` 的 `ASSET_BASE`（= `import.meta.env.BASE_URL`）拼接，
让资源 URL 跟随 `base`，从而同时兼容：

- 域名根部署 `https://example.com/`
- 子路径部署（GitHub Pages 项目站点）`https://<用户名>.github.io/<仓库名>/`
- 自定义域名部署

> `FULL_SIZES`（`src/data.ts`）里的键是**规范路径**（以 `/assets/...` 开头），
> 只用于查表、不作为 URL 使用；查询请统一走 `fullSizeOf()`，它会自动归一化前缀。

## 四、仓库体积提示

`public/` 约 **265 MB**（351 个文件），其中 3 个视频较大：

| 文件 | 大小 |
|---|---|
| `public/assets/videos/wo-nihao.mp4` | 49.3 MB |
| `public/assets/videos/gov34.mp4` | 48.7 MB |
| `public/assets/videos/dengge.mp4` | 42.6 MB |

GitHub 单文件硬上限为 100 MB、超 50 MB 会告警，上述文件均在限制内；
GitHub Pages 站点体积上限为 1 GB，也在限制内。若日后需要缩减，可对这三个视频重新转码。

## 五、本地开发

```bash
pnpm install
pnpm dev     # http://127.0.0.1:5173
```
