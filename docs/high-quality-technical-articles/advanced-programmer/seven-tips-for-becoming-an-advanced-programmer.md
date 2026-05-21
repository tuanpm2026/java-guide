---
title: 7 lời khuyên cho các bạn muốn phát triển lên senior developer
description: "7 lời khuyên cho các bạn muốn phát triển lên senior developer - Tổng hợp các khái niệm chính, điểm thực hành giúp bạn học hiệu quả."
category: Technical Articles Selection
author: Kaito
tag:
  - Level-up Strategies
head:
  - - meta
    - name: keywords
      content: programmer growth,senior developer,requirements review,technical foundations,performance optimization,online issue troubleshooting,summarization,career development
---

> **Lời giới thiệu**: Programmer thông thường muốn phát triển lên senior programmer hoặc thậm chí expert và các cấp độ cao hơn nên chú ý tăng cường ở những mặt nào? Feige, chủ tài khoản "Developer Foundation Practice", đã đưa ra 7 lời khuyên thực tiễn trong bài viết này.
>
> **Content overview**:
>
> 1. Tăng cường có chủ ý khả năng requirements review
> 2. Chủ động suy nghĩ về efficiency
> 3. Tăng cường khả năng kỹ thuật cơ bản
> 4. Suy nghĩ về performance
> 5. Coi trọng môi trường production
> 6. Quan tâm đến big picture
> 7. Khả năng tổng hợp và tóm lược
>
> **Original article**: <https://mp.weixin.qq.com/s/8lMGzBzXine-NAsqEaIE4g>

### Lời khuyên 1: Tăng cường có chủ ý khả năng requirements review

Bắt đầu từ requirements review. Ở các công ty internet, requirements review là đầu vào chính của công việc phát triển.

Với programmer thông thường, nhìn chung dựa vào requirements details mà product manager đưa ra, bắt đầu nghĩ chức năng này sẽ implement như thế nào, chi phí phát triển cần bao lâu. Coi mình như người phiên dịch giữa requirements và code. Hiếm khi nghĩ về sự hợp lý của requirements, việc mình làm có bao nhiêu value — cũng không quan tâm không hỏi.

Còn với senior programmers, họ không ngay từ đầu đã sa vào chi tiết, mà sẽ nhiều hơn là xuất phát từ chính sản phẩm, hỏi product manager tại sao lại làm chi tiết này, mục đích là gì. Nói cách khác, họ sẽ trước tiên xem xét requirement này có hợp lý không.

Nếu requirement cấp cao mà không hợp lý thì sẽ PK — hoặc điều chỉnh requirement, hoặc cắt bỏ. Nhưng cần chú ý: PK và điều chỉnh requirements không chỉ là cắt requirements, còn có một hướng khác là tăng cường requirements.

Product colleagues vì thiếu technical background, rất có thể chưa nghĩ đủ sâu. Lúc này nếu bạn có ideas tốt hơn, hoàn toàn có thể đưa ra, thêm vào requirements, làm cho requirement đó có giá trị hơn.

Tóm lại, senior programmers không lần lượt theo từng requirement document của product manager để phát triển tiếp theo, mà là **xuất phát từ tất cả những gì có lợi cho business, xóa, sửa, thêm requirements của product manager.**

Công việc này nhìn bề ngoài có vẻ không liên quan đến phát triển, nhưng chỉ như vậy mới đảm bảo tất cả developers sau này đều làm việc có giá trị, thay vì làm nhiều thứ vô ích. Làm nhiều thứ vô ích sẽ làm giảm đáng kể cảm giác thành tựu của developers.

Vì vậy, **programmer thông thường muốn phát triển lên level cao hơn, nhất định phải tăng cường tu dưỡng khả năng requirements review**.

### Lời khuyên 2: Chủ động suy nghĩ về efficiency

Programmer thông thường viết code theo một quy trình nhất định, có việc thì làm, không có việc thì ngồi. Hiếm khi suy nghĩ sâu xem code hiện tại tại sao phải viết như vậy, ưu điểm của cách viết này là gì, chỗ nào có bottleneck, mình có thể tối ưu một chút không.

Còn senior programmers không giới hạn bản thân ở việc hoàn thành phần việc đang làm là xong. Họ sẽ chủ động cân nhắc: mô hình phát triển hiện tại có phải không tốt không. Vậy mình có thể làm gì để nâng cao efficiency?

Lấy một ví dụ nhỏ: 6 năm trước khi tôi tiếp nhận một project, tôi phát hiện operations colleague một tháng tìm tôi 4 lần chỉ để tôi gửi một push notification. Cô ấy nói những developer trước đây đều giúp cô ấy vậy. Mặc dù requirement này xử lý rất đơn giản, sửa hai dòng deploy là xong. Nhưng phiền lắm — hình dung đang tập trung viết code thì cô ấy lại đến, cắt đứt toàn bộ suy nghĩ. Và thao tác production thường xuyên vốn đã gây ra rủi ro không xác định, lỡ hôm nào tay run làm sai là hỏng hết.

Cách tôi làm là dành riêng một tuần để tạo một operations backend cho cô ấy. Từ đó trở đi tất cả operations notifications cô ấy trực tiếp thao tác trên backend là xong. Tôi có thêm sức lực để làm những việc có giá trị hơn.

Vì vậy, **lời khuyên thứ hai là chủ động suy nghĩ xem trong công việc hiện tại có chỗ nào efficiency có thể cải thiện. Nghĩ đến thì chủ động cải thiện!**

### Lời khuyên 3: Tăng cường khả năng kỹ thuật cơ bản

