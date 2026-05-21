---
title: Làm thế nào để nhanh chóng vào guồng làm việc khi mới vào công ty
description: "Làm thế nào để nhanh chóng vào guồng làm việc khi mới vào công ty: Tổng hợp các khái niệm chính, câu hỏi phổ biến và điểm thực hành xung quanh kiến thức kỹ thuật và tổng hợp phỏng vấn, giúp bạn học hiệu quả và chuẩn bị phỏng vấn."
category: Technical Articles Selection
tag:
  - Work
head:
  - - meta
    - name: keywords
      content: new employee,quickly integrate,work mode,understand business,familiar with technology,team collaboration,job change adaptation,programmer onboarding
---

> **Lời giới thiệu**: Rất khuyến nghị mọi người sắp vào/đang làm tại công ty đọc bài viết này — sau khi đọc có thể giúp bạn tránh được nhiều bẫy. Toàn bài có logic rõ ràng, nội dung toàn diện!
>
> **Original article**: <https://www.cnblogs.com/hunternet/p/14675348.html>

![Làm thế nào để nhanh chóng vào guồng khi mới vào công ty](/images/github/javaguide/high-quality-technical-articles/work/%E6%96%B0%E5%85%A5%E8%81%8C%E4%B8%80%E5%AE%B6%E5%85%AC%E5%8F%B8%E5%A6%82%E4%BD%95%E5%BF%AB%E9%80%9F%E8%BF%9B%E5%85%A5%E7%8A%B6%E6%80%81.png)

Mùa nhảy việc "vàng tháng 3 bạc tháng 4" hàng năm sắp kết thúc. Tin rằng nhiều bạn đã tìm được công việc ưng ý và sắp sửa hoặc đã có một khởi đầu mới.

Những ai đã có kinh nghiệm nhảy việc đều biết — khi đến công ty mới, bạn có thể phải đối mặt với business mới, công nghệ mới, team mới... Những điều này có thể phá vỡ tư duy làm việc, thói quen coding, cách hợp tác của bạn trước đó...

Còn về phía công ty, không thể cho bạn vài tháng để từ từ làm quen. Lúc này, làm thế nào để nhanh chóng vào guồng làm việc và sớm phát huy giá trị của mình là rất quan trọng.

Một số người có thể may mắn — công ty mới vào có quy trình và cơ chế hoàn chỉnh, giúp người mới nhanh chóng vào guồng qua one-on-one coaching và các hình thức đào tạo khác. Một số người thì không may mắn như vậy. Ví dụ như tôi vài năm trước nhảy vào một công ty, lúc đó chưa có cơ chế dẫn dắt người mới hoàn chỉnh như bây giờ, lại đúng lúc team bận nhất. Vừa vào công ty, chiều hôm đó đã được giao mấy vấn đề production để điều tra, không có bất kỳ tài liệu hay đào tạo nào. Gặp tình huống như vậy, nhiều người có thể vì khó thích nghi nhanh, cuối cùng không chịu được áp lực mà có ý muốn nghỉ.

