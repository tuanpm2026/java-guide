---
title: Tổng hợp câu hỏi phỏng vấn thiết kế hệ thống AI
description: Tổng hợp có hệ thống các câu hỏi phỏng vấn thiết kế hệ thống ứng dụng AI tần suất cao, bao gồm kiến trúc ứng dụng AI cấp sản xuất, model gateway, quản lý Prompt, RAG, Memory, Tool Calling, khả năng quan sát, đánh giá, tuân thủ bảo mật, voice Agent thời gian thực và các điểm kiểm tra cốt lõi khác, kèm bài viết tham khảo tương ứng.
category: AI
tag:
  - Thiết kế hệ thống AI
  - Phỏng vấn AI
  - Ứng dụng mô hình lớn
head:
  - - meta
    - name: keywords
      content: AI系统设计面试题,AI应用架构面试题,大模型应用系统设计,LLM网关面试题,AI可观测面试题,AI评测面试题,语音Agent面试题,AI安全面试题
---

Câu hỏi thiết kế hệ thống AI rất giống thiết kế hệ thống backend truyền thống, nhưng có thêm một biến số đặc biệt khó chịu: mô hình lớn.

Dịch vụ truyền thống thường tuân theo đầu vào-đầu ra xác định, xảy ra vấn đề có thể định vị từng bước qua log, chain, trạng thái database. Ứng dụng AI khác, đầu ra mô hình có tính ngẫu nhiên, Prompt ảnh hưởng hành vi, bằng chứng RAG ảnh hưởng câu trả lời, gọi công cụ có thể thất bại, nhà cung cấp có thể rate limit, đánh giá không thể chỉ dựa vào unit test.

Do đó, điều phỏng vấn thiết kế hệ thống AI thực sự kiểm tra là: **bạn có thể thiết kế một Prompt Demo thành hệ thống sản xuất ổn định, có thể quan sát, có thể đánh giá, có thể rollback, có thể quản trị không.**

Bộ câu hỏi phỏng vấn thiết kế hệ thống AI này được tổng hợp dựa trên các bài viết hiện có trong chuyên mục AI, phù hợp cho nhà phát triển 2 năm trở lên ôn tập. Khuyến nghị chuẩn bị theo mạch chính này:

1. Trước tiên giải thích rõ khoảng cách giữa Prompt Demo và hệ thống sản xuất.
2. Rồi phân tách toàn bộ kiến trúc: đầu vào, biên soạn, ngữ cảnh, RAG, Memory, Tool, model gateway, nhiệm vụ bất đồng bộ, quan sát đánh giá.
3. Tiếp theo nói về chain link quan trọng: một request trải qua những module nào từ đầu, cách xác thực, truy xuất, lắp ráp ngữ cảnh, gọi mô hình, xác minh đầu ra, ghi Trace.
4. Rồi nói về năng lực quản trị: chi phí, rate limiting, xuống cấp, bảo mật, kiểm toán, grayscale, rollback.
5. Cuối cùng nói về vòng lặp đánh giá: Golden Set, Trace playback, grayscale trực tuyến và kiểm tra thủ công.

## Phỏng vấn viên thực sự muốn kiểm tra gì

Câu hỏi thiết kế hệ thống AI thường không thỏa mãn với "tôi dùng LangChain xây một RAG". Phỏng vấn viên muốn xem bạn có ý thức kiến trúc cấp sản xuất không.

| Hướng kiểm tra                | Phỏng vấn viên muốn xác nhận gì                                             | Điểm trừ phổ biến                                     |
| ----------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| Kiến trúc tổng thể            | Bạn có thể phân tách ứng dụng AI thành phân lớp rõ ràng không               | Vào ngay nói framework, không nói chain và ranh giới  |
| Model gateway                 | Bạn có biết gọi mô hình cần quản trị thống nhất không                       | Code nghiệp vụ kết nối trực tiếp với API nhà cung cấp |
| Prompt/Context                | Bạn có biết prompt và ngữ cảnh cần version hóa, có thể playback không       | Prompt viết cứng trong code                           |
| RAG/Memory/Tool               | Bạn có thể phân biệt kiến thức, bộ nhớ và hành động nghiệp vụ thực tế không | Nhét tất cả ngữ cảnh vào một chỗ đưa cho mô hình      |
| Khả năng quan sát và đánh giá | Bạn có thể chứng minh sự thay đổi chất lượng hệ thống không                 | Chỉ dựa vào thử thủ công vài câu hỏi                  |
| Tuân thủ bảo mật              | Bạn có biết mô hình không thể bỏ qua quyền nghiệp vụ không                  | Chỉ dựa vào Prompt để ngăn vượt quyền và injection    |

