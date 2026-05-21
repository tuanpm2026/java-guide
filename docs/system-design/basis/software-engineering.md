---
title: Hướng dẫn ngắn gọn về Software Engineering
description: Kiến thức cơ bản về software engineering, bao gồm khủng hoảng phần mềm, mô hình quy trình phát triển, waterfall model, agile development và các khái niệm cốt lõi.
category: System Design
head:
  - - meta
    - name: keywords
      content: software engineering,software crisis,software development process,waterfall model,agile development,requirements analysis,software lifecycle,engineering methodology
---

Hầu hết người làm phát triển phần mềm đều bỏ qua một số khái niệm cơ bản và nền tảng nhất trong phát triển phần mềm. Nhưng những khái niệm này lại vô cùng quan trọng — như nền móng của phát triển phần mềm vậy. Đó là lý do tôi viết bài này.

## Software Engineering là gì?

Năm 1968, NATO (Tổ chức Hiệp ước Bắc Đại Tây Dương) đưa ra thuật ngữ **Software Crisis** (Khủng hoảng phần mềm). Cùng năm đó, để giải quyết vấn đề khủng hoảng phần mềm, khái niệm "**Software Engineering**" ra đời. Một ngành học gọi là software engineering cũng được hình thành.

Theo thời gian, ngành software engineering đã trải qua nhiều vòng hoàn thiện, trong đó một số nội dung cốt lõi như mô hình phát triển phần mềm ngày càng phong phú và thực dụng hơn!

**Software Crisis là gì?**

Nói đơn giản, software crisis mô tả một điểm đau của việc phát triển phần mềm thời đó: chúng ta rất khó phát triển hiệu quả phần mềm có chất lượng cao.

Dijkstra (tác giả thuật toán Dijkstra) cũng đề cập đến software crisis trong bài phát biểu nhận giải Turing năm 1972, ông nói: "Nguyên nhân chính dẫn đến khủng hoảng phần mềm là máy móc đã trở nên mạnh hơn nhiều bậc! Thật ra, nếu không có máy tính thì lập trình sẽ hoàn toàn không có vấn đề gì. Khi chúng ta có những chiếc máy tính yếu, lập trình là vấn đề nhẹ nhàng. Còn bây giờ chúng ta có những máy tính khổng lồ, lập trình cũng trở thành vấn đề khổng lồ".

**Nói nhiều vậy, rốt cuộc software engineering là gì?**

Engineering (kỹ thuật/công nghệ) là việc áp dụng lý thuyết vào thực tiễn để giải quyết các vấn đề thực tế. Software engineering là việc áp dụng tư duy kỹ thuật vào phát triển phần mềm.

Trên đây là định nghĩa của tôi về software engineering. Chúng ta cũng xem định nghĩa chính thống hơn. IEEE Transactions on Software Engineering định nghĩa như sau: (1) Áp dụng phương pháp có hệ thống, chuẩn hóa, định lượng vào phát triển, vận hành và bảo trì phần mềm — tức là áp dụng phương pháp kỹ thuật vào phần mềm. (2) Nghiên cứu các phương pháp nêu trong (1).

Tóm lại, mục tiêu cuối cùng của software engineering là: **Tạo ra phần mềm tốt hơn, dễ bảo trì hơn với ít tài nguyên tiêu thụ hơn.**

## Quy trình phát triển phần mềm

