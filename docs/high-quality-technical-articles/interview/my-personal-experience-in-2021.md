---
title: Kinh nghiệm cá nhân vào Feishu qua campus recruitment
description: "Kinh nghiệm cá nhân vào Feishu qua campus recruitment - Tổng hợp các khái niệm chính, điểm thực hành."
category: Technical Articles Selection
author: Yuesezhenmei
tag:
  - Interview
head:
  - - meta
    - name: keywords
      content: ByteDance interview,Feishu campus recruitment,C++ interview,spring internship,daily internship,summer internship,interview tips,algorithm practice
---

> **Lời giới thiệu**: Tác giả bài viết này cuối cùng vào Feishu làm developer qua campus recruitment. Trong bài này, anh ấy chia sẻ kinh nghiệm campus recruitment và những gì học được.
>
> **Original article**: <https://www.ihewro.com/archives/1217/>

## Background

Tôi chủ yếu theo hướng C++ backend development.

Spring 2021 vào ByteDance Feishu client. Trước khi vào ByteDance đã có Baidu offer (audio/video livestreaming) và Tencent PCG (Weishi, backend development) HR interview pass (chưa nhận letter of intent).

## Quá trình spring recruitment không thuận lợi

### Spring recruitment khá không thuận với tôi

Lab chính thức được nghỉ về nhà vào ngày 1/1. Nhưng về nhà vẫn tiếp tục "remote work" — công việc không giảm. Mỗi ngày test và debug "streaming conference system" chúng tôi phát triển.

Ngày kế cuối tháng 1, chúng tôi họp online "year-end summary". Từ đó, là master year 2, về cơ bản chia tay công việc với lab. Chính thức bước vào giai đoạn ôn tập spring recruitment.

Trước tháng 2, đã bắt đầu ôn cách quãng — không gì ngoài làm problems trên LeetCode, nhưng một ngày chỉ làm được vài bài, sau này còn chỉ làm daily problem theo kiểu tượng trưng. Giúp ích rất ít cho algorithm.

Đầu tháng 2, LeetCode mới làm được khoảng 40 bài. Dành mấy tuần update version 8.x của theme handsome — lại bận thêm mấy tuần. Đến mùng 1 Tết mới chính thức release, sau Tết lại tiếp tục dành thời gian fix bugs và release fix versions. Tháng 2 cứ thế trôi qua.

### Quá trình tìm thực tập

**Đầu tháng 3/2021**

Đầu tháng 3, nộp Alibaba early batch. Không ngờ Alibaba early batch đóng ngay 4/3, hôm đó cuộc gọi round 1 đã hẹn cũng bị hủy. Ngay sau đó khi lab họp sync progress, mới biết mọi người đã ở round 1/2/3 trong khi tôi chưa có gì cả.

**2021-3-8**

Nộp ByteDance Feishu.

**Đầu tháng 4/2021**

ByteDance round 1 lần đầu, Tencent round 1 lần đầu.

**Giữa tháng 4/2021**

Meituan round 1 và 2, Tencent round 1 lần 2 và round 2, Baidu 3 vòng — đều pass.

**Cuối tháng 4/2021**

Tencent round 1 lần 3 và ByteDance round 1 lần 2.

**Đầu tháng 5/2021**

Tencent round 2 lần 3 và ByteDance round 2 lần 2 — cả hai đều pass.

#### Alibaba

Lần đầu nộp DingTalk. Không ngờ bị từ chối ở resume screening vì aptitude test kém.

Lần hai là backend interview cho Alimama. Round 1 phone interview — tôi cảm thấy ổn, bài cuối cũng làm được. Phần Q&A cuối hỏi có góp ý gì cho phỏng vấn không. Interviewer nói apply Alibaba tốt nhất là dùng Java... Sau khi phone kết thúc liền bị từ chối.

Lúc đó tâm trạng khá sụp. Buổi phỏng vấn lúc 7:30 tối, đọc sách cả chiều không kịp ăn tối...

Vậy là spring recruitment không có duyên với Alibaba.

#### Meituan

