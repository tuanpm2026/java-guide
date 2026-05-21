---
title: Chia sẻ kinh nghiệm 2 năm làm backend tại Didi và Toutiao
description: "Chia sẻ kinh nghiệm 2 năm làm backend tại Didi và Toutiao - Tổng hợp các điểm thực hành."
category: Technical Articles Selection
tag:
  - Kinh nghiệm cá nhân
head:
  - - meta
    - name: keywords
      content: Didi work experience,Toutiao work experience,backend development,technical growth,workplace experience,deep thinking,summarization,proactive ownership
---

> **Lời giới thiệu**: Chia sẻ kinh nghiệm làm việc rất thực tiễn — đọc xong rất có ích!
>
> **Content overview**:
>
> - Học cách suy nghĩ sâu, tổng kết và tích lũy — đây là điều tôi thấy quan trọng và có ý nghĩa nhất.
> - Học hỏi tích cực, duy trì đam mê kỹ thuật. Nếu chúng ta học tích cực, technical capability và knowledge tỷ lệ thuận với số năm kinh nghiệm, thì đến 35 tuổi còn lo lắng gì nữa? Những "giants" như vậy tôi nghĩ các công ty sẽ tranh giành.
> - Về việc tạo ra giá trị cho công ty, tôi nghĩ hai chữ quan trọng nhất là CHỦ ĐỘNG: chủ động nhận task, chủ động giao tiếp, chủ động thúc đẩy tiến độ, chủ động coordinate resources, chủ động báo cáo upward, chủ động tạo influence.
> - Mặt dày thêm một chút, tìm nhiều người để nói chuyện, hòa nhập nhanh. Điều cấm kỵ nhất là có vấn đề mà không nói, tự cô lập bản thân.
> - Muốn "tặng hoa" thì cứ tặng, không muốn tặng cũng không cần chua ngoa người khác. Respect Greatness.
> - Luôn sẵn sàng. Có kỹ thuật trong tay thì không sợ gì, hôm nào không vui thì nhảy việc thẳng.
> - Thường xuyên tổng kết tích lũy, trao đổi với nhiều người, hình thành methodology.
> - ……
>
> **Original article**: <https://www.nowcoder.com/discuss/351805>

Trước tiên giới thiệu sơ về background. Học 985 không tên tuổi mấy, tốt nghiệp thạc sĩ năm 2017 vào Didi. Lúc tìm việc cũng chiến đấu cùng mọi người trên Nowcoder. Cuối năm nay nhảy sang Toutiao, luôn làm backend development. Trước đây không có internship experience, tính ra khoảng 2.5 năm kinh nghiệm. Trong 2.5 năm này hoàn thành một lần promotion, đổi một công ty, có lúc vui vẻ thỏa mãn, có lúc mông lung vật lộn. Nhưng cũng thuận lợi chuyển từ một junior "newbie" trong nghề thành một "senior slacker". Trong quá trình này tổng kết được một số kinh nghiệm thực tế. Một số là bản thân ngộ ra, một số học từ giao lưu với người khác — chia sẻ ở đây.

## Học cách suy nghĩ sâu và tổng kết tích lũy

**Điều đầu tiên tôi muốn nói là học cách suy nghĩ sâu, tổng kết và tích lũy — đây là điều tôi thấy quan trọng và có ý nghĩa nhất.**

**Trước tiên nói về suy nghĩ sâu.** Trong giới programmer, thường nghe những quan điểm: _"Công việc này chẳng có hàm lượng kỹ thuật gì cả. Hàng ngày chỉ CRUD, viết if-else, cái này TM dạy được gì tôi?"_

Bỏ qua phần châm biếm và đùa cợt, đây có thể thực sự là suy nghĩ thật của một số người — ít nhất là tôi trước đây cũng từng nghĩ vậy. Sau này với sự tích lũy kinh nghiệm, cộng thêm giao lưu với một số high-level colleagues, tôi phát hiện suy nghĩ này thực ra rất sai lầm. Lý do xuất hiện quan điểm "không có gì để học" về cơ bản là kết quả của sự lười biếng trong suy nghĩ. **Bất kỳ điều gì trông có vẻ nhỏ nhặt, chỉ cần suy nghĩ sâu hơn, đào sâu một chút theo chiều dọc hoặc mở rộng theo chiều ngang, đều là biển kiến thức đủ để người ta đắm chìm.**

