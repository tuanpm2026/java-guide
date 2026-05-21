---
title: Tổng hợp các nguyên nhân gây Block phổ biến trong Redis
description: Tổng hợp toàn diện các nguyên nhân gây block phổ biến trong Redis, bao gồm câu lệnh O(n), thao tác bigkey, AOF log flush disk, tạo RDB snapshot, master-slave sync, v.v. Giúp bạn troubleshoot và ngăn chặn vấn đề hiệu năng Redis.
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis block,Redis performance issue,O(n) command,bigkey,AOF flush disk,RDB snapshot,master-slave sync,memory limit
---

<!-- @include: @small-advertisement.snippet.md -->

> Bài này được tổng hợp và cải thiện từ: <https://mp.weixin.qq.com/s/0Nqfq_eQrUb12QH6eBbHXA>, tác giả: A Q Nói Code.

Bài này sẽ tổng kết chi tiết các tình huống có thể gây Redis block. Những tình huống này cũng là các yếu tố then chốt ảnh hưởng đến hiệu năng Redis — cần đặc biệt chú ý khi dùng Redis!

## Câu lệnh O(n)

Hầu hết câu lệnh trong Redis đều có time complexity O(1), nhưng cũng có một số câu lệnh O(n), ví dụ:

- `KEYS *`: Trả về tất cả key thỏa rule.
- `HGETALL`: Trả về tất cả key-value pair trong một Hash.
- `LRANGE`: Trả về các element trong phạm vi chỉ định của List.
- `SMEMBERS`: Trả về tất cả element trong Set.
- `SINTER`/`SUNION`/`SDIFF`: Tính intersection/union/difference của nhiều Set.
- ……

Vì các câu lệnh này có time complexity O(n), đôi khi còn full table scan. Khi n tăng lên, thời gian thực thi cũng tăng, dẫn đến client bị block. Tuy nhiên, không phải tuyệt đối không thể dùng các câu lệnh này, nhưng cần biết rõ giá trị N. Ngoài ra, khi cần duyệt có thể dùng `HSCAN`, `SSCAN`, `ZSCAN` để thay thế.

Ngoài các câu lệnh O(n) có thể gây block, còn có một số câu lệnh có time complexity có thể trên O(N):

- `ZRANGE`/`ZREVRANGE`: Trả về tất cả element trong phạm vi rank chỉ định của Sorted Set. Time complexity là O(log(n)+m), n là tổng số element, m là số element trả về. Khi m và n đều khá lớn, O(n) thậm chí còn nhỏ hơn.
- `ZREMRANGEBYRANK`/`ZREMRANGEBYSCORE`: Xóa tất cả element trong phạm vi rank/score chỉ định của Sorted Set. Time complexity là O(log(n)+m), n là tổng số element, m là số element bị xóa. Khi m và n đều khá lớn, O(n) còn nhỏ hơn.
- ……

## Câu lệnh SAVE tạo RDB Snapshot

Redis cung cấp hai câu lệnh để tạo file RDB snapshot:

- `save`: Thao tác lưu đồng bộ, block Redis main thread.
- `bgsave`: Fork ra một child process để thực thi, không block Redis main thread — là option mặc định.

Mặc định, cấu hình mặc định của Redis dùng lệnh `bgsave`. Nếu thủ công dùng lệnh `save` để tạo RDB snapshot thì sẽ block main thread.

## AOF

### Block khi ghi AOF log

Cơ chế AOF persistence của Redis là ghi log sau khi thực thi xong câu lệnh — khác với RDBMS (như MySQL) thường ghi log trước khi thực thi (để khôi phục khi sự cố).

