---
title: Phân tích mã nguồn ArrayBlockingQueue
description: Phân tích sâu mã nguồn ArrayBlockingQueue：giải thích chi tiết triển khai bounded blocking queue, ứng dụng mô hình producer-consumer, kiểm soát đồng thời bằng ReentrantLock+Condition, cơ chế work queue của thread pool.
category: Java
tag:
  - Java Collection
head:
  - - meta
    - name: keywords
      content: ArrayBlockingQueue源码,阻塞队列,有界队列,生产者消费者模式,ReentrantLock,Condition,线程池工作队列
---

## Giới thiệu về Blocking Queue

### Lịch sử của Blocking Queue

Lịch sử của Java blocking queue có thể bắt nguồn từ phiên bản JDK1.5, khi đó Java platform đã bổ sung `java.util.concurrent`, tức là gói JUC mà chúng ta thường hay nhắc đến, bao gồm các công cụ kiểm soát luồng đồng thời, container đồng thời, atomic class, v.v. Tất nhiên bao gồm cả blocking queue mà bài viết này thảo luận.

Để giải quyết vấn đề chia sẻ dữ liệu giữa các thread trong tình huống concurrency cao, phiên bản JDK1.5 đã xuất hiện `ArrayBlockingQueue` và `LinkedBlockingQueue`. Chúng là các container đồng thời được triển khai theo mô hình producer-consumer. Trong đó, `ArrayBlockingQueue` là bounded queue (hàng đợi có giới hạn), tức là sau khi số lượng phần tử thêm vào đạt đến giới hạn trên, việc thêm tiếp sẽ bị block hoặc ném ngoại lệ. Còn `LinkedBlockingQueue` là queue được cấu thành từ linked list. Chính nhờ đặc tính của linked list, nên `LinkedBlockingQueue` khi thêm phần tử không có nhiều ràng buộc như `ArrayBlockingQueue`. Vì vậy, `LinkedBlockingQueue` có thể tùy chọn thiết lập queue có giới hạn hay không (lưu ý rằng "không có giới hạn" ở đây không có nghĩa là có thể thêm bất kỳ số lượng phần tử nào, mà kích thước mặc định của queue là `Integer.MAX_VALUE`, gần như vô hạn).

Khi Java không ngừng phát triển, một số phiên bản JDK tiếp theo đã cập nhật và hoàn thiện blocking queue khá nhiều:

1. Phiên bản JDK1.6: Thêm `SynchronousQueue`, một blocking queue không lưu trữ phần tử.
2. Phiên bản JDK1.7: Thêm `TransferQueue`, một blocking queue hỗ trợ nhiều thao tác hơn.
3. Phiên bản JDK1.8: Thêm `DelayQueue`, một blocking queue hỗ trợ lấy phần tử có độ trễ.

### Tư tưởng của Blocking Queue

Blocking queue là mô hình producer-consumer điển hình, nó có thể thực hiện các điểm sau:

1. Khi dữ liệu trong blocking queue rỗng, tất cả các consumer thread sẽ bị block, chờ queue không rỗng.
2. Sau khi producer đưa dữ liệu vào queue, queue sẽ thông báo cho consumer rằng queue không rỗng, lúc này consumer có thể vào để tiêu thụ.
3. Khi blocking queue bị đầy do consumer tiêu thụ quá chậm hoặc producer lưu trữ phần tử quá nhanh, không thể chứa phần tử mới, producer sẽ bị block, chờ queue không đầy để tiếp tục lưu trữ phần tử.
4. Sau khi consumer tiêu thụ một phần tử từ queue, queue sẽ thông báo cho producer rằng queue không đầy, producer có thể tiếp tục đưa dữ liệu vào.

Tóm lại: Blocking queue dựa trên hai điều kiện "không rỗng" và "không đầy" để thực hiện tương tác giữa producer và consumer. Mặc dù luồng tương tác này và cơ chế wait-notify rất phức tạp, nhưng may mắn thay Doug Lea đã che giấu các chi tiết của blocking queue. Chúng ta chỉ cần gọi các API như `put`, `take`, `offer`, `poll` để thực hiện sản xuất và tiêu thụ giữa các thread.

Điều này cũng làm cho blocking queue được sử dụng rộng rãi trong phát triển đa thread. Ví dụ phổ biến nhất không gì khác là thread pool của chúng ta. Từ mã nguồn, chúng ta có thể thấy khi core thread không thể xử lý task kịp thời, những task này sẽ được ném vào `workQueue`.

```java
public ThreadPoolExecutor(int corePoolSize,
                            int maximumPoolSize,
                            long keepAliveTime,
                            TimeUnit unit,
                            BlockingQueue<Runnable> workQueue,
                            ThreadFactory threadFactory,
                            RejectedExecutionHandler handler) {// ...}
```

## Các phương thức thường dùng và kiểm thử ArrayBlockingQueue

Sau khi hiểu sơ về lịch sử của blocking queue, chúng ta bắt đầu tập trung thảo luận về container đồng thời mà bài viết này giới thiệu — `ArrayBlockingQueue`. Để hiểu sâu hơn về `ArrayBlockingQueue` sau này, hãy tìm hiểu cách sử dụng `ArrayBlockingQueue` qua một số ví dụ dưới đây.

