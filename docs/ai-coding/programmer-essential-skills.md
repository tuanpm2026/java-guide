---
title: Giới thiệu Skills thiết yếu cho lập trình AI: TDD, Code Review và tự động hóa web thực chiến
description: Chia sẻ thực chiến 6 công cụ Skills lập trình AI, bao gồm quy trình phát triển TDD, code review, thiết kế UI, tự động hóa web và phát triển Skill, giúp AI coding Agent thực sự trở thành công cụ tăng năng suất.
category: Thực chiến lập trình AI
head:
  - - meta
    - name: keywords
      content: AI编程,Skills,Superpowers,Claude Code,Cursor,代码审查,TDD,UI设计,网页自动化
---

<!-- @include: @article-header.snippet.md -->

Trước đây tôi đã viết một bài [giải thích toàn diện Agent Skills](/ai/agent/skills.html), nói về Skills là gì, dùng như thế nào, và khác Prompt / MCP ở điểm nào. Bài này không nói khái niệm, trực tiếp chia sẻ 6 Skills tôi sử dụng hàng ngày, bao gồm các tình huống phát triển, code review, thiết kế UI, thao tác web:

- Để AI tự động tuân theo quy trình TDD, viết test trước rồi mới viết implementation
- Tạo design system đạt tiêu chuẩn ngành bằng một click
- Review code đa chiều chuyên nghiệp (SOLID, bảo mật, hiệu năng)
- Giải quyết vấn đề "mất trí nhớ" ngữ cảnh bị suy giảm sau khi AI chat quá lâu
- Trang bị cho AI khả năng duyệt web và tự động hóa thao tác đầy đủ

Dưới đây xem từng cái một.

## Superpowers

Superpowers là một framework quy trình phát triển phần mềm được thiết kế dành riêng cho AI coding Agent (Claude Code, Cursor, v.v.), đóng gói TDD, Code Review, Spec-Driven, Git Worktree, cộng tác sub-Agent và các thực hành khác thành Skills. Các kỹ năng cốt lõi tích hợp sẵn như sau:

| Tên kỹ năng                        | Cách kích hoạt                           | Chức năng cốt lõi                                                                                                                                                    |
| ---------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **brainstorming**                  | Lệnh `/superpowers:brainstorm`           | Giúp bạn làm rõ yêu cầu qua hỏi đáp kiểu Socrates, xuất tài liệu thiết kế                                                                                            |
| **using-git-worktrees**            | Tự động (sau khi thiết kế xong)          | Tạo nhánh git worktree cô lập, tránh ảnh hưởng nhánh chính                                                                                                           |
| **writing-plans**                  | Tự động (sau khi thiết kế xong)          | Phân tách thiết kế thành các nhiệm vụ nhỏ có thể thực thi (mỗi nhiệm vụ 2-5 phút), bao gồm đường dẫn file, code snippet và các bước xác minh                         |
| **executing-plans**                | Tự động (tùy chọn khi thực thi kế hoạch) | Thực thi hàng loạt kế hoạch nhiệm vụ, phù hợp với các nhiệm vụ lặp lại nhiều, logic đơn giản                                                                         |
| **test-driven-development**        | Tự động (giai đoạn triển khai code)      | Bắt buộc vòng lặp đỏ-xanh-tái cấu trúc, tất cả code phải viết test trước rồi mới viết implementation                                                                 |
| **subagent-driven-development**    | Tự động (tùy chọn khi thực thi kế hoạch) | Phân công một sub-agent mới cho mỗi nhiệm vụ, sau khi hoàn thành tự động review hai giai đoạn (trước kiểm tra có phù hợp với thiết kế, sau đánh giá chất lượng code) |
| **code-review**                    | Tự động (sau khi nhiệm vụ hoàn thành)    | Review code hai giai đoạn, kiểm soát chất lượng sau khi code hoàn thành                                                                                              |
| **systematic-debugging**           | Kích hoạt khi cần                        | Debug hệ thống hóa, điều tra nguyên nhân gốc rễ bốn giai đoạn                                                                                                        |
| **verification-before-completion** | Tự động (khi tuyên bố hoàn thành)        | Xác minh bắt buộc, không có bằng chứng không thể nói hoàn thành                                                                                                      |

