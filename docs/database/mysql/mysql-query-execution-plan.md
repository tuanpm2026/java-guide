---
title: Phân tích MySQL Execution Plan
description: Giải thích chi tiết ý nghĩa các cột trong MySQL EXPLAIN execution plan, bao gồm id, select_type, type, key, rows, Extra và các field quan trọng, giúp phân tích performance bottleneck của SQL và tối ưu có mục tiêu.
category: Cơ sở dữ liệu
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL execution plan,EXPLAIN,query optimizer,SQL performance analysis,index hit,type access type,Extra field,slow query optimization
---

Bước đầu tiên để tối ưu SQL là đọc hiểu execution plan của SQL. Bài này cùng nhau học kiến thức liên quan đến `EXPLAIN` execution plan của MySQL.

> **Ghi chú phiên bản**: Nội dung bài này dựa trên MySQL 5.7+ và 8.0+. Cột `filtered` và `partitions` khả dụng từ MySQL 5.7+. `EXPLAIN ANALYZE` và Hash Join cần MySQL 8.0.18+ và 8.0.20+.

## Execution Plan là gì?

**Execution Plan** là cách thức thực thi cụ thể của một câu SQL sau khi được **MySQL query optimizer** tối ưu.

Execution plan thường dùng trong các tình huống như phân tích và tối ưu SQL performance. Thông qua kết quả của `EXPLAIN`, có thể biết thông tin như thứ tự query các data table, loại thao tác data query, index nào có thể được hit, index nào thực tế sẽ được hit, mỗi data table có bao nhiêu row được query, v.v.

## Cách lấy Execution Plan?

MySQL cung cấp lệnh `EXPLAIN` để lấy thông tin liên quan đến execution plan.

Cần lưu ý, câu lệnh `EXPLAIN` chuẩn không thực sự thực thi câu lệnh liên quan, mà phân tích câu lệnh qua query optimizer để tìm phương án query tối ưu và hiển thị thông tin tương ứng.

MySQL 8.0.18 giới thiệu `EXPLAIN ANALYZE` — **thực sự thực thi** query và output thời gian thực tế và số row của mỗi bước. Đáng tin cậy hơn dữ liệu ước tính của `EXPLAIN` chuẩn, phù hợp để phân tích sâu slow query trong môi trường test:

```sql
mysql> EXPLAIN ANALYZE SELECT * FROM users WHERE age = 25\G
*************************** 1. row ***************************
EXPLAIN: -> Covering index lookup on users using idx_age_score_name (age=25)
(cost=1.52 rows=12) (actual time=0.0272..0.0344 rows=12 loops=1)
```

Ngoài ra, `EXPLAIN FORMAT=JSON` có thể output dữ liệu cost model của optimizer (`query_cost`) — phản ánh chi phí thực tế của từng bước tốt hơn dạng bảng. Đặc biệt hữu ích khi tối ưu multi-table JOIN hoặc subquery:

```sql
mysql> EXPLAIN FORMAT=JSON SELECT * FROM users WHERE age = 25\G
*************************** 1. row ***************************
EXPLAIN: {
  "query_block": {
    "select_id": 1,
    "cost_info": {
      "query_cost": "1.52"
    },
    "table": {
      "table_name": "users",
      "access_type": "ref",
      "key": "idx_age_score_name",
      "rows_examined_per_scan": 12,
      "filtered": "100.00",
      "using_index": true
    }
  }
}
```

`EXPLAIN` execution plan hỗ trợ câu lệnh `SELECT`, `DELETE`, `INSERT`, `REPLACE` và `UPDATE`. Thường dùng nhiều nhất để phân tích câu query `SELECT`. Syntax đơn giản:

```sql
EXPLAIN SELECT câu_query;
```

Xem execution plan của một câu query đơn giản:

**Ví dụ 1: Single-table query (dùng index)**

```sql
-- Cấu trúc bảng: users(id, age, score, name, address), composite index idx_age_score_name(age, score, name)
mysql> EXPLAIN SELECT * FROM users WHERE age = 25;
+----+-------------+-------+------------+------+---------------------+---------------------+---------+-------+------+----------+-------------+
| id | select_type | table | partitions | type | possible_keys       | key                 | key_len | ref   | rows | filtered | Extra       |
+----+-------------+-------+------------+------+---------------------+---------------------+---------+-------+------+----------+-------------+
|  1 | SIMPLE      | users | NULL       | ref  | idx_age_score_name  | idx_age_score_name  | 5       | const |   12 |   100.00 | Using index |
+----+-------------+-------+------------+------+---------------------+---------------------+---------+-------+------+----------+-------------+
```

