---
title: Hướng dẫn thực tiễn và tránh sai lầm khi xuất bản sách cho lập trình viên
description: "Hướng dẫn thực tiễn và tránh sai lầm khi xuất bản sách cho lập trình viên: tổng hợp các khái niệm trọng tâm, câu hỏi phổ biến và điểm thực hành, giúp bạn học hiệu quả và chuẩn bị phỏng vấn."
category: Tuyển tập bài viết kỹ thuật chất lượng cao
author: hsm_computer
tag:
  - Lập trình viên
head:
  - - meta
    - name: keywords
      content: 程序员出书,出书避坑,稿酬收益,出版社编辑,图书公司,案例书写作,版权问题,技术写作
---

> **Lời giới thiệu**: Bài viết này giới thiệu chi tiết một số vấn đề thường gặp khi lập trình viên muốn xuất bản sách, rất khuyến khích những ai có ý định viết sách đọc qua.
>
> **Địa chỉ bài gốc**: <https://www.cnblogs.com/JavaArchitect/p/14128202.html>

Xưa có ba điều bất hủ: lập đức, lập công, lập ngôn. Lập trình viên xuất bản một cuốn sách của riêng mình, dù gọi là lập ngôn thì có vẻ cao siêu quá, nhưng cũng là một việc đáng làm.

Viết sách thực ra không kiếm được nhiều tiền, và chu kỳ từ lúc viết đến khi nhận tiền cũng không ngắn. Nhưng nếu lập trình viên có một cuốn sách kỹ thuật của riêng mình, ít nhất trong các buổi phỏng vấn có thể chứng minh được năng lực, và dần dần tích lũy được tên tuổi trong ngành, từ đó tự tin hơn khi phỏng vấn hay làm việc khác. Trong bài này, tôi sẽ chia sẻ kinh nghiệm cá nhân và những bài học đã trải qua về chuyện xuất bản sách của lập trình viên.

## 1. Thu nhập từ bản quyền sách và thời gian cần bỏ ra

Trước tiên nói về thu nhập và chi phí khi xuất bản sách. Tạm thời chưa đề cập đến "tài sản vô hình mà việc xuất bản sách mang lại", hãy nói thẳng về tiền nhuận bút.

Nếu liên hệ trực tiếp với nhà xuất bản, thông thường nhuận bút là tiền bản quyền, bằng 8% giá bìa sách nhân với số lượng in (hoặc số lượng bán thực tế). Nếu bạn là tác giả nổi tiếng thì có thể thương lượng lên cao hơn, nhưng thông thường tỷ lệ bản quyền ước chừng 10% đến 12%. Lưu ý rằng giá ở đây là giá bìa đầy đủ, không phải giá đã giảm.

Ví dụ, một cuốn sách giá bìa 70 tệ, bán trên JD.com với giá giảm 70%, thì tiền bản quyền là 8% của 70 tệ, tức là bán được một cuốn tác giả nhận được 5,6 tệ, tất nhiên khi thực nhận vẫn phải khấu trừ thuế.

Đồng thời cũng cần lưu ý xem hợp đồng quy định trả nhuận bút dựa trên số lượng in hay số lượng bán thực tế. Theo tôi thương lượng với nhà xuất bản, thường là dựa trên số lượng in. Điều này có sự khác biệt gì? Hiện nay sách máy tính thường in lần đầu 2.500 cuốn, thì số tiền thực nhận là 70 × 8% × 2.500, tất nhiên vẫn phải khấu trừ thuế. Nhưng nếu tính theo số lượng bán thực tế mà lần đầu chỉ bán được 1.800 cuốn, thì phải tính theo con số đó.

Một cuốn sách 300 trang hiện nay thường định giá khoảng 70 tệ, tính theo 8% bản quyền và 2.500 cuốn thì thu nhập trước thuế là 14.000 tệ, sau thuế ước chừng 12.000 tệ. Với tác giả mới, viết một cuốn 300 trang tốn ít nhất 8 tháng, từ đó bạn có thể tính thu nhập trung bình mỗi tháng — tính ra chỉ khoảng 1.500 tệ mỗi tháng, thực sự không nhiều.

