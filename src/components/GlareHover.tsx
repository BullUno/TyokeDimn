import type { CSSProperties, ReactNode } from "react";

import "./GlareHover.css";

/* GlareHover —— React Bits (https://reactbits.dev) JS+CSS 变体，类型化移植 */

interface GlareHoverProps {
  /** 容器宽度 */
  width?: string;
  /** 容器高度 */
  height?: string;
  /** 容器背景色 */
  background?: string;
  /** 容器圆角 */
  borderRadius?: string;
  /** 容器边框色 */
  borderColor?: string;
  /** 内部内容 */
  children?: ReactNode;
  /** 眩光颜色（hex） */
  glareColor?: string;
  /** 眩光不透明度 (0-1) */
  glareOpacity?: number;
  /** 眩光角度（度） */
  glareAngle?: number;
  /** 眩光尺寸（百分比，250 = 250%） */
  glareSize?: number;
  /** 过渡时长（毫秒） */
  transitionDuration?: number;
  /** 仅悬停时播放、移出不返回 */
  playOnce?: boolean;
  className?: string;
  style?: CSSProperties;
}

const GlareHover = ({
  width = "500px",
  height = "500px",
  background = "#000",
  borderRadius = "10px",
  borderColor = "#333",
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = "",
  style = {},
}: GlareHoverProps) => {
  const hex = glareColor.replace("#", "");
  let rgba = glareColor;
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const vars: Record<string, string> = {
    "--gh-width": width,
    "--gh-height": height,
    "--gh-bg": background,
    "--gh-br": borderRadius,
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-size": `${glareSize}%`,
    "--gh-rgba": rgba,
    "--gh-border": borderColor,
  };

  return (
    <div
      className={`glare-hover ${playOnce ? "glare-hover--play-once" : ""} ${className}`}
      style={{ ...vars, ...style } as CSSProperties}
    >
      {children}
    </div>
  );
};

export default GlareHover;
