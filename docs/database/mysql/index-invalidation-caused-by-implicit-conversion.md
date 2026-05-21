---
title: MySQL Implicit Type Conversion gây Index Invalidation
description: Phân tích sâu nguyên nhân và tình huống implicit type conversion trong MySQL dẫn đến index invalidation, thông qua các case thực tế demo vấn đề hiệu năng khi so sánh string với number, cung cấp best practice để tránh index invalidation.
category: Cơ sở dữ liệu
tag:
  - MySQL
  - Performance Optimization
head:
  - - meta
    - name: keywords
      content: MySQL implicit conversion,index invalidation,type conversion,MySQL performance optimization,data type mismatch,full table scan,SQL optimization
---

> Bài test lần này dùng MySQL version `5.7.26`. Một số đặc tính có thể thay đổi theo phiên bản MySQL. Bài này không đảm bảo rằng các quan điểm và kết luận đều chính xác cho mọi phiên bản MySQL — hãy tự phân biệt sự khác biệt giữa các phiên bản.
>
> Bài gốc: <https://www.guitu18.com/post/2019/11/24/61.html>

## Lời mở đầu

Tối ưu database là nhiệm vụ lâu dài và gian nan. Muốn tối ưu phải hiểu sâu các đặc tính của database. Trong quá trình phát triển chúng ta thường gặp những vấn đề nguyên nhân đơn giản nhưng hậu quả nghiêm trọng — loại vấn đề này thường khó định vị, mất nhiều công sức troubleshoot rồi cuối cùng phát hiện ra do một sơ sót nhỏ, hoặc do không hiểu một đặc tính kỹ thuật nào đó.

Ở tầng database, thường gặp nhất có lẽ là index invalidation. Ban đầu do data volume nhỏ không dễ phát hiện. Nhưng khi nghiệp vụ mở rộng và data tăng, vấn đề hiệu năng dần dần bộc lộ. Nếu không xử lý kịp thời dễ gây hiệu ứng domino, cuối cùng dẫn đến database treo thậm chí tê liệt. Nguyên nhân gây index invalidation có thể có nhiều loại — đã có nhiều blog kỹ thuật đề cập. Hôm nay ghi lại **index invalidation do implicit type conversion gây ra**.

## Chuẩn bị dữ liệu

Trước tiên dùng stored procedure để tạo 10 triệu test record. Bảng test có 7 field (bao gồm primary key). `num1` và `num2` lưu số tuần tự giống `ID`, trong đó `num2` là kiểu string. `type1` và `type2` lưu primary key mod 5 — mục đích mô phỏng loại data kiểu `type` thường dùng trong ứng dụng thực tế, nhưng `type2` không có index. `str1` và `str2` đều lưu random string 20 ký tự. `str1` không thể là `NULL`, `str2` cho phép `NULL`. Khi tạo test data, field `str2` cũng có một lượng nhỏ giá trị `NULL` (mỗi 100 record tạo 1 `NULL`).

```sql
-- Tạo bảng test data
DROP TABLE IF EXISTS test1;
CREATE TABLE `test1` (
    `id` int(11) NOT NULL,
    `num1` int(11) NOT NULL DEFAULT '0',
    `num2` varchar(11) NOT NULL DEFAULT '',
    `type1` int(4) NOT NULL DEFAULT '0',
    `type2` int(4) NOT NULL DEFAULT '0',
    `str1` varchar(100) NOT NULL DEFAULT '',
    `str2` varchar(100) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `num1` (`num1`),
    KEY `num2` (`num2`),
    KEY `type1` (`type1`),
    KEY `str1` (`str1`),
    KEY `str2` (`str2`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- Tạo stored procedure
DROP PROCEDURE IF EXISTS pre_test1;
DELIMITER //
CREATE PROCEDURE `pre_test1`()
BEGIN
    DECLARE i INT DEFAULT 0;
    SET autocommit = 0;
    WHILE i < 10000000 DO
        SET i = i + 1;
        SET @str1 = SUBSTRING(MD5(RAND()),1,20);
        -- str2 tạo 1 null value mỗi 100 record
        IF i % 100 = 0 THEN
            SET @str2 = NULL;
        ELSE
            SET @str2 = @str1;
        END IF;
        INSERT INTO test1 (`id`, `num1`, `num2`,
        `type1`, `type2`, `str1`, `str2`)
        VALUES (CONCAT('', i), CONCAT('', i),
        CONCAT('', i), i%5, i%5, @str1, @str2);
        -- Tối ưu transaction, commit mỗi 1 vạn record
        IF i % 10000 = 0 THEN
            COMMIT;
        END IF;
    END WHILE;
END;
// DELIMITER ;
-- Thực thi stored procedure
CALL pre_test1();
```