Ngoài nhuận bút, sau khi xuất bản sách tôi còn có những lợi ích gì khác?

- Khi phỏng vấn ở công ty hiện tại và trước đây, khi tôi nói với nhà tuyển dụng rằng mình đã xuất bản sách trong lĩnh vực liên quan, họ lập tức xem tôi là người có kinh nghiệm sâu, giúp tôi tiết kiệm được nhiều công sức.
- Tôi còn đang làm đào tạo offline, tôi trực tiếp dùng cuốn sách Python mới nhất của mình làm giáo trình, không cần chuẩn bị bài giảng thêm nữa.
- Khi đàm phán dự án với người khác, có thể dùng sách của mình để chứng minh năng lực kỹ thuật. Nếu gặp người lạ lần đầu, bằng chứng này có hiệu quả ngay lập tức.

Đặc biệt là điểm đầu tiên — đối với một số công ty nhỏ hoặc các vị trí phát triển phái cử, nếu ứng viên đã xuất bản sách trong lĩnh vực đó, thậm chí có thể được nhận thẳng mà không cần phỏng vấn. Trước đây tôi đã từng được đối xử như vậy khi phỏng vấn một vị trí phái cử tại công ty lớn.

## 2. Thời điểm trả nhuận bút và thu nhập khi tái bản

Tôi liên hệ trực tiếp với nhà xuất bản để xuất bản sách. Thời điểm trả nhuận bút thường là trong vòng 3 tháng sau khi in lần đầu, nhận được một phần (thường là 50% đến 90%) nhuận bút lần đầu, sau đó một năm sau khi sách xuất bản mới nhận phần còn lại. Hiện tại nhiều sách chỉ bán hết số lượng in lần đầu là tốt rồi, nhưng cũng có nhiều sách được tái bản, thậm chí ra phiên bản thứ hai và thứ ba. Thông thường tiền bản quyền của số lượng tái bản sẽ được thanh toán trong vòng sáu tháng đến một năm sau khi tái bản.

Xét về thời điểm trả nhuận bút, tác giả thực sự phải chờ đợi, hơn nữa nhuận bút cũng không cao tương xứng với công sức. Vì vậy xuất bản sách thực sự không phải cách kiếm tiền, và chu kỳ nhận tiền còn dài. Nếu nhân viên công ty sách một mặt không hỗ trợ gì cho tác giả trong quá trình xuất bản, mặt khác lại lấy chênh lệch, thì đó là việc coi thường công sức của tác giả.

## 3. Những điều tôi thấy và nghe khi giao dịch với công ty sách

Trước khi liên hệ với biên tập viên nhà xuất bản, tôi cũng đã trao đổi với nhân viên các công ty sách. Nhiều người trong số họ khá tôn trọng tôi, dù không nói chuyện sâu nhưng cũng lịch sự. Tuy nhiên, so sánh với các điều kiện nhuận bút mà nhà xuất bản đưa ra, cuối cùng tôi không xuất bản qua công ty sách, điều này cũng khá đáng tiếc. Dưới đây là một số trải nghiệm cụ thể.

