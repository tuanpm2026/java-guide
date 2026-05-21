import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const zhuanlan = arraySidebar([
  {
    text: "Tutorial dự án thực tế",
    icon: ICONS.PROJECT,
    collapsible: false,
    children: ["interview-guide", "handwritten-rpc-framework"],
  },
  {
    text: "Tài liệu phỏng vấn",
    icon: ICONS.INTERVIEW,
    collapsible: false,
    children: [
      "java-mian-shi-zhi-bei",
      "back-end-interview-high-frequency-system-design-and-scenario-questions",
      "source-code-reading",
    ],
  },
]);
