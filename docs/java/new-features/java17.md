---
title: Tổng quan các tính năng mới trong Java 17 (Quan trọng)
description: Tổng kết các cập nhật và JEP quan trọng của JDK 17, bao gồm sealed class, record class và pattern matching.
category: Java
tag:
  - Java tính năng mới
head:
  - - meta
    - name: keywords
      content: Java 17,JDK17,LTS,sealed class,record class,pattern matching,API update,JEP
---

Java 17 phát hành chính thức ngày 14/9/2021 — là phiên bản LTS (Long-Term Support).

Hình dưới là timeline hỗ trợ Oracle JDK chính thức từ Oracle. Có thể thấy Java 17 hỗ trợ tối đa đến tháng 9/2029.

![](/images/github/javaguide/java/new-features/4c1611fad59449edbbd6e233690e9fa7.png)

Java 17 sẽ là phiên bản LTS quan trọng nhất kể từ Java 8 — là thành quả 8 năm nỗ lực của cộng đồng Java. Spring 6.x và Spring Boot 3.x hỗ trợ tối thiểu là Java 17.

JDK 17 có tổng cộng 14 tính năng mới. Bài này sẽ chọn giới thiệu chi tiết một số tính năng quan trọng hơn:

- [JEP 356: Enhanced Pseudo-Random Number Generators](https://openjdk.java.net/jeps/356)
- [JEP 398: Deprecate the Applet API for Removal](https://openjdk.java.net/jeps/398)
- [JEP 406: Pattern Matching for switch (Preview)](https://openjdk.java.net/jeps/406)
- [JEP 407: Remove RMI Activation](https://openjdk.java.net/jeps/407)
- [JEP 409: Sealed Classes (Chính thức)](https://openjdk.java.net/jeps/409)
- [JEP 410: Remove the Experimental AOT and JIT Compiler](https://openjdk.java.net/jeps/410)
- [JEP 411: Deprecate the Security Manager for Removal](https://openjdk.java.net/jeps/411)
- [JEP 412: Foreign Function & Memory API (Incubator)](https://openjdk.java.net/jeps/412)
- [JEP 414: Vector API (Second Incubator)](https://openjdk.java.net/jeps/414)

Hình dưới là số lượng tính năng mới và thời gian cập nhật từng phiên bản từ JDK 8 đến JDK 16:

![](/images/github/javaguide/java/new-features/jdk8~jdk24.png)

Đọc thêm: [OpenJDK Java 17 Documentation](https://openjdk.java.net/projects/jdk/17/).

## JEP 356: Enhanced Pseudo-Random Number Generators

Trước JDK 17, có thể dùng `Random`, `ThreadLocalRandom` và `SplittableRandom` để sinh số ngẫu nhiên. Tuy nhiên cả 3 class này đều có nhược điểm riêng và thiếu hỗ trợ các thuật toán pseudo-random phổ biến.

Java 17 bổ sung các interface type và implementation mới cho pseudo-random number generator (PRNG, còn gọi là deterministic random bit generator), giúp developer dễ dàng hơn khi hoán đổi qua lại giữa các PRNG algorithm trong ứng dụng.

> [PRNG](https://ctf-wiki.org/crypto/streamcipher/prng/intro/) dùng để sinh ra sequence số gần với sequence số ngẫu nhiên tuyệt đối. Thông thường PRNG phụ thuộc vào một giá trị khởi đầu gọi là seed để sinh sequence pseudo-random tương ứng. Chỉ cần seed được xác định, sequence random do PRNG sinh ra là hoàn toàn xác định, nên sequence nó tạo ra không phải random thực sự.

Ví dụ sử dụng:

```java
RandomGeneratorFactory<RandomGenerator> l128X256MixRandom = RandomGeneratorFactory.of("L128X256MixRandom");
// Dùng timestamp làm random seed
RandomGenerator randomGenerator = l128X256MixRandom.create(System.currentTimeMillis());
// Sinh số ngẫu nhiên
randomGenerator.nextInt(10);
```

## JEP 398: Deprecate the Applet API for Removal

Applet API dùng để viết Java applet chạy trong Web browser, đã bị loại bỏ từ nhiều năm trước và không còn lý do gì để dùng nữa.

Applet API đã bị đánh dấu deprecated trong Java 9 ([JEP 289](https://openjdk.java.net/jeps/289)), nhưng không phải để xóa.

## JEP 406: Pattern Matching for switch (Preview)

Giống như `instanceof`, `switch` cũng bổ sung tính năng type matching tự động.

Ví dụ code `instanceof`:

```java
// Code cũ
if (o instanceof String) {
    String s = (String)o;
    ... use s ...
}

// Code mới
if (o instanceof String s) {
    ... use s ...
}
```

Ví dụ code `switch`:

```java
// Code cũ
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

// Code mới
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

Kiểm tra giá trị `null` cũng được tối ưu:

```java
// Code cũ
static void testFooBar(String s) {
    if (s == null) {
        System.out.println("oops!");
        return;
    }
    switch (s) {
        case "Foo", "Bar" -> System.out.println("Great");
        default           -> System.out.println("Ok");
    }
}

// Code mới
static void testFooBar(String s) {
    switch (s) {
        case null         -> System.out.println("Oops");
        case "Foo", "Bar" -> System.out.println("Great");
        default           -> System.out.println("Ok");
    }
}
```

## JEP 407: Remove RMI Activation

Xóa cơ chế activation của Remote Method Invocation (RMI), giữ lại phần còn lại của RMI. Cơ chế RMI activation đã lỗi thời và không còn được dùng.

## JEP 409: Sealed Classes (Chính thức)

Sealed class được đề xuất preview qua [JEP 360](https://openjdk.java.net/jeps/360), được tích hợp vào Java 15. Trong JDK 16, sealed class được cải tiến (kiểm tra reference nghiêm ngặt hơn và quan hệ kế thừa của sealed class), và được đề xuất preview lần nữa qua [JEP 397](https://openjdk.java.net/jeps/397).

Trong [Tổng quan tính năng mới Java 14 & 15](./java14-15.md), tôi đã giới thiệu chi tiết về sealed class nên không nhắc lại ở đây.

## JEP 410: Remove the Experimental AOT and JIT Compiler

Trong Java 9 qua [JEP 295](https://openjdk.java.net/jeps/295), đã giới thiệu experimental Ahead-of-Time (AOT) compiler để compile Java class thành native code trước khi JVM khởi động.

Java 17 xóa experimental AOT và JIT compiler vì chúng hiếm khi được dùng kể từ khi ra mắt và việc duy trì chúng đòi hỏi nhiều công sức. Giữ lại experimental Java-level JVM Compiler Interface (JVMCI) để developer vẫn có thể dùng external build version compiler để JIT compilation.

## JEP 411: Deprecate the Security Manager for Removal

Deprecated Security Manager để xóa trong phiên bản tương lai.

Security Manager có từ Java 1.0. Nhiều năm qua, nó không phải phương pháp chính để bảo vệ client-side Java code, cũng hiếm khi được dùng để bảo vệ server-side code. Để thúc đẩy Java tiến lên phía trước, Java 17 deprecated Security Manager để xóa cùng với Applet API cũ ([JEP 398](https://openjdk.java.net/jeps/398)).

## JEP 412: Foreign Function & Memory API (Incubation)

Java program có thể tương tác với code và data bên ngoài Java runtime thông qua API này. Bằng cách gọi hiệu quả foreign function (code bên ngoài JVM) và truy cập an toàn foreign memory (memory không do JVM quản lý), API này cho phép Java program gọi native library và xử lý native data mà không nguy hiểm và dễ vỡ như JNI.

Foreign Function & Memory API trải qua vòng incubation đầu tiên trong Java 17 qua [JEP 412](https://openjdk.java.net/jeps/412). Vòng incubation thứ hai qua [JEP 419](https://openjdk.org/jeps/419) được tích hợp vào Java 18, preview qua [JEP 424](https://openjdk.org/jeps/424) được tích hợp vào Java 19.

Trong [Tổng quan tính năng mới Java 19](./java19.md), tôi đã giới thiệu chi tiết về Foreign Function & Memory API nên không nhắc lại ở đây.

## JEP 414: Vector API (Incubation lần 2)

Vector API ban đầu được đề xuất qua [JEP 338](https://openjdk.java.net/jeps/338), được tích hợp vào Java 16 như [incubation API](http://openjdk.java.net/jeps/11). Vòng incubation thứ hai qua [JEP 414](https://openjdk.java.net/jeps/414) được tích hợp vào Java 17, vòng ba qua [JEP 417](https://openjdk.java.net/jeps/417) được tích hợp vào Java 18, vòng bốn qua [JEP 426](https://openjdk.java.net/jeps/426) được tích hợp vào Java 19.

Incubator API này cung cấp initial iteration của API để biểu đạt một số vector computation. Các computation này có thể được compile đáng tin cậy tại runtime thành optimal vector hardware instruction trên CPU architecture được hỗ trợ — đạt hiệu năng vượt trội so với scalar computation tương đương, tận dụng đầy đủ kỹ thuật SIMD (Single Instruction Multiple Data — instruction có thể dùng trên hầu hết CPU hiện đại). Dù HotSpot hỗ trợ auto-vectorization, nhưng tập scalar operation có thể convert còn hạn chế và dễ bị ảnh hưởng bởi code changes. API này sẽ cho phép developer dễ dàng viết portable high-performance vector algorithm bằng Java.

Trong [Tổng quan tính năng mới Java 18](./java18.md), tôi đã giới thiệu chi tiết về Vector API nên không nhắc lại ở đây.

<!-- @include: @article-footer.snippet.md -->