- Tôi thường nhận được tin nhắn từ nhân viên công ty sách trên Blog Garden và các nơi khác, hỏi có muốn xuất bản sách không. Thông thường nếu tôi không hỏi, họ sẽ không tự nói mình là biên tập viên nhà xuất bản hay nhân viên công ty sách. Một số nhân viên công ty sách sẽ nói với tác giả, đặc biệt là tác giả mới: "Biên tập viên nhà xuất bản thường không liên hệ trực tiếp với tác giả" và "Xuất bản sách thường phải qua công ty sách". Thực ra những lời này không sai hoàn toàn — nếu bạn không liên hệ với biên tập viên nhà xuất bản thì tất nhiên họ không chủ động tìm bạn. Nhưng ngược lại, nếu tác giả liên hệ trực tiếp với biên tập viên nhà xuất bản thì thứ nhất không khó, thứ hai còn có thể trực tiếp hơn.
- Khi tôi trao đổi đề cương với biên tập viên nhà xuất bản, dù đề cương có chỗ chưa tốt, họ vẫn đưa ra ý kiến sửa đổi cụ thể, ví dụ như một chương cần viết gì, đề cương một tiểu mục nên viết thế nào. Còn khi tôi trao đổi đề cương với một số nhân viên công ty sách, phần lớn phản hồi là "cần viết lại" — nhưng viết lại như thế nào? Những nhân viên này có thể chỉ đưa ra ý kiến trừu tượng, mọi thứ đều để tôi tự nghĩ. Tôi đã từng chia sẻ trải nghiệm cụ thể này trong bài viết trước [Lập trình viên xuất bản sách kỹ thuật như thế nào](./how-do-programmers-publish-a-technical-book).
- Vì không nói chuyện sâu nên tôi chưa ký hợp đồng xuất bản với công ty sách nào, nhưng tôi biết chỉ có nhà xuất bản mới có thể xuất bản sách. Vì chưa có trải nghiệm nên tôi cũng không biết hợp đồng với công ty sách có điều khoản phân tán rủi ro hay không. Nhưng tôi đã từng thấy một số trường hợp trả lại bản thảo mà nhân viên công ty sách đề cập đến, và mờ nhạt nhận ra ý trách cứ tác giả. Nghĩ kỹ thấy không ổn: người phụ trách thứ nhất không thể phát hiện và phản hồi kịp thời khi xảy ra vấn đề; thứ hai không thể điều phối và giải quyết dẫn đến trả lại bản thảo; thứ ba sau khi trả lại bản thảo, tác giả đã bỏ công sức nhưng công ty sách không chỉ không chịu rủi ro gì mà còn có thể chỉ trích tác giả. Về điều này, dù trả lại bản thảo có lý do từ tác giả, nhưng với tư cách cũng là tác giả, tôi không khỏi có cảm giác thương xót. Còn khi xuất bản qua nhà xuất bản, biên tập viên đôi khi còn chủ động quan tâm, chủ động cung cấp tài liệu, kể cả có vấn đề cũng sửa ngay lập tức, vì vậy tình trạng phải sửa đổi lớn hầu như không xảy ra.
- Còn về nhuận bút mà công ty sách trả cho tác giả: Tôi đã thấy trường hợp tính theo trang, ví dụ 30 đến 50 tệ mỗi trang, và bán đứt bản quyền — tức là sách tái bản tác giả cũng không nhận được thêm tiền. Nếu tính theo tỷ lệ bản quyền thì tôi từng thấy mức 6%, còn công ty sách có thể cho đến 8% hay cao hơn không, tôi chưa từng thấy nên không dám khẳng định.

Số nhân viên công ty sách tôi đã tiếp xúc không nhiều, cũng không nói chuyện sâu, vì hiện tại tôi chủ yếu trao đổi với biên tập viên nhà xuất bản. Vì vậy những điều trên chỉ là cảm nhận của tôi về một số nhân viên công ty sách cá biệt, không có ý khái quát hóa. Và một số nhân viên công ty sách tôi đã tiếp xúc ít nhất có thái độ rất tôn trọng tôi. Vì vậy bạn cũng có thể so sánh thử cả hai hình thức hợp tác với công ty sách và nhà xuất bản. Dù sao đi nữa, trước khi viết sách hoặc thậm chí trước khi ký hợp đồng xuất bản, bạn cần hỏi rõ những điều sau, và đối phương có nghĩa vụ để bạn hiểu những sự thật này.

