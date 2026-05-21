---
title: Giải thích chi tiết về Thread Pool trong Java
description: "Giải thích chi tiết về thread pool Java: phân tích sâu các tham số cốt lõi ThreadPoolExecutor, hệ thống Executor framework, lựa chọn task queue, chiến lược từ chối, nguyên lý hoạt động và best practices."
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: Java线程池,ThreadPoolExecutor,Executor框架,线程池参数,拒绝策略,任务队列,线程池原理
---

<!-- markdownlint-disable MD024 -->

Kỹ thuật pooling chắc hẳn đã không còn xa lạ với mọi người — thread pool, database connection pool, HTTP connection pool, v.v. đều là những ứng dụng của tư tưởng này. Mục tiêu chính của kỹ thuật pooling là giảm chi phí mỗi lần lấy tài nguyên, đồng thời nâng cao hiệu quả sử dụng tài nguyên.

Bài viết này sẽ giới thiệu chi tiết về các khái niệm cơ bản và nguyên lý cốt lõi của thread pool.

## Giới thiệu về Thread Pool

Kỹ thuật pooling chắc hẳn đã không còn xa lạ với mọi người — thread pool, database connection pool, HTTP connection pool, v.v. đều là những ứng dụng của tư tưởng này. Mục tiêu chính của kỹ thuật pooling là giảm chi phí mỗi lần lấy tài nguyên, đồng thời nâng cao hiệu quả sử dụng tài nguyên.

Thread pool cung cấp cơ chế để giới hạn và quản lý tài nguyên (bao gồm việc thực thi một tác vụ). Mỗi thread pool cũng duy trì một số thống kê cơ bản, ví dụ như số lượng tác vụ đã hoàn thành. Việc sử dụng thread pool mang lại những lợi ích chính sau:

1. **Giảm chi phí tài nguyên**: Các thread trong thread pool có thể được tái sử dụng. Khi một thread hoàn thành một tác vụ, nó không bị hủy ngay lập tức mà quay trở lại pool để chờ tác vụ tiếp theo. Điều này tránh được chi phí tạo và hủy thread thường xuyên.
2. **Tăng tốc độ phản hồi**: Vì thread pool thường duy trì một số lượng thread cốt lõi nhất định (hay còn gọi là "nhân viên thường trú"), khi có tác vụ đến, chúng có thể được giao ngay cho các thread đang tồn tại và rảnh rỗi để thực thi, tiết kiệm thời gian tạo thread, giúp tác vụ được xử lý nhanh hơn.
3. **Tăng khả năng quản lý thread**: Thread pool cho phép chúng ta quản lý tập trung các thread trong pool. Chúng ta có thể cấu hình kích thước thread pool (số lượng core thread, số lượng thread tối đa), loại và kích thước task queue, chiến lược từ chối, v.v. Điều này giúp kiểm soát tổng số thread đồng thời, ngăn chặn cạn kiệt tài nguyên, đảm bảo tính ổn định của hệ thống. Đồng thời, thread pool thường cung cấp giao diện giám sát để theo dõi trạng thái hoạt động (ví dụ: bao nhiêu thread đang hoạt động, bao nhiêu tác vụ đang chờ), thuận tiện cho việc tối ưu.

## Giới thiệu về Executor Framework

`Executor` framework được giới thiệu từ Java 5, sau đó việc khởi động thread thông qua `Executor` tốt hơn so với sử dụng phương thức `start` của `Thread`. Ngoài dễ quản lý hơn, hiệu quả hơn (sử dụng thread pool, tiết kiệm chi phí), còn có một điểm quan trọng: giúp tránh vấn đề this escaping.

> This escaping là khi các thread khác giữ tham chiếu đến đối tượng trước khi constructor trả về, gọi các phương thức của đối tượng chưa được khởi tạo hoàn toàn có thể gây ra các lỗi khó hiểu.

`Executor` framework không chỉ bao gồm việc quản lý thread pool mà còn cung cấp thread factory, queue, chiến lược từ chối, v.v., làm cho lập trình đồng thời trở nên đơn giản hơn.

Cấu trúc `Executor` framework chủ yếu gồm ba phần:

**1. Tác vụ (`Runnable` / `Callable`)**

Tác vụ cần thực thi phải triển khai **interface `Runnable`** hoặc **interface `Callable`**. Cả class triển khai **interface `Runnable`** và **interface `Callable`** đều có thể được **`ThreadPoolExecutor`** hoặc **`ScheduledThreadPoolExecutor`** thực thi.

**2. Thực thi tác vụ (`Executor`)**

Như hình dưới đây, bao gồm interface cốt lõi **`Executor`** và interface **`ExecutorService`** kế thừa từ `Executor`. Hai class quan trọng **`ThreadPoolExecutor`** và **`ScheduledThreadPoolExecutor`** triển khai interface **`ExecutorService`**.

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/executor-class-diagram.png)

Tuy đề cập đến nhiều mối quan hệ cấp thấp, nhưng thực tế chúng ta cần quan tâm nhiều hơn đến class `ThreadPoolExecutor`, class này được sử dụng rất thường xuyên trong quá trình sử dụng thread pool thực tế.

**Lưu ý:** Qua việc xem source code của `ScheduledThreadPoolExecutor`, chúng ta thấy `ScheduledThreadPoolExecutor` thực ra kế thừa `ThreadPoolExecutor` và triển khai `ScheduledExecutorService`, còn `ScheduledExecutorService` lại triển khai `ExecutorService`, đúng như sơ đồ quan hệ class chúng ta đã chỉ ra.

Mô tả class `ThreadPoolExecutor`:

```java
//AbstractExecutorService实现了ExecutorService接口
public class ThreadPoolExecutor extends AbstractExecutorService
```

Mô tả class `ScheduledThreadPoolExecutor`:

```java
//ScheduledExecutorService继承ExecutorService接口
public class ScheduledThreadPoolExecutor
        extends ThreadPoolExecutor
        implements ScheduledExecutorService
```

**3. Kết quả tính toán bất đồng bộ (`Future`)**

Interface **`Future`** và class triển khai `Future` là **`FutureTask`** đều có thể đại diện cho kết quả tính toán bất đồng bộ.

Khi chúng ta submit class triển khai **interface `Runnable`** hoặc **interface `Callable`** cho **`ThreadPoolExecutor`** hoặc **`ScheduledThreadPoolExecutor`** thực thi (khi gọi phương thức `submit()` sẽ trả về một đối tượng **`FutureTask`**).

**Sơ đồ sử dụng `Executor` framework**:

![Sơ đồ sử dụng Executor framework](./images/java-thread-pool-summary/Executor框架的使用示意图.png)

1. Thread chính trước tiên phải tạo đối tượng tác vụ triển khai interface `Runnable` hoặc `Callable`.
2. Giao đối tượng triển khai interface `Runnable`/`Callable` đã tạo trực tiếp cho `ExecutorService` thực thi: `ExecutorService.execute(Runnable command)` hoặc submit đối tượng `Runnable` hay `Callable` cho `ExecutorService` thực thi (`ExecutorService.submit(Runnable task)` hoặc `ExecutorService.submit(Callable<T> task)`).
3. Nếu thực thi `ExecutorService.submit(...)`, `ExecutorService` sẽ trả về một đối tượng triển khai interface `Future` (chúng ta cũng đã đề cập đến sự khác biệt giữa `execute()` và `submit()`, `submit()` sẽ trả về một đối tượng `FutureTask`). Vì `FutureTask` triển khai `Runnable`, chúng ta cũng có thể tạo `FutureTask`, sau đó giao trực tiếp cho `ExecutorService` thực thi.
4. Cuối cùng, thread chính có thể thực thi phương thức `FutureTask.get()` để chờ tác vụ hoàn thành. Thread chính cũng có thể thực thi `FutureTask.cancel(boolean mayInterruptIfRunning)` để hủy thực thi tác vụ này.

