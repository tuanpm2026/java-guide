---
title: Programmer làm thế nào để xuất bản một cuốn sách kỹ thuật
description: "Programmer làm thế nào để xuất bản một cuốn sách kỹ thuật: Tổng hợp các khái niệm quan trọng, câu hỏi phổ biến và điểm thực hành về kiến thức kỹ thuật và tổng kết phỏng vấn, giúp bạn học hiệu quả và chuẩn bị phỏng vấn."
category: Tuyển tập bài viết kỹ thuật chất lượng cao
author: hsm_computer
tag:
  - Programmer
head:
  - - meta
    - name: keywords
      content: programmer xuất bản sách,xuất bản sách kỹ thuật,hợp tác nhà xuất bản,công ty sách,kỹ năng viết sách,thu nhập nhuận bút,viết kỹ thuật,sách bán chạy
---

> **Lời giới thiệu**: Giới thiệu chi tiết về cách programmer xuất bản một cuốn sách của riêng mình từ đầu.
>
> **Nguồn gốc bài viết**: <https://www.cnblogs.com/JavaArchitect/p/12195219.html>

Khi phỏng vấn hoặc tìm kiếm công việc phụ, nếu có thể chứng minh năng lực của mình một cách thuyết phục, khả năng cao bạn sẽ đạt được kết quả gấp đôi với nửa công sức. Làm thế nào để chứng minh năng lực? Có sức thuyết phục nhất là background tại công ty lớn, ví dụ như senior architect tại BAT thì không cần nói thêm gì nữa.

Tuy nhiên, không phải ai ngay khi vào làm cũng trở thành architect ở công ty lớn. Trên con đường tiến bộ, bạn cũng có thể chứng minh năng lực qua công khai bài viết, chuyên mục blog, lượng code GitHub và xuất bản sách/video. So với các cách khác, sách kỹ thuật của riêng bạn vì được nhà xuất bản cấp quốc gia bảo chứng nên dễ được người khác công nhận năng lực hơn. Với một số công ty nhỏ, một cuốn sách của riêng bạn thậm chí có thể là giấy thông hành miễn phỏng vấn. Vì vậy, trong bài này, hãy cùng các bạn programmer thảo luận về chuyện xuất bản sách kỹ thuật.

## 1. Không phải đủ năng lực rồi mới viết sách, mà là trong quá trình viết sách mà nâng cao năng lực

Không ít bạn bè tôi biết đã xuất bản cuốn sách đầu tiên khi làm được 3 năm, có những người giỏi thậm chí xuất bản sách khi còn đang học.

So sánh với đó còn có một quan điểm khác, không ít bạn có thể nghĩ rằng phải đợi kỹ thuật tích lũy đến một mức độ nhất định rồi mới viết. Thực ra điều đó có lẽ không quá tích cực. Vừa viết sách vừa nâng cao kỹ thuật, mà sách viết ra còn có ích cho người khác, điều này hoàn toàn có thể làm được.

Ví dụ bạn muốn tìm hiểu sâu về Python data analysis và machine learning đang khá hot gần đây, thì sau khi học có hệ thống, bạn có thể tổng hợp các case study về web scraping, data analysis và machine learning đã học trước đó, theo cách hiểu của mình, sắp xếp theo cách phù hợp với người mới bắt đầu, là có thể xuất bản sách rồi. Loại sách này không hẳn có ích lớn với người kinh nghiệm, nhưng vì có case study nên tuyệt đối có ích với độc giả mới vào nghề, vì đây là kinh nghiệm thực tiễn. Hơn nữa, nếu không có động lực xuất bản sách, quá trình học đôi khi chỉ là qua loa, chưa chắc có thể toàn tâm đầu tư. Có mục tiêu xuất bản sách, hiệu quả học tập sẽ tốt hơn.

## 2. Sách phù hợp để viết với junior developer, senior developer và architect

