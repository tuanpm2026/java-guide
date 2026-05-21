---
title: Tổng kết 4 năm làm việc tại Tencent từ campus recruitment
description: "Tổng kết 4 năm làm việc tại Tencent từ campus recruitment - Tổng hợp các khái niệm chính, câu hỏi phổ biến và điểm thực hành."
category: Technical Articles Selection
author: pioneeryi
tag:
  - Kinh nghiệm cá nhân
head:
  - - meta
    - name: keywords
      content: Tencent work experience,four-year summary,performance evaluation,EPC measurement,inner circle culture,career development,technical growth,internet workplace
---

Programmer là nghề có tính lưu động rất cao. Thường xuyên có gương mặt mới đến, cũng thường xuyên có gương mặt cũ ra đi. Có người chủ động rời đi, cũng có người bị động nghỉ việc.

Thêm vào đó những năm gần đây cạnh tranh khốc liệt hơn, làm nhiều hơn nhưng nhận được ít hơn. Internet hình như cũng không còn hấp dẫn như trước nữa.

Người đến người đi, trạng thái thay đổi không ngừng — thực ra đã quen từ lâu.

Con đường duy nhất của những người đi làm, không ngoài việc trau dồi kỹ năng chuyên môn, nâng cao core competitive advantage. Như vậy dù có thay đổi gì, đi đâu cũng có cơm ăn.

Hôm nay chia sẻ câu chuyện của một blogger — vào Tencent qua campus recruitment, sau bốn năm làm việc thì rời đi.

Còn tại sao rời đi, tôi cũng không rõ lắm. Có lẽ có lựa chọn tốt hơn, hoặc cảm thấy công việc hiện tại có hạn trong việc nâng cao bản thân.

**"Tôi" trong bài dưới đây chỉ tác giả này.**

> Original article: <https://zhuanlan.zhihu.com/p/602517682>

Sau khi tốt nghiệp thạc sĩ, liên tục làm việc tại Tencent. Không biết không hay đã qua 4 năm. Bản thân không có thói quen tự tổng kết, trước đây chỉ lo chạy về phía trước, quên dừng lại để suy nghĩ và tổng kết. Nhớ đọc một tài liệu career planning nói về concept ba năm một giai đoạn, năm năm một giai đoạn. Bây giờ vừa đúng 4 năm, đồng thời lại rời Tencent — đã đến lúc làm một tổng kết.

Trước tiên đánh giá sơ về 4 năm của mình: Cá nhân tôi cho rằng không hoàn toàn lãng phí và phụ lòng 4 năm này. Tại sao nói vậy? Vì tôi phát hiện so sánh với người khác có vẻ không nhiều ý nghĩa. Người "hơn" tôi rất nhiều; người "kém" tôi cũng không ít. Nói đến cùng, tôi chỉ là người bình thường, tài không xuất chúng, kỹ thuật không áp đảo. Chấp nhận sự bình thường của mình, rồi xem những gì mình làm có khiến bản thân hài lòng không là được.

Dưới đây nói cụ thể vài điểm. Tôi chủ yếu muốn nói về công việc, performance, EPC, quan điểm về inner circle culture, cuối cùng nói về những gì thu hoạch được.

## Tình hình công việc

Tôi ở Tencent không chuyển bộ phận, nhưng những projects làm qua cũng khá phong phú, bao gồm: BUGLY, distributed call chain (Huskie), crowdsourcing system (SOHO), EPC measurement system. Trong đó một số là đối ngoại, một số là internal systems. Có thể một số bạn không biết. Vẫn khá biết ơn những project experiences này — có cả pure business systems lẫn framework-oriented systems, giúp tôi học được nhiều kiến thức.

Tiếp theo giới thiệu sơ về từng project — xét cho cùng mỗi project đều bỏ rất nhiều tâm sức:

BUGLY — đây là hệ thống báo cáo terminal crash qua mạng, nhiều APP đã tích hợp vào. Huskie — đây là distributed call chain tracking project dựa trên zipkin. SOHO — đây là crowdsourcing system, chủ yếu đưa data annotation và voice collection tasks ra outsource để người khác làm. EPC measurement system — đây là R&D effectiveness measurement system, chủ yếu đo lường R&D effectiveness.

Ở đây tôi nói về hiểu biết và nhận thức về business development. Nhiều người có thể giống tôi ban đầu — có một thắc mắc: làm business development suốt ngày thì làm thế nào để phát triển? Nói cách khác là làm CRUD suốt ngày thì phát triển như thế nào? Tôi lúc đầu cũng có thắc mắc này, sau đó tôi thay đổi quan điểm.

Tôi nghĩ về system complexity có thể chia thô thành technical complexity và business complexity. Business systems có business complexity cao hơn. Framework systems có technical complexity cao hơn. Giải quyết cả hai loại complexity đều có thách thức rất lớn.

Crowdsourcing system làm trước đây, là đủ loại business logic, tách ra, đảo qua, thực ra đây chính là business complexity cao. Để giải quyết vấn đề này, chúng tôi bắt đầu explore và practice DDD (Domain-Driven Design), quả thực mang lại một số giúp đỡ, không đến nỗi hệ thống hỗn loạn như vậy. Đồng thời tôi cảm thấy trong quá trình này, những hiểu biết của mình về DDD, đã mang lại giúp đỡ cho việc phân chia, thiết kế và phát triển system sau này của mình.

Tất nhiên DDD không phải silver bullet, tôi cũng không thổi phồng nó tốt đến đâu. Chỉ là sau khi hiểu nó, đôi khi thiết kế và phát triển có thể đổi hướng suy nghĩ.

Có thể thấy, thực ra làm business bình thường, muốn làm tốt, cũng không đơn giản như vậy. Nếu có thể explore và practice nhiều hơn, giới thiệu một số methods tốt, ideas hoặc architectures vào, sẽ có ích cả cho bản thân lẫn business.

## Tình hình Performance

Tôi làm tại Tencent 4 năm. Tencent đánh giá 6 tháng một lần, tổng cộng 8 lần. Nhớ lại tình hình performance 4 năm: 3 sao, 3 sao, 5 sao, 3 sao, 5 sao, 4 sao, 4 sao, 3 sao. Tính ra, 4-5 sao chiếm đúng một nửa.

