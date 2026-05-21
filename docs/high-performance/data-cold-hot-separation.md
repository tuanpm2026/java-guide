---
title: Giải thích chi tiết Data Cold-Hot Separation
description: Bài viết giải thích chi tiết nguyên lý cốt lõi và giải pháp thực hành của data cold-hot separation, bao gồm chiến lược phân định cold-hot data, thiết kế multi-level tiering, đảm bảo data consistency trong quá trình migration, tối ưu cold data query, storage selection (HBase/TiDB/object storage), và các case điển hình cho order/log/content systems.
category: High Performance
head:
  - - meta
    - name: keywords
      content: data cold-hot separation,cold data migration,cold data storage,tiered storage,TiDB cold-hot separation,HBase,data archiving,storage cost optimization,data consistency
---

<!-- @include: @small-advertisement.snippet.md -->

## Data Cold-Hot Separation là gì?

Data cold-hot separation là chiến lược architecture phân chia dữ liệu thành cold data và hot data dựa trên **tần suất truy cập** và **tầm quan trọng nghiệp vụ**, rồi lưu trữ ở các storage media khác nhau về performance và cost.

Core objectives của architecture này có ba:

1. **Cải thiện query performance**: Hot data được lưu trên high-performance media (như SSD, memory), đảm bảo tốc độ response của core business.
2. **Giảm storage cost**: Cold data được migrate sang low-cost media (như HDD, object storage), cắt giảm đáng kể chi phí lưu trữ.
3. **Đáp ứng compliance requirements**: Một số ngành (như finance, healthcare) yêu cầu data phải được archive lâu dài. Cold-hot separation có thể cân bằng cả compliance và cost.

### Cold Data và Hot Data

**Hot data** là dữ liệu được truy cập và sửa đổi thường xuyên và cần response nhanh. **Cold data** là dữ liệu có tần suất truy cập cực thấp, giá trị với business hiện tại nhỏ, nhưng cần được lưu giữ lâu dài.

Có hai phương pháp chính để phân biệt cold và hot data:

1. **Time dimension**: Phân chia theo creation time, update time hoặc expiration time của dữ liệu. Ví dụ order system đánh dấu order data từ trước đây một khoảng thời gian (như 90 ngày hoặc 1 năm) là cold data. Phương pháp này phù hợp với scenario **data access frequency tương quan mạnh với time**, implementation đơn giản và cost thấp.
2. **Access frequency**: Coi data được truy cập thường xuyên là hot data, data truy cập ít là cold data. Ví dụ content system đánh dấu articles có **view count dưới threshold** là cold data. Phương pháp này cần record thêm access frequency, phù hợp với scenario **access frequency tương quan mạnh với data characteristics**.

**Làm thế nào để chọn phương pháp phân biệt?**

- Nếu business data tự nhiên có tính thời sự (như orders, logs, bills), ưu tiên **time dimension** — implementation cost thấp nhất.
- Nếu giá trị data không liên quan đến time (như articles, products, user profiles), cần kết hợp **access frequency** để xác định.
- Trong project thực tế, có thể kết hợp cả hai: lấy time dimension làm chính, access frequency làm phụ, bao phủ nhiều business scenarios hơn.

### Multi-level Tiering Strategy của Cold-Hot Separation

Khi thực hiện thực tế, "cold" và "hot" thường không phải lựa chọn nhị phân, mà là **progressive multi-level tiering**:

| Level            | Data Characteristics                      | Example Rule                         | Storage Strategy                      |
| ---------------- | ----------------------------------------- | ------------------------------------ | ------------------------------------- |
| **Hot data**     | High-frequency access, real-time response | Last 30 days + all incomplete orders | MySQL hot DB (SSD)                    |
| **Warm data**    | Medium-frequency access, may need query   | Orders from 30~90 days ago           | MySQL warm DB (HDD)                   |
| **Cold data**    | Low-frequency access, occasional query    | Historical orders 90 days~3 years    | Independent cold DB or object storage |
| **Archive data** | Extremely rare access, compliance only    | Orders over 3 years                  | Object storage (summary only)         |

**Practice recommendation**: Rules should be dynamically managed through **config center** to avoid frequent code changes due to business changes.

### Cold Data Được Truy Cập Thì Xử Lý Như Thế Nào?

Nếu cold data đột nhiên được truy cập (ví dụ user query order từ 3 năm trước), có cần "promote to hot" không?

