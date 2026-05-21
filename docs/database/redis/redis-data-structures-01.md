---
title: Giải thích chi tiết 5 kiểu dữ liệu cơ bản của Redis
description: Giải thích chi tiết phương pháp sử dụng và các tình huống ứng dụng của 5 kiểu dữ liệu cơ bản trong Redis: String, List, Set, Hash, Zset; phân tích sâu nguyên lý cài đặt các cấu trúc dữ liệu nội tại như SDS, Skip List, Compressed List.
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis数据类型,String,List,Set,Hash,Zset,SDS,跳表,压缩列表,Redis命令
---

Redis có tổng cộng 5 kiểu dữ liệu cơ bản: String (chuỗi), List (danh sách), Set (tập hợp), Hash (băm), Zset (tập hợp có thứ tự).

5 kiểu dữ liệu này được cung cấp trực tiếp cho người dùng sử dụng, là hình thức lưu trữ dữ liệu, và phần cài đặt nội tại chủ yếu dựa trên 8 cấu trúc dữ liệu sau: Simple Dynamic String (SDS), LinkedList (danh sách liên kết đôi), Dict (bảng băm/từ điển), SkipList (danh sách nhảy), Intset (tập hợp số nguyên), ZipList (danh sách nén), QuickList (danh sách nhanh).

Bảng dưới đây thể hiện cấu trúc dữ liệu nội tại tương ứng với 5 kiểu dữ liệu cơ bản của Redis:

| String | List                         | Hash          | Set          | Zset              |
| :----- | :--------------------------- | :------------ | :----------- | :---------------- |
| SDS    | LinkedList/ZipList/QuickList | Dict、ZipList | Dict、Intset | ZipList、SkipList |

Trước Redis 3.2, cài đặt nội tại của List là LinkedList hoặc ZipList. Sau Redis 3.2, QuickList — sự kết hợp của LinkedList và ZipList — được giới thiệu, và cài đặt nội tại của List chuyển sang QuickList. Từ Redis 7.0, ZipList được thay thế bởi ListPack.

Bạn có thể tìm thấy phần giới thiệu rất chi tiết về các kiểu dữ liệu/cấu trúc của Redis trên trang web chính thức của Redis:

- [Redis Data Structures](https://redis.com/redis-enterprise/data-structures/)
- [Redis Data types tutorial](https://redis.io/docs/manual/data-types/data-types-tutorial/)

Trong tương lai khi các phiên bản mới của Redis được phát hành, có thể sẽ có các cấu trúc dữ liệu mới xuất hiện. Bằng cách tham khảo phần giới thiệu tương ứng trên trang web chính thức của Redis, bạn luôn có thể nhận được thông tin đáng tin cậy nhất.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220720181630203.png)

## String (Chuỗi)

### Giới thiệu

String là kiểu dữ liệu đơn giản nhất và cũng được sử dụng phổ biến nhất trong Redis.

String là kiểu dữ liệu an toàn nhị phân, có thể được dùng để lưu trữ bất kỳ loại dữ liệu nào như chuỗi, số nguyên, số thực, hình ảnh (mã hóa base64 hoặc giải mã, hoặc đường dẫn ảnh), đối tượng đã được serialize.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719124403897.png)

Mặc dù Redis được viết bằng C, nhưng Redis không sử dụng biểu diễn chuỗi của C mà tự xây dựng một kiểu **Simple Dynamic String (SDS)**. So với chuỗi gốc của C, SDS của Redis không chỉ có thể lưu trữ dữ liệu văn bản mà còn có thể lưu trữ dữ liệu nhị phân, và độ phức tạp để lấy độ dài chuỗi là O(1) (chuỗi C là O(N)). Ngoài ra, SDS API của Redis là an toàn và không gây ra tràn bộ đệm.

### Các lệnh thường dùng

