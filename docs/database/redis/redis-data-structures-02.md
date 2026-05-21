---
title: Giải thích chi tiết 3 kiểu dữ liệu đặc biệt trong Redis
description: Giải thích chi tiết cách dùng và tình huống ứng dụng của ba kiểu dữ liệu đặc biệt trong Redis là Bitmap, HyperLogLog, GEO, bao gồm triển khai các tình huống business điển hình như check-in statistics, UV statistics, people nearby.
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis special data types,Bitmap,HyperLogLog,GEO,bit map,cardinality statistics,geographic location,check-in statistics,UV statistics
---

Ngoài 5 kiểu dữ liệu cơ bản, Redis còn hỗ trợ 3 kiểu dữ liệu đặc biệt: Bitmap, HyperLogLog, GEO.

## Bitmap (Bit Map)

### Giới thiệu

Theo giới thiệu trên official website:

> Bitmaps are not an actual data type, but a set of bit-oriented operations defined on the String type which is treated like a bit vector. Since strings are binary safe blobs and their maximum length is 512 MB, they are suitable to set up to 2^32 different bits.
>
> Bitmap không phải actual data type trong Redis mà là một bộ bit-oriented operation được định nghĩa trên kiểu String — coi String là bit vector. Vì string là binary safe blob và độ dài tối đa là 512 MB, chúng phù hợp để đặt tối đa 2^32 bit khác nhau.

Bitmap lưu continuous binary number (0 và 1). Thông qua Bitmap, chỉ cần 1 bit để biểu thị value hoặc state tương ứng của một element — key chính là element tương ứng. 8 bit có thể tạo thành 1 byte, nên Bitmap bản thân tiết kiệm đáng kể không gian lưu trữ.

Có thể coi Bitmap là mảng lưu binary number (0 và 1). Index của mỗi element trong mảng gọi là offset (độ lệch).

![](/images/github/javaguide/database/redis/image-20220720194154133.png)

### Các lệnh phổ biến

| Lệnh                                  | Giới thiệu                                                                               |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| SETBIT key offset value               | Đặt value tại vị trí offset được chỉ định                                                |
| GETBIT key offset                     | Lấy value tại vị trí offset được chỉ định                                                |
| BITCOUNT key start end                | Lấy số element có value là 1 giữa start và end                                           |
| BITOP operation destkey key1 key2 ... | Thực hiện phép toán trên một hoặc nhiều Bitmap. Toán tử có thể dùng: AND, OR, XOR và NOT |

**Demo thao tác cơ bản với Bitmap**:

```bash
# SETBIT trả về value bit trước đó (mặc định là 0). Ở đây sẽ tạo 7 bit
> SETBIT mykey 7 1
(integer) 0
> SETBIT mykey 7 0
(integer) 1
> GETBIT mykey 7
(integer) 0
> SETBIT mykey 6 1
(integer) 0
> SETBIT mykey 8 1
(integer) 0
# Dùng bitcount để đếm số bit được đặt thành 1
> BITCOUNT mykey
(integer) 2
```

### Tình huống ứng dụng

**Tình huống cần lưu state information (0/1 là đủ để biểu thị)**

- Ví dụ: Tình hình check-in của user, tình hình active user, user behavior statistics (như đã like video nào đó chưa).
- Lệnh liên quan: `SETBIT`, `GETBIT`, `BITCOUNT`, `BITOP`.

## HyperLogLog (Cardinality Statistics)

### Giới thiệu

HyperLogLog là thuật toán cardinality counting xác suất nổi tiếng, được cải tiến tối ưu từ LogLog Counting (LLC). Đây không phải đặc trưng riêng của Redis — Redis chỉ triển khai thuật toán này và cung cấp một số API out-of-the-box.

HyperLogLog của Redis chiếm không gian rất rất nhỏ — chỉ cần 12k space để lưu gần `2^64` element khác nhau. Thực sự ấn tượng — đây là sức mạnh của toán học! Ngoài ra Redis tối ưu storage structure của HyperLogLog, dùng hai cách đếm:

- **Sparse matrix (Ma trận thưa)**: Khi count ít, chiếm không gian nhỏ.
- **Dense matrix (Ma trận dày)**: Khi count đạt một ngưỡng nhất định, chiếm 12k space.

Redis official documentation có giải thích chi tiết tương ứng:

![](/images/github/javaguide/database/redis/image-20220721091424563.png)

Thuật toán cardinality counting để tiết kiệm memory không trực tiếp lưu metadata mà ước lượng cardinality value (số element trong tập hợp) thông qua phương pháp thống kê xác suất nhất định. Do đó kết quả đếm của HyperLogLog không phải giá trị chính xác, có một mức độ sai số nhất định (standard error là `0.81%`).

![](/images/github/javaguide/database/redis/image-20220720194154133.png)

HyperLogLog rất dễ dùng nhưng nguyên lý rất phức tạp. Nguyên lý của HyperLogLog và implementation trong Redis có thể xem bài: [Giải thích nguyên lý thuật toán HyperLogLog và Redis áp dụng nó như thế nào](https://juejin.cn/post/6844903785744056333).

Khuyến nghị thêm một tool giúp hiểu nguyên lý HyperLogLog: [Sketch of the Day: HyperLogLog — Cornerstone of a Big Data Infrastructure](http://content.research.neustar.biz/blog/hll.html).

Ngoài HyperLogLog, Redis còn cung cấp các probabilistic data structure khác. Link tài liệu chính thức: <https://redis.io/docs/data-types/probabilistic/>.

### Các lệnh phổ biến

Lệnh liên quan đến HyperLogLog rất ít, phổ biến nhất chỉ có 3.

| Lệnh                                      | Giới thiệu                                                                                       |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| PFADD key element1 element2 ...           | Thêm một hoặc nhiều element vào HyperLogLog                                                      |
| PFCOUNT key1 key2                         | Lấy unique count của một hoặc nhiều HyperLogLog                                                  |
| PFMERGE destkey sourcekey1 sourcekey2 ... | Merge nhiều HyperLogLog vào destkey. destkey kết hợp nhiều source để tính unique count tương ứng |

**Demo thao tác cơ bản với HyperLogLog**:

```bash
> PFADD hll foo bar zap
(integer) 1
> PFADD hll zap zap zap
(integer) 0
> PFADD hll foo bar
(integer) 0
> PFCOUNT hll
(integer) 3
> PFADD some-other-hll 1 2 3
(integer) 1
> PFCOUNT hll some-other-hll
(integer) 6
> PFMERGE desthll hll some-other-hll
"OK"
> PFCOUNT desthll
(integer) 6
```

### Tình huống ứng dụng

**Tình huống đếm với số lượng khổng lồ (hàng triệu, hàng chục triệu trở lên)**

- Ví dụ: Thống kê số IP truy cập daily/weekly/monthly của website hot, thống kê UV của bài đăng hot.
- Lệnh liên quan: `PFADD`, `PFCOUNT`.

## Geospatial (Vị trí địa lý)

### Giới thiệu

Geospatial index (Geographic spatial index, viết tắt là GEO) chủ yếu dùng để lưu thông tin địa lý, được triển khai dựa trên Sorted Set.

Thông qua GEO có thể dễ dàng triển khai tính khoảng cách giữa hai vị trí, lấy các element gần vị trí chỉ định, v.v.

![](/images/github/javaguide/database/redis/image-20220720194359494.png)

### Các lệnh phổ biến

| Lệnh                                             | Giới thiệu                                                                                                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GEOADD key longitude1 latitude1 member1 ...      | Thêm thông tin longitude/latitude tương ứng của một hoặc nhiều element vào GEO                                                                           |
| GEOPOS key member1 member2 ...                   | Trả về thông tin longitude/latitude của element được cho                                                                                                 |
| GEODIST key member1 member2 M/KM/FT/MI           | Trả về khoảng cách giữa hai element được cho                                                                                                             |
| GEORADIUS key longitude latitude radius distance | Lấy các element khác trong phạm vi distance xung quanh vị trí chỉ định. Hỗ trợ tham số ASC (từ gần đến xa), DESC (từ xa đến gần), Count (số lượng), v.v. |
| GEORADIUSBYMEMBER key member radius distance     | Tương tự lệnh GEORADIUS, chỉ khác là điểm tham chiếu trung tâm là element trong GEO                                                                      |

**Thao tác cơ bản**:

```bash
> GEOADD personLocation 116.33 39.89 user1 116.34 39.90 user2 116.35 39.88 user3
3
> GEOPOS personLocation user1
116.3299986720085144
39.89000061669732844
> GEODIST personLocation user1 user2 km
1.4018
```

Xem `personLocation` qua Redis visualization tool — đúng như dự đoán, tầng dưới là Sorted Set.

Dữ liệu longitude/latitude của geographic location info lưu trong GEO được convert thành integer thông qua GeoHash algorithm. Integer này được dùng làm score (weight parameter) của Sorted Set.

![](/images/github/javaguide/database/redis/image-20220721201545147.png)

**Lấy các element khác trong phạm vi vị trí chỉ định**:

```bash
> GEORADIUS personLocation 116.33 39.87 3 km
user3
user1
> GEORADIUS personLocation 116.33 39.87 2 km
> GEORADIUS personLocation 116.33 39.87 5 km
user3
user1
user2
> GEORADIUSBYMEMBER personLocation user1 5 km
user3
user1
user2
> GEORADIUSBYMEMBER personLocation user1 2 km
user1
user2
```

Phân tích nguyên lý tầng dưới của lệnh `GEORADIUS` có thể xem bài của Alibaba: [Redis triển khai tính năng "people nearby" như thế nào?](https://juejin.cn/post/6844903966061363207)

**Xóa element**:

GEO tầng dưới là Sorted Set, bạn có thể dùng lệnh liên quan đến Sorted Set cho GEO.

```bash
> ZREM personLocation user1
1
> ZRANGE personLocation 0 -1
user3
user2
> ZSCORE personLocation user2
4069879562983946
```

### Tình huống ứng dụng

**Tình huống cần quản lý và sử dụng geographic spatial data**

- Ví dụ: People nearby.
- Lệnh liên quan: `GEOADD`, `GEORADIUS`, `GEORADIUSBYMEMBER`.

## Tổng kết

| Kiểu dữ liệu     | Mô tả                                                                                                                                                                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bitmap           | Có thể coi Bitmap là mảng lưu binary number (0 và 1). Index của mỗi element trong mảng gọi là offset. Thông qua Bitmap chỉ cần 1 bit để biểu thị value hoặc state của element — key chính là element tương ứng. 8 bit tạo thành 1 byte nên Bitmap tiết kiệm đáng kể không gian lưu trữ. |
| HyperLogLog      | HyperLogLog của Redis chiếm rất rất ít space — chỉ cần 12k để lưu gần `2^64` element khác nhau. Nhưng kết quả đếm của HyperLogLog không phải giá trị chính xác, có mức độ sai số nhất định (standard error là `0.81%`).                                                                 |
| Geospatial index | Geospatial index (GEO) chủ yếu dùng để lưu geographic location info, được triển khai dựa trên Sorted Set.                                                                                                                                                                               |

## Tài liệu tham khảo

- Redis Data Structures: <https://redis.com/redis-enterprise/data-structures/>
- 《Redis Deep Dive: Core Principles and Application Practice》 1.6 HyperLogLog
- Bloom filter, Bitmap, HyperLogLog: <https://hogwartsrico.github.io/2020/06/08/BloomFilter-HyperLogLog-BitMap/index.html>
