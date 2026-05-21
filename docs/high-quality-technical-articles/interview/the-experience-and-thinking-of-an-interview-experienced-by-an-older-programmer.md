---
title: Trải nghiệm và suy ngẫm về phỏng vấn của một lập trình viên lớn tuổi
description: "Trải nghiệm và suy ngẫm về phỏng vấn của một lập trình viên lớn tuổi: tổng hợp các khái niệm trọng tâm, câu hỏi phổ biến và điểm thực hành về kỹ thuật và phỏng vấn, giúp bạn học hiệu quả và chuẩn bị phỏng vấn."
category: Tuyển tập bài viết kỹ thuật chất lượng cao
author: 琴水玉
tag:
  - Phỏng vấn
head:
  - - meta
    - name: keywords
      content: 大龄程序员面试,面试准备,简历优化,技术面试,面试心态,职业规划,面试技巧,技术原理
---

> **Lời giới thiệu**: Tác giả của bài viết này năm nay 36 tuổi, đã có 8 năm kinh nghiệm phát triển JAVA. Làm tại Alibaba Cloud 3 năm rưỡi, Youzan 4 năm rưỡi — đã là một lập trình viên lớn tuổi tiêu chuẩn. Trong bài viết này, tác giả chia sẻ một số lời khuyên nhỏ về phỏng vấn và nâng cao năng lực cá nhân, rất thực tiễn!
>
> **Tóm tắt nội dung**:
>
> 1. Giới thiệu bản thân là cơ hội để hiểu rõ, sâu sắc và toàn diện hơn về chính mình.
> 2. CV là tinh hoa cô đọng để thể hiện bản thân đầy đủ, cũng là cơ hội nhìn lại bản thân và quá khứ. Không chỉ giới thiệu tóm tắt kỹ năng và kinh nghiệm, mà còn cần làm nổi bật tối đa lĩnh vực thế mạnh của bạn (sự khác biệt hóa).
> 3. Cá nhân tôi không tán thành ném CV tràn lan, mà thiên về đầu tư có định hướng. Đầu tư có định hướng, dù mục tiêu ít hơn nhưng hiệu quả hơn.
> 4. Khám phá kỹ thuật nhất định phải hiểu nguyên lý trước. Không hiểu nguyên lý sẽ chỉ nắm được bề mặt, không thể thực sự làm chủ. Cần nắm vững nguyên lý kỹ thuật đến mức nào? Cấu trúc dữ liệu và thiết kế thuật toán, các yếu tố cần cân nhắc, cơ chế kỹ thuật, tư duy tối ưu. Cần phát lại trong đầu cho đến khi mọi chi tiết đều rõ ràng. Nếu có thể trình bày rõ ràng mạch lạc thì càng tốt. Khám phá nguyên lý kỹ thuật nhất định phải xem source code. Xem source code và không xem source code là khác nhau. Không xem source code, dù nói được nhưng vẫn cách một lớp giấy; xem source code rồi mới thực sự hiểu thấu, mới nói được chắc chắn hơn. Dĩ nhiên, có thể tôi thiếu khả năng diễn xuất.
> 5. Cần giỏi học hỏi từ thất bại. Chính nhờ 4 tháng liên tục học hỏi, suy ngẫm, tích lũy và đúc kết trong thời gian trống tại Hàng Châu, cùng với việc rút kinh nghiệm từ những lần phỏng vấn thất bại, không ngừng điều chỉnh chiến lược, hoàn thiện sự chuẩn bị, khắc phục điểm yếu sẵn có và áp dụng cách tiếp cận hợp lý hơn, mới có thể nhận được offer khá ưng ý chỉ trong vòng hai tuần ngắn ngủi sau khi trở về Vũ Hán.
> 6. Phỏng vấn là quá trình giao tiếp để hiểu nhau. Các câu hỏi trong phỏng vấn muôn hình muôn vẻ, nhưng có một số câu hỏi cần chuẩn bị trước.
>
> **Địa chỉ bài gốc**: <https://www.cnblogs.com/lovesqcc/p/14354921.html>

Học hỏi từ mỗi trải nghiệm, tu dưỡng trong mỗi việc làm. Giỏi học hỏi từ thất bại.

## Dẫn nhập

Tôi năm nay 36 tuổi, đã có 8 năm kinh nghiệm phát triển JAVA. Làm tại Alibaba Cloud 3 năm rưỡi, Youzan 4 năm rưỡi — đã là một lập trình viên lớn tuổi tiêu chuẩn.

Qua nhiều năm đọc sách, học hỏi và suy ngẫm, quan điểm giá trị, nhân sinh quan và thế giới quan của tôi cũng dần định hình. Tôi nhận ra sở thích của mình là trong lĩnh vực giáo dục và văn hóa, nên trong một khoảnh khắc bốc đồng, vào cuối tháng 8 tôi đã nghỉ việc trắng tay để đi tìm việc. Lý trí hữu hạn khó cản được cá tính bốc đồng. Không khuyến khích nghỉ trắng tay, làm việc gì cũng nên có kế hoạch, khoa học và hợp lý.

Dù ban đầu tôi nghĩ mình "có lý tưởng, có mục tiêu, có ý chí, có năng lực" và tìm một công việc phát triển giáo dục không khó, thực tế đã nhanh chóng dội cho tôi nhiều gáo nước lạnh. Tôi thua rồi lại thi, thi lại rồi thua. Ngạc nhiên khi nhận ra mình có sức bền như vậy. Phỏng vấn là một thử thách rèn luyện — nếu không bị thất bại đánh gục, bạn sẽ từ đó lớn lên một sức bền kiên nhẫn, và sức bền đó sẽ đưa bạn đi xa hơn. Ai chẳng trải qua thất bại? Thất bại là người thầy vĩ đại nhất, nếu bạn sẵn lòng học từ thầy ấy.

Trong quá trình phỏng vấn, tôi nhanh chóng phát hiện ra những điểm yếu của mình:

- Đầu tư công sức vào nghiệp vụ, chiều sâu kỹ thuật chưa đủ, hiểu biết về nguyên lý còn giới hạn ở mức khá nông;
- Tầm nhìn chưa đủ rộng, bị giới hạn trong mảng nghiệp vụ đơn hàng mình làm, chưa hiểu đủ về các mảng nghiệp vụ liên quan khác (như hàng hóa, marketing, thanh toán, v.v.);
- Tư duy chưa đủ rộng, phần lớn thời gian đầu tư vào phát triển và kiểm thử, ít suy nghĩ về vận hành, sản phẩm, nghiệp vụ, thương mại;
- Thiếu kinh nghiệm quản lý, tuổi tác lớn hơn. Hai điểm yếu này tôi từng đánh giá thấp, nhưng dần dần nổi bật, thậm chí khiến tôi một lúc mất tự tin, nhưng cuối cùng tôi vẫn vượt qua được.

Nhưng tôi cũng có thế mạnh riêng. Quy tắc cơ bản của cạnh tranh nghề nghiệp là sự khan hiếm và sự khác biệt. Có thể giải quyết thiết kế kiến trúc cho các dự án lớn và chinh phục các vấn đề kỹ thuật khó, tinh thông một lĩnh vực kỹ thuật cao cấp — đó là biểu hiện của sự khan hiếm; còn làm việc tỉ mỉ, chu đáo, cẩn thận, có kinh nghiệm phát triển hệ thống concurrency cao, lưu lượng lớn — đó là biểu hiện của sự khác biệt. Sự khan hiếm là thượng sách, sự khác biệt là trung sách, còn hạ thấp yêu cầu là hạ sách.