| Lệnh                            | Giới thiệu                                          |
| ------------------------------- | --------------------------------------------------- |
| SET key value                   | Đặt giá trị cho key được chỉ định                   |
| SETNX key value                 | Chỉ đặt giá trị cho key khi key chưa tồn tại        |
| GET key                         | Lấy giá trị của key được chỉ định                   |
| MSET key1 value1 key2 value2 …… | Đặt giá trị cho một hoặc nhiều key được chỉ định    |
| MGET key1 key2 ...              | Lấy giá trị của một hoặc nhiều key được chỉ định    |
| STRLEN key                      | Trả về độ dài của giá trị chuỗi được lưu trong key  |
| INCR key                        | Tăng giá trị số được lưu trong key lên một          |
| DECR key                        | Giảm giá trị số được lưu trong key xuống một        |
| EXISTS key                      | Kiểm tra xem key được chỉ định có tồn tại hay không |
| DEL key (chung)                 | Xóa key được chỉ định                               |
| EXPIRE key seconds (chung)      | Đặt thời gian hết hạn cho key được chỉ định         |

Để biết thêm các lệnh Redis String và hướng dẫn sử dụng chi tiết, vui lòng xem phần giới thiệu tương ứng trên trang web chính thức của Redis: <https://redis.io/commands/?group=string>.

**Thao tác cơ bản**:

```bash
> SET key value
OK
> GET key
"value"
> EXISTS key
(integer) 1
> STRLEN key
(integer) 5
> DEL key
(integer) 1
> GET key
(nil)
```

**Thiết lập hàng loạt**:

```bash
> MSET key1 value1 key2 value2
OK
> MGET key1 key2 # 批量获取多个 key 对应的 value
1) "value1"
2) "value2"
```

**Bộ đếm (có thể sử dụng khi nội dung chuỗi là số nguyên):**

```bash
> SET number 1
OK
> INCR number # 将 key 中储存的数字值增一
(integer) 2
> GET number
"2"
> DECR number # 将 key 中储存的数字值减一
(integer) 1
> GET number
"1"
```

**Đặt thời gian hết hạn (mặc định là không bao giờ hết hạn)**:

```bash
> EXPIRE key 60
(integer) 1
> SETEX key 60 value # 设置值并设置过期时间
OK
> TTL key
(integer) 56
```

### Tình huống ứng dụng

**Tình huống cần lưu trữ dữ liệu thông thường**

- Ví dụ: Cache Session, Token, địa chỉ hình ảnh, đối tượng đã serialize (tiết kiệm bộ nhớ hơn so với Hash).
- Các lệnh liên quan: `SET`, `GET`.

**Tình huống cần đếm**

- Ví dụ: Số lượng yêu cầu của người dùng trong một đơn vị thời gian (có thể dùng cho giới hạn lưu lượng đơn giản), số lượt truy cập trang trong một đơn vị thời gian.
- Các lệnh liên quan: `SET`, `GET`, `INCR`, `DECR`.

**Khóa phân tán**

Sử dụng lệnh `SETNX key value` có thể thực hiện một khóa phân tán đơn giản nhất (có một số hạn chế, thường không khuyến khích thực hiện khóa phân tán theo cách này).

## List (Danh sách)

### Giới thiệu

List trong Redis thực chất là cài đặt của cấu trúc dữ liệu danh sách liên kết. Tôi đã giới thiệu chi tiết về cấu trúc dữ liệu danh sách liên kết trong bài viết [Cấu trúc dữ liệu tuyến tính: Mảng, Danh sách liên kết, Ngăn xếp, Hàng đợi](https://javaguide.cn/cs-basics/data-structure/linear-data-structure.html), vì vậy tôi sẽ không giới thiệu thêm ở đây.

Nhiều ngôn ngữ lập trình bậc cao đã tích hợp sẵn cài đặt danh sách liên kết, chẳng hạn như `LinkedList` trong Java, nhưng C không cài đặt danh sách liên kết, vì vậy Redis đã tự cài đặt cấu trúc dữ liệu danh sách liên kết riêng. Cài đặt List của Redis là một **danh sách liên kết đôi**, tức là có thể hỗ trợ tìm kiếm và duyệt ngược, tiện lợi hơn cho thao tác, nhưng tốn thêm một chút bộ nhớ.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719124413287.png)

