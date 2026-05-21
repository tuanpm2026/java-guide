---
title: Tổng hợp các giải pháp tạo Distributed ID
category: Distributed System
description: Giải thích chi tiết các giải pháp tạo distributed ID, bao gồm nguyên lý, ưu/nhược điểm và phân tích phạm vi áp dụng của các giải pháp chính như UUID, database auto-increment ID, segment mode, Snowflake algorithm, Leaf.
tag:
  - Distributed ID
head:
  - - meta
    - name: keywords
      content: distributed ID,snowflake algorithm,Snowflake,UUID,segment mode,Leaf,distributed ID generation,globally unique ID,distributed ID interview questions
---

<!-- @include: @small-advertisement.snippet.md -->

## Giới thiệu Distributed ID

### ID là gì?

Trong phát triển hàng ngày, chúng ta cần dùng ID để unique identify các loại dữ liệu khác nhau trong hệ thống. Ví dụ user ID tương ứng và chỉ tương ứng với một người, product ID tương ứng và chỉ tương ứng với một sản phẩm, order ID tương ứng và chỉ tương ứng với một đơn hàng.

Trong cuộc sống thực tế cũng có nhiều loại ID, ví dụ CMND tương ứng và chỉ tương ứng với một người, address ID tương ứng và chỉ tương ứng với một địa chỉ.

Nói đơn giản, **ID là unique identifier của data**.

### Distributed ID là gì?

Distributed ID là ID trong distributed system. Distributed ID không tồn tại trong cuộc sống thực tế, là một khái niệm trong hệ thống máy tính.

Tôi lấy một ví dụ đơn giản về database sharding.

Một project của công ty tôi dùng MySQL standalone. Nhưng không ngờ rằng, một tháng sau khi project launch, khi ngày càng có nhiều người dùng, tổng lượng data của toàn hệ thống ngày càng lớn. MySQL standalone không còn đáp ứng được nữa, cần thực hiện database/table sharding (khuyến nghị Sharding-JDBC).

Sau khi sharding database, data nằm rải rác trên các database của các server khác nhau, auto-increment primary key của database không còn thể đảm bảo tính unique của primary key được tạo ra. **Làm thế nào để tạo globally unique primary key cho các data node khác nhau?**

Đây là lúc cần tạo **Distributed ID**.

![](/images/github/javaguide/system-design/distributed-system/id-after-the-sub-table-not-conflict.png)

### Distributed ID cần đáp ứng những yêu cầu nào?

![](/images/github/javaguide/system-design/distributed-system/distributed-id-requirements.png)

Distributed ID là mắt xích không thể thiếu trong distributed system, nhiều nơi cần dùng đến.

Một distributed ID cơ bản nhất cần đáp ứng các yêu cầu sau:

- **Globally unique**: Tính globally unique của ID chắc chắn là điều phải đáp ứng đầu tiên!
- **High performance**: Tốc độ tạo distributed ID phải nhanh, tiêu tốn ít local resource.
- **High availability**: Service tạo distributed ID phải đảm bảo availability vô hạn gần 100%.
- **Dễ dùng**: Dùng ngay khi cần, sử dụng thuận tiện, tích hợp nhanh!

Ngoài những điều này, một distributed ID tốt còn nên đảm bảo:

- **Security**: ID không chứa thông tin nhạy cảm.
- **Ordered and incremental**: Nếu muốn lưu ID vào database, tính tuần tự của ID có thể cải thiện tốc độ ghi database. Và nhiều khi, chúng ta rất có thể còn trực tiếp sort theo ID.
- **Có ý nghĩa nghiệp vụ cụ thể**: Nếu ID được tạo ra có ý nghĩa nghiệp vụ cụ thể, có thể làm cho việc locate vấn đề và phát triển minh bạch hơn (qua ID có thể xác định là nghiệp vụ nào).
- **Independently deployable**: Tức là distributed system có một ID issuing service riêng biệt, chuyên dùng để tạo distributed ID. Như vậy service tạo ID có thể decouple với service liên quan đến business. Tuy nhiên, điều này cũng mang lại vấn đề tăng network call overhead. Tổng thể mà nói, nếu có nhiều scenario cần dùng distributed ID, independent deployment của ID issuing service vẫn rất cần thiết.

## Giải pháp tạo dựa trên Database (Stateful)

### Database Primary Key Auto-increment

Cách này khá đơn giản rõ ràng — tạo unique ID thông qua auto-increment primary key của relational database.

![Database primary key auto-increment](/images/github/javaguide/system-design/distributed-system/the-primary-key-of-the-database-increases-automatically.png)

Lấy MySQL làm ví dụ, chúng ta thực hiện theo cách sau.

**1. Tạo một database table.**

