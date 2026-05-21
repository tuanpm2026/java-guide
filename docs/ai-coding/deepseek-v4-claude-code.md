---
title: DeepSeek V4 + Claude Code thực chiến: Đánh giá chuyên sâu năng lực code
description: Trải nghiệm sâu tích hợp DeepSeek V4 với Claude Code, thực nghiệm nhiều tình huống kiểm toán code, migration database, nâng cấp mô hình, đánh giá năng lực code thực tế của V4-Pro và V4-Flash.
category: Thực chiến lập trình AI
head:
  - - meta
    - name: keywords
      content: DeepSeek V4,Claude Code,AI编程,代码审计,Agent Coding,V4-Pro,V4-Flash
---

<!-- @include: @article-header.snippet.md -->

Vài ngày qua giới AI gần như bị một sự kiện chiếm sóng — DeepSeek V4 ra mắt, đồng thời mã nguồn mở. Từ dữ liệu benchmark trong báo cáo kỹ thuật đến phản hồi thực nghiệm của cộng đồng, mọi nơi đều đang thảo luận.

Mô hình mã nguồn mở trong hội thoại và viết lách đã làm khá trưởng thành, các nhà tranh nhau, tốc độ lặp thấy rõ bằng mắt thường. Nhưng Agent Coding là chuyện khác.

Để mô hình tự chủ phân tích cấu trúc dự án, hiểu dependency đa file, đưa ra giải pháp kỹ thuật có thể triển khai trực tiếp — loại việc này không có đường tắt, hoàn toàn dựa vào thực lực.

Trước đây các mô hình các nhà đều đang tiến bộ ở hướng này, nhưng dùng thực tế thì biết, vẫn còn khoảng cách đến "yên tâm giao cho nó hoàn thành độc lập".

Vì vậy lần phát hành V4 này, phản ứng đầu tiên của Guide là trực tiếp kết nối vào Claude Code để bắt tay làm việc.

Bài viết này gần **7000 chữ**, khuyến nghị lưu lại, qua bài viết này bạn sẽ hiểu:

1. **Hai cách kết nối DeepSeek V4 vào Claude Code**: Phương pháp file cấu hình + CC Switch chuyển đổi trực quan
2. **Ghi chép thực chiến 5 nhiệm vụ phát triển thực tế**: V4-Pro làm việc thực sự thế nào
3. **Tham số cốt lõi và định giá của DeepSeek V4-Pro và Flash**: Có đáng chuyển không
4. **Gợi ý theo tình huống**: Khi nào nên dùng, khi nào nên chờ thêm

## Kết nối DeepSeek V4 vào Claude Code

Claude Code mạnh ở toolchain và khả năng thực thi, nhưng mô hình chính thức Claude quá đắt, cộng thêm Claude bây giờ dễ bị khóa tài khoản. Lần này DeepSeek V4 cung cấp **interface tương thích Anthropic**, điều này có nghĩa là Claude Code có thể kết nối trực tiếp DeepSeek, không cần layer adapter bên thứ ba.

### Cách một: Phương pháp file cấu hình (Khuyến nghị)

Nếu máy bạn chưa cài Claude Code, trước tiên chạy lệnh sau để cài đặt (Node.js 18+):

```bash
npm install -g @anthropic-ai/claude-code
```

Chỉnh sửa hoặc tạo mới file cấu hình Claude Code `~/.claude/settings.json`, thêm trường `env`, điền địa chỉ backend, model và API Key:

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_deepseek_api_key",
    "ANTHROPIC_BASE_URL": "https://api.deepseek.com/anthropic",
    "ANTHROPIC_MODEL": "DeepSeek-V4-Pro",
    "API_TIMEOUT_MS": "3000000",
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  }
}
```

Chú ý thay `your_deepseek_api_key` bằng API Key DeepSeek của bạn. Nếu bạn dùng DeepSeek-V4-Flash, đổi `ANTHROPIC_MODEL` thành `DeepSeek-V4-Flash` là được.

Sau khi cấu hình xong, khởi động Claude Code:

```bash
claude
```

Lần đầu khởi động cần chọn tin tưởng thư mục hiện tại.

### Cách hai: CC Switch (Chuyển đổi trực quan)

Nếu bạn muốn linh hoạt chuyển đổi giữa nhiều Provider như DeepSeek, Claude, MiniMax, khuyến nghị cài đặt **CC Switch**. Đây là công cụ nhỏ chuyên quản lý chuyển đổi mô hình Claude Code, hỗ trợ nhảy một click, còn hỗ trợ quản lý Skills, MCP và prompt.

![Giao diện chính CC Switch](https://oss.javaguide.cn/github/javaguide/ai/coding/cc-switch-main-interface.png)

Khởi động CC Switch, click **"+"** góc trên bên phải, chọn custom provider, Base URL điền `https://api.deepseek.com/anthropic`, API Key điền API Key DeepSeek của bạn.

