---
title: Hướng dẫn thực hành tốt nhất cho OpenAI Codex：Kỹ thuật Prompt, Cấu hình công cụ và Chiến lược bảo mật
description: Tổng hợp từ tài liệu chính thức và kinh nghiệm thực tế, hệ thống hóa kỹ thuật prompt, cấu hình công cụ, cơ chế phân cấp AGENTS.md, mô hình bảo mật và các tính năng nâng cao của API cho OpenAI Codex cloud agent và CLI.
category: Thực chiến lập trình AI
head:
  - - meta
    - name: keywords
      content: OpenAI Codex,Codex CLI,codex-1,提示工程,AGENTS.md,AI编程,AI辅助开发,o3
---

# Hướng dẫn thực hành tốt nhất cho OpenAI Codex

Xin chào mọi người, tôi là Guide. Trước đây chúng ta đã nói về [các mẹo sử dụng Claude Code](./claudecode-tips.md), bài này hãy cùng xem công cụ lập trình chủ lực từ phía OpenAI — **Codex**.

OpenAI đã ra mắt dòng sản phẩm Codex vào năm 2025, bao gồm cloud agent phần mềm engineering dựa trên mô hình o3 (codex-1) và trợ lý coding terminal mã nguồn mở Codex CLI. Khác với tự động hoàn thành code truyền thống, nó có thể tự đọc code, chạy test, tạo PR, hoàn thành vòng khép kín từ hiểu vấn đề đến bàn giao. Nhưng muốn nó thực sự hữu dụng, kỹ thuật prompt, cấu hình công cụ và chiến lược bảo mật đều không thể thiếu.

Bài viết này tổng hợp từ nhiều nguồn như blog chính thức của OpenAI, README của kho mã nguồn mở Codex CLI, hướng dẫn kỹ thuật prompt chính thức, v.v., được sắp xếp thành một hướng dẫn thực hành. Qua bài này bạn sẽ hiểu:

1. ⭐ **Sự khác biệt về định vị giữa Codex cloud agent và CLI**: Phù hợp với những kịch bản nào
2. ⭐ **Nguyên tắc cốt lõi của kỹ thuật prompt**: Ưu tiên hành động, thu thập ngữ cảnh, tiêu chuẩn chất lượng code
3. ⭐ **Cơ chế phân cấp của AGENTS.md**: Cách tổ chức chỉ thị cấp dự án
4. **Ba cấp phê duyệt của mô hình bảo mật**: Ranh giới an toàn từ đề xuất đến hoàn toàn tự động
5. **Các tính năng nâng cao của GPT-5.3 Codex API**: Nén ngữ cảnh, cơ chế Phase, cường độ suy luận

## Một, Tìm hiểu về Codex: Hai dòng sản phẩm và một triết lý cốt lõi

### Codex Cloud Agent (codex-1)

OpenAI đã phát hành codex-1, một cloud agent được fine-tune từ mô hình o3. Nó chạy trong sandbox bảo mật của OpenAI, có thể đọc/ghi code, chạy test và công cụ dòng lệnh, thậm chí trực tiếp submit Pull Request. Ba tính năng cốt lõi:

- **Tự thực thi**: Bạn cung cấp mô tả nhiệm vụ, nó tự thu thập ngữ cảnh, viết code, chạy test, toàn bộ quá trình không cần hướng dẫn thủ công từng bước
- **Sandbox bảo mật**: Mỗi nhiệm vụ chạy trong môi trường container độc lập, không có quyền truy cập mạng, ngăn ảnh hưởng đến môi trường sản xuất
- **Cơ chế chỉ thị AGENTS.md**: Tương tự như `.cursorrules` hay `CLAUDE.md`, bạn có thể đặt file AGENTS.md trong kho lưu trữ để định nghĩa các quy tắc coding và ràng buộc cấp dự án

Codex cloud agent hiện được cung cấp qua các gói ChatGPT Pro, Business và Enterprise, gói Plus cũng dần mở ra từ tháng 6 năm 2025. Nó hỗ trợ hai chế độ làm việc: hội thoại tương tác và nhiệm vụ nền. Ở chế độ nền, bạn có thể giao nhiều nhiệm vụ đồng thời, mỗi nhiệm vụ thực thi song song trong container độc lập.

