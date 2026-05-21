---
title: Tổng hợp các câu hỏi phỏng vấn MySQL thường gặp
description: Giải thích chuyên sâu các câu hỏi phỏng vấn MySQL tần suất cao: kiến trúc cơ bản, engine InnoDB, nguyên lý index, B+tree, ACID của transaction, MVCC, redo/undo/binlog log, row lock/table lock, tối ưu hóa slow query - tất cả trong một bài viết!
category: Cơ sở dữ liệu
tag:
  - MySQL
  - Phỏng vấn công ty lớn
head:
  - - meta
    - name: keywords
      content: MySQL面试题,MySQL基础架构,InnoDB存储引擎,MySQL索引,B+树索引,事务隔离级别,redo log,undo log,binlog,MVCC,行级锁,慢查询优化
---

<!-- @include: @small-advertisement.snippet.md -->

## Kiến thức cơ bản về MySQL

### Cơ sở dữ liệu quan hệ là gì?

Đúng như tên gọi, cơ sở dữ liệu quan hệ (RDB, Relational Database) là một loại cơ sở dữ liệu được xây dựng trên nền tảng mô hình quan hệ. Mô hình quan hệ mô tả mối liên kết giữa các dữ liệu được lưu trữ trong cơ sở dữ liệu (một-một, một-nhiều, nhiều-nhiều).

Trong cơ sở dữ liệu quan hệ, dữ liệu của chúng ta được lưu trữ trong các bảng (ví dụ: bảng người dùng), mỗi hàng trong bảng chứa một bản ghi dữ liệu (ví dụ: thông tin của một người dùng).

