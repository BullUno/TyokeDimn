/** 导航锚点（展示文字在 i18n 词典内） */
export interface NavLink {
  id: "home" | "about" | "work";
}

export const scrollLinks: NavLink[] = [
  { id: "home" },
  { id: "about" },
  { id: "work" },
];

export interface Project {
  image: string;
  /** 悬停标签（中文） */
  label: string;
  /** 悬停标签（英文） */
  labelEn: string;
  /** 该卡片对应路径下的全部图片（预览可前后浏览） */
  gallery: string[];
  span: string;
  aspect: string;
}

/** 目录内全部图片 → 按原始文件名顺序生成 URL */
const gallery = (dir: string, files: string[]) =>
  files.map((f) => `/assets/works/${dir}/${f}`);

/** 900w 缩略档 URL（srcset 低档 + 弹窗缩略图，与全尺寸同名加 -w900） */
export const thumbOf = (src: string) => src.replace(/\.webp$/i, "-w900.webp");

/** 1200w 中档 URL（srcset 中档：高分屏/大视口避免抓取全尺寸大图） */
export const midOf = (src: string) => src.replace(/\.webp$/i, "-w1200.webp");

/** 2400w 显示档 URL（灯箱展示：显示宽度 ≤1100px，无需全尺寸原图；非 works 区域返回原图） */
export const displayOf = (src: string) =>
  src.startsWith("/assets/works/") ? src.replace(/\.webp$/i, "-w2400.webp") : src;

/** 全尺寸图片宽高（srcset w 描述符与弹窗窗口宽度计算，取自 WebP 文件头） */
export const FULL_SIZES: Record<string, { w: number; h: number }> = {
  "/assets/works/cinematic/LAS_YC1.webp": { w: 6000, h: 4000 },
  "/assets/works/cinematic/LAS_YC3.webp": { w: 6000, h: 4000 },
  "/assets/works/cinematic/LAS_YC4.webp": { w: 4000, h: 6000 },
  "/assets/works/cinematic/LAS_YC5.webp": { w: 6000, h: 4000 },
  "/assets/works/kids/P_T_0312.webp": { w: 4000, h: 6000 },
  "/assets/works/kids/P_T_0316.webp": { w: 5646, h: 3764 },
  "/assets/works/kids/P_T_0325.webp": { w: 5646, h: 3764 },
  "/assets/works/kids/P_T_0329.webp": { w: 4000, h: 6000 },
  "/assets/works/kids/家琪2.webp": { w: 4000, h: 6000 },
  "/assets/works/kids/紫嫣2.webp": { w: 4000, h: 6000 },
  "/assets/works/kids/英硕2.webp": { w: 4000, h: 5680 },
  "/assets/works/melody/P_T_1498.webp": { w: 6000, h: 4000 },
  "/assets/works/melody/P_T_1690.webp": { w: 4376, h: 3882 },
  "/assets/works/melody/P_T_1691.webp": { w: 4000, h: 6000 },
  "/assets/works/melody/P_T_1693.webp": { w: 6000, h: 4000 },
  "/assets/works/melody/P_T_1697.webp": { w: 4000, h: 6000 },
  "/assets/works/snc2/P_T_4473.webp": { w: 4801, h: 3201 },
  "/assets/works/snc2/P_T_4621.webp": { w: 2848, h: 4272 },
  "/assets/works/snc2/P_T_4653.webp": { w: 4000, h: 6000 },
  "/assets/works/snc2/P_T_5590.webp": { w: 3627, h: 2664 },
  "/assets/works/snc2/P_T_5965.webp": { w: 2848, h: 4272 },
  "/assets/works/snc2/P_T_6314.webp": { w: 2659, h: 3989 },
  "/assets/works/snc2/P_T_7194.webp": { w: 4272, h: 2848 },
  "/assets/works/snc2/P_T_7392.webp": { w: 4272, h: 2848 },
  "/assets/works/snc2/P_T_7445.webp": { w: 3883, h: 2589 },
  "/assets/works/snc2/P_T_7546.webp": { w: 3778, h: 2519 },
  "/assets/works/snc2/P_T_7724.webp": { w: 4272, h: 2848 },
  "/assets/works/snc2/P_T_8053_拷贝.webp": { w: 4096, h: 2731 },
  "/assets/works/snc2/P_T_8423.webp": { w: 6000, h: 4000 },
  "/assets/works/snc2/P_T_9006-DeNoiseAI-low-light.webp": { w: 4000, h: 6000 },
  "/assets/works/snc2/P_T_9299.webp": { w: 4931, h: 3287 },
  "/assets/works/snc2/P_T_9410.webp": { w: 6000, h: 4000 },
  "/assets/works/snc2/P_T_9422.webp": { w: 3410, h: 5114 },
  "/assets/works/snc2/P_T_9427.webp": { w: 3410, h: 5114 },
  "/assets/works/snc2/P_T_9429.webp": { w: 3410, h: 5114 },
};

