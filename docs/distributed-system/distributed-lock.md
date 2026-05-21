---
title: Giới thiệu cơ bản về Distributed Lock
category: Distributed
description: Giải thích chi tiết các khái niệm cơ bản về distributed lock, giải thích tại sao cần distributed lock, các đặc tính cốt lõi của distributed lock (mutual exclusion, deadlock prevention, reentrancy), phân tích các tình huống sử dụng phổ biến (flash sale, inventory deduction).
tag:
  - Distributed Lock
head:
  - - meta
    - name: keywords
      content: distributed lock,giới thiệu distributed lock,tại sao cần distributed lock,tình huống sử dụng distributed lock,flash sale overselling,câu hỏi phỏng vấn distributed lock
---

<!-- @include: @small-advertisement.snippet.md -->

Trên mạng có rất nhiều bài về distributed lock. Tôi viết một phiên bản tương đối ngắn gọn và dễ hiểu — đủ dùng cho phỏng vấn và công việc.

Bài này trước tiên giới thiệu các khái niệm cơ bản về distributed lock.

## Tại sao cần Distributed Lock?

Trong môi trường đa luồng, nếu nhiều thread đồng thời truy cập shared resource (ví dụ tồn kho hàng hóa, đơn đặt món), sẽ xảy ra data race — có thể dẫn đến dirty data hoặc vấn đề hệ thống, đe dọa hoạt động bình thường của chương trình.

Ví dụ: Giả sử có 100 user tham gia một flash sale giới hạn thời gian. Mỗi user chỉ mua được 1 sản phẩm, và số lượng sản phẩm chỉ có 3. Nếu không kiểm soát truy cập mutual exclusion vào shared resource, có thể xảy ra:

- Thread 1, 2, 3 và nhiều thread khác cùng vào method flash sale, mỗi thread tương ứng một user.
- Thread 1 query số lượng user đã mua — phát hiện user chưa mua và tồn kho còn 1 cái, nên cho rằng có thể tiếp tục flow flash sale.
- Thread 2 cũng query số lượng user đã mua — phát hiện user chưa mua và tồn kho còn 1 cái, nên cho rằng có thể tiếp tục flow flash sale.
- Thread 1 tiếp tục thực thi, giảm tồn kho 1 cái, trả về success.
- Thread 2 tiếp tục thực thi, giảm tồn kho 1 cái, trả về success.
- Lúc này đã xảy ra vấn đề overselling — sản phẩm bị bán thêm một cái.

![Vấn đề xảy ra khi shared resource không được mutual exclusion](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/oversold-without-locking.png)

Để đảm bảo shared resource được truy cập an toàn, cần dùng mutual exclusion operation để bảo vệ shared resource — tức chỉ cho phép một thread truy cập shared resource tại một thời điểm, các thread khác phải chờ thread hiện tại release mới được truy cập. Như vậy có thể tránh data race và dirty data, đảm bảo tính đúng đắn và ổn định của chương trình.

**Làm thế nào để triển khai mutual exclusion access cho shared resource?** Lock là một giải pháp khá phổ quát — cụ thể hơn là pessimistic lock.

Pessimistic lock luôn giả định tình huống xấu nhất, cho rằng mỗi lần shared resource được truy cập sẽ xảy ra vấn đề (ví dụ data chia sẻ bị modify). Nên mỗi khi thực hiện thao tác lấy resource đều lock lại. Các thread khác muốn lấy resource này sẽ bị block cho đến khi lock được người giữ trước đó release. **Shared resource mỗi lần chỉ cho một thread dùng, các thread khác block, dùng xong thì chuyển resource cho thread khác**.

Với single machine multi-threading, trong Java, chúng ta thường dùng **local lock** tích hợp sẵn trong JDK như lớp `ReentrantLock`, keyword `synchronized` để kiểm soát truy cập của nhiều thread trong một JVM process vào local shared resource.

Dưới đây là sơ đồ minh họa local lock của tôi.

![Local lock](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/jvm-local-lock.png)