Ví dụ. Một người nói với tôi: Tuần này có service bị OOM, query một tuần phát hiện một chỗ defer viết sai, sửa vài dòng code lên line fix được, weekly report cũng không biết viết gì. Có thể nhiều người cũng gặp scenario tương tự. Thực ra việc query bug là quá trình phát hiện vấn đề, điều tra vấn đề, giải quyết vấn đề — bao gồm nhiều bước như trigger, locate, reproduce, root cause, fix, retrospective. Mất một tuần làm việc này, chắc chắn có quá trình liên tục thử nghiệm và sửa lỗi — ở đây thực ra có rất nhiều không gian để suy nghĩ. Ví dụ về location: làm thế nào để thu hẹp phạm vi? Đi nhiều con đường vòng nào? Dùng những analysis tools gì? Về root cause: có thể nghiên cứu linux OOM, k8s OOM, go memory management, defer mechanism, function closure principles. Nếu những thứ này thực sự không liên quan mà vẫn mất một tuần, thì retrospective hẳn có nhiều suy nghĩ — đặt ra vài chục "WHY" không khó...

**Tiếp theo nói về tổng kết tích lũy.** Đây cũng là điều tôi nghĩ đa số programmers còn thiếu. Chỉ chăm chú làm việc mà không bao giờ làm abstract summarization — dẫn đến dù làm nhiều năm, kiến thức vẫn rời rạc, không thành hệ thống, dễ quên và tầm nhìn hẹp. Tổng kết định kỳ rất quan trọng — đây là quá trình từ tactics lên strategy. Khi gặp vấn đề cùng loại, có thể dùng methodology đã tổng hợp để tiếp cận và giải quyết có hệ thống và có tầng lớp.

Ví dụ. Làm backend service, hôm nay tối ưu 1G memory, ngày mai tối ưu 50% read/write latency — có thể tổng kết về performance optimization không? Ở application layer: manage applications calling the service, tidy up their access rationality. Ở architecture layer: caching, preprocessing, read-write separation, async, parallel. Ở code layer: resource pooling, object reuse, lock-free design, large key splitting, lazy processing, encoding compression, GC tuning... Lần sau gặp scenario cần performance optimization, toàn bộ thinking framework có thể áp dụng ngay.

Còn nếu bạn chỉ làm business requirements hàng ngày — business requirements cũng có thứ để tổng kết. Ví dụ làm system building: system core capabilities, system boundaries, system bottlenecks, service layering và splitting, service governance đã suy nghĩ chưa? Hàng ngày thảo luận requirements với PM — là technical person, làm thế nào để cultivate product thinking, guide product direction, làm thế nào để architecture precede business — những vấn đề này cũng có thể suy nghĩ và tổng kết. Ngay cả việc tiếp nhận maintain legacy code của người khác — Martin Fowler còn làm được cả một bộ refactoring theory trông rất impressive. Chúng ta không cần self-deprecate về công việc của mình...

Vì vậy: **Học hỏi và phát triển là quá trình self-driven. Nếu cảm thấy không có gì để học, khả năng cao không phải là thực sự không có gì để học, mà là vì bản thân quá lười — không chỉ về hành động mà cả về suy nghĩ. Có thể viết technical articles nhiều hơn, chia sẻ nhiều hơn — buộc mình phải suy nghĩ và tổng kết. Xét cho cùng nếu article không đủ depth, chính mình cũng không nỡ chia sẻ công khai.**

## Học hỏi tích cực, duy trì đam mê kỹ thuật