- Bạn cần hỏi rõ đối phương là biên tập viên nhà xuất bản hay nhân viên công ty sách — thực ra đây là điều đối phương nên chủ động nói trước.
- Sách của bạn sẽ được xuất bản tại nhà xuất bản nào? Điều này cần ghi rõ trong hợp đồng xuất bản, không thể viết xong bản thảo rồi mới xác định nhà xuất bản. Hơn nữa, cuối cùng chỉ có nhà xuất bản mới có thể xuất bản sách, chứ không phải công ty sách.
- Phương thức trả nhuận bút — dù công ty sách có thể lấy chênh lệch ở giữa, nhưng ít nhất bạn phải biết nhà xuất bản trả cho bao nhiêu. Nếu bạn xuất bản qua công ty sách, dù công ty sách thương lượng với bạn thế nào, nhà xuất bản trả cho công ty sách không thiếu một xu, phần ở giữa chính là lợi nhuận của công ty sách.
- Hợp đồng xuất bản cuối cùng ký với công ty sách hay với nhà xuất bản — điều này nhất định phải rõ trước khi ký, dù cuối cùng bạn ký hợp đồng với công ty sách, ít nhất cũng phải biết rằng bạn có thể ký trực tiếp với nhà xuất bản.
- Bạn không được có suy nghĩ "yêu cầu xuất bản qua công ty sách thấp hơn", càng không nên nghĩ "năng lực tôi bình thường nên chỉ có thể xuất bản qua công ty sách". Công ty sách tự mình không có tư cách xuất bản, họ cũng phải nộp bản thảo cho nhà xuất bản, vì vậy yêu cầu sẽ không thấp hơn chút nào. Đề cương của bạn không qua được biên tập viên nhà xuất bản thì cũng không qua được nhân viên công ty sách, dù bạn yêu cầu nhuận bút thấp hơn, yêu cầu từ phía công ty sách nhất định cũng không giảm xuống.

Nếu bạn biết rõ "sự khác biệt giữa công ty sách và nhà xuất bản" mà vẫn chọn hợp tác với công ty sách, đó là lựa chọn tự nguyện của hai bên. Nhưng nếu đối phương "không chủ động thông báo", và bạn hợp tác với công ty sách mà không hiểu rõ sự khác biệt, thì đối phương cũng không thể trách cứ được. Dù sao, nghe nhiều ý kiến sẽ sáng suốt hơn — nếu muốn xuất bản sách, hãy thử tiếp xúc và so sánh cả công ty sách lẫn nhà xuất bản.

## 4. Cách liên hệ trực tiếp với biên tập viên của các nhà xuất bản sách máy tính nổi tiếng trong nước

Tôi đã xuất bản sách tại Nhà xuất bản Đại học Thanh Hoa, Nhà xuất bản Công nghiệp Cơ khí, Nhà xuất bản Đại học Bắc Kinh và Nhà xuất bản Công nghiệp Điện tử. Quy trình xuất bản khá suôn sẻ và việc làm việc với biên tập viên cũng khá vui vẻ. Tôi cá nhân không có ý phân loại các nhà xuất bản trong nước, nhưng trong lĩnh vực máy tính, các nhà xuất bản khá nổi tiếng là Thanh Hoa, Công nghiệp Cơ khí, Công nghiệp Điện tử và Nhân Dân Bưu Điện. Tất nhiên các nhà xuất bản khác cũng đã xuất bản những cuốn sách chất lượng trong lĩnh vực máy tính.

Làm thế nào để liên hệ trực tiếp với biên tập viên của những nhà xuất bản nổi tiếng này?

- Vào thẳng website chính thức — thông thường trang chính thức đều có thông tin liên hệ.
- Khi bạn đăng bài trên Blog Garden và các nơi khác, sẽ có người tìm bạn để xuất bản sách. Ngoài nhân viên công ty sách còn có biên tập viên nhà xuất bản — thông thường biên tập viên nhà xuất bản sẽ giới thiệu rõ danh tính, ví dụ: "Tôi là biên tập viên xx của nhà xuất bản xx."
- Tôi cũng đã liên hệ với một số biên tập viên nhà xuất bản, nếu cần tôi có thể giới thiệu.

Còn tìm nhân viên công ty sách ở đâu? Thường không cần chủ động tìm, sau khi bạn đăng một số bài blog, họ sẽ tự tìm bạn. Nếu bạn hỏi cụ thể "Bạn là biên tập viên nhà xuất bản hay nhân viên công ty sách?", họ sẽ xác nhận danh tính. Nếu hỏi thêm, họ có thể đứng từ lập trường của công ty sách để giải thích sự khác biệt giữa nhà xuất bản và công ty sách.

