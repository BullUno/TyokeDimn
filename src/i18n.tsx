import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "zh";

export interface JournalDictEntry {
  title: string;
  /** 职责标签（显示在日期前，顿号分隔） */
  roles: string[];
  date: string;
  readTime: string;
}

export interface Dict {
  meta: { title: string; description: string };
  nav: {
    toggleAria: string; // 按钮无障碍标签（当前语言状态下点击后的含义）
    links: { home: string; work: string; about: string };
    sayHi: string;
  };
  hero: {
    eyebrow: string;
    rolePrefix: string; // "A " / "一名 "
    roles: [string, string]; // [Photographer, Cameraman]
    livesIn: string;
    tagline: string;
    seeWorks: string;
    reachOut: string;
    scroll: string;
  };
  about: {
    eyebrow: string;
    heading: string;
    slogan: string;
    info: {
      identity: { label: string; value: string };
      service: { label: string; value: string };
      phone: { label: string; value: string };
      email: { label: string; value: string };
    };
    stats: { value: string; label: string }[];
    tagsLabel: string;
    tagsHint: string;
    tags: string[];
    career: {
      eyebrow: string;
      title: string;
      entries: {
        period: string;
        company: string;
        role: string;
        desc: string;
      }[];
    };
    photoAlt: string;
  };
  works: {
    title: string;
    subtitle: string;
    viewAll: string;
    allTitle: string;
    allSubtitle: string;
    back: string;
    scroll: string;
    projects: string[];
  };
  journal: {
    title: string;
    subtitle: string;
    entries: JournalDictEntry[];
  };
  explorations: {
    eyebrow: string;
    titleA: string;
    titleB: string;
    subtitle: string;
    welcome: string;
    createTogether: string;
    alt: string;
  };
  contact: {
    heading: string;
    emailLabel: string;
    nameLabel: string;
    namePh: string;
    emailLabel2: string;
    emailPh: string;
    msgLabel: string;
    msgPh: string;
    send: string;
    available: string;
    rights: string;
  };
  lightbox: { alt: string; prev: string; next: string; broken: string };
}

