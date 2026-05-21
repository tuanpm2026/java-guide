---
title: Tổng quan các tính năng mới trong Java 9
description: Phân tích hệ thống module và jlink trong Java 9, hiểu ảnh hưởng đến runtime image và sử dụng library.
category: Java
tag:
  - Java tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 9,JDK9,modularization,JPMS,jlink,collection factory methods,new API
---

**Java 9** phát hành ngày 21/9/2017. Là phiên bản mới ra mắt sau Java 8 tận 3 năm rưỡi, Java 9 mang lại nhiều thay đổi lớn, quan trọng nhất là việc giới thiệu Java Platform Module System. Ngoài ra còn có các thay đổi như Collection, Stream flow, v.v.

JDK 9 không phải LTS (Long-Term Support). Tính đến nay, có 4 phiên bản LTS là JDK8, JDK11, JDK17, JDK21.

Bài này sẽ chọn giới thiệu chi tiết một số tính năng quan trọng hơn:

- [JEP 222: Java Shell Tool (JShell)](https://openjdk.org/jeps/222)
- [JEP 261: Module System](https://openjdk.org/jeps/261)
- [JEP 248: G1 Becomes the Default Garbage Collector](https://openjdk.org/jeps/248)
- [JEP 254: Compact Strings](https://openjdk.org/jeps/254)
- [JEP 193: Variable Handles](https://openjdk.org/jeps/193)

Hình dưới là số lượng tính năng mới và thời gian cập nhật từng phiên bản từ JDK 8 đến JDK 25:

![](/images/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 222: Java Shell Tool (JShell)

JShell là công cụ thực dụng mới được thêm vào Java 9. Cung cấp cho Java công cụ tương tác command line real-time tương tự Python.

Trong JShell có thể nhập trực tiếp expression và xem kết quả thực thi.

![](/images/java-guide-blog/image-20210816083417616.png)

**JShell mang lại những lợi ích gì?**

1. Giảm ngưỡng để viết dòng "Hello World!" đầu tiên bằng Java, giúp tăng nhiệt huyết học tập của người mới.
2. Với các logic đơn giản, verify các vấn đề nhỏ thì hiệu quả hơn IDE (không phải để thay thế IDE — với logic phức tạp IDE phù hợp hơn, hai cái bổ sung cho nhau).
3. ……

**Code trong JShell và code có thể compile thông thường khác nhau như thế nào?**

1. Khi statement nhập xong, JShell trả về kết quả thực thi ngay lập tức mà không cần editor, compiler, interpreter nữa.
2. JShell hỗ trợ khai báo lại variable — khai báo sau sẽ ghi đè khai báo trước.
3. JShell hỗ trợ expression độc lập như phép cộng thông thường `1 + 1`.
4. ……

## JEP 261: Module System (Hệ thống module)

Module system là một phần của [Jigsaw Project](https://openjdk.java.net/projects/jigsaw/), đưa modular development practice vào Java platform — giúp code tái sử dụng tốt hơn!

**Module system là gì?** Định nghĩa chính thức:

> A uniquely named, reusable group of related packages, as well as resources (such as images and XML files) and a module descriptor.

Nói đơn giản, có thể coi một module là nhóm package, resource và module descriptor file (`module-info.java`) được đặt tên duy nhất và có thể tái sử dụng.

Bất kỳ jar file nào, chỉ cần thêm module descriptor file (`module-info.java`) là có thể nâng cấp thành module.

![](/images/java-guide-blog/module-structure.png)

Sau khi giới thiệu module system, JDK được tổ chức lại thành 94 module. Ứng dụng Java có thể dùng công cụ **[jlink](http://openjdk.java.net/jeps/282) mới** (jlink là command line tool mới phát hành cùng Java 9, cho phép developer tạo JRE tùy chỉnh nhẹ cho ứng dụng Java dựa trên module), tạo custom runtime image chỉ chứa các JDK module mà ứng dụng phụ thuộc vào. Điều này giúp giảm đáng kể kích thước Java runtime.

Có thể dùng keyword `exports` để kiểm soát chính xác class nào có thể public sử dụng, class nào chỉ dùng nội bộ.

```java
module my.module {
    // exports công khai tất cả public member trong package được chỉ định
    exports com.my.package.name;
}

module my.module {
     // exports…to giới hạn phạm vi truy cập member
    exports com.my.package.name to com.specific.package;
}
```

Để tìm hiểu sâu về Java 9 modularization, tham khảo các bài sau:

- [《Project Jigsaw: Module System Quick-Start Guide》](https://openjdk.java.net/projects/jigsaw/quick-start)
- [《Java 9 Modules: part 1》](https://stacktraceguru.com/java9/module-introduction)
- [Bí ẩn Java 9 (2. Hệ thống module)](http://www.cnblogs.com/IcanFixIt/p/6947763.html)

## JEP 248: G1 Becomes the Default Garbage Collector

Trong Java 8, garbage collector mặc định là Parallel Scavenge (young generation) + Parallel Old (old generation). Đến Java 9, CMS garbage collector bị deprecated. **G1 (Garbage-First Garbage Collector)** trở thành garbage collector mặc định.

G1 được giới thiệu từ Java 7 — sau hai phiên bản hoạt động xuất sắc đã trở thành garbage collector mặc định.

## JEP 193: Variable Handles (Variable Handle)

Variable handle là reference đến một variable hoặc một nhóm variable, bao gồm static field, non-static field, array element và các thành phần trong cấu trúc dữ liệu off-heap, v.v.

Ý nghĩa của variable handle tương tự method handle `MethodHandle` đã có, được biểu thị bởi Java class `java.lang.invoke.VarHandle`. Có thể dùng static factory method trong class `java.lang.invoke.MethodHandles.Lookup` để tạo `VarHandle` object.

Sự xuất hiện của `VarHandle` thay thế một phần thao tác của `java.util.concurrent.atomic` và `sun.misc.Unsafe`. Và cung cấp một loạt memory barrier operation tiêu chuẩn để kiểm soát memory ordering với granularity nhỏ hơn. Vượt trội hơn API hiện có về an toàn, khả năng sử dụng và hiệu năng.

## Cải tiến API

Không phải tất cả thay đổi API đều được phát hành qua JEP (Java Enhancement Proposal).

Trong development flow của JDK: **JEP** thường dùng cho các thay đổi lớn như giới thiệu language feature mới, JVM mechanism mới, hay tái cấu trúc library quy mô lớn. Các thao tác như thêm vài factory method vào class hiện có (như `List.of()`) thường được coi là library maintenance thông thường — được submit và review trực tiếp qua ticket của **JBS (JDK Bug System)**, sau đó phát hành trực tiếp theo version.

### Cải tiến Collection

Bổ sung các factory method như `List.of()`, `Set.of()`, `Map.of()` và `Map.ofEntries()` để tạo immutable collection (hơi học hỏi Guava):

```java
List.of("Java", "C++");
Set.of("Java", "C++");
Map.of("Java", 1, "C++", 2);
```

Collection tạo bằng `of()` là immutable collection, không thể thêm, xóa, thay thế, sắp xếp, v.v. Ngược lại sẽ throw `java.lang.UnsupportedOperationException`.

### Cải tiến Stream

`Stream` bổ sung các method mới `ofNullable()`, `dropWhile()`, `takeWhile()` và overload method của `iterate()`.

Method `ofNullable()` trong Java 9 cho phép tạo single-element `Stream` có thể chứa một non-null element, hoặc tạo empty `Stream`. Trong Java 8 không thể tạo empty `Stream`.

```java
Stream<String> stringStream = Stream.ofNullable("Java");
System.out.println(stringStream.count()); // 1
Stream<String> nullStream = Stream.ofNullable(null);
System.out.println(nullStream.count()); // 0
```

Method `takeWhile()` lấy các element thỏa điều kiện từ `Stream` theo thứ tự, cho đến khi gặp element không thỏa thì dừng.

```java
List<Integer> integerList = List.of(11, 33, 66, 8, 9, 13);
integerList.stream().takeWhile(x -> x < 50).forEach(System.out::println); // 11 33
```

Method `dropWhile()` có hiệu quả ngược lại với `takeWhile()`.

```java
List<Integer> integerList2 = List.of(11, 33, 66, 8, 9, 13);
integerList2.stream().dropWhile(x -> x < 50).forEach(System.out::println); // 66 8 9 13
```

Overload method mới của `iterate()` cung cấp tham số `Predicate` (điều kiện) để quyết định khi nào dừng iteration.

```java
public static<T> Stream<T> iterate(final T seed, final UnaryOperator<T> f) {
}
// Overload method mới được thêm
public static<T> Stream<T> iterate(T seed, Predicate<? super T> hasNext, UnaryOperator<T> next) {
}
```

So sánh sử dụng hai cách, overload method `iterate()` mới linh hoạt hơn:

```java
// Dùng iterate() gốc để in số 1~10
Stream.iterate(1, i -> i + 1).limit(10).forEach(System.out::println);
// Dùng overload iterate() mới để in số 1~10
Stream.iterate(1, i -> i <= 10, i -> i + 1).forEach(System.out::println);
```

### Cải tiến Optional

`Optional` bổ sung các method `ifPresentOrElse()`, `or()` và `stream()`.

Method `ifPresentOrElse()` nhận hai tham số `Consumer` và `Runnable`. Nếu `Optional` không rỗng thì gọi tham số `Consumer`, rỗng thì gọi tham số `Runnable`.

```java
public void ifPresentOrElse(Consumer<? super T> action, Runnable emptyAction)

Optional<Object> objectOptional = Optional.empty();
objectOptional.ifPresentOrElse(System.out::println, () -> System.out.println("Empty!!!")); // Empty!!!
```

Method `or()` nhận tham số `Supplier`. Nếu `Optional` rỗng thì trả về giá trị `Optional` do tham số `Supplier` chỉ định.

```java
public Optional<T> or(Supplier<? extends Optional<? extends T>> supplier)

Optional<Object> objectOptional = Optional.empty();
objectOptional.or(() -> Optional.of("java")).ifPresent(System.out::println); // java
```

### Cải tiến String

Trong Java 8 trở về trước, `String` luôn được lưu bằng `char[]`. Từ Java 9, implementation của `String` chuyển sang dùng `byte[]` array để lưu string — tiết kiệm không gian.

```java
public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    // @Stable annotation cho biết variable được modify tối đa một lần — gọi là "stable"
    @Stable
    private final byte[] value;
}
```

### Cải tiến Interface

Java 9 cho phép dùng private method trong interface. Như vậy việc sử dụng interface linh hoạt hơn, hơi giống abstract class phiên bản đơn giản.

```java
public interface MyInterface {
    private void methodPrivate(){
    }
}
```

### Cải tiến IO

Trước Java 9, chỉ có thể khai báo variable trong block `try-with-resources`:

```java
try (Scanner scanner = new Scanner(new File("testRead.txt"));
    PrintWriter writer = new PrintWriter(new File("testWrite.txt"))) {
    // omitted
}
```

Từ Java 9, có thể dùng effectively-final variable trong `try-with-resources`.

```java
final Scanner scanner = new Scanner(new File("testRead.txt"));
PrintWriter writer = new PrintWriter(new File("testWrite.txt"));
try (scanner; writer) {
    // omitted
}
```

**Effectively-final variable là gì?** Nói đơn giản là variable không được modify bởi `final` nhưng giá trị không thay đổi sau khi khởi tạo.

Như code trên minh họa, dù `writer` không được khai báo tường minh là `final`, nhưng sau khi được gán lần đầu thì không thay đổi nữa, nên nó là effectively-final variable.

### Process API

Java 9 bổ sung interface `java.lang.ProcessHandle` để quản lý native process — đặc biệt phù hợp với việc quản lý các long-running process.

```java
// Lấy JVM process đang chạy hiện tại
ProcessHandle currentProcess = ProcessHandle.current();
// In process ID
System.out.println(currentProcess.pid());
// In thông tin process
System.out.println(currentProcess.info());
```

Tổng quan interface `ProcessHandle`:

![](/images/java-guide-blog/image-20210816104614414.png)

### Các cải tiến API khác

**Reactive Streams**

Trong class `java.util.concurrent.Flow` của Java 9 bổ sung các core interface của Reactive Streams specification.

`Flow` bao gồm 4 core interface: `Flow.Publisher`, `Flow.Subscriber`, `Flow.Subscription` và `Flow.Processor`. Java 9 cũng cung cấp `SubmissionPublisher` như một implementation của `Flow.Publisher`.

Để đọc chi tiết hơn về Java 9 Reactive Streams, khuyến nghị đọc bài [Java 9 Secrets (17. Reactive Streams) - Lin Ben Tuo](https://www.cnblogs.com/IcanFixIt/p/7245377.html).

## Khác

- **Platform logging API improvements**: Java 9 cho phép cấu hình cùng logging implementation cho JDK và ứng dụng. Bổ sung `System.LoggerFinder` để quản lý logger implementation mà JDK dùng. JVM chỉ có một instance `LoggerFinder` toàn hệ thống lúc runtime. Có thể thêm implementation `System.LoggerFinder` của riêng mình để JDK và ứng dụng dùng SLF4J hay logging framework khác.
- **Cải tiến class `CompletableFuture`**: Bổ sung thêm một số method mới (`completeAsync`, `orTimeout`, v.v.).
- **Cải tiến Nashorn engine**: Nashorn là JavaScript engine được giới thiệu từ Java 8. Java 9 cải tiến Nashorn, triển khai một số tính năng mới của ES6 (đã bị deprecated trong Java 11).
- **Tính năng mới của I/O Stream**: Bổ sung method mới để đọc và copy dữ liệu trong `InputStream`.
- **Cải thiện bảo mật ứng dụng**: Java 9 bổ sung 4 thuật toán hash SHA-3: SHA3-224, SHA3-256, SHA3-384 và SHA3-512.
- **Cải tiến Method Handle**: Method handle được giới thiệu từ Java 7. Java 9 bổ sung nhiều static method hơn trong class `java.lang.invoke.MethodHandles` để tạo các loại method handle khác nhau.
- ……

## Tài liệu tham khảo

- Java version history: <https://en.wikipedia.org/wiki/Java_version_history>
- Release Notes for JDK 9 and JDK 9 Update Releases: <https://www.oracle.com/java/technologies/javase/9-all-relnotes.html>
- 《Phân tích sâu tính năng mới Java》 - GeekTime - JShell: Làm thế nào verify nhanh các vấn đề nhỏ?
- New Features in Java 9: <https://www.baeldung.com/new-java-9>
- Java – Try with Resources: <https://www.baeldung.com/java-try-with-resources>

<!-- @include: @article-footer.snippet.md -->
