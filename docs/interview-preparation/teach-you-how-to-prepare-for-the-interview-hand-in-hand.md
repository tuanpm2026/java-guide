---
title: Làm thế nào để chuẩn bị phỏng vấn Java hiệu quả?
description: Làm thế nào để chuẩn bị phỏng vấn Java hiệu quả - Từ job-oriented learning, lập danh sách kỹ năng đến tối ưu hóa resume và sprint trước phỏng vấn, cung cấp phương pháp chuẩn bị có hệ thống, giúp bạn đi đúng đường và nâng cao tỷ lệ vượt qua phỏng vấn.
category: Knowledge Planet
icon: path
head:
  - - meta
    - name: keywords
      content: Java interview preparation,efficient interview preparation,job-oriented learning,interview sprint,resume optimization,project preparation,campus recruitment,Java backend
---

::: tip Gợi ý thân thiện
Bài này được trích từ **[《Java Interview Guide》](../zhuanlan/java-mian-shi-zhi-bei.md)**. Đây là chuyên mục dạy bạn cách chuẩn bị phỏng vấn hiệu quả hơn, nội dung bổ sung cho JavaGuide, bao gồm các câu hỏi phổ biến (system design, common frameworks, distributed, high concurrency...) và kinh nghiệm phỏng vấn chất lượng.
:::

Bạn có người bạn như thế này không: kỹ năng lập trình mạnh hơn bạn, nhưng kết quả tìm việc lại không bằng? Thực ra **giỏi kỹ thuật ≠ vượt qua phỏng vấn** — phỏng vấn ngày nay không còn là "biết viết code là được". Đi phỏng vấn mà không chuẩn bị, đa phần là "đâm đầu vào súng".

Hầu hết chúng ta đều là developer bình thường, không có top conference papers hay giải thưởng thi đấu. Đối diện với thực tế "phỏng vấn chế tên lửa, làm việc vặn ốc", chỉ có thể nỗ lực chuẩn bị để vượt qua. Nhưng chuẩn bị phỏng vấn không phải là dùng mẹo nhỏ hay thuộc lòng máy móc. **Tuyệt đối không được tâm lý may rủi với phỏng vấn. Muốn giỏi phải từ bản thân!** Đừng bao giờ nghĩ đọc vài bài kinh nghiệm, xem vài bài phân tích câu hỏi là có thể vượt qua phỏng vấn. Nhất định phải bình tĩnh học sâu!

Bài viết này từ góc nhìn vĩ mô, dẫn dắt bạn hiểu programmer nên chuẩn bị phỏng vấn có hệ thống như thế nào: từ job-oriented learning đến tối ưu hóa resume, sprint phỏng vấn, giúp bạn ít đi vòng và hiệu quả đạt được offer mong muốn.

## Học job-oriented càng sớm càng tốt

Tôi khuyến nghị các bạn còn đang học học tập theo hướng job-oriented càng sớm càng tốt.

**Điều này có mục tiêu hơn, và có thể với xác suất cao giảm thời gian bạn ở trong trạng thái mông lung, phần lớn còn có thể giúp bạn ít đi vòng hơn.**

Nhưng! Đừng hiểu "học job-oriented" là "tôi không cần học các môn computer basics trong lớp nữa"!

Tôi đã nhấn mạnh nhiều lần trong các buổi chia sẻ trước: **Nhất định phải học computer basics nghiêm túc! Operating system, computer organization, computer network thực sự không phải những môn học vô dụng!!!**

Bạn sẽ phát hiện big company phỏng vấn sẽ cần dùng đến, sau khi đi làm cũng sẽ dùng đến. Tôi liệt kê 2 ví dụ!

