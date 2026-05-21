---
title: Sách kinh điển Java phải đọc
description: Gợi ý sách phải đọc cho Java programmer - Java basics, concurrent programming, JVM, Spring/SpringBoot framework, Netty network programming, performance tuning và các sách kinh điển khác được tuyển chọn.
category: Computer Books
icon: "java"
---

## Java Basics

**[《Head First Java》](https://book.douban.com/subject/2000732/)**

![《Head First Java》-Douban](/images/github/javaguide/books/image-20220424103035793.png)

Nội dung của cuốn 《Head First Java》 này rất nhẹ nhàng và thú vị. Có thể nói đây là một trong những cuốn sách tôi thích nhất trong giai đoạn đầu học lập trình. Đồng thời cuốn sách này cũng là sách Java khai mở của tôi. Nhờ có cuốn sách này hỗ trợ trong giai đoạn đầu học Java, tôi mới thực sự bước vào cửa ngôn ngữ Java.

Tôi nghĩ lý do tôi có thể kiên trì với Java, cuốn sách này có công lao rất lớn. Nhiều bạn bè quanh tôi học Java giai đoạn đầu đều đọc cuốn này.

Nhiều bạn hay hỏi: **Cuốn này có phù hợp cho người mới bắt đầu lập trình không?**

Cá nhân tôi thấy cuốn này khá phù hợp với người mới bắt đầu — xét cho cùng là series "Head First".

**[《Core Java Volume 1+2》](https://book.douban.com/subject/34898994/)**

![《Core Java Volume 1》-Douban](/images/github/javaguide/books/image-20220424101217849.png)

Hai cuốn này cũng rất tốt. Tuy nhiên, nội dung rất nhiều, đọc hết khá tốn thời gian. Giờ tôi dùng hai cuốn này như reference books — ví dụ khi viết bài thường gặp một số câu hỏi cơ bản về Java thì hay lật hai cuốn này để tham khảo!

Hồi đại học tôi mua hai cuốn để trong ký túc xá, rảnh thì giở ra đọc. Khuyến nghị đọc sau khi đã có chút nền tảng Java rồi — nội dung khá sâu và toàn diện, rất đáng đọc.

**[《Thinking in Java》](https://book.douban.com/subject/2130190/)**

![《Thinking in Java》-Douban](/images/github/javaguide/books/image-20220424103124893.png)

Ngoài ra, tác giả cuốn này năm ngoái đã xuất bản [《On Java》](https://book.douban.com/subject/35751619/) — tôi khuyến nghị cuốn này hơn vì nội dung mới hơn, giới thiệu 3 LTS versions của Java (Java 8, 11, 17).

![](/images/github/javaguide/books/on-java/6171657600353_.pic_hd.jpg)

Xét cho cùng, đây là cuốn sách kỹ thuật duy nhất trên thị trường hiện nay giới thiệu 3 LTS versions của Java (Java 8, 11, 17).

**[《Java 8 in Action》](https://book.douban.com/subject/26772632/)**

![《Java 8 in Action》-Douban](/images/github/javaguide/books/image-20220424103202625.png)

Java 8 là một phiên bản milestone, doanh nghiệp hiện nay thường vẫn dùng Java 8 nhiều nhất. Nắm vững một số new features của Java 8 như Lambda, Stream API vẫn rất cần thiết. Về phần này tôi khuyến nghị **[《Java 8 in Action》](https://book.douban.com/subject/26772632/)**.

**[《Java Programming Logic》](https://book.douban.com/subject/30133440/)**

![《Java Programming Logic》](/images/github/javaguide/books/image-20230721153650488.png)

Một cuốn sách tốt rất khiêm tốn. So với introductory books, nội dung sâu hơn. Phù hợp cho beginners, đồng thời cũng phù hợp để ôn lại Java basics.

## Java Concurrency

**[《The Beauty of Java Concurrent Programming》](https://book.douban.com/subject/30351286/)**

![《The Beauty of Java Concurrent Programming》-Douban](/images/github/javaguide/books/image-20220424112413660.png)

Cuốn sách này rất phù hợp để học Java multi-threading. Giải thích rất dễ hiểu. Tác giả từ concurrency programming basics đến thực chiến đều trôi chảy.

Ngoài ra, tác giả Jiāduō cũng thường xuyên đăng các bài kỹ thuật trên mạng. Cuốn sách này cũng là kết quả của nhiều năm tích lũy của anh ấy trong lĩnh vực multi-threading! Nội dung trong sách cơ bản đều kết hợp code để giải thích, rất thuyết phục!

**[《Practical Java High Concurrency Programming Design》](https://book.douban.com/subject/30358019/)**

![《Practical Java High Concurrency Programming Design》-Douban](/images/github/javaguide/books/image-20220424112554830.png)

Cuốn thứ hai tôi khuyến nghị, phù hợp làm introductory/intermediate book về multi-threading. Nội dung cũng kết hợp theory và practice, giải thích mỗi knowledge point dễ hiểu, overall structure cũng khá rõ ràng.

**[《Deep Into Java Multi-threading》](https://github.com/RedSpider1/concurrent)**

![《Deep Into Java Multi-threading》 online reading](/images/github/javaguide/books/image-20220424112927759.png)

Cuốn sách open source này được mở ra bởi một số big company experts. Các tác giả này đã đọc rất nhiều sách và blogs về Java multi-threading, sau đó kết hợp với kinh nghiệm tổng kết, Demo examples, source code analysis mới hình thành cuốn sách này.

Chất lượng cuốn sách cũng rất đáng tin! Cuốn sách có consistent formatting rules và writing style, clear expression và logic. Và sau khi mỗi bài viết được viết xong, các tác giả review lẫn nhau. Khi merge vào main branch tất cả members review lại một lần nữa. Sau đó toàn bộ được revise thêm ba lần.

Online reading: <https://redspider.gitbook.io/concurrent/>.

**[《Java Concurrent Implementation: JDK Source Code Analysis》](https://book.douban.com/subject/35013531/)**

![《Java Concurrent Implementation: JDK Source Code Analysis》-Douban](/images/github/javaguide/books/0b1b046af81f4c94a03e292e66dd6f7d.png)

Cuốn sách này chủ yếu giải thích source code của một số phần quan trọng trong Java Concurrent package. Ngoài ra, các kiến thức concurrency quan trọng như JMM, happen-before, CAS cũng đều được giới thiệu.

Dù bạn muốn nghiên cứu sâu về Java concurrency hay chuẩn bị phỏng vấn đều có thể đọc cuốn này.

## JVM

**[《Understanding the Java Virtual Machine》](https://book.douban.com/subject/34907497/)**

![《Understanding the Java Virtual Machine》-Douban](/images/github/javaguide/books/20210710104655705.png)

Chỉ một câu để mô tả cuốn sách này: **Chiến đấu cơ trong số sách Trung Quốc — thực sự xuất sắc!** (Thực lòng hy vọng trong nước có thêm nhiều sách chất lượng như vậy! Cố lên!)

Phiên bản 3 của cuốn sách này đã ra cuối năm 2019. Thêm nhiều nội dung thực chất như phân tích nguyên lý của next-gen GC như ZGC. Hiện đang được 9.5 sao trên Douban.

Dù bạn phỏng vấn hay muốn học sâu hơn trong lĩnh vực Java, bạn đều không thể thiếu cuốn này. Cuốn này không chỉ phải đọc mà còn phải đọc nhiều lần — toàn là nội dung chất lượng. Trong cuốn này cũng có một số thứ cần tự thực hành — khuyến nghị bạn cũng thực hành theo.

Sách tương tự còn có **[《Practical Java Virtual Machine》](https://book.douban.com/subject/26354292/)** và **[《Virtual Machine Design and Implementation: With JVM as Example》](https://book.douban.com/subject/34935105/)** — cả hai đều rất tốt!

Nếu bạn hứng thú với practice và muốn tự tay viết một JVM đơn giản, có thể xem **[《Craft Your Own Java Virtual Machine》](https://book.douban.com/subject/26802084/)**.

Code trong sách được implement bằng Go. Sau khi hiểu nguyên lý, có thể dùng Java để viết lại — cũng là luyện tập! Nếu hiện tại chưa đủ năng lực, có thể tìm nhiều Java implementations trên mạng như [《zachaxy's Handwritten JVM Series》](https://zachaxy.github.io/tags/JVM/).

Ngoài ra, bài [《Learning JVM from outside to inside》](https://www.douban.com/doulist/2545443/) của R大 trên Douban cũng recommend nhiều sách JVM-related hay. Khuyến nghị xem.

## Common Tools

Rất quan trọng! Đặc biệt là Git và Docker.

- **IDEA**: Làm quen với basic operations và common shortcuts. Reference: [《IntelliJ IDEA Chinese Tutorial》](https://github.com/judasn/IntelliJ-IDEA-Tutorial).
- **Maven**: Rất khuyến nghị dành vài ngày học **Maven** trước khi học common frameworks. (Tìm và download Jar packages thực sự phiền phức. Dùng Maven tiết kiệm nhiều thời gian). Related reading: [Maven Core Concepts Summary](https://javaguide.cn/tools/maven/maven-core-concepts.html).
- **Git**: Basic Git skills là bắt buộc. Hãy thử host code của mình lên Github trong quá trình học. Related reading: [Git Core Concepts Summary](https://javaguide.cn/tools/git/git-intro.html).
- **Docker**: Học cách dùng Docker để cài phần mềm cần dùng trong học tập như MySQL — tiện hơn nhiều và tiết kiệm thời gian. Reference: [《Docker - From Beginner to Practice》](https://yeasy.gitbook.io/docker_practice/).

Ngoài các tools này, tôi rất khuyến nghị bạn nhất định phải nắm cách dùng GitHub. Một số tips dùng GitHub, xem bài [Github Useful Tips Summary](https://javaguide.cn/tools/git/github-tips.html).

## Common Frameworks

Phần frameworks khuyến nghị tìm official documentation hoặc blogs để đọc.

### Spring/SpringBoot

**Spring và SpringBoot thực sự rất quan trọng!**

Nhất định phải nắm hai concepts AOP và IOC. Spring bean scope và lifecycle, SpringMVC working principles và các knowledge points khác đều rất quan trọng — phải hiểu thấu.

Làm Java backend trong doanh nghiệp, bạn chắc chắn không thể thiếu SpringBoot — đây là kỹ năng bắt buộc! Nhất định phải học tốt!

Cũng cần biết cách integrate SpringBoot với một số common technologies như SpringBoot integrate MyBatis, ElasticSearch, SpringSecurity, Redis v.v.

Dưới đây là một số sách/columns được khuyến nghị.

**[《Spring in Action》](https://book.douban.com/subject/34949443/)**

Không khuyến nghị đọc như introductory book. Nhập môn nên tìm sách hay video tiếng Trung. Cuốn này định vị như một overview của Spring, chỉ có basic concept introductions và examples, bao phủ các mặt của Spring nhưng không sâu. Như tác giả viết ở trang cuối: "Learning Spring, this is just the beginning".

**[《Pro Spring 5》](https://book.douban.com/subject/30452637/)**

Giới thiệu khá chi tiết về Spring5 new features, nhưng cũng chỉ vậy thôi. Ngoài ra, dịch cảm giác có chút vụng về, còn khá nhàm chán. Nội dung rất nhiều, tôi thường dùng như reference book.

**[《Spring Boot Programming Thought (Core)》](https://book.douban.com/subject/33390560/)**

_Hơi dài dòng nhưng nguyên lý được giải thích khá rõ ràng._

SpringBoot analysis, không phù hợp với beginners. Mua năm ngoái, giờ mới đọc được vài chương, sau đó không đọc tiếp được. Sách rất dày, cảm thấy nhiều knowledge points giải thích quá dài dòng. Nhưng cuốn này giải thích internal principles của SpringBoot vẫn khá rõ ràng.

**[《Spring Boot in Action》](https://book.douban.com/subject/26857423/)**

Một cuốn sách khá bình thường, có thể xem qua.

### MyBatis

MyBatis được dùng nhiều ở trong nước. Khuyến nghị không cần bỏ quá nhiều thời gian vào đây. Tất nhiên, source code của MyBatis rất đáng học — có nhiều coding practices tốt. Đây là hai cuốn sách giải thích MyBatis source code.

**[《Handwritten MyBatis: Progressive Source Code Practice》](https://book.douban.com/subject/36243250/)**

Cuốn sách do người bạn tốt của tôi Xiaofuge xuất bản. Lấy practice làm core, bỏ nội dung phức tạp của MyBatis source code, tập trung vào core logic của MyBatis. Simplified code implementation với progressive development approach, từng bước implement core features của MyBatis.

Repo của project đi kèm: <https://github.com/fuzhengwei/small-mybatis>.

**[《General Source Code Reading Guide: MyBatis Source Code Detailed》](https://book.douban.com/subject/35138963/)**

Cuốn sách này qua MyBatis open source code để giảng dạy quy trình và methods đọc source code! Phân tích chi tiết hơn 300 classes trong MyBatis source code, bao gồm background knowledge, organization methods, logical structure, implementation details.

Repo của demo đi kèm: <https://github.com/yeecode/MyBatisDemo>.

### Netty

**[《Netty in Action》](https://book.douban.com/subject/27038538/)**

Cuốn này có thể dùng để nhập môn Netty. Nội dung từ BIO đến NIO, sau đó giới thiệu chi tiết tại sao có Netty, tại sao Netty tốt và giải thích các knowledge points quan trọng.

Cuốn này cơ bản giới thiệu hầu hết các knowledge points quan trọng của Netty, và cơ bản đều qua practice form.

**[《The Way of Netty: Learn Netty through Cases》](https://book.douban.com/subject/30381214/)**

Nội dung đều là practice cases dùng Netty như memory leaks. Nếu bạn cảm thấy Netty của mình đã nhập môn hoàn toàn và muốn nắm sâu hơn, khuyến nghị đọc cuốn này.

**[《Learn Netty with Flash: Netty Instant Chat Practice and Underlying Principles》](https://book.douban.com/subject/35752082/)**

Xuất bản tháng 3/2022. Cuốn sách chia thành hai phần: phần trên qua một instant chat system practice case để giúp bạn nhập môn Netty; phần dưới qua phân tích Netty source code để giúp bạn hiểu các underlying principles quan trọng của Netty.

## Performance Tuning

**[《Java Performance: The Definitive Guide》](https://book.douban.com/subject/26740520/)**

_Hy vọng có thêm sách tốt về Java performance optimization!_

O'Reilly family book — introductory book về performance tuning. Cá nhân tôi nghĩ performance tuning là kiến thức bắt buộc cho mọi Java practitioner.

Nội dung practical của cuốn này rất tốt, đặc biệt là JVM tuning. Nhược điểm cũng khá rõ — nội dung hơi cũ. Sách như vậy trên thị trường rất hiếm. Cuốn này không phù hợp với beginners. Khuyến nghị đọc sau khi đã nắm Java language tương đối tốt. Ngoài ra, tốt nhất đọc 《Understanding the Java Virtual Machine》 của Zhou Zhiming trước.

## Website Architecture

Đọc qua nhiều sách về website architecture như 《Large-scale Website Technical Architecture: Core Principles and Case Analysis》, 《Billion-Level Traffic Website Architecture Core Technology》 v.v.

Hiện tại tôi nghĩ chỉ có thể khuyến nghị **[《Learn Architecture from Scratch》](https://book.douban.com/subject/30335935/)** của Li Yunhua và **[《Software Architecture Design》](https://book.douban.com/subject/30443578/)** của Yu Chunlong.

![](/images/github/javaguide/books/20210412224443177.png)

《Learn Architecture from Scratch》 có Geek Time column tương ứng — mua một trong hai là được. Tôi đọc một phần nhỏ, nội dung khá toàn diện, là một cuốn thực sự giảng về cách làm architecture.

![](/images/github/javaguide/books/20210412232441459.png)

Transactions và locks, distributed (CAP, distributed transactions...), high concurrency, high availability — 《Software Architecture Design》 đều có đề cập.

## Interview

**《JavaGuide Interview Sprint Version》**

![](/images/github/javaguide-mianshituji/image-20220830103023493.png)

![](/images/github/javaguide-mianshituji/image-20220830102925775.png)

Phiên bản interview của [JavaGuide](https://javaguide.cn/), bao gồm hầu hết knowledge points về Java backend như collections, JVM, multi-threading cùng database MySQL v.v.

Trả lời "**Interview Sprint**" trong phần backend của Official Account để lấy miễn phí — không có bất kỳ điều kiện ràng buộc nào.

![JavaGuide Official Account](/images/github/javaguide/gongzhonghaoxuanchuan.png)
