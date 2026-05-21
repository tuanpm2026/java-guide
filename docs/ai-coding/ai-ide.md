---
title: 9 câu hỏi phỏng vấn mở về lập trình AI
description: Bao gồm các mẹo sử dụng AI IDE như Cursor, Claude Code, Trae, sự khác biệt giữa Spec Coding và Vibe Coding, cũng như tác động của AI đến phát triển backend — những câu hỏi thường gặp trong phỏng vấn.
category: Phát triển ứng dụng AI
icon: “code”
head:
  - - meta
    - name: keywords
      content: AI 编程,Cursor,Claude Code,Spec Coding,Vibe Coding,AI IDE,编程工具,后端开发
---

Khi phỏng vấn tại Tencent, người phỏng vấn hỏi tôi: “Bạn đã dùng công cụ lập trình AI nào chưa?”. Tôi trả lời: “Trae.”

Không khí bỗng im lặng hai giây. Tôi không hiểu tại sao người phỏng vấn lại im lặng, lúc đó tôi còn đang nghĩ: “Có phải câu trả lời của mình chưa đủ ấn tượng không?”

Sau khi bị trượt phỏng vấn mới nhận ra: Trae là của ByteDance, Tencent có CodeBuddy, Alibaba có Qoder.

Thôi, chuyện vui là chuyện vui! Hôm nay Guide chia sẻ 7 câu hỏi mở về lập trình AI thường được hỏi trong các buổi phỏng vấn kỹ thuật hiện nay, hy vọng sẽ giúp ích cho bạn. Qua bài viết này bạn sẽ hiểu được:

1. ⭐ **AI IDE lập trình**: Cursor, Claude Code và các công cụ lập trình AI khác có những mẹo sử dụng gì? Làm thế nào để xây dựng phương pháp luận sử dụng riêng của bạn?
2. ⭐ **Tác động của AI đến phát triển backend**: Bạn nhìn nhận tác động của AI đến phát triển backend như thế nào? AI có loại bỏ lập trình viên cấp thấp không? Rủi ro lớn nhất AI mang lại là gì?
3. ⭐ **Năng lực cạnh tranh cốt lõi trong tương lai**: Bạn nghĩ năng lực cạnh tranh cốt lõi của kỹ sư backend trong 3 năm tới là gì?

## AI IDE lập trình và các mẹo sử dụng

### Bạn đã dùng AI IDE lập trình nào chưa? Cảm giác như thế nào?

Tôi đã dùng qua một số công cụ lập trình AI như Cursor, Trae, Claude Code, trong đó công cụ tôi dùng chủ yếu hàng ngày là Cursor (bạn cứ nói theo kinh nghiệm thực tế của mình, ở đây tôi lấy Cursor làm ví dụ vì nó được dùng nhiều trong nước).

Cảm nhận chung hiện tại là: Khả năng lập trình của AI đang tiến bộ cực kỳ nhanh! Nó đã tiến hóa từ việc chỉ gợi ý code đơn giản vài năm trước thành một trợ lý kỹ thuật có thể cộng tác chuyên sâu.

Tôi đã đúc kết được một phương pháp luận sử dụng riêng cho mình:

1. Khi tiếp nhận một dự án hoặc module phức tạp, tôi không để AI viết code ngay mà trước tiên để Cursor phân tích toàn bộ codebase, tạo ra một tài liệu bao gồm kiến trúc cốt lõi, trách nhiệm của từng module và luồng dữ liệu. Bước này rất quan trọng vì nó quyết định chất lượng của sự cộng tác sau đó. Chỉ khi tôi và AI có cùng sự hiểu biết về dự án thì các sản phẩm đầu ra tiếp theo mới ổn định và chất lượng cao.
2. Với mỗi task phát triển độc lập, tôi luôn mở một cuộc hội thoại mới và cung cấp đầy đủ ngữ cảnh cần thiết, bao gồm bối cảnh yêu cầu, các module liên quan và điều kiện ràng buộc. Cách này giúp giảm đáng kể ô nhiễm ngữ cảnh, để code AI tạo ra chính xác hơn và hầu như không cần làm lại nhiều.
3. Tôi cũng thường xuyên xóa các implementation dư thừa và code đã lỗi thời. Code cũ sẽ làm AI phán đoán sai lệch, tăng nhiễu ngữ cảnh, không dọn dẹp lâu dài sẽ ảnh hưởng trực tiếp đến hiệu quả cộng tác.