Tôi thiếu lợi thế khan hiếm, nhưng vẫn có một chút lợi thế khác biệt:

- Làm mỗi công việc đều rất chắc chắn, thời gian đều từ 3 năm đến 5 năm, có một chút hào quang từ các công ty lớn, có thể nhận được nhiều cơ hội phỏng vấn hơn (dù không nhất thiết đỗ);
- Kiên trì viết blog, không ngừng theo đuổi "đạo" trong phát triển phần mềm, thường xuyên suy nghĩ và ghi lại các vấn đề gặp phải và giải pháp trong quá trình phát triển;
- Làm việc nghiêm túc, cẩn thận, có thể phân tích và suy nghĩ vấn đề một cách tổng thể, cũng rất chú trọng nâng cao nền tảng;
- Có kinh nghiệm thực hành về chất lượng kỹ thuật, tối ưu hiệu năng, xây dựng ổn định, thiết kế cấu hình nghiệp vụ;
- Kinh nghiệm phát triển và bảo trì lâu dài hệ thống microservices lưu lượng lớn.

Số công ty tôi nộp CV không nhiều. Trong số không nhiều lần phỏng vấn, tôi dần nhận ra cách nói "giành được hàng chục offer từ các big tech" trên mạng không đáng tin. Lý do như sau:

- Nếu thực sự giành được nhiều offer từ big tech, xác suất cao là phỏng vấn ở cấp kỹ sư sơ cấp. Cần biết rằng với kỹ sư 4 năm kinh nghiệm trở lên, độ sâu và rộng của phỏng vấn rất đáng gờm — từ thuật toán cơ bản, đến nguyên lý và cơ chế của các middleware, đến kiến trúc vận hành thực tế, bao quát mọi thứ, thực sự là "đắm chìm trong biển kỹ thuật", trừ khi một người có nền tảng và thực lực rất mạnh, và đã tích lũy được chiều sâu và rộng rất lớn;
- Một người có nền tảng và thực lực rất mạnh sẽ không có hứng thú đầu tư nhiều công sức như vậy để phỏng vấn khắp nơi chỉ để khoe khoang năng lực. Người càng mạnh càng có logic lựa chọn riêng, CV gửi đi sẽ định hướng và chính xác hơn. Nói thật, sao họ không đầu tư nhiều công sức hơn vào những doanh nghiệp xuất sắc có thể mang lại lợi ích tối đa cho họ?
- Quảng cáo của trung tâm đào tạo. Vì họ hiểu rõ nhất rằng người mới cần sự tự tin, dù là sự tự tin giả tạo.

Thôi, nói nhiều rồi. Để tôi kể về những thử thách và suy ngẫm trong quá trình phỏng vấn của mình.

## Chuẩn bị

Cuộc đời có thể dài, nhưng thời gian phỏng vấn rất ngắn, nhiều nhất là một tiếng hay một tiếng rưỡi. Làm sao trong một tiếng ngắn ngủi, người ta có thể hiểu rõ hơn về bạn — người đã sống hơn ba mươi năm? Điều này đòi hỏi bạn phải chuẩn bị rất kỹ lưỡng. Ở một góc độ nào đó, phỏng vấn và múa ballet có điểm tương đồng: 5 phút trên sân khấu, 10 năm luyện tập dưới sân.

Chuẩn bị chủ yếu bao gồm: chuẩn bị CV, giới thiệu bản thân, tìm hiểu công ty, khám phá kỹ thuật, năng lực diễn đạt, câu hỏi thường gặp, vị trí trung-cao cấp, thái độ tốt. Chuẩn bị là quá trình nhận thức lại toàn diện và sâu sắc về bản thân và thế giới bên ngoài.

Ban đầu, tôi nghĩ mình đã chuẩn bị khá đầy đủ, sửa CV một chút là xong. Sau nhiều lần thất bại mới nhận ra sự chuẩn bị còn chưa đủ. Theo quan điểm hiện tại của tôi: chuẩn bị 7 phần, ứng biến 3 phần. Chuẩn bị là phải biết mình biết ta — biết đối phương sẽ hỏi những câu hỏi gì (thường là chiều sâu và rộng của hệ thống/dự án/kỹ thuật), bản thân nên trả lời thế nào. Ứng biến là khi gặp câu hỏi không biết, không hiểu, không rõ thì làm thế nào để thể hiện hợp lý tư duy giải quyết vấn đề của mình, cũng như sau khi trả lời không được câu hỏi trong phỏng vấn thì bổ sung lỗ hổng và củng cố nền tảng.

Quá trình này thực ra cũng là quá trình học hỏi. Liên tục phản tư và đúc kết, học nội dung mới, nhận thức lại bản thân và quá khứ.

### Chuẩn bị CV

Ban đầu tôi làm khá đơn giản. Lấy CV cũ ra, thêm kinh nghiệm làm việc mới, sửa sơ qua, nhưng nhìn chung mẫu CV hầu như không thay đổi.

Về mặt cơ bản, tôi làm khá tỉ mỉ — trung thực ghi rõ kỹ năng và kinh nghiệm mình giỏi và quen, trình bày cũng cố gắng gọn gàng đẹp mắt (đã từng học một chút thiết kế UI). Không phóng đại cũng không giả tạo khiêm tốn.

Về mặt mở rộng, tôi vẫn làm chưa đủ. Một ngày, một headhunter gọi điện hỏi: "Thế mạnh lớn nhất của bạn là gì?" Tôi bỗng nhiên không trả lời được. Lúc đó cũng không suy nghĩ thêm. Sau nhiều lần phỏng vấn thất bại, một lúc hơi mất tự tin, tôi bắt đầu suy nghĩ kỹ về thế mạnh của mình. Rồi ghi "có suy nghĩ sâu và kinh nghiệm thực hành về chất lượng kỹ thuật, tối ưu hiệu năng, xây dựng ổn định, thiết kế cấu hình nghiệp vụ" vào dòng đầu tiên trong mục "kỹ năng và phẩm chất", vì đây thực sự là điều tôi đã làm, thực chất và bám sát thực tế, đồng thời mang tính khái quát.

Đôi khi thứ tự sắp xếp nội dung CV cũng rất quan trọng. Trước đây tôi đặt các ngôn ngữ và kỹ thuật nắm vững lên đầu, còn "năng lực quản lý dự án và ảnh hưởng nhóm" thì viết ở phía sau. Nhưng sau khi nộp cho Nian Gao Mama mà không có phản hồi phỏng vấn trực tiếp bị xếp vào "không phù hợp", tôi bị kích thích và nhận ra rằng có lẽ họ cho rằng tôi thiếu kinh nghiệm quản lý. Vì vậy tôi cố tình đưa "năng lực quản lý dự án và ảnh hưởng nhóm" lên trước, tỏ ra mình coi trọng khía cạnh quản lý. Tuy nhiên sau khi nộp CV mới vẫn không có phản hồi. Tôi nhận ra cách sắp xếp này có thể gây hiểu lầm rằng tôi thiên về quản lý hơn (thực ra có một HR hỏi tôi có còn viết code không), nhưng thực tế tôi thiếu kỹ năng quản lý. Cuối cùng tôi vẫn điều chỉnh lại thứ tự ban đầu, làm nổi bật "bản sắc kỹ sư" của mình. Sau đó tôi còn sửa đổi một số câu văn trong cách sắp xếp.

