---
title: Programmer học công nghệ mới nhanh như thế nào
description: "Programmer học công nghệ mới nhanh như thế nào: Tổng hợp các khái niệm chính, câu hỏi phổ biến và điểm thực hành xung quanh kiến thức kỹ thuật và tổng hợp phỏng vấn, giúp bạn học hiệu quả và chuẩn bị phỏng vấn."
category: Technical Articles Selection
tag:
  - Level-up Strategies
head:
  - - meta
    - name: keywords
      content: programmer learning,tech learning methods,fast learning,official documentation,technical interview,technical questions,knowledge and action unity,learning skills
---

> **Lời giới thiệu**: Đây là một bài trong phần Level-up Strategies của [《Java Interview Guide》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html), chia sẻ quan điểm của tôi về cách học nhanh một công nghệ mới.
>
> ![《Java Interview Guide》 Level-up Strategies Section](https://oss.javaguide.cn/javamianshizhibei/training-strategy-articles.png)

Nhiều khi vì lý do công việc, chúng ta cần học nhanh một kỹ thuật nào đó để áp dụng vào project. Hoặc công ty mà chúng ta muốn phỏng vấn yêu cầu một kỹ thuật mà trước đây chúng ta chưa tiếp xúc — để đối phó với nhu cầu phỏng vấn, chúng ta cần nhanh chóng nắm vững kỹ thuật đó.

Là một programmer tự học hoàn toàn, bài viết này chia sẻ sơ qua quan điểm của tôi về cách học nhanh một kỹ thuật.

Khi học bất kỳ công nghệ nào, nhất định phải làm rõ trước công nghệ đó dùng để giải quyết vấn đề gì. Trước khi học sâu về công nghệ này, nhất định phải hiểu tổng quan về nó trước — nghĩ xem nó được tạo thành từ những modules nào, cung cấp chức năng gì, so với công nghệ cùng loại có ưu điểm gì.

Ví dụ khi học Spring, qua tài liệu chính thức của Spring bạn có thể biết xu hướng kỹ thuật mới nhất của Spring, Spring bao gồm những modules nào, Spring có thể giúp bạn giải quyết vấn đề gì.

![](https://oss.javaguide.cn/github/javaguide/system-design/web-real-time-message-push/20210506110341207.png)

Ví dụ khác khi học message queue, tôi sẽ tìm hiểu trước message queue này thường có tác dụng gì trong hệ thống, giúp chúng ta giải quyết vấn đề gì. Có nhiều loại message queue — khi học và nghiên cứu một message queue cụ thể, tôi sẽ so sánh nó với message queue đã học trước đó. Như khi học RocketMQ, tôi sẽ so sánh nó với message queue đầu tiên tôi từng học là ActiveMQ — suy nghĩ RocketMQ cải tiến gì so với ActiveMQ, giải quyết được pain points nào của ActiveMQ, hai cái có điểm gì tương tự và khác nhau.

**Cách học một kỹ thuật nhanh nhất và hiệu quả nhất là kết nối kỹ thuật đó với kiến thức đã học trước đó, tạo thành một mạng lưới.**

Sau đó, tôi khuyến nghị bạn xem tutorials trong official documentation, chạy thử một số Demos và làm một số small projects.

Tuy nhiên, official documentation thường là tiếng Anh. Thường chỉ các dự án nội địa và một phần nhỏ dự án nước ngoài mới có tài liệu tiếng Trung. Và official documentation giới thiệu thường khá sơ lược, không phù hợp lắm cho beginners.

Nếu bạn không hiểu tài liệu trên official website, bạn cũng có thể tìm kiếm từ khóa liên quan để tìm một số blog hoặc video chất lượng cao để xem. **Nhất định đừng ngay từ đầu đã muốn hiểu nguyên lý của kỹ thuật.**

Ví dụ khi học Spring framework, tôi khuyến nghị sau khi hiểu vấn đề Spring framework giải quyết, không phải trực tiếp nghiên cứu nguyên lý hoặc source code của Spring framework, mà là trước tiên thực sự trải nghiệm các core features mà Spring framework cung cấp là IoC (Inversion of Control) và AOP (Aspect-Oriented Programming), viết một số Demos với Spring framework, thậm chí làm một số small projects với Spring framework.

Tóm lại, **trước khi nghiên cứu nguyên lý của kỹ thuật, phải hiểu cách sử dụng kỹ thuật đó trước.**

Quá trình học từng bước như vậy có thể dần dần giúp bạn xây dựng niềm vui học tập, nhận được cảm giác thành tựu ngay lập tức, tránh bị "từ chối" vì trực tiếp nghiên cứu kiến thức về nguyên lý.

**Khi nghiên cứu nguyên lý của một kỹ thuật, để tránh nội dung quá trừu tượng, chúng ta cũng có thể thực hành.**

Ví dụ khi học nguyên lý Tomcat, chúng ta phát hiện custom thread pool của Tomcat khá thú vị, chúng ta cũng có thể tự viết một custom thread pool phiên bản riêng. Hay khi học nguyên lý Dubbo, có thể tự tay làm một simple RPC framework.

Ngoài ra, kỹ thuật cần dùng trong project và kỹ thuật cần dùng trong phỏng vấn thực ra có một số điểm khác nhau.

Nếu bạn học một kỹ thuật để sử dụng trong project thực tế, thì trọng tâm là học cách sử dụng kỹ thuật đó và best practices, tìm hiểu các vấn đề có thể gặp trong quá trình sử dụng. Mục tiêu cuối cùng là kỹ thuật đó mang lại hiệu quả thực tế và tích cực cho project.

Nếu bạn học một kỹ thuật chỉ để phỏng vấn, thì trọng tâm nên đặt vào các câu hỏi phổ biến nhất về kỹ thuật đó trong phỏng vấn — tức là những gì chúng ta thường gọi là "technical questions".

Nhiều người khi nhắc đến technical questions là nhìn không tương. Theo tôi, nếu bạn không thuộc lòng technical questions một cách máy móc mà thực sự suy nghĩ về bản chất của các câu hỏi phỏng vấn đó, thì trong quá trình chuẩn bị technical questions bạn cũng sẽ hiểu sâu hơn về kỹ thuật.

Cuối cùng, điều quan trọng nhất đồng thời cũng khó nhất là **Tri Hành Hợp Nhất! Tri Hành Hợp Nhất! Tri Hành Hợp Nhất!** Dù là lập trình hay các lĩnh vực khác, điều quan trọng nhất không phải là bạn biết bao nhiêu mà là cố gắng đạt được sự thống nhất giữa kiến thức và hành động.
