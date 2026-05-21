---
title: Java Thread Pool Best Practices
description: "Tổng hợp các best practice khi dùng Java thread pool: cấu hình tham số thread pool, tránh rủi ro OOM từ factory method của Executors, chọn rejection policy, monitor thread pool, chuẩn đặt tên thread, v.v."
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: thread pool best practices,ThreadPoolExecutor configuration,Executors pitfall,OOM risk,rejection policy,monitor thread pool,thread naming
---

Tóm tắt ngắn những điều cần chú ý khi dùng thread pool theo hiểu biết của tôi — hình như chưa có bài viết chuyên về chủ đề này trên mạng.

## 1. Khai báo Thread Pool đúng cách

**Thread pool phải được khai báo thủ công qua constructor của `ThreadPoolExecutor`, tránh dùng lớp `Executors` để tạo thread pool vì có rủi ro OOM.**

Nhược điểm của các thread pool object do `Executors` trả về (sẽ giới thiệu chi tiết sau):

- **`FixedThreadPool` và `SingleThreadExecutor`**: Dùng blocking queue `LinkedBlockingQueue`, độ dài mặc định và tối đa của task queue là `Integer.MAX_VALUE`, có thể coi là unbounded queue — có thể tích lũy lượng lớn request dẫn đến OOM.
- **`CachedThreadPool`**: Dùng synchronous queue `SynchronousQueue`, số thread có thể tạo là `Integer.MAX_VALUE` — có thể tạo lượng lớn thread dẫn đến OOM.
- **`ScheduledThreadPool` và `SingleThreadScheduledExecutor`**: Dùng unbounded delayed blocking queue `DelayedWorkQueue`, độ dài tối đa của task queue là `Integer.MAX_VALUE` — có thể tích lũy lượng lớn request dẫn đến OOM.

Nói đơn giản: **Dùng bounded queue, kiểm soát số lượng thread tạo ra.**

Ngoài lý do tránh OOM, còn hai lý do không khuyến nghị dùng shortcut thread pool của `Executors`:

- Trong thực tế cần cấu hình thủ công các tham số thread pool như core thread count, task queue, saturation policy, v.v. dựa trên hiệu năng máy và tình huống nghiệp vụ.
- Nên đặt tên tường minh cho thread pool — điều này giúp định vị vấn đề.

## 2. Giám sát trạng thái hoạt động của Thread Pool

Có thể giám sát trạng thái hoạt động của thread pool bằng một số phương tiện, ví dụ component Actuator trong SpringBoot.

Ngoài ra, có thể dùng các API liên quan của `ThreadPoolExecutor` để monitor đơn giản. Từ hình dưới, `ThreadPoolExecutor` cung cấp phương thức lấy số thread hiện tại, active thread count, số task đã hoàn thành, số task đang xếp hàng, v.v.

![](/images/github/javaguide/java/concurrent/threadpool-methods-information.png)

Dưới đây là Demo đơn giản. `printThreadPoolStatus()` in ra thread count, active thread count, số task hoàn thành và số task trong queue của thread pool mỗi giây.

```java
/**
 * In trạng thái thread pool
 *
 * @param threadPool Đối tượng thread pool
 */
public static void printThreadPoolStatus(ThreadPoolExecutor threadPool) {
    ScheduledExecutorService scheduledExecutorService = new ScheduledThreadPoolExecutor(1, createThreadFactory("print-images/thread-pool-status", false));
    scheduledExecutorService.scheduleAtFixedRate(() -> {
        log.info("=========================");
        log.info("ThreadPool Size: [{}]", threadPool.getPoolSize());
        log.info("Active Threads: {}", threadPool.getActiveCount());
        log.info("Number of Tasks : {}", threadPool.getCompletedTaskCount());
        log.info("Number of Tasks in Queue: {}", threadPool.getQueue().size());
        log.info("=========================");
    }, 0, 1, TimeUnit.SECONDS);
}
```