Hãy xem ví dụ đầu tiên. Ở đây chúng ta dùng hai thread để mô phỏng producer và consumer. Producer sẽ dùng phương thức `put` để sản xuất 10 phần tử cho consumer tiêu thụ. Khi số phần tử trong queue đạt đến giới hạn trên là 5 mà chúng ta đặt, phương thức `put` sẽ bị block. Tương tự, consumer cũng sẽ tiêu thụ phần tử thông qua phương thức `take`. Khi queue rỗng, phương thức `take` sẽ block consumer thread. Ở đây để đảm bảo consumer có thể thoát kịp thời sau khi tiêu thụ 10 phần tử, tác giả dùng countdown latch để kiểm soát kết thúc consumer, producer ở đây chỉ sản xuất 10 phần tử. Sau khi consumer tiêu thụ hết 10 phần tử, nhấn countdown latch, tất cả thread sẽ dừng lại.

```java
public class ProducerConsumerExample {

    public static void main(String[] args) throws InterruptedException {

        // 创建一个大小为 5 的 ArrayBlockingQueue
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);

        // 创建生产者线程
        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 10; i++) {
                    // 向队列中添加元素，如果队列已满则阻塞等待
                    queue.put(i);
                    System.out.println("生产者添加元素：" + i);
                }
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        });

        CountDownLatch countDownLatch = new CountDownLatch(1);

        // 创建消费者线程
        Thread consumer = new Thread(() -> {
            try {
                int count = 0;
                while (true) {

                    // 从队列中取出元素，如果队列为空则阻塞等待
                    int element = queue.take();
                    System.out.println("消费者取出元素：" + element);
                    ++count;
                    if (count == 10) {
                        break;
                    }
                }

                countDownLatch.countDown();
            } catch (InterruptedException e) {
                e.printStackTrace();
            }

        });

        // 启动线程
        producer.start();
        consumer.start();

        // 等待线程结束
        producer.join();
        consumer.join();

        countDownLatch.await();

        producer.interrupt();
        consumer.interrupt();
    }

}
```

Kết quả đầu ra của code như sau. Có thể thấy chỉ khi producer đưa phần tử vào queue, consumer mới có thể tiêu thụ. Điều này có nghĩa là khi không có dữ liệu trong queue, consumer sẽ bị block và chờ queue không rỗng để tiếp tục tiêu thụ.

```cpp
生产者添加元素：1
生产者添加元素：2
消费者取出元素：1
消费者取出元素：2
生产者添加元素：3
消费者取出元素：3
生产者添加元素：4
生产者添加元素：5
消费者取出元素：4
生产者添加元素：6
消费者取出元素：5
生产者添加元素：7
生产者添加元素：8
生产者添加元素：9
生产者添加元素：10
消费者取出元素：6
消费者取出元素：7
消费者取出元素：8
消费者取出元素：9
消费者取出元素：10
```

Sau khi tìm hiểu hai phương thức lưu và lấy `put`, `take` sẽ bị block, chúng ta hãy xem tiếp các phương thức enqueue và dequeue không block trong blocking queue là `offer` và `poll`.

Như dưới đây, chúng ta đặt một blocking queue kích thước 3, chúng ta sẽ thử lưu 4 phần tử vào queue bằng phương thức offer, sau đó thử lấy 4 lần từ queue bằng `poll`.

```cpp
public class OfferPollExample {

    public static void main(String[] args) {
        // 创建一个大小为 3 的 ArrayBlockingQueue
        ArrayBlockingQueue<String> queue = new ArrayBlockingQueue<>(3);

        // 向队列中添加元素
        System.out.println(queue.offer("A"));
        System.out.println(queue.offer("B"));
        System.out.println(queue.offer("C"));

        // 尝试向队列中添加元素，但队列已满，返回 false
        System.out.println(queue.offer("D"));

        // 从队列中取出元素
        System.out.println(queue.poll());
        System.out.println(queue.poll());
        System.out.println(queue.poll());

        // 尝试从队列中取出元素，但队列已空，返回 null
        System.out.println(queue.poll());
    }

}
```

Kết quả đầu ra cuối cùng của code như sau. Có thể thấy do kích thước queue là 3, kết quả lưu 3 lần đầu vào queue là true, lần thứ 4 vì queue đã đầy nên kết quả lưu trả về false. Đây cũng là lý do tại sao phương thức `poll` sau đó chỉ lấy được giá trị của 3 phần tử.

```cpp
true
true
true
false
A
B
C
null
```

Sau khi tìm hiểu về lưu/lấy blocking và non-blocking, chúng ta hãy xem một thao tác khá đặc biệt của blocking queue. Trong một số trường hợp, chúng ta muốn lưu kết quả của blocking queue vào list một lần rồi thực hiện batch operation. Chúng ta có thể dùng phương thức `drainTo` của blocking queue. Phương thức này sẽ lưu tất cả phần tử trong queue vào list một lần. Nếu queue có phần tử và lưu thành công vào list, `drainTo` sẽ trả về số phần tử được chuyển vào list lần này. Ngược lại, nếu queue rỗng, `drainTo` sẽ trả về 0 ngay lập tức.

```java
public class DrainToExample {

    public static void main(String[] args) {
        // 创建一个大小为 5 的 ArrayBlockingQueue
        ArrayBlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);

        // 向队列中添加元素
        queue.add(1);
        queue.add(2);
        queue.add(3);
        queue.add(4);
        queue.add(5);

        // 创建一个 List，用于存储从队列中取出的元素
        List<Integer> list = new ArrayList<>();

        // 从队列中取出所有元素，并添加到 List 中
        queue.drainTo(list);

        // 输出 List 中的元素
        System.out.println(list);
    }

}
```