AI là một kho kiến thức mạnh mẽ và công cụ hỗ trợ, có thể giúp chúng ta hiện thực hóa tính năng nhanh chóng và học kiến thức mới. Nhưng nếu hoàn toàn dựa vào AI để viết code mà không hiểu nguyên lý, khả năng kỹ thuật cá nhân có thể bị suy giảm.

Vì vậy tôi tuân theo một số nguyên tắc:

- Sau khi AI tạo code phải Review thủ công.
- Logic quan trọng khi cần thiết phải tự viết lại.
- Các đường dẫn cốt lõi phải được kiểm tra tải và kiểm tra biên.

Tôi muốn nâng cao hiệu quả, nhưng không đánh đổi bằng khả năng kỹ thuật.

### ⭐Bạn biết những mẹo sử dụng Cursor nào?

> Ở đây lấy Cursor làm ví dụ, các AI IDE khác cũng tương tự.

1. **Hiểu kiến trúc trước khi bắt tay vào làm**: Dù tự viết code hay để AI tạo, đều phải làm rõ yêu cầu, kiến trúc tổng thể và ranh giới module trước. Nếu code ngay khi kiến trúc còn mơ hồ, rất dễ xảy ra implement trùng lặp hoặc xung đột trách nhiệm, chi phí sửa đổi sau này còn cao hơn.
2. **Một Chat chỉ tập trung vào một tính năng**: Tính năng mới hoặc thay đổi lớn thì mở Chat mới, và đưa mô tả cấu trúc dự án hoặc tài liệu quan trọng vào đầu làm ngữ cảnh nền. Cách này tránh được sự can thiệp của hội thoại cũ, nâng cao chất lượng đầu ra.
3. **Viết hướng dẫn sau khi tính năng hoàn thành**: Để AI tóm tắt quá trình hiện thực, trừu tượng hóa thành các bước chung, hình thành “hướng dẫn vận hành”. Ví dụ như quy trình chuẩn để thêm API mới, cách triển khai thống nhất để xuất file, v.v. Những nội dung này có thể tái sử dụng nhanh cho các yêu cầu tương tự sau này.
4. **Không phụ thuộc AI, chủ động nhìn lại**: AI chỉ là công cụ hỗ trợ, sau khi tạo code cần Review kỹ, hiểu nguyên lý, tối ưu chỗ chưa hợp lý, tránh bị đình trệ về kỹ thuật.
5. **Xóa code thừa định kỳ**: Dọn dẹp code dư thừa, giảm sự nhầm lẫn cho AI và nhiễu ngữ cảnh, nâng cao hiệu quả phát triển.
6. **Sử dụng tốt các file cấu hình**: `.cursorrules` định nghĩa các quy tắc, phong cách và đoạn code thường dùng mà AI tạo; `.cursorignore` chỉ định các file/thư mục không cho AI sửa đổi, bảo vệ code cốt lõi.
7. **Duy trì tài liệu liên tục**: Sau khi dự án có thay đổi lớn, để AI cập nhật tài liệu đồng bộ, ghi lại kinh nghiệm “vấp ngã”, tích lũy kho kiến thức của team.
8. **Để AI “học” dự án trước**: Với dự án lớn, trước tiên để Cursor phân tích codebase, tạo tài liệu cấu trúc bao gồm kiến trúc, trách nhiệm thư mục, các class cốt lõi, v.v. làm ngữ cảnh nền cho quá trình phát triển tiếp theo.

### Bạn biết những mẹo sử dụng Claude Code nào?

