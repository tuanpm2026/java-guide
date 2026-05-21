---
title: Tổng hợp quy chuẩn tối ưu MySQL high performance
description: Tổng hợp các khuyến nghị quy chuẩn tối ưu MySQL high performance, bao gồm quy chuẩn đặt tên database, quy chuẩn thiết kế bảng, quy chuẩn thiết kế field, quy chuẩn thiết kế index, quy chuẩn viết SQL, v.v. giúp xây dựng hệ thống database hiệu quả và ổn định.
category: Cơ sở dữ liệu
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL optimization specification,database design specification,index design,SQL writing specification,slow query optimization,field type selection,table structure design
---

> Tác giả: Ting Feng. Link bài gốc: <https://www.cnblogs.com/huchong/p/10219318.html>.
>
> JavaGuide đã được tác giả cho phép và đã bổ sung hoàn thiện nội dung gốc.

## Quy chuẩn đặt tên Database

- Tất cả tên object database phải dùng chữ thường và phân tách bằng dấu gạch dưới.
- Tất cả tên object database cấm dùng MySQL reserved keyword (nếu tên bảng chứa keyword khi query cần bao trong dấu nháy đơn).
- Đặt tên database object phải làm cho tên thể hiện ý nghĩa rõ ràng, tốt nhất không vượt quá 32 ký tự.
- Temporary table phải có prefix `tmp_` và hậu tố là ngày tháng. Backup table phải có prefix `bak_` và hậu tố là ngày (timestamp).
- Tất cả column name và column type lưu cùng loại dữ liệu phải nhất quán (thường làm associate column. Nếu type của associate column không nhất quán khi query sẽ tự động thực hiện implicit data type conversion, gây index invalidation trên column đó và giảm query efficiency).

## Quy chuẩn thiết kế Database cơ bản

### Tất cả bảng phải dùng InnoDB storage engine

Nếu không có yêu cầu đặc biệt (tức chức năng InnoDB không đáp ứng được như column storage, lưu spatial data, v.v.), tất cả bảng phải dùng InnoDB storage engine (trước MySQL 5.5 mặc định dùng MyISAM, từ 5.6 mặc định là InnoDB).

InnoDB hỗ trợ transaction, hỗ trợ row-level lock, khả năng recovery tốt hơn, hiệu năng tốt hơn dưới high concurrency.

### Database và bảng thống nhất dùng charset UTF8

Tương thích tốt hơn. Charset thống nhất tránh garbled characters do charset conversion. Khi so sánh các charset khác nhau cần convert trước gây index invalidation. Nếu database cần lưu emoji, cần dùng charset utf8mb4.

Khuyến nghị đọc bài tôi viết: [Giải thích chi tiết MySQL Charset](../character-set.md).

### Tất cả bảng và field cần thêm comment

Dùng mệnh đề comment để thêm ghi chú cho bảng và column. Bắt đầu duy trì data dictionary từ đầu.

### Cố gắng kiểm soát kích thước data của single table, khuyến nghị giữ dưới 5 triệu

5 triệu không phải giới hạn của MySQL database. Quá lớn sẽ gây nhiều vấn đề lớn cho modify table structure, backup, recovery.

Có thể dùng các biện pháp như historical data archiving (áp dụng với log data), database và table sharding (áp dụng với business data) để kiểm soát kích thước data.

### Thận trọng khi dùng MySQL partition table

Partition table về vật lý là nhiều file, về logic là một bảng.

Thận trọng khi chọn partition key — cross-partition query có thể kém hiệu quả hơn.

Khuyến nghị dùng physical table sharding để quản lý big data.

### Đặt các column thường dùng cùng nhau vào cùng một bảng

Tránh thêm nhiều JOIN operation.

### Cấm tạo reserved field trong bảng

- Tên reserved field khó làm thể hiện ý nghĩa rõ ràng.
- Không thể xác định data type của reserved field nên không thể chọn type phù hợp.
- Modify type của reserved field sẽ lock bảng.

### Cấm lưu file (như ảnh) dạng binary data lớn trong database

Lưu file trong database ảnh hưởng nghiêm trọng đến hiệu năng database, tiêu tốn quá nhiều storage space.

File lớn dạng binary (như ảnh) thường được lưu trên file server. Database chỉ lưu thông tin địa chỉ file.

