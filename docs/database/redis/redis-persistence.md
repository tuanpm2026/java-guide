---
title: Giải thích chi tiết cơ chế lưu trữ liên tục của Redis
description: Phân tích chuyên sâu ba cơ chế lưu trữ liên tục của Redis: RDB snapshot, AOF log và lưu trữ hỗn hợp, bao gồm nguyên lý hoạt động, cách cấu hình và so sánh ưu nhược điểm, giúp bạn lựa chọn chiến lược lưu trữ phù hợp với kịch bản kinh doanh.
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis持久化,RDB,AOF,混合持久化,bgsave,数据恢复,Redis备份,fork子进程
---

Khi sử dụng cache, chúng ta thường cần lưu trữ liên tục dữ liệu trong bộ nhớ, tức là ghi dữ liệu từ bộ nhớ xuống đĩa cứng. Lý do chủ yếu là để tái sử dụng dữ liệu sau này (ví dụ khởi động lại máy, khôi phục dữ liệu sau khi máy hỏng), hoặc để đồng bộ dữ liệu (ví dụ các nút master-slave trong cluster Redis đồng bộ dữ liệu thông qua file RDB).

Redis khác với Memcached ở một điểm quan trọng là Redis hỗ trợ lưu trữ liên tục, và hỗ trợ 3 cách lưu trữ liên tục:

- Snapshot (snapshotting, RDB)
- File chỉ thêm vào (append-only file, AOF)
- Lưu trữ hỗn hợp RDB và AOF (thêm vào trong Redis 4.0)

Địa chỉ tài liệu chính thức: <https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/> .

