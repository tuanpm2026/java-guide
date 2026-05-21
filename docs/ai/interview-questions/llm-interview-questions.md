---
title: Tổng hợp câu hỏi phỏng vấn cơ bản mô hình lớn
description: Tổng hợp có hệ thống các câu hỏi phỏng vấn mô hình lớn/LLM tần suất cao, bao gồm Token, cửa sổ ngữ cảnh, tham số lấy mẫu, gọi API, đầu ra streaming, đầu ra có cấu trúc, Function Calling, MCP, đánh giá ứng dụng AI và các điểm kiểm tra cốt lõi khác, kèm bài viết tham khảo tương ứng.
category: AI
tag:
  - Phỏng vấn mô hình lớn
  - Phỏng vấn LLM
  - Phỏng vấn AI
head:
  - - meta
    - name: keywords
      content: 大模型面试题,LLM面试题,大模型面试,LLM面试,Token面试题,上下文窗口面试题,Function Calling面试题,结构化输出面试题,AI应用评测面试题
---

Khi nhiều bạn chuẩn bị phỏng vấn mô hình lớn, phản ứng đầu tiên là đi học thuộc Transformer, Attention, RLHF và các từ khóa này. Không phải những thứ này không quan trọng, nhưng với hầu hết các vị trí backend chuyển AI application dev, AI engineering application, điều phỏng vấn viên quan tâm hơn là một việc khác:

**Bạn có thực sự hiểu các ràng buộc kỹ thuật trong chain gọi mô hình lớn không.**

Ví dụ Token tại sao ảnh hưởng chi phí và độ trễ? Cửa sổ ngữ cảnh tại sao không phải càng lớn càng tốt? Temperature tại sao ảnh hưởng ổn định đầu ra có cấu trúc? Function Calling tại sao không thể để mô hình trực tiếp thực thi thao tác nghiệp vụ thực tế? Những câu hỏi này trông có vẻ cơ bản, trả lời không tốt sẽ lộ ra một tín hiệu: bạn có thể chỉ đã gọi API, nhưng chưa coi mô hình lớn như một dependency bên ngoài không ổn định trong hệ thống sản xuất để quản trị.

Bộ câu hỏi phỏng vấn cơ bản mô hình lớn này chủ yếu được tổng hợp dựa trên các bài viết hiện có trong chuyên mục AI. Nó không phải để bạn học thuộc máy móc, mà giúp bạn xây dựng một mạch ôn tập:

1. Trước tiên hiểu **Token, cửa sổ ngữ cảnh, tham số lấy mẫu**, biết mô hình tại sao không ổn định.
2. Rồi hiểu **kỹ thuật gọi API**, biết một lần gọi mô hình trong sản xuất cần trải qua những khâu quản trị nào.
3. Tiếp theo hiểu **đầu ra có cấu trúc và gọi công cụ**, biết cách để đầu ra mô hình có thể được chương trình tiêu thụ.
4. Cuối cùng hiểu **đánh giá ứng dụng AI**, biết cách phán đoán ứng dụng AI của bạn có tốt hơn thực sự không.

## Phỏng vấn viên thực sự muốn kiểm tra gì

Câu hỏi cơ bản mô hình lớn bề ngoài hỏi khái niệm, thực tế kiểm tra phán đoán kỹ thuật. Bạn có thể hiểu theo bảng sau.

| Hướng kiểm tra     | Phỏng vấn viên muốn xác nhận gì                                            | Điểm trừ phổ biến                                                    |
| ------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Token và ngữ cảnh  | Bạn có hiểu chi phí, độ trễ, giới hạn cửa sổ và đánh đổi thông tin không   | Chỉ nói Token là "từ đơn vị", không nói ảnh hưởng kỹ thuật           |
| Tham số lấy mẫu    | Bạn có biết cách đánh đổi giữa sáng tạo và ổn định không                   | Nói Temperature càng cao càng thông minh                             |
| Chain gọi API      | Bạn có kinh nghiệm tích hợp mô hình vào hệ thống sản xuất không            | Chỉ nói gọi HTTP interface, bỏ qua retry, rate limiting, idempotency |
| Đầu ra có cấu trúc | Bạn có biết ràng buộc ngôn ngữ tự nhiên không bằng contract kỹ thuật không | Cho rằng "hãy trả về JSON" là đủ đáng tin                            |
| Vòng lặp đánh giá  | Bạn có thể xác minh hiệu quả, không điều chỉnh Prompt theo cảm giác không  | Chỉ xem public benchmark, không làm Golden Set nghiệp vụ             |