### Không bị ràng buộc bởi database normal form

Nói chung khi thiết kế relational database cần thỏa Third Normal Form, nhưng để thỏa Third Normal Form chúng ta có thể phải tách ra nhiều bảng. Khi query cần JOIN nhiều bảng. Đôi khi để tăng query efficiency, sẽ giảm yêu cầu về normal form, giữ lại một số thông tin dư thừa trong bảng — gọi là denormalization. Nhưng cần lưu ý denormalization phải vừa phải.

### Cấm thực hiện stress test database trên môi trường production

### Cấm kết nối trực tiếp đến production database từ môi trường development, test

Rủi ro bảo mật cực lớn — phải có sự kính trọng với môi trường production!

## Quy chuẩn thiết kế Field của Database

### Ưu tiên chọn data type nhỏ nhất đáp ứng nhu cầu lưu trữ

Byte lưu trữ càng nhỏ, không gian chiếm dụng càng nhỏ, hiệu năng càng tốt.

**a. Một số string có thể convert sang number type để lưu, ví dụ có thể convert IP address sang integer data.**

Số liên tục, hiệu năng tốt hơn, chiếm không gian nhỏ hơn.

MySQL cung cấp hai method xử lý IP address:

- `INET_ATON()`: Convert IP sang unsigned integer (4-8 chữ số).
- `INET_NTOA()`: Convert integer IP sang address.

Trước khi insert data, dùng `INET_ATON()` để convert IP sang integer. Khi hiển thị data, dùng `INET_NTOA()` để convert integer IP sang address.

**b. Với data kiểu non-negative (như auto-increment ID, integer IP, age), ưu tiên dùng unsigned integer để lưu.**

Unsigned so với signed có thể lưu nhiều gấp đôi:

```sql
SIGNED INT -2147483648~2147483647
UNSIGNED INT 0~4294967295
```

**c. Với data giá trị nhỏ (như age, status như 0/1) ưu tiên dùng kiểu TINYINT.**

### Tránh dùng data type TEXT, BLOB — kiểu TEXT phổ biến nhất có thể lưu 64K data

**a. Khuyến nghị tách cột BLOB hoặc TEXT ra bảng extension riêng biệt.**

MySQL memory temporary table không hỗ trợ data type lớn như TEXT, BLOB. Nếu query chứa data như vậy, trong thao tác sort v.v. không thể dùng memory temporary table mà phải dùng disk temporary table. Và với data như vậy MySQL còn phải query thêm lần nữa, khiến SQL performance rất kém. Nhưng không có nghĩa là tuyệt đối không thể dùng.

Nếu nhất thiết phải dùng, khuyến nghị tách cột BLOB hoặc TEXT ra bảng extension riêng biệt. Khi query nhất thiết không dùng `SELECT *` mà chỉ lấy các column cần thiết, không query cột TEXT khi không cần data đó.

**2. Kiểu TEXT hoặc BLOB chỉ có thể dùng prefix index**

Vì MySQL có giới hạn về độ dài field index, nên TEXT type chỉ có thể dùng prefix index. Và column TEXT không thể có default value.

### Tránh dùng kiểu ENUM

- Modify ENUM value cần dùng ALTER statement.
- Operation ORDER BY trên ENUM type hiệu quả thấp, cần thêm thao tác.
- Data type ENUM có một số hạn chế, ví dụ khuyến nghị không dùng số làm enum value của ENUM.

