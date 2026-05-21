---
title: Giải thích chi tiết Character Set
description: Giải thích chi tiết nguyên lý character set và character encoding, phân tích sâu ASCII, GB2312, GBK, UTF-8, UTF-16 và các encoding phổ biến, giải thích sự khác biệt giữa utf8 và utf8mb4 trong MySQL cùng giải pháp cho vấn đề lưu trữ emoji.
category: Database
tag:
  - Database Basics
head:
  - - meta
    - name: keywords
      content: character set,character encoding,UTF-8,UTF-16,GBK,GB2312,utf8mb4,ASCII,Unicode,MySQL character set,emoji storage
---

MySQL character encoding có hai bộ triển khai UTF-8: **`utf8`** và **`utf8mb4`**.

Nếu dùng **`utf8`**, việc lưu trữ emoji symbol và một số ký tự Hán phức tạp, chữ phồn thể sẽ bị lỗi.

Tại sao vậy? Bài viết này sẽ giải thích cho bạn từ gốc rễ.

## Character Set là gì?

Character (ký tự) là tên gọi chung của các loại chữ viết và ký hiệu, bao gồm chữ của các quốc gia khác nhau, dấu câu, biểu tượng cảm xúc, số v.v. **Character set** là tập hợp của một loạt ký tự. Có nhiều loại character set, phạm vi ký tự mà mỗi character set có thể đại diện thường khác nhau. Ví dụ một số character set không thể biểu thị ký tự Hán.

**Máy tính chỉ có thể lưu trữ dữ liệu nhị phân, vậy ký tự như tiếng Anh, tiếng Trung, biểu tượng cảm xúc nên được lưu trữ như thế nào?**

Chúng ta cần ánh xạ một-một các ký tự này với dữ liệu nhị phân, ví dụ ký tự "a" tương ứng với "01100001", ngược lại "01100001" tương ứng với "a". Chúng ta gọi quá trình ánh xạ ký tự sang dữ liệu nhị phân là "**character encoding**", ngược lại, quá trình parse dữ liệu nhị phân thành ký tự là "**character decoding**".

## Character Encoding là gì?

Character encoding là một phương pháp chuyển đổi qua lại giữa các ký tự trong character set và dữ liệu nhị phân trong máy tính, có thể coi là một quy tắc mapping. Tức là, mục đích của character encoding là để máy tính có thể lưu trữ và truyền đạt thông tin văn bản các loại.

Mỗi character set đều có quy tắc character encoding riêng. Các quy tắc encoding phổ biến gồm: ASCII encoding, GB2312 encoding, GBK encoding, GB18030 encoding, Big5 encoding, UTF-8 encoding, UTF-16 encoding.

## Có những character set phổ biến nào?

Các character set phổ biến: ASCII, GB2312, GB18030, GBK, Unicode...

Sự khác biệt chính giữa các character set là:

- Phạm vi ký tự có thể đại diện
- Cách encoding

### ASCII

**ASCII** (**A**merican **S**tandard **C**ode for **I**nformation **I**nterchange) là một character set chủ yếu dùng cho tiếng Anh hiện đại của Mỹ (đây cũng là hạn chế của ASCII character set).

**Tại sao ASCII character set không tính đến tiếng Trung và các ký tự khác?** Vì máy tính do người Mỹ phát minh, lúc đó sự phát triển của máy tính còn ở giai đoạn khá sơ khai, chưa được sử dụng rộng rãi ở các quốc gia khác. Vì vậy, khi Mỹ phát hành ASCII character set, không xét đến việc tương thích với ngôn ngữ của các quốc gia khác.

ASCII character set đến nay đã định nghĩa tổng cộng 128 ký tự, trong đó có 33 control character (như carriage return, delete) không thể hiển thị.

Độ dài của một ASCII code là một byte tức là 8 bit, ví dụ "a" tương ứng ASCII code là "01100001". Tuy nhiên, bit cao nhất là 0 chỉ dùng như checksum bit, 7 bit còn lại dùng 0 và 1 để tổ hợp, vì vậy ASCII character set có thể định nghĩa 128 (2^7) ký tự.

Vì số ký tự mà ASCII code có thể biểu thị thực sự quá ít. Sau đó, người ta mở rộng nó thành **Extended ASCII character set**. Extended ASCII character set dùng 8 bit để biểu thị một ký tự, vì vậy có thể định nghĩa 256 (2^8) ký tự.

![ASCII character encoding](/images/github/javaguide/csdn/c1c6375d08ca268690cef2b13591a5b4.png)

### GB2312

Như đã nói ở trên, ASCII character set là character set thích hợp với tiếng Anh Mỹ hiện đại. Vì vậy, nhiều quốc gia đã tạo ra character set phù hợp với ngôn ngữ của quốc gia mình.

