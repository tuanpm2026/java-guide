import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const aiCoding = arraySidebar([
  {
    text: "Thực chiến AI Coding",
    icon: ICONS.CODE,
    children: [
      {
        text: "IDEA + Qoder plugin thực chiến đa kịch bản",
        link: "idea-qoder-plugin",
      },
      {
        text: "Trae + MiniMax thực chiến đa kịch bản",
        link: "trae-m2.7",
      },
      {
        text: "Claude Code tích hợp model bên thứ ba",
        link: "cc-glm5.1",
      },
      {
        text: "DeepSeek V4 + Claude Code thực chiến",
        link: "deepseek-v4-claude-code",
      },
    ],
  },
  {
    text: "Kỹ năng AI Coding",
    icon: ICONS.TOOL,
    children: [
      {
        text: "Skills cần thiết cho AI Coding",
        link: "programmer-essential-skills",
      },
      {
        text: "Các lệnh Claude Code quan trọng",
        link: "claudecode-commands",
      },
      {
        text: "Hướng dẫn sử dụng Claude Code",
        link: "claudecode-tips",
      },
      {
        text: "Best practices cho OpenAI Codex",
        link: "codex-best-practices",
      },
      {
        text: "AI Coding nên chọn CLI hay IDE?",
        link: "cli-vs-ide",
      },
      {
        text: "Câu hỏi phỏng vấn mở về AI Coding",
        link: "ai-ide",
      },
    ],
  },
]);
