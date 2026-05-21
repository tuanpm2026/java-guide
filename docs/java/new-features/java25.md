---
title: Tổng quan các tính năng mới của Java 25
description: Tổng quan các tính năng mới và thay đổi preview quan trọng trong JDK 25, tập trung vào concurrency, GC và các cải tiến ngôn ngữ/platform.
category: Java
tag:
  - Java New Features
head:
  - - meta
    - name: keywords
      content: Java 25,JDK25,LTS,scoped values,compact object headers,generational Shenandoah,module import,structured concurrency
---

JDK 25 được phát hành vào ngày 16 tháng 9 năm 2025, đây là một phiên bản cực kỳ quan trọng, mang tính cột mốc.

JDK 25 là LTS (Long-Term Support), tính đến đây, hiện có 5 phiên bản hỗ trợ dài hạn là JDK8, JDK11, JDK17, JDK21 và JDK 25.

JDK 25 có tổng cộng 18 tính năng mới, bài viết này sẽ chọn một số tính năng quan trọng để giới thiệu chi tiết:

- [JEP 506: Scoped Values (Giá trị có phạm vi)](https://openjdk.org/jeps/506)
- [JEP 512: Compact Source Files and Instance Main Methods (File nguồn compact và instance main method)](https://openjdk.org/jeps/512)
- [JEP 519: Compact Object Headers (Header object compact)](https://openjdk.org/jeps/519)
- [JEP 521: Generational Shenandoah (Shenandoah GC phân thế hệ)](https://openjdk.org/jeps/521)
- [JEP 507: Primitive Types in Patterns, instanceof, and switch (Pattern matching hỗ trợ kiểu nguyên thủy, preview lần 3)](https://openjdk.org/jeps/507)
- [JEP 505: Structured Concurrency (Concurrency có cấu trúc, preview lần 5)](https://openjdk.org/jeps/505)
- [JEP 511: Module Import Declarations (Khai báo import module)](https://openjdk.org/jeps/511)
- [JEP 513: Flexible Constructor Bodies (Constructor body linh hoạt)](https://openjdk.org/jeps/513)
- [JEP 508: Vector API (Vector API, incubator lần 10)](https://openjdk.org/jeps/508)

Hình dưới là số lượng tính năng mới và thời gian cập nhật của mỗi phiên bản từ JDK 8 đến JDK 25:

![](/images/github/javaguide/java/new-features/jdk8~jdk24.png)

## JDK 25

### JEP 506: Scoped Values (Giá trị có phạm vi)

Scoped Values có thể chia sẻ dữ liệu bất biến trong và giữa các threads, tốt hơn ThreadLocal, đặc biệt khi sử dụng nhiều virtual threads.

```java
final static ScopedValue<...> V = new ScopedValue<>();

// In some method
ScopedValue.where(V, <value>)
           .run(() -> { ... V.get() ... call methods ... });

// In a method called directly or indirectly from the lambda expression
... V.get() ...
```

Scoped Values đảm bảo sự cô lập và an toàn dữ liệu giữa các threads thông qua đặc tính "copy-on-write", đồng thời có hiệu suất cực cao và chiếm bộ nhớ rất thấp. Tính năng này sẽ trở thành thực hành chuẩn trong lập trình concurrency Java tương lai.

### JEP 512: Compact Source Files và Instance Main Methods

Tính năng này được preview lần đầu bởi [JEP 445](https://openjdk.org/jeps/445 "JEP 445") (JDK 21), sau đó được cải thiện và hoàn thiện qua JDK 22, JDK 23 và JDK 24, cuối cùng chính thức ổn định trong JDK 25.

Cải tiến này đơn giản hóa đáng kể các bước viết chương trình Java đơn giản, cho phép đặt class và main method trong cùng một file không có `public class` top-level, và cho phép method `main` trở thành một instance method không static.

```java
class HelloWorld {
    void main() {
        System.out.println("Hello, World!");
    }
}
```

Đơn giản hóa thêm:

```java
void main() {
    System.out.println("Hello, World!");
}
```

Đây là một bước tiến lớn nhằm giảm ngưỡng học Java và nâng cao hiệu quả viết các chương trình nhỏ, scripts. Người mới học không còn cần hiểu đoạn khai báo phức tạp `public static void main(String[] args)`. Đối với prototyping nhanh và viết scripts, điều này cũng khiến Java trở thành lựa chọn hấp dẫn hơn.

### JEP 519: Compact Object Headers

Tính năng này được preview lần đầu bởi [JEP 450](https://openjdk.org/jeps/450 "JEP 450") (JDK 24), JDK 25 chính thức ổn định.

Bằng cách tối ưu hóa cấu trúc nội tại của object header, trong HotSpot JVM kiến trúc 64-bit, kích thước object header được giảm từ 96-128 bits (12-16 bytes) xuống còn 64 bits (8 bytes), cuối cùng đạt được: giảm heap memory usage, tăng deployment density, tăng cường data locality.

Compact Object Headers không trở thành layout mặc định của object header trong JVM, cần được bật qua cấu hình tường minh:

- JDK 24 cần bật qua kết hợp command line params:
  `$ java -XX:+UnlockExperimentalVMOptions -XX:+UseCompactObjectHeaders ...`;
- Từ JDK 25 trở đi chỉ cần `-XX:+UseCompactObjectHeaders` là bật được.

### JEP 521: Generational Shenandoah GC

Shenandoah GC trở thành GC có thể dùng trong production trong JDK 12, mặc định tắt, bật bằng `-XX:+UseShenandoahGC`.

Đây là Pauseless GC implementation do Redhat phát triển, mục tiêu chính là 99.9% pausetime nhỏ hơn 10ms, pause không phụ thuộc kích thước heap...

Shenandoah truyền thống đánh dấu và compact toàn bộ heap đồng thời, mặc dù pause time rất ngắn nhưng không hiệu quả bằng generational GC khi xử lý young generation objects. Sau khi giới thiệu generational, Shenandoah có thể thu hồi hiệu quả hơn và thường xuyên hơn các objects "sống ngắn" trong young generation, giúp nó duy trì pause time cực thấp trong khi có throughput cao hơn và CPU overhead thấp hơn.

Shenandoah GC cần bật qua command:

- JDK 24 cần bật qua kết hợp command line params: `-XX:+UseShenandoahGC -XX:+UnlockExperimentalVMOptions -XX:ShenandoahGCMode=generational`
- Từ JDK 25 trở đi chỉ cần `-XX:+UseShenandoahGC -XX:ShenandoahGCMode=generational` là bật được.

### JEP 507: Pattern Matching hỗ trợ Primitive Types (Preview lần 3)

Tính năng này được preview lần đầu bởi [JEP 455](https://openjdk.org/jeps/455 "JEP 455") (JDK 23).

Pattern matching có thể xử lý tất cả các kiểu dữ liệu nguyên thủy (`int`, `double`, `boolean`...) trong các câu lệnh `switch` và `instanceof`.

```java
static void test(Object obj) {
    if (obj instanceof int i) {
        System.out.println("Đây là kiểu int: " + i);
    }
}
```

Như vậy có thể xử lý kiểu nguyên thủy an toàn và gọn gàng hơn tương tự như xử lý object types, tiếp tục loại bỏ boilerplate code trong Java.

### JEP 505: Structured Concurrency (Preview lần 5)

JDK 19 giới thiệu structured concurrency, một phương pháp lập trình multi-thread, mục đích đơn giản hóa lập trình multi-thread thông qua Structured Concurrency API, không phải để thay thế `java.util.concurrent`, hiện đang trong giai đoạn incubator.

Structured concurrency xử lý nhiều tasks chạy trong các threads khác nhau như một đơn vị công việc duy nhất, từ đó đơn giản hóa error handling, nâng cao độ tin cậy và tăng cường observability. Nghĩa là, structured concurrency duy trì tính đọc được, bảo trì được và observability của single-threaded code.

Basic API của structured concurrency là `StructuredTaskScope`, nó hỗ trợ chia task thành nhiều concurrent sub-tasks, thực hiện trong các threads riêng, và sub-tasks phải hoàn thành trước khi main task tiếp tục.

Cách dùng cơ bản của `StructuredTaskScope`:

```java
    try (var scope = new StructuredTaskScope<Object>()) {
        // Dùng fork method để spawn threads thực hiện sub-tasks
        Future<Integer> future1 = scope.fork(task1);
        Future<String> future2 = scope.fork(task2);
        // Chờ threads hoàn thành
        scope.join();
        // Xử lý kết quả có thể bao gồm xử lý hoặc re-throw exceptions
        ... process results/exceptions ...
    } // close
```

Structured concurrency rất phù hợp với virtual threads, virtual threads là lightweight threads được JDK implement. Nhiều virtual threads chia sẻ cùng một OS thread, cho phép rất nhiều virtual threads.

### JEP 511: Module Import Declarations

Tính năng này được preview lần đầu bởi [JEP 476](https://openjdk.org/jeps/476 "JEP 476") (JDK 23), sau đó được hoàn thiện trong [JEP 494](https://openjdk.org/jeps/494 "JEP 494") (JDK 24), JDK 25 chính thức ổn định.

Module import declarations cho phép import gọn gàng tất cả exported packages của toàn bộ module trong code Java, không cần khai báo import từng package. Tính năng này đơn giản hóa việc tái sử dụng thư viện modular, đặc biệt khi dùng nhiều modules, tránh được nhiều khai báo import packages, giúp developers truy cập third-party libraries và Java basic classes thuận tiện hơn.

Tính năng này đặc biệt hữu ích cho người mới học và prototype development, vì không cần developers modularize code của mình, đồng thời duy trì khả năng tương thích với cách import truyền thống, nâng cao hiệu quả phát triển và readability của code.

```java
// Import toàn bộ module java.base, developers có thể truy cập trực tiếp các class như List, Map, Stream mà không cần import thủ công từng package
import module java.base;

public class Example {
    public static void main(String[] args) {
        String[] fruits = { "apple", "berry", "citrus" };
        Map<String, String> fruitMap = Stream.of(fruits)
            .collect(Collectors.toMap(
                s -> s.toUpperCase().substring(0, 1),
                Function.identity()));

        System.out.println(fruitMap);
    }
}
```

### JEP 513: Flexible Constructor Bodies

Tính năng này được preview lần đầu bởi [JEP 447](https://openjdk.org/jeps/447 "JEP 447") (JDK 22), sau đó trải qua preview trong [JEP 482](https://openjdk.org/jeps/482 "JEP 482") (JDK 23) và [JEP 492](https://openjdk.org/jeps/492 "JEP 492") (JDK 24), JDK 25 chính thức ổn định.

Java yêu cầu trong constructor, lời gọi `super(...)` hoặc `this(...)` phải xuất hiện là câu lệnh đầu tiên. Điều này có nghĩa là không thể khởi tạo trực tiếp các fields trong subclass constructor trước khi gọi parent class constructor.

Flexible constructor bodies giải quyết vấn đề này, cho phép viết các câu lệnh trước khi gọi `super(..)` hoặc `this(..)` trong constructor body, các câu lệnh này có thể khởi tạo fields, nhưng không thể reference instance đang được constructed. Điều này ngăn chặn việc fields của subclass chưa được khởi tạo đúng khi parent class constructor gọi subclass methods, tăng cường độ tin cậy của class construction.

Tính năng này giải quyết vấn đề trước đây khi Java syntax hạn chế tổ chức code trong constructor, cho phép developers tự do hơn và tự nhiên hơn trong việc thể hiện hành vi của constructor, ví dụ như validation, chuẩn bị và chia sẻ parameters trực tiếp trong constructor mà không cần phụ thuộc vào các helper methods hoặc constructors, nâng cao readability và maintainability của code.

```java
class Person {
    private final String name;
    private int age;

    public Person(String name, int age) {
        if (age < 0) {
            throw new IllegalArgumentException("Age cannot be negative.");
        }
        this.name = name; // Khởi tạo field trước khi gọi parent constructor
        this.age = age;
        // ... other initialization
    }
}

class Employee extends Person {
    private final int employeeId;

    public Employee(String name, int age, int employeeId) {
        this.employeeId = employeeId; // Khởi tạo field trước khi gọi parent constructor
        super(name, age); // Gọi parent constructor
        // ... other initialization
    }
}
```

### JEP 508: Vector API (Incubator lần 10)

Vector computation gồm một loạt operations trên vectors. Vector API được dùng để biểu diễn vector computations, computation này có thể được compile tại runtime thành các vector instructions tối ưu trên CPU architecture được hỗ trợ, đạt hiệu suất vượt trội so với scalar computation tương đương.

Mục tiêu của Vector API là cung cấp cho users biểu diễn đa dạng vector computations một cách gọn gàng, dễ dùng và platform-independent.

Đây là scalar computation đơn giản trên array elements:

```java
void scalarComputation(float[] a, float[] b, float[] c) {
   for (int i = 0; i < a.length; i++) {
        c[i] = (a[i] * a[i] + b[i] * b[i]) * -1.0f;
   }
}
```

Đây là vector computation tương đương sử dụng Vector API:

```java
static final VectorSpecies<Float> SPECIES = FloatVector.SPECIES_PREFERRED;

void vectorComputation(float[] a, float[] b, float[] c) {
    int i = 0;
    int upperBound = SPECIES.loopBound(a.length);
    for (; i < upperBound; i += SPECIES.length()) {
        // FloatVector va, vb, vc;
        var va = FloatVector.fromArray(SPECIES, a, i);
        var vb = FloatVector.fromArray(SPECIES, b, i);
        var vc = va.mul(va)
                   .add(vb.mul(vb))
                   .neg();
        vc.intoArray(c, i);
    }
    for (; i < a.length; i++) {
        c[i] = (a[i] * a[i] + b[i] * b[i]) * -1.0f;
    }
}
```

Dù vẫn đang trong incubation, 10 lần iteration đủ để chứng minh tầm quan trọng của nó. Nó giúp Java có thể viết code có hiệu suất gần với thậm chí sánh ngang với các ngôn ngữ native như C++ trong các lĩnh vực nhạy cảm về performance như scientific computing, machine learning, big data processing. Đây là key để Java duy trì sức cạnh tranh trong lĩnh vực high-performance computing.