Lượng data khá lớn và liên quan đến việc dùng `MD5` tạo random string nên tốc độ hơi chậm — kiên nhẫn chờ. 10 triệu record, tôi mất 33 phút để chạy xong (thời gian thực tế phụ thuộc cấu hình phần cứng máy). Một vài record được tạo ra trông như thế này.

![](/images/github/javaguide/mysqlindex-invalidation-caused-by-implicit-conversion-01.png)

## SQL Test

Xem nhóm SQL này — tổng cộng 4 câu. Trong bảng test, `num1` là kiểu `int`, `num2` là kiểu `varchar`, nhưng data lưu đều là số tuần tự giống primary key `id`, cả hai field đều có index.

```sql
1: SELECT * FROM `test1` WHERE num1 = 10000;
2: SELECT * FROM `test1` WHERE num1 = '10000';
3: SELECT * FROM `test1` WHERE num2 = 10000;
4: SELECT * FROM `test1` WHERE num2 = '10000';
```

Bốn SQL này được viết có chủ đích: câu 1, 2 query field kiểu int; câu 3, 4 query field kiểu `varchar`. Câu 1, 2 hoặc 3, 4 query cùng field nhưng một điều kiện là số, một điều kiện là string được bao bởi dấu nháy. Điều này có gì khác biệt không? Trước khi xem kết quả test bên dưới, bạn có đoán được thứ tự hiệu quả của 4 SQL này không?

Sau khi test, kết quả thực thi của 4 SQL này chênh nhau rất lớn. Câu 1, 2, 4 gần như ra kết quả ngay lập tức, khoảng 0.001~0.005 giây. Với 10 triệu record, kết quả như vậy có thể kết luận hiệu năng 3 câu này không chênh lệch đáng kể. Nhưng câu SQL thứ 3, qua nhiều lần test thì thời gian cơ bản từ 4.5~4.8 giây.

Tại sao hiệu năng của 2 câu SQL 3 và 4 chênh nhau nhiều vậy, nhưng cùng là so sánh thì 2 câu SQL 1 và 2 lại không chênh lệch gì? Xem execution plan, dưới đây là dữ liệu execution plan của 4 câu SQL 1, 2, 3, 4:

![](/images/github/javaguide/mysqlindex-invalidation-caused-by-implicit-conversion-02.png)

Có thể thấy 3 câu SQL 1, 2, 4 đều dùng được index, connection type đều là `ref`, số row scan đều là 1 — hiệu quả rất cao. Xem tiếp câu SQL thứ 3: không dùng index, nên full table scan, `rows` lên thẳng 10 triệu — nên hiệu năng chênh nhau nhiều vậy.

Quan sát kỹ sẽ thấy: field `num2` mà câu SQL 3, 4 query là kiểu `varchar`. Câu SQL thứ 4 có dấu nháy ở phải dấu bằng trong điều kiện query thì dùng được index. Vậy có phải do kiểu data query không khớp với kiểu data field không? Nếu vậy thì câu SQL 1, 2 query field `num1` kiểu `int`, nhưng câu SQL thứ 2 điều kiện phải dấu bằng có dấu nháy tại sao vẫn dùng được index?

Tra tài liệu MySQL liên quan thì phát hiện nguyên nhân là implicit conversion. Xem mô tả chính thức:

