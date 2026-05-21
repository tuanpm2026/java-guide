---
title: Giải thích chi tiết Java Scheduled Tasks
category: System Design
icon: "time"
description: Giải thích hệ thống về Java scheduled tasks và delayed tasks - Timer, ScheduledThreadPoolExecutor, DelayQueue, Time Wheel, Spring @Scheduled (Cron expression), và so sánh lựa chọn các distributed task scheduling frameworks như Quartz, XXL-JOB, ElasticJob, PowerJob cùng các applicable scenario.
head:
  - - meta
    - name: keywords
      content: scheduled task,Quartz,Elastic-Job,XXL-JOB,PowerJob
---

## Tại sao cần Scheduled Task?

Hãy xem một số business scenario rất phổ biến:

1. Một hệ thống cần backup data lúc 1 giờ sáng.
2. Một sàn thương mại điện tử cần tự động hủy đơn hàng khi user đặt hàng 30 phút mà chưa thanh toán.
3. Một media aggregation platform, cứ 10 phút lại tự động crawl data từ website nào đó để sử dụng.
4. Một blogging platform, hỗ trợ scheduled post.
5. Một fund platform, mỗi tối tính toán thu nhập trong ngày của user và push dữ liệu mới nhất cho user.
6. ……

Các scenario này thường yêu cầu chúng ta làm một việc gì đó vào một thời điểm cụ thể — tức là làm gì đó theo lịch hoặc với delay.

- **Scheduled task**: Thực thi task cụ thể tại thời điểm được chỉ định, ví dụ 8 giờ sáng mỗi ngày, 3 giờ chiều thứ Hai mỗi tuần. Scheduled task có thể dùng để làm các công việc periodic như data backup, log cleanup, report generation.
- **Delayed task**: Thực thi task cụ thể sau một khoảng delay nhất định, ví dụ sau 10 phút, sau 3 tiếng. Delayed task có thể dùng để làm các công việc async như order cancellation, push notification, red packet recall.

Mặc dù hai loại có applicable scenario khác nhau, nhưng core idea của chúng đều là sắp xếp thời gian thực thi task vào một thời điểm trong tương lai để đạt được hiệu quả scheduling mong muốn.

## Single-machine Scheduled Task

### Timer

`java.util.Timer` là một cách triển khai scheduled task đã được hỗ trợ từ JDK 1.3.

`Timer` nội bộ dùng một class gọi là `TaskQueue` để lưu scheduled task — đây là priority queue dựa trên min-heap. `TaskQueue` sẽ sort task theo khoảng cách đến lần thực thi tiếp theo, đảm bảo task ở đỉnh heap được thực thi trước. Như vậy khi cần thực thi task, mỗi lần chỉ cần lấy task ở đỉnh heap ra chạy!

`Timer` sử dụng tương đối đơn giản. Qua cách sau chúng ta có thể tạo scheduled task thực thi sau 1 giây.

```java
// Example code:
TimerTask task = new TimerTask() {
    public void run() {
        System.out.println("Current time: " + new Date() + "n" +
                "Thread name: " + Thread.currentThread().getName());
    }
};
System.out.println("Current time: " + new Date() + "n" +
        "Thread name: " + Thread.currentThread().getName());
Timer timer = new Timer("Timer");
long delay = 1000L;
timer.schedule(task, delay);


// Output:
Current time: Fri May 28 15:18:47 CST 2021nThread name: main
Current time: Fri May 28 15:18:48 CST 2021nThread name: Timer
```

Tuy nhiên nó có nhiều nhược điểm, ví dụ một `Timer` một thread dẫn đến các task của `Timer` chỉ có thể thực thi theo kiểu serial — một task thực thi quá lâu sẽ ảnh hưởng đến task khác (hiệu năng rất kém). Ngoài ra khi xảy ra exception task sẽ dừng trực tiếp (`Timer` chỉ catch `InterruptedException`).

Trên class `Timer` có một comment như thế này:

```JAVA
 * This class does not offer real-time guarantees: it schedules
 * tasks using the <tt>Object.wait(long)</tt> method.
 *Java 5.0 introduced the {@code java.util.concurrent} package and
 * one of the concurrency utilities therein is the {@link
 * java.util.concurrent.ScheduledThreadPoolExecutor
 * ScheduledThreadPoolExecutor} which is a thread pool for repeatedly
 * executing tasks at a given rate or delay.  It is effectively a more
 * versatile replacement for the {@code Timer}/{@code TimerTask}
 * combination, as it allows multiple service threads, accepts various
 * time units, and doesn't require subclassing {@code TimerTask} (just
 * implement {@code Runnable}).  Configuring {@code
 * ScheduledThreadPoolExecutor} with one thread makes it equivalent to
 * {@code Timer}.
```

Đại ý là: `ScheduledThreadPoolExecutor` hỗ trợ multi-thread execution của scheduled task và chức năng mạnh hơn, là thay thế cho `Timer`.

### ScheduledExecutorService

`ScheduledExecutorService` là một interface, có nhiều implementation class. Phổ biến nhất là `ScheduledThreadPoolExecutor`.

![](/images/javaguide/20210607154324712.png)

`ScheduledThreadPoolExecutor` bản thân là một thread pool, hỗ trợ parallel execution của task. Ngoài ra, nó dùng `DelayedWorkQueue` làm task queue.

```java
// Example code:
TimerTask repeatedTask = new TimerTask() {
    @SneakyThrows
    public void run() {
        System.out.println("Current time: " + new Date() + "n" +
                "Thread name: " + Thread.currentThread().getName());
    }
};
System.out.println("Current time: " + new Date() + "n" +
        "Thread name: " + Thread.currentThread().getName());
ScheduledExecutorService executor = Executors.newScheduledThreadPool(3);
long delay  = 1000L;
long period = 1000L;
executor.scheduleAtFixedRate(repeatedTask, delay, period, TimeUnit.MILLISECONDS);
Thread.sleep(delay + period * 5);
executor.shutdown();
// Output:
Current time: Fri May 28 15:40:46 CST 2021nThread name: main
Current time: Fri May 28 15:40:47 CST 2021nThread name: pool-1-thread-1
Current time: Fri May 28 15:40:48 CST 2021nThread name: pool-1-thread-1
Current time: Fri May 28 15:40:49 CST 2021nThread name: pool-1-thread-2
Current time: Fri May 28 15:40:50 CST 2021nThread name: pool-1-thread-2
Current time: Fri May 28 15:40:51 CST 2021nThread name: pool-1-thread-2
Current time: Fri May 28 15:40:52 CST 2021nThread name: pool-1-thread-2
```

Dù dùng `Timer` hay `ScheduledExecutorService` đều không thể dùng Cron expression để chỉ định thời gian thực thi cụ thể của task.

### DelayQueue