Round 1 của Meituan — interviewer rất tốt bụng, rất thoải mái. Vì là Java vị trí, không hỏi C++ knowledge. Chủ yếu hỏi basic knowledge, nửa sau 30 phút hỏi non-technical như programmer yêu thích nhất là ai, cách viết elegant code, recommend tech books. Tôi nói Wang Yin là programmer tôi khá thích, interviewer cười và nói anh ấy cũng thích. Bầu không khí phỏng vấn rất tốt.

Round 2 suốt buổi chỉ hỏi một project trên resume, khoảng 90 phút. Cảm giác ngay từ đầu interviewer không muốn tuyển tôi mấy — lý do lớn chắc là tôi C++, chuyển Java có thể tốn chi phí đào tạo. Cuối cùng hỏi HR kết quả là "pending". Vài ngày sau bị từ chối.

#### Baidu

Baidu tổng cộng 3 vòng, cùng một buổi chiều — rất căng. Round 1 hỏi các basic C++ questions cơ bản, viết một bài nói thought process mà không cần run.

Round 2 cũng là basic. Bài 1 merge two sorted arrays, bài 2 write merge sort. Kết quả không đúng, đổi bài khác: tree BFS. Round 2 interviewer hỏi cuối cảm giác phỏng vấn hôm nay thế nào. Tôi nói mặc dù một bài kết quả không đúng nhưng logic đúng, có thể có lỗi nhỏ đâu đó. Round 2 pass.

Round 3 ít câu hỏi kỹ thuật hơn, khoảng 30 phút, không viết code, hỏi basic information và basic knowledge. Cuối hỏi phòng ban đang làm gì. Interviewer nói HR sẽ liên hệ sau.

#### ByteDance Feishu

Lần đầu round 1 fail — vì câu trả lời bài thi code không đúng.

Lần hai round 1 cuối tháng 4 — diễn ra suôn sẻ. Round 2 sau kỳ nghỉ Lao Động. Senior interviewer nhắn nhủ hãy đọc về smart pointers. Round 2 hỏi tôi viết shared_ptr — trước đó có đọc implementation nhưng chưa tự viết. Code của tôi không đủ hoàn chỉnh. Leader liên tục nhắc cần sửa ở đâu.

Lúc đó tôi nghĩ mình fail. Giữa tháng 5 đã chuẩn bị gia nhập Baidu thì được thông báo pass. Vậy là quyết định đi ByteDance.

#### Cảm ngộ

Qua nhiều lần phỏng vấn, điều tôi thấm thía nhất là bài coding trong phỏng vấn thực sự rất quan trọng. Vì basic knowledge của tôi cũng không nổi bật, lại thêm nếu algorithm problems (thường 1-2 bài) không làm được — về cơ bản là fail. Còn coding test trước phỏng vấn không quá khó — thường làm được 1-2/4 bài là có cơ hội phỏng vấn. Độ khó chỉ khoảng LeetCode top 100 level.

Khi làm bài trong phỏng vấn, tôi rất dễ bị căng thẳng, đầu óc dễ trống rỗng. Sơ ý viết sai ký tự hay sai assignment trong linked list rất khó phát hiện, dẫn đến kết quả cuối không đúng.

## Vào ByteDance Internship

Trước khi vào tôi nghĩ đây là position phù hợp nhất với mình vì tôi chủ yếu C++ và Feishu dùng C++ khá nhiều. Vào rồi mới thấy mình có thể không thích làm client-side — có vẻ phức tạp... Có lẽ server-side sẽ tốt hơn, nhưng hiện tôi vẫn chưa chắc.

ByteDance internship benefits so với các công ty này khá tốt. Nhược điểm nhỏ là workstation khá hẹp và workload lớn hơn các công ty internet khác. Canteen của ByteDance miễn phí và khá ngon. Có nhiều office buildings, tôi ở một nơi khá nhỏ.

Hiện tại, cần relaxed hơn. Đọc codebase từng bước. Mentor bảo không cần vội, cứ có gì hỏi, đừng kìm lại vì tốn thời gian. Sau khi nhận full-time offer, fall recruitment vẫn muốn thử thêm foreign companies hoặc state-owned enterprises. Work intensity hiện tại khó thích nghi.