- **Trong phỏng vấn**: Phỏng vấn kỹ thuật của big company như ByteDance, Tencent và bài test của hầu hết công ty đều sẽ có câu hỏi liên quan đến operating system.
- **Trong công việc**: Khi thực tế sử dụng cache, cache idea ở software layer bắt nguồn từ sự không phù hợp tốc độ giữa database speed, Redis (in-memory middleware) speed và local memory speed. Trong thiết kế computer storage hierarchy, chúng ta cũng có thể tìm thấy vấn đề tương tự và việc sử dụng cache idea: memory được dùng để giải quyết vấn đề disk access quá chậm, CPU dùng three-level cache để giảm bớt sự chênh lệch tốc độ giữa register và memory. Chúng đều đối mặt với cùng một vấn đề (speed mismatch) và cùng một ý tưởng. Vì vậy, các biện pháp tối ưu hiệu năng cache trong thiết kế storage hierarchy của các computer pioneer cũng áp dụng cho tối ưu hiệu năng cache ở software layer.

**Học job-oriented như thế nào?** Nói đơn giản là: Dựa trên yêu cầu tuyển dụng lập danh sách kỹ năng cho vị trí mục tiêu, rồi học và nâng cấp theo danh sách kỹ năng.

1. Trước tiên xác định bạn muốn tìm công việc gì
2. Sau đó dựa trên yêu cầu vị trí tuyển dụng tổng hợp danh sách kỹ năng
3. Dựa trên danh sách kỹ năng viết resume cuối cùng
4. Cuối cùng học và nâng cấp theo yêu cầu của resume

Thực ra đây cũng là ứng dụng của tư duy **Begin with the End in Mind**.

**Begin with the End in Mind là gì?** Nói đơn giản, đây là cách chúng ta đứng từ góc độ kết quả để suy nghĩ vấn đề, xuất phát từ kết quả, dựa vào kết quả để xác định những việc cần làm.

Bạn sẽ phát hiện, thực ra hầu như bất kỳ lĩnh vực nào cũng có thể áp dụng tư duy **Begin with the End in Mind**.

## Biết thời điểm vàng để nộp hồ sơ

Trước phỏng vấn, bạn chắc chắn phải hiểu rõ thời gian cụ thể của spring recruitment và fall recruitment.

Như câu nói "vàng tháng 3 bạc tháng 4, vàng tháng 9 bạc tháng 10" (ý nói tháng 3, 9 là tốt nhất để tìm việc). Qua thời gian đó, nhiều công ty đã không còn HC (head count) nữa.

**Fall recruitment thường bắt đầu từ tháng 7, kéo dài đến cuối tháng 9.**

**Spring recruitment thường bắt đầu từ tháng 3, kéo dài đến cuối tháng 4.**

Nhiều công ty (đặc biệt big company) đến giữa tháng 9 (fall recruitment)/giữa tháng 3 (spring recruitment) rất có thể đã không còn HC. Phỏng vấn thường có ít nhất 3 vòng, một số big company như Alibaba, ByteDance có thể có đến 5 vòng. **Nếu phỏng vấn thất bại cũng không sao, một vòng nào đó thể hiện kém cũng không sao — điều chỉnh tâm lý. Đây không phải lựa chọn duy nhất đúng không? Bạn có thể nộp vào rất nhiều công ty! Điều chỉnh tâm lý.**

## Biết cách lấy thông tin tuyển dụng

Dưới đây là các kênh phổ biến để lấy thông tin tuyển dụng:

- **Official website/Official Account của công ty mục tiêu**: Đây là kênh lấy thông tin tuyển dụng kịp thời và chính thống nhất.
- **Recruitment websites**: [BOSS Direct Hire](https://www.zhipin.com/), [Zhaopin](https://www.zhaopin.com/), [Lagou](https://www.lagou.com/)...
- **Nowcoder**: Mỗi năm fall recruitment/spring recruitment, sẽ có lượng lớn công ty đến Nowcoder đăng thông tin tuyển dụng, còn có rất nhiều nhân viên công ty đến đây đăng bài referral. Địa chỉ: <https://www.nowcoder.com/jobs/recommend/campus>.
- **Super Resume**: Super Resume hiện tích hợp cổng campus recruitment của các doanh nghiệp lớn. Nếu bạn là campus recruitment, click "Campus Recruitment Online Application" có thể đến thẳng trang tích hợp cổng campus recruitment của các doanh nghiệp.
- **Bạn bè quen biết**: Nếu bạn có bạn bè đang làm ở công ty mục tiêu, bạn cũng có thể tìm họ để tìm hiểu thông tin tuyển dụng và nhờ họ refer cho bạn.
- **Career presentations**: Career presentations cũng là một kênh tốt. Tuy nhiên, công ty tốt thường chỉ đến những trường tốt hơn. Có thể chú ý sắp xếp career presentation của công ty mà bạn quan tâm hoặc trực tiếp đến một trường tốt hơn để tham dự career presentation.
- **Khác**: Career information website của trường, diễn đàn trường, QQ group lớp hoặc khóa học.

Đối với campus recruitment, khuyến nghị lấy official website làm chuẩn, nếu có career presentation thì càng tốt. Đối với social recruitment, có thể chú ý hơn đến thông tin vị trí trên các recruitment website lớn như BOSS Direct Hire, Lagou.

Dù campus hay social recruitment, nếu tìm được cơ hội referral đáng tin thì xác suất có được cơ hội phỏng vấn rất cao. Ngoài ra, người refer bạn còn có thể định hướng cho bạn một số gợi ý. Có nhiều cách tìm referral: ưu tiên bạn bè, bạn học quen biết hơn; cũng có thể chú ý thông tin referral trên các tech community và Official Account.

Thông thường chỉ nộp được một vị trí, nhưng cũng có ít trường hợp nộp hai vị trí ở các bộ phận khác nhau. Điều này không ảnh hưởng, nhưng tình hình phỏng vấn lần trước của bạn có thể được ghi lại — nghĩa là dù nộp thành công hai vị trí, nếu phỏng vấn vị trí đầu tiên thất bại, cũng sẽ ảnh hưởng đến vị trí thứ hai, rất có thể bị pass thẳng.

## Dành nhiều thời gian hoàn thiện resume

Nhất định phải coi trọng resume! Bạn bè ơi! Dành ít nhất 2-3 ngày chuyên để hoàn thiện resume của mình.

Gần đây xem nhiều resume, hài lòng rất ít. Tôi đơn giản lấy một cái ra để phân tích (chào đón bổ sung trong phần bình luận).

**1. Phần giới thiệu cá nhân không có nhiều thông tin hữu ích.**

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/format,png.png)

Tech blog, GitHub và giải thưởng trong trường — nếu có thì cố gắng viết vào đây. Bạn có thể tham khảo template dưới để sửa:

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/format,png-20230309224235808.png)

**2. Project experience quá đơn giản, hoàn toàn không có chất lượng**

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/format,png-20230309224240305.png)

Mỗi project experience thực sự chỉ có thể mô tả trong một hai câu? Hay là không muốn viết? Hay là không phải tự mình làm nên không dám viết nhiều?

Nếu có project, bước đầu tiên của technical interview, interviewer thường sẽ cho bạn tự giới thiệu project của mình. Bạn có thể xem xét từ một số hướng sau:

1. Cảm nhận tổng thể của bạn về thiết kế project (interviewer có thể yêu cầu bạn vẽ system architecture diagram).
2. Bạn chịu trách nhiệm gì, làm gì, đóng vai trò gì trong project này.
3. Từ project này bạn học được gì, sử dụng công nghệ nào, học được cách dùng công nghệ mới nào.
4. Trong project này bạn có giải quyết vấn đề gì không? Giải quyết như thế nào? Thu hoạch được gì?
5. Project của bạn sử dụng công nghệ nào? Những công nghệ này bạn đã hiểu thấu chưa? Ví dụ project experience của bạn dùng Seata để làm distributed transaction, thì các câu hỏi liên quan đến Seata bạn phải chuẩn bị trước — như Seata hỗ trợ những config center nào, transaction grouping của Seata làm như thế nào, Seata hỗ trợ những transaction mode nào và cách chọn?
6. Những lỗi bạn đã mắc trong project này, cuối cùng bù đắp như thế nào?

