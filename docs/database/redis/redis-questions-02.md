---
title: Tổng hợp câu hỏi phỏng vấn Redis thường gặp (Phần 2)
description: "Tổng hợp câu hỏi phỏng vấn Redis mới nhất (Phần 2): Phân tích chuyên sâu về nguyên lý transaction Redis, tối ưu hiệu năng (pipeline/Lua/bigkey/hotkey), giải pháp cache penetration/breakdown/avalanche, slow query và memory fragmentation, Redis Sentinel và Cluster chi tiết. Giúp bạn dễ dàng vượt qua phỏng vấn kỹ thuật backend!"
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis面试题,Redis事务,Redis性能优化,Redis缓存穿透,Redis缓存击穿,Redis缓存雪崩,Redis bigkey,Redis hotkey,Redis慢查询,Redis内存碎片,Redis集群,Redis Sentinel,Redis Cluster,Redis pipeline,Redis Lua脚本
---

<!-- @include: @article-header.snippet.md -->

## Redis Transaction (Giao dịch Redis)

### Redis transaction là gì?

Bạn có thể hiểu transaction trong Redis như sau: **Redis transaction cung cấp một cơ chế đóng gói nhiều lệnh lại với nhau. Sau đó, tất cả các lệnh đó sẽ được thực thi tuần tự và không bị gián đoạn giữa chừng.**

Transaction trong Redis rất ít được sử dụng trong thực tế phát triển, tính năng khá hạn chế, đừng nhầm lẫn với transaction trong các cơ sở dữ liệu quan hệ thông thường.

Ngoài việc không đáp ứng tính nguyên tử (atomicity) và bền vững (durability), mỗi lệnh trong transaction đều phải giao tiếp qua mạng với Redis server, đây là một hành vi khá tốn kém tài nguyên. Rõ ràng chỉ cần một lần thực thi hàng loạt lệnh là đủ, nên kiểu thao tác này thật sự không dễ hiểu.

Do đó, Redis transaction không được khuyến nghị sử dụng trong phát triển hàng ngày.

### Làm thế nào để sử dụng Redis transaction?

Redis có thể thực hiện chức năng Transaction thông qua các lệnh **`MULTI`、`EXEC`、`DISCARD` và `WATCH`**.

```bash
> MULTI
OK
> SET PROJECT "JavaGuide"
QUEUED
> GET PROJECT
QUEUED
> EXEC
1) OK
2) "JavaGuide"
```