/** 四卡布局（宽/窄两种） */
const SPAN_WIDE = "md:col-span-7";
const SPAN_NARROW = "md:col-span-5";
const ASPECT_WIDE = "aspect-[4/3] md:aspect-[7/5]";
const ASPECT_SQUARE = "aspect-[4/3] md:aspect-square";

export const projects: Project[] = [
  {
    image: "/assets/works/snc2/P_T_4473.webp",
    label: "活动摄影",
    labelEn: "Event Photography",
    gallery: gallery("snc2", [
      "P_T_4473.webp",
      "P_T_4621.webp",
      "P_T_4653.webp",
      "P_T_5590.webp",
      "P_T_5965.webp",
      "P_T_6314.webp",
      "P_T_7194.webp",
      "P_T_7392.webp",
      "P_T_7445.webp",
      "P_T_7546.webp",
      "P_T_7724.webp",
      "P_T_8053_拷贝.webp",
      "P_T_8423.webp",
      "P_T_9006-DeNoiseAI-low-light.webp",
      "P_T_9299.webp",
      "P_T_9410.webp",
      "P_T_9422.webp",
      "P_T_9427.webp",
      "P_T_9429.webp",
    ]),
    span: SPAN_WIDE,
    aspect: ASPECT_WIDE,
  },
  {
    image: "/assets/works/melody/P_T_1693.webp",
    label: "人像摄影",
    labelEn: "Portrait Photography",
    gallery: gallery("melody", [
      "P_T_1498.webp",
      "P_T_1690.webp",
      "P_T_1691.webp",
      "P_T_1693.webp",
      "P_T_1697.webp",
    ]),
    span: SPAN_NARROW,
    aspect: ASPECT_SQUARE,
  },
  {
    image: "/assets/works/cinematic/LAS_YC4.webp",
    label: "写真",
    labelEn: "Photo Session",
    gallery: gallery("cinematic", [
      "LAS_YC1.webp",
      "LAS_YC3.webp",
      "LAS_YC4.webp",
      "LAS_YC5.webp",
    ]),
    span: SPAN_NARROW,
    aspect: ASPECT_SQUARE,
  },
  {
    image: "/assets/works/kids/P_T_0316.webp",
    label: "儿童摄影",
    labelEn: "Kids Photography",
    gallery: gallery("kids", [
      "P_T_0312.webp",
      "P_T_0316.webp",
      "P_T_0325.webp",
      "P_T_0329.webp",
      "家琪2.webp",
      "紫嫣2.webp",
      "英硕2.webp",
    ]),
    span: SPAN_WIDE,
    aspect: ASPECT_WIDE,
  },
];

export interface JournalEntry {
  video: string;
  poster: string;
  /** 悬停预览卡片图 */
  preview: string;
}

/** 视觉游乐场视频（左列 C4D、右列 AE） */
export const explorationVideos = {
  c4d: [
    { video: "/assets/videos/c4d-1.mp4", title: "循环动画" },
    { video: "/assets/videos/c4d-2.mp4", title: "柔体" },
    { video: "/assets/videos/c4d-3.mp4", title: "树枫红叶" },
  ],
  ae: [
    { video: "/assets/videos/ae-1.mp4", title: "5G城市" },
    { video: "/assets/videos/ae-2.mp4", title: "奥运会开幕" },
    { video: "/assets/videos/ae-3.mp4", title: "靖江诗文" },
  ],
};

/** 摄像页短片（顺序：你看不见吗 → 我，你好 → 等哥的一天）
 *  悬停预览图使用 900px WebP（原 PNG/JPG 高达 13.8MB，显示仅 300~420px 宽，严重拖慢首触） */
export const journal: JournalEntry[] = [
  { video: "/assets/videos/gov34.mp4", poster: "/assets/videos/gov34-poster.webp", preview: "/assets/videos/preview1.webp" },
  { video: "/assets/videos/wo-nihao.mp4", poster: "/assets/videos/wo-nihao-poster.webp", preview: "/assets/videos/preview2.webp" },
  { video: "/assets/videos/dengge.mp4", poster: "/assets/videos/dengge-poster.webp", preview: "/assets/videos/preview3.webp" },
];

/** 联系邮箱（页脚 E-MAIL 行 + 留言卡片提交） */
export const EMAIL = "eleveneighteen@126.com";

/** 页脚联系渠道（与参考图一致：小红书 / B站 / 抖音；labelZh 用得意黑、labelEn 用 Ebrima） */
export interface ContactChannel {
  labelZh: string;
  labelEn: string;
  name: string;
  id: string;
  href: string;
}

export const contactChannels: ContactChannel[] = [
  {
    labelZh: "小红书",
    labelEn: "/RED BOOK",
    name: "Tyoke",
    id: "ID:2276983932",
    href: "",
  },
  {
    labelZh: "",
    labelEn: "BILIBILI",
    name: "TyokeDimn",
    id: "UID:375866918",
    href: "",
  },
  {
    labelZh: "抖音",
    labelEn: "/TikTok",
    name: "Tyoke",
    id: "ID:OoooooooPass",
    href: "",
  },
];
