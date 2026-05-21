---
title: Câu hỏi phỏng vấn mô hình lớn 2026 | Câu hỏi phỏng vấn Agent | Câu hỏi phỏng vấn RAG | Hướng dẫn phỏng vấn phát triển ứng dụng AI (kèm đáp án và hình minh họa)
description: Hướng dẫn phỏng vấn phát triển ứng dụng AI 2026, tổng hợp có hệ thống câu hỏi phỏng vấn mô hình lớn, câu hỏi phỏng vấn AI Agent, câu hỏi phỏng vấn RAG, câu hỏi phỏng vấn thiết kế hệ thống AI, câu hỏi phỏng vấn MCP, câu hỏi phỏng vấn kỹ thuật Prompt và các điểm kiểm tra tần suất cao khác, bao gồm gợi ý đáp án, hình minh họa và bài viết tham khảo.
category: AI
tag:
  - Phỏng vấn AI
  - Phỏng vấn mô hình lớn
  - Phỏng vấn Agent
  - Phỏng vấn RAG
head:
  - - meta
    - name: keywords
      content: 2026大模型面试题,大模型面试题,Agent面试题,RAG面试题,AI应用开发面试指南,AI面试题,AI面试,AI应用开发面试,大模型面试,LLM面试题,Agent面试,RAG面试,AI系统设计面试题,MCP面试题,Prompt工程面试题,向量数据库面试题
  - - meta
    - property: og:title
      content: Câu hỏi phỏng vấn mô hình lớn 2026 | Câu hỏi phỏng vấn Agent | Câu hỏi phỏng vấn RAG | Hướng dẫn phỏng vấn phát triển ứng dụng AI (kèm đáp án và hình minh họa)
  - - meta
    - property: og:description
      content: Tổng hợp có hệ thống câu hỏi phỏng vấn phát triển ứng dụng AI 2026, bao gồm mô hình lớn, AI Agent, RAG, MCP, kỹ thuật Prompt, cơ sở dữ liệu vector và thiết kế hệ thống AI, kèm gợi ý đáp án, hình minh họa và bài viết tham khảo.
---

<!-- @include: @small-advertisement.snippet.md -->

Phỏng vấn phát triển ứng dụng AI khác với phỏng vấn backend truyền thống.

Phỏng vấn backend truyền thống chủ yếu xoay quanh Java, JVM, concurrency, MySQL, Redis, message queue, distributed và system design. Phỏng vấn phát triển ứng dụng AI ngoài những nền tảng này, còn tiếp tục hỏi thêm:

- Token của mô hình lớn được tính như thế nào? Cửa sổ ngữ cảnh càng lớn càng tốt không?
- Sự khác biệt giữa Function Calling và MCP là gì? Gọi công cụ làm kiểm soát quyền như thế nào?
- Tỷ lệ thu hồi RAG thấp cần chẩn đoán như thế nào? Chunk cắt như thế nào? Rerank giải quyết vấn đề gì?
- Memory của Agent được thiết kế như thế nào? Ngữ cảnh nhiệm vụ dài bị tràn thì sao?
- Cách thiết kế ứng dụng AI cấp sản xuất? Model gateway, đánh giá, khả năng quan sát làm như thế nào?

Những câu hỏi này không thể vượt qua chỉ bằng cách học thuộc vài thuật ngữ. Phỏng vấn phát triển ứng dụng AI chú trọng hơn vào: **bạn có thể hiểu mô hình lớn, RAG, Agent, gọi công cụ và system design trong kỹ thuật thực tế không.**

Do đó, bài viết này sẽ là điểm vào tổng hợp cho câu hỏi phỏng vấn AI. Bạn có thể trước tiên xây dựng bản đồ kiến thức qua đây, rồi vào các module cụ thể để luyện đề và quay lại bài gốc để bổ sung hiểu biết nền tảng.

## Mục lục câu hỏi phỏng vấn