### Các lệnh thường dùng

| Lệnh                        | Giới thiệu                                                       |
| --------------------------- | ---------------------------------------------------------------- |
| RPUSH key value1 value2 ... | Thêm một hoặc nhiều phần tử vào cuối (bên phải) danh sách        |
| LPUSH key value1 value2 ... | Thêm một hoặc nhiều phần tử vào đầu (bên trái) danh sách         |
| LSET key index value        | Đặt giá trị tại vị trí index của danh sách thành value           |
| LPOP key                    | Xóa và lấy phần tử đầu tiên (ngoài cùng bên trái) của danh sách  |
| RPOP key                    | Xóa và lấy phần tử cuối cùng (ngoài cùng bên phải) của danh sách |
| LLEN key                    | Lấy số lượng phần tử trong danh sách                             |
| LRANGE key start end        | Lấy các phần tử từ vị trí start đến end trong danh sách          |

Để biết thêm các lệnh Redis List và hướng dẫn sử dụng chi tiết, vui lòng xem phần giới thiệu tương ứng trên trang web chính thức của Redis: <https://redis.io/commands/?group=list>.

**Thực hiện hàng đợi thông qua `RPUSH/LPOP` hoặc `LPUSH/RPOP`**:

```bash
> RPUSH myList value1
(integer) 1
> RPUSH myList value2 value3
(integer) 3
> LPOP myList
"value1"
> LRANGE myList 0 1
1) "value2"
2) "value3"
> LRANGE myList 0 -1
1) "value2"
2) "value3"
```

**Thực hiện ngăn xếp thông qua `RPUSH/RPOP` hoặc `LPUSH/LPOP`**:

```bash
> RPUSH myList2 value1 value2 value3
(integer) 3
> RPOP myList2 # 将 list的最右边的元素取出
"value3"
```

Tôi đã vẽ một hình để giúp mọi người hiểu các lệnh `RPUSH`, `LPOP`, `LPUSH`, `RPOP`:

![](https://oss.javaguide.cn/github/javaguide/database/redis/redis-list.png)

**Xem các phần tử danh sách trong phạm vi chỉ số tương ứng thông qua `LRANGE`**:

```bash
> RPUSH myList value1 value2 value3
(integer) 3
> LRANGE myList 0 1
1) "value1"
2) "value2"
> LRANGE myList 0 -1
1) "value1"
2) "value2"
3) "value3"
```

Thông qua lệnh `LRANGE`, bạn có thể thực hiện phân trang dựa trên List với hiệu suất rất cao!

**Xem độ dài danh sách liên kết thông qua `LLEN`**:

```bash
> LLEN myList
(integer) 3
```

### Tình huống ứng dụng

**Hiển thị luồng thông tin**

- Ví dụ: Bài viết mới nhất, hoạt động mới nhất.
- Các lệnh liên quan: `LPUSH`, `LRANGE`.

**Hàng đợi tin nhắn**

`List` có thể được dùng làm hàng đợi tin nhắn, nhưng chức năng quá đơn giản và có nhiều hạn chế, không khuyến khích làm vậy.

Tương đối mà nói, cấu trúc dữ liệu `Stream` được thêm vào Redis 5.0 phù hợp hơn để làm hàng đợi tin nhắn, nhưng chức năng vẫn còn khá sơ sài. So với các hàng đợi tin nhắn chuyên nghiệp, vẫn còn nhiều điểm còn thiếu như vấn đề mất tin nhắn và tích tụ tin nhắn chưa được giải quyết tốt.

## Hash (Băm)

### Giới thiệu

Hash trong Redis là bảng ánh xạ field-value (cặp khóa-giá trị) kiểu String, đặc biệt phù hợp để lưu trữ đối tượng. Trong các thao tác tiếp theo, bạn có thể trực tiếp sửa đổi giá trị của một số trường trong đối tượng đó.

Hash tương tự như `HashMap` trước JDK1.8, cài đặt nội tại cũng tương tự (mảng + danh sách liên kết). Tuy nhiên, Hash của Redis có nhiều tối ưu hóa hơn.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719124421703.png)

