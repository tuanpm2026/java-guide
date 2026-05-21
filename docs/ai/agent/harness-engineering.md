---
title: "Hiểu rõ Harness Engineering trong một bài viết: Kiến trúc sáu lớp, quản lý ngữ cảnh và thực chiến từ các đội nhóm hàng đầu"
description: Phân tích sâu về Harness Engineering, làm rõ định nghĩa cốt lõi Agent = Model + Harness, trình bày kinh nghiệm thực chiến và bài học từ các đội nhóm hàng đầu như OpenAI, Anthropic, Stripe.
category: Phát triển ứng dụng AI
head:
  - - meta
    - name: keywords
      content: Harness Engineering,AI Agent,智能体,Claude Code,Codex,AGENTS.md,上下文工程,Agent架构
---

Trong nửa năm gần đây, nhiều developer đồng cảm: dùng model đắt nhất mà Agent chạy vẫn lộn xộn — lặp lỗi, làm nửa chừng bỏ, càng chạy càng ngốc. Đổi model mạnh hơn cũng không khá hơn bao nhiêu.

Nguyên nhân không phải do model. Can.ac đã làm một thí nghiệm chứng minh điều này: cùng một model, chỉ thay đổi cách gọi interface chỉnh sửa file, điểm benchmark code nhảy thẳng từ 6.7% lên 68.3%. Model không đổi, cái đổi là hệ thống bao quanh nó.

**Harness Engineering** đang trở thành từ khóa hot trong cộng đồng phát triển AI Agent. Mitchell Hashimoto dùng cụm từ này trong blog (ông nói nguyên văn "tôi không biết ngành có thuật ngữ thống nhất chưa, tôi tự gọi đây là harness engineering"), vài ngày sau OpenAI ra một báo cáo thí nghiệm hàng triệu dòng code, Birgitta Böckeler viết phân tích sâu trên trang Martin Fowler, Anthropic tháng 3 lại cho ra kiến trúc đa tác nhân hoàn toàn mới. Chỉ trong vài tuần, Harness đã trở thành khái niệm không thể bỏ qua khi bàn về phát triển AI Agent.

Bài viết hôm nay sẽ hệ thống hóa các khái niệm cốt lõi và phương pháp kỹ thuật của Harness Engineering, giúp bạn hiểu rõ: **Trần giới hạn quyết định hiệu suất Agent nằm ở đâu.** Bài gần 13.000 từ, khuyến khích lưu lại, bạn sẽ hiểu:

1.  **Harness thực sự là gì**: Tại sao nói "bạn không phải model, vậy bạn là Harness"? Công thức Agent = Model + Harness nên hiểu thế nào? Quan hệ với Prompt Engineering, Context Engineering là gì? Kiến trúc sáu lớp trông như thế nào?
2.  ⭐ **Tại sao nút thắt không phải model mà là Harness**: Cùng model chỉ đổi format interface, điểm nhảy từ 6.7% lên 68.3%? Ngữ cảnh dùng đến 40% thì Agent bắt đầu ngốc đi?
3.  ⭐ **Danh sách hành động xây dựng Harness từ đầu**: Ba mức ưu tiên P0/P1/P2, dùng theo nhu cầu.
4.  ⭐ **Case study thực chiến từ các đội nhóm hàng đầu** (phụ lục): OpenAI ba người năm tháng triệu dòng không viết tay, kiến trúc ba tác nhân kiểu GAN của Anthropic và chiến lược context resets bàn giao, hơn 1300 PR không cần giám sát mỗi tuần của Stripe, sáu bước tiến bộ của Mitchell Hashimoto.