const en: Dict = {
  meta: {
    title: "TyokeDimn | Portfolio",
    description:
      "Tyoke Dimn — creative photographer & cameraman based in Guangdong. Catch the strongest moment in the cracks of time.",
  },
  nav: {
    toggleAria: "切换到中文",
    links: { home: "Home", work: "Work", about: "About" },
    sayHi: "Say hi",
  },
  hero: {
    eyebrow: "PORTFOLIO Web",
    rolePrefix: "A ",
    roles: ["Photographer", "Cameraman"],
    livesIn: " lives in GuangDong",
    tagline:
      "Catch the strongest moment in the cracks of time — let judgment press the shutter, and let the frame do the talking",
    seeWorks: "See Works",
    reachOut: "Reach out...",
    scroll: "Scroll",
  },
  about: {
    eyebrow: "About me",
    heading: "Hi, I am Chen JiaHao!",
    slogan:
      "With the lens I seize every fleeting moment — before light and shadow, judgment comes first. I don't just record images; I build the visual logic of a frame from 0 to 1, so every shot carries emotional weight and every finished piece honors every second of the scene.",
    info: {
      identity: { label: "Current role", value: "Photographer" },
      service: {
        label: "Services",
        value: "Event Photography / Portrait / Short Film",
      },
      phone: { label: "Phone", value: "137****1451" },
      email: { label: "Email", value: "eleveneighteen@126.com" },
    },
    stats: [
      { value: "8+", label: "Projects delivered" },
      { value: "30+", label: "Projects involved" },
    ],
    tagsLabel: "Now building",
    tagsHint: "Tags",
    tags: [
      "Event Photography",
      "Short Film",
      "Portrait",
      "Landscape",
      "Daily Doc",
      "Chreey Studio",
      "Codex",
      "Deepseek Harness",
    ],
    career: {
      eyebrow: "Career path",
      title: "Work Experience",
      entries: [
        {
          period: "2024.6-2024.8",
          company: "Dongguan Radio and Television Station",
          role: "On-site Interview Photographer (Part-time)",
          desc: "Accompanied reporters on street interviews and shot the interview footage; followed interview outlines to keep questioning children while observing their expression and camera response, pre-screening eligible participants; introduced the event process and follow-up to parents, collected contact info with consent, and filed interested families for later interview invitations; organized, annotated and handed over daily footage to ensure complete, clearly documented material and a smooth handoff to the post-production team.",
        },
        {
          period: "2025.6-2025.8",
          company: "Dongguan Shiyi Photography Studio",
          role: "Photography Assistant (Intern)",
          desc: "Advised customers on outfit pairings and assisted with fittings and styling to match each client's needs; guided customers through the shooting flow — posing cues, mood and cooperation — improving efficiency and client experience; supported the photographer with set building, lighting adjustments and equipment preparation to keep sessions smooth and orderly.",
        },
        {
          period: "2025.5-2026.7",
          company: "Longxin (Huizhou) Business Media Co., Ltd.",
          role: "Intern Photographer",
          desc: "Handled the studio's portrait photography business — receiving clients, discussing shooting needs and joining proposal negotiations; independently ran the full process from shooting plan and on-site capture to retouching. Shot multiple events including [Melody Reactor DJ] and [Crazy Soul Emoji dance], with sets used for event teasers that helped pre-event exposure reach 1,000+ reads, 60% above the same track. As event photographer at [SNC 2.0 DJ], captured international DJs (incl. an all-female DJ set) and the crowd atmosphere, independently selecting, retouching and color-grading — the delivered images were used by the organizer for official promotion.",
        },
      ],
    },
    photoAlt: "Chen JiaHao",
  },
  works: {
    title: "Photography",
    subtitle: "A selection of my featured photography projects.",
    viewAll: "View all work",
    allTitle: "All Works",
    allSubtitle: "Every photo tells a moment.",
    back: "Back",
    scroll: "Scroll",
    projects: [
      "Automotive Motion",
      "Urban Architecture",
      "Human Perspective",
      "Brand Identity",
    ],
  },
  journal: {
    title: "Videography",
    subtitle: "A selection of the short film projects I've worked on.",
    entries: [
      { title: "Can't You See", roles: ["Camera B", "Lighting", "Poster"], date: "SHOT TO LUMIX S1RII", readTime: "Short film" },
      { title: "Hello, Me", roles: ["Director", "Writer", "Camera", "Post"], date: "SHOT TO LUMIX S5MIIX", readTime: "Short film" },
      { title: "A Day of Deng-ge", roles: ["Producer", "Director", "Cast", "Post"], date: "SHOT TO LUMIX S5MIIX", readTime: "Short film" },
    ],
  },
  explorations: {
    eyebrow: "Explorations",
    titleA: "←C4D &",
    titleB: "AE→",
    subtitle: "This is Cinema 4D and Adobe After Effects works",
    welcome: "Welcome & Contact",
    createTogether: "Create Together",
    alt: "Exploration",
  },
  contact: {
    heading: "LET'S TALKING ABOUT OUT SHARED INTERESTS",
    emailLabel: "E-MAIL",
    nameLabel: "Your name",
    namePh: "What should I call you...?",
    emailLabel2: "Your email",
    emailPh: "What's your email...?",
    msgLabel: "Message",
    msgPh: "Anything you'd like to tell me?",
    send: "Send",
    available: "Available for projects",
    rights: "All rights reserved.",
  },
  lightbox: { alt: "Preview", prev: "Previous", next: "Next", broken: "Image failed to load — use the arrows to continue" },
};

