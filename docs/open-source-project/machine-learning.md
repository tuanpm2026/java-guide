---
title: Java open source AI projects chất lượng
description: Gợi ý các Java open source AI projects chất lượng, bao gồm giới thiệu về Spring AI, LangChain4j, Deeplearning4j và các Java AI và machine learning frameworks khác.
category: Open Source Projects
icon: a-MachineLearning
---

Nhiều bạn hỏi tôi riêng: AI đang hot thế này, chúng ta viết Java liệu có chỉ có thể đứng ngoài xem?

**Thật ra, trước đây đúng là hơi khó chịu.** Xét cho cùng phần lớn mainstream AI frameworks đều là Python. Nhưng bây giờ, thời đại thay đổi rồi! Với sự bùng nổ của Spring AI và các Java AI frameworks, developer Java hoàn toàn có thể integrate LLM vào applications một cách elegant, giống như viết CRUD thông thường.

Hôm nay sẽ điểm qua một số AI frameworks hardcore nhất trong Java ecosystem hiện nay.

## Base Frameworks

### Spring AI

[Spring AI](https://github.com/spring-projects/spring-ai) là AI application development framework do Spring official trực tiếp tạo ra. Core philosophy của nó rất trực quan: **seamlessly integrate AI capabilities into Spring ecosystem**.

Với developers quen với Spring Boot, cái này gần như không có learning threshold. Nó cung cấp một bộ "bottom-layer atomic capability abstractions" cần thiết để build AI applications:

- **Model Communication (ChatClient):** Cung cấp unified interface để chat với các LLMs khác nhau (như OpenAI GPT, Ollama, Google Gemini).
- **Prompt:** Quản lý và build prompts gửi cho model một cách có cấu trúc.
- **Retrieval Augmented Generation (RAG):** Thông qua các abstractions như `VectorStore`, dễ dàng triển khai RAG pattern, kết hợp external knowledge base với model để nâng cao độ chính xác và tính thời sự của câu trả lời.
- **Function Calling (Tool Calling):** Cho phép model gọi các methods được định nghĩa trong Java application, triển khai interaction với thế giới bên ngoài.
- **Memory (ChatMemory):** Quản lý context history của multi-turn conversations.

Official documentation: <https://spring.io/projects/spring-ai#learn>.

### Spring AI Alibaba

[Spring AI Alibaba](https://github.com/alibaba/spring-ai-alibaba) tích hợp Spring AI ecosystem, là một project được thiết kế chuyên cho multi-agent systems và workflow orchestration. Project về mặt architecture bao gồm ba tầng sau:

![Spring AI Alibaba Architecture](/images/github/javaguide/open-source-project/ai/springai-alibaba-architecture-new.png)

- **Agent Framework**: Agent development framework lấy ReactAgent design concept làm core, build Agents với automatic context engineering và human-computer interaction capabilities.
- **Graph**: Low-level workflow và multi-agent coordination framework, là underlying runtime base của Agent Framework, giúp triển khai complex application orchestration.
- **Augmented LLM**: Dựa trên Spring AI bottom-layer abstractions, cung cấp basic support cho models, tools, multimodal components (MCP), vector stores v.v.

Ngoài ra còn có các components rất "engineering-oriented":

- **Admin**: One-stop Agent platform, hỗ trợ visual development, observability, evaluation, MCP management, thậm chí tích hợp với các low-code platforms như Dify, hỗ trợ DSL migration.
- **A2A (Agent-to-Agent)**: Hỗ trợ inter-Agent communication và có thể tích hợp với Nacos để làm distributed coordination.

Official documentation: <https://java2ai.com/>.

### LangChain4j

Nếu Spring AI là chính quy của official, thì [LangChain4j](https://github.com/langchain4j/langchain4j) là Java LLM framework rất mạnh trong cộng đồng hiện nay — đây là Java version của LangChain.

Ưu điểm của nó là tính năng đầy đủ, tốc độ adaptation với các LLMs mới rất nhanh. Nhưng trong Spring ecosystem luôn có cảm giác "khách ngoài" hơi lạ.

Nếu bạn theo đuổi "multi-model fast switching + broad capability coverage + fast prototype iteration", LangChain4j thường là lựa chọn hàng đầu. Đánh đổi là bạn cần tự làm thêm một chút "engineering assembly" về project structure, governance, observability, platformization.

Official documentation: <https://docs.langchain4j.dev/>.

### AgentScope

[AgentScope](https://github.com/agentscope-ai/agentscope-java) là một multi-agent framework, nhằm cung cấp một cách đơn giản và hiệu quả để build intelligent agent applications dựa trên LLMs.

Nếu LLM là bộ não của AI application, thì AgentScope là "central nervous system" và "hands and feet" của nó. Nó không chỉ cung cấp multi-agent collaboration architecture mà còn có built-in core capabilities như ReAct reasoning, tool calling, memory management.

AgentScope cung cấp cả Python và Java versions, core capabilities của hai cái hoàn toàn aligned!

**AgentScope cũng do Alibaba mã nguồn mở, vậy khác gì Spring AI Alibaba?**

- **AgentScope Java**: Được thiết kế native cho **Agentic paradigm**. Core của nó là "Agent", nhấn mạnh tính tự chủ, reasoning loop (ReAct) và complex game/collaboration giữa các multi-agents.
- **Spring AI Alibaba**: Tập trung hơn vào **Workflow orchestration**. Dựa trên Spring AI ecosystem, giỏi tích hợp AI capabilities như tools vào predefined business flows.

Official documentation: <https://java.agentscope.io/zh/intro.html>.

### Khác

- [Solon-AI](https://github.com/opensolon/solon-ai): Java AI application development framework (hỗ trợ LLM, RAG, MCP, Agent), tương thích với Java8~Java25, hỗ trợ SpringBoot, jFinal, Vert.x, Quarkus và các frameworks khác.
- [Agent-Flex](https://github.com/agents-flex/agents-flex): Elegant LLM (Large Language Model) application development framework, tương đương LangChain, phát triển bằng Java, đơn giản, lightweight.
- [Deeplearning4j](https://github.com/eclipse/deeplearning4j): Thư viện deep learning commercial-grade, open source, distributed đầu tiên viết cho Java và Scala.
- [Smile](https://github.com/haifengl/smile): Machine learning library dựa trên Java và Scala.
- [GdxAI](https://github.com/libgdx/gdx-ai): AI framework hoàn toàn viết bằng Java, dùng cho game development với libGDX.

### So sánh

| **Framework**         | **Core Features**                                                                                                                              | **Applicable Scenarios**                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Spring AI**         | Spring official base: model/vector store/tool calling/memory/RAG/observability/structured output; emphasizes portability and modularity        | Existing Spring Boot enterprise applications AI-ification                                                     |
| **Spring AI Alibaba** | Production-grade Agentic/Workflow/Multi-agent system: Agent Framework + Graph Runtime + Admin/Studio; supports MCP/A2A/Nacos                   | Multi-agent orchestration, complex workflows, platformized governance and migration (including visualization) |
| **LangChain4j**       | Community strong: unified API connecting multiple models/vector stores; Agents/Tools/RAG; supports MCP; integrable with Spring/Quarkus/Helidon | Rapid prototyping, high flexibility, multi-model fast switching                                               |
| **Solon-AI**          | Java 8~25 compatible; LLM/RAG/MCP/Agent/AI Flow full chain; embeddable in multiple frameworks                                                  | Legacy systems/multi-framework scenarios, pursuing compatibility and full-chain capabilities                  |
| **Agent-Flex**        | Lightweight and elegant: LLM/Prompt/Tool/MCP/Memory/Embedding/VectorStore/document processing; OpenTelemetry observability                     | Pursuing simple onboarding, observable LLM application development                                            |
| **AgentScope Java**   | Agentic native: ReAct + Tool + Memory + Multi-Agent; MCP+A2A (Nacos); Reactor reactive + GraalVM Serverless                                    | Autonomous agents, distributed multi-agents, high production controllability and performance requirements     |

## Practical Projects

### Intelligent Interview Platform

[interview-guide](https://github.com/Snailclimb/interview-guide) dựa trên Spring Boot 4.0 + Java 21 + Spring AI + PostgreSQL + pgvector + RustFS + Redis, triển khai các core features như intelligent resume analysis, AI mock interview, knowledge base RAG retrieval. Rất phù hợp làm learning và resume project, learning threshold thấp.

**System architecture như sau**:

> **Note**: Architecture diagram được vẽ bằng draw.io, export dạng svg. Có thể hiển thị không tốt trong Github Dark mode.

![System Architecture Diagram](/images/xingqiu/pratical-project/interview-guide/interview-guide-architecture-diagram.png)

### AI Workflow Orchestration System

[PaiAgent](https://github.com/itwanger/PaiAgent) là một **enterprise-level AI workflow visual orchestration platform**, giúp việc kết hợp và điều phối AI capabilities trở nên đơn giản và hiệu quả. Thông qua giao diện drag-and-drop trực quan, cả developers và business people đều có thể nhanh chóng build complex AI processing flows mà không cần code.

**System architecture như sau**:

![](/images/github/javaguide/open-source-project/ai/paiagent-architecture-diagram.jpg)
