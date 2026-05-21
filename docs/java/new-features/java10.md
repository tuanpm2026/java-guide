---
title: Tổng quan các tính năng mới trong Java 10
description: Tổng quan các cập nhật chính của JDK 10, trọng tâm giới thiệu var type inference và các cải tiến platform khác.
category: Java
tag:
  - Java tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 10,JDK10,var local variable type inference,garbage collection improvements,performance
---

**Java 10** phát hành ngày 20/3/2018. Đây là phiên bản non-LTS (không hỗ trợ dài hạn), Oracle chỉ hỗ trợ 6 tháng.

Hình dưới là số lượng tính năng mới và thời gian cập nhật từng phiên bản từ JDK 8 đến JDK 25:

![Số lượng tính năng mới và thời gian cập nhật mỗi phiên bản từ JDK 8 đến JDK 25](/images/github/javaguide/java/new-features/jdk8~jdk24.png)

Bài này sẽ chọn giới thiệu chi tiết một số tính năng quan trọng hơn:

- [JEP 286: Local-Variable Type Inference (Suy luận kiểu biến cục bộ)](https://openjdk.org/jeps/286)
- [JEP 304: Garbage-Collector Interface (Interface garbage collector)](https://openjdk.org/jeps/304)
- [JEP 307: Parallel Full GC for G1 (G1 Parallel Full GC)](https://openjdk.org/jeps/307)
- [JEP 310: Application Class-Data Sharing (Chia sẻ class data ứng dụng)](https://openjdk.org/jeps/310)
- [JEP 317: Experimental Java-Based JIT Compiler (JIT compiler thực nghiệm dựa trên Java)](https://openjdk.org/jeps/317)

## JEP 286: Local-Variable Type Inference

Vì quá nhiều Java developer mong muốn Java đưa vào local variable type inference, Java 10 đã đáp ứng — đúng như kỳ vọng!

Java 10 cung cấp keyword `var` để khai báo biến cục bộ.

```java
var id = 0;
var codefx = new URL("https://mp.weixin.qq.com/");
var list = new ArrayList<>();
var list = List.of(1, 2, 3);
var map = new HashMap<String, String>();
var p = Paths.of("src/test/java/Java9FeaturesTest.java");
var numbers = List.of("a", "b", "c");
for (var n : numbers)
    System.out.print(n+ " ");
```

Keyword `var` chỉ có thể dùng cho biến cục bộ có constructor và vòng lặp for.

```java
var count = null; //❌ Compile lỗi, không thể khai báo là null
var r = () -> Math.random();//❌ Compile lỗi, không thể khai báo là Lambda expression
var array = {1, 2, 3};//❌ Compile lỗi, không thể khai báo array
```

`var` không thay đổi thực tế Java là ngôn ngữ statically typed — compiler chịu trách nhiệm suy luận kiểu.

Ngoài ra, Scala và Kotlin đã có keyword `val` (tổ hợp keyword `final var`).

## JEP 304: Garbage-Collector Interface

Trong cấu trúc JDK trước đây, các component tạo nên triển khai garbage collector (GC) phân tán khắp nơi trong codebase. Java 10 giới thiệu một bộ garbage collector interface thuần túy để tách biệt source code của các garbage collector khác nhau.

## JEP 307: Parallel Full GC for G1

Từ Java 9, G1 đã trở thành garbage collector mặc định. G1 được thiết kế như garbage collector độ trễ thấp, nhằm tránh thực hiện Full GC. Nhưng Full GC của G1 trong Java 9 vẫn dùng single thread để hoàn thành mark-sweep algorithm, có thể khiến garbage collector trigger Full GC khi không thể thu hồi memory.

Để giảm tối đa ảnh hưởng của application pause do Full GC, từ Java 10, Full GC của G1 chuyển sang parallel mark-sweep algorithm, đồng thời dùng cùng số lượng parallel worker thread với young generation và mixed collection, giúp giảm tần suất Full GC để đạt hiệu năng tốt hơn và throughput lớn hơn.

## JEP 310: Application Class-Data Sharing (Mở rộng CDS)

Java 5 đã giới thiệu cơ chế Class Data Sharing (CDS), cho phép pre-process một nhóm class thành shared archive file, để memory mapping lúc runtime giúp giảm startup time của Java program. Khi nhiều JVM chia sẻ cùng archive file, có thể giảm dynamic memory usage, đồng thời giảm resource consumption khi nhiều VM chạy trên cùng máy vật lý hay ảo. CDS lúc đó vẫn là commercial feature của Oracle JDK.

Java 10 mở rộng thêm dựa trên chức năng CDS hiện có, cho phép đặt application class vào shared archive. CDS feature mở rộng thêm Application Class-Data Sharing (AppCDS) hỗ trợ cho application class trên nền tảng bootstrap class trước đó, mở rộng đáng kể phạm vi áp dụng của CDS. Nguyên lý: Ghi lại quá trình load class khi khởi động vào text file, lần khởi động tiếp theo đọc trực tiếp text file khởi động này và load. Nếu môi trường ứng dụng không thay đổi nhiều, tốc độ khởi động sẽ được cải thiện.

## JEP 317: Experimental Java-Based JIT Compiler

Graal là JIT compiler viết bằng Java, là nền tảng của experimental Ahead-of-Time (AOT) compiler được giới thiệu trong JDK 9.

HotSpot VM của Oracle đi kèm hai JIT compiler triển khai bằng C++: C1 và C2. Trong Java 10 (Linux/x64, macOS/x64), HotSpot mặc định vẫn dùng C2, nhưng thêm tham số `-XX:+UnlockExperimentalVMOptions -XX:+UseJVMCICompiler` vào lệnh java có thể thay C2 bằng Graal.

## Cải tiến API

Không phải tất cả thay đổi API đều được phát hành qua JEP (Java Enhancement Proposal).

Trong development flow của JDK: **JEP** thường dùng cho các thay đổi lớn như giới thiệu language feature mới (như `var`), JVM mechanism mới (như ZGC), hay tái cấu trúc library quy mô lớn. Các thao tác như thêm vài static method vào class hiện có (như `List.copyOf()`) thường được coi là library maintenance thông thường. Chúng được developer JDK submit và review trực tiếp qua ticket của **JBS (JDK Bug System)**, sau đó phát hành trực tiếp theo version.

### Cải tiến Collection

`List`, `Set`, `Map` cung cấp static method `copyOf()` trả về immutable copy của collection đầu vào.

```java
static <E> List<E> copyOf(Collection<? extends E> coll) {
    return ImmutableCollections.listCopy(coll);
}
```

Collection tạo bằng `copyOf()` là immutable collection, không thể thêm, xóa, thay thế, sắp xếp, v.v. Ngược lại sẽ throw exception `java.lang.UnsupportedOperationException`. IDEA cũng sẽ có cảnh báo tương ứng.

![Collection tạo bằng `copyOf()` là immutable](/images/java-guide-blog/image-20210816154125579.png)

Ngoài ra, `java.util.stream.Collectors` bổ sung static method để collect các element trong stream thành immutable collection.

```java
var list = new ArrayList<>();
list.stream().collect(Collectors.toUnmodifiableList());
list.stream().collect(Collectors.toUnmodifiableSet());
```

### Cải tiến Optional

`Optional` bổ sung method `orElseThrow()` không có tham số, là phiên bản đơn giản của `orElseThrow(Supplier<? extends X> exceptionSupplier)` có tham số. Khi không có value, mặc định throw NoSuchElementException.

```java
Optional<String> optional = Optional.empty();
String result = optional.orElseThrow();
```

## Khác

- **Thread-local handshake**: Java 10 giới thiệu khái niệm JVM safepoint vào thread control, cho phép thực hiện thread callback mà không cần chạy global JVM safepoint. Thực thi bởi thread bản thân hoặc JVM thread, đồng thời giữ thread ở trạng thái block. Cách này giúp dừng một thread riêng lẻ thành khả thi, thay vì chỉ có thể bật/tắt tất cả thread.
- **Heap allocation on alternative memory devices**: Java 10 sẽ cho phép JVM dùng heap phù hợp với các cơ chế lưu trữ khác nhau, thực hiện heap memory allocation trên các memory device tùy chọn.
- ……

## Tài liệu tham khảo

- Java 10 Features and Enhancements: <https://howtodoinjava.com/java10/java10-features/>
- Guide to Java10: <https://www.baeldung.com/java-10-overview>
- 4 Class Data Sharing: <https://docs.oracle.com/javase/10/vm/class-data-sharing.htm#JSJVM-GUID-7EAA3411-8CF0-4D19-BD05-DF5E1780AA91>

<!-- @include: @article-footer.snippet.md -->