Gần đây lan truyền rộng rãi một anxiety theory gọi là "35-year-old programmer phenomenon" — đại ý là programmers làm đến 35 tuổi cơ bản là chờ bị layoff. Không thể phủ nhận ngành internet về điểm này thực sự không bằng các nghề ổn định như civil service. Nhưng "35 tuổi" ở đây không phải nghĩa đen về tuổi sinh học — mà chỉ những programmers mà làm việc 10+ năm và làm việc 2-3 năm không có sự khác biệt lớn. Công việc về sau chỉ là "ăn vốn cũ", không chủ động học hỏi và charge up. 35 tuổi và 25 tuổi giống nhau, mà không còn khát khao học hỏi như 25 tuổi, ngược lại lại thêm nhiều phiền toái của cuộc sống gia đình, salary requirements thường cũng cao hơn. Từ góc nhìn doanh nghiệp, điều này thực sự không có sức cạnh tranh.

**Nếu chúng ta học hỏi tích cực, technical capability và knowledge tỷ lệ thuận với năm kinh nghiệm, thì đến 35 tuổi còn lo lắng gì nữa? Những "giants" như vậy tôi nghĩ các công ty sẽ tranh giành.** Nhưng **học hỏi thực ra là quá trình "anti-human" — đòi hỏi chúng ta phải ép mình thoát ra khỏi comfort zone, chủ động học hỏi, duy trì đam mê kỹ thuật.** Tại Didi có một câu đại khái là: **Chủ động thoát ra comfort zone của mình. Khi cảm thấy khó khăn và áp lực, đó thường là bóng tối trước bình minh — đó mới là khi phát triển nhanh nhất. Ngược lại nếu cảm thấy mỗi ngày đều rất thoải mái, công việc chỉ là đếm giờ — đó có thể thực sự là "ếch ngồi đáy giếng" rồi.**

Giai đoạn vừa mới tốt nghiệp, thời gian tự do thường còn khá nhiều — đây là thời điểm tốt để học kỹ thuật chăm chỉ. Lợi dụng giai đoạn này để xây dựng nền tảng vững, cultivate good learning habits và maintain positive learning attitude — điều này sẽ có ích suốt đời.

**Có thể tham gia learning groups và technical communities — cả bên trong và bên ngoài công ty. Theo dõi cutting-edge technologies.**

## Chủ động nhận nhiệm vụ, giao tiếp và báo cáo kịp thời

Hai điểm trên vẫn từ góc độ cá nhân mà nói. Hy vọng mọi người có thể nâng cao năng lực cá nhân và duy trì core competitiveness. Nhưng từ góc nhìn công ty, điều quan trọng nhất là employees tạo ra business value.

**Về việc tạo ra giá trị cho công ty, tôi nghĩ hai chữ quan trọng nhất là CHỦ ĐỘNG: chủ động nhận task, chủ động giao tiếp, chủ động thúc đẩy tiến độ, chủ động coordinate resources, chủ động báo cáo upward, chủ động tạo influence.**

Khi mới vào làm, tôi về cơ bản là leader phân công task gì thì làm tốt, xong rồi làm việc của mình — gần như không bao giờ chủ động giao tiếp với người khác hay chủ động suy nghĩ về ý tưởng giúp project phát triển. Tự nghĩ rằng hoàn thành tốt công việc được giao là đủ. Sau này mới phát hiện làm vậy thực ra rất không đủ — đó chỉ là yêu cầu tối thiểu. Một số colleagues thì leader chỉ cần sync hướng gần đây, phần còn lại hầu như không cần leader lo — loại colleague này nếu tôi là leader tôi cũng thích. Sau khi vào làm thường nghe một từ gọi là "owner mindset" — đại khái là ý này.

Trong quá trình này, một điểm quan trọng nữa là giao tiếp và báo cáo upward kịp thời. Tiến độ project không thuận, gặp vấn đề gì thì sync kịp thời với leader. Technical solution không chắc có thể thảo luận với leader. Một số resources không coordinate được thì nhờ leader. Đừng quá e ngại. Leader thực ra chính là làm điều này. Nếu project thuận lợi, không cần leader can thiệp — cũng cần kịp thời phản hồi tiến độ, kết quả đạt được, chia sẻ ý tưởng, hỏi ý kiến leader về những gì cần cải thiện. Một mặt là sử dụng hợp lý resources của leader, mặt khác để leader hiểu workload của mình, có cái nhìn tổng thể về project. Điều quan trọng nhất — đừng nhận task xong rồi cắm đầu làm, một tháng không sync với leader, nghĩ sẽ tung ra surprise — cơ bản là over.