GB2312 character set là một character set thân thiện với ký tự Hán, gồm hơn 6700 ký tự Hán, về cơ bản bao gồm phần lớn ký tự Hán thường dùng. Tuy nhiên, GB2312 character set không hỗ trợ phần lớn ký tự Hán hiếm và chữ phồn thể.

Đối với ký tự tiếng Anh, GB2312 encoding và ASCII code giống nhau, 1 byte encoding là đủ. Đối với ký tự không phải tiếng Anh, cần 2 byte encoding.

### GBK

GBK character set có thể coi là mở rộng của GB2312 character set, tương thích với GB2312 character set, gồm hơn 20000 ký tự Hán.

Chữ K trong GBK là chữ đầu của "Kuo" trong "Kuo Zhan" (mở rộng) của pinyin tiếng Trung.

### GB18030

GB18030 hoàn toàn tương thích với GB2312 và GBK character set, tích hợp chữ viết của các dân tộc thiểu số trong nước, và bao gồm ký tự Hán Nhật Hàn, là character set Hán toàn diện nhất từ trước đến nay, gồm hơn 70000 ký tự Hán.

### BIG5

BIG5 chủ yếu nhắm đến phồn thể tiếng Trung, gồm hơn 13000 ký tự Hán.

### Unicode & UTF-8

Để phù hợp hơn với ngôn ngữ của từng quốc gia, nhiều loại character set đã ra đời.

Như đã nói ở trên, phạm vi ký tự mà các character set khác nhau có thể đại diện và quy tắc encoding có sự khác biệt. Điều này dẫn đến một vấn đề rất nghiêm trọng: **Dùng phương pháp encoding sai để xem một file chứa ký tự sẽ tạo ra hiện tượng "garbled text" (mã lỗi).**

Ví dụ dùng UTF-8 encoding để mở file định dạng GB2312 encoding sẽ bị garbled text. Ví dụ: ký tự Hán "牛" sau GB2312 encoding có giá trị hex là "C5A3", còn "C5A3" decode bằng UTF-8 lại được "ţ".

Bạn có thể encoding và decoding online qua website này: <https://www.haomeili.net/HanZi/ZiFuBianMaZhuanHuan>

![](/images/github/javaguide/csdn/836c49b117ee4408871b0020b74c991d.png)

Như vậy chúng ta hiểu được bản chất của garbled text: **Khi encoding và decoding dùng character set khác nhau hoặc không tương thích**.

![](/images/javaguide/a8808cbabeea49caa3af27d314fa3c02-1.jpg)

Để giải quyết vấn đề này, người ta nghĩ: "Giá như chúng ta có một character set bao gồm tất cả các ký tự trên thế giới thì tốt biết mấy!"

Và thế là **Unicode** ra đời với sứ mệnh đó.

Unicode character set bao gồm gần như tất cả các ký tự đã biết trên thế giới. Tuy nhiên, Unicode character set không quy định cách lưu trữ các ký tự này (tức là cách dùng dữ liệu nhị phân để biểu thị các ký tự này).

Sau đó, có **UTF-8** (**8**-bit **U**nicode **T**ransformation **F**ormat). Tương tự còn có UTF-16, UTF-32.

UTF-8 dùng 1 đến 4 byte để encoding mỗi ký tự. UTF-16 dùng 2 hoặc 4 byte để encoding mỗi ký tự. UTF-32 cố định 4 byte để encoding mỗi ký tự.

UTF-8 có thể tự động chọn độ dài encoding tùy theo ký tự khác nhau, ký tự tiếng Anh chỉ cần 1 byte là đủ — giống với ASCII character set. Vì vậy, đối với ký tự tiếng Anh, UTF-8 encoding và ASCII code giống nhau.

Quy tắc của UTF-32 đơn giản nhất, nhưng nhược điểm cũng khá rõ: với các ký tự như chữ cái tiếng Anh, không gian tiêu tốn gấp 4 lần UTF-8.

**UTF-8** là character encoding được dùng rộng rãi nhất hiện nay.

![](/images/javaguide/1280px-Utf8webgrowth.svg.png)

## MySQL Character Set

MySQL hỗ trợ nhiều loại character set, ví dụ GB2312, GBK, BIG5, nhiều loại Unicode character set (UTF-8 encoding, UTF-16 encoding, UCS-2 encoding, UTF-32 encoding v.v.).

### Xem các character set được hỗ trợ

Bạn có thể xem qua lệnh `SHOW CHARSET`, hỗ trợ mệnh đề like và where.

![](/images/javaguide/image-20211008164229671.png)

### Default Character Set

Trong MySQL5.7, default character set là `latin1`; trong MySQL8.0, default character set là `utf8mb4`.

### Các cấp độ của Character Set

