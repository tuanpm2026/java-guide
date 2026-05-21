---
title: Hướng dẫn thực hành Context Engineering：Phương pháp kỹ thuật giúp Agent ít phạm sai lầm hơn
description: Phân tích chuyên sâu các khái niệm cốt lõi của Context Engineering, bao gồm sắp xếp quy tắc tĩnh, gắn kết thông tin động, giảm cấp ngân sách Token, chiến lược tải theo nhu cầu và lưu trữ ngữ cảnh cho tác vụ dài hạn, giúp lập trình viên xây dựng hệ thống cung cấp ngữ cảnh Agent với tỷ lệ tín hiệu/nhiễu cao.
category: Phát triển ứng dụng AI
head:
  - - meta
    - name: keywords
      content: Context Engineering,上下文工程,Agent,LLM,RAG,Prompt Engineering,Compaction,Sub-agent
---

Xin chào mọi người, tôi là Guide.

Hai năm vừa rồi trong cộng đồng AI có một hiện tượng rất thú vị: cùng một mô hình, cùng một framework code, tại sao Agent của người khác có thể hoàn thành nhiệm vụ ổn định, còn của bạn thì lúc nào cũng lạc hướng, thao tác lặp đi lặp lại, hoặc xuất ra những thứ trông có vẻ đúng nhưng thực tế không hoạt động được?

Câu trả lời rất có thể nằm ở **ngữ cảnh**.

## Bắt đầu từ một ví dụ

**Tại sao cùng một mô hình nhưng hiệu suất Agent lại khác nhau hoàn toàn?**

Hãy xem một kịch bản hỗ trợ sau bán hàng thương mại điện tử. Người dùng gửi tin nhắn:

> "Tai nghe tôi mua tuần trước bị mất tiếng ở tai phải, xử lý thế nào?"

**Agent đơn giản** (ngữ cảnh nghèo nàn):

```text
User: 我上周买的耳机右耳没声音了，怎么处理？
Model: 抱歉给您带来不便。请问您购买的是哪款耳机？订单号是多少？能否描述一下具体故障表现？
```

Logic code hoàn toàn đúng, gọi LLM cũng bình thường, nhưng đầu ra giống như một nhân viên hỗ trợ mới đang đọc sổ tay quy trình — luôn luôn đòi thêm thông tin, không bao giờ chủ động tổng hợp.

**Agent đầy đủ** (ngữ cảnh đầy đủ):

Trước khi gọi LLM, hệ thống đã thực hiện một vòng lắp ráp ngữ cảnh:

- Truy vấn hệ thống đơn hàng → Xác định bản ghi mua hàng tuần trước: Sony WH-1000XM5, đặt ngày 25 tháng 3
- Kiểm tra trạng thái bảo hành → Còn trong thời hạn đổi trả 7 ngày vô điều kiện
- Xem lịch sử phiếu hỗ trợ → Khách hàng cũ, không có tranh chấp hỗ trợ trước đây
- Gắn công cụ `create_return_order` và `check_inventory`

Rồi mới tạo phản hồi:

> "Xin chào, tôi thấy bạn đã mua Sony WH-1000XM5 vào ngày 25 tháng 3, hiện vẫn còn trong thời hạn đổi trả. Tôi có thể trực tiếp khởi tạo yêu cầu đổi hàng cho bạn, kho hiển thị còn hàng cùng model, dự kiến giao hàng mới trong 2-3 ngày. Bạn có muốn tôi thực hiện không?"

**Chất và lượng của ngữ cảnh đã thay đổi**.

Nói một câu: **Hầu hết các thất bại của Agent hiện tại đều có nguồn gốc từ ngữ cảnh**. Ngữ cảnh không đủ, dù mô hình mạnh đến đâu cũng vô ích; ngữ cảnh đúng, mô hình ở mức trung bình cũng có thể hoàn thành nhiệm vụ.

## Hiểu Context Engineering

### Nó khác Prompt Engineering như thế nào?

Tobi Lutke có một câu nói rất xác đáng: Context Engineering là "the art of providing all the context for the task to be plausibly solvable by the LLM" — cung cấp đủ ngữ cảnh cho LLM để nhiệm vụ trở nên có thể giải quyết được trong khả năng của nó.

Lưu ý từ khóa ở đây là **plausibly** (có thể chấp nhận được), nhấn mạnh không phải "LLM nhất định giải quyết được", mà là "có đủ ngữ cảnh, nhiệm vụ mới trở nên hợp lý có thể giải quyết được" — đây là kỳ vọng thận trọng về ranh giới năng lực mô hình.

Nhiều bài viết nhầm lẫn Context Engineering với Prompt Engineering, điều đó là không đúng.

- **Prompt Engineering** tập trung vào việc soạn thảo và sắp xếp chính chỉ thị, câu hỏi cốt lõi là "cách diễn đạt, cách sắp xếp".
- **Context Engineering** là xây dựng một hệ thống động, câu hỏi cốt lõi là "thông tin gì, với định dạng nào, vào thời điểm nào được đưa vào ngữ cảnh".