![Quá trình ghi AOF log](https://oss.javaguide.cn/github/javaguide/database/redis/redis-aof-write-log-disc.png)

**Tại sao ghi log sau khi thực thi câu lệnh?**

- Tránh overhead kiểm tra thêm — AOF ghi log không kiểm tra syntax của câu lệnh.
- Ghi sau khi thực thi xong câu lệnh, không block thực thi câu lệnh hiện tại.

Điều này cũng mang lại rủi ro:

- Nếu Redis crash ngay sau khi thực thi câu lệnh xong, sửa đổi tương ứng sẽ bị mất.
- **Có thể block thực thi các câu lệnh tiếp theo (vì AOF ghi log trên Redis main thread)**.

### Block khi AOF flush disk

Sau khi bật AOF persistence, mỗi khi thực thi một câu lệnh thay đổi data trong Redis, Redis ghi câu lệnh đó vào AOF buffer `server.aof_buf`, sau đó dựa trên cấu hình `appendfsync` để quyết định khi nào sync lên file AOF trong disk.

Trong config file của Redis có ba chiến lược AOF persistence (`fsync` policy):

1. `appendfsync always`: Sau khi main thread gọi `write` thực thi write operation, **main thread** ngay lập tức gọi function `fsync` để sync AOF file (flush disk), sau khi `fsync` hoàn thành thread mới trả về. Chiến lược `always` **main thread thực thi fsync trực tiếp**, không phải background thread. Cách này data an toàn nhất, nhưng mỗi write operation đều block main thread đồng bộ, giảm nghiêm trọng hiệu năng Redis (`write` + `fsync`).
2. `appendfsync everysec`: Main thread gọi `write` thực thi write operation rồi trả về ngay lập tức. Background thread (`aof_fsync` thread) gọi function `fsync` mỗi giây để sync AOF file (`write` + `fsync`, `fsync` interval là 1 giây).
3. `appendfsync no`: Main thread gọi `write` thực thi write operation rồi trả về ngay, để OS quyết định khi nào sync. Trên Linux thường là 30 giây một lần (`write` nhưng không `fsync` — thời điểm `fsync` do OS quyết định).

Khi background thread (`aof_fsync` thread) gọi function `fsync` để sync AOF file, cần chờ cho đến khi ghi xong. Khi disk pressure quá lớn, `fsync` operation có thể bị block. Main thread gọi function `write` cũng sẽ bị block. Sau khi `fsync` hoàn tất, `write` của main thread mới có thể return thành công.

Xem bài [Giải thích chi tiết cơ chế Redis Persistence](./redis-persistence.md) để hiểu chi tiết về AOF workflow — giúp hiểu AOF flush disk blocking.

### Block khi AOF rewrite

1. Fork ra một child thread để rewrite file. Khi thực thi lệnh `BGREWRITEAOF`, Redis server duy trì một AOF rewrite buffer. Buffer này ghi lại tất cả write command server thực thi trong khi child thread tạo file AOF mới.
2. Sau khi child thread hoàn thành tạo file AOF mới, server sẽ append toàn bộ nội dung trong rewrite buffer vào cuối file AOF mới để file AOF mới lưu trạng thái database nhất quán với trạng thái database hiện tại.
3. Cuối cùng server dùng file AOF mới thay thế file cũ để hoàn tất AOF rewrite.

Block xuất hiện ở bước 2 — trong quá trình ghi data mới từ buffer vào file mới sẽ sinh ra **block**.

Đọc thêm: [Phân tích vấn đề AOF rewrite blocking trong Redis](https://cloud.tencent.com/developer/article/1633077).

## Big Key

Nếu value tương ứng với một key chiếm nhiều memory, key đó có thể coi là bigkey. Bao nhiêu mới gọi là lớn? Có một tiêu chuẩn tham khảo không quá chính xác:

- Value kiểu string vượt quá 1MB.
- Value của kiểu compound (list, hash, set, sorted set, v.v.) chứa hơn 5000 element (với value kiểu compound, không nhất thiết càng nhiều element thì càng chiếm nhiều memory).

Vấn đề block do bigkey:

- **Client timeout block**: Vì Redis thực thi câu lệnh là single-thread, thao tác bigkey tốn thời gian hơn — block Redis. Từ phía client nhìn vào là không có response trong rất rất lâu.
- **Gây network block**: Mỗi lần lấy bigkey sinh ra network traffic lớn. Nếu một key có kích thước 1MB và lượng truy cập mỗi giây là 1000, thì mỗi giây sinh ra 1000MB traffic — đây là thảm họa với server NIC Gigabit thông thường.
- **Block working thread**: Nếu dùng `del` để xóa bigkey, sẽ block working thread, khiến không xử lý được các câu lệnh tiếp theo.

### Tìm Big Key

Khi dùng tham số `--bigkeys` tích hợp sẵn của Redis để tìm bigkey, tốt nhất chọn thực thi lệnh này trên replica node. Vì thực thi trên master node sẽ **block** master node.

- Cũng có thể dùng lệnh SCAN để tìm bigkey.
- Phân tích file RDB để tìm bigkey — tiền đề của phương án này là Redis dùng RDB persistence. Trên mạng có sẵn các tool:
  - redis-rdb-tools: Tool viết bằng Python để phân tích file RDB snapshot của Redis.
  - rdb_bigkeys: Tool viết bằng Go để phân tích file RDB snapshot, hiệu năng tốt hơn.

### Xóa Big Key

Bản chất của thao tác xóa là giải phóng memory space bị key-value pair chiếm dụng.

Giải phóng memory chỉ là bước đầu. Để quản lý memory space hiệu quả hơn, khi ứng dụng giải phóng memory, **OS cần insert memory block đã giải phóng vào linked list của free memory block** để quản lý và cấp phát lại sau. Quá trình này tốn một khoảng thời gian nhất định và sẽ **block** ứng dụng đang giải phóng memory hiện tại.

Vì vậy, nếu đột ngột giải phóng lượng lớn memory, thời gian thao tác trên free memory block linked list sẽ tăng. Tương ứng sẽ gây block Redis main thread. Nếu main thread bị block, tất cả request khác có thể đều timeout. Timeout ngày càng nhiều sẽ gây cạn kiệt kết nối Redis và sinh ra nhiều loại exception.

Khuyến nghị dùng cách xóa theo batch và xóa bất đồng bộ khi xóa bigkey.

## Xóa Database

Xóa database và xóa bigkey ở trên là cùng nguyên lý. `flushdb`, `flushall` cũng liên quan đến xóa và giải phóng tất cả key-value pair — cũng là điểm block của Redis.

## Cluster Scale-out

Redis cluster có thể thực hiện dynamic scale up/down node. Quá trình này hiện vẫn ở trạng thái bán tự động, cần can thiệp thủ công.

Khi scale up/down, cần migrate data. Redis để đảm bảo tính nhất quán trong quá trình migrate, tất cả thao tác migrate đều là synchronous operation.

Khi thực thi migrate, cả Redis ở hai đầu đều vào trạng thái block trong khoảng thời gian không đều. Với small key, thời gian này có thể bỏ qua. Nhưng nếu memory của key quá lớn, trong trường hợp nghiêm trọng có thể trigger failover trong cluster, gây switchover không cần thiết.

## Swap (Memory Swap)

**Swap là gì?** Swap dịch thẳng ra là hoán đổi. Swap trong Linux thường được gọi là memory swap hay swap partition. Tương tự như virtual memory trong Windows — khi memory không đủ, lấy một phần dung lượng HDD ảo hóa thành memory sử dụng, giải quyết vấn đề memory không đủ. Do đó, vai trò của Swap partition là hi sinh HDD để tăng memory, giải quyết vấn đề VPS không đủ memory hoặc memory đầy.

Swap đối với Redis là cực kỳ nguy hiểm. Một tiền đề quan trọng Redis đảm bảo high performance là tất cả data đều trong memory. Nếu OS swap phần memory Redis đang dùng ra HDD, vì tốc độ đọc/ghi memory và HDD chênh nhau vài bậc độ lớn, sẽ khiến Redis performance giảm mạnh sau khi swap.

Cách kiểm tra Redis có xảy ra Swap không:

1. Query process ID của Redis

```bash
redis-cli -p 6383 info server | grep process_id
process_id: 4476
```

2. Query thông tin memory swap theo process ID

```bash
cat /proc/4476/smaps | grep Swap
Swap: 0kB
Swap: 0kB
Swap: 4kB
Swap: 0kB
Swap: 0kB
.....
```

Nếu swap amount đều là 0KB hoặc một số ít là 4KB thì bình thường.

Cách ngăn chặn memory swap:

- Đảm bảo máy có đủ memory khả dụng.
- Đảm bảo tất cả Redis instance đặt maximum memory (maxmemory) để ngăn memory Redis tăng không kiểm soát trong tình huống cực đoan.
- Giảm priority sử dụng swap của hệ thống, ví dụ `echo 10 > /proc/sys/vm/swappiness`.

## CPU Contention

Redis là ứng dụng CPU-intensive điển hình — không khuyến nghị deploy cùng với các service CPU-intensive multi-core khác. Khi các process khác tiêu thụ CPU quá mức sẽ ảnh hưởng nghiêm trọng đến throughput của Redis.

Có thể dùng `redis-cli --stat` để lấy tình trạng sử dụng Redis hiện tại. Dùng lệnh `top` để lấy thông tin CPU utilization của process. Dùng `info commandstats` để phân tích thông tin statistics và tìm ra câu lệnh nào có overhead thời gian bất hợp lý — kiểm tra có phải do algorithm complexity cao hay memory optimization quá mức không.

## Vấn đề mạng

Các vấn đề mạng như connection refused, network latency, NIC soft interrupt cũng có thể gây Redis block.

## Tài liệu tham khảo

- Phân tích và tổng hợp 6 loại tình huống block Redis: <https://mp.weixin.qq.com/s/eaZCEtTjTuEmXfUubVHjew>
- Redis Development and Operation Notes — Ác mộng của Redis — Block: <https://mp.weixin.qq.com/s/TDbpz9oLH6ifVv6ewqgSgA>

<!-- @include: @article-footer.snippet.md -->