Câu hỏi system design sợ nhất là mơ hồ chung chung. Đáp án tốt cần có thể nói rõ theo một request: sau khi request người dùng vào, trải qua những module nào, mỗi module giải quyết vấn đề gì, xảy ra vấn đề định vị như thế nào, chất lượng giảm xuống rollback như thế nào.

## Kiến trúc ứng dụng AI cấp sản xuất

Bài viết tham khảo: [《Thiết kế hệ thống ứng dụng AI: từ Prompt Demo đến kiến trúc cấp sản xuất》](../system-design/ai-application-architecture.md)

Nhóm câu hỏi này là cốt lõi của thiết kế hệ thống AI. Bạn phải có thể phân tách ứng dụng AI thành nhiều module kỹ thuật, không chỉ nói "frontend gửi request, backend gọi mô hình".

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Prompt Demo chứng minh mô hình có thể trả lời, hệ thống sản xuất cần chứng minh hệ thống có thể trả lời lâu dài, ổn định, có thể kiểm soát.
- Lớp đầu vào chịu trách nhiệm xác thực, tenant, rate limiting, xác minh tham số và phân loại request.
- Lớp biên soạn chịu trách nhiệm xác định loại nhiệm vụ, là hỏi đáp thông thường, RAG, Agent, nhiệm vụ multi-tool, hay xử lý batch bất đồng bộ.
- Lớp Prompt/Context chịu trách nhiệm phiên bản template, xác minh biến, lịch sử tin nhắn, bằng chứng truy xuất, hồ sơ người dùng và mô tả công cụ.
- RAG quản lý kiến thức chia sẻ, Memory quản lý sự kiện cá nhân hóa dài hạn, Tool quản lý hành động nghiệp vụ thực tế, ba loại phải được quản trị riêng biệt.
- Model gateway chịu trách nhiệm thích ứng nhà cung cấp, định tuyến, fallback, rate limiting, circuit breaker, ngân sách Token, quy nhân chi phí và quan sát.
- Lớp đánh giá quan sát chịu trách nhiệm Trace, log, chỉ số, Golden Set, LLM-as-Judge, grayscale và playback.

Câu hỏi tần suất cao:

- Khoảng cách lớn nhất từ Prompt Demo đến hệ thống sản xuất là gì?
- Cách thiết kế kiến trúc tổng thể của ứng dụng AI cấp sản xuất?
- Một AI request từ đầu vào đến mô hình trả về, chain hoàn chỉnh nên nói như thế nào?
- Lớp đầu vào, lớp biên soạn, Prompt/Context, RAG/Memory/Tool, model gateway, đánh giá quan sát lần lượt đảm nhận trách nhiệm gì?
- Ba chế độ đồng bộ, streaming, bất đồng bộ chọn như thế nào?
- Tại sao cần model gateway?
- Tại sao Prompt phải làm quản lý phiên bản?
- Sự khác biệt giữa RAG và Memory là gì? Tại sao không thể quản trị chung?
- Ranh giới bảo mật của Tool Calling ở đâu?
- Quan sát ứng dụng AI cần xem những chỉ số nào?
- LLM-as-Judge có thể thay thế đánh giá thủ công không?

Khi trả lời "cách thiết kế ứng dụng AI cấp sản xuất", có thể dùng một template chung: trước tiên nêu rõ mục tiêu nghiệp vụ và ràng buộc, rồi nói kiến trúc phân lớp, tiếp theo nói chain một request, rồi nói ổn định, bảo mật, chi phí, quan sát và đánh giá, cuối cùng nói grayscale và rollback. Như vậy thuyết phục hơn là trực tiếp liệt kê một đống tên kỹ thuật.

