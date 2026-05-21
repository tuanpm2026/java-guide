---
title: Làm thế nào để đánh giá năng lực kỹ thuật của programmer trong technical interview
description: "Làm thế nào để đánh giá năng lực kỹ thuật của programmer trong technical interview - Tổng hợp các khái niệm chính, điểm thực hành."
category: Technical Articles Selection
author: Qinshuiyu
tag:
  - Interview
head:
  - - meta
    - name: keywords
      content: technical interview,interviewer skills,technical assessment,interview methodology,technical basics,project experience evaluation,question bank,technical depth
---

> **Lời giới thiệu**: Thảo luận technical interview từ cả hai góc độ interviewer và candidate!
>
> **Content overview:**
>
> - Kết hợp practice với theory. Ví dụ sau khi candidate mô tả JVM memory model layout, có thể hỏi tiếp: Nguyên nhân nào có thể dẫn đến OOM? Có những biện pháp phòng ngừa nào? Bạn có từng gặp memory leak không? Làm thế nào để troubleshoot và giải quyết?
> - Không nên đánh giá quá 2 project experiences. Đánh giá sâu chi tiết một project chiếm khá nhiều thời gian. Thường để candidate chọn project họ thấy có thu hoạch nhất/thách thức nhất/ấn tượng nhất/thú vị nhất/thất vọng nhất. Rồi đặt câu hỏi xung quanh project đó.
> - Hỏi nhiều nói ít, để candidate thể hiện nhiều. Dẫn dắt, đào sâu hoặc mở rộng ngang dựa trên câu trả lời của candidate.
>
> **Original article**: <https://www.cnblogs.com/lovesqcc/p/15169365.html>

## Ba câu hỏi quan trọng nhất

1. Bạn thấy người đó thế nào? 【Expression ability, communication ability, learning ability, summarization ability, self-reflection ability, stress resistance, emotion management, influence, team management】
2. Nếu để họ độc lập hoàn thành design và implementation của project, bạn nghĩ họ có thể đảm nhận không? 【System design ability, project management ability】
3. Khả năng phân tích và giải quyết vấn đề của họ, đánh giá của bạn là gì? 【Principles understanding, practical application ability】

## Mục tiêu và Approach đánh giá

Trước tiên clarify mục tiêu đánh giá của technical interview:

- Technical basics của candidate
- Tư duy và khả năng giải quyết vấn đề của candidate.

Technical basics là nền tảng (thứ dưới tảng băng), chiếm 7 phần. Problem-solving thinking và capabilities là execution (phần lộ ra trên tảng băng), chiếm 3 phần. Business và technical basics evaluation — 3-7 split.

Core evaluation target: Ability to analyze and solve problems.

Technical level: Depth + Application ability + Breadth. Với campus recruitment hoặc social recruitment below P6, focus nhiều hơn vào depth + application ability; breadth là bonus. Trên P6, có thể thêm breadth.

- **Campus recruitment**: Solid basics, sharp thinking. Main content: basic data structures và algorithms, processes và concurrency, memory management, system calls và IO, network protocols, database normalization và design, design patterns, design principles, coding habits.
- **Social recruitment**: Rich experience, well-rounded. Main content: technical mechanisms with certain depth như Java memory model và memory leaks, JVM, class loading, database indexes và query optimization, caching, message middleware, projects, architecture design, engineering standards.

### Technical basics là gì?

Với tư cách technical interviewer, cách đánh giá technical basics như thế nào? Rốt cuộc technical basics là gì? Là biết cái gì hay biết cách suy nghĩ thế nào? Knowledge là nền tảng quan trọng, còn biết cách suy nghĩ cũng rất quan trọng. Biết "what" và biết "why" - hiểu cả lý do tại sao. Biết cách suy nghĩ và có thể design và develop một cách chặt chẽ, đi vào chi tiết — đó là technical basics.

### Tại sao phải đánh giá technical basics?

Hai technical thinking capabilities quan trọng nhất của programmer là logical thinking và abstract design. Logical thinking là nền tảng, abstract design là cấp độ cao. Đánh giá technical basics có thể đồng thời đánh giá cả hai. Có thể hiểu basic technical concepts và connections — đánh giá logical thinking. Có thể abstract business problems thành technical problems và organize mapping hợp lý — đánh giá abstract design.

### Tại sao không thể chỉ đánh giá business dimension?

Vì business thường quen thuộc hơn, có thể nói thẳng theo phương án hiện tại, rất khó đánh giá được deep understanding, lateral expansion và summarization của candidate.

Khuyến nghị có mục tiêu đánh giá summarization ability của candidate: ví dụ trong quá trình build/develop/maintain microservices hoặc ensure system stability/performance, bạn đã thu hoạch được những kinh nghiệm nào có thể chia sẻ?

