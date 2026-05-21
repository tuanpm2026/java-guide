---
title: Tổng hợp câu hỏi phỏng vấn AI Agent
description: Tổng hợp có hệ thống các câu hỏi phỏng vấn AI Agent tần suất cao, bao gồm khái niệm cốt lõi Agent, Agent Loop, Memory, Prompt Engineering, Context Engineering, MCP, Agent Skills, Harness Engineering, Workflow, Graph, Loop và các điểm kiểm tra cốt lõi khác, kèm bài viết tham khảo tương ứng.
category: AI
tag:
  - Phỏng vấn Agent
  - AI Agent
  - Phỏng vấn AI
head:
  - - meta
    - name: keywords
      content: AI Agent面试题,Agent面试题,AI Agent面试,Agent Loop面试,Agent Memory面试题,MCP面试题,Prompt工程面试题,Context Engineering面试,Harness Engineering面试,Agent Skills面试题
---

Phỏng vấn AI Agent dễ rơi vào hai thái cực: một là mô tả Agent như "nhân viên số tự động hóa hoàn toàn", tự mình lập kế hoạch, tự mình thực thi mọi thứ; hai là mô tả Agent như "vài cái Prompt nối lại", hoàn toàn không thấy khác gì workflow thông thường.

Câu trả lời thực sự tốt cần nằm ở giữa: **Cốt lõi của Agent không phải ý thức tự chủ huyền bí, mà là một hệ thống thực thi nhiệm vụ được xây dựng xung quanh mô hình lớn**. Nó cần có vòng lặp chạy, cung cấp ngữ cảnh, cơ chế bộ nhớ, gọi công cụ, ranh giới an toàn, phục hồi thất bại và vòng lặp đánh giá.

Bộ câu hỏi phỏng vấn AI Agent này được tổng hợp dựa trên các bài viết hiện có trong chuyên mục AI, trọng tâm không phải để bạn học thuộc "Agent là gì", mà giúp bạn học cách trả lời như thế này:

1. Tại sao Agent cần Loop?
2. Tại sao Agent không thể thiếu Context Engineering?
3. Memory, Tools, MCP, Skills giải quyết vấn đề gì?
4. Khi nào nên dùng Workflow thay vì trực tiếp dùng Agent thuần túy?
5. Sau khi Agent lên sản xuất, cách kiểm soát chi phí, rủi ro và tính không chắc chắn?

Nếu có thể trả lời dọc theo mạch này, phỏng vấn viên thường sẽ cảm thấy bạn không chỉ đọc qua khái niệm, mà thực sự đã suy nghĩ về việc triển khai kỹ thuật.

## Phỏng vấn viên thực sự muốn kiểm tra gì

Câu hỏi Agent về bản chất kiểm tra "cách biên soạn ứng dụng AI phức tạp". Có thể chuẩn bị theo các cấp độ sau.

| Hướng kiểm tra      | Phỏng vấn viên muốn xác nhận gì                                                          | Điểm trừ phổ biến                                                    |
| ------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Cơ bản Agent        | Bạn có thể giải thích rõ sự khác biệt giữa Agent, Workflow và Chatbot thông thường không | Nói Agent là "robot tự động suy nghĩ"                                |
| Agent Loop          | Bạn có hiểu vòng lặp suy luận, hành động, quan sát, sửa chữa không                       | Chỉ nói gọi công cụ, không nói quan sát và lặp lại                   |
| Context Engineering | Bạn có biết chất lượng ngữ cảnh quyết định hiệu suất Agent không                         | Chỉ biết điều chỉnh Prompt, không biết quản lý ngữ cảnh              |
| Memory              | Bạn có phân biệt được trạng thái ngắn hạn, sự kiện dài hạn và tích lũy kinh nghiệm không | Coi lịch sử chat tương đương hệ thống bộ nhớ                         |
| Tools/MCP/Skills    | Bạn có biết ranh giới giữa kết nối công cụ, ý định gọi và task SOP không                 | Nhầm lẫn MCP, Function Calling, Skills thành một                     |
| Workflow/Harness    | Bạn có tư duy kỹ thuật hóa Agent cấp sản xuất không                                      | Mù quáng theo đuổi Agent thuần túy, không xem xét khả năng kiểm soát |