Qua đó, dù bạn có viết thành sách hay không, việc tìm biên tập viên của nhà xuất bản nổi tiếng thực ra không khó. Và sau khi liên hệ, họ còn có thể tiếp tục trao đổi với bạn về chủ đề sách.

## 5. Quy trình xác định chủ đề và xuất bản sách

Đây là quy trình tôi hợp tác với biên tập viên nhà xuất bản để cuối cùng xuất bản sách.

Thứ nhất, sau khi liên hệ được với biên tập viên nhà xuất bản, hãy thảo luận về chủ đề. Bạn có thể chọn một lĩnh vực bạn quen thuộc hoặc muốn chuyên sâu — có thể là các component phân tán Java, bộ Spring Cloud, microservices, hoặc phân tích dữ liệu Python, machine learning hay deep learning. Nếu bạn có kinh nghiệm dự án vững chắc trong lĩnh vực đó thì tốt nhất; nếu chưa quen nhưng có đủ quyết tâm học có hệ thống trong thời gian ngắn để đảm bảo nội dung viết ra thành hệ thống hoặc có ích cho người khác, bạn cũng có thể xuất bản sách trong lĩnh vực đó.

Thứ hai, sau khi xác định hướng chủ đề, bạn có thể liệt kê đề cương, ví dụ với phân tích dữ liệu Python bạn có thể định 12 chương: chương 1 giới thiệu cú pháp, chương 2 giới thiệu numpy, v.v. Khi lập đề cương có thể tham khảo mục lục sách của người khác. Sau khi có đề cương, trao đổi với biên tập viên, khi họ đồng ý thì có thể ký hợp đồng xuất bản.

Với hầu hết tác giả, hợp đồng xuất bản thường tương tự nhau — nhuận bút thường là 8%, thời gian viết thương lượng với nhà xuất bản, chu kỳ trả tiền có thể giống nhau, và nhà xuất bản sẽ mua lại bản quyền điện tử và các bản ngôn ngữ khác. Nhưng nếu tác giả là người nổi tiếng thì tất cả những chi tiết này đều có thể thương lượng.

Tiếp theo là viết sách — đây là công việc rất nhàm chán, đặc biệt khi viết những chương cuối. Thông thường tôi viết nửa tiếng mỗi ngày trong tuần, cuối tuần viết 4-5 tiếng mỗi ngày. Như vậy thường có thể hoàn thành một cuốn 300 trang trong nửa năm. Về kỹ thuật viết sách hiệu quả, phần sau sẽ đề cập chi tiết.

Khi viết sách, thông thường nên nộp từng chương cho biên tập viên xem sau khi viết xong, để tránh tích lũy quá nhiều vấn đề. Hơn nữa với tác giả mới, từ ngữ và kỹ thuật viết ban đầu cần tích lũy, biên tập viên nhà xuất bản có thể hỗ trợ tác giả kịp thời ngay từ đầu.

Sau khi nộp bản thảo cho biên tập viên, có thể sẽ có quy trình đọc và kiểm tra ba lần. Trong đó biên tập viên hợp tác với tôi sẽ giúp sửa các lỗi ngữ pháp và chính tả, sau đó đưa ra ý kiến sửa đổi để tôi xác nhận và chỉnh sửa. Theo tôi tìm hiểu, nếu xuất bản qua công ty sách, rủi ro trả lại bản thảo thường xảy ra ở giai đoạn này vì công ty sách có thể nộp bản thảo cho nhà xuất bản một lần. Nhưng vì tôi nộp từng chương trực tiếp cho biên tập viên nhà xuất bản, nên kể cả có vấn đề lớn, từ vài chương đầu đã được phát hiện và sửa đổi, vì vậy ý kiến sửa đổi cuối cùng thường không dài. Tức là nếu liên hệ trực tiếp với nhà xuất bản, khối lượng công việc trong giai đoạn đọc và kiểm tra có thể không lớn. Thông thường sau khi nộp một cuốn sách, biên tập viên làm việc này, tôi lại tiếp tục lên kế hoạch và bắt đầu viết cuốn tiếp theo.

