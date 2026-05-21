---
title: Cảm nhận nửa năm từ tốt nghiệp đến đi làm
description: Cảm nhận làm việc nửa năm của fresh graduate, giá trị của code business CRUD, tích lũy kỹ thuật qua giờ làm thêm, chia sẻ tâm đắc về sự chuyển đổi từ trường học sang môi trường công sở.
category: Về tác giả
tag:
  - Trải nghiệm cá nhân
---

Nếu các bạn đã đọc phần giới thiệu của mình trước đây, sẽ biết mình là một trong hàng triệu sinh viên tốt nghiệp năm 2019. Bài viết này chủ yếu nói về cảm nhận sau hơn nửa năm đi làm. Bài có nhiều cảm nhận chủ quan, nếu bạn không đồng ý ở điểm nào, hãy nói thẳng trong phần comment, mình rất tôn trọng quan điểm của người khác.

Nói qua về tình hình của mình! Hiện tại mình đang làm tại một công ty nước ngoài, công việc hàng ngày giống như hầu hết mọi người là làm development. Từ tốt nghiệp đến nay, tính ra cũng làm được hơn nửa năm, đã qua thời gian thử việc 6 tháng của công ty. Hiện tại mình đã làm qua hai dự án thiên về hướng business, trong đó một cái đang làm. Bạn khó có thể tưởng tượng hai dự án business backend mình làm ở công ty đều không đụng đến distributed/microservices, không tiếp xúc với ứng dụng thực tế của các công nghệ "xịn xò" như Redis, Kafka trong dự án.

Dự án đầu tiên là dự án nội bộ của công ty — hệ thống phát triển nhân viên. Bỏ cái tên đó đi, thực ra hệ thống này làm về đánh giá hiệu suất như biểu hiện của bạn trong một nhóm dự án cụ thể. Stack kỹ thuật của dự án này là Spring Boot + JPA + Spring Security + K8S + Docker + React. Dự án thứ hai đang làm hiện tại là một dự án tích hợp game (cocos), Web management (Spring Boot + Vue) và mini-program (Taro).

Đúng vậy, phần lớn thời gian làm việc của mình liên quan đến CRUD, mỗi ngày cũng viết cả frontend. Trước đây có một người bạn mình quen, khi nghe mình nói phần lớn nội dung dự án là viết business code thì rất thắc mắc, họ cho rằng chỉ viết business code thì không thể tiến bộ được? Ơ? Bạn là fresh graduate, code business còn chưa viết tốt mà nói chuyện đó với mình! Vì vậy **mình rất thắc mắc không hiểu sao nhiều người ngay cả business code còn chưa viết tốt lại nghe đến CRUD là tỏ ra khó chịu? Ít nhất mình thấy trong thời gian đi làm này chất lượng code của mình đã cải thiện, khả năng định vị vấn đề tiến bộ rất nhiều, hiểu sâu hơn về business, và bản thân cũng có thể độc lập hoàn thành một số frontend development rồi.**

Thực ra mình cá nhân thấy viết business code tốt cũng không hề dễ, trước khi than thở mình ngày nào cũng CRUD, hãy nhìn lại xem code CRUD của mình đã viết tốt chưa. Nói cách khác, trong quá trình chỉ viết CRUD, bạn có hiểu những annotation hay class bạn thường dùng không? Điều này giống như một người chỉ biết `@Service`, `@Autowired`, `@RestController` và các annotation đơn giản nhất nói rằng mình đã nắm vững Spring Boot vậy.

Không biết tự lúc nào mọi người đều nghĩ có kinh nghiệm thực tế dùng Redis, MQ thì rất giỏi, có lẽ liên quan đến môi trường phỏng vấn hiện tại. Bạn cần tạo sự khác biệt với người khác, muốn vào big tech thì dường như phải thành thạo những công nghệ đó, thôi bỏ "dường như" đi, nói thẳng ra là với hầu hết ứng viên, những công nghệ này đã là yêu cầu mặc định rồi.

**Thật lòng mà nói, hồi đại học mình cũng từng sa vào "ngụy mệnh đề" này.** Hồi đại học, năm hai mình mới tiếp xúc Java vì gia nhập một câu lạc bộ thiên về kỹ thuật của trường, lúc đó mục đích học Java là để phát triển một app campus. Năm hai, lập trình mới ở mức nhập môn, mình mới tiếp xúc Java, mất một thời gian mới nắm được Java cơ bản. Rồi bắt đầu học Android development.

Đến học kỳ 1 năm ba, mình mới thực sự xác định đi theo hướng Java backend, tìm việc Java backend developer. Sau khoảng 3 tháng học web development cơ bản, mình bắt đầu học nội dung về distributed như Redis, Dubbo. Lúc đó mình học qua đọc sách + xem video + blog, trong quá trình tự học đã làm qua hai dự án hoàn chỉnh bằng cách xem video, một dự án business thông thường, một dự án distributed. **Lúc đó mình tưởng làm xong là mình rất giỏi rồi, mình nghĩ công việc CRUD thông thường không xứng tầm với level hiện tại của mình nữa. Ha ha! Giờ nhìn lại, mình hồi đó thật là ngây thơ!**

