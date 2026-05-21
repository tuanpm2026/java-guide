---
title: Tổng hợp câu hỏi phỏng vấn cơ bản về Cache
description: Giải thích sâu ý tưởng cốt lõi của cache, sự khác biệt giữa local cache và distributed cache, thiết kế kiến trúc multi-level cache. Bao gồm Caffeine, Redis và các giải pháp cache chính, cùng giải pháp cache consistency. Phù hợp cho Java developer học thiết kế cache architecture.
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: cache,local cache,distributed cache,multi-level cache,Caffeine,Redis,cache consistency,system design,Java cache,Guava Cache
---

> **Câu hỏi phỏng vấn liên quan**:
>
> - Tại sao phải dùng cache?
> - Local cache nên làm như thế nào?
> - Tại sao cần distributed cache? / Tại sao không dùng local cache trực tiếp?
> - Tại sao cần multi-level cache?
> - Multi-level cache phù hợp với những tình huống nghiệp vụ nào?

## Ý tưởng cơ bản của Cache

Nhiều bạn chỉ biết cache có thể cải thiện hiệu năng hệ thống và giảm **response time**, nhưng không rõ ý tưởng cốt lõi của cache là gì.

Ý tưởng cơ bản của cache thực ra rất đơn giản — đó là ứng dụng chiến lược tối ưu hiệu năng kinh điển mà chúng ta rất quen thuộc: **đánh đổi không gian lấy thời gian**. Đánh đổi không gian lấy thời gian nghĩa là dùng nhiều không gian lưu trữ hơn để lưu một số dữ liệu có thể được tái sử dụng hoặc tính toán lại, từ đó giảm thời gian lấy lại hoặc tính toán dữ liệu.

Nói đến đánh đổi không gian lấy thời gian, ngoài cache bạn còn nghĩ đến ví dụ nào khác không? Dưới đây liệt kê thêm một số ví dụ phổ biến:

- **Index**: Index là cấu trúc dữ liệu riêng biệt tổ chức một số column hoặc field của bảng database theo quy tắc sắp xếp nhất định. Tuy cần thêm không gian, nhưng có thể cải thiện đáng kể hiệu quả retrieval và giảm chi phí sắp xếp dữ liệu.
- **Redundant database field**: Lưu dữ liệu thường xuyên join query vào cùng một bảng để giảm JOIN query đa bảng, tăng hiệu năng query và giảm tải database.
- **CDN (Content Delivery Network)**: Phân phối static resource đến nhiều edge node để người dùng truy cập từ node gần nhất, tăng tốc truy cập static resource và giảm tải origin server và băng thông.

Học lập trình cần biết tổng kết và liên kết những gì đã học! Nếu trong phỏng vấn bạn có thể nói đến những điều này, phỏng vấn viên nhất định có ấn tượng tốt với bạn.

Đừng coi cache là thứ gì cao siêu — mặc dù hiệu quả cost-performance cải thiện hiệu năng hệ thống của nó rất cao. Khi học và áp dụng cache, bạn sẽ thấy ý tưởng cache thực ra được dùng rộng rãi ở nhiều nơi như CPU, OS và nhiều chỗ khác.

Ví dụ, **CPU Cache** cache dữ liệu memory để giải quyết sự không khớp giữa tốc độ xử lý **CPU** và tốc độ truy cập memory; memory cache dữ liệu HDD để giải quyết tốc độ **I/O** HDD quá chậm.

![Sơ đồ CPU Cache model](/images/github/javaguide/java/concurrent/cpu-cache.png)

Ví dụ khác, để tăng tốc chuyển đổi từ virtual address sang physical address, OS giới thiệu **TLB (Translation Lookaside Buffer)** (còn gọi là fast lookup table) trên cơ sở page table scheme.

![Address translation sau khi thêm TLB](/images/github/javaguide/cs-basics/operating-system/physical-virtual-address-translation-mmu.png)

Lấy trình duyệt hàng ngày, nó cache ảnh hoặc static file đã truy cập (browser cache), nên lần sau truy cập cùng trang web tốc độ tải sẽ tăng đáng kể.

![](/images/github/javaguide/database/redis/chrome-clear-cache.png)

