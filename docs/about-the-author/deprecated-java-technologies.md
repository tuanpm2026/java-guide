---
title: Những công nghệ Java đã lỗi thời, đừng học nữa!
description: Điểm qua các công nghệ Java đã lỗi thời - JSP, Struts, EJB, Java Applets, SOAP và các công nghệ lỗi thời khác không nên học, kèm gợi ý các giải pháp thay thế hiện đại.
category: Giới thiệu tác giả
tag:
  - Tản mạn
---

Mấy hôm trước, tôi vô tình trả lời một câu hỏi trên Zhihu: "Học Java đến JSP thì học không vô nữa, làm thế nào?".

Với tâm lý không muốn người khác đi vòng, tôi trả lời: Công nghệ đã lỗi thời thì đừng học nữa, và tiện thể liệt kê một số công nghệ đã bị thay thế trong lĩnh vực phát triển Java.

## Những công nghệ Java đã lỗi thời

Nội dung trả lời gốc của tôi như sau, liệt kê một số công nghệ đã bị thay thế trong lĩnh vực phát triển Java:

**JSP**

- **Lý do**: JSP đã lỗi thời, không thể đáp ứng nhu cầu phát triển web hiện đại; front-end back-end separation đã trở thành mainstream.
- **Giải pháp thay thế**: Template engines (như Thymeleaf, Freemarker) phổ biến hơn trong phát triển full-stack truyền thống; còn trong front-back separated architecture, các modern front-end frameworks như React, Vue, Angular đã thay thế vai trò của JSP.
- **Lưu ý**: Một số dự án cũ của state-owned enterprises và central enterprises có thể vẫn dùng JSP, nhưng trường hợp này ngày càng hiếm.

**Struts (đặc biệt là 1.x)**

- **Lý do**: Cấu hình phức tạp, hiệu quả phát triển thấp, và tồn tại lỗ hổng bảo mật nghiêm trọng (như lỗ hổng Apache Struts 2 nổi tiếng thế giới). Ngoài ra, cộng đồng duy trì không đủ, ecosystem dần thu hẹp.
- **Giải pháp thay thế**: Spring MVC và Spring WebFlux cung cấp trải nghiệm phát triển đơn giản hơn, tính năng mạnh hơn và community support đầy đủ hơn, hoàn toàn thay thế Struts.

**EJB (Enterprise JavaBeans)**

- **Lý do**: EJB quá phức tạp, chi phí phát triển cao, learning curve dốc, dần bị thay thế bởi các frameworks nhẹ hơn trong các dự án thực tế.
- **Giải pháp thay thế**: Spring/Spring Boot cung cấp giải pháp phát triển enterprise-grade đơn giản hơn và chức năng mạnh hơn, hầu như đã trở thành de facto standard của Java enterprise development. Ngoài ra, Solon từ trong nước và Quarkus thân thiện với cloud-native cũng rất tốt.

**Java Applets**

- **Lý do**: Các modern browsers (như Chrome, Firefox, Edge) đã hoàn toàn loại bỏ support cho Java Applets từ lâu. Đồng thời Applets tồn tại vấn đề bảo mật nghiêm trọng.
- **Giải pháp thay thế**: HTML5, WebAssembly và modern JavaScript frameworks (như React, Vue) có thể thực hiện trải nghiệm tương tác an toàn và hiệu quả hơn, không cần plugin support.

**SOAP / JAX-WS**

- **Lý do**: SOAP và JAX-WS quá phức tạp, định dạng data dài dòng (XML), không thân thiện với hiệu quả phát triển và performance.
- **Giải pháp thay thế**: RESTful API và RPC nhẹ và hiệu quả hơn, là lựa chọn đầu tiên cho modern microservices architecture.

**RMI (Remote Method Invocation)**

- **Lý do**: RMI là công nghệ remote call sớm của Java, nhưng compatibility kém, cấu hình phức tạp, và performance tương đối kém.
- **Giải pháp thay thế**: RESTful API và RPC cung cấp giải pháp remote call đơn giản và hiệu quả hơn, hoàn toàn thay thế RMI.

**Swing / JavaFX**

- **Lý do**: Desktop applications trong lĩnh vực phát triển giảm đáng kể thị phần, Web và mobile đã trở thành mainstream. Ecosystem của Swing và JavaFX không phong phú bằng các modern cross-platform frameworks.
- **Giải pháp thay thế**: Cross-platform desktop development frameworks (như Flutter Desktop, Electron) có trải nghiệm hiện đại hơn.
- **Lưu ý**: Một số dự án cũ của state-owned enterprises và central enterprises có thể vẫn dùng Swing/JavaFX, nhưng trường hợp này ngày càng hiếm.

**Ant**

- **Lý do**: Ant là build tool dựa trên XML configuration, thiếu user-friendliness, cấu hình phức tạp.
- **Giải pháp thay thế**: Maven và Gradle cung cấp quản lý project dependencies và chức năng build hiệu quả hơn, trở thành lựa chọn đầu tiên cho modern build tools.

## Tranh luận không có cơ sở

Không ngờ, phần bình luận xuất hiện đúng như dự đoán một loại người hay tranh luận vô lý:

> "Học không phải là kỹ thuật, là tư tưởng. Vậy bò cũng là kỹ thuật con người không cần hay sao? Tại sao khi sinh ra bạn phải học bò trước? Nếu tư tưởng nền tảng không có rồi đi học đủ loại framework, cuối cùng chỉ là loại phế vật chỉ biết copy-paste!"

<img src="https://oss.javaguide.cn/github/javaguide/about-the-author/prattle/deprecated-java-technologies-zhihu-comments.png" style="zoom:50%;" />

Câu này nhìn bề ngoài có vẻ có lý, nhưng thực ra lộ ra **sự thiếu hiểu biết và cố chấp** của một người.

**Người càng ít kiến thức thì tin vào những thứ càng tuyệt đối**, vì họ chưa bao giờ thực sự tìm hiểu góc nhìn đối lập với quan điểm của mình, cũng thiếu nhận thức tổng quan về sự phát triển công nghệ.

Ví dụ: Khi tôi mới bắt đầu học Java backend development, hoàn toàn không có kinh nghiệm gì, mua đại một cuốn sách và bắt đầu đọc. Lúc đó đọc là cuốn **《Java Web Integration Development King Returns》** (nơi mà giấc mơ bắt đầu).

Khi tôi còn học đại học, nhiều nội dung trong cuốn sách đó thực ra đã lỗi thời rồi. Ví dụ nó dành nhiều trang giới thiệu JSP, Struts, Hibernate, EJB và SVN. Tuy nhiên, cho đến tận bây giờ, tôi vẫn rất biết ơn cuốn sách này đã dẫn tôi bước vào cánh cửa Java backend development.

![](https://oss.javaguide.cn/github/javaguide/about-the-author/prattle/java-web-integration-development-king-returns.png)

Cuốn sách này có tổng cộng **1010** trang. Lúc đó tôi có thể nói là học quên ăn quên ngủ, mất rất nhiều thời gian mới "cắn" xong toàn bộ cuốn sách.

Nhìn lại, nếu lúc đó tôi có ý thức tránh học những công nghệ đã lỗi thời này, thực sự có thể tiết kiệm rất nhiều thời gian để học những nội dung mainstream và thực dụng hơn.

Vậy, những công nghệ lỗi thời đó có ích không? Nói thật, **không ích gì cả, hoàn toàn lãng phí thời gian**.

**Vì sao đã phải bỏ thời gian để học, tại sao không học những công nghệ mainstream hơn, có giá trị thực tiễn hơn?**

Bây giờ vốn đã rất cạnh tranh. Dù là hướng Java hay các hướng kỹ thuật khác, đều có rất nhiều công nghệ phải học.

Muốn hiểu cái gọi là "tư tưởng nền tảng", thay vì lãng phí thời gian vào JSP loại công nghệ không còn giá trị ứng dụng thực tế, không bằng học sâu Servlet, nghiên cứu nguyên lý AOP và IoC của Spring, hiểu cơ chế hoạt động của Spring MVC từ góc độ source code.

Những nội dung này không chỉ giúp bạn nắm vững tư tưởng cốt lõi, mà còn thực sự hữu ích trong phát triển thực tế. Điều này chẳng có ý nghĩa hơn nhiều so với việc bỏ nhiều thời gian vào JSP sao?

## Có cần học công nghệ mà vẫn còn công ty dùng không?

Sau khi tôi đăng quan điểm liên quan đến bài viết này lên [Official Account](https://mp.weixin.qq.com/s/lf2dXHcrUSU1pn28Ercj0w), lại nhận được một loại phản hồi mà tôi thấy rất ngốc:

- "Mặc dù JSP rất cũ, nhưng vẫn phải học, biết dùng là được, vì nhiều dự án cũ của chúng tôi vẫn dùng."
- "Nhiều dự án cũ của central enterprises và state-owned enterprises vẫn dùng, chắc chắn phải học!"

Quan điểm này hoàn toàn là chui đầu vào đá! Nếu theo logic này, bạn còn cần đi học Struts2, SVN, JavaFX và các công nghệ lỗi thời khác vì chúng cũng vẫn có công ty dùng. Tôi có một người bạn đại học sau khi tốt nghiệp vào một state-owned enterprise ở Wuhan, viết JavaFX một năm rồi chịu không nổi bỏ. Trước đây anh ấy chưa bao giờ tiếp xúc JavaFX, và khi tuyển dụng cũng không bị hỏi về nó.

Nhất định đừng giả định mình sẽ đối mặt với dự án có tech stack lỗi thời. Đi tìm việc chắc chắn phải dùng tech stack mainstream để tìm, và cố gắng tìm công việc giúp kỹ thuật của mình phát triển, làm cũng thoải mái hơn. Thực sự không tìm được việc phù hợp, phải đi maintain dự án cũ — đó là chuyện về sau, học đến đâu dùng đến đó là được.

**Với người mới bắt đầu, người ta khuyên mà vẫn cố học công nghệ lỗi thời, thì ít nhiều não không đủ xài, về cơ bản có thể giã biệt ngành này rồi!**