Cuối cùng là nhận nhuận bút — như đã nói, tác giả không nên kỳ vọng quá cao vào nhuận bút, đó chỉ là phần thưởng nhỏ. Nhưng nếu vô tình viết được cuốn sách bán khoảng 5.000 đến 10.000 bản, thì có thể kiếm thêm khoảng 50.000 tệ trong một năm và tích lũy được tên tuổi trong ngành.

## 6. Viết sách minh họa nhanh hơn viết sách kinh nghiệm

Với một số tác giả, đặc biệt là tác giả mới, xuất bản sách không dễ — thường là những chương đầu hào hứng lắm, về sau gặp ngày càng nhiều vấn đề, thêm vào đó công việc bận, cuối cùng bỏ dở, hoặc mất hơn một năm mới hoàn thành. Theo tôi, chu kỳ viết một cuốn 300-400 trang tối đa là 8 tháng. Để hoàn thành trong thời gian đó, tôi khuyên tác giả mới nên viết sách minh họa (case study), đừng vội viết sách chia sẻ kinh nghiệm.

Sách minh họa là gì? Ví dụ một cuốn sách dùng một case study lớn xuyên suốt để giới thiệu hệ thống một kiến thức, như phát triển mini program hay phát triển fullstack. Hoặc mỗi chương có một case study riêng, một cuốn sách có khoảng 10 case study về deep learning Python. Còn sách kinh nghiệm là gì? Ví dụ sách giới thiệu kinh nghiệm phỏng vấn, hoặc sách của các chuyên gia kỹ thuật nổi tiếng chia sẻ kinh nghiệm phát triển hệ thống phân tán hiệu năng cao.

Ở đây không có ý so sánh hơn kém giữa hai loại sách, chỉ là đối với tác giả mới, sách minh họa dễ viết hơn. Vì trong đó chủ yếu là "nhìn hình nói chuyện" — trước tiên đưa ra case study (ví dụ case study nhận dạng hình ảnh trong deep learning Python), sau đó qua case study giới thiệu cách dùng API (ví dụ cách dùng thư viện Python tương ứng), cũng như những điểm kỹ thuật tổng hợp (ví dụ cách dùng thư viện Python để thực hiện tổng thể chức năng nhận dạng hình ảnh). Hơn nữa trong sách minh họa, tác giả cần thể hiện quan điểm chủ quan ít hơn, không cần tự mình tóm tắt kinh nghiệm liên quan. Với tác giả mới, khi tổ chức ngôn ngữ để chia sẻ kinh nghiệm, có thể gặp tình trạng tự hiểu nhưng không nói được — như vậy một mặt không đạt được hiệu quả mong muốn, mặt khác còn có thể khiến tiến độ bị chậm vì không thể diễn đạt hiệu quả.

Ngược lại với sách minh họa: thứ nhất case study có thể tham khảo của người khác; thứ hai giới thiệu công nghệ có sẵn dễ hơn giới thiệu kinh nghiệm của bản thân; thứ ba thường có sách cùng loại để tham khảo. Vì vậy tác giả ít cần cân nhắc từ ngữ, tác giả mới dành 6 đến 8 tháng cũng có thể hoàn thành. Khi tác giả đã tích lũy kinh nghiệm qua vài cuốn sách, hãy thử thách sách kinh nghiệm — lúc đó sách kinh nghiệm viết ra có thể bán chạy.

Vậy cụ thể, làm thế nào để viết hiệu quả một cuốn sách minh họa?