## Chia sẻ kinh nghiệm tìm việc

### Một số khái niệm

#### Sự khác biệt giữa daily internship và formal (summer) internship

- **Daily internship**: Nếu một team thiếu người, rất có thể tuyển intern quanh năm. Miễn là đang là sinh viên đều có thể phỏng vấn. Còn formal internship có thời gian bắt đầu cố định hơn, ví dụ 3-6 tháng mỗi năm (summer internship).
- Daily internship dễ vào hơn tương đối, nhưng một số daily internships không có conversion slots. Cần confirm trước.
- **Tại ByteDance, daily internship và formal internship không có gì khác nhau về conversion — cả hai apply conversion cùng nhau.**

#### Sau khi nhận summer internship offer, khi nào có thể bắt đầu internship?

Sau khi nhận offer, **có thể internship ngay lập tức** (thường cần quy trình khoảng 1 tuần), **cũng có thể chọn bắt đầu muộn hơn** — tự quản lý thời gian. Một số công ty cho chọn ngày trên hệ thống, một số thì communicate trực tiếp với HR.

#### Sự khác biệt giữa early batch và regular batch

Lấy ví dụ tìm internship:

- Early batch trước, regular batch sau. Early batch thường là team trực tiếp tuyển **không vào system**, **không có written test**, **process nhanh hơn** — round 1 pass thường sớm có round 2.
- Regular batch có interview evaluations. Failed interview evaluation from a previous attempt can affect the next. So be careful.

#### Sự khác biệt giữa internship offer và full-time offer

Đơn giản: Internship offer chỉ cho cơ hội internship. Nếu perform tốt có thể convert thành full-time và nhận full-time offer.

Sau khi sign full-time offer không có nghĩa là đi làm ngay, vì chúng ta vẫn là students. Có thể tiếp tục internship (lương là % của full-time salary), hoặc take leave và đến chính thức sau khi tốt nghiệp.

### Timeline

> Làm resume sớm nhất có thể — tốt nhất là ngay bây giờ, vì bạn vẫn còn nhớ rõ lab projects. Viết bây giờ không khó. Vài tháng sau ngồi viết resume sẽ rất đau.

Ví dụ về năm ngoái:

- Giữa tháng 2, Alibaba early batch bắt đầu (cơ bản chỉ có Alibaba mở early batch lúc này), 8/3 Alibaba early batch kết thúc. Tencent early batch bắt đầu vào tháng 3, kết thúc 15/4.
- Tháng 3-5 nhận internship offers. Tốt nhất là tháng 4 đã có internship offer từ công ty mình muốn.
- Tháng 4-8 internship. Đầu tháng 7 fall recruitment early batch. Cuối tháng 7 hoặc đầu tháng 8 là fall recruitment regular batch. Cuối tháng 9, fall recruitment giảm đi nhiều nhưng vẫn còn cơ hội.
- Cuối tháng 10, fall recruitment cơ bản kết thúc. Sau đó vẫn có supplementary rounds.

---

- **Cách tìm internship**: Cá nhân nghĩ tìm người quen referral là tốt nhất. Lợi ích ngoài track progress còn có thể bypass đến team trực tiếp — tránh được một số "pit" teams và biết trước team đang làm gì.
- **Internship rất quan trọng. Tốt nhất là ngay trong lúc internship đã tìm được công ty muốn đến — fall recruitment sẽ nhàn hơn nhiều.** Vì internship conversion cơ bản không có vấn đề. Hơn nữa conversion offer thường tốt hơn fall recruitment offer. Nhiều người quanh tôi full-time offer đến từ internship conversion.
- **Kiểm soát thời gian internship** — vừa internship vừa chuẩn bị fall recruitment rất vất vả. Workload trong khi internship cũng khá lớn, ít thời gian làm problems.

### Chuẩn bị phỏng vấn

#### Project experience

Tôi nghĩ lab projects của chúng tôi không có vấn đề gì. Điều quan trọng là cách trình bày.

- **Project introduction**

Đầu tiên có thể yêu cầu giới thiệu project là gì và **tại sao làm project này**.