Một câu trả lời không tệ thường không phải dạng định nghĩa, mà là "khái niệm + vấn đề + giải pháp kỹ thuật". Ví dụ hỏi Token, bạn có thể trước tiên giải thích Token là đơn vị cơ bản để mô hình xử lý văn bản, rồi bổ sung: Token ảnh hưởng trực tiếp đến dung lượng ngữ cảnh, chi phí suy luận, độ trễ phản hồi và rủi ro cắt xén, vì vậy trong hệ thống sản xuất cần làm ước tính ngân sách, nén tin nhắn lịch sử, lọc bằng chứng RAG và giới hạn đầu ra tối đa.

Như vậy mạnh hơn nhiều so với chỉ học thuộc định nghĩa.

## Cơ chế hoạt động LLM

Bài viết tham khảo: [《Cơ chế hoạt động LLM: Token, cửa sổ ngữ cảnh và tham số lấy mẫu ảnh hưởng đầu ra như thế nào》](../llm-basis/llm-operation-mechanism.md)

Nhóm câu hỏi này là nền tảng của phỏng vấn mô hình lớn. Đừng chỉ nhớ thuật ngữ, hãy chú trọng hiểu những khái niệm này ảnh hưởng ổn định, chi phí và chất lượng câu trả lời của hệ thống thực tế như thế nào.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Token không phải ký tự, cũng không phải "chữ" trong tiếng Trung. Cách cắt của các ngôn ngữ, ký hiệu, đoạn code khác nhau, vì vậy tiếng Trung, tiếng Anh, code cùng độ dài có thể tiêu thụ Token rất khác nhau.
- Cửa sổ ngữ cảnh không phải bộ nhớ vô hạn. Cửa sổ càng lớn, chi phí, độ trễ, nhiễu, rủi ro Lost in the Middle đều tăng.
- Temperature, Top-P, Top-K kiểm soát phân phối lấy mẫu, không phải "IQ" của mô hình. Môi trường sản xuất thường chú trọng hơn vào ổn định và khả năng tái hiện.
- Ảo giác không thể loại bỏ chỉ dựa vào một tham số. Cách đáng tin cậy hơn là kết hợp cùng nhau RAG, gọi công cụ, trích dẫn nguồn, xác minh đầu ra và vòng lặp đánh giá.

Câu hỏi tần suất cao:

- Token là gì? Tại sao tiếng Trung, tiếng Anh, code tiêu thụ Token khác nhau?
- Cửa sổ ngữ cảnh là gì? Cửa sổ ngữ cảnh càng lớn hiệu quả nhất định càng tốt không?
- Vấn đề Lost in the Middle là gì? Tình huống ngữ cảnh dài giảm thiểu như thế nào?
- Temperature, Top-P, Top-K lần lượt kiểm soát gì? Môi trường sản xuất thiết lập ổn định hơn như thế nào?
- Tại sao Temperature đặt bằng 0, đầu ra mô hình vẫn có thể không hoàn toàn nhất quán?
- Mô hình lớn tại sao tạo ra ảo giác? Có những giải pháp giảm thiểu phổ biến nào?
- Ngân sách Token ước tính như thế nào? Đầu vào, đầu ra, tin nhắn lịch sử, bằng chứng RAG đánh đổi như thế nào?
- Cửa sổ ngữ cảnh dài có thay thế được RAG không? Hai loại lần lượt phù hợp với tình huống nào?