## Quản trị ổn định, chi phí và bảo mật

Bài viết tham khảo: [《Thiết kế hệ thống ứng dụng AI: từ Prompt Demo đến kiến trúc cấp sản xuất》](../system-design/ai-application-architecture.md)、[《Thực hành kỹ thuật gọi API mô hình lớn: đầu ra streaming, retry, rate limiting và trả về có cấu trúc》](../llm-basis/llm-api-engineering.md)

Nhóm câu hỏi này kiểm tra ý thức sản xuất. Gọi mô hình lớn chậm, đắt, không ổn định, đầu ra còn không thể kiểm soát hoàn toàn. Không có năng lực quản trị, ứng dụng AI rất dễ trở thành lỗ đen chi phí và nguồn gây sự cố sau khi lên mạng.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Timeout cần đặt theo phân lớp: timeout đầu vào, timeout gọi mô hình, timeout gọi công cụ, timeout nhiệm vụ bất đồng bộ.
- Retry chỉ phù hợp với các lỗi có thể phục hồi như mạng chập chờn, một phần 5xx, nhà cung cấp quá tải; lỗi tham số, lỗi quyền, từ chối bảo mật không thể retry mù quáng.
- Rate limiting cần nhìn đồng thời số request, số Token, số concurrency, ngân sách tenant và quota nhà cung cấp mô hình.
- Fallback cần thận trọng. Xuống cấp mô hình có thể ảnh hưởng chất lượng, định dạng, khả năng gọi công cụ và chiến lược bảo mật, không phải tất cả nhiệm vụ đều có thể tự động xuống cấp.
- Chi phí Token cần quy nhân theo tenant, người dùng, tính năng, mô hình, phiên bản Prompt và tình huống nghiệp vụ.
- Bảo mật Tool Calling phải được thực thi cứng ở backend, không thể tin mô hình tự phán đoán quyền.

Câu hỏi tần suất cao:

- Ứng dụng AI làm timeout, retry, rate limiting, circuit breaker và xuống cấp như thế nào?
- Tại sao rate limiting gọi mô hình lớn phải nhìn đồng thời RPM, TPM, concurrency và ngân sách tenant?
- Cách thiết kế chiến lược model fallback? Khi nào không thể tự động xuống cấp?
- Chi phí Token quy nhân đến tenant, người dùng, tính năng và phiên bản Prompt như thế nào?
- Tại sao gọi công cụ rủi ro cao phải làm xác nhận lần hai?
- Desensitize PII, lọc quyền, log kiểm toán nên đặt ở những khâu nào?
- Tấn công Prompt Injection ở cấp thiết kế hệ thống ngăn như thế nào?
- Sau khi xảy ra sự cố đầu ra mô hình, cách định vị vấn đề qua Trace playback?

Khi trả lời câu hỏi bảo mật, nhất định phải nhấn mạnh: Prompt chỉ có thể hỗ trợ, không thể thay thế xác minh quyền ở cấp code. Mô hình có thể đề xuất gọi công cụ, nhưng backend phải xác minh danh tính người dùng, quyền sở hữu tài nguyên, phạm vi tham số, rủi ro thao tác và trạng thái idempotency.

## Đánh giá và lặp liên tục

Bài viết tham khảo: [《Hệ thống đánh giá ứng dụng AI: từ xây dựng Golden Set đến vòng lặp grayscale trực tuyến》](../llm-basis/llm-evaluation.md)

Hệ thống truyền thống trước khi lên mạng có thể chạy unit test, integration test, stress test; ứng dụng AI còn phải đánh giá chất lượng câu trả lời, chất lượng truy xuất, quỹ đạo công cụ và ổn định đầu ra có cấu trúc. Không có vòng lặp đánh giá, rất khó biết một lần điều chỉnh Prompt, chuyển đổi mô hình, thay đổi tham số truy xuất rốt cuộc là cải thiện hay thụt lùi.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Golden Set là nền tảng hồi quy chất lượng trước khi phát hành, nên bao gồm đường dẫn thông thường, tình huống biên, mẫu đối nghịch và thất bại có trọng số cao.
- Đánh giá offline phù hợp để chặn thụt lùi rõ ràng trước khi phát hành, Trace playback phù hợp để tái hiện đường dẫn trực tuyến thực tế, grayscale trực tuyến phù hợp để xác minh phân phối người dùng thực tế.
- RAG cần chia đánh giá truy xuất và tạo sinh, Agent cần nhìn tỷ lệ hoàn thành nhiệm vụ, lựa chọn công cụ, độ chính xác tham số và chất lượng quỹ đạo.
- LLM-as-Judge có thể cải thiện hiệu suất, nhưng cần dùng lấy mẫu thủ công, xác minh quy tắc và hiệu chỉnh câu trả lời tham chiếu.
- Kết quả đánh giá cần gắn kết với phiên bản Prompt, phiên bản mô hình, cấu hình truy xuất, phiên bản code để tiện rollback và định vị.

