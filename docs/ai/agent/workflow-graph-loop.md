---
title: Workflow, Graph và Loop trong AI Workflow：Từ Khái Niệm Đến Triển Khai
description: Phân tích chuyên sâu ba khái niệm cốt lõi Workflow, Graph, Loop trong AI Workflow, so sánh sự khác biệt giữa workflow truyền thống và AI workflow, kết hợp Spring AI Alibaba và LangGraph đưa ra ví dụ code hoàn chỉnh.
category: Phát triển ứng dụng AI
icon: "robot"
head:
  - - meta
    - name: keywords
      content: AI Workflow,Graph,Loop,AI工作流,Spring AI Alibaba,LangGraph,状态机,Agent,工作流引擎
---

Nội dung chia sẻ hôm nay khá quan trọng, tôi và một người bạn đã viết từng chút một trong gần hai tuần.

Nhiều developer mới bắt đầu làm AI workflow đều từng có những băn khoăn tương tự: Đây chẳng phải chỉ là workflow truyền thống thay vỏ thôi ư? Tại sao không dùng các engine trưởng thành như Camunda, Temporal? Thậm chí cho rằng nối vài Prompt với nhau bằng if-else là đã có "workflow" rồi.

Nhưng khi thực sự bắt tay làm dự án, những suy nghĩ đó sẽ nhanh chóng bị thực tế đập tan. Output của LLM vốn dĩ không xác định, một lần sinh ra thường không đạt yêu cầu, gọi tool có thể thất bại bất cứ lúc nào, và context window còn có giới hạn cứng. Chỉ cần "chạy một lần là xong" theo dạng tuyến tính là chưa đủ, bạn cần một cơ chế thực thi có thể **quyết định động, tự động sửa lỗi, hội tụ có kiểm soát**.

Bài viết hôm nay sẽ tổng hợp ba khái niệm cốt lõi trong AI workflow — **Workflow, Graph, Loop**, giúp bạn xây dựng nhận thức hoàn chỉnh từ khái niệm đến triển khai. Bài viết khoảng 1.9 vạn từ, khuyến nghị lưu lại, qua bài này bạn sẽ hiểu được:

1. **Tại sao hệ thống AI cần workflow**: Tại sao hội thoại một vòng và quy trình cố định là không đủ? Quyết định động, tự động sửa lỗi, hội tụ có kiểm soát giải quyết những vấn đề gì?
2. **Mối quan hệ phân cấp của ba yếu tố Workflow, Graph, Loop**: Workflow là mục tiêu và quá trình, Graph là cấu trúc và carrier, Loop là mô hình điều khiển trên graph — ba yếu tố phối hợp với nhau như thế nào?
3. **Các yếu tố cốt lõi của Graph**: Node (nút), Edge (cạnh), State (trạng thái) lần lượt là gì? Conditional edge, dynamic routing, loop edge có điểm gì khác nhau? Chiến lược cập nhật State nên chọn như thế nào?
4. **Điểm thiết kế của Loop**: Vòng lặp cố định số lần vs vòng lặp điều kiện, tính độc lập của vòng lặp lồng nhau, ba yếu tố của an toàn giới hạn.
5. **Từ khái niệm đến code**: Bảng ánh xạ khái niệm Spring AI Alibaba và LangGraph + triển khai code hoàn chỉnh workflow "sinh→đánh giá→sửa đổi".
6. **Ranh giới thiết kế workflow**: Trừu tượng cao vs trừu tượng thấp, nguyên tắc trừu tượng của Node, Edge, State.