| Module câu hỏi phỏng vấn                                                                     | Nhóm người phù hợp ôn tập trọng điểm                                                              | Nội dung chính                                                                                                                                                          |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Tổng hợp câu hỏi phỏng vấn cơ bản mô hình lớn](./llm-interview-questions.md)                | Tất cả những ai chuẩn bị phỏng vấn phát triển ứng dụng AI                                         | Token, cửa sổ ngữ cảnh, tham số lấy mẫu, gọi API, đầu ra streaming, đầu ra có cấu trúc, Function Calling, đánh giá ứng dụng AI                                          |
| [Tổng hợp câu hỏi phỏng vấn AI Agent](./agent-interview-questions.md)                        | Những người chuẩn bị vị trí liên quan đến Agent, gọi công cụ, workflow                            | Agent Loop, Memory, Prompt Engineering, Context Engineering, MCP, Agent Skills, Harness Engineering, Workflow, Graph, Loop                                              |
| [Tổng hợp câu hỏi phỏng vấn RAG](./rag-interview-questions.md)                               | Những người chuẩn bị vị trí hỏi đáp knowledge base, ứng dụng AI doanh nghiệp, tăng cường tìm kiếm | Cơ bản RAG, Embedding, cơ sở dữ liệu vector, chiến lược Chunk, Hybrid Search, Query Rewrite, Rerank, GraphRAG, cập nhật và đánh giá knowledge base                      |
| [Tổng hợp câu hỏi phỏng vấn thiết kế hệ thống AI](./ai-system-design-interview-questions.md) | Nhà phát triển 2 năm trở lên, những người chuẩn bị xã chiêu và phỏng vấn system design            | Kiến trúc ứng dụng AI cấp sản xuất, model gateway, quản lý Prompt, RAG, Memory, Tool Calling, khả năng quan sát, đánh giá, tuân thủ bảo mật, voice Agent thời gian thực |

4 bài này là "điểm vào câu hỏi phỏng vấn", mỗi bài sẽ cho bạn biết:

- Module này phỏng vấn viên thực sự muốn kiểm tra gì.
- Có những câu hỏi tần suất cao nào.
- Mỗi nhóm câu hỏi cần nắm những điểm mấu chốt nào.
- Điểm trừ phổ biến là gì.
- Nên quay lại bài gốc nào để tiếp tục học sâu.

Khuyến nghị bạn đừng coi chúng như kho câu hỏi thuần túy, mà xem như "bản đồ lộ trình ôn tập". Câu hỏi chỉ là điểm vào, điều thực sự cần nắm là phán đoán kỹ thuật đằng sau câu hỏi.

"Kèm đáp án và hình minh họa" ở đây không phải nén tất cả nội dung thành vài câu đáp án tiêu chuẩn, mà mỗi bài câu hỏi phỏng vấn đều cung cấp gợi ý trả lời, điểm mấu chốt, điểm trừ và bài viết tham khảo. Hình minh họa và suy luận hoàn chỉnh hơn được đặt trong bài gốc chuyên đề tương ứng, tiện để bạn từ câu hỏi phỏng vấn tiếp tục học sâu.

## Phỏng vấn phát triển ứng dụng AI kiểm tra gì?

Sự khác biệt lớn nhất giữa phỏng vấn phát triển ứng dụng AI và phỏng vấn backend truyền thống là: nó không chỉ hỏi bạn có biết gọi interface không, mà hỏi bạn có thể tích hợp năng lực AI vào hệ thống thực tế không.

Có thể chia thành ba lớp.

### Lớp đầu tiên: Nhận thức cơ bản về mô hình lớn

Lớp này là nền tảng không thể bỏ qua cho tất cả các vị trí phát triển ứng dụng AI. Phỏng vấn viên thường hỏi:

- Token là gì? Tại sao tiếng Trung, tiếng Anh, code tiêu thụ Token khác nhau?
- Cửa sổ ngữ cảnh có giới hạn gì? Ngữ cảnh dài tại sao không nhất định tốt hơn?
- Temperature, Top-P, Top-K lần lượt kiểm soát gì? Môi trường sản xuất điều chỉnh như thế nào?
- Mô hình lớn tại sao tạo ra ảo giác? Có những cách giảm thiểu kỹ thuật nào?
- JSON Mode, Structured Outputs, Function Calling có gì khác nhau?