### Các lệnh thường dùng

| Lệnh                                      | Giới thiệu                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| HSET key field value                      | Đặt giá trị của trường được chỉ định trong bảng băm được chỉ định                       |
| HSETNX key field value                    | Chỉ đặt giá trị của trường khi trường đó chưa tồn tại                                   |
| HMSET key field1 value1 field2 value2 ... | Đồng thời đặt một hoặc nhiều cặp field-value vào bảng băm được chỉ định                 |
| HGET key field                            | Lấy giá trị của trường được chỉ định trong bảng băm                                     |
| HMGET key field1 field2 ...               | Lấy giá trị của một hoặc nhiều trường được chỉ định trong bảng băm                      |
| HGETALL key                               | Lấy tất cả các cặp khóa-giá trị trong bảng băm được chỉ định                            |
| HEXISTS key field                         | Kiểm tra xem trường được chỉ định có tồn tại trong bảng băm hay không                   |
| HDEL key field1 field2 ...                | Xóa một hoặc nhiều trường trong bảng băm                                                |
| HLEN key                                  | Lấy số lượng trường trong bảng băm được chỉ định                                        |
| HINCRBY key field increment               | Thực hiện phép tính trên trường được chỉ định trong bảng băm (dương là cộng, âm là trừ) |

Để biết thêm các lệnh Redis Hash và hướng dẫn sử dụng chi tiết, vui lòng xem phần giới thiệu tương ứng trên trang web chính thức của Redis: <https://redis.io/commands/?group=hash>.

**Mô phỏng lưu trữ dữ liệu đối tượng**:

```bash
> HMSET userInfoKey name "guide" description "dev" age 24
OK
> HEXISTS userInfoKey name # 查看 key 对应的 value中指定的字段是否存在。
(integer) 1
> HGET userInfoKey name # 获取存储在哈希表中指定字段的值。
"guide"
> HGET userInfoKey age
"24"
> HGETALL userInfoKey # 获取在哈希表中指定 key 的所有字段和值
1) "name"
2) "guide"
3) "description"
4) "dev"
5) "age"
6) "24"
> HSET userInfoKey name "GuideGeGe"
> HGET userInfoKey name
"GuideGeGe"
> HINCRBY userInfoKey age 2
(integer) 26
```

### Tình huống ứng dụng

**Tình huống lưu trữ dữ liệu đối tượng**

- Ví dụ: Thông tin người dùng, thông tin sản phẩm, thông tin bài viết, thông tin giỏ hàng.
- Các lệnh liên quan: `HSET` (đặt giá trị của một trường), `HMSET` (đặt giá trị của nhiều trường), `HGET` (lấy giá trị của một trường), `HMGET` (lấy giá trị của nhiều trường).

## Set (Tập hợp)

### Giới thiệu

Kiểu Set trong Redis là một tập hợp không có thứ tự, các phần tử trong tập hợp không có thứ tự trước sau nhưng đều là duy nhất, hơi giống `HashSet` trong Java. Khi bạn cần lưu trữ danh sách dữ liệu mà không muốn có dữ liệu trùng lặp, Set là một lựa chọn tốt. Ngoài ra, Set cung cấp giao diện quan trọng để kiểm tra xem một phần tử có nằm trong tập hợp Set hay không, đây là điều mà List không thể cung cấp.

Bạn có thể dễ dàng thực hiện các thao tác giao, hợp, hiệu trên Set. Ví dụ, bạn có thể lưu tất cả những người một người dùng đang theo dõi vào một tập hợp, và tất cả những người theo dõi họ vào một tập hợp khác. Như vậy, Set có thể rất thuận tiện để thực hiện các chức năng như theo dõi chung, người hâm mộ chung, sở thích chung, v.v. Quá trình này chính là tính giao của tập hợp.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719124430264.png)

