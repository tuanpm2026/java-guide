---
title: Giải mã Agent Skills - Là gì? Dùng thế nào? Khác Prompt, MCP là gì?
description: Phân tích chuyên sâu khái niệm Agent Skills, khám phá sự khác biệt bản chất giữa Skills với Prompt, MCP, Function Calling, cùng cách thiết kế Skill chất lượng cao trong thực tiễn để chuẩn hóa quy tắc code.
category: AI 应用开发
head:
  - - meta
    - name: keywords
      content: Agent Skills,MCP,Function Calling,Prompt,AI Agent,智能体,延迟加载,上下文注入
---

Đầu năm 2025, Anthropic sau khi ra mắt **MCP (Model Context Protocol)** đã giới thiệu khái niệm **Agent Skills** trong Claude Code. Động lực thiết kế đằng sau đó là: **Connectivity (Kết nối) và Capability (Năng lực) nên được tách biệt**.

Nhiều lập trình viên nghĩ rằng "chỉ cần viết prompt tốt, AI có thể giúp tôi làm mọi thứ". Nhưng thực tế là: **Prompt phù hợp cho tác vụ một lần, Skills mới là cách đúng để xây dựng năng lực AI có thể tái sử dụng**.

Skills đưa ứng dụng AI từ "kỹ năng cá nhân" lên tầm "kỹ thuật hóa". Hôm nay hãy cùng hiểu rõ khái niệm này, làm rõ triết lý thiết kế của Skills, sự khác biệt bản chất với các công nghệ liên quan, và cách tận dụng tốt năng lực này trong thực tiễn.

1. **Skills là gì**: Tại sao nói Skill là "sub-agent lazy loading"? Cơ chế cốt lõi — context injection và lazy loading hoạt động như thế nào?
2. **Skills vs Prompt vs MCP vs Function Calling**: Sự khác biệt bản chất của bốn thứ này là gì? Chúng phù hợp với trường hợp nào? Đây là điểm mù tần suất cao trong phỏng vấn.
3. **Skill chất lượng tốt trông như thế nào**: Một Skill được thiết kế tốt nên bao gồm những yếu tố nào? Metadata, điều kiện kích hoạt, luồng thực thi nên thiết kế ra sao?
4. **Thực chiến dự án**: Làm thế nào để dùng Skills chuẩn hóa quy tắc code, quy trình điều tra, tiêu chuẩn Review trong phát triển thực tế? Làm sao biến "kiến thức ngầm" của đội nhóm thành năng lực AI có thể tái sử dụng?

## Skills là gì?

Tóm gọn một câu: **Skill là một tập hợp chỉ dẫn logic có Domain Context (ngữ cảnh lĩnh vực) cụ thể, được định nghĩa bằng ngôn ngữ tự nhiên, bản chất là Sub-Agent (tác tử con) tối ưu tiêu thụ Token thông qua Lazy Loading (tải lười biếng)**.

> "Sub-Agent" ở đây là một phép tương tự — Skill không phải là một instance Agent độc lập, không có vòng lặp lập kế hoạch (Agent Loop) độc lập, nó gần với một ngữ cảnh lĩnh vực có thể được inject động.

Trong công việc nhóm, nhiều "kiến thức ngầm" nằm trong đầu nhân viên cũ, ví dụ như quy tắc code, quy trình điều tra, tiêu chuẩn Review. Giá trị cốt lõi của Skills là **biến những quy tắc ngầm này thành tài liệu hiện (SOP), để AI có thể tự đọc, hiểu và thực thi**.

Khác với quy trình công việc hardcode truyền thống, Skills không bắt buộc từng bước logic code, mà **dùng ngôn ngữ tự nhiên phân quyền quyết định cho mô hình** — mô hình sau khi động nạp `SKILL.md` qua `load_skill()`, sẽ **inject theo thời gian thực** các quy tắc, quy trình và ràng buộc được định nghĩa trong đó vào **ngữ cảnh suy luận**, hướng dẫn các lời gọi công cụ và quyết định tiếp theo. Điều này vừa bảo toàn ưu thế của Agent trong việc xử lý tính không chắc chắn, vừa tránh sự cứng nhắc của orchestration thuần code.

> Tại sao không dùng "đóng gói dựa trên Function Calling"? Cách diễn đạt này dễ khiến người ta nhầm tưởng Skill là một loại syntactic sugar của Function Calling. Thực ra, cơ chế cốt lõi của Skill là **context injection** — Agent đọc tài liệu Markdown, đưa các quy tắc và quy trình trong đó vào ngữ cảnh suy luận. Function Calling chỉ là phương tiện cơ bản có thể được dùng khi Agent thực thi một số hành động (như chạy script, truy vấn tài nguyên), không phải là tầng định nghĩa của Skills.
>
> Lưu ý: `load_skill()` là mô tả khái niệm về quá trình "Agent đọc và kích hoạt SKILL.md", cách kích hoạt thực tế của các công cụ khác nhau (Claude Code, Cursor, v.v.) sẽ có sự khác biệt.

**Cơ chế then chốt**:

- **Lazy Loading (Tải lười biếng)**: Metadata giữ ngắn gọn (thường ít hơn nhiều so với nội dung chính) thường trú trong context, nội dung chính chỉ được inject động khi có trigger, tránh chiếm dụng Token
- **Dynamic context injection (Inject ngữ cảnh động)**: Khác với "đọc" tài liệu tĩnh, Skills inject quy tắc vào ngữ cảnh suy luận theo thời gian thực, trực tiếp ảnh hưởng đến quyết định mô hình