Kết quả đầu ra của code như sau

```cpp
[1, 2, 3, 4, 5]
```

## Phân tích mã nguồn ArrayBlockingQueue

Đến đây chúng ta đã có ấn tượng cơ bản về cách sử dụng blocking queue. Tiếp theo chúng ta có thể tìm hiểu thêm về cơ chế hoạt động của `ArrayBlockingQueue`.

### Thiết kế tổng thể

Trước khi tìm hiểu chi tiết về `ArrayBlockingQueue`, hãy xem class diagram của `ArrayBlockingQueue`.

![Class diagram của ArrayBlockingQueue](/images/github/javaguide/java/collection/arrayblockingqueue-class-diagram.png)

Từ hình, chúng ta có thể thấy `ArrayBlockingQueue` triển khai interface `BlockingQueue`. Dễ đoán rằng sau khi triển khai interface `BlockingQueue`, `ArrayBlockingQueue` sẽ có các hành vi thao tác thông thường của blocking queue.

Đồng thời, `ArrayBlockingQueue` cũng kế thừa abstract class `AbstractQueue`. Abstract class này kế thừa `AbstractCollection` và `Queue`. Từ đặc tính và ngữ nghĩa của abstract class, chúng ta cũng có thể đoán rằng quan hệ kế thừa này giúp `ArrayBlockingQueue` có các thao tác thông thường của queue.

Vậy chúng ta có thể rút ra kết luận như sau: thông qua việc kế thừa `AbstractQueue` để lấy tất cả các template thao tác queue, thực sự là framework tổng thể của các thao tác enqueue và dequeue. Sau đó `ArrayBlockingQueue` triển khai `BlockingQueue` để lấy các thao tác thông thường của blocking queue và triển khai những thao tác này, điền vào chi tiết của template method trong `AbstractQueue`. Nhờ đó `ArrayBlockingQueue` trở thành một blocking queue hoàn chỉnh.

Để xác nhận điều này, hãy khám phá mã nguồn. Trước tiên hãy xem `AbstractQueue`. Từ quan hệ kế thừa của lớp, chúng ta có thể sơ bộ kết luận rằng nó lấy các phương thức thao tác collection thông thường thông qua `AbstractCollection`, sau đó lấy đặc tính queue thông qua interface `Queue`.

```java
public abstract class AbstractQueue<E>
    extends AbstractCollection<E>
    implements Queue<E> {
       //...
}
```

Đối với các thao tác collection, không gì khác ngoài CRUD. Vì vậy hãy bắt đầu từ phương thức add. Từ mã nguồn, chúng ta có thể thấy nó triển khai phương thức `add` của `AbstractCollection`, logic nội bộ như sau:

1. Gọi phương thức `offer` kế thừa từ interface `Queue`. Nếu `offer` thành công thì trả về `true`.
2. Nếu `offer` thất bại, tức là phần tử hiện tại enqueue thất bại thì ném ngoại lệ ngay lập tức.

```java
public boolean add(E e) {
  if (offer(e))
      return true;
  else
      throw new IllegalStateException("Queue full");
}
```

Trong `AbstractQueue` không có triển khai của `offer` từ `Queue`. Rõ ràng mục đích là đã định nghĩa logic core của `add`, còn chi tiết của `offer` giao cho subclass là `ArrayBlockingQueue` triển khai.

Đến đây, phân tích của chúng ta về abstract class `AbstractQueue` đã kết thúc. Hãy tiếp tục xem interface quan trọng khác mà `ArrayBlockingQueue` triển khai — `BlockingQueue`.

Khi mở `BlockingQueue`, chúng ta có thể thấy interface này cũng kế thừa interface `Queue`. Điều này có nghĩa là nó cũng có tất cả các hành vi của queue. Đồng thời, nó cũng định nghĩa các phương thức mà nó cần triển khai.

```java
public interface BlockingQueue<E> extends Queue<E> {

     //元素入队成功返回true，反之则会抛出异常IllegalStateException
    boolean add(E e);

     //元素入队成功返回true，反之返回false
    boolean offer(E e);

     //元素入队成功则直接返回，如果队列已满元素不可入队则将线程阻塞，因为阻塞期间可能会被打断，所以这里方法签名抛出了InterruptedException
    void put(E e) throws InterruptedException;

   //和上一个方法一样,只不过队列满时只会阻塞单位为unit，时间为timeout的时长，如果在等待时长内没有入队成功则直接返回false。
    boolean offer(E e, long timeout, TimeUnit unit)
        throws InterruptedException;

    //从队头取出一个元素，如果队列为空则阻塞等待，因为会阻塞线程的缘故，所以该方法可能会被打断，所以签名定义了InterruptedException
    E take() throws InterruptedException;

      //取出队头的元素并返回，如果当前队列为空则阻塞等待timeout且单位为unit的时长，如果这个时间段没有元素则直接返回null。
    E poll(long timeout, TimeUnit unit)
        throws InterruptedException;

      //获取队列剩余元素个数
    int remainingCapacity();

     //删除我们指定的对象，如果成功返回true，反之返回false。
    boolean remove(Object o);

    //判断队列中是否包含指定元素
    public boolean contains(Object o);

     //将队列中的元素全部存到指定的集合中
    int drainTo(Collection<? super E> c);

    //转移maxElements个元素到集合中
    int drainTo(Collection<? super E> c, int maxElements);
}
```