Những câu hỏi này trông có vẻ cơ bản, nhưng điều thực sự kiểm tra là nhận thức kỹ thuật. Bạn không cần tự tính Transformer trong phỏng vấn phát triển ứng dụng thông thường, nhưng phải biết những tham số này sẽ ảnh hưởng như thế nào đến chi phí, độ trễ, ổn định, đầu ra có cấu trúc và chất lượng trực tuyến.

Nếu bạn thấy mình chỉ có thể học thuộc định nghĩa, không nói được ảnh hưởng trong sản xuất, khuyến nghị xem trước: [Tổng hợp câu hỏi phỏng vấn cơ bản mô hình lớn](./llm-interview-questions.md).

### Lớp thứ hai: Năng lực component ứng dụng AI

Lớp này là nơi tạo ra khoảng cách với "chỉ biết gọi API", chủ yếu bao gồm RAG, Agent, Prompt, Context, MCP, gọi công cụ v.v.

Câu hỏi tần suất cao bao gồm:

- Tỷ lệ thu hồi RAG thấp cần chẩn đoán như thế nào? Là vấn đề Chunk, vấn đề Embedding, hay vấn đề sắp xếp?
- Hybrid Search, Query Rewrite, Rerank lần lượt giải quyết vấn đề gì?
- Agent Loop là gì? Khác gì workflow thông thường?
- Agent Memory được thiết kế như thế nào? Bộ nhớ ngắn hạn và dài hạn phân biệt như thế nào?
- Sự khác biệt giữa MCP và Function Calling là gì? MCP Server cấp sản xuất làm quản trị bảo mật như thế nào?
- Prompt Engineering và Context Engineering khác nhau ở chỗ nào?

Điểm chung của những câu hỏi này là: phỏng vấn viên không thỏa mãn với việc nghe khái niệm, mà sẽ hỏi thêm "bạn triển khai như thế nào", "xảy ra vấn đề cần chẩn đoán như thế nào", "tại sao chọn như vậy".

Nếu bạn đang chuẩn bị hướng knowledge base doanh nghiệp, dịch vụ khách hàng thông minh, Agent workflow, AI coding assistant, khuyến nghị chú trọng xem:

- [Tổng hợp câu hỏi phỏng vấn RAG](./rag-interview-questions.md)
- [Tổng hợp câu hỏi phỏng vấn AI Agent](./agent-interview-questions.md)

### Lớp thứ ba: Thiết kế hệ thống AI

Với ứng viên xã chiêu và có kinh nghiệm dự án, lớp này gần như chắc chắn được hỏi.

Phỏng vấn viên có thể trực tiếp cho bạn một câu hỏi mở:

- Cách thiết kế hệ thống hỏi đáp knowledge base AI cấp doanh nghiệp?
- Cách thiết kế nền tảng Agent cấp sản xuất?
- Cách thiết kế model gateway hỗ trợ rate limiting, circuit breaker, xuống cấp và thống kê chi phí?
- Cách thiết kế hệ thống đánh giá ứng dụng AI? Golden Set, LLM-as-Judge, Trace playback làm như thế nào?
- Cách thiết kế voice Agent thời gian thực? Xử lý ngắt, độ trễ thấp, state machine như thế nào?

Loại câu hỏi này kiểm tra năng lực kiến trúc. Bạn không thể chỉ nói "dùng LangChain xây một RAG", mà phải nói rõ lớp đầu vào, lớp biên soạn, Prompt/Context, RAG, Memory, Tool, model gateway, khả năng quan sát, đánh giá, tuân thủ bảo mật những module này lần lượt giải quyết vấn đề gì.

Câu hỏi system design khuyến nghị xem trực tiếp: [Tổng hợp câu hỏi phỏng vấn thiết kế hệ thống AI](./ai-system-design-interview-questions.md).

## Cách ôn tập bộ câu hỏi phỏng vấn này?

Bộ câu hỏi phỏng vấn này phù hợp hơn với phương pháp "xây dựng khung trước, quay lại bài gốc để học sâu".

### 1. Dùng câu hỏi phỏng vấn để xây dựng bản đồ kiến thức

