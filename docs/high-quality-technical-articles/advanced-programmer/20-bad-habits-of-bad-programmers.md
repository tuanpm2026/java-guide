---
title: 20 thói quen xấu của programmer tệ
description: "20 thói quen xấu của programmer tệ - Tổng hợp các điểm thực hành."
category: Technical Articles Selection
author: Kaito
tag:
  - Level-up Strategies
head:
  - - meta
    - name: keywords
      content: programmer bad habits,coding standards,code comments,technical documentation,teamwork,code commits,professionalism,programming cultivation
---

> **Lời giới thiệu**: Bài viết của đại ca Kaito — lời khuyên rất thực tiễn!
>
> **Original article**: <https://mp.weixin.qq.com/s/6hUU6SZsxGPWAIIByq93Rw>

Chắc bạn đã từng gặp loại programmer này: **Dù viết code, viết documentation hay giao tiếp với người khác, họ đều trông rất chuyên nghiệp.** Mỗi lần gặp những người như vậy, tôi thường tự hỏi họ làm được điều đó như thế nào?

Theo thời gian làm việc, tôi dần tổng kết được một số kinh nghiệm. Họ duy trì những thói quen tốt có vẻ rất nhỏ nhặt, nhưng chính những thói quen này thể hiện phẩm chất cơ bản của một excellent programmer.

Hôm nay hãy nhìn theo góc độ khác — xem một programmer tệ có những thói quen xấu nào? Chỉ cần chúng ta tránh được những vấn đề này, sẽ dần tiếp cận được một excellent programmer.

## 1. Không viết hoa đúng chuẩn các technical terms

Dù là trong resume hay technical documents, tôi thường thấy technical terms được viết sai, ví dụ JAVA, javascript, python, MySql, Hbase, restful.

Chuẩn xác phải là Java, JavaScript, Python, MySQL, HBase, RESTful. Đừng coi thường vấn đề này — nhiều interviewers rất có thể loại resume của bạn vì điểm này.

## 2. Viết documentation, mixed Chinese-English không chuẩn

Mô tả tiếng Việt/tiếng Trung dùng English punctuation, English và số dùng full-width characters, không có khoảng cách giữa tiếng Việt và tiếng Anh v.v.

Nhiều người bỏ qua việc thêm "khoảng cách" giữa tiếng Việt và tiếng Anh, số — như vậy layout đọc thoải mái hơn.

## 3. Logic quan trọng không có comment, hoặc comment rườm rà

Nhiều programmers không viết comments cho code complex và quan trọng — ngoài bản thân đọc được, người khác hoàn toàn không hiểu. Hoặc comment có viết nhưng rất rườm rà, không có logic.

Logic quan trọng không chỉ phải có comment mà còn phải viết ngắn gọn và rõ ràng. Nếu là code đơn giản đọc một cái hiểu ngay, không cần comment.

## 4. Viết functions phức tạp và dài dòng

Một function vài trăm dòng, một file hàng nghìn dòng code, complex functions không được split — khiến code ngày càng khó maintain, cuối cùng không ai dám đụng vào.

Các basic design patterns vẫn phải tuân thủ — ví dụ Single Responsibility: một function chỉ làm một việc; Open/Closed Principle: open for extension, closed for modification.

Nếu function logic thực sự phức tạp, ít nhất cũng phải đảm bảo main logic đủ rõ ràng.

## 5. Không đọc official documentation, chỉ xem các blog chất lượng thấp

Nhiều người gặp vấn đề không đọc official documentation mà thích xem các blog copy nhau, đầy lỗi sai.

Thực ra documentation chính thức của nhiều software đã viết rất tốt, các common problems đều tìm được đáp án. Đọc kỹ official documentation tốt hơn xem blog tệ gấp trăm lần. Hãy hình thành thói quen đọc official documentation.

## 6. Tuyên truyền "technical foundations vô dụng"

Một số người ngày ngày theo đuổi các open source projects và frameworks mới nhất nhưng không chịu bỏ thời gian nghiên cứu underlying principles. Common problems có thể giải quyết được, nhưng gặp vấn đề sâu hơn một chút là bó tay.

Nhiều high-level architecture designs thực ra đều có nguồn gốc từ bottom layer. Computer architecture, operating systems, network protocols — đã qua bao nhiêu năm evolution mới trở thành dạng hiện tại, trong quá trình evolution gặp vô số complex problems. Hiểu tư duy giải quyết những vấn đề đó, nhìn vào upper-level technologies sẽ trở nên rất đơn giản.

## 7. Thích khoe kỹ năng

Một số người ngày ngày phủ phục những tech buzzwords "cao siêu", sợ người khác không biết mình học được công nghệ gì. Thích khoe bằng lời, nhưng người khác hỏi chi tiết thì im re.

## 8. Không chấp nhận nghi vấn