Câu hỏi tần suất cao:

- Tại sao không có tập đánh giá rất khó yên tâm lên mạng?
- Golden Set làm thế nào để bao gồm đường dẫn thông thường, tình huống biên, mẫu đối nghịch và thất bại có trọng số cao?
- Đánh giá offline, Trace playback, grayscale trực tuyến lần lượt đặt ở giai đoạn nào trong quy trình phát hành?
- Tại sao chỉ số đánh giá RAG, Agent, đầu ra có cấu trúc không thể dùng chung một bộ?
- LLM-as-Judge có những độ lệch nào? Trong sản xuất hiệu chỉnh như thế nào?
- Đánh giá AI tự động trong CI làm thế nào để kiểm soát chi phí và thời gian?
- Khi chất lượng trực tuyến giảm xuống, cách xác định là mô hình, Prompt, truy xuất, công cụ hay thay đổi phân phối dữ liệu gây ra?

Trong phỏng vấn có thể mô tả đánh giá như một pipeline: giai đoạn phát triển chạy Golden Set cốt lõi quy mô nhỏ, trước khi merge hoặc phát hành chạy đánh giá đầy đủ, giai đoạn grayscale làm lấy mẫu trực tuyến, sau sự cố dùng Trace playback để tái hiện, mẫu thất bại lại được đưa vào tập đánh giá.

## Voice Agent thời gian thực

Bài viết tham khảo: [《Giải thích kỹ thuật giọng nói AI: từ ASR, TTS đến triển khai kỹ thuật voice Agent thời gian thực》](../system-design/ai-voice.md)

Voice Agent thời gian thực là câu hỏi thiết kế hệ thống AI rất điển hình, vì nó đồng thời kiểm tra pipeline đa phương thức, độ trễ thấp, state machine, xử lý ngắt và lựa chọn kiến trúc cloud-edge.

Khuyến nghị nắm vững các điểm mấu chốt sau:

- Voice Agent không phải ghép nối đơn giản ASR + LLM + TTS, mà là một hệ thống luồng âm thanh thời gian thực.
- Pipeline hoàn chỉnh bao gồm thu âm thanh, VAD, ASR, LLM, gọi công cụ, TTS, phát streaming và xử lý ngắt.
- Độ trễ end-to-end đến từ nhiều khâu: gửi audio frame, phán đoán VAD, phiên âm ASR, ký tự đầu tiên LLM, gói đầu tiên TTS, mạng và buffer phát.
- Xử lý ngắt cần hủy phát, hủy tạo sinh, xử lý nội dung đã phát và chưa phát, cập nhật trạng thái hội thoại.
- Cloud API lên mạng nhanh, mô hình local có thể kiểm soát nhưng chi phí kỹ thuật cao, kiến trúc hybrid cloud-edge phù hợp hơn để cân bằng trải nghiệm và chi phí.

Câu hỏi tần suất cao:

- Cách thiết kế voice Agent thời gian thực?
- ASR, LLM, TTS, VAD trong hệ thống giọng nói lần lượt đảm nhận trách nhiệm gì?
- Độ trễ end-to-end của voice Agent thời gian thực chủ yếu đến từ đâu?
- Khi người dùng ngắt, hệ thống nên hủy phát, hủy tạo sinh và cập nhật ngữ cảnh như thế nào?
- Các trạng thái listening, thinking, speaking, interrupted quản lý như thế nào?
- Cloud API, mô hình local, kiến trúc hybrid cloud-edge chọn như thế nào?
- Speech-to-Speech API phù hợp với tình huống nào? Có những sự đánh đổi nào?
- Các chỉ số quan sát của voice Agent nên bao gồm những gì?