> Tóm tắt một câu: **Cloud agent phù hợp để "chạy nhiệm vụ lớn ở nền", CLI phù hợp để "ngồi trước máy tính chỉnh code".** Hai cái có định vị khác nhau, nhưng triết lý cốt lõi giống nhau — tự chủ lâu dài, giảm can thiệp thủ công, hướng đến code có thể bàn giao.

### Codex CLI: Trợ lý Coding Terminal Mã nguồn mở

Codex CLI là một công cụ terminal hoàn toàn mã nguồn mở, viết bằng Rust, có thể thực thi sửa đổi code và lệnh shell trên máy cục bộ. Sự khác biệt so với cloud agent chủ yếu nằm ở môi trường chạy và mô hình bảo mật:

| Chiều                  | Codex Cloud Agent            | Codex CLI                        |
| ---------------------- | ---------------------------- | -------------------------------- |
| Môi trường chạy        | Sandbox cloud của OpenAI     | Máy cục bộ                       |
| Truy cập mạng          | Không (môi trường cách ly)   | Tùy thuộc vào quyền cục bộ       |
| Truy cập code          | Tích hợp kho GitHub          | Hệ thống file cục bộ             |
| Mô hình bảo mật        | Quản lý bởi nền tảng         | Ba cấp phê duyệt                 |
| Trạng thái mã nguồn mở | Mã nguồn đóng                | Hoàn toàn mã nguồn mở (Rust)     |
| Gói áp dụng            | Pro/Business/Enterprise/Plus | Plus/Pro/Business/Edu/Enterprise |

> **Mở rộng thêm**: Mô hình mặc định của Codex CLI là `codex-mini-latest` (dựa trên o4-mini), được tối ưu hóa cho các kịch bản hỏi đáp và chỉnh sửa code có độ trễ thấp. Còn cloud agent sử dụng `codex-1` (dựa trên o3), hướng đến các nhiệm vụ engineering phức tạp cần suy luận sâu. Sự khác biệt về định vị giữa hai cái giống như "trợ lý nhẹ" và "kỹ sư cấp cao".

## Hai, Kỹ thuật Prompt: Cốt lõi để Codex hoạt động hiệu quả

Đã hiểu rõ sự khác biệt giữa hai dòng sản phẩm Codex, tiếp theo là phần quan trọng nhất — cách viết prompt tốt. Nội dung phần này áp dụng cho cả cloud agent và CLI.

### ⭐️ Nguyên tắc Ưu tiên Hành động

Đây là nguyên tắc đầu tiên trong thiết kế prompt của Codex — **"Action Bias" (Thiên hướng hành động)**. Prompt tốt nên hướng dẫn mô hình trực tiếp bàn giao code có thể chạy được, chứ không phải kết thúc bằng một đống câu hỏi. Cụ thể:

- Nói rõ với mô hình "bàn giao code có thể chạy được, không chỉ là kế hoạch"
- Mô hình nên mặc định đưa ra giả định hợp lý và tiếp tục tiến lên
- Chỉ hỏi người dùng khi thực sự bị chặn (thiếu thông tin quan trọng hoặc có ràng buộc mâu thuẫn)

**Ví dụ phản diện**: Prompt yêu cầu mô hình "liệt kê kế hoạch trước, đợi xác nhận rồi thực thi". Điều này khiến mô hình dừng lại và chờ đợi trước khi hoàn thành công việc, làm giảm hiệu quả đáng kể.

**Ví dụ chính diện**: Prompt ghi rõ "bắt đầu làm ngay khi nhận nhiệm vụ, giả định hợp lý cho các phần mơ hồ, hiển thị kết quả sau khi hoàn thành. Nếu có vấn đề chặn không thể tự phán đoán, mới hỏi người dùng."

> **Lưu ý kỹ thuật**: Trong prompt chính thức có một đoạn rất quan trọng — "Mỗi lần kết thúc nên là một chỉnh sửa cụ thể hoặc một trở ngại rõ ràng kèm câu hỏi có mục tiêu". Câu này trực tiếp nói với mô hình: đừng kết thúc bằng những câu vô nghĩa như "Hãy để tôi phân tích", phải hoặc đưa ra thay đổi code, hoặc đưa ra lý do bị chặn và câu hỏi cụ thể.

### ⭐️ Chiến lược Thu thập Ngữ cảnh

