---
title: Tổng hợp các Concurrent Container phổ biến trong Java
description: "Tổng hợp toàn diện các Java concurrent container: giải thích chi tiết đặc tính, tình huống sử dụng và so sánh hiệu năng của các JUC thread-safe container như ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue."
category: Java
tag:
  - Java Concurrent
head:
  - - meta
    - name: keywords
      content: Java concurrent container,ConcurrentHashMap,CopyOnWriteArrayList,BlockingQueue,ConcurrentLinkedQueue,thread-safe container
---

Hầu hết các container do JDK cung cấp đều nằm trong package `java.util.concurrent`.

- **`ConcurrentHashMap`**: `HashMap` thread-safe
- **`CopyOnWriteArrayList`**: `List` thread-safe, hiệu năng rất tốt trong tình huống đọc nhiều ghi ít, vượt xa `Vector`.
- **`ConcurrentLinkedQueue`**: Concurrent queue hiệu năng cao, triển khai bằng linked list. Có thể coi là `LinkedList` thread-safe, đây là non-blocking queue.
- **`BlockingQueue`**: Đây là một interface, JDK triển khai nội bộ qua linked list, array, v.v. Biểu thị blocking queue, rất phù hợp làm channel chia sẻ dữ liệu.
- **`ConcurrentSkipListMap`**: Triển khai skip list. Đây là Map dùng cấu trúc dữ liệu skip list để tìm kiếm nhanh.

## ConcurrentHashMap

Chúng ta biết `HashMap` không thread-safe. Trong tình huống concurrent, một giải pháp phổ biến là dùng method `Collections.synchronizedMap()` để wrap `HashMap` thành thread-safe. Tuy nhiên, cách này dùng một global lock để đồng bộ truy cập concurrent của các thread khác nhau, gây bottleneck hiệu năng nghiêm trọng, đặc biệt trong tình huống high concurrency.

Để giải quyết vấn đề này, `ConcurrentHashMap` ra đời — là phiên bản thread-safe của `HashMap`, cung cấp khả năng xử lý concurrent hiệu quả hơn.

Trong JDK 1.7, `ConcurrentHashMap` chia toàn bộ bucket array thành các segment (`Segment` — segment lock). Mỗi lock chỉ lock một phần dữ liệu trong container (có sơ đồ bên dưới). Các thread truy cập dữ liệu ở các segment khác nhau sẽ không có lock contention, tăng tốc độ truy cập concurrent.