### Các lệnh thường dùng

| Lệnh                                  | Giới thiệu                                                    |
| ------------------------------------- | ------------------------------------------------------------- |
| SADD key member1 member2 ...          | Thêm một hoặc nhiều phần tử vào tập hợp được chỉ định         |
| SMEMBERS key                          | Lấy tất cả các phần tử trong tập hợp được chỉ định            |
| SCARD key                             | Lấy số lượng phần tử trong tập hợp được chỉ định              |
| SISMEMBER key member                  | Kiểm tra xem phần tử được chỉ định có trong tập hợp hay không |
| SINTER key1 key2 ...                  | Lấy giao của tất cả các tập hợp được cho                      |
| SINTERSTORE destination key1 key2 ... | Lưu giao của tất cả các tập hợp được cho vào destination      |
| SUNION key1 key2 ...                  | Lấy hợp của tất cả các tập hợp được cho                       |
| SUNIONSTORE destination key1 key2 ... | Lưu hợp của tất cả các tập hợp được cho vào destination       |
| SDIFF key1 key2 ...                   | Lấy hiệu của tất cả các tập hợp được cho                      |
| SDIFFSTORE destination key1 key2 ...  | Lưu hiệu của tất cả các tập hợp được cho vào destination      |
| SPOP key count                        | Xóa ngẫu nhiên và lấy một hoặc nhiều phần tử từ tập hợp       |
| SRANDMEMBER key count                 | Lấy ngẫu nhiên số lượng phần tử được chỉ định từ tập hợp      |

Để biết thêm các lệnh Redis Set và hướng dẫn sử dụng chi tiết, vui lòng xem phần giới thiệu tương ứng trên trang web chính thức của Redis: <https://redis.io/commands/?group=set>.

**Thao tác cơ bản**:

```bash
> SADD mySet value1 value2
(integer) 2
> SADD mySet value1 # 不允许有重复元素，因此添加失败
(integer) 0
> SMEMBERS mySet
1) "value1"
2) "value2"
> SCARD mySet
(integer) 2
> SISMEMBER mySet value1
(integer) 1
> SADD mySet2 value2 value3
(integer) 2
```

- `mySet` : `value1`、`value2` 。
- `mySet2`：`value2`、`value3` 。

**Tính giao**:

```bash
> SINTERSTORE mySet3 mySet mySet2
(integer) 1
> SMEMBERS mySet3
1) "value2"
```

**Tính hợp**:

```bash
> SUNION mySet mySet2
1) "value3"
2) "value2"
3) "value1"
```

**Tính hiệu**:

```bash
> SDIFF mySet mySet2 # 差集是由所有属于 mySet 但不属于 A 的元素组成的集合
1) "value1"
```

### Tình huống ứng dụng

**Tình huống dữ liệu cần lưu trữ không được phép trùng lặp**

- Ví dụ: Thống kê UV trang web (với lượng dữ liệu khổng lồ thì `HyperLogLog` phù hợp hơn), lượt thích bài viết, lượt thích hoạt động, v.v.
- Các lệnh liên quan: `SCARD` (lấy số lượng phần tử trong tập hợp).

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719073733851.png)

**Tình huống cần lấy giao, hợp, hiệu từ nhiều nguồn dữ liệu**

- Ví dụ: Bạn bè chung (giao), người hâm mộ chung (giao), theo dõi chung (giao), gợi ý bạn bè (hiệu), gợi ý âm nhạc (hiệu), gợi ý đăng ký (hiệu + giao), v.v.
- Các lệnh liên quan: `SINTER` (giao), `SINTERSTORE` (giao), `SUNION` (hợp), `SUNIONSTORE` (hợp), `SDIFF` (hiệu), `SDIFFSTORE` (hiệu).

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719074543513.png)

