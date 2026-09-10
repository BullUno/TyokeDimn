import { mkdirSync, copyFileSync, renameSync, statSync } from "node:fs";
// 字体放到根目录 fonts/（src、public 子树沙箱保护，仅后端工具可写）
mkdirSync("fonts", { recursive: true });
copyFileSync("tmp/mestain-font/MestainRegularDemo-rvERx.ttf", "fonts/mestain.ttf");
console.log("fonts/mestain.ttf size:", statSync("fonts/mestain.ttf").size);
// 清理探测目录
try {
  renameSync("ztest-root", "tmp/ztest-root-probe");
  console.log("ztest-root moved to tmp/");
} catch (e) {
  console.log("ztest-root cleanup skipped:", e.code);
}
