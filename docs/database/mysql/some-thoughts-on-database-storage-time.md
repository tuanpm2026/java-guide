---
title: Khuyến nghị chọn kiểu dữ liệu ngày tháng trong MySQL
description: So sánh sâu sự khác biệt giữa DATETIME và TIMESTAMP trong MySQL, phân tích các điểm khác nhau về xử lý timezone, không gian lưu trữ, phạm vi giá trị, đưa ra khuyến nghị best practice khi chọn kiểu dữ liệu ngày tháng.
category: Cơ sở dữ liệu
tag:
  - MySQL
head:
  - - meta
    - name: keywords
      content: MySQL lưu trữ thời gian,DATETIME,TIMESTAMP,timestamp,xử lý timezone,chọn kiểu dữ liệu ngày tháng,MySQL date functions
---

Trong công việc phát triển phần mềm hàng ngày, lưu trữ thời gian là một nhu cầu cơ bản và phổ biến. Dù là ghi lại thời gian thao tác dữ liệu, thời gian xảy ra giao dịch tài chính, thời gian khởi hành, thời gian đặt hàng của user, v.v. — thông tin thời gian gắn chặt với logic nghiệp vụ và chức năng hệ thống. Do đó, chọn và dùng đúng kiểu datetime trong MySQL là vô cùng quan trọng — sự phù hợp có thể ảnh hưởng đáng kể đến tính chính xác của nghiệp vụ và sự ổn định của hệ thống.

Bài này nhằm giúp developer xem xét lại và hiểu sâu hơn các cách lưu trữ thời gian khác nhau trong MySQL để đưa ra lựa chọn phù hợp hơn với tình huống nghiệp vụ của dự án.

## Không dùng String để lưu ngày tháng

Giống nhiều người mới bắt đầu học database, tôi cũng đã thử dùng kiểu string (như VARCHAR) để lưu ngày và giờ trong giai đoạn học ban đầu, thậm chí từng cho đây là cách đơn giản và trực quan. Xét cho cùng, format như 'YYYY-MM-DD HH:MM:SS' trông khá rõ ràng dễ hiểu.

Nhưng đây là cách làm không đúng, chủ yếu có hai vấn đề sau:

1. **Hiệu quả không gian**: So với kiểu datetime nội tại của MySQL, string thường cần nhiều dung lượng lưu trữ hơn để biểu thị cùng một thông tin thời gian.
2. **Query và tính toán kém hiệu quả**:
   - **So sánh phức tạp và kém hiệu quả**: So sánh ngày tháng dạng string phải theo thứ tự từ điển từng ký tự — không trực quan (ví dụ '2024-05-01' sẽ nhỏ hơn '2024-1-10') và hiệu quả thấp hơn nhiều so với so sánh dạng số hoặc time point dùng kiểu datetime gốc.
   - **Tính toán bị hạn chế**: Không thể trực tiếp dùng các function datetime phong phú của database để tính toán (như tính khoảng cách giữa hai ngày, cộng/trừ ngày tháng) mà cần chuyển đổi format trước, tăng độ phức tạp.
   - **Hiệu năng index kém**: Index dạng string khi xử lý range query (như tìm dữ liệu trong khoảng thời gian nhất định) thường kém hiệu quả và linh hoạt hơn so với index kiểu datetime gốc.

## Chọn DATETIME hay TIMESTAMP?

`DATETIME` và `TIMESTAMP` là hai kiểu dữ liệu rất phổ biến trong MySQL dùng để lưu thông tin ngày và giờ. Cả hai đều có thể lưu giá trị thời gian chính xác đến giây (MySQL 5.6.4+ hỗ trợ fractional seconds độ chính xác cao hơn). Vậy trong thực tế nên chọn cái nào?

Dưới đây so sánh từ một số chiều quan trọng:

### Thông tin timezone