## Giới thiệu class ThreadPoolExecutor (Quan trọng)

Class triển khai thread pool `ThreadPoolExecutor` là class cốt lõi nhất của `Executor` framework.

### Phân tích tham số thread pool

Class `ThreadPoolExecutor` cung cấp 4 constructor. Hãy xem constructor dài nhất, ba constructor còn lại đều được tạo ra dựa trên constructor này (các constructor khác về cơ bản là constructor có một số tham số mặc định như chiến lược từ chối mặc định là gì).

```java
    /**
     * 用给定的初始参数创建一个新的ThreadPoolExecutor。
     */
    public ThreadPoolExecutor(int corePoolSize,//线程池的核心线程数量
                              int maximumPoolSize,//线程池的最大线程数
                              long keepAliveTime,//当线程数大于核心线程数时，多余的空闲线程存活的最长时间
                              TimeUnit unit,//时间单位
                              BlockingQueue<Runnable> workQueue,//任务队列，用来储存等待执行任务的队列
                              ThreadFactory threadFactory,//线程工厂，用来创建线程，一般默认即可
                              RejectedExecutionHandler handler//拒绝策略，当提交的任务过多而不能及时处理时，我们可以定制策略来处理任务
                               ) {
        if (corePoolSize < 0 ||
            maximumPoolSize <= 0 ||
            maximumPoolSize < corePoolSize ||
            keepAliveTime < 0)
            throw new IllegalArgumentException();
        if (workQueue == null || threadFactory == null || handler == null)
            throw new NullPointerException();
        this.corePoolSize = corePoolSize;
        this.maximumPoolSize = maximumPoolSize;
        this.workQueue = workQueue;
        this.keepAliveTime = unit.toNanos(keepAliveTime);
        this.threadFactory = threadFactory;
        this.handler = handler;
    }
```

Các tham số sau đây rất quan trọng, bạn chắc chắn sẽ dùng đến chúng trong quá trình sử dụng thread pool! Hãy ghi nhớ kỹ.

3 tham số quan trọng nhất của `ThreadPoolExecutor`:

- `corePoolSize`: Khi task queue chưa đạt dung lượng, số lượng thread tối đa có thể chạy đồng thời.
- `maximumPoolSize`: Khi số lượng tác vụ trong task queue đạt dung lượng, số lượng thread có thể chạy đồng thời thay đổi thành số lượng thread tối đa.
- `workQueue`: Khi có tác vụ mới đến, trước tiên sẽ kiểm tra xem số lượng thread hiện đang chạy có đạt đến số lượng core thread không; nếu đã đạt, tác vụ mới sẽ được lưu trong queue.

Các tham số thường gặp khác của `ThreadPoolExecutor`:

- `keepAliveTime`: Khi số lượng thread trong thread pool lớn hơn `corePoolSize`, nếu không có tác vụ mới được submit, các thread ngoài core thread sẽ không bị hủy ngay lập tức mà sẽ chờ đợi, cho đến khi thời gian chờ vượt quá `keepAliveTime` thì mới bị thu hồi và hủy.
- `unit`: Đơn vị thời gian của tham số `keepAliveTime`.
- `threadFactory`: Được dùng khi executor tạo thread mới.
- `handler`: Chiến lược từ chối (sẽ được giới thiệu chi tiết riêng sau).

Hình dưới đây giúp bạn hiểu sâu hơn về mối quan hệ giữa các tham số trong thread pool (Nguồn ảnh: "Thực chiến tối ưu hiệu năng Java"):