## Skills và Prompt, MCP, Function Calling có gì khác nhau

Đây cũng là điểm thường được hỏi trong phỏng vấn, dễ bị nhầm lẫn:

## 一个 Skill 长什么样？

| Chiều                | Prompt                                     | Skills                                                 |
| :------------------- | :----------------------------------------- | :----------------------------------------------------- |
| **Bản chất**         | Chỉ dẫn văn bản cho một lần hội thoại      | **Đơn vị năng lực** có thể lưu trữ và khám phá         |
| **Tính tái sử dụng** | Mất đi theo context hội thoại, khó bảo trì | Đóng gói chuẩn, tái sử dụng xuyên dự án, đa tình huống |
| **Cơ chế tải**       | Tải toàn bộ (chiếm Token)                  | **Lazy loading** (đọc nội dung chính theo nhu cầu)     |

- **Prompt**: Carrier để người dùng biểu đạt ý định tức thời (như "phân tích báo cáo này").
- **Skills**: Gói hoàn chỉnh gồm **metadata (khi nào dùng) + nội dung chính (cách thực thi)**, tải theo nhu cầu vào context thông qua cơ chế `load_skill()`.

**2. Skills vs MCP**

Đây là điểm dễ gây hiểu nhầm nhất.

| Chiều                    | MCP (Model Context Protocol)                                     | Skills                                                                                  |
| :----------------------- | :--------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **Tư tưởng cốt lõi**     | **Kết nối chuẩn hóa**: Thống nhất định dạng dữ liệu qua JSON-RPC | **Orchestration logic**: Mô tả đường dẫn thực thi phức tạp bằng ngôn ngữ tự nhiên       |
| **Cách định nghĩa**      | Viết cứng logic phía Server bằng code (TS/Python)                | Hướng dẫn quyết định mô hình bằng ngôn ngữ tự nhiên trong `SKILL.md`                    |
| **Phụ thuộc môi trường** | Cần chạy một process MCP Server                                  | Phụ thuộc môi trường có thể thực thi (như local Shell hoặc sandbox)                     |
| **Triết học**            | **Protocol-centric**: Viết một lần, dùng cho tất cả AI           | **Model-centric**: Tận dụng khả năng suy luận của mô hình để xử lý tính không chắc chắn |

- **MCP giải quyết connectivity (kết nối)**: Giống như USB-C, giúp AI đọc file, truy vấn database theo định dạng thống nhất.
- **Skills giải quyết orchestration logic (logic điều phối)**: Giống như một tài liệu hướng dẫn, nói cho AI biết cách thực thi các tác vụ phức tạp — những tác vụ này hoàn toàn có thể bao gồm gọi nhiều MCP tool.
- **Mối quan hệ giữa hai**: Chúng giải quyết các vấn đề ở các tầng khác nhau. MCP chịu trách nhiệm kết nối hệ thống bên ngoài vào, Skills chịu trách nhiệm quyết định khi nào dùng và cách kết hợp các năng lực đó. Nền tảng của một Skill cao cấp thường là gọi nhiều MCP tool.

![Sơ đồ MCP](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-simple-diagram.png)

