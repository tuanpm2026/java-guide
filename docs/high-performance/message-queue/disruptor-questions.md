---
title: Tổng hợp câu hỏi thường gặp về Disruptor
description: Bài viết tổng hợp kiến thức cốt lõi và các điểm quan trọng trong phỏng vấn về Disruptor - high performance in-memory queue, bao gồm kiến trúc Disruptor (RingBuffer/Sequencer/WaitStrategy), nguyên lý hiệu năng cao (lock-free design/cache line padding/pre-allocated memory), so sánh với ArrayBlockingQueue, producer-consumer pattern.
category: High Performance
tag:
  - Message Queue
head:
  - - meta
    - name: keywords
      content: Disruptor,high performance queue,RingBuffer,lock-free queue,cache line padding,LMAX,in-memory queue,Disruptor interview
---

Disruptor là một kiến thức tương đối ít phổ biến hơn, tuy nhiên nếu project của bạn có sử dụng Disruptor thì rất có thể sẽ bị hỏi trong phỏng vấn.

Một bạn trong cộng đồng trước đây đã đóng góp bài kinh nghiệm phỏng vấn (tuyển dụng xã hội) có liên quan đến một số câu hỏi về Disruptor, link bài: [Thực hiện được ước mơ! Nhận offer từ ByteDance, Taobao, Pinduoduo và các công ty lớn khác!](https://mp.weixin.qq.com/s/C5QMjwEb6pzXACqZsyqC4A).

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/disruptor-interview-questions.png)

Bài viết này có thể coi là một tổng kết đơn giản về Disruptor, mỗi câu hỏi sẽ không đi quá sâu, chủ yếu nhắm vào phỏng vấn hoặc xem nhanh về Disruptor.

## Disruptor là gì?

Disruptor là một in-memory queue mã nguồn mở hiệu năng cao, ra đời với mục đích giải quyết các vấn đề về hiệu năng và memory safety của in-memory queue, được phát triển bởi công ty giao dịch ngoại hối LMAX của Anh.

