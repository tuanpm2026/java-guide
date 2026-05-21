---
title: Tổng quan các tính năng mới trong Java 19
description: Giới thiệu các preview feature và cập nhật liên quan đến concurrency của JDK 19, đặt nền tảng cho virtual thread sau này.
category: Java
tag:
  - Java tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 19,JDK19,virtual thread preview,structured concurrency,foreign function API,JEP
---

JDK 19 phát hành chính thức ngày 20/9/2022 — phiên bản không hỗ trợ dài hạn.

JDK 19 có tổng cộng 7 tính năng mới. Bài này sẽ chọn giới thiệu chi tiết một số tính năng quan trọng hơn:

- [JEP 424: Foreign Function & Memory API](https://openjdk.org/jeps/424) (Preview)
- [JEP 425: Virtual Threads](https://openjdk.org/jeps/425) (Preview)
- [JEP 426: Vector API](https://openjdk.java.net/jeps/426) (Incubation lần 4)
- [JEP 428: Structured Concurrency](https://openjdk.org/jeps/428) (Incubation)

Hình dưới là số lượng tính năng mới và thời gian cập nhật từng phiên bản từ JDK 8 đến JDK 25:

![Số lượng tính năng mới và thời gian cập nhật mỗi phiên bản từ JDK 8 đến JDK 25](https://oss.javaguide.cn/github/javaguide/java/new-features/jdk8~jdk24.png)

## JEP 424: Foreign Function & Memory API (Preview)

Thông qua API này, Java program có thể tương tác với code và data bên ngoài Java runtime. Bằng cách gọi hiệu quả các foreign function (code bên ngoài JVM) và truy cập an toàn foreign memory (memory không do JVM quản lý), API này cho phép Java program gọi native library và xử lý native data mà không nguy hiểm và dễ vỡ như JNI.

Foreign Function & Memory API trải qua vòng incubation đầu tiên trong Java 17 qua [JEP 412](https://openjdk.java.net/jeps/412). Vòng incubation thứ hai qua [JEP 419](https://openjdk.org/jeps/419) được tích hợp vào Java 18, preview qua [JEP 424](https://openjdk.org/jeps/424) được tích hợp vào Java 19.

Trước khi có Foreign Function & Memory API:

- Java cung cấp một số method thực thi các thao tác low-level, không an toàn (như truy cập trực tiếp tài nguyên system memory, tự quản lý memory resource) qua [`sun.misc.Unsafe`](https://hg.openjdk.java.net/jdk/jdk/file/tip/src/jdk.unsupported/share/classes/sun/misc/Unsafe.java). Class `Unsafe` giúp Java có khả năng thao tác memory space như con trỏ C, nhưng cũng làm tăng tính không an toàn của Java — dùng sai `Unsafe` làm tăng khả năng program bị lỗi.
- Java 1.1 đã hỗ trợ native method call qua Java Native Interface (JNI), nhưng không dễ dùng. JNI triển khai quá phức tạp và nhiều bước (tham khảo: [Guide to JNI](https://www.baeldung.com/jni)), không được kiểm soát bởi language safety mechanism của JVM, ảnh hưởng đến tính cross-platform của Java. Hơn nữa, hiệu năng JNI cũng kém vì JNI method call không được hưởng lợi từ nhiều JIT optimization phổ biến (như inlining). Dù các framework như [JNA](https://github.com/java-native-access/jna), [JNR](https://github.com/jnr/jnr-ffi) và [JavaCPP](https://github.com/bytedeco/javacpp) đã cải tiến JNI, nhưng hiệu quả vẫn chưa lý tưởng.

Foreign Function & Memory API được giới thiệu để giải quyết một số pain point khi Java truy cập foreign function và foreign memory.

FFM API định nghĩa các class và interface:

- Cấp phát foreign memory: `MemorySegment`, `MemoryAddress` và `SegmentAllocator`
- Thao tác và truy cập structured foreign memory: `MemoryLayout`, `VarHandle`
- Kiểm soát cấp phát và giải phóng foreign memory: `MemorySession`
- Gọi foreign function: `Linker`, `FunctionDescriptor` và `SymbolLookup`

Dưới đây là ví dụ sử dụng FFM API — đoạn code lấy method handle của hàm `radixsort` trong C library, sau đó dùng nó để sort bốn string trong Java array.

```java
// 1. Tìm foreign function trên C library path
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();
MethodHandle radixSort = linker.downcallHandle(
                             stdlib.lookup("radixsort"), ...);
// 2. Cấp phát on-heap memory để lưu bốn string
String[] javaStrings   = { "mouse", "cat", "dog", "car" };
// 3. Cấp phát off-heap memory để lưu bốn pointer
SegmentAllocator allocator = implicitAllocator();
MemorySegment offHeap  = allocator.allocateArray(ValueLayout.ADDRESS, javaStrings.length);
// 4. Copy string từ heap lên off-heap
for (int i = 0; i < javaStrings.length; i++) {
    // Cấp phát string off-heap, sau đó lưu pointer trỏ đến nó
    MemorySegment cString = allocator.allocateUtf8String(javaStrings[i]);
    offHeap.setAtIndex(ValueLayout.ADDRESS, i, cString);
}
// 5. Sort off-heap data bằng cách gọi foreign function
radixSort.invoke(offHeap, javaStrings.length, MemoryAddress.NULL, '\0');
// 6. Copy string (đã reorder) từ off-heap vào heap
for (int i = 0; i < javaStrings.length; i++) {
    MemoryAddress cStringPtr = offHeap.getAtIndex(ValueLayout.ADDRESS, i);
    javaStrings[i] = cStringPtr.getUtf8String(0);
}
assert Arrays.equals(javaStrings, new String[] {"car", "cat", "dog", "mouse"});  // true
```

## JEP 425: Virtual Threads (Preview)

Virtual Thread là lightweight thread (LWP) được JDK chứ không phải OS triển khai. Nhiều virtual thread chia sẻ cùng một OS thread, số lượng virtual thread có thể lớn hơn nhiều so với OS thread.

Virtual thread đã được chứng minh là rất hữu ích trong các ngôn ngữ đa luồng khác như Goroutine trong Go, Process trong Erlang.

Virtual thread tránh được chi phí thêm của context switching, kết hợp ưu điểm của multi-threading, đơn giản hóa độ phức tạp của chương trình high concurrency, có thể giảm đáng kể workload khi viết, duy trì và quan sát high-throughput concurrent application.

Zhihu có một thảo luận về virtual thread trong Java 19, nếu quan tâm có thể xem: <https://www.zhihu.com/question/536743167>.

Để đọc hiểu và nguyên lý chi tiết về Java virtual thread, xem hai bài sau:

- [Nguyên lý virtual thread và phân tích hiệu năng | Dewu Tech](https://mp.weixin.qq.com/s/vdLXhZdWyxc6K-D3Aj03LA)
- [Java 19 GA chính thức! Xem virtual thread cải thiện throughput hệ thống như thế nào](https://mp.weixin.qq.com/s/yyApBXxpXxVwttr01Hld6Q)
- [Virtual Thread - VirtualThread Source Code Analysis](https://www.cnblogs.com/throwable/p/16758997.html)

## JEP 426: Vector API (Incubation lần 4)

Vector API ban đầu được đề xuất qua [JEP 338](https://openjdk.java.net/jeps/338), được tích hợp vào Java 16 như [incubation API](http://openjdk.java.net/jeps/11). Vòng incubation thứ hai qua [JEP 414](https://openjdk.java.net/jeps/414) được tích hợp vào Java 17, vòng ba qua [JEP 417](https://openjdk.java.net/jeps/417) được tích hợp vào Java 18, vòng bốn qua [JEP 426](https://openjdk.java.net/jeps/426) được tích hợp vào Java 19.

Trong [Tổng quan tính năng mới Java 18](./java18.md), tôi đã giới thiệu chi tiết về Vector API nên không nhắc lại ở đây.

## JEP 428: Structured Concurrency (Incubation)

JDK 19 giới thiệu Structured Concurrency — một phương pháp lập trình đa luồng nhằm đơn giản hóa multi-thread programming thông qua Structured Concurrency API. Không phải để thay thế `java.util.concurrent`, hiện đang ở giai đoạn incubator.

Structured Concurrency coi nhiều task chạy trong các thread khác nhau như một work unit duy nhất, từ đó đơn giản hóa error handling, tăng độ tin cậy và khả năng observable. Tức là Structured Concurrency giữ lại khả năng đọc, bảo trì và observable của single-thread code.

API cơ bản của Structured Concurrency là [`StructuredTaskScope`](https://download.java.net/java/early_access/loom/docs/api/jdk.incubator.concurrent/jdk/incubator/concurrent/StructuredTaskScope.html). `StructuredTaskScope` hỗ trợ chia task thành nhiều concurrent sub-task, thực thi trong thread riêng. Và các sub-task phải hoàn thành trước khi main task tiếp tục.

Cách dùng cơ bản của `StructuredTaskScope`:

```java
    try (var scope = new StructuredTaskScope<Object>()) {
        // Dùng method fork để fork thread thực thi sub-task
        Future<Integer> future1 = scope.fork(task1);
        Future<String> future2 = scope.fork(task2);
        // Chờ thread hoàn thành
        scope.join();
        // Xử lý kết quả có thể bao gồm xử lý hoặc re-throw exception
        ... process results/exceptions ...
    } // close
```

Structured Concurrency rất phù hợp với virtual thread — virtual thread là lightweight thread do JDK triển khai. Nhiều virtual thread chia sẻ cùng một OS thread, cho phép có rất nhiều virtual thread cùng lúc.

<!-- @include: @article-footer.snippet.md -->