Hình ảnh này từ blog chính thức của Anthropic so sánh rất sinh động giữa hai khái niệm:

![Prompt engineering vs. context engineering](/images/github/javaguide/ai/context-engineering/context-engineering-vs-prompt-engineering.png)

Nếu Prompt Engineering là một khẩu quyết dạy đầu bếp nấu ăn, thì Context Engineering là cung cấp cho anh ta một căn bếp được trang bị đầy đủ — bao gồm kho nguyên liệu, phân loại dụng cụ, sổ tay tham khảo nhiệt độ.

![So sánh chiều kích Prompt vs Context Engineering](/images/github/javaguide/ai/context-engineering/prompt-vs-context-engineering-dimension-comparison.svg)

Hiểu theo cách khác: **Context Engineering chính là "quản lý bộ nhớ và phân trang" của LLM**.

Cửa sổ ngữ cảnh của LLM là bộ nhớ có giới hạn, Context Engineering quyết định bộ nhớ này chứa gì, bỏ ra cái gì, khi nào đọc ghi. Khi cửa sổ ngữ cảnh đầy, cần quyết định nội dung nào bị loại bỏ — điều này hoàn toàn giống với tư duy thuật toán thay thế trang trong hệ điều hành (LRU, chiến lược ưu tiên), và chính xác tương ứng với ba chiến lược giảm cấp Token mà chúng ta sẽ nói đến sau.

### Context Engineering cụ thể bao gồm những gì?

Từ góc độ thực chiến, những gì Context Engineering quản lý có thể chia thành sáu mảng cốt lõi:

- **System Prompt (Chỉ thị hệ thống)**: Sắp xếp có cấu trúc Prompt tĩnh. Ví dụ như các tệp cấu hình `.cursorrules`, `.claude/rules`, cốt lõi là phân tích rõ ràng thiết lập vai trò, mục tiêu, ràng buộc, luồng thực thi, định dạng đầu ra, để mô hình không bị lạc đường trong các nhiệm vụ phức tạp.
- **User Prompt**: Dữ liệu và chỉ thị nghiệp vụ.
- **Memory (Hệ thống bộ nhớ)**: Bộ nhớ ngắn hạn (quản lý cửa sổ trượt Session) và bộ nhớ dài hạn (trích xuất sự kiện cốt lõi + lưu trữ cơ sở dữ liệu vector).
- **RAG & Tools (Tăng cường động)**: Truy xuất tài liệu bên ngoài theo nhu cầu làm kiến thức nền + gắn mô tả công cụ vào ngữ cảnh theo dạng có cấu trúc. Về bản chất, RAG chính là một mô hình triển khai cụ thể của Context Engineering — ba câu hỏi "truy xuất gì, cách truy xuất, cách điền kết quả truy xuất vào ngữ cảnh" bản thân chúng đã là kỹ thuật ngữ cảnh.
- **Structured Output (Đầu ra có cấu trúc)**: Định nghĩa định dạng đầu ra, như JSON Schema, cấu trúc trả về của function call. Điều này ảnh hưởng trực tiếp đến việc phân tích của phía tiêu thụ xuôi dòng và sự kết nối của chuỗi Agent tiếp theo, là một mắt xích dễ bị bỏ qua nhưng có giá trị thực chiến cao.
- **Tối ưu hóa Token (Cắt tỉa ngữ cảnh)**: Nén tóm tắt, loại bỏ lịch sử, Context Caching, kiểm soát tiêu thụ Token trong khi đảm bảo tính toàn vẹn thông tin.

![Cửa sổ ngữ cảnh (Context Window) = "Bộ nhớ làm việc" của LLM](/images/github/javaguide/ai/llm/llm-context-window.png)

## Các mảng kỹ thuật cốt lõi

### Làm thế nào để sắp xếp có cấu trúc các quy tắc tĩnh?

Đây là "cài đặt xuất xưởng" của Agent.

Cách thực hành chủ lưu trong ngành là sắp xếp system prompt bằng định dạng Markdown có cấu trúc cao, bắt buộc phân chia: `[Role]` thiết lập vai trò, `[Objective]` mục tiêu cốt lõi, `[Constraints]` ràng buộc nghiêm ngặt, `[Workflow]` luồng thực thi chuẩn, `[Output Format]` định dạng đầu ra.

Một thực hành kỹ thuật điển hình:

**Memory**

Hệ thống bộ nhớ chia thành ngắn hạn và dài hạn. Bộ nhớ ngắn hạn thường là cửa sổ trượt trong Session, bộ nhớ dài hạn thường là sau khi trích xuất sự kiện cốt lõi thì ghi vào cơ sở dữ liệu vector, sau đó truy xuất theo nhu cầu.

**RAG & Tools**

RAG chịu trách nhiệm truy xuất tài liệu bên ngoài, nhét nội dung liên quan vào ngữ cảnh; Tools chịu trách nhiệm gắn mô tả công cụ có thể gọi, định dạng tham số, kết quả gọi vào trong đó.

RAG có thể xem là một triển khai của Context Engineering. Nó trả lời: truy xuất gì, truy xuất như thế nào, kết quả đặt vào ngữ cảnh như thế nào.

