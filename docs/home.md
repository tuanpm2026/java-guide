---
icon: creative
title: JavaGuide（Hướng dẫn phỏng vấn Java & Backend tổng hợp）
description: Hướng dẫn phỏng vấn Java（Tổng hợp câu hỏi phỏng vấn Java）：Bao phủ các kiến thức cốt lõi như Java cơ bản, Collections, Concurrency, JVM, Spring, MySQL, Redis, System Design và Distributed Systems, phù hợp cho việc ôn thi phỏng vấn backend.
head:
  - - meta
    - name: keywords
      content: Java面试,Java面试指南,Java八股文,Java面试题,Java基础面试,JVM面试,并发面试,线程池面试,Spring面试,MySQL面试,Redis面试,系统设计面试,分布式面试,后端面试
---

::: tip Lưu ý

- **Phỏng vấn AI**: [Hướng dẫn phỏng vấn phát triển ứng dụng AI](../ai/) - Nắm vững các điểm thi phỏng vấn quan trọng như nền tảng mô hình lớn, Agent, RAG, giao thức MCP.
- **Dự án thực chiến**:
  - [⭐Nền tảng hỗ trợ phỏng vấn thông minh AI + RAG Knowledge Base](https://javaguide.cn/zhuanlan/interview-guide.html)：Phát triển dựa trên Spring Boot 4.0 + Java 21 + Spring AI 2.0. Rất phù hợp làm dự án học tập và dự án CV, ngưỡng học thấp, giúp nâng cao khả năng cạnh tranh tìm việc.
  - [Tự viết RPC Framework](https://javaguide.cn/zhuanlan/handwritten-rpc-framework.html)：Xây dựng từ đầu một RPC framework đơn giản dựa trên Netty+Kyro+Zookeeper. Dự án nhỏ nhưng đầy đủ, chú thích chi tiết, cấu trúc rõ ràng.
- **Tài liệu phỏng vấn bổ sung**:
  - [《Cẩm nang phỏng vấn Java》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html)：Được đánh bóng 4 năm, bổ sung nội dung cho phiên bản mã nguồn mở JavaGuide, dẫn bạn từ đầu chuẩn bị có hệ thống cho phỏng vấn backend!
  - [《Câu hỏi System Design & Tình huống phỏng vấn Backend tần suất cao》](https://javaguide.cn/zhuanlan/back-end-interview-high-frequency-system-design-and-scenario-questions.html)：30+ câu hỏi system design và tình huống tần suất cao, giúp bạn đối phó xu hướng phỏng vấn các công ty lớn hiện nay.
- **Gợi ý sử dụng**：Nếu bạn muốn chuẩn bị có hệ thống cho phỏng vấn Java backend nhưng không biết bắt đầu từ đâu, có thể tham khảo [Kế hoạch chinh phục phỏng vấn Java Backend（dành cho backend tổng hợp）](https://javaguide.cn/interview-preparation/backend-interview-plan.html).
- **Cho xin một Star**：Nếu bạn thấy nội dung của JavaGuide hữu ích, hãy cho một Star miễn phí, đó là sự khích lệ lớn nhất với mình. Cảm ơn mọi người đã đồng hành！Cổng vào: [GitHub](https://github.com/Snailclimb/JavaGuide) | [Gitee](https://gitee.com/SnailClimb/JavaGuide).
- **Lưu ý khi dẫn nguồn**：Tất cả các bài viết dưới đây nếu không ghi là đăng lại thì đều là bản gốc của JavaGuide. Khi dẫn nguồn vui lòng ghi rõ nguồn ở đầu bài. Nếu phát hiện sao chép/đạo văn độc hại, sẽ sử dụng các biện pháp pháp lý để bảo vệ quyền lợi. Hãy cùng nhau duy trì một môi trường sáng tạo kỹ thuật lành mạnh!

JavaGuide 是一份系统化的 **Java 面试指南** 和**后端通用面试复习资料**，内容覆盖 Java 基础、集合、并发编程、JVM、Spring/Spring Boot、MySQL、Redis、分布式、高并发、高可用和系统设计等核心知识点。

如果你正在准备校招、社招或跳槽面试，可以从 [Java 后端面试通关计划](./interview-preparation/backend-interview-plan.md) 开始，再按下面的模块逐步复习高频 Java 八股文和后端面试题。

本站所有内容都已免费开源，欢迎一起[维护完善](http://localhost:8080/javaguide/contribution-guideline.html)，有帮助的话，欢迎 Star！

- **项目地址**：<https://github.com/Snailclimb/JavaGuide>
- **在线阅读**：<https://javaguide.cn/>

## Chuẩn bị phỏng vấn

- [⭐Kế hoạch chinh phục phỏng vấn Java Backend（bao gồm hệ thống backend tổng hợp）](./interview-preparation/backend-interview-plan.md) (Bắt buộc phải xem :+1:)
- [Làm thế nào để chuẩn bị phỏng vấn Java hiệu quả?](./interview-preparation/teach-you-how-to-prepare-for-the-interview-hand-in-hand.md)
- [Tổng kết các điểm trọng tâm phỏng vấn Java Backend](./interview-preparation/key-points-of-interview.md)
- [Lộ trình học Java（phiên bản mới nhất, 4w+ chữ）](./interview-preparation/java-roadmap.md)
- [Hướng dẫn viết CV cho lập trình viên](./interview-preparation/resume-guide.md)
- [Hướng dẫn kinh nghiệm dự án](./interview-preparation/project-experience-guide.md)
- [Bị run trong phỏng vấn thì phải làm gì?](./interview-preparation/how-to-handle-interview-nerves.md)
- [Tuyển sinh không có kinh nghiệm thực tập thì sao? Viết kinh nghiệm thực tập như thế nào?](./interview-preparation/internship-experience.md)

## Java

### Cơ bản

**Tổng hợp kiến thức/câu hỏi phỏng vấn** : (Bắt buộc xem :+1: )：

- [Tổng hợp kiến thức & câu hỏi phỏng vấn Java cơ bản thường gặp (Phần 1)](./java/basis/java-basic-questions-01.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Java cơ bản thường gặp (Phần 2)](./java/basis/java-basic-questions-02.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Java cơ bản thường gặp (Phần 3)](./java/basis/java-basic-questions-03.md)

**Giải thích chi tiết các kiến thức quan trọng**：

- [Tại sao trong Java chỉ có truyền theo giá trị?](./java/basis/why-there-only-value-passing-in-java.md)
- [Giải thích chi tiết Java Serialization](./java/basis/serialization.md)
- [Giải thích chi tiết Generics & Wildcards](./java/basis/generics-and-wildcards.md)
- [Giải thích chi tiết cơ chế Reflection của Java](./java/basis/reflection.md)
- [Giải thích chi tiết Proxy Pattern trong Java](./java/basis/proxy.md)
- [Giải thích chi tiết BigDecimal](./java/basis/bigdecimal.md)
- [Giải thích chi tiết lớp ma thuật Unsafe của Java](./java/basis/unsafe.md)
- [Giải thích chi tiết cơ chế SPI của Java](./java/basis/spi.md)
- [Giải thích chi tiết Syntactic Sugar trong Java](./java/basis/syntactic-sugar.md)

### Collections

**Tổng hợp kiến thức/câu hỏi phỏng vấn**：

- [Tổng hợp kiến thức & câu hỏi phỏng vấn Java Collections thường gặp (Phần 1)](./java/collection/java-collection-questions-01.md) (Bắt buộc xem :+1:)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Java Collections thường gặp (Phần 2)](./java/collection/java-collection-questions-02.md) (Bắt buộc xem :+1:)
- [Tổng hợp các lưu ý khi sử dụng Java Collections](./java/collection/java-collection-precautions-for-use.md)

**Phân tích mã nguồn**：

- [Phân tích mã nguồn cốt lõi ArrayList + cơ chế mở rộng](./java/collection/arraylist-source-code.md)
- [Phân tích mã nguồn cốt lõi LinkedList](./java/collection/linkedlist-source-code.md)
- [Phân tích mã nguồn cốt lõi HashMap + cấu trúc dữ liệu bên dưới](./java/collection/hashmap-source-code.md)
- [Phân tích mã nguồn cốt lõi ConcurrentHashMap + cấu trúc dữ liệu bên dưới](./java/collection/concurrent-hash-map-source-code.md)
- [Phân tích mã nguồn cốt lõi LinkedHashMap](./java/collection/linkedhashmap-source-code.md)
- [Phân tích mã nguồn cốt lõi CopyOnWriteArrayList](./java/collection/copyonwritearraylist-source-code.md)
- [Phân tích mã nguồn cốt lõi ArrayBlockingQueue](./java/collection/arrayblockingqueue-source-code.md)
- [Phân tích mã nguồn cốt lõi PriorityQueue](./java/collection/priorityqueue-source-code.md)
- [Phân tích mã nguồn cốt lõi DelayQueue](./java/collection/priorityqueue-source-code.md)

### IO

- [Tổng hợp kiến thức cơ bản về IO](./java/io/io-basis.md)
- [Tổng hợp Design Patterns trong IO](./java/io/io-design-patterns.md)
- [Giải thích chi tiết IO Model](./java/io/io-model.md)
- [Tổng hợp kiến thức cốt lõi về NIO](./java/io/nio-basis.md)

### Concurrency (Lập trình đồng thời)

**Tổng hợp kiến thức/câu hỏi phỏng vấn** : (Bắt buộc xem :+1:)

- [Tổng hợp kiến thức & câu hỏi phỏng vấn Java Concurrency thường gặp (Phần 1)](./java/concurrent/java-concurrent-questions-01.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Java Concurrency thường gặp (Phần 2)](./java/concurrent/java-concurrent-questions-02.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Java Concurrency thường gặp (Phần 3)](./java/concurrent/java-concurrent-questions-03.md)

**Giải thích chi tiết các kiến thức quan trọng**：

- [Giải thích chi tiết Optimistic Lock và Pessimistic Lock](./java/concurrent/optimistic-lock-and-pessimistic-lock.md)
- [Giải thích chi tiết CAS](./java/concurrent/cas.md)
- [Giải thích chi tiết JMM（Java Memory Model）](./java/concurrent/jmm.md)
- **Thread Pool**：[Giải thích chi tiết Java Thread Pool](./java/concurrent/java-thread-pool-summary.md)、[Best Practices cho Java Thread Pool](./java/concurrent/java-thread-pool-best-practices.md)
- [Giải thích chi tiết ThreadLocal](./java/concurrent/threadlocal.md)
- [Tổng hợp các Concurrent Collections trong Java](./java/concurrent/java-concurrent-collections.md)
- [Tổng hợp các Atomic Classes](./java/concurrent/atomic-classes.md)
- [Giải thích chi tiết AQS](./java/concurrent/aqs.md)
- [Giải thích chi tiết CompletableFuture](./java/concurrent/completablefuture-intro.md)

### JVM (Bắt buộc xem :+1:)

Phần nội dung JVM chủ yếu tham khảo [Đặc tả JVM-Java8](https://docs.oracle.com/javase/specs/jvms/se8/html/index.html) và cuốn sách [《Hiểu sâu về Java Virtual Machine (Tái bản lần 3)》](https://book.douban.com/subject/34907497/) của thầy Chu Chí Minh （Rất khuyến khích đọc nhiều lần!）.

- **[Vùng nhớ Java](./java/jvm/memory-area.md)**
- **[JVM Garbage Collection](./java/jvm/jvm-garbage-collection.md)**
- [Cấu trúc tệp Class](./java/jvm/class-file-structure.md)
- **[Quá trình nạp Class](./java/jvm/class-loading-process.md)**
- [Class Loader](./java/jvm/classloader.md)
- [【Chưa hoàn thành】Tổng hợp các tham số JVM quan trọng nhất（đã dịch được một nửa）](./java/jvm/jvm-parameters-intro.md)
- [【Bổ sung】Giới thiệu JVM bằng ngôn ngữ đơn giản](./java/jvm/jvm-intro.md)
- [Công cụ giám sát và xử lý sự cố JDK](./java/jvm/jdk-monitoring-and-troubleshooting-tools.md)

### Tính năng mới

- **Java 8**：[Tổng hợp tính năng mới của Java 8（dịch）](./java/new-features/java8-tutorial-translate.md)、[Tổng hợp các tính năng mới thường dùng trong Java 8](./java/new-features/java8-common-new-features.md)
- [Tổng quan tính năng mới Java 9](./java/new-features/java9.md)
- [Tổng quan tính năng mới Java 10](./java/new-features/java10.md)
- [Tổng quan tính năng mới Java 11](./java/new-features/java11.md)
- [Tổng quan tính năng mới Java 12 & 13](./java/new-features/java12-13.md)
- [Tổng quan tính năng mới Java 14 & 15](./java/new-features/java14-15.md)
- [Tổng quan tính năng mới Java 16](./java/new-features/java16.md)
- [Tổng quan tính năng mới Java 17](./java/new-features/java17.md)
- [Tổng quan tính năng mới Java 18](./java/new-features/java18.md)
- [Tổng quan tính năng mới Java 19](./java/new-features/java19.md)
- [Tổng quan tính năng mới Java 20](./java/new-features/java20.md)
- [Tổng quan tính năng mới Java 21](./java/new-features/java21.md)
- [Tổng quan tính năng mới Java 22 & 23](./java/new-features/java22-23.md)
- [Tổng quan tính năng mới Java 24](./java/new-features/java24.md)
- [Tổng quan tính năng mới Java 25](./java/new-features/java25.md)

## Kiến thức máy tính cơ bản

### Hệ điều hành

- [Tổng hợp kiến thức & câu hỏi phỏng vấn Hệ điều hành thường gặp (Phần 1)](./cs-basics/operating-system/operating-system-basic-questions-01.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Hệ điều hành thường gặp (Phần 2)](./cs-basics/operating-system/operating-system-basic-questions-02.md)
- **Linux**：
  - [Tổng hợp kiến thức Linux cơ bản bắt buộc cho lập trình viên backend](./cs-basics/operating-system/linux-intro.md)
  - [Tổng hợp kiến thức cơ bản về Shell Programming](./cs-basics/operating-system/shell-intro.md)

### Mạng máy tính

**Tổng hợp kiến thức/câu hỏi phỏng vấn**：

- [Tổng hợp kiến thức & câu hỏi phỏng vấn Mạng máy tính thường gặp (Phần 1)](./cs-basics/network/other-network-questions.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Mạng máy tính thường gặp (Phần 2)](./cs-basics/network/other-network-questions2.md)
- [Tổng kết nội dung sách《Mạng máy tính》của thầy Tạ Hi Nhân（bổ sung）](./cs-basics/network/computer-network-xiexiren-summary.md)

**Giải thích chi tiết các kiến thức quan trọng**：

- [Giải thích chi tiết mô hình phân lớp OSI và TCP/IP（cơ bản）](./cs-basics/network/osi-and-tcp-ip-model.md)
- [Tổng hợp các giao thức phổ biến ở tầng ứng dụng](./cs-basics/network/application-layer-protocol.md)
- [HTTP vs HTTPS（tầng ứng dụng）](./cs-basics/network/http-vs-https.md)
- [HTTP 1.0 vs HTTP 1.1（tầng ứng dụng）](./cs-basics/network/http1.0-vs-http1.1.md)
- [Các mã trạng thái HTTP phổ biến（tầng ứng dụng）](./cs-basics/network/http-status-codes.md)
- [Giải thích chi tiết DNS（tầng ứng dụng）](./cs-basics/network/dns.md)
- [Bắt tay 3 bước và kết thúc 4 bước TCP（tầng vận chuyển）](./cs-basics/network/tcp-connection-and-disconnection.md)
- [Đảm bảo độ tin cậy truyền tải TCP（tầng vận chuyển）](./cs-basics/network/tcp-reliability-guarantee.md)
- [Giải thích chi tiết giao thức ARP（tầng mạng）](./cs-basics/network/arp.md)
- [Giải thích chi tiết giao thức NAT（tầng mạng）](./cs-basics/network/nat.md)
- [Tổng hợp các hình thức tấn công mạng phổ biến（bảo mật）](./cs-basics/network/network-attack-means.md)

### Cấu trúc dữ liệu

**Minh họa trực quan cấu trúc dữ liệu:**

- [Cấu trúc dữ liệu tuyến tính: Mảng, Danh sách liên kết, Stack, Queue](./cs-basics/data-structure/linear-data-structure.md)
- [Đồ thị](./cs-basics/data-structure/graph.md)
- [Heap](./cs-basics/data-structure/heap.md)
- [Cây](./cs-basics/data-structure/tree.md)：Tập trung vào [Cây đỏ-đen](./cs-basics/data-structure/red-black-tree.md), cây B-, B+, B\*, LSM Tree

Các cấu trúc dữ liệu thường dùng khác:

- [Bloom Filter](./cs-basics/data-structure/bloom-filter.md)

### Thuật toán

Phần thuật toán rất quan trọng. Nếu bạn không biết cách học thuật toán, có thể xem:

- [Gợi ý sách + tài nguyên học thuật toán](https://www.zhihu.com/question/323359308/answer/1545320858).
- [Làm thế nào để luyện Leetcode?](https://www.zhihu.com/question/31092580/answer/1534887374)

**Tổng hợp các bài toán thuật toán phổ biến**：

- [Tổng hợp một số bài toán thuật toán chuỗi phổ biến](./cs-basics/algorithms/string-algorithm-problems.md)
- [Tổng hợp một số bài toán thuật toán danh sách liên kết phổ biến](./cs-basics/algorithms/linkedlist-algorithm-problems.md)
- [Một số bài lập trình trong Kiếm chỉ Offer](./cs-basics/algorithms/the-sword-refers-to-offer.md)
- [10 thuật toán sắp xếp cổ điển](./cs-basics/algorithms/10-classical-sorting-algorithms.md)

Ngoài ra, trang web [GeeksforGeeks](https://www.geeksforgeeks.org/fundamentals-of-algorithms/) tổng hợp các thuật toán phổ biến khá toàn diện và có hệ thống.

[![Banner](https://oss.javaguide.cn/xingqiu/xingqiu.png)](./about-the-author/zhishixingqiu-two-years.md)

## Cơ sở dữ liệu

### Cơ bản

- [Tổng hợp kiến thức cơ bản về cơ sở dữ liệu](./database/basis.md)
- [Tổng hợp kiến thức cơ bản về NoSQL](./database/nosql.md)
- [Giải thích chi tiết bộ ký tự](./database/character-set.md)
- SQL:
  - [Tổng hợp kiến thức cơ bản về cú pháp SQL](./database/sql/sql-syntax-summary.md)
  - [Tổng hợp các câu hỏi phỏng vấn SQL phổ biến](./database/sql/sql-questions-01.md)

### MySQL

**Tổng hợp kiến thức/câu hỏi phỏng vấn:**

- **[Tổng hợp kiến thức & câu hỏi phỏng vấn MySQL thường gặp](./database/mysql/mysql-questions-01.md)** (Bắt buộc xem :+1:)
- [Tổng hợp gợi ý tối ưu hóa hiệu suất cao MySQL](./database/mysql/mysql-high-performance-optimization-specification-recommendations.md)

**Kiến thức quan trọng:**

- [Giải thích chi tiết MySQL Index](./database/mysql/mysql-index.md)
- [Tổng hợp các tình huống index không hoạt động trong MySQL](./database/mysql/mysql-index-invalidation.md)
- [Giải thích chi tiết mức độ cô lập transaction trong MySQL](./database/mysql/transaction-isolation-level.md)
- [Giải thích chi tiết 3 loại log MySQL (binlog, redo log và undo log)](./database/mysql/mysql-logs.md)
- [Cách InnoDB Storage Engine triển khai MVCC](./database/mysql/innodb-implementation-of-mvcc.md)
- [Quá trình thực thi câu lệnh SQL trong MySQL](./database/mysql/how-sql-executed-in-mysql.md)
- [Giải thích chi tiết Query Cache trong MySQL](./database/mysql/mysql-query-cache.md)
- [Phân tích Execution Plan trong MySQL](./database/mysql/mysql-query-execution-plan.md)
- [Primary key tự tăng trong MySQL có luôn liên tục không?](./database/mysql/mysql-auto-increment-primary-key-continuous.md)
- [Gợi ý lưu trữ dữ liệu kiểu thời gian trong MySQL](./database/mysql/some-thoughts-on-database-storage-time.md)
- [Implicit conversion trong MySQL gây index không hoạt động](./database/mysql/index-invalidation-caused-by-implicit-conversion.md)

### Redis

**Tổng hợp kiến thức/câu hỏi phỏng vấn** : (Bắt buộc xem :+1: )：

- [Tổng hợp kiến thức & câu hỏi phỏng vấn Redis thường gặp (Phần 1)](./database/redis/redis-questions-01.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Redis thường gặp (Phần 2)](./database/redis/redis-questions-02.md)

**Kiến thức quan trọng:**

- [Giải thích chi tiết 3 chiến lược đọc/ghi cache phổ biến](./database/redis/3-commonly-used-cache-read-and-write-strategies.md)
- [Redis có thể làm Message Queue không? Làm thế nào?](./database/redis/redis-stream-mq.md)
- [Giải thích chi tiết 5 kiểu dữ liệu cơ bản trong Redis](./database/redis/redis-data-structures-01.md)
- [Giải thích chi tiết 3 kiểu dữ liệu đặc biệt trong Redis](./database/redis/redis-data-structures-02.md)
- [Giải thích chi tiết cơ chế Persistence trong Redis](./database/redis/redis-persistence.md)
- [Giải thích chi tiết Memory Fragmentation trong Redis](./database/redis/redis-memory-fragmentation.md)
- [Tổng hợp các nguyên nhân blocking phổ biến trong Redis](./database/redis/redis-common-blocking-problems-summary.md)
- [Giải thích chi tiết Redis Cluster](./database/redis/redis-cluster.md)

### MongoDB

- [Tổng hợp kiến thức & câu hỏi phỏng vấn MongoDB thường gặp (Phần 1)](./database/mongodb/mongodb-questions-01.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn MongoDB thường gặp (Phần 2)](./database/mongodb/mongodb-questions-02.md)

## Search Engine (Công cụ tìm kiếm)

[Tổng hợp câu hỏi phỏng vấn Elasticsearch phổ biến (trả phí)](./database/elasticsearch/elasticsearch-questions-01.md)

![JavaGuide Official Public Account](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)

## Công cụ phát triển

### Maven

- [Tổng hợp các khái niệm cốt lõi về Maven](./tools/maven/maven-core-concepts.md)
- [Best Practices Maven](./tools/maven/maven-best-practices.md)

### Gradle

[Tổng hợp các khái niệm cốt lõi về Gradle](./tools/gradle/gradle-core-concepts.md)（Tùy chọn, hiện tại ở trong nước Maven vẫn phổ biến hơn）

### Docker

- [Tổng hợp các khái niệm cốt lõi về Docker](./tools/docker/docker-intro.md)
- [Thực chiến Docker](./tools/docker/docker-in-action.md)

### Git

- [Tổng hợp các khái niệm cốt lõi về Git](./tools/git/git-intro.md)
- [Tổng hợp các mẹo hữu ích trên GitHub](./tools/git/github-tips.md)

## Thiết kế hệ thống

- [⭐Tổng hợp câu hỏi phỏng vấn System Design phổ biến](./system-design/system-design-questions.md)
- [⭐Tổng hợp câu hỏi phỏng vấn Design Patterns phổ biến](https://interview.javaguide.cn/system-design/design-pattern.html)

### Cơ bản

- [Hướng dẫn ngắn gọn về RESTful API](./system-design/basis/RESTfulAPI.md)
- [Hướng dẫn ngắn gọn về Software Engineering](./system-design/basis/software-engineering.md)
- [Hướng dẫn đặt tên code](./system-design/basis/naming.md)
- [Hướng dẫn tái cấu trúc code](./system-design/basis/refactoring.md)
- [Hướng dẫn Unit Test](./system-design/basis/unit-test.md)

### Các Framework thường dùng

#### Spring/SpringBoot (Bắt buộc xem :+1:)

**Tổng hợp kiến thức/câu hỏi phỏng vấn** :

- [Tổng hợp kiến thức & câu hỏi phỏng vấn Spring thường gặp](./system-design/framework/spring/spring-knowledge-and-questions-summary.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn SpringBoot thường gặp](./system-design/framework/spring/springboot-knowledge-and-questions-summary.md)
- [Tổng hợp các annotation thường dùng trong Spring/Spring Boot](./system-design/framework/spring/spring-common-annotations.md)
- [Hướng dẫn nhập môn SpringBoot](https://github.com/Snailclimb/springboot-guide)

**Giải thích chi tiết các kiến thức quan trọng**：

- [Giải thích chi tiết IoC & AOP（hiểu nhanh）](./system-design/framework/spring/ioc-and-aop.md)
- [Giải thích chi tiết Spring Transaction](./system-design/framework/spring/spring-transaction.md)
- [Giải thích chi tiết Design Patterns trong Spring](./system-design/framework/spring/spring-design-patterns-summary.md)
- [Giải thích chi tiết nguyên lý Auto Configuration trong SpringBoot](./system-design/framework/spring/spring-boot-auto-assembly-principles.md)

#### MyBatis

[Tổng hợp câu hỏi phỏng vấn MyBatis phổ biến](./system-design/framework/mybatis/mybatis-interview.md)

### Bảo mật

#### Xác thực & Phân quyền

- [Giải thích chi tiết các khái niệm cơ bản về xác thực và phân quyền](./system-design/security/basis-of-authority-certification.md)
- [Giải thích chi tiết các khái niệm cơ bản về JWT](./system-design/security/jwt-intro.md)
- [Phân tích ưu nhược điểm của JWT và giải pháp cho các vấn đề phổ biến](./system-design/security/advantages-and-disadvantages-of-jwt.md)
- [Giải thích chi tiết SSO Single Sign-On](./system-design/security/sso-intro.md)
- [Giải thích chi tiết thiết kế hệ thống phân quyền](./system-design/security/design-of-authority-system.md)

#### Bảo mật dữ liệu

- [Tổng hợp các thuật toán mã hóa phổ biến](./system-design/security/encryption-algorithms.md)
- [Tổng hợp các giải pháp lọc từ nhạy cảm](./system-design/security/sentive-words-filter.md)
- [Tổng hợp các giải pháp ẩn danh hóa dữ liệu](./system-design/security/data-desensitization.md)
- [Tại sao cả frontend và backend đều cần xác thực dữ liệu](./system-design/security/data-validation.md)
- [Tại sao khi quên mật khẩu chỉ có thể đặt lại, không thể cho biết mật khẩu cũ?](./system-design/security/why-password-reset-instead-of-retrieval.md)

### Tác vụ theo lịch (Scheduled Task)

[Giải thích chi tiết Java Scheduled Task](./system-design/schedule-task.md)

### Web Real-time Message Push

[Giải thích chi tiết Web Real-time Message Push](./system-design/web-real-time-message-push.md)

## Hệ thống phân tán (Distributed)

- [⭐Câu hỏi phỏng vấn Distributed Systems tần suất cao](https://interview.javaguide.cn/distributed-system/distributed-system.html)

### Lý thuyết & Thuật toán & Giao thức

- [Giải thích lý thuyết CAP và BASE](./distributed-system/protocol/cap-and-base-theorem.md)
- [Giải thích thuật toán Paxos](./distributed-system/protocol/paxos-algorithm.md)
- [Giải thích thuật toán Raft](./distributed-system/protocol/raft-algorithm.md)
- [Giải thích giao thức ZAB](./distributed-system/protocol/zab.md)
- [Giải thích chi tiết giao thức Gossip](./distributed-system/protocol/gossip-protocol.md)
- [Giải thích chi tiết thuật toán Consistent Hashing](./distributed-system/protocol/consistent-hashing.md)

### RPC

- [Tổng hợp kiến thức cơ bản về RPC](./distributed-system/rpc/rpc-intro.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Dubbo thường gặp](./distributed-system/rpc/dubbo.md)

### ZooKeeper

> Hai bài viết này có thể có nội dung trùng lặp, khuyến khích đọc cả hai.

- [Tổng hợp các khái niệm liên quan đến ZooKeeper (Nhập môn)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-intro.md)
- [Tổng hợp các khái niệm liên quan đến ZooKeeper (Nâng cao)](./distributed-system/distributed-process-coordination/zookeeper/zookeeper-plus.md)

### API Gateway

- [Tổng hợp kiến thức cơ bản về API Gateway](./distributed-system/api-gateway.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Spring Cloud Gateway thường gặp](./distributed-system/spring-cloud-gateway-questions.md)

### Distributed ID

- [Tổng hợp kiến thức & câu hỏi phỏng vấn Distributed ID thường gặp](./distributed-system/distributed-id.md)
- [Hướng dẫn thiết kế Distributed ID](./distributed-system/distributed-id-design.md)

### Distributed Lock

- [Giới thiệu về Distributed Lock](https://javaguide.cn/distributed-system/distributed-lock.html)
- [Tổng hợp các giải pháp triển khai Distributed Lock phổ biến](https://javaguide.cn/distributed-system/distributed-lock-implementations.html)

### Distributed Transaction

[Tổng hợp kiến thức & câu hỏi phỏng vấn Distributed Transaction thường gặp](./distributed-system/distributed-transaction.md)

### Distributed Configuration Center

[Tổng hợp kiến thức & câu hỏi phỏng vấn Distributed Configuration Center thường gặp](./distributed-system/distributed-configuration-center.md)

## Hiệu suất cao (High Performance)

### Tối ưu hóa cơ sở dữ liệu

- [Phân tách đọc/ghi và sharding cơ sở dữ liệu](./high-performance/read-and-write-separation-and-library-subtable.md)
- [Phân tách dữ liệu nóng/lạnh](./high-performance/data-cold-hot-separation.md)
- [Tổng hợp các kỹ thuật tối ưu SQL phổ biến](./high-performance/sql-optimization.md)
- [Giới thiệu và gợi ý tối ưu Deep Pagination](./high-performance/deep-pagination-optimization.md)

### Load Balancing

[Tổng hợp kiến thức & câu hỏi phỏng vấn Load Balancing thường gặp](./high-performance/load-balancing.md)

### CDN

[Tổng hợp kiến thức & câu hỏi phỏng vấn CDN（Content Delivery Network）thường gặp](./high-performance/cdn.md)

### Message Queue

- [Tổng hợp kiến thức cơ bản về Message Queue](./high-performance/message-queue/message-queue.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Disruptor thường gặp](./high-performance/message-queue/disruptor-questions.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn RabbitMQ thường gặp](./high-performance/message-queue/rabbitmq-questions.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn RocketMQ thường gặp](./high-performance/message-queue/rocketmq-questions.md)
- [Tổng hợp kiến thức & câu hỏi phỏng vấn Kafka thường gặp](./high-performance/message-queue/kafka-questions-01.md)

## Khả dụng cao (High Availability)

[Hướng dẫn thiết kế hệ thống khả dụng cao](./high-availability/high-availability-system-design.md)

### Thiết kế dự phòng (Redundancy)

[Giải thích chi tiết thiết kế dự phòng](./high-availability/redundancy.md)

### Rate Limiting (Giới hạn tốc độ)

[Giải thích chi tiết Rate Limiting](./high-availability/limit-request.md)

### Degradation & Circuit Breaker

[Giải thích chi tiết Degradation & Circuit Breaker](./high-availability/fallback-and-circuit-breaker.md)

### Timeout & Retry

[Giải thích chi tiết Timeout & Retry](./high-availability/timeout-and-retry.md)

### Cluster (Cụm)

Triển khai nhiều bản sao của cùng một dịch vụ để tránh điểm lỗi đơn (single point of failure).

### Disaster Recovery và Multi-Active Deployment

**Disaster Recovery** = Khắc phục thảm họa + Sao lưu.

- **Sao lưu**：Sao lưu nhiều bản tất cả dữ liệu quan trọng do hệ thống tạo ra.
- **Khắc phục thảm họa**：Xây dựng hai hệ thống hoàn toàn giống nhau ở các địa điểm khác nhau. Khi hệ thống ở một nơi nào đó bị sự cố đột ngột, toàn bộ hệ thống ứng dụng có thể chuyển sang hệ thống kia để tiếp tục cung cấp dịch vụ bình thường.

**Multi-Active Deployment** mô tả việc triển khai dịch vụ ở nhiều địa điểm khác nhau và tất cả đều đồng thời cung cấp dịch vụ ra ngoài. Điểm khác biệt chính so với thiết kế disaster recovery truyền thống nằm ở "multi-active", tức là tất cả các site đều đồng thời cung cấp dịch vụ. Multi-Active Deployment được thiết kế để đối phó với các tình huống bất ngờ như hỏa hoạn, động đất và các thảm họa tự nhiên hay nhân tạo khác.

## Xu hướng Star

![Stars](https://api.star-history.com/svg?repos=Snailclimb/JavaGuide&type=Date)

## Tài khoản chính thức

Nếu mọi người muốn theo dõi real-time các bài viết cập nhật và các tài liệu hay mình chia sẻ, có thể quan tâm tài khoản chính thức của mình "**JavaGuide**".

![JavaGuide Official Public Account](https://oss.javaguide.cn/github/javaguide/gongzhonghaoxuanchuan.png)
