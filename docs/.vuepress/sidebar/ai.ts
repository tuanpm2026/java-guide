import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const ai = arraySidebar([
  {
    text: "LLM cơ bản",
    icon: ICONS.MACHINE_LEARNING,
    prefix: "llm-basis/",
    children: [
      { text: "Cơ chế vận hành LLM", link: "llm-operation-mechanism" },
      { text: "Câu hỏi phỏng vấn mở về AI coding", link: "ai-ide" },
    ],
  },
  {
    text: "AI Agent",
    icon: ICONS.CHAT,
    prefix: "agent/",
    children: [
      { text: "Hiểu rõ khái niệm cốt lõi AI Agent", link: "agent-basis" },
      {
        text: "Hướng dẫn Prompt Engineering cho LLM",
        link: "prompt-engineering",
      },
      {
        text: "Hướng dẫn thực chiến Context Engineering",
        link: "context-engineering",
      },
      { text: "Chi tiết về Agent Skills", link: "skills" },
      { text: "Chi tiết về MCP Protocol", link: "mcp" },
      {
        text: "Hiểu rõ Harness Engineering",
        link: "harness-engineering",
      },
      {
        text: "Workflow, Graph và Loop trong AI Workflow",
        link: "workflow-graph-loop",
      },
    ],
  },
  {
    text: "RAG",
    icon: ICONS.SEARCH,
    prefix: "rag/",
    children: [
      { text: "Chi tiết về khái niệm RAG cơ bản", link: "rag-basis" },
      {
        text: "Chi tiết thuật toán Vector Index & Vector DB cho RAG",
        link: "rag-vector-store",
      },
    ],
  },
  {
    text: "Thực chiến AI Coding",
    icon: ICONS.CODE,
    prefix: "ai-coding/",
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
        text: "Hướng dẫn sử dụng Claude Code",
        link: "claudecode-tips",
      },
      {
        text: "Best practices cho OpenAI Codex",
        link: "codex-best-practices",
      },
    ],
  },
]);
