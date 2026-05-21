---
title: Chiến lược phát triển kỹ thuật của programmer
description: "Chiến lược phát triển kỹ thuật của programmer - Tổng hợp các khái niệm chính, điểm thực hành."
category: Technical Articles Selection
author: BoBoMicroClass
tag:
  - Level-up Strategies
head:
  - - meta
    - name: keywords
      content: technical growth strategy,programmer growth,learning pyramid,deliberate practice,tech giants,career planning,ten-year planning,continuous output
---

> **Lời giới thiệu**: Bài viết của thầy BoBO — viết rất hay. Không chỉ hữu ích cho phát triển kỹ thuật mà còn áp dụng cho các lĩnh vực khác! Khuyến nghị đọc nhiều lần để hình thành chiến lược phát triển kỹ thuật của riêng mình.
>
> **Original article**: <https://mp.weixin.qq.com/s/YrN8T67s801-MRo01lCHXA>

## 1. Lời mở đầu

Trong WeChat tech exchange group của BoBO, học viên thường xuyên hỏi về cách người trong ngành tech học hỏi và phát triển. Dù chỉ là trao đổi qua WeChat, tôi vẫn có thể cảm nhận được sự lo lắng của các bạn.

**Tại sao người trong ngành tech lại lo lắng?** Nói thẳng — là vì thiếu dũng khí và tầm nhìn hẹp. Dũng là dũng khí: người lo lắng thường sợ hãi trước sự bất định của tương lai. Tầm nhìn là kiến thức: người lo lắng thường không thấy rõ thế giới xung quanh, cũng không nhìn rõ bản thân và con đường phù hợp với mình. Tầm nhìn cũng gọi là chí hướng: người dễ lo lắng thường có tầm nhìn hẹp chí hướng nhỏ. Nhìn từ góc độ chiến lược và quản lý — đó là nhận thức về bản thân và thế giới xung quanh không đủ. Không có chiến lược học tập và phát triển rõ ràng lâu dài. Không có kế hoạch giai đoạn có thể thực thi và thực hiện nghiêm túc.

Vì có nhiều học viên hỏi loại câu hỏi này, tôi cảm thấy hơi phiền. Để tránh trả lời lặp đi lặp lại, tôi tổng hợp bài dài này để cùng lúc trả lời loại câu hỏi này. Nếu sau này còn học viên hỏi tương tự, tôi sẽ hướng họ đọc bài này, rồi để họ dùng 3 tháng, 1 năm hoặc thậm chí lâu hơn để suy nghĩ và trả lời câu hỏi: **Chiến lược phát triển kỹ thuật của bạn rốt cuộc là gì?** Nếu bạn suy nghĩ rõ ràng vấn đề này và có câu trả lời cụ thể, chúc mừng — bạn chỉ cần thực hiện từng bước. Hoàn toàn không cần lo lắng. Việc bạn thực hiện mục tiêu chiến lược chỉ là vấn đề thời gian. Nếu không, bạn vẫn cần tiếp tục mài giũa và suy nghĩ để nhất định làm rõ vấn đề quan trọng này trong cuộc đời!

Dưới đây hãy xem một số tech giants trong ngành làm như thế nào.

## 2. Học chiến lược phát triển từ tech giants

Chúng ta biết software design có design patterns. Thực ra sự phát triển của người trong ngành tech cũng có growth patterns. BoBO thường xem lịch sử phát triển sự nghiệp của các tech giants trên LinkedIn để tìm hiểu growth patterns, từ đó gợi cảm hứng xây dựng chiến lược phát triển kỹ thuật của riêng mình.

Tất nhiên, ít có tech giants nào nói rõ chiến lược phát triển kỹ thuật và kế hoạch thực hiện chi tiết hàng năm. Nhưng điều này không ngăn chúng ta tìm hiểu chiến lược phát triển của họ qua lịch sử công việc và các output của họ. Thực ra, **tech giants giỏi hơn thì chiến lược và lộ trình phát triển của họ càng rõ ràng, chúng ta càng dễ tìm ra những success patterns trong đó.**