Cache sử dụng trong phát triển hàng ngày thường lưu dữ liệu trong **RAM** (memory), tốc độ truy cập cực nhanh. Để tránh mất dữ liệu memory khi restart hoặc crash, nhiều cache middleware (như **Redis**) cung cấp cơ chế disk persistence. So với RDBMS (như **MySQL**), tốc độ truy cập cache và lượng concurrency hỗ trợ cao hơn vài bậc. Thêm một tầng cache trên database là biện pháp cốt lõi để bảo vệ underlying storage và tăng throughput hệ thống.

## Phân loại Cache

Tiếp theo xem cache sử dụng trong phát triển hàng ngày thường được chia thành các loại nào.

### Local Cache

#### Local Cache là gì?

Loại này thực ra được dùng khá nhiều trong nhiều dự án, đặc biệt với monolithic architecture. Nếu data volume nhỏ và không có yêu cầu distributed thì dùng local cache vẫn ổn.

Local cache nằm bên trong ứng dụng, ưu điểm lớn nhất là ứng dụng và cache cùng process, tốc độ request local cache rất nhanh, không có network overhead thêm.

Sơ đồ monolithic architecture phổ biến như dưới — chúng ta dùng **Nginx** để **load balancing**, deploy hai ứng dụng giống nhau lên server, hai service dùng chung database và local cache.

![Sơ đồ Local Cache](/images/github/javaguide/database/redis/local-cache.png)

**Lưu ý:** Khi dùng local cache trong cluster mode, phải xem xét **load balancing strategy**. Nếu Nginx dùng **Round-Robin** mặc định, request của cùng một user sẽ ngẫu nhiên rơi vào máy khác nhau, khiến local cache hit rate cực thấp. Giải pháp:

1. **Gateway layer**: Dùng consistent hashing hoặc Sticky Session, đảm bảo request của cùng user luôn đến cùng một máy.
2. **Application layer**: Chỉ dùng local cache cho dữ liệu **"gần như không thay đổi globally"** (như config dictionary), không phải dữ liệu theo user dimension.

#### Local Cache có những phương án nào?

**1. `HashMap` và `ConcurrentHashMap` có sẵn trong JDK.**

`ConcurrentHashMap` có thể coi là phiên bản thread-safe của `HashMap`, cả hai đều lưu key/value pairs. Nhưng hầu hết tình huống sẽ không dùng hai thứ này làm cache, vì chỉ cung cấp chức năng cache mà không có các chức năng khác như expiration time. Một cache framework tương đối hoàn chỉnh ít nhất phải cung cấp: **expiration time**, **eviction mechanism**, **hit rate statistics**.

**2. `Ehcache`, `Guava Cache`, `Spring Cache` là ba local cache framework được dùng nhiều nhất.**

- `Ehcache` nặng hơn so với hai cái kia. Nhưng so với `Guava Cache`, `Spring Cache`, `Ehcache` hỗ trợ nhúng vào hibernate và mybatis làm multi-level cache, có thể persist dữ liệu cache ra local disk, và cũng cung cấp giải pháp cluster (khá yếu, có thể bỏ qua).
- `Guava Cache` và `Spring Cache` khá giống nhau. `Guava` được dùng nhiều hơn `Spring Cache`, cung cấp API rất tiện, cũng cung cấp cài đặt cache validity time, v.v. Triển khai nội bộ cũng khá clean, nhiều chỗ có tư tưởng tương tự `ConcurrentHashMap`.
- Dùng annotation của `Spring Cache` để triển khai cache thì code trông sạch và elegant, nhưng rất dễ gặp vấn đề như cache penetration, memory overflow.

**3. Newbie Caffeine.**

So với `Guava`, `Caffeine` vượt trội hơn về mọi mặt như hiệu năng. Thường khuyến nghị dùng nó thay thế `Guava`. Hơn nữa, cách dùng `Guava` và `Caffeine` rất giống nhau!

Ví dụ code tạo local cache bằng `Caffeine`, dùng builder pattern:

```java
// Ví dụ tạo local cache dùng Caffeine
Cache<String, String> cache = Caffeine.newBuilder()
        // Đặt expired sau 60 ngày kể từ khi ghi
        .expireAfterWrite(60, TimeUnit.DAYS)
        // Initial capacity
        .initialCapacity(100)
        // Giới hạn số lượng tối đa
        .maximumSize(500)
        // Bật chức năng statistics
        .recordStats()
        .build();
```

