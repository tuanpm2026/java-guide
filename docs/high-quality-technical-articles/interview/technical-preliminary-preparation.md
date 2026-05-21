---
title: Cách chuẩn bị phỏng vấn kỹ thuật từ góc nhìn interviewer và ứng viên
description: "Cách chuẩn bị phỏng vấn kỹ thuật từ góc nhìn interviewer và ứng viên - Tổng hợp các khái niệm chính, điểm thực hành giúp bạn học hiệu quả."
category: Technical Articles Selection
author: Qinshuiyu
tag:
  - Interview
head:
  - - meta
    - name: keywords
      content: technical interview preparation,interviewer perspective,candidate perspective,technical basics,business evaluation,interview tips,technical depth and breadth,interview methodology
---

> **Lời giới thiệu**: Thảo luận technical interview từ hai góc độ là interviewer và ứng viên! Rất hay!
>
> **Content overview:**
>
> - Phải đánh giá qua technical basics mới có thể kiểm tra thực lực kỹ thuật thực sự của ứng viên: technical depth và breadth.
> - Kết hợp practice với theory. Ví dụ sau khi ứng viên mô tả JVM memory model layout, có thể tiếp tục hỏi: Có những nguyên nhân nào có thể dẫn đến OOM? Có những biện pháp phòng ngừa nào? Bạn đã từng gặp vấn đề memory leak chưa? Làm thế nào để troubleshoot và giải quyết loại vấn đề này?
> - Không nên đánh giá quá 2 project experiences. Vì để đánh giá sâu chi tiết một project chiếm khá nhiều thời gian. Thông thường sẽ để ứng viên chọn một project họ thấy có thu hoạch nhất/thách thức nhất/ấn tượng nhất/bản thân thấy thú vị nhất. Rồi đặt câu hỏi xoay quanh project đó. Thường bắt đầu từ project background, đánh giá hiểu biết tổng thể về tech stack, project modules và interactions, challenging tech problems và solutions trong project, troubleshooting, code maintainability, engineering quality assurance v.v.
> - Hỏi nhiều nói ít, để ứng viên thể hiện nhiều hơn. Dẫn dắt hoặc đào sâu hoặc mở rộng ngang dựa trên câu trả lời của ứng viên.
>
> **Original article**: <https://www.cnblogs.com/lovesqcc/p/15169365.html>

## Mục tiêu và approach đánh giá

Trước tiên clarify mục tiêu đánh giá của technical interview:

- Technical basics của ứng viên;
- Tư duy và khả năng giải quyết vấn đề của ứng viên.

Technical basics là nền tảng (thứ dưới tảng băng), chiếm 7 phần. Problem-solving thinking và capabilities là execution (phần lộ ra trên tảng băng), chiếm 3 phần. Business và technical basics evaluation — 3-7 split.

## Technical Basics Evaluation

### Tại sao phải đánh giá technical basics?

Hai loại technical thinking capabilities quan trọng nhất của programmer là logical thinking ability và abstract design ability. Logical thinking là nền tảng, abstract design là cấp độ cao. Đánh giá technical basics có thể đồng thời đánh giá cả hai thinking capabilities này. Có thể hiểu basic technical concepts và connections — đánh giá logical thinking ability; có thể abstract business problems thành technical problems và organize mapping hợp lý — đánh giá abstract design ability.

Phần lớn business problems đều có thể được abstract thành technical problems. Theo một nghĩa nào đó, business problems chỉ là domain-specific expression của technical problems.

Vì vậy, **đánh giá qua technical basics mới có thể kiểm tra thực lực kỹ thuật thực sự của ứng viên: technical depth và breadth.**

### Technical basics được đánh giá như thế nào?

Thông qua các effective multi-angle questioning patterns để đánh giá.

#### What-Why

"What" đánh giá basic understanding của concepts, "Why" đánh giá implementation principles của concepts.

Ví dụ: Index là gì? Index được implement như thế nào?

#### Guiding-Horizontal-Deep questions

Guiding, ví dụ "Bạn có quen với Java sync tools không?" — thử xem. Sau khi được xác nhận, có thể hỏi thêm: "Bạn quen với những sync tool classes nào?" — để hiểu breadth của ứng viên.

Sau khi nhận câu trả lời, có thể hỏi tiếp: "Nói về implementation principles của `ConcurrentHashMap` hoặc `AQS`?"

