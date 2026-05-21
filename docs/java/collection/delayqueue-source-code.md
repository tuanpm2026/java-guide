---
title: Phân tích mã nguồn DelayQueue
description: Phân tích chuyên sâu mã nguồn DelayQueue：giải thích nguyên lý triển khai hàng đợi trễ, sử dụng Delayed interface, lập lịch tác vụ trì hoãn, các tình huống ứng dụng như hủy đơn hàng khi hết thời gian, thiết kế thread-safe dựa trên PriorityQueue.
category: Java
tag:
  - Java Collection
head:
  - - meta
    - name: keywords
      content: DelayQueue源码,延迟队列,Delayed接口,延时任务,定时任务,订单超时,PriorityQueue实现
---

## Giới thiệu về DelayQueue

`DelayQueue` là hàng đợi trễ được cung cấp bởi gói JUC (`java.util.concurrent`) để triển khai các tác vụ trì hoãn, ví dụ như hủy đơn hàng chưa thanh toán sau 15 phút. Đây là một dạng `BlockingQueue`, bên dưới là một hàng đợi không giới hạn được triển khai dựa trên `PriorityQueue`, và thread-safe. Về `PriorityQueue` bạn có thể tham khảo bài viết: [Phân tích mã nguồn PriorityQueue](./priorityqueue-source-code.md).

![Các lớp triển khai BlockingQueue](/images/github/javaguide/java/collection/blocking-queue-hierarchy.png)

Các phần tử lưu trong `DelayQueue` bắt buộc phải triển khai interface `Delayed` và cần override phương thức `getDelay()` (để tính xem đã đến hạn chưa).

```java
public interface Delayed extends Comparable<Delayed> {
    long getDelay(TimeUnit unit);
}
```

Theo mặc định, `DelayQueue` sẽ sắp xếp các tác vụ theo thứ tự tăng dần của thời gian đến hạn. Chỉ khi phần tử hết hạn (phương thức `getDelay()` trả về giá trị nhỏ hơn hoặc bằng 0) thì mới có thể lấy ra khỏi hàng đợi.

## Lịch sử phát triển của DelayQueue

- `DelayQueue` được giới thiệu lần đầu trong Java 5, là một phần của gói `java.util.concurrent`, dùng để hỗ trợ lập lịch tác vụ theo thời gian và xóa cache hết hạn. Phiên bản này chỉ hỗ trợ chức năng trì hoãn, chưa giải quyết vấn đề thread-safety.
- Trong Java 6, triển khai của `DelayQueue` được tối ưu hóa, sử dụng `ReentrantLock` và `Condition` để giải quyết thread-safety và hiệu quả tương tác giữa các luồng, cải thiện hiệu năng và độ tin cậy.
- Trong Java 7, triển khai của `DelayQueue` được tối ưu hóa thêm, sử dụng các thao tác CAS để thực hiện thêm và xóa phần tử, cải thiện hiệu năng cho các thao tác đồng thời.
- Trong Java 8, triển khai của `DelayQueue` không có thay đổi lớn, nhưng gói `java.time` đã giới thiệu các lớp thời gian mới như `Duration` và `Instant`, giúp việc lập lịch dựa trên thời gian với `DelayQueue` trở nên thuận tiện và linh hoạt hơn.
- Trong Java 9, triển khai của `DelayQueue` có một số cải tiến nhỏ, chủ yếu là tối ưu hóa và tinh gọn code.

Tóm lại, lịch sử phát triển của `DelayQueue` chủ yếu là tối ưu hóa cách triển khai và cải thiện hiệu năng, độ tin cậy, giúp nó phù hợp hơn với các tình huống lập lịch theo thời gian và xóa cache hết hạn.

## Ví dụ các trường hợp sử dụng phổ biến của DelayQueue

Chúng ta mong muốn các tác vụ có thể được thực thi theo thời gian dự kiến, ví dụ gửi 3 tác vụ yêu cầu thực thi sau 1s, 2s, 3s tương ứng, dù thêm vào theo thứ tự bất kỳ, sau 1s tác vụ yêu cầu 1s vẫn sẽ được thực thi đúng giờ.

![Tác vụ trì hoãn](/images/github/javaguide/java/collection/delayed-task.png)

Để làm điều này, chúng ta có thể sử dụng `DelayQueue`. Trước tiên cần kế thừa `Delayed` để triển khai `DelayedTask`, triển khai phương thức `getDelay` và so sánh độ ưu tiên `compareTo`.