`DelayQueue` là delay queue do JUC package (`java.util.concurrent`) cung cấp, dùng để triển khai delayed task như hủy đơn hàng nếu không thanh toán trong 15 phút. Nó là một loại `BlockingQueue`, tầng dưới là unbounded queue dựa trên `PriorityQueue`, thread-safe. Về `PriorityQueue` có thể tham khảo bài tôi viết: [PriorityQueue Source Code Analysis](https://javaguide.cn/java/collection/priorityqueue-source-code.html).

![BlockingQueue implementation classes](/images/github/javaguide/java/collection/blocking-queue-hierarchy.png)

`DelayQueue` và `Timer/TimerTask` đều có thể dùng để triển khai scheduled task scheduling, nhưng cách triển khai khác nhau. `DelayQueue` dựa trên priority queue và heap sort algorithm, có thể triển khai nhiều task thực thi theo thứ tự thời gian; còn `Timer/TimerTask` dựa trên single thread, chỉ có thể thực thi tuần tự theo thứ tự task, một task thực thi quá lâu sẽ ảnh hưởng đến task khác. Ngoài ra, `DelayQueue` còn hỗ trợ dynamic add và remove task, còn `Timer/TimerTask` chỉ có thể chỉ định task khi tạo.

Chi tiết về `DelayQueue`, xem bài tôi viết: [`DelayQueue` Source Code Analysis](https://javaguide.cn/java/collection/delayqueue-source-code.html).

### Spring Task

Chúng ta có thể define scheduled task trực tiếp qua annotation `@Scheduled` do Spring cung cấp — rất tiện!

```java
/**
 * cron: Dùng Cron expression. Chạy vào giây 1, 2 của mỗi phút
 */
@Scheduled(cron = "1-2 * * * * ? ")
public void reportCurrentTimeWithCronExpression() {
  log.info("Cron Expression: The time is now {}", dateFormat.format(new Date()));
}

```

Một project SSM enterprise-level tôi làm hồi đại học cũng dùng Spring Task để làm scheduled task.

Ngoài ra, Spring Task còn hỗ trợ **Cron expression**. Cron expression chủ yếu dùng trong scheduled job (scheduled task) system để define thời gian thực thi hoặc tần suất thực thi — rất mạnh. Bạn có thể dùng Cron expression để đặt scheduled task mỗi ngày hoặc mỗi tháng thực thi khi nào. Khi học scheduled task, Cron expression nhất định phải được chú ý đặc biệt. Khuyến nghị một Cron expression online generator: [http://cron.qqe2.com/](http://cron.qqe2.com/).

Tuy nhiên, scheduling built-in của Spring chỉ hỗ trợ single machine, và chức năng cung cấp khá đơn giản. Trước đây đã viết một bài: [《5 minutes to understand how to Schedule Tasks in Spring Boot》](https://mp.weixin.qq.com/s?__biz=Mzg2OTA0Njk0OA==&mid=2247485563&idx=1&sn=7419341f04036a10b141b74624a3f8c9&chksm=cea247b0f9d5cea6440759e6d49b4e77d06f4c99470243a10c1463834e873ca90266413fbc92&token=2133161636&lang=zh_CN#rd). Bạn chưa biết có thể tham khảo.

Spring Task tầng dưới được triển khai dựa trên `ScheduledThreadPoolExecutor` thread pool của JDK.

**Tổng kết ưu nhược điểm:**

- Ưu điểm: Đơn giản, lightweight, hỗ trợ Cron expression
- Nhược điểm: Chức năng đơn giản

### Time Wheel (Bánh xe thời gian)

Kafka, Dubbo, ZooKeeper, Netty, Caffeine, Akka đều có triển khai Time Wheel.

Time Wheel nói đơn giản là một circular queue (tầng dưới thường dựa trên array), mỗi element (time slot) trong queue có thể lưu một danh sách scheduled task.

Mỗi time slot trong Time Wheel đại diện cho basic time span hoặc time precision của Time Wheel. Nếu time wheel đi một time slot mỗi giây, thì time precision cao nhất của time wheel này là 1 giây (tức là 3s và 3.9s sẽ ở cùng một time slot).

Hình dưới là time wheel với 12 time slot, cần 12s để quay một vòng. Khi chúng ta cần tạo scheduled task thực thi sau 3s, chỉ cần đặt scheduled task vào time slot có index 3. Khi cần tạo scheduled task thực thi sau 9s, chỉ cần đặt vào time slot có index 9.

![](/images/github/javaguide/system-design/schedule-task/one-layers-of-time-wheel.png)

Vậy khi cần tạo scheduled task thực thi sau 13s thì sao? Lúc này có thể giới thiệu khái niệm gọi là **round count/revolution count** — task đó vẫn được đặt vào time slot index 1, nhưng round count của nó là 2.

Ngoài cách tăng round count, còn có **multi-level time wheel** (tương tự đồng hồ). Kafka dùng giải pháp này.

Tôi lấy ví dụ về time wheel trong hình dưới để mọi người dễ hiểu.

![](/images/github/javaguide/system-design/schedule-task/three-layers-of-time-wheel.png)

Time wheel trong hình trên (ms -> s), layer 1 có time precision 1, layer 2 có time precision 20, layer 3 có time precision 400. Giả sử chúng ta cần thêm một task A thực thi sau 350s (thời gian hiện tại là 0s), task này sẽ được đặt vào time slot thứ 350/20=17 của layer 2 (vì time span của layer 2 là 20\*20=400>350).

Sau khi layer 1 quay 17 vòng, 340s đã trôi qua, pointer của layer 2 lúc này đến time slot thứ 17. Lúc này, task trong slot thứ 17 của layer 2 sẽ được chuyển đến layer 1.

Task A hiện tại thực thi sau 10s, vì vậy nó sẽ được chuyển đến time slot thứ 10 của layer 1.

Sự di chuyển giữa các layer này cũng gọi là nâng/hạ cấp time wheel. Tham khảo đồng hồ để hiểu!

**Time Wheel phù hợp hơn với scheduled task scenario có số lượng task lớn, time complexity cho cả write và execution task đều là O(1).**

## Distributed Scheduled Task

### Redis

Redis có thể dùng để làm delayed task. Để triển khai chức năng delayed task dựa trên Redis chỉ có hai giải pháp sau:

1. Redis expiry event monitoring
2. Built-in delay queue của Redisson

Chi tiết về phần nội dung này tôi đặt trong [《Backend Interview High-frequency System Design & Scenario Questions》](https://javaguide.cn/zhuanlan/back-end-interview-high-frequency-system-design-and-scenario-questions.html). Bạn cần có thể vào Planet để đọc. Nội dung quá nhiều, ở đây không chia sẻ lại.

![《Backend Interview High-frequency System Design & Scenario Questions》](/images/xingqiu/back-end-interview-high-frequency-system-design-and-scenario-questions-fengmian.png)

### MQ

Phần lớn message queue như RocketMQ, RabbitMQ đều hỗ trợ scheduled/delayed message. Scheduled message và delayed message thực chất giống nhau — server dựa trên scheduled time được đặt cho message để deliver message đến consumer tại một thời điểm cố định.

Tuy nhiên, trước khi dùng MQ scheduled message nhất định phải đọc kỹ usage limitations để tránh không phù hợp với yêu cầu project. Ví dụ RocketMQ scheduled duration max value mặc định là 24 giờ và không hỗ trợ tùy chỉnh thay đổi, chỉ hỗ trợ 18 level delay và không hỗ trợ arbitrary time.

**Tổng kết ưu nhược điểm:**

- **Ưu điểm**: Có thể integrate với Spring, hỗ trợ distributed, hỗ trợ cluster, hiệu năng tốt
- **Nhược điểm**: Chức năng kém, không linh hoạt, cần đảm bảo message reliability

## Distributed Task Scheduling Frameworks

Nếu chúng ta cần một số advanced features như hỗ trợ sharding và high availability của task trong distributed scenario, chúng ta cần dùng distributed task scheduling framework.

Thông thường, việc thực thi một distributed scheduled task liên quan đến các role sau:

- **Task**: Đương nhiên là task cần thực thi, đây là business logic cụ thể như scheduled post.
- **Scheduler**: Tiếp theo là scheduling center, chủ yếu chịu trách nhiệm quản lý task và phân phối task cho executor.
- **Executor**: Cuối cùng là executor, nhận task được scheduler giao và thực thi.

### Quartz

Một open source task scheduling framework rất nổi tiếng, hoàn toàn viết bằng Java. Quartz có thể nói là ông lớn hoặc tiêu chuẩn tham chiếu trong lĩnh vực Java scheduled task, các task scheduling framework khác cơ bản đều được phát triển dựa trên Quartz. Ví dụ `elastic-job` của Dangdang là distributed scheduling solution được phát triển thứ cấp từ Quartz.

Dùng Quartz có thể integrate với Spring khá tiện lợi, và hỗ trợ dynamic add task và cluster. Nhưng, Quartz dùng cũng khá phiền, API phức tạp.

Ngoài ra, Quartz không có built-in UI management console, nhưng bạn có thể dùng open source project [quartzui](https://github.com/zhaopeiym/quartzui) để giải quyết vấn đề này.

Mặt khác, mặc dù Quartz cũng hỗ trợ distributed task, nhưng nó làm ở database level thông qua database lock mechanism, có rất nhiều nhược điểm như system invasion nghiêm trọng, node load imbalance — có chút "pseudo-distributed" vibe.

**Tổng kết ưu nhược điểm:**

- Ưu điểm: Có thể integrate với Spring, hỗ trợ dynamic add task và cluster.
- Nhược điểm: Distributed support không thân thiện, không hỗ trợ task visualization management, sử dụng phức tạp (so với các framework cùng loại khác).

### Elastic-Job

ElasticJob là distributed scheduling solution mã nguồn mở của Dangdang nhắm đến internet ecosystem và massive task. Bao gồm hai subproject độc lập nhau là ElasticJob-Lite và ElasticJob-Cloud.

So sánh ElasticJob-Lite và ElasticJob-Cloud:

|                     | ElasticJob-Lite | ElasticJob-Cloud     |
| :------------------ | :-------------- | -------------------- |
| Decentralized       | Yes             | No                   |
| Resource allocation | Not supported   | Supported            |
| Job mode            | Resident        | Resident + Transient |
| Deploy dependency   | ZooKeeper       | ZooKeeper + Mesos    |

`ElasticJob` hỗ trợ task sharding và high availability trong distributed scenario, task visualization management và các chức năng khác.

![](/images/github/javaguide/system-design/schedule-task/elasticjob-feature-list.png)

Architecture design của ElasticJob-Lite như hình dưới:

![ElasticJob-Lite architecture design](/images/github/javaguide/system-design/schedule-task/elasticjob-lite-architecture-design.png)

Từ hình trên có thể thấy, Elastic-Job không có khái niệm scheduling center, mà dùng ZooKeeper làm registry center — registry center chịu trách nhiệm coordinate phân phối task đến các node khác nhau.

Scheduled scheduling trong Elastic-Job đều được executor tự trigger, design này cũng gọi là decentralized design (scheduling và processing đều được executor tự hoàn thành).

```java
@Component
@ElasticJobConf(name = "dayJob", cron = "0/10 * * * * ?", shardingTotalCount = 2,
        shardingItemParameters = "0=AAAA,1=BBBB", description = "Simple task", failover = true)
public class TestJob implements SimpleJob {
    @Override
    public void execute(ShardingContext shardingContext) {
        log.info("TestJob name: [{}], sharding count: [{}], param=[{}]", shardingContext.getJobName(), shardingContext.getShardingTotalCount(),
                shardingContext.getShardingParameter());
    }
}
```

**Thông tin liên quan:**

- GitHub: <https://github.com/apache/shardingsphere-elasticjob>
- Official website: <https://shardingsphere.apache.org/elasticjob/index_zh.html>

**Tổng kết ưu nhược điểm:**

- Ưu điểm: Có thể integrate với Spring, hỗ trợ distributed, hỗ trợ cluster, hiệu năng tốt, hỗ trợ task visualization management
- Nhược điểm: Phụ thuộc middleware thêm như Zookeeper (tăng độ phức tạp, giảm reliability, tăng maintenance cost)

### XXL-JOB

`XXL-JOB` ra mắt năm 2015, là distributed task scheduling framework lightweight chất lượng cao, hỗ trợ task visualization management, elastic scaling, task failure retry và alerting, task sharding và các chức năng khác.

![](/images/github/javaguide/system-design/schedule-task/xxljob-feature-list.png)

Theo giới thiệu của `XXL-JOB` official website, nó giải quyết nhiều thiếu sót của Quartz.

> Quartz là ông lớn trong open source job scheduling, là lựa chọn đầu tiên cho job scheduling. Nhưng trong cluster environment, Quartz dùng API để quản lý task — điều này có thể tránh được một số vấn đề, nhưng vẫn tồn tại các vấn đề sau:
>
> - Vấn đề 1: Thao tác task qua API không human-friendly;
> - Vấn đề 2: Cần persist business QuartzJobBean vào database table tầng dưới, system invasion khá nghiêm trọng.
> - Vấn đề 3: Scheduling logic và QuartzJobBean coupled trong cùng một project, điều này gây ra một vấn đề: khi số lượng scheduling task tăng dần, đồng thời scheduling task logic ngày càng nặng, lúc này hiệu năng của scheduling system sẽ bị giới hạn đáng kể bởi business.
> - Vấn đề 4: Tầng dưới của quartz dùng cách "preemptive" lấy DB lock và node lấy thành công chịu trách nhiệm chạy task, sẽ dẫn đến node load chênh lệch rất lớn; còn XXL-JOB thông qua executor triển khai "collaborative distributed" run task, tận dụng đầy đủ ưu thế cluster, load cân bằng giữa các node.
>
> XXL-JOB bổ sung các thiếu sót trên của quartz.

Architecture design của `XXL-JOB` như hình dưới:

![](/images/github/javaguide/system-design/schedule-task/xxljob-architecture-design-v2.1.0.png)

Từ hình trên có thể thấy, `XXL-JOB` bao gồm hai phần lớn là **Scheduling Center** và **Executor**. Scheduling Center chủ yếu chịu trách nhiệm task management, executor management và log management. Executor chủ yếu nhận scheduling signal và xử lý. Ngoài ra, khi Scheduling Center thực hiện task scheduling, nó thông qua self-developed RPC để triển khai.

Khác với decentralized design của Elastic-Job, design của `XXL-JOB` còn được gọi là centralized design (scheduling center schedule nhiều executor thực thi task).

Tương tự `Quartz`, `XXL-JOB` cũng schedule task dựa trên database lock, tồn tại performance bottleneck. Nhưng nhìn chung trong trường hợp task volume không quá lớn, không có ảnh hưởng gì, có thể đáp ứng yêu cầu cơ bản của phần lớn công ty.

Đừng sợ architecture diagram của `XXL-JOB`, thực ra để dùng `XXL-JOB` chỉ cần override `IJobHandler` để customize task execution logic là được — rất dễ dùng!

```java
@JobHandler(value="myApiJobHandler")
@Component
public class MyApiJobHandler extends IJobHandler {

    @Override
    public ReturnT<String> execute(String param) throws Exception {
        //......
        return ReturnT.SUCCESS;
    }
}
```

Cũng có thể define task trực tiếp dựa trên annotation.

```java
@XxlJob("myAnnotationJobHandler")
public ReturnT<String> myAnnotationJobHandler(String param) throws Exception {
  //......
  return ReturnT.SUCCESS;
}
```

![](/images/github/javaguide/system-design/schedule-task/xxljob-admin-task-management.png)

**Thông tin liên quan:**

- GitHub: <https://github.com/xuxueli/xxl-job/>
- Official introduction: <https://www.xuxueli.com/xxl-job/>

**Tổng kết ưu nhược điểm:**

- Ưu điểm: Out-of-the-box (learning cost thấp), integrate với Spring, hỗ trợ distributed, hỗ trợ cluster, hỗ trợ task visualization management.
- Nhược điểm: Không hỗ trợ dynamic add task (nếu nhất định muốn dynamic create task cũng hỗ trợ, xem: [xxl-job issue277](https://github.com/xuxueli/xxl-job/issues/277)).

### PowerJob

Một distributed task scheduling framework rất đáng chú ý — ngôi sao mới trong lĩnh vực distributed task scheduling. Hiện tại đã có nhiều công ty kết nối như OPPO, JD.com, ZTO, Cisco.

Sự ra đời của framework này cũng khá thú vị. Tác giả PowerJob từng intern tại Alibaba, khi đó Alibaba dùng SchedulerX tự phát triển nội bộ (sản phẩm trả phí Alibaba Cloud). Sau khi hết thời gian intern, tác giả PowerJob rời Alibaba. Nghĩ rằng tự phát triển một SchedulerX để phòng khi SchedulerX không đáp ứng được yêu cầu, PowerJob ra đời như vậy.

Câu chuyện về PowerJob, mọi người có thể xem video của tác giả PowerJob [《Tôi và task scheduling middleware của tôi》](https://www.bilibili.com/video/BV1SK411A7F3/). Tóm lại là: "Game không còn gì hay, tôi phải gánh ngọn cờ của next-gen distributed task scheduling and computing framework mới được!"

Vì SchedulerX là sản phẩm trả phí, ở đây tôi không giới thiệu thêm. PowerJob official cũng đã so sánh với QuartZ, XXL-JOB và SchedulerX.

|                                 | QuartZ                                          | xxl-job                                      | SchedulerX 2.0                                            | PowerJob                                                           |
| ------------------------------- | ----------------------------------------------- | -------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| Scheduling type                 | CRON                                            | CRON                                         | CRON, fixed frequency, fixed delay, OpenAPI               | **CRON, fixed frequency, fixed delay, OpenAPI**                    |
| Task type                       | Built-in Java                                   | Built-in Java, GLUE Java, Shell, Python etc. | Built-in Java, external Java (FatJar), Shell, Python etc. | **Built-in Java, external Java (container), Shell, Python etc.**   |
| Distributed computing           | None                                            | Static sharding                              | MapReduce dynamic sharding                                | **MapReduce dynamic sharding**                                     |
| Online task governance          | Not supported                                   | Supported                                    | Supported                                                 | **Supported**                                                      |
| Log whitelist                   | Not supported                                   | Supported                                    | Not supported                                             | **Supported**                                                      |
| Scheduling method & performance | Database lock, performance bottleneck           | Database lock, performance bottleneck        | Unknown                                                   | **Lock-free design, strong performance unlimited**                 |
| Alert monitoring                | None                                            | Email                                        | SMS                                                       | **WebHook, email, DingTalk & custom extension**                    |
| System dependency               | JDBC supported relational DB (MySQL, Oracle...) | MySQL                                        | Paid                                                      | **Any Spring Data JPA supported relational DB (MySQL, Oracle...)** |
| DAG workflow                    | Not supported                                   | Not supported                                | Supported                                                 | **Supported**                                                      |

## Tổng kết giải pháp Scheduled Task

Các giải pháp phổ biến cho single-machine scheduled task gồm `Timer`, `ScheduledExecutorService`, `DelayQueue`, Spring Task và Time Wheel. Phổ biến và được khuyến nghị nhất là Time Wheel. Ngoài ra, những giải pháp single-machine scheduled task này cũng có thể triển khai delayed task.

Redis và MQ mặc dù có thể triển khai distributed scheduled task, nhưng hai cái này bản thân không phải được tạo ra chuyên dùng để làm distributed scheduled task — chúng không cung cấp chức năng distributed scheduled task đầy đủ và mạnh mẽ. Hơn nữa, hai cái không phù hợp lắm để thực thi periodic scheduled task, vì chúng chỉ có thể đảm bảo message được consume một lần chứ không thể nhiều lần. Do đó, chúng phù hợp hơn để thực thi one-time delayed task như order cancellation, red packet recall. Trong project thực tế, MQ delayed task được dùng nhiều hơn, có thể giảm coupling giữa các nghiệp vụ.

Quartz, Elastic-Job, XXL-JOB và PowerJob là những framework được tạo ra chuyên để làm distributed scheduling, cung cấp chức năng distributed scheduled task hoàn thiện và mạnh hơn, phù hợp hơn để thực thi periodic scheduled task. Ngoài Quartz, ba cái còn lại đều hỗ trợ task visualization management.

XXL-JOB ra mắt năm 2015, đã trải qua nhiều năm kiểm nghiệm. XXL-JOB lightweight và sử dụng rất đơn giản. Mặc dù tồn tại performance bottleneck, nhưng trong phần lớn trường hợp, đối với nhu cầu cơ bản của doanh nghiệp là không có ảnh hưởng gì. PowerJob là ngôi sao mới trong lĩnh vực distributed task scheduling, stability của nó vẫn cần tiếp tục theo dõi. ElasticJob do trong architecture design dựa trên Zookeeper, còn XXL-JOB dựa trên database, về mặt hiệu năng ElasticJob nhỉnh hơn một chút.

Bài viết này chưa giới thiệu về actual usage, nhưng không có nghĩa là actual usage không quan trọng. Trước khi viết bài này, tôi đã tự mình viết các Demo tương ứng. Như Quartz, tôi đã dùng từ hồi đại học. Tuy nhiên, để có thể trải nghiệm tốt hơn, tôi đã tự mình trải nghiệm thực tế trên Spring Boot. Nếu bạn chưa thực sự sử dụng một framework nào đó mà đã trực tiếp nói nó không dễ dùng, thì điều đó không có căn cứ.

<!-- @include: @article-footer.snippet.md -->