Một người có thể giải thích tech principles rõ ràng đến mức nào, bao gồm cả thinking và details, cho thấy họ nắm vững kỹ thuật mạnh đến mức nào.

#### Jump/Cross questions

Ví dụ: Khi nói về hash efficient search, có thể discuss consistent hashing algorithm. Hai cái vừa có liên quan vừa có nhiều điểm khác biệt. Cũng là cách đánh giá technical breadth.

#### Summary questions

Ví dụ: Trong khi làm XXX, bạn đã thu hoạch được những kinh nghiệm nào có thể chia sẻ? Đánh giá khả năng induction và summarization của ứng viên.

#### Practice combined with theory

Ví dụ, sau khi ứng viên mô tả JVM memory model layout, có thể hỏi tiếp: Có những nguyên nhân nào có thể dẫn đến OOM? Có những biện pháp phòng ngừa nào? Bạn đã từng gặp memory leak chưa? Làm thế nào để troubleshoot và giải quyết?

Ví dụ, ứng viên đề cập SQL optimization và index optimization, thì nhân tiện hỏi về implementation principles của indexes, cách xây dựng optimal indexes.

Ví dụ khác, ứng viên đề cập transactions, nhân tiện hỏi về transaction implementation principles, isolation levels, snapshot implementation v.v.

#### Familiar and unfamiliar combined

Với những phần ứng viên ghi là familiar trên resume và những phần chưa ghi đều hỏi. Ví dụ ứng viên ghi trên resume: familiar with JVM memory model — thì đánh giá memory management-related (familiar part) và Java concurrent tools (uncertain part).

#### Dead knowledge with live knowledge combined

Ví dụ: Search algorithms có những gì? Sequential search, binary search, hash search. Mọi người thường có thể nói ra, đây là "dead knowledge".

Các search algorithms này mỗi cái phù hợp với scenario nào? Trong công việc của bạn, có những scenarios nào dùng đến những search algorithms nào? Tại sao? Đây là "live knowledge".

#### Problems encountered in learning or work

Đôi khi, problems gặp phải trong học tập và công việc cũng có thể làm thành interview questions.

Ví dụ, gần đây đang học phần concurrency trong 《Operating Systems: Three Easy Pieces》. Có một chương là làm thế nào để làm data structures thread-safe. Đây có một số chỗ có thể hỏi: Làm thế nào để implement một lock? Làm thế nào để implement một thread-safe counter? Làm thế nào để implement thread-safe linked list? Thread-safe Map? Làm thế nào để improve concurrency performance?

Problems gặp trong công việc cũng có thể được abstract và extracted thành technical basics interview questions.

#### Tech stack fit questions

Nếu ứng viên (như viết trên resume) sử dụng một số technologies phù hợp với tech stack của công ty, có thể deep-dive vào những tech points đó, đánh giá mức độ nắm vững. Nếu nắm vững tốt, tech fit degree tương đối cao hơn.

Tất nhiên, điều này không thể là basis để loại những ứng viên không dùng tech stack đó. Ví dụ công ty dùng MongoDB và MySQL, nhưng một ứng viên chưa dùng MongoDB nhưng đã dùng MySQL, Redis, ES, HBase và nhiều storage systems khác. Thì tech fit không kém ứng viên chỉ dùng MySQL và MongoDB — vì tech breadth của người đó rộng hơn, có thể suy ra họ có đủ năng lực nắm Mongodb.

#### Build personalized interview question bank

Mỗi technical interviewer sẽ có một question bank. Liên tục tích lũy, gặp câu hỏi đột nhiên nghĩ đến thì ghi lại ngay.

## Business Dimension Evaluation

### Tại sao phải đánh giá business dimension?

Technical basics evaluation dễ bỏ sót là non-technical capability traits của ứng viên, ví dụ communication và organization ability, project management ability, stress resistance, practical problem-solving ability, team influence, other personality traits v.v.

### Tại sao không chỉ đánh giá business dimension?

Vì business thường quen thuộc hơn, có thể nói thẳng theo phương án hiện tại, rất khó đánh giá được deep understanding, lateral expansion và summarization ability của ứng viên.

Về điểm này, khuyến nghị đánh giá có mục tiêu về summarization ability của ứng viên: ví dụ trong quá trình build, develop, maintain microservices hoặc ensure system stability/performance, bạn đã thu hoạch được những kinh nghiệm nào có thể chia sẻ?

## Problem-Solving Ability Evaluation