Khi phỏng vấn tiến triển, đôi khi cũng nhận ra những chỗ chưa viết đủ trong CV hoặc chưa làm đủ trước đây. Ví dụ, trong kinh nghiệm xuất đơn hàng, tôi chỉ ghi là "cải thiện đáng kể hiệu năng và ổn định", mang tính mô tả định tính, vì vậy tôi thêm một số con số định lượng (2w tắc nghẽn → 300w+, 1w/1phút) làm bằng chứng. Ví dụ, nghỉ việc tháng 8, đến tháng 12 phỏng vấn có một khoảng trống, một số doanh nghiệp sẽ hỏi về điều này. Vì vậy tôi thêm một câu giải thích thời gian đó tôi đang làm gì. Ví dụ, hệ thống và dự án đại diện — giá trị và ý nghĩa của từng hệ thống và dự án (không nhất thiết phải ghi vào CV, nhưng trong đầu phải rõ). Công sức phải bỏ ra đủ.

Ví dụ khác, tôi ghi rất chi tiết kinh nghiệm làm việc tại Youzan, nhưng phần Alibaba Cloud hầu như không chỉnh sửa. Một số doanh nghiệp lại quan tâm hơn đến giai đoạn đó, còn tôi thì thấy không có nhiều thứ để nói, chỉ còn ít ấn tượng trong đầu và một số bài blog ghi lại — quá mỏng so với giai đoạn làm việc đó. Vấn đề thực chất ở đây không phải là CV, mà là vấn đề tổng kết lại kinh nghiệm quá khứ. Tôi khuyến nghị: sau mỗi dự án kết thúc, hãy tự tổng kết lại. Tránh để thời gian làm mờ nhạt những kinh nghiệm quý báu đó.

Thực ra ai cũng có rất nhiều điều có thể nói, nhưng ghi lại được bao nhiêu? Đáng kể lại bao nhiêu? Không cố gắng bây giờ, khi phỏng vấn chỉ biết than thở.

**Bài học cập nhật CV**:

- CV là tinh hoa cô đọng để thể hiện bản thân đầy đủ, cũng là cơ hội nhìn lại bản thân và quá khứ;
- Không chỉ giới thiệu tóm tắt kỹ năng và kinh nghiệm, mà còn cần làm nổi bật tối đa lĩnh vực thế mạnh của bạn (sự khác biệt hóa);
- Tăng cường diễn đạt kinh nghiệm làm việc, làm nổi bật đóng góp, giành được sự công nhận của người khác;
- Tổng kết và ghi lại thu hoạch từ mỗi dự án, đặt nền tảng tốt cho việc nhảy việc và phỏng vấn.

### Giới thiệu bản thân

Trước khi phỏng vấn thường được yêu cầu giới thiệu bản thân ngắn gọn. Phần giới thiệu bản thân thường là khúc dạo đầu và giai đoạn đệm vào phỏng vấn, giúp giảm bớt không khí căng thẳng.

Ban đầu giới thiệu bản thân của tôi — cá tính, cuộc sống nghiệp dư, kinh nghiệm làm việc, sở thích, v.v. — dường như không biết nên nói gì. Thực ra, giới thiệu bản thân là trang chủ để thể hiện bản thân đầy đủ. Trang chủ phải làm nổi bật ngay những thế mạnh cốt lõi nhất của bạn (cần khai thác kinh nghiệm và đúc kết kỹ lưỡng). Giới thiệu bản thân hiện tại của tôi thường bao gồm: cá tính (ví dụ hướng nội), phong cách làm việc (nghiêm túc cẩn thận, chú trọng chất lượng, giỏi tư duy tổng thể), thế mạnh lớn nhất (ý thức owner, năng lực thực thi, kiểm soát kỹ thuật), tóm tắt kinh nghiệm làm việc (ở mỗi công ty phụ trách gì, đóng góp gì, thu hoạch gì). Giới thiệu bản thân ngắn gọn súc tích, không cần dài dòng.

Giới thiệu bản thân là cơ hội để hiểu rõ, sâu sắc và toàn diện hơn về chính mình.

### Tìm hiểu công ty

Nhiều người có thể giống tôi — biết rất ít về nghiệp vụ công ty nhưng vẫn nộp CV. Điều này thực ra không hợp lý. Thứ nhất, cá nhân tôi không tán thành ném CV tràn lan, mà thiên về đầu tư có định hướng. Đầu tư có định hướng, dù mục tiêu ít hơn nhưng hiệu quả hơn. Việc này giống như thuê nhà — tôi thường thuê nhà trên Douban, dù nguồn ít hơn nhưng hễ tìm được là nhà tốt.

Nộp vào một công ty là vì công ty đó đáp ứng kỳ vọng, đáng để cố gắng giành, chứ không phải vì đó là một công ty. Giống như tìm người yêu — không phải để tìm một người phụ nữ. Để xác định một công ty có đáp ứng kỳ vọng hay không, nên tìm hiểu thêm về công ty đó: nghiệp vụ chính, định hướng phát triển tương lai, ngành nghề và vị thế, tình hình tài chính, đánh giá từ ngành và mạng xã hội, v.v.

Trong quá trình phỏng vấn đề cập đến nghiệp vụ và suy nghĩ về công ty một cách phù hợp là điểm cộng. Cũng có thể dùng cho câu hỏi "Bạn có muốn hỏi điều gì không?".

### Khám phá kỹ thuật

Năng lực kỹ thuật là phẩm chất cơ bản của người làm kỹ thuật. Vì vậy tôi cho rằng dù trong tương lai làm công việc gì, năng lực kỹ thuật vững chắc luôn là điều không thể thiếu và không thể bỏ qua.

Nguyên lý và tư tưởng thiết kế là tinh túy nhất trong kỹ thuật phần mềm. Kỹ thuật phần mềm thông thường có thể chia thành hai khía cạnh:

- **Nguyên lý**: Quy luật và quy trình cơ bản về cách vật hoạt động;
- **Kiến trúc**: Nghệ thuật tổ chức logic quy mô lớn.

**Khám phá kỹ thuật nhất định phải hiểu nguyên lý trước. Không hiểu nguyên lý sẽ chỉ nắm được bề mặt, không thể thực sự làm chủ. Cần nắm vững nguyên lý kỹ thuật đến mức nào? Cấu trúc dữ liệu và thiết kế thuật toán, các yếu tố cần cân nhắc, cơ chế kỹ thuật, tư duy tối ưu. Cần phát lại trong đầu cho đến khi mọi chi tiết đều rõ ràng. Nếu có thể trình bày rõ ràng mạch lạc thì càng tốt.**

**Khám phá nguyên lý kỹ thuật nhất định phải xem source code. Xem source code và không xem source code là khác nhau. Không xem source code, dù nói được nhưng vẫn cách một lớp giấy; xem source code rồi mới thực sự thấu hiểu, mới nói được chắc chắn hơn. Dĩ nhiên, có thể tôi thiếu khả năng diễn xuất.**

Tôi cá nhân không tán thành kiểu luyện đề chuẩn bị phỏng vấn. Dù luyện đề đúng là con đường tắt để vào công ty, nhưng cũng có nhược điểm:

- Đó vẫn là hệ thống kiến thức của người khác chứ không phải hệ thống kiến thức tự mình tổng hợp;
- Khám phá kỹ thuật là để chuẩn bị cho công việc tương lai, chứ không phải đối phó nhu cầu nhất thời — nếu không thì dù vào được vẫn ở trạng thái mê mờ.