`DATETIME` lưu **giá trị ngày và giờ theo nghĩa đen**, bản thân nó **không chứa bất kỳ thông tin timezone nào**. Khi insert một giá trị `DATETIME`, MySQL lưu đúng thời gian bạn cung cấp mà không thực hiện bất kỳ chuyển đổi timezone nào.

**Điều này gây ra vấn đề gì?** Nếu ứng dụng cần hỗ trợ nhiều timezone, hoặc timezone của server/client có thể thay đổi, thì khi dùng `DATETIME`, ứng dụng cần tự xử lý chuyển đổi và diễn giải timezone. Nếu xử lý không đúng (ví dụ giả sử tất cả thời gian lưu đều thuộc cùng timezone nhưng môi trường thực tế thay đổi), có thể gây nhầm lẫn khi hiển thị hoặc tính toán thời gian.

**`TIMESTAMP` liên quan đến timezone**. Khi lưu, MySQL chuyển đổi giá trị thời gian trong timezone của session hiện tại sang UTC (Coordinated Universal Time) để lưu nội bộ. Khi query field `TIMESTAMP`, MySQL lại chuyển đổi thời gian UTC đã lưu về timezone được set cho session hiện tại để hiển thị.

Điều này có nghĩa là với cùng một field `TIMESTAMP` của một record, khi query trong các timezone session khác nhau có thể thấy biểu diễn giờ địa phương khác nhau, nhưng tất cả đều tương ứng với cùng một thời điểm tuyệt đối (UTC time). Điều này rất hữu ích cho các ứng dụng cần hỗ trợ global hóa, đa timezone.

Minh họa thực tế!

SQL tạo bảng:

```sql
CREATE TABLE `time_zone_test` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `date_time` datetime DEFAULT NULL,
  `time_stamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

Insert một record (giả sử timezone session hiện tại là system default, ví dụ UTC+0):

```sql
INSERT INTO time_zone_test(date_time,time_stamp) VALUES(NOW(),NOW());
```

Query data (trong cùng timezone session):

```sql
SELECT date_time, time_stamp FROM time_zone_test;
```

Kết quả:

```plain
+---------------------+---------------------+
| date_time           | time_stamp          |
+---------------------+---------------------+
| 2020-01-11 09:53:32 | 2020-01-11 09:53:32 |
+---------------------+---------------------+
```

Bây giờ đổi timezone của session hiện tại sang UTC+8:

```sql
SET time_zone = '+8:00';
```

Query data lần nữa:

```bash
# Giá trị TIMESTAMP tự động chuyển sang giờ UTC+8
+---------------------+---------------------+
| date_time           | time_stamp          |
+---------------------+---------------------+
| 2020-01-11 09:53:32 | 2020-01-11 17:53:32 |
+---------------------+---------------------+
```

**Mở rộng: Các SQL command MySQL timezone thường dùng**

```sql
# Xem timezone của session hiện tại
SELECT @@session.time_zone;
# Đặt timezone session hiện tại
SET time_zone = 'Europe/Helsinki';
SET time_zone = "+00:00";
# Xem timezone global của database
SELECT @@global.time_zone;
# Đặt timezone global
SET GLOBAL time_zone = '+8:00';
SET GLOBAL time_zone = 'Europe/Helsinki';
```

### Không gian lưu trữ

