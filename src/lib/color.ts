/**
 * 共享颜色工具。
 * hexToRgb：hex → [r, g, b]（0-1 归一化数组）。
 * 支持 #rgb / #rrggbb / 无 # 前缀形式；解析失败回退白色 [1, 1, 1]。
 * 由 SideRays / GhostFibers / GradientWaves 统一使用（原三处重复实现，
 * 对既有调用点（均为 6 位 #rrggbb 输入）行为完全一致）。
 */
export const hexToRgb = (hex: string): number[] => {
  let c = String(hex).trim();
  if (c[0] === "#") c = c.slice(1);
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const m = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [1, 1, 1];
};