Rồi đây! Đến kỳ hè năm ba làm dự án cùng thầy giáo là gặp vấn đề. Năm ba, chúng mình cùng thầy làm một hệ thống đánh giá hiệu suất, mức độ nghiệp vụ phức tạp trung bình. Stack kỹ thuật của dự án này là: SSM + Shiro + JSP. Lúc đó làm dự án này mình gặp đủ loại vấn đề, đủ loại code mình tưởng mình viết được lại không viết được, thậm chí viết một CRUD đơn giản cũng tốn vài ngày. Vì vậy, lúc đó mình vừa ôn lại vừa học thêm vừa viết code. Tuy mệt, nhưng lúc đó học được rất nhiều, cũng giúp mình trở nên thực tế hơn trước công nghệ. Mình nghĩ câu **"dự án này đã không còn khả năng maintain nữa"** là sự phủ nhận lớn nhất của mình với dự án đó.

Công nghệ thay đổi không ngừng, nắm vững cái cốt lõi nhất mới là vương đạo. Vài năm trước có thể mọi người vẫn dùng Spring phát triển theo kiểu XML truyền thống, giờ gần như ai cũng dùng Spring Boot để tăng tốc độ phát triển; rồi vài năm trước dùng message queue có thể vẫn dùng ActiveMQ, đến nay gần như không còn ai dùng nữa, hiện tại phổ biến nhất là Rocket MQ, Kafka. Trong thời đại công nghệ thay đổi nhanh như vậy, bạn không thể học hết từng framework/tool một.

**Nhiều người mới học lên muốn học thông qua làm dự án, đặc biệt là ở công ty, mình thấy điều này không phù hợp lắm.** Nếu nền tảng Java hoặc Spring Boot chưa vững, mình khuyên nên tự học trước một chút rồi mới xem video hay làm dự án theo cách khác. **Một điểm nữa là mình không hiểu sao mọi người đều nói vừa theo dự án vừa học thì hiệu quả nhất, mình thấy cần thêm một tiền đề: bạn có hiểu biết cơ bản về công nghệ đó, hoặc bạn đã có nền tảng lập trình nhất định.**

**Ghi chú quan trọng!!! Khi nền tảng chưa vững, chỉ đơn giản xem video theo sẽ vô dụng. Bạn sẽ thấy xem xong video rồi, đến lúc tự viết code lại không viết được.**

Không biết programmers ở các công ty khác như thế nào? Mình thấy tích lũy kỹ thuật phần lớn phụ thuộc vào thời gian bình thường, chỉ dựa vào công việc phần lớn trường hợp chỉ tăng thêm sự thuần thục khi làm requirements, tất nhiên viết nhiều thì ít nhiều cũng nâng cao nhận thức của bạn về chất lượng code (tiền đề là bạn có ý thức đó).

Ngoài giờ làm việc, mình tận dụng thời gian rảnh để học những thứ mình muốn học. Ví dụ ở công ty là dự án đầu tiên khi mới vào công ty dùng Spring Security + JWT, lúc đó mình không hiểu lắm về công nghệ này, nên ngoài giờ làm mình mất khoảng một tuần học và viết một Demo chia sẻ ra, GitHub: <https://github.com/Snailclimb/spring-security-jwt-guide>. Nhân cơ hội đó, mình còn chia sẻ:

- [《Một câu giúp phân biệt rõ Authentication, Authorization cũng như Cookie, Session, Token》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485626&idx=1&sn=3247aa9000693dd692de8a04ccffeec1&chksm=cea24771f9d5ce675ea0203633a95b68bfe412dc6a9d05f22d221161147b76161d1b470d54b3&token=684071313&lang=zh_CN&scene=21#wechat_redirect)
- [Phân tích ưu nhược điểm JWT authentication và giải pháp cho các vấn đề phổ biến](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485655&idx=1&sn=583eeeb081ea21a8ec6347c72aa223d6&chksm=cea2471cf9d5ce0aa135f2fb9aa32d98ebb3338292beaccc1aae43d1178b16c0125eb4139ca4&token=1737409938&lang=zh_CN#rd)

Một ví dụ gần đây khác là trong khoảng thời gian ở nhà vì dịch bệnh, mình tự học Kafka và đang chuẩn bị viết một loạt bài nhập môn, hiện đã hoàn thành:

1. Kafka nhập môn bằng ngôn ngữ đơn giản;
2. Cài đặt Kafka và trải nghiệm chức năng cơ bản;
3. Spring Boot tích hợp Kafka gửi và nhận message;
4. Một số xử lý transaction, error message khi Spring Boot tích hợp Kafka gửi và nhận message.

Chưa hoàn thành:

1. Phân tích các tính năng nâng cao của Kafka như workflow, tại sao Kafka nhanh...;
2. Đọc và phân tích source code;
3. ...

**Vì vậy, mình nghĩ tích lũy và trầm lắng kỹ thuật phần lớn phụ thuộc vào thời gian ngoài giờ làm (ngoại trừ những đại thần và những người vốn đã rất giỏi).**

**Con đường phía trước còn dài, dù có nhiều sức lực cũng không học hết được tất cả công nghệ bạn muốn học, hãy biết lựa chọn, biết thỏa hiệp, biết giải trí đúng lúc.**
