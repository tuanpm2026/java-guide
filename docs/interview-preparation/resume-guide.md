---
title: Hướng dẫn viết resume cho programmer
description: Hướng dẫn viết resume cho programmer - Giải thích cấu trúc resume, cách viết project experience và skills description từ góc nhìn HR screening logic. Cung cấp resume templates và lời khuyên tránh bẫy, giúp nâng cao tỷ lệ vượt qua resume và để interviewer đào sâu hơn vào điểm nổi bật của bạn.
category: Interview Preparation
icon: jianli
head:
  - - meta
    - name: keywords
      content: programmer resume,Java resume,resume optimization,project experience writing,resume template,campus recruitment resume,social recruitment resume,interview preparation
---

::: tip Gợi ý thân thiện
Bài này được trích từ **[《Java Interview Guide》](../zhuanlan/java-mian-shi-zhi-bei.md)**. Đây là chuyên mục dạy bạn cách chuẩn bị phỏng vấn hiệu quả hơn, bao gồm các câu hỏi phổ biến (system design, common frameworks, distributed, high concurrency...) và kinh nghiệm phỏng vấn chất lượng.
:::

## Lời mở đầu

Một bản resume tốt có thể đóng vai trò rất quan trọng trong toàn bộ quá trình nộp đơn và phỏng vấn.

**Tại sao resume quan trọng?** Có thể nói từ mấy điểm sau:

**1. Resume giống như bộ mặt của chúng ta — nó quyết định rất nhiều đến việc có nhận được cơ hội phỏng vấn hay không.**

- Nếu bạn nộp online, resume chắc chắn phải qua sàng lọc của HR. HR có thể chỉ dành khoảng 10 giây xem một resume rồi quyết định bạn có được phỏng vấn không.
- Nếu bạn được referral, nếu resume không có ưu thế gì, dù người giới thiệu cẩn thận đến đâu cũng không thể làm được gì.

Ngoài ra, dù vượt qua vòng sàng lọc đầu tiên, trong các vòng phỏng vấn sau, interviewer cũng sẽ dựa vào resume để đánh giá liệu bạn có xứng đáng để họ dành nhiều thời gian phỏng vấn không.

**2. Nội dung resume quyết định rất nhiều trọng tâm câu hỏi của interviewer.**

- Thông thường những thứ bạn ghi là biết trên resume mới được hỏi (Java basics, collections, concurrency, MySQL, Redis, Spring, Spring Boot là những thứ ai cũng bị hỏi). Ví dụ viết rằng proficient in Redis thì interviewer rất có thể sẽ hỏi nhiều về Redis. Viết rằng project dùng message queue thì interviewer có thể hỏi nhiều về message queue.
- Skill proficiency level cũng quyết định rất nhiều độ sâu của câu hỏi.

Không cường điệu năng lực mà vẫn viết được resume tốt cũng là một kỹ năng rất đáng trân trọng. Thông thường người có technical capability và learning ability tốt viết resume cũng khá hay!

## Resume Template

Hình thức resume thực sự rất rất quan trọng!!! Nếu resume hình thức quá xấu, interviewer thực sự không có tâm trạng đọc tiếp. Cái khổ của người xử lý hàng trăm resume mỗi ngày, bạn không biết đâu!

Tôi khuyến nghị viết resume bằng Markdown syntax, sau đó convert Markdown sang PDF để nộp. Nếu chưa quen Markdown, có thể dành 30 phút xem nhanh: <http://www.markdown.cn/>.

Một số resume templates tốt:

- Chinese resume templates collection (recommended, open source free): <https://github.com/dyweb/awesome-resume-for-chinese>
- Muji Resume (recommended, partially free): <https://www.mujicv.com/>
- Jiandan Resume (recommended, partially free): <https://easycv.cn/>
- Jijian Resume (free): <https://www.polebrief.com/index>
- Markdown resume tool (open source free): <https://resume.mdnice.com/>
- Zhanzhang Resume (paid, AI generation): <https://jianli.chinaz.com/>
- typora+markdown+css custom template: <https://github.com/Snailclimb/typora-markdown-resume>
- Super Resume (partially paid): <https://www.wondercv.com/>

Hầu hết templates chỉ có 1 trang, khó thể hiện đủ thông tin. Nếu không phải top-tier (như ACM competition winner), tôi khuyến nghị viết nhiều hơn để nổi bật năng lực (campus: max 2 pages, social: max 3 pages. Nhớ súc tích, tránh thừa lời).