![Mối quan hệ bảng trong cơ sở dữ liệu quan hệ](https://oss.javaguide.cn/java-guide-blog/5e3c1a71724a38245aa43b02_99bf70d46cc247be878de9d3a88f0c44.png)

Hầu hết các cơ sở dữ liệu quan hệ đều sử dụng SQL để thao tác dữ liệu. Đồng thời, hầu hết các cơ sở dữ liệu quan hệ đều hỗ trợ bốn đặc tính của transaction (ACID).

**Các cơ sở dữ liệu quan hệ phổ biến là gì?**

MySQL, PostgreSQL, Oracle, SQL Server, SQLite (bộ nhớ lưu trữ lịch sử chat cục bộ của WeChat dùng SQLite)...

### SQL là gì?

SQL là ngôn ngữ truy vấn có cấu trúc (Structured Query Language), được thiết kế riêng để giao tiếp với cơ sở dữ liệu, với mục đích cung cấp một phương thức đơn giản và hiệu quả để đọc và ghi dữ liệu từ cơ sở dữ liệu.

Hầu hết các cơ sở dữ liệu quan hệ chính thống đều hỗ trợ SQL, tính ứng dụng rất rộng. Ngoài ra, một số cơ sở dữ liệu phi quan hệ cũng tương thích với SQL hoặc sử dụng ngôn ngữ truy vấn tương tự SQL.

SQL có thể giúp chúng ta:

- Tạo cơ sở dữ liệu, bảng, trường;
- Thêm, xóa, sửa, truy vấn dữ liệu trong cơ sở dữ liệu;
- Tạo view, function, stored procedure;
- Thực hiện phân tích dữ liệu đơn giản trên dữ liệu trong cơ sở dữ liệu;
- Kết hợp với Hive, Spark SQL để xử lý big data;
- Kết hợp với SQLFlow để làm machine learning;
- ...

### MySQL là gì?

![](https://oss.javaguide.cn/github/javaguide/csdn/20210327143351823.png)

**MySQL là một cơ sở dữ liệu quan hệ, chủ yếu được dùng để lưu trữ bền vững một số dữ liệu trong hệ thống của chúng ta, ví dụ như thông tin người dùng.**

Do MySQL là cơ sở dữ liệu mã nguồn mở, miễn phí và khá hoàn thiện, MySQL được sử dụng rộng rãi trong nhiều hệ thống. Bất kỳ ai cũng có thể tải xuống theo giấy phép GPL (General Public License) và tùy chỉnh theo nhu cầu cá nhân. Cổng mặc định của MySQL là **3306**.

### ⭐️MySQL có những ưu điểm gì?

Câu hỏi này về bản chất đang hỏi tại sao MySQL lại phổ biến đến vậy.

Sự thành công của MySQL có thể được quy cho lợi thế tổng hợp trên ba phương diện: **hệ sinh thái, tính năng và vận hành**.

**Thứ nhất, nhìn từ góc độ hệ sinh thái và chi phí, hào lũy cạnh tranh của nó rất sâu.**

- **Mã nguồn mở, miễn phí:** Đây là nền tảng giúp nó được phổ biến rộng rãi. Bất kỳ công ty và cá nhân nào đều có thể sử dụng miễn phí, giảm đáng kể ngưỡng kỹ thuật và chi phí ban đầu.
- **Cộng đồng lớn, hệ sinh thái hoàn thiện:** Sau nhiều thập kỷ phát triển, MySQL có cộng đồng cực kỳ năng động và hệ sinh thái phong phú. Điều này có nghĩa là dù bạn gặp vấn đề gì, hầu như đều có thể tìm thấy giải pháp trên mạng; đồng thời tất cả các ngôn ngữ lập trình, framework, công cụ ORM, hệ thống giám sát chính thống đều có hỗ trợ hoàn hảo cho MySQL. Tài liệu của nó cũng rất phong phú, tài nguyên học tập dễ dàng tiếp cận.

**Thứ hai, nhìn từ góc độ tính năng kỹ thuật cốt lõi, nó rất mạnh mẽ và cân bằng.**

- **Hỗ trợ transaction mạnh mẽ:** Đây là nền tảng tồn tại của nó với tư cách là cơ sở dữ liệu quan hệ. Đáng chú ý là mức cô lập mặc định REPEATABLE-READ (đọc lặp lại) của InnoDB, thông qua cơ chế MVCC và Next-Key Lock, phần lớn tránh được vấn đề phantom read - điều mà nhiều cơ sở dữ liệu khác cần mức cô lập cao hơn mới đạt được, cân bằng giữa hiệu suất và tính nhất quán. Để biết thêm chi tiết, có thể đọc bài viết này: [Giải thích chi tiết mức cô lập transaction MySQL](https://javaguide.cn/database/mysql/transaction-isolation-level.html).
- **Hiệu suất và khả năng mở rộng xuất sắc:** MySQL đã được kiểm chứng qua lượng lớn nghiệp vụ internet, hiệu suất single-node rất tốt. Quan trọng hơn, xoay quanh khả năng mở rộng ngang, nó đã hình thành một bộ giải pháp kiến trúc rất hoàn thiện, như replication chủ-phụ, phân tách đọc-ghi, và phân tách database/bảng thông qua middleware. Điều này cho phép nó hỗ trợ nghiệp vụ từ quy mô startup đến nền tảng internet lớn.

**Thứ ba, nhìn từ góc độ vận hành và sử dụng, nó rất "thân thiện".**

- **Dùng được ngay, dễ bắt đầu:** So với các cơ sở dữ liệu thương mại lớn như Oracle, việc cài đặt, cấu hình và sử dụng hàng ngày của MySQL rất đơn giản và trực quan, đường học tập thoải mái, rất thân thiện với developer và DBA mới vào nghề.
- **Chi phí bảo trì thấp:** Do tính đơn giản và cộng đồng lớn, việc tìm kiếm nhân lực vận hành và giải pháp liên quan tương đối dễ dàng, tổng chi phí bảo trì cũng thấp hơn.

Đáng chú ý là trong vài năm gần đây, PostgreSQL đang phát triển rất mạnh mẽ, thậm chí vượt qua MySQL. Trên mạng xuất hiện nhiều bài viết chỉ trích, phê phán MySQL, nhưng tôi cho rằng bất kỳ hành vi nào mù quáng chỉ trích bên này hoặc tâng bốc bên kia đều không đúng đắn.

Tôi cũng đã viết một bài chia sẻ quan điểm về hai đại diện cơ sở dữ liệu quan hệ này, bạn có thể tham khảo: [MySQL bị đánh bật xuống hạng hai?](https://mp.weixin.qq.com/s/APWD-PzTcTqGUuibAw7GGw)

## Kiểu dữ liệu trường MySQL

Kiểu dữ liệu trường MySQL có thể chia đơn giản thành ba loại lớn:

- **Kiểu số**: Kiểu nguyên (TINYINT, SMALLINT, MEDIUMINT, INT và BIGINT), kiểu dấu phẩy động (FLOAT và DOUBLE), kiểu dấu phẩy cố định (DECIMAL), kiểu dữ liệu bit (BIT)
- **Kiểu chuỗi**: CHAR, VARCHAR, TINYTEXT, TEXT, MEDIUMTEXT, LONGTEXT, BINARY, TINYBLOB, BLOB, MEDIUMBLOB và LONGBLOB, thường dùng nhất là CHAR và VARCHAR.
- **Kiểu ngày giờ**: YEAR, TIME, DATE, DATETIME và TIMESTAMP, v.v.

Hình dưới đây không phải do tôi vẽ, quên mất đã lưu từ đâu, nhưng tóm tắt khá tốt.

![Tổng hợp các kiểu trường MySQL thường gặp](https://oss.javaguide.cn/github/javaguide/mysql/summary-of-mysql-field-types.png)

Kiểu trường MySQL khá nhiều, ở đây tôi sẽ chọn một số kiểu trường được dùng thường xuyên trong phát triển hàng ngày và hay được hỏi trong phỏng vấn, trình bày chi tiết dưới dạng câu hỏi phỏng vấn. Trừ khi có ghi chú đặc biệt, tất cả đều liên quan đến storage engine InnoDB.

Ngoài ra, nên đọc chương 4 của "High Performance MySQL (Phiên bản 3)" để biết thêm về tối ưu hóa kiểu trường MySQL.

### ⭐️Thuộc tính UNSIGNED của kiểu số nguyên có tác dụng gì?

Các kiểu số nguyên trong MySQL có thể sử dụng thuộc tính UNSIGNED tùy chọn để biểu thị số nguyên không dấu không cho phép giá trị âm. Sử dụng thuộc tính UNSIGNED có thể tăng gấp đôi giới hạn trên của số nguyên dương, vì nó không cần lưu trữ giá trị âm.

Ví dụ, phạm vi giá trị của kiểu TINYINT UNSIGNED là 0 ~ 255, trong khi kiểu TINYINT thông thường có phạm vi -128 ~ 127. Phạm vi giá trị của kiểu INT UNSIGNED là 0 ~ 4,294,967,295, trong khi kiểu INT thông thường có phạm vi -2,147,483,648 ~ 2,147,483,647.

Đối với cột ID tăng dần từ 0, việc sử dụng thuộc tính UNSIGNED rất thích hợp, vì không cho phép giá trị âm và có thể có phạm vi giới hạn trên lớn hơn, cung cấp nhiều giá trị ID hơn.

### Sự khác biệt giữa CHAR và VARCHAR là gì?

CHAR và VARCHAR là các kiểu chuỗi được sử dụng phổ biến nhất, sự khác biệt chính giữa hai loại là: **CHAR là chuỗi có độ dài cố định, VARCHAR là chuỗi có độ dài biến đổi.**

Khi lưu trữ, CHAR sẽ điền khoảng trắng ở bên phải để đạt độ dài chỉ định, khi truy xuất sẽ bỏ khoảng trắng; VARCHAR khi lưu trữ cần dùng thêm 1 hoặc 2 byte để ghi lại độ dài chuỗi, khi truy xuất không cần xử lý.

CHAR phù hợp hơn để lưu trữ chuỗi có độ dài ngắn hoặc tương đương nhau, ví dụ như mật khẩu được mã hóa bằng thuật toán Bcrypt, MD5, số CMND. Kiểu VARCHAR phù hợp để lưu trữ chuỗi có độ dài không xác định hoặc chênh lệch lớn, ví dụ như biệt danh người dùng, tiêu đề bài viết, v.v.

M của CHAR(M) và VARCHAR(M) đều đại diện cho giá trị tối đa số ký tự có thể lưu, dù là chữ cái, số hay tiếng Trung, mỗi ký tự đều chỉ chiếm một ký tự.

### Sự khác biệt giữa VARCHAR(100) và VARCHAR(10) là gì?

VARCHAR(100) và VARCHAR(10) đều là kiểu độ dài biến, biểu thị có thể lưu tối đa 100 ký tự và 10 ký tự. Do đó, VARCHAR(100) có thể đáp ứng nhu cầu lưu trữ ký tự với phạm vi lớn hơn, có tính mở rộng nghiệp vụ tốt hơn. Còn VARCHAR(10) khi lưu trữ hơn 10 ký tự thì cần phải sửa đổi cấu trúc bảng.

Mặc dù VARCHAR(100) và VARCHAR(10) có phạm vi lưu trữ ký tự khác nhau, nhưng khi lưu trữ cùng một chuỗi, không gian lưu trữ trên đĩa thực ra là giống nhau, đây cũng là điều nhiều người dễ hiểu nhầm.

Tuy nhiên, VARCHAR(100) sẽ tiêu tốn nhiều bộ nhớ hơn. Điều này là do khi kiểu VARCHAR vận hành trong bộ nhớ, thường sẽ phân bổ khối bộ nhớ có kích thước cố định để lưu giá trị, tức là sử dụng độ dài được định nghĩa trong kiểu ký tự. Ví dụ khi sắp xếp, VARCHAR(100) được sắp xếp theo độ dài 100, nên sẽ tiêu tốn nhiều bộ nhớ hơn.

### Sự khác biệt giữa DECIMAL và FLOAT/DOUBLE là gì?

Sự khác biệt giữa DECIMAL và FLOAT là: **DECIMAL là số thập phân có điểm cố định, FLOAT/DOUBLE là số dấu phẩy động. DECIMAL có thể lưu trữ giá trị thập phân chính xác, FLOAT/DOUBLE chỉ có thể lưu trữ giá trị thập phân gần đúng.**

DECIMAL được dùng để lưu trữ số thập phân có yêu cầu độ chính xác, ví dụ dữ liệu liên quan đến tiền tệ, có thể tránh được mất mát độ chính xác do số dấu phẩy động.

Trong Java, kiểu DECIMAL của MySQL tương ứng với lớp Java `java.math.BigDecimal`.

### Tại sao không nên dùng TEXT và BLOB?

Kiểu TEXT tương tự như CHAR (0-255 byte) và VARCHAR (0-65,535 byte), nhưng có thể lưu trữ chuỗi dài hơn, tức là dữ liệu văn bản dài, ví dụ nội dung blog.

| Kiểu       | Kích thước có thể lưu | Mục đích sử dụng           |
| ---------- | --------------------- | -------------------------- |
| TINYTEXT   | 0-255 byte            | Chuỗi văn bản thông thường |
| TEXT       | 0-65,535 byte         | Chuỗi văn bản dài          |
| MEDIUMTEXT | 0-16,772,150 byte     | Dữ liệu văn bản khá lớn    |
| LONGTEXT   | 0-4,294,967,295 byte  | Dữ liệu văn bản cực lớn    |

Kiểu BLOB chủ yếu được dùng để lưu trữ đối tượng nhị phân lớn, ví dụ hình ảnh, tệp âm thanh/video.

| Kiểu       | Kích thước có thể lưu | Mục đích sử dụng                      |
| ---------- | --------------------- | ------------------------------------- |
| TINYBLOB   | 0-255 byte            | Chuỗi nhị phân văn bản ngắn           |
| BLOB       | 0-65KB                | Chuỗi nhị phân                        |
| MEDIUMBLOB | 0-16MB                | Dữ liệu văn bản dài dạng nhị phân     |
| LONGBLOB   | 0-4GB                 | Dữ liệu văn bản cực lớn dạng nhị phân |

Trong phát triển hàng ngày, kiểu TEXT ít được dùng nhưng đôi khi vẫn gặp, còn kiểu BLOB về cơ bản không thường dùng. Nếu phạm vi độ dài dự kiến có thể đáp ứng bằng VARCHAR, nên tránh dùng TEXT.

Quy chuẩn cơ sở dữ liệu thường không khuyến nghị dùng kiểu BLOB và TEXT, hai kiểu này có một số nhược điểm và hạn chế, ví dụ:

- Không thể có giá trị mặc định.
- Khi sử dụng bảng tạm không thể dùng bảng tạm trong bộ nhớ, chỉ có thể tạo bảng tạm trên đĩa (sách "High Performance MySQL" có đề cập).
- Hiệu quả truy xuất thấp hơn.
- Không thể tạo index trực tiếp, cần chỉ định độ dài tiền tố.
- Có thể tiêu tốn lượng lớn băng thông mạng và IO.
- Có thể khiến các thao tác DML trên bảng chậm lại.
- ...

### ⭐️Sự khác biệt giữa DATETIME và TIMESTAMP là gì? Chọn cái nào?

Kiểu DATETIME không có thông tin múi giờ, TIMESTAMP có liên quan đến múi giờ.

TIMESTAMP chỉ cần 4 byte lưu trữ, nhưng DATETIME cần 8 byte lưu trữ. Tuy nhiên, điều này cũng tạo ra một vấn đề: phạm vi thời gian mà Timestamp biểu thị nhỏ hơn.

- DATETIME: '1000-01-01 00:00:00.000000' đến '9999-12-31 23:59:59.999999'
- Timestamp: '1970-01-01 00:00:01.000000' UTC đến '2038-01-19 03:14:07.999999' UTC

Ưu điểm cốt lõi của `TIMESTAMP` nằm ở khả năng xử lý múi giờ tích hợp. Cơ sở dữ liệu chịu trách nhiệm lưu trữ UTC và tự động chuyển đổi dựa trên múi giờ phiên, đơn giản hóa phát triển ứng dụng cần xử lý nhiều múi giờ. Nếu ứng dụng cần xử lý nhiều múi giờ, hoặc muốn cơ sở dữ liệu tự động quản lý chuyển đổi múi giờ, `TIMESTAMP` là lựa chọn tự nhiên (lưu ý giới hạn phạm vi thời gian, tức là vấn đề năm 2038).

Nếu kịch bản ứng dụng không liên quan đến chuyển đổi múi giờ, hoặc muốn ứng dụng hoàn toàn kiểm soát logic múi giờ, và cần biểu thị thời gian sau năm 2038, `DATETIME` là lựa chọn an toàn hơn.

Về so sánh chi tiết giữa hai loại và gợi ý chọn kiểu lưu trữ ngày tháng, vui lòng tham khảo bài viết tôi đã viết: [Gợi ý lưu trữ dữ liệu kiểu thời gian MySQL](./some-thoughts-on-database-storage-time.md).

### Sự khác biệt giữa NULL và '' là gì?

`NULL` và `''` (chuỗi rỗng) là hai giá trị hoàn toàn khác nhau, chúng biểu thị ý nghĩa khác nhau và có hành vi khác nhau trong cơ sở dữ liệu. `NULL` đại diện cho dữ liệu bị thiếu hoặc không xác định, còn `''` biểu thị một chuỗi rỗng đã biết tồn tại. Sự khác biệt chính của chúng như sau:

1. **Ý nghĩa**:
   - `NULL` đại diện cho một giá trị không xác định, nó không bằng bất kỳ giá trị nào, kể cả chính nó. Do đó, kết quả của `SELECT NULL = NULL` là `NULL`, chứ không phải `true` hay `false`. `NULL` có nghĩa là thông tin bị thiếu hoặc không xác định. Mặc dù `NULL` không bằng bất kỳ giá trị nào, nhưng trong một số thao tác, hệ thống cơ sở dữ liệu sẽ xử lý các giá trị `NULL` như cùng một danh mục, ví dụ: `DISTINCT`, `GROUP BY`, `ORDER BY`. Cần lưu ý rằng các thao tác này xử lý các giá trị `NULL` như cùng một danh mục không có nghĩa là các giá trị `NULL` bằng nhau. Chúng chỉ được xử lý đặc biệt trong các thao tác cụ thể để đảm bảo tính chính xác và nhất quán của kết quả. Cách xử lý này là để thuận tiện cho thao tác dữ liệu, chứ không phải thay đổi ngữ nghĩa của `NULL`.
   - `''` biểu thị một chuỗi rỗng, nó là một giá trị đã biết.
2. **Không gian lưu trữ**:
   - Không gian lưu trữ của `NULL` phụ thuộc vào cài đặt cơ sở dữ liệu, thường cần một ít không gian để đánh dấu giá trị là null.
   - Không gian lưu trữ của `''` thường nhỏ hơn, vì nó chỉ lưu trữ cờ hiệu của chuỗi rỗng, không cần lưu ký tự thực tế.
3. **Toán tử so sánh**:
   - Kết quả so sánh bất kỳ giá trị nào với `NULL` (ví dụ `=`, `!=`, `>`, `<`, v.v.) đều là `NULL`, biểu thị kết quả không xác định. Để kiểm tra một giá trị có phải là `NULL` không, phải dùng `IS NULL` hoặc `IS NOT NULL`.
   - `''` có thể thực hiện các toán tử so sánh như các chuỗi khác. Ví dụ, kết quả của `'' = ''` là `true`.
4. **Hàm tổng hợp**:
   - Hầu hết các hàm tổng hợp (ví dụ `SUM`, `AVG`, `MIN`, `MAX`) sẽ bỏ qua các giá trị `NULL`.
   - `COUNT(*)` sẽ đếm tất cả số hàng, bao gồm cả các hàng chứa giá trị `NULL`. `COUNT(tên_cột)` sẽ đếm số hàng có giá trị không phải `NULL` trong cột chỉ định.
   - Chuỗi rỗng `''` sẽ được tính vào các hàm tổng hợp. Ví dụ, `SUM` sẽ coi nó là 0, `MIN` và `MAX` sẽ coi nó là một chuỗi rỗng.

Sau khi đọc phần giới thiệu trên, chắc chắn bạn cũng đã có câu trả lời cho một câu hỏi phỏng vấn tần suất cao khác: "Tại sao MySQL không khuyến nghị dùng `NULL` làm giá trị mặc định cho cột?"

### ⭐️Kiểu Boolean được biểu thị như thế nào?

MySQL không có kiểu boolean chuyên dụng, mà dùng kiểu `bit(1)` để biểu thị giá trị boolean. Kiểu `bit(1)` có thể lưu trữ 0 hoặc 1, tương ứng với false hoặc true.

### ⭐️Lưu số điện thoại dùng INT hay VARCHAR?

Để lưu số điện thoại, **rất khuyến nghị dùng kiểu VARCHAR**, thay vì INT hay BIGINT. Lý do chính như sau:

1. **Tương thích định dạng và tính toàn vẹn:**
   - Số điện thoại có thể bao gồm số 0 đứng đầu (như mã vùng điện thoại cố định ở một số khu vực), tiền tố mã quốc gia ('+'), thậm chí có thể có dấu phân cách ('-' hoặc khoảng trắng). Kiểu số như INT hay BIGINT sẽ tự động mất những thông tin định dạng quan trọng này (ví dụ số 0 đứng đầu bị loại bỏ, '+' và '-' không lưu được).
   - VARCHAR có thể lưu trữ các định dạng số khác nhau nguyên vẹn, dù là số điện thoại 11 chữ số trong nước hay số quốc tế có mã quốc gia, đều có thể tương thích hoàn hảo.
2. **Không phải số học:** Số điện thoại tuy trông giống số, nhưng chúng ta không bao giờ thực hiện tính toán toán học trên nó (như cộng, trung bình). Về bản chất nó là một định danh, giống một chuỗi hơn. Dùng VARCHAR phù hợp hơn với bản chất dữ liệu của nó.
3. **Tính linh hoạt trong truy vấn:**
   - Nghiệp vụ thường cần truy vấn theo đầu số (tiền tố), ví dụ tìm tất cả người dùng bắt đầu bằng "138". Sử dụng kiểu VARCHAR kết hợp với câu SQL `LIKE '138%'` vừa trực quan vừa hiệu quả.
   - Nếu dùng kiểu số, việc khớp tiền tố tương tự thường cần chuyển đổi function phức tạp (như CAST hoặc SUBSTRING), hoặc dùng truy vấn phạm vi (như `WHERE phone >= 13800000000 AND phone < 13900000000`), không chỉ cách viết phức tạp mà còn có thể không tận dụng hiệu quả index, dẫn đến hiệu suất giảm.
4. **Yêu cầu lưu trữ mã hóa (rất quan trọng):**
   - Do yêu cầu bảo mật dữ liệu và tuân thủ quyền riêng tư, thông tin cá nhân nhạy cảm như số điện thoại thường phải được mã hóa trước khi lưu vào cơ sở dữ liệu.
   - Dữ liệu sau khi mã hóa (cipher text) là một chuỗi ký tự dài (thường gồm chữ cái, số, ký hiệu, hoặc được mã hóa Base64/Hex), kiểu INT hay BIGINT hoàn toàn không thể lưu trữ loại cipher text này. Chỉ có các kiểu như VARCHAR, TEXT hay BLOB mới có thể.

**Về việc chọn độ dài VARCHAR:**

- **Nếu không mã hóa lưu trữ (rất không khuyến nghị!):** Xét đến số quốc tế và các ký tự định dạng có thể có, VARCHAR(20) đến VARCHAR(32) thường là phạm vi an toàn hơn, đủ để bao phủ hầu hết các định dạng số điện thoại trên thế giới. VARCHAR(15) có thể không đủ cho một số số có mã quốc gia và ký tự định dạng.
- **Nếu lưu trữ mã hóa (thực hành chuẩn được khuyến nghị):** Độ dài phải được tính toán và thiết lập chính xác dựa trên độ dài tối đa của cipher text do thuật toán mã hóa đã chọn tạo ra, cũng như phương thức mã hóa có thể dùng (như Base64 sẽ tăng độ dài khoảng 1/3). Thường cần độ dài VARCHAR dài hơn, ví dụ VARCHAR(128), VARCHAR(256) hoặc dài hơn.

Cuối cùng, bảng tóm tắt:

| Chiều so sánh             | Kiểu VARCHAR (khuyến nghị)                          | Kiểu INT/BIGINT (không khuyến nghị)            | Ghi chú/Giải thích                                                                                           |
| ------------------------- | --------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Tương thích định dạng** | ✔ Có thể lưu số 0 đứng đầu, "+", "-", khoảng trắng | ✘ Tự động mất số 0 đứng đầu, không lưu ký hiệu | VARCHAR lưu nguyên vẹn các định dạng số điện thoại, INT/BIGINT chỉ hỗ trợ số thuần túy, số 0 đứng đầu bị mất |
| **Tính toàn vẹn**         | ✔ Không mất thông tin định dạng nào                | ✘ Mất thông tin định dạng                      | Ví dụ "013800012345" lưu vào INT sẽ thành 13800012345, "+" cũng không lưu được                               |
| **Không phải số học**     | ✔ Phù hợp lưu "định danh"                          | ✘ Chỉ phù hợp cho tính toán số                 | Số điện thoại về bản chất là định danh chuỗi, không làm tính toán, VARCHAR phù hợp hơn                       |
| **Linh hoạt truy vấn**    | ✔ Hỗ trợ `LIKE '138%'`, v.v.                       | ✘ Truy vấn tiền tố bất tiện hoặc hiệu suất kém | Dùng VARCHAR có thể truy vấn hiệu quả theo đầu số/tiền tố, kiểu số cần chuyển sang chuỗi hoặc xử lý phức tạp |
| **Hỗ trợ lưu mã hóa**     | ✔ Có thể lưu cipher text (chữ cái, ký hiệu)        | ✘ Không thể lưu cipher text                    | Sau mã hóa số điện thoại, cipher text là chuỗi/nhị phân, chỉ VARCHAR, TEXT, BLOB mới tương thích             |
| **Gợi ý độ dài**          | 15~20 (chưa mã hóa), mã hóa tùy trường hợp          | Không có nghĩa                                 | Chưa mã hóa VARCHAR(15~20) dùng chung, sau mã hóa độ dài phụ thuộc thuật toán và phương thức mã hóa          |

## Kiến trúc cơ bản MySQL

> Nên kết hợp bài viết [Quá trình thực thi câu lệnh SQL trong MySQL](./how-sql-executed-in-mysql.md) để hiểu kiến trúc cơ bản MySQL. Ngoài ra, "Luồng thực thi của một câu lệnh SQL trong MySQL" cũng là câu hỏi khá phổ biến trong phỏng vấn.

Hình dưới đây là sơ đồ kiến trúc tóm tắt của MySQL, từ hình này bạn có thể thấy rõ ràng cách một câu SQL từ client được thực thi trong MySQL.

![](https://oss.javaguide.cn/javaguide/13526879-3037b144ed09eb88.png)

Từ hình trên có thể thấy, MySQL chủ yếu được cấu thành từ các phần sau:

- **Connector (Bộ kết nối):** Xác thực danh tính và quyền hạn liên quan (khi đăng nhập MySQL).
- **Query Cache (Bộ nhớ cache truy vấn):** Khi thực thi câu lệnh truy vấn, sẽ kiểm tra cache trước (đã bị loại bỏ sau MySQL 8.0 vì tính năng này không thực sự hữu ích).
- **Analyzer (Bộ phân tích):** Nếu không có trong cache, câu lệnh SQL sẽ đi qua bộ phân tích. Bộ phân tích về cơ bản là kiểm tra câu SQL muốn làm gì, sau đó kiểm tra cú pháp SQL có đúng không.
- **Optimizer (Bộ tối ưu hóa):** Thực thi theo phương án MySQL cho là tối ưu nhất.
- **Executor (Bộ thực thi):** Thực thi câu lệnh, rồi trả về dữ liệu từ storage engine. Trước khi thực thi sẽ kiểm tra quyền hạn, nếu không có quyền sẽ báo lỗi.
- **Storage engine (Lưu trữ dạng plugin)**: Chủ yếu chịu trách nhiệm lưu trữ và đọc dữ liệu, sử dụng kiến trúc plugin, hỗ trợ nhiều storage engine như InnoDB, MyISAM, Memory, v.v. InnoDB là storage engine mặc định của MySQL, hầu hết các trường hợp dùng InnoDB là lựa chọn tốt nhất.

## Storage Engine MySQL

Cốt lõi của MySQL nằm ở storage engine, muốn tìm hiểu sâu MySQL thì phải nghiên cứu kỹ storage engine MySQL.

### MySQL hỗ trợ những storage engine nào? Mặc định dùng cái nào?

MySQL hỗ trợ nhiều storage engine, bạn có thể dùng lệnh `SHOW ENGINES` để xem tất cả storage engine mà MySQL hỗ trợ.

![Xem tất cả storage engine MySQL cung cấp](https://oss.javaguide.cn/github/javaguide/mysql/image-20220510105408703.png)

Từ hình trên có thể thấy, storage engine mặc định hiện tại của MySQL là InnoDB. Và trong tất cả storage engine, chỉ InnoDB là storage engine hỗ trợ transaction, tức là chỉ InnoDB mới hỗ trợ transaction.

Phiên bản MySQL tôi đang dùng là 8.x, có thể có sự khác biệt giữa các phiên bản MySQL khác nhau.

Trước MySQL 5.5.5, MyISAM là storage engine mặc định của MySQL. Từ phiên bản 5.5.5 trở đi, InnoDB là storage engine mặc định của MySQL.

Bạn có thể dùng lệnh `SELECT VERSION()` để xem phiên bản MySQL của mình.

```bash
mysql> SELECT VERSION();
+-----------+
| VERSION() |
+-----------+
| 8.0.27    |
+-----------+
1 row in set (0.00 sec)
```

Bạn cũng có thể dùng lệnh `SHOW VARIABLES LIKE '%storage_engine%'` để xem trực tiếp storage engine mặc định hiện tại của MySQL.

```bash
mysql> SHOW VARIABLES  LIKE '%storage_engine%';
+---------------------------------+-----------+
| Variable_name                   | Value     |
+---------------------------------+-----------+
| default_storage_engine          | InnoDB    |
| default_tmp_storage_engine      | InnoDB    |
| disabled_storage_engines        |           |
| internal_tmp_mem_storage_engine | TempTable |
+---------------------------------+-----------+
4 rows in set (0.00 sec)
```

Nếu bạn muốn tìm hiểu sâu từng storage engine và sự khác biệt giữa chúng, nên đọc tài liệu chính thức MySQL tương ứng (phỏng vấn sẽ không hỏi chi tiết đến vậy, biết sơ là được):

- Giới thiệu chi tiết về InnoDB storage engine: <https://dev.mysql.com/doc/refman/8.0/en/innodb-storage-engine.html>
- Giới thiệu chi tiết về các storage engine khác: <https://dev.mysql.com/doc/refman/8.0/en/storage-engines.html>

![](https://oss.javaguide.cn/github/javaguide/mysql/image-20220510155143458.png)

### Bạn có hiểu về kiến trúc storage engine MySQL không?

Storage engine MySQL sử dụng **kiến trúc plugin**, hỗ trợ nhiều storage engine, chúng ta thậm chí có thể thiết lập storage engine khác nhau cho các bảng cơ sở dữ liệu khác nhau để phù hợp với nhu cầu của các kịch bản khác nhau. **Storage engine dựa trên bảng, không phải cơ sở dữ liệu.**

Hình dưới đây mô tả kiến trúc MySQL với storage engine có thể cắm vào:

![MySQL architecture diagram showing connectors, interfaces, pluggable storage engines, the file system with files and logs.](https://oss.javaguide.cn/github/javaguide/mysql/mysql-architecture.png)

Bạn cũng có thể viết storage engine riêng theo giao diện chuẩn storage engine do MySQL định nghĩa. Các storage engine không chính thức này có thể gọi là storage engine bên thứ ba, phân biệt với storage engine chính thức. Như InnoDB hiện tại được dùng phổ biến nhất thực ra ban đầu là storage engine bên thứ ba, sau đó do quá xuất sắc, nó đã được Oracle mua lại trực tiếp.

Tài liệu chính thức MySQL cũng có giới thiệu cách viết storage engine tùy chỉnh, địa chỉ: <https://dev.mysql.com/doc/internals/en/custom-engine.html>

### ⭐️MyISAM và InnoDB khác nhau như thế nào?

Trước MySQL 5.5, engine MyISAM là storage engine mặc định của MySQL, có thể nói là rất nổi tiếng một thời.

Mặc dù hiệu suất của MyISAM vẫn ổn, các tính năng cũng khá tốt (như full-text index, compression, spatial function, v.v.). Nhưng MyISAM không hỗ trợ transaction và row-level lock, và nhược điểm lớn nhất là không thể phục hồi an toàn sau khi crash.

Từ phiên bản MySQL 5.5 trở đi, InnoDB là storage engine mặc định của MySQL.

Nói thẳng vào vấn đề! Hãy so sánh đơn giản hai loại:

**1. Có hỗ trợ row-level lock không**

MyISAM chỉ có table-level locking, trong khi InnoDB hỗ trợ row-level locking và table-level locking, mặc định là row-level lock.

Nghĩa là, MyISAM khi khóa là khóa cả bảng, điều này trong trường hợp ghi đồng thời thật sự rất kém hiệu quả! Đây cũng là lý do tại sao InnoDB có hiệu suất tốt hơn khi ghi đồng thời!

**2. Có hỗ trợ transaction không**

MyISAM không cung cấp hỗ trợ transaction.

InnoDB cung cấp hỗ trợ transaction, triển khai bốn mức cô lập được SQL chuẩn định nghĩa, có khả năng commit và rollback transaction. Và mức cô lập REPEATABLE-READ (đọc lặp lại) mà InnoDB dùng mặc định có thể giải quyết được vấn đề phantom read (dựa trên MVCC và Next-Key Lock).

Để biết giới thiệu chi tiết về transaction MySQL, có thể xem bài viết tôi đã viết: [Giải thích chi tiết mức cô lập transaction MySQL](./transaction-isolation-level.md).

**3. Có hỗ trợ foreign key không**

MyISAM không hỗ trợ, còn InnoDB thì hỗ trợ.

Foreign key rất hữu ích trong việc duy trì tính nhất quán dữ liệu, nhưng có một chút ảnh hưởng đến hiệu suất. Do đó, thông thường chúng ta không khuyến nghị dùng foreign key trong dự án sản xuất thực tế, hãy thực hiện ràng buộc trong code nghiệp vụ!

"Java Development Manual" của Alibaba cũng quy định rõ ràng cấm sử dụng foreign key.

![](https://oss.javaguide.cn/github/javaguide/mysql/image-20220510090309427.png)

Tuy nhiên, nếu thực hiện ràng buộc trong code thì yêu cầu năng lực của lập trình viên cao hơn, việc có dùng foreign key hay không vẫn phải dựa vào tình hình thực tế của dự án bạn.

Tóm lại: Nhìn chung chúng ta cũng không khuyến nghị dùng foreign key ở tầng cơ sở dữ liệu, tầng ứng dụng có thể giải quyết được. Tuy nhiên, điều này sẽ gây ra mối đe dọa đối với tính nhất quán của dữ liệu. Có dùng foreign key hay không vẫn phải quyết định dựa vào dự án của bạn.

**4. Có hỗ trợ phục hồi an toàn sau sự cố cơ sở dữ liệu không**

MyISAM không hỗ trợ, còn InnoDB thì hỗ trợ.

Cơ sở dữ liệu sử dụng InnoDB sau khi xảy ra sự cố crash, khi khởi động lại cơ sở dữ liệu sẽ đảm bảo phục hồi về trạng thái trước khi crash. Quá trình phục hồi này phụ thuộc vào `redo log`.

**5. Có hỗ trợ MVCC không**

MyISAM không hỗ trợ, còn InnoDB thì hỗ trợ.

Thật ra, so sánh này hơi thừa, vì MyISAM thậm chí không hỗ trợ row-level lock. MVCC có thể coi là sự nâng cấp của row-level lock, có thể giảm hiệu quả các thao tác khóa, nâng cao hiệu suất.

**6. Triển khai index khác nhau.**

Mặc dù cả engine MyISAM và engine InnoDB đều dùng B+Tree làm cấu trúc index, nhưng cách triển khai của hai loại không giống nhau.

Trong engine InnoDB, file dữ liệu chính là file index. So với MyISAM (file index và file dữ liệu tách biệt), file dữ liệu bảng của nó được tổ chức theo cấu trúc index B+Tree, trường data của nút lá cây lưu bản ghi dữ liệu hoàn chỉnh.

Về sự khác biệt chi tiết, nên xem bài viết tôi đã viết: [Giải thích chi tiết MySQL index](./mysql-index.md).

**7. Hiệu suất có sự khác biệt.**

Hiệu suất InnoDB mạnh hơn MyISAM, dù trong chế độ đọc-ghi hỗn hợp hay chế độ chỉ đọc, khi số lõi CPU tăng lên, khả năng đọc-ghi của InnoDB tăng trưởng tuyến tính. MyISAM vì đọc-ghi không thể đồng thời, khả năng xử lý của nó không liên quan đến số lõi.

![So sánh hiệu suất InnoDB và MyISAM](https://oss.javaguide.cn/github/javaguide/mysql/innodb-myisam-performance-comparison.png)

**8. Chiến lược và cơ chế cache dữ liệu khác nhau.**

InnoDB dùng Buffer Pool để cache data page và index page, MyISAM dùng Key Cache chỉ cache index page mà không cache data page.

**Tóm tắt**:

- InnoDB hỗ trợ độ chi tiết khóa ở cấp hàng, MyISAM không hỗ trợ, chỉ hỗ trợ độ chi tiết khóa ở cấp bảng.
- MyISAM không cung cấp hỗ trợ transaction. InnoDB cung cấp hỗ trợ transaction, triển khai bốn mức cô lập được SQL chuẩn định nghĩa.
- MyISAM không hỗ trợ foreign key, còn InnoDB thì hỗ trợ.
- MyISAM không hỗ trợ MVCC, còn InnoDB thì hỗ trợ.
- Mặc dù cả engine MyISAM và engine InnoDB đều dùng B+Tree làm cấu trúc index, nhưng cách triển khai của hai loại không giống nhau.
- MyISAM không hỗ trợ phục hồi an toàn sau sự cố cơ sở dữ liệu, còn InnoDB thì hỗ trợ.
- Hiệu suất InnoDB mạnh hơn MyISAM.

Cuối cùng, chia sẻ thêm một hình ảnh so sánh chi tiết một số storage engine MySQL phổ biến.

![So sánh một số storage engine MySQL phổ biến](https://oss.javaguide.cn/github/javaguide/mysql/comparison-of-common-mysql-storage-engines.png)

### Chọn MyISAM hay InnoDB?

Phần lớn thời gian chúng ta dùng storage engine InnoDB, trong một số trường hợp đọc nhiều, dùng MyISAM cũng phù hợp. Tuy nhiên, với điều kiện là dự án của bạn không ngại các nhược điểm của MyISAM như không hỗ trợ transaction, không phục hồi sau crash (nhưng... chúng ta thường sẽ ngại mà).

"High Performance MySQL" có câu này:

> Đừng dễ dàng tin vào những kinh nghiệm như "MyISAM nhanh hơn InnoDB", kết luận này thường không tuyệt đối. Trong nhiều tình huống chúng ta đã biết, tốc độ InnoDB có thể khiến MyISAM phải nhìn lại, đặc biệt khi dùng clustered index, hoặc các ứng dụng cần truy cập dữ liệu có thể đặt vừa trong bộ nhớ.

Do đó, đối với hệ thống nghiệp vụ phát triển hàng ngày của chúng ta, bạn gần như không tìm được lý do gì để dùng MyISAM, cứ yên tâm dùng InnoDB mặc định là được!

## ⭐️MySQL Index

Các câu hỏi liên quan đến MySQL index khá nhiều và rất quan trọng, để biết giới thiệu chi tiết hơn có thể đọc bài viết tôi đã viết: [Giải thích chi tiết MySQL index](./mysql-index.md).

### Index là gì?

**Index là một cấu trúc dữ liệu dùng để truy vấn và truy xuất dữ liệu nhanh chóng, bản chất của nó có thể coi là một cấu trúc dữ liệu đã được sắp xếp.**

Tác dụng của index tương đương với mục lục của sách. Ví dụ: khi tra từ điển, nếu không có mục lục, chúng ta chỉ có thể giở từng trang để tìm từ cần tra, rất chậm; nếu có mục lục, chúng ta chỉ cần tra vị trí từ trong mục lục trước, rồi lật trực tiếp đến trang đó.

Cấu trúc dữ liệu bên dưới index có nhiều loại, các cấu trúc index phổ biến là: B tree, B+ tree và Hash, Red-Black tree. Trong MySQL, dù là InnoDB hay MyISAM, đều dùng B+ tree làm cấu trúc index.

**Ưu điểm của index:**

1. **Tốc độ truy vấn tăng vọt (mục đích chính)**: Thông qua index, cơ sở dữ liệu có thể **giảm đáng kể lượng dữ liệu cần quét**, định vị trực tiếp đến các bản ghi đáp ứng điều kiện, từ đó tăng tốc đáng kể tốc độ truy xuất dữ liệu, giảm số lần đọc đĩa I/O.
2. **Đảm bảo tính duy nhất dữ liệu**: Thông qua việc tạo **unique index**, có thể đảm bảo giá trị của một cột (hoặc tổ hợp nhiều cột) trong bảng là duy nhất, ví dụ như user ID, email. Primary key bản thân cũng là một dạng unique index.
3. **Tăng tốc sắp xếp và nhóm**: Nếu cột trong mệnh đề ORDER BY hay GROUP BY của truy vấn có index, cơ sở dữ liệu thường có thể tận dụng trực tiếp đặc tính đã sắp xếp sẵn của index, tránh thao tác sắp xếp bổ sung, nâng cao hiệu suất.

**Nhược điểm của index:**

1. **Tốn thời gian tạo và bảo trì**: Tạo index bản thân cần thời gian, đặc biệt khi thao tác trên bảng lớn. Quan trọng hơn, khi **thêm, xóa, sửa (thao tác DML)** dữ liệu trong bảng, không chỉ phải thao tác dữ liệu mà các index liên quan cũng phải được cập nhật và bảo trì động, điều này sẽ **giảm hiệu quả thực thi của các thao tác DML này**.
2. **Chiếm không gian lưu trữ**: Index về bản chất cũng là một cấu trúc dữ liệu, cần lưu trữ dưới dạng file vật lý (hoặc cấu trúc bộ nhớ), do đó sẽ **chiếm thêm một lượng không gian đĩa nhất định**. Index càng nhiều, càng lớn thì chiếm dụng không gian càng nhiều.
3. **Có thể bị dùng sai hoặc thất bại**: Nếu thiết kế index không đúng, hoặc câu lệnh truy vấn viết không tốt, trình tối ưu hóa cơ sở dữ liệu có thể không chọn dùng index (hoặc chọn index sai), ngược lại dẫn đến hiệu suất giảm.

**Vậy dùng index có nhất định cải thiện hiệu suất truy vấn không?**

**Không nhất thiết.** Trong hầu hết các trường hợp, sử dụng index hợp lý thực sự nhanh hơn nhiều so với full table scan. Nhưng cũng có ngoại lệ:

- **Dữ liệu quá ít**: Nếu dữ liệu trong bảng rất ít (ví dụ chỉ vài trăm bản ghi), full table scan có thể nhanh hơn tìm kiếm qua index, vì bản thân việc đi qua index cũng có chi phí.
- **Tỷ lệ kết quả truy vấn quá lớn**: Nếu dữ liệu cần truy vấn chiếm phần lớn toàn bảng (ví dụ hơn 20%-30%), trình tối ưu hóa có thể cho rằng full table scan kinh tế hơn, vì chi phí của nhiều lần quay lại bảng qua index (random I/O) có thể cao hơn một lần full table scan tuần tự.
- **Bảo trì index không đúng cách hoặc thống kê lỗi thời**: Dẫn đến trình tối ưu hóa đưa ra phán đoán sai.

### Tại sao index nhanh?

Index nhanh vì lý do cốt lõi là nó **giảm đáng kể số lần đọc đĩa I/O**.

Bản chất của nó là một **cấu trúc dữ liệu đã được sắp xếp**, giống như mục lục sách, giúp chúng ta không phải giở từng trang (full table scan).

Trong MySQL, cấu trúc dữ liệu này là **B+tree**. Cấu trúc B+tree chủ yếu tối ưu hóa từ hai khía cạnh:

1. Đặc điểm của B+tree là "thấp và béo", một bảng có hàng triệu dữ liệu, chiều cao của cây index có thể chỉ là 3-4 tầng. Điều này có nghĩa là tối đa chỉ cần **3-4 lần đọc đĩa I/O** là có thể xác định chính xác dữ liệu tôi muốn, trong khi full table scan có thể cần hàng nghìn lần, do đó tốc độ cực nhanh.
2. Các nút lá của B+tree được **nối với nhau bằng danh sách liên kết**. Sau khi tìm thấy đầu, có thể **đọc tuần tự** theo danh sách liên kết, điều này rất thân thiện với đĩa, còn có thể kích hoạt pre-read.

### Cấu trúc dữ liệu bên dưới MySQL index là gì?

Trong MySQL, cả engine MyISAM và engine InnoDB đều dùng B+Tree làm cấu trúc index, để biết giới thiệu chi tiết có thể tham khảo bài viết tôi đã viết: [Giải thích chi tiết MySQL index](https://javaguide.cn/database/mysql/mysql-index.html).

### Tại sao InnoDB không dùng Hash làm cấu trúc dữ liệu của index?

> Tôi nhận thấy nhiều ứng viên thậm chí cả người phỏng vấn đều có hiểu lầm về câu hỏi này, họ tự cho rằng MySQL bên dưới không dùng Hash hay B tree làm cấu trúc dữ liệu cho index.
>
> Thực ra, dù hỏi hay trả lời câu hỏi này đều phải phân biệt rõ storage engine. Như engine MEMORY hỗ trợ cả Hash lẫn B tree.

Bên dưới của hash index là bảng hash. Ưu điểm của nó là khi thực hiện **truy vấn equal chính xác**, độ phức tạp thời gian lý thuyết là **O(1)**, tốc độ cực nhanh. Ví dụ `WHERE id = 123`.

Nhưng nó có một số nhược điểm chí mạng đối với cơ sở dữ liệu đa năng:

1. **Không hỗ trợ truy vấn phạm vi:** Đây là lý do chính. Một đặc điểm của hash function là nó ánh xạ các giá trị đầu vào liền kề nhau (ví dụ `id=100` và `id=101`) đến các vị trí hoàn toàn không liền kề trong bảng hash. Sự phá vỡ thứ tự này khiến chúng ta không thể xử lý các truy vấn phạm vi như `WHERE age > 30` hay `BETWEEN 100 AND 200`. Để hoàn thành loại truy vấn này, hash index chỉ có thể thoái hóa về full table scan.
2. **Không hỗ trợ sắp xếp:** Tương tự, vì giá trị hash không có thứ tự, chúng ta không thể dùng hash index để tối ưu hóa mệnh đề `ORDER BY`.
3. **Không hỗ trợ truy vấn khóa index một phần:** Đối với composite index, ví dụ `(col1, col2)`, hash index phải dùng tất cả các cột index để truy vấn, nó không thể chỉ dùng riêng `col1` để tăng tốc truy vấn.
4. **Vấn đề hash collision:** Khi các khóa khác nhau tạo ra cùng giá trị hash, cần linked list bổ sung hoặc open addressing để giải quyết, điều này sẽ làm giảm hiệu suất.

Do truy vấn phạm vi và sắp xếp là các thao tác rất phổ biến trong truy vấn cơ sở dữ liệu, một cấu trúc index không hỗ trợ các tính năng này rõ ràng không thể làm kiểu index mặc định, đa năng.

### Tại sao InnoDB không dùng B tree làm cấu trúc dữ liệu của index?

B tree và B+tree đều là cây tìm kiếm đa chiều cân bằng xuất sắc, rất phù hợp để lưu trữ trên đĩa, vì chúng đều "thấp và béo", có thể tận dụng tối đa mỗi lần đọc đĩa I/O.

Nhưng B+tree là phiên bản nâng cao của B tree, nó đã thực hiện một số tối ưu hóa quan trọng cho kịch bản cơ sở dữ liệu:

1. **Hiệu quả I/O cao hơn:** Trong B+tree, chỉ có nút lá mới lưu dữ liệu (hoặc con trỏ dữ liệu), còn nút không phải lá chỉ lưu khóa index. Vì nút không phải lá không lưu dữ liệu, chúng có thể chứa nhiều khóa index hơn. Điều này có nghĩa là "fan-out" của B+tree lớn hơn, với cùng lượng dữ liệu, B+tree thường thấp hơn B tree, tức là số lần đọc đĩa I/O cần thiết để tìm dữ liệu ít hơn.
2. **Hiệu suất truy vấn ổn định hơn:** Trong B+tree, bất kỳ truy vấn nào cũng phải đi từ nút gốc đến nút lá mới tìm được dữ liệu, nên độ dài đường truy vấn là cố định. Còn trong B tree, nếu may mắn có thể tìm thấy dữ liệu ở nút không phải lá, nhưng xui thì phải đi đến lá, điều này khiến hiệu suất truy vấn không ổn định.
3. **Cực kỳ thân thiện với truy vấn phạm vi:** Đây là ưu điểm cốt lõi nhất của B+tree. Tất cả các nút lá của nó được kết nối với nhau qua danh sách liên kết hai chiều. Khi chúng ta thực thi truy vấn phạm vi (ví dụ `WHERE id > 100`), chỉ cần tìm nút lá `id=100` qua cấu trúc cây, sau đó có thể quét tuần tự theo danh sách liên kết về phía sau mà không cần quay lại nút cha. Điều này làm tăng đáng kể hiệu quả truy vấn phạm vi.

### Covering index là gì?

Nếu một index chứa (hay nói cách khác là bao phủ) giá trị của tất cả các trường cần truy vấn, chúng ta gọi nó là **Covering Index (Index bao phủ)**.

Trong storage engine InnoDB, nút lá của non-primary key index chứa giá trị của primary key. Điều này có nghĩa là khi dùng non-primary key index để truy vấn, cơ sở dữ liệu sẽ tìm giá trị primary key tương ứng trước, sau đó định vị và truy xuất hàng dữ liệu hoàn chỉnh qua primary key index. Quá trình này gọi là "quay lại bảng" (back to table).

**Covering index tức là trường cần truy vấn đúng là trường của index, thì có thể tìm được dữ liệu trực tiếp dựa trên index đó, mà không cần quay lại bảng để truy vấn.**

### Hãy giải thích về composite index trong MySQL và nguyên tắc khớp tiền tố bên trái

Sử dụng nhiều trường trong bảng để tạo index, gọi là **composite index**, còn gọi là **combined index** hay **compound index**.

Tạo composite index với hai trường `score` và `name`:

```sql
ALTER TABLE `cus_order` ADD INDEX id_score_name(score, name);
```

Nguyên tắc khớp tiền tố bên trái (leftmost prefix matching) đề cập đến việc khi dùng composite index, MySQL sẽ theo thứ tự các trường trong index, lần lượt từ trái sang phải khớp với các trường trong điều kiện truy vấn. Nếu điều kiện truy vấn khớp với trường ngoài cùng bên trái trong index, MySQL sẽ dùng index để lọc dữ liệu, điều này có thể nâng cao hiệu suất truy vấn.

Nguyên tắc khớp bên trái nhất sẽ tiếp tục khớp sang phải, cho đến khi gặp truy vấn phạm vi (như >, <) thì dừng. Đối với truy vấn phạm vi >=, <=, BETWEEN và LIKE khớp tiền tố, sẽ không dừng khớp (bài đọc liên quan: [Kết luận sai mà cả internet đang nói về nguyên tắc khớp bên trái nhất của composite index](https://mp.weixin.qq.com/s/8qemhRg5MgXs1So5YCv0fQ)).

Giả sử có composite index `(column1, column2, column3)`, tất cả tiền tố từ trái sang phải là `(column1)`, `(column1, column2)`, `(column1, column2, column3)` (tạo 1 composite index tương đương tạo 3 index), tất cả truy vấn bao gồm các cột này đều sẽ đi qua index thay vì full table scan.

Khi dùng composite index, chúng ta có thể đặt trường có tính phân biệt cao ở bên trái nhất, điều này cũng có thể lọc được nhiều dữ liệu hơn.

Ở đây chúng ta demo đơn giản hiệu quả của leftmost prefix matching.

1. Tạo một bảng tên `student`, bảng này chỉ có 3 trường `id`, `name`, `class`.

```sql
CREATE TABLE `student` (
  `id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `class` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `name_class_idx` (`name`,`class`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

2. Dưới đây chúng ta kiểm tra ba câu lệnh SQL khác nhau.

![](https://oss.javaguide.cn/github/javaguide/database/mysql/leftmost-prefix-matching-rule.png)

```sql
# Có thể dùng index
SELECT * FROM student WHERE name = 'Anne Henry';
EXPLAIN SELECT * FROM student WHERE name = 'Anne Henry' AND class = 'lIrm08RYVk';
# Không thể dùng index
SELECT * FROM student WHERE class = 'lIrm08RYVk';
```

Xem thêm một câu hỏi phỏng vấn thường gặp: Nếu có index `composite index (a, b, c)`, truy vấn `a=1 AND c=1` có đi qua index không? `c=1` thì sao? `b=1 AND c=1` thì sao? `b = 1 AND a = 1 AND c = 1` thì sao?

Đừng xem đáp án bên dưới vội, cho mình 3 phút suy nghĩ.

1. Truy vấn `a=1 AND c=1`: Theo nguyên tắc khớp tiền tố bên trái, truy vấn có thể dùng phần tiền tố của index. Do đó, truy vấn này chỉ dùng index trên `a=1`, sau đó lọc kết quả bằng `c=1`.
2. Truy vấn `c=1`: Vì truy vấn không bao gồm cột ngoài cùng bên trái `a`, theo nguyên tắc khớp tiền tố bên trái, toàn bộ index không thể được sử dụng.
3. Truy vấn `b=1 AND c=1`: Giống trường hợp thứ hai, toàn bộ index sẽ không được dùng.
4. Truy vấn `b=1 AND a=1 AND c=1`: Truy vấn này có thể dùng index. Khi trình tối ưu hóa truy vấn phân tích câu SQL, đối với composite index, nó sẽ sắp xếp lại thứ tự điều kiện truy vấn để tận dụng index. Nó sẽ sắp xếp lại điều kiện `b=1` và `a=1`, thành `a=1 AND b=1 AND c=1`.

MySQL 8.0.13 đã giới thiệu Index Skip Scan (ISS), có thể nâng cao hiệu quả truy vấn trong một số kịch bản truy vấn index. Trước khi có ISS, các truy vấn composite index không thỏa mãn nguyên tắc khớp tiền tố bên trái sẽ thực hiện full table scan. Còn ISS cho phép MySQL trong một số trường hợp tránh full table scan, ngay cả khi điều kiện truy vấn không phù hợp với tiền tố bên trái. Tuy nhiên, tính năng này khá hạn chế, không thể so sánh với Oracle, và MySQL 8.0.31 còn báo cáo một bug: [Bug #109145 Using index for skip scan cause incorrect result](https://bugs.mysql.com/bug.php?id=109145) (các phiên bản sau đã sửa). Tôi đề xuất cứ biết là có thứ này là được, không cần đào sâu, thực tế dự án cũng chưa chắc dùng được.

### SELECT \* có gây index thất bại không?

`SELECT *` không trực tiếp gây index thất bại (nếu không đi qua index thì đa phần là do phạm vi truy vấn WHERE quá lớn), nhưng nó có thể mang lại một số vấn đề hiệu suất khác như gây lãng phí truyền mạng và xử lý dữ liệu, không thể dùng covering index.

### Những trường nào phù hợp để tạo index?

- **Trường không phải NULL**: Dữ liệu của trường index nên tránh NULL càng nhiều càng tốt, vì với trường dữ liệu là NULL, cơ sở dữ liệu khó tối ưu hóa hơn. Nếu trường được truy vấn thường xuyên nhưng không tránh được NULL, nên dùng giá trị ngắn hoặc chuỗi ngắn với ngữ nghĩa rõ ràng hơn như 0, 1, true, false để thay thế.
- **Trường được truy vấn thường xuyên**: Trường chúng ta tạo index nên là trường thao tác truy vấn rất thường xuyên.
- **Trường được dùng làm điều kiện truy vấn**: Trường được dùng làm điều kiện WHERE nên được cân nhắc tạo index.
- **Trường thường xuyên cần sắp xếp**: Index đã được sắp xếp, nên truy vấn có thể tận dụng việc sắp xếp của index, tăng tốc thời gian truy vấn có sắp xếp.
- **Trường thường xuyên được dùng để nối bảng**: Trường thường được dùng để nối có thể là một số cột foreign key, đối với cột foreign key không nhất thiết phải tạo foreign key, chỉ là cột đó liên quan đến mối quan hệ giữa các bảng. Đối với trường thường xuyên được truy vấn khi nối, có thể cân nhắc tạo index, nâng cao hiệu quả truy vấn nhiều bảng.

### Các nguyên nhân khiến index thất bại là gì?

1. Đã tạo composite index nhưng điều kiện truy vấn không tuân theo nguyên tắc khớp bên trái nhất;
2. Thực hiện tính toán, function, chuyển đổi kiểu, v.v. trên cột index;
3. Truy vấn LIKE bắt đầu bằng % như `LIKE '%abc';`;
4. Dùng OR trong điều kiện truy vấn, và trong điều kiện trước sau OR có một cột không có index, các index liên quan đều không được sử dụng;
5. Khi phạm vi giá trị IN quá lớn sẽ dẫn đến index thất bại, thực hiện full table scan (trường hợp thất bại của NOT IN và IN giống nhau);
6. Xảy ra [implicit conversion (chuyển đổi ngầm)](https://javaguide.cn/database/mysql/index-invalidation-caused-by-implicit-conversion.html "chuyển đổi ngầm");

## MySQL Query Cache

MySQL Query Cache là bộ nhớ đệm kết quả truy vấn. Khi thực thi câu lệnh truy vấn, hệ thống sẽ kiểm tra cache trước, nếu cache có kết quả truy vấn tương ứng thì sẽ trả về ngay lập tức.

Thêm cấu hình sau vào `my.cnf`, khởi động lại MySQL để bật query cache

```properties
query_cache_type=1
query_cache_size=600000
```

MySQL cũng có thể bật query cache bằng cách thực thi các lệnh sau

```properties
set global  query_cache_type=1;
set global  query_cache_size=600000;
```

Query cache sẽ trả về kết quả từ cache khi điều kiện truy vấn và dữ liệu giống nhau. Tuy nhiên, cần lưu ý rằng điều kiện khớp của query cache rất nghiêm ngặt, bất kỳ sự khác biệt nhỏ nào cũng sẽ khiến cache không được sử dụng. Điều kiện truy vấn ở đây bao gồm chính câu lệnh truy vấn, database hiện đang sử dụng, cũng như các yếu tố khác có thể ảnh hưởng đến kết quả như số phiên bản giao thức client, v.v.

**Các trường hợp query cache không được sử dụng:**

1. Bất kỳ sự khác biệt nào giữa hai truy vấn dù chỉ một ký tự cũng sẽ khiến cache không được sử dụng.
2. Nếu truy vấn chứa bất kỳ hàm do người dùng định nghĩa, stored function, biến người dùng, bảng tạm, bảng hệ thống trong thư viện MySQL, kết quả truy vấn cũng sẽ không được cache.
3. Sau khi cache được tạo, hệ thống query cache của MySQL sẽ theo dõi từng bảng liên quan trong truy vấn, nếu các bảng này (dữ liệu hoặc cấu trúc) thay đổi, tất cả dữ liệu cache liên quan đến bảng đó sẽ bị vô hiệu hóa.

**Cache tuy có thể cải thiện hiệu suất truy vấn của database, nhưng cache cũng mang lại chi phí phụ, mỗi lần truy vấn xong phải thực hiện một thao tác cache, sau khi hết hạn còn phải hủy.** Do đó, việc bật query cache cần thận trọng, đặc biệt đối với các ứng dụng ghi nhiều. Nếu bật, cần chú ý kiểm soát kích thước không gian cache hợp lý, thông thường kích thước đặt vài chục MB là phù hợp. Ngoài ra, có thể sử dụng `sql_cache` và `sql_no_cache` để kiểm soát xem một câu lệnh truy vấn cụ thể có cần cache hay không:

```sql
SELECT sql_no_cache COUNT(*) FROM usr;
```

Từ MySQL 5.6, query cache đã bị tắt theo mặc định. Từ MySQL 8.0, query cache không còn được hỗ trợ nữa (chi tiết có thể tham khảo bài viết này: [MySQL 8.0: Retiring Support for the Query Cache](https://dev.mysql.com/blog-archive/mysql-8-0-retiring-support-for-the-query-cache/)).

![MySQL 8.0: Retiring Support for the Query Cache](https://oss.javaguide.cn/github/javaguide/mysql/mysql8.0-retiring-support-for-the-query-cache.png)

## ⭐️MySQL Log

Câu trả lời cho câu hỏi trên có thể tìm thấy trong phần **"Phần câu hỏi phỏng vấn kỹ thuật"** của [《Hướng dẫn phỏng vấn Java》(có phí, nhấp vào liên kết để nhận phiếu giảm giá)](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html).

![《Hướng dẫn phỏng vấn Java》- Phần câu hỏi phỏng vấn kỹ thuật](https://oss.javaguide.cn/javamianshizhibei/technical-interview-questions.png)

Địa chỉ bài viết: <https://www.yuque.com/snailclimb/mf2z3k/zr4kfk> (lấy mật khẩu: <https://t.zsxq.com/avfM0>).

## ⭐️MySQL Transaction

### Transaction là gì?

Hãy tưởng tượng một tình huống, trong đó chúng ta cần chèn nhiều dữ liệu có liên quan vào database, không may là quá trình này có thể gặp phải những vấn đề sau:

- Database đột ngột bị crash vì một lý do nào đó.
- Client đột ngột mất kết nối đến database do sự cố mạng.
- Khi truy cập database đồng thời, nhiều thread cùng ghi vào database, ghi đè lên các thay đổi của nhau.
- ……

Bất kỳ vấn đề nào ở trên đều có thể dẫn đến sự không nhất quán của dữ liệu. Để đảm bảo tính nhất quán của dữ liệu, hệ thống phải có khả năng xử lý các vấn đề này. Transaction là cơ chế ưu tiên mà chúng ta trừu tượng hóa để đơn giản hóa những vấn đề này. Khái niệm transaction bắt nguồn từ database, hiện tại đã trở thành một khái niệm khá rộng rãi.

**Transaction là gì?** Nói ngắn gọn, **transaction là một nhóm các thao tác theo logic, hoặc tất cả đều được thực thi, hoặc không thao tác nào được thực thi.**

Ví dụ kinh điển nhất của transaction thường được đưa ra là chuyển tiền. Giả sử Tiểu Minh muốn chuyển 1000 tệ cho Tiểu Hồng, việc chuyển tiền này liên quan đến hai thao tác then chốt, cả hai thao tác này phải đều thành công hoặc đều thất bại.

1. Giảm số dư của Tiểu Minh đi 1000 tệ
2. Tăng số dư của Tiểu Hồng lên 1000 tệ.

Transaction coi hai thao tác này là một thể thống nhất về mặt logic, các thao tác trong thể thống nhất này hoặc đều thành công, hoặc đều thất bại. Như vậy sẽ không xảy ra tình huống số dư của Tiểu Minh bị giảm nhưng số dư của Tiểu Hồng lại không tăng.

![事务示意图](https://oss.javaguide.cn/github/javaguide/mysql/%E4%BA%8B%E5%8A%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

### Database transaction là gì?

Trong hầu hết các trường hợp, khi chúng ta nói về transaction, nếu không đặc chỉ **distributed transaction**, thì thường có nghĩa là **database transaction**.

Database transaction là thứ chúng ta tiếp xúc nhiều nhất trong phát triển hàng ngày. Nếu dự án của bạn là kiến trúc monolithic, thì thứ bạn tiếp xúc thường là database transaction.

**Vậy database transaction có tác dụng gì?**

Nói đơn giản, database transaction có thể đảm bảo nhiều thao tác với database (tức là các câu lệnh SQL) tạo thành một thể thống nhất về mặt logic. Các thao tác database tạo thành thể thống nhất này tuân theo nguyên tắc: **hoặc tất cả đều thực thi thành công, hoặc không thao tác nào được thực thi**.

```sql
# 开启一个事务
START TRANSACTION;
# 多条 SQL 语句
SQL1,SQL2...
## 提交事务
COMMIT;
```

![数据库事务示意图](https://oss.javaguide.cn/github/javaguide/mysql/%E6%95%B0%E6%8D%AE%E5%BA%93%E4%BA%8B%E5%8A%A1%E7%A4%BA%E6%84%8F%E5%9B%BE.png)

Ngoài ra, transaction của các cơ sở dữ liệu quan hệ (ví dụ: `MySQL`, `SQL Server`, `Oracle`, v.v.) đều có đặc tính **ACID**:

![ACID](https://oss.javaguide.cn/github/javaguide/mysql/ACID.png)

1. **Tính nguyên tử** (`Atomicity`): Transaction là đơn vị thực thi nhỏ nhất, không cho phép phân chia. Tính nguyên tử của transaction đảm bảo các hành động hoặc hoàn thành toàn bộ, hoặc hoàn toàn không có tác dụng;
2. **Tính nhất quán** (`Consistency`): Trước và sau khi thực thi transaction, dữ liệu giữ nguyên nhất quán, ví dụ trong nghiệp vụ chuyển tiền, dù transaction thành công hay không, tổng số tiền của người chuyển và người nhận không thay đổi;
3. **Tính cô lập** (`Isolation`): Khi truy cập database đồng thời, transaction của một người dùng không bị can thiệp bởi các transaction khác, các transaction đồng thời độc lập với nhau trong database;
4. **Tính bền vững** (`Durability`): Sau khi một transaction được commit. Những thay đổi của nó đối với dữ liệu trong database là bền vững, ngay cả khi database gặp sự cố cũng không nên có bất kỳ ảnh hưởng nào đến nó.

🌈 Cần bổ sung thêm một điểm: **Chỉ khi đảm bảo tính bền vững, tính nguyên tử, tính cô lập của transaction, tính nhất quán mới có thể được bảo đảm. Nghĩa là A, I, D là phương tiện, C là mục đích!** Chắc hẳn mọi người cũng như tôi, đã bị khái niệm ACID này làm hiểu sai trong một thời gian dài! Tôi cũng chỉ hiểu ra điều này sau khi xem khóa học công khai của thầy Chu Chí Minh [《Khóa học kiến trúc phần mềm của Chu Chí Minh》](https://time.geekbang.org/opencourse/intro/100064201) (hãy đọc nhiều sách hay!!!).

![AID->C](https://oss.javaguide.cn/github/javaguide/mysql/AID-%3EC.png)

Ngoài ra, tác giả của DDIA tức là [《Designing Data-Intensive Application》](https://book.douban.com/subject/30329536/) đã nói trong cuốn sách của mình rằng:

> Atomicity, isolation, and durability are properties of the database, whereas consis‐
> tency (in the ACID sense) is a property of the application. The application may rely
> on the database's atomicity and isolation properties in order to achieve consistency,
> but it's not up to the database alone.
>
> Nghĩa là: Tính nguyên tử, tính cô lập và tính bền vững là các thuộc tính của database, còn tính nhất quán (theo nghĩa ACID) là thuộc tính của ứng dụng. Ứng dụng có thể dựa vào các thuộc tính tính nguyên tử và tính cô lập của database để đạt được tính nhất quán, nhưng điều này không chỉ phụ thuộc vào database. Do đó, chữ C không thuộc về ACID.

Cuốn sách 《Designing Data-Intensive Application》 này rất đáng đọc nhiều lần! Trên Douban có gần 90% người đọc cuốn sách này đã cho 5 sao. Ngoài ra, bản dịch tiếng Trung đã được mở nguồn trên GitHub, địa chỉ: [https://github.com/Vonng/ddia](https://github.com/Vonng/ddia).

![](https://oss.javaguide.cn/github/javaguide/books/ddia.png)

### Transaction đồng thời gây ra những vấn đề gì?

Trong các ứng dụng điển hình, nhiều transaction chạy đồng thời, thường thao tác cùng một dữ liệu để hoàn thành các tác vụ của mình (nhiều người dùng thao tác cùng một dữ liệu). Đồng thời là điều cần thiết, nhưng có thể dẫn đến các vấn đề sau.

#### Dirty read (Đọc bẩn)

Một transaction đọc dữ liệu và đã chỉnh sửa dữ liệu đó, sự chỉnh sửa này hiển thị với các transaction khác, ngay cả khi transaction hiện tại chưa commit. Lúc này một transaction khác đọc dữ liệu chưa được commit này, nhưng transaction đầu tiên đột ngột rollback, khiến dữ liệu không được commit vào database, thì transaction thứ hai đọc được dữ liệu bẩn, đây chính là nguồn gốc của dirty read.

Ví dụ: Transaction 1 đọc dữ liệu A=20 trong một bảng, transaction 1 sửa A=A-1, transaction 2 đọc được A=19, transaction 1 rollback khiến sửa đổi A không được commit vào database, giá trị của A vẫn là 20.

![脏读](https://oss.javaguide.cn/github/javaguide/database/mysql/concurrency-consistency-issues-dirty-reading.png)

#### Lost to modify (Mất cập nhật)

Khi một transaction đọc một dữ liệu, một transaction khác cũng truy cập dữ liệu đó, thì sau khi transaction đầu tiên sửa đổi dữ liệu này, transaction thứ hai cũng sửa đổi dữ liệu này. Như vậy kết quả sửa đổi trong transaction đầu tiên bị mất, do đó gọi là lost to modify.

Ví dụ: Transaction 1 đọc dữ liệu A=20 trong một bảng, transaction 2 cũng đọc A=20, transaction 1 trước sửa A=A-1, transaction 2 sau cũng sửa A=A-1, kết quả cuối cùng A=19, sửa đổi của transaction 1 bị mất.

![丢失修改](https://oss.javaguide.cn/github/javaguide/database/mysql/concurrency-consistency-issues-missing-modifications.png)

#### Unrepeatable read (Đọc không lặp lại)

Chỉ việc đọc cùng một dữ liệu nhiều lần trong một transaction. Khi transaction này chưa kết thúc, một transaction khác cũng truy cập dữ liệu đó. Thì giữa hai lần đọc dữ liệu trong transaction đầu tiên, do sửa đổi của transaction thứ hai khiến dữ liệu đọc được hai lần trong transaction đầu tiên có thể không giống nhau. Đây là tình huống đọc được dữ liệu khác nhau hai lần trong một transaction, do đó gọi là unrepeatable read.

Ví dụ: Transaction 1 đọc dữ liệu A=20 trong một bảng, transaction 2 cũng đọc A=20, transaction 1 sửa A=A-1, transaction 2 đọc lại A=19, lúc này kết quả đọc khác với lần đọc đầu tiên.

![不可重复读](https://oss.javaguide.cn/github/javaguide/database/mysql/concurrency-consistency-issues-unrepeatable-read.png)

#### Phantom read (Đọc ảo)

Phantom read tương tự unrepeatable read. Nó xảy ra khi một transaction đọc một số hàng dữ liệu, rồi một transaction đồng thời khác chèn thêm một số dữ liệu. Trong truy vấn tiếp theo, transaction đầu tiên sẽ phát hiện có thêm một số bản ghi vốn không tồn tại, giống như ảo giác vậy, nên gọi là phantom read.

Ví dụ: Transaction 2 đọc dữ liệu trong một phạm vi nhất định, transaction 1 chèn dữ liệu mới vào phạm vi này, transaction 2 đọc lại dữ liệu trong phạm vi này phát hiện có thêm dữ liệu mới so với lần đọc đầu tiên.

![幻读](https://oss.javaguide.cn/github/javaguide/database/mysql/concurrency-consistency-issues-phantom-read.png)

### Sự khác biệt giữa unrepeatable read và phantom read là gì?

- Trọng tâm của unrepeatable read là nội dung bị sửa đổi hoặc số lượng bản ghi giảm, ví dụ đọc một bản ghi nhiều lần phát hiện giá trị của một số bản ghi bị thay đổi;
- Trọng tâm của phantom read là số lượng bản ghi tăng thêm, ví dụ thực thi cùng một câu lệnh truy vấn (DQL) nhiều lần, phát hiện số bản ghi truy vấn được tăng lên.

Phantom read thực ra có thể được coi là một trường hợp đặc biệt của unrepeatable read, lý do tách riêng phantom read chủ yếu là giải pháp để giải quyết phantom read và unrepeatable read không giống nhau.

Ví dụ: Khi thực thi thao tác `delete` và `update`, có thể trực tiếp khóa bản ghi, đảm bảo an toàn transaction. Còn khi thực thi thao tác `insert`, vì record lock (khóa bản ghi) chỉ có thể khóa các bản ghi đã tồn tại, để tránh chèn bản ghi mới, cần phải dựa vào gap lock (khóa khoảng). Nghĩa là khi thực thi thao tác `insert` cần dựa vào Next-Key Lock (Record Lock+Gap Lock) để khóa nhằm đảm bảo không xảy ra phantom read.

### Các phương thức kiểm soát transaction đồng thời là gì?

Các phương thức kiểm soát transaction đồng thời trong MySQL không gì khác hơn hai loại: **lock** và **MVCC**. Lock có thể được coi là chế độ kiểm soát bi quan, kiểm soát đồng thời đa phiên bản (MVCC, Multiversion concurrency control) có thể được coi là chế độ kiểm soát lạc quan.

Chế độ kiểm soát **lock** sẽ kiểm soát tài nguyên chia sẻ một cách tường minh thông qua lock thay vì thông qua cơ chế lập lịch, trong MySQL chủ yếu là thông qua **read-write lock** để thực hiện kiểm soát đồng thời.

- **Shared lock (S lock)**: Còn gọi là read lock, transaction lấy shared lock khi đọc bản ghi, cho phép nhiều transaction đồng thời lấy (lock tương thích).
- **Exclusive lock (X lock)**: Còn gọi là write lock/independent lock, transaction lấy exclusive lock khi sửa đổi bản ghi, không cho phép nhiều transaction đồng thời lấy. Nếu một bản ghi đã bị thêm exclusive lock, thì các transaction khác không thể thêm bất kỳ loại lock nào cho bản ghi này (lock không tương thích).

Read-write lock có thể đạt được đọc-đọc song song, nhưng không thể đạt được ghi-đọc, ghi-ghi song song. Ngoài ra, tùy theo độ hạt của lock, còn được phân thành **table-level locking** và **row-level locking**. InnoDB không chỉ hỗ trợ table-level locking mà còn hỗ trợ row-level locking, mặc định là row-level locking. Row-level locking có độ hạt nhỏ hơn, chỉ cần khóa các bản ghi liên quan (khóa một hàng hoặc nhiều hàng bản ghi), do đó đối với các thao tác ghi đồng thời, hiệu suất của InnoDB cao hơn. Dù là table-level lock hay row-level lock, đều tồn tại hai loại là shared lock (Share Lock, S lock) và exclusive lock (Exclusive Lock, X lock).

**MVCC** là phương pháp kiểm soát đồng thời đa phiên bản, tức là đối với một dữ liệu sẽ lưu trữ nhiều phiên bản, thông qua khả năng hiển thị của transaction để đảm bảo transaction có thể thấy phiên bản mà nó cần thấy. Thường sẽ có một bộ phân phối phiên bản toàn cục để đặt số phiên bản cho mỗi hàng dữ liệu, số phiên bản là duy nhất.

Các phương tiện mà MVCC dựa vào để thực hiện trong MySQL chủ yếu là: **hidden fields, read view, undo log**.

- undo log: undo log dùng để ghi lại dữ liệu nhiều phiên bản của một hàng dữ liệu nhất định.
- read view và hidden fields: dùng để xác định khả năng hiển thị của dữ liệu phiên bản hiện tại.

Về cách triển khai cụ thể của InnoDB đối với MVCC có thể xem bài viết này: [Cách InnoDB Storage Engine triển khai MVCC](./innodb-implementation-of-mvcc.md).

### SQL standard định nghĩa những mức độ cô lập transaction nào?

SQL standard định nghĩa bốn mức độ cô lập transaction, dùng để cân bằng tính cô lập (Isolation) của transaction và hiệu suất đồng thời. Mức độ càng cao, tính nhất quán dữ liệu càng tốt, nhưng hiệu suất đồng thời có thể càng thấp. Bốn mức độ này là:

- **READ-UNCOMMITTED (Đọc chưa commit)**: Mức độ cô lập thấp nhất, cho phép đọc các thay đổi dữ liệu chưa được commit, có thể dẫn đến dirty read, phantom read hoặc unrepeatable read. Mức độ này rất ít được sử dụng trong thực tế vì sự đảm bảo về tính nhất quán dữ liệu quá yếu.
- **READ-COMMITTED (Đọc đã commit)**: Cho phép đọc dữ liệu mà các transaction đồng thời đã commit, có thể ngăn dirty read, nhưng phantom read hoặc unrepeatable read vẫn có thể xảy ra. Đây là mức độ cô lập mặc định của hầu hết các cơ sở dữ liệu (như Oracle, SQL Server).
- **REPEATABLE-READ (Đọc lặp lại được)**: Kết quả đọc nhiều lần cùng một trường đều nhất quán, trừ khi dữ liệu bị sửa đổi bởi chính transaction đó, có thể ngăn dirty read và unrepeatable read, nhưng phantom read vẫn có thể xảy ra. Mức độ cô lập mặc định của MySQL InnoDB storage engine chính là REPEATABLE READ. Và InnoDB ở mức độ này thông qua cơ chế MVCC (Multi-Version Concurrency Control) và Next-Key Locks (gap lock + row lock), giải quyết được phần lớn vấn đề phantom read.
- **SERIALIZABLE (Có thể tuần tự hóa)**: Mức độ cô lập cao nhất, tuân thủ hoàn toàn mức độ cô lập ACID. Tất cả các transaction được thực thi tuần tự từng cái một, như vậy giữa các transaction hoàn toàn không thể gây ra can thiệp, nghĩa là mức độ này có thể ngăn dirty read, unrepeatable read và phantom read.

| Mức độ cô lập    | Dirty Read | Non-Repeatable Read | Phantom Read                 |
| ---------------- | ---------- | ------------------- | ---------------------------- |
| READ UNCOMMITTED | √          | √                   | √                            |
| READ COMMITTED   | ×          | √                   | √                            |
| REPEATABLE READ  | ×          | ×                   | √ (tiêu chuẩn) / ≈× (InnoDB) |
| SERIALIZABLE     | ×          | ×                   | ×                            |

### Mức độ cô lập mặc định của MySQL là gì?

Mức độ cô lập mặc định của MySQL InnoDB storage engine là **REPEATABLE READ**. Có thể kiểm tra bằng các lệnh sau:

- Trước MySQL 8.0: `SELECT @@tx_isolation;`
- MySQL 8.0 trở đi: `SELECT @@transaction_isolation;`

```sql
mysql> SELECT @@tx_isolation;
+-----------------+
| @@tx_isolation  |
+-----------------+
| REPEATABLE-READ |
+-----------------+
```

Về giới thiệu chi tiết về mức độ cô lập transaction của MySQL, có thể xem bài viết tôi viết: [Giải thích chi tiết mức độ cô lập transaction MySQL](./transaction-isolation-level.md).

### Mức độ cô lập của MySQL có được thực hiện dựa trên lock không?

Mức độ cô lập của MySQL được thực hiện dựa trên cả lock và cơ chế MVCC cùng nhau.

Mức độ cô lập SERIALIZABLE được thực hiện thông qua lock, mức độ cô lập READ-COMMITTED và REPEATABLE-READ được thực hiện dựa trên MVCC. Tuy nhiên, các mức độ cô lập ngoài SERIALIZABLE cũng có thể cần sử dụng cơ chế lock, ví dụ REPEATABLE-READ trong tình huống current read cần sử dụng locking read để đảm bảo không xảy ra phantom read.

## MySQL Lock

Lock là một phương thức kiểm soát transaction đồng thời phổ biến.

### Bạn có biết về table-level lock và row-level lock không? Sự khác biệt là gì?

MyISAM chỉ hỗ trợ table-level locking, khóa cả bảng một lần, hiệu suất rất kém trong tình huống ghi đồng thời. InnoDB không chỉ hỗ trợ table-level locking mà còn hỗ trợ row-level locking, mặc định là row-level locking.

Row-level lock có độ hạt nhỏ hơn, chỉ cần khóa các bản ghi liên quan (khóa một hàng hoặc nhiều hàng bản ghi), do đó đối với các thao tác ghi đồng thời, hiệu suất của InnoDB cao hơn.

**So sánh table-level lock và row-level lock**:

- **Table-level lock:** Loại lock có độ hạt khóa lớn nhất trong MySQL (ngoại trừ global lock), là lock thêm vào trường không phải index, khóa toàn bộ bảng đang thao tác, dễ triển khai, tốn ít tài nguyên, khóa nhanh, không xảy ra deadlock. Tuy nhiên, xác suất xung đột lock cao nhất, hiệu suất cực kém trong high concurrency. Table-level lock không liên quan đến storage engine, cả engine MyISAM và InnoDB đều hỗ trợ table-level lock.
- **Row-level lock:** Loại lock có độ hạt khóa nhỏ nhất trong MySQL, là **lock thêm vào trường index**, chỉ khóa hàng bản ghi đang được thao tác. Row-level lock có thể giảm đáng kể xung đột trong thao tác database. Độ hạt khóa nhỏ nhất, độ đồng thời cao, nhưng chi phí khóa cũng lớn nhất, khóa chậm, có thể xảy ra deadlock. Row-level lock liên quan đến storage engine, được triển khai ở tầng storage engine.

### Có những lưu ý gì khi sử dụng row-level lock?

Row lock của InnoDB là lock thêm vào trường index, table-level lock là lock thêm vào trường không phải index. Khi chúng ta thực thi câu lệnh `UPDATE`, `DELETE`, nếu trường trong điều kiện `WHERE` không đánh trúng unique index hoặc index bị vô hiệu, sẽ dẫn đến quét toàn bảng và khóa tất cả các hàng bản ghi trong bảng. Điều này thường xuyên gặp phải trong công việc phát triển hàng ngày của chúng ta, nhất định phải chú ý!!!

Tuy nhiên, nhiều khi ngay cả khi đã dùng index cũng có thể quét toàn bảng, đó là do nguyên nhân của MySQL optimizer.

### InnoDB có những loại row lock nào?

Row lock của InnoDB được thực hiện thông qua việc khóa bản ghi trên trang dữ liệu index, MySQL InnoDB hỗ trợ ba phương thức khóa hàng:

- **Record Lock**: Là lock trên một bản ghi hàng đơn lẻ.
- **Gap Lock**: Khóa một phạm vi, không bao gồm bản ghi bản thân.
- **Next-Key Lock**: Record Lock+Gap Lock, khóa một phạm vi, bao gồm bản ghi bản thân, mục đích chính là để giải quyết vấn đề phantom read (đã đề cập trong phần MySQL transaction). Record lock chỉ có thể khóa các bản ghi đã tồn tại, để tránh chèn bản ghi mới, cần phải dựa vào gap lock.

**Trong mức độ cô lập mặc định của InnoDB là REPEATABLE-READ, row lock mặc định sử dụng Next-Key Lock. Nhưng, nếu index đang thao tác là unique index hoặc primary key, InnoDB sẽ tối ưu hóa Next-Key Lock, hạ cấp nó xuống thành Record Lock, tức là chỉ khóa index bản thân, không phải phạm vi.**

### Shared lock và exclusive lock là gì?

Dù là table-level lock hay row-level lock, đều tồn tại hai loại là shared lock (Share Lock, S lock) và exclusive lock (Exclusive Lock, X lock):

- **Shared lock (S lock)**: Còn gọi là read lock, transaction lấy shared lock khi đọc bản ghi, cho phép nhiều transaction đồng thời lấy (lock tương thích).
- **Exclusive lock (X lock)**: Còn gọi là write lock/independent lock, transaction lấy exclusive lock khi sửa đổi bản ghi, không cho phép nhiều transaction đồng thời lấy. Nếu một bản ghi đã bị thêm exclusive lock, thì các transaction khác không thể thêm bất kỳ loại lock nào cho transaction này (lock không tương thích).

Exclusive lock không tương thích với bất kỳ lock nào, shared lock chỉ tương thích với shared lock.

|        | S lock         | X lock   |
| :----- | :------------- | :------- |
| S lock | Không xung đột | Xung đột |
| X lock | Xung đột       | Xung đột |

Do sự tồn tại của MVCC, đối với câu lệnh `SELECT` thông thường, InnoDB sẽ không thêm bất kỳ lock nào. Tuy nhiên, bạn có thể hiển thị thêm shared lock hoặc exclusive lock thông qua các câu lệnh sau.

```sql
# 共享锁 可以在 MySQL 5.7 和 MySQL 8.0 中使用
SELECT ... LOCK IN SHARE MODE;
# 共享锁 可以在 MySQL 8.0 中使用
SELECT ... FOR SHARE;
# 排他锁
SELECT ... FOR UPDATE;
```

### Intention lock có tác dụng gì?

Nếu cần sử dụng table lock, làm thế nào để xác định không có row lock trong bảng, duyệt từng hàng một chắc chắn không được, hiệu suất quá kém. Chúng ta cần sử dụng một thứ gọi là intention lock để nhanh chóng xác định xem có thể sử dụng table lock cho một bảng nào đó hay không.

Intention lock là table-level lock, có hai loại:

- **Intention Shared Lock (IS lock)**: Transaction có ý định thêm shared lock (S lock) cho một số bản ghi trong bảng, trước khi thêm shared lock phải lấy IS lock của bảng đó trước.
- **Intention Exclusive Lock (IX lock)**: Transaction có ý định thêm exclusive lock (X lock) cho một số bản ghi trong bảng, trước khi thêm exclusive lock phải lấy IX lock của bảng đó trước.

**Intention lock do data engine tự duy trì, người dùng không thể thao tác intention lock thủ công, trước khi thêm shared/exclusive lock cho hàng dữ liệu, InnoDB sẽ lấy intention lock tương ứng của bảng dữ liệu nơi hàng dữ liệu đó nằm.**

Các intention lock tương thích với nhau.

|         | IS lock     | IX lock     |
| ------- | ----------- | ----------- |
| IS lock | Tương thích | Tương thích |
| IX lock | Tương thích | Tương thích |

Intention lock và shared lock và exclusive lock xung đột với nhau (ở đây chỉ shared lock và exclusive lock ở mức table, intention lock sẽ không xung đột với shared lock và exclusive lock ở mức hàng).

|        | IS lock     | IX lock  |
| ------ | ----------- | -------- |
| S lock | Tương thích | Xung đột |
| X lock | Xung đột    | Xung đột |

Mô tả tương ứng trong cuốn sách 《MySQL Internals: InnoDB Storage Engine》 có lẽ là lỗi đánh máy.

![](https://oss.javaguide.cn/github/javaguide/mysql/image-20220511171419081.png)

### Sự khác biệt giữa current read và snapshot read là gì?

**Snapshot read** (consistent non-locking read) là câu lệnh `SELECT` đơn thuần, nhưng không bao gồm hai loại câu lệnh `SELECT` sau:

```sql
SELECT ... FOR UPDATE
# 共享锁 可以在 MySQL 5.7 和 MySQL 8.0 中使用
SELECT ... LOCK IN SHARE MODE;
# 共享锁 可以在 MySQL 8.0 中使用
SELECT ... FOR SHARE;
```

Snapshot là phiên bản lịch sử của bản ghi, mỗi hàng bản ghi có thể có nhiều phiên bản lịch sử (công nghệ đa phiên bản).

Trong trường hợp snapshot read, nếu bản ghi đang được đọc đang thực thi thao tác UPDATE/DELETE, thao tác đọc sẽ không chờ X lock trên bản ghi được giải phóng mà thay vào đó sẽ đọc một snapshot của hàng.

Chỉ trong mức độ cô lập transaction RC (read committed) và RR (repeatable read), InnoDB mới sử dụng consistent non-locking read:

- Trong mức RC, đối với dữ liệu snapshot, consistent non-locking read luôn đọc phiên bản snapshot mới nhất của hàng bị khóa.
- Trong mức RR, đối với dữ liệu snapshot, consistent non-locking read luôn đọc phiên bản dữ liệu hàng khi bắt đầu transaction hiện tại.

Snapshot read phù hợp hơn cho các tình huống nghiệp vụ không yêu cầu tính nhất quán dữ liệu quá cao mà theo đuổi hiệu suất tối đa.

**Current read** (consistent locking read) là thêm X lock hoặc S lock vào bản ghi hàng.

Một số loại câu lệnh SQL phổ biến của current read như sau:

```sql
# 对读的记录加一个X锁
SELECT...FOR UPDATE
# 对读的记录加一个S锁
SELECT...LOCK IN SHARE MODE
# 对读的记录加一个S锁
SELECT...FOR SHARE
# 对修改的记录加一个X锁
INSERT...
UPDATE...
DELETE...
```

### Bạn có biết về auto-increment lock không?

> Đây là một điểm kiến thức không quá quan trọng, chỉ cần hiểu sơ qua.

Khi thiết kế bảng cơ sở dữ liệu quan hệ, thường sẽ có một cột làm primary key tự tăng. Primary key tự tăng trong InnoDB liên quan đến một loại table-level lock khá đặc biệt — **auto-increment lock (AUTO-INC Locks)**.

```sql
CREATE TABLE `sequence_id` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `stub` CHAR(10) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  UNIQUE KEY `stub` (`stub`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

Nói chính xác hơn, không chỉ là primary key tự tăng, các cột có `AUTO_INCREMENT` đều liên quan đến auto-increment lock, bởi vì non-primary key cũng có thể được đặt tự tăng.

Nếu một transaction đang chèn dữ liệu vào bảng có cột tự tăng, trước tiên sẽ lấy auto-increment lock, không lấy được có thể bị block. Hành vi block ở đây chỉ là một trong các hành vi của auto-increment lock, có thể hiểu auto-increment lock như một interface, có nhiều triển khai cụ thể. Cấu hình cụ thể là `innodb_autoinc_lock_mode` (được giới thiệu trong MySQL 5.1.22), các giá trị có thể chọn như sau:

| innodb_autoinc_lock_mode | Giới thiệu                                 |
| :----------------------- | :----------------------------------------- |
| 0                        | Chế độ truyền thống                        |
| 1                        | Chế độ liên tục (mặc định trước MySQL 8.0) |
| 2                        | Chế độ xen kẽ (mặc định sau MySQL 8.0)     |

Trong chế độ xen kẽ, tất cả các câu lệnh "INSERT-LIKE" (tất cả các câu lệnh chèn, bao gồm: `INSERT`, `REPLACE`, `INSERT…SELECT`, `REPLACE…SELECT`, `LOAD DATA`, v.v.) đều không sử dụng table-level lock, sử dụng mutex lightweight để triển khai, nhiều câu lệnh chèn có thể thực thi đồng thời, tốc độ nhanh hơn, khả năng mở rộng cũng tốt hơn.

Tuy nhiên, nếu database MySQL của bạn có nhu cầu đồng bộ hóa master-slave và định dạng lưu trữ Binlog là Statement, đừng đặt chế độ auto-increment lock của InnoDB là chế độ xen kẽ, nếu không sẽ có vấn đề không nhất quán dữ liệu. Điều này là vì trong tình huống đồng thời, thứ tự thực thi của các câu lệnh chèn không thể được đảm bảo.

> Nếu MySQL sử dụng định dạng Statement, thì master-slave sync của MySQL thực tế là đồng bộ từng câu SQL một.

Cuối cùng, xin giới thiệu thêm một bài viết: [Tại sao primary key tự tăng của MySQL không đơn điệu và cũng không liên tục](https://draveness.me/whys-the-design-mysql-auto-increment/).

## ⭐️MySQL Tối ưu hóa hiệu suất

Về tổng hợp các gợi ý tối ưu hóa hiệu suất MySQL, vui lòng xem bài viết này: [Tổng hợp các gợi ý tối ưu hóa hiệu suất cao MySQL](./mysql-high-performance-optimization-specification-recommendations.md).

### Có thể dùng MySQL để lưu trực tiếp file (ví dụ hình ảnh) không?

Có thể, chỉ cần lưu trực tiếp dữ liệu nhị phân tương ứng của file. Tuy nhiên, vẫn nên tránh lưu file trong database, sẽ ảnh hưởng nghiêm trọng đến hiệu suất database, tiêu tốn quá nhiều dung lượng lưu trữ.

Có thể chọn sử dụng dịch vụ lưu trữ file ready-to-use do các nhà cung cấp dịch vụ đám mây cung cấp, ổn định và giá cả cũng khá thấp.

![](https://oss.javaguide.cn/github/javaguide/mysql/oss-search.png)

Cũng có thể chọn tự xây dựng dịch vụ lưu trữ file, triển khai cũng không khó, dựa trên các dự án mã nguồn mở như FastDFS, MinIO (khuyến nghị), v.v. có thể triển khai dịch vụ file phân tán.

**Database chỉ lưu thông tin địa chỉ file, file do dịch vụ lưu trữ file chịu trách nhiệm lưu trữ.**

### MySQL lưu trữ địa chỉ IP như thế nào?

Có thể chuyển đổi địa chỉ IP thành dữ liệu số nguyên để lưu trữ, hiệu suất tốt hơn, chiếm ít dung lượng hơn.

MySQL cung cấp hai phương thức để xử lý địa chỉ ip

- `INET_ATON()`: Chuyển ip sang số nguyên không dấu (4-8 chữ số)
- `INET_NTOA()`: Chuyển ip kiểu số nguyên về địa chỉ

Trước khi chèn dữ liệu, dùng `INET_ATON()` để chuyển địa chỉ ip thành số nguyên, khi hiển thị dữ liệu, dùng `INET_NTOA()` để chuyển địa chỉ ip kiểu số nguyên về địa chỉ để hiển thị.

### Có những phương pháp tối ưu SQL phổ biến nào?

Phần **"Phần câu hỏi phỏng vấn kỹ thuật"** của [《Hướng dẫn phỏng vấn Java》(có phí)](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html) có một bài viết giới thiệu chi tiết về các phương pháp tối ưu SQL phổ biến, rất toàn diện, rõ ràng và dễ hiểu!

![Các phương pháp tối ưu SQL phổ biến](https://oss.javaguide.cn/javamianshizhibei/javamianshizhibei-sql-optimization.png)

Địa chỉ bài viết: https://www.yuque.com/snailclimb/mf2z3k/abc2sv (lấy mật khẩu: <https://t.zsxq.com/avfM0>).

### Làm thế nào để phân tích hiệu suất SQL?

Chúng ta có thể sử dụng lệnh `EXPLAIN` để phân tích **execution plan** của SQL. Execution plan là cách thực thi cụ thể của một câu lệnh SQL sau khi được tối ưu hóa bởi MySQL query optimizer.

`EXPLAIN` không thực sự thực thi các câu lệnh liên quan, mà thông qua **query optimizer** để phân tích câu lệnh, tìm ra phương án truy vấn tối ưu nhất và hiển thị thông tin tương ứng.

`EXPLAIN` áp dụng cho các câu lệnh `SELECT`, `DELETE`, `INSERT`, `REPLACE` và `UPDATE`, thông thường chúng ta phân tích truy vấn `SELECT` nhiều hơn.

Ở đây chúng ta demo đơn giản cách sử dụng `EXPLAIN`.

Định dạng đầu ra của `EXPLAIN` như sau:

```sql
mysql> EXPLAIN SELECT `score`,`name` FROM `cus_order` ORDER BY `score` DESC;
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
| id | select_type | table     | partitions | type | possible_keys | key  | key_len | ref  | rows   | filtered | Extra          |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
|  1 | SIMPLE      | cus_order | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 997572 |   100.00 | Using filesort |
+----+-------------+-----------+------------+------+---------------+------+---------+------+--------+----------+----------------+
1 row in set, 1 warning (0.00 sec)
```

Ý nghĩa của các trường như sau:

| **Tên cột**   | **Ý nghĩa**                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| id            | Số định danh thứ tự của truy vấn SELECT                                       |
| select_type   | Loại truy vấn tương ứng với từ khóa SELECT                                    |
| table         | Tên bảng được sử dụng                                                         |
| partitions    | Partition khớp, đối với bảng không phân vùng, giá trị là NULL                 |
| type          | Phương thức truy cập bảng                                                     |
| possible_keys | Index có thể được sử dụng                                                     |
| key           | Index thực tế được sử dụng                                                    |
| key_len       | Độ dài của index được chọn                                                    |
| ref           | Khi sử dụng truy vấn đẳng thức index, cột hoặc hằng số được so sánh với index |
| rows          | Số hàng dự kiến cần đọc                                                       |
| filtered      | Tỷ lệ phần trăm số bản ghi còn lại sau khi lọc theo điều kiện bảng            |
| Extra         | Thông tin bổ sung                                                             |

Do giới hạn về độ dài, ở đây tôi chỉ giới thiệu sơ qua về MySQL execution plan, giới thiệu chi tiết vui lòng xem bài viết: [Execution plan của SQL](./mysql-query-execution-plan.md).

### Bạn có biết về read-write separation và database sharding không?

Các câu hỏi liên quan đến read-write separation và database sharding khá nhiều, vì vậy tôi đã viết riêng một bài viết để giới thiệu: [Giải thích chi tiết về read-write separation và database sharding](../../high-performance/read-and-write-separation-and-library-subtable.md).

### Làm thế nào để tối ưu hóa deep pagination?

[Giới thiệu và gợi ý tối ưu hóa deep pagination](../../high-performance/deep-pagination-optimization.md)

### Làm thế nào để phân tách dữ liệu nóng lạnh?

[Giải thích chi tiết về phân tách dữ liệu nóng lạnh](../../high-performance/data-cold-hot-separation.md)

### Làm thế nào để tối ưu hóa hiệu suất MySQL?

Tối ưu hóa hiệu suất MySQL là một công việc có hệ thống, liên quan đến nhiều khía cạnh, trong phỏng vấn không thể nói hết tất cả. Do đó, nên theo tư duy "điểm-đường-mặt" để triển khai, bắt đầu từ vấn đề cốt lõi rồi mở rộng dần, thể hiện chiều sâu suy nghĩ và năng lực giải quyết vấn đề của bạn.

**1. Nắm bắt cốt lõi: Xác định và phân tích Slow SQL**

Bước đầu tiên của tối ưu hóa hiệu suất luôn là tìm ra nút thắt cổ chai. Trong phỏng vấn, nên bắt đầu từ **xác định và phân tích Slow SQL**, điều này không chỉ thể hiện tư duy giải quyết vấn đề của bạn mà còn thể hiện sự thành thạo về giám sát hiệu suất database:

- **Công cụ giám sát:** Giới thiệu các công cụ giám sát Slow SQL thông dụng như **MySQL slow query log**, **Performance Schema**, v.v., nói rõ mức độ quen thuộc của bạn với các công cụ này và cách sử dụng chúng để xác định vấn đề.
- **Lệnh EXPLAIN:** Giải thích chi tiết cách sử dụng lệnh `EXPLAIN`, phân tích execution plan, tình trạng sử dụng index, có thể kết hợp với các trường hợp thực tế để thể hiện cách đọc và phân tích kết quả, như thứ tự thực thi, tình trạng sử dụng index, full table scan, v.v.

**2. Từ điểm đến diện: Tối ưu hóa index, cấu trúc bảng và SQL**

Sau khi xác định được Slow SQL, bước tiếp theo là tối ưu hóa vấn đề cụ thể. Ở đây có thể trọng điểm giới thiệu các kỹ thuật tối ưu hóa về index, cấu trúc bảng và quy chuẩn viết SQL:

- **Tối ưu hóa index:** Đây là trọng điểm của tối ưu hóa hiệu suất MySQL, có thể giới thiệu nguyên tắc tạo index, covering index, nguyên tắc khớp leftmost prefix, v.v. Nếu có thể kết hợp với ứng dụng thực tế trong dự án của bạn để nói rõ cách chọn index phù hợp, sẽ ghi điểm hơn.
- **Tối ưu hóa cấu trúc bảng:** Tối ưu thiết kế cấu trúc bảng, bao gồm chọn kiểu trường phù hợp, tránh trường dư thừa, sử dụng hợp lý normalization và denormalization, v.v.
- **Tối ưu hóa SQL:** Tránh dùng `SELECT *`, cố gắng dùng các trường cụ thể, dùng join query thay cho subquery, sử dụng hợp lý pagination query, thao tác batch, v.v., đều là các chi tiết cần chú ý trong quá trình viết SQL.

**3. Giải pháp nâng cao: Tối ưu hóa kiến trúc**

Khi người phỏng vấn khá hài lòng với kiến thức tối ưu hóa cơ bản, họ có thể đi sâu vào thảo luận về một số giải pháp tối ưu hóa ở tầng kiến trúc. Dưới đây là một số chiến lược tối ưu hóa kiến trúc phổ biến:

- **Read-write separation:** Tách biệt các thao tác đọc và ghi sang các database instance khác nhau, nâng cao khả năng xử lý đồng thời của database.
- **Database sharding:** Phân tán dữ liệu vào nhiều database instance hoặc bảng dữ liệu, giảm lượng dữ liệu của bảng đơn, nâng cao hiệu suất truy vấn. Nhưng cần cân nhắc sự phức tạp và chi phí bảo trì mà nó mang lại, sử dụng thận trọng.
- **Phân tách dữ liệu nóng lạnh**: Dựa trên tần suất truy cập và tầm quan trọng của nghiệp vụ, phân dữ liệu thành dữ liệu lạnh và dữ liệu nóng, dữ liệu lạnh thường được lưu trữ trên phương tiện có chi phí thấp, hiệu suất thấp, dữ liệu nóng được lưu trữ trên phương tiện lưu trữ hiệu suất cao.
- **Cơ chế cache:** Sử dụng middleware cache như Redis, cache dữ liệu hot vào bộ nhớ, giảm áp lực cho database. Cái này rất phổ biến, hiệu quả nâng cao rất rõ rệt, tỷ lệ hiệu quả/chi phí cực cao!

**4. Các phương pháp tối ưu hóa khác**

Ngoài xác định Slow SQL, tối ưu hóa index và tối ưu hóa kiến trúc, còn có thể đề cập đến một số phương pháp tối ưu hóa khác, thể hiện sự hiểu biết toàn diện về tối ưu hóa hiệu suất MySQL:

- **Cấu hình connection pool:** Cấu hình connection pool database hợp lý (như **kích thước connection pool**, **thời gian timeout**, v.v.), có thể cải thiện hiệu quả kết nối database, tránh chi phí kết nối thường xuyên.
- **Cấu hình phần cứng:** Nâng cấp hiệu suất phần cứng cũng là một trong những biện pháp tối ưu hóa quan trọng. Sử dụng server hiệu suất cao, tăng bộ nhớ, sử dụng ổ cứng **SSD**, v.v., các nâng cấp phần cứng đều có thể cải thiện hiệu quả hiệu suất tổng thể của database.

**5. Tổng kết**

Trong phỏng vấn, nên lần lượt giới thiệu theo thứ tự ưu tiên về xác định Slow SQL, [tối ưu hóa index](./mysql-index.md), thiết kế cấu trúc bảng và [tối ưu hóa SQL](../../high-performance/sql-optimization.md). Các tối ưu hóa ở tầng kiến trúc như [read-write separation và database sharding](../../high-performance/read-and-write-separation-and-library-subtable.md), [phân tách dữ liệu nóng lạnh](../../high-performance/data-cold-hot-separation.md) nên là biện pháp cuối cùng, trừ khi có nút thắt hiệu suất rõ ràng trong tình huống cụ thể, nếu không không nên sử dụng tùy tiện, vì sự phức tạp mà nó mang lại sẽ tạo ra chi phí bảo trì thêm.

## Tài liệu học MySQL được đề xuất

[**Đề xuất sách**](../../books/database.md#mysql).

**Đề xuất bài viết**:

- [Chuỗi hướng dẫn MySQL của Yishu Yixi](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzg3NTc3NjM4Nw==&action=getalbum&album_id=2372043523518300162&scene=173&from_msgid=2247484308&from_itemidx=1&count=3&nolastread=1#wechat_redirect)
- [Chuỗi hướng dẫn MySQL của Yes](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzkxNTE3NjQ3MA==&action=getalbum&album_id=1903249596194095112&scene=173&from_msgid=2247490365&from_itemidx=1&count=3&nolastread=1#wechat_redirect)
- [Viết xong bài này, khả năng tối ưu SQL của tôi đã lên một tầm mới - Biancheng Pai Da Xing - 2022](https://juejin.cn/post/7161964571853815822)
- [Giải thích chi tiết 20.000 chữ! Chuyên đề lock InnoDB! - Jiandianluodexiaonanhai - 2022](https://juejin.cn/post/7094049650428084232)
- [Primary key tự tăng của MySQL có nhất thiết liên tục không? - Feitianxiaoniu - 2022](https://mp.weixin.qq.com/s/qci10h9rJx_COZbHV3aygQ)
- [Hiểu sâu nguyên lý nền tảng của MySQL index - Tencent Technology Engineering - 2020](https://zhuanlan.zhihu.com/p/113917726)

## Tham khảo

- 《High Performance MySQL》Chương 7 Tính năng nâng cao MySQL
- 《MySQL Internals: InnoDB Storage Engine》Chương 6 Lock
- Relational Database：<https://www.omnisci.com/technical-glossary/relational-database>
- Một bài viết giải thích varchar trong mysql có thể lưu bao nhiêu ký tự Hán, số, và sự khác biệt giữa varchar(100) và varchar(10)：<https://www.cnblogs.com/zhuyeshen/p/11642211.html>
- Chia sẻ kỹ thuật | Mức độ cô lập: Hiểu đúng về phantom read：<https://opensource.actionsky.com/20210818-mysql/>
- MySQL Server Logs - MySQL 5.7 Reference Manual：<https://dev.mysql.com/doc/refman/5.7/en/server-logs.html>
- Redo Log - MySQL 5.7 Reference Manual：<https://dev.mysql.com/doc/refman/5.7/en/innodb-redo-log.html>
- Locking Reads - MySQL 5.7 Reference Manual：<https://dev.mysql.com/doc/refman/5.7/en/innodb-locking-reads.html>
- Hiểu sâu row lock và table lock trong database <https://zhuanlan.zhihu.com/p/52678870>
- Giải thích chi tiết vai trò của intention lock trong MySQL InnoDB：<https://juejin.cn/post/6844903666332368909>
- Phân tích sâu auto-increment lock của MySQL：<https://juejin.cn/post/6968420054287253540>
- Trong database, unrepeatable read và phantom read thực sự nên phân biệt như thế nào?：<https://www.zhihu.com/question/392569386>

<!-- @include: @article-footer.snippet.md -->