![](https://oss.javaguide.cn/github/javaguide/database/redis/redis4.0-persitence.png)

**Bài viết này dựa trên phiên bản Redis 7.0+**. Các phiên bản khác nhau có sự khác biệt quan trọng về cơ chế lưu trữ liên tục, hãy xác nhận phiên bản Redis của bạn trước khi sử dụng:

| Phiên bản      | Cách lưu trữ mặc định | Tính năng quan trọng               |
| -------------- | --------------------- | ---------------------------------- |
| **Redis 4.0**  | RDB                   | Giới thiệu lưu trữ hỗn hợp RDB+AOF |
| **Redis 6.0**  | RDB                   | AOF vẫn cần bật thủ công           |
| **Redis 7.0**  | RDB                   | Giới thiệu Multi-Part AOF          |
| **Redis 7.2+** | RDB                   | Tối ưu hóa thêm hiệu suất lưu trữ  |

**Sự khác biệt hành vi quan trọng**:

- **Bộ nhớ chiếm dụng khi AOF rewrite**: Trước Redis 7.0 dữ liệu gia tăng trong quá trình rewrite cần lưu trong bộ nhớ, 7.0+ sử dụng Multi-Part AOF để giải quyết
- **Lưu trữ hỗn hợp**: Redis 4.0-6.x cần bật thủ công, Redis 7.0+ mặc định bật.

Kiểm tra phiên bản Redis của bạn:

```bash
redis-cli INFO server | grep redis_version
# 输出示例：redis_version:7.0.12
```

Hình dưới đây mô tả toàn bộ quy trình cơ chế lưu trữ liên tục của Redis, bao gồm nội dung cốt lõi của bài viết này:

![Toàn bộ quy trình cơ chế lưu trữ liên tục của Redis](https://oss.javaguide.cn/github/javaguide/database/redis/redis-persistence-flow.png)

## Lưu trữ liên tục RDB

### RDB là gì?

Redis có thể tạo snapshot để lấy bản sao dữ liệu đang lưu trong bộ nhớ tại **một thời điểm cụ thể**. Sau khi Redis tạo snapshot, có thể sao lưu snapshot, có thể sao chép snapshot sang các server khác để tạo server sao có cùng dữ liệu (cấu trúc master-slave Redis, chủ yếu để nâng cao hiệu suất Redis), còn có thể giữ snapshot tại chỗ để sử dụng khi khởi động lại server.

Lưu trữ snapshot là cách lưu trữ liên tục Redis sử dụng mặc định, trong file cấu hình `redis.conf` mặc định có cấu hình sau:

```clojure
# Redis 7.0 默认配置（单行格式）
save 3600 1 300 100 60 10000

# 各条件含义：
# - 3600 秒（1 小时）内至少有 1 个 key 变化
# - 300 秒（5 分钟）内至少有 100 个 key 变化
# - 60 秒（1 分钟）内至少有 10000 个 key 变化

# 等价于旧版多行格式：
# save 3600 1
# save 300 100
# save 60 10000
```

### RDB có chặn main thread khi tạo snapshot không?

Redis cung cấp hai lệnh để tạo file snapshot RDB:

- `save`: Thao tác lưu đồng bộ, sẽ chặn main thread Redis;
- `bgsave`: Fork ra một tiến trình con, tiến trình con thực thi.

> Ở đây nói main thread Redis thay vì main process chủ yếu vì Redis sau khi khởi động chủ yếu hoàn thành công việc chính theo cách single-thread. Nếu bạn muốn mô tả là main process Redis, cũng không sai.

#### Phân tích chi phí hiệu suất fork

Mặc dù `bgsave` thực thi trong tiến trình con, không chặn main thread xử lý yêu cầu lệnh, nhưng **bản thân thao tác fork là chặn**, và sẽ tạo thêm chi phí bộ nhớ (các giá trị trong bảng dưới đây là tham khảo, giá trị thực tế bị ảnh hưởng bởi hiệu suất CPU, tỷ lệ phân mảnh bộ nhớ, tải hệ thống và các yếu tố khác):

| Kích thước tập dữ liệu | Độ trễ fork | Bộ nhớ sử dụng thêm         | Mức độ rủi ro |
| ---------------------- | ----------- | --------------------------- | ------------- |
| < 1GB                  | < 10ms      | ~10MB (sao chép bảng trang) | Thấp          |
| 1-10GB                 | 10-100ms    | 10-100MB                    | Trung bình    |
| 10-50GB                | 100ms-1s    | 100-500MB                   | Cao           |
| > 50GB                 | > 1s        | > 500MB                     | Rất cao       |

> Bài viết này lấy `bgsave` của RDB làm ví dụ để minh họa tác động hiệu suất của fork, nhưng **cơ chế tương tự cũng áp dụng cho AOF rewrite (`BGREWRITEAOF` command)**. AOF rewrite cũng cần fork tiến trình con, cũng phải đối mặt với độ trễ fork, chi phí bộ nhớ COW và rủi ro THP. Trong môi trường production, dù là RDB hay AOF rewrite, đều cần chú ý đến các chỉ số hiệu suất liên quan đến fork.

#### Cơ chế Copy-on-Write (COW)

- Sau fork, tiến trình con chia sẻ các trang bộ nhớ của tiến trình cha (trang tiêu chuẩn 4KB)
- Khi tiến trình cha hoặc con sửa đổi trang bộ nhớ, kernel sao chép trang đó (Copy-on-Write)
- Tập dữ liệu lớn + tải ghi cao sẽ dẫn đến sao chép nhiều trang, ảnh hưởng đến hiệu suất

#### Vấn đề tràn bộ nhớ do THP (Transparent Huge Pages)

Các bản phân phối Linux mặc định bật **THP (Transparent Huge Pages, trang lớn trong suốt)**, kích thước 2MB. THP tăng xác suất COW của trang lớn, **trong trường hợp tệ nhất**, nếu bộ nhớ được gộp thành trang lớn 2MB, ngay cả khi client chỉ sửa 10 byte dữ liệu, kernel cũng sẽ sao chép toàn bộ trang bộ nhớ 2MB, khiến chi phí bộ nhớ COW **tăng 512 lần** (2MB / 4KB = 512).

**Hành vi thực tế**: Kernel không bắt buộc tất cả bộ nhớ dùng trang lớn 2MB, mà quyết định động việc có gộp hay không tùy tình huống. Chỉ khi THP gộp thành công thành trang lớn, việc sửa đổi mới kích hoạt COW 2MB. Nhưng trong kịch bản ghi đồng thời cao, điều này vẫn làm tăng đáng kể mức tiêu thụ bộ nhớ, có thể nhanh chóng làm cạn kiệt bộ nhớ máy chủ, kích hoạt **OOM Killer buộc kill tiến trình Redis**.

**Cách xác minh**:

```bash
cat /sys/kernel/mm/transparent_hugepage/enabled
# 输出 [always] madvise never 表示已开启（危险！）
# 应该输出 always madvise [never]
```

**Giải pháp**: Thêm `echo never > /sys/kernel/mm/transparent_hugepage/enabled` vào script khởi động Redis, hoặc sử dụng `redis-server --disable-thp yes` (hỗ trợ từ Redis 6.0+).

**Cảnh báo khi khởi động**: Khi Redis phát hiện THP đang bật sẽ in `WARNING you have Transparent Huge Pages (THP) support enabled in your kernel` trong log khởi động, cần xử lý ngay.

#### Khuyến nghị cho môi trường production

```bash
# 1. 监控 fork 风险指标
redis-cli INFO memory | grep -E "(used_memory|used_memory_rss)"

# 输出示例：
# used_memory:1073741824
# used_memory_rss:1226833920
# used_memory_rss_human:1.14G

# 计算 RSS/USED 比值，fork 时应 < 2
# 如果接近或超过 2，说明 fork 风险高

# 2. 设置 maxmemory 限制 Redis 内存占用，为 fork 预留空间
# 在 redis.conf 中设置：
# maxmemory 8gb
# maxmemory-policy allkeys-lru

# 3. 避免在高峰期手动触发 BGSAVE
# 让 Redis 根据配置规则自动触发

# 4. 考虑主从复制 + 从节点持久化架构
# 将持久化操作转移到从节点，避免主节点 fork 开销
```

**Giám sát cảnh báo**:

- `rdb_last_bgsave_time_sec`: Thời gian bgsave lần trước, nên < 5s
- `rdb_last_cow_size`: Kích thước bộ nhớ COW của fork lần trước, nên < 10% `used_memory`

## Lưu trữ liên tục AOF

### AOF là gì?

So với lưu trữ snapshot, lưu trữ AOF có tính thời gian thực tốt hơn. Mặc định Redis không bật cách lưu trữ liên tục AOF (append only file), có thể bật thông qua tham số `appendonly`:

> **Lưu ý phiên bản**: Redis mặc định sử dụng cách lưu trữ liên tục RDB. Nếu cần sử dụng AOF, cần đặt `appendonly yes` thủ công. Redis 7.0 giới thiệu cơ chế Multi-Part AOF để tối ưu hiệu suất AOF, nhưng không thay đổi cách lưu trữ mặc định.

```bash
appendonly yes
```

Sau khi bật lưu trữ AOF, mỗi khi thực thi một lệnh thay đổi dữ liệu trong Redis, Redis sẽ ghi lệnh đó vào buffer AOF `server.aof_buf`, sau đó ghi vào file AOF (lúc này vẫn trong vùng đệm kernel của hệ thống, chưa đồng bộ xuống đĩa), cuối cùng quyết định khi nào đồng bộ vùng đệm kernel xuống đĩa cứng dựa trên cấu hình cách lưu trữ (chiến lược `fsync`).

Chỉ khi đồng bộ xuống đĩa mới được coi là lưu trữ liên tục, nếu không vẫn tồn tại rủi ro mất dữ liệu. Ví dụ: dữ liệu trong vùng đệm kernel chưa được đồng bộ, máy đĩa cứng đã tắt, thì phần dữ liệu này được coi là đã mất.

Vị trí lưu file AOF giống với vị trí file RDB, đều được thiết lập thông qua tham số `dir`, tên file mặc định là `appendonly.aof`.

### Quy trình hoạt động cơ bản của AOF là gì?

Chức năng lưu trữ liên tục AOF có thể được chia đơn giản thành 5 bước:

1. **Ghi thêm lệnh (append)**: Tất cả lệnh ghi sẽ được ghi thêm vào buffer AOF.
2. **Ghi file (write)**: Ghi dữ liệu từ buffer AOF vào file AOF. Bước này cần gọi hàm `write` (system call), `write` ghi dữ liệu vào vùng đệm kernel của hệ thống rồi trả về ngay (delayed write). Chú ý!! Lúc này chưa đồng bộ xuống đĩa.
3. **Đồng bộ file (fsync)**: Đây mới là phần cốt lõi của lưu trữ liên tục! Dựa trên chiến lược cấu hình `appendfsync` trong file `redis.conf`, Redis sẽ gọi hàm `fsync` (system call) vào các thời điểm khác nhau. `fsync` thực hiện trên file đơn lẻ, ép buộc đồng bộ với đĩa cứng (ghi dữ liệu trong vùng đệm kernel ra đĩa cứng), `fsync` sẽ bị chặn cho đến khi ghi vào đĩa xong mới trả về, đảm bảo dữ liệu được lưu trữ liên tục.
4. **Viết lại file (rewrite)**: Khi file AOF ngày càng lớn, cần định kỳ viết lại file AOF để đạt mục đích nén.
5. **Tải khi khởi động lại (load)**: Khi Redis khởi động lại, có thể tải file AOF để khôi phục dữ liệu.

> Linux cung cấp trực tiếp một số hàm để truy cập và điều khiển file và thiết bị, các hàm này được gọi là **system call (syscall)**.

Dưới đây giải thích thêm một lần nữa về một số system call Linux được đề cập ở trên:

- `write`: Ghi vào vùng đệm kernel của hệ thống rồi trả về ngay (chỉ ghi vào buffer), không đồng bộ xuống đĩa cứng ngay lập tức. Mặc dù nâng cao hiệu quả, nhưng cũng mang lại rủi ro mất dữ liệu. **Thao tác đồng bộ đĩa cứng phụ thuộc vào chính sách ghi lại trang bẩn (Dirty Page Writeback) của kernel Linux**, chủ yếu bị ảnh hưởng bởi các tham số sau:
  - `/proc/sys/vm/dirty_expire_centisecs`: Thời gian hết hạn của trang bẩn (mặc định 30 giây)
  - `/proc/sys/vm/dirty_writeback_centisecs`: Khoảng thời gian đánh thức luồng ghi lại kernel (mặc định 5 giây)
  - Áp lực bộ nhớ hệ thống: Khi bộ nhớ không đủ sẽ kích hoạt đồng bộ tích cực hơn
- **Điều này có nghĩa là trong chế độ `appendfsync no`, khi xảy ra tắt máy đột ngột, lượng dữ liệu có thể mất là không kiểm soát và không thể dự đoán**, phụ thuộc vào thời điểm đồng bộ kernel lần trước.
- `fsync`: Dùng để ép buộc xóa vùng đệm kernel của hệ thống (đồng bộ xuống đĩa), đảm bảo thao tác ghi đĩa kết thúc mới trả về.

Sơ đồ quy trình hoạt động AOF như sau:

![Quy trình hoạt động cơ bản của AOF](https://oss.javaguide.cn/github/javaguide/database/redis/aof-work-process.png)

### AOF có những cách lưu trữ nào?

Trong file cấu hình Redis, có ba cách lưu trữ AOF khác nhau (chiến lược `fsync`), cụ thể là:

1. `appendfsync always`: Sau khi main thread gọi `write` thực thi thao tác ghi, sẽ ngay lập tức gọi hàm `fsync` để đồng bộ file AOF (flush đĩa), main thread bị chặn trong thời gian này, cho đến khi `fsync` đã ghi dữ liệu hoàn toàn xuống đĩa mới trả về. Chiến lược `always` do **main thread trực tiếp thực thi fsync**, không phải thread nền. Cách này an toàn dữ liệu nhất, về lý thuyết sẽ không có bất kỳ mất dữ liệu nào. Nhưng vì mỗi thao tác ghi đều đồng bộ chặn main thread, nên hiệu suất rất kém.
2. `appendfsync everysec`: Sau khi main thread gọi `write` thực thi thao tác ghi, trả về ngay lập tức, thread nền (`aof_fsync` thread) gọi hàm `fsync` (system call) đồng bộ file AOF mỗi giây (`write`+`fsync`, khoảng cách `fsync` là 1 giây). Cách này hầu như không ảnh hưởng đến hiệu suất main thread. Tạo sự cân bằng tốt nhất giữa hiệu suất và an toàn dữ liệu. Tuy nhiên, khi Redis bị crash bất thường, thường có thể mất dữ liệu tạo ra trong 1 giây gần nhất.

> **Sự thật production (mất 2 giây và rủi ro chặn)**:
>
> "Mất tối đa 1 giây" là tình huống lý tưởng. Khi I/O đĩa bận, thời gian thực thi fsync nền quá dài, main thread khi thực thi lệnh ghi sẽ kiểm tra thời gian hoàn thành fsync lần trước. Nếu thời gian kể từ lần fsync thành công cuối cùng vượt quá 2 giây, main thread sẽ bị **chặn bắt buộc** để tránh bộ nhớ bị tràn (logic kiểm tra chặn `aof_background_fsync` trong mã nguồn Redis `aof.c`).
>
> Do đó, **trong tình huống tắt máy đột ngột cực đoan, có thể mất tối đa 2 giây dữ liệu**, và sự bất ổn đĩa sẽ trực tiếp gây ra độ trễ P99 của Redis tăng vọt.
>
> **Chỉ số cần giám sát bắt buộc**: `redis-cli INFO persistence | grep aof_delayed_fsync` (ghi lại số lần tích lũy main thread bị chặn bởi fsync, chỉ có trường này khi bật AOF).

3. `appendfsync no`: Sau khi main thread gọi `write` thực thi thao tác ghi, trả về ngay lập tức, để hệ điều hành quyết định khi nào đồng bộ, thường là 30 giây một lần trên Linux (`write` nhưng không `fsync`, thời điểm `fsync` do hệ điều hành quyết định). Cách này có hiệu suất tốt nhất, vì tránh được sự chặn của `fsync`. Nhưng an toàn dữ liệu kém nhất, lượng dữ liệu mất khi tắt máy không kiểm soát được, phụ thuộc vào thời điểm đồng bộ lần trước của hệ điều hành.

Có thể thấy: **Sự khác biệt chính giữa 3 cách lưu trữ này là thời điểm `fsync` đồng bộ file AOF (flush đĩa)**.

Để cân bằng dữ liệu và hiệu suất ghi, có thể xem xét tùy chọn `appendfsync everysec`, để Redis đồng bộ file AOF mỗi giây, hiệu suất Redis bị ảnh hưởng ít. Thông thường, ngay cả khi hệ thống bị crash, người dùng mất nhiều nhất là dữ liệu được tạo ra trong vòng một giây. Khi đĩa cứng bận với thao tác ghi, Redis sẽ duyên dáng làm chậm tốc độ để phù hợp với tốc độ ghi tối đa của đĩa.

> ⚠️ **Lưu ý**: Khi tắc nghẽn I/O đĩa nghiêm trọng, main thread Redis có thể bị chặn lên đến 2 giây khi chờ fsync, trong thời gian đó cửa sổ mất dữ liệu mở rộng đến 2 giây. Môi trường production nên giám sát chỉ số `aof_delayed_fsync` để đánh giá tình trạng đĩa.

Kể từ Redis 7.0.0, Redis sử dụng cơ chế **Multi Part AOF**. Như tên gọi, Multi Part AOF là chia file AOF đơn lẻ ban đầu thành nhiều file AOF. Trong Multi Part AOF, file AOF được chia thành ba loại:

- BASE: Đại diện cho file AOF cơ sở, thường được tạo ra bởi tiến trình con thông qua viết lại, file này chỉ có tối đa một.
- INCR: Đại diện cho file AOF gia tăng, thường được tạo khi AOFRW bắt đầu thực thi, file này có thể có nhiều.
- HISTORY: Đại diện cho file AOF lịch sử, được chuyển đổi từ BASE và INCR AOF, mỗi khi AOFRW hoàn thành thành công, BASE và INCR AOF tương ứng trước AOFRW lần này đều trở thành HISTORY, file AOF loại HISTORY sẽ bị Redis tự động xóa.

Multi Part AOF không phải trọng tâm, biết qua là được. Để xem giới thiệu chi tiết có thể xem bài viết [Redis 7.0 Multi Part AOF thiết kế và triển khai](https://zhuanlan.zhihu.com/p/467217082) của nhà phát triển Alibaba.

**Issue liên quan**: [Cách AOF Redis #783](https://github.com/Snailclimb/JavaGuide/issues/783).

### Tại sao AOF ghi log sau khi thực thi lệnh xong?

Cơ sở dữ liệu quan hệ (như MySQL) thường ghi log trước khi thực thi lệnh (để thuận tiện cho việc khôi phục sau sự cố), còn cơ chế lưu trữ AOF của Redis ghi log sau khi thực thi lệnh xong.

![Quá trình ghi log AOF](https://oss.javaguide.cn/github/javaguide/database/redis/redis-aof-write-log-disc.png)

**Tại sao ghi log sau khi thực thi lệnh xong?**

- Tránh chi phí kiểm tra thêm, ghi log AOF không thực hiện kiểm tra cú pháp cho lệnh;
- Ghi log sau khi lệnh thực thi xong, sẽ không chặn việc thực thi lệnh hiện tại.

Điều này cũng mang lại rủi ro (tôi cũng đã đề cập khi giới thiệu lưu trữ liên tục AOF trước đó):

- Nếu Redis bị tắt ngay sau khi thực thi lệnh, các thay đổi tương ứng sẽ bị mất;
- Có thể chặn việc thực thi các lệnh khác tiếp theo (ghi log AOF được thực hiện trong main thread Redis).

### Bạn có hiểu về AOF rewrite không?

Khi AOF trở nên quá lớn, Redis có thể tự động viết lại AOF trong nền để tạo ra một file AOF mới, file AOF mới này lưu trạng thái database giống với file AOF cũ, nhưng kích thước nhỏ hơn.

![AOF rewrite](https://oss.javaguide.cn/github/javaguide/database/redis/aof-rewrite.png)

> AOF rewrite (viết lại) là một cái tên gây hiểu nhầm, chức năng này được thực hiện bằng cách đọc các cặp key-value trong database, chương trình không cần đọc, phân tích hay ghi bất kỳ thứ gì vào file AOF hiện có.

Vì AOF rewrite sẽ thực hiện nhiều thao tác ghi, để tránh ảnh hưởng đến Redis xử lý lệnh bình thường, Redis đặt chương trình viết lại AOF vào tiến trình con để thực thi.

Trong quá trình viết lại file AOF, Redis cũng duy trì một **buffer viết lại AOF**, buffer này sẽ ghi lại tất cả lệnh ghi mà server thực thi trong khi tiến trình con tạo file AOF mới. Sau khi tiến trình con hoàn thành tạo file AOF mới, server sẽ ghi tất cả nội dung trong buffer viết lại vào cuối file AOF mới, khiến file AOF mới lưu trạng thái database nhất quán với trạng thái database hiện tại. Cuối cùng, server dùng file AOF mới thay thế file AOF cũ, hoàn thành thao tác viết lại file AOF.

Để bật tính năng viết lại AOF, có thể gọi lệnh `BGREWRITEAOF` thủ công, hoặc cấu hình hai mục dưới đây để chương trình tự động quyết định thời điểm kích hoạt:

- `auto-aof-rewrite-min-size`: Nếu kích thước file AOF nhỏ hơn giá trị này, sẽ không kích hoạt AOF rewrite. Giá trị mặc định là 64 MB;
- `auto-aof-rewrite-percentage`: Khi thực thi AOF rewrite, tỷ lệ giữa kích thước AOF hiện tại (aof_current_size) và kích thước AOF khi rewrite lần trước (aof_base_size). Nếu kích thước file AOF hiện tại tăng theo tỷ lệ phần trăm này, sẽ kích hoạt AOF rewrite. Đặt giá trị này thành 0 sẽ vô hiệu hóa AOF rewrite tự động. Giá trị mặc định là 100.

**Ranh giới lỗi và kịch bản rủi ro của AOF rewrite**:

Mặc dù AOF rewrite được thực thi trong tiến trình con, vẫn có các rủi ro sau cần biết:

| Kịch bản rủi ro      | Tác động                               | Điều kiện kích hoạt                    | Biện pháp đối phó                                           |
| -------------------- | -------------------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| **Fork thất bại**    | Không thể tạo tiến trình con rewrite   | Thiếu bộ nhớ, giới hạn hệ thống        | Giám sát mức sử dụng bộ nhớ, đặt `maxmemory`                |
| **Đĩa đầy**          | Ghi file AOF mới thất bại              | Lượng dữ liệu tăng nhanh trong rewrite | Giám sát mức sử dụng đĩa (`df -h`), đặt ngưỡng cảnh báo 70% |
| **Cạn inode**        | Không thể tạo file mới                 | Hệ thống có quá nhiều file nhỏ         | Giám sát mức sử dụng inode (`df -i`), dọn sạch file tạm     |
| **Đồng hồ lùi**      | Quản lý file Multi-Part AOF bị lộn xộn | Vấn đề đồng bộ đồng hồ máy ảo          | Cấu hình dịch vụ NTP, đặt `aof-timestamp-enabled`           |
| **Tín hiệu SIGTERM** | rewrite bị gián đoạn                   | Vận hành viên khởi động lại thủ công   | Cấu hình tắt nhẹ nhàng (`shutdown-timeout`)                 |

**Khuyến nghị giám sát môi trường production**:

```bash
# 监控 AOF rewrite 状态
redis-cli INFO persistence | grep aof_rewrite_in_progress

# 监控 AOF 文件大小增长
redis-cli INFO persistence | grep aof_current_size
redis-cli INFO persistence | grep aof_base_size

# 检查磁盘和 inode 使用率
df -h /var/lib/redis
df -i /var/lib/redis

# 设置 AOF rewrite 期间增量 fsync 策略（Redis 7.0+）
# aof-rewrite-incremental-sync yes
```

Trước phiên bản Redis 7.0, nếu có lệnh ghi trong quá trình rewrite, AOF có thể sử dụng nhiều bộ nhớ, tất cả lệnh ghi đến trong quá trình rewrite đều được ghi vào đĩa hai lần.

Sau phiên bản Redis 7.0, cơ chế viết lại AOF đã được tối ưu cải thiện. Đoạn nội dung dưới đây trích từ bài viết [Nhìn lại quá khứ và tương lai của Redis qua phát hành Redis 7.0](https://mp.weixin.qq.com/s/RnoPPL7jiFSKkx3G4p57Pg) của nhà phát triển Alibaba.

> Cách xử lý dữ liệu gia tăng trong quá trình viết lại AOF luôn là vấn đề, trong quá khứ dữ liệu gia tăng trong quá trình ghi cần được giữ trong bộ nhớ, sau khi ghi xong mới ghi phần dữ liệu gia tăng này vào file AOF mới để đảm bảo tính toàn vẹn dữ liệu. Có thể thấy việc ghi AOF sẽ tiêu thụ thêm bộ nhớ và I/O đĩa, đây cũng là điểm đau của ghi AOF Redis, mặc dù đã cải tiến nhiều lần trước đó nhưng vấn đề tiêu thụ tài nguyên bản chất vẫn chưa được giải quyết.
>
> Redis phiên bản enterprise của Alibaba Cloud ban đầu cũng gặp vấn đề này, qua nhiều lần phát triển lặp đi lặp lại nội bộ, đã triển khai cơ chế Multi-part AOF để giải quyết, đồng thời cũng đóng góp cho cộng đồng và phát hành cùng với 7.0 lần này. Phương pháp cụ thể là sử dụng cách lưu trữ file độc lập base (dữ liệu đầy đủ) + inc (dữ liệu gia tăng), triệt để giải quyết lãng phí tài nguyên bộ nhớ và I/O, đồng thời cũng hỗ trợ quản lý lưu lịch sử file AOF, kết hợp thông tin thời gian trong file AOF còn có thể thực hiện PITR khôi phục theo thời điểm (Tair phiên bản enterprise Alibaba Cloud đã hỗ trợ), điều này càng tăng cường độ tin cậy dữ liệu của Redis, đáp ứng nhu cầu lưu trữ lại dữ liệu của người dùng.

**Issue liên quan**: [Mô tả không chính xác về AOF rewrite Redis #1439](https://github.com/Snailclimb/JavaGuide/issues/1439).

### Làm thế nào để xác minh tính toàn vẹn dữ liệu của file AOF?

**Kết luận cốt lõi**: File AOF thuần không có cơ chế checksum, chỉ xác minh thông qua phân tích từng lệnh; CRC64 checksum chỉ tồn tại trong **phần RDB** của file lưu trữ hỗn hợp.

#### Chế độ AOF thuần: Không có checksum, chỉ phân tích cú pháp

File AOF thuần không tính CRC64 checksum cho toàn bộ hoặc từng lệnh, mà xác minh tính hợp lệ bằng cách phân tích từng lệnh trong file.

**Tại sao không có checksum?**

AOF là log văn bản ghi thêm với tần suất cao. Nếu mỗi lần ghi thêm lệnh đều phải tính lại CRC64 checksum của toàn bộ file, sẽ gây tải nặng cho CPU và I/O đĩa của main thread. Do đó Redis chọn cách nhẹ hơn: khi tải lại sau khởi động, đọc và phân tích cú pháp từng lệnh.

Nếu phát hiện lỗi cú pháp trong quá trình phân tích (ví dụ lệnh không đầy đủ, lỗi định dạng), Redis sẽ dừng tải và báo lỗi.

> **Cắt phần đuôi để phục hồi (tự động khôi phục)**:
>
> Khi gặp mất điện đột ngột hoặc bị kill bắt buộc bằng `kill -9`, lệnh cuối cùng trong file AOF rất có thể được ghi không đầy đủ (chỉ ghi một nửa). Hành vi khôi phục lúc này được quyết định bởi cấu hình **`aof-load-truncated`**:
>
> | Giá trị cấu hình | Hành vi                                                                                                                       | Kịch bản áp dụng                                                                          |
> | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
> | `yes` (mặc định) | Redis tự động bỏ các lệnh không đầy đủ ở cuối file, tiếp tục khởi động và in cảnh báo trong log                               | Môi trường production được khuyến nghị, chấp nhận mất ít dữ liệu để đổi lấy tính khả dụng |
> | `no`             | Redis từ chối khởi động và báo lỗi trực tiếp, buộc sử dụng công cụ `redis-check-aof` để xác nhận và sửa chữa dữ liệu thủ công | Kịch bản yêu cầu tính toàn vẹn dữ liệu cực cao như tài chính                              |
>
> **Xác minh khôi phục cắt**:
>
> ```bash
> # 模拟断电场景：向 AOF 文件追加无意义的乱码
> echo "truncated garbage data" >> /var/lib/redis/appendonly.aof
>
> # 重启 Redis（aof-load-truncated=yes 时会自动恢复）
> redis-server /path/to/redis.conf
> # 日志输出：# Bad file format reading the append only file: make a backup of your AOF file, then use ./redis-check-aof --fix <filename>
> ```
>
> **Chế độ lỗi**: Nếu **phần giữa** của file AOF (không phải phần đuôi) xuất hiện rác do hỏng đĩa im lặng, cơ chế cắt tự động không có tác dụng, Redis sẽ trực tiếp từ chối phục vụ. Lúc này cần dùng công cụ `redis-check-aof --fix` để sửa chữa.

**Nguyên lý hoạt động của redis-check-aof**:

- **Giai đoạn phát hiện**: Đọc từng lệnh theo định dạng file AOF, kiểm tra số lượng tham số lệnh, độ dài chuỗi tham số, v.v., cung cấp vị trí file của lệnh lỗi/không đầy đủ
- **Giai đoạn sửa chữa**: Cắt nội dung file tiếp theo từ vị trí lỗi (**lưu ý: sẽ mất tất cả dữ liệu sau điểm cắt**), file gốc sẽ được sao lưu thành `appendonly.aof.broken`

#### Chế độ lưu trữ hỗn hợp: Chiến lược xác minh phân đoạn

Trong **chế độ lưu trữ hỗn hợp** (giới thiệu trong Redis 4.0), file AOF sử dụng chiến lược xác minh "quản lý phân đoạn":

```
┌─────────────────────────────────────────────────────────┐
│                    混合持久化文件结构                    │
├─────────────────────────────────────────────────────────┤
│  RDB 快照部分（二进制）   ← CRC64 校验和保护这部分        │
│  ├── "REDIS" 头部                                       │
│  ├── 数据库编号、键值对...                               │
│  ├── EOF 标志                                           │
│  └── CRC64 校验和（8 字节）  ← 校验边界在这里            │
├─────────────────────────────────────────────────────────┤
│  AOF 增量部分（文本）     ← 无校验和，仅语法解析          │
│  ├── *3\r\n$3\r\nSET\r\n...                             │
│  └── ...                                                │
└─────────────────────────────────────────────────────────┘
```

- **Phần snapshot RDB**: Bắt đầu bằng ký tự `REDIS` cố định, lưu snapshot dữ liệu bộ nhớ tại một thời điểm, và đính kèm CRC64 checksum ở cuối dữ liệu snapshot. Checksum này **được đặt chặt ở cuối khối dữ liệu RDB**, chỉ đảm bảo tính toàn vẹn của phần snapshot nhị phân này.
- **Phần gia tăng AOF**: Theo sau snapshot RDB, ghi lệnh ghi gia tăng. Phần này **vẫn không có checksum**, sử dụng xác minh phân tích cú pháp từng lệnh giống AOF thuần.

**Quy trình xác minh khi tải**:

1. Redis trước tiên xác minh phần snapshot RDB: tính CRC64 checksum của phần dữ liệu đó, so sánh với giá trị checksum đã lưu. Nếu không khớp, Redis từ chối khởi động.
2. Sau khi xác minh phần RDB thành công, phân tích từng lệnh AOF gia tăng. Nếu phân tích lỗi thì dừng tải các lệnh tiếp theo (nhưng lúc này dữ liệu snapshot RDB đã được tải thành công).

#### Mô tả mục cấu hình

| Mục cấu hình         | Phạm vi tác dụng                                      | Mô tả                                                                                 |
| -------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `rdbchecksum`        | File RDB, phần RDB của lưu trữ hỗn hợp                | Kiểm soát có tính CRC64 checksum không, không có tác dụng với phần gia tăng AOF thuần |
| `aof-load-truncated` | File AOF thuần, phần gia tăng AOF của lưu trữ hỗn hợp | Kiểm soát khi bị cắt phần đuôi có tự động bỏ và tiếp tục khởi động không              |

**Sửa thủ công** (người dùng nâng cao):

- Nếu không muốn sửa file AOF bằng cách cắt, có thể thử sửa thủ công
- Mở file AOF bằng trình soạn thảo văn bản (định dạng văn bản thuần), xóa hoặc sửa lệnh lỗi thủ công
- Phù hợp với kịch bản cụ thể khi biết chính xác vị trí lỗi

## Tối ưu hóa phiên bản mới

### Redis 4.0 đã tối ưu cơ chế lưu trữ liên tục như thế nào?

Do RDB và AOF mỗi loại có ưu điểm riêng, Redis 4.0 bắt đầu hỗ trợ lưu trữ hỗn hợp RDB và AOF.

#### Mô tả cấu hình

```bash
# 开启 AOF
appendonly yes

# 开启混合持久化（Redis 7.0+ 默认启用）
aof-use-rdb-preamble yes

# 优化重写触发条件
auto-aof-rewrite-percentage 100   # AOF 文件大小比上次重写后增长 100% 时触发
auto-aof-rewrite-min-size 64mb    # AOF 文件至少达到 64MB 才触发重写
```

**Sự khác biệt theo phiên bản**:

- **Redis 4.0-6.x**: Lưu trữ hỗn hợp mặc định tắt, cần cấu hình `aof-use-rdb-preamble yes` thủ công
- **Redis 7.0+**: Lưu trữ hỗn hợp **mặc định bật**, không cần cấu hình thêm

#### Nguyên lý hoạt động

Nếu bật lưu trữ hỗn hợp, khi AOF viết lại sẽ ghi trực tiếp nội dung RDB vào đầu file AOF. Ưu điểm của cách này là có thể kết hợp ưu điểm của RDB và AOF, tải nhanh đồng thời tránh mất quá nhiều dữ liệu.

**Cấu trúc file lưu trữ hỗn hợp**:

```
┌───────────────────┐
│   RDB Header      │ ← 二进制快照（压缩格式）
│   REDIS0009       │
│   ...             │
├───────────────────┤
│   AOF Log Entries │ ← 文本格式命令
│   *3\r\n$3\r\nSET\r\n$5\r\nkey01\r\n...
│   INCR counter    │
│   ...             │
└───────────────────┘
```

**Quy trình hoạt động cốt lõi**:

1. **Giai đoạn xử lý ghi**:

   - Client thực thi lệnh ghi (`SET/INCR`, v.v.)
   - Redis cập nhật dữ liệu bộ nhớ ngay lập tức
   - Ghi lệnh vào buffer AOF (định dạng văn bản)

2. **Giai đoạn kích hoạt lưu trữ liên tục**:

   - Kích thước file AOF đạt ngưỡng (mặc định 64MB) hoặc tăng 100%
   - Kích hoạt AOF rewrite (`BGREWRITEAOF`)

3. **Giai đoạn xây dựng file**:

   - Tiến trình con ghi dữ liệu bộ nhớ hiện tại theo định dạng RDB vào đầu file AOF mới
   - Tiến trình cha tiếp tục xử lý lệnh ghi, dữ liệu gia tăng được ghi vào buffer viết lại
   - Sau khi hoàn thành viết lại, ghi lệnh gia tăng trong buffer viết lại vào cuối file AOF mới

4. **Giai đoạn khôi phục dữ liệu**:
   - Khi Redis khởi động, ưu tiên tải phần RDB (nhanh chóng khôi phục dữ liệu cơ sở)
   - Sau đó phát lại tuần tự các lệnh gia tăng AOF (khôi phục dữ liệu mới nhất)

#### So sánh ưu điểm

| Chỉ số                 | RDB thuần      | AOF thuần         | Lưu trữ hỗn hợp |
| ---------------------- | -------------- | ----------------- | --------------- |
| **Tốc độ khôi phục**   | Nhanh (giây)   | Chậm (phút)       | Nhanh (giây)    |
| **Cửa sổ mất dữ liệu** | Mức phút       | ≤2 giây           | ≤2 giây         |
| **Kích thước file**    | Nhỏ (nén)      | Lớn (log văn bản) | Vừa phải        |
| **Ảnh hưởng ghi**      | Thấp           | Cao               | Trung bình      |
| **Khả năng đọc**       | Kém (nhị phân) | Tốt (văn bản)     | Kém (phần RDB)  |

**Dữ liệu chuẩn** (tập dữ liệu 1GB, SSD):

- Khôi phục AOF thuần: 30-60 giây
- Khôi phục lưu trữ hỗn hợp: 2-5 giây (**nhanh hơn 5-10 lần**)

**Nhược điểm của lưu trữ hỗn hợp**:

- Phần RDB trong file AOF ở định dạng nén, không còn là định dạng AOF, khả năng đọc kém hơn.
- Cần tiêu thụ thêm CPU để nén và giải nén RDB.

#### Các câu hỏi thường gặp và giải pháp

**1. Xác minh cấu hình**:

```bash
# 方法 1：检查文件头（输出 REDIS 表示启用了混合持久化）
head -c 5 appendonly.aof

# 方法 2：CLI 验证
redis-cli CONFIG GET aof-use-rdb-preamble
# 输出：1) "aof-use-rdb-preamble"
#      2) "yes"
```

**2. Khôi phục file bị hỏng**:

**Mô tả công cụ**:

| Công cụ             | Nguyên lý hoạt động                                                            | Phát hiện lỗi                                               | Chức năng sửa chữa                                               |
| ------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------------- |
| **redis-check-aof** | Đọc từng lệnh theo định dạng file AOF, kiểm tra số lượng tham số, độ dài chuỗi | Phát hiện tính đúng và đầy đủ của lệnh, cung cấp vị trí lỗi | ✅ **Hỗ trợ sửa**: Cắt nội dung từ vị trí lỗi, hoặc sửa thủ công |
| **redis-check-rdb** | Đọc tuần tự header file, phần dữ liệu, phần cuối file theo định dạng RDB       | Kiểm tra nội dung có đúng trong quá trình đọc và báo lỗi    | ❌ **Không hỗ trợ sửa**: Chỉ phát hiện vấn đề, cần sửa thủ công  |

**Các bước khôi phục**:

```bash
# 步骤 1：检测 AOF 文件问题
redis-check-aof appendonly.aof
# 输出错误位置和原因

# 步骤 2：修复 AOF 文件（从错误位置截断）
redis-check-aof --fix appendonly.aof
# 原 AOF 文件会被备份为 appendonly.aof.broken

# 步骤 3：检测 RDB 部分
redis-check-rdb appendonly.aof
# 仅检测，不支持 --fix 参数

# 步骤 4：如果 RDB 部分有问题，需人工修复或丢弃整个文件
# 选项 A：人工修复（需了解 RDB 二进制格式）
# 选项 B：删除混合持久化文件，仅使用纯 RDB 或纯 AOF 恢复

# 步骤 5：启动 Redis
redis-server --appendonly yes --appendfilename appendonly.aof
```

> **⚠️ Lưu ý quan trọng**:
>
> - **File AOF**: `redis-check-aof --fix` sẽ cắt file từ vị trí lỗi, **mất tất cả dữ liệu sau điểm cắt**
> - **File RDB**: `redis-check-rdb` **không hỗ trợ sửa**, nếu phần RDB bị hỏng, toàn bộ file lưu trữ hỗn hợp không thể khôi phục, chỉ có thể dựa vào backup hoặc file AOF thuần
> - **Sửa thủ công**: Với phần RDB, nếu bắt buộc phải sửa, cần dùng hex editor (như `hexdump`, `xxd`) để sửa định dạng nhị phân thủ công

#### Khuyến nghị cấu hình production

```bash
# 完整生产配置示例
appendonly yes
aof-use-rdb-preamble yes

# 性能优化
aof-rewrite-incremental-fsync yes   # 增量 fsync，减少磁盘 I/O 峰值
# 延迟敏感场景（推荐 yes）
no-appendfsync-on-rewrite yes       # 重写期间暂停 fsync，避免阻塞
# 数据安全场景（推荐 no）
no-appendfsync-on-rewrite no        # 重写期间仍执行 fsync，可能阻塞但更安全

# 容量规划建议：
# - 预留 2x 内存作为磁盘空间
# - 保持单个 AOF 文件 < 16GB
# - 监控 aof_delayed_fsync 指标
```

Địa chỉ tài liệu chính thức: <https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/>

![](https://oss.javaguide.cn/github/javaguide/database/redis/redis4.0-persitence.png)

### Redis 7.0 đã tối ưu cơ chế lưu trữ liên tục như thế nào?

Do quá trình viết lại AOF tồn tại vấn đề buffer bộ nhớ dữ liệu gia tăng và ghi đĩa kép, Redis 7.0 bắt đầu hỗ trợ Multi-Part AOF (mặc định bật, có thể chỉ định thư mục thông qua mục cấu hình `appenddirname`).

Nếu bật Multi-Part AOF, file AOF sẽ được chia thành file base (tối đa một, snapshot đầy đủ ban đầu, có thể là định dạng RDB hoặc AOF) và nhiều file incr (log lệnh gia tăng), các lệnh mới thêm trong quá trình rewrite được ghi trực tiếp vào file incr mới, file manifest theo dõi tất cả các phần. Ưu điểm của cách này là có thể loại bỏ chi phí buffer bộ nhớ và ghi I/O kép trong quá trình rewrite, cải thiện hiệu suất và giảm thiểu khả năng chặn fsync. Do cấu trúc file phân tách, file INCR giữ ở trạng thái chỉ đọc trước khi rewrite, sao chép file đơn lẻ tương đối an toàn; nhưng backup nhất quán đa file vẫn cần tạm dừng rewrite, quy trình backup tổng thể phức tạp hơn AOF file đơn, và trong tập dữ liệu rất lớn vẫn có thể cần giám sát tài nguyên.

> **Rủi ro điểm lỗi đơn cốt lõi: hỏng file manifest**
>
> Multi-Part AOF phụ thuộc vào **file manifest** để theo dõi và quản lý tất cả file `base/incr/history`, đây là metadata cốt lõi của toàn bộ hệ thống log gia tăng. Nếu file manifest bị hỏng hoặc mất:
>
> | Kịch bản rủi ro              | Tác động                                                                                   | Độ khó khôi phục                        |
> | ---------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------- |
> | **manifest bị hỏng im lặng** | Redis không thể nhận dạng và tải đúng file AOF khi khởi động, database không thể khôi phục | Rất cao (cần tái tạo manifest thủ công) |
> | **manifest mất do lỗi đĩa**  | Dù file base/incr còn nguyên, Redis cũng không thể tái cấu trúc quan hệ phụ thuộc file     | Rất cao (cần can thiệp thủ công)        |
>
> **Biện pháp giảm nhẹ**:
>
> ```bash
> # 1. 备份 manifest 文件（与数据文件同等重要）
> cp /var/lib/redis/appendonlydir/appendonly.aof.manifest /backup/
>
> # 2. 监控磁盘健康度（提前发现故障）
> smartctl -a /dev/sda | grep -E "SMART overall-health self-assessment|Media_Errors"
>
> # 3. 定期验证 manifest 完整性（Redis 启动时会自动校验）
> redis-check-aof /var/lib/redis/appendonlydir/appendonly.aof.manifest
> ```
>
> **Công cụ sửa chữa tự động chính thức không được cung cấp**, môi trường production bắt buộc phải đưa file manifest vào chiến lược backup, tầm quan trọng của nó tương đương với bản thân file dữ liệu RDB/AOF.

## Chỉ số giám sát môi trường production

### Chỉ số hiệu suất lưu trữ liên tục

```bash
# RDB 相关指标
redis-cli INFO persistence | grep rdb_last_bgsave_time_sec
# 建议：< 5s。超过 5s 说明数据集过大或 I/O 性能瓶颈

redis-cli INFO persistence | grep rdb_last_cow_size
# 建议：< 10% used_memory。超过说明 fork 的 Copy-on-Write 内存开销大

redis-cli INFO memory | grep used_memory_rss
redis-cli INFO memory | grep used_memory
# 计算：used_memory_rss / used_memory，fork 时应 < 2

# AOF 相关指标
redis-cli INFO persistence | grep aof_rewrite_in_progress
# 期望：0（未在重写）或 1（正在重写）

redis-cli INFO persistence | grep aof_current_size
redis-cli INFO persistence | grep aof_base_size
# 监控增长率，避免 rewrite 过于频繁

redis-cli INFO persistence | grep aof_buffer_length
# 建议：< 4MB。过大说明主线程写入速度快于 fsync 速度
```

### Giám sát tài nguyên hệ thống

```bash
# 磁盘使用率和 I/O 等待
iostat -x 1 5 | grep dm-0
# 关注：%util（I/O 使用率）、await（平均等待时间）

# 磁盘空间（预留空间给 rewrite 生成新文件）
df -h /var/lib/redis
# 建议：使用率 < 70%

# inode 使用率（小文件多的场景）
df -i /var/lib/redis
# 建议：使用率 < 90%

# 内存使用率
free -h
# 建议：为 fork 预留至少 20% 空闲内存
```

### Khuyến nghị quy tắc cảnh báo

> **Mô tả nguồn chỉ số**:
>
> - **Chỉ số Redis**: Lấy qua `redis-cli INFO` hoặc Redis exporter (như `redis_rss_memory`, `aof_current_size`)
> - **Chỉ số cấp node**: Lấy qua node_exporter hoặc lệnh hệ thống (như `disk_usage`, bộ nhớ hệ thống, mức sử dụng CPU)
>
> Các quy tắc cảnh báo sau giả định sử dụng hệ thống giám sát Prometheus + Redis exporter + node_exporter.

```yaml
alert_rules:
  # ── Redis 持久化相关告警 ────────────────────────────────────────
  - name: "RedisHighMemFragmentation"
    expr: redis_memory_rss_bytes / redis_memory_used_bytes > 2
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Redis 内存碎片率过高，fork COW 风险上升"
      description: >
        实例 {{ $labels.instance }} 的 mem_fragmentation_ratio = {{ $value | humanize }}，
        超过阈值 2。碎片率过高意味着 OS 实际分配的物理页远多于 Redis 自身统计，
        执行 BGSAVE / BGREWRITEAOF 触发 fork 后，COW 需复制的页数会显著增加，
        在高写入负载下可能导致内存暴涨，OOM 风险上升。
        建议执行 MEMORY PURGE 或在低峰期重启实例整理碎片。

  - name: "RedisAofGrowthTooFast"
    expr: deriv(redis_aof_current_size_bytes[5m]) * 60 > 10485760
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Redis AOF 文件写入速率过高"
      description: >
        实例 {{ $labels.instance }} 的 AOF 增长速率超过 10 MB/min
        （当前约 {{ $value | humanize1024 }}B/min）。
        高速写入会持续触发 auto-aof-rewrite，加剧磁盘 I/O 压力，
        并可能产生写入放大。建议检查业务是否存在大量小命令风暴或 KEYS 类全量扫描。

  - name: "RedisAofFsyncDelayed"
    expr: rate(redis_aof_delayed_fsync_total[5m]) > 0
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "Redis AOF fsync 延迟，主线程响应受阻"
      description: >
        实例 {{ $labels.instance }} 持续出现 aof_delayed_fsync 增长，
        主线程因等待 AOF fsync 完成而被阻塞，直接导致命令响应 P99 劣化。
        常见原因：① 磁盘 I/O 带宽饱和；② appendfsync 设置为 always；
        ③ 与其他高 I/O 进程共用磁盘。建议切换为 everysec 策略或迁移至独立磁盘。

  # ── 节点级资源告警 ─────────────────────────────────────────────
  - name: "RedisDiskUsageHigh"
    expr: >
      (1 - node_filesystem_avail_bytes{mountpoint="/var/lib/redis"}
         / node_filesystem_size_bytes{mountpoint="/var/lib/redis"}) * 100 > 70
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Redis 数据盘使用率超过 70%"
      description: >
        挂载点 /var/lib/redis 当前使用率为 {{ $value | humanize }}%。
        AOF rewrite 期间会临时生成新文件，需预留约 1.5x 当前 AOF 大小的空间，
        磁盘不足将导致 rewrite 失败并触发 Redis 错误日志 "MISCONF"。
        RDB bgsave 同理。
      remediation: >
        1. 清理过期 RDB 快照与历史 AOF 文件；
        2. 调高 auto-aof-rewrite-min-size 降低 rewrite 频率；
        3. 磁盘扩容或将数据目录迁移至更大分区。
```

## Cách lựa chọn RDB hay AOF?

Về ưu nhược điểm của RDB và AOF, trang chính thức cũng có mô tả khá chi tiết [Redis persistence](https://redis.io/docs/manual/persistence/), đây tóm tắt đơn giản dựa trên sự hiểu biết cá nhân.

**Những điểm RDB vượt trội hơn AOF**:

- **File nhỏ gọn, phù hợp để backup và khôi phục sau thảm họa**: File RDB lưu trữ nội dung là dữ liệu nhị phân đã nén, lưu tập dữ liệu tại một thời điểm cụ thể, file rất nhỏ, rất phù hợp để backup dữ liệu và khôi phục sau thảm họa. File AOF lưu trữ mỗi lệnh ghi, tương tự như binlog của MySQL, thường lớn hơn file RDB nhiều. Khi AOF trở nên quá lớn, Redis có thể tự động viết lại AOF trong nền, file AOF mới lưu trạng thái database giống với file AOF gốc nhưng kích thước nhỏ hơn. Tuy nhiên, trước Redis 7.0, nếu có lệnh ghi trong quá trình viết lại, AOF có thể sử dụng nhiều bộ nhớ, tất cả lệnh ghi đến trong quá trình viết lại đều được ghi vào đĩa hai lần.
- **Tốc độ khôi phục nhanh**: Dùng file RDB để khôi phục dữ liệu, chỉ cần phân tích và khôi phục dữ liệu trực tiếp, không cần thực thi từng lệnh một, tốc độ rất nhanh. Còn AOF cần thực thi từng lệnh ghi, tốc độ rất chậm. Tức là so với AOF, khi khôi phục tập dữ liệu lớn, RDB nhanh hơn.
- **Ưu điểm nhân bản master-slave**: Trên replica, RDB hỗ trợ **đồng bộ lại từng phần (Partial Resynchronization)** sau khi khởi động lại và chuyển đổi dự phòng. Replica có thể nhanh chóng đồng bộ đến trạng thái tại một thời điểm của master node bằng RDB snapshot, mà không cần đồng bộ toàn bộ.
- **Chi phí hiệu suất thấp**: RDB tối đa hóa hiệu suất Redis, vì công việc lưu trữ liên tục duy nhất mà tiến trình cha Redis cần làm là fork tiến trình con, tiến trình con sẽ hoàn thành tất cả phần còn lại. Tiến trình cha không bao giờ thực hiện I/O đĩa hoặc các thao tác tương tự.

**Những điểm AOF vượt trội hơn RDB**:

- **An toàn dữ liệu cao hơn, hỗ trợ lưu trữ liên tục theo giây**: An toàn dữ liệu của RDB không bằng AOF, không thể lưu trữ liên tục dữ liệu theo thời gian thực hoặc theo giây. Quá trình tạo file RDB khá nặng nề, mặc dù tiến trình con BGSAVE ghi file RDB không chặn main thread, nhưng sẽ ảnh hưởng đến tài nguyên CPU và bộ nhớ của máy, trong trường hợp nghiêm trọng có thể trực tiếp làm Redis bị sập. AOF hỗ trợ mất dữ liệu theo giây (tùy thuộc vào chiến lược `fsync`, nếu là `everysec`, thường mất tối đa 1 giây dữ liệu; nhưng khi I/O đĩa bận có thể mất 2 giây và main thread sẽ bị chặn), chỉ ghi thêm lệnh vào file AOF, thao tác nhẹ nhàng.
- **Tương thích phiên bản tốt**: File RDB được lưu theo định dạng nhị phân cụ thể, và trong quá trình phát triển Redis có nhiều phiên bản RDB khác nhau, nên tồn tại vấn đề dịch vụ Redis phiên bản cũ không tương thích với định dạng RDB phiên bản mới.
- **Khả năng đọc và thao tác mạnh**: AOF chứa log của tất cả các thao tác theo định dạng dễ hiểu và phân tích. Có thể dễ dàng export file AOF để phân tích, cũng có thể thao tác trực tiếp trên file AOF để giải quyết một số vấn đề. Ví dụ, sau khi vô tình xóa tất cả nội dung bằng lệnh `FLUSHALL`, chỉ cần file AOF chưa bị viết lại, xóa lệnh mới nhất và khởi động lại là có thể khôi phục trạng thái trước đó.
- **Không có rủi ro hỏng do ghi thêm**: Log AOF là log ghi thêm, không có seek, cũng không có vấn đề hỏng do mất điện. Ngay cả khi log kết thúc với lệnh ghi nửa chừng vì một lý do nào đó (đĩa đầy hoặc lý do khác), công cụ `redis-check-aof` cũng có thể sửa dễ dàng.

**Ảnh hưởng của quá trình phát triển phiên bản đến việc lựa chọn**:

| Phiên bản     | Cải tiến chính                                      | Ảnh hưởng đến AOF                                                                           | Ý nghĩa cho việc lựa chọn                                                                                   |
| ------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Redis 4.0** | Giới thiệu lưu trữ hỗn hợp (`aof-use-rdb-preamble`) | File base khi AOF rewrite dùng định dạng RDB, tốc độ khôi phục tăng 5-10 lần                | Giảm thiểu vấn đề tải chậm của AOF thuần, nhưng vẫn cần chú ý chi phí bộ nhớ và I/O trong quá trình rewrite |
| **Redis 7.0** | Giới thiệu Multi-Part AOF                           | Triệt để loại bỏ vấn đề ghi kép trong quá trình rewrite, chi phí bộ nhớ và I/O giảm đáng kể | Sử dụng AOF riêng lẻ trong môi trường production khả thi hơn, nhưng vấn đề chặn fork vẫn chưa giải quyết    |

**Vấn đề cốt lõi chưa giải quyết**:

- **Chặn fork**: Dù là RDB bgsave hay AOF rewrite, bản thân thao tác fork đều chặn main thread (tập dữ liệu càng lớn, thời gian chặn càng dài)
- **Khuyến nghị chính thức**: Tài liệu Redis chính thức đến nay vẫn khuyến nghị **đồng thời bật RDB và AOF**, RDB dùng như phương tiện cold backup bổ sung, xử lý các kịch bản cực đoan như file AOF bị hỏng hoặc lỗi ghi

**Tương tác giữa AOF và RDB**:

Khi cả AOF và RDB đều bật:

- **Tránh thực hiện đồng thời các thao tác I/O nặng**: Redis 2.4+ đảm bảo tránh kích hoạt AOF rewrite khi đang thực hiện RDB snapshot, hoặc cho phép BGSAVE trong khi AOF rewrite đang chạy. Điều này ngăn hai tiến trình nền Redis cùng thực hiện I/O đĩa nặng.
- **Lên lịch AOF rewrite**: Khi snapshot đang chạy và người dùng yêu cầu rõ ràng thao tác viết lại log (dùng BGREWRITEAOF), server sẽ trả về mã trạng thái OK, nói với người dùng rằng thao tác đã được lên lịch, viết lại sẽ bắt đầu sau khi snapshot hoàn thành.
- **Ưu tiên khôi phục khi khởi động lại**: Nếu cả AOF và RDB đều bật và Redis khởi động lại, **file AOF sẽ được dùng để tái tạo tập dữ liệu gốc**, vì nó được đảm bảo là đầy đủ nhất.

**Khuyến nghị lựa chọn**:

| Kịch bản                                                   | Phương án khuyến nghị                                                                      | Mô tả                                                                                         |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| **Cache thuần túy (có thể mất)**                           | **Tắt lưu trữ liên tục** hoặc chỉ RDB (tần suất thấp)                                      | Tắt hoàn toàn có chi phí thấp nhất; nếu cần cold backup thì giữ RDB tần suất thấp             |
| **Tầm quan trọng dữ liệu trung bình** (session, cấu hình)  | **Lưu trữ hỗn hợp RDB + AOF** (Redis 4.0+)                                                 | RDB tăng tốc khôi phục, AOF bổ sung gia tăng, `everysec` mất tối đa 1 giây                    |
| **Tầm quan trọng dữ liệu cao** (dữ liệu nghiệp vụ cốt lõi) | **RDB + AOF (MP-AOF, Redis 7.0+)**, và Redis là tầng cache chứ không phải storage duy nhất | MP-AOF giảm chi phí rewrite; lưu trữ thực sự do database chính (MySQL, v.v.) chịu trách nhiệm |
| **Kiến trúc master-slave**                                 | **Master tắt lưu trữ liên tục, slave bật AOF**                                             | Master cấm cấu hình tự động khởi động lại, tránh tập dữ liệu trống ghi đè slave               |

## Tài liệu tham khảo

- 《Redis 设计与实现》
- Redis persistence - Tài liệu chính thức Redis: <https://redis.io/docs/management/persistence/>
- The difference between AOF and RDB persistence: <https://www.sobyte.net/post/2022-04/redis-rdb-and-aof/>
- Redis AOF 持久化详解 - Lập trình viên Li Xiaobing: <http://remcarpediem.net/article/376c55d8/>
- Redis RDB 与 AOF 持久化 · Analyze: <https://wingsxdu.com/posts/database/redis/rdb-and-aof/>

<!-- @include: @article-footer.snippet.md -->
