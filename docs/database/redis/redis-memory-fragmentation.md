---
title: Giải thích chi tiết Memory Fragmentation trong Redis
description: Phân tích sâu nguyên nhân phát sinh memory fragmentation trong Redis, cách kiểm tra và phương án tối ưu, bao gồm cách tính memory fragmentation rate, nguyên lý jemalloc allocator, cấu hình tự động dọn dẹp memory fragmentation, v.v.
category: Cơ sở dữ liệu
tag:
  - Redis
head:
  - - meta
    - name: keywords
      content: Redis memory fragmentation,memory fragmentation rate,jemalloc,memory allocation,activedefrag,memory optimization,Redis memory management
---

## Memory Fragmentation là gì?

Bạn có thể hiểu đơn giản memory fragmentation là các vùng bộ nhớ trống không thể sử dụng.

Ví dụ: Hệ điều hành cấp phát cho bạn 32 byte bộ nhớ liên tiếp, nhưng dữ liệu thực tế bạn lưu chỉ cần dùng 24 byte, thì 8 byte thừa ra nếu sau đó không thể cấp phát để lưu dữ liệu khác sẽ được gọi là memory fragmentation.

![Memory fragmentation](https://oss.javaguide.cn/github/javaguide/memory-fragmentation.png)

Memory fragmentation trong Redis tuy không ảnh hưởng đến hiệu năng Redis, nhưng sẽ tăng mức tiêu thụ bộ nhớ.

## Tại sao có Memory Fragmentation trong Redis?

Có 2 nguyên nhân phổ biến sinh ra memory fragmentation trong Redis:

**1. Khi Redis lưu dữ liệu, không gian bộ nhớ xin từ hệ điều hành có thể lớn hơn không gian thực tế cần lưu dữ liệu.**

Đây là lời của Redis chính thức:

> To store user keys, Redis allocates at most as much memory as the `maxmemory` setting enables (however there are small extra allocations possible).

Khi Redis dùng phương thức `zmalloc` (phương thức cấp phát bộ nhớ tự triển khai của Redis) để cấp phát bộ nhớ, ngoài việc cấp phát `size` byte bộ nhớ, còn cấp phát thêm `PREFIX_SIZE` byte bộ nhớ.

Source code của phương thức `zmalloc` (địa chỉ source: <https://github.com/antirez/redis-tools/blob/master/zmalloc.c>):

```java
void *zmalloc(size_t size) {
   // Cấp phát bộ nhớ theo kích thước chỉ định
   void *ptr = malloc(size+PREFIX_SIZE);
   if (!ptr) zmalloc_oom_handler(size);
#ifdef HAVE_MALLOC_SIZE
   update_zmalloc_stat_alloc(zmalloc_size(ptr));
   return ptr;
#else
   *((size_t*)ptr) = size;
   update_zmalloc_stat_alloc(size+PREFIX_SIZE);
   return (char*)ptr+PREFIX_SIZE;
#endif
}
```

Ngoài ra, Redis có thể dùng nhiều memory allocator để cấp phát bộ nhớ (libc, jemalloc, tcmalloc), mặc định dùng [jemalloc](https://github.com/jemalloc/jemalloc). jemalloc cấp phát bộ nhớ theo một loạt kích thước cố định (8 byte, 16 byte, 32 byte...). Các đơn vị bộ nhớ jemalloc chia như hình dưới:

![Sơ đồ đơn vị bộ nhớ jemalloc](https://oss.javaguide.cn/github/javaguide/database/redis/6803d3929e3e46c1b1c9d0bb9ee8e717.png)

Khi chương trình xin bộ nhớ gần với một giá trị cố định nào đó, jemalloc sẽ cấp phát không gian tương ứng. Ví dụ chương trình cần xin 17 byte, jemalloc sẽ cấp phát thẳng 32 byte, dẫn đến lãng phí 15 byte bộ nhớ. Tuy nhiên, jemalloc đã đặc biệt tối ưu cho vấn đề memory fragmentation nên thường không có vấn đề phân mảnh quá mức.

**2. Thường xuyên sửa đổi dữ liệu trong Redis cũng sinh ra memory fragmentation.**

Khi một dữ liệu trong Redis bị xóa, Redis thường không vội giải phóng bộ nhớ cho hệ điều hành.

Tài liệu chính thức của Redis cũng có mô tả tương ứng:

![](https://oss.javaguide.cn/github/javaguide/redis-docs-memory-optimization.png)

Địa chỉ tài liệu: <https://redis.io/topics/memory-optimization>.

## Cách xem thông tin Memory Fragmentation trong Redis?

Dùng lệnh `info memory` để xem thông tin liên quan đến bộ nhớ Redis. Ý nghĩa cụ thể của từng tham số trong hình dưới, tài liệu chính thức Redis có giới thiệu chi tiết tại: <https://redis.io/commands/INFO>.

![](https://oss.javaguide.cn/github/javaguide/redis-info-memory.png)

Công thức tính memory fragmentation rate của Redis: `mem_fragmentation_ratio` (memory fragmentation rate) = `used_memory_rss` (kích thước không gian bộ nhớ vật lý mà hệ điều hành thực tế cấp phát cho Redis) / `used_memory` (kích thước không gian bộ nhớ mà memory allocator của Redis thực tế xin dùng để lưu dữ liệu)

Tức là, giá trị `mem_fragmentation_ratio` càng lớn thì memory fragmentation rate càng nghiêm trọng.

Tuyệt đối đừng nhầm tưởng rằng `used_memory_rss` trừ `used_memory` là kích thước memory fragmentation! Điều này không chỉ bao gồm memory fragmentation mà còn bao gồm overhead của các process khác, cũng như overhead của shared library, stack, v.v.

Nhiều bạn có thể thắc mắc: "Memory fragmentation rate bao nhiêu thì cần dọn dẹp?"

Thông thường, chúng ta cho rằng `mem_fragmentation_ratio > 1.5` thì mới cần dọn dẹp memory fragmentation. `mem_fragmentation_ratio > 1.5` có nghĩa là để lưu dữ liệu thực tế 2GB trong Redis bạn cần dùng hơn 3GB bộ nhớ.

Nếu muốn xem nhanh memory fragmentation rate, bạn cũng có thể dùng lệnh sau:

```bash
> redis-cli -p 6379 info | grep mem_fragmentation_ratio
```

Ngoài ra, memory fragmentation rate có thể có giá trị nhỏ hơn 1. Tình huống này tôi chưa gặp trong sử dụng hàng ngày, bạn nào quan tâm có thể xem bài [Fault Analysis | Redis Memory Fragmentation Rate Too Low — What to Do? - iCanOSS Community](https://mp.weixin.qq.com/s/drlDvp7bfq5jt2M5pTqJCw).

## Cách dọn dẹp Memory Fragmentation trong Redis?

Từ Redis 4.0-RC3 trở đi đã tích hợp sẵn tính năng memory defragmentation, có thể tránh vấn đề memory fragmentation rate quá cao.

Chỉ cần dùng lệnh `config set` để đặt cấu hình `activedefrag` thành `yes`:

```bash
config set activedefrag yes
```

Khi nào cụ thể để dọn dẹp được kiểm soát bởi hai tham số sau:

```bash
# Bắt đầu dọn dẹp khi memory fragmentation chiếm 500mb
config set active-defrag-ignore-bytes 500mb
# Bắt đầu dọn dẹp khi memory fragmentation rate > 1.5
config set active-defrag-threshold-lower 50
```

Cơ chế tự động dọn dẹp memory fragmentation của Redis có thể ảnh hưởng đến hiệu năng. Có thể dùng hai tham số sau để giảm ảnh hưởng đến hiệu năng Redis:

```bash
# Tỷ lệ CPU time dành cho dọn dẹp memory fragmentation không thấp hơn 20%
config set active-defrag-cycle-min 20
# Tỷ lệ CPU time dành cho dọn dẹp memory fragmentation không cao hơn 50%
config set active-defrag-cycle-max 50
```

Ngoài ra, khởi động lại node có thể defragment lại bộ nhớ. Nếu bạn đang dùng Redis cluster với high availability architecture, có thể chuyển master node có fragmentation rate cao thành slave node để khởi động lại an toàn.

## Tài liệu tham khảo

- Redis official docs: <https://redis.io/topics/memory-optimization>
- Redis Core Technology and Practice - GeekTime - Sau khi xóa dữ liệu, tại sao memory usage rate vẫn cao?: <https://time.geekbang.org/column/article/289140>
- Redis Source Analysis — Memory Allocation: <<https://shinerio.cc/2020/05/17/redis/Redis> Source Analysis — Memory Management>

<!-- @include: @article-footer.snippet.md -->