Trước khi bắt đầu sửa đổi code, Codex nên hiểu kỹ codebase — điều này nghe có vẻ hiển nhiên nhưng thường bị bỏ qua trong thực tế. Prompt nên yêu cầu rõ ràng:

1. **Đọc theo lô**: Trước khi gọi công cụ, hãy nghĩ rõ cần những file nào, rồi đọc song song một lần
2. **Tránh khám phá tuần tự**: Không xem file này rồi đến file kia
3. **Tìm trước khi thêm**: Trước khi thêm implement mới, tìm kiếm xem codebase đã có chức năng tương tự chưa

Chiến lược "lập kế hoạch trước, rồi song song" này có thể giảm đáng kể số lần khứ hồi.

### ⭐️ Tiêu chuẩn Chất lượng Code

Định vị của Codex là "kỹ sư cấp cao có phán đoán". Prompt nên thể hiện các tiêu chuẩn kỹ thuật sau:

- Tính chính xác ưu tiên hơn tốc độ, tránh các shortcut liều lĩnh, thay đổi đầu cơ và vá víu
- Tuân theo các quy ước hiện có của codebase, giải thích lý do khi depart
- Không thêm try/catch rộng, lỗi phải được propagate rõ ràng
- Duy trì type safety, tránh ép kiểu cưỡng bức
- Tìm kiếm implement hiện có trước khi quyết định có thêm mới không

Đối với nhiệm vụ frontend, còn phải đặc biệt lưu ý: tránh thiết kế template hàng loạt, theo đuổi biểu đạt visual có bản sắc.

> **Hiểu lầm thường gặp**: Nhiều người viết trong prompt "code phải viết nhanh, viết ngắn gọn". Nhưng cách diễn đạt được đề xuất chính thức lại ngược lại — ưu tiên tính chính xác, rõ ràng và đáng tin cậy, không phải tốc độ. Sử dụng Codex như "developer junior đang vội vàng" thực ra cho kết quả không tốt.

### Xử lý Git Working Directory Bẩn

Chi tiết này nhiều người không nghĩ đến, nhưng đặc biệt quan trọng trong các kịch bản cộng tác nhiều người hoặc nhiệm vụ song song — working directory có thể chứa các thay đổi chưa commit của người khác. Prompt cần quy định rõ:

- Không bao giờ revert các thay đổi không phải do mình làm
- Khi commit hoặc chỉnh sửa, bỏ qua các thay đổi không liên quan đến mình
- Dừng lại và hỏi người dùng ngay khi phát hiện thay đổi không mong muốn
- Cấm sử dụng các lệnh phá hủy như `git reset --hard`

## Ba, Cấu hình Công cụ: Khâu Quan trọng Ảnh hưởng đến Hiệu suất

Kỹ thuật prompt đã xong, tiếp theo là cấu hình công cụ. Phần này thiên về thực hành; nếu team bạn dùng trực tiếp Codex CLI hoặc cloud agent, nhiều cấu hình đã được tích hợp sẵn; nhưng nếu tích hợp Codex qua API, các chi tiết này sẽ ảnh hưởng trực tiếp đến hiệu quả.

### ⭐️ apply_patch: Công cụ Chỉnh sửa Quan trọng nhất

`apply_patch` là công cụ cốt lõi để Codex sửa đổi code, OpenAI chính thức khuyến nghị mạnh mẽ sử dụng implement chuẩn vì mô hình được train trên định dạng diff này. Có hai cách tích hợp:

- **Tích hợp sẵn trong Responses API**: Trực tiếp thêm `{"type": "apply_patch"}` vào danh sách công cụ, cách đơn giản nhất
- **Công cụ dạng tự do**: Dùng cú pháp Lark để định nghĩa context-free grammar, phù hợp cho các kịch bản cần tùy chỉnh hành vi

Cả hai cách đều xuất cùng định dạng diff, mô hình đều có thể sử dụng đúng. Chính thức khuyến nghị ưu tiên dùng cách tích hợp sẵn trong Responses API vì nó dùng ngay được và hoàn toàn nhất quán với định dạng lúc train mô hình; chỉ khi cần logic parsing tùy chỉnh hoặc mở rộng hành vi mới xem xét công cụ dạng tự do.

### shell_command: Chuỗi String Tốt hơn Mảng