Khi người khác đặt câu hỏi về giải pháp mình thiết kế, chỉ biết phản bác thay vì phân tích lý lẽ và trao đổi với thái độ học hỏi.

Những người này học được chút gì đó liền nghĩ mình tài giỏi, không biết mình còn quá ít kinh nghiệm.

## 9. API protocols không chuẩn

Khi thỏa thuận API protocol với người khác, chỉ giao tiếp miệng mà không có documentation rõ ràng. Thậm chí đến lúc test integration mới phát hiện khác với thỏa thuận, hoặc thay đổi protocol mà không thông báo cho đối tác — trải nghiệm hợp tác cực kỳ tệ.

## 10. Gặp vấn đề tự cắm đầu giải quyết mà không báo

Lỗi dễ mắc của junior programmers. Gặp vấn đề chỉ biết tự cắm đầu giải quyết, kéo đến deadline vẫn không có output, leader hỏi mới biết có vấn đề không giải quyết được.

Báo cáo vấn đề kịp thời mới là có trách nhiệm với bản thân và team.

## 11. Nói thì dễ, làm thì hỏng

Bình thường nói technical solutions như mây bay trên trời, để viết code thì hỏng — điển hình của "ambitious nhưng thiếu năng lực thực tế".

## 12. Diễn đạt không logic, không đặt mình vào vị trí đối phương

Thảo luận vấn đề không cung cấp background, vào thẳng solution của mình khiến người khác ngơ ngác, yêu cầu mô tả lại từ đầu lại không nói được rõ.

Học giao tiếp và diễn đạt là nền tảng của hợp tác.

## 13. Không chủ động suy nghĩ, "ngửa tay" xin giải pháp

Gặp vấn đề không Google, không suy nghĩ đã hỏi người khác, thích làm người "ngửa tay xin".

Thời gian của ai cũng quý. Mọi người đều thích bạn đặt câu hỏi sau khi đã có suy nghĩ của mình — một là tránh được nhiều low-level questions, hai là nâng cao chất lượng giao tiếp.

## 14. Lặp đi lặp lại cùng một lỗi

Khi có vấn đề nói lần sau sẽ chú ý, nhưng lần sau vấn đề vẫn vậy — không có trách nhiệm với bản thân. Nói đến cùng là vấn đề thái độ.

## 15. Thêm tính năng không suy nghĩ về extensibility

Chỉ tập trung vào business nhỏ khi thêm tính năng mới, không xem xét extensibility tổng thể của hệ thống — hành vi "pile code" rất nghiêm trọng.

Cần học cách phân tích requirements và những thay đổi có thể xảy ra trong tương lai. Thiết kế solutions tổng quát hơn, giảm chi phí phát triển sau này.

## 16. Interface không self-test, gặp vấn đề không có logs

Interfaces tự phát triển không self-test đã integration test với người khác. Có vấn đề lại nói không có logs — collaboration efficiency cực thấp.

## 17. Commit code không theo chuẩn

Nhiều người commit code không viết description, hoặc viết mô tả vô nghĩa — đặc biệt khi thay đổi rất ít code. Điều này khiến chi phí trace-back tăng cao.

Thiết lập code commit standards giúp mỗi lần commit code không làm thay đổi code quá tùy tiện.

## 18. Tay chân thẳng vào production database

Trực tiếp kết nối production database để sửa data, thậm chí còn quên WHERE condition trong UPDATE/DELETE SQL — gây data incidents.

Phải hết sức thận trọng khi sửa production database. Khuyến nghị nhờ colleague review code trước khi thực hiện.

## 19. Chưa làm rõ requirements đã viết code

Nhiều programmers nhận requirements xong không suy nghĩ nhiều đã viết code. Requirements khác với những gì mình hiểu gây ra rework vô ích.

Dành thêm thời gian clarify requirements có thể tránh được nhiều vấn đề không hợp lý.

## 20. Design quan trọng không có documentation

Design quan trọng không có document output. Khi bàn giao system cho người khác chỉ mô tả miệng — mất key information.

Đôi khi để hiểu một design solution, một good document hiệu quả hơn đọc vài trăm dòng code.

## Tổng kết

Trong những thói quen xấu trên, bạn trúng bao nhiêu cái? Hoặc bạn có gặp ai như vậy xung quanh không?

Tôi cho rằng tránh sớm những vấn đề này là điều một excellent programmer phải làm. Những thói quen này tóm gọn vào 4 khía cạnh:

- Coding cultivation tốt
- Thái độ học hỏi khiêm tốn
- Giao tiếp và diễn đạt tốt
- Chú trọng teamwork

Professional skills của excellent programmers có thể rất khó học trong thời gian ngắn, nhưng những basic professional qualities này hoàn toàn có thể đạt được trong thời gian ngắn.

Hy vọng cả bạn và tôi đều có thể sửa những gì cần sửa và cố gắng đạt những gì chưa đạt được.

<!-- @include: @article-footer.snippet.md -->