Sau khi tìm hiểu các thao tác thông thường của `BlockingQueue`, chúng ta biết rằng `ArrayBlockingQueue` sau khi triển khai và override các phương thức của `BlockingQueue`, điền vào phương thức của `AbstractQueue`. Từ đó chúng ta biết phương thức `offer` trong phương thức `add` của `AbstractQueue` ở trên được triển khai ở đâu rồi.

```java
public boolean add(E e) {
  //AbstractQueue的offer来自下层的ArrayBlockingQueue从BlockingQueue实现并重写的offer方法
  if (offer(e))
      return true;
  else
      throw new IllegalStateException("Queue full");
}
```

### Khởi tạo

Trước khi tìm hiểu chi tiết về `ArrayBlockingQueue`, hãy xem constructor của nó để hiểu quá trình khởi tạo. Từ mã nguồn, chúng ta có thể thấy `ArrayBlockingQueue` có 3 constructor. Constructor core nhất là constructor dưới đây.

```java
// capacity 表示队列初始容量，fair 表示 锁的公平性
public ArrayBlockingQueue(int capacity, boolean fair) {
  //如果设置的队列大小小于0，则直接抛出IllegalArgumentException
  if (capacity <= 0)
      throw new IllegalArgumentException();
  //初始化一个数组用于存放队列的元素
  this.items = new Object[capacity];
  //创建阻塞队列流程控制的锁
  lock = new ReentrantLock(fair);
  //用lock锁创建两个条件控制队列生产和消费
  notEmpty = lock.newCondition();
  notFull =  lock.newCondition();
}
```

Constructor này có hai biến thành viên core là `notEmpty` (không rỗng) và `notFull` (không đầy), cần đặc biệt chú ý. Chúng là chìa khóa để producer và consumer làm việc có trật tự. Điểm này tác giả sẽ giải thích chi tiết trong phần phân tích mã nguồn sau. Ở đây chúng ta chỉ cần tìm hiểu sơ bộ về constructor của blocking queue.

Hai constructor còn lại đều dựa trên constructor trên. Mặc định, chúng ta sẽ sử dụng constructor dưới đây. Constructor này có nghĩa là `ArrayBlockingQueue` sử dụng non-fair lock, tức là sau khi các producer hoặc consumer thread nhận được thông báo, việc tranh giành lock là ngẫu nhiên.

```java
 public ArrayBlockingQueue(int capacity) {
        this(capacity, false);
    }
```

Còn một constructor ít dùng hơn. Sau khi khởi tạo capacity và tính non-fair của lock, nó cung cấp thêm tham số `Collection`. Từ mã nguồn, rõ ràng constructor này đặt các phần tử của collection được truyền từ bên ngoài vào blocking queue khi khởi tạo.

```java
public ArrayBlockingQueue(int capacity, boolean fair,
                              Collection<? extends E> c) {
  //初始化容量和锁的公平性
  this(capacity, fair);

  final ReentrantLock lock = this.lock;
  //上锁并将c中的元素存放到ArrayBlockingQueue底层的数组中
  lock.lock();
  try {
      int i = 0;
      try {
                //遍历并添加元素到数组中
          for (E e : c) {
              checkNotNull(e);
              items[i++] = e;
          }
      } catch (ArrayIndexOutOfBoundsException ex) {
          throw new IllegalArgumentException();
      }
      //记录当前队列容量
      count = i;
                      //更新下一次put或者offer或用add方法添加到队列底层数组的位置
      putIndex = (i == capacity) ? 0 : i;
  } finally {
      //完成遍历后释放锁
      lock.unlock();
  }
}
```

### Lấy và thêm phần tử theo kiểu Blocking

Lấy và thêm phần tử theo kiểu blocking của `ArrayBlockingQueue` tương ứng với mô hình producer-consumer. Mặc dù nó cũng hỗ trợ lấy và thêm phần tử non-blocking (ví dụ phương thức `poll()` và `offer(E e)`, sẽ giới thiệu sau), nhưng thường không sử dụng.

Các phương thức lấy và thêm phần tử theo kiểu blocking của `ArrayBlockingQueue` là:

- `put(E e)`: Chèn phần tử vào queue. Nếu queue đã đầy, phương thức này sẽ block mãi cho đến khi queue có chỗ trống hoặc thread bị interrupt.
- `take()`: Lấy và xóa phần tử ở đầu queue. Nếu queue rỗng, phương thức này sẽ block mãi cho đến khi queue không rỗng hoặc thread bị interrupt.

Chìa khóa triển khai của hai phương thức này là hai condition object `notEmpty` (không rỗng) và `notFull` (không đầy), đã đề cập trong constructor ở trên.

Tiếp theo tác giả dùng hai hình ảnh để giúp mọi người hiểu cách hai điều kiện này được sử dụng trong blocking queue.

![Điều kiện notEmpty của ArrayBlockingQueue](/images/github/javaguide/java/collection/ArrayBlockingQueue-notEmpty-take.png)

Giả sử consumer khởi động trước trong code của chúng ta. Khi nó thấy không có dữ liệu trong queue, điều kiện notEmpty sẽ treo thread này, tức là chờ cho đến khi điều kiện không rỗng để treo lại. Sau đó CPU thực thi đến producer, producer thấy có thể lưu dữ liệu vào queue, nên đưa dữ liệu vào, thông báo điều kiện không rỗng. Lúc này consumer sẽ được đánh thức để lấy giá trị từ queue bằng phương thức `take`.