![Mối quan hệ giữa các tham số thread pool](https://oss.javaguide.cn/github/javaguide/java/concurrent/relationship-between-thread-pool-parameters.png)

### Trạng thái vòng đời Thread Pool

`ThreadPoolExecutor` sử dụng biến `ctl` (kiểu `AtomicInteger`) để đồng thời quản lý trạng thái chạy và số lượng working thread của thread pool. Thread pool có 5 trạng thái:

- **Đang chạy (`RUNNING`)**: Chấp nhận tác vụ mới và xử lý tác vụ trong queue. Đây là trạng thái khởi tạo sau khi thread pool được tạo.
- **Đóng (`SHUTDOWN`)**: Không nhận tác vụ mới nữa, nhưng vẫn tiếp tục xử lý các tác vụ đã có trong queue. Chuyển sang trạng thái này sau khi gọi `shutdown()`.
- **Dừng (`STOP`)**: Không nhận tác vụ mới, không xử lý tác vụ trong queue, và cố gắng ngắt các tác vụ đang thực thi. Chuyển sang trạng thái này sau khi gọi `shutdownNow()`.
- **Đang dọn dẹp (`TIDYING`)**: Tất cả tác vụ đã kết thúc, số lượng working thread là 0, sắp thực thi phương thức hook `terminated()`.
- **Đã kết thúc (`TERMINATED`)**: Phương thức `terminated()` đã thực thi xong, thread pool hoàn toàn kết thúc.

Trạng thái chỉ có thể chuyển đổi một chiều: Đang chạy (`RUNNING`) → Đóng (`SHUTDOWN`) → Đang dọn dẹp (`TIDYING`) → Đã kết thúc (`TERMINATED`), hoặc Đang chạy (`RUNNING`) → Dừng (`STOP`) → Đang dọn dẹp (`TIDYING`) → Đã kết thúc (`TERMINATED`). Trong trạng thái Đóng (`SHUTDOWN`), gọi thêm `shutdownNow()` cũng sẽ chuyển sang Dừng (`STOP`).

`shutdown()` là "đóng nhẹ nhàng" — ngắt các thread nhàn rỗi, nhưng các tác vụ trong queue vẫn sẽ được thực thi xong. `shutdownNow()` là "đóng cưỡng bức" — cố gắng ngắt tất cả các thread đang chạy và trả về các tác vụ chưa thực thi trong queue dưới dạng `List<Runnable>`. `terminated()` là phương thức hook rỗng, có thể override bằng cách kế thừa `ThreadPoolExecutor` để thực hiện công việc dọn dẹp sau khi thread pool kết thúc.

### Cơ chế Worker Thread

`ThreadPoolExecutor` đóng gói mỗi working thread thành class nội bộ `Worker`. `Worker` kế thừa AQS và triển khai interface `Runnable`.

**Tại sao `Worker` phải kế thừa AQS?** `Worker` triển khai một **exclusive lock không thể tái nhập**, được dùng để phối hợp với `shutdown()` phân biệt thread đang nhàn rỗi hay đang làm việc — Worker đang thực thi tác vụ sẽ giữ lock, `shutdown()` thử `tryLock()` trên mỗi Worker, nếu thất bại tức là thread đó đang làm việc và sẽ không bị ngắt.

**Vòng đời của Worker:**

1. **Tạo**: Khi `execute()` xác định cần tạo thread mới, gọi `addWorker()` để tạo instance `Worker`, bên trong tạo thread thông qua `ThreadFactory`.
2. **Chạy**: Sau khi thread khởi động, vào vòng lặp `while` của `runWorker()`, liên tục lấy tác vụ từ queue qua `getTask()` để thực thi. Core thread dùng `workQueue.take()` (chờ blocking), non-core thread dùng `workQueue.poll(keepAliveTime, unit)` (chờ timeout).
3. **Thoát**: Khi `getTask()` trả về `null`, Worker thoát khỏi vòng lặp và dọn dẹp. Các trường hợp trả về `null` bao gồm: thread pool ở trạng thái Dừng (`STOP`), thread pool ở trạng thái Đóng (`SHUTDOWN`) và queue rỗng, non-core thread chờ timeout, hoặc `maximumPoolSize` bị giảm khi đang chạy. Nếu sau khi thoát số working thread thấp hơn số core, sẽ tự động bổ sung một thread mới.

**Định nghĩa chiến lược từ chối `ThreadPoolExecutor`:**

Khi số lượng thread đang chạy đồng thời đạt đến số lượng thread tối đa và queue cũng đã đầy tác vụ, `ThreadPoolExecutor` định nghĩa một số chiến lược:

- `ThreadPoolExecutor.AbortPolicy`: Ném `RejectedExecutionException` để từ chối xử lý tác vụ mới.
- `ThreadPoolExecutor.CallerRunsPolicy`: Chạy tác vụ trong thread gọi phương thức `execute`, tức là chạy (`run`) tác vụ bị từ chối trực tiếp trong thread gọi `execute`, nếu chương trình thực thi đã đóng, tác vụ sẽ bị loại bỏ. Vì vậy chiến lược này sẽ làm giảm tốc độ submit tác vụ mới, ảnh hưởng đến hiệu suất tổng thể của chương trình. Nếu ứng dụng của bạn có thể chịu được độ trễ này và bạn yêu cầu mọi yêu cầu tác vụ đều phải được thực thi, bạn có thể chọn chiến lược này.
- `ThreadPoolExecutor.DiscardPolicy`: Không xử lý tác vụ mới, loại bỏ trực tiếp.
- `ThreadPoolExecutor.DiscardOldestPolicy`: Chiến lược này sẽ loại bỏ yêu cầu tác vụ chưa xử lý cũ nhất.

Ví dụ:

Spring tạo thread pool qua `ThreadPoolTaskExecutor` hoặc trực tiếp qua constructor của `ThreadPoolExecutor`, khi không chỉ định `RejectedExecutionHandler` để cấu hình thread pool, mặc định sử dụng `AbortPolicy`. Với chiến lược từ chối này, nếu queue đầy, `ThreadPoolExecutor` sẽ ném ngoại lệ `RejectedExecutionException` để từ chối tác vụ mới, điều này có nghĩa là bạn sẽ mất tác vụ đó. Nếu không muốn mất tác vụ, có thể dùng `CallerRunsPolicy`. `CallerRunsPolicy` khác với các chiến lược còn lại — nó không loại bỏ tác vụ và cũng không ném ngoại lệ, mà trả lại tác vụ cho caller, dùng thread của caller để thực thi tác vụ.

```java
public static class CallerRunsPolicy implements RejectedExecutionHandler {

        public CallerRunsPolicy() { }

        public void rejectedExecution(Runnable r, ThreadPoolExecutor e) {
            if (!e.isShutdown()) {
                // 直接主线程执行，而不是线程池中的线程执行
                r.run();
            }
        }
    }
```

### Tình huống thực tế áp dụng 4 chiến lược từ chối

Trên đây đã giới thiệu hành vi cơ bản của 4 chiến lược từ chối tích hợp sẵn. Dưới đây, kết hợp kinh nghiệm sản xuất thực tế, sẽ giải thích mỗi chiến lược phù hợp với tình huống nào:

**`AbortPolicy`**: Phù hợp với nghiệp vụ cốt lõi không chịu được việc mất tác vụ (như thanh toán, chuyển khoản). Khi tác vụ bị từ chối, caller sẽ nhận được `RejectedExecutionException`, phải bắt ngoại lệ này trong code nghiệp vụ và thực hiện bù đắp (như retry hoặc persist vào database để bù đắp sau). "Alibaba Java Development Manual" chỉ ra rằng nếu không cấu hình gì, khi queue đầy sẽ ném ngoại lệ trực tiếp và developer phải xử lý tường minh.

**`CallerRunsPolicy`**: Phù hợp với các tình huống không cho phép mất tác vụ và có thể chấp nhận giảm tốc độ submit. Vì tác vụ được thực thi trong thread của caller, caller không thể submit tác vụ mới trong thời gian này, tạo ra một cơ chế **back-pressure** tự nhiên. Đội kỹ thuật Meituan trong bài "Java线程池实现原理及其在美团业务中的实践" đề cập rằng đây là chiến lược từ chối được sử dụng khá thường xuyên trong nghiệp vụ trực tuyến của họ. Nhưng cần lưu ý: nếu thread submit tác vụ là thread xử lý request của Web container (như Worker thread của Tomcat), sẽ khiến thời gian phản hồi của request đó tăng đáng kể, cần thận trọng trong các tình huống nhạy cảm về độ trễ.

**`DiscardPolicy`**: Phù hợp với đường dẫn không quan trọng nơi tác vụ có thể bị mất, như ghi log bất đồng bộ, báo cáo chỉ số giám sát. Chiến lược này hoàn toàn im lặng (triển khai rỗng), tác vụ bị từ chối sẽ không để lại dấu vết nào, có thể khó phát hiện mất tác vụ khi khắc phục sự cố.

**`DiscardOldestPolicy`**: Phù hợp với các tình huống chỉ quan tâm đến dữ liệu mới nhất, tác vụ cũ có thể bị ghi đè, như đẩy báo giá thời gian thực, thu thập dữ liệu cảm biến. Cần lưu ý: nếu dùng `PriorityBlockingQueue`, `poll()` lấy ra tác vụ có độ ưu tiên cao nhất chứ không phải tác vụ cũ nhất, có thể dẫn đến tác vụ quan trọng bị mất nhầm.

**Cách làm phổ biến trong môi trường sản xuất**: 4 chiến lược tích hợp sẵn trên thường không thể đáp ứng đầy đủ nhu cầu. Framework Dubbo tùy chỉnh chiến lược `AbortPolicyWithReport`, ngoài việc ném ngoại lệ còn dump thông tin tác vụ bị từ chối ra file cục bộ để thuận tiện cho việc khắc phục sau. Đội kỹ thuật Meituan khuyến nghị giám sát và cảnh báo số lần từ chối của thread pool. Các ý tưởng chiến lược tùy chỉnh phổ biến bao gồm: ghi tác vụ bị từ chối vào database hoặc message queue để bù đắp tiêu thụ sau, tăng bộ đếm giám sát để báo cáo lên Prometheus, hoặc gọi `workQueue.put(r)` để blocking chờ queue có chỗ trống (Netty có triển khai tương tự).

### Hai cách tạo Thread Pool

Trong Java, có hai cách chính để tạo thread pool:

**Cách 1: Tạo trực tiếp qua constructor của `ThreadPoolExecutor` (khuyến nghị)**

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/threadpoolexecutor-construtors.png)

Đây là cách được khuyến nghị nhất, vì nó cho phép developer chỉ định rõ ràng các tham số cốt lõi của thread pool, có kiểm soát chi tiết hơn đối với hành vi chạy của thread pool, từ đó tránh rủi ro cạn kiệt tài nguyên.