**Nhất định phải chủ động. Có thể bắt đầu bằng cách ép mình phát biểu ở các public occasions. Có vấn đề hay ý tưởng thì one-on-one kịp thời.**

Ngoài những điểm trên, còn một số points nhỏ tôi thấy cũng quan trọng:

## Tạo sự tin tưởng từ việc đầu tiên

Dù campus hay social recruitment, việc đầu tiên sau khi gia nhập rất quan trọng — quyết định trực tiếp first impression với leader và colleagues. Việc đầu tiên sau khi vào nhất định phải làm tốt, ít nhất phải hoàn thành suôn sẻ và không được có online incidents. Mục đích là xây dựng trust, để team cảm thấy mình ít nhất là đáng tin. Nếu làm tốt việc này, sau đó sẽ khá thuận lợi. Nếu làm hỏng, có thể một số leaders sẽ cho cơ hội thứ hai. Làm hỏng nữa thì sau này rất khó — điều này đặc biệt quan trọng với social recruitment.

Khi mới vào, không quen tech stack của công ty, business phức tạp — áp lực thực sự khá lớn. Lúc này một mặt cần bỏ thêm nhiều effort, mặt khác phải trao đổi nhiều với team members, không biết thì hỏi. **Cách học hiệu quả nhất, tôi nghĩ không phải đọc sách hay xem video học tập, mà là trực tiếp tìm người tương ứng để nói chuyện, để người khác giảng một lần thì mình hiểu hết. Hiệu quả này nhanh hơn nhiều so với xem documentation hay code — không chỉ bỏ qua quá trình lọc thông tin vô dụng mà còn hiểu được lịch sử phát triển của business. Tất nhiên điều này cần một số communication skills — xét cho cùng colleagues cũng rất bận.**

**Mặt dày thêm một chút, tìm nhiều người để nói chuyện, hòa nhập nhanh. Điều cấm kỵ nhất là có vấn đề mà không nói, tự cô lập bản thân.**

## Vượt quá kỳ vọng

Vượt quá kỳ vọng có phạm vi ngoại diên rất rộng. Ví dụ leader cho đi trực duty, giải đáp câu hỏi của users trong group. Kết quả không chỉ giải đáp câu hỏi mà còn thu thập và phân loại những câu hỏi đó, rồi làm một intelligent Q&A bot để giải phóng labor của duty person. Đây tính là vượt quá kỳ vọng. Ví dụ leader cho làm một small tool cho operations, kết quả xây dựng thành một series of tools thậm chí phát triển thành một platform, trở thành một complete project — đây cũng là vượt quá kỳ vọng.

Vượt quá kỳ vọng đòi hỏi khả năng "make things bigger" — tức là nghĩ đến chỗ mà leader chưa nghĩ, và tạo ra practical value.

**Phần này phụ thuộc nhiều vào cá nhân, tạm thời chưa nghĩ được shortcut nào — chỉ nghĩ thêm một bước thôi.**

## Suy nghĩ có hệ thống, xây dựng có hệ thống

Câu này được tổng kết trong lần promotion. Đại ý là làm system building cần có global perspective, không được giới hạn ở một điểm nhỏ. Cần có good planning capability và clear evolution blueprint. Ví dụ hôm nay thêm một monitoring, ngày mai thêm một alert — những việc này không nên thành từng ốc đảo riêng lẻ, mà là một bước nhỏ trong stability building phase 1. Phase này làm alert configuration và monitoring cleanup, bao gồm machine monitoring, system monitoring, business monitoring, data monitoring — expected results là XXX. Công việc này còn có subsequent roadmap: stability building phase 2 làm capacity planning, access load testing. Phase 3 làm degradation drills, multi-region disaster recovery... Cảm giác người này suy nghĩ rất toàn diện, làm việc có hệ thống và có kế hoạch.

**Thường xuyên tổng kết tích lũy, trao đổi với nhiều người, hình thành methodology.**

## Nâng cao soft skills