Câu hỏi này thực ra trùng lặp với câu trên, tôi đã chia sẻ riêng một bài: [⭐Claude Code使用技巧总结](https://t.zsxq.com/9rSZM).

## Tác động của AI đến phát triển backend

### ⭐Bạn nhìn nhận tác động của AI đến phát triển backend như thế nào?

Tôi cho rằng AI sẽ không thay thế kỹ sư backend, nhưng sẽ **thay đổi đáng kể cách làm việc và cấu trúc năng lực của kỹ sư backend**.

AI giải phóng chúng ta khỏi những công việc lặp đi lặp lại, mang tính khuôn mẫu, trở thành người trợ thủ đắc lực nhất:

- **Ở tầng lập trình**: Công cụ AI xuất sắc trong việc tạo **code mang tính khuôn mẫu (Boilerplate)**, hiệu quả viết CRUD, unit test, glue code có thể tăng 50%~70%. Nhưng với **ràng buộc phân tán** (như gia hạn timeout của distributed lock, ngữ nghĩa Exactly-once của message queue, thiết kế idempotency của API), AI có rủi ro **”ảo giác” đáng kể** — nó thường chỉ đưa ra code cho Happy Path, bỏ qua logic bù đắp ngoại lệ, xử lý race condition và kiểm soát ranh giới distributed transaction trong môi trường production.
- **Ở tầng kiến trúc**: AI đang tạo ra các mô hình ứng dụng mới, như luồng kinh doanh tự động hóa được điều khiển bởi Agent thông minh, backend cần cung cấp các interface năng lực linh hoạt và nguyên tử hơn. Các interface “to và đủ thứ” truyền thống đang dần được phân giải thành các năng lực nguyên tử có thể được AI gọi.
- **Ở tầng vận hành và xử lý sự cố**: AI có thể hỗ trợ phân tích log, giám sát cảnh báo, thậm chí dự đoán điểm nghẽn hệ thống, làm cho việc xử lý sự cố thông minh hơn. Ví dụ, các công cụ dựa trên AIOps (vận hành thông minh) có thể tự động phân tích các mẫu log bất thường, xác định nguyên nhân gốc rễ.

AI cho phép kỹ sư backend tập trung hơn vào các công việc cốt lõi mang tính sáng tạo hơn như mô hình hóa nghiệp vụ, thiết kế hệ thống phức tạp và quyết định kiến trúc. Hơn nữa, AI cũng có thể hỗ trợ chúng ta hoàn thành tốt hơn những việc đó.

Nói về bản thân tôi, tôi thường thảo luận về phương án kinh doanh và kỹ thuật với AI, nó luôn cho tôi những gợi ý tốt — đặc biệt khi phân tích yêu cầu và lựa chọn công nghệ, AI có thể cung cấp cách suy nghĩ đa chiều.

### Bạn nghĩ AI có loại bỏ lập trình viên cấp thấp không?

Trong ngắn hạn sẽ không loại bỏ, nhưng sẽ thay đổi hoàn toàn cấu trúc năng lực của lập trình viên cấp thấp.

Trước đây giá trị của kỹ sư cấp thấp nằm ở:

- Viết CRUD thêm xóa sửa tìm
- Viết các API cơ bản
- Viết câu truy vấn SQL
- Viết các utility class/cấu hình cơ bản

Giờ đây những công việc này AI đều làm được rất tốt, thậm chí hiệu quả hơn và ít lỗi hơn. Nhưng điều này không có nghĩa là lập trình viên cấp thấp sẽ bị loại bỏ, chỉ là điểm tạo ra giá trị của họ đã dịch chuyển.

Kỹ sư cấp thấp trong tương lai cần có:

- **Khả năng phân tích yêu cầu**: Chuyển đổi yêu cầu kinh doanh mơ hồ thành các task kỹ thuật rõ ràng.
- **Khả năng hiểu nghiệp vụ**: Hiểu domain model và quy tắc kinh doanh, không chỉ đơn giản là “dịch yêu cầu”.
- **Khả năng nhận thức kiến trúc**: Hiểu kiến trúc tổng thể của hệ thống, biết vị trí code của mình trong hệ thống.
- **Khả năng diễn đạt Prompt**: Có thể mô tả vấn đề chính xác, lấy được câu trả lời chất lượng cao từ AI.

AI hạ thấp ngưỡng lập trình, nhưng yêu cầu về “khả năng hiểu” lại cao hơn. Kỹ sư cấp thấp trong tương lai giống một “người điều phối AI” hơn là đơn thuần là “người viết code”.

Nhìn từ góc độ tuyển dụng của doanh nghiệp, nhu cầu về khả năng lập trình thuần túy sẽ giảm, nhưng nhu cầu về kỹ sư “có thể tận dụng AI để nhanh chóng giao giá trị kinh doanh” sẽ tăng lên.

### Rủi ro lớn nhất mà AI mang lại là gì?

Tôi cho rằng chủ yếu có ba tầng:

**1. Suy giảm năng lực kỹ thuật**

Phụ thuộc quá nhiều vào AI sẽ dẫn đến suy giảm năng lực kỹ thuật của bản thân kỹ sư, đặc biệt là:

- **Giảm khả năng debug**: Quen để AI xử lý sự cố, bản thân hiểu về nguyên lý cơ bản ngày càng nông cạn.
- **Giảm nhạy cảm với code**: Khả năng phán đoán “code tốt” và “code xấu” suy yếu, thậm chí không biết thế nào là code tốt.
- **Suy giảm tư duy kiến trúc**: Dài hạn chỉ tập trung vào hiện thực tính năng, bỏ qua thiết kế kiến trúc và khả năng mở rộng.

**2. Mất kiểm soát kiến trúc**

Code do AI tạo thường tập trung vào “tính năng hiện tại hoạt động được”, dễ bỏ qua tình trạng sức khỏe kiến trúc dài hạn. Điều này phần lớn xuất phát từ **Vibe Coding (lập trình theo cảm hứng)** — dựa vào ý định mơ hồ để AI “tự do sáng tạo”.

- **Ranh giới module mờ nhạt**: AI có xu hướng “hoàn thành tính năng nhanh chóng”, có thể gộp nhiều trách nhiệm vào cùng một module. Khuyến nghị trước khi code hãy làm rõ trách nhiệm module (Context Boundary theo phong cách DDD), hạn chế phạm vi AI tạo thông qua hợp đồng interface được định nghĩa trước.

- **Tích lũy nợ kỹ thuật**: Để hiện thực tính năng nhanh chóng, AI có thể dùng hardcode, bỏ qua xử lý ngoại lệ chuẩn, đưa vào các dependency vòng không cần thiết và các anti-pattern khác. Những khoản nợ này sẽ tăng đáng kể chi phí refactor khi quy mô dự án tăng lên.

- **Thiếu tính nhất quán về phong cách**: Code được tạo trong các phiên Chat khác nhau có thể dùng các quy ước đặt tên, mẫu xử lý lỗi và định dạng log khác nhau. Khuyến nghị dùng cách **Spec Coding**, định nghĩa trước các quy chuẩn kỹ thuật thống nhất và phong cách code (như `.cursorrules`), để AI luôn làm việc theo cùng một bộ quy tắc.

- **Thiếu quản trị tài nguyên**: AI sẽ không tự động xem xét các ràng buộc tài nguyên như kích thước connection pool, độ dài hàng đợi thread pool, chiến lược hết hạn cache. Ví dụ, code được tạo có thể tạo ra nhiều thread nhưng với queue không giới hạn, dẫn đến tràn bộ nhớ khi lưu lượng tăng đột biến; hoặc dùng cấu hình database connection pool mặc định, trở thành điểm nghẽn khi concurrent cao.

**3. Rủi ro bảo mật (đặc biệt cần chú ý)**

- **Lỗ hổng code**: AI có thể tạo code có lỗ hổng bảo mật, các vấn đề thường gặp bao gồm:
  - **SQL injection**: Dùng nối chuỗi thay vì parameterized query
  - **XSS**: Không thực hiện HTML escape cho input của người dùng
  - **Thiếu kiểm tra quyền**: Thiếu kiểm tra quyền cấp API/method
  - **Rò rỉ thông tin nhạy cảm**: In key, Token hoặc mật khẩu trong log
  - **Lỗ hổng dependency**: Đưa vào thư viện bên thứ ba có CVE đã biết
- **Rò rỉ dữ liệu**: Sử dụng không đúng cách có thể rò rỉ code công ty, logic kinh doanh cho các model bên ngoài (đặc biệt là dịch vụ AI được host trên đám mây).
- **Rủi ro chuỗi cung ứng**: Các package dependency mà AI khuyến nghị có thể chứa lỗ hổng đã biết hoặc code độc hại.
- **Rò rỉ key**: Code do AI tạo có thể hardcode các thông tin nhạy cảm như key, Token.

**4. Các chế độ thất bại trong môi trường phân tán (đặc biệt nguy hiểm)**

Code do AI tạo trong môi trường phân tán rất dễ bỏ qua các ràng buộc quan trọng, dẫn đến sự cố production:

| Chế độ thất bại                               | Vấn đề thường gặp của AI                                             | Rủi ro production                                                            |
| --------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Thiếu idempotency**                         | Không xem xét API idempotency, chèn hoặc cập nhật trực tiếp          | Retry khi timeout mạng dẫn đến dữ liệu trùng lặp, thanh toán trùng           |
| **Race condition concurrent**                 | Thiếu distributed lock hoặc cơ chế CAS                               | Oversell tồn kho, ghi đè sửa đổi concurrent, lỗi thống kê                    |
| **Ranh giới distributed transaction mờ nhạt** | Không làm rõ ranh giới transaction và chiến lược rollback            | Dữ liệu không nhất quán, một phần thành công một phần thất bại, khó truy vết |
| **Thiếu timeout và degradation**              | Chỉ đặt timeout mặc định, không có logic circuit breaker degradation | Cascade failure, hiệu ứng avalanche, service không khả dụng hoàn toàn        |
| **Connection pool leak**                      | Không giải phóng connection kịp thời hoặc cấu hình số connection sai | Connection pool cạn kiệt, service giả chết, phải restart mới phục hồi        |

**Trường hợp điển hình**: Khi AI tạo code “giảm tồn kho”, thường chỉ viết `UPDATE stock SET count = count - 1 WHERE id = ?`, mà bỏ qua:

- Row lock hoặc distributed lock trong môi trường concurrent
- Đảm bảo idempotency khi tồn kho không đủ (cùng một request giảm nhiều lần không được trùng lặp)
- Cơ chế bù đắp khi service downstream timeout
- Chiến lược database connection timeout và circuit breaker

**Chiến lược ứng phó**:

- **Ràng buộc tường minh** trong Spec: Yêu cầu AI tạo template code cho distributed lock, kiểm tra idempotency, logic bù đắp
- **Bắt buộc Code Review**: Tập trung vào các lời gọi xuyên service, ranh giới transaction, nhánh xử lý ngoại lệ
- **Kiểm tra Chaos Engineering**: Kiểm tra khả năng chịu lỗi trong môi trường phân tán thông qua fault injection

Doanh nghiệp phải xây dựng hệ thống quản trị bảo mật phù hợp:

- **Bắt buộc code review**: Code do AI tạo phải được Review thủ công.
- **Quét tự động**: Tích hợp công cụ SAST/SCA, và thêm quét cho các rủi ro đặc trưng của AI (như git-secrets, TruffleHog).
- **Bảo vệ kiến trúc**: Kết hợp Spec Coding, sử dụng các công cụ như ArchUnit để kiểm tra tự động ràng buộc kiến trúc.

### ⭐Bạn nghĩ năng lực cạnh tranh cốt lõi của kỹ sư backend trong 3 năm tới là gì?

Tôi cho rằng trọng tâm của năng lực cạnh tranh cốt lõi sẽ chuyển từ “khả năng viết code” sang bốn chiều sau:

**1. Khả năng thiết kế hệ thống**

AI rất giỏi tạo code cho từng tính năng riêng lẻ, nhưng **thiết kế cấp hệ thống** vẫn cần kỹ sư dẫn dắt:

- Phân tách service và phân chia ranh giới module
- Cân nhắc giữa microservice và monolithic architecture
- Thiết kế data model và chiến lược consistency
- Chiến lược tiến hóa phiên bản API
- Thiết kế distributed transaction và idempotency

**2. Khả năng mô hình hóa nghiệp vụ phức tạp**

Trước đây chúng ta nói AI không giỏi domain modeling, nhưng giờ tình hình đã thay đổi. AI đã rất mạnh trong phân tích yêu cầu, làm rõ quy tắc, suy luận tình huống.

Tuy nhiên, vẫn cần kỹ sư phối hợp để chuyển đổi quy tắc kinh doanh thành thiết kế có thể thực thi phù hợp với dự án hiện tại:

- Mô hình hóa Domain-Driven Design (DDD)
- Trừu tượng hóa luồng nghiệp vụ và thiết kế state machine
- Phân chia bounded context

**3. Khả năng quản trị hiệu năng và ổn định**

Code do AI tạo thường chỉ tập trung vào tính đúng đắn về chức năng mà bỏ qua đặc điểm hiệu năng trong môi trường production:

- **P99 latency**: AI có thể tạo N+1 query, SQL không có index, synchronous blocking call, dẫn đến tăng đột biến tail latency
- **Memory escape**: Tạo object và sử dụng closure không phù hợp có thể dẫn đến GC thường xuyên thậm chí OOM
- **Connection pool phình to**: Không giới hạn concurrent, không đặt timeout có thể làm cạn kiệt connection pool, gây cascade failure

Kỹ sư cần có **khả năng đo lường và tối ưu hiệu năng**:

- Tối ưu slow query SQL và thiết kế index (phân tích execution plan với EXPLAIN)
- Thiết kế chiến lược cache và đảm bảo consistency (local cache vs distributed cache)
- Cải tạo async và điều chỉnh tham số thread pool (số core thread, dung lượng queue, rejection policy)
- Phương án service degradation, circuit breaker, rate limiting (ứng dụng Sentinel, Hystrix)
- Lập kế hoạch capacity và elastic scaling (đánh giá QPS watermark qua load test, auto scaling)

**Phương tiện kiểm tra**: Sau khi AI tạo code, phải kiểm tra P95/P99 latency qua load test (JMeter, Gatling), và xử lý memory leak qua JVM monitoring (MAT, Arthas), không chỉ dựa vào functional test.

**4. Khả năng cộng tác với AI**

Cách cộng tác hiệu quả với AI bản thân đã là một năng lực cạnh tranh cốt lõi:

- **Diễn đạt yêu cầu chính xác (khả năng Prompt)**: Sử dụng Prompt có cấu trúc (bối cảnh-task-ràng buộc-định dạng đầu ra), tránh các lệnh mơ hồ
- **Phân tách vấn đề và dẫn dắt AI**: Phân rã task phức tạp thành các sub-task có thể xác minh độc lập, dùng Chain-of-Thought để dẫn dắt suy luận
- **Đánh giá chất lượng đầu ra của AI**: Xây dựng code Review checklist, tập trung vào tính đúng đắn, bảo mật, hiệu năng, khả năng bảo trì
- **Kiểm tra bảo mật và tuân thủ code**: Quen thuộc với OWASP Top 10, có thể nhận diện rủi ro bảo mật trong code do AI tạo
- **Kết hợp AI toolchain**: Nắm vững cấu hình và sử dụng `.cursorrules`, custom Skills, IDE plugin

Bản chất đây là sự chuyển đổi vai trò từ “người viết code” sang “kỹ sư cộng tác AI”.

Chìa khóa cạnh tranh trong tương lai không còn là “tốc độ tạo ra code” mà là “chất lượng thiết kế hệ thống” và “khả năng giao giá trị kinh doanh”.

## Tổng kết

Công cụ lập trình AI đang thay đổi sâu sắc cách làm việc của lập trình viên. Cursor, Claude Code, Trae và các công cụ khác đã tiến hóa từ gợi ý code thành trợ lý kỹ thuật có thể cộng tác chuyên sâu.

Nhưng dù công cụ có mạnh đến đâu, nó cũng chỉ là công cụ. **Điều thực sự quyết định sự phát triển sự nghiệp của bạn là bạn sử dụng những công cụ này như thế nào, và trong quá trình sử dụng bạn có duy trì suy nghĩ sâu sắc về kỹ thuật hay không.**

Cuối cùng, một số lời khuyên cho những ai đang chuẩn bị phỏng vấn:

1. **Phải thực sự đã dùng mới trả lời được tốt**: Khi người phỏng vấn hỏi về công cụ lập trình AI, điều đáng sợ nhất là “nghe nói nhưng chưa dùng”. Dù chỉ dùng Cursor để viết vài dự án nhỏ cũng tốt hơn chỉ xem tutorial.
2. **Xây dựng phương pháp luận của riêng bạn**: Đừng chỉ “biết dùng”, hãy có kinh nghiệm và best practice riêng của mình, đây là điểm cộng trong phỏng vấn.
3. **Giữ tư duy phê phán**: Sau khi AI tạo code phải Review — đây là素养 cơ bản. Thể hiện thái độ này trong phỏng vấn sẽ khiến người phỏng vấn thấy bạn là một kỹ sư đáng tin cậy.
4. **Theo dõi xu hướng kỹ thuật nhưng đừng lo lắng**: AI sẽ thay đổi nhiều thứ, nhưng các năng lực cốt lõi như thiết kế hệ thống, tư duy kiến trúc, hiểu biết nghiệp vụ sẽ không lỗi thời.

Sử dụng tốt công cụ AI + giữ tư duy độc lập — cả hai thiếu một đều không được.