**Structured Output**

Đầu ra có cấu trúc cũng thuộc về một phần của ngữ cảnh, ví dụ như JSON Schema, cấu trúc trả về của function call.

Nó ảnh hưởng đến cách hệ thống xuôi dòng parse, cũng ảnh hưởng đến cách kết nối chuỗi Agent tiếp theo. Nhiều người khi viết Agent thường bỏ qua phần này, cuối cùng giai đoạn parse đầy những việc bẩn.

**Token Optimization (Tối ưu hóa Token)**

Nén tóm tắt, loại bỏ lịch sử, Context Caching đều thuộc về đây, mục tiêu rất đơn giản: bảo toàn tính toàn vẹn thông tin, đồng thời kiểm soát tiêu thụ Token.

![Cửa sổ ngữ cảnh (Context Window) = Bộ nhớ làm việc của LLM](/images/github/javaguide/ai/llm/llm-context-window.png)

## Triển khai thực tế Context Engineering

### Trước tiên viết rõ các quy tắc tĩnh

Quy tắc tĩnh có thể hiểu là “cài đặt xuất xưởng” của Agent.

Cách làm phổ biến hiện nay là dùng Markdown có cấu trúc để viết system prompt. Đừng nhồi tất cả vào một đoạn lớn, mà hãy tách ra thành vai trò, mục tiêu, ràng buộc, luồng thực thi, định dạng đầu ra.

Ví dụ một Agent chẩn đoán sự cố, có thể viết như sau:

```markdown
## 角色

你是一个后端服务故障排查专家，擅长通过日志和监控数据定位问题根因。

## 约束

- 只调用必要的工具，不重复调用相同逻辑的工具
- 发现关键信息时立即停止搜索，输出结论
- 优先使用实时数据而非历史推断

## 执行流

1. 查监控指标（CPU/内存/网络）
2. 查对应时间范围的日志
3. 如发现异常调用链，追踪上下游依赖
4. 输出结构化报告：问题描述 → 根因 → 建议修复方案

## 输出格式

使用 JSON，包含字段：incident_summary, root_cause, evidence, recommendation
```

Cố định các quy tắc này thành tệp `.cursorrules` hoặc `AGENTS.md`, xác suất "lạc đường" của Agent trong các nhiệm vụ phức tạp sẽ giảm đáng kể. Đáng nói là, khi khả năng mô hình không ngừng nâng cao, độ chính xác của định dạng Prompt có thể đang trở nên ít quan trọng hơn — nhưng **khả năng bảo trì** và **hiệu quả cộng tác nhóm** do sắp xếp có cấu trúc mang lại là giá trị lâu dài.

### Làm thế nào để gắn kết thông tin động theo nhu cầu?

Cửa sổ ngữ cảnh không phải thùng rác, không thể nhồi nhét bất kỳ thông tin gì vào. Để gắn kết chính xác, có ít nhất hai điểm cắt vào chính:

- **Lazy loading công cụ (Tool Retrieval)**: Khi Agent đối mặt với một lượng lớn công cụ MCP, gắn tất cả cùng một lúc sẽ trực tiếp làm căng phồng ngữ cảnh và tăng xác suất gọi nhầm. Một giải pháp kỹ thuật khả thi là: trước tiên dùng tìm kiếm vector để chọn ra Top-5 định nghĩa công cụ liên quan nhất đến nhiệm vụ hiện tại, gắn kết theo nhu cầu — logic này hoàn toàn giống với việc chuyên gia con người lật tay sách tìm chương liên quan khi đối mặt với vấn đề mới. Tất nhiên, Anthropic nhấn mạnh hơn vào việc **đơn giản hóa bộ công cụ ngay từ giai đoạn thiết kế**, tránh việc bộ công cụ phình to quá mức dẫn đến quyết định mơ hồ.
- **Bộ nhớ động và RAG**: Bộ nhớ ngắn hạn được quản lý thông qua cửa sổ trượt, sự kiện dài hạn được truy xuất qua cơ sở dữ liệu vector. Trước mỗi lần gắn kết, LLM cũng cần thực hiện một lần "chắt lọc tóm tắt" đối với Observation (như nhật ký lỗi trả về từ API), chỉ ghi kết luận cốt lõi trở lại ngữ cảnh, thay vì dòng lũ dữ liệu thô.

### Phải làm gì khi ngân sách Token không đủ?

Đây là thách thức cốt lõi trong kỹ thuật phức tạp. Khi tác vụ dài tiếp cận giới hạn cửa sổ ngữ cảnh, phải có chiến lược loại bỏ theo mức độ ưu tiên:

![Chiến lược loại bỏ ba cấp của ngân sách Token ngữ cảnh](/images/github/javaguide/ai/context-engineering/context-token-budget-three-level-elimination-strategy.svg)