Theo giới thiệu chính thức của Disruptor, hệ thống LMAX (nền tảng giao dịch tài chính bán lẻ mới) phát triển dựa trên Disruptor có thể xử lý 6 triệu đơn hàng mỗi giây chỉ với một thread đơn. Martin Fowler đã viết một bài năm 2011 [The LMAX Architecture](https://martinfowler.com/articles/lmax.html) giới thiệu riêng về kiến trúc hệ thống LMAX này, bạn quan tâm có thể đọc bài đó.

LMAX trình bày tại QCon năm 2010, Disruptor nhận được sự chú ý của ngành và giành được Duke's Choice Awards của Oracle năm 2011.

![](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/640.png)

> "Duke's Choice Awards" nhằm tôn vinh các ứng dụng công nghệ Java có ảnh hưởng nhất do cá nhân hoặc công ty trên toàn cầu phát triển trong năm qua, do Oracle tổ chức. Giải thưởng có uy tín rất cao!

Tôi đã tìm thấy bài viết chính thức của Oracle năm đó công bố các dự án nhận Duke's Choice Awards (địa chỉ bài: <https://blogs.oracle.com/java/post/and-the-winners-arethe-dukes-choice-award>). Từ bài viết có thể thấy, cùng năm đó nhận giải thưởng này còn có Netty, JRebel và các project nổi tiếng khác.

![Duke's Choice Awards 2011 của Oracle](https://oss.javaguide.cn/javaguide/image-20211015152323898.png)

Chức năng Disruptor cung cấp tương tự như các distributed queue như Kafka, RocketMQ, nhưng phạm vi sử dụng của nó là JVM (in-memory).

- Github: <https://github.com/LMAX-Exchange/disruptor>
- Official tutorial: <https://lmax-exchange.github.io/disruptor/user-guide/index.html>

Về cách sử dụng Disruptor trong dự án Spring Boot, có thể xem bài: [Spring Boot + Disruptor thực chiến nhập môn](https://mp.weixin.qq.com/s/0iG5brK3bYF0BgSjX4jRiA).

## Tại sao dùng Disruptor?

Disruptor chủ yếu giải quyết các vấn đề về hiệu năng và memory safety của các thread-safe queue tích hợp trong JDK.

**Các thread-safe queue phổ biến trong JDK**:

| Tên Queue               | Lock                      | Có giới hạn không |
| ----------------------- | ------------------------- | ----------------- |
| `ArrayBlockingQueue`    | Có lock (`ReentrantLock`) | Có giới hạn       |
| `LinkedBlockingQueue`   | Có lock (`ReentrantLock`) | Có giới hạn       |
| `LinkedTransferQueue`   | Lock-free (`CAS`)         | Không giới hạn    |
| `ConcurrentLinkedQueue` | Lock-free (`CAS`)         | Không giới hạn    |

Từ bảng trên có thể thấy: những queue này hoặc là có lock và có giới hạn, hoặc là lock-free và không giới hạn. Queue có lock chắc chắn ảnh hưởng đến hiệu năng, còn queue không giới hạn lại có rủi ro tràn bộ nhớ.

Do đó, trong hầu hết trường hợp, không khuyến nghị dùng thread-safe queue tích hợp trong JDK.

**Disruptor thì khác! Nó có thể đảm bảo queue có giới hạn trong khi vẫn lock-free và thread-safe.**

Biểu đồ dưới đây là so sánh latency histogram của Disruptor và ArrayBlockingQueue do official website Disruptor cung cấp.

![disruptor-latency-histogram](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/disruptor-latency-histogram.png)

Disruptor thực sự rất nhanh, câu hỏi tại sao nó nhanh như vậy sẽ được giới thiệu ở phần sau.

Ngoài ra, Disruptor còn cung cấp nhiều tính năng mở rộng như hỗ trợ batch operation, hỗ trợ nhiều wait strategy.

## Kafka và Disruptor khác nhau thế nào?

- **Kafka**: Distributed message queue, thường dùng để truyền message giữa các hệ thống hoặc service, cũng có thể dùng như nền tảng xử lý stream.
- **Disruptor**: In-memory level message queue, thường dùng để truyền message giữa các thread trong một hệ thống.

## Những component nào sử dụng Disruptor?

Có khá nhiều open source project sử dụng Disruptor, đây là một vài ví dụ:

- **Log4j2**: Log4j2 là logging framework phổ biến, sử dụng Disruptor để triển khai async logging.
- **SOFATracer**: SOFATracer là công cụ distributed application link tracing mã nguồn mở của Ant Financial, sử dụng Disruptor để triển khai async logging.
- **Storm**: Storm là distributed real-time computing system mã nguồn mở, sử dụng Disruptor để triển khai message passing xảy ra trong worker process (giữa các thread trên cùng một Storm node, không cần network communication).
- **HBase**: HBase là distributed columnar storage database system, sử dụng Disruptor để cải thiện write concurrency performance.
- ……

## Các khái niệm cốt lõi của Disruptor là gì?

- **Event**: Có thể hiểu Event là message object lưu trong queue chờ được consume.
- **EventFactory**: Event factory dùng để tạo event, cần dùng khi khởi tạo class `Disruptor`.
- **EventHandler**: Event được xử lý trong Handler tương ứng, có thể hiểu là Consumer trong mô hình producer-consumer.
- **EventProcessor**: EventProcessor giữ Sequence của consumer cụ thể và cung cấp event loop để gọi event handling implementation.
- **Disruptor**: Cần dùng đối tượng `Disruptor` để sản xuất và tiêu thụ event.
- **RingBuffer**: RingBuffer (mảng vòng) dùng để lưu event.
- **WaitStrategy**: Wait strategy. Quyết định cách event consumer chờ event mới đến khi không có event nào để consume.
- **Producer**: Producer, chỉ đơn giản là chỉ user code gọi đối tượng `Disruptor` để publish event, Disruptor không định nghĩa interface hay type cụ thể.
- **ProducerType**: Chỉ định mode single event publisher hay multiple event publisher (publisher và producer có ý nghĩa tương tự, cá nhân tôi thích dùng publisher hơn).
- **Sequencer**: Sequencer là core thực sự của Disruptor. Interface này có hai implementation class `SingleProducerSequencer`, `MultiProducerSequencer`, chúng định nghĩa concurrent algorithm để truyền data nhanh chóng và chính xác giữa producer và consumer.

Hình ảnh dưới đây trích từ official website Disruptor, thể hiện ví dụ hệ thống LMAX sử dụng Disruptor.

![Ví dụ hệ thống LMAX sử dụng Disruptor](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/disruptor-models.png)

## Disruptor có những wait strategy nào?

**Wait strategy** quyết định cách event consumer chờ event mới đến khi không có event nào để consume.

Các wait strategy phổ biến bao gồm:

![Disruptor wait strategies](https://oss.javaguide.cn/github/javaguide/high-performance/message-queue/DisruptorWaitStrategy.png)

- `BlockingWaitStrategy`: Triển khai dựa trên `ReentrantLock`+`Condition` để thực hiện wait và wake-up, code implementation rất đơn giản, là wait strategy mặc định của Disruptor. Mặc dù chậm nhất nhưng cũng là lựa chọn sử dụng CPU thấp nhất và ổn định nhất — khuyến nghị dùng cho production environment.
- `BusySpinWaitStrategy`: Hiệu năng rất tốt, có rủi ro spin liên tục, dùng không đúng cách sẽ gây CPU load 100%, cần thận trọng.
- `LiteBlockingWaitStrategy`: Wait strategy nhẹ hơn dựa trên `BlockingWaitStrategy`, bỏ qua wake-up operation khi không có lock contention, nhưng tác giả nói chưa test đủ nên không khuyến nghị.
- `TimeoutBlockingWaitStrategy`: Wait strategy có timeout, sau khi timeout sẽ thực thi business logic do người dùng chỉ định.
- `LiteTimeoutBlockingWaitStrategy`: Strategy dựa trên `TimeoutBlockingWaitStrategy`, bỏ qua wake-up operation khi không có lock contention.
- `SleepingWaitStrategy`: Strategy 3 giai đoạn: giai đoạn 1 spin, giai đoạn 2 thực thi Thread.yield nhường CPU, giai đoạn 3 sleep một khoảng thời gian rồi lặp lại.
- `YieldingWaitStrategy`: Strategy 2 giai đoạn: giai đoạn 1 spin, giai đoạn 2 thực thi Thread.yield nhường CPU.
- `PhasedBackoffWaitStrategy`: Strategy 4 giai đoạn: giai đoạn 1 spin số lần chỉ định, giai đoạn 2 spin thời gian chỉ định, giai đoạn 3 thực thi `Thread.yield` nhường CPU, giai đoạn 4 gọi phương thức `waitFor` của member variable, member variable này có thể được đặt là một trong ba: `BlockingWaitStrategy`, `LiteBlockingWaitStrategy`, `SleepingWaitStrategy`.

## Tại sao Disruptor nhanh như vậy?

- **RingBuffer (mảng vòng)**: RingBuffer bên trong Disruptor được triển khai bằng mảng. Vì tất cả các phần tử trong mảng này được tạo một lần khi khởi tạo, các địa chỉ bộ nhớ của chúng thường liền kề. Lợi ích là khi producer liên tục chèn các event object mới vào RingBuffer, địa chỉ bộ nhớ của các event object đó có thể duy trì liền kề, từ đó tận dụng cache locality principle của CPU, load cùng lúc các event object liền kề vào cache, cải thiện hiệu năng chương trình. Điều này tương tự như pre-read mechanism của MySQL, pre-read vài page liên tiếp vào memory. Ngoài ra, RingBuffer dựa trên mảng còn hỗ trợ batch operation (xử lý nhiều phần tử cùng lúc), tránh được việc phân bổ bộ nhớ và garbage collection thường xuyên (RingBuffer là mảng có kích thước cố định, khi thêm phần tử mới vào mảng đã đầy, phần tử mới sẽ ghi đè phần tử cũ nhất).
- **Tránh false sharing**: CPU cache được quản lý bên trong theo Cache Line (dòng cache), thường một Cache Line có kích thước khoảng 64 byte. Để đảm bảo trường target độc chiếm một Cache Line, Disruptor thêm padding byte trước và sau trường target (56 byte trước và 56 byte sau), điều này tránh được vấn đề false sharing của Cache Line. Đồng thời, để mảng lưu dữ liệu của RingBuffer độc chiếm cache line, mảng được thiết kế là invalid padding (128 byte) + valid data.
- **Lock-free design**: Disruptor sử dụng lock-free design, tránh được contention và latency do cơ chế lock truyền thống gây ra. Lock-free implementation của Disruptor khá phức tạp, chủ yếu dựa trên CAS, Memory Barrier và RingBuffer.

Tóm lại, lý do Disruptor có thể nhanh như vậy là do tác động tổng hợp của một loạt optimization strategy, vừa tận dụng đầy đủ đặc điểm của cấu trúc CPU cache hiện đại, vừa tránh được các vấn đề concurrency và performance bottleneck phổ biến.

Để tìm hiểu chi tiết hơn về nguyên lý high-performance queue của Disruptor, có thể xem bài: [Phân tích sơ bộ nguyên lý high-performance queue Disruptor](https://qin.news/disruptor/) (tham khảo từ bài [High-performance queue - Disruptor](https://tech.meituan.com/2016/11/18/disruptor.html) của Meituan Technical Team).

🌈 Bổ sung thêm một điểm: **Tại sao địa chỉ bộ nhớ của các phần tử trong mảng liền kề có thể cải thiện hiệu năng?**

CPU cache được thực hiện bằng cách lưu data được sử dụng gần đây vào high-speed cache để đạt tốc độ đọc nhanh hơn, và sử dụng prefetch mechanism để load trước data từ memory liền kề nhằm tận dụng locality principle.

Trong hệ thống máy tính, CPU chủ yếu truy cập high-speed cache và memory. High-speed cache là loại memory tốc độ rất nhanh, dung lượng tương đối nhỏ, thường được chia thành nhiều cấp, trong đó L1, L2, L3 lần lượt là first level cache, second level cache, third level cache. Cache càng gần CPU thì tốc độ càng nhanh, dung lượng cũng nhỏ hơn. Ngược lại, memory có dung lượng tương đối lớn nhưng tốc độ chậm hơn.

![CPU cache model diagram](https://oss.javaguide.cn/github/javaguide/java/concurrent/cpu-cache.png)

Để tăng tốc quá trình đọc data, CPU sẽ load data từ memory vào high-speed cache trước, nếu lần sau cần truy cập cùng data đó có thể đọc trực tiếp từ high-speed cache mà không cần truy cập memory lần nữa. Đây gọi là **cache hit**. Ngoài ra, để tận dụng **locality principle**, CPU còn prefetch data từ memory liền kề dựa trên địa chỉ memory đã truy cập trước đó, vì trong chương trình các địa chỉ memory liên tiếp thường được truy cập thường xuyên, điều này có thể cải thiện cache hit rate, từ đó cải thiện hiệu năng chương trình.

## Tài liệu tham khảo

- Disruptor high-performance - Wait strategy: <<http://wuwenliang.net/2022/02/28/Disruptor> high-performance - Wait strategy/>
- 《Java Concurrency in Practice》 - 40 | Case Analysis (3): High-performance queue Disruptor: <https://time.geekbang.org/column/article/98134>

<!-- @include: @article-footer.snippet.md -->