Qua quá trình tổng hợp có hệ thống, tôi dần hình thành cấu trúc hệ thống kỹ thuật phù hợp với bản thân: ["Tóm tắt các tư tưởng và cơ chế kỹ thuật phổ biến cho server-side ứng dụng internet"](https://www.cnblogs.com/lovesqcc/p/13633409.html). Trên nền tảng đó, học hỏi thêm từ các nguồn khác, xem các câu hỏi phỏng vấn để tự kiểm tra và bổ sung lỗ hổng — đó là cách phù hợp hơn. Tôi sẽ tiếp tục đào sâu hệ thống đó.

### Năng lực diễn đạt

Hiện tại, hình thức phỏng vấn chính của hầu hết doanh nghiệp là giao tiếp miệng, một số doanh nghiệp có thể có bài kiểm tra viết hoặc thực hành. Hình thức giao tiếp miệng có giới hạn nhất định — yêu cầu cao về năng lực diễn đạt, nhưng không thể hiện rõ năng lực chuyên môn. Chiều sâu và rộng về chuyên môn và kinh nghiệm của một người rất khó thể hiện qua vài phút diễn đạt. Thường thì chiều sâu và rộng càng lớn, càng khó diễn đạt. Còn người làm kỹ thuật thường ít rèn luyện diễn đạt.

Tôi thường viết nhiều nói ít, nói không trôi chảy. Đôi khi chưa giải thích rõ bối cảnh đã triển khai luôn, kết hợp với lắm lời, hay nhảy chủ đề và lặp đi lặp lại (cách này có thể phù hợp hơn với viết tiểu thuyết), khiến người phỏng vấn đôi khi không hiểu đầu đuôi. Tính mạch lạc và rõ ràng trong diễn đạt cũng rất quan trọng. Hãy thử tự kiểm tra: Kiến trúc của Dubbo là gì? Cơ chế lưu trữ bền vững của Redis là gì? Rồi tự trả lời xem sao.

Các nguyên tắc cơ bản của diễn đạt:

- Tổng trước, phân sau; tổng thể trước, bộ phận sau;
- Nói ý tưởng cơ bản trước, sau đó nói tối ưu;
- Thể hiện tương tác. Trình bày tổng quan trước, sau đó hỏi người phỏng vấn muốn nghe khía cạnh nào, rồi mới trình bày chi tiết. Tránh trút ra một bãi, khiến người phỏng vấn bất ngờ. Với các câu hỏi thiết kế hệ thống, hãy hỏi thêm nhiều yêu cầu, như yêu cầu thời gian, yêu cầu không gian, cần hỗ trợ bao nhiêu dữ liệu hay lưu lượng đồng thời, có cần xem xét một số trường hợp hay không.

### Câu hỏi thường gặp

Phỏng vấn là quá trình giao tiếp để hiểu nhau. Các câu hỏi trong phỏng vấn muôn hình muôn vẻ, nhưng có một số câu hỏi cần chuẩn bị trước.

Ví dụ "N câu hỏi linh hồn":

- Tại sao bạn rời khỏi XXX?
- Mức lương kỳ vọng của bạn là bao nhiêu?
- Bạn có một khoảng trống, có thể giải thích không?
- Kế hoạch nghề nghiệp của bạn là gì?

Các câu hỏi kỹ thuật có tần suất cao:

- Nền tảng: Cấu trúc dữ liệu và thuật toán, mạng máy tính;
- Microservices: Hệ thống kỹ thuật, các component, cơ sở hạ tầng;
- Dubbo: Kiến trúc tổng thể, cơ chế mở rộng, phơi bày dịch vụ, tham chiếu, gọi, tắt máy graceful;
- MySQL: Nguyên lý triển khai index và transaction, tối ưu SQL, phân tách DB và bảng;
- Redis: Cấu trúc dữ liệu, cache, distributed lock, cơ chế lưu trữ bền vững, cơ chế replication;
- Phân tán: Distributed transaction, vấn đề nhất quán;
- Message middleware: Nguyên lý, so sánh;
- Kiến trúc: Phương pháp thiết kế kiến trúc, kinh nghiệm kiến trúc, design pattern;
- Tối ưu hiệu năng: JVM, GC, tối ưu hiệu năng cấp ứng dụng;
- Concurrency cơ bản: ConcurrentHashMap, AQS, CAS, thread pool;
- High concurrency: IO multiplexing; các vấn đề cache và giải pháp;
- Ổn định: Tư tưởng và kinh nghiệm về ổn định;
- Vấn đề production: Công cụ và phương pháp điều tra.

### Vị trí trung-cao cấp

Nói thật, tôi người có lẽ hơi thiếu tự tin. Tôi nộp CV với tâm thế "yên tâm làm một kỹ sư".

Với lập trình viên lớn tuổi, doanh nghiệp kỳ vọng cao hơn. Mỗi lần tôi nộp "Senior Engineer", đều tự động bị chuyển thành "Technical Expert" hoặc "Architect". Không thể phản bác, cảm thấy áp lực rất lớn. Phỏng vấn vị trí trung-cao cấp cần chuẩn bị nhiều hơn:

- Bạn có kinh nghiệm dẫn dắt nhóm không?
- Trong X năm kinh nghiệm làm việc, bạn dành bao nhiêu thời gian cho thiết kế kiến trúc?
- Quy trình kiến trúc như thế nào? Bạn có những tư tưởng hay phương pháp luận nào về thiết kế kiến trúc?

Nếu không chuẩn bị, bị hỏi một cái là hoảng loạn. Thực ra tôi có lẽ vẫn còn tâm lý may mắn — phỏng vấn vị trí "Technical Expert" và "Architect" như phỏng vấn "Senior Engineer". Kết quả không thi nào không thất bại. Rõ ràng tôi đã làm ngược: phải phỏng vấn Senior Engineer với tiêu chuẩn Technical Expert và Architect.

Thôi, đã vậy thì đón nhận thôi! Tôi không phải người sợ thử thách.

Ngoài ra, với vị trí "Technical Expert" và "Architect", ít nhất cần dành một ngày để chuẩn bị. Những Technical Expert và Architect đã có kinh nghiệm phong phú có thể bỏ qua điều này.

### Thái độ tốt

Duy trì thái độ tốt cũng vô cùng quan trọng. Tôi đã trải qua quá trình thay đổi thái độ: "lạc quan → mất tự tin → lấy lại tự tin".

Trong một thời gian dài, vì "quá muốn thành công", sợ không trả lời được câu hỏi kỹ thuật nào đó sẽ hỏng, nên thận trọng và hơi căng thẳng. Kết quả là những gì đã chuẩn bị kỹ lại thường không nói rõ được hoặc nói không mạch lạc. Đi phỏng vấn với tâm lý "phải lấy offer" thực sự rất khổ, cảm thấy mỗi buổi phỏng vấn đều bị động, khó chịu, thậm chí có lúc muốn "hạ tiêu chuẩn".

Đôi khi tôi tự hỏi: Sao lại ra nông nỗi này nhỉ? Lẽ ra ở tuổi này tôi phải có khả năng theo đuổi sự nghiệp mình yêu thích rồi chứ! Có lẽ bình thường hơi lười biếng, tầm nhìn hẹp, tích lũy chưa đủ, dẫn đến hoàn cảnh bất lợi hôm nay.

Tôi là người đúng giờ, cũng mong đối phương giữ đúng giờ. Người phỏng vấn tại Hàng Châu cơ bản đúng giờ, dù trễ cũng trong mức chấp nhận được. Khi về Vũ Hán phỏng vấn, nhịp điệu lại bị một số công ty làm lệch. Có một hai lần tôi thậm chí không biết người phỏng vấn sẽ vào phòng họp khi nào. Tôi nghĩ, đây là "sự tiếp đãi" đối với nhân tài sao? Tôi cảm thấy bị xúc phạm nhẹ. Dù sao tôi vẫn "rất có giáo dưỡng" và nói không sao. Nhưng tôi luôn cho rằng: người phỏng vấn đến trễ là sự thiếu tôn trọng nhân tài. Gia nhập công ty không tôn trọng nhân tài, tôi rất nghi ngại. Chim hiền chọn cây mà đậu, tôi chẳng lẽ vì hoàn cảnh bất lợi hiện tại mà từ bỏ một số nguyên tắc cơ bản, chấp nhận một offer không tôn trọng nhân tài?

Tôi nhận ra: Một người nên dùng thực lực để giành được sự tôn trọng và yêu quý của đối phương, như vậy sự hợp tác sau này mới thuận lợi hơn. Nếu không có duyên thì tiếc, nhưng không nên cưỡng cầu. Dù người khác nghi ngờ gì, hãy một lòng mài giũa thực lực, khai thác tài năng và thế mạnh của mình, cuối cùng sẽ tỏa ra ánh sáng riêng. Vì vậy thái độ của tôi thay đổi ngay lập tức: nên tập trung giao tiếp, hiểu nhau đầy đủ với đối phương, giành được sự công nhận thực lòng của họ, chứ không phải chỉ lấy được một tấm vé vào cửa, trở thành công cụ làm việc.

Có một câu chuyện nhỏ về "đá và ngọc" — hãy coi mình là nhân tài và nỗ lực nâng cao bản thân, mới có thể nhận được "sự đãi ngộ của nhân tài". Tự coi mình như đá bán rẻ, buông lỏng nỗ lực, thì chỉ nhận được "sự đãi ngộ của đá". Dù một người chưa nhất thiết ngay lập tức có năng lực của nhân tài, nhưng trong nội tâm phải từ góc nhìn nhân tài để quan sát doanh nghiệp sắp gia nhập, chứ không chỉ là để tìm một công việc "kiếm nhiều tiền hơn".

Ngoài ra, lo lắng cũng không cần thiết. Bản chất của lo lắng là khoảng cách giữa thực tế và mục tiêu. Một người luôn có thể đánh giá tính hợp lý của mục tiêu và cách đạt được mục tiêu. Nếu mục tiêu quá cao thì điều chỉnh cấp độ mục tiêu; nếu mục tiêu khả thi thì ra quyết định hợp lý, và thông qua nỗ lực liên tục và hành động đúng đắn để đạt được mục tiêu. Năng lực quyết định, nỗ lực và hành động đều có thể liên tục rèn luyện.

## Trải nghiệm phỏng vấn

Phỏng vấn của người làm kỹ thuật vẫn nghiêng nhiều về kỹ thuật, vì vậy chiều sâu và rộng về kỹ thuật cần chuẩn bị tốt. Tình huống của người phỏng vấn và ứng viên khác nhau — người phỏng vấn chỉ hỏi một số điểm ít ỏi, nhưng nhiều người phỏng vấn cộng lại thì tạo thành một mảng rộng. Hiểu điều này, là người phỏng vấn bạn đừng quá tự mãn, tưởng mình giỏi hơn ứng viên.

Tôi không phỏng vấn nhiều công ty, vì đã quyết định theo đuổi sự nghiệp giáo dục, dùng "sở thích và động lực" để lọc thẳng nhiều lời mời phỏng vấn. Ở Hàng Châu cơ bản chỉ phỏng vấn các công ty giáo dục, thậm chí từ chối cả lời mời từ Alibaba, Huawei (dù tôi chưa chắc đỗ). Cách làm có vẻ "thẳng nam" một chút, nhưng đầu tư nhiều nhất vào ngành và sự nghiệp mình mong muốn mới là điều xứng đáng.

Sự nghiệp giáo dục tôi quan niệm không chỉ giới hạn ở giáo dục trực tuyến hay giáo dục K12 thường được nói đến, mà là một hệ thống giáo dục — bất kỳ sự nghiệp nào có thể phát huy hiệu quả giáo dục tốt hơn, bao gồm nhưng không giới hạn ở giảng dạy, đọc sách, âm nhạc, thiết kế.

### Jielibang Technology - Senior Engineer

Công ty đầu tiên. Sau một cuộc trò chuyện dài, không có tin tức. Nhưng tôi cũng không quan tâm lắm. Người phỏng vấn hỏi nhiều về nghiệp vụ giao dịch, sâu nhất là làm thế nào đảm bảo tính nhất quán dữ liệu của ứng dụng.

Lúc này tôi giống như ném một viên đá nhỏ thăm đường, chưa ý thức được hoàn cảnh của mình.

### NetEase Cloud Music - Senior Engineer

Tiếp theo là NetEase Cloud Music. Big tech là big tech. Vòng 1 hỏi toàn những thứ liên quan đến cơ chế của cache, distributed lock, Dubbo, ZooKeeper, MQ middleware. Rất tiếc, vì tôi bình thường tích lũy về nguyên lý kỹ thuật còn rất ít, cơ bản là "không biết gì", trượt một cách rực rỡ.

Lúc này tôi bắt đầu nhận ra nền kỹ thuật của mình còn khá mỏng, và bắt đầu học hỏi kỹ thuật rộng rãi để củng cố, từ dưới lên tổng hợp nguyên lý và logic, hệ thống hóa tổng kết, cuối cùng hình thành bước đầu cấu trúc kiến thức kỹ thuật server-side internet của riêng mình.

### Mingshitang - Technical Expert

Phỏng vấn bởi kiến trúc sư. Hỏi tương đối nhiều hơn, DB, Redis, v.v. Phản hồi là kỹ thuật ổn, nhưng thiếu kinh nghiệm quản lý. Đây là lần đầu tiên tôi nhận ra bất lợi khi lập trình viên lớn tuổi thiếu kinh nghiệm quản lý. Trong tuyển dụng đường Technical Expert của các công ty vừa và nhỏ, thường đính kèm yêu cầu kinh nghiệm quản lý. Cần chú ý khi ứng tuyển.

Thiếu kinh nghiệm quản lý thì làm thế nào? Sau một thời gian suy nghĩ, tôi có những ý tưởng như sau:

- Thay đổi những gì có thể thay đổi, với những gì không thể thay đổi thì học về nó. Ví dụ học nguyên lý kỹ thuật là điều tôi có thể thay đổi, nhưng kinh nghiệm quản lý là điều khó thay đổi trong thời gian ngắn, vậy thì hãy tìm hiểu thêm về các lý thuyết quản lý cơ bản.
- Khai thác kinh nghiệm liên quan từ quá khứ. Dù tôi không có kinh nghiệm dẫn dắt nhóm chính thức, nhưng có kinh nghiệm quản lý cơ bản về dẫn dắt dự án, kèm cặp kỹ sư, quản lý một mảng nghiệp vụ. Hãy khai thác nhiều hơn từ kinh nghiệm của mình.

### ByteDance Education - Senior Engineer

Phỏng vấn ByteDance Education, tôi tự đào nhiều cái hố rồi nhảy vào.

Ví dụ người phỏng vấn hỏi hãy kể về một dự án bạn cảm thấy thành tựu nhất. Tôi chọn dự án mua định kỳ gần 4 năm trước. Dù đây là dự án đại diện đầu tiên khi tôi gia nhập Youzan, nhưng thời gian quá lâu, lại không ghi chép chi tiết, nhiều chi tiết kỹ thuật đã quên không còn rõ. Tôi đề cập đến tư tưởng thiết kế "tích hợp hóa" lúc đó ấn tượng khá sâu, nhưng lại quên mất tại sao lại có tư tưởng đó (không ghi chép kỹ).

Ví dụ khác, có một câu hỏi tình huống về lớp học, tôi hỏi dùng kiến trúc CS hay BS? Người phỏng vấn nói dùng kiến trúc CS đi. Đây chẳng phải tự đào hố cho mình sao? Rõ ràng mình không quen với kiến trúc CS, sao lại hỏi lựa chọn đó, thà nói thẳng theo kiến trúc BS còn hơn. Ôi!

ByteDance Education phản hồi với tôi là: Business Sense tốt, năng lực thiết kế hệ thống cần cải thiện. Tôi thấy khá xác đáng. Vì vậy cũng bắt đầu chú trọng đọc và suy nghĩ về các bài viết về thiết kế hệ thống thực chiến.

Kinh nghiệm là:

- Khi làm dự án, cần ghi chép chi tiết về tech stack, quyết định kỹ thuật và lý do, các chi tiết kỹ thuật, đặt nền tảng tốt cho phỏng vấn;
- Chuẩn bị trước hệ thống và dự án ấn tượng nhất và có tính đại diện nhất, tránh chọn dự án thời gian xa, thiếu ghi chép chi tiết;
- Chọn dự án và kiến trúc quen thuộc, ít nhất tạo ấn tượng ban đầu tốt, nếu không người phỏng vấn sẽ thấy bạn không biết gì.

### Migu Digital Media - Architect

Trời ơi, một lúc 3 người phỏng vấn cùng một lúc. Có lẽ tôi ít gặp hình thức này trước đây. Có vẻ phỏng vấn vị trí cao tại doanh nghiệp nhà nước thích áp dụng hình thức này. Nghe nhiều ý kiến sẽ sáng suốt hơn. Các câu hỏi cũng rất rộng, từ nguyên lý cơ bản của ES đến di chuyển dữ liệu giữa các cụm máy chủ. Một số cơ chế kỹ thuật dù đã học nhưng chưa vững, chưa rõ, trả lời cũng không tốt. Ví dụ về tối ưu nguyên lý tìm kiếm của ES, sau khi nói về inverted index, tôi giải thích không rõ về Term Index và Trie tree. Điều này nói lên rằng biết không có nghĩa là thực sự hiểu. Chỉ khi có thể trình bày rõ ràng mạch lạc cả tư duy lẫn chi tiết thì mới coi là thực sự hiểu.

Ấn tượng sâu sắc là có một câu hỏi: Bạn có những tư tưởng kiến trúc nào? Đây là lần đầu tiên được hỏi về thiết kế kiến trúc, tôi hơi hoảng loạn. Dù bình thường cũng hay suy nghĩ, cũng có viết bài, nhưng chưa hình thành phương pháp luận có hệ thống và súc tích, kết quả là trả lời khá lộn xộn.

### Tuya Smart - Senior Engineer

Ứng tuyển Tuya Smart vì tôi thấy doanh nghiệp này không tồi. Doanh nghiệp xuất sắc ít nhất nên giao tiếp thêm, biết đâu sau này có cơ hội hợp tác! Tư duy nhìn vấn đề phải rộng hơn, đừng chỉ bám vào một việc mình nghĩ đến.

Ấn tượng tổng thể về Tuya Smart không tệ. Người phỏng vấn lịch sự, có kiên nhẫn, hỏi rất nhiều về kiến trúc tổng thể, kỹ thuật và dự án, hỏi trúng vào chỗ tôi quen, trả lời cũng còn được. Có lẽ kinh nghiệm của tôi vừa khớp với nhu cầu của họ.

Nếu không phải lúc đó muốn làm giáo dục quá mạnh mẽ, xác suất cao là tôi đã gia nhập Tuya Smart. IoT theo tôi nên là lĩnh vực khá thú vị.

### Genshui Xue - Technical Expert

Cơ bản trả lời được. Nhưng phản hồi là: năng lực nắm bắt trọng điểm khi trả lời câu hỏi còn thiếu, tổng hợp kỹ thuật cũng chưa đủ. Lúc đó tôi còn hơi không phục, nghĩ mình viết nhiều bài như vậy, cũng có khá nhiều suy nghĩ, sao gọi là tổng kết chưa đủ? Nhiều nhất là còn điểm mù kỹ thuật. Kỹ thuật như biển cả, ai chẳng có điểm mù?

Nhưng nhìn lại bây giờ, quả thực còn xa mức mình lẽ ra phải có. Tổng kết về nguyên lý cơ chế kỹ thuật và điều tra vấn đề production còn chưa đủ, chưa đủ rõ ràng và tỉ mỉ; tổng kết kinh nghiệm thực hành thiết kế cũng chưa đủ, chưa đủ hệ thống và vững chắc. Việc này cần tiếp tục đào sâu và làm.

Ngoài ra, càng phỏng vấn nhiều càng nhận ra năng lực diễn đạt của mình còn thiếu. Lắm lời, dễ khai triển một điểm không ngừng, nói thẳng vào giải pháp mà không giải thích bối cảnh, hay nhảy chủ đề và lặp đi lặp lại — người phỏng vấn rất có thể mất kiên nhẫn. Nên tuân theo logic cơ bản "tổng trước phân sau", "ý tưởng cơ bản → triển khai → tối ưu" để trả lời sẽ tốt hơn. Năng lực diễn đạt thực sự rất quan trọng, không thể chỉ lo gõ code. Còn mỗi lần phỏng vấn công ty giáo dục lại không khỏi căng thẳng, sợ bỏ lỡ cơ hội.

Đây là công ty thứ hai trực tiếp nói với tôi rằng tuổi tác và kinh nghiệm không khớp, làm sâu thêm lo lắng về tuổi tác lớn, đến mức bắt đầu hơi mất tự tin.

Vậy tôi lấy lại tự tin như thế nào? Có một câu nói cũ: "Còn núi xanh, không lo thiếu củi đốt". Dù tuổi tác lớn hơn, nếu năng lực kỹ thuật mài giũa đủ vững, tôi không tin không tìm được một công ty có thể công nhận mình. Thêm nữa tôi có thể tham gia các dự án mã nguồn mở. Có năng lực kỹ thuật tốt không nhất thiết bị giới hạn trong phạm vi doanh nghiệp, cũng không nhất thiết bị giới hạn trong nhận thức của những người bị định kiến tuổi tác che mờ. Sự công nhận từ bên ngoài cố nhiên quan trọng, nhưng giá trị bên trong còn quý hơn sự bề ngoài.

### Yitong Wenjiao - Architect

Cũng là 3 người phỏng vấn cùng một lúc. Chủ yếu hỏi về kinh nghiệm dự án, kỹ thuật hỏi không sâu. Cá nhân thấy trả lời còn được. Người phỏng vấn cũng hỏi về thiết kế kiến trúc, tôi trả lời bình thường. Lúc này tôi vẫn chưa nhận ra mình đang dùng tiêu chuẩn phỏng vấn "Senior Engineer" để phỏng vấn vị trí "Architect".

Người phỏng vấn khá ôn hòa, HR cũng tích cực liên hệ và giao tiếp, cảm giác không tệ. Chỉ là tôi không chủ động hỏi phản hồi, nên cũng không có tin tiếp theo.

### New Oriental - Senior Engineer

Phỏng vấn New Oriental chủ yếu vì khớp với kỳ vọng làm giáo dục của tôi, dù vị trí yêu cầu là làm hệ thống quản lý thông tin, vẫn còn khoảng cách với nghiệp vụ lý tưởng. Qua giao tiếp tìm hiểu, họ cần kỹ sư quen hơn với vận hành, còn tôi vừa không quen với vận hành, bình thường ít quan tâm, nên không quá phù hợp với yêu cầu tuyển dụng thực tế. Người phỏng vấn cũng là người ôn hòa, quê ở Nghi Xương — nơi tôi học đại học — trải nghiệm phỏng vấn không tệ.

Sau này cần dành thời gian học một số thứ liên quan đến vận hành. Là một kỹ sư xuất sắc và kiến trúc sư đủ năng lực, cần học hỏi rộng và quen thuộc với các loại component, middleware, vận hành và triển khai mà hệ thống sử dụng. Cần có năng lực tổng quan, nhưng tôi nhận ra có lẽ hơi muộn. Better later than never.

### ZOOM - Senior Engineer

Một người phỏng vấn của ZOOM có lẽ là người phỏng vấn kém nhất tôi từng gặp. Có hai người phỏng vấn — một người có vẻ rất kiên nhẫn, còn người kia thì đang ngồi với cái bụng phệ, vừa ngáp, một dáng vẻ không quan tâm đến phỏng vấn và ứng viên. Tôi nghĩ, không muốn phỏng vấn thì đến đây làm gì? Bạn nghĩ ứng viên thấp hơn bạn một bậc à? Đổi vị trí tôi có thể cho bạn một bài. Nhưng tôi vẫn rất lịch sự, như thể không có chuyện gì xảy ra. Công ty đang chọn người, ứng viên cũng đang chọn công ty.

Nghĩ lại, ZOOM là phần mềm hội nghị từ xa mà công ty chúng tôi dùng trong thời dịch. Ấn tượng không tệ, nhưng có kỹ sư và người phỏng vấn như vậy ở bên trong, tôi cũng phục luôn. Lẽ nào anh ta là đại thần huyền thoại? Theo tôi biết, về cơ sở hạ tầng phần mềm internet, nước ngoài về cơ bản áp đảo trong nước. Phần lớn doanh nghiệp Trung Quốc dùng framework, middleware, cơ sở hạ tầng của nước ngoài hoặc tùy chỉnh từ đó, thực sự tự nghiên cứu rất ít. Có gì đáng tự mãn?

### AYou Culture - Senior Engineer

AYou Culture có 4 vòng phỏng vấn kỹ thuật. Vòng 1 kỹ thuật để lại ấn tượng khá sâu với tôi. Trông có vẻ người phỏng vấn đặc biệt giỏi và quen thuộc về nguyên lý cơ chế hệ điều hành. Nhiều câu hỏi tôi không trả lời được. Tưởng trượt rồi, nhưng lại được cơ hội lật ngược tình thế. Vòng 2 hỏi kinh nghiệm dự án và câu hỏi kỹ thuật mà tôi rất quen. Vòng 3 hỏi rộng, có câu trả lời được có câu không, nhưng người phỏng vấn rất kiên nhẫn. Vòng 4 là Giám đốc Kỹ thuật, hỏi cũng rất rộng và tỉ mỉ.

Nhìn chung, không khí phỏng vấn khá thoải mái. Tuy nhiên nhu cầu tuyển dụng của AYou lúc đó không cấp bách, họ nghĩ sau này có cơ hội sẽ liên hệ lại. Tiếc là lúc đó tôi chuẩn bị về Vũ Hán rồi. Chủ yếu là cân nhắc bố mẹ đã cao tuổi, muốn ở bên cạnh nhiều hơn.

Nghĩ lại, cách tôi suy nghĩ và ra quyết định vẫn còn khá đơn giản, không biết tính toán và cân nhắc phức tạp.

### Xiaomi - Expert/Architect

Ứng tuyển Xiaomi chủ yếu vì vị trí rất giống với những gì tôi làm ở Youzan trước đây — đều là về Transaction Middle Platform. Sau khi duyệt website của Xiaomi, thấy những gì họ làm rất hay, nhưng không quá khớp với chí hướng ban đầu muốn làm sự nghiệp giáo dục văn hóa.

Động lực gia nhập Xiaomi không mạnh lắm, phỏng vấn cũng mất đi nhiều động lực. Cá tính này cần thay đổi.

### Visual China - Senior Engineer

Hỏi xung quanh kỹ thuật, dự án và kinh nghiệm. Nhìn chung chiều sâu kỹ thuật không quá khó, cũng đề cập đến dự án. Vòng HR rất ôn hòa. Tôi tưởng sẽ bị "dội bom" về kinh nghiệm của mình, kết quả là kể cho HR nghe về sản phẩm, dịch vụ và mô hình kinh doanh của Youzan, rồi lướt qua một chút kinh nghiệm của mình.

### iFLYTEK - Architect

Vòng 1 và vòng 2, cảm giác người phỏng vấn không mấy hứng thú với phỏng vấn đã được sắp xếp. Architect, ít nhất là vị trí yêu cầu rất cao về năng lực kỹ thuật và thiết kế. Vòng 1 hỏi một số kỹ thuật và kiến trúc. Vòng 2 cứ hỏi xung quanh lý lịch và những thứ không liên quan kỹ thuật của tôi, dường như quan tâm nhiều hơn đến ngoại hình của tôi hơn là năng lực kỹ thuật và thiết kế của mình. Giao tiếp khá nông.

Năng lực có thể có cao thấp, nhưng phép lịch sự cơ bản tôn trọng nhân tài là bất biến. Tôn trọng nhân tài là tập trung vào năng lực và tài năng của họ, chứ không phải những thứ ít liên quan đến tài năng.

### Qingteng Cloud - Senior Engineer

Phong cách phỏng vấn của Qingteng Cloud là ôn hòa. Cảm nhận được mùi vị giao tiếp thẳng thắn, cảm giác được công nhận. Cảm nhận HR như khát nhân tài. Khớp với quan điểm trước đây của tôi "nên dùng thực lực để giành được sự tôn trọng và yêu quý của đối phương".

### Tencent Meeting - Senior Engineer

Phỏng vấn với người phỏng vấn Tencent qua phần mềm Tencent Meeting để ứng tuyển vị trí Tencent Meeting. Ha ha. Vì mạng không ổn định, quá trình phỏng vấn đầy những trục trặc — nói chưa hết câu đã không nghe rõ. Bạn tưởng tượng xem. Nhưng chúng tôi đều rất rất rất kiên nhẫn, cuối cùng cùng nhau hoàn thành vòng 1. Phỏng vấn là cuộc đấu trí và sức mạnh của cả hai bên, hơn hết là cùng nhau hoàn thành một việc, khám phá nhau. Nghĩ như vậy, quan niệm phỏng vấn kiểu truyền thống "một phía kiểm tra lựa chọn" cần được đổi mới.

Vì tôi đã có offer, và công việc của Tencent Meeting không quá khớp với chí hướng ban đầu, nên tôi trao đổi với Tencent và dừng vòng 2.

### Lựa chọn cuối cùng

Khi có nhiều offer, làm thế nào để lựa chọn? Cá nhân tôi coi trọng:

1. Sở thích và động lực;
2. Lương và đãi ngộ;
3. Triển vọng phát triển công ty và không gian phát triển cá nhân;
4. Môi trường làm việc;
5. Công ty nhỏ nhưng có chiến đấu lực.

Chọn thế nào giữa Visual China và Qingteng Cloud? So sánh:

- Lương và đãi ngộ: Hai bên không chênh lệch nhiều, cũng đều công nhận tôi. Visual China đưa ra vị trí Leader, còn Qingteng Cloud hứa hẹn về nghiệp vụ cốt lõi;
- Môi trường làm việc: Qingteng Cloud có lẽ thiên về văn hóa kỹ sư hơn, còn Visual China thiên về nghiệp vụ hơn;
- Tính thử thách: Thử thách kỹ thuật của Qingteng Cloud mạnh hơn, còn thử thách nghiệp vụ của Visual China mạnh hơn;
- Sở thích và động lực: Visual China khớp hơn với mong muốn làm văn hóa của tôi, còn bảo mật của Qingteng Cloud không quá khớp với chí hướng ban đầu muốn làm sự nghiệp giáo dục văn hóa, hơn nữa thiên về kỹ thuật và tầng dưới (tôi muốn làm những thứ có tính nhân văn hơn). Nhưng Qingteng Cloud làm về bảo mật, bảo mật là việc rất có giá trị và ý nghĩa. Hơn nữa sau này bảo mật cũng có thể phục vụ ngành giáo dục. Có vẻ là đi đường vòng đến đích. Đặc biệt là lý tưởng chủ nghĩa của người sáng lập Zhang Fu "để ánh sáng bảo mật chiếu sáng mọi góc khuất của internet" và thân thể lực hành của ông, tạo cho tôi ấn tượng sâu sắc hơn. Cuối cùng tôi thấy làm bảo mật hơn làm bảo vệ bản quyền hình ảnh một chút.

Ngoài ra, tôi nghĩ để làm giáo dục, điều phù hợp hơn với bản thân là giáo dục lập trình, hay giáo dục kỹ sư. Tôi còn muốn trở thành một System Designer. Vẫn cần tích lũy thêm nhiều kinh nghiệm thực hành production. Có thể giao tiếp nhiều hơn với kỹ sư sơ-trung cấp, làm đào tạo hướng dẫn nội bộ công ty. Hoặc trong thời gian rảnh quay video, đăng lên B站, phục vụ cộng đồng. Trong tương lai, có lẽ tôi còn sẽ viết một cuốn sách về thiết kế lập trình, tổng kết tất cả những gì tôi học được trong cuộc đời.

Vì vậy, sau một ngày cân nhắc kỹ lưỡng, tôi quyết định gia nhập Qingteng Cloud Security. Tất nhiên, đưa ra lựa chọn này cũng đồng nghĩa với việc tôi chấp nhận một thử thách lớn hơn: về bảo mật tôi gần như trắng tay, cần học rất nhiều kiến thức và kinh nghiệm — đối với tôi, một lập trình viên lớn tuổi, đây là một thử thách không nhỏ.

## Tóm tắt

Nhiều việc đều có cách giải quyết, kể cả việc "đau đầu" như lập trình viên lớn tuổi tìm việc cũng không ngoại lệ. Xác định mục tiêu rõ ràng, đưa ra quyết định khoa học và hợp lý, nỗ lực liên tục, nắm vững nền tảng, ra tay đúng thời điểm — cuối cùng sẽ hái được quả thành công. Nhưng cần nhấn mạnh một điều: công phu ở bình thường. Bình thường không tích lũy tốt, khi phỏng vấn sẽ phải bỏ nhiều thời gian học hỏi hơn, sẽ vấp ngã, khó khăn, cuộc sống cũng không thoải mái. Vẫn là trải đều ra bình thường thì tốt hơn. Ngoài ra, tầm nhìn bình thường cũng cần giữ rộng, tránh "đến khi phỏng vấn mới chợt tỉnh ngộ".

Một kinh nghiệm quan trọng là cần giỏi học hỏi từ thất bại. Chính nhờ 4 tháng liên tục học hỏi, suy ngẫm, tích lũy và đúc kết trong thời gian trống tại Hàng Châu, cùng với việc rút kinh nghiệm từ những lần phỏng vấn thất bại, không ngừng điều chỉnh chiến lược, hoàn thiện sự chuẩn bị, khắc phục điểm yếu sẵn có và áp dụng cách tiếp cận hợp lý hơn, mới có thể nhận được offer khá ưng ý chỉ trong vòng hai tuần ngắn ngủi sau khi trở về Vũ Hán.

Ngoài ra, cũng đáng đề cập rằng với người làm kỹ thuật, viết blog là việc rất có giá trị. Phỏng vấn thông qua giao tiếp để hiểu nhau có giới hạn nhất định. Phỏng vấn không tìm ra được nhân tài phù hợp thực ra có xác suất khá lớn:

1. Thời gian phỏng vấn ngắn, kể cả người phỏng vấn dày dạn kinh nghiệm cũng có thể nhìn nhầm (giới hạn cơ bản);
2. Người phỏng vấn hỏi đúng vào chỗ bạn không biết (vấn đề may rủi);
3. Người phỏng vấn không có tâm trạng tốt, không có hứng (vấn đề may rủi);
4. Trình độ của bản thân người phỏng vấn.

Vì vậy, có thực lực thực sự mà bị PASS không đáng buồn. Ý nghĩa của việc viết blog là có thêm chiều không gian để thể hiện suy nghĩ và công việc bình thường của mình.

Doanh nghiệp tôn trọng nhân tài nhất định muốn hiểu ứng viên từ nhiều góc độ (trong ưu và nhược điểm lựa chọn xem có khớp với kỳ vọng không), bao gồm cả blog; doanh nghiệp không tôn trọng nhân tài sẽ thiên về dùng cách lười biếng, không quan tâm đến thực lực thực sự của ứng viên, dùng một số tiêu chuẩn bề ngoài để lọc nhanh. Cố nhiên hiệu quả, nhưng cuối cùng năng lực nhận diện nhân tài sẽ không tiến bộ nhiều.

Qua giai đoạn rèn luyện phỏng vấn này, tôi thấy bây giờ so với bản thân lúc nghỉ việc, mình đã có nhiều tiến bộ. Không dám nói là lột xác hoàn toàn, nhưng ít nhất cũng lột một lớp da. Khoảng cách vẫn còn đó. Ít nhất còn khoảng cách khi phỏng vấn các vị trí Technical Expert và Architect ở các big tech nổi tiếng. Điều này liên quan đến tính thử thách trong công việc bình thường, giới hạn tầm nhìn nhận thức và sự tổng kết chưa đủ. Lần sau, tôi hy vọng tích lũy đủ thực lực để làm tốt hơn, và tiến gần hơn một chút đến những điều có giá trị và ý nghĩa mà trái tim mình yêu thích.

Phỏng vấn, thực ra cũng là một giai đoạn kinh nghiệm làm việc.

<!-- @include: @article-footer.snippet.md -->