**Một số lưu ý về resume formatting:**

- Cố gắng đơn giản, không quá phức tạp.
- Tech terms nên viết hoa đúng chuẩn — ví dụ java→Java, spring boot→Spring Boot. Một số interviewer không để ý, nhưng nhiều interviewer để ý chi tiết này.
- Thêm khoảng cách giữa tiếng Trung/tiếng Việt với số và tiếng Anh sẽ nhìn thoải mái hơn.

Trong Knowledge Planet còn có các real resume templates để tham khảo: <https://t.zsxq.com/12ypxGNzU>.

![](/images/javamianshizhibei/image-20230918073550606.png)

## Nội dung Resume

### Thông tin cá nhân

- **Cơ bản**: Họ tên, tuổi, số điện thoại, quê quán, thông tin liên lạc, địa chỉ email
- **Điểm cộng tiềm năng**: Địa chỉ Github, địa chỉ blog (nếu tech blog và Github không có gì thì đừng viết)

Ví dụ:

![](/images/zhishixingqiu/20210428212337599.png)

**Có nên để ảnh trong resume không?** Nhiều người thắc mắc điều này.

Thực ra để hay không đều được, không ảnh hưởng lớn. Trừ khi vị trí ứng tuyển yêu cầu ảnh rõ ràng. Nếu để ảnh, đừng để ảnh đời thường — nên để ảnh formal như ảnh ID.

### Vị trí mong muốn

Bạn muốn ứng tuyển vị trí gì, muốn làm việc ở thành phố nào. Cũng có thể đặt phần này vào thông tin cá nhân.

Ví dụ:

![](/images/zhishixingqiu/20210428212410288.png)

### Học vấn

Không thể thiếu. Qua phần học vấn, đảm bảo interviewer biết được học vị, chuyên ngành, trường và ngày tốt nghiệp.

Ví dụ:

> Beijing Institute of Technology, Master's Degree, Software Engineering, 2019.09 - 2022.01
> Hunan University, Bachelor's Degree, Applied Chemistry, 2015.09 ~ 2019.06

### Kỹ năng chuyên môn

Trước tiên hỏi bản thân biết gì, rồi xem công ty mục tiêu cần gì. HR thường không hiểu kỹ thuật lắm, nên khi sàng lọc resume họ có thể nhìn vào keywords trong phần skills. Với skills công ty yêu cầu mà bạn chưa biết, có thể dành vài ngày học rồi ghi là "familiar" với skill đó.

Dưới đây là Java backend development skills list mới nhất. Bạn có thể điều chỉnh theo tình hình cá nhân và yêu cầu của vị trí — core idea là đáp ứng tất cả skill requirements của vị trí ứng tuyển.

![Java Backend Skills Template](/images/zhishixingqiu/jinengmuban.png)

Đây là skills introduction của một bạn tôi từng xem. Hãy tìm vấn đề:

![](/images/zhishixingqiu/up-a58d644340f8ce5cd32f9963f003abe4233.png)

Vấn đề:

- Tech terms nên viết hoa đúng chuẩn (java→Java, spring boot→Spring Boot). Nhiều interviewer để ý chi tiết này.
- Skills introduction quá lan man, không có điểm nổi bật. Không cần toàn năng — làm tốt một lĩnh vực là đủ!
- Độ thành thạo của một số Java backend skills như Spring Boot chỉ là "familiar" — không đủ đáp ứng yêu cầu doanh nghiệp.

### Internship/Work Experience (Quan trọng)

Work experience cho social recruitment, internship experience cho campus recruitment.

Work experience nên giới thiệu theo thứ tự thời gian ngược (mới nhất trước). Cả hai cần ngắn gọn nổi bật những gì bạn đã làm trong thời gian đó.

Ví dụ:

> **XXX Company (20XX/XX ~ 20XX/XX)**
>
> - **Position**: Java Backend Developer
> - **Work Content**: Mainly responsible for XXX

### Project Experience (Quan trọng)

Có 1-2 project experiences trên resume là bình thường, nhưng những người thực sự trình bày tốt project experience cho interviewer rất ít.

Nhiều ứng viên gặp vấn đề với project experience: quá dài dòng, quá đơn giản, không nổi bật điểm sáng.

Template giới thiệu project experience:

> **Project Name** (font size larger)
>
> 2017-05~2018-06, Taobao, Java Backend Developer
>
> - **Project Description**: Brief description of what the project does.
> - **Tech Stack**: What technologies (e.g., Spring Boot + MySQL + Redis + Mybatis-plus + Spring Security + OAuth2)
> - **Work Content/Responsibilities**: Brief description of what you did, what problems you solved, what substantial improvements you made. Highlight your capabilities, don't be too bland.
> - **Personal Learnings (Optional)**: What you learned, what technologies you used, what new skills you acquired. Usually can skip since responsibilities already show main learnings.
> - **Project Outcomes (Optional)**: Brief description of what results the project achieved.

**1. Project experience should highlight what you did, briefly summarize the project basics.**

Keep project intro within 2 lines — don't go into too much detail, but don't just write a few words.

Personal learnings and project outcomes are optional. If written, don't take up too much space. Your focus should be work content/responsibilities.

**2. Tech architecture — just write the tech names, no need to explain what each technology does.**

![](/images/github/javaguide/interview-preparation/46c92fbc5160e65dd85c451143177144.png)

**3. Minimize pure business responsibility descriptions — not interview-friendly. Dig for more highlights (6~8 responsibility lines is about right). Best to demonstrate comprehensive abilities — how you coordinated team members, how you solved a tricky problem, how you optimized module performance.**

Even if a feature or problem wasn't yours, as long as you understand it thoroughly, you can use it with appropriate polish!

Performance optimization highlights are relatively easy to prepare, but don't make everything performance optimization — that's an extreme too.

**Quantify technical optimization results:**

- Used xxx technology to solve xxx problem, system QPS improved from xxx to xxx.
- Used xxx technology to optimize xxx interface, system QPS improved from xxx to xxx.
- Used xxx technology to solve xxx problem, query speed optimized by xxx, system QPS reached 10w+.
- Used xxx technology to optimize xxx module, response time reduced from 2s to 0.2s.