![Skills vs MCP](https://oss.javaguide.cn/github/javaguide/ai/skills/mcp-mcp-vs-skills.png)

**3. Function Calling vs Skills**

| Chiều                 | Function Calling                         | Skills                                                                                            |
| :-------------------- | :--------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **Tầng**              | Cơ chế tầng dưới                         | Ứng dụng tầng trên                                                                                |
| **Quan hệ phụ thuộc** | Năng lực cơ bản                          | Khi thực thi **có thể dùng** Function Calling (như tải tài liệu, thực thi script, đọc tài nguyên) |
| **Độ hạt**            | Thao tác nguyên tử (gọi công cụ một lần) | Quy trình tổng hợp (quyết định nhiều bước + kết hợp công cụ)                                      |

Skills **không tạo ra năng lực mới**, mà tổ chức năng lực thành hình thức dễ dùng hơn thông qua tài liệu ngôn ngữ tự nhiên:

1. Agent đọc `SKILL.md`, inject quy tắc và quy trình vào ngữ cảnh suy luận.
2. Theo hướng dẫn ngữ cảnh, Agent **có thể** thực thi script, đọc tài nguyên hoặc gọi MCP tool thông qua Function Calling.

> Không phải tất cả Skills đều phụ thuộc Function Calling. Một số Skill thuần suy luận — như tiêu chuẩn code review, hướng dẫn quyết định kiến trúc, chúng chỉ cung cấp hướng dẫn ngữ cảnh, không cần bất kỳ lời gọi công cụ bên ngoài nào. Function Calling là phương tiện cơ bản khi Skills thực thi hành động, không phải là điều kiện tiên quyết cho sự tồn tại của Skills.

**Tổng kết hệ thống**:

| **Thành phần**       | **Định nghĩa một câu**                           | **Phép tương tự**         | **Hiểu then chốt**                                                                 |
| :------------------- | :----------------------------------------------- | :------------------------ | :--------------------------------------------------------------------------------- |
| **Prompt**           | Carrier biểu đạt ý định tức thời                 | Điều người dùng nói       | Một lần, dễ mất                                                                    |
| **Function Calling** | Năng lực LLM output lời gọi có cấu trúc          | Tín hiệu thần kinh        | **Nền tảng của tất cả**, thực hiện chuyển đổi phi cấu trúc→có cấu trúc             |
| **MCP**              | Protocol tiếp nhận công cụ chuẩn hóa             | Cổng USB-C                | Giải quyết "cách kết nối" hệ thống bên ngoài (connectivity)                        |
| **Skills**           | Sub-agent được định nghĩa bằng ngôn ngữ tự nhiên | Tài liệu hướng dẫn tác vụ | Giải quyết "cách điều phối" tác vụ phức tạp (execution logic), có thể gọi MCP tool |

**Quan hệ bốn tầng**: Function Calling là nền tảng → Prompt biểu đạt ý định → MCP chịu trách nhiệm kết nối hệ thống bên ngoài → Skills chịu trách nhiệm điều phối luồng tác vụ phức tạp (có thể gọi MCP)

Ở đây cần làm rõ một hiểu lầm phổ biến: MCP và Skills không mâu thuẫn, cũng **không phải chọn một**.

- **MCP** giải quyết cách kết nối hệ thống bên ngoài: Cho phép AI đọc file, truy vấn database, gọi API theo định dạng thống nhất.
- **Skills** giải quyết cách điều phối tác vụ phức tạp: Định nghĩa luồng thực thi bằng ngôn ngữ tự nhiên, những luồng này hoàn toàn có thể bao gồm gọi nhiều MCP tool.

Dùng kết hợp hai loại: Nội dung chính của một Skill sẽ hướng dẫn Agent đầu tiên dùng MCP đọc database, rồi dùng MCP gọi external API, cuối cùng tạo báo cáo.

**Tóm tắt một câu**: Prompt mang ý định, Function Calling thực hiện tương tác, MCP chịu trách nhiệm kết nối hệ thống bên ngoài, Skills chịu trách nhiệm điều phối luồng tác vụ phức tạp.

## Skill trông như thế nào? Cách sử dụng

Về mặt cấu trúc, Skill rất đơn giản, cốt lõi chỉ là một file `SKILL.md`, bao gồm **metadata** (mô tả khi nào dùng) và **nội dung chính** (SOP thực thi cụ thể).

**Điểm nổi bật trong thiết kế là "progressive disclosure" (tiết lộ dần dần)**:

- **Metadata** thường trú trong context, AI biết có những kỹ năng nào có thể dùng.
- **Nội dung chính** tải theo nhu cầu, chỉ đọc khi được trigger, tránh chiếm Token.

Skill phức tạp hơn còn có thêm thư mục tài nguyên, script và tài liệu tham khảo.

Cấu trúc thư mục đầy đủ của Skill như sau:

```
skill-name/
├── SKILL.md          # Bắt buộc: metadata (khi nào dùng) + nội dung chính (chỉ dẫn, quy trình, ví dụ)
├── scripts/          # Tùy chọn: script có thể thực thi (Python/Bash), gọi theo nhu cầu
├── references/       # Tùy chọn: tài liệu tham khảo, đọc theo nhu cầu
└── assets/           # Tùy chọn: template, hình ảnh và tài nguyên khác
```

**Thực chiến dự án**:

Tôi chủ yếu dùng Skills trong dự án để **chuẩn hóa tiêu chuẩn kỹ thuật**. Ví dụ định nghĩa một Skill `code-reviewer`, yêu cầu rõ ràng cần review cấu trúc từ nhiều chiều như tính hợp lý kiến trúc, tính hoàn chỉnh xử lý ngoại lệ, quy tắc log, rủi ro bảo mật, ẩn họa hiệu suất, v.v. Nhờ đó AI khi Review code sẽ thực thi nghiêm ngặt tiêu chuẩn đội nhóm, thay vì "bình ngẫu hứng". Điều này rất hữu ích để duy trì tính nhất quán về chất lượng code.

Ngoài Code Review, tôi cũng định nghĩa các Skill khác, ví dụ:

- `api-endpoint-generator` - Tạo code interface chuẩn hóa theo cấu trúc response và exception model thống nhất của dự án
- `database-access-review` - Review logic truy cập database, chú trọng việc sử dụng index và rủi ro slow query
- `refactor-analysis` - Đánh giá phạm vi ảnh hưởng và quan hệ phụ thuộc trước, rồi output kế hoạch refactor từng bước
- `security-audit` - Quét các rủi ro bảo mật phổ biến như SQL splicing, XSS, bypass phân quyền

**Ví dụ về Skill xuất sắc**:

- Code-Review-Expert (Skill review code chuyên gia, thực hiện code review có cấu trúc từ góc nhìn kỹ sư cấp cao, bao gồm: thiết kế kiến trúc, nguyên tắc SOLID, bảo mật, vấn đề hiệu suất, xử lý lỗi, điều kiện biên): **https://github.com/sanyuan0704/code-review-expert**
- Git Commit with Conventional Commits (Công cụ commit thông minh dựa trên chuẩn Conventional Commits, có thể tự động phân tích diff, tự động stage file và tạo commit message có ngữ nghĩa, hoàn thành Git commit chuẩn hóa an toàn và hiệu quả): **https://github.com/github/awesome-copilot/blob/main/skills/git-commit/SKILL.md**
- TDD (Test-Driven Development, viết test case trước, xem nó có fail không, rồi viết code tối thiểu để vượt qua test): **https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md**

**https://skills.sh/** là website có thể tìm kiếm các Skills phổ biến và thực dụng.

![Tìm kiếm Skills phổ biến và cần thiết](https://oss.javaguide.cn/github/javaguide/ai/skills/skillssh.png)

Ở đây cần đề cập thêm, khi trả lời câu hỏi này, bạn cũng có thể nói đội nhóm mình dùng một số bộ sưu tập Software Development Skills mã nguồn mở, ví dụ như những cái được tích hợp sẵn trong Superpowers.

![Skills tích hợp sẵn trong Superpowers](https://oss.javaguide.cn/github/javaguide/ai/skills/superpowers-skills.png)

Ngoài ra, nhiều công cụ lập trình AI cũng hỗ trợ cơ chế Skills. Lấy Claude Code làm ví dụ, nó sẽ quét các file `SKILL.md` trong thư mục `.claude/skills/` của dự án, **do mô hình tự chủ phán đoán khi nào kích hoạt** — người dùng không cần gọi thủ công, Claude sẽ tự động khớp và tải Skill liên quan theo ngữ cảnh tác vụ.

> Nói cách khác, Skills của Claude Code là **model-invoked** (mô hình chủ động gọi), không phải user-invoked (người dùng kích hoạt thủ công). Đây cũng là một trong những khác biệt then chốt giữa Skills và hệ thống plugin truyền thống. Anthropic chính thức cũng đang liên tục phát hành và duy trì bộ sưu tập Agent Skills (xem [Anthropic Skills repository](https://github.com/anthropics/skills)).

::: warning Rủi ro bảo mật của Skills bên thứ ba

Khi dùng Skills bên thứ ba cần chú ý rủi ro bảo mật:

- **Prompt injection**: Skill độc hại có thể chứa chỉ dẫn dụ dỗ mô hình thực thi các thao tác ngoài dự kiến (như đọc file nhạy cảm, thực thi lệnh nguy hiểm).
- **Rò rỉ dữ liệu**: Skill có thể hướng dẫn mô hình output thông tin nhạy cảm đến service bên ngoài.
- **Khuyến nghị**: Review nội dung `SKILL.md` trước khi dùng; trong trường hợp doanh nghiệp hãy thiết lập cơ chế kiểm duyệt Skill nội bộ; tránh dùng trực tiếp Skill không rõ nguồn gốc.

:::

## Làm thế nào để thực hiện progressive disclosure?

Phần trước đã nói về lý niệm progressive disclosure — metadata thường trú, nội dung chính tải theo nhu cầu. Phần này sẽ bàn chi tiết hơn về **cách triển khai cụ thể**.

### Context không phải càng nhiều càng tốt

Trực giác của nhiều lập trình viên là "càng đưa nhiều thông tin cho mô hình, nó hoạt động càng tốt", nhưng chạy thực tế không phải như vậy. Điều này có nghĩa nếu bạn nhét hàng chục chỉ dẫn quy tắc vào System Prompt, những chỉ dẫn ở giữa cơ bản như chưa viết. Chất đống nội dung mù quáng không những vô ích mà còn làm chỉ dẫn thực sự quan trọng bị chìm trong nhiễu.

![Progressive Disclosure](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-progressive-disclosure.svg)

Nguyên tắc cốt lõi của quản lý context là: **Mỗi nội dung đưa vào, càng đóng góp nhiều cho tác vụ hiện tại càng tốt, nội dung không liên quan chỉ là nhiễu thuần túy**.

### Phương án thiết kế phân tầng

Tư duy xử lý là **thiết kế phân tầng**, tách "biết có những năng lực nào" và "lấy chỉ dẫn cụ thể" thành hai bước:

**Tầng một: Metadata thường trú**. Mỗi Skill chỉ giữ một tên kèm hai ba câu mô tả, tổng cộng tất cả Skill gộp lại cũng chỉ vài trăm token. "Mục lục" này luôn ở trong context, để mô hình biết có những năng lực nào có thể dùng.

**Tầng hai: Tải nội dung chính theo nhu cầu**. Sau khi request người dùng đến, đầu tiên dùng "mục lục" này để lọc thô, phán đoán tác vụ hiện tại liên quan đến những Skill nào, chỉ Skill được match mới đọc nội dung đầy đủ ghép vào context.

### "Liên quan" được phán đoán như thế nào

Về "làm thế nào để phán đoán tác vụ hiện tại cần những Skill nào", trong thực tế chủ yếu có hai phương án:

- **Keyword matching (khớp từ khóa)**: Tốc độ nhanh, nhưng recall kém, người dùng đổi cách nói một chút là không khớp được.
- **Semantic matching (khớp ngữ nghĩa)**: Trước đó vector hóa mô tả mỗi Skill bằng embedding model và lưu lại, khi request đến thì vector hóa user Query, tính cosine similarity, lấy top-k match. Hiệu quả tốt hơn nhiều, nhưng giới thiệu một lần gọi embedding model bổ sung, có một chút overhead về độ trễ.

Trong dự án thực tế nên ưu tiên semantic matching làm chính, keyword matching làm fallback.

> Semantic matching có một **vấn đề cold start** phổ biến: Skill mới lên sóng chưa có dữ liệu Query lịch sử, embedding model chỉ có thể dựa vào mô tả metadata để match, độ chính xác có thể không đủ. Trong thực tế có thể giảm thiểu bằng cách **preset Query sample điển hình** (thêm trường `examples` vào metadata của Skill) — tương đương với warm-up cho Skill mới.

### Cơ chế fallback

Lần match đầu tiên khó tránh bỏ sót, vì vậy cần một cơ chế **supplemental loading** (tải bổ sung): Nếu trong quá trình thực thi tác vụ lần này kích hoạt keyword của một Skill chưa được tải trước đó, thì append nội dung tương ứng vào context. Cơ chế này giải quyết vấn đề bỏ sót trong lần match đầu, nhưng cần chú ý ảnh hưởng của vị trí ghép đến mô hình — chỉ dẫn đặt ở vị trí nào trong Prompt sẽ trực tiếp ảnh hưởng đến mức độ chú ý của mô hình, không thể tùy tiện chèn vào giữa.

> Từ góc nhìn thiết kế hệ thống, logic phân tầng này giống hệt "đi index trước rồi lookup lại" trong database — full scan chi phí quá cao, nên dùng một cấu trúc phụ trợ nhẹ (metadata index) để pre-filter, sau khi match rồi mới lấy dữ liệu đầy đủ (nội dung chính Skill). Tư tưởng cốt lõi đều là "dùng chi phí nhỏ để thu hẹp phạm vi, rồi dùng truy vấn chính xác để lấy dữ liệu đầy đủ".

## Nếu thiết kế một Skill routing module?

Phần trước đã bàn về cách thực hiện progressive disclosure, phần này đi sâu hơn: Nếu bạn thiết kế từ đầu một **Skill routing module**, cần nhanh chóng chọn ra 2-3 Skill liên quan nhất từ vài chục Skill, nên build index như thế nào, sort như thế nào?

Ở đây có một điểm dễ nhầm lẫn: Câu hỏi này bề ngoài trông giống RAG, nhưng ở quy mô vài chục Skill, bản chất gần với bài toán "small-scale retrieval + re-ranking" hơn là thiết kế hệ thống knowledge augmentation đầy đủ.

### Sự khác biệt bản chất so với RAG

Logic Skill routing và RAG là giống nhau — đều là "truy xuất trước rồi sinh", nhưng sự khác biệt bản chất nằm ở **tính chất và độ ổn định của nội dung**:

- **RAG** truy xuất external knowledge base, nội dung động, lượng lớn, nằm ngoài tầm kiểm soát của mô hình, retrieve thêm vài tài liệu không liên quan cũng có mức độ dung sai nhất định, mô hình tự có thể filter một phần trong giai đoạn generation, mục tiêu bản chất là "bổ sung thông tin ngữ cảnh".
- **Skill routing** truy xuất tập hợp chỉ dẫn có cấu trúc số lượng hữu hạn, nội dung tương đối ổn định, tổng lượng có thể kiểm soát, nhưng yêu cầu độ chính xác cao hơn — một khi chọn sai Skill, toàn bộ execution chain tiếp theo sẽ đi sai, mục tiêu bản chất là "chọn đúng năng lực chứ không phải bổ sung kiến thức".

Nói cách khác, RAG nghiêng về "recall càng nhiều thông tin hữu ích càng tốt", còn Skill routing nghiêng về "cố gắng tránh chọn sai".

### Quy trình routing bốn bước

![Quy trình routing bốn bước của Skill](https://oss.javaguide.cn/github/javaguide/ai/skills/skills-router.svg)

Toàn bộ quy trình Skill routing có thể chia thành bốn bước:

1. **Vector index**: Trước đó vector hóa tên, mô tả, tình huống trigger điển hình của mỗi Skill bằng embedding model, lưu vào một vector store nhẹ. Ở quy mô vài chục Skill, dùng NumPy tính cosine similarity trong bộ nhớ là đủ (phản hồi micro giây), không cần giới thiệu thư viện vector retrieval chuyên dụng như FAISS, như vậy chi phí triển khai thấp hơn, debug cũng đơn giản hơn. Tất nhiên, nếu sau này số Skill tăng lên hàng trăm hay hàng nghìn, lúc đó mới cần cân nhắc migrate sang FAISS hoặc vector database chuyên dụng.

2. **Initial filtering**: Vector hóa user input, tính similarity, trước tiên lấy top-5 candidates. Bước này ưu tiên recall rate, thà chọn thêm vài cái, để dành không gian cho re-ranking tiếp theo, thay vì ngay từ đầu đã cố gắng chọn chính xác.

3. **Rerank**: Dùng một cross-encoder model nhẹ để re-score candidate list, cuối cùng chọn top-2 hoặc top-3. Giá trị cốt lõi của Rerank là filter những "sai match ngữ nghĩa gần nhưng ý định không khớp", chính xác hơn nhiều so với pure vector matching, bản chất là đang phân loại ở "tầng năng lực".

4. **Confidence fallback**: Nếu similarity của Skill điểm cao nhất cũng thấp hơn một ngưỡng nào đó, có nghĩa tác vụ hiện tại không cần Skill đặc biệt nào, đi qua flow mặc định, tránh match cưỡng bức dẫn đến chỉ dẫn sai được đưa vào. Trong Skill routing, "không chọn" đôi khi quan trọng hơn "chọn sai".

### "Retrieve được rồi nhưng generation đi lạc" thì làm sao

Đây là vấn đề cả RAG và Skill routing đều gặp, nguyên nhân thường có hai loại:

- **Vấn đề bản thân nội dung retrieve**: Đoạn được retrieve là chủ đề liên quan nhưng không phải chi tiết mà mô hình thực sự cần. Ví dụ hỏi "cách viết thread-safe singleton trong Java", retrieve về một đống giới thiệu tổng quát về singleton pattern, nhưng code then chốt của double-checked locking không vào được. Giải pháp là **tối ưu chiến lược chunking**, làm cho các fragment quan trọng dễ bị match hơn ở độ hạt retrieval.

- **Vấn đề cách ghép**: Trực tiếp ghép nhiều đoạn retrieve lại với nhau, không chỉnh lý gì, mô hình đọc được là một mớ mảnh vỡ cấu trúc lộn xộn, khi generation dễ mất trọng tâm. Giải pháp là sau khi recall thêm một bước **rerank hoặc summary compression**, thậm chí có thể đánh nhãn cấu trúc rõ ràng (như "background / constraints / key steps"), cải thiện khả năng đọc của mô hình.

### Kiến trúc của instruction dispatcher tổng quát

Nếu muốn thiết kế một "instruction dispatcher" tổng quát hơn, có thể trừu tượng hóa thành bốn thành phần cốt lõi:

| Thành phần               | Trách nhiệm                                                                    | Điểm then chốt                                                       |
| ------------------------ | ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| **Instruction Registry** | Duy trì metadata của tất cả chỉ dẫn, cung cấp CRUD interface                   | Tự động vector hóa và persist khi đăng ký                            |
| **Routing Engine**       | Nhận ý định người dùng, semantic match, output candidate list và confidence    | Stateless, có thể scale ngang                                        |
| **Loader**               | Lấy nội dung đầy đủ của chỉ dẫn theo nhu cầu                                   | Hỗ trợ cache, tránh đọc file lặp lại                                 |
| **Context Assembler**    | Ghép các chỉ dẫn được chọn vào Prompt cuối cùng theo quy tắc ưu tiên và vị trí | Chỉ dẫn ở vị trí nào trong Prompt ảnh hưởng đến mức độ chú ý mô hình |

Ở đây có thể chú ý một điểm thực hành: Tách routing và loading là rất quan trọng, như vậy có thể linh hoạt điều chỉnh nội dung chỉ dẫn và cách lưu trữ mà không ảnh hưởng đến hiệu suất routing.

### Cân nhắc hiệu suất dưới high concurrency

Trong trường hợp high concurrency, semantic matching có thể trở thành bottleneck, chủ yếu có hai điểm: một là mỗi request đều phải gọi embedding model để tạo vector (nếu dùng external API, độ trễ không kiểm soát được); hai là bản thân tính toán vector similarity (số Skill ít có thể tính full, khi quy mô tăng lên cần ANN index).

Chiến lược ứng phó trong dự án thực tế:

- **Cache vector hóa Query**: Query tần suất cao tương tự hit cache trả về trực tiếp, bypass embedding call, lợi ích thường rất rõ ràng.
- **In-memory vector retrieval**: Số lượng Skill thường chỉ vài chục, dùng NumPy tính cosine similarity trong bộ nhớ trực tiếp là được (micro giây), không cần dependency bổ sung như FAISS, ưu tiên đảm bảo đơn giản đáng tin cậy.
- **Stateless routing service**: Tách routing service ra độc lập, vì stateless nên scale out rất dễ, đồng thời cũng tiện cho gray release và iteration chiến lược.

## Làm thế nào để viết Agent Skills chất lượng cao?

Nhiều lập trình viên khi lần đầu tiếp xúc với Skills thường có phản xạ coi nó như "tài liệu" — chất đống background giới thiệu, hướng dẫn cài đặt, lịch sử phiên bản... Kết quả là AI hoặc "không hiểu", hoặc "không dùng".

**Viết Skills chất lượng cao là một kỹ năng chuyên biệt** — bạn không viết README cho người đọc, mà **viết execution protocol cho AI**. Sự khác biệt này quyết định bạn cần một cách tư duy hoàn toàn khác:

- **Viết cho người**: Chú trọng readability, completeness, background knowledge
- **Viết cho AI**: Chú trọng precision, executability, context efficiency

Nội dung tiếp theo sẽ giới thiệu hệ thống cách viết Skills chất lượng cao. Những nguyên tắc này đến từ tài liệu chính thức Anthropic và thực tiễn production quy mô lớn của cộng đồng, đã được xác nhận trong thực chiến.

### Metadata ngữ nghĩa chính xác

Metadata là cơ sở cốt lõi để Agent thực hiện task routing, đặc biệt là description, nó đóng vai trò là "index" của LLM.

- **Nguyên tắc**: Loại bỏ mơ hồ, làm rõ ranh giới, và tích hợp các từ kích hoạt ý định.
- **Logic tối ưu**: Chuyển từ "mô tả chức năng" sang "định nghĩa tình huống, vấn đề và điều kiện trigger".

| Chiều        | Mô tả                                                                                                                                                            | Ý định trigger                                                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Ví dụ kém    | Phân tích system log                                                                                                                                             | Không có hướng dẫn rõ ràng                                                                                                        |
| Ví dụ tối ưu | Chẩn đoán runtime exception trong môi trường production Spring Boot, bao gồm parse Java stack trace, xác định OOM memory overflow và phân tích slow API latency. | Khi người dùng đề cập "API báo lỗi", "hệ thống treo", "Full GC thường xuyên" hoặc paste error log, lập tức kích hoạt kỹ năng này. |

Thêm trường `parameters` trong Metadata, định nghĩa định dạng input/output (như YAML), giúp LLM giảm ảo giác. Ví dụ:

```yaml
name: jvm-runtime-diagnosis
description: Diagnose Spring Boot production runtime issues. Use when the user pastes Java stack traces, mentions OOM, Full GC, high CPU, slow APIs, or asks why a service is stuck.
parameters:
  input: { type: string, description: "错误日志、堆栈、监控摘要或 TraceId" }
  output: { type: json, description: "诊断结果，包括根因、证据和下一步动作" }
```

### Modular và Single Responsibility

Các "all-in-one" Skills lớn sẽ khiến LLM sinh ảo giác khi xây dựng tham số. Agentic Workflow phù hợp hơn với ma trận công cụ fine-grained.

- **Nguyên tắc**: Tách biệt theo chiều điều tra, đảm bảo mỗi Skill có trách nhiệm đơn lẻ (SRP).
- **Phương án tối ưu**: Tránh một "system failure troubleshooter" duy nhất, thay vào đó là bộ công cụ:
  - `jvm-metrics-analyzer`: Chuyên thu thập JVM metrics (như heap memory, thread count) qua Prometheus.
  - `distributed-trace-finder`: Theo dõi link latency của TraceId cụ thể bằng SkyWalking hoặc Zipkin.
  - `k8s-pod-event-viewer`: Chuyên truy vấn Kubernetes Pod state change và restart records.

### Nguyên tắc ưu tiên tính xác định

Đối với tính toán hoặc chuyển đổi định dạng cần logic chặt chẽ, **đừng bao giờ tin vào "trực giác" của LLM**, hãy để nó drive script.

- **Nguyên tắc**: LLM chịu trách nhiệm **trích xuất tham số**, script chịu trách nhiệm **logic closure**.
- **Tối ưu ví dụ**: Khi Agent phát hiện CPU load quá cao, đừng để nó "đoán mò" thread nào có vấn đề, mà hãy để nó gọi một diagnostic script đã được đóng gói sẵn.

**Logic thực thi trong định nghĩa Skill:**

> "Nếu CPU usage vượt quá 80%, hãy trích xuất node IP, gọi `./scripts/capture_thread_dump.sh`. Đừng cố mô phỏng thread analysis thủ công trong dialog box, hãy parse trực tiếp **Top 3 耗时线程堆栈** mà script trả về."

> Lưu ý phạm vi áp dụng: Ưu tiên tính xác định phù hợp với **các tình huống liên quan đến tính toán chính xác, chuyển đổi định dạng, side-effect operations** (như thực thi script, modify database). Đối với các tác vụ cần phán đoán mơ hồ, generation sáng tạo hoặc suy luận mở (như thiết kế phương án, tối ưu văn bản), quá nhiều script hóa ngược lại sẽ giới hạn khả năng biểu đạt của mô hình.

### Chiến lược progressive disclosure

Tránh "information overload" làm Agent bị lạc. Thông qua cấu trúc phân tầng của tài liệu, để Agent chỉ tải chi tiết khi cần.

**Khuyến nghị cấu trúc ba tầng**:

1. **SKILL.md (chính)**: Định nghĩa các loại fault cốt lõi (4xx, 5xx) và SOP troubleshoot chuẩn.
2. **`troubleshooting-guide.md` (bổ sung)**: Đặt một số "lỗi cũ hiếm gặp" hoặc điểm mù cấu hình của middleware cụ thể (như RocketMQ).
3. **runbooks/ (data files)**: Lưu trữ knowledge base fault lịch sử, để Agent truy vấn qua RAG rồi mới tham khảo, thay vì nhét tất cả vào context.

### Tổng kết

**Năm nguyên tắc cốt lõi** để viết Skills chất lượng cao:

| **Nguyên tắc**             | **Tư tưởng cốt lõi**                             | **Thực hành then chốt**                                                         |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| **Ngữ nghĩa chính xác**    | Từ "mô tả chức năng" đến "định nghĩa tình huống" | Dùng câu mệnh lệnh + từ kích hoạt + ranh giới rõ ràng                           |
| **Chủ nghĩa tối giản**     | Context là tài nguyên công cộng                  | Xóa nhiễu, 10 dòng ví dụ thay thế 100 dòng văn bản                              |
| **Modular**                | SRP tránh ảo giác                                | Tách biệt theo chiều điều tra, thay vì xây "công cụ vạn năng"                   |
| **Ưu tiên xác định**       | Nhận ra "thao tác dễ vỡ"                         | LLM trích xuất tham số, script chịu trách nhiệm logic closure                   |
| **Progressive disclosure** | Tải theo nhu cầu, tránh context explosion        | L1 metadata thường trú + L2 nội dung chính theo nhu cầu + L3 tài nguyên cách ly |

**Nhớ**: Skills bản chất là **execution protocol**, đừng viết nó như tài liệu.

## Tổng kết và khuyến nghị chọn lựa

### Quan điểm cốt lõi

Skills và MCP đại diện cho hai tầng trừu tượng then chốt trong agent technology stack:

| **Thành phần** | **Định nghĩa một câu**                           | **Phép tương tự**         | **Hiểu then chốt**                                            |
| -------------- | ------------------------------------------------ | ------------------------- | ------------------------------------------------------------- |
| **MCP**        | Protocol tiếp nhận công cụ chuẩn hóa             | Cổng USB-C                | Giải quyết "cách kết nối" hệ thống bên ngoài (connectivity)   |
| **Skills**     | Sub-agent được định nghĩa bằng ngôn ngữ tự nhiên | Tài liệu hướng dẫn tác vụ | Giải quyết "cách điều phối" tác vụ phức tạp (execution logic) |

### Khuyến nghị thực hành

| Tình huống                                                           | Phương án khuyến nghị                     | Lý do                                              |
| -------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------- |
| Kết nối service bên ngoài (database, API, cloud)                     | **Ưu tiên dùng MCP**                      | Interface chuẩn hóa, dễ bảo trì                    |
| Workflow phức tạp (tác vụ nhiều bước, kiến thức lĩnh vực chuyên sâu) | **Ưu tiên dùng Skills**                   | Đóng gói kiến thức lĩnh vực, có thể tái sử dụng    |
| Tình huống context bị hạn chế (hội thoại dài, nhiều công cụ)         | **Dùng Skills để quản lý dần dần**        | Chỉ tải Skill liên quan, giảm đáng kể token vô ích |
| Xây dựng enterprise-level agent                                      | **Dùng kiến trúc phân tầng MCP + Skills** | Separation of concerns, dễ bảo trì mở rộng         |

### Chuẩn bị phỏng vấn

**Câu hỏi tần suất cao**:

1. **Skills là gì?** → Sub-agent lazy loading, giải quyết vấn đề "cách điều phối"
2. **Sự khác biệt giữa Skills và MCP?** → MCP chịu trách nhiệm connectivity, Skills chịu trách nhiệm execution logic, quan hệ bổ sung
3. **Làm thế nào để giảm token consumption?** → Progressive disclosure: metadata thường trú, nội dung chính tải theo nhu cầu
4. **Progressive disclosure là gì?** → Kiến trúc ba tầng: metadata → nội dung chính → tài nguyên bổ sung
5. **Làm thế nào để viết Skills chất lượng cao?** → Description chính xác + single responsibility + ưu tiên tính xác định
6. **Làm thế nào để thực hiện progressive disclosure?** → Metadata thường trú làm index, semantic matching (vector hóa + cosine similarity top-k) lọc Skill liên quan, tải nội dung chính theo nhu cầu, keyword trigger bổ sung làm fallback
7. **Tỷ lệ signal/noise trong context hiểu như thế nào?** → Hiệu ứng "Lost in the Middle" (Liu et al., 2023), mô hình nhớ đầu và cuối context, dễ bỏ qua phần giữa, chất đống nội dung mù quáng ngược lại làm chỉ dẫn quan trọng bị chìm ngập
8. **Sự khác biệt bản chất giữa progressive disclosure và RAG?** → Tính chất nội dung khác nhau: Skill routing là tập hợp chỉ dẫn có cấu trúc hữu hạn, yêu cầu độ chính xác cao hơn, chọn sai sẽ làm sai toàn bộ chain; RAG là external knowledge base, recall thêm vài tài liệu còn có mức dung sai
9. **Thiết kế Skill routing module như thế nào?** → Embedding model vector index → top-5 candidates → cross-encoder rerank → confidence threshold fallback
10. **Phép tương tự giữa progressive disclosure và database index?** → Đều dùng cấu trúc phụ trợ nhẹ để pre-filter, thu hẹp phạm vi rồi lấy dữ liệu đầy đủ; instruction dispatcher = registry + routing engine + loader + context assembler
11. **Semantic matching dưới high concurrency chịu được không?** → Query vector hóa cache + NumPy in-memory retrieval (vài chục Skill không cần FAISS) + stateless routing service scale ngang
12. **Skills có những hạn chế gì?** → Pure reasoning Skill thiếu execution capability, Skills bên thứ ba có rủi ro bảo mật (prompt injection, data leakage), mô hình tự chủ phán đoán có thể trigger nhầm hoặc bỏ trigger

**Chuẩn bị câu hỏi follow-up**:

- Đội nhóm bạn dùng những Skills nào? Tổ chức như thế nào?
- Làm thế nào để đánh giá chất lượng của một Skill?
- Skills kết hợp với MCP như thế nào?
- Làm thế nào để tránh vấn đề context pollution của Skills?
- Khi context không đủ chứa thì xử lý như thế nào? "Skill liên quan" được phán đoán như thế nào — keyword matching hay semantic matching?
- Semantic matching có vấn đề (load nhầm hoặc bỏ load) thì fallback như thế nào?
- Tỷ lệ signal/noise của context được đánh giá định lượng như thế nào? Context tinh giản vs context đầy đủ so sánh như thế nào?
- RAG retrieve được rồi nhưng generation đi lạc, root cause ở đâu? Làm thế nào để tối ưu chunking strategy và cách ghép?
- Phân tầng tải dưới high concurrency có performance bottleneck không? Embedding model call latency kiểm soát như thế nào?
- Rủi ro bảo mật của Skills bên thứ ba đánh giá như thế nào? Làm thế nào để phòng chống prompt injection?
