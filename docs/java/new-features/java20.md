---
title: Tổng quan tính năng mới Java 20
description: Tóm tắt các thay đổi về ngôn ngữ và concurrency trong JDK 20, tiếp nối các cải tiến liên quan đến virtual thread và pattern matching.
category: Java
tag:
  - Java Tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 20,JDK20,记录模式预览,虚拟线程改进,语言增强,JEP
---

JDK 20 được phát hành vào ngày 21 tháng 3 năm 2023, không phải phiên bản hỗ trợ dài hạn (LTS).

Theo kế hoạch phát triển, phiên bản LTS tiếp theo sẽ là JDK 21, dự kiến phát hành vào tháng 9 năm 2023.

JDK 20 có tổng cộng 7 tính năng mới, bài viết này sẽ chọn lọc và giới thiệu chi tiết một số tính năng quan trọng:

- [JEP 429: Scoped Values（Giá trị có phạm vi）](https://openjdk.org/jeps/429)（lần ấp ủ đầu tiên）
- [JEP 432: Record Patterns（Mẫu bản ghi）](https://openjdk.org/jeps/432)（lần xem trước thứ hai）
- [JEP 433: Pattern Matching for switch（Khớp mẫu cho switch）](https://openjdk.org/jeps/433)（lần xem trước thứ tư）
- [JEP 434: Foreign Function & Memory API（API hàm ngoài và bộ nhớ）](https://openjdk.org/jeps/434)（lần xem trước thứ hai）
- [JEP 436: Virtual Threads（Luồng ảo）](https://openjdk.org/jeps/436)（lần xem trước thứ hai）
- [JEP 437: Structured Concurrency（Concurrency có cấu trúc）](https://openjdk.org/jeps/437)（lần ấp ủ thứ hai）
- [JEP 438: Vector API（API vector）](https://openjdk.org/jeps/438)（lần ấp ủ thứ năm）

Hình dưới đây thể hiện số lượng tính năng mới và thời điểm cập nhật của mỗi phiên bản từ JDK 8 đến JDK 25:

![ JDK 8 到 JDK 25 每个版本的更新带来的新特性数量和更新时间](/images/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 429: Scoped Values（Giá trị có phạm vi, lần ấp ủ đầu tiên）

Scoped Values (Giá trị có phạm vi) cho phép chia sẻ dữ liệu bất biến trong và giữa các luồng, vượt trội hơn biến cục bộ theo luồng (thread-local variable), đặc biệt khi sử dụng số lượng lớn virtual thread.

```java
final static ScopedValue<...> V = new ScopedValue<>();

// In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...
```

Scoped Values cho phép chia sẻ dữ liệu an toàn và hiệu quả giữa các thành phần trong chương trình lớn mà không cần dùng đến tham số phương thức.

Để tìm hiểu chi tiết về Scoped Values, bạn có thể đọc bài viết [Scoped Values FAQ](https://www.happycoders.eu/java/scoped-values/).

## JEP 432: Record Patterns（Mẫu bản ghi, lần xem trước thứ hai）

Record Patterns (Mẫu bản ghi) cho phép giải cấu trúc giá trị của `record`, tức là trích xuất dữ liệu từ lớp bản ghi (Record Class) một cách thuận tiện hơn. Ngoài ra, có thể kết hợp lồng ghép mẫu bản ghi với mẫu kiểu để tạo ra các hình thức điều hướng và xử lý dữ liệu mạnh mẽ, khai báo và có thể kết hợp.

Mẫu bản ghi không thể sử dụng độc lập mà phải kết hợp với `instanceof` hoặc khớp mẫu `switch`.

Hãy lấy `instanceof` làm ví dụ minh họa đơn giản.

Định nghĩa một lớp bản ghi đơn giản:

```java
record Shape(String type, long unit){}
```

Trước khi có mẫu bản ghi:

```java
Shape circle = new Shape("Circle", 10);
if (circle instanceof Shape shape) {

  System.out.println("Area of " + shape.type() + " is : " + Math.PI * Math.pow(shape.unit(), 2));
}
```

Sau khi có mẫu bản ghi:

```java
Shape circle = new Shape("Circle", 10);
if (circle instanceof Shape(String type, long unit)) {
  System.out.println("Area of " + type + " is : " + Math.PI * Math.pow(unit, 2));
}
```

Hãy xem cách kết hợp mẫu bản ghi với `switch`.

Định nghĩa một số lớp:

```java
interface Shape {}
record Circle(double radius) implements Shape { }
record Square(double side) implements Shape { }
record Rectangle(double length, double width) implements Shape { }
```

Trước khi có mẫu bản ghi:

```java
Shape shape = new Circle(10);
switch (shape) {
    case Circle c:
        System.out.println("The shape is Circle with area: " + Math.PI * c.radius() * c.radius());
        break;

    case Square s:
        System.out.println("The shape is Square with area: " + s.side() * s.side());
        break;

    case Rectangle r:
        System.out.println("The shape is Rectangle with area: " + r.length() * r.width());
        break;

    default:
        System.out.println("Unknown Shape");
        break;
}
```

Sau khi có mẫu bản ghi:

```java
Shape shape = new Circle(10);
switch(shape) {

  case Circle(double radius):
    System.out.println("The shape is Circle with area: " + Math.PI * radius * radius);
    break;

  case Square(double side):
    System.out.println("The shape is Square with area: " + side * side);
    break;

  case Rectangle(double length, double width):
    System.out.println("The shape is Rectangle with area: " + length * width);
    break;

  default:
    System.out.println("Unknown Shape");
    break;
}
```

Mẫu bản ghi giúp tránh các phép chuyển đổi kiểu không cần thiết, làm cho code ngắn gọn và dễ đọc hơn. Hơn nữa, khi dùng mẫu bản ghi không cần lo lắng về `null` hay `NullPointerException`, code an toàn và đáng tin cậy hơn.

Mẫu bản ghi được xem trước lần đầu trong Java 19, được đề xuất bởi [JEP 405](https://openjdk.org/jeps/405). JDK 20 là lần xem trước thứ hai, được đề xuất bởi [JEP 432](https://openjdk.org/jeps/432). Các cải tiến lần này bao gồm:

- Thêm hỗ trợ suy luận tham số kiểu cho mẫu bản ghi tổng quát,
- Thêm hỗ trợ cho mẫu bản ghi xuất hiện trong phần đầu của câu lệnh `for` nâng cao
- Xóa hỗ trợ cho mẫu bản ghi có tên.

**Lưu ý**: Đừng nhầm lẫn mẫu bản ghi với lớp bản ghi (Record Class) được chính thức giới thiệu trong [JDK16](./java16.md).

## JEP 433: Pattern Matching for switch（Khớp mẫu cho switch, lần xem trước thứ tư）

Giống như `instanceof`, `switch` cũng được bổ sung chức năng khớp và chuyển đổi kiểu tự động.

Ví dụ code `instanceof`:

```java
// Old code
if (o instanceof String) {
    String s = (String)o;
    ... use s ...
}

// New code
if (o instanceof String s) {
    ... use s ...
}
```

Ví dụ code `switch`:

```java
// Old code
static String formatter(Object o) {
    String formatted = "unknown";
    if (o instanceof Integer i) {
        formatted = String.format("int %d", i);
    } else if (o instanceof Long l) {
        formatted = String.format("long %d", l);
    } else if (o instanceof Double d) {
        formatted = String.format("double %f", d);
    } else if (o instanceof String s) {
        formatted = String.format("String %s", s);
    }
    return formatted;
}

// New code
static String formatterPatternSwitch(Object o) {
    return switch (o) {
        case Integer i -> String.format("int %d", i);
        case Long l    -> String.format("long %d", l);
        case Double d  -> String.format("double %f", d);
        case String s  -> String.format("String %s", s);
        default        -> o.toString();
    };
}
```

Khớp mẫu `switch` đã được xem trước lần lượt trong Java 17, Java 18, Java 19, và Java 20 là lần xem trước thứ tư. Mỗi lần xem trước đều có một số cải tiến nhỏ, không đề cập chi tiết ở đây.

## JEP 434: Foreign Function & Memory API（API hàm ngoài và bộ nhớ, lần xem trước thứ hai）

Chương trình Java có thể tương tác với code và dữ liệu bên ngoài Java runtime thông qua API này. Bằng cách gọi hiệu quả các hàm ngoài (tức là code bên ngoài JVM) và truy cập an toàn bộ nhớ ngoài (tức là bộ nhớ không được JVM quản lý), API này cho phép chương trình Java gọi các thư viện native và xử lý dữ liệu native mà không nguy hiểm và dễ vỡ như JNI.

Foreign Function & Memory API được ấp ủ lần đầu trong Java 17, được đề xuất bởi [JEP 412](https://openjdk.java.net/jeps/412). Ấp ủ lần hai trong Java 18, được đề xuất bởi [JEP 419](https://openjdk.org/jeps/419). Xem trước lần đầu trong Java 19, được đề xuất bởi [JEP 424](https://openjdk.org/jeps/424).

JDK 20 là lần xem trước thứ hai, được đề xuất bởi [JEP 434](https://openjdk.org/jeps/434), các cải tiến lần này bao gồm:

- Hợp nhất các abstraction `MemorySegment` và `MemoryAddress`
- Cải thiện phân cấp `MemoryLayout`
- Tách `MemorySession` thành `Arena` và `SegmentScope` để thúc đẩy việc chia sẻ segment qua các ranh giới bảo trì.

Trong [Tổng quan tính năng mới Java 19](./java19.md), tôi đã giới thiệu chi tiết về Foreign Function & Memory API, nên không nhắc lại ở đây.

## JEP 436: Virtual Threads（Luồng ảo, lần xem trước thứ hai）

Virtual Thread (Luồng ảo) là luồng nhẹ (Lightweight Process, LWP) được triển khai bởi JDK chứ không phải OS, được lập lịch bởi JVM. Nhiều virtual thread dùng chung một luồng hệ điều hành, số lượng virtual thread có thể lớn hơn rất nhiều so với số lượng luồng hệ điều hành.

Trước khi virtual thread được giới thiệu, gói `java.lang.Thread` đã hỗ trợ cái gọi là platform thread, tức là các luồng chúng ta vẫn dùng trước khi có virtual thread. JVM scheduler quản lý virtual thread thông qua platform thread (carrier thread), một platform thread có thể thực thi các virtual thread khác nhau vào những thời điểm khác nhau (nhiều virtual thread được gắn vào một platform thread), khi virtual thread bị block hoặc chờ đợi, platform thread có thể chuyển sang thực thi virtual thread khác.

Sơ đồ mối quan hệ giữa virtual thread, platform thread và kernel thread của hệ thống như sau (nguồn hình: [How to Use Java 19 Virtual Threads](https://medium.com/javarevisited/how-to-use-java-19-virtual-threads-c16a32bad5f7)):

![虚拟线程、平台线程和系统内核线程的关系](/images/github/javaguide/java/new-features/virtual-threads-platform-threads-kernel-threads-relationship.png)

Thêm một điểm về mối quan hệ tương ứng giữa platform thread và kernel thread của hệ thống: Trên các hệ điều hành phổ biến như Windows và Linux, luồng Java sử dụng mô hình one-to-one, tức là một platform thread tương ứng với một kernel thread của hệ thống. Solaris là một trường hợp đặc biệt, HotSpot VM trên Solaris hỗ trợ cả many-to-many và one-to-one. Có thể tham khảo câu trả lời của R大: [Mô hình luồng trong JVM là user-level không?](https://www.zhihu.com/question/23096638/answer/29617153).

So với platform thread, virtual thread rẻ và nhẹ hơn, được hủy ngay sau khi sử dụng xong, do đó không cần tái sử dụng hay pool hóa, mỗi tác vụ có thể có virtual thread riêng để chạy. Virtual thread tạm dừng và tiếp tục để thực hiện chuyển đổi giữa các luồng, tránh chi phí context switch phụ thêm, kết hợp ưu điểm của đa luồng, đơn giản hóa độ phức tạp của chương trình high concurrency, có thể giảm đáng kể khối lượng công việc viết, bảo trì và quan sát các ứng dụng concurrent có thông lượng cao.

Virtual thread đã được chứng minh là rất hữu ích trong các ngôn ngữ đa luồng khác, ví dụ như Goroutine trong Go, Process trong Erlang.

Trên Zhihu có một cuộc thảo luận về virtual thread trong Java 19, nếu bạn quan tâm có thể xem: <https://www.zhihu.com/question/536743167>.

Để tìm hiểu chi tiết và nguyên lý của Java virtual thread, có thể đọc các bài viết sau:

- [Virtual Thread - Nhập môn đơn giản](https://javaguide.cn/java/concurrent/virtual-thread.html)
- [Java19 chính thức GA! Xem virtual thread tăng đáng kể thông lượng hệ thống như thế nào](https://mp.weixin.qq.com/s/yyApBXxpXxVwttr01Hld6Q)
- [Virtual Thread - Phân tích mã nguồn VirtualThread](https://www.cnblogs.com/throwable/p/16758997.html)

Virtual thread được xem trước lần đầu trong Java 19, được đề xuất bởi [JEP 425](https://openjdk.org/jeps/425). JDK 20 là lần xem trước thứ hai với một số thay đổi nhỏ, không đề cập chi tiết ở đây.

Cuối cùng, hãy xem bốn cách tạo virtual thread:

```java
// 1、通过 Thread.ofVirtual() 创建
Runnable fn = () -> {
  // your code here
};

Thread thread = Thread.ofVirtual(fn)
                      .start();

// 2、通过 Thread.startVirtualThread() 创建
Thread thread = Thread.startVirtualThread(() -> {
  // your code here
});

// 3、通过 Executors.newVirtualThreadPerTaskExecutor() 创建
var executorService = Executors.newVirtualThreadPerTaskExecutor();

executorService.submit(() -> {
  // your code here
});

class CustomThread implements Runnable {
  @Override
  public void run() {
    System.out.println("CustomThread run");
  }
}

//4、通过 ThreadFactory 创建
CustomThread customThread = new CustomThread();
// 获取线程工厂类
ThreadFactory factory = Thread.ofVirtual().factory();
// 创建虚拟线程
Thread thread = factory.newThread(customThread);
// 启动线程
thread.start();
```

Qua 4 cách tạo virtual thread được liệt kê ở trên, có thể thấy rằng để giảm ngưỡng sử dụng virtual thread, nhà phát triển đã cố gắng tái sử dụng lớp `Thread` hiện có, giúp việc chuyển đổi sang dùng virtual thread diễn ra suôn sẻ.

## JEP 437: Structured Concurrency（Concurrency có cấu trúc, lần ấp ủ thứ hai）

Java 19 đã giới thiệu Structured Concurrency (Concurrency có cấu trúc), một phương pháp lập trình đa luồng nhằm đơn giản hóa lập trình đa luồng thông qua Structured Concurrency API, không phải để thay thế `java.util.concurrent`, hiện đang trong giai đoạn ấp ủ.

Structured Concurrency xem các tác vụ chạy trong nhiều luồng khác nhau như một đơn vị công việc duy nhất, từ đó đơn giản hóa xử lý lỗi, tăng độ tin cậy và cải thiện khả năng quan sát. Hay nói cách khác, Structured Concurrency giữ được khả năng đọc, bảo trì và quan sát của code đơn luồng.

API cơ bản của Structured Concurrency là [`StructuredTaskScope`](https://download.java.net/java/early_access/loom/docs/api/jdk.incubator.concurrent/jdk/incubator/concurrent/StructuredTaskScope.html). `StructuredTaskScope` hỗ trợ chia tác vụ thành nhiều tác vụ con chạy đồng thời, thực thi trong luồng riêng của chúng, và các tác vụ con phải hoàn thành trước khi tác vụ chính tiếp tục.

Cách dùng cơ bản của `StructuredTaskScope` như sau:

```java
    try (var scope = new StructuredTaskScope<Object>()) {
        // 使用fork方法派生线程来执行子任务
        Future<Integer> future1 = scope.fork(task1);
        Future<String> future2 = scope.fork(task2);
        // 等待线程完成
        scope.join();
        // 结果的处理可能包括处理或重新抛出异常
        ... process results/exceptions ...
    } // close
```

Structured Concurrency rất phù hợp với virtual thread, vốn là các luồng nhẹ được triển khai bởi JDK. Nhiều virtual thread dùng chung một luồng hệ điều hành, cho phép có rất nhiều virtual thread.

Thay đổi duy nhất đối với Structured Concurrency trong JDK 20 là cập nhật để hỗ trợ các luồng được tạo trong phạm vi tác vụ `StructuredTaskScope` kế thừa scoped value. Điều này đơn giản hóa việc chia sẻ dữ liệu bất biến giữa các luồng, xem chi tiết tại [JEP 429](https://openjdk.org/jeps/429).

## JEP 438: Vector API（API Vector, lần ấp ủ thứ năm）

Tính toán vector bao gồm một chuỗi các phép toán trên vector. Vector API được dùng để biểu diễn tính toán vector, tính toán này có thể được biên dịch đáng tin cậy vào các lệnh vector tối ưu trên kiến trúc CPU hỗ trợ lúc runtime, đạt hiệu suất vượt trội so với tính toán scalar tương đương.

Mục tiêu của Vector API là cung cấp cho người dùng cách biểu diễn một phạm vi rộng các tính toán vector một cách ngắn gọn, dễ dùng và độc lập với nền tảng.

Vector API ban đầu được đề xuất bởi [JEP 338](https://openjdk.java.net/jeps/338) và được tích hợp vào Java 16 như một [Incubating API](http://openjdk.java.net/jeps/11). Vòng ấp ủ thứ hai được đề xuất bởi [JEP 414](https://openjdk.java.net/jeps/414) và tích hợp vào Java 17, vòng ấp ủ thứ ba được đề xuất bởi [JEP 417](https://openjdk.java.net/jeps/417) và tích hợp vào Java 18, vòng thứ tư được đề xuất bởi [JEP 426](https://openjdk.java.net/jeps/426) và tích hợp vào Java 19.

Lần ấp ủ trong Java 20 này về cơ bản không thay đổi Vector API, chỉ thực hiện một số sửa lỗi và cải thiện hiệu suất, xem chi tiết tại [JEP 438](https://openjdk.org/jeps/438).

<!-- @include: @article-footer.snippet.md -->
