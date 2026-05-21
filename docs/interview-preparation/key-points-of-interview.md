---
title: Tổng hợp trọng tâm phỏng vấn Java Backend
description: Tổng hợp trọng tâm phỏng vấn Java backend - Tổng hợp điểm kiểm tra tần suất cao và thứ tự ưu tiên ôn tập cho campus/social recruitment, bao gồm Java basics, collections, concurrency, MySQL, Redis, Spring/Spring Boot, JVM và chuẩn bị kinh nghiệm project.
category: Interview Preparation
icon: star
head:
  - - meta
    - name: keywords
      content: Java backend interview,interview key points,technical questions,Java basics,Java collections,Java concurrency,MySQL,Redis,Spring Boot,project experience
---

<!-- @include: @small-advertisement.snippet.md -->

::: tip Gợi ý thân thiện
Bài này được trích từ **[《Java Interview Guide》](../zhuanlan/java-mian-shi-zhi-bei.md)**. Đây là chuyên mục dạy bạn cách chuẩn bị phỏng vấn hiệu quả hơn, nội dung bổ sung cho JavaGuide, bao gồm các câu hỏi phổ biến (system design, common frameworks, distributed, high concurrency...) và kinh nghiệm phỏng vấn chất lượng.
:::

## Kiến thức nào là trọng tâm trong phỏng vấn Java backend?

**Khi chuẩn bị phỏng vấn, cụ thể những kiến thức nào là trọng tâm? Làm thế nào để nắm bắt trọng tâm?**

Xem hình tổng quan dưới đây (sẽ giải thích chi tiết sau):

![Java Backend Interview Key Points](/images/github/javaguide/interview-preparation/back-end-interview-focus.png)

Một vài lời khuyên tin cậy:

1. **Java basics, collections, concurrency, MySQL, Redis, Spring, Spring Boot** — những kiến thức bắt buộc phải có cho Java backend development (MySQL + Redis >= Java > Spring + Spring Boot). Đây là những kiến thức được hỏi nhiều nhất trong phỏng vấn cả big company lẫn SME. Kiến thức về Spring và Spring Boot tầm quan trọng thấp hơn một chút so với những kiến thức trước, nhưng thông thường phỏng vấn cũng sẽ hỏi, đặc biệt là SME. Kiến thức concurrency thường được big/medium company hỏi nhiều hơn và khó hơn, đặc biệt big company thích đào sâu tầng dưới rất dễ khiến người không trả lời được. Nội dung liên quan đến computer basics sẽ đề cập ở phần dưới.
2. **Kiến thức liên quan đến project experience của bạn là trọng trọng tâm nhất** — interviewer có trình độ đều hỏi dựa trên project experience của bạn. Ví dụ project experience của bạn dùng Redis để làm rate limiting, thì các câu hỏi kỹ thuật về Redis (như Redis common data structures) và rate limiting (như common rate limiting algorithms) bạn phải dành nhiều tâm sức hơn để hiểu thấu! Sau khi nắm vững kiến thức trong project experience, hãy nắm vững những công nghệ bạn ghi là "proficient" trên resume, cuối cùng mới dành thời gian chuẩn bị các kiến thức khác.
3. **Dựa trên nhu cầu tìm việc của bản thân**, bạn có thể điều chỉnh trọng tâm ôn tập một cách phù hợp. SME thường hỏi computer basics ít hơn, một số big company như ByteDance khá coi trọng computer basics đặc biệt là algorithm. Như vậy nếu mục tiêu của bạn là SME, computer basics không quá quan trọng để chuẩn bị phỏng vấn. Nếu thời gian ôn tập không đủ, có thể tạm thời bỏ qua, dành thời gian cho các kiến thức quan trọng khác.
4. **Thông thường campus recruitment không yêu cầu bắt buộc phải biết distributed/microservices, high concurrency** (không loại trừ một số vị trí cụ thể có yêu cầu bắt buộc này). Vì vậy có cần nắm không vẫn phụ thuộc vào tình hình thực tế cá nhân bạn hiện tại. Nếu bạn biết những kiến thức này, đối với phỏng vấn vẫn có lợi hơn tương đối (muốn project experience có điểm nổi bật vẫn cần biết một số kiến thức performance optimization — đây cũng là một nhánh nhỏ của high concurrency). Nếu trong tech skills hoặc project experience của bạn liên quan đến distributed/microservices, high concurrency, khuyến nghị bạn cũng nên dành thời gian chuẩn bị kỹ, rất có thể bị hỏi trong phỏng vấn — đặc biệt khi project experience có dùng đến. Nhưng vẫn chủ yếu chuẩn bị những kiến thức đã viết trên resume là được.
5. **Kiến thức JVM** thường chỉ được big company (như Meituan, Alibaba) và một số medium company tốt (như Ctrip, SF Express, CMB Network) mới hỏi. Phỏng vấn state-owned enterprise, medium company kém hơn và small company không cần chuẩn bị. Những gì thường hay hỏi nhất về JVM trong phỏng vấn là [Java Memory Areas](https://javaguide.cn/java/jvm/memory-area.html), [JVM Garbage Collection](https://javaguide.cn/java/jvm/jvm-garbage-collection.html), [ClassLoader and Delegation Model](https://javaguide.cn/java/jvm/classloader.html) và JVM tuning và troubleshooting (tôi từng chia sẻ một số [common online issue cases](https://t.zsxq.com/0bsAac47U), trong đó có liên quan đến JVM).
6. **Các big company khác nhau có trọng tâm phỏng vấn khác nhau**. Ví dụ nếu bạn vào công ty như Alibaba, project và technical questions là trọng tâm. Bài test của Alibaba thường có code questions, nhưng vào phỏng vấn thực sự ít hỏi code questions hơn, nhưng hỏi khá sâu về nguyên lý, thường hỏi những suy nghĩ của bạn về công nghệ. Nếu bạn phỏng vấn công ty như ByteDance, computer basics đặc biệt là algorithm là trọng tâm. Phỏng vấn ByteDance rất coi trọng coding ability, đôi khi bắt đầu phỏng vấn là ném thẳng cho bạn một code problem, viết xong mới nói chuyện khác. Cũng sẽ hỏi technical questions và project, nhưng tương đối ít hơn nhiều.
7. **Hãy tìm kiếm nhiều kinh nghiệm phỏng vấn** — đặc biệt kinh nghiệm phỏng vấn cho vị trí tương ứng ở công ty mục tiêu hoặc công ty tương tự. Như vậy có thể ôn tập có mục tiêu, đồng thời còn có thể tiện thể tự kiểm tra, kiểm tra mức độ nắm vững của mình.

Tuy nhìn có vẻ rất nhiều technical questions về Java backend, nhưng thực ra thu hẹp phạm vi ôn tập lại, những thứ quan trọng chỉ là những đó. Xét đến vấn đề thời gian, bạn không thể chuẩn bị cả những kiến thức khá cold. Không cần thiết, hãy tập trung chủ yếu vào những kiến thức quan trọng đó trước.

## Làm thế nào để chuẩn bị technical questions hiệu quả hơn?

<img src="/images/github/javaguide/interview-preparation/preparation-for%20eight-part%20essay.png" style="zoom:50%;" />

Đối với technical interview questions, hãy cố gắng không thuộc lòng máy móc — cách này rất nhàm chán và hạn chế trong việc nâng cao năng lực bản thân! Nhưng! Muốn không thuộc chút nào là không thực tế, chỉ là phải kết hợp với tình huống ứng dụng thực tế và thực hành để hiểu và ghi nhớ.

Tôi luôn cho rằng interview questions tốt nhất là nên kết hợp với tình huống ứng dụng thực tế và thực hành. Nhiều bạn hiện nay đang đi sai hướng — vào ngay là thuộc interview questions, biến thành học như khoa học xã hội thuần túy, tất nhiên sẽ chán.

Ví dụ: Project của bạn cần dùng Redis để làm cache, sau khi tham khảo official website và thực hành cơ bản về Redis, bạn đọc các câu hỏi kỹ thuật tương ứng về Redis. Bạn phát hiện Redis có thể dùng để làm rate limiting, distributed lock, thế là bạn thực hành trong project và nắm vững các câu hỏi tương ứng. Tiếp theo, bạn phát hiện khi Redis không đủ memory còn có thể dùng Redis Cluster để giải quyết, thế là bạn lại thực hành một lần nữa và nắm vững các câu hỏi tương ứng.

**Nhất định phải nhớ mục tiêu chính của bạn là hiểu và ghi nhớ keyword, chứ không phải thuộc từng chữ như thuộc bài khóa — điều đó vô nghĩa! Hiệu quả thấp nhất, giúp ích cho bản thân cũng ít nhất!**

Cũng cần chú ý "khéo léo" một chút — đừng chỉ thuộc lòng technical questions. Một số giải pháp kỹ thuật có nhiều cách triển khai, ví dụ distributed ID, distributed lock, idempotent design. Muốn nhớ tất cả giải pháp không thực tế lắm. Chỉ cần tập trung nhớ giải pháp triển khai của project bạn và lý do chọn giải pháp đó là được. Tất nhiên, vẫn khuyến nghị tìm hiểu sơ về các giải pháp khác, nếu không cũng không có cơ sở để so sánh với giải pháp mình chọn.

Muốn kiểm tra bản thân có hiểu không hoặc củng cố ấn tượng, viết blog hoặc dùng cách hiểu của mình để giải thích kiến thức tương ứng cho người khác nghe cũng là một lựa chọn tốt.

Ngoài ra, trong quá trình chuẩn bị technical questions, rất khuyến nghị bạn dành vài tiếng để dựa vào resume (chủ yếu phần project experience) suy nghĩ xem chỗ nào có thể bị đào sâu, rồi thể hiện những suy nghĩ của bạn dưới dạng câu hỏi phỏng vấn. Sau phỏng vấn, còn phải dựa trên tình hình phỏng vấn lúc đó để review lại, hoàn thiện bổ sung các câu hỏi phỏng vấn đã tổng hợp trước đó. Quá trình này cực kỳ hữu ích cho việc cá nhân tiếp tục làm quen với resume của mình (đặc biệt là phần project experience). Những câu hỏi này bạn cũng nhất định phải dành nhiều thời gian hơn để hiểu thấu, có thể diễn đạt trôi chảy. Câu hỏi phỏng vấn có thể tham khảo [Java Common Interview Questions Summary (2024 Latest)](https://t.zsxq.com/0eRq7EJPy), nhớ dựa trên project experience của mình để mở rộng sâu hơn!

Cuối cùng, những bạn chuẩn bị technical interview nhất định phải ôn tập định kỳ (cách tự kiểm tra rất tốt), nếu không thực sự sẽ quên.

## Kế hoạch chuẩn bị phỏng vấn chi tiết (chung cho backend)

[Java Backend Interview Key Points and Detailed Preparation Plan](https://javaguide.cn/interview-preparation/backend-interview-plan.html)