const zh: Dict = {
  meta: {
    title: "TyokeDimn | 作品集",
    description:
      "Tyoke Dimn — 常驻广东的创意摄影师与摄像师。在时间的裂缝中捕捉最强烈的瞬间。",
  },
  nav: {
    toggleAria: "Switch to English",
    links: { home: "首页", work: "作品", about: "关于我" },
    sayHi: "打个招呼",
  },
  hero: {
    eyebrow: "作品集网站",
    rolePrefix: "一名 ",
    roles: ["摄影师", "摄像师"],
    livesIn: " 生活在广东",
    tagline: "在时间的裂缝中捕捉最强烈的瞬间 — 让判断按下快门，让画面替自己说话。",
    seeWorks: "查看作品",
    reachOut: "联系我…",
    scroll: "下滑",
  },
  about: {
    eyebrow: "关于我",
    heading: "你好，我是陈嘉豪！",
    slogan:
      "用镜头抓住每一瞬，光影之前，判断先行。我不只记录影像，更擅长从 0 到 1 构建画面的表达逻辑，让每一个镜头都有情绪的重量，每一部成片都对得起现场的每一秒。",
    info: {
      identity: { label: "当前身份", value: "摄影师" },
      service: {
        label: "服务方向",
        value: "活动摄影 / 人像写真 / 短片拍摄",
      },
      phone: { label: "手机", value: "137****1451" },
      email: { label: "邮箱", value: "eleveneighteen@126.com" },
    },
    stats: [
      { value: "8+", label: "项目落地" },
      { value: "30+", label: "参与项目" },
    ],
    tagsLabel: "NOW BUILDING",
    tagsHint: "项目标签",
    tags: [
      "活动摄影",
      "短片制作",
      "人像写真",
      "风光拍摄",
      "日常记录",
      "Chreey Studio",
      "Codex",
      "Deepseek Harness",
    ],
    career: {
      eyebrow: "职业轨迹",
      title: "工作经历",
      entries: [
        {
          period: "2024.6-2024.8",
          company: "东莞广播电视台",
          role: "随行采访摄影师（兼职）",
          desc: "负责陪同记者进行街头随访，完成采访画面的摄制；依据采访提纲对儿童继续提问并观察儿童语言表达与镜头反应，初步筛选符合要求的活动参与者；向家长清晰介绍活动流程及后续安排，征得同意后收集联系方式，将有意向的家庭信息统一整理成档案，交由团队用于后续面试邀约；负责当天录制素材的整理、标注与交接工作，确保素材内容完整、信息记录清晰，与后期团队顺利对接，保障后续工作的有序推进。",
        },
        {
          period: "2025.6-2025.8",
          company: "东莞市拾壹摄影工作室",
          role: "摄影助理（实习）",
          desc: "负责为顾客提供服装搭配建议，协助完成试衣与造型调整，确保拍摄风格与客户需求匹配；引导顾客完成拍摄流程，包括动作指引、情绪调动与拍摄配合，提升拍摄效率与客户体验；协助摄影师完成布景、灯光调整、器材准备等工作，保证拍摄现场顺畅有序。",
        },
        {
          period: "2025.5-2026.7",
          company: "龙鑫（惠州）商务传媒有限公司",
          role: "实习摄影师",
          desc: "负责公司人像摄影业务，接待客户、沟通拍摄需求，参与拍摄方案的洽谈与确定；独立完成从拍摄方案、现场拍摄到后期修图的全流程。负责 [Melody Reactor 燃爆重燃 DJ] [Crazy Soul 赛场 Emoji dance] 等多场活动的拍摄，套图用于活动预告推广、助力活动前预热，预告阅读量突破千次、超同期赛道 60%；作为活动摄影师在 [SNC 2.0 DJ] 负责拍摄多位国际 DJ（含全女 DJ）的演出形象与活动现场氛围，并独立完成选图精修与影调处理，输出的成片影像被主办方用作官方宣发。",
        },
      ],
    },
    photoAlt: "陈嘉豪",
  },
  works: {
    title: "摄影",
    subtitle: "这里是我参与过的精选摄影项目",
    viewAll: "查看全部作品",
    allTitle: "全部作品",
    allSubtitle: "每一个瞬间都值得被看见",
    back: "返回",
    scroll: "下滑",
    projects: ["汽车动态", "城市建筑", "人文视角", "品牌形象"],
  },
  journal: {
    title: "摄像",
    subtitle: "这里是我参与过的短片拍摄项目",
    entries: [
      { title: "你看不见吗", roles: ["摄像B机", "灯光", "海报制作"], date: "SHOT TO LUMIX S1RII", readTime: "短片" },
      { title: "我，你好", roles: ["导演", "编剧", "摄像", "后期"], date: "SHOT TO LUMIX S5MIIX", readTime: "短片" },
      { title: "等哥的一天", roles: ["制片", "导演", "演员", "后期"], date: "SHOT TO LUMIX S5MIIX", readTime: "短片" },
    ],
  },
  explorations: {
    eyebrow: "探索",
    titleA: "←C4D &",
    titleB: "AE→",
    subtitle: "这是 Cinema 4D 和 Adobe After Effects 作品",
    welcome: "欢迎联络",
    createTogether: "一起创作",
    alt: "探索作品",
  },
  contact: {
    heading: "LET'S TALKING ABOUT OUT SHARED INTERESTS",
    emailLabel: "E-MAIL",
    nameLabel: "您的名字",
    namePh: "请问您怎么称呼......?",
    emailLabel2: "您的邮箱",
    emailPh: "请问您的邮箱是......?",
    msgLabel: "留言",
    msgPh: "有什么想和我说说的?",
    send: "发送",
    available: "可承接项目",
    rights: "保留所有权利。",
  },
  lightbox: { alt: "预览", prev: "上一张", next: "下一张", broken: "图片加载失败 — 请点击箭头继续" },
};

export const DICTS: Record<Lang, Dict> = { en, zh };

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  d: Dict;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  // 每次进入/刷新都默认中文；语言切换仅内存内生效，不持久化
  const [lang, setLang] = useState<Lang>("zh");

  // 同步 <html lang> / 文档标题 / 描述
  useEffect(() => {
    const meta = DICTS[lang].meta;
    document.documentElement.lang = lang;
    document.title = meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", meta.description);
  }, [lang]);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      toggle: () => setLang((cur) => (cur === "en" ? "zh" : "en")),
      d: DICTS[lang],
    }),
    [lang]
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within <LangProvider>");
  return ctx;
}