Câu hỏi theo dõi thường rơi vào tình huống cụ thể. Ví dụ "lịch sử hội thoại chatbot khách hàng của bạn quá dài thì sao?" Lúc này đừng chỉ nói "làm tóm tắt", câu trả lời hoàn chỉnh hơn là: Trước tiên phân biệt trạng thái nghiệp vụ phải giữ, hội thoại gần đây, hồ sơ người dùng và chat nhàn rỗi có thể bỏ; rồi làm ngân sách Token; vượt quá ngưỡng thì làm tóm tắt có cấu trúc cho tin nhắn lịch sử; bằng chứng RAG chỉ đặt đoạn liên quan nhất; cuối cùng xác minh qua tập đánh giá xem sau khi nén có ảnh hưởng câu trả lời câu hỏi quan trọng không.

![Ví dụ quá trình tokenize](/images/github/javaguide/ai/llm/llm-token-process.png)

## Kỹ thuật gọi API

Bài viết tham khảo: [《Thực hành kỹ thuật gọi API mô hình lớn: đầu ra streaming, retry, rate limiting và trả về có cấu trúc》](../llm-basis/llm-api-engineering.md)

Nhóm câu hỏi này kiểm tra bạn có coi mô hình như dependency sản xuất để quản trị không. Gọi API mô hình lớn rất giống HTTP API thông thường, nhưng còn phức tạp hơn: chậm, đắt, không ổn định, đầu ra không thể kiểm soát hoàn toàn, còn có thể bị nhà cung cấp rate limit.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Một lần gọi mô hình không chỉ là "gửi request nhận kết quả", mà là một chain hoàn chỉnh: xác minh request, lắp ráp Prompt, chèn ngữ cảnh, định tuyến mô hình, rate limiting, timeout, retry, trả về streaming, phân tích có cấu trúc, log và đánh giá.
- Streaming chủ yếu cải thiện trải nghiệm ký tự đầu tiên, không bằng giảm tổng thời gian, cũng không bằng giảm chi phí Token.
- Retry phải gắn kết với idempotency. Không có thiết kế idempotency, retry có thể gây trừ phí trùng lặp, ghi database trùng lặp, thực thi công cụ trùng lặp.
- Rate limiting không thể chỉ nhìn QPS, còn phải nhìn RPM, TPM, số concurrency, kích thước ngữ cảnh, đầu ra tối đa và ngân sách tenant.

Câu hỏi tần suất cao:

- Chain hoàn chỉnh của gọi API mô hình lớn là gì?
- Streaming tại sao có thể cải thiện trải nghiệm người dùng? Nó có thể giảm tổng thời gian và chi phí Token không?
- SSE, WebSocket, HTTP Chunked trong tình huống đầu ra streaming chọn như thế nào?
- Lỗi API mô hình lớn nào có thể retry? Lỗi nào không thể retry?
- Tại sao gọi mô hình lớn phải làm idempotency?
- Rate limiting mô hình lớn tại sao không thể chỉ làm theo QPS?
- Model gateway thường cần đảm nhận những năng lực gì?
- Log gọi ứng dụng AI ít nhất phải ghi những trường nào?

Cách trả lời khá ổn định là trước tiên nói "chain", rồi nói "quản trị". Ví dụ trả lời "tại sao cần model gateway", có thể triển khai như sau: model gateway tập trung hóa sự khác biệt nhà cung cấp, định tuyến mô hình, fallback, rate limiting, circuit breaker, ngân sách Token, quy nhân chi phí và quan sát, tránh code nghiệp vụ kết nối trực tiếp với nhà cung cấp mô hình nào đó. Nghiệp vụ chỉ quan tâm đến năng lực, gateway chịu trách nhiệm ổn định và chi phí.

## Đầu ra có cấu trúc và gọi công cụ

Bài viết tham khảo: [《Đầu ra có cấu trúc mô hình lớn: từ contract JSON đến triển khai Function Calling》](../llm-basis/structured-output-function-calling.md)

