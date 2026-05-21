---
title: Tổng hợp các kỹ thuật tối ưu SQL phổ biến
description: Bài viết tổng hợp có hệ thống các kỹ thuật tối ưu SQL phổ biến, bao gồm slow SQL location và analysis (EXPLAIN, Show Profile), index optimization strategies, query rewriting techniques, pagination optimization và các phương pháp thực chiến khác giúp nhanh chóng cải thiện database query performance.
category: High Performance
head:
  - - meta
    - name: keywords
      content: SQL optimization,slow SQL,EXPLAIN execution plan,index optimization,MySQL optimization,query optimization,pagination optimization,Show Profile
---

<!-- @include: @small-advertisement.snippet.md -->

## Tránh dùng SELECT \*

- `SELECT *` tiêu tốn nhiều CPU hơn.
- `SELECT *` các fields vô dụng làm tăng tiêu thụ network bandwidth, tăng data transmission time, đặc biệt với large fields (như varchar, blob, text).
- `SELECT *` không thể dùng MySQL optimizer's covering index optimization (covering index strategy của MySQL optimizer cũng là phương pháp tối ưu query cực nhanh, hiệu quả cao, được industry highly recommend).
- `SELECT <field list>` có thể giảm ảnh hưởng từ việc thay đổi table structure.

## Tránh multi-table JOIN

Alibaba 《Java Development Manual》 có đoạn mô tả như sau:

> 【Mandatory】Cấm JOIN quá 3 tables. Các fields cần JOIN, data types phải hoàn toàn nhất quán. Với multi-table join queries, đảm bảo các fields được join cần có indexes.