#### Local Cache có những nhược điểm gì?

Ưu điểm của local cache rất rõ ràng: **ít dependency**, **nhẹ**, **đơn giản**, **chi phí thấp**.

Nhưng local cache có những nhược điểm sau:

- **Local cache coupled với ứng dụng, không thân thiện với distributed architecture**. Ví dụ khi cùng một service deploy lên nhiều máy, cache giữa các service không thể share, vì local cache chỉ tồn tại trên máy hiện tại.
- **Capacity của local cache bị giới hạn rõ ràng bởi máy deploy service**. Nếu service hiện tại tiêu tốn nhiều memory, thì local cache có capacity sử dụng được rất ít.

### Distributed Cache

#### Distributed Cache là gì?

Chúng ta có thể coi distributed cache như một dịch vụ in-memory database, mục đích cuối cùng là cung cấp dịch vụ cache data.

Distributed cache tách biệt với ứng dụng, nhiều ứng dụng có thể cùng sử dụng một distributed cache service.

Như hình dưới là sơ đồ kiến trúc đơn giản dùng distributed cache. Chúng ta dùng Nginx để load balancing, deploy hai ứng dụng giống nhau lên server, hai service dùng chung database và cache.

![Distributed Cache](/images/github/javaguide/database/redis/distributed-cache.png)

Sau khi dùng distributed cache, cache service có thể deploy trên một server riêng. Dù cùng một service deploy lên nhiều máy cũng dùng chung một bản cache. Hơn nữa, hiệu năng, capacity và các chức năng của distributed cache service riêng biệt đều mạnh hơn nhiều.

**Trong thiết kế hệ thống phần mềm không có silver bullet — việc giới thiệu bất kỳ công nghệ nào thường như con dao hai lưỡi.** Nếu dùng đúng cách, có thể mang lại lợi ích lớn cho hệ thống. Ngược lại chỉ tốn công mà không được gì.

Nói đơn giản, sau khi giới thiệu distributed cache vào hệ thống thường gây ra các vấn đề sau:

- **Tăng độ phức tạp của hệ thống**: Sau khi giới thiệu cache, cần duy trì data consistency giữa cache và database, duy trì hot cache, đảm bảo high availability của cache service, v.v.
- **Chi phí phát triển hệ thống thường tăng**: Giới thiệu cache đồng nghĩa hệ thống cần một cache service riêng biệt — đây là chi phí cần trả, và chi phí này còn khá đắt vì tiêu tốn memory quý giá.

#### Distributed Cache có những phương án nào?

Với distributed cache, **Memcached** và **Redis** là hai cái lâu đời và được dùng nhiều nhất. Tuy nhiên, hiện nay gần như không thấy dự án nào còn dùng **Memcached** làm cache — tất cả đều dùng trực tiếp **Redis**.

Memcached phổ biến vào thời kỳ distributed cache mới nổi. Sau đó khi Redis phát triển, mọi người dần chuyển sang dùng Redis mạnh hơn.

