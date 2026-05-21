---
title: Tổng hợp kiến thức cơ bản về cú pháp SQL
description: Tổng hợp kiến thức cơ bản về cú pháp SQL, trình bày có hệ thống DDL định nghĩa dữ liệu, DML thao tác dữ liệu, DQL truy vấn dữ liệu, DCL ngôn ngữ kiểm soát dữ liệu, bao gồm thao tác bảng, ràng buộc, chỉ mục, giao dịch, truy vấn kết nối và nhiều kiến thức quan trọng khác.
category: Cơ sở dữ liệu
tag:
  - Kiến thức cơ bản về cơ sở dữ liệu
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL语法,DDL,DML,DQL,DCL,CREATE,SELECT,INSERT,UPDATE,DELETE,JOIN连接,子查询
---

> Bài viết này được tổng hợp và hoàn thiện từ hai tài liệu sau:
>
> - [SQL 语法速成手册](https://juejin.cn/post/6844903790571700231)
> - [MySQL 超全教程](https://www.begtut.com/mysql/mysql-tutorial.html)

## Khái niệm cơ bản

### Thuật ngữ cơ sở dữ liệu

- `Cơ sở dữ liệu (database)` - Container lưu trữ dữ liệu có tổ chức (thường là một file hoặc một nhóm các file).
- `Bảng dữ liệu (table)` - Danh sách có cấu trúc của một loại dữ liệu cụ thể.
- `Lược đồ (schema)` - Thông tin về bố cục và đặc tính của cơ sở dữ liệu và bảng. Lược đồ định nghĩa cách dữ liệu được lưu trữ trong bảng, bao gồm loại dữ liệu được lưu trữ, cách dữ liệu được phân tách, cách các phần thông tin được đặt tên. Cả cơ sở dữ liệu và bảng đều có lược đồ.
- `Cột (column)` - Một trường trong bảng. Tất cả các bảng được tạo thành từ một hoặc nhiều cột.
- `Hàng (row)` - Một bản ghi trong bảng.
- `Khóa chính (primary key)` - Một cột (hoặc nhóm cột) có giá trị có thể xác định duy nhất mỗi hàng trong bảng.

### Cú pháp SQL

SQL (Structured Query Language - Ngôn ngữ truy vấn có cấu trúc), SQL chuẩn do Ủy ban chuẩn ANSI quản lý, được gọi là ANSI SQL. Mỗi DBMS có cách triển khai riêng như PL/SQL, Transact-SQL, v.v.

#### Cấu trúc cú pháp SQL

![](https://oss.javaguide.cn/p3-juejin/cb684d4c75fc430e92aaee226069c7da~tplv-k3u1fbpfcp-zoom-1.png)

Cấu trúc cú pháp SQL bao gồm:

- **`Mệnh đề`** - Là thành phần của câu lệnh và truy vấn. (Trong một số trường hợp, các mệnh đề này là tùy chọn.)
- **`Biểu thức`** - Có thể tạo ra bất kỳ giá trị vô hướng nào, hoặc bảng cơ sở dữ liệu gồm cột và hàng.
- **`Điều kiện`** - Chỉ định điều kiện cho logic ba giá trị SQL (3VL) (true/false/unknown) hoặc giá trị boolean, giới hạn hiệu ứng của câu lệnh và truy vấn, hoặc thay đổi luồng chương trình.
- **`Truy vấn`** - Lấy dữ liệu dựa trên điều kiện cụ thể. Đây là thành phần quan trọng của SQL.
- **`Câu lệnh`** - Có thể ảnh hưởng lâu dài đến lược đồ và dữ liệu, cũng có thể kiểm soát giao dịch cơ sở dữ liệu, luồng chương trình, kết nối, phiên hoặc chẩn đoán.

#### Lưu ý cú pháp SQL

- **Câu lệnh SQL không phân biệt chữ hoa chữ thường**, nhưng tên bảng, tên cột và giá trị có phân biệt hay không phụ thuộc vào DBMS cụ thể và cấu hình. Ví dụ: `SELECT`, `select`, `Select` là như nhau.
- **Nhiều câu lệnh SQL phải được phân tách bằng dấu chấm phẩy (`;`)**.
- Khi xử lý câu lệnh SQL, **tất cả khoảng trắng đều bị bỏ qua**.

Câu lệnh SQL có thể viết trên một dòng hoặc chia thành nhiều dòng.

```sql
-- 一行 SQL 语句

UPDATE user SET username='robot', password='robot' WHERE username = 'root';

-- 多行 SQL 语句
UPDATE user
SET username='robot', password='robot'
WHERE username = 'root';
```

SQL hỗ trợ ba kiểu comment:

```sql
## 注释1
-- 注释2
/* 注释3 */
```

### Phân loại SQL

#### Ngôn ngữ định nghĩa dữ liệu (DDL)

Ngôn ngữ định nghĩa dữ liệu (Data Definition Language, DDL) là ngôn ngữ trong tập hợp ngôn ngữ SQL chịu trách nhiệm định nghĩa cấu trúc dữ liệu và định nghĩa đối tượng cơ sở dữ liệu.

Chức năng chính của DDL là **định nghĩa đối tượng cơ sở dữ liệu**.

Lệnh cốt lõi của DDL là `CREATE`, `ALTER`, `DROP`.

#### Ngôn ngữ thao tác dữ liệu (DML)

Ngôn ngữ thao tác dữ liệu (Data Manipulation Language, DML) là câu lệnh lập trình được dùng để thao tác cơ sở dữ liệu, thực hiện truy cập các đối tượng và dữ liệu trong cơ sở dữ liệu.

Chức năng chính của DML là **truy cập dữ liệu**, do đó cú pháp của nó chủ yếu tập trung vào **đọc và ghi cơ sở dữ liệu**.

Lệnh cốt lõi của DML là `INSERT`, `UPDATE`, `DELETE`, `SELECT`. Bốn lệnh này được gọi chung là CRUD (Create, Read, Update, Delete) - tức là thêm, xóa, sửa, tìm.

#### Ngôn ngữ kiểm soát giao dịch (TCL)

Ngôn ngữ kiểm soát giao dịch (Transaction Control Language, TCL) được dùng để **quản lý giao dịch trong cơ sở dữ liệu**. Chúng được dùng để quản lý các thay đổi do câu lệnh DML thực hiện. Nó cũng cho phép nhóm các câu lệnh thành các giao dịch logic.

Lệnh cốt lõi của TCL là `COMMIT`, `ROLLBACK`.

#### Ngôn ngữ kiểm soát dữ liệu (DCL)

Ngôn ngữ kiểm soát dữ liệu (Data Control Language, DCL) là lệnh có thể kiểm soát quyền truy cập dữ liệu, nó có thể kiểm soát quyền của tài khoản người dùng cụ thể đối với các đối tượng cơ sở dữ liệu như bảng dữ liệu, bảng xem, thủ tục lưu sẵn, hàm người dùng tự định nghĩa, v.v.

Lệnh cốt lõi của DCL là `GRANT`, `REVOKE`.

DCL chủ yếu tập trung vào **kiểm soát quyền truy cập của người dùng**, do đó cú pháp lệnh của nó không phức tạp. Các quyền có thể kiểm soát bằng DCL bao gồm: `CONNECT`, `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `EXECUTE`, `USAGE`, `REFERENCES`.

Tùy thuộc vào DBMS và thực thể bảo mật khác nhau, quyền kiểm soát được hỗ trợ cũng khác nhau.

**Trước tiên, hãy giới thiệu cách sử dụng câu lệnh DML. Chức năng chính của DML là đọc và ghi cơ sở dữ liệu để thực hiện thêm, xóa, sửa, tìm.**

## Thêm, xóa, sửa, tìm

Thêm, xóa, sửa, tìm, còn gọi là CRUD, là thao tác cơ bản trong cơ sở dữ liệu.

### Chèn dữ liệu

Câu lệnh `INSERT INTO` được dùng để chèn bản ghi mới vào bảng.

**Chèn toàn bộ hàng**

```sql
# 插入一行
INSERT INTO user
VALUES (10, 'root', 'root', 'xxxx@163.com');
# 插入多行
INSERT INTO user
VALUES (10, 'root', 'root', 'xxxx@163.com'), (12, 'user1', 'user1', 'xxxx@163.com'), (18, 'user2', 'user2', 'xxxx@163.com');
```

**Chèn một phần của hàng**

```sql
INSERT INTO user(username, password, email)
VALUES ('admin', 'admin', 'xxxx@163.com');
```

**Chèn dữ liệu từ kết quả truy vấn**

```sql
INSERT INTO user(username)
SELECT name
FROM account;
```

### Cập nhật dữ liệu

Câu lệnh `UPDATE` được dùng để cập nhật bản ghi trong bảng.

```sql
UPDATE user
SET username='robot', password='robot'
WHERE username = 'root';
```

### Xóa dữ liệu

- Câu lệnh `DELETE` được dùng để xóa bản ghi trong bảng.
- `TRUNCATE TABLE` có thể làm trống bảng, tức là xóa tất cả các hàng. Lưu ý: câu lệnh `TRUNCATE` không thuộc cú pháp DML mà là DDL.

**Xóa dữ liệu chỉ định trong bảng**

```sql
DELETE FROM user
WHERE username = 'robot';
```

**Xóa toàn bộ dữ liệu trong bảng**

```sql
TRUNCATE TABLE user;
```

### Truy vấn dữ liệu

Câu lệnh `SELECT` được dùng để truy vấn dữ liệu từ cơ sở dữ liệu.

`DISTINCT` được dùng để trả về các giá trị duy nhất khác nhau. Nó tác động lên tất cả các cột, nghĩa là chỉ khi tất cả các cột có giá trị giống nhau mới được coi là trùng lặp.

`LIMIT` giới hạn số hàng trả về. Có thể có hai tham số, tham số đầu tiên là hàng bắt đầu, bắt đầu từ 0; tham số thứ hai là tổng số hàng trả về.

- `ASC`: Tăng dần (mặc định)
- `DESC`: Giảm dần

**Truy vấn một cột**

```sql
SELECT prod_name
FROM products;
```

**Truy vấn nhiều cột**

```sql
SELECT prod_id, prod_name, prod_price
FROM products;
```

**Truy vấn tất cả các cột**

```sql
SELECT *
FROM products;
```

**Truy vấn các giá trị khác nhau**

```sql
SELECT DISTINCT
vend_id FROM products;
```

**Giới hạn kết quả truy vấn**

```sql
-- 返回前 5 行
SELECT * FROM mytable LIMIT 5;
SELECT * FROM mytable LIMIT 0, 5;
-- 返回第 3 ~ 5 行
SELECT * FROM mytable LIMIT 2, 3;
```

## Sắp xếp

`order by` được dùng để sắp xếp tập kết quả theo một hoặc nhiều cột. Mặc định sắp xếp theo thứ tự tăng dần, nếu cần sắp xếp theo thứ tự giảm dần, có thể dùng từ khóa `desc`.

Khi `order by` sắp xếp theo nhiều cột, cột sắp xếp trước được đặt trước, cột sắp xếp sau được đặt sau. Và các cột khác nhau có thể có quy tắc sắp xếp khác nhau.

```sql
SELECT * FROM products
ORDER BY prod_price DESC, prod_name ASC;
```

## Nhóm

**`group by`**:

- Mệnh đề `group by` nhóm các bản ghi vào các hàng tổng hợp.
- `group by` trả về một bản ghi cho mỗi nhóm.
- `group by` thường liên quan đến hàm tổng hợp `count`, `max`, `sum`, `avg`, v.v.
- `group by` có thể nhóm theo một hoặc nhiều cột.
- Sau khi `group by` sắp xếp theo trường nhóm, `order by` có thể sắp xếp theo trường tổng hợp.

**Nhóm**

```sql
SELECT cust_name, COUNT(cust_address) AS addr_num
FROM Customers GROUP BY cust_name;
```

**Nhóm rồi sắp xếp**

```sql
SELECT cust_name, COUNT(cust_address) AS addr_num
FROM Customers GROUP BY cust_name
ORDER BY cust_name DESC;
```

**`having`**:

- `having` được dùng để lọc kết quả `group by` tổng hợp.
- `having` thường được dùng kết hợp với `group by`.
- `where` và `having` có thể trong cùng một truy vấn.

**Lọc dữ liệu bằng WHERE và HAVING**

```sql
SELECT cust_name, COUNT(*) AS NumberOfOrders
FROM Customers
WHERE cust_email IS NOT NULL
GROUP BY cust_name
HAVING COUNT(*) > 1;
```

**`having` vs `where`**:

- `where`: Lọc các hàng chỉ định, không thể thêm hàm tổng hợp (hàm nhóm) phía sau. `where` đứng trước `group by`.
- `having`: Lọc nhóm, thường dùng kết hợp với `group by`, không thể dùng độc lập. `having` đứng sau `group by`.

## Truy vấn con

Truy vấn con là truy vấn SQL được lồng trong truy vấn lớn hơn, còn gọi là truy vấn nội hoặc lựa chọn nội; câu lệnh chứa truy vấn con cũng được gọi là truy vấn ngoại hoặc lựa chọn ngoại. Nói đơn giản, truy vấn con là sử dụng kết quả của một truy vấn `select` (truy vấn con) làm nguồn dữ liệu hoặc điều kiện phán xét cho một câu lệnh SQL khác (truy vấn chính).

Truy vấn con có thể được nhúng vào câu lệnh `SELECT`, `INSERT`, `UPDATE` và `DELETE`, cũng có thể dùng với các toán tử `=`, `<`, `>`, `IN`, `BETWEEN`, `EXISTS`, v.v.

Truy vấn con thường được dùng sau mệnh đề `WHERE` và mệnh đề `FROM`:

- Khi dùng với mệnh đề `WHERE`, tùy theo toán tử khác nhau, truy vấn con có thể trả về dữ liệu một hàng một cột, nhiều hàng một cột, một hàng nhiều cột. Truy vấn con là để trả về giá trị có thể làm điều kiện truy vấn cho mệnh đề `WHERE`.
- Khi dùng với mệnh đề `FROM`, thường trả về nhiều hàng nhiều cột, tương đương với trả về một bảng tạm, điều này mới phù hợp với quy tắc sau `FROM` là bảng. Cách làm này có thể thực hiện truy vấn kết hợp nhiều bảng.

> Lưu ý: Cơ sở dữ liệu MYSQL chỉ bắt đầu hỗ trợ truy vấn con từ phiên bản 4.1, các phiên bản cũ không hỗ trợ.

Cú pháp cơ bản của truy vấn con dùng cho mệnh đề `WHERE` như sau:

```sql
select column_name [, column_name ]
from   table1 [, table2 ]
where  column_name operator
    (select column_name [, column_name ]
    from table1 [, table2 ]
    [where])
```

- Truy vấn con cần đặt trong ngoặc đơn `( )`.
- `operator` đại diện cho toán tử dùng cho mệnh đề where.

Cú pháp cơ bản của truy vấn con dùng cho mệnh đề `FROM` như sau:

```sql
select column_name [, column_name ]
from (select column_name [, column_name ]
      from table1 [, table2 ]
      [where]) as temp_table_name
where  condition
```

Kết quả trả về của truy vấn con dùng cho `FROM` tương đương với một bảng tạm, vì vậy cần dùng từ khóa AS để đặt tên cho bảng tạm đó.

**Truy vấn con lồng nhau**

```sql
SELECT cust_name, cust_contact
FROM customers
WHERE cust_id IN (SELECT cust_id
                  FROM orders
                  WHERE order_num IN (SELECT order_num
                                      FROM orderitems
                                      WHERE prod_id = 'RGAN01'));
```

Truy vấn nội sẽ được thực thi trước truy vấn cha của nó để kết quả của truy vấn nội có thể được truyền cho truy vấn ngoại. Quá trình thực thi có thể tham khảo hình dưới đây:

![](https://oss.javaguide.cn/p3-juejin/c439da1f5d4e4b00bdfa4316b933d764~tplv-k3u1fbpfcp-zoom-1.png)

### WHERE

- Mệnh đề `WHERE` được dùng để lọc bản ghi, tức là thu hẹp phạm vi truy cập dữ liệu.
- `WHERE` theo sau là điều kiện trả về `true` hoặc `false`.
- `WHERE` có thể dùng với `SELECT`, `UPDATE` và `DELETE`.
- Các toán tử có thể dùng trong mệnh đề `WHERE`.

| Toán tử | Mô tả                                                                        |
| ------- | ---------------------------------------------------------------------------- |
| =       | Bằng                                                                         |
| <>      | Không bằng. Lưu ý: Trong một số phiên bản SQL, toán tử này có thể viết là != |
| >       | Lớn hơn                                                                      |
| <       | Nhỏ hơn                                                                      |
| >=      | Lớn hơn hoặc bằng                                                            |
| <=      | Nhỏ hơn hoặc bằng                                                            |
| BETWEEN | Trong một phạm vi nhất định                                                  |
| LIKE    | Tìm kiếm theo mẫu nhất định                                                  |
| IN      | Chỉ định nhiều giá trị có thể cho một cột nhất định                          |

**Mệnh đề `WHERE` trong câu lệnh `SELECT`**

```ini
SELECT * FROM Customers
WHERE cust_name = 'Kids Place';
```

**Mệnh đề `WHERE` trong câu lệnh `UPDATE`**

```ini
UPDATE Customers
SET cust_name = 'Jack Jones'
WHERE cust_name = 'Kids Place';
```

**Mệnh đề `WHERE` trong câu lệnh `DELETE`**

```ini
DELETE FROM Customers
WHERE cust_name = 'Kids Place';
```

### IN và BETWEEN

- Toán tử `IN` được dùng trong mệnh đề `WHERE`, chức năng là chọn một trong nhiều giá trị cụ thể được chỉ định.
- Toán tử `BETWEEN` được dùng trong mệnh đề `WHERE`, chức năng là chọn các giá trị nằm trong một phạm vi nhất định.

**Ví dụ IN**

```sql
SELECT *
FROM products
WHERE vend_id IN ('DLL01', 'BRS01');
```

**Ví dụ BETWEEN**

```sql
SELECT *
FROM products
WHERE prod_price BETWEEN 3 AND 5;
```

### AND、OR、NOT

- `AND`, `OR`, `NOT` là lệnh xử lý logic cho điều kiện lọc.
- `AND` có độ ưu tiên cao hơn `OR`, để làm rõ thứ tự xử lý, có thể dùng `()`.
- Toán tử `AND` nghĩa là cả hai điều kiện bên trái và bên phải đều phải thỏa mãn.
- Toán tử `OR` nghĩa là chỉ cần thỏa mãn một trong hai điều kiện bên trái hoặc bên phải.
- Toán tử `NOT` được dùng để phủ định một điều kiện.

**Ví dụ AND**

```sql
SELECT prod_id, prod_name, prod_price
FROM products
WHERE vend_id = 'DLL01' AND prod_price <= 4;
```

**Ví dụ OR**

```ini
SELECT prod_id, prod_name, prod_price
FROM products
WHERE vend_id = 'DLL01' OR vend_id = 'BRS01';
```

**Ví dụ NOT**

```sql
SELECT *
FROM products
WHERE prod_price NOT BETWEEN 3 AND 5;
```

### LIKE

- Toán tử `LIKE` được dùng trong mệnh đề `WHERE`, chức năng là xác định xem chuỗi có khớp với mẫu không.
- Chỉ dùng `LIKE` khi trường là giá trị văn bản.
- `LIKE` hỗ trợ hai tùy chọn khớp ký tự đại diện: `%` và `_`.
- Không lạm dụng ký tự đại diện, khớp ký tự đại diện ở đầu chuỗi sẽ rất chậm.
- `%` đại diện cho bất kỳ ký tự nào xuất hiện bất kỳ số lần nào.
- `_` đại diện cho bất kỳ ký tự nào xuất hiện một lần.

**Ví dụ %**

```sql
SELECT prod_id, prod_name, prod_price
FROM products
WHERE prod_name LIKE '%bean bag%';
```

**Ví dụ \_**

```sql
SELECT prod_id, prod_name, prod_price
FROM products
WHERE prod_name LIKE '__ inch teddy bear';
```

## Kết nối

JOIN có nghĩa là "kết nối", như tên gọi, mệnh đề SQL JOIN được dùng để kết hợp hai hoặc nhiều bảng lại để truy vấn.

Khi kết nối bảng, cần chọn một trường từ mỗi bảng và so sánh giá trị của các trường đó, hai bản ghi có cùng giá trị sẽ được gộp lại thành một. **Bản chất của việc kết nối bảng là gộp các bản ghi từ các bảng khác nhau lại, tạo thành một bảng mới. Tất nhiên, bảng mới này chỉ là tạm thời, nó chỉ tồn tại trong quá trình truy vấn này**.

Cú pháp cơ bản dùng `JOIN` để kết nối hai bảng như sau:

```sql
select table1.column1, table2.column2...
from table1
join table2
on table1.common_column1 = table2.common_column2;
```

`table1.common_column1 = table2.common_column2` là điều kiện kết nối, chỉ những bản ghi thỏa mãn điều kiện này mới được gộp thành một hàng. Bạn có thể dùng nhiều toán tử để kết nối bảng, ví dụ =, >, <, <>, <=, >=, !=, `between`, `like` hoặc `not`, nhưng phổ biến nhất là dùng =.

Khi hai bảng có trường cùng tên, để giúp công cụ cơ sở dữ liệu phân biệt trường thuộc bảng nào, khi viết tên trường cùng tên cần thêm tên bảng vào. Tất nhiên, nếu tên trường là duy nhất trong hai bảng, cũng có thể không dùng định dạng trên mà chỉ viết tên trường.

Ngoài ra, nếu tên trường liên kết của hai bảng giống nhau, cũng có thể dùng mệnh đề `USING` thay thế cho `ON`, ví dụ:

```sql
# join....on
select c.cust_name, o.order_num
from Customers c
inner join Orders o
on c.cust_id = o.cust_id
order by c.cust_name;

# 如果两张表的关联字段名相同，也可以使用USING子句：join....using()
select c.cust_name, o.order_num
from Customers c
inner join Orders o
using(cust_id)
order by c.cust_name;
```

**Sự khác biệt giữa `ON` và `WHERE`**:

- Khi kết nối bảng, SQL sẽ tạo ra một bảng tạm mới dựa trên điều kiện kết nối. `ON` chính là điều kiện kết nối, nó quyết định việc tạo ra bảng tạm.
- `WHERE` là sau khi bảng tạm được tạo, tiếp tục lọc dữ liệu trong bảng tạm, tạo ra tập kết quả cuối cùng, lúc này đã không còn JOIN-ON nữa.

Vì vậy, tóm lại là: **SQL trước tiên tạo bảng tạm dựa trên ON, sau đó lọc bảng tạm dựa trên WHERE**.

SQL cho phép thêm một số từ khóa mô tả ở bên trái `JOIN`, từ đó tạo thành các kiểu kết nối khác nhau, như bảng dưới đây:

| Kiểu kết nối                                 | Mô tả                                                                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| INNER JOIN (kết nối trong)                   | (Kiểu kết nối mặc định) Chỉ trả về hàng khi cả hai bảng đều có bản ghi thỏa mãn điều kiện.                                                        |
| LEFT JOIN / LEFT OUTER JOIN (kết nối trái)   | Trả về tất cả các hàng trong bảng bên trái, ngay cả khi bảng bên phải không có hàng nào thỏa mãn điều kiện.                                       |
| RIGHT JOIN / RIGHT OUTER JOIN (kết nối phải) | Trả về tất cả các hàng trong bảng bên phải, ngay cả khi bảng bên trái không có hàng nào thỏa mãn điều kiện.                                       |
| FULL JOIN / FULL OUTER JOIN (kết nối đầy đủ) | Chỉ cần một trong hai bảng có bản ghi thỏa mãn điều kiện, sẽ trả về hàng.                                                                         |
| SELF JOIN                                    | Kết nối một bảng với chính nó, như thể bảng đó là hai bảng khác nhau. Để phân biệt hai bảng, cần đặt lại tên ít nhất một bảng trong câu lệnh SQL. |
| CROSS JOIN                                   | Kết nối chéo, trả về tích Descartes của tập bản ghi từ hai hoặc nhiều bảng kết nối.                                                               |

Hình dưới đây minh họa 7 cách dùng liên quan đến LEFT JOIN, RIGHT JOIN, INNER JOIN, OUTER JOIN.

![](https://oss.javaguide.cn/p3-juejin/701670942f0f45d3a3a2187cd04a12ad~tplv-k3u1fbpfcp-zoom-1.png)

Nếu không thêm bất kỳ từ khóa mô tả nào, chỉ viết `JOIN`, thì mặc định là `INNER JOIN`.

Đối với `INNER JOIN`, còn có một cách viết ngầm, gọi là "**kết nối trong ngầm**", tức là không có từ khóa `INNER JOIN`, dùng câu lệnh `WHERE` để thực hiện chức năng kết nối trong.

```sql
# 隐式内连接
select c.cust_name, o.order_num
from Customers c, Orders o
where c.cust_id = o.cust_id
order by c.cust_name;

# 显式内连接
select c.cust_name, o.order_num
from Customers c inner join Orders o
using(cust_id)
order by c.cust_name;
```

## Kết hợp

Toán tử `UNION` kết hợp kết quả của hai hoặc nhiều truy vấn và tạo ra một tập kết quả, bao gồm các hàng được trích xuất từ các truy vấn tham gia trong `UNION`.

Quy tắc cơ bản của `UNION`:

- Số cột và thứ tự cột của tất cả các truy vấn phải giống nhau.
- Kiểu dữ liệu của cột trong bảng liên quan đến mỗi truy vấn phải giống nhau hoặc tương thích.
- Thông thường tên cột trả về lấy từ truy vấn đầu tiên.

Mặc định, toán tử `UNION` chọn các giá trị khác nhau. Nếu cho phép giá trị trùng lặp, hãy dùng `UNION ALL`.

```sql
SELECT column_name(s) FROM table1
UNION ALL
SELECT column_name(s) FROM table2;
```

Tên cột trong tập kết quả `UNION` luôn bằng tên cột trong câu lệnh `SELECT` đầu tiên trong `UNION`.

`JOIN` vs `UNION`:

- Các cột của bảng kết nối trong `JOIN` có thể khác nhau, nhưng trong `UNION`, số cột và thứ tự cột của tất cả các truy vấn phải giống nhau.
- `UNION` đặt các hàng sau khi truy vấn cạnh nhau (đặt theo chiều dọc), nhưng `JOIN` đặt các cột sau khi truy vấn cạnh nhau (đặt theo chiều ngang), tức là nó tạo ra tích Descartes.

## Hàm

Hàm của các cơ sở dữ liệu khác nhau thường không giống nhau, vì vậy không thể di chuyển được. Phần này chủ yếu lấy hàm của MySQL làm ví dụ.

### Xử lý văn bản

| Hàm                  | Mô tả                                  |
| -------------------- | -------------------------------------- |
| `LEFT()`、`RIGHT()`  | Ký tự bên trái hoặc bên phải           |
| `LOWER()`、`UPPER()` | Chuyển thành chữ thường hoặc chữ hoa   |
| `LTRIM()`、`RTRIM()` | Bỏ khoảng trắng bên trái hoặc bên phải |
| `LENGTH()`           | Độ dài, tính theo byte                 |
| `SOUNDEX()`          | Chuyển đổi thành giá trị âm thanh      |

Trong đó, **`SOUNDEX()`** có thể chuyển đổi một chuỗi thành mẫu chữ và số mô tả biểu diễn âm thanh của nó.

```sql
SELECT *
FROM mytable
WHERE SOUNDEX(col1) = SOUNDEX('apple')
```

### Xử lý ngày và giờ

- Định dạng ngày: `YYYY-MM-DD`
- Định dạng giờ: `HH:MM:SS`

| Hàm             | Mô tả                                             |
| --------------- | ------------------------------------------------- |
| `AddDate()`     | Tăng thêm một ngày (ngày, tuần, v.v.)             |
| `AddTime()`     | Tăng thêm một thời gian (giờ, phút, v.v.)         |
| `CurDate()`     | Trả về ngày hiện tại                              |
| `CurTime()`     | Trả về giờ hiện tại                               |
| `Date()`        | Trả về phần ngày của ngày giờ                     |
| `DateDiff()`    | Tính khoảng cách giữa hai ngày                    |
| `Date_Add()`    | Hàm tính toán ngày rất linh hoạt                  |
| `Date_Format()` | Trả về chuỗi ngày hoặc giờ được định dạng         |
| `Day()`         | Trả về phần ngày của một ngày                     |
| `DayOfWeek()`   | Đối với một ngày, trả về thứ trong tuần tương ứng |
| `Hour()`        | Trả về phần giờ của một thời gian                 |
| `Minute()`      | Trả về phần phút của một thời gian                |
| `Month()`       | Trả về phần tháng của một ngày                    |
| `Now()`         | Trả về ngày và giờ hiện tại                       |
| `Second()`      | Trả về phần giây của một thời gian                |
| `Time()`        | Trả về phần giờ của một ngày giờ                  |
| `Year()`        | Trả về phần năm của một ngày                      |

### Xử lý số học

| Hàm    | Mô tả             |
| ------ | ----------------- |
| SIN()  | Sin               |
| COS()  | Cos               |
| TAN()  | Tan               |
| ABS()  | Giá trị tuyệt đối |
| SQRT() | Căn bậc hai       |
| MOD()  | Số dư             |
| EXP()  | Số mũ             |
| PI()   | Số Pi             |
| RAND() | Số ngẫu nhiên     |

### Tổng hợp

| Hàm       | Mô tả                                 |
| --------- | ------------------------------------- |
| `AVG()`   | Trả về giá trị trung bình của một cột |
| `COUNT()` | Trả về số hàng của một cột            |
| `MAX()`   | Trả về giá trị lớn nhất của một cột   |
| `MIN()`   | Trả về giá trị nhỏ nhất của một cột   |
| `SUM()`   | Trả về tổng giá trị của một cột       |

`AVG()` sẽ bỏ qua hàng NULL.

Dùng `DISTINCT` có thể cho phép hàm tổng hợp chỉ tổng hợp các giá trị khác nhau.

```sql
SELECT AVG(DISTINCT col1) AS avg_col
FROM mytable
```

**Tiếp theo, hãy giới thiệu cách sử dụng câu lệnh DDL. Chức năng chính của DDL là định nghĩa đối tượng cơ sở dữ liệu (như: cơ sở dữ liệu, bảng dữ liệu, view, chỉ mục, v.v.)**

## Định nghĩa dữ liệu

### Cơ sở dữ liệu (DATABASE)

#### Tạo cơ sở dữ liệu

```sql
CREATE DATABASE test;
```

#### Xóa cơ sở dữ liệu

```sql
DROP DATABASE test;
```

#### Chọn cơ sở dữ liệu

```sql
USE test;
```

### Bảng dữ liệu (TABLE)

#### Tạo bảng dữ liệu

**Tạo thông thường**

```sql
CREATE TABLE user (
  id int(10) unsigned NOT NULL COMMENT 'Id',
  username varchar(64) NOT NULL DEFAULT 'default' COMMENT '用户名',
  password varchar(64) NOT NULL DEFAULT 'default' COMMENT '密码',
  email varchar(64) NOT NULL DEFAULT 'default' COMMENT '邮箱'
) COMMENT='用户表';
```

**Tạo bảng mới dựa trên bảng đã có**

```sql
CREATE TABLE vip_user AS
SELECT * FROM user;
```

#### Xóa bảng dữ liệu

```sql
DROP TABLE user;
```

#### Sửa đổi bảng dữ liệu

**Thêm cột**

```sql
ALTER TABLE user
ADD age int(3);
```

**Xóa cột**

```sql
ALTER TABLE user
DROP COLUMN age;
```

**Sửa đổi cột**

```sql
ALTER TABLE `user`
MODIFY COLUMN age tinyint;
```

**Thêm khóa chính**

```sql
ALTER TABLE user
ADD PRIMARY KEY (id);
```

**Xóa khóa chính**

```sql
ALTER TABLE user
DROP PRIMARY KEY;
```

### View (VIEW)

Định nghĩa:

- View là bảng trực quan dựa trên tập kết quả của câu lệnh SQL.
- View là bảng ảo, bản thân không chứa dữ liệu, cũng không thể thực hiện thao tác chỉ mục trên đó. Thao tác trên view giống như thao tác trên bảng thông thường.

Tác dụng:

- Đơn giản hóa các thao tác SQL phức tạp, ví dụ như kết nối phức tạp;
- Chỉ dùng một phần dữ liệu của bảng thực tế;
- Đảm bảo an toàn dữ liệu bằng cách chỉ cấp cho người dùng quyền truy cập view;
- Thay đổi định dạng và trình bày dữ liệu.

![mysql视图](https://oss.javaguide.cn/p3-juejin/ec4c975296ea4a7097879dac7c353878~tplv-k3u1fbpfcp-zoom-1.jpeg)

#### Tạo view

```sql
CREATE VIEW top_10_user_view AS
SELECT id, username
FROM user
WHERE id < 10;
```

#### Xóa view

```sql
DROP VIEW top_10_user_view;
```

### Chỉ mục (INDEX)

**Chỉ mục là một cấu trúc dữ liệu dùng để truy vấn và truy xuất dữ liệu nhanh chóng, bản chất của nó có thể được xem như một cấu trúc dữ liệu đã được sắp xếp.**

Tác dụng của chỉ mục tương đương với mục lục của sách. Ví dụ: Khi tra từ điển, nếu không có mục lục, chúng ta chỉ có thể lật từng trang để tìm từ cần tra, rất chậm. Nếu có mục lục, chúng ta chỉ cần tìm vị trí của từ trong mục lục trước, rồi lật thẳng đến trang đó là được.

**Ưu điểm**:

- Sử dụng chỉ mục có thể tăng tốc độ truy xuất dữ liệu rất nhiều (giảm đáng kể lượng dữ liệu cần truy xuất), đây cũng là lý do chính để tạo chỉ mục.
- Bằng cách tạo chỉ mục duy nhất, có thể đảm bảo tính duy nhất của mỗi hàng dữ liệu trong bảng cơ sở dữ liệu.

**Nhược điểm**:

- Tạo và duy trì chỉ mục tốn nhiều thời gian. Khi thêm, xóa, sửa dữ liệu trong bảng, nếu dữ liệu có chỉ mục, thì chỉ mục cũng cần được sửa đổi động, sẽ làm giảm hiệu suất thực thi SQL.
- Chỉ mục cần lưu trữ vật lý, cũng sẽ tốn một lượng không gian nhất định.

Nhưng, **liệu sử dụng chỉ mục có thể cải thiện hiệu suất truy vấn không?**

Trong hầu hết các trường hợp, truy vấn chỉ mục nhanh hơn quét toàn bảng. Nhưng nếu lượng dữ liệu trong cơ sở dữ liệu không lớn, thì sử dụng chỉ mục không nhất thiết mang lại cải thiện lớn.

Để biết thêm chi tiết về chỉ mục, vui lòng xem bài viết [MySQL 索引详解](https://javaguide.cn/database/mysql/mysql-index.html) mà tôi đã viết.

#### Tạo chỉ mục

```sql
CREATE INDEX user_index
ON user (id);
```

#### Thêm chỉ mục

```sql
ALTER table user ADD INDEX user_index(id)
```

#### Tạo chỉ mục duy nhất

```sql
CREATE UNIQUE INDEX user_index
ON user (id);
```

#### Xóa chỉ mục

```sql
ALTER TABLE user
DROP INDEX user_index;
```

### Ràng buộc

Ràng buộc SQL được dùng để quy định các quy tắc dữ liệu trong bảng.

Nếu có hành vi dữ liệu vi phạm ràng buộc, hành vi đó sẽ bị ràng buộc chấm dứt.

Ràng buộc có thể được quy định khi tạo bảng (thông qua câu lệnh CREATE TABLE), hoặc sau khi bảng được tạo (thông qua câu lệnh ALTER TABLE).

Các loại ràng buộc:

- `NOT NULL` - Chỉ ra rằng một cột không thể lưu trữ giá trị NULL.
- `UNIQUE` - Đảm bảo mỗi hàng của một cột phải có giá trị duy nhất.
- `PRIMARY KEY` - Kết hợp của NOT NULL và UNIQUE. Đảm bảo một cột (hoặc kết hợp của hai hoặc nhiều cột) có định danh duy nhất, giúp tìm một bản ghi cụ thể trong bảng dễ dàng và nhanh hơn.
- `FOREIGN KEY` - Đảm bảo tính toàn vẹn tham chiếu của dữ liệu trong một bảng khớp với giá trị trong một bảng khác.
- `CHECK` - Đảm bảo giá trị trong cột thỏa mãn điều kiện được chỉ định.
- `DEFAULT` - Quy định giá trị mặc định khi không gán giá trị cho cột.

Sử dụng điều kiện ràng buộc khi tạo bảng:

```sql
CREATE TABLE Users (
  Id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增Id',
  Username VARCHAR(64) NOT NULL UNIQUE DEFAULT 'default' COMMENT '用户名',
  Password VARCHAR(64) NOT NULL DEFAULT 'default' COMMENT '密码',
  Email VARCHAR(64) NOT NULL DEFAULT 'default' COMMENT '邮箱地址',
  Enabled TINYINT(4) DEFAULT NULL COMMENT '是否有效',
  PRIMARY KEY (Id)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

**Tiếp theo, hãy giới thiệu cách sử dụng câu lệnh TCL. Chức năng chính của TCL là quản lý giao dịch trong cơ sở dữ liệu.**

## Xử lý giao dịch

Không thể rollback câu lệnh `SELECT`, rollback câu lệnh `SELECT` cũng không có ý nghĩa; cũng không thể rollback câu lệnh `CREATE` và `DROP`.

**MySQL mặc định là commit ngầm**, mỗi khi thực thi một câu lệnh sẽ coi câu lệnh đó là một giao dịch rồi commit. Khi xuất hiện câu lệnh `START TRANSACTION`, commit ngầm sẽ bị tắt; sau khi câu lệnh `COMMIT` hoặc `ROLLBACK` được thực thi, giao dịch sẽ tự động đóng, và commit ngầm sẽ được khôi phục.

Thông qua `set autocommit=0` có thể tắt commit tự động, cho đến khi `set autocommit=1` mới commit; cờ `autocommit` là đối với từng kết nối chứ không phải đối với máy chủ.

Các lệnh:

- `START TRANSACTION` - Lệnh dùng để đánh dấu điểm bắt đầu của giao dịch.
- `SAVEPOINT` - Lệnh dùng để tạo điểm lưu trữ.
- `ROLLBACK TO` - Lệnh dùng để rollback về điểm lưu trữ được chỉ định; nếu không có điểm lưu trữ, thì rollback về câu lệnh `START TRANSACTION`.
- `COMMIT` - Commit giao dịch.

```sql
-- 开始事务
START TRANSACTION;

-- 插入操作 A
INSERT INTO `user`
VALUES (1, 'root1', 'root1', 'xxxx@163.com');

-- 创建保留点 updateA
SAVEPOINT updateA;

-- 插入操作 B
INSERT INTO `user`
VALUES (2, 'root2', 'root2', 'xxxx@163.com');

-- 回滚到保留点 updateA
ROLLBACK TO updateA;

-- 提交事务，只有操作 A 生效
COMMIT;
```

**Tiếp theo, hãy giới thiệu cách sử dụng câu lệnh DCL. Chức năng chính của DCL là kiểm soát quyền truy cập của người dùng.**

## Kiểm soát quyền

Để cấp quyền cho tài khoản người dùng, có thể dùng lệnh `GRANT`. Để thu hồi quyền của người dùng, có thể dùng lệnh `REVOKE`. Ở đây lấy MySQL làm ví dụ để giới thiệu ứng dụng thực tế của kiểm soát quyền.

Cú pháp `GRANT` cấp quyền:

```sql
GRANT privilege,[privilege],.. ON privilege_level
TO user [IDENTIFIED BY password]
[REQUIRE tsl_option]
[WITH [GRANT_OPTION | resource_option]];
```

Giải thích đơn giản:

1. Chỉ định một hoặc nhiều quyền sau từ khóa `GRANT`. Nếu cấp cho người dùng nhiều quyền, mỗi quyền phân cách nhau bằng dấu phẩy.
2. `ON privilege_level` xác định cấp độ áp dụng quyền. MySQL hỗ trợ cấp độ global (`*.*`), database (`database.*`), table (`database.table`) và cột. Nếu dùng cấp độ quyền cột, phải chỉ định một hoặc danh sách cột phân cách bằng dấu phẩy sau mỗi quyền.
3. `user` là người dùng được cấp quyền. Nếu người dùng đã tồn tại, câu lệnh `GRANT` sẽ sửa đổi quyền của họ. Nếu không, câu lệnh `GRANT` sẽ tạo người dùng mới. Mệnh đề tùy chọn `IDENTIFIED BY` cho phép đặt mật khẩu mới cho người dùng.
4. `REQUIRE tsl_option` chỉ định xem người dùng có phải kết nối đến máy chủ cơ sở dữ liệu qua kết nối an toàn như SSL, X059, v.v. hay không.
5. Mệnh đề tùy chọn `WITH GRANT OPTION` cho phép cấp hoặc thu hồi quyền mà bạn có từ người dùng khác. Ngoài ra, có thể dùng mệnh đề `WITH` để phân bổ tài nguyên của máy chủ cơ sở dữ liệu MySQL, ví dụ, đặt số lần kết nối hoặc số câu lệnh mỗi giờ người dùng có thể dùng. Điều này rất hữu ích trong môi trường chia sẻ như MySQL shared hosting.

Cú pháp `REVOKE` thu hồi quyền:

```sql
REVOKE   privilege_type [(column_list)]
        [, priv_type [(column_list)]]...
ON [object_type] privilege_level
FROM user [, user]...
```

Giải thích đơn giản:

1. Chỉ định danh sách quyền cần thu hồi từ người dùng sau từ khóa `REVOKE`. Cần phân cách các quyền bằng dấu phẩy.
2. Chỉ định cấp độ đặc quyền cần thu hồi trong mệnh đề `ON`.
3. Chỉ định tài khoản người dùng cần thu hồi quyền trong mệnh đề `FROM`.

`GRANT` và `REVOKE` có thể kiểm soát quyền truy cập ở một số cấp độ:

- Toàn bộ máy chủ, dùng `GRANT ALL` và `REVOKE ALL`;
- Toàn bộ cơ sở dữ liệu, dùng `ON database.*`;
- Bảng cụ thể, dùng `ON database.table`;
- Cột cụ thể;
- Thủ tục lưu trữ cụ thể.

Tài khoản mới tạo không có bất kỳ quyền nào. Tài khoản được định nghĩa dưới dạng `username@host`, `username@%` sử dụng tên máy chủ mặc định. Thông tin tài khoản MySQL được lưu trong cơ sở dữ liệu mysql.

```sql
USE mysql;
SELECT user FROM user;
```

Bảng dưới đây mô tả tất cả các quyền cho phép có thể dùng trong câu lệnh `GRANT` và `REVOKE`:

| **Quyền**               | **Mô tả**                                                                                                                        | **Cấp độ** |         |                  |           |     |     |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | ---------------- | --------- | --- | --- |
| **Toàn cục**            | Cơ sở dữ liệu                                                                                                                    | **Bảng**   | **Cột** | **Chương trình** | **Proxy** |     |     |
| ALL [PRIVILEGES]        | Cấp tất cả quyền ở cấp độ truy cập được chỉ định ngoại trừ GRANT OPTION                                                          |            |         |                  |           |     |     |
| ALTER                   | Cho phép người dùng dùng câu lệnh ALTER TABLE                                                                                    | X          | X       | X                |           |     |     |
| ALTER ROUTINE           | Cho phép người dùng thay đổi hoặc xóa stored routine                                                                             | X          | X       |                  |           | X   |     |
| CREATE                  | Cho phép người dùng tạo cơ sở dữ liệu và bảng                                                                                    | X          | X       | X                |           |     |     |
| CREATE ROUTINE          | Cho phép người dùng tạo stored routine                                                                                           | X          | X       |                  |           |     |     |
| CREATE TABLESPACE       | Cho phép người dùng tạo, thay đổi hoặc xóa tablespace và nhóm log file                                                           | X          |         |                  |           |     |     |
| CREATE TEMPORARY TABLES | Cho phép người dùng tạo bảng tạm bằng CREATE TEMPORARY TABLE                                                                     | X          | X       |                  |           |     |     |
| CREATE USER             | Cho phép người dùng dùng câu lệnh CREATE USER, DROP USER, RENAME USER và REVOKE ALL PRIVILEGES.                                  | X          |         |                  |           |     |     |
| CREATE VIEW             | Cho phép người dùng tạo hoặc sửa đổi view.                                                                                       | X          | X       | X                |           |     |     |
| DELETE                  | Cho phép người dùng dùng DELETE                                                                                                  | X          | X       | X                |           |     |     |
| DROP                    | Cho phép người dùng xóa cơ sở dữ liệu, bảng và view                                                                              | X          | X       | X                |           |     |     |
| EVENT                   | Cho phép sử dụng sự kiện của event scheduler.                                                                                    | X          | X       |                  |           |     |     |
| EXECUTE                 | Cho phép người dùng thực thi stored routine                                                                                      | X          | X       | X                |           |     |     |
| FILE                    | Cho phép người dùng đọc bất kỳ file nào trong thư mục cơ sở dữ liệu.                                                             | X          |         |                  |           |     |     |
| GRANT OPTION            | Cho phép người dùng có quyền cấp hoặc thu hồi quyền từ tài khoản khác.                                                           | X          | X       | X                |           | X   | X   |
| INDEX                   | Cho phép người dùng tạo hoặc xóa chỉ mục.                                                                                        | X          | X       | X                |           |     |     |
| INSERT                  | Cho phép người dùng dùng câu lệnh INSERT                                                                                         | X          | X       | X                | X         |     |     |
| LOCK TABLES             | Cho phép người dùng dùng LOCK TABLES trên bảng có quyền SELECT                                                                   | X          | X       |                  |           |     |     |
| PROCESS                 | Cho phép người dùng dùng câu lệnh SHOW PROCESSLIST để xem tất cả các tiến trình.                                                 | X          |         |                  |           |     |     |
| PROXY                   | Cho phép user proxy.                                                                                                             |            |         |                  |           |     |     |
| REFERENCES              | Cho phép người dùng tạo khóa ngoại                                                                                               | X          | X       | X                | X         |     |     |
| RELOAD                  | Cho phép người dùng dùng thao tác FLUSH                                                                                          | X          |         |                  |           |     |     |
| REPLICATION CLIENT      | Cho phép người dùng truy vấn để xem vị trí của máy chủ chính hoặc slave                                                          | X          |         |                  |           |     |     |
| REPLICATION SLAVE       | Cho phép người dùng dùng replication slave để đọc sự kiện binary log từ máy chủ chính.                                           | X          |         |                  |           |     |     |
| SELECT                  | Cho phép người dùng dùng câu lệnh SELECT                                                                                         | X          | X       | X                | X         |     |     |
| SHOW DATABASES          | Cho phép người dùng hiển thị tất cả các cơ sở dữ liệu                                                                            | X          |         |                  |           |     |     |
| SHOW VIEW               | Cho phép người dùng dùng câu lệnh SHOW CREATE VIEW                                                                               | X          | X       | X                |           |     |     |
| SHUTDOWN                | Cho phép người dùng dùng lệnh mysqladmin shutdown                                                                                | X          |         |                  |           |     |     |
| SUPER                   | Cho phép người dùng dùng các thao tác quản trị khác như CHANGE MASTER TO, KILL, PURGE BINARY LOGS, SET GLOBAL và lệnh mysqladmin | X          |         |                  |           |     |     |
| TRIGGER                 | Cho phép người dùng dùng thao tác TRIGGER.                                                                                       | X          | X       | X                |           |     |     |
| UPDATE                  | Cho phép người dùng dùng câu lệnh UPDATE                                                                                         | X          | X       | X                | X         |     |     |
| USAGE                   | Tương đương với "không có quyền đặc biệt"                                                                                        |            |         |                  |           |     |     |

### Tạo tài khoản

```sql
CREATE USER myuser IDENTIFIED BY 'mypassword';
```

### Sửa đổi tên tài khoản

```sql
UPDATE user SET user='newuser' WHERE user='myuser';
FLUSH PRIVILEGES;
```

### Xóa tài khoản

```sql
DROP USER myuser;
```

### Xem quyền

```sql
SHOW GRANTS FOR myuser;
```

### Cấp quyền

```sql
GRANT SELECT, INSERT ON *.* TO myuser;
```

### Xóa quyền

```sql
REVOKE SELECT, INSERT ON *.* FROM myuser;
```

### Đổi mật khẩu

```sql
SET PASSWORD FOR myuser = 'mypass';
```

## Thủ tục lưu trữ

Thủ tục lưu trữ có thể được xem như xử lý hàng loạt các thao tác SQL. Thủ tục lưu trữ có thể được gọi bởi trigger, các thủ tục lưu trữ khác và các ứng dụng như Java, Python, PHP, v.v.

![mysql存储过程](https://oss.javaguide.cn/p3-juejin/60afdc9c9a594f079727ec64a2e698a3~tplv-k3u1fbpfcp-zoom-1.jpeg)

Lợi ích của việc sử dụng thủ tục lưu trữ:

- Đóng gói code, đảm bảo một mức độ an toàn nhất định;
- Tái sử dụng code;
- Do được biên dịch trước, nên có hiệu suất rất cao.

Tạo thủ tục lưu trữ:

- Tạo thủ tục lưu trữ trong command line cần tùy chỉnh ký tự phân cách, vì command line dùng `;` làm ký tự kết thúc, trong khi thủ tục lưu trữ cũng chứa dấu chấm phẩy, vì vậy sẽ nhầm dấu chấm phẩy đó thành ký tự kết thúc, gây ra lỗi cú pháp.
- Bao gồm ba loại tham số `in`, `out` và `inout`.
- Việc gán giá trị cho biến đều cần dùng câu lệnh `select into`.
- Mỗi lần chỉ có thể gán giá trị cho một biến, không hỗ trợ thao tác tập hợp.

Cần lưu ý rằng: **《Java 开发手册》 của Alibaba bắt buộc không sử dụng thủ tục lưu trữ. Vì thủ tục lưu trữ khó debug và mở rộng, và không có tính di chuyển.**

![](https://oss.javaguide.cn/p3-juejin/93a5e011ade4450ebfa5d82057532a49~tplv-k3u1fbpfcp-zoom-1.png)

Còn có sử dụng trong dự án hay không, vẫn phải xem nhu cầu thực tế của dự án và cân nhắc lợi hại!

### Tạo thủ tục lưu trữ

```sql
DROP PROCEDURE IF EXISTS `proc_adder`;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `proc_adder`(IN a int, IN b int, OUT sum int)
BEGIN
    DECLARE c int;
    if a is null then set a = 0;
    end if;

    if b is null then set b = 0;
    end if;

    set sum  = a + b;
END
;;
DELIMITER ;
```

### Sử dụng thủ tục lưu trữ

```less
set @b=5;
call proc_adder(2,@b,@s);
select @s as sum;
```

## Con trỏ

Con trỏ (cursor) là một truy vấn cơ sở dữ liệu được lưu trữ trên máy chủ DBMS, nó không phải là câu lệnh `SELECT`, mà là tập kết quả được truy xuất bởi câu lệnh đó.

Sử dụng con trỏ trong thủ tục lưu trữ có thể duyệt qua một tập kết quả.

Con trỏ chủ yếu được dùng trong các ứng dụng tương tác, trong đó người dùng cần cuộn qua dữ liệu trên màn hình và duyệt hoặc thay đổi dữ liệu.

Các bước rõ ràng khi sử dụng con trỏ:

- Trước khi dùng con trỏ, phải khai báo (định nghĩa) nó. Quá trình này thực ra không truy xuất dữ liệu, nó chỉ định nghĩa câu lệnh `SELECT` và các tùy chọn con trỏ sẽ được dùng.

- Sau khi khai báo, phải mở con trỏ để sử dụng. Quá trình này truy xuất thực sự dữ liệu bằng câu lệnh SELECT đã định nghĩa trước.

- Đối với con trỏ đã được điền dữ liệu, lấy (truy xuất) từng hàng theo nhu cầu.

- Khi kết thúc sử dụng con trỏ, phải đóng con trỏ, và nếu có thể, giải phóng con trỏ (tùy thuộc vào

  DBMS cụ thể).

```sql
DELIMITER $
CREATE  PROCEDURE getTotal()
BEGIN
    DECLARE total INT;
    -- 创建接收游标数据的变量
    DECLARE sid INT;
    DECLARE sname VARCHAR(10);
    -- 创建总数变量
    DECLARE sage INT;
    -- 创建结束标志变量
    DECLARE done INT DEFAULT false;
    -- 创建游标
    DECLARE cur CURSOR FOR SELECT id,name,age from cursor_table where age>30;
    -- 指定游标循环结束时的返回值
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = true;
    SET total = 0;
    OPEN cur;
    FETCH cur INTO sid, sname, sage;
    WHILE(NOT done)
    DO
        SET total = total + 1;
        FETCH cur INTO sid, sname, sage;
    END WHILE;

    CLOSE cur;
    SELECT total;
END $
DELIMITER ;

-- 调用存储过程
call getTotal();
```

## Trigger

Trigger là một đối tượng cơ sở dữ liệu liên quan đến thao tác bảng. Khi sự kiện được chỉ định xảy ra trên bảng nơi trigger tồn tại, đối tượng đó sẽ được gọi, tức là sự kiện thao tác trên bảng sẽ kích hoạt việc thực thi trigger trên bảng.

Chúng ta có thể dùng trigger để theo dõi kiểm tra, ghi lại các thay đổi vào bảng khác.

Ưu điểm của việc sử dụng trigger:

- SQL trigger cung cấp một phương pháp khác để kiểm tra tính toàn vẹn dữ liệu.
- SQL trigger có thể bắt các lỗi trong logic nghiệp vụ ở tầng cơ sở dữ liệu.
- SQL trigger cung cấp một cách khác để chạy các tác vụ theo lịch. Bằng cách sử dụng SQL trigger, bạn không cần đợi chạy tác vụ theo lịch, vì trigger sẽ tự động được gọi trước hoặc sau khi dữ liệu trong bảng thay đổi.
- SQL trigger rất hữu ích để kiểm tra lịch sử thay đổi dữ liệu trong bảng.

Nhược điểm của việc sử dụng trigger:

- SQL trigger chỉ có thể cung cấp xác thực mở rộng và không thể thay thế tất cả các xác thực. Một số xác thực đơn giản phải được thực hiện ở tầng ứng dụng. Ví dụ, bạn có thể dùng JavaScript để xác thực đầu vào của người dùng ở phía client, hoặc dùng ngôn ngữ script phía server (như JSP, PHP, ASP.NET, Perl) để xác thực đầu vào của người dùng ở phía server.
- Việc gọi và thực thi SQL trigger từ ứng dụng client là không nhìn thấy, vì vậy rất khó để tìm hiểu những gì đang xảy ra ở tầng cơ sở dữ liệu.
- SQL trigger có thể làm tăng tải cho máy chủ cơ sở dữ liệu.

MySQL không cho phép sử dụng câu lệnh CALL trong trigger, tức là không thể gọi thủ tục lưu trữ.

> Lưu ý: Trong MySQL, dấu chấm phẩy `;` là ký tự kết thúc câu lệnh, khi gặp dấu chấm phẩy sẽ báo hiệu đoạn câu lệnh đó đã kết thúc, MySQL có thể bắt đầu thực thi. Vì vậy, khi interpreter gặp dấu chấm phẩy trong hành động thực thi của trigger, nó sẽ bắt đầu thực thi, sau đó sẽ báo lỗi vì không tìm thấy END khớp với BEGIN.
>
> Lúc này sẽ cần dùng đến lệnh `DELIMITER` (DELIMITER là ký tự phân tách, phân cách). Đây là một lệnh, không cần ký tự kết thúc câu lệnh, cú pháp là: `DELIMITER new_delimiter`. `new_delimiter` có thể đặt là ký hiệu có độ dài 1 ký tự trở lên, mặc định là dấu chấm phẩy `;`, chúng ta có thể thay đổi nó thành ký hiệu khác, như `$` - `DELIMITER $`. Sau đó, các câu lệnh kết thúc bằng dấu chấm phẩy, interpreter sẽ không có phản ứng gì, chỉ khi gặp `$` mới cho là kết thúc câu lệnh. Lưu ý, sau khi dùng xong, chúng ta cũng nên nhớ đổi lại.

Trước phiên bản MySQL 5.7.2, có thể định nghĩa tối đa sáu trigger cho mỗi bảng.

- `BEFORE INSERT` - Kích hoạt trước khi chèn dữ liệu vào bảng.
- `AFTER INSERT` - Kích hoạt sau khi chèn dữ liệu vào bảng.
- `BEFORE UPDATE` - Kích hoạt trước khi cập nhật dữ liệu trong bảng.
- `AFTER UPDATE` - Kích hoạt sau khi cập nhật dữ liệu trong bảng.
- `BEFORE DELETE` - Kích hoạt trước khi xóa dữ liệu khỏi bảng.
- `AFTER DELETE` - Kích hoạt sau khi xóa dữ liệu khỏi bảng.

Nhưng từ phiên bản MySQL 5.7.2+, có thể định nghĩa nhiều trigger cho cùng sự kiện trigger và thời gian hành động.

**`NEW` và `OLD`**:

- MySQL định nghĩa các từ khóa `NEW` và `OLD`, dùng để biểu diễn hàng dữ liệu kích hoạt trigger trong bảng nơi trigger tồn tại.
- Trong trigger kiểu `INSERT`, `NEW` dùng để biểu diễn dữ liệu mới sẽ được chèn (`BEFORE`) hoặc đã được chèn (`AFTER`);
- Trong trigger kiểu `UPDATE`, `OLD` dùng để biểu diễn dữ liệu gốc sẽ hoặc đã bị sửa đổi, `NEW` dùng để biểu diễn dữ liệu mới sẽ hoặc đã được sửa đổi thành;
- Trong trigger kiểu `DELETE`, `OLD` dùng để biểu diễn dữ liệu gốc sẽ hoặc đã bị xóa;
- Cách dùng: `NEW.columnName` (columnName là tên cột tương ứng trong bảng dữ liệu)

### Tạo trigger

> Gợi ý: Để hiểu các điểm cần chú ý của trigger, cần tìm hiểu trước về lệnh tạo trigger.

Lệnh `CREATE TRIGGER` được dùng để tạo trigger.

Cú pháp:

```sql
CREATE TRIGGER trigger_name
trigger_time
trigger_event
ON table_name
FOR EACH ROW
BEGIN
  trigger_statements
END;
```

Giải thích:

- `trigger_name`: Tên trigger
- `trigger_time`: Thời gian kích hoạt trigger. Giá trị là `BEFORE` hoặc `AFTER`.
- `trigger_event`: Sự kiện trigger theo dõi. Giá trị là `INSERT`, `UPDATE` hoặc `DELETE`.
- `table_name`: Mục tiêu theo dõi của trigger. Chỉ định bảng nào để thiết lập trigger.
- `FOR EACH ROW`: Theo dõi cấp độ hàng, cách viết cố định của Mysql, DBMS khác khác nhau.
- `trigger_statements`: Hành động thực thi của trigger. Là danh sách một hoặc nhiều câu lệnh SQL, mỗi câu lệnh trong danh sách phải kết thúc bằng dấu chấm phẩy `;`.

Khi điều kiện kích hoạt của trigger được thỏa mãn, hành động thực thi trigger giữa `BEGIN` và `END` sẽ được thực thi.

Ví dụ:

```sql
DELIMITER $
CREATE TRIGGER `trigger_insert_user`
AFTER INSERT ON `user`
FOR EACH ROW
BEGIN
    INSERT INTO `user_history`(user_id, operate_type, operate_time)
    VALUES (NEW.id, 'add a user',  now());
END $
DELIMITER ;
```

### Xem trigger

```sql
SHOW TRIGGERS;
```

### Xóa trigger

```sql
DROP TRIGGER IF EXISTS trigger_insert_user;
```

## Bài viết tham khảo

- [后端程序员必备：SQL 高性能优化指南！35+条优化建议立马 GET!](https://mp.weixin.qq.com/s/I-ZT3zGTNBZ6egS7T09jyQ)
- [后端程序员必备：书写高质量 SQL 的 30 条建议](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247486461&idx=1&sn=60a22279196d084cc398936fe3b37772&chksm=cea24436f9d5cd20a4fa0e907590f3e700d7378b3f608d7b33bb52cfb96f503b7ccb65a1deed&token=1987003517&lang=zh_CN#rd)

<!-- @include: @article-footer.snippet.md -->
