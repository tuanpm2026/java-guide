---
title: AI Application Development Interview Guide
description: Nắm vững kiến thức cốt lõi về AI application development từ cơ bản đến nâng cao, bao gồm LLM basics, Agent, RAG, MCP protocol, AI coding practice và các điểm kiểm tra phỏng vấn tần suất cao, phù hợp để ôn tập phỏng vấn AI application development cho campus/social recruitment.
icon: "ai"
head:
  - - meta
    - name: keywords
      content: AI interview,AI interview guide,AI application development,LLM interview,Agent interview,RAG interview,MCP interview,AI coding interview,AI coding practice
---

::: tip Viết ở đầu

Hiện nay có rất nhiều "bài viết kỹ thuật AI" trên mạng. Click vào xem, toàn những câu nói rỗng tuếch, logic lộn xộn, đọc đến đâu na ná đến đó.

Loại bài viết này có vài đặc điểm chung:

- **Chồng chất khái niệm**: Liệt kê nhiều khái niệm nhưng không thực sự giải thích rõ nguyên lý, đọc xong vẫn không hiểu.
- **Thiếu góc nhìn thực chiến**: Lý thuyết suông, không có kinh nghiệm thực tế từ project.
- **Không có hình ảnh**: Toàn chữ, reader rất khó xây dựng nhận thức trực quan.
- **Độ chính xác đáng ngờ**: Nhiều chi tiết kỹ thuật không chịu được scrutiny, thậm chí có lỗi rõ ràng.

Khi viết series bài AI này, tôi kiên trì một nguyên tắc: **Không viết thì thôi, đã viết phải viết thấu đáo**. Mỗi bài tôi đều đầu tư rất nhiều thời gian:

- **Nghiên cứu sâu**: Tham khảo official documentation, tech blogs, academic papers để đảm bảo nội dung chính xác.
- **Vẽ hình công phu**: Vẽ hàng chục illustrations để giúp hiểu.
- **Định hướng thực chiến**: Nội dung đều đến từ kinh nghiệm thực tế trong project — không phải lý thuyết suông.
- **Mài giũa nhiều lần**: Mỗi bài được chỉnh sửa hàng chục lần để đảm bảo logic rõ ràng, diễn đạt chính xác.

Hy vọng những bài viết này thực sự giúp ích cho bạn.

:::

::: warning Đang liên tục cập nhật

AI interview series hiện đang **liên tục cập nhật**, sau này sẽ dần bổ sung thêm nhiều high-frequency interview points.

Nội dung hiện tại có thể chưa đủ hoàn chỉnh. Nếu bạn có chủ đề muốn tìm hiểu hoặc bất kỳ gợi ý nào, hoan nghênh để lại phản hồi trong issues area của project.

:::

## Chuyên mục này giúp bạn giải quyết vấn đề gì?

Nếu bạn đang chuẩn bị phỏng vấn liên quan đến AI application development, hoặc muốn học hệ thống kiến thức cốt lõi của AI application development, chuyên mục này được tạo ra cho bạn.

Qua chuyên mục này, bạn sẽ có được:

### 1. Kiến thức LLM cơ bản vững chắc

Nhiều developer khi build Agent workflows hay tune RAG retrieval thường bị "dính bẫy" ở tầng LLM parameters cơ bản nhất. Ví dụ:

- Tại sao đã set temperature về 0 nhưng structured output vẫn thỉnh thoảng bị crash?
- Tại sao nhét một long document vào model thì nó dường như "quên mất", bỏ qua các key instructions trong System Prompt?
- Token thực ra tính như thế nào? Tại sao tiếng Trung và tiếng Anh tiêu hao khác nhau?

Những câu hỏi này, nếu bạn không hiểu nguyên lý tầng dưới của LLM, mãi mãi chỉ biết "đó là vậy" mà không biết "tại sao lại vậy". Trong [《10k Word Analysis of LLM Operating Mechanism》](./llm-basis/llm-operation-mechanism.md), tôi sẽ dẫn bạn khám phá black box của LLM, đưa các khái niệm như Token, Context Window, Temperature về những engineering concepts rõ ràng và có thể kiểm soát.

### 2. Hệ thống kiến thức AI Agent toàn diện

AI Agent là hướng hot nhất trong AI application development hiện nay. Nhưng tài liệu trên mạng hoặc là quá nông, hoặc là quá rời rạc, rất khó hình thành nhận thức có hệ thống.

Trong [《One Article to Understand AI Agent Core Concepts》](./agent/agent-basis.md), tôi sẽ dẫn bạn:

- Tổng hợp lịch sử tiến hóa sáu thế hệ của AI Agent từ 2022 đến 2025
- Hiểu sự khác biệt bản chất giữa Agent, traditional programming, Workflow
- Nắm vững các core concepts như Agent Loop, Context Engineering, Tools registration