**Cách 2: Tạo qua class tiện ích `Executors` (không khuyến nghị cho môi trường sản xuất)**

Các phương thức tạo thread pool mà class tiện ích `Executors` cung cấp được hiển thị như hình dưới:

![](https://oss.javaguide.cn/github/javaguide/java/concurrent/executors-new-thread-pool-methods.png)

Có thể thấy, thông qua class tiện ích `Executors` có thể tạo nhiều loại thread pool khác nhau, bao gồm:

- `FixedThreadPool`: Thread pool với số lượng thread cố định. Số lượng thread trong thread pool này luôn không đổi. Khi có tác vụ mới được submit, nếu có thread nhàn rỗi trong pool, nó sẽ được thực thi ngay. Nếu không, tác vụ mới sẽ được lưu tạm trong task queue, chờ khi có thread nhàn rỗi sẽ xử lý tác vụ trong queue.
- `SingleThreadExecutor`: Thread pool chỉ có một thread. Nếu nhiều hơn một tác vụ được submit, tác vụ sẽ được lưu trong task queue, chờ thread nhàn rỗi, thực thi tác vụ trong queue theo thứ tự FIFO.
- `CachedThreadPool`: Thread pool có thể điều chỉnh số lượng thread theo tình hình thực tế. Số lượng thread không cố định, nhưng nếu có thread nhàn rỗi có thể tái sử dụng, sẽ ưu tiên dùng thread có thể tái sử dụng. Nếu tất cả thread đều đang làm việc và có tác vụ mới được submit, sẽ tạo thread mới để xử lý. Tất cả thread sau khi hoàn thành tác vụ hiện tại sẽ trở về pool để tái sử dụng.
- `ScheduledThreadPool`: Thread pool thực thi tác vụ sau một khoảng delay cho trước hoặc thực thi định kỳ.

"Alibaba Java Development Manual" bắt buộc không được dùng `Executors` để tạo thread pool mà phải dùng constructor của `ThreadPoolExecutor`, cách xử lý này giúp developer viết code hiểu rõ hơn về quy tắc hoạt động của thread pool, tránh rủi ro cạn kiệt tài nguyên.

Nhược điểm của đối tượng thread pool trả về từ `Executors` như sau (sẽ được giới thiệu chi tiết sau):

- `FixedThreadPool` và `SingleThreadExecutor`: Dùng blocking queue `LinkedBlockingQueue`, độ dài tối đa của task queue là `Integer.MAX_VALUE`, có thể coi là vô giới hạn, có thể tích lũy số lượng lớn yêu cầu, dẫn đến OOM.
- `CachedThreadPool`: Dùng sync queue `SynchronousQueue`, số lượng thread có thể tạo là `Integer.MAX_VALUE`, nếu số lượng tác vụ quá nhiều và tốc độ thực thi chậm, có thể tạo ra số lượng lớn thread, dẫn đến OOM.
- `ScheduledThreadPool` và `SingleThreadScheduledExecutor`: Dùng delay blocking queue vô giới hạn `DelayedWorkQueue`, độ dài tối đa của task queue là `Integer.MAX_VALUE`, có thể tích lũy số lượng lớn yêu cầu, dẫn đến OOM.

```java
public static ExecutorService newFixedThreadPool(int nThreads) {
    // LinkedBlockingQueue 的默认长度为 Integer.MAX_VALUE，可以看作是无界的
    return new ThreadPoolExecutor(nThreads, nThreads,0L, TimeUnit.MILLISECONDS,new LinkedBlockingQueue<Runnable>());

}

public static ExecutorService newSingleThreadExecutor() {
    // LinkedBlockingQueue 的默认长度为 Integer.MAX_VALUE，可以看作是无界的
    return new FinalizableDelegatedExecutorService (new ThreadPoolExecutor(1, 1,0L, TimeUnit.MILLISECONDS,new LinkedBlockingQueue<Runnable>()));

}

// 同步队列 SynchronousQueue，没有容量，最大线程数是 Integer.MAX_VALUE`
public static ExecutorService newCachedThreadPool() {

    return new ThreadPoolExecutor(0, Integer.MAX_VALUE,60L, TimeUnit.SECONDS,new SynchronousQueue<Runnable>());

}

// DelayedWorkQueue（延迟阻塞队列）
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          new DelayedWorkQueue());
}
```

### Tổng hợp các blocking queue thường dùng trong Thread Pool

Khi có tác vụ mới đến, trước tiên sẽ kiểm tra xem số lượng thread hiện đang chạy có đạt đến số lượng core thread không; nếu đã đạt, tác vụ mới sẽ được lưu trong queue.

Các thread pool khác nhau sẽ chọn các blocking queue khác nhau, chúng ta có thể phân tích kết hợp với các thread pool tích hợp sẵn.

- `LinkedBlockingQueue` với dung lượng `Integer.MAX_VALUE` (unbounded queue): `FixedThreadPool` và `SingleThreadExecutor`. `FixedThreadPool` tối đa chỉ có thể tạo số lượng thread bằng số core thread (số core thread và số thread tối đa bằng nhau), `SingleThreadExecutor` chỉ có thể tạo một thread (cả core thread và thread tối đa đều là 1), task queue của cả hai không bao giờ bị đầy.
- `SynchronousQueue` (sync queue): `CachedThreadPool`. `SynchronousQueue` không có dung lượng, không lưu trữ phần tử, mục đích là đảm bảo rằng với tác vụ được submit, nếu có thread nhàn rỗi thì dùng thread nhàn rỗi để xử lý; nếu không thì tạo thread mới. Tức là, số lượng thread tối đa của `CachedThreadPool` là `Integer.MAX_VALUE`, có thể hiểu là số thread có thể mở rộng vô hạn, có thể tạo ra số lượng lớn thread, dẫn đến OOM.
- `DelayedWorkQueue` (delay blocking queue): `ScheduledThreadPool` và `SingleThreadScheduledExecutor`. Các phần tử nội bộ của `DelayedWorkQueue` không được sắp xếp theo thời gian đưa vào mà sẽ được sắp xếp theo độ dài thời gian delay, bên trong dùng cấu trúc dữ liệu "heap", đảm bảo mỗi lần dequeue là tác vụ có thời gian thực thi sớm nhất trong queue hiện tại. `DelayedWorkQueue` sau khi đầy sẽ tự động mở rộng thêm 1/2 dung lượng hiện tại, tức là không bao giờ blocking, có thể mở rộng tối đa đến `Integer.MAX_VALUE`, nên tối đa chỉ có thể tạo số lượng thread bằng số core thread.

## Phân tích nguyên lý Thread Pool (Quan trọng)

Chúng ta đã giới thiệu `Executor` framework và class `ThreadPoolExecutor` ở trên, bây giờ hãy thực hành bằng cách viết một demo nhỏ của `ThreadPoolExecutor` để ôn lại nội dung trên.

### Code ví dụ Thread Pool

Trước tiên tạo một class triển khai interface `Runnable` (tất nhiên cũng có thể là interface `Callable`, chúng ta sẽ giới thiệu sự khác biệt giữa hai cái sau).

`MyRunnable.java`

```java
import java.util.Date;

/**
 * 这是一个简单的Runnable类，需要大约5秒钟来执行其任务。
 * @author shuang.kou
 */
public class MyRunnable implements Runnable {

    private String command;