### 2.1 Case: System Performance Expert

Hầu hết developers trong nước đều nhiệt tình với system performance optimization, một số còn không thể nói hết ba câu mà không nhắc high performance/high concurrency. Nhưng thực sự đi sâu vào lĩnh vực này và đạt trình độ expert thì rất hiếm.

Tech giant tôi muốn giới thiệu đặc biệt là **Brendan Gregg**, tác giả cuốn sách kinh điển về system performance 《System Performance: Enterprise and the Cloud》. Ông cũng là tác giả của [Flame Graph](https://github.com/brendangregg/FlameGraph) — công cụ phân tích performance nổi tiếng.

Brendan Gregg từng là Senior Performance Architect tại Netflix, làm việc ở đó gần 7 năm. Tháng 4/2022, ông rời Netflix và gia nhập Intel với vị trí Fellow.

![](/images/github/javaguide/high-quality-technical-articles/cdb11ce2f1c3a69fd19e922a7f5f59bf.png)

Tổng thể, ông đã deep-dive trong lĩnh vực system performance hơn 10 năm. Ngoài sách, Brendan Gregg còn output hơn 100 technical documents, presentation videos/PPTs liên quan đến system performance, cùng nhiều tool software. Tất cả được chia sẻ gọn gàng trên blog kỹ thuật của ông. Có thể nói ông là một tech giant cực kỳ productive.

Hình trên từ cuốn mới của Brendan Gregg. Từ đó có thể thấy mức độ nắm vững lĩnh vực system performance — đã đào sâu đến từng góc của hardware, OS và applications. 360 độ không có điểm mù. Toàn bộ computer system với ông gần như transparent.

### 2.2 Case: From Open Source to Enterprise

Tech giant thứ hai tôi muốn chia sẻ là **Jay Kreps**, người sáng lập/architect của Kafka và là co-founder và CEO của Confluent — công ty phát triển enterprise products and services xung quanh Kafka.

Jay Kreps từng làm tại LinkedIn hơn 7 năm (2007.6 ~ 2014.9), từ Senior Engineer, Engineering Manager đến Principal Staff Engineer. Kafka được khởi động khoảng năm 2010, giải quyết big data collection, storage và consumption problems của LinkedIn. Ông và team chuyên tâm mài giũa Kafka, open source (đầu năm 2011) và xây dựng community ecosystem.

Đến cuối 2014, Kafka đã rất thành công trong community với user base lớn. Jay Kreps và các early authors rời LinkedIn để thành lập Confluent, bắt đầu con đường enterprise services cho Kafka. Năm 2020, Confluent nhận được Series E funding 250 triệu USD với valuation 4.5 tỷ USD. Từ khi Kafka ra đời đến nay, Jay Kreps đã đầu tư vào sản phẩm và công ty này suốt 10 năm.

Lý do Kafka và Jay Kreps để lại ấn tượng sâu sắc với tôi là vào nửa cuối 2012, tôi cũng đang làm big data collection tại Ctrip framework team. Lúc đó có hơn 4 loại open source products tương tự: Facebook Scribe, Apache Chukwa, Apache Flume và Apache Kafka. Nhìn lại, chỉ có Kafka phát triển tốt nhất đến nay — điều này không tách khỏi sự chuyên tâm và đầu tư liên tục của founder, và cũng liên quan đến tầm nhìn kỹ thuật lớn của các founders.

Hồi đó tôi gần như không có khái niệm về strategic thinking. Làm được nửa năm data collection xong lại quay sang làm projects "thú vị hơn". Jay Kreps và Kafka đã dạy tôi một bài học sống động về tech strategy và practice.

### 2.3 Case: Tech Media Influencer

Một số bạn có thể phản bác: "BoBO, những tech giants bạn nói đến đều có học vị tốt, nền tảng vững, xuất phát điểm cao nên họ mới thành công hơn." Thực ra không hẳn. Đây là một tech media influencer tên **Brad Traversy**. Xem LinkedIn của ông — background rất bình thường: học ở một community college không chính quy (tương đương cao đẳng), không có big company work experience, công việc chủ yếu là website outsourcing.

Nhưng! Brad Traversy hiện là một influencer lớn trong lĩnh vực tech media. YouTube channel của ông có hơn 1.38 triệu subscribers. Trong 10 năm, output hơn 800 Web development và programming tutorial videos. Ông cũng là successful instructor trên Udemy với 19 courses và gần 420,000 students.

Brad Traversy hiện là freelancer với YouTube ad + Udemy course income rất tốt.

Khó mà tưởng tượng, khi còn trẻ, ông bị gán nhãn: delinquent, alcoholism, smoking, drug use, tattoos, prison time... Mãi đến khi đứa con đầu lòng ra đời, ông mới bắt đầu có trách nhiệm và thay đổi. Với niềm đam mê kỹ thuật, ông bắt đầu liên tục output free courses trên YouTube. Từ đó ông tìm thấy strategic goal phù hợp với mình và cuộc sống bắt đầu có những thay đổi tích cực...

Tôi duyệt qua tất cả videos của Brad Traversy: 10 năm tổng output 800+ videos, trung bình mỗi năm 80+. Video đầu tiên được upload tháng 8/2010. Vài năm đầu hầu như không có subscribers. Tháng 1/2017 subscribers mới đạt 50k — sau khoảng 6 năm. Tháng 10/2017 tăng vọt lên 200k, tháng 3/2018 đạt 300k. Tháng 1/2021 đạt 1.38 triệu. Từ 2017 trở đi, sau 6-7 năm tích lũy, subscriber curve bắt đầu có inflection point. **Nếu vẽ data này thành biểu đồ, sẽ là một đường compound growth rất đẹp.**

### 2.4 Tổng kết cases

Brendan Gregg, Jay Kreps và Brad Traversy đi theo các tech paths khác nhau, nhưng thành công của họ có điểm chung:

**1. Tìm thấy long-term strategic goal phù hợp với bản thân.**

- Brendan Gregg: Trở thành top expert trong lĩnh vực system performance
- Jay Kreps: Xây dựng enterprise services company dựa trên Kafka open source message queue, IPO
- Brad Traversy: Trở thành tech media influencer và course instructor như nghề nghiệp

**2. Chuyên tâm deep-dive vào một (hoặc vài niche liên quan), giữ vững định lực, không tùy tiện chuyển lĩnh vực.**

**3. Đầu tư dài hạn — cả ba đều liên tục đầu tư 10 năm.**

**4. Kế hoạch năm + persistent & measurable value output.**

**5. Begin with the End in Mind là sự khác biệt lớn giữa người xuất sắc và người bình thường.**

Người bình thường thường đi từng bước, hiếm khi lập kế hoạch xa. Người giỏi thường có mục tiêu to lớn trước, rồi dùng backward reasoning để chia nhỏ thành kế hoạch thực hiện chi tiết hàng năm/tháng/tuần.

Từ những tổng kết trên, điểm quan trọng là: sự phát triển của những tech giants này đều được thúc đẩy bởi **Persistent Valuable Output**. Tại sao continuous output lại quan trọng đến vậy? Điều này phải nói đến Learning Pyramid.

## 3. Learning Pyramid và Deliberate Practice

![Learning Pyramid](/images/github/javaguide/high-quality-technical-articles/format,png-20230309231836811.png)

Learning Pyramid là nghiên cứu của National Training Laboratories ở Maine, Mỹ:

> 1. Sau khi nghe giảng trên lớp, average retention rate của kiến thức chỉ khoảng 5%.
> 2. Average retention rate của đọc sách chỉ khoảng 10%.
> 3. Học với audiovisual materials, retention rate khoảng 20%.
> 4. Sau khi teacher demo bằng thực hành, retention rate khoảng 30%.
> 5. Small group discussion (đặc biệt debate), retention rate có thể đạt 50%.
> 6. Sau khi thực sự áp dụng những gì đã học vào practice, retention rate có thể đạt 75%.
> 7. Sau khi practice, sắp xếp lại những gì đã học rồi dạy lại cho người khác, retention rate có thể đạt 90%.

7 learning methods trên: 4 đầu là **passive learning**, 3 sau là **active learning**.

Dùng learning swimming làm ví dụ: passive learning giống như xem người khác bơi, active learning là tự bạn xuống nước bơi. Bơi hoặc chạy đốt calories trong cơ thể thì mới có hiệu quả tập luyện và xây dựng cơ bắp. Nếu chỉ xem người khác bơi mà không bơi thực sự, bạn sẽ không phát triển cơ bắp. Tương tự, active learning cũng đốt brain calories để train brain và develop brain "muscles".

Đốt body calories thường khiến người ta không thoải mái. Tương tự, đốt brain calories cũng gây cảm giác không thoải mái, căng thẳng. BoBO luôn tin rằng, **body constitution và capability của người với người về cơ bản đều giống nhau, nhưng các khác biệt sau này là do chất lượng, tần suất và cường độ training của body và brain.**

Hiểu điều này, những người trưởng thành và tự kỷ luật sẽ liên tục **deliberately practice**. Deliberate practice bao gồm physical training (BoBO hiện chạy bộ 3km/ngày, đi bộ 3km/ngày, 60 crunches/ngày, 5-minute plank v.v.) và brain training (viết code mỗi ngày, trung bình output video 10 phút free trên Bilibili, tổng kết output WeChat articles định kỳ).

Về nguyên lý và methodology của deliberate practice, khuyến nghị đọc sách 《Deliberate Practice》.

Giờ nhìn lại Brendan Gregg, Jay Kreps và Brad Traversy — sự học hỏi và phát triển của họ đều dựa trên continuous valuable output. Những output đó là results of deliberate practice. Họ output theo cách học ở tầng 5-7 của Learning Pyramid — active và efficient learning. Và output của họ có customer value, có users, có feedback và metrics. Nhớ: learning có feedback và measurement là closed-loop learning — có thể liên tục cải thiện.

## 4. Sự ra đời của Strategic Thinking

![Thinking cycle and opportunity points](/images/p3-juejin/dc87167f53b243d49f9f4e8c7fe530a1~tplv-k3u1fbpfcp-zoom-1.png)

Khi graduates mới vào công ty, thinking thường theo đơn vị ngày/tuần/tháng. Cơ bản là hôm nay học công nghệ gì, ngày mai học ngôn ngữ gì. Ít khi nghĩ đến mục tiêu một năm hay dài hơn.

Sau 3 năm làm việc, những người có sự ngộ thường bắt đầu thinking theo chu kỳ một năm, lập và thực hiện một số annual plans.

Sau 5 năm làm việc, một số người có sự ngộ sẽ phát triển được tầm nhìn và dũng khí nhất định. Họ lập kế hoạch theo chu kỳ 3-5 năm và bắt đầu chủ động layout để capture medium opportunities.

Sau 10 năm làm việc, người có high awareness sẽ thấy patterns và rule changes — như industry development patterns và talent growth patterns. Từ đó strategic thinking bắt đầu hình thành. Họ sẽ lập và thực hiện strategic plans theo chu kỳ 5-10 năm. Brendan Gregg, Jay Kreps và Brad Traversy đều ở giai đoạn này.

## 5. Lời khuyên

**1. Layout và plan chiến lược của bạn theo chu kỳ 5-10 năm.**

Graduates hiện nay ra trường khoảng 22-23 tuổi. Sau 10 năm làm việc, khoảng 32-33 tuổi, bạn đã "nhìn" được 10 năm và nên có hiểu biết sâu về bản thân và thế giới xung quanh. **Nếu đến tuổi này vẫn ngơ ngác, hôm nay grab này mai grab kia, thì dũng khí và tầm nhìn của bạn thực sự rất hạn chế.** Trong lúc IT industry cạnh tranh khốc liệt này, bị layoff ở tuổi 35 có thể đang đến.

Với strategic thinking, bạn nên layout theo chu kỳ 5-10 năm. Như Brendan Gregg, Jay Kreps và Brad Traversy — **nếu muốn thực sự đạt được thành tựu trong cuộc đời, thời gian đầu tư thường phải là 10 năm.**

**2. Tập trung energy của bạn.**

Xét đến việc thời gian trong cuộc đời để làm sự nghiệp chỉ có 2-3 decades, bạn sẽ thấy cuộc đời thực ra rất ngắn. Lúc đó bạn sẽ đổ toàn bộ energy vào thực hiện ten-year strategy, không còn thời gian lãng phí vào những thứ như chat vô bổ online.

**3. Detailed implementation plans đặc biệt là output plans.**

Có ten-year strategic direction, bước tiếp theo là detailed implementation plans hàng năm, đặc biệt là output plans. Những plans này chủ yếu nên operate ở layers 5/6/7 của Learning Pyramid. **Output nên là result of deliberate practice — mỗi ngày giữ body và brain đốt một lượng calories nhất định.**

**4. Output valuable things để tạo positive feedback.**

Output nên có customer value — bản thân học được (self-growth), người khác cũng có ích (social growth progress). Như vậy có được user feedback và metrics, tạo closed loop, liên tục cải thiện learning.

**5. Less is more.**

Deep-dive vào một (hoặc vài liên quan) fields. Tất cả detailed plans nên xoay quanh strategy. Kiềm chế inner desires, đừng tham lam và phân tâm.

**6. Viết ra strategic direction và detailed plans, review và optimize định kỳ.**

**7. Có định lực, liên tục nỗ lực.**

Strategy implementation không bao giờ thẳng tắp. Strategic direction và detailed plans thường cần điều chỉnh theo nhu cầu, đặc biệt ở giai đoạn đầu, nhưng cuối cùng phải converge. Nếu liên tục thay đổi mà không converge, đó là thiếu strategic conviction — một vấn đề lớn cần suy nghĩ và giải quyết.

Growth strategy của người khác có thể tham khảo, nhưng đừng cố bắt chước. Bạn có màu sắc riêng. **Bạn nên trở thành một bản thể duy nhất.**

**8. Chậm mà chắc.**

Thực hiện strategic goals cũng như trồng cây — cần thời gian và sự kiên nhẫn. Nhớ rằng **chậm mà chắc.** Khi lo lắng, hãy lặng nhắc lời dạy của Wang Yangming trong 《Truyền Tập Lục》:

> 立志用功，如种树然。方其根芽，犹未有干；及其有干，尚未有枝；枝而后叶，叶而后花实。初种根时，只管栽培灌溉。勿作枝想，勿作花想，勿作实想。悬想何益？但不忘栽培之功，怕没有枝叶花实？

Dịch nghĩa:

> Thực hiện strategic goal như trồng cây. Lúc đầu chỉ là một mầm nhỏ, cây chưa mọc; cây mọc rồi mới từ từ có cành; có cành mới ra hoa kết quả. Lúc mới trồng, chỉ lo tưới bón, đừng lo khi nào mọc cành, khi nào nở hoa, khi nào có quả. Lo lắng có ích gì? Chỉ cần kiên trì tưới bón, sao lại sợ không có cành hoa quả?

<!-- @include: @article-footer.snippet.md -->