| Mức độ ưu tiên                     | Nội dung                                           | Cách xử lý                                      |
| ---------------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| **Ưu tiên thấp (có thể gập)**      | Lịch sử hội thoại sớm                              | AI nén tóm tắt                                  |
| **Ưu tiên trung (có thể rút gọn)** | Tài liệu nền truy xuất RAG                         | Cắt tỉa lần hai, giữ đoạn văn cốt lõi           |
| **Ưu tiên cao (bảo vệ tuyệt đối)** | System Constraints, mô tả công cụ cốt lõi hiện tại | Không bao giờ mất, đảm bảo tính nhất quán logic |

Biện pháp tối ưu hóa phối hợp là **Context Caching**: Trong các yêu cầu đồng thời quy mô lớn, phần System Prompt giống nhau chỉ cần tải một lần, giảm đáng kể độ trễ Token đầu tiên và chi phí suy luận.

## Nguyên nhân gốc rễ của thất bại ngữ cảnh

**Tại sao ngữ cảnh càng dài, hiệu quả có thể càng kém?**

Nhiều người khi sử dụng mô hình siêu dài ngữ cảnh có một nhầm lẫn: ngữ cảnh càng dài, mô hình có thể dùng được nhiều thông tin hơn, hiệu quả nên càng tốt.

Sai rồi. Thực tế là: **ngữ cảnh có lợi ích cận biên giảm dần, thậm chí có thể tăng trưởng âm**.

Nguyên nhân đằng sau là cơ chế Attention của LLM. Kiến trúc Transformer khiến mỗi Token phải tính toán quan hệ chú ý với tất cả các Token khác trong ngữ cảnh, điều này có nghĩa là ngữ cảnh n Token sẽ tạo ra tính toán chú ý ở cấp độ n².

Khi ngữ cảnh mở rộng từ 1K đến 100K Token, không đơn giản chỉ là "pha loãng đều đặn". Vấn đề thực sự là: **khả năng phân biệt "liên quan" và "không liên quan" của mô hình giữa nhiều token hơn bị suy giảm**. Trọng số của mỗi query token trong Softmax attention tổng bằng 1, khi ngữ cảnh dài hơn, quan hệ pairwise cấp n² khiến việc nắm bắt chính xác phụ thuộc dài hạn trở nên khó khăn hơn — tỷ lệ tín hiệu/nhiễu càng thấp, mô hình càng khó chọn ra tín hiệu từ nhiễu. Đây chính là hiện tượng "Context Rot" (suy thoái ngữ cảnh) — khi tổng số Token ngữ cảnh tăng lên, khả năng nhớ lại thông tin tổng thể của mô hình giảm theo. Liên quan đến đó còn có vấn đề **Lost in the Middle** được giới học thuật phát hiện: khả năng nhớ của mô hình đối với thông tin ở vị trí giữa ngữ cảnh thấp hơn đáng kể so với đầu và cuối, phân phối dạng chữ U. Hai điều cùng chứng minh một sự thật: ngữ cảnh không phải "càng dài càng tốt".

Quan trọng hơn, mẫu Attention của mô hình được huấn luyện trên dữ liệu chuỗi ngắn — độ dài trung bình của văn bản internet thấp hơn nhiều so với cửa sổ ngữ cảnh hiện tại. Điều này có nghĩa là mô hình không có đủ kinh nghiệm học tập khi xử lý các phụ thuộc dài, khả năng ngoại suy của mã hóa vị trí cũng có giới hạn. Mặc dù có các kỹ thuật nội suy mã hóa vị trí (Position Encoding Interpolation, như YaRN, NTK-aware Interpolation dựa trên RoPE) để giảm thiểu vấn đề ngoại suy chuỗi dài, nhưng suy giảm độ chính xác là có tính cấu trúc, không biến mất hoàn toàn.

**Gợi ý kỹ thuật**: Đường cong suy giảm của các mô hình khác nhau là khác nhau — một số mô hình suy giảm khá chậm, một số khá dốc, do đó ngưỡng tối ưu của độ dài ngữ cảnh cần được kiểm thử thực nghiệm trên mô hình cụ thể. Nhưng có một điều chắc chắn: ngữ cảnh phải được quản lý như một tài nguyên có giới hạn, không phải nhồi càng nhiều càng tốt. Tìm điểm cân bằng "tỷ lệ tín hiệu/nhiễu cao" là nghề thủ công cốt lõi nhất của Context Engineering.

## Nguyên tắc xây dựng ngữ cảnh hiệu quả

### System Prompt viết thế nào mới gọi là "vừa đủ"?

Việc viết System Prompt có hai mẫu thất bại phổ biến:

- **Thái cực thứ nhất: Thiết kế quá mức**. Kỹ sư cứng hóa logic if-else phức tạp vào Prompt, cố gắng kiểm soát chính xác từng bước của Agent. Kết quả là các chỉ thị mong manh như nhà giấy, chi phí bảo trì cực cao, và mô hình vẫn bị lạc đường trong các trường hợp biên chưa gặp bao giờ.

- **Thái cực thứ hai: Quá trừu tượng**. Chỉ đưa ra chỉ thị mơ hồ như "bạn phải là trợ lý hữu ích", mô hình không thể lấy đủ căn cứ quyết định từ đó, hoặc thường xuyên hỏi thêm người dùng, hoặc đầu ra lệch xa kỳ vọng nghiệp vụ.