Như đã đề cập, junior developer phù hợp viết sách case study. Lấy chủ đề Python web scraping, data analysis, machine learning làm ví dụ. Bạn có thể tìm vài cuốn sách hiện có về lĩnh vực này, những cuốn sách này dù các chương có thể khác nhau, nhưng đọc tổng hợp lại nên có thể bao gồm nội dung của lĩnh vực đó. Sau đó tham khảo cấu trúc của sách người khác, ví dụ một chương viết web scraping, một chương viết pandas, một chương viết matplotlib..., tích hợp lại là có thể tạo thành một cuốn sách với vài chương. Tóm lại, xem người khác đưa vào sách nội dung gì, bạn đừng sao chép, nhưng có thể tham khảo các điểm kỹ thuật người khác viết.

Sau khi xác định chương, lại xác định các mục trong mỗi chương. Ví dụ chương 3 giảng về case study web scraping thì có thể xác định 3.1 giới thiệu khái niệm web scraping, 3.2 cách cài đặt thư viện Scrapy, 3.3 cách phát triển case study Scrapy crawler. Theo thứ tự từ chương đến mục, bạn xác định được framework của một cuốn sách. Vì là sách case study, nên cần đưa ra code chạy được trước, rồi dùng các case study code đó để hướng dẫn người khác vào nghề. Case study không nhất thiết phải sâu, nhưng cần để người mới nhìn vào là hiểu, và sau khi theo hệ thống kiến thức bạn đưa ra mà học từng bước, có thể hiểu được nội dung chủ đề này. Và sau khi đọc xong cuốn sách của bạn, có thể chạy được các case study web scraping, machine learning... bạn đưa ra, nắm vững kiến thức lĩnh vực này và có thể làm được phát triển cơ bản trong lĩnh vực đó. Mục tiêu này, với junior developer, chỉ cần chịu khó bỏ thời gian ra là không khó làm được.

Còn với senior developer và architect, ngoài viết sách thuần case study, còn có thể đưa vào sách những kinh nghiệm phát triển tổng kết được từ các công ty lớn, tức là những "hố" đã vấp phải. Ví dụ khi dùng matplotlib của Python để vẽ legend, có những kỹ năng gì khi thiết lập coordinate axis, gặp những vấn đề phổ biến nào khi thiết lập, nếu sách của bạn có nhiều kinh nghiệm như thế này, hàm lượng gold của sách bạn sẽ cao hơn.

Ngoài ra, senior developer và architect còn có thể viết những cuốn sách kỹ thuật cao hơn, ví dụ chỉ nói về kinh nghiệm thực tiễn trong high concurrency scenarios, hoặc kinh nghiệm dùng k8s+docker để đối phó high concurrency. Trong loại sách này, có thể đưa ra code, còn có thể đưa ra implementation solutions và architecture implementation tips. Ví dụ trong high concurrency scenarios, cache nên chọn như thế nào, cách tránh cache penetration, avalanche và các scenarios như vậy, cách troubleshoot redis problems, cách thiết kế disaster recovery plans. Ngoài hướng này, còn có thể đi sâu vào chi tiết, ví dụ qua việc giải thích Dubbo underlying code, cho mọi người biết cách cấu hình Dubbo hiệu quả và cách troubleshoot khi có vấn đề. Nếu architect hay senior developer có loại sách này để làm background, kết hợp kinh nghiệm làm việc tại big tech, thì có thể tạo dựng tên tuổi cho bản thân.

## 3. Có thể tìm trực tiếp nhà xuất bản, hoặc tìm công ty sách