Trước tiên lướt qua 4 bài câu hỏi phỏng vấn, không yêu cầu nhớ ngay tất cả đáp án. Mục tiêu lần đầu là biết phỏng vấn phát triển ứng dụng AI sẽ hỏi những hướng nào:

- Cơ bản mô hình lớn
- RAG
- Agent
- MCP và gọi công cụ
- Prompt và Context Engineering
- Thiết kế hệ thống AI
- Đánh giá ứng dụng AI
- Voice Agent thời gian thực

Bước này giúp bạn tránh ôn tập theo kiểu "đánh trái bỏ phải".

### 2. Quay lại bài gốc để bổ sung hiểu biết nền tảng

Sau mỗi câu hỏi đều có đính kèm link bài viết tham khảo. Gặp câu trả lời không được, đừng vội học thuộc đáp án tiêu chuẩn, trước tiên quay lại bài gốc để xem logic hoàn chỉnh.

Ví dụ:

- Token, cửa sổ ngữ cảnh, tham số lấy mẫu không rõ, xem [《Cơ chế hoạt động LLM》](../llm-basis/llm-operation-mechanism.md).
- Function Calling, Structured Outputs, ranh giới MCP không rõ, xem [《Giải thích đầu ra có cấu trúc mô hình lớn》](../llm-basis/structured-output-function-calling.md) và [《Phân tích toàn diện giao thức MCP》](../agent/mcp.md).
- Tối ưu hiệu quả RAG không giải thích được, xem [《Giải thích toàn diện tối ưu truy xuất RAG》](../rag/rag-optimization.md).
- Kiến trúc ứng dụng AI cấp sản xuất không giải thích được, xem [《Thiết kế hệ thống ứng dụng AI》](../system-design/ai-application-architecture.md).

Câu hỏi phỏng vấn giúp bạn định vị điểm kiểm tra, bài chính giúp bạn bổ sung chain nhân quả hoàn chỉnh.

### 3. Cuối cùng dùng "biểu đạt kỹ thuật" để tổ chức đáp án

Câu hỏi phỏng vấn AI đừng chỉ trả lời "là gì", khuyến nghị tổ chức theo cấu trúc này:

1. **Trước tiên giải thích khái niệm**: Một câu nói rõ nó là gì.
2. **Rồi nêu vấn đề**: Nó sẽ gây ra ảnh hưởng gì trong hệ thống thực tế.
3. **Tiếp theo đưa ra giải pháp**: Môi trường sản xuất thiết kế, chẩn đoán, tối ưu hoặc quản trị như thế nào.
4. **Cuối cùng nói ranh giới**: Tình huống nào áp dụng, tình huống nào không áp dụng.

Ví dụ hỏi "tỷ lệ thu hồi RAG thấp tối ưu như thế nào", đừng trực tiếp liệt kê Hybrid Search, Rerank, Query Rewrite. Câu trả lời tốt hơn là:

Trước tiên xác định tài liệu đúng có vào pool ứng viên không; nếu không, chẩn đoán phân tích tài liệu, Chunk, Embedding, Metadata, Query Rewrite; nếu vào rồi nhưng xếp hạng thấp, rồi xem xét Hybrid Search, Rerank, kích thước pool ứng viên và trọng số hợp nhất; nếu bằng chứng vào ngữ cảnh nhưng câu trả lời vẫn sai, rồi xem Prompt, vị trí ngữ cảnh, mô hình có trung thực sử dụng bằng chứng và mẫu đánh giá.

Loại trả lời này trông giống thực sự đã làm qua hệ thống.

## Các giai đoạn kinh nghiệm khác nhau ôn tập như thế nào?

Nói kết luận trước: **Các giai đoạn kinh nghiệm khác nhau không phải khác biệt "có xem hay không xem module nào", mà là độ sâu nắm vững khác nhau.**

Ngay cả sinh viên mới ra trường, cũng khuyến nghị ít nhất hiểu các vấn đề cơ bản về Agent và thiết kế hệ thống AI. Hiện tại nhiều dự án tuyển dụng trường, thực tập đều có viết chatbot thông minh, hỏi đáp knowledge base, AI assistant, AI coding tool, nếu bạn hoàn toàn không hiểu Agent Loop, pipeline RAG và kiến trúc cấp sản xuất, phỏng vấn viên hỏi thêm là dễ lộ điểm yếu.