> **Đọc theo series**: Bài viết này là một phần của series AI Agent, các bài liên quan:
>
> - [Khái niệm cốt lõi AI Agent: Agent Loop, Context Engineering, Đăng ký Tools](https://javaguide.cn/ai/agent/agent-basis.html)
> - [Hướng dẫn thực hành Prompt Engineering cho LLM](https://javaguide.cn/ai/agent/prompt-engineering.html)
> - [Hướng dẫn thực chiến Context Engineering: Phương pháp luận kỹ thuật giúp Agent ít mắc lỗi hơn](https://javaguide.cn/ai/agent/context-engineering.html)
> - [Giải thích chi tiết Agent Skills: Là gì? Dùng như thế nào? Khác Prompt, MCP ở điểm nào?](https://javaguide.cn/ai/agent/skills.html)
> - [Phân tích toàn diện MCP, kèm thực hành kỹ thuật](https://javaguide.cn/ai/agent/mcp.html)
> - [Hiểu rõ Harness Engineering trong một bài: Kiến trúc sáu tầng, quản lý context và thực chiến nhóm](https://javaguide.cn/ai/agent/harness-engineering.html)

## Một, Tại sao hệ thống AI cần workflow

Hội thoại một vòng tuy có thể trả lời câu hỏi, nhưng khó ổn định **giao kết quả**. Trong các tình huống thực tế, một nhiệm vụ hoàn chỉnh thường không chỉ là "sinh ra câu trả lời", mà còn bao gồm truy xuất thông tin, gọi tool, xuất ra kết quả có cấu trúc, kiểm tra chất lượng, thử lại khi thất bại, và sửa đổi nhiều vòng khi kết quả không thỏa mãn. Những hành vi này bản thân là một phần cấu trúc của hệ thống, không thể giải quyết bằng một Prompt siêu dài, cần một đường dẫn thực thi **có thể phân nhánh, có thể vòng lặp, có thể quan sát**.

Quy trình phần mềm truyền thống thường là xác định: **đầu vào cố định, các bước cố định, đầu ra tương đối ổn định**. Nhưng đặc điểm của LLM lại ngược lại — nó "năng lực rất mạnh, nhưng không hoàn toàn ổn định". Nó có thể trả lời lạc đề, sai định dạng, tạo ra ảo giác, hoặc thất bại khi gọi tool. Điều này dẫn đến ba vấn đề cốt lõi:

1. Bước tiếp theo không phải là duy nhất, cần quyết định đường dẫn động dựa trên kết quả hiện tại;
2. Khi kết quả không lý tưởng, hệ thống cần tự động sửa lỗi, thay vì trực tiếp thất bại;
3. Trạng thái trung gian phải được ghi lại, nếu không khó debug, theo dõi và khôi phục.

Đây cũng là lý do tại sao hệ thống AI cần tư duy workflow.

Lấy một ví dụ đơn giản: khi chúng ta yêu cầu AI viết một bài viết, kết quả sinh ra một lần thường không đủ lý tưởng. Cách trực giác là sao chép kết quả thủ công, sau đó đính kèm yêu cầu mới tiếp tục hỏi, nhưng cách này vừa không hiệu quả lại tiêu hao context nhanh. Nếu cấu trúc hóa quá trình này thành vòng lặp "**đánh giá → sửa đổi → đánh giá lại**", và đặt điều kiện dừng (như đạt tiêu chuẩn chất lượng hoặc đến giới hạn lặp), thì có thể nâng cao đáng kể tính ổn định.

Nói tóm lại, workflow là biến quá trình sinh ra một lần, thành một quy trình hệ thống **có thể lặp, có thể hội tụ, có thể kiểm soát**.

## Hai, Workflow là gì: Từ Workflow truyền thống đến AI Workflow

![So sánh Workflow truyền thống và AI Workflow](https://oss.javaguide.cn/github/javaguide/ai/workflow/traditional-vs-ai-workflow.svg)

Hình trên có thể thấy trực quan sự khác biệt giữa hai loại workflow: Workflow truyền thống nghiêng về "bước cố định + phân nhánh rõ ràng" trong sắp xếp quy trình; AI Workflow thì phụ thuộc nhiều hơn vào State (trạng thái) khi chạy để quyết định bước tiếp theo một cách động, và thông qua Loop (vòng lặp) biến "sinh→đánh giá→sửa đổi" thành quá trình có thể hội tụ.

### 2.1 Workflow truyền thống: Đang làm gì?

Trước tiên nói về định nghĩa cơ bản: **Workflow** là chia nhiệm vụ thành nhiều bước và quy định cách các bước này phối hợp để hoàn thành một mục tiêu nào đó. Nó trả lời câu hỏi: "Việc này làm xong như thế nào?"

Trong hệ thống workflow truyền thống, dù thiết kế quy trình cũng hỗ trợ event-driven và phân nhánh động (như signal event của BPMN 2.0, DMN decision table của Camunda), nhưng giả định cốt lõi là: **Với cùng đầu vào, kết quả thực thi của cùng một node là xác định**. Các engine workflow chính thống đại diện theo đặc tả BPMN 2.0 (như Camunda, Temporal, Apache Airflow) hỗ trợ parallel gateway, inclusive gateway, sub-process, compensation transaction và nhiều cấu trúc điều khiển phong phú khác, không đơn giản chỉ là tuần tự tuyến tính. Nhưng điều kiện phân nhánh thường được xác định tại thời điểm thiết kế, khi chạy thực hiện theo đường dẫn đã được định nghĩa trước.

Sự khác biệt then chốt giữa AI workflow và workflow truyền thống là: Việc chọn đường dẫn phụ thuộc vào đánh giá chất lượng nội dung được sinh ra khi chạy, và cùng một node có thể cần thực thi lặp lại do tính không xác định của output. Ví dụ trong các tình huống truyền thống như quy trình phê duyệt, xử lý đơn hàng, ETL data pipeline, điều kiện phân nhánh rõ ràng (số tiền > 10000 thì qua phê duyệt cấp cao); còn trong tình huống AI, bản thân việc "kết quả sinh ra có đạt tiêu chuẩn không" cần đánh giá khi chạy, và kết quả đánh giá có thể thúc đẩy quy trình quay lại các bước trước đó để sửa đổi nhiều lần.

### 2.2 AI Workflow: Tại sao nhất định phải đi đến Graph, Loop

Đến tình huống AI, cùng một từ "quy trình", ý nghĩa có phần khác. So với workflow truyền thống nhấn mạnh tính tuần tự và xác định, AI workflow cần xử lý một môi trường thực thi đầy bất định. Chúng ta đối mặt không chỉ là "thực thi từng bước", mà còn bao gồm:

- Kết quả có đạt tiêu chuẩn hay không cần phán đoán **khi chạy**.
- Có cần tiếp tục thử lại, phụ thuộc vào **trạng thái hiện tại**.
- Khi một bước thất bại, hệ thống không còn đơn giản báo lỗi rồi kết thúc, mà xem xét có nên downgrade, rollback hay thử chiến lược khác không.
- Những gì được truyền giữa các node không chỉ là tham số, mà còn bao gồm context, bản nháp, điểm số, thông tin lỗi, lịch sử vòng lặp và các **trạng thái** khác.

Vì vậy AI Workflow và truyền thống Workflow đều có quy trình, sự khác biệt là cái trước nhấn mạnh hơn quyết định động và trạng thái điều khiển. Một khi chúng ta muốn biểu đạt "bước tiếp theo không phải là duy nhất" hoặc "không thỏa mãn thì làm thêm một vòng", danh sách tuyến tính là không đủ, sẽ tự nhiên rơi vào hai loại khái niệm Graph (cấu trúc) và Loop (hồi quy).

## Ba, Graph (Đồ thị) là biểu đạt cấu trúc của workflow (Quan trọng)

Tiếp tục dùng case xuyên suốt: Giả sử chúng ta muốn xây một đường dẫn "sinh bản nháp → đánh giá chất lượng → không đạt thì sửa đổi → đánh giá lại". Mỗi bước ở đây tương ứng với **Node** trong đồ thị, hướng đi giữa các bước được biểu đạt bởi **Edge**, context chia sẻ được đọc ghi trong toàn bộ chuỗi là **State**.

Ba yếu tố cơ bản nhất trong đồ thị là:

- **Node (Nút)**: Biểu thị một đơn vị thực thi, có ba chức năng chính: đọc State, thực thi logic nghiệp vụ và xử lý State, đưa State đã xử lý trả lại. Trong ví dụ đánh giá bài viết, điển hình có "sinh bản nháp" "đánh giá chất lượng" "sửa đổi theo phản hồi"; ngoài ra còn có thể mở rộng truy xuất, kiểm tra định dạng, phê duyệt con người, v.v.
- **Edge (Cạnh)**: Là trừu tượng luồng điều khiển trong flowchart, dùng để mô tả đường thực thi giữa các node và điều kiện kích hoạt, quyết định quy trình khi chạy điều phối và nhảy giữa các node như thế nào. Các loại cạnh thông dụng như sau:

| Loại cạnh                         | Giải thích                                                                                                                                                                                                                                                                                                               |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sequential Edge (Cạnh tuần tự)    | Các node thực thi theo thứ tự cố định, sau khi thực thi node hiện tại trực tiếp vào node tiếp theo, không phụ thuộc điều kiện hay phán đoán trạng thái.                                                                                                                                                                  |
| Conditional Edge (Cạnh điều kiện) | Trong tập hợp đường dẫn ứng viên hữu hạn được xác định tại thời điểm thiết kế, chọn một trong số chúng dựa trên State khi chạy. Node đích ứng viên được xác định tại thời thiết kế, khi chạy chỉ thực hiện chọn lựa. Spring AI Alibaba triển khai thông qua `addConditionalEdges()` và truyền vào mapping node ứng viên. |
| Dynamic Routing (Định tuyến động) | Node đích không hoàn toàn được định nghĩa trước tại thời điểm thiết kế, mà được xác định động bởi logic khi chạy (như quyết định LLM, phân phối map-reduce), tập hợp ứng viên có thể là mở. Ví dụ `Send` API của LangGraph có thể quyết định động tại runtime số lần gọi song song đến một node nào đó.                  |
| Loop Edge (Cạnh vòng lặp)         | Node có thể quay lại chính nó hoặc node trước để thực thi lặp lại, dùng cho retry, tối ưu hóa lặp hoặc suy luận vòng lặp, cho đến khi điều kiện kết thúc được thỏa mãn, thường được hình thành bởi sự kết hợp conditional edge và sequential edge.                                                                       |
| Terminal Edge (Cạnh kết thúc)     | Dẫn quy trình đến trạng thái kết thúc, không tiếp tục thực thi các node tiếp theo, dùng để xuất ra kết quả cuối cùng hoặc kết thúc workflow.                                                                                                                                                                             |
| Parallel Edge (Cạnh song song)    | Một node phân phối đồng thời đến nhiều node tiếp theo để thực thi song song, dùng cho xử lý đa nhiệm, RAG/tool concurrency, v.v.                                                                                                                                                                                         |

> Trong kỹ thuật thực tế, conditional edge và dynamic routing là một phổ liên tục — tập hợp ứng viên của conditional edge được xác định tại thời điểm thiết kế nhưng logic chọn lựa có thể phụ thuộc vào state khi chạy (như điểm LLM), tập hợp ứng viên của dynamic routing bản thân được xác định khi chạy (như `Send` API của LangGraph tạo nhánh song song động). Phần lớn tình huống conditional edge là đủ dùng, dynamic routing phù hợp với map-reduce và các tình huống cần quyết định số lượng nhánh song song khi chạy.

- **State (Trạng thái)**: Biểu thị context chia sẻ được liên tục đọc ghi trong quá trình thực thi quy trình, là "bộ nhớ làm việc" thực sự được truyền giữa các node. Về bản chất nó là một **cấu trúc dữ liệu key-value** (tương tự `Map<String, Object>` của Java, `dict` của Python, `Record<string, any>` của TypeScript), dùng để truyền và sửa đổi dữ liệu giữa các node.

Cần lưu ý rằng thiết kế State không chỉ liên quan đến "lưu gì", mà còn liên quan đến "cập nhật như thế nào". Trong các framework workflow thực tế, các trường khác nhau thường có ngữ nghĩa cập nhật khác nhau:

- **Replace (Thay thế)**: Giá trị mới trực tiếp thay thế giá trị cũ. Phù hợp với các trường đơn giá trị, như kết quả phân loại, trạng thái hiện tại. Trong Spring AI Alibaba tương ứng với `ReplaceStrategy`, trong LangGraph tương ứng với hành vi mặc định không có reducer.
- **Append (Thêm vào)**: Giá trị mới được thêm vào danh sách đã có. Phù hợp với các trường tích lũy, như lịch sử hội thoại (messages). Trong Spring AI Alibaba tương ứng với `AppendStrategy`, trong LangGraph tương ứng với `Annotated[list, operator.add]`.
- **Custom Reducer (Reducer tùy chỉnh)**: Xác định logic hợp nhất thông qua hàm tùy chỉnh, ví dụ `add_messages` của LangGraph sẽ thêm vào hoặc cập nhật dựa trên message ID.

Khi nhiều node song song đồng thời ghi vào cùng một trường sử dụng ngữ nghĩa replace, sẽ xuất hiện vấn đề race condition (LangGraph sẽ ném ra lỗi `INVALID_CONCURRENT_GRAPH_UPDATE`). Vì vậy khi thiết kế State cần lên kế hoạch trước các trường nào có thể được ghi đồng thời, và chọn chiến lược cập nhật phù hợp cho chúng.

Dưới đây là một số trường State thường dùng (có thể tự do mở rộng theo nghiệp vụ thực tế, không cần bị ràng buộc bởi ví dụ):

| Key (Tên trường)   | Kiểu Value | Mô tả                                                                                                                                                                                                                                                           | Vòng đời          |
| ------------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| input              | String     | Câu hỏi đầu vào của người dùng                                                                                                                                                                                                                                  | Toàn quy trình    |
| messages           | List       | Lịch sử hội thoại                                                                                                                                                                                                                                               | Toàn quy trình    |
| retrieval_result   | List       | Kết quả truy xuất RAG                                                                                                                                                                                                                                           | Trung gian        |
| tool_result        | Object     | Kết quả gọi tool                                                                                                                                                                                                                                                | Trung gian        |
| llm_response       | String     | Output thô của LLM                                                                                                                                                                                                                                              | Trung gian        |
| intermediate_steps | List       | Ghi lại các bước thực thi trung gian                                                                                                                                                                                                                            | Toàn quy trình    |
| next_step          | String     | Node nhảy điều khiển luồng (tùy chọn, một số framework như Spring AI Alibaba thực hiện routing thông qua trường này kết hợp conditional edge; các framework khác như LangGraph routing thông qua giá trị trả về của hàm conditional edge, không cần trường này) | Thực thi hiện tại |
| output             | String     | Kết quả output cuối cùng                                                                                                                                                                                                                                        | Kết thúc          |

Nếu chỉ xem Node và Edge, chúng ta sẽ có một "đồ thị đường dẫn có thể chạy được"; thêm State vào, đồ thị này mới có thể đưa ra quyết định khi chạy.

Cấu trúc đồ thị gần với hình thái thực tế của hệ thống AI hơn cấu trúc tuyến tính, vì nhiều ứng dụng AI về luồng điều khiển vốn là đồ thị, chỉ là giai đoạn đầu thường được viết tạm thành `if-else`, logic retry hoặc state machine phân tán trong các module khác nhau.

## Bốn, Loop là khả năng hồi quy trên Graph (Quan trọng)

Trong cùng một "đánh giá bài viết": khi **đánh giá không đạt**, luồng điều khiển không nên kết thúc, mà nên theo một cạnh nào đó quay về "sửa đổi" hoặc "sinh lại" — đây là ý nghĩa nghiệp vụ của Loop. Về kỹ thuật, nó biểu hiện là **back edge (cạnh ngược)** trong đồ thị.

> Cần phân biệt Loop trong bài này với **Agent Loop** trong bài cơ bản Agent. Agent Loop là engine chạy cấp cao nhất của Agent — toàn bộ Agent trong một vòng lặp while liên tục thực thi "suy luận → hành động → quan sát" cho đến khi nhiệm vụ hoàn thành. Còn Loop trong bài này là mô hình điều khiển bên trong Graph — một tập hợp node cụ thể hình thành vòng lặp sửa đổi lặp lại thông qua back edge. Mối quan hệ giữa hai cái là: Agent Loop là vòng lặp ngoài, Graph Loop có thể lồng vào trong một node hoặc subgraph nào đó.

![Tổng quan Loop: Sơ đồ cơ chế vòng lặp](https://oss.javaguide.cn/github/javaguide/ai/workflow/loop-mechanism.svg)

Nhiều người lần đầu tiếp cận AI workflow, sẽ hiểu `Loop` là "chạy thêm mấy lần". Điều này không sai nhưng chưa chính xác lắm. Chính xác hơn là: **Loop là một mô hình điều khiển trên cấu trúc đồ thị**. Khi một cạnh nào đó dựa trên trạng thái hiện tại gửi luồng điều khiển trở lại node trước đó, tạo thành Loop, như hình trên thể hiện, trọng điểm là phán đoán có đạt tiêu chuẩn chưa, bên trong vòng lặp LLM sẽ "chấm điểm" kết quả theo yêu cầu trong prompt, nếu thỏa mãn thì xuất ra, nếu không thì "gửi lại để viết lại".

Có hai loại Loop thông dụng:

1. **Vòng lặp số lần cố định**: Giống `for` hơn. Ví dụ "thử lại tối đa 3 lần".
2. **Vòng lặp điều kiện**: Giống `while` hơn. Ví dụ "chỉ cần điểm thấp hơn 80, tiếp tục sửa đổi".

Trong tình huống AI, loại thứ hai thường có tính đại diện hơn. Vì "chạy mấy lần" thường không xác định trước, mà được quyết định chung bởi chất lượng nội dung, kết quả thực thi tool, phản hồi bên ngoài. Nhưng trong phát triển thực tế hai loại phải dùng cùng nhau, vì tính không xác định của LLM có thể dẫn đến nội dung sinh ra mãi không đạt tiêu chuẩn, lúc này chúng ta cần tham khảo tư tưởng vòng lặp số lần cố định để downgrade xử lý nội dung.

Trong kỹ thuật thực tế, còn thường gặp tình huống **vòng lặp lồng nhau**: Vòng lặp ngoài phụ trách "lặp chất lượng" (sinh→đánh giá→sửa đổi), vòng lặp trong phụ trách "retry tool" (retry theo exponential backoff khi gọi external API thất bại bên trong một node cụ thể). Phạm vi tác dụng, điều kiện kết thúc và counter của hai tầng vòng lặp này là độc lập — vòng trong hết retry không nên ảnh hưởng đến ngân sách lặp của vòng ngoài, vòng ngoài thoát ra cũng không có nghĩa là vòng trong có thể retry vô hạn. Khi thiết kế vòng lặp lồng nhau, cần xác định rõ điều kiện thoát và ranh giới an toàn độc lập cho mỗi tầng.

Tóm lại, một Loop đáng tin cậy nhất định bao gồm ba điều:

- Điều kiện tiếp tục: Tại sao cần làm thêm một vòng.
- Điều kiện thoát: Khi nào đã đủ tốt, có thể kết thúc.
- Ranh giới an toàn: Số vòng tối đa, timeout, ngân sách, điều kiện circuit breaker.

Nếu không có những ràng buộc này, Loop rất dễ từ "tự sửa lỗi" biến thành "quay mãi không dừng".

Vẫn trong ví dụ đánh giá bài viết, Loop không chỉ là "thử thêm mấy lần", nó là "kết luận đánh giá điều khiển bước nhảy tiếp theo". Chỉ khi điểm chưa đạt, và chưa vượt số vòng tối đa, quy trình mới từ `ReviewNode` quay về `ReviseNode`; một khi đạt ngưỡng hoặc kích hoạt điều kiện biên, nên thoát ra và đưa ra kết quả. Đến đây, vòng lặp đã trở thành cơ chế hồi quy có thể kiểm soát.

## Năm, Tích hợp khái niệm: Kết nối Workflow, Graph, Loop

![Tổng quan mối quan hệ Workflow, Graph, Loop](https://oss.javaguide.cn/github/javaguide/ai/workflow/workflow-graph-loop-relation.svg)

Có thể dùng một câu để tóm tắt mối quan hệ phân cấp của ba yếu tố: **Workflow là mục tiêu và quá trình, Graph là cấu trúc và carrier, Loop là mô hình điều khiển trên đồ thị.**

Tiếp tục dùng cùng một ví dụ "viết bài và đánh giá":

- Khi chúng ta nói "trước tiên sinh bản nháp, sau đó đánh giá, không đạt thì sửa đổi, đến khi đạt tiêu chuẩn thì xuất ra", chúng ta đang mô tả **Workflow**.
- Khi chúng ta vẽ `node sinh → node kiểm tra → node sửa` thành các node và đường nối, và cho chúng chia sẻ cùng một bộ trạng thái, chúng ta có được **Graph**.
- Khi chúng ta quy định "đánh giá không đạt thì quay lại sửa đổi, đến khi đạt điểm hoặc đến giới hạn", chúng ta đang định nghĩa **Loop**.

Ba yếu tố này là ba góc nhìn quan sát về cùng một điều: Workflow tập trung mục tiêu nhiệm vụ, Graph tập trung tổ chức cấu trúc, Loop tập trung điều khiển hồi quy.

## Sáu, Từ khái niệm đến triển khai: Ánh xạ framework và ví dụ code

Phía trên đã xây dựng mô hình khái niệm Node, Edge, State, tiếp theo xem những khái niệm này ánh xạ đến framework cụ thể như thế nào. Dưới đây lấy Spring AI Alibaba Graph (hệ sinh thái Java) và LangGraph (hệ sinh thái Python) làm ví dụ.

### Bảng ánh xạ khái niệm

| Khái niệm                   | Spring AI Alibaba                                | LangGraph                                |
| --------------------------- | ------------------------------------------------ | ---------------------------------------- |
| State (Trạng thái)          | `OverAllState` + `KeyStrategyFactory`            | `TypedDict` + `Annotated[type, reducer]` |
| Ngữ nghĩa replace của State | `ReplaceStrategy`                                | Mặc định (không có reducer)              |
| Ngữ nghĩa append của State  | `AppendStrategy`                                 | `Annotated[list, operator.add]`          |
| Node (Nút)                  | Interface `NodeAction`                           | Hàm / Runnable                           |
| Sequential edge             | `addEdge(source, target)`                        | `add_edge(source, target)`               |
| Conditional edge            | `addConditionalEdges(source, fn, map)`           | `add_conditional_edges(source, fn)`      |
| Loop                        | Conditional edge trỏ về node trước / `LoopAgent` | Conditional edge trỏ về node trước       |
| Vòng lặp số lần cố định     | `LoopMode.count(N)`                              | Tự quản lý counter                       |
| Vòng lặp điều kiện          | `LoopMode.condition(predicate)`                  | Conditional edge + while logic           |
| Persistence                 | `MemorySaver` / `RedisSaver`, v.v.               | `MemorySaver` / `SqliteSaver`            |
| Human-in-the-loop           | `interruptBefore()` + `updateState()`            | `interrupt_before` + `update_state`      |
| Biên dịch thực thi          | `StateGraph.compile(CompileConfig)`              | `StateGraph.compile()`                   |

### Ví dụ triển khai: Xây dựng workflow đánh giá bài viết với Spring AI Alibaba

Xem xét rằng độc giả của tôi thiên về stack Java, ở đây tác giả sẽ triển khai workflow "sinh→đánh giá→sửa đổi" xuyên suốt bài viết dựa trên Spring AI Alibaba Graph.

**Bước 1: Định nghĩa State và chiến lược cập nhật**

```java
// 配置状态键策略：控制每个字段如何更新
public static KeyStrategyFactory createKeyStrategyFactory() {
    return () -> {
        HashMap<String, KeyStrategy> strategies = new HashMap<>();
        strategies.put("input", new ReplaceStrategy());          // 用户输入
        strategies.put("messages", new AppendStrategy());        // 对话历史（追加）
        strategies.put("current_draft", new ReplaceStrategy());  // 当前草稿（覆盖）
        strategies.put("review_score", new ReplaceStrategy());   // 审核评分（覆盖）
        strategies.put("review_feedback", new ReplaceStrategy()); // 审核反馈
        strategies.put("iteration_count", new ReplaceStrategy()); // 迭代计数
        strategies.put("output", new ReplaceStrategy());         // 最终输出
        strategies.put("next_node", new ReplaceStrategy());      // 路由控制
        return strategies;
    };
}
```

Lưu ý `messages` dùng `AppendStrategy` (lịch sử hội thoại liên tục thêm vào), còn `current_draft` dùng `ReplaceStrategy` (mỗi lần sửa đổi ghi đè phiên bản cũ).

**Bước 2: Triển khai các Node**

```java
// 生成初稿节点
public static class DraftNode implements NodeAction {
    private final ChatClient chatClient;

    public DraftNode(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String input = state.value("input").map(v -> (String) v).orElse("");

        String draft = chatClient.prompt()
            .user(String.format("请根据以下要求撰写文章：%s", input))
            .call().content();

        return Map.of(
            "current_draft", draft,
            "next_node", "review"
        );
    }
}

// 质量审核节点
public static class ReviewNode implements NodeAction {
    private final ChatClient chatClient;

    public ReviewNode(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String draft = state.value("current_draft").map(v -> (String) v).orElse("");
        int count = state.value("iteration_count").map(v -> (int) v).orElse(0);

        String prompt = String.format(
            "请评估以下文章质量，给出 0-100 的评分和改进建议。\n" +
            "以JSON格式返回：{\"score\": 85, \"feedback\": \"...\"}\n\n%s", draft);

        String response = chatClient.prompt().user(prompt).call().content();
        // 解析评分和反馈（实际项目中使用 Jackson/Gson）
        double score = parseScore(response);
        String feedback = parseFeedback(response);

        String nextNode = (score >= 80 || count >= 3) ? "exit" : "revise";
        return Map.of(
            "review_score", score,
            "review_feedback", feedback,
            "iteration_count", count + 1,
            "next_node", nextNode
        );
    }
}

// 修改节点：根据审核反馈修正内容
public static class ReviseNode implements NodeAction {
    private final ChatClient chatClient;

    public ReviseNode(ChatClient.Builder builder) {
        this.chatClient = builder.build();
    }

    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String draft = state.value("current_draft").map(v -> (String) v).orElse("");
        String feedback = state.value("review_feedback").map(v -> (String) v).orElse("");

        String revised = chatClient.prompt()
            .user(String.format("请根据反馈修改文章。\n\n原文：%s\n\n反馈意见：%s", draft, feedback))
            .call().content();

        return Map.of(
            "current_draft", revised,
            "next_node", "review"
        );
    }
}

// 输出节点
public static class ExitNode implements NodeAction {
    @Override
    public Map<String, Object> apply(OverAllState state) throws Exception {
        String draft = state.value("current_draft").map(v -> (String) v).orElse("");
        return Map.of("output", draft);
    }
}
```

**Bước 3: Lắp ráp Graph**

```java
public static CompiledGraph buildWorkflow(ChatModel chatModel) throws GraphStateException {
    ChatClient.Builder builder = ChatClient.builder(chatModel);

    var draft = node_async(new DraftNode(builder));
    var review = node_async(new ReviewNode(builder));
    var revise = node_async(new ReviseNode(builder));
    var exit = node_async(new ExitNode());

    StateGraph workflow = new StateGraph(createKeyStrategyFactory())
        .addNode("draft", draft)
        .addNode("review", review)
        .addNode("revise", revise)
        .addNode("exit", exit);

    // Cạnh tuần tự
    workflow.addEdge(START, "draft");

    // Cạnh điều kiện: quyết định routing dựa trên trường next_node
    workflow.addConditionalEdges("draft",
        edge_async(state ->
            (String) state.value("next_node").orElse("review")),
        Map.of("review", "review"));

    workflow.addConditionalEdges("review",
        edge_async(state ->
            (String) state.value("next_node").orElse("exit")),
        Map.of(
            "revise", "revise",   // Đánh giá không đạt → sửa đổi
            "exit", "exit"        // Đánh giá đạt hoặc đến giới hạn → xuất ra
        ));

    // Sau khi sửa đổi quay về node đánh giá, tạo thành vòng lặp
    workflow.addConditionalEdges("revise",
        edge_async(state ->
            (String) state.value("next_node").orElse("review")),
        Map.of("review", "review"));

    workflow.addEdge("exit", END);

    // Cấu hình persistence: môi trường production khuyến nghị dùng RedisSaver hoặc database Saver
    var saver = new MemorySaver();
    var compileConfig = CompileConfig.builder()
        .saverConfig(SaverConfig.builder().register(saver).build())
        .build();

    return workflow.compile(compileConfig);
}
```

Trong triển khai này, có thể thấy: Mỗi Node chỉ làm những gì tên nó nói (DraftNode phụ trách sinh ra, ReviewNode phụ trách đánh giá, ReviseNode phụ trách sửa đổi theo phản hồi), Edge (conditional edge) điều khiển routing, State (`next_node`, `iteration_count`, `review_score`) điều khiển quyết định. Loop được triển khai thông qua back edge `review → revise → review` (đánh giá không đạt thì ReviseNode sửa nội dung rồi quay lại đánh giá), ranh giới an toàn được đảm bảo bởi `iteration_count >= 3`. Cấu hình persistence đảm bảo quy trình có thể khôi phục từ checkpoint gần nhất sau khi bị gián đoạn, thay vì bắt đầu lại từ đầu — điều này đặc biệt quan trọng với các workflow chạy dài có Loop: Nếu một quy trình đánh giá đã lặp 2 vòng bị gián đoạn ở vòng 3, sau khi khôi phục nên tiếp tục vòng 3 chứ không phải bắt đầu lại từ vòng 1.

> Ví dụ hoàn chỉnh hơn (bao gồm human-in-the-loop, persistence, streaming output) có thể tham khảo [tài liệu chính thức Spring AI Alibaba Graph](https://java2ai.com/docs/frameworks/graph-core/quick-start/).

## Bảy, Ranh giới thiết kế workflow: Khả năng trừu tượng

![So sánh workflow trừu tượng cao và thấp](https://oss.javaguide.cn/github/javaguide/ai/workflow/abstraction-comparison.svg)

Hình trên có thể thấy workflow trừu tượng cao trừu tượng bốn node phán đoán thành một node phán đoán: đánh giá có đạt tiêu chuẩn chưa. Nếu dùng trừu tượng thấp, thì khi chúng ta cần giảm/thêm node phán đoán mới, cần tốn thời gian đọc source code để tìm node tương ứng. Workflow tốt quan trọng là xem trừu tượng của Node, Edge, State có chịu được tái sử dụng và mở rộng không, không liên quan nhiều đến số lượng bước.

Nhiều người mới bắt đầu thiết kế workflow, dễ viết mỗi bước thành hành động cụ thể, ví dụ: gọi model sinh copy; kiểm tra độ dài tiêu đề; kiểm tra ngữ khí có phù hợp không; phán đoán có cần bổ sung tài liệu không; lại gọi model sửa đổi. Làm như vậy ngắn hạn có thể dùng, nhưng quy trình sẽ ngày càng vụn vặt, tính tái sử dụng cũng rất kém. Cách trưởng thành hơn là trừu tượng quy trình lên lớp cấu trúc ổn định hơn:

1. **Node trừu tượng ranh giới trách nhiệm**: Kết quả được tạo ra trong node này nên như thế nào, phải xuất hiện thông tin nào. Thay vì trừu tượng "lần này gọi API nào".
2. **Edge trừu tượng quy tắc chuyển tiếp**: Trong trạng thái nào được đến đâu, khi nào kết thúc. Dùng conditional edge biểu đạt phân nhánh và vòng lặp, thay vì viết đầy if-else bên ngoài đồ thị.
3. **State trừu tượng thông tin nhất thiết phải ghi nhớ khi tiến hành nhiệm vụ**: Snapshot công việc, kết luận đánh giá, số lần retry, mã lỗi, v.v., để đường dẫn có căn cứ.

Ví dụ trong tình huống "sinh và đánh giá bài viết", thay vì thiết kế hàng chục node rời rạc để kiểm tra tiêu đề có phù hợp với chủ đề không, số từ có đạt yêu cầu không, hãy trừu tượng ra một vài trách nhiệm ổn định hơn trước:

- `DraftNode`: Phụ trách tạo ra nội dung phiên bản hiện tại.
- `ReviewNode`: Phụ trách đánh giá kết quả hiện tại có đạt tiêu chuẩn chưa.
- `ReviseNode`: Phụ trách sửa đổi nội dung theo phản hồi.
- `ExitNode`: Phụ trách xuất ra kết quả cuối cùng khi điều kiện được thỏa mãn.

![Yếu tố cốt lõi của Graph: Node, Edge, State](https://oss.javaguide.cn/github/javaguide/ai/workflow/graph-core-elements.svg)

## Tám, Những điều cần chú ý khi thiết kế workflow

Khi thực sự triển khai workflow, vấn đề thường không nằm ở "không biết vẽ đồ thị", mà ở chỗ chi tiết chưa được thiết kế trước. Dưới đây là những cạm bẫy thường gặp nhất trong thực hành.

### 1. Độ hạt của thiết kế State

- Quá thô: Tất cả mọi thứ nhét vào một object lớn, khó biết trường nào đã bị thay đổi.
- Quá mịn: Trường được tách ra rất phân tán, mỗi node đều phải ghép lại, dễ gây lỗi.
- Khuyến nghị: Phân thành vài khối theo ý nghĩa nghiệp vụ, ví dụ "đầu vào gốc của người dùng một khối", "kết quả sinh ra hiện tại một khối", "kết luận đánh giá/chấm điểm một khối", "dùng để điều khiển quy trình một khối (như bước hiện tại, số lần retry)".

### 2. Điều kiện kết thúc vòng lặp (tránh vòng lặp vô hạn)

Không chỉ viết "nếu không thỏa mãn thì tiếp tục tối ưu", mà phải xác định rõ:

- Số vòng tối đa là bao nhiêu?
- Ngưỡng điểm là bao nhiêu?
- Phải làm gì khi timeout hoặc vượt ngân sách?
- Có fallback sau khi liên tục thất bại không?

### 3. Xử lý lỗi và fallback

AI workflow không chỉ xử lý "đường dẫn thành công". Tool exception, model timeout, kiểm tra định dạng thất bại, external API bị rate limit, đều nên có **cạnh rõ ràng** trong đồ thị: retry, downgrade (ví dụ bỏ qua tool cụ thể), chuyển con người xử lý, hoặc xuất ra "hiện tại tốt nhất + mô tả lỗi", thay vì chỉ dùng `try-catch` bên ngoài để nuốt.

Tài liệu chính thức Spring AI Alibaba phân loại lỗi thành bốn loại, mỗi loại tương ứng với chiến lược xử lý khác nhau:

| Loại lỗi                  | Ví dụ                                            | Chiến lược xử lý                                                                        |
| ------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Lỗi thoáng qua            | Network timeout, API rate limit                  | Exponential backoff retry, đặt số lần retry tối đa                                      |
| Lỗi LLM có thể khôi phục  | Gọi tool thất bại, output định dạng sai          | Lưu lỗi vào State, vòng lặp quay về để LLM điều chỉnh chiến lược dựa trên thông tin lỗi |
| Lỗi người dùng có thể sửa | Thiếu thông tin cần thiết, chỉ thị không rõ ràng | `interruptBefore` tạm dừng thực thi, chờ đầu vào con người rồi tiếp tục                 |
| Lỗi bất ngờ               | Exception không xác định                         | Để exception bubble up, giao cho developer debug                                        |

Những chiến lược này có thể ánh xạ trực tiếp đến các mẫu resilience trưởng thành trong hệ thống phân tán:

- **Exponential backoff retry**: Tool call timeout → retry theo khoảng cách tăng dần 1s, 2s, 4s, đặt số lần tối đa (như 5 lần), với lỗi không thể khôi phục như xác thực thất bại thì bỏ qua retry trực tiếp.
- **Circuit Breaker (Cầu dao)**: Kiểm tra định dạng output LLM liên tục thất bại N lần → ngắt mạch và downgrade xuống output template hoặc model đơn giản hơn, tránh lãng phí Token liên tục.
- **Bulkhead (Vách ngăn)**: Đặt giới hạn concurrency độc lập cho các external API khác nhau, ngăn một service chậm tiêu hao tất cả worker thread.
- **Compensation Transaction (Giao dịch bù trừ)**: Khi một bước trong thao tác đa bước thất bại, thực thi các thao tác bù trừ của các bước đã hoàn thành theo thứ tự ngược lại (như thu hồi công việc đã tạo).

> Cần lưu ý, các mẫu này cần tự triển khai bên trong node hoặc tầng middleware, framework Graph cung cấp bộ khung thực thi và quản lý state, không phải là distributed resilience framework. Khuyến nghị triển khai cụ thể: (1) Logic retry và circuit breaker được đóng gói bên trong node, trạng thái được persist thông qua các trường State (như `retry_count`, `circuit_state`); (2) Bulkhead được triển khai bên trong node thông qua `Semaphore` của Java hoặc Resilience4j; (3) Compensation transaction cần ghi lại thông tin rollback của các bước đã hoàn thành trong State, và thiết kế các compensation node chuyên dụng.

### 4. Kiểm soát Token và chi phí

Loop sẽ tự nhiên khuếch đại Token và độ trễ. Khi thiết kế cần suy nghĩ trước:

- Node nào nhất thiết phải gọi LLM, node nào có thể dùng code thay thế.
- Có thể lọc thô trước rồi tinh chỉnh sau không.
- Có cần kết thúc sớm khi đã "đủ tốt", thay vì theo đuổi "tối ưu lý thuyết" không.

### 5. Định dạng truyền dữ liệu giữa các node

Truyền gì giữa các node, tên trường được định nghĩa như thế nào, structured output dùng schema nào, đều nên được thống nhất sớm (ví dụ thống nhất dùng JSON Schema hoặc Pydantic model). Nếu không, một khi đồ thị phức tạp, chi phí debug sẽ tăng vọt.

## Chín, Tổng kết

Nhìn vấn đề từ góc độ này, workflow là một loại năng lực modeling kỹ thuật. Các hướng tiến hóa phổ biến bao gồm:

- **Agent hóa**: Node từ "script cố định" biến thành đơn vị thực thi "có thể tự chọn tool, tách mục tiêu con", nhưng tầng dưới vẫn cần ranh giới đồ thị và state rõ ràng, nếu không khó quan sát và fallback.
- **Cộng tác đa agent**: Nhiều vai phân công, đối thoại hoặc ủy thác; nhất quán với các tư tưởng CrewAI, LangGraph multi-subgraph, v.v., điểm khó thường ở **quyền của Shared State** và **giải quyết xung đột**.
- **Human-in-the-loop**: Chèn đánh giá con người, gán nhãn hoặc hiệu chỉnh ở các node quan trọng, đưa HITL (human-in-the-loop) vào như là công dân hạng một trong đồ thị và state machine.
- **Context dài hơn và bộ nhớ**: Khi workflow kết hợp với RAG, bộ nhớ hội thoại, cần đặc biệt chú ý phần nào trong State nên vào vector database, phần nào chỉ nên lưu trong context nhiệm vụ vòng này, tránh mất kiểm soát về chi phí và privacy.
- **Bảo mật Agent**: Workflow mang lại cấu trúc và ràng buộc cho output LLM, nhưng cũng mang lại các attack surface mới. Theo OWASP LLM Top 10, cần chú trọng ba loại mối đe dọa:
  - **Hiệu ứng cascade của prompt injection**: Đầu vào người dùng độc hại có thể ghi đè system prompt, lan truyền và khuếch đại qua từng node trong workflow. Cách phòng thủ bao gồm lọc đầu vào, tách biệt nghiêm ngặt system prompt và đầu vào người dùng, kiểm tra bảo mật output LLM trước khi truyền đến node downstream.
  - **Ranh giới quyền của tool call**: Tuân theo nguyên tắc least privilege, mỗi node chỉ có thể truy cập tool cần thiết cho nhiệm vụ của nó, các thao tác rủi ro cao (xóa, gửi) cần được xác nhận qua human-in-the-loop node.
  - **Lọc bảo mật nội dung output**: Output LLM trước khi vào hệ thống downstream (database, front-end rendering, Shell command) phải được kiểm tra, ngăn chặn injection attack, rò rỉ privacy và lan truyền ảo giác.

Ngoài các rủi ro phổ biến trên, workflow còn có hai cân nhắc bảo mật đặc thù:

- **State pollution (Ô nhiễm State)**: Đầu vào độc hại sau khi được xử lý bởi node ghi vào trường điều khiển routing trong State (như `next_node`), có thể ảnh hưởng đến routing conditional edge phía sau, bỏ qua node đánh giá trực tiếp đến output. Phòng thủ: Kiểm tra whitelist với các trường điều khiển routing trong State.
- **Loop amplification attack (Tấn công khuếch đại vòng lặp)**: Đầu vào độc hại được thiết kế để ReviewNode luôn trả về điểm thấp, khiến Loop đến số vòng tối đa mới thoát ra, tiêu hao lượng lớn Token. Phòng thủ: Ngoài giới hạn `iteration_count`, thêm ngân sách tiêu thụ Token làm ranh giới an toàn độc lập.

Framework workflow sẽ được cập nhật và thay thế, nhưng lớp trừu tượng "cấu trúc đồ thị + state + vòng lặp có thể kiểm soát" này về cơ bản sẽ không thay đổi. Hiểu cơ chế tầng dưới này có giá trị hơn là chạy theo các framework cụ thể.

Trong thời đại AI, ngôn ngữ đang ngày càng bị thu nhỏ. Bạn chỉ cần hiểu những tư tưởng cốt lõi này là đủ, còn việc dùng ngôn ngữ cụ thể nào, phụ thuộc vào tình huống cụ thể, phần việc code cụ thể giao cho AI.

### Điểm chuẩn bị phỏng vấn

**Câu hỏi thường gặp**:

1. **Tại sao hệ thống AI cần workflow?** → Output LLM không xác định, cần quyết định động, tự động sửa lỗi và hội tụ có kiểm soát
2. **Mối quan hệ giữa Workflow, Graph, Loop?** → Workflow là mục tiêu và quá trình, Graph là cấu trúc và carrier, Loop là mô hình điều khiển trên đồ thị
3. **Graph Loop và Agent Loop khác nhau ở điểm nào?** → Agent Loop là engine chạy cấp cao nhất của Agent (vòng lặp suy luận→hành động→quan sát), Graph Loop là mô hình điều khiển hồi quy bên trong Graph (tập hợp node cụ thể sửa đổi lặp qua back edge), hai cái có thể lồng nhau
4. **Loop làm thế nào để ngăn dead loop?** → Ba yếu tố: điều kiện tiếp tục, điều kiện thoát, ranh giới an toàn (số vòng tối đa + timeout + ngân sách Token)
5. **Chiến lược cập nhật State nên chọn như thế nào?** → Trường đơn giá trị dùng Replace, trường tích lũy dùng Append, trường ghi đồng thời phải dùng Reducer
6. **Sự khác biệt giữa conditional edge và dynamic routing?** → Tập hợp ứng viên của conditional edge được xác định tại thời điểm thiết kế, chọn lựa khi chạy; tập hợp ứng viên của dynamic routing được xác định khi chạy; thực tế là một phổ liên tục
7. **Hiểu thiết kế trừu tượng của Graph như thế nào?** → Node trừu tượng ranh giới trách nhiệm (tạo ra gì), Edge trừu tượng quy tắc chuyển tiếp (khi nào đến đâu), State trừu tượng thông tin nhất thiết phải ghi nhớ

**Chuẩn bị câu hỏi bổ sung**:

- Workflow gián đoạn rồi khôi phục như thế nào? (Persistence + cơ chế checkpoint)
- Lỗi bên trong node xử lý thế nào? (Lỗi thoáng qua retry, lỗi LLM có thể khôi phục vòng lặp quay về, lỗi người dùng có thể sửa chuyển con người, lỗi bất ngờ bubble up)
- Triển khai vòng lặp của Spring AI Alibaba và LangGraph có điểm gì khác nhau? (Cái trước có thể dùng conditional edge trỏ về hoặc LoopAgent, cái sau cần tự quản lý counter)
- Workflow có những rủi ro bảo mật đặc thù nào? (State pollution ảnh hưởng routing, Loop amplification attack tiêu Token)