**Ví dụ 2: UNION query (tình huống id là NULL)**

```sql
mysql> EXPLAIN SELECT * FROM users WHERE id = 1 UNION SELECT * FROM users WHERE id = 2;
+----+--------------+------------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
| id | select_type  | table      | partitions | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra |
+----+--------------+------------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
|  1 | PRIMARY      | users      | NULL       | const | PRIMARY       | PRIMARY | 4       | const |    1 |   100.00 | NULL  |
|  2 | UNION        | users      | NULL       | const | PRIMARY       | PRIMARY | 4       | const |    1 |   100.00 | NULL  |
|  3 | UNION RESULT | <union1,2> | NULL       | ALL   | NULL          | NULL    | NULL    | NULL  | NULL |     NULL | Using temporary |
+----+--------------+------------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
```

Có thể thấy kết quả execution plan có tổng cộng 12 cột. Ý nghĩa của các cột tóm tắt như bảng dưới:

| **Tên cột**   | **Ý nghĩa**                                                         |
| ------------- | ------------------------------------------------------------------- |
| id            | Sequence identifier của SELECT query                                |
| select_type   | Loại query tương ứng với keyword SELECT                             |
| table         | Tên bảng được dùng                                                  |
| partitions    | Partition match; với bảng chưa phân vùng, giá trị là NULL           |
| type          | Phương thức truy cập bảng                                           |
| possible_keys | Index có thể được dùng                                              |
| key           | Index thực tế được dùng                                             |
| key_len       | Độ dài của index được chọn                                          |
| ref           | Cột hoặc hằng số để so sánh với index khi dùng index equality query |
| rows          | Số row ước tính cần đọc                                             |
| filtered      | Phần trăm record còn lại sau khi filter bởi điều kiện bảng          |
| Extra         | Thông tin bổ sung                                                   |

## Cách phân tích kết quả EXPLAIN?

Để phân tích kết quả thực thi của câu lệnh `EXPLAIN`, cần hiểu các field quan trọng trong execution plan.

### id

Sequence identifier của `SELECT`, dùng để xác định thứ tự thực thi của mỗi câu `SELECT`.

Quy tắc đọc hiểu cột `id`:

- **id giống nhau**: Thực thi từ trên xuống dưới theo thứ tự (thường xuất hiện trong tình huống multi-table JOIN).
- **id khác nhau**: id càng lớn thì priority thực thi càng cao (subquery thực thi trước outer query).
- **id là NULL**: Đây là result set của UNION RESULT hoặc DERIVED table, không cần thực thi query riêng.

**Ví dụ**:

```sql
mysql> EXPLAIN SELECT * FROM users WHERE id = 1
    -> UNION
    -> SELECT * FROM users WHERE id = 2\G
*************************** 1. row ***************************
           id: 1
  select_type: PRIMARY
        table: users
         type: const
*************************** 2. row ***************************
           id: 2
  select_type: UNION
        table: users
         type: const
*************************** 3. row ***************************
           id: NULL
  select_type: UNION RESULT
        table: <union1,2>
         type: ALL
        Extra: Using temporary
```

Row thứ ba `id = NULL`, `table = <union1,2>` — biểu thị đây là kết quả merge của hai query đầu.

### select_type

Loại query, chủ yếu dùng để phân biệt simple query, union query, subquery và các complex query khác. Các giá trị phổ biến:

- **SIMPLE**: Simple query, không chứa UNION hay subquery.
- **PRIMARY**: Nếu query chứa subquery hoặc các phần khác, outer `SELECT` sẽ được đánh dấu là PRIMARY.
- **SUBQUERY**: `SELECT` đầu tiên trong subquery.
- **UNION**: `SELECT` xuất hiện sau UNION trong câu UNION.
- **DERIVED**: Subquery xuất hiện trong FROM sẽ được đánh dấu là DERIVED.
- **UNION RESULT**: Kết quả của UNION query.

### table

Tên bảng được dùng cho query — mỗi row đều có tên bảng tương ứng. Tên bảng ngoài bảng thông thường còn có thể là các giá trị sau:

- **`<unionM,N>`**: Row này reference kết quả UNION của row có id là M và N.
- **`<derivedN>`**: Row này reference kết quả derived table do bảng có id là N sinh ra. Derived table có thể đến từ subquery trong câu FROM.
- **`<subqueryN>`**: Row này reference kết quả materialized subquery do bảng có id là N sinh ra.

### type (Quan trọng)

Loại thực thi query, mô tả cách query được thực thi. **Thứ tự từ tốt nhất đến tệ nhất**:

`system > const > eq_ref > ref > fulltext > ref_or_null > index_merge > unique_subquery > index_subquery > range > index > ALL`

**Quy tắc đánh giá hiệu năng thực tiễn**:

- **Tốt** (ít nhất đạt): `system`, `const`, `eq_ref`, `ref`, `range`
- **Cần chú ý**: `index_merge`, `index` (full index scan, vẫn có rủi ro hiệu năng với data lớn)
- **Cần tối ưu**: `ALL` (full table scan)

**Lưu ý**: Thứ tự này phản ánh **hiệu quả truy cập single table** — không đại diện cho hiệu năng query tổng thể. Ví dụ `type=ref` kết hợp nhiều table lookup có thể chậm hơn covering index của `type=index`.

Ý nghĩa cụ thể của các loại phổ biến:

- **system**: Bảng chỉ có một row (hoặc bảng trống) và storage engine có thể ước tính chính xác số row. Áp dụng cho engine như MyISAM, Memory, InnoDB (khi bảng chỉ có 1 row, InnoDB tối ưu thành const). Là trường hợp đặc biệt của access type const.
- **const**: Bảng tối đa có một row match — tìm được ngay trong một lần query. Thường dùng khi dùng tất cả field của primary key hoặc unique index làm điều kiện query.
- **eq_ref**: Khi JOIN bảng, row của bảng trước trong bảng hiện tại chỉ có một row tương ứng. Là cách JOIN tốt nhất ngoài system và const. Thường dùng khi dùng tất cả field của primary key hoặc unique non-null index làm điều kiện JOIN (đảm bảo one-to-one match chặt chẽ).
- **ref**: Dùng ordinary index làm điều kiện query, kết quả query có thể tìm thấy nhiều row thỏa điều kiện (khác eq_ref: một driver row có thể match nhiều driven row).
- **index_merge**: Khi mệnh đề WHERE chứa nhiều range condition và mỗi condition có thể dùng index khác nhau, MySQL sẽ merge kết quả scan của nhiều index. Cột key liệt kê các index dùng, cột Extra hiển thị thuật toán merge:

  - `Using union(...)`: Lấy union kết quả của nhiều index (điều kiện OR)
  - `Using sort_union(...)`: Sort kết quả index trước rồi lấy union (điều kiện OR, index column không có thứ tự)
  - `Using intersection(...)`: Lấy intersection kết quả của nhiều index (điều kiện AND)

  **Ví dụ**:

  ```sql
  -- Điều kiện OR trigger index merge union
  EXPLAIN SELECT * FROM employees WHERE emp_no = 10001 OR dept_no = 'd001';
  -- Extra: Using union(PRIMARY,dept_no_index)
  ```

- **range**: Range query trên index column. Cột key trong execution plan cho biết index nào được dùng.
- **index**: Full Index Scan — query duyệt toàn bộ index tree. Tương tự ALL (full table scan) nhưng thường chi phí thấp hơn: kích thước index record nhỏ hơn nhiều so với full row data, cần ít I/O page hơn để đọc cùng số row. Nếu cùng lúc thỏa điều kiện covering index còn tránh được table lookup. Nhưng với super-large table (trên 100 triệu row), full index scan cũng có thể sinh nhiều I/O — không thể bỏ qua chi phí của nó chỉ vì type level cao hơn ALL.
- **ALL**: Full table scan.

### possible_keys

Cột possible_keys cho biết các index mà MySQL có thể dùng khi thực thi query. Nếu cột này là NULL, không có index nào có thể dùng. Trong trường hợp này, cần kiểm tra các cột được dùng trong WHERE — xem có thể thêm index cho một hoặc nhiều cột đó để cải thiện hiệu năng query không.

### key (Quan trọng)

Cột key cho biết index mà MySQL thực tế dùng. Nếu là NULL — không dùng index.

### key_len

Cột key_len cho biết độ dài tối đa của index mà MySQL thực tế dùng. Khi dùng composite index, có thể là tổng độ dài nhiều cột. Càng ngắn càng tốt trong khi vẫn đáp ứng yêu cầu. Nếu cột key hiển thị NULL thì cột key_len cũng hiển thị NULL.

### rows

Cột rows là **ước tính** số row cần đọc để tìm record cần thiết, dựa trên thống kê bảng và lựa chọn index. Giá trị càng nhỏ càng tốt.

Cần lưu ý đây là giá trị ước tính, không phải chính xác. Thống kê của InnoDB dựa trên random sampling các index page:

- Số page sample được kiểm soát bởi `innodb_stats_persistent_sample_pages` (mặc định 20 page).
- Sau khi data bảng thay đổi thường xuyên hoặc bulk import, sai lệch giữa giá trị ước tính và số row thực có thể lên đến 10%~50% thậm chí cao hơn.
- **Small table pitfall**: Khi bảng có rất ít row (như < 100 row), optimizer có thể bỏ qua index và chọn full table scan vì ước tính chi phí của full table scan thấp hơn.

**Cách verify**:

```sql
-- Số row ước tính của execution plan
mysql> EXPLAIN SELECT * FROM users WHERE age = 25\G
rows: 12

-- Số row thực tế (cẩn thận với COUNT(*) trên bảng lớn)
mysql> SELECT COUNT(*) FROM users WHERE age = 25;
+----------+
| COUNT(*) |
+----------+
|       12 |
+----------+
```

Khi execution plan không khớp với hiệu năng thực tế, có thể thực thi `ANALYZE TABLE` để resample rồi quan sát thay đổi của execution plan.

### filtered

Cột filtered là **ước tính** phần trăm record còn lại sau khi dữ liệu do storage engine trả về được WHERE condition filter ở Server layer (phần trăm, 0~100). Công thức tính: `filtered = (số row sau khi filter theo điều kiện / số row do storage engine trả về) × 100`.

**Quy tắc đọc hiểu**:

- **filtered = 100**: Tất cả row do storage engine trả về đều thỏa điều kiện WHERE (lý tưởng).
- **filtered < 100**: Một phần row bị Server layer filter — index không cover được tất cả query condition.
- **JOIN scenario**: Optimizer dùng `rows × (filtered / 100)` để ước tính số row từ bảng hiện tại truyền sang bảng tiếp theo (fanout).

Field này đặc biệt quan trọng trong tình huống multi-table JOIN: fanout càng lớn, số row của driven table cần match với driver table càng nhiều. Do đó khi `filtered` thấp — filter efficiency tốt. Khi `rows` lớn và `filtered` không cao — đây là signal của performance bottleneck tiềm ẩn. Nên ưu tiên giảm fanout qua Index Condition Pushdown (ICP) hoặc index phù hợp hơn.

### Extra (Quan trọng)

Cột này chứa thông tin bổ sung khi MySQL parse query. Thông qua các thông tin này, có thể hiểu chính xác hơn MySQL thực thi query như thế nào. Các giá trị phổ biến:

- **Using filesort**: MySQL không thể dùng index để hoàn thành yêu cầu sắp xếp của ORDER BY hoặc GROUP BY, cần thực hiện thêm một thao tác sort sau khi trả về result set. Khi kích thước result set nằm trong `sort_buffer_size`, sort thực hiện trong memory; vượt quá thì dùng temporary disk file. "filesort" là tên lịch sử để lại — không nhất thiết có disk I/O.
- **Using temporary**: MySQL cần tạo temporary table để lưu kết quả query, thường gặp với ORDER BY và GROUP BY.
- **Using index**: Query dùng covering index, không cần table lookup — query efficiency rất cao.
- **Using index condition**: Optimizer chọn dùng tính năng Index Condition Pushdown.
- **Using where**: MySQL Server layer apply thêm WHERE condition filter trên các row do storage engine trả về. Ngay cả khi đã hit index (như `type=ref`), nếu index chỉ thỏa một phần query condition, các condition còn lại vẫn phải filter ở Server layer — lúc này cũng xuất hiện `Using where`.
- **Using join buffer (Block Nested Loop)**: Khi JOIN bảng, driven table không dùng index. MySQL trước tiên đọc dữ liệu driver table vào join buffer, rồi duyệt driven table để match (complexity O(N×M)).
- **Using join buffer (hash join)**: MySQL 8.0.18 giới thiệu thuật toán Hash Join — **chỉ dùng cho equality JOIN** (như `t1.id = t2.id`). Từ 8.0.20 mặc định thay thế BNL. Hash Join complexity là build phase O(N) + probe phase O(M) — hiệu quả hơn BNL O(N×M).

  **Exception scenario** (vẫn fallback về BNL):

  - Non-equality JOIN (như `t1.id > t2.id`)
  - JOIN condition chứa function hoặc expression
  - Khi driven table có index khả dụng (lúc này dùng Index Nested Loop)

Nhắc nhở: Khi cột Extra chứa `Using filesort` hoặc `Using temporary`, hiệu năng MySQL có thể gặp vấn đề — cần cố gắng tránh.

## Tài liệu tham khảo

- <https://dev.mysql.com/doc/refman/8.0/en/explain-output.html>
- <https://dev.mysql.com/doc/refman/8.0/en/explain.html>
- <https://juejin.cn/post/6953444668973514789>