## 3. Khuyến nghị dùng thread pool riêng cho các nghiệp vụ khác nhau

Nhiều người trong dự án thực tế thường gặp câu hỏi: **Dự án có nhiều nghiệp vụ cần dùng thread pool — nên định nghĩa một thread pool cho mỗi nghiệp vụ hay dùng chung một thread pool?**

Thông thường khuyến nghị các nghiệp vụ khác nhau dùng thread pool khác nhau. Khi cấu hình thread pool, dựa trên tình huống nghiệp vụ hiện tại để cấu hình, vì concurrency và tài nguyên sử dụng của các nghiệp vụ khác nhau đều khác nhau. Ưu tiên tối ưu các nghiệp vụ liên quan đến bottleneck hiệu năng hệ thống.

**Cùng xem một ca tai nạn thực tế!** (Ca này đến từ: [《Tai nạn online vì dùng sai thread pool》](https://heapdump.cn/article/646639) — một ca rất hay!)

![Code overview](/images/github/javaguide/java/concurrent/production-accident-threadpool-sharing-example.png)

Code trên có thể xảy ra deadlock. Tại sao? Vẽ hình giải thích.

Thử nghĩ tình huống cực đoan này: Giả sử core thread count của thread pool là **n**, số parent task (task trừ tiền) là **n**, mỗi parent task có hai child task (sub-task dưới task trừ tiền). Một cái đã thực thi xong, cái kia được đặt vào task queue. Vì parent task đã dùng hết core thread resource của thread pool, child task không thể lấy được thread resource nên không thể thực thi bình thường — bị block mãi trong queue. Parent task chờ child task thực thi xong, child task chờ parent task giải phóng thread pool resource — dẫn đến **"deadlock"**.

![Thread pool dùng sai gây deadlock](/images/github/javaguide/java/concurrent/production-accident-threadpool-sharing-deadlock.png)

Giải pháp cũng đơn giản: Thêm một thread pool riêng biệt để thực thi child task.

## 4. Đừng quên đặt tên cho Thread Pool

Khi khởi tạo thread pool cần đặt tên tường minh (đặt prefix tên thread pool), giúp định vị vấn đề.

Tên thread được tạo mặc định kiểu `pool-1-thread-n` như vậy, không có ý nghĩa nghiệp vụ, không tiện định vị vấn đề.

Đặt tên cho thread trong thread pool thường có hai cách sau:

**1. Dùng `ThreadFactoryBuilder` của guava**

```java
ThreadFactory threadFactory = new ThreadFactoryBuilder()
                        .setNameFormat(threadNamePrefix + "-%d")
                        .setDaemon(true).build();
ExecutorService threadPool = new ThreadPoolExecutor(corePoolSize, maximumPoolSize, keepAliveTime, TimeUnit.MINUTES, workQueue, threadFactory)
```

**2. Tự triển khai `ThreadFactory`.**

```java
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Thread factory — đặt tên thread, giúp định vị vấn đề.
 */
public final class NamingThreadFactory implements ThreadFactory {

    private final AtomicInteger threadNum = new AtomicInteger();
    private final String name;

    /**
     * Tạo thread pool factory có đặt tên
     */
    public NamingThreadFactory(String name) {
        this.name = name;
    }

    @Override
    public Thread newThread(Runnable r) {
        Thread t = new Thread(r);
        t.setName(name + " [#" + threadNum.incrementAndGet() + "]");
        return t;
    }
}
```

## 5. Cấu hình tham số Thread Pool đúng cách

Nói về cách cấu hình tham số thread pool — cách "độc lạ" của Meituan khiến tôi khó quên (sẽ đề cập sau)!

Trước tiên xem cách cấu hình tham số thread pool thường được các sách và blog khuyến nghị — có thể dùng làm tham khảo.

### Cách thông thường

Nhiều người thậm chí có thể nghĩ cứ đặt thread pool to một chút là xong! Tôi cho rằng điều này rõ ràng có vấn đề. Lấy một ví dụ rất phổ biến trong cuộc sống: **Người nhiều không có nghĩa là làm việc tốt hơn — tăng chi phí giao tiếp. Một việc chỉ cần 3 người làm mà bạn kéo thêm 6 người vào, hiệu suất có tăng không? Tôi nghĩ là không.** Ảnh hưởng của quá nhiều thread cũng giống như phân bổ quá nhiều người làm việc — với multi-thread chủ yếu là tăng chi phí **context switching**. Nếu chưa rõ context switching là gì, xem giới thiệu dưới đây.

> Context switching:
>
> Trong lập trình đa luồng, số thread thường lớn hơn số CPU core. Một CPU core tại bất kỳ thời điểm nào chỉ được một thread dùng. Để tất cả thread đều được thực thi hiệu quả, CPU áp dụng chiến lược phân bổ time slice theo dạng round-robin cho mỗi thread. Khi time slice của một thread hết, nó sẽ chuyển sang trạng thái ready để nhường cho thread khác. Quá trình này là một lần context switch. Nói tóm lại: Task lưu trạng thái hiện tại trước khi CPU time slice hết và chuyển sang task khác, để lần sau switch lại có thể load lại trạng thái. **Quá trình từ lưu đến load lại là một lần context switch**.
>
> Context switching thường compute-intensive — tức cần đáng kể processor time. Trong hàng chục đến hàng trăm lần switch mỗi giây, mỗi lần cần nanosecond level time. Vì vậy context switching đối với hệ thống nghĩa là tiêu tốn lượng lớn CPU time — thực ra có thể là thao tác tốn thời gian nhất trong OS.
>
> Linux so với các OS khác (bao gồm các Unix-like khác) có nhiều ưu điểm, một trong đó là thời gian context switching và mode switching của nó tiêu tốn rất ít.

Tương tự người trong thực tế hợp tác làm việc, có một điều chắc chắn là thread pool size quá lớn hay quá nhỏ đều có vấn đề — vừa phải mới là tốt nhất.

- Nếu số thread pool đặt quá ít: Khi đồng thời có lượng lớn task/request cần xử lý, có thể gây lượng lớn request/task xếp hàng trong task queue chờ thực thi, thậm chí task queue đầy khiến không xử lý được thêm, hoặc lượng lớn task tích lũy gây OOM. Điều này rõ ràng có vấn đề — CPU không được tận dụng đầy đủ.
- Nếu số thread pool đặt quá nhiều: Nhiều thread có thể đồng thời tranh CPU resource, gây lượng lớn context switch, tăng thời gian thực thi thread, ảnh hưởng hiệu suất tổng thể.

Có một công thức đơn giản và khá phổ quát:

- **CPU-intensive task (N)**: Loại task này tiêu tốn chủ yếu là CPU resource, nên đặt thread count bằng N (số CPU core). Vì bottleneck chủ yếu là khả năng tính toán CPU, số thread bằng core count có thể maximize CPU utilization. Quá nhiều thread ngược lại gây cạnh tranh và context switching overhead.
- **I/O-intensive task (M \* N)**: Loại task này phần lớn thời gian xử lý I/O interaction, thread trong khi chờ I/O không chiếm CPU. Để tận dụng đầy đủ CPU resource, có thể đặt thread count là M \* N (N là CPU core count, M là bội số > 1, khuyến nghị mặc định là 2). Giá trị cụ thể phụ thuộc vào I/O wait time và đặc điểm task — cần tìm điểm cân bằng tốt nhất qua test và monitoring.

CPU-intensive task không còn khuyến nghị N+1 nữa, lý do:

- Mục đích ban đầu của "N+1" là dự phòng thread xử lý đột biến tạm dừng, nhưng thực tế xử lý page fault, v.v. vẫn cần chiếm CPU core.
- Trong CPU-intensive scenario, CPU luôn là bottleneck — dự phòng thread không thể tạo thêm khả năng xử lý CPU, ngược lại có thể làm tăng cạnh tranh.

**Làm sao phân biệt CPU-intensive hay I/O-intensive?**

CPU-intensive hiểu đơn giản là task tận dụng khả năng tính toán CPU như sắp xếp lượng lớn dữ liệu trong memory. Liên quan đến network read, file read đều là I/O-intensive. Đặc điểm của loại task này là thời gian CPU tính toán rất ít so với thời gian chờ I/O operation hoàn tất — phần lớn thời gian đều chờ I/O.

🌈 Mở rộng thêm (xem: [issue#1737](https://github.com/Snailclimb/JavaGuide/issues/1737)):

Cách tính thread count nghiêm ngặt hơn: `Optimal thread count = N (CPU core count) * (1 + WT (thread wait time) / ST (thread compute time))`, trong đó `WT = Total thread run time - ST`.

Tỷ lệ thread wait time càng cao cần càng nhiều thread. Tỷ lệ thread compute time càng cao cần càng ít thread.

Có thể dùng công cụ VisualVM đi kèm JDK để xem tỷ lệ `WT/ST`.

`WT/ST` của CPU-intensive task gần bằng hoặc bằng 0, do đó thread count có thể đặt bằng N \* (1+0) = N — gần với N+1 đã nói ở trên.

Với I/O-intensive task, hầu như toàn bộ là thread wait time. Về lý thuyết có thể đặt thread count bằng 2N (lý do chọn 2N có thể là để tránh tạo quá nhiều thread).

**Lưu ý**: Công thức trên cũng chỉ là tham khảo. Dự án thực tế không thể trực tiếp đặt tham số thread pool theo công thức vì các tình huống nghiệp vụ khác nhau có nhu cầu khác nhau — vẫn cần điều chỉnh dynamic dựa trên tình hình online thực tế. Phương án cấu hình dynamic tham số thread pool của Meituan được giới thiệu tiếp theo rất hay và thực dụng!

### Cách "độc lạ" của Meituan

Tech team Meituan trong bài [《Nguyên lý triển khai Java Thread Pool và thực tiễn trong nghiệp vụ Meituan》](https://tech.meituan.com/2020/04/02/java-pooling-pratice-in-meituan.html) giới thiệu ý tưởng và phương pháp triển khai custom configuration cho tham số thread pool.

Ý tưởng của tech team Meituan là chủ yếu triển khai custom configurable cho các tham số cốt lõi của thread pool. Ba tham số cốt lõi đó là:

- **`corePoolSize`**: Core thread count — định nghĩa số thread tối thiểu có thể chạy đồng thời.
- **`maximumPoolSize`**: Khi số task trong queue đạt capacity của queue, số thread có thể chạy đồng thời tối đa là maximum thread count.
- **`workQueue`**: Khi task mới đến, trước tiên kiểm tra tổng số working thread hiện tại có đạt core thread count chưa. Nếu đạt rồi, task mới được ưu tiên lưu vào queue, chờ working thread rảnh đến xử lý.

**Tại sao là ba tham số này?**

Trong bài [《Tổng kết học thread pool mà newbie cũng hiểu》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485808&idx=1&sn=1013253533d73450cef673aee13267ab&chksm=cea246bbf9d5cfad1c21316340a0ef1609a7457fea4113a1f8d69e8c91e7d9cd6285f5ee1490&token=510053261&lang=zh_CN&scene=21#wechat_redirect) đã nói ba tham số này là quan trọng nhất của `ThreadPoolExecutor` — về cơ bản quyết định cách thread pool xử lý task.

**Làm thế nào hỗ trợ dynamic configuration tham số?** Xem các method sau của `ThreadPoolExecutor`.

![](/images/github/javaguide/java/concurrent/threadpoolexecutor-methods.png)

Đặc biệt cần chú ý `corePoolSize`. Khi gọi `setCorePoolSize()` trong khi chương trình chạy, thread pool trước tiên kiểm tra số working thread hiện tại có lớn hơn `corePoolSize` không. Nếu lớn hơn thì sẽ reclaim working thread.

Ngoài ra, bạn cũng thấy không có method nào chỉ định dynamic queue length. Cách của Meituan là tự custom một queue tên `ResizableCapacityLinkedBlockIngQueue` (chủ yếu là bỏ `final` modifier trên field `capacity` của `LinkedBlockingQueue`, cho nó trở thành mutable).

Effect cuối cùng của dynamic modify thread pool params như hình dưới. 👏👏👏

![Effect cuối cùng của dynamic configuration thread pool params](/images/github/javaguide/java/concurrent/meituan-dynamically-configuring-thread-pool-parameters.png)

Nếu dự án của bạn cũng muốn triển khai effect này, có thể dùng các open source project có sẵn:

- **[Hippo4j](https://github.com/opengoofy/hippo4j)**: Async thread pool framework, hỗ trợ dynamic change & monitor & alert cho thread pool, không cần sửa code, dễ dàng tích hợp. Hỗ trợ nhiều chế độ sử dụng, dễ tích hợp, nỗ lực cải thiện khả năng bảo đảm vận hành hệ thống.
- **[Dynamic TP](https://github.com/dromara/dynamic-tp)**: Dynamic thread pool nhẹ, tích hợp sẵn chức năng monitor và alert, quản lý thread pool cho các middleware bên thứ ba, dựa trên các config center mainstream (đã hỗ trợ Nacos, Apollo, Zookeeper, Consul, Etcd, có thể custom triển khai qua SPI).

## 6. Đừng quên đóng Thread Pool

Khi thread pool không còn cần dùng nữa, nên đóng tường minh để giải phóng thread resource.

Thread pool cung cấp hai method đóng:

- **`shutdown()`**: Đóng thread pool, trạng thái thread pool chuyển thành `SHUTDOWN`. Thread pool không nhận task mới nữa, nhưng task trong queue phải thực thi xong.
- **`shutdownNow()`**: Đóng thread pool, trạng thái thread pool chuyển thành `STOP`. Thread pool sẽ terminate các task đang chạy, dừng xử lý task xếp hàng và trả về List các task đang chờ thực thi.

Sau khi gọi `shutdownNow` và `shutdown`, không có nghĩa là thread pool đã hoàn tất thao tác đóng — nó chỉ thông báo bất đồng bộ cho thread pool để xử lý đóng. Nếu muốn đồng bộ chờ thread pool đóng hoàn toàn mới tiếp tục, cần gọi `awaitTermination` để chờ đồng bộ.

Khi gọi `awaitTermination()`, nên đặt thời gian timeout hợp lý để tránh chương trình block lâu gây vấn đề hiệu năng. Ngoài ra, vì task trong thread pool có thể bị cancel hoặc throw exception, khi dùng `awaitTermination()` cần xử lý exception. `awaitTermination()` throw `InterruptedException` — cần catch và xử lý để tránh crash hoặc không exit bình thường.

```java
// ...
// Đóng thread pool
executor.shutdown();
try {
    // Chờ thread pool đóng, tối đa 5 phút
    if (!executor.awaitTermination(5, TimeUnit.MINUTES)) {
        // Nếu timeout thì log
        System.err.println("Thread pool không đóng được trong 5 phút");
    }
} catch (InterruptedException e) {
    // Xử lý exception
}
```

## 7. Hạn chế đưa time-consuming task vào Thread Pool

Mục đích của thread pool là cải thiện hiệu suất thực thi task, tránh overhead hiệu năng do thường xuyên create/destroy thread. Nếu submit time-consuming task vào thread pool, có thể khiến thread trong pool bị chiếm lâu, không kịp respond các task khác, thậm chí thread pool crash hoặc chương trình deadlock.

Do đó khi dùng thread pool, nên hạn chế submit time-consuming task vào. Với các thao tác khá tốn thời gian như network request, file read/write, có thể dùng `CompletableFuture` hay các cách async operation khác để xử lý, tránh block thread trong thread pool.

## 8. Một số pitfall khi dùng Thread Pool

### Pitfall tạo thread pool lặp đi lặp lại

Thread pool có thể tái sử dụng — tuyệt đối không được tạo thread pool thường xuyên, ví dụ một user request đến thì tạo riêng một thread pool.

```java
@GetMapping("wrong")
public String wrong() throws InterruptedException {
    // Custom thread pool
    ThreadPoolExecutor executor = new ThreadPoolExecutor(5,10,1L,TimeUnit.SECONDS,new ArrayBlockingQueue<>(100),new ThreadPoolExecutor.CallerRunsPolicy());

    //  Xử lý task
    executor.execute(() -> {
      // ......
    }
    return "OK";
}
```

Nguyên nhân vấn đề này là hiểu biết về thread pool chưa đủ — cần củng cố kiến thức cơ bản về thread pool.

### Pitfall với Spring internal thread pool

Khi dùng Spring internal thread pool, nhất định phải tự custom thread pool với tham số hợp lý — không thì sẽ có vấn đề production (mỗi request tạo một thread).

```java
@Configuration
@EnableAsync
public class ThreadPoolExecutorConfig {

    @Bean(name="threadPoolExecutor")
    public Executor threadPoolExecutor(){
        ThreadPoolTaskExecutor threadPoolExecutor = new ThreadPoolTaskExecutor();
        int processNum = Runtime.getRuntime().availableProcessors(); // Trả về số CPU available của JVM
        int corePoolSize = (int) (processNum / (1 - 0.2));
        int maxPoolSize = (int) (processNum / (1 - 0.5));
        threadPoolExecutor.setCorePoolSize(corePoolSize); // Core pool size
        threadPoolExecutor.setMaxPoolSize(maxPoolSize); // Max thread count
        threadPoolExecutor.setQueueCapacity(maxPoolSize * 1000); // Queue length
        threadPoolExecutor.setThreadPriority(Thread.MAX_PRIORITY);
        threadPoolExecutor.setDaemon(false);
        threadPoolExecutor.setKeepAliveSeconds(300);// Thread idle time
        threadPoolExecutor.setThreadNamePrefix("test-Executor-"); // Thread name prefix
        return threadPoolExecutor;
    }
}
```

### Pitfall khi dùng Thread Pool cùng ThreadLocal

Thread pool dùng cùng với `ThreadLocal` có thể khiến thread lấy được giá trị cũ/dirty data từ `ThreadLocal`. Vì thread pool tái sử dụng thread object, static attribute `ThreadLocal` của lớp gắn với thread object cũng bị tái sử dụng, dẫn đến một thread có thể lấy được giá trị `ThreadLocal` của thread khác.

Đừng nghĩ rằng code không hiển thị dùng thread pool là không có thread pool — Web server phổ biến Tomcat dùng thread pool để tăng concurrency, và dùng custom thread pool cải tiến từ Java native thread pool.

Tất nhiên bạn có thể đặt Tomcat thành single-thread xử lý task. Nhưng điều này không phù hợp và ảnh hưởng nghiêm trọng đến tốc độ xử lý.

```properties
server.tomcat.max-threads=1
```

Giải pháp khuyến nghị hơn cho vấn đề trên là dùng `TransmittableThreadLocal` (`TTL`) của Alibaba open source. Lớp `TransmittableThreadLocal` kế thừa và tăng cường lớp `InheritableThreadLocal` tích hợp sẵn trong JDK. Trong tình huống dùng các execution component pool hóa tái sử dụng thread như thread pool, cung cấp chức năng truyền giá trị `ThreadLocal`, giải quyết vấn đề context propagation trong async execution.

Project `TransmittableThreadLocal`: <https://github.com/alibaba/transmittable-thread-local>.