![Cấu trúc lưu trữ Java7 ConcurrentHashMap](https://oss.javaguide.cn/github/javaguide/java/collection/java7_concurrenthashmap.png)

Đến JDK 1.8, `ConcurrentHashMap` bỏ `Segment` segment lock, dùng `Node + CAS + synchronized` để đảm bảo an toàn concurrent. Cấu trúc dữ liệu tương tự `HashMap` 1.8 — array + linked list / red-black tree. Java 8 chuyển linked list (độ phức tạp tìm kiếm O(N)) sang red-black tree (độ phức tạp tìm kiếm O(log(N))) khi độ dài linked list vượt ngưỡng nhất định (8).

Trong Java 8, granularity lock nhỏ hơn. `synchronized` chỉ lock head node của linked list hoặc red-black tree hiện tại. Như vậy chỉ cần hash không xung đột thì sẽ không có concurrency, không ảnh hưởng đến đọc/ghi Node khác, hiệu quả được cải thiện đáng kể.

![Cấu trúc lưu trữ Java8 ConcurrentHashMap](https://oss.javaguide.cn/github/javaguide/java/collection/java8_concurrenthashmap.png)

Để xem giới thiệu chi tiết về `ConcurrentHashMap`, đọc bài: [`ConcurrentHashMap` Source Code Analysis](./../collection/concurrent-hash-map-source-code.md).

## CopyOnWriteArrayList

Trước JDK 1.5, muốn dùng `List` concurrent-safe thì chỉ có thể chọn `Vector`. Nhưng `Vector` là collection cũ đã bị loại bỏ. `Vector` thêm `synchronized` vào hầu hết các method như add, delete, modify, query. Cách này tuy đảm bảo đồng bộ nhưng tương đương thêm một lock lớn vào toàn bộ `Vector`, mỗi method thực thi đều phải lấy lock, khiến hiệu năng rất thấp.

JDK 1.5 giới thiệu package `Java.util.concurrent` (JUC), cung cấp nhiều container thread-safe với hiệu năng concurrent tốt. Triển khai `List` thread-safe duy nhất trong đó là `CopyOnWriteArrayList`.

Với hầu hết tình huống nghiệp vụ, thao tác đọc thường nhiều hơn rất nhiều so với ghi. Vì thao tác đọc không sửa đổi dữ liệu gốc, lock mỗi lần đọc thực ra là lãng phí tài nguyên. Thay vào đó, chúng ta nên cho phép nhiều thread đồng thời truy cập dữ liệu nội bộ của `List`, vì thao tác đọc là an toàn.

Tư tưởng này rất giống design thought của `ReentrantReadWriteLock` read-write lock: read-read không loại trừ nhau, read-write loại trừ nhau, write-write loại trừ nhau (chỉ read-read là không loại trừ nhau). `CopyOnWriteArrayList` tiến thêm một bước. Để phát huy tối đa hiệu năng read, thao tác đọc trong `CopyOnWriteArrayList` hoàn toàn không cần lock. Hơn nữa, thao tác ghi cũng không block thao tác đọc — chỉ write-write mới loại trừ nhau. Như vậy hiệu năng đọc được cải thiện đáng kể.

Cốt lõi thread-safe của `CopyOnWriteArrayList` là áp dụng chiến lược **Copy-On-Write (sao chép khi ghi)** — điều này được phản ánh ngay từ tên `CopyOnWriteArrayList`.

Khi cần sửa đổi (`add`, `set`, `remove`, v.v.) nội dung `CopyOnWriteArrayList`, không trực tiếp sửa array gốc mà tạo bản sao của array nền tảng, sửa đổi array bản sao, sau khi sửa xong gán lại array đã sửa, như vậy đảm bảo thao tác ghi không ảnh hưởng đến thao tác đọc.

Để xem giới thiệu chi tiết về `CopyOnWriteArrayList`, đọc bài: [`CopyOnWriteArrayList` Source Code Analysis](./../collection/copyonwritearraylist-source-code.md).

## ConcurrentLinkedQueue

Thread-safe `Queue` do Java cung cấp có thể chia thành **blocking queue** và **non-blocking queue**. Ví dụ điển hình của blocking queue là `BlockingQueue`, của non-blocking queue là `ConcurrentLinkedQueue`. Trong ứng dụng thực tế cần chọn blocking queue hay non-blocking queue dựa trên nhu cầu. **Blocking queue có thể triển khai bằng lock, non-blocking queue có thể triển khai bằng CAS.**

Từ tên gọi có thể thấy `ConcurrentLinkedQueue` dùng linked list làm cấu trúc dữ liệu. `ConcurrentLinkedQueue` nên là queue có hiệu năng tốt nhất trong tình huống high concurrency, lý do là triển khai nội bộ phức tạp của nó.

Chúng ta không phân tích code nội bộ `ConcurrentLinkedQueue` ở đây. Chỉ cần biết `ConcurrentLinkedQueue` chủ yếu dùng CAS non-blocking algorithm để đảm bảo thread safety.

`ConcurrentLinkedQueue` phù hợp cho tình huống yêu cầu hiệu năng tương đối cao và queue có nhiều thread đồng thời đọc/ghi. Tức là nếu chi phí lock queue cao thì phù hợp dùng `ConcurrentLinkedQueue` không lock để thay thế.

## BlockingQueue

### Giới thiệu BlockingQueue

Ở trên chúng ta đã đề cập đến `ConcurrentLinkedQueue` là non-blocking queue hiệu năng cao. Tiếp theo là blocking queue — `BlockingQueue`. Blocking queue (`BlockingQueue`) được dùng rộng rãi trong vấn đề "producer-consumer", vì `BlockingQueue` cung cấp các method insert và remove có thể block. Khi queue đầy, producer thread bị block cho đến khi queue không đầy; khi queue trống, consumer thread bị block cho đến khi queue không trống.

`BlockingQueue` là một interface, kế thừa từ `Queue`, do đó các lớp triển khai cũng có thể dùng làm triển khai `Queue`. `Queue` lại kế thừa từ interface `Collection`. Dưới đây là các lớp liên quan triển khai `BlockingQueue`:

![Các lớp triển khai BlockingQueue](https://oss.javaguide.cn/github/javaguide/java/51622268.jpg)

Dưới đây giới thiệu 3 lớp triển khai `BlockingQueue` phổ biến: `ArrayBlockingQueue`, `LinkedBlockingQueue`, `PriorityBlockingQueue`.

### ArrayBlockingQueue

`ArrayBlockingQueue` là lớp triển khai bounded queue của interface `BlockingQueue`, triển khai nền tảng bằng array.

```java
public class ArrayBlockingQueue<E>
extends AbstractQueue<E>
implements BlockingQueue<E>, Serializable{}
```

`ArrayBlockingQueue` sau khi tạo, capacity không thể thay đổi. Kiểm soát concurrency dùng reentrant lock `ReentrantLock`, cả insert lẫn read đều phải lấy lock mới thao tác được. Khi queue đầy, cố gắng thêm element vào queue sẽ block; cố gắng lấy element từ queue trống cũng block tương tự.

`ArrayBlockingQueue` mặc định không đảm bảo fairness khi thread truy cập queue. Fairness ở đây nghĩa là nghiêm ngặt theo thứ tự tuyệt đối thread chờ — thread chờ lâu nhất được truy cập `ArrayBlockingQueue` trước. Non-fairness nghĩa là thứ tự truy cập `ArrayBlockingQueue` không tuân theo thứ tự thời gian nghiêm ngặt — có thể xảy ra tình huống thread block lâu vẫn không truy cập được khi `ArrayBlockingQueue` có thể được truy cập. Đảm bảo fairness thường giảm throughput. Nếu cần `ArrayBlockingQueue` có fairness, dùng code sau:

```java
private static ArrayBlockingQueue<Integer> blockingQueue = new ArrayBlockingQueue<Integer>(10,true);
```

### LinkedBlockingQueue

`LinkedBlockingQueue` là blocking queue triển khai dựa trên **singly linked list**, có thể dùng như unbounded queue hoặc bounded queue. Cũng thỏa mãn đặc tính FIFO. So với `ArrayBlockingQueue` có throughput cao hơn. Để tránh `LinkedBlockingQueue` capacity tăng nhanh tiêu thụ nhiều bộ nhớ, thường chỉ định size khi tạo object `LinkedBlockingQueue`. Nếu không chỉ định, capacity bằng `Integer.MAX_VALUE`.

**Constructor liên quan:**

```java
    /**
     * Theo một nghĩa nào đó là unbounded queue
     * Creates a {@code LinkedBlockingQueue} with a capacity of
     * {@link Integer#MAX_VALUE}.
     */
    public LinkedBlockingQueue() {
        this(Integer.MAX_VALUE);
    }

    /**
     * Bounded queue
     * Creates a {@code LinkedBlockingQueue} with the given (fixed) capacity.
     *
     * @param capacity the capacity of this queue
     * @throws IllegalArgumentException if {@code capacity} is not greater
     *         than zero
     */
    public LinkedBlockingQueue(int capacity) {
        if (capacity <= 0) throw new IllegalArgumentException();
        this.capacity = capacity;
        last = head = new Node<E>(null);
    }
```

### PriorityBlockingQueue

`PriorityBlockingQueue` là unbounded blocking queue hỗ trợ priority. Mặc định element được sắp xếp theo natural order. Cũng có thể chỉ định quy tắc sắp xếp bằng cách implement `compareTo()` trong class tùy chỉnh, hoặc chỉ định qua tham số constructor `Comparator` khi khởi tạo.

`PriorityBlockingQueue` kiểm soát concurrency bằng reentrant lock `ReentrantLock`. Queue là unbounded queue (`ArrayBlockingQueue` là bounded queue; `LinkedBlockingQueue` cũng có thể bounded bằng cách truyền `capacity` vào constructor; nhưng `PriorityBlockingQueue` chỉ có thể chỉ định initial queue size, sau đó khi insert element **sẽ tự động expand** nếu không đủ chỗ).

Nói đơn giản, nó là phiên bản thread-safe của `PriorityQueue`. Không thể insert null. Đồng thời các object insert vào queue phải có thể so sánh được (comparable), ngược lại throw `ClassCastException`. Method put insert không block vì nó là unbounded queue (method take sẽ block khi queue trống).

**Bài đọc thêm:** [《Phân tích Java Concurrent Queue BlockingQueue》](https://javadoop.com/post/java-concurrent-queue)

## ConcurrentSkipListMap

> Phần nội dung dưới đây tham khảo chuyên mục GeekTime [《Data Structure and Algorithm Beauty》](https://time.geekbang.org/column/intro/126?code=zl3GYeAsRI4rEJIBNu5B/km7LSZsPDlGWQEpAYw5Vu0=&utm_term=SPoster) và 《Concurrent Java Programming in Practice》.

Để giới thiệu `ConcurrentSkipListMap`, trước tiên cùng hiểu đơn giản về skip list.

Với một singly linked list, dù linked list đã được sắp xếp, nếu muốn tìm dữ liệu trong đó, chỉ có thể duyệt từ đầu đến cuối — hiệu quả rõ ràng thấp. Skip list thì khác. Skip list là cấu trúc dữ liệu có thể dùng để tìm kiếm nhanh, hơi giống balanced tree. Cả hai đều có thể tìm kiếm element nhanh. Nhưng một điểm khác biệt quan trọng là: insert và delete trong balanced tree thường có thể dẫn đến điều chỉnh global của balanced tree. Còn insert và delete trong skip list chỉ cần thao tác local trên toàn bộ cấu trúc dữ liệu. Lợi ích mang lại là: trong high concurrency, cần global lock để đảm bảo thread safety của balanced tree. Còn với skip list chỉ cần partial lock. Như vậy trong môi trường high concurrency có thể đạt hiệu năng tốt hơn. Về hiệu năng query, time complexity của skip list cũng là **O(log n)**. Vì vậy trong concurrent data structure, JDK dùng skip list để triển khai Map.

Bản chất của skip list là duy trì đồng thời nhiều linked list, và linked list có phân cấp.

![Skip list 2-level index](https://oss.javaguide.cn/github/javaguide/java/93666217.jpg)

Linked list ở tầng thấp nhất duy trì tất cả element trong skip list, mỗi linked list tầng trên đều là tập con của tầng dưới.

Tất cả element trong tất cả linked list của skip list đều được sắp xếp. Khi tìm kiếm, có thể bắt đầu từ linked list tầng cao nhất. Khi phát hiện element cần tìm nhỏ hơn node successor hiện tại (hoặc successor null), chuyển xuống linked list tầng dưới tiếp tục tìm. Tức là trong quá trình tìm kiếm, search là nhảy cóc. Như hình trên, tìm element 18 trong skip list.

![Tìm element 18 trong skip list](https://oss.javaguide.cn/github/javaguide/java/32005738.jpg)

Tìm 18 trước cần duyệt 18 lần, giờ chỉ cần 7 lần. Khi độ dài linked list lớn, cải thiện hiệu quả tìm kiếm khi xây dựng index sẽ rất đáng kể.

Qua trên dễ thấy, **skip list là thuật toán đánh đổi không gian lấy thời gian.**

Một điểm khác biệt nữa giữa triển khai `Map` bằng skip list và triển khai bằng hash: hash không lưu trữ thứ tự element, còn tất cả element trong skip list đều được sắp xếp. Do đó khi duyệt skip list, bạn nhận được kết quả có thứ tự. Vì vậy, nếu ứng dụng cần tính có thứ tự thì skip list là lựa chọn duy nhất. Lớp triển khai cấu trúc dữ liệu này trong JDK là `ConcurrentSkipListMap`.

## Tài liệu tham khảo

- 《Concurrent Java Programming in Practice》
- <https://javadoop.com/post/java-concurrent-queue>
- <https://juejin.im/post/5aeebd02518825672f19c546>

<!-- @include: @article-footer.snippet.md -->