Sau lệnh [`MULTI`](https://redis.io/commands/multi), bạn có thể nhập nhiều lệnh. Redis sẽ không thực thi ngay các lệnh này mà đưa chúng vào hàng đợi. Khi lệnh [`EXEC`](https://redis.io/commands/exec) được gọi, tất cả các lệnh mới được thực thi.

Quá trình diễn ra như sau:

1. Bắt đầu transaction (`MULTI`);
2. Lệnh vào hàng đợi (thao tác hàng loạt với Redis theo thứ tự FIFO);
3. Thực thi transaction (`EXEC`).

Bạn cũng có thể hủy một transaction bằng lệnh [`DISCARD`](https://redis.io/commands/discard), lệnh này sẽ xóa tất cả các lệnh đã lưu trong hàng đợi transaction.

```bash
> MULTI
OK
> SET PROJECT "JavaGuide"
QUEUED
> GET PROJECT
QUEUED
> DISCARD
OK
```

Bạn có thể theo dõi một Key cụ thể bằng lệnh [`WATCH`](https://redis.io/commands/watch). Khi lệnh `EXEC` được thực thi để thực hiện transaction, nếu một Key đang được `WATCH` giám sát bị **client/Session khác** sửa đổi, toàn bộ transaction sẽ không được thực thi.

```bash
# Client 1
> SET PROJECT "RustGuide"
OK
> WATCH PROJECT
OK
> MULTI
OK
> SET PROJECT "JavaGuide"
QUEUED

# Client 2
# Sửa đổi giá trị PROJECT trước khi client 1 thực thi lệnh EXEC để commit transaction
> SET PROJECT "GoGuide"

# Client 1
# Sửa đổi thất bại vì giá trị PROJECT đã bị client 2 thay đổi
> EXEC
(nil)
> GET PROJECT
"GoGuide"
```

Tuy nhiên, nếu **WATCH** và **transaction** trong cùng một Session, và thao tác sửa đổi Key đang được **WATCH** giám sát xảy ra bên trong transaction, thì transaction đó vẫn có thể được thực thi thành công (tham khảo issue: [Hiệu ứng khác nhau của lệnh WATCH khi gặp lệnh MULTI](https://github.com/Snailclimb/JavaGuide/issues/1714)).

Sửa đổi Key được WATCH giám sát bên trong transaction:

```bash
> SET PROJECT "JavaGuide"
OK
> WATCH PROJECT
OK
> MULTI
OK
> SET PROJECT "JavaGuide1"
QUEUED
> SET PROJECT "JavaGuide2"
QUEUED
> SET PROJECT "JavaGuide3"
QUEUED
> EXEC
1) OK
2) OK
3) OK
127.0.0.1:6379> GET PROJECT
"JavaGuide3"
```

Sửa đổi Key được WATCH giám sát bên ngoài transaction:

```bash
> SET PROJECT "JavaGuide"
OK
> WATCH PROJECT
OK
> SET PROJECT "JavaGuide2"
OK
> MULTI
OK
> GET USER
QUEUED
> EXEC
(nil)
```

Giới thiệu liên quan trên trang chủ Redis [https://redis.io/topics/transactions](https://redis.io/topics/transactions) như sau:

![Redis Transaction](/images/github/javaguide/database/redis/redis-transactions.png)

### Redis transaction có hỗ trợ tính nguyên tử không?

Transaction của Redis khác với transaction của cơ sở dữ liệu quan hệ thông thường. Chúng ta biết rằng transaction có bốn đặc điểm: **1. Tính nguyên tử**, **2. Tính cô lập**, **3. Tính bền vững**, **4. Tính nhất quán**.

1. **Tính nguyên tử (Atomicity)**: Transaction là đơn vị thực thi nhỏ nhất, không thể phân chia. Tính nguyên tử đảm bảo các hành động hoặc được thực hiện hoàn toàn hoặc không có hiệu lực gì;
2. **Tính cô lập (Isolation)**: Khi truy cập cơ sở dữ liệu đồng thời, transaction của một người dùng không bị can thiệp bởi transaction của người khác, các transaction đồng thời độc lập với nhau;
3. **Tính bền vững (Durability)**: Sau khi một transaction được commit, những thay đổi của nó đối với dữ liệu trong cơ sở dữ liệu là vĩnh viễn, ngay cả khi cơ sở dữ liệu gặp sự cố cũng không ảnh hưởng;
4. **Tính nhất quán (Consistency)**: Trước và sau khi thực thi transaction, dữ liệu vẫn nhất quán, nhiều transaction đọc cùng một dữ liệu sẽ cho kết quả giống nhau.

Khi xảy ra lỗi trong quá trình thực thi, Redis transaction chỉ bỏ qua lệnh bị lỗi, các lệnh còn lại vẫn được thực thi bình thường. Hơn nữa, Redis transaction không hỗ trợ thao tác rollback. Do đó, Redis transaction thực sự không đáp ứng tính nguyên tử.

Trang chủ Redis cũng giải thích lý do tại sao họ không hỗ trợ rollback. Nói ngắn gọn, các nhà phát triển Redis cho rằng không cần thiết phải hỗ trợ rollback, điều này đơn giản và thuận tiện hơn đồng thời có hiệu năng tốt hơn. Họ cho rằng ngay cả khi lệnh thực thi có lỗi thì lỗi đó cũng nên được phát hiện trong quá trình phát triển, không phải trong môi trường production.

![Tại sao Redis không hỗ trợ rollback](/images/github/javaguide/database/redis/redis-rollback.png)

**Issues liên quan**:

- [issue#452: Vấn đề về transaction Redis không đáp ứng tính nguyên tử](https://github.com/Snailclimb/JavaGuide/issues/452).
- [Issue#491: Redis không có rollback transaction?](https://github.com/Snailclimb/JavaGuide/issues/491).

### Redis transaction có hỗ trợ tính bền vững không?

Một điểm khác biệt quan trọng của Redis so với Memcached là Redis hỗ trợ tính bền vững với 3 phương thức:

- Snapshot (snapshotting, RDB);
- Append-only file (AOF);
- Tính bền vững hỗn hợp RDB và AOF (thêm mới trong Redis 4.0).

So với tính bền vững RDB, tính bền vững AOF có tính thời gian thực tốt hơn. Trong file cấu hình Redis có ba chiến lược fsync AOF khác nhau:

```bash
appendfsync always    #每次有数据修改发生时，主线程直接调用fsync同步AOF文件（刷盘），fsync完成后返回。always由主线程执行而非后台线程，严重降低Redis性能
appendfsync everysec  #每秒钟调用fsync函数同步一次AOF文件
appendfsync no        #让操作系统决定何时进行同步，一般为30秒一次
```

Chiến lược fsync của AOF là `no` hoặc `everysec` đều có nguy cơ mất dữ liệu. `always` về cơ bản có thể đáp ứng yêu cầu tính bền vững, nhưng hiệu năng quá kém nên không được sử dụng trong thực tế phát triển.

Do đó, tính bền vững của Redis transaction cũng không thể được đảm bảo.

### Làm thế nào để giải quyết những hạn chế của Redis transaction?

Redis hỗ trợ thực thi Lua script từ phiên bản 2.6, chức năng của nó rất giống với transaction. Chúng ta có thể sử dụng Lua script để thực thi hàng loạt lệnh Redis, các lệnh này được gửi đến Redis server và thực thi cùng một lúc, giảm đáng kể chi phí mạng.

Một đoạn Lua script có thể được coi là một lệnh được thực thi, trong quá trình thực thi một đoạn Lua script sẽ không có script hay lệnh Redis nào khác chạy đồng thời, đảm bảo các thao tác không bị can thiệp bởi các lệnh khác.

Tuy nhiên, nếu Lua script bị lỗi và kết thúc giữa chừng, các lệnh sau điểm lỗi sẽ không được thực thi. Và các lệnh đã được thực thi trước điểm lỗi không thể được hoàn tác, không thể đạt được hiệu ứng nguyên tử như cơ sở dữ liệu quan hệ khi thực thi thất bại có thể rollback. Do đó, **nói chính xác thì, sử dụng Lua script để thực thi hàng loạt lệnh Redis thực sự cũng không hoàn toàn đáp ứng tính nguyên tử.**

Nếu muốn tất cả các lệnh trong Lua script được thực thi, phải đảm bảo cú pháp và lệnh đều đúng.

Ngoài ra, Redis 7.0 đã thêm tính năng [Redis functions](https://redis.io/docs/latest/develop/programmability/functions-intro/), bạn có thể coi Redis functions như một script mạnh mẽ hơn Lua.

## ⭐️ Tối ưu hiệu năng Redis (Quan trọng)

Ngoài nội dung được giới thiệu dưới đây, đây là hai bài viết hay được khuyến nghị:

- [Redis của bạn có thực sự chậm không? Làm thế nào để tối ưu hiệu năng - Alibaba Developer](https://mp.weixin.qq.com/s/nNEuYw0NlYGhuKKKKoWfcQ).
- [Tổng hợp các nguyên nhân gây blocking Redis thường gặp - JavaGuide](https://javaguide.cn/database/redis/redis-common-blocking-problems-summary.html).

### Sử dụng thao tác hàng loạt để giảm truyền tải mạng

Quá trình thực thi một lệnh Redis có thể được đơn giản hóa thành 4 bước:

1. Gửi lệnh;
2. Lệnh xếp hàng;
3. Thực thi lệnh;
4. Trả về kết quả.

Trong đó, tổng thời gian của bước 1 và bước 4 được gọi là **Round Trip Time (RTT, thời gian khứ hồi)**, tức là thời gian dữ liệu truyền trên mạng.

Sử dụng thao tác hàng loạt có thể giảm số lần truyền mạng, từ đó giảm chi phí mạng một cách hiệu quả, giảm đáng kể RTT.

Ngoài ra, ngoài việc giảm RTT, chi phí socket I/O khi gửi một lệnh cũng khá cao (liên quan đến chuyển đổi ngữ cảnh, có các lệnh gọi hệ thống `read()` và `write()`), thao tác hàng loạt cũng có thể giảm chi phí socket I/O. Điều này được đề cập trong tài liệu chính thức về pipeline: <https://redis.io/docs/manual/pipelining/>.

#### Lệnh thao tác hàng loạt gốc

Trong Redis có một số lệnh hỗ trợ thao tác hàng loạt gốc, ví dụ:

- `MGET` (lấy giá trị của một hoặc nhiều key cụ thể), `MSET` (thiết lập giá trị cho một hoặc nhiều key cụ thể),
- `HMGET` (lấy giá trị của một hoặc nhiều trường cụ thể trong hash table), `HMSET` (thiết lập nhiều cặp field-value vào hash table cụ thể),
- `SADD` (thêm một hoặc nhiều phần tử vào tập hợp cụ thể)
- ……

Tuy nhiên, khi sử dụng giải pháp phân mảnh cluster chính thức của Redis là Redis Cluster, việc sử dụng các lệnh thao tác hàng loạt gốc này có thể gặp một số vấn đề nhỏ cần giải quyết. Ví dụ như `MGET` không thể đảm bảo tất cả key đều nằm trên cùng một **hash slot**, `MGET` vẫn có thể cần nhiều lần truyền mạng, tính nguyên tử cũng không thể đảm bảo. Tuy nhiên, so với thao tác không theo lô, vẫn có thể tiết kiệm đáng kể số lần truyền mạng.

Phiên bản đơn giản hóa của toàn bộ bước như sau (thường được triển khai bởi Redis client, không cần chúng ta tự thực hiện thủ công):

1. Tìm tất cả hash slot tương ứng với key;
2. Gửi yêu cầu `MGET` đến các node Redis tương ứng để lấy dữ liệu;
3. Chờ tất cả yêu cầu hoàn thành, tổng hợp lại dữ liệu kết quả theo thứ tự của key đầu vào, rồi trả về kết quả.

Nếu muốn giải quyết vấn đề truyền mạng nhiều lần này, cách thường dùng là tự duy trì mối quan hệ giữa key và slot. Tuy nhiên cách này không linh hoạt, mặc dù cải thiện hiệu năng nhưng cũng làm tăng độ phức tạp của hệ thống.

> Redis Cluster không sử dụng consistent hashing, mà sử dụng **phân vùng hash slot**, mỗi cặp key-value đều thuộc về một **hash slot**. Khi client gửi lệnh, cần tìm hash slot tương ứng dựa vào key thông qua công thức tính toán trên, sau đó tra cứu mối quan hệ giữa hash slot và node để tìm được Redis node đích.
>
> Tôi đã giới thiệu chi tiết về Redis Cluster trong bài viết [Chi tiết về Redis Cluster (trả phí)](https://javaguide.cn/database/redis/redis-cluster.html), bạn có thể đọc nếu quan tâm.

#### Pipeline

Đối với các lệnh không hỗ trợ thao tác hàng loạt, chúng ta có thể sử dụng **pipeline (đường ống)** để đóng gói một loạt lệnh Redis thành một nhóm, các lệnh này sẽ được gửi đến Redis server cùng một lúc, chỉ cần một lần truyền mạng. Tuy nhiên, cần chú ý kiểm soát **số lượng phần tử** trong một lần thao tác hàng loạt (ví dụ trong vòng 500, thực tế còn phụ thuộc vào kích thước byte của phần tử), tránh lượng dữ liệu truyền mạng quá lớn.

Giống như các lệnh thao tác hàng loạt gốc `MGET`, `MSET`, pipeline khi sử dụng trên Redis Cluster cũng gặp một số vấn đề nhỏ. Lý do tương tự, không thể đảm bảo tất cả key đều nằm trên cùng một **hash slot**. Nếu muốn sử dụng, client cần tự duy trì mối quan hệ giữa key và slot.

Lệnh thao tác hàng loạt gốc và pipeline có sự khác biệt, cần lưu ý khi sử dụng:

- Lệnh thao tác hàng loạt gốc là thao tác nguyên tử, pipeline là thao tác không nguyên tử.
- Pipeline có thể đóng gói các lệnh khác nhau, lệnh thao tác hàng loạt gốc không thể.
- Lệnh thao tác hàng loạt gốc được hỗ trợ và triển khai bởi Redis server, còn pipeline cần sự phối hợp triển khai của cả server lẫn client.

Bổ sung thêm so sánh giữa pipeline và Redis transaction:

- Transaction là thao tác nguyên tử, pipeline là thao tác không nguyên tử. Hai transaction khác nhau sẽ không chạy đồng thời, trong khi pipeline có thể chạy đồng thời theo cách xen kẽ.
- Mỗi lệnh trong Redis transaction cần được gửi đến server, còn Pipeline chỉ cần gửi một lần, ít yêu cầu hơn.

> Transaction có thể được coi là một thao tác nguyên tử, nhưng thực ra không đáp ứng tính nguyên tử. Khi đề cập đến thao tác nguyên tử trong Redis, chủ yếu có nghĩa là thao tác đó (như transaction, Lua script) không bị can thiệp bởi các thao tác khác (như transaction khác, Lua script khác), không thể hoàn toàn đảm bảo tất cả các lệnh ghi trong thao tác đó hoặc đều được thực thi hoặc đều không được thực thi. Điều này cũng chủ yếu là do Redis không hỗ trợ rollback.

![](/images/github/javaguide/database/redis/redis-pipeline-vs-transaction.png)

Ngoài ra, pipeline không phù hợp để thực thi một loạt lệnh có quan hệ phụ thuộc về thứ tự thực thi. Ví dụ, nếu bạn cần sử dụng kết quả của lệnh trước cho các lệnh tiếp theo, pipeline không thể đáp ứng yêu cầu của bạn. Với nhu cầu này, chúng ta có thể sử dụng **Lua script**.

#### Lua Script

Lua script cũng hỗ trợ thực thi hàng loạt nhiều lệnh. Một đoạn Lua script có thể được coi là một lệnh được thực thi, có thể xem là **thao tác nguyên tử**. Tức là trong quá trình thực thi một đoạn Lua script sẽ không có script hay lệnh Redis nào khác chạy đồng thời, đảm bảo các thao tác không bị can thiệp bởi các lệnh khác, điều này pipeline không có được.

Hơn nữa, Lua script hỗ trợ một số xử lý logic đơn giản như đọc giá trị bằng lệnh rồi xử lý trong Lua script, điều này cũng là điều pipeline không có được.

Tuy nhiên, Lua script vẫn tồn tại những hạn chế sau:

- Nếu Lua script bị lỗi khi chạy và kết thúc giữa chừng, các thao tác sau sẽ không được thực hiện, nhưng các thao tác ghi đã xảy ra trước đó không thể hoàn tác, do đó ngay cả khi dùng Lua script cũng không thể đạt được tính nguyên tử như rollback trong cơ sở dữ liệu.
- Tính nguyên tử của Lua script trong Redis Cluster cũng không thể đảm bảo, lý do tương tự là không thể đảm bảo tất cả key đều nằm trên cùng một **hash slot**.

### Vấn đề nhiều key hết hạn cùng lúc

Tôi đã đề cập trước đó: Đối với các key hết hạn, Redis sử dụng chiến lược **xóa định kỳ + xóa lười biếng/theo yêu cầu**.

Trong quá trình xóa định kỳ, nếu đột nhiên gặp lượng lớn key hết hạn, yêu cầu từ client phải chờ thread dọn dẹp key hết hạn định kỳ hoàn thành, vì thread định kỳ này chạy trong thread chính của Redis. Điều này dẫn đến yêu cầu client không thể được xử lý kịp thời, tốc độ phản hồi sẽ chậm hơn.

**Làm thế nào để giải quyết?** Dưới đây là hai phương pháp phổ biến:

1. Đặt thời gian hết hạn ngẫu nhiên cho key.
2. Bật lazy-free (xóa lười biếng/giải phóng trì hoãn). Tính năng lazy-free được giới thiệu từ Redis 4.0, có nghĩa là để Redis giải phóng bộ nhớ mà key sử dụng theo cách không đồng bộ, giao thao tác đó cho một thread con riêng biệt để xử lý, tránh block thread chính.

Cá nhân tôi khuyến nghị dù có bật lazy-free hay không, chúng ta cũng nên cố gắng đặt thời gian hết hạn ngẫu nhiên cho key.

### Redis bigkey (Key lớn)

#### bigkey là gì?

Nói đơn giản, nếu value tương ứng với một key chiếm nhiều bộ nhớ, thì key đó có thể được coi là bigkey. Cụ thể bao nhiêu mới gọi là lớn? Có một tiêu chuẩn tham khảo không hoàn toàn chính xác:

- Value của kiểu String vượt quá 1MB
- Value của kiểu phức hợp (List, Hash, Set, Sorted Set, v.v.) chứa hơn 5000 phần tử (tuy nhiên, đối với value kiểu phức hợp, không nhất thiết phần tử càng nhiều thì chiếm bộ nhớ càng lớn).

![Tiêu chuẩn xác định bigkey](/images/github/javaguide/database/redis/bigkey-criterion.png)

#### bigkey được tạo ra như thế nào? Có những tác hại gì?

bigkey thường được tạo ra vì những lý do sau:

- Thiết kế chương trình không phù hợp, ví dụ trực tiếp sử dụng kiểu String để lưu dữ liệu nhị phân của các file lớn.
- Không cân nhắc kỹ về quy mô dữ liệu cho nghiệp vụ, ví dụ khi dùng kiểu tập hợp không lường trước được sự tăng trưởng nhanh chóng của lượng dữ liệu.
- Không kịp thời dọn dẹp dữ liệu rác, ví dụ trong hash có quá nhiều cặp key-value thừa vô nghĩa.

bigkey ngoài việc tiêu tốn nhiều bộ nhớ và băng thông hơn, còn gây ra ảnh hưởng lớn đến hiệu năng.

Trong bài viết [Tổng hợp các nguyên nhân gây blocking Redis thường gặp](./redis-common-blocking-problems-summary.md) chúng ta đã đề cập: key lớn cũng gây ra vấn đề blocking. Cụ thể, chủ yếu thể hiện ở ba khía cạnh sau:

1. Client timeout blocking: Vì Redis thực thi lệnh theo mô hình single-thread, khi thao tác với key lớn sẽ mất nhiều thời gian hơn, điều này sẽ block Redis, từ góc nhìn client thì cảm giác mãi mà không có phản hồi.
2. Network blocking: Mỗi lần lấy key lớn tạo ra lưu lượng mạng lớn, nếu một key có kích thước 1 MB, lượng truy cập mỗi giây là 1000 lần, thì mỗi giây sẽ tạo ra 1000MB lưu lượng, đây là thảm họa đối với server có card mạng gigabit thông thường.
3. Worker thread blocking: Nếu sử dụng del để xóa key lớn, sẽ block worker thread, khiến không thể xử lý các lệnh tiếp theo.

Vấn đề blocking do key lớn gây ra còn ảnh hưởng thêm đến master-slave replication và cluster scaling.

Tóm lại, key lớn mang lại nhiều vấn đề tiềm ẩn, chúng ta nên cố gắng tránh để bigkey tồn tại trong Redis.

#### Làm thế nào để phát hiện bigkey?

**1. Sử dụng tham số `--bigkeys` tích hợp sẵn của Redis.**

```bash
# redis-cli -p 6379 --bigkeys

# Scanning the entire keyspace to find biggest keys as well as
# average sizes per key type.  You can use -i 0.1 to sleep 0.1 sec
# per 100 SCAN commands (not usually needed).

[00.00%] Biggest string found so far '"ballcat:oauth:refresh_auth:f6cdb384-9a9d-4f2f-af01-dc3f28057c20"' with 4437 bytes
[00.00%] Biggest list   found so far '"my-list"' with 17 items

-------- summary -------

Sampled 5 keys in the keyspace!
Total key length in bytes is 264 (avg len 52.80)

Biggest   list found '"my-list"' has 17 items
Biggest string found '"ballcat:oauth:refresh_auth:f6cdb384-9a9d-4f2f-af01-dc3f28057c20"' has 4437 bytes

1 lists with 17 items (20.00% of keys, avg size 17.00)
0 hashs with 0 fields (00.00% of keys, avg size 0.00)
4 strings with 4831 bytes (80.00% of keys, avg size 1207.75)
0 streams with 0 entries (00.00% of keys, avg size 0.00)
0 sets with 0 members (00.00% of keys, avg size 0.00)
0 zsets with 0 members (00.00% of keys, avg size 0.00
```

Từ kết quả chạy lệnh này, chúng ta có thể thấy: lệnh này sẽ scan tất cả key trong Redis, có một chút ảnh hưởng đến hiệu năng Redis. Và cách này chỉ có thể tìm ra top 1 bigkey cho mỗi kiểu dữ liệu (String chiếm nhiều bộ nhớ nhất, kiểu dữ liệu phức hợp có nhiều phần tử nhất). Tuy nhiên, số phần tử của một key nhiều không có nghĩa là chiếm bộ nhớ nhiều, cần chúng ta phán đoán thêm dựa trên tình huống nghiệp vụ cụ thể.

Khi thực thi lệnh này trên môi trường production, để giảm ảnh hưởng đến Redis, cần chỉ định tham số `-i` để kiểm soát tần suất scan. `redis-cli -p 6379 --bigkeys -i 3` nghĩa là khoảng thời gian nghỉ sau mỗi lần scan là 3 giây.

**2. Sử dụng lệnh SCAN tích hợp của Redis**

Lệnh `SCAN` có thể trả về các key phù hợp theo một mẫu và số lượng nhất định. Sau khi lấy được key, có thể sử dụng các lệnh như `STRLEN`, `HLEN`, `LLEN` để trả về độ dài hoặc số lượng thành viên.

| Cấu trúc dữ liệu | Lệnh   | Độ phức tạp | Kết quả (key tương ứng)           |
| ---------------- | ------ | ----------- | --------------------------------- |
| String           | STRLEN | O(1)        | Độ dài của giá trị chuỗi          |
| Hash             | HLEN   | O(1)        | Số lượng trường trong hash table  |
| List             | LLEN   | O(1)        | Số lượng phần tử trong list       |
| Set              | SCARD  | O(1)        | Số lượng phần tử trong tập hợp    |
| Sorted Set       | ZCARD  | O(1)        | Số lượng phần tử trong sorted set |

Đối với kiểu tập hợp cũng có thể sử dụng lệnh `MEMORY USAGE` (Redis 4.0+), lệnh này sẽ trả về không gian bộ nhớ mà cặp key-value chiếm dụng.

**3. Sử dụng công cụ mã nguồn mở để phân tích file RDB.**

Tìm key lớn bằng cách phân tích file RDB. Điều kiện tiên quyết của giải pháp này là Redis của bạn đang dùng tính bền vững RDB.

Trên mạng có sẵn code/công cụ để sử dụng trực tiếp:

- [redis-rdb-tools](https://github.com/sripathikrishnan/redis-rdb-tools): Công cụ viết bằng Python để phân tích file snapshot RDB của Redis.
- [rdb_bigkeys](https://github.com/weiyanwei412/rdb_bigkeys): Công cụ viết bằng Go để phân tích file snapshot RDB của Redis, hiệu năng tốt hơn.

**4. Sử dụng dịch vụ phân tích Redis của đám mây công cộng.**

Nếu bạn đang dùng dịch vụ Redis trên đám mây công cộng, hãy xem liệu nó có cung cấp chức năng phân tích key không (thường là có).

Lấy Alibaba Cloud Redis làm ví dụ, nó hỗ trợ phân tích và phát hiện bigkey theo thời gian thực, địa chỉ tài liệu: <https://www.alibabacloud.com/help/zh/apsaradb-for-redis/latest/use-the-real-time-key-statistics-feature>.

![Phân tích Key Alibaba Cloud](/images/github/javaguide/database/redis/aliyun-key-analysis.png)

#### Làm thế nào để xử lý bigkey?

Các phương pháp xử lý và tối ưu bigkey thường gặp như sau (có thể kết hợp các phương pháp này với nhau):

- **Tách bigkey**: Chia một bigkey thành nhiều key nhỏ. Ví dụ, chia một Hash có hàng chục nghìn trường theo một chiến lược nhất định (như double hashing) thành nhiều Hash.
- **Dọn dẹp thủ công**: Redis 4.0+ có thể sử dụng lệnh `UNLINK` để xóa không đồng bộ một hoặc nhiều key cụ thể. Redis dưới 4.0 có thể cân nhắc sử dụng lệnh `SCAN` kết hợp với lệnh `DEL` để xóa theo từng đợt.
- **Sử dụng cấu trúc dữ liệu phù hợp**: Ví dụ, dữ liệu nhị phân của file không dùng String để lưu, dùng HyperLogLog để thống kê UV trang, Bitmap để lưu thông tin trạng thái (0/1).
- **Bật lazy-free (xóa lười biếng/giải phóng trì hoãn)**: Tính năng lazy-free được giới thiệu từ Redis 4.0, có nghĩa là để Redis giải phóng bộ nhớ mà key sử dụng theo cách không đồng bộ, giao thao tác đó cho một thread con riêng biệt để xử lý, tránh block thread chính.

### Redis hotkey (Key nóng)

#### hotkey là gì?

Nếu một key có số lần truy cập nhiều hơn đáng kể so với các key khác, thì key đó có thể được coi là **hotkey (Key nóng)**. Ví dụ, Redis instance xử lý 5000 yêu cầu mỗi giây, trong đó lượng truy cập vào một key cụ thể lên đến 2000 lần mỗi giây, thì key đó có thể được coi là hotkey.

Nguyên nhân xuất hiện hotkey chủ yếu là do lượng truy cập vào một số dữ liệu nóng tăng đột biến, như sự kiện hot search quan trọng, hàng hóa tham gia flash sale.

#### hotkey có những tác hại gì?

Xử lý hotkey sẽ tiêu tốn nhiều CPU và băng thông, có thể ảnh hưởng đến khả năng xử lý bình thường các yêu cầu khác của Redis instance. Ngoài ra, nếu các yêu cầu truy cập hotkey đột ngột vượt quá khả năng xử lý của Redis, Redis sẽ bị down. Trong trường hợp này, lượng lớn yêu cầu sẽ đổ vào cơ sở dữ liệu phía sau, có thể gây sập cơ sở dữ liệu.

Do đó, hotkey rất có thể trở thành điểm tắc nghẽn hiệu năng của hệ thống, cần tối ưu riêng để đảm bảo tính sẵn sàng cao và ổn định của hệ thống.

#### Làm thế nào để phát hiện hotkey?

**1. Sử dụng tham số `--hotkeys` tích hợp sẵn của Redis.**

Phiên bản Redis 4.0.3 đã thêm tham số `hotkeys`, tham số này có thể trả về số lần truy cập của tất cả key.

Điều kiện tiên quyết khi sử dụng giải pháp này là tham số `maxmemory-policy` của Redis Server phải được đặt thành thuật toán LFU, nếu không sẽ xuất hiện lỗi như dưới đây.

```bash
# redis-cli -p 6379 --hotkeys

# Scanning the entire keyspace to find hot keys as well as
# average sizes per key type.  You can use -i 0.1 to sleep 0.1 sec
# per 100 SCAN commands (not usually needed).

Error: ERR An LFU maxmemory policy is not selected, access frequency not tracked. Please note that when switching between policies at runtime LRU and LFU data will take some time to adjust.
```

Redis có hai thuật toán LFU:

1. **volatile-lfu (least frequently used)**: Chọn và loại bỏ dữ liệu ít được sử dụng nhất từ tập dữ liệu đã đặt thời gian hết hạn (`server.db[i].expires`).
2. **allkeys-lfu (least frequently used)**: Khi bộ nhớ không đủ để chứa dữ liệu ghi mới, loại bỏ key ít được sử dụng nhất trong không gian key.

Sau đây là ví dụ trong file cấu hình `redis.conf`:

```properties
# 使用 volatile-lfu 策略
maxmemory-policy volatile-lfu

# 或者使用 allkeys-lfu 策略
maxmemory-policy allkeys-lfu
```

Cần lưu ý rằng lệnh tham số `hotkeys` cũng sẽ tăng tiêu thụ CPU và bộ nhớ của Redis instance (scan toàn cục), do đó cần sử dụng thận trọng.

**2. Sử dụng lệnh `MONITOR`.**

Lệnh `MONITOR` là một cách Redis cung cấp để xem tất cả các thao tác của Redis theo thời gian thực, có thể dùng để giám sát tạm thời tình trạng hoạt động của Redis instance, bao gồm đọc/ghi, xóa và các thao tác khác.

Vì lệnh này ảnh hưởng khá lớn đến hiệu năng Redis, nên cấm bật `MONITOR` trong thời gian dài (khuyến nghị sử dụng thận trọng trong môi trường production).

```bash
# redis-cli
127.0.0.1:6379> MONITOR
OK
1683638260.637378 [0 172.17.0.1:61516] "ping"
1683638267.144236 [0 172.17.0.1:61518] "smembers" "mySet"
1683638268.941863 [0 172.17.0.1:61518] "smembers" "mySet"
1683638269.551671 [0 172.17.0.1:61518] "smembers" "mySet"
1683638270.646256 [0 172.17.0.1:61516] "ping"
1683638270.849551 [0 172.17.0.1:61518] "smembers" "mySet"
1683638271.926945 [0 172.17.0.1:61518] "smembers" "mySet"
1683638274.276599 [0 172.17.0.1:61518] "smembers" "mySet2"
1683638276.327234 [0 172.17.0.1:61518] "smembers" "mySet"
```

Khi xảy ra tình huống khẩn cấp, chúng ta có thể chọn thực thi lệnh `MONITOR` trong thời gian ngắn vào thời điểm thích hợp và chuyển hướng output vào file, sau khi đóng lệnh `MONITOR` phân tích phân loại các yêu cầu trong file để tìm ra hotkey trong khoảng thời gian đó.

**3. Sử dụng các dự án mã nguồn mở.**

Dự án [hotkey](https://gitee.com/jd-platform-opensource/hotkey) của JD Retail không chỉ hỗ trợ phát hiện hotkey mà còn hỗ trợ xử lý hotkey.

![hotkey mã nguồn mở của JD Retail](/images/github/javaguide/database/redis/jd-hotkey.png)

**4. Ước lượng trước dựa trên tình huống nghiệp vụ.**

Có thể ước lượng một số hotkey dựa trên tình huống nghiệp vụ, như dữ liệu hàng hóa tham gia flash sale. Tuy nhiên, chúng ta không thể ước lượng tất cả hotkey xuất hiện, như các sự kiện tin tức nóng bất ngờ.

**5. Ghi lại và phân tích trong code nghiệp vụ.**

Thêm logic tương ứng trong code nghiệp vụ để ghi lại và phân tích tình trạng truy cập của key. Tuy nhiên, cách này sẽ làm tăng độ phức tạp của code nghiệp vụ, thường cũng không được áp dụng.

**6. Sử dụng dịch vụ phân tích Redis của đám mây công cộng.**

Nếu bạn đang dùng dịch vụ Redis trên đám mây công cộng, hãy xem liệu nó có cung cấp chức năng phân tích key không (thường là có).

Lấy Alibaba Cloud Redis làm ví dụ, nó hỗ trợ phân tích và phát hiện hotkey theo thời gian thực, địa chỉ tài liệu: <https://www.alibabacloud.com/help/zh/apsaradb-for-redis/latest/use-the-real-time-key-statistics-feature>.

![Phân tích Key Alibaba Cloud](/images/github/javaguide/database/redis/aliyun-key-analysis.png)

#### Làm thế nào để giải quyết hotkey?

Các phương pháp xử lý và tối ưu hotkey thường gặp như sau (có thể kết hợp các phương pháp này với nhau):

- **Phân tách đọc/ghi**: Node master xử lý yêu cầu ghi, node slave xử lý yêu cầu đọc.
- **Sử dụng Redis Cluster**: Phân tán lưu trữ dữ liệu nóng trên nhiều node Redis.
- **Cache hai cấp**: Xử lý hotkey bằng cách dùng cache hai cấp, lưu một bản sao hotkey vào bộ nhớ cục bộ JVM (có thể dùng Caffeine).

Ngoài các phương pháp này, nếu bạn đang dùng dịch vụ Redis trên đám mây công cộng, cũng có thể chú ý đến các giải pháp out-of-the-box mà họ cung cấp.

Lấy Alibaba Cloud Redis làm ví dụ, nó hỗ trợ tối ưu vấn đề Key nóng thông qua tính năng Proxy Query Cache.

![Tối ưu vấn đề Key nóng thông qua Proxy Query Cache của Alibaba Cloud](/images/github/javaguide/database/redis/aliyun-hotkey-proxy-query-cache.png)

### Lệnh slow query (truy vấn chậm)

#### Tại sao có lệnh slow query?

Chúng ta biết quá trình thực thi một lệnh Redis có thể được đơn giản hóa thành 4 bước:

1. Gửi lệnh;
2. Lệnh xếp hàng;
3. Thực thi lệnh;
4. Trả về kết quả.

Redis slow query thống kê thời gian tiêu tốn ở bước thực thi lệnh, lệnh slow query là những lệnh có thời gian thực thi tương đối dài.

Tại sao Redis lại có lệnh slow query?

Phần lớn các lệnh trong Redis có độ phức tạp thời gian O(1), nhưng cũng có một số lệnh có độ phức tạp thời gian O(n), ví dụ:

- `KEYS *`: Trả về tất cả key phù hợp với quy tắc.
- `HGETALL`: Trả về tất cả cặp key-value trong một Hash.
- `LRANGE`: Trả về các phần tử trong phạm vi chỉ định của List.
- `SMEMBERS`: Trả về tất cả phần tử trong Set.
- `SINTER`/`SUNION`/`SDIFF`: Tính giao/hợp/hiệu của nhiều Set.
- ……

Vì các lệnh này có độ phức tạp thời gian O(n), đôi khi còn scan toàn bộ bảng, khi n tăng lên thì thời gian thực thi cũng kéo dài. Tuy nhiên, những lệnh này không nhất thiết không thể sử dụng, nhưng cần xác định rõ giá trị N. Ngoài ra, nếu có nhu cầu duyệt qua, có thể sử dụng `HSCAN`, `SSCAN`, `ZSCAN` thay thế.

Ngoài các lệnh có độ phức tạp thời gian O(n) có thể gây slow query, còn có một số lệnh có độ phức tạp thời gian có thể lớn hơn O(N), ví dụ:

- `ZRANGE`/`ZREVRANGE`: Trả về tất cả phần tử trong phạm vi ranking chỉ định của Sorted Set. Độ phức tạp thời gian là O(log(n)+m), n là tổng số phần tử, m là số phần tử trả về, khi m và n đều khá lớn thì O(n) có độ phức tạp thời gian nhỏ hơn.
- `ZREMRANGEBYRANK`/`ZREMRANGEBYSCORE`: Xóa tất cả phần tử trong phạm vi ranking chỉ định/phạm vi score chỉ định của Sorted Set. Độ phức tạp thời gian là O(log(n)+m), n là tổng số phần tử, m là số phần tử bị xóa, khi m và n đều khá lớn thì O(n) có độ phức tạp thời gian nhỏ hơn.
- ……

#### Làm thế nào để tìm lệnh slow query?

Redis cung cấp tính năng **Slow Log (nhật ký truy vấn chậm)** tích hợp sẵn, chuyên dùng để ghi lại các lệnh có thời gian thực thi vượt quá ngưỡng chỉ định. Điều này rất hữu ích để phát hiện điểm tắc nghẽn hiệu năng, tìm ra các thao tác "chậm" gây block Redis, nguyên lý tương tự như slow query log trong MySQL.

Trong file `redis.conf`, chúng ta có thể sử dụng tham số `slowlog-log-slower-than` để đặt ngưỡng cho lệnh tốn thời gian, và sử dụng tham số `slowlog-max-len` để đặt số lượng bản ghi tối đa cho lệnh tốn thời gian.

Khi Redis server phát hiện lệnh có thời gian thực thi vượt quá ngưỡng `slowlog-log-slower-than`, nó sẽ ghi lại lệnh đó vào slow log, giống như MySQL ghi lại câu lệnh slow query. Khi slow log vượt quá số lượng bản ghi tối đa đã đặt, Redis sẽ lần lượt bỏ đi các lệnh thực thi sớm nhất.

⚠️ Lưu ý: Vì slow log chiếm một lượng bộ nhớ nhất định, nếu đặt số lượng bản ghi tối đa quá lớn có thể dẫn đến vấn đề bộ nhớ quá cao.

Cấu hình mặc định của `slowlog-log-slower-than` và `slowlog-max-len` như sau (có thể tự sửa):

```properties
# The following time is expressed in microseconds, so 1000000 is equivalent
# to one second. Note that a negative number disables the slow log, while
# a value of zero forces the logging of every command.
slowlog-log-slower-than 10000

# There is no limit to this length. Just be aware that it will consume memory.
# You can reclaim memory used by the slow log with SLOWLOG RESET.
slowlog-max-len 128
```

Ngoài việc sửa file cấu hình, bạn cũng có thể trực tiếp đặt thông qua lệnh `CONFIG`:

```bash
# 命令执行耗时超过 10000 微妙（即10毫秒）就会被记录
CONFIG SET slowlog-log-slower-than 10000
# 只保留最近 128 条耗时命令
CONFIG SET slowlog-max-len 128
```

Lấy nội dung slow log rất đơn giản, trực tiếp sử dụng lệnh `SLOWLOG GET`.

```bash
127.0.0.1:6379> SLOWLOG GET #慢日志查询
 1) 1) (integer) 5
   2) (integer) 1684326682
   3) (integer) 12000
   4) 1) "KEYS"
      2) "*"
   5) "172.17.0.1:61152"
   6) ""
  // ...
```

Mỗi entry trong slow log bao gồm sáu giá trị sau:

1. **ID duy nhất**: Định danh duy nhất của entry log.
2. **Timestamp**: Unix timestamp khi lệnh hoàn thành thực thi.
3. **Thời gian tiêu tốn (Duration)**: Thời gian lệnh thực thi mất, đơn vị là **microsecond**.
4. **Lệnh và tham số (Command)**: Lệnh cụ thể được thực thi và mảng tham số của nó.
5. **Thông tin client (Client IP:Port)**: Địa chỉ và port của client thực thi lệnh.
6. **Tên client (Client Name)**: Nếu client đã đặt tên (CLIENT SETNAME).

Lệnh `SLOWLOG GET` mặc định trả về 10 lệnh slow query gần nhất, bạn cũng có thể tự chỉ định số lượng lệnh slow query trả về `SLOWLOG GET N`.

Dưới đây là các lệnh liên quan đến slow query thường dùng khác:

```bash
# 返回慢查询命令的数量
127.0.0.1:6379> SLOWLOG LEN
(integer) 128
# 清空慢查询命令
127.0.0.1:6379> SLOWLOG RESET
OK
```

### Redis memory fragmentation (phân mảnh bộ nhớ Redis)

**Các câu hỏi liên quan**:

1. Memory fragmentation là gì? Tại sao Redis lại có memory fragmentation?
2. Làm thế nào để dọn dẹp memory fragmentation của Redis?

**Tham khảo câu trả lời**: [Giải thích chi tiết về memory fragmentation Redis](https://javaguide.cn/database/redis/redis-memory-fragmentation.html).

## ⭐️ Vấn đề production của Redis (Quan trọng)

### Cache Penetration (Thấu qua cache)

#### Cache penetration là gì?

Nói đơn giản, cache penetration là khi một lượng lớn yêu cầu có key không hợp lý, **hoàn toàn không tồn tại trong cache cũng không tồn tại trong cơ sở dữ liệu**. Điều này dẫn đến các yêu cầu này đổ thẳng vào cơ sở dữ liệu, hoàn toàn không đi qua lớp cache, tạo ra áp lực khổng lồ lên cơ sở dữ liệu, có thể khiến cơ sở dữ liệu bị down ngay bởi lượng yêu cầu đó.

![Cache Penetration](/images/github/javaguide/database/redis/redis-cache-penetration.png)

Ví dụ: Một hacker cố ý tạo ra một số key bất hợp pháp để phát động lượng lớn yêu cầu, dẫn đến lượng lớn yêu cầu đổ vào cơ sở dữ liệu, nhưng cơ sở dữ liệu cũng không tìm thấy dữ liệu tương ứng. Tức là tất cả các yêu cầu này cuối cùng đều đổ vào cơ sở dữ liệu, tạo ra áp lực khổng lồ.

#### Có những giải pháp nào?

Cơ bản nhất là trước tiên phải kiểm tra tham số tốt, một số yêu cầu tham số không hợp pháp thì trực tiếp ném ra thông tin ngoại lệ trả về cho client. Ví dụ như database id truy vấn không thể nhỏ hơn 0, email truyền vào định dạng không đúng thì trực tiếp trả về thông báo lỗi cho client, v.v.

**1) Cache key không hợp lệ**

Nếu cả cache và cơ sở dữ liệu đều không tìm thấy dữ liệu của một key nào đó, hãy ghi một bản vào Redis và đặt thời gian hết hạn, lệnh cụ thể như sau: `SET key value EX 10086`. Cách này có thể giải quyết trường hợp key của yêu cầu không thay đổi thường xuyên. Nếu hacker tấn công độc hại, mỗi lần tạo ra key yêu cầu khác nhau, sẽ dẫn đến cache trong Redis có lượng lớn key không hợp lệ. Rõ ràng, giải pháp này không giải quyết vấn đề từ gốc rễ. Nếu nhất thiết phải dùng cách này để giải quyết vấn đề thấu qua, hãy đặt thời gian hết hạn của key không hợp lệ ngắn thôi, ví dụ 1 phút.

Ngoài ra, thông thường chúng ta thiết kế key như thế này: `tên_bảng:tên_cột:tên_khóa_chính:giá_trị_khóa_chính`.

Nếu dùng Java code để biểu diễn thì gần như như sau:

```java
public Object getObjectInclNullById(Integer id) {
    // 从缓存中获取数据
    Object cacheValue = cache.get(id);
    // 缓存为空
    if (cacheValue == null) {
        // 从数据库中获取
        Object storageValue = storage.get(key);
        // 缓存空对象
        cache.set(key, storageValue);
        // 如果存储数据为空，需要设置一个过期时间(300秒)
        if (storageValue == null) {
            // 必须设置过期时间，否则有被攻击的风险
            cache.expire(key, 60 * 5);
        }
        return storageValue;
    }
    return cacheValue;
}
```

**2) Bloom filter (Bộ lọc Bloom)**

Bloom filter là một cấu trúc dữ liệu rất kỳ diệu, thông qua nó chúng ta có thể rất tiện lợi xác định xem một dữ liệu cho trước có tồn tại trong lượng dữ liệu khổng lồ hay không. Chúng ta có thể coi nó là cấu trúc dữ liệu bao gồm hai phần: vector nhị phân (hay còn gọi là bit array) và một loạt các hàm ánh xạ ngẫu nhiên (hash functions). So với các cấu trúc dữ liệu thường dùng như List, Map, Set, nó chiếm ít không gian hơn và hiệu quả hơn, nhưng nhược điểm là kết quả trả về mang tính xác suất chứ không hoàn toàn chính xác. Về mặt lý thuyết, càng nhiều phần tử được thêm vào tập hợp thì khả năng báo nhầm càng lớn. Và dữ liệu lưu trữ trong Bloom filter không dễ xóa.

![Sơ đồ nguyên lý đơn giản của Bloom Filter](/images/github/javaguide/cs-basics/algorithms/bloom-filter-simple-schematic-diagram.png)

Bloom Filter sử dụng một mảng bit lớn hơn để lưu tất cả dữ liệu, mỗi phần tử trong mảng chỉ chiếm 1 bit, và mỗi phần tử chỉ có thể là 0 hoặc 1 (đại diện cho false hoặc true), đây cũng là cốt lõi tiết kiệm bộ nhớ của Bloom Filter. Tính ra như vậy, xin cấp một bit array 100w phần tử chỉ chiếm 1000000Bit / 8 = 125000 Byte = 125000/1024 KB ≈ 122KB không gian.

![Bit array](/images/github/javaguide/cs-basics/algorithms/bloom-filter-bit-table.png)

Cụ thể như thế này: Lưu tất cả các giá trị yêu cầu có thể tồn tại vào Bloom filter, khi yêu cầu của người dùng đến, trước tiên xác định xem giá trị yêu cầu người dùng gửi có tồn tại trong Bloom filter không. Nếu không tồn tại, trực tiếp trả về thông tin lỗi tham số yêu cầu cho client, nếu tồn tại mới tiếp tục xử lý theo flow phía dưới.

Sơ đồ flow xử lý cache sau khi thêm Bloom filter như sau:

![Sơ đồ flow xử lý cache sau khi thêm Bloom filter](/images/github/javaguide/database/redis/redis-cache-penetration-bloom-filter.png)

Để tìm hiểu thêm chi tiết về Bloom filter, hãy xem bài gốc của tôi: [Chưa hiểu về Bloom filter? Một bài giải thích rõ ràng!](https://javaguide.cn/cs-basics/data-structure/bloom-filter.html), rất khuyến nghị đọc.

**3) Rate limiting (Giới hạn tốc độ) cho interface**

Giới hạn tốc độ interface theo người dùng hoặc IP, đối với hành vi truy cập bất thường tần suất cao, còn có thể áp dụng cơ chế blacklist, ví dụ đưa IP bất thường vào blacklist.

Cache breakdown và cache avalanche được đề cập sau đây đều có thể kết hợp với rate limiting interface để giải quyết, suy cho cùng điểm mấu chốt của những vấn đề này là có nhiều yêu cầu đổ vào cơ sở dữ liệu gây áp lực quá lớn.

Giải pháp rate limiting cụ thể có thể tham khảo bài viết này: [Giải thích chi tiết về rate limiting dịch vụ](https://javaguide.cn/high-availability/limit-request.html).

### Cache Breakdown (Phá vỡ cache)

#### Cache breakdown là gì?

Trong cache breakdown, key của yêu cầu tương ứng với **dữ liệu nóng**, dữ liệu đó **tồn tại trong cơ sở dữ liệu, nhưng không tồn tại trong cache (thường là vì dữ liệu trong cache đã hết hạn)**. Điều này có thể dẫn đến lượng lớn yêu cầu tức thời đổ thẳng vào cơ sở dữ liệu, tạo ra áp lực khổng lồ, có thể khiến cơ sở dữ liệu bị down ngay.

![Cache Breakdown](/images/github/javaguide/database/redis/redis-cache-breakdown.png)

Ví dụ: Trong quá trình flash sale, dữ liệu của một sản phẩm flash sale trong cache đột ngột hết hạn, điều này dẫn đến lượng lớn yêu cầu về sản phẩm đó tức thời đổ vào cơ sở dữ liệu, tạo ra áp lực khổng lồ.

#### Có những giải pháp nào?

1. **Never expire (không khuyến nghị)**: Đặt dữ liệu nóng không bao giờ hết hạn hoặc thời gian hết hạn tương đối dài.
2. **Khởi tạo trước (khuyến nghị)**: Khởi tạo trước dữ liệu nóng, lưu vào cache và đặt thời gian hết hạn hợp lý, ví dụ dữ liệu trong kịch bản flash sale không hết hạn trước khi flash sale kết thúc.
3. **Locking (tùy trường hợp)**: Sau khi cache hết hạn, sử dụng mutex lock để đảm bảo chỉ có một yêu cầu truy vấn cơ sở dữ liệu và cập nhật cache.

#### Cache penetration và cache breakdown có gì khác nhau?

Trong cache penetration, key của yêu cầu không tồn tại cả trong cache lẫn cơ sở dữ liệu.

Trong cache breakdown, key của yêu cầu tương ứng với **dữ liệu nóng**, dữ liệu đó **tồn tại trong cơ sở dữ liệu, nhưng không tồn tại trong cache (thường là vì dữ liệu trong cache đã hết hạn)**.

### Cache Avalanche (Thác lở cache)

#### Cache avalanche là gì?

Tôi thấy cái tên cache avalanche khá thú vị, ha ha.

Thực ra, cache avalanche mô tả một kịch bản đơn giản như thế này: **Cache bị hết hạn hàng loạt cùng lúc, dẫn đến lượng lớn yêu cầu đổ thẳng vào cơ sở dữ liệu, tạo ra áp lực khổng lồ lên cơ sở dữ liệu.** Điều này giống như tuyết lở, áp lực lên cơ sở dữ liệu thật sự không thể tưởng tượng, có thể khiến cơ sở dữ liệu bị down ngay.

Ngoài ra, Redis service bị down cũng có thể gây ra hiện tượng cache avalanche, khiến tất cả yêu cầu đổ vào cơ sở dữ liệu.

![Cache Avalanche](/images/github/javaguide/database/redis/redis-cache-avalanche.png)

Ví dụ: Lượng lớn dữ liệu trong cache hết hạn cùng lúc, lúc này đột nhiên có lượng lớn yêu cầu cần truy cập dữ liệu đã hết hạn này. Điều này dẫn đến lượng lớn yêu cầu đổ thẳng vào cơ sở dữ liệu, tạo ra áp lực khổng lồ.

#### Có những giải pháp nào?

**Đối với trường hợp Redis service không khả dụng**:

1. **Redis Cluster**: Sử dụng Redis cluster, tránh một máy đơn gặp sự cố khiến toàn bộ cache service không thể sử dụng. Redis Cluster và Redis Sentinel là hai giải pháp cluster Redis phổ biến nhất, chi tiết có thể tham khảo: [Chi tiết về Redis Cluster (trả phí)](https://javaguide.cn/database/redis/redis-cluster.html).
2. **Multi-level cache**: Đặt nhiều cấp cache, ví dụ kết hợp local cache + Redis cache thành cache hai cấp, khi Redis cache gặp sự cố vẫn có thể lấy được một phần dữ liệu từ local cache.

**Đối với trường hợp lượng lớn cache hết hạn cùng lúc**:

1. **Đặt thời gian hết hạn ngẫu nhiên (tùy chọn)**: Đặt thời gian hết hạn ngẫu nhiên cho cache, ví dụ thêm một giá trị ngẫu nhiên vào thời gian hết hạn cố định, như vậy có thể tránh lượng lớn cache hết hạn cùng lúc, giảm thiểu rủi ro cache avalanche.
2. **Khởi tạo trước (khuyến nghị)**: Khởi tạo trước dữ liệu nóng, lưu vào cache và đặt thời gian hết hạn hợp lý, ví dụ dữ liệu trong kịch bản flash sale không hết hạn trước khi flash sale kết thúc.
3. **Chiến lược cache vĩnh viễn (tùy trường hợp)**: Mặc dù thường không khuyến nghị đặt cache không bao giờ hết hạn, nhưng đối với một số dữ liệu quan trọng và ít thay đổi, có thể cân nhắc chiến lược này.

#### Cache warm-up (khởi tạo trước) được thực hiện như thế nào?

Có hai cách phổ biến để thực hiện cache warm-up:

1. Sử dụng scheduled task, ví dụ xxl-job, để định kỳ trigger logic cache warm-up, truy vấn dữ liệu nóng từ cơ sở dữ liệu và lưu vào cache.
2. Sử dụng message queue, ví dụ Kafka, để thực hiện cache warm-up không đồng bộ, gửi primary key hoặc ID của dữ liệu nóng trong cơ sở dữ liệu vào message queue, sau đó cache service sẽ consume dữ liệu từ message queue, truy vấn cơ sở dữ liệu theo primary key hoặc ID và cập nhật cache.

#### Cache avalanche và cache breakdown có gì khác nhau?

Cache avalanche và cache breakdown khá giống nhau, nhưng nguyên nhân gây ra cache avalanche là lượng lớn hoặc tất cả dữ liệu trong cache hết hạn, còn nguyên nhân gây ra cache breakdown chủ yếu là một dữ liệu nóng cụ thể không tồn tại trong cache (thường là vì dữ liệu trong cache đã hết hạn).

### Làm thế nào để đảm bảo tính nhất quán giữa cache và cơ sở dữ liệu?

Tính nhất quán giữa cache và cơ sở dữ liệu là một thách thức kỹ thuật khá phổ biến. Việc đưa vào cache chủ yếu để cải thiện hiệu năng, giảm tải cho cơ sở dữ liệu, nhưng quả thực sẽ mang lại rủi ro dữ liệu không nhất quán. Tính nhất quán tuyệt đối thường đồng nghĩa với độ phức tạp hệ thống cao hơn và chi phí hiệu năng lớn hơn, vì vậy trong thực tế chúng ta thường chọn chiến lược phù hợp theo kịch bản nghiệp vụ, tìm điểm cân bằng giữa hiệu năng và tính nhất quán.

Dưới đây hãy nói riêng về **Cache Aside Pattern (mô hình cache bên cạnh)**. Đây là một chiến lược đọc/ghi cache rất thông dụng, logic đọc/ghi của nó như sau:

- **Thao tác đọc**:
  1. Trước tiên cố gắng đọc dữ liệu từ cache.
  2. Nếu cache hit, trực tiếp trả về dữ liệu.
  3. Nếu cache miss, truy vấn dữ liệu từ cơ sở dữ liệu, đưa dữ liệu tìm được vào cache và trả về dữ liệu.
- **Thao tác ghi**:
  1. Trước tiên cập nhật cơ sở dữ liệu.
  2. Sau đó trực tiếp xóa dữ liệu tương ứng trong cache.

Sơ đồ như sau:

![](/images/github/javaguide/database/redis/cache-aside-write.png)

![](/images/github/javaguide/database/redis/cache-aside-read.png)

Nếu cập nhật cơ sở dữ liệu thành công nhưng bước xóa cache thất bại, nói ngắn gọn có hai giải pháp:

1. **Rút ngắn TTL (Time To Live) của cache (không khuyến nghị, trị ngọn không trị gốc)**: Chúng ta đặt thời gian hết hạn của dữ liệu cache ngắn hơn, như vậy cache sẽ tải dữ liệu từ cơ sở dữ liệu. Ngoài ra, giải pháp này không áp dụng cho kịch bản thao tác cache trước rồi thao tác cơ sở dữ liệu sau.
2. **Thêm cơ chế retry cập nhật cache (thường dùng)**: Nếu cache service hiện tại không khả dụng dẫn đến xóa cache thất bại, chúng ta retry sau một khoảng thời gian, số lần retry có thể tự đặt. Tuy nhiên, ở đây phù hợp hơn khi dùng message queue để thực hiện retry không đồng bộ, gửi message retry xóa cache vào message queue, sau đó consumer chuyên biệt retry cho đến khi thành công. Mặc dù thêm vào một message queue, nhưng lợi ích tổng thể mang lại vẫn cao hơn.

Bài viết liên quan được khuyến nghị: [Vấn đề tính nhất quán giữa cache và cơ sở dữ liệu, đọc bài này là đủ - Shui Di Yu Yin Dan](https://mp.weixin.qq.com/s?__biz=MzIyOTYxNDI5OA==&mid=2247487312&idx=1&sn=fa19566f5729d6598155b5c676eee62d&chksm=e8beb8e5dfc931f3e35655da9da0b61c79f2843101c130cf38996446975014f958a6481aacf1&scene=178&cur_album_id=1699766580538032128#rd).

### Những trường hợp nào có thể gây ra Redis blocking?

Các nguyên nhân phổ biến gây blocking Redis:

- Thực thi lệnh có độ phức tạp `O(n)` (như `KEYS *`, `HGETALL`, `LRANGE`, `SMEMBERS`, v.v.), thời gian thực thi kéo dài khi lượng dữ liệu tăng lên.
- Thực thi lệnh `SAVE` để tạo RDB snapshot sẽ block đồng bộ thread chính, còn `BGSAVE` tránh block bằng cách fork tiến trình con.
- AOF ghi log trong thread chính, có thể block các lệnh tiếp theo do ghi log sau khi thực thi lệnh.
- Khi AOF fsync, thread nền đồng bộ lên đĩa, áp lực đĩa lớn dẫn đến `fsync` bị block, từ đó block thao tác `write` của thread chính, đặc biệt rõ ràng với cấu hình `appendfsync always` hoặc `everysec`.
- Quá trình AOF rewrite khi thêm nội dung rewrite buffer vào file AOF mới gây ra blocking.
- Thao tác trên key lớn (string > 1MB hoặc kiểu phức hợp > 5000 phần tử) gây client timeout, network blocking và worker thread blocking.
- Sử dụng `flushdb` hoặc `flushall` để xóa cơ sở dữ liệu liên quan đến xóa hàng loạt cặp key-value và giải phóng bộ nhớ, gây block thread chính.
- Khi cluster scale in/out, migration dữ liệu là thao tác đồng bộ, migration key lớn gây block kéo dài cho cả hai node, có thể kích hoạt failover.
- Bộ nhớ không đủ kích hoạt Swap, hệ điều hành swap bộ nhớ Redis ra đĩa cứng, hiệu năng đọc/ghi giảm mạnh.
- Các tiến trình khác chiếm dụng CPU quá nhiều dẫn đến throughput Redis giảm.
- Vấn đề mạng như từ chối kết nối, độ trễ cao, ngắt quãng network card, v.v. gây block Redis.

Chi tiết có thể đọc bài viết này: [Tổng hợp các nguyên nhân gây blocking Redis thường gặp](https://javaguide.cn/database/redis/redis-common-blocking-problems-summary.html).

## Redis Cluster

**Redis Sentinel**:

1. Sentinel là gì? Có tác dụng gì?
2. Sentinel phát hiện node bị down như thế nào? Sự khác biệt giữa subjective down và objective down?
3. Sentinel thực hiện failover như thế nào?
4. Tại sao khuyến nghị triển khai nhiều node sentinel (cụm sentinel)?
5. Sentinel chọn master mới như thế nào (cơ chế bầu chọn)?
6. Làm thế nào để chọn ra Leader từ cụm Sentinel?
7. Sentinel có thể ngăn ngừa split-brain không?

**Redis Cluster**:

1. Tại sao cần Redis Cluster? Giải quyết vấn đề gì? Có những ưu điểm gì?
2. Redis Cluster thực hiện sharding như thế nào?
3. Tại sao hash slot của Redis Cluster là 16384?
4. Làm thế nào để xác định key nào sẽ được phân bổ vào hash slot nào?
5. Redis Cluster có hỗ trợ tái phân bổ hash slot không?
6. Redis Cluster có thể cung cấp service trong khi scale in/out không?
7. Các node trong Redis Cluster giao tiếp với nhau như thế nào?

**Tham khảo câu trả lời**: [Chi tiết về Redis Cluster (trả phí)](https://javaguide.cn/database/redis/redis-cluster.html).

## Quy chuẩn sử dụng Redis

Trong quá trình sử dụng Redis thực tế, chúng ta nên cố gắng tuân thủ một số quy chuẩn phổ biến, ví dụ:

1. Sử dụng connection pool: Tránh thường xuyên tạo và đóng kết nối client.
2. Hạn chế sử dụng lệnh O(n), khi sử dụng lệnh O(n) cần chú ý đến số lượng n: Các lệnh O(n) như `KEYS *`, `HGETALL`, `LRANGE`, `SMEMBERS`, `SINTER`/`SUNION`/`SDIFF` không phải không thể sử dụng, nhưng cần xác định rõ giá trị n. Ngoài ra, nếu có nhu cầu duyệt qua, có thể sử dụng `HSCAN`, `SSCAN`, `ZSCAN` thay thế.
3. Sử dụng thao tác hàng loạt để giảm truyền tải mạng: Lệnh thao tác hàng loạt gốc (như `MGET`, `MSET`, v.v.), pipeline, Lua script.
4. Hạn chế sử dụng Redis transaction: Chức năng transaction Redis khá hạn chế, có thể dùng Lua script thay thế.
5. Cấm bật monitor trong thời gian dài: Ảnh hưởng lớn đến hiệu năng.
6. Kiểm soát vòng đời của key: Tránh lưu quá nhiều dữ liệu ít được truy cập trong Redis.
7. ……

## Tài liệu tham khảo

- 《Redis 开发与运维》
- 《Redis 设计与实现》
- Redis Transactions: <https://redis.io/docs/manual/transactions/>
- What is Redis Pipeline: <https://buildatscale.tech/what-is-redis-pipeline/>
- Giải thích chi tiết về phát hiện và xử lý BigKey, HotKey trong Redis: <https://mp.weixin.qq.com/s/FPYE1B839_8Yk1-YSiW-1Q>
- Khám phá giải pháp và hướng giải quyết vấn đề Bigkey: <https://mp.weixin.qq.com/s/Sej7D9TpdAobcCmdYdMIyA>
- Hướng dẫn toàn diện khắc phục sự cố độ trễ Redis: <https://mp.weixin.qq.com/s/mIc6a9mfEGdaNDD3MmfFsg>

<!-- @include: @article-footer.snippet.md -->