Khi trả lời câu hỏi Agent, nên nói ít về "thông minh", nói nhiều về "ràng buộc". Vì trong dự án thực tế, vấn đề lớn nhất của Agent không phải không làm được việc, mà là không ổn định, không thể kiểm soát, khó chẩn đoán, chi phí cao.

## Cơ bản Agent

Bài viết tham khảo: [《Khái niệm cốt lõi AI Agent: Agent Loop, Context Engineering, đăng ký Tools》](../agent/agent-basis.md)

Nhóm câu hỏi này là điểm vào của phỏng vấn Agent. Trọng tâm không phải học thuộc công thức, mà là giải thích rõ ranh giới giữa Agent với chương trình truyền thống và Workflow.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Agent có thể được hiểu là tổ hợp LLM + Planning + Memory + Tools, nhưng công thức này chỉ là điểm khởi đầu, không phải kiến trúc sản xuất hoàn chỉnh.
- Chatbot thông thường chủ yếu trả lời câu hỏi, Agent nhấn mạnh hơn vào thực thi nhiệm vụ đa bước và gọi công cụ bên ngoài.
- Đường dẫn của Workflow cố định hơn, phù hợp với các tình huống quy trình rõ ràng cần khả năng kiểm soát; Agent thuần túy phù hợp hơn với các nhiệm vụ mở mà đường dẫn khó liệt kê trước.
- ReAct, Plan-and-Execute, Reflection, Multi-Agent không phải càng phức tạp càng tốt, cần lựa chọn kết hợp với độ phức tạp nhiệm vụ, chi phí debug và yêu cầu khả năng chịu lỗi.

Câu hỏi tần suất cao:

- AI Agent là gì? Khác gì với Chatbot thông thường?
- Công thức Agent = LLM + Planning + Memory + Tools hiểu như thế nào?
- Quy trình hoàn chỉnh của Agent Loop là gì?
- Sự khác biệt cốt lõi giữa Agent với lập trình truyền thống và Workflow là gì?
- ReAct, Plan-and-Execute, Reflection, Multi-Agent phù hợp với tình huống nào?
- Khi đăng ký Tools, tại sao description của công cụ rất quan trọng?
- Khi nào dùng Agent thuần túy, khi nào dùng Workflow hoặc Agentic Workflow?
- Vấn đề chính của cộng tác Multi-Agent là gì? Tại sao không thể mù quáng dùng nhiều Agent trong sản xuất?

Cách trả lời ổn định hơn là: Trước tiên thừa nhận khả năng ra quyết định động của Agent, rồi bổ sung chi phí của nó. Ví dụ Agent thuần túy linh hoạt nhưng khó debug, quỹ đạo không ổn định, chi phí Token cao; Workflow có thể kiểm soát nhưng yêu cầu phân tách quy trình trước cao. Tình huống To B thường ưu tiên Workflow hoặc Agentic Workflow, kiểm soát đường dẫn quan trọng, chỉ để mô hình ra quyết định ở các node cần thiết.

![Kiến trúc cốt lõi AI Agent](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-core-arch.png)

![Quy trình làm việc Agent Loop](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-loop-flow.png)

## Agent Memory

Bài viết tham khảo: [《Hệ thống bộ nhớ AI Agent: bộ nhớ ngắn hạn, bộ nhớ dài hạn và cơ chế tiến hóa bộ nhớ》](../agent/agent-memory.md)