Đọc liên quan: [Có nên dùng kiểu enum của MySQL không? - Architecture Digest - Zhihu](https://www.zhihu.com/question/404422255/answer/1661698499).

### Cố gắng định nghĩa tất cả column là NOT NULL

Trừ khi có lý do đặc biệt để dùng giá trị NULL, nếu không nên luôn giữ field là NOT NULL.

- Index NULL column cần thêm space để lưu, nên chiếm nhiều không gian hơn.
- Khi so sánh và tính toán cần xử lý đặc biệt với giá trị NULL.

Đọc liên quan: [Chia sẻ kỹ thuật | MySQL default value selection (NULL hay empty)](https://opensource.actionsky.com/20190710-mysql/).

### Tuyệt đối không dùng string để lưu ngày tháng

Với date type, tuyệt đối không dùng string để lưu. Có thể cân nhắc DATETIME, TIMESTAMP và numeric timestamp.

Ba cách đều có ưu điểm riêng, chọn cái phù hợp nhất với tình huống thực tế mới là đúng. Dưới đây so sánh đơn giản ba cách để chọn đúng data type lưu thời gian:

| Kiểu              | Storage space | Date format                    | Date range                                                  | Có timezone không |
| ----------------- | ------------- | ------------------------------ | ----------------------------------------------------------- | ----------------- |
| DATETIME          | 5~8 byte      | YYYY-MM-DD hh:mm:ss[.fraction] | 1000-01-01 00:00:00[.000000] ~ 9999-12-31 23:59:59[.999999] | Không             |
| TIMESTAMP         | 4~7 byte      | YYYY-MM-DD hh:mm:ss[.fraction] | 1970-01-01 00:00:01[.000000] ~ 2038-01-19 03:14:07[.999999] | Có                |
| Numeric timestamp | 4 byte        | Số thuần như 1578707612        | Thời gian sau 1970-01-01 00:00:01                           | Không             |

Giới thiệu chi tiết về chọn MySQL time type xem bài: [Khuyến nghị lưu trữ kiểu thời gian MySQL](https://javaguide.cn/database/mysql/some-thoughts-on-database-storage-time.html).

### Dữ liệu tiền tệ liên quan đến tài chính nhất thiết phải dùng kiểu decimal

- **Non-precise float**: float, double
- **Precise float**: decimal

Kiểu decimal là precise float — khi tính toán không mất precision. Không gian chiếm dụng được quyết định bởi width được định nghĩa — mỗi 4 byte có thể lưu 9 chữ số, và dấu thập phân chiếm 1 byte. Hơn nữa decimal có thể dùng để lưu integer data lớn hơn bigint.

Tuy nhiên, vì decimal cần thêm không gian và overhead tính toán, chỉ nên dùng decimal khi cần tính toán chính xác với data.

### Không để single table chứa quá nhiều field

Nếu một bảng chứa quá nhiều field, có thể cân nhắc chia thành nhiều bảng. Khi cần thiết thêm intermediate table để associate.

## Quy chuẩn thiết kế Index

### Giới hạn số lượng index trên mỗi bảng, khuyến nghị không quá 5 index trên single table

Index càng nhiều không hẳn càng tốt! Index có thể tăng efficiency, đồng thời cũng có thể giảm efficiency.

Index có thể tăng query efficiency nhưng đồng thời cũng giảm insert và update efficiency, thậm chí trong một số tình huống giảm cả query efficiency.

Vì MySQL optimizer khi chọn cách tối ưu query, sẽ đánh giá mọi index có thể dùng được dựa trên thông tin thống nhất để tạo ra execution plan tốt nhất. Nếu có rất nhiều index có thể dùng cho query cùng lúc, sẽ tăng thời gian MySQL optimizer tạo execution plan, đồng thời giảm query performance.

### Cấm dùng fulltext index

Fulltext index không phù hợp với tình huống OLTP.

### Cấm tạo single index riêng biệt cho mỗi column trong bảng

Trước version 5.6, một SQL chỉ dùng được một index của bảng. Từ 5.6, dù đã có optimization method merge index, nhưng vẫn kém hơn nhiều so với cách query dùng composite index.

### Mỗi bảng InnoDB phải có primary key

InnoDB là loại index-organized table: thứ tự logic lưu trữ data và thứ tự index là giống nhau. Mỗi bảng có thể có nhiều index nhưng chỉ có một thứ tự lưu trữ bảng.

InnoDB tổ chức bảng theo thứ tự primary key index.

- Không dùng column cập nhật thường xuyên làm primary key, không dùng composite primary key (tương đương composite index).
- Không dùng UUID, MD5, HASH, string column làm primary key (không đảm bảo data tăng theo thứ tự).
- Primary key nên dùng auto-increment ID value.

### Gợi ý column index phổ biến

- Column trong mệnh đề WHERE của câu SELECT, UPDATE, DELETE.
- Field trong ORDER BY, GROUP BY, DISTINCT.
- Không tạo single index cho tất cả field thỏa điều kiện 1 và 2 — thường tạo composite index cho field trong 1, 2 hiệu quả hơn.
- Associate column của multi-table JOIN.

### Cách chọn thứ tự column index

Mục đích tạo index là muốn dùng index để data lookup, giảm random I/O, tăng query performance. Index filter được ít data hơn thì data đọc từ disk cũng ít hơn.

- **Column có cardinality cao nhất đặt ở bên trái nhất của composite index**: Đây là nguyên tắc quan trọng nhất. Cardinality càng cao, data lọc qua index càng ít và I/O càng ít. Cách tính cardinality là `count(distinct column) / count(*)`.
- **Column được dùng thường xuyên nhất đặt ở bên trái của composite index**: Điều này phù hợp với leftmost prefix matching principle. Đặt column query condition thường dùng nhất ở bên trái có thể tận dụng index tối đa.
- **Độ dài field**: Độ dài field ảnh hưởng rất ít đến non-leaf node của composite index vì nó lưu tất cả giá trị field composite index. Độ dài field chủ yếu ảnh hưởng đến storage space của primary key và field trong các index khác, và kích thước leaf node của các index đó. Do đó khi chọn thứ tự column composite index, priority của độ dài field là thấp nhất. Với primary key và field trong các index khác, chọn độ dài field ngắn hơn có thể tiết kiệm storage space và cải thiện I/O performance.

### Tránh tạo redundant index và duplicate index (tăng thời gian query optimizer tạo execution plan)

- Ví dụ duplicate index: primary key(id), index(id), unique index(id).
- Ví dụ redundant index: index(a,b,c), index(a,b), index(a).

### Với query thường xuyên, ưu tiên cân nhắc dùng covering index

> Covering index: Index chứa tất cả query field (field trong where, select, order by, group by).

**Lợi ích của covering index**:

- **Tránh secondary lookup trên InnoDB table — tức table lookup**: InnoDB lưu theo thứ tự clustered index. Với InnoDB, secondary index lưu primary key info của row trong leaf node. Nếu dùng secondary index để query data, sau khi tìm được key value tương ứng còn phải query lại qua primary key mới lấy được data thực sự cần. Trong covering index, secondary index key value có thể lấy được tất cả data, tránh secondary query theo primary key (table lookup), giảm I/O, tăng query efficiency.
- **Có thể chuyển random I/O thành sequential I/O, tăng tốc query**: Vì covering index được lưu theo thứ tự key value, với IO-intensive range query, I/O ít hơn nhiều so với đọc random từng row data từ disk. Do đó dùng covering index khi truy cập cũng có thể chuyển random read disk I/O thành sequential I/O của index lookup.

---

### Quy chuẩn SET index

**Cố gắng tránh dùng foreign key constraint**

- Không khuyến nghị dùng foreign key constraint, nhưng nhất định phải tạo index trên associate key giữa các bảng.
- Foreign key có thể đảm bảo referential integrity của data, nhưng khuyến nghị triển khai ở business side.
- Foreign key ảnh hưởng đến write operation của parent table và child table từ đó giảm performance.

## Quy chuẩn phát triển SQL của Database

### Cố gắng không tính toán trong database, tính toán phức tạp cần chuyển sang application

Cố gắng không tính toán trong database, tính toán phức tạp cần chuyển sang business application. Như vậy tránh được database quá tải, ảnh hưởng đến performance và ổn định. Chức năng chính của database là lưu trữ và quản lý data chứ không phải xử lý data.

### Tối ưu câu SQL ảnh hưởng lớn đến performance

Tìm câu SQL cần tối ưu nhất. Hoặc là câu lệnh được dùng thường xuyên nhất, hoặc là câu lệnh cải thiện rõ ràng nhất sau tối ưu. Có thể query slow query log của MySQL để tìm câu SQL cần tối ưu.

### Tận dụng đầy đủ index đã có trên bảng

Tránh dùng điều kiện query có ký tự `%` ở cả hai đầu. Ví dụ: `a like '%123%'` (nếu không có prefix %, chỉ có suffix %, vẫn có thể dùng index trên column).

Một SQL chỉ có thể dùng một column của composite index để range query. Ví dụ: có composite index của cột a, b, c — nếu trong điều kiện query có range query trên cột a thì index trên cột b, c sẽ không được dùng.

Khi định nghĩa composite index, nếu cột a cần range query thì đặt cột a ở bên phải composite index. Dùng left join hoặc not exists để tối ưu thao tác not in vì not in thường cũng làm index invalid.

### Cấm dùng `SELECT *`, phải dùng `SELECT <field list>` để query

- `SELECT *` tiêu tốn nhiều CPU hơn.
- `SELECT *` field không cần dùng tăng network bandwidth resource consumption, tăng thời gian data transmission, đặc biệt với large field (như varchar, blob, text).
- `SELECT *` không thể dùng tối ưu covering index của MySQL optimizer (chiến lược "covering index" dựa trên MySQL optimizer là cách tối ưu query nhanh nhất, hiệu quả nhất và được industry khuyến nghị nhất).
- `SELECT <field list>` có thể giảm ảnh hưởng của thay đổi table structure.

### Cấm dùng câu INSERT không có field list

**Không khuyến nghị**:

```sql
insert into t values ('a','b','c');
```

**Khuyến nghị**:

```sql
insert into t(c1,c2,c3) values ('a','b','c');
```

### Khuyến nghị dùng prepared statement cho database operation

- Prepared statement có thể tái sử dụng các plan đó, giảm thời gian SQL compile. Còn có thể giải quyết vấn đề SQL injection do dynamic SQL gây ra.
- Chỉ truyền tham số — hiệu quả hơn truyền SQL statement.
- Cùng statement có thể parse một lần, dùng nhiều lần, tăng processing efficiency.

### Tránh implicit type conversion của data type

Implicit conversion gây index invalidation:

```sql
select name,phone from customer where id = '111';
```

Chi tiết xem bài: [Implicit Conversion trong MySQL gây Index Invalidation](./index-invalidation-caused-by-implicit-conversion.md).

### Tránh dùng subquery — có thể tối ưu subquery thành JOIN operation

Thường chỉ khi subquery ở trong mệnh đề in và subquery là SQL đơn giản (không chứa union, group by, order by, limit) mới có thể convert subquery thành associated query để tối ưu.

**Nguyên nhân subquery hiệu năng kém**: Result set của subquery không thể dùng index. Thường result set của subquery được lưu vào temporary table. Dù là memory temporary table hay disk temporary table đều không có index nên query performance sẽ bị ảnh hưởng nhất định. Đặc biệt với subquery có result set lớn, ảnh hưởng đến query performance càng lớn. Vì subquery tạo ra nhiều temporary table và không có index, sẽ tiêu tốn quá nhiều CPU và IO resource, gây nhiều slow query.

### Tránh JOIN quá nhiều bảng

Với MySQL, có join cache. Kích thước cache có thể cấu hình qua tham số `join_buffer_size`.

Trong MySQL, mỗi khi JOIN thêm một bảng trong cùng SQL, sẽ cấp phát thêm một join cache. Càng JOIN nhiều bảng trong SQL, memory chiếm dụng càng lớn.

Nếu trong program dùng nhiều multi-table JOIN và `join_buffer_size` không cấu hình hợp lý, dễ gây server memory overflow ảnh hưởng đến ổn định hiệu năng database server.

Đồng thời JOIN operation sẽ tạo temporary table ảnh hưởng đến query efficiency. MySQL cho phép tối đa 61 bảng JOIN — khuyến nghị không vượt quá 5.

### Giảm số lần tương tác với database

Database phù hợp hơn với xử lý batch. Gộp nhiều thao tác giống nhau lại với nhau có thể tăng processing efficiency.

### Với OR judgment trên cùng column, dùng IN thay vì OR

Giá trị của IN không vượt quá 500. IN operation có thể tận dụng index hiệu quả hơn. OR trong hầu hết tình huống ít tận dụng được index.

### Cấm dùng ORDER BY rand() để random sort

ORDER BY rand() sẽ load tất cả data thỏa điều kiện trong bảng vào memory, sau đó sort tất cả data theo giá trị random được tạo ra và có thể tạo giá trị random cho mỗi row. Nếu tập data thỏa điều kiện rất lớn, sẽ tiêu tốn nhiều CPU, IO và memory resource.

Khuyến nghị lấy random value trong program rồi lấy data từ database theo cách đó.

### Cấm thực hiện function conversion và tính toán trên column trong mệnh đề WHERE

Thực hiện function conversion hoặc tính toán trên column sẽ gây không thể dùng index.

**Không khuyến nghị**:

```sql
where date(create_time)='20190101'
```

**Khuyến nghị**:

```sql
where create_time >= '20190101' and create_time < '20190102'
```

### Khi rõ ràng không có duplicate value thì dùng UNION ALL thay vì UNION

- UNION đưa tất cả data của hai result set vào temporary table rồi mới dedup.
- UNION ALL không thực hiện dedup trên result set.

### Tách SQL lớn phức tạp thành nhiều SQL nhỏ

- SQL lớn logic phức tạp cần chiếm nhiều CPU để tính toán.
- Trong MySQL, một SQL chỉ dùng được một CPU để tính toán.
- Sau khi SQL được tách, có thể tăng processing efficiency qua parallel execution.

### Program kết nối database khác nhau dùng account khác nhau, cấm cross-database query

- Để lại chỗ cho database migration và database sharding.
- Giảm business coupling.
- Tránh rủi ro bảo mật do permission quá lớn.

## Quy chuẩn hành vi vận hành Database

### Batch write (UPDATE, DELETE, INSERT) trên hơn 1 triệu row cần chia thành nhiều lần nhỏ

**Batch operation lớn có thể gây master-slave delay nghiêm trọng**

Trong môi trường master-slave, batch operation lớn có thể gây master-slave delay nghiêm trọng. Batch write lớn thường cần thực thi trong khoảng thời gian nhất định. Chỉ khi hoàn thành trên master mới được thực thi trên slave khác, nên gây tình trạng delay lâu giữa master và slave.

**binlog log ở row format sẽ tạo ra lượng lớn log**

Batch write lớn tạo ra lượng lớn log, đặc biệt với binary data ở row format. Vì trong row format ghi lại modification của mỗi row data. Chúng ta modify càng nhiều data thì log tạo ra càng nhiều, thời gian cần để transmission và recovery log càng dài — đây cũng là một nguyên nhân gây master-slave delay.

**Tránh tạo large transaction operation**

Modify data hàng loạt nhất định diễn ra trong một transaction, khiến lượng lớn data trong bảng bị lock, dẫn đến nhiều blocking. Blocking ảnh hưởng rất lớn đến MySQL performance.

Đặc biệt blocking kéo dài sẽ chiếm hết tất cả available connection của database, khiến các application khác trong production không kết nối được database. Vì vậy nhất định phải chú ý batch write lớn cần chia thành nhiều batch.

### Với bảng lớn dùng pt-online-schema-change để modify table structure

- Tránh master-slave delay do modify bảng lớn.
- Tránh lock bảng khi modify table field.

Modify data structure của bảng lớn phải thận trọng — sẽ gây lock bảng nghiêm trọng, đặc biệt trong production không thể chấp nhận.

pt-online-schema-change trước tiên tạo bảng mới có cùng structure với bảng gốc, thực hiện modify table structure trên bảng mới, sau đó copy data từ bảng gốc vào bảng mới và thêm một số trigger trên bảng gốc. Copy data mới thêm trong bảng gốc vào bảng mới cũng. Sau khi tất cả data được copy xong, đặt tên bảng mới theo tên bảng gốc và xóa bảng cũ. Chia một thao tác DDL thành nhiều batch nhỏ.

### Cấm cấp quyền super cho account dùng bởi program

- Khi đạt giới hạn max connection, vẫn cho phép 1 user có quyền super kết nối.
- Quyền super chỉ dành cho account DBA dùng để xử lý vấn đề.

### Với account database dùng bởi program, tuân theo nguyên tắc least privilege

- Account database dùng bởi program chỉ được dùng trong một DB, không được dùng cross-database.
- Account dùng bởi program về nguyên tắc không được có quyền drop.

## Đọc thêm

- [Quy chuẩn thiết kế MySQL bắt buộc phải biết cho technical, đều là bài học đau thương - Alibaba Developer](https://mp.weixin.qq.com/s/XC8e5iuQtfsrEOERffEZ-Q)
- [Nói về 15 mẹo nhỏ khi tạo bảng database](https://mp.weixin.qq.com/s/NM-aHaW6TXrnO6la6Jfl5A)