Cách ôn tập hợp lý hơn là: tất cả mọi người đều cần xây dựng bản đồ hoàn chỉnh, chỉ là độ sâu phân lớp.

### Sinh viên và 0-1 năm

Mục tiêu không phải học thuộc tất cả chi tiết kỹ thuật, mà có thể giải thích rõ pipeline cơ bản của phát triển ứng dụng AI.

- [Tổng hợp câu hỏi phỏng vấn cơ bản mô hình lớn](./llm-interview-questions.md)
- [Tổng hợp câu hỏi phỏng vấn AI Agent](./agent-interview-questions.md)
- [Tổng hợp câu hỏi phỏng vấn RAG](./rag-interview-questions.md)
- [Tổng hợp câu hỏi phỏng vấn thiết kế hệ thống AI](./ai-system-design-interview-questions.md)

Giai đoạn này khuyến nghị tập trung đạt được:

- Cơ bản mô hình lớn: Có thể giải thích rõ Token, cửa sổ ngữ cảnh, tham số lấy mẫu, đầu ra có cấu trúc tại sao ảnh hưởng đến ổn định kỹ thuật.
- RAG: Có thể vẽ pipeline cơ bản "xử lý tài liệu -> Chunk -> Embedding -> vector store -> truy xuất -> tạo sinh", và biết thu hồi không chính xác không thể chỉ sửa Prompt.
- Agent: Có thể giải thích sự khác biệt giữa Agent với Chatbot thông thường và Workflow, biết Agent Loop, Memory, Tools là gì.
- System design: Có thể dùng ngôn ngữ đơn giản mô tả một hệ thống hỏi đáp knowledge base AI bao gồm những module nào, ví dụ xác thực, RAG, gọi mô hình, log và đánh giá.

Sinh viên không nhất thiết phải giải thích model gateway phức tạp, phát lại grayscale và cộng tác multi-Agent, nhưng cần thể hiện bạn không chỉ biết sao chép Demo, mà biết giữa Demo và sản xuất có khoảng cách kỹ thuật.

### 2-3 năm

Giai đoạn này cần nâng cấp từ "biết pipeline" lên "có thể định vị vấn đề, có thể đánh đổi".

- [Tổng hợp câu hỏi phỏng vấn cơ bản mô hình lớn](./llm-interview-questions.md)
- [Tổng hợp câu hỏi phỏng vấn AI Agent](./agent-interview-questions.md)
- [Tổng hợp câu hỏi phỏng vấn RAG](./rag-interview-questions.md)
- [Tổng hợp câu hỏi phỏng vấn thiết kế hệ thống AI](./ai-system-design-interview-questions.md)

Giai đoạn này khuyến nghị tập trung đạt được:

- Cơ bản mô hình lớn: Có thể giải thích rõ pipeline gọi API, idempotency, rate limiting, retry, xử lý thất bại đầu ra có cấu trúc.
- RAG: Có thể chẩn đoán vấn đề theo các đoạn xử lý tài liệu, thu hồi, sắp xếp, ngữ cảnh, tạo sinh, đánh giá.
- Agent: Có thể giải thích rõ ranh giới và cách kết hợp Agent Loop, Memory, MCP, Function Calling, Skills.
- System design: Có thể giải thích các module cốt lõi của ứng dụng AI cấp sản xuất, ít nhất bao gồm quản lý Prompt, RAG, Tool Calling, bảo mật và khả năng quan sát.

Phỏng vấn viên sẽ chú ý hơn đến việc bạn có thể tích hợp năng lực AI vào hệ thống nghiệp vụ thực tế không. Ví dụ "knowledge base cập nhật rồi nhưng câu trả lời cũ vẫn còn thì sao", "gọi công cụ thất bại cần xuống cấp như thế nào", "cách chứng minh Prompt mới tốt hơn Prompt cũ", những câu hỏi này cần có đáp án kỹ thuật hóa.