Một chi tiết dễ bỏ qua: truyền lệnh dưới dạng một chuỗi string đơn (không phải mảng string) cho kết quả tốt hơn. Đồng thời, mô tả công cụ nên yêu cầu "luôn điền thư mục làm việc, tránh dùng `cd` trong lệnh", điều này giảm nhầm lẫn về đường dẫn.

### Gọi Công cụ Song song

Codex hỗ trợ gọi công cụ song song. Bằng cách đặt `parallel_tool_calls: true`, có thể cho mô hình đồng thời khởi tạo nhiều lệnh gọi công cụ, nhanh hơn đáng kể so với gọi tuần tự. Prompt nên yêu cầu rõ ràng:

- Những gì có thể song song tuyệt đối không làm tuần tự
- Workflow nên là: lập kế hoạch tài nguyên cần đọc → phát ra song song theo lô → phân tích kết quả → nếu có yêu cầu chưa biết mới lặp lại

### Chiến lược Cắt ngắn Phản hồi Công cụ

Khi nội dung công cụ trả về quá dài, nên cắt ngắn xuống khoảng 10k Token (ước tính bằng số byte dùng được chia cho 4). Cách cắt: nửa đầu giữ phần đầu, nửa sau giữ phần cuối, ở giữa kết nối bằng nhãn bỏ qua định dạng `…N tokens truncated…` (trong đó N là số Token đã cắt). Như vậy vừa giữ ngữ cảnh quan trọng vừa không lãng phí ngân sách Token.

> **Lưu ý kỹ thuật**: Tại sao giữ cả đầu lẫn đuôi? Vì phần đầu output công cụ thường là tóm tắt hoặc thông tin trạng thái, phần cuối thường là thông báo lỗi hoặc kết quả cuối cùng — hai phần này có giá trị nhất cho quyết định của mô hình. Nội dung lặp lại ở giữa khi cắt ảnh hưởng ít nhất.

## Bốn, AGENTS.md: Cơ chế Phân cấp cho Chỉ thị Cấp Dự án

Kỹ thuật prompt đã xong, tiếp theo là một mục cấu hình tần suất cao khác — AGENTS.md. Tác dụng của nó tương tự CLAUDE.md của Claude Code, đều là inject ngữ cảnh và quy chuẩn cấp dự án cho AI.

### ⭐️ Quy tắc Tải

Codex CLI sẽ tự động quét và inject các file `AGENTS.md` (cũng hỗ trợ tên file thay thế như `.codex`), logic tải tuân theo nguyên tắc phân cấp ghi đè:

1. Bắt đầu từ thư mục home của user `~/.codex`, quét từng cấp dọc theo root kho đến thư mục làm việc hiện tại
2. Chỉ thị của mỗi thư mục trở thành một user message độc lập
3. Chỉ thị của thư mục con ghi đè cấu hình cùng tên của thư mục cha
4. Các message được inject vào lịch sử hội thoại theo thứ tự từ root đến leaf

Điều này có nghĩa là bạn có thể thực hiện cấu hình phân cấp:

| Cấp      | Đường dẫn                     | Phạm vi áp dụng                                                                         |
| -------- | ----------------------------- | --------------------------------------------------------------------------------------- |
| Toàn cục | `~/.codex/AGENTS.md`          | Hành vi mặc định chung cho tất cả dự án (như ưu tiên ngôn ngữ, phong cách coding chung) |
| Dự án    | `AGENTS.md` ở root kho        | Quy ước cấp dự án (như lệnh build, quy chuẩn test, quản lý dependency)                  |
| Module   | `AGENTS.md` trong thư mục con | Quy tắc đặc biệt cấp module (như quy ước API cụ thể của một microservice)               |

### Ví dụ Thực tế: AGENTS.md của Chính OpenAI

OpenAI đã đặt một AGENTS.md thực tế trong kho mã nguồn mở Codex CLI, nội dung bao gồm:

- Quy ước phong cách code Rust (dùng `#[allow(clippy::xxx)]` thay vì tắt toàn cục cảnh báo clippy)
- Quy tắc style cho TUI interface (dùng framework `ratatui`)
- Chiến lược test (ưu tiên integration test, unit test bổ trợ)
- Quy chuẩn phát triển API (định dạng JSON request/response, xử lý lỗi)

File này chính là tài liệu tham khảo thực hành tốt nhất cho AGENTS.md.