![Avoid multi-table JOIN](https://oss.javaguide.cn/github/javaguide/mysql/alibaba-java-development-handbook-multi-table-join.png)

JOIN efficiency thường thấp, nguyên nhân chính là vì nó dùng Nested Loop để implement join queries. Các implementations phổ biến trước đây đều không quá hiệu quả:

- **Simple Nested-Loop Join**: Implement join trực tiếp bằng Cartesian product, duyệt từng row/full table scan, hiệu quả thấp nhất.
- **Block Nested-Loop Join (BNL)**: Optimize bằng JOIN BUFFER. **Note: Trong MySQL 8.0.20 trở lên, BNL đã được thay thế bởi Hash Join**. Hash Join thường giảm độ phức tạp của non-indexed column joins từ O(M\*N) xuống gần O(M+N).
- **Index Nested-Loop Join**: Thêm indexes trên các fields cần thiết, performance được cải thiện hơn nữa.

Các practices phổ biến để tránh multi-table join trong business scenarios thực tế:

1. **Single table query rồi join trong memory**: Query single tables từ database, rồi query lần hai dựa trên kết quả, cứ vậy tiếp tục, cuối cùng join lại.
2. **Data redundancy**: Lưu một số dữ liệu quan trọng redundant trong tables, tránh join queries tối đa. Cách này khá thô, chỉ nên cân nhắc khi table structure tương đối stable. Trước khi thiết kế redundancy, suy nghĩ xem table structure design của mình có vấn đề không.

Phương pháp đầu được khuyến nghị hơn, được dùng nhiều hơn trong projects thực tế. Ngoài hiệu năng không tệ còn có các ưu điểm:

1. **Single table queries sau khi split có code reusability cao hơn**: JOIN SQL cơ bản không có khả năng được reuse.
2. **Single table queries dễ maintain hơn**: Dù sau này thay đổi table structure hay sharding, single table queries đều dễ maintain hơn.

Tuy nhiên, nếu system không yêu cầu concurrency lớn thì multi-table join cũng không vấn đề. Nhiều complex systems trong công ty yêu cầu concurrency không cao, nhiều data chỉ có thể query ra bằng cách join 5+ tables.

## Deep Pagination Optimization

Nguyên nhân gốc rễ của deep pagination: Khi `LIMIT` offset quá lớn, MySQL cần scan và skip nhiều records để lấy target data. Query optimizer có thể bỏ index và chọn full table scan. Lúc này dù có index cũng không tránh được nhiều back-to-table operations, khiến query performance giảm mạnh.

Bài này giới thiệu 4 giải pháp tối ưu deep pagination phổ biến:

| Solution           | Core Approach                                                                          | Applicable Scenarios                                      | Limitations                                                                           |
| ------------------ | -------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Range query**    | Record last record ID on previous page, get next page via `WHERE id > last_id LIMIT n` | Ordered by ID, allows cursor-style pagination             | No page jumping support; non-ID ordering needs composite cursor                       |
| **Subquery**       | Get starting primary key via subquery, filter by primary key                           | Need traditional OFFSET pagination support                | Subquery may create temp table, depends on sort field index                           |
| **Deferred join**  | Move pagination to primary key index via `INNER JOIN`, reduce back-to-table            | Large data pagination, needs traditional pagination logic | SQL is relatively complex                                                             |
| **Covering index** | Build composite index including query fields, avoid back-to-table                      | Fixed query fields, can build suitable index              | High index maintenance cost with many fields; large result set may do full table scan |

**Solution selection recommendations**:

- **Prefer deferred join**: For most scenarios needing traditional `LIMIT offset, size` pagination logic, deferred join has better performance and maintainability.
- **Consider range query (cursor pagination)**: If business allows "next page" cursor pagination (like social media feeds, infinite scroll), range query has best and most stable performance.
- **Covering index as supplement**: When query fields are fixed and few, build covering index in combination with other solutions for further optimization.

**Notes**:

- Regardless of solution, monitor actual execution plan (`EXPLAIN`) to ensure optimizer uses index as expected.
- For ultra-deep pagination (like million-level offsets), evaluate at business level whether it's really needed. Consider limiting max page count or using other retrieval methods (like search engines).

Detailed introduction: [Deep Pagination Introduction and Optimization Suggestions](https://javaguide.cn/high-performance/deep-pagination-optimization.html).

## Không nên dùng Foreign Keys và Cascades

Alibaba 《Java Development Manual》 có đoạn mô tả:

> Không được dùng foreign keys và cascades. Tất cả foreign key concepts phải giải quyết ở application layer.

![](https://oss.javaguide.cn/github/javaguide/mysql/alibaba-java-development-handbook-multi-table-join-foreign-keys-and-cascades.png)

Đã có rất nhiều bài phân tích về các vấn đề của foreign keys và cascades trên mạng. Cá nhân tôi không khuyến nghị dùng foreign keys chủ yếu vì không thân thiện với database sharding, còn ảnh hưởng performance thực ra tương đối nhỏ.

## Chọn kiểu dữ liệu phù hợp

Storage bytes càng nhỏ, space occupied càng nhỏ, performance càng tốt.

**a. Một số strings có thể convert sang number types để lưu, ví dụ IP address có thể convert thành integer.**

Numbers là continuous, performance tốt hơn, occupied space cũng nhỏ hơn.

MySQL cung cấp hai methods để xử lý IP addresses:

- `INET_ATON()`: Convert IPv4 sang unsigned integer (4 bytes, 32 bits). Với IPv6, dùng `INET6_ATON()` để convert thành 16-byte (128-bit) binary string.
- `INET_NTOA()`: Convert integer IP thành address.

Trước khi insert data, dùng `INET_ATON()` để convert IP address thành integer. Khi display data, dùng `INET_NTOA()` để convert integer IP thành address để hiển thị.

**b. Với non-negative data (như auto-increment ID, integer IP, age), ưu tiên dùng unsigned integers.**

Unsigned so với signed có thể có thêm gấp đôi storage space:

```sql
SIGNED INT -2147483648~2147483647
UNSIGNED INT 0~4294967295
```

**c. Small value types (như age, status representation như 0/1) ưu tiên dùng TINYINT.**

**d. Với date types, nhất định không lưu date dưới dạng string. Có thể cân nhắc DATETIME, TIMESTAMP và numeric timestamps.**

Ba loại này đều có ưu thế riêng. Chọn cái phù hợp nhất theo actual scenario mới là đúng. Dưới đây so sánh đơn giản ba loại:

> **Note**: Storage space dưới đây dựa trên MySQL 5.6.4+ (hỗ trợ microsecond precision). Trước 5.6.4, DATETIME cố định 8 bytes, TIMESTAMP cố định 4 bytes. Mỗi chữ số thêm vào small seconds precision tốn thêm 1 byte (tối đa 5 bytes).

| Type              | Storage   | Date Format                    | Date Range                                                  | Has Timezone |
| ----------------- | --------- | ------------------------------ | ----------------------------------------------------------- | ------------ |
| DATETIME          | 5~8 bytes | YYYY-MM-DD hh:mm:ss[.fraction] | 1000-01-01 00:00:00[.000000] ~ 9999-12-31 23:59:59[.999999] | No           |
| TIMESTAMP         | 4~7 bytes | YYYY-MM-DD hh:mm:ss[.fraction] | 1970-01-01 00:00:01[.000000] ~ 2038-01-19 03:14:07[.999999] | Yes          |
| Numeric timestamp | 4 bytes   | Full number like 1578707612    | After 1970-01-01 00:00:01                                   | No           |

Detailed introduction on MySQL time type selection: [MySQL Time Type Data Storage Recommendations](https://javaguide.cn/database/mysql/some-thoughts-on-database-storage-time.html).

**e. Monetary fields use decimal to avoid precision loss.**

Decimal is used to store decimals with precision requirements like money-related data, can avoid floating-point precision loss.

In Java, MySQL's decimal type corresponds to Java class `java.math.BigDecimal`.

Detailed `BigDecimal` introduction: [BigDecimal Detailed](https://javaguide.cn/java/basis/bigdecimal.html).

**f. Try to use auto-increment id as primary key.**

If primary key is auto-increment id, new data appends to the tail of B+ tree, avoiding page splits in the middle, with relatively optimal performance. When one data page is full, just apply for another new page to continue writing.

If primary key is non-auto-increment id, to keep B+ tree leaf nodes ordered after new data is added, it needs to find a position in the middle of leaf nodes to insert. If target page is full, **page split** is needed — split page into two, move half data to new page. Page split needs pessimistic lock, involving large data movement, poor performance.

However, scenarios like database sharding are not recommended to use auto-increment id as primary key. Should use distributed ID like UUID.

Related reading: [Does database primary key have to be auto-increment? What scenarios don't recommend auto-increment?](https://mp.weixin.qq.com/s/vNRIFKjbe7itRTxmq-bkAA).

**g. Not recommended to use `NULL` as column default value.**

`NULL` and `''` (empty string) are two completely different values:

- `NULL` represents an uncertain value. Even two `NULL`s are not necessarily equal. For example, `SELECT NULL=NULL` returns false, but when using `DISTINCT`, `GROUP BY`, `ORDER BY`, `NULL` is treated as equal.
- `''` has length 0, doesn't occupy space. `NULL` needs to occupy space.
- `NULL` affects aggregate function results. For example, `SUM`, `AVG`, `MIN`, `MAX` aggregate functions will ignore `NULL` values. `COUNT`'s behavior depends on parameter type. If parameter is `*` (`COUNT(*)`), counts all records including `NULL`; if parameter is field name (`COUNT(column)`), ignores `NULL` and counts non-null values.
- When querying `NULL` values, must use `IS NULL` or `IS NOT NULL` — cannot use comparison operators like `=`, `!=`, `<`, `>`. While `''` can use these comparison operators.

## Prefer UNION ALL over UNION

UNION puts all data from two result sets into temp table before deduplication, more time-consuming and CPU-intensive.

UNION ALL doesn't deduplicate result set, obtained data contains duplicates.

However, if actual business scenario doesn't allow duplicate data, UNION can still be used.

## Prefer Batch Operations

For data updates in database, use batch operations when possible to reduce database requests and improve performance.

```sql
# Bad example
INSERT INTO `cus_order` (`id`, `score`, `name`) VALUES (1, 426547, 'user1');
INSERT INTO `cus_order` (`id`, `score`, `name`) VALUES (1, 33, 'user2');
INSERT INTO `cus_order` (`id`, `score`, `name`) VALUES (1, 293854, 'user3');

# Good example
INSERT into `cus_order` (`id`, `score`, `name`) values(1, 426547, 'user1'),(1, 33, 'user2'),(1, 293854, 'user3');
```

## Show Profile Phân Tích SQL Execution Performance

Để locate chính xác hơn performance issues của một SQL statement, cần biết rõ SQL statement tiêu thụ bao nhiêu system resources. [`SHOW PROFILE`](https://dev.mysql.com/doc/refman/5.7/en/show-profile.html) và [`SHOW PROFILES`](https://dev.mysql.com/doc/refman/5.7/en/show-profiles.html) hiển thị resource usage của SQL statements, bao gồm CPU usage, CPU context switches, IO wait, memory usage v.v.

MySQL hỗ trợ Profiling sau version 5.0.37. `select @@have_profiling` trả về `YES` nghĩa là có thể dùng.

```sql
 mysql> SELECT @@have_profiling;
+------------------+
| @@have_profiling |
+------------------+
| YES              |
+------------------+
1 row in set (0.00 sec)
```

> **Note**: `SHOW PROFILE` và `SHOW PROFILES` đã deprecated và có thể bị xóa trong các phiên bản MySQL tương lai, thay bằng [Performance Schema](https://dev.mysql.com/doc/refman/8.0/en/performance-schema.html). Trước khi tính năng này bị xóa, giới thiệu sơ cách dùng cơ bản.
>
> **Recommended alternative**: MySQL 5.7+ khuyến nghị dùng `events_statements_history_long` table của Performance Schema:
>
> ```sql
> -- Query recently executed SQLs and their duration
> SELECT
>     EVENT_ID,
>     SQL_TEXT,
>     TIMER_WAIT/1000000000 AS 'Duration (ms)',
>     CPU_USER
> FROM performance_schema.events_statements_history_long
> ORDER BY TIMER_WAIT DESC
> LIMIT 10;
> ```
>
> Ngoài ra, MySQL 8.0.18+ còn hỗ trợ `EXPLAIN ANALYZE` để output actual execution time và row count statistics của SQL.

Để dùng Profiling, hãy đảm bảo `profiling` đang ở trạng thái bật (on).

Có thể xem trạng thái qua lệnh `SHOW VARIABLES`:

![](https://oss.javaguide.cn/github/javaguide/mysql/mysql-show-variables-profiling.png)

Cũng có thể xem qua lệnh `SELECT @@profiling`:

```sql
mysql> SELECT @@profiling;
+-------------+
| @@profiling |
+-------------+
|           0 |
+-------------+
1 row in set (0.00 sec)
```

Mặc định `Profiling` ở trạng thái tắt (off). Dùng lệnh `SET @@profiling=1` để bật.

Sau khi bật, thực thi vài SQL statements. Sau khi hoàn thành, dùng `SHOW PROFILES` để hiển thị thông tin tóm tắt của tất cả SQL statements trong Session hiện tại, bao gồm Query_ID và Duration.

Số lượng SQL có thể collect được quyết định bởi tham số `profiling_history_size`, mặc định là 15, max là 100. Nếu đặt 0 tương đương với tắt Profiling.

![](https://oss.javaguide.cn/github/javaguide/mysql/mysql-show-profiles-ranking-list-table.png)

Để xem execution time details của một SQL statement, dùng lệnh `SHOW PROFILE`.

Cách dùng cụ thể:

```sql
SHOW PROFILE [type [, type] ... ]
    [FOR QUERY n]
    [LIMIT row_count [OFFSET offset]]

type: {
    ALL
  | BLOCK IO
  | CONTEXT SWITCHES
  | CPU
  | IPC
  | MEMORY
  | PAGE FAULTS
  | SOURCE
  | SWAPS
}
```

Khi thực thi lệnh `SHOW PROFILE`, có thể thêm type clauses như CPU, IPC, MEMORY v.v. để xem consumption của loại resource cụ thể:

```sql
SHOW PROFILE CPU,IPC FOR QUERY 8;
```

Nếu không thêm `FOR QUERY {n}` clause, mặc định hiển thị execution của SQL mới nhất. Thêm `FOR QUERY {n}` nghĩa là hiển thị SQL có Query_ID là n.

![](https://oss.javaguide.cn/github/javaguide/mysql/mysql-show-profiles-cpu-ipc.png)

## Tối Ưu Slow SQL

Để tối ưu slow SQL, trước tiên phải tìm ra SQL statements nào execute chậm.

MySQL slow query log được dùng để record các SQL statements có response time vượt quá threshold trong MySQL execution. Vì vậy thông qua phân tích slow query logs chúng ta có thể tìm ra các SQL statements chậm.

Vì lý do performance, slow query log mặc định bị tắt. Bật qua các lệnh sau:

```sql
# Enable slow query log
SET GLOBAL slow_query_log = 'ON';
# Slow query log file location
SET GLOBAL slow_query_log_file = '/var/lib/mysql/ranking-list-slow.log';
# Records not using index regardless of timeout
SET GLOBAL log_queries_not_using_indexes = 'ON';
# Slow query threshold (seconds), SQL executions exceeding this are recorded
SET SESSION long_query_time = 1;
# Slow query only records SQL with scanned rows greater than this
SET SESSION min_examined_row_limit = 100;
```

Sau khi cài đặt thành công, dùng `show variables like 'slow%';` để kiểm tra.

```bash
| Variable_name       | Value                                |
+---------------------+--------------------------------------+
| slow_launch_time    | 2                                    |
| slow_query_log      | ON                                   |
| slow_query_log_file | /var/lib/mysql/ranking-list-slow.log |
+---------------------+--------------------------------------+
3 rows in set (0.01 sec)
```

Chúng ta cố tình thực thi một câu sorting trên table với million-level data (không dùng index):

```sql
SELECT `score`,`name` FROM `cus_order` ORDER BY `score` DESC;
```

Đảm bảo bạn có access permissions cho thư mục tương ứng:

```bash
chmod 755 /var/lib/mysql/
```

Xem slow query log:

```bash
cat /var/lib/mysql/ranking-list-slow.log
```

SQL chúng ta cố tình execute đã được slow query log ghi lại:

```plain
# Time: 2022-10-09T08:55:37.486797Z
# User@Host: root[root] @  [172.17.0.1]  Id:    14
# Query_time: 0.978054  Lock_time: 0.000164 Rows_sent: 999999  Rows_examined: 1999998
SET timestamp=1665305736;
SELECT `score`,`name` FROM `cus_order` ORDER BY `score` DESC;
```

Giải thích một số thông tin trong log:

- `Time`: Thời gian chạy code trên server.
- `User@Host`: Ai execute đoạn code này.
- `Query_time`: Thời gian chạy đoạn code này.
- `Lock_time`: Thời gian bị lock trong khi execute.
- `Rows_sent`: Số records slow query trả về.
- `Rows_examined`: Số rows slow query scan qua.

Trong project thực tế, slow query logs thường khá phức tạp. Cần dùng một số tools để phân tích. MySQL built-in tool `mysqldumpslow` có thể group similar SQLs và thống kê execution count và time cho mỗi group.

Sau khi tìm được slow SQL, dùng lệnh `EXPLAIN` để phân tích `SELECT` statement tương ứng:

```sql
mysql> EXPLAIN SELECT `score`,`name` FROM `cus_order` ORDER BY `score` DESC;
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
| id | select_type | table     | partitions | type | possible_keys | key  | key_len | ref  | rows   | filtered | Extra          |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
|  1 | SIMPLE      | cus_order | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 997572 |   100.00 | Using filesort |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
1 row in set, 1 warning (0.00 sec)
```

Một số fields quan trọng:

- `select_type`: Query type. Common values: SIMPLE (simple query without union, subquery), PRIMARY (main query), UNION (query after UNION), SUBQUERY (subquery).
- `table`: Table or derived table involved in query.
- `type`: Execution method — important reference for judging query efficiency. From worst to best: **ALL** (full table scan) < **index** (full index scan) < **range** (index range scan) < **index_merge** (index merge) < **ref** (non-unique index lookup) < **eq_ref** (unique index lookup) < **const** (single row constant) < **system** (system table). Actual performance also needs to be judged comprehensively with rows, Extra and other fields.
- `rows`: Number of data rows that need to be scanned. Fewer rows is better.
- ……

> **Recommended reading**: [MySQL Execution Plan Analysis](https://javaguide.cn/database/mysql/mysql-query-execution-plan.html) details the meaning of EXPLAIN columns (id, select_type, type, key, rows, Extra), including `EXPLAIN ANALYZE` actual execution analysis added in MySQL 8.0.18+. Also Alibaba's [Slow SQL Governance Experience Summary](https://mp.weixin.qq.com/s/LZRSQJufGRpRw6u4h_Uyww) is well written.

## Correct Index Usage

Correct index usage can greatly speed up data retrieval (greatly reduce amount of data scanned).

### Choose Suitable Fields for Index Creation

- **Non-NULL fields**: Index field data should not be NULL if possible, as it's harder for database to optimize NULL data. If field is frequently queried but NULL is unavoidable, suggest using short values like 0, 1, true, false as replacements.
- **Frequently queried fields**: Fields we create indexes for should be very frequently queried.
- **Fields used as conditions**: Fields used as WHERE conditions should be considered for indexing.
- **Frequently sorted fields**: Indexes are already sorted, so queries can use index's sorting to speed up sort queries.
- **Frequently used in joins**: Fields frequently used in joins may be foreign key columns. Foreign key columns don't necessarily need foreign keys, just meaning the column relates to table relationships. Frequently join-queried fields can be considered for indexing to improve multi-table join query efficiency.

### Avoid Index Failure

Index failure is also one of the main causes of slow queries. Common causes:

**1. SQL syntax conflicting with underlying logic (destroying B+Tree ordering)**

This is the most common type. In essence, query conditions make the B+Tree lose its "binary search" fast positioning ability.

- **Violating leftmost prefix principle**: Skipping leading columns of composite index, or range queries (like `>`, `<`, `BETWEEN`, `LIKE "abc%"`) causing subsequent columns to lose precise positioning and downgrade to range scan plus filter.
- **Applying operations on indexed columns**: Applying math operations or functions on indexed columns in `WHERE` left side causes original data to logically change, presenting disordered state in index tree.
- **Implicit type conversion (hidden and fatal)**: When comparing "string type column" with "numeric type value", MySQL defaults to applying conversion function on the column, directly destroying tree ordering.
- **LIKE with leading wildcard**: Like `LIKE "%abc"`. The uncertainty of prefix characters prevents optimizer from locking the starting point of scan interval.
- **ORDER BY sort trap**: Sort columns missing index, sort direction inconsistent with index structure, etc. trigger additional memory or disk sorting (`Using filesort`).

**2. Optimizer cost decisions (compromising based on I/O cost)**

This type is not about index itself being unusable, but MySQL optimizer calculates that "not using regular index" has lower overall overhead.

- **Blind `SELECT *` causing excessive back-to-table cost**: When querying many non-index-covered columns with large hit count (typically over 20%~30%), optimizer judges that sequential I/O of full table scan is better than random I/O of frequent back-to-table, so proactively abandons index.
- **`OR` condition causing full table scan**: As long as any side of `OR` conditions doesn't have corresponding index, full table scan is triggered. Even if both sides have indexes, if expected cost of Index Merge is too high, it's still abandoned.
- **Long `IN` list causing estimation errors**: When `IN` list length exceeds system threshold (default 200), optimizer switches from precise deep probing (Index Dive) to rough statistical estimation, extremely prone to misjudging execution cost due to stale statistics.

Detailed introduction: [MySQL Index Failure Scenarios Summary](https://javaguide.cn/database/mysql/mysql-index-invalidation.html).

### Be Careful Creating Indexes on Frequently Updated Fields

Although indexes can bring query efficiency, the cost of maintaining indexes is not small. If a field is not frequently queried but frequently modified, shouldn't create indexes on such fields.

### Consider Composite Indexes Over Single-Column Indexes

Since indexes occupy disk space (each index corresponds to a B+ tree), if a table has too many fields and indexes, as data grows, indexes occupy much space and modifying indexes is time-consuming. With composite indexes, multiple fields on one index saves much disk space and improves data modification efficiency.

### Avoid Redundant Indexes

Redundant indexes have the same functionality. If a query can hit index (a, b), it can definitely hit index (a), so index (a) is a redundant index. Like (name, city) and (name) are redundant indexes — queries hitting the former definitely hit the latter. In most cases, should extend existing indexes rather than create new ones.

### Consider Prefix Indexes for String Type Fields

Prefix indexes are only for string types, occupy less space than regular indexes, so can consider prefix indexes instead of regular indexes.

### Delete Long-Unused Indexes

Delete long-unused indexes. Unused indexes cause unnecessary performance loss. MySQL 5.7 can query unused indexes via `schema_unused_indexes` view in sys library.

## References

- MySQL 8.2 Optimizing SQL Statements: https://dev.mysql.com/doc/refman/8.0/en/statement-optimization.html
- Why Alibaba prohibits multi-table join in database - Hollis: https://mp.weixin.qq.com/s/GSGVFkDLz1hZ1OjGndUjZg
- MySQL COUNT statement can be so tortured in interviews - Hollis: https://mp.weixin.qq.com/s/IOHvtel2KLNi-Ol4UBivbQ
- MySQL performance optimization tool Explain usage analysis: https://segmentfault.com/a/1190000008131735
- How to use MySQL slow query log for performance optimization: https://kalacloud.com/blog/how-to-use-mysql-slow-query-log-profiling-mysqldumpslow/