### 3 năm trở lên

Giai đoạn này system design sẽ trở thành trọng tâm, nhưng cơ bản mô hình lớn, RAG và Agent vẫn không thể bỏ. Sự khác biệt là: bạn không thể chỉ nói kỹ thuật đơn điểm, phải nói được kiến trúc hoàn chỉnh, chiến lược quản trị và lộ trình tiến hóa.

- [Tổng hợp câu hỏi phỏng vấn cơ bản mô hình lớn](./llm-interview-questions.md)
- [Tổng hợp câu hỏi phỏng vấn AI Agent](./agent-interview-questions.md)
- [Tổng hợp câu hỏi phỏng vấn RAG](./rag-interview-questions.md)
- [Tổng hợp câu hỏi phỏng vấn thiết kế hệ thống AI](./ai-system-design-interview-questions.md)

Giai đoạn này khuyến nghị tập trung đạt được:

- Thiết kế kiến trúc: Có thể phân tách lớp đầu vào, lớp biên soạn, Prompt/Context, RAG, Memory, Tool, model gateway, đánh giá quan sát và module tuân thủ bảo mật.
- Năng lực quản trị: Có thể giải thích rõ định tuyến mô hình, fallback, quy nhân chi phí Token, quản lý phiên bản Prompt, cách ly quyền, log kiểm toán.
- Vòng lặp chất lượng: Có thể giải thích Golden Set, Trace playback, grayscale trực tuyến, LLM-as-Judge và kiểm tra thủ công phối hợp như thế nào.
- Kiểm soát rủi ro: Có thể xử lý Prompt Injection, vượt quyền công cụ, rò rỉ quyền riêng tư, lọc quyền RAG, sự cố nhà cung cấp mô hình và các vấn đề khác.

Giai đoạn này dễ bị hỏi thêm "nếu hiệu quả xấu đi sau khi lên mạng, bạn chẩn đoán như thế nào?", "nếu nhà cung cấp mô hình rate limit, bạn xuống cấp như thế nào?", "nếu công cụ Agent gọi sai thì sao?", "cách chứng minh Prompt mới tốt hơn Prompt cũ?" Những câu hỏi này đều cần vòng lặp kỹ thuật, không phải đáp án khái niệm.

## Những câu hỏi phỏng vấn này và chuyên mục AI có quan hệ gì?

Có thể hiểu như thế này:

- Bài viết này là điểm vào, giúp bạn nhanh chóng định vị điểm kiểm tra tần suất cao.
- [Chuyên mục phát triển ứng dụng AI](../) là bài chính, giúp bạn phân tích sâu nguyên lý, chi tiết kỹ thuật và giải pháp thực hành đằng sau mỗi điểm kiểm tra.

Trang câu hỏi phỏng vấn sẽ không viết tất cả đáp án thành hàng vạn chữ, nếu không sẽ rất khó để ôn tập. Nó giống chỉ mục và bản đồ lộ trình hơn: nói cho bạn biết nên hỏi gì, nên nắm gì, nên quay lại bài viết nào để tiếp tục học.

Nếu bạn chỉ muốn "học tốc chiến", có thể trước tiên lướt qua 4 bài câu hỏi phỏng vấn; nếu bạn muốn thực sự bổ sung chắc phần phát triển ứng dụng AI này, khuyến nghị theo chuyên đề đọc hết bài gốc.

## Sẽ tiếp tục cập nhật

Phát triển ứng dụng AI vẫn đang thay đổi nhanh, câu hỏi phỏng vấn cũng sẽ tiếp tục cập nhật. Nếu sau này xuất hiện hướng tần suất cao mới, ví dụ multimodal Agent, mô hình phía thiết bị đầu cuối, kỹ thuật hóa AI Coding, thực hành hệ sinh thái MCP, nền tảng đánh giá cấp doanh nghiệp, tôi cũng sẽ tiếp tục bổ sung vào bộ câu hỏi phỏng vấn này.

Nếu bạn thấy câu hỏi tần suất cao nào chưa được bao gồm, cũng hoan nghênh để lại bình luận trong khu vực issue dự án.