Một số công ty lớn cũng open source các distributed high-performance KV storage database tương tự Redis. Ví dụ Tencent open source [Tendis](https://github.com/Tencent/Tendis). Tendis dựa trên project open source nổi tiếng [RocksDB](https://github.com/facebook/rocksdb) làm storage engine, 100% tương thích Redis protocol và tất cả data model của Redis 4.0. Về so sánh Redis và Tendis, Tencent từng publish bài: [Redis vs Tendis: Kiến trúc hot-cold mixed storage](https://mp.weixin.qq.com/s/MeYkfOIdnU6LYlsGb24KjQ) để tham khảo.

Tuy nhiên, qua commit record của project Tendis trên Github có thể thấy, open source version của Tendis gần như không còn được maintain. Cộng thêm độ quan tâm không cao và ít công ty dùng, không khuyến nghị dùng Tendis để triển khai distributed cache.

Hiện tại, hai Redis alternative được industry công nhận nhiều nhất là hai open source distributed cache sau (cả hai đều "hot" nhờ Redis):

- [Dragonfly](https://github.com/dragonflydb/dragonfly): In-memory database được xây dựng để đáp ứng nhu cầu tải của ứng dụng hiện đại. Hoàn toàn tương thích Redis và Memcached API, migrate không cần sửa code, tự xưng là in-memory database nhanh nhất thế giới.
- [KeyDB](https://github.com/Snapchat/KeyDB): Branch hiệu năng cao của Redis, tập trung vào multi-threading, memory efficiency và high throughput.

Tuy nhiên, cá nhân vẫn khuyến nghị chọn Redis làm distributed cache trước tiên — sau nhiều năm được kiểm chứng trong production, ecosystem cũng rất tốt và tài liệu rất đầy đủ.

### Multi-level Cache

#### Multi-level Cache là gì? Tại sao dùng?

Ở đây chỉ bàn đơn giản về phương án multi-level cache **local cache + distributed cache** — đây cũng là cách triển khai multi-level cache phổ biến nhất.

Lúc này chắc nhiều bạn sẽ hỏi: **Đã dùng distributed cache rồi, tại sao còn dùng local cache?**

Mặc dù cả local cache và distributed cache đều là cache, nhưng tốc độ truy cập local cache cao hơn nhiều so với distributed cache — vì truy cập local cache không có network overhead thêm, như đã đề cập ở trên.

Tuy nhiên, thông thường chúng ta cũng không khuyến nghị dùng multi-level cache, vì tăng gánh nặng maintenance (ví dụ cần đảm bảo data consistency giữa L1 và L2 cache). Và hiệu quả cải thiện thực tế cũng không quá lớn với hầu hết các tình huống nghiệp vụ.

Tóm tắt hai tình huống nghiệp vụ phù hợp với multi-level cache:

- Dữ liệu cache không thường xuyên thay đổi, tương đối ổn định.
- Lượng truy cập dữ liệu đặc biệt lớn, ví dụ như flash sale scenario.

Trong phương án multi-level cache, L1 (first-level cache) dùng local memory (ví dụ Caffeine), L2 (second-level cache) dùng distributed cache (ví dụ Redis).

![Multi-level Cache](/images/javaguide/database/redis/multilevel-cache.png)

Khi đọc cache data, trước tiên đọc từ L1; nếu không có mới đọc từ L2. Điều này giảm áp lực lên L2 và số lần đọc L2. Nếu L2 cũng không có data, đọc từ database. Sau khi query database thành công, ghi data vào cả L1 và L2.

Các open source triển khai multi-level cache được khuyến nghị:

- [J2Cache](https://gitee.com/ld/J2Cache): Two-level Java cache framework dựa trên local memory và Redis.
- [JetCache](https://github.com/alibaba/jetcache): Cache framework open source của Alibaba, hỗ trợ multi-level cache, distributed cache auto-refresh, TTL và các chức năng khác.

#### Làm thế nào để đảm bảo consistency của Multi-level Cache?

Trong multi-level cache system, đảm bảo strong consistency chi phí quá cao. Các cache framework cung cấp chức năng multi-level cache hiện nay hầu hết chỉ đảm bảo eventual consistency. Ví dụ, có thể dùng Redis pub/sub mechanism, Redis Stream hoặc message queue để đảm bảo khi local cache của một instance thay đổi, các instance khác có thể update local cache kịp thời để duy trì cache consistency.

Phương án của Zhengcai Cloud Tech là Canal + broadcast message. Giới thiệu ngắn gọn:

1. DB modify data: Trước tiên sửa đổi dữ liệu trong database.
2. Lắng nghe Canal message, trigger cache update: Dùng Canal lắng nghe DB change operation. Khi phát hiện data thay đổi, trigger cache update.
3. Sync Redis cache: Với Redis cache, vì cluster chỉ share một bản dữ liệu, sync cache trực tiếp là được.
4. Sync local cache: Vì local cache phân bổ trong các JVM instance khác nhau, cần dùng broadcast message queue (MQ) mechanism để broadcast update notification đến các business instance để sync local cache.

Giới thiệu chi tiết: [Thiết kế và thực chiến Distributed Multi-level Cache System](https://juejin.cn/post/7225634879152570405)

## Tài liệu tham khảo

- Cache những điều cần biết: https://tech.meituan.com/2017/03/17/cache-about.html
- Phân tích thiết kế cache trong distributed system: https://segmentfault.com/a/1190000041689802