- **Project results**

Tiếp theo có thể hỏi một số số liệu kết quả cuối cùng — như conference system hỗ trợ tối đa bao nhiêu người cùng lúc, hay trải nghiệm quantified như fluency.

- **Challenges in the project**

Cuối cùng sẽ hỏi có gặp khó khăn hay thách thức nào không và giải quyết như thế nào. Phần này chủ yếu kiểm tra technical highlights của project.

> Khó khăn là gì? Cá nhân tôi thấy chủ yếu là vấn đề mất vài ngày mới giải quyết được.

Hai ví dụ:

**Ví dụ 1: Debug** — ví dụ một memory leak problem mất một tuần mới tìm ra. Đó là khó khăn. Quá trình giải quyết là **cách locate vấn đề** — như tìm kiếm tài liệu liên quan, từ đó tìm **keywords** như một số tools, rồi dùng tool đó.

**Ví dụ 2: Requirements design** — để implement một requirement có thể có nhiều feasible design approaches. Quá trình giải quyết là **lý do chọn approach cuối cùng và suy nghĩ về ưu nhược điểm của các approaches khác**.

Người ta nói giải pháp là search Baidu — thực ra cũng bắt đầu bằng search error hoặc issue, nhưng không phải ngay lập tức tìm được code answer. Thay vào đó tìm một answer có keyword nào đó, rồi tiếp tục tìm keyword đó để lấy thêm thông tin.

#### Written test

Written test cho internship không quá khó. Nếu 4 problems, làm được 1-2 bài là đủ cơ hội phỏng vấn.

Algorithm problems là chủ đề muôn thuở — LeetCode Top 100. Lúc đầu rất đau. Khi đã làm 40 bài thì bắt đầu có cảm giác. Khuyến nghị bắt đầu từ linked list, binary tree. Array problems có nhiều tricks không general.

- **Nhất định phải luyện bằng whiteboard** — không chỉ để nhớ API. Quan trọng hơn là sau khi quen với whiteboard, viết code sẽ thành thục hơn và suy nghĩ độc lập hơn, không phụ thuộc.
- Algorithm problems: trọng tâm không phải là hard problems, mà là easy, medium, common, high-frequency problems phải fluent như phản xạ tự nhiên.
- Trong coding test phỏng vấn, nếu gặp vấn đề, **nhất định ngay lập tức xin dùng local IDE để debug**, nếu không có thể mất rất nhiều thời gian mà không tìm ra vấn đề.

#### Interview

Mỗi phỏng vấn thường 1 giờ, chia làm hai phần. Nửa đầu hỏi basic knowledge hoặc project experience. Nửa sau làm bài code.

**Basic knowledge review không nhất thiết phải ôn có hệ thống ngay từ đầu. Trước tiên đảm bảo high-frequency questions là biết hết** — ví dụ mấy câu network và OS nhất định bị hỏi. Đọc nhiều interview notes là tìm được câu hỏi thường gặp. Với câu hỏi khá hiếm, trả lời không được cũng không ảnh hưởng quyết định.

- **Đọc nhiều interview notes!!!** Đừng chỉ cắm đầu tự học. Phải xem người khác đã bị hỏi những gì.
- Với internship, **các câu hỏi common thì PHẢI TOÀN DIỆN!!!!** Không cần quá sâu nhưng nhất định phải đủ toàn diện!
- **Với những gì mình biết, nói nhiều nhất có thể!!** Thực sự không biết thì lái sang chỗ mình biết!! Tóm lại là guide interviewer về phía mình giỏi.
- Coding trong phỏng vấn khác với written test trước đó. Không quá khó nhưng kiểm tra bình tĩnh suy nghĩ, code elegant, không có bugs. Suy nghĩ rõ trước khi viết!!
- Khi mô tả technical challenges của project, đừng nói documentation research là khó khăn. Câu trả lời nên là technical challenges — rốt cuộc dùng công nghệ gì để giải quyết. Phần này để interviewer hỏi sâu hơn và từ đó đánh giá technical capability của bạn.

<!-- @include: @article-footer.snippet.md -->