![Điều kiện notFull của ArrayBlockingQueue](/images/github/javaguide/java/collection/ArrayBlockingQueue-notFull-put.png)

Trong quá trình thực thi tiếp theo, tốc độ sản xuất của producer vượt xa tốc độ tiêu thụ của consumer, producer lấp đầy queue và thử lại lưu dữ liệu vào queue, phát hiện queue đã đầy, blocking queue sẽ treo thread hiện tại, chờ không đầy. Sau đó consumer cầm CPU để tiêu thụ, queue có thể chứa dữ liệu mới, phát ra thông báo không đầy. Lúc này producer đang bị treo sẽ chờ CPU đến để thử lại lưu dữ liệu vào queue.

Sau khi hiểu sơ luồng tương tác dựa trên hai điều kiện của blocking queue, hãy xem mã nguồn của phương thức `put` và `take`.

```java
public void put(E e) throws InterruptedException {
    //确保插入的元素不为null
    checkNotNull(e);
    //加锁
    final ReentrantLock lock = this.lock;
    //这里使用lockInterruptibly()方法而不是lock()方法是为了能够响应中断操作，如果在等待获取锁的过程中被打断则该方法会抛出InterruptedException异常。
    lock.lockInterruptibly();
    try {
            //如果count等数组长度则说明队列已满，当前线程将被挂起放到AQS队列中，等待队列非满时插入（非满条件）。
       //在等待期间，锁会被释放，其他线程可以继续对队列进行操作。
        while (count == items.length)
            notFull.await();
           //如果队列可以存放元素，则调用enqueue将元素入队
        enqueue(e);
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

Phương thức `put` bên trong gọi phương thức `enqueue` để thực hiện enqueue phần tử. Hãy tiếp tục đi sâu xem chi tiết triển khai của phương thức `enqueue`:

```java
private void enqueue(E x) {
   //获取队列底层的数组
    final Object[] items = this.items;
    //将putindex位置的值设置为我们传入的x
    items[putIndex] = x;
    //更新putindex，如果putindex等于数组长度，则更新为0
    if (++putIndex == items.length)
        putIndex = 0;
    //队列长度+1
    count++;
    //通知队列非空，那些因为获取元素而阻塞的线程可以继续工作了
    notEmpty.signal();
}
```

Từ mã nguồn, có thể thấy logic của thao tác enqueue là thêm một phần tử mới vào mảng. Các bước thực thi tổng thể là:

1. Lấy mảng `items` bên dưới `ArrayBlockingQueue`.
2. Lưu phần tử vào vị trí `putIndex`.
3. Cập nhật `putIndex` sang vị trí tiếp theo. Nếu `putIndex` bằng độ dài queue, nghĩa là `putIndex` đã đến cuối mảng. Lần chèn tiếp theo cần bắt đầu từ 0. (`ArrayBlockingQueue` sử dụng tư tưởng circular queue, tức là tái sử dụng một mảng theo vòng từ đầu đến cuối)
4. Cập nhật giá trị `count`, biểu thị độ dài queue hiện tại +1.
5. Gọi `notEmpty.signal()` thông báo queue không rỗng, consumer có thể lấy giá trị từ queue rồi.

Đến đây chúng ta đã hiểu luồng của phương thức `put`. Để hiểu đầy đủ hơn về thiết kế mô hình producer-consumer của `ArrayBlockingQueue`, hãy tiếp tục xem phương thức `take` để lấy phần tử queue theo kiểu blocking.

```java
public E take() throws InterruptedException {
       //获取锁
     final ReentrantLock lock = this.lock;
     lock.lockInterruptibly();
     try {
             //如果队列中元素个数为0，则将当前线程打断并存入AQS队列中，等待队列非空时获取并移除元素（非空条件）
         while (count == 0)
             notEmpty.await();
            //如果队列不为空则调用dequeue获取元素
         return dequeue();
     } finally {
          //释放锁
         lock.unlock();
     }
}
```

Hiểu phương thức `put` rồi xem `take` thì rất đơn giản. Logic core của nó hoàn toàn ngược với phương thức `put`. Ví dụ `put` chờ queue không đầy để chèn phần tử (điều kiện không đầy), còn `take` chờ queue không rỗng để lấy và xóa phần tử (điều kiện không rỗng).

Phương thức `take` bên trong gọi phương thức `dequeue` để thực hiện dequeue phần tử. Logic core của nó cũng ngược với phương thức `enqueue`.

```java
private E dequeue() {
  //获取阻塞队列底层的数组
  final Object[] items = this.items;
  @SuppressWarnings("unchecked")
  //从队列中获取takeIndex位置的元素
  E x = (E) items[takeIndex];
  //将takeIndex置空
  items[takeIndex] = null;
  //takeIndex向后挪动，如果等于数组长度则更新为0
  if (++takeIndex == items.length)
      takeIndex = 0;
  //队列长度减1
  count--;
  if (itrs != null)
      itrs.elementDequeued();
  //通知那些被打断的线程当前队列状态非满，可以继续存放元素
  notFull.signal();
  return x;
}
```

Vì phương thức `dequeue` (dequeue) và phương thức `enqueue` (enqueue) được giới thiệu ở trên có các bước đại khái tương tự, ở đây không giới thiệu lại nữa.

Để giúp hiểu, tôi đã vẽ một hình ảnh đặc biệt để thể hiện cách hai condition object `notEmpty` (không rỗng) và `notFull` (không đầy) kiểm soát việc lưu và lấy của `ArrayBlockingQueue`.

![notEmpty và notFull của ArrayBlockingQueue](/images/github/javaguide/java/collection/ArrayBlockingQueue-notEmpty-notFull.png)

- **Consumer**: Sau khi consumer lấy một phần tử từ queue bằng các thao tác `take` hoặc `poll`, sẽ thông báo queue không đầy. Lúc này những producer đang chờ không đầy sẽ được đánh thức, chờ CPU để thực hiện enqueue.
- **Producer**: Sau khi producer lưu phần tử vào queue, sẽ kích hoạt thông báo queue không rỗng. Lúc này consumer sẽ được đánh thức, chờ CPU để thử lấy phần tử. Cứ như vậy lặp đi lặp lại, hai condition object tạo thành một vòng lặp, kiểm soát việc lưu và lấy giữa các thread.

### Lấy và thêm phần tử theo kiểu Non-blocking

Các phương thức lấy và thêm phần tử non-blocking của `ArrayBlockingQueue` là:

- `offer(E e)`: Chèn phần tử vào cuối queue. Nếu queue đã đầy, phương thức này sẽ trả về false ngay lập tức mà không chờ và block thread.
- `poll()`: Lấy và xóa phần tử đầu queue. Nếu queue rỗng, phương thức này sẽ trả về null ngay lập tức mà không chờ và block thread.
- `add(E e)`: Chèn phần tử vào cuối queue. Nếu queue đã đầy sẽ ném ngoại lệ `IllegalStateException`. Bên dưới dựa trên phương thức `offer(E e)`.
- `remove()`: Xóa phần tử đầu queue. Nếu queue rỗng sẽ ném ngoại lệ `NoSuchElementException`. Bên dưới dựa trên `poll()`.
- `peek()`: Lấy nhưng không xóa phần tử đầu queue. Nếu queue rỗng, phương thức này sẽ trả về null ngay lập tức mà không chờ và block thread.

Hãy xem phương thức `offer` trước. Logic tương tự `put`, điểm khác biệt duy nhất là khi enqueue thất bại không block thread hiện tại mà trả về `false` ngay lập tức.

```java
public boolean offer(E e) {
        //确保插入的元素不为null
        checkNotNull(e);
        //获取锁
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
             //队列已满直接返回false
            if (count == items.length)
                return false;
            else {
                //反之将元素入队并直接返回true
                enqueue(e);
                return true;
            }
        } finally {
            //释放锁
            lock.unlock();
        }
    }