Trong [《LLM Prompt Engineering Practice Guide》](./agent/prompt-engineering.md), tôi sẽ dẫn bạn:

- Nắm vững Prompt four-element framework (Role + Task + Context + Format)
- Học sáu kỹ thuật cốt lõi: role-playing, chain-of-thought, few-shot learning, task decomposition, structured output, XML tags và pre-filling
- Hiểu nguyên lý Prompt injection attacks và three-layer defense system

Trong [《Context Engineering Practice Guide》](./agent/context-engineering.md), tôi sẽ dẫn bạn:

- Hiểu sự khác biệt bản chất giữa Context Engineering và Prompt Engineering
- Nắm vững ba core technologies: static rule orchestration, dynamic information mounting, Token budget degradation
- Học ba long-task context persistence solutions: Compaction, structured notes, Sub-agent

### 3. Hiểu sâu về RAG Retrieval Augmented Generation

RAG là core technology của enterprise-level AI applications. Nhưng nhiều developer chỉ biết "chia document thành chunks, convert sang vectors, rồi retrieve" — không hiểu nguyên lý phía sau.

Trong RAG series articles, tôi sẽ dẫn bạn hiểu sâu:

- [《10k Word Detailed RAG Basic Concepts》](./rag/rag-basis.md): RAG là gì? Tại sao cần RAG? Core advantages và limitations của RAG là gì?
- [《10k Word Detailed RAG Vector Index Algorithms and Vector Databases》](./rag/rag-vector-store.md): Nguyên lý của HNSW, IVFFLAT và các index algorithms là gì? Làm thế nào để chọn vector database phù hợp?

### 4. Nắm vững Tools và Protocols

Trong AI application development, sự phân mảnh của tool integration là vấn đề lớn. Sự ra đời của MCP protocol chính là để giải quyết vấn đề này.

Trong [《10k Word Analysis of MCP Protocol》](./agent/mcp.md), tôi sẽ dẫn bạn hiểu:

- MCP là gì? Tại sao được gọi là "USB-C interface của AI field"?
- Bốn core capabilities và four-layer architecture của MCP
- Best practices phát triển MCP Server trong production environment

Trong [《10k Word Detailed Agent Skills》](./agent/skills.md), tôi sẽ dẫn bạn hiểu:

- Skills là gì? Tại sao nó được gọi là sub-agent "lazy loading"?
- Sự khác biệt bản chất giữa Skills và Prompt, MCP, Function Calling
- Làm thế nào để design Skills xuất sắc trong practice

Trong [《One Article to Understand Harness Engineering》](./agent/harness-engineering.md) (six-layer architecture, context management và frontline team practice), tôi sẽ dẫn bạn hiểu:

- Agent = Model + Harness, tại sao nói cái quyết định ceiling của Agent là Harness chứ không phải model?
- Harness six-layer architecture, 40% threshold phenomenon trong context management
- Frontline team engineering practice experience của OpenAI, Anthropic, Stripe v.v.

### 5. AI Coding Interview Preparation

AI coding tools đang thay đổi sâu sắc cách làm việc của developers. Trong phỏng vấn bạn có thể bị hỏi:

- Bạn đã dùng AI coding IDEs nào? Có những tips gì?
- Bạn nghĩ gì về tác động của AI đến backend development? AI có thay thế programmer không?
- Core competitive advantage của programmer trong tương lai là gì?

Trong [《AI Coding Open-ended Interview Questions》](./llm-basis/ai-ide.md), tôi sẽ chia sẻ thinking approaches cho 7 high-frequency open-ended interview questions.

### 6. AI Coding Practice

Học trên giấy vẫn thấy nông. Chỉ khi tự tay dùng AI coding tools mới thực sự hiểu working boundaries và usage tips của nó. Trong AI coding practice series, tôi sẽ chia sẻ kinh nghiệm sử dụng AI-assisted programming qua practical cases trong real scenarios:

- [《IDEA + Qoder Plugin Practice》](./ai-coding/idea-qoder-plugin.md): Từ interface optimization đến code refactoring, thể hiện cách dùng AI hoàn thành complete closed-loop từ analysis đến implementation trong JetBrains IDE
- [《Trae + MiniMax Multi-scenario Practice》](./ai-coding/trae-m2.7.md): Dùng Trae IDE integrate MiniMax LLM, chia sẻ kinh nghiệm thực chiến AI-assisted programming qua Redis troubleshooting và cross-language refactoring scenarios
- [《Claude Code Integrating Third-party Model Practice》](./ai-coding/cc-glm5.1.md): Integrate GLM-5.1 thông qua Claude Code, hoàn thành JVM intelligent diagnosis assistant và million-scale slow query governance
- [《Claude Code Usage Guide》](./ai-coding/claudecode-tips.md): Tổng hợp từ Anthropic official technical documentation và kinh nghiệm thực chiến, systematically tổng kết usage tips của Claude Code
- [《OpenAI Codex Best Practices Guide》](./ai-coding/codex-best-practices.md): Tổng hợp official documentation và thực chiến, systematically tổng kết best practices của Codex

