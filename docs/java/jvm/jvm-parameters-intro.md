---
title: Tổng hợp các tham số JVM quan trọng nhất
description: Tổng hợp các tham số JVM phổ biến và cách cấu hình, kết hợp với các gợi ý thực tiễn về memory và GC tuning.
category: Java
tag:
  - JVM
head:
  - - meta
    - name: keywords
      content: JVM parameter,heap size,stack size,GC settings,performance tuning,XX parameter
---

> Bài này được JavaGuide dịch từ [https://www.baeldung.com/jvm-parameters](https://www.baeldung.com/jvm-parameters) và bổ sung hoàn thiện đáng kể.
> Tài liệu tham số: [https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html](https://docs.oracle.com/javase/8/docs/technotes/tools/unix/java.html)
>
> Phiên bản JDK: Chủ yếu 1.8, cũng bổ sung các tham số phổ biến của phiên bản mới hơn.

Trong bài này, chúng ta sẽ cùng nắm vững một số cấu hình tham số phổ biến nhất trong Java Virtual Machine (JVM), giúp bạn hiểu rõ và tối ưu môi trường chạy của Java application.

## Liên quan đến Heap Memory

> Java Heap là vùng memory lớn nhất trong bộ nhớ do JVM quản lý, **tất cả thread chia sẻ**, được tạo khi virtual machine khởi động. **Mục đích duy nhất của vùng memory này là lưu trữ object instance. Hầu hết tất cả object instance và array đều được cấp phát memory trên heap.**

![Các tham số cấu hình phổ biến của memory area](./pictures/内存区域常见配置参数.png)

### Đặt kích thước Heap Memory (-Xms và -Xmx)

Đặt kích thước heap memory ban đầu và tối đa theo nhu cầu thực tế của ứng dụng là một trong những thực hành phổ biến nhất trong performance tuning. **Khuyến nghị đặt tường minh cả hai tham số, và thường khuyến nghị đặt chúng bằng giá trị nhau** để tránh overhead hiệu năng do điều chỉnh dynamic heap memory lúc runtime.

Dùng các tham số sau để cấu hình:

```bash
-Xms<heap size>[unit]  # Đặt initial heap size của JVM
-Xmx<heap size>[unit]  # Đặt maximum heap size của JVM
```

- `<heap size>`: Chỉ định giá trị memory cụ thể.
- `[unit]`: Chỉ định đơn vị memory như g (GB), m (MB), k (KB).

**Ví dụ**: Đặt initial và maximum heap của JVM đều là 4GB:

```bash
-Xms4G -Xmx4G
```

### Đặt kích thước Young Generation Memory

Theo [tài liệu chính thức Oracle](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/sizing.html), sau khi hoàn thành cấu hình tổng heap memory, yếu tố ảnh hưởng lớn thứ hai là tỷ lệ `Young Generation` chiếm trong heap memory. Mặc định kích thước tối thiểu của YG là **1310 MB**, kích thước tối đa là **không giới hạn**.

Có thể đặt kích thước Young Generation theo hai cách:

**1. Chỉ định qua `-XX:NewSize` và `-XX:MaxNewSize`**

```bash
-XX:NewSize=<young size>[unit]    # Đặt initial size của Young Generation
-XX:MaxNewSize=<young size>[unit] # Đặt maximum size của Young Generation
```

**Ví dụ**: Đặt Young Generation tối thiểu 512MB, tối đa 1024MB:

```bash
-XX:NewSize=512m -XX:MaxNewSize=1024m
```

**2. Chỉ định qua `-Xmn<young size>[unit]`**

**Ví dụ**: Cố định kích thước Young Generation là 512MB:

```bash
-Xmn512m
```

Một kinh nghiệm quan trọng trong GC tuning strategy nói:

> Cố gắng để object mới tạo được cấp phát memory trong Young Generation và được thu hồi ở đó, vì chi phí Minor GC thường thấp hơn nhiều so với Full GC. Thông qua phân tích GC log, xác định xem việc cấp phát không gian Young Generation có hợp lý không. Nếu nhiều object mới bị promote sớm vào Old Generation, có thể điều chỉnh kích thước Young Generation qua `-Xmn` hoặc `-XX:NewSize/-XX:MaxNewSize`, mục tiêu là giảm tối đa số object đi thẳng vào Old Generation.

Ngoài ra, có thể dùng tham số **`-XX:NewRatio=<int>`** để đặt **tỷ lệ kích thước memory của Old Generation và Young Generation (không tính Survivor zone)**.

Ví dụ `-XX:NewRatio=2` (giá trị mặc định) nghĩa là Old Generation : Young Generation = 2 : 1. Tức Young Generation chiếm 1/3 tổng heap.

```bash
-XX:NewRatio=2
```

### Đặt kích thước PermGen/Metaspace

**Từ Java 8, nếu không chỉ định kích thước Metaspace, virtual machine sẽ tiêu hết tất cả system memory khả dụng khi ngày càng nhiều class được tạo (PermGen không có vấn đề này).**

Trước JDK 1.8 khi PermGen chưa bị xóa hoàn toàn, thường dùng các tham số sau để điều chỉnh kích thước method area:

```bash
-XX:PermSize=N    # Initial size của method area (PermGen)
-XX:MaxPermSize=N # Maximum size của method area (PermGen), vượt quá sẽ throw OutOfMemoryError: java.lang.OutOfMemoryError: PermGen
```

Tương đối mà nói, garbage collection xảy ra ít hơn trong vùng này, nhưng không phải data vào method area thì "tồn tại mãi mãi".

**JDK 1.8, method area (PermGen của HotSpot) đã bị xóa hoàn toàn (JDK 1.7 đã bắt đầu), thay thế bằng Metaspace sử dụng native memory.**

Dưới đây là một số tham số phổ biến:

```bash
-XX:MetaspaceSize=N    # Đặt initial size của Metaspace (đây là hiểu lầm phổ biến, sẽ giải thích sau)
-XX:MaxMetaspaceSize=N # Đặt maximum size của Metaspace
```

**🐛 Đính chính (xem: [issue#1947](https://github.com/Snailclimb/JavaGuide/issues/1947))**:

**1. `-XX:MetaspaceSize` không phải initial capacity**: Initial capacity của Metaspace không được đặt bởi `-XX:MetaspaceSize`. Bất kể cấu hình giá trị nào cho `-XX:MetaspaceSize`, với 64-bit JVM, initial capacity của Metaspace thường là một giá trị nhỏ cố định (tài liệu Oracle đề cập khoảng 12MB đến 20MB, quan sát thực tế khoảng 20.8MB).

Tham khảo tài liệu chính thức Oracle [Other Considerations](https://docs.oracle.com/javase/8/docs/technotes/guides/vm/gctuning/considerations.html):

> Specify a higher value for the option MetaspaceSize to avoid early garbage collections induced for class metadata. The amount of class metadata allocated for an application is application-dependent and general guidelines do not exist for the selection of MetaspaceSize. The default size of MetaspaceSize is platform-dependent and ranges from 12 MB to about 20 MB.
>
> Kích thước mặc định của MetaspaceSize phụ thuộc vào platform, từ 12MB đến khoảng 20MB.

Ngoài ra, có thể xem thí nghiệm này: [Hiểu lầm về tham số JVM MetaspaceSize](https://mp.weixin.qq.com/s/jqfppqqd98DfAJHZhFbmxA).

**2. Mở rộng và Full GC**: Khi usage của Metaspace tăng và lần đầu tiên đạt ngưỡng được chỉ định bởi `-XX:MetaspaceSize`, sẽ trigger một lần Full GC. Sau đó JVM sẽ dynamic điều chỉnh ngưỡng trigger GC này. Nếu Metaspace tiếp tục tăng, mỗi lần đạt ngưỡng mới cần mở rộng vẫn có thể trigger Full GC (hành vi cụ thể liên quan đến garbage collector và phiên bản). GC nội bộ dùng biến `_capacity_until_GC` để xác định Metaspace region có đạt ngưỡng không. Code khởi tạo như sau:

```c
void MetaspaceGC::initialize() {
  // Set the high-water mark to MaxMetapaceSize during VM initialization since
  // we can't do a GC during initialization.
  _capacity_until_GC = MaxMetaspaceSize;
}
```

**3. Tầm quan trọng của `-XX:MaxMetaspaceSize`**: Nếu không đặt tường minh `-XX:MaxMetaspaceSize`, kích thước tối đa của Metaspace về lý thuyết bị giới hạn bởi native memory khả dụng. Trong trường hợp cực đoan (như class loader leak gây tải liên tục), điều này **có thể tiêu hết lượng lớn native memory**. Do đó **mạnh mẽ khuyến nghị đặt một giới hạn `-XX:MaxMetaspaceSize` hợp lý** để ngăn ảnh hưởng đến hệ thống.

Đọc liên quan: [issue correction: MaxMetaspaceSize nếu không chỉ định size sẽ không tiêu hết memory #1204](https://github.com/Snailclimb/JavaGuide/issues/1204).

## Liên quan đến Garbage Collection

### Chọn Garbage Collector

Chọn garbage collector (GC) phù hợp là rất quan trọng cho throughput và response latency của ứng dụng. Để xem giới thiệu chi tiết về GC algorithm và collector, xem bài: [Giải thích chi tiết JVM Garbage Collection (Quan trọng)](https://javaguide.cn/java/jvm/jvm-garbage-collection.html).

JVM cung cấp nhiều GC implementation phù hợp cho các tình huống khác nhau:

- **Serial GC**: Thực thi GC single-thread, phù hợp với client mode hoặc môi trường single-core CPU. Tham số: `-XX:+UseSerialGC`.
- **Parallel GC**: Thực thi Minor GC multi-thread, và tùy chọn thực thi Full GC multi-thread (qua `-XX:+UseParallelOldGC`). Tập trung vào throughput, là GC mặc định của JDK 8. Tham số: `-XX:+UseParallelGC`.
- **CMS GC (Concurrent Mark Sweep)**: Mục tiêu là thời gian dừng ngắn nhất, hầu hết các phase GC có thể chạy concurrent với user thread. Phù hợp cho ứng dụng yêu cầu response time cao. Bị deprecated trong JDK 9, bị xóa trong JDK 14. Tham số: `-XX:+UseConcMarkSweepGC`.
- **G1 GC (Garbage-First)**: GC mặc định từ JDK 9 trở đi. Chia heap thành nhiều Region, cân bằng throughput và pause time, cố gắng hoàn thành GC trong thời gian dừng có thể dự đoán. Tham số: `-XX:+UseG1GC`.
- **ZGC**: GC low-latency mới hơn, mục tiêu kiểm soát GC pause time trong vài millisecond thậm chí sub-millisecond, cần phiên bản JDK mới hơn. Tham số (có thể thay đổi theo phiên bản): `-XX:+UseZGC`, `-XX:+UseShenandoahGC`.

### Ghi GC Log

Trong môi trường production hoặc khi troubleshoot vấn đề GC, **nhất thiết phải bật ghi GC log**. GC log chi tiết là căn cứ quan trọng để phân tích và giải quyết vấn đề GC.

Dưới đây là một số tham số GC log được khuyến nghị cấu hình (áp dụng cho JDK 8/11 và các phiên bản phổ biến khác):

```bash
# --- Cấu hình cơ bản khuyến nghị ---
# In thông tin GC chi tiết
-XX:+PrintGCDetails
# In timestamp khi GC xảy ra (tương đối với thời gian khởi động JVM)
# -XX:+PrintGCTimeStamps
# In ngày và giờ khi GC xảy ra (phổ biến hơn)
-XX:+PrintGCDateStamps
# Chỉ định đường dẫn output file GC log, %t có thể output date-time stamp
-Xloggc:/path/to/gc-%t.log

# --- Cấu hình nâng cao khuyến nghị ---
# In phân phối object age (giúp đánh giá tình trạng object promote lên Old Generation)
-XX:+PrintTenuringDistribution
# In heap info trước và sau GC
-XX:+PrintHeapAtGC
# In thông tin xử lý các loại reference khác nhau (strong/soft/weak/phantom)
-XX:+PrintReferenceGC
# In application pause time (Stop-The-World, STW)
-XX:+PrintGCApplicationStoppedTime

# --- Cấu hình rotate GC log file ---
# Bật rotate GC log file
-XX:+UseGCLogFileRotation
# Đặt số lượng rotate log file (ví dụ giữ 14 file gần nhất)
-XX:NumberOfGCLogFiles=14
# Đặt kích thước tối đa mỗi log file (ví dụ 50MB)
-XX:GCLogFileSize=50M

# --- Cấu hình chẩn đoán bổ sung tùy chọn ---
# In thống kê safepoint (giúp phân tích nguyên nhân STW)
# -XX:+PrintSafepointStatistics
# -XX:PrintSafepointStatisticsCount=1
```

**Lưu ý**: JDK 9 trở đi giới thiệu unified JVM logging framework (`-Xlog`) — cách cấu hình có sự khác biệt, nhưng các tham số `-Xloggc` và rotate ở trên thường vẫn tương thích hoặc có tham số mới tương ứng.

## Xử lý OOM

Với large application, gặp out-of-memory error là điều rất phổ biến — ngược lại có thể gây crash ứng dụng. Đây là tình huống rất quan trọng và khó reproduce.

Đó là lý do tại sao JVM cung cấp một số tham số để dump heap memory vào file vật lý, có thể dùng sau để tìm leak:

```bash
# Tạo heap dump file khi OOM xảy ra
-XX:+HeapDumpOnOutOfMemoryError

# Chỉ định đường dẫn output file heap dump. <pid> sẽ được thay bằng process ID
-XX:HeapDumpPath=/path/to/heapdump/java_pid<pid>.hprof
# Ví dụ: -XX:HeapDumpPath=/data/dumps/

# (Tùy chọn) Thực thi lệnh hoặc script được chỉ định khi OOM xảy ra
# Ví dụ gửi alert notification hoặc cố restart service (dùng cẩn thận)
# -XX:OnOutOfMemoryError="<command> <args>"
# Ví dụ: -XX:OnOutOfMemoryError="sh /path/to/notify.sh"

# (Tùy chọn) Bật kiểm tra GC overhead limit
# Nếu tỷ lệ GC time trong tổng thời gian quá cao (mặc định 98%) và hiệu quả thu hồi ít (mặc định < 2% heap),
# sẽ throw OOM sớm để ngăn ứng dụng bị treo lâu trong GC.
-XX:+UseGCOverheadLimit
```

## Các tham số phổ biến khác

- `-server`: Tường minh bật Server mode HotSpot VM (thường là giá trị mặc định trên 64-bit JVM).
- `-XX:+UseStringDeduplication`: (JDK 8u20+) Cố gắng nhận dạng và chia sẻ các String object có cùng `char[]` array bên dưới để giảm memory usage. Phù hợp với tình huống có nhiều duplicate string.
- `-XX:SurvivorRatio=<ratio>`: Đặt tỷ lệ kích thước giữa Eden zone và một Survivor zone. Ví dụ `-XX:SurvivorRatio=8` nghĩa là Eden:Survivor = 8:1.
- `-XX:MaxTenuringThreshold=<threshold>`: Đặt ngưỡng tuổi tối đa khi object được promote từ Young Generation lên Old Generation (mỗi lần object trải qua Minor GC và sống sót, tuổi tăng 1). Giá trị mặc định thường là 15.
- `-XX:+DisableExplicitGC`: Ngăn code gọi tường minh `System.gc()`. Khuyến nghị bật — tránh trigger Full GC không cần thiết do con người.
- `-XX:+UseLargePages`: (Cần OS hỗ trợ) Cố gắng dùng large memory page (như 2MB thay vì 4KB) — có thể cải thiện hiệu năng của memory-intensive application, nhưng cần test cẩn thận.
- `-XX:MinHeapFreeRatio=<percent> / -XX:MaxHeapFreeRatio=<percent>`: Kiểm soát tỷ lệ minimum/maximum heap memory free sau GC, dùng để dynamic điều chỉnh heap size (nếu `-Xms` và `-Xmx` không bằng nhau). Thường khuyến nghị đặt `-Xms` và `-Xmx` bằng nhau để tránh overhead điều chỉnh.

**Lưu ý**: Các tham số sau trong JVM hiện đại có thể đã **deprecated, bị xóa hoặc mặc định bật và không cần cấu hình thủ công**:

- `-XX:+UseLWPSynchronization`: Tùy chọn chiến lược synchronization cũ hơn, JVM hiện đại thường có implementation tối ưu hơn.
- `-XX:LargePageSizeInBytes`: Thường được tự động xác định bởi `-XX:+UseLargePages` hoặc qua cấu hình OS.
- `-XX:+UseStringCache`: Đã bị xóa.
- `-XX:+UseCompressedStrings`: Đã được thay thế bởi Compact Strings feature mặc định bật từ Java 9 trở đi.
- `-XX:+OptimizeStringConcat`: String concatenation optimization (invokedynamic) là hành vi mặc định từ Java 9 trở đi.

## Tổng kết

Bài này cung cấp hướng dẫn thực tiễn về cấu hình tham số JVM phổ biến cho Java developer, nhằm giúp người đọc hiểu và tối ưu hiệu năng và ổn định của Java application. Bài tập trung vào một số khía cạnh sau:

1. **Cấu hình Heap Memory**: Khuyến nghị đặt tường minh initial và maximum heap memory (`-Xms`, `-Xmx`, thường đặt bằng nhau) và Young Generation size (`-Xmn` hoặc `-XX:NewSize/-XX:MaxNewSize`) — quan trọng với GC performance.
2. **Quản lý Metaspace (Java 8+)**: Làm rõ tác dụng thực sự của `-XX:MetaspaceSize` (ngưỡng trigger Full GC lần đầu, không phải initial capacity), và mạnh mẽ khuyến nghị đặt `-XX:MaxMetaspaceSize` để ngăn tiêu hết native memory tiềm ẩn.
3. **Chọn Garbage Collector và Log**: Giới thiệu tình huống phù hợp của các GC algorithm khác nhau, nhấn mạnh tầm quan trọng của việc bật GC log chi tiết (`-Xloggc`, `-XX:+PrintGCDetails`, v.v.) trong môi trường production và test để troubleshoot.
4. **Troubleshoot OOM**: Giải thích cách tự động tạo heap dump file khi OOM xảy ra qua tham số `-XX:+HeapDumpOnOutOfMemoryError` để phân tích memory leak tiếp theo.
5. **Các tham số khác**: Giới thiệu ngắn gọn các tham số hữu ích khác như string deduplication, và chỉ ra tình trạng của một số tham số cũ.

Để xem các case study troubleshoot và tuning thực tế, tham khảo bài: [JVM Online Issue Troubleshoot and Performance Tuning Cases](https://javaguide.cn/java/jvm/jvm-in-action.html).
