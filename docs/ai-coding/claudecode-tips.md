---
title: Hướng dẫn sử dụng Claude Code - Cấu hình, Workflow và Kỹ thuật nâng cao
description: Tổng hợp từ tài liệu kỹ thuật của đội ngũ kỹ thuật Anthropic và kinh nghiệm thực chiến, hệ thống hóa cấu hình, mở rộng năng lực, workflow hiệu quả, kỹ thuật nâng cao và bí quyết thực chiến của Claude Code.
category: AI 编程实战
head:
  - - meta
    - name: keywords
      content: Claude Code,AI编程,CLAUDE.md,MCP,Skills,Sub-Agent,Agentic Coding,AI辅助开发
---

# Hướng dẫn sử dụng Claude Code

Trước đây tôi đã chia sẻ về [thực chiến IDEA kết hợp plugin Qoder](./idea-qoder-plugin.md), [thực chiến Trae tích hợp mô hình ngôn ngữ lớn](./trae-m2.7.md) và [thực chiến Claude Code tích hợp mô hình bên thứ ba](./cc-glm5.1.md), bài này đổi góc nhìn, bàn về **phương pháp và kỹ thuật sử dụng Claude Code**.

Bài hướng dẫn này được tổng hợp từ [tài liệu kỹ thuật của đội ngũ kỹ thuật chính thức Anthropic](https://www.anthropic.com/engineering/claude-code-best-practices), kết hợp kinh nghiệm thực chiến cá nhân của tôi. Bài viết dựa trên Claude Code v2.1.x (phiên bản hiện tại của tôi là v2.1.114), một số tính năng có thể thay đổi theo phiên bản cập nhật.

Claude Code là công cụ dòng lệnh do Anthropic phát triển, được thiết kế dành riêng cho **Agentic Coding (Lập trình có tác nhân)**. Khác với các plugin gợi ý code truyền thống (như Copilot), nó có thể tự đọc code, chạy lệnh, xem lỗi, rồi sửa lại, tạo thành một vòng khép kín hoàn chỉnh "hiểu ý định → lập kế hoạch → thực thi → sửa lỗi".

Triết lý thiết kế của nó là **"cố ý low-level và không áp đặt quan điểm"** — không bắt buộc bạn tuân theo quy trình cụ thể, chỉ cung cấp quyền truy cập mô hình nguyên thủy nhất, để bạn xây dựng workflow phát triển của riêng mình như lắp ghép lego.

Bài viết này tóm tắt các kỹ thuật sử dụng Claude Code từ năm khía cạnh: **cấu hình, mở rộng năng lực, workflow, kỹ thuật nâng cao** và **bí quyết thực chiến**. Sau khi đọc xong bạn sẽ nắm được:

1. ⭐ **CLAUDE.md viết như thế nào, đặt ở đâu**: Best practice về bốn cấp phạm vi, quản lý module hóa và cập nhật động
2. ⭐ **Làm thế nào để mở rộng ranh giới năng lực của Claude**: MCP, Skills, Sub-Agent, hệ thống plugin giải quyết vấn đề gì?
3. ⭐ **Những mô hình workflow nào thực dụng nhất**: Explore-Plan-Execute, TDD, đa instance cộng tác và trường hợp áp dụng của từng loại
4. ⭐ **Bí quyết cốt lõi quản lý context**: `/compact`, `/clear`, `/fork`, handoff document dùng khi nào
5. ⭐ **Làm thế nào để Claude tự xác thực công việc của mình**: Đây là thay đổi mang lại lợi ích cao nhất

Series Claude là mô hình lập trình mạnh nhất hiện nay, nhưng ngưỡng sử dụng và chi phí trong nước khá cao, còn có thể đối mặt với rủi ro bị khóa tài khoản. Trong nước thường dùng GLM và MiniMax như là thay thế. GLM, MiniMax và Kimi đều là những lựa chọn tốt, nhưng cần chuẩn bị tâm lý trước, hiệu suất lập trình vẫn còn khoảng cách so với Claude.

## I. Cấu hình cơ bản: Tùy chỉnh môi trường phát triển của bạn

### ⭐️ 1. File linh hồn: `CLAUDE.md`

Một câu: **`CLAUDE.md` là "tài liệu hướng dẫn dự án" của Claude Code, cũng là cấu hình có tỷ lệ đầu tư-lợi nhuận cao nhất trong tất cả các kỹ thuật.**

Claude khi khởi động sẽ tự động đọc file này, inject nội dung vào system prompt, trở thành background nền tảng trong quá trình suy nghĩ của nó. Mỗi quy tắc bạn viết vào đó đều đang định hình ranh giới hành vi của Claude.

**Nội dung cốt lõi**: Các lệnh Bash thường dùng, hàm công cụ cốt lõi, hướng dẫn phong cách code (như: dùng ES Modules thay vì CommonJS), lệnh test, quy tắc đặt tên branch, v.v.

**Chiến lược đặt file (Bốn cấp phạm vi)**:

| Phạm vi                         | Vị trí file                                                                                     | Mục đích                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Enterprise (Managed Policy)** | macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`, Linux: `/etc/claude-code/CLAUDE.md` | Yêu cầu bảo mật, tuân thủ cấp tổ chức, do IT admin cấu hình        |
| **Cấp dự án**                   | `./CLAUDE.md` hoặc `./.claude/CLAUDE.md`                                                        | Quy tắc chia sẻ đội nhóm, commit vào Git                           |
| **Cấp người dùng**              | `~/.claude/CLAUDE.md`                                                                           | Sở thích cá nhân, có hiệu lực với tất cả dự án                     |
| **Cấp local**                   | `./CLAUDE.local.md`                                                                             | Cấu hình riêng của cá nhân trong dự án này (thêm vào `.gitignore`) |

Tất cả cấp `CLAUDE.md` đều được tải vào context (**ghép nối chứ không thay thế**), khi quy tắc xung đột thì quy tắc phạm vi cụ thể hơn ưu tiên. `CLAUDE.md` trong thư mục con sẽ được tải theo nhu cầu khi Claude truy cập file trong thư mục đó, không inject toàn bộ cùng lúc. `CLAUDE.md` trong thư mục cha trên working directory thì được tải toàn bộ khi khởi động, điều này đặc biệt hữu ích cho monorepo, `root/CLAUDE.md` và `root/foo/CLAUDE.md` sẽ cùng có hiệu lực.

> **Lưu ý**: Enterprise (Managed Policy) là cấp duy nhất không tuân theo quy tắc "cụ thể hơn ưu tiên hơn", nó **không thể bị loại trừ bởi bất kỳ thiết lập cá nhân nào** (`claudeMdExcludes` không có hiệu lực với nó), đảm bảo chỉ dẫn cấp tổ chức luôn có hiệu lực.

**Khởi tạo**: Chạy `/init` trong thư mục root của dự án, Claude sẽ tự động phân tích codebase và tạo một `CLAUDE.md` ban đầu bao gồm build commands, hướng dẫn test và các convention của dự án. Nếu file đã tồn tại, nó sẽ đề xuất cải thiện thay vì ghi đè.

**Kỹ thuật cập nhật động**:

- Trong hội thoại, nhấn phím `#`, đưa cho Claude một chỉ dẫn, để nó tự động tóm tắt context hiện tại và ghi vào `CLAUDE.md`.
- Cách làm được khuyến nghị hơn: Mỗi lần sửa lỗi của Claude, thêm một câu "cập nhật CLAUDE.md, đảm bảo lần sau không mắc lỗi tương tự". Theo thời gian, `CLAUDE.md` sẽ trở thành một hệ thống quy tắc không ngừng tiến hóa.
- Cũng có thể chạy lệnh `/memory` để mở trực tiếp trong editor và chỉnh sửa.

**Giữ tinh gọn**: Phía chính thức khuyến nghị file `CLAUDE.md` đơn lẻ kiểm soát trong **200 dòng trở xuống**, vượt ngưỡng này sẽ tiêu thụ đáng kể context và giảm tỷ lệ tuân thủ quy tắc. Mỗi quy tắc nên tương ứng với một lỗi thực tế mà Claude đã từng mắc, nếu một chỉ dẫn xóa đi mà Claude vẫn có thể hoàn thành đúng thì hãy xóa thẳng. Khi file quá dài, có thể cân nhắc tách thành `.claude/rules/` hoặc dùng `@path` để reference.

Đối với các thao tác phải thực thi mỗi lần, không có ngoại lệ (như định dạng code), nên dùng Hooks để triển khai thay vì viết vào `CLAUDE.md`. Sự khác biệt bản chất của hai loại: Quy tắc trong CLAUDE.md mang tính **gợi ý** (Claude sẽ cố gắng tuân thủ nhưng không đảm bảo), còn Hooks mang tính **xác định** (script tự động thực thi tại điểm node cụ thể, không có ngoại lệ). Tiêu chuẩn phán đoán: Hỏi bản thân "hậu quả là gì nếu quy tắc này bị vi phạm một lần", hậu quả nghiêm trọng thì dùng Hooks.

> **Tiêu chuẩn tinh gọn**: Hỏi bản thân "không có dòng này Claude sẽ mắc lỗi gì". Không trả lời được thì xóa đi.

**Quản lý module hóa**: Nếu dự án phức tạp, có thể dùng cú pháp `@` import trong `CLAUDE.md` ở root để nhập các file khác. Root đặt tổng quan dự án và lệnh quick start, kiến trúc và quy tắc phát triển của từng submodule đặt riêng trong `.claude/CLAUDE.md` của từng submodule:

```
## Project Structure

my-project/
├── backend/  # Spring Boot backend
├── frontend/ # Vue 3 frontend
└── admin/    # Admin console

## Module Documentation

- **Backend**: See `@backend/.claude/CLAUDE.md` for architecture and conventions
- **Frontend**: See `@frontend/.claude/CLAUDE.md` for component structure
- **Admin**: See `@admin/.claude/CLAUDE.md` for setup and state management
```

### 2. Quản lý quyền và công cụ

Theo mặc định, Claude thực thi các thao tác nhạy cảm (như ghi file, Git commit) cần ủy quyền từng cái.

- **Whitelist hóa**: Dùng lệnh `/permissions` hoặc chỉnh sửa `.claude/settings.json`, thêm các thao tác tần suất cao mà bạn tin tưởng như `Edit`, `git commit` vào whitelist, giảm đáng kể các ngắt tương tác, đạt được "immersive coding".
- **Tích hợp GitHub**: Khuyến nghị mạnh mẽ cài đặt `gh` CLI. Claude có thể trực tiếp gọi nó để tạo PR, đọc Issue hoặc xử lý Code Review comments.

## II. Mở rộng năng lực: MCP, Skills và Hệ sinh thái Plugin

Claude Code không chỉ là một hộp hội thoại, nó kế thừa toàn bộ Shell environment của bạn. Chỉ có năng lực hội thoại là không đủ, phải lắp cho nó "hộp công cụ".

### ⭐️ 1. Model Context Protocol (MCP)

MCP là kênh chính để mở rộng năng lực của Claude, tương đương với việc lắp "cổng USB" cho Claude. Thông qua kết nối MCP server, bạn có thể giúp Claude có được:

- **Duyệt web** (như qua Puppeteer).
- **Truy vấn database** (như kết nối PostgreSQL hoặc MySQL).
- **Gọi third-party API** (như Sentry, Slack).
- **Chia sẻ cấp dự án**: Commit `.mcp.json` vào repository để các thành viên đội nhóm có thể dùng cùng bộ công cụ out-of-the-box.

MCP server hỗ trợ ba phạm vi cấu hình:

| Phạm vi        | Vị trí lưu trữ                          | Trường hợp áp dụng                                           |
| -------------- | --------------------------------------- | ------------------------------------------------------------ |
| **Local**      | `~/.claude.json` (dưới đường dẫn dự án) | Cấu hình thử nghiệm cá nhân, server chứa credential nhạy cảm |
| **Dự án**      | `.mcp.json` trong root dự án            | Chia sẻ đội nhóm, có thể commit vào version control          |
| **Người dùng** | `~/.claude.json`                        | Công cụ cá nhân tái sử dụng xuyên dự án                      |

Cách cài đặt MCP server được khuyến nghị là dùng HTTP transport:

```bash
# Kết nối remote MCP server
claude mcp add --transport http <name> <url>

# Ví dụ có authorization header
claude mcp add --transport http notion https://mcp.notion.com/mcp \
  --header "Authorization: Bearer your-token"
```

### 2. Slash commands tùy chỉnh

Đối với các tác vụ phức tạp lặp đi lặp lại, có thể tạo Markdown template trong thư mục `.claude/commands` để cố định thành lệnh.

- **Ví dụ**: Tạo một lệnh `/fix-issue $ARGUMENTS`.
- **Hiệu quả**: Nhập `/fix-issue 1024`, Claude tự động thực thi toàn bộ quy trình: `Xem Issue → Tìm code liên quan → Viết fix → Chạy test → Submit PR`.

### ⭐️ 3. Skills: Cố định lao động lặp lại thành kỹ năng

Nếu một việc bạn làm hai lần trong ngày, thì đáng để biến nó thành một Skill.

Một câu: **Skill là workflow đã được lưu lại, khi khởi động chỉ tải metadata (tên và mô tả, khoảng 100 Token), chỉ khi tác vụ khớp mới đọc chỉ dẫn đầy đủ.** Thiết kế "lazy loading" này đảm bảo năng lực có thể dùng mà không chiếm dụng context window.

- **Gọi thủ công**: Nhập `/skill-name` trong hộp hội thoại.
- **Tự động khám phá**: Claude tự khớp tác vụ hiện tại dựa trên mô tả của Skill và kích hoạt.

Skill được lưu ở `~/.claude/skills/` (cấp người dùng) hoặc `.claude/skills/` (cấp dự án). Một số Skills cộng đồng xuất sắc:

- **[Superpowers](https://github.com/obra/superpowers)**: TDD + Code Review + Tự động lập kế hoạch, đóng gói các best practice kỹ thuật phần mềm thành kỹ năng AI có thể thực thi (khuyến nghị cài đầu tiên).
- **[Everything Claude Code](https://github.com/affaan-m/everything-claude-code)**: Cấu hình vô địch hackathon Anthropic, đa Agent phân công cộng tác, giải quyết vấn đề context corruption.

**Khi nào dùng Skills vs CLAUDE.md**: Đơn giản mà nói, CLAUDE.md là "global context cần có mỗi lần", Skills là "chỉ dẫn tác vụ tải theo nhu cầu". Nếu một quy tắc chỉ cần trong tình huống cụ thể (như "tuân thủ những quy tắc này khi review API code"), đặt vào Skills hoặc `.claude/rules/`; nếu mỗi session đều cần Claude biết (như "dự án dùng ES Modules"), đặt vào CLAUDE.md.

### ⭐️ 4. Sub-Agent: Giữ cho hội thoại chính sạch sẽ

Khi Claude cần điều tra sâu một vấn đề, nó sẽ đọc nhiều file, tiêu thụ lớn context window. Sub-Agent (tác tử con) chính là để giải quyết vấn đề này: Để một Claude instance độc lập đi điều tra, nó có context độc lập riêng, sau khi hoàn thành chỉ báo cáo kết luận cho session chính.

Claude Code tích hợp sẵn vài loại tác tử con:

| Tác tử con          | Mô hình                     | Mục đích                                                 |
| ------------------- | --------------------------- | -------------------------------------------------------- |
| **Explore**         | Haiku (nhanh, latency thấp) | Khám phá file, tìm kiếm code, khám phá codebase          |
| **Plan**            | Kế thừa từ hội thoại chính  | Nghiên cứu codebase trong giai đoạn lập kế hoạch         |
| **General-purpose** | Kế thừa từ hội thoại chính  | Nghiên cứu phức tạp, thao tác nhiều bước, chỉnh sửa code |

Bạn cũng có thể tạo tác tử con tùy chỉnh trong `.claude/agents/` (cấp dự án) hoặc `~/.claude/agents/` (cấp người dùng), chỉ định system prompt riêng, quyền công cụ và mô hình sử dụng.

Cách dùng điển hình:

- **Cách ly thao tác tiêu thụ cao**: `Dùng sub-agent chạy test suite, chỉ báo cáo test thất bại và error message của chúng.`
- **Nghiên cứu song song**: `Dùng sub-agent riêng biệt nghiên cứu song song module authentication, database và API.`
- **Chain delegation**: `Dùng sub-agent code-reviewer để tìm performance issues, rồi dùng sub-agent optimizer để fix.`

### 5. Hệ thống Plugin (Plug-In)

Plugin là "app" của Claude Code — một plugin có thể đóng gói Skills, MCP server, tác tử con, hook và custom command, cài đặt một cú, chia sẻ một cú.

Cách cài đặt:

```bash
# Đăng ký plugin marketplace
/plugin marketplace add <owner>/<marketplace-repo>

# Cài đặt plugin
/plugin install <plugin-name>@<marketplace-name>
```

Cũng có thể dùng `--plugin-dir` để test plugin local trong giai đoạn phát triển.

## III. Mô hình thực chiến: Workflow hiệu quả

Sau khi nắm rõ cấu hình cơ bản và mở rộng năng lực, tiếp theo là cách kết hợp các năng lực này tạo thành workflow thực sự hiệu quả.

### ⭐️ 1. Explore-Plan-Execute

Phù hợp với các tình huống yêu cầu mơ hồ hoặc phức tạp, cũng là workflow tôi cá nhân khuyến nghị nhất.

- **Explore**: Để Claude đọc file, log hoặc URL, nói rõ với nó "đọc trước, chưa cần viết code".
- **Plan**: Vào Plan Mode, để Claude output kế hoạch triển khai chi tiết: file nào cần thay đổi, thứ tự thay đổi, những cạm bẫy có thể gặp. Tác vụ phức tạp nghiêm cấm bắt tay vào làm ngay.
- **Code**: Sau khi bạn xác nhận kế hoạch không có vấn đề, mới để nó bắt tay triển khai.
- **Verify**: Để nó tự chạy test hoặc kiểm tra code.

**Cách làm nâng cao**: Một Claude viết kế hoạch, rồi khởi một Claude khác với tư cách senior engineer để review kế hoạch đó. Kế hoạch qua được mới bắt đầu viết code. Đầu tư 10 phút vào kế hoạch, tiết kiệm 2 tiếng refactor sau đó.

> Suy nghĩ rõ ràng trước khi bắt tay, luôn là cách hiệu quả nhất.

### 2. Test-Driven Development (TDD)

Mô hình ổn định nhất, ít ảo giác nhất trong lập trình AI.

- **Viết test**: Để Claude viết test case dựa trên yêu cầu (chưa viết implementation code lúc này).
- **Red light**: Chạy test, xác nhận fail (đảm bảo test có hiệu lực).
- **Green light**: Để Claude viết code cho đến khi test pass.
- **Refactor**: Dưới sự bảo vệ của test, để Claude tối ưu cấu trúc code.

Cũng có thể dùng parallel Session để làm TDD: Session A viết test trước, Session B viết code để test pass.

### 3. Visual Iteration (Lặp lại trực quan)

Phù hợp với frontend development.

1. **Feed**: Chụp screenshot, kéo thả design file vào Claude.
2. **Implement**: Để Claude viết code.
3. **Feedback**: Chụp screenshot kết quả chạy gửi lại cho Claude, để nó so sánh sự khác biệt và sửa.

Cách làm nâng cao hơn: Để Claude sau khi triển khai design file, tự chụp screenshot so sánh với hình gốc, liệt kê các điểm khác biệt và tự sửa — tạo thành một vòng tự sửa lỗi tự động.

### 4. Hỏi đáp codebase

Công cụ thần thánh khi mới vào hoặc tiếp nhận codebase không quen thuộc. Claude sẽ tự tìm kiếm, đọc file và tóm tắt câu trả lời, giảm đáng kể gánh nặng nhận thức.

- "Hệ thống log hoạt động như thế nào?"
- "Hàm `Async` ở dòng 134 này làm gì?"
- "Quy trình đầy đủ của user login là gì, từ request đầu tiên đến khi session được thiết lập?"

Đây là những câu hỏi bạn vốn phải hỏi nhân viên cũ, Claude trả lời không kém, lại không ngại bạn hỏi nhiều.

### 5. Tự động hóa Git/GitHub

Để Claude trở thành Release Manager của bạn.

- "Phân tích những thay đổi vừa rồi, viết một Commit Message."
- "Xem Issue #123, phân tích nguyên nhân và fix, rồi submit một PR."
- "Giải quyết Rebase conflict này."
- **Cộng tác PR**: Comment `@claude` trong PR comment trên GitHub có thể trigger Claude Code phản hồi trong CI, thực thi code review, gợi ý fix, v.v.

### ⭐️ 6. Multi-instance collaboration (Đa instance cộng tác)

Đừng để một Claude xử lý tất cả mọi thứ — **đây là một trong những đòn bẩy hiệu quả lớn nhất**. Nguyên tắc cốt lõi là "đừng chờ AI, hãy để AI chờ bạn": Đẩy các tác vụ tốn thời gian ra background, bạn chỉ cần đưa ra quyết định với tư cách "chief architect".

- **Vai trò AB**: Một cái viết code, cái kia trong terminal độc lập chịu trách nhiệm review hoặc viết test.
- **Git Worktrees**: Checkout các branch khác nhau trong các thư mục khác nhau, đồng thời mở nhiều instance Claude xử lý các Feature không liên quan, không ảnh hưởng lẫn nhau. Đặt Shell alias (`za`, `zb`, `zc`) để chuyển đổi nhanh.
- **Lệnh `/batch`**: Nhập một tác vụ lớn, Claude tự động tách thành nhiều Unit độc lập, tạo Worktree độc lập cho mỗi cái, xử lý song song rồi merge. Ví dụ:

```
/batch 1、Xóa giao diện watchlist, tối ưu quản lý prompt
2、Trích xuất watchlist thành component, K-line display thành component riêng
3、Tối ưu thiết kế lịch sử
```

### 7. `/simplify`: Ba Agent song song code review

Đây là lệnh dễ bị bỏ qua nhưng dùng một lần là không thể thiếu. `/simplify` sẽ khởi động song song ba review Agent, mỗi cái với góc nhìn khác nhau để đọc cùng một đoạn code:

- **Code Reuse Agent**: Xem có tái phát minh bánh xe không — phương pháp tool tự viết có phải đã có sẵn trong dự án không
- **Code Quality Agent**: Xem thiết kế có vấn đề gì không — hardcode, class nên tách mà không tách, logic dư thừa
- **Efficiency Agent**: Xem hiệu suất có ẩn họa gì không — tạo object lặp lại trong loop, concurrent container không cần thiết, kết quả nên cache mà tính lại mỗi lần

Khi không có tham số review incremental changes của `git diff` (khi working directory sạch thì review commit gần nhất); cũng có thể chỉ định tên class cụ thể để full review:

```bash
/simplify                           # Review current changes
/simplify thread safety             # Chỉ định hướng chú ý
/simplify MarketDataService         # Review class cụ thể
```

Giá trị lớn nhất của nó là có thể phát hiện các vấn đề đòi hỏi **domain knowledge** — `@Transactional` invalid do Spring proxy, batch behavior của MyBatis, edge case của Redis distributed lock. Đây là những thứ mà các công cụ rule matching như SonarQube bắt không được.

Nhưng nó không làm full scan toàn dự án, cũng không quan tâm đến code style (đó là việc của formatter). Refactor cấp kiến trúc nó chỉ đề xuất, không chủ động thực thi.

> Một câu: **Trước khi submit PR chạy một lần `/simplify`, chi phí thấp nhưng lợi ích có thể rất cao.**

### 8. `/loop`: Lặp lại tự chủ và lập lịch định kỳ

Người sáng lập Claude Code Boris Cherny đã nhiều lần công khai khuyến nghị lệnh này. Nó giải quyết hai loại việc phiền phức:

**Lập lịch định kỳ (Chế độ Cron)** — Nói cho nó biết làm gì, bao lâu làm một lần, đến giờ tự chạy:

```bash
/loop 30m /review                              # Mỗi 30 phút chạy một lần code review
/loop 1h "Chạy unit test, xem có cái nào fail không"    # Kiểm tra test mỗi giờ
/loop 5m "Kiểm tra trạng thái PR đang mở trên GitHub"   # Xem PR status mỗi 5 phút
```

**Lặp lại tự chủ (Agentic Loop)** — Đưa cho nó một mục tiêu, nó tự lập kế hoạch, thực thi, xác thực, sửa lỗi, lặp lại cho đến khi hoàn thành. Ở chế độ thông thường Claude viết xong code là giao cho bạn, báo lỗi bạn phải tự dán lại; ở chế độ `/loop` nó tự đọc báo lỗi, tự sửa, tự chạy lại, không cần bạn theo dõi:

```bash
/loop "Fix tất cả unit test fail trong module auth, cho đến khi tất cả pass"
/loop "Migrate tất cả component trong src/legacy sang Tailwind CSS, đảm bảo page render bình thường"
```

Cần lưu ý: `/loop` là cách dùng khá tốn Token, chỉ dẫn nên cụ thể nhất có thể, tiêu chuẩn hoàn thành phải rõ ràng. Task lặp lại tự động expire sau 7 ngày, và chỉ có hiệu lực trong session hiện tại, tắt terminal là mất. Khuyến nghị thêm giới hạn trong chỉ dẫn (như "tối đa thử 10 lần"), tránh vòng lặp vô hạn.

> Một workflow kết hợp hiệu quả: `/loop` tự động hoàn thành tác vụ → `/simplify` làm code cleanup → `/review` làm security review. Ba bước như vậy về cơ bản không cần bạn can thiệp.

### 9. Đồng bộ xuyên thiết bị (Teleport)

Mệt viết trong terminal? Tính năng `--teleport` giúp bạn kéo session Claude Code phiên bản web về local terminal một cú, bao gồm lịch sử hội thoại đầy đủ và trạng thái branch. Chạy `claude --teleport` trong terminal để xem danh sách web session của bạn, sau khi chọn tự động pull remote branch và khôi phục context. Ngược lại, nhập `/teleport` (hoặc `/tp`) trong session cũng có thể nhảy sang web end tiếp tục.

## IV. Kỹ thuật nâng cao: Tối ưu và Tự động hóa

Sau khi cấu hình cơ bản và workflow đã xong, tiếp theo là một số kỹ thuật nâng cao có thể nâng cao hơn nữa hiệu suất.

### 1. Non-interactive Mode (Chế độ không tương tác)

Tích hợp Claude vào script hoặc CI/CD.

- **Dùng**: `claude -p "prompt" --output-format stream-json`. Tài liệu chính thức hiện gọi nó là "non-interactive mode" (trước kia gọi là headless mode), nhưng chức năng không đổi.
- **Tình huống**: Tự động phân loại Issue, kiểm tra code style, tạo script migration dữ liệu quy mô lớn.
- **Thêm `--bare` để bỏ qua initialization**: Nếu không cần Hooks, Skills, MCP và các tính năng auto-discovery khác, thêm `--bare` có thể tăng đáng kể tốc độ khởi động.

### ⭐️ 2. Để Claude tự xác thực công việc của mình

**Đây là thay đổi mang lại lợi ích cao nhất.** Đừng chỉ nói "viết một hàm validate email", mà hãy nói:

```
Viết một hàm validate email. Test case: hello@gmail.com nên pass,
hello@ nên fail, @domain.com nên fail. Viết xong chạy test một lần và cho tôi biết kết quả.
```

Có tiêu chuẩn nghiệm thu cụ thể, Claude có thể tự chủ kiểm tra output, tiết kiệm cho bạn phần lớn việc kiểm tra thủ công.

Cách làm cao cấp hơn: Để Claude tự cho điểm câu trả lời của mình — "Dựa trên tiêu chuẩn thành công đã đặt, cho điểm output của bạn, liệt kê các điểm thiếu sót."

> Có tiêu chuẩn nghiệm thu, Claude mới chuyển từ "tôi nghĩ không có vấn đề" sang "test chứng minh không có vấn đề".

### 3. Kỹ thuật prompt phản trực giác

**① Để Claude review bạn**

Trước khi submit code: "Hãy đặt câu hỏi khắt khe nhất về những thay đổi này, cho đến khi tôi vượt qua bài test của bạn mới được mở PR." Đảo ngược vai trò, Claude trở thành Reviewer.

**② Để Claude viết lại một phiên bản thanh lịch hơn**

Phương án đầu tiên của Claude thường đã lấy đường tắt. Sau khi giải quyết xong hãy nói: "Bây giờ bạn đã biết tất cả background. Phá bỏ phương án này và làm lại từ đầu, cho tôi một triển khai thanh lịch." Thường sẽ nhận được câu trả lời tốt hơn lần đầu.

**③ Để Claude chứng minh**

Đừng chỉ thấy test xanh là tin: "Chứng minh cho tôi thấy thay đổi này có hiệu quả. Hiển thị sự khác biệt hành vi giữa branch main và branch feature của tôi."

### 4. Fix Bug: Vứt thẳng dữ liệu thô

Cách tốt nhất để fix Bug không phải mô tả bug thành văn bản để Claude đoán, mà là vứt thẳng dữ liệu thô cho nó và nói "fix". Cung cấp cho Claude thông tin thực tế (error log, Slack thread, Docker output), không phải mô tả của bạn về những thông tin đó. Cái trước cho phép Claude tự chủ truy vết, cái sau làm Claude đoán mò trong framework hiểu biết của bạn.

### 5. Checklist và bảng nháp

Đối với các tác vụ siêu dài (như refactor 100 file):

- Để Claude tạo một Markdown Checklist trước.
- Mỗi khi hoàn thành một mục, để nó tick một mục. Điều này hiệu quả ngăn "quên đang làm gì" do mất context.

### ⭐️ 6. Điều chỉnh hướng và quản lý context

Context window là tài nguyên đắt nhất của bạn, phần này nói về cách dùng tờ giấy trắng này hiệu quả hơn.

- **Ngắt kịp thời**: Nhấn `Esc` để ngắt quá trình thử sai của Claude, giữ nguyên context và định hướng lại. Một khi nó bắt đầu lệch hướng, dừng ngay lập tức.
- **Rollback lịch sử**: Nhấn `Esc` hai lần để mở menu checkpoint, có thể rollback code, hội thoại hoặc cả hai. Điểm lưu thậm chí được giữ lại sau khi bạn đóng terminal.
- **`/compact`**: Soft reset. Nén lịch sử hội thoại thành tóm tắt có cấu trúc, giữ lại thông tin quan trọng (ý định của bạn, file đã sửa, lỗi và giải pháp, việc cần làm), đồng thời tải lại `CLAUDE.md` và Auto Memory từ đĩa. Phù hợp khi context sắp đầy nhưng vẫn muốn tiếp tục tác vụ hiện tại.
- **`/clear`**: Hard reset. Xóa sạch hoàn toàn context, bắt đầu từ đầu. Phù hợp khi chủ đề đã bay đến năm hướng khác nhau, hoặc đã sửa hai lần cùng một lỗi Claude vẫn không đúng — đừng sửa lần thứ ba, xóa context, kết hợp kinh nghiệm đã học viết một starting prompt chính xác hơn, bắt đầu lại từ đầu.

- **`/fork`**: Rẽ nhánh hội thoại. Nhập `/fork` trong session hiện tại, sẽ tạo một hội thoại nhánh mới, bạn có thể tự do khám phá các phương án khác nhau trong nhánh mới mà không ảnh hưởng đến context của session gốc. Phù hợp với tình huống "tôi muốn thử cách triển khai khác".
- **Handoff Document (Tài liệu bàn giao)**: Trước khi `/clear`, để Claude ghi tiến độ hiện tại vào file `HANDOFF.md`, ghi lại đã làm gì, còn thiếu gì, đã vấp phải cạm bẫy nào. Sau khi xóa context, câu đầu tiên của session mới là "đọc HANDOFF.md, tiếp tục công việc trước đây". Hiệu quả hơn nhiều so với viết prompt từ đầu.

> **Nguyên tắc cốt lõi**: Cùng một vấn đề đã sửa hai lần mà vẫn không đúng, đừng sửa lần thứ ba nữa. Xóa context, viết một prompt tốt hơn và bắt đầu lại. Sau khi context bị nhiễm, tiếp tục sửa chỉ là lãng phí.

### 7. Xác thực im lặng ở nền

Cấu hình `Stop` hook, để Claude tự động chạy test hoặc công cụ format sau khi hoàn thành tác vụ, không cần bạn kiểm tra thủ công. Stop hook trigger khi main agent hoàn thành response, cũng có thể ngăn Claude kết thúc sớm bằng cách trả về `decision: "block"`, bắt buộc nó xác thực xong mới thu xếp. Cũng có thể cấu hình `PostToolUse` hook, để Claude tự động chạy công cụ format sau mỗi lần gọi công cụ, giải quyết vấn đề CI báo lỗi format code nhỏ.

### 8. Phím tắt và kỹ thuật hiệu quả

**Phím tắt input box:**

| Phím tắt                | Chức năng                                            |
| ----------------------- | ---------------------------------------------------- |
| `Ctrl + A` / `Ctrl + E` | Con trỏ nhảy đến đầu dòng / cuối dòng                |
| `Ctrl + W`              | Xóa từ trước đó                                      |
| `Ctrl + U` / `Ctrl + K` | Xóa tất cả nội dung trước / sau con trỏ              |
| `\` + `Enter`           | Nhập nhiều dòng (phù hợp viết prompt dài)            |
| `Ctrl + G`              | Mở external editor để viết prompt, lưu lại là submit |

**Phím tắt runtime:**

| Phím tắt    | Chức năng                               |
| ----------- | --------------------------------------- |
| `Esc`       | Ngắt thao tác hiện tại                  |
| `Esc` `Esc` | Mở menu checkpoint                      |
| `Ctrl + B`  | Chuyển thao tác đang chạy ra background |

**Lệnh thực dụng:**

- **`/copy`**: Nhanh chóng copy output lần cuối của Claude vào clipboard, tiết kiệm thao tác chọn copy thủ công.
- **Terminal alias**: Đặt alias trong Shell config file có thể giảm đáng kể lượng nhập. Khuyến nghị cấu hình: `alias c='claude'`, `alias cr='claude --resume'` (tiếp tục session trước), `alias cn='claude --new'` (session mới).
- **Kỹ thuật paste**: Gặp nội dung mà Claude không thể truy cập trực tiếp (như screenshot, đoạn tài liệu mã hóa), paste thẳng vào input box là được, Claude hỗ trợ multimodal input.

### 9. Tối ưu tải công cụ

Nếu bạn đã cài nhiều MCP server, startup sẽ chậm lại. Đặt `"ENABLE_TOOL_SEARCH": true` trong `.claude/settings.json`, Claude sẽ không tải toàn bộ mô tả công cụ khi startup, mà tìm kiếm và tải theo nhu cầu — chỉ tải công cụ liên quan đến tác vụ hiện tại. Khi số lượng công cụ nhiều lên, tối ưu này có thể giảm đáng kể Token consumption và thời gian startup.

### 10. Model stacking (Xếp chồng mô hình)

Trước khi mở Claude Code, dùng các mô hình ngôn ngữ lớn khác (như Gemini, GPT) để lập kế hoạch dự án, tạo high-level prompt. Chiến lược này còn có thể tiết kiệm Token ở plan mode.

## V. Bí quyết thực chiến: Kinh nghiệm cộng tác với AI

Ngoài bản thân công cụ, **cách giao tiếp với AI** quyết định giới hạn trên. Phần này là kinh nghiệm tôi tổng kết sau nhiều lần vấp ngã trong thực chiến, không nhất thiết mỗi điều đều phù hợp với bạn, nhưng mỗi điều đều có ít nhất một lần thực tế đổ vỡ đằng sau.

### 1. Nói tiếng Anh

- **Lý do:** Mặc dù Claude tiếng Trung rất tốt, nhưng trong ngữ cảnh lập trình tiếng Anh có tính xác định hơn. Ví dụ, "Modal" có thể giúp AI liên tưởng đến cài đặt component library cụ thể tốt hơn so với "popup".
- **Lợi ích:** Giảm đáng kể ảo giác, logic code chính xác hơn. Đây cũng là quá trình bắt buộc bản thân suy nghĩ lại yêu cầu lần hai.

### 2. Giới hạn phạm vi làm việc

- **Nguyên tắc**: Đừng cố gắng "một câu tạo ra full-stack app".
- **Cách làm**: Chỉ định rõ phạm vi sửa đổi (như "chỉ trong thư mục `/src/api`"). Tách tác vụ theo thứ tự "database -> backend logic -> frontend UI".
- **Tránh điều tra không biên giới**: Để Claude "điều tra" một việc gì đó mà không giới hạn phạm vi, nó sẽ đọc hàng trăm file làm đầy context. Giải pháp: Thu hẹp phạm vi điều tra, hoặc nói rõ "dùng sub-agent để điều tra".

### 3. Thông tin quá tải hơn là thông tin thiếu

- **Phản trực giác:** Prompt đừng quá ngắn.
- **Cách làm:** Dù là sửa đổi đơn giản, cũng cần nói cho nó:
  - File ở đâu?
  - Mục tiêu cuối cùng của sửa đổi là gì? (Ví dụ "để phù hợp với design style mới")
  - Component tham khảo là gì?
- **Nguyên lý:** Bản chất của mô hình ngôn ngữ lớn là dự đoán xác suất. Càng cung cấp nhiều thông tin liên quan (Context), liên tưởng của nó hội tụ càng hẹp, kết quả càng chính xác.

### 4. Cung cấp ví dụ "gold standard"

- **Nguyên lý:** AI bản chất là engine pattern completion cấp cao. Nó hoạt động tốt nhất khi "học theo", còn khi "sáng tạo từ đầu" thì dễ lệch style nhất.
- **Tình huống:** Giả sử bạn muốn phát triển một `OrderController` mới. Nếu không có tham khảo, AI có thể dùng `@Autowired` field injection lỗi thời, hoặc quên dùng class wrapper `Result<T>` thống nhất.
- **Cách làm:**
  - Đầu tiên tìm code hiện có viết tốt nhất trong dự án (như `UserController.java`).
  - Viết quy tắc dự án vào `CLAUDE.md` (như constructor injection, xử lý exception thống nhất, Swagger annotation style, v.v.), như vậy dù bạn không chỉ định file tham khảo thủ công, Claude cũng có thể tuân theo tiêu chuẩn nhất quán.
  - **Ví dụ prompt:** "Đọc `/src/main/java/.../UserController.java` và Service, DTO tương ứng. Tham khảo layered architecture, constructor injection pattern, xử lý exception thống nhất và cách viết Swagger annotation của nó, tạo code liên quan cho `OrderController` cho tôi."
- **Lợi ích:** Đảm bảo tính nhất quán cao độ về style giữa code mới và cũ.

### 5. Loại bỏ "AI look" trong style: Khóa tiêu chuẩn style và thiết kế Skill

- **Nguyên lý:** Nếu không có ràng buộc, trang do Claude tạo dễ xuất hiện "AI Look" điển hình — font Inter + gradient tím + rounded card đồng loạt, không có bản sắc.
- **Cách làm:**
  - Yêu cầu rõ ràng dùng Tailwind CSS hoặc component library cụ thể (như shadcn/ui, Ant Design).
  - Thêm từ khóa style vào prompt, ví dụ: "Dùng **Tailwind CSS**, style tham khảo **Linear** hoặc **Vercel**, phong cách minimalism, whitespace lớn, rounded rectangle và dark mode."
  - Có thể trực tiếp nói cho nó màu cụ thể (Primary Color), khoảng cách (Spacing) và font.
  - **Cài đặt frontend design Skill**: Cộng đồng đã có design Skill trưởng thành, có thể để Claude xác định hướng visual trước khi viết code, loại bỏ "AI look" từ gốc rễ:
    - **Anthropic official Frontend Design** (`claude plugin add anthropic/frontend-design`): Sản phẩm chính thức Anthropic, bắt buộc Claude xác định hướng visual trước khi coding, tích hợp quy tắc anti-pattern chặn các sáo rỗng như Inter + gradient tím, yêu cầu dùng hệ thống font kết hợp thực tế và CSS variable system.
    - **Web Designer Plugin** (`claude plugin add MickeyAlton33/web-designer`): Tinh chắt 48 design pattern từ 38 website thắng giải Awwwards, bao phủ typography system, color theory (5 prototype bảng màu), animation vocabulary, layout pattern và kỹ thuật 3D, kèm 10 ví dụ concept site hoàn chỉnh và danh sách anti-pattern "AI look".
- **Lợi ích:** Trang được tạo trực tiếp phù hợp với quy tắc visual dự án, vĩnh biệt "AI look" đồng loạt.

### 6. Ranh giới đỏ bảo mật và chế độ quyền

- **Cấm**: Đừng dùng `--dangerously-skip-permissions` để bỏ qua tất cả kiểm tra quyền, điều này tương đương với việc đưa chìa khóa nhà cho AI. Chế độ này không làm bất kỳ kiểm tra bảo mật nào, tất cả thao tác thực thi ngay lập tức, không có bất kỳ cơ chế dự phòng nào. Nguyên văn tài liệu chính thức: "bypassPermissions offers no protection against prompt injection or unintended actions."
- **Container isolation**: Nếu thực sự cần bỏ qua kiểm tra quyền (như chạy automation script), nhất định phải chạy trong môi trường cách ly như Docker container, giới hạn phạm vi truy cập file system, tránh gây tổn hại không thể phục hồi cho host.
- **Cách làm đúng**: Dùng `/permissions` kết hợp `.claude/settings.json` để quản lý whitelist quyền tinh tế, vừa cần hiệu quả vừa cần tuân thủ.

**Auto Mode (Khuyến nghị thay thế bypass mode)**

Nếu bạn thấy popup xác nhận thường xuyên quá phiền, phía chính thức hiện khuyến nghị dùng Auto Mode thay thế `--dangerously-skip-permissions`. Sự khác biệt cốt lõi của hai loại là: bypass mode không kiểm tra gì hết, Auto Mode có một mô hình classifier độc lập (dựa trên Sonnet 4.6) đang kiểm tra từng thao tác ở background — đọc file, sửa code những thao tác rủi ro thấp được auto pass, download và thực thi remote code, gửi dữ liệu nhạy cảm ra bên ngoài, push lên main branch những thao tác rủi ro cao sẽ bị chặn.

Cách bật:

```bash
# Bật qua command line
claude --enable-auto-mode

# Hoặc đặt mặc định trong settings.json
# ~/.claude/settings.json hoặc .claude/settings.local.json
```

```json
{
  "permissions": {
    "defaultMode": "auto"
  }
}
```

Sau khi bật, trong vòng xoay `Shift+Tab` sẽ có thêm tùy chọn `auto`, có thể chuyển đổi bất cứ lúc nào.

Logic kiểm tra của Auto Mode:

| Loại thao tác                                                  | Hành vi                            |
| -------------------------------------------------------------- | ---------------------------------- |
| Thao tác chỉ đọc (đọc file, tìm kiếm)                          | Tự động pass, không cần kiểm tra   |
| Chỉnh sửa file trong working directory                         | Classifier kiểm tra nhanh rồi pass |
| Cài dependency, build local                                    | Kiểm tra rồi pass                  |
| Download và thực thi remote code (`curl \| bash`)              | Chặn                               |
| Gửi dữ liệu nhạy cảm đến external endpoint                     | Chặn                               |
| Push lên main, force push                                      | Chặn                               |
| Sửa đổi `.git/`, `.claude/`, `.bashrc` và các path được bảo vệ | Luôn chặn (bảo vệ ở tất cả chế độ) |

Còn một số chi tiết thực dụng: Classifier liên tiếp chặn 3 lần hoặc tổng cộng chặn 20 lần, Auto Mode sẽ tự động tạm dừng, khôi phục xác nhận thủ công — ngăn Claude chạy theo hướng sai ngày càng xa. Thao tác bị chặn sẽ được ghi lại trong "Recently denied" của `/permissions`, nhấn `r` có thể retry.

> **Điều kiện tiên quyết**: Auto Mode hiện yêu cầu Claude Code v2.1.83+, gói Team/Enterprise/API, mô hình Sonnet 4.6 hoặc Opus 4.6, và phải kết nối trực tiếp qua Anthropic API (không hỗ trợ Bedrock, Vertex hoặc relay bên thứ ba). Gói Pro và Max chưa hỗ trợ.

## VI. Bảng tra cứu nhanh các failure mode phổ biến

| Failure mode             | Triệu chứng                                        | Giải pháp                                                                                         |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Kitchen sink session     | Chủ đề bay đến năm hướng, Claude bắt đầu nói nhảm  | Đổi tác vụ thì `/clear`                                                                           |
| Vòng lặp sửa lỗi         | Cùng một lỗi sửa hơn 3 lần                         | Xóa context, viết lại prompt                                                                      |
| CLAUDE.md phình to       | File quy tắc vượt 200 dòng, Claude bỏ qua chi tiết | Hỏi bản thân "không có dòng này sẽ mắc lỗi gì", xóa những cái thừa; hoặc tách ra `.claude/rules/` |
| Điều tra không biên giới | Claude đọc hàng trăm file, context cạn kiệt        | Xác định phạm vi điều tra, hoặc dùng sub-agent để cách ly                                         |
| Chỉ định quá mức         | Prompt quá ngắn, AI đoán ý định                    | Cung cấp thêm context, vị trí file, mục đích sửa đổi                                              |
| Tin tưởng mù quáng       | Test xanh là tin, không quan tâm hành vi thực tế   | Để Claude chứng minh, so sánh sự khác biệt hành vi giữa main và feature branch                    |

## Tổng kết

Nhìn lại các kết luận then chốt của toàn bài:

1. **Context window là tài nguyên đắt nhất của bạn** — Tất cả kỹ thuật về bản chất đều đang giúp bạn dùng tờ giấy trắng này hiệu quả hơn.
2. **Lập kế hoạch trước rồi mới thực thi** — Plan Mode là đầu tư cho thời gian sau đó.
3. **CLAUDE.md tự tiến hóa** — Chuyển đổi sửa lỗi thành quy tắc, để AI càng dùng càng thuận tay.
4. **Song song là đòn bẩy hiệu quả lớn nhất** — Đa instance + Worktree + Sub-agent.
5. **Xác thực hơn tin tưởng** — Đưa cho Claude tiêu chuẩn nghiệm thu, để nó tự kiểm tra.
6. **`/compact` hiệu quả hơn sửa đi sửa lại** — Sau khi context bị nhiễm, nén hoặc xóa và làm lại tốt hơn.