## Article List

### LLM Basics

- [10k Word Analysis of LLM Operating Mechanism: Token, Context and Sampling Parameters](./llm-basis/llm-operation-mechanism.md) - Deep analysis of LLM bottom layer principles, restoring Token, Context Window, Temperature concepts to clear and controllable engineering concepts
- [AI Coding Open-ended Interview Questions](./llm-basis/ai-ide.md) - 7 high-frequency open-ended interview questions covering AI coding IDE usage tips, AI's impact on backend development, etc.

### AI Agent

- [One Article to Understand AI Agent Core Concepts](./agent/agent-basis.md) - Sort out the six-generation evolution history of AI Agent, master core concepts like Agent Loop, Context Engineering, Tools registration
- [LLM Prompt Engineering Practice Guide](./agent/prompt-engineering.md) - Master the Prompt four-element framework, six core techniques and enterprise-level security practices
- [Context Engineering Practice Guide](./agent/context-engineering.md) - Deep understanding of Context Engineering core concepts, master key technologies like static rule orchestration, dynamic information mounting, Token budget degradation
- [10k Word Detailed Agent Skills](./agent/skills.md) - Deep understanding of Skills design concept, master the essential differences between Skills and Prompt, MCP, Function Calling
- [10k Word Analysis of MCP Protocol with Engineering Practice](./agent/mcp.md) - Understand MCP protocol core concepts, architectural design and production-level best practices
- [One Article to Understand Harness Engineering: Six-layer Architecture, Context Management and Frontline Team Practice](./agent/harness-engineering.md) - Deep analysis of Harness Engineering, dissecting the Agent engineering practice experience of OpenAI, Anthropic, Stripe and other frontline teams

### RAG (Retrieval Augmented Generation)

- [10k Word Detailed RAG Basic Concepts](./rag/rag-basis.md) - Deep understanding of RAG's working principles, core advantages and limitations
- [10k Word Detailed RAG Vector Index Algorithms and Vector Databases](./rag/rag-vector-store.md) - Master principles of HNSW, IVFFLAT and other index algorithms, learn to choose the right vector database

### AI Coding Practice

- [IDEA + Qoder Plugin Multi-scenario Practice: Interface Optimization and Code Refactoring](./ai-coding/idea-qoder-plugin.md) - Through deep pagination optimization and legacy code refactoring real cases, demonstrate the practical effect of AI-assisted programming
- [Trae + MiniMax Multi-scenario Practice: Redis Troubleshooting and Cross-language Refactoring](./ai-coding/trae-m2.7.md) - Using Trae IDE with MiniMax LLM, sharing AI-assisted programming practice experience
- [Claude Code Integrating Third-party Model Practice: JVM Intelligent Diagnosis and Slow Query Governance](./ai-coding/cc-glm5.1.md) - Integrating GLM-5.1 via Claude Code, completing JVM intelligent diagnosis assistant and million-scale slow query governance
- [Claude Code Usage Guide: Configuration, Workflow and Advanced Tips](./ai-coding/claudecode-tips.md) - Compiled from Anthropic official technical documentation with hands-on experience, systematically sorting out Claude Code usage tips
- [OpenAI Codex Best Practices Guide: Prompt Engineering, Tool Configuration and Security Strategy](./ai-coding/codex-best-practices.md) - Comprehensive official documentation and hands-on experience, systematically sorting out Codex best practices

## Illustration Preview

To help readers better understand abstract technical concepts, I drew a large number of illustrations in each article. Here are a few:

![Context window illustration](https://oss.javaguide.cn/github/javaguide/ai/llm/llm-context-window.png)

_The context window is the LLM's "working memory", determining the maximum amount of text the model can process_

![RAG architecture illustration](https://oss.javaguide.cn/github/javaguide/ai/rag/rag-simplified-architecture-diagram.jpeg)

_RAG's core idea: first retrieve relevant context, then let LLM generate answers based on context_

![MCP illustration](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

_MCP is called the "USB-C interface of AI field", unifying the communication standards between LLMs and external tools_

## Closing Thoughts

This column will continue to be updated. If you find it helpful, please share it with your friends. For questions or suggestions, just leave a comment in the project issues area.

---

![JavaGuide Official Account](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)