```java
/**
 * 延迟任务
 */
public class DelayedTask implements Delayed {
    /**
     * 任务到期时间
     */
    private long executeTime;
    /**
     * 任务
     */
    private Runnable task;

    public DelayedTask(long delay, Runnable task) {
        this.executeTime = System.currentTimeMillis() + delay;
        this.task = task;
    }

    /**
     * 查看当前任务还有多久到期
     * @param unit
     * @return
     */
    @Override
    public long getDelay(TimeUnit unit) {
        return unit.convert(executeTime - System.currentTimeMillis(), TimeUnit.MILLISECONDS);
    }

    /**
     * 延迟队列需要到期时间升序入队，所以我们需要实现compareTo进行到期时间比较
     * @param o
     * @return
     */
    @Override
    public int compareTo(Delayed o) {
        return Long.compare(this.executeTime, ((DelayedTask) o).executeTime);
    }

    public void execute() {
        task.run();
    }
}
```

Sau khi hoàn thành việc đóng gói tác vụ, việc sử dụng rất đơn giản: chỉ cần đặt thời gian hết hạn rồi gửi tác vụ vào hàng đợi trễ.

```java
// 创建延迟队列，并添加任务
DelayQueue < DelayedTask > delayQueue = new DelayQueue < > ();

//分别添加1s、2s、3s到期的任务
delayQueue.add(new DelayedTask(2000, () -> System.out.println("Task 2")));
delayQueue.add(new DelayedTask(1000, () -> System.out.println("Task 1")));
delayQueue.add(new DelayedTask(3000, () -> System.out.println("Task 3")));

// 取出任务并执行
while (!delayQueue.isEmpty()) {
  //阻塞获取最先到期的任务
  DelayedTask task = delayQueue.take();
  if (task != null) {
    task.execute();
  }
}
```

Từ kết quả đầu ra, ta thấy rằng dù tác vụ hết hạn sau 2s được thêm vào trước, tác vụ Task1 hết hạn sau 1s vẫn được thực thi trước.

```java
Task 1
Task 2
Task 3
```

## Phân tích mã nguồn DelayQueue

Dưới đây lấy JDK1.8 làm ví dụ để phân tích mã nguồn cốt lõi của `DelayQueue`.

Định nghĩa lớp `DelayQueue` như sau:

```java
public class DelayQueue<E extends Delayed> extends AbstractQueue<E> implements BlockingQueue<E>
{
  //...
}
```

`DelayQueue` kế thừa lớp `AbstractQueue` và triển khai interface `BlockingQueue`.

![Sơ đồ lớp DelayQueue](/images/github/javaguide/java/collection/delayqueue-class-diagram.png)

### Các biến thành viên cốt lõi

`DelayQueue` có 4 biến thành viên cốt lõi như sau:

```java
//可重入锁，实现线程安全的关键
private final transient ReentrantLock lock = new ReentrantLock();
//延迟队列底层存储数据的集合,确保元素按照到期时间升序排列
private final PriorityQueue<E> q = new PriorityQueue<E>();

//指向准备执行优先级最高的线程
private Thread leader = null;
//实现多线程之间等待唤醒的交互
private final Condition available = lock.newCondition();
```

- `lock`: Chúng ta đều biết rằng việc truy xuất `DelayQueue` là thread-safe, vì vậy để đảm bảo an toàn luồng khi thêm/lấy phần tử, cần phải khóa. `DelayQueue` sử dụng khóa độc quyền `ReentrantLock` để đảm bảo an toàn luồng cho các thao tác truy xuất.
- `q`: Hàng đợi trễ yêu cầu các phần tử được sắp xếp tăng dần theo thời gian hết hạn, vì vậy khi thêm phần tử cần sắp xếp theo độ ưu tiên. Do đó việc truy xuất phần tử của `DelayQueue` được quản lý thông qua biến thành viên `q` là `PriorityQueue`.
- `leader`: Các tác vụ trong hàng đợi trễ chỉ được thực thi sau khi hết hạn, các tác vụ chưa hết hạn phải chờ. Để đảm bảo tác vụ có độ ưu tiên cao nhất có thể được thực thi ngay khi hết hạn, người thiết kế dùng `leader` để quản lý các tác vụ trì hoãn. Chỉ luồng được `leader` trỏ đến mới có quyền chờ có giới hạn thời gian đến khi tác vụ hết hạn, còn những tác vụ có độ ưu tiên thấp hơn chỉ có thể chờ vô thời hạn cho đến khi luồng `leader` hoàn thành tác vụ trì hoãn hiện tại và đánh thức chúng.
- `available`: Hoạt động chờ và đánh thức được đề cập khi nói về luồng `leader` được thực hiện thông qua `available`. Giả sử luồng 1 cố lấy tác vụ từ `DelayQueue` rỗng, `available` sẽ đưa nó vào hàng đợi chờ. Cho đến khi một luồng nào đó thêm một tác vụ trì hoãn và đánh thức nó thông qua phương thức `signal` của `available`.

