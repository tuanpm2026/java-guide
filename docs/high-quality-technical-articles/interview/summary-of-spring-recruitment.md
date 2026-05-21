---
title: Tổng kết Spring Recruitment của người bình thường (Alibaba, Tencent offer)
description: "Tổng kết Spring Recruitment của người bình thường (Alibaba, Tencent offer) - Tổng hợp các khái niệm chính, điểm thực hành."
category: Technical Articles Selection
author: Zhongqi Jiyou
tag:
  - Interview
head:
  - - meta
    - name: keywords
      content: spring recruitment experience,Alibaba interview,Tencent interview,Java learning path,interview preparation,project experience,algorithm practice,non-elite university
---

> **Lời giới thiệu**: Bài nổi tiếng trên Nowcoder, viết rất toàn diện! Internship in summer, applied to Alibaba, Tencent, ByteDance. Got offers from Alibaba and Tencent.
>
> **Original article**: <https://www.nowcoder.com/discuss/640519>
>
> **Part 2**: [Ten Years Hardship, Passion Never Fades - Fall Recruitment Summary](https://www.nowcoder.com/discuss/804679)

## Background

Writing this article while the Tencent offer has just come through and spring recruitment is over. This time for summer internship I didn't mass-apply like last year. Only applied to BAT (Baidu, Alibaba, Tencent). Got offers from Alibaba and Tencent. ByteDance didn't give me an interview — probably failed the coding test.

I'm a junior at a non-elite university. My spring recruitment timeline was approximately from Feb 20 to Mar 23 when I received the Alibaba letter of intent. But from Mar 7 after Ant's final technical round, I didn't have any more technical interviews — just two HR interviews and waited for offers after that.

Initially I got a ByteDance Finance daily internship referral through a friend, but it's still in "resume evaluation" status. Tencent started with TiMi Studio recruiting me, failed round 1, then PCG recruited me and I made it through. For Alibaba, I applied to many departments in the early batch. Ant completed the final interview first, so I got entered into the system and eventually got the offer.

This journey had all kinds of experiences — bitter, sweet, sour, spicy. I've felt inferior about my academic background, even considered graduate school. Bottom line — find a study partner. Like @你怕是个憨批哦, my labmate and the team leader. He's genuinely strong — got offers from Alibaba's core departments. He gave me a lot of help during my preparation.

## Purpose of This Post

1. **For myself**: Reflect on the first three years of university and job-hunting experiences.
2. **For friends still looking for internships**: Hope my experience and interview notes give you some inspiration and help.
3. **For juniors and seniors who dream of working at big companies**: You still have a long time to prepare. No matter what you were doing before — no goal, drifting, wrong direction — as long as you start now, find the right learning direction, and persist for a year or two, you can definitely make your dream come true.

## My University Experience

Let me briefly share my university experience.

No papers, no competitions, no ACM, no awards worth mentioning. GPA is okay — not terrible but not impressive either. Grad school is definitely not an option; even self-studying for it probably won't work.

Freshman year joined a studio. First semester self-studied C and data structures. Started learning Java from winter break. Didn't know Java was so competitive then — I heard Java was good for getting jobs. Looking back, information asymmetry is so important. I only knew about frontend, backend and Android development. I was interested in backend, but due to information gap, I only knew Java could do it. Didn't know about backend development, server-side development terms, or that C++, Golang could also do backend. So I chose Java.

But Java is actually better for business logic, while C++ is better for lower-level and server-side development. I'm not against business work, but I'm more interested in OS and networking — those will be hobbies I explore in my spare time.

### Learning Path

Roughly: Java SE basics → MySQL → Java Web (mainly JDBC, Servlet, JSP) → SSM (Spring Boot was already popular, but I thought SSM foundation was needed first) → Spring Boot → Spring Cloud (learned it but lacked project experience, completely couldn't use it, just understood distributed concepts) → Redis → Nginx → Computer Networks (mandatory course but our major had it in junior year spring, so I self-studied ahead) → Dubbo → ZooKeeper → JVM → JUC → Netty → RabbitMQ → OS → Computer Organization (this course wasn't even offered).

This was my learning path, completed roughly in the second half of sophomore year, all through video tutorials. I could use things but didn't understand underlying principles — not at the level of interview technical questions. After completing this, I had a knowledge framework and started interview prep around June of last year. Started reading interview notes on Nowcoder and summarizing them.

During interview prep, I think the most important things are reading books + algorithm practice. Technical questions are just supplementary. We self-mockingly say "interviews are just memorizing technical questions", but actually companies like Alibaba — just memorizing won't work unless you have an outstanding project or internship experience.

### Book Recommendations

- 《Thinking in Java》: Great book but too thick. Bought it, never read it.
- 《Understanding the Java Virtual Machine》: JVM bible. Read it twice, each time discovered new insights.
- 《The Art of Java Concurrency Programming》: Written by Alibaba people, basically covers concurrency questions asked in interviews.
- 《MySQL Internals》: Very in-depth. May not be beginner-friendly. Initially found it deep and scattered, but reading each chapter individually has great rewards.
- 《Redis Design and Implementation》: In-depth explanation of Redis implementation principles with source code — must read.
- 《Computer Systems: A Programmer's Perspective (CSAPP)》: Famous CSAPP. May not directly help with Java interviews but is a classic covering computer systems, architecture, organization, OS. My Ant 2nd interview asked about my biggest challenge — I discussed problems I encountered reading this book with the interviewer. Taobao 2nd interview also discussed this book. Both of us felt it needed a second read.
- 《TCP/IP Illustrated Volume 1》: Only read TCP-related chapters, but the whole book is worth reading. Discussed this with a TiMi interviewer.
- 《Operating Systems: Three Easy Pieces (OSTEP)》: Famous OSTEP. Can read along with Professor Jiang Yanyan's Nanjing University OS videos on Bilibili.

If you truly understand these books, I believe you can have very in-depth conversations with interviewers. For ordinary people though, one reading definitely won't stick — forgetting is completely normal. I've only read most things once and forgotten many details. Planning to re-read soon.

For more book recommendations, check [JavaGuide](https://javaguide.cn/books/) — quite comprehensive.

![](/images/p3-juejin/62099c9b2fd24d3cb6511e49756f486b~tplv-k3u1fbpfcp-zoom-1.png)

### Tutorial Recommendations

For the learning path I mentioned, I recommend following video tutorials. Both Shangguigu and Heima tutorials work. Must type the code by hand.

- [NJU "Operating Systems: Design and Implementation" by Jiang Yanyan (2021)](https://www.bilibili.com/video/BV1HN41197Ko): The comments say it all.
- [SpringSecurity-Social-OAuth2 Login Authorization Course](https://www.bilibili.com/video/BV16J41127jq): Good Spring Security course. Spring Security or Shiro is a must for projects — learn one, choose based on scenario and preference.
- [Tsinghua University Deng Junhui Data Structures and Algorithms](https://www.bilibili.com/video/BV1jt4y117KR): Tsinghua speaks for itself.
- [MySQL Practice 45 Lectures](https://time.geekbang.org/column/intro/100020801): Reading the first 27 lectures multiple times basically covers most MySQL interview questions.
- [Redis Core Technology and Practice](https://time.geekbang.org/column/intro/100056701): Covers many Redis production use cases. Read together with 《Redis Design and Implementation》.
- [JavaGuide](https://javaguide.cn/books/): Java learning and interview guide covering core knowledge for most Java programmers.
- [《Java Interview Guide》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247519384&idx=1&sn=bc7e71af75350b755f04ca4178395b1a&chksm=cea1c353f9d64a458f797696d4144b4d6e58639371a4612b8e4d106d83a66d2289e7b2cd7431&token=660789642&lang=zh_CN&scene=21#wechat_redirect): Guide on how to prepare for interviews more efficiently.

## Job Hunting

Around November last year, daily internship interview notes on Nowcoder started increasing. I realized I needed to find an internship, started mass-applying while reviewing. Applied to many companies, only got interviews from a few. Failed Tencent round 2 twice — completely fell apart mentally, even started thinking spring recruitment was hopeless. Fortunately got one internship opportunity. During the internship, besides completing daily work, didn't let up in my spare time — reviewed evenings and weekends. Quietly resolved: spring recruitment I will come back fighting!

From late February started mass-applying to Alibaba's early batch. Almost all gave interviews. On the first day the system opened, received 16 referral emails. See my previous articles for specific interview notes.

From 3.1 to 3.7, averaged 3 interviews per day. Completely exhausted. Briefly considered grad school, anxious, cried, laughed too. Fortunately the outcome was good, and I went to Alipay where I always wanted to be.

I mainly want to share some advice based on my interview experience.

### Interview Preparation

First need to prepare a resume. I think a good resume should have these three parts:

1. **Complete personal info**: Without complete info, interviewers and HRs can't contact you. Even if your school isn't great, still include it — some companies can't evaluate the resume without a school. Non-CS majors or less famous schools can put education info at the bottom.
2. **Project/internship experience**: Projects are really important. Most interview time revolves around projects. If you're well-prepared, you can control the interview rhythm and guide the interviewer to ask about your strengths. I lost points here. If you have no projects, find open source projects on GitHub, follow along, and add your own thinking. Also don't just implement features — consider performance and optimization. Interviewers don't care how you implemented a feature; they want to know how you thought through it step by step, what your initial approach was, what you ultimately chose, what performance improvements you made, and what further improvements are possible.
3. **Professional skills**: Simple summary of professional knowledge you've learned. This helps interviewers ask targeted basic questions. Avoid long lists — put what you're best at first.

After writing the resume, submit it. Best to find a reliable referral person who can track your interview progress, communicate with HR when needed, and even tell you reasons if you fail. Now referral is not an advantage but the minimum entry ticket. If you don't know anyone, you can find referrals from seniors on Nowcoder — they're usually enthusiastic.

In interviews, don't be nervous. Round 1 interviewers may be only a few years older than us with limited experience. No need to be so nervous you can't talk. If you don't know, say you don't know and smile. If you know, express it fluently. Interviews are not just Q&A — they're conversations and exchanges. You can boldly share your thinking. Communication ability is also an evaluation criterion.

I personally think interviews are similar to dating — both are about quickly letting the other person understand you and see your highlights. Self-introduction becomes very important. After brief personal info, introduce your projects. Make self-introduction longer to give the interviewer time to read your resume (they might not have read it beforehand). Write out the project introduction as a document, read it several times, try to memorize it for the interview.

### Projects

I want to emphasize projects. I used to think projects were very uncertain. After interviews I realized projects are where it's easiest to steer the interviewer. Asking about projects is asking about basic knowledge through them. So you need to be very familiar with your own projects, think through extreme cases and optimization plans, know the principles of middleware used, and how these handle various situations — like MQ crash recovery, Redis cluster, sentinel, cache avalanche/penetration/breakdown.

Optimization can mainly come from: caching, MQ decoupling, adding indexes, multi-threading, async tasks, using Elasticsearch for search, etc. The main focus should be reducing database access and reducing synchronous calls.

Things you can learn through projects:

1. Permission control (ABAC, RBAC)
2. JWT
3. Single Sign-On
4. Database sharding
5. Chunked upload/export
6. Distributed lock
7. Load balancing

Every project is different. But remember: whatever you've touched, interviewers probably know it too. Prepare well or you'll be grilled hard.

Essentially projects can be broken down like technical questions — can be prepared using the same method as preparing basic knowledge.

### Algorithms

The "technical question-ification" of projects further prevents accurate screening of candidates. So the third evaluation criterion is algorithms. I once asked an interviewer in the Q&A period what benefits algorithm practice provides. The interviewer directly told me: practicing problems helps you find work. My view is algorithms can also be improved through repetition. Practice the first 200 LeetCode problems 3 times and I don't believe you still can't handle interview coding questions. So maintain algorithm training throughout your preparation.

### Interview Tips

1. Make self-introduction as rich as possible. Prepare how to introduce projects in advance.
2. When encountering something you don't know, don't just say "I don't know" and freeze up. You can say you don't know this area well but you know about XX, and then explain. If the interviewer is interested, continue; if not, they'll ask the next question. Interviewers usually won't interrupt.
3. Try to show your passion for technology — like discussing new features in each Java version or recent tech news. As far as I know, passion for technology is something Alibaba evaluates.
4. Interviews are a two-way choice process — don't be too sycophantic.
5. Make good use of Q&A time. Ask meaningful questions like training programs for new hires and conversion processes.

## Experience

1. If you're a freshman: understand internet employment directions, find your interests, build fundamentals first — data structures, OS, networking, computer organization. These are both exam subjects for most graduate school programs and commonly asked interview questions.
2. If you're a sophomore: clarify your direction, have self-driven motivation, know what you need to learn and to what level, manage your time well.
3. If your academic background is a disadvantage or you're non-CS: I suggest you work harder than average. From many years on Nowcoder, I've seen that students from better schools tend to be asked easier questions, while weaker schools get harder questions. This makes sense since elite school students generally have stronger overall capabilities.
4. Try to intern early. If you're a sophomore and already at internship level, start submitting resumes for summer internship. If you intern this summer, next year you'll be unstoppable.
5. If you can't find an internship, try to do a few challenging projects and find the key highlights.
6. Spend more time on Nowcoder. I've met many like-minded people there who gave me a lot of help.

## Suggestions

1. Find study partners. Create a group with classmates looking for work — whether from your school or people you met online. Regular exchanges of study experiences — n people sharing is definitely greater than n individual efforts.
2. Both knowledge depth and breadth are important. Always explore new technologies and try to understand principles. Otherwise you're not really learning computer science — more like English majors becoming API callers.
3. Maintain your CSDN, Juejin and other blog platforms. A junior of mine was a CSDN expert as a sophomore and already had headhunters contacting him. Commit your code to GitHub whenever possible. If you have the ability, record videos for Bilibili — this is an important way for interviewers to understand your expression ability before the interview.
4. Keep a good mindset. If interviews don't go well, it's not necessarily your capability — maybe they have few spots, or some objective condition doesn't match. Keep trying different options.
5. Communicate with more people. Don't just grind alone. Working at companies requires collaborating with others, so expression and communication skills are basic — cultivate them early.

## Casual Thoughts

### On Information Asymmetry

I think the gap between schools isn't just in teaching level. Elite schools have better teachers and labs — but information asymmetry is the main gap. Studying at a top 985 university, you encounter more quality company campus recruitment events, lectures, and a better employment atmosphere. More seniors go to big companies and foreign companies. It's not just about referrals — you learn non-technical things from them. At non-elite schools, fewer people go to big companies, and they can only influence a small number of people. That's the information gap.

This gap shows up in: your peers started looking for daily internships as sophomores while you thought job hunting was for seniors. They found summer internships as juniors while you spent summer at school-organized training.

Fortunately, the internet makes information more transparent. You can search for anything online. I met like-minded friends on Nowcoder who helped me a lot. Regularly browsing Nowcoder effectively reduces the information gap.

### On Java's Competition

Is Java competitive? Absolutely, very competitive. I personally think development is a job without a high barrier — undergraduate level is just right. But because algorithm positions are even more cutthroat with PhDs competing, many graduate students switched to development and basically all switched to Java. Java's competitiveness isn't only from this. Bootcamp industries emerging further lowered the barrier. Non-CS graduates switching to coding are also contributing. Other industries declining while internet thriving led many from other majors to self-study CS. More and more people, same sized cake.

Actually this competitiveness isn't necessarily bad — it shows the social mobility channel hasn't completely closed and people are still willing to work hard to change their situation. The choice is yours — go back home and lie flat, or enter internet companies and compete. If you choose the latter, my advice is to claim your spot early because the only constant is change — you never know what three years will look like.

## Blessings

May everyone's future be brilliant!

<!-- @include: @article-footer.snippet.md -->