Trong bài blog này của tôi, [Chuyện nghề tay trái của programmer: Nói về viết sách và quay video](https://www.cnblogs.com/JavaArchitect/p/11616906.html), đã đưa ra sự khác biệt giữa viết sách qua nhà xuất bản và qua công ty sách, mọi người có thể tham khảo và tự quyết định cách xuất bản.

Dù chọn cách nào, trước khi xuất bản bạn cần hiểu rõ một số điều. Có thể một số nhân viên công ty sách không chủ động nói, bạn cần tự hỏi rõ:

- Đối tác của bạn là ai? Công ty xuất bản sách hay nhà xuất bản?
- Sách của bạn sẽ được xuất bản tại nhà xuất bản nào? Những nhà xuất bản nổi tiếng trong nước là Tsinghua, Renmin Youdian, Electronic và Machinery. Các nhà xuất bản khác không phải là không tốt, nhưng ngành nghề công nhận bốn cái đó hơn.
- Người đang trao đổi với bạn, có phải biên tập sách có quyền quyết định cuối cùng không? Hay là nhân viên tại công ty sách? Nhấn mạnh lại, người cuối cùng quyết định sách có xuất bản được không và xác định ý kiến chỉnh sửa là biên tập của nhà xuất bản.

Sau khi so sánh nhà xuất bản và công ty xuất bản sách, tìm hiểu rõ các chi tiết, mọi người có thể tự cân nhắc cách hợp tác. Và thông tin liên hệ của nhà xuất bản và công ty sách đều có trên website chính thức, mọi người có thể tự liên hệ qua email.

## 4. Nếu người khác dùng bạn để thử nghiệm, hoặc không tôn trọng, hãy dừng lại ngay

Trước đây tôi thấy có công ty xuất bản sách tuyển tác giả cho sách hướng đến người mới học Java, và cũng đã chủ động liên hệ với nhân viên liên quan, phản hồi nhận được hầu hết là: "cần viết lại".

Ví dụ tôi gửi outline đi, phản hồi là "cần viết lại", lý do là đối phương chưa học Java, nhưng là người zero-knowledge đọc outline của tôi thấy không học được. Còn viết lại thành kiểu gì, đối phương cũng không nói được, cứ bảo tôi đưa outline mới. Gửi một bản nữa vẫn không pass, lần này tốt hơn một chút, gửi cho tôi outline của vài cuốn sách tương tự khác, bảo tôi tự xem người ta có điểm hay gì. Tóm lại không đưa ra (hoặc không đưa ra được) điểm cải thiện cụ thể, cứ bảo tôi tự thử các điểm cải thiện khác nhau cho đến khi đối phương thấy được mới thôi.

So sánh với khi tôi trao đổi với vài biên tập chuyên nghiệp của nhà xuất bản, dù outline hay bản thảo có vấn đề, đối phương sẽ chỉ ra điểm cụ thể và đưa ra ý kiến chỉnh sửa cụ thể. Tôi không biết cơ cấu tổ chức của công ty sách, nhưng trong nhà xuất bản, sách máy tính có phòng ban và biên tập chuyên trách, ý kiến đối phương đưa ra đều khá chuyên nghiệp và dễ thực hiện chỉnh sửa.

Ngoài ra, trên các kênh khác, thỉnh thoảng tôi thấy nhân viên của công ty xuất bản sách đăng bản thảo người khác giao lên, trước mặt đông đảo mọi người, nói nó có vấn đề gì, ý là để mọi người rút kinh nghiệm. Tạm gác lý do làm vậy là gì, và nhân viên này cũng đã che đi thông tin nhận dạng tác giả. Nhưng tác giả vì tin tưởng mà giao bản thảo cho bạn, công khai bản thảo mà không xin phép tác giả, nói "không coi tác giả ra gì" cũng không sai. Hoàn toàn có thể trao đổi với tác giả qua tin nhắn riêng, không cần công khai lỗi vô ý của tác giả trước mặt mọi người.

Khi tôi hợp tác với nhà xuất bản, chuyện như vậy chưa bao giờ xảy ra, và các biên tập nhà xuất bản tôi quen đều tôn trọng đầy đủ các tác giả. Và khi tôi và bạn bè trao đổi với nhiều bạn bè tại công ty sách, cũng được tôn trọng và đối xử lịch sự. Vì vậy, nếu khi viết sách, đặc biệt khi viết cuốn sách đầu tiên, nếu bạn gặp phải chuyện bị dùng để thử nghiệm, hoặc cảm thấy từ lời nói đối phương không coi trọng bạn, hãy dừng lại ngay. Thực ra cũng không có "thiệt thòi" gì, bạn đem outline và bản thảo hiện tại trao đổi với biên tập nhà xuất bản, thu nhập của bạn có thể còn tăng lên.

## 5. Làm thế nào để viết tốt một chương 30 trang?

Sau khi ký hợp đồng viết với nhà xuất bản, bạn có thể bắt đầu sáng tác. Sách được cấu thành từ các chương, ở đây nói về cách cấu trúc và viết một chương.

Ví dụ viết chương web scraping, khoảng 30 trang, trước tiên xác định mục và tiểu mục. Ví dụ 3.1 Thiết lập môi trường web scraping là mục nhỏ, 3.1.1 Tải Python Scrapy package là tiểu mục. Trước tiên xác định nội dung cần viết, cụ thể với mục web scraping, có thể viết 3.1 Thiết lập môi trường, 3.2 Các module quan trọng của Scrapy, 3.3 Cách phát triển Scrapy crawler, 3.4 Cách chạy sau khi phát triển xong, 3.5 Cách đưa thông tin đã scrape vào database, đây đều là các mục nhỏ.

Chi tiết hơn đến tiểu mục, ví dụ trong 3.5: 3.5.1 viết cách thiết lập môi trường database, 3.5.2 viết cách kết nối database trong Scrapy, 3.5.3 đưa ra case study thực tế, 3.5.4 đưa ra các bước chạy và hiệu quả demo.

Như vậy có thể xây dựng framework của một chương. Trong mỗi mục nhỏ, trước tiên đưa ra code có thể chạy được và có thể minh họa vấn đề, sau đó giải thích code, viết cách cấu hình code, những điều cần chú ý khi phát triển, khi cần thiết dùng bảng và hình để giải thích. Với cách tổ chức này, tối đa 3 tuần có thể hoàn thành một chương, nhanh thì một tuần rưỡi là xong một chương.

Tương tự, một cuốn sách thường có khoảng 12 chương, chương đầu có thể giới thiệu cách cài đặt môi trường và cú pháp cơ bản, sau đó từ dễ đến khó, mỗi chương một chủ đề. Ví dụ viết về Python web scraping, chương 2 có thể là cú pháp cơ bản, chương 3 là giao thức HTTP và kiến thức web scraping, từ đó đi sâu, bao gồm web scraping, data analysis, data visualization và machine learning...

Tính như vậy, nếu xuất bản cuốn sách đầu tiên, trung bình một tháng 2 chương, khoảng nửa năm đến tám tháng có thể hoàn thành một cuốn sách. Ý tưởng là trước tiên xây dựng hệ thống kiến thức của sách, khi viết mỗi chương lại xây dựng framework của một điểm kiến thức, trong các mục nhỏ và tiểu mục, dùng code kết hợp với giải thích, từ đơn giản đến khó, như vậy mọi người có thể hoàn thành cuốn sách đầu tiên của riêng mình.

## 6. Làm thế nào để viết một cuốn sách bán được hơn 5000 bản?

Hiện tại sách giấy thường in một lần 2500 cuốn, hầu hết sách thường chỉ in một lần, hết là thôi. Nếu bán được 5000 cuốn thì thuộc loại được ưa chuộng, nếu bán hơn chục nghìn mới có thể gọi là sách tầm master. Ở đây trước tiên không bàn đến sách tầm master, nói về cách viết một cuốn sách bán chạy hơn 5000 cuốn.

1. Tốt nhất là bám sát xu hướng hot, ví dụ xu hướng hiện tại là fullstack development và machine learning. Cách tìm xu hướng hot, lên các trang như JD.com xem từ khóa của sách bán chạy. Cụ thể hơn, trao đổi nhiều với biên tập nhà xuất bản, tác giả thường phân tích từ góc độ kỹ thuật, nhưng biên tập nhà xuất bản nhìn từ góc độ thị trường.

2. Nếu sách của bạn được các cơ sở đào tạo dùng làm giáo trình, thì chắc chắn sẽ rất hot. Các cơ sở đào tạo thường dùng giáo trình nào? Thứ nhất hướng đến người mới học, thứ hai code đầy đủ, thứ ba bao phủ toàn diện các điểm kiến thức trong lĩnh vực đó. Để đạt được điều này, mọi người có thể trao đổi trực tiếp với biên tập nhà xuất bản, hỏi các chi tiết liên quan.

3. Có thể dùng ngôn ngữ sinh động, nhưng không được dùng ngôn từ hoa mỹ để che đi sự thiếu hụt nội dung của sách. Nghĩa là sách bán chạy nhất định phải có kiến thức hữu ích thực tế, có thể giải quyết vấn đề thực tế của người mới học. Ví dụ về hướng Python machine learning, viết một cuốn sách dùng case study bao gồm các thuật toán machine learning phổ biến hiện tại, mỗi chương một thuật toán, và case study có các yếu tố như visualization, data analysis, web scraping, nếu hiệu quả visualization còn hấp dẫn, khả năng bán chạy của cuốn sách này cũng rất cao.

4. Tuyệt đối không được có tâm lý qua loa, code chạy được chưa đủ, còn phải cố gắng làm cho gọn gàng, lời giải thích đa phần hướng đến độc giả. Về nội dung, đảm bảo độc giả nhìn vào là hiểu, và đọc xong là học được gì đó. Điều này nghe có vẻ trừu tượng, nhưng sau khi tôi viết vài cuốn sách, cảm nhận thực sự, làm được điều này rất khó. Nhưng làm được rồi, dù sách không bán chạy, ít nhất không hại người ta.

## 7. Tổng kết: Xuất bản sách chỉ là một cột mốc, programmer trên con đường tiến bộ không bao giờ được dừng lại

Viết sách không đơn giản, vì không phải ai cũng sẵn sàng dành nửa năm đến tám tháng, mỗi tối mỗi cuối tuần bỏ thời gian công sức viết sách. Nhưng viết sách cũng không khó, vì cũng chỉ là debug code và viết văn, nhiều nhất thêm một chút chi phí giao tiếp với người khác.

Thực ra thu nhập từ viết sách không cao, tính ra mỗi tháng khoảng 3k tệ, nếu hợp tác với công ty xuất bản sách, ước chừng còn ít hơn. Nhưng dù sao cũng là bằng chứng cho năng lực của mình. Tuy nhiên sau khi viết sách không thể dừng ở đó, vì trong big tech có quá nhiều người giỏi, thậm chí không cần dùng việc viết sách để chứng minh năng lực.

Vậy làm thế nào để tối đa hóa lợi ích từ việc viết sách? Thứ nhất có thể dùng điều này để vào big tech, khi phỏng vấn có sách của riêng mình chắc chắn là điểm cộng. Thứ hai có thể dùng điều này để mở chuyên mục trên các website lớn, quay video, hoặc mở công khai, vì có nhà xuất bản bảo chứng, dễ thuyết phục người khác về năng lực của bạn. Thứ ba còn phải dùng phương pháp học và tinh thần tiến bộ tích lũy được khi viết sách để tiếp tục nghiên cứu công nghệ cao hơn. Có kỹ thuật tốt, không chỉ vào big tech kiếm được nhiều tiền hơn, còn có thể qua đào tạo doanh nghiệp... kiếm tiền hiệu quả hơn.

<!-- @include: @article-footer.snippet.md -->