### Phương thức khởi tạo

So với các container đồng thời khác, phương thức khởi tạo của hàng đợi trễ khá đơn giản — chỉ có hai phương thức. Vì tất cả biến thành viên đã được khởi tạo khi class được nạp, nên constructor mặc định không làm gì cả. Còn có một constructor nhận đối tượng `Collection`, nó sẽ gọi `addAll()` để lưu các phần tử của collection vào hàng đợi ưu tiên `q`.

```java
public DelayQueue() {}

public DelayQueue(Collection<? extends E> c) {
    this.addAll(c);
}
```

### Thêm phần tử

Dù dùng `add`, `put` hay `offer` để thêm phần tử vào `DelayQueue`, bản chất đều gọi `offer`, vì vậy để hiểu logic thêm phần tử của hàng đợi trễ, chỉ cần đọc phương thức `offer`.

Logic tổng thể của phương thức `offer` như sau:

1. Cố gắng lấy `lock`.
2. Nếu khóa thành công, gọi phương thức `offer` của `q` để lưu phần tử vào hàng đợi ưu tiên.
3. Gọi phương thức `peek` để kiểm tra xem phần tử đầu hàng đợi hiện tại có phải là phần tử vừa được thêm vào không. Nếu đúng thì phần tử này là tác vụ sắp hết hạn (tức là phần tử có độ ưu tiên cao nhất), vì vậy đặt `leader` thành null và thông báo cho các luồng bị chặn do gọi `take` khi hàng đợi trống để tranh giành phần tử.
4. Sau khi hoàn thành các bước trên, giải phóng `lock`.
5. Trả về true.

Mã nguồn như sau, đã được chú thích chi tiết:

```java
public boolean offer(E e) {
    //尝试获取lock
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        //如果上锁成功,则调q的offer方法将元素存放到优先队列中
        q.offer(e);
        //调用peek方法看看当前队首元素是否就是本次入队的元素,如果是则说明当前这个元素是即将到期的任务(即优先级最高的元素)
        if (q.peek() == e) {
            //将leader设置为空,通知调用取元素方法而阻塞的线程来争抢这个任务
            leader = null;
            available.signal();
        }
        return true;
    } finally {
        //上述步骤执行完成，释放lock
        lock.unlock();
    }
}
```

### Lấy phần tử

Cách lấy phần tử trong `DelayQueue` chia thành hai dạng: chặn (blocking) và không chặn (non-blocking). Hãy xem trước phương thức lấy phần tử theo dạng chặn `take` với logic phức tạp hơn. Để giúp bạn hiểu rõ toàn bộ quy trình, chúng ta sẽ lấy ví dụ 3 luồng đồng thời lấy phần tử để mô tả luồng làm việc của `take`.

