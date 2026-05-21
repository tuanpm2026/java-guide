import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const zhuanlan = arraySidebar([
  {
    text: "Tutorial dự án thực tế",
    icon: ICONS.PROJECT,
    collapsible: false,
    children: [
      {
        text: "Spring AI - Nền tảng phỏng vấn thông minh",
        link: "interview-guide",
      },
      { text: "Tự viết RPC Framework", link: "handwritten-rpc-framework" },
    ],
  },
  {
    text: "Tài liệu phỏng vấn",
    icon: ICONS.INTERVIEW,
    collapsible: false,
    children: [
      { text: "Cẩm nang phỏng vấn Java", link: "java-mian-shi-zhi-bei" },
      {
        text: "System Design & câu hỏi tình huống Backend",
        link: "back-end-interview-high-frequency-system-design-and-scenario-questions",
      },
      {
        text: "Loạt bài Java source code phải đọc",
        link: "source-code-reading",
      },
    ],
  },
]);