**Tình huống cần lấy ngẫu nhiên các phần tử từ nguồn dữ liệu**

- Ví dụ: Hệ thống bốc thăm, điểm danh ngẫu nhiên, v.v.
- Các lệnh liên quan: `SPOP` (lấy ngẫu nhiên và xóa phần tử khỏi tập hợp, phù hợp với tình huống không cho phép trúng thưởng nhiều lần), `SRANDMEMBER` (lấy ngẫu nhiên phần tử từ tập hợp, phù hợp với tình huống cho phép trúng thưởng nhiều lần).

## Sorted Set (Tập hợp có thứ tự)

### Giới thiệu

Sorted Set tương tự như Set, nhưng so với Set, Sorted Set bổ sung thêm một tham số trọng số `score`, cho phép các phần tử trong tập hợp được sắp xếp có thứ tự theo `score`, và cũng có thể lấy danh sách phần tử theo phạm vi `score`. Nó hơi giống sự kết hợp của `HashMap` và `TreeSet` trong Java.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719124437791.png)

### Các lệnh thường dùng

| Lệnh                                          | Giới thiệu                                                                                                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ZADD key score1 member1 score2 member2 ...    | Thêm một hoặc nhiều phần tử vào tập hợp có thứ tự được chỉ định                                                                                                                      |
| ZCARD KEY                                     | Lấy số lượng phần tử trong tập hợp có thứ tự được chỉ định                                                                                                                           |
| ZSCORE key member                             | Lấy giá trị score của phần tử được chỉ định trong tập hợp có thứ tự                                                                                                                  |
| ZINTERSTORE destination numkeys key1 key2 ... | Lưu giao của tất cả các tập hợp có thứ tự được cho vào destination, thực hiện phép tính SUM trên các giá trị score tương ứng của các phần tử giống nhau, numkeys là số lượng tập hợp |
| ZUNIONSTORE destination numkeys key1 key2 ... | Tính hợp, các mục khác tương tự ZINTERSTORE                                                                                                                                          |
| ZDIFFSTORE destination numkeys key1 key2 ...  | Tính hiệu, các mục khác tương tự ZINTERSTORE                                                                                                                                         |
| ZRANGE key start end                          | Lấy các phần tử từ vị trí start đến end trong tập hợp có thứ tự (score từ thấp đến cao)                                                                                              |
| ZREVRANGE key start end                       | Lấy các phần tử từ vị trí start đến end trong tập hợp có thứ tự (score từ cao đến thấp)                                                                                              |
| ZREVRANK key member                           | Lấy thứ hạng của phần tử được chỉ định trong tập hợp có thứ tự (sắp xếp từ lớn đến nhỏ theo score)                                                                                   |

Để biết thêm các lệnh Redis Sorted Set và hướng dẫn sử dụng chi tiết, vui lòng xem phần giới thiệu tương ứng trên trang web chính thức của Redis: <https://redis.io/commands/?group=sorted-set>.

**Thao tác cơ bản**:

```bash
> ZADD myZset 2.0 value1 1.0 value2
(integer) 2
> ZCARD myZset
2
> ZSCORE myZset value1
2.0
> ZRANGE myZset 0 1
1) "value2"
2) "value1"
> ZREVRANGE myZset 0 1
1) "value1"
2) "value2"
> ZADD myZset2 4.0 value2 3.0 value3
(integer) 2

```

- `myZset` : `value1`(2.0)、`value2`(1.0) 。
- `myZset2`：`value2` （4.0）、`value3`(3.0) 。

**Lấy thứ hạng của phần tử được chỉ định**:

```bash
> ZREVRANK myZset value1
0
> ZREVRANK myZset value2
1
```

**Tính giao**:

```bash
> ZINTERSTORE myZset3 2 myZset myZset2
1
> ZRANGE myZset3 0 1 WITHSCORES
value2
5
```

**Tính hợp**:

```bash
> ZUNIONSTORE myZset4 2 myZset myZset2
3
> ZRANGE myZset4 0 2 WITHSCORES
value1
2
value3
3
value2
5
```

**Tính hiệu**:

```bash
> ZDIFF 2 myZset myZset2 WITHSCORES
value1
2
```

### Tình huống ứng dụng

**Tình huống cần lấy ngẫu nhiên các phần tử từ nguồn dữ liệu và sắp xếp theo một trọng số nào đó**

- Ví dụ: Các bảng xếp hạng khác nhau như bảng xếp hạng tặng quà phòng livestream, bảng xếp hạng số bước chân trên WeChat, bảng xếp hạng hạng đấu trong game, bảng xếp hạng độ nóng chủ đề, v.v.
- Các lệnh liên quan: `ZRANGE` (sắp xếp từ nhỏ đến lớn), `ZREVRANGE` (sắp xếp từ lớn đến nhỏ), `ZREVRANK` (thứ hạng của phần tử được chỉ định).

![](https://oss.javaguide.cn/github/javaguide/database/redis/2021060714195385.png)

[《Java 面试指北》](https://javaguide.cn/zhuanlan/java-mian-shi-zhi-bei.html) có một bài viết chi tiết trong phần "Câu hỏi phỏng vấn kỹ thuật" giới thiệu cách sử dụng Sorted Set để thiết kế và tạo bảng xếp hạng.

![](https://oss.javaguide.cn/github/javaguide/database/redis/image-20220719071115140.png)

**Tình huống dữ liệu cần lưu trữ có mức độ ưu tiên hoặc tầm quan trọng** chẳng hạn như hàng đợi tác vụ theo mức độ ưu tiên.

- Ví dụ: Hàng đợi tác vụ theo mức độ ưu tiên.
- Các lệnh liên quan: `ZRANGE` (sắp xếp từ nhỏ đến lớn), `ZREVRANGE` (sắp xếp từ lớn đến nhỏ), `ZREVRANK` (thứ hạng của phần tử được chỉ định).

## Tổng kết

| Kiểu dữ liệu | Mô tả                                                                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| String       | Kiểu dữ liệu an toàn nhị phân, có thể được dùng để lưu trữ bất kỳ loại dữ liệu nào như chuỗi, số nguyên, số thực, hình ảnh (mã hóa base64 hoặc giải mã, hoặc đường dẫn ảnh), đối tượng đã serialize.                                                                |
| List         | Cài đặt của List trong Redis là danh sách liên kết đôi, tức là có thể hỗ trợ tìm kiếm và duyệt ngược, tiện lợi hơn cho thao tác, nhưng tốn thêm một chút bộ nhớ.                                                                                                    |
| Hash         | Bảng ánh xạ field-value (cặp khóa-giá trị) kiểu String, đặc biệt phù hợp để lưu trữ đối tượng. Trong các thao tác tiếp theo, bạn có thể trực tiếp sửa đổi giá trị của một số trường trong đối tượng đó.                                                             |
| Set          | Tập hợp không có thứ tự, các phần tử trong tập hợp không có thứ tự trước sau nhưng đều là duy nhất, hơi giống `HashSet` trong Java.                                                                                                                                 |
| Zset         | So với Set, Sorted Set bổ sung thêm một tham số trọng số `score`, cho phép các phần tử trong tập hợp được sắp xếp có thứ tự theo `score`, và cũng có thể lấy danh sách phần tử theo phạm vi `score`. Nó hơi giống sự kết hợp của `HashMap` và `TreeSet` trong Java. |

## Tham khảo

- Redis Data Structures：<https://redis.com/redis-enterprise/data-structures/> 。
- Redis Commands：<https://redis.io/commands/> 。
- Redis Data types tutorial：<https://redis.io/docs/manual/data-types/data-types-tutorial/> 。
- Redis 存储对象信息是用 Hash 还是 String : <https://segmentfault.com/a/1190000040032006>

<!-- @include: @article-footer.snippet.md -->