## Năm, Mô hình Bảo mật: Từ Đề xuất đến Hoàn toàn Tự động

Không thể bỏ qua vấn đề bảo mật. Cơ chế bảo mật của Codex CLI và cloud agent có sự khác biệt lớn, nên nói riêng từng cái.

### ⭐️ Ba Cấp Phê duyệt của Codex CLI

Codex CLI cung cấp ba chế độ bảo mật, tương ứng với các nhu cầu tự động hóa ở các mức độ khác nhau:

| Chế độ        | Mô tả                                                           | Kịch bản áp dụng          |
| ------------- | --------------------------------------------------------------- | ------------------------- |
| **Suggest**   | Có thể đọc file, nhưng tất cả thao tác ghi và lệnh cần xác nhận | Review code, học tập      |
| **Auto Edit** | Tự động chỉnh sửa file, nhưng thao tác dòng lệnh cần xác nhận   | Phát triển hàng ngày      |
| **Full Auto** | Hoàn toàn tự động, cả chỉnh sửa lẫn lệnh đều tự thực thi        | CI/CD, nhiệm vụ hàng loạt |

Ở chế độ Full Auto, Codex CLI còn cung cấp cơ chế sandbox để hạn chế rủi ro tiềm năng:

- **macOS**: Sử dụng Apple Seatbelt (`sandbox-exec`) đặt filesystem thành whitelist chỉ đọc, và hoàn toàn chặn mạng outbound
- **Linux**: Mặc định không có sandbox, chính thức khuyến nghị dùng container Docker để cách ly, kết hợp script firewall `iptables`/`ipset` chặn tất cả lưu lượng outbound trừ OpenAI API

> **Mở rộng thêm**: Ở chế độ Full Auto, Codex CLI còn bật lên cảnh báo xác nhận trong kho không phải Git, nhắc nhở bạn không có lưới an toàn của version control. Chi tiết thiết kế này khá chu đáo — ở chế độ hoàn toàn tự động, "khả năng rollback" của kho Git là phòng tuyến cuối cùng.

### Cơ chế Bảo mật của Codex Cloud Agent

Thiết kế bảo mật của cloud agent nghiêm ngặt hơn:

- Mỗi nhiệm vụ chạy trong container độc lập, hoàn toàn không có quyền truy cập mạng
- Thời gian chạy và mức tiêu thụ tài nguyên có giới hạn rõ ràng

## Sáu, Các Tính năng Nâng cao của GPT-5.3 Codex API

> Nội dung phần này áp dụng cho các developer gọi trực tiếp mô hình `gpt-5.3-codex` qua Responses API. Codex CLI và cloud agent đã đóng gói các cơ chế này bên trong, người dùng không cần cấu hình thủ công.

### Nén Ngữ cảnh

Thông qua endpoint `/compact` của Responses API, Codex có thể nén lịch sử hội thoại, cho phép hội thoại tiếp tục nhiều vòng mà không chạm giới hạn context window. Hiệu quả thực tế:

- Nhiệm vụ dài hạn không bị gián đoạn do tràn ngữ cảnh
- Chuỗi nhiệm vụ siêu dài không còn bị giới hạn bởi độ dài window điển hình
- Mức tiêu thụ Token có thể kiểm soát hơn so với tích lũy từng vòng

> **Lưu ý kỹ thuật**: Endpoint `/compact` tương thích ZDR (Zero Data Retention), trả về một mục `encrypted_content`. Các request tiếp theo chỉ cần truyền trực tiếp mục nén này, không cần xử lý tóm tắt ngữ cảnh thủ công. Điểm này không được nhấn mạnh đặc biệt trong tài liệu chính thức, nhưng phải lưu ý khi tích hợp.

### ⭐️ Cơ chế Phase

Đây là chỗ dễ vấp phải. GPT-5.3-Codex giới thiệu trường `phase` để phân biệt các giai đoạn khác nhau của output mô hình:

- `null`: Output thông thường
- `commentary`: Cập nhật tiến độ cho người dùng trong khi làm việc
- `final_answer`: Bàn giao hoàn chỉnh cuối cùng