![CC Switch thêm DeepSeek Provider](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/cc-switch-add-deepseek-provider.png)

Đổi tên model thành `DeepSeek-V4-Pro` (hoặc `DeepSeek-V4-Flash`), xong click "Thêm" góc dưới bên phải.

### Xác minh có hiệu lực không

Trực tiếp nhập `claude` trong command line hoặc sau khi vào giao diện Claude Code nhập `/status` để xác nhận, model là `DeepSeek-V4-Pro` là kết nối thành công.

![Xác minh có hiệu lực không](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/verify-deepseek-v4-ready.png)

Sau đó bạn có thể dùng DeepSeek V4-Pro để drive tất cả năng lực của Claude Code rồi.

## Thực chiến một: Nâng cấp danh sách mô hình preset đa Provider LLM

Tôi có một dự án phân tích cổ phiếu đa agent trong tay, đã gần một tháng không khởi động. Lần này khởi động lại, việc đầu tiên là cập nhật cấu hình mô hình lỗi thời.

Trang Settings của dự án trước đây chỉ có một ô nhập văn bản thuần để người dùng điền thủ công tên model, không đủ thân thiện.

Tôi cần làm hai việc: **tìm kiếm phiên bản mô hình mới nhất của các nhà LLM**, sau đó **thêm dropdown chọn lựa ở frontend**.

Prompt rất đơn giản:

> /tavily-search Tìm kiếm model mới nhất hiện tại của deepseek, glm và openai, rồi điều chỉnh model đề xuất mặc định và ví dụ trong cấu hình toàn cục. Và, vài icon LLM hiện tại quá chất AI, giúp tôi đổi sang cái sang hơn.

Nhiệm vụ không lớn, nhưng có một chi tiết đáng nói — nếu không cấu hình Skill `/tavily-search`, chỉ dựa vào ngày cắt dữ liệu training của mô hình để đoán phiên bản mới nhất, rất có khả năng sai. Tôi trước đây dùng mô hình khác không cấu hình Tavily, nhắc đi nhắc lại nhiều lần mới làm đúng phiên bản mô hình mới nhất của các nhà.