    public MyRunnable(String s) {
        this.command = s;
    }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + " Start. Time = " + new Date());
        processCommand();
        System.out.println(Thread.currentThread().getName() + " End. Time = " + new Date());
    }

    private void processCommand() {
        try {
            Thread.sleep(5000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }

    @Override
    public String toString() {
        return this.command;
    }
}

```

Viết chương trình test, ở đây chúng ta dùng cách tạo thread pool bằng constructor của `ThreadPoolExecutor` với tham số tùy chỉnh theo khuyến nghị của Alibaba.

`ThreadPoolExecutorDemo.java`

```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

public class ThreadPoolExecutorDemo {

    private static final int CORE_POOL_SIZE = 5;
    private static final int MAX_POOL_SIZE = 10;
    private static final int QUEUE_CAPACITY = 100;
    private static final Long KEEP_ALIVE_TIME = 1L;
    public static void main(String[] args) {

        //使用阿里巴巴推荐的创建线程池的方式
        //通过ThreadPoolExecutor构造函数自定义参数创建
        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                CORE_POOL_SIZE,
                MAX_POOL_SIZE,
                KEEP_ALIVE_TIME,
                TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(QUEUE_CAPACITY),
                new ThreadPoolExecutor.CallerRunsPolicy());

        for (int i = 0; i < 10; i++) {
            //创建WorkerThread对象（WorkerThread类实现了Runnable 接口）
            Runnable worker = new MyRunnable("" + i);
            //执行Runnable
            executor.execute(worker);
        }
        //终止线程池
        executor.shutdown();
        while (!executor.isTerminated()) {
        }
        System.out.println("Finished all threads");
    }
}

```

Có thể thấy code trên đã chỉ định:

- `corePoolSize`: Số core thread là 5.
- `maximumPoolSize`: Số thread tối đa là 10.
- `keepAliveTime`: Thời gian chờ là 1L.
- `unit`: Đơn vị thời gian chờ là TimeUnit.SECONDS.
- `workQueue`: Task queue là `ArrayBlockingQueue` với dung lượng 100.
- `handler`: Chiến lược từ chối là `CallerRunsPolicy`.

**Kết quả đầu ra**:

```plain
pool-1-thread-3 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-5 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-2 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-1 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-4 Start. Time = Sun Apr 12 11:14:37 CST 2020
pool-1-thread-3 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-4 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-1 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-5 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-1 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-2 End. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-5 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-4 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-3 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-2 Start. Time = Sun Apr 12 11:14:42 CST 2020
pool-1-thread-1 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-4 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-5 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-3 End. Time = Sun Apr 12 11:14:47 CST 2020
pool-1-thread-2 End. Time = Sun Apr 12 11:14:47 CST 2020
Finished all threads  // 任务全部执行完了才会跳出来，因为executor.isTerminated()判断为true了才会跳出while循环，当且仅当调用 shutdown() 方法后，并且所有提交的任务完成后返回为 true

```

### Phân tích nguyên lý Thread Pool

Qua kết quả đầu ra của code trên, chúng ta có thể thấy: **Thread pool trước tiên sẽ thực thi 5 tác vụ, sau đó khi các tác vụ này hoàn thành, sẽ lấy tác vụ mới để thực thi.** Mọi người hãy thử tự phân tích xem chuyện gì đang xảy ra dựa trên nội dung đã học ở trên (tự suy nghĩ một lúc nhé).

Bây giờ, hãy phân tích nội dung đầu ra trên để tìm hiểu sơ qua về nguyên lý thread pool.

Để hiểu nguyên lý thread pool, trước tiên chúng ta cần phân tích phương thức `execute`. Trong code ví dụ, chúng ta dùng `executor.execute(worker)` để submit tác vụ vào thread pool.

Phương thức này rất quan trọng, hãy xem source code của nó:

```java
   // 存放线程池的运行状态 (runState) 和线程池内有效线程的数量 (workerCount)
   private final AtomicInteger ctl = new AtomicInteger(ctlOf(RUNNING, 0));

    private static int workerCountOf(int c) {
        return c & CAPACITY;
    }
    //任务队列
    private final BlockingQueue<Runnable> workQueue;

    public void execute(Runnable command) {
        // 如果任务为null，则抛出异常。
        if (command == null)
            throw new NullPointerException();
        // ctl 中保存的线程池当前的一些状态信息
        int c = ctl.get();

        //  下面会涉及到 3 步 操作
        // 1.首先判断当前线程池中的工作线程总数是否小于 corePoolSize
        // 如果小于的话，通过addWorker(command, true)新建一个线程，并将任务(command)添加到该线程中；然后，启动该线程从而执行任务。
        if (workerCountOf(c) < corePoolSize) {
            if (addWorker(command, true))
                return;
            c = ctl.get();
        }
        // 2.如果当前工作线程总数大于等于 corePoolSize 的时候就会走到这里，表明没有走核心线程的创建分支。
        // 通过 isRunning 方法判断线程池状态，线程池处于 RUNNING 状态并且队列可以加入任务，该任务才会被加入进去
        if (isRunning(c) && workQueue.offer(command)) {
            int recheck = ctl.get();
            // 再次获取线程池状态，如果线程池状态不是 RUNNING 状态就需要从任务队列中移除任务，并尝试判断线程是否全部执行完毕。同时执行拒绝策略。
            if (!isRunning(recheck) && remove(command))
                reject(command);
                // 如果当前工作线程数量为0，新创建一个线程并执行。
            else if (workerCountOf(recheck) == 0)
                addWorker(null, false);
        }
        //3. 通过addWorker(command, false)新建一个线程，并将任务(command)添加到该线程中；然后，启动该线程从而执行任务。
        // 传入 false 代表增加线程时判断当前线程数是否少于 maxPoolSize
        //如果addWorker(command, false)执行失败，则通过reject()执行相应的拒绝策略的内容。
        else if (!addWorker(command, false))
            reject(command);
    }