```

Tương tự với phương thức `poll`. Lấy phần tử thất bại cũng trả về null ngay lập tức, không block thread lấy phần tử.

```java
public E poll() {
        final ReentrantLock lock = this.lock;
        //上锁
        lock.lock();
        try {
            //如果队列为空直接返回null，反之出队返回元素值
            return (count == 0) ? null : dequeue();
        } finally {
            lock.unlock();
        }
    }
```

Phương thức `add` thực ra là bọc thêm một lớp cho `offer`. Như code dưới đây, có thể thấy `add` sẽ gọi `offer` không có giới hạn thời gian. Nếu enqueue thất bại thì ném ngoại lệ ngay lập tức.

```java
public boolean add(E e) {
        return super.add(e);
    }


public boolean add(E e) {
        //调用offer方法如果失败直接抛出异常
        if (offer(e))
            return true;
        else
            throw new IllegalStateException("Queue full");
    }
```

Tương tự với phương thức `remove`. Gọi `poll`, nếu trả về `null` thì queue không có phần tử, ném ngoại lệ ngay lập tức.

```java
public E remove() {
        E x = poll();
        if (x != null)
            return x;
        else
            throw new NoSuchElementException();
    }
```

Logic của phương thức `peek()` cũng rất đơn giản. Bên trong gọi phương thức `itemAt`.

```java
public E peek() {
        //加锁
        final ReentrantLock lock = this.lock;
        lock.lock();
        try {
            //当队列为空时返回 null
            return itemAt(takeIndex);
        } finally {
            //释放锁
            lock.unlock();
        }
    }

//返回队列中指定位置的元素
@SuppressWarnings("unchecked")
final E itemAt(int i) {
    return (E) items[i];
}
```

### Lấy và thêm phần tử theo kiểu Blocking với Timeout

Dựa trên các phương thức `offer(E e)` và `poll()` để lấy và thêm phần tử non-blocking, người thiết kế đã cung cấp `offer(E e, long timeout, TimeUnit unit)` và `poll(long timeout, TimeUnit unit)` có thời gian chờ, dùng để thêm và lấy phần tử theo kiểu blocking trong thời gian timeout được chỉ định.

```java
 public boolean offer(E e, long timeout, TimeUnit unit)
        throws InterruptedException {

        checkNotNull(e);
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
        //队列已满，进入循环
            while (count == items.length) {
            //时间到了队列还是满的，则直接返回false
                if (nanos <= 0)
                    return false;
                 //阻塞nanos时间，等待非满
                nanos = notFull.awaitNanos(nanos);
            }
            enqueue(e);
            return true;
        } finally {
            lock.unlock();
        }
    }