Từ hình có thể thấy, các thread truy cập shared resource là mutual exclusion — tại một thời điểm chỉ có một thread có thể lấy local lock để truy cập shared resource.

Trong distributed system, các service/client khác nhau thường chạy trong JVM process độc lập. Nếu nhiều JVM process chia sẻ cùng một resource, dùng local lock sẽ không thể triển khai mutual exclusion access cho resource. Do đó, **distributed lock** ra đời.

Ví dụ: Order service của hệ thống được deploy 3 bản, đều cung cấp service ra ngoài. Trước khi user đặt hàng cần kiểm tra tồn kho. Để ngăn overselling, cần lock để triển khai synchronized access cho thao tác kiểm tra tồn kho. Vì order service nằm trong các JVM process khác nhau, local lock không thể hoạt động bình thường trong tình huống này. Cần dùng distributed lock — như vậy dù các thread không ở cùng JVM process vẫn có thể lấy cùng một lock, từ đó triển khai mutual exclusion access cho shared resource.

Dưới đây là sơ đồ minh họa distributed lock của tôi.

![Distributed Lock](https://oss.javaguide.cn/github/javaguide/distributed-system/distributed-lock/distributed-lock.png)

Từ hình có thể thấy, các thread trong các process độc lập này truy cập shared resource là mutual exclusion — tại một thời điểm chỉ có một thread có thể lấy distributed lock để truy cập shared resource.

## Distributed Lock cần đáp ứng những điều kiện nào?

Một distributed lock cơ bản nhất cần thỏa:

- **Mutual exclusion**: Tại bất kỳ thời điểm nào, lock chỉ được giữ bởi một thread.
- **High availability**: Lock service là high availability. Khi một lock service gặp vấn đề, có thể tự động switch sang lock service khác. Hơn nữa, ngay cả khi logic release lock của client gặp vấn đề, lock cuối cùng nhất định cũng sẽ được release — không ảnh hưởng đến thread khác truy cập shared resource. Điều này thường được triển khai thông qua timeout mechanism.
- **Reentrancy**: Một node sau khi lấy được lock có thể lấy lại lock.

Ngoài ba điều kiện cơ bản trên, một distributed lock tốt còn cần đáp ứng:

- **High performance**: Thao tác lấy và release lock phải hoàn thành nhanh, không gây ảnh hưởng quá lớn đến hiệu năng toàn hệ thống.
- **Non-blocking**: Nếu không lấy được lock, không thể chờ vô thời hạn — tránh ảnh hưởng đến hoạt động bình thường của hệ thống.

## Các cách triển khai Distributed Lock phổ biến là gì?

Các phương án triển khai distributed lock phổ biến:

- Triển khai distributed lock dựa trên RDBMS như MySQL.
- Triển khai distributed lock dựa trên distributed coordination service ZooKeeper.
- Triển khai distributed lock dựa trên distributed key-value storage system như Redis, Etcd.

Cách dùng RDBMS thường thông qua unique index hoặc exclusive lock. Tuy nhiên, thường không dùng cách này vì có quá nhiều vấn đề như hiệu năng kém, không có cơ chế lock expiration.

Hai cách triển khai distributed lock dựa trên ZooKeeper hoặc Redis được dùng nhiều hơn. Tôi đã viết một bài riêng để giới thiệu chi tiết hai phương án này: [Tổng hợp các phương án triển khai Distributed Lock phổ biến](./distributed-lock-implementations.md).

## Tổng kết

Bài này chủ yếu giới thiệu:

- Công dụng của distributed lock: Trong distributed system, các service/client khác nhau thường chạy trong JVM process độc lập. Nếu nhiều JVM process chia sẻ cùng một resource, dùng local lock không thể triển khai mutual exclusion access cho resource.
- Điều kiện distributed lock cần đáp ứng: Mutual exclusion, high availability, reentrancy, high performance, non-blocking.
- Các cách triển khai distributed lock phổ biến: RDBMS như MySQL, distributed coordination service ZooKeeper, distributed key-value storage system như Redis, Etcd.

<!-- @include: @article-footer.snippet.md -->