**3. Chứng chỉ computer level 2 đối với sinh viên ngành CS hoàn toàn không cần viết nữa — không có giá trị vàng.**

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/format,png-20230309224247261.png)

**4. Giới thiệu kỹ năng có vấn đề quá lớn.**

![](https://oss.javaguide.cn/github/javaguide/interview-preparation/93da1096fb02e19071ba13b4f6a7471c.png)

- Tech terms nên viết hoa đúng hơn, ví dụ java->Java, spring boot -> Spring Boot. Mặc dù một số interviewer không để ý, nhưng nhiều interviewer sẽ chú ý chi tiết này.
- Giới thiệu kỹ năng quá lan man, không có điểm nổi bật. Không cần toàn năng — làm tốt một lĩnh vực nào đó là được!
- Độ thành thạo của một số kỹ năng như Spring Boot trong phần Java backend development chỉ là "hiểu biết", không thể đáp ứng yêu cầu của doanh nghiệp.

Hướng dẫn viết resume chi tiết cho programmer xem tại: [Programmer's resume should be written like this?](https://javaguide.cn/interview-preparation/resume-guide.html).

## Position match rất quan trọng

Campus recruitment thường khá dung thứ với hướng nghiên cứu trong project experience của bạn. Dù project experience không liên quan đến business cụ thể của công ty, ảnh hưởng thực ra cũng không lớn.

Social recruitment thì khác — xét cho cùng công ty muốn tuyển người có thể đến làm việc ngay, bạn có kinh nghiệm liên quan thì công ty sẽ đỡ vất hơn. Social recruitment thường rất coi trọng work experience và project experience trước đây của bạn. HR khi lọc resume sẽ dựa trên hai mặt thông tin này để phán đoán bạn có đáp ứng yêu cầu tuyển dụng không. Ví dụ bạn nộp vào công ty e-commerce mà bạn không có work experience và project experience liên quan đến e-commerce, HR khi lọc resume rất có thể sẽ loại bạn ngay.

Tuy nhiên, điều này cũng không tuyệt đối. Một số công ty khi tuyển dụng coi trọng work experience trước đây của bạn hơn, ít quan tâm đến position match. Work experience ở excellent company và project experience có điểm nổi bật đều là điểm cộng. Những công ty này tin rằng nếu bạn đã làm tốt trong một lĩnh vực (như e-commerce, payments), thì chắc chắn cũng có thể trở thành expert trong lĩnh vực khác (như streaming platform, social software) nhanh chóng. Lĩnh vực ở đây không phải tech field, mà thiên về business direction. Tìm việc spanning tech fields (như backend chuyển algorithm, backend chuyển big data) mà không có kinh nghiệm liên quan, gần như là không tìm được. Dù tìm được cũng đa phần sẽ đối mặt với vấn đề HR ép lương.

## Chuẩn bị trước cho technical interview

Trước khi phỏng vấn nhất định phải chuẩn bị trước các câu hỏi phỏng vấn phổ biến:

- Phỏng vấn của bạn có thể liên quan đến những kiến thức nào, những kiến thức nào là trọng tâm.
- Những câu hỏi nào thường hay được hỏi trong phỏng vấn, bạn nên trả lời như thế nào trong phỏng vấn. (Không khuyến nghị thuộc lòng máy móc. Thứ nhất: qua cách thuộc bạn có thể nhớ được bao nhiêu? Nhớ được bao lâu? Thứ hai: cách học theo kiểu thuộc bài rất khó duy trì!)

Trọng tâm ôn tập Java backend interview xem bài: [Java Backend Interview Key Points Summary (Important)](https://javaguide.cn/interview-preparation/key-points-of-interview.html).

Các loại công ty khác nhau có trọng tâm yêu cầu kỹ năng khác nhau. Ví dụ Tencent, ByteDance có thể coi trọng computer basics hơn như network, operating system. Alibaba, Meituan có thể coi trọng project experience, engineering capabilities hơn.

Nhất định đừng có tư tưởng cho rằng technical questions hoặc basic questions không có ý nghĩa lớn. Nếu bạn ôn tập với tư tưởng này, hiệu quả có thể không tốt lắm. Thực ra cá nhân tôi vẫn cho rằng rất có ý nghĩa — technical questions hoặc basic knowledge cũng thường xuyên cần dùng đến trong phát triển hàng ngày. Ví dụ về rejection policy, core parameter configuration của thread pool, nếu bạn không hiểu, dùng thread pool trong project thực tế có thể không rõ ràng, dễ xảy ra vấn đề. Và thực ra những câu hỏi basic này là dễ chuẩn bị nhất — bottom layer principles, system design, scenario questions và đào sâu project của bạn mới là khó nhất!

Tài liệu technical questions đầu tiên khuyến nghị là [《Java Interview Guide》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html) của tôi (kết hợp với JavaGuide sẽ cập nhật hoàn thiện theo tình hình phỏng vấn mỗi năm) và [JavaGuide](https://javaguide.cn/). Bên trong không chỉ là original technical questions mà còn có nhiều nội dung chất lượng hữu ích cho phát triển thực tế. Ngoài tài liệu của tôi, bạn cũng có thể tìm một số bài viết, video chất lượng khác trên mạng để xem.

![《Java Interview Guide》 Content Overview](https://oss.javaguide.cn/javamianshizhibei/javamianshizhibei-content-overview.png)

## Chuẩn bị trước coding problems

Rõ ràng, campus recruitment interview trong nước hiện nay ngày càng coi trọng algorithm hơn, đặc biệt là các big company như ByteDance, Tencent. Phần lớn bài test campus recruitment của các công ty đều có algorithm problems. Nếu AC rate thấp thì cơ bản là trượt rồi.

Đối với social recruitment, algorithm interview cũng có. Tuy nhiên, interviewer có thể coi trọng engineering ability, project experience của bạn hơn. Nếu các mặt khác của bạn đều xuất sắc nhưng algorithm kém, không nhất thiết sẽ trượt. Tuy nhiên, vẫn khuyến nghị luyện algorithm problems để tránh nó trở thành điểm yếu của bạn trong phỏng vấn.

Social recruitment thường ở cuối technical interview, interviewer cho bạn một algorithm problem để giải.

Về cách chuẩn bị algorithm interview, phần Interview Preparation của [《Java Interview Guide》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html) đã giới thiệu chi tiết.

![《Java Interview Guide》 Interview Preparation Section](https://oss.javaguide.cn/javamianshizhibei/preparation-for-interview.png)

## Chuẩn bị trước self-introduction

Self-introduction thường là lần giao tiếp chính thức đầu tiên giữa bạn và interviewer. Đặt mình vào vị trí interviewer suy nghĩ — nếu bạn là interviewer, bạn muốn nghe người được phỏng vấn giới thiệu bản thân như thế nào? Chắc chắn không phải nói vòng vo rằng mình thích lập trình, dành nhiều thời gian học, sở thích là chơi bóng đúng không?

Tôi nghĩ một good self-introduction ít nhất phải bao gồm những yếu tố sau:

- Nói rõ ràng bằng lời ngắn gọn tech stack chính và lĩnh vực sở trường của mình;
- Đặt trọng tâm vào những điều mình giỏi và ưu thế của mình;
- Làm nổi bật năng lực của mình, ví dụ khả năng locate bug của mình đặc biệt tốt.

Nói đơn giản là dùng ngôn ngữ ngắn gọn làm nổi bật điểm sáng của mình — tức là "tự bán hàng"!

- Nếu bạn đã intern ở big company, kinh nghiệm intern đó chính là điểm sáng của bạn.
- Nếu bạn đã tham gia tech competition, kinh nghiệm thi đấu chính là điểm sáng.
- Nếu từ đại học bạn đã tiếp xúc với enterprise-level project, có nhiều hands-on experience, những project experiences đó chính là điểm sáng.
- ……

Lấy ví dụ từ cả góc độ social recruitment và campus recruitment! Hai ví dụ dưới của tôi chỉ để tham khảo. Self-introduction không cần thuộc lòng — nhớ những điểm cần nói, khi phỏng vấn ứng biến theo tình hình công ty cũng ổn. Ngoài ra, thông thường khuyến nghị chuẩn bị hai bản self-introduction: một bản cho HR chủ yếu kể những kinh nghiệm nổi bật của bản thân, kỹ năng lập trình chỉ đề cập qua; một bản cho technical interviewer chủ yếu kể chi tiết kỹ thuật mình biết và project experience.

**Social Recruitment:**

> Xin chào interviewer! Tôi tên là Duxiuer. Tôi hiện có 1.5 năm kinh nghiệm làm việc, thành thạo sử dụng các framework như Spring, MyBatis, hiểu bottom layer Java principles như JVM tuning và có kinh nghiệm phong phú về distributed development. Lý do rời công ty trước là tôi muốn được rèn luyện nhiều hơn về mặt kỹ thuật. Ở công ty trước tôi tham gia phát triển một distributed electronic trading system, chịu trách nhiệm xây dựng basic architecture cho toàn bộ project và thông qua database sharding giải quyết vấn đề database và một số table quá lớn. Hiện website này hỗ trợ tối đa 100,000 người truy cập đồng thời. Ngoài giờ làm việc, tôi dùng thời gian rảnh viết một RPC framework đơn giản sử dụng Netty để network communication. Hiện tôi đã open source project này và nhận được 2k Star trên GitHub! Về sở thích, tôi khá thích tổng hợp và chia sẻ kiến thức đã học qua blog, hiện đã là certified author của nhiều blogging platforms. Trong cuộc sống tôi là người khá tích cực lạc quan, thường giải trí qua thể thao. Tôi luôn rất muốn gia nhập quý công ty, tôi rất thích văn hóa và không khí kỹ thuật của quý công ty, mong được làm việc cùng bạn!

**Campus Recruitment:**

> Xin chào interviewer! Tôi tên là Xiuer. Trong thời gian đại học tôi chủ yếu dùng thời gian ngoài giờ học Java cùng các framework Spring, MyBatis. Trong trường tôi đã tham gia phát triển một exam system, hệ thống này chủ yếu dùng ba framework Spring, MyBatis và Shiro. Trong đó tôi chủ yếu đảm nhiệm backend development, chủ yếu chịu trách nhiệm xây dựng module quản lý quyền hạn. Ngoài ra, tôi đã tham gia một cuộc thi lập trình phần mềm hồi đại học, online food ordering system của tôi và nhóm đã giành được hạng 2. Tôi cũng dùng thời gian rảnh viết một RPC framework đơn giản sử dụng Netty để network communication. Hiện tôi đã open source project này và nhận được 2k Star trên GitHub! Về sở thích, tôi khá thích tổng hợp và chia sẻ kiến thức đã học qua blog, hiện đã là certified author của nhiều blogging platforms. Trong cuộc sống tôi là người khá tích cực lạc quan. Tôi luôn rất muốn gia nhập quý công ty, tôi rất thích văn hóa và không khí kỹ thuật của quý công ty, mong được làm việc cùng bạn!

## Giảm bớt than vãn

Giống như technical interview hiện nay, mọi người đều nói "nội chiến" (competitive), than thở phỏng vấn giờ khó thật. Tuy nhiên, than vãn đơn thuần có ích không? Bạn nói với các ứng viên khác: "Mọi người đừng luyện Leetcode nữa! Đừng chuẩn bị câu hỏi high concurrency, high availability nữa! Giờ cạnh tranh ghê lắm rồi!"

Có ai nghe không? **Bạn không chuẩn bị, nhưng người khác sẽ chuẩn bị! Vậy thì bạn có ngốc không? Hay là thực sự giỏi đến mức không cần chuẩn bị phỏng vấn?**

Vì vậy, bước đầu tiên chuẩn bị phỏng vấn Java, nhất định phải cố gắng giảm than vãn. Than vãn nhiều sẽ ảnh hưởng đến bản thân rất nhiều, khiến bản thân trở nên rất lo lắng.

## Kịp thời review sau phỏng vấn

Nếu thất bại, đừng nản lòng; nếu vượt qua, đừng tự mãn. Phỏng vấn và công việc thực ra là hai chuyện khác nhau — có thể nhiều người không vượt qua phỏng vấn, work ability của họ lại mạnh hơn bạn nhiều, và ngược lại.

Phỏng vấn giống như một cuộc hành trình hoàn toàn mới, thất bại hay thành công đều là chuyện thường. Vì vậy, khuyên mọi người đừng vì phỏng vấn thất bại mà nản lòng, mất đi động lực. Cũng đừng vì phỏng vấn vượt qua mà tự mãn — chờ đợi bạn sẽ là tương lai tươi đẹp hơn, tiếp tục cố lên!

## Tổng kết

Bài này có khá nhiều nội dung. Nếu bài này chỉ cho bạn nhớ 7 câu, hãy nhớ 7 câu dưới đây:

1. Nhất định phải chuẩn bị phỏng vấn trước! Technical interview khác với coding — giỏi lập trình không có nghĩa là nhất định vượt qua technical interview.
2. Nhất định không được có tâm lý may rủi với phỏng vấn. Muốn giỏi phải từ bản thân! Đừng bao giờ nghĩ đọc vài bài kinh nghiệm, xem vài bài phân tích câu hỏi là có thể vượt qua phỏng vấn. Nhất định phải bình tĩnh học sâu! Đặc biệt là các bạn có mục tiêu big company, phải đào sâu nguyên lý hơn!
3. Khuyến nghị sinh viên đại học học job-oriented càng sớm càng tốt. Điều này có mục tiêu hơn và có thể với xác suất cao giảm thời gian mông lung, phần lớn còn có thể ít đi vòng hơn. Nhưng, đừng hiểu "học job-oriented" là "tôi không cần học computer basics trong lớp nữa"!
4. Nhất định đừng có tư tưởng cho rằng technical questions hoặc basic questions không có ý nghĩa lớn. Nếu bạn ôn tập với tư tưởng này, hiệu quả có thể không tốt. Thực ra cá nhân tôi vẫn cho rằng rất có ý nghĩa — technical questions hoặc basic knowledge cũng thường xuyên cần dùng đến trong phát triển hàng ngày. Ví dụ về rejection policy, core parameter configuration của thread pool, nếu không hiểu, dùng thread pool trong project thực tế có thể không rõ ràng, dễ xảy ra vấn đề.
5. Coding problems là tiêu chuẩn bắt buộc của technical interview hiện nay — chuẩn bị sớm!
6. Position match rất quan trọng. Campus recruitment thường khá dung thứ với hướng nghiên cứu trong project experience, dù không liên quan đến business cụ thể của công ty ảnh hưởng cũng không lớn. Social recruitment thì khác — công ty muốn tuyển người có thể đến làm ngay, bạn có kinh nghiệm liên quan thì công ty đỡ vất hơn.
7. Kịp thời review sau phỏng vấn. Phỏng vấn giống như cuộc hành trình mới, thất bại hay thành công đều là chuyện thường. Đừng vì phỏng vấn thất bại mà nản lòng, mất đi động lực. Cũng đừng vì vượt qua mà tự mãn — chờ đợi bạn là tương lai tươi đẹp, tiếp tục cố lên!