```

Đây là phân tích sơ lược về toàn bộ luồng (đã đơn giản hóa logic để dễ hiểu):

1. Nếu tổng số working thread hiện tại nhỏ hơn số core thread, sẽ tạo thread mới để thực thi tác vụ.
2. Nếu tổng số working thread hiện tại đã đạt đến số core thread, trước tiên thử đưa tác vụ vào task queue để chờ thực thi.
3. Nếu việc đưa tác vụ vào task queue thất bại (task queue đã đầy) và tổng số working thread hiện tại nhỏ hơn số thread tối đa, tạo một non-core thread mới để thực thi tác vụ.
4. Nếu tổng số working thread hiện tại đã bằng số thread tối đa và task queue cũng không thể tiếp tục nhận tác vụ, tác vụ hiện tại sẽ bị từ chối, chiến lược từ chối sẽ gọi phương thức `RejectedExecutionHandler.rejectedExecution()`.

![Minh họa nguyên lý triển khai thread pool](https://oss.javaguide.cn/github/javaguide/java/concurrent/thread-pool-principle.png)

Trong phương thức `execute`, phương thức `addWorker` được gọi nhiều lần. Phương thức `addWorker` chủ yếu được dùng để tạo working thread mới; nếu trả về true, tức là tạo và khởi động working thread thành công, ngược lại trả về false.

```java
    // 全局锁，并发操作必备
    private final ReentrantLock mainLock = new ReentrantLock();
    // 跟踪线程池的最大大小，只有在持有全局锁mainLock的前提下才能访问此集合
    private int largestPoolSize;
    // 工作线程集合，存放线程池中所有的（活跃的）工作线程，只有在持有全局锁mainLock的前提下才能访问此集合
    private final HashSet<Worker> workers = new HashSet<>();
    //获取线程池状态
    private static int runStateOf(int c)     { return c & ~CAPACITY; }
    //判断线程池的状态是否为 Running
    private static boolean isRunning(int c) {
        return c < SHUTDOWN;
    }


    /**
     * 添加新的工作线程到线程池
     * @param firstTask 要执行
     * @param core参数为true的话表示使用线程池的基本大小，为false使用线程池最大大小
     * @return 添加成功就返回true否则返回false
     */
   private boolean addWorker(Runnable firstTask, boolean core) {
        retry:
        for (;;) {
            //这两句用来获取线程池的状态
            int c = ctl.get();
            int rs = runStateOf(c);

            // Check if queue empty only if necessary.
            if (rs >= SHUTDOWN &&
                ! (rs == SHUTDOWN &&
                   firstTask == null &&
                   ! workQueue.isEmpty()))
                return false;

            for (;;) {
               //获取线程池中工作的线程的数量
                int wc = workerCountOf(c);
                // core参数为false的话表明队列也满了，线程池大小变为 maximumPoolSize
                if (wc >= CAPACITY ||
                    wc >= (core ? corePoolSize : maximumPoolSize))
                    return false;
               //原子操作将workcount的数量加1
                if (compareAndIncrementWorkerCount(c))
                    break retry;
                // 如果线程的状态改变了就再次执行上述操作
                c = ctl.get();
                if (runStateOf(c) != rs)
                    continue retry;
                // else CAS failed due to workerCount change; retry inner loop
            }
        }
        // 标记工作线程是否启动成功
        boolean workerStarted = false;
        // 标记工作线程是否创建成功
        boolean workerAdded = false;
        Worker w = null;
        try {

            w = new Worker(firstTask);
            final Thread t = w.thread;
            if (t != null) {
              // 加锁
                final ReentrantLock mainLock = this.mainLock;
                mainLock.lock();
                try {
                   //获取线程池状态
                    int rs = runStateOf(ctl.get());
                   //rs < SHUTDOWN 如果线程池状态依然为RUNNING,并且线程的状态是存活的话，就会将工作线程添加到工作线程集合中
                  //(rs=SHUTDOWN && firstTask == null)如果线程池状态小于STOP，也就是RUNNING或者SHUTDOWN状态下，同时传入的任务实例firstTask为null，则需要添加到工作线程集合和启动新的Worker
                   // firstTask == null证明只新建线程而不执行任务
                    if (rs < SHUTDOWN ||
                        (rs == SHUTDOWN && firstTask == null)) {
                        if (t.isAlive()) // precheck that t is startable
                            throw new IllegalThreadStateException();
                        workers.add(w);
                       //更新当前工作线程的最大容量
                        int s = workers.size();
                        if (s > largestPoolSize)
                            largestPoolSize = s;
                      // 工作线程是否启动成功
                        workerAdded = true;
                    }
                } finally {
                    // 释放锁
                    mainLock.unlock();
                }
                //// 如果成功添加工作线程，则调用Worker内部的线程实例t的Thread#start()方法启动真实的线程实例
                if (workerAdded) {
                    t.start();
                  /// 标记线程启动成功
                    workerStarted = true;
                }
            }
        } finally {
           // 线程启动失败，需要从工作线程中移除对应的Worker
            if (! workerStarted)
                addWorkerFailed(w);
        }
        return workerStarted;
    }
```

Để biết thêm về nội dung phân tích source code thread pool, khuyến nghị đọc bài viết này: [Phân tích nguyên lý triển khai JUC ThreadPoolExecutor từ source code (4W chữ)](https://www.cnblogs.com/throwable/p/13574306.html).

Bây giờ, hãy quay lại code ví dụ — bây giờ bạn có thể dễ dàng hiểu nguyên lý của nó không?

Nếu chưa hiểu, cũng không sao, có thể xem phân tích của tôi:

> Trong code, chúng ta mô phỏng 10 tác vụ, với số core thread là 5 và dung lượng queue chờ là 100, nên mỗi lần chỉ có thể có 5 tác vụ chạy đồng thời, 5 tác vụ còn lại sẽ được đưa vào queue chờ. Khi một trong 5 tác vụ đang chạy hoàn thành, thread pool sẽ lấy tác vụ mới để thực thi.

### Một số so sánh thường gặp

#### `Runnable` vs `Callable`

`Runnable` đã tồn tại từ Java 1.0, nhưng `Callable` chỉ được giới thiệu trong Java 1.5 với mục đích xử lý các use case mà `Runnable` không hỗ trợ. Interface `Runnable` không trả về kết quả và không throw checked exception, trong khi interface `Callable` có thể. Vì vậy, nếu tác vụ không cần trả về kết quả hay throw exception, khuyến nghị dùng interface `Runnable` để code trông gọn hơn.

Class tiện ích `Executors` có thể chuyển đổi đối tượng `Runnable` thành đối tượng `Callable` (`Executors.callable(Runnable task)` hoặc `Executors.callable(Runnable task, Object result)`).

`Runnable.java`

```java
@FunctionalInterface
public interface Runnable {
   /**
    * 被线程执行，没有返回值也无法抛出异常
    */
    public abstract void run();
}
```

`Callable.java`

```java
@FunctionalInterface
public interface Callable<V> {
    /**
     * 计算结果，或在无法这样做时抛出异常。
     * @return 计算得出的结果
     * @throws 如果无法计算结果，则抛出异常
     */
    V call() throws Exception;
}

```

#### `execute()` vs `submit()`

`execute()` và `submit()` là hai phương thức submit tác vụ vào thread pool, có một số điểm khác biệt:

- **Giá trị trả về**: Phương thức `execute()` dùng để submit tác vụ không cần giá trị trả về. Thường dùng để thực thi tác vụ `Runnable`, không thể biết tác vụ có được thread pool thực thi thành công hay không. Phương thức `submit()` dùng để submit tác vụ cần giá trị trả về. Có thể submit tác vụ `Runnable` hoặc `Callable`. Phương thức `submit()` trả về một đối tượng `Future`, qua đối tượng `Future` này có thể biết tác vụ có thực thi thành công hay không, và lấy giá trị trả về của tác vụ (phương thức `get()` sẽ block thread hiện tại cho đến khi tác vụ hoàn thành, `get(long timeout, TimeUnit unit)` có thêm timeout, nếu tác vụ chưa thực thi xong trong thời gian `timeout` sẽ throw `java.util.concurrent.TimeoutException`).
- **Xử lý ngoại lệ**: Khi dùng phương thức `submit()`, có thể xử lý ngoại lệ được throw trong quá trình thực thi tác vụ qua đối tượng `Future`; còn khi dùng phương thức `execute()`, việc xử lý ngoại lệ cần thực hiện qua `ThreadFactory` tùy chỉnh (đặt `UncaughtExceptionHandler` khi tạo thread trong thread factory) hoặc phương thức `afterExecute()` của `ThreadPoolExecutor`.

Ví dụ 1: Dùng phương thức `get()` để lấy giá trị trả về.

```java
// 这里只是为了演示使用，推荐使用 `ThreadPoolExecutor` 构造方法来创建线程池。
ExecutorService executorService = Executors.newFixedThreadPool(3);