**Lưu ý quan trọng**: phase là **bắt buộc** (required) đối với gpt-5.3-codex, không phải tính năng tùy chọn. Nếu không giữ đúng metadata phase trong các message lịch sử, sẽ gây ra suy giảm hiệu suất đáng kể. Ngoài ra, trường phase chỉ có thể được gắn vào assistant message, không thêm vào user message, nếu không sẽ gây ra hành vi bất thường của mô hình.

### Kiểm soát Nhịp độ của Preamble (Cập nhật Tiến độ)

Preamble là cơ chế mô hình báo cáo tiến độ cho người dùng trong quá trình thực thi. Chính thức đưa ra khuyến nghị nhịp độ rõ ràng:

- **Tần suất mục tiêu**: Gửi một cập nhật tiến độ mỗi 1-3 bước thực thi
- **Giới hạn cứng dưới**: Ít nhất mỗi 6 bước hoặc mỗi 10 lần gọi công cụ phải gửi một lần
- Nếu mô hình liên tục thực hiện nhiều thao tác mà không có bất kỳ output tiến độ nào, người dùng sẽ mất cảm nhận về trạng thái nhiệm vụ

Điều này có nghĩa là trong kỹ thuật prompt, nên yêu cầu rõ ràng mô hình duy trì nhịp độ báo cáo tiến độ hợp lý, tránh quá dày (trở thành log-style update) hoặc quá thưa (khiến người dùng mất ngữ cảnh).

### Hai Kiểu Cá tính Cộng tác

Codex hỗ trợ chuyển đổi giữa hai phong cách cá tính "thân thiện" và "thực dụng":

| Phong cách            | Đặc điểm                                                                             | Kịch bản áp dụng                                                 |
| --------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| **Chế độ thân thiện** | Giống người bạn pair programming nhiệt tình hơn, xác nhận nhiều, giải thích chi tiết | Hướng dẫn người mới, khám phá yêu cầu mơ hồ, thay đổi rủi ro cao |
| **Chế độ thực dụng**  | Ngắn gọn trực tiếp, mật độ thông tin mỗi Token cao hơn                               | Nhạy cảm về độ trễ, người dùng đã quen workflow                  |

Cấu hình cá tính được viết trong system prompt, hướng dẫn phong cách diễn đạt, độ sâu giải thích và mức độ nhiệt tình của mô hình qua mô tả.

### Lựa chọn Cường độ Suy luận

Codex hỗ trợ nhiều cấp cường độ suy luận:

| Cường độ   | Mô tả                                                                       | Kịch bản áp dụng                            |
| ---------- | --------------------------------------------------------------------------- | ------------------------------------------- |
| **medium** | Khuyến nghị cho coding tương tác hàng ngày, cân bằng giữa trí tuệ và tốc độ | Phần lớn phát triển hàng ngày               |
| **high**   | Quyết định kiến trúc và tái cấu trúc phức tạp hơn                           | Tái cấu trúc cross-module, yêu cầu phức tạp |
| **xhigh**  | Các kịch bản thực sự khó như điều phối đa hệ thống, debug lỗi phức tạp      | Điều chỉnh đa service, bug khó              |

Lựa chọn cường độ suy luận phù hợp có thể ảnh hưởng trực tiếp đến chi phí và tốc độ phản hồi. Lời khuyên của tôi là: **chạy medium trước, khi gặp tình huống rõ ràng thiếu suy luận mới nâng cấp**, đừng dùng xhigh ngay từ đầu.

## Bảy, Vấn đề Thường Gặp và Kỹ thuật Debug

Trong sử dụng thực tế, có một số vấn đề tần suất cao đáng nói riêng.

### ⭐️ Ba Mẫu Thất bại Thường Gặp

OpenAI chính thức đã theo dõi ba vấn đề tần suất cao, mỗi cái có giải pháp tương ứng:

**1. Suy nghĩ quá nhiều**

Mô hình mất quá nhiều thời gian trước khi thực hiện hành động hữu ích đầu tiên. Giải pháp là yêu cầu rõ ràng trong prompt "bắt đầu hành động ngay lập tức".

**2. Cập nhật kiểu log**

Mô hình báo cáo trạng thái một cách máy móc thay vì cộng tác tự nhiên. Giải pháp là yêu cầu trong prompt "chỉ báo cáo tiến độ tại các điểm mấu chốt, tránh log trạng thái kiểu máy móc".

**3. Thói quen lặp đi lặp lại**