Cách làm đúng là: **Đủ cụ thể để hướng dẫn hành vi, đồng thời đủ trừu tượng để cung cấp sự khởi phát chung**. Điểm cân bằng giữa cụ thể và trừu tượng, chính là "Goldilocks zone" (vùng vừa đủ) được đề cập trong blog kỹ thuật của Anthropic.

![System Prompt trong quá trình Context Engineering](/images/github/javaguide/ai/context-engineering/calibrating-the-system-prompt.png)

Một lời khuyên thực hành: Trước tiên dùng Prompt tối giản để kiểm tra hiệu suất cơ sở, sau đó bổ sung từng chỉ thị rõ ràng dựa trên failure case. Đừng cố gắng liệt kê hết tất cả quy tắc ngay từ ngày đầu tiên.

> **Gợi ý kỹ thuật**: Cách làm của Anthropic là "Calibrating the system prompt" — coi System Prompt như một tham số cần hiệu chỉnh liên tục, không phải tài liệu cấu hình sản phẩm viết một lần rồi bỏ. Mỗi khi phát hiện một failure case, thêm một quy tắc rõ ràng có mục tiêu, sau đó kiểm thử lại.

### Làm thế nào để thiết kế mô tả công cụ mà không gây hiểu nhầm cho Agent?

Chất lượng định nghĩa công cụ trực tiếp quyết định Agent có "chọn đúng vũ khí" không.

Mô tả công cụ tốt cần trả lời rõ ràng hai câu hỏi: **khi nào nên gọi** và **khi nào không nên gọi**. Nếu một công cụ được mô tả đến mức kỹ sư con người cũng không thể phán đoán có nên dùng hay không, Agent chắc chắn cũng sẽ mắc lỗi.

Trường hợp thất bại phổ biến là công cụ "to và đủ" — nhồi một đống chức năng liên quan nhưng độc lập vào một công cụ, như `manage_database` chứa đồng thời năm khả năng "tạo bảng, truy vấn dữ liệu, xóa dữ liệu, sao lưu, xuất khẩu". Agent sẽ bị mơ hồ khi lựa chọn công cụ, và cũng bị các trường không liên quan làm phiền khi điền tham số.

> 🐛 **Lỗi thường gặp**: Nhiều người nghĩ rằng mô tả công cụ càng chi tiết càng tốt. Thực tế, điểm mấu chốt của mô tả công cụ là "ranh giới rõ ràng" chứ không phải "toàn diện" — vẽ rõ hai đường khi nào nên dùng, khi nào không nên dùng, hiệu quả hơn nhiều so với chất đống mô tả chức năng.

**Một công cụ chỉ làm một việc, mô tả tham số phải bao gồm ví dụ định dạng**. Đây là tiêu chuẩn cơ bản của kỹ thuật hóa, cũng là nguyên tắc cốt lõi của thiết kế công cụ Agent.

### Few-shot nên chọn thế nào, chọn mấy cái?

Few-shot prompting (cung cấp ví dụ) là chiến lược hiệu quả đã được kiểm chứng, nhưng nhiều người dùng sai.

Lỗi điển hình là nhồi vài chục ví dụ edge case vào Prompt, cố gắng bao phủ tất cả quy tắc. Vấn đề của cách làm này là: mô hình sẽ overfitting vào các mẫu bề mặt của những ví dụ đó, mà bỏ qua logic nền tảng thực sự cần học.

Cách làm phổ biến trong ngành là chọn **3-5 ví dụ điển hình đa dạng (canonical examples)**. Anthropic cũng nhấn mạnh rằng sự đa dạng và tính điển hình của ví dụ quan trọng hơn số lượng — "Canonical" có nghĩa là "mang tính quyền uy, tiêu chuẩn hóa", mỗi ví dụ cần đại diện cho mô hình giải quyết của một loại tình huống điển hình, không phải bao phủ tất cả trường hợp biên. Đối với mô hình, ví dụ là dạy học trực quan "một bức ảnh hơn ngàn lời nói", thể hiện "tình huống nào dùng chiến lược nào" chứ không phải "đầu vào nào tương ứng đầu ra nào".

## Truy xuất ngữ cảnh thời gian chạy

### Tại sao pre-retrieval không đủ trong các tình huống Agent phức tạp?

Cách làm của các ứng dụng AI truyền thống là **pre-retrieval** (truy xuất trước): Trước khi gọi LLM, tìm ra tất cả ngữ cảnh liên quan nhất thông qua độ tương đồng Embedding, rồi nhét cả vào Prompt.

Cơ chế này hoạt động tốt trong các tình huống đơn giản, nhưng bắt đầu lộ vấn đề trong các nhiệm vụ phức tạp kiểu Agent: thông tin pre-retrieval lấy được là "liên quan tĩnh", nhưng Agent trong quá trình thực thi sẽ động phát hiện ra các manh mối mới, và những manh mối mới này hoàn toàn không tồn tại vào thời điểm pre-retrieval.