Chỉ technical basics thôi chưa đủ. Thường tốt nhất là kết hợp với business thực tế, dựa trên business trong project của ứng viên, abstract thành technical problems để đánh giá.

Problem-solving thinking nhấn mạnh layered progression. Điều này đặt ra yêu cầu khá cao với interviewer — cần có cả good listening ability, technical depth và business experience. Trước tiên phải lắng nghe kỹ trình bày của ứng viên, tìm entry point kỹ thuật phù hợp, rồi đặt câu hỏi. Nếu vào không được, đánh giá dễ thất bại.

### Design questions

- Ví dụ nhiều machines chia sẻ lượng lớn business objects, những business objects này có một số joint fields bị duplicate, làm thế nào để deduplicate?
- Nếu đột ngột có lượng lớn requests đổ vào, làm thế nào để đảm bảo server stability?

### Project experience

Không nên đánh giá quá 2 project experiences. Vì để đánh giá sâu chi tiết một project chiếm khá nhiều thời gian.

Thông thường sẽ để ứng viên chọn một project họ thấy có thu hoạch nhất/thách thức nhất/ấn tượng nhất/thú vị nhất. Rồi đặt câu hỏi xoay quanh project đó. Thường bắt đầu từ project background, đánh giá hiểu biết tổng thể về tech stack, project modules và interactions, challenging tech problems và solutions trong project, troubleshooting, code maintainability, engineering quality assurance v.v.

## Interviewer Làm Thế Nào Để Conduct Tốt Một Buổi Phỏng Vấn?

### Chuẩn bị trước

Interviewer cũng cần làm một số chuẩn bị. Ví dụ familiarize với tech strengths, work experience của ứng viên, rồi làm interview design.

Khi phỏng vấn sắp bắt đầu, chuẩn bị tốt. Ngoài ra, interviewer cũng cần biết sơ về công ty — đặc biệt là tech stack, business overview và direction, work content, promotion system. Technical candidates hỏi những điều này khá nhiều.

### Bắt đầu phỏng vấn

Thường bắt đầu bằng self-introduction của ứng viên. Nhưng ứng viên thường nói khá tản mạn, vì vậy tôi sẽ trực tiếp hỏi: Bạn có những ưu điểm nào và những điểm bản thân thấy có thể cải thiện?

Sau đó dùng một câu hỏi cơ bản tương đối đơn giản như điểm khởi đầu cho phần kỹ thuật: Bạn quen với những search algorithms nào? Hầu hết đều có thể trả lời sequential search, binary search, hash search.

### Problem design

Đọc resume ứng viên trước, lọc keywords từ resume, design câu hỏi có mục tiêu dựa trên keywords đó.

Ví dụ resume ứng viên đề cập `MVVM`, có thể hỏi sự khác biệt giữa MVVM và MVC. Đề cập observer pattern, có thể discuss observer pattern, tiện thể hỏi họ còn quen với design patterns nào khác.

### Relaxed atmosphere

Dù hỏi nhiều câu hỏi khó, vẫn phải chú ý maintain relaxed atmosphere.

Trước phỏng vấn, tùy tiện đùa một chút dựa trên thông tin cơ bản của ứng viên. Ví dụ một ứng viên tên Wang Kui, thì tôi nói: Trước đây team chúng tôi có người tên Yuan Kui, chúng tôi toàn gọi anh ấy là Kui Ye.

Trong phỏng vấn, gợi ý một chút hoặc đưa ra ít quan điểm của mình, cũng có thể giảm căng thẳng cho ứng viên.

### Biết lắng nghe

Hỏi nhiều nói ít, để ứng viên thể hiện nhiều hơn. Dẫn dắt hoặc đào sâu hoặc mở rộng ngang dựa trên câu trả lời của ứng viên.

Dẫn dắt ứng viên thể hiện ưu thế tốt nhất của họ, để họ cảm thấy tốt hơn. Dù sao một buổi phỏng vấn cả hai phía đều bỏ ra thời gian và công sức — không nên là nơi để interviewer chê bai ứng viên, mà nên để cả hai có sự giao lưu tốt hơn. Rất có thể bạn cũng học được nhiều thứ từ ứng viên.

Phỏng vấn chỉ là hai phía có vai trò và lập trường khác nhau, không có nghĩa là interviewer nhất định cao hơn ứng viên về trình độ.

### Ghi lại điểm quan trọng