Câu hỏi Memory thường được hỏi rất chi tiết, vì nó có thể phân biệt ứng viên "đã thử Demo" và "đã làm hệ thống". Hệ thống bộ nhớ thực sự không phải nhét lịch sử chat vào ngữ cảnh một cách ào ạt, mà là phân lớp, lọc, nén, cập nhật và quản trị thông tin.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Bộ nhớ ngắn hạn giống trạng thái nhiệm vụ hiện tại, chịu trách nhiệm ghi lại thông tin phải giữ lại trong nhiệm vụ này.
- Bộ nhớ dài hạn giống kiến thức xuyên phiên, chịu trách nhiệm tích lũy sở thích người dùng, quy tắc nhóm, quyết định lịch sử và kinh nghiệm.
- Bộ nhớ vector phù hợp với truy xuất ngữ nghĩa, bộ nhớ Markdown phù hợp với thông tin có thể đọc, kiểm tra như quy tắc, sở thích, quy ước dự án.
- Ghi bộ nhớ không thể hoàn toàn để mô hình tự quyết định, nếu không dễ ghi vào thông tin sai, lỗi thời, trùng lặp hoặc nhạy cảm.
- Bộ nhớ chia sẻ nhóm tốt nhất đi qua Git, PR và Review để tiện kiểm toán và rollback.

Câu hỏi tần suất cao:

- Bộ nhớ ngắn hạn và bộ nhớ dài hạn của Agent có gì khác nhau?
- Hệ thống bộ nhớ Agent cần giải quyết những vấn đề cốt lõi nào?
- Bộ nhớ vector và bộ nhớ Markdown phù hợp với tình huống nào?
- Auto Memory là gì? Tại sao nó không thể tự động ghi vô hạn?
- Tại sao bộ nhớ chia sẻ nhóm phù hợp đi qua Git và Code Review?
- Nén bộ nhớ, hết hạn bộ nhớ, xung đột bộ nhớ cần xử lý như thế nào?
- Làm thế nào để tránh bộ nhớ dài hạn ô nhiễm ngữ cảnh?
- Trong phỏng vấn cần giải thích "có bộ nhớ" không phải đơn giản là lưu lịch sử chat như thế nào?

Nếu bị hỏi thêm "thiết kế hệ thống bộ nhớ như thế nào", có thể trả lời theo pipeline đọc-ghi: Trước tiên định nghĩa thông tin nào được phép ghi, rồi lọc thông tin nhạy cảm và loại bỏ trùng lặp; khi ghi ghi lại nguồn, thời gian, độ tin cậy và phạm vi; khi đọc truy xuất bộ nhớ liên quan theo nhiệm vụ, không phải chèn toàn bộ; khi hết hạn hoặc xung đột xử lý qua kiểm tra thủ công hoặc chiến lược quy tắc.