### Just-in-Time (tải theo nhu cầu) hoạt động thế nào?

Chiến lược **Just-in-Time (tải theo nhu cầu)** vì vậy nổi lên.

Ý tưởng cốt lõi của nó là: Khi Agent chạy, không nên tải trước tất cả thông tin có thể liên quan, mà duy trì **tay cầm tham chiếu** nhẹ (đường dẫn file, truy vấn lưu trữ, liên kết Web), khi thực sự cần mới lấy dữ liệu động qua công cụ.

Lấy Claude Code làm ví dụ: Khi xử lý phân tích cơ sở dữ liệu lớn, nó không Load tất cả dữ liệu vào ngữ cảnh, mà viết câu truy vấn định hướng, lưu trữ kết quả, dùng lệnh `head`/`tail` để phân tích file dữ liệu. Agent hiểu vị trí thông tin qua "tên file" và "cấu trúc thư mục" như con người, đánh giá tầm quan trọng qua "kích thước file" và "timestamp", thay vì tải toàn bộ nội dung ngay từ đầu.

Chiến lược này còn có thêm lợi ích: **Meta-dữ liệu bản thân đã là thông tin**. Sự khác biệt ngữ nghĩa giữa `tests/test_utils.py` và `src/core_logic/test_utils.py` được truyền đạt qua đường dẫn file, không cần giải thích thêm. Agent có thể trích xuất ý định từ cấu trúc ngữ cảnh, đây là cách hiệu quả gần với nhận thức của con người.

Anthropic gọi cách này là **Progressive Disclosure (Tiết lộ dần dần)**: Agent dần dần xây dựng hiểu biết về thông tin thông qua khám phá từng lớp, thay vì lấy toàn bộ ngữ cảnh một lần. Mỗi lần tương tác đều tiết lộ ngữ cảnh mới, từ đó hướng dẫn quyết định tiếp theo — kích thước file ám chỉ độ phức tạp, timestamp đại diện tính liên quan, cấu trúc thư mục truyền đạt ngữ nghĩa.

Tất nhiên, tải theo nhu cầu có chi phí rõ ràng: **khám phá thời gian chạy chậm hơn pre-retrieval**, và cũng cần kỹ sư cung cấp đủ công cụ điều hướng tốt (glob, grep, tree...) để Agent không bị lạc trong biển thông tin.

> 🐛 **Lỗi thường gặp**: Nhiều người nghĩ Just-in-Time chỉ là "không cần tiền xử lý là được". Thực tế lại ngược lại — tải theo nhu cầu đặt ra yêu cầu cao hơn cho thiết kế bộ công cụ và chiến lược điều hướng. Nếu quy tắc heuristic điều hướng không đủ tốt, Agent dễ dùng nhầm công cụ, đi vào ngõ cụt, lãng phí không gian ngữ cảnh quý báu.

Quan trọng hơn, nếu thiếu các quy tắc heuristic điều hướng được thiết kế cẩn thận, Agent dễ rơi vào **mô hình khám phá thất bại**: dùng nhầm công cụ, đi vào ngõ cụt, bỏ lỡ thông tin quan trọng. Những thất bại này sẽ trực tiếp tiêu thụ ngân sách chú ý vốn đã hạn chế, làm trầm trọng thêm tình trạng. Vì vậy Just-in-Time không phải là "không cần tiền xử lý là được", mà cần đồng thời thiết kế tốt bộ công cụ và chiến lược điều hướng.

**Giải pháp tối ưu thường là chiến lược hỗn hợp**: Pre-retrieval đối với kiến thức tĩnh có độ chắc chắn cao, tải theo nhu cầu đối với thông tin được khám phá động. Claude Code chính là điển hình — tệp `CLAUDE.md` được tải trước, nhưng nội dung file cụ thể dựa vào Agent khám phá thời gian chạy.

Ranh giới quyết định của chiến lược hỗn hợp cũng có quy luật: **Các tình huống có tỷ lệ nội dung động cao, không gian khám phá lớn** (như phân tích code base, truy xuất thông tin) phù hợp với Just-in-Time là chính; **các tình huống ít nội dung động, ngữ cảnh ổn định** (như xét duyệt văn bản pháp lý, phân tích báo cáo tài chính) phù hợp hơn với pre-retrieval + bổ sung thời gian chạy ít.

## Lưu trữ ngữ cảnh cho tác vụ dài hạn

![Lưu trữ ngữ cảnh tác vụ dài hạn: Ba vũ khí chống suy thoái](/images/github/javaguide/ai/context-engineering/long-task-context-persistence-three-weapons-against-corruption.svg)

### Ngữ cảnh sắp đầy phải làm sao? — Compaction

Khi Agent cần làm việc liên tục nhiều giờ, xử lý nhiều vòng lặp, quản lý ngữ cảnh đơn thuần không còn đủ, phải giới thiệu **cơ chế lưu trữ xuyên cửa sổ** — ngữ cảnh cũng cần có khả năng trao đổi chất như sinh vật mới có thể duy trì hiệu quả trong thời gian dài.