- Với toàn bộ cuốn sách, dùng một vài chương đầu để giới thiệu cách cài đặt môi trường và cú pháp cơ bản chung.
- Khi viết case study từng chương, dùng cấu trúc "tổng - phân - tổng": trước tiên giới thiệu tổng quan yêu cầu và tính năng của case study cũng như các điểm kỹ thuật sẽ dùng; tiếp theo trình bày riêng từng chức năng với code triển khai; cuối cùng tóm tắt các điểm sử dụng quan trọng của các chức năng đó.
- Khi giới thiệu code cụ thể trong case study, cũng có thể dùng cấu trúc "tổng - phân - tổng": trước tiên giới thiệu tổng quan cấu trúc đoạn code; sau đó lần lượt giải thích các đoạn code quan trọng; cuối cùng nêu kết quả chạy và tóm tắt các điểm kỹ thuật triển khai.

Như vậy ban đầu có thể là 1 tháng 1 chương, sau khi quen dần thì mỗi tháng có thể viết được 2 chương, 8 tháng hoàn thành một cuốn sách không phải là điều không thể.

## 7. Cách tránh vấn đề bản quyền khi tham khảo nội dung có sẵn

Khi viết sách, thường ít nhiều phải tham khảo code và sách có sẵn, nhưng đây hoàn toàn không phải là sao chép lại. Ví dụ một tác giả tổng hợp nhiều case study từ các trang web khác nhau rồi trình bày hệ thống về phân tích dữ liệu Python — dù tài liệu có sẵn, nhưng với người đọc thì có thể học một lần tại một chỗ. Tương tự trong lĩnh vực mạng nơ-ron Python, có 2-3 cuốn sách đã đưa ra một số case study như nhận dạng khuôn mặt riêng lẻ, nhưng nếu bạn tích hợp hiệu quả tất cả lại và thêm vào chức năng của bạn, điều đó cũng có giá trị với người đọc.

Điều này liên quan đến vấn đề bản quyền — cần nói rõ rằng tác giả không được có bất kỳ ảo tưởng nào. Nếu xảy ra vấn đề bản quyền, sách chưa xuất bản thì còn may, nếu đã xuất bản thì tác giả không chỉ phải bồi thường mà còn có tiếng xấu trong ngành, có thể nói là thân bại danh liệt. Nhưng thực ra tránh vấn đề bản quyền hoàn toàn không khó.

- Không được sao chép nội dung có sẵn trên mạng, dù chỉ một câu cũng không được. Để làm điều này, tác giả có thể viết lại dựa trên sự hiểu biết ý nghĩa của câu đó. Không được sao chép mục lục sách của người khác, càng không được sao chép từng chữ trong sách, tương tự dù chỉ một câu cũng không được. Cách giải quyết tương tự là viết lại sau khi hiểu.
- Không được sao chép code của người khác trên GitHub hay bất kỳ nơi nào khác, dù code đó là mã nguồn mở. Để làm điều này, sau khi hiểu code của đối phương, hãy chạy thử trước, sau đó nhất định phải tự tạo một project mới, và trong project của bạn tham chiếu code của người khác để triển khai chức năng của bạn. Trong quá trình này không được copy-paste từng đoạn dài. Tức là code của bạn và code của người khác không được giống nhau về comment, đặt tên biến, tên class và tên phương thức. Tất nhiên bạn còn có thể thêm vào các chức năng của riêng bạn.
- Còn khi viết giới thiệu kỹ thuật và case study, bạn có thể dùng ngôn ngữ của mình, như vậy cũng không xảy ra vấn đề bản quyền.

Áp dụng các phương pháp trên, tác giả có thể dựa trên tài liệu có sẵn để thêm vào đầy đủ chức năng của bạn, viết lên những hiểu biết độc đáo của bạn, từ đó xuất bản hiệu quả cuốn sách thuộc về chính mình.

## 8. Những vấn đề tác giả mới cần đặc biệt tránh

Phần trên đã trình bày chi tiết quy trình xuất bản sách và đưa ra phương pháp viết cụ thể qua sách minh họa. Ở đây tôi đặc biệt dành cho tác giả mới một số điểm thực hành cần chú ý.

