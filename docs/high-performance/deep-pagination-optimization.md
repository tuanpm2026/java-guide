---
title: Giới thiệu Deep Pagination và Gợi ý Tối ưu
description: "Deep pagination là tình huống query offset quá lớn dẫn đến hiệu năng giảm. Bài này giải thích chi tiết nguyên nhân deep pagination và bốn phương án tối ưu: range query, subquery optimization, INNER JOIN delayed association, covering index, cùng phân tích tình huống áp dụng và ưu nhược điểm của mỗi phương án."
category: High Performance
head:
  - - meta
    - name: keywords
      content: deep pagination,pagination optimization,LIMIT optimization,MySQL pagination,delayed association,covering index,cursor pagination
---

<!-- @include: @small-advertisement.snippet.md -->

## Deep Pagination là gì? Do đâu gây ra?

Tình huống query offset quá lớn được gọi là deep pagination — dẫn đến hiệu năng query thấp. Ví dụ:

```sql
# Trong MySQL không thể dùng index, phải bỏ qua 1000000 record rồi lấy 10 record
SELECT * FROM t_order ORDER BY id LIMIT 1000000, 10
```

Khi query offset quá lớn, MySQL query optimizer có thể chọn full table scan thay vì dùng index để tối ưu.

**Nguyên nhân gốc rễ deep pagination chậm** nằm ở cơ chế thực thi MySQL: Với `LIMIT offset, N`, MySQL không trực tiếp nhảy đến vị trí `offset` mà phải scan từ đầu `offset + N` record. Nếu query phụ thuộc secondary index và không thỏa covering index, điều này có nghĩa MySQL cần thực hiện **table lookup vô nghĩa** (sinh random I/O khổng lồ) cho `offset` record đầu tiên, rồi cuối cùng bỏ đi tất cả data đã vất vả query ra. Dù optimizer cuối cùng vì chi phí quá cao mà degrade xuống full table scan, chi phí sequential scan hàng triệu row vẫn rất lớn.

![Vấn đề deep pagination](/images/github/javaguide/mysql/deep-pagination-phenomenon.png)

Điểm giới hạn query offset quá lớn này có thể khác nhau trên các máy khác nhau, tùy thuộc vào nhiều yếu tố như cấu hình phần cứng (hiệu năng CPU, tốc độ disk), kích thước bảng, loại index và thống kê, v.v.

![Điểm giới hạn chuyển sang full table scan](/images/github/javaguide/mysql/deep-pagination-phenomenon-critical-point.png)

MySQL query optimizer áp dụng chiến lược cost-based để chọn execution plan tối ưu nhất. Nó quyết định có dùng index scan hay full table scan dựa trên chi phí CPU và I/O. Nếu optimizer cho rằng chi phí full table scan thấp hơn, nó sẽ bỏ index. Tuy nhiên, dù offset rất lớn, nếu query dùng covering index, MySQL vẫn có thể dùng index và tránh được table lookup.

## Gợi ý tối ưu Deep Pagination

> **Bài này dựa trên MySQL 8.0 + InnoDB storage engine** — hành vi optimizer của các phiên bản khác có thể khác.

### Range Query (Cursor Pagination)

Ghi lại ID của record cuối cùng trong trang trước, dùng `WHERE id > last_id LIMIT n` để lấy data trang tiếp:

```sql
# Dùng ID của record cuối cùng trong query trước để query trang tiếp
SELECT * FROM t_order WHERE id > 100000 ORDER BY id LIMIT 10
```

**Ưu điểm cốt lõi của cursor pagination**: **Không phụ thuộc tính liên tục của ID**. MySQL chỉ cần định vị đến vị trí `last_id` trên B+ tree rồi đọc tiếp `n` record theo thứ tự. Giữa các record có bị gián đoạn (như ID bị xóa) hay không hoàn toàn không ảnh hưởng đến độ chính xác và hiệu năng kết quả.

Hạn chế của cách này:

1. **Không hỗ trợ skip page**: Không thể nhảy thẳng đến trang N, chỉ có thể lật trang lần lượt về phía sau (hoặc trước).
2. **Sort field bị hạn chế**: Nếu query cần sort theo field khác (như thời gian tạo) thay vì ID, cần dùng composite cursor `(sort_field, id)` để đảm bảo tính duy nhất và thứ tự.
3. **Concurrent scenario**: Khi có data mới insert hoặc xóa trong quá trình pagination query:
   - **Bỏ sót data**: Khi query trang 2, có data mới insert vào phạm vi trang 1 — data đó bị "đẩy" sang trang 2, nhưng trang 2 đã dùng last ID cũ để skip nó.
   - **Data trùng lặp**: Khi query trang 2, data cuối trang 1 bị xóa — record đầu tiên của trang 2 "nâng" lên cuối trang 1, dẫn đến trang 2 trả về nó lần nữa.

### Subquery