**Compaction (nén)** là vũ khí đầu tiên.

Khi cửa sổ ngữ cảnh sắp đầy, giao lịch sử nội dung cho LLM tóm tắt, sau đó dùng bản tóm tắt tạo cửa sổ ngữ cảnh mới để tiếp tục làm việc. Logic triển khai của Claude Code là: truyền tin nhắn lịch sử cho mô hình để tóm tắt, giữ lại quyết định kiến trúc, Bug chưa giải quyết, chi tiết triển khai quan trọng, loại bỏ kết quả gọi công cụ thừa. Agent dùng ngữ cảnh được nén này cộng với 5 file được truy cập gần nhất, tiếp tục làm việc.

**Khó khăn nằm ở lựa chọn**: Giữ lại quá nhiều thì nén vô nghĩa, giữ lại quá ít thì mất ngữ cảnh quan trọng. Một lời khuyên kỹ thuật là: dùng dữ liệu quỹ đạo Agent phức tạp để tinh chỉnh Prompt nén của bạn nhiều lần — trước tiên tối đa hóa recall (đừng bỏ sót thông tin quan trọng), sau đó dần dần tinh giản nội dung thừa. Đây là quá trình tinh chỉnh lặp đi lặp lại, không phải viết một lần xong.

Biện pháp nén nhẹ nhất là **dọn dẹp kết quả công cụ**: Một khi công cụ đã được gọi trong lịch sử và kết quả đã được tiêu hóa, không cần giữ lại văn bản gốc của kết quả đó trong ngữ cảnh tiếp theo. Anthropic Developer Platform đã biến điều này thành tính năng gốc.

> **Gợi ý kỹ thuật**: Tinh chỉnh Prompt nén là quá trình lặp đi lặp lại. Nên dùng dữ liệu quỹ đạo Agent phức tạp để tinh chỉnh nhiều lần — trước tiên tối đa hóa recall (đừng bỏ sót thông tin quan trọng), sau đó dần dần tinh giản nội dung thừa. Viết ngay lần đầu đã hoàn hảo chỉ thị nén gần như không thể, tiếp tục lặp đi lặp lại mới là con đường đúng.

### Làm thế nào để Agent học cách "ghi chú"? — Structured Note-taking

**Structured Note-taking (ghi chú có cấu trúc)** là vũ khí thứ hai.

Để Agent ghi tiến trình quan trọng vào file bên ngoài theo định dạng có cấu trúc (như `NOTES.md`), sau đó đọc lại dựa trên ngữ cảnh mới.

Điều này hoàn toàn giống với thói quen "viết to-do list và ghi chú kỹ thuật" của kỹ sư con người. Claude Code sẽ tự động duy trì to-do list trong các tác vụ dài, Agent tùy chỉnh có thể duy trì `NOTES.md` trong thư mục gốc dự án — bao gồm tiến trình hiện tại, vấn đề đã biết, kế hoạch bước tiếp theo.

Một ví dụ cực đoan nhưng ấn tượng là **Claude chơi Pokemon**: Trong hàng nghìn bước trò chơi, Agent tự duy trì theo dõi số liệu chính xác ("trong 1234 bước vừa qua tôi đã huấn luyện Pikachu ở Route 1, đã lên cấp 8, còn thiếu 2 cấp nữa đến mục tiêu"), còn tự phát xây dựng bản đồ, danh sách thành tích, ghi chú chiến thuật chiến đấu. Những ghi chú này vẫn có thể được đọc sau khi ngữ cảnh bị reset, khiến việc huấn luyện trò chơi kéo dài nhiều giờ trở nên khả thi.

Anthropic ra mắt phiên bản beta công khai của Memory Tool khi phát hành Sonnet 4.5, cho phép Agent xây dựng cơ sở kiến thức xuyên phiên thông qua lưu trữ bền vững của hệ thống file.

### Khi nào nên chia nhiệm vụ cho nhiều Agent? — Kiến trúc Sub-agent

**Sub-agent Architectures (Kiến trúc đa Agent)** là vũ khí thứ ba.

Không để một Agent duy trì toàn bộ trạng thái dự án, mà để **các sub-Agent chuyên biệt xử lý nhiệm vụ chuyên môn**, Agent chính chỉ chịu trách nhiệm sắp xếp nhiệm vụ và tổng hợp kết quả.

Mỗi sub-Agent có thể khám phá lượng lớn ngữ cảnh (hàng chục nghìn Token), nhưng những gì trả về cho Agent chính chỉ là bản tóm tắt cô đọng cao 1000-2000 Token. Thiết kế này thực hiện phân tách mối quan tâm: ngữ cảnh tìm kiếm chi tiết được cách ly trong sub-Agent, Agent chính duy trì ngữ cảnh sạch để tập trung phân tích và quyết định.

Anthropic đã mô tả chi tiết mô hình này trong "How we built our multi-agent research system", so với single Agent đã đạt được cải thiện chất lượng đáng kể trong các nhiệm vụ nghiên cứu phức tạp.

**Làm thế nào để chọn giữa ba kỹ thuật**:

| Kỹ thuật    | Tình huống áp dụng                                                           |
| ----------- | ---------------------------------------------------------------------------- |
| Compaction  | Quy trình dài cần hội thoại liên tục, duy trì tính liên kết ngữ cảnh         |
| Note-taking | Phát triển lặp đi lặp lại, có cột mốc rõ ràng, nhiệm vụ tiến hành nhiều bước |
| Sub-agents  | Nghiên cứu phức tạp, cần khám phá song song, kết quả cần tổng hợp            |

## Chuỗi công cụ và triển khai thực tế

### Cần những công cụ gì để triển khai Context Engineering?

Sau khi nói xong phương pháp luận, tiện tay tổng hợp các công cụ chủ lưu cần thiết cho triển khai thực tế:

**Framework sắp xếp**: LangChain, LangGraph và các framework tương tự chịu trách nhiệm luồng điều khiển của Agent, quản lý trạng thái và lên lịch vòng lặp.

**Framework dữ liệu**: LlamaIndex tập trung vào việc thu thập dữ liệu, lập chỉ mục và tối ưu hóa truy xuất trong các tình huống RAG.

**Cơ sở dữ liệu vector**: Pinecone, Weaviate, Chroma, Qdrant và các loại tương tự chịu trách nhiệm lưu trữ Embedding và tìm kiếm ngữ nghĩa.

**Giao thức giao tiếp**: MCP (Model Context Protocol) giải quyết vấn đề "công cụ tiêu chuẩn hóa kết nối với chương trình máy chủ như thế nào", được gọi là USB-C của lĩnh vực AI. Giao thức MCP do Anthropic phát hành dựa trên JSON-RPC 2.0, định nghĩa ba loại nguyên thủy chuẩn: Tools (hàm có thể thực thi), Resources (dữ liệu chỉ đọc), Prompts (mẫu có thể tái sử dụng).

**Sản phẩm Memory**: Mem0, LETTA (trước đây là MemGPT), ZEP và các nền tảng tương tự chuyên làm tầng bộ nhớ Agent, đóng gói quản lý vòng đời đầy đủ của việc viết, truy xuất, quên bộ nhớ trên cơ sở vector store.

## Tổng kết

Context Engineering quan trọng vì nó đánh dấu sự chuyển dịch trọng tâm công việc: **từ tối ưu hóa Prompt đơn lẻ, sang thiết kế toàn bộ hệ thống cung cấp thông tin**.

Trước đây chúng ta quan tâm đến "cách diễn đạt", bây giờ chúng ta quan tâm đến "xây dựng kiến trúc kỹ thuật ngữ cảnh như thế nào". Khả năng mô hình đang tăng trưởng, nhưng chú ý là có giới hạn — ràng buộc cơ bản này sẽ không biến mất vì mô hình mạnh hơn.

Cụ thể trong thực hành kỹ thuật, hãy ghi nhớ bốn nguyên tắc cốt lõi:

1. **Ngữ cảnh là đầu ra của hệ thống, không phải cấu hình tĩnh**. Trước mỗi lần gọi LLM, bạn đang lắp ráp một ngữ cảnh động — logic lắp ráp này mới là cốt lõi của kỹ thuật.
2. **Tỷ lệ tín hiệu/nhiễu cao hơn lượng thông tin cao**. Độ dài ngữ cảnh không quyết định hiệu quả, tìm tập thông tin mật độ cao tối thiểu cần thiết để mô hình đưa ra quyết định đúng đắn, mới là nghề thủ công.
3. **Ngữ cảnh cần cơ chế trao đổi chất**. Đối với tác vụ dài, không có gì là "lắp ráp một lần có hiệu lực mãi mãi" — nén, ghi chú, phân tầng đa Agent, những cơ chế này giúp ngữ cảnh duy trì tươi mới và khả dụng theo chiều thời gian.
4. **Bắt đầu từ giải pháp đơn giản nhất, dần dần tăng thêm độ phức tạp**. Anthropic liên tục nhấn mạnh "do the simplest thing that works" — trước tiên chạy thông baseline với phương án ngữ cảnh tối thiểu khả thi, sau đó tối ưu hóa từng lớp dựa trên failure case thực tế. Hệ thống ngữ cảnh được kỹ thuật hóa quá mức cũng nguy hiểm như ngữ cảnh không đủ.

Hầu hết thất bại của Agent đều đến từ độ chính xác ngữ cảnh không đủ. Làm tốt Context Engineering, mô hình ở mức trung bình cũng có thể hoàn thành các nhiệm vụ có vẻ phức tạp.

## Tài liệu tham khảo

- [Effective context engineering for AI agents - Anthropic](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Context Engineering: The New Frontier of AI Development](https://medium.com/techacc/context-engineering-a8c3a4b39c07)
- [The New Skill in AI is Not Prompting, It's Context Engineering](https://www.philschmid.de/context-engineering)
- [Context Engineering by Simon Willison](https://simonwillison.net/2025/jun/27/context-engineering/)
- [12 Factor Agents - Own Your Context Window](https://www.humanlayer.dev/blog/12-factor-agents)
