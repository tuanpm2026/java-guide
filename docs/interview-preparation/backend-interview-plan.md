---
title: Kế hoạch vượt qua phỏng vấn Java Backend (bao gồm hệ thống backend tổng quát)
description: Kế hoạch vượt qua phỏng vấn Java backend - Được sắp xếp chặt chẽ theo thứ tự ưu tiên kiểm tra thực tế trong phỏng vấn, bao gồm project experience, Java core, MySQL/Redis, frameworks, system design, computer basics, distributed và JVM, phù hợp để chuẩn bị campus/social recruitment.
category: Interview Preparation
icon: star
head:
  - - meta
    - name: keywords
      content: Java backend interview,interview preparation plan,interview guide,technical questions,campus recruitment,social recruitment,project experience,Java interview
---

Kế hoạch này được sắp xếp chặt chẽ theo **thứ tự ưu tiên thực tế** trong phỏng vấn:
**「Project Experience & Resume Deep-dive → Java Core/MySQL/Redis → Framework Applications → System Design & Scenario Questions → Computer Basics → Distributed/High Concurrency → JVM」**

Mỗi giai đoạn đều có các bài viết tuyển chọn cụ thể trên website, giúp bạn dễ dàng tham chiếu và chinh phục từng phần.

- **Tổng thời gian đề xuất**: 4~8 tuần (có thể co rút hoặc kéo dài linh hoạt tùy vào công ty mục tiêu là SME hay big company, và thời gian tập trung học của bạn).
- **Đối tượng phù hợp**: Sinh viên CS chuẩn bị fall/spring recruitment, và Java developers 0-5 năm kinh nghiệm chuẩn bị nhảy việc.
- **Sprint phỏng vấn**: Các bài kỹ thuật được khuyến nghị dưới đây chủ yếu từ [JavaGuide](https://javaguide.cn/). Nếu cần sprint phỏng vấn gấp, có thể chọn đọc các bài tương ứng trong [JavaGuide Interview Sprint Version](https://interview.javaguide.cn/).

### Tổng quan kế hoạch

| Giai đoạn                                              | Thời gian đề xuất                        | Core output                                                                                   | Tiêu chuẩn tự kiểm tra                                                                                                                            |
| ------------------------------------------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bước 0** Chuẩn bị ban đầu                            | 1~2 ngày                                 | Resume hoàn thiện, nhịp độ ôn tập, chuẩn bị tâm lý                                            | Chọn bất kỳ project nào, trong 30 giây giải thích rõ business + vai trò của mình, không bị vấp, có trọng tâm                                      |
| **Giai đoạn 1** Project & Resume Deep-dive             | ~1 tuần                                  | Project cards, must-know questions list, 1/3 minute scripts                                   | Không nhìn note kể rõ background + điểm khó + đóng góp của mình cho mỗi project; must-know questions rút ngẫu nhiên 3 câu trả lời được key points |
| **Giai đoạn 2** Java + MySQL + Redis                   | 2~3 tuần                                 | Technical question understanding and keyword memorization (basics+collections+concurrency+DB) | Rút ngẫu nhiên câu hỏi từ bài trên website, có thể dùng lời mình giải thích nguyên lý và key words, không phụ thuộc thuộc từng chữ                |
| **Giai đoạn 3** Frameworks                             | 1~2 tuần                                 | Spring/IoC/AOP/Transaction, Design Patterns, Permission & Security                            | Có thể nói rõ cách dùng framework trong project, nắm thấu IoC và AOP, transaction failure scenarios v.v.                                          |
| **System Design & Scenario Questions** (sau Framework) | Tùy 0.5~1 tuần                           | System design và scenario question approaches (short URL/flash sale/massive data)             | Không có gợi ý, có thể kể lại overall flow và key trade-offs (storage, rate limiting, consistency) của classic designs (như short URL/flash sale) |
| **Giai đoạn 4** Computer Basics                        | Tùy 0.5~2 tuần                           | Network, OS, Data Structures; algorithm for medium/large companies                            | Có thể viết tay common algorithms/coding questions; random questions từ bài trên website có thể trả lời core mechanisms                           |
| **Giai đoạn 5** Distributed & High Concurrency         | Tùy 1~2 tuần                             | Distributed theory, RPC, MQ, High Availability                                                | Có thể giải thích rõ distributed solutions dùng trong project (lock/ID/MQ) và lý do chọn                                                          |
| **Giai đoạn 6** JVM                                    | Big company/some medium company 3~5 ngày | Memory, GC, Class Loading, Tuning & Troubleshooting                                           | Có thể nói rõ memory areas, GC process, class loading; có thể kể một lần GC tuning hoặc OOM troubleshooting approach                              |
| **Sprint trước phỏng vấn**                             | 1~2 ngày                                 | Duyệt lại must-know questions, luyện project scripts, tâm lý và thiết bị                      | Duyệt qua must-know questions list có thể nhắc lại key points; mỗi project 1-minute script luyện một lần không bị vấp                             |

**📌 Ghi chú điều chỉnh giai đoạn:**

- Những giai đoạn được đánh "tùy" có thể điều chỉnh theo công ty mục tiêu: Phỏng vấn ByteDance, Kuaishou, Tencent và các **big companies coi trọng algorithm**, nhất định phải tăng cường Giai đoạn 4 (algorithm & data structures).
- Nếu resume hoặc vị trí ứng tuyển rõ ràng liên quan đến **distributed/microservices**, hãy ôn kỹ hệ thống Giai đoạn 5.
- Nếu mục tiêu là **core departments của Alibaba, Meituan, JD.com** và các big companies, tập trung chinh phục Giai đoạn 6 (JVM internals và online troubleshooting).

### Bước 0: Chuẩn bị ban đầu (Đề xuất 1~2 ngày)

Trước khi ôn technical questions hệ thống, giải quyết trước "cách chuẩn bị, cách viết resume, cách giữ vững tâm lý" để tránh đi sai hướng.

| Việc cần làm         | Giải thích                                                  | Bài đọc tương ứng                                                                                                                                                                                                                                                               |
| -------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phương pháp chuẩn bị | Xác định nhịp ôn tập, cách tự kiểm tra, phân bổ thời gian   | [How to efficiently prepare Java interview?](https://javaguide.cn/interview-preparation/teach-you-how-to-prepare-for-the-interview-hand-in-hand.html)<br />[Java Backend Interview Key Points Summary](https://javaguide.cn/interview-preparation/key-points-of-interview.html) |
| Resume               | 1-2 trang, project STAR, tech stack phù hợp với vị trí      | [Programmer Resume Writing Guide](https://javaguide.cn/interview-preparation/resume-guide.html)                                                                                                                                                                                 |
| Learning path        | Xác định điểm thiếu, xác định giai đoạn hiện tại            | [Java Learning Path (Latest, 4w+ words)](https://javaguide.cn/interview-preparation/java-roadmap.html)                                                                                                                                                                          |
| Project & experience | Không có project/internship thì làm thế nào, cách trình bày | [Project Experience Guide](https://javaguide.cn/interview-preparation/project-experience-guide.html)<br />[Campus recruitment without internship experience?](https://javaguide.cn/interview-preparation/internship-experience.html)                                            |
| Tâm lý               | Giảm căng thẳng, thể hiện ổn định hơn                       | [Interview nerves - what to do?](https://javaguide.cn/interview-preparation/how-to-handle-interview-nerves.html)                                                                                                                                                                |

**Key points:**

- **Giỏi kỹ thuật ≠ vượt qua phỏng vấn** — phải chuẩn bị có hệ thống. Học job-oriented sớm, lập danh sách kỹ năng theo yêu cầu tuyển dụng.
- **Nắm thời điểm vàng nộp resume**: Fall recruitment 7-9 tháng, Spring recruitment 3-4 tháng. Lấy thông tin tuyển dụng qua nhiều kênh (official website, recruitment sites, Nowcoder, referral...).
- **Dành 2-3 ngày hoàn thiện resume**, chú trọng mô tả project experience. **Campus recruitment resume không quá 2 trang, social recruitment không quá 3 trang**. Nhất định phải polish nhưng tránh phóng đại sự thật trong resume — dễ bị đào sâu trong phỏng vấn.
- **Technical questions rất có ý nghĩa** — cũng dùng trong phát triển hàng ngày. Đừng có tâm lý may rủi.
- **Chuẩn bị trước 1-2 phút self-introduction script**, có thể trình bày trôi chảy về background, tech stack và career goals.
- **Tự kiểm tra thường xuyên** — có thể dùng AI mock interview, tìm bạn bè để mock interview lẫn nhau.

### Giai đoạn 1: Project & Resume Deep-dive (~1 tuần)

**Mục tiêu**: Có thể trình bày rõ ràng background, vai trò, tech selection và điểm khó của mỗi project, và có thể suy ra "câu hỏi phỏng vấn có thể bị hỏi".

**Output:**

- **Project cards**: Lần lượt xem qua projects trên resume, viết rõ cho mỗi project: business background, tech stack, module bạn phụ trách, 1~2 điểm khó và cách giải quyết, kết quả có thể quantify (như QPS, response time, cost saving).
- **Must-know questions list**: Dựa trên tech dùng trong project, liệt kê "must-know questions" (ví dụ: dùng Redis cache → Redis common data structures, persistence mechanism, threading model v.v.; dùng MySQL → indexes, transactions, slow SQL optimization v.v.). Có thể tham khảo interview question summaries trên [JavaGuide](https://javaguide.cn/) để mở rộng theo project.
- **Scripts**: Mỗi project chuẩn bị phiên bản 1~2 phút (dùng cho self-introduction) và 3~5 phút (dùng cho deep-dive). Có thể trình bày trôi chảy "tại sao chọn vậy, gặp vấn đề gì, giải quyết như thế nào".

**Gợi ý hàng ngày**: Mỗi ngày tổng hợp ít nhất 1 project + must-know questions tương ứng. Cuối tuần tự kiểm tra không nhìn note (ghi âm hoặc nói trước gương).

**Self-test**: Có thể kể rõ background, điểm khó và đóng góp của mình cho mỗi project mà không nhìn note. Các câu trong must-know questions list có thể trả lời key points. Với big company interview phải chịu được deep-dive.

**Không có project experience thì làm thế nào?**

1. **Practical project videos/columns**: Mukewang, Bilibili, Lagou, Geek Time v.v. Chọn project phù hợp với năng lực, không cần cố sức làm microservices projects. [JavaGuide Official Knowledge Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html) đã ra mắt [⭐AI Smart Interview Platform + RAG Knowledge Base](https://javaguide.cn/zhuanlan/interview-guide.html) và [Handwritten RPC Framework](https://javaguide.cn/zhuanlan/handwritten-rpc-framework.html). Và còn chia sẻ nhiều optimized versions của high-frequency project experiences (như blog, takeout, thread pool, short URL) và interview preparation.
2. **Open source practical projects**: [Quality open source practical projects](https://javaguide.cn/open-source-project/practical-project.html) recommended by JavaGuide. Cải tiến hoặc thêm chức năng trên cơ sở hiểu.
3. **Tham gia các cuộc thi do big companies tổ chức**: Alibaba Cloud Tianchi Competition v.v. Projects đạt giải có hàm lượng kỹ thuật cao.

**Project experience writing key points (STAR Method):**

- **Situation**: Background của project là gì? Cần giải quyết vấn đề gì?
- **Task**: Bạn phụ trách gì trong project? Vai trò của bạn là gì?
- **Action**: Bạn cụ thể đã làm gì? Dùng công nghệ gì? Gặp vấn đề gì? Giải quyết như thế nào?
- **Result**: Đạt kết quả gì? Tốt nhất là quantify (QPS từ xxx tăng lên xxx, response time giảm xx%).

**High-frequency questions about project introduction:**

- Mô tả tech architecture bằng tech terms trực tiếp, không cần giải thích.
- Giảm mô tả business thuần túy, đào sâu hơn vào tech highlights, kết hợp với business scenarios cụ thể.
- Optimization results nên được quantify (QPS, response time, cost saving). Với projects không thực sự, package với reasonable numbers là được.
- Mô tả công việc nên có 6~8 điểm là hợp lý. Trong đó ít nhất phải có 3-4 điểm có tech highlights thu hút interviewer.
- Tránh mô tả mơ hồ (như "chịu trách nhiệm phát triển"), phải cụ thể (tech + scenario + result).
- Nhất định phải package project, nhưng cũng không được quá package. Khi chuẩn bị hãy nghĩ nhiều về "nếu interviewer hỏi tại sao", đảm bảo logic tự nhất quán.

### Giai đoạn 2: Java Core + MySQL + Redis (~2~3 tuần)

**Độ ưu tiên**: Phần quan trọng nhất, điểm kiểm tra tần suất cao, MySQL + Redis ≥ Java basics/collections/concurrency > framework knowledge. Big companies sẽ deep-dive concurrency và internals.

**Java Basics**

- [Java Basic Common Interview Questions (Part 1)](https://javaguide.cn/java/basis/java-basic-questions-01.html), [(Part 2)](https://javaguide.cn/java/basis/java-basic-questions-02.html), [(Part 3)](https://javaguide.cn/java/basis/java-basic-questions-03.html): Syntax & OOP, Strings & Copy, Exceptions/Generics/Reflection/SPI/Serialization/Annotations

**Java Collections**

- [Java Collections Common Interview Questions (Part 1)](https://javaguide.cn/java/collection/java-collection-questions-01.html), [(Part 2)](https://javaguide.cn/java/collection/java-collection-questions-02.html): List/Set/Queue, HashMap, ConcurrentHashMap

**Java Concurrency** (Must deep-dive for big companies)

- [Java Concurrency Common Interview Questions (Part 1)](https://javaguide.cn/java/concurrent/java-concurrent-questions-01.html), [(Part 2)](https://javaguide.cn/java/concurrent/java-concurrent-questions-02.html), [(Part 3)](https://javaguide.cn/java/concurrent/java-concurrent-questions-03.html): Threads & Locks, synchronized/ReentrantLock, ThreadLocal/Thread Pool/Future/AQS/Virtual Threads
- [JMM](https://javaguide.cn/java/concurrent/jmm.html), [Thread Pool Detailed](https://javaguide.cn/java/concurrent/java-thread-pool-summary.html) and [Best Practices](https://javaguide.cn/java/concurrent/java-thread-pool-best-practices.html)
- [ThreadLocal](https://javaguide.cn/java/concurrent/threadlocal.html), [AQS](https://javaguide.cn/java/concurrent/aqs.html), [CompletableFuture](https://javaguide.cn/java/concurrent/completablefuture-intro.html), [Common Concurrent Containers](https://javaguide.cn/java/concurrent/java-concurrent-collections.html)

**MySQL** (Must read)

- [MySQL Common Interview Questions Summary](https://javaguide.cn/database/mysql/mysql-questions-01.html) (Basics, Engine, Transactions, Indexes, Locks, Optimization)
- [MySQL Index Detailed](https://javaguide.cn/database/mysql/mysql-index.html), [Three Major Logs](https://javaguide.cn/database/mysql/mysql-logs.html), [Transaction Isolation Levels](https://javaguide.cn/database/mysql/transaction-isolation-level.html)
- [InnoDB MVCC Implementation](https://javaguide.cn/database/mysql/innodb-implementation-of-mvcc.html), [SQL Execution Process](https://javaguide.cn/database/mysql/how-sql-executed-in-mysql.html)

**Redis** (Must read)

- [Redis Common Interview Questions (Part 1)](https://javaguide.cn/database/redis/redis-questions-01.html), [Redis Common Interview Questions (Part 2)](https://javaguide.cn/database/redis/redis-questions-02.html)
- [Redis Delayed Tasks](https://javaguide.cn/database/redis/redis-delayed-task.html), [Redis as Message Queue](https://javaguide.cn/database/redis/redis-stream-mq.html)
- [5 Basic Data Types](https://javaguide.cn/database/redis/redis-data-structures-01.html), [3 Special Types](https://javaguide.cn/database/redis/redis-data-structures-02.html), [Skip List for Sorted Sets](https://javaguide.cn/database/redis/redis-skiplist.html)
- [Persistence](https://javaguide.cn/database/redis/redis-persistence.html), [Memory Fragmentation](https://javaguide.cn/database/redis/redis-memory-fragmentation.html), [Common Blocking Causes](https://javaguide.cn/database/redis/redis-common-blocking-problems-summary.html)

**Self-test**: Rút ngẫu nhiên câu hỏi, có thể dùng lời mình giải thích, không thuộc lòng máy móc — hiểu và nhớ keyword. Đặc biệt phải test kỹ phần MySQL và Redis — đây là trọng tâm trong trọng tâm kiểm tra phỏng vấn.

### Giai đoạn 3: Frameworks và System Design (~1~3 tuần)

#### Design Patterns

- [Design Patterns Common Interview Questions Summary](https://interview.javaguide.cn/system-design/design-pattern.html)

**Self-test**: Nắm ít nhất 2 cách viết thông thường của Singleton pattern. Factory, Proxy, Chain of Responsibility, Strategy patterns nhất định phải hiểu — tốt nhất có thể liên hệ với project experience hoặc open source framework để trình bày.

#### Frameworks

**Spring / Spring Boot**

- [Spring Common Interview Questions](https://javaguide.cn/system-design/framework/spring/spring-knowledge-and-questions-summary.html), [SpringBoot Common Interview Questions](https://javaguide.cn/system-design/framework/spring/springboot-knowledge-and-questions-summary.html)
- [Common Annotations](https://javaguide.cn/system-design/framework/spring/spring-common-annotations.html), [IoC & AOP](https://javaguide.cn/system-design/framework/spring/ioc-and-aop.html), [Spring Transactions](https://javaguide.cn/system-design/framework/spring/spring-transaction.html)
- [Design Patterns in Spring](https://javaguide.cn/system-design/framework/spring/spring-design-patterns-summary.html), [SpringBoot Auto-assembly](https://javaguide.cn/system-design/framework/spring/spring-boot-auto-assembly-principles.html), [Async Principles](https://javaguide.cn/system-design/framework/spring/async.html) (Principle knowledge, can skip if time is short)
- [MyBatis Common Interview Questions](https://javaguide.cn/system-design/framework/mybatis/mybatis-interview.html) (Not important, can skip), [Netty Common Interview Questions](https://javaguide.cn/system-design/framework/netty.html) (Only prepare if you use it)

**Self-test**: Có thể nói rõ Spring annotations dùng trong project, IoC/AOP reflected in project, transaction failure scenarios.

**Permission & Security**

- [Auth Basics](https://javaguide.cn/system-design/security/basis-of-authority-certification.html), [JWT](https://javaguide.cn/system-design/security/jwt-intro.html) and [Pros/Cons](https://javaguide.cn/system-design/security/advantages-and-disadvantages-of-jwt.html), [Permission System Design](https://javaguide.cn/system-design/security/design-of-authority-system.html), [SSO](https://javaguide.cn/system-design/security/sso-intro.html), [Common Encryption Algorithms](https://javaguide.cn/system-design/security/encryption-algorithms.html)

#### System Design & Scenario Questions

Interviewer thường xen kẽ một hai câu system design hoặc scenario questions để kiểm tra overall approach và trade-off decision-making.

- **System Design / Scenario Questions Summary**: [System Design Common Interview Questions Summary](https://javaguide.cn/system-design/system-design-questions.html) (Paid content in [《Backend Interview High-frequency System Design & Scenario Questions》](https://javaguide.cn/zhuanlan/back-end-interview-high-frequency-system-design-and-scenario-questions.html) column — 30+ questions including short URL, flash sale, massive data processing).
- **Design articles on this website for reference** (approaches can be transferred to interview verbal): [Scheduled Tasks](https://javaguide.cn/system-design/schedule-task.html), [Web Real-time Message Push](https://javaguide.cn/system-design/web-real-time-message-push.html).

![《Backend Interview High-frequency System Design & Scenario Questions》](/images/xingqiu/back-end-interview-high-frequency-system-design-and-scenario-questions-fengmian.png)

**Self-test**: Có thể kể lại overall approach và key trade-offs của 1~2 classic system designs (như short URL, flash sale, rate limiting). For scenario questions (like massive data deduplication, third-party login), can name common solutions.

### Giai đoạn 4: Computer Basics (Điều chỉnh theo công ty mục tiêu)

**Targeting ByteDance, Tencent và các companies coi trọng algorithm/basics**: Dành thêm thời gian một chút, algorithm và coding questions phải luyện riêng (LeetCode Hot 100, Sword Refers to Offer). **Targeting SMEs**: Có thể co rút hoặc để sau.

- **Algorithm & Coding Questions** (Must allocate time for ByteDance, Kuaishou): [Sword Refers to Offer Solutions](https://javaguide.cn/cs-basics/algorithms/the-sword-refers-to-offer.html), LeetCode Hot 100, common handwritten (like LRU, producer-consumer, Singleton). Recommend at least 1 per day to maintain feel.
- **Network**: [Network Common Interview Questions (Part 1)](https://javaguide.cn/cs-basics/network/other-network-questions.html), [(Part 2)](https://javaguide.cn/cs-basics/network/other-network-questions2.html), [Web page access process](https://javaguide.cn/cs-basics/network/the-whole-process-of-accessing-web-pages.html), [Application layer common protocols](https://javaguide.cn/cs-basics/network/application-layer-protocol.html), [HTTP/HTTPS](https://javaguide.cn/cs-basics/network/http-vs-https.html), [HTTP 1.0 vs 1.1](https://javaguide.cn/cs-basics/network/http1.0-vs-http1.1.html), [DNS](https://javaguide.cn/cs-basics/network/dns.html), [TCP Three-way Handshake & Four-way Teardown](https://javaguide.cn/cs-basics/network/tcp-connection-and-disconnection.html), [TCP Reliability](https://javaguide.cn/cs-basics/network/tcp-reliability-guarantee.html), [ARP](https://javaguide.cn/cs-basics/network/arp.html)
- **Operating System**: [OS Common Interview Questions (Part 1)](https://javaguide.cn/cs-basics/operating-system/operating-system-basic-questions-01.html), [(Part 2)](https://javaguide.cn/cs-basics/operating-system/operating-system-basic-questions-02.html), [Linux Basics](https://javaguide.cn/cs-basics/operating-system/linux-intro.html)
- **Data Structures**: [Array/LinkedList/Stack/Queue](https://javaguide.cn/cs-basics/data-structure/linear-data-structure.html), [Graph](https://javaguide.cn/cs-basics/data-structure/graph.html), [Heap](https://javaguide.cn/cs-basics/data-structure/heap.html), [Tree](https://javaguide.cn/cs-basics/data-structure/tree.html), [Red-Black Tree](https://javaguide.cn/cs-basics/data-structure/red-black-tree.html), [Bloom Filter](https://javaguide.cn/cs-basics/data-structure/bloom-filter.html)

**Self-test**: Có thể vẽ web page access process, TCP handshake & teardown v.v. Algorithm questions có thể viết tay common patterns. OS processes/threads, memory, deadlock có thể giải thích concept với examples.

### Giai đoạn 5: Distributed & High Concurrency (Theo resume và position)

Nếu resume hoặc vị trí liên quan đến distributed/microservices/high concurrency, ôn lại một lần nữa có hệ thống. Nếu không, chỉ cần ôn "những điểm project có dùng đến".

- **Distributed Theory**: [CAP & BASE](https://javaguide.cn/distributed-system/protocol/cap-and-base-theorem.html), [Paxos](https://javaguide.cn/distributed-system/protocol/paxos-algorithm.html), [Raft](https://javaguide.cn/distributed-system/protocol/raft-algorithm.html), [ZAB](https://javaguide.cn/distributed-system/protocol/zab.html), [Gossip](https://javaguide.cn/distributed-system/protocol/gossip-protocol.html), [Consistent Hashing](https://javaguide.cn/distributed-system/protocol/consistent-hashing.html)
- **RPC**: [RPC Basics](https://javaguide.cn/distributed-system/rpc/rpc-intro.html), [Dubbo](https://javaguide.cn/distributed-system/rpc/dubbo.html) (currently asked rarely, can skip)
- **Distributed ID / Gateway / Lock / Transaction** (Focus if project involves): [Distributed ID](https://javaguide.cn/distributed-system/distributed-id.html), [Design Guide](https://javaguide.cn/distributed-system/distributed-id-design.html), [API Gateway](https://javaguide.cn/distributed-system/api-gateway.html), [Spring Cloud Gateway](https://javaguide.cn/distributed-system/spring-cloud-gateway-questions.html), [Distributed Lock](https://javaguide.cn/distributed-system/distributed-lock-implementations.html), [Distributed Transaction](https://javaguide.cn/distributed-system/distributed-transaction.html)
- **High Concurrency** (Focus if project involves): [CDN](https://javaguide.cn/high-performance/cdn.html), [Read-Write Separation & Sharding](https://javaguide.cn/high-performance/read-and-write-separation-and-library-subtable.html), [Hot/Cold Data Separation](https://javaguide.cn/high-performance/data-cold-hot-separation.html), [SQL Optimization](https://javaguide.cn/high-performance/sql-optimization.html), [Deep Pagination](https://javaguide.cn/high-performance/deep-pagination-optimization.html), [Load Balancing](https://javaguide.cn/high-performance/load-balancing.html)
- **High Availability** (Focus if project involves): [High Availability System Design](https://javaguide.cn/high-availability/high-availability-system-design.html), [Rate Limiting](https://javaguide.cn/high-availability/limit-request.html), [Circuit Breaking & Degradation](https://javaguide.cn/high-availability/fallback-and-circuit-breaker.html), [Timeout & Retry](https://javaguide.cn/high-availability/timeout-and-retry.html), [Idempotent Design](https://javaguide.cn/high-availability/idempotency.html), [Redundancy Design](https://javaguide.cn/high-availability/redundancy.html)
- **Message Queue** (Focus if project involves): [MQ Basics](https://javaguide.cn/high-performance/message-queue/message-queue.html), [Disruptor](https://javaguide.cn/high-performance/message-queue/disruptor-questions.html), [RabbitMQ](https://javaguide.cn/high-performance/message-queue/rabbitmq-questions.html), [RocketMQ](https://javaguide.cn/high-performance/message-queue/rocketmq-questions.html), [Kafka](https://javaguide.cn/high-performance/message-queue/kafka-questions-01.html)

**Self-test**: Có thể giải thích rõ distributed solutions dùng trong project (như distributed lock, ID, MQ) và lý do chọn. CAP/BASE, consistent hashing có thể đưa ra examples.

### Giai đoạn 6: JVM (Big companies / Some medium companies)

Targeting Alibaba, Meituan, Ctrip, SF Express, CMB Network v.v. nên ôn kỹ. Targeting state-owned enterprises hoặc small companies có thể bỏ qua.

- [Java Memory Areas](https://javaguide.cn/java/jvm/memory-area.html), [JVM Garbage Collection](https://javaguide.cn/java/jvm/jvm-garbage-collection.html)
- [Class File Structure](https://javaguide.cn/java/jvm/class-file-structure.html), [Class Loading Process](https://javaguide.cn/java/jvm/class-loading-process.html), [Class Loaders](https://javaguide.cn/java/jvm/classloader.html)
- Kết hợp với [Common Online Issue Cases](https://t.zsxq.com/0bsAac47U) từ [Planet](https://javaguide.cn/about-the-author/zhishixingqiu-two-years.html) để hiểu tuning & troubleshooting (cũng có thể tham khảo [JVM Online Problem Troubleshooting and Performance Tuning Cases](https://javaguide.cn/java/jvm/jvm-in-action.html))

**Self-test**: Có thể nói rõ memory areas, common GC collectors và collection process, class loading và delegation model. Có thể liên hệ với project hoặc case để kể một lần GC tuning hoặc OOM troubleshooting approach.

**Java New Features** (Đọc theo yêu cầu vị trí): [Java 11](https://javaguide.cn/java/new-features/java11.html), [Java 17](https://javaguide.cn/java/new-features/java17.html), [Java 21](https://javaguide.cn/java/new-features/java21.html)

### 1~2 ngày trước phỏng vấn: Sprint checklist

Khi gần đến phỏng vấn ưu tiên làm mấy việc này — tránh loạn hướng khi nước đến chân mới nhảy:

| Việc cần làm                     | Giải thích                                                                                                                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duyệt qua must-know questions    | Tập trung vào "project-related must-know questions" từ Giai đoạn 1 + các điểm kiểm tra liên quan đến "proficient" trên resume. Có thể nhắc lại key points là được.                                 |
| Luyện project scripts            | Mỗi project 1-minute version và 3-minute version mỗi cái nói một lần, chỗ bị vấp ghi lại rồi luyện thêm lần nữa.                                                                                   |
| Xu hướng công ty mục tiêu/vị trí | Lật lại kinh nghiệm phỏng vấn của công ty đó hoặc vị trí tương tự, xem có điểm trọng tâm nào (như algorithm, network, project deep-dive) — chuẩn bị có mục tiêu.                                   |
| Tâm lý và trạng thái             | Ngủ sớm, chuẩn bị thiết bị (online interview) hoặc đường đi (onsite). Có thể xem [Interview nerves - what to do?](https://javaguide.cn/interview-preparation/how-to-handle-interview-nerves.html). |

Sau khi kết thúc phỏng vấn nên review ngắn gọn: câu nào trả lời chưa tốt, câu nào chưa chuẩn bị đến — bổ sung vào must-know questions list, trước lần phỏng vấn tiếp theo ôn lại trọng tâm.