```

Có thể thấy, phương thức `offer` có timeout khi queue đã đầy sẽ chờ đến khoảng thời gian người dùng truyền vào. Nếu trong thời gian quy định vẫn không thể lưu phần tử thì trả về `false` ngay lập tức.

```java
public E poll(long timeout, TimeUnit unit) throws InterruptedException {
        long nanos = unit.toNanos(timeout);
        final ReentrantLock lock = this.lock;
        lock.lockInterruptibly();
        try {
          //队列为空，循环等待，若时间到还是空的，则直接返回null
            while (count == 0) {
                if (nanos <= 0)
                    return null;
                nanos = notEmpty.awaitNanos(nanos);
            }
            return dequeue();
        } finally {
            lock.unlock();
        }
    }
```

Tương tự, phương thức `poll` có timeout cũng vậy. Queue rỗng thì chờ trong thời gian quy định. Nếu hết thời gian vẫn rỗng thì trả về null ngay lập tức.

### Kiểm tra phần tử có tồn tại hay không

`ArrayBlockingQueue` cung cấp `contains(Object o)` để kiểm tra xem phần tử được chỉ định có tồn tại trong queue không.

```java
public boolean contains(Object o) {
    //若目标元素为空，则直接返回 false
    if (o == null) return false;
    //获取当前队列的元素数组
    final Object[] items = this.items;
    //加锁
    final ReentrantLock lock = this.lock;
    lock.lock();
    try {
        // 如果队列非空
        if (count > 0) {
            final int putIndex = this.putIndex;
            //从队列头部开始遍历
            int i = takeIndex;
            do {
                if (o.equals(items[i]))
                    return true;
                if (++i == items.length)
                    i = 0;
            } while (i != putIndex);
        }
        return false;
    } finally {
        //释放锁
        lock.unlock();
    }
}
```

## So sánh các phương thức lấy và thêm phần tử của ArrayBlockingQueue

Để giúp hiểu `ArrayBlockingQueue`, hãy so sánh các phương thức lấy và thêm phần tử đã đề cập ở trên.

Thêm phần tử:

| Phương thức                               | Cách xử lý khi queue đầy                                                                            | Giá trị trả về |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------- |
| `put(E e)`                                | Thread bị block, cho đến khi bị interrupt hoặc được đánh thức                                       | void           |
| `offer(E e)`                              | Trả về false ngay lập tức                                                                           | boolean        |
| `offer(E e, long timeout, TimeUnit unit)` | Block trong thời gian timeout được chỉ định. Nếu vượt thời gian vẫn chưa thêm được thì trả về false | boolean        |
| `add(E e)`                                | Ném ngoại lệ `IllegalStateException` ngay lập tức                                                   | boolean        |

Lấy/Xóa phần tử:

| Phương thức                         | Cách xử lý khi queue rỗng                                                                | Giá trị trả về |
| ----------------------------------- | ---------------------------------------------------------------------------------------- | -------------- |
| `take()`                            | Thread bị block, cho đến khi bị interrupt hoặc được đánh thức                            | E              |
| `poll()`                            | Trả về null                                                                              | E              |
| `poll(long timeout, TimeUnit unit)` | Block trong thời gian timeout được chỉ định. Nếu vượt thời gian vẫn rỗng thì trả về null | E              |
| `peek()`                            | Trả về null                                                                              | E              |
| `remove()`                          | Ném ngoại lệ `NoSuchElementException` ngay lập tức                                       | boolean        |

![](/images/github/javaguide/java/collection/ArrayBlockingQueue-get-add-element-methods.png)

## Câu hỏi phỏng vấn liên quan đến ArrayBlockingQueue

### ArrayBlockingQueue là gì? Các đặc điểm của nó?

`ArrayBlockingQueue` là class triển khai bounded queue của interface `BlockingQueue`, thường được sử dụng để chia sẻ dữ liệu giữa các thread. Bên dưới sử dụng mảng để triển khai, nhìn tên là biết rồi.

Capacity (dung lượng) của `ArrayBlockingQueue` có giới hạn. Một khi được tạo, capacity không thể thay đổi.

Để đảm bảo thread safety, kiểm soát đồng thời của `ArrayBlockingQueue` sử dụng reentrant lock `ReentrantLock`. Dù là thao tác chèn hay thao tác đọc, đều cần lấy được lock mới có thể thực hiện thao tác. Hơn nữa, nó còn hỗ trợ hai phương thức truy cập lock là fair và non-fair, mặc định là non-fair lock.

Mặc dù `ArrayBlockingQueue` được gọi là blocking queue, nhưng cũng hỗ trợ lấy và thêm phần tử non-blocking (ví dụ phương thức `poll()` và `offer(E e)`). Chỉ là khi queue đầy thêm phần tử sẽ ném ngoại lệ, khi queue rỗng phần tử lấy được là null. Thường không sử dụng.

### ArrayBlockingQueue và LinkedBlockingQueue khác nhau như thế nào?

`ArrayBlockingQueue` và `LinkedBlockingQueue` là hai loại blocking queue thường dùng trong Java concurrent package, cả hai đều thread-safe. Tuy nhiên, chúng có một số điểm khác biệt:

- Triển khai bên dưới: `ArrayBlockingQueue` dựa trên mảng, còn `LinkedBlockingQueue` dựa trên linked list.
- Có giới hạn hay không: `ArrayBlockingQueue` là bounded queue, phải chỉ định capacity khi tạo. `LinkedBlockingQueue` khi tạo có thể không chỉ định capacity, mặc định là `Integer.MAX_VALUE`, tức là không giới hạn. Nhưng cũng có thể chỉ định kích thước queue để trở thành bounded.
- Lock có tách biệt hay không: Lock trong `ArrayBlockingQueue` không được tách biệt, tức là sản xuất và tiêu thụ dùng cùng một lock. Lock trong `LinkedBlockingQueue` được tách biệt, tức là sản xuất dùng `putLock`, tiêu thụ dùng `takeLock`. Điều này có thể ngăn chặn việc tranh giành lock giữa producer và consumer thread.
- Chiếm dụng bộ nhớ: `ArrayBlockingQueue` cần phân bổ bộ nhớ mảng trước, còn `LinkedBlockingQueue` phân bổ bộ nhớ node linked list động. Điều này có nghĩa là `ArrayBlockingQueue` sẽ chiếm một lượng bộ nhớ nhất định khi tạo, và thường yêu cầu bộ nhớ lớn hơn lượng bộ nhớ thực sự sử dụng. Còn `LinkedBlockingQueue` chiếm dụng bộ nhớ dần dần theo số lượng phần tử tăng lên.

### ArrayBlockingQueue và ConcurrentLinkedQueue khác nhau như thế nào?

`ArrayBlockingQueue` và `ConcurrentLinkedQueue` là hai loại queue thường dùng trong Java concurrent package, cả hai đều thread-safe. Tuy nhiên, chúng có một số điểm khác biệt:

- Triển khai bên dưới: `ArrayBlockingQueue` dựa trên mảng, còn `ConcurrentLinkedQueue` dựa trên linked list.
- Có giới hạn hay không: `ArrayBlockingQueue` là bounded queue, phải chỉ định capacity khi tạo. `ConcurrentLinkedQueue` là unbounded queue, có thể tăng capacity động.
- Có blocking hay không: `ArrayBlockingQueue` hỗ trợ cả hai cách lấy và thêm phần tử blocking và non-blocking (thường chỉ dùng cách trước). `ConcurrentLinkedQueue` là unbounded, chỉ hỗ trợ lấy và thêm phần tử non-blocking.

### Nguyên lý triển khai của ArrayBlockingQueue là gì?

Nguyên lý triển khai của `ArrayBlockingQueue` chủ yếu gồm các điểm sau (ở đây lấy lấy và thêm phần tử blocking làm ví dụ để giới thiệu):

- `ArrayBlockingQueue` nội bộ duy trì một mảng có độ dài cố định để lưu trữ phần tử.
- Thông qua việc sử dụng lock object `ReentrantLock` để đồng bộ hóa các thao tác đọc ghi, tức là triển khai thread safety thông qua cơ chế lock.
- Thông qua `Condition` để triển khai các thao tác chờ và đánh thức giữa các thread.

Dưới đây giới thiệu chi tiết hơn về triển khai cụ thể của việc chờ và đánh thức giữa các thread (không cần nhớ tên phương thức cụ thể, trả lời điểm chính trong phỏng vấn là được):

- Khi queue đã đầy, producer thread sẽ gọi phương thức `notFull.await()` để producer chờ đợi. Chờ queue không đầy để chèn (điều kiện không đầy).
- Khi queue rỗng, consumer thread sẽ gọi phương thức `notEmpty.await()` để consumer chờ đợi. Chờ queue không rỗng để tiêu thụ (điều kiện không rỗng).
- Khi có phần tử mới được thêm vào, producer thread sẽ gọi phương thức `notEmpty.signal()` để đánh thức consumer thread đang chờ tiêu thụ.
- Khi một phần tử được lấy ra khỏi queue, consumer thread sẽ gọi phương thức `notFull.signal()` để đánh thức producer thread đang chờ chèn phần tử.

Bổ sung về interface `Condition`:

> `Condition` xuất hiện từ JDK1.5, nó có tính linh hoạt rất cao. Ví dụ có thể triển khai chức năng multi-way notification (thông báo đa chiều), tức là trong một object `Lock` có thể tạo nhiều instance `Condition` (tức là object monitor). **Thread object có thể đăng ký vào `Condition` được chỉ định, từ đó có thể thông báo thread một cách có chọn lọc. Điều này linh hoạt hơn trong việc lập lịch thread. Khi sử dụng phương thức `notify()/notifyAll()` để thông báo, thread được thông báo được JVM lựa chọn. Sử dụng class `ReentrantLock` kết hợp với instance `Condition` có thể triển khai "thông báo có chọn lọc"**, chức năng này rất quan trọng và là chức năng mặc định của interface `Condition`. Còn từ khóa `synchronized` tương đương với chỉ có một instance `Condition` trong toàn bộ object `Lock`, tất cả thread đều đăng ký vào nó một mình. Nếu thực thi phương thức `notifyAll()`, tất cả thread ở trạng thái chờ sẽ được thông báo, điều này sẽ gây ra vấn đề hiệu suất lớn. Còn phương thức `signalAll()` của instance `Condition` chỉ đánh thức tất cả các thread đang chờ đã đăng ký vào instance `Condition` đó.

## Tài liệu tham khảo

- Hiểu sâu về Java Series | Hướng dẫn sử dụng chi tiết BlockingQueue：<https://juejin.cn/post/6999798721269465102>
- BlockingQueue và triển khai điển hình ArrayBlockingQueue từ đơn giản đến chuyên sâu：<https://zhuanlan.zhihu.com/p/539619957>
- Tổng quan về lập trình đồng thời: Nguyên lý bên dưới và thực hành ArrayBlockingQueue：<https://zhuanlan.zhihu.com/p/339662987>
<!-- @include: @article-footer.snippet.md -->