> Official docs: [12.2 Type Conversion in Expression Evaluation](https://dev.mysql.com/doc/refman/5.7/en/type-conversion.html?spm=5176.100239.blogcont47339.5.1FTben)
>
> Khi operator được dùng với operand kiểu khác nhau, type conversion xảy ra để làm cho operand tương thích. Một số conversion xảy ra ngầm. Ví dụ MySQL tự động chuyển đổi string sang number khi cần và ngược lại. Các quy tắc sau mô tả cách conversion xảy ra cho thao tác so sánh:
>
> 1. Khi ít nhất một trong hai tham số là `NULL`, kết quả so sánh cũng là `NULL`. Trường hợp đặc biệt là dùng `<=>` so sánh hai `NULL` sẽ trả về `1`. Cả hai trường hợp đều không cần type conversion.
> 2. Khi cả hai tham số đều là string, so sánh theo string, không type conversion.
> 3. Khi cả hai tham số đều là integer, so sánh theo integer, không type conversion.
> 4. Giá trị hex so sánh với non-number sẽ được coi là binary string.
> 5. Khi có một tham số là `TIMESTAMP` hoặc `DATETIME` và tham số kia là constant, constant sẽ được convert sang `timestamp`.
> 6. Khi có một tham số kiểu `decimal`, nếu tham số kia là `decimal` hoặc integer thì convert integer sang `decimal` rồi so sánh; nếu tham số kia là float thì convert `decimal` sang float rồi so sánh.
> 7. **Tất cả trường hợp khác, cả hai tham số đều được convert sang float rồi so sánh**.

Theo tài liệu chính thức, cả 2 câu SQL 2 và 3 của chúng ta đều xảy ra implicit conversion. Câu SQL 2 có điều kiện query `num1 = '10000'` — trái là kiểu `int`, phải là string. Câu SQL 3 ngược lại. Theo quy tắc conversion chính thức số 7, cả hai vế đều được convert sang float rồi so sánh.

Xem câu SQL 2 trước: ``SELECT * FROM `test1` WHERE num1 = '10000';`` **Vế trái kiểu int** `10000`, convert sang float vẫn là `10000`. Vế phải string `'10000'`, convert sang float cũng là `10000`. Kết quả convert của cả hai đều xác định duy nhất nên không ảnh hưởng đến việc dùng index.

Câu SQL 3: ``SELECT * FROM `test1` WHERE num2 = 10000;`` **Vế trái kiểu string** `'10000'`, convert sang float là 10000 — xác định duy nhất. Vế phải kiểu `int` `10000` convert cũng xác định duy nhất. Nhưng vì vế trái là search condition, `'10000'` convert sang `10000` là duy nhất, nhưng các string khác cũng có thể convert sang `10000`, như `'10000a'`, `'010000'`, `' 10000'`, v.v. đều có thể convert sang float `10000`. Trong trường hợp này, không thể dùng index.

Về **implicit conversion** này có thể verify qua query test. Trước tiên insert một vài record trong đó có `num2='10000a'`, `'010000'` và `' 10000'`:

```sql
INSERT INTO `test1` (`id`, `num1`, `num2`, `type1`, `type2`, `str1`, `str2`) VALUES ('10000001', '10000', '10000a', '0', '0', '2df3d9465ty2e4hd523', '2df3d9465ty2e4hd523');
INSERT INTO `test1` (`id`, `num1`, `num2`, `type1`, `type2`, `str1`, `str2`) VALUES ('10000002', '10000', '010000', '0', '0', '2df3d9465ty2e4hd523', '2df3d9465ty2e4hd523');
INSERT INTO `test1` (`id`, `num1`, `num2`, `type1`, `type2`, `str1`, `str2`) VALUES ('10000003', '10000', ' 10000', '0', '0', '2df3d9465ty2e4hd523', '2df3d9465ty2e4hd523');
```

Sau đó dùng SQL thứ 3 ``SELECT * FROM `test1` WHERE num2 = 10000;`` để query:

![](/images/github/javaguide/mysqlindex-invalidation-caused-by-implicit-conversion-03.png)

Từ kết quả có thể thấy ba record mới insert cũng đều được match. Vậy quy tắc implicit conversion của string là gì? Tại sao cả `num2='10000a'`, `'010000'` và `' 10000'` đều được match? Tra tài liệu liên quan thì thấy quy tắc như sau:

1. String **không bắt đầu bằng số** đều được convert thành `0`. Như `'abc'`, `'a123bc'`, `'abc123'` đều convert thành `0`.
2. String **bắt đầu bằng số** khi convert sẽ được cắt — cắt từ ký tự đầu đến ký tự non-số đầu tiên. Ví dụ `'123abc'` convert thành `123`, `'012abc'` convert thành `012` tức là `12`, `'5.3a66b78c'` convert thành `5.3`, các trường hợp khác tương tự.

Dưới đây verify quy tắc trên qua test:

![](/images/github/javaguide/mysqlindex-invalidation-caused-by-implicit-conversion-04.png)

Điều này cũng xác nhận kết quả query trước đó.

Viết thêm một SQL query field str1: ``SELECT * FROM `test1` WHERE str1 = 1234;``

![](/images/github/javaguide/mysqlindex-invalidation-caused-by-implicit-conversion-05.png)

## Phân tích và Tổng kết

Qua test trên chúng ta phát hiện một số đặc tính của MySQL khi dùng operator:

1. Khi **kiểu data của hai vế operator không nhất quán**, sẽ xảy ra **implicit conversion**.
2. Khi vế trái của operator trong WHERE query là **kiểu số** và xảy ra implicit conversion, ảnh hưởng đến hiệu quả không lớn nhưng vẫn không khuyến nghị làm vậy.
3. Khi vế trái của operator trong WHERE query là **kiểu string** và xảy ra implicit conversion, sẽ gây index invalidation dẫn đến full table scan — hiệu quả cực thấp.
4. Khi string convert sang kiểu số: string không bắt đầu bằng số convert thành `0`, string bắt đầu bằng số thì cắt lấy từ ký tự đầu đến ký tự non-số đầu tiên.

Vì vậy, khi viết SQL cần hình thành thói quen tốt: field query là kiểu nào thì điều kiện ở phải dấu bằng viết theo kiểu tương ứng. Đặc biệt khi field query là string thì điều kiện phải dấu bằng nhất thiết phải dùng dấu nháy để đánh dấu đây là string, nếu không sẽ gây index invalidation dẫn đến full table scan.

<!-- @include: @article-footer.snippet.md -->
