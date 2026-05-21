---
title: Tổng hợp câu hỏi phỏng vấn SQL thường gặp (1)
description: Phần đầu tiên của tổng hợp câu hỏi phỏng vấn SQL thường gặp, bao gồm các thao tác truy vấn cơ bản như SELECT truy xuất dữ liệu, lọc điều kiện WHERE, sắp xếp ORDER BY, loại trùng DISTINCT, phân trang LIMIT cùng phân tích đề thực tế từ Nowcoder.
category: Cơ sở dữ liệu
tag:
  - Cơ bản về cơ sở dữ liệu
  - SQL
head:
  - - meta
    - name: keywords
      content: SQL面试题,SELECT查询,WHERE条件,ORDER BY排序,DISTINCT去重,LIMIT分页,SQL基础
---

> Nguồn đề bài: [Nowcoder - SQL Cơ Bản](https://www.nowcoder.com/exam/oj?page=1&tab=SQL%E7%AF%87&topicId=298)

## Truy xuất dữ liệu

`SELECT` dùng để truy vấn dữ liệu từ cơ sở dữ liệu.

### Truy xuất tất cả ID từ bảng Customers

Bảng `Customers` hiện tại như sau:

| cust_id |
| ------- |
| A       |
| B       |
| C       |

Viết câu lệnh SQL để truy xuất tất cả `cust_id` từ bảng `Customers`.

Đáp án:

```sql
SELECT cust_id
FROM Customers
```

### Truy xuất và liệt kê danh sách sản phẩm đã đặt hàng

Bảng `OrderItems` có cột `prod_id` không null đại diện cho id sản phẩm, chứa tất cả các sản phẩm đã được đặt hàng (một số đã được đặt nhiều lần).

| prod_id |
| ------- |
| a1      |
| a2      |
| a3      |
| a4      |
| a5      |
| a6      |
| a7      |

Viết câu lệnh SQL để truy xuất và liệt kê danh sách tất cả các sản phẩm đã đặt (`prod_id`) sau khi đã loại bỏ trùng lặp.

Đáp án:

```sql
SELECT DISTINCT prod_id
FROM OrderItems
```

Kiến thức: `DISTINCT` dùng để trả về các giá trị duy nhất trong cột.

### Truy xuất tất cả cột

Bảng `Customers` hiện tại (bảng có cột `cust_id` đại diện cho id khách hàng, `cust_name` đại diện cho tên khách hàng)

| cust_id | cust_name |
| ------- | --------- |
| a1      | andy      |
| a2      | ben       |
| a3      | tony      |
| a4      | tom       |
| a5      | an        |
| a6      | lee       |
| a7      | hex       |

Cần viết câu lệnh SQL để truy xuất tất cả các cột.

Đáp án:

```sql
SELECT cust_id, cust_name
FROM Customers
```

## Sắp xếp dữ liệu truy xuất

`ORDER BY` dùng để sắp xếp tập kết quả theo một hoặc nhiều cột. Mặc định sắp xếp theo thứ tự tăng dần. Nếu muốn sắp xếp theo thứ tự giảm dần, có thể sử dụng từ khóa `DESC`.

### Truy xuất tên khách hàng và sắp xếp

Bảng `Customers`, `cust_id` đại diện cho id khách hàng, `cust_name` đại diện cho tên khách hàng.

| cust_id | cust_name |
| ------- | --------- |
| a1      | andy      |
| a2      | ben       |
| a3      | tony      |
| a4      | tom       |
| a5      | an        |
| a6      | lee       |
| a7      | hex       |

Truy xuất tất cả tên khách hàng (`cust_name`) từ `Customers` và hiển thị kết quả theo thứ tự từ Z đến A.

Đáp án:

```sql
SELECT cust_name
FROM Customers
ORDER BY cust_name DESC
```

### Sắp xếp theo ID khách hàng và ngày

Bảng `Orders`:

| cust_id | order_num | order_date          |
| ------- | --------- | ------------------- |
| andy    | aaaa      | 2021-01-01 00:00:00 |
| andy    | bbbb      | 2021-01-01 12:00:00 |
| bob     | cccc      | 2021-01-10 12:00:00 |
| dick    | dddd      | 2021-01-11 00:00:00 |

Viết câu lệnh SQL để truy xuất ID khách hàng (`cust_id`) và số đơn hàng (`order_num`) từ bảng `Orders`, trước tiên sắp xếp kết quả theo ID khách hàng, sau đó sắp xếp theo ngày đặt hàng giảm dần.

Đáp án:

```sql
# 根据列名排序
# 注意：是 order_date 降序，而不是 order_num
SELECT cust_id, order_num
FROM Orders
ORDER BY cust_id,order_date DESC
```

Kiến thức: Khi `order by` sắp xếp theo nhiều cột, cột sắp xếp trước đặt ở trước, cột sắp xếp sau đặt ở sau. Các cột khác nhau có thể có quy tắc sắp xếp khác nhau.

### Sắp xếp theo số lượng và giá cả

Giả sử có bảng `OrderItems`:

| quantity | item_price |
| -------- | ---------- |
| 1        | 100        |
| 10       | 1003       |
| 2        | 500        |

Viết câu lệnh SQL để hiển thị số lượng (`quantity`) và giá cả (`item_price`) từ bảng `OrderItems`, sắp xếp theo số lượng từ nhiều đến ít, giá cả từ cao đến thấp.

Đáp án:

```sql
SELECT quantity, item_price
FROM OrderItems
ORDER BY quantity DESC,item_price DESC
```

### Kiểm tra câu lệnh SQL

Bảng `Vendors`:

| vend_name |
| --------- |
| 海底捞    |
| 小龙坎    |
| 大龙燚    |

Câu lệnh SQL dưới đây có vấn đề không? Hãy sửa lại cho đúng để trả về kết quả theo thứ tự ngược của `vend_name`.

```sql
SELECT vend_name,
FROM Vendors
ORDER vend_name DESC
```

Sau khi sửa:

```sql
SELECT vend_name
FROM Vendors
ORDER BY vend_name DESC
```

Kiến thức:

- Dấu phẩy dùng để phân cách giữa các cột.
- ORDER BY phải có BY, cần viết đầy đủ và đúng vị trí.

## Lọc dữ liệu

`WHERE` có thể lọc dữ liệu trả về.

Các toán tử sau có thể được sử dụng trong mệnh đề `WHERE`:

| Toán tử | Mô tả                                                                                 |
| :------ | :------------------------------------------------------------------------------------ |
| =       | Bằng                                                                                  |
| <>      | Không bằng. **Lưu ý:** Trong một số phiên bản SQL, toán tử này có thể được viết là != |
| >       | Lớn hơn                                                                               |
| <       | Nhỏ hơn                                                                               |
| >=      | Lớn hơn hoặc bằng                                                                     |
| <=      | Nhỏ hơn hoặc bằng                                                                     |
| BETWEEN | Trong một phạm vi nhất định                                                           |
| LIKE    | Tìm kiếm một mẫu nhất định                                                            |
| IN      | Chỉ định nhiều giá trị có thể cho một cột                                             |

### Trả về sản phẩm với giá cố định

Bảng `Products`:

| prod_id | prod_name      | prod_price |
| ------- | -------------- | ---------- |
| a0018   | sockets        | 9.49       |
| a0019   | iphone13       | 600        |
| b0018   | gucci t-shirts | 1000       |

【Câu hỏi】Truy xuất ID sản phẩm (`prod_id`) và tên sản phẩm (`prod_name`) từ bảng `Products`, chỉ trả về các sản phẩm có giá 9.49 đô la.

Đáp án:

```sql
SELECT prod_id, prod_name
FROM Products
WHERE prod_price = 9.49
```

### Trả về sản phẩm có giá cao hơn

Bảng `Products`:

| prod_id | prod_name      | prod_price |
| ------- | -------------- | ---------- |
| a0018   | sockets        | 9.49       |
| a0019   | iphone13       | 600        |
| b0019   | gucci t-shirts | 1000       |

【Câu hỏi】Viết câu lệnh SQL để truy xuất ID sản phẩm (`prod_id`) và tên sản phẩm (`prod_name`) từ bảng `Products`, chỉ trả về các sản phẩm có giá từ 9 đô la trở lên.

Đáp án:

```sql
SELECT prod_id, prod_name
FROM Products
WHERE prod_price >= 9
```

### Trả về sản phẩm và sắp xếp theo giá

Bảng `Products`:

| prod_id | prod_name | prod_price |
| ------- | --------- | ---------- |
| a0011   | egg       | 3          |
| a0019   | sockets   | 4          |
| b0019   | coffee    | 15         |

【Câu hỏi】Viết câu lệnh SQL để trả về tên (`prod_name`) và giá (`prod_price`) của tất cả sản phẩm trong bảng `Products` có giá từ 3 đến 6 đô la, sau đó sắp xếp kết quả theo giá.

Đáp án:

```sql
SELECT prod_name, prod_price
FROM Products
WHERE prod_price BETWEEN 3 AND 6
ORDER BY prod_price

# 或者
SELECT prod_name, prod_price
FROM Products
WHERE prod_price >= 3 AND prod_price <= 6
ORDER BY prod_price
```

### Trả về nhiều sản phẩm hơn

Bảng `OrderItems` chứa: số đơn hàng `order_num`, số lượng sản phẩm `quantity`

| order_num | quantity |
| --------- | -------- |
| a1        | 105      |
| a2        | 1100     |
| a2        | 200      |
| a4        | 1121     |
| a5        | 10       |
| a2        | 19       |
| a7        | 5        |

【Câu hỏi】Truy xuất tất cả các số đơn hàng (`order_num`) khác nhau và không trùng lặp từ bảng `OrderItems`, trong đó mỗi đơn hàng phải chứa 100 sản phẩm trở lên.

Đáp án:

```sql
SELECT order_num
FROM OrderItems
GROUP BY order_num
HAVING SUM(quantity) >= 100
```

## Lọc dữ liệu nâng cao

Toán tử `AND` và `OR` dùng để lọc bản ghi dựa trên nhiều hơn một điều kiện, hai toán tử này có thể kết hợp với nhau. `AND` yêu cầu cả 2 điều kiện đều phải đúng, `OR` chỉ cần 1 trong 2 điều kiện đúng là được.

### Truy xuất tên nhà cung cấp

Bảng `Vendors` có các trường: tên nhà cung cấp (`vend_name`), quốc gia nhà cung cấp (`vend_country`), bang nhà cung cấp (`vend_state`)

| vend_name | vend_country | vend_state |
| --------- | ------------ | ---------- |
| apple     | USA          | CA         |
| vivo      | CNA          | shenzhen   |
| huawei    | CNA          | xian       |

【Câu hỏi】Viết câu lệnh SQL để truy xuất tên nhà cung cấp (`vend_name`) từ bảng `Vendors`, chỉ trả về các nhà cung cấp ở California (cần lọc theo quốc gia [USA] và bang [CA], vì các quốc gia khác cũng có thể có CA)

Đáp án:

```sql
SELECT vend_name
FROM Vendors
WHERE vend_country = 'USA' AND vend_state = 'CA'
```

### Truy xuất và liệt kê danh sách sản phẩm đã đặt hàng

Bảng `OrderItems` chứa tất cả các sản phẩm đã đặt hàng (một số đã được đặt nhiều lần).

| prod_id | order_num | quantity |
| ------- | --------- | -------- |
| BR01    | a1        | 105      |
| BR02    | a2        | 1100     |
| BR02    | a2        | 200      |
| BR03    | a4        | 1121     |
| BR017   | a5        | 10       |
| BR02    | a2        | 19       |
| BR017   | a7        | 5        |

【Câu hỏi】Viết câu lệnh SQL để tìm tất cả các đơn hàng đã đặt ít nhất 100 sản phẩm `BR01`, `BR02` hoặc `BR03`. Bạn cần trả về số đơn hàng (`order_num`), ID sản phẩm (`prod_id`) và số lượng (`quantity`) từ bảng `OrderItems`, lọc theo ID sản phẩm và số lượng.

Đáp án:

```sql
SELECT order_num, prod_id, quantity
FROM OrderItems
WHERE prod_id IN ('BR01', 'BR02', 'BR03') AND quantity >= 100
```

### Trả về tất cả sản phẩm có giá từ 3 đến 6 đô la cùng tên và giá

Bảng `Products`:

| prod_id | prod_name | prod_price |
| ------- | --------- | ---------- |
| a0011   | egg       | 3          |
| a0019   | sockets   | 4          |
| b0019   | coffee    | 15         |

【Câu hỏi】Viết câu lệnh SQL để trả về tên (`prod_name`) và giá (`prod_price`) của tất cả sản phẩm có giá từ 3 đến 6 đô la, sử dụng toán tử AND, sau đó sắp xếp kết quả theo giá tăng dần.

Đáp án:

```sql
SELECT prod_name, prod_price
FROM Products
WHERE prod_price >= 3 and prod_price <= 6
ORDER BY prod_price
```

### Kiểm tra câu lệnh SQL

Bảng nhà cung cấp `Vendors` có các trường: tên nhà cung cấp `vend_name`, quốc gia nhà cung cấp `vend_country`, tỉnh/bang nhà cung cấp `vend_state`

| vend_name | vend_country | vend_state |
| --------- | ------------ | ---------- |
| apple     | USA          | CA         |
| vivo      | CNA          | shenzhen   |
| huawei    | CNA          | xian       |

【Câu hỏi】Sửa SQL dưới đây để trả về kết quả đúng.

```sql
SELECT vend_name
FROM Vendors
ORDER BY vend_name
WHERE vend_country = 'USA' AND vend_state = 'CA';
```

Sau khi sửa:

```sql
SELECT vend_name
FROM Vendors
WHERE vend_country = 'USA' AND vend_state = 'CA'
ORDER BY vend_name
```

Mệnh đề `ORDER BY` phải đặt sau `WHERE`.

## Lọc bằng ký tự đại diện

Ký tự đại diện SQL phải được sử dụng cùng với toán tử `LIKE`

Trong SQL, có thể sử dụng các ký tự đại diện sau:

| Ký tự đại diện                   | Mô tả                                         |
| :------------------------------- | :-------------------------------------------- |
| `%`                              | Đại diện cho không hoặc nhiều ký tự           |
| `_`                              | Chỉ thay thế một ký tự                        |
| `[charlist]`                     | Bất kỳ ký tự đơn nào trong danh sách          |
| `[^charlist]` hoặc `[!charlist]` | Bất kỳ ký tự đơn nào không có trong danh sách |

### Truy xuất tên và mô tả sản phẩm (I)

Bảng `Products`:

| prod_name | prod_desc      |
| --------- | -------------- |
| a0011     | usb            |
| a0019     | iphone13       |
| b0019     | gucci t-shirts |
| c0019     | gucci toy      |
| d0019     | lego toy       |

【Câu hỏi】Viết câu lệnh SQL để truy xuất tên sản phẩm (`prod_name`) và mô tả (`prod_desc`) từ bảng `Products`, chỉ trả về các sản phẩm có mô tả chứa từ `toy`.

Đáp án:

```sql
SELECT prod_name, prod_desc
FROM Products
WHERE prod_desc LIKE '%toy%'
```

### Truy xuất tên và mô tả sản phẩm (II)

Bảng `Products`:

| prod_name | prod_desc      |
| --------- | -------------- |
| a0011     | usb            |
| a0019     | iphone13       |
| b0019     | gucci t-shirts |
| c0019     | gucci toy      |
| d0019     | lego toy       |

【Câu hỏi】Viết câu lệnh SQL để truy xuất tên sản phẩm (`prod_name`) và mô tả (`prod_desc`) từ bảng `Products`, chỉ trả về các sản phẩm không có từ `toy` trong mô tả, cuối cùng sắp xếp kết quả theo "tên sản phẩm".

Đáp án:

```sql
SELECT prod_name, prod_desc
FROM Products
WHERE prod_desc NOT LIKE '%toy%'
ORDER BY prod_name
```

### Truy xuất tên và mô tả sản phẩm (III)

Bảng `Products`:

| prod_name | prod_desc        |
| --------- | ---------------- |
| a0011     | usb              |
| a0019     | iphone13         |
| b0019     | gucci t-shirts   |
| c0019     | gucci toy        |
| d0019     | lego carrots toy |

【Câu hỏi】Viết câu lệnh SQL để truy xuất tên sản phẩm (`prod_name`) và mô tả (`prod_desc`) từ bảng `Products`, chỉ trả về các sản phẩm có mô tả chứa cả `toy` và `carrots`. Có nhiều cách để thực hiện điều này, nhưng đối với thử thách này, hãy sử dụng `AND` và hai phép so sánh `LIKE`.

Đáp án:

```sql
SELECT prod_name, prod_desc
FROM Products
WHERE prod_desc LIKE '%toy%' AND prod_desc LIKE "%carrots%"
```

### Truy xuất tên và mô tả sản phẩm (IV)

Bảng `Products`:

| prod_name | prod_desc        |
| --------- | ---------------- |
| a0011     | usb              |
| a0019     | iphone13         |
| b0019     | gucci t-shirts   |
| c0019     | gucci toy        |
| d0019     | lego toy carrots |

【Câu hỏi】Viết câu lệnh SQL để truy xuất tên sản phẩm (prod_name) và mô tả (prod_desc) từ bảng Products, chỉ trả về các sản phẩm có mô tả chứa cả toy và carrots **theo thứ tự trước sau**. Gợi ý: Chỉ cần sử dụng `LIKE` với ba ký tự `%`.

Đáp án:

```sql
SELECT prod_name, prod_desc
FROM Products
WHERE prod_desc LIKE '%toy%carrots%'
```

## Tạo trường tính toán

### Bí danh (Alias)

Cách sử dụng phổ biến của bí danh là đổi tên các cột trong kết quả truy xuất (để phù hợp với yêu cầu báo cáo hoặc nhu cầu của khách hàng). Bảng `Vendors` đại diện cho thông tin nhà cung cấp, `vend_id` id nhà cung cấp, `vend_name` tên nhà cung cấp, `vend_address` địa chỉ nhà cung cấp, `vend_city` thành phố nhà cung cấp.

| vend_id | vend_name     | vend_address | vend_city |
| ------- | ------------- | ------------ | --------- |
| a001    | tencent cloud | address1     | shenzhen  |
| a002    | huawei cloud  | address2     | dongguan  |
| a003    | aliyun cloud  | address3     | hangzhou  |
| a003    | netease cloud | address4     | guangzhou |

【Câu hỏi】Viết câu lệnh SQL để truy xuất `vend_id`, `vend_name`, `vend_address` và `vend_city` từ bảng `Vendors`, đổi tên `vend_name` thành `vname`, `vend_city` thành `vcity`, `vend_address` thành `vaddress`, sắp xếp kết quả theo tên nhà cung cấp tăng dần.

Đáp án:

```sql
SELECT vend_id, vend_name AS vname, vend_address AS vaddress, vend_city AS vcity
FROM Vendors
ORDER BY vname
# as 可以省略
SELECT vend_id, vend_name vname, vend_address vaddress, vend_city vcity
FROM Vendors
ORDER BY vname
```

### Giảm giá

Cửa hàng mẫu của chúng ta đang có chương trình giảm giá, tất cả sản phẩm giảm 10%. Bảng `Products` chứa `prod_id` id sản phẩm, `prod_price` giá sản phẩm.

【Câu hỏi】Viết câu lệnh SQL để trả về `prod_id`, `prod_price` và `sale_price` từ bảng `Products`. `sale_price` là trường tính toán chứa giá khuyến mãi. Gợi ý: nhân với 0.9 để được 90% giá gốc (tức là giảm 10%).

Đáp án:

```sql
SELECT prod_id, prod_price, prod_price * 0.9 AS sale_price
FROM Products
```

Lưu ý: `sale_price` là tên đặt cho kết quả tính toán, không phải tên cột gốc.

## Sử dụng hàm xử lý dữ liệu

### Tên đăng nhập khách hàng

Cửa hàng của chúng ta đã đi vào hoạt động và đang tạo tài khoản khách hàng. Tất cả người dùng cần tên đăng nhập, tên đăng nhập mặc định là sự kết hợp giữa tên và thành phố nơi họ sống.

Bảng `Customers`:

| cust_id | cust_name | cust_contact | cust_city |
| ------- | --------- | ------------ | --------- |
| a1      | Andy Li   | Andy Li      | Oak Park  |
| a2      | Ben Liu   | Ben Liu      | Oak Park  |
| a3      | Tony Dai  | Tony Dai     | Oak Park  |
| a4      | Tom Chen  | Tom Chen     | Oak Park  |
| a5      | An Li     | An Li        | Oak Park  |
| a6      | Lee Chen  | Lee Chen     | Oak Park  |
| a7      | Hex Liu   | Hex Liu      | Oak Park  |

【Câu hỏi】Viết câu lệnh SQL để trả về ID khách hàng (`cust_id`), tên khách hàng (`cust_name`) và tên đăng nhập (`user_login`), trong đó tên đăng nhập toàn chữ hoa, được tạo từ hai ký tự đầu của thông tin liên lạc khách hàng (`cust_contact`) và ba ký tự đầu của thành phố (`cust_city`). Gợi ý: cần sử dụng hàm, nối chuỗi và bí danh.

Đáp án:

```sql
SELECT cust_id, cust_name, UPPER(CONCAT(SUBSTRING(cust_contact, 1, 2), SUBSTRING(cust_city, 1, 3))) AS user_login
FROM Customers
```

Kiến thức:

- Hàm cắt chuỗi `SUBSTRING()`: Cắt chuỗi, `substring(str ,n ,m)` (n là vị trí bắt đầu cắt, m là số ký tự cần cắt) trả về m ký tự từ vị trí n của chuỗi str;
- Hàm nối chuỗi `CONCAT()`: Nối hai hoặc nhiều chuỗi thành một chuỗi, select concat(A,B): nối chuỗi A và B.

- Hàm chữ hoa `UPPER()`: Chuyển chuỗi đã chỉ định thành chữ hoa.

### Trả về số đơn hàng và ngày đặt hàng của tất cả đơn hàng tháng 1 năm 2020

Bảng đơn hàng `Orders`:

| order_num | order_date          |
| --------- | ------------------- |
| a0001     | 2020-01-01 00:00:00 |
| a0002     | 2020-01-02 00:00:00 |
| a0003     | 2020-01-01 12:00:00 |
| a0004     | 2020-02-01 00:00:00 |
| a0005     | 2020-03-01 00:00:00 |

【Câu hỏi】Viết câu lệnh SQL để trả về số đơn hàng (`order_num`) và ngày đặt hàng (`order_date`) của tất cả đơn hàng trong tháng 1 năm 2020, sắp xếp theo ngày đặt hàng tăng dần

Đáp án:

```sql
SELECT order_num, order_date
FROM Orders
WHERE month(order_date) = '01' AND YEAR(order_date) = '2020'
ORDER BY order_date
```

Cũng có thể dùng ký tự đại diện:

```sql
SELECT order_num, order_date
FROM Orders
WHERE order_date LIKE '2020-01%'
ORDER BY order_date
```

Kiến thức:

- Định dạng ngày: `YYYY-MM-DD`
- Định dạng thời gian: `HH:MM:SS`

Các hàm thường dùng liên quan đến xử lý ngày và thời gian:

| Hàm             | Mô tả                                          |
| --------------- | ---------------------------------------------- |
| `ADDDATE()`     | Thêm một khoảng thời gian (ngày, tuần...)      |
| `ADDTIME()`     | Thêm một khoảng thời gian (giờ, phút...)       |
| `CURDATE()`     | Trả về ngày hiện tại                           |
| `CURTIME()`     | Trả về giờ hiện tại                            |
| `DATE()`        | Trả về phần ngày của giá trị ngày-giờ          |
| `DATEDIFF`      | Tính hiệu của hai ngày                         |
| `DATE_FORMAT()` | Trả về chuỗi ngày hoặc thời gian đã định dạng  |
| `DAY()`         | Trả về phần ngày của một ngày                  |
| `DAYOFWEEK()`   | Trả về thứ trong tuần của một ngày             |
| `HOUR()`        | Trả về phần giờ của một thời gian              |
| `MINUTE()`      | Trả về phần phút của một thời gian             |
| `MONTH()`       | Trả về phần tháng của một ngày                 |
| `NOW()`         | Trả về ngày và thời gian hiện tại              |
| `SECOND()`      | Trả về phần giây của một thời gian             |
| `TIME()`        | Trả về phần thời gian của một giá trị ngày-giờ |
| `YEAR()`        | Trả về phần năm của một ngày                   |

## Tổng hợp dữ liệu

Các hàm liên quan đến tổng hợp dữ liệu:

| Hàm       | Mô tả                                 |
| --------- | ------------------------------------- |
| `AVG()`   | Trả về giá trị trung bình của một cột |
| `COUNT()` | Trả về số hàng của một cột            |
| `MAX()`   | Trả về giá trị lớn nhất của một cột   |
| `MIN()`   | Trả về giá trị nhỏ nhất của một cột   |
| `SUM()`   | Trả về tổng các giá trị của một cột   |

### Xác định tổng số sản phẩm đã bán

Bảng `OrderItems` đại diện cho các sản phẩm đã bán, `quantity` đại diện cho số lượng sản phẩm đã bán.

| quantity |
| -------- |
| 10       |
| 100      |
| 1000     |
| 10001    |
| 2        |
| 15       |

【Câu hỏi】Viết câu lệnh SQL để xác định tổng số sản phẩm đã bán.

Đáp án:

```sql
SELECT Sum(quantity) AS items_ordered
FROM OrderItems
```

### Xác định tổng số sản phẩm BR01 đã bán

Bảng `OrderItems` đại diện cho các sản phẩm đã bán, `quantity` đại diện cho số lượng sản phẩm đã bán, id sản phẩm là `prod_id`.

| quantity | prod_id |
| -------- | ------- |
| 10       | AR01    |
| 100      | AR10    |
| 1000     | BR01    |
| 10001    | BR010   |

【Câu hỏi】Sửa câu lệnh đã tạo để xác định tổng số sản phẩm (`prod_id`) là "BR01" đã bán.

Đáp án:

```sql
SELECT Sum(quantity) AS items_ordered
FROM OrderItems
WHERE prod_id = 'BR01'
```

### Xác định giá sản phẩm đắt nhất không vượt quá 10 đô la trong bảng Products

Bảng `Products`, `prod_price` đại diện cho giá sản phẩm.

| prod_price |
| ---------- |
| 9.49       |
| 600        |
| 1000       |

【Câu hỏi】Viết câu lệnh SQL để xác định giá (`prod_price`) của sản phẩm đắt nhất không vượt quá 10 đô la trong bảng `Products`. Đặt tên trường tính toán là `max_price`.

Đáp án:

```sql
SELECT Max(prod_price) AS max_price
FROM Products
WHERE prod_price <= 10
```

## Nhóm dữ liệu

`GROUP BY`:

- Mệnh đề `GROUP BY` nhóm các bản ghi thành các hàng tổng hợp.
- `GROUP BY` trả về một bản ghi cho mỗi nhóm.
- `GROUP BY` thường liên quan đến các hàm tổng hợp `COUNT`, `MAX`, `SUM`, `AVG`, v.v.
- `GROUP BY` có thể nhóm theo một hoặc nhiều cột.
- Sau khi `GROUP BY` sắp xếp theo trường nhóm, `ORDER BY` có thể sắp xếp theo trường tổng hợp.

`HAVING`:

- `HAVING` dùng để lọc kết quả `GROUP BY` đã được tổng hợp.
- `HAVING` phải được dùng cùng với `GROUP BY`.
- `WHERE` và `HAVING` có thể được dùng trong cùng một truy vấn.

`HAVING` vs `WHERE`:

- `WHERE`: Lọc các hàng được chỉ định, không thể thêm hàm tổng hợp (hàm nhóm) sau.
- `HAVING`: Lọc nhóm, phải dùng cùng với `GROUP BY`, không thể dùng độc lập.

### Trả về số hàng trong mỗi số đơn hàng

Bảng `OrderItems` chứa mỗi sản phẩm của mỗi đơn hàng

| order_num |
| --------- |
| a002      |
| a002      |
| a002      |
| a004      |
| a007      |

【Câu hỏi】Viết câu lệnh SQL để trả về số hàng (`order_lines`) của mỗi số đơn hàng (`order_num`), sắp xếp kết quả theo `order_lines` tăng dần.

Đáp án:

```sql
SELECT order_num, Count(order_num) AS order_lines
FROM OrderItems
GROUP BY order_num
ORDER BY order_lines
```

Kiến thức:

1. `count(*)`, `count(tên cột)` đều được, sự khác biệt là `count(tên cột)` đếm số hàng không NULL;
2. `order by` thực thi cuối cùng, vì vậy có thể sử dụng bí danh cột;
3. Tổng hợp nhóm nhớ đừng quên thêm `group by`, nếu không sẽ chỉ có một hàng kết quả.

### Sản phẩm có giá thấp nhất của mỗi nhà cung cấp

Bảng `Products` có trường `prod_price` đại diện cho giá sản phẩm, `vend_id` đại diện cho id nhà cung cấp

| vend_id | prod_price |
| ------- | ---------- |
| a0011   | 100        |
| a0019   | 0.1        |
| b0019   | 1000       |
| b0019   | 6980       |
| b0019   | 20         |

【Câu hỏi】Viết câu lệnh SQL để trả về trường có tên `cheapest_item`, trường này chứa sản phẩm có giá thấp nhất của mỗi nhà cung cấp (sử dụng `prod_price` trong bảng `Products`), sau đó sắp xếp kết quả theo giá thấp nhất đến cao nhất.

Đáp án:

```sql
SELECT vend_id, Min(prod_price) AS cheapest_item
FROM Products
GROUP BY vend_id
ORDER BY cheapest_item
```

### Trả về tất cả số đơn hàng có tổng số lượng không nhỏ hơn 100

Bảng `OrderItems` đại diện cho bảng hàng hóa đơn hàng, bao gồm: số đơn hàng `order_num` và số lượng đơn hàng `quantity`.

| order_num | quantity |
| --------- | -------- |
| a1        | 105      |
| a2        | 1100     |
| a2        | 200      |
| a4        | 1121     |
| a5        | 10       |
| a2        | 19       |
| a7        | 5        |

【Câu hỏi】Viết câu lệnh SQL để trả về tất cả số đơn hàng có tổng số lượng không nhỏ hơn 100, kết quả cuối cùng sắp xếp theo số đơn hàng tăng dần.

Đáp án:

```sql
# 直接聚合
SELECT order_num
FROM OrderItems
GROUP BY order_num
HAVING Sum(quantity) >= 100
ORDER BY order_num

# 子查询
SELECT a.order_num
FROM (SELECT order_num, Sum(quantity) AS sum_num
    FROM OrderItems
    GROUP BY order_num
    HAVING sum_num >= 100) a
ORDER BY a.order_num
```

Kiến thức:

- `where`: Lọc các hàng được chỉ định, không thể thêm hàm tổng hợp (hàm nhóm) sau.
- `having`: Lọc nhóm, dùng cùng với `group by`, không thể dùng độc lập.

### Tính tổng

Bảng `OrderItems` đại diện cho thông tin đơn hàng, bao gồm các trường: số đơn hàng `order_num`, giá bán hàng hóa `item_price`, số lượng hàng hóa `quantity`.

| order_num | item_price | quantity |
| --------- | ---------- | -------- |
| a1        | 10         | 105      |
| a2        | 1          | 1100     |
| a2        | 1          | 200      |
| a4        | 2          | 1121     |
| a5        | 5          | 10       |
| a2        | 1          | 19       |
| a7        | 7          | 5        |

【Câu hỏi】Viết câu lệnh SQL, tổng hợp theo số đơn hàng, trả về tất cả số đơn hàng có tổng giá không nhỏ hơn 1000, kết quả cuối cùng sắp xếp theo số đơn hàng tăng dần.

Gợi ý: Tổng giá = item_price nhân với quantity

Đáp án:

```sql
SELECT order_num, Sum(item_price * quantity) AS total_price
FROM OrderItems
GROUP BY order_num
HAVING total_price >= 1000
ORDER BY order_num
```

### Kiểm tra câu lệnh SQL

Bảng `OrderItems` có `order_num` số đơn hàng

| order_num |
| --------- |
| a002      |
| a002      |
| a002      |
| a004      |
| a007      |

【Câu hỏi】Sửa đoạn code dưới đây cho đúng rồi thực thi

```sql
SELECT order_num, COUNT(*) AS items
FROM OrderItems
GROUP BY items
HAVING COUNT(*) >= 3
ORDER BY items, order_num;
```

Sau khi sửa:

```sql
SELECT order_num, COUNT(*) AS items
FROM OrderItems
GROUP BY order_num
HAVING items >= 3
ORDER BY items, order_num;
```

## Sử dụng truy vấn con

Truy vấn con là truy vấn SQL lồng trong truy vấn lớn hơn, còn được gọi là truy vấn nội hoặc lựa chọn nội, câu lệnh chứa truy vấn con cũng được gọi là truy vấn ngoại hay lựa chọn ngoại. Nói đơn giản, truy vấn con là việc sử dụng kết quả của một truy vấn `SELECT` (truy vấn con) làm nguồn dữ liệu hoặc điều kiện phán đoán cho một câu lệnh SQL khác (truy vấn chính).

Truy vấn con có thể được nhúng trong các câu lệnh `SELECT`, `INSERT`, `UPDATE` và `DELETE`, cũng có thể được dùng cùng với các toán tử `=`, `<`, `>`, `IN`, `BETWEEN`, `EXISTS`, v.v.

Truy vấn con thường được dùng trong mệnh đề `WHERE` và mệnh đề `FROM`:

- Khi dùng trong mệnh đề `WHERE`, tùy theo toán tử khác nhau, truy vấn con có thể trả về dữ liệu một hàng một cột, nhiều hàng một cột, một hàng nhiều cột. Truy vấn con cần trả về giá trị có thể dùng làm điều kiện truy vấn WHERE.
- Khi dùng trong mệnh đề `FROM`, thường trả về nhiều hàng nhiều cột, tương đương với việc trả về một bảng tạm thời, điều này phù hợp với quy tắc sau FROM phải là bảng. Cách làm này có thể thực hiện truy vấn kết hợp nhiều bảng.

> Lưu ý: MySQL hỗ trợ truy vấn con từ phiên bản 4.1, các phiên bản trước đó không hỗ trợ.

Cú pháp cơ bản của truy vấn con dùng trong mệnh đề `WHERE`:

```sql
SELECT column_name [, column_name ]
FROM table1 [, table2 ]
WHERE column_name operator
(SELECT column_name [, column_name ]
FROM table1 [, table2 ]
[WHERE])
```

- Truy vấn con cần được đặt trong dấu ngoặc `( )`.
- `operator` đại diện cho toán tử dùng trong mệnh đề `WHERE`, có thể là toán tử so sánh (như `=`, `<`, `>`, `<>`, v.v.) hoặc toán tử logic (như `IN`, `NOT IN`, `EXISTS`, `NOT EXISTS`, v.v.), cụ thể tùy theo nhu cầu.

Cú pháp cơ bản của truy vấn con dùng trong mệnh đề `FROM`:

```sql
SELECT column_name [, column_name ]
FROM (SELECT column_name [, column_name ]
      FROM table1 [, table2 ]
      [WHERE]) AS temp_table_name [, ...]
[JOIN type JOIN table_name ON condition]
WHERE condition;
```

- Truy vấn con dùng trong `FROM` trả về kết quả tương đương một bảng tạm thời, vì vậy cần dùng từ khóa AS để đặt tên cho bảng tạm thời đó.
- Truy vấn con cần được đặt trong dấu ngoặc `( )`.
- Có thể chỉ định nhiều tên bảng tạm thời và dùng câu lệnh `JOIN` để kết nối các bảng đó.

### Trả về danh sách khách hàng đã mua sản phẩm trị giá 10 đô la trở lên

Bảng `OrderItems` đại diện cho bảng hàng hóa đơn hàng, có các trường số đơn hàng `order_num`, giá đơn hàng `item_price`; bảng `Orders` đại diện cho bảng thông tin đơn hàng, có id khách hàng `cust_id` và số đơn hàng `order_num`

Bảng `OrderItems`:

| order_num | item_price |
| --------- | ---------- |
| a1        | 10         |
| a2        | 1          |
| a2        | 1          |
| a4        | 2          |
| a5        | 5          |
| a2        | 1          |
| a7        | 7          |

Bảng `Orders`:

| order_num | cust_id |
| --------- | ------- |
| a1        | cust10  |
| a2        | cust1   |
| a2        | cust1   |
| a4        | cust2   |
| a5        | cust5   |
| a2        | cust1   |
| a7        | cust7   |

【Câu hỏi】Sử dụng truy vấn con để trả về danh sách khách hàng đã mua sản phẩm trị giá 10 đô la trở lên, kết quả không cần sắp xếp.

Đáp án:

```sql
SELECT cust_id
FROM Orders
WHERE order_num IN (SELECT DISTINCT order_num
    FROM OrderItems
    where item_price >= 10)
```

### Xác định đơn hàng nào đã mua sản phẩm có prod_id là BR01 (I)

Bảng `OrderItems` đại diện cho bảng thông tin hàng hóa đơn hàng, `prod_id` là id sản phẩm; bảng `Orders` đại diện cho bảng đơn hàng có `cust_id` đại diện cho id khách hàng và ngày đặt hàng `order_date`

Bảng `OrderItems`:

| prod_id | order_num |
| ------- | --------- |
| BR01    | a0001     |
| BR01    | a0002     |
| BR02    | a0003     |
| BR02    | a0013     |

Bảng `Orders`:

| order_num | cust_id | order_date          |
| --------- | ------- | ------------------- |
| a0001     | cust10  | 2022-01-01 00:00:00 |
| a0002     | cust1   | 2022-01-01 00:01:00 |
| a0003     | cust1   | 2022-01-02 00:00:00 |
| a0013     | cust2   | 2022-01-01 00:20:00 |

【Câu hỏi】

Viết câu lệnh SQL, sử dụng truy vấn con để xác định đơn hàng nào (trong `OrderItems`) đã mua sản phẩm có `prod_id` là "BR01", sau đó trả về ID khách hàng (`cust_id`) và ngày đặt hàng (`order_date`) tương ứng với mỗi sản phẩm từ bảng `Orders`, sắp xếp kết quả theo ngày đặt hàng tăng dần.

Đáp án:

```sql
# 写法 1：子查询
SELECT cust_id,order_date
FROM Orders
WHERE order_num IN
    (SELECT order_num
     FROM OrderItems
     WHERE prod_id = 'BR01' )
ORDER BY order_date;

# 写法 2: 连接表
SELECT b.cust_id, b.order_date
FROM OrderItems a,Orders b
WHERE a.order_num = b.order_num AND a.prod_id = 'BR01'
ORDER BY order_date
```

### Trả về email của tất cả khách hàng đã mua sản phẩm có prod_id là BR01 (I)

Bạn muốn biết ngày đặt hàng sản phẩm BR01, bảng `OrderItems` đại diện cho bảng thông tin hàng hóa đơn hàng, `prod_id` là id sản phẩm; bảng `Orders` đại diện cho bảng đơn hàng có `cust_id` đại diện cho id khách hàng và ngày đặt hàng `order_date`; bảng `Customers` chứa `cust_email` email khách hàng và `cust_id` id khách hàng

Bảng `OrderItems`:

| prod_id | order_num |
| ------- | --------- |
| BR01    | a0001     |
| BR01    | a0002     |
| BR02    | a0003     |
| BR02    | a0013     |

Bảng `Orders`:

| order_num | cust_id | order_date          |
| --------- | ------- | ------------------- |
| a0001     | cust10  | 2022-01-01 00:00:00 |
| a0002     | cust1   | 2022-01-01 00:01:00 |
| a0003     | cust1   | 2022-01-02 00:00:00 |
| a0013     | cust2   | 2022-01-01 00:20:00 |

Bảng `Customers` đại diện cho thông tin khách hàng, `cust_id` là id khách hàng, `cust_email` là email khách hàng

| cust_id | cust_email        |
| ------- | ----------------- |
| cust10  | <cust10@cust.com> |
| cust1   | <cust1@cust.com>  |
| cust2   | <cust2@cust.com>  |

【Câu hỏi】Trả về email (`cust_email` trong bảng `Customers`) của tất cả khách hàng đã mua sản phẩm có `prod_id` là `BR01`, kết quả không cần sắp xếp.

Gợi ý: Liên quan đến câu lệnh `SELECT`, câu trong cùng trả về `order_num` từ bảng `OrderItems`, câu giữa trả về `cust_id` từ bảng `Customers`.

Đáp án:

```sql
# 写法 1：子查询
SELECT cust_email
FROM Customers
WHERE cust_id IN (SELECT cust_id
    FROM Orders
    WHERE order_num IN (SELECT order_num
        FROM OrderItems
        WHERE prod_id = 'BR01'))

# 写法 2: 连接表（inner join）
SELECT c.cust_email
FROM OrderItems a,Orders b,Customers c
WHERE a.order_num = b.order_num AND b.cust_id = c.cust_id AND a.prod_id = 'BR01'

# 写法 3：连接表（left join）
SELECT c.cust_email
FROM Orders a LEFT JOIN
  OrderItems b ON a.order_num = b.order_num LEFT JOIN
  Customers c ON a.cust_id = c.cust_id
WHERE b.prod_id = 'BR01'
```

### Trả về tổng số tiền trong các đơn hàng khác nhau của mỗi khách hàng

Chúng ta cần danh sách ID khách hàng cùng tổng số tiền họ đã đặt hàng.

Bảng `OrderItems` đại diện cho thông tin đơn hàng, bảng `OrderItems` có số đơn hàng `order_num`, giá bán hàng hóa `item_price`, số lượng hàng hóa `quantity`.

| order_num | item_price | quantity |
| --------- | ---------- | -------- |
| a0001     | 10         | 105      |
| a0002     | 1          | 1100     |
| a0002     | 1          | 200      |
| a0013     | 2          | 1121     |
| a0003     | 5          | 10       |
| a0003     | 1          | 19       |
| a0003     | 7          | 5        |

Bảng `Orders`: số đơn hàng `order_num`, id khách hàng `cust_id`

| order_num | cust_id |
| --------- | ------- |
| a0001     | cust10  |
| a0002     | cust1   |
| a0003     | cust1   |
| a0013     | cust2   |

【Câu hỏi】

Viết câu lệnh SQL để trả về ID khách hàng (`cust_id` trong bảng `Orders`), và sử dụng truy vấn con để trả về `total_ordered` nhằm trả về tổng số tiền đặt hàng của mỗi khách hàng, sắp xếp kết quả theo số tiền từ lớn đến nhỏ.

Đáp án:

```sql
# 写法 1：子查询
SELECT o.cust_id, SUM(tb.total_ordered) AS `total_ordered`
FROM (SELECT order_num, SUM(item_price * quantity) AS total_ordered
    FROM OrderItems
    GROUP BY order_num) AS tb,
  Orders o
WHERE tb.order_num = o.order_num
GROUP BY o.cust_id
ORDER BY total_ordered DESC;

# 写法 2：连接表
SELECT b.cust_id, Sum(a.quantity * a.item_price) AS total_ordered
FROM OrderItems a,Orders b
WHERE a.order_num = b.order_num
GROUP BY cust_id
ORDER BY total_ordered DESC
```

Để biết thêm chi tiết về cách viết 1, xem: [issue#2402: Lỗi trong cách viết 1 và cách sửa](https://github.com/Snailclimb/JavaGuide/issues/2402).

### Truy xuất tất cả tên sản phẩm và tổng số lượng bán tương ứng từ bảng Products

Truy xuất tất cả tên sản phẩm `prod_name`, id sản phẩm `prod_id` trong bảng `Products`

| prod_id | prod_name |
| ------- | --------- |
| a0001   | egg       |
| a0002   | sockets   |
| a0013   | coffee    |
| a0003   | cola      |

Bảng `OrderItems` đại diện cho bảng hàng hóa đơn hàng, sản phẩm đặt hàng `prod_id`, số lượng bán `quantity`

| prod_id | quantity |
| ------- | -------- |
| a0001   | 105      |
| a0002   | 1100     |
| a0002   | 200      |
| a0013   | 1121     |
| a0003   | 10       |
| a0003   | 19       |
| a0003   | 5        |

【Câu hỏi】

Viết câu lệnh SQL để truy xuất tất cả tên sản phẩm (`prod_name`) từ bảng `Products`, cùng với cột tính toán có tên `quant_sold`, chứa tổng số sản phẩm đã bán (sử dụng truy vấn con và `SUM(quantity)` trên bảng `OrderItems`).

Đáp án:

```sql
# 写法 1：子查询
SELECT p.prod_name, tb.quant_sold
FROM (SELECT prod_id, Sum(quantity) AS quant_sold
    FROM OrderItems
    GROUP BY prod_id) AS tb,
  Products p
WHERE tb.prod_id = p.prod_id

# 写法 2：连接表
SELECT p.prod_name, Sum(o.quantity) AS quant_sold
FROM Products p,
  OrderItems o
WHERE p.prod_id = o.prod_id
GROUP BY p.prod_name（这里不能用 p.prod_id，会报错）
```

## Kết nối bảng

JOIN có nghĩa là "kết nối", mệnh đề SQL JOIN dùng để kết nối hai hoặc nhiều bảng để truy vấn.

Khi kết nối bảng, cần chọn một trường trong mỗi bảng và so sánh các giá trị của các trường đó, hai bản ghi có cùng giá trị sẽ được hợp nhất thành một. **Bản chất của việc kết nối bảng là hợp nhất các bản ghi từ các bảng khác nhau để tạo thành một bảng mới. Tất nhiên, bảng mới này chỉ là tạm thời, nó chỉ tồn tại trong thời gian truy vấn này**.

Cú pháp cơ bản để kết nối hai bảng với `JOIN`:

```sql
SELECT table1.column1, table2.column2...
FROM table1
JOIN table2
ON table1.common_column1 = table2.common_column2;
```

`table1.common_column1 = table2.common_column2` là điều kiện kết nối, chỉ những bản ghi thỏa mãn điều kiện này mới được hợp nhất thành một hàng. Bạn có thể sử dụng nhiều toán tử để kết nối bảng, ví dụ =, >, <, <>, <=, >=, !=, `between`, `like` hoặc `not`, nhưng phổ biến nhất là sử dụng =.

Khi hai bảng có các trường cùng tên, để giúp database engine phân biệt đó là trường của bảng nào, khi viết tên trường cùng tên cần thêm tên bảng vào trước. Tất nhiên, nếu tên trường là duy nhất trong cả hai bảng, cũng có thể không cần dùng định dạng trên, chỉ cần viết tên trường.

Ngoài ra, nếu tên trường liên kết của hai bảng giống nhau, cũng có thể dùng mệnh đề `USING` thay vì `ON`, ví dụ:

```sql
# join....on
SELECT c.cust_name, o.order_num
FROM Customers c
INNER JOIN Orders o
ON c.cust_id = o.cust_id
ORDER BY c.cust_name

# 如果两张表的关联字段名相同，也可以使用USING子句：JOIN....USING()
SELECT c.cust_name, o.order_num
FROM Customers c
INNER JOIN Orders o
USING(cust_id)
ORDER BY c.cust_name
```

**Sự khác biệt giữa `ON` và `WHERE`**:

- Khi kết nối bảng, SQL sẽ tạo một bảng tạm thời mới dựa trên điều kiện kết nối. `ON` là điều kiện kết nối, nó quyết định việc tạo bảng tạm thời.
- `WHERE` là sau khi bảng tạm thời được tạo, lọc dữ liệu trong bảng tạm thời để tạo tập kết quả cuối cùng, lúc này không còn JOIN-ON nữa.

Tóm lại: **SQL trước tiên tạo một bảng tạm thời dựa trên ON, sau đó lọc bảng tạm thời dựa trên WHERE**.

SQL cho phép thêm một số từ khóa sửa đổi vào bên trái của `JOIN`, tạo thành các loại kết nối khác nhau như bảng dưới đây:

| Loại kết nối                                 | Mô tả                                                                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| INNER JOIN (kết nối trong)                   | (Cách kết nối mặc định) Chỉ trả về hàng khi cả hai bảng đều có bản ghi thỏa mãn điều kiện.                                          |
| LEFT JOIN / LEFT OUTER JOIN (kết nối trái)   | Trả về tất cả hàng trong bảng trái, ngay cả khi bảng phải không có hàng nào thỏa mãn điều kiện.                                     |
| RIGHT JOIN / RIGHT OUTER JOIN (kết nối phải) | Trả về tất cả hàng trong bảng phải, ngay cả khi bảng trái không có hàng nào thỏa mãn điều kiện.                                     |
| FULL JOIN / FULL OUTER JOIN (kết nối đầy đủ) | Chỉ cần một trong các bảng có bản ghi thỏa mãn điều kiện là trả về hàng.                                                            |
| SELF JOIN                                    | Kết nối một bảng với chính nó, như thể bảng đó là hai bảng. Để phân biệt hai bảng, cần đổi tên ít nhất một bảng trong câu lệnh SQL. |
| CROSS JOIN                                   | Kết nối chéo, trả về tích Descartes của tập bản ghi từ hai hoặc nhiều bảng kết nối.                                                 |

Hình dưới đây minh họa 7 cách sử dụng liên quan đến LEFT JOIN, RIGHT JOIN, INNER JOIN, OUTER JOIN.

![](https://oss.javaguide.cn/github/javaguide/csdn/d1794312b448516831369f869814ab39.png)

Nếu không thêm bất kỳ từ khóa sửa đổi nào, chỉ viết `JOIN`, thì mặc định là `INNER JOIN`

Đối với `INNER JOIN`, còn có một cách viết ẩn, gọi là "**kết nối trong ẩn**", tức là không có từ khóa `INNER JOIN`, sử dụng câu lệnh `WHERE` để thực hiện chức năng kết nối trong

```sql
# 隐式内连接
SELECT c.cust_name, o.order_num
FROM Customers c,Orders o
WHERE c.cust_id = o.cust_id
ORDER BY c.cust_name

# 显式内连接
SELECT c.cust_name, o.order_num
FROM Customers c
INNER JOIN Orders o
USING(cust_id)
ORDER BY c.cust_name;
```

### Trả về tên khách hàng và số đơn hàng liên quan

Bảng `Customers` có trường tên khách hàng `cust_name`, id khách hàng `cust_id`

| cust_id  | cust_name |
| -------- | --------- |
| cust10   | andy      |
| cust1    | ben       |
| cust2    | tony      |
| cust22   | tom       |
| cust221  | an        |
| cust2217 | hex       |

Bảng thông tin đơn hàng `Orders` có trường `order_num` số đơn hàng, `cust_id` id khách hàng

| order_num | cust_id  |
| --------- | -------- |
| a1        | cust10   |
| a2        | cust1    |
| a3        | cust2    |
| a4        | cust22   |
| a5        | cust221  |
| a7        | cust2217 |

【Câu hỏi】Viết câu lệnh SQL để trả về tên khách hàng (`cust_name`) trong bảng `Customers` và số đơn hàng liên quan (`order_num`) trong bảng `Orders`, sắp xếp kết quả theo tên khách hàng rồi theo số đơn hàng tăng dần. Bạn có thể thử hai cách viết khác nhau, một cách dùng cú pháp kết nối bằng đơn giản, một cách khác dùng INNER JOIN.

Đáp án:

```sql
# 隐式内连接
SELECT c.cust_name, o.order_num
FROM Customers c,Orders o
WHERE c.cust_id = o.cust_id
ORDER BY c.cust_name,o.order_num

# 显式内连接
SELECT c.cust_name, o.order_num
FROM Customers c
INNER JOIN Orders o
USING(cust_id)
ORDER BY c.cust_name,o.order_num;
```

### Trả về tên khách hàng, số đơn hàng liên quan và tổng giá của mỗi đơn hàng

Bảng `Customers` có các trường: tên khách hàng `cust_name`, id khách hàng `cust_id`

| cust_id  | cust_name |
| -------- | --------- |
| cust10   | andy      |
| cust1    | ben       |
| cust2    | tony      |
| cust22   | tom       |
| cust221  | an        |
| cust2217 | hex       |

Bảng thông tin đơn hàng `Orders` có các trường: số đơn hàng `order_num`, id khách hàng `cust_id`

| order_num | cust_id  |
| --------- | -------- |
| a1        | cust10   |
| a2        | cust1    |
| a3        | cust2    |
| a4        | cust22   |
| a5        | cust221  |
| a7        | cust2217 |

Bảng `OrderItems` có các trường: số đơn hàng `order_num`, số lượng hàng hóa `quantity`, giá hàng hóa `item_price`

| order_num | quantity | item_price |
| --------- | -------- | ---------- |
| a1        | 1000     | 10         |
| a2        | 200      | 10         |
| a3        | 10       | 15         |
| a4        | 25       | 50         |
| a5        | 15       | 25         |
| a7        | 7        | 7          |

【Câu hỏi】Ngoài việc trả về tên khách hàng và số đơn hàng, trả về tên khách hàng (`cust_name`) từ bảng `Customers` và số đơn hàng liên quan (`order_num`) từ bảng `Orders`, thêm cột thứ ba `OrderTotal` chứa tổng giá của mỗi đơn hàng, sắp xếp kết quả theo tên khách hàng rồi theo số đơn hàng tăng dần.

```sql
# 简单的等连接语法
SELECT c.cust_name, o.order_num, SUM(quantity * item_price) AS OrderTotal
FROM Customers c,Orders o,OrderItems oi
WHERE c.cust_id = o.cust_id AND o.order_num = oi.order_num
GROUP BY c.cust_name, o.order_num
ORDER BY c.cust_name, o.order_num
```

Lưu ý, có thể có bạn sẽ viết như sau:

```sql
SELECT c.cust_name, o.order_num, SUM(quantity * item_price) AS OrderTotal
FROM Customers c,Orders o,OrderItems oi
WHERE c.cust_id = o.cust_id AND o.order_num = oi.order_num
GROUP BY c.cust_name
ORDER BY c.cust_name,o.order_num
```

Điều này là sai! Chỉ phân nhóm theo `cust_name` đúng là phù hợp với yêu cầu đề bài, nhưng không đúng cú pháp `GROUP BY`.

Trong câu lệnh select, nếu không có câu lệnh `GROUP BY`, thì `cust_name`, `order_num` sẽ trả về nhiều giá trị, còn `sum(quantity * item_price)` chỉ trả về một giá trị, thông qua `group by` `cust_name` có thể làm cho `cust_name` và `sum(quantity * item_price)` tương ứng một-một, hay nói cách khác là **phân nhóm**, vì vậy tương tự, cũng phải phân nhóm `order_num`.

> **Một câu tóm gọn: các trường trong select hoặc đều phân nhóm, hoặc đều không phân nhóm**

### Xác định đơn hàng nào đã mua sản phẩm có prod_id là BR01 (II)

Bảng `OrderItems` đại diện cho bảng thông tin hàng hóa đơn hàng, `prod_id` là id sản phẩm; bảng `Orders` đại diện cho bảng đơn hàng có `cust_id` đại diện cho id khách hàng và ngày đặt hàng `order_date`

Bảng `OrderItems`:

| prod_id | order_num |
| ------- | --------- |
| BR01    | a0001     |
| BR01    | a0002     |
| BR02    | a0003     |
| BR02    | a0013     |

Bảng `Orders`:

| order_num | cust_id | order_date          |
| --------- | ------- | ------------------- |
| a0001     | cust10  | 2022-01-01 00:00:00 |
| a0002     | cust1   | 2022-01-01 00:01:00 |
| a0003     | cust1   | 2022-01-02 00:00:00 |
| a0013     | cust2   | 2022-01-01 00:20:00 |

【Câu hỏi】

Viết câu lệnh SQL, sử dụng truy vấn con để xác định đơn hàng nào (trong `OrderItems`) đã mua sản phẩm có `prod_id` là "BR01", sau đó trả về ID khách hàng (`cust_id`) và ngày đặt hàng (`order_date`) tương ứng với mỗi sản phẩm từ bảng `Orders`, sắp xếp kết quả theo ngày đặt hàng tăng dần.

Gợi ý: Lần này sử dụng kết nối và cú pháp kết nối bằng đơn giản.

```sql
# 写法 1：子查询
SELECT cust_id, order_date
FROM Orders
WHERE order_num IN (SELECT order_num
    FROM OrderItems
    WHERE prod_id = 'BR01')
ORDER BY order_date

# 写法 2：连接表 inner join
SELECT cust_id, order_date
FROM Orders o INNER JOIN
  (SELECT order_num
    FROM OrderItems
    WHERE prod_id = 'BR01') tb ON o.order_num = tb.order_num
ORDER BY order_date

# 写法 3：写法 2 的简化版
SELECT cust_id, order_date
FROM Orders
INNER JOIN OrderItems USING(order_num)
WHERE OrderItems.prod_id = 'BR01'
ORDER BY order_date
```

### Trả về email của tất cả khách hàng đã mua sản phẩm có prod_id là BR01 (II)

Bảng `OrderItems` đại diện cho bảng thông tin hàng hóa đơn hàng, `prod_id` là id sản phẩm; bảng `Orders` đại diện cho bảng đơn hàng có `cust_id` đại diện cho id khách hàng và ngày đặt hàng `order_date`; bảng `Customers` chứa `cust_email` email khách hàng và cust_id id khách hàng

Bảng `OrderItems`:

| prod_id | order_num |
| ------- | --------- |
| BR01    | a0001     |
| BR01    | a0002     |
| BR02    | a0003     |
| BR02    | a0013     |

Bảng `Orders`:

| order_num | cust_id | order_date          |
| --------- | ------- | ------------------- |
| a0001     | cust10  | 2022-01-01 00:00:00 |
| a0002     | cust1   | 2022-01-01 00:01:00 |
| a0003     | cust1   | 2022-01-02 00:00:00 |
| a0013     | cust2   | 2022-01-01 00:20:00 |

Bảng `Customers` đại diện cho thông tin khách hàng, `cust_id` là id khách hàng, `cust_email` là email khách hàng

| cust_id | cust_email        |
| ------- | ----------------- |
| cust10  | <cust10@cust.com> |
| cust1   | <cust1@cust.com>  |
| cust2   | <cust2@cust.com>  |

【Câu hỏi】Trả về email (`cust_email` trong bảng `Customers`) của tất cả khách hàng đã mua sản phẩm có `prod_id` là BR01, kết quả không cần sắp xếp.

Gợi ý: Liên quan đến câu lệnh `SELECT`, câu trong cùng trả về `order_num` từ bảng `OrderItems`, câu giữa trả về `cust_id` từ bảng `Customers`, nhưng phải sử dụng cú pháp INNER JOIN.

```sql
SELECT cust_email
FROM Customers
INNER JOIN Orders using(cust_id)
INNER JOIN OrderItems using(order_num)
WHERE OrderItems.prod_id = 'BR01'
```

### Xác định khách hàng tốt nhất theo cách khác (II)

Bảng `OrderItems` đại diện cho thông tin đơn hàng, một cách khác để xác định khách hàng tốt nhất là xem họ đã chi tiêu bao nhiêu, bảng `OrderItems` có số đơn hàng `order_num`, giá bán hàng hóa `item_price`, số lượng hàng hóa `quantity`

| order_num | item_price | quantity |
| --------- | ---------- | -------- |
| a1        | 10         | 105      |
| a2        | 1          | 1100     |
| a2        | 1          | 200      |
| a4        | 2          | 1121     |
| a5        | 5          | 10       |
| a2        | 1          | 19       |
| a7        | 7          | 5        |

Bảng `Orders` có trường `order_num` số đơn hàng, `cust_id` id khách hàng

| order_num | cust_id  |
| --------- | -------- |
| a1        | cust10   |
| a2        | cust1    |
| a3        | cust2    |
| a4        | cust22   |
| a5        | cust221  |
| a7        | cust2217 |

Bảng `Customers` có trường `cust_id` id khách hàng, `cust_name` tên khách hàng

| cust_id  | cust_name |
| -------- | --------- |
| cust10   | andy      |
| cust1    | ben       |
| cust2    | tony      |
| cust22   | tom       |
| cust221  | an        |
| cust2217 | hex       |

【Câu hỏi】Viết câu lệnh SQL để trả về tên khách hàng và tổng số tiền (`order_num` trong bảng `OrderItems`) của các đơn hàng có tổng giá không nhỏ hơn 1000.

Gợi ý: Cần tính tổng (`item_price` nhân `quantity`). Sắp xếp kết quả theo tổng số tiền, sử dụng cú pháp `INNER JOIN`.

```sql
SELECT cust_name, SUM(item_price * quantity) AS total_price
FROM Customers
INNER JOIN Orders USING(cust_id)
INNER JOIN OrderItems USING(order_num)
GROUP BY cust_name
HAVING total_price >= 1000
ORDER BY total_price
```

## Tạo kết nối nâng cao

### Truy xuất tên và tất cả số đơn hàng của mỗi khách hàng (I)

Bảng `Customers` đại diện cho thông tin khách hàng, có id khách hàng `cust_id` và tên khách hàng `cust_name`

| cust_id  | cust_name |
| -------- | --------- |
| cust10   | andy      |
| cust1    | ben       |
| cust2    | tony      |
| cust22   | tom       |
| cust221  | an        |
| cust2217 | hex       |

Bảng `Orders` đại diện cho thông tin đơn hàng, có số đơn hàng `order_num` và id khách hàng `cust_id`

| order_num | cust_id  |
| --------- | -------- |
| a1        | cust10   |
| a2        | cust1    |
| a3        | cust2    |
| a4        | cust22   |
| a5        | cust221  |
| a7        | cust2217 |

【Câu hỏi】Sử dụng INNER JOIN để viết câu lệnh SQL, truy xuất tên (`cust_name` trong bảng `Customers`) và tất cả số đơn hàng (`order_num` trong bảng `Orders`) của mỗi khách hàng, cuối cùng trả về theo thứ tự tên khách hàng `cust_name` tăng dần.

```sql
SELECT cust_name, order_num
FROM Customers
INNER JOIN Orders
USING(cust_id)
ORDER BY cust_name
```

### Truy xuất tên và tất cả số đơn hàng của mỗi khách hàng (II)

Bảng `Orders` đại diện cho thông tin đơn hàng, có số đơn hàng `order_num` và id khách hàng `cust_id`

| order_num | cust_id  |
| --------- | -------- |
| a1        | cust10   |
| a2        | cust1    |
| a3        | cust2    |
| a4        | cust22   |
| a5        | cust221  |
| a7        | cust2217 |

Bảng `Customers` đại diện cho thông tin khách hàng, có id khách hàng `cust_id` và tên khách hàng `cust_name`

| cust_id  | cust_name |
| -------- | --------- |
| cust10   | andy      |
| cust1    | ben       |
| cust2    | tony      |
| cust22   | tom       |
| cust221  | an        |
| cust2217 | hex       |
| cust40   | ace       |

【Câu hỏi】Truy xuất tên (`cust_name` trong bảng `Customers`) và tất cả số đơn hàng (trong bảng Orders `order_num`) của mỗi khách hàng, liệt kê tất cả khách hàng, kể cả những khách hàng chưa đặt hàng. Cuối cùng trả về theo thứ tự tên khách hàng `cust_name` tăng dần.

```sql
SELECT cust_name, order_num
FROM Customers
LEFT JOIN Orders
USING(cust_id)
ORDER BY cust_name
```

### Trả về tên sản phẩm và số đơn hàng liên quan

Bảng `Products` là bảng thông tin sản phẩm có trường `prod_id` id sản phẩm, `prod_name` tên sản phẩm

| prod_id | prod_name |
| ------- | --------- |
| a0001   | egg       |
| a0002   | sockets   |
| a0013   | coffee    |
| a0003   | cola      |
| a0023   | soda      |

Bảng `OrderItems` là bảng thông tin đơn hàng có trường `order_num` số đơn hàng và id sản phẩm `prod_id`

| prod_id | order_num |
| ------- | --------- |
| a0001   | a105      |
| a0002   | a1100     |
| a0002   | a200      |
| a0013   | a1121     |
| a0003   | a10       |
| a0003   | a19       |
| a0003   | a5        |

【Câu hỏi】Sử dụng kết nối ngoài (left join, right join, full join) để kết nối bảng `Products` và bảng `OrderItems`, trả về danh sách tên sản phẩm (`prod_name`) và số đơn hàng liên quan (`order_num`), sắp xếp theo tên sản phẩm tăng dần.

```sql
SELECT prod_name, order_num
FROM Products
LEFT JOIN OrderItems
USING(prod_id)
ORDER BY prod_name
```

### Trả về tên sản phẩm và tổng số đơn hàng của mỗi sản phẩm

Bảng `Products` là bảng thông tin sản phẩm có trường `prod_id` id sản phẩm, `prod_name` tên sản phẩm

| prod_id | prod_name |
| ------- | --------- |
| a0001   | egg       |
| a0002   | sockets   |
| a0013   | coffee    |
| a0003   | cola      |
| a0023   | soda      |

Bảng `OrderItems` là bảng thông tin đơn hàng có trường `order_num` số đơn hàng và id sản phẩm `prod_id`

| prod_id | order_num |
| ------- | --------- |
| a0001   | a105      |
| a0002   | a1100     |
| a0002   | a200      |
| a0013   | a1121     |
| a0003   | a10       |
| a0003   | a19       |
| a0003   | a5        |

【Câu hỏi】

Sử dụng OUTER JOIN để kết nối bảng `Products` và bảng `OrderItems`, trả về tên sản phẩm (`prod_name`) và tổng số đơn hàng của mỗi sản phẩm (không phải số đơn hàng), sắp xếp theo tên sản phẩm tăng dần.

```sql
SELECT prod_name, COUNT(order_num) AS orders
FROM Products
LEFT JOIN OrderItems
USING(prod_id)
GROUP BY prod_name
ORDER BY prod_name
```

### Liệt kê nhà cung cấp và số lượng sản phẩm có thể cung cấp

Bảng `Vendors` có `vend_id` (id nhà cung cấp)

| vend_id |
| ------- |
| a0002   |
| a0013   |
| a0003   |
| a0010   |

Bảng `Products` có `vend_id` (id nhà cung cấp) và prod_id (id sản phẩm cung cấp)

| vend_id | prod_id              |
| ------- | -------------------- |
| a0001   | egg                  |
| a0002   | prod_id_iphone       |
| a00113  | prod_id_tea          |
| a0003   | prod_id_vivo phone   |
| a0010   | prod_id_huawei phone |

【Câu hỏi】Liệt kê nhà cung cấp (`vend_id` trong bảng `Vendors`) và số lượng sản phẩm có thể cung cấp, bao gồm cả nhà cung cấp không có sản phẩm. Bạn cần sử dụng OUTER JOIN và hàm tổng hợp COUNT() để tính số lượng mỗi loại sản phẩm trong bảng `Products`, cuối cùng sắp xếp theo vend_id tăng dần.

Lưu ý: Cột `vend_id` sẽ xuất hiện trong nhiều bảng, vì vậy mỗi khi tham chiếu đến nó cần đủ điều kiện đầy đủ.

```sql
SELECT v.vend_id, COUNT(prod_id) AS prod_id
FROM Vendors v
LEFT JOIN Products p
USING(vend_id)
GROUP BY v.vend_id
ORDER BY v.vend_id
```

## Truy vấn kết hợp

Toán tử `UNION` kết hợp kết quả của hai hoặc nhiều truy vấn và tạo ra một tập kết quả chứa các hàng được trích xuất từ các truy vấn tham gia trong `UNION`.

Quy tắc cơ bản của `UNION`:

- Tất cả các truy vấn phải có cùng số cột và thứ tự cột.
- Kiểu dữ liệu của các cột trong mỗi truy vấn phải giống nhau hoặc tương thích.
- Thông thường tên cột được trả về lấy từ truy vấn đầu tiên.

Mặc định, toán tử `UNION` chọn các giá trị khác nhau. Nếu cho phép các giá trị trùng lặp, hãy sử dụng `UNION ALL`.

```sql
SELECT column_name(s) FROM table1
UNION ALL
SELECT column_name(s) FROM table2;
```

Tên cột trong tập kết quả `UNION` luôn bằng tên cột trong câu lệnh `SELECT` đầu tiên trong `UNION`.

`JOIN` vs `UNION`:

- Trong `JOIN` các cột của bảng kết nối có thể khác nhau, nhưng trong `UNION`, tất cả các truy vấn phải có cùng số cột và thứ tự cột.
- `UNION` đặt các hàng sau khi truy vấn lại với nhau (đặt dọc), nhưng `JOIN` đặt các cột sau khi truy vấn lại với nhau (đặt ngang), tức là nó tạo thành tích Descartes.

### Kết hợp hai câu lệnh SELECT (I)

Bảng `OrderItems` chứa thông tin sản phẩm đặt hàng, trường `prod_id` đại diện cho id sản phẩm, `quantity` đại diện cho số lượng sản phẩm

| prod_id | quantity |
| ------- | -------- |
| a0001   | 105      |
| a0002   | 100      |
| a0002   | 200      |
| a0013   | 1121     |
| a0003   | 10       |
| a0003   | 19       |
| a0003   | 5        |
| BNBG    | 10002    |

【Câu hỏi】Kết hợp hai câu lệnh `SELECT` để truy xuất id sản phẩm (`prod_id`) và `quantity` từ bảng `OrderItems`. Trong đó, một câu lệnh `SELECT` lọc các hàng có số lượng 100, câu lệnh `SELECT` kia lọc các sản phẩm có id bắt đầu bằng BNBG, cuối cùng sắp xếp kết quả theo id sản phẩm tăng dần.

```sql
SELECT prod_id, quantity
FROM OrderItems
WHERE quantity = 100
UNION
SELECT prod_id, quantity
FROM OrderItems
WHERE prod_id LIKE 'BNBG%'
```

### Kết hợp hai câu lệnh SELECT (II)

Bảng `OrderItems` chứa thông tin sản phẩm đặt hàng, trường `prod_id` đại diện cho id sản phẩm, `quantity` đại diện cho số lượng sản phẩm.

| prod_id | quantity |
| ------- | -------- |
| a0001   | 105      |
| a0002   | 100      |
| a0002   | 200      |
| a0013   | 1121     |
| a0003   | 10       |
| a0003   | 19       |
| a0003   | 5        |
| BNBG    | 10002    |

【Câu hỏi】Kết hợp hai câu lệnh `SELECT` để truy xuất id sản phẩm (`prod_id`) và `quantity` từ bảng `OrderItems`. Trong đó, một câu lệnh `SELECT` lọc các hàng có số lượng 100, câu lệnh `SELECT` kia lọc các sản phẩm có id bắt đầu bằng BNBG, cuối cùng sắp xếp kết quả theo id sản phẩm tăng dần. Lưu ý: **lần này chỉ sử dụng một câu lệnh SELECT.**

Đáp án:

Yêu cầu chỉ dùng một câu select, thì dùng `or` thay vì `union`.

```sql
SELECT prod_id, quantity
FROM OrderItems
WHERE quantity = 100 OR prod_id LIKE 'BNBG%'
```

### Kết hợp tên sản phẩm từ bảng Products và tên khách hàng từ bảng Customers

Bảng `Products` có trường `prod_name` đại diện cho tên sản phẩm

| prod_name |
| --------- |
| flower    |
| rice      |
| ring      |
| umbrella  |

Bảng Customers đại diện cho thông tin khách hàng, cust_name đại diện cho tên khách hàng

| cust_name |
| --------- |
| andy      |
| ben       |
| tony      |
| tom       |
| an        |
| lee       |
| hex       |

【Câu hỏi】Viết câu lệnh SQL để kết hợp tên sản phẩm (`prod_name`) từ bảng `Products` và tên khách hàng (`cust_name`) từ bảng `Customers` và trả về, sau đó sắp xếp kết quả theo tên sản phẩm tăng dần.

```sql
# UNION 结果集中的列名总是等于 UNION 中第一个 SELECT 语句中的列名。
SELECT prod_name
FROM Products
UNION
SELECT cust_name
FROM Customers
ORDER BY prod_name
```

### Kiểm tra câu lệnh SQL

Bảng `Customers` có các trường `cust_name` tên khách hàng, `cust_contact` thông tin liên lạc khách hàng, `cust_state` bang khách hàng, `cust_email` email khách hàng

| cust_name | cust_contact | cust_state | cust_email        |
| --------- | ------------ | ---------- | ----------------- |
| cust10    | 8695192      | MI         | <cust10@cust.com> |
| cust1     | 8695193      | MI         | <cust1@cust.com>  |
| cust2     | 8695194      | IL         | <cust2@cust.com>  |

【Câu hỏi】Sửa SQL lỗi dưới đây

```sql
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'MI'
ORDER BY cust_name;
UNION
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'IL'ORDER BY cust_name;
```

Sau khi sửa:

```sql
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'MI'
UNION
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'IL'
ORDER BY cust_name;
```

Khi sử dụng `union` để kết hợp truy vấn, chỉ có thể dùng một mệnh đề `order by`, nó phải nằm sau câu lệnh `select` cuối cùng

Hoặc dùng `or` trực tiếp:

```sql
SELECT cust_name, cust_contact, cust_email
FROM Customers
WHERE cust_state = 'MI' or cust_state = 'IL'
ORDER BY cust_name;
```

<!-- @include: @article-footer.snippet.md -->