```sql
CREATE TABLE `sequence_id` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `stub` char(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `stub` (`stub`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Field `stub` không có ý nghĩa, chỉ để placeholder, tiện cho chúng ta insert hoặc modify data. Và, tạo unique index cho field `stub` để đảm bảo tính unique.

**2. Insert data thông qua `replace into`.**

```java
BEGIN;
REPLACE INTO sequence_id (stub) VALUES ('stub');
SELECT LAST_INSERT_ID();
COMMIT;
```

**⚠️ Production risk của REPLACE INTO**:

`REPLACE INTO` bản chất là combination operation của **`DELETE` + `INSERT`**:

- Khi insert thất bại do dữ liệu trùng primary key hoặc unique index, trước tiên xóa conflict row có duplicate key value trong table, sau đó thử lại việc insert data vào table.
- Mỗi operation đều trigger index deletion và rebuilding, gây áp lực khá lớn lên database.
- Nếu table có trigger, DELETE operation sẽ trigger không mong muốn.

**Alternative solution**: Trong production khuyến nghị dùng segment mode (sẽ giới thiệu sau), hoặc đổi sang `INSERT ... ON DUPLICATE KEY UPDATE` để giảm index turbulence.

Ưu nhược điểm của cách này cũng khá rõ ràng:

- **Ưu điểm**: Triển khai tương đối đơn giản, ID có thứ tự tăng dần, tiêu tốn ít space lưu trữ.
- **Nhược điểm**: Concurrency được hỗ trợ không lớn, tồn tại vấn đề database single point (có thể dùng database cluster để giải quyết nhưng tăng độ phức tạp), ID không có ý nghĩa nghiệp vụ cụ thể, vấn đề bảo mật (ví dụ dựa trên quy luật tăng dần của order ID có thể suy ra được lượng đơn hàng mỗi ngày — bí mật thương mại đấy!), mỗi lần lấy ID đều phải access database một lần (tăng áp lực cho database, tốc độ lấy cũng chậm).

### Database Segment Mode

Database primary key auto-increment mode, mỗi lần lấy ID đều phải access database một lần. Khi nhu cầu ID lớn, chắc chắn không ổn.

Nếu chúng ta có thể lấy theo batch, rồi lưu trong memory. Khi cần dùng, lấy trực tiếp từ memory thì thoải mái hơn nhiều! Đây chính là cái gọi là **Distributed ID generation based on database segment mode**.

Database segment mode cũng là một trong những cách tạo distributed ID mainstream hiện tại. Như [Tinyid](https://github.com/didi/tinyid/wiki/tinyid原理介绍) mã nguồn mở của Didi cũng được làm theo cách này. Tuy nhiên, TinyId sử dụng dual segment cache, added multi-db support và các cách khác để tiếp tục tối ưu.

Lấy MySQL làm ví dụ, chúng ta thực hiện theo cách sau.

**1. Tạo database table.**

```sql
CREATE TABLE `sequence_id_generator` (
  `id` int(10) NOT NULL,
  `current_max_id` bigint(20) NOT NULL COMMENT 'Current max ID',
  `step` int(10) NOT NULL COMMENT 'Segment length',
  `version` int(20) NOT NULL COMMENT 'Version number',
  `biz_type`    int(20) NOT NULL COMMENT 'Business type',
   PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Field `current_max_id` và `step` chủ yếu dùng để lấy batch ID. Batch ID lấy được là: `current_max_id ~ current_max_id+step`.

![Database segment mode](/images/github/javaguide/system-design/distributed-system/database-number-segment-mode.png)

Field `version` chủ yếu dùng để giải quyết vấn đề concurrency (optimistic lock). Flow đầy đủ như sau:

```sql
-- 1. Đọc giá trị hiện tại
SELECT current_max_id, step, version FROM sequence_id_generator WHERE biz_type = 101;
-- 2. CAS update (version làm optimistic lock version number)
UPDATE sequence_id_generator
SET current_max_id = current_max_id + step, version = version + 1
WHERE version = {version hiện tại đọc được} AND biz_type = 101;
-- 3. Kiểm tra affected_rows, 1 nghĩa là thành công, 0 nghĩa là bị thread khác cướp trước, cần retry
```

> **⚠️ High concurrency retry reminder**: Vào thời điểm segment hết, nhiều thread có thể đồng thời tranh giành segment mới, CAS update có thể thất bại. Code level cần triển khai **retry loop với số lần giới hạn** (như 3 lần) để đảm bảo request stability. Nếu retry vẫn thất bại, nên fallback sang blocking wait hoặc trả về fallback ID.

`biz_type` chủ yếu dùng để represent business type.

**2. Insert một row data trước.**

```sql
INSERT INTO `sequence_id_generator` (`id`, `current_max_id`, `step`, `version`, `biz_type`)
VALUES
 (1, 0, 100, 0, 101);
```

**3. Lấy batch unique ID cho business được chỉ định qua SELECT**

```sql
SELECT `current_max_id`, `step`,`version` FROM `sequence_id_generator` where `biz_type` = 101
```

Kết quả:

```plain
id current_max_id step version biz_type
1 0 100 0 101
```

**4. Nếu không đủ, update rồi SELECT lại.**

```sql
UPDATE sequence_id_generator SET current_max_id = 0+100, version=version+1 WHERE version = 0  AND `biz_type` = 101
SELECT `current_max_id`, `step`,`version` FROM `sequence_id_generator` where `biz_type` = 101
```

Kết quả:

```plain
id current_max_id step version biz_type
1 100 100 1 101
```

So với cách database primary key auto-increment, **database segment mode access database ít hơn, database pressure nhỏ hơn.**

Ngoài ra, để tránh single point, bạn có thể dùng master-slave mode để cải thiện availability.

**Ưu nhược điểm của database segment mode:**

- **Ưu điểm**: ID có thứ tự tăng dần, tiêu tốn ít space lưu trữ.
- **Nhược điểm**: Tồn tại vấn đề database single point (có thể dùng database cluster để giải quyết nhưng tăng độ phức tạp), ID không có ý nghĩa nghiệp vụ cụ thể, vấn đề bảo mật.

### NoSQL

![](/images/github/javaguide/system-design/distributed-system/nosql-distributed-id.png)

Thông thường, NoSQL solution dùng Redis nhiều hơn. Chúng ta có thể dùng lệnh `incr` của Redis để thực hiện atomic sequential increment của ID.

```bash
127.0.0.1:6379> set sequence_id_biz_type 1
OK
127.0.0.1:6379> incr sequence_id_biz_type
(integer) 2
127.0.0.1:6379> get sequence_id_biz_type
"2"
```

Để cải thiện availability và concurrency, chúng ta có thể dùng Redis Cluster. Redis Cluster là distributed Redis solution do Redis official cung cấp (phiên bản 3.0+).

Ngoài Redis Cluster, bạn cũng có thể dùng giải pháp Redis cluster mã nguồn mở [Codis](https://github.com/CodisLabs/codis) (khuyến nghị cho large-scale cluster như hàng trăm node).

Ngoài high availability và concurrency, chúng ta biết Redis dựa trên memory, cần persist data, tránh mất data sau khi restart hoặc machine failure. Redis hỗ trợ hai cách persist khác nhau: **snapshot (RDB)**, **append-only file (AOF)**. Và, Redis 4.0 bắt đầu hỗ trợ **hybrid persistence của RDB và AOF** (mặc định tắt, có thể bật qua config item `aof-use-rdb-preamble`).

Về Redis persistence, tôi không giới thiệu thêm nhiều ở đây. Bạn chưa hiểu phần này có thể xem bài [Redis Persistence Mechanism Explained](https://javaguide.cn/database/redis/redis-persistence.html).

Mặc dù Redis `INCR` có hiệu năng tốt, nhưng có các failure path sau cần đặc biệt chú ý:

1. **Persistence delay dẫn đến ID rollback**

   - **Scenario**: Sau khi thực thi `INCR`, Redis crash trước khi RDB/AOF flush.
   - **Hậu quả**: Sau khi restart, ID rollback về giá trị persist lần trước, có thể tạo duplicate ID.

2. **AOF rewrite gây short-time blocking**
   - **Scenario**: AOF file quá lớn trigger rewrite.
   - **Hậu quả**: Main process fork child process có thể gây performance jitter ngắn.

**Production configuration recommendation**:

```conf
# Redis 7.0+ recommended configuration
appendonly yes
appendfsync everysec
aof-use-rdb-preamble yes  # Hybrid persistence, RDB+AOF combination
```

- **Redis 7.0+ optimization**: Multi-part AOF mechanism tiếp tục giảm IO blocking risk khi rewrite.
- **Alternative**: Dùng Lua script + `SETNX` để triển khai idempotent check, hoặc dùng database segment mode cho scenario có yêu cầu ID uniqueness cực cao.

**Ưu nhược điểm của Redis solution:**

- **Ưu điểm**: Hiệu năng tốt và ID được tạo ra có thứ tự tăng dần.
- **Nhược điểm**: Tương tự nhược điểm của database primary key auto-increment solution, và có rủi ro ID rollback do persistence.

Ngoài Redis, MongoDB ObjectId cũng thường được dùng như giải pháp distributed ID.

![MongoDB ObjectId Specification](/images/github/javaguide/system-design/distributed-system/mongodb9-objectId-distributed-id.png)

MongoDB ObjectId tổng cộng cần 12 byte để lưu:

- 0~3: Unix timestamp (**second precision**, 4 bytes)
- 3~6: Machine ID
- 7~8: Machine process ID
- 9~11: Auto-increment value

**Ưu nhược điểm của MongoDB solution:**

- **Ưu điểm**: Hiệu năng tốt và ID được tạo ra có thứ tự tăng dần.
- **Nhược điểm**: Cần giải quyết vấn đề duplicate ID (khi machine time không đúng có thể tạo duplicate ID), có vấn đề bảo mật (ID generation có quy luật).

## Giải pháp tạo dựa trên Algorithm (Stateless)

### UUID

UUID là viết tắt của Universally Unique Identifier. UUID gồm 32 ký tự hexadecimal (8-4-4-4-12).

JDK cung cấp sẵn method để tạo UUID, chỉ cần một dòng code.

```java
// Output example: cb4a9ede-fa5e-4585-b9bb-d60bce986eaa
UUID.randomUUID()
```

[RFC 4122](https://tools.ietf.org/html/rfc4122) định nghĩa UUID v1-v5, [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562.html) phát hành năm 2024 thêm v6, v7, v8. Ví dụ về UUID trong RFC 9562 như sau:

![](/images/github/javaguide/system-design/distributed-system/rfc-4122-uuid.png)

Chúng ta tập trung chú ý vào Version này — quy tắc tạo UUID của các version khác nhau là khác nhau.

8 loại Version khác nhau tương ứng với ý nghĩa (tham khảo [Wikipedia về UUID](https://zh.wikipedia.org/wiki/通用唯一识别码)):

- **Version 1 (Based on time and node ID)**: Tạo dựa trên timestamp (thường là thời gian hiện tại) và node ID (thường là MAC address của thiết bị). Khi chứa MAC address, có thể đảm bảo global uniqueness, nhưng cũng vì vậy tồn tại rủi ro privacy leak.
- **Version 2 (Based on identifier, time and node ID)**: Tương tự version 1, cũng dựa trên time và node ID, nhưng thêm local identifier (ví dụ user ID hoặc group ID).
- **Version 3 (MD5 hash based on namespace and name)**: Dùng MD5 hash algorithm, kết hợp namespace identifier (một UUID) và name string để tính toán. Cùng namespace và name luôn tạo ra cùng UUID (**deterministic generation**).
- **Version 4 (Based on random numbers)**: Gần như hoàn toàn dựa trên random number generation, thường dùng PRNG hoặc CSPRNG. Dù lý thuyết có khả năng collision nhưng xác suất collision về lý thuyết rất thấp (2^122 possibilities), có thể coi là unique trong ứng dụng thực tế.
- **Version 5 (SHA-1 hash based on namespace and name)**: Tương tự version 3 nhưng dùng SHA-1 hash algorithm.
- **Version 6 (Based on timestamp, counter and node ID)**: Cải tiến version 1, đặt timestamp ở Most Significant Bit (MSB), làm cho UUID có thể sort trực tiếp theo thời gian.
- **Version 7 (Based on Unix millisecond timestamp)**: **48-bit Unix millisecond timestamp + 74-bit random/monotonic field**. Timestamp ở Most Significant Bit, hỗ trợ sort theo thời gian. RFC 9562 **khuyến nghị dùng v7 thay thế v1/v6**. Optional 12-bit sub-millisecond timestamp + counter có thể đảm bảo monotonicity trong millisecond.
- **Version 8 (Experimental/Vendor customizable)**: **122 bits dành cho implementation customize**, chỉ yêu cầu version và variant bits cố định. Phù hợp cho scenario nhúng thêm thông tin hoặc có application constraints đặc biệt. **Uniqueness được đảm bảo bởi implementation, không thể giả định**.

Dưới đây là ví dụ UUID được tạo ra trong Version 1:

![Version 1 UUID example](/images/github/javaguide/system-design/distributed-system/version1-uuid.png)

UUID được tạo ra bằng method `randomUUID()` của `UUID` trong JDK mặc định là version 4.

```java
UUID uuid = UUID.randomUUID();
int version = uuid.version();// 4
```

Ngoài ra, Variant cũng có 4 giá trị khác nhau, mỗi giá trị tương ứng với ý nghĩa khác nhau. Ở đây sẽ không giới thiệu, có vẻ thường ngày cũng không cần chú ý.

Khi cần dùng, xem phần giới thiệu liên quan đến Variant của UUID trên Wikipedia là được.

Từ phần giới thiệu trên có thể thấy, UUID có thể đảm bảo uniqueness, vì quy tắc tạo ra bao gồm MAC address, timestamp, namespace, random hoặc pseudo-random number, sequence và các yếu tố khác. UUID được máy tính tạo ra dựa trên các quy tắc này chắc chắn không trùng lặp.

Mặc dù UUID có thể đạt global uniqueness, nhưng thông thường chúng ta ít khi dùng nó.

Ví dụ dùng UUID làm MySQL database primary key là rất không phù hợp:

- Database primary key nên ngắn càng tốt, còn UUID tiêu tốn storage space khá lớn (32 characters, 128 bit).
- UUID không có thứ tự. Trong InnoDB engine, tính unordered của database primary key sẽ nghiêm trọng ảnh hưởng đến hiệu năng database.

UUID v7 ([RFC 9562](https://www.rfc-editor.org/rfc/rfc9562)) là **giải pháp phi tập trung tốt nhất thay thế Snowflake** hiện tại:

**RFC 9562 official recommendation**: Implementation nên dùng UUID v7 thay thế UUID v1/v6 khi có thể.

| Đặc điểm                 | Snowflake                            | UUID v7                                                  |
| ------------------------ | ------------------------------------ | -------------------------------------------------------- |
| **Worker ID management** | Cần centralized allocation (ZK/etcd) | Không cần allocation, out-of-the-box                     |
| **Clock rollback risk**  | Cần xử lý thêm                       | Cho phép disorder trong millisecond, tự nhiên tránh được |
| **B+ tree friendly**     | Trend incrementing                   | Naturally ordered                                        |
| **Standardization**      | Implementation varies                | RFC standard, cross-language compatible                  |
| **Structure**            | 64-bit (custom)                      | 128-bit (48-bit timestamp + 74-bit random/monotonic)     |

**Applicable scenario**: Small/medium distributed system, scenario không cần Snowflake-level performance.

**UUID v8 (experimental use)**: Nếu cần nhúng thêm thông tin (như business identifier, cluster info) hoặc có special application constraints, có thể xem xét UUID v8. Nhưng cần chú ý: **v8 uniqueness được đảm bảo bởi implementation, không thể giả định compatibility với các implementation khác**.

⚠️ **Chú ý**: Một số database (MySQL 8.0.37 trở xuống, PostgreSQL 15 trở xuống) cần tạo UUID v7 qua function, native support vẫn đang được phổ biến.

Cuối cùng, chúng ta phân tích đơn giản **ưu nhược điểm của UUID** (có thể bị hỏi trong phỏng vấn!):

- **Ưu điểm**: Tốc độ tạo thường khá nhanh, đơn giản dễ dùng.
- **Nhược điểm**: Tiêu tốn storage space lớn (32 characters, 128 bit), không an toàn (algorithm tạo UUID dựa trên MAC address sẽ gây MAC address leak), unordered (non-incremental), không có ý nghĩa nghiệp vụ cụ thể, cần giải quyết vấn đề duplicate ID (khi machine time không đúng có thể tạo duplicate ID).

### Snowflake Algorithm (Thuật toán Snowflake)

Snowflake là distributed ID generation algorithm mã nguồn mở của Twitter. Snowflake bao gồm số nhị phân 64 bit, 64 bit này được chia thành nhiều phần, mỗi phần lưu data có ý nghĩa cụ thể:

![Snowflake composition](/images/github/javaguide/system-design/distributed-system/snowflake-distributed-id-schematic-diagram.png)

- **sign (1 bit)**: Sign bit (identify positive/negative), luôn là 0, đại diện cho ID được tạo là số dương.
- **timestamp (41 bits)**: Tổng cộng 41 bit, dùng để biểu thị **relative timestamp** (milliseconds từ custom base point), có thể hỗ trợ 2^41 milliseconds (khoảng 69 năm). Base point thường được đặt là thời điểm system launch (như 2020-01-01), chứ không phải Unix epoch.
- **datacenter id + worker id (10 bits)**: Thông thường, 5 bit trước là datacenter ID, 5 bit sau là machine ID (có thể điều chỉnh theo tình hình thực tế). Như vậy có thể phân biệt các node của cluster/datacenter khác nhau.
- **sequence (12 bits)**: Tổng cộng 12 bit, dùng để biểu thị sequence number. Sequence number là auto-increment value, đại diện cho số ID max mà single machine có thể tạo ra trong một millisecond (2^12 = 4096), tức là single machine mỗi millisecond có thể tạo tối đa 4096 unique ID.

> **⚠️ High concurrency warning**: Nếu concurrent request trong một millisecond vượt quá 4096, algorithm sẽ **block và chờ đến millisecond tiếp theo**. Điều này có thể gây response latency spike trong high concurrency moments (như flash sale, big promotions). Production environment cần evaluate peak QPS, nếu cần có thể dùng multi-instance sharding hoặc cải tiến algorithm tăng thêm sequence bits.

Trong project thực tế, chúng ta thường cũng sẽ cải tiến Snowflake algorithm. Phổ biến nhất là thêm business type info vào ID được tạo bởi Snowflake.

#### Vấn đề Clock Rollback của Snowflake và Giải pháp

**Root cause**: NTP sync, manual time adjustment, hardware clock drift có thể dẫn đến system time đi ngược.

**So sánh giải pháp**:

| Giải pháp            | Ưu điểm               | Nhược điểm                                        | Applicable scenario                |
| -------------------- | --------------------- | ------------------------------------------------- | ---------------------------------- |
| **Từ chối service**  | Triển khai đơn giản   | Hoàn toàn không khả dụng trong khi clock rollback | Scenario yêu cầu availability thấp |
| **Chờ theo kịp**     | Đảm bảo ID uniqueness | Có thể block lâu                                  | Internal network với clock ổn định |
| **Backup Worker ID** | High availability     | Triển khai phức tạp, cần cân nhắc ZK split-brain  | Khuyến nghị cho production         |

**Khuyến nghị**: Production environment dùng Meituan Leaf hoặc IdGenerator — chúng đã built-in clock rollback handling.

#### Khó khăn phân bổ Snowflake Worker ID

Trong môi trường **containerized deployment (Kubernetes)**, phân bổ Worker ID của Snowflake là điểm đau lớn nhất:

**Problem scenario**:

- IP và tên của Pod là dynamic, thay đổi sau khi restart.
- Không thể pre-configure fixed Worker ID như physical machine.
- Khi auto scale-in/out cần dynamic apply và release Worker ID.

**Mainstream solutions**:

| Giải pháp                  | Implementation                                                                    | Ưu điểm                           | Nhược điểm                        |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------------- | --------------------------------- |
| **ZooKeeper registration** | Tạo temporary node trong ZK khi service start, node sequence number làm Worker ID | Auto reclaim, release sau crash   | Phụ thuộc ZK, tăng ops complexity |
| **Redis registration**     | Dùng `SETNX` + expiry để triển khai Worker ID application                         | Lightweight, không component thêm | Cần xử lý Redis crash scenario    |
| **Database allocation**    | Allocate từ database khi start và persist to local file                           | Đơn giản đáng tin cậy             | Phụ thuộc database                |
| **Dynamic Worker ID**      | Generate bằng Pod IP hoặc UID hash                                                | Không cần centralized component   | Có thể có hash collision          |

**Khuyến nghị**: Production environment dùng Meituan Leaf (ZooKeeper-based) hoặc Didi Tinyid (database-based) — chúng đã built-in Worker ID auto management.

Chúng ta xem tiếp ưu nhược điểm của Snowflake algorithm:

- **Ưu điểm**: Tốc độ tạo khá nhanh, ID được tạo có thứ tự tăng dần, linh hoạt (có thể đơn giản cải tiến Snowflake algorithm như thêm business ID).
- **Nhược điểm**: **Clock rollback risk** (cần xử lý thêm, xem solutions ở trên), phụ thuộc machine ID không thân thiện với distributed environment (khi cần auto start/stop hoặc scale, fixed machine ID có thể không đủ linh hoạt).

Nếu muốn dùng Snowflake algorithm, thường không cần tự implement. Có nhiều open source implementation dựa trên Snowflake algorithm như Meituan's Leaf, Baidu's UidGenerator (sẽ đề cập sau). Và những open source implementation này đã tối ưu Snowflake algorithm gốc, hiệu năng tốt hơn, đồng thời giải quyết vấn đề clock rollback và vấn đề phụ thuộc machine ID.

Ngoài ra, Seata còn đề xuất "Improved Snowflake Algorithm", thực hiện một số cải tiến và tối ưu so với Snowflake algorithm gốc, giải quyết vấn đề clock rollback, tăng đáng kể QPS. Giới thiệu cụ thể và nguyên lý cải tiến có thể tham khảo hai bài sau:

- [Analysis of Seata's Distributed UUID Generator based on Improved Snowflake Algorithm](https://seata.io/zh-cn/blog/seata-analysis-UUID-generator.html)
- [Thấy một improved snowflake algorithm trong open source project, giờ nó là của bạn rồi.](https://www.cnblogs.com/thisiswhy/p/17611163.html)

## So sánh Open Source Frameworks Distributed ID cấp Industrial

### UidGenerator (Baidu)

[UidGenerator](https://github.com/baidu/uid-generator) là unique ID generator mã nguồn mở của Baidu dựa trên Snowflake algorithm.

Tuy nhiên, UidGenerator đã cải tiến Snowflake algorithm. Cấu thành unique ID được tạo ra như sau:

![UidGenerator generated ID composition](/images/github/javaguide/system-design/distributed-system/uidgenerator-distributed-id-schematic-diagram.png)

- **sign (1 bit)**: Sign bit (identify positive/negative), luôn là 0, đại diện cho ID được tạo là số dương.
- **delta seconds (28 bits)**: Thời gian hiện tại, increment value relative to base time "2016-05-20", unit: seconds, có thể hỗ trợ khoảng 8.7 năm.
- **worker id (22 bits)**: Machine ID, có thể hỗ trợ khoảng 4.2 million machine starts. Built-in implementation là được database allocate khi startup, default allocation strategy là discard after use, sau này có thể cung cấp reuse strategy.
- **sequence (13 bits)**: Concurrent sequence dưới mỗi giây, 13 bits có thể hỗ trợ 8192 concurrency mỗi giây.

Có thể thấy, cấu thành unique ID khác với Snowflake algorithm gốc. Và, các parameter trên đều có thể customize.

Giới thiệu trong UidGenerator official documentation:

![](/images/github/javaguide/system-design/distributed-system/uidgenerator-introduction-official-documents.png)

Từ sau năm 2018, UidGenerator cơ bản không được duy trì nữa, ở đây cũng không giới thiệu thêm. Bạn muốn tìm hiểu thêm có thể xem [Official introduction of UidGenerator](https://github.com/baidu/uid-generator/blob/master/README.zh_cn.md).

### Leaf (Meituan)

[Leaf](https://github.com/Meituan-Dianping/Leaf) là distributed ID solution mã nguồn mở của Meituan. Tên project này, Leaf (lá cây), xuất phát từ câu nói của triết gia và nhà toán học người Đức Leibniz: "There are no two identical leaves in the world" (Trên thế giới không có hai chiếc lá giống nhau). Cái tên này thật sự khá hay, có vị nghệ thuật!

Leaf cung cấp hai mode là **Segment Mode** và **Snowflake** để tạo distributed ID. Ngoài ra, nó hỗ trợ dual segment, và giải quyết vấn đề clock rollback trong Snowflake ID system. Tuy nhiên, giải quyết vấn đề clock cần weak dependency vào Zookeeper (dùng Zookeeper làm registry, quản lý workId thông qua reading và creating child nodes ở specific path).

Leaf ra đời chủ yếu để giải quyết vấn đề các business line khác nhau ở Meituan tạo distributed ID theo nhiều cách và không đáng tin cậy.

Leaf thực hiện core optimization so với segment mode gốc — **Dual Buffer Mechanism (Double Buffer Optimization)**:

> **Design principle**: Leaf không chờ đến khi segment hết mới đến DB apply, mà khi current segment usage đạt một ngưỡng nhất định (như 10%~20%), async thread sẽ **sớm** đến DB apply segment tiếp theo và preload vào memory. Điều này làm cho TP999 của ID fetching cực kỳ ổn định, hoàn toàn loại bỏ latency jitter do DB access.

(Hình ảnh từ Meituan official article: [《Leaf——Meituan Dianping Distributed ID Generation System》](https://tech.meituan.com/2017/04/21/mt-leaf.html))

![](/images/github/javaguide/distributed-system/distributed-id/leaf-principle.png)

Theo giới thiệu trong project README, trên 4C8G VM, thông qua company RPC call, QPS stress test result gần 5w/s, TP999 1ms.

### Tinyid (Didi)

[Tinyid](https://github.com/didi/tinyid) là unique ID generator mã nguồn mở của Didi dựa trên database segment mode.

Nguyên lý của database segment mode đã được giới thiệu ở trên. **Tinyid có những điểm nổi bật nào?**

Để hiểu rõ vấn đề này, trước tiên hãy xem architecture solution đơn giản dựa trên database segment mode. (Hình ảnh từ Tinyid official wiki: [《Tinyid Principle Introduction》](https://github.com/didi/tinyid/wiki/tinyid%E5%8E%9F%E7%90%86%E4%BB%8B%E7%BB%8D))

![](/images/github/javaguide/distributed-system/distributed-id/tinyid-principle.png)

Trong architecture mode này, chúng ta yêu cầu unique ID từ ID issuing service qua HTTP request. Load balancing router sẽ gửi request của chúng ta đến một trong số các tinyid-server.

Solution này có những vấn đề gì? Theo tôi (Tinyid official wiki cũng đề cập), chủ yếu có 2 vấn đề sau:

- Khi lấy segment mới, tốc độ program lấy unique ID khá chậm.
- Cần đảm bảo DB high availability, điều này khá phức tạp và tốn resource.

Ngoài ra, HTTP call cũng có network overhead.

Nguyên lý của Tinyid tương đối đơn giản, architecture của nó như hình dưới:

![](/images/github/javaguide/distributed-system/distributed-id/tinyid-architecture-design.png)

So với architecture solution đơn giản dựa trên database segment mode, Tinyid solution chủ yếu thực hiện các tối ưu sau:

- **Dual segment cache**: Để tránh trường hợp lấy segment mới khiến tốc độ program lấy unique ID chậm. Segment trong Tinyid khi dùng đến một mức nhất định sẽ async load segment tiếp theo, đảm bảo memory luôn có segment khả dụng.
- **Thêm multi-db support**: Hỗ trợ nhiều DB, và mỗi DB đều có thể tạo unique ID, cải thiện availability.
- **Thêm tinyid-client**: Pure local operation, không có HTTP request overhead, hiệu năng và availability đều cải thiện rất lớn.

Ưu nhược điểm của Tinyid sẽ không phân tích ở đây, kết hợp ưu nhược điểm của database segment mode và nguyên lý của Tinyid là biết.

### IdGenerator (Individual)

Giống như UidGenerator và Leaf, [IdGenerator](https://github.com/yitter/IdGenerator) cũng là unique ID generator dựa trên Snowflake algorithm.

IdGenerator có các đặc điểm sau:

- Unique ID được tạo ra ngắn hơn;
- Tương thích với tất cả Snowflake algorithm (segment mode hoặc classic mode, big company hoặc small company);
- Native hỗ trợ C#/Java/Go/C/Rust/Python/Node.js/PHP(C extension)/SQL và các ngôn ngữ khác, cung cấp multi-thread safe call dynamic library (FFI);
- Giải quyết vấn đề clock rollback, hỗ trợ manual insert new ID (khi business cần tạo new ID trong historical time, dùng reserved bits của algorithm này có thể tạo 5000 mỗi giây);
- Không phụ thuộc external storage system;
- Với default config, ID có thể dùng 71000 năm không trùng lặp.

Cấu thành unique ID được tạo bởi IdGenerator:

![IdGenerator generated ID composition](/images/github/javaguide/system-design/distributed-system/idgenerator-distributed-id-schematic-diagram.png)

- **timestamp (variable bits)**: Time difference, là total time difference (millisecond unit) giữa system time khi tạo ID và BaseTime (base time, còn gọi là base point time, origin time, epoch time, default là năm 2020). Ban đầu là 5 bits, tăng dần theo thời gian chạy. Nếu thấy default value quá cũ, có thể reset, nhưng lưu ý giá trị này sau này tốt nhất không thay đổi.
- **worker id (default 6 bits)**: Machine ID, là parameter quan trọng nhất, là unique ID phân biệt các machine hoặc application khác nhau, max value bị giới hạn bởi `WorkerIdBitLength` (default 6). Nếu một server deploy nhiều independent service, cần chỉ định WorkerId khác nhau cho từng service.
- **sequence (default 6 bits)**: Sequence number, là sequence number dưới mỗi millisecond, bị giới hạn bởi `SeqBitLength` trong parameter (default 6). Tăng `SeqBitLength` sẽ làm hiệu năng cao hơn nhưng ID được tạo cũng dài hơn.

Java language usage example: <https://github.com/yitter/idgenerator/tree/master/Java>.

## Tổng kết

Qua bài viết này, tôi đã tổng hợp về cơ bản tất cả các giải pháp tạo distributed ID phổ biến nhất.

Ngoài các cách được giới thiệu ở trên, middleware như ZooKeeper cũng có thể giúp chúng ta tạo unique ID. **Không có silver bullet, nhất định phải kết hợp với project thực tế để chọn giải pháp phù hợp nhất cho mình.**

**Bảng so sánh ngang các giải pháp cốt lõi:**

| **Solution**                | **Performance** | **Ordering**        | **Ops Cost** | **Applicable Scenario**                                           |
| --------------------------- | --------------- | ------------------- | ------------ | ----------------------------------------------------------------- |
| **Database auto-increment** | Thấp            | Strictly increasing | Thấp         | Business volume nhỏ, monolithic, admin systems                    |
| **Segment mode**            | Cao             | Trend increasing    | Trung        | High concurrency, Internet business tối đa throughput             |
| **Redis solution**          | Rất cao         | Strictly increasing | Trung        | Đã có Redis cluster, tolerable tiny probability ID rollback       |
| **Snowflake**               | Cao             | Trend increasing    | Thấp/Trung   | Large/medium distributed system, Java ecosystem (most mainstream) |
| **UUID v7**                 | Cao             | Trend increasing    | Rất thấp     | Cloud-native, decentralized cluster, out-of-the-box               |

Tuy nhiên, bài này chủ yếu giới thiệu kiến thức lý thuyết về distributed ID. Trong phỏng vấn thực tế, interviewer có thể kết hợp specific business scenario để kiểm tra thiết kế distributed ID của bạn. Bạn có thể tham khảo bài viết này: [Distributed ID Design Guide](./distributed-id-design) (cũng rất hữu ích cho thiết kế distributed ID trong công việc thực tế).

<!-- @include: @article-footer.snippet.md -->