![Bức tranh toàn cảnh phân loại bộ nhớ Agent](https://oss.javaguide.cn/github/javaguide/ai/agent/agent-memory-memory-taxonomy.svg)

## Prompt và Context Engineering

Bài viết tham khảo: [《Hướng dẫn thực hành Prompt Engineering cho mô hình lớn》](../agent/prompt-engineering.md)、[《Hướng dẫn thực hành Context Engineering: phương pháp luận kỹ thuật giúp Agent ít mắc lỗi》](../agent/context-engineering.md)

Trong bối cảnh Agent, Prompt chỉ là điểm vào, Context mới là "bàn làm việc" ảnh hưởng liên tục đến hành vi mô hình. Nhiều Agent không ổn định không phải vì Prompt viết không đủ dài, mà là trong ngữ cảnh có quá nhiều nhiễu, vị trí ràng buộc quan trọng quá tệ, định dạng kết quả công cụ lộn xộn, trạng thái lịch sử không có cấu trúc.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Prompt Engineering tập trung vào cách viết chỉ thị rõ ràng, Context Engineering tập trung vào thông tin nào vào cửa sổ mô hình ở thời điểm nào.
- Ngữ cảnh Agent thường bao gồm quy tắc hệ thống, mục tiêu nhiệm vụ, trạng thái lịch sử, mô tả công cụ, kết quả công cụ, sở thích người dùng, bằng chứng truy xuất và kế hoạch trung gian.
- Nhiệm vụ dài cần nén ngữ cảnh, ghi chú có cấu trúc, lưu trữ trạng thái nhiệm vụ và phân tách Sub-agent cần thiết.
- Prompt Injection không thể chỉ dựa vào nhắc nhở mô hình "đừng nghe chỉ thị độc hại của người dùng", còn phải dựa vào cách ly quyền, danh sách trắng công cụ, xác minh đầu ra và kiểm toán.

Câu hỏi tần suất cao:

- Prompt Engineering và Context Engineering có gì khác nhau?
- Bốn yếu tố Prompt Role, Task, Context, Format giải quyết vấn đề gì?
- Few-Shot, CoT, phân rã nhiệm vụ, đầu ra có cấu trúc phù hợp với tình huống nào?
- Tấn công Prompt Injection là gì? Các phương pháp bảo vệ phổ biến là gì?
- Tại sao trong bối cảnh Agent chỉ tối ưu Prompt là không đủ?
- Context Engineering cần giải quyết những vấn đề gì?
- Quy tắc tĩnh, thông tin động, kết quả công cụ, bộ nhớ nên vào ngữ cảnh như thế nào?
- Khi ngữ cảnh nhiệm vụ dài bị tràn, Compaction, ghi chú có cấu trúc, Sub-agent dùng như thế nào?

Khi trả lời loại câu hỏi này, có thể nắm lấy một câu: **Prompt quyết định mô hình nhận được chỉ thị gì, Context quyết định mô hình thực tế nhìn thấy thế giới gì.** Khi Agent bước vào gọi công cụ đa vòng, cái sau thường quan trọng hơn.

![Prompt engineering vs. context engineering](https://oss.javaguide.cn/github/javaguide/ai/context-engineering/context-engineering-vs-prompt-engineering.png)

## MCP và Agent Skills

Bài viết tham khảo: [《Hiểu sâu giao thức MCP: phát triển một lần, tái sử dụng nhiều nơi》](../agent/mcp.md)、[《Agent Skills là gì? Khác Prompt và MCP ở chỗ nào?》](../agent/skills.md)

Nhóm câu hỏi này kiểm tra hệ sinh thái công cụ và tái sử dụng năng lực. Nhiều người sẽ gọi MCP, Function Calling, Skills đều là "gọi công cụ", trả lời như vậy sẽ cho thấy ranh giới không rõ ràng.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Function Calling giải quyết cách mô hình xuất ý định gọi công cụ có cấu trúc.
- MCP giải quyết cách công cụ được phát hiện, mô tả, gọi và trả kết quả một cách chuẩn hóa.
- Skills giải quyết khi Agent thực hiện một loại nhiệm vụ, nên thực thi theo kinh nghiệm và quy trình nào.
- MCP giống giao diện năng lực hơn, Skills giống task SOP hơn. Hai loại có thể kết hợp sử dụng.
- Kết nối công cụ cấp sản xuất phải có quyền, xác minh tham số, kiểm toán, timeout, retry và chiến lược xuống cấp.

Câu hỏi tần suất cao:

- MCP giải quyết vấn đề gì? Tại sao thường được ví như USB-C trong lĩnh vực AI?
- MCP Client, MCP Server, Host lần lượt là gì?
- Tools, Resources, Prompts trong MCP giải quyết vấn đề gì?
- Sự khác biệt giữa MCP và Function Calling là gì?
- MCP Server cấp sản xuất cần làm quản trị bảo mật gì?
- Agent Skills là gì? Ranh giới của nó với Prompt, MCP, Function Calling là gì?
- Tại sao Skills cần tải trễ?
- Định tuyến Skill làm như thế nào? Tại sao nó giống RAG nhưng mục tiêu khác?
- Viết một `SKILL.md` dễ mắc những cạm bẫy nào?

Trong phỏng vấn có thể tóm tắt như sau: Function Calling là "mô hình biểu đạt muốn gọi công cụ như thế nào", MCP là "công cụ kết nối vào host như thế nào", Skills là "Agent thực hiện loại nhiệm vụ này theo kinh nghiệm nào". Ba loại không phải quan hệ thay thế, mà là tổ hợp ở các cấp độ khác nhau.

## Harness Engineering

Bài viết tham khảo: [《Hiểu Harness Engineering trong một bài viết: kiến trúc sáu lớp, quản lý ngữ cảnh và thực chiến nhóm tuyến đầu》](../agent/harness-engineering.md)

Harness Engineering là một phần tương đối nâng cao trong phỏng vấn Agent. Tư tưởng cốt lõi của nó là: đừng hoàn toàn quy nhân hiệu suất Agent cho bản thân mô hình, quản lý nhiệm vụ, cung cấp ngữ cảnh, phản hồi công cụ, cơ chế xác minh, phục hồi lỗi bên ngoài mô hình cũng quyết định giới hạn trên của hệ thống.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Agent = Model + Harness. Mô hình chịu trách nhiệm suy luận và tạo sinh, Harness chịu trách nhiệm tổ chức nhiệm vụ, ngữ cảnh, công cụ và phản hồi.
- Mỗi component trong Harness về bản chất đều mã hóa một giả định: mô hình một mình làm không tốt cái gì.
- Sau khi năng lực mô hình nâng cấp, Harness cũng cần đánh giá lại. Một số bản vá cần thiết trước đây có thể trở thành độ phức tạp mới.
- Ô nhiễm ngữ cảnh, tích lũy entropy code, độ tin cậy gọi công cụ là ba loại vấn đề rất phổ biến trong kỹ thuật Agent tuyến đầu.

Câu hỏi tần suất cao:

- Harness Engineering là gì? Quan hệ với Prompt Engineering, Context Engineering là gì?
- Tại sao nói Agent = Model + Harness?
- Kiến trúc sáu lớp của Harness lần lượt giải quyết vấn đề gì?
- Sau khi năng lực mô hình nâng cấp, tại sao một số cơ chế trong Harness cần xác minh lại?
- Ô nhiễm ngữ cảnh, tích lũy entropy code, độ tin cậy gọi công cụ lần lượt được quản trị như thế nào?
- Tại sao kỹ thuật Agent cần evaluator, validator và quản lý trạng thái nhiệm vụ?
- Khi làm kỹ thuật hóa Agent, điểm khó chung mà các nhóm tuyến đầu gặp phải là gì?

Khi trả lời đừng nói Harness như tập hợp từ mới. Cách tốt hơn là dùng vấn đề cụ thể để dẫn ra: Agent đi lạc giữa chừng trong nhiệm vụ dài, cần trạng thái nhiệm vụ và kiểm tra giai đoạn; công cụ trả về lỗi, mô hình cần phản hồi lỗi có thể sửa chữa; tạo sinh code triển khai trùng lặp logic đã có, cần cơ chế truy xuất và loại bỏ trùng lặp. Đây đều là năng lực hệ thống mà Harness cần bổ sung.

![Quan hệ giữa Harness và Prompt/Context Engineering](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-engineering-layers-arch.png)

## Workflow, Graph và Loop

Bài viết tham khảo: [《Workflow, Graph và Loop trong AI Workflow: từ khái niệm đến triển khai》](../agent/workflow-graph-loop.md)

Nhóm câu hỏi này phù hợp để thể hiện phán đoán kỹ thuật. Nhiều tình huống nghiệp vụ không phù hợp với Agent thuần túy, mà phù hợp hơn để thiết kế quy trình thành Graph, để mô hình chỉ tạo sinh, phán đoán hoặc định tuyến ở các node cần thiết.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Workflow là quá trình nhiệm vụ, Graph là carrier cấu trúc, Loop là mô hình điều khiển.
- Trong Graph, Node chịu trách nhiệm thực thi, Edge chịu trách nhiệm chuyển tiếp, State chịu trách nhiệm lưu ngữ cảnh xuyên node.
- Loop phải có điều kiện tiếp tục, điều kiện thoát và ranh giới an toàn, nếu không rất dễ vòng lặp vô hạn hoặc đốt Token.
- Cập nhật State cần thiết kế chiến lược: trường đơn giá trị dùng Replace, trường log dùng Append, trường ghi song song cần Reducer.

Câu hỏi tần suất cao:

- Tại sao hệ thống AI cần workflow?
- Quan hệ giữa Workflow, Graph, Loop ba cái là gì?
- Graph Loop và Agent Loop có gì khác nhau?
- Loop làm thế nào để ngăn vòng lặp vô hạn?
- Chiến lược cập nhật State chọn như thế nào? Replace, Append, Reducer phù hợp với trường nào?
- Cạnh điều kiện và định tuyến động có gì khác nhau?
- Sau khi workflow bị gián đoạn, cách phục hồi?
- Workflow có những rủi ro bảo mật đặc thù nào?

Nếu phỏng vấn viên hỏi "bạn sẽ thiết kế một quy trình Agent phức tạp như thế nào", có thể trước tiên vẽ ra chain chính cố định, rồi nói rõ node nào do mô hình phán đoán, node nào phải được kiểm soát bởi quy tắc và code. Như vậy đáng tin hơn là trực tiếp nói "để Agent tự lập kế hoạch".

## Khung trả lời câu hỏi

Câu hỏi Agent có thể trả lời theo mạch chính này:

1. Trước tiên định nghĩa loại nhiệm vụ: là hỏi đáp, truy xuất, gọi công cụ, nhiệm vụ đa bước, hay nhiệm vụ chu kỳ dài.
2. Rồi chọn phương thức biên soạn: Agent thuần túy, Workflow, Agentic Workflow hoặc Multi-Agent.
3. Tiếp theo nói về các component cốt lõi: Context, Memory, Tools, MCP, Skills, State.
4. Rồi nói về bảo mật và ổn định: quyền, xác minh, timeout, retry, kiểm toán, kiểm soát chi phí.
5. Cuối cùng nói về đánh giá: tỷ lệ hoàn thành nhiệm vụ, độ chính xác gọi công cụ, chất lượng quỹ đạo và phát lại mẫu thất bại.

Ưu điểm của khung này là, nó có thể kéo "Agent rất thông minh" về "hệ thống được thiết kế như thế nào".

## Điểm trừ phổ biến

- Nói Agent như tự động hóa vạn năng, bỏ qua phục hồi thất bại và ranh giới an toàn.
- Chỉ nói Prompt, không nói cung cấp ngữ cảnh, kết quả công cụ và quản lý trạng thái.
- Coi Memory tương đương lịch sử chat.
- Nhầm lẫn MCP, Function Calling, Skills thành một khái niệm.
- Mù quáng đề xuất Multi-Agent, không xem xét chi phí giao tiếp, chi phí debug và vấn đề nhất quán.
- Không biết khi nào nên dùng Workflow thay vì Agent thuần túy.

## Khuyến nghị ôn tập

Khuyến nghị ôn tập theo thứ tự này:

1. Trước tiên xem cơ bản Agent, giải thích rõ sự khác biệt giữa Agent, Chatbot và Workflow.
2. Rồi xem Memory và Context Engineering, hiểu chìa khóa ổn định của Agent.
3. Tiếp theo xem MCP, Skills, Function Calling, nắm ranh giới hệ sinh thái công cụ.
4. Cuối cùng xem Harness Engineering và Workflow, thu hẹp kiến thức vào kiến trúc cấp sản xuất.

Khi ôn tập đừng chỉ hỏi "Agent là gì", hãy tiếp tục hỏi: Nó lấy thông tin như thế nào? Nó gọi công cụ như thế nào? Nó nhớ trạng thái như thế nào? Nó phục hồi thất bại như thế nào? Nó đánh giá như thế nào? Trả lời được những câu hỏi này mới thực sự trông như đã làm Agent.