Trước tiên query ra primary key tương ứng với tham số đầu tiên của limit, rồi dựa trên primary key đó để filter và limit — hiệu quả nhanh hơn.

Trong 《Java Development Manual》 của Alibaba cũng có mô tả tương ứng:

> Dùng delayed association hoặc subquery để tối ưu tình huống phân trang quá nhiều trang.
>
> ![](/images/github/javaguide/mysql/alibaba-java-development-handbook-paging.png)

```sql
-- Trước tiên dùng subquery để offset trên primary key index, tìm nhanh start ID
SELECT * FROM t_order
WHERE id >= (
    SELECT id FROM t_order ORDER BY id LIMIT 1000000, 1
) ORDER BY id LIMIT 10;
```

**Nguyên lý hoạt động**:

1. Subquery `(SELECT id FROM t_order ORDER BY id LIMIT 1000000, 1)` dùng primary key index để scan và bỏ qua 1000000 record đầu, trả về primary key value của record thứ 1000001.
2. Main query `SELECT * FROM t_order WHERE id >= ... ORDER BY id LIMIT 10` lấy primary key đó làm điểm bắt đầu, lấy 10 record đầy đủ tiếp theo.

Tuy nhiên trong một số tình huống, subquery có thể tạo temporary table ảnh hưởng hiệu năng. Do đó trong query phức tạp khuyến nghị ưu tiên delayed association.

> **Complex filter scenario**: Trong tình huống pagination có điều kiện filter phức tạp (như `WHERE status = 1 ORDER BY id LIMIT 1000000, 10`), các ID thỏa điều kiện thường rải rác. Lúc này ưu thế của subquery càng rõ: dùng composite index (như `(status, id)`) trong subquery để covering index scan — có thể hiệu quả skip 1 triệu record thỏa điều kiện đầu tiên, sau khi định vị được target ID, main query chỉ cần table lookup 10 lần.

Tất nhiên, cũng có thể dùng subquery lấy trước ID collection của target pagination rồi lấy nội dung theo ID collection, nhưng cách viết này rất cồng kềnh — không bằng dùng INNER JOIN delayed association.

### Delayed Association

Tư duy tối ưu của delayed association tương tự subquery — đều là chuyển thao tác `LIMIT` sang primary key index tree để giảm số lần table lookup. So với dùng subquery trực tiếp, delayed association tích hợp kết quả subquery vào main query qua `INNER JOIN`, tránh được temporary table mà subquery có thể tạo ra. Khi thực thi `INNER JOIN`, MySQL optimizer có thể dùng index để JOIN hiệu quả (như index scan hay các chiến lược tối ưu khác). Do đó trong deep pagination scenario, hiệu năng thường tốt hơn dùng subquery trực tiếp.

```sql
-- Dùng INNER JOIN để delayed association
SELECT t1.*
FROM t_order t1
INNER JOIN (
    -- Subquery ở đây có thể dùng covering index — hiệu năng cực cao
    SELECT id FROM t_order ORDER BY id LIMIT 1000000, 10
) t2 ON t1.id = t2.id
ORDER BY t1.id;
```

**Nguyên lý hoạt động**:

1. Subquery `(SELECT id FROM t_order ORDER BY id LIMIT 1000000, 10)` dùng primary key index scan và bỏ qua 1000000 record đầu, trả về ID của 10 record trong target pagination.
2. Qua `INNER JOIN` kết nối kết quả subquery với bảng chính `t_order` để lấy data record đầy đủ.

Ngoài INNER JOIN còn có thể dùng comma-separated subquery:

```sql
-- Dùng dấu phẩy để delayed association
SELECT t1.* FROM t_order t1,
(SELECT id FROM t_order ORDER BY id LIMIT 1000000, 10) t2
WHERE t1.id = t2.id
ORDER BY t1.id;
```

**Lưu ý**: Dù comma-separated subquery cũng đạt được hiệu quả tương tự, để readable và maintainable của code, khuyến nghị dùng cú pháp `INNER JOIN` chuẩn hơn.

### Covering Index

Query bao gồm tất cả field cần lấy đã có trong index được gọi là covering index.

**Lợi ích của covering index:**

- **Tránh secondary lookup trên InnoDB table — tức table lookup**: InnoDB lưu trữ theo thứ tự clustered index. Với InnoDB, secondary index lưu primary key info của row trong leaf node. Nếu dùng secondary index để query data, sau khi tìm được key value tương ứng, còn phải query qua primary key một lần nữa mới lấy được data thực sự cần. Trong covering index, secondary index key value có thể lấy được tất cả data, tránh secondary query theo primary key (table lookup), giảm I/O, tăng query efficiency.
- **Giảm random I/O do table lookup**: Trả về data trực tiếp qua covering index, tránh random I/O khi lookup clustered index theo primary key value. Mỗi lần table lookup theo primary key về bản chất là random I/O.

Giả sử đã tạo composite index `(code, type)`, query dưới đây có thể dùng covering index:

```sql
# Trong InnoDB, secondary index tự nhiên chứa primary key id
# Nếu chỉ cần query 3 cột id, code, type thì chỉ cần tạo composite index (code, type) là đủ covering
SELECT id, code, type FROM t_order
ORDER BY code
LIMIT 1000000, 10;
```

**⚠️ Lưu ý**:

- Khi result set của query chiếm tỷ lệ lớn trong tổng số row của bảng, MySQL query optimizer có thể chọn bỏ index và tự động chuyển sang full table scan.
- Dù có thể dùng `FORCE INDEX` để buộc query optimizer đi theo index, cách này có thể khiến optimizer không chọn được execution plan tốt hơn — hiệu quả không phải lúc nào cũng lý tưởng.

## Khuyến nghị khi đưa vào production

### Monitoring và Alert

- **Slow query monitoring**: Theo dõi SQL có `LIMIT` offset quá lớn trong slow query log để kịp thời phát hiện vấn đề.
- **Threshold alert**: Đặt ngưỡng `long_query_time` để bắt deep pagination query.
- **Execution plan check**: Dùng `EXPLAIN` kiểm tra định kỳ execution plan của key pagination SQL, đảm bảo optimizer dùng index như mong đợi.

### Hiểu lầm phổ biến

| Hiểu lầm                                         | Thực tế                                                                                  |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Cho rằng `FORCE INDEX` giải quyết mọi vấn đề     | Forcing index có thể ngăn optimizer chọn plan tốt hơn — dùng thận trọng                  |
| Cho rằng covering index phù hợp mọi tình huống   | Khi field nhiều, index maintenance cost cao; large result set vẫn có thể full table scan |
| Cho rằng cursor pagination giải quyết mọi vấn đề | Cursor pagination không hỗ trợ skip page, chỉ lật theo thứ tự field cụ thể               |

## Tổng kết

Nguyên nhân gốc rễ vấn đề deep pagination: Khi offset của `LIMIT` quá lớn, MySQL cần scan và bỏ qua lượng lớn record mới lấy được target data. Query optimizer có thể bỏ index và chọn full table scan. Lúc này dù có index cũng không tránh được nhiều table lookup, dẫn đến hiệu năng query giảm mạnh.

Bài này giới thiệu bốn phương án tối ưu deep pagination phổ biến. So sánh đặc điểm và tình huống áp dụng của mỗi phương án:

| Phương án tối ưu        | Tư duy cốt lõi                                                                | Tình huống áp dụng                                      | Hạn chế                                                                              |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Range Query**         | Ghi last ID của trang trước, dùng `WHERE id > last_id LIMIT n`                | Sort theo ID, cho phép cursor pagination                | Không hỗ trợ skip page, non-ID sort cần composite cursor                             |
| **Subquery**            | Trước tiên dùng subquery lấy start primary key, rồi filter                    | Cần hỗ trợ traditional OFFSET pagination                | Subquery có thể tạo temp table, phụ thuộc index của sort field                       |
| **Delayed Association** | Dùng `INNER JOIN` chuyển pagination sang primary key index, giảm table lookup | Large data pagination, cần traditional pagination logic | SQL tương đối phức tạp                                                               |
| **Covering Index**      | Tạo composite index chứa query field, tránh table lookup                      | Query field cố định, có thể tạo index phù hợp           | Khi field nhiều, index maintenance cost cao; large result set có thể full table scan |

**Gợi ý chọn phương án**:

- **Ưu tiên Delayed Association**: Với hầu hết tình huống cần hỗ trợ traditional `LIMIT offset, size` pagination, delayed association là lựa chọn tốt về hiệu năng và maintainability.
- **Cân nhắc Range Query (Cursor Pagination)**: Nếu nghiệp vụ cho phép dùng cursor pagination kiểu "trang tiếp" (như social media feed stream, infinite scroll), range query hiệu năng tốt nhất và ổn định.
- **Covering Index làm bổ sung**: Khi query field cố định và số lượng ít, có thể kết hợp phương án khác tạo covering index để tối ưu thêm.

**Lưu ý**:

- Bất kể dùng phương án nào, cũng nên theo dõi execution plan thực tế (`EXPLAIN`) để đảm bảo optimizer dùng index như mong đợi.
- Với super deep pagination (như offset hàng triệu), nên đánh giá từ góc độ nghiệp vụ xem có thực sự cần hỗ trợ không. Cân nhắc giới hạn số trang tối đa hoặc dùng cách retrieval khác (như search engine).

## Tài liệu tham khảo

- Bàn về cách giải quyết vấn đề MySQL deep pagination - Chàng trai nhặt ốc: <https://juejin.cn/post/7012016858379321358>
- Giới thiệu và phương án tối ưu deep pagination database - JD Retail Tech: <https://mp.weixin.qq.com/s/ZEwGKvRCyvAgGlmeseAS7g>
- MySQL deep pagination optimization - Dewu Tech: <https://juejin.cn/post/6985478936683610149>