> **📌 Đọc theo chuỗi**: Bài này là một phần của series AI Agent, các bài liên quan:
>
> - [Khái niệm cốt lõi AI Agent: Agent Loop, Context Engineering, đăng ký Tools](https://javaguide.cn/ai/agent/agent-basis.html)
> - [Giải thích chi tiết Agent Skills: Là gì? Dùng thế nào? Khác Prompt, MCP ở điểm nào?](https://javaguide.cn/ai/agent/skills.html)
> - [Phân tích toàn diện MCP, kèm thực hành kỹ thuật](https://javaguide.cn/ai/agent/mcp.html)

## ⭐️ Khái niệm cốt lõi của Harness

### Harness thực sự là gì?

Một câu: **Agent = Model + Harness. Bạn không phải model, vậy bạn là Harness.**

Nghe có vẻ tuyệt đối? Nhưng nghĩ kỹ, nó thực sự nắm bắt được điểm mấu chốt.

**Harness là tất cả mọi thứ ngoài model** — system prompt, tool calling, file system, môi trường sandbox, logic điều phối, hook middleware, feedback loop, cơ chế ràng buộc. Bản thân model chỉ là nguồn gốc của năng lực, chỉ khi Harness kết nối state, tools, feedback và constraints lại với nhau thì nó mới thực sự trở thành một Agent.

Vivek Trivedi của LangChain trong bài "The Anatomy of an Agent Harness" giải thích định nghĩa này rất rõ: **Trước tiên hãy làm rõ model chịu trách nhiệm gì, hệ thống còn lại phải bổ sung gì, dùng đường phân chia này để cắt toàn bộ hệ thống.**

Ví dụ như: model là CPU, Harness là hệ điều hành. CPU mạnh đến đâu, OS tệ cũng vô dụng. Bạn mua chip M5 mới nhất, cài hệ thống liên tục crash, trải nghiệm còn không bằng chip cũ với OS ổn định.

![Agent = Model + Harness](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-agent-equals-model-harness-arch.png)

### Quan hệ giữa Harness và Prompt/Context Engineering là gì?

Ba cái này không phải quan hệ song song, mà là quan hệ lồng nhau. Quan trọng hơn, **mỗi lớp giải quyết vấn đề hoàn toàn khác nhau**:

![Quan hệ giữa Harness và Prompt/Context Engineering](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-engineering-layers-arch.png)

| Lớp                     | Vấn đề cốt lõi cần giải quyết                                            | Điểm tập trung                                                         | Công việc điển hình                                                      |
| ----------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Prompt Engineering**  | Biểu đạt — cách viết lệnh tốt                                            | Định hình không gian xác suất cục bộ, giúp model hiểu ý định           | Thiết kế system prompt, ví dụ Few-shot, hướng dẫn chain of thought       |
| **Context Engineering** | Thông tin — cho Agent xem gì                                             | Đảm bảo model nhận được thông tin đúng và cần thiết vào đúng thời điểm | Quản lý ngữ cảnh, RAG, memory injection, tối ưu Token                    |
| **Harness Engineering** | Thực thi — toàn bộ hệ thống làm sao chống sụp đổ, đo lường, vận hành bền | Chính xác liên tục, sửa lệch hướng, khôi phục sự cố trong tác vụ dài   | File system, sandbox, thực thi ràng buộc, quản lý entropy, feedback loop |

Trong tác vụ đơn giản, prompt quan trọng nhất — nói rõ ràng là đủ; trong tác vụ phụ thuộc kiến thức bên ngoài, ngữ cảnh rất quan trọng — phải đưa thông tin đúng vào; nhưng trong các kịch bản thương mại thực tế với chuỗi dài, có thể thực thi, dung sai lỗi thấp, Harness mới là thứ quyết định thành bại. Trọng tâm của các đội nhóm hàng đầu đều đặt vào Harness, lý do là thế.

### Harness bao gồm những thành phần nào?

Cách tốt nhất để hiểu Harness không phải nhìn vào những gì nó chứa đựng, mà xem model không làm được gì. Dù model trông có vẻ năng lực đến đâu, bản chất vẫn là một hàm văn bản (hoặc hình ảnh, âm thanh) vào, văn bản ra.

**Những gì model không làm được, là thứ Harness phải bổ sung:**

| Model không làm được                                              | Harness bổ sung như thế nào                                  | Thành phần cốt lõi            |
| ----------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------- |
| Nhớ lịch sử hội thoại nhiều lượt                                  | Duy trì lịch sử hội thoại, ghép vào ngữ cảnh mỗi lần request | **Hệ thống memory**           |
| Thực thi code, chạy lệnh                                          | Cung cấp môi trường Bash + thực thi code                     | **Môi trường thực thi chung** |
| Lấy thông tin thời gian thực (version thư viện mới, thay đổi API) | Web Search, MCP tools                                        | **Lấy kiến thức bên ngoài**   |
| Thao tác trên file và môi trường                                  | File system abstraction + Git version control                | **File system**               |
| Biết mình làm đúng hay chưa                                       | Môi trường sandbox + testing tools + browser automation      | **Vòng lặp xác minh**         |
| Duy trì sự nhất quán trong tác vụ dài                             | Nén ngữ cảnh, memory file, theo dõi tiến trình               | **Quản lý ngữ cảnh**          |

Bổ sung từng cái một những thứ "model không làm được nhưng bạn muốn Agent làm được" sẽ cho ra các thành phần cốt lõi của Harness. LangChain chia việc này thành năm subsystem: file system (persistence), Bash execution (universal tool), sandbox environment (security isolation), memory mechanism (tích lũy cross-session), context compression (chống suy giảm).

## Nâng cao về Harness

### ⭐️ Một Harness trưởng thành trông như thế nào?

Cách hiểu về thành phần ở trên theo hướng "thiếu gì bổ sung nấy". Nhưng nhìn từ góc độ thiết kế hệ thống, một Harness trưởng thành thực ra có cấu trúc phân lớp rõ ràng.

Tôi đã xem một chia sẻ về framework sáu lớp trên YouTube, cảm thấy framework này mô tả khá đầy đủ toàn cảnh Harness:

![Kiến trúc sáu lớp Harness Engineering](https://oss.javaguide.cn/github/javaguide/ai/harness/harness-engineering-six-layer-architecture.svg)

| Lớp    | Tên                                      | Giải quyết vấn đề gì                                     | Thiết kế chính                                                                                            |
| ------ | ---------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **L1** | **Lớp ranh giới thông tin**              | Agent nên biết gì, không nên biết gì                     | Định nghĩa vai trò và mục tiêu, loại bỏ thông tin không liên quan, tổ chức có cấu trúc trạng thái tác vụ  |
| **L2** | **Lớp hệ thống công cụ**                 | Agent tương tác với thế giới bên ngoài thế nào           | Lựa chọn công cụ, thời điểm gọi, tinh lọc và phản hồi kết quả                                             |
| **L3** | **Lớp điều phối thực thi**               | Tác vụ nhiều bước được nối lại thế nào                   | Giúp model đi trọn vẹn "hiểu mục tiêu → đánh giá thông tin → phân tích → tạo → kiểm tra" như con người    |
| **L4** | **Lớp memory và state**                  | Kết quả trung gian trong tác vụ dài được quản lý thế nào | Quản lý độc lập trạng thái tác vụ hiện tại, sản phẩm trung gian và memory dài hạn, ngăn hệ thống hỗn loạn |
| **L5** | **Lớp đánh giá và quan sát**             | Agent biết mình làm đúng chưa thế nào                    | Xây dựng cơ chế xác minh độc lập với quá trình sinh, giúp Agent có "tự nhận thức"                         |
| **L6** | **Lớp ràng buộc, xác thực và khôi phục** | Sai rồi thì làm sao                                      | Quy tắc đặt sẵn chặn lỗi, khi thất bại (API timeout, format hỗn loạn) cung cấp cơ chế retry hoặc rollback |

Có thể ví như xây dựng môi trường làm việc hoàn chỉnh cho một nhân viên mới. L1 là bản mô tả công việc (nói cho họ biết cần tập trung vào gì), L2 là công cụ văn phòng (cho họ dùng gì để làm việc), L3 là quy trình thao tác chuẩn (làm việc theo bước nào), L4 là hệ thống quản lý dự án và sổ tay (ghi nhớ những gì đã làm thế nào), L5 là quy trình kiểm tra chất lượng (làm thế nào để kiểm tra đúng chưa), L6 là quy tắc đỏ và kế hoạch khẩn cấp (việc gì tuyệt đối không được làm, xảy ra sự cố thì xử lý thế nào).

Giá trị lớn nhất của kiến trúc sáu lớp này là — không phải chỉ đơn giản là tích hợp chức năng, mà là vòng khép kín hoàn chỉnh từ "định nghĩa ranh giới" đến "dự phòng khôi phục". Thực hành của các đội nhóm hàng đầu trong phần phụ lục cũng xác nhận điều này: cách làm của họ đều có thể ánh xạ vào sáu lớp này.

⚠️ **Lưu ý**: Đừng cố gắng xây đủ sáu lớp ngay từ đầu. Bắt đầu từ L1 (ranh giới thông tin) và L6 (ràng buộc và khôi phục), hai lớp này có tỷ lệ đầu tư/sản lượng cao nhất. L1 quyết định Agent biết làm gì, L6 quyết định khi hỏng thì có kéo lại được không. Các lớp ở giữa dần bổ sung theo khi độ phức tạp dự án tăng lên.

### Tại sao nút thắt không phải model mà là Harness?

Thành thật mà nói, lần đầu tiên nhìn thấy kết luận này tôi cũng thấy phản trực giác — không phải chờ model mạnh hơn ra là xong sao? Nhưng dữ liệu thực sự không ủng hộ ý nghĩ đó. Dữ liệu thí nghiệm của OpenAI, Anthropic, Stripe, LangChain, Can.ac đều chỉ về cùng một kết luận: **Cơ sở hạ tầng mới là nút thắt, không phải mức độ thông minh.**

🐛 **Lầm tưởng thường gặp**: Nhiều đội nhóm khi Agent hoạt động không tốt, phản ứng đầu tiên là "đổi model mạnh hơn" hoặc "điều chỉnh prompt". Nhưng thí nghiệm của Can.ac chứng minh, cùng model chỉ đổi format gọi tool, hiệu quả có thể chênh nhau mười lần. **Nút thắt rất có khả năng không phải ở mức độ thông minh của model, mà ở chất lượng cơ sở hạ tầng Harness.**

Phía LangChain cũng xác nhận kết luận này: họ tối ưu hóa môi trường chạy Agent (cách tổ chức tài liệu, vòng lặp xác minh, hệ thống tracking), từ xếp hạng 30 toàn cầu lên thứ 5 trên Terminal Bench 2.0, điểm số từ 52.8% lên 66.5%. Model không đổi, Harness đổi.

> **📌 Một phát hiện đáng chú ý**:
>
> LangChain cũng chỉ ra một vấn đề model-harness coupling — các sản phẩm Agent hiện tại (như Claude Code, Codex) được huấn luyện cùng model và Harness, điều này dẫn đến một dạng overfitting: **sau khi đổi logic tool thì hiệu suất model sẽ giảm**.
>
> Họ quan sát trên bảng xếp hạng Terminal Bench 2.0, điểm số của Opus dưới Harness của Claude Code thấp hơn nhiều so với trong các Harness khác. Kết luận là: "the best harness for your task is not necessarily the one a model was post-trained with" — khi chọn Harness cho tác vụ của bạn, đừng bị ràng buộc bởi Harness mặc định của model.

### ⭐️ Tại sao càng đưa nhiều ngữ cảnh vào, Agent lại càng ngốc đi?

Dex Horthy quan sát được một hiện tượng: cửa sổ ngữ cảnh 168K token, dùng đến khoảng 40% thì chất lượng đầu ra của Agent bắt đầu giảm rõ rệt.

![Hiện tượng ngưỡng 40% khi sử dụng ngữ cảnh](https://oss.javaguide.cn/github/javaguide/ai/harness/context-utilization-40-percent-threshold-phenomenon.svg)

| Vùng           | Tỷ lệ     | Biểu hiện                                                        |
| -------------- | --------- | ---------------------------------------------------------------- |
| **Smart Zone** | 0 - ~40%  | Suy luận tập trung, gọi tool chính xác, chất lượng code cao      |
| **Dumb Zone**  | Trên ~40% | Ảo giác tăng, đi vòng vòng, format lộn xộn, code chất lượng thấp |

Anthropic trong thực hành của mình cũng gặp vấn đề tương tự, họ gọi là "context anxiety" (lo lắng ngữ cảnh): Sonnet 4.5 khi ngữ cảnh sắp đầy sẽ trở nên do dự, có xu hướng kết thúc sớm — dù tác vụ chưa xong. Chỉ nén thôi không đủ, cách làm cuối cùng của họ là xóa trắng cửa sổ ngữ cảnh, nhưng giữ lại trạng thái quan trọng thông qua tài liệu bàn giao có cấu trúc (xem chiến lược context resets của Anthropic trong phụ lục).

Mục tiêu của bạn không phải nhồi nhiều thông tin hơn vào Agent, mà là đảm bảo nó luôn chạy trong ngữ cảnh sạch, liên quan. Thực hành của các đội nhóm hàng đầu đều xoay quanh "tiết lộ dần" và "quản lý phân lớp", lý do đằng sau chính là ngưỡng 40% này.

> ⚠️ **Góc nhìn kỹ thuật**: Trong môi trường production, theo dõi tỷ lệ sử dụng ngữ cảnh là ưu tiên hàng đầu. Khuyến nghị đặt cảnh báo ngưỡng 40% — khi mức sử dụng ngữ cảnh của Agent vượt tỷ lệ này, nên kích hoạt nén ngữ cảnh hoặc bàn giao tác vụ. Đợi đến khi Agent đã trở nên ngốc rồi mới xử lý là quá muộn.

### ⭐️ Nếu bạn bắt đầu xây Harness, nên bắt đầu từ đâu?

Tổng hợp kinh nghiệm thực hành của các đội nhóm hàng đầu (xem phụ lục), đây là lộ trình hành động theo thứ tự ưu tiên. Bạn không cần phải làm tất cả ngay từ đầu, chỉ cần làm xong P0 là hiệu quả sẽ rõ rệt.

#### P0: Không cần do dự, có thể làm ngay

| Hành động                                | Tại sao                                                                   | Tham khảo thực hành                                          |
| ---------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Tạo `AGENTS.md` và duy trì liên tục      | Agent tự động tải khi khởi động, phạm lỗi thì cập nhật, tạo vòng phản hồi | Hashimoto mỗi dòng tương ứng một case thất bại trong quá khứ |
| Xây dựng Linter tùy chỉnh + lệnh sửa lỗi | Thông báo lỗi trực tiếp cho Agent biết cách sửa, vừa sửa lỗi vừa "dạy"    | Lỗi Linter của OpenAI kèm cách sửa                           |
| Đưa kiến thức nhóm vào repository        | Kiến thức viết ở Slack/Wiki/Docs thì với Agent như không tồn tại          | OpenAI lấy repository làm nguồn sự thật duy nhất             |

> 🐛 **Lầm tưởng thường gặp**: Nhiều đội nhóm viết `AGENTS.md` như "Super System Prompt", nhét hết mọi quy tắc vào một file. Kết quả là cửa sổ ngữ cảnh bị căng phồng, Agent lại càng ngốc hơn. Cách đúng là như OpenAI — `AGENTS.md` chỉ dùng làm mục lục (khoảng 100 dòng), quy tắc chi tiết đặt trong sub-document và tải theo nhu cầu.

#### P1: Sau khi làm xong P0, có thể xem xét những điều này

| Hành động                                  | Tại sao                                                                    | Tham khảo thực hành                                     |
| ------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| Quản lý ngữ cảnh phân lớp                  | Đừng nhét tất cả vào một file, tiết lộ dần                                 | AGENTS.md của OpenAI dùng làm mục lục (khoảng 100 dòng) |
| Xây dựng progress file và feature list     | Theo dõi trạng thái tính năng bằng JSON, Agent ít làm lộn cấu trúc dữ liệu | Hai giai đoạn Init Agent + Coding Agent của Anthropic   |
| Cấp cho Agent khả năng xác minh end-to-end | Browser automation giúp Agent xác minh tính năng như người dùng            | Anthropic dùng Playwright/Puppeteer MCP                 |
| Kiểm soát tỷ lệ sử dụng ngữ cảnh           | Cố gắng không vượt 40%, thực thi incremental                               | Smart Zone / Dumb Zone của Dex Horthy                   |

#### P2: Có nguồn lực thì mới xem xét

| Hành động                      | Tại sao                                                               | Tham khảo thực hành                   |
| ------------------------------ | --------------------------------------------------------------------- | ------------------------------------- |
| Phân công chuyên môn cho Agent | Mỗi Agent mang ít thông tin không liên quan hơn, ở trong Smart Zone   | Agent dedup/optimize/docs của Carlini |
| Định kỳ garbage collection     | Đảm bảo tốc độ dọn dẹp theo kịp tốc độ tạo ra                         | Background cleanup Agent của OpenAI   |
| Tích hợp observability         | Biến "tối ưu hiệu suất" từ nghệ thuật thành công việc có thể đo lường | OpenAI kết nối Chrome DevTools        |

### Harness của bạn đang ở giai đoạn nào?

| Giai đoạn                     | Đặc điểm                                                           | Vai trò kỹ sư                       |
| ----------------------------- | ------------------------------------------------------------------ | ----------------------------------- |
| Level 0: Không có Harness     | Trực tiếp cho Agent prompt, không có ràng buộc có cấu trúc         | Tự viết code + thỉnh thoảng dùng AI |
| Level 1: Ràng buộc cơ bản     | `AGENTS.md` + Linter cơ bản + test thủ công                        | Chủ yếu viết code, AI hỗ trợ        |
| Level 2: Feedback loop        | Tích hợp CI/CD + test tự động + theo dõi tiến trình                | Lập kế hoạch + review là chính      |
| Level 3: Agent chuyên môn hóa | Multi-Agent phân công + ngữ cảnh phân lớp + persistent memory      | Thiết kế môi trường + quản lý       |
| Level 4: Vòng lặp tự trị      | Parallel hóa không cần giám sát + quản lý entropy tự động + tự sửa | Kiến trúc sư + kiểm soát chất lượng |

## Chuẩn bị phỏng vấn

Các câu hỏi phỏng vấn thường gặp liên quan Harness Engineering được tổng hợp dưới đây, tiện để bạn ôn lại nhanh:

**Khái niệm cơ bản**

| Câu hỏi                                                              | Câu trả lời cốt lõi                                                                                                                                                             |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Harness là gì?**                                                   | Mọi thứ ngoài model — system prompt, tool calling, file system, sandbox, logic điều phối, cơ chế ràng buộc. Agent = Model + Harness.                                            |
| **Quan hệ giữa Harness và Prompt Engineering, Context Engineering?** | Quan hệ lồng nhau: Prompt ⊂ Context ⊂ Harness. Ba cái giải quyết ba tầng vấn đề: biểu đạt, thông tin, thực thi.                                                                 |
| **Tại sao nút thắt không phải model mà là Harness?**                 | Thí nghiệm Can.ac chứng minh cùng model chỉ đổi format gọi tool, điểm từ 6.7% nhảy lên 68.3%. Chất lượng cơ sở hạ tầng quyết định khả năng phát huy năng lực thực tế của model. |

**Thiết kế kiến trúc**

| Câu hỏi                                  | Câu trả lời cốt lõi                                                                                                                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kiến trúc sáu lớp của Harness là gì?** | L1 Ranh giới thông tin → L2 Hệ thống công cụ → L3 Điều phối thực thi → L4 Memory và state → L5 Đánh giá và quan sát → L6 Ràng buộc xác thực và khôi phục. Vòng khép kín hoàn chỉnh từ "định nghĩa ranh giới" đến "dự phòng khôi phục". |
| **Kinh nghiệm quản lý ngữ cảnh?**        | Kiểm soát tỷ lệ sử dụng dưới 40%. Vượt qua là chất lượng Agent giảm rõ rệt (ảo giác tăng, đi vòng vòng). Chiến lược là nén hoặc bàn giao, không phải tiếp tục nhồi thông tin.                                                          |
| **Single Agent hay Multi-Agent?**        | Quy mô quyết định. Dự án nhỏ single Agent đủ dùng (mô hình Hashimoto), dự án lớn hầu như cần phân công chuyên môn hóa (Carlini dùng 16 Agent song song).                                                                               |

**Giải pháp thực hành**

| Câu hỏi                                           | Câu trả lời cốt lõi                                                                                                                                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cốt lõi thực hành Harness của OpenAI là gì?**   | Năm phương pháp luận: tài liệu kiểu bản đồ (tiết lộ dần), ràng buộc cơ học (Linter tùy chỉnh), tích hợp observability, quản lý entropy (garbage collection định kỳ), repository là nguồn sự thật. |
| **Anthropic giải quyết context anxiety thế nào?** | Chiến lược Context resets: không nén, mà khởi động một Agent "sạch" hoàn toàn mới, khôi phục state qua tài liệu bàn giao có cấu trúc. Giống restart process để giải quyết memory leak.            |
| **Xây Harness từ đầu thì làm gì trước?**          | P0: Tạo AGENTS.md + Linter tùy chỉnh + kiến thức nhóm vào repository. Tỷ lệ đầu tư/sản lượng cao nhất.                                                                                            |

## Những câu hỏi chưa có câu trả lời

Harness Engineering là lĩnh vực phát triển nhanh, vẫn còn nhiều câu hỏi chưa được giải quyết. Hiểu những "chưa biết" này cũng quan trọng không kém — phỏng vấn có thể cho thấy chiều sâu suy nghĩ của bạn.

| Câu hỏi                                          | Hiện trạng                                                                                   | Ai đang quan tâm                                                                                                                                                                                                                                                                     |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Làm sao cải tạo brownfield project?**          | Tất cả case công khai đều là greenfield project, không có phương pháp luận                   | Böckeler: ví như "chạy static analysis trên codebase chưa bao giờ dùng static analysis". Bà còn đề xuất khái niệm "Ambient Affordances": đặc tính cấu trúc của môi trường bản thân (type system, module boundaries, framework abstraction) quyết định Harness có thể làm tốt đến đâu |
| **Làm sao xác minh Agent làm đúng?**             | Mọi người giỏi "ràng buộc không làm sai", nhưng "xác minh làm đúng" còn chưa được giải quyết | Böckeler phê bình: dùng test do AI tạo ra để xác minh code do AI tạo ra, bản chất là "dùng cùng một đôi mắt kiểm tra bài của chính mình" — "that's not good enough yet"                                                                                                              |
| **Khả năng duy trì lâu dài của code do AI tạo?** | Code LLM thường tái triển khai tính năng đã có, hiệu quả dài hạn chưa rõ                     | Greg Brockman đặt câu hỏi cho đến nay chưa ai trả lời                                                                                                                                                                                                                                |
| **Harness nên dày hay mỏng?**                    | Manus viết lại năm lần càng ngày càng đơn giản vs OpenAI năm tháng càng ngày càng phức tạp   | Kịch bản quyết định: sản phẩm universal theo hướng tối giản, sản phẩm cụ thể có thể tùy chỉnh cao. Và khi model mạnh hơn, Harness đã có nên được đơn giản hóa định kỳ (Anthropic thực nghiệm xác nhận)                                                                               |
| **Single Agent hay Multi-Agent?**                | Hashimoto kiên trì Single Agent vs Carlini dùng 16 Agent song song                           | Quy mô quyết định: dự án nhỏ single Agent đủ dùng, dự án lớn hầu như cần chuyên môn hóa                                                                                                                                                                                              |

Greenfield project và brownfield project là ẩn dụ kinh điển trong kỹ thuật phần mềm:

- Greenfield project (Dự án đồng xanh): Dự án mới từ đầu, không có gánh nặng lịch sử. Như xây nhà trên mảnh đất trống, muốn thiết kế thế nào cũng được.
- Brownfield project (Dự án khu đất cũ): Cải tạo trên codebase hiện có, bị ràng buộc bởi kiến trúc lịch sử, technical debt, logic cũ. Như cải tạo khu phố cũ, đường ống ở khắp nơi không thể tùy tiện động vào.

Các case thành công của OpenAI, Anthropic, Stripe, Hashimoto, tất cả đều là xây Harness từ đầu trên project hoàn toàn mới. Nhưng trong thực tế đại đa số các đội nhóm phải đối mặt với codebase đã chạy nhiều năm — làm thế nào để đưa Harness vào một project mười năm tuổi, không có ràng buộc kiến trúc, đầy technical debt khắp nơi? Hiện tại không có bất kỳ phương pháp luận công khai nào.

## Tổng kết

Một câu tóm tắt những gì Harness Engineering làm: **Thừa nhận model có giới hạn, rồi kỹ thuật hóa từng nhu cầu ngoài giới hạn đó một cách có hệ thống.**

Có một câu tôi rất đồng ý: **Model quyết định trần của hệ thống, Harness quyết định đáy của hệ thống.**

Trong tác vụ đơn giản prompt quan trọng nhất, trong tác vụ phụ thuộc kiến thức bên ngoài ngữ cảnh rất quan trọng, nhưng trong các kịch bản thương mại thực tế với chuỗi dài, có thể thực thi, dung sai lỗi thấp, Harness mới là điều kiện tiên quyết để AI triển khai ổn định.

**Nếu chỉ nhớ một câu: Model quyết định trần, Harness quyết định đáy. Thay vì phân vân chọn model nào, hãy xây Harness tốt trước.**

## Phụ lục: Case study thực chiến từ các đội nhóm hàng đầu

OpenAI, Anthropic, Stripe, Mitchell Hashimoto, Martin Fowler, năm đội nhóm/cá nhân này trong thực hành của mình tiết lộ từ nhiều góc độ khác nhau những vấn đề dễ bị bỏ qua trong thiết kế Harness. Xem cùng nhau sẽ có cảm giác hơn — bạn sẽ thấy những cái bẫy mà mọi người gặp phải và kinh nghiệm rút ra, đáng ngạc nhiên là giống nhau đến mức nào.

### OpenAI: Ba người, năm tháng, một triệu dòng, không viết tay một dòng nào

Đầu tiên xem số liệu:

| Chỉ số                   | Giá trị                         |
| ------------------------ | ------------------------------- |
| Quy mô đội               | 3 kỹ sư (sau mở rộng lên 7)     |
| Thời gian                | 5 tháng (từ tháng 8 năm 2025)   |
| Quy mô code              | Khoảng 1 triệu dòng             |
| Code viết tay            | **0 dòng** (ràng buộc thiết kế) |
| Số PR được merge         | Khoảng 1,500                    |
| PR/người/ngày trung bình | 3.5                             |
| Tăng hiệu suất           | Khoảng 10 lần                   |

Thú vị hơn con số là năm phương pháp luận họ tổng kết được.

#### Cấp cho Agent một bản đồ, không phải một cuốn sổ tay nghìn trang

`AGENTS.md` của OpenAI chỉ có khoảng 100 dòng, vai trò giống như mục lục, trỏ đến các tài liệu thiết kế sâu hơn, sơ đồ kiến trúc, kế hoạch thực thi và đánh giá chất lượng trong thư mục `docs/`. Đây là ứng dụng thực tế của **tiết lộ dần** — đưa thông tin quan trọng nhất vào trước, cần gì thì tải thêm.

Giống như đến một thành phố mới, không cần thuộc lòng cả cuốn hướng dẫn du lịch. Cho bạn một bản đồ đơn giản (quy tắc cốt lõi), rồi nói "muốn biết chi tiết về điểm tham quan này, xem trang X" là đủ.

> **📌 Một hiện thực cụ thể của tiết lộ dần: Agent Skills**. Cơ chế cốt lõi của Agent Skills là "metadata thường trú, nội dung tải theo nhu cầu" — mỗi Skill chỉ giữ tên và mô tả ngắn trong ngữ cảnh (vài chục Token), quy tắc chi tiết và luồng thực thi chỉ được inject động vào ngữ cảnh suy luận khi được kích hoạt. Về bản chất điều này giống như dùng `AGENTS.md` của OpenAI làm mục lục, chỉ là Skills đã chuẩn hóa pattern này hơn. Tham khảo chi tiết: [Giải thích chi tiết Agent Skills: Là gì? Dùng thế nào? Khác Prompt, MCP ở điểm nào?](https://javaguide.cn/ai/agent/skills.html).

#### Ràng buộc kiến trúc không thể viết trong tài liệu, phải được thực thi bằng công cụ

Họ định nghĩa cấu trúc phân lớp cố định cho mỗi business domain:

```
Types → Config → Repo → Service → Runtime → UI
```

Hướng phụ thuộc không thể đảo ngược. Đảm bảo thế nào? Linter tùy chỉnh cộng structural test. Vi phạm thì báo lỗi, thông báo lỗi không chỉ nói chỗ nào sai mà còn trực tiếp nói cách sửa. Agent vừa được sửa lỗi vừa được "dạy" cách làm đúng.

> **📌 Lời gốc của OpenAI**: If it cannot be enforced mechanically, agents will deviate. — Ghi lại ràng buộc trong tài liệu là không đủ; nếu không thể thực thi cơ học, Agent sẽ lệch hướng.

#### Observability cũng là để Agent xem, không chỉ để người xem

Họ kết nối Chrome DevTools Protocol vào Agent runtime, Agent có thể tự bắt DOM snapshot, chụp ảnh màn hình. Log, metrics, link tracing đều được expose cho Agent thông qua local observability stack. Như vậy "giảm thời gian khởi động xuống dưới 800ms" từ một nguyện vọng mơ hồ trở thành mục tiêu mà Agent có thể tự đo và tự xác minh.

#### Entropy không tự biến mất, phải chủ động đối phó

Ban đầu đội nhóm mỗi thứ sáu dùng 20% thời gian dọn dẹp thủ công code chất lượng thấp từ AI tạo ra. Sau đó việc này được tự động hóa — background Agent quét định kỳ, tìm tài liệu không nhất quán, vi phạm kiến trúc và code dư thừa, tự động submit PR dọn dẹp. Tốc độ dọn dẹp theo kịp tốc độ tạo ra, mới có thể chạy bền vững.

#### Kiến thức viết ở Slack, với Agent như không tồn tại

Kiến thức viết trong Slack discussion hoặc Google Docs với Agent như không tồn tại. Tất cả kiến thức nhóm được đặt trong repository dưới dạng artifact version-controlled.

> ⚠️ **Góc nhìn kỹ thuật**: OpenAI tự nói, kết quả này "không nên được giả định là có thể tái tạo khi thiếu đầu tư tương tự". Năm phương pháp luận của họ mỗi cái đòi hỏi đầu tư trước rất lớn, đừng kỳ vọng sao chép trực tiếp. Nhưng **tư duy** trong đó (tài liệu kiểu bản đồ, ràng buộc cơ học, quản lý entropy) có thể được áp dụng ngay ở bất kỳ quy mô nào.

### Anthropic: Từ context anxiety đến kiến trúc ba tác nhân kiểu GAN

Anthropic có hai thực hành đáng xem kỹ hơn trong hướng này, chúng từ các góc độ khác nhau tiết lộ những vấn đề dễ bị bỏ qua trong thiết kế Harness.

![Kiến trúc cộng tác ba tác nhân Anthropic (lấy cảm hứng từ GAN)](https://oss.javaguide.cn/github/javaguide/ai/harness/anthropic-three-agent-collaborative-architecture-inspired-by-gan.svg)

#### Dùng 16 Agent viết compiler C, phát hiện được gì?

Nicholas Carlini trong khoảng hai tuần, chạy 16 instance Claude Opus song song, khoảng 2000 phiên Claude Code, tạo ra một C compiler với tỷ lệ pass GCC torture test là 99%.

| Chỉ số                 | Giá trị                                                         |
| ---------------------- | --------------------------------------------------------------- |
| Thời gian              | Khoảng 2 tuần                                                   |
| Agent song song        | 16 instance Claude Opus                                         |
| Số phiên               | Khoảng 2,000                                                    |
| Sản phẩm               | 100,000 dòng code Rust                                          |
| GCC torture test       | Pass 99%                                                        |
| Dự án có thể biên dịch | PostgreSQL, Redis, FFmpeg, CPython, Linux 6.9 Kernel, v.v. 150+ |
| Chi phí API            | Khoảng 20,000 đô la Mỹ                                          |

Một vài quyết định thiết kế Harness trong project này rất thú vị:

- **Log không in ra console**: Tất cả ghi vào file, dùng format một dòng thân thiện với grep (`ERROR: [reason]`), chủ động kiểm soát ô nhiễm ngữ cảnh.
- **Không chạy toàn bộ test**: Mỗi Agent chỉ chạy 1-10% tập con test ngẫu nhiên, nhưng sub-sampling là deterministic với một Agent (cùng một lần chạy mỗi lần đều chạy cùng tập con), random xuyên VM (các Agent khác nhau chạy tập con khác nhau). Như vậy tập thể bao phủ toàn bộ test, mà Agent đơn không mất nhiều giờ lặp lại trên test.
- **Chuyên môn hóa vai trò Agent**: Khi project trưởng thành, Agent đảm nhận các vai trò chuyên biệt — công việc compiler cốt lõi, dedup (code do LLM tạo thường tái triển khai tính năng đã có), tối ưu hiệu suất, chất lượng code và tài liệu.

Carlini sau đó nói một câu rất đúng: "Tôi phải liên tục nhắc nhở mình, tôi đang viết testing framework này cho Claude, không phải cho mình." — **Mục tiêu thiết kế Harness là để Agent làm việc hiệu quả, không phải cho con người tiện.**

#### Tại sao Anthropic lại vay mượn ý tưởng của GAN?

Anthropic Labs team tháng 3 năm 2026 ra mắt kiến trúc ba tác nhân lấy cảm hứng từ tư duy GAN (Generative Adversarial Network) (bài gốc dùng "Taking inspiration from GANs", là vay mượn tư duy, không phải huấn luyện đối kháng thực sự):

```ebnf
Planner（规划者）→ Generator（执行者）⇄ Evaluator（评估者）
```

- **Planner**: Nhận mô tả sản phẩm 1-4 câu, mở rộng thành đặc tả sản phẩm hoàn chỉnh, được yêu cầu "táo bạo về phạm vi".
- **Generator**: Làm "Sprint" từng tính năng một, mỗi Sprint có tiêu chí hoàn thành rõ ràng.
- **Evaluator**: Dùng Playwright MCP thực sự click vào ứng dụng đang chạy, chấm điểm theo các tiêu chí như độ sâu thiết kế sản phẩm, chức năng, thiết kế trực quan, chất lượng code.

Kiến trúc này giải quyết hai vấn đề cốt lõi:

| Vấn đề                   | Biểu hiện                                                               | Giải pháp                                                 |
| ------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------- |
| **Context anxiety**      | Sonnet 4.5 sắp đến giới hạn ngữ cảnh thì vội kết thúc                   | context resets + bàn giao có cấu trúc (nén thôi không đủ) |
| **Self-evaluation bias** | Agent tự tin hào hứng khen mình làm tốt, chất lượng thực tế bình thường | Giao sinh và đánh giá cho hai Agent độc lập               |

Tiêu chí chấm điểm bản thân cũng có chỗ tinh tế: về thiết kế frontend, **trọng số chất lượng thiết kế và tính nguyên bản được cố tình đặt cao hơn chức năng và chất lượng code** — vì model có xu hướng tạo ra thứ "chức năng đầy đủ nhưng trông tầm thường", điều chỉnh trọng số là hướng nó nỗ lực ở hướng khó hơn.

#### Gặp context anxiety, không phải nén mà là restart

Đề cập trước đó Anthropic phát hiện Sonnet 4.5 xuất hiện "context anxiety" khi ngữ cảnh sắp đầy — trở nên do dự, kết thúc sớm. Chỉ nén ngữ cảnh thôi không đủ, cách làm cuối cùng của họ gọi là **context resets** (reset ngữ cảnh):

1. Khi ngữ cảnh của một Agent sắp đầy, trước tiên trích xuất có cấu trúc trạng thái tác vụ hiện tại, công việc đã hoàn thành, todo
2. Khởi động một **Agent "sạch" hoàn toàn mới**, giao cho nó tài liệu bàn giao có cấu trúc
3. Agent mới tiếp tục làm việc từ trạng thái sạch

Điều này giống như cách giải quyết khi chương trình gặp memory leak — bạn không đi giải phóng từng khối bộ nhớ thủ công (tương ứng với nén ngữ cảnh), mà trực tiếp restart process, khôi phục state từ checkpoint. Mặc dù thô bạo, nhưng trong tình huống tác vụ dài, một Agent restart sạch hoạt động tốt hơn nhiều so với một Agent nhồi đầy thông tin lịch sử.

Tư duy này về bản chất giống với cách làm của Carlini trong project compiler — ông chạy 2000 phiên Claude Code, mỗi phiên đều độc lập, bắt đầu từ trạng thái sạch. Chỉ là Anthropic đã chính thức hóa và cấu trúc hóa quá trình "restart-recover" này.

**So sánh chi phí hai cấu hình:**

| Cấu hình                                        | Thời gian | Chi phí | Kết quả                          |
| ----------------------------------------------- | --------- | ------- | -------------------------------- |
| Solo Harness (single Agent + công cụ tối thiểu) | 20 phút   | $9      | Sản phẩm dở dang không chạy được |
| Full Harness (ba Agent + toolchain đầy đủ)      | 6 giờ     | $200    | Ứng dụng hoàn chỉnh có thể dùng  |

Tác vụ phức tạp hơn chênh lệch còn rõ hơn — dùng Full Harness làm một music production workstation (DAW) trong trình duyệt, chạy gần 4 giờ tốn $124.70, tạo ra một chương trình có thể dùng với sequencer view, mixing board và playback controls.

**Nhưng có một phát hiện quan trọng**: Khi họ chuyển model từ Sonnet 4.5 sang Opus 4.6, cơ chế Sprint có thể loại bỏ hoàn toàn, Evaluator từ kiểm tra mỗi Sprint chuyển thành chỉ kiểm tra một lần ở cuối.

Anthropic tổng kết điều này rất súc tích: **"Every component in a harness encodes an assumption about what the model can't do on its own, and those assumptions are worth stress testing."** (Mỗi thành phần trong Harness mã hóa một giả định về "model không tự làm được gì", và những giả định đó đáng được stress test định kỳ.)

> **📌 Kết luận của Anthropic**: "The space of interesting harness combinations doesn't shrink as models improve. Instead, it moves." — Model càng mạnh, không phải là không cần Harness nữa, mà là không gian thiết kế Harness chuyển sang vị trí mới. Điều này có nghĩa là bạn cần **đơn giản hóa Harness định kỳ** — khi năng lực model tăng, cơ chế bảo vệ trước đây cần thiết có thể đã dư thừa.

### Stripe: Hơn 1300 PR mỗi tuần, hoàn toàn không cần giám sát, họ làm thế nào?

Hệ thống Minions của Stripe đại diện cho một thái cực khác — chế độ không cần giám sát tự động hóa cao. Developer gửi một tin nhắn Slack, Agent từ viết code đến chạy CI đến submit PR đều xử lý xong, người chỉ review ở cuối. Hơn 1300 PR được tạo hoàn toàn bởi Minions, không chứa bất kỳ dòng code nào của người viết, được merge mỗi tuần.

![Kiến trúc điều phối hybrid state machine của Stripe](https://oss.javaguide.cn/github/javaguide/ai/harness/stripe-hybrid-state-machine-orchestration-architecture.svg)

Thành thật mà nói, lần đầu nhìn thấy con số này hơi choáng. Dưới đây là phân tích kiến trúc của họ.

| Thành phần                  | Tác dụng           | Thiết kế chính                                                                                                                                        |
| --------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Devbox**                  | Môi trường dev     | AWS EC2 cài sẵn source code và services, pre-warm pool phân bổ, khởi động khoảng 10 giây, "livestock not pets"                                        |
| **State machine điều phối** | Kiểm soát luồng    | Hybrid deterministic nodes (lint, push) và Agent nodes (triển khai tính năng, sửa CI), chỗ cần xác định thì xác định, chỗ cần linh hoạt thì linh hoạt |
| **Toolshed MCP**            | Dịch vụ tool       | MCP service tập trung, gần 500 công cụ, mỗi Minion nhận tập con được lọc                                                                              |
| **Feedback loop**           | Đảm bảo chất lượng | Pre-push hook sửa lint trong giây; sau push tối đa 2 lượt CI (3 triệu+ test)                                                                          |

Tư duy thiết kế điều phối của Stripe rất thú vị. Không phải giao tất cả mọi việc cho Agent phán đoán, cũng không phải đi hoàn toàn theo luồng xác định, mà là một hybrid state machine — chỗ cần xác định thì xác định (chạy lint, push code), chỗ cần linh hoạt thì linh hoạt (triển khai tính năng, sửa lỗi CI). Giống như một dây chuyền nhà máy, có công đoạn là robot cố định, có công đoạn là thủ công linh hoạt.

> **📌 Lý niệm cốt lõi**: "What's good for humans is good for agents." — Đầu tư cho Devbox, toolchain và developer experience dành cho kỹ sư người cũng trực tiếp mang lại lợi nhuận trên Agent. Agent không cần một bộ cơ sở hạ tầng riêng biệt, mà nên dùng cùng bộ với kỹ sư người, chỉ là phải được thiết kế như first-class citizen ngay từ đầu.

Phía dưới Agent là một fork của project open source [goose](https://github.com/block/goose) của Block, được tùy chỉnh cho kịch bản không cần giám sát.

### Mitchell Hashimoto: Không chạy multi-Agent, Harness engineering của một người

Mitchell Hashimoto (tác giả Vagrant, Terraform, Ghostty terminal emulator) có lộ trình thực hành hoàn toàn ngược với Stripe — ông kiên trì chỉ chạy một Agent mỗi lần, duy trì tham gia sâu. Ông nói rõ "tôi không định chạy nhiều Agent, cũng không muốn".

Lộ trình sáu bước tiến bộ của ông:

| Bước | Tên                              | Cách làm chính                                                                                                           |
| ---- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1    | Bỏ chế độ chat                   | Để Agent làm việc trực tiếp trong môi trường có thể đọc file, chạy chương trình, gửi HTTP request                        |
| 2    | Tái tạo công việc của mình       | Mỗi việc làm hai lần — một lần tự làm, một lần để Agent làm, ông mô tả là "cực kỳ đau khổ"                               |
| 3    | Khởi động Agent trước khi tan sở | 30 phút cuối mỗi ngày giao việc cho Agent: nghiên cứu sâu, khám phá mơ hồ, phân loại Issue                               |
| 4    | Outsource tác vụ xác định        | Chọn tác vụ Agent gần như chắc chắn làm được để chạy background, khuyến nghị tắt thông báo desktop tránh chuyển ngữ cảnh |
| 5    | Kỹ thuật hóa Harness             | Mỗi khi Agent phạm lỗi, kỹ thuật hóa một giải pháp để nó không bao giờ mắc lỗi giống vậy nữa                             |
| 6    | Luôn có Agent đang chạy          | Mục tiêu là 10-20% thời gian làm việc có background Agent chạy                                                           |

**📌 Cách dùng đúng của `AGENTS.md`**: `AGENTS.md` trong project Ghostty, mỗi dòng tương ứng một case thất bại của Agent trong quá khứ. Đây không phải tài liệu tĩnh viết xong bỏ, mà là một hệ thống phòng lỗi tích lũy liên tục — Agent mắc một loại lỗi mới, thêm một dòng quy tắc, sau này sẽ không mắc nữa.

![Vòng phản hồi phòng lỗi Harness tiến hóa liên tục](https://oss.javaguide.cn/github/javaguide/ai/harness/continuously-evolving-harness-error-prevention-feedback-loop.svg)

### Birgitta Böckeler hệ thống hóa Harness

Birgitta Böckeler (Distinguished Engineer tại Thoughtworks) đăng phân tích có cấu trúc về thực hành của OpenAI trên trang Martin Fowler. Góc nhìn của bà khá độc đáo — không tập trung vào cách làm cụ thể, mà tập trung vào những cách làm đó thuộc về mấy loại, còn thiếu gì. Bà phân loại thành phần Harness thành ba loại:

| Loại                          | Điểm tập trung                      | Thực hành điển hình                                                 |
| ----------------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| **Context Engineering**       | Quản lý Agent thấy gì, thấy khi nào | Từ AGENTS.md khổng lồ tiến hóa thành entry file + tài liệu phân lớp |
| **Architectural Constraints** | Đảm bảo Agent không lạc đường       | Linter tùy chỉnh, structural test, LLM Agent đóng vai ràng buộc     |
| **Garbage Collection**        | Đối phó tích lũy entropy            | Định kỳ chạy cleanup Agent quét không nhất quán và vi phạm          |

Böckeler còn đưa ra một vài nhận định khá có tầm nhìn:

1. **Harness sẽ trở thành service template mới** — Hầu hết các tổ chức chỉ có hai ba tech stack chính, tương lai các đội nhóm có thể chọn từ một tập Harness được chế sẵn, giống như hôm nay instantiate service mới từ service template vậy.
2. **Cải tạo brownfield project là thách thức lớn nhất** — Tất cả case thành công công khai đều là greenfield project, đưa Harness Engineering vào codebase mười năm tuổi, không có ràng buộc kiến trúc là vấn đề phức tạp hơn. Böckeler ví nó như "chạy static analysis trên codebase chưa bao giờ dùng static analysis tool — bạn sẽ bị nhấn chìm bởi cảnh báo". Bà còn đề xuất một khái niệm quan trọng "Ambient Affordances": ngôn ngữ có strong type tự nhiên có type checking làm sensor, module boundaries rõ ràng tiện định nghĩa ràng buộc kiến trúc, framework abstraction như Spring trừu tượng hóa nhiều chi tiết — **đặc tính cấu trúc của môi trường bản thân quyết định Harness có thể làm tốt đến đâu**.
3. **Hệ thống xác minh chức năng gần như vắng mặt** — Rất nhiều thảo luận về ràng buộc kiến trúc và quản lý entropy, nhưng xác minh tính đúng đắn chức năng là lĩnh vực bị bỏ qua nghiêm trọng. Böckeler có một quan sát sắc bén hơn: nhiều đội nhóm chỉ để AI tạo test suite rồi xem nó pass xanh hay không, nhưng điều này "puts a lot of faith into AI-generated tests, that's not good enough yet" — dùng test do AI tạo ra để xác minh code do AI tạo ra, bản chất là dùng cùng một đôi mắt kiểm tra bài của chính mình.

**Đọc thêm được khuyến nghị**:

- [OpenAI - Harness Engineering: Leveraging Codex in an Agent-First World](https://openai.com/index/harness-engineering/)
- [Anthropic - Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Mitchell Hashimoto - My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey)
- [Birgitta Böckeler - Harness Engineering (trang Martin Fowler)](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html)
- [Stripe - Minions: Stripe's One-Shot, End-to-End Coding Agents](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- [LangChain - The Anatomy of an Agent Harness](https://blog.langchain.com/the-anatomy-of-an-agent-harness/)
- [Can Bölük (Can.ac) - The Harness Problem](https://blog.can.ac/2026/02/12/the-harness-problem/)
- [Harness Engineering 深度解析：AI Agent 时代的工程范式革命](https://zhuanlan.zhihu.com/p/2014014859164026634)
- [一文看懂 Harness engineering：智能体时代的 AI 编程驾驭之道](https://mp.weixin.qq.com/s/YYurQM9EUuyshuW20YAMJQ)