Những gì được coi là kỹ thuật cơ bản (internal cultivation)? Các readers của tài khoản "Developer Foundation Practice" chắc cũng quen — đó là những nền tảng như operating system, networking mà mọi người đã học ở trường.

Programmer thông thường sẽ nghĩ: những kiến thức cơ bản này tôi đều biết, đại học tôi học suốt bốn năm. Sau khi đi làm không chủ động nhìn lại để tăng cường nâng cấp sâu hơn trong những nền tảng này.

Senior programmers rất rõ ràng: kiến thức học hồi đó chỉ là bề mặt. Ngoài giờ làm việc cũng sẽ nghiên cứu sâu vào Linux, networking và các hướng bottom-layer implementation khác.

Thực tế, những tech giants trong industry internet rất nhiều phần là vì hiểu biết nền tảng rất sâu sắc — có nền tảng kỹ thuật vững mới thúc đẩy họ trở thành tech giants.

Tôi khó tin rằng một developer không hiểu bottom layer, chỉ biết CRUD, chỉ biết dùng framework của người khác, sẽ phát triển thành tech giant theo hướng kỹ thuật.

Vì vậy, **cũng khuyến nghị nhiều luyện tập bottom-layer tech foundation**. Nếu không biết luyện thế nào, hãy kiên trì đọc tài khoản "Developer Foundation Practice".

### Lời khuyên 4: Suy nghĩ về performance

Programmer thông thường thường chỉ làm xong requirement rồi thôi, miễn là requirement được implement, test pass là có thể delivery. Tương lai traffic sẽ lớn đến đâu chưa nghĩ. QPS service mình hỗ trợ được bao nhiêu không rõ.

Còn senior programmers thường quan tâm đến performance của code mình viết ra.

Trong requirements review, họ thường đã estimate sơ bộ request traffic sẽ lớn đến mức nào. Từ đó giai đoạn design sẽ dựa trên volume đó để thiết kế phương án đáp ứng yêu cầu performance.

Trước khi launch cũng sẽ thực hiện performance load testing, kiểm tra xem performance có đạt kỳ vọng không. Nếu performance có vấn đề, bottleneck ở đâu, tối ưu như thế nào.

Vì vậy, **lời khuyên thứ tư là nhất định phải chủ động quan tâm nhiều hơn đến performance của business mình phụ trách, và liên tục tối ưu cải thiện**. Tôi nghĩ mức độ quan trọng của lời khuyên này rất cao. Nhưng điều này đòi hỏi bạn phải có nền tảng kỹ thuật sâu vững mới làm được — nếu bạn còn không hiểu network hoạt động như thế nào, làm sao nói đến tối ưu!

### Lời khuyên 5: Coi trọng môi trường production

Programmer thông thường thường ít quan tâm đến production, servers trong đầu ghi nhớ chỉ là dev machine và deployment machine. Production có bao nhiêu machines, traffic lớn thế nào, gần đây có fluctuations không — những điều này có thể đều không biết.

Còn senior programmers hiểu rõ — nếu có điều kiện, sẽ cố gắng thường xuyên quan sát production services của mình. Xem code chạy như thế nào, có error logs không. Lúc request peak, CPU và memory consumption thế nào. Network port consumption thế nào, có cần điều chỉnh một số parameter configurations không.

Khi performance không như ý, có thể sẽ quay lại suy nghĩ ra phương án cải tiến performance, phát triển và launch lại.

Bạn sẽ nhận ra: khi production có vấn đề, những người có thể khẩn cấp lao vào tuyến đầu chữa cháy đều là senior programmers.

Vì vậy, **lời khuyên thứ năm của Feige là hãy thường xuyên quan sát tình trạng vận hành production**. Chỉ khi thường xuyên quan tâm production, khi production gặp sự cố, bạn mới đủ khả năng đảm nhận trách nhiệm khẩn cấp giải quyết vấn đề production.

### Lời khuyên 6: Quan tâm đến big picture

Programmer thông thường: bạn phân module nào cho tôi thì tôi làm module đó. Tự đặt ra boundary rất nhỏ cho công việc của mình, tất cả tầm nhìn đều tập trung trong cái ô nhỏ đó.

Senior programmer: tất cả project modules trong team, dù không phải họ phụ trách, họ cũng sẽ làm quen và tìm hiểu. Người có tư duy này dù về mặt kỹ thuật hay nghiệp vụ đều phát triển nhanh nhất. Người được thăng cấp level hoặc được đề bạt chức vụ thường cũng là loại người này.

Thậm chí những người ở level cao hơn không chỉ đặt tầm nhìn trong team, mà còn quan tâm đến các teams khác trong công ty, thậm chí cả business và tech stack trong industry. Viết đến đây tôi nhớ đến câu nói của Zhang Yiming: Không đặt ranh giới cho công việc của mình.

Vì vậy, **lời khuyên là hãy có big picture sense, không chỉ là module bạn phụ trách — toàn bộ project thực ra bạn đều nên quan tâm**. Chứ không phải đến nỗi không biết đồng nghiệp trong nhóm đang làm gì.

### Lời khuyên 7: Khả năng tổng hợp và tóm lược

Programmer thông thường thường làm xong việc là xong, hiếm khi nhìn lại tổng hợp tóm lược kỹ thuật và nghiệp vụ của mình.

Còn senior programmers thường sẽ tóm lược sau khi hoàn thành một việc lớn — làm PPT, viết blog hay gì đó ghi lại. Như vậy vừa là tổng hợp cho công việc của mình, vừa có thể chia sẻ cho các đồng nghiệp khác, thúc đẩy sự phát triển chung của team.

<!-- @include: @article-footer.snippet.md -->
