---
title: Bloom Filter (Bộ lọc Bloom)
description: Phân tích nguyên lý và đặc tính false positive của Bloom Filter, kết hợp hash và bit array để triển khai, phù hợp với dedup big data và phòng chống cache penetration.
category: Kiến thức cơ bản máy tính
tag:
  - Cấu trúc dữ liệu
head:
  - - meta
    - name: keywords
      content: Bloom filter,Bloom Filter,false positive rate,hash function,bit array,dedup,cache penetration
---

Bloom filter chắc ai cũng đã nghe tên dù chưa dùng.

Bloom filter chủ yếu để giải quyết vấn đề existence query trên big data. Rất phù hợp với tình huống cần xác định xem data nào đó có tồn tại trong big data không và có thể chấp nhận sai sót nhỏ (như cache penetration, dedup big data).

Nội dung bài:

1. Bloom filter là gì?
2. Giới thiệu nguyên lý Bloom filter.
3. Tình huống sử dụng Bloom filter.
4. Tự triển khai Bloom filter bằng Java.
5. Dùng Bloom filter tích hợp sẵn trong Guava open source của Google.
6. Bloom filter trong Redis.

## Bloom Filter là gì?

Trước tiên cần hiểu khái niệm Bloom filter.

Bloom Filter (BF) được đề xuất bởi Bloom năm 1970. Có thể coi nó là cấu trúc dữ liệu gồm hai phần: binary vector (hay nói cách khác là bit array) và một loạt các random mapping function (hash function). So với các cấu trúc dữ liệu thường dùng như List, Map, Set, v.v. — Bloom filter chiếm ít không gian hơn và hiệu quả hơn. Nhưng nhược điểm là kết quả trả về mang tính xác suất, không chính xác hoàn toàn. Về lý thuyết càng nhiều element được thêm vào collection thì xác suất false positive càng cao. Hơn nữa, data lưu trong Bloom filter khó xóa.

Bloom Filter dùng một bit array lớn để lưu tất cả data. Mỗi element trong mảng chỉ chiếm 1 bit, và mỗi element chỉ có thể là 0 hoặc 1 (biểu thị false hoặc true) — đây là cốt lõi giúp Bloom Filter tiết kiệm memory. Tính toán như sau: Tạo bit array với 1 triệu element chỉ chiếm 1000000 bit / 8 = 125000 byte = 125000/1024 KB ≈ 122KB không gian.

![Bit Array](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/bloom-filter-bit-table.png)

Tóm lại: **Một người tên Bloom đề xuất cấu trúc dữ liệu để kiểm tra xem element có trong một tập dữ liệu lớn cho trước không. Cấu trúc dữ liệu này hiệu quả và hiệu năng tốt. Nhưng nhược điểm là có một tỷ lệ lỗi nhất định và khó xóa. Hơn nữa về lý thuyết, càng thêm nhiều element vào collection thì xác suất false positive càng cao.**

## Giới thiệu nguyên lý Bloom Filter

**Khi một element được thêm vào Bloom filter, sẽ thực hiện các thao tác sau:**

1. Dùng các hash function trong Bloom filter để tính hash value của element (bao nhiêu hash function thì được bấy nhiêu hash value).
2. Dựa trên hash value nhận được, đặt giá trị tại index tương ứng trong bit array thành 1.

**Khi cần xác định một element có tồn tại trong Bloom filter không, sẽ thực hiện:**

1. Thực hiện cùng phép tính hash cho element đã cho.
2. Sau khi có giá trị, kiểm tra xem mỗi element trong bit array có đều là 1 không. Nếu đều là 1 thì element này có trong Bloom filter. Nếu có một giá trị không phải 1 thì element không có trong Bloom filter.

Sơ đồ nguyên lý đơn giản của Bloom Filter:

![Sơ đồ nguyên lý đơn giản của Bloom Filter](https://oss.javaguide.cn/github/javaguide/cs-basics/algorithms/bloom-filter-simple-schematic-diagram.png)

Như hình, khi string cần lưu được thêm vào Bloom filter, string đó trước tiên được nhiều hash function tạo ra các hash value khác nhau, sau đó đặt index tương ứng trong bit array thành 1 (khi bit array được khởi tạo, tất cả vị trí đều là 0). Khi lưu cùng string lần thứ hai, vì các vị trí tương ứng trước đó đã là 1, rất dễ biết value này đã tồn tại (dedup rất tiện lợi).

Nếu cần xác định một string có trong Bloom filter không — chỉ cần thực hiện cùng phép tính hash, sau khi có giá trị kiểm tra xem mỗi element trong bit array có đều là 1 không. Nếu đều là 1 thì value có trong Bloom filter. Nếu có một giá trị không phải 1 thì element không có trong Bloom filter.

**Các string khác nhau có thể hash ra cùng vị trí — trong trường hợp này có thể tăng kích thước bit array hoặc điều chỉnh hash function.**

Tóm lại: **Bloom filter nói element tồn tại thì có xác suất nhỏ là false positive. Bloom filter nói element không tồn tại thì element đó chắc chắn không có.**

## Tình huống sử dụng Bloom Filter

1. Xác định xem data cho trước có tồn tại không: Ví dụ xác định một số có tồn tại trong tập hợp chứa lượng lớn số (tập hợp rất lớn, hàng trăm triệu); phòng chống cache penetration (xác định xem data được request có hợp lệ để tránh trực tiếp bypass cache và request database); spam filter (xác định xem địa chỉ email có trong danh sách spam không); chức năng blacklist (xác định IP hoặc số điện thoại có trong blacklist không), v.v.
2. Dedup: Ví dụ dedup URL đã crawl khi crawl website; dedup QQ number/order number với số lượng khổng lồ.

Tình huống dedup cũng cần xác định data cho trước có tồn tại không. Do đó Bloom filter chủ yếu giải quyết vấn đề existence query trên big data.

## Thực hành Code

### Tự triển khai Bloom Filter bằng Java

Đã giải thích nguyên lý Bloom filter ở trên. Nắm được nguyên lý là có thể tự triển khai một cái.

Nếu muốn tự triển khai, cần:

1. Bit array kích thước phù hợp để lưu data.
2. Một số hash function khác nhau.
3. Triển khai method thêm element vào bit array (Bloom filter).
4. Triển khai method xác định element cho trước có tồn tại trong bit array (Bloom filter) không.

Dưới đây là code tôi cho là viết tương đối tốt (tham khảo code có sẵn trên mạng và cải tiến — áp dụng cho mọi loại object):

```java
import java.util.BitSet;

public class MyBloomFilter {

    /**
     * Kích thước bit array
     */
    private static final int DEFAULT_SIZE = 2 << 24;
    /**
     * Qua mảng này có thể tạo 6 hash function khác nhau
     */
    private static final int[] SEEDS = new int[]{3, 13, 46, 71, 91, 134};

    /**
     * Bit array. Phần tử trong mảng chỉ có thể là 0 hoặc 1
     */
    private BitSet bits = new BitSet(DEFAULT_SIZE);

    /**
     * Mảng chứa các class có hash function
     */
    private SimpleHash[] func = new SimpleHash[SEEDS.length];

    /**
     * Khởi tạo mảng nhiều class chứa hash function. Hash function trong mỗi class đều khác nhau
     */
    public MyBloomFilter() {
        // Khởi tạo nhiều hash function khác nhau
        for (int i = 0; i < SEEDS.length; i++) {
            func[i] = new SimpleHash(DEFAULT_SIZE, SEEDS[i]);
        }
    }

    /**
     * Thêm element vào bit array
     */
    public void add(Object value) {
        for (SimpleHash f : func) {
            bits.set(f.hash(value), true);
        }
    }

    /**
     * Xác định element chỉ định có tồn tại trong bit array không
     */
    public boolean contains(Object value) {
        boolean ret = true;
        for (SimpleHash f : func) {
            ret = bits.get(f.hash(value));
            if(!ret)
              return ret;
        }
        return ret;
    }

    /**
     * Static inner class. Dùng để hash!
     */
    public static class SimpleHash {

        private int cap;
        private int seed;

        public SimpleHash(int cap, int seed) {
            this.cap = cap;
            this.seed = seed;
        }

        /**
         * Tính hash value
         */
        public int hash(Object value) {
            int h;
            return (value == null) ? 0 : Math.abs((cap - 1) & seed * ((h = value.hashCode()) ^ (h >>> 16)));
        }

    }
}
```

Test:

```java
String value1 = "https://javaguide.cn/";
String value2 = "https://github.com/Snailclimb";
MyBloomFilter filter = new MyBloomFilter();
System.out.println(filter.contains(value1));
System.out.println(filter.contains(value2));
filter.add(value1);
filter.add(value2);
System.out.println(filter.contains(value1));
System.out.println(filter.contains(value2));
```

Output:

```plain
false
false
true
true
```

Test:

```java
Integer value1 = 13423;
Integer value2 = 22131;
MyBloomFilter filter = new MyBloomFilter();
System.out.println(filter.contains(value1));
System.out.println(filter.contains(value2));
filter.add(value1);
filter.add(value2);
System.out.println(filter.contains(value1));
System.out.println(filter.contains(value2));
```

Output:

```java
false
false
true
true
```

### Dùng Bloom Filter tích hợp trong Guava open source của Google

Mục đích tự triển khai chủ yếu là để hiểu nguyên lý Bloom filter. Triển khai Bloom filter trong Guava khá chính thống, nên trong project thực tế không cần tự triển khai.

Trước tiên thêm dependency Guava vào project:

```xml
<dependency>
    <groupId>com.google.guava</groupId>
    <artifactId>guava</artifactId>
    <version>28.0-jre</version>
</dependency>
```

Sử dụng thực tế như sau:

Tạo Bloom filter có thể chứa tối đa 1500 integer và có thể chấp nhận false positive rate là 1% (0.01):

```java
// Tạo Bloom filter object
BloomFilter<Integer> filter = BloomFilter.create(
    Funnels.integerFunnel(),
    1500,
    0.01);
// Xác định element chỉ định có tồn tại không
System.out.println(filter.mightContain(1));
System.out.println(filter.mightContain(2));
// Thêm element vào Bloom filter
filter.put(1);
filter.put(2);
System.out.println(filter.mightContain(1));
System.out.println(filter.mightContain(2));
```

Trong ví dụ, khi `mightContain()` trả về _true_, chúng ta có thể 99% chắc chắn element đó trong filter. Khi filter trả về _false_, có thể 100% chắc chắn element không tồn tại trong filter.

**Triển khai Bloom filter do Guava cung cấp khá tốt (muốn tìm hiểu chi tiết có thể xem source code). Nhưng nó có một nhược điểm lớn là chỉ dùng được trên single machine (ngoài ra capacity scaling cũng không dễ). Còn internet hiện nay thường là distributed scenario. Để giải quyết vấn đề này cần dùng Bloom filter trong Redis.**

## Bloom Filter trong Redis

### Giới thiệu

Redis v4.0 trở đi có chức năng Module (plugin). Redis Modules cho phép Redis mở rộng tính năng bằng external module. Bloom filter là một trong các Module đó. Chi tiết xem giới thiệu chính thức của Redis về Redis Modules: <https://redis.io/modules>

Ngoài ra, official website khuyến nghị RedisBloom làm Bloom filter Module cho Redis. Link: <https://github.com/RedisBloom/RedisBloom>

Còn có:

- redis-lua-scaling-bloom-filter (Lua script implementation): <https://github.com/erikdubbelboer/redis-lua-scaling-bloom-filter>
- pyreBloom (Fast Redis Bloom filter trong Python): <https://github.com/seomoz/pyreBloom>
- ……

RedisBloom cung cấp client support cho nhiều ngôn ngữ bao gồm: Python, Java, JavaScript và PHP.

### Cài đặt qua Docker

Để trải nghiệm Bloom filter trong Redis rất đơn giản — chỉ cần Docker! Tìm kiếm trên Google **docker redis bloomfilter** và kết quả tìm kiếm đầu tiên (loại quảng cáo) sẽ tìm được câu trả lời. Link cụ thể: <https://hub.docker.com/r/redislabs/rebloom/> (giới thiệu rất chi tiết).

**Thao tác cụ thể:**

```bash
➜  ~ docker run -p 6379:6379 --name redis-redisbloom redislabs/rebloom:latest
➜  ~ docker exec -it redis-redisbloom bash
root@21396d02c252:/data# redis-cli
127.0.0.1:6379>
```

**Lưu ý: Image rebloom hiện đã bị deprecated, official khuyến nghị dùng [redis-stack](https://hub.docker.com/r/redis/redis-stack)**

### Tổng quan các lệnh phổ biến

> Lưu ý: key là tên Bloom filter, item là element cần thêm.

1. `BF.ADD`: Thêm element vào Bloom filter. Nếu filter chưa tồn tại thì tạo mới. Format: `BF.ADD {key} {item}`.
2. `BF.MADD`: Thêm một hoặc nhiều element vào "Bloom filter" và tạo filter chưa tồn tại. Thao tác giống `BF.ADD` nhưng cho phép nhiều input và trả về nhiều value. Format: `BF.MADD {key} {item} [item ...]`.
3. `BF.EXISTS`: Xác định element có tồn tại trong Bloom filter không. Format: `BF.EXISTS {key} {item}`.
4. `BF.MEXISTS`: Xác định một hoặc nhiều element có tồn tại trong Bloom filter không. Format: `BF.MEXISTS {key} {item} [item ...]`.

Ngoài ra, lệnh `BF.RESERVE` cần giới thiệu riêng:

Format của lệnh này:

`BF.RESERVE {key} {error_rate} {capacity} [EXPANSION expansion]`.

Giải thích ngắn gọn từng tham số:

1. key: Tên Bloom filter.
2. error_rate: False positive rate mong muốn. Giá trị này phải từ 0 đến 1. Ví dụ với false positive rate 0.1% (1 trong 1000), error_rate nên đặt là 0.001. Số này càng gần 0, memory consumption mỗi item càng lớn và CPU usage mỗi thao tác càng cao.
3. capacity: Capacity của filter. Khi số element thực tế lưu vượt quá giá trị này, performance sẽ bắt đầu giảm. Mức giảm thực tế phụ thuộc vào mức độ vượt giới hạn. Khi số element tăng theo hàm mũ, performance giảm tuyến tính.

Tham số tùy chọn:

- expansion: Nếu sub-filter mới được tạo, kích thước của nó sẽ là kích thước filter hiện tại nhân với `expansion`. Giá trị expansion mặc định là 2 — tức mỗi sub-filter tiếp theo sẽ là gấp đôi sub-filter trước.

### Sử dụng thực tế

```shell
127.0.0.1:6379> BF.ADD myFilter java
(integer) 1
127.0.0.1:6379> BF.ADD myFilter javaguide
(integer) 1
127.0.0.1:6379> BF.EXISTS myFilter java
(integer) 1
127.0.0.1:6379> BF.EXISTS myFilter javaguide
(integer) 1
127.0.0.1:6379> BF.EXISTS myFilter github
(integer) 0
```