Về cách dùng Tavily có thể tham khảo: [Claude Code kết nối công cụ tìm kiếm AI Agent Tavily để tìm kiếm chất lượng cao](https://mp.weixin.qq.com/s/kAk7lLVgYzZrD9xJs3AUkQ).

DeepSeek V4-Pro **một lần là xong**.

![Tìm kiếm và cập nhật model LLM mới nhất](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/search-and-update-latest-models.png)

Cấu hình model tất cả cập nhật thành công, ví dụ model đề xuất của các nhà đều chuyển sang phiên bản mới nhất. Đã sửa ba file:

1. **`application.yml`** — Thêm DeepSeek preset Provider, nâng cấp model mặc định GLM lên `glm-5`
2. **`.env.example`** — Bổ sung biến môi trường DeepSeek, Kimi mặc định đổi thành `kimi-k2.6`
3. **`SettingsPage.tsx`** — Thêm hằng số `PROVIDER_PRESETS`, Model và Embedding Model đổi thành combo box

Danh sách model đề xuất của bốn Provider cuối cùng (tính đến 2026.04.25):

| Provider  | Model đề xuất                                                         |
| --------- | --------------------------------------------------------------------- |
| DashScope | `qwen3.6-flash`, `qwen3.5-plus`, `qwen3-max`, `qwq-32b`, v.v. 8 model |
| DeepSeek  | `deepseek-v4-flash`, `deepseek-v4-pro`                                |
| GLM       | `glm-5.1`, `glm-5`, `glm-4.7-flash`, v.v. 8 model                     |
| Kimi      | `kimi-k2.6`, `kimi-k2.5`, `kimi-k2-thinking`, v.v. 5 model            |

![Chỉnh sửa cấu hình model DeepSeek](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/edit-deepseek-model-config.png)

## Thực chiến hai: Chẩn đoán giải pháp migration database và tích hợp Flyway

Nhiệm vụ thứ hai thách thức hơn.

Vì đổi máy tính mới, tất cả môi trường đều xây dựng lại. Dự án có hai file SQL, một cái tự động thực thi khi khởi động dự án, cái còn lại không có. Phần logic này tôi cũng quên mất, cần để mô hình giúp chẩn đoán.

![Lỗi giao diện quản lý kỹ năng](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/skill-management-error.png)

Prompt:

> Dự án hiện tại có hai file SQL, `sql/init.sql` tự động thực thi khi khởi động dự án, `sql/V2__knowledge_skill.sql` không tự động thực thi. Hãy giúp tôi phân tích nguyên nhân, rồi tối ưu vấn đề hiện có bằng cách hợp lý.

Phân tích của DeepSeek V4-Pro rất đúng: **`V2__knowledge_skill.sql` không được mount vào container Docker, dự án cũng không giới thiệu bất kỳ công cụ migration database nào**, trong khi `init.sql` tự động thực thi khi container khởi động — đây là điều được viết cứng trong cấu hình Docker Compose.

![Phân tích nguyên nhân table database chưa thực thi](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/database-table-analysis.png)

Giải pháp nó đưa ra là **tích hợp Flyway làm công cụ migration database**.

Flyway là một trong những giải pháp migration database trưởng thành nhất trong hệ sinh thái Java, dùng quy ước đặt tên file (như `V1__init.sql`, `V2__knowledge_skill.sql`) để tự động quản lý thứ tự migration.

Toàn bộ quá trình DeepSeek V4-Pro đã hoàn thành những việc sau:

1. Phân tích logic mount `init.sql` trong cấu hình Docker Compose
2. Phát hiện nguyên nhân thiếu `V2__knowledge_skill.sql`
3. Giới thiệu dependency Flyway, viết cấu hình migration
4. Tái cấu trúc đặt tên file SQL, đảm bảo thứ tự migration đúng

> Có một cạm bẫy ở đây: Tôi vô tình điều chỉnh kích thước cửa sổ iTerm2 giữa chừng, dẫn đến lịch sử hội thoại trong terminal đột nhiên bị lộn xộn.

Lần chạy đầu tiên, Flyway không thực thi thành công. Tôi paste log lỗi qua, sau hai vòng điều chỉnh sửa thành công.

![Tóm tắt sau khi DeepSeek hoàn thành tích hợp Flyway](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/deepseek-flyway-integration-summary.png)

Vấn đề này đáng nêu riêng — vì DeepSeek V4-Pro trong lần tích hợp đầu tiên cũng vấp phải cạm bẫy này, trải qua hai vòng debug mới tìm ra nguyên nhân gốc rễ.

**Spring Boot 4.x đã thực hiện phân tách quy mô lớn với module tự động cấu hình**, `FlywayAutoConfiguration` đã bị xóa khỏi `spring-boot-autoconfigure`, chuyển sang module độc lập `spring-boot-flyway`.

Nếu bạn chỉ giới thiệu thư viện bên thứ ba `flyway-core`, Spring Boot **sẽ không tự động trigger bất kỳ migration nào**. Khó chịu nhất là, **trong log khởi động cũng sẽ không có bất kỳ đầu ra nào liên quan đến Flyway** — hoàn toàn không có lỗi, chỉ âm thầm không làm gì. Cạm bẫy này đặc biệt dễ gây hiểu nhầm, khiến bạn nghĩ là cấu hình viết sai, rồi cứ mày mò trong file `yml`.

Dùng Starter chính thức, nó sẽ đưa module tự động cấu hình vào cùng:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-flyway</artifactId>
</dependency>
<!-- Hỗ trợ dialect PostgreSQL vẫn cần giới thiệu riêng -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-database-postgresql</artifactId>
</dependency>
```

Nhớ bài học này: **Thời đại Spring Boot 4.x, nhiều thứ bạn quen giới thiệu thư viện bên thứ ba trực tiếp là có thể tự động mount, nay cần tìm Starter chính thức tương ứng.** Auto configuration đã bị tách ra, nhưng tài liệu không nhất thiết nhắc nhở rõ ràng.

## Thực chiến ba: Nền tảng phỏng vấn AI kết nối DeepSeek

Nền tảng hỗ trợ phỏng vấn thông minh AI của chúng tôi hiện đã thêm tính năng chuyển đổi và cấu hình đa model, DeepSeek cũng đã được hỗ trợ.

Giống thực chiến một, toàn bộ quá trình kết nối model mới nhất là một lần qua, không lặp lại quy trình nữa. Chúng ta trực tiếp xem kết quả.

Qua giao diện cấu hình, chuyển model mặc định sang DeepSeek, chọn **deepseek-v4-flash**.

![Chuyển model nền tảng phỏng vấn sang deepseek-v4-flash](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/interview-guide-model-deepseek-v4-flash.png)

Sau đó upload một CV, dựa trên CV này tạo một lần phỏng vấn mô phỏng, xem hiệu quả.

Câu hỏi phỏng vấn được tạo bởi deepseek-v4-flash, đáp án cũng để DeepSeek đưa ra trong chế độ không suy nghĩ nhanh (có hai câu không trả lời).

![Kết quả đánh giá phỏng vấn mô phỏng](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/interview-guide-model-deepseek-v4-flash-interview.png)

Model Flash, chế độ không suy nghĩ, chất lượng tạo sinh đã khá tốt. Xem xét định giá Flash, tỷ lệ giá/hiệu năng này khá mạnh.

## Thực chiến bốn: Kiểm toán code dự án và cộng tác đa model

Tôi có dự án phân tích cổ phiếu đa agent trong tay, phiên bản MVP đã chạy, hỗ trợ phân tích cổ phiếu, đa chiến lược, cảnh báo, kỹ năng, đa model, thông báo và các tính năng khác. Nhưng trong quá trình phát triển chạy theo tiến độ, chất lượng code chưa được chú ý kỹ.

Lần này tôi thử một tư duy: **Dùng model rẻ để kiểm toán, dùng model đắt để ra quyết định và sửa chữa**.

Trực tiếp trong Claude Code để DeepSeek V4-Pro khởi động nhiều Agent, từ các chiều bảo mật, tính đúng đắn chức năng, chất lượng code quét toàn bộ dự án, tổng hợp các vấn đề phát hiện vào tài liệu.

![DeepSeek V4-Pro quét phân tích code](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/deepseek-v4-pro-scan-analyze-code.png)

V4-Pro quả thực tìm ra không ít vấn đề, TOP 5 khẩn cấp nhất:

1. **API Key lưu trữ dạng plaintext** — Công cụ mã hóa đã triển khai nhưng chưa kết nối
2. **Interface quản lý hệ thống không có kiểm soát quyền** — Người dùng thông thường có thể sửa đổi cấu hình LLM
3. **Lỗ hổng deserialization Redis** — `activateDefaultTyping` cho phép tạo instance lớp tùy ý
4. **API Key bên thứ ba viết cứng** — Key thực Bocha được commit trong code
5. **Lỗi chức năng** — Nút "Phân tích lại" trang History thất bại do tham số route không được đọc

Tôi lướt qua một lượt, cơ bản đều hợp lý. Vấn đề bảo mật đặc biệt đáng chú ý, điều thứ 3 lỗ hổng deserialization Redis nếu bị khai thác, hậu quả rất nghiêm trọng.

Tiếp theo tôi ném trực tiếp vấn đề V4-Pro tìm ra cho **GPT-5.5** để phúc tra.

![GPT5.5 sửa chữa vấn đề được DeepSeek V4-Pro tìm ra](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/gpt5-5-fix-problems-found-by-deepseek-v4-pro.png)

**Tại sao không để V4-Pro tự sửa?** Vì kiểm toán code và sửa code là hai loại năng lực, dùng mô hình khác nhau để xác minh chéo đáng tin hơn — một cái chịu trách nhiệm tìm vấn đề, một cái chịu trách nhiệm xác nhận vấn đề và thực thi sửa chữa.

GPT-5.5 sau khi phúc tra trực tiếp thực thi sửa chữa, toàn bộ quá trình rất suôn sẻ.

Điểm quan trọng của case này không phải V4-Pro mạnh đến đâu, mà là tư duy **dùng model rẻ làm việc, dùng model đắt kiểm soát chất lượng** này. Chi phí V4-Pro làm code scan gần như có thể bỏ qua, cùng việc đó giao cho GPT-5.5 hay Claude Opus 4.6 làm, phí ít nhất cao hơn hai bậc độ lớn.

## Thực chiến năm: Quét phân tích toàn dự án

Cái này đơn giản thôi, tôi chủ yếu muốn xác minh chất lượng phân tích của V4-Pro, tiện thể xem mức tiêu thụ Token cuối cùng.

![Để V4-Pro quét phân tích agent-invest](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/claudecode-deepseek-v4-pro%5B1m%5D.png)

![Kết quả V4-Pro quét phân tích agent-invest](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/v4-pro-scan-analyze-result-of-agent-invest.png)

Đây là tài liệu V4-Pro cuối cùng xuất ra, chất lượng tổng thể rất cao, rất toàn diện:

![Tài liệu agent-invest V4-Pro xuất ra cuối cùng](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/v4-pro-final-output-agent-invest-document.png)

## Tổng quan DeepSeek V4: Xem số liệu sau khi xem thực chiến

Xem xong mấy nhiệm vụ thực chiến ở trên, rồi bổ sung thông số cứng của DeepSeek V4, sẽ có cảm giác thực tế hơn.

Lần này series V4 đồng thời phát hành hai model:

| Thông số                    | DeepSeek-V4-Pro                         | DeepSeek-V4-Flash                       |
| --------------------------- | --------------------------------------- | --------------------------------------- |
| Tổng tham số                | **1.6T**                                | **284B**                                |
| Tham số kích hoạt mỗi token | 49B                                     | 13B                                     |
| Cửa sổ ngữ cảnh             | **1M tokens**                           | **1M tokens**                           |
| Chế độ suy luận             | Không suy nghĩ / Think High / Think Max | Không suy nghĩ / Think High / Think Max |
| Giấy phép mã nguồn mở       | MIT                                     | MIT                                     |

Một số con số quan trọng đáng chú ý:

- **Điểm Codeforces của V4-Pro là 3206**, đứng đầu trong bốn model chính (Claude Opus 4.6, GPT-5.4 xHigh, Gemini 3.1 Pro High)
- **SWE-bench Verified 80.6%**, gần bằng Claude Opus 4.6 (80.8%), nhưng giá API rẻ hơn hai bậc độ lớn
- **Trong tình huống 1M ngữ cảnh**, FLOPs suy luận đơn token của V4-Pro chỉ bằng **27%** của V3.2, dung lượng KV cache chỉ bằng **10%**

![Dữ liệu Benchmark V4](https://oss.javaguide.cn/github/javaguide/ai/coding/deepseek-v4/v4-benchmark.png)

Xem tiếp định giá:

| Định giá API (mỗi triệu token) | DeepSeek-V4-Flash | DeepSeek-V4-Pro | Claude Sonnet 4.7 |
| ------------------------------ | ----------------- | --------------- | ----------------- |
| Đầu vào (cache miss)           | $0.14             | $1.74           | $3.00             |
| Đầu vào (cache hit)            | $0.028            | $0.145          | $0.30             |
| Đầu ra                         | $0.28             | $3.48           | $15.00            |

Giá đầu ra Flash chưa đến **1/50** của Claude Sonnet, giá đầu ra Pro khoảng **1/4** của Sonnet, khoảng cách hai loại ở đầu vào còn nhỏ hơn.

Nhìn trong hệ thống định giá này, Flash trong các tình huống hội thoại hàng ngày, tạo nội dung, hỏi đáp đơn giản gần như không có đối thủ.

Ngoài ra có một điểm cần chú ý: **Migration API không tốn kém**, đổi tên model là xong. `deepseek-chat` và `deepseek-reasoner` sẽ ngừng sử dụng sau ngày 24 tháng 7, hãy chuyển sớm sang tên model mới.

## Gợi ý theo tình huống

| Tình huống                                                      | Đề xuất                       | Lý do                                                                    |
| --------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| Hội thoại hàng ngày, tạo nội dung, hỏi đáp đơn giản             | **V4-Flash**                  | Giá cực thấp, hiệu năng đủ dùng                                          |
| Agent Coding, refactor code, phân tích toàn dự án               | **V4-Pro**                    | SWE-bench 80.6%, Codeforces 3206, tỷ lệ thành công nhiệm vụ phức tạp cao |
| Coding phức tạp, hỏi đáp chính xác, suy luận khoa học tiên tiến | **Claude Opus 4.6 / GPT-5.5** | Vẫn còn khoảng cách so với model đỉnh cao                                |

## Tổng kết

DeepSeek V4 trong tình huống Agent Coding và hiểu code, rõ ràng lên một bậc. V4-Pro đạt 80.6% trên SWE-bench Verified, điểm Codeforces 3206 đứng đầu, thực lực này tương ứng với giá này, tỷ lệ giá/hiệu năng quả thực đến nơi.

Tuy nhiên, DeepSeek-V4-Pro trong điều kiện không có Coding Plan, giá vẫn còn hơi cao. Định giá V4-Flash rất hấp dẫn, nhưng trong tình huống phát triển vẫn chưa thể trở thành lực lượng chủ lực.

Ngoài ra, trong coding phức tạp, hỏi đáp chính xác và suy luận khoa học tiên tiến, vẫn còn khoảng cách không nhỏ so với Claude Opus 4.6. Nhưng xét đến ưu thế giá Flash — cần gì xe tự đi?