Hình dưới là không gian lưu trữ mà các kiểu ngày tháng MySQL chiếm dụng (link tài liệu chính thức: <https://dev.mysql.com/doc/refman/8.0/en/storage-requirements.html>):

![](/images/github/javaguide/FhRGUVHFK0ujRPNA75f6CuOXQHTE.jpeg)

Trước MySQL 5.6.4, không gian lưu trữ của DateTime và TIMESTAMP là cố định, lần lượt là 8 byte và 4 byte. Nhưng từ MySQL 5.6.4, không gian lưu trữ sẽ thay đổi theo độ chính xác millisecond. DateTime từ 5 đến 8 byte, TIMESTAMP từ 4 đến 7 byte.

### Phạm vi biểu thị

`TIMESTAMP` có phạm vi thời gian biểu thị nhỏ hơn, chỉ đến năm 2038:

- `DATETIME`: '1000-01-01 00:00:00.000000' đến '9999-12-31 23:59:59.999999'
- `TIMESTAMP`: '1970-01-01 00:00:01.000000' UTC đến '2038-01-19 03:14:07.999999' UTC

### Hiệu năng

Vì `TIMESTAMP` cần thực hiện chuyển đổi UTC và timezone session hiện tại khi lưu và retrieve, quá trình này có thể có overhead tính toán thêm — đặc biệt khi cần gọi interface tầng dưới OS để lấy hoặc xử lý thông tin timezone. Mặc dù database và OS hiện đại đã tối ưu điều này, nhưng trong một số tình huống cực đoan high concurrency hoặc rất nhạy cảm với latency, `DATETIME` vì không có timezone conversion, xử lý logic đơn giản hơn, có thể thể hiện ưu thế hiệu năng nhỏ.

Để có hành vi có thể dự đoán và giảm overhead conversion của `TIMESTAMP`, best practice là quản lý timezone thống nhất ở tầng ứng dụng, hoặc đặt tường minh tham số `time_zone` ở tầng database connection/session, thay vì phụ thuộc timezone mặc định của server hay OS.

## Numeric timestamp có phải lựa chọn tốt hơn không?

Ngoài hai kiểu trên, trong thực tế cũng thường dùng integer type (`INT` hay `BIGINT`) để lưu "Unix timestamp" (tức tổng số giây hoặc millisecond từ 1970-01-01 00:00:00 UTC đến thời điểm đích).

Cách lưu này có một số ưu điểm của kiểu `TIMESTAMP`, và các thao tác sort và compare ngày tháng dùng nó có efficiency cao hơn. Cross-system cũng tiện vì chỉ là số. Nhược điểm cũng rõ ràng là readability kém — bạn không thể nhìn thẳng ra thời gian cụ thể.

Định nghĩa timestamp:

> Timestamp được định nghĩa bắt đầu từ một thời điểm cơ sở "1970-1-1 00:00:00 +0:00". Từ thời điểm này, dùng integer biểu thị, tính theo giây, integer này liên tục tăng theo thời gian. Như vậy chỉ cần một số là có thể biểu thị thời gian hoàn hảo, và số này là tuyệt đối — bất kể ở góc nào trên trái đất, timestamp biểu thị thời gian này đều giống nhau, số sinh ra đều giống nhau, không có khái niệm timezone. Do đó trong truyền thông tin thời gian trong hệ thống không cần chuyển đổi thêm, chỉ khi hiển thị cho user mới chuyển sang format string theo giờ địa phương.

Thao tác thực tế trong database:

```sql
-- Chuyển datetime string sang Unix timestamp (giây)
mysql> SELECT UNIX_TIMESTAMP('2020-01-11 09:53:32');
+---------------------------------------+
| UNIX_TIMESTAMP('2020-01-11 09:53:32') |
+---------------------------------------+
|                            1578707612 |
+---------------------------------------+
1 row in set (0.00 sec)

-- Chuyển Unix timestamp (giây) sang datetime format
mysql> SELECT FROM_UNIXTIME(1578707612);
+---------------------------+
| FROM_UNIXTIME(1578707612) |
+---------------------------+
| 2020-01-11 09:53:32       |
+---------------------------+
1 row in set (0.01 sec)
```

## PostgreSQL không có DATETIME

Vì có reader đề cập đến kiểu thời gian trong PostgreSQL (PG), nên bổ sung thêm tại đây. Link tài liệu chính thức PG về kiểu thời gian: <https://www.postgresql.org/docs/current/datatype-datetime.html>.

![Tổng kết kiểu thời gian PostgreSQL](/images/github/javaguide/mysql/pg-datetime-types.png)

Có thể thấy PG không có kiểu tên là `DATETIME`:

- `TIMESTAMP WITHOUT TIME ZONE` của PG về mặt chức năng gần nhất với `DATETIME` của MySQL. Nó lưu ngày và giờ nhưng không chứa thông tin timezone, lưu giá trị theo nghĩa đen.
- `TIMESTAMP WITH TIME ZONE` (hay `TIMESTAMPTZ`) của PG tương đương với `TIMESTAMP` của MySQL. Khi lưu sẽ chuyển đổi giá trị input sang UTC, và khi retrieve sẽ convert và hiển thị theo timezone của session hiện tại.

Với hầu hết các tình huống ứng dụng cần ghi lại thời điểm xảy ra chính xác, `TIMESTAMPTZ` là lựa chọn được khuyến nghị và mạnh mẽ nhất trong PostgreSQL vì nó xử lý tốt nhất sự phức tạp về timezone.

## Tổng kết

Lưu thời gian trong MySQL như thế nào mới tốt? `DATETIME`? `TIMESTAMP`? Hay numeric timestamp?

Không có silver bullet. Nhiều developer thấy numeric timestamp thực sự tốt — hiệu quả cao và tương thích mọi thứ. Nhưng nhiều người khác lại thấy nó không đủ trực quan.

Tác giả cuốn sách kinh điển 《High Performance MySQL》 khuyến nghị TIMESTAMP với lý do biểu thị thời gian bằng số không đủ trực quan. Đây là nguyên văn:

<img src="/images/github/javaguide/%E9%AB%98%E6%80%A7%E8%83%BDmysql-%E4%B8%8D%E6%8E%A8%E8%8D%90%E7%94%A8%E6%95%B0%E5%80%BC%E6%97%B6%E9%97%B4%E6%88%B3.jpg" style="zoom:50%;" />

Mỗi cách đều có ưu điểm riêng — chọn cái phù hợp nhất với tình huống thực tế mới là đúng đắn. Dưới đây so sánh đơn giản ba cách này để các bạn chọn đúng kiểu dữ liệu lưu thời gian trong phát triển thực tế:

| Kiểu              | Không gian lưu | Format ngày                    | Phạm vi ngày                                                | Có timezone không |
| ----------------- | -------------- | ------------------------------ | ----------------------------------------------------------- | ----------------- |
| DATETIME          | 5~8 byte       | YYYY-MM-DD hh:mm:ss[.fraction] | 1000-01-01 00:00:00[.000000] ~ 9999-12-31 23:59:59[.999999] | Không             |
| TIMESTAMP         | 4~7 byte       | YYYY-MM-DD hh:mm:ss[.fraction] | 1970-01-01 00:00:01[.000000] ~ 2038-01-19 03:14:07[.999999] | Có                |
| Numeric timestamp | 4 byte         | Số thuần như 1578707612        | Thời gian sau 1970-01-01 00:00:01                           | Không             |

**Tóm tắt khuyến nghị chọn:**

- Ưu thế cốt lõi của `TIMESTAMP` là khả năng xử lý timezone tích hợp sẵn. Database chịu trách nhiệm lưu UTC và tự động convert theo timezone session, đơn giản hóa phát triển ứng dụng cần xử lý đa timezone. Nếu ứng dụng cần xử lý đa timezone hoặc muốn database tự quản lý timezone conversion, `TIMESTAMP` là lựa chọn tự nhiên (chú ý giới hạn phạm vi thời gian — tức vấn đề năm 2038).
- Nếu ứng dụng không cần timezone conversion, hoặc muốn ứng dụng hoàn toàn kiểm soát timezone logic, và cần biểu thị thời gian sau năm 2038, `DATETIME` là lựa chọn an toàn hơn.
- Nếu cực kỳ quan tâm đến hiệu năng so sánh, hoặc thường xuyên truyền dữ liệu thời gian qua hệ thống, và có thể chấp nhận hi sinh readability (hoặc luôn convert ở tầng ứng dụng), numeric timestamp là lựa chọn mạnh mẽ.

<!-- @include: @article-footer.snippet.md -->