> Để hiểu nội dung dưới đây, cần có kiến thức về AQS. Khuyến nghị đọc hai bài viết sau:
>
> - [Giải thích AQS bằng hình ảnh, cùng xem mã nguồn AQS…(bài viết khá dài)](https://xie.infoq.cn/article/5a3cc0b709012d40cb9f41986)
> - [Đã đọc AQS xong, không thể bỏ qua nguyên lý Condition!](https://xie.infoq.cn/article/0223d5e5f19726b36b084b10d)

1. Đầu tiên, 3 luồng sẽ cố gắng lấy khóa `lock` tái nhập. Giả sử có 3 luồng t1, t2, t3, t1 lấy được khóa còn t2, t3 không lấy được và được lưu vào hàng đợi chờ.

![](/images/github/javaguide/java/collection/delayqueue-take-0.png)

2. Tiếp theo, t1 bắt đầu thực hiện logic lấy phần tử.

3. Luồng t1 sẽ kiểm tra xem phần tử đầu tiên của hàng đợi `DelayQueue` có rỗng không.

4. Nếu phần tử rỗng, nghĩa là hàng đợi hiện tại không có phần tử nào, t1 sẽ bị chặn và lưu vào hàng đợi `conditionWaiter`.

![](/images/github/javaguide/java/collection/delayqueue-take-1.png)

Lưu ý rằng sau khi gọi `await`, t1 sẽ giải phóng khóa `lock`. Nếu `DelayQueue` tiếp tục rỗng, t2 và t3 cũng sẽ thực hiện logic tương tự và vào hàng đợi `conditionWaiter`.

![](/images/github/javaguide/java/collection/delayqueue-take-2.png)

Nếu phần tử không rỗng, kiểm tra xem tác vụ hiện tại có hết hạn chưa. Nếu đã hết hạn, trả về ngay. Nếu chưa hết hạn, kiểm tra xem luồng `leader` hiện tại (tham chiếu đến luồng duy nhất trong `DelayQueue` có thể chờ và lấy phần tử) có rỗng không. Nếu không rỗng, nghĩa là `leader` đang chờ một phần tử có độ ưu tiên cao hơn phần tử hiện tại hết hạn, nên luồng t1 chỉ có thể gọi `await` để chờ vô thời hạn cho đến khi `leader` lấy được phần tử và đánh thức nó. Ngược lại, nếu luồng `leader` rỗng, đặt luồng hiện tại làm leader và chờ có giới hạn thời gian, khi hết hạn lấy phần tử và trả về.

Đến đây, logic lấy phần tử theo dạng chặn đã hoàn tất. Mã nguồn như sau:

```java
public E take() throws InterruptedException {
    // 尝试获取可重入锁,将底层AQS的state设置为1,并设置为独占锁
    final ReentrantLock lock = this.lock;
    lock.lockInterruptibly();
    try {
        for (;;) {
            //查看队列第一个元素
            E first = q.peek();
            //若为空,则将当前线程放入ConditionObject的等待队列中，并将底层AQS的state设置为0，表示释放锁并进入无限期等待
            if (first == null)
                available.await();
            else {
                //若元素不为空，则查看当前元素多久到期
                long delay = first.getDelay(NANOSECONDS);
                //如果小于0则说明已到期直接返回出去
                if (delay <= 0)
                    return q.poll();
                //如果大于0则说明任务还没到期，首先需要释放对这个元素的引用
                first = null; // don't retain ref while waiting
                //判断leader是否为空，如果不为空，则说明正有线程作为leader并等待一个任务到期，则当前线程进入无限期等待
                if (leader != null)
                    available.await();
                else {
                    //反之将我们的线程成为leader
                    Thread thisThread = Thread.currentThread();
                    leader = thisThread;
                    try {
                        //并进入有限期等待
                        available.awaitNanos(delay);
                    } finally {
                        //等待任务到期时，释放leader引用，进入下一次循环将任务return出去
                        if (leader == thisThread)
                            leader = null;
                    }
                }
            }
        }
    } finally {
        // 收尾逻辑:当leader为null，并且队列中有任务时，唤醒等待的获取元素的线程。
        if (leader == null && q.peek() != null)
            available.signal();
        //释放锁
        lock.unlock();
    }
}
```

Tiếp theo xem phương thức lấy phần tử không chặn `poll`, logic khá đơn giản, các bước như sau:

1. Cố gắng lấy khóa tái nhập.
2. Xem phần tử đầu tiên trong hàng đợi, kiểm tra xem phần tử có rỗng không.
3. Nếu phần tử rỗng hoặc chưa hết hạn, trả về null trực tiếp.
4. Nếu phần tử không rỗng và đã hết hạn, gọi `poll` để trả về.
5. Giải phóng khóa tái nhập `lock`.

Mã nguồn như sau:

```java
public E poll() {
    //尝试获取可重入锁
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        //查看队列第一个元素,判断元素是否为空
        E first = q.peek();

        //若元素为空，或者元素未到期，则直接返回空
        if (first == null || first.getDelay(NANOSECONDS) > 0)
            return null;
        else
            //若元素不为空且到期了，直接调用poll返回出去
            return q.poll();
    } finally {
        //释放可重入锁lock
        lock.unlock();
    }
}
```

### Xem phần tử

Phương thức `peek` được gọi khi lấy phần tử ở các phần trên. `peek` theo đúng nghĩa chỉ là "nhìn lướt qua" phần tử trong hàng đợi, các bước chỉ gồm 4 bước:

1. Khóa.
2. Gọi phương thức `peek` của hàng đợi ưu tiên `q` để xem phần tử ở vị trí 0.
3. Giải phóng khóa.
4. Trả về phần tử.

```java
public E peek() {
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        return q.peek();
    } finally {
        lock.unlock();
    }
}
```

## Các câu hỏi phỏng vấn thường gặp về DelayQueue

### Nguyên lý triển khai của DelayQueue là gì?

`DelayQueue` bên dưới sử dụng hàng đợi ưu tiên `PriorityQueue` để lưu trữ các phần tử, trong khi `PriorityQueue` sử dụng ý tưởng heap nhỏ nhị phân để đảm bảo các phần tử có giá trị nhỏ hơn được xếp trước, điều này giúp `DelayQueue` quản lý độ ưu tiên của các tác vụ trì hoãn rất thuận tiện. Đồng thời, `DelayQueue` sử dụng khóa tái nhập `ReentrantLock` để đảm bảo thread-safety, chỉ một luồng có thể thao tác với hàng đợi trễ tại một thời điểm. Cuối cùng, để triển khai hiệu quả tương tác chờ và đánh thức giữa các luồng, `DelayQueue` còn sử dụng `Condition`, thông qua các phương thức `await` và `signal` của `Condition` để hoàn thành việc chờ và đánh thức giữa các luồng.

### Triển khai của DelayQueue có thread-safe không?

Triển khai của `DelayQueue` là thread-safe. Nó sử dụng `ReentrantLock` để triển khai truy cập loại trừ lẫn nhau và `Condition` để triển khai các thao tác chờ và đánh thức giữa các luồng, đảm bảo tính an toàn và độ tin cậy trong môi trường đa luồng.

### Các trường hợp sử dụng phổ biến của DelayQueue là gì?

`DelayQueue` thường được dùng trong các trường hợp lập lịch tác vụ định thời và xóa cache hết hạn. Trong lập lịch tác vụ định thời, cần đóng gói tác vụ cần thực hiện thành đối tượng tác vụ trì hoãn và thêm vào `DelayQueue`, `DelayQueue` sẽ tự động sắp xếp tăng dần theo thời gian trễ còn lại (theo mặc định) để đảm bảo các tác vụ được thực hiện theo thứ tự thời gian. Đối với tình huống cache hết hạn, sau khi dữ liệu được cache vào bộ nhớ, chúng ta có thể đóng gói key của cache thành một tác vụ xóa có trễ và thêm vào `DelayQueue`. Khi dữ liệu hết hạn, lấy key của tác vụ đó và xóa key đó khỏi bộ nhớ.

### Vai trò của interface Delayed trong DelayQueue là gì?

Interface `Delayed` định nghĩa thời gian trễ còn lại của phần tử (`getDelay`) và quy tắc so sánh giữa các phần tử (interface này kế thừa interface `Comparable`). Nếu muốn phần tử có thể được lưu vào `DelayQueue`, bắt buộc phải triển khai phương thức `getDelay()` và `compareTo()` của interface `Delayed`, nếu không `DelayQueue` không thể biết thời gian còn lại của tác vụ hiện tại và không thể so sánh độ ưu tiên.

### Sự khác biệt giữa DelayQueue và Timer/TimerTask là gì?

Cả `DelayQueue` và `Timer/TimerTask` đều có thể dùng để lập lịch tác vụ định thời, nhưng cách triển khai khác nhau. `DelayQueue` được triển khai dựa trên hàng đợi ưu tiên và thuật toán sắp xếp heap, có thể thực hiện nhiều tác vụ theo thứ tự thời gian; còn `Timer/TimerTask` được triển khai dựa trên luồng đơn, chỉ có thể thực hiện các tác vụ theo thứ tự, nếu một tác vụ mất quá nhiều thời gian sẽ ảnh hưởng đến các tác vụ khác. Ngoài ra, `DelayQueue` còn hỗ trợ thêm và xóa tác vụ động, còn `Timer/TimerTask` chỉ có thể chỉ định tác vụ khi tạo.

## Tài liệu tham khảo

- 《深入理解高并发编程：JDK 核心技术》:
- Nói một lúc về 6 cách triển khai hàng đợi trễ trong Java (diện kiến cả nhà tuyển dụng): <https://www.jb51.net/article/186192.htm>
- Giải thích bằng hình ảnh mã nguồn DelayQueue (java 8) — bí quyết của hàng đợi trễ: <https://blog.csdn.net/every__day/article/details/113810985>
<!-- @include: @article-footer.snippet.md -->