- Sách kỹ thuật khác sách văn học nghệ thuật — điều quan trọng nhất là đảm bảo trình bày rõ ràng các kiến thức kỹ thuật, sau đó mới có thể thêm vào một số diễn đạt thú vị sinh động. Vì vậy với tác giả mới, thậm chí có thể dùng ngôn ngữ đơn giản để giới thiệu kỹ thuật case study, không cần quá lo lắng về sự sinh động của ngôn từ.
- Nội dung cần hướng đến người mới học. Khi giới thiệu kỹ thuật, bắt đầu từ nền tảng cơ bản nhất, đừng nói quá sâu. Lấy machine learning Python làm ví dụ, có thể bắt đầu từ machine learning là gì và Python triển khai machine learning như thế nào. Nhưng nếu bắt đầu ngay bằng kinh nghiệm thực hành trong machine learning thì chưa chắc đảm bảo người mới học được.
- Tác giả mới muốn viết hết tất cả những gì mình biết. Thái độ đó rất tốt, nhưng cần xem xét khả năng tiếp nhận thực tế của người đọc. Vì vậy trước khi viết sách cần đặt ra mục tiêu kỳ vọng — ví dụ: sau khi đọc sách của tôi, người phát triển Python chưa có kiến thức nền ít nhất có thể làm việc được. Mục tiêu này đừng không thực tế, ví dụ "sau khi đọc sách người chưa có kiến thức nền đạt được trình độ 3 năm kinh nghiệm". Như vậy có thể dựa trên mục tiêu đã định sẵn để xác định nội dung viết, tập trung giảng dạy kiến thức cơ bản, người đọc mới thực sự có thu hoạch.

Nhưng nói đi thì cũng phải nói lại — nếu tác giả mới liên hệ trực tiếp với biên tập viên nhà xuất bản, chọn một hướng đang hot và giải thích kỹ lưỡng kỹ thuật qua case study, thậm chí có thể viết được cuốn sách bán trên vạn bản.

## 9. Tóm tắt: Xuất bản sách tại nhà xuất bản nổi tiếng trong nước thực ra là việc cần nỗ lực kiên trì

Hiện nay viết tài khoản công khai và quay video có thể kiếm được thu nhập cao hơn xuất bản sách. Nhưng nói thật, vận hành tài khoản công khai và quay video cũng là công việc lâu dài, trong thời gian ngắn có thể chưa có thu nhập, nếu không đăng nội dung một cách có hệ thống thì thậm chí không có thu nhập gì. Vì vậy xuất bản sách có thể là bước chuẩn bị tốt từ đầu — bạn tích lũy tài liệu có hệ thống qua việc xuất bản sách, tích hợp hệ thống kiến thức của bạn, từ đó kiếm tiền qua tài khoản công khai hay video có thể đạt hiệu quả gấp đôi.

Qua phần trên, bạn có thể thấy rằng trong giai đoạn đầu, liên hệ biên tập viên nhà xuất bản và xác định chủ đề sách không khó. Nếu viết sách minh họa, dựa trên nội dung của người khác mà hoàn thành một cuốn sách thông thường cũng không phải điều cao siêu không thể đạt. Thậm chí có thể nói, xuất bản sách là việc cần nỗ lực kiên trì — chỉ cần bền bỉ, xuất bản được một cuốn sách không khó, vấn đề là bạn có muốn kiên trì không. Nhưng một khi bạn có cuốn sách kỹ thuật của riêng mình, khi tìm việc bạn có thể tự tin nói với nhà tuyển dụng rằng mình là chuyên gia trong lĩnh vực đó; trong video, tài khoản công khai và bài viết của bạn, bạn cũng có thể đàng hoàng tự nhận là tác giả sách máy tính. Quan trọng hơn, cũng như xuất thân từ trường danh tiếng và công ty lớn, cuốn sách kỹ thuật của bạn là bằng chứng quan trọng để chứng minh năng lực của lập trình viên. Sau khi tích hợp hiệu quả hệ thống kiến thức trong lĩnh vực đó qua việc xuất bản sách, dù là tìm việc, làm freelance hay nhận dự án, bạn đều có thể tự tin nói với người khác: Tôi làm được!

<!-- @include: @article-footer.snippet.md -->