| Strategy                 | Applicable Scenario                            | Pros                                    | Cons                                                |
| ------------------------ | ---------------------------------------------- | --------------------------------------- | --------------------------------------------------- |
| **No migration back**    | Occasional query, very low frequency           | Simple implementation                   | Slow query                                          |
| **Cache layer**          | Medium-frequency query                         | Speed up query without changing storage | Needs extra cache component                         |
| **Async migration back** | High-frequency query, continuous access needed | Solves performance issue completely     | Complex implementation, possible consistency issues |

**Recommended approach**: In most scenarios use "**no migration back + cache layer**" combination. When querying cold data, check cache first; if hit, return directly; if miss, query cold DB and write result to cache (for occasional queries, set short TTL of 5~15 minutes is enough).

**⚠️Note**: To prevent malicious attackers from repeatedly querying non-existent data with random parameters causing cold DB penetration, can put **Bloom Filter** before cache layer or set **null value placeholders** in cache to prevent malicious requests from penetrating to cold DB. For details see [Redis Common Interview Questions Summary (Part 2)](https://javaguide.cn/database/redis/redis-questions-02.html).

### Tư tưởng của Cold-Hot Separation

Core idea của cold-hot separation là **Tiered Storage** — phân bổ data đến các storage media ở các tầng khác nhau dựa trên access characteristics. Trong enterprise storage architecture, thường phân thành các tầng sau:

| Level       | Data Characteristics       | Typical Storage               | Access Latency           |
| ----------- | -------------------------- | ----------------------------- | ------------------------ |
| **Hot**     | High-frequency, real-time  | NVMe SSD, memory              | Millisecond              |
| **Warm**    | Medium-frequency, recent   | SATA SSD, high-speed HDD      | Hundreds of milliseconds |
| **Cold**    | Low-frequency, historical  | Large HDD, object storage     | Second level             |
| **Archive** | Extremely rare, compliance | Tape library, glacier storage | Minutes~hours            |

This tiered thinking is widely used in IT infrastructure, not just databases, but also file systems, object storage, CDN cache and other scenarios.

### Ưu Nhược Điểm của Cold-Hot Separation

**Ưu điểm:**

- **Tối ưu hot data query performance**: Hot data tập trung trên high-performance storage, data volume giảm đáng kể, index efficiency tăng rõ rệt. Hầu hết operations của user sẽ có trải nghiệm tốt hơn.
- **Giảm đáng kể storage cost**: Cold data có thể migrate sang HDD hoặc object storage. **Chi phí đơn vị của SSD so với HDD chênh lệch 5~10 lần**. Với massive data scenarios, tiết kiệm rất đáng kể.
- **Tăng cường maintainability**: Hot DB data volume có thể kiểm soát, backup và recovery nhanh hơn, DDL operations (như add index) tốn ít thời gian hơn.

**Nhược điểm:**

- **Tăng system complexity**: Cần thêm migration components, routing logic và monitoring systems. Rủi ro data consistency tăng lên.
- **Cross-DB query efficiency thấp**: Nếu business cần query cả cold và hot data cùng lúc (như annual statistics reports), cần cross-DB joins hoặc data aggregation. Query performance và development cost đều tăng.
- **Chi phí maintain migration strategy**: Rules phân định cold-hot data cần continuous tuning để tránh false positives dẫn đến hot data bị migrate sai.

## Cold Data Migration

### Cold Data Migrate Như Thế Nào?

Cold data migration là core process của cold-hot separation. Có ba mainstream solutions:

| Solution                      | Implementation                                              | Pros                         | Cons                                                                 | Applicable Scenarios                         |
| ----------------------------- | ----------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------- | -------------------------------------------- |
| **Business layer code**       | Check cold/hot on write, route directly                     | High real-time               | Invasive to business code, complex logic                             | Almost never used                            |
| **Task scheduling migration** | Scheduled task scans hot DB, batch migrates qualifying data | Simple implementation        | Migration delay, full table scan may pollute Buffer Pool             | Time dimension scenarios                     |
| **Binlog listener migration** | Monitor DB change logs, migrate real-time or near real-time | Good real-time, non-invasive | Needs extra components (like Canal), not suitable for time dimension | **Access frequency scenarios (Recommended)** |

**Task scheduling migration** is the most common solution, achievable with distributed scheduling platforms like XXL-Job, Elastic-Job. I also have a detailed article on scheduling solutions: [Java Scheduled Tasks Detailed](https://javaguide.cn/system-design/schedule-task.html).

> ⚠️ **Risk warning**: Task scheduling migration has performance hidden risks with large data volumes. Large-scale full table scans (like `SELECT * FROM orders WHERE create_time < 'xxx' LIMIT 10000`) will seriously pollute InnoDB Buffer Pool, pushing real business hot data out of memory. **Production recommendations**:
>
> - Use **primary key range queries** to avoid full table scans;
> - Control **single migration batch size**, execute in batches;
> - Execute migration tasks during **business off-peak hours**;
> - For massive data, prioritize **Binlog listener** solution to minimize impact on hot DB.

Typical flow:

![Cold-Hot Separation - Cold Data Migration](https://oss.javaguide.cn/github/javaguide/high-performance/data-cold-hot-separation.png)

**Practice recommendation**: If company has DBA support, first do a **manual migration of existing cold data** to bulk import historical data to cold DB; then use task scheduling to automate **incremental migration**.

### Làm Thế Nào Để Đảm Bảo Data Consistency Trong Quá Trình Migration?

During data migration, the most difficult problem is: **If data is updated during migration, how to handle it?**

#### Common Solutions

| Solution                         | Implementation                                          | Pros                         | Cons                                                  |
| -------------------------------- | ------------------------------------------------------- | ---------------------------- | ----------------------------------------------------- |
| **Lock before migration**        | Add write lock before migration, release after          | Strong consistency           | Affects business writes, throughput decreases         |
| **Optimistic lock with version** | Record version during migration, verify before delete   | Lock-free, good performance  | Business table needs version field, retry on conflict |
| **Status marking + idempotent**  | Add migration status field to hot DB, mark then migrate | Traceable, supports rollback | Needs business table modification                     |

> **Note**: Cold and hot DBs are usually **different database instances**. `INSERT` (cold DB) and `DELETE` (hot DB) cannot be in the same local transaction. Cross-DB atomicity needs special handling.

#### Recommended: Status Marking + Idempotent Migration

Add `migrate_status` field to hot DB table, use state machine to ensure atomicity and traceability:

```sql
-- 1. Add migration status field to hot DB table
ALTER TABLE orders ADD COLUMN migrate_status TINYINT DEFAULT 0
    COMMENT '0-not migrated 1-migrating 2-migrated';
```

```java
// 2. Migration process (pseudocode, independent cold DB scenario needs step-by-step execution at app layer)

// Step 1: Mark as migrating (hot DB transaction)
hotDb.execute("UPDATE orders SET migrate_status = 1 WHERE id = ? AND migrate_status = 0", id);

// Step 2: Read hot DB data and write to cold DB (need to switch DB connection)
Order order = hotDb.query("SELECT * FROM orders WHERE id = ?", id);
coldDb.execute("INSERT IGNORE INTO orders_cold VALUES (?, ?, ...)", order.id, order.data...);

// Step 3: Mark as migrated (hot DB transaction)
hotDb.execute("UPDATE orders SET migrate_status = 2 WHERE id = ? AND migrate_status = 1", id);

// Step 4: Delayed deletion of hot DB data (optional, execute after confirming cold DB data is correct)
hotDb.execute("DELETE FROM orders WHERE id = ? AND migrate_status = 2", id);
```

> **Note**: In independent cold DB scenario, standard MySQL cannot directly execute cross-DB `INSERT ... SELECT`. Must split into two steps at app layer: "read from hot DB → write to cold DB".

**Solution advantages**:

- **Idempotency**: `INSERT IGNORE` ensures cold DB write idempotency; `migrate_status` state transition ensures hot DB update idempotency.
- **Traceable**: Can query migration progress via status field, can manually intervene on anomalies.
- **Rollback**: Can reset status to 0 on migration failure and re-migrate.
- **Progressive deletion**: Don't immediately delete hot DB data; clean up after confirming cold DB is correct, reducing risk.

> **Space reclaim**: After InnoDB executes `DELETE`, pages are only marked as deleted; physical space is not immediately released to OS. Need to execute `OPTIMIZE TABLE` or `ALTER TABLE ENGINE=InnoDB` during **business off-peak hours** to truly reclaim disk space.

**Fallback mechanism**:

- **Periodic reconciliation**: Regularly scan records with `migrate_status = 1` exceeding threshold, auto-reset or alert. **Note**: `migrate_status` has extremely low cardinality. Must use composite index (like `idx_create_time_migrate_status`) to limit scan range; otherwise full table scan.
- **High-frequency update fallback**: For records skipped multiple times due to frequent updates, set max retry count. Force migration or manual intervention if exceeded.

## Cold Data Lưu Trữ Như Thế Nào?

Selection principle for cold data storage: **Large capacity, low cost, high reliability; access speed can be sacrificed somewhat**.

### Small/Medium Company Solutions

Use **MySQL/PostgreSQL** directly, keeping same DB type as hot DB to reduce ops complexity. Specific implementation:

- **Same DB separate table**: Add cold data table (like `order_history`) in same database, distinguish cold/hot data by table name.
- **Independent cold DB**: Deploy separate DB instance as cold DB. Hot and cold DB accessed via app-layer routing.

**⚠️Note**: Independent cold DB solution involves **cross-DB queries**. If business needs cold-hot data join queries, need to evaluate whether to introduce data sync or aggregation layer.

### Large Company Solutions

Large companies typically use storage engines specifically optimized for massive data:

| Storage Solution            | Characteristics                                                | Applicable Scenarios                                           |
| --------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| **HBase**                   | Column-family storage, high throughput, supports PB-scale data | Log, user behavior, IoT data archiving                         |
| **RocksDB**                 | High-performance KV storage, LSM-Tree structure                | Embedded scenarios, underlying storage for other systems       |
| **Doris/ClickHouse**        | OLAP engine, supports real-time analysis                       | Scenarios needing aggregation analysis on cold data            |
| **Cassandra**               | Distributed, high availability, no single point failure        | Cross-region deployment, high-availability archiving scenarios |
| **Object Storage (OSS/S3)** | Extremely low cost, unlimited scaling                          | Massive scale cold data, compliance archiving                  |

### TiDB Solution (Recommended)

If company tech stack allows, use **TiDB** distributed relational database which natively supports cold-hot separation — one-stop solution.

TiDB 6.0 introduced **Placement Rules in SQL** feature for configuring data placement positions in TiKV cluster via SQL interface.

- **Hot data**: Specify storage on **SSD nodes** via Placement Rules for query performance.
- **Cold data**: Specify storage on **HDD nodes** to reduce storage cost.

```sql
-- Create placement policy: hot data on SSD nodes
CREATE PLACEMENT POLICY hot_data
  CONSTRAINTS="[+disk=ssd]";

-- Create placement policy: cold data on HDD nodes
CREATE PLACEMENT POLICY cold_data
  CONSTRAINTS="[+disk=hdd]";

-- Apply placement policy to table or partition
ALTER TABLE orders PLACEMENT POLICY = hot_data;
ALTER TABLE orders PARTITION p2022 PLACEMENT POLICY = cold_data;
```

Advantage of this solution: **Business doesn't need to be aware of cold-hot separation logic**, data routing is done automatically by TiDB, significantly reducing app-layer complexity.

> **Complete practice**: `Placement Rules` specifies which storage medium to use, but how data flows from "hot partition" to "cold partition" still needs **partitioned tables (Range Partitioning)**. Create partitions by time span, bind HDD placement policy to historical partitions, bind SSD to current active partitions. As time passes, just maintain partition creation and deletion; underlying data flows naturally between different media.

## Cold Data Query

Cold data has low access frequency, but when needed (like audit, reconciliation, annual reports), how to ensure query efficiency?

### Cold Data Query Requirements Analysis

First clarify: **Does business really need to query cold data?**

- **No**: Cold data can be completely moved out of business DB, only kept as archive (like object storage), extracted manually when needed.
- **Yes**: Need to design reasonable query solution balancing performance and cost.

### Cold Data Query Optimization Solutions

| Optimization                         | Implementation                                                                                    | Applicable Scenarios                |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Cold DB independent read replica** | Deploy cold DB read replicas, prevent cold queries from affecting hot DB                          | High-frequency cold query scenarios |
| **Query routing**                    | App layer automatically routes to hot or cold DB based on time range                              | Cross cold-hot query scenarios      |
| **Pre-aggregation**                  | Periodically generate monthly/quarterly reports from cold data, query aggregated results directly | Statistical analysis scenarios      |
| **Columnar storage**                 | Cold DB uses OLAP engines like ClickHouse, Doris                                                  | Large-scale analytical queries      |

**Handling cross cold-hot queries**:

If query range involves both cold and hot data (like "query orders in last 2 years"), two approaches:

1. **Split queries**: Query hot DB and cold DB separately, merge results at app layer.
2. **Restrict range**: Prompt user to narrow query range to avoid cross-DB queries.

> **Avalanche warning**: If business includes **global pagination sorting** (like `ORDER BY create_time LIMIT 10000, 20`), app layer must pull `10000 + 20` records from both hot and cold DBs for in-memory merge. Large offsets are extremely prone to **OOM**. **Mandatory requirements**:
>
> - Restrict query time range, avoid large-span cross-DB queries;
> - Or route to a wide table synced at bottom layer (like ClickHouse) for computation;
> - Strictly prohibit deep pagination merge at app layer.

### App Layer Cold-Hot Routing

| Solution          | Implementation                                            | Pros                                  | Cons                                                     |
| ----------------- | --------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------- |
| **Hardcoded**     | Determine routing directly in code                        | Simple implementation                 | High maintenance cost, need code change for rule changes |
| **Config center** | Store routing rules in config center (like Nacos, Apollo) | Dynamic adjustment, no restart needed | Extra components needed                                  |
| **Proxy layer**   | Introduce middleware like ShardingSphere, ProxySQL        | Business-transparent                  | High architecture complexity                             |

**Recommended**: Small-medium scale use **config center** solution; large scale use **proxy layer** solution.

> ⚠️ **Risk warning**: After introducing proxy layer, all cross cold-hot DB aggregation computations (like global sorting, `GROUP BY` merge pagination) are on proxy node's memory and CPU. Must strictly limit max return rows for such operations; otherwise extremely easy to cause proxy node **OOM**.

## Cold-Hot Separation vs Data Archiving vs Partitioned Tables

These three concepts are easily confused:

| Comparison                    | Cold-Hot Separation                       | Data Archiving                           | Partitioned Tables                                 |
| ----------------------------- | ----------------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| **Data accessible**           | Cold data still in business access path   | Archived data usually out of business DB | All partitions accessible                          |
| **Storage media**             | Cold-hot data can span instances, storage | Usually migrate to low-cost storage      | Same instance                                      |
| **Implementation complexity** | Medium                                    | Low                                      | Low                                                |
| **Typical scenarios**         | Orders, logs with time-based data         | Compliance retention, data backup        | Single table large data without storage separation |

**Limitation of partitioned tables**: MySQL partitioned tables can partition by time, but all partitions are still in the same instance and **cannot achieve storage media separation**. If goal is to reduce storage cost, partitioned tables cannot replace cold-hot separation.

## Typical Business Scenarios

> **Note**: Following storage strategies are for reference only. Actual selection needs comprehensive consideration of data volume, query requirements, team tech stack and cost budget.

### Order System

| Phase        | Data Range                       | Storage Strategy                             | Notes                                           |
| ------------ | -------------------------------- | -------------------------------------------- | ----------------------------------------------- |
| Hot data     | Last 90 days + incomplete orders | MySQL hot DB (SSD)                           | High-frequency access, ensure query performance |
| Cold data    | 90 days~3 years                  | MySQL cold DB (HDD) or TiDB                  | May need queries, keep relational storage       |
| Archive data | Over 3 years                     | Object storage / HBase / summary tables only | Rare queries, prioritize cost                   |

### Log System

| Phase     | Data Range  | Storage Strategy                                                             | Notes                                          |
| --------- | ----------- | ---------------------------------------------------------------------------- | ---------------------------------------------- |
| Hot data  | Last 7 days | Elasticsearch hot nodes                                                      | Real-time search, high-frequency query         |
| Warm data | 7~30 days   | Elasticsearch warm nodes                                                     | Occasional query, reduce storage cost          |
| Cold data | 30+ days    | Elasticsearch cold nodes / compressed archive to object storage / ClickHouse | Choose by query needs, ClickHouse for analysis |

### Content System

| Phase     | Data Range                                      | Storage Strategy                       | Notes                                                 |
| --------- | ----------------------------------------------- | -------------------------------------- | ----------------------------------------------------- |
| Hot data  | Within 3 months after publish + high readership | MySQL hot DB                           | Frequently accessed                                   |
| Cold data | After 3 months + low readership                 | MySQL cold DB / HBase / object storage | Low access frequency, can migrate to low-cost storage |

**Selection recommendations**:

- **Need transactions or complex queries**: Prefer MySQL cold DB or TiDB
- **Need large-scale aggregation analysis**: Prefer ClickHouse or Doris
- **Only occasional detail queries needed**: Object storage (like OSS/S3) is optional, load temporarily for queries
- **Massive data with very low access**: HBase or object storage is best value for money

## Case Studies

- [How to quickly optimize order table with tens of millions of data - Programmer Jidian - 2023](https://www.cnblogs.com/fulongyuanjushi/p/17910420.html)
- [Massive data cold-hot separation solution and practice - ByteDance Technical Team - 2022](https://mp.weixin.qq.com/s/ZKRkZP6rLHuTE1wvnqmAPQ)

<!-- @include: @article-footer.snippet.md -->