Future<String> submit = executorService.submit(() -> {
    try {
        Thread.sleep(5000L);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return "abc";
});

String s = submit.get();
System.out.println(s);
executorService.shutdown();
```

Đầu ra:

```plain
abc
```

Ví dụ 2: Dùng phương thức `get(long timeout, TimeUnit unit)` để lấy giá trị trả về.

```java
ExecutorService executorService = Executors.newFixedThreadPool(3);

Future<String> submit = executorService.submit(() -> {
    try {
        Thread.sleep(5000L);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return "abc";
});

String s = submit.get(3, TimeUnit.SECONDS);
System.out.println(s);
executorService.shutdown();
```

Đầu ra:

```plain
Exception in thread "main" java.util.concurrent.TimeoutException
  at java.util.concurrent.FutureTask.get(FutureTask.java:205)
```

#### `shutdown()` vs `shutdownNow()`

- **`shutdown()`**: Đóng thread pool, trạng thái thread pool chuyển thành `SHUTDOWN`. Thread pool không nhận tác vụ mới nữa, nhưng các tác vụ trong queue phải được thực thi xong.
- **`shutdownNow()`**: Đóng thread pool, trạng thái thread pool chuyển thành `STOP`. Thread pool sẽ kết thúc tác vụ đang chạy hiện tại, dừng xử lý tác vụ đang chờ và trả về List các tác vụ đang chờ thực thi.

#### `isTerminated()` vs `isShutdown()`

- **`isShutDown`**: Trả về true sau khi gọi phương thức `shutdown()`.
- **`isTerminated`**: Trả về true sau khi gọi phương thức `shutdown()` và tất cả các tác vụ đã submit hoàn thành.

## Một số Thread Pool tích hợp sẵn thường gặp

### FixedThreadPool

#### Giới thiệu

`FixedThreadPool` được gọi là thread pool có thể tái sử dụng với số lượng thread cố định. Hãy xem triển khai liên quan qua source code trong class `Executors`:

```java
   /**
     * 创建一个可重用固定数量线程的线程池
     */
    public static ExecutorService newFixedThreadPool(int nThreads, ThreadFactory threadFactory) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>(),
                                      threadFactory);
    }
```

Ngoài ra còn có một phương thức triển khai `FixedThreadPool` khác, tương tự như trên, nên không trình bày thêm ở đây:

```java
    public static ExecutorService newFixedThreadPool(int nThreads) {
        return new ThreadPoolExecutor(nThreads, nThreads,
                                      0L, TimeUnit.MILLISECONDS,
                                      new LinkedBlockingQueue<Runnable>());
    }
```

Từ source code trên có thể thấy `corePoolSize` và `maximumPoolSize` của `FixedThreadPool` mới tạo đều được đặt thành `nThreads`, tham số `nThreads` này là do chúng ta truyền vào khi sử dụng.

Dù `maximumPoolSize` lớn hơn `corePoolSize`, cũng tối đa chỉ tạo được `corePoolSize` thread. Điều này là vì `FixedThreadPool` dùng `LinkedBlockingQueue` với dung lượng `Integer.MAX_VALUE` (unbounded queue), queue không bao giờ bị đầy.

#### Giới thiệu quá trình thực thi tác vụ

Sơ đồ hoạt động của phương thức `execute()` của `FixedThreadPool` (nguồn ảnh: "Nghệ thuật lập trình đồng thời Java"):

![Sơ đồ hoạt động của phương thức execute() của FixedThreadPool](./images/java-thread-pool-summary/FixedThreadPool.png)

**Giải thích hình trên:**

1. Nếu tổng số working thread hiện tại nhỏ hơn `corePoolSize`, khi có tác vụ mới đến, sẽ tạo thread mới để thực thi tác vụ;
2. Khi tổng số working thread hiện tại đạt `corePoolSize`, khi có tác vụ mới đến, sẽ thêm tác vụ vào `LinkedBlockingQueue`;
3. Sau khi thread trong thread pool hoàn thành tác vụ hiện tại, sẽ liên tục lấy tác vụ từ `LinkedBlockingQueue` trong vòng lặp để thực thi.

#### Tại sao không khuyến nghị dùng `FixedThreadPool`?

Việc `FixedThreadPool` dùng unbounded queue `LinkedBlockingQueue` (dung lượng queue là Integer.MAX_VALUE) làm work queue cho thread pool sẽ có những ảnh hưởng sau đến thread pool:

1. Khi số lượng thread trong thread pool đạt `corePoolSize`, tác vụ mới sẽ chờ trong unbounded queue, do đó số lượng thread trong pool sẽ không vượt quá `corePoolSize`;
2. Vì khi dùng unbounded queue, `maximumPoolSize` sẽ trở thành tham số vô hiệu, do không thể có trường hợp task queue đầy. Vì vậy qua source code tạo `FixedThreadPool` có thể thấy `corePoolSize` và `maximumPoolSize` được đặt bằng nhau.
3. Do điểm 1 và 2, khi dùng unbounded queue, `keepAliveTime` cũng sẽ là tham số vô hiệu;
4. `FixedThreadPool` đang chạy (chưa thực thi `shutdown()` hoặc `shutdownNow()`) sẽ không từ chối tác vụ, khi có nhiều tác vụ sẽ dẫn đến OOM (memory overflow).

### SingleThreadExecutor

#### Giới thiệu

`SingleThreadExecutor` là thread pool chỉ có một thread. Hãy xem **triển khai của SingleThreadExecutor:**

```java
   /**
     *返回只有一个线程的线程池
     */
    public static ExecutorService newSingleThreadExecutor(ThreadFactory threadFactory) {
        return new FinalizableDelegatedExecutorService
            (new ThreadPoolExecutor(1, 1,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>(),
                                    threadFactory));
    }
```

```java
   public static ExecutorService newSingleThreadExecutor() {
        return new FinalizableDelegatedExecutorService
            (new ThreadPoolExecutor(1, 1,
                                    0L, TimeUnit.MILLISECONDS,
                                    new LinkedBlockingQueue<Runnable>()));
    }
```

Từ source code trên có thể thấy `corePoolSize` và `maximumPoolSize` của `SingleThreadExecutor` mới tạo đều được đặt thành 1, các tham số khác giống với `FixedThreadPool`.

#### Giới thiệu quá trình thực thi tác vụ

Sơ đồ hoạt động của `SingleThreadExecutor` (nguồn ảnh: "Nghệ thuật lập trình đồng thời Java"):

![Sơ đồ hoạt động của SingleThreadExecutor](./images/java-thread-pool-summary/SingleThreadExecutor.png)

**Giải thích hình trên**:

1. Nếu số lượng thread đang chạy hiện tại ít hơn `corePoolSize`, sẽ tạo thread mới để thực thi tác vụ;
2. Khi có một thread đang chạy trong thread pool hiện tại, sẽ thêm tác vụ vào `LinkedBlockingQueue`;
3. Sau khi thread thực thi xong tác vụ hiện tại, sẽ liên tục lấy tác vụ từ `LinkedBlockingQueue` trong vòng lặp để thực thi.

#### Tại sao không khuyến nghị dùng `SingleThreadExecutor`?

`SingleThreadExecutor` cũng giống như `FixedThreadPool`, đều dùng `LinkedBlockingQueue` (unbounded queue) với dung lượng `Integer.MAX_VALUE`. Ảnh hưởng của việc `SingleThreadExecutor` dùng unbounded queue làm work queue cũng giống với `FixedThreadPool`. Nói đơn giản, có thể dẫn đến OOM.

### CachedThreadPool

#### Giới thiệu

`CachedThreadPool` là thread pool tạo thread mới theo nhu cầu. Hãy xem triển khai của `CachedThreadPool` qua source code:

```java
    /**
     * 创建一个线程池，根据需要创建新线程，但会在先前构建的线程可用时重用它。
     */
    public static ExecutorService newCachedThreadPool(ThreadFactory threadFactory) {
        return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                      60L, TimeUnit.SECONDS,
                                      new SynchronousQueue<Runnable>(),
                                      threadFactory);
    }