Khi trả lời câu hỏi giọng nói thời gian thực, có thể trước tiên phân tách pipeline, rồi nói tối ưu độ trễ thấp, tiếp theo nói state machine và ngắt, cuối cùng nói quan sát và lựa chọn. Đừng chỉ dừng lại ở "gọi interface nhận dạng giọng nói và tổng hợp giọng nói".

## Template trả lời câu hỏi thiết kế hệ thống

Gặp câu hỏi thiết kế hệ thống AI mở, có thể trả lời theo thứ tự sau:

1. **Xác định rõ tình huống và ràng buộc**: Quy mô người dùng, độ trễ phản hồi, nguồn dữ liệu, yêu cầu quyền, ngân sách chi phí, mục tiêu chất lượng.
2. **Phân tách chain chính**: Đầu vào, biên soạn, ngữ cảnh, RAG, Memory, Tool, model gateway, xác minh đầu ra, đánh giá quan sát.
3. **Nói luồng dữ liệu quan trọng**: Một request được xác thực, truy xuất, lắp ráp Prompt, gọi mô hình, xử lý đầu ra streaming, ghi Trace như thế nào.
4. **Bổ sung năng lực quản trị**: Rate limiting, circuit breaker, retry, idempotency, fallback, quy nhân chi phí, kiểm soát quyền, log kiểm toán.
5. **Nói vòng lặp đánh giá**: Golden Set, đánh giá offline, Trace playback, grayscale trực tuyến, hồi lưu mẫu thất bại.
6. **Nêu rõ ranh giới đánh đổi**: Tình huống nào đồng bộ, tình huống nào streaming, tình huống nào bất đồng bộ; nhiệm vụ nào cho phép xuống cấp, nhiệm vụ nào phải xác nhận thủ công.

Template này có thể bao gồm hầu hết câu hỏi thiết kế hệ thống ứng dụng AI, bao gồm dịch vụ khách hàng thông minh, knowledge base doanh nghiệp, code assistant, data analysis Agent, voice Agent.

## Điểm trừ phổ biến

- Vào ngay nói tên framework, không nói ràng buộc nghiệp vụ và ranh giới hệ thống.
- Chỉ nói Prompt và mô hình, không nói sự khác biệt quản trị của RAG, Memory, Tool.
- Không có ý thức model gateway, code nghiệp vụ gọi trực tiếp API nhà cung cấp.
- Không ghi phiên bản Prompt, phiên bản mô hình, kết quả truy xuất, quỹ đạo công cụ, dẫn đến sự cố không thể playback.
- Coi LLM-as-Judge là đánh giá vạn năng, không làm hiệu chỉnh thủ công và xác minh quy tắc.
- Chỉ dựa vào Prompt làm bảo vệ bảo mật, bỏ qua quyền, desensitize, kiểm toán và xác nhận lần hai.
- Không có cơ chế grayscale, rollback và hồi lưu mẫu thất bại.

## Khuyến nghị ôn tập

Phỏng vấn thiết kế hệ thống AI cần trả lời theo "chain hệ thống", đừng bắt đầu từ một tên framework hay công cụ. Cách biểu đạt ổn định hơn là trước tiên nói khoảng cách Demo và sản xuất, rồi nói kiến trúc phân lớp, chain cốt lõi, năng lực quản trị và vòng lặp đánh giá.

Nếu phỏng vấn viên tiếp tục hỏi thêm, rồi mới mở rộng model gateway, phiên bản Prompt, cách ly RAG và Memory, bảo mật Tool Calling, Trace playback, đánh giá grayscale những điểm mấu chốt này.

Cuối cùng nhớ một câu: **Thiết kế hệ thống AI không phải để mô hình trả lời một lần, mà là để hệ thống trả lời lâu dài, ổn định, có thể kiểm soát.** Có thể triển khai câu này thành kiến trúc, chain, quản trị và đánh giá, cơ bản đã đạt được cấp độ phỏng vấn viên muốn nghe.
