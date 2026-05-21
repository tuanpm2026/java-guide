---
title: Tổng hợp câu hỏi phỏng vấn Redis thường gặp (Phần 1)
description: Tổng hợp câu hỏi phỏng vấn Redis mới nhất (Phần 1)：Giải thích chuyên sâu về cơ bản Redis, năm cấu trúc dữ liệu thường dùng, nguyên lý mô hình đơn luồng, cơ chế persistence, chiến lược quản lý bộ nhớ và xóa dữ liệu hết hạn, distributed lock và message queue. Phù hợp với developer đang chuẩn bị phỏng vấn backend!
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis面试题,Redis基础,Redis数据结构,Redis线程模型,Redis持久化,Redis内存管理,Redis性能优化,Redis分布式锁,Redis消息队列,Redis延时队列,Redis缓存策略,Redis单线程,Redis多线程,Redis过期策略,Redis淘汰策略
---

<!-- @include: @small-advertisement.snippet.md -->

## Cơ bản về Redis

### Redis là gì?

[Redis](https://redis.io/) (**RE**mote **DI**ctionary **S**erver) là một cơ sở dữ liệu NoSQL mã nguồn mở được phát triển dựa trên ngôn ngữ C (giấy phép BSD). Khác với cơ sở dữ liệu truyền thống, dữ liệu của Redis được lưu trong bộ nhớ (in-memory database, hỗ trợ persistence), do đó tốc độ đọc ghi rất nhanh, được ứng dụng rộng rãi trong lĩnh vực distributed cache. Ngoài ra, Redis lưu trữ dữ liệu dạng cặp key-value (KV).

Để đáp ứng các tình huống nghiệp vụ khác nhau, Redis tích hợp sẵn nhiều kiểu dữ liệu (ví dụ String, Hash, Sorted Set, Bitmap, HyperLogLog, GEO). Ngoài ra, Redis còn hỗ trợ transaction, persistence, Lua script, mô hình publish/subscribe, nhiều cluster scheme sẵn dùng (Redis Sentinel, Redis Cluster).

![Tổng quan kiểu dữ liệu Redis](/images/github/javaguide/database/redis/redis-overview-of-data-types-2023-09-28.jpg)

Redis không có dependency bên ngoài, Linux và OS X là hai hệ điều hành được test nhiều nhất trong quá trình phát triển Redis, chính thức khuyến nghị deploy Redis trên Linux trong môi trường production.

Để học cá nhân, bạn có thể tự cài Redis trên máy hoặc dùng [môi trường Redis online](https://try.redis.io/) do trang web chính thức Redis cung cấp (một số lệnh không thể dùng) để trải nghiệm Redis thực tế.

![try-redis](/images/github/javaguide/database/redis/try.redis.io.png)

Có rất nhiều website trên toàn thế giới sử dụng Redis, [techstacks.io](https://techstacks.io/) chuyên duy trì một [danh sách các trang web phổ biến sử dụng Redis](https://techstacks.io/tech/redis), nếu quan tâm có thể xem qua.

### ⭐️Tại sao Redis nhanh như vậy?

Redis đã thực hiện rất nhiều tối ưu hóa hiệu năng nội tại, 4 điểm quan trọng nhất như sau:

1. **Hoạt động thuần bộ nhớ (Memory-Based Storage)**: Đây là lý do chính. Các thao tác đọc ghi dữ liệu của Redis đều diễn ra trong bộ nhớ, tốc độ truy cập ở mức nanosecond, trong khi cơ sở dữ liệu truyền thống thường xuyên đọc ghi đĩa ở mức millisecond, hai bên chênh nhau nhiều bậc độ lớn.
2. **Mô hình I/O hiệu quả (I/O Multiplexing & Single-Threaded Event Loop)**: Redis sử dụng event loop đơn luồng kết hợp kỹ thuật I/O multiplexing, cho phép một luồng duy nhất xử lý đồng thời các sự kiện I/O (như đọc ghi) trên nhiều kết nối mạng, tránh được vấn đề context switching và lock contention trong mô hình đa luồng. Mặc dù là đơn luồng, nhưng kết hợp tính hiệu quả của thao tác bộ nhớ và I/O multiplexing, Redis có thể dễ dàng xử lý lượng lớn request đồng thời (mô hình luồng Redis sẽ được giới thiệu chi tiết ở phần sau).
3. **Cấu trúc dữ liệu nội tại được tối ưu (Optimized Data Structures)**: Redis cung cấp nhiều kiểu dữ liệu (như String, List, Hash, Set, Sorted Set, v.v.), cài đặt nội tại sử dụng phương thức encoding được tối ưu cao (như ziplist, quicklist, skiplist, hashtable, v.v.). Redis sẽ tự động chọn encoding nội tại phù hợp nhất dựa trên kích thước và kiểu dữ liệu, để đạt được sự cân bằng tốt nhất giữa hiệu năng và hiệu quả không gian.
4. **Giao thức truyền thông đơn giản và hiệu quả (Simple Protocol - RESP)**: Redis sử dụng giao thức RESP (REdis Serialization Protocol) do chính nó thiết kế. Giao thức này cài đặt đơn giản, hiệu năng parse tốt, và là binary safe. Chi phí serialize/deserialize giao tiếp giữa client và server rất nhỏ, giúp nâng cao tốc độ tương tác tổng thể.

> Hình ảnh dưới đây tóm tắt khá tốt, chia sẻ tại đây, nguồn từ [Why is Redis so fast?](https://twitter.com/alexxubyte/status/1498703822528544770).

![why-redis-so-fast](/images/github/javaguide/database/redis/why-redis-so-fast.png)

Vậy đã nhanh như vậy rồi, tại sao không dùng Redis làm cơ sở dữ liệu chính? Chủ yếu là do chi phí bộ nhớ quá cao, và persistence dữ liệu của Redis vẫn có rủi ro mất dữ liệu.

### Ngoài Redis, bạn còn biết các giải pháp distributed cache nào khác không?

Nếu bị hỏi câu này trong phỏng vấn, người phỏng vấn chủ yếu muốn xem:

1. Khi bạn chọn Redis là giải pháp distributed cache, liệu bạn có trải qua quá trình nghiên cứu và suy nghĩ nghiêm túc, hay chỉ đơn giản vì Redis là công nghệ "hot trend" hiện tại.
2. Chiều rộng kỹ thuật của bạn trong lĩnh vực distributed cache.

Nếu bạn biết các giải pháp khác, và có thể giải thích tại sao cuối cùng chọn Redis (thêm một bậc nữa!), điều này sẽ được cộng điểm không ít trong buổi phỏng vấn!

Dưới đây nói sơ qua về lựa chọn công nghệ distributed cache phổ biến.

Về distributed cache, loại lâu đời đồng thời cũng được dùng nhiều nhất vẫn là **Memcached** và **Redis**. Tuy nhiên, hiện tại hầu như không thấy dự án nào còn dùng **Memcached** để làm cache, đều dùng trực tiếp **Redis**.

Memcached là thứ khá phổ biến vào thời điểm distributed cache bắt đầu nổi lên. Sau này, với sự phát triển của Redis, mọi người dần chuyển sang dùng Redis mạnh mẽ hơn.

Một số công ty lớn cũng open source cơ sở dữ liệu KV hiệu năng cao phân tán tương tự Redis, ví dụ như [**Tendis**](https://github.com/Tencent/Tendis) được Tencent open source. Tendis dựa trên dự án mã nguồn mở nổi tiếng [RocksDB](https://github.com/facebook/rocksdb) làm storage engine, tương thích 100% với giao thức Redis và tất cả mô hình dữ liệu Redis 4.0. Về so sánh Redis và Tendis, Tencent từng đăng một bài viết: [Redis vs Tendis: Giải mã kiến trúc hot-cold hybrid storage](https://mp.weixin.qq.com/s/MeYkfOIdnU6LYlsGb24KjQ), có thể tham khảo sơ qua.

Tuy nhiên, nhìn vào lịch sử commit Github của project Tendis, có thể thấy phiên bản open source của Tendis hầu như không còn được maintain cập nhật, thêm vào đó sự chú ý của cộng đồng không cao, công ty sử dụng cũng ít. Vì vậy, không khuyến nghị bạn dùng Tendis để triển khai distributed cache.

Hiện tại, các sản phẩm thay thế Redis được công nhận trong ngành vẫn là hai distributed cache mã nguồn mở sau (đều nổi lên nhờ "bám" vào Redis):

- [Dragonfly](https://github.com/dragonflydb/dragonfly): Một in-memory database được xây dựng cho nhu cầu workload của ứng dụng hiện đại, hoàn toàn tương thích với API của Redis và Memcached, không cần chỉnh sửa code khi migrate, tự xưng là in-memory database nhanh nhất thế giới.
- [KeyDB](https://github.com/Snapchat/KeyDB): Một nhánh hiệu năng cao của Redis, tập trung vào đa luồng, hiệu quả bộ nhớ và throughput cao.

Tuy nhiên, cá nhân tôi vẫn khuyến nghị ưu tiên chọn Redis cho distributed cache, dù sao cũng đã được kiểm chứng qua nhiều năm, hệ sinh thái rất tuyệt vời, tài liệu cũng rất đầy đủ!

PS: Do giới hạn dung lượng, tôi không giới thiệu và so sánh chi tiết các lựa chọn distributed cache đã đề cập ở trên, nếu quan tâm có thể tự nghiên cứu thêm.

### Hãy nói về sự khác biệt và điểm chung giữa Redis và Memcached

Các công ty hiện tại thường dùng Redis để triển khai cache, và bản thân Redis ngày càng mạnh mẽ hơn! Tuy nhiên, hiểu được sự khác biệt và điểm chung giữa Redis và Memcached sẽ giúp chúng ta có cơ sở để lựa chọn công nghệ phù hợp!

**Điểm chung**:

1. Đều là cơ sở dữ liệu dựa trên bộ nhớ, thường được dùng như cache.
2. Đều có chiến lược expiration.
3. Hiệu năng của cả hai đều rất cao.

**Khác biệt**:

1. **Kiểu dữ liệu**: Redis hỗ trợ kiểu dữ liệu phong phú hơn (hỗ trợ các tình huống ứng dụng phức tạp hơn). Redis không chỉ hỗ trợ dữ liệu kiểu k/v đơn giản, mà còn cung cấp lưu trữ cấu trúc dữ liệu list, set, zset, hash; trong khi Memcached chỉ hỗ trợ kiểu dữ liệu k/v đơn giản nhất.
2. **Persistence dữ liệu**: Redis hỗ trợ persistence dữ liệu, có thể lưu dữ liệu trong bộ nhớ ra đĩa, khi restart có thể load lại để dùng; trong khi Memcached lưu toàn bộ dữ liệu trong bộ nhớ. Nghĩa là, Redis có cơ chế disaster recovery, còn Memcached thì không.
3. **Hỗ trợ cluster mode**: Memcached không có cluster mode native, cần dựa vào client để implement sharding dữ liệu vào cluster; trong khi Redis từ phiên bản 3.0 đã hỗ trợ native cluster mode.
4. **Mô hình luồng**: Memcached là mô hình mạng non-blocking IO multiplexing đa luồng; còn Redis sử dụng mô hình IO multiplexing đơn luồng (Redis 6.0 đã giới thiệu đa luồng cho đọc ghi dữ liệu mạng).
5. **Hỗ trợ tính năng**: Redis hỗ trợ mô hình publish/subscribe, Lua script, transaction và các tính năng khác, trong khi Memcached không hỗ trợ. Ngoài ra, Redis hỗ trợ nhiều ngôn ngữ lập trình hơn.
6. **Xóa dữ liệu hết hạn**: Chiến lược xóa dữ liệu hết hạn của Memcached chỉ dùng lazy deletion, trong khi Redis sử dụng đồng thời cả lazy deletion và periodic deletion.

Tin rằng sau khi xem so sánh trên, chúng ta không còn lý do gì để chọn Memcached làm distributed cache cho dự án của mình nữa.

### ⭐️Tại sao dùng Redis?

**1. Tốc độ truy cập nhanh hơn**

Cơ sở dữ liệu truyền thống lưu dữ liệu trên đĩa, còn Redis dựa trên bộ nhớ, tốc độ truy cập bộ nhớ nhanh hơn đĩa rất nhiều. Sau khi giới thiệu Redis, chúng ta có thể đặt một số dữ liệu được truy cập thường xuyên vào Redis, lần sau có thể đọc trực tiếp từ bộ nhớ, tốc độ có thể tăng hàng chục đến hàng trăm lần.

**2. Concurrent cao**

Thông thường QPS của các cơ sở dữ liệu như MySQL vào khoảng 4k (4 core 8g), nhưng sau khi dùng Redis cache có thể dễ dàng đạt 5w+, thậm chí 10w+ (chỉ tính Redis đơn lẻ, Redis cluster sẽ cao hơn).

> QPS (Query Per Second): Số lần query server có thể thực hiện mỗi giây;

Từ đó có thể thấy, số lượng request cơ sở dữ liệu mà thao tác trực tiếp với cache có thể chịu đựng lớn hơn nhiều so với truy cập trực tiếp vào cơ sở dữ liệu, vì vậy chúng ta có thể cân nhắc chuyển một phần dữ liệu trong cơ sở dữ liệu sang cache, như vậy một phần request của người dùng sẽ đến thẳng cache mà không cần qua cơ sở dữ liệu. Qua đó, chúng ta cũng nâng cao được concurrency tổng thể của hệ thống.

**3. Tính năng đầy đủ**

Ngoài dùng làm cache, Redis còn có thể dùng cho distributed lock, rate limiting, message queue, delay queue và các tình huống khác, tính năng mạnh mẽ!

### ⭐️Tại sao dùng Redis mà không dùng local cache?

| Tính năng                | Local cache                                                       | Redis                                                           |
| ------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| Tính nhất quán dữ liệu   | Có vấn đề không nhất quán dữ liệu khi deploy nhiều server         | Dữ liệu nhất quán                                               |
| Giới hạn bộ nhớ          | Bị giới hạn bởi bộ nhớ của một server                             | Deploy độc lập, không gian bộ nhớ lớn hơn                       |
| Rủi ro mất dữ liệu       | Dữ liệu mất khi server down                                       | Có thể persistent, dữ liệu khó mất                              |
| Quản lý bảo trì          | Phân tán, bất tiện quản lý                                        | Quản lý tập trung, cung cấp công cụ quản lý phong phú           |
| Tính phong phú tính năng | Tính năng hạn chế, thường chỉ cung cấp lưu trữ key-value đơn giản | Tính năng phong phú, hỗ trợ nhiều cấu trúc dữ liệu và tính năng |

Để biết giới thiệu chi tiết về local cache, distributed cache và multi-level cache, xem bài viết tôi đã viết: [Tổng hợp câu hỏi phỏng vấn cơ bản về cache](http://localhost:8080/database/redis/cache-basics.html).

### Các chiến lược đọc ghi cache phổ biến là gì?

Để biết giới thiệu chi tiết về các chiến lược đọc ghi cache phổ biến, xem bài viết tôi đã viết: [Giải thích chi tiết 3 chiến lược đọc ghi cache thường dùng](https://javaguide.cn/database/redis/3-commonly-used-cache-read-and-write-strategies.html).

### Redis Module là gì? Có tác dụng gì?

Từ phiên bản 4.0, Redis hỗ trợ mở rộng tính năng thông qua Module để đáp ứng các nhu cầu đặc biệt. Các Module này được load vào Redis dưới dạng dynamic link library (file so), đây là cách triển khai mở rộng tính năng động rất linh hoạt, đáng học hỏi!

Mỗi người chúng ta đều có thể tùy chỉnh phát triển Module của mình dựa trên Redis, ví dụ triển khai tính năng search engine, distributed lock tùy chỉnh và distributed rate limiting.

Hiện tại, các Module được Redis chính thức khuyến nghị bao gồm:

- [RediSearch](https://github.com/RediSearch/RediSearch): Module dùng để triển khai search engine.
- [RedisJSON](https://github.com/RedisJSON/RedisJSON): Module dùng để xử lý dữ liệu JSON.
- [RedisGraph](https://github.com/RedisGraph/RedisGraph): Module dùng để triển khai graph database.
- [RedisTimeSeries](https://github.com/RedisTimeSeries/RedisTimeSeries): Module dùng để xử lý dữ liệu time series.
- [RedisBloom](https://github.com/RedisBloom/RedisBloom): Module dùng để triển khai bloom filter.
- [RedisAI](https://github.com/RedisAI/RedisAI): Module dùng để thực thi model deep learning/machine learning và quản lý dữ liệu của chúng.
- [RedisCell](https://github.com/brandur/redis-cell): Module dùng để triển khai distributed rate limiting.
- ……

Để biết giới thiệu chi tiết về Redis module, xem tài liệu chính thức: <https://redis.io/modules>.

## ⭐️Ứng dụng Redis

### Ngoài làm cache, Redis còn có thể làm gì?

- **Distributed lock**: Dùng Redis để làm distributed lock là cách khá phổ biến. Thông thường, chúng ta triển khai distributed lock dựa trên Redisson. Để biết giới thiệu chi tiết về distributed lock qua Redis, xem bài viết tôi đã viết: [Giải thích chi tiết Distributed Lock](https://javaguide.cn/distributed-system/distributed-lock.html).
- **Rate limiting**: Thường triển khai rate limiting thông qua Redis + Lua script. Nếu không muốn tự viết Lua script, cũng có thể dùng trực tiếp `RRateLimiter` trong Redisson để triển khai distributed rate limiting, cài đặt bên dưới dựa trên Lua code + thuật toán token bucket.
- **Message queue**: Cấu trúc dữ liệu List có sẵn của Redis có thể dùng như một queue đơn giản. Cấu trúc dữ liệu kiểu Stream được thêm vào Redis 5.0 phù hợp hơn để làm message queue. Nó khá giống Kafka, có khái niệm topic và consumer group, hỗ trợ message persistence và cơ chế ACK.
- **Delay queue**: Redisson tích hợp sẵn delay queue (được triển khai dựa trên Sorted Set).
- **Distributed Session**: Dùng kiểu dữ liệu String hoặc Hash để lưu dữ liệu Session, tất cả các server đều có thể truy cập.
- **Tình huống nghiệp vụ phức tạp**: Thông qua các cấu trúc dữ liệu do Redis và extension của Redis (như Redisson) cung cấp, chúng ta có thể dễ dàng hoàn thành nhiều tình huống nghiệp vụ phức tạp, ví dụ dùng Bitmap để thống kê người dùng hoạt động, dùng Sorted Set để duy trì bảng xếp hạng, dùng HyperLogLog để thống kê UV và PV trang web.
- ……

### Cách triển khai Distributed Lock dựa trên Redis?

Để biết giới thiệu chi tiết về triển khai distributed lock qua Redis, xem bài viết tôi đã viết: [Giải thích chi tiết Distributed Lock](https://javaguide.cn/distributed-system/distributed-lock-implementations.html).

### Redis có thể làm message queue không? Cách triển khai như thế nào?

Kết luận trước:

- **Nếu nghiệp vụ đơn giản, lượng nhỏ, đòi hỏi hiệu năng cực cao**, và có thể chịu đựng xác suất cực nhỏ mất dữ liệu, sử dụng **Redis Stream** là giải pháp tối ưu, vì nó tiết kiệm chi phí deploy và maintain MQ, có thể tái sử dụng component Redis hiện có (hầu hết các dự án cần dùng MQ thường đều cần Redis).
- **Nếu là nghiệp vụ cấp tài chính, dữ liệu khổng lồ, cần đảm bảo nghiêm ngặt không mất message**, phải chọn **Kafka, RabbitMQ** hoặc các MQ trưởng thành hơn.

Câu hỏi này khá quan trọng, cũng có thể áp dụng vào lựa chọn công nghệ, tôi đã viết riêng một bài viết giới thiệu và phân tích chi tiết, khuyến nghị bạn nào có đủ thời gian hãy đọc kỹ vài lần và đánh dấu: [Redis có thể làm message queue không? Cách triển khai như thế nào?](https://javaguide.cn/database/redis/redis-stream-mq.html).

### Cách triển khai delayed task dựa trên Redis?

> Các câu hỏi tương tự:
>
> - Đơn hàng chưa thanh toán sau 10 phút sẽ hết hạn, làm thế nào để triển khai bằng Redis?
> - Phong bì đỏ chưa được nhận sau 24 giờ sẽ tự động hoàn trả, làm thế nào để triển khai bằng Redis?

Tính năng delayed task dựa trên Redis về cơ bản có hai phương án sau:

1. Lắng nghe Redis expiration event.
2. Delay queue tích hợp sẵn của Redisson.

Redis expiration event tồn tại các vấn đề như tính kịp thời kém, mất message, tiêu thụ message trùng lặp trong nhiều service instance, không được khuyến nghị sử dụng.

Delay queue tích hợp sẵn của Redisson có những ưu điểm sau:

1. **Giảm khả năng mất message**: Message trong DelayedQueue sẽ được persistent, kể cả Redis down, theo cơ chế persistence, chỉ có thể mất một chút message, ảnh hưởng không lớn. Tất nhiên, bạn cũng có thể dùng phương pháp quét cơ sở dữ liệu như cơ chế bù đắp.
2. **Message không có vấn đề tiêu thụ trùng lặp**: Mỗi client đều lấy task từ cùng một target queue, không có vấn đề tiêu thụ trùng lặp.

Để biết giới thiệu chi tiết về delayed task qua Redis, xem bài viết tôi đã viết: [Cách triển khai Delayed Task dựa trên Redis?](./redis-delayed-task.md).

## ⭐️Kiểu dữ liệu Redis

Để biết giới thiệu chi tiết về 5 kiểu dữ liệu cơ bản và 3 kiểu dữ liệu đặc biệt của Redis, xem hai bài viết dưới đây và [tài liệu chính thức Redis](https://redis.io/docs/data-types/):

- [Giải thích chi tiết 5 kiểu dữ liệu cơ bản của Redis](https://javaguide.cn/database/redis/redis-data-structures-01.html)
- [Giải thích chi tiết 3 kiểu dữ liệu đặc biệt của Redis](https://javaguide.cn/database/redis/redis-data-structures-02.html)

### Các kiểu dữ liệu thường dùng trong Redis là gì?

Các kiểu dữ liệu khá phổ biến trong Redis bao gồm:

- **5 kiểu dữ liệu cơ bản**: String (chuỗi), List (danh sách), Set (tập hợp), Hash (bảng băm), Zset (tập hợp có thứ tự).
- **3 kiểu dữ liệu đặc biệt**: HyperLogLog (ước tính cardinality), Bitmap (bản đồ bit), Geospatial (vị trí địa lý).

Ngoài những kiểu trên, còn có một số kiểu khác như [Bloom filter (bộ lọc Bloom)](https://javaguide.cn/cs-basics/data-structure/bloom-filter.html), Bitfield (trường bit).

### Các tình huống ứng dụng của String là gì?

String là kiểu dữ liệu đơn giản nhất đồng thời cũng được dùng phổ biến nhất trong Redis. Đây là kiểu dữ liệu binary safe, có thể dùng để lưu bất kỳ kiểu dữ liệu nào như chuỗi, số nguyên, số thực, hình ảnh (base64 encode/decode hoặc đường dẫn ảnh), đối tượng đã serialize.

Các tình huống ứng dụng phổ biến của String như sau:

- Cache dữ liệu thông thường (như Session, Token, đối tượng đã serialize, đường dẫn ảnh);
- Đếm như số request của người dùng trong một khoảng thời gian (có thể dùng cho rate limiting đơn giản), số lượt truy cập trang trong một khoảng thời gian;
- Distributed lock (dùng lệnh `SETNX key value` có thể triển khai một distributed lock đơn giản nhất);
- ……

Để biết giới thiệu chi tiết về String, xem bài viết: [Giải thích chi tiết 5 kiểu dữ liệu cơ bản của Redis](https://javaguide.cn/database/redis/redis-data-structures-01.html).

### Nên dùng String hay Hash để lưu dữ liệu đối tượng tốt hơn?

So sánh đơn giản giữa hai loại:

- **Cách lưu trữ đối tượng**: String lưu dữ liệu đối tượng đã serialize, đặt cả đối tượng, thao tác đơn giản trực tiếp. Hash lưu riêng từng field của đối tượng, có thể lấy thông tin một phần field, cũng có thể chỉnh sửa hoặc thêm một phần field, tiết kiệm băng thông mạng. Nếu một số field trong đối tượng thường xuyên thay đổi hoặc thường cần query riêng thông tin field riêng lẻ của đối tượng, Hash rất phù hợp.
- **Tiêu thụ bộ nhớ**: Hash thường tiết kiệm bộ nhớ hơn String, đặc biệt khi có nhiều field và độ dài field tương đối ngắn. Redis tối ưu hóa Hash nhỏ (như dùng ziplist để lưu), tiếp tục giảm tiêu thụ bộ nhớ.
- **Lưu đối tượng phức tạp**: String thuận tiện hơn khi xử lý đối tượng có nhiều lớp lồng nhau hoặc cấu trúc phức tạp, vì không cần xử lý lưu trữ và thao tác độc lập cho từng field.
- **Hiệu năng**: Thao tác String thường có time complexity O(1), vì nó lưu cả đối tượng, thao tác đơn giản trực tiếp, hiệu năng đọc ghi tổng thể tốt hơn. Hash do cần xử lý thao tác CRUD của nhiều field, trong trường hợp field nhiều và thường xuyên thay đổi, có thể mang đến overhead hiệu năng thêm.

Tóm tắt:

- Trong hầu hết các trường hợp, **String** phù hợp hơn để lưu dữ liệu đối tượng, đặc biệt khi cấu trúc đối tượng đơn giản và đọc ghi toàn bộ là thao tác chính.
- Nếu bạn cần thường xuyên thao tác một phần field của đối tượng hoặc tiết kiệm bộ nhớ, **Hash** có thể là lựa chọn tốt hơn.

### Cài đặt bên dưới của String là gì?

Redis được viết bằng ngôn ngữ C, nhưng cài đặt bên dưới của kiểu String trong Redis không phải là chuỗi trong ngôn ngữ C (tức là mảng ký tự kết thúc bằng ký tự null `\0`), mà là tự viết [SDS](https://github.com/antirez/sds) (Simple Dynamic String, chuỗi động đơn giản) làm cài đặt bên dưới.

SDS ban đầu là chuỗi C được tác giả Redis thiết kế cho lập trình C hàng ngày, sau này được áp dụng lên Redis, và đã trải qua nhiều sửa đổi hoàn thiện để phù hợp với thao tác hiệu năng cao.

Một phần mã nguồn SDS của Redis 7.0 như sau (<https://github.com/redis/redis/blob/7.0/src/sds.h>):

```c
/* Note: sdshdr5 is never used, we just access the flags byte directly.
 * However is here to document the layout of type 5 SDS strings. */
struct __attribute__ ((__packed__)) sdshdr5 {
    unsigned char flags; /* 3 lsb of type, and 5 msb of string length */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr8 {
    uint8_t len; /* used */
    uint8_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr16 {
    uint16_t len; /* used */
    uint16_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr32 {
    uint32_t len; /* used */
    uint32_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
struct __attribute__ ((__packed__)) sdshdr64 {
    uint64_t len; /* used */
    uint64_t alloc; /* excluding the header and null terminator */
    unsigned char flags; /* 3 lsb of type, 5 unused bits */
    char buf[];
};
```

Qua mã nguồn có thể thấy, SDS có năm cách cài đặt: SDS_TYPE_5 (không dùng), SDS_TYPE_8, SDS_TYPE_16, SDS_TYPE_32, SDS_TYPE_64, trong đó chỉ có bốn loại sau được dùng thực tế. Redis sẽ quyết định dùng loại nào dựa trên độ dài khởi tạo, từ đó giảm sử dụng bộ nhớ.

| Loại     | Byte | Bit |
| -------- | ---- | --- |
| sdshdr5  | < 1  | <8  |
| sdshdr8  | 1    | 8   |
| sdshdr16 | 2    | 16  |
| sdshdr32 | 4    | 32  |
| sdshdr64 | 8    | 64  |

Đối với bốn loại cài đặt sau đều bao gồm 4 thuộc tính dưới đây:

- `len`: Độ dài chuỗi tức là số byte đã sử dụng.
- `alloc`: Tổng không gian ký tự khả dụng, alloc-len là không gian còn lại của SDS.
- `buf[]`: Mảng thực sự lưu trữ chuỗi.
- `flags`: 3 bit thấp lưu flag loại.

SDS có những cải tiến sau so với chuỗi trong ngôn ngữ C:

1. **Tránh được buffer overflow**: Chuỗi trong ngôn ngữ C khi bị chỉnh sửa (như nối chuỗi), nếu không phân bổ đủ không gian bộ nhớ, sẽ gây ra buffer overflow. Khi SDS bị chỉnh sửa, sẽ kiểm tra trước kích thước không gian có đủ không dựa trên thuộc tính len, nếu không đủ sẽ mở rộng đến kích thước cần thiết trước khi thực hiện thao tác chỉnh sửa.
2. **Complexity lấy độ dài chuỗi thấp hơn**: Độ dài chuỗi trong ngôn ngữ C thường được tính bằng cách duyệt đếm, time complexity là O(n). Lấy độ dài SDS chỉ cần đọc thuộc tính len là được, time complexity là O(1).
3. **Giảm số lần phân bổ bộ nhớ**: Để tránh mỗi lần chỉnh sửa (tăng/giảm) chuỗi đều cần phân bổ lại bộ nhớ (chuỗi ngôn ngữ C như vậy), SDS đã cài đặt hai chiến lược tối ưu: space pre-allocation và lazy space release. Khi SDS cần tăng chuỗi, Redis sẽ phân bổ bộ nhớ cho SDS, và phân bổ thêm bộ nhớ dư dựa trên thuật toán cụ thể, điều này có thể giảm số lần phân bổ lại bộ nhớ cần thiết khi thực hiện liên tục thao tác tăng trưởng chuỗi. Khi SDS cần giảm chuỗi, phần bộ nhớ này sẽ không được thu hồi ngay, sẽ được ghi lại và chờ dùng sau (hỗ trợ giải phóng thủ công, có API tương ứng).
4. **Binary safe**: Chuỗi trong ngôn ngữ C dùng ký tự null `\0` làm ký hiệu kết thúc chuỗi, điều này có một số vấn đề, một số file nhị phân (như ảnh, video, âm thanh) có thể chứa ký tự null, chuỗi C không thể lưu đúng. SDS dùng thuộc tính len để xác định chuỗi có kết thúc không, không có vấn đề này.

Thêm một điều nữa, nhiều bài viết định nghĩa SDS như sau:

```c
struct sdshdr {
    unsigned int len;
    unsigned int free;
    char buf[];
};
```

Điều này cũng không sai, trước Redis 3.2 định nghĩa như vậy. Sau đó, do cách định nghĩa này tồn tại vấn đề, `len` và `free` dùng 4 byte gây lãng phí. Sau Redis 3.2, Redis đã cải tiến định nghĩa SDS, chia nó thành 5 loại hiện tại.

### Nên dùng String hay Hash để lưu thông tin giỏ hàng?

Do hàng hóa trong giỏ hàng thường xuyên chỉnh sửa và thay đổi, nên dùng Hash để lưu thông tin giỏ hàng:

- User id là key
- Product id là field, số lượng sản phẩm là value

![Hash duy trì thông tin giỏ hàng đơn giản](/images/github/javaguide/database/redis/hash-shopping-cart.png)

Vậy việc duy trì thông tin giỏ hàng của người dùng cụ thể nên thực hiện như thế nào?

- Người dùng thêm sản phẩm là thêm field và value mới vào Hash;
- Query thông tin giỏ hàng là duyệt qua Hash tương ứng;
- Thay đổi số lượng sản phẩm là trực tiếp chỉnh sửa value tương ứng (có thể set trực tiếp hoặc thực hiện phép tính);
- Xóa sản phẩm là xóa field tương ứng trong Hash;
- Xóa toàn bộ giỏ hàng là trực tiếp xóa key tương ứng.

Đây chỉ là ví dụ về tình huống giỏ hàng nghiệp vụ đơn giản, trong tình huống e-commerce thực tế, field chỉ lưu một product id là không đủ để đáp ứng yêu cầu.

### Cách triển khai bảng xếp hạng bằng Redis?

Trong Redis có kiểu dữ liệu `Sorted Set` (tập hợp có thứ tự) thường được dùng trong các tình huống bảng xếp hạng khác nhau, ví dụ bảng xếp hạng tặng quà trong livestream, bảng xếp hạng số bước đi bộ của bạn bè trên WeChat, bảng xếp hạng cấp độ trong game, bảng xếp hạng độ nóng chủ đề, v.v.

Một số lệnh Redis liên quan: `ZRANGE` (sắp xếp từ nhỏ đến lớn), `ZREVRANGE` (sắp xếp từ lớn đến nhỏ), `ZREVRANK` (xếp hạng phần tử được chỉ định).

![](/images/github/javaguide/database/redis/2021060714195385.png)

Phần "Câu hỏi phỏng vấn kỹ thuật" của [《Java Interview Guide》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html) có một bài viết giới thiệu chi tiết cách dùng Sorted Set để thiết kế tạo bảng xếp hạng, bạn nào quan tâm có thể xem.

![](/images/github/javaguide/database/redis/image-20220719071115140.png)

### Tại sao tập hợp có thứ tự của Redis dùng skip list ở bên dưới mà không dùng balanced tree, red-black tree hoặc B+ tree?

Câu hỏi phỏng vấn này được nhiều công ty lớn khá yêu thích, độ khó cũng không nhỏ.

- Balanced tree vs skip list: Time complexity của insert, delete và query của balanced tree và skip list đều là **O(log n)**. Đối với range query, balanced tree cũng có thể đạt được hiệu quả tương tự skip list thông qua inorder traversal. Nhưng mỗi lần insert hoặc delete đều cần đảm bảo cân bằng tuyệt đối của tất cả các node trái phải trong cây, chỉ cần mất cân bằng là phải thực hiện rotation để duy trì cân bằng, quá trình này khá tốn thời gian. Skip list ra đời để khắc phục một số nhược điểm của balanced tree. Skip list sử dụng cân bằng xác suất thay vì cân bằng cưỡng bức nghiêm ngặt, vì vậy thuật toán insert và delete trong skip list đơn giản hơn và nhanh hơn nhiều so với thuật toán tương đương trong balanced tree.
- Red-black tree vs skip list: So với red-black tree, cài đặt skip list cũng đơn giản hơn, không cần thực hiện rotation và coloring (biến đổi đỏ-đen) để duy trì black balance. Ngoài ra, thao tác query dữ liệu theo khoảng, hiệu quả của red-black tree không cao bằng skip list.
- B+ tree vs skip list: B+ tree phù hợp hơn làm một trong các cấu trúc index phổ biến trong cơ sở dữ liệu và file system, ý tưởng cốt lõi là lấy được nhiều index nhất có thể thông qua ít IO nhất. Đối với Redis - một in-memory database, nó không quan tâm đến những điều đó, vì Redis là in-memory database nên không thể lưu lượng lớn dữ liệu, do đó không cần duy trì index theo cách B+ tree, chỉ cần duy trì ngẫu nhiên theo xác suất là được, tiết kiệm bộ nhớ. Hơn nữa, khi dùng skip list để cài đặt zset, việc insert đơn giản hơn so với B+ tree, khi insert chỉ cần chèn dữ liệu vào vị trí thích hợp trong linked list thông qua index rồi duy trì ngẫu nhiên một độ cao nhất định của index là được, cũng không cần như B+ tree khi phát hiện mất cân bằng khi insert thì phải split và merge node.

Ngoài ra, tôi còn viết riêng một bài viết từ cách sử dụng cơ bản của sorted set đến phân tích và cài đặt mã nguồn skip list, giúp bạn hiểu sâu hơn và nắm vững cài đặt skip list bên dưới của sorted set trong Redis: [Tại sao Redis dùng skip list để cài đặt sorted set](https://javaguide.cn/database/redis/redis-skiplist.html).

### Tình huống ứng dụng của Set là gì?

`Set` trong Redis là một tập hợp không có thứ tự, các phần tử trong tập hợp không có thứ tự trước sau nhưng đều là duy nhất, hơi giống `HashSet` trong Java.

Các tình huống ứng dụng phổ biến của `Set` như sau:

- Tình huống lưu dữ liệu không được trùng lặp: Thống kê UV trang web (tình huống dữ liệu lớn thì `HyperLogLog` phù hợp hơn), like bài viết, like động thái, v.v.
- Tình huống cần lấy giao, hợp và hiệu của nhiều nguồn dữ liệu: Bạn bè chung (giao), người theo dõi chung (giao), mối quan tâm chung (giao), gợi ý bạn bè (hiệu), gợi ý âm nhạc (hiệu), gợi ý kênh đăng ký (hiệu+giao), v.v.
- Tình huống cần lấy ngẫu nhiên phần tử từ nguồn dữ liệu: Hệ thống bốc thăm, điểm danh ngẫu nhiên, v.v.

### Cách triển khai hệ thống bốc thăm dùng Set?

Nếu muốn dùng `Set` để triển khai một hệ thống bốc thăm đơn giản, chỉ cần dùng trực tiếp một số lệnh sau:

- `SADD key member1 member2 ...`: Thêm một hoặc nhiều phần tử vào tập hợp được chỉ định.
- `SPOP key count`: Xóa ngẫu nhiên và lấy một hoặc nhiều phần tử từ tập hợp được chỉ định, phù hợp với tình huống không cho phép trúng thưởng trùng lặp.
- `SRANDMEMBER key count`: Lấy ngẫu nhiên số lượng phần tử được chỉ định từ tập hợp được chỉ định, phù hợp với tình huống cho phép trúng thưởng trùng lặp.

### Cách thống kê người dùng hoạt động bằng Bitmap?

Bitmap lưu trữ số nhị phân liên tiếp (0 và 1), thông qua Bitmap, chỉ cần một bit để biểu thị giá trị hoặc trạng thái tương ứng của một phần tử, key chính là phần tử tương ứng. Chúng ta biết 8 bit có thể tạo thành một byte, vì vậy Bitmap bản thân sẽ tiết kiệm không gian lưu trữ rất nhiều.

Bạn có thể coi Bitmap như một mảng lưu trữ số nhị phân (0 và 1), chỉ số của mỗi phần tử trong mảng được gọi là offset (độ dịch).

![img](/images/github/javaguide/database/redis/image-20220720194154133.png)

Nếu muốn dùng Bitmap để thống kê người dùng hoạt động, có thể dùng ngày (chính xác đến ngày) làm key, sau đó user ID là offset, nếu hoạt động trong ngày đó thì đặt là 1.

Khởi tạo dữ liệu:

```bash
> SETBIT 20210308 1 1
(integer) 0
> SETBIT 20210308 2 1
(integer) 0
> SETBIT 20210309 1 1
(integer) 0
```

Thống kê tổng người dùng hoạt động 20210308~20210309:

```bash
> BITOP and desk1 20210308 20210309
(integer) 1
> BITCOUNT desk1
(integer) 1
```

Thống kê số người dùng online hoạt động 20210308~20210309:

```bash
> BITOP or desk2 20210308 20210309
(integer) 1
> BITCOUNT desk2
(integer) 2
```

### HyperLogLog phù hợp với tình huống nào?

HyperLogLog (HLL) là một cấu trúc dữ liệu xác suất rất thông minh, chuyên giải quyết một loại vấn đề dữ liệu lớn rất khó khăn: Trong dữ liệu khổng lồ, dùng bộ nhớ cực nhỏ, ước tính số lượng phần tử không trùng lặp trong một tập hợp, tức là cardinality (lực lượng) mà chúng ta thường nói.

Sự đánh đổi cốt lõi nhất mà HLL thực hiện là dùng một chút mất độ chính xác để đổi lấy tiết kiệm không gian bộ nhớ khổng lồ. Nó cho ra không phải một con số chính xác 100%, mà là một giá trị gần đúng với sai số chuẩn rất nhỏ (trong Redis mặc định là 0.81%).

**Dựa trên sự đánh đổi cốt lõi này, HyperLogLog phù hợp nhất với các tình huống có đặc điểm sau:**

1. **Dữ liệu khổng lồ, nhạy cảm với bộ nhớ:** Đây là chiến trường chính của HLL. Ví dụ, cần thống kê số người dùng riêng biệt hàng ngày của một App có DAU hàng trăm triệu. Nếu dùng Set truyền thống để lưu user ID, một ID chiếm vài chục byte, hàng trăm triệu ID có thể cần vài GB đến hàng chục GB bộ nhớ, điều này không thể chấp nhận trong nhiều tình huống. Còn HLL, trong Redis chỉ cần 12KB bộ nhớ cố định, có thể xử lý cardinality ở cấp độ thiên văn, đây là ưu điểm đột phá.
2. **Yêu cầu độ chính xác kết quả không phải 100%:** Đây là tiền đề để sử dụng HLL. Ví dụ, product manager muốn biết UV (Unique Visitor) của một bài đăng hot là khoảng 10 triệu hay 10.1 triệu, sự khác biệt nhỏ này thường không ảnh hưởng đến quyết định kinh doanh. Nhưng nếu tình huống là thống kê số giao dịch chính xác của hệ thống giao dịch, thì HLL hoàn toàn không phù hợp, vì tình huống tài chính yêu cầu chính xác 100%.

**Vì vậy, tình huống ứng dụng cụ thể của HyperLogLog rất rõ ràng:**

- **Thống kê UV (Unique Visitor) của website/App:** Ví dụ thống kê có bao nhiêu IP hoặc user ID khác nhau đã truy cập trang chủ mỗi ngày.
- **Thống kê từ khóa search engine:** Thống kê có bao nhiêu người dùng khác nhau đã tìm kiếm một từ khóa mỗi ngày.
- **Thống kê tương tác mạng xã hội:** Ví dụ thống kê một bài đăng Weibo được bao nhiêu người dùng khác nhau chia sẻ.

Trong các tình huống này, chúng ta quan tâm đến mức độ và xu hướng, không phải sự khác biệt từng đơn vị.

Cuối cùng, cài đặt của Redis còn rất thông minh, nội tại nó sẽ tự động chuyển đổi giữa **sparse matrix** (chiếm ít không gian hơn) và **dense matrix** (12KB cố định) dựa trên kích thước cardinality, tiếp tục tối ưu hóa sử dụng bộ nhớ. Tóm lại, khi bạn cần đếm phân biệt dữ liệu khổng lồ, và có thể chấp nhận sai số nhỏ, HyperLogLog là lựa chọn duy nhất.

### Cách thống kê UV trang bằng HyperLogLog?

Thống kê UV trang bằng HyperLogLog chủ yếu cần dùng hai lệnh sau:

- `PFADD key element1 element2 ...`: Thêm một hoặc nhiều phần tử vào HyperLogLog.
- `PFCOUNT key1 key2`: Lấy số đếm duy nhất của một hoặc nhiều HyperLogLog.

1、Thêm mỗi user ID truy cập trang được chỉ định vào `HyperLogLog`.

```bash
PFADD PAGE_1:UV USER1 USER2 ...... USERn
```

2、Thống kê UV của trang được chỉ định.

```bash
PFCOUNT PAGE_1:UV
```

### Nếu muốn xác định một phần tử có tồn tại trong tập hợp phần tử khổng lồ không, nên dùng kiểu dữ liệu nào?

Đây là tình huống ứng dụng điển hình của bloom filter. Bloom filter có thể cho bạn biết một phần tử nhất định không tồn tại hoặc có thể tồn tại, nó cũng có hiệu quả không gian cực cao và một tỷ lệ false positive nhất định, nhưng tuyệt đối không bỏ sót. Nghĩa là, bloom filter nói một phần tử tồn tại, xác suất nhỏ sẽ false positive. Bloom filter nói một phần tử không tồn tại, thì phần tử đó chắc chắn không tồn tại.

Nguyên lý đơn giản của Bloom Filter như sau:

![Sơ đồ nguyên lý đơn giản của Bloom Filter](/images/github/javaguide/cs-basics/algorithms/bloom-filter-simple-schematic-diagram.png)

Khi chuỗi cần được lưu vào bloom filter, chuỗi đó đầu tiên được tạo các giá trị hash khác nhau bởi nhiều hàm hash, sau đó đặt các chỉ số của bit array tương ứng thành 1 (khi bit array được khởi tạo, tất cả vị trí đều là 0). Khi lần thứ hai lưu cùng chuỗi đó, vì các vị trí tương ứng trước đó đã được đặt thành 1, nên dễ dàng biết giá trị này đã tồn tại (dedup rất tiện).

Nếu cần xác định một chuỗi có trong bloom filter không, chỉ cần thực hiện lại cùng phép tính hash cho chuỗi đã cho, sau khi lấy được giá trị thì xác định xem mỗi phần tử trong bit array có đều là 1 không, nếu giá trị đều là 1, thì giá trị đó trong bloom filter, nếu tồn tại một giá trị không phải 1, nghĩa là phần tử đó không có trong bloom filter.

## ⭐️Cơ chế Persistence của Redis (Quan trọng)

Các câu hỏi liên quan đến cơ chế persistence của Redis (RDB persistence, AOF persistence, mixed persistence của RDB và AOF) khá nhiều và cũng khá quan trọng, vì vậy tôi đã tách riêng một bài viết để tổng hợp các kiến thức và câu hỏi liên quan đến cơ chế persistence của Redis: [Giải thích chi tiết cơ chế Persistence của Redis](https://javaguide.cn/database/redis/redis-persistence.html).

## ⭐️Mô hình luồng Redis (Quan trọng)

Đối với các lệnh đọc ghi, Redis luôn là mô hình đơn luồng. Tuy nhiên, từ phiên bản Redis 4.0 đã giới thiệu đa luồng để thực hiện một số thao tác xóa bất đồng bộ cho các key-value lớn, từ phiên bản Redis 6.0 đã giới thiệu đa luồng để xử lý request mạng (nâng cao hiệu năng đọc ghi network IO).

### Bạn có hiểu về mô hình đơn luồng Redis không?

**Redis thiết kế phát triển một bộ mô hình xử lý sự kiện hiệu quả dựa trên mẫu Reactor** (mô hình luồng của Netty cũng dựa trên mẫu Reactor, mẫu Reactor xứng đáng là nền tảng của high-performance IO), bộ mô hình xử lý sự kiện này tương ứng với file event handler (bộ xử lý sự kiện file) trong Redis. Vì file event handler chạy theo cách đơn luồng, nên chúng ta thường nói Redis là mô hình đơn luồng.

Cuốn "Redis Design and Implementation" có một đoạn giới thiệu về file event handler như thế này, tôi thấy viết khá hay.

> Redis phát triển bộ xử lý sự kiện mạng của riêng mình dựa trên mẫu Reactor: bộ xử lý này được gọi là file event handler (bộ xử lý sự kiện file).
>
> - File event handler sử dụng chương trình I/O multiplexing để đồng thời lắng nghe nhiều socket, và liên kết các event handler khác nhau với socket dựa trên task mà socket đang thực hiện.
> - Khi socket được lắng nghe sẵn sàng thực hiện các thao tác như accept (chấp nhận kết nối), read (đọc), write (ghi), close (đóng), thì sự kiện file tương ứng với thao tác sẽ được tạo ra, lúc này file event handler sẽ gọi event handler đã liên kết trước với socket để xử lý các sự kiện này.
>
> **Mặc dù file event handler chạy theo cách đơn luồng, nhưng thông qua việc sử dụng chương trình I/O multiplexing để lắng nghe nhiều socket**, file event handler vừa thực hiện được mô hình giao tiếp mạng hiệu năng cao, vừa có thể kết nối tốt với các module khác trong Redis server cũng chạy theo cách đơn luồng, điều này duy trì tính đơn giản của thiết kế đơn luồng nội tại Redis.

**Đã là đơn luồng, thì làm thế nào để lắng nghe lượng lớn kết nối client?**

Redis thông qua **chương trình IO multiplexing** để lắng nghe lượng lớn kết nối từ client (hay nói cách khác là lắng nghe nhiều socket), nó sẽ đăng ký các sự kiện và loại quan tâm (đọc, ghi) vào kernel và lắng nghe xem mỗi sự kiện có xảy ra không.

Ưu điểm của cách này rất rõ ràng: **Việc sử dụng kỹ thuật I/O multiplexing cho phép Redis không cần tạo thêm luồng dư thừa để lắng nghe lượng lớn kết nối client, giảm tiêu thụ tài nguyên** (khá giống component `Selector` trong NIO).

File event handler chủ yếu bao gồm 4 phần:

- Nhiều socket (kết nối client)
- Chương trình IO multiplexing (chìa khóa hỗ trợ nhiều kết nối client)
- File event dispatcher (liên kết socket với event handler tương ứng)
- Event handler (connection accept handler, command request handler, command reply handler)

![File event handler](/images/github/javaguide/database/redis/redis-event-handler.png)

### Tại sao Redis trước 6.0 không dùng đa luồng?

Mặc dù nói Redis là mô hình đơn luồng, nhưng thực tế, **Redis trong các phiên bản sau 4.0 đã thêm hỗ trợ đa luồng rồi.**

Tuy nhiên, đa luồng được thêm vào Redis 4.0 chủ yếu nhắm vào các lệnh thao tác xóa cho một số key-value lớn, dùng các lệnh này sẽ sử dụng các luồng khác ngoài main thread để "xử lý bất đồng bộ", từ đó giảm ảnh hưởng đến main thread.

Vì vậy, sau Redis 4.0 đã thêm một số lệnh bất đồng bộ:

- `UNLINK`: Có thể coi là phiên bản bất đồng bộ của lệnh `DEL`.
- `FLUSHALL ASYNC`: Dùng để xóa tất cả key của tất cả database, không giới hạn trong database `SELECT` hiện tại.
- `FLUSHDB ASYNC`: Dùng để xóa tất cả key trong database `SELECT` hiện tại.

![redis4.0 more thread](/images/github/javaguide/database/redis/redis4.0-more-thread.png)

Tổng thể mà nói, cho đến trước Redis 6.0, các thao tác chính của Redis vẫn được xử lý bằng đơn luồng.

**Vậy tại sao trước Redis 6.0 không dùng đa luồng?** Tôi cho rằng có 3 lý do chính:

- Lập trình đơn luồng dễ hơn và dễ bảo trì hơn;
- Bottleneck hiệu năng của Redis không nằm ở CPU, chủ yếu ở bộ nhớ và mạng;
- Đa luồng sẽ tồn tại deadlock, context switching luồng và các vấn đề khác, thậm chí có thể ảnh hưởng đến hiệu năng.

Tài liệu liên quan: [Tại sao Redis chọn mô hình đơn luồng?](https://draveness.me/whys-the-design-redis-single-thread/).

### Tại sao Redis 6.0 giới thiệu đa luồng?

**Redis 6.0 giới thiệu đa luồng chủ yếu để nâng cao hiệu năng đọc ghi network IO**, vì đây được coi là một bottleneck hiệu năng trong Redis (bottleneck của Redis chủ yếu bị giới hạn bởi bộ nhớ và mạng).

Mặc dù Redis 6.0 giới thiệu đa luồng, nhưng đa luồng của Redis chỉ được dùng trong các thao tác tốn thời gian như đọc ghi dữ liệu mạng, thực thi lệnh vẫn là đơn luồng tuần tự. Vì vậy, bạn cũng không cần lo lắng về vấn đề thread safety.

Đa luồng của Redis 6.0 mặc định bị tắt, chỉ dùng main thread. Nếu cần bật cần đặt số lượng IO thread > 1, cần sửa file cấu hình redis `redis.conf`:

```bash
io-threads 4 #设置1的话只会开启主线程，官网建议4核的机器建议设置为2或3个线程，8核的建议设置为6个线程
```

Ngoài ra:

- Số lượng io-threads một khi đã đặt, không thể thay đổi động qua config.
- Khi đặt ssl, io-threads sẽ không hoạt động.

Sau khi bật đa luồng, mặc định chỉ dùng đa luồng để IO write, tức là gửi dữ liệu cho client, nếu cần bật IO read đa luồng, cũng cần sửa file cấu hình redis `redis.conf`:

```bash
io-threads-do-reads yes
```

Nhưng trang web chính thức mô tả bật IO read đa luồng không cải thiện nhiều, vì vậy thông thường không khuyến nghị bật.

Tài liệu liên quan:

- [Redis 6.0 tính năng mới - Đa luồng 13 câu hỏi liên hoàn!](https://mp.weixin.qq.com/s/FZu3acwK6zrCBZQ_3HoUgw)
- [Giải mã toàn diện mô hình mạng đa luồng Redis](https://segmentfault.com/a/1190000039223696) (Khuyến nghị)

### Bạn có hiểu về background thread của Redis không?

Mặc dù chúng ta thường nói Redis là mô hình đơn luồng (logic chính được hoàn thành bởi đơn luồng), nhưng thực tế còn có một số background thread dùng để thực hiện một số thao tác tương đối tốn thời gian:

- Thông qua background thread `bio_close_file` để giải phóng tài nguyên file tạm thời được tạo ra trong quá trình AOF/RDB.
- Thông qua background thread `bio_aof_fsync` gọi hàm `fsync` để force flush dữ liệu trong system kernel buffer chưa đồng bộ ra đĩa ra đĩa (file AOF).
- Thông qua background thread `bio_lazy_free` để giải phóng không gian bộ nhớ bị chiếm bởi đối tượng lớn (đã bị xóa).

Được định nghĩa trong file `bio.h` (phiên bản Redis 6.0, địa chỉ mã nguồn: <https://github.com/redis/redis/blob/6.0/src/bio.h>):

```java
#ifndef __BIO_H
#define __BIO_H

/* Exported API */
void bioInit(void);
void bioCreateBackgroundJob(int type, void *arg1, void *arg2, void *arg3);
unsigned long long bioPendingJobsOfType(int type);
unsigned long long bioWaitStepOfType(int type);
time_t bioOlderJobOfType(int type);
void bioKillThreads(void);

/* Background job opcodes */
#define BIO_CLOSE_FILE    0 /* Deferred close(2) syscall. */
#define BIO_AOF_FSYNC     1 /* Deferred AOF fsync. */
#define BIO_LAZY_FREE     2 /* Deferred objects freeing. */
#define BIO_NUM_OPS       3

#endif
```

Để biết giới thiệu chi tiết về background thread Redis có thể xem bài viết [Redis 6.0 có những background thread nào?](https://juejin.cn/post/7102780434739626014).

## ⭐️Quản lý bộ nhớ Redis

### Việc đặt thời gian hết hạn cho dữ liệu cache trong Redis có tác dụng gì?

Thông thường, khi chúng ta đặt dữ liệu cache cần lưu, đều sẽ đặt một thời gian hết hạn. Tại sao vậy?

Bộ nhớ là có hạn và quý giá, nếu không đặt thời gian hết hạn cho dữ liệu cache, thì bộ nhớ chiếm dụng sẽ tăng mãi, cuối cùng có thể dẫn đến vấn đề OOM. Thông qua việc đặt thời gian hết hạn hợp lý, Redis sẽ tự động xóa dữ liệu tạm thời không cần thiết, nhường không gian cho dữ liệu cache mới.

Redis tích hợp sẵn tính năng đặt thời gian hết hạn cho dữ liệu cache, ví dụ:

```bash
127.0.0.1:6379> expire key 60 # 数据在 60s 后过期
(integer) 1
127.0.0.1:6379> setex key 60 value # 数据在 60s 后过期 (setex:[set] + [ex]pire)
OK
127.0.0.1:6379> ttl key # 查看数据还有多久过期
(integer) 56
```

Lưu ý ⚠️: Trong Redis ngoài kiểu chuỗi có lệnh riêng `setex` để đặt thời gian hết hạn, các kiểu khác đều cần dùng lệnh `expire` để đặt thời gian hết hạn. Ngoài ra, lệnh `persist` có thể xóa thời gian hết hạn của một key.

**Ngoài giúp giảm tiêu thụ bộ nhớ, thời gian hết hạn còn có tác dụng gì khác không?**

Nhiều khi, tình huống nghiệp vụ của chúng ta là cần một số dữ liệu chỉ tồn tại trong một khoảng thời gian nhất định, ví dụ mã xác nhận SMS của chúng ta có thể chỉ có hiệu lực trong 1 phút, token đăng nhập của người dùng có thể chỉ có hiệu lực trong 1 ngày.

Nếu dùng cơ sở dữ liệu truyền thống để xử lý, thường phải tự xác định hết hạn, như vậy rắc rối hơn và hiệu năng cũng kém hơn nhiều.

### Redis xác định dữ liệu có hết hạn không như thế nào?

Redis lưu thời gian hết hạn của dữ liệu thông qua một thứ gọi là expiration dictionary (có thể coi là hash table). Key của expiration dictionary trỏ đến một key nào đó trong Redis database, value của expiration dictionary là một số nguyên kiểu long long, số nguyên này lưu thời gian hết hạn của database key mà key trỏ đến (UNIX timestamp với độ chính xác millisecond).

![Redis expiration dictionary](/images/github/javaguide/database/redis/redis-expired-dictionary.png)

Expiration dictionary được lưu trong cấu trúc redisDb này:

```c
typedef struct redisDb {
    ...

    dict *dict;     //数据库键空间,保存着数据库中所有键值对
    dict *expires   // 过期字典,保存着键的过期时间
    ...
} redisDb;
```

Khi query một key, Redis trước tiên kiểm tra xem key đó có tồn tại trong expiration dictionary không (time complexity là O(1)), nếu không thì trả về trực tiếp, nếu có thì cần xác định key đó có hết hạn không, hết hạn thì xóa key và trả về null.

### Bạn có hiểu về chiến lược xóa expired key trong Redis không?

Giả sử bạn đặt một batch key chỉ có thể tồn tại 1 phút, vậy sau 1 phút, Redis xóa batch key đó như thế nào?

Các chiến lược xóa dữ liệu hết hạn thường dùng như sau:

1. **Lazy deletion (xóa lười)**: Chỉ thực hiện kiểm tra hết hạn dữ liệu khi lấy/query key. Cách này thân thiện nhất với CPU, nhưng có thể khiến quá nhiều expired key không được xóa.
2. **Periodic deletion (xóa định kỳ)**: Định kỳ lấy ngẫu nhiên một batch từ các key đã đặt thời gian hết hạn, sau đó lần lượt kiểm tra xem các key này có hết hạn không, hết hạn thì xóa key. So với lazy deletion, periodic deletion thân thiện với bộ nhớ hơn, không thân thiện với CPU lắm.
3. **Delay queue (hàng đợi trì hoãn)**: Đặt các key đã đặt thời gian hết hạn vào một delay queue, đến hạn thì xóa key. Cách này có thể đảm bảo mỗi expired key đều được xóa, nhưng duy trì delay queue rất rắc rối, bản thân queue cũng chiếm tài nguyên.
4. **Timer deletion (xóa theo timer)**: Mỗi key được đặt thời gian hết hạn sẽ được xóa ngay lập tức khi đến thời gian đặt. Phương pháp này có thể đảm bảo trong bộ nhớ không có key hết hạn, nhưng áp lực lên CPU là lớn nhất, vì cần đặt một timer cho mỗi key.

**Redis áp dụng chiến lược xóa nào?**

Redis áp dụng chiến lược kết hợp **periodic deletion + lazy/lazy deletion**, đây cũng là lựa chọn của hầu hết các caching framework. Periodic deletion thân thiện hơn với bộ nhớ, lazy deletion thân thiện hơn với CPU. Hai bên mỗi bên có ưu điểm riêng, kết hợp sử dụng vừa có thể cân bằng thân thiện CPU, vừa cân bằng thân thiện bộ nhớ.

Dưới đây là giới thiệu chi tiết về cách thực hiện periodic deletion trong Redis.

Quá trình periodic deletion của Redis là ngẫu nhiên (định kỳ lấy ngẫu nhiên một batch từ các key đã đặt thời gian hết hạn), vì vậy không đảm bảo tất cả expired key đều được xóa ngay lập tức. Điều này cũng giải thích tại sao có một số key đã hết hạn nhưng chưa bị xóa. Ngoài ra, Redis bên dưới sẽ giới hạn thời lượng và tần suất thực hiện thao tác xóa để giảm ảnh hưởng của thao tác xóa đến thời gian CPU.

Ngoài ra, periodic deletion còn bị ảnh hưởng bởi thời gian thực hiện và tỷ lệ expired key:

- Nếu thời gian thực hiện đã vượt quá ngưỡng, thì ngắt vòng lặp periodic deletion này để tránh dùng quá nhiều thời gian CPU.
- Nếu tỷ lệ expired key trong batch này vượt quá một tỷ lệ nhất định, sẽ lặp lại quy trình xóa này để tích cực hơn trong việc dọn dẹp expired key. Tương ứng, nếu tỷ lệ expired key thấp hơn tỷ lệ này, sẽ ngắt vòng lặp periodic deletion này, tránh làm quá nhiều việc mà thu hồi được ít bộ nhớ.

Ngưỡng thời gian thực hiện của phiên bản Redis 7.2 là **25ms**, tỷ lệ expired key được đặt là **10%**.

```c
#define ACTIVE_EXPIRE_CYCLE_FAST_DURATION 1000 /* Microseconds. */
#define ACTIVE_EXPIRE_CYCLE_SLOW_TIME_PERC 25 /* Max % of CPU to use. */
#define ACTIVE_EXPIRE_CYCLE_ACCEPTABLE_STALE 10 /* % of stale keys after which
                                                   we do extra efforts. */
```

**Mỗi lần lấy ngẫu nhiên bao nhiêu?**

`expire.c` định nghĩa số lượng lấy ngẫu nhiên mỗi lần, phiên bản Redis 7.2 là 20, tức là mỗi lần sẽ lấy ngẫu nhiên 20 key đã đặt thời gian hết hạn để xác định có hết hạn không.

```c
#define ACTIVE_EXPIRE_CYCLE_KEYS_PER_LOOP 20 /* Keys for each DB loop. */
```

**Cách kiểm soát tần suất thực hiện periodic deletion?**

Trong Redis, tần suất periodic deletion được kiểm soát bởi tham số **hz**. hz mặc định là 10, nghĩa là thực hiện 10 lần mỗi giây, tức là mỗi giây thực hiện 10 lần thử tìm và xóa expired key.

Phạm vi giá trị của hz là 1~500. Tăng giá trị tham số hz sẽ nâng cao tần suất periodic deletion. Nếu bạn muốn thực hiện periodic deletion thường xuyên hơn, có thể tăng giá trị hz một cách phù hợp, nhưng điều này sẽ tăng tỷ lệ sử dụng CPU. Theo khuyến nghị chính thức Redis, giá trị hz không nên vượt quá 100, với hầu hết người dùng dùng mặc định 10 là đủ.

Dưới đây là chú thích chính thức của tham số hz, tôi đã dịch các thông tin quan trọng (phiên bản Redis 7.2).

![redis.conf chú thích về hz](/images/github/javaguide/database/redis/redis.conf-hz.png)

Còn một tham số tương tự là **dynamic-hz**, sau khi bật tham số này Redis sẽ tính động một giá trị trên cơ sở hz. Redis cung cấp và mặc định bật khả năng sử dụng giá trị hz thích ứng,

Hai tham số này đều ở trong file cấu hình Redis `redis.conf`:

```properties
# 默认为 10
hz 10
# 默认开启
dynamic-hz yes
```

Thêm một điều, ngoài task định kỳ xóa expired key này, còn có một số task định kỳ khác ví dụ đóng kết nối client timeout, cập nhật thông tin thống kê, tần suất thực hiện của các task định kỳ này cũng được quyết định bởi tham số hz.

**Tại sao periodic deletion không xóa tất cả expired key?**

Điều này sẽ gây ảnh hưởng quá lớn đến hiệu năng. Nếu số lượng key của chúng ta rất lớn, duyệt kiểm tra từng cái rất tốn thời gian, sẽ ảnh hưởng nghiêm trọng đến hiệu năng. Mục đích Redis thiết kế chiến lược này là để cân bằng bộ nhớ và hiệu năng.

**Tại sao sau khi key hết hạn không xóa ngay lập tức? Làm vậy không lãng phí nhiều không gian bộ nhớ sao?**

Vì không dễ thực hiện, hay nói cách khác chi phí của phương thức xóa này quá cao. Giả sử chúng ta dùng delay queue làm chiến lược xóa, sẽ tồn tại các vấn đề sau:

1. Chi phí của bản thân queue có thể rất lớn: Khi key nhiều, một delay queue có thể không chứa được.
2. Duy trì delay queue quá rắc rối: Chỉnh sửa thời gian hết hạn của key cần điều chỉnh vị trí của nó trong delay queue, và còn cần giới thiệu concurrent control.

### Phải làm gì khi có lượng lớn key cùng hết hạn?

Khi tồn tại lượng lớn key hết hạn vào cùng một thời điểm trong Redis, có thể dẫn đến các vấn đề sau:

- **Tăng độ trễ request**: Redis khi xử lý expired key cần tiêu thụ tài nguyên CPU, nếu số lượng expired key rất lớn, sẽ dẫn đến tỷ lệ sử dụng CPU của Redis instance tăng cao, qua đó ảnh hưởng đến tốc độ xử lý các request khác, gây tăng độ trễ.
- **Chiếm dụng bộ nhớ quá cao**: Các key đã hết hạn tuy đã không hợp lệ, nhưng trước khi Redis thực sự xóa chúng, vẫn chiếm không gian bộ nhớ. Nếu expired key không được dọn sạch kịp thời, có thể dẫn đến chiếm dụng bộ nhớ quá cao, thậm chí gây memory overflow.

Để tránh các vấn đề này, có thể áp dụng các phương án sau:

1. **Hết sức tránh key hết hạn tập trung**: Khi đặt thời gian hết hạn của key nên ngẫu nhiên một chút.
2. **Bật cơ chế lazy free**: Chỉnh sửa file cấu hình `redis.conf`, đặt tham số `lazyfree-lazy-expire` thành `yes`, là có thể bật cơ chế lazy free. Sau khi bật cơ chế lazy free, Redis sẽ xóa bất đồng bộ expired key trong background, không chặn main thread chạy, từ đó giảm ảnh hưởng đến hiệu năng Redis.

### Bạn có hiểu về chiến lược loại bỏ bộ nhớ Redis không?

> Câu hỏi liên quan: MySQL có 2000w dữ liệu, Redis chỉ lưu 20w dữ liệu, làm thế nào để đảm bảo dữ liệu trong Redis đều là hot data?

Chiến lược loại bỏ bộ nhớ của Redis chỉ được kích hoạt khi bộ nhớ đang chạy đạt đến ngưỡng bộ nhớ tối đa được cấu hình, ngưỡng này được định nghĩa bởi tham số `maxmemory` trong `redis.conf`. Trong hệ điều hành 64-bit, `maxmemory` mặc định là 0, nghĩa là không giới hạn kích thước bộ nhớ. Trong hệ điều hành 32-bit, giá trị bộ nhớ tối đa mặc định là 3GB.

Bạn có thể dùng lệnh `config get maxmemory` để xem giá trị `maxmemory`.

```bash
> config get maxmemory
maxmemory
0
```

Redis cung cấp 6 chiến lược loại bỏ bộ nhớ:

1. **volatile-lru (least recently used)**: Từ tập dữ liệu đã đặt thời gian hết hạn (`server.db[i].expires`) chọn dữ liệu được sử dụng ít nhất gần đây để loại bỏ.
2. **volatile-ttl**: Từ tập dữ liệu đã đặt thời gian hết hạn (`server.db[i].expires`) chọn dữ liệu sắp hết hạn để loại bỏ.
3. **volatile-random**: Từ tập dữ liệu đã đặt thời gian hết hạn (`server.db[i].expires`) lấy ngẫu nhiên dữ liệu để loại bỏ.
4. **allkeys-lru (least recently used)**: Từ tập dữ liệu (`server.db[i].dict`) xóa dữ liệu được sử dụng ít nhất gần đây để loại bỏ.
5. **allkeys-random**: Từ tập dữ liệu (`server.db[i].dict`) lấy ngẫu nhiên dữ liệu để loại bỏ.
6. **no-eviction** (chiến lược loại bỏ bộ nhớ mặc định): Cấm evict dữ liệu, khi bộ nhớ không đủ để chứa dữ liệu ghi mới, thao tác ghi mới sẽ báo lỗi.

Sau phiên bản 4.0 thêm hai loại sau:

7. **volatile-lfu (least frequently used)**: Từ tập dữ liệu đã đặt thời gian hết hạn (`server.db[i].expires`) chọn dữ liệu ít được sử dụng nhất để loại bỏ.
8. **allkeys-lfu (least frequently used)**: Từ tập dữ liệu (`server.db[i].dict`) xóa dữ liệu ít được sử dụng nhất để loại bỏ.

`allkeys-xxx` biểu thị loại bỏ dữ liệu từ tất cả cặp key-value, còn `volatile-xxx` biểu thị loại bỏ dữ liệu từ các cặp key-value đã đặt thời gian hết hạn.

`config.c` định nghĩa enum array của chiến lược loại bỏ bộ nhớ:

```c
configEnum maxmemory_policy_enum[] = {
    {"volatile-lru", MAXMEMORY_VOLATILE_LRU},
    {"volatile-lfu", MAXMEMORY_VOLATILE_LFU},
    {"volatile-random",MAXMEMORY_VOLATILE_RANDOM},
    {"volatile-ttl",MAXMEMORY_VOLATILE_TTL},
    {"allkeys-lru",MAXMEMORY_ALLKEYS_LRU},
    {"allkeys-lfu",MAXMEMORY_ALLKEYS_LFU},
    {"allkeys-random",MAXMEMORY_ALLKEYS_RANDOM},
    {"noeviction",MAXMEMORY_NO_EVICTION},
    {NULL, 0}
};
```

Bạn có thể dùng lệnh `config get maxmemory-policy` để xem chiến lược loại bỏ bộ nhớ hiện tại của Redis.

```bash
> config get maxmemory-policy
maxmemory-policy
noeviction
```

Có thể chỉnh sửa chiến lược loại bỏ bộ nhớ bằng lệnh `config set maxmemory-policy <chiến lược loại bỏ bộ nhớ>`, có hiệu lực ngay lập tức, nhưng cách này sau khi restart Redis sẽ mất hiệu lực. Chỉnh sửa tham số `maxmemory-policy` trong `redis.conf` sẽ không bị mất do restart, tuy nhiên cần restart mới có hiệu lực.

```properties
maxmemory-policy noeviction
```

Để biết giải thích chi tiết về chiến lược loại bỏ có thể tham khảo tài liệu chính thức Redis: <https://redis.io/docs/reference/eviction/>.

## Tài liệu tham khảo

- 《Redis 开发与运维》
- 《Redis 设计与实现》
- 《Redis 核心原理与实战》
- Redis command manual: <https://www.redis.com.cn/commands.html>
- RedisSearch ultimate usage guide: <https://mp.weixin.qq.com/s/FA4XVAXJksTOHUXMsayy2g>
- WHY Redis choose single thread (vs multi threads): [https://medium.com/@jychen7/sharing-redis-single-thread-vs-multi-threads-5870bd44d153](https://medium.com/@jychen7/sharing-redis-single-thread-vs-multi-threads-5870bd44d153)

<!-- @include: @article-footer.snippet.md -->