Nhóm câu hỏi này là điểm hỏi thêm tần suất cao của phát triển ứng dụng AI. Vì chỉ cần đầu ra mô hình vào hệ thống nghiệp vụ, là không thể tránh đầu ra có cấu trúc, xác minh Schema và bảo mật gọi công cụ.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- "Hãy trả về JSON" chỉ là gợi ý ngôn ngữ tự nhiên, không phải ràng buộc cứng. Mô hình có thể xuất thêm giải thích, thiếu trường, lỗi kiểu dữ liệu, viết tùy tiện enum.
- JSON Mode chủ yếu đảm bảo JSON hợp lệ, Structured Outputs chú trọng hơn vào có phù hợp Schema không, nhưng server vẫn phải xác minh.
- Bản chất của Function Calling là để mô hình tạo sinh ý định gọi công cụ, quyền thực thi thực sự ở hệ thống nghiệp vụ.
- MCP giải quyết công cụ làm thế nào để được kết nối chuẩn hóa vào host, Function Calling giải quyết mô hình làm thế nào để biểu đạt ý định gọi, chúng không ở cùng một lớp.
- Gọi công cụ phải làm xác minh tham số, xác minh quyền, xác nhận lần hai, idempotency, kiểm toán và kiểm soát timeout.

Câu hỏi tần suất cao:

- Tại sao chỉ viết "hãy trả về JSON" không đáng tin?
- JSON Mode và Structured Outputs có gì khác nhau?
- JSON Schema trong ứng dụng mô hình lớn giải quyết vấn đề gì?
- Chain hoàn chỉnh của Function Calling là gì?
- Function Calling và MCP có gì khác nhau?
- MCP Tool và HTTP API thông thường có quan hệ gì?
- Agent Skill và Function Calling có phải là một không?
- Sau khi đầu ra có cấu trúc thất bại xử lý như thế nào?
- Tại sao gọi công cụ phải làm quản trị bảo mật?
- Trong phỏng vấn tóm tắt đầu ra có cấu trúc bằng một câu như thế nào?

Loại câu hỏi này dễ trả lời quá trừu tượng. Khuyến nghị luôn mang theo một ví dụ nghiệp vụ: ví dụ "gọi công cụ hoàn tiền". Mô hình có thể tạo sinh tham số gọi `refundOrder(orderId, amount, reason)`, nhưng backend phải xác nhận người dùng hiện tại có quyền không, đơn hàng có thuộc về người này không, số tiền có thể hoàn không, đã hoàn chưa, có cần xác nhận lần hai không. Mô hình chỉ có thể đề xuất ý định, không thể bỏ qua quy tắc nghiệp vụ.

## Đánh giá ứng dụng AI

Bài viết tham khảo: [《Hệ thống đánh giá ứng dụng AI: từ xây dựng Golden Set đến vòng lặp grayscale trực tuyến》](../llm-basis/llm-evaluation.md)

Nhiều ứng viên biết điều chỉnh Prompt, nhưng không nói được "cách chứng minh điều chỉnh tốt hơn". Đây là giá trị của câu hỏi đánh giá. Phỏng vấn viên hỏi đánh giá, thường đang phán đoán bạn có ý thức sản xuất không.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Public benchmark chỉ có thể phán đoán sơ bộ năng lực chung của mô hình, không thể đại diện cho phân phối dữ liệu nghiệp vụ của bạn.
- Giá trị của Golden Set không ở số lượng, mà ở phân phối. Đường dẫn thông thường, tình huống biên, mẫu đối nghịch, thất bại có trọng số cao đều phải bao gồm.
- LLM-as-Judge có thể cải thiện hiệu suất đánh giá, nhưng có độ lệch vị trí, độ lệch dài dòng, độ lệch đồng nguồn và giới hạn năng lực suy luận, không thể hoàn toàn thay thế thủ công.
- RAG và Agent đều phải đánh giá theo đoạn. Chỉ xem câu trả lời cuối cùng, rất khó định vị vấn đề đến từ truy xuất, tạo sinh, gọi công cụ hay quỹ đạo thực thi.

Câu hỏi tần suất cao:

- Tại sao không thể chỉ dựa vào public benchmark để đánh giá chất lượng ứng dụng AI?
- Golden Set nên xây dựng như thế nào? Giai đoạn cold start chưa có log sản xuất thì sao?
- LLM-as-Judge có những độ lệch chính nào? Giảm thiểu như thế nào?
- Tại sao đánh giá RAG phải chia hai đoạn truy xuất và tạo sinh?
- Tại sao đánh giá Agent phức tạp hơn hỏi đáp thông thường và RAG?
- Đánh giá offline, Trace playback, grayscale trực tuyến lần lượt giải quyết vấn đề gì?
- Đánh giá AI trong CI làm thế nào để cân bằng tốc độ và độ phủ?
- Nếu kết quả đánh giá LLM-as-Judge và đánh giá thủ công không nhất quán, nên xử lý như thế nào?

Khi trả lời câu hỏi đánh giá, hãy cố gắng tạo thành vòng lặp kín: Trước tiên có Golden Set để hồi quy offline, rồi dùng Trace playback để bao gồm đường dẫn trực tuyến thực tế, cuối cùng xác minh phân phối người dùng thực tế qua grayscale và lấy mẫu trực tuyến. Không có chain này, tối ưu hóa về cơ bản dựa vào cảm giác.

## Khung trả lời câu hỏi

Câu hỏi cơ bản mô hình lớn có thể áp dụng một framework đơn giản:

1. Trước tiên giải thích khái niệm: Dùng một câu nói rõ nó là gì.
2. Rồi nêu ảnh hưởng: Nó ảnh hưởng chất lượng, chi phí, độ trễ, ổn định hay bảo mật.
3. Tiếp theo đưa ra cách làm kỹ thuật: Trong sản xuất cấu hình, xác minh, xuống cấp hoặc quan sát như thế nào.
4. Cuối cùng bổ sung ranh giới: Tình huống nào sẽ thất bại, hoặc cần kết hợp với giải pháp khác.

Ví dụ hỏi "ngữ cảnh dài có thay thế được RAG không", có thể trả lời như sau:

Ngữ cảnh dài có thể nâng cao dung lượng đầu vào đơn lần, phù hợp để phân tích sâu ít tài liệu, nhưng nó không thể hoàn toàn thay thế RAG. Knowledge base doanh nghiệp thường có lượng lớn tài liệu, cách ly quyền, cập nhật thường xuyên, kiểm soát chi phí và yêu cầu truy xuất nguồn, không thể mỗi lần nhét tất cả nội dung vào cửa sổ. Cách làm thực tế hơn là dùng RAG để lọc bằng chứng ứng viên, rồi giao ít ngữ cảnh chất lượng cao cho mô hình ngữ cảnh dài xử lý.

## Điểm trừ phổ biến

- Chỉ học thuộc định nghĩa, không nói ảnh hưởng kỹ thuật.
- Coi API mô hình lớn như interface HTTP thông thường, không có ý thức rate limiting, retry, idempotency, quan sát.
- Cho rằng đầu ra có cấu trúc bằng "để mô hình trả về JSON", bỏ qua Schema và xác minh server.
- Cho rằng Function Calling là mô hình trực tiếp thực thi hàm, bỏ qua quyền thực thi của hệ thống nghiệp vụ và ranh giới bảo mật.
- Chỉ xem bảng xếp hạng mô hình, không biết Golden Set, Trace playback và grayscale trực tuyến.

## Khuyến nghị ôn tập

Nếu thời gian có hạn, khuyến nghị ôn tập theo thứ tự này:

1. Trước tiên xem Token, cửa sổ ngữ cảnh, tham số lấy mẫu, xây dựng nhận thức cơ bản.
2. Rồi xem kỹ thuật gọi API, hiểu khoảng cách từ Demo đến sản xuất.
3. Tiếp theo xem đầu ra có cấu trúc và Function Calling, đây là điểm hỏi thêm tần suất cao của phát triển ứng dụng AI.
4. Cuối cùng xem hệ thống đánh giá, đặc biệt là Golden Set, LLM-as-Judge, Trace playback.

Khi ôn tập đừng chỉ hỏi mình "khái niệm này là gì", hãy tiếp tục hỏi thêm ba câu: Trong sản xuất sẽ xảy ra vấn đề gì? Cách định vị? Cách quản trị? Trả lời được đến cấp độ này, phỏng vấn cơ bản mô hình lớn cơ bản đã ổn định rồi.
