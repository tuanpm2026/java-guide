---
title: Contribution Guidelines
description: Hướng dẫn đóng góp cho JavaGuide open source project, giải thích cách tham gia duy trì project, submit PR và quy trình đầy đủ để trở thành Contributor.
category: Giới thiệu project
icon: guide
---

Xin chào, tôi là Guide! Chào mừng đến với "open source lab" của JavaGuide.

Tham gia duy trì open source project không chỉ là một lần thực hành kỹ thuật, mà còn là một hành trình "kỹ thuật phản hồi cộng đồng".

Ở đây, mỗi dòng chữ và code của bạn sẽ được hàng chục triệu developer trên toàn cầu nhìn thấy.

## Tại sao tham gia duy trì JavaGuide?

Nhiều bạn cảm thấy threshold của open source community cao, thực ra không phải vậy. Lợi ích khi tham gia duy trì JavaGuide rất thiết thực:

1. **Học kiến thức sâu hơn**: Trong quá trình sửa lỗi hay hoàn thiện nội dung, bạn sẽ buộc mình phải "học xuyên thấu", loại ký ức này sâu sắc hơn nhiều so với thuộc lòng machine technical questions.
2. **Credibility endorsement**: JavaGuide đã gần 160k Star. Nếu `PR` của bạn được chấp nhận, tên bạn sẽ lưu vĩnh viễn trong danh sách `Contributor`. Trong phỏng vấn tìm việc, đây là một **"chứng minh thực hành open source"** rất có sức thuyết phục.
3. **Phần thưởng hiện vật**: Tôi sẽ định kỳ gửi tai nghe, mechanical keyboard và các peripheral khác cho những bạn đóng góp thường xuyên, thậm chí còn có cash incentive trực tiếp.

## Có thể đóng góp theo hướng nào?

Bạn có thể chọn đóng góp theo ba chiều sau tùy vào sức lực của mình:

- **Error correction (Beginner)**: Phát hiện lỗi chính tả, dấu câu sai hoặc code format lộn xộn trong tài liệu. Loại đóng góp này đơn giản nhất nhưng có ý nghĩa nhất.
- **Improvement (Intermediate)**: Tái cấu trúc câu trả lời interview question hiện có. Ví dụ một bài viết nào đó có logic đứt đoạn, hoặc thiếu phân tích về các tech features mới nhất.
- **New content (Expert)**: Dựa trên xu hướng phỏng vấn mới nhất của big company, thêm giải thích chi tiết về high-frequency interview questions mới hoặc phân tích sâu về các kiến thức hardcore.

## Làm thế nào để submit contribution mượt mà?

### Minimal Mode: Click "Edit this page" (3 minutes to get started)

Ở **góc dưới bên trái** của mỗi trang trên website có một nút **「Edit this page」**.

1. **Click to jump**: Trực tiếp vào GitHub online editing interface.
2. **Online modification**: Sửa nội dung trực tiếp trong browser, tiết kiệm phiền hà của `git clone`.
3. **Submit request**: Điền commit message, click submit sẽ tự động trigger `Pull Request`.

Cách này phù hợp nhất để sửa lỗi chính tả hoặc tối ưu nội dung quy mô nhỏ.

![](/images/github/javaguide/about/javaguide-contribution-edit-page.png)

### Advanced Mode: Fork + PR (Standard open source workflow)

Nếu bạn muốn thực hiện tái cấu trúc quy mô lớn hoặc thêm nội dung mới, khuyến nghị dùng standard GitHub workflow:

1. **Fork repository**: Click `Fork` ở góc trên bên phải của [main repository](https://github.com/Snailclimb/JavaGuide), copy một bản JavaGuide về account của bạn.
2. **Local development**: Bạn có thể clone project về local, tự do sửa đổi và viết nội dung local. Sau khi hoàn thành sửa đổi hay viết nội dung, submit vào forked repository là được.
3. **Initiate PR**: Sau khi submit, click `New Pull Request` để request merge thay đổi của bạn vào main branch của JavaGuide.

![](/images/github/javaguide/about/javaguide-contribution-pr.png)

Git skills rất quan trọng. Khuyến nghị nhất định phải thành thạo trước khi làm việc chính thức.

Tôi đã viết hai bài liên quan, khuyến nghị đọc:

- [Git Core Concepts Summary](https://javaguide.cn/tools/git/git-intro.html)
- [Github Useful Tips Summary](https://javaguide.cn/tools/git/github-tips.html)

### Submit Issue để mở thảo luận

Nếu bạn phát hiện chỗ nào cần cải thiện nhưng tạm thời chưa có thời gian viết code, hoặc muốn đề xuất thêm một chủ đề mới, hãy trực tiếp mở thảo luận qua **Issue**.

Template được khuyến nghị:

> **Title**: Đề xuất thêm hướng dẫn so sánh và lựa chọn các giải pháp dual-write consistency của Redis và database
>
> **Content description**: Cache consistency là điểm khó và quan trọng cả trong phỏng vấn lẫn thực tế. Hiện tại tài liệu thiếu so sánh giải pháp có hệ thống. Đề xuất bổ sung:
>
> 1. **Solution comparison**: So sánh chi tiết ưu nhược điểm của các giải pháp như "update database then delete cache", "delayed double delete", "subscribe binlog async delete" v.v.
> 2. **Extreme scenario analysis**: Phân tích cách đảm bảo eventual consistency tối đa khi gặp master-slave delay hoặc network jitter.
>
> **Claim intention**: Tôi có nghiên cứu sâu về lĩnh vực này, đã tổng hợp một bảng so sánh và flow diagram, hy vọng đóng góp vào JavaGuide.

## Yêu cầu đóng góp

### Layout là năng suất đầu tiên

Giữa chữ và chữ số Latin phải có dấu cách, dấu câu phải chuẩn. Tham khảo (chọn đọc một bài):

- [Chinese Copywriting Guidelines](https://github.com/sparanoid/chinese-copywriting-guidelines)
- [Chinese Technical Documentation Writing Style Guide](https://github.com/yikeke/zh-style-guide/)
- [Chinese Copywriting Details - Dawner](https://dawner.top/posts/chinese-copywriting-rules/)
- [Chinese Layout Guide for Everyone - Zhihu](https://zhuanlan.zhihu.com/p/20506092)

### Original content

Bạn có thể tham khảo và học từ bài viết của người khác, nhưng **nhất định, nhất định, nhất định không copy-paste**!

Việc bạn cần làm không phải là "người vận chuyển thông tin", mà là "bộ lọc kiến thức". Diễn đạt bằng lời của mình, cố gắng viết dễ hiểu hơn người khác, làm nổi bật trọng điểm. **Cách biểu đạt "xuyên thấu" như vậy mới là trách nhiệm lớn nhất với độc giả.**

## Viết ở cuối

Open source không phải là cuộc chiến đơn độc của một người, mà là hành trình vươn lên của một nhóm người. **Chuẩn bị Java interview — lựa chọn đầu tiên là JavaGuide!** Mong chờ thấy tên bạn trong danh sách Contributor.