Những soft skills tôi muốn nói ở đây là PPT, communication, expression, time management, design, documentation. Thực ra tôi nghĩ lúc tôi được promotion là vì PPT làm tốt hơn một chút... Có thể nhiều người thường không chú ý những khả năng này. Trước đây tôi cũng không coi trọng, cảm thấy khá đơn giản, dùng đến thì lên được. Nhưng thực tế có thể không đơn giản như tưởng. Ví dụ PPT + presentation + defense khi promotion — thực ra có nhiều chi tiết cần suy nghĩ: chọn nội dung gì, layout thiết kế thế nào, làm thế nào dẫn dắt cảm xúc của người nghe, làm thế nào trả lời câu hỏi của evaluators. Tôi thấy nhiều colleagues trong promotion PPT content lộn xộn, presentation cũng không trôi chảy tự nhiên. Dù thực sự đã làm rất nhiều công việc thực tế, nhưng thiếu nhiều ở expression. Nếu lại gặp external department evaluators không hiểu tình huống thực tế, bị thua thiệt là có thể thấy trước.

**Intranet thường có soft skills training courses. Có thể tìm một số occasions để deliberately practice.**

Trên đây là những điều khá "chính thống". Nhưng xã hội cũng không hoàn toàn tốt đẹp như vậy...

## Nịnh hót thực sự là có ích

Nịnh hót là thứ trước khi đi làm tôi rất phản cảm. Lý do ban đầu muốn vào internet company là vì nghĩ văn hóa ở đó ít "cửa sau" hơn. Thực tế chứng minh, tôi đã sai...

Vài ngày sau khi vào công ty, big leader trong department group post một tin nhắn, lập tức mấy chục tin nhắn thumbs up theo sau: "học hỏi được rồi, like, great, excellent"... Ngoài việc kinh ngạc trước tốc độ nhận thông tin và xử lý của mọi người, tôi còn phát hiện ngay cả nịnh hót cũng có formation. Level 1 department leader post, mấy level 2 department leaders follow, sau đó các group leaders follow, cuối cùng là cuộc vui của tất cả mọi người. Khiến tôi một thời gian nghi ngờ tốc độ nịnh hót quyết định tiền đồ sự nghiệp.

Tôi thực ra đến giờ vẫn không quen nịnh hót công khai trong group, nhưng cũng không phản cảm nữa. Phát hiện direct leader của mình cũng không hay nịnh hót trong group, nên bề ngoài tôi không nịnh công khai thực ra thuộc loại thầm lặng đã đi theo ý thích của leader...

Nhưng nịnh hót chừng mực thì tổng thể vẫn ích, ít nhất không có hại. Mỗi lần nịnh trong group là một lần lộ diện. Như một colleague nói, đó gọi là building cá nhân technical influence.

**Muốn "tặng hoa" thì cứ tặng, không muốn tặng cũng không cần chua ngoa người khác. Respect Greatness.**

## Thực tế bất biến của tranh giành và đổ lỗi

Nơi có người là có giang hồ. Dù làm kỹ thuật phần lớn cũng không quá deep về schemes, nhưng tranh giành, đổ lỗi, cướp credit cũng không thiếu. Phần này liên quan một số thông tin nhạy cảm nên không nói nhiều. Chỉ nhắc nhở mọi người: sớm muộn gì cũng sẽ "ăn dưa hấu" (chứng kiến drama) về những chuyện này. Lúc đó để ý một chút.

**Chú ý một chút. Chúng ta không đi bắt nạt người khác, nhưng cũng không dễ để người khác bắt nạt mình.**

## Đừng để bị "bánh vẽ" mà mù quáng

Thành thật mà nói, cá nhân tôi khá phản cảm với kiểu nhồi "chicken soup for the soul", bơm enthusiasm, nói về dreams và talk about hard work. 2019 rồi mà những thứ này vẫn thịnh hành — thực không biết nên buồn cười hay đáng thương. Tất nhiên những từ này bản thân không có gì sai, nhưng những thứ này nên là self-driven chứ không phải bị external force push. "Tôi phải nỗ lực phấn đấu" là bình thường, nhưng "bạn phải nỗ lực phấn đấu" nghe hơi kỳ lạ. Đặc biệt khi tiền chưa trả đủ mà vẫn như vậy — không khác gì lừa đảo. Cần giữ nhận thức tỉnh táo về những "bánh vẽ" operations của leader, phân tích lý trí, đưa ra quyết định.