Ghi chép khách quan về câu trả lời của ứng viên, tránh tối đa mọi đánh giá chủ quan, không xử lý thêm (ví dụ tự tổng kết — tổng kết ability cũng là một đặc điểm của ứng viên).

## Đưa ra Phán Đoán

Quá trình phỏng vấn là sự dẫn dắt. Điều then chốt là đưa ra phán đoán.

Sai lầm dễ mắc nhất khi đưa ra phán đoán là: Tham cả sâu cả rộng. Luôn muốn ứng viên vừa technical depth vừa comprehensive. Thực ra đây là mong muốn xa xỉ. Nếu technical capability của ứng viên vừa sâu vừa comprehensive, rất có thể cũng đối mặt hai tình huống:

1. Ứng viên có lựa chọn tốt hơn;
2. Ứng viên có thể thiếu sót ở mặt khác, ví dụ team collaboration.

Thước đo phù hợp hơn:

1. Technical level có thể đáp ứng công việc hiện tại hay không;
2. Technical level so với các thành viên trong cùng team như thế nào;
3. Technical level có tương xứng với số năm kinh nghiệm không, có tiềm năng đảm nhiệm tasks phức tạp hơn không.

**Ở độ tuổi khác nhau, những thứ được coi trọng khác nhau.**

Với engineers dưới 3 năm, nên chú trọng technical basics hơn — vì đây đại diện cho future potential. Đồng thời cũng đánh giá biểu hiện trong phát triển thực tế, ví dụ team collaboration, business experience, stress resistance, proactive learning enthusiasm và ability.

Với engineers trên 3 năm, nên chú trọng business experience và problem-solving ability hơn. Xem họ phân tích problems cụ thể như thế nào, đánh giá technical basics depth và breadth trong phạm vi business.

Làm thế nào để phán đoán thực lực kỹ thuật thực sự của ứng viên và có phù hợp không — tôi vẫn đang học hỏi.

## Lời Gửi Ứng Viên

### Chú ý technical basics

Một thắc mắc phổ biến: Khi phát triển business systems hầu hết thời gian, cơ bản không liên quan đến data structures và algorithm design/implementation. Tại sao lại đánh giá implementation principles của HashMap? Tại sao phải học tốt data structures và algorithms, operating systems, networking và các basic courses?

Bây giờ tôi có thể đưa ra một câu trả lời:

- Như đã nói ở trên, phần lớn business problems, thực tế cuối cùng đều map về basic technical problems: data structures và algorithm implementation, memory management, concurrency control, network communication v.v. Đây là nền tảng để hiểu modern internet large-scale programs và giải quyết difficult problems — trừ khi chúc mình mãi không gặp problems, mãi chỉ hài lòng với viết CRUD.
- Những tech basics này là nơi thú vị và hứng khởi nhất trong thế giới lập trình. Nếu không hứng thú, rất khó đi sâu vào lĩnh vực này — không bằng chuyển sang làm ngành khác sớm.
- Technical basics là internal skills (nội công) của programmer, còn specific technologies là moves (chiêu thức). Chỉ có moves mà internal skills không sâu, gặp cao thủ dễ thất bại.
- Có nền tảng kỹ thuật vững chắc, ceiling có thể đạt tới cao hơn, trong tương lai có khả năng đảm nhiệm những technical problems phức tạp hơn, hoặc có thể có solutions tốt hơn với cùng problem.
- Người ta thích hợp tác với người giống họ. Strong people tend to work better together. Nếu muốn hợp tác với strong people để có kết quả tốt hơn, thì ít nhất về technical basics phải có thể match với strong people.
- Mở rộng các talents khác trên cơ sở CRUD cũng là lựa chọn tốt, nhưng đây không phải là stance của một real programmer. Đây là vấn đề career choice.

### Đừng để ý đến việc không trả lời được một câu hỏi nào đó

Nếu interviewer hỏi rất nhiều câu hỏi và bạn không trả lời được một số, đừng bận tâm. Interviewer rất có thể chỉ đang test technical depth và breadth của bạn, rồi phán đoán bạn có đạt water level nào đó không.

Điều quan trọng là: Một số câu hỏi bạn trả lời rất sâu, cũng thể hiện được khả năng deep thinking của bạn.

Đây là điều tôi lĩnh hội được khi trở thành technical interviewer. Tất nhiên, không phải mọi technical interviewer đều nghĩ vậy, nhưng tôi cho rằng đây nên là cách phù hợp hơn.

<!-- @include: @article-footer.snippet.md -->