Personal responsibility examples (don't copy directly — write based on your own project):

- Implemented microservices unified authentication and authorization based on Spring Cloud Gateway + Spring Security OAuth2 + JWT, using RBAC permission model for dynamic permission control.
- Participated in project order module development, responsible for order creation, deletion, query and other functions. Implemented order state transitions based on Spring State Machine.
- Introduced Elasticsearch for product and order search scenarios, implemented related product recommendations and search suggestions.
- Integrated Canal + RabbitMQ to sync MySQL incremental data (products, orders) to Elasticsearch.
- Used RabbitMQ official delay queue plugin for delayed task scenarios like order timeout auto-cancellation, coupon expiry reminders, refund processing.
- Introduced RabbitMQ in message push system for async processing, peak shaving and service decoupling. Max push speed 100k/s, max daily messages 20 million.
- Used MAT tool to analyze dump files and resolved massive service timeout alerts after new version of ad service launch.
- Investigated and resolved deadlock issue in deduction module caused by deduction parent task and anti-cheat child task using the same thread pool.
- Implemented ad delivery data import/export based on EasyExcel. Used MyBatis batch insert, implemented async based on task table.
- Responsible for user statistics module development. Used CompletableFuture to parallelize loading of user statistics data, average response time reduced from 3.5s to 1s.
- Applied Sentinel rate limiting and degradation to core scenarios (like user login/registration, shipping address queries) to protect system and improve user experience.
- Used Redis+Caffeine two-level caching for hot data (homepage, hot posts), solved cache stampede and penetration. Query speed millisecond-level, QPS 300k+.
- Used CompletableFuture to optimize shopping cart query module, orchestrating async RPC calls for user info, product details, coupon info. Response time reduced from 2s to 0.2s.
- Set up EasyMock service to simulate third-party platform APIs, facilitating interface integration in network-isolated environments.
- Built distributed tracing system with full-chain monitoring based on SkyWalking + Elasticsearch.

**4. If your project technology is outdated, you can improve it privately. What matters is making the project stand out — the method doesn't matter.**

Project experience is very important. [《Java Interview Guide》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html) has several articles on optimizing project experience — recommended reading.

![](/images/zhishixingqiu/4e11dbc842054e53ad6c5f0445023eb5~tplv-k3u1fbpfcp-zoom-1.png)

**5. Avoid having all personal responsibilities revolve around a single technology — very inadvisable.**

![](/images/zhishixingqiu/image-20230424222513028.png)

**6. Avoid vague descriptions. Be specific (technology + scenario + effect). Also be concise (avoid piling up tech keywords, omit unnecessary descriptions).**

![](/images/github/javaguide/interview-preparation/project-experience-avoiding-ambiguity-descriptio.png)

### Awards and Honors (Optional)

If you have high-value competition awards (like ACM, Alibaba Tianchi Competition), definitely include them! You can also move this section earlier to a more prominent position.

### Campus Activities (Optional)

If you have impressive campus activities, write a brief mention. Otherwise skip.

### Personal Statement

**Personal statement is your self-description — use concise language to highlight your characteristics and strengths. Avoid fluff!** Things like "hardworking, perseverant" are vague and boring to interviewers.

Write personal statement from these angles:

- Documentation ability, learning ability, communication ability, teamwork
- Work attitude and personal responsibility
- Ability to handle work pressure and face difficulties
- Pursuit of technical excellence, code quality pursuit
- Distributed, high-concurrency system development or maintenance experience

3 actual examples:

- Strong learning ability. In junior year for the National Software Design Competition, quickly picked up Python and built a configurable crawler system.
- Good teamwork spirit. In junior year for the competition, coordinated 5 development teammates and helped those facing coding difficulties, successfully completing core functionality in 1 month.
- Rich project experience. Independently led development of multiple enterprise-level projects during school.

## STAR Rule and FAB Rule

### STAR Rule (Situation Task Action Result)

You've certainly heard of the STAR rule. Apply it in your resume and when communicating with interviewers.

- **Situation**: What was the context?
- **Task**: What was your task?
- **Action**: What did you do?
- **Result**: What was the final outcome?

### FAB Rule (Feature Advantage Benefit)

Another rule commonly used in sales:

- **Feature**: What are your characteristics/strengths?
- **Advantage**: How are you better than others?
- **Benefit**: What will the recruiter gain by hiring you?

Simply put, **FAB rule lets your interviewer know your strengths and what value you bring to the company.**

## Suggestions

### Avoid Too Many Pages

Condense and highlight key points. Campus recruitment resume: max 2 pages. Social recruitment: max 3 pages. If content is too much, no need to force it to one page — just keep formatting clean and neat.

I've reviewed thousands of resumes. Some had nearly 10 pages — it made my scalp tingle.

![Too many pages](/images/zhishixingqiu/image-20230508223646164.png)

### Avoid Vague Language

Minimize subjective descriptions, fewer vague adjectives. Expressions should be clear and concise, resume structure should be organized.

Example:

- Bad: I played a very important role in the team.
- Good: As backend technical lead, I led the team to complete backend project design and development.

### Pay Attention to Resume Style

Resume style is equally important! No need for flashy decoration, but ensure clear structure and easy reading.

### Other

- Always submit in PDF format. This is most basic!
- Don't write things you don't know on your resume. Appropriate polishing is fine, but maintain truthfulness.
- Work experience: reverse chronological order. Internship: most valuable first.
- Properly presenting project experience is crucial. Focus on highlighting what YOU did (find highlights), not just describing what the project is.
- Project experiences sorted reverse chronologically. Quality over quantity (2~3 carefully chosen).
- During interview prep, treat what you wrote on resume as priority, especially project experience and skills.
- Interviews and actual work are different. Smart people guide interviewers toward their strengths. Others get led by interviewers. But to get the offer you want, your actual ability must be strong.

## Resume Review

To date, I've provided free resume review for **6000+** Knowledge Planet members. Due to limited energy, resume reviews are only for Planet members. To get resume help, join [**JavaGuide Official Knowledge Planet**](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html#%E7%AE%80%E5%8E%86%E4%BF%AE%E6%94%B9).

![img](/images/xingqiu/%E7%AE%80%E5%8E%86%E4%BF%AE%E6%94%B92.jpg)

Although the fee is only a fraction of bootcamp costs, the content quality in Knowledge Planet is higher and services are more comprehensive — very suitable for those preparing Java interviews and learning Java.

Below are some services provided (click the image for detailed introduction):

[![Planet services](/images/xingqiu/xingqiufuwu.png)](../about-the-author/zhishixingqiu-two-years.md)

Here's a limited-time exclusive discount coupon:

![Knowledge Planet 30 yuan coupon](/images/xingqiu/xingqiuyouhuijuan-30.jpg)