![bad175e3a380bea.](https://hunter-picgos.oss-cn-shanghai.aliyuncs.com/picgo/bad175e3a380bea..jpg)

Vậy **chúng ta nên làm thế nào để nhanh chóng vào guồng làm việc, thích nghi với nhịp độ công việc mới?**

Khi đối mặt với đống code repositories ở công việc mới, nhiều người thường cảm thấy không biết bắt đầu từ đâu. Nhưng nhìn lại kinh nghiệm làm việc và project trước đây, chúng ta có thể phát hiện chúng có những điểm chung. Khi bắt đầu một project mới, thường sẽ qua các bước: requirements -> design -> development -> testing -> release, cứ vậy lặp đi lặp lại, chúng ta hoàn thành hết project này đến project khác.

![Project flow](/images/github/javaguide/high-quality-technical-articles/work/image-20220704191430466.png)

Trong quá trình này chủ yếu có bốn mặt kiến thức xuyên suốt là business, technology, project và team. Khi mới vào công ty, mục tiêu giai đoạn đầu là có khả năng làm project cùng team. Vì vậy, những kiến thức cần nắm nhanh cũng phải tiếp cận từ bốn mặt này.

## Business (Nghiệp vụ)

Nhiều người có thể nghĩ rằng là người làm kỹ thuật, điều nên hiểu nhất không phải là công nghệ hay sao? Vì vậy khi vào công ty mới, họ vội vã đọc các tài liệu kỹ thuật, system architecture, thậm chí ôm source code vào "nghiền". Nếu bạn cũng làm như vậy thì sai to! Ở hầu hết công ty, technology tồn tại như một công cụ. Dù quan trọng, nó tồn tại để mang lại business. Technology giải quyết câu hỏi làm thế nào, còn business mới cho chúng ta biết làm gì và tại sao làm. Một khi tách khỏi business, technology sẽ hoàn toàn vô nghĩa.

Để hiểu business, có hai cách rất quan trọng:

**Một là hỏi**

Nếu team bạn join có cơ chế đào tạo business hoàn chỉnh, tài liệu requirements chi tiết, có thể bạn không cần hỏi quá nhiều mà vẫn hiểu được business — nhưng đây chỉ là tình huống lý tưởng, hầu hết công ty không có điều kiện này. Vì vậy chỉ có thể dựa vào việc hỏi.

Ở đây phải nói thêm: Là người mới nhất định phải có độ dày mặt nhất định — không biết phải hỏi. Tôi thấy nhiều người mới vì tính hướng nội, nhút nhát, khi gặp thắc mắc không dám hỏi — điều này khiến họ rất lâu mới hòa nhập được với team và đảm nhận trách nhiệm quan trọng hơn. Đừng sợ bị mắng hay bị cãi lại — và tôi tin tuyệt đại đa số programmer đều dễ giao tiếp!

**Hai là thông qua testing**

Tôi cho rằng testing hoàn toàn là một cách để nhanh chóng hiểu business của team. Thông qua testing chúng ta có thể đi qua overall flow của project mà team phụ trách. Khi gặp chỗ không đi được hoặc không hiểu, hỏi ngay. Trong quá trình này chúng ta tự nhiên sẽ nhanh chóng hiểu được core business flow.

Trong quá trình tìm hiểu business, nên chú ý đừng quá đào sâu vào chi tiết. Mục đích là trước tiên hiểu tổng thể business flow — chúng ta phục vụ những user nào, cung cấp những dịch vụ gì...

## Technology (Công nghệ)

Sau khi tìm hiểu sơ về business, đến lượt technology. Có thể bạn đã sẵn sàng mở source code, nhưng vẫn nhắc bạn một câu: chưa cần vội.

Lúc này nên dựa trên business đã tìm hiểu được, kết hợp với kinh nghiệm làm việc trước đây để suy nghĩ: Nếu là mình tự triển khai hệ thống này, sẽ làm như thế nào? Bước này rất quan trọng — sau này khi tìm hiểu cụ thể về tech implementation của hệ thống, có thể so sánh xem có những điểm gì khác biệt so với cách nghĩ của mình, tại sao có sự khác biệt đó, cái nào tốt hơn, cái nào không tốt. Với cái không tốt có thể đề xuất ý kiến riêng, với cái tốt hơn có thể học hỏi và áp dụng.

Tiếp theo là tìm hiểu technology, nhưng cũng không phải ngay lập tức đọc source code. **Nên phân tích hệ thống từ macro đến chi tiết, từ ngoài vào trong từng bước.**

Đầu tiên, nên sơ bộ tìm hiểu **tech stack mà team/project sử dụng** — Java hay .NET, hay nhiều ngôn ngữ cùng tồn tại, project là front-back separation hay full-stack, database dùng MySQL hay PostgreSQL... Như vậy chúng ta có thể có kỳ vọng nhất định về công nghệ, framework sử dụng và nội dung mình phụ trách. Điều này một số người có thể đã tìm hiểu sơ khi phỏng vấn.

Bước tiếp theo nên tìm hiểu **macro business architecture của hệ thống**. Team mình chủ yếu phụ trách những hệ thống nào, mỗi hệ thống chủ yếu gồm những modules nào, tương tác với những external systems nào... Về những điều này, tốt nhất có thể tổng hợp ra qua flow chart hay mind map.

Sau đó nên xem **team của mình cung cấp những interfaces hoặc services nào cho bên ngoài**. Mỗi interface và service cung cấp chức năng gì. Về điều này chúng ta có thể tiếp tục test hệ thống của mình — lúc này xem main flow chủ yếu bao gồm những pages nào, mỗi page gọi những backend interfaces nào, mỗi backend interface lại tương ứng với code repository nào. (Nếu làm backend service thuần túy, có thể xem chúng ta cung cấp những services nào, có những upstream services nào, mỗi upstream service gọi những services nào của team mình...). Cũng nên tổng hợp ra bằng cách vẽ sơ đồ.

Tiếp theo cần tìm hiểu **hệ thống hoặc service của mình phụ thuộc những external services nào** — tức là cần hỗ trợ từ những external systems nào. Những services này có thể đến từ bên ngoài team, bên ngoài công ty, hay từ công ty khác. Lúc này có thể xem sơ code để hiểu interaction với external systems được thực hiện như thế nào, bao gồm communication framework (REST, RPC), communication protocol...

Ở tầng code, trước tiên nên tìm hiểu layer structure của code mỗi module — một module được chia bao nhiêu tầng, mỗi tầng có trách nhiệm gì. Hiểu được điều này là có khái niệm ban đầu về toàn bộ system design, tiếp theo là directory structure của code, vị trí config files.

Cuối cùng, có thể tìm một example — có thể là một interface, một page, theo dõi luồng chạy của code từ input đến output, đi qua một lần hoàn chỉnh để verify lại những gì đã tìm hiểu trước đó.

Đến đây việc tìm hiểu ở tầng technology có thể tạm dừng. Mục đích của chúng ta chỉ là có nhận thức ban đầu về hệ thống, những thứ chi tiết hơn sau này sẽ có nhiều thời gian để tìm hiểu.

## Project và Team

Như đã đề cập, khi mới vào công ty, mục tiêu giai đoạn đầu là có khả năng làm project cùng team. Tiếp theo cần tìm hiểu project vận hành như thế nào.

Nên nắm bắt một số key points trong toàn bộ quá trình từ requirements design đến code writing và commit cuối cùng đến release. Ví dụ project dùng agile hay waterfall model, một iteration period kéo dài bao lâu, nguồn gốc và hình thức thể hiện của requirements, có requirements review không, coding standards là gì, sau khi viết xong build như thế nào, commit như thế nào, có commit standards không, delivery test như thế nào, chuẩn bị trước release là gì, deployment tools dùng thế nào...

Về project, chỉ cần quan sát đồng nghiệp hoặc tự mình trải qua một iteration development là có thể hiểu sơ.

Trong khi tìm hiểu project operation, cũng nên tìm hiểu về team. Cũng nên bắt đầu từ bên ngoài — chúng ta đối tiếp với những external teams nào, ví dụ requirements đến từ đâu, có đối tiếp với teams bên ngoài công ty không, những upstream teams cung cấp service là những team nào, những downstream teams phụ thuộc là những team nào, các teams giao tiếp với nhau như thế nào, cách giao tiếp phổ biến là gì...

Tiếp theo là bên trong team — có những roles nào trong team, trách nhiệm của mỗi người là gì. Như vậy khi gặp vấn đề cũng có thể biết rõ tìm đồng nghiệp nào để hỗ trợ. Có những activities và meetings định kỳ không, ví dụ daily stand-up, weekly meeting. Có những quy ước bất thành văn không, có những internal reviews, sharing mechanisms không...

## Tổng kết

Khi mới vào công ty, đối mặt với thách thức công việc mới, nhanh chóng vào guồng và phát huy giá trị của mình sẽ mang lại cho bạn một khởi đầu tốt.

Là một programmer, để nhanh chóng vào guồng làm việc, trước tiên phải có khả năng làm project cùng team. Ở đây từ góc độ backend developer, tôi tổng hợp một số phương pháp và kinh nghiệm từ bốn mặt: business, technology, project và team.

Về cách nhanh chóng vào guồng làm việc, nếu bạn có phương pháp và gợi ý tốt, hoan nghênh để lại bình luận.

Cuối cùng hãy dùng một mind map để ôn lại nội dung bài viết này. Nếu bạn thấy bài viết này có ích, có thể follow Official Account ở cuối bài — tôi thường xuyên chia sẻ một số kinh nghiệm và cảm nhận trong quá trình phát triển bản thân, cùng nhau học hỏi và tiến bộ.

<!-- @include: @article-footer.snippet.md -->