Character set trong MySQL có các cấp độ sau:

- `server` (MySQL instance level)
- `database` (database level)
- `table` (table level)
- `column` (column level)

Priority của chúng có thể đơn giản hiểu là từ trên xuống dưới tăng dần, tức là priority của `column` lớn hơn `table` và các cấp độ khác. Ví dụ nếu character set ở MySQL instance level là `utf8mb4`, character set của một table nhất định là `latin1`, thì tất cả field của table đó nếu không chỉ định thì encoding là `latin1`.

#### server

Default value của `server` level character set trong các phiên bản MySQL khác nhau: trong MySQL5.7 là `latin1`; trong MySQL8.0 là `utf8mb4`.

Tất nhiên cũng có thể set `server` level character set bằng cách chỉ định `--character-set-server` khi khởi động `mysqld`.

```bash
mysqld
mysqld --character-set-server=utf8mb4
mysqld --character-set-server=utf8mb4 \
  --collation-server=utf8mb4_0900_ai_ci
```

Hoặc nếu bạn khởi động MySQL bằng cách build từ source code, có thể chỉ định option trong lệnh `cmake`:

```sh
cmake . -DDEFAULT_CHARSET=latin1
hoặc
cmake . -DDEFAULT_CHARSET=latin1 \
  -DDEFAULT_COLLATION=latin1_german1_ci
```

Ngoài ra, bạn cũng có thể thay đổi giá trị `character_set_server` lúc runtime để đạt mục đích sửa đổi `server` level character set.

`server` level character set là global setting của MySQL server, nó không chỉ là default character set khi tạo hoặc sửa database (nếu không chỉ định character set khác), mà còn ảnh hưởng đến connection character set giữa client và server. Chi tiết có thể xem [MySQL Connector/J 8.0 - 6.7 Using Character Sets and Unicode](https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-reference-charsets.html).

#### database

`database` level character set là được chỉ định khi tạo và sửa database:

```sql
CREATE DATABASE db_name
    [[DEFAULT] CHARACTER SET charset_name]
    [[DEFAULT] COLLATE collation_name]

ALTER DATABASE db_name
    [[DEFAULT] CHARACTER SET charset_name]
    [[DEFAULT] COLLATE collation_name]
```

Như đã nói trước, nếu không chỉ định character set khi thực thi các lệnh trên, MySQL sẽ dùng `server` level character set.

Có thể xem character set của một database theo cách sau:

```sql
USE db_name;
SELECT @@character_set_database, @@collation_database;
```

```sql
SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = 'db_name';
```

#### table

`table` level character set là được chỉ định khi tạo và sửa table:

```sql
CREATE TABLE tbl_name (column_list)
    [[DEFAULT] CHARACTER SET charset_name]
    [COLLATE collation_name]]

ALTER TABLE tbl_name
    [[DEFAULT] CHARACTER SET charset_name]
    [COLLATE collation_name]
```

Nếu không chỉ định character set khi tạo và sửa table, sẽ dùng `database` level character set.

#### column

`column` level character set cũng được chỉ định khi tạo và sửa table, chỉ là nó được định nghĩa trong column. Dưới đây là ví dụ:

```sql
CREATE TABLE t1
(
    col1 VARCHAR(5)
      CHARACTER SET latin1
      COLLATE latin1_german1_ci
);
```

Nếu không chỉ định column level character set, sẽ dùng table level character set.

### Connection Character Set

Như đã nói, các cấp độ character set liên quan đến storage. Còn connection character set liên quan đến giao tiếp với MySQL server.

Connection character set liên quan mật thiết đến các biến sau:

- `character_set_client`: Mô tả SQL statement mà client gửi cho server dùng character set gì.
- `character_set_connection`: Mô tả server khi nhận SQL statement sẽ dùng character set gì để dịch.
- `character_set_results`: Mô tả kết quả server trả về cho client dùng character set gì.

Có thể query giá trị của chúng bằng lệnh SQL sau:

```sql
SELECT * FROM performance_schema.session_variables
WHERE VARIABLE_NAME IN (
'character_set_client', 'character_set_connection',
'character_set_results', 'collation_connection'
) ORDER BY VARIABLE_NAME;
```

```sql
SHOW SESSION VARIABLES LIKE 'character\_set\_%';
```

Nếu muốn sửa giá trị của các biến đã đề cập, có các cách sau:

1. Sửa file cấu hình

```properties
[mysql]
# Chỉ áp dụng cho MySQL client program
default-character-set=utf8mb4
```

2. Dùng SQL statement

```sql
set names utf8mb4
# Hoặc sửa từng cái một
# SET character_set_client = utf8mb4;
# SET character_set_results = utf8mb4;
# SET collation_connection = utf8mb4;
```

### Ảnh hưởng của JDBC đến Connection Character Set