### Tại sao phải đánh giá business dimension?

Technical basics evaluation dễ bỏ sót non-technical capability traits của candidate: communication và organization ability, project management ability, stress resistance, practical problem-solving ability, team influence v.v.

## Phương pháp đánh giá

### Technical Basics Evaluation

**What-Why**

"What" đánh giá basic understanding, "Why" đánh giá implementation principles. Ví dụ: Index là gì? Index được implement như thế nào?

**Guiding-Horizontal-Deep questions**

Guiding: "Bạn có quen với Java sync tools không?" — sau khi được xác nhận, hỏi "Bạn quen với những sync tool classes nào?" để hiểu breadth. Sau đó đào sâu: "ConcurrentHashMap hoặc AQS implementation principles?"

**Depth with gradient and levels**

Đặt 3 câu hỏi theo 3 levels:

- Level 1: Basic concepts — đánh giá understanding ability
- Level 2: Principles và mechanisms — đánh giá depth of understanding
- Level 3: Applications — đánh giá application ability và mental agility

**Jump/Cross questions**

Ví dụ nói đến hash search có thể chuyển sang consistent hashing algorithm. Cũng là cách đánh giá tech breadth.

**Summary questions**

Ví dụ: Trong khi làm XXX bạn đã thu hoạch được những kinh nghiệm nào có thể chia sẻ? Đánh giá summarization ability.

**Practice combined with theory**

- Sau khi candidate mô tả JVM memory model layout, hỏi: Nguyên nhân nào có thể dẫn đến OOM? Biện pháp phòng ngừa? Gặp memory leak chưa? Troubleshoot và giải quyết như thế nào?
- Candidate đề cập SQL và index optimization — hỏi về index implementation principles, cách build optimal indexes.
- Candidate đề cập transactions — hỏi về transaction implementation principles, isolation levels, snapshot implementation.

**Familiar and unfamiliar combined**

Hỏi cả phần familiar trên resume và phần chưa ghi. Ví dụ candidate ghi "familiar with JVM memory model" — đánh giá memory management (familiar) và Java concurrent tools (uncertain).

**Dead knowledge and live knowledge combined**

Dead knowledge: "Search algorithms có những gì?" — sequential, binary, hash. Live knowledge: "Mỗi loại phù hợp với scenario nào? Trong công việc bạn đã dùng search algorithm nào ở đâu? Tại sao?"

**Problems from learning or work**

Problems gặp phải cũng có thể làm interview questions. Ví dụ về thread-safe data structures: làm thế nào implement lock? Thread-safe counter? Thread-safe linked list? Thread-safe Map?

**Tech stack fit questions**

Nếu candidate dùng technologies phù hợp với company tech stack, có thể deep-dive. Nhưng không thể dùng điều này để loại candidates không dùng tech stack đó.

**Handling memorization-style interviews**

Đối phó với những người "thuộc lòng" qua "guide-horizontal-deep" questions. Sau khi hiểu depth và breadth, đưa ra practical application problem để kiểm tra khả năng linh hoạt sử dụng.

Ví dụ Java thread sync: Thread A thực hiện code xong, tạo async task chạy trong Thread B. Thread A cần đợi Thread B xong mới tiếp tục. Implement như thế nào?

**Practical, not obscure**

Đánh giá knowledge, skills và capabilities thường dùng trong công việc. Ví dụ tôi thiên về 3 loại: data structures & algorithms, concurrency, design.

**Comprehensive serial questioning**

Thiết kế initial question (ví dụ search algorithm), sau đó từ đó chain nhiều knowledge points:

![](https://oss.javaguide.cn/github/javaguide/open-source-project/502996-20220211115505399-72788909.png)

**Build personalized interview question bank**

Mỗi technical interviewer sẽ có question bank. Liên tục tích lũy, gặp câu hỏi đột nhiên nghĩ đến thì ghi lại ngay.

### Problem-Solving Ability Evaluation

Technical basics chưa đủ. Thường tốt nhất là kết hợp business thực tế, dựa trên business trong project của candidate, abstract thành technical problems.

Common questions:

- Performance: QPS, TPS bao nhiêu? Biện pháp optimization nào? Kết quả đạt được?
- Nếu có massive data, xử lý thế nào? Đảm bảo stability như thế nào?
- Key points của function/module/system là gì? Solutions?
- Tại sao dùng XXX thay vì YYY?
- Long fields làm index như thế nào?
- Còn những solutions hoặc approaches nào khác? Pros và cons?
- Third-party integration: làm thế nào đối phó instability của external interfaces?
- Third-party integration với nhiều external systems: code maintainability?
- Financial loss scenarios? Serious failure scenarios?
- CPU spike online — how to handle? OOM? IO read/write spikes?
- Online issues encountered? Solutions?
- Data consistency giữa multiple subsystems?
- Adding XXX requirement — how to extend?
- If doing it again, what improvements would you make?

**Design questions**:

- Multiple machines sharing business objects with duplicate joint fields — how to deduplicate?
- Sudden massive request surge — how to ensure server stability?
- Component level: design a local cache? Distributed cache?
- Module level: design a task scheduling module?
- System level: design internal system to get sales data from various departments and generate reports.

**Project experience**:

Không nên đánh giá quá 2 projects. Thường để candidate chọn project họ thấy có thu hoạch nhất/thách thức nhất/ấn tượng nhất/thú vị nhất/thất vọng nhất. Hỏi về: project background, tech stack, overall understanding, challenging tech problems và solutions, troubleshooting, code maintainability, engineering quality, improvement space.

## Interview Process

### Pre-preparation

Interviewer cũng cần chuẩn bị — familiarize với candidate's tech strengths và work experience, design the interview.

### Starting the Interview

Thường bắt đầu bằng candidate self-introduction. Sau đó dùng một basic question đơn giản: "Bạn quen với những search algorithms nào?" — sequential, binary, hash.

### Question Design

Đọc resume trước, extract keywords, design targeted questions.

Can follow "Strengths-Standards-Random" principle:

- First: ask about tech they're interested in/invested in (strengths), elaborate principles and practical applications
- Second: standard questions — check principles understanding và practical application
- Third: random question

For projects similarly:

- First: most fulfilling project — tech stack, modules, tech selection, key design problems, solutions, implementation details, improvement space
- Second: frustrating project — what were the problems, what efforts made, how to improve

### Relaxed Atmosphere

Keep atmosphere relaxed even when asking many difficult questions.

### Learn to Listen

Ask more, speak less. Let candidates express themselves. Guide, deepen or laterally expand based on candidate's answers.

Guide candidates to show their best side. Both sides invested time and energy — shouldn't be occasion for interviewer to diss candidate.

### Record Key Points

Objectively record candidate's answers. Avoid subjective evaluations or any processing.

### Make Judgments

Most common pitfall: wanting both depth and breadth. Appropriate measure:

1. Can their tech level handle current work?
2. How does their tech level compare to team members?
3. Is their tech level relatively matched to their years of experience? Do they have potential for more complex tasks?

**Different experience levels matter differently:**

For engineers under 3 years: focus more on technical basics (represents future potential). Also evaluate team collaboration, business experience, stress resistance, proactive learning.

For engineers over 3 years: focus more on business experience and problem-solving ability.

## Starting as an Interviewer

- Test camera and audio in advance, use earphones.
- Read resume beforehand, extract keywords, prepare basic questions.
- Ask more technical basics questions, develop interview feel.
- Deep dive into principles and implementation.
- If resume has highlights, ask about those first; if not, let candidate introduce project background.
- Practice "chain questioning" technique until fluent.
- Focus on problem analysis and solving ability — if necessary, give coding problem.
- Leave time for candidate's questions and notify of results within 3 business days.

## Efficient Assessment

As you get more experienced, prepare standard questions for common sub-topics:

- What data structures and algorithms for search do you know? Pick one and explain its concept.
- If running a Java method creating a list of objects, how is memory allocated? When might stack overflow occur? When might OOM occur? Causes of OOM? How to avoid? Have you encountered OOM online?
- What is Java generational GC? What GC used in project? Why that one?
- What Java concurrent tools? What scenarios for each?
- Atomic class implementation principle? ConcurrentHashMap implementation?
- How to implement a reentrant lock?
- Project example: which fields use indexes? Why these fields? What optimization space? How to build good index?
- What cache parameters can be set? Their effects?
- Redis expiry strategies? How to choose?
- How to implement virus file detection task deduplication?
- What design patterns and design principles are you familiar with?
- Building a module/complete system from scratch? How to start?

If candidate can't answer: "If you were to design such a XXX, how would you do it?"

Time allocation: Technical basics (25-30 min) + Project (20-25 min) + Candidate questions (5-10 min)

## Note to Candidates

**Why care about technical basics:**

Most business problems ultimately map to basic technical problems: data structures và algorithms, memory management, concurrency control, networking. These are foundations for understanding modern internet large-scale programs.

Technical basics are programmer's internal skills (内功). Specific technologies are moves (招式). Moves without internal skills will fail against strong opponents.

**Don't worry about not answering a question:**

If interviewer asks many questions and you can't answer some, don't worry. They're likely testing your depth and breadth to judge whether you're at a certain level.

The key is: some questions you answer with depth, showing deep thinking ability.

## References

- [9 Common Misconceptions of Technical Interviewers](https://zhuanlan.zhihu.com/p/51404304)
- [How to be a good interviewer?](https://www.zhihu.com/question/26240321)

<!-- @include: @article-footer.snippet.md -->