Ví dụ cảm thấy lương chưa đủ: có thể có nhiều tình huống:

1. Leader chưa chú ý đến thực tế lương bạn thấp
2. Leader biết nhưng không biết bạn có nhu cầu tăng lương mạnh thế
3. Leader biết bạn có nhu cầu nhưng cho là năng lực chưa đủ
4. Leader biết và năng lực cũng đủ nhưng không muốn tăng
5. Leader muốn tăng, đã reflect và tranh luận upward nhưng không có resources

Lúc này cần báo cáo upward, giao tiếp với leader để xác nhận. Nếu là 1 và 2, giao tiếp có thể giải quyết information gap. Nếu là 3, cần thảo luận tùy từng case. Nếu là 4 và 5 — có thể cân nhắc rời đi rồi. Không cần phàn nàn — phàn nàn không giải quyết được gì. Chúng ta cần làm là nâng cao năng lực cá nhân, duy trì personal competitiveness, chờ thời cơ phù hợp — nhảy việc thôi.

**Luôn sẵn sàng. Có kỹ thuật trong tay thì không sợ gì, hôm nào không vui thì nhảy việc thẳng.**

## Học cách "đóng gói" bản thân

Điều này nói thẳng ra là phải biết "nổ". Không nhớ đọc được từ đâu: Able to speak, able to write, good at doing — là ba yêu cầu của workplace people. Able to speak rất quan trọng — có thể nói mới lấy được projects, resources, và tuyển được người. Cùng một việc, người khác nhau có thể nói ra hiệu quả hoàn toàn khác nhau.

Đây là đóng gói sự việc. Đóng gói bản thân cũng vậy — đặc biệt trong các test-type occasions như promotion và interviews. Cần quen thuộc với những từ buzzwords của mỗi internet company: traction point, ecosystem, closed-loop, alignment, tidy up, iterate, owner mindset v.v. Cần làm là ghi nhớ và sử dụng thành thạo.

**Có thể xem nhiều PPT của leader, nghe nhiều upward reports và briefings của boss.**

## Lựa chọn và nỗ lực cái nào quan trọng hơn?

Câu hỏi này còn cần hỏi à — tất nhiên là lựa chọn. Trước một lựa chọn hoàn hảo, nỗ lực không đáng gì. Có một người bạn cấp 3 của tôi nhiều năm không liên lạc, năm nay đã ring the bell ở Times Square... Nhưng những case như vậy quá ít. Chi phí ngẫu nhiên của perfect choice quá cao, uncertainty quá lớn. Với hầu hết graduates, judgment về industry còn chưa chín và nắm bắt personal capability cũng không đủ chính xác — lúc này kéo vài người đi khởi nghiệp rủi ro quá cao. Tôi nghĩ con đường ổn định hơn là: trước tiên gia nhập công ty có quy mô hơi lớn, tìm một good leader, bám một cái đùi vững chắc, nâng cao personal capabilities. Good platform + big legs + personal effort — tốc độ cất cánh đã khá ổn rồi. Sau này tích lũy được một số connections và funds, hiểu sâu về market và needs, có confidence vào bản thân — lúc đó mới cân nhắc việc startup.

## Hậu ký

Định chia sẻ thêm một số câu chuyện về cuộc sống nhưng thấy đã dài rồi, thôi vậy. Những tổng kết và lời khuyên trên bản thân tôi cũng làm chưa tốt lắm, vẫn cần tiếp tục cố gắng. Ngoài ra, một số quan điểm trong đó, do hạn chế về góc nhìn cá nhân cũng không đảm bảo là universal và đúng đắn — có thể làm thêm vài năm những quan điểm này cũng sẽ thay đổi. Hoan nghênh mọi người trao đổi cùng tôi!

Cuối cùng chúc mọi người tìm được công việc ưa thích, vui vẻ làm việc, hạnh phúc cuộc sống, thiên địa rộng lớn, tương lai sáng ngời.

<!-- @include: @article-footer.snippet.md -->