[Wikipedia định nghĩa quy trình phát triển phần mềm](https://zh.wikipedia.org/wiki/%E8%BD%AF%E4%BB%B6%E5%BC%80%E5%8F%91%E8%BF%87%E7%A8%8B) như sau:

> Quy trình phát triển phần mềm (software development process), hay software process, là vòng đời phát triển phần mềm (software development life cycle), với các giai đoạn thực hiện việc định nghĩa và phân tích yêu cầu, thiết kế, triển khai, kiểm thử, bàn giao và bảo trì phần mềm. Software process là các bước cần tuân theo khi phát triển và xây dựng hệ thống — là lộ trình của phát triển phần mềm.

- Phân tích yêu cầu (Requirements Analysis): Phân tích nhu cầu của người dùng, xây dựng mô hình logic.
- Thiết kế phần mềm (Software Design): Thiết kế kiến trúc phần mềm dựa trên kết quả phân tích yêu cầu.
- Coding: Viết source code cho chương trình chạy.
- Testing: Xác định test case, viết báo cáo kiểm thử.
- Bàn giao (Delivery): Giao phần mềm đã hoàn thiện cho khách hàng.
- Bảo trì (Maintenance): Bảo trì phần mềm như giải quyết bug, hoàn thiện tính năng.

Quy trình phát triển phần mềm chỉ định nghĩa ở mức độ tổng quan một số luồng có thể liên quan đến phát triển phần mềm.

Mô hình phát triển phần mềm định nghĩa cụ thể hơn về quy trình phát triển phần mềm, cung cấp nền tảng lý thuyết mạnh mẽ cho quy trình phát triển.

## Mô hình phát triển phần mềm

Có nhiều mô hình phát triển phần mềm, ví dụ: Waterfall Model (Mô hình thác nước), Rapid Prototype Model (Mô hình nguyên mẫu nhanh), V-model, W-model, Agile Development Model. Trong đó đại diện nhất vẫn là **Waterfall Model** và **Agile Development**.

**Waterfall Model** định nghĩa một chu trình phát triển phần mềm hoàn chỉnh, thể hiện toàn diện vòng đời của một phần mềm.

![](https://oss.javaguide.cn/github/javaguide/system-design/schedule-task/up-264f2750a3d30366e36c375ec3a30ec2775.png)

**Agile Development Model** là mô hình phát triển phần mềm được sử dụng nhiều nhất hiện nay. [MBA Wiki mô tả về Agile Development](https://wiki.mbalib.com/wiki/%E6%95%8F%E6%8D%B7%E5%BC%80%E5%8F%91) như sau:

> **Agile Development** là phương pháp phát triển lấy con người làm trung tâm, theo vòng lặp, tăng dần. Trong agile development, việc xây dựng dự án phần mềm được chia thành nhiều subproject, kết quả của mỗi subproject đều được kiểm thử, có đặc tính tích hợp và có thể chạy được. Nói cách khác, là chia một dự án lớn thành nhiều dự án nhỏ có liên quan nhưng cũng có thể chạy độc lập, và hoàn thành chúng riêng lẻ. Trong quá trình đó phần mềm luôn ở trạng thái có thể sử dụng được.

Một số khái niệm phổ biến hiện nay như **Continuous Integration**, **Refactoring**, **Small Release**, **Low Documentation**, **Stand-up Meeting**, **Pair Programming**, **Test-Driven Development** đều là cốt lõi của agile development.

## Các chiến lược cơ bản trong phát triển phần mềm

### Software Reuse (Tái sử dụng phần mềm)

Khi xây dựng một phần mềm mới, chúng ta không cần bắt đầu từ đầu. Thông qua việc tái sử dụng các bánh xe đã có (framework, third-party library, v.v.), design pattern, design principle và các nguyên liệu có sẵn khác, chúng ta có thể xây dựng phần mềm đáp ứng yêu cầu nhanh hơn.

Các open source project mà chúng ta thường tiếp xúc là ví dụ tốt nhất. Tôi nghĩ nếu không có open source, thời gian và công sức để xây dựng phần mềm đáp ứng yêu cầu sẽ nhiều hơn bây giờ rất nhiều!

### Divide and Conquer (Chia để trị)

Trong quá trình xây dựng phần mềm, chúng ta sẽ gặp nhiều vấn đề. Chúng ta có thể phân tách các vấn đề phức tạp thành các vấn đề nhỏ, rồi lần lượt giải quyết.

Tôi kết hợp với phương pháp thiết kế phần mềm đang rất hot hiện nay — Domain Driven Design (DDD) để nói về điều này.

Trong DDD, một khái niệm quan trọng là **Domain (Lĩnh vực)** — đó là vấn đề chúng ta cần giải quyết. Trong DDD, những gì chúng ta cần làm là chia domain lớn (vấn đề) thành nhiều domain nhỏ (subdomain).

Ngoài ra, divide and conquer cũng là một tư duy thuật toán thường dùng, tương ứng là divide and conquer algorithm. Nếu bạn muốn tìm hiểu về divide and conquer algorithm, khuyến nghị xem [《Algorithm Design and Analysis》của Đại học Bắc Kinh](https://www.coursera.org/learn/algorithms).

### Incremental Evolution (Phát triển từng bước)

Phát triển phần mềm là quá trình tiến hóa từng bước, chúng ta cần liên tục phát triển theo vòng lặp tăng dần, cuối cùng bàn giao sản phẩm đáp ứng giá trị của khách hàng.

Ở đây bổ sung một khái niệm rất quan trọng trong lĩnh vực phát triển phần mềm: **MVP (Minimum Viable Product — Sản phẩm khả thi tối thiểu)**.

Sản phẩm khả thi tối thiểu này có thể hiểu là sản phẩm vừa đủ để đáp ứng nhu cầu của khách hàng. Hình ảnh dưới đây thể hiện rất cô đọng tư duy này.

![](https://oss.javaguide.cn/github/javaguide/system-design/schedule-task/up-a99961ff7725106c0592abca845d555568a.png)

Với MVP, chúng ta cũng có thể thực hiện phân tích thị trường sớm hơn — điều này rất hữu ích trong việc khám phá sự không chắc chắn của sản phẩm. Có thể hướng dẫn hiệu quả bước tiếp theo chúng ta nên đi đâu.

### Optimization and Compromise (Tối ưu và thỏa hiệp)

Phát triển phần mềm là quá trình không ngừng tối ưu cải tiến. Bất kỳ phần mềm nào cũng có nhiều điểm có thể tối ưu, không bao giờ hoàn hảo. Chúng ta cần không ngừng cải thiện và nâng cao chất lượng phần mềm.

Nhưng, cũng đừng sa vào vòng xoáy này. Hãy học cách thỏa hiệp — trong phạm vi đầu tư có hạn, cải thiện chất lượng phần mềm hiện có theo cách hiệu quả nhất.

## Tài liệu tham khảo

- Khái niệm cơ bản về software engineering - Liu Qiang, Khoa Software Engineering, Đại học Thanh Hoa: <https://www.xuetangx.com/course/THU08091000367>
- Software development process - Wikipedia: [https://zh.wikipedia.org/wiki/软件开发过程](https://zh.wikipedia.org/wiki/软件开发过程)

<!-- @include: @article-footer.snippet.md -->
