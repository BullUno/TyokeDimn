import type { JSX } from "react";

export interface ShapeGridProps {
  direction?: "diagonal" | "up" | "right" | "down" | "left";
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  shape?: "square" | "hexagon" | "circle" | "triangle";
  hoverTrailAmount?: number;
  className?: string;
}

declare const ShapeGrid: (props: ShapeGridProps) => JSX.Element;
export default ShapeGrid;