Những kỹ năng này không tồn tại độc lập, chúng sẽ được nối thành một quy trình làm việc hoàn chỉnh.

Hiện tại Superpowers hỗ trợ Claude Code, Cursor, Codex, OpenCode và các nền tảng AI coding chính, sau khi cài đặt có thể tự động kích hoạt. Đây lấy Claude Code làm ví dụ.

Nếu máy bạn chưa cài Claude Code, chỉ cần chạy lệnh sau để cài đặt (Node.js 18+):

```bash
npm install -g @anthropic-ai/claude-code
```

Trong Claude Code, trước tiên cần đăng ký plugin marketplace:

```bash
/plugin marketplace add obra/superpowers-marketplace
```

Rồi cài đặt plugin từ plugin marketplace này:

```
/plugin install superpowers@superpowers-marketplace
```

Có ba tùy chọn tải xuống:

![Tải xuống Superpowers](https://oss.javaguide.cn/github/javaguide/ai/superpowers/superpowers-download.png)

| **Tùy chọn**                                         | **Phạm vi áp dụng**                                                                                        |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Install for you (user scope)**                     | **Có hiệu lực toàn cục**. Bạn mở Claude Code ở bất kỳ đâu trên máy đều có thể gọi.                         |
| **Install for all collaborators (project scope)**    | **Chung cho thành viên dự án**. Cấu hình sẽ ghi vào file dự án, đồng nghiệp pull code xong cũng dùng được. |
| **Install for you, in this repo only (local scope)** | **Chỉ trong thư mục hiện tại**. Chuyển thư mục khác là mất.                                                |

Ở đây khuyến nghị chọn **User Scope** cài đặt toàn cục. Vì "kỹ năng" của Superpowers là thông dụng, dù bạn viết nghiệp vụ Java hay script Python, bộ phương pháp luận này đều có thể dùng trong hầu hết các tình huống. Sau khi cài đặt toàn cục, bạn có thể gọi những năng lực này bất cứ lúc nào, không cần mày mò từng dự án.

Sau khi cài đặt xong, nhập `/plugin` hoặc `/plugin list` trong Claude Code, nếu thấy Superpowers xuất hiện trong danh sách thì nghĩa là cài đặt thành công.

Địa chỉ dự án: **https://github.com/obra/superpowers**

## Everything Claude Code

Nhiều người dùng Claude Code như hộp chat. Có một nhà phát triển đã dùng nó để hoàn thành một sản phẩm trong 8 giờ, giành chức vô địch hackathon của Anthropic.

Anh ta đã mã nguồn mở bộ cấu hình này, trên Github đã đạt gần 4 vạn Star: Everything Claude Code.

Nó phân tách quy trình phát triển thành nhiều component, để AI phân công cộng tác ở các vai trò khác nhau:

| Loại component | Mô tả chức năng                                                                        |
| -------------- | -------------------------------------------------------------------------------------- |
| **Agents**     | Sub-agent phân công, ví dụ lập kế hoạch, kiến trúc, TDD, code review                   |
| **Skills**     | Workflow được đóng gói, như phương pháp luận TDD, kinh nghiệm phát triển backend       |
| **Hooks**      | Nhiệm vụ tự động thực thi, sau khi sửa code tự động kiểm tra có để lại debug log không |
| **Rules**      | Quy chuẩn phát triển có hiệu lực toàn cục                                              |
| **Commands**   | Slash command, `/tdd` chạy test, `/code-review` review code                            |

Trong thử nghiệm thực chiến, bộ giải pháp này giúp tốc độ phát triển tính năng tăng 65%. Số vấn đề được phát hiện trong code review giảm 75%, số vấn đề trung bình trong PR giảm từ 12 xuống còn 3.

Nhưng vấn đề thực tế hơn mà nó giải quyết là: **ngữ cảnh bị suy giảm**.

AI chat quá lâu sẽ "mất trí nhớ", chất lượng đầu ra giảm. Bộ cấu hình này giúp AI luôn làm việc trong khung vai trò rõ ràng, duy trì đầu ra ổn định. Mỗi Agent chỉ chịu trách nhiệm lĩnh vực mình giỏi, không vượt ranh giới; mỗi Skill đều có điều kiện kích hoạt và các bước thực thi rõ ràng, không làm lộn xộn.

Địa chỉ dự án: **https://github.com/affaan-m/everything-claude-code**

## UI UX Pro Max

Đây là Skill thiết kế UI/UX thông minh chuyên nghiệp được thiết kế dành riêng cho AI coding Agent (Claude Code, Cursor, Windsurf, v.v.).

Năng lực cốt lõi của nó là **tạo design system hoàn chỉnh bằng một click** (Design System), tự động đưa ra quyết định thiết kế dựa trên loại sản phẩm và đặc tính ngành.

v2.0 bổ sung **Design System Generator**, có thể tự động xuất một bộ design system hoàn chỉnh trong vài giây dựa trên loại sản phẩm, đặc tính ngành, đối tượng mục tiêu.

Cơ sở kiến thức thiết kế tích hợp sẵn của kỹ năng này:

| Loại tài nguyên       | Số lượng | Mô tả                                                                               |
| --------------------- | -------- | ----------------------------------------------------------------------------------- |
| **Phong cách UI**     | 67 loại  | Glassmorphism, Neumorphism, Bento Grid, AI-Native UI, v.v.                          |
| **Bảng màu ngành**    | 161 cái  | Mỗi ngành có phương án màu sắc riêng, tất cả kèm giải thích giá trị màu             |
| **Phối chữ**          | 57 loại  | Tổ hợp font được tuyển chọn, kèm link Google Fonts                                  |
| **Quy tắc suy luận**  | 161 điều | Quy tắc tạo design system đặc thù ngành                                             |
| **Nguyên tắc UX**     | 99 điều  | Best practice, anti-pattern và quy tắc accessibility                                |
| **Tech stack hỗ trợ** | 13 loại  | React/Next.js + shadcn/ui, Vue/Nuxt, Tailwind, SwiftUI, Flutter, React Native, v.v. |

**Nó hoạt động như thế nào?**

Khi bạn nhập "giúp tôi làm landing page cho spa làm đẹp", nó sẽ không tùy tiện đưa cho bạn một bộ gradient tím, mà sẽ suy luận ra: đây là ngành sức khỏe dưỡng sinh → đề xuất phong cách Soft UI nhẹ nhàng → phối màu hồng nhạt + xanh xô thơm + điểm nhấn vàng → font chọn Cormorant Garamond thanh lịch, đồng thời liệt kê anti-pattern mà ngành đó nên tránh (ví dụ không dùng gradient tím hồng đậm chất AI).

Cách cài đặt rất đơn giản:

**Claude Code (khuyến nghị)**:

```
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

**Cursor / Windsurf / Continue, v.v.**: Dùng CLI chính thức

```bash
npm install -g uipro-cli
uipro init --ai claude      # hoặc cursor, windsurf, v.v.
```

Sau khi cài đặt, chỉ cần mô tả yêu cầu UI bằng ngôn ngữ tự nhiên, kỹ năng sẽ tự động kích hoạt:

```
Giúp tôi làm landing page cho sản phẩm SaaS
Thiết kế dashboard phân tích y tế
Làm app tài chính dark theme
```

Nó còn tự động tạo Pre-delivery Checklist, đảm bảo các chi tiết chuyên nghiệp như không dùng emoji làm icon, trạng thái hover đầy đủ, reduced-motion được tôn trọng, v.v.

Địa chỉ dự án: **https://github.com/nextlevelbuilder/ui-ux-pro-max-skill**

Nếu bạn cảm thấy UI UX Pro Max quá nặng, chỉ cần hướng dẫn thiết kế frontend nhẹ nhàng, có thể thử **frontend-design** Skill chính thức của Anthropic. Nó tập trung vào việc tránh thẩm mỹ "đơn điệu" do AI tạo ra — từ chối font phổ biến như Inter/Roboto, từ chối phối màu sáo mòn như gradient tím trắng, khuyến khích typography táo bạo và bố cục phi thông thường. Không có cơ sở kiến thức thiết kế đầy đủ như UI UX Pro Max, nhưng ưu điểm là nhẹ nhàng, phù hợp với các tình huống không có yêu cầu thiết kế phức tạp.

## sanyuan-skills

Đây là bộ kỹ năng Claude Code hướng môi trường sản xuất, đóng gói kinh nghiệm code review của kỹ sư kỳ cựu thành Skill, để AI review code từ nhiều chiều chuyên nghiệp.

Bộ collection hiện chứa ba kỹ năng cốt lõi:

| Tên kỹ năng            | Chức năng cốt lõi                                                                                           | Tình huống áp dụng                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Code Review Expert** | Code review cấp kỹ sư kỳ cựu, bao gồm nguyên tắc SOLID, bảo mật, hiệu năng, xử lý lỗi, điều kiện biên, v.v. | Kiểm soát chất lượng trước khi submit code |
| **Sigma**              | Gia sư AI 1-1 dựa trên lý thuyết học thành thạo 2-Sigma của Bloom, dùng hỏi đáp kiểu Socrates               | Học công nghệ mới, hiểu sâu một khái niệm  |
| **Skill Forge**        | Meta-skill, dùng để tạo Skill chất lượng cao, tích hợp sẵn 12 kỹ thuật đã được kiểm chứng qua thực chiến    | Điểm khởi đầu khi muốn tự phát triển Skill |

**Các chiều review của Code Review Expert:**

- **Nguyên tắc SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, v.v.
- **Bảo mật**: SQL injection, XSS, rò rỉ thông tin nhạy cảm, v.v.
- **Hiệu năng**: Độ phức tạp thuật toán, memory leak, vòng lặp không cần thiết, v.v.
- **Xử lý lỗi**: Bắt exception, điều kiện biên, xử lý null, v.v.
- **Chất lượng code**: Quy chuẩn đặt tên, comment, khả năng đọc hiểu, v.v.

Cài đặt bằng lệnh npx:

```bash
# Cài đặt chuyên gia code review
npx skills add sanyuan0704/sanyuan-skills --path skills/code-review-expert

# Cài đặt gia sư Sigma
npx skills add sanyuan0704/sanyuan-skills --path skills/sigma

# Cài đặt Skill Forge
npx skills add sanyuan0704/sanyuan-skills --path skills/skill-forge
```

Sau khi cài đặt, gọi trực tiếp trong Claude Code:

```
/code-review-expert    # Review git changes hiện tại
/sigma <chủ đề>        # Bắt đầu hỗ trợ học, như /sigma React Hooks
/skill-forge           # Tạo kỹ năng mới
```

Địa chỉ dự án: **https://github.com/sanyuan0704/sanyuan-skills**

## Web Access

Claude Code có sẵn WebSearch và WebFetch, nhưng thiếu chiến lược biên soạn và khả năng tự động hóa trình duyệt. Skill này bổ sung phần đó — giúp Claude Code có thể tự duyệt web, thao tác trang động, và tích lũy kinh nghiệm trang web xuyên phiên.

| Năng lực                       | Mô tả                                                                                                                                          |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tự động chọn công cụ**       | Tự động chọn WebSearch / WebFetch / curl / Jina / CDP theo tình huống, có thể kết hợp tự do                                                    |
| **Thao tác trình duyệt CDP**   | Kết nối trực tiếp Chrome đang dùng hàng ngày, tự nhiên mang theo trạng thái đăng nhập; hỗ trợ trang động, thao tác tương tác, chụp frame video |
| **Xử lý song song phân chia**  | Phân công sub-Agent xử lý nhiều mục tiêu song song, chia sẻ một Proxy, cô lập ở cấp Tab                                                        |
| **Tích lũy kinh nghiệm trang** | Lưu trữ kinh nghiệm thao tác theo tên miền (quy luật URL, đặc điểm nền tảng, điểm đã biết), tái sử dụng xuyên phiên                            |
| **Trích xuất media**           | Trích xuất trực tiếp URL ảnh/video từ DOM, hoặc chụp và phân tích frame video tại thời điểm bất kỳ                                             |

v2.4.1 đã migrate script từ bash sang Node.js, hỗ trợ Windows / Linux / macOS. Còn bổ sung khả năng xuyên DOM boundary, có thể xử lý Shadow DOM, iframe và các element mà selector không thể đến được.

Cách cài đặt:

```bash
git clone https://github.com/eze-is/web-access ~/.claude/skills/web-access
```

Điều kiện tiên quyết: Node.js 22+, Chrome cần bật remote debugging (trong `chrome://inspect/#remote-debugging` tích "Allow remote debugging for this browser instance").

Sau khi cài đặt có thể dùng ngôn ngữ tự nhiên để điều khiển trực tiếp:

```
Tìm kiếm những tiến triển mới nhất về xxx
Giúp tôi tìm tài khoản xxx trên Xiaohongshu
Đồng thời nghiên cứu 5 trang web sản phẩm này, cho tôi một bản tóm tắt so sánh
```

Địa chỉ dự án: **https://github.com/eze-is/web-access**

## skill-creator

Đây là một meta-skill trong kho Skills chính thức của Anthropic, chuyên dùng để **tạo, sửa đổi và tối ưu Skill**.

Nó cung cấp một quy trình phát triển Skill:

| Giai đoạn             | Nội dung công việc                                                           |
| --------------------- | ---------------------------------------------------------------------------- |
| **Nắm bắt ý định**    | Hiểu bạn muốn Skill làm gì, xác định rõ ranh giới và mục tiêu                |
| **Soạn SKILL.md**     | Viết file chỉ thị cốt lõi của Skill, bao gồm frontmatter và nội dung chỉ thị |
| **Kiểm thử xác minh** | Tạo test case, chạy thử nghiệm so sánh (có Skill vs không có Skill)          |
| **Lặp tối ưu**        | Cải thiện liên tục chỉ thị dựa trên phản hồi kiểm thử                        |
| **Tối ưu mô tả**      | Tối ưu description của Skill, cải thiện độ chính xác kích hoạt               |

Nó còn tích hợp **hệ thống đánh giá**: tạo báo cáo đánh giá trực quan, so sánh sự khác biệt đầu ra giữa "dùng Skill" và "không dùng Skill", hỗ trợ lặp tối ưu nhiều vòng.

Phù hợp cho các nhà phát triển muốn tạo Skill chuyên dụng cho nhóm làm điểm khởi đầu.

Địa chỉ dự án: **https://github.com/anthropics/skills/tree/main/skills/skill-creator**

## Tổng kết

Tổng hợp theo tình huống để tiện chọn theo nhu cầu:

| Tình huống                      | Skill đề xuất                   | Giải thích ngắn gọn                                                      |
| ------------------------------- | ------------------------------- | ------------------------------------------------------------------------ |
| **Quy trình phát triển đầy đủ** | Superpowers                     | TDD + Code Review + kế hoạch tự động, cài xong dùng ngay                 |
| **Cộng tác nhiều vai trò**      | Everything Claude Code          | Sub-Agent phân công, giải quyết ngữ cảnh bị suy giảm                     |
| **Thiết kế UI**                 | UI UX Pro Max / frontend-design | Cái trước design system hoàn chỉnh, cái sau hướng dẫn thiết kế nhẹ nhàng |
| **Code review**                 | sanyuan-skills                  | SOLID + bảo mật + đa chiều hiệu năng                                     |
| **Duyệt và thao tác web**       | Web Access                      | CDP tự động hóa trình duyệt + tích lũy kinh nghiệm trang                 |
| **Tự tạo Skill**                | skill-creator                   | Công cụ phát triển Skill chính thức của Anthropic                        |

Không cần cài tất cả, chọn vài cái theo tình huống hàng ngày là đủ. Nếu mới bắt đầu tiếp xúc, khuyến nghị bắt đầu từ **Superpowers** và **sanyuan-skills** — cái trước quản lý quy trình phát triển, cái sau quản lý chất lượng code, bao gồm nhu cầu phát triển phổ biến nhất.
