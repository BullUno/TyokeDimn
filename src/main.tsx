import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 禁用浏览器滚动恢复：刷新（即使此前滚动到页面中下段）也始终从顶部开始，
// 保证加载页与 hero 的位置测量基于首屏坐标
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
