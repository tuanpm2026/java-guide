import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const openSourceProject = arraySidebar([
  {
    text: "Tutorial kỹ thuật",
    link: "tutorial",
    icon: ICONS.BOOK,
  },
  {
    text: "Dự án thực tế",
    link: "practical-project",
    icon: ICONS.PROJECT,
  },
  {
    text: "AI",
    link: "machine-learning",
    icon: ICONS.MACHINE_LEARNING,
  },
  {
    text: "System Design",
    link: "system-design",
    icon: ICONS.DESIGN,
  },
  {
    text: "Thư viện công cụ",
    link: "tool-library",
    icon: ICONS.LIBRARY,
  },
  {
    text: "Công cụ phát triển",
    link: "tools",
    icon: ICONS.TOOL,
  },
  {
    text: "Big Data",
    link: "big-data",
    icon: ICONS.BIG_DATA,
  },
]);