```

```java
    public static ExecutorService newCachedThreadPool() {
        return new ThreadPoolExecutor(0, Integer.MAX_VALUE,
                                      60L, TimeUnit.SECONDS,
                                      new SynchronousQueue<Runnable>());
    }
```

`corePoolSize` của `CachedThreadPool` được đặt thành 0 (rỗng), `maximumPoolSize` được đặt thành `Integer.MAX_VALUE`, tức là vô giới hạn. Điều này có nghĩa là nếu tốc độ submit tác vụ của main thread cao hơn tốc độ xử lý tác vụ của các thread trong `maximumPool`, `CachedThreadPool` sẽ liên tục tạo thread mới. Trong trường hợp cực đoan, điều này có thể dẫn đến cạn kiệt CPU và tài nguyên memory.

#### Giới thiệu quá trình thực thi tác vụ

Sơ đồ thực thi của phương thức `execute()` của `CachedThreadPool` (nguồn ảnh: "Nghệ thuật lập trình đồng thời Java"):

![Sơ đồ thực thi của phương thức execute() của CachedThreadPool](./images/java-thread-pool-summary/CachedThreadPool-execute.png)

**Giải thích hình trên:**

1. Trước tiên thực thi `SynchronousQueue.offer(Runnable task)` để submit tác vụ vào task queue. Nếu trong `maximumPool` hiện tại có thread nhàn rỗi đang thực thi `SynchronousQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS)`, thì main thread thực thi offer kết hợp thành công với thread nhàn rỗi đang thực thi `poll`, main thread giao tác vụ cho thread nhàn rỗi thực thi, phương thức `execute()` thực thi hoàn thành; ngược lại thực hiện bước 2 dưới đây;
2. Khi `maximumPool` ban đầu rỗng, hoặc không có thread nhàn rỗi trong `maximumPool`, sẽ không có thread thực thi `SynchronousQueue.poll(keepAliveTime, TimeUnit.NANOSECONDS)`. Trong trường hợp này, bước 1 sẽ thất bại, lúc này `CachedThreadPool` sẽ tạo thread mới để thực thi tác vụ, phương thức execute thực thi hoàn thành.

#### Tại sao không khuyến nghị dùng `CachedThreadPool`?

`CachedThreadPool` dùng sync queue `SynchronousQueue`, cho phép tạo số lượng thread là `Integer.MAX_VALUE`, có thể tạo ra số lượng lớn thread, dẫn đến OOM.

### ScheduledThreadPool

#### Giới thiệu

`ScheduledThreadPool` được dùng để thực thi tác vụ sau một khoảng delay cho trước hoặc thực thi định kỳ. Loại này trong thực tế hiếm khi được dùng và cũng không khuyến nghị sử dụng, chỉ cần hiểu sơ qua.

```java
public static ScheduledExecutorService newScheduledThreadPool(int corePoolSize) {
    return new ScheduledThreadPoolExecutor(corePoolSize);
}
public ScheduledThreadPoolExecutor(int corePoolSize) {
    super(corePoolSize, Integer.MAX_VALUE, 0, NANOSECONDS,
          new DelayedWorkQueue());
}
```

`ScheduledThreadPool` được tạo thông qua `ScheduledThreadPoolExecutor`, dùng `DelayedWorkQueue` (delay blocking queue) làm task queue của thread pool.

Các phần tử nội bộ của `DelayedWorkQueue` không được sắp xếp theo thời gian đưa vào mà sẽ được sắp xếp theo độ dài thời gian delay, bên trong dùng cấu trúc dữ liệu "heap", đảm bảo mỗi lần dequeue là tác vụ có thời gian thực thi sớm nhất trong queue hiện tại. `DelayedWorkQueue` sau khi đầy sẽ tự động mở rộng thêm 1/2 dung lượng hiện tại, tức là không bao giờ blocking, có thể mở rộng tối đa đến `Integer.MAX_VALUE`, nên tối đa chỉ có thể tạo số lượng thread bằng số core thread.

`ScheduledThreadPoolExecutor` kế thừa `ThreadPoolExecutor`, vì vậy về bản chất việc tạo `ScheduledThreadExecutor` cũng là tạo một thread pool `ThreadPoolExecutor`, chỉ là các tham số truyền vào khác nhau.

```java
public class ScheduledThreadPoolExecutor
        extends ThreadPoolExecutor
        implements ScheduledExecutorService
```

#### So sánh ScheduledThreadPoolExecutor và Timer

- `Timer` nhạy cảm với thay đổi đồng hồ hệ thống, `ScheduledThreadPoolExecutor` thì không;
- `Timer` chỉ có một thread thực thi, do đó tác vụ chạy lâu có thể làm trễ các tác vụ khác. `ScheduledThreadPoolExecutor` có thể cấu hình số lượng thread tùy ý. Ngoài ra, nếu muốn (bằng cách cung cấp `ThreadFactory`), bạn có thể kiểm soát hoàn toàn các thread được tạo;
- Runtime exception được throw trong `TimerTask` sẽ kill một thread, khiến `Timer` chết tức là các tác vụ đã lên lịch sẽ không còn chạy nữa. `ScheduledThreadExecutor` không chỉ bắt runtime exception mà còn cho phép bạn xử lý chúng khi cần (bằng cách override phương thức `afterExecute` của `ThreadPoolExecutor`). Tác vụ throw exception sẽ bị hủy, nhưng các tác vụ khác vẫn tiếp tục chạy.

Để biết thêm về tác vụ định kỳ, hãy xem bài viết: [Java 定时任务详解](https://javaguide.cn/system-design/schedule-task.html).

## Best Practices Thread Pool

Bài viết [Java 线程池最佳实践](https://javaguide.cn/java/concurrent/java-thread-pool-best-practices.html) tổng hợp một số điều cần lưu ý khi sử dụng thread pool, hãy đọc trước khi sử dụng thread pool trong dự án thực tế.

## Tham khảo

- "Nghệ thuật lập trình đồng thời Java"
- [Java Scheduler ScheduledExecutorService ScheduledThreadPoolExecutor Example](https://www.journaldev.com/2340/java-scheduler-scheduledexecutorservice-scheduledthreadpoolexecutor-example "Java Scheduler ScheduledExecutorService ScheduledThreadPoolExecutor Example")
- [java.util.concurrent.ScheduledThreadPoolExecutor Example](https://examples.javacodegeeks.com/core-java/util/concurrent/scheduledthreadpoolexecutor/java-util-concurrent-scheduledthreadpoolexecutor-example/ "java.util.concurrent.ScheduledThreadPoolExecutor Example")
- [ThreadPoolExecutor – Java Thread Pool Example](https://www.journaldev.com/1069/threadpoolexecutor-java-thread-pool-example-executorservice "ThreadPoolExecutor – Java Thread Pool Example")

<!-- @include: @article-footer.snippet.md -->