Lặp đi lặp lại các từ đệm như "Phát hiện hay đó", "Đã hiểu rồi". Giải pháp là cấm thẳng những biểu đạt này trong prompt.

> **Lưu ý kỹ thuật**: Chính thức đưa ra một kỹ thuật debug rất thực tế — "meta-prompt". Cách làm là thêm feedback vào cuối reply của mô hình, yêu cầu nó xem xét lại chỉ thị của mình và đề xuất cải tiến. Sau khi tạo vài reply, lấy các đề xuất chung, bạn sẽ có được phương án tối ưu hóa chỉ thị có mục tiêu. Về bản chất là để mô hình giúp bạn viết prompt.

### Tinh chỉnh Công cụ Tùy chỉnh

Đối với các công cụ phi tiêu chuẩn như Web search, semantic search, MCP, mô hình không có post-training chuyên biệt, hiệu quả sẽ bị giảm. Nhưng có thể bù đắp bằng các cách sau:

- Đặt tên công cụ chính xác (`semantic_search` tốt hơn `search`)
- Giải thích rõ trong prompt khi nào, tại sao, và cách sử dụng từng công cụ, kèm ví dụ chính và phản diện
- Làm cho định dạng output của công cụ tùy chỉnh khác biệt so với output của các công cụ mô hình đã quen, tránh nhầm lẫn

> **Hiểu lầm thường gặp**: Nhiều người nghĩ công cụ tùy chỉnh chỉ cần định nghĩa tốt tham số là xong. Thực ra, **định dạng output của công cụ cũng quan trọng không kém** — nếu output của công cụ tùy chỉnh trông y hệt ripgrep, mô hình có thể dùng nhầm công cụ vì nó không phân biệt được kết quả của hai cái. Làm cho output của các công cụ khác nhau có sự phân biệt rõ ràng về mặt visual có thể giảm hiệu quả sự nhầm lẫn.

## Tám, Khuyến nghị Triển khai cho Team

Cuối cùng, chia sẻ một số kinh nghiệm triển khai ở cấp team.

### Giới thiệu Dần dần

Khuyến nghị team giới thiệu Codex theo các giai đoạn sau, đừng dùng Full Auto ngay từ đầu:

1. **Thử nghiệm chế độ Suggest**: Để developers quen với khả năng hiểu code và chất lượng đề xuất của Codex
2. **Sử dụng hàng ngày với chế độ Auto Edit**: Dần dần tăng mức độ tin tưởng trong môi trường có kiểm soát
3. **Full Auto + chế độ Sandbox**: Bật hoàn toàn tự động trong pipeline CI/CD hoặc nhiệm vụ hàng loạt

### Cộng tác Team với AGENTS.md

Khi xây dựng AGENTS.md cho dự án team, nên bao gồm các nội dung sau:

- Lệnh build và test dự án
- Phong cách code và quy ước đặt tên
- Chiến lược quản lý dependency
- Quy chuẩn Git workflow
- Các bẫy thường gặp và lưu ý

### Kiểm soát Chi phí

- Lựa chọn hợp lý cường độ suy luận (medium có thể xử lý phần lớn tình huống hàng ngày)
- Sử dụng nén ngữ cảnh để giảm tiêu thụ Token
- Khi có nhiệm vụ song song, chú ý theo dõi tổng mức sử dụng tài nguyên

> Tóm tắt một câu: **Trước tiên dùng chế độ Suggest để xây dựng tin tưởng, rồi dùng Auto Edit để tăng hiệu suất, cuối cùng mới xem xét Full Auto.** Trước khi triển khai AGENTS.md rộng rãi trong team, tốt nhất nên để một hai người thử chạy một tuần, điều chỉnh các quy tắc cho trơn tru rồi mới phổ biến cho toàn team.

---

**Nguồn tham khảo**:

- Blog chính thức OpenAI: [Introducing Codex](https://openai.com/index/introducing-codex/)
- Kho mã nguồn mở OpenAI Codex CLI: [github.com/openai/codex](https://github.com/openai/codex)
- Hướng dẫn kỹ thuật prompt chính thức OpenAI (tham khảo bản dịch tiếng Trung): [liduos.com/posts/codex-prompting-guide](https://liduos.com/posts/codex-prompting-guide)
- Cấu hình AGENTS.md thực tế từ kho Codex của OpenAI