![](https://oss.javaguide.cn/github/javaguide/high-quality-technical-articles/640.png)

PS: May còn có trophy, không thì không có gì để nhớ. (Tencent hình như không phát nữa rồi)

Ấn tượng nhất là hai lần đạt 5 sao. Lần đầu tiên 5 sao là năm làm việc thứ hai. Năm đó đang làm crowdsourcing project. Vì project bản thân không quá khó, tôi đầu tư một phần sức lực vào infrastructure của team — giúp team dựng Java và Golang project scaffolding, rồi làm vài lần technical sharing ở center. Cuối cùng Leader thấy tôi thể hiện khá nổi bật nên cho 5 sao. Có vẻ chủ động hơn một chút, có ích cả cho bản thân lẫn team, cuối cùng cũng nhận được một số hồi báo.

Lần 5 sao thứ hai liên quan đến EPC. Nói một chuyện buồn cười, là tôi biết sau này. Giai đoạn đầu project, Director đi báo cáo, demo system cho boss xem — load rất lâu chỉ số mới hiện ra. Director hơi xấu hổ nói đang optimize. Một thời gian sau lại đi báo cáo demo, kết quả lại ngại ngùng load rất lâu mới ra. Director đành nói vẫn đang optimize. Không ngờ, mình đã từng làm Director mất mặt đến vậy, haha. Thôi nói về kết quả — cuối cùng tôi tự viết một query engine thay thế Mondrian. Sau đó tình huống ngại ngùng đó không bao giờ xảy ra nữa. Theo đó, cũng được thưởng performance tốt như là khích lệ. Làm EPC measurement project, tôi cảm thấy bản thân phát triển rất nhiều. Ví dụ stress resistance — khi bạn xây dựng một hệ thống từ zero đến one, sẽ có quá trình "trụ trước rồi optimize sau". Ngoài ra nếu project rất quan trọng, đặc biệt là liên quan đến data, thì bất kỳ vấn đề nhỏ nào cũng có thể khiến thần kinh căng thẳng, phải nghĩ hết cách giảm thiểu rủi ro và sự cố. Ngoài ra, cảm nhận khác biệt khác là — những project trước đây tôi hầu hết là developer, còn hệ thống này tôi là Owner phụ trách. Khi bạn Own một hệ thống, phải luôn chịu trách nhiệm, đồng thời cần suy nghĩ về planning và direction của hệ thống. Ngoài ra còn cần phân bổ requirements và kiểm soát tiến độ. Trải nghiệm role hoàn toàn khác trước đây.

## Nói về EPC

Nhiều người chửi EPC, hoặc cười EPC. Là một trong những core developers của measurement platform, tôi đưa ra quan điểm khách quan.

Thực ra ý định ban đầu của EPC rất tốt — hy vọng thông qua R&D effectiveness indicators đa chiều toàn diện để đo lường chất lượng các khâu của R&D effectiveness, từ đó push back lên business, nâng cao R&D effectiveness. Nhưng trong quá trình thực hành, mới phát hiện điều kiện khách quan không hỗ trợ (tools chưa được xây dựng tốt). Ngoài ra, việc theo đuổi indicator data mù quáng khiến người bên dưới tìm đủ cách làm cho indicators trông đẹp, cuối cùng đi ngược mục đích ban đầu.

Tại sao nói EPC tốt? Thực ra nếu bạn tìm hiểu kỹ EPC, bạn sẽ phát hiện nó là một bộ hệ thống measurement indicators khá hoàn chỉnh và tiên tiến. Bao phủ các khâu requirements, code, defects, testing, CI/CD, operations deployment.

Ngoài ra, trong quá trình này, mặc dù một số người và business gian lận, nhưng phần lớn business vẫn có những thay đổi. Ví dụ người bên Weishi phản hồi là trước đây code viết như c\*t. Khi có EPC, code quality tốt hơn rất nhiều. Mặc dù cuối cùng Weishi vẫn tắt, nhưng tòa nhà sắp đổ, EPC cứu không được. Tắt rồi cũng không thể đổ lỗi cho EPC.

## Nói về Inner Circle Culture

Mọi người đều nói Tencent inner circle culture thịnh hành. Nhưng thực ra tôi thấy công ty nào cũng vậy. Điều này cũng phù hợp với quy luật cơ bản của sự vật — người ta chỉ tin những người mình tin tưởng và quen biết. Là leader, bạn có giao việc quan trọng cho người mình không quen biết không?

Thực ra tôi cũng không biết mình có phải inner circle hay không. Trên Maimai có người hỏi "làm thế nào biết mình có phải inner circle không". Có một câu trả lời tôi thấy rất hay: Nếu bạn không biết mình có phải inner circle không, thì bạn không phải. Haha, nói vậy thì tôi có thể không phải.

Nhưng mặt khác, sau này tôi phụ trách những việc rất quan trọng trong team, nghe nói là rất quan trọng trong center. Tôi một mình phụ trách một hướng, báo cáo thẳng lên Director — cũng có vẻ hơi giống một chút.

Trên mạng còn có cách nói khác, thẳng vào vấn đề: Inner circle hay không, nhìn xem tiền có đến không. Nói vậy cũng có lý. Khi tôi còn level 7, đã được cấp stock — tự cảm thấy cũng không tệ. Lúc đó tôi tưởng nếu không có accident, tương lai tiền đồ và phát triển của mình sẽ thuận buồm xuôi gió. Không accident thì accident xảy ra — năm thứ hai, EPC không đạt kỳ vọng, General Manager và Director của bộ phận đều bị thay. Center đến một Director mới.

Thôi, lại phải xây dựng lại sự tin tưởng từ đầu. Sau đó, inner circle hay không cũng không quan trọng nữa — vì environment không tốt, cộng thêm layoffs, mọi người chủ động hay bị động đều ra đi gần hết.

Tổng kết: Sự tồn tại của inner circle thực ra cũng có lý do. Làm thế nào trở thành inner circle? Thực ra tôi cũng không biết. Nhưng tôi nghĩ, thay vì suy nghĩ cách trở thành inner circle, không bằng suy nghĩ cách thể hiện giá trị và năng lực của mình. Khi người ta phát hiện giá trị và năng lực của bạn, cơ hội nhiều hơn tự nhiên sẽ đến với bạn. Có cơ hội rồi, miễn là nắm bắt tốt, thì sẽ có thêm nhiều lợi ích.

## Nói thêm về những gì thu hoạch được

Thu hoạch — cái gì được gọi là thu hoạch? Cá nhân tôi cho rằng dù là vật chất bên ngoài như skills, level; hay những cảm nhận, nhận thức bên trong — đều là thu hoạch.

Trước tiên nói về những gì có thể quantify:

- Về level, đã lên level 9, Senior Engineer. Mặc dù mọi người đều nói level Tencent bị depreciate, nhưng bản thân có năng lực senior hay không thực ra mình biết. Cá nhân tôi cảm thấy, qua mấy năm nỗ lực, tôi đã đạt được trạng thái tôi từng nghĩ mình cần đạt khi ở level senior.
- Về performance, tự đánh giá — cá nhân không phải người đặc biệt "involuted", hoặc nói không "involute" để mà involute. Nhưng nếu tôi xác định cần làm tốt một việc, Owner awareness và thái độ có trách nhiệm của tôi thì tôi nghĩ là được. Cuối cùng performance 4 năm tại Tencent cũng tạm ổn. Nói thêm về một số soft skills:

**1. Documentation ability**

Với programmer, documentation ability thực ra là năng lực rất quan trọng. Thực ra tôi cũng không cảm thấy documentation ability của mình tốt đến đâu. Nhưng hai Director trước và sau đều nói documentation của tôi không tệ. Vậy thì có thể, tôi đang trên mức trung bình.

**2. Định rõ hướng đi**

Cuối cùng nói một điều trừu tượng hơn nhưng tôi cho là thu hoạch có giá trị nhất: Tôi dần làm rõ, hay xác định hướng đi tương lai — đó là đi theo hướng data development.

Thực ra tìm và xác định một mục tiêu rất khó. Người có mục tiêu và hướng đi rõ ràng xung quanh rất ít, phần lớn đều mơ hồ.

Một thời gian trước, trò chuyện với người ta về career planning, nói có thể suy nghĩ từ hai góc độ:

- Chọn một business direction, ví dụ e-commerce, advertising, liên tục tích lũy business domain knowledge và business-related skills. Theo sự tích lũy kinh nghiệm không ngừng, cuối cùng bạn sẽ là expert trong lĩnh vực đó.
- Đi sâu vào một tech direction, không ngừng nghiên cứu bottom-layer tech knowledge — như vậy có hy vọng trở thành tech expert trong lĩnh vực đó. Nói thật, mặc dù tôi đã nghiên cứu sâu và practice DDD, cũng dùng nó để model và giải quyết một số complex business problems. Nhưng tận đáy lòng, thực ra tôi thích nghiên cứu kỹ thuật hơn, đồng thời tôi cũng rất quan tâm đến big data. Vì vậy tôi quyết định rồi — hướng tương lai là làm data-related work.

Bốn năm ở Tencent là công việc đầu tiên của tôi. Quen biết nhiều người giỏi, học được nhiều thứ. Cuối cùng tự mình chủ động rời đi, cũng coi như ra đi thể diện (dù đã mất đi severance package lớn). Vẫn cảm ơn Tencent.

<!-- @include: @article-footer.snippet.md -->