Không biết mọi người đã bao giờ gặp tình trạng lưu emoji bình thường, nhưng khi dùng phần mềm như Navicat để query thì thấy emoji biến thành dấu chấm hỏi chưa. Vấn đề này rất có thể do JDBC driver gây ra.

Dựa vào nội dung trước, chúng ta biết connection character set cũng ảnh hưởng đến data chúng ta lưu trữ, còn JDBC driver ảnh hưởng đến connection character set.

`mysql-connector-java` (JDBC driver) chủ yếu ảnh hưởng connection character set qua các property sau:

- `characterEncoding`
- `characterSetResults`

Ví dụ với `DataGrip 2023.1.2`, trong hộp thoại advanced configuration data source của nó, có thể thấy default value của `characterSetResults` là `utf8`. Khi dùng `mysql-connector-java 8.0.25`, connection character set cuối cùng sẽ được set thành `utf8mb3`. Trong trường hợp này emoji sẽ hiển thị thành dấu chấm hỏi, và phiên bản driver hiện tại không hỗ trợ set `characterSetResults` thành `utf8mb4`, nhưng đổi sang `mysql-connector-java driver 8.0.29` thì được.

Chi tiết có thể xem câu trả lời trên StackOverflow: [DataGrip MySQL stores emojis correctly but displays them as?](https://stackoverflow.com/questions/54815419/datagrip-mysql-stores-emojis-correctly-but-displays-them-as)

### Cách dùng UTF-8

Thông thường, chúng ta khuyến nghị dùng UTF-8 làm default character encoding.

Tuy nhiên, ở đây có một cái bẫy nhỏ.

MySQL character encoding có hai bộ triển khai UTF-8:

- **`utf8`**: `utf8` encoding chỉ hỗ trợ `1-3` byte. Trong `utf8` encoding, tiếng Trung chiếm 3 byte, số, tiếng Anh, ký hiệu khác chiếm 1 byte. Nhưng emoji symbol chiếm 4 byte, một số ký tự phức tạp, chữ phồn thể cũng là 4 byte.
- **`utf8mb4`**: Triển khai đầy đủ của UTF-8, bản chính gốc! Hỗ trợ tối đa dùng 4 byte để biểu thị ký tự, vì vậy có thể dùng để lưu emoji symbol.

**Tại sao có hai bộ triển khai UTF-8?** Lý do như sau:

![](/images/javaguide/image-20211008164542347.png)

Vì vậy, nếu bạn cần lưu trữ dữ liệu kiểu `emoji` hoặc một số ký tự phức tạp, chữ phồn thể vào MySQL database, encoding của database nhất định phải chỉ định là `utf8mb4` chứ không phải `utf8`, nếu không sẽ báo lỗi khi lưu trữ.

Demo một chút! (Environment: MySQL 5.7+)

Câu lệnh tạo table như sau, chúng ta chỉ định database CHARSET là `utf8`.

```sql
CREATE TABLE `user` (
  `id` varchar(66) CHARACTER SET utf8mb3 NOT NULL,
  `name` varchar(33) CHARACTER SET utf8mb3 NOT NULL,
  `phone` varchar(33) CHARACTER SET utf8mb3 DEFAULT NULL,
  `password` varchar(100) CHARACTER SET utf8mb3 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

Khi chúng ta thực thi câu lệnh insert sau để insert dữ liệu vào database, đúng là báo lỗi!

```sql
INSERT INTO `user` (`id`, `name`, `phone`, `password`)
VALUES
 ('A00003', 'guide哥😘😘😘', '181631312312', '123456');

```

Thông báo lỗi như sau:

```plain
Incorrect string value: '\xF0\x9F\x98\x98\xF0\x9F...' for column 'name' at row 1
```

## Tài liệu tham khảo

- Character set và character encoding (Charset & Encoding): <https://www.cnblogs.com/skynet/archive/2011/05/03/2035105.html>
- Hiểu character set và character encoding trong 10 phút: <http://cenalulu.github.io/linux/character-encoding/>
- Unicode - Wikipedia: <https://zh.wikipedia.org/wiki/Unicode>
- GB2312 - Wikipedia: <https://zh.wikipedia.org/wiki/GB_2312>
- UTF-8 - Wikipedia: <https://zh.wikipedia.org/wiki/UTF-8>
- GB18030 - Wikipedia: <https://zh.wikipedia.org/wiki/GB_18030>
- MySQL8 documentation: <https://dev.mysql.com/doc/refman/8.0/en/charset.html>
- MySQL5.7 documentation: <https://dev.mysql.com/doc/refman/5.7/en/charset.html>
- MySQL Connector/J documentation: <https://dev.mysql.com/doc/connector-j/8.0/en/connector-j-reference-charsets.html>
