import { arraySidebar } from "vuepress-theme-hope";
import { ICONS } from "./constants.js";

export const ai = arraySidebar([
  {
    text: "Câu hỏi phỏng vấn",
    icon: ICONS.INTERVIEW,
    prefix: "interview-questions/",
    children: [
      {
        text: "⭐️ Hướng dẫn phỏng vấn AI Application",
        link: "ai-interview-guide",
      },
      {
        text: "Tổng hợp câu hỏi phỏng vấn LLM cơ bản",
        link: "llm-interview-questions",
      },
      {
        text: "Tổng hợp câu hỏi phỏng vấn AI Agent",
        link: "agent-interview-questions",
      },
      {
        text: "Tổng hợp câu hỏi phỏng vấn RAG",
        link: "rag-interview-questions",
      },
      {
        text: "Tổng hợp câu hỏi phỏng vấn AI System Design",
        link: "ai-system-design-interview-questions",
      },
    ],
  },
  {
    text: "LLM cơ bản",
    icon: ICONS.MACHINE_LEARNING,
    prefix: "llm-basis/",
    children: [
      { text: "Cơ chế vận hành LLM", link: "llm-operation-mechanism" },
      { text: "Kỹ thuật gọi API LLM", link: "llm-api-engineering" },
      {
        text: "Chi tiết Structured Output của LLM",
        link: "structured-output-function-calling",
      },
      { text: "Hệ thống đánh giá AI Application", link: "llm-evaluation" },
    ],
  },
  {
    text: "AI Agent",
    icon: ICONS.CHAT,
    prefix: "agent/",
    children: [
      { text: "⭐️ Chi tiết khái niệm cốt lõi AI Agent", link: "agent-basis" },
      { text: "⭐️ Hệ thống Memory của AI Agent", link: "agent-memory" },
      { text: "Hướng dẫn Prompt Engineering", link: "prompt-engineering" },
      { text: "Hướng dẫn Context Engineering", link: "context-engineering" },
      { text: "Chi tiết Agent Skills", link: "skills" },
      { text: "Chi tiết MCP Protocol", link: "mcp" },
      { text: "Chi tiết Harness Engineering", link: "harness-engineering" },
      { text: "Chi tiết AI Workflow", link: "workflow-graph-loop" },
    ],
  },
  {
    text: "RAG",
    icon: ICONS.SEARCH,
    prefix: "rag/",
    children: [
      { text: "⭐️ Khái niệm cơ bản RAG", link: "rag-basis" },
      {
        text: "Document processing & chunking cho RAG",
        link: "rag-document-processing",
      },
      {
        text: "⭐️ Vector Index & Vector DB cho RAG",
        link: "rag-vector-store",
      },
      {
        text: "Chiến lược update Knowledge Base",
        link: "rag-knowledge-update",
      },
      { text: "Chi tiết GraphRAG", link: "graphrag" },
      { text: "Tối ưu retrieval cho RAG", link: "rag-optimization" },
    ],
  },
  {
    text: "AI System Design",
    icon: ICONS.DESIGN,
    prefix: "system-design/",
    children: [
      {
        text: "Kiến trúc AI Application",
        link: "ai-application-architecture",
      },
      { text: "Chi tiết công nghệ AI Voice", link: "ai-voice" },
    ],
  },
]);
